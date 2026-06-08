import Link from 'next/link'
import { HOSPITALS, ONBOARDING_STEPS, ONBOARDING_PROGRESS, PLAN_BADGE, STATUS_LABEL } from '@/lib/mock-data'

const KPI = [
  { label: '🏥 입점 병원',        value: 12,    unit: '개',  delta: '↑ 이번 달 +2개',     href: '/hospitals' },
  { label: '🚀 온보딩 진행 중',   value: 3,     unit: '건',  delta: '평균 4.2일 소요',     href: '/onboarding' },
  { label: '💳 이번 달 매출',     value: '8.4', unit: 'M',   delta: '↑ 전월 대비 +12%',   href: '/billing' },
  { label: '🎧 미처리 CS',        value: 7,     unit: '건',  delta: '↑ 긴급 2건 포함',     href: '/cs' },
  { label: '💬 전체 병원 문의',   value: 184,   unit: '건',  delta: '↑ 전월 대비 +31%',   href: '/crm' },
  { label: '📋 계약 갱신 임박',   value: 2,     unit: '건',  delta: '30일 이내',            href: '/contract' },
  { label: '⚠ 컴플라이언스 위반', value: 3,     unit: '건',  delta: '즉시 처리 필요',       href: '/hospitals' },
  { label: '🧠 AEO 인용 (전체)', value: 142,   unit: '회',  delta: '↑ +48회',             href: '/reports' },
]

const URGENT = [
  { type: 'CS',         msg: '올래성형외과 — 일본어 문의 미답변 48시간 경과',    href: '/cs' },
  { type: '컴플라이언스', msg: '청담미래성형외과 — 광고 표현 위반 2건 감지',      href: '/hospitals/3' },
  { type: '계약',       msg: '압구정원성형외과 — 계약 만료 22일 전',            href: '/contract' },
]

export default function DashboardPage() {
  const inOnboarding = HOSPITALS.filter(h => h.status === 'onboarding')
  const recentHospitals = HOSPITALS.filter(h => h.status === 'active').slice(0, 5)
  const expiringSoon = HOSPITALS.filter(h => {
    if (h.expire === '-') return false
    return new Date(h.expire).getTime() - Date.now() < 30 * 86400000
  })

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">대시보드</span>
        </div>
        <div className="topbar-right">
          <span style={{ fontSize: 12, color: 'var(--s400)' }}>2026년 6월 기준</span>
        </div>
      </div>

      <div className="content fade">
        {/* KPI 카드 8개 */}
        <div className="kpi-grid">
          {KPI.map(k => (
            <Link key={k.label} href={k.href} style={{ textDecoration: 'none' }}>
              <div className="kpi-card">
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value">
                  {k.unit === 'M' && <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--s400)', alignSelf: 'flex-end', marginBottom: 3 }}>₩</span>}
                  {k.value}
                  <span className="kpi-unit">{k.unit === 'M' ? 'M' : k.unit}</span>
                </div>
                <div className="kpi-delta">{k.delta}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* 그리드 1: 긴급 처리 + 온보딩 현황 */}
        <div className="grid2">
          <div className="card">
            <div className="card-head">
              <div className="card-title">🔴 지금 처리할 항목</div>
              <span className="badge bdg-red">{URGENT.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {URGENT.map((u, i) => (
                <Link key={i} href={u.href} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: i < URGENT.length - 1 ? '1px solid var(--s100)' : 'none', textDecoration: 'none' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'var(--red-l)', color: 'var(--red)', flexShrink: 0, marginTop: 1 }}>{u.type}</span>
                  <span style={{ fontSize: 13, color: 'var(--s700)', lineHeight: 1.5 }}>{u.msg}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">🚀 온보딩 진행 현황</div>
              <Link href="/onboarding" className="see-all">전체 보기</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {inOnboarding.map(h => {
                const cur = ONBOARDING_PROGRESS[h.id] ?? 1
                const pct = Math.round(((cur - 1) / ONBOARDING_STEPS.length) * 100)
                const stepName = ONBOARDING_STEPS[cur - 1]?.name ?? ''
                return (
                  <Link key={h.id} href={`/onboarding/${h.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--s900)' }}>{h.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--blue)' }}>Step {cur} — {stepName}</span>
                    </div>
                    <div className="prog-track">
                      <div className="prog-fill pf-navy" style={{ width: `${pct}%` }} />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* 그리드 2: 병원별 문의 TOP 5 + 매출 추이 자리 */}
        <div className="grid2">
          <div className="card">
            <div className="card-head">
              <div className="card-title">💬 병원별 문의 TOP 5</div>
              <Link href="/crm" className="see-all">전체 보기</Link>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>병원명</th>
                  <th>이번 달</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {HOSPITALS.filter(h => h.inq > 0).sort((a, b) => b.inq - a.inq).slice(0, 5).map(h => (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 500 }}>{h.name}</td>
                    <td style={{ fontWeight: 700 }}>{h.inq}건</td>
                    <td><span className="badge bdg-navy">{STATUS_LABEL[h.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <div className="card-head" style={{ width: '100%' }}>
              <div className="card-title">💳 월별 매출 추이</div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--s300)', fontSize: 13 }}>
              차트 라이브러리 연동 후 표시됩니다
            </div>
          </div>
        </div>

        {/* 그리드 3: 최근 입점 병원 + 계약 갱신 임박 */}
        <div className="grid2">
          <div className="card">
            <div className="card-head">
              <div className="card-title">🏥 최근 입점 병원</div>
              <Link href="/hospitals" className="see-all">전체 보기</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentHospitals.map(h => (
                <Link key={h.id} href={`/hospitals/${h.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--s100)', textDecoration: 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--navy-l)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🏥</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--s900)' }}>{h.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--s400)' }}>{h.clinicType} · {h.plan}</div>
                  </div>
                  <span className={PLAN_BADGE[h.plan]}>{h.plan}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">📋 계약 갱신 임박</div>
              <Link href="/contract" className="see-all">전체 보기</Link>
            </div>
            {expiringSoon.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--s400)', fontSize: 13 }}>30일 이내 갱신 예정 없음</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {expiringSoon.map(h => (
                  <Link key={h.id} href={`/hospitals/${h.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--s100)', textDecoration: 'none' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--s900)' }}>{h.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--s400)' }}>{h.manager}</div>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700 }}>{h.expire}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
