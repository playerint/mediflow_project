'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  getConsultations, getConsultationStats, getBookings, getPatients,
  type ConsultationDto, type BookingDto,
} from '@/lib/api'
import { AEO_TOP, LINE_BOT } from '@/lib/mock-data'

// ── 날짜 헬퍼 ──────────────────────────────────────────────────
function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayLabel() {
  const d = new Date()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`
}

function toTimeStr(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function fromNow(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1)  return '방금'
  if (diff < 60) return `${diff}분 전`
  const h = Math.floor(diff / 60)
  if (h < 24)   return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

const STATUS_LABEL: Record<string, string> = { new: '미답변', pending: '처리 중', replied: '답변 완료' }
const STATUS_BADGE: Record<string, string> = { new: 'badge bdg-red', pending: 'badge bdg-yellow', replied: 'badge bdg-green' }
const CHANNEL_BG:  Record<string, { bg: string; color: string }> = {
  LINE:      { bg: '#D1FAE5', color: '#065F46' },
  Instagram: { bg: '#FDF2F8', color: '#9D174D' },
  사이트폼:    { bg: '#EFF6FF', color: '#1D4ED8' },
}

export default function DashboardPage() {
  const [stats,         setStats]         = useState<Record<string, number>>({ new: 0, pending: 0, replied: 0 })
  const [bookings,      setBookings]      = useState<BookingDto[]>([])
  const [consultations, setConsultations] = useState<ConsultationDto[]>([])
  const [patientCount,  setPatientCount]  = useState(0)
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      getConsultationStats(),
      getBookings(),
      getConsultations(),
      getPatients(),
    ]).then(([s, b, c, p]) => {
      setStats(s)
      setBookings(b)
      setConsultations(c)
      setPatientCount(p.length)
    }).catch(() => {/* 오류 시 0 유지 */}).finally(() => setLoading(false))
  }, [])

  const today          = todayStr()
  const todayBookings  = bookings.filter(b => b.scheduledAt.startsWith(today))
                                 .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
  const recentInquiries = [...consultations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const kpis = [
    { label: '미답변 문의', value: stats.new ?? 0,   unit: '건', href: '/crm',    up: false },
    { label: '오늘 예약',   value: todayBookings.length, unit: '건', href: '/booking', up: true },
    { label: '전체 환자',   value: patientCount,      unit: '명', href: '/crm',    up: true },
    { label: '전체 상담',   value: (stats.new ?? 0) + (stats.pending ?? 0) + (stats.replied ?? 0), unit: '건', href: '/crm', up: true },
  ]

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">홈 대시보드</span>
        </div>
        <div className="topbar-right">
          <span style={{ fontSize: 12, color: 'var(--s400)' }}>{todayLabel()}</span>
        </div>
      </div>

      <div className="content fade">

        {/* KPI 카드 4개 */}
        <div className="kpi-grid">
          {kpis.map(k => (
            <Link key={k.label} href={k.href} style={{ textDecoration: 'none' }}>
              <div className="kpi-card">
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value">
                  {loading ? '…' : k.value}
                  <span className="kpi-unit">{k.unit}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 그리드 1: 오늘 일정 + 최근 문의 */}
        <div className="grid2" style={{ alignItems: 'start' }}>

          {/* 오늘 일정 */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">오늘 일정</div>
              <Link href="/booking" className="see-all">전체 보기</Link>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--s400)', fontSize: 13 }}>로딩 중…</div>
            ) : todayBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--s400)', fontSize: 13 }}>오늘 예약이 없습니다</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {todayBookings.map((b, i) => (
                  <div
                    key={b.id}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '11px 0',
                      borderBottom: i < todayBookings.length - 1 ? '1px solid var(--s100)' : 'none',
                    }}
                  >
                    <div style={{ minWidth: 42, fontSize: 12, fontWeight: 700, color: 'var(--navy)', paddingTop: 1 }}>
                      {toTimeStr(b.scheduledAt)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--s900)', marginBottom: 2 }}>
                        {b.patientNameJa}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--s500)' }}>
                        {b.treatment ?? '시술 미기재'}
                        {b.doctor && <span style={{ color: 'var(--s400)', marginLeft: 6 }}>· {b.doctor}</span>}
                      </div>
                    </div>
                    <span className={
                      b.status === 'pending' ? 'badge bdg-yellow' :
                      b.status === 'confirmed' ? 'badge bdg-blue' : 'badge'
                    }>
                      {b.status === 'pending' ? '대기' : b.status === 'confirmed' ? '확정' : b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 최근 문의 */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">최근 문의</div>
              <Link href="/crm" className="see-all">전체 보기</Link>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--s400)', fontSize: 13 }}>로딩 중…</div>
            ) : recentInquiries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--s400)', fontSize: 13 }}>문의가 없습니다</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentInquiries.map((c, i) => {
                  const ch = CHANNEL_BG[c.channel] ?? { bg: 'var(--s100)', color: 'var(--s500)' }
                  return (
                    <Link
                      key={c.id}
                      href="/crm"
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        padding: '10px 0',
                        borderBottom: i < recentInquiries.length - 1 ? '1px solid var(--s100)' : 'none',
                        textDecoration: 'none',
                      }}
                    >
                      <div style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                        background: ch.bg, color: ch.color,
                        flexShrink: 0, marginTop: 2,
                      }}>
                        {c.channel}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--s900)' }}>{c.patientNameJa}</span>
                          <span className={STATUS_BADGE[c.status] ?? 'badge'}>{STATUS_LABEL[c.status] ?? c.status}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--s500)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.message ?? '-'}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--s400)', flexShrink: 0, paddingTop: 2 }}>
                        {c.createdAt ? fromNow(c.createdAt) : ''}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* 그리드 2: AEO 현황 + LINE 자동상담 (mock 유지) */}
        <div className="grid2" style={{ alignItems: 'start' }}>

          {/* AEO 인용 현황 */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">AEO 인용 현황 (일본어)</div>
              <Link href="/site/seo" className="see-all">상세 보기</Link>
            </div>
            <div style={{
              fontSize: 12, color: 'var(--s500)', padding: '8px 12px', borderRadius: 8,
              background: 'var(--s50)', marginBottom: 14,
            }}>
              AI 검색엔진(Perplexity·ChatGPT)이 우리 병원을 답변에 인용하는 횟수입니다.
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>검색 키워드</th>
                  <th style={{ textAlign: 'right' }}>인용</th>
                  <th style={{ textAlign: 'right' }}>변화</th>
                </tr>
              </thead>
              <tbody>
                {AEO_TOP.map(a => (
                  <tr key={a.query}>
                    <td style={{ fontSize: 12 }}>{a.query}</td>
                    <td style={{ fontWeight: 700, textAlign: 'right' }}>{a.cited}회</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      <span className={a.change >= 0 ? 'up' : 'down'}>
                        {a.change >= 0 ? `+${a.change}` : a.change}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* LINE 자동상담 */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">LINE 자동상담</div>
              <Link href="/line" className="see-all">관리하기</Link>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px', borderRadius: 10,
              background: LINE_BOT.status === 'on' ? '#D1FAE5' : 'var(--s100)',
              marginBottom: 16,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: LINE_BOT.status === 'on' ? '#16A34A' : 'var(--s400)',
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: LINE_BOT.status === 'on' ? '#065F46' : 'var(--s500)' }}>
                {LINE_BOT.status === 'on' ? '자동상담 가동 중' : '자동상담 꺼짐'}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#16A34A' }}>
                자동 처리율 {LINE_BOT.autoRate}%
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: 12, background: 'var(--s50)', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)' }}>{LINE_BOT.todayCount}</div>
                <div style={{ fontSize: 11, color: 'var(--s500)', marginTop: 4 }}>오늘 메시지 수</div>
              </div>
              <div style={{ padding: 12, background: LINE_BOT.pending > 0 ? 'var(--red-l)' : 'var(--s50)', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: LINE_BOT.pending > 0 ? 'var(--red)' : 'var(--navy)' }}>
                  {LINE_BOT.pending}
                </div>
                <div style={{ fontSize: 11, color: 'var(--s500)', marginTop: 4 }}>수동 처리 필요</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
