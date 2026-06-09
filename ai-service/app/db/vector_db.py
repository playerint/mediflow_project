"""
PostgreSQL + NumPy 기반 벡터 저장소.
pgvector PostgreSQL 서버 확장 없이 JSON 컬럼에 임베딩을 저장하고
NumPy로 코사인 유사도를 계산한다.
"""
import os
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from datetime import datetime

from app.config import settings

# Windows 한국어 환경에서 libpq 메시지 인코딩 문제 방지
os.environ.setdefault("PGCLIENTENCODING", "UTF8")

# SQLite는 check_same_thread=False 필요, PostgreSQL은 lc_messages=C 설정
if settings.vector_db_url.startswith("sqlite"):
    engine = create_engine(
        settings.vector_db_url,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_engine(
        settings.vector_db_url,
        connect_args={"options": "-c lc_messages=C"},
    )
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# Gemini text-embedding-004 모델의 출력 차원수
EMBEDDING_DIM = 768


class HospitalKnowledge(Base):
    """병원별 지식 문서 + 임베딩 벡터를 저장하는 테이블."""
    __tablename__ = "hospital_knowledge"

    id = Column(Integer, primary_key=True, autoincrement=True)
    hospital_id = Column(Integer, nullable=False, index=True)
    # 지식 종류: treatment(시술) / faq / price(가격) / doctor / general
    category = Column(String(50), nullable=False)
    title = Column(Text)
    content = Column(Text, nullable=False)
    embedding = Column(JSON, nullable=False)   # list[float] — JSON으로 저장
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


def init_db():
    """테이블 생성 (pgvector 서버 확장 불필요)."""
    Base.metadata.create_all(engine)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
