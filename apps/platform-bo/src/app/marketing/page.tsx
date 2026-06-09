import PageHeader from '@/components/PageHeader'
import { HOSPITALS } from '@/lib/mock-data'

const MARKETING_DATA = [
  { id: 1, name: '올래성형외과',    aeo: 58,  seoScore: 82, lineFollower: 1240, aeoUp: 11 },
  { id: 3, name: '청담미래성형외과', aeo: 94,  seoScore: 91, lineFollower: 3100, aeoUp: 23 },
  { id: 2, name: '강남뷰티클리닉',  aeo: 44,  seoScore: 76, lineFollower: 890,  aeoUp: 7  },
  { id: 5, name: '신사라인성형외과', aeo: 31,  seoScore: 68, lineFollower: 560,  aeoUp: 4  },
  { id: 8, name: '논현더플러스',    aeo: 22,  seoScore: 60, lineFollower: 420,  aeoUp: -2 },
]

export default function MarketingPage() {
  const totalAeo = MARKETING_DATA.reduce((s, r) => s + r.aeo, 0)

  return (
    <>
      <PageHeader title="마케팅 관리" />
      <div className="content fade">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: '🧠 전체 AEO 인용 합계', value: totalAeo, unit: '회' },
            { label: '📣 LINE 팔로워 합계',   value: '6.2',    unit: 'K' },
            { label: '🔍 평균 SEO 점수',       value: 75,       unit: '점' },
          ].map(k => (
            <div key={k.label} className="kpi-card">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}<span className="kpi-unit">{k.unit}</span></div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>병원명</th>
                <th style={{ textAlign: 'right' }}>AEO 인용</th>
                <th style={{ textAlign: 'right' }}>이번 주 변화</th>
                <th style={{ textAlign: 'right' }}>SEO 점수</th>
                <th style={{ textAlign: 'right' }}>LINE 팔로워</th>
              </tr>
            </thead>
            <tbody>
              {MARKETING_DATA.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{r.aeo}회</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    <span style={{ color: r.aeoUp >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {r.aeoUp >= 0 ? '+' : ''}{r.aeoUp}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={r.seoScore >= 80 ? 'badge bdg-green' : r.seoScore >= 70 ? 'badge bdg-blue' : 'badge bdg-gray'}>
                      {r.seoScore}점
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--s700)' }}>{r.lineFollower.toLocaleString()}명</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
