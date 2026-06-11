'use client'

import { useState, useEffect } from 'react'
import PageHeader from '@/components/PageHeader'
import {
  getPlatformMarketingStats,
  type HospitalMarketingStatsDto,
} from '@/lib/api'

export default function MarketingPage() {
  const [data,    setData]    = useState<HospitalMarketingStatsDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    async function loadStats() {
      try {
        setData(await getPlatformMarketingStats())
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : '마케팅 통계 조회 오류')
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const totalAeo       = data.reduce((s, r) => s + r.aeoScore, 0)
  const totalFollowers = data.reduce((s, r) => s + r.lineFollowers, 0)
  const avgSeo         = data.length
    ? Math.round(data.reduce((s, r) => s + r.seoScore, 0) / data.length)
    : 0

  return (
    <>
      <PageHeader title="마케팅 관리" />
      <div className="content fade">

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--rl)', padding: '10px 16px', marginBottom: 14, fontSize: 13, color: '#DC2626' }}>
            ⚠ {error} — 임시 데이터를 표시합니다.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: '🧠 전체 AEO 인용 합계', value: totalAeo,                          unit: '회' },
            { label: '📣 LINE 팔로워 합계',   value: (totalFollowers / 1000).toFixed(1), unit: 'K' },
            { label: '🔍 평균 SEO 점수',       value: avgSeo,                             unit: '점' },
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
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--s400)', fontSize: 13, padding: '20px 0' }}>
                    통계 로딩 중...
                  </td>
                </tr>
              ) : data.length === 0 && !error ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--s400)', fontSize: 13, padding: '20px 0' }}>
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                data.map(r => (
                  <tr key={r.hospitalId}>
                    <td style={{ fontWeight: 600 }}>{r.hospitalName}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{r.aeoScore}회</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      <span style={{ color: r.aeoWeeklyChange >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {r.aeoWeeklyChange >= 0 ? '+' : ''}{r.aeoWeeklyChange}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={r.seoScore >= 80 ? 'badge bdg-green' : r.seoScore >= 70 ? 'badge bdg-blue' : 'badge bdg-gray'}>
                        {r.seoScore}점
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--s700)' }}>{r.lineFollowers.toLocaleString()}명</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
