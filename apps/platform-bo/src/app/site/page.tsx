import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import { HOSPITALS, STATUS_BADGE, STATUS_LABEL } from '@/lib/mock-data'

export default function SitePage() {
  const liveSites = HOSPITALS.filter(h => h.status === 'active')

  return (
    <>
      <PageHeader title="사이트 관리" />
      <div className="content fade">

        {/* 상태 요약 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: '🌐 운영 중 사이트', value: liveSites.length, unit: '개' },
            { label: '📝 수정 대기',       value: 2,               unit: '건' },
            { label: '⚠ 컴플라이언스 이슈', value: 3,               unit: '건' },
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
                <th>사이트 URL</th>
                <th>플랜</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {liveSites.map(h => (
                <tr key={h.id}>
                  <td style={{ fontWeight: 600 }}>{h.name}</td>
                  <td style={{ fontSize: 12, color: 'var(--blue)' }}>{h.url}</td>
                  <td>{h.plan}</td>
                  <td><span className={STATUS_BADGE[h.status]}>{STATUS_LABEL[h.status]}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link href={`/hospitals/${h.id}`} className="btn btn-sm">상세</Link>
                      <a href={`https://${h.url}`} target="_blank" rel="noreferrer" className="btn btn-sm">🔗 방문</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
