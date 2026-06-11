'use client'

import { useState, useEffect } from 'react'
import PageHeader from '@/components/PageHeader'
import {
  getPlatformNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  PlatformNotificationDto,
} from '@/lib/api'

const NOTI_ICON:  Record<string, string> = { cs: '🎧', contract: '📋', compliance: '⚠', system: '🔔' }
const NOTI_COLOR: Record<string, string> = { cs: 'var(--blue)', contract: '#D97706', compliance: 'var(--red)', system: 'var(--s500)' }

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<PlatformNotificationDto[]>([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState<string | null>(null)

  useEffect(() => {
    getPlatformNotifications()
      .then(setNotifications)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const unread = notifications.filter(n => !n.read).length

  async function handleMarkRead(id: number) {
    try {
      await markNotificationRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
    } catch {
      // 읽음 처리 실패 시 조용히 무시 (UX 방해 최소화)
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '전체 읽음 처리에 실패했습니다.'
      setError(msg)
    }
  }

  return (
    <>
      <PageHeader title="알림">
        <span className="badge bdg-red">{unread}개 미확인</span>
        <button className="btn btn-sm" onClick={handleMarkAllRead}>전체 읽음 처리</button>
      </PageHeader>
      <div className="content fade" style={{ maxWidth: 720 }}>

        {loading && (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--s500)' }}>
            로딩 중...
          </div>
        )}

        {error && (
          <div style={{ padding: '12px 16px', background: '#FEF2F2', borderRadius: 10, color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>
            데이터를 불러오지 못했습니다: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {notifications.map((n, i) => (
              <div
                key={n.id}
                onClick={() => { if (!n.read) handleMarkRead(n.id) }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '16px 20px',
                  borderBottom: i < notifications.length - 1 ? '1px solid var(--s100)' : 'none',
                  background: n.read ? 'transparent' : 'var(--blue-l)',
                  cursor: n.read ? 'default' : 'pointer',
                }}
              >
                {/* 아이콘 */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--s100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                  color: NOTI_COLOR[n.type] ?? 'var(--s500)',
                }}>
                  {NOTI_ICON[n.type] ?? '🔔'}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--s900)' }}>{n.title}</span>
                    {!n.read && <span className="badge bdg-blue">신규</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--s500)', lineHeight: 1.6 }}>{n.body}</div>
                </div>

                <div style={{ fontSize: 11, color: 'var(--s400)', flexShrink: 0, paddingTop: 2 }}>
                  {n.createdAt}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
