import { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import SEO from '../components/SEO'
import { webPageSchema, breadcrumbSchema } from '../components/schemas'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'

// ─────────────────────────────────────────────────────────────────────────────
// COMPUTATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function computeAnalytics(draws, range) {
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

  // Single pass: build freq + lastAt + raw series
  const seriesRaw = chrono.map((d, idx) => {
    const v = d.results_detail?.find(r => r.prize_type === '2_digits')?.result_value
    if (v !== undefined && freq[v] !== undefined) {
      freq[v]++
      lastAt[v] = idx
    }
    return { idx, date: d.draw_date, drawNum: d.draw_number, v }
  })

  // Precompute recent hit maps (O(N) each instead of O(100*N))
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

  // Score each number
  const scores = Object.keys(freq).map(num => {
    const f = freq[num]
    const lastIdx = lastAt[num]
    const gap = lastIdx === -1 ? n : n - 1 - lastIdx
    const avgGap = f > 0 ? n / f : n
    const overdue = gap / Math.max(avgGap, 1)
    const r10 = r10Map[num]
    const r30 = r30Map[num]
    const recentRate = r10 / Math.max(Math.min(10, chrono.length), 1)
    const baseRate  = r30 / Math.max(Math.min(30, chrono.length), 1)
    const momentum  = +(recentRate - baseRate).toFixed(3)
    const heatIntensity = maxFreq > minFreq ? (f - minFreq) / (maxFreq - minFreq) : 0.5

    // Composite AI score 0–100
    const freqScore     = (f / maxFreq) * 35
    const gapScore      = Math.min(overdue / 3, 1) * 35
    const momentumScore = Math.max(Math.min((momentum + 0.1) / 0.2, 1), 0) * 30
    const aiScore       = +Math.min(freqScore + gapScore + momentumScore, 100).toFixed(1)

    // Decision Score: 0–3 signals passed
    const sig1 = overdue >= 1.0 ? 1 : 0   // ຊ້ານານກວ່າສະເລ່ຍ
    const sig2 = momentum > 0 ? 1 : 0      // momentum ຂຶ້ນ
    const sig3 = aiScore >= 60 ? 1 : 0     // AI score ສູງ
    const decisionScore = sig1 + sig2 + sig3

    return { num, freq: f, gap, avgGap: Math.round(avgGap), overdue: +overdue.toFixed(2),
             pct: +((f / Math.max(n, 1)) * 100).toFixed(1), r10, r30, momentum, aiScore, heatIntensity,
             decisionScore, sig1, sig2, sig3 }
  })

  // Time-series (last 50, newest-first → reverse for chart)
  const series = seriesRaw.filter(d => d.v).slice(-50).map((d, i) => ({
    x: i + 1, date: d.date?.slice(5), drawNum: d.drawNum,
    val: parseInt(d.v), label: d.v,
  }))

  // Top-20 frequency bar chart data
  const freqBars = [...scores].sort((a, b) => b.freq - a.freq).slice(0, 20)
    .map(s => ({ num: s.num, freq: s.freq }))

  return {
    n, freq, scores, series, freqBars, maxFreq, minFreq,
    hot:     [...scores].sort((a, b) => b.freq - a.freq).slice(0, 10),
    cold:    [...scores].sort((a, b) => b.gap  - a.gap).slice(0, 10),
    aiTop:   [...scores].sort((a, b) => b.aiScore - a.aiScore).slice(0, 10),
    rising:  [...scores].filter(s => s.momentum > 0).sort((a, b) => b.momentum - a.momentum).slice(0, 8),
    falling: [...scores].filter(s => s.momentum < 0).sort((a, b) => a.momentum - b.momentum).slice(0, 8),
    overdue:     [...scores].filter(s => s.overdue >= 1.0).sort((a, b) => b.overdue - a.overdue).slice(0, 12),
    decisionTop: [...scores].filter(s => s.decisionScore > 0)
                            .sort((a, b) => b.decisionScore - a.decisionScore || b.aiScore - a.aiScore)
                            .slice(0, 20),
  }
}

function computeAIBacktest(draws, trials) {
  if (!draws?.length || draws.length < trials + 5) return null
  const results = []
  for (let i = 0; i < trials; i++) {
    const draw = draws[i]
    const actual = draw?.results_detail?.find(r => r.prize_type === '2_digits')?.result_value
    if (!actual) continue
    const training = draws.slice(i + 1)
    if (training.length < 5) continue
    const analytics = computeAnalytics(training, 'all')
    if (!analytics) continue
    const top10 = analytics.aiTop.slice(0, 10).map(s => s.num)
    const top5  = top10.slice(0, 5)
    const top1  = top10[0]
    results.push({
      drawNum: draw.draw_number,
      date: draw.draw_date,
      predicted: top1,
      top10,
      actual,
      hit1:  top1 === actual,
      hit5:  top5.includes(actual),
      hit10: top10.includes(actual),
      aiScore: analytics.aiTop[0]?.aiScore,
    })
  }
  const t = results.length
  return {
    results,
    trials: t,
    hits1:  results.filter(r => r.hit1).length,
    hits5:  results.filter(r => r.hit5).length,
    hits10: results.filter(r => r.hit10).length,
  }
}

