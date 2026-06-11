'use client'

import { useState } from 'react'
import { FUNNEL_CHANNELS, FUNNEL_SCENARIOS, type ScenarioStatus } from '@/lib/mock-data'

const STATUS_META: Record<ScenarioStatus, { label: string; badge: string }> = {
  active: { label: '가동 중', badge: 'badge bdg-green' },
  paused: { label: '일시 정지', badge: 'badge bdg-gray' },
}

export default function FunnelPage() {
  const [scenarios, setScenarios] = useState(FUNNEL_SCENARIOS)

  function toggleStatus(id: number) {
    setScenarios(prev => prev.map(s =>
      s.id === id ? { ...s, status: s.status === 'active' ? 'paused' : 'active' } : s
    ))
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">⚡ 채널 &amp; 자동 발송</span>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary btn-sm">+ 시나리오 추가</button>
        </div>
      </div>

      <div className="content">

        {/* 연결된 채널 */}
        <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 600, color: 'var(--s400)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
          연결된 채널
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {FUNNEL_CHANNELS.map(ch => (
            <div key={ch.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
              <span style={{ fontSize: 28 }}>{ch.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--s800)', marginBottom: 3 }}>{ch.name}</div>
                {ch.connected
                  ? <div style={{ fontSize: 12, color: 'var(--s400)' }}>{ch.accountId}</div>
                  : <div style={{ fontSize: 12, color: 'var(--s300)' }}>미연결</div>
                }
              </div>
              {ch.connected
                ? <span className="badge bdg-green">연결됨</span>
                : <button className="btn btn-sm">연결</button>
              }
            </div>
          ))}
        </div>

        {/* 자동 발송 시나리오 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--s400)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
            자동 발송 시나리오
          </div>
          <div style={{ fontSize: 12, color: 'var(--s400)' }}>
            가동 중 {scenarios.filter(s => s.status === 'active').length}개 / 전체 {scenarios.length}개
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>시나리오</th>
                <th>트리거</th>
                <th>채널</th>
                <th style={{ textAlign: 'right' }}>총 발송</th>
                <th style={{ textAlign: 'right' }}>오픈율</th>
                <th>상태</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map(s => {
                const meta = STATUS_META[s.status]
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, color: 'var(--s800)' }}>{s.name}</td>
                    <td style={{ fontSize: 12, color: 'var(--s500)' }}>{s.trigger}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {s.channels.map(ch => (
                          <span key={ch} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: 'var(--navy-l)', color: 'var(--navy)' }}>{ch}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{s.sentTotal.toLocaleString()}회</td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: s.openRate >= 80 ? '#16A34A' : s.openRate >= 60 ? 'var(--navy)' : 'var(--s400)' }}>
                        {s.openRate}%
                      </span>
                    </td>
                    <td><span className={meta.badge}>{meta.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-sm">편집</button>
                        <button
                          className="btn btn-sm"
                          onClick={() => toggleStatus(s.id)}
                          style={s.status === 'active' ? { color: 'var(--s500)' } : { color: 'var(--blue)', borderColor: 'var(--blue)' }}
                        >
                          {s.status === 'active' ? '⏸' : '▶'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* 안내 */}
        <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--s50)', borderRadius: 8, fontSize: 12, color: 'var(--s500)', lineHeight: 1.7 }}>
          💡 자동 발송은 LINE·이메일 채널이 연결된 경우에만 동작합니다. SMS 채널은 연결 후 사용할 수 있습니다.
        </div>
      </div>
    </>
  )
}
