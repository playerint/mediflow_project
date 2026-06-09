"""AEO(AI 검색엔진 최적화) 콘텐츠 생성 라우터 (온보딩 Step 2·8)"""
from fastapi import APIRouter
from app.models.schemas import AeoOptimizeRequest, AeoOptimizeResponse
import json

router = APIRouter(prefix="/aeo", tags=["AEO"])


@router.post("/optimize", response_model=AeoOptimizeResponse)
async def optimize_for_aeo(req: AeoOptimizeRequest) -> AeoOptimizeResponse:
    """
    콘텐츠를 AI 검색엔진(Perplexity·ChatGPT) 인용에 최적화한다.
    - 일본어 재집필
    - FAQ 형식 구조화
    - JSON-LD 구조화 데이터 생성

    TODO: Gemini API 연동
    """
    # 목업 구조화 데이터
    structured = {
        "@context": "https://schema.org",
        "@type": "MedicalClinic",
        "name": "オルレ美容外科",
        "description": req.content[:100] + "...",
        "keywords": req.target_keywords,
    }

    return AeoOptimizeResponse(
        hospital_id=req.hospital_id,
        optimized_content=f"【AEO最適化済み】\n{req.content}",
        structured_data_json=json.dumps(structured, ensure_ascii=False, indent=2),
    )
