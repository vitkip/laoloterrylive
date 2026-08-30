import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  AlertCircle, RefreshCw, Target, TrendingUp, Layers, Crown, Info, Plus, History,
} from 'lucide-react'
import { API as API_BASE } from '../utils/api'
import AiSummaryCard from '../components/AiSummaryCard'

const API = `${API_BASE}/puplatao.php`

const SYM_COLOR = {
  1: '#22c55e', 2: '#f97316', 3: '#3b82f6', 4: '#ec4899', 5: '#eab308', 6: '#ef4444',
}

const RANK_META = [
  { bg: 'linear-gradient(135deg,#ef4444 0%,#f97316 50%,#eab308 100%)', color: '#fff', shadow: 'rgba(239,68,68,0.4)' },
  { bg: 'linear-gradient(135deg,#f97316 0%,#fb923c 50%,#ea580c 100%)', color: '#fff', shadow: 'rgba(249,115,22,0.35)' },
  { bg: 'linear-gradient(135deg,#eab308 0%,#facc15 50%,#ca8a04 100%)', color: '#1a1205', shadow: 'rgba(234,179,8,0.35)' },
]

// ເສັ້ນຖານ "ທາຍມົ້ວ" (ລູກ 6 · 3 ໜ່ວຍ/ງວດ)
const BASE_BOTH_PCT   = Math.round((1 - 2 * Math.pow(5 / 6, 3) + Math.pow(4 / 6, 3)) * 100) // ≈ 14
const BASE_EITHER_PCT = Math.round((1 - Math.pow(4 / 6, 3)) * 100)                           // ≈ 70

function normalize(obj) {
  const max = Math.max(...Object.values(obj), 0)
  const out = {}
  for (const k in obj) out[k] = max > 0 ? obj[k] / max : 0
  return out
}

