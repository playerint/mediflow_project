'use client'

import { useState } from 'react'
import {
  CRM_INQUIRIES, STATUS_LABEL, STATUS_BADGE,
  type CrmInquiry, type InquiryStatus,
} from '@/lib/mock-data'

type FilterKey = 'all' | InquiryStatus

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',     label: '전체' },
  { key: 'new',     label: '미답변' },
  { key: 'pending', label: '처리 중' },
  { key: 'replied', label: '답변 완료' },
]

const CHANNEL_STYLE: Record<string, { bg: string; color: string }> = {
  LINE:    { bg: '#D1FAE5', color: '#065F46' },
  '사이트폼': { bg: '#EFF6FF', color: '#1D4ED8' },
  카카오:   { bg: '#FEF3C7', color: '#92400E' },
}

export default function CrmPage() {
  const [filter,  setFilter]  = useState<FilterKey>('all')
  const [search,  setSearch]  = useState('')
  const [selected, setSelected] = useState<CrmInquiry | null>(null)
  const [reply,   setReply]   = useState('')

  const counts = {
    all:     CRM_INQUIRIES.length,
    new:     CRM_INQUIRIES.filter(q => q.status === 'new').length,
    pending: CRM_INQUIRIES.filter(q => q.status === 'pending').length,
    replied: CRM_INQUIRIES.filter(q => q.status === 'replied').length,
  }

  const overdueCount = CRM_INQUIRIES.filter(q => q.overdue).length

  const filtered = CRM_INQUIRIES.filter(q => {
    const matchStatus = filter === 'all' || q.status === filter
    const keyword = search.trim().toLowerCase()
    const matchSearch = !keyword
      || q.name.toLowerCase().includes(keyword)
      || q.content.toLowerCase().includes(keyword)
      || q.nameKana.includes(keyword)
    return matchStatus && matchSearch
  })

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">문의·상담 CRM</span>
          {overdueCount > 0 && (
            <span className="badge bdg-red">⚠ {overdueCount}건 48h 초과</span>
          )}
        </div>
        <div className="topbar-right">
          <input
            type="search"
            placeholder="이름·내용 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 200 }}
          />
        </div>
      </div>

      <div className="content fade" style={{ paddingBottom: 40 }}>

        {/* KPI 요약 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 10, marginBottom: 18 }}>
          {FILTERS.map(f => (
            <div
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                background: filter === f.key ? 'var(--navy)' : 'var(--s0)',
                border: `1px solid ${filter === f.key ? 'var(--navy)' : 'var(--s200)'}`,
                borderRadius: 'var(--rl)',
                padding: '14px 18px',
                cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              <div style={{ fontSize: 11, color: filter === f.key ? 'rgba(255,255,255,.6)' : 'var(--s500)', marginBottom: 6 }}>
                {f.label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: filter === f.key ? '#fff' : 'var(--navy)' }}>
                {counts[f.key]}
                <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 3, color: filter === f.key ? 'rgba(255,255,255,.7)' : 'var(--s400)' }}>건</span>
              </div>
            </div>
          ))}
        </div>

        {/* 메인 영역: 목록 + 상세 패널 */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>

          {/* 문의 목록 */}
          <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', minWidth: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>환자</th>
                  <th>채널</th>
                  <th>문의 내용</th>
                  <th>상태</th>
                  <th>경과</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--s400)' }}>
                      해당 조건의 문의가 없습니다
                    </td>
                  </tr>
                )}
                {filtered.map(q => {
                  const ch = CHANNEL_STYLE[q.channel] ?? { bg: 'var(--s100)', color: 'var(--s500)' }
                  const isSelected = selected?.id === q.id
                  return (
                    <tr
                      key={q.id}
                      onClick={() => setSelected(isSelected ? null : q)}
                      style={{
                        cursor: 'pointer',
                        background: isSelected ? 'var(--navy-l)' : undefined,
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--s900)', fontSize: 13 }}>{q.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 2 }}>{q.nameKana}</div>
                        {q.overdue && (
                          <span style={{ fontSize: 10, color: 'var(--red)', fontWeight: 700 }}>⚠ 48h 초과</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: ch.bg, color: ch.color }}>
                          {q.channel}
                        </span>
                      </td>
                      <td style={{ maxWidth: 260 }}>
                        <div style={{ fontSize: 12, color: 'var(--s700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {q.content}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 2 }}>{q.category}</div>
                      </td>
                      <td>
                        <span className={STATUS_BADGE[q.status]}>{STATUS_LABEL[q.status]}</span>
                      </td>
                      <td style={{ fontSize: 12, color: q.overdue ? 'var(--red)' : 'var(--s500)', fontWeight: q.overdue ? 700 : 400 }}>
                        {q.elapsed} 전
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 상세 대화 패널 */}
          {selected && (
            <div
              className="card fade"
              style={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden' }}
            >
              {/* 패널 헤더 */}
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--s100)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--s900)' }}>{selected.name}</span>
                    <span className={STATUS_BADGE[selected.status]}>{STATUS_LABEL[selected.status]}</span>
                    {selected.overdue && <span className="badge bdg-red">⚠ 초과</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 2 }}>{selected.nameKana} · {selected.channel} · {selected.category}</div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--s400)', lineHeight: 1 }}
                >
                  ×
                </button>
              </div>

              {/* 대화 스레드 */}
              <div style={{ flex: 1, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 380, overflowY: 'auto' }}>
                {selected.thread.map((msg, i) => {
                  const isStaff = msg.role === 'staff'
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: isStaff ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
                      {!isStaff && (
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--s100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                          👤
                        </div>
                      )}
                      <div style={{ maxWidth: '78%' }}>
                        <div style={{
                          padding: '9px 12px',
                          borderRadius: isStaff ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          background: isStaff ? 'var(--navy)' : 'var(--s100)',
                          color: isStaff ? '#fff' : 'var(--s900)',
                          fontSize: 12, lineHeight: 1.6,
                        }}>
                          {msg.text}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--s400)', marginTop: 4, textAlign: isStaff ? 'right' : 'left' }}>
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 답장 입력 */}
              <div style={{ padding: '12px 18px', borderTop: '1px solid var(--s100)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <textarea
                  rows={3}
                  placeholder="일본어로 답장을 입력하세요..."
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  style={{ fontSize: 12, resize: 'none' }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-sm"
                    style={{ flex: 1, justifyContent: 'center', fontSize: 11 }}
                    onClick={() => setReply('【AI草稿】\n')}
                  >
                    🤖 AI 초안 생성
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => { setReply(''); }}
                  >
                    전송 →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
