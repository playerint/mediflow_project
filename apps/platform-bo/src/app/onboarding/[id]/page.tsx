'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import { HOSPITALS, ONBOARDING_STEPS, ONBOARDING_PROGRESS, PLAN_BADGE } from '@/lib/mock-data'

export default function OnboardingDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const router   = useRouter()
  const hospital = HOSPITALS.find(h => h.id === Number(id))

  const initialStep = ONBOARDING_PROGRESS[Number(id)] ?? 1
  const [currentStep, setCurrentStep] = useState(initialStep)

  if (!hospital) {
    return (
      <div className="content" style={{ textAlign: 'center', paddingTop: 80 }}>
        <p style={{ color: 'var(--s400)' }}>존재하지 않는 병원입니다.</p>
        <button className="btn" style={{ marginTop: 16 }} onClick={() => router.push('/onboarding')}>← 목록으로</button>
      </div>
    )
  }

  const totalSteps = ONBOARDING_STEPS.length
  const pct = Math.round(((currentStep - 1) / totalSteps) * 100)

  function completeStep() {
    if (currentStep < totalSteps) setCurrentStep(s => s + 1)
    else {
      alert('온보딩이 완료됐습니다! 환자용 사이트가 생성됩니다. (목업)')
      router.push('/onboarding')
    }
  }

  return (
    <>
      <PageHeader backHref="/onboarding" backLabel="온보딩 관리" title={hospital.name}>
        <button className="btn">임시 저장</button>
        <button className="btn">미리보기</button>
        <button className="btn btn-primary" onClick={completeStep}>
          {currentStep < totalSteps ? '다음 단계 →' : '🚀 게시하기'}
        </button>
      </PageHeader>

      <div className="content">
        <div className="grid2" style={{ alignItems: 'start' }}>

          {/* 왼쪽: 단계 목록 */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* 병원 요약 */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--s100)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--s900)', marginBottom: 2 }}>{hospital.name}</div>
                <div style={{ fontSize: 12, color: 'var(--s400)' }}>{hospital.nameJa}</div>
              </div>
              <span className={PLAN_BADGE[hospital.plan]}>{hospital.plan}</span>
            </div>

            {/* 전체 진행률 */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--s100)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--s500)', marginBottom: 6 }}>
                <span>전체 진행률</span>
                <span>{pct}% ({currentStep - 1}/{totalSteps}단계 완료)</span>
              </div>
              <div className="prog-track">
                <div className="prog-fill pf-navy" style={{ width: `${pct}%`, transition: 'width .3s' }} />
              </div>
            </div>

            {/* 단계 목록 */}
            {ONBOARDING_STEPS.map(({ step, name, desc }) => {
              const done   = step < currentStep
              const active = step === currentStep
              const wait   = step > currentStep
              return (
                <div
                  key={step}
                  onClick={() => !wait && setCurrentStep(step)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '13px 20px',
                    borderBottom: '1px solid var(--s100)',
                    background: active ? 'var(--blue-l)' : 'transparent',
                    cursor: done ? 'pointer' : active ? 'default' : 'not-allowed',
                    transition: 'background .15s',
                  }}
                >
                  {/* 단계 번호 */}
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    background: done ? 'var(--navy)' : active ? 'var(--blue)' : 'var(--s200)',
                    color:      done || active ? '#fff' : 'var(--s400)',
                  }}>
                    {done ? '✓' : step}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: done ? 'var(--s500)' : active ? 'var(--blue)' : wait ? 'var(--s400)' : 'var(--s700)' }}>
                      {name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 1 }}>{desc}</div>
                  </div>

                  {done   && <span style={{ fontSize: 11, color: 'var(--s400)' }}>완료</span>}
                  {active && <span style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600 }}>진행 중</span>}
                </div>
              )
            })}
          </div>

          {/* 오른쪽: 현재 단계 작업 영역 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card">
              <div className="card-head" style={{ marginBottom: 16 }}>
                <div className="card-title">
                  Step {currentStep} — {ONBOARDING_STEPS[currentStep - 1]?.name}
                </div>
                <span className="badge bdg-blue">진행 중</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 20 }}>
                {ONBOARDING_STEPS[currentStep - 1]?.desc}
              </p>
              <StepContent step={currentStep} hospital={hospital} />
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--s100)' }}>
                <button className="btn" onClick={() => currentStep > 1 && setCurrentStep(s => s - 1)} disabled={currentStep === 1}>
                  ← 이전
                </button>
                <button className="btn btn-primary" onClick={completeStep}>
                  {currentStep < totalSteps ? '완료 후 다음 →' : '🚀 게시하기'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

/* 단계별 작업 영역 내용 */
function StepContent({ step, hospital }: { step: number; hospital: { name: string; url: string } }) {
  switch (step) {
    case 1:
      return (
        <div>
          <div style={{ fontSize: 12, color: 'var(--s500)', marginBottom: 8 }}>분석할 URL</div>
          <input type="text" defaultValue={`https://${hospital.url !== '(온보딩 중)' ? hospital.url : 'clinic.co.kr'}`} style={{ marginBottom: 12 }} />
          <button className="btn btn-primary">🔍 자동 분석 시작</button>
          <div style={{ marginTop: 16, padding: 14, background: 'var(--s50)', borderRadius: 8, fontSize: 12, color: 'var(--s500)' }}>
            병원 홈페이지를 크롤링해 이미지, 텍스트, 진료과 정보를 자동으로 추출합니다.
          </div>
        </div>
      )
    case 2:
      return (
        <div style={{ fontSize: 13, color: 'var(--s500)', padding: '16px 0' }}>
          AI가 병원 분석 데이터를 기반으로 일본어 SEO 전략안과 키워드를 생성합니다.<br />
          <span style={{ color: 'var(--blue)', fontWeight: 600 }}>분석 결과를 검토 후 다음 단계로 진행하세요.</span>
        </div>
      )
    case 3:
      return (
        <div>
          <div style={{ fontSize: 12, color: 'var(--s500)', marginBottom: 12 }}>템플릿 선택</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {['모던 클린', '럭셔리 다크', '밝고 친근', '미니멀'].map(t => (
              <button key={t} style={{ padding: '20px 14px', border: '2px solid var(--s200)', borderRadius: 8, background: 'var(--s50)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )
    case 4:
      return (
        <div>
          <div style={{ border: '2px dashed var(--s200)', borderRadius: 10, padding: 40, textAlign: 'center', color: 'var(--s400)' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
            <div style={{ fontSize: 13, marginBottom: 12 }}>이미지를 드래그하거나 클릭해서 업로드</div>
            <button className="btn">파일 선택</button>
          </div>
        </div>
      )
    case 5:
      return (
        <div style={{ fontSize: 13, color: 'var(--s500)' }}>
          AI가 재집필한 일본어 카피를 검토합니다. 의료 광고 규정에 맞게 표현이 수정됩니다.
          <div style={{ marginTop: 12, padding: 14, background: 'var(--s50)', borderRadius: 8, fontSize: 12 }}>
            ✏ 검수 항목: 과대광고 표현, 환자 후기, 비교 광고, 가격 표시 등
          </div>
        </div>
      )
    case 6:
      return (
        <div>
          <div style={{ fontSize: 12, color: 'var(--s500)', marginBottom: 12 }}>광고법 컴플라이언스 검사 (5종)</div>
          {['과대·과장 광고', '비교 광고', '환자 사례·후기', '가격 비교', '효과 보장 표현'].map((item, i) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--s100)' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: i < 3 ? 'var(--navy)' : 'var(--s200)', color: i < 3 ? '#fff' : 'var(--s400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
                {i < 3 ? '✓' : '—'}
              </div>
              <span style={{ fontSize: 13, color: i < 3 ? 'var(--s700)' : 'var(--s400)' }}>{item}</span>
              {i < 3 && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--green)' }}>통과</span>}
            </div>
          ))}
        </div>
      )
    case 7:
      return (
        <div>
          {['LINE 채널 연결', 'CRM 웹훅 설정', '팔로잉 카카오 채널'].map((item, i) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--s100)' }}>
              <span style={{ fontSize: 13, flex: 1 }}>{item}</span>
              {i === 0
                ? <button className="btn btn-primary" style={{ fontSize: 11, padding: '3px 10px' }}>연결하기</button>
                : <span style={{ fontSize: 11, color: 'var(--s400)' }}>대기 중</span>
              }
            </div>
          ))}
        </div>
      )
    case 8:
      return (
        <div style={{ fontSize: 13, color: 'var(--s500)' }}>
          Google 검색 최적화(SEO)와 AI 답변 인용 최적화(AEO)를 설정합니다.
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['메타 태그 생성', '구조화 데이터 설정', 'FAQ 최적화'].map(item => (
              <div key={item} style={{ padding: '10px 14px', background: 'var(--s50)', borderRadius: 6, fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>{item}</span>
                <span style={{ color: 'var(--blue)' }}>자동 생성됨</span>
              </div>
            ))}
          </div>
        </div>
      )
    case 9:
      return (
        <div>
          <div style={{ padding: 24, background: 'var(--navy-l)', borderRadius: 10, textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🌐</div>
            <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>게시 준비 완료</div>
            <div style={{ fontSize: 12, color: 'var(--s500)' }}>모든 단계가 완료됐습니다. 게시하면 환자용 사이트가 생성됩니다.</div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--s500)' }}>예정 URL: <span style={{ color: 'var(--navy)', fontWeight: 600 }}>jp.{hospital.name.toLowerCase().replace(/\s/g, '')}.co.kr</span></div>
        </div>
      )
    default:
      return null
  }
}
