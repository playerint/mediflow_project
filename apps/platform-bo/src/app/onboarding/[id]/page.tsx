'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import {
  getHospital, getOnboarding, nextOnboardingStep, publishOnboarding,
  analyzeOnboarding, checkOnboardingCompliance, getStepData, saveStepData,
  type HospitalDto, type OnboardingDto, type AnalyzeResultDto, type ComplianceResultDto,
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

function buildMockJapaneseCopy(h: HospitalDto): string {
  return `韓国美容外科【${h.nameJa ?? h.nameKr}】

${h.nameKr}は、ソウルに位置する${h.clinicType}専門クリニックです。
経験豊富な医師チームが、患者様一人ひとりに合った施術プランをご提案いたします。

【主な施術メニュー】
・二重まぶた形成術（埋没法・切開法）
・鼻整形（隆鼻術・鼻尖縮小）
・小顔輪郭手術（エラ削り・頬骨縮小）
・脂肪吸引

日本語対応スタッフが常駐しており、初めての方も安心してご相談いただけます。
LINEでのご相談・お見積りも承っております。どうぞお気軽にどうぞ。`
}

export default function OnboardingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [hospital,   setHospital]   = useState<HospitalDto | null>(null)
  const [onboarding, setOnboarding] = useState<OnboardingDto | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [advancing,  setAdvancing]  = useState(false)
  const [published,  setPublished]  = useState(false)

  // Step 1
  const [analyzeResult,  setAnalyzeResult]  = useState<AnalyzeResultDto | null>(null)
  const [isAnalyzing,    setIsAnalyzing]    = useState(false)
  const [analyzeError,   setAnalyzeError]   = useState<string | null>(null)

  // Step 3
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  // Step 4
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  // Step 5
  const [japaneseCopy, setJapaneseCopy] = useState('')

  // Step 6
  const [complianceResult,      setComplianceResult]      = useState<ComplianceResultDto | null>(null)
  const [isCheckingCompliance,  setIsCheckingCompliance]  = useState(false)
  const [complianceError,       setComplianceError]       = useState<string | null>(null)

  // Step 7
  const [lineConnected, setLineConnected] = useState(false)

  const hospitalId = Number(id)

  const fetchData = useCallback(async () => {
    try {
      const [h, ob] = await Promise.all([getHospital(hospitalId), getOnboarding(hospitalId)])
      setHospital(h)
      setOnboarding(ob)

      // DB에 저장된 각 단계 데이터 복원
      const [step1, step3, step5] = await Promise.all([
        getStepData(hospitalId, 1),
        getStepData(hospitalId, 3),
        getStepData(hospitalId, 5),
      ])
      if (step1?.data) {
        try { setAnalyzeResult(JSON.parse(step1.data)) } catch { /* ignore */ }
      }
      if (step3?.data) {
        try { const d = JSON.parse(step3.data); setSelectedTemplate(d.templateId ?? null) } catch { /* ignore */ }
      }
      if (step5?.data) {
        try { const d = JSON.parse(step5.data); if (d.copy) setJapaneseCopy(d.copy) } catch { /* ignore */ }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '데이터 조회 오류')
    } finally {
      setLoading(false)
    }
  }, [hospitalId])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (hospital && !japaneseCopy) setJapaneseCopy(buildMockJapaneseCopy(hospital))
  }, [hospital, japaneseCopy])

  function canAdvance(step: number): boolean {
    switch (step) {
      case 1: return analyzeResult !== null
      case 3: return selectedTemplate !== null
      case 6: return complianceResult !== null
      default: return true
    }
  }

  function advanceHint(step: number): string | null {
    switch (step) {
      case 1: return '먼저 자동 분석을 실행해 주세요.'
      case 3: return '템플릿을 선택해 주세요.'
      case 6: return '컴플라이언스 검사를 먼저 실행해 주세요.'
      default: return null
    }
  }

  async function handleAnalyze(url: string) {
    setIsAnalyzing(true)
    setAnalyzeError(null)
    try {
      setAnalyzeResult(await analyzeOnboarding(hospitalId, url))
    } catch (e: unknown) {
      setAnalyzeError(e instanceof Error ? e.message : '분석 중 오류가 발생했습니다.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function handleCheckCompliance() {
    setIsCheckingCompliance(true)
    setComplianceError(null)
    try {
      setComplianceResult(await checkOnboardingCompliance(hospitalId, japaneseCopy))
    } catch (e: unknown) {
      setComplianceError(e instanceof Error ? e.message : '검사 중 오류가 발생했습니다.')
    } finally {
      setIsCheckingCompliance(false)
    }
  }

  async function completeStep() {
    if (!onboarding || advancing) return
    setAdvancing(true)
    try {
      // 현재 단계 데이터 저장
      const step = onboarding.currentStep
      if (step === 3 && selectedTemplate) {
        await saveStepData(hospitalId, 3, { templateId: selectedTemplate }, true)
      } else if (step === 5 && japaneseCopy) {
        await saveStepData(hospitalId, 5, { copy: japaneseCopy }, true)
      } else if (step === 7) {
        await saveStepData(hospitalId, 7, { lineConnected }, true)
      }

      if (onboarding.currentStep < TOTAL_STEPS) {
        setOnboarding(await nextOnboardingStep(hospitalId))
      } else {
        const siteUrl = `jp.${(hospital?.nameKr ?? 'clinic').toLowerCase().replace(/\s/g, '')}.co.kr`
        setOnboarding(await publishOnboarding(hospitalId, siteUrl))
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
  const ready       = canAdvance(currentStep)

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
        <button className="btn btn-primary" onClick={completeStep} disabled={advancing || !ready}>
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
                <div key={step} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 20px', borderBottom: '1px solid var(--s100)',
                  background: active ? 'var(--blue-l)' : 'transparent',
                }}>
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
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
                uploadedFiles={uploadedFiles}
                onUploadFiles={setUploadedFiles}
                japaneseCopy={japaneseCopy}
                onChangeCopy={setJapaneseCopy}
                complianceResult={complianceResult}
                isCheckingCompliance={isCheckingCompliance}
                complianceError={complianceError}
                onCheckCompliance={handleCheckCompliance}
                lineConnected={lineConnected}
                onConnectLine={() => setLineConnected(true)}
              />
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--s100)' }}>
                {!ready && advanceHint(currentStep) && (
                  <p style={{ fontSize: 12, color: 'var(--s400)', marginBottom: 10 }}>
                    ⚠ {advanceHint(currentStep)}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary" onClick={completeStep} disabled={advancing || !ready}>
                    {advancing ? '처리 중...' : currentStep < TOTAL_STEPS ? '완료 후 다음 →' : '🚀 게시하기'}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

// ── 템플릿 목록 ──────────────────────────────────────────────────
const TEMPLATES = [
  { id: 'modern-clean',    name: '모던 클린',   emoji: '⬜', desc: '화이트 베이스, 세련된 레이아웃' },
  { id: 'luxury-dark',     name: '럭셔리 다크', emoji: '⬛', desc: '프리미엄 다크 테마, 고급스러운 분위기' },
  { id: 'bright-friendly', name: '밝고 친근',   emoji: '🟡', desc: '따뜻한 컬러, 친근하고 접근하기 쉬운' },
  { id: 'minimal',         name: '미니멀',      emoji: '◻',  desc: '최소한의 요소, 콘텐츠 중심 구성' },
]

// ── StepContent ───────────────────────────────────────────────
interface StepContentProps {
  step:                  number
  hospital:              HospitalDto
  analyzeResult:         AnalyzeResultDto | null
  isAnalyzing:           boolean
  analyzeError:          string | null
  onAnalyze:             (url: string) => Promise<void>
  selectedTemplate:      string | null
  onSelectTemplate:      (t: string) => void
  uploadedFiles:         string[]
  onUploadFiles:         (names: string[]) => void
  japaneseCopy:          string
  onChangeCopy:          (v: string) => void
  complianceResult:      ComplianceResultDto | null
  isCheckingCompliance:  boolean
  complianceError:       string | null
  onCheckCompliance:     () => Promise<void>
  lineConnected:         boolean
  onConnectLine:         () => void
}

function StepContent(props: StepContentProps) {
  const {
    step, hospital, analyzeResult, isAnalyzing, analyzeError, onAnalyze,
    selectedTemplate, onSelectTemplate,
    uploadedFiles, onUploadFiles,
    japaneseCopy, onChangeCopy,
    complianceResult, isCheckingCompliance, complianceError, onCheckCompliance,
    lineConnected, onConnectLine,
  } = props

  const [urlInput, setUrlInput] = useState(hospital.siteUrl ?? '')

  switch (step) {

    // ── Step 1: 병원 자동 분석 ──────────────────────────────────
    case 1:
      return (
        <div>
          <div style={{ fontSize: 12, color: 'var(--s500)', marginBottom: 6 }}>분석할 병원 홈페이지 URL</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input type="text" value={urlInput} onChange={e => setUrlInput(e.target.value)}
              placeholder="https://hospital.co.kr"
              style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={() => onAnalyze(urlInput)}
              disabled={isAnalyzing || !urlInput.trim()} style={{ whiteSpace: 'nowrap' }}>
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
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: 'var(--s500)' }}>진료과</span>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--s900)', marginTop: 2 }}>{analyzeResult.clinicType}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--s500)' }}>주요 시술</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    {analyzeResult.specialties.map(s => (
                      <span key={s} style={{ padding: '2px 10px', background: 'var(--navy-l)', borderRadius: 20, fontSize: 12, color: 'var(--navy)', fontWeight: 500 }}>{s}</span>
                    ))}
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

    // ── Step 2: SEO·AEO 전략 수립 ──────────────────────────────
    case 2:
      return (
        <div>
          {analyzeResult ? (
            <>
              <div style={{ padding: 14, background: 'var(--navy-l)', borderRadius: 8, marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>타겟 키워드 ({analyzeResult.suggestedKeywordsJa.length}개)</div>
                {analyzeResult.suggestedKeywordsJa.map((kw, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: i < analyzeResult.suggestedKeywordsJa.length - 1 ? '1px solid var(--s200)' : 'none' }}>
                    <span style={{ width: 20, fontSize: 11, color: 'var(--teal)', fontWeight: 700 }}>#{i + 1}</span>
                    <span style={{ fontSize: 13, color: 'var(--s700)' }}>{kw}</span>
                  </div>
                ))}
              </div>
              {[
                { icon: '🎯', title: 'AEO 인용 최적화', desc: 'Perplexity·ChatGPT 답변에 클리닉명이 인용되도록 FAQ 구조화' },
                { icon: '📈', title: 'SEO 검색 순위',   desc: '일본어 키워드 기반 메타태그·구조화 데이터 자동 생성' },
                { icon: '💬', title: 'LINE 유입 전략',  desc: '검색 → LINE 상담 연결 CTA 자동 배치' },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', gap: 12, padding: 12, background: 'var(--s50)', borderRadius: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--s800)', marginBottom: 2 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--s500)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div style={{ padding: 14, background: '#FEF9C3', border: '1px solid #FDE68A', borderRadius: 8, fontSize: 12, color: '#92400E' }}>
              ⚠ Step 1(병원 자동 분석)을 먼저 완료하면 키워드 전략이 자동으로 생성됩니다.
            </div>
          )}
        </div>
      )

    // ── Step 3: 사이트 템플릿 선택 ─────────────────────────────
    case 3:
      return (
        <div>
          <div style={{ fontSize: 12, color: 'var(--s500)', marginBottom: 12 }}>환자용 사이트 디자인 템플릿을 선택해 주세요.</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => onSelectTemplate(t.id)} style={{
                padding: '16px 14px', textAlign: 'left', cursor: 'pointer',
                border: `2px solid ${selectedTemplate === t.id ? 'var(--blue)' : 'var(--s200)'}`,
                borderRadius: 8,
                background: selectedTemplate === t.id ? 'var(--blue-l)' : 'var(--s50)',
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{t.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: selectedTemplate === t.id ? 'var(--blue)' : 'var(--s800)', marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--s500)' }}>{t.desc}</div>
              </button>
            ))}
          </div>
          {selectedTemplate && (
            <div style={{ marginTop: 12, padding: 10, background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 8, fontSize: 12, color: '#16A34A' }}>
              ✓ 선택됨: {TEMPLATES.find(t => t.id === selectedTemplate)?.name}
            </div>
          )}
        </div>
      )

    // ── Step 4: 이미지 업로드 ───────────────────────────────────
    case 4:
      return (
        <div>
          <input type="file" accept="image/*" multiple id="img-upload" style={{ display: 'none' }}
            onChange={e => {
              const names = Array.from(e.target.files ?? []).map(f => f.name)
              onUploadFiles([...uploadedFiles, ...names])
            }}
          />
          <label htmlFor="img-upload" style={{
            display: 'block', border: '2px dashed var(--s200)', borderRadius: 10,
            padding: 40, textAlign: 'center', color: 'var(--s400)', cursor: 'pointer',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
            <div style={{ fontSize: 13, marginBottom: 4 }}>클릭하여 이미지 선택</div>
            <div style={{ fontSize: 11, color: 'var(--s300)' }}>JPG, PNG, WEBP 권장 (최대 10MB)</div>
          </label>
          {uploadedFiles.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--s500)', marginBottom: 8 }}>선택된 파일 ({uploadedFiles.length}개)</div>
              {uploadedFiles.map((name, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--s100)', fontSize: 12 }}>
                  <span>🖼</span>
                  <span style={{ flex: 1, color: 'var(--s700)' }}>{name}</span>
                  <button onClick={() => onUploadFiles(uploadedFiles.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--s400)', fontSize: 11 }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )

    // ── Step 5: 일본어 카피 검수 ────────────────────────────────
    case 5:
      return (
        <div>
          <div style={{ fontSize: 12, color: 'var(--s500)', marginBottom: 8 }}>AI가 생성한 일본어 카피를 검토·수정하세요.</div>
          <textarea
            value={japaneseCopy}
            onChange={e => onChangeCopy(e.target.value)}
            style={{
              width: '100%', height: 220, padding: 12, boxSizing: 'border-box',
              border: '1px solid var(--s200)', borderRadius: 8,
              fontSize: 12, lineHeight: 1.7, resize: 'vertical', fontFamily: 'inherit',
            }}
          />
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--s400)' }}>
            ✏ 과대광고 표현이 포함되면 Step 6 컴플라이언스 검사에서 걸립니다. 수정 후 진행하세요.
          </div>
        </div>
      )

    // ── Step 6: 컴플라이언스 검사 ───────────────────────────────
    case 6:
      return (
        <div>
          <div style={{ fontSize: 12, color: 'var(--s500)', marginBottom: 12 }}>
            Step 5에서 작성한 일본어 카피를 의료 광고법 기준으로 자동 검사합니다.
          </div>
          <button className="btn btn-primary" onClick={onCheckCompliance}
            disabled={isCheckingCompliance}
            style={{ width: '100%', marginBottom: 14 }}>
            {isCheckingCompliance ? '검사 중...' : '🔍 컴플라이언스 검사 시작'}
          </button>

          {complianceError && (
            <div style={{ padding: 10, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 12, color: '#DC2626', marginBottom: 12 }}>
              ⚠ {complianceError}
            </div>
          )}

          {complianceResult && !isCheckingCompliance && (
            <div>
              <div style={{
                padding: 12, borderRadius: 8, marginBottom: 12,
                background: complianceResult.compliant ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${complianceResult.compliant ? '#86EFAC' : '#FECACA'}`,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: complianceResult.violations.length > 0 ? 8 : 0, color: complianceResult.compliant ? '#16A34A' : '#DC2626' }}>
                  {complianceResult.compliant ? '✓ 컴플라이언스 통과' : `⚠ 위반 항목 ${complianceResult.violations.length}건 발견`}
                </div>
                {complianceResult.violations.map((v, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#DC2626', padding: '3px 0' }}>
                    • [{v.severity === 'high' ? '높음' : '보통'}] {v.rule}
                    {v.pattern && <span style={{ color: '#9B1C1C' }}> — 「{v.pattern}」</span>}
                  </div>
                ))}
              </div>
              {complianceResult.suggestions.length > 0 && (
                <div style={{ padding: 12, background: 'var(--s50)', borderRadius: 8, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: 'var(--s700)', marginBottom: 6 }}>수정 제안</div>
                  {complianceResult.suggestions.map((s, i) => (
                    <div key={i} style={{ padding: '3px 0', color: 'var(--s500)' }}>• {s}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!complianceResult && !isCheckingCompliance && !complianceError && (
            <div style={{ padding: 12, background: 'var(--s50)', borderRadius: 8, fontSize: 12, color: 'var(--s500)' }}>
              과대광고·비교광고·환자후기·가격비교·효과보장 표현을 자동으로 탐지합니다.
            </div>
          )}
        </div>
      )

    // ── Step 7: 채널 연동 ───────────────────────────────────────
    case 7:
      return (
        <div>
          {[
            { name: 'LINE 공식 채널', tag: '권장', action: true },
            { name: 'CRM 웹훅 설정', tag: '선택',  action: false },
            { name: '카카오 채널',   tag: '선택',  action: false },
          ].map((item, i) => (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid var(--s100)' }}>
              <span style={{ fontSize: 13, flex: 1 }}>
                {item.name}
                <span style={{ fontSize: 10, color: 'var(--s400)', marginLeft: 6 }}>({item.tag})</span>
              </span>
              {i === 0 ? (
                lineConnected
                  ? <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>✓ 연결됨</span>
                  : <button className="btn btn-primary" style={{ fontSize: 11, padding: '3px 10px' }} onClick={onConnectLine}>연결하기</button>
              ) : (
                <span style={{ fontSize: 11, color: 'var(--s400)' }}>나중에 설정</span>
              )}
            </div>
          ))}
          <div style={{ marginTop: 12, padding: 10, background: 'var(--s50)', borderRadius: 8, fontSize: 11, color: 'var(--s500)' }}>
            LINE 채널은 나중에 병원용 BO에서도 연결할 수 있습니다.
          </div>
        </div>
      )

    // ── Step 8: SEO 최종 설정 ───────────────────────────────────
    case 8: {
      const nameForSeo = hospital.nameJa ?? hospital.nameKr
      const metaTitle = `${nameForSeo} | ${hospital.clinicType} | ソウル 韓国`
      const metaDesc  = `ソウルの${hospital.clinicType}クリニック。日本語対応スタッフ常駐。LINE相談可。`
      return (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'メタタイトル',          value: metaTitle },
              { label: 'メタディスクリプション', value: metaDesc  },
              { label: '構造化データ (JSON-LD)',  value: 'MedicalClinic スキーマ — 自動生成済み' },
              { label: 'FAQ 最適化',             value: 'よくある質問 3件 自動生成済み' },
              { label: 'OGP タグ',               value: 'SNSシェア用タグ — 自動設定済み' },
            ].map(item => (
              <div key={item.label} style={{ padding: '10px 14px', background: 'var(--s50)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--s500)', flexShrink: 0 }}>{item.label}</span>
                <span style={{ fontSize: 12, color: 'var(--s800)', textAlign: 'right' }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: 10, background: 'var(--s50)', borderRadius: 8, fontSize: 11, color: 'var(--s500)' }}>
            게시 후 Google Search Console 등록은 병원용 BO의 사이트 관리 메뉴에서 합니다.
          </div>
        </div>
      )
    }

    // ── Step 9: 최종 검토 및 게시 ───────────────────────────────
    case 9: {
      const siteUrl   = `jp.${(hospital.nameKr ?? 'clinic').toLowerCase().replace(/\s/g, '')}.co.kr`
      const checklist = [
        { label: '병원 자동 분석 완료',  done: true },
        { label: 'SEO·AEO 전략 수립',    done: true },
        { label: '사이트 템플릿 선택',   done: selectedTemplate !== null },
        { label: '이미지 업로드',         done: uploadedFiles.length > 0 },
        { label: '일본어 카피 작성',      done: japaneseCopy.length > 0 },
        { label: '컴플라이언스 통과',     done: complianceResult?.compliant === true },
        { label: 'LINE 채널 연동',        done: lineConnected },
        { label: 'SEO 설정 완료',         done: true },
      ]
      return (
        <div>
          <div style={{ marginBottom: 16 }}>
            {checklist.map(c => (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--s100)' }}>
                <span style={{ fontSize: 14 }}>{c.done ? '✅' : '◻'}</span>
                <span style={{ fontSize: 13, color: c.done ? 'var(--s700)' : 'var(--s400)' }}>{c.label}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: 16, background: 'var(--navy-l)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--s500)', marginBottom: 4 }}>게시 후 생성될 URL</div>
            <div style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 700, fontFamily: 'monospace' }}>
              https://{siteUrl}
            </div>
          </div>
        </div>
      )
    }

    default:
      return null
  }
}
