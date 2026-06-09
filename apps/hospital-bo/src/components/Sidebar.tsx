'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getMyHospital, clearToken, type HospitalInfoDto } from '@/lib/api'

// 로그인 세션 (나중에 JWT auth로 교체)
const MOCK_SESSION = {
  name:  '김지현',
  email: 'admin@oleps.co.kr',
  role:  'admin' as 'admin' | 'staff',
}

// 사이트 관리 하위 메뉴 키 목록
const SITE_KEYS = ['site-content', 'site-assets', 'site-seo', 'site-preview']

const NAV = [
  {
    type: 'section' as const,
    label: '메인',
  },
  {
    type: 'link' as const,
    key: 'dashboard',
    href: '/',
    icon: '⊞',
    label: '홈 대시보드',
  },
  {
    type: 'parent' as const,
    keys: SITE_KEYS,
    icon: '🌐',
    label: '사이트 관리',
    children: [
      { key: 'site-content',  href: '/site/content',  icon: '✏', label: '콘텐츠 편집' },
      { key: 'site-assets',   href: '/site/assets',   icon: '🖼', label: '이미지 관리' },
      { key: 'site-seo',      href: '/site/seo',      icon: '🔍', label: 'SEO·AEO' },
      { key: 'site-preview',  href: '/site/preview',  icon: '👁', label: '미리보기 & 게시' },
    ],
  },
  {
    type: 'link' as const,
    key: 'crm',
    href: '/crm',
    icon: '💬',
    label: '문의·상담 CRM',
    badge: '3',
  },
  {
    type: 'link' as const,
    key: 'booking',
    href: '/booking',
    icon: '📅',
    label: '예약 관리',
  },
  {
    type: 'link' as const,
    key: 'line',
    href: '/line',
    icon: '🤖',
    label: 'LINE 자동상담',
    badge: 'ON',
    badgeTeal: true,
  },
  {
    type: 'section' as const,
    label: '설정',
  },
  {
    type: 'link' as const,
    key: 'marketing',
    href: '/marketing',
    icon: '📣',
    label: '마케팅 현황',
  },
  {
    type: 'link' as const,
    key: 'funnel',
    href: '/funnel',
    icon: '⚡',
    label: '채널 & 자동 발송',
  },
  {
    type: 'link' as const,
    key: 'reports',
    href: '/reports',
    icon: '📊',
    label: '리포트',
  },
  {
    type: 'link' as const,
    key: 'settings',
    href: '/settings',
    icon: '⚙',
    label: '설정',
  },
]

function getActiveKey(pathname: string): string {
  if (pathname === '/') return 'dashboard'
  const parts = pathname.split('/').filter(Boolean)
  if (parts[0] === 'site') return `site-${parts[1] ?? 'content'}`
  return parts[0] ?? 'dashboard'
}

export default function Sidebar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const activeKey = getActiveKey(pathname)
  const user      = MOCK_SESSION
  const roleLabel = user.role === 'admin' ? '관리자' : '스탭'

  function handleLogout() {
    clearToken()
    router.replace('/login')
  }

  const [hospital, setHospital] = useState<HospitalInfoDto | null>(null)

  useEffect(() => {
    getMyHospital().then(setHospital).catch(() => null)
  }, [])

  const hospitalName = hospital?.nameKr ?? '로딩 중...'
  const siteDisplay  = hospital?.siteUrl ?? (hospital?.status === 'onboarding' ? '온보딩 중' : '-')
  const isLive       = hospital?.status === 'active'

  return (
    <aside className="sidebar">
      {/* 로고 */}
      <div className="sidebar-logo">
        <div className="logo-title">MEDIFLOW</div>
        <div className="logo-sub">글로벌 메디컬 플로우</div>
      </div>

      {/* 병원 정보 카드 */}
      <div className="hospital-card">
        <div className="hospital-name">{hospitalName}</div>
        <div className="hospital-meta">{siteDisplay}</div>
        <div className="hospital-meta live-dot" style={{ marginTop: 4 }}>
          {isLive ? '게시 중' : '온보딩 중'}
        </div>
      </div>

      {/* 네비게이션 */}
      {NAV.map((item, i) => {
        if (item.type === 'section') {
          return <div key={i} className="nav-section">{item.label}</div>
        }

        if (item.type === 'parent') {
          const isParentActive = item.keys.includes(activeKey)
          return (
            <div key={i}>
              <Link
                href={item.children[0].href}
                className={`nav-item${isParentActive ? ' active' : ''}`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
              {item.children.map(child => (
                <Link
                  key={child.key}
                  href={child.href}
                  className={`nav-item nav-sub${activeKey === child.key ? ' active' : ''}`}
                >
                  <span>{child.icon}</span>
                  {child.label}
                </Link>
              ))}
            </div>
          )
        }

        // type === 'link'
        const isActive = activeKey === item.key
        return (
          <Link
            key={item.key}
            href={item.href}
            className={`nav-item${isActive ? ' active' : ''}`}
          >
            <span>{item.icon}</span>
            {item.label}
            {item.badge && (
              <span className={`nav-badge${item.badgeTeal ? ' teal' : ''}`}>
                {item.badge}
              </span>
            )}
          </Link>
        )
      })}

      {/* 하단 사용자 영역 */}
      <div className="sidebar-footer">
        <div className="sf-row">
          <span style={{ fontSize: 18 }}>👤</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#fff', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </span>
              <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 5, background: 'rgba(255,255,255,.1)', color: '#5EEAD4', flexShrink: 0 }}>
                {roleLabel}
              </span>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
          </div>
        </div>
        <button className="sf-logout" onClick={handleLogout}>🚪 로그아웃</button>
      </div>
    </aside>
  )
}
