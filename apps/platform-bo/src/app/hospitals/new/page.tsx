'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import { createHospital } from '@/lib/api'

// ── 진료과 목록 ───────────────────────────────────────────────────
const CLINIC_TYPES = [
  { id: '성형외과', icon: '✂️', sub: '눈·코·윤곽·가슴·지방흡입' },
  { id: '피부과',   icon: '💆', sub: '레이저·보톡스·필러·리프팅' },
  { id: '치과',     icon: '🦷', sub: '임플란트·교정·미백' },
  { id: '안과',     icon: '👁️', sub: '시력교정·백내장' },
  { id: '기타',     icon: '🏥', sub: '기타 진료과' },
]

const SPECIALTIES: Record<string, string[]> = {
  '성형외과': ['쌍꺼풀·눈성형', '코성형', '안면윤곽', '가슴성형', '지방흡입', '눈·코 복합', '피부·리프팅', '기타'],
  '피부과':   ['레이저·색소', '보톡스·필러', '안티에이징·리프팅', '여드름·피부재생', '제모', '기타'],
  '치과':     ['임플란트', '치아교정', '미백·라미네이트', '충치·크라운', '잇몸·치주', '기타'],
  '안과':     ['시력교정', '백내장', '기타'],
  '기타':     ['기타'],
}

type Plan = 'Basic' | 'Pro' | 'Enterprise'
const PLANS: { key: Plan; label: string; desc: string; price: string; features: string[]; popular?: boolean }[] = [
  {
    key: 'Basic', label: 'Basic', desc: '소규모 병원', price: '490,000',
    features: ['환자용 사이트 생성', 'LINE 봇 기본 연동', 'SEO 기본 설정', '월 500건 AI 응답'],
  },
  {
    key: 'Pro', label: 'Pro', desc: '중형 병원', price: '890,000', popular: true,
    features: ['Basic 전체 포함', 'AEO 인용 최적화', '무제한 AI 응답', 'CRM 대시보드', '컴플라이언스 자동 검사'],
  },
  {
    key: 'Enterprise', label: 'Enterprise', desc: '대형 병원', price: '별도 협의',
    features: ['Pro 전체 포함', '전담 CSM 배정', '멀티 채널 연동', '맞춤 보고서', 'SLA 보장'],
  },
]

const MANAGERS = [
  { name: '김운영', role: '슈퍼 어드민' },
  { name: '이수진', role: '운영팀' },
]

const STEPS = ['병원 기본 정보', '플랜 선택', '담당자 설정', '검토 및 등록']

// ── 한국어 → 일본어 자동변환 ──────────────────────────────────────
const CHO  = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h']
const JUNG = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i']
const JONG = ['','g','kk','gs','n','nj','nh','d','l','lg','lm','lb','ls','lt','lp','lh','m','b','bs','s','ss','ng','j','ch','k','t','p','h']

const ROMAN_TO_KANA: [string, string][] = [
  ['chi','チ'],['tsu','ツ'],['shi','シ'],
  ['kk','ッ'],['pp','ッ'],['tt','ッ'],['ss','ッ'],['jj','ッ'],
  ['ch','チ'],['ng','ング'],['nj','ンジュ'],['nh','ン'],
  ['gs','クス'],['lg','ルグ'],['lm','ルム'],['lb','ルブ'],['ls','ルス'],['lt','ルト'],['lp','ルプ'],['lh','ルフ'],['bs','プス'],
  ['ka','カ'],['ki','キ'],['ku','ク'],['ke','ケ'],['ko','コ'],
  ['sa','サ'],['su','ス'],['se','セ'],['so','ソ'],
  ['ta','タ'],['te','テ'],['to','ト'],
  ['na','ナ'],['ni','ニ'],['nu','ヌ'],['ne','ネ'],['no','ノ'],
  ['ha','ハ'],['hi','ヒ'],['hu','フ'],['he','ヘ'],['ho','ホ'],
  ['ma','マ'],['mi','ミ'],['mu','ム'],['me','メ'],['mo','モ'],
  ['ya','ヤ'],['yu','ユ'],['yo','ヨ'],
  ['ra','ラ'],['ri','リ'],['ru','ル'],['re','レ'],['ro','ロ'],
  ['wa','ワ'],['wo','ヲ'],
  ['ga','ガ'],['gi','ギ'],['gu','グ'],['ge','ゲ'],['go','ゴ'],
  ['za','ザ'],['zu','ズ'],['ze','ゼ'],['zo','ゾ'],
  ['da','ダ'],['de','デ'],['do','ド'],
  ['ba','バ'],['bi','ビ'],['bu','ブ'],['be','ベ'],['bo','ボ'],
  ['pa','パ'],['pi','ピ'],['pu','プ'],['pe','ペ'],['po','ポ'],
  ['a','ア'],['i','イ'],['u','ウ'],['e','エ'],['o','オ'],
  ['n','ン'],['m','ム'],['l','ル'],['r','ル'],
  ['g','ク'],['d','ド'],['b','ブ'],['s','ス'],['j','ジュ'],
  ['h','フ'],['k','ク'],['t','ト'],['p','プ'],
]

