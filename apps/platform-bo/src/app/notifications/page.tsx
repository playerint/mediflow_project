import PageHeader from '@/components/PageHeader'

type NotiType = 'cs' | 'contract' | 'compliance' | 'system'

interface Notification {
  id:    number
  type:  NotiType
  title: string
  body:  string
  time:  string
  read:  boolean
}

const NOTI_ICON:  Record<NotiType, string> = { cs: '🎧', contract: '📋', compliance: '⚠', system: '🔔' }
const NOTI_COLOR: Record<NotiType, string> = { cs: 'var(--blue)', contract: '#D97706', compliance: 'var(--red)', system: 'var(--s500)' }

const NOTIFICATIONS: Notification[] = [
  { id: 1,  type: 'cs',          title: '미답변 48시간 초과',         body: '올래성형외과 — 田中 花子 님의 문의가 48시간 동안 미답변 상태입니다.',              time: '10분 전',   read: false },
  { id: 2,  type: 'compliance',  title: '광고 표현 위반 감지',         body: '청담미래성형외과 사이트에서 의료 광고법 위반 표현 2건이 감지됐습니다.',           time: '1시간 전',  read: false },
  { id: 3,  type: 'contract',    title: '계약 만료 22일 전',           body: '압구정원성형외과의 계약이 2026-06-30 만료 예정입니다. 갱신을 진행해 주세요.',  time: '3시간 전',  read: false },
  { id: 4,  type: 'cs',          title: 'LINE 봇 연결 오류',           body: '강남뷰티클리닉 LINE 채널 자동상담 연결이 끊겼습니다.',                          time: '5시간 전',  read: false },
  { id: 5,  type: 'contract',    title: '계약 만료 7일 전',            body: '역삼유나이티드 계약이 2026-06-05 만료됩니다. 즉시 확인이 필요합니다.',          time: '1일 전',    read: true },
  { id: 6,  type: 'system',      title: '신규 병원 온보딩 완료',       body: '논현더플러스의 9단계 온보딩이 완료됐습니다. 환자용 사이트가 생성됐습니다.',      time: '2일 전',    read: true },
  { id: 7,  type: 'compliance',  title: '반포미성형외과 SEO 점수 하락', body: 'SEO 점수가 68점에서 55점으로 하락했습니다. 콘텐츠 점검이 필요합니다.',          time: '3일 전',    read: true },
]

export default function NotificationsPage() {
  const unread = NOTIFICATIONS.filter(n => !n.read).length

  return (
    <>
      <PageHeader title="알림">
        <span className="badge bdg-red">{unread}개 미확인</span>
        <button className="btn btn-sm">전체 읽음 처리</button>
      </PageHeader>
      <div className="content fade" style={{ maxWidth: 720 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {NOTIFICATIONS.map((n, i) => (
            <div
              key={n.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '16px 20px',
                borderBottom: i < NOTIFICATIONS.length - 1 ? '1px solid var(--s100)' : 'none',
                background: n.read ? 'transparent' : 'var(--blue-l)',
              }}
            >
              {/* 아이콘 */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--s100)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0,
              }}>
                {NOTI_ICON[n.type]}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--s900)' }}>{n.title}</span>
                  {!n.read && <span className="badge bdg-blue">신규</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--s500)', lineHeight: 1.6 }}>{n.body}</div>
              </div>

              <div style={{ fontSize: 11, color: 'var(--s400)', flexShrink: 0, paddingTop: 2 }}>
                {n.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