function computeDecisionBacktest(draws, trials = 21) {
  if (!draws?.length || draws.length < trials + 5) return null
  const results = []
  for (let i = 0; i < trials; i++) {
    const draw = draws[i]
    const actual = draw?.results_detail?.find(r => r.prize_type === '2_digits')?.result_value
    if (!actual) continue
    const training = draws.slice(i + 1)
    if (training.length < 5) continue
    const analytics = computeAnalytics(training, 'all')
    if (!analytics) continue

    const { scores } = analytics
    // Build all decision-scored numbers sorted by tier desc then aiScore desc, cap at 21
    const all21 = [...scores]
      .filter(s => s.decisionScore > 0)
      .sort((a, b) => b.decisionScore - a.decisionScore || b.aiScore - a.aiScore)
      .slice(0, 21)
      .map(s => ({ num: s.num, tier: s.decisionScore }))
    const star3 = all21.filter(x => x.tier === 3).map(x => x.num)
    const star2 = all21.filter(x => x.tier === 2).map(x => x.num)
    const star1 = all21.filter(x => x.tier === 1).map(x => x.num)
    const hitStar3 = star3.includes(actual)
    const hitStar2 = star2.includes(actual)
    const hitStar1 = star1.includes(actual)
    const actualScore = scores.find(s => s.num === actual)
    results.push({
      drawNum: draw.draw_number,
      date: draw.draw_date,
      actual,
      all21,
      star3,
      star2,
      star1,
      hitStar3,
      hitStar2,
      hitStar1,
      hitAny: hitStar3 || hitStar2 || hitStar1,
      actualDecisionScore: actualScore?.decisionScore ?? 0,
      actualAiScore: actualScore?.aiScore ?? 0,
    })
  }
  const t = results.length
  return {
    results,
    trials: t,
    hitsStar3: results.filter(r => r.hitStar3).length,
    hitsStar2: results.filter(r => r.hitStar2).length,
    hitsStar1: results.filter(r => r.hitStar1).length,
    hitsAny:   results.filter(r => r.hitAny).length,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED PROBABILITY ENGINE
// Combines: Frequency · Overdue · Momentum · AI Score · Decision Score
// Each signal contributes 20 pts → total max 100
// ─────────────────────────────────────────────────────────────────────────────

function computeCombinedTop10(analytics) {
  if (!analytics) return []
  const { scores } = analytics
  const maxFreq = Math.max(...scores.map(s => s.freq), 1)
  const maxMom  = Math.max(...scores.filter(s => s.momentum > 0).map(s => s.momentum), 0.001)

  const ranked = scores.map(s => {
    const freqW     = (s.freq / maxFreq) * 20
    const overdueW  = Math.min(s.overdue / 3, 1) * 20
    const momentumW = s.momentum > 0 ? (s.momentum / maxMom) * 20 : 0
    const aiW       = (s.aiScore / 100) * 20
    const decisionW = (s.decisionScore / 3) * 20
    const combined  = +(freqW + overdueW + momentumW + aiW + decisionW).toFixed(1)
    return {
      ...s,
      combined,
      freqW:     +freqW.toFixed(1),
      overdueW:  +overdueW.toFixed(1),
      momentumW: +momentumW.toFixed(1),
      aiW:       +aiW.toFixed(1),
      decisionW: +decisionW.toFixed(1),
    }
  }).sort((a, b) => b.combined - a.combined)

  const maxCombined = ranked[0]?.combined ?? 1
  return ranked.slice(0, 10).map(s => ({
    ...s,
    probability: +(s.combined / maxCombined * 100).toFixed(1),
  }))
}

function computeBacktest(draws, range, targetNum) {
  if (!targetNum || !draws?.length) return null
  const n = range === 'all' ? draws.length : Math.min(parseInt(range), draws.length)
  const chrono = [...draws.slice(0, n)].reverse()
  const hits = []
  chrono.forEach((d, idx) => {
    const v = d.results_detail?.find(r => r.prize_type === '2_digits')?.result_value
    if (v === targetNum) hits.push({ idx, date: d.draw_date, drawNum: d.draw_number })
  })
  const gaps = []
  for (let i = 1; i < hits.length; i++) gaps.push(hits[i].idx - hits[i - 1].idx)
  const lastHitAgo = hits.length ? n - 1 - hits[hits.length - 1].idx : n
  const avgGap  = gaps.length ? +(gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(1) : n
  const maxGap  = gaps.length ? Math.max(...gaps) : n
  const hitRate = +((hits.length / n) * 100).toFixed(1)
  const timeline = chrono.slice(-50).map((d, i) => {
    const v = d.results_detail?.find(r => r.prize_type === '2_digits')?.result_value
    return { x: i + 1, hit: v === targetNum ? 1 : 0, date: d.draw_date?.slice(5) }
  })
  return { hits, hitRate, n, avgGap, maxGap, lastHitAgo, timeline }
}

// ─────────────────────────────────────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function heatBg(t) {
  if (t < 0.15) return 'rgba(51,65,85,0.55)'
  if (t < 0.35) return 'rgba(37,99,235,0.50)'
  if (t < 0.55) return 'rgba(234,179,8,0.55)'
  if (t < 0.75) return 'rgba(249,115,22,0.65)'
  return 'rgba(239,68,68,0.80)'
}

const RANGE_OPTIONS = [
  { value: '10',  label: '10' },
  { value: '30',  label: '30' },
  { value: '50',  label: '50' },
  { value: '100', label: '100' },
  { value: 'all', label: 'ທັງໝົດ' },
]

const MODES = [
  { value: 'heatmap',  label: 'Heatmap',    icon: 'grid_view' },
  { value: 'charts',   label: 'Charts',     icon: 'show_chart' },
  { value: 'trend',    label: 'Trend',      icon: 'trending_up' },
  { value: 'ai',       label: 'AI Engine',  icon: 'psychology' },
  { value: 'decision',   label: 'ຕັດສິນໃຈ',  icon: 'stars' },
  { value: 'news',       label: 'ຂ່າວ AI',    icon: 'newspaper' },
  { value: 'dsbacktest', label: 'DS Backtest', icon: 'verified' },
  { value: 'backtest',   label: 'Backtest',    icon: 'science' },
]

// ─────────────────────────────────────────────────────────────────────────────
// CHART TOOLTIPS
// ─────────────────────────────────────────────────────────────────────────────

function ChartTip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-zinc-950/90 backdrop-blur-xl border border-white/[0.10] rounded-xl px-4 py-2.5 shadow-xl text-xs pointer-events-none">
      <p className="text-violet-300 font-bold mb-0.5">ງວດ #{d.drawNum}</p>
      <p className="text-white font-black text-xl font-mono">{d.label}</p>
      <p className="text-white/50">{d.date}</p>
    </div>
  )
}

