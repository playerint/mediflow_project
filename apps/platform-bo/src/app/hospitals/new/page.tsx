'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import { createHospital } from '@/lib/api'

type Plan = 'Basic' | 'Pro' | 'Enterprise'

interface FormData {
  // Step 1
  nameKr:        string
  nameJa:        string
  clinicType:    string
  specialty:     string
  subSpecialty:  string
  phone:         string
  email:         string
  address:       string
  website:       string
  directorName:  string
  directorTitle: string
  // Step 2
  plan:          Plan | ''
  contractStart: string
  autoRenew:     boolean
  // Step 3
  managerName:   string
  managerEmail:  string
  memo:          string
}

const INITIAL_FORM: FormData = {
  nameKr: '', nameJa: '', clinicType: '', specialty: '', subSpecialty: '',
  phone: '', email: '', address: '', website: '', directorName: '', directorTitle: '',
  plan: '', contractStart: new Date().toISOString().slice(0, 10), autoRenew: true,
  managerName: '', managerEmail: '', memo: '',
}

const CLINIC_TYPES = ['성형외과', '피부과', '치과', '안과', '기타']

const SPECIALTIES: Record<string, string[]> = {
  '성형외과': ['쌍꺼풀·눈성형', '안면윤곽', '코성형', '지방흡입', '가슴성형', '눈·코 복합', '피부·리프팅', '기타'],
  '피부과':   ['보톡스·필러', '레이저 시술', '피부 재생', '기타'],
  '치과':     ['임플란트', '라미네이트', '교정', '기타'],
  '안과':     ['시력교정', '백내장', '기타'],
  '기타':     ['기타'],
}

const PLANS: { key: Plan; label: string; desc: string; price: string }[] = [
  { key: 'Basic',      label: 'Basic',      desc: '소규모 병원 · 기본 기능',   price: '월 490,000원' },
  { key: 'Pro',        label: 'Pro',        desc: '중형 병원 · 전체 기능',      price: '월 890,000원' },
  { key: 'Enterprise', label: 'Enterprise', desc: '대형 병원 · 전용 지원',      price: '별도 협의' },
]

const MANAGERS = [
  { name: '김운영', role: '슈퍼 어드민' },
  { name: '이수진', role: '운영팀' },
]

const STEPS = ['병원 기본 정보', '플랜 선택', '담당자 설정', '검토 및 등록']

/* 카드 선택 스타일 */
const cardSelectStyle = (selected: boolean) => ({
  flex: 1,
  padding: '14px 16px',
  border: `2px solid ${selected ? 'var(--navy)' : 'var(--s200)'}`,
  borderRadius: 'var(--rl)',
  background: selected ? 'var(--navy-l)' : 'var(--s0)',
  cursor: 'pointer',
  textAlign: 'left' as const,
  transition: 'all .15s',
  fontFamily: 'inherit',
})

