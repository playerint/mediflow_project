"""LINE 자동상담 봇 라우터 — 실제 LINE 웹훅 + RAG 기반 답변"""
from fastapi import APIRouter, Request, HTTPException, Depends
from linebot.v3 import WebhookHandler
from linebot.v3.messaging import (
    ApiClient, Configuration, MessagingApi,
    ReplyMessageRequest, TextMessage,
)
from linebot.v3.webhooks import MessageEvent, TextMessageContent
from linebot.v3.exceptions import InvalidSignatureError
from sqlalchemy.orm import Session

from app.models.schemas import LineBotRequest, LineBotResponse
from app.db.vector_db import get_db
from app.services import rag_service
from app.config import settings

router = APIRouter(prefix="/line-bot", tags=["LINE 봇"])

_MIN_DOCS_FOR_AUTO_REPLY = 1

# LINE SDK 초기화 (키가 없으면 None — 개발 환경 대비)
_handler: WebhookHandler | None = None
_messaging_api: MessagingApi | None = None


def _build_channel_mapping() -> dict[str, int]:
    """환경변수 LINE_HOSPITAL_MAPPING을 파싱해 {채널ID: hospital_id} dict를 반환한다.

    형식 예시: LINE_HOSPITAL_MAPPING=2010356259:1,9999999:2
    파싱 실패한 항목은 조용히 건너뛴다.
    """
    raw = settings.line_hospital_mapping.strip()
    mapping: dict[str, int] = {}
    if not raw:
        return mapping
    for pair in raw.split(","):
        pair = pair.strip()
        if ":" not in pair:
            continue
        channel_id, _, hospital_id_str = pair.partition(":")
        channel_id = channel_id.strip()
        hospital_id_str = hospital_id_str.strip()
        if channel_id and hospital_id_str.isdigit():
            mapping[channel_id] = int(hospital_id_str)
    return mapping


# 서버 시작 시 한 번만 파싱 (런타임 중 .env 변경은 반영 안 됨 — 재시작 필요)
_CHANNEL_HOSPITAL_MAP: dict[str, int] = _build_channel_mapping()

_FALLBACK_HOSPITAL_ID = 1


def _resolve_hospital_id(destination: str) -> int:
    """웹훅 payload의 destination(채널 식별자)으로 hospital_id를 반환한다.

    매핑에 없으면 _FALLBACK_HOSPITAL_ID(=1)를 반환한다.
    """
    return _CHANNEL_HOSPITAL_MAP.get(destination, _FALLBACK_HOSPITAL_ID)

def _get_handler() -> WebhookHandler:
    global _handler
    if _handler is None:
        if not settings.line_channel_secret:
            raise HTTPException(status_code=503, detail="LINE_CHANNEL_SECRET 미설정")
        _handler = WebhookHandler(settings.line_channel_secret)
    return _handler

def _get_messaging_api() -> MessagingApi:
    global _messaging_api
    if _messaging_api is None:
        if not settings.line_channel_access_token:
            raise HTTPException(status_code=503, detail="LINE_CHANNEL_ACCESS_TOKEN 미설정")
        config = Configuration(access_token=settings.line_channel_access_token)
        _messaging_api = MessagingApi(ApiClient(config))
    return _messaging_api


@router.post("/webhook")
async def line_webhook(request: Request, db: Session = Depends(get_db)):
    """LINE 플랫폼에서 오는 실제 웹훅을 처리한다."""
    signature = request.headers.get("X-Line-Signature", "")
    body = await request.body()
    body_text = body.decode("utf-8")

    handler = _get_handler()
    messaging_api = _get_messaging_api()

    try:
        handler.handle(body_text, signature)
    except InvalidSignatureError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    import json
    payload = json.loads(body_text)
    # destination: 이 웹훅을 받은 LINE 채널의 식별자
    destination: str = payload.get("destination", "")
    events = payload.get("events", [])

    for event in events:
        if event.get("type") != "message":
            continue
        if event.get("message", {}).get("type") != "text":
            continue

        reply_token = event["replyToken"]
        user_message = event["message"]["text"]

        # LINE 채널 ID(destination) → hospital_id 매핑 (환경변수 LINE_HOSPITAL_MAPPING)
        # 매핑에 없으면 fallback=1
        hospital_id = _resolve_hospital_id(destination)

        docs = rag_service.search_knowledge(
            db=db,
            hospital_id=hospital_id,
            query=user_message,
            top_k=3,
        )

        if len(docs) < _MIN_DOCS_FOR_AUTO_REPLY:
            reply_text = "少々お待ちください。担当スタッフよりご連絡いたします。"
        else:
            reply_text = rag_service.generate_answer(
                query=user_message,
                context_docs=docs,
                hospital_id=hospital_id,
            )


        messaging_api.reply_message(
            ReplyMessageRequest(
                reply_token=reply_token,
                messages=[TextMessage(text=reply_text)],
            )
        )

    return {"status": "ok"}


@router.post("/reply", response_model=LineBotResponse)
async def get_bot_reply(
    req: LineBotRequest,
    db: Session = Depends(get_db),
) -> LineBotResponse:
    """내부 테스트용 — RAG 답변만 반환 (LINE 미사용)."""
    docs = rag_service.search_knowledge(
        db=db,
        hospital_id=req.hospital_id,
        query=req.patient_message,
        top_k=3,
    )

    if len(docs) < _MIN_DOCS_FOR_AUTO_REPLY:
        return LineBotResponse(
            hospital_id=req.hospital_id,
            reply="少々お待ちください。担当スタッフよりご連絡いたします。",
            requires_human=True,
            confidence=0.0,
        )

    answer = rag_service.generate_answer(
        query=req.patient_message,
        context_docs=docs,
        hospital_id=req.hospital_id,
    )

    confidence = min(0.95, 0.6 + len(docs) * 0.1)

    return LineBotResponse(
        hospital_id=req.hospital_id,
        reply=answer,
        requires_human=False,
        confidence=confidence,
    )
