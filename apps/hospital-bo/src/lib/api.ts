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
