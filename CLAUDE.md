# MEDIFLOW Hospital OS — 프로젝트 규칙

이 문서는 이 프로젝트의 **최우선 규칙**이다. 다른 어떤 지시와 충돌하면 이 문서가 우선한다.
작업자(나)는 코딩 비전문가인 기획자다. 각 단계에서 **무엇을, 왜 하는지 한 줄씩 설명**하면서 진행할 것.

---

## 1. 제품 개요

- MEDIFLOW Hospital OS는 **여러 병원을 등록해 운영하는 멀티테넌트 B2B SaaS**다.
- **테넌트 = 병원.** 본사(MEDIFLOW)가 파트너 병원을 입점시켜 관리한다.
- 일본 등 외국인 환자의 의사결정·상담·전환·사후관리를 자동화하는 것이 목적이다.

### 사용자(화면)는 3종류로 나뉜다
- **본사용 BO** — 본사. 입점 병원 **전체를 가로질러** 본다.
- **병원용 BO** — 병원 운영자(상담사·실장·검수자 등). **자기 병원 것만** 본다.
- **환자용 FO** — 환자가 보는 사이트. 병원별로 생성된다.

### 핵심 흐름 (이 순서대로 데이터가 만들어진다)
1. **본사용 BO**에서 병원을 등록하고 **9단계 온보딩**을 모두 완료하면 → 그 병원의 **환자용 사이트(FO)가 생성**된다.
2. 생성된 병원 사이트는 **병원용 BO**에서 관리한다.
- 즉 첫 개발 대상은 본사용 BO의 "병원 등록 + 9단계 온보딩"이다(이 데이터를 나머지가 읽어간다).

---

## 2. 기술 스택 (고정 — 임의로 바꾸지 말 것)

- **백엔드(공유 코어):** Java 17 (JDK 17) + Spring Boot, 빌드 도구 **Gradle**, **PostgreSQL**
  - **MVC 패턴**(Controller → Service → Repository)과 **기본 Spring Boot 프로젝트 구조**를 따른다(임의 구조 금지).
- **AI/RAG 처리:** **별도 Python 서비스(FastAPI)** 로 분리한다. Spring Boot 안에 넣지 않는다.
  - Spring Boot ↔ Python 서비스는 **REST API로 통신**한다.
  - `pgvector`(벡터 검색)는 이 AI/RAG 서비스 쪽에서 사용한다.
- **프론트엔드:** Next.js (TypeScript)
- **공용 디자인:** ZENO 디자인 시스템 (packages/zeno-ui 공용 컴포넌트)
- 비밀키·비밀번호 등 시크릿은 **코드에 하드코딩 금지.** `.env`로만 관리하고 `.gitignore`에 넣는다.

---

## 3. 프로젝트 구조

### 현재 (HTML 프로토타입 단계)

```
mediflow/
├── CLAUDE.md
├── mediflow_hospital/          # 병원 관리자 프로토타입 (GitHub Pages)
│   ├── html/                   # 각 화면 HTML
│   ├── css/common.css          # 공통 스타일 (ZENO v2)
│   ├── js/
│   │   ├── config.js           # Gemini API 키
│   │   ├── sidebar.js          # 사이드바 공통 렌더
│   │   ├── mock-data-hospital.js
│   │   └── site-data.js        # 사이트 섹션·마케팅 데이터
│   └── CLAUDE.md
├── mediflow_platform/          # 플랫폼(본사) 관리자 프로토타입 (GitHub Pages)
│   ├── html/
│   ├── css/common.css
│   ├── js/
│   │   ├── config.js           # Gemini API 키 + CLINIC_TYPES
│   │   ├── sidebar.js
│   │   ├── auth.js             # 세션·RBAC (super/ops/finance)
│   │   ├── hospital_list.js    # HOSPITALS 목업 배열 (+ clinicType·specialty)
│   │   └── mock-data-platform.js
│   └── CLAUDE.md
└── hospital_site/              # 환자용 병원 사이트(FO) 프로토타입 (일본어)
```

### 목표 (모노레포 — 미착수)