// ── ສູດຄິດ 3 ຄູ່ລູກ ສຳລັບງວດຖັດໄປ ────────────────────────────────
// S(ລູກ)  = 0.55 · ຄວາມຖີ່ 20 ງວດຫຼ້າສຸດ (recency-weighted)
//         + 0.45 · overdue (ຄ້າງມາແລ້ວກີ່ງວດ / ຄ້າງຫຼາຍສຸດ)
// P(a,b)  = 0.40 · ຄວາມແຮງລູກສະເລ່ຍ (S)
//         + 0.35 · ຄວາມຖີ່ອອກຄູ່ນຳກັນ (ທັງໝົດ)
//         + 0.25 · ຄວາມຖີ່ອອກຄູ່ນຳກັນ (15 ງວດຫຼ້າສຸດ)
// backtest: ນັບຍ້ອນຫຼັງ 60 ງວດ ວ່າ 2 ລູກນີ້ອອກພ້ອມກັນ / ຢ່າງໜ້ອຍ 1 ໜ່ວຍ ຈັກງວດ
function buildPairPredictions(draws, symbols) {
  const n = draws.length
  if (n === 0 || symbols.length === 0) return null
  const ID = symbols.map(s => s.symbol_id)
  const symOf = {}
  symbols.forEach(s => { symOf[s.symbol_id] = s })

  const N = Math.min(20, n)
  const recent = draws.slice(0, N)

  const rec = {}
  ID.forEach(i => { rec[i] = 0 })
  recent.forEach((d, idx) => {
    const w = (N - idx) / N
    ;[d.pos1, d.pos2, d.pos3].forEach(v => { if (v) rec[v] += w })
  })

  const lastSeen = {}
  ID.forEach(i => { lastSeen[i] = null })
  draws.forEach((d, idx) => {
    ;[d.pos1, d.pos2, d.pos3].forEach(v => {
      if (v && lastSeen[v] === null) lastSeen[v] = idx
    })
  })
  const gap = {}
  ID.forEach(i => { gap[i] = lastSeen[i] === null ? n : lastSeen[i] })
  const maxGap = Math.max(...Object.values(gap), 1)

  const normRec = normalize(rec)
  const normGap = {}
  ID.forEach(i => { normGap[i] = gap[i] / maxGap })

  const S = {}
  ID.forEach(i => { S[i] = 0.55 * normRec[i] + 0.45 * normGap[i] })
  const normS = normalize(S)

  // #9 ແປງຄະແນນ S → ຄວາມໜ້າຈະເປັນ % ຈິງ
  // q = ສ່ວນແບ່ງການເລືອກ ຕໍ່ 1 ໜ່ວຍ ( Σq = 1); ລູກ 3 ໜ່ວຍ/ງວດ
  const sumS = ID.reduce((s, i) => s + S[i], 0)
  const q = {}
  ID.forEach(i => { q[i] = sumS > 0 ? S[i] / sumS : 1 / ID.length })
  const probAppear = {}
  ID.forEach(i => { probAppear[i] = 1 - Math.pow(1 - q[i], 3) })

  // co-occurrence
  const co = {}
  const coR = {}
  ID.forEach(a => { co[a] = {}; coR[a] = {}; ID.forEach(b => { co[a][b] = 0; coR[a][b] = 0 }) })
  draws.forEach((d, idx) => {
    const uniq = [...new Set([d.pos1, d.pos2, d.pos3].filter(Boolean))]
    for (let i = 0; i < uniq.length; i++) {
      for (let j = i + 1; j < uniq.length; j++) {
        const a = uniq[i]; const b = uniq[j]
        co[a][b]++; co[b][a]++
        if (idx < 15) { coR[a][b]++; coR[b][a]++ }
      }
    }
  })
  const coFlat = {}
  const coRFlat = {}
  for (let i = 0; i < ID.length; i++) {
    for (let j = i + 1; j < ID.length; j++) {
      const key = ID[i] + '-' + ID[j]
      coFlat[key] = co[ID[i]][ID[j]]
      coRFlat[key] = coR[ID[i]][ID[j]]
    }
  }
  const nCo = normalize(coFlat)
  const nCoR = normalize(coRFlat)

  const pairs = []
  for (let i = 0; i < ID.length; i++) {
    for (let j = i + 1; j < ID.length; j++) {
      const a = ID[i]; const b = ID[j]; const key = a + '-' + b
      const symPart = (normS[a] + normS[b]) / 2
      const score = 0.40 * symPart + 0.35 * nCo[key] + 0.25 * nCoR[key]
      const third = ID.filter(x => x !== a && x !== b).sort((x, y) => S[y] - S[x])[0]
      // P(ອອກທັງ a ແລະ b ຢ່າງໜ້ອຍໜ່ວຍລະຄັ້ງ ໃນ 3 ໜ່ວຍ)
      const pairProb = 1 - Math.pow(1 - q[a], 3) - Math.pow(1 - q[b], 3) + Math.pow(1 - q[a] - q[b], 3)
      pairs.push({ a, b, third, score, pairProb })
    }
  }
  pairs.sort((x, y) => y.score - x.score)
  const top = pairs.slice(0, 3)

  const bt = draws.slice(0, Math.min(60, n))
  top.forEach(p => {
    let both = 0; let either = 0
    bt.forEach(d => {
      const set = new Set([d.pos1, d.pos2, d.pos3])
      const hasA = set.has(p.a); const hasB = set.has(p.b)
      if (hasA && hasB) both++
      if (hasA || hasB) either++
    })
    p.backtest = {
      n: bt.length, both, either,
      pctBoth: bt.length ? Math.round((both / bt.length) * 100) : 0,
      pctEither: bt.length ? Math.round((either / bt.length) * 100) : 0,
    }
  })

  const symbolRanked = ID
    .map(i => ({ id: i, sym: symOf[i], score: normS[i], prob: probAppear[i] }))
    .sort((a, b) => b.prob - a.prob)

  return { top, symbolRanked, totalDraws: n, backtestN: bt.length, symOf }
}