function FreqTip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-zinc-950/90 backdrop-blur-xl border border-white/[0.10] rounded-xl px-4 py-2 shadow-xl text-xs pointer-events-none">
      <p className="text-white font-black text-base">{d.num}</p>
      <p className="text-[#6cf8bb]">{d.freq} ຄັ້ງ</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function RankTable({ title, accent, data, field, unit }) {
  const max = data[0]?.[field] ?? 1
  return (
    <div className="bg-card/70 backdrop-blur-md rounded-2xl p-5 border border-border/60 shadow-sm">
      <h3 className="font-black text-foreground text-sm mb-4">{title}</h3>
      <div className="space-y-2.5">
        {data.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 text-sm">
            <span className="text-[10px] text-muted-foreground/60 w-4 text-right">{i + 1}</span>
            <span className="font-black font-mono text-foreground w-8 text-center">{s.num}</span>
            <div className="flex-1 h-3 bg-muted/60 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${(s[field] / Math.max(max, 1)) * 100}%`, background: accent }} />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground w-16 text-right shrink-0">{s[field]} {unit}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrendList({ title, accent, data, field, fieldLabel }) {
  const max = Math.max(...data.map(s => Math.abs(s[field])), 0.001)
  return (
    <div className="bg-card/70 backdrop-blur-md rounded-2xl p-5 border border-border/60 shadow-sm">
      <h3 className="font-black text-foreground text-sm mb-4">{title}</h3>
      <div className="space-y-2.5">
        {data.length === 0 && <p className="text-xs text-muted-foreground/60">ບໍ່ມີຂໍ້ມູນ</p>}
        {data.map(s => (
          <div key={s.num} className="flex items-center gap-3">
            <span className="font-black font-mono text-foreground text-sm w-8 text-center">{s.num}</span>
            <div className="flex-1 h-3 bg-muted/60 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${(Math.abs(s[field]) / max) * 100}%`, background: accent }} />
            </div>
            <span className="text-[11px] font-bold w-14 text-right shrink-0" style={{ color: accent }}>
              {s[fieldLabel]}x/10
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// NEWS ARTICLE PANEL
// ─────────────────────────────────────────────────────────────────────────────

const LDATE = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const LAO_MONTHS = ['ມັງກອນ','ກຸມພາ','ມີນາ','ເມສາ','ພຶດສະພາ','ມິຖຸນາ',
                      'ກໍລະກົດ','ສິງຫາ','ກັນຍາ','ຕຸລາ','ພະຈິກ','ທັນວາ']
  return `${d.getDate()} ${LAO_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

const STAT_LABEL = { freqW: 'ຄວາມຖີ່', overdueW: 'ຊ້ານານ', momentumW: 'Momentum', aiW: 'AI Score', decisionW: 'ສັນຍານ' }
const STAT_COLOR = { freqW: '#ef4444', overdueW: '#fbbf24', momentumW: '#6cf8bb', aiW: '#818cf8', decisionW: '#f97316' }

function buildArticle(top10, analytics, latestDraw, n, selectedTypeName) {
  if (!top10.length || !analytics) return ''
  const { hot, cold, rising, overdue: overdueList, aiTop, decisionTop } = analytics
  const dateStr = LDATE(latestDraw?.draw_date) || LDATE(new Date().toISOString())
  const drawNum = latestDraw?.draw_number ?? '?'
  const typePart = selectedTypeName ? ` (${selectedTypeName})` : ''

  const rank = (arr) => arr.slice(0, 5).map(x => x.num).join(', ')
  const rankFull = top10.map((s, i) => `  ${i + 1}. ເລກ ${s.num} — ຄວາມໜ້າຈະເປັນລວມ ${s.probability}% (AI ${s.aiScore}pts · Overdue ${s.overdue}× · Momentum ${s.momentum > 0 ? '↑' : '↓'})`).join('\n')

  const star3 = decisionTop.filter(s => s.decisionScore === 3).slice(0, 3).map(s => s.num)
  const hotTop = hot.slice(0, 5).map(s => `${s.num}(${s.freq}ຄ)`)
  const coldTop = cold.slice(0, 5).map(s => `${s.num}(${s.gap}ງ)`)
  const risingTop = rising.slice(0, 5).map(s => `${s.num}`)
  const overdueTop = overdueList.slice(0, 5).map(s => `${s.num}(${s.overdue}×)`)

  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📰 ວິເຄາະຫວຍລາວ — ເລກເດັ່ນງວດນີ້${typePart}
📅 ວັນທີ: ${dateStr}  |  ງວດ: #${drawNum}  |  ວິເຄາະ ${n} ງວດ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 ລະບົບ AI ໄດ້ວິເຄາະສະຖິຕິ ${n} ງວດ ໂດຍລວມ 5 ດ້ານ
(ຄວາມຖີ່ · ຊ້ານານ · Momentum · AI Score · ສັນຍານ Decision)
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

function NewsPanel({ analytics, draws, n, selectedType, types }) {
  const [copied, setCopied] = useState(false)

  const top10 = useMemo(() => computeCombinedTop10(analytics), [analytics])
  const latestDraw = draws?.[0] ?? null
  const selectedTypeName = selectedType === 'all' ? null
    : types?.find(t => String(t.type_id) === selectedType)?.type_name ?? null

  const article = useMemo(
    () => buildArticle(top10, analytics, latestDraw, n, selectedTypeName),
    [top10, analytics, latestDraw, n, selectedTypeName]
  )

  const handleCopy = () => {
    navigator.clipboard.writeText(article).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!top10.length) return <div className="text-center py-20 text-white/50">ຂໍ້ມູນບໍ່ພໍ</div>

  const maxCombined = top10[0].combined

  return (
    <div className="space-y-5">

      {/* ── Disclaimer ─────────────────────────────────────────────────────── */}
      <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/25 rounded-xl px-4 py-2.5 text-xs text-[#fbbf24] flex items-start gap-2">
        <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0">warning</span>
        ການວິເຄາະນີ້ອ້າງອີງຈາກສະຖິຕິ ບໍ່ຮັບປະກັນຜົນລາງວັນ — ຫວຍລາວເປັນການສຸ່ມ
      </div>

      {/* ── Combined Score Cards ────────────────────────────────────────────── */}
      <div className="bg-zinc-950/95 backdrop-blur-2xl rounded-2xl p-6 border border-white/[0.09] shadow-2xl shadow-black/50">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#f97316] to-[#fbbf24] flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-[22px]">newspaper</span>
          </div>
          <div>
            <h3 className="font-black text-white text-xl">Top 10 ເລກລວມຄວາມໜ້າຈະເປັນ</h3>
            <p className="text-xs text-white/40">Weighted Composite: ຄວາມຖີ່ · ຊ້ານານ · Momentum · AI · ສັນຍານ</p>
          </div>
        </div>

        {/* Weight legend */}
        <div className="flex gap-2 flex-wrap mb-5">
          {Object.entries(STAT_LABEL).map(([k, label]) => (
            <span key={k} className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
              style={{ background: STAT_COLOR[k] + '22', color: STAT_COLOR[k], border: `1px solid ${STAT_COLOR[k]}44` }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: STAT_COLOR[k] }} />
              {label} 20pts
            </span>
          ))}
        </div>

        <div className="space-y-3">
          {top10.map((s, i) => (
            <div key={s.num} className={`rounded-2xl p-4 border transition-all
              ${i === 0 ? 'bg-[#fbbf24]/10 border-[#fbbf24]/35' : i < 3 ? 'bg-[#818cf8]/10 border-[#818cf8]/20' : 'bg-white/[0.03] border-white/[0.06]'}`}
            >
              <div className="flex items-center gap-3 mb-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0
                  ${i === 0 ? 'bg-[#fbbf24] text-black' : i === 1 ? 'bg-[#94a3b8] text-black' : i === 2 ? 'bg-[#b45309] text-white' : 'bg-white/[0.08] text-white/40'}`}>
                  {i + 1}
                </div>
                <span className={`font-black font-mono text-3xl shrink-0
                  ${i === 0 ? 'text-[#fbbf24]' : i < 3 ? 'text-[#818cf8]' : 'text-white'}`}>{s.num}</span>
                <div className="flex-1 min-w-0">
                  {/* Combined probability bar */}
                  <div className="relative h-5 bg-white/[0.06] rounded-full overflow-hidden mb-1">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${s.probability}%`, background: 'linear-gradient(90deg,#f97316,#fbbf24)' }} />
                    <span className="absolute inset-0 flex items-center justify-end pr-2.5 text-[10px] font-black text-white">
                      {s.probability}%
                    </span>
                  </div>
                  {/* 5-signal mini bars */}
                  <div className="flex gap-1.5 flex-wrap">
                    {Object.entries(STAT_LABEL).map(([k, label]) => (
                      <div key={k} className="flex items-center gap-1">
                        <span className="text-[9px] font-bold" style={{ color: STAT_COLOR[k] + 'aa' }}>{label}</span>
                        <div className="w-12 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(s[k] / 20) * 100}%`, background: STAT_COLOR[k] }} />
                        </div>
                        <span className="text-[9px] font-black" style={{ color: STAT_COLOR[k] }}>{s[k]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                    ${s.decisionScore === 3 ? 'bg-[#fbbf24]/20 text-[#fbbf24]' : s.decisionScore === 2 ? 'bg-[#818cf8]/20 text-[#818cf8]' : 'bg-white/[0.05] text-white/30'}`}>
                    {'★'.repeat(s.decisionScore) + '☆'.repeat(3 - s.decisionScore)}
                  </span>
                  <span className={`text-[10px] font-bold ${s.momentum > 0 ? 'text-[#6cf8bb]' : 'text-[#f87171]'}`}>
                    {s.momentum > 0 ? '↑' : '↓'} {Math.abs(s.r10)}×/10ງ
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Signal breakdown grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { key: 'freqW',     icon: 'equalizer',    label: 'ຄວາມຖີ່',  color: '#ef4444', nums: analytics.hot.slice(0,5) },
          { key: 'overdueW',  icon: 'hourglass_top',label: 'ຊ້ານານ',   color: '#fbbf24', nums: analytics.overdue.slice(0,5) },
          { key: 'momentumW', icon: 'trending_up',  label: 'Momentum', color: '#6cf8bb', nums: analytics.rising.slice(0,5) },
          { key: 'aiW',       icon: 'psychology',   label: 'AI Score', color: '#818cf8', nums: analytics.aiTop.slice(0,5) },
          { key: 'decisionW', icon: 'stars',        label: 'ສັນຍານ★★★',color: '#f97316', nums: analytics.decisionTop.filter(s=>s.decisionScore===3).slice(0,5).length
              ? analytics.decisionTop.filter(s=>s.decisionScore===3).slice(0,5)
              : analytics.decisionTop.slice(0,5) },
        ].map(({ icon, label, color, nums }) => (
          <div key={label} className="bg-card/70 backdrop-blur-md rounded-2xl p-4 border border-border/60">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="material-symbols-outlined text-[16px]" style={{ color }}>{icon}</span>
              <span className="text-[11px] font-black text-white/70">{label}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {nums.map((s, j) => (
                <span key={j} className="font-black font-mono text-sm px-2 py-1 rounded-lg"
                  style={{ background: color + '22', color, border: `1px solid ${color}44` }}>
                  {s.num}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Auto-generated news article ─────────────────────────────────────── */}
      <div className="bg-zinc-950/95 backdrop-blur-2xl rounded-2xl border border-white/[0.09] shadow-2xl shadow-black/50 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#fbbf24]">article</span>
            <span className="font-black text-white text-sm">ບົດຄວາມຂ່າວ — ອັດຕະໂນມັດ</span>
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all
              ${copied ? 'bg-[#6cf8bb] text-black' : 'bg-white/[0.08] text-white/70 hover:bg-white/[0.15] hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-[14px]">{copied ? 'check' : 'content_copy'}</span>
            {copied ? 'ຄັດລອກແລ້ວ!' : 'ຄັດລອກ'}
          </button>
        </div>
        <pre className="px-6 py-5 text-[12px] sm:text-[13px] leading-relaxed text-white/80 font-mono whitespace-pre-wrap break-words">
          {article}
        </pre>
      </div>

    </div>
  )
}

function BacktestPanel({ draws, range, backtest, backtestNum, setBacktestNum }) {
  const nums = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'))
  return (
    <div className="space-y-5">
      <div className="bg-card/70 backdrop-blur-md rounded-2xl p-6 border border-border/60 shadow-sm">
        <h3 className="font-black text-foreground text-lg mb-1">Simulation / Backtest</h3>
        <p className="text-xs text-muted-foreground mb-5">ທົດສອບຕົວເລກໃດໜຶ່ງໃນຂໍ້ມູນຍ້ອນຫຼັງ</p>
        <div className="flex gap-3 items-center flex-wrap">
          <label className="text-sm font-bold text-muted-foreground">ເລືອກຕົວເລກ (00–99):</label>
          <select
            value={backtestNum}
            onChange={e => setBacktestNum(e.target.value)}
            className="bg-muted/50 border border-border/60 rounded-xl px-5 py-2.5 text-foreground font-black text-2xl focus:ring-2 focus:ring-primary font-mono"
          >
            <option value="">-- ເລືອກ --</option>
            {nums.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {!backtestNum && (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-[#2b3a54] mb-3 block">science</span>
          <p className="text-white/50">ເລືອກຕົວເລກ ເພື່ອເລີ່ມ Simulation</p>
        </div>
      )}

      {backtest && backtestNum && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'ຈຳນວນຄັ້ງ',    val: backtest.hits.length,     sub: `ໃນ ${backtest.n} ງວດ`,    c: '#6cf8bb' },
              { label: 'Hit Rate',      val: `${backtest.hitRate}%`,   sub: 'win rate',               c: '#818cf8' },
              { label: 'Avg Gap',       val: backtest.avgGap,          sub: 'ງວດ ຕໍ່ ຄັ້ງ',            c: '#fbbf24' },
              { label: 'ຫ່າງສູງສຸດ',   val: backtest.maxGap,          sub: 'max gap (ງວດ)',           c: '#f87171' },
            ].map(({ label, val, sub, c }) => (
              <div key={label} className="bg-card/70 backdrop-blur-md rounded-2xl p-5 border border-border/60 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: c + 'aa' }}>{label}</p>
                <p className="text-3xl font-black text-foreground">{val}</p>
                <p className="text-[10px] mt-0.5" style={{ color: c + '80' }}>{sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-card/70 backdrop-blur-md rounded-2xl p-6 border border-border/60">
            <h3 className="font-black text-foreground mb-4 text-sm">Hit/Miss Timeline (50 ງວດລ່າສຸດ)</h3>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={backtest.timeline} margin={{ top: 5, right: 5, bottom: 0, left: -30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} axisLine={false} interval={4} />
                <YAxis domain={[0, 1]} hide />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="bg-zinc-950/90 border border-white/10 rounded-xl px-3 py-2 text-xs pointer-events-none">
                        <p className={`font-black ${d.hit ? 'text-[#6cf8bb]' : 'text-white/30'}`}>
                          {d.hit ? `✓ ອອກ ${backtestNum}` : '✗ ບໍ່ອອກ'}
                        </p>
                        <p className="text-white/50">{d.date}</p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="hit" radius={[3, 3, 0, 0]}>
                  {backtest.timeline.map((entry, i) => (
                    <Cell key={i} fill={entry.hit ? '#a78bfa' : '#27272a'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {backtest.hits.length > 0 && (
            <div className="bg-card/70 backdrop-blur-md rounded-2xl p-6 border border-border/60">
              <h3 className="font-black text-foreground mb-4 text-sm">
                ປະຫວັດທີ່ອອກ ({backtest.hits.length} ຄັ້ງ)
              </h3>
              <div className="flex flex-wrap gap-2">
                {[...backtest.hits].reverse().slice(0, 40).map((h, i) => (
                  <div key={i} className="bg-[#6cf8bb]/10 border border-[#6cf8bb]/30 rounded-lg px-3 py-1.5 text-center min-w-[70px]">
                    <p className="text-[9px] text-white/50">#{h.drawNum}</p>
                    <p className="text-[11px] font-bold text-[#6cf8bb]">{h.date?.slice(0, 10)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { draws, types, loading } = useData()
  const [range, setRange] = useState('50')
  const [mode, setMode]   = useState('heatmap')
  const [heatMode, setHeatMode] = useState('freq')
  const [hoveredNum, setHoveredNum] = useState(null)
  const [backtestNum, setBacktestNum] = useState('')
  const [aiTrials, setAiTrials] = useState(10)
  const [dsTrials, setDsTrials] = useState(21)
  const [selectedType, setSelectedType] = useState('all')

  const filteredDraws = useMemo(() => (
    selectedType === 'all' ? draws : draws?.filter(d => String(d.type_id) === selectedType)
  ), [draws, selectedType])

  const analytics    = useMemo(() => computeAnalytics(filteredDraws, range), [filteredDraws, range])
  const backtest     = useMemo(() => computeBacktest(filteredDraws, range, backtestNum), [filteredDraws, range, backtestNum])
  const aiBacktest   = useMemo(() => computeAIBacktest(filteredDraws, aiTrials), [filteredDraws, aiTrials])
  const dsBacktest   = useMemo(() => computeDecisionBacktest(filteredDraws, dsTrials), [filteredDraws, dsTrials])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-400" />
    </div>
  )
  if (!analytics) return <div className="text-center py-20 text-white/50">ບໍ່ມີຂໍ້ມູນ</div>

  const { n, scores, series, freqBars, hot, cold, aiTop, rising, falling, overdue, decisionTop } = analytics

  const topHot = hot?.[0]?.num ?? ''

  return (
    <div className="space-y-5">
      <SEO
        title={`AI Analytics ວິເຄາະຫວຍລາວ ${n} ງວດ | วิเคราะห์หวยลาว AI เลขเด็ดวันนี้`}
        description={`ລະບົບວິເຄາະ Big Data ຫວຍລາວ ${n} ງວດ. Heatmap, Trend, Gap Analysis, AI Score, Backtest | วิเคราะห์ Big Data หวยลาว ${n} งวด Heatmap เทรนด์ Gap Analysis AI Score ตรวจผลหวยแบบเรียลไทม์`}
        keywords={[
          'AI Analytics', 'Big Data ຫວຍ', 'Heatmap ຫວຍ', 'Gap Analysis ຫວຍ',
          'วิเคราะห์หวย AI', 'หวยออกอะไร', 'เลขเด็ดวันนี้', 'AI หวยลาว',
          topHot ? `เลข ${topHot}` : '',
        ].filter(Boolean)}
        url="/analytics"
        jsonLd={[
          webPageSchema(
            'AI Analytics ວິເຄາະຫວຍລາວ | วิเคราะห์หวยลาว AI',
            'https://laolots.com/analytics',
            `ລະບົບວິເຄາະ Big Data ຫວຍລາວ ${n} ງວດ`,
          ),
          breadcrumbSchema([
            { name: 'ໜ້າຫຼັກ', url: 'https://laolots.com/' },
            { name: 'Analytics', url: 'https://laolots.com/analytics' },
          ]),
        ]}
      />

      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020818] via-[#001040] to-[#0f172a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.3),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(108,248,187,0.08),transparent_55%)]" />
        <div className="absolute right-6 bottom-0 text-[7rem] font-black text-white/[0.03] leading-none select-none pointer-events-none tracking-tighter">
          BIG DATA
        </div>
        <div className="relative z-10 px-6 sm:px-10 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/[0.07] backdrop-blur-xl border border-white/[0.15] rounded-full px-3 py-1 mb-4 shadow-lg shadow-violet-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-300 animate-pulse" />
                <span className="text-white/70 text-[11px] font-bold uppercase tracking-widest">AI-Powered Analytics</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 leading-tight">
                Analytics <span className="text-violet-300">Dashboard</span>
              </h1>
              <p className="text-white/50 text-sm max-w-md">
                ລະບົບວິເຄາະ Big Data — ຄວາມຖີ່ · Trend · Gap · AI Score
                {selectedType !== 'all' && types && (() => {
                  const t = types.find(x => String(x.type_id) === selectedType)
                  return t ? <span className="ml-1 font-bold text-white/70">· {t.type_name}</span> : null
                })()}
              </p>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
              {[
                { label: 'ງວດທີ່ວິເຄາະ', val: n,                           sub: 'draws',             c: '#818cf8' },
                { label: 'Hot #1',         val: hot[0]?.num ?? '-',          sub: `${hot[0]?.freq ?? 0}x`,      c: '#f87171' },
                { label: 'ຊ້ານານ',         val: cold[0]?.num ?? '-',         sub: `${cold[0]?.gap ?? 0} ງວດ`,  c: '#fbbf24' },
                { label: 'AI Pick',        val: aiTop[0]?.num ?? '-',        sub: `${aiTop[0]?.aiScore ?? 0} pts`, c: '#6cf8bb' },
              ].map(({ label, val, sub, c }) => (
                <div key={label} className="bg-white/[0.07] backdrop-blur-xl border border-white/[0.11] rounded-2xl px-4 py-3 text-center shadow-lg shadow-black/30">
                  <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: c + 'aa' }}>{label}</p>
                  <p className="text-2xl font-black text-white font-mono">{val}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: c + '80' }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Type Selector ───────────────────────────────────────────────────── */}
      {types && types.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ປະເພດ:</span>
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              selectedType === 'all'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                : 'bg-card/70 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            }`}
          >
            ທັງໝົດ ({draws?.length ?? 0})
          </button>
          {types.filter(t => t.is_active != 0).map(t => {
            const color = t.color || '#003fb1'
            const active = selectedType === String(t.type_id)
            const cnt = draws?.filter(d => String(d.type_id) === String(t.type_id)).length ?? 0
            return (
              <button
                key={t.type_id}
                onClick={() => setSelectedType(String(t.type_id))}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all"
                style={active
                  ? { background: color, color: '#fff', borderColor: color, boxShadow: `0 2px 8px ${color}40` }
                  : { background: 'transparent', color, borderColor: `${color}50` }
                }
              >
                {t.type_name} ({cnt})
              </button>
            )
          })}
        </div>
      )}

      {/* ── Control Panel ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
        {/* Range */}
        <div className="flex items-center gap-1 bg-card/60 backdrop-blur-md p-1 rounded-2xl border border-border/60 shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground/60 px-2 uppercase tracking-widest">ງວດ</span>
          {RANGE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setRange(value)}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all
                ${range === value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-primary'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Mode tabs */}
        <div className="bg-card/60 backdrop-blur-md p-1 rounded-2xl border border-border/60 shadow-sm">
          <div className="flex flex-wrap gap-1">
            {MODES.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] sm:text-[12px] font-bold whitespace-nowrap transition-all
                  ${mode === value
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-primary'}`}
              >
                <span className="material-symbols-outlined text-[13px] sm:text-[14px]">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB: HEATMAP ────────────────────────────────────────────────────── */}
      {mode === 'heatmap' && (
        <div className="space-y-5">
          <div className="bg-card/70 backdrop-blur-md rounded-2xl p-6 border border-border/60 shadow-sm">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h3 className="font-black text-foreground text-lg">Frequency Heatmap 00–99</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hover ເພື່ອເບິ່ງລາຍລະອຽດ · ສີແດງ = ອອກຫຼາຍ · ສີນ້ຳເງິນ = ອອກໜ້ອຍ
                </p>
              </div>
              <div className="flex gap-2">
                {[{ v: 'freq', label: 'ຄວາມຖີ່' }, { v: 'overdue', label: 'Overdue' }].map(({ v, label }) => (
                  <button
                    key={v}
                    onClick={() => setHeatMode(v)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all
                      ${heatMode === v ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:text-foreground'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hover info bar */}
            <div className={`mb-4 transition-all duration-200 ${hoveredNum ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {(() => {
                const s = scores.find(x => x.num === hoveredNum)
                if (!s) return null
                return (
                  <div className="p-3 bg-muted/50 backdrop-blur-sm border border-border/60 rounded-xl flex items-center gap-5 flex-wrap text-sm">
                    <span className="text-3xl font-black text-primary font-mono w-12">{s.num}</span>
                    <span className="text-muted-foreground">ອອກ <b className="text-foreground">{s.freq}</b> ຄັ້ງ ({s.pct}%)</span>
                    <span className="text-muted-foreground">ຫ່າງ <b className="text-foreground">{s.gap}</b> ງວດ</span>
                    <span className="text-muted-foreground">Avg Gap <b className="text-foreground">{s.avgGap}</b></span>
                    <span className="text-muted-foreground">Overdue <b className={s.overdue >= 2 ? 'text-[#ef4444]' : s.overdue >= 1.5 ? 'text-[#f97316]' : 'text-foreground'}>{s.overdue}x</b></span>
                    <span className="text-muted-foreground">AI Score <b className="text-[#818cf8]">{s.aiScore}</b></span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.momentum > 0 ? 'bg-[#6cf8bb]/20 text-[#059669]' : 'bg-[#f87171]/20 text-[#dc2626]'}`}>
                      {s.momentum > 0 ? '↑ Rising' : '↓ Falling'}
                    </span>
                  </div>
                )
              })()}
            </div>

            {/* 10×10 Grid */}
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 100 }, (_, i) => {
                const num = i.toString().padStart(2, '0')
                const s = scores.find(x => x.num === num)
                const intensity = heatMode === 'freq' ? (s?.heatIntensity ?? 0) : Math.min((s?.overdue ?? 0) / 4, 1)
                const isHovered = hoveredNum === num
                return (
                  <div
                    key={num}
                    onMouseEnter={() => setHoveredNum(num)}
                    onMouseLeave={() => setHoveredNum(null)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-150 relative select-none
                      ${isHovered ? 'scale-125 z-10 shadow-lg ring-2 ring-white/40' : 'hover:scale-110 hover:z-10'}`}
                    style={{ background: heatBg(intensity) }}
                  >
                    <span className="text-[11px] font-black text-white leading-none">{num}</span>
                    {s?.freq > 0 && (
                      <span className="text-[7px] text-white/60 leading-none mt-0.5">{s.freq}</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-5 justify-end">
              <span className="text-[10px] text-white/50">ໜ້ອຍ</span>
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((t, i) => (
                <div key={i} className="w-7 h-3.5 rounded" style={{ background: heatBg(t) }} />
              ))}
              <span className="text-[10px] text-white/50">ຫຼາຍ</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <RankTable title="🔥 Top 10 ເລກ Hot" accent="#ef4444" data={hot}  field="freq" unit="ຄັ້ງ" />
            <RankTable title="🧊 Top 10 ເລກ Cold" accent="#60a5fa" data={cold} field="gap"  unit="ງວດ" />
          </div>
        </div>
      )}

      {/* ── TAB: CHARTS ─────────────────────────────────────────────────────── */}
      {mode === 'charts' && (
        <div className="space-y-5">
          <div className="bg-card/70 backdrop-blur-md rounded-2xl p-6 border border-border/60 shadow-sm">
            <h3 className="font-black text-foreground text-lg mb-1">Time-Series: ຕົວເລກ 2 ໂຕ ຕາມງວດ</h3>
            <p className="text-xs text-muted-foreground mb-5">ແກນ Y = ຕົວເລກ 00–99 · ສະແດງ {series.length} ງວດລ່າສຸດ</p>
            <ResponsiveContainer width="100%" height={290}>
              <LineChart data={series} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(43,58,84,0.5)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
                <YAxis domain={[0, 99]} tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} />
                <ReferenceLine y={49} stroke="#2b3a54" strokeDasharray="4 4" label={{ value: '50', fill: '#475569', fontSize: 9 }} />
                <Line type="monotone" dataKey="val" stroke="#818cf8" strokeWidth={2}
                  dot={{ fill: '#818cf8', r: 2.5, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#6cf8bb', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card/70 backdrop-blur-md rounded-2xl p-6 border border-border/60 shadow-sm">
            <h3 className="font-black text-foreground text-lg mb-5">Top 20 ຄວາມຖີ່</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={freqBars} margin={{ top: 0, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(43,58,84,0.5)" vertical={false} />
                <XAxis dataKey="num" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<FreqTip />} />
                <Bar dataKey="freq" radius={[4, 4, 0, 0]}>
                  {freqBars.map((entry, i) => (
                    <Cell key={i} fill={i === 0 ? '#fbbf24' : i < 3 ? '#ef4444' : i < 8 ? '#f97316' : '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── TAB: TREND ──────────────────────────────────────────────────────── */}
      {mode === 'trend' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TrendList title="📈 ກຳລັງຂຶ້ນ (Rising)" accent="#6cf8bb" data={rising}  field="momentum" fieldLabel="r10" />
            <TrendList title="📉 ກຳລັງລົງ (Falling)"  accent="#f87171" data={falling} field="momentum" fieldLabel="r10" />
          </div>

          <div className="bg-card/70 backdrop-blur-md rounded-2xl p-6 border border-border/60 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d97706] to-[#f59e0b] flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-[18px]">hourglass_top</span>
              </div>
              <div>
                <h3 className="font-black text-foreground">ເລກທີ່ຊ້ານານ (Overdue Numbers)</h3>
                <p className="text-xs text-muted-foreground">Overdue ≥ 1.0× = ເກີນຄ່າສະເລ່ຍ — ສູງ = ຄາດວ່າຈະອອກ</p>
              </div>
            </div>
            <div className="space-y-2.5 mt-5">
              {overdue.map((s, i) => (
                <div key={s.num} className="flex items-center gap-3">
                  <span className="text-[10px] text-white/50 w-5 text-right">{i + 1}</span>
                  <span className="font-black font-mono text-white bg-muted/70 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm w-12 text-center shadow-sm ring-1 ring-border/40">{s.num}</span>
                  <div className="flex-1 relative h-7 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(s.overdue / 5, 1) * 100}%`,
                        background: s.overdue >= 3 ? 'linear-gradient(90deg,#dc2626,#ef4444)'
                          : s.overdue >= 2 ? 'linear-gradient(90deg,#d97706,#f59e0b)'
                          : 'linear-gradient(90deg,#0369a1,#0ea5e9)'
                      }}
                    />
                    <span className="absolute inset-0 flex items-center px-3 text-[11px] font-bold text-white/90">
                      {s.overdue}× overdue — ຫ່າງ {s.gap} ງວດ (avg {s.avgGap})
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0
                    ${s.overdue >= 3 ? 'bg-[#ef4444]/20 text-[#f87171]' : s.overdue >= 2 ? 'bg-[#f59e0b]/20 text-[#fbbf24]' : 'bg-[#0ea5e9]/20 text-[#38bdf8]'}`}
                  >
                    {s.freq}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: AI ENGINE ──────────────────────────────────────────────────── */}
      {mode === 'ai' && (
        <div className="space-y-5">
          <div className="bg-zinc-950/95 backdrop-blur-2xl rounded-2xl p-6 border border-white/[0.09] shadow-2xl shadow-black/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#818cf8] to-[#6cf8bb] flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white text-[22px]">psychology</span>
              </div>
              <div>
                <h3 className="font-black text-white text-xl">AI Prediction Engine</h3>
                <p className="text-xs text-white/40">Composite score: Frequency + Gap + Momentum</p>
              </div>
            </div>

            <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/25 rounded-xl px-4 py-2.5 mb-6 text-xs text-[#fbbf24] flex items-start gap-2">
              <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0">warning</span>
              ຫວຍລາວເປັນການສຸ່ມ — AI Score ເປັນພຽງການວິເຄາະສະຖິຕິ ບໍ່ຮັບປະກັນການອອກລາງວັນ
            </div>

            <div className="space-y-3.5">
              {aiTop.map((s, i) => (
                <div key={s.num} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0
                    ${i === 0 ? 'bg-[#fbbf24] text-black' : i === 1 ? 'bg-[#94a3b8] text-black' : i === 2 ? 'bg-[#b45309] text-white' : 'bg-white/[0.06] text-white/30'}`}
                  >
                    {i + 1}
                  </div>
                  <span className="font-black text-white text-2xl font-mono w-12 shrink-0">{s.num}</span>
                  <div className="flex-1 min-w-0">
                    <div className="relative h-5 bg-white/[0.06] rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${s.aiScore}%`,
                          background: `linear-gradient(90deg, #818cf8 0%, #6cf8bb 100%)`
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-end pr-2.5 text-[10px] font-black text-white">
                        {s.aiScore} pts
                      </span>
                    </div>
                    <div className="flex gap-3 text-[10px] text-white/30">
                      <span className="text-white/40">Freq <span className="text-white/50">{s.freq}× ({s.pct}%)</span></span>
                      <span className="text-white/40">Gap <span className="text-white/50">{s.gap}/{s.avgGap}</span></span>
                      <span className="text-white/40">10ງວດ <span className="text-white/50">{s.r10}×</span></span>
                      <span className={s.momentum > 0 ? 'text-[#6cf8bb]' : 'text-[#f87171]'}>
                        {s.momentum > 0 ? '↑' : '↓'} momentum
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0
                    ${s.aiScore >= 60 ? 'bg-[#6cf8bb]/15 text-[#6cf8bb]' : s.aiScore >= 40 ? 'bg-[#fbbf24]/15 text-[#fbbf24]' : 'bg-[#94a3b8]/10 text-white/50'}`}
                  >
                    {s.aiScore >= 60 ? 'HIGH' : s.aiScore >= 40 ? 'MID' : 'LOW'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Score model explanation */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <h3 className="font-black text-foreground mb-5">ສູດຄຳນວນ AI Score</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: 'Frequency Score', weight: '35 pts', icon: 'equalizer',   color: '#818cf8', desc: '(ຈຳນວນຄັ້ງ / max) × 35 — ອອກຫຼາຍ = ຄະແນນສູງ' },
                { name: 'Gap Score',       weight: '35 pts', icon: 'timer',        color: '#fbbf24', desc: '(Overdue ÷ 3) × 35 — ຊ້ານານ = ຄາດອອກ' },
                { name: 'Momentum',        weight: '30 pts', icon: 'trending_up',  color: '#6cf8bb', desc: '(Rate 10ງວດ vs 30ງວດ) × 30 — ຂຶ້ນໃຫ້ຫຼາຍ' },
              ].map(({ name, weight, icon, color, desc }) => (
                <div key={name} className="bg-secondary rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[20px]" style={{ color }}>{icon}</span>
                    <span className="font-black text-foreground text-sm">{name}</span>
                  </div>
                  <p className="text-3xl font-black mb-2" style={{ color }}>{weight}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Accuracy Backtest */}
          <div className="bg-zinc-950/95 backdrop-blur-2xl rounded-2xl p-6 border border-white/[0.09] shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fbbf24] to-[#f97316] flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-white text-[20px]">fact_check</span>
                </div>
                <div>
                  <h3 className="font-black text-white text-lg">AI Accuracy Backtest</h3>
                  <p className="text-xs text-white/40">ຖ້າຊື້ຕາມ AI ຍ້ອນຫຼັງ — ຈະຖືກຈັກຄັ້ງ?</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {[10, 20, 30, 50].map(t => (
                  <button
                    key={t}
                    onClick={() => setAiTrials(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all
                      ${aiTrials === t ? 'bg-[#fbbf24] text-black' : 'bg-white/[0.06] text-white/40 hover:text-white'}`}
                  >
                    {t} ຄັ້ງ
                  </button>
                ))}
              </div>
            </div>

            {!aiBacktest ? (
              <p className="text-white/30 text-sm text-center py-8">ຂໍ້ມູນບໍ່ພໍ</p>
            ) : (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Top 1 ຖືກ',  hits: aiBacktest.hits1,  color: '#fbbf24', sublabel: 'ເລກດຽວ' },
                    { label: 'Top 5 ຖືກ',  hits: aiBacktest.hits5,  color: '#818cf8', sublabel: 'ໃນ 5 ເລກ' },
                    { label: 'Top 10 ຖືກ', hits: aiBacktest.hits10, color: '#6cf8bb', sublabel: 'ໃນ 10 ເລກ' },
                  ].map(({ label, hits, color, sublabel }) => {
                    const pct = Math.round((hits / aiBacktest.trials) * 100)
                    return (
                      <div key={label} className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-4 border border-white/[0.08] text-center">
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: color + 'aa' }}>{label}</p>
                        <p className="text-4xl font-black" style={{ color }}>
                          {hits}<span className="text-xl text-white/30">/{aiBacktest.trials}</span>
                        </p>
                        <div className="mt-2 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                        </div>
                        <p className="text-[11px] mt-1.5 font-bold" style={{ color }}>{pct}% · {sublabel}</p>
                      </div>
                    )
                  })}
                </div>

                {/* Per-draw results */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">ລາຍລະອຽດແຕ່ລະງວດ</p>
                  {aiBacktest.results.map((r, i) => (
                    <div key={i} className={`flex flex-col gap-2 rounded-xl px-3 py-2.5
                      ${r.hit1 ? 'bg-[#fbbf24]/10 border border-[#fbbf24]/25' : r.hit5 ? 'bg-[#818cf8]/10 border border-[#818cf8]/20' : r.hit10 ? 'bg-[#6cf8bb]/10 border border-[#6cf8bb]/15' : 'bg-white/[0.03] border border-white/[0.06]'}`}
                    >
                      {/* ── Row 1: meta + result + verdict ── */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-white/30 w-4 shrink-0">{i + 1}</span>
                        <span className="text-[10px] font-bold text-white/30 shrink-0">#{r.drawNum}</span>
                        <span className="text-[10px] text-white/30 shrink-0">{r.date?.slice(0, 10)}</span>
                        <div className="flex-1" />
                        <span className="font-black font-mono text-base text-white shrink-0">{r.actual}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0
                          ${r.hit1 ? 'bg-[#fbbf24]/20 text-[#fbbf24]' : r.hit5 ? 'bg-[#818cf8]/20 text-[#818cf8]' : r.hit10 ? 'bg-[#6cf8bb]/20 text-[#6cf8bb]' : 'bg-white/[0.04] text-white/30'}`}
                        >
                          {r.hit1 ? '✓ #1' : r.hit5 ? '✓ Top5' : r.hit10 ? '✓ Top10' : '✗ Miss'}
                        </span>
                      </div>
                      {/* ── Row 2: top10 number badges ── */}
                      <div className="flex gap-1 flex-wrap">
                        {r.top10.map((num, j) => (
                          <span key={j} className={`font-black font-mono text-[11px] px-1.5 py-0.5 rounded-md
                            ${num === r.actual ? 'bg-[#fbbf24] text-black' : j === 0 ? 'bg-violet-500/10 text-violet-300' : 'bg-white/[0.04] text-white/30'}`}
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: DECISION ───────────────────────────────────────────────────── */}
      {mode === 'decision' && (
        <div className="bg-zinc-950/95 backdrop-blur-2xl rounded-2xl p-5 border border-white/[0.09] shadow-2xl shadow-black/50 space-y-5">
          {/* Header */}
          <div className="relative rounded-2xl overflow-hidden bg-zinc-950/90 backdrop-blur-2xl border border-white/[0.09] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#fbbf24] to-[#f97316] flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white text-[22px]">stars</span>
              </div>
              <div>
                <h3 className="font-black text-white text-xl">Decision Score</h3>
                <p className="text-xs text-white/40">ນັບ Signal ທີ່ຜ່ານ — ★★★ = ສັນຍານທຸກຢ່າງຊ້ອນກັນ</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { sig: '★ Signal 1', label: 'Overdue ≥ 1.0×', desc: 'ຊ້ານານກວ່າສະເລ່ຍ', color: '#fbbf24' },
                { sig: '★ Signal 2', label: 'Momentum ↑',      desc: 'ອອກ 10 ງວດ > 30 ງວດ', color: '#6cf8bb' },
                { sig: '★ Signal 3', label: 'AI Score ≥ 60',   desc: 'Composite score HIGH', color: '#818cf8' },
              ].map(({ sig, label, desc, color }) => (
                <div key={sig} className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-[10px] font-black mb-1" style={{ color }}>{sig}</p>
                  <p className="text-sm font-black text-white">{label}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-3 flex-wrap">
            {[
              { stars: 3, label: '★★★ ສັນຍານຄົບ 3', bg: 'bg-[#fbbf24]/15 border-[#fbbf24]/40 text-[#fbbf24]', badge: 'ຊື້ໄດ້' },
              { stars: 2, label: '★★☆ ສັນຍານ 2/3',   bg: 'bg-[#818cf8]/15 border-[#818cf8]/40 text-[#818cf8]', badge: 'ເຝົ້າລໍ' },
              { stars: 1, label: '★☆☆ ສັນຍານ 1/3',   bg: 'bg-[#475569]/15 border-[#475569]/40 text-white/50', badge: 'ອ່ອນ' },
            ].map(({ stars, label, bg, badge }) => (
              <div key={stars} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${bg}`}>
                <span>{label}</span>
                <span className="text-[10px] opacity-70">— {badge}</span>
              </div>
            ))}
          </div>

          {/* Numbers list */}
          {decisionTop.length === 0 ? (
            <p className="text-center text-white/30 py-10">ບໍ່ມີຕົວເລກທີ່ຜ່ານ signal ໃດ</p>
          ) : (
            <div className="space-y-2.5">
              {decisionTop.map((s, i) => {
                const is3 = s.decisionScore === 3
                const is2 = s.decisionScore === 2
                return (
                  <div key={s.num} className={`rounded-2xl p-4 border flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap transition-all
                    ${is3 ? 'bg-[#fbbf24]/10 border-[#fbbf24]/30' : is2 ? 'bg-[#818cf8]/10 border-[#818cf8]/20' : 'bg-white/[0.03] border-white/[0.06]'}`}
                  >
                    {/* Rank */}
                    <span className="text-[10px] text-white/30 w-4 shrink-0 text-right">{i + 1}</span>

                    {/* Number */}
                    <span className={`font-black font-mono text-3xl w-14 text-center shrink-0
                      ${is3 ? 'text-[#fbbf24]' : is2 ? 'text-[#818cf8]' : 'text-white/50'}`}
                    >{s.num}</span>

                    {/* Stars */}
                    <div className="flex gap-1 shrink-0">
                      {[0, 1, 2].map(j => (
                        <span key={j} className={`text-lg ${j < s.decisionScore ? (is3 ? 'text-[#fbbf24]' : is2 ? 'text-[#818cf8]' : 'text-white/50') : 'text-white/[0.08]'}`}>★</span>
                      ))}
                    </div>

                    {/* Signal badges */}
                    <div className="flex gap-1.5 flex-wrap flex-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border
                        ${s.sig1 ? 'bg-[#fbbf24]/15 border-[#fbbf24]/30 text-[#fbbf24]' : 'bg-transparent border-white/[0.06] text-white/20'}`}>
                        Overdue {s.overdue}×
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border
                        ${s.sig2 ? 'bg-[#6cf8bb]/15 border-[#6cf8bb]/30 text-[#6cf8bb]' : 'bg-transparent border-white/[0.06] text-white/20'}`}>
                        {s.momentum > 0 ? '↑' : '↓'} Momentum {s.r10}×/10ງວດ
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border
                        ${s.sig3 ? 'bg-[#818cf8]/15 border-[#818cf8]/30 text-[#818cf8]' : 'bg-transparent border-white/[0.06] text-white/20'}`}>
                        AI {s.aiScore} pts
                      </span>
                    </div>

                    {/* Verdict */}
                    <span className={`text-xs font-black px-3 py-1 rounded-full shrink-0
                      ${is3 ? 'bg-[#fbbf24] text-black' : is2 ? 'bg-[#818cf8]/20 text-[#818cf8]' : 'bg-white/[0.04] text-white/30'}`}>
                      {is3 ? '✓ ຊື້ໄດ້' : is2 ? 'ເຝົ້າລໍ' : 'ອ່ອນ'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: NEWS ───────────────────────────────────────────────────────── */}
      {mode === 'news' && (
        <NewsPanel
          analytics={analytics}
          draws={filteredDraws}
          n={n}
          selectedType={selectedType}
          types={types}
        />
      )}

      {/* ── TAB: DS BACKTEST ────────────────────────────────────────────────── */}
      {mode === 'dsbacktest' && (
        <div className="bg-zinc-950/95 backdrop-blur-2xl rounded-2xl p-5 border border-white/[0.09] shadow-2xl shadow-black/50 space-y-5">
          {/* Header */}
          <div className="relative rounded-2xl overflow-hidden bg-zinc-950/90 backdrop-blur-2xl border border-white/[0.09] p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#6cf8bb] to-[#818cf8] flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-white text-[22px]">verified</span>
                </div>
                <div>
                  <h3 className="font-black text-white text-xl">Decision Score Accuracy Backtest</h3>
                  <p className="text-xs text-white/40">ຖ້ານຳໃຊ້ Decision Score ຍ້ອນຫຼັງ — ★★★/★★/★ ທຳນາຍຖືກຈັກ %?</p>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {[10, 21, 30, 50].map(t => (
                  <button
                    key={t}
                    onClick={() => setDsTrials(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all
                      ${dsTrials === t ? 'bg-[#6cf8bb] text-black' : 'bg-white/[0.06] text-white/40 hover:text-white'}`}
                  >
                    {t} ງວດ
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!dsBacktest ? (
            <p className="text-white/30 text-sm text-center py-8">ຂໍ້ມູນບໍ່ພໍ</p>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: '★★★ ຖືກ',    hits: dsBacktest.hitsStar3, color: '#fbbf24', sub: 'ສັນຍານຄົບ 3' },
                  { label: '★★☆ ຖືກ',   hits: dsBacktest.hitsStar2, color: '#818cf8', sub: 'ສັນຍານ 2/3' },
                  { label: '★☆☆ ຖືກ',   hits: dsBacktest.hitsStar1, color: '#94a3b8', sub: 'ສັນຍານ 1/3' },
                  { label: 'ຮວມຖືກ (any)', hits: dsBacktest.hitsAny,  color: '#6cf8bb', sub: 'ຢ່າງໜ້ອຍ 1 ★' },
                ].map(({ label, hits, color, sub }) => {
                  const pct = Math.round((hits / dsBacktest.trials) * 100)
                  return (
                    <div key={label} className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-4 border border-white/[0.08] text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: color + 'aa' }}>{label}</p>
                      <p className="text-4xl font-black" style={{ color }}>
                        {hits}<span className="text-xl text-white/30">/{dsBacktest.trials}</span>
                      </p>
                      <div className="mt-2 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <p className="text-[11px] mt-1.5 font-bold" style={{ color }}>{pct}% · {sub}</p>
                    </div>
                  )
                })}
              </div>

              {/* Accuracy bar */}
              <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-5 border border-white/[0.08]">
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">ສັດສ່ວນຄວາມຖືກຕ້ອງ</p>
                <div className="space-y-3.5">
                  {[
                    { label: '★★★  ສັນຍານຄົບ', hits: dsBacktest.hitsStar3, color: '#fbbf24', total: dsBacktest.trials },
                    { label: '★★  ສັນຍານ 2/3',  hits: dsBacktest.hitsStar2, color: '#818cf8', total: dsBacktest.trials },
                    { label: '★  ສັນຍານ 1/3',   hits: dsBacktest.hitsStar1, color: '#94a3b8', total: dsBacktest.trials },
                    { label: 'ຮວມ (any signal)',  hits: dsBacktest.hitsAny,   color: '#6cf8bb', total: dsBacktest.trials },
                  ].map(({ label, hits, color, total }) => {
                    const pct = Math.round((hits / total) * 100)
                    return (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-white/40 w-40 shrink-0">{label}</span>
                        <div className="flex-1 h-5 bg-white/[0.08] rounded-full overflow-hidden relative">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: color }}
                          />
                          <span className="absolute inset-0 flex items-center px-3 text-[11px] font-black text-white/80">
                            {hits}/{total} ງວດ
                          </span>
                        </div>
                        <span className="text-sm font-black w-12 text-right shrink-0" style={{ color }}>{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Per-draw list — 21 rows */}
              <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-5 border border-white/[0.08]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">
                  ລາຍລະອຽດ {dsBacktest.results.length} ງວດ
                </p>
                <div className="space-y-2">
                  {dsBacktest.results.map((r, i) => {
                    const tier = r.hitStar3 ? 3 : r.hitStar2 ? 2 : r.hitStar1 ? 1 : 0
                    const rowColor = tier === 3 ? '#fbbf24' : tier === 2 ? '#818cf8' : tier === 1 ? '#94a3b8' : null
                    const rowBg   = tier === 3 ? 'bg-[#fbbf24]/10 border-[#fbbf24]/25'
                                  : tier === 2 ? 'bg-[#818cf8]/10 border-[#818cf8]/20'
                                  : tier === 1 ? 'bg-white/[0.04] border-white/[0.07]'
                                  : 'bg-zinc-950/80 border-white/[0.05]'
                    return (
                      <div key={i} className={`rounded-xl px-3 py-2.5 border flex flex-col gap-2 ${rowBg}`}>
                        {/* ── Row 1: meta + result + verdict ── */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* rank */}
                          <span className="text-[10px] text-white/30 w-4 shrink-0 text-right">{i + 1}</span>
                          {/* draw info */}
                          <span className="text-[10px] font-bold text-white/30 shrink-0">#{r.drawNum}</span>
                          <span className="text-[10px] text-white/30 shrink-0">{r.date?.slice(0, 10)}</span>
                          <div className="flex-1" />
                          {/* actual result */}
                          <span className="font-black font-mono text-base text-white shrink-0">{r.actual}</span>
                          {/* DS stars of actual */}
                          <div className="flex gap-0.5 shrink-0">
                            {[0,1,2].map(j => (
                              <span key={j} className={`text-sm ${j < r.actualDecisionScore ? (rowColor ? '' : 'text-white/[0.08]') : 'text-white/[0.08]'}`}
                                style={j < r.actualDecisionScore && rowColor ? { color: rowColor } : {}}>
                                ★
                              </span>
                            ))}
                          </div>
                          {/* verdict badge */}
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0
                            ${tier === 3 ? 'bg-[#fbbf24]/20 text-[#fbbf24]'
                              : tier === 2 ? 'bg-[#818cf8]/20 text-[#818cf8]'
                              : tier === 1 ? 'bg-[#94a3b8]/20 text-white/50'
                              : 'bg-white/[0.04] text-white/30'}`}
                          >
                            {tier === 3 ? '★★★ ຖືກ' : tier === 2 ? '★★ ຖືກ' : tier === 1 ? '★ ຖືກ' : '✗ Miss'}
                          </span>
                        </div>
                        {/* ── Row 2: all 21 number badges ── */}
                        <div className="flex gap-1 flex-wrap">
                          {r.all21.map((item, j) => (
                            <span
                              key={j}
                              title={`★${item.tier}`}
                              className={`font-black font-mono text-[11px] px-1.5 py-0.5 rounded-md transition-all
                                ${item.num === r.actual
                                  ? item.tier === 3 ? 'bg-[#fbbf24] text-black ring-1 ring-[#fbbf24]'
                                    : item.tier === 2 ? 'bg-[#818cf8] text-white ring-1 ring-[#818cf8]'
                                    : 'bg-[#94a3b8] text-black ring-1 ring-[#94a3b8]'
                                  : item.tier === 3 ? 'bg-white/[0.04] text-[#fbbf24]/80'
                                    : item.tier === 2 ? 'bg-white/[0.04] text-[#818cf8]/65'
                                    : 'bg-white/[0.04] text-white/30'}`}
                            >
                              {item.num}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/25 rounded-xl px-4 py-2.5 text-xs text-[#fbbf24] flex items-start gap-2">
                <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0">warning</span>
                ຫວຍລາວເປັນການສຸ່ມ — ຕົວເລກ Decision Score ★★★ ຮວມຢູ່ໃນກຸ່ມທຳນາຍ ບໍ່ໄດ້ໝາຍຄວາມວ່າຈະຖືກທຸກງວດ
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: BACKTEST ───────────────────────────────────────────────────── */}
      {mode === 'backtest' && (
        <BacktestPanel
          draws={filteredDraws}
          range={range}
          backtest={backtest}
          backtestNum={backtestNum}
          setBacktestNum={setBacktestNum}
        />
      )}

    </div>
  )
}
