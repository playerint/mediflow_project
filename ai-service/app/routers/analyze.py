"""병원 URL 자동 분석 라우터 (온보딩 Step 1)"""
from fastapi import APIRouter
from app.models.schemas import AnalyzeRequest, AnalyzeResponse

router = APIRouter(prefix="/analyze", tags=["분석"])


@router.post("", response_model=AnalyzeResponse)
async def analyze_hospital(req: AnalyzeRequest) -> AnalyzeResponse:
    """
    병원 홈페이지를 크롤링해 이미지·텍스트·진료과 정보를 추출한다.
    추출 결과를 바탕으로 일본어 SEO 키워드를 제안한다.

    TODO: 실제 크롤러 + Gemini API 연동
    """
    # 목업 응답 — 실제 구현 전 프론트엔드 연동 테스트용
    return AnalyzeResponse(
        hospital_id=req.hospital_id,
        clinic_type="성형외과",
        specialties=["쌍꺼풀", "코성형", "지방흡입"],
        extracted_images=["https://example.com/img1.jpg"],
        extracted_texts={"about": "서울 강남 최고의 성형외과"},
        suggested_keywords_ja=[
            "韓国 整形外科 おすすめ",
            "ソウル 二重まぶた クリニック",
            "韓国美容外科 日本語対応",
        ],
    )
