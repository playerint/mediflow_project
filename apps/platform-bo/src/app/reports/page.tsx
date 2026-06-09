import PageHeader from '@/components/PageHeader'
import { HOSPITALS } from '@/lib/mock-data'

export default function ReportsPage() {
  const active = HOSPITALS.filter(h => h.status === 'active')
  const totalInq = active.reduce((s, h) => s + h.inq, 0)

  return (
    <>
      <PageHeader title="리포트" />
      <div className="content fade">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: '📊 전체 문의 합계',    value: totalInq,       unit: '건' },
            { label: '🧠 전체 AEO 인용',     value: 249,            unit: '회' },
            { label: '📣 LINE 팔로워 합계',  value: '6.2K',         unit: '' },
            { label: '💳 이번 달 매출',      value: '8.4M',         unit: '₩' },
          ].map(k => (
            <div key={k.label} className="kpi-card">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}<span className="kpi-unit">{k.unit}</span></div>
            </div>
          ))}
        </div>

        {/* 병원별 성과 요약 */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-head">
            <div className="card-title">📊 병원별 6월 성과 요약</div>
            <button className="btn btn-sm">CSV 다운로드</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>병원명</th>
                <th style={{ textAlign: 'right' }}>이번 달 문의</th>
                <th style={{ textAlign: 'right' }}>AEO 인용</th>
                <th style={{ textAlign: 'right' }}>전월 대비</th>
              </tr>
            </thead>
            <tbody>
              {active.slice(0,6).map((h, i) => {
                const delta = [+31, +18, -4, +12, +7, -8][i] ?? 0
                const aeo   = [58, 94, 44, 31, 22, 0][i] ?? 0
                return (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 600 }}>{h.name}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{h.inq}건</td>
                    <td style={{ textAlign: 'right' }}>{aeo}회</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      <span style={{ color: delta >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {delta >= 0 ? '+' : ''}{delta}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* 차트 자리 */}
        <div className="grid2">
          {['📈 월별 문의 추이', '🧠 AEO 인용 추이'].map(title => (
            <div key={title} className="card" style={{ minHeight: 200, display: 'flex', flexDirection: 'column' }}>
              <div className="card-head">
                <div className="card-title">{title}</div>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--s300)', fontSize: 13 }}>
                차트 라이브러리 연동 후 표시됩니다
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
