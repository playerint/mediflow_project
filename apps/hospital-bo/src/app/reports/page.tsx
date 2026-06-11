'use client'

import { useState, useEffect } from 'react'
import { getReportSummary, type ReportSummaryDto } from '@/lib/api'
import { MONTHLY_KPI, CHANNEL_STATS } from '@/lib/mock-data'

// mock 기반 집계 (폴백용)
const PAST             = MONTHLY_KPI.slice(0, 5)
const mockTotalInq     = PAST.reduce((s, m) => s + m.inquiries, 0)
const mockTotalBkg     = PAST.reduce((s, m) => s + m.bookings, 0)
const mockTotalPat     = PAST.reduce((s, m) => s + m.newPatients, 0)
const mockTotalRev     = PAST.reduce((s, m) => s + m.revenue, 0)
const mockConvRate     = ((mockTotalBkg / mockTotalInq) * 100).toFixed(1)
const last             = MONTHLY_KPI[4]
const prev             = MONTHLY_KPI[3]
const delta = (a: number, b: number) => (((a - b) / b) * 100).toFixed(0)

export default function ReportsPage() {
  const [summary,  setSummary]  = useState<ReportSummaryDto | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    async function loadSummary() {
      try {
        setSummary(await getReportSummary())
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : '리포트 조회 오류')
      } finally {
        setLoading(false)
      }
    }
    loadSummary()
  }, [])

  // 실API가 있으면 사용, 없으면 mock 집계값
  const totalInq  = summary?.consultations ?? mockTotalInq
  const totalBkg  = summary?.bookings      ?? mockTotalBkg
  const totalPat  = summary?.newPatients   ?? mockTotalPat
  const convRate  = summary ? summary.conversionRate.toFixed(1) : mockConvRate
  const period    = summary?.period ?? '2026년 1–5월 누적'

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">📊 리포트</span>
        </div>
        <div className="topbar-right">
          <span style={{ fontSize: 12, color: 'var(--s400)' }}>{period}</span>
          <button className="btn btn-sm">📥 내보내기</button>
        </div>
      </div>

      <div className="content">
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--rl)', padding: '10px 16px', marginBottom: 14, fontSize: 13, color: '#DC2626' }}>
            ⚠ {error} — 임시 데이터를 표시합니다.
          </div>
        )}

        {/* 누적 KPI */}
        <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 600, color: 'var(--s400)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
          {period}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--s400)', fontSize: 13, padding: '20px 0', marginBottom: 20 }}>
            리포트 로딩 중...
          </div>
        ) : (
          <div className="kpi-grid" style={{ marginBottom: 20 }}>
            <KpiCard label="💬 총 문의" value={totalInq} unit="건"
              delta={`전월 대비 ${Number(delta(last.inquiries, prev.inquiries)) > 0 ? '+' : ''}${delta(last.inquiries, prev.inquiries)}%`}
              up={last.inquiries >= prev.inquiries} />
            <KpiCard label="📅 총 예약" value={totalBkg} unit="건"
              delta={`전환율 ${convRate}%`} up={true} />
            <KpiCard label="👤 신규 환자" value={totalPat} unit="명"
              delta={`전월 대비 ${Number(delta(last.newPatients, prev.newPatients)) > 0 ? '+' : ''}${delta(last.newPatients, prev.newPatients)}%`}
              up={last.newPatients >= prev.newPatients} />
            <KpiCard label="💴 매출 (추정)" value={mockTotalRev} unit="만원"
              delta={`전월 대비 ${Number(delta(last.revenue, prev.revenue)) > 0 ? '+' : ''}${delta(last.revenue, prev.revenue)}%`}
              up={last.revenue >= prev.revenue} />
          </div>
        )}

        {/* 상위 시술 (실API 있을 때) */}
        {summary && summary.topProcedures.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-head">
              <span className="card-title">🏆 인기 시술</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {summary.topProcedures.map((p, i) => {
                const max = summary.topProcedures[0].count
                return (
                  <div key={p.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: 'var(--s700)' }}>{i + 1}. {p.name}</span>
                      <span style={{ fontWeight: 600 }}>{p.count}건</span>
                    </div>
                    <div className="prog-track">
                      <div className="prog-fill" style={{ width: `${(p.count / max) * 100}%`, background: 'var(--navy)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid2" style={{ alignItems: 'start' }}>
          {/* 월별 추이 */}
          <div className="card">
            <div className="card-head">
              <span className="card-title">📈 월별 문의·예약 추이</span>
            </div>

            {/* 막대 차트 (CSS 기반) */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, padding: '0 4px', marginBottom: 8 }}>
              {MONTHLY_KPI.map((m) => {
                const maxInq    = Math.max(...MONTHLY_KPI.map(x => x.inquiries))
                const inqH      = (m.inquiries / maxInq) * 120
                const bkgH      = (m.bookings  / maxInq) * 120
                const isCurrent = m.month === '2026-06'
                return (
                  <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 130 }}>
                      <div style={{
                        width: 14, height: inqH,
                        background: isCurrent ? 'var(--s200)' : 'var(--navy)',
                        borderRadius: '3px 3px 0 0',
                        opacity: isCurrent ? .6 : 1,
                      }} title={`문의 ${m.inquiries}`} />
                      <div style={{
                        width: 14, height: bkgH,
                        background: isCurrent ? 'var(--s300)' : 'var(--blue)',
                        borderRadius: '3px 3px 0 0',
                        opacity: isCurrent ? .6 : 1,
                      }} title={`예약 ${m.bookings}`} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--s400)' }}>
                      {m.month.slice(5)}월{isCurrent ? '*' : ''}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--s400)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--navy)', display: 'inline-block' }} />문의
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--blue)', display: 'inline-block' }} />예약
              </span>
              <span style={{ marginLeft: 'auto' }}>* 진행 중</span>
            </div>

            {/* 월별 수치 테이블 */}
            <div style={{ marginTop: 16, borderTop: '1px solid var(--s100)', paddingTop: 12 }}>
              <table className="table" style={{ fontSize: 12 }}>
                <thead>
                  <tr>
                    <th>월</th>
                    <th style={{ textAlign: 'right' }}>문의</th>
                    <th style={{ textAlign: 'right' }}>예약</th>
                    <th style={{ textAlign: 'right' }}>신환</th>
                    <th style={{ textAlign: 'right' }}>매출(만원)</th>
                  </tr>
                </thead>
                <tbody>
                  {MONTHLY_KPI.map((m) => (
                    <tr key={m.month} style={{ opacity: m.month === '2026-06' ? .55 : 1 }}>
                      <td>{m.month.slice(0, 7)}</td>
                      <td style={{ textAlign: 'right' }}>{m.inquiries}</td>
                      <td style={{ textAlign: 'right' }}>{m.bookings}</td>
                      <td style={{ textAlign: 'right' }}>{m.newPatients}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{m.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 채널별 성과 */}
          <div className="card">
            <div className="card-head">
              <span className="card-title">📡 채널별 성과</span>
              <span style={{ fontSize: 11, color: 'var(--s400)' }}>누적 1–5월</span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>채널</th>
                  <th style={{ textAlign: 'right' }}>문의</th>
                  <th style={{ textAlign: 'right' }}>예약</th>
                  <th style={{ textAlign: 'right' }}>전환율</th>
                </tr>
              </thead>
              <tbody>
                {CHANNEL_STATS.map((c) => (
                  <tr key={c.channel}>
                    <td>{c.channel}</td>
                    <td style={{ textAlign: 'right' }}>{c.inquiries}</td>
                    <td style={{ textAlign: 'right' }}>{c.bookings}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{
                        fontWeight: 700,
                        color: c.convRate >= 35 ? '#16A34A' : c.convRate >= 28 ? 'var(--navy)' : 'var(--s400)',
                      }}>
                        {c.convRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 채널 비중 막대 */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', marginBottom: 10 }}>
                채널별 문의 비중
              </div>
              {(() => {
                const total  = CHANNEL_STATS.reduce((s, c) => s + c.inquiries, 0)
                const colors = ['var(--navy)', 'var(--blue)', '#16A34A', 'var(--s300)']
                return CHANNEL_STATS.map((c, i) => (
                  <div key={c.channel} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                      <span style={{ color: 'var(--s700)' }}>{c.channel}</span>
                      <span style={{ fontWeight: 600 }}>{((c.inquiries / total) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="prog-track">
                      <div className="prog-fill" style={{ width: `${(c.inquiries / total) * 100}%`, background: colors[i] }} />
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function KpiCard({ label, value, unit, delta, up }: {
  label: string; value: number; unit: string; delta: string; up: boolean
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">
        {value.toLocaleString()}
        <span className="kpi-unit">{unit}</span>
      </div>
      <div className={`kpi-delta ${up ? 'up' : 'down'}`}>{delta}</div>
    </div>
  )
}
