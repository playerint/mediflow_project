import Link from 'next/link'
import {
  KPI, RECENT_INQUIRIES, TODAY_SCHEDULE, AEO_TOP, LINE_BOT,
  STATUS_LABEL, STATUS_BADGE,
} from '@/lib/mock-data'

export default function DashboardPage() {
  return (
    <>
      {/* 상단 타이틀바 */}
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">홈 대시보드</span>
        </div>
        <div className="topbar-right">
          <span style={{ fontSize: 12, color: 'var(--s400)' }}>2026년 6월 8일 (월)</span>
        </div>
      </div>

      <div className="content fade">

        {/* KPI 카드 4개 */}
        <div className="kpi-grid">
          {KPI.map(k => (
            <Link key={k.label} href={k.href} style={{ textDecoration: 'none' }}>
              <div className="kpi-card">
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value">
                  {k.value}
                  <span className="kpi-unit">{k.unit}</span>
                </div>
                <div className={`kpi-delta ${k.up ? 'up' : 'down'}`}>{k.delta}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* 그리드 1: 오늘 일정 + 최근 문의 */}
        <div className="grid2" style={{ alignItems: 'start' }}>

          {/* 오늘 일정 */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">📅 오늘 일정</div>
              <Link href="/booking" className="see-all">전체 보기</Link>
            </div>
            {TODAY_SCHEDULE.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--s400)', fontSize: 13 }}>오늘 일정이 없습니다</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {TODAY_SCHEDULE.map((s, i) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '11px 0',
                      borderBottom: i < TODAY_SCHEDULE.length - 1 ? '1px solid var(--s100)' : 'none',
                    }}
                  >
                    <div style={{ minWidth: 42, fontSize: 12, fontWeight: 700, color: 'var(--navy)', paddingTop: 1 }}>
                      {s.time}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--s900)' }}>{s.name}</span>
                        {s.urgent && <span className="badge bdg-red">긴급</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--s500)' }}>
                        {s.type}
                        {s.note && <span style={{ color: 'var(--s400)', marginLeft: 6 }}>· {s.note}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 최근 문의 */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">💬 최근 문의</div>
              <Link href="/crm" className="see-all">전체 보기</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {RECENT_INQUIRIES.map((q, i) => (
                <Link
                  key={q.id}
                  href="/crm"
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 0',
                    borderBottom: i < RECENT_INQUIRIES.length - 1 ? '1px solid var(--s100)' : 'none',
                    textDecoration: 'none',
                  }}
                >
                  {/* 채널 칩 */}
                  <div style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                    background: q.channel === 'LINE' ? '#D1FAE5' : 'var(--blue-l)',
                    color: q.channel === 'LINE' ? '#065F46' : 'var(--blue)',
                    flexShrink: 0, marginTop: 2,
                  }}>
                    {q.channel}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--s900)' }}>{q.name}</span>
                      <span className={STATUS_BADGE[q.status]}>{STATUS_LABEL[q.status]}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--s500)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {q.content}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--s400)', flexShrink: 0, paddingTop: 2 }}>{q.time}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 그리드 2: AEO 현황 + LINE 자동상담 */}
        <div className="grid2" style={{ alignItems: 'start' }}>

          {/* AEO 인용 현황 */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">🧠 AEO 인용 현황 (일본어)</div>
              <Link href="/site/seo" className="see-all">상세 보기</Link>
            </div>
            <div
              style={{
                fontSize: 12, color: 'var(--s500)',
                padding: '8px 12px', borderRadius: 8,
                background: 'var(--s50)',
                marginBottom: 14,
              }}
            >
              AI 검색엔진(Perplexity·ChatGPT)이 우리 병원을 답변에 인용하는 횟수입니다.
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>검색 키워드</th>
                  <th style={{ textAlign: 'right' }}>인용</th>
                  <th style={{ textAlign: 'right' }}>변화</th>
                </tr>
              </thead>
              <tbody>
                {AEO_TOP.map(a => (
                  <tr key={a.query}>
                    <td style={{ fontSize: 12 }}>{a.query}</td>
                    <td style={{ fontWeight: 700, textAlign: 'right' }}>{a.cited}회</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      <span className={a.change >= 0 ? 'up' : 'down'}>
                        {a.change >= 0 ? `+${a.change}` : a.change}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* LINE 자동상담 */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">🤖 LINE 자동상담</div>
              <Link href="/line" className="see-all">관리하기</Link>
            </div>

            {/* 상태 표시 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px', borderRadius: 10,
              background: LINE_BOT.status === 'on' ? '#D1FAE5' : 'var(--s100)',
              marginBottom: 16,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: LINE_BOT.status === 'on' ? '#16A34A' : 'var(--s400)',
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: LINE_BOT.status === 'on' ? '#065F46' : 'var(--s500)' }}>
                {LINE_BOT.status === 'on' ? '자동상담 가동 중' : '자동상담 꺼짐'}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#16A34A' }}>
                자동 처리율 {LINE_BOT.autoRate}%
              </span>
            </div>

            {/* 오늘 통계 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: '12px', background: 'var(--s50)', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)' }}>{LINE_BOT.todayCount}</div>
                <div style={{ fontSize: 11, color: 'var(--s500)', marginTop: 4 }}>오늘 메시지 수</div>
              </div>
              <div style={{ padding: '12px', background: LINE_BOT.pending > 0 ? 'var(--red-l)' : 'var(--s50)', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: LINE_BOT.pending > 0 ? 'var(--red)' : 'var(--navy)' }}>
                  {LINE_BOT.pending}
                </div>
                <div style={{ fontSize: 11, color: 'var(--s500)', marginTop: 4 }}>수동 처리 필요</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
