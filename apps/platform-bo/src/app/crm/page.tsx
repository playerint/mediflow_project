import PageHeader from '@/components/PageHeader'
import { HOSPITALS } from '@/lib/mock-data'

const CRM_SUMMARY = [
  { id: 1, name: '올래성형외과',    new: 7,  pending: 2, replied: 14 },
  { id: 3, name: '청담미래성형외과', new: 12, pending: 4, replied: 15 },
  { id: 2, name: '강남뷰티클리닉',  new: 5,  pending: 3, replied: 10 },
  { id: 5, name: '신사라인성형외과', new: 3,  pending: 1, replied: 10 },
  { id: 8, name: '논현더플러스',    new: 4,  pending: 1, replied: 11 },
]

export default function CrmPage() {
  const totalNew = CRM_SUMMARY.reduce((s, r) => s + r.new, 0)
  const totalPending = CRM_SUMMARY.reduce((s, r) => s + r.pending, 0)

  return (
    <>
      <PageHeader title="CRM 관리" />
      <div className="content fade">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: '💬 전체 병원 미답변', value: totalNew,     unit: '건' },
            { label: '⏳ 처리 중',          value: totalPending, unit: '건' },
            { label: '⚠ 48h 초과',          value: 1,            unit: '건' },
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
                <th style={{ textAlign: 'right' }}>미답변</th>
                <th style={{ textAlign: 'right' }}>처리 중</th>
                <th style={{ textAlign: 'right' }}>답변 완료</th>
                <th style={{ textAlign: 'right' }}>합계</th>
              </tr>
            </thead>
            <tbody>
              {CRM_SUMMARY.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="badge bdg-red">{r.new}건</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="badge bdg-blue">{r.pending}건</span>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--s500)' }}>{r.replied}건</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{r.new + r.pending + r.replied}건</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--s50)', borderRadius: 10, fontSize: 13, color: 'var(--s500)' }}>
          각 병원의 상세 CRM은 병원용 BO(hospital-bo)에서 관리합니다. 여기서는 전체 현황만 조회합니다.
        </div>
      </div>
    </>
  )
}
