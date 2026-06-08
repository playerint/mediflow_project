// 나중에 이 파일만 실제 API 호출로 교체하면 됨

export type HospitalStatus = 'active' | 'onboarding' | 'paused'
export type HospitalPlan   = 'Basic' | 'Pro' | 'Enterprise'

export interface Hospital {
  id:          number
  name:        string
  nameJa:      string
  url:         string
  plan:        HospitalPlan
  status:      HospitalStatus
  inq:         number
  expire:      string
  manager:     string
  clinicType:  string
  specialty:   string
}

export const HOSPITALS: Hospital[] = [
  { id:1,  name:'올래성형외과',    nameJa:'オーレ整形外科',      url:'jp.oleps.co.kr',         plan:'Pro',        status:'active',     inq:23, expire:'2026-11-30', manager:'김운영', clinicType:'성형외과', specialty:'쌍꺼풀·눈성형' },
  { id:2,  name:'강남뷰티클리닉',  nameJa:'カンナムビューティ',   url:'jp.kannambeauty.co.kr',  plan:'Pro',        status:'active',     inq:18, expire:'2026-09-15', manager:'이수진', clinicType:'피부과',   specialty:'보톡스·필러' },
  { id:3,  name:'청담미래성형외과', nameJa:'チョンダムミレ',       url:'jp.miraeclinic.co.kr',   plan:'Enterprise', status:'active',     inq:31, expire:'2027-03-20', manager:'김운영', clinicType:'성형외과', specialty:'안면윤곽' },
  { id:4,  name:'압구정원성형외과', nameJa:'アックジョンウォン',   url:'jp.wonclinic.co.kr',     plan:'Basic',      status:'active',     inq:9,  expire:'2026-06-30', manager:'이수진', clinicType:'성형외과', specialty:'코성형' },
  { id:5,  name:'신사라인성형외과', nameJa:'シンサライン',         url:'jp.sinsa-line.co.kr',    plan:'Pro',        status:'active',     inq:14, expire:'2026-12-10', manager:'김운영', clinicType:'성형외과', specialty:'지방흡입' },
  { id:6,  name:'도곡세라성형외과', nameJa:'ドゴクセラ',           url:'jp.sera-ps.co.kr',       plan:'Pro',        status:'active',     inq:11, expire:'2026-08-25', manager:'이수진', clinicType:'성형외과', specialty:'가슴성형' },
  { id:7,  name:'반포미성형외과',   nameJa:'バンポミ',             url:'jp.banpomi.co.kr',       plan:'Basic',      status:'active',     inq:7,  expire:'2026-07-14', manager:'김운영', clinicType:'성형외과', specialty:'눈·코 복합' },
  { id:8,  name:'논현더플러스',     nameJa:'ノンヒョンザプラス',   url:'jp.theplus-ps.co.kr',    plan:'Pro',        status:'active',     inq:16, expire:'2027-01-08', manager:'이수진', clinicType:'성형외과', specialty:'피부·리프팅' },
  { id:9,  name:'역삼유나이티드',   nameJa:'ヨクサムユナイテッド', url:'jp.united-ps.co.kr',     plan:'Basic',      status:'active',     inq:5,  expire:'2026-06-05', manager:'김운영', clinicType:'성형외과', specialty:'기타' },
  { id:10, name:'이수프리마',       nameJa:'イスプリマ',           url:'(온보딩 중)',             plan:'Pro',        status:'onboarding', inq:0,  expire:'-',          manager:'김운영', clinicType:'성형외과', specialty:'눈·코 복합' },
  { id:11, name:'사당뷰성형외과',   nameJa:'サダンビュー',         url:'(온보딩 중)',             plan:'Enterprise', status:'onboarding', inq:0,  expire:'-',          manager:'이수진', clinicType:'성형외과', specialty:'쌍꺼풀·눈성형' },
  { id:12, name:'방배탑성형외과',   nameJa:'バンベタップ',         url:'(온보딩 중)',             plan:'Basic',      status:'onboarding', inq:0,  expire:'-',          manager:'김운영', clinicType:'성형외과', specialty:'안면윤곽' },
]

// ── 온보딩 9단계 정의 ──────────────────────────────────────
export const ONBOARDING_STEPS = [
  { step: 1, name: '자동 분석',     desc: 'URL 크롤링 · 이미지 추출' },
  { step: 2, name: '전략 산출',     desc: 'AI 기획안 · SEO 키워드' },
  { step: 3, name: '디자인',        desc: '템플릿 선택' },
  { step: 4, name: '이미지',        desc: '이미지 업로드' },
  { step: 5, name: '카피 검수',     desc: '일본어 재집필 확인' },
  { step: 6, name: '컴플라이언스',  desc: '광고법 5종 검사' },
  { step: 7, name: '퍼널 연결',     desc: 'LINE · CRM · 팔로잉' },
  { step: 8, name: 'SEO · AEO',    desc: '검색 · AI 인용 최적화' },
  { step: 9, name: '미리보기 · 게시', desc: '배포' },
] as const

// 온보딩 중인 병원의 현재 진행 단계 (hospital id → currentStep)
export const ONBOARDING_PROGRESS: Record<number, number> = {
  10: 3,  // 이수프리마 — 디자인 단계
  11: 6,  // 사당뷰성형외과 — 컴플라이언스 단계
  12: 1,  // 방배탑성형외과 — 자동 분석 단계
}

export const PLAN_BADGE: Record<HospitalPlan, string> = {
  Enterprise: 'badge bdg-blue',
  Pro:        'badge bdg-navy',
  Basic:      'badge bdg-gray',
}

export const STATUS_BADGE: Record<HospitalStatus, string> = {
  active:     'badge bdg-navy',
  onboarding: 'badge bdg-blue',
  paused:     'badge bdg-gray',
}

export const STATUS_LABEL: Record<HospitalStatus, string> = {
  active:     '운영 중',
  onboarding: '온보딩',
  paused:     '일시정지',
}
