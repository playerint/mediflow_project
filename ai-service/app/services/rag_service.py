"""
RAG 핵심 서비스.

흐름:
  등록: 텍스트 → Gemini 임베딩 → PostgreSQL JSON 컬럼 저장
  검색: 질문 → 임베딩 → NumPy 코사인 유사도 → 관련 문서 → Gemini 답변 생성

pgvector PostgreSQL 서버 확장 없이 동작한다.
"""
from typing import Optional
import numpy as np
from sqlalchemy.orm import Session
from google import genai
from google.genai import types

from app.config import settings
from app.db.vector_db import HospitalKnowledge

_client: Optional[genai.Client] = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def embed_text(text_input: str) -> list[float]:
    """텍스트를 768차원 벡터로 변환한다."""
    client = _get_client()
    result = client.models.embed_content(
        model="text-embedding-004",
        contents=text_input,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT"),
    )
    return result.embeddings[0].values


def embed_query(query: str) -> list[float]:
    """검색 쿼리를 벡터로 변환한다 (task_type이 등록과 다름)."""
    client = _get_client()
    result = client.models.embed_content(
        model="text-embedding-004",
        contents=query,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY"),
    )
    return result.embeddings[0].values


def add_knowledge(
    db: Session,
    hospital_id: int,
    category: str,
    content: str,
    title: str = "",
) -> HospitalKnowledge:
    """병원 지식 문서 한 건을 임베딩해서 저장한다."""
    embedding = embed_text(f"{title}\n{content}" if title else content)

    record = HospitalKnowledge(
        hospital_id=hospital_id,
        category=category,
        title=title,
        content=content,
        embedding=embedding,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def search_knowledge(
    db: Session,
    hospital_id: int,
    query: str,
    top_k: int = 3,
) -> list[HospitalKnowledge]:
    """
    환자 메시지와 가장 유사한 지식 문서 top_k건을 반환한다.
    NumPy로 코사인 유사도를 계산한다.
    """
    query_vec = np.array(embed_query(query), dtype=np.float32)

    rows = (
        db.query(HospitalKnowledge)
        .filter(HospitalKnowledge.hospital_id == hospital_id)
        .all()
    )
    if not rows:
        return []

    embeddings = np.array([row.embedding for row in rows], dtype=np.float32)

    # 코사인 유사도 = 정규화된 벡터의 내적
    query_norm = query_vec / (np.linalg.norm(query_vec) + 1e-10)
    row_norms = np.linalg.norm(embeddings, axis=1, keepdims=True) + 1e-10
    similarities = (embeddings / row_norms) @ query_norm

    top_indices = np.argsort(similarities)[::-1][:top_k]
    return [rows[int(i)] for i in top_indices]


def generate_answer(query: str, context_docs: list, hospital_id: int) -> str:
    """
    검색된 문서들을 컨텍스트로 삼아 Gemini로 일본어 답변을 생성한다.
    컨텍스트가 없으면 직원 연결 안내문을 반환한다.
    """
    if not context_docs:
        return "少々お待ちください。担当スタッフよりご連絡いたします。"

    context = "\n---\n".join(
        f"[{row.category}] {row.title or ''}\n{row.content}"
        for row in context_docs
    )

    prompt = f"""あなたは韓国の美容・医療クリニックのLINE接客スタッフです。
以下の病院情報をもとに、患者の質問に丁寧な日本語で答えてください。
情報にない内容は「スタッフよりご案内します」と伝えてください。
返答は3文以内で簡潔にしてください。

【病院情報】
{context}

【患者の質問】
{query}

【返答】"""

    client = _get_client()
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )
    return response.text.strip()
