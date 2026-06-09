'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import { getHospital, getOnboarding, type HospitalDto, type OnboardingDto } from '@/lib/api'
import { PLAN_BADGE, STATUS_BADGE, STATUS_LABEL, type HospitalStatus } from '@/lib/mock-data'

type TabKey = 'overview' | 'onboarding' | 'site' | 'crm' | 'contract' | 'memo'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview',   label: '📋 개요' },
  { key: 'onboarding', label: '🚀 온보딩' },
  { key: 'site',       label: '🌐 사이트' },
  { key: 'crm',        label: '💬 문의·CRM' },
  { key: 'contract',   label: '📄 계약·결제' },
  { key: 'memo',       label: '📝 내부 메모' },
]

const TOTAL_STEPS = 9
const STEP_NAMES = [
  '병원 자동 분석', 'SEO·AEO 전략 수립', '사이트 템플릿 선택',
  '이미지 업로드', '일본어 카피 검수', '컴플라이언스 검사',
  '채널 연동', 'SEO 최종 설정', '최종 검토 및 게시',
]

function isExpiringSoon(expire: string | null): boolean {
  if (!expire) return false
  return new Date(expire).getTime() - Date.now() < 30 * 86400000
}

export default function HospitalDetailPage() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  const [hospital,   setHospital]   = useState<HospitalDto | null>(null)
  const [onboarding, setOnboarding] = useState<OnboardingDto | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)

  useEffect(() => {
    const hid = Number(id)
    Promise.all([
      getHospital(hid),
      getOnboarding(hid).catch(() => null),  // 온보딩 없을 수 있음
    ])
      .then(([h, ob]) => { setHospital(h); setOnboarding(ob) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="content" style={{ textAlign: 'center', paddingTop: 80, color: 'var(--s400)', fontSize: 14 }}>불러오는 중...</div>
  }
  if (error || !hospital) {
    return (
      <div className="content" style={{ textAlign: 'center', paddingTop: 80 }}>
        <p style={{ color: '#DC2626', fontSize: 14 }}>{error ?? '존재하지 않는 병원입니다.'}</p>
        <button className="btn" style={{ marginTop: 16 }} onClick={() => router.push('/hospitals')}>← 목록으로</button>
      </div>
    )
  }

  const statusKey = hospital.status as HospitalStatus

  return (
    <>
      <PageHeader backHref="/hospitals" backLabel="병원 목록" title={hospital.nameKr}>
        <button className="btn">⏸ 일시정지</button>
      </PageHeader>

      <div className="content fade">
        {/* 히어로 — 병원 요약 */}
        <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--navy-l)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🏥</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--s900)' }}>{hospital.nameKr}</span>
              <span style={{ fontSize: 13, color: 'var(--s400)' }}>{hospital.nameJa}</span>
              <span className={STATUS_BADGE[statusKey] ?? 'badge bdg-gray'}>{STATUS_LABEL[statusKey] ?? hospital.status}</span>
              <span className={PLAN_BADGE[hospital.plan as keyof typeof PLAN_BADGE] ?? 'badge bdg-gray'}>{hospital.plan}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--s500)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span>🏷 {hospital.clinicType}{hospital.specialty ? ` · ${hospital.specialty}` : ''}</span>
              <span>🌐 {hospital.siteUrl ?? '(온보딩 중)'}</span>
              <span>👤 담당: {hospital.managerName}</span>
              {hospital.contractExpire && (
                <span style={{ color: isExpiringSoon(hospital.contractExpire) ? 'var(--red)' : 'inherit', fontWeight: isExpiringSoon(hospital.contractExpire) ? 600 : 400 }}>
                  📅 계약 만료: {hospital.contractExpire}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 탭 바 */}
        <div className="tab-bar" style={{ marginBottom: 16 }}>
          {TABS.map(t => (
            <button key={t.key} className={`tab${activeTab === t.key ? ' active' : ''}`} onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* 탭 1: 개요 */}
        {activeTab === 'overview' && (
          <div className="grid2">
            <div className="card">
              <div className="card-head">
                <div className="card-title">🏥 병원 기본 정보</div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['병원명 (한국어)', hospital.nameKr],
                    ['병원명 (일본어)', hospital.nameJa ?? '-'],
                    ['진료 유형',       hospital.clinicType],
                    ['전문 분야',       hospital.specialty ?? '-'],
                    ['사이트 URL',      hospital.siteUrl ?? '(온보딩 중)'],
                    ['플랜',           hospital.plan],
                    ['담당자',         hospital.managerName],
                    ['담당자 이메일',   hospital.managerEmail],
                    ['계약 시작',       hospital.contractStart],
                    ['계약 만료',       hospital.contractExpire ?? '-'],
                  ].map(([label, value]) => (
                    <tr key={label} style={{ borderBottom: '1px solid var(--s100)' }}>
                      <td style={{ padding: '9px 0', fontSize: 12, color: 'var(--s500)', width: 120 }}>{label}</td>
                      <td style={{ padding: '9px 0', fontSize: 13, color: 'var(--s900)', fontWeight: 500 }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* 온보딩 진행 현황 */}
              {onboarding && hospital.status === 'onboarding' && (
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 10 }}>🚀 온보딩 진행 현황</div>
                  <div style={{ fontSize: 12, color: 'var(--s500)', marginBottom: 8 }}>
                    Step {onboarding.currentStep} / {TOTAL_STEPS} — {STEP_NAMES[onboarding.currentStep - 1]}
                  </div>
                  <div className="prog-track" style={{ marginBottom: 6 }}>
                    <div className="prog-fill pf-navy" style={{ width: `${onboarding.progressPct}%` }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--s400)', textAlign: 'right' }}>{onboarding.progressPct}% 완료</div>
                  <button className="btn btn-primary" style={{ marginTop: 12, width: '100%' }}
                    onClick={() => router.push(`/onboarding/${hospital.id}`)}>
                    온보딩 진행하기 →
                  </button>
                </div>
              )}

              <div className="card">
                <div className="card-title" style={{ marginBottom: 14 }}>⚡ 빠른 작업</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {hospital.status === 'onboarding' && (
                    <button className="btn" style={{ justifyContent: 'flex-start' }} onClick={() => router.push(`/onboarding/${hospital.id}`)}>🚀 온보딩 진행하기</button>
                  )}
                  <button className="btn" style={{ justifyContent: 'flex-start' }} onClick={() => setActiveTab('contract')}>📄 계약 정보 보기</button>
                  <button className="btn" style={{ justifyContent: 'flex-start' }} onClick={() => setActiveTab('memo')}>📝 메모 작성</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 탭 2: 온보딩 */}
        {activeTab === 'onboarding' && (
          onboarding ? (
            <div className="card">
              <div className="card-head" style={{ marginBottom: 20 }}>
                <div className="card-title">🚀 온보딩 진행 현황</div>
                <span className={onboarding.status === 'COMPLETED' ? 'badge bdg-teal' : 'badge bdg-blue'}>
                  {onboarding.status === 'COMPLETED' ? '완료' : '진행 중'}
                </span>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--s500)', marginBottom: 8 }}>
                  <span>전체 진행률</span>
                  <span>{onboarding.progressPct}% ({onboarding.currentStep - 1}/{TOTAL_STEPS}단계 완료)</span>
                </div>
                <div className="prog-track">
                  <div className="prog-fill pf-navy" style={{ width: `${onboarding.progressPct}%` }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {STEP_NAMES.map((name, i) => {
                  const step   = i + 1
                  const done   = step < onboarding.currentStep
                  const active = step === onboarding.currentStep && onboarding.status !== 'COMPLETED'
                  return (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--s100)' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: done ? 'var(--navy)' : active ? 'var(--blue)' : 'var(--s200)', color: done || active ? '#fff' : 'var(--s400)' }}>
                        {done ? '✓' : step}
                      </div>
                      <span style={{ fontSize: 13, flex: 1, color: done ? 'var(--s500)' : active ? 'var(--blue)' : 'var(--s400)', fontWeight: active ? 700 : 400 }}>{name}</span>
                      {done   && <span style={{ fontSize: 11, color: 'var(--s400)' }}>완료</span>}
                      {active && <span style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600 }}>진행 중</span>}
                    </div>
                  )
                })}
              </div>
              {onboarding.status !== 'COMPLETED' && (
                <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => router.push(`/onboarding/${hospital.id}`)}>
                  온보딩 계속 진행하기 →
                </button>
              )}
              {onboarding.publishedSiteUrl && (
                <div style={{ marginTop: 16, padding: 14, background: 'var(--navy-l)', borderRadius: 8, fontSize: 12 }}>
                  🌐 게시된 사이트: <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{onboarding.publishedSiteUrl}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🚀</div>
              <div style={{ fontSize: 14, color: 'var(--s400)' }}>온보딩 정보가 없습니다.</div>
            </div>
          )
        )}

        {/* 탭 3: 사이트 */}
        {activeTab === 'site' && (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🌐</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--s700)', marginBottom: 8 }}>사이트 관리</div>
            <div style={{ fontSize: 13, color: 'var(--s400)' }}>온보딩 완료 후 사이트가 생성됩니다.</div>
            {hospital.siteUrl && (
              <div style={{ marginTop: 16, fontSize: 13, color: 'var(--navy)', fontFamily: 'monospace' }}>{hospital.siteUrl}</div>
            )}
          </div>
        )}

        {/* 탭 4: 문의·CRM */}
        {activeTab === 'crm' && (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--s700)', marginBottom: 8 }}>문의·CRM</div>
            <div style={{ fontSize: 13, color: 'var(--s400)' }}>환자 문의 내역은 병원별 DB에서 가져옵니다. 백엔드 연동 후 구현됩니다.</div>
          </div>
        )}

        {/* 탭 5: 계약·결제 */}
        {activeTab === 'contract' && (
          <div className="grid2">
            <div className="card">
              <div className="card-head">
                <div className="card-title">📄 계약 정보</div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['플랜',       hospital.plan],
                    ['담당자',     hospital.managerName],
                    ['이메일',     hospital.managerEmail],
                    ['계약 시작',  hospital.contractStart],
                    ['계약 만료',  hospital.contractExpire ?? '-'],
                  ].map(([label, value]) => (
                    <tr key={label} style={{ borderBottom: '1px solid var(--s100)' }}>
                      <td style={{ padding: '9px 0', fontSize: 12, color: 'var(--s500)', width: 110 }}>{label}</td>
                      <td style={{ padding: '9px 0', fontSize: 13, fontWeight: 500 }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>💳 결제 이력</div>
              <div style={{ fontSize: 13, color: 'var(--s400)', textAlign: 'center', padding: 24 }}>결제 이력은 백엔드 연동 후 표시됩니다.</div>
            </div>
          </div>
        )}

        {/* 탭 6: 내부 메모 */}
        {activeTab === 'memo' && (
          <div className="grid2">
            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>📝 담당자 메모</div>
              <textarea rows={4} placeholder="메모를 입력하세요..." style={{ width: '100%', marginBottom: 10 }} />
              <button className="btn btn-primary">메모 저장</button>
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>📋 활동 로그</div>
              <div style={{ fontSize: 13, color: 'var(--s400)', textAlign: 'center', padding: 24 }}>활동 로그는 백엔드 연동 후 표시됩니다.</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
