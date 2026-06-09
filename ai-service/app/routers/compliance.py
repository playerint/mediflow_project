"""의료 광고법 컴플라이언스 검사 라우터 (온보딩 Step 6)"""
from fastapi import APIRouter
from app.models.schemas import ComplianceCheckRequest, ComplianceCheckResponse

router = APIRouter(prefix="/compliance", tags=["컴플라이언스"])

# 위반 패턴 목록 (한국 의료 광고법 기준)
_VIOLATION_PATTERNS = [
    {"pattern": "最高",           "rule": "최고·최상 표현 금지",    "severity": "high"},
    {"pattern": "100%",           "rule": "효과 보장 표현 금지",    "severity": "high"},
    {"pattern": "副作用なし",      "rule": "부작용 없음 허위 표현",  "severity": "high"},
    {"pattern": "口コミ",          "rule": "환자 후기·사례 금지",   "severity": "medium"},
    {"pattern": "他院より安い",    "rule": "비교 광고 금지",         "severity": "medium"},
]


@router.post("/check", response_model=ComplianceCheckResponse)
async def check_compliance(req: ComplianceCheckRequest) -> ComplianceCheckResponse:
    """
    콘텐츠에서 의료 광고법 위반 표현을 탐지한다.

    TODO: LLM 기반 정밀 검사로 교체 (현재는 키워드 매칭)
    """
    violations = [
        {
            "pattern": v["pattern"],
            "rule": v["rule"],
            "severity": v["severity"],
        }
        for v in _VIOLATION_PATTERNS
        if v["pattern"] in req.content
    ]

    suggestions = [
        f"「{v['pattern']}」표현을 수정해 주세요: {v['rule']}"
        for v in violations
    ]

    return ComplianceCheckResponse(
        hospital_id=req.hospital_id,
        is_compliant=len(violations) == 0,
        violations=violations,
        suggestions=suggestions,
    )
