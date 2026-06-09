'use client'

import { useState, useEffect } from 'react'
import {
  getConsultations, getConsultationStats, updateConsultationStatus,
  type ConsultationDto,
} from '@/lib/api'

type FilterKey = 'all' | 'new' | 'pending' | 'replied'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',     label: '전체' },
  { key: 'new',     label: '미답변' },
  { key: 'pending', label: '처리 중' },
  { key: 'replied', label: '답변 완료' },
]

const STATUS_LABEL: Record<string, string> = { new: '미답변', pending: '처리 중', replied: '답변 완료' }
const STATUS_BADGE: Record<string, string> = { new: 'badge bdg-red', pending: 'badge bdg-yellow', replied: 'badge bdg-green' }

const CHANNEL_STYLE: Record<string, { bg: string; color: string }> = {
  LINE:      { bg: '#D1FAE5', color: '#065F46' },
  Instagram: { bg: '#FDF2F8', color: '#9D174D' },
  사이트폼:    { bg: '#EFF6FF', color: '#1D4ED8' },
}

export default function CrmPage() {
  const [filter,       setFilter]       = useState<FilterKey>('all')
  const [search,       setSearch]       = useState('')
  const [items,        setItems]        = useState<ConsultationDto[]>([])
  const [stats,        setStats]        = useState<Record<string, number>>({ new: 0, pending: 0, replied: 0 })
  const [selected,     setSelected]     = useState<ConsultationDto | null>(null)
  const [reply,        setReply]        = useState('')
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [list, s] = await Promise.all([getConsultations(), getConsultationStats()])
      setItems(list)
      setStats(s)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터 로드 실패')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(id: number, status: string) {
    try {
      await updateConsultationStatus(id, status)
      setItems(prev => prev.map(c => c.id === id ? { ...c, status } : c))
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null)
    } catch { /* 실패 시 무시 */ }
  }

  const counts = {
    all:     items.length,
    new:     stats.new     ?? 0,
    pending: stats.pending ?? 0,
    replied: stats.replied ?? 0,
  }

  const filtered = items.filter(c => {
    const matchStatus = filter === 'all' || c.status === filter
    const kw = search.trim().toLowerCase()
    const matchSearch = !kw
      || c.patientNameJa.toLowerCase().includes(kw)
      || (c.message ?? '').toLowerCase().includes(kw)
      || (c.treatment ?? '').toLowerCase().includes(kw)
    return matchStatus && matchSearch
  })

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">문의·상담 CRM</span>
          {counts.new > 0 && (
            <span className="badge bdg-red">미답변 {counts.new}건</span>
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
          <button className="btn btn-sm" onClick={loadData}>새로고침</button>
        </div>
      </div>

      <div className="content fade" style={{ paddingBottom: 40 }}>

        {error && (
          <div className="badge bdg-red" style={{ marginBottom: 12, padding: '8px 14px', fontSize: 12 }}>
            ⚠ {error}
          </div>
        )}

        {/* KPI 카드 */}
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
                {loading ? '…' : counts[f.key]}
                <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 3, color: filter === f.key ? 'rgba(255,255,255,.7)' : 'var(--s400)' }}>건</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>

          {/* 목록 테이블 */}
          <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', minWidth: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>환자명</th>
                  <th>채널</th>
                  <th>문의 내용</th>
                  <th>상태</th>
                  <th>접수일</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--s400)' }}>로딩 중…</td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--s400)' }}>해당 조건의 문의가 없습니다</td></tr>
                )}
                {filtered.map(c => {
                  const ch = CHANNEL_STYLE[c.channel] ?? { bg: 'var(--s100)', color: 'var(--s500)' }
                  const isSelected = selected?.id === c.id
                  const date = c.createdAt ? new Date(c.createdAt).toLocaleDateString('ko-KR') : '-'
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelected(isSelected ? null : c)}
                      style={{ cursor: 'pointer', background: isSelected ? 'var(--navy-l)' : undefined }}
                    >
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--s900)', fontSize: 13 }}>{c.patientNameJa}</div>
                        {c.treatment && <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 2 }}>{c.treatment}</div>}
                      </td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: ch.bg, color: ch.color }}>
                          {c.channel}
                        </span>
                      </td>
                      <td style={{ maxWidth: 260 }}>
                        <div style={{ fontSize: 12, color: 'var(--s700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.message ?? '-'}
                        </div>
                      </td>
                      <td>
                        <span className={STATUS_BADGE[c.status] ?? 'badge'}>
                          {STATUS_LABEL[c.status] ?? c.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--s500)' }}>{date}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 상세 패널 */}
          {selected && (
            <div className="card fade" style={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden' }}>
              {/* 헤더 */}
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--s100)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--s900)' }}>{selected.patientNameJa}</span>
                    <span className={STATUS_BADGE[selected.status] ?? 'badge'}>{STATUS_LABEL[selected.status]}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 2 }}>
                    {selected.channel} · {selected.treatment ?? '미기재'}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--s400)' }}>×</button>
              </div>

              {/* 메시지 */}
              <div style={{ padding: '14px 18px', minHeight: 120 }}>
                <div style={{
                  background: 'var(--s50)', borderRadius: 12, padding: '12px 14px',
                  fontSize: 13, color: 'var(--s800)', lineHeight: 1.7,
                }}>
                  {selected.message ?? '메시지 없음'}
                </div>
                <p style={{ fontSize: 11, color: 'var(--s400)', marginTop: 8 }}>
                  접수: {selected.createdAt ? new Date(selected.createdAt).toLocaleString('ko-KR') : '-'}
                </p>
              </div>

              {/* 상태 변경 */}
              <div style={{ padding: '0 18px 14px', display: 'flex', gap: 6 }}>
                {['new', 'pending', 'replied'].map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(selected.id, s)}
                    className={`btn btn-sm ${selected.status === s ? 'btn-primary' : ''}`}
                    style={{ flex: 1, justifyContent: 'center', fontSize: 11 }}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>

              {/* 답장 */}
              <div style={{ padding: '12px 18px', borderTop: '1px solid var(--s100)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <textarea
                  rows={3}
                  placeholder="일본어로 답장을 입력하세요..."
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  style={{ fontSize: 12, resize: 'none' }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: 11 }}
                    onClick={() => setReply('【AI草稿】\n')}>
                    🤖 AI 초안
                  </button>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => {
                      handleStatusChange(selected.id, 'replied')
                      setReply('')
                    }}>
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
