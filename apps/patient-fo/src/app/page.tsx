'use client'
import { useState } from 'react'
import { hospital, doctors, treatments, cases, reviews, faqs } from '@/lib/mock-data'

export default function HospitalSite() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeConcern, setActiveConcern] = useState<number | null>(null)

  const concerns = [
    { emoji: '😰', label: '傷跡が不安', answer: '埋没法・最小切開で目立たない仕上がり。術後ケアも完全日本語サポートです。' },
    { emoji: '💰', label: '費用が心配', answer: '日本と同等の技術で30〜50%お得。無料カウンセリングで正確なお見積りをご提案します。' },
    { emoji: '⏰', label: '回復時間は？', answer: '埋没法は翌日帰国OK。切開系は3〜5日推奨。スケジュールに合わせてご提案します。' },
    { emoji: '🌏', label: '言葉が心配', answer: '日本語スタッフ常駐。カウンセリング〜手術〜アフターケアまで全て日本語でOK。' },
    { emoji: '✈️', label: '交通・宿泊', answer: '仁川空港から約60分。提携ホテルや送迎サービスもご案内できます。' },
    { emoji: '🏥', label: '安全性は？', answer: '全医師が韓国専門医資格取得済み。清潔・安全な医療環境を徹底しています。' },
  ]

  return (
    <>
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-stone-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <div>
            <span className="text-lg font-bold text-rose-700">{hospital.nameJa}</span>
            <span className="ml-2 text-xs text-stone-400 hidden sm:inline">{hospital.nameKr}</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-stone-600">
            <a href="#doctors" className="hover:text-rose-600 transition-colors">ドクター</a>
            <a href="#treatments" className="hover:text-rose-600 transition-colors">施術メニュー</a>
            <a href="#cases" className="hover:text-rose-600 transition-colors">症例</a>
            <a href="#faq" className="hover:text-rose-600 transition-colors">よくある質問</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href={`https://line.me/R/ti/p/${hospital.lineId}`}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm px-4 py-2 rounded-full font-medium transition-colors hidden sm:block">
              💬 LINEで相談
            </a>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-stone-600 text-xl">
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-stone-100 px-4 pb-4">
            <nav className="flex flex-col gap-3 text-sm text-stone-600 pt-3">
              {['#doctors|ドクター','#treatments|施術メニュー','#cases|症例','#faq|よくある質問'].map(item => {
                const [href, label] = item.split('|')
                return <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
              })}
              <a href={`https://line.me/R/ti/p/${hospital.lineId}`}
                className="bg-emerald-500 text-white text-center py-2 rounded-full font-medium">
                💬 LINEで相談
              </a>
            </nav>
          </div>
        )}
      </header>

      <main className="pt-16">

        {/* ヒーロー */}
        <section className="bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-rose-500 font-medium mb-4 tracking-widest">
              ソウル江南 日本人患者専門クリニック
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-stone-900 leading-tight mb-6">
              {hospital.tagline}
            </h1>
            <p className="text-stone-500 text-lg mb-8">{hospital.taglineSub}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-2xl mx-auto">
              {hospital.stats.map((s, i) => (
                <div key={i} className="bg-white/80 rounded-2xl p-4 shadow-sm">
                  <p className="text-2xl font-bold text-rose-600">{s.value}</p>
                  <p className="text-xs text-stone-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={`https://line.me/R/ti/p/${hospital.lineId}`}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-colors shadow-lg">
                💬 LINEで無料相談
              </a>
              <a href="#treatments"
                className="bg-white hover:bg-stone-50 text-stone-700 px-8 py-4 rounded-full font-bold text-lg transition-colors shadow border border-stone-200">
                施術メニューを見る
              </a>
            </div>
          </div>
        </section>

        {/* お悩み別ガイド */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-stone-800 mb-2">よくあるご不安を解消します</h2>
            <p className="text-center text-stone-500 text-sm mb-8">気になる項目をタップしてください</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {concerns.map((c, i) => (
                <button key={i} onClick={() => setActiveConcern(activeConcern === i ? null : i)}
                  className={`rounded-2xl p-4 text-left transition-all border-2 ${
                    activeConcern === i ? 'border-rose-400 bg-rose-50' : 'border-stone-100 bg-stone-50 hover:border-rose-200'
                  }`}>
                  <span className="text-2xl">{c.emoji}</span>
                  <p className="text-sm font-medium text-stone-700 mt-1">{c.label}</p>
                </button>
              ))}
            </div>
            {activeConcern !== null && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-stone-700 text-sm leading-relaxed">
                <span className="text-xl mr-2">{concerns[activeConcern].emoji}</span>
                {concerns[activeConcern].answer}
              </div>
            )}
          </div>
        </section>

        {/* ドクター紹介 */}
        <section id="doctors" className="py-16 px-4 bg-stone-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-stone-800 mb-2">ドクター紹介</h2>
            <p className="text-center text-stone-500 text-sm mb-10">全員、韓国専門医資格取得の経験豊富な医師です</p>
            <div className="grid md:grid-cols-3 gap-6">
              {doctors.map((doc) => (
                <div key={doc.id} className="bg-white rounded-3xl shadow-sm overflow-hidden">
                  <div className={`h-36 bg-gradient-to-br ${doc.gradient} flex items-center justify-center`}>
                    <span className="text-5xl">👨‍⚕️</span>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-rose-500 font-medium mb-1">{doc.specialty}</p>
                    <h3 className="font-bold text-stone-800 mb-1">{doc.nameJa}</h3>
                    <p className="text-xs text-stone-400 mb-3">{doc.experience}</p>
                    <p className="text-sm text-stone-600 leading-relaxed">{doc.philosophy}</p>
                    <a href={`https://line.me/R/ti/p/${hospital.lineId}`}
                      className="mt-4 block text-center text-sm text-emerald-600 border border-emerald-400 rounded-full py-2 hover:bg-emerald-50 transition-colors">
                      相談を申し込む
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 施術メニュー */}
        <section id="treatments" className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-stone-800 mb-2">施術メニュー</h2>
            <p className="text-center text-stone-500 text-sm mb-10">日本語でご相談いただけます</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {treatments.map((t) => (
                <div key={t.id}
                  className="border border-stone-100 rounded-2xl p-5 hover:shadow-md hover:border-rose-200 transition-all bg-stone-50">
                  <span className="text-2xl">{t.emoji}</span>
                  <p className="text-xs text-rose-400 mt-2 mb-1">{t.category}</p>
                  <h3 className="font-medium text-stone-800 text-sm leading-snug">{t.nameJa}</h3>
                  <p className="text-xs text-stone-400 mt-2">施術時間 {t.duration}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <a href={`https://line.me/R/ti/p/${hospital.lineId}`}
                className="inline-block bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-full font-medium transition-colors">
                料金・詳細をLINEで聞く
              </a>
            </div>
          </div>
        </section>

        {/* 症例 */}
        <section id="cases" className="py-16 px-4 bg-stone-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-stone-800 mb-2">施術症例</h2>
            <p className="text-center text-stone-500 text-sm mb-10">実際の患者様の症例をご紹介します</p>
            <div className="grid md:grid-cols-3 gap-5">
              {cases.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="flex h-40">
                    <div className="flex-1 bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                      <span className="text-xs text-stone-500 font-medium">BEFORE</span>
                    </div>
                    <div className="w-px bg-stone-400" />
                    <div className="flex-1 bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center">
                      <span className="text-xs text-rose-500 font-medium">AFTER</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-stone-400">#{c.id}</span>
                    <p className="font-medium text-stone-800 text-sm mt-1">{c.type}</p>
                    <p className="text-xs text-stone-400 mt-1">{c.patient} / {c.doctor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 口コミ */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-stone-800 mb-2">患者様の声</h2>
            <p className="text-center text-stone-500 text-sm mb-10">日本から来院された方々のリアルな声</p>
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <div key={r.id} className="bg-rose-50 rounded-2xl p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(r.rating)].map((_, i) => (
                      <span key={i} className="text-amber-400 text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed mb-4">"{r.text}"</p>
                  <p className="text-xs font-medium text-stone-700">{r.name}</p>
                  <p className="text-xs text-stone-400">{r.treatment}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 安心ボックス */}
        <section className="py-16 px-4 bg-gradient-to-br from-rose-500 to-pink-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-2">日本人患者様への安心サポート</h2>
            <p className="text-rose-100 text-sm mb-10">渡航から帰国後まで、全てサポートします</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { emoji: '💬', title: '無料カウンセリング', desc: 'LINEで事前相談OK' },
                { emoji: '🗣️', title: '日本語スタッフ', desc: '全工程日本語対応' },
                { emoji: '✈️', title: '送迎サービス', desc: '空港〜クリニック' },
                { emoji: '🩺', title: '術後フォロー', desc: '3ヶ月間のアフターケア' },
              ].map((item, i) => (
                <div key={i} className="bg-white/20 rounded-2xl p-5">
                  <span className="text-3xl">{item.emoji}</span>
                  <p className="font-bold mt-3 text-sm">{item.title}</p>
                  <p className="text-rose-100 text-xs mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-16 px-4 bg-stone-50">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-stone-800 mb-2">よくある質問</h2>
            <p className="text-center text-stone-500 text-sm mb-10">解決しない場合はLINEでお気軽にどうぞ</p>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left">
                    <span className="font-medium text-stone-800 text-sm pr-4">Q. {f.q}</span>
                    <span className="text-rose-400 text-xl flex-shrink-0">{openFaq === i ? '−' : '+'}</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-sm text-stone-600 leading-relaxed border-t border-stone-50 pt-3">
                      A. {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* メインCTA */}
        <section className="py-20 px-4 bg-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-3">まずは無料相談から</h2>
          <p className="text-stone-500 mb-8 text-sm">LINEで気軽にメッセージください。日本語で丁寧にお答えします。</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`https://line.me/R/ti/p/${hospital.lineId}`}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-full font-bold text-lg transition-colors shadow-lg">
              💬 LINEで相談する（無料）
            </a>
            <a href={`https://instagram.com/${hospital.instagramId}`}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-lg">
              📸 Instagramをフォロー
            </a>
          </div>
        </section>

        {/* フッター */}
        <footer className="bg-stone-900 text-stone-400 py-12 px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-white font-bold text-lg mb-2">{hospital.nameJa}</p>
              <p className="text-sm">{hospital.nameKr}</p>
              <p className="text-sm mt-3">{hospital.address}</p>
              <p className="text-sm">診療時間: {hospital.hours}</p>
              <p className="text-sm">TEL: {hospital.phone}</p>
            </div>
            <div>
              <p className="text-white font-medium mb-3">施術メニュー</p>
              <ul className="space-y-1 text-sm">
                {['目元・二重整形','鼻整形','輪郭手術','スキンケア・レーザー'].map(m => (
                  <li key={m}><a href="#treatments" className="hover:text-white transition-colors">{m}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white font-medium mb-3">お問い合わせ</p>
              <ul className="space-y-2 text-sm">
                <li><a href={`https://line.me/R/ti/p/${hospital.lineId}`} className="hover:text-emerald-400 transition-colors">💬 LINE: {hospital.lineId}</a></li>
                <li><a href={`https://instagram.com/${hospital.instagramId}`} className="hover:text-pink-400 transition-colors">📸 Instagram: {hospital.instagramId}</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-4xl mx-auto border-t border-stone-700 mt-8 pt-6 text-center text-xs text-stone-600">
            <p>© {new Date().getFullYear()} {hospital.nameJa} All rights reserved.</p>
            <p className="mt-1">個人情報保護方針 | 免責事項 | 特定商取引法に基づく表記</p>
          </div>
        </footer>
      </main>

      {/* 固定LINEボタン */}
      <a href={`https://line.me/R/ti/p/${hospital.lineId}`}
        className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-5 py-3 shadow-xl font-medium text-sm transition-all hover:scale-105 flex items-center gap-2">
        <span className="text-lg">💬</span>
        <span>LINEで相談</span>
      </a>
    </>
  )
}
