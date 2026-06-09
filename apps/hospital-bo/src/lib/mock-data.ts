// hospital-bo 목업 데이터
// 나중에 이 파일만 실제 API 호출로 교체하면 됩니다

export const HOSPITAL_INFO = {
  name:    '올래성형외과',
  nameJa:  'オルレ美容外科',
  siteUrl: 'jp.oleps.co.kr',
  plan:    'Pro',
  status:  'live' as const,
}

export const KPI = [
  { label: '💬 오늘 신규 문의', value: 7,   unit: '건', delta: '↑ 어제 대비 +3건', up: true,  href: '/crm' },
  { label: '⏳ 미처리 상담',   value: 3,   unit: '건', delta: '48시간 초과 1건',  up: false, href: '/crm' },
  { label: '📅 이번 달 예약',  value: 24,  unit: '건', delta: '↑ 전월 대비 +8건', up: true,  href: '/booking' },
  { label: '🧠 AEO 인용',     value: 58,  unit: '회', delta: '↑ 지난주 대비 +11', up: true,  href: '/site/seo' },
]

export type InquiryStatus = 'new' | 'replied' | 'pending'

export interface Inquiry {
  id:      number
  name:    string
  channel: string
  content: string
  status:  InquiryStatus
  time:    string
}

export const RECENT_INQUIRIES: Inquiry[] = [
  { id: 1, name: '田中 花子',  channel: 'LINE',    content: '쌍꺼풀 수술 가격 문의',    status: 'new',     time: '10분 전' },
  { id: 2, name: '佐藤 美咲',  channel: '사이트폼', content: '코 수술 회복 기간 문의',   status: 'pending', time: '42분 전' },
  { id: 3, name: '鈴木 奈々',  channel: 'LINE',    content: '지방 흡입 상담 예약 요청', status: 'new',     time: '1시간 전' },
  { id: 4, name: '山田 優花',  channel: 'LINE',    content: '리프팅 시술 문의',         status: 'replied', time: '2시간 전' },
  { id: 5, name: '伊藤 莉子',  channel: '사이트폼', content: '눈매 교정 비용 문의',      status: 'replied', time: '3시간 전' },
]

export const STATUS_LABEL: Record<InquiryStatus, string> = {
  new:     '미답변',
  pending: '처리 중',
  replied: '답변 완료',
}

export const STATUS_BADGE: Record<InquiryStatus, string> = {
  new:     'badge bdg-red',
  pending: 'badge bdg-blue',
  replied: 'badge bdg-gray',
}

export interface Schedule {
  id:      number
  time:    string
  name:    string
  type:    string
  note?:   string
  urgent?: boolean
}

export const TODAY_SCHEDULE: Schedule[] = [
  { id: 1, time: '10:00',  name: '田中 花子',  type: '쌍꺼풀 상담',    urgent: true },
  { id: 2, time: '11:30',  name: '佐藤 美咲',  type: '코 수술 수술일' },
  { id: 3, time: '14:00',  name: '鈴木 奈々',  type: '첫 상담',       note: 'LINE 통해 예약' },
  { id: 4, time: '16:30',  name: '山田 優花',  type: '경과 확인' },
]

export interface AeoItem {
  query:  string
  cited:  number
  change: number
}

export const AEO_TOP: AeoItem[] = [
  { query: '韓国 目 整形 おすすめ',          cited: 18, change: +4 },
  { query: '韓国 鼻整形 費用 2026',          cited: 14, change: +2 },
  { query: '韓国 美容外科 日本語対応',       cited: 12, change: -1 },
  { query: 'ソウル 二重まぶた クリニック',   cited: 9,  change: +3 },
]

// ────────────────────────────────────────
// CRM 전체 문의 목록 (상세 버전)
// ────────────────────────────────────────
export type CrmCategory = '성형' | '피부' | '라인' | '기타'

