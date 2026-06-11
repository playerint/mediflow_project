'use client'

import { useState, useEffect } from 'react'
import { getAllOnboardingStepData, saveOnboardingStepData } from '@/lib/api'
import { SITE_SECTIONS, type SiteSection } from '@/lib/mock-data'

/** Step 5 데이터에서 SiteSection 배열로 변환 */
function buildSectionsFromStepData(stepData: Record<number, { data: string }>): SiteSection[] | null {
  try {
    // Step 5: { copy: "전체 일본어 카피 텍스트" }
    const step5 = stepData[5]
    const step1 = stepData[1]

    if (!step5?.data && !step1?.data) return null

    const sections: SiteSection[] = []

    // Step 5 — 일본어 카피 (히어로/소개 텍스트)
    if (step5?.data) {
      const d5 = JSON.parse(step5.data)
      const copy: string = d5.copy ?? ''
      if (copy) {
        sections.push({
          id: 'hero', name: '히어로 섹션', emoji: '🏷',
          fields: [
            { key: 'tagline',    label: '메인 타이틀 (일본어)', value: copy.split('\n')[0] ?? '', multiline: false },
            { key: 'taglineSub', label: '서브 타이틀 (일본어)',  value: copy.split('\n')[2] ?? '' },
            { key: 'cta',        label: 'CTA 버튼 텍스트',      value: 'LINEで無料相談' },
          ],
        })
        sections.push({
          id: 'about', name: '클리닉 소개', emoji: '🏥',
          fields: [
            { key: 'copy', label: '소개 본문 (일본어)', value: copy, multiline: true },
          ],
        })
      }
    }

    // Step 1 — AI 분석 결과에서 FAQ 추출
    if (step1?.data) {
      const d1 = JSON.parse(step1.data)
      const faqs: Array<{ question?: string; answer?: string }> = d1.faqs ?? []
      if (faqs.length > 0) {
        sections.push({
          id: 'faq', name: 'FAQ', emoji: '❓',
          fields: faqs.slice(0, 3).flatMap((faq, i) => [
            { key: `faq${i + 1}q`, label: `Q${i + 1} 질문`, value: faq.question ?? '' },
            { key: `faq${i + 1}a`, label: `Q${i + 1} 답변`, value: faq.answer ?? '', multiline: true },
          ]),
        })
      }
    }

    return sections.length > 0 ? sections : null
  } catch {
    return null
  }
}

