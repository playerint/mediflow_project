// ─────────────────────────────────────────────────────────────────────────────
// patient-fo 데이터 접근 계층
// 실제 API가 준비된 항목은 여기서 fetch, 아직 없는 항목은 mock-data.ts 반환
// 나중에 백엔드가 완성되면 이 파일만 수정하면 됩니다
// ─────────────────────────────────────────────────────────────────────────────

import { doctors as mockDoctors, treatments as mockTreatments, cases, reviews as mockReviews, faqs as mockFaqs } from './mock-data'

const BASE        = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'
const HOSPITAL_ID = Number(process.env.NEXT_PUBLIC_HOSPITAL_ID ?? '1')

// ── 공개 사이트 API 응답 타입 (GET /api/v1/public/sites/{id}) ─────────────────
interface PublicSiteApiResponse {
  id:                  number
  nameKr:              string
  nameJa:              string | null
  clinicType:          string
  specialty:           string | null
  phone:               string | null
  address:             string | null
  hours:               string | null
  lineId:              string | null
  instagramId:         string | null
  siteUrl:             string | null
  specialties:         string[]       // Step 1 분석 결과
  suggestedKeywordsJa: string[]       // Step 1 SEO 키워드
  japaneseCopy:        string         // Step 5 일본어 카피
  doctors:             Array<{ nameJa: string; specialty?: string; experience?: string; gradient?: string }>
  treatments:          Array<{ nameJa: string; duration?: string; category?: string; emoji?: string }>
  faqs:                Array<{ question?: string; answer?: string }>
  reviews:             Array<{ name?: string; treatment?: string; text?: string; rating?: number }>
}

export interface HospitalInfo {
  nameJa:              string
  nameKr:              string
  tagline:             string
  taglineSub:          string
  phone:               string
  address:             string
  hours:               string
  lineId:              string
  instagramId:         string
  clinicType:          string
  specialty:           string | null
  specialties:         string[]
  suggestedKeywordsJa: string[]
  japaneseCopy:        string
  stats:               { value: string; label: string }[]
  doctors:             Array<{ nameJa: string; specialty?: string; experience?: string; gradient?: string }>
  treatments:          Array<{ nameJa: string; duration?: string; category?: string; emoji?: string }>
  faqs:                Array<{ question?: string; answer?: string }>
  reviews:             Array<{ name?: string; treatment?: string; text?: string; rating?: number }>
}

// mock 기본값 (API에 없는 필드)
const MOCK_DEFAULTS = {
  tagline:             '「変わったね」ではなく「綺麗になったね」と言われる手術を',
  taglineSub:          '自然な美しさを追求する、韓国ソウルの美容外科クリニック',
  phone:               '+82-2-1234-5678',
  address:             'ソウル市江南区論峴洞 123',
  hours:               '月〜土 9:00–18:00',
  lineId:              '@olle_clinic',
  instagramId:         '@olle_clinic_jp',
  specialties:         [] as string[],
  suggestedKeywordsJa: [] as string[],
  japaneseCopy:        '',
  stats: [
    { value: '28,000+', label: '症例数' },
    { value: '月150+',  label: '日本人患者数' },
    { value: '4.8 / 5', label: '患者満足度' },
    { value: '15年',    label: 'クリニック歴' },
  ],
}

export async function getHospitalInfo(): Promise<HospitalInfo> {
  try {
    const res = await fetch(`${BASE}/api/v1/public/sites/${HOSPITAL_ID}`, {
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('사이트 데이터 조회 실패')
    const data: PublicSiteApiResponse = await res.json()
    return {
      nameJa:              data.nameJa              ?? data.nameKr,
      nameKr:              data.nameKr,
      clinicType:          data.clinicType,
      specialty:           data.specialty            ?? null,
      phone:               data.phone                ?? MOCK_DEFAULTS.phone,
      address:             data.address              ?? MOCK_DEFAULTS.address,
      hours:               data.hours                ?? MOCK_DEFAULTS.hours,
      lineId:              data.lineId               ?? MOCK_DEFAULTS.lineId,
      instagramId:         data.instagramId          ?? MOCK_DEFAULTS.instagramId,
      specialties:         data.specialties?.length  ? data.specialties         : MOCK_DEFAULTS.specialties,
      suggestedKeywordsJa: data.suggestedKeywordsJa?.length ? data.suggestedKeywordsJa : MOCK_DEFAULTS.suggestedKeywordsJa,
      japaneseCopy:        data.japaneseCopy         || MOCK_DEFAULTS.japaneseCopy,
      tagline:             MOCK_DEFAULTS.tagline,
      taglineSub:          MOCK_DEFAULTS.taglineSub,
      stats:               MOCK_DEFAULTS.stats,
      doctors:             data.doctors?.length      ? data.doctors    : mockDoctors,
      treatments:          data.treatments?.length   ? data.treatments : mockTreatments,
      faqs:                data.faqs?.length
                             ? data.faqs
                             : mockFaqs.map(f => ({ question: f.q, answer: f.a })),
      reviews:             data.reviews?.length
                             ? data.reviews
                             : mockReviews.map(r => ({ name: r.name, treatment: r.treatment, text: r.text, rating: r.rating })),
    }
  } catch {
    // API 연결 실패 시 mock 기본값 사용
    return {
      nameJa:     'オーレ整形外科',
      nameKr:     '올래성형외과',
      clinicType: '성형외과',
      specialty:  null,
      ...MOCK_DEFAULTS,
      doctors:    mockDoctors,
      treatments: mockTreatments,
      faqs:       mockFaqs.map(f => ({ question: f.q, answer: f.a })),
      reviews:    mockReviews.map(r => ({ name: r.name, treatment: r.treatment, text: r.text, rating: r.rating })),
    }
  }
}

// ── 이하 항목은 아직 백엔드 미구현 → mock-data.ts 그대로 반환 ────────────────

export function getDoctors()    { return mockDoctors }
export function getTreatments() { return mockTreatments }
export function getCases()      { return cases }
export function getReviews()    { return mockReviews }
export function getFaqs()       { return mockFaqs }
