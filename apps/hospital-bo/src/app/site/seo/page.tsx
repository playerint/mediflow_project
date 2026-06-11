'use client'

import { useState, useEffect } from 'react'
import { getAllOnboardingStepData, saveOnboardingStepData } from '@/lib/api'
import { AEO_KEYWORDS, SEO_KEYWORDS, SITE_META } from '@/lib/mock-data'

interface SeoMeta {
  metaTitle:    string
  metaDesc:     string
  keywords:     string[]
  schemaType:   string
  gscConnected: boolean
}

/** 온보딩 단계 데이터에서 SEO 메타 추출 */
function buildSeoMetaFromSteps(stepData: Record<number, { data: string }>): Partial<SeoMeta> {
  try {
    const meta: Partial<SeoMeta> = {}

    // Step 8 — SEO 최종 설정 (metaTitle, metaDesc, keywords)
    if (stepData[8]?.data) {
      const d8 = JSON.parse(stepData[8].data)
      if (d8.metaTitle)  meta.metaTitle  = d8.metaTitle
      if (d8.metaDesc)   meta.metaDesc   = d8.metaDesc
      if (Array.isArray(d8.keywords)) meta.keywords = d8.keywords
    }

    // Step 2 — SEO/AEO 전략 (keywords 보완)
    if (!meta.keywords && stepData[2]?.data) {
      const d2 = JSON.parse(stepData[2].data)
      if (Array.isArray(d2.keywords)) meta.keywords = d2.keywords
      if (d2.metaTitle && !meta.metaTitle) meta.metaTitle = d2.metaTitle
      if (d2.metaDesc  && !meta.metaDesc)  meta.metaDesc  = d2.metaDesc
    }

    // Step 1 — AI 분석 결과에서 keywords 보완
    if (!meta.keywords && stepData[1]?.data) {
      const d1 = JSON.parse(stepData[1].data)
      if (Array.isArray(d1.keywords)) meta.keywords = d1.keywords
    }

    return meta
  } catch {
    return {}
  }
}

