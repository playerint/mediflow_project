'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import { getHospitals, type HospitalDto } from '@/lib/api'
import { PLAN_BADGE, STATUS_BADGE, STATUS_LABEL, type HospitalStatus } from '@/lib/mock-data'

type FilterKey = 'all' | HospitalStatus

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',        label: '전체' },
  { key: 'active',     label: '운영 중' },
  { key: 'onboarding', label: '온보딩' },
  { key: 'paused',     label: '일시정지' },
]

function isExpiringSoon(expire: string | null): boolean {
  if (!expire) return false
  const diff = new Date(expire).getTime() - Date.now()
  return diff > 0 && diff < 30 * 86400000
}

function siteDisplay(siteUrl: string | null, status: string): string {
  if (siteUrl) return siteUrl
  return status === 'onboarding' ? '(온보딩 중)' : '-'
}

export default function HospitalsPage() {
  const router = useRouter()
  const [hospitals, setHospitals] = useState<HospitalDto[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [filter, setFilter]       = useState<FilterKey>('all')
  const [search, setSearch]       = useState('')

  useEffect(() => {
    getHospitals()
      .then(setHospitals)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = hospitals.filter(h => {
    const matchFilter = filter === 'all' || h.status === filter
    const matchSearch = !search
      || h.nameKr.includes(search)
      || (h.nameJa ?? '').includes(search)
    return matchFilter && matchSearch
  })

  const counts: Record<FilterKey, number> = {
    all:        hospitals.length,
    active:     hospitals.filter(h => h.status === 'active').length,
    onboarding: hospitals.filter(h => h.status === 'onboarding').length,
    paused:     hospitals.filter(h => h.status === 'paused').length,
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
        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 10, padding: '12px 16px',
            color: '#DC2626', fontSize: 13, marginBottom: 16,
          }}>
            ⚠ 백엔드 연결 오류: {error} — 백엔드 서버(포트 8080)가 실행 중인지 확인하세요.
          </div>
        )}

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>병원명</th>
                <th>플랜</th>
                <th>상태</th>
                <th>사이트</th>
                <th>계약 만료</th>
                <th>담당자</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--s400)' }}>
                    불러오는 중...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--s400)' }}>
                    {error ? '데이터를 불러오지 못했습니다.' : '검색 결과가 없습니다.'}
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
                      <div style={{ fontWeight: 500, color: 'var(--s900)' }}>{h.nameKr}</div>
                      <div style={{ fontSize: 12, color: 'var(--s400)' }}>{h.nameJa}</div>
                    </td>
                    <td>
                      <span className={PLAN_BADGE[h.plan as keyof typeof PLAN_BADGE] ?? 'badge bdg-gray'}>
                        {h.plan}
                      </span>
                    </td>
                    <td>
                      <span className={STATUS_BADGE[h.status as HospitalStatus] ?? 'badge bdg-gray'}>
                        {STATUS_LABEL[h.status as HospitalStatus] ?? h.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--navy)', fontFamily: 'monospace' }}>
                      {siteDisplay(h.siteUrl, h.status)}
                    </td>
                    <td style={{
                      color: isExpiringSoon(h.contractExpire) ? 'var(--red)' : 'var(--s500)',
                      fontWeight: isExpiringSoon(h.contractExpire) ? 600 : 400,
                    }}>
                      {h.contractExpire ?? '-'}
                    </td>
                    <td>{h.managerName}</td>
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
