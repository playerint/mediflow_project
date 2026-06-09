// 환자용 사이트 목업 데이터
// 나중에 이 파일만 실제 API 호출로 교체하면 됩니다

export const hospital = {
  nameJa: 'オーレ整形外科',
  nameKr: '올래성형외과',
  tagline: '「変わったね」ではなく「綺麗になったね」と言われる手術を',
  taglineSub: '自然な美しさを追求する、韓国ソウルの美容外科クリニック',
  phone: '+82-2-1234-5678',
  address: 'ソウル市江南区論峴洞 123',
  hours: '月〜土 9:00–18:00',
  lineId: '@olle_clinic',
  instagramId: '@olle_clinic_jp',
  stats: [
    { value: '28,000+', label: '症例数' },
    { value: '月150+', label: '日本人患者数' },
    { value: '4.8 / 5', label: '患者満足度' },
    { value: '15年', label: 'クリニック歴' },
  ],
}

export const doctors = [
  {
    id: 1,
    nameJa: 'キム・ジフン 院長',
    specialty: '目元・埋没法',
    experience: '美容外科専門医 15年',
    philosophy: '患者一人ひとりの顔立ちに合わせた、自然で美しい仕上がりを追求します。',
    gradient: 'from-rose-100 to-pink-200',
  },
  {
    id: 2,
    nameJa: 'イ・スヨン 副院長',
    specialty: '鼻整形・輪郭手術',
    experience: '形成外科専門医 12年',
    philosophy: '骨格から考える立体的な美しさで、韓国人・日本人それぞれの美を引き出します。',
    gradient: 'from-indigo-100 to-purple-200',
  },
  {
    id: 3,
    nameJa: 'パク・ミン 医師',
    specialty: '皮膚科・レーザー治療',
    experience: '皮膚科専門医 8年',
    philosophy: '肌本来の美しさを最大限に引き出すため、最新レーザー技術を取り入れています。',
    gradient: 'from-emerald-100 to-teal-200',
  },
]

export const treatments = [
  { id: 1, nameJa: '二重整形（埋没法）', duration: '30分', category: '目元', emoji: '👁️' },
  { id: 2, nameJa: '二重整形（切開法）', duration: '60分', category: '目元', emoji: '👁️' },
  { id: 3, nameJa: '鼻整形（プロテーゼ）', duration: '90分', category: '鼻', emoji: '👃' },
  { id: 4, nameJa: 'エラボトックス', duration: '15分', category: '輪郭', emoji: '💉' },
  { id: 5, nameJa: '脂肪吸引', duration: '120分', category: 'ボディ', emoji: '✨' },
  { id: 6, nameJa: '目頭切開', duration: '45分', category: '目元', emoji: '👁️' },
  { id: 7, nameJa: 'ヒアルロン酸注入', duration: '20分', category: 'スキン', emoji: '💧' },
  { id: 8, nameJa: 'フェイスリフト', duration: '180分', category: '輪郭', emoji: '✨' },
  { id: 9, nameJa: 'レーザートーニング', duration: '30分', category: 'スキン', emoji: '💫' },
]

export const cases = [
  { id: '001', type: '二重整形（埋没法）', patient: '28歳・東京', doctor: 'キム院長' },
  { id: '002', type: '鼻整形（プロテーゼ）', patient: '25歳・大阪', doctor: 'イ副院長' },
  { id: '003', type: 'エラボトックス', patient: '32歳・名古屋', doctor: 'パク医師' },
  { id: '004', type: '目頭切開＋埋没法', patient: '23歳・福岡', doctor: 'キム院長' },
  { id: '005', type: 'ヒアルロン酸注入', patient: '35歳・札幌', doctor: 'パク医師' },
  { id: '006', type: 'フェイスリフト', patient: '42歳・東京', doctor: 'イ副院長' },
]

export const reviews = [
  {
    id: 1,
    name: 'さくら（28歳・東京）',
    treatment: '二重整形',
    text: '日本語対応のスタッフがいて安心でした。術後のケアも丁寧で、自然な仕上がりに大満足です！',
    rating: 5,
  },
  {
    id: 2,
    name: 'はな（25歳・大阪）',
    treatment: '鼻整形',
    text: 'LINEで相談してから来院しました。先生が丁寧に説明してくださり、不安なく手術を受けられました。',
    rating: 5,
  },
  {
    id: 3,
    name: 'みか（32歳・名古屋）',
    treatment: 'エラボトックス',
    text: '日帰り施術で痛みも少なく、1週間後には効果を実感。リピートしています！',
    rating: 5,
  },
]

export const faqs = [
  {
    q: '日本語でのサポートはありますか？',
    a: 'はい、日本語対応スタッフが常駐しており、カウンセリングから術後フォローまで日本語でご対応します。LINEでの事前相談も日本語でOKです。',
  },
  {
    q: '韓国の美容外科は日本より費用が安いですか？',
    a: '同レベルの技術・設備で比較した場合、一般的に日本より30〜50%程度お得になるケースが多いです。例えば埋没法は40〜80万ウォン（約4〜8万円）程度です。',
  },
  {
    q: '手術後、いつ日本に帰国できますか？',
    a: '施術内容によりますが、埋没法など軽微な施術は翌日帰国も可能です。切開を伴う手術は術後3〜5日の経過観察をおすすめします。',
  },
  {
    q: '医師の資格・安全性について教えてください。',
    a: '当クリニックの医師は全員、韓国専門医資格を取得した経験豊富な専門医です。清潔・安全な医療環境で施術を行います。',
  },
  {
    q: 'カウンセリングは無料ですか？',
    a: 'はい、初回カウンセリングは無料です（15分）。LINEやZoomでのオンライン相談も承っております。',
  },
  {
    q: 'クレジットカードは使えますか？',
    a: 'VISA・Mastercard・JCBをご利用いただけます。日本円での概算見積もりもご提供可能です。',
  },
  {
    q: '空港からのアクセスはどうすればよいですか？',
    a: '仁川空港から江南まで空港バスまたはタクシーで約60〜90分です。ご希望の方には提携送迎サービス（有料）もご案内しています。',
  },
]
