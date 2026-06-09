'use client'

import { useState, useEffect } from 'react'
import PageHeader from '@/components/PageHeader'
import { getHospitals, type HospitalDto } from '@/lib/api'

export default function ReportsPage() {
  const [hospitals, setHospitals] = useState<HospitalDto[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    getHospitals('active').then(setHospitals).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader title="리포트" />
      <div className="content fade">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: '전체 문의 합계',   value: '-',   unit: '건' },
            { label: '전체 AEO 인용',    value: '-',   unit: '회' },
            { label: 'LINE 팔로워 합계', value: '-',   unit: '' },
            { label: '이번 달 매출',     value: loading ? '…' : `${(hospitals.reduce((s, h) => {
                const prices: Record<string, number> = { Basic: 490000, Pro: 980000, Enterprise: 2500000 }
                return s + (prices[h.plan] ?? 0)
              }, 0) / 1000000).toFixed(1)}M`,
              unit: '₩' },
          ].map(k => (
            <div key={k.label} className="kpi-card">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}<span className="kpi-unit">{k.unit}</span></div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-head">
            <div className="card-title">병원별 성과 요약</div>
            <button className="btn btn-sm">CSV 다운로드</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>병원명</th>
                <th>플랜</th>
                <th>담당자</th>
                <th style={{ textAlign: 'right' }}>AEO 인용</th>
                <th style={{ textAlign: 'right' }}>전월 대비</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--s400)' }}>로딩 중…</td></tr>
              )}
              {!loading && hospitals.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--s400)' }}>데이터 없음</td></tr>
              )}
              {hospitals.map((h, i) => {
                const delta = [+31, +18, -4, +12, +7, -8][i] ?? 0
                const aeo   = [58, 94, 44, 31, 22, 0][i] ?? 0
                return (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 600 }}>{h.nameKr}</td>
                    <td style={{ fontSize: 12 }}>{h.plan}</td>
                    <td style={{ fontSize: 12, color: 'var(--s500)' }}>{h.managerName}</td>
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

        <div className="grid2">
          {['월별 문의 추이', 'AEO 인용 추이'].map(title => (
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
