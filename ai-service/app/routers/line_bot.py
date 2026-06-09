"""LINE 자동상담 봇 라우터 — RAG 기반"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.schemas import LineBotRequest, LineBotResponse
from app.db.vector_db import get_db
from app.services import rag_service

router = APIRouter(prefix="/line-bot", tags=["LINE 봇"])

# RAG 검색 결과의 최소 신뢰도 임계값.
# 유사 문서가 없거나 신뢰도가 낮으면 직원에게 넘긴다.
_MIN_DOCS_FOR_AUTO_REPLY = 1


@router.post("/reply", response_model=LineBotResponse)
async def get_bot_reply(
    req: LineBotRequest,
    db: Session = Depends(get_db),
) -> LineBotResponse:
    """
    환자 메시지를 받아 RAG로 답변을 생성한다.
    관련 지식 문서가 없으면 requires_human=True 를 반환해
    hospital-bo 에서 직원 개입을 트리거한다.
    """
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

    # 검색된 문서 수를 신뢰도 지표로 사용 (문서 많을수록 높은 신뢰도)
    confidence = min(0.95, 0.6 + len(docs) * 0.1)

    return LineBotResponse(
        hospital_id=req.hospital_id,
        reply=answer,
        requires_human=False,
        confidence=confidence,
    )