export default function SiteContentPage() {
  // 섹션 데이터 (초기값: mock)
  const [sections,       setSections]       = useState<SiteSection[]>(SITE_SECTIONS)
  const [activeSection,  setActiveSection]  = useState(SITE_SECTIONS[0].id)
  const [fields,         setFields]         = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    SITE_SECTIONS.forEach(sec => sec.fields.forEach(f => { init[`${sec.id}.${f.key}`] = f.value }))
    return init
  })
  const [saved,       setSaved]       = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [saving,      setSaving]      = useState(false)

  // 실API에서 온보딩 단계 데이터 로드
  useEffect(() => {
    async function loadContent() {
      try {
        const allSteps = await getAllOnboardingStepData()
        const apiSections = buildSectionsFromStepData(allSteps)
        if (apiSections && apiSections.length > 0) {
          setSections(apiSections)
          setActiveSection(apiSections[0].id)
          const init: Record<string, string> = {}
          apiSections.forEach(sec => sec.fields.forEach(f => { init[`${sec.id}.${f.key}`] = f.value }))
          setFields(init)
        }
        // API 데이터가 없으면 mock 유지
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : '콘텐츠 로딩 오류')
        // 에러 시 mock 데이터로 폴백 (이미 useState 초기값이 mock)
      } finally {
        setLoading(false)
      }
    }
    loadContent()
  }, [])

  const section = sections.find(s => s.id === activeSection) ?? sections[0]

  async function handleSave() {
    setSaving(true)
    try {
      // Step 5에 현재 콘텐츠 저장
      const heroSection  = sections.find(s => s.id === 'hero')
      const aboutSection = sections.find(s => s.id === 'about')
      const copy = aboutSection
        ? (fields[`about.copy`] ?? '')
        : heroSection
          ? [fields['hero.tagline'], '', fields['hero.taglineSub']].join('\n')
          : ''

      await saveOnboardingStepData(5, { copy }, false)

      // Step 8 (SEO 최종 설정 단계)에 FAQ 저장
      const faqSection = sections.find(s => s.id === 'faq')
      if (faqSection) {
        const faqs = []
        for (let i = 1; i <= 5; i++) {
          const q = fields[`faq.faq${i}q`]
          const a = fields[`faq.faq${i}a`]
          if (q && a) faqs.push({ question: q, answer: a })
        }
        if (faqs.length > 0) {
          await saveOnboardingStepData(8, { faqs }, false)
        }
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '저장 오류')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">✏ 콘텐츠 편집</span>
          </div>
        </div>
        <div className="content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: 'var(--s400)', fontSize: 13 }}>
          콘텐츠 불러오는 중...
        </div>
      </>
    )
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <a href="/site/preview" style={{ fontSize: 12, color: 'var(--s400)', textDecoration: 'none' }}>사이트 관리</a>
          <span style={{ margin: '0 6px', color: 'var(--s300)' }}>/</span>
          <span className="topbar-title">✏ 콘텐츠 편집</span>
        </div>
        <div className="topbar-right">
          {saved && <span style={{ fontSize: 12, color: '#16A34A' }}>✓ 저장 완료</span>}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      <div className="content">
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--rl)', padding: '10px 16px', marginBottom: 14, fontSize: 13, color: '#DC2626' }}>
            ⚠ {error} — 임시 데이터를 표시합니다.
          </div>
        )}

        <div className="grid2" style={{ alignItems: 'start' }}>

          {/* 왼쪽: 섹션 목록 */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', maxWidth: 260 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--s100)', fontSize: 11, fontWeight: 700, color: 'var(--s400)', letterSpacing: '.05em', textTransform: 'uppercase' }}>
              섹션 선택
            </div>
            {sections.map(sec => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '13px 16px',
                  borderBottom: '1px solid var(--s100)', border: 'none', cursor: 'pointer',
                  background: activeSection === sec.id ? 'var(--navy-l)' : 'transparent',
                  textAlign: 'left', fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: 18 }}>{sec.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: activeSection === sec.id ? 700 : 400, color: activeSection === sec.id ? 'var(--navy)' : 'var(--s700)' }}>
                  {sec.name}
                </span>
                {activeSection === sec.id && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--blue)' }}>편집 중</span>}
              </button>
            ))}
          </div>

          {/* 오른쪽: 필드 편집 */}
          <div className="card">
            <div className="card-head" style={{ marginBottom: 20 }}>
              <span className="card-title">{section.emoji} {section.name}</span>
              <button className="btn btn-sm" style={{ fontSize: 11 }}>🤖 AI 번역</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {section.fields.map(f => {
                const fKey = `${section.id}.${f.key}`
                return (
                  <div key={f.key}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', display: 'block', marginBottom: 6 }}>
                      {f.label}
                    </label>
                    {f.multiline ? (
                      <textarea
                        rows={4}
                        value={fields[fKey] ?? ''}
                        onChange={e => setFields(prev => ({ ...prev, [fKey]: e.target.value }))}
                        style={{ width: '100%', boxSizing: 'border-box', fontSize: 13, resize: 'vertical', lineHeight: 1.65, fontFamily: 'inherit' }}
                      />
                    ) : (
                      <input
                        type="text"
                        value={fields[fKey] ?? ''}
                        onChange={e => setFields(prev => ({ ...prev, [fKey]: e.target.value }))}
                        style={{ width: '100%', boxSizing: 'border-box', fontSize: 13 }}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--s100)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {saved && <span style={{ fontSize: 12, color: '#16A34A', alignSelf: 'center' }}>✓ 저장 완료</span>}
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
