export default function FunnelPage() {
  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">⚡ 채널 &amp; 자동 발송</span>
        </div>
      </div>
      <div className="content">
        <StubCard
          icon="⚡"
          title="채널 & 자동 발송"
          description="LINE, 이메일, SMS 채널 연결 및 자동 발송 시나리오를 설정합니다. 예약 확인, 리마인더, 사후 관리 메시지를 자동화할 수 있습니다."
          features={[
            '채널 연결 (LINE / 이메일 / SMS)',
            '자동 발송 시나리오 편집기',
            '전송 이력 & 통계',
            '수신 거부 관리',
          ]}
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
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', marginBottom: 10 }}>
        {title}
      </div>
      <p style={{ fontSize: 13, color: 'var(--s500)', lineHeight: 1.7, marginBottom: 24 }}>
        {description}
      </p>
      <div style={{
        background: 'var(--s50)', border: '1px solid var(--s200)',
        borderRadius: 10, padding: '16px 20px', marginBottom: 24, textAlign: 'left',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--s400)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>
          포함 기능
        </div>
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