export interface CrmInquiry {
  id:       number
  name:     string
  nameKana: string
  channel:  'LINE' | '사이트폼' | '카카오'
  category: CrmCategory
  content:  string
  status:   InquiryStatus
  elapsed:  string   // 경과 시간
  overdue:  boolean  // 48시간 초과 여부
  thread:   { role: 'patient' | 'staff'; text: string; time: string }[]
}

export const CRM_INQUIRIES: CrmInquiry[] = [
  {
    id: 1, name: '田中 花子', nameKana: 'たなか はなこ',
    channel: 'LINE', category: '성형', status: 'new', elapsed: '10분', overdue: false,
    content: '二重まぶたの手術の料金を教えてください。モニター割引はありますか？',
    thread: [
      { role: 'patient', text: '二重まぶたの手術の料金を教えてください。モニター割引はありますか？', time: '10:14' },
    ],
  },
  {
    id: 2, name: '佐藤 美咲', nameKana: 'さとう みさき',
    channel: '사이트폼', category: '성형', status: 'pending', elapsed: '42분', overdue: false,
    content: '鼻の手術後の回復期間はどのくらいですか？仕事は何日休む必要がありますか？',
    thread: [
      { role: 'patient', text: '鼻の手術後の回復期間はどのくらいですか？仕事は何日休む必要がありますか？', time: '09:42' },
      { role: 'staff',   text: 'お問い合わせありがとうございます。回復期間についてご説明いたします。通常、鼻の手術後は1〜2週間のダウンタイムが必要です。', time: '09:58' },
      { role: 'patient', text: 'ありがとうございます。仕事復帰はいつ頃から可能でしょうか？', time: '10:05' },
    ],
  },
  {
    id: 3, name: '鈴木 奈々', nameKana: 'すずき なな',
    channel: 'LINE', category: '성형', status: 'new', elapsed: '1시간', overdue: false,
    content: '脂肪吸引の無料カウンセリングを予約したいです。来月の15日は空いていますか？',
    thread: [
      { role: 'patient', text: '脂肪吸引の無料カウンセリングを予約したいです。来月の15日は空いていますか？', time: '09:22' },
    ],
  },
  {
    id: 4, name: '山田 優花', nameKana: 'やまだ ゆうか',
    channel: 'LINE', category: '피부', status: 'replied', elapsed: '2시간', overdue: false,
    content: 'リフティング施術の効果はどのくらい続きますか？',
    thread: [
      { role: 'patient', text: 'リフティング施術の効果はどのくらい続きますか？', time: '08:30' },
      { role: 'staff',   text: 'リフティングの効果は施術の種類によって異なりますが、一般的には6ヶ月〜2年程度持続します。詳しくはカウンセリングでご説明できます。', time: '08:45' },
      { role: 'patient', text: 'わかりました。カウンセリングを予約したいです。', time: '08:50' },
      { role: 'staff',   text: 'ありがとうございます！ご希望の日程をお知らせください。', time: '08:52' },
    ],
  },
  {
    id: 5, name: '伊藤 莉子', nameKana: 'いとう りこ',
    channel: '사이트폼', category: '성형', status: 'replied', elapsed: '3시간', overdue: false,
    content: '目頭切開の費用を教えてください。他の手術と同時に受けることはできますか？',
    thread: [
      { role: 'patient', text: '目頭切開の費用を教えてください。他の手術と同時に受けることはできますか？', time: '07:20' },
      { role: 'staff',   text: '目頭切開の費用は施術内容により異なります。複数の手術を同時に行うことも可能です。詳細な見積もりはカウンセリングで行います。', time: '07:45' },
    ],
  },
  {
    id: 6, name: '渡辺 葵', nameKana: 'わたなべ あおい',
    channel: 'LINE', category: '피부', status: 'new', elapsed: '3시간 20분', overdue: false,
    content: 'ピーリングとレーザー治療の違いを教えてください。シミ治療に適しているのはどちらですか？',
    thread: [
      { role: 'patient', text: 'ピーリングとレーザー治療の違いを教えてください。シミ治療に適しているのはどちらですか？', time: '07:00' },
    ],
  },
  {
    id: 7, name: '中村 遥', nameKana: 'なかむら はるか',
    channel: '사이트폼', category: '기타', status: 'pending', elapsed: '5시간', overdue: false,
    content: '韓国語が話せなくても大丈夫ですか？日本語通訳はいますか？',
    thread: [
      { role: 'patient', text: '韓国語が話せなくても大丈夫ですか？日本語通訳はいますか？', time: '05:30' },
      { role: 'staff',   text: '日本語対応スタッフが常駐しておりますので、ご安心ください。LINE・メールでも日本語でご対応しております。', time: '06:10' },
    ],
  },
  {
    id: 8, name: '小林 結衣', nameKana: 'こばやし ゆい',
    channel: 'LINE', category: '성형', status: 'new', elapsed: '51시간', overdue: true,
    content: '豊胸手術について詳しく教えてください。バッグの種類やリスクについても知りたいです。',
    thread: [
      { role: 'patient', text: '豊胸手術について詳しく教えてください。バッグの種類やリスクについても知りたいです。', time: '2일 전 09:00' },
    ],
  },
  {
    id: 9, name: '加藤 彩花', nameKana: 'かとう あやか',
    channel: 'LINE', category: '피부', status: 'replied', elapsed: '1일', overdue: false,
    content: 'ボトックスの効果はどれくらい続きますか？頻度はどのくらいで打てばいいですか？',
    thread: [
      { role: 'patient', text: 'ボトックスの効果はどれくらい続きますか？', time: '어제 14:00' },
      { role: 'staff',   text: 'ボトックスの効果は通常3〜6ヶ月程度です。個人差がありますので、カウンセリングで詳しくご説明できます。', time: '어제 14:30' },
    ],
  },
  {
    id: 10, name: '吉田 さくら', nameKana: 'よしだ さくら',
    channel: '사이트폼', category: '성형', status: 'replied', elapsed: '2일', overdue: false,
    content: 'バストアップ手術の術後ケアについて、注意事項を教えてください。',
    thread: [
      { role: 'patient', text: 'バストアップ手術の術後ケアについて、注意事項を教えてください。', time: '2일 전 11:00' },
      { role: 'staff',   text: '術後のケア方法についてご説明いたします。術後1週間は激しい運動を避け、専用のブラジャーを着用していただく必要があります。', time: '2일 전 11:30' },
    ],
  },
]

