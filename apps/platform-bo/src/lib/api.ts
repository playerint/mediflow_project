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

// ── Step 6 컴플라이언스 검사 ──────────────────────────────────
export interface ComplianceResultDto {
  hospitalId:  number
  compliant:   boolean
  violations:  { pattern: string; rule: string; severity: string }[]
  suggestions: string[]
}

export async function checkOnboardingCompliance(hospitalId: number, content: string): Promise<ComplianceResultDto> {
  const res = await fetch(`${BASE}/api/v1/onboarding/hospitals/${hospitalId}/compliance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ content }),
  })
  if (!res.ok) throw new Error(`컴플라이언스 검사 실패 (${res.status})`)
  return res.json()
}

// ── 온보딩 단계 데이터 저장·조회 ─────────────────────────────
export interface StepDataDto {
  id:          number
  hospitalId:  number
  stepNumber:  number
  data:        string        // JSON 문자열
  completedAt: string | null
  updatedAt:   string
}

export async function getStepData(hospitalId: number, stepNumber: number): Promise<StepDataDto | null> {
  const res = await fetch(`${BASE}/api/v1/onboarding/hospitals/${hospitalId}/steps/${stepNumber}`, {
    cache: 'no-store', headers: authHeaders(),
  })
  if (res.status === 204) return null
  if (!res.ok) return null
  return res.json()
}

export async function saveStepData(hospitalId: number, stepNumber: number, data: unknown, complete = false): Promise<StepDataDto> {
  const res = await fetch(`${BASE}/api/v1/onboarding/hospitals/${hospitalId}/steps/${stepNumber}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body:    JSON.stringify({ data: JSON.stringify(data), complete }),
  })
  if (!res.ok) throw new Error(`단계 데이터 저장 실패 (${res.status})`)
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

// ── CRM 통계 ──────────────────────────────────────────────────
export interface HospitalCrmSummaryDto {
  hospitalId:   number
  hospitalName: string
  newCount:     number
  pendingCount: number
  repliedCount: number
}

export async function getPlatformCrmStats(): Promise<HospitalCrmSummaryDto[]> {
  const res = await fetch(`${BASE}/api/v1/platform/crm/stats`, {
    cache: 'no-store', headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`CRM 통계 조회 실패 (${res.status})`)
  return res.json()
}

// ── 알림 ──────────────────────────────────────────────────────
export interface PlatformNotificationDto {
  id:        number
  type:      string
  title:     string
  body:      string
  read:      boolean
  createdAt: string
}

export async function getPlatformNotifications(): Promise<PlatformNotificationDto[]> {
  const res = await fetch(`${BASE}/api/v1/platform/notifications`, {
    cache: 'no-store', headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`알림 조회 실패 (${res.status})`)
  return res.json()
}

export async function markNotificationRead(id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/platform/notifications/${id}/read`, {
    method: 'PATCH', headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`알림 읽음 처리 실패 (${res.status})`)
}

export async function markAllNotificationsRead(): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/platform/notifications/read-all`, {
    method: 'POST', headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`전체 읽음 처리 실패 (${res.status})`)
}

// ── 플랫폼 사용자 ────────────────────────────────────────────
export interface PlatformUserDto {
  id: number
  username: string
  displayName: string | null
  phone: string | null
  company: string | null
  role: string
  createdAt: string
}

export async function getMyProfile(): Promise<PlatformUserDto> {
  const res = await fetch(`${BASE}/api/v1/platform/users/me`, {
    cache: 'no-store', headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`프로필 조회 실패 (${res.status})`)
  return res.json()
}

export async function updateMyProfile(data: {
  displayName?: string; phone?: string; company?: string
}): Promise<PlatformUserDto> {
  const res = await fetch(`${BASE}/api/v1/platform/users/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`프로필 수정 실패 (${res.status})`)
  return res.json()
}

export async function getTeamMembers(): Promise<PlatformUserDto[]> {
  const res = await fetch(`${BASE}/api/v1/platform/users`, {
    cache: 'no-store', headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`팀 멤버 조회 실패 (${res.status})`)
  return res.json()
}

// ── 플랫폼 마케팅 통계 ────────────────────────────────────────
export interface HospitalMarketingStatsDto {
  hospitalId: number
  hospitalName: string
  aeoScore: number
  seoScore: number
  lineFollowers: number
  aeoWeeklyChange: number
}

export async function getPlatformMarketingStats(): Promise<HospitalMarketingStatsDto[]> {
  const res = await fetch(`${BASE}/api/v1/platform/marketing/stats`, {
    cache: 'no-store', headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`마케팅 통계 조회 실패 (${res.status})`)
  return res.json()
}

// ── CS 티켓 ──────────────────────────────────────────────────
export interface CsTicketDto {
  id: number
  hospitalName: string | null
  type: string
  title: string
  status: string
  priority: string
  createdAt: string
}

export async function getCsTickets(status?: string): Promise<CsTicketDto[]> {
  const url = status
    ? `${BASE}/api/v1/platform/cs/tickets?status=${encodeURIComponent(status)}`
    : `${BASE}/api/v1/platform/cs/tickets`
  const res = await fetch(url, { cache: 'no-store', headers: authHeaders() })
  if (!res.ok) throw new Error(`CS 티켓 조회 실패 (${res.status})`)
  return res.json()
}

export async function updateCsTicketStatus(id: number, status: string): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/platform/cs/tickets/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error(`티켓 상태 변경 실패 (${res.status})`)
}
