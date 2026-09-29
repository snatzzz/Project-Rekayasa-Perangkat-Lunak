export interface RecommendationRule {
  id: string
  name: string
  keywords: string[]
  recommendations: string[]
  urgency: 'TINGGI' | 'SEDANG' | 'STANDAR'
}

const RULES: RecommendationRule[] = [
  {
    id: 'hard_start',
    name: 'Motor Susah Dinyalakan / Starter Berat',
    keywords: ['nyala', 'starter', 'start', 'hidup', 'mati', 'mogok', 'engkol', 'aki'],
    recommendations: [
      'Periksa tegangan dan kondisi aki (accu), terutama bila klakson atau lampu redup.',
      'Periksa kebersihan, celah elektroda, dan api pada busi motor.',
      'Periksa kelancaran aliran bahan bakar dan suara dengung fuel pump saat kunci kontak ON.',
      'Periksa saklar standar samping (side stand switch) dan tombol cut-off engine.',
    ],
    urgency: 'TINGGI',
  },
  {
    id: 'vibration',
    name: 'Motor Bergetar / Gredek di Kecepatan Rendah',
    keywords: ['getar', 'gredek', 'gemetar', 'vibrasi', 'goyang'],
    recommendations: [
      'Bersihkan mangkok kopling CVT dan kampas ganda dari debu/kotoran sisa gesekan.',
      'Periksa keausan dan kebulatan roller CVT pada pulley depan.',
      'Periksa kondisi bearing (laher) as roda depan dan belakang.',
      'Cek keausan permukaan tapak ban luar apakah rata atau bergelombang.',
    ],
    urgency: 'SEDANG',
  },
  {
    id: 'brake_issue',
    name: 'Rem Kurang Pakem / Berdecit',
    keywords: ['rem', 'pakem', 'decit', 'blong', 'kampas', 'cakram', 'pengereman'],
    recommendations: [
      'Periksa ketebalan kampas rem (brake pads/shoes), ganti segera jika sudah tipis.',
      'Periksa piringan cakram (rotor) dari keausan bergelombang atau kontaminasi oli.',
      'Periksa level dan kejernihan cairan minyak rem pada master rem (kaca intip).',
      'Bersihkan kaliper dan piston rem dari tumpukan debu jalanan.',
    ],
    urgency: 'TINGGI',
  },
  {
    id: 'heavy_pull',
    name: 'Tarikan Berat / Tenaga Ngempos',
    keywords: ['berat', 'loyo', 'ngempos', 'lelet', 'tenaga', 'tarikan', 'tarik'],
    recommendations: [
      'Pastikan tekanan angin ban depan dan belakang sesuai standar pabrikan (tidak kempes).',
      'Periksa dan bersihkan atau ganti saringan udara (filter udara mesin).',
      'Periksa kondisi v-belt CVT dari keretakan atau mulur pada motor matik.',
      'Cek kondisi dan kekentalan oli mesin; oli yang terlalu lama atau kental menghambat putaran kruk as.',
    ],
    urgency: 'SEDANG',
  },
  {
    id: 'engine_noise',
    name: 'Suara Mesin Kasar / Berisik / Ngelitik',
    keywords: ['kasar', 'berisik', 'ngelitik', 'bunyi', 'klotok', 'gemeretak'],
    recommendations: [
      'Segera periksa volume oli mesin dengan dipstick, jangan jalankan mesin jika oli kering!',
      'Periksa setelan celah klep mesin (valve clearance) yang mungkin longgar.',
      'Periksa kekencangan rantai keteng (timing chain) dan lifter tensioner.',
      'Untuk motor matik, periksa juga level dan kondisi oli gardan (gear oil).',
    ],
    urgency: 'TINGGI',
  },
  {
    id: 'unstable_steering',
    name: 'Stang Kemudi Oleng / Tidak Stabil',
    keywords: ['oleng', 'stabil', 'stang', 'setang', 'kemudi', 'komstir'],
    recommendations: [
      'Periksa setelan bearing leher komstir (steering head bearing) dari kekendoran atau aus.',
      'Periksa suspensi (shockbreaker) depan dan belakang apakah ada kebocoran oli seal.',
      'Pastikan tekanan angin ban depan dan belakang seimbang.',
      'Periksa kondisi bearing roda dan pastikan velg tidak peyang atau oleng.',
    ],
    urgency: 'TINGGI',
  },
  {
    id: 'overheating',
    name: 'Mesin Cepat Panas / Indikator Overheat Menyala',
    keywords: ['panas', 'overheat', 'mendidih', 'radiator', 'coolant'],
    recommendations: [
      'Periksa level cairan pendingin (radiator coolant) di tangki reservoir saat mesin dingin.',
      'Periksa kebersihan kisi-kisi radiator dari lumpur atau kotoran yang menutupi sirip pendingin.',
      'Pastikan kipas pendingin radiator berputar otomatis ketika temperatur naik.',
      'Periksa kebocoran sambungan selang radiator dan kondisi sirkulasi oli mesin.',
    ],
    urgency: 'TINGGI',
  },
]

export interface RecommendationResponse {
  isRecognized: boolean
  matchedTopic: string | null
  urgency: 'TINGGI' | 'SEDANG' | 'STANDAR' | null
  recommendations: string[]
  disclaimer: string
}

export function getRecommendations(complaint: string): RecommendationResponse {
  const normalized = complaint.toLowerCase()

  for (const rule of RULES) {
    const isMatched = rule.keywords.some((keyword) => normalized.includes(keyword))
    if (isMatched) {
      return {
        isRecognized: true,
        matchedTopic: rule.name,
        urgency: rule.urgency,
        recommendations: rule.recommendations,
        disclaimer: 'Rekomendasi ini bersifat umum dan awal berbasis rule-based, bukan diagnosis teknis pasti dari bengkel profesional.',
      }
    }
  }

  return {
    isRecognized: false,
    matchedTopic: null,
    urgency: null,
    recommendations: [
      'Keluhan belum dapat dikenali secara spesifik oleh sistem rule-based.',
      'Disarankan untuk melakukan pemeriksaan fisik langsung bersama teknisi bengkel terpercaya.',
    ],
    disclaimer: 'Rekomendasi ini bersifat umum dan awal berbasis rule-based, bukan diagnosis teknis pasti dari bengkel profesional.',
  }
}
