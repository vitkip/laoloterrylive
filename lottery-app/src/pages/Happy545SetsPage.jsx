import { useState, useEffect, useCallback, useMemo } from 'react'
import { AlertCircle, Target, RefreshCw, Crown, Star, TrendingUp, Layers, Info } from 'lucide-react'
import { API as API_BASE } from '../utils/api'
import AiSummaryCard from '../components/AiSummaryCard'

const API = `${API_BASE}/happy545.php`

const RANK_META = [
  { bg: 'linear-gradient(135deg,#d4af37 0%,#fbbf24 45%,#b8860b 100%)', color: '#060b1a', border: '#d4af37', shadow: 'rgba(212,175,55,0.4)' },
  { bg: 'linear-gradient(135deg,#64748b 0%,#94a3b8 45%,#475569 100%)', color: '#fff',     border: '#94a3b8', shadow: 'rgba(148,163,184,0.3)' },
  { bg: 'linear-gradient(135deg,#92400e 0%,#cd7f32 45%,#78350f 100%)', color: '#fff',     border: '#cd7f32', shadow: 'rgba(205,127,50,0.35)' },
  { bg: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 45%,#1e40af 100%)', color: '#fff',     border: '#3b82f6', shadow: 'rgba(59,130,246,0.3)' },
  { bg: 'linear-gradient(135deg,#4338ca 0%,#6366f1 45%,#3730a3 100%)', color: '#fff',     border: '#6366f1', shadow: 'rgba(99,102,241,0.3)' },
]

function normalize(obj) {
  const max = Math.max(...Object.values(obj), 0)
  const out = {}
  for (const k in obj) out[k] = max > 0 ? obj[k] / max : 0
  return out
}

// ── Core recommendation engine ──────────────────────────────────
// P5 ★  : recency-weighted frequency (last 20 draws) + overdue/gap bonus → top 5 stars
// P1-P4 : shared pool of 10 numbers scored from recency frequency + pairwise
//         co-occurrence + full 4-number "ຊຸດ 4 ເລກ (ເຕັມ)" repeat frequency
function buildRecommendedSets(draws, posStats) {
  if (!posStats?.pos5) return null
  const n = draws.length
  const n20 = Math.min(20, n)
  const recent20 = draws.slice(0, n20)

  // ---- P5 ★ star ranking ----
  const p5Score = {}
  for (let i = 1; i <= 45; i++) p5Score[i] = 0
  recent20.forEach((d, idx) => {
    if (d.pos5) p5Score[+d.pos5] += (n20 - idx) / Math.max(n20, 1)
  })
  const p5Data = posStats.pos5 ?? []
  const maxGap = Math.max(...p5Data.map(d => d.gap ?? 0), 1)
  p5Data.forEach(d => {
    if (d.gap != null) p5Score[d.number] = (p5Score[d.number] || 0) + (d.gap / maxGap) * 0.6
  })
  const p5Ranked = Object.entries(p5Score)
    .map(([num, score]) => ({ num: +num, score }))
    .sort((a, b) => b.score - a.score || a.num - b.num)
  const top5Stars = p5Ranked.slice(0, 5).map(r => r.num)

  // ---- P1-P4 pool scoring ----
  const recencyScore = {}
  for (let i = 1; i <= 45; i++) recencyScore[i] = 0
  recent20.forEach((d, idx) => {
    const w = (n20 - idx) / Math.max(n20, 1)
    ;[d.pos1, d.pos2, d.pos3, d.pos4].forEach(v => { if (v) recencyScore[+v] += w })
  })

  const pairCount = {}
  for (let i = 1; i <= 45; i++) pairCount[i] = {}
  const combo4Count = {}
  draws.forEach(d => {
    const nums = [d.pos1, d.pos2, d.pos3, d.pos4].filter(Boolean).map(Number).sort((a, b) => a - b)
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const [a, b] = [nums[i], nums[j]]
        pairCount[a][b] = (pairCount[a][b] || 0) + 1
        pairCount[b][a] = (pairCount[b][a] || 0) + 1
      }
    }
    if (nums.length === 4) {
      const key = nums.join('-')
      combo4Count[key] = (combo4Count[key] || 0) + 1
    }
  })

  const coOccScore = {}
  const combo4Score = {}
  for (let i = 1; i <= 45; i++) {
    coOccScore[i] = Object.values(pairCount[i]).reduce((s, v) => s + v, 0)
    combo4Score[i] = 0
  }
  Object.entries(combo4Count).forEach(([key, count]) => {
    key.split('-').map(Number).forEach(num => { combo4Score[num] += count })
  })

  const normRecency = normalize(recencyScore)
  const normCoOcc = normalize(coOccScore)
  const normCombo4 = normalize(combo4Score)

  const poolRanked = []
  for (let i = 1; i <= 45; i++) {
    const combined = 0.45 * normRecency[i] + 0.35 * normCoOcc[i] + 0.20 * normCombo4[i]
    poolRanked.push({ num: i, score: combined })
  }
  poolRanked.sort((a, b) => b.score - a.score || a.num - b.num)
  const basePool = poolRanked.map(r => r.num)

  // ---- Backtest (last 100 draws) ----
  const bt = draws.slice(0, Math.min(100, n))
  function backtestSet(star, pool) {
    let h1 = 0, h2 = 0, h3 = 0, h4 = 0, starHits = 0
    bt.forEach(d => {
      if (+d.pos5 !== star) return
      starHits++
      const actual = [+d.pos1, +d.pos2, +d.pos3, +d.pos4]
      const matched = actual.filter(x => pool.includes(x)).length
      if (matched >= 1) h4++
      if (matched >= 2) h3++
      if (matched >= 3) h2++
      if (matched >= 4) h1++
    })
    return { starHits, h1, h2, h3, h4, btN: bt.length }
  }

  const sets = top5Stars.map((star, i) => {
    const pool = []
    for (const num of basePool) {
      if (num === star) continue
      pool.push(num)
      if (pool.length === 10) break
    }
    pool.sort((a, b) => a - b)
    return { rank: i + 1, star, pool, backtest: backtestSet(star, pool) }
  })

  return { sets, totalDraws: n }
}