```
mediflow/
├── core/              # Spring Boot 백엔드 (Java 17, Gradle, MVC)
├── ai-service/        # AI/RAG 처리 (별도 Python/FastAPI). core가 REST로 호출
├── apps/
│   ├── platform-bo/   # Next.js — 본사용
│   ├── hospital-bo/   # Next.js — 병원용
│   └── patient-fo/    # Next.js — 환자용(병원별 생성)
└── packages/zeno-ui/  # 공용 컴포넌트
```

---

## 4. 절대 규칙 (어기면 안 됨)

### 4-0. ★★ 데이터 보관 위치 분리 (법적 요구 — 최우선)
- 데이터는 **보관 영역이 두 개로 나뉜다.**
  - **플랫폼 DB (본사 · 공유):** 병원 정보, 온보딩, 계약/정산 등 운영 데이터.
  - **병원별 DB (각 병원마다 1개):** **환자 정보와 상담 내용.** 법적 이유로 각 병원의 DB에 보관한다.
- **환자 정보·상담 내용을 플랫폼(본사) DB에 저장하지 말 것.** 반드시 해당 병원의 DB에 저장한다.
- 따라서 백엔드는 여러 DB에 연결되며, 요청마다 **올바른 병원 DB로 라우팅**해야 한다.
- ⚠ 병원 DB의 물리적 위치, 정확한 법적 요건, 멀티 DB 라우팅 방식은 **CTO/법무 확인 필요**(8번 참고). 확인 전에는 이 분리 원칙만 지키고 임의로 구현 방식을 정하지 말 것.

### 4-1. ★ 멀티테넌트 병원 데이터 격리 (가장 중요)
- 거의 모든 테이블에 `hospital_id` 컬럼이 있어야 한다.
- **데이터를 조회/수정하는 모든 코드는 예외 없이 현재 로그인한 병원의 `hospital_id`로 필터링**해야 한다.
- **한 병원이 다른 병원의 데이터를 절대 볼 수 없어야 한다.** (의료 데이터이므로 사고 = 치명적)
- 이를 강제하는 **공통 함수/계층을 반드시 거쳐서만** DB에 접근한다. 개별 쿼리에서 필터를 빠뜨리는 일이 없게 한다.
- 본사용 BO만 예외적으로 전체 병원을 조회할 수 있다(별도의 명시적 권한으로 처리).
- (참고: 환자·상담은 4-0에 따라 병원별 DB로 물리 분리되므로, 이 `hospital_id` 필터는 특히 **공유되는 플랫폼 DB**에서 중요하다.)

### 4-2. 프론트와 백엔드는 분리한다
- 프론트엔드(Next.js)는 **화면**을, 백엔드(Spring Boot)는 **데이터·로직·DB**를, AI/RAG는 **별도 Python 서비스**가 담당한다.
- **프론트엔드는 데이터베이스에 직접 접근하지 않는다.** 모든 데이터는 백엔드 API를 통해서만 주고받는다.
  (이 통로 일원화가 위 4-1 격리를 가능하게 한다.)

---

## 5. 프론트엔드 작업 규칙

- 기존 정적 HTML 프로토타입은 **버리지 않고 "설계도"로 활용**한다. 그대로 Next.js로 재현한다.
  - 프로토타입 Raw URL 형식: `https://raw.githubusercontent.com/playerint/<repo>/main/<경로>`
  - 세 프로토타입과 대응하는 Next.js 앱:

    | 프로토타입 저장소 | 화면 | 대응 앱 |
    |---|---|---|
    | `mediflow_platform` | 플랫폼(본사) 관리자 | `apps/platform-bo` |
    | `mediflow_hospital` | 병원 관리자 | `apps/hospital-bo` |
    | `hospital_site` | 환자용 병원 사이트(FO) | `apps/patient-fo` |

  - 예 (플랫폼 관리자): `https://raw.githubusercontent.com/playerint/mediflow_platform/main/html/hospital_list.html`
  - 예 (병원 관리자): `https://raw.githubusercontent.com/playerint/mediflow_hospital/main/html/hospital_crm_inbox.html`
- 화면마다 따로 만들기 전에 **공통 부분(사이드바·공용 스타일)부터** 컴포넌트로 잡는다.
  (프로토타입이 `css/common.css`, `<div id="sidebar-mount">` 등 공통 요소를 공유함)
