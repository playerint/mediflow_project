import PageHeader from '@/components/PageHeader'
import { HOSPITALS, PLAN_BADGE } from '@/lib/mock-data'

const PLAN_PRICE: Record<string, number> = { Basic: 490000, Pro: 980000, Enterprise: 2500000 }

const BILLING_ROWS = [
  { month: '2026-06', paid: true  },
  { month: '2026-05', paid: true  },
  { month: '2026-04', paid: true  },
]

export default function BillingPage() {
  const active = HOSPITALS.filter(h => h.status === 'active')
  const monthlyRevenue = active.reduce((s, h) => s + (PLAN_PRICE[h.plan] ?? 0), 0)
  const unpaidCount = 2

  return (
    <>
      <PageHeader title="결제 관리" />
      <div className="content fade">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: '💳 이번 달 예상 매출', value: `${(monthlyRevenue / 1000000).toFixed(1)}M`, unit: '₩' },
            { label: '❌ 미납',             value: unpaidCount, unit: '건' },
            { label: '🏥 청구 병원 수',      value: active.length, unit: '개' },
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
                <th>플랜</th>
                <th style={{ textAlign: 'right' }}>월 청구액</th>
                <th>6월 납부</th>
                <th>5월 납부</th>
                <th>4월 납부</th>
              </tr>
            </thead>
            <tbody>
              {active.map((h, idx) => {
                const price = PLAN_PRICE[h.plan] ?? 0
                const paid6 = idx !== 3 && idx !== 7
                const paid5 = true
                return (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 600 }}>{h.name}</td>
                    <td><span className={PLAN_BADGE[h.plan]}>{h.plan}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      ₩{price.toLocaleString()}
                    </td>
                    {[paid6, paid5, true].map((ok, i) => (
                      <td key={i}>
                        <span className={ok ? 'badge bdg-green' : 'badge bdg-red'}>
                          {ok ? '납부' : '미납'}
                        </span>
                      </td>
                    ))}
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