// ────────────────────────────────────────
// 예약 관리
// ────────────────────────────────────────
export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled'
export type BookingType   = '무료상담' | '유료상담' | '수술' | '시술' | '경과확인'

export interface Booking {
  id:      number
  date:    string   // 'YYYY-MM-DD'
  time:    string   // 'HH:MM'
  name:    string
  nameKana: string
  type:    BookingType
  status:  BookingStatus
  channel: string
  note?:   string
}

export const BOOKINGS: Booking[] = [
  // 오늘 (2026-06-08)
  { id: 1,  date: '2026-06-08', time: '10:00', name: '田中 花子',  nameKana: 'たなか はなこ', type: '무료상담',  status: 'confirmed',  channel: 'LINE',    note: '쌍꺼풀 상담 — 긴급 플래그' },
  { id: 2,  date: '2026-06-08', time: '11:30', name: '佐藤 美咲',  nameKana: 'さとう みさき', type: '수술',      status: 'confirmed',  channel: '사이트폼' },
  { id: 3,  date: '2026-06-08', time: '14:00', name: '鈴木 奈々',  nameKana: 'すずき なな',   type: '무료상담',  status: 'pending',    channel: 'LINE',    note: 'LINE 통해 첫 상담' },
  { id: 4,  date: '2026-06-08', time: '16:30', name: '山田 優花',  nameKana: 'やまだ ゆうか', type: '경과확인',  status: 'confirmed',  channel: 'LINE' },
  // 내일 (2026-06-09)
  { id: 5,  date: '2026-06-09', time: '10:00', name: '渡辺 葵',   nameKana: 'わたなべ あおい', type: '유료상담', status: 'confirmed',  channel: '사이트폼' },
  { id: 6,  date: '2026-06-09', time: '13:00', name: '中村 遥',   nameKana: 'なかむら はるか', type: '시술',    status: 'pending',    channel: 'LINE' },
  { id: 7,  date: '2026-06-09', time: '15:30', name: '小林 結衣', nameKana: 'こばやし ゆい',   type: '무료상담', status: 'pending',    channel: 'LINE' },
  // 이번 주
  { id: 8,  date: '2026-06-10', time: '11:00', name: '加藤 彩花', nameKana: 'かとう あやか',   type: '시술',    status: 'confirmed',  channel: 'LINE' },
  { id: 9,  date: '2026-06-10', time: '14:30', name: '吉田 さくら', nameKana: 'よしだ さくら', type: '경과확인', status: 'confirmed',  channel: '사이트폼' },
  { id: 10, date: '2026-06-11', time: '10:00', name: '山口 莉奈', nameKana: 'やまぐち りな',   type: '수술',    status: 'confirmed',  channel: 'LINE' },
  { id: 11, date: '2026-06-11', time: '14:00', name: '松本 真由', nameKana: 'まつもと まゆ',   type: '무료상담', status: 'pending',    channel: '사이트폼' },
  { id: 12, date: '2026-06-12', time: '09:30', name: '井上 陽菜', nameKana: 'いのうえ はるな', type: '시술',    status: 'confirmed',  channel: 'LINE' },
  { id: 13, date: '2026-06-12', time: '16:00', name: '木村 彩',  nameKana: 'きむら あや',     type: '유료상담', status: 'cancelled',  channel: '사이트폼', note: '환자 취소 요청' },
  // 지난 주 (완료)
  { id: 14, date: '2026-06-05', time: '11:00', name: '林 菜々子', nameKana: 'はやし ななこ',   type: '수술',    status: 'completed',  channel: '사이트폼' },
  { id: 15, date: '2026-06-05', time: '14:00', name: '清水 愛',  nameKana: 'しみず あい',     type: '무료상담', status: 'completed',  channel: 'LINE' },
  { id: 16, date: '2026-06-06', time: '10:30', name: '池田 凛',  nameKana: 'いけだ りん',     type: '경과확인', status: 'completed',  channel: 'LINE' },
]

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  confirmed: '확정',
  pending:   '대기',
  completed: '완료',
  cancelled: '취소',
}