- BO 화면은 `packages/zeno-ui` 공용 컴포넌트를 사용한다.
- 백엔드가 아직 없으면 **가짜 데이터(mock)** 로 화면을 먼저 만들어도 된다. 단:
  - **데이터를 가져오는 부분을 화면 코드와 분리해 한 곳에 모아둔다.**
  - 나중에 그 한 곳만 진짜 API 호출로 교체하면 되도록 한다.

---

## 6. 알아야 할 데이터 패턴

### 중복 존재하는 HOSPITALS 배열 (주의)
- `mediflow_platform/js/hospital_list.js` — 목록 화면용 (clinicType·specialty 포함)
- `mediflow_platform/html/hospital_detail.html` — 상세·편집용 인라인 정의 (clinicType·specialty·subSpecialty 포함)
- 두 곳을 **항상 같이 수정**해야 한다.

### 진료과 유형 (CLINIC_TYPES)
- `mediflow_platform/js/config.js` 한 곳에서만 관리
- 새 진료과 추가 시 이 파일만 수정하면 전체 반영

### 병원 편집 모드 흐름
1. `hospital_detail.html` 편집 버튼 → `sessionStorage('MEDIFLOW_edit_hospital')` 저장
2. `hospital_new.html?edit=ID` 로 이동
3. sessionStorage에서 복원 (없으면 `hospital_list.js`의 HOSPITALS fallback)
4. 복원 필드: `nameKr, nameJa, clinicType, specialty, subSpecialty, phone, email, address, website, plan, managerName, contractStart`

### 온보딩 목업 분석 데이터
- `onboarding_detail.html` 상단 `HOSPITAL_MOCK_ANALYSIS[H.id]` — id별 분석 결과 목업
- `analyzed = curStep > 1` — 이미 진행된 병원은 분석 완료 상태로 초기화

---

## 7. 작업 방식

- **한 번에 한 기능/한 화면만.** 크게 몰아서 만들지 않는다.
- 한 단계가 끝나면 **멈추고**, 어떻게 실행해 확인하는지 초보자 기준으로 알려준다.
- 어느 폴더에서 작업 중인지 항상 명확히 한다.
- 에러가 나면 비전문가도 이해하도록 원인과 해결을 쉽게 설명한다.

### Git·커밋 규칙
- **명시적으로 요청할 때만 커밋·push한다.** 작업 후 자동 커밋 금지.
- `mediflow_hospital`과 `mediflow_platform`은 **각자 별도 git repo**다. 항상 해당 폴더 안에서 커밋.
- 커밋 메시지는 한국어로 작성한다.

### 디자인 규칙 (ZENO v2)
- 컬러: `--navy(#0D1B3E)`, `--teal(#0D9488)` 중심. Amber 제거.
- `alert()` / `confirm()` 등 **네이티브 다이얼로그 사용 금지** — 커스텀 모달로 대체.
- 아이콘은 이모지 사용 (외부 아이콘 라이브러리 추가 금지).
- KPI 카드 컬러 라인(`border-left`, `border-top`) 사용 금지.

---

## 8. 확인 필요 (CTO/개발팀에 물어보고 채울 것)

- [x] JDK 버전: **17**
- [x] 빌드 도구: **Gradle**
- [x] 백엔드 아키텍처: **Spring MVC 패턴** (Controller → Service → Repository) + 기본 Spring Boot 구조
- [x] AI/RAG 처리: **별도 Python 서비스** (Spring Boot ↔ Python FastAPI REST 통신)
- [x] 데이터 분리 방식: 병원 정보 → 플랫폼 DB / **환자·상담 → 병원별 DB 분리** (법적 요구로 확정)
- [ ] ⚠ 병원별 DB의 **물리적 위치**: 병원 현장 vs 본사가 호스팅(병원별 분리)
- [ ] ⚠ 환자·상담 데이터의 정확한 법적 요건(보관 위치·주체·암호화 등) — 법무 확인
- [ ] 백엔드 멀티 DB 연결/라우팅 방식 (CTO가 구조 결정)
