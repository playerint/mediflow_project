"""API 요청/응답 스키마 정의"""
from pydantic import BaseModel
from typing import Optional


# ── 병원 분석 ─────────────────────────────────────
class AnalyzeRequest(BaseModel):
    hospital_id: int
    url: str                      # 병원 홈페이지 URL


class AnalyzeResponse(BaseModel):
    hospital_id: int
    clinic_type: str
    specialties: list[str]
    extracted_images: list[str]
    extracted_texts: dict[str, str]
    suggested_keywords_ja: list[str]  # 일본어 SEO 키워드 제안


# ── AEO 인용 최적화 ───────────────────────────────
class AeoOptimizeRequest(BaseModel):
    hospital_id: int
    content: str                  # 최적화할 원문
    target_keywords: list[str]    # 타겟 일본어 키워드


class AeoOptimizeResponse(BaseModel):
    hospital_id: int
    optimized_content: str
    structured_data_json: str     # JSON-LD 구조화 데이터


# ── LINE 봇 자동 응답 ─────────────────────────────
class LineBotRequest(BaseModel):
    hospital_id: int
    patient_message: str
    conversation_history: Optional[list[dict]] = []


class LineBotResponse(BaseModel):
    hospital_id: int
    reply: str
    requires_human: bool          # True면 직원 개입 필요
    confidence: float             # 0.0~1.0


# ── 컴플라이언스 검사 ─────────────────────────────
class ComplianceCheckRequest(BaseModel):
    hospital_id: int
    content: str


class ComplianceCheckResponse(BaseModel):
    hospital_id: int
    is_compliant: bool
    violations: list[dict]        # 위반 항목 목록
    suggestions: list[str]        # 수정 제안
