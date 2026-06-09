'use client'

import { useState, useEffect } from 'react'
import { getBookings, type BookingDto } from '@/lib/api'

// 오늘을 기준으로 이번 주 7일 생성
function buildWeek() {
  const today = new Date()
  // 월요일 기준으로 정렬
  const monday = new Date(today)
  const day = today.getDay() === 0 ? 6 : today.getDay() - 1
  monday.setDate(today.getDate() - day)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const yyyy = d.getFullYear()
    const mm   = String(d.getMonth() + 1).padStart(2, '0')
    const dd   = String(d.getDate()).padStart(2, '0')
    return {
      date:  `${yyyy}-${mm}-${dd}`,
      label: `${mm}/${dd}`,
      day:   ['월', '화', '수', '목', '금', '토', '일'][i],
    }
  })
}

const WEEK_DAYS = buildWeek()

function toDateStr(iso: string) { return iso.slice(0, 10) }
function toTimeStr(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const STATUS_LABEL: Record<string, string> = {
  pending:   '확정 대기',
  confirmed: '확정',
  completed: '완료',
  cancelled: '취소',
}
const STATUS_BADGE: Record<string, string> = {
  pending:   'badge bdg-yellow',
  confirmed: 'badge bdg-blue',
  completed: 'badge bdg-green',
  cancelled: 'badge',
}

type ViewMode    = 'week' | 'list'
type FilterStatus = 'all' | string

export default function BookingPage() {
  const todayStr = WEEK_DAYS.find(d => d.date === new Date().toISOString().slice(0, 10))?.date ?? WEEK_DAYS[0].date

  const [view,         setView]         = useState<ViewMode>('week')
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [selected,     setSelected]     = useState<BookingDto | null>(null)
  const [bookings,     setBookings]     = useState<BookingDto[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      setLoading(true)
      setBookings(await getBookings())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터 로드 실패')
    } finally {
      setLoading(false)
    }
  }

  const dayBookings = (date: string) =>
    bookings.filter(b => toDateStr(b.scheduledAt) === date)
           .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))

  const listBookings = bookings
    .filter(b => filterStatus === 'all' || b.status === filterStatus)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))

  const todayCount    = dayBookings(todayStr).length
  const pendingCount  = bookings.filter(b => b.status === 'pending').length
  const weekCount     = WEEK_DAYS.reduce((s, d) => s + dayBookings(d.date).length, 0)
  const thisMonth     = new Date().toISOString().slice(0, 7)
  const monthCount    = bookings.filter(b => b.scheduledAt.startsWith(thisMonth)).length

  const current = view === 'week' ? dayBookings(selectedDate) : listBookings

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">예약 관리</span>
          {pendingCount > 0 && <span className="badge bdg-blue">{pendingCount}건 확정 대기</span>}
        </div>
        <div className="topbar-right">
          <div style={{ display: 'flex', gap: 4, background: 'var(--s100)', borderRadius: 8, padding: 3 }}>
            {(['week', '주간'] as const) && null}
            {([['week', '주간'], ['list', '목록']] as [ViewMode, string][]).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontFamily: 'inherit',
                  background: view === v ? 'var(--s0)' : 'transparent',
                  color: view === v ? 'var(--navy)' : 'var(--s500)',
                  fontWeight: view === v ? 600 : 400,
                  boxShadow: view === v ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <button className="btn btn-sm" onClick={loadData}>새로고침</button>
        </div>
      </div>

      <div className="content fade">
        {error && (
          <div className="badge bdg-red" style={{ marginBottom: 12, padding: '8px 14px', fontSize: 12 }}>
            ⚠ {error}
          </div>
        )}

        {/* KPI */}
        <div className="kpi-grid" style={{ marginBottom: 18 }}>
          {[
            { label: '오늘 예약',    value: todayCount },
            { label: '이번 주 예약', value: weekCount },
            { label: '확정 대기',   value: pendingCount },
            { label: '이번 달 예약', value: monthCount },
          ].map(k => (
            <div key={k.label} className="kpi-card">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{loading ? '…' : k.value}<span className="kpi-unit">건</span></div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* 주간 탭 */}
            {view === 'week' && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {WEEK_DAYS.map(d => {
                  const cnt   = dayBookings(d.date).length
                  const isTdy = d.date === todayStr
                  const isSel = d.date === selectedDate
                  return (
                    <button
                      key={d.date}
                      onClick={() => setSelectedDate(d.date)}
                      style={{
                        flex: 1, padding: '10px 6px', cursor: 'pointer', borderRadius: 10, fontFamily: 'inherit',
                        background: isSel ? 'var(--navy)' : isTdy ? 'var(--navy-l)' : 'var(--s0)',
                        border: `1px solid ${isSel ? 'var(--navy)' : isTdy ? 'var(--blue-b)' : 'var(--s200)'}`,
                      }}
                    >
                      <div style={{ fontSize: 10, color: isSel ? 'rgba(255,255,255,.6)' : 'var(--s400)', marginBottom: 3 }}>{d.day}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: isSel ? '#fff' : isTdy ? 'var(--navy)' : 'var(--s900)' }}>{d.label}</div>
                      {cnt > 0 && (
                        <div style={{
                          marginTop: 5, width: 18, height: 18, borderRadius: '50%', fontSize: 10, fontWeight: 700,
                          background: 'var(--navy)', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '5px auto 0',
                          opacity: isSel ? .5 : 1,
                        }}>
                          {cnt}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* 목록 필터 */}
            {view === 'list' && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {[['all','전체'], ['confirmed','확정'], ['pending','대기'], ['completed','완료'], ['cancelled','취소']].map(([k, l]) => (
                  <button key={k} onClick={() => setFilterStatus(k)} className={`pill${filterStatus === k ? ' on' : ''}`}>
                    {l}
                  </button>
                ))}
              </div>
            )}

            {/* 예약 테이블 */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 48, color: 'var(--s400)' }}>로딩 중…</div>
              ) : current.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48, color: 'var(--s400)', fontSize: 13 }}>
                  {view === 'week' ? '이 날 예약이 없습니다' : '해당 조건의 예약이 없습니다'}
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>시간</th>
                      {view === 'list' && <th>날짜</th>}
                      <th>환자</th>
                      <th>시술</th>
                      <th>담당의</th>
                      <th>상태</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {current.map(b => {
                      const isSel = selected?.id === b.id
                      return (
                        <tr
                          key={b.id}
                          onClick={() => setSelected(isSel ? null : b)}
                          style={{ cursor: 'pointer', background: isSel ? 'var(--navy-l)' : undefined }}
                        >
                          <td style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 13 }}>
                            {toTimeStr(b.scheduledAt)}
                          </td>
                          {view === 'list' && (
                            <td style={{ fontSize: 12, color: 'var(--s500)' }}>{toDateStr(b.scheduledAt)}</td>
                          )}
                          <td>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{b.patientNameJa}</div>
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--s700)' }}>{b.treatment ?? '-'}</td>
                          <td style={{ fontSize: 12, color: 'var(--s500)' }}>{b.doctor ?? '-'}</td>
                          <td>
                            <span className={STATUS_BADGE[b.status] ?? 'badge'}>
                              {STATUS_LABEL[b.status] ?? b.status}
                            </span>
                          </td>
                          <td>
                            {b.status === 'pending' && (
                              <button className="btn btn-primary btn-sm" onClick={e => e.stopPropagation()}>
                                확정
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* 상세 패널 */}
          {selected && (
            <div className="card fade" style={{ width: 300, flexShrink: 0, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--s100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{selected.patientNameJa}</div>
                  <span className={STATUS_BADGE[selected.status] ?? 'badge'} style={{ marginTop: 4 }}>
                    {STATUS_LABEL[selected.status] ?? selected.status}
                  </span>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--s400)' }}>×</button>
              </div>

              <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: '날짜',  value: toDateStr(selected.scheduledAt) },
                  { label: '시간',  value: toTimeStr(selected.scheduledAt) },
                  { label: '시술',  value: selected.treatment ?? '-' },
                  { label: '담당의', value: selected.doctor ?? '-' },
                  ...(selected.notes ? [{ label: '메모', value: selected.notes }] : []),
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--s400)', width: 48, flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontSize: 13, color: 'var(--s900)', flex: 1 }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding: '12px 18px', borderTop: '1px solid var(--s100)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selected.status === 'pending' && (
                  <button className="btn btn-primary" style={{ justifyContent: 'center' }}>✓ 예약 확정</button>
                )}
                <button className="btn" style={{ justifyContent: 'center' }}>✏ 예약 수정</button>
                {selected.status !== 'cancelled' && selected.status !== 'completed' && (
                  <button className="btn btn-sm" style={{ justifyContent: 'center', color: 'var(--red)', borderColor: '#FCA5A5' }}>
                    취소 처리
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
