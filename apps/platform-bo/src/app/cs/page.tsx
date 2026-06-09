'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import Link from 'next/link'

type CsStatus = 'open' | 'progress' | 'closed'
type CsType   = '불만' | '문의' | '오류' | '컴플라이언스'

interface CsTicket {
  id:       number
  hospital: string
  type:     CsType
  title:    string
  status:   CsStatus
  priority: 'high' | 'mid' | 'low'
  created:  string
}

const TICKETS: CsTicket[] = [
  { id: 101, hospital: '올래성형외과',    type: '불만',      title: '일본어 문의 48시간 무응답',     status: 'open',     priority: 'high', created: '2일 전' },
  { id: 102, hospital: '청담미래성형외과', type: '컴플라이언스', title: '광고 표현 위반 2건 감지',        status: 'progress', priority: 'high', created: '1일 전' },
  { id: 103, hospital: '압구정원성형외과', type: '문의',      title: '사이트 업데이트 방법 문의',      status: 'progress', priority: 'mid',  created: '3일 전' },
  { id: 104, hospital: '강남뷰티클리닉',  type: '오류',      title: 'LINE 봇 연결 오류 발생',         status: 'open',     priority: 'high', created: '5시간 전' },
  { id: 105, hospital: '반포미성형외과',   type: '문의',      title: '예약 시스템 추가 기능 요청',     status: 'closed',   priority: 'low',  created: '5일 전' },
  { id: 106, hospital: '신사라인성형외과', type: '불만',      title: '대시보드 수치 오차 이의 제기',   status: 'closed',   priority: 'mid',  created: '7일 전' },
  { id: 107, hospital: '논현더플러스',    type: '문의',      title: 'SEO 점수 개선 컨설팅 요청',     status: 'open',     priority: 'low',  created: '2일 전' },
]

const PRIORITY_BADGE: Record<string, string>  = { high: 'badge bdg-red', mid: 'badge bdg-blue', low: 'badge bdg-gray' }
const PRIORITY_LABEL: Record<string, string>  = { high: '긴급', mid: '보통', low: '낮음' }
const STATUS_BADGE:   Record<CsStatus, string> = { open: 'badge bdg-red', progress: 'badge bdg-blue', closed: 'badge bdg-gray' }
const STATUS_LABEL:   Record<CsStatus, string> = { open: '미처리', progress: '처리 중', closed: '완료' }
const TYPE_COLOR:     Record<CsType, string>   = { 불만: 'var(--red)', 문의: 'var(--blue)', 오류: '#D97706', 컴플라이언스: '#7C3AED' }

export default function CsPage() {
  const [filter, setFilter] = useState<CsStatus | 'all'>('all')

  const filtered = filter === 'all' ? TICKETS : TICKETS.filter(t => t.status === filter)
  const openCount = TICKETS.filter(t => t.status === 'open').length
  const progressCount = TICKETS.filter(t => t.status === 'progress').length

  return (
    <>
      <PageHeader title="CS 관리">
        <button className="btn btn-primary">+ 티켓 생성</button>
      </PageHeader>
      <div className="content fade">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: '🔴 미처리',  value: openCount,    key: 'open'     as const },
            { label: '🔵 처리 중', value: progressCount, key: 'progress' as const },
            { label: '✅ 완료',   value: TICKETS.filter(t => t.status === 'closed').length, key: 'closed' as const },
          ].map(k => (
            <div
              key={k.label}
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
              {filtered.map(t => (
                <tr key={t.id}>
                  <td style={{ color: 'var(--s400)', fontSize: 12 }}>#{t.id}</td>
                  <td style={{ fontWeight: 500 }}>
                    <Link href={`/hospitals/${t.id < 105 ? t.id % 10 + 1 : 1}`} style={{ color: 'var(--blue)' }}>
                      {t.hospital}
                    </Link>
                  </td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 700, color: TYPE_COLOR[t.type] }}>{t.type}</span>
                  </td>
                  <td style={{ fontSize: 13 }}>{t.title}</td>
                  <td><span className={PRIORITY_BADGE[t.priority]}>{PRIORITY_LABEL[t.priority]}</span></td>
                  <td><span className={STATUS_BADGE[t.status]}>{STATUS_LABEL[t.status]}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--s400)' }}>{t.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