export default function SiteSeoPage() {
  const [meta,       setMeta]       = useState<SeoMeta>(SITE_META)
  const [saved,      setSaved]      = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [saving,     setSaving]     = useState(false)

  // 실API에서 SEO 데이터 로드
  useEffect(() => {
    async function loadSeo() {
      try {
        const allSteps  = await getAllOnboardingStepData()
        const apiMeta   = buildSeoMetaFromSteps(allSteps)
        if (Object.keys(apiMeta).length > 0) {
          setMeta(prev => ({ ...prev, ...apiMeta }))
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'SEO 데이터 로딩 오류')
      } finally {
        setLoading(false)
      }
    }
    loadSeo()
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await saveOnboardingStepData(8, {
        metaTitle:  meta.metaTitle,
        metaDesc:   meta.metaDesc,
        keywords:   meta.keywords,
        schemaType: meta.schemaType,
      }, false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'SEO 저장 오류')
    } finally {
      setSaving(false)
    }
  }

  function addKeyword() {
    if (!newKeyword.trim()) return
    setMeta(prev => ({ ...prev, keywords: [...prev.keywords, newKeyword.trim()] }))
    setNewKeyword('')
  }

  function removeKeyword(kw: string) {
    setMeta(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== kw) }))
  }

  if (loading) {
    return (
      <>
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">🔍 SEO · AEO</span>
          </div>
        </div>
        <div className="content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: 'var(--s400)', fontSize: 13 }}>
          SEO 데이터 불러오는 중...
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
          <span className="topbar-title">🔍 SEO · AEO</span>
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

          {/* 왼쪽: 메타 설정 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* 메타 태그 */}
            <div className="card">
              <div className="card-head" style={{ marginBottom: 16 }}>
                <span className="card-title">🏷 메타 태그</span>
                <button className="btn btn-sm" style={{ fontSize: 11 }}>🤖 AI 생성</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', display: 'block', marginBottom: 5 }}>
                    메타 타이틀 <span style={{ color: 'var(--s300)', fontWeight: 400 }}>({meta.metaTitle.length}/60자)</span>
                  </label>
                  <input type="text" value={meta.metaTitle}
                    onChange={e => setMeta(prev => ({ ...prev, metaTitle: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', fontSize: 12 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', display: 'block', marginBottom: 5 }}>
                    메타 디스크립션 <span style={{ color: 'var(--s300)', fontWeight: 400 }}>({meta.metaDesc.length}/160자)</span>
                  </label>
                  <textarea rows={3} value={meta.metaDesc}
                    onChange={e => setMeta(prev => ({ ...prev, metaDesc: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', fontSize: 12, resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', display: 'block', marginBottom: 5 }}>SEO 키워드</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {meta.keywords.map(kw => (
                      <span key={kw} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '3px 10px', background: 'var(--navy-l)', color: 'var(--navy)', borderRadius: 20 }}>
                        {kw}
                        <button onClick={() => removeKeyword(kw)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--s400)', fontSize: 12, lineHeight: 1, padding: 0 }}>×</button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input type="text" value={newKeyword} onChange={e => setNewKeyword(e.target.value)}
                      placeholder="키워드 추가..."
                      onKeyDown={e => { if (e.key === 'Enter') addKeyword() }}
                      style={{ flex: 1, fontSize: 12 }} />
                    <button className="btn btn-sm" onClick={addKeyword}>추가</button>
                  </div>
                </div>
              </div>
            </div>

            {/* 구조화 데이터 */}
            <div className="card">
              <div className="card-head" style={{ marginBottom: 12 }}>
                <span className="card-title">📋 구조화 데이터 (JSON-LD)</span>
                <span className="badge bdg-green">자동 생성됨</span>
              </div>
              {[
                { label: '스키마 타입', value: meta.schemaType },
                { label: 'FAQ 스키마', value: '3개 항목 생성됨' },
                { label: 'OGP 태그',  value: 'SNS 공유용 자동 설정' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--s100)', fontSize: 13 }}>
                  <span style={{ color: 'var(--s500)' }}>{row.label}</span>
                  <span style={{ color: 'var(--s700)', fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Google Search Console */}
            <div className="card">
              <div className="card-head" style={{ marginBottom: 12 }}>
                <span className="card-title">🌐 Google Search Console</span>
                <span className={`badge ${meta.gscConnected ? 'bdg-green' : 'bdg-gray'}`}>{meta.gscConnected ? '연결됨' : '미연결'}</span>
              </div>
              {!meta.gscConnected && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ fontSize: 13, color: 'var(--s500)', lineHeight: 1.6 }}>
                    Google Search Console을 연결하면 검색 노출수·클릭률·순위를 이 페이지에서 바로 확인할 수 있습니다.
                  </p>
                  <button className="btn btn-sm" style={{ alignSelf: 'flex-start' }}>GSC 연결하기</button>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 현황 (AEO/SEO 순위는 외부 데이터 — mock 유지) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* AEO 인용 현황 */}
            <div className="card">
              <div className="card-head" style={{ marginBottom: 12 }}>
                <span className="card-title">🧠 AEO 인용 현황</span>
                <span style={{ fontSize: 11, color: 'var(--s400)' }}>AI 검색 인용 횟수</span>
              </div>
              <table className="table" style={{ fontSize: 12 }}>
                <thead>
                  <tr>
                    <th>키워드</th>
                    <th style={{ textAlign: 'right' }}>인용</th>
                    <th style={{ textAlign: 'right' }}>증감</th>
                  </tr>
                </thead>
                <tbody>
                  {AEO_KEYWORDS.slice(0, 5).map(k => (
                    <tr key={k.keyword}>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.keyword}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--navy)' }}>{k.citations}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={k.delta > 0 ? 'up' : k.delta < 0 ? 'down' : ''}>
                          {k.delta > 0 ? `+${k.delta}` : k.delta}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SEO 키워드 순위 */}
            <div className="card">
              <div className="card-head" style={{ marginBottom: 12 }}>
                <span className="card-title">🔍 SEO 키워드 순위</span>
                <span style={{ fontSize: 11, color: 'var(--s400)' }}>Google Japan</span>
              </div>
              <table className="table" style={{ fontSize: 12 }}>
                <thead>
                  <tr>
                    <th>키워드</th>
                    <th style={{ textAlign: 'center' }}>순위</th>
                    <th style={{ textAlign: 'right' }}>월 검색</th>
                  </tr>
                </thead>
                <tbody>
                  {SEO_KEYWORDS.slice(0, 5).map(k => (
                    <tr key={k.keyword}>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.keyword}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, color: k.rank <= 5 ? 'var(--navy)' : 'var(--s500)' }}>{k.rank}위</span>
                        {k.rank < k.prevRank && <span className="up" style={{ marginLeft: 4, fontSize: 10 }}>↑{k.prevRank - k.rank}</span>}
                        {k.rank > k.prevRank && <span className="down" style={{ marginLeft: 4, fontSize: 10 }}>↓{k.rank - k.prevRank}</span>}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--s400)' }}>{k.volume.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
