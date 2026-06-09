'use client'

import { useState } from 'react'
import { HOSPITAL_INFO, TEAM_MEMBERS, type TeamMember } from '@/lib/mock-data'

type Tab = 'account' | 'team' | 'notifications' | 'security'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'account',       label: '계정 정보',  icon: '🏥' },
  { key: 'team',          label: '팀 멤버',    icon: '👥' },
  { key: 'notifications', label: '알림 설정',  icon: '🔔' },
  { key: 'security',      label: '보안',       icon: '🔒' },
]

const ROLE_BADGE: Record<TeamMember['role'], string> = {
  '관리자': 'badge bdg-navy',
  '상담사': 'badge bdg-blue',
  '검수자': 'badge bdg-green',
}

// 알림 설정 초기값
const NOTIF_DEFAULTS = {
  newInquiryEmail:   true,
  newInquiryLine:    true,
  bookingEmail:      true,
  bookingLine:       false,
  weeklyReportEmail: true,
  monthlyReportEmail: true,
  systemEmail:       true,
}

export default function SettingsPage() {
  const [tab, setTab]     = useState<Tab>('account')
  const [notif, setNotif] = useState(NOTIF_DEFAULTS)
  const [members, setMembers] = useState(TEAM_MEMBERS)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole]   = useState<TeamMember['role']>('상담사')
  const [saved, setSaved] = useState(false)

  function toggleNotif(key: keyof typeof NOTIF_DEFAULTS) {
    setNotif(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleInvite() {
    if (!inviteEmail.includes('@')) return
    const next: TeamMember = {
      id: Date.now(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'invited',
    }
    setMembers(prev => [...prev, next])
    setInviteEmail('')
  }

  function removeMember(id: number) {
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">⚙ 설정</span>
        </div>
      </div>

      <div className="content">
        {/* 탭 바 */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid var(--s200)', paddingBottom: 0 }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '9px 16px',
                fontSize: 13, fontFamily: 'inherit',
                border: 'none', cursor: 'pointer',
                background: 'transparent',
                color: tab === t.key ? 'var(--navy)' : 'var(--s500)',
                fontWeight: tab === t.key ? 700 : 400,
                borderBottom: tab === t.key ? '2px solid var(--navy)' : '2px solid transparent',
                marginBottom: -1,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── 계정 정보 ── */}
        {tab === 'account' && (
          <div className="card" style={{ maxWidth: 600 }}>
            <div className="card-head">
              <span className="card-title">🏥 병원 기본 정보</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="병원명 (한국어)" defaultValue={HOSPITAL_INFO.name} />
              <Field label="병원명 (일본어)" defaultValue={HOSPITAL_INFO.nameJa} />
              <Field label="환자 사이트 URL" defaultValue={HOSPITAL_INFO.siteUrl} disabled />
              <Field label="플랜" defaultValue={HOSPITAL_INFO.plan} disabled />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                {saved && (
                  <span style={{ fontSize: 12, color: '#16A34A', alignSelf: 'center' }}>✓ 저장 완료</span>
                )}
                <button className="btn btn-primary" onClick={handleSave}>저장</button>
              </div>
            </div>
          </div>
        )}

        {/* ── 팀 멤버 ── */}
        {tab === 'team' && (
          <div className="card">
            <div className="card-head">
              <span className="card-title">👥 팀 멤버</span>
              <span style={{ fontSize: 12, color: 'var(--s400)' }}>총 {members.length}명</span>
            </div>

            <table className="table" style={{ marginBottom: 20 }}>
              <thead>
                <tr>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>역할</th>
                  <th>상태</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 500 }}>{m.name}</td>
                    <td style={{ color: 'var(--s400)', fontSize: 12 }}>{m.email}</td>
                    <td><span className={ROLE_BADGE[m.role]}>{m.role}</span></td>
                    <td>
                      <span className={`badge ${m.status === 'active' ? 'bdg-green' : 'bdg-gray'}`}>
                        {m.status === 'active' ? '활성' : '초대됨'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {m.role !== '관리자' && (
                        <button
                          className="btn btn-sm"
                          onClick={() => removeMember(m.id)}
                          style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                        >
                          삭제
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 멤버 초대 */}
            <div style={{
              background: 'var(--s50)', borderRadius: 10, padding: '14px 16px',
              border: '1px solid var(--s200)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 10 }}>
                멤버 초대
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  placeholder="이메일 주소 입력"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  style={{ flex: 1 }}
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as TeamMember['role'])}
                  style={{ width: 110 }}
                >
                  <option>상담사</option>
                  <option>검수자</option>
                  <option>관리자</option>
                </select>
                <button className="btn btn-primary" onClick={handleInvite}>초대</button>
              </div>
            </div>
          </div>
        )}

        {/* ── 알림 설정 ── */}
        {tab === 'notifications' && (
          <div className="card" style={{ maxWidth: 600 }}>
            <div className="card-head">
              <span className="card-title">🔔 알림 설정</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <NotifSection label="문의·상담" />
              <NotifRow label="신규 문의 알림 — 이메일"      on={notif.newInquiryEmail}   toggle={() => toggleNotif('newInquiryEmail')} />
              <NotifRow label="신규 문의 알림 — LINE"        on={notif.newInquiryLine}    toggle={() => toggleNotif('newInquiryLine')} />

              <NotifSection label="예약" />
              <NotifRow label="예약 변경·취소 알림 — 이메일" on={notif.bookingEmail}       toggle={() => toggleNotif('bookingEmail')} />
              <NotifRow label="예약 변경·취소 알림 — LINE"   on={notif.bookingLine}        toggle={() => toggleNotif('bookingLine')} />

              <NotifSection label="리포트" />
              <NotifRow label="주간 리포트 — 이메일"         on={notif.weeklyReportEmail}  toggle={() => toggleNotif('weeklyReportEmail')} />
              <NotifRow label="월간 리포트 — 이메일"         on={notif.monthlyReportEmail} toggle={() => toggleNotif('monthlyReportEmail')} />

              <NotifSection label="시스템" />
              <NotifRow label="서비스 공지·업데이트 — 이메일" on={notif.systemEmail}       toggle={() => toggleNotif('systemEmail')} />
            </div>
          </div>
        )}

        {/* ── 보안 ── */}
        {tab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 600 }}>
            <div className="card">
              <div className="card-head">
                <span className="card-title">🔑 비밀번호 변경</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Field label="현재 비밀번호" type="password" />
                <Field label="새 비밀번호" type="password" />
                <Field label="새 비밀번호 확인" type="password" />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <button className="btn btn-primary" onClick={handleSave}>변경</button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <span className="card-title">🛡 2단계 인증 (2FA)</span>
                <span className="badge bdg-gray">미설정</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--s500)', marginBottom: 14, lineHeight: 1.6 }}>
                2단계 인증을 활성화하면 로그인 시 추가 인증이 요구되어 계정 보안이 강화됩니다.
              </p>
              <button className="btn">2FA 설정하기</button>
            </div>

            <div className="card">
              <div className="card-head">
                <span className="card-title">📋 로그인 기록</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { time: '2026-06-08 09:22', ip: '211.xxx.xxx.10',  device: 'Chrome / Windows', current: true },
                  { time: '2026-06-07 21:05', ip: '211.xxx.xxx.10',  device: 'Chrome / Windows', current: false },
                  { time: '2026-06-06 14:11', ip: '121.xxx.xxx.55',  device: 'Safari / iPhone',  current: false },
                ].map((log, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--s100)' : 'none',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, color: 'var(--s700)' }}>{log.device}</div>
                      <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 2 }}>{log.ip} · {log.time}</div>
                    </div>
                    {log.current && <span className="badge bdg-green">현재 세션</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function Field({ label, defaultValue, disabled, type }: {
  label: string; defaultValue?: string; disabled?: boolean; type?: string
}) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--s500)', display: 'block', marginBottom: 5 }}>
        {label}
      </label>
      <input
        type={type ?? 'text'}
        defaultValue={defaultValue}
        disabled={disabled}
        style={{ opacity: disabled ? .55 : 1, cursor: disabled ? 'not-allowed' : 'text' }}
      />
    </div>
  )
}

function NotifSection({ label }: { label: string }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: 'var(--s400)',
      letterSpacing: '.06em', textTransform: 'uppercase',
      padding: '14px 0 6px',
      borderTop: '1px solid var(--s100)',
      marginTop: 4,
    }}>
      {label}
    </div>
  )
}

function NotifRow({ label, on, toggle }: { label: string; on: boolean; toggle: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0', borderBottom: '1px solid var(--s100)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--s700)' }}>{label}</span>
      {/* 토글 스위치 */}
      <button
        onClick={toggle}
        style={{
          width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
          background: on ? 'var(--navy)' : 'var(--s200)',
          position: 'relative', transition: 'background .2s', flexShrink: 0,
        }}
        aria-label={on ? '켜짐' : '꺼짐'}
      >
        <span style={{
          position: 'absolute', top: 3,
          left: on ? 21 : 3,
          width: 16, height: 16,
          borderRadius: '50%', background: '#fff',
          transition: 'left .2s',
          boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        }} />
      </button>
    </div>
  )
}
