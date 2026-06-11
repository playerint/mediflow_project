'use client'

import { useState } from 'react'
import { HOSPITAL_INFO } from '@/lib/mock-data'

type Device = 'desktop' | 'mobile'

const SITE_URL = process.env.NEXT_PUBLIC_PATIENT_SITE_URL ?? 'http://localhost:3002'

export default function SitePreviewPage() {
  const [device, setDevice] = useState<Device>('desktop')
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(true)

  async function handlePublish() {
    setPublishing(true)
    await new Promise(r => setTimeout(r, 1200))
    setPublished(true)
    setPublishing(false)
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <a href="/site/preview" style={{ fontSize: 12, color: 'var(--s400)', textDecoration: 'none' }}>사이트 관리</a>
          <span style={{ margin: '0 6px', color: 'var(--s300)' }}>/</span>
          <span className="topbar-title">👁 미리보기 &amp; 게시</span>
        </div>
        <div className="topbar-right">
          <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="btn">
            🌐 라이브 사이트 열기
          </a>
          <button className="btn btn-primary" onClick={handlePublish} disabled={publishing}>
            {publishing ? '게시 중...' : published ? '🔄 재게시' : '🚀 게시하기'}
          </button>
        </div>
      </div>

      <div className="content">

        {/* 현재 사이트 상태 */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-head">
            <span className="card-title">🌐 사이트 현황</span>
            <span className={`badge ${published ? 'bdg-green' : 'bdg-gray'}`}>{published ? '게시 중' : '비공개'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {[
              { label: '사이트 URL', value: HOSPITAL_INFO.siteUrl },
              { label: '마지막 게시', value: '2026-06-07 14:22' },
              { label: '대기 중인 변경', value: '없음' },
            ].map(s => (
              <div key={s.label} style={{ padding: '10px 16px', borderRight: '1px solid var(--s100)' }}>
                <div style={{ fontSize: 11, color: 'var(--s400)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--s700)' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 디바이스 전환 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--s100)', borderRadius: 8, padding: 3 }}>
            {(['desktop', 'mobile'] as Device[]).map(d => (
              <button key={d} onClick={() => setDevice(d)} style={{
                padding: '5px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 12, fontFamily: 'inherit',
                background: device === d ? 'var(--s0)' : 'transparent',
                color: device === d ? 'var(--navy)' : 'var(--s500)',
                fontWeight: device === d ? 600 : 400,
                boxShadow: device === d ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
              }}>
                {d === 'desktop' ? '🖥 데스크톱' : '📱 모바일'}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 11, color: 'var(--s400)' }}>환자용 사이트 미리보기</span>
        </div>

        {/* iframe 미리보기 */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: device === 'desktop' ? '100%' : 390,
            border: '1px solid var(--s200)',
            borderRadius: device === 'mobile' ? 20 : 8,
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,.08)',
            transition: 'width .3s',
          }}>
            <div style={{
              background: 'var(--s100)', padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 6,
              borderBottom: '1px solid var(--s200)',
            }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FCA5A5', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FDE68A', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#86EFAC', display: 'inline-block' }} />
              <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--s400)', flex: 1, textAlign: 'center' }}>{SITE_URL}</span>
            </div>
            <iframe
              src={SITE_URL}
              style={{
                width: '100%',
                height: device === 'desktop' ? 640 : 780,
                border: 'none',
                display: 'block',
              }}
              title="환자용 사이트 미리보기"
            />
          </div>
        </div>

        <div style={{ marginTop: 12, padding: '10px 16px', background: 'var(--s50)', borderRadius: 8, fontSize: 12, color: 'var(--s400)' }}>
          💡 미리보기는 현재 실행 중인 환자용 사이트(localhost:3002)를 그대로 보여줍니다. 콘텐츠 수정 후 <strong>재게시</strong>하면 변경 사항이 반영됩니다.
        </div>
      </div>
    </>
  )
}
