'use client'

import { useState } from 'react'
import {
  LINE_BOT, LINE_CONVERSATIONS, AUTO_REPLY_RULES,
  type LineConversation, type LineConvStatus,
} from '@/lib/mock-data'

type Tab = 'conversations' | 'rules'

const STATUS_META: Record<LineConvStatus, { label: string; color: string; bg: string }> = {
  bot:       { label: 'AI 처리 중', color: '#16A34A', bg: '#D1FAE5' },
  escalated: { label: '개입 필요',  color: '#DC2626', bg: '#FEF2F2' },
  resolved:  { label: '완료',       color: '#6B7280', bg: '#F3F4F6' },
}

export default function LinePage() {
  const [tab,      setTab]      = useState<Tab>('conversations')
  const [selected, setSelected] = useState<LineConversation | null>(null)
  const [reply,    setReply]    = useState('')
  const [filter,   setFilter]   = useState<LineConvStatus | 'all'>('all')

  const escalated = LINE_CONVERSATIONS.filter(c => c.status === 'escalated')
  const filtered  = filter === 'all'
    ? LINE_CONVERSATIONS
    : LINE_CONVERSATIONS.filter(c => c.status === filter)

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">LINE 자동상담</span>
          {escalated.length > 0 && (
            <span className="badge bdg-red">⚠ {escalated.length}건 개입 필요</span>
          )}
        </div>
        <div className="topbar-right">
          {/* 탭 전환 */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--s100)', borderRadius: 8, padding: 3 }}>
            {([['conversations', '대화 목록'], ['rules', '자동 응답 규칙']] as [Tab, string][]).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setTab(v)}
                style={{
                  padding: '4px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontFamily: 'inherit',
                  background: tab === v ? 'var(--s0)' : 'transparent',
                  color: tab === v ? 'var(--navy)' : 'var(--s500)',
                  fontWeight: tab === v ? 600 : 400,
                  boxShadow: tab === v ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                  transition: 'all .15s',
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="content fade">

        {/* 봇 상태 배너 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          background: LINE_BOT.status === 'on' ? '#F0FDF4' : 'var(--s100)',
          border: `1px solid ${LINE_BOT.status === 'on' ? '#86EFAC' : 'var(--s200)'}`,
          borderRadius: 'var(--rl)', padding: '14px 20px', marginBottom: 18,
        }}>
          {/* 상태 표시 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: LINE_BOT.status === 'on' ? '#16A34A' : 'var(--s400)',
              boxShadow: LINE_BOT.status === 'on' ? '0 0 0 3px #BBF7D0' : 'none',
            }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: LINE_BOT.status === 'on' ? '#15803D' : 'var(--s500)' }}>
              자동상담 봇 {LINE_BOT.status === 'on' ? '가동 중' : '정지됨'}
            </span>
          </div>

          {/* KPI 3개 */}
          <div style={{ display: 'flex', gap: 24, marginLeft: 16 }}>
            {[
              { label: '오늘 대화', value: LINE_BOT.todayCount, unit: '건' },
              { label: '자동 처리율', value: LINE_BOT.autoRate, unit: '%' },
              { label: '수동 처리 필요', value: LINE_BOT.pending, unit: '건', red: LINE_BOT.pending > 0 },
            ].map(k => (
              <div key={k.label} style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: k.red ? 'var(--red)' : 'var(--navy)' }}>
                  {k.value}
                </span>
                <span style={{ fontSize: 12, color: 'var(--s500)' }}>{k.unit} {k.label}</span>
              </div>
            ))}
          </div>

          {/* 토글 버튼 */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-sm">⚙ 봇 설정</button>
            <button
              className={`btn btn-sm${LINE_BOT.status === 'on' ? '' : ' btn-primary'}`}
              style={LINE_BOT.status === 'on' ? { borderColor: 'var(--red)', color: 'var(--red)' } : {}}
            >
              {LINE_BOT.status === 'on' ? '⏸ 일시 정지' : '▶ 재가동'}
            </button>
          </div>
        </div>

        {/* ── 대화 목록 탭 ── */}
        {tab === 'conversations' && (
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>

            {/* 왼쪽: 대화 목록 */}
            <div style={{ width: 300, flexShrink: 0 }}>
              {/* 필터 */}
              <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
                {([['all', '전체'], ['escalated', '개입 필요'], ['bot', 'AI 처리'], ['resolved', '완료']] as [LineConvStatus | 'all', string][]).map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => setFilter(k)}
                    className={`pill${filter === k ? ' on' : ''}`}
                    style={{ fontSize: 11, padding: '3px 9px' }}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {filtered.map((conv, i) => {
                  const meta      = STATUS_META[conv.status]
                  const isSelected = selected?.id === conv.id
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelected(isSelected ? null : conv)}
                      style={{
                        padding: '13px 16px',
                        borderBottom: i < filtered.length - 1 ? '1px solid var(--s100)' : 'none',
                        cursor: 'pointer',
                        background: isSelected ? 'var(--navy-l)' : 'transparent',
                        transition: 'background .1s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                        {/* 아바타 */}
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          background: 'var(--s100)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: 14,
                        }}>
                          👤
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--s900)' }}>{conv.name}</span>
                            <span style={{ fontSize: 10, color: 'var(--s400)' }}>{conv.lastTime}</span>
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--s400)', marginBottom: 3 }}>{conv.nameKana}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 40 }}>
                        <span style={{ fontSize: 12, color: 'var(--s500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                          {conv.lastMsg}
                        </span>
                        <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
                          {conv.unread > 0 && (
                            <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--red)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {conv.unread}
                            </span>
                          )}
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: meta.bg, color: meta.color }}>
                            {meta.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 오른쪽: 대화 상세 */}
            {selected ? (
              <div className="card fade" style={{ flex: 1, minWidth: 0, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* 헤더 */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--s100)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{selected.name}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5,
                        background: STATUS_META[selected.status].bg,
                        color: STATUS_META[selected.status].color,
                      }}>
                        {STATUS_META[selected.status].label}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 2 }}>{selected.nameKana}</div>
                  </div>
                  <button className="btn btn-sm">👤 CRM에서 보기</button>
                  {selected.status === 'escalated' && (
                    <button className="btn btn-primary btn-sm">개입 처리</button>
                  )}
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--s400)', lineHeight: 1 }}>×</button>
                </div>

                {/* 대화 스레드 */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 420 }}>
                  {selected.thread.map((msg, i) => {
                    const isRight  = msg.role === 'bot' || msg.role === 'staff'
                    const roleLabel = msg.role === 'bot' ? '🤖 AI' : msg.role === 'staff' ? '👤 스탭' : ''
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: isRight ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
                        {!isRight && (
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                            💬
                          </div>
                        )}
                        <div style={{ maxWidth: '72%' }}>
                          {isRight && (
                            <div style={{ fontSize: 10, color: 'var(--s400)', textAlign: 'right', marginBottom: 2 }}>{roleLabel}</div>
                          )}
                          <div style={{
                            padding: '10px 13px',
                            borderRadius: isRight ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                            background: msg.role === 'bot' ? 'var(--navy)' : msg.role === 'staff' ? '#1D4ED8' : 'var(--s100)',
                            color: isRight ? '#fff' : 'var(--s900)',
                            fontSize: 13, lineHeight: 1.65, whiteSpace: 'pre-wrap',
                          }}>
                            {msg.text}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--s400)', marginTop: 4, textAlign: isRight ? 'right' : 'left' }}>
                            {msg.time}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 답장 입력 (escalated 상태일 때만 활성화) */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--s100)', background: 'var(--s50)' }}>
                  {selected.status === 'escalated' ? (
                    <>
                      <textarea
                        rows={3}
                        placeholder="일본어로 직접 답장을 입력하세요..."
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        style={{ fontSize: 13, resize: 'none', marginBottom: 8 }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}
                          onClick={() => setReply('【AI草稿】\n')}>
                          🤖 AI 초안
                        </button>
                        <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}
                          onClick={() => setReply('')}>
                          전송 →
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--s400)', padding: '6px 0' }}>
                      {selected.status === 'bot' ? '🤖 AI가 자동으로 처리하고 있습니다' : '✅ 처리 완료된 대화입니다'}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: 'var(--s300)', fontSize: 13 }}>
                왼쪽에서 대화를 선택하세요
              </div>
            )}
          </div>
        )}

        {/* ── 자동 응답 규칙 탭 ── */}
        {tab === 'rules' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: 'var(--s500)' }}>
                환자 메시지에 특정 키워드가 포함되면 봇이 자동으로 답장합니다. (정규식 사용 가능)
              </div>
              <button className="btn btn-primary btn-sm">+ 규칙 추가</button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>트리거 키워드</th>
                    <th>자동 응답 내용</th>
                    <th style={{ textAlign: 'right' }}>발동 횟수</th>
                    <th>상태</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {AUTO_REPLY_RULES.map(rule => (
                    <tr key={rule.id}>
                      <td style={{ color: 'var(--s400)', fontSize: 12 }}>{rule.id}</td>
                      <td>
                        <code style={{
                          fontSize: 12, fontFamily: 'monospace',
                          background: 'var(--s100)', padding: '2px 8px', borderRadius: 4,
                          color: 'var(--navy)', whiteSpace: 'nowrap',
                        }}>
                          {rule.keyword}
                        </code>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--s700)', maxWidth: 360 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {rule.reply}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{rule.triggerCount}회</td>
                      <td>
                        <label className="toggle-wrap">
                          <input type="checkbox" defaultChecked={rule.enabled} />
                          <span className="toggle-track" />
                          <span className="toggle-thumb" />
                        </label>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-sm">편집</button>
                          <button className="btn btn-sm" style={{ color: 'var(--red)', borderColor: '#FCA5A5' }}>삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
