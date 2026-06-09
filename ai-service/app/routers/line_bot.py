"""LINE 자동상담 봇 라우터"""
from fastapi import APIRouter
from app.models.schemas import LineBotRequest, LineBotResponse

router = APIRouter(prefix="/line-bot", tags=["LINE 봇"])


@router.post("/reply", response_model=LineBotResponse)
async def get_bot_reply(req: LineBotRequest) -> LineBotResponse:
    """
    환자 메시지를 받아 AI 자동 응답을 생성한다.
    자동 처리가 어려운 경우 requires_human=True 를 반환해
    hospital-bo 에서 직원 개입을 트리거한다.

    TODO: pgvector RAG + Gemini API 연동
    """
    msg = req.patient_message.lower()

    # 간단한 키워드 매칭 (추후 RAG로 교체)
    if any(kw in msg for kw in ["料金", "価格", "費用", "いくら"]):
        return LineBotResponse(
            hospital_id=req.hospital_id,
            reply="料金についてはカウンセリングにて詳しくご案内しております。無料カウンセリングのご予約はいかがでしょうか？",
            requires_human=False,
            confidence=0.85,
        )

    if any(kw in msg for kw in ["予約", "相談", "カウンセリング"]):
        return LineBotResponse(
            hospital_id=req.hospital_id,
            reply="ご予約を承ります！ご希望の日程をお知らせください。",
            requires_human=False,
            confidence=0.90,
        )

    # 처리 불가 → 직원 개입 필요
    return LineBotResponse(
        hospital_id=req.hospital_id,
        reply="少々お待ちください。担当スタッフよりご連絡いたします。",
        requires_human=True,
        confidence=0.40,
    )
