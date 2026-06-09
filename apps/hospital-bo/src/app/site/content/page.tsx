export default function SiteContentPage() {
  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-back" style={{ marginRight: 4 }}>사이트 관리</span>
          <span className="topbar-sep">/</span>
          <span className="topbar-title" style={{ marginLeft: 4 }}>✏ 콘텐츠 편집</span>
        </div>
      </div>
      <div className="content">
        <StubCard
          icon="✏"
          title="콘텐츠 편집"
          description="환자용 사이트의 소개글, 시술 정보, FAQ 등 텍스트 콘텐츠를 편집합니다. AI가 일본어 번역을 자동으로 지원합니다."
          features={['섹션별 텍스트 편집기', 'AI 일본어 자동 번역', '시술 메뉴 관리', '이용 후기 관리']}
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
