import { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import { computeAnalytics, computeCombinedTop10, COMBINED_SIGNALS, LDATE, buildArticle, computeEnhancedPrediction, computeEnhancedBacktest, ENHANCED_SIGNALS } from '../utils/analytics'
import SEO from '../components/SEO'
import { webPageSchema, breadcrumbSchema } from '../components/schemas'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'

// computeAnalytics imported from '../utils/analytics'

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

// computeCombinedTop10 imported from '../utils/analytics'

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
// NEWS ARTICLE PANEL  (LDATE, buildArticle, COMBINED_SIGNALS from utils/analytics)
// ─────────────────────────────────────────────────────────────────────────────

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
            <p className="text-xs text-white/40">Weighted Composite: ຄວາມຖີ່ · ຊ້ານານ · Momentum · ສັນຍານ (4×25pts)</p>
          </div>
        </div>

        {/* Weight legend */}
        <div className="flex gap-2 flex-wrap mb-5">
          {COMBINED_SIGNALS.map(({ key, label, color }) => (
            <span key={key} className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
              style={{ background: color + '22', color, border: `1px solid ${color}44` }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
              {label} 25pts
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
                  {/* 4-signal mini bars */}
                  <div className="flex gap-1.5 flex-wrap">
                    {COMBINED_SIGNALS.map(({ key, label, color }) => (
                      <div key={key} className="flex items-center gap-1">
                        <span className="text-[9px] font-bold" style={{ color: color + 'aa' }}>{label}</span>
                        <div className="w-12 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(s[key] / 25) * 100}%`, background: color }} />
                        </div>
                        <span className="text-[9px] font-black" style={{ color }}>{s[key]}</span>
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

      {/* ── Signal breakdown grid (4 signals, no aiW) ──────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { ...COMBINED_SIGNALS[0], nums: analytics.hot.slice(0, 5) },
          { ...COMBINED_SIGNALS[1], nums: analytics.overdue.slice(0, 5) },
          { ...COMBINED_SIGNALS[2], nums: analytics.rising.slice(0, 5) },
          {
            ...COMBINED_SIGNALS[3],
            nums: analytics.decisionTop.filter(s => s.decisionScore === 3).slice(0, 5).length
              ? analytics.decisionTop.filter(s => s.decisionScore === 3).slice(0, 5)
              : analytics.decisionTop.slice(0, 5),
          },
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
// ENHANCED PREDICTION ENGINE PANEL
// ─────────────────────────────────────────────────────────────────────────────

function PredictionEnginePanel({ prediction, backtest, epTrials, setEpTrials }) {
  if (!prediction) return <div className="text-center py-20 text-white/50">ຂໍ້ມູນບໍ່ພໍ</div>

  const { top10, lastResult, nextDate, monthName, weekdayName, pairTopFollowers, n, base } = prediction

  const nextDateStr = nextDate
    ? `${nextDate.getDate()}/${nextDate.getMonth() + 1}/${nextDate.getFullYear()}`
    : '—'

  const maxTotal = top10[0]?.total ?? 1

  return (
    <div className="space-y-5">

      {/* ── Disclaimer ── */}
      <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/25 rounded-xl px-4 py-2.5 text-xs text-[#fbbf24] flex items-start gap-2">
        <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0">warning</span>
        ການທຳນາຍນີ້ອ້າງອີງຈາກສະຖິຕິ 8 ດ້ານ — ຫວຍລາວເປັນການສຸ່ມ ບໍ່ຮັບປະກັນຜົນ
      </div>

      {/* ── Context Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'ຜົນງວດຫຼ້າສຸດ',  val: lastResult ?? '—',   sub: 'ຜົນ 2 ຕົວ',           c: '#818cf8' },
          { label: 'ງວດຖັດໄປ',       val: nextDateStr,          sub: weekdayName ?? '',     c: '#22d3ee' },
          { label: 'ເດືອນ',           val: monthName ?? '—',     sub: 'ເດືອນ next draw',    c: '#a78bfa' },
          { label: 'ວິເຄາະຈາກ',       val: n,                    sub: 'ງວດ',                 c: '#6cf8bb' },
        ].map(({ label, val, sub, c }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-700/60 rounded-2xl px-4 py-3 text-center shadow-sm">
            <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: c + 'cc' }}>{label}</p>
            <p className="text-2xl font-black text-white font-mono">{val}</p>
            <p className="text-[9px] mt-0.5" style={{ color: c + '99' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Signal Legend ── */}
      <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-700/60 shadow-sm">
        <p className="text-xs font-black text-white/70 uppercase tracking-widest mb-3">ສັນຍານທຳນາຍ 8 ດ້ານ (100pts max)</p>
        <div className="flex gap-2 flex-wrap">
          {ENHANCED_SIGNALS.map(({ key, label, color, max, icon }) => (
            <div key={key} className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-full border"
              style={{ background: color + '18', color, borderColor: color + '40' }}>
              <span className="material-symbols-outlined text-[12px]">{icon}</span>
              {label}
              <span className="text-[9px] opacity-60">{max}pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Top 10 Predictions ── */}
      <div className="bg-zinc-950/95 backdrop-blur-2xl rounded-2xl p-6 border border-white/[0.09] shadow-2xl shadow-black/50">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-[22px]">auto_awesome</span>
          </div>
          <div>
            <h3 className="font-black text-white text-xl">Top 10 ເລກລວມຄວາມໜ້າຈະເປັນ</h3>
            <p className="text-xs text-white/40">8-Signal Composite · {n} ງວດ · ງວດຖັດໄປ {nextDateStr} ({weekdayName})</p>
          </div>
        </div>

        <div className="space-y-3">
          {top10.map((s, i) => (
            <div key={s.num}
              className={`rounded-2xl p-4 border transition-all
                ${i === 0 ? 'bg-[#6366f1]/15 border-[#6366f1]/40' :
                  i < 3  ? 'bg-[#a855f7]/10 border-[#a855f7]/25' :
                           'bg-white/[0.03] border-white/[0.06]'}`}
            >
              <div className="flex items-center gap-3 mb-2.5">
                {/* Rank badge */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0
                  ${i === 0 ? 'bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white' :
                    i === 1 ? 'bg-[#94a3b8] text-black' :
                    i === 2 ? 'bg-[#b45309] text-white' : 'bg-white/[0.08] text-white/40'}`}>
                  {i + 1}
                </div>

                {/* Number */}
                <span className={`font-black font-mono text-3xl shrink-0
                  ${i === 0 ? 'text-[#818cf8]' : i < 3 ? 'text-[#c4b5fd]' : 'text-white'}`}>
                  {s.num}
                </span>

                {/* Mirror display */}
                {s.mirror !== s.num && (
                  <span className="text-[10px] text-[#f472b6]/70 font-bold font-mono shrink-0">↔{s.mirror}</span>
                )}

                <div className="flex-1 min-w-0">
                  {/* Main probability bar */}
                  <div className="relative h-5 bg-white/[0.06] rounded-full overflow-hidden mb-1.5">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${s.probability}%`, background: 'linear-gradient(90deg,#6366f1,#a855f7,#f472b6)' }} />
                    <span className="absolute inset-0 flex items-center justify-end pr-2.5 text-[10px] font-black text-white">
                      {s.probability}%
                    </span>
                  </div>

                  {/* 8-signal mini bars */}
                  <div className="flex gap-1 flex-wrap">
                    {ENHANCED_SIGNALS.map(({ key, label, color, max }) => (
                      <div key={key} className="flex items-center gap-0.5">
                        <span className="text-[8px] font-bold hidden sm:block" style={{ color: color + '99' }}>{label}</span>
                        <div className="w-10 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(s[key] / max) * 100}%`, background: color }} />
                        </div>
                        <span className="text-[8px] font-black" style={{ color }}>{s[key]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meta badges */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                    ${s.decisionScore === 3 ? 'bg-[#f97316]/20 text-[#f97316]' :
                      s.decisionScore === 2 ? 'bg-[#818cf8]/20 text-[#818cf8]' :
                                              'bg-white/[0.05] text-white/30'}`}>
                    {'★'.repeat(s.decisionScore) + '☆'.repeat(3 - s.decisionScore)}
                  </span>
                  <span className={`text-[10px] font-bold ${s.momentum > 0 ? 'text-[#6cf8bb]' : 'text-[#f87171]'}`}>
                    {s.momentum > 0 ? '↑' : '↓'}{Math.abs(s.r10)}×/10
                  </span>
                  <span className="text-[9px] text-white/30">{s.total.toFixed(1)}pts</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Signal Breakdown Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

        {/* Monthly top numbers */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-700/60 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[15px] text-[#818cf8]">calendar_month</span>
            <p className="text-[11px] font-black text-white/80">ເດືອນ {monthName} ປີກ່ອນ</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {top10.filter(s => s.monthFreqCount > 0).slice(0, 6).map(s => (
              <span key={s.num} className="font-black font-mono text-sm px-2 py-1 rounded-lg bg-[#818cf8]/25 text-[#818cf8] border border-[#818cf8]/40">
                {s.num}<span className="text-[9px] ml-0.5 opacity-70">{s.monthFreqCount}x</span>
              </span>
            ))}
            {top10.filter(s => s.monthFreqCount > 0).length === 0 && (
              <p className="text-xs text-zinc-400">ຍັງບໍ່ມີ</p>
            )}
          </div>
        </div>

        {/* Weekday top numbers */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-700/60 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[15px] text-[#22d3ee]">today</span>
            <p className="text-[11px] font-black text-white/80">ວັນ{weekdayName} ປີກ່ອນ</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {top10.filter(s => s.dayFreqCount > 0).slice(0, 6).map(s => (
              <span key={s.num} className="font-black font-mono text-sm px-2 py-1 rounded-lg bg-[#22d3ee]/20 text-[#22d3ee] border border-[#22d3ee]/35">
                {s.num}<span className="text-[9px] ml-0.5 opacity-70">{s.dayFreqCount}x</span>
              </span>
            ))}
            {top10.filter(s => s.dayFreqCount > 0).length === 0 && (
              <p className="text-xs text-zinc-400">ຍັງບໍ່ມີ</p>
            )}
          </div>
        </div>

        {/* Pair continuation */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-700/60 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[15px] text-[#a78bfa]">link</span>
            <p className="text-[11px] font-black text-white/80">ຕໍ່ຈາກ {lastResult ?? '—'}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {pairTopFollowers.filter(p => p.cnt > 0).map(p => (
              <span key={p.num} className="font-black font-mono text-sm px-2 py-1 rounded-lg bg-[#a78bfa]/20 text-[#a78bfa] border border-[#a78bfa]/35">
                {p.num}<span className="text-[9px] ml-0.5 opacity-70">{p.cnt}x</span>
              </span>
            ))}
            {pairTopFollowers.filter(p => p.cnt > 0).length === 0 && (
              <p className="text-xs text-zinc-400">ຍັງບໍ່ມີ pair data</p>
            )}
          </div>
        </div>

        {/* Mirror pairs */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-700/60 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[15px] text-[#f472b6]">sync_alt</span>
            <p className="text-[11px] font-black text-white/80">ເລກສະລັບ (Mirror)</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {top10.filter(s => s.mirrorW > 0 && s.mirror !== s.num).slice(0, 5).map(s => (
              <span key={s.num} className="font-black font-mono text-sm px-2 py-1 rounded-lg bg-[#f472b6]/20 text-[#f472b6] border border-[#f472b6]/35">
                {s.num}↔{s.mirror}
              </span>
            ))}
            {top10.filter(s => s.mirrorW > 0 && s.mirror !== s.num).length === 0 && (
              <p className="text-xs text-zinc-400">ບໍ່ມີ mirror active</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Summary row ── */}
      <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-700/60 shadow-sm">
        <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-3">ສະຫຼຸບ 10 ເລກເດັ່ນ</p>
        <div className="flex flex-wrap gap-2">
          {top10.map((s, i) => (
            <div key={s.num} className={`flex flex-col items-center px-3 py-2 rounded-xl border
              ${i === 0 ? 'bg-[#6366f1]/20 border-[#6366f1]/50' :
                i < 3  ? 'bg-[#a855f7]/15 border-[#a855f7]/35' :
                         'bg-white/[0.05] border-white/[0.10]'}`}>
              <span className="text-[9px] text-white/30 font-bold">#{i + 1}</span>
              <span className={`font-black font-mono text-xl
                ${i === 0 ? 'text-[#818cf8]' : i < 3 ? 'text-[#c4b5fd]' : 'text-white'}`}>
                {s.num}
              </span>
              <span className="text-[9px] font-bold text-white/40">{s.probability}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Enhanced Backtest ── */}
      <div className="bg-zinc-950/95 backdrop-blur-2xl rounded-2xl p-6 border border-white/[0.09] shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">verified</span>
            </div>
            <div>
              <h3 className="font-black text-white text-base">Decision Score Accuracy Backtest</h3>
              <p className="text-xs text-white/40">ທົດສອບ 8-Signal Engine ກັບຂໍ້ມູນຍ້ອນຫຼັງ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">ງວດທົດສອບ:</span>
            {[10, 21, 30, 50].map(v => (
              <button key={v}
                onClick={() => setEpTrials(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                  ${epTrials === v ? 'bg-[#6366f1] text-white' : 'bg-white/[0.08] text-white/50 hover:text-white'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {!backtest && (
          <p className="text-center text-white/30 py-8">ຂໍ້ມູນຍ້ອນຫຼັງບໍ່ພໍ — ຕ້ອງການ {epTrials + 5}+ ງວດ</p>
        )}

        {backtest && (
          <>
            {/* Accuracy KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Top-1 ຖືກ',  val: backtest.hits1,   pct: backtest.trials, c: '#fbbf24', icon: 'star' },
                { label: 'Top-5 ຖືກ',  val: backtest.hits5,   pct: backtest.trials, c: '#6cf8bb', icon: 'check_circle' },
                { label: 'Top-10 ຖືກ', val: backtest.hits10,  pct: backtest.trials, c: '#818cf8', icon: 'done_all' },
                { label: 'ງວດທົດສອບ',  val: backtest.trials,  pct: null,            c: '#94a3b8', icon: 'science' },
              ].map(({ label, val, pct, c, icon }) => (
                <div key={label} className="bg-zinc-800/80 rounded-xl p-4 border border-zinc-700/60 text-center">
                  <span className="material-symbols-outlined text-[16px] mb-1 block" style={{ color: c }}>{icon}</span>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: c + 'aa' }}>{label}</p>
                  <p className="text-2xl font-black text-white">{val}</p>
                  {pct !== null && (
                    <p className="text-[10px] mt-0.5" style={{ color: c + '80' }}>
                      {(val / pct * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Result table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    {['ງວດ','ວັນທີ','ຜົນຈິງ','ທຳນາຍ #1','ໃນ Top5','ໃນ Top10','Rank'].map(h => (
                      <th key={h} className="text-left py-2 px-2 text-white/30 font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {backtest.results.map((r, i) => (
                    <tr key={i} className={`border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]
                      ${r.hit1 ? 'bg-[#fbbf24]/5' : r.hit5 ? 'bg-[#6cf8bb]/5' : r.hit10 ? 'bg-[#818cf8]/5' : ''}`}>
                      <td className="py-2 px-2 font-bold text-white/60">#{r.drawNum}</td>
                      <td className="py-2 px-2 text-white/40">{r.date?.slice(0, 10)}</td>
                      <td className="py-2 px-2 font-black font-mono text-white text-base">{r.actual}</td>
                      <td className="py-2 px-2">
                        <span className={`font-black font-mono text-base ${r.hit1 ? 'text-[#fbbf24]' : 'text-white/50'}`}>
                          {r.top1}
                          {r.hit1 && <span className="material-symbols-outlined text-[12px] ml-1 align-middle text-[#fbbf24]">star</span>}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        {r.hit5
                          ? <span className="material-symbols-outlined text-[14px] text-[#6cf8bb]">check_circle</span>
                          : <span className="text-white/15">—</span>}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {r.hit10
                          ? <span className="material-symbols-outlined text-[14px] text-[#818cf8]">done_all</span>
                          : <span className="text-white/15">—</span>}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {r.actualRank
                          ? <span className={`font-black text-xs px-1.5 py-0.5 rounded-md
                              ${r.actualRank === 1 ? 'bg-[#fbbf24]/20 text-[#fbbf24]' :
                                r.actualRank <= 5  ? 'bg-[#6cf8bb]/20 text-[#6cf8bb]' :
                                                     'bg-[#818cf8]/20 text-[#818cf8]'}`}>
                              #{r.actualRank}
                            </span>
                          : <span className="text-white/15">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-[10px] text-white/25 flex items-start gap-1.5">
              <span className="material-symbols-outlined text-[12px] mt-px shrink-0">info</span>
              Backtest ວິ່ງ {ENHANCED_SIGNALS.length} signals engine ຕໍ່ {backtest.trials} ງວດ — ໂດຍໃຊ້ຂໍ້ມູນກ່ອນງວດນັ້ນເທົ່ານັ້ນ (no leakage)
            </p>
          </>
        )}
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN SYSTEM — DEEP SPACE COMMAND TERMINAL
// ─────────────────────────────────────────────────────────────────────────────

const MODE_META = {
  heatmap:    { color: '#ef4444', label: 'Heatmap',     desc: 'Frequency Grid 00–99', icon: 'grid_view',    group: 'ວິເຄາະ' },
  charts:     { color: '#818cf8', label: 'Charts',       desc: 'Time-Series Chart',    icon: 'show_chart',   group: 'ວິເຄາະ' },
  trend:      { color: '#4ade80', label: 'Trend',        desc: 'Rising / Falling',     icon: 'trending_up',  group: 'ວິເຄາະ' },
  ai:         { color: '#22d3ee', label: 'AI Engine',    desc: '3-Signal Score',       icon: 'psychology',   group: 'AI' },
  decision:   { color: '#fbbf24', label: 'ຕັດສິນໃຈ',     desc: '★★★ Signals',          icon: 'stars',        group: 'AI' },
  predict:    { color: '#a78bfa', label: 'ທຳນາຍ',        desc: '8-Signal Predict',     icon: 'auto_awesome', group: 'AI' },
  news:       { color: '#fb923c', label: 'ຂ່າວ AI',       desc: 'Auto News Report',     icon: 'newspaper',    group: 'ທົດສອບ' },
  dsbacktest: { color: '#6cf8bb', label: 'DS Backtest',  desc: 'Decision Accuracy',    icon: 'verified',     group: 'ທົດສອບ' },
  backtest:   { color: '#f472b6', label: 'Backtest',      desc: 'Number Simulation',    icon: 'science',      group: 'ທົດສອບ' },
}

const MODE_GROUPS = [
  { id: 'analysis', label: 'ວິເຄາະ', modes: ['heatmap', 'charts', 'trend'] },
  { id: 'ai',       label: 'AI',      modes: ['ai', 'decision', 'predict'] },
  { id: 'test',     label: 'ທົດສອບ',  modes: ['news', 'dsbacktest', 'backtest'] },
]

function ModeNav({ mode, setMode }) {
  return (
    <div className="overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div className="flex items-start gap-0 min-w-max">
        {MODE_GROUPS.map((group, gi) => (
          <div key={group.id} className="flex items-start">
            {/* Group */}
            <div className="flex flex-col gap-1.5 px-3 first:pl-0">
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30 font-jakarta px-1">
                {group.label}
              </span>
              <div className="flex gap-1">
                {group.modes.map(m => {
                  const meta = MODE_META[m]
                  const isActive = mode === m
                  return (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold font-jakarta whitespace-nowrap transition-all duration-200"
                      style={isActive ? {
                        background: meta.color + '20',
                        color: meta.color,
                        border: `1px solid ${meta.color}50`,
                        boxShadow: `0 0 16px ${meta.color}22, inset 0 1px 0 rgba(255,255,255,0.05)`,
                      } : {
                        background: 'rgba(255,255,255,0.025)',
                        color: 'rgba(255,255,255,0.32)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <span className="material-symbols-outlined text-[13px]">{meta.icon}</span>
                      {meta.label}
                      {/* Active bottom dot */}
                      {isActive && (
                        <span
                          className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                          style={{ background: meta.color }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
            {/* Separator between groups */}
            {gi < MODE_GROUPS.length - 1 && (
              <div
                className="self-stretch w-px mx-1 mt-5 mb-0.5 rounded-full opacity-20"
                style={{ background: 'rgba(255,255,255,0.4)' }}
              />
            )}
          </div>
        ))}
      </div>
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
  const [epTrials, setEpTrials] = useState(21)
  const [selectedType, setSelectedType] = useState('all')


  const filteredDraws = useMemo(() => (
    selectedType === 'all' ? draws : draws?.filter(d => String(d.type_id) === selectedType)
  ), [draws, selectedType])

  const analytics          = useMemo(() => computeAnalytics(filteredDraws, range), [filteredDraws, range])
  const backtest           = useMemo(() => computeBacktest(filteredDraws, range, backtestNum), [filteredDraws, range, backtestNum])
  const aiBacktest         = useMemo(() => computeAIBacktest(filteredDraws, aiTrials), [filteredDraws, aiTrials])
  const dsBacktest         = useMemo(() => computeDecisionBacktest(filteredDraws, dsTrials), [filteredDraws, dsTrials])
  const enhancedPrediction = useMemo(() => computeEnhancedPrediction(filteredDraws, range), [filteredDraws, range])
  const enhancedBacktest   = useMemo(() => computeEnhancedBacktest(filteredDraws, epTrials), [filteredDraws, epTrials])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 rounded-full border-[1.5px] border-[#22d3ee]/20 border-t-[#22d3ee] animate-spin" />
    </div>
  )
  if (!analytics) return <div className="text-center py-20 text-white/30 text-sm">ບໍ່ມີຂໍ້ມູນ</div>

  const { n, scores, series, freqBars, hot, cold, aiTop, rising, falling, overdue, decisionTop } = analytics
  const meta   = MODE_META[mode]
  const topHot = hot?.[0]?.num ?? ''

  return (
    <div className="space-y-5">
      <style>{`
        @keyframes ap-scan {
          0%   { transform: translateY(-100%); opacity: 0; }
          10%  { opacity: 0.35; }
          90%  { opacity: 0.35; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .ap-scan-line { animation: ap-scan 7s linear infinite; }
        @keyframes ap-dot-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50%       { transform: scale(1.15); opacity: 1; }
        }
        .ap-dot-pulse { animation: ap-dot-pulse 2.5s ease-in-out infinite; }
      `}</style>

      <SEO
        title={`AI Analytics ວິເຄາະຫວຍລາວ ${n} ງວດ | วิเคราะห์หวยลาว AI เลขเด็ดวันนี้`}
        description={`ລະບົບວິເຄາະ Big Data ຫວຍລາວ ${n} ງວດ. Heatmap, Trend, Gap Analysis, AI Score, Backtest | วิเคราะห์ Big Data หวยลาว ${n} งวด`}
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

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div className="relative rounded-[2rem] overflow-hidden border border-white/[0.07] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)]">
        <div className="absolute inset-0" style={{ background: '#06091a' }} />
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{ background: `radial-gradient(ellipse 70% 80% at 90% 10%, ${meta.color}18, transparent 65%)` }}
        />
        <div className="absolute inset-0 bg-grid-glow bg-repeat opacity-30" />
        <div className="absolute inset-x-0 top-0 h-[2px] ap-scan-line pointer-events-none"
          style={{ background: `linear-gradient(90deg,transparent 0%,${meta.color}60 40%,${meta.color}90 50%,${meta.color}60 60%,transparent 100%)` }} />
        <div className="absolute right-4 bottom-0 text-[9rem] sm:text-[13rem] font-jakarta font-black text-white/[0.025] leading-none select-none pointer-events-none">
          BIG DATA
        </div>

        <div className="relative z-10 px-6 sm:px-12 py-10 sm:py-12">
          <div className="flex flex-col lg:flex-row lg:items-start gap-8">
            <div className="flex-1 min-w-0">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 border font-jakarta"
                style={{
                  background: `${meta.color}10`,
                  borderColor: `${meta.color}32`,
                  boxShadow: `0 0 24px ${meta.color}14, inset 0 1px 0 rgba(255,255,255,0.04)`,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full ap-dot-pulse" style={{ background: meta.color }} />
                <span className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: meta.color }}>
                  Deep Space Analytics
                </span>
                <span className="w-px h-3 opacity-25" style={{ background: meta.color }} />
                <span className="text-[10px] font-bold opacity-50" style={{ color: meta.color }}>
                  {n} ງວດ
                </span>
              </div>

              <h1
                className="font-black text-white leading-[1.1] mb-2 font-jakarta"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}
              >
                Analytics{' '}
                <span className="transition-colors duration-500" style={{ color: meta.color }}>Dashboard</span>
              </h1>

              {/* Lao subtitle */}
              <p className="text-white/40 text-sm leading-relaxed mb-5">
                ວິເຄາະສະຖິຕິຫວຍລາວ — Heatmap · Trend · AI Score · Backtest
              </p>

              {/* Mode pill + desc */}
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
                  style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}>
                  <span className="material-symbols-outlined text-[14px]" style={{ color: meta.color }}>{meta.icon}</span>
                  <span className="text-xs font-black" style={{ color: meta.color }}>{meta.label}</span>
                </div>
                <span className="text-white/25 text-xs">·</span>
                <span className="text-white/40 text-xs">{meta.desc}</span>
                {selectedType !== 'all' && types && (() => {
                  const t = types.find(x => String(x.type_id) === selectedType)
                  return t ? <span className="text-xs font-bold" style={{ color: meta.color }}>· {t.type_name}</span> : null
                })()}
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-0.5 p-0.5 rounded-xl border border-white/[0.08]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {RANGE_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setRange(value)}
                      className="px-3 py-1.5 rounded-[10px] text-[11px] font-black transition-all duration-200"
                      style={range === value
                        ? { background: meta.color, color: '#06091a' }
                        : { color: 'rgba(255,255,255,0.35)' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {types && types.length > 1 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <button
                      onClick={() => setSelectedType('all')}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all"
                      style={selectedType === 'all'
                        ? { background: `${meta.color}20`, color: meta.color, borderColor: `${meta.color}40` }
                        : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.35)', borderColor: 'rgba(255,255,255,0.08)' }}
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
                          className="px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all"
                          style={active
                            ? { background: color, color: '#fff', borderColor: color, boxShadow: `0 2px 8px ${color}40` }
                            : { background: 'rgba(255,255,255,0.03)', color: `${color}cc`, borderColor: `${color}35` }}
                        >
                          {t.type_name} ({cnt})
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-2.5 shrink-0">
              {[
                { label: 'ງວດທີ່ວິເຄາະ', val: n,                    sub: 'draws',                    c: '#818cf8' },
                { label: 'Hot #1',        val: hot[0]?.num ?? '—',   sub: `${hot[0]?.freq ?? 0}x`,   c: '#ef4444' },
                { label: 'ຊ້ານານ',        val: cold[0]?.num ?? '—',  sub: `${cold[0]?.gap ?? 0} ງ`, c: '#fbbf24' },
                { label: 'AI Pick',       val: aiTop[0]?.num ?? '—', sub: `${aiTop[0]?.aiScore ?? 0}pts`, c: '#22d3ee' },
              ].map(({ label, val, sub, c }) => (
                <div key={label} className="relative overflow-hidden backdrop-blur-xl rounded-2xl p-4 text-center transition-all duration-300 group"
                  style={{ background: `${c}08`, border: `1px solid ${c}20` }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `radial-gradient(circle at center,${c}12,transparent 70%)` }} />
                  <p className="text-[9px] font-black uppercase tracking-widest mb-1.5 relative" style={{ color: `${c}aa` }}>{label}</p>
                  <p className="text-2xl font-black text-white font-space tracking-tight relative">{val}</p>
                  <p className="text-[9px] mt-0.5 relative" style={{ color: `${c}70` }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODE NAV ─────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden border border-white/[0.07]" style={{ background: '#0a0e1f' }}>
        {/* Color-reactive top accent */}
        <div
          className="h-[2px] transition-all duration-500"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${meta.color}70 30%, ${meta.color}95 50%, ${meta.color}70 70%, transparent 100%)` }}
        />
        <div className="px-4 py-3.5">
          <ModeNav mode={mode} setMode={setMode} />
        </div>
      </div>

      {/* ── HEATMAP ──────────────────────────────────────────────────────────── */}
      {mode === 'heatmap' && (
        <div className="space-y-5">
          <div className="rounded-2xl p-6 border border-white/[0.08]" style={{ background: '#080c1c' }}>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h3 className="font-black text-white text-lg font-jakarta">Frequency Heatmap 00–99</h3>
                <p className="text-xs text-white/35 mt-0.5">Hover ເພື່ອເບິ່ງລາຍລະອຽດ · ສີແດງ = ອອກຫຼາຍ · ສີນ້ຳເງິນ = ອອກໜ້ອຍ</p>
              </div>
              <div className="flex gap-1.5">
                {[{ v: 'freq', label: 'ຄວາມຖີ່' }, { v: 'overdue', label: 'Overdue' }].map(({ v, label }) => (
                  <button key={v} onClick={() => setHeatMode(v)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={heatMode === v
                      ? { background: '#ef444430', color: '#ef4444', border: '1px solid #ef444455' }
                      : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`mb-4 transition-all duration-200 ${hoveredNum ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {(() => {
                const s = scores.find(x => x.num === hoveredNum)
                if (!s) return null
                return (
                  <div className="p-3 rounded-xl border border-[#22d3ee]/20 flex items-center gap-5 flex-wrap text-sm"
                    style={{ background: 'rgba(34,211,238,0.06)' }}>
                    <span className="text-3xl font-black text-[#22d3ee] font-mono w-12">{s.num}</span>
                    <span className="text-white/40">ອອກ <b className="text-white">{s.freq}</b> ຄັ້ງ ({s.pct}%)</span>
                    <span className="text-white/40">ຫ່າງ <b className="text-white">{s.gap}</b> ງວດ</span>
                    <span className="text-white/40">Avg Gap <b className="text-white">{s.avgGap}</b></span>
                    <span className="text-white/40">Overdue <b className={s.overdue >= 2 ? 'text-[#ef4444]' : s.overdue >= 1.5 ? 'text-[#f97316]' : 'text-white'}>{s.overdue}x</b></span>
                    <span className="text-white/40">AI <b className="text-[#22d3ee]">{s.aiScore}</b></span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.momentum > 0 ? 'bg-[#4ade80]/15 text-[#4ade80]' : 'bg-[#f87171]/15 text-[#f87171]'}`}>
                      {s.momentum > 0 ? '↑ Rising' : '↓ Falling'}
                    </span>
                  </div>
                )
              })()}
            </div>

            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 100 }, (_, i) => {
                const num = i.toString().padStart(2, '0')
                const s = scores.find(x => x.num === num)
                const intensity = heatMode === 'freq' ? (s?.heatIntensity ?? 0) : Math.min((s?.overdue ?? 0) / 4, 1)
                const isHovered = hoveredNum === num
                return (
                  <div key={num}
                    onMouseEnter={() => setHoveredNum(num)}
                    onMouseLeave={() => setHoveredNum(null)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-150 select-none
                      ${isHovered ? 'scale-125 z-10 shadow-lg ring-2 ring-white/40' : 'hover:scale-110 hover:z-10'}`}
                    style={{ background: heatBg(intensity) }}>
                    <span className="text-[11px] font-black text-white leading-none">{num}</span>
                    {s?.freq > 0 && <span className="text-[7px] text-white/60 leading-none mt-0.5">{s.freq}</span>}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-2 mt-5 justify-end">
              <span className="text-[10px] text-white/30">ໜ້ອຍ</span>
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((t, i) => (
                <div key={i} className="w-7 h-3.5 rounded" style={{ background: heatBg(t) }} />
              ))}
              <span className="text-[10px] text-white/30">ຫຼາຍ</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <RankTable title="🔥 Top 10 ເລກ Hot" accent="#ef4444" data={hot}  field="freq" unit="ຄັ້ງ" />
            <RankTable title="🧊 Top 10 ເລກ Cold" accent="#60a5fa" data={cold} field="gap"  unit="ງວດ" />
          </div>
        </div>
      )}

      {/* ── CHARTS ───────────────────────────────────────────────────────────── */}
      {mode === 'charts' && (
        <div className="space-y-5">
          <div className="rounded-2xl p-6 border border-white/[0.08]" style={{ background: '#080c1c' }}>
            <h3 className="font-black text-white text-lg mb-1 font-jakarta">Time-Series: ຕົວເລກ 2 ໂຕ ຕາມງວດ</h3>
            <p className="text-xs text-white/35 mb-5">ແກນ Y = ຕົວເລກ 00–99 · ສະແດງ {series.length} ງວດລ່າສຸດ</p>
            <ResponsiveContainer width="100%" height={290}>
              <LineChart data={series} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(43,58,84,0.5)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
                <YAxis domain={[0, 99]} tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} />
                <ReferenceLine y={49} stroke="#1e2d4a" strokeDasharray="4 4" label={{ value: '50', fill: '#334155', fontSize: 9 }} />
                <Line type="monotone" dataKey="val" stroke="#818cf8" strokeWidth={2}
                  dot={{ fill: '#818cf8', r: 2.5, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#22d3ee', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl p-6 border border-white/[0.08]" style={{ background: '#080c1c' }}>
            <h3 className="font-black text-white text-lg mb-5 font-jakarta">Top 20 ຄວາມຖີ່</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={freqBars} margin={{ top: 0, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(43,58,84,0.5)" vertical={false} />
                <XAxis dataKey="num" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<FreqTip />} />
                <Bar dataKey="freq" radius={[4, 4, 0, 0]}>
                  {freqBars.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#fbbf24' : i < 3 ? '#ef4444' : i < 8 ? '#f97316' : '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── TREND ────────────────────────────────────────────────────────────── */}
      {mode === 'trend' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TrendList title="📈 ກຳລັງຂຶ້ນ (Rising)" accent="#4ade80" data={rising}  field="momentum" fieldLabel="r10" />
            <TrendList title="📉 ກຳລັງລົງ (Falling)"  accent="#f87171" data={falling} field="momentum" fieldLabel="r10" />
          </div>

          <div className="rounded-2xl p-6 border border-white/[0.08]" style={{ background: '#080c1c' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)' }}>
                <span className="material-symbols-outlined text-white text-[18px]">hourglass_top</span>
              </div>
              <div>
                <h3 className="font-black text-white font-jakarta">ເລກທີ່ຊ້ານານ (Overdue Numbers)</h3>
                <p className="text-xs text-white/35">Overdue ≥ 1.0× = ເກີນຄ່າສະເລ່ຍ — ສູງ = ຄາດວ່າຈະອອກ</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {overdue.map((s, i) => (
                <div key={s.num} className="flex items-center gap-3">
                  <span className="text-[10px] text-white/30 w-5 text-right">{i + 1}</span>
                  <span className="font-black font-mono text-white rounded-lg px-3 py-1.5 text-sm w-12 text-center"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>{s.num}</span>
                  <div className="flex-1 relative h-7 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(s.overdue / 5, 1) * 100}%`,
                        background: s.overdue >= 3 ? 'linear-gradient(90deg,#dc2626,#ef4444)'
                          : s.overdue >= 2 ? 'linear-gradient(90deg,#d97706,#f59e0b)'
                          : 'linear-gradient(90deg,#0369a1,#22d3ee)'
                      }} />
                    <span className="absolute inset-0 flex items-center px-3 text-[11px] font-bold text-white/80">
                      {s.overdue}× overdue — ຫ່າງ {s.gap} ງວດ (avg {s.avgGap})
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0
                    ${s.overdue >= 3 ? 'bg-[#ef4444]/15 text-[#f87171]' : s.overdue >= 2 ? 'bg-[#f59e0b]/15 text-[#fbbf24]' : 'bg-[#22d3ee]/15 text-[#22d3ee]'}`}>
                    {s.freq}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── AI ENGINE ────────────────────────────────────────────────────────── */}
      {mode === 'ai' && (
        <div className="space-y-5">
          <div className="rounded-2xl p-6 border border-white/[0.09]" style={{ background: '#06091a' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg,#22d3ee,#818cf8)' }}>
                <span className="material-symbols-outlined text-white text-[22px]">psychology</span>
              </div>
              <div>
                <h3 className="font-black text-white text-xl font-jakarta">AI Prediction Engine</h3>
                <p className="text-xs text-white/35">Composite score: Frequency + Gap + Momentum</p>
              </div>
            </div>
            <div className="rounded-xl px-4 py-2.5 mb-6 text-xs text-[#fbbf24] flex items-start gap-2"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.20)' }}>
              <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0">warning</span>
              ຫວຍລາວເປັນການສຸ່ມ — AI Score ເປັນພຽງການວິເຄາະສະຖິຕິ ບໍ່ຮັບປະກັນການອອກລາງວັນ
            </div>
            <div className="space-y-3.5">
              {aiTop.map((s, i) => (
                <div key={s.num} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0
                    ${i === 0 ? 'bg-[#fbbf24] text-black' : i === 1 ? 'bg-[#94a3b8] text-black' : i === 2 ? 'bg-[#b45309] text-white' : 'bg-white/[0.06] text-white/30'}`}>
                    {i + 1}
                  </div>
                  <span className="font-black text-white text-2xl font-mono w-12 shrink-0">{s.num}</span>
                  <div className="flex-1 min-w-0">
                    <div className="relative h-5 rounded-full overflow-hidden mb-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${s.aiScore}%`, background: 'linear-gradient(90deg,#22d3ee,#818cf8)' }} />
                      <span className="absolute inset-0 flex items-center justify-end pr-2.5 text-[10px] font-black text-white">
                        {s.aiScore} pts
                      </span>
                    </div>
                    <div className="flex gap-3 text-[10px] text-white/30">
                      <span>Freq <span className="text-white/50">{s.freq}× ({s.pct}%)</span></span>
                      <span>Gap <span className="text-white/50">{s.gap}/{s.avgGap}</span></span>
                      <span>10ງ <span className="text-white/50">{s.r10}×</span></span>
                      <span className={s.momentum > 0 ? 'text-[#4ade80]' : 'text-[#f87171]'}>
                        {s.momentum > 0 ? '↑' : '↓'} momentum
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0
                    ${s.aiScore >= 60 ? 'bg-[#22d3ee]/12 text-[#22d3ee]' : s.aiScore >= 40 ? 'bg-[#fbbf24]/12 text-[#fbbf24]' : 'bg-white/[0.04] text-white/40'}`}>
                    {s.aiScore >= 60 ? 'HIGH' : s.aiScore >= 40 ? 'MID' : 'LOW'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-6 border border-white/[0.08]" style={{ background: '#080c1c' }}>
            <h3 className="font-black text-white mb-5 font-jakarta">ສູດຄຳນວນ AI Score</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: 'Frequency Score', weight: '35 pts', icon: 'equalizer',  color: '#818cf8', desc: '(ຈຳນວນຄັ້ງ / max) × 35 — ອອກຫຼາຍ = ຄະແນນສູງ' },
                { name: 'Gap Score',       weight: '35 pts', icon: 'timer',       color: '#fbbf24', desc: '(Overdue ÷ 3) × 35 — ຊ້ານານ = ຄາດອອກ' },
                { name: 'Momentum',        weight: '30 pts', icon: 'trending_up', color: '#4ade80', desc: '(Rate 10ງວດ vs 30ງວດ) × 30 — ຂຶ້ນໃຫ້ຫຼາຍ' },
              ].map(({ name, weight, icon, color, desc }) => (
                <div key={name} className="rounded-2xl p-5 border border-white/[0.06]" style={{ background: `${color}08` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[20px]" style={{ color }}>{icon}</span>
                    <span className="font-black text-white text-sm">{name}</span>
                  </div>
                  <p className="text-3xl font-black mb-2" style={{ color }}>{weight}</p>
                  <p className="text-xs text-white/35 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-6 border border-white/[0.09]" style={{ background: '#06091a' }}>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg,#fbbf24,#f97316)' }}>
                  <span className="material-symbols-outlined text-white text-[20px]">fact_check</span>
                </div>
                <div>
                  <h3 className="font-black text-white text-lg font-jakarta">AI Accuracy Backtest</h3>
                  <p className="text-xs text-white/35">ຖ້າຊື້ຕາມ AI ຍ້ອນຫຼັງ — ຈະຖືກຈັກຄັ້ງ?</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {[10, 20, 30, 50].map(t => (
                  <button key={t} onClick={() => setAiTrials(t)}
                    className="px-3 py-1.5 rounded-xl text-xs font-black transition-all"
                    style={aiTrials === t ? { background: '#fbbf24', color: '#000' } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.40)' }}>
                    {t} ຄັ້ງ
                  </button>
                ))}
              </div>
            </div>

            {!aiBacktest ? (
              <p className="text-white/25 text-sm text-center py-8">ຂໍ້ມູນບໍ່ພໍ</p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Top 1 ຖືກ',  hits: aiBacktest.hits1,  color: '#fbbf24', sublabel: 'ເລກດຽວ' },
                    { label: 'Top 5 ຖືກ',  hits: aiBacktest.hits5,  color: '#818cf8', sublabel: 'ໃນ 5 ເລກ' },
                    { label: 'Top 10 ຖືກ', hits: aiBacktest.hits10, color: '#22d3ee', sublabel: 'ໃນ 10 ເລກ' },
                  ].map(({ label, hits, color, sublabel }) => {
                    const pct = Math.round((hits / aiBacktest.trials) * 100)
                    return (
                      <div key={label} className="rounded-2xl p-4 border text-center"
                        style={{ background: `${color}06`, borderColor: `${color}20` }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: color + 'aa' }}>{label}</p>
                        <p className="text-4xl font-black" style={{ color }}>
                          {hits}<span className="text-xl text-white/25">/{aiBacktest.trials}</span>
                        </p>
                        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                        </div>
                        <p className="text-[11px] mt-1.5 font-bold" style={{ color }}>{pct}% · {sublabel}</p>
                      </div>
                    )
                  })}
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">ລາຍລະອຽດແຕ່ລະງວດ</p>
                  {aiBacktest.results.map((r, i) => (
                    <div key={i} className={`flex flex-col gap-2 rounded-xl px-3 py-2.5 border
                      ${r.hit1 ? 'bg-[#fbbf24]/08 border-[#fbbf24]/20' : r.hit5 ? 'bg-[#818cf8]/08 border-[#818cf8]/15' : r.hit10 ? 'bg-[#22d3ee]/08 border-[#22d3ee]/12' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-white/25 w-4 shrink-0">{i + 1}</span>
                        <span className="text-[10px] font-bold text-white/25 shrink-0">#{r.drawNum}</span>
                        <span className="text-[10px] text-white/25 shrink-0">{r.date?.slice(0, 10)}</span>
                        <div className="flex-1" />
                        <span className="font-black font-mono text-base text-white shrink-0">{r.actual}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0
                          ${r.hit1 ? 'bg-[#fbbf24]/15 text-[#fbbf24]' : r.hit5 ? 'bg-[#818cf8]/15 text-[#818cf8]' : r.hit10 ? 'bg-[#22d3ee]/15 text-[#22d3ee]' : 'bg-white/[0.04] text-white/25'}`}>
                          {r.hit1 ? '✓ #1' : r.hit5 ? '✓ Top5' : r.hit10 ? '✓ Top10' : '✗ Miss'}
                        </span>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {r.top10.map((num, j) => (
                          <span key={j} className={`font-black font-mono text-[11px] px-1.5 py-0.5 rounded-md
                            ${num === r.actual ? 'bg-[#fbbf24] text-black' : j === 0 ? 'bg-[#22d3ee]/12 text-[#22d3ee]' : 'bg-white/[0.04] text-white/25'}`}>
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

      {/* ── DECISION ─────────────────────────────────────────────────────────── */}
      {mode === 'decision' && (
        <div className="rounded-2xl p-5 border border-white/[0.09] space-y-5" style={{ background: '#06091a' }}>
          <div className="rounded-2xl p-6 border border-white/[0.09]" style={{ background: 'rgba(0,0,0,0.40)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg,#fbbf24,#f97316)' }}>
                <span className="material-symbols-outlined text-white text-[22px]">stars</span>
              </div>
              <div>
                <h3 className="font-black text-white text-xl font-jakarta">Decision Score</h3>
                <p className="text-xs text-white/35">ນັບ Signal ທີ່ຜ່ານ — ★★★ = ສັນຍານທຸກຢ່າງຊ້ອນກັນ</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { sig: '★ Signal 1', label: 'Overdue ≥ 1.0×', desc: 'ຊ້ານານກວ່າສະເລ່ຍ',   color: '#fbbf24' },
                { sig: '★ Signal 2', label: 'Momentum ↑',      desc: 'ອອກ 10 ງວດ > 30 ງວດ', color: '#4ade80' },
                { sig: '★ Signal 3', label: 'AI Score ≥ 60',   desc: 'Composite score HIGH', color: '#818cf8' },
              ].map(({ sig, label, desc, color }) => (
                <div key={sig} className="rounded-xl p-3 border border-white/[0.08]" style={{ background: `${color}08` }}>
                  <p className="text-[10px] font-black mb-1" style={{ color }}>{sig}</p>
                  <p className="text-sm font-black text-white">{label}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            {[
              { stars: 3, label: '★★★ ສັນຍານຄົບ 3', color: '#fbbf24', badge: 'ຊື້ໄດ້' },
              { stars: 2, label: '★★☆ ສັນຍານ 2/3',   color: '#818cf8', badge: 'ເຝົ້າລໍ' },
              { stars: 1, label: '★☆☆ ສັນຍານ 1/3',   color: 'rgba(255,255,255,0.4)', badge: 'ອ່ອນ' },
            ].map(({ stars, label, color, badge }) => (
              <div key={stars} className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold"
                style={{ background: `rgba(255,255,255,0.04)`, borderColor: `rgba(255,255,255,0.10)`, color }}>
                <span>{label}</span>
                <span className="text-[10px] opacity-60">— {badge}</span>
              </div>
            ))}
          </div>

          {decisionTop.length === 0 ? (
            <p className="text-center text-white/25 py-10">ບໍ່ມີຕົວເລກທີ່ຜ່ານ signal ໃດ</p>
          ) : (
            <div className="space-y-2.5">
              {decisionTop.map((s, i) => {
                const is3 = s.decisionScore === 3
                const is2 = s.decisionScore === 2
                const accent = is3 ? '#fbbf24' : is2 ? '#818cf8' : 'rgba(255,255,255,0.25)'
                return (
                  <div key={s.num} className="rounded-2xl p-4 border flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap transition-all"
                    style={{ background: is3 ? '#fbbf2408' : is2 ? '#818cf808' : 'rgba(255,255,255,0.02)', borderColor: is3 ? '#fbbf2428' : is2 ? '#818cf818' : 'rgba(255,255,255,0.06)' }}>
                    <span className="text-[10px] text-white/25 w-4 shrink-0 text-right">{i + 1}</span>
                    <span className="font-black font-mono text-3xl w-14 text-center shrink-0" style={{ color: accent }}>{s.num}</span>
                    <div className="flex gap-1 shrink-0">
                      {[0,1,2].map(j => (
                        <span key={j} className="text-lg" style={{ color: j < s.decisionScore ? accent : 'rgba(255,255,255,0.08)' }}>★</span>
                      ))}
                    </div>
                    <div className="flex gap-1.5 flex-wrap flex-1">
                      {[
                        { ok: s.sig1, c: '#fbbf24', text: `Overdue ${s.overdue}×` },
                        { ok: s.sig2, c: '#4ade80', text: `${s.momentum > 0 ? '↑' : '↓'} Momentum ${s.r10}×/10` },
                        { ok: s.sig3, c: '#818cf8', text: `AI ${s.aiScore} pts` },
                      ].map(({ ok, c, text }) => (
                        <span key={text} className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                          style={ok ? { background: `${c}18`, borderColor: `${c}35`, color: c } : { background: 'transparent', borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.15)' }}>
                          {text}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-black px-3 py-1 rounded-full shrink-0"
                      style={is3 ? { background: '#fbbf24', color: '#000' } : is2 ? { background: '#818cf820', color: '#818cf8' } : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)' }}>
                      {is3 ? '✓ ຊື້ໄດ້' : is2 ? 'ເຝົ້າລໍ' : 'ອ່ອນ'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── NEWS ─────────────────────────────────────────────────────────────── */}
      {mode === 'news' && (
        <NewsPanel analytics={analytics} draws={filteredDraws} n={n} selectedType={selectedType} types={types} />
      )}

      {/* ── DS BACKTEST ──────────────────────────────────────────────────────── */}
      {mode === 'dsbacktest' && (
        <div className="rounded-2xl p-5 border border-white/[0.09] space-y-5" style={{ background: '#06091a' }}>
          <div className="rounded-2xl p-6 border border-white/[0.09]" style={{ background: 'rgba(0,0,0,0.40)' }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg,#6cf8bb,#818cf8)' }}>
                  <span className="material-symbols-outlined text-white text-[22px]">verified</span>
                </div>
                <div>
                  <h3 className="font-black text-white text-xl font-jakarta">DS Accuracy Backtest</h3>
                  <p className="text-xs text-white/35">★★★/★★/★ Decision Score ທຳນາຍຖືກຈັກ %?</p>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {[10, 21, 30, 50].map(t => (
                  <button key={t} onClick={() => setDsTrials(t)}
                    className="px-3 py-1.5 rounded-xl text-xs font-black transition-all"
                    style={dsTrials === t ? { background: '#6cf8bb', color: '#000' } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)' }}>
                    {t} ງວດ
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!dsBacktest ? (
            <p className="text-white/25 text-sm text-center py-8">ຂໍ້ມູນບໍ່ພໍ</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: '★★★ ຖືກ',     hits: dsBacktest.hitsStar3, color: '#fbbf24', sub: 'ສັນຍານຄົບ 3' },
                  { label: '★★☆ ຖືກ',    hits: dsBacktest.hitsStar2, color: '#818cf8', sub: 'ສັນຍານ 2/3' },
                  { label: '★☆☆ ຖືກ',    hits: dsBacktest.hitsStar1, color: '#94a3b8', sub: 'ສັນຍານ 1/3' },
                  { label: 'ຮວມຖືກ (any)', hits: dsBacktest.hitsAny,  color: '#6cf8bb', sub: 'ຢ່າງໜ້ອຍ 1 ★' },
                ].map(({ label, hits, color, sub }) => {
                  const pct = Math.round((hits / dsBacktest.trials) * 100)
                  return (
                    <div key={label} className="rounded-2xl p-4 border text-center"
                      style={{ background: `${color}06`, borderColor: `${color}20` }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: color + 'aa' }}>{label}</p>
                      <p className="text-4xl font-black" style={{ color }}>
                        {hits}<span className="text-xl text-white/25">/{dsBacktest.trials}</span>
                      </p>
                      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <p className="text-[11px] mt-1.5 font-bold" style={{ color }}>{pct}% · {sub}</p>
                    </div>
                  )
                })}
              </div>

              <div className="rounded-2xl p-5 border border-white/[0.07]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-4">ສັດສ່ວນຄວາມຖືກຕ້ອງ</p>
                <div className="space-y-3.5">
                  {[
                    { label: '★★★  ສັນຍານຄົບ', hits: dsBacktest.hitsStar3, color: '#fbbf24', total: dsBacktest.trials },
                    { label: '★★  ສັນຍານ 2/3',  hits: dsBacktest.hitsStar2, color: '#818cf8', total: dsBacktest.trials },
                    { label: '★  ສັນຍານ 1/3',   hits: dsBacktest.hitsStar1, color: '#94a3b8', total: dsBacktest.trials },
                    { label: 'ຮວມ (any)',         hits: dsBacktest.hitsAny,   color: '#6cf8bb', total: dsBacktest.trials },
                  ].map(({ label, hits, color, total }) => {
                    const pct = Math.round((hits / total) * 100)
                    return (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-white/35 w-40 shrink-0">{label}</span>
                        <div className="flex-1 h-5 rounded-full overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                          <span className="absolute inset-0 flex items-center px-3 text-[11px] font-black text-white/75">
                            {hits}/{total} ງວດ
                          </span>
                        </div>
                        <span className="text-sm font-black w-12 text-right shrink-0" style={{ color }}>{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-2xl p-5 border border-white/[0.07]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-4">
                  ລາຍລະອຽດ {dsBacktest.results.length} ງວດ
                </p>
                <div className="space-y-2">
                  {dsBacktest.results.map((r, i) => {
                    const tier = r.hitStar3 ? 3 : r.hitStar2 ? 2 : r.hitStar1 ? 1 : 0
                    const rowColor = tier === 3 ? '#fbbf24' : tier === 2 ? '#818cf8' : tier === 1 ? '#94a3b8' : null
                    const rowStyle = tier === 3 ? { background: '#fbbf2408', borderColor: '#fbbf2425' }
                                   : tier === 2 ? { background: '#818cf808', borderColor: '#818cf820' }
                                   : { background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.05)' }
                    return (
                      <div key={i} className="rounded-xl px-3 py-2.5 border flex flex-col gap-2" style={rowStyle}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-white/25 w-4 shrink-0">{i + 1}</span>
                          <span className="text-[10px] font-bold text-white/25 shrink-0">#{r.drawNum}</span>
                          <span className="text-[10px] text-white/25 shrink-0">{r.date?.slice(0, 10)}</span>
                          <div className="flex-1" />
                          <span className="font-black font-mono text-base text-white shrink-0">{r.actual}</span>
                          <div className="flex gap-0.5 shrink-0">
                            {[0,1,2].map(j => (
                              <span key={j} className="text-sm"
                                style={{ color: j < r.actualDecisionScore && rowColor ? rowColor : 'rgba(255,255,255,0.08)' }}>★</span>
                            ))}
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0"
                            style={rowColor ? { background: `${rowColor}18`, color: rowColor } : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)' }}>
                            {tier === 3 ? '★★★ ຖືກ' : tier === 2 ? '★★ ຖືກ' : tier === 1 ? '★ ຖືກ' : '✗ Miss'}
                          </span>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {r.all21.map((item, j) => (
                            <span key={j} className="font-black font-mono text-[11px] px-1.5 py-0.5 rounded-md"
                              style={item.num === r.actual
                                ? { background: item.tier === 3 ? '#fbbf24' : item.tier === 2 ? '#818cf8' : '#94a3b8', color: item.tier >= 2 ? '#000' : '#fff' }
                                : item.tier === 3 ? { background: 'rgba(255,255,255,0.04)', color: '#fbbf2480' }
                                : item.tier === 2 ? { background: 'rgba(255,255,255,0.04)', color: '#818cf865' }
                                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)' }}>
                              {item.num}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-xl px-4 py-2.5 text-xs text-[#fbbf24] flex items-start gap-2"
                style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.20)' }}>
                <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0">warning</span>
                ຫວຍລາວເປັນການສຸ່ມ — ຕົວເລກ Decision Score ★★★ ບໍ່ຮັບປະກັນຈະຖືກທຸກງວດ
              </div>
            </>
          )}
        </div>
      )}

      {/* ── PREDICT ──────────────────────────────────────────────────────────── */}
      {mode === 'predict' && (
        <PredictionEnginePanel
          prediction={enhancedPrediction}
          backtest={enhancedBacktest}
          epTrials={epTrials}
          setEpTrials={setEpTrials}
        />
      )}

      {/* ── BACKTEST ─────────────────────────────────────────────────────────── */}
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
