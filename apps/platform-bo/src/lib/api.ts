// ─────────────────────────────────────────────────────────────
// MEDIFLOW API 클라이언트
// 백엔드 URL이 바뀌면 .env.local의 NEXT_PUBLIC_API_URL 만 수정하면 됩니다.
// ─────────────────────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

// ── 토큰 관리 ──────────────────────────────────────────────────
const TOKEN_KEY = 'mf_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
  // Next.js middleware가 읽을 수 있도록 쿠키에도 저장
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=86400; SameSite=Strict`
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── 인증 API ────────────────────────────────────────────────────
export interface LoginResponseDto {
  token:      string
  username:   string
  role:       string
  hospitalId: number | null
}

export async function login(username: string, password: string): Promise<LoginResponseDto> {
  const res = await fetch(`${BASE}/api/v1/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message ?? '로그인에 실패했습니다.')
  }
  return res.json()
}

// ── 백엔드 응답 타입 ──────────────────────────────────────────
export interface HospitalDto {
  id:             number
  nameKr:         string
  nameJa:         string | null
  clinicType:     string
  specialty:      string | null
  plan:           string
  status:         string
  managerName:    string
  managerEmail:   string
  contractStart:  string
  contractExpire: string | null
  siteUrl:        string | null
  createdAt:      string
}

// ── 병원 목록 ──────────────────────────────────────────────────
export async function getHospitals(status?: string): Promise<HospitalDto[]> {
  const url = status
    ? `${BASE}/api/v1/hospitals?status=${encodeURIComponent(status)}`
    : `${BASE}/api/v1/hospitals`
  const res = await fetch(url, { cache: 'no-store', headers: authHeaders() })
  if (!res.ok) throw new Error(`병원 목록 조회 실패 (${res.status})`)
  return res.json()
}

// ── 병원 단건 ──────────────────────────────────────────────────
export async function getHospital(id: number): Promise<HospitalDto> {
  const res = await fetch(`${BASE}/api/v1/hospitals/${id}`, { cache: 'no-store', headers: authHeaders() })
  if (!res.ok) throw new Error(`병원 조회 실패 (${res.status})`)
  return res.json()
}

// ── 병원 등록 ──────────────────────────────────────────────────
export interface HospitalCreateDto {
  nameKr:          string
  nameJa?:         string
  clinicType:      string
  specialty?:      string
  plan:            string
  managerName:     string
  managerEmail:    string
  contractStart:   string
  contractExpire?: string
}

// ── 온보딩 ────────────────────────────────────────────────────
export interface OnboardingDto {
  id:               number
  hospitalId:       number
  currentStep:      number
  currentStepName:  string
  status:           string
  progressPct:      number
  publishedSiteUrl: string | null
  createdAt:        string
  updatedAt:        string
}

export async function getOnboardings(): Promise<OnboardingDto[]> {
  const res = await fetch(`${BASE}/api/v1/onboarding`, { cache: 'no-store', headers: authHeaders() })
  if (!res.ok) throw new Error(`온보딩 목록 조회 실패 (${res.status})`)
  return res.json()
}

export async function getOnboarding(hospitalId: number): Promise<OnboardingDto> {
  const res = await fetch(`${BASE}/api/v1/onboarding/hospitals/${hospitalId}`, { cache: 'no-store', headers: authHeaders() })
  if (!res.ok) throw new Error(`온보딩 조회 실패 (${res.status})`)
  return res.json()
}

export async function nextOnboardingStep(hospitalId: number): Promise<OnboardingDto> {
  const res = await fetch(`${BASE}/api/v1/onboarding/hospitals/${hospitalId}/next`, {
    method: 'POST', headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`단계 진행 실패 (${res.status})`)
  return res.json()
}

export async function publishOnboarding(hospitalId: number, siteUrl: string): Promise<OnboardingDto> {
  const res = await fetch(`${BASE}/api/v1/onboarding/hospitals/${hospitalId}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ siteUrl }),
  })
  if (!res.ok) throw new Error(`게시 실패 (${res.status})`)
  return res.json()
}

// ── Step 1 AI 분석 ────────────────────────────────────────────
export interface AnalyzeResultDto {
  hospitalId:          number
  clinicType:          string
  specialties:         string[]
  suggestedKeywordsJa: string[]
}

export async function analyzeOnboarding(hospitalId: number, url: string): Promise<AnalyzeResultDto> {
  const res = await fetch(`${BASE}/api/v1/onboarding/hospitals/${hospitalId}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ url }),
  })
  if (!res.ok) throw new Error(`분석 실패 (${res.status})`)
  return res.json()
}

export async function createHospital(data: HospitalCreateDto): Promise<HospitalDto> {
  const res = await fetch(`${BASE}/api/v1/hospitals`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body:    JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error ?? `병원 등록 실패 (${res.status})`)
  }
  return res.json()
}