export const BOOKING_STATUS_BADGE: Record<BookingStatus, string> = {
  confirmed: 'badge bdg-navy',
  pending:   'badge bdg-blue',
  completed: 'badge bdg-green',
  cancelled: 'badge bdg-gray',
}

export const BOOKING_TYPE_COLOR: Record<BookingType, string> = {
  '무료상담': '#2563EB',
  '유료상담': '#7C3AED',
  '수술':     '#DC2626',
  '시술':     '#D97706',
  '경과확인': '#16A34A',
}

// ────────────────────────────────────────
export interface LineBot {
  status:     'on' | 'off'
  todayCount: number
  pending:    number
  autoRate:   number
}

export const LINE_BOT: LineBot = {
  status:     'on',
  todayCount: 12,
  pending:    2,
  autoRate:   83,
}

// ────────────────────────────────────────
// LINE 자동상담 대화 목록
// ────────────────────────────────────────
export type LineConvStatus = 'bot'      // 봇이 자동 처리 중
                           | 'escalated' // 봇이 처리 못해 사람 개입 필요
                           | 'resolved'  // 처리 완료

export interface LineMessage {
  role:  'patient' | 'bot' | 'staff'
  text:  string
  time:  string
}

export interface LineConversation {
  id:       number
  name:     string
  nameKana: string
  status:   LineConvStatus
  lastMsg:  string
  lastTime: string
  unread:   number
  thread:   LineMessage[]
}

