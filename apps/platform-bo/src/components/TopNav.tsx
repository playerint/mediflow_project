'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clearToken } from '@/lib/api'

type Role = 'super' | 'ops' | 'finance'

interface NavItem {
  key: string
  href: string
  icon: string
  label: string
  badge?: string
  badgeColor?: 'red' | 'amber'
}

// 그룹 구분선으로 나뉘는 메뉴 정의
const NAV_GROUPS: NavItem[][] = [
  [
    { key: 'dashboard', href: '/', icon: '⊞', label: '대시보드' },
  ],
  [
    { key: 'hospitals',  href: '/hospitals',  icon: '🏥', label: '병원 목록',   badge: '2', badgeColor: 'amber' },
    { key: 'onboarding', href: '/onboarding', icon: '🚀', label: '온보딩 관리', badge: '3' },
  ],
  [
    { key: 'site',      href: '/site',      icon: '🌐', label: '사이트 관리' },
    { key: 'crm',       href: '/crm',       icon: '💬', label: 'CRM 관리',    badge: '5' },
    { key: 'marketing', href: '/marketing', icon: '📣', label: '마케팅 관리' },
    { key: 'cs',        href: '/cs',        icon: '🎧', label: 'CS 관리',     badge: '7' },
  ],
  [
    { key: 'contract', href: '/contract', icon: '📋', label: '계약 관리' },
    { key: 'billing',  href: '/billing',  icon: '💳', label: '결제 관리', badge: '2', badgeColor: 'red' },
    { key: 'reports',  href: '/reports',  icon: '📊', label: '리포트' },
  ],
]

// 역할별 접근 가능 메뉴 키 목록
const ROLE_ALLOWED: Record<Role, string[] | 'all'> = {
  super:   'all',
  ops:     ['dashboard', 'hospitals', 'onboarding', 'site', 'crm', 'marketing', 'cs', 'notifications', 'settings'],
  finance: ['dashboard', 'contract', 'billing', 'reports', 'notifications', 'settings'],
}

function canShow(key: string, role: Role): boolean {
  const allowed = ROLE_ALLOWED[role]
  if (allowed === 'all') return true
  return allowed.includes(key)
}

// 나중에 실제 인증 컨텍스트로 교체할 목업 사용자
const MOCK_USER = { name: '김운영', role: 'super' as Role }

export default function TopNav() {
  const pathname = usePathname()
  const router   = useRouter()
  const user = MOCK_USER
  const { role } = user

  function handleLogout() {
    clearToken()
    router.replace('/login')
  }

  // 현재 경로에서 활성 메뉴 키 계산
  const activeKey = pathname === '/' ? 'dashboard' : (pathname.split('/')[1] ?? 'dashboard')

  const roleCls   = role === 'super' ? 'role-super' : role === 'ops' ? 'role-ops' : 'role-finance'
  const roleLabel = role === 'super' ? '슈퍼 어드민' : role === 'ops' ? '운영팀' : '재무팀'

  return (
    <aside className="sidebar">
      {/* 로고 */}
      <div className="sidebar-logo">
        <div className="logo-mark">MEDI<span>FLOW</span></div>
      </div>

      {/* 메뉴 링크 */}
      <div className="topnav-links">
        {NAV_GROUPS.map((group, gi) => {
          const visible = group.filter(item => canShow(item.key, role))
          if (visible.length === 0) return null
          return (
            <div key={gi} style={{ display: 'contents' }}>
              {gi > 0 && <div className="topnav-sep" />}
              {visible.map(item => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`nav-item${activeKey === item.key ? ' active' : ''}`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                  {item.badge && (
                    <span className={`nav-badge${item.badgeColor ? ` ${item.badgeColor}` : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )
        })}
      </div>

      {/* 사용자 영역 */}
      <div className="topnav-user">
        <Link
          href="/notifications"
          className={`topnav-icon-btn${activeKey === 'notifications' ? ' active' : ''}`}
          title="알림"
        >
          🔔<span className="icon-badge">5</span>
        </Link>
        <Link
          href="/settings"
          className={`topnav-icon-btn${activeKey === 'settings' ? ' active' : ''}`}
          title="설정"
        >
          ⚙
        </Link>
        <div className="sf-avatar">{user.name.charAt(0)}</div>
        <div className="sf-name">{user.name}</div>
        <span className={roleCls}>{roleLabel}</span>
        <button className="sf-logout" onClick={handleLogout}>🚪 로그아웃</button>
      </div>
    </aside>
  )
}
