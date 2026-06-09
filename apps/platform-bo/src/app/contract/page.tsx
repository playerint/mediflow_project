'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import { getHospitals, type HospitalDto } from '@/lib/api'

const PLAN_BADGE: Record<string, string> = { Enterprise: 'badge bdg-blue', Pro: 'badge bdg-navy', Basic: 'badge bdg-gray' }

function daysUntil(dateStr: string | null): number {
  if (!dateStr) return 9999
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

export default function ContractPage() {
  const [hospitals, setHospitals] = useState<HospitalDto[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    getHospitals('active').then(setHospitals).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const expiringSoon = hospitals.filter(h => daysUntil(h.contractExpire) <= 30)
  const expiring90   = hospitals.filter(h => daysUntil(h.contractExpire) <= 90)

  return (
    <>
      <PageHeader title="계약 관리">
        <button className="btn btn-primary">+ 계약 등록</button>
      </PageHeader>
      <div className="content fade">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: '전체 계약',    value: loading ? '…' : hospitals.length,       unit: '건' },
            { label: '30일 내 만료', value: loading ? '…' : expiringSoon.length, unit: '건' },
            { label: '90일 내 만료', value: loading ? '…' : expiring90.length,   unit: '건' },
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
              {expiringSoon.map(h => h.nameKr).join(', ')} — 30일 이내 계약 만료 예정
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
              {loading && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--s400)' }}>로딩 중…</td></tr>
              )}
              {!loading && hospitals.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--s400)' }}>운영 중인 병원이 없습니다</td></tr>
              )}
              {[...hospitals]
                .sort((a, b) => daysUntil(a.contractExpire) - daysUntil(b.contractExpire))
                .map(h => {
                  const days   = daysUntil(h.contractExpire)
                  const urgent = days <= 30
                  return (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 600 }}>
                        <Link href={`/hospitals/${h.id}`} style={{ color: 'var(--s900)' }}>{h.nameKr}</Link>
                      </td>
                      <td><span className={PLAN_BADGE[h.plan] ?? 'badge'}>{h.plan}</span></td>
                      <td style={{ color: 'var(--s500)', fontSize: 12 }}>{h.managerName}</td>
                      <td style={{ fontSize: 13 }}>{h.contractExpire ?? '-'}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: urgent ? 'var(--red)' : 'var(--s700)' }}>
                          {days >= 9999 ? '-' : `D-${days}`}
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
