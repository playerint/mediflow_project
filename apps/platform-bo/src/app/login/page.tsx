'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login, setToken, getToken } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)

  // 이미 로그인된 상태면 대시보드로
  useEffect(() => {
    if (getToken()) router.replace('/')
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await login(username, password)
      setToken(res.token)
      router.replace('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 20px 60px rgba(0,0,0,.3)',
      }}>
        {/* 로고 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', letterSpacing: -0.5 }}>
            MEDI<span style={{ color: 'var(--teal)' }}>FLOW</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--s400)', marginTop: 4 }}>본사 관리자 로그인</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--s600)', display: 'block', marginBottom: 6 }}>
              이메일
            </label>
            <input
              type="email"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin@mediflow.io"
              required
              autoFocus
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--s600)', display: 'block', marginBottom: 6 }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 8, padding: '10px 14px',
              color: '#DC2626', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: 8, padding: '12px', fontSize: 14, fontWeight: 700 }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 개발용 힌트 */}
        <div style={{
          marginTop: 24, padding: '12px 14px',
          background: 'var(--s50)', borderRadius: 8,
          fontSize: 11, color: 'var(--s400)', lineHeight: 1.8,
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--s500)' }}>개발용 테스트 계정</div>
          <div>슈퍼 어드민: admin@mediflow.io / admin1234</div>
          <div>운영팀: ops@mediflow.io / ops1234</div>
          <div>재무팀: finance@mediflow.io / finance1234</div>
        </div>
      </div>
    </div>
  )
}
