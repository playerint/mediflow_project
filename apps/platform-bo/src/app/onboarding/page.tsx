'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import { getHospitals, getOnboardings, type HospitalDto, type OnboardingDto } from '@/lib/api'
import { PLAN_BADGE } from '@/lib/mock-data'

const TOTAL_STEPS = 9

export default function OnboardingListPage() {
  const router = useRouter()

  const [hospitals,   setHospitals]   = useState<HospitalDto[]>([])
  const [onboardings, setOnboardings] = useState<OnboardingDto[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getHospitals(), getOnboardings()])
      .then(([hs, obs]) => { setHospitals(hs); setOnboardings(obs) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // 온보딩 진행 중 병원 (status=onboarding) + 온보딩 레코드 조인
  const inProgress = hospitals
    .filter(h => h.status === 'onboarding')
    .map(h => ({
      hospital:  h,
      onboarding: onboardings.find(o => o.hospitalId === h.id) ?? null,
    }))

  // 완료된 병원 (status=active)
  const completed = hospitals.filter(h => h.status === 'active')

  return (
    <>
      <PageHeader backHref="/" backLabel="대시보드" title="온보딩 관리">
        <button className="btn btn-primary" onClick={() => router.push('/hospitals/new')}>
          + 신규 온보딩 시작
        </button>
      </PageHeader>

      <div className="content">
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', color: '#DC2626', fontSize: 13, marginBottom: 16 }}>
            ⚠ 백엔드 연결 오류: {error}
          </div>
        )}

        {/* KPI */}
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
          {[
            { label: '온보딩 진행 중', value: inProgress.length, unit: '건' },
            { label: '완료 (운영 중)', value: completed.length,  unit: '건' },
            { label: '전체 병원',      value: hospitals.length,  unit: '개' },
          ].map(k => (
            <div key={k.label} className="kpi-card">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}<span className="kpi-unit">{k.unit}</span></div>
            </div>
          ))}
        </div>

        {/* 진행 중 */}
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>진행 중</span>
          <span className="badge bdg-blue">{inProgress.length}</span>
        </div>

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--s400)', fontSize: 13 }}>불러오는 중...</div>
        ) : inProgress.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--s400)', fontSize: 13 }}>진행 중인 온보딩이 없습니다.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            {inProgress.map(({ hospital: h, onboarding: ob }) => {
              const curStep  = ob?.currentStep  ?? 1
              const pct      = ob?.progressPct  ?? 0
              const stepName = ob?.currentStepName ?? '병원 자동 분석'
              return (
                <div
                  key={h.id}
                  className="card"
                  style={{ cursor: 'pointer', transition: 'box-shadow .15s' }}
                  onClick={() => router.push(`/onboarding/${h.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--blue-l)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🚀</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, color: 'var(--s900)' }}>{h.nameKr}</span>
                        <span style={{ fontSize: 12, color: 'var(--s400)' }}>{h.nameJa}</span>
                        <span className={PLAN_BADGE[h.plan as keyof typeof PLAN_BADGE] ?? 'badge bdg-gray'}>{h.plan}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}>
                          Step {curStep} / {TOTAL_STEPS} — {stepName}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="prog-track" style={{ flex: 1 }}>
                          <div className="prog-fill pf-navy" style={{ width: `${pct}%` }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--s500)', flexShrink: 0 }}>{pct}%</span>
                      </div>
                      <div style={{ marginTop: 6, display: 'flex', gap: 16, fontSize: 11, color: 'var(--s400)' }}>
                        <span>👤 {h.managerName}</span>
                        <span>🏷 {h.clinicType}{h.specialty ? ` · ${h.specialty}` : ''}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--s400)' }}>상세 →</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 완료된 병원 */}
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--s700)' }}>완료 (운영 중)</span>
          <span className="badge bdg-gray">{completed.length}</span>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>병원명</th>
                <th>플랜</th>
                <th>담당자</th>
                <th>계약 만료</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {completed.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--s400)', fontSize: 13 }}>완료된 병원이 없습니다.</td>
                </tr>
              ) : completed.map(h => (
                <tr key={h.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/hospitals/${h.id}`)}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{h.nameKr}</div>
                    <div style={{ fontSize: 12, color: 'var(--s400)' }}>{h.nameJa}</div>
                  </td>
                  <td><span className={PLAN_BADGE[h.plan as keyof typeof PLAN_BADGE] ?? 'badge bdg-gray'}>{h.plan}</span></td>
                  <td>{h.managerName}</td>
                  <td style={{ fontSize: 12, color: 'var(--s500)' }}>{h.contractExpire ?? '-'}</td>
                  <td><span style={{ fontSize: 12, color: 'var(--s400)' }}>완료 ✓</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
