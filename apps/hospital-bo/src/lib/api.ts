// ─────────────────────────────────────────────────────────────
// MEDIFLOW hospital-bo API 클라이언트
// 병원 기본 정보는 platform 백엔드(8080)에서 가져옴.
// 환자·상담 데이터는 병원별 DB에서 별도 연결 예정 (CLAUDE.md 4-0)
// ─────────────────────────────────────────────────────────────

const BASE      = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'
const TOKEN_KEY = 'mf_hospital_token'

// ── 토큰 관리 ──────────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string, hospitalId: number) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem('mf_hospital_id', String(hospitalId))
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=86400; SameSite=Strict`
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('mf_hospital_id')
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`
}

export function getHospitalId(): number {
  if (typeof window === 'undefined') return 1
  return Number(localStorage.getItem('mf_hospital_id') ?? process.env.NEXT_PUBLIC_HOSPITAL_ID ?? '1')
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

// ── 병원 정보 ──────────────────────────────────────────────────
export interface HospitalInfoDto {
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

export async function getMyHospital(): Promise<HospitalInfoDto> {
  const id  = getHospitalId()
  const res = await fetch(`${BASE}/api/v1/hospitals/${id}`, {
    cache: 'no-store', headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`병원 정보 조회 실패 (${res.status})`)
  return res.json()
}

// ── 환자 (병원별 DB) ──────────────────────────────────────────
export interface PatientDto {
  id:                 number
  nameJa:             string
  nameKo:             string | null
  email:              string | null
  phone:              string | null
  age:                number | null
  gender:             string | null
  country:            string
  preferredTreatment: string | null
  status:             string
  createdAt:          string
}

export async function getPatients(): Promise<PatientDto[]> {
  const res = await fetch(`${BASE}/api/v1/hospital/patients`, {
    cache: 'no-store', headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`환자 목록 조회 실패 (${res.status})`)
  return res.json()
}

// ── 상담 문의 (병원별 DB) ─────────────────────────────────────
export interface ConsultationDto {
  id:            number
  patientId:     number
  patientNameJa: string
  channel:       string
  treatment:     string | null
  message:       string | null
  status:        string
  assignedTo:    string | null
  createdAt:     string
  repliedAt:     string | null
}

export async function getConsultations(status?: string): Promise<ConsultationDto[]> {
  const url = status
    ? `${BASE}/api/v1/hospital/consultations?status=${encodeURIComponent(status)}`
    : `${BASE}/api/v1/hospital/consultations`
  const res = await fetch(url, { cache: 'no-store', headers: authHeaders() })
  if (!res.ok) throw new Error(`상담 목록 조회 실패 (${res.status})`)
  return res.json()
}

export async function getConsultationStats(): Promise<Record<string, number>> {
  const res = await fetch(`${BASE}/api/v1/hospital/consultations/stats`, {
    cache: 'no-store', headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`상담 통계 조회 실패 (${res.status})`)
  return res.json()
}

export async function updateConsultationStatus(id: number, status: string): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/hospital/consultations/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error(`상태 변경 실패 (${res.status})`)
}

// ── 예약 (병원별 DB) ─────────────────────────────────────────
export interface BookingDto {
  id:            number
  patientId:     number
  patientNameJa: string
  treatment:     string | null
  doctor:        string | null
  scheduledAt:   string
  status:        string
  notes:         string | null
  createdAt:     string
}

export async function getBookings(): Promise<BookingDto[]> {
  const res = await fetch(`${BASE}/api/v1/hospital/bookings`, {
    cache: 'no-store', headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`예약 목록 조회 실패 (${res.status})`)
  return res.json()
}

// ── LINE 유입 상담 ──────────────────────────────────────────
export async function getLineConsultations(): Promise<ConsultationDto[]> {
  const res = await fetch(`${BASE}/api/v1/hospital/consultations?channel=LINE`, {
    cache: 'no-store', headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`LINE 상담 목록 조회 실패 (${res.status})`)
  return res.json()
}

// ── 온보딩 단계 데이터 (병원 콘텐츠 편집용) ────────────────
export interface StepDataDto {
  id:          number
  hospitalId:  number
  stepNumber:  number
  data:        string   // JSON 문자열
  completedAt: string | null
  updatedAt:   string
}

export async function getOnboardingStepData(stepNumber: number): Promise<StepDataDto | null> {
  const id  = getHospitalId()
  const res = await fetch(`${BASE}/api/v1/onboarding/hospitals/${id}/steps/${stepNumber}`, {
    cache: 'no-store', headers: authHeaders(),
  })
  if (res.status === 204) return null
  if (!res.ok) throw new Error(`온보딩 단계 조회 실패 (${res.status})`)
  return res.json()
}

export async function getAllOnboardingStepData(): Promise<Record<number, StepDataDto>> {
  const id  = getHospitalId()
  const res = await fetch(`${BASE}/api/v1/onboarding/hospitals/${id}/steps`, {
    cache: 'no-store', headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`온보딩 전체 단계 조회 실패 (${res.status})`)
  return res.json()
}

export async function saveOnboardingStepData(
  stepNumber: number,
  data: Record<string, unknown>,
  complete = false,
): Promise<StepDataDto> {
  const id  = getHospitalId()
  const res = await fetch(`${BASE}/api/v1/onboarding/hospitals/${id}/steps/${stepNumber}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body:    JSON.stringify({ data: JSON.stringify(data), complete }),
  })
  if (!res.ok) throw new Error(`온보딩 단계 저장 실패 (${res.status})`)
  return res.json()
}

// ── 마케팅 통계 ──────────────────────────────────────────────
export interface MarketingChannelDto {
  name:  string
  leads: number
  rate:  number
}

export interface MarketingStatsDto {
  totalLeads:   number
  channels:     MarketingChannelDto[]
  monthlyTrend: { month: string; leads: number }[]
}

export async function getMarketingStats(): Promise<MarketingStatsDto> {
  const res = await fetch(`${BASE}/api/v1/hospital/marketing/stats`, {
    cache: 'no-store', headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`마케팅 통계 조회 실패 (${res.status})`)
  return res.json()
}

// ── 리포트 요약 ──────────────────────────────────────────────
export interface ReportSummaryDto {
  period:          string
  newPatients:     number
  consultations:   number
  bookings:        number
  conversionRate:  number
  topProcedures:   { name: string; count: number }[]
}

export async function getReportSummary(): Promise<ReportSummaryDto> {
  const res = await fetch(`${BASE}/api/v1/hospital/reports/summary`, {
    cache: 'no-store', headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`리포트 요약 조회 실패 (${res.status})`)
  return res.json()
}

// ── 병원 설정 ────────────────────────────────────────────────
export interface HospitalSettingsDto {
  businessHours:     string
  lunchBreak:        string
  closedDays:        string[]
  notificationEmail: string
  autoReplyEnabled:  boolean
}

export async function getHospitalSettings(): Promise<HospitalSettingsDto> {
  const res = await fetch(`${BASE}/api/v1/hospital/settings`, {
    cache: 'no-store', headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`설정 조회 실패 (${res.status})`)
  return res.json()
}

export async function saveHospitalSettings(settings: HospitalSettingsDto): Promise<HospitalSettingsDto> {
  const res = await fetch(`${BASE}/api/v1/hospital/settings`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body:    JSON.stringify(settings),
  })
  if (!res.ok) throw new Error(`설정 저장 실패 (${res.status})`)
  return res.json()
}