const KR_DICT: [string, string][] = [
  ['성형외과','整形外科'],['피부과','皮膚科'],['치과','歯科'],['안과','眼科'],
  ['한의원','韓方クリニック'],['내과','内科'],['정형외과','整形外科'],['산부인과','産婦人科'],
  ['클리닉','クリニック'],['뷰티','ビューティ'],['병원','病院'],['의원','クリニック'],
  ['센터','センター'],['강남','カンナム'],['청담','チョンダム'],['압구정','アックジョン'],
  ['서울','ソウル'],['부산','プサン'],['대구','テグ'],['인천','インチョン'],
  ['광주','クァンジュ'],['대전','テジョン'],['올래','オルレ'],['미소','ミソ'],
]

function krToRoman(ch: string): string {
  const code = ch.charCodeAt(0)
  if (code < 0xAC00 || code > 0xD7A3) return ch
  const idx  = code - 0xAC00
  const cho  = Math.floor(idx / 588)
  const jung = Math.floor((idx % 588) / 28)
  const jong = idx % 28
  return (CHO[cho] ?? '') + (JUNG[jung] ?? '') + (JONG[jong] ?? '')
}

function romanToKana(roman: string): string {
  let result = '', i = 0
  while (i < roman.length) {
    let matched = false
    for (const len of [3, 2, 1]) {
      const sub   = roman.slice(i, i + len)
      const found = ROMAN_TO_KANA.find(([r]) => r === sub)
      if (found) { result += found[1]; i += len; matched = true; break }
    }
    if (!matched) { result += roman[i]; i++ }
  }
  return result
}

function autoTransliterate(nameKr: string): string {
  if (!nameKr.trim()) return ''
  const sorted = [...KR_DICT].sort((a, b) => b[0].length - a[0].length)
  let result = '', i = 0
  while (i < nameKr.length) {
    let matched = false
    for (const [kr, ja] of sorted) {
      if (nameKr.slice(i, i + kr.length) === kr) {
        result += ja; i += kr.length; matched = true; break
      }
    }
    if (!matched) {
      result += romanToKana(krToRoman(nameKr[i]))
      i++
    }
  }
  return result
}

// ── 전화번호 포맷팅 ───────────────────────────────────────────────
function formatPhone(value: string): string {
  const n = value.replace(/\D/g, '').slice(0, 11)
  if (/^01[0-9]/.test(n)) {
    if (n.length <= 3)  return n
    if (n.length <= 7)  return `${n.slice(0,3)}-${n.slice(3)}`
    return `${n.slice(0,3)}-${n.slice(3,7)}-${n.slice(7)}`
  } else if (n.startsWith('02')) {
    if (n.length <= 2)  return n
    if (n.length <= 5)  return `${n.slice(0,2)}-${n.slice(2)}`
    if (n.length <= 9)  return `${n.slice(0,2)}-${n.slice(2,6)}-${n.slice(6)}`
    return `${n.slice(0,2)}-${n.slice(2,6)}-${n.slice(6,10)}`
  } else {
    if (n.length <= 3)  return n
    if (n.length <= 6)  return `${n.slice(0,3)}-${n.slice(3)}`
    if (n.length <= 10) return `${n.slice(0,3)}-${n.slice(3,7)}-${n.slice(7)}`
    return `${n.slice(0,3)}-${n.slice(3,7)}-${n.slice(7,11)}`
  }
}

