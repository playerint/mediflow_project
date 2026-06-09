export default function SiteSeoPage() {
  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-back" style={{ marginRight: 4 }}>사이트 관리</span>
          <span className="topbar-sep">/</span>
          <span className="topbar-title" style={{ marginLeft: 4 }}>🔍 SEO·AEO</span>
        </div>
      </div>
      <div className="content">
        <StubCard
          icon="🔍"
          title="SEO · AEO 최적화"
          description="검색 엔진(Google Japan) 순위와 AI 검색(ChatGPT, Perplexity) 인용을 관리합니다. AI가 메타 태그와 구조화 데이터를 자동 생성합니다."
          features={['메타 태그 자동 생성 (AI)', 'AI 검색 인용 최적화 (AEO)', '구조화 데이터(Schema) 관리', 'Google Search Console 연동']}
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
