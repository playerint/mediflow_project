'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import { HOSPITALS, PLAN_BADGE, STATUS_BADGE, STATUS_LABEL, type HospitalStatus } from '@/lib/mock-data'

type FilterKey = 'all' | HospitalStatus

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',        label: '전체' },
  { key: 'active',     label: '운영 중' },
  { key: 'onboarding', label: '온보딩' },
  { key: 'paused',     label: '일시정지' },
]

// 계약 만료일이 30일 이내인지 확인
function isExpiringSoon(expire: string): boolean {
  if (expire === '-') return false
  const diff = new Date(expire).getTime() - Date.now()
  return diff > 0 && diff < 30 * 86400000
}

export default function HospitalsPage() {
  const router = useRouter()
  const [filter, setFilter]   = useState<FilterKey>('all')
  const [search, setSearch]   = useState('')

  const filtered = HOSPITALS.filter(h => {
    const matchFilter = filter === 'all' || h.status === filter
    const matchSearch = !search || h.name.includes(search) || h.nameJa.includes(search)
    return matchFilter && matchSearch
  })

  const counts: Record<FilterKey, number> = {
    all:        HOSPITALS.length,
    active:     HOSPITALS.filter(h => h.status === 'active').length,
    onboarding: HOSPITALS.filter(h => h.status === 'onboarding').length,
    paused:     HOSPITALS.filter(h => h.status === 'paused').length,
  }

  return (
    <>
      <PageHeader backHref="/" backLabel="대시보드" title="병원 목록">
        <input
          type="search"
          placeholder="병원명 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 200, padding: '6px 12px', borderRadius: 'var(--r)', border: '1px solid var(--s200)', fontSize: 13, outline: 'none' }}
        />
        <div className="filter-pills" style={{ margin: 0 }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`pill${filter === f.key ? ' on' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label} {counts[f.key]}
            </button>
          ))}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => router.push('/hospitals/new')}
        >
          + 병원 등록
        </button>
      </PageHeader>

      <div className="content">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>병원명</th>
                <th>플랜</th>
                <th>상태</th>
                <th>사이트</th>
                <th>이번 달 문의</th>
                <th>계약 만료</th>
                <th>담당자</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--s400)' }}>
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map(h => (
                  <tr
                    key={h.id}
                    onClick={() => router.push(`/hospitals/${h.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--s900)' }}>{h.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--s400)' }}>{h.nameJa}</div>
                    </td>
                    <td><span className={PLAN_BADGE[h.plan]}>{h.plan}</span></td>
                    <td><span className={STATUS_BADGE[h.status]}>{STATUS_LABEL[h.status]}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--navy)', fontFamily: 'monospace' }}>{h.url}</td>
                    <td style={{ fontWeight: 500 }}>{h.inq > 0 ? `${h.inq}건` : '-'}</td>
                    <td style={{ color: isExpiringSoon(h.expire) ? 'var(--red)' : 'var(--s500)', fontWeight: isExpiringSoon(h.expire) ? 600 : 400 }}>
                      {h.expire}
                    </td>
                    <td>{h.manager}</td>
                    <td>
                      <button
                        className="btn"
                        style={{ fontSize: 12, padding: '4px 10px' }}
                        onClick={e => { e.stopPropagation(); router.push(`/hospitals/${h.id}`) }}
                      >
                        상세 →
                      </button>
                    </td>
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
