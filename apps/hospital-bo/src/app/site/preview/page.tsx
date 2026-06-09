import { HOSPITAL_INFO } from '@/lib/mock-data'

export default function SitePreviewPage() {
  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-back" style={{ marginRight: 4 }}>사이트 관리</span>
          <span className="topbar-sep">/</span>
          <span className="topbar-title" style={{ marginLeft: 4 }}>👁 미리보기 &amp; 게시</span>
        </div>
        <div className="topbar-right">
          <a
            href={`https://${HOSPITAL_INFO.siteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            🌐 라이브 사이트 열기
          </a>
        </div>
      </div>
      <div className="content">
        {/* 현재 사이트 상태 */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-head">
            <span className="card-title">🌐 사이트 현황</span>
            <span className="badge bdg-green">게시 중</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {[
              { label: '사이트 URL', value: HOSPITAL_INFO.siteUrl },
              { label: '마지막 게시', value: '2026-06-07 14:22' },
              { label: '대기 중인 변경', value: '없음' },
            ].map((s) => (
              <div key={s.label} style={{ padding: '10px 16px', borderRight: '1px solid var(--s100)' }}>
                <div style={{ fontSize: 11, color: 'var(--s400)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--s700)' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        <StubCard
          icon="👁"
          title="미리보기 & 게시"
          description="변경 사항을 저장하기 전 미리보기로 확인하고, 준비가 되면 환자 사이트에 게시합니다."
          features={['변경 사항 미리보기 (iframe)', '모바일 / 데스크톱 전환', '게시 이력 관리', '게시 취소 (롤백)']}
        />
      </div>
    </>
  )
}

function StubCard({ icon, title, description, features }: {
  icon: string; title: string; description: string; features: string[]
}) {
  return (
    <div className="card" style={{ maxWidth: 560, textAlign: 'center', padding: '48px 40px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', marginBottom: 10 }}>{title}</div>
      <p style={{ fontSize: 13, color: 'var(--s500)', lineHeight: 1.7, marginBottom: 24 }}>{description}</p>
      <div style={{ background: 'var(--s50)', border: '1px solid var(--s200)', borderRadius: 10, padding: '16px 20px', marginBottom: 24, textAlign: 'left' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--s400)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>포함 기능</div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {features.map((f) => (
            <li key={f} style={{ fontSize: 13, color: 'var(--s700)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#16A34A' }}>✓</span> {f}
            </li>
          ))}
        </ul>
      </div>
      <span className="badge bdg-gray" style={{ fontSize: 12, padding: '6px 14px' }}>개발 예정</span>
    </div>
  )
}
