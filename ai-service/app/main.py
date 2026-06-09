"""
MEDIFLOW AI Service — FastAPI 메인 애플리케이션

Spring Boot(core)에서 REST로 호출하는 AI/RAG 전용 마이크로서비스.
pgvector 벡터 검색은 이 서비스에서만 사용한다 (CLAUDE.md 규칙).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import analyze, line_bot, compliance, aeo

app = FastAPI(
    title="MEDIFLOW AI Service",
    description="병원 분석·AEO 최적화·LINE 봇·컴플라이언스 검사 API",
    version="0.1.0",
)

# CORS — Spring Boot core 서비스에서만 호출 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(analyze.router,    prefix="/api/v1")
app.include_router(line_bot.router,   prefix="/api/v1")
app.include_router(compliance.router, prefix="/api/v1")
app.include_router(aeo.router,        prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "mediflow-ai"}
