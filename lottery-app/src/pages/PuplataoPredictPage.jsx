import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  AlertCircle, RefreshCw, Target, TrendingUp, Layers, Crown, Info, Plus,
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

function normalize(obj) {
  const max = Math.max(...Object.values(obj), 0)
  const out = {}
  for (const k in obj) out[k] = max > 0 ? obj[k] / max : 0
  return out
}

// ── ສູດຄິດ 3 ຄູ່ໝາກ ສຳລັບງວດຖັດໄປ ────────────────────────────────
// S(ໝາກ)  = 0.55 · ຄວາມຖີ່ 20 ງວດຫຼ້າສຸດ (recency-weighted)
//         + 0.45 · overdue (ຄ້າງມາແລ້ວກີ່ງວດ / ຄ້າງຫຼາຍສຸດ)
// P(a,b)  = 0.40 · ຄວາມແຮງໝາກສະເລ່ຍ (S)
//         + 0.35 · ຄວາມຖີ່ອອກຄູ່ນຳກັນ (ທັງໝົດ)
//         + 0.25 · ຄວາມຖີ່ອອກຄູ່ນຳກັນ (15 ງວດຫຼ້າສຸດ)
// backtest: ນັບຍ້ອນຫຼັງ 60 ງວດ ວ່າ 2 ໝາກນີ້ອອກພ້ອມກັນ / ຢ່າງໜ້ອຍ 1 ໜ່ວຍ ຈັກງວດ
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
      pairs.push({ a, b, third, score })
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
    .map(i => ({ id: i, sym: symOf[i], score: normS[i] }))
    .sort((a, b) => b.score - a.score)

  return { top, symbolRanked, totalDraws: n, backtestN: bt.length, symOf }
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
        <span className="text-[10px] text-[#94a3b8] tabular-nums">ຄະແນນ {Math.round(pair.score * 100)}%</span>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SymBall sym={symOf[pair.a]} />
        <Plus size={16} className="text-[#94a3b8]" />
        <SymBall sym={symOf[pair.b]} />
        <div className="flex items-center gap-2 pl-3 ml-1 border-l border-[#e8edf8] dark:border-white/10">
          <div className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8] leading-tight">
            ໝາກທີ 3<br />ແນະນຳ
          </div>
          <SymBall sym={symOf[pair.third]} size={40} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl p-2.5 text-center" style={{ background: '#ef444410', border: '1px solid #ef444430' }}>
          <p className="text-xl font-black text-[#ef4444] tabular-nums">{backtest.both}<span className="text-xs text-[#ef4444]/60">/{backtest.n}</span></p>
          <p className="text-[9px] font-bold text-[#ef4444]/80 mt-0.5">ອອກພ້ອມກັນ · {backtest.pctBoth}%</p>
        </div>
        <div className="rounded-xl p-2.5 text-center" style={{ background: '#f9731610', border: '1px solid #f9731630' }}>
          <p className="text-xl font-black text-[#f97316] tabular-nums">{backtest.either}<span className="text-xs text-[#f97316]/60">/{backtest.n}</span></p>
          <p className="text-[9px] font-bold text-[#f97316]/80 mt-0.5">ຢ່າງໜ້ອຍ 1 ໜ່ວຍ · {backtest.pctEither}%</p>
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
        backtest: p.backtest,
      })),
      symbolRanked: result.symbolRanked.map((r, i) => ({
        rank: i + 1, name: r.sym.name_lo, scorePct: Math.round(r.score * 100),
      })),
    }
  }, [result])

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
            ຄູ່ໝາກ ງວດຖັດໄປ
          </h1>
          <p className="text-sm text-[#94a3b8]">ສູດຄິດ 3 ຄູ່ໝາກ ໂດຍປະມານ ຈາກສະຖິຕິ {draws.length} ງວດ</p>
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div className="flex gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-4">
        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
          <strong>ໝາຍເຫດ:</strong> ຄູ່ໝາກຂ້າງລຸ່ມນີ້ຄິດຈາກສະຖິຕິຍ້ອນຫຼັງເທົ່ານັ້ນ — ການອອກໝາກແຕ່ລະງວດເປັນເອກະລາດ <strong>ບໍ່ສາມາດທຳນາຍ</strong>ໄດ້ ແລະ ບໍ່ຮັບປະກັນຜົນ.
        </p>
      </div>

      {/* ── Insufficient data ── */}
      {!loading && result && result.totalDraws < 10 && (
        <div className="flex gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-700/30 rounded-2xl p-4">
          <Info size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-800 dark:text-red-400 leading-relaxed">
            ຂໍ້ມູນປະຫວັດຍັງໜ້ອຍ ({result.totalDraws} ງວດ) — ຄູ່ໝາກທີ່ແນະນຳອາດປ່ຽນແປງໄວເມື່ອມີຂໍ້ມູນເພີ່ມ.
          </p>
        </div>
      )}

      {/* ── Methodology ── */}
      <div className={CARD}>
        <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-2 flex items-center gap-2">
          <Layers size={14} className="text-[#f97316]" /> ວິທີຄິດໄລ່
        </h3>
        <div className="space-y-1.5 text-xs text-[#64748b] leading-relaxed">
          <p><strong style={{ color: '#f97316' }}>ຄວາມແຮງໝາກ S</strong> = 55% ຄວາມຖີ່ 20 ງວດຫຼ້າສຸດ (ໃຫ້ນ້ຳໜັກງວດໃໝ່ຫຼາຍກວ່າ) + 45% ໝາກຄ້າງ (overdue).</p>
          <p><strong style={{ color: '#ef4444' }}>ຄະແນນຄູ່ P(a,b)</strong> = 40% ຄວາມແຮງໝາກສະເລ່ຍ + 35% ຄວາມຖີ່ອອກຄູ່ນຳກັນ (ທັງໝົດ) + 25% ຄວາມຖີ່ອອກຄູ່ນຳກັນ (15 ງວດຫຼ້າສຸດ). ຈັດອັນດັບ 15 ຄູ່ → ເອົາ 3 ຄູ່ເທິງສຸດ.</p>
          <p><strong>ໝາກທີ 3 ແນະນຳ</strong> = ໝາກທີ່ຄວາມແຮງ S ສູງສຸດ ໃນ 4 ໝາກທີ່ເຫຼືອ (ເຜື່ອຢາກທາຍຄົບ 3 ໜ່ວຍ).</p>
        </div>
      </div>

      {/* ── AI ── */}
      {!loading && aiPayload && (
        <AiSummaryCard
          context="puplataopredict"
          title="AI ອະທິບາຍ 3 ຄູ່ໝາກ ງວດຖັດໄປ"
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

          {/* Symbol strength ranking */}
          <div className={CARD}>
            <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-[#f97316]" /> ອັນດັບຄວາມແຮງໝາກ (ຄະແນນ S)
            </h3>
            <div className="space-y-2">
              {result.symbolRanked.map((r, i) => {
                const c = SYM_COLOR[r.id] || '#64748b'
                return (
                  <div key={r.id} className="flex items-center gap-3">
                    <span className="text-xs font-black text-[#94a3b8] w-5 tabular-nums">{i + 1}</span>
                    <SymBall sym={r.sym} size={30} />
                    <span className="text-sm font-semibold text-[#334155] dark:text-[#cbd5e1] w-16">{r.sym.name_lo}</span>
                    <div className="flex-1 h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.round(r.score * 100)}%`, background: c }} />
                    </div>
                    <span className="text-xs tabular-nums text-[#64748b] w-9 text-right">{Math.round(r.score * 100)}%</span>
                  </div>
                )
              })}
            </div>
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