export const LINE_CONVERSATIONS: LineConversation[] = [
  {
    id: 1, name: '田中 花子', nameKana: 'たなか はなこ',
    status: 'escalated', lastMsg: '手術の詳細を教えてください', lastTime: '10분 전', unread: 1,
    thread: [
      { role: 'patient', text: 'こんにちは、二重まぶた手術に興味があります', time: '09:55' },
      { role: 'bot',     text: 'お問い合わせありがとうございます！二重まぶた手術についてご案内します。\n当院では埋没法・切開法の2種類をご用意しております。無料カウンセリングも承っております。ご希望の日程はいつ頃でしょうか？', time: '09:55' },
      { role: 'patient', text: '来月の初旬を考えています。手術の詳細を教えてください', time: '10:02' },
      { role: 'bot',     text: '申し訳ございません。詳細なご説明はスタッフよりご連絡いたします。少々お待ちください。', time: '10:02' },
    ],
  },
  {
    id: 2, name: '鈴木 奈々', nameKana: 'すずき なな',
    status: 'bot', lastMsg: '無料相談の予約をお願いします', lastTime: '22분 전', unread: 0,
    thread: [
      { role: 'patient', text: '脂肪吸引の無料相談を予約したいのですが', time: '09:40' },
      { role: 'bot',     text: 'はい、もちろんです！無料カウンセリングのご予約を承ります。\nご希望の日程をお聞かせください。', time: '09:40' },
      { role: 'patient', text: '来週の火曜日か水曜日はいかがでしょうか', time: '09:41' },
      { role: 'bot',     text: '来週の火曜日・水曜日ともに空きがございます。\nご希望のお時間帯をお聞かせください。\n午前（10:00〜12:00）/ 午後（14:00〜18:00）', time: '09:41' },
      { role: 'patient', text: '無料相談の予約をお願いします', time: '09:50' },
      { role: 'bot',     text: '承りました！担当スタッフより確認のご連絡をお送りします。\n少々お待ちください😊', time: '09:50' },
    ],
  },
  {
    id: 3, name: '伊藤 莉子', nameKana: 'いとう りこ',
    status: 'escalated', lastMsg: '価格表はありますか？', lastTime: '1시간 전', unread: 2,
    thread: [
      { role: 'patient', text: '目頭切開の価格表はありますか？', time: '09:10' },
      { role: 'bot',     text: '価格についてのご質問ありがとうございます。\n詳細な価格はカウンセリングにてご案内しております。\n目安として、目頭切開は50万ウォン〜となっております。', time: '09:10' },
      { role: 'patient', text: 'もっと詳しい価格表はありますか？他のクリニックと比較したいです', time: '09:18' },
      { role: 'bot',     text: '詳細な価格比較については専門スタッフよりご説明いたします。', time: '09:18' },
      { role: 'patient', text: '価格表はありますか？', time: '09:22' },
    ],
  },
  {
    id: 4, name: '渡辺 葵', nameKana: 'わたなべ あおい',
    status: 'resolved', lastMsg: 'ありがとうございました', lastTime: '2시간 전', unread: 0,
    thread: [
      { role: 'patient', text: 'ピーリングの施術時間はどのくらいですか？', time: '08:00' },
      { role: 'bot',     text: 'ピーリングの施術時間は種類によって異なります。\n一般的なケミカルピーリングは30〜60分程度です。', time: '08:00' },
      { role: 'patient', text: 'わかりました。予約を入れたいです', time: '08:05' },
      { role: 'bot',     text: 'ご予約を承ります。ご希望の日程をお知らせください。', time: '08:05' },
      { role: 'staff',   text: '渡辺様、ご連絡ありがとうございます。スタッフの山本です。ご希望の日程はいつ頃がよろしいでしょうか？', time: '08:20' },
      { role: 'patient', text: '来週月曜日の午前中をお願いします', time: '08:22' },
      { role: 'staff',   text: '来週月曜日10:00でご予約を承りました。当日お待ちしております！', time: '08:25' },
      { role: 'patient', text: 'ありがとうございました', time: '08:26' },
    ],
  },
  {
    id: 5, name: '中村 遥', nameKana: 'なかむら はるか',
    status: 'bot', lastMsg: '韓国語が話せなくても大丈夫ですか', lastTime: '3시간 전', unread: 0,
    thread: [
      { role: 'patient', text: '韓国語が話せなくても大丈夫ですか？', time: '07:30' },
      { role: 'bot',     text: 'はい、大丈夫です！当院には日本語対応スタッフが常駐しております。\nLINE・メール・来院時すべて日本語でご対応いたします😊', time: '07:30' },
    ],
  },
]

