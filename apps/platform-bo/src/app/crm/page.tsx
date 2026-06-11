'use client'

import { useState, useEffect } from 'react'
import PageHeader from '@/components/PageHeader'
import { getPlatformCrmStats, HospitalCrmSummaryDto } from '@/lib/api'

export default function CrmPage() {
  const [data, setData] = useState<HospitalCrmSummaryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPlatformCrmStats()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const totalNew     = data.reduce((s, r) => s + r.newCount,     0)
  const totalPending = data.reduce((s, r) => s + r.pendingCount, 0)

  return (
    <>
      <PageHeader title="CRM 관리" />
      <div className="content fade">

        {loading && (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--s500)' }}>
            로딩 중...
          </div>
        )}

        {error && (
          <div style={{ padding: '12px 16px', background: '#FEF2F2', borderRadius: 10, color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>
            데이터를 불러오지 못했습니다: {error}
          </div>
        )}

        {!loading && !error && (
          <>
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
                  {data.map(r => (
                    <tr key={r.hospitalId}>
                      <td style={{ fontWeight: 600 }}>{r.hospitalName}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="badge bdg-red">{r.newCount}건</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="badge bdg-blue">{r.pendingCount}건</span>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--s500)' }}>{r.repliedCount}건</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{r.newCount + r.pendingCount + r.repliedCount}건</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--s50)', borderRadius: 10, fontSize: 13, color: 'var(--s500)' }}>
              각 병원의 상세 CRM은 병원용 BO(hospital-bo)에서 관리합니다. 여기서는 전체 현황만 조회합니다.
            </div>
          </>
        )}
      </div>
    </>
  )
}