// ── 이메일 검증 ───────────────────────────────────────────────────
type EmailState = 'empty' | 'no-at' | 'invalid' | 'valid'
function checkEmail(v: string): EmailState {
  if (!v.trim()) return 'empty'
  if (!v.includes('@')) return 'no-at'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'invalid'
  return 'valid'
}

// ── 폼 데이터 타입 ────────────────────────────────────────────────
interface FormData {
  nameKr: string; nameJa: string; clinicType: string; specialty: string
  subSpecialty: string; phone: string; email: string; address: string
  website: string; directorName: string; directorTitle: string
  plan: Plan | ''; contractStart: string; autoRenew: boolean
  managerName: string; managerEmail: string; memo: string
  notifyLine: boolean; notifyEmail: boolean; notifyKakao: boolean; notifyReport: boolean
}

const INITIAL: FormData = {
  nameKr: '', nameJa: '', clinicType: '', specialty: '', subSpecialty: '',
  phone: '', email: '', address: '', website: '', directorName: '', directorTitle: '',
  plan: '', contractStart: new Date().toISOString().slice(0, 10), autoRenew: true,
  managerName: '', managerEmail: '', memo: '',
  notifyLine: true, notifyEmail: true, notifyKakao: false, notifyReport: true,
}

// ── 토스트 컴포넌트 ───────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' | 'default' }) {
  const bg = type === 'success' ? 'var(--teal)' : type === 'error' ? '#DC2626' : 'var(--navy)'
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      background: bg, color: '#fff', padding: '10px 20px', borderRadius: 8,
      fontSize: 13, fontWeight: 600, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,.2)',
      whiteSpace: 'nowrap',
    }}>
      {msg}
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────
export default function HospitalNewPage() {
  const router = useRouter()
  const [step, setStep]         = useState(1)
  const [form, setForm]         = useState<FormData>(INITIAL)
  const [emailState, setEmailState] = useState<EmailState>('empty')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast]       = useState<{ msg: string; type: 'success' | 'error' | 'default' } | null>(null)
  const nameJaManual            = useRef(false)

  const set = (field: keyof FormData, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  // 한국어 → 일본어 자동변환
  useEffect(() => {
    if (!nameJaManual.current) {
      set('nameJa', autoTransliterate(form.nameKr))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.nameKr])

  function showToast(msg: string, type: 'success' | 'error' | 'default' = 'default') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  function validate(s: number): boolean {
    if (s === 1) {
      if (!form.nameKr)     { showToast('병원명(한국어)을 입력하세요.', 'error');    return false }
      if (!form.clinicType) { showToast('진료과 유형을 선택하세요.', 'error');       return false }
      if (!form.specialty)  { showToast('주 전문 분야를 선택하세요.', 'error');      return false }
      if (!form.phone)      { showToast('대표 전화를 입력하세요.', 'error');         return false }
      if (!form.email)      { showToast('이메일을 입력하세요.', 'error');            return false }
      if (checkEmail(form.email) !== 'valid') { showToast('올바른 이메일 형식으로 입력하세요.', 'error'); return false }
      if (!form.address)    { showToast('병원 주소를 입력하세요.', 'error');         return false }
      if (!form.directorName) { showToast('원장명을 입력하세요.', 'error');          return false }
    }
    if (s === 2) {
      if (!form.plan) { showToast('플랜을 선택하세요.', 'error'); return false }
    }
    if (s === 3) {
      if (!form.managerName) { showToast('담당자를 선택하세요.', 'error'); return false }
    }
    return true
  }

  function next() { if (validate(step)) setStep(s => s + 1) }
  function prev() { setStep(s => s - 1) }

  async function submit() {
    setSubmitting(true)
    try {
      await createHospital({
        nameKr: form.nameKr, nameJa: form.nameJa || undefined,
        clinicType: form.clinicType, specialty: form.specialty || undefined,
        plan: form.plan as string, managerName: form.managerName,
        managerEmail: form.managerEmail, contractStart: form.contractStart,
      })
      showToast('병원이 등록되었습니다!', 'success')
      setTimeout(() => router.push('/hospitals'), 1000)
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : '등록 중 오류가 발생했습니다.', 'error')
      setSubmitting(false)
    }
  }

  // 이메일 보더 색
  const emailBorder = emailState === 'valid' ? 'var(--teal)' : emailState === 'no-at' ? '#F59E0B' : emailState === 'invalid' ? '#DC2626' : undefined

  return (
    <>
      {toast && <Toast {...toast} />}

      <PageHeader backHref="/hospitals" backLabel="병원 목록" title="신규 병원 등록">
        <button className="btn" onClick={() => router.push('/hospitals')}>✕ 취소</button>
      </PageHeader>

      <div className="content">
        {/* 단계 표시기 */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          {STEPS.map((label, i) => {
            const n = i + 1; const done = n < step; const curr = n === step
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'unset' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: done ? 'var(--teal)' : curr ? 'var(--navy)' : 'var(--s200)',
                    color: done || curr ? '#fff' : 'var(--s500)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    boxShadow: curr ? '0 2px 8px rgba(13,27,62,.3)' : 'none',
                  }}>
                    {done ? '✓' : n}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: curr ? 700 : 400, color: curr ? 'var(--navy)' : done ? 'var(--teal)' : 'var(--s400)', whiteSpace: 'nowrap' }}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: n < step ? 'var(--teal)' : 'var(--s200)', margin: '0 10px', borderRadius: 2 }} />
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
                <div>
                  <label style={labelStyle}>병원명 (한국어) <Req /></label>
                  <input type="text" value={form.nameKr}
                    onChange={e => { nameJaManual.current = false; set('nameKr', e.target.value) }}
                    placeholder="강남뷰티클리닉" />
                </div>
                <div>
                  <label style={labelStyle}>병원명 (일본어)</label>
                  <input type="text" value={form.nameJa}
                    onChange={e => { nameJaManual.current = true; set('nameJa', e.target.value) }}
                    onFocus={() => { nameJaManual.current = true }}
                    placeholder="カタカナで入力" />
                  <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 3 }}>한국어 입력 시 자동 변환됩니다</div>
                </div>
              </div>

              {/* 진료과 카드 */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>진료과 유형 <Req /></label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {CLINIC_TYPES.map(ct => {
                    const sel = form.clinicType === ct.id
                    return (
                      <button key={ct.id} onClick={() => { set('clinicType', ct.id); set('specialty', '') }}
                        style={{
                          flex: '1 1 100px', padding: '12px 14px', textAlign: 'left', cursor: 'pointer',
                          border: `2px solid ${sel ? 'var(--navy)' : 'var(--s200)'}`,
                          borderRadius: 10, background: sel ? 'var(--navy-l)' : 'var(--s0)',
                          transition: 'all .15s',
                        }}>
                        <div style={{ fontSize: 22, marginBottom: 6 }}>{ct.icon}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: sel ? 'var(--navy)' : 'var(--s800)' }}>{ct.id}</div>
                        <div style={{ fontSize: 11, color: sel ? 'var(--navy)' : 'var(--s400)', marginTop: 2 }}>{ct.sub}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid2" style={{ marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>주 전문 분야 <Req /></label>
                  <select value={form.specialty} onChange={e => set('specialty', e.target.value)} disabled={!form.clinicType}>
                    <option value="">선택하세요</option>
                    {(SPECIALTIES[form.clinicType] ?? []).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>세부 전문 시술</label>
                  <input type="text" value={form.subSpecialty} onChange={e => set('subSpecialty', e.target.value)} placeholder="예: 쌍꺼풀, 눈매교정" />
                </div>
              </div>

              <div className="grid2" style={{ marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>대표 전화 <Req /></label>
                  <input type="text" value={form.phone} inputMode="numeric" maxLength={13}
                    onChange={e => set('phone', formatPhone(e.target.value))}
                    placeholder="숫자만 입력하세요" />
                  {form.phone && (
                    <div style={{ fontSize: 11, color: 'var(--s400)', marginTop: 3 }}>
                      {/^01/.test(form.phone.replace(/-/g, '')) ? '📱 휴대폰'
                        : /^02/.test(form.phone.replace(/-/g, '')) ? '📞 서울 일반전화'
                        : '📞 지역 일반전화'}
                    </div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>이메일 <Req /></label>
                  <input type="text" value={form.email}
                    onChange={e => { set('email', e.target.value); setEmailState(checkEmail(e.target.value)) }}
                    onBlur={e => setEmailState(checkEmail(e.target.value))}
                    placeholder="contact@clinic.co.kr"
                    style={emailBorder ? { borderColor: emailBorder } : undefined} />
                  {emailState === 'no-at'   && <div style={{ fontSize: 11, color: '#F59E0B', marginTop: 3 }}>@ 문자가 필요합니다</div>}
                  {emailState === 'invalid' && <div style={{ fontSize: 11, color: '#DC2626', marginTop: 3 }}>올바른 이메일 형식이 아닙니다</div>}
                  {emailState === 'valid'   && <div style={{ fontSize: 11, color: 'var(--teal)', marginTop: 3 }}>✓ 올바른 이메일 형식입니다</div>}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>병원 주소 <Req /></label>
                <input type="text" value={form.address} onChange={e => set('address', e.target.value)} placeholder="서울 강남구 논현로 123" />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>기존 홈페이지 URL</label>
                <input type="text" value={form.website}
                  onChange={e => set('website', e.target.value)}
                  onFocus={e => { if (!e.target.value) set('website', 'https://') }}
                  onBlur={e  => { if (e.target.value === 'https://') set('website', '') }}
                  placeholder="https://clinic.co.kr" />
              </div>

              <div className="grid2">
                <div>
                  <label style={labelStyle}>원장명 <Req /></label>
                  <input type="text" value={form.directorName} onChange={e => set('directorName', e.target.value)} placeholder="홍길동" />
                </div>
                <div>
                  <label style={labelStyle}>직함</label>
                  <input type="text" value={form.directorTitle} onChange={e => set('directorTitle', e.target.value)} placeholder="원장" />
                </div>
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
              <div className="card-title" style={{ marginBottom: 20 }}>📦 플랜 선택 <Req /></div>

              <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
                {PLANS.map(p => {
                  const sel = form.plan === p.key
                  return (
                    <button key={p.key} onClick={() => set('plan', p.key)} style={{
                      flex: 1, padding: '18px 16px', textAlign: 'left', cursor: 'pointer',
                      border: `2px solid ${sel ? 'var(--navy)' : 'var(--s200)'}`,
                      borderRadius: 12, background: sel ? 'var(--navy-l)' : 'var(--s0)',
                      position: 'relative', transition: 'all .15s',
                    }}>
                      {p.popular && (
                        <div style={{
                          position: 'absolute', top: -10, right: 12,
                          background: 'var(--teal)', color: '#fff',
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        }}>인기</div>
                      )}
                      <div style={{ fontSize: 14, fontWeight: 700, color: sel ? 'var(--navy)' : 'var(--s900)', marginBottom: 2 }}>{p.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--s500)', marginBottom: 10 }}>{p.desc}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: sel ? 'var(--navy)' : 'var(--s800)', marginBottom: 12 }}>
                        {p.price === '별도 협의' ? p.price : `₩${p.price}`}
                        {p.price !== '별도 협의' && <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--s400)' }}>/월</span>}
                      </div>
                      {p.features.map(f => (
                        <div key={f} style={{ fontSize: 11, color: sel ? 'var(--navy)' : 'var(--s600)', padding: '2px 0', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--teal)', flexShrink: 0 }}>✓</span>{f}
                        </div>
                      ))}
                    </button>
                  )
                })}
              </div>

              <div className="grid2" style={{ marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>계약 시작일</label>
                  <input type="date" value={form.contractStart} onChange={e => set('contractStart', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>자동 갱신</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8, cursor: 'pointer' }}>
                    <div className="toggle-wrap">
                      <input type="checkbox" checked={form.autoRenew} onChange={e => set('autoRenew', e.target.checked)} />
                      <div className="toggle-track" />
                      <div className="toggle-thumb" />
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--s700)' }}>매년 자동 갱신</span>
                  </label>
                </div>
              </div>

              <div className="card-head" style={{ paddingTop: 20, borderTop: '1px solid var(--s100)' }}>
                <button className="btn" onClick={prev}>← 이전</button>
                <button className="btn btn-primary" onClick={next}>다음 단계 →</button>
              </div>
            </>
          )}

          {/* ── STEP 3: 담당자 설정 ── */}
          {step === 3 && (
            <>
              <div className="card-title" style={{ marginBottom: 20 }}>👤 담당자 설정</div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>담당자 선택 <Req /></label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {MANAGERS.map(m => {
                    const sel = form.managerName === m.name
                    return (
                      <button key={m.name} onClick={() => set('managerName', m.name)} style={{
                        flex: 1, padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                        border: `2px solid ${sel ? 'var(--navy)' : 'var(--s200)'}`,
                        borderRadius: 10, background: sel ? 'var(--navy-l)' : 'var(--s0)',
                        transition: 'all .15s',
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: sel ? 'var(--navy)' : 'var(--s900)' }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--s500)', marginTop: 2 }}>{m.role}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>알림 이메일</label>
                <input type="email" value={form.managerEmail} onChange={e => set('managerEmail', e.target.value)} placeholder="manager@mediflow.co.kr" />
              </div>

              {/* 알림 설정 토글 */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>알림 설정</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 16px', background: 'var(--s50)', borderRadius: 10 }}>
                  {[
                    { key: 'notifyLine' as const,   label: 'LINE 봇 이상 알림' },
                    { key: 'notifyEmail' as const,  label: '신규 문의 이메일 알림' },
                    { key: 'notifyKakao' as const,  label: '카카오 알림톡 수신' },
                    { key: 'notifyReport' as const, label: '주간 리포트 자동 발송' },
                  ].map(item => (
                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                      <div className="toggle-wrap">
                        <input type="checkbox" checked={form[item.key] as boolean} onChange={e => set(item.key, e.target.checked)} />
                        <div className="toggle-track" />
                        <div className="toggle-thumb" />
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--s700)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>내부 메모 (선택)</label>
                <textarea value={form.memo} onChange={e => set('memo', e.target.value)} rows={4} placeholder="병원 특이사항, 계약 관련 메모 등" />
              </div>

              <div className="card-head" style={{ paddingTop: 20, borderTop: '1px solid var(--s100)' }}>
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
                  ['진료과 유형', form.clinicType],
                  ['전문 분야', form.specialty],
                  ['세부 시술', form.subSpecialty || '-'],
                  ['대표 전화', form.phone],
                  ['이메일', form.email],
                  ['주소', form.address],
                  ['홈페이지', form.website || '-'],
                  ['원장명', form.directorName],
                ]},
                { title: '플랜 & 계약', rows: [
                  ['플랜', form.plan || '-'],
                  ['계약 시작일', form.contractStart],
                  ['자동 갱신', form.autoRenew ? '예' : '아니오'],
                ]},
                { title: '담당자', rows: [
                  ['담당자', form.managerName],
                  ['알림 이메일', form.managerEmail || '-'],
                  ['내부 메모', form.memo || '-'],
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
                <button className="btn btn-primary" onClick={submit} disabled={submitting}
                  style={{ opacity: submitting ? .6 : 1 }}>
                  {submitting ? '등록 중...' : '🏥 병원 등록 완료'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--s700)', marginBottom: 6 }
function Req() { return <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span> }
