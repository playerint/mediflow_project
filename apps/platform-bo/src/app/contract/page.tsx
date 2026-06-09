import PageHeader from '@/components/PageHeader'
import Link from 'next/link'
import { HOSPITALS, PLAN_BADGE } from '@/lib/mock-data'

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

export default function ContractPage() {
  const active = HOSPITALS.filter(h => h.status === 'active')
  const expiringSoon = active.filter(h => h.expire !== '-' && daysUntil(h.expire) <= 30)
  const expiring90   = active.filter(h => h.expire !== '-' && daysUntil(h.expire) <= 90)

  return (
    <>
      <PageHeader title="계약 관리">
        <button className="btn btn-primary">+ 계약 등록</button>
      </PageHeader>
      <div className="content fade">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: '📋 전체 계약',    value: active.length,       unit: '건' },
            { label: '⚠ 30일 내 만료',  value: expiringSoon.length, unit: '건' },
            { label: '📆 90일 내 만료', value: expiring90.length,   unit: '건' },
          ].map(k => (
            <div key={k.label} className="kpi-card">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}<span className="kpi-unit">{k.unit}</span></div>
            </div>
          ))}
        </div>

        {expiringSoon.length > 0 && (
          <div style={{ padding: '12px 16px', background: 'var(--red-l)', border: '1px solid #FCA5A5', borderRadius: 10, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>⚠</span>
            <span style={{ fontSize: 13, color: 'var(--red)', fontWeight: 600 }}>
              {expiringSoon.map(h => h.name).join(', ')} — 30일 이내 계약 만료 예정
            </span>
          </div>
        )}

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>병원명</th>
                <th>플랜</th>
                <th>담당자</th>
                <th>만료일</th>
                <th>잔여</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {active
                .sort((a, b) => new Date(a.expire).getTime() - new Date(b.expire).getTime())
                .map(h => {
                  const days = daysUntil(h.expire)
                  const urgent = days <= 30
                  return (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 600 }}>
                        <Link href={`/hospitals/${h.id}`} style={{ color: 'var(--s900)' }}>{h.name}</Link>
                      </td>
                      <td><span className={PLAN_BADGE[h.plan]}>{h.plan}</span></td>
                      <td style={{ color: 'var(--s500)', fontSize: 12 }}>{h.manager}</td>
                      <td style={{ fontSize: 13 }}>{h.expire}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: urgent ? 'var(--red)' : 'var(--s700)' }}>
                          D-{days}
                        </span>
                      </td>
                      <td>
                        <Link href={`/hospitals/${h.id}`} className="btn btn-sm">상세</Link>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
