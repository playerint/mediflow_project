'use client'

import { useState } from 'react'
import { SITE_IMAGES, type SiteImage } from '@/lib/mock-data'

export default function SiteAssetsPage() {
  const [images, setImages] = useState<SiteImage[]>(SITE_IMAGES)
  const [filter, setFilter] = useState<string>('전체')

  const sections = ['전체', ...Array.from(new Set(SITE_IMAGES.map(img => img.section)))]
  const filtered = filter === '전체' ? images : images.filter(img => img.section === filter)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newImages: SiteImage[] = files.map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      section: '미분류',
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      date: new Date().toISOString().slice(0, 10),
      emoji: '🖼',
    }))
    setImages(prev => [...newImages, ...prev])
    e.target.value = ''
  }

  function removeImage(id: number) {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <a href="/site/preview" style={{ fontSize: 12, color: 'var(--s400)', textDecoration: 'none' }}>사이트 관리</a>
          <span style={{ margin: '0 6px', color: 'var(--s300)' }}>/</span>
          <span className="topbar-title">🖼 이미지 관리</span>
        </div>
        <div className="topbar-right">
          <span style={{ fontSize: 12, color: 'var(--s400)' }}>총 {images.length}개</span>
          <label htmlFor="upload-input" className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
            + 이미지 추가
          </label>
          <input id="upload-input" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
      </div>

      <div className="content">

        {/* 업로드 드롭존 */}
        <label htmlFor="upload-input" style={{
          display: 'block', border: '2px dashed var(--s200)', borderRadius: 10,
          padding: '28px 20px', textAlign: 'center', cursor: 'pointer', marginBottom: 20,
          background: 'var(--s50)',
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>📁</div>
          <div style={{ fontSize: 13, color: 'var(--s500)' }}>클릭하거나 이미지를 여기로 드래그하세요</div>
          <div style={{ fontSize: 11, color: 'var(--s300)', marginTop: 4 }}>JPG, PNG, WEBP · 최대 10MB</div>
        </label>

        {/* 섹션 필터 */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {sections.map(sec => (
            <button key={sec} onClick={() => setFilter(sec)} className={`pill${filter === sec ? ' on' : ''}`} style={{ fontSize: 12 }}>
              {sec}
            </button>
          ))}
        </div>

        {/* 이미지 그리드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {filtered.map(img => (
            <div key={img.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* 썸네일 */}
              <div style={{ height: 110, background: 'var(--s100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, position: 'relative' }}>
                {img.emoji}
                <button
                  onClick={() => removeImage(img.id)}
                  style={{
                    position: 'absolute', top: 6, right: 6,
                    background: 'rgba(0,0,0,.45)', color: '#fff',
                    border: 'none', borderRadius: '50%', width: 22, height: 22,
                    cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >✕</button>
              </div>
              {/* 정보 */}
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--s800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
                  {img.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--s400)' }}>
                  <span style={{ background: 'var(--s100)', padding: '1px 6px', borderRadius: 4 }}>{img.section}</span>
                  <span>{img.size}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--s300)', fontSize: 13 }}>
            이미지가 없습니다
          </div>
        )}
      </div>
    </>
  )
}
