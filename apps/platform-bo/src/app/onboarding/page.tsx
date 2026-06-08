'use client'

import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import { HOSPITALS, ONBOARDING_STEPS, ONBOARDING_PROGRESS, PLAN_BADGE } from '@/lib/mock-data'

export default function OnboardingListPage() {
  const router = useRouter()

  const inProgress = HOSPITALS.filter(h => h.status === 'onboarding')
  const completed  = HOSPITALS.filter(h => h.status === 'active')

  const totalSteps = ONBOARDING_STEPS.length

  return (
    <>
      <PageHeader backHref="/" backLabel="대시보드" title="온보딩 관리">
        <button className="btn btn-primary" onClick={() => router.push('/hospitals/new')}>
          + 신규 온보딩 시작
        </button>
      </PageHeader>

      <div className="content">
        {/* KPI */}
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
          {[
            { label: '온보딩 진행 중', value: inProgress.length, unit: '건' },
            { label: '이번 달 완료',   value: 9,                  unit: '건' },
            { label: '평균 소요 기간', value: 14,                 unit: '일' },
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          {inProgress.map(h => {
            const cur = ONBOARDING_PROGRESS[h.id] ?? 1
            const pct = Math.round(((cur - 1) / totalSteps) * 100)
            const stepName = ONBOARDING_STEPS[cur - 1]?.name ?? ''
            return (
              <div
                key={h.id}
                className="card"
                style={{ cursor: 'pointer', transition: 'box-shadow .15s' }}
                onClick={() => router.push(`/onboarding/${h.id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* 아이콘 */}
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--blue-l)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🚀</div>

                  {/* 정보 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, color: 'var(--s900)' }}>{h.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--s400)' }}>{h.nameJa}</span>
                      <span className={PLAN_BADGE[h.plan]}>{h.plan}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}>
                        Step {cur} / {totalSteps} — {stepName}
                      </span>
                    </div>
                    {/* 프로그레스 바 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="prog-track" style={{ flex: 1 }}>
                        <div className="prog-fill pf-navy" style={{ width: `${pct}%` }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--s500)', flexShrink: 0 }}>{pct}%</span>
                    </div>
                    <div style={{ marginTop: 6, display: 'flex', gap: 16, fontSize: 11, color: 'var(--s400)' }}>
                      <span>👤 {h.manager}</span>
                      <span>🏷 {h.clinicType} · {h.specialty}</span>
                    </div>
                  </div>

                  <span style={{ fontSize: 12, color: 'var(--s400)' }}>상세 →</span>
                </div>
              </div>
            )
          })}
        </div>

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
              {completed.map(h => (
                <tr key={h.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/hospitals/${h.id}`)}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{h.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--s400)' }}>{h.nameJa}</div>
                  </td>
                  <td><span className={PLAN_BADGE[h.plan]}>{h.plan}</span></td>
                  <td>{h.manager}</td>
                  <td style={{ fontSize: 12, color: 'var(--s500)' }}>{h.expire}</td>
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