export default function HospitalNewPage() {
  const router   = useRouter()
  const [step, setStep]       = useState(1)
  const [form, setForm]       = useState<FormData>(INITIAL_FORM)
  const [errors, setErrors]   = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const set = (field: keyof FormData, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  /* 필수 검증 */
  function validate(s: number): boolean {
    const e: typeof errors = {}
    if (s === 1) {
      if (!form.nameKr)     e.nameKr     = '필수 입력 항목입니다'
      if (!form.clinicType) e.clinicType = '진료과를 선택해주세요'
      if (!form.specialty)  e.specialty  = '전문 분야를 선택해주세요'
      if (!form.phone)      e.phone      = '필수 입력 항목입니다'
      if (!form.email)      e.email      = '필수 입력 항목입니다'
      if (!form.address)    e.address    = '필수 입력 항목입니다'
      if (!form.directorName) e.directorName = '필수 입력 항목입니다'
    }
    if (s === 3) {
      if (!form.managerName) e.managerName = '담당자를 선택해주세요'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() { if (validate(step)) setStep(s => s + 1) }
  function prev() { setErrors({}); setStep(s => s - 1) }

  async function submit() {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await createHospital({
        nameKr:        form.nameKr,
        nameJa:        form.nameJa || undefined,
        clinicType:    form.clinicType,
        specialty:     form.specialty || undefined,
        plan:          form.plan as string,
        managerName:   form.managerName,
        managerEmail:  form.managerEmail,
        contractStart: form.contractStart,
      })
      router.push('/hospitals')
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : '등록 중 오류가 발생했습니다.')
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader backHref="/hospitals" backLabel="병원 목록" title="신규 병원 등록">
        <button className="btn" onClick={() => router.push('/hospitals')}>✕ 취소</button>
      </PageHeader>

      <div className="content">
        {/* 단계 표시기 */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 0 }}>
          {STEPS.map((label, i) => {
            const n    = i + 1
            const done = n < step
            const curr = n === step
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'unset' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: done ? 'var(--navy)' : curr ? 'var(--blue)' : 'var(--s200)',
                    color: done || curr ? '#fff' : 'var(--s500)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>
                    {done ? '✓' : n}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: curr ? 700 : 400, color: curr ? 'var(--navy)' : done ? 'var(--s500)' : 'var(--s400)', whiteSpace: 'nowrap' }}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 1, background: n < step ? 'var(--navy)' : 'var(--s200)', margin: '0 12px' }} />
                )}
              </div>
            )
          })}
        </div>

        <div className="card">
          {/* ── STEP 1: 병원 기본 정보 ── */}
          {step === 1 && (
            <>
              <div className="card-title" style={{ marginBottom: 20 }}>🏥 병원 기본 정보</div>

              <div className="grid2" style={{ marginBottom: 16 }}>
                <Field label="병원명 (한국어)" required error={errors.nameKr}>
                  <input type="text" value={form.nameKr} onChange={e => set('nameKr', e.target.value)} placeholder="강남뷰티클리닉" />
                </Field>
                <Field label="병원명 (일본어)" required>
                  <input type="text" value={form.nameJa} onChange={e => set('nameJa', e.target.value)} placeholder="カタカナで入力" />
                </Field>
              </div>

              <Field label="진료과 유형" required error={errors.clinicType} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {CLINIC_TYPES.map(t => (
                    <button key={t} style={cardSelectStyle(form.clinicType === t)} onClick={() => { set('clinicType', t); set('specialty', '') }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: form.clinicType === t ? 'var(--navy)' : 'var(--s700)' }}>{t}</div>
                    </button>
                  ))}
                </div>
              </Field>

              <div className="grid2" style={{ marginBottom: 16 }}>
                <Field label="주 전문 분야" required error={errors.specialty}>
                  <select value={form.specialty} onChange={e => set('specialty', e.target.value)} disabled={!form.clinicType}>
                    <option value="">선택하세요</option>
                    {(SPECIALTIES[form.clinicType] ?? []).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="세부 전문 시술">
                  <input type="text" value={form.subSpecialty} onChange={e => set('subSpecialty', e.target.value)} placeholder="예: 쌍꺼풀, 눈매교정" />
                </Field>
              </div>

              <div className="grid2" style={{ marginBottom: 16 }}>
                <Field label="대표 전화" required error={errors.phone}>
                  <input type="text" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="숫자만 입력하세요" />
                </Field>
                <Field label="이메일" required error={errors.email}>
                  <input type="text" value={form.email} onChange={e => set('email', e.target.value)} placeholder="contact@clinic.co.kr" />
                </Field>
              </div>

              <Field label="병원 주소" required error={errors.address} style={{ marginBottom: 16 }}>
                <input type="text" value={form.address} onChange={e => set('address', e.target.value)} placeholder="서울 강남구 논현로 123" />
              </Field>

              <Field label="기존 홈페이지 URL" style={{ marginBottom: 16 }}>
                <input type="text" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://clinic.co.kr" />
              </Field>

              <div className="grid2">
                <Field label="원장명" required error={errors.directorName}>
                  <input type="text" value={form.directorName} onChange={e => set('directorName', e.target.value)} placeholder="홍길동" />
                </Field>
                <Field label="직함">
                  <input type="text" value={form.directorTitle} onChange={e => set('directorTitle', e.target.value)} placeholder="원장" />
                </Field>
              </div>

              <div className="card-head" style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--s100)' }}>
                <span style={{ fontSize: 12, color: 'var(--s400)' }}>* 표시는 필수 입력 항목입니다</span>
                <button className="btn btn-primary" onClick={next}>다음 단계 →</button>
              </div>
            </>
          )}

          {/* ── STEP 2: 플랜 선택 ── */}
          {step === 2 && (
            <>
              <div className="card-title" style={{ marginBottom: 20 }}>📦 플랜 선택</div>

              <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
                {PLANS.map(p => (
                  <button key={p.key} style={{ ...cardSelectStyle(form.plan === p.key), flex: 1 }} onClick={() => set('plan', p.key)}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: form.plan === p.key ? 'var(--navy)' : 'var(--s900)', marginBottom: 6 }}>{p.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--s500)', marginBottom: 8 }}>{p.desc}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: form.plan === p.key ? 'var(--navy)' : 'var(--s700)' }}>{p.price}</div>
                  </button>
                ))}
              </div>

              <div className="grid2" style={{ marginBottom: 16 }}>
                <Field label="계약 시작일">
                  <input type="date" value={form.contractStart} onChange={e => set('contractStart', e.target.value)} />
                </Field>
                <Field label="자동 갱신">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8, cursor: 'pointer' }}>
                    <div className="toggle-wrap">
                      <input type="checkbox" checked={form.autoRenew} onChange={e => set('autoRenew', e.target.checked)} />
                      <div className="toggle-track" />
                      <div className="toggle-thumb" />
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--s700)' }}>매년 자동 갱신</span>
                  </label>
                </Field>
              </div>

              <div className="card-head" style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--s100)' }}>
                <button className="btn" onClick={prev}>← 이전</button>
                <button className="btn btn-primary" onClick={next}>다음 단계 →</button>
              </div>
            </>
          )}

          {/* ── STEP 3: 담당자 설정 ── */}
          {step === 3 && (
            <>
              <div className="card-title" style={{ marginBottom: 20 }}>👤 담당자 설정</div>

              <Field label="담당자 선택" required error={errors.managerName} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  {MANAGERS.map(m => (
                    <button key={m.name} style={cardSelectStyle(form.managerName === m.name)} onClick={() => set('managerName', m.name)}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: form.managerName === m.name ? 'var(--navy)' : 'var(--s900)' }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--s500)', marginTop: 2 }}>{m.role}</div>
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="알림 이메일" style={{ marginBottom: 16 }}>
                <input type="email" value={form.managerEmail} onChange={e => set('managerEmail', e.target.value)} placeholder="manager@mediflow.co.kr" />
              </Field>

              <Field label="내부 메모 (선택)">
                <textarea value={form.memo} onChange={e => set('memo', e.target.value)} rows={4} placeholder="병원 특이사항, 계약 관련 메모 등" />
              </Field>

              <div className="card-head" style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--s100)' }}>
                <button className="btn" onClick={prev}>← 이전</button>
                <button className="btn btn-primary" onClick={next}>검토 및 등록 →</button>
              </div>
            </>
          )}

          {/* ── STEP 4: 검토 및 등록 ── */}
          {step === 4 && (
            <>
              <div className="card-title" style={{ marginBottom: 20 }}>✅ 등록 내용 검토</div>

              {[
                { title: '병원 기본 정보', rows: [
                  ['병원명 (한국어)', form.nameKr],
                  ['병원명 (일본어)', form.nameJa || '-'],
                  ['진료과 유형',     form.clinicType],
                  ['전문 분야',       form.specialty],
                  ['세부 시술',       form.subSpecialty || '-'],
                  ['대표 전화',       form.phone],
                  ['이메일',         form.email],
                  ['주소',           form.address],
                  ['홈페이지',        form.website || '-'],
                  ['원장명',         form.directorName],
                ]},
                { title: '플랜 & 계약', rows: [
                  ['플랜',       form.plan || '-'],
                  ['계약 시작일', form.contractStart],
                  ['자동 갱신',   form.autoRenew ? '예' : '아니오'],
                ]},
                { title: '담당자', rows: [
                  ['담당자',     form.managerName],
                  ['알림 이메일', form.managerEmail || '-'],
                  ['내부 메모',   form.memo || '-'],
                ]},
              ].map(section => (
                <div key={section.title} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--s500)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.5px' }}>{section.title}</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {section.rows.map(([label, value]) => (
                        <tr key={label} style={{ borderBottom: '1px solid var(--s100)' }}>
                          <td style={{ padding: '8px 0', fontSize: 12, color: 'var(--s500)', width: 130 }}>{label}</td>
                          <td style={{ padding: '8px 0', fontSize: 13, fontWeight: 500, color: 'var(--s900)' }}>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              <div className="card-head" style={{ paddingTop: 20, borderTop: '1px solid var(--s100)' }}>
                <button className="btn" onClick={prev}>← 이전으로</button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn">임시 저장</button>
                  {submitError && (
                    <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 8 }}>
                      ⚠ {submitError}
                    </div>
                  )}
                  <button
                    className="btn btn-primary"
                    onClick={submit}
                    disabled={submitting}
                    style={{ opacity: submitting ? .6 : 1 }}
                  >
                    {submitting ? '등록 중...' : '🏥 병원 등록 완료'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

/* ── 공통 폼 필드 래퍼 ── */
function Field({ label, required, error, children, style }: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div style={style}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--s700)', marginBottom: 6 }}>
        {label}{required && <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{error}</div>}
    </div>
  )
}