// ────────────────────────────────────────
// LINE 자동 응답 규칙
// ────────────────────────────────────────
export interface AutoReplyRule {
  id:       number
  keyword:  string
  reply:    string
  triggerCount: number
  enabled:  boolean
}

export const AUTO_REPLY_RULES: AutoReplyRule[] = [
  { id: 1, keyword: '料金|価格|費用', reply: '料金はカウンセリングにて詳しくご案内しております。無料カウンセリングのご予約はいかがでしょうか？',             triggerCount: 48, enabled: true },
  { id: 2, keyword: '予約|相談',      reply: 'ご予約を承ります！ご希望の日程（曜日・時間帯）をお知らせください。',                                              triggerCount: 61, enabled: true },
  { id: 3, keyword: '日本語',         reply: '日本語対応スタッフが常駐しておりますので、ご安心ください😊',                                                    triggerCount: 22, enabled: true },
  { id: 4, keyword: '回復|ダウンタイム', reply: '回復期間は施術の種類によって異なります。詳細はカウンセリングでご説明いたします。',                          triggerCount: 17, enabled: true },
  { id: 5, keyword: 'アクセス|場所',  reply: '当院はソウル江南区に位置しております。最寄駅から徒歩5分です。詳しいアクセスはサイトをご確認ください。',          triggerCount: 9,  enabled: false },
]

// ────────────────────────────────────────
// 마케팅 현황
// ────────────────────────────────────────
export const MARKETING_KPI = [
  { label: '🧠 AEO 인용 (이번 달)', value: 58,  unit: '회',   delta: '↑ 전월 +11',     up: true },
  { label: '🔍 대표 키워드 순위',    value: 3,   unit: '위',   delta: '↑ 지난주 +2',    up: true },
  { label: '📱 LINE 팔로워',         value: 284, unit: '명',   delta: '↑ 전월 +32',     up: true },
  { label: '🌐 사이트 방문 (이번 달)', value: 1420, unit: '회', delta: '↑ 전월 +18%',   up: true },
]

export interface AeoKeyword {
  keyword:   string
  citations: number
  delta:     number
  topQuery:  string
}

export const AEO_KEYWORDS: AeoKeyword[] = [
  { keyword: '韓国 美容整形 自然な仕上がり',     citations: 18, delta: +4,  topQuery: 'ChatGPT, Perplexity' },
  { keyword: '二重手術 ソウル おすすめクリニック', citations: 14, delta: +3,  topQuery: 'Google AI Overview' },
  { keyword: '韓国整形 術後 回復 期間',          citations: 10, delta: +2,  topQuery: 'ChatGPT' },
  { keyword: 'ソウル 鼻整形 自然',              citations: 8,  delta: +1,  topQuery: 'Perplexity' },
  { keyword: '美容整形 ダウンタイム 最短',       citations: 5,  delta: -1,  topQuery: 'Google AI Overview' },
  { keyword: '江南 脂肪吸引 価格',             citations: 3,  delta:  0,  topQuery: 'Bing Copilot' },
]

