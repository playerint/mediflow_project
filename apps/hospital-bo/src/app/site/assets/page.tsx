export default function SiteAssetsPage() {
  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-back" style={{ marginRight: 4 }}>사이트 관리</span>
          <span className="topbar-sep">/</span>
          <span className="topbar-title" style={{ marginLeft: 4 }}>🖼 이미지 관리</span>
        </div>
      </div>
      <div className="content">
        <StubCard
          icon="🖼"
          title="이미지 관리"
          description="환자용 사이트에 사용되는 병원 사진, 시술 전후 비교 이미지, 배너 등을 업로드하고 관리합니다."
          features={['이미지 업로드 & 삭제', '섹션별 이미지 매핑', '전후 사진 갤러리', '이미지 최적화 자동 처리']}
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
