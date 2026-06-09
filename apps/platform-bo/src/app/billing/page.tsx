'use client'

import { useState, useEffect } from 'react'
import PageHeader from '@/components/PageHeader'
import { getHospitals, type HospitalDto } from '@/lib/api'

const PLAN_PRICE: Record<string, number> = { Basic: 490000, Pro: 980000, Enterprise: 2500000 }
const PLAN_BADGE: Record<string, string> = { Enterprise: 'badge bdg-blue', Pro: 'badge bdg-navy', Basic: 'badge bdg-gray' }

export default function BillingPage() {
  const [hospitals, setHospitals] = useState<HospitalDto[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    getHospitals('active').then(setHospitals).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const monthlyRevenue = hospitals.reduce((s, h) => s + (PLAN_PRICE[h.plan] ?? 0), 0)

  return (
    <>
      <PageHeader title="결제 관리" />
      <div className="content fade">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: '이번 달 예상 매출', value: loading ? '…' : `${(monthlyRevenue / 1000000).toFixed(1)}M`, unit: '₩' },
            { label: '미납',             value: loading ? '…' : 0, unit: '건' },
            { label: '청구 병원 수',      value: loading ? '…' : hospitals.length, unit: '개' },
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
              {loading && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--s400)' }}>로딩 중…</td></tr>
              )}
              {!loading && hospitals.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--s400)' }}>운영 중인 병원이 없습니다</td></tr>
              )}
              {hospitals.map((h, idx) => {
                const price = PLAN_PRICE[h.plan] ?? 0
                const paid6 = idx !== 3 && idx !== 7
                return (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 600 }}>{h.nameKr}</td>
                    <td><span className={PLAN_BADGE[h.plan] ?? 'badge'}>{h.plan}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>₩{price.toLocaleString()}</td>
                    {[paid6, true, true].map((ok, i) => (
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
