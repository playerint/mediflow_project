# MEDIFLOW Hospital OS — 모노레포

외국인 환자(일본 등)의 상담·전환·사후관리를 자동화하는 **멀티테넌트 B2B SaaS** 플랫폼입니다.
본사(MEDIFLOW)가 파트너 병원을 등록·관리하고, 병원별 환자 사이트를 생성합니다.

---

## 폴더 구조

```
mediflow_project/
├── core/              # 백엔드 — Java 17 + Spring Boot + Gradle + PostgreSQL
│                      # MVC 패턴(Controller → Service → Repository)
│
├── ai-service/        # AI/RAG 처리 — Python + FastAPI
│                      # core 백엔드가 REST API로 호출. pgvector 사용.
│
├── apps/
│   ├── platform-bo/   # 본사용 관리자 화면 — Next.js (TypeScript)
│   │                  # 전체 병원을 가로질러 조회·관리
│   ├── hospital-bo/   # 병원 운영자용 화면 — Next.js (TypeScript)
│   │                  # 자기 병원 데이터만 조회
│   └── patient-fo/    # 환자용 사이트 — Next.js (TypeScript)
│                      # 병원별로 생성됨 (병원 온보딩 완료 시)
│
└── packages/
    └── zeno-ui/       # 공용 디자인 컴포넌트 라이브러리 (ZENO v2)
                       # 모든 BO/FO 앱이 공통으로 사용
```

---

## 핵심 원칙

| 원칙 | 내용 |
|------|------|
| **멀티테넌트 격리** | 모든 쿼리는 `hospital_id`로 필터링. 병원 간 데이터 혼재 절대 금지 |
| **데이터 분리** | 병원 운영 정보 → 플랫폼 DB / 환자·상담 정보 → 병원별 DB (법적 요구) |
| **프론트·백 분리** | 프론트엔드는 DB에 직접 접근 금지. 반드시 백엔드 API를 통해서만 통신 |

---

## 개발 시작 순서

1. **본사용 BO (`apps/platform-bo`)** — 병원 등록 + 9단계 온보딩
2. 온보딩 완료 시 환자용 사이트 자동 생성 (`apps/patient-fo`)
3. **병원용 BO (`apps/hospital-bo`)** — 생성된 사이트 관리

---

## 기술 스택 요약

- **백엔드:** Java 17, Spring Boot, Gradle, PostgreSQL
- **AI 서비스:** Python, FastAPI, pgvector
- **프론트엔드:** Next.js (TypeScript)
- **디자인 시스템:** ZENO v2 (`packages/zeno-ui`)
