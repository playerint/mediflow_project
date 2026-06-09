import {
  MARKETING_KPI,
  AEO_KEYWORDS,
  SEO_KEYWORDS,
  LINE_CHANNEL_STATS,
} from '@/lib/mock-data'

export default function MarketingPage() {
  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">📣 마케팅 현황</span>
        </div>
        <div className="topbar-right">
          <span style={{ fontSize: 12, color: 'var(--s400)' }}>2026년 6월 기준</span>
        </div>
      </div>

      <div className="content">
        {/* KPI */}
        <div className="kpi-grid" style={{ marginBottom: 20 }}>
          {MARKETING_KPI.map((k) => (
            <div key={k.label} className="kpi-card">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">
                {k.value.toLocaleString()}
                <span className="kpi-unit">{k.unit}</span>
              </div>
              <div className={`kpi-delta ${k.up ? 'up' : 'down'}`}>{k.delta}</div>
            </div>
          ))}
        </div>

        <div className="grid2" style={{ alignItems: 'start' }}>
          {/* AEO 인용 현황 */}
          <div className="card">
            <div className="card-head">
              <span className="card-title">🧠 AEO 인용 키워드</span>
              <span style={{ fontSize: 11, color: 'var(--s400)' }}>AI 검색 인용 횟수</span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>키워드</th>
                  <th style={{ textAlign: 'right' }}>인용</th>
                  <th style={{ textAlign: 'right' }}>증감</th>
                  <th>출처</th>
                </tr>
              </thead>
              <tbody>
                {AEO_KEYWORDS.map((k) => (
                  <tr key={k.keyword}>
                    <td style={{ fontSize: 12 }}>{k.keyword}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--navy)' }}>
                      {k.citations}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={k.delta > 0 ? 'up' : k.delta < 0 ? 'down' : ''}>
                        {k.delta > 0 ? `+${k.delta}` : k.delta}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--s400)' }}>{k.topQuery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SEO 키워드 순위 */}
          <div className="card">
            <div className="card-head">
              <span className="card-title">🔍 SEO 키워드 순위</span>
              <span style={{ fontSize: 11, color: 'var(--s400)' }}>Google Japan 기준</span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>키워드</th>
                  <th style={{ textAlign: 'center' }}>순위</th>
                  <th style={{ textAlign: 'center' }}>전주</th>
                  <th style={{ textAlign: 'right' }}>월 검색</th>
                </tr>
              </thead>
              <tbody>
                {SEO_KEYWORDS.map((k) => {
                  const improved = k.rank < k.prevRank
                  const worsened = k.rank > k.prevRank
                  return (
                    <tr key={k.keyword}>
                      <td style={{ fontSize: 12 }}>{k.keyword}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, color: k.rank <= 5 ? 'var(--navy)' : 'var(--s700)' }}>
                          {k.rank}위
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontSize: 12 }}>
                        <span className={improved ? 'up' : worsened ? 'down' : ''}>
                          {improved ? `↑ ${k.prevRank - k.rank}` : worsened ? `↓ ${k.rank - k.prevRank}` : '–'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontSize: 12, color: 'var(--s400)' }}>
                        {k.volume.toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* LINE 채널 현황 */}
        <div className="card">
          <div className="card-head">
            <span className="card-title">📱 LINE 채널 현황</span>
            <a href="/line" className="see-all">자동상담 관리 →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <Stat label="팔로워" value={LINE_CHANNEL_STATS.followers} unit="명" />
            <Stat label="이번 달 신규" value={LINE_CHANNEL_STATS.newThisMonth} unit="명" color="#16A34A" />
            <Stat label="브로드캐스트 발송" value={LINE_CHANNEL_STATS.broadcastSent} unit="회" />
            <Stat label="오픈율" value={LINE_CHANNEL_STATS.broadcastOpenRate} unit="%" color="var(--blue)" />
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', marginBottom: 10 }}>
              친구 추가 경로
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LINE_CHANNEL_STATS.friendAdRoute.map((r) => (
                <div key={r.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--s700)' }}>{r.label}</span>
                    <span style={{ fontWeight: 600 }}>{r.pct}%</span>
                  </div>
                  <div className="prog-track">
                    <div className="prog-fill pf-blue" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function Stat({ label, value, unit, color }: { label: string; value: number; unit: string; color?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '12px 0' }}>
      <div style={{ fontSize: 11, color: 'var(--s400)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color ?? 'var(--navy)' }}>
        {value.toLocaleString()}<span style={{ fontSize: 13, fontWeight: 500, color: 'var(--s400)', marginLeft: 3 }}>{unit}</span>
      </div>
    </div>
  )
}
