'use client'

import { useState, useEffect } from 'react'
import {
  getMarketingStats,
  type MarketingStatsDto,
} from '@/lib/api'
import {
  MARKETING_KPI,
  AEO_KEYWORDS,
  SEO_KEYWORDS,
  LINE_CHANNEL_STATS,
} from '@/lib/mock-data'

export default function MarketingPage() {
  const [stats,   setStats]   = useState<MarketingStatsDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    async function loadStats() {
      try {
        setStats(await getMarketingStats())
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : '마케팅 통계 조회 오류')
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  // 실API 데이터가 있으면 KPI 대체, 없으면 mock 유지
  const kpis = stats
    ? [
        { label: '📣 총 리드',          value: stats.totalLeads,    unit: '건', delta: '',         up: true },
        ...stats.channels.map(c => ({
          label:  `📡 ${c.name}`,
          value:  c.leads,
          unit:  '건',
          delta: `전환율 ${c.rate.toFixed(1)}%`,
          up:    c.rate >= 25,
        })),
      ]
    : MARKETING_KPI

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">📣 마케팅 현황</span>
        </div>
        <div className="topbar-right">
          <span style={{ fontSize: 12, color: 'var(--s400)' }}>2026년 6월 기준</span>
        </div>
      </div>

      <div className="content">
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--rl)', padding: '10px 16px', marginBottom: 14, fontSize: 13, color: '#DC2626' }}>
            ⚠ {error} — 임시 데이터를 표시합니다.
          </div>
        )}

        {/* KPI */}
        <div className="kpi-grid" style={{ marginBottom: 20 }}>
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--s400)', fontSize: 13, padding: '20px 0' }}>
              통계 로딩 중...
            </div>
          ) : (
            kpis.map((k) => (
              <div key={k.label} className="kpi-card">
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value">
                  {k.value.toLocaleString()}
                  <span className="kpi-unit">{k.unit}</span>
                </div>
                {k.delta && <div className={`kpi-delta ${k.up ? 'up' : 'down'}`}>{k.delta}</div>}
              </div>
            ))
          )}
        </div>

        {/* 월별 트렌드 (실API 있을 때) */}
        {stats && stats.monthlyTrend.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-head">
              <span className="card-title">📈 월별 리드 추이</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100, padding: '0 4px' }}>
              {stats.monthlyTrend.map(m => {
                const maxLeads = Math.max(...stats.monthlyTrend.map(x => x.leads), 1)
                const h = (m.leads / maxLeads) * 80
                return (
                  <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div style={{ width: 14, height: h, background: 'var(--navy)', borderRadius: '3px 3px 0 0' }} title={`${m.leads}건`} />
                    <div style={{ fontSize: 10, color: 'var(--s400)' }}>{m.month.slice(5)}월</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid2" style={{ alignItems: 'start' }}>
          {/* AEO 인용 현황 */}
          <div className="card">
            <div className="card-head">
              <span className="card-title">🧠 AEO 인용 키워드</span>
              <span style={{ fontSize: 11, color: 'var(--s400)' }}>AI 검색 인용 횟수</span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>키워드</th>
                  <th style={{ textAlign: 'right' }}>인용</th>
                  <th style={{ textAlign: 'right' }}>증감</th>
                  <th>출처</th>
                </tr>
              </thead>
              <tbody>
                {AEO_KEYWORDS.map((k) => (
                  <tr key={k.keyword}>
                    <td style={{ fontSize: 12 }}>{k.keyword}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--navy)' }}>
                      {k.citations}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={k.delta > 0 ? 'up' : k.delta < 0 ? 'down' : ''}>
                        {k.delta > 0 ? `+${k.delta}` : k.delta}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--s400)' }}>{k.topQuery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SEO 키워드 순위 */}
          <div className="card">
            <div className="card-head">
              <span className="card-title">🔍 SEO 키워드 순위</span>
              <span style={{ fontSize: 11, color: 'var(--s400)' }}>Google Japan 기준</span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>키워드</th>
                  <th style={{ textAlign: 'center' }}>순위</th>
                  <th style={{ textAlign: 'center' }}>전주</th>
                  <th style={{ textAlign: 'right' }}>월 검색</th>
                </tr>
              </thead>
              <tbody>
                {SEO_KEYWORDS.map((k) => {
                  const improved = k.rank < k.prevRank
                  const worsened = k.rank > k.prevRank
                  return (
                    <tr key={k.keyword}>
                      <td style={{ fontSize: 12 }}>{k.keyword}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, color: k.rank <= 5 ? 'var(--navy)' : 'var(--s700)' }}>
                          {k.rank}위
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontSize: 12 }}>
                        <span className={improved ? 'up' : worsened ? 'down' : ''}>
                          {improved ? `↑ ${k.prevRank - k.rank}` : worsened ? `↓ ${k.rank - k.prevRank}` : '–'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontSize: 12, color: 'var(--s400)' }}>
                        {k.volume.toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* LINE 채널 현황 */}
        <div className="card">
          <div className="card-head">
            <span className="card-title">📱 LINE 채널 현황</span>
            <a href="/line" className="see-all">자동상담 관리 →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <Stat label="팔로워" value={LINE_CHANNEL_STATS.followers} unit="명" />
            <Stat label="이번 달 신규" value={LINE_CHANNEL_STATS.newThisMonth} unit="명" color="#16A34A" />
            <Stat label="브로드캐스트 발송" value={LINE_CHANNEL_STATS.broadcastSent} unit="회" />
            <Stat label="오픈율" value={LINE_CHANNEL_STATS.broadcastOpenRate} unit="%" color="var(--blue)" />
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', marginBottom: 10 }}>
              친구 추가 경로
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LINE_CHANNEL_STATS.friendAdRoute.map((r) => (
                <div key={r.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--s700)' }}>{r.label}</span>
                    <span style={{ fontWeight: 600 }}>{r.pct}%</span>
                  </div>
                  <div className="prog-track">
                    <div className="prog-fill pf-blue" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function Stat({ label, value, unit, color }: { label: string; value: number; unit: string; color?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '12px 0' }}>
      <div style={{ fontSize: 11, color: 'var(--s400)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color ?? 'var(--navy)' }}>
        {value.toLocaleString()}<span style={{ fontSize: 13, fontWeight: 500, color: 'var(--s400)', marginLeft: 3 }}>{unit}</span>
      </div>
    </div>
  )
}
