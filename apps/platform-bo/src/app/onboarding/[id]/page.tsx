'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import {
  getHospital, getOnboarding, nextOnboardingStep, publishOnboarding,
  analyzeOnboarding,
  type HospitalDto, type OnboardingDto, type AnalyzeResultDto,
} from '@/lib/api'
import { PLAN_BADGE } from '@/lib/mock-data'

const STEPS = [
  { step: 1, name: '병원 자동 분석',    desc: '병원 웹사이트 URL 크롤링 및 콘텐츠 자동 추출' },
  { step: 2, name: 'SEO·AEO 전략 수립', desc: 'AI 기반 일본어 검색 키워드 전략 수립' },
  { step: 3, name: '사이트 템플릿 선택', desc: '환자용 사이트 디자인 템플릿 선택' },
  { step: 4, name: '이미지 업로드',      desc: '병원 대표 이미지 및 시술 사진 업로드' },
  { step: 5, name: '일본어 카피 검수',   desc: 'AI 재집필 일본어 콘텐츠 검토 및 수정' },
  { step: 6, name: '컴플라이언스 검사',  desc: '의료 광고법 준수 여부 자동 검사' },
  { step: 7, name: '채널 연동',          desc: 'LINE 공식 채널 및 CRM 웹훅 연결' },
  { step: 8, name: 'SEO 최종 설정',      desc: '메타태그·구조화 데이터·FAQ 최적화' },
  { step: 9, name: '최종 검토 및 게시',  desc: '전체 사이트 검토 후 환자용 사이트 게시' },
]
const TOTAL_STEPS = STEPS.length

