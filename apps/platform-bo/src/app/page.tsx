'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getHospitals, getOnboardings, type HospitalDto, type OnboardingDto } from '@/lib/api'
import { PLAN_BADGE, STATUS_LABEL, type HospitalStatus } from '@/lib/mock-data'

const TOTAL_STEPS = 9

function isExpiringSoon(expire: string | null): boolean {
  if (!expire) return false
  const diff = new Date(expire).getTime() - Date.now()
  return diff > 0 && diff < 30 * 86400000
}

export default function DashboardPage() {
  const [hospitals,   setHospitals]   = useState<HospitalDto[]>([])
  const [onboardings, setOnboardings] = useState<OnboardingDto[]>([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([getHospitals(), getOnboardings()])
      .then(([hs, obs]) => { setHospitals(hs); setOnboardings(obs) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const inOnboarding  = hospitals.filter(h => h.status === 'onboarding')
  const activeHospitals = hospitals.filter(h => h.status === 'active')
  const expiringSoon  = hospitals.filter(h => isExpiringSoon(h.contractExpire))
  const recentHospitals = [...hospitals].reverse().slice(0, 5)

  const KPI = [
    { label: '🏥 입점 병원',        value: loading ? '…' : hospitals.length,    unit: '개',  delta: `온보딩 ${inOnboarding.length}건 포함`,  href: '/hospitals',  real: true },
    { label: '🚀 온보딩 진행 중',   value: loading ? '…' : inOnboarding.length, unit: '건',  delta: '병원 등록 후 자동 시작',                 href: '/onboarding', real: true },
    { label: '💳 이번 달 매출',     value: '-',    unit: '',    delta: '정산 모듈 준비 중',           href: '/billing',  real: false },
    { label: '🎧 미처리 CS',        value: '-',    unit: '',    delta: 'CS 모듈 준비 중',             href: '/cs',       real: false },
    { label: '💬 전체 병원 문의',   value: '-',    unit: '',    delta: '환자 DB 연동 후 표시',        href: '/crm',      real: false },
    { label: '📋 계약 갱신 임박',   value: loading ? '…' : expiringSoon.length, unit: '건', delta: '30일 이내', href: '/contract', real: true },
    { label: '⚠ 컴플라이언스',      value: '-',    unit: '',    delta: '컴플라이언스 모듈 준비 중',   href: '/hospitals', real: false },
    { label: '🧠 AEO 인용 (전체)', value: '-',    unit: '',    delta: 'AI 서비스 연동 후 표시',      href: '/reports',  real: false },
  ]

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">대시보드</span>
        </div>
        <div className="topbar-right">
          <span style={{ fontSize: 12, color: 'var(--s400)' }}>2026년 6월 기준</span>
        </div>
      </div>

      <div className="content fade">
        {/* KPI 카드 */}
        <div className="kpi-grid">
          {KPI.map(k => (
            <Link key={k.label} href={k.href} style={{ textDecoration: 'none' }}>
              <div className="kpi-card" style={{ opacity: k.real ? 1 : 0.55 }}>
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value">
                  {k.value}
                  {k.unit && <span className="kpi-unit">{k.unit}</span>}
                </div>
                <div className="kpi-delta">{k.delta}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* 그리드 1: 온보딩 현황 + 계약 갱신 임박 */}
        <div className="grid2">
          {/* 온보딩 현황 */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">🚀 온보딩 진행 현황</div>
              <Link href="/onboarding" className="see-all">전체 보기</Link>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--s400)', fontSize: 13 }}>불러오는 중...</div>
            ) : inOnboarding.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--s400)', fontSize: 13 }}>진행 중인 온보딩이 없습니다.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {inOnboarding.map(h => {
                  const ob  = onboardings.find(o => o.hospitalId === h.id)
                  const cur = ob?.currentStep ?? 1
                  const pct = ob?.progressPct ?? 0
                  const stepName = ob?.currentStepName ?? 'Step 1'
                  return (
                    <Link key={h.id} href={`/onboarding/${h.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--s900)' }}>{h.nameKr}</span>
                        <span style={{ fontSize: 11, color: 'var(--blue)' }}>Step {cur} / {TOTAL_STEPS} — {stepName}</span>
                      </div>
                      <div className="prog-track">
                        <div className="prog-fill pf-navy" style={{ width: `${pct}%` }} />
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 4, textAlign: 'right' }}>{pct}%</div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* 계약 갱신 임박 */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">📋 계약 갱신 임박</div>
              <Link href="/contract" className="see-all">전체 보기</Link>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--s400)', fontSize: 13 }}>불러오는 중...</div>
            ) : expiringSoon.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--s400)', fontSize: 13 }}>30일 이내 갱신 예정 없음</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {expiringSoon.map(h => (
                  <Link key={h.id} href={`/hospitals/${h.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--s100)', textDecoration: 'none' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--s900)' }}>{h.nameKr}</div>
                      <div style={{ fontSize: 11, color: 'var(--s400)' }}>{h.managerName}</div>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700 }}>{h.contractExpire}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 그리드 2: 최근 입점 병원 + 운영 중 병원 현황 */}
        <div className="grid2">
          <div className="card">
            <div className="card-head">
              <div className="card-title">🏥 최근 입점 병원</div>
              <Link href="/hospitals" className="see-all">전체 보기</Link>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--s400)', fontSize: 13 }}>불러오는 중...</div>
            ) : recentHospitals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--s400)', fontSize: 13 }}>등록된 병원이 없습니다.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentHospitals.map(h => (
                  <Link key={h.id} href={`/hospitals/${h.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--s100)', textDecoration: 'none' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--navy-l)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🏥</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--s900)' }}>{h.nameKr}</div>
                      <div style={{ fontSize: 11, color: 'var(--s400)' }}>{h.clinicType} · {h.plan}</div>
                    </div>
                    <span className={PLAN_BADGE[h.plan as keyof typeof PLAN_BADGE] ?? 'badge bdg-gray'}>{h.plan}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">📊 병원 운영 현황</div>
              <Link href="/hospitals" className="see-all">전체 보기</Link>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--s400)', fontSize: 13 }}>불러오는 중...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: '운영 중',    count: activeHospitals.length,  color: 'var(--teal)' },
                  { label: '온보딩',     count: inOnboarding.length,     color: 'var(--blue)' },
                  { label: '일시정지',   count: hospitals.filter(h => h.status === 'paused').length, color: 'var(--s400)' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, color: 'var(--s600)', width: 64 }}>{item.label}</span>
                    <div style={{ flex: 1, height: 8, background: 'var(--s100)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: hospitals.length > 0 ? `${(item.count / hospitals.length) * 100}%` : '0%', height: '100%', background: item.color, borderRadius: 4, transition: 'width .4s' }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--s900)', width: 24, textAlign: 'right' }}>{item.count}</span>
                  </div>
                ))}
                <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--s50)', borderRadius: 8, fontSize: 12, color: 'var(--s500)', textAlign: 'center' }}>
                  전체 {hospitals.length}개 병원
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