export interface SeoKeyword {
  keyword:  string
  rank:     number
  prevRank: number
  volume:   number
}

export const SEO_KEYWORDS: SeoKeyword[] = [
  { keyword: '韓国整形 日本語対応',       rank: 3,  prevRank: 5,  volume: 2400 },
  { keyword: '二重手術 ソウル',           rank: 5,  prevRank: 7,  volume: 1900 },
  { keyword: 'オルレ美容外科',            rank: 1,  prevRank: 1,  volume: 830 },
  { keyword: '韓国 鼻整形 自然',         rank: 8,  prevRank: 6,  volume: 1500 },
  { keyword: '江南クリニック 口コミ',     rank: 12, prevRank: 15, volume: 720 },
  { keyword: '美容整形 韓国 費用',       rank: 21, prevRank: 24, volume: 3100 },
]

export const LINE_CHANNEL_STATS = {
  followers:  284,
  newThisMonth: 32,
  broadcastSent: 3,
  broadcastOpenRate: 72,
  friendAdRoute: [
    { label: '사이트 QR',   pct: 48 },
    { label: 'LINE 검색',  pct: 31 },
    { label: '기타',       pct: 21 },
  ],
}

// ────────────────────────────────────────
// 리포트
// ────────────────────────────────────────
export interface MonthlyKpi {
  month:       string
  inquiries:   number
  bookings:    number
  newPatients: number
  revenue:     number   // 만원 단위
}

export const MONTHLY_KPI: MonthlyKpi[] = [
  { month: '2026-01', inquiries: 58,  bookings: 16, newPatients: 11, revenue: 2800 },
  { month: '2026-02', inquiries: 64,  bookings: 18, newPatients: 13, revenue: 3100 },
  { month: '2026-03', inquiries: 71,  bookings: 21, newPatients: 15, revenue: 3600 },
  { month: '2026-04', inquiries: 66,  bookings: 19, newPatients: 14, revenue: 3300 },
  { month: '2026-05', inquiries: 78,  bookings: 22, newPatients: 17, revenue: 3900 },
  { month: '2026-06', inquiries: 41,  bookings: 12, newPatients: 9,  revenue: 2200 },  // 진행 중
]

export interface ChannelStat {
  channel:    string
  inquiries:  number
  bookings:   number
  convRate:   number  // %
}

export const CHANNEL_STATS: ChannelStat[] = [
  { channel: 'LINE',      inquiries: 164, bookings: 52, convRate: 31.7 },
  { channel: '사이트 폼', inquiries: 98,  bookings: 28, convRate: 28.6 },
  { channel: '직접 연락', inquiries: 34,  bookings: 14, convRate: 41.2 },
  { channel: '기타',      inquiries: 12,  bookings: 3,  convRate: 25.0 },
]

// ────────────────────────────────────────
// 설정 — 팀 멤버
// ────────────────────────────────────────
export type MemberRole   = '관리자' | '상담사' | '검수자'
export type MemberStatus = 'active' | 'invited'

export interface TeamMember {
  id:     number
  name:   string
  email:  string
  role:   MemberRole
  status: MemberStatus
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: 1, name: '김지현', email: 'admin@oleps.co.kr',    role: '관리자', status: 'active'  },
  { id: 2, name: '박소연', email: 'soyon@oleps.co.kr',    role: '상담사', status: 'active'  },
  { id: 3, name: '이민준', email: 'minjun@oleps.co.kr',   role: '상담사', status: 'active'  },
  { id: 4, name: '최다은', email: 'daeun@oleps.co.kr',    role: '검수자', status: 'active'  },
  { id: 5, name: '정수진', email: 'sujin2@oleps.co.kr',   role: '상담사', status: 'invited' },
]
