"""병원 URL 자동 분석 라우터 (온보딩 Step 1)"""
import json
import re
import httpx
from fastapi import APIRouter, HTTPException
from bs4 import BeautifulSoup
from google import genai

from app.models.schemas import AnalyzeRequest, AnalyzeResponse
from app.config import settings

router = APIRouter(prefix="/analyze", tags=["분석"])

_MOCK = dict(
    clinic_type="성형외과",
    specialties=["쌍꺼풀", "코성형", "지방흡입"],
    suggested_keywords_ja=[
        "韓国 整形外科 おすすめ",
        "ソウル 二重まぶた クリニック",
        "韓国美容外科 日本語対応",
    ],
)

_GEMINI_PROMPT = """\
아래는 한국 의료기관 웹사이트에서 추출한 텍스트입니다.
다음 세 항목을 JSON으로 분석해 주세요.

1. clinic_type: 진료과 (성형외과/피부과/치과/안과/정형외과/한의원/내과/산부인과/기타 중 하나)
2. specialties: 이 병원의 주요 시술·서비스 (최대 5개, 한국어)
3. suggested_keywords_ja: 일본인 환자 유입용 일본어 SEO 키워드 (최대 5개, 일본어)

JSON만 출력하고 다른 설명은 생략하세요:
{
  "clinic_type": "...",
  "specialties": ["...", "..."],
  "suggested_keywords_ja": ["...", "..."]
}

웹사이트 텍스트:
"""


async def _crawl(url: str) -> str:
    """URL에서 핵심 텍스트 추출 (최대 2500자)."""
    headers = {"User-Agent": "Mozilla/5.0 (compatible; MEDIFLOW-Bot/1.0; +https://mediflow.io)"}
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "iframe"]):
        tag.decompose()

    title = (soup.find("title") or soup.new_tag("x")).get_text(strip=True)
    meta  = soup.find("meta", attrs={"name": "description"})
    desc  = (meta.get("content") or "") if meta else ""
    body  = soup.get_text(separator=" ", strip=True)[:2500]

    return f"제목: {title}\n설명: {desc}\n본문: {body}"


def _call_gemini(text: str) -> dict:
    """Gemini API로 진료과·시술·일본어 키워드를 분석한다."""
    client   = genai.Client(api_key=settings.gemini_api_key)
    response = client.models.generate_content(
        model    ="gemini-2.0-flash-lite",
        contents =_GEMINI_PROMPT + text,
    )

    # 응답에서 JSON 블록 추출
    match = re.search(r"\{.*\}", response.text, re.DOTALL)
    if not match:
        raise ValueError(f"Gemini 응답에서 JSON을 찾을 수 없음: {response.text[:200]}")
    return json.loads(match.group())


@router.post("", response_model=AnalyzeResponse)
async def analyze_hospital(req: AnalyzeRequest) -> AnalyzeResponse:
    """
    병원 홈페이지를 크롤링하고 Gemini AI로 진료과·시술·일본어 키워드를 분석한다.

    GEMINI_API_KEY 미설정 시 목업 데이터를 반환하므로
    API 키 없이도 개발·테스트가 가능하다.
    """
    # API 키 없으면 목업 반환 (개발 편의)
    if not settings.gemini_api_key:
        return AnalyzeResponse(
            hospital_id=req.hospital_id,
            clinic_type=_MOCK["clinic_type"],
            specialties=_MOCK["specialties"],
            extracted_images=[],
            extracted_texts={},
            suggested_keywords_ja=_MOCK["suggested_keywords_ja"],
        )

    # 1. 크롤링
    try:
        extracted_text = await _crawl(req.url)
    except httpx.TimeoutException:
        raise HTTPException(status_code=422, detail="웹사이트 응답 시간 초과 (15초)")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=422, detail=f"웹사이트 오류 (HTTP {e.response.status_code})")
    except httpx.RequestError as e:
        raise HTTPException(status_code=422, detail=f"URL 접근 실패: {e}")

    # 2. Gemini 분석 (할당량 초과·오류 시 목업으로 대체)
    try:
        parsed = _call_gemini(extracted_text)
    except Exception:
        parsed = _MOCK

    return AnalyzeResponse(
        hospital_id          =req.hospital_id,
        clinic_type          =parsed.get("clinic_type", "의원"),
        specialties          =parsed.get("specialties", [])[:5],
        extracted_images     =[],
        extracted_texts      ={"preview": extracted_text[:300]},
        suggested_keywords_ja=parsed.get("suggested_keywords_ja", [])[:5],
    )
