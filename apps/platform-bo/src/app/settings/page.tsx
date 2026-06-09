'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'

type TabKey = 'account' | 'team' | 'notifications' | 'security'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'account',       label: '계정 정보' },
  { key: 'team',          label: '팀 멤버' },
  { key: 'notifications', label: '알림 설정' },
  { key: 'security',      label: '보안' },
]

const TEAM_MEMBERS = [
  { name: '김운영', email: 'admin@mediflow.io',  role: '슈퍼 어드민', lastLogin: '방금 전' },
  { name: '이수진', email: 'ops@mediflow.io',    role: '운영팀',      lastLogin: '2시간 전' },
  { name: '박재무', email: 'finance@mediflow.io', role: '재무팀',     lastLogin: '1일 전' },
]

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>('account')

  return (
    <>
      <PageHeader title="설정" />
      <div className="content fade" style={{ maxWidth: 720 }}>

        {/* 탭 */}
        <div className="tab-bar" style={{ marginBottom: 20 }}>
          {TABS.map(t => (
            <button key={t.key} className={`tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'account' && (
          <div className="card">
            <div className="card-head" style={{ marginBottom: 20 }}>
              <div className="card-title">계정 정보</div>
              <button className="btn btn-primary btn-sm">저장</button>
            </div>
            {[
              { label: '이름',       value: '김운영' },
              { label: '이메일',     value: 'admin@mediflow.io' },
              { label: '연락처',     value: '010-0000-0000' },
              { label: '소속 회사',  value: 'MEDIFLOW Inc.' },
            ].map(f => (
              <div key={f.label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                <label style={{ fontSize: 13, color: 'var(--s500)', fontWeight: 500 }}>{f.label}</label>
                <input type="text" defaultValue={f.value} />
              </div>
            ))}
          </div>
        )}

        {tab === 'team' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--s100)' }}>
              <div className="card-title">팀 멤버</div>
              <button className="btn btn-primary btn-sm">+ 멤버 초대</button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>역할</th>
                  <th>최근 로그인</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {TEAM_MEMBERS.map(m => (
                  <tr key={m.email}>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td style={{ fontSize: 12, color: 'var(--s500)' }}>{m.email}</td>
                    <td><span className="badge bdg-navy">{m.role}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--s400)' }}>{m.lastLogin}</td>
                    <td><button className="btn btn-sm">편집</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="card">
            <div className="card-head" style={{ marginBottom: 20 }}>
              <div className="card-title">알림 설정</div>
              <button className="btn btn-primary btn-sm">저장</button>
            </div>
            {[
              { label: 'CS 미답변 48시간 알림', desc: '문의가 48시간 내 미답변 시 알림' },
              { label: '계약 만료 30일 전 알림', desc: '계약 만료 30일·7일·1일 전' },
              { label: '컴플라이언스 위반 감지', desc: '의료 광고법 위반 표현 자동 감지 시' },
              { label: '온보딩 완료 알림',        desc: '병원 온보딩 9단계 완료 시' },
              { label: '결제 미납 알림',          desc: '청구일 +3일 내 미납 시' },
            ].map((n, i) => (
              <div key={n.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < 4 ? '1px solid var(--s100)' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{n.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 2 }}>{n.desc}</div>
                </div>
                <label className="toggle-wrap">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-track" />
                  <span className="toggle-thumb" />
                </label>
              </div>
            ))}
          </div>
        )}

        {tab === 'security' && (
          <div className="card">
            <div className="card-head" style={{ marginBottom: 20 }}>
              <div className="card-title">보안 설정</div>
            </div>
            {[
              { label: '2단계 인증 (2FA)', desc: '로그인 시 추가 인증 요구', enabled: true },
              { label: 'IP 접근 제한',      desc: '허용된 IP에서만 접속 가능',  enabled: false },
              { label: '세션 타임아웃',     desc: '30분 비활성 시 자동 로그아웃', enabled: true },
            ].map((s, i) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--s100)' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 2 }}>{s.desc}</div>
                </div>
                <label className="toggle-wrap">
                  <input type="checkbox" defaultChecked={s.enabled} />
                  <span className="toggle-track" />
                  <span className="toggle-thumb" />
                </label>
              </div>
            ))}
            <div style={{ marginTop: 20 }}>
              <button className="btn" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
                비밀번호 변경
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
