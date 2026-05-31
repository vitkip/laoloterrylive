// ─────────────────────────────────────────────────────────────────────────────
// SHARED ANALYTICS ENGINE
// Used by AnalyticsPage + HomePage
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Core analytics computation.
 * @param {Array}  draws  Newest-first sorted draws from DataContext
 * @param {string} range  Number of draws to analyse, or 'all'
 */
export function computeAnalytics(draws, range) {
  if (!draws?.length) return null
  const n = range === 'all' ? draws.length : Math.min(parseInt(range), draws.length)
  const sliced = draws.slice(0, n)
  const chrono = [...sliced].reverse()

  // Initialize frequency + last-seen maps
  const freq = {}
  const lastAt = {}
  for (let i = 0; i < 100; i++) {
    const k = i.toString().padStart(2, '0')
    freq[k] = 0
    lastAt[k] = -1
  }

  // Single pass: freq + lastAt + raw time-series
  const seriesRaw = chrono.map((d, idx) => {
    const v = d.results_detail?.find(r => r.prize_type === '2_digits')?.result_value
    if (v !== undefined && freq[v] !== undefined) {
      freq[v]++
      lastAt[v] = idx
    }
    return { idx, date: d.draw_date, drawNum: d.draw_number, v }
  })

  // Recent hit maps (O(N) each)
  const r10Map = {}; const r30Map = {}
  for (let i = 0; i < 100; i++) {
    const k = i.toString().padStart(2, '0'); r10Map[k] = 0; r30Map[k] = 0
  }
  chrono.slice(-10).forEach(d => {
    const v = d.results_detail?.find(r => r.prize_type === '2_digits')?.result_value
    if (v && r10Map[v] !== undefined) r10Map[v]++
  })
  chrono.slice(-30).forEach(d => {
    const v = d.results_detail?.find(r => r.prize_type === '2_digits')?.result_value
    if (v && r30Map[v] !== undefined) r30Map[v]++
  })

  const maxFreq = Math.max(...Object.values(freq), 1)
  const minFreq = Math.min(...Object.values(freq), 0)

  const scores = Object.keys(freq).map(num => {
    const f = freq[num]
    const lastIdx = lastAt[num]
    const gap = lastIdx === -1 ? n : n - 1 - lastIdx
    const avgGap = f > 0 ? n / f : n
    const overdue = gap / Math.max(avgGap, 1)
    const r10 = r10Map[num]
    const r30 = r30Map[num]
    const recentRate = r10 / Math.max(Math.min(10, chrono.length), 1)
    const baseRate   = r30 / Math.max(Math.min(30, chrono.length), 1)
    const momentum   = +(recentRate - baseRate).toFixed(3)
    const heatIntensity = maxFreq > minFreq ? (f - minFreq) / (maxFreq - minFreq) : 0.5

    // Composite AI score 0–100
    const freqScore     = (f / maxFreq) * 35
    const gapScore      = Math.min(overdue / 3, 1) * 35
    const momentumScore = Math.max(Math.min((momentum + 0.1) / 0.2, 1), 0) * 30
    const aiScore       = +Math.min(freqScore + gapScore + momentumScore, 100).toFixed(1)

    // Decision Score: 0–3 boolean signals
    const sig1 = overdue >= 1.0 ? 1 : 0   // ຊ້ານານກວ່າສະເລ່ຍ
    const sig2 = momentum > 0 ? 1 : 0      // momentum ຂຶ້ນ
    const sig3 = aiScore >= 60 ? 1 : 0     // AI score ສູງ
    const decisionScore = sig1 + sig2 + sig3

    return {
      num, freq: f, gap, avgGap: Math.round(avgGap), overdue: +overdue.toFixed(2),
      pct: +((f / Math.max(n, 1)) * 100).toFixed(1), r10, r30, momentum, aiScore,
      heatIntensity, decisionScore, sig1, sig2, sig3,
    }
  })

  const series = seriesRaw.filter(d => d.v).slice(-50).map((d, i) => ({
    x: i + 1, date: d.date?.slice(5), drawNum: d.drawNum,
    val: parseInt(d.v), label: d.v,
  }))

  const freqBars = [...scores].sort((a, b) => b.freq - a.freq).slice(0, 20)
    .map(s => ({ num: s.num, freq: s.freq }))

  return {
    n, freq, scores, series, freqBars, maxFreq, minFreq,
    hot:         [...scores].sort((a, b) => b.freq - a.freq).slice(0, 10),
    cold:        [...scores].sort((a, b) => b.gap  - a.gap ).slice(0, 10),
    aiTop:       [...scores].sort((a, b) => b.aiScore - a.aiScore).slice(0, 10),
    rising:      [...scores].filter(s => s.momentum > 0).sort((a, b) => b.momentum - a.momentum).slice(0, 8),
    falling:     [...scores].filter(s => s.momentum < 0).sort((a, b) => a.momentum - b.momentum).slice(0, 8),
    overdue:     [...scores].filter(s => s.overdue >= 1.0).sort((a, b) => b.overdue - a.overdue).slice(0, 12),
    decisionTop: [...scores].filter(s => s.decisionScore > 0)
                            .sort((a, b) => b.decisionScore - a.decisionScore || b.aiScore - a.aiScore)
                            .slice(0, 20),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED PROBABILITY ENGINE  (4 independent signals × 25 pts = 100 pts max)
//
// Logic:  Previously aiW was included alongside freqW/overdueW/momentumW which
//         caused triple-counting since aiScore = f(freq, gap, momentum).
//         Fix: drop aiW, keep 4 orthogonal signals.
//
//   freqW     (25) — how often the number has appeared (raw frequency)
//   overdueW  (25) — how overdue it is relative to its own average gap
//   momentumW (25) — whether it is trending upward (positive only)
//   decisionW (25) — how many of the 3 boolean signals it has triggered
// ─────────────────────────────────────────────────────────────────────────────

export function computeCombinedTop10(analytics) {
  if (!analytics) return []
  const { scores } = analytics
  const maxFreq = Math.max(...scores.map(s => s.freq), 1)
  const maxMom  = Math.max(...scores.filter(s => s.momentum > 0).map(s => s.momentum), 0.001)

  const ranked = scores.map(s => {
    const freqW     = (s.freq / maxFreq) * 25
    const overdueW  = Math.min(s.overdue / 3, 1) * 25
    const momentumW = s.momentum > 0 ? (s.momentum / maxMom) * 25 : 0
    const decisionW = (s.decisionScore / 3) * 25
    const combined  = +(freqW + overdueW + momentumW + decisionW).toFixed(1)
    return {
      ...s,
      combined,
      freqW:     +freqW.toFixed(1),
      overdueW:  +overdueW.toFixed(1),
      momentumW: +momentumW.toFixed(1),
      decisionW: +decisionW.toFixed(1),
    }
  }).sort((a, b) => b.combined - a.combined)

  const maxCombined = ranked[0]?.combined ?? 1
  return ranked.slice(0, 10).map(s => ({
    ...s,
    probability: +(s.combined / maxCombined * 100).toFixed(1),
  }))
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL DISPLAY METADATA  (used by AnalyticsPage NewsPanel + HomeNewsSection)
// ─────────────────────────────────────────────────────────────────────────────

export const COMBINED_SIGNALS = [
  { key: 'freqW',     label: 'ຄວາມຖີ່',  color: '#ef4444', max: 25, icon: 'equalizer'    },
  { key: 'overdueW',  label: 'ຊ້ານານ',   color: '#fbbf24', max: 25, icon: 'hourglass_top' },
  { key: 'momentumW', label: 'Momentum', color: '#6cf8bb', max: 25, icon: 'trending_up'   },
  { key: 'decisionW', label: 'ສັນຍານ★',  color: '#f97316', max: 25, icon: 'stars'         },
]

// ─────────────────────────────────────────────────────────────────────────────
// DATE FORMATTER (Lao)
// ─────────────────────────────────────────────────────────────────────────────

export function LDATE(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const M = ['ມັງກອນ','ກຸມພາ','ມີນາ','ເມສາ','ພຶດສະພາ','ມິຖຸນາ',
             'ກໍລະກົດ','ສິງຫາ','ກັນຍາ','ຕຸລາ','ພະຈິກ','ທັນວາ']
  return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTO NEWS ARTICLE BUILDER
// ─────────────────────────────────────────────────────────────────────────────

export function buildArticle(top10, analytics, latestDraw, n, selectedTypeName) {
  if (!top10.length || !analytics) return ''
  const { hot, cold, rising, overdue: overdueList, aiTop, decisionTop } = analytics
  const dateStr  = LDATE(latestDraw?.draw_date) || LDATE(new Date().toISOString())
  const drawNum  = latestDraw?.draw_number ?? '?'
  const typePart = selectedTypeName ? ` (${selectedTypeName})` : ''

  const rankFull = top10.map((s, i) =>
    `  ${i + 1}. ເລກ ${s.num} — ຄວາມໜ້າຈະເປັນລວມ ${s.probability}%` +
    ` (Overdue ${s.overdue}× · Momentum ${s.momentum > 0 ? '↑' : '↓'} · ★${s.decisionScore})`
  ).join('\n')

  const star3    = decisionTop.filter(s => s.decisionScore === 3).slice(0, 3).map(s => s.num)
  const hotTop   = hot.slice(0, 5).map(s => `${s.num}(${s.freq}ຄ)`)
  const coldTop  = cold.slice(0, 5).map(s => `${s.num}(${s.gap}ງ)`)
  const risingTop  = rising.slice(0, 5).map(s => s.num)
  const overdueTop = overdueList.slice(0, 5).map(s => `${s.num}(${s.overdue}×)`)

  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📰 ວິເຄາະຫວຍລາວ — ເລກເດັ່ນງວດນີ້${typePart}
📅 ວັນທີ: ${dateStr}  |  ງວດ: #${drawNum}  |  ວິເຄາະ ${n} ງວດ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 ລະບົບ AI ໄດ້ວິເຄາະສະຖິຕິ ${n} ງວດ ໂດຍລວມ 4 ດ້ານ
(ຄວາມຖີ່ · ຊ້ານານ · Momentum · ສັນຍານ Decision)
ຜ່ານ Algorithm Weighted Composite — ໄດ້ 10 ຕົວເລກເດັ່ນ ດັ່ງນີ້:

▶ TOP 10 ເລກລວມຄວາມໜ້າຈະເປັນສູງສຸດ
${rankFull}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 ບົດວິເຄາະສະຖິຕິ ແຕ່ລະດ້ານ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 ເລກ HOT (ອອກຫຼາຍສຸດ):
   ${hotTop.join(' · ')}

🧊 ເລກ COLD (ຊ້ານານທີ່ສຸດ):
   ${coldTop.join(' · ')}

📈 ເລກ RISING (ກຳລັງຂຶ້ນ Momentum):
   ${risingTop.length ? risingTop.join(' · ') : 'ບໍ່ມີ'}

⏳ ເລກ OVERDUE (ເກີນຄ່າສະເລ່ຍ):
   ${overdueTop.join(' · ')}

🌟 AI TOP 5 (Composite Score):
   ${aiTop.slice(0, 5).map(s => `${s.num}[${s.aiScore}pts]`).join(' · ')}

⭐ ສັນຍານຄົບ 3 (★★★ Decision Score):
   ${star3.length ? star3.join(', ') : 'ບໍ່ມີງວດນີ້'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 ສະຫຼຸບ ເລກ 10 ໂຕເດັ່ນ:
   ${top10.map(s => s.num).join(' · ')}

⚠️  ຄຳເຕືອນ: ຫວຍລາວເປັນການສຸ່ມ — ຂໍ້ມູນນີ້ເປັນພຽງການວິເຄາະທາງສະຖິຕິ
     ບໍ່ຮັບປະກັນຜົນລາງວັນ — ຫ້າມລົງທຶນເກີນຄວາມສາມາດ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📲 laolots.com — ຂໍ້ມູນຫວຍລາວ ຄົບຖ້ວນທີ່ສຸດ`
}
