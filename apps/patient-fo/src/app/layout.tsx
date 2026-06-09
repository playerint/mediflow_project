import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'オーレ整形外科 | 日本人患者専門 韓国ソウル美容外科',
  description:
    '韓国ソウル江南の美容外科クリニック。日本語スタッフ常駐、無料カウンセリング実施中。二重整形・鼻整形・輪郭手術など。LINEで気軽にご相談ください。',
  keywords: '韓国整形外科, 二重整形, 鼻整形, ソウル美容外科, 日本語対応, 韓国美容整形',
  openGraph: {
    title: 'オーレ整形外科 | 日本人患者専門 韓国美容外科',
    description: '日本語スタッフ常駐・無料カウンセリング・LINEで相談OK',
    locale: 'ja_JP',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="font-[var(--font-noto)] bg-stone-50 text-stone-900">
        {children}
      </body>
    </html>
  )
}