// ── ຍ້ອນເບິ່ງ: ສູດນີ້ (ຄູ່ທີ 1 / 2 / 3) ທາຍຖືກຈັກຄັ້ງໃນອະດີດ ────────
// ແຕ່ລະງວດຍ້ອນຫຼັງ k: ຄິດສູດໃໝ່ ໂດຍໃຊ້ພຽງງວດທີ່ເກົ່າກວ່າ k → ທຽບກັບຜົນຈິງ
const BT_WINDOW = 60   // ຈຳນວນງວດຫຼ້າສຸດທີ່ເອົາມາທົດສອບ
const BT_MIN_HIST = 12 // ຕ້ອງມີປະຫວັດຢ່າງໜ້ອຍເທົ່ານີ້ ຈຶ່ງຄິດສູດ

function backtestFormula(draws, symbols) {
  if (!symbols.length || draws.length < BT_MIN_HIST + 3) return null
  const both = [0, 0, 0]
  const either = [0, 0, 0]
  let n = 0
  let anyBoth = 0
  const rows = []
  const limit = Math.min(BT_WINDOW, draws.length - BT_MIN_HIST)
  for (let k = 0; k < limit; k++) {
    const hist = draws.slice(k + 1)
    if (hist.length < BT_MIN_HIST) break
    const pred = buildPairPredictions(hist, symbols)
    if (!pred || pred.top.length < 3) continue
    const actualArr = [draws[k].pos1, draws[k].pos2, draws[k].pos3].filter(Boolean)
    const actual = new Set(actualArr)
    n++
    let hitAny = false
    const rankHits = pred.top.map((p, i) => {
      const hasA = actual.has(p.a)
      const hasB = actual.has(p.b)
      if (hasA && hasB) { both[i]++; hitAny = true }
      if (hasA || hasB) either[i]++
      return { both: hasA && hasB, either: hasA || hasB, pair: [p.a, p.b] }
    })
    if (hitAny) anyBoth++
    rows.push({ draw_no: draws[k].draw_no, draw_at: draws[k].draw_at, actual: actualArr, rankHits })
  }
  return {
    n, both, either, anyBoth, rows,
    baseBoth: 1 - 2 * Math.pow(5 / 6, 3) + Math.pow(4 / 6, 3), // ≈ 0.139
    baseEither: 1 - Math.pow(4 / 6, 3),                        // ≈ 0.704
  }
}

function SymBall({ sym, size = 52 }) {
  if (!sym) return null
  const c = SYM_COLOR[sym.symbol_id] || '#64748b'
  return (
    <span
      className="inline-flex items-center justify-center rounded-2xl shrink-0"
      style={{ width: size, height: size, background: c + '1f', border: `1.5px solid ${c}55` }}
      title={sym.name_lo}
    >
      <span style={{ fontSize: size * 0.5, lineHeight: 1 }}>{sym.emoji}</span>
    </span>
  )
}