export default function OnboardingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [hospital,       setHospital]       = useState<HospitalDto | null>(null)
  const [onboarding,     setOnboarding]     = useState<OnboardingDto | null>(null)
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState<string | null>(null)
  const [advancing,      setAdvancing]      = useState(false)
  const [published,      setPublished]      = useState(false)

  // Step 1 분석 관련 상태
  const [analyzeResult,  setAnalyzeResult]  = useState<AnalyzeResultDto | null>(null)
  const [isAnalyzing,    setIsAnalyzing]    = useState(false)
  const [analyzeError,   setAnalyzeError]   = useState<string | null>(null)

  const hospitalId = Number(id)

  const fetchData = useCallback(async () => {
    try {
      const [h, ob] = await Promise.all([
        getHospital(hospitalId),
        getOnboarding(hospitalId),
      ])
      setHospital(h)
      setOnboarding(ob)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '데이터 조회 오류')
    } finally {
      setLoading(false)
    }
  }, [hospitalId])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleAnalyze(url: string) {
    setIsAnalyzing(true)
    setAnalyzeError(null)
    try {
      const result = await analyzeOnboarding(hospitalId, url)
      setAnalyzeResult(result)
    } catch (e: unknown) {
      setAnalyzeError(e instanceof Error ? e.message : '분석 중 오류가 발생했습니다.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function completeStep() {
    if (!onboarding || advancing) return
    setAdvancing(true)
    try {
      if (onboarding.currentStep < TOTAL_STEPS) {
        const updated = await nextOnboardingStep(hospitalId)
        setOnboarding(updated)
        setAnalyzeResult(null) // 단계 바뀌면 초기화
      } else {
        const siteUrl = `jp.${(hospital?.nameKr ?? 'clinic').toLowerCase().replace(/\s/g, '')}.co.kr`
        const updated = await publishOnboarding(hospitalId, siteUrl)
        setOnboarding(updated)
        setPublished(true)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '단계 진행 오류')
    } finally {
      setAdvancing(false)
    }
  }

  if (loading) {
    return <div className="content" style={{ textAlign: 'center', paddingTop: 80, color: 'var(--s400)', fontSize: 14 }}>불러오는 중...</div>
  }
  if (error && !hospital) {
    return (
      <div className="content" style={{ textAlign: 'center', paddingTop: 80 }}>
        <p style={{ color: '#DC2626', fontSize: 14 }}>{error}</p>
        <button className="btn" style={{ marginTop: 16 }} onClick={() => router.push('/onboarding')}>← 목록으로</button>
      </div>
    )
  }
  if (!hospital || !onboarding) {
    return (
      <div className="content" style={{ textAlign: 'center', paddingTop: 80 }}>
        <p style={{ color: 'var(--s400)' }}>존재하지 않는 병원입니다.</p>
        <button className="btn" style={{ marginTop: 16 }} onClick={() => router.push('/onboarding')}>← 목록으로</button>
      </div>
    )
  }

  const currentStep = onboarding.currentStep
  const pct         = onboarding.progressPct

  if (published) {
    return (
      <div className="content" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div className="card" style={{ maxWidth: 440, textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>온보딩 완료!</div>
          <div style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 4 }}>환자용 사이트가 생성되었습니다.</div>
          <div style={{ fontSize: 12, color: 'var(--navy)', fontFamily: 'monospace', marginBottom: 24 }}>
            {onboarding.publishedSiteUrl}
          </div>
          <button className="btn btn-primary" onClick={() => router.push('/onboarding')}>← 온보딩 목록으로</button>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHeader backHref="/onboarding" backLabel="온보딩 관리" title={hospital.nameKr}>
        <button className="btn">미리보기</button>
        <button className="btn btn-primary" onClick={completeStep} disabled={advancing}>
          {advancing ? '처리 중...' : currentStep < TOTAL_STEPS ? '다음 단계 →' : '🚀 게시하기'}
        </button>
      </PageHeader>

      {error && (
        <div style={{ margin: '0 24px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', color: '#DC2626', fontSize: 12 }}>
          ⚠ {error}
        </div>
      )}

      <div className="content">
        <div className="grid2" style={{ alignItems: 'start' }}>

          {/* 왼쪽: 단계 목록 */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--s100)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--s900)', marginBottom: 2 }}>{hospital.nameKr}</div>
                <div style={{ fontSize: 12, color: 'var(--s400)' }}>{hospital.nameJa}</div>
              </div>
              <span className={PLAN_BADGE[hospital.plan as keyof typeof PLAN_BADGE] ?? 'badge bdg-gray'}>{hospital.plan}</span>
            </div>

            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--s100)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--s500)', marginBottom: 6 }}>
                <span>전체 진행률</span>
                <span>{pct}% ({currentStep - 1}/{TOTAL_STEPS}단계 완료)</span>
              </div>
              <div className="prog-track">
                <div className="prog-fill pf-navy" style={{ width: `${pct}%`, transition: 'width .3s' }} />
              </div>
            </div>

            {STEPS.map(({ step, name, desc }) => {
              const done   = step < currentStep
              const active = step === currentStep
              return (
                <div
                  key={step}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '13px 20px',
                    borderBottom: '1px solid var(--s100)',
                    background: active ? 'var(--blue-l)' : 'transparent',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    background: done ? 'var(--navy)' : active ? 'var(--blue)' : 'var(--s200)',
                    color: done || active ? '#fff' : 'var(--s400)',
                  }}>
                    {done ? '✓' : step}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: done ? 'var(--s500)' : active ? 'var(--blue)' : 'var(--s400)' }}>
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
                <div className="card-title">Step {currentStep} — {STEPS[currentStep - 1]?.name}</div>
                <span className="badge bdg-blue">진행 중</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 20 }}>
                {STEPS[currentStep - 1]?.desc}
              </p>
              <StepContent
                step={currentStep}
                hospital={hospital}
                analyzeResult={analyzeResult}
                isAnalyzing={isAnalyzing}
                analyzeError={analyzeError}
                onAnalyze={handleAnalyze}
              />
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--s100)' }}>
                <div />
                <button className="btn btn-primary" onClick={completeStep} disabled={advancing}>
                  {advancing ? '처리 중...' : currentStep < TOTAL_STEPS ? '완료 후 다음 →' : '🚀 게시하기'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

interface StepContentProps {
  step:          number
  hospital:      HospitalDto
  analyzeResult: AnalyzeResultDto | null
  isAnalyzing:   boolean
  analyzeError:  string | null
  onAnalyze:     (url: string) => Promise<void>
}

function StepContent({ step, hospital, analyzeResult, isAnalyzing, analyzeError, onAnalyze }: StepContentProps) {
  const [url, setUrl] = useState(hospital.siteUrl ?? '')

  switch (step) {
    case 1:
      return (
        <div>
          <div style={{ fontSize: 12, color: 'var(--s500)', marginBottom: 6 }}>분석할 병원 홈페이지 URL</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://hospital.co.kr"
              style={{ flex: 1 }}
            />
            <button
              className="btn btn-primary"
              onClick={() => onAnalyze(url)}
              disabled={isAnalyzing || !url.trim()}
              style={{ whiteSpace: 'nowrap' }}
            >
              {isAnalyzing ? '분석 중...' : '🔍 자동 분석 시작'}
            </button>
          </div>

          {isAnalyzing && (
            <div style={{ padding: 20, background: 'var(--blue-l)', borderRadius: 8, textAlign: 'center', fontSize: 13, color: 'var(--blue)' }}>
              병원 홈페이지를 크롤링하고 있습니다...
            </div>
          )}

          {analyzeError && (
            <div style={{ padding: 12, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 12, color: '#DC2626' }}>
              ⚠ {analyzeError}
            </div>
          )}

          {analyzeResult && !isAnalyzing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: 14, background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, marginBottom: 8 }}>✓ 분석 완료</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--s500)' }}>진료과</span>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--s900)', marginTop: 2 }}>{analyzeResult.clinicType}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--s500)' }}>주요 시술</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {analyzeResult.specialties.map(s => (
                        <span key={s} style={{ padding: '2px 10px', background: 'var(--navy-l)', borderRadius: 20, fontSize: 12, color: 'var(--navy)', fontWeight: 500 }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: 14, background: 'var(--s50)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--s500)', fontWeight: 600, marginBottom: 8 }}>일본어 SEO 키워드 제안</div>
                {analyzeResult.suggestedKeywordsJa.map((kw, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < analyzeResult.suggestedKeywordsJa.length - 1 ? '1px solid var(--s200)' : 'none' }}>
                    <span style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 700, width: 18 }}>#{i + 1}</span>
                    <span style={{ fontSize: 13, color: 'var(--s700)' }}>{kw}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!analyzeResult && !isAnalyzing && !analyzeError && (
            <div style={{ padding: 14, background: 'var(--s50)', borderRadius: 8, fontSize: 12, color: 'var(--s500)' }}>
              병원 홈페이지를 크롤링해 이미지, 텍스트, 진료과 정보를 자동으로 추출합니다.
            </div>
          )}
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
          {['LINE 채널 연결', 'CRM 웹훅 설정', '카카오 채널 연결'].map((item, i) => (
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
          <div style={{ fontSize: 12, color: 'var(--s500)' }}>
            예정 URL: <span style={{ color: 'var(--navy)', fontWeight: 600 }}>jp.{hospital.nameKr.toLowerCase().replace(/\s/g, '')}.co.kr</span>
          </div>
        </div>
      )

    default:
      return null
  }
}
