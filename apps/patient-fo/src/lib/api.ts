// ─────────────────────────────────────────────────────────────────────────────
// patient-fo 데이터 접근 계층
// 실제 API가 준비된 항목은 여기서 fetch, 아직 없는 항목은 mock-data.ts 반환
// 나중에 백엔드가 완성되면 이 파일만 수정하면 됩니다
// ─────────────────────────────────────────────────────────────────────────────

import { doctors, treatments, cases, reviews, faqs } from './mock-data'

const BASE        = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'
const HOSPITAL_ID = Number(process.env.NEXT_PUBLIC_HOSPITAL_ID ?? '1')

// ── 병원 기본 정보 (실제 API) ────────────────────────────────────────────────
interface HospitalApiResponse {
  id:            number
  nameKr:        string
  nameJa:        string | null
  clinicType:    string
  specialty:     string | null
  plan:          string
  status:        string
  managerName:   string
  managerEmail:  string
  siteUrl:       string | null
}

export interface HospitalInfo {
  nameJa:     string
  nameKr:     string
  tagline:    string
  taglineSub: string
  phone:      string
  address:    string
  hours:      string
  lineId:     string
  instagramId: string
  clinicType: string
  specialty:  string | null
  stats: { value: string; label: string }[]
}

// mock 기본값 (API에 없는 필드)
const MOCK_DEFAULTS = {
  tagline:    '「変わったね」ではなく「綺麗になったね」と言われる手術を',
  taglineSub: '自然な美しさを追求する、韓国ソウルの美容外科クリニック',
  phone:      '+82-2-1234-5678',
  address:    'ソウル市江南区論峴洞 123',
  hours:      '月〜土 9:00–18:00',
  lineId:     '@olle_clinic',
  instagramId: '@olle_clinic_jp',
  stats: [
    { value: '28,000+', label: '症例数' },
    { value: '月150+',  label: '日本人患者数' },
    { value: '4.8 / 5', label: '患者満足度' },
    { value: '15年',    label: 'クリニック歴' },
  ],
}

export async function getHospitalInfo(): Promise<HospitalInfo> {
  try {
    const res = await fetch(`${BASE}/api/v1/hospitals/${HOSPITAL_ID}`, {
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('병원 정보 조회 실패')
    const data: HospitalApiResponse = await res.json()
    return {
      nameJa:     data.nameJa ?? data.nameKr,
      nameKr:     data.nameKr,
      clinicType: data.clinicType,
      specialty:  data.specialty ?? null,
      ...MOCK_DEFAULTS,
    }
  } catch {
    // API 연결 실패 시 mock 기본값 사용
    return {
      nameJa:     'オーレ整形外科',
      nameKr:     '올래성형외과',
      clinicType: '성형외과',
      specialty:  null,
      ...MOCK_DEFAULTS,
    }
  }
}

// ── 이하 항목은 아직 백엔드 미구현 → mock-data.ts 그대로 반환 ────────────────

export function getDoctors()    { return doctors }
export function getTreatments() { return treatments }
export function getCases()      { return cases }
export function getReviews()    { return reviews }
export function getFaqs()       { return faqs }
