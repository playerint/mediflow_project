'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import { HOSPITALS, PLAN_BADGE, STATUS_BADGE, STATUS_LABEL } from '@/lib/mock-data'

type TabKey = 'overview' | 'onboarding' | 'site' | 'crm' | 'contract' | 'memo'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview',   label: '📋 개요' },
  { key: 'onboarding', label: '🚀 온보딩' },
  { key: 'site',       label: '🌐 사이트' },
  { key: 'crm',        label: '💬 문의·CRM' },
  { key: 'contract',   label: '📄 계약·결제' },
  { key: 'memo',       label: '📝 내부 메모' },
]

function isExpiringSoon(expire: string): boolean {
  if (expire === '-') return false
  return new Date(expire).getTime() - Date.now() < 30 * 86400000
}

export default function HospitalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  const hospital = HOSPITALS.find(h => h.id === Number(id))

  if (!hospital) {
    return (
      <div className="content" style={{ textAlign: 'center', paddingTop: 80 }}>
        <p style={{ color: 'var(--s400)', fontSize: 15 }}>존재하지 않는 병원입니다.</p>
        <button className="btn" style={{ marginTop: 16 }} onClick={() => router.push('/hospitals')}>
          ← 목록으로
        </button>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        backHref="/hospitals"
        backLabel="병원 목록"
        title={hospital.name}
      >
        <button className="btn btn-danger">⏸ 일시정지</button>
        <button className="btn" onClick={() => router.push(`/hospitals/${hospital.id}/edit`)}>
          ✏ 편집
        </button>
      </PageHeader>

      <div className="content fade">
        {/* 히어로 — 병원 요약 */}
        <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12,
            background: 'var(--navy-l)', color: 'var(--navy)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
          }}>🏥</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--s900)' }}>{hospital.name}</span>
              <span style={{ fontSize: 13, color: 'var(--s400)' }}>{hospital.nameJa}</span>
              <span className={STATUS_BADGE[hospital.status]}>{STATUS_LABEL[hospital.status]}</span>
              <span className={PLAN_BADGE[hospital.plan]}>{hospital.plan}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--s500)', display: 'flex', gap: 16 }}>
              <span>🏷 {hospital.clinicType} · {hospital.specialty}</span>
              <span>🌐 {hospital.url}</span>
              <span>👤 담당: {hospital.manager}</span>
              {hospital.expire !== '-' && (
                <span style={{ color: isExpiringSoon(hospital.expire) ? 'var(--red)' : 'inherit', fontWeight: isExpiringSoon(hospital.expire) ? 600 : 400 }}>
                  📅 계약 만료: {hospital.expire}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 탭 바 */}
        <div className="tab-bar" style={{ marginBottom: 16 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              className={`tab${activeTab === t.key ? ' active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 탭 1: 개요 */}
        {activeTab === 'overview' && (
          <div className="grid2">
            <div className="card">
              <div className="card-head">
                <div className="card-title">🏥 병원 기본 정보</div>
                <button className="btn" onClick={() => router.push(`/hospitals/${hospital.id}/edit`)}>편집</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['병원명 (한국어)', hospital.name],
                    ['병원명 (일본어)', hospital.nameJa],
                    ['진료 유형',       hospital.clinicType],
                    ['전문 분야',       hospital.specialty],
                    ['사이트 URL',      hospital.url],
                    ['플랜',           hospital.plan],
                    ['담당자',         hospital.manager],
                    ['계약 만료일',     hospital.expire],
                  ].map(([label, value]) => (
                    <tr key={label} style={{ borderBottom: '1px solid var(--s100)' }}>
                      <td style={{ padding: '9px 0', fontSize: 12, color: 'var(--s500)', width: 110 }}>{label}</td>
                      <td style={{ padding: '9px 0', fontSize: 13, color: 'var(--s900)', fontWeight: 500 }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 14 }}>📊 이번 달 성과</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: '신규 문의', value: hospital.inq > 0 ? `${hospital.inq}건` : '-' },
                    { label: '상태',      value: STATUS_LABEL[hospital.status] },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'var(--s50)', borderRadius: 8, padding: '12px 14px' }}>
                      <div style={{ fontSize: 10, color: 'var(--s500)', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--s900)' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-title" style={{ marginBottom: 14 }}>⚡ 빠른 작업</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button className="btn" style={{ justifyContent: 'flex-start' }} onClick={() => setActiveTab('onboarding')}>🚀 온보딩 현황 보기</button>
                  <button className="btn" style={{ justifyContent: 'flex-start' }} onClick={() => setActiveTab('crm')}>💬 CRM 문의 확인</button>
                  <button className="btn" style={{ justifyContent: 'flex-start' }} onClick={() => setActiveTab('contract')}>📄 계약 정보 보기</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 탭 2: 온보딩 */}
        {activeTab === 'onboarding' && (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🚀</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--s700)', marginBottom: 8 }}>온보딩 관리</div>
            <div style={{ fontSize: 13, color: 'var(--s400)' }}>9단계 온보딩 화면은 다음 단계에서 구현됩니다.</div>
          </div>
        )}

        {/* 탭 3: 사이트 */}
        {activeTab === 'site' && (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🌐</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--s700)', marginBottom: 8 }}>사이트 관리</div>
            <div style={{ fontSize: 13, color: 'var(--s400)' }}>사이트 현황 및 컴플라이언스 알림 화면은 다음 단계에서 구현됩니다.</div>
          </div>
        )}

        {/* 탭 4: 문의·CRM */}
        {activeTab === 'crm' && (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--s700)', marginBottom: 8 }}>문의·CRM</div>
            <div style={{ fontSize: 13, color: 'var(--s400)' }}>환자 문의 내역은 병원별 DB에서 가져옵니다. 백엔드 연동 후 구현됩니다.</div>
          </div>
        )}

        {/* 탭 5: 계약·결제 */}
        {activeTab === 'contract' && (
          <div className="grid2">
            <div className="card">
              <div className="card-head">
                <div className="card-title">📄 계약 정보</div>
                <button className="btn">수정</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['플랜',       hospital.plan],
                    ['담당자',     hospital.manager],
                    ['계약 만료',  hospital.expire],
                  ].map(([label, value]) => (
                    <tr key={label} style={{ borderBottom: '1px solid var(--s100)' }}>
                      <td style={{ padding: '9px 0', fontSize: 12, color: 'var(--s500)', width: 110 }}>{label}</td>
                      <td style={{ padding: '9px 0', fontSize: 13, fontWeight: 500 }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>💳 결제 이력</div>
              <div style={{ fontSize: 13, color: 'var(--s400)', textAlign: 'center', padding: 24 }}>결제 이력은 백엔드 연동 후 표시됩니다.</div>
            </div>
          </div>
        )}

        {/* 탭 6: 내부 메모 */}
        {activeTab === 'memo' && (
          <div className="grid2">
            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>📝 담당자 메모</div>
              <textarea
                rows={4}
                placeholder="메모를 입력하세요..."
                style={{ width: '100%', marginBottom: 10 }}
              />
              <button className="btn btn-primary">메모 저장</button>
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>📋 활동 로그</div>
              <div style={{ fontSize: 13, color: 'var(--s400)', textAlign: 'center', padding: 24 }}>활동 로그는 백엔드 연동 후 표시됩니다.</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