function PairCard({ pair, symOf }) {
  const m = RANK_META[pair.rank - 1] || RANK_META[2]
  const { backtest } = pair
  const bothUp   = backtest.pctBoth   >= BASE_BOTH_PCT
  const eitherUp = backtest.pctEither >= BASE_EITHER_PCT
  return (
    <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black"
          style={{ background: m.bg, color: m.color, boxShadow: `0 2px 10px ${m.shadow}` }}
        >
          {pair.rank === 1 && <Crown size={12} />}
          ຄູ່ທີ {pair.rank}
        </span>
        <span className="text-[10px] text-[#94a3b8] tabular-nums">ຄະແນນຈັດອັນດັບ {Math.round(pair.score * 100)}%</span>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SymBall sym={symOf[pair.a]} />
        <Plus size={16} className="text-[#94a3b8]" />
        <SymBall sym={symOf[pair.b]} />
        <div className="flex items-center gap-2 pl-3 ml-1 border-l border-[#e8edf8] dark:border-white/10">
          <div className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8] leading-tight">
            ລູກທີ 3<br />ແນະນຳ
          </div>
          <SymBall sym={symOf[pair.third]} size={40} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <span
          className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg"
          style={{ background: '#f9731614', color: '#f97316' }}
        >
          ໂອກາດອອກທັງຄູ່ (ຈາກຄວາມແຮງລູກ) ≈ {Math.round(pair.pairProb * 100)}%
        </span>
        <span
          className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg"
          style={{
            background: bothUp ? '#22c55e1f' : '#64748b14',
            color: bothUp ? '#16a34a' : '#64748b',
          }}
          title={`ອອກຄູ່ນີ້ພ້ອມກັນ ${backtest.pctBoth}% ທຽບກັບ ຄ່າສະເລ່ຍ ${BASE_BOTH_PCT}% (${backtest.n} ງວດຫຼ້າສຸດ)`}
        >
          {bothUp ? '▲ ອອກຄູ່ນີ້ ສູງກວ່າຄ່າສະເລ່ຍ' : '▼ ອອກຄູ່ນີ້ ຕ່ຳກວ່າຄ່າສະເລ່ຍ'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl p-2.5 text-center" style={{ background: '#ef444410', border: '1px solid #ef444430' }}>
          <p className="text-xl font-black text-[#ef4444] tabular-nums">{backtest.both}<span className="text-xs text-[#ef4444]/60">/{backtest.n}</span></p>
          <p className="text-[9px] font-bold text-[#ef4444]/80 mt-0.5">ອອກພ້ອມກັນ · {backtest.pctBoth}%</p>
          <p className="text-[9px] font-black mt-0.5" style={{ color: bothUp ? '#16a34a' : '#94a3b8' }}>
            {bothUp ? '▲' : '▼'} ສະເລ່ຍ ~{BASE_BOTH_PCT}%
          </p>
        </div>
        <div className="rounded-xl p-2.5 text-center" style={{ background: '#f9731610', border: '1px solid #f9731630' }}>
          <p className="text-xl font-black text-[#f97316] tabular-nums">{backtest.either}<span className="text-xs text-[#f97316]/60">/{backtest.n}</span></p>
          <p className="text-[9px] font-bold text-[#f97316]/80 mt-0.5">ຢ່າງໜ້ອຍ 1 ໜ່ວຍ · {backtest.pctEither}%</p>
          <p className="text-[9px] font-black mt-0.5" style={{ color: eitherUp ? '#16a34a' : '#94a3b8' }}>
            {eitherUp ? '▲' : '▼'} ສະເລ່ຍ ~{BASE_EITHER_PCT}%
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PuplataoPredictPage() {
  const [draws, setDraws]     = useState([])
  const [symbols, setSymbols] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [rD, rS] = await Promise.all([
        fetch(`${API}?r=draws`),
        fetch(`${API}?r=symbols`),
      ])
      if (rD.ok) setDraws(await rD.json())
      if (rS.ok) setSymbols(await rS.json())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const result = useMemo(() => buildPairPredictions(draws, symbols), [draws, symbols])
  const backtest = useMemo(() => backtestFormula(draws, symbols), [draws, symbols])
  const symById = useMemo(() => {
    const m = {}
    symbols.forEach(s => { m[s.symbol_id] = s })
    return m
  }, [symbols])

  const aiPayload = useMemo(() => {
    if (!result) return null
    return {
      totalDraws: result.totalDraws,
      backtestN: result.backtestN,
      pairs: result.top.map((p, i) => ({
        rank: i + 1,
        a: result.symOf[p.a]?.name_lo,
        b: result.symOf[p.b]?.name_lo,
        third: result.symOf[p.third]?.name_lo,
        scorePct: Math.round(p.score * 100),
        pairProbPct: Math.round(p.pairProb * 100),
        backtest: p.backtest,
      })),
      symbolRanked: result.symbolRanked.map((r, i) => ({
        rank: i + 1, name: r.sym.name_lo,
        probPct: Math.round(r.prob * 100), scorePct: Math.round(r.score * 100),
      })),
      formulaBacktest: backtest && backtest.n > 0 ? {
        testedDraws: backtest.n,
        rankBothHits: backtest.both,
        rankEitherHits: backtest.either,
        anyRankBothHits: backtest.anyBoth,
        baseBothPct: Math.round(backtest.baseBoth * 100),
        // ໄລ່ຈາກໃໝ່ → ເກົ່າ; ຕໍ່ 1 ງວດ = [ຄູ່1, ຄູ່2, ຄູ່3], 2=ຖືກທັງຄູ່ 1=ໄດ້ 1 ໜ່ວຍ 0=ບໍ່ຖືກ
        recentDraws: backtest.rows.slice(0, 15).map(r => ({
          draw_no: r.draw_no,
          ranks: r.rankHits.map(h => (h.both ? 2 : h.either ? 1 : 0)),
        })),
      } : null,
    }
  }, [result, backtest])

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
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)', color: '#fff' }}
        >
          <RefreshCw size={14} /> ລອງໃໝ່
        </button>
      </div>
    )
  }

  const CARD = 'bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5'

  return (
    <div className="space-y-7 pb-16">
      {/* ── Header ── */}
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,#ef4444 0%,#f97316 50%,#eab308 100%)', boxShadow: '0 0 24px rgba(239,68,68,0.3)' }}
        >
          <Target size={26} color="#fff" />
        </div>
        <div>
          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight leading-tight"
            style={{
              background: 'linear-gradient(135deg,#ef4444 0%,#f97316 45%,#eab308 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}
          >
            ຄູ່ລູກ ງວດຖັດໄປ
          </h1>
          <p className="text-sm text-[#94a3b8]">ສູດຄິດ 3 ຄູ່ລູກ ໂດຍປະມານ ຈາກສະຖິຕິ {draws.length} ງວດ</p>
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div className="flex gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-4">
        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
          <strong>ໝາຍເຫດ:</strong> ຄູ່ລູກຂ້າງລຸ່ມນີ້ຄິດຈາກສະຖິຕິຍ້ອນຫຼັງເທົ່ານັ້ນ — ການອອກລູກແຕ່ລະງວດເປັນເອກະລາດ <strong>ບໍ່ສາມາດທຳນາຍ</strong>ໄດ້ ແລະ ບໍ່ຮັບປະກັນຜົນ.
        </p>
      </div>

      {/* ── Insufficient data ── */}
      {!loading && result && result.totalDraws < 10 && (
        <div className="flex gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-700/30 rounded-2xl p-4">
          <Info size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-800 dark:text-red-400 leading-relaxed">
            ຂໍ້ມູນປະຫວັດຍັງໜ້ອຍ ({result.totalDraws} ງວດ) — ຄູ່ລູກທີ່ແນະນຳອາດປ່ຽນແປງໄວເມື່ອມີຂໍ້ມູນເພີ່ມ.
          </p>
        </div>
      )}

      {/* ── Methodology ── */}
      <div className={CARD}>
        <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-2 flex items-center gap-2">
          <Layers size={14} className="text-[#f97316]" /> ວິທີຄິດໄລ່
        </h3>
        <div className="space-y-1.5 text-xs text-[#64748b] leading-relaxed">
          <p><strong style={{ color: '#f97316' }}>ຄວາມແຮງລູກ S</strong> = 55% ຄວາມຖີ່ 20 ງວດຫຼ້າສຸດ (ໃຫ້ນ້ຳໜັກງວດໃໝ່ຫຼາຍກວ່າ) + 45% ລູກຄ້າງ (overdue).</p>
          <p><strong style={{ color: '#ef4444' }}>ຄະແນນຄູ່ P(a,b)</strong> = 40% ຄວາມແຮງລູກສະເລ່ຍ + 35% ຄວາມຖີ່ອອກຄູ່ນຳກັນ (ທັງໝົດ) + 25% ຄວາມຖີ່ອອກຄູ່ນຳກັນ (15 ງວດຫຼ້າສຸດ). ຈັດອັນດັບ 15 ຄູ່ → ເອົາ 3 ຄູ່ເທິງສຸດ.</p>
          <p><strong>ລູກທີ 3 ແນະນຳ</strong> = ລູກທີ່ຄວາມແຮງ S ສູງສຸດ ໃນ 4 ລູກທີ່ເຫຼືອ (ເຜື່ອຢາກທາຍຄົບ 3 ໜ່ວຍ).</p>
          <p><strong style={{ color: '#22c55e' }}>ໂອກາດ %</strong> = ແປງ S ເປັນສ່ວນແບ່ງການເລືອກຕໍ່ໜ່ວຍ (q, ລວມ = 100%) → P(ອອກຢ່າງໜ້ອຍ 1 ໃນ 3 ໜ່ວຍ) = 1 − (1 − q)³. ຄູ່ = 1 − (1−qₐ)³ − (1−q_b)³ + (1−qₐ−q_b)³. ເສັ້ນຖານສະເໝີພາບ ≈ 42% (ລູກດຽວ) / 14% (ຄູ່).</p>
        </div>
      </div>

      {/* ── AI ── */}
      {!loading && aiPayload && (
        <AiSummaryCard
          context="puplataopredict"
          title="AI ອະທິບາຍ 3 ຄູ່ລູກ ງວດຖັດໄປ"
          hint="ໃຫ້ Claude AI ອ່ານສູດ + ຜົນ backtest ຂອງແຕ່ລະຄູ່ ແລ້ວອະທິບາຍເປັນພາສາລາວ"
          payload={aiPayload}
        />
      )}

      {/* ── Pairs ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-52 bg-[#f1f5f9] dark:bg-[#0c1426] rounded-2xl animate-pulse border border-[#e8edf8] dark:border-white/4" />
          ))}
        </div>
      ) : result ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {result.top.map((p, i) => (
              <PairCard key={`${p.a}-${p.b}`} pair={{ ...p, rank: i + 1 }} symOf={result.symOf} />
            ))}
          </div>

          {/* ── ຍ້ອນເບິ່ງ: ສູດນີ້ທາຍຖືກຈັກຄັ້ງ ── */}
          {backtest && backtest.n > 0 && (
            <div className={CARD}>
              <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-1 flex items-center gap-2">
                <History size={14} className="text-[#f97316]" /> ຍ້ອນເບິ່ງ: ສູດນີ້ທາຍຖືກຈັກຄັ້ງ
              </h3>
              <p className="text-xs text-[#94a3b8] mb-4">
                ທົດສອບກັບ {backtest.n} ງວດຫຼ້າສຸດ — ແຕ່ລະງວດຄິດສູດໃໝ່ ໂດຍໃຊ້ພຽງຂໍ້ມູນກ່ອນໜ້າ
              </p>
              <div className="space-y-2.5">
                {[0, 1, 2].map(i => {
                  const b = backtest.both[i]
                  const e = backtest.either[i]
                  const m = RANK_META[i]
                  return (
                    <div key={i} className="flex items-center gap-3 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black shrink-0"
                        style={{ background: m.bg, color: m.color, boxShadow: `0 2px 8px ${m.shadow}` }}
                      >
                        {i === 0 && <Crown size={11} />} ຄູ່ທີ {i + 1}
                      </span>
                      <span className="text-sm tabular-nums">
                        <b className="text-[#ef4444]">{b}/{backtest.n}</b>
                        <span className="text-xs text-[#94a3b8]"> ຖືກທັງຄູ່ · {Math.round((b / backtest.n) * 100)}%</span>
                      </span>
                      <span className="text-sm tabular-nums ml-auto">
                        <b className="text-[#f97316]">{e}/{backtest.n}</b>
                        <span className="text-xs text-[#94a3b8]"> ≥1 ໜ່ວຍ · {Math.round((e / backtest.n) * 100)}%</span>
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-[#eef2f9] dark:border-white/5 flex items-center justify-between">
                <span className="text-sm font-bold text-[#334155] dark:text-[#e2e8f0]">ຢ່າງໜ້ອຍ 1 ໃນ 3 ຄູ່ ຖືກທັງຄູ່</span>
                <span className="text-sm font-black tabular-nums text-[#ef4444]">
                  {backtest.anyBoth}/{backtest.n} · {Math.round((backtest.anyBoth / backtest.n) * 100)}%
                </span>
              </div>

              {/* ── ລາຍລະອຽດ: ງວດຜ່ານມາ ອອກຕາມ ຄູ່ 1/2/3 ຖືກ ຫຼື ບໍ່ ── */}
              {backtest.rows.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8] mb-2">ລາຍລະອຽດ ແຕ່ລະງວດ (ໃໝ່ → ເກົ່າ)</p>
                  <div className="max-h-80 overflow-y-auto -mx-1 px-1">
                    {backtest.rows.map(row => (
                      <div
                        key={row.draw_no}
                        className="flex items-center gap-2 flex-wrap py-1.5 border-b border-[#f1f5f9] dark:border-white/5 last:border-0"
                      >
                        <span className="text-[11px] tabular-nums text-[#64748b] w-[124px] shrink-0">
                          ງວດ {row.draw_no}
                          <span className="text-[#cbd5e1] dark:text-[#475569]"> · {row.draw_at?.slice(11, 16)}</span>
                        </span>
                        <span className="flex items-center gap-0.5 shrink-0">
                          {row.actual.map((id, i) => <SymBall key={i} sym={symById[id]} size={22} />)}
                        </span>
                        <span className="flex items-center gap-1 ml-auto">
                          {row.rankHits.map((h, i) => {
                            const st = h.both
                              ? { c: '#16a34a', bg: '#22c55e1f', t: '✓' }
                              : h.either
                                ? { c: '#d97706', bg: '#f59e0b1f', t: '~' }
                                : { c: '#94a3b8', bg: '#64748b12', t: '✗' }
                            return (
                              <span
                                key={i}
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black tabular-nums"
                                style={{ background: st.bg, color: st.c }}
                                title={`ຄູ່ທີ ${i + 1}: ${symById[h.pair[0]]?.name_lo} + ${symById[h.pair[1]]?.name_lo}`}
                              >
                                {i + 1}{st.t}
                              </span>
                            )
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-3 text-[11px] text-[#94a3b8] leading-relaxed">
                <b style={{ color: '#16a34a' }}>✓</b> ຖືກທັງຄູ່ · <b style={{ color: '#d97706' }}>~</b> ໄດ້ 1 ໜ່ວຍ · <b>✗</b> ບໍ່ຖືກ ·
                ເສັ້ນຖານສຸ່ມ (ທາຍມົ້ວ): ຖືກທັງຄູ່ ≈ {Math.round(backtest.baseBoth * 100)}% · ≥1 ໜ່ວຍ ≈ {Math.round(backtest.baseEither * 100)}% —
                ຖ້າ % ຂ້າງເທິງ ສູງກວ່ານີ້ ແປວ່າ ສູດພໍມີປະໂຫຍດ
              </p>
            </div>
          )}

          {/* Symbol strength ranking */}
          <div className={CARD}>
            <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-[#f97316]" /> ອັນດັບລູກ · ໂອກາດອອກງວດຖັດໄປ
            </h3>
            <div className="space-y-2">
              {result.symbolRanked.map((r, i) => {
                const c = SYM_COLOR[r.id] || '#64748b'
                const maxProb = result.symbolRanked[0].prob || 1
                return (
                  <div key={r.id} className="flex items-center gap-3">
                    <span className="text-xs font-black text-[#94a3b8] w-5 tabular-nums">{i + 1}</span>
                    <SymBall sym={r.sym} size={30} />
                    <span className="text-sm font-semibold text-[#334155] dark:text-[#cbd5e1] w-16">{r.sym.name_lo}</span>
                    <div className="flex-1 h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.round((r.prob / maxProb) * 100)}%`, background: c }} />
                    </div>
                    <span className="text-xs tabular-nums text-[#64748b] w-9 text-right">{Math.round(r.prob * 100)}%</span>
                  </div>
                )
              })}
            </div>
            <p className="mt-3 text-[11px] text-[#94a3b8]">ເສັ້ນຖານສະເໝີພາບ ≈ 42% ຕໍ່ລູກ · ແຖບ = ທຽບກັບລູກທີ່ແຮງສຸດ</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
            <TrendingUp size={13} />
            Backtest ຄິດຈາກ {result.backtestN} ງວດຫຼ້າສຸດ · ອັບເດດອັດຕະໂນມັດເມື່ອມີຜົນງວດໃໝ່
          </div>
        </>
      ) : (
        <div className={CARD}>
          <p className="text-sm text-[#64748b] text-center py-8">ຍັງບໍ່ມີຂໍ້ມູນປະຫວັດ — ກະລຸນາເພີ່ມຜົນງວດຢູ່ໜ້າ Admin ກ່ອນ</p>
        </div>
      )}
    </div>
  )
}
