'use client'

import { useState, useEffect } from 'react'
import PageHeader from '@/components/PageHeader'
import { getCsTickets, CsTicketDto } from '@/lib/api'

const PRIORITY_BADGE: Record<string, string> = { high: 'badge bdg-red', mid: 'badge bdg-blue', low: 'badge bdg-gray' }
const PRIORITY_LABEL: Record<string, string> = { high: '긴급', mid: '보통', low: '낮음' }
const STATUS_BADGE:   Record<string, string> = { open: 'badge bdg-red', progress: 'badge bdg-blue', closed: 'badge bdg-gray' }
const STATUS_LABEL:   Record<string, string> = { open: '미처리', progress: '처리 중', closed: '완료' }
const TYPE_COLOR:     Record<string, string> = {
  불만: 'var(--red)', 문의: 'var(--blue)', 오류: '#D97706', 컴플라이언스: '#7C3AED',
  COMPLAINT: 'var(--red)', INQUIRY: 'var(--blue)', ERROR: '#D97706', COMPLIANCE: '#7C3AED',
}

type FilterKey = 'all' | 'open' | 'progress' | 'closed'

export default function CsPage() {
  const [filter, setFilter]   = useState<FilterKey>('all')
  const [tickets, setTickets] = useState<CsTicketDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const statusParam = filter !== 'all' ? filter : undefined
    getCsTickets(statusParam)
      .then(data => setTickets(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [filter])

  const openCount     = tickets.filter(t => t.status === 'open').length
  const progressCount = tickets.filter(t => t.status === 'progress').length
  const closedCount   = tickets.filter(t => t.status === 'closed').length

  return (
    <>
      <PageHeader title="CS 관리">
        <button className="btn btn-primary" disabled title="준비 중">+ 티켓 생성</button>
      </PageHeader>
      <div className="content fade">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
          {([
            { label: '🔴 미처리',  value: openCount,     key: 'open'     as FilterKey },
            { label: '🔵 처리 중', value: progressCount, key: 'progress' as FilterKey },
            { label: '✅ 완료',   value: closedCount,   key: 'closed'   as FilterKey },
          ] as const).map(k => (
            <div
              key={k.key}
              className="kpi-card"
              onClick={() => setFilter(filter === k.key ? 'all' : k.key)}
              style={{ cursor: 'pointer', outline: filter === k.key ? '2px solid var(--navy)' : 'none' }}
            >
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}<span className="kpi-unit">건</span></div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading && (
            <div style={{ padding: '24px 20px', color: 'var(--s400)', fontSize: 13 }}>불러오는 중…</div>
          )}
          {error && (
            <div style={{ padding: '24px 20px', color: 'var(--red)', fontSize: 13 }}>{error}</div>
          )}
          {!loading && !error && (
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>병원</th>
                  <th>유형</th>
                  <th>제목</th>
                  <th>우선순위</th>
                  <th>상태</th>
                  <th>등록</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--s400)', fontSize: 12 }}>#{t.id}</td>
                    <td style={{ fontWeight: 500, color: 'var(--blue)' }}>
                      {t.hospitalName ?? '-'}
                    </td>
                    <td>
                      <span style={{ fontSize: 11, fontWeight: 700, color: TYPE_COLOR[t.type] ?? 'var(--s500)' }}>
                        {t.type}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>{t.title}</td>
                    <td>
                      <span className={PRIORITY_BADGE[t.priority] ?? 'badge bdg-gray'}>
                        {PRIORITY_LABEL[t.priority] ?? t.priority}
                      </span>
                    </td>
                    <td>
                      <span className={STATUS_BADGE[t.status] ?? 'badge bdg-gray'}>
                        {STATUS_LABEL[t.status] ?? t.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--s400)' }}>{t.createdAt}</td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--s400)', fontSize: 13, padding: '24px 0' }}>
                      티켓이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