function NumBall({ num, gold, large }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-xl text-xs font-extrabold tabular-nums shrink-0"
      style={{
        width: large ? 48 : 36,
        height: large ? 48 : 36,
        fontSize: large ? 15 : 12,
        ...(gold ? {
          background: 'linear-gradient(135deg,#d4af37,#fbbf24,#b8860b)',
          color: '#060b1a',
          boxShadow: '0 2px 12px rgba(212,175,55,0.5)',
        } : {
          background: 'rgba(59,130,246,0.1)',
          color: '#3b82f6',
          border: '1px solid rgba(59,130,246,0.2)',
        }),
      }}
    >
      {String(num).padStart(2, '0')}
    </span>
  )
}

function SetCard({ set }) {
  const m = RANK_META[set.rank - 1]
  const { backtest } = set
  const PRIZE_CHIPS = [
    { label: 'ລາງວັນ 1', hits: backtest.h1, color: '#d4af37' },
    { label: 'ລາງວັນ 2', hits: backtest.h2, color: '#818cf8' },
    { label: 'ລາງວັນ 3', hits: backtest.h3, color: '#22d3ee' },
    { label: 'ລາງວັນ 4', hits: backtest.h4, color: '#4ade80' },
  ]

  return (
    <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black"
          style={{ background: m.bg, color: m.color, boxShadow: `0 2px 10px ${m.shadow}` }}
        >
          {set.rank === 1 && <Crown size={12} />}
          ຊຸດທີ {set.rank}
        </span>
        <span className="text-[10px] text-[#94a3b8]">
          {backtest.btN > 0 ? `ອອກ P5 ນີ້ ${backtest.starHits}× ໃນ ${backtest.btN} ງວດ` : 'ຍັງບໍ່ມີຂໍ້ມູນ backtest'}
        </span>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-[#d4af37] mb-2">P5 ★ (ຕົງ)</p>
          <NumBall num={set.star} gold large />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8] mb-2">
            Pool P1-P4 ({set.pool.length} ເລກ — ເລືອກໃຊ້ 4 ໃນນີ້)
          </p>
          <div className="flex flex-wrap gap-1.5 max-w-[280px]">
            {set.pool.map(n => <NumBall key={n} num={n} />)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-1">
        {PRIZE_CHIPS.map(({ label, hits, color }) => (
          <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: color + '10', border: `1px solid ${color}30` }}>
            <p className="text-2xl font-black" style={{ color }}>{hits}</p>
            <p className="text-[9px] font-bold mt-0.5" style={{ color: color + 'cc' }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Happy545SetsPage() {
  const [draws, setDraws] = useState([])
  const [posStats, setPosStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [rD, rP] = await Promise.all([
        fetch(`${API}?r=draws`),
        fetch(`${API}?r=stats/all-positions`),
      ])
      if (rD.ok) setDraws(await rD.json())
      if (rP.ok) setPosStats(await rP.json())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const result = useMemo(() => buildRecommendedSets(draws, posStats), [draws, posStats])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <AlertCircle size={30} className="text-red-400" />
        </div>
        <div className="text-center">
          <p className="font-black text-lg text-[#0f172a] dark:text-[#f1f5f9]">ໂຫຼດຂໍ້ມູນບໍ່ໄດ້</p>
          <p className="text-sm text-[#64748b] mt-1">ກວດສອບການເຊື່ອມຕໍ່ ແລ້ວລອງໃໝ່</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#d4af37,#f59e0b)', color: '#060b1a' }}
        >
          <RefreshCw size={14} /> ລອງໃໝ່
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-7 pb-16">
      {/* ── Header ── */}
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,#d4af37 0%,#fbbf24 45%,#b8860b 100%)', boxShadow: '0 0 24px rgba(212,175,55,0.35)' }}
        >
          <Target size={26} color="#060b1a" />
        </div>
        <div>
          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight leading-tight"
            style={{
              background: 'linear-gradient(135deg,#d4af37 0%,#f59e0b 40%,#b8860b 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}
          >
            ຊຸດຫວຍ Happy 545
          </h1>
          <p className="text-sm text-[#94a3b8]">ຄຳແນະນຳ 5 ຊຸດ · ຊຸດລະ 10 ເລກ (P1-P4) + P5 ★ 1 ເລກ</p>
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div className="flex gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-4">
        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
          <strong>ໝາຍເຫດ:</strong> ສະຖິຕິໃຊ້ເບິ່ງຂໍ້ມູນອະດີດເທົ່ານັ້ນ — ການອອກເລກແຕ່ລະຄັ້ງເປັນເອກະລາດ ບໍ່ສາມາດ<strong>ທຳນາຍ</strong>ອະນາຄົດໄດ້.
        </p>
      </div>

      {/* ── Insufficient-data warning ── */}
      {!loading && result && result.totalDraws < 10 && (
        <div className="flex gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-700/30 rounded-2xl p-4">
          <Info size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-800 dark:text-red-400 leading-relaxed">
            {result.totalDraws === 0
              ? <>ຍັງ<strong>ບໍ່ມີຂໍ້ມູນປະຫວັດ</strong>ການອອກເລກ Happy 545 ໃນລະບົບເລີຍ — ຊຸດຂ້າງລຸ່ມນີ້ຄິດໄລ່ຈາກລຳດັບເລກເລີ່ມຕົ້ນ (01, 02, 03…) ເທົ່ານັ້ນ, <strong>ບໍ່ແມ່ນສະຖິຕິແທ້</strong>. ກະລຸນາເພີ່ມຜົນເລກຢູ່ໜ້າ Admin ກ່ອນ ເພື່ອໃຫ້ຄຳແນະນຳມີຄວາມໝາຍ.</>
              : <>ຂໍ້ມູນປະຫວັດຍັງໜ້ອຍ ({result.totalDraws} ງວດ) — ຄຳແນະນຳຂ້າງລຸ່ມນີ້ອາດປ່ຽນແປງໄວເມື່ອມີຂໍ້ມູນເພີ່ມ.</>}
          </p>
        </div>
      )}

      {/* ── Methodology ── */}
      <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5">
        <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-2 flex items-center gap-2">
          <Layers size={14} style={{ color: '#d4af37' }} /> ວິທີຄິດໄລ່
        </h3>
        <div className="space-y-1.5 text-xs text-[#64748b] leading-relaxed">
          <p><strong style={{ color: '#d4af37' }}>P5 ★</strong> — ຄິດຈາກຄວາມຖີ່ໃນ 20 ງວດຫຼ້າສຸດ + ໂບນັດ Gap (ຄ້າງນານ) → ເລືອກ 5 ອັນດັບທຳອິດ ເປັນດາວປະຈຳແຕ່ລະຊຸດ.</p>
          <p><strong style={{ color: '#3b82f6' }}>Pool P1-P4</strong> — 10 ເລກທີ່ໄດ້ຄະແນນລວມສູງສຸດຈາກ (1) ຄວາມຖີ່ 20 ງວດຫຼ້າສຸດ (2) ຄວາມຖີ່ອອກຄູ່ນຳກັນ (co-occurrence) (3) ຄວາມຖີ່ <strong>ຊຸດ 4 ເລກ (ເຕັມ)</strong> ທີ່ອອກຊ້ຳກັນທັງໝົດ. ໃຊ້ pool ດຽວກັນທຸກຊຸດ ແຕກຕ່າງກັນສະເພາະ P5 ★.</p>
        </div>
      </div>

      {/* ── AI Insight ── */}
      {!loading && result?.sets?.length > 0 && (
        <AiSummaryCard
          context="h545sets"
          title="ເປັນຫຍັງຊຸດເຫຼົ່ານີ້ຈຶ່ງຖືກແນະນຳ?"
          hint="ໃຫ້ AI ອ່ານຜົນ backtest ຂອງແຕ່ລະຊຸດ ແລ້ວອະທິບາຍເປັນພາສາລາວ"
          payload={{ totalDraws: result.totalDraws, sets: result.sets }}
        />
      )}

      {/* ── Sets ── */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-56 bg-[#f1f5f9] dark:bg-[#0c1426] rounded-2xl animate-pulse border border-[#e8edf8] dark:border-white/4" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {result.sets.map(set => <SetCard key={set.star} set={set} />)}
        </div>
      )}

      {/* ── Footnote ── */}
      <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
        <TrendingUp size={13} />
        Backtest ຄິດຈາກ {Math.min(100, result?.totalDraws ?? 0)} ງວດຫຼ້າສຸດ · ອີງໃສ່ Wheel (10 ເລກ → C(10,4)=210 ໃບ ຈຶ່ງຄຸ້ມ 100%)
      </div>
    </div>
  )
}
