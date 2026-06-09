"""
RAG 지식 관리 API.

병원 운영자가 시술·FAQ·가격 등 병원 정보를 등록하면
LINE 봇이 이 데이터를 검색해 답변을 생성한다.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.db.vector_db import get_db
from app.services import rag_service

router = APIRouter(prefix="/rag", tags=["RAG 지식 관리"])


# ── 요청/응답 스키마 ──────────────────────────────────────────

class KnowledgeAddRequest(BaseModel):
    hospital_id: int
    category: str          # treatment / faq / price / doctor / general
    title: Optional[str] = ""
    content: str


class KnowledgeAddResponse(BaseModel):
    id: int
    hospital_id: int
    category: str
    message: str


class KnowledgeBulkAddRequest(BaseModel):
    hospital_id: int
    items: list[KnowledgeAddRequest]


class SearchRequest(BaseModel):
    hospital_id: int
    query: str
    top_k: int = 3


class SearchResult(BaseModel):
    category: str
    title: Optional[str]
    content: str


class SearchResponse(BaseModel):
    hospital_id: int
    query: str
    results: list[SearchResult]
    answer: str             # Gemini가 생성한 최종 답변


# ── 엔드포인트 ────────────────────────────────────────────────

@router.post("/knowledge", response_model=KnowledgeAddResponse)
def add_knowledge(req: KnowledgeAddRequest, db: Session = Depends(get_db)):
    """병원 지식 문서 1건을 임베딩해서 저장한다."""
    VALID_CATEGORIES = {"treatment", "faq", "price", "doctor", "general"}
    if req.category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"category는 {VALID_CATEGORIES} 중 하나여야 합니다.",
        )

    record = rag_service.add_knowledge(
        db=db,
        hospital_id=req.hospital_id,
        category=req.category,
        content=req.content,
        title=req.title or "",
    )
    return KnowledgeAddResponse(
        id=record.id,
        hospital_id=record.hospital_id,
        category=record.category,
        message="지식 문서가 등록되었습니다.",
    )


@router.post("/knowledge/bulk")
def add_knowledge_bulk(req: KnowledgeBulkAddRequest, db: Session = Depends(get_db)):
    """병원 지식 문서 여러 건을 한 번에 등록한다 (온보딩 시 사용)."""
    results = []
    for item in req.items:
        record = rag_service.add_knowledge(
            db=db,
            hospital_id=req.hospital_id,
            category=item.category,
            content=item.content,
            title=item.title or "",
        )
        results.append({"id": record.id, "category": record.category, "title": record.title})

    return {"hospital_id": req.hospital_id, "added": len(results), "items": results}


@router.post("/search", response_model=SearchResponse)
def search_and_answer(req: SearchRequest, db: Session = Depends(get_db)):
    """
    환자 질문을 받아 유사 문서를 검색하고 Gemini로 답변을 생성한다.
    LINE 봇 내부에서 호출하는 핵심 엔드포인트.
    """
    docs = rag_service.search_knowledge(
        db=db,
        hospital_id=req.hospital_id,
        query=req.query,
        top_k=req.top_k,
    )
    answer = rag_service.generate_answer(
        query=req.query,
        context_docs=docs,
        hospital_id=req.hospital_id,
    )

    return SearchResponse(
        hospital_id=req.hospital_id,
        query=req.query,
        results=[
            SearchResult(category=r.category, title=r.title, content=r.content)
            for r in docs
        ],
        answer=answer,
    )
