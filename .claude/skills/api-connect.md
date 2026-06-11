# API 연결 스킬 (mock → 실API 교체)

## 언제 사용하나
프론트엔드 페이지가 mock 데이터를 쓰고 있고, 백엔드 API가 준비됐을 때.

## 실행 순서

1. **백엔드 API 확인**
   - 어떤 엔드포인트가 필요한지 파악
   - `core/src/main/java/com/mediflow/core/controller/` 에서 실제 존재하는지 확인

2. **lib/api.ts에 함수 추가**
   ```typescript
   // apps/<앱이름>/src/lib/api.ts
   export async function getXxx(token: string): Promise<XxxType[]> {
     const res = await fetch(`${API_BASE}/api/v1/xxx`, {
       headers: { Authorization: `Bearer ${token}` }
     })
     if (!res.ok) throw new Error('Failed to fetch')
     return res.json()
   }
   ```

3. **페이지에서 mock 제거 후 API 함수로 교체**
   - mock 데이터 import 삭제
   - `useEffect` + `useState` 또는 서버컴포넌트로 교체

4. **QA 에이전트에게 검토 요청**

## 주의사항
- API_BASE는 환경변수 `NEXT_PUBLIC_API_URL` 사용
- 토큰은 localStorage 또는 쿠키에서 가져옴 (기존 패턴 확인)
- 에러 처리 필수 (빈 배열 fallback)
