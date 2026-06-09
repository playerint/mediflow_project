'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import { getHospitals, type HospitalDto } from '@/lib/api'

const STATUS_BADGE: Record<string, string>  = { active: 'badge bdg-navy', onboarding: 'badge bdg-blue', paused: 'badge bdg-gray' }
const STATUS_LABEL: Record<string, string>  = { active: '운영 중', onboarding: '온보딩', paused: '일시정지' }

export default function SitePage() {
  const [hospitals, setHospitals] = useState<HospitalDto[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    getHospitals('active').then(setHospitals).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader title="사이트 관리" />
      <div className="content fade">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: '운영 중 사이트',    value: loading ? '…' : hospitals.length, unit: '개' },
            { label: '수정 대기',         value: 2,                                unit: '건' },
            { label: '컴플라이언스 이슈', value: 3,                                unit: '건' },
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
              {loading && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--s400)' }}>로딩 중…</td></tr>
              )}
              {!loading && hospitals.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--s400)' }}>운영 중인 사이트가 없습니다</td></tr>
              )}
              {hospitals.map(h => (
                <tr key={h.id}>
                  <td style={{ fontWeight: 600 }}>{h.nameKr}</td>
                  <td style={{ fontSize: 12, color: 'var(--blue)' }}>
                    {h.siteUrl ?? <span style={{ color: 'var(--s300)' }}>미설정</span>}
                  </td>
                  <td>{h.plan}</td>
                  <td><span className={STATUS_BADGE[h.status] ?? 'badge'}>{STATUS_LABEL[h.status] ?? h.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link href={`/hospitals/${h.id}`} className="btn btn-sm">상세</Link>
                      {h.siteUrl && (
                        <a href={h.siteUrl} target="_blank" rel="noreferrer" className="btn btn-sm">🔗 방문</a>
                      )}
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
