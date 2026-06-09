'use client'

import { useState } from 'react'
import {
  BOOKINGS,
  BOOKING_STATUS_LABEL, BOOKING_STATUS_BADGE, BOOKING_TYPE_COLOR,
  type Booking, type BookingStatus, type BookingType,
} from '@/lib/mock-data'

// 이번 주 날짜 7개 생성 (기준: 2026-06-08 월요일)
const WEEK_START = '2026-06-08'
const WEEK_DAYS: { date: string; label: string; day: string }[] = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(WEEK_START)
  d.setDate(d.getDate() + i)
  const yyyy = d.getFullYear()
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const dd   = String(d.getDate()).padStart(2, '0')
  return {
    date:  `${yyyy}-${mm}-${dd}`,
    label: `${mm}/${dd}`,
    day:   ['월', '화', '수', '목', '금', '토', '일'][d.getDay() === 0 ? 6 : d.getDay() - 1],
  }
})

type ViewMode = 'week' | 'list'
type FilterStatus = 'all' | BookingStatus

const CHANNEL_STYLE: Record<string, { bg: string; color: string }> = {
  LINE:    { bg: '#D1FAE5', color: '#065F46' },
  '사이트폼': { bg: '#EFF6FF', color: '#1D4ED8' },
}

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState('2026-06-08')
  const [view,         setView]         = useState<ViewMode>('week')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [selected,     setSelected]     = useState<Booking | null>(null)

  const today = '2026-06-08'

  // 주간 탭 기준 필터
  const dayBookings = (date: string) =>
    BOOKINGS.filter(b => b.date === date).sort((a, b) => a.time.localeCompare(b.time))

  // 목록 뷰 기준 필터
  const listBookings = BOOKINGS
    .filter(b => filterStatus === 'all' || b.status === filterStatus)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))

  // KPI
  const todayCount     = dayBookings(today).length
  const pendingCount   = BOOKINGS.filter(b => b.status === 'pending').length
  const thisWeekCount  = WEEK_DAYS.reduce((s, d) => s + dayBookings(d.date).length, 0)
  const thisMonthCount = BOOKINGS.filter(b => b.date.startsWith('2026-06')).length

  const currentDayBookings = view === 'week' ? dayBookings(selectedDate) : listBookings

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">예약 관리</span>
          {pendingCount > 0 && (
            <span className="badge bdg-blue">{pendingCount}건 확정 대기</span>
          )}
        </div>
        <div className="topbar-right">
          {/* 뷰 전환 */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--s100)', borderRadius: 8, padding: 3 }}>
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
                  transition: 'all .15s',
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm">+ 예약 등록</button>
        </div>
      </div>

      <div className="content fade">

        {/* KPI 4개 */}
        <div className="kpi-grid" style={{ marginBottom: 18 }}>
          {[
            { label: '📅 오늘 예약',      value: todayCount,    unit: '건' },
            { label: '📆 이번 주 예약',   value: thisWeekCount, unit: '건' },
            { label: '⏳ 확정 대기',      value: pendingCount,  unit: '건' },
            { label: '🗓 이번 달 예약',   value: thisMonthCount, unit: '건' },
          ].map(k => (
            <div key={k.label} className="kpi-card">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}<span className="kpi-unit">{k.unit}</span></div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>

          {/* 왼쪽: 일정 영역 */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* 주간 탭 (week 모드) */}
            {view === 'week' && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {WEEK_DAYS.map(d => {
                  const cnt     = dayBookings(d.date).length
                  const isToday = d.date === today
                  const isSel   = d.date === selectedDate
                  return (
                    <button
                      key={d.date}
                      onClick={() => setSelectedDate(d.date)}
                      style={{
                        flex: 1, padding: '10px 6px', cursor: 'pointer',
                        borderRadius: 10, fontFamily: 'inherit',
                        background: isSel ? 'var(--navy)' : isToday ? 'var(--navy-l)' : 'var(--s0)',
                        border: `1px solid ${isSel ? 'var(--navy)' : isToday ? 'var(--blue-b)' : 'var(--s200)'}`,
                        transition: 'all .15s',
                      }}
                    >
                      <div style={{ fontSize: 10, color: isSel ? 'rgba(255,255,255,.6)' : 'var(--s400)', marginBottom: 3 }}>{d.day}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: isSel ? '#fff' : isToday ? 'var(--navy)' : 'var(--s900)' }}>{d.label}</div>
                      {cnt > 0 && (
                        <div style={{
                          marginTop: 5, width: 18, height: 18,
                          borderRadius: '50%', fontSize: 10, fontWeight: 700,
                          background: isSel ? 'rgba(255,255,255,.2)' : 'var(--navy)',
                          color: isSel ? '#fff' : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          margin: '5px auto 0',
                        }}>
                          {cnt}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* 목록 뷰 필터 */}
            {view === 'list' && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {([['all','전체'], ['confirmed','확정'], ['pending','대기'], ['completed','완료'], ['cancelled','취소']] as [FilterStatus, string][]).map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => setFilterStatus(k)}
                    className={`pill${filterStatus === k ? ' on' : ''}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}

            {/* 예약 목록 */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {currentDayBookings.length === 0 ? (
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
                      <th>유형</th>
                      <th>채널</th>
                      <th>상태</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDayBookings.map(b => {
                      const ch = CHANNEL_STYLE[b.channel] ?? { bg: 'var(--s100)', color: 'var(--s500)' }
                      const isSelected = selected?.id === b.id
                      return (
                        <tr
                          key={b.id}
                          onClick={() => setSelected(isSelected ? null : b)}
                          style={{
                            cursor: 'pointer',
                            background: isSelected ? 'var(--navy-l)' : undefined,
                          }}
                        >
                          <td style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 13 }}>{b.time}</td>
                          {view === 'list' && (
                            <td style={{ fontSize: 12, color: 'var(--s500)' }}>{b.date}</td>
                          )}
                          <td>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{b.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 1 }}>{b.nameKana}</div>
                          </td>
                          <td>
                            <span style={{
                              fontSize: 11, fontWeight: 700,
                              color: BOOKING_TYPE_COLOR[b.type],
                              background: `${BOOKING_TYPE_COLOR[b.type]}18`,
                              padding: '2px 8px', borderRadius: 5,
                            }}>
                              {b.type}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: ch.bg, color: ch.color }}>
                              {b.channel}
                            </span>
                          </td>
                          <td>
                            <span className={BOOKING_STATUS_BADGE[b.status]}>{BOOKING_STATUS_LABEL[b.status]}</span>
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

          {/* 오른쪽: 선택 예약 상세 */}
          {selected && (
            <div className="card fade" style={{ width: 300, flexShrink: 0, padding: 0, overflow: 'hidden' }}>
              {/* 헤더 */}
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--s100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{selected.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 2 }}>{selected.nameKana}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--s400)', lineHeight: 1 }}>×</button>
              </div>

              {/* 상세 정보 */}
              <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: '날짜',  value: selected.date },
                  { label: '시간',  value: selected.time },
                  { label: '유형',  value: selected.type },
                  { label: '채널',  value: selected.channel },
                  { label: '상태',  value: BOOKING_STATUS_LABEL[selected.status] },
                  ...(selected.note ? [{ label: '메모', value: selected.note }] : []),
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--s400)', width: 40, flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontSize: 13, color: 'var(--s900)', flex: 1 }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* 액션 버튼 */}
              <div style={{ padding: '12px 18px', borderTop: '1px solid var(--s100)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selected.status === 'pending' && (
                  <button className="btn btn-primary" style={{ justifyContent: 'center' }}>
                    ✓ 예약 확정
                  </button>
                )}
                <button className="btn" style={{ justifyContent: 'center' }}>
                  ✏ 예약 수정
                </button>
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
