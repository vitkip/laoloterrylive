import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle, RefreshCw, Dices, TrendingUp, Timer, Layers, Crown, Target, ArrowRight,
  Flame, ArrowUp, ArrowDown, Minus, Grid3x3, Clock, TrendingDown, ShieldOff,
} from 'lucide-react'
import { API as API_BASE } from '../utils/api'
import AiSummaryCard from '../components/AiSummaryCard'

const API = `${API_BASE}/puplatao.php`

// ── ຄ່າຄົງທີ່ ສຳລັບການວິເຄາະ ─────────────────────────────────────────
const WINDOWS   = [5, 10, 20, 50]          // ช่วงงวดสำหรับ hot/cold
const SLOT_BASE = 1 / 6                     // ໂອກາດຖານ ຕໍ່ 1 ໜ່ວຍ ຕໍ່ 1 ລູກ
const DOW_LO    = ['ອາທິດ', 'ຈັນ', 'ອັງຄານ', 'ພຸດ', 'ພະຫັດ', 'ສຸກ', 'ເສົາ']
const PAIRS_SHOWN = 8                       // ຈຳນວນຄູ່ທີ່ສະແດງ ຕໍ່ບັດ (ຮ້ອນ / ເຢັນ)

// ເສັ້ນຖານສະເໝີພາບ: P(ລູກ a ແລະ b ອອກພ້ອມກັນ ໃນ 3 ໜ່ວຍ) = 1 − 2(5/6)³ + (4/6)³ ≈ 13.9%
const PAIR_BASE_PCT = (1 - 2 * Math.pow(5 / 6, 3) + Math.pow(4 / 6, 3)) * 100

// ຄ່າວິກິດ χ² ທີ່ p = 0.05 (ຂ້າງດຽວ) — ໂດຍປະມານ Wilson–Hilferty
function chi2Critical05(df) {
  if (df <= 0) return Infinity
  const z = 1.6448536269514722 // Φ⁻¹(0.95)
  const t = 1 - 2 / (9 * df) + z * Math.sqrt(2 / (9 * df))
  return df * t * t * t
}

// ── Per-symbol accent colours (by symbol_id 1–6) ────────────────────
const SYM_COLOR = {
  1: '#22c55e', // ນ້ຳເຕົ້າ
  2: '#f97316', // ປູ
  3: '#3b82f6', // ປາ
  4: '#ec4899', // ກຸ້ງ
  5: '#eab308', // ໄກ່
  6: '#ef4444', // ເສືອ
}

function SymbolChip({ sym, size = 40 }) {
  if (!sym) return null
  const c = SYM_COLOR[sym.symbol_id] || '#64748b'
  return (
    <span
      className="inline-flex flex-col items-center justify-center rounded-xl font-bold shrink-0"
      style={{
        width: size, height: size,
        background: c + '1a', border: `1px solid ${c}44`, color: c,
      }}
      title={sym.name_lo}
    >
      <span style={{ fontSize: size * 0.5, lineHeight: 1 }}>{sym.emoji}</span>
    </span>
  )
}

function Bar({ pct, color }) {
  return (
    <div className="h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export default function PuplataoPage() {
  const [symbols, setSymbols]   = useState([])
  const [draws, setDraws]       = useState([])
  const [freq, setFreq]         = useState([])
  const [byPos, setByPos]       = useState([])
  const [gap, setGap]           = useState([])
  const [pairs, setPairs]       = useState({ per_symbol: [], pairs: [] })
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [rSy, rD, rF, rP, rG, rPa] = await Promise.all([
        fetch(`${API}?r=symbols`),
        fetch(`${API}?r=draws`),
        fetch(`${API}?r=stats/frequency`),
        fetch(`${API}?r=stats/by-position`),
        fetch(`${API}?r=stats/gap`),
        fetch(`${API}?r=stats/pairs`),
      ])
      if (rSy.ok) setSymbols(await rSy.json())
      if (rD.ok)  setDraws(await rD.json())
      if (rF.ok)  setFreq(await rF.json())
      if (rP.ok)  setByPos(await rP.json())
      if (rG.ok)  setGap(await rG.json())
      if (rPa.ok) setPairs(await rPa.json())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const symById = useMemo(() => {
    const m = {}
    symbols.forEach(s => { m[s.symbol_id] = s })
    return m
  }, [symbols])

  const maxHits = useMemo(() => Math.max(...freq.map(f => f.total_hits), 1), [freq])
  const recentDraws = useMemo(() => draws.slice(0, 15), [draws])

  // ── ຄູ່ລູກ: ນັບການອອກພ້ອມກັນ ຄົບທຸກຄູ່ (C(6,2) = 15) ────────────────
  // ນັບ 1 ຄັ້ງ/ງວດ (ງວດທີ່ມີລູກຊ້ຳ ບໍ່ນັບຊ້ຳ) ແລະ ໃສ່ 0 ໃຫ້ຄູ່ທີ່ຍັງບໍ່ເຄີຍອອກພ້ອມກັນ
  // — ຈຳເປັນສຳລັບບັດ "ຄູ່ອອກໜ້ອຍສຸດ" ເພາະ API stats/pairs ຄືນສະເພາະຄູ່ທີ່ times ≥ 1
  const pairStats = useMemo(() => {
    if (!symbols.length) return []
    const ID = symbols.map(s => s.symbol_id)
    const cnt = {}
    for (let i = 0; i < ID.length; i++) {
      for (let j = i + 1; j < ID.length; j++) {
        cnt[`${Math.min(ID[i], ID[j])}-${Math.max(ID[i], ID[j])}`] = 0
      }
    }
    draws.forEach(d => {
      const uniq = [...new Set([d.pos1, d.pos2, d.pos3].filter(Boolean))]
      for (let i = 0; i < uniq.length; i++) {
        for (let j = i + 1; j < uniq.length; j++) {
          const k = `${Math.min(uniq[i], uniq[j])}-${Math.max(uniq[i], uniq[j])}`
          if (k in cnt) cnt[k]++
        }
      }
    })
    const n = draws.length
    return Object.entries(cnt)
      .map(([k, times]) => {
        const [a, b] = k.split('-').map(Number)
        return { a, b, times, pct: n ? (times / n) * 100 : 0 }
      })
      .sort((x, y) => y.times - x.times || x.a - y.a || x.b - y.b)
  }, [draws, symbols])

  // ຈຳກັດຄ່າ ບໍ່ໃຫ້ 2 ບັດ (ຮ້ອນ/ເຢັນ) ສະແດງຄູ່ດຽວກັນຊ້ຳ — 15 ຄູ່ ⇒ 7 ຕໍ່ບັດ
  const pairsPerCard = Math.min(PAIRS_SHOWN, Math.floor(pairStats.length / 2))
  const topPairs  = useMemo(() => pairStats.slice(0, pairsPerCard), [pairStats, pairsPerCard])
  const rarePairs = useMemo(
    () => pairStats.slice().reverse().slice(0, pairsPerCard),
    [pairStats, pairsPerCard]
  )

  // ── #6 ຮ້ອນ / ເຢັນ ຕາມช่วง 5 / 10 / 20 / 50 ງວດ + ເທຣນ ─────────────
  const rolling = useMemo(() => {
    if (!draws.length || !symbols.length) return []
    const ID = symbols.map(s => s.symbol_id)
    const hitsIn = (w) => {
      const c = {}
      ID.forEach(i => { c[i] = 0 })
      draws.slice(0, w).forEach(d => {
        ;[d.pos1, d.pos2, d.pos3].forEach(v => { if (v) c[v]++ })
      })
      return c
    }
    const wc = {}
    WINDOWS.forEach(w => { wc[w] = hitsIn(Math.min(w, draws.length)) })
    const f10 = hitsIn(Math.min(10, draws.length))
    const f30 = hitsIn(Math.min(30, draws.length))
    const n10 = Math.min(10, draws.length) * 3
    const n30 = Math.min(30, draws.length) * 3
    return ID.map(i => {
      const row = { symbol_id: i }
      WINDOWS.forEach(w => {
        const nn = Math.min(w, draws.length) * 3
        row[`w${w}`] = wc[w][i]
        row[`p${w}`] = nn ? wc[w][i] / nn : 0
      })
      row.trend = (n10 ? f10[i] / n10 : 0) - (n30 ? f30[i] / n30 : 0)
      return row
    }).sort((a, b) => b.p10 - a.p10)
  }, [draws, symbols])

  // ── #7 Markov: ລູກງວດກ່ອນ → ລູກງວດຖັດໄປ ─────────────────────────
  const markov = useMemo(() => {
    if (draws.length < 6 || !symbols.length) return null
    const ID = symbols.map(s => s.symbol_id)
    const prevCount = {}
    const trans = {}
    ID.forEach(a => {
      prevCount[a] = 0
      trans[a] = {}
      ID.forEach(b => { trans[a][b] = 0 })
    })
    // draws[idx] ໃໝ່ກວ່າ draws[idx+1] → (ກ່ອນ = draws[idx+1], ຖັດໄປ = draws[idx])
    for (let idx = 0; idx < draws.length - 1; idx++) {
      const prev = new Set([draws[idx + 1].pos1, draws[idx + 1].pos2, draws[idx + 1].pos3].filter(Boolean))
      const next = new Set([draws[idx].pos1, draws[idx].pos2, draws[idx].pos3].filter(Boolean))
      prev.forEach(a => {
        prevCount[a]++
        next.forEach(b => { trans[a][b]++ })
      })
    }
    const rows = ID.map(a => ({
      symbol_id: a,
      total: prevCount[a],
      to: ID.map(b => ({
        symbol_id: b,
        self: a === b,
        pct: prevCount[a] ? trans[a][b] / prevCount[a] : 0,
      })),
    }))
    return { rows, pairs: draws.length - 1, baseline: 1 - Math.pow(5 / 6, 3) }
  }, [draws, symbols])

  // ── #8 ຮູບແບບ ຕາມຊົ່ວໂມງ / ວັນ (+ χ² ເຊັກ "ຊົ່ວໂມງມີຜົນບໍ່") ──────
  const timePattern = useMemo(() => {
    if (draws.length < 10 || !symbols.length) return null
    const ID = symbols.map(s => s.symbol_id)
    const hourOf = (d) => {
      if (d.draw_hour !== null && d.draw_hour !== undefined) return d.draw_hour
      const m = /[ T](\d{2}):/.exec(d.draw_at || '')
      return m ? parseInt(m[1], 10) : null
    }
    const dowOf = (d) => {
      const s = d.draw_date || (d.draw_at || '').slice(0, 10)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
      const dt = new Date(`${s}T00:00:00`)
      return Number.isNaN(dt.getTime()) ? null : dt.getDay()
    }
    const bucketize = (keyOf) => {
      const map = {}
      draws.forEach(d => {
        const k = keyOf(d)
        if (k === null) return
        if (!map[k]) map[k] = { key: k, draws: 0, hits: {}, pairCount: {} }
        map[k].draws++
        ;[d.pos1, d.pos2, d.pos3].forEach(v => {
          if (v) map[k].hits[v] = (map[k].hits[v] || 0) + 1
        })
        // ຄູ່ລູກ ທີ່ອອກພ້ອມກັນ ໃນງວດດຽວກັນ (ນັບ 1 ຄັ້ງ/ງວດ)
        const uniq = [...new Set([d.pos1, d.pos2, d.pos3].filter(Boolean))]
        for (let i = 0; i < uniq.length; i++) {
          for (let j = i + 1; j < uniq.length; j++) {
            const pk = `${Math.min(uniq[i], uniq[j])}-${Math.max(uniq[i], uniq[j])}`
            map[k].pairCount[pk] = (map[k].pairCount[pk] || 0) + 1
          }
        }
      })
      return Object.values(map).map(b => {
        const ranked = ID
          .map(i => ({ symbol_id: i, hits: b.hits[i] || 0 }))
          .sort((x, y) => y.hits - x.hits)
        const tot = b.draws * 3
        const repeatPairs = Object.entries(b.pairCount)
          .map(([pk, times]) => {
            const [a, bb] = pk.split('-').map(Number)
            return { a, b: bb, times, pct: b.draws ? Math.round((times / b.draws) * 100) : 0 }
          })
          .filter(p => p.times >= 2)
          .sort((x, y) => y.times - x.times)
          .slice(0, 3)
        return {
          key: b.key,
          draws: b.draws,
          top: ranked[0],
          topPct: tot ? Math.round((ranked[0].hits / tot) * 100) : 0,
          hits: b.hits,
          repeatPairs,
        }
      }).sort((a, b) => a.key - b.key)
    }
    const byHour = bucketize(hourOf)
    const byDow  = bucketize(dowOf)

    // χ² independence: ຊົ່ວໂມງ × ລູກ (ໃຊ້ຈຳນວນ hits)
    let hourChi2 = 0
    let hourDf = 0
    let hourSignificant = false
    if (byHour.length >= 2) {
      const rowTot = byHour.map(h => ID.reduce((s, i) => s + (h.hits[i] || 0), 0))
      const colTot = ID.map(i => byHour.reduce((s, h) => s + (h.hits[i] || 0), 0))
      const grand  = rowTot.reduce((s, v) => s + v, 0)
      if (grand > 0) {
        byHour.forEach((h, r) => {
          ID.forEach((i, c) => {
            const e = (rowTot[r] * colTot[c]) / grand
            if (e > 0) hourChi2 += Math.pow((h.hits[i] || 0) - e, 2) / e
          })
        })
        hourDf = (byHour.length - 1) * (ID.length - 1)
        hourSignificant = hourChi2 > chi2Critical05(hourDf)
      }
    }
    return {
      byHour, byDow, hourChi2, hourDf, hourSignificant,
      hasHour: byHour.length >= 2, hasDow: byDow.length >= 2,
    }
  }, [draws, symbols])

  const aiPayload = useMemo(() => ({
    totalDraws: draws.length,
    frequency: freq.map(f => ({
      name_lo: f.name_lo, total_hits: f.total_hits,
      pct_of_all: f.pct_of_all, draws_appeared: f.draws_appeared,
    })),
    gap: gap.map(g => ({
      name_lo: g.name_lo, draws_since: g.draws_since, last_draw_no: g.last_draw_no,
    })),
    byPosition: byPos.map(p => ({
      name_lo: p.name_lo, pos1: p.pos1, pos2: p.pos2, pos3: p.pos3,
    })),
    pairs: topPairs.slice(0, 6).map(p => ({
      s1: symById[p.a]?.name_lo, s2: symById[p.b]?.name_lo, times: p.times,
    })),
    rarePairs: rarePairs.slice(0, 5).map(p => ({
      s1: symById[p.a]?.name_lo, s2: symById[p.b]?.name_lo, times: p.times,
    })),
    pairTriple: (pairs.per_symbol || []).map(s => ({
      name_lo: s.name_lo, times_pair: s.times_pair, times_triple: s.times_triple,
    })),
    rolling: rolling.map(r => ({
      name_lo: symById[r.symbol_id]?.name_lo,
      last10Pct: Math.round(r.p10 * 100),
      last20Pct: Math.round(r.p20 * 100),
      trendPP: Math.round(r.trend * 1000) / 10,
    })),
    markov: markov ? markov.rows.map(row => ({
      from: symById[row.symbol_id]?.name_lo,
      repeatPct: Math.round((row.to.find(t => t.self)?.pct || 0) * 100),
      topNext: row.to.filter(t => !t.self).sort((a, b) => b.pct - a.pct).slice(0, 2)
        .map(t => ({ name_lo: symById[t.symbol_id]?.name_lo, pct: Math.round(t.pct * 100) })),
    })) : null,
    timePattern: timePattern ? {
      hourChi2: Math.round(timePattern.hourChi2 * 10) / 10,
      hourDf: timePattern.hourDf,
      hourSignificant: timePattern.hourSignificant,
      hourRepeatPairs: timePattern.byHour
        .filter(h => h.repeatPairs.length > 0)
        .map(h => ({
          hour: h.key,
          draws: h.draws,
          pairs: h.repeatPairs.map(p => ({
            a: symById[p.a]?.name_lo, b: symById[p.b]?.name_lo, times: p.times, pct: p.pct,
          })),
        })),
    } : null,
  }), [draws.length, freq, gap, byPos, pairs, topPairs, rarePairs, rolling, markov, timePattern, symById])

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
          <Dices size={26} color="#fff" />
        </div>
        <div>
          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight leading-tight"
            style={{
              background: 'linear-gradient(135deg,#ef4444 0%,#f97316 45%,#eab308 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}
          >
            ຫວຍປູປາເຕົ້າມະຫາໂຊກ
          </h1>
          <p className="text-sm text-[#94a3b8]">ລູກ 6 ໜ່ວຍ · 3 ໜ່ວຍ / ງວດ · ສະຖິຕິ {draws.length} ງວດ</p>
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div className="flex gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-4">
        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
          <strong>ໝາຍເຫດ:</strong> ສະຖິຕິໃຊ້ເບິ່ງຂໍ້ມູນອະດີດເທົ່ານັ້ນ — ການອອກລູກແຕ່ລະຄັ້ງເປັນເອກະລາດ ບໍ່ສາມາດ<strong>ທຳນາຍ</strong>ອະນາຄົດໄດ້.
        </p>
      </div>

      {/* ── CTA → prediction page ── */}
      <Link
        to="/puplatao/next"
        className="flex items-center justify-between gap-3 rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
        style={{ background: 'linear-gradient(135deg,#ef444422,#f9731618)', border: '1px solid #f9731644' }}
      >
        <span className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#f9731626' }}>
            <Target size={17} className="text-[#f97316]" />
          </span>
          <span className="text-sm font-bold text-[#334155] dark:text-[#e2e8f0]">
            ສູດຄິດ 3 ຄູ່ລູກ ງວດຖັດໄປ + AI ວິເຄາະ
          </span>
        </span>
        <ArrowRight size={16} className="text-[#f97316] shrink-0" />
      </Link>

      {/* ── CTA → avoid page (ສູດກົງກັນຂ້າມ) ── */}
      <Link
        to="/puplatao/avoid"
        className="flex items-center justify-between gap-3 rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
        style={{ background: 'linear-gradient(135deg,#3b82f622,#6366f118)', border: '1px solid #6366f144' }}
      >
        <span className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#6366f126' }}>
            <ShieldOff size={17} className="text-[#6366f1]" />
          </span>
          <span className="text-sm font-bold text-[#334155] dark:text-[#e2e8f0]">
            ສູດກົງກັນຂ້າມ — 3 ຄູ່ລູກ ທີ່ຄວນຫຼີກ + AI ວິເຄາະ
          </span>
        </span>
        <ArrowRight size={16} className="text-[#6366f1] shrink-0" />
      </Link>

      {/* ── AI Insight ── */}
      {!loading && freq.length > 0 && (
        <AiSummaryCard
          context="puplatao"
          title="AI ວິເຄາະ ຫວຍປູປາເຕົ້າ"
          hint="ໃຫ້ Claude AI ອ່ານສະຖິຕິລູກ 6 ໜ່ວຍ (ຄວາມຖີ່ · ລູກຄ້າງ · ຄູ່ລູກ) ແລ້ວສະຫຼຸບເປັນພາສາລາວແບບເຂົ້າໃຈງ່າຍ"
          payload={aiPayload}
        />
      )}

      {/* ── Symbol legend ── */}
      <div className={CARD}>
        <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-3 flex items-center gap-2">
          <Layers size={14} className="text-[#f97316]" /> ລູກທັງ 6 ໜ່ວຍ
        </h3>
        <div className="flex flex-wrap gap-3">
          {symbols.map(s => (
            <div key={s.symbol_id} className="flex items-center gap-2">
              <SymbolChip sym={s} size={36} />
              <span className="text-sm font-semibold text-[#334155] dark:text-[#cbd5e1]">{s.name_lo}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-56 bg-[#f1f5f9] dark:bg-[#0c1426] rounded-2xl animate-pulse border border-[#e8edf8] dark:border-white/4" />
          ))}
        </div>
      ) : (
        <>
          {/* ── Frequency ── */}
          <div className={CARD}>
            <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-[#f97316]" /> ຄວາມຖີ່ລວມ ຂອງແຕ່ລະລູກ
            </h3>
            <div className="space-y-3">
              {freq.map((f, i) => {
                const c = SYM_COLOR[f.symbol_id] || '#64748b'
                return (
                  <div key={f.symbol_id} className="flex items-center gap-3">
                    <SymbolChip sym={symById[f.symbol_id]} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-sm font-bold text-[#334155] dark:text-[#cbd5e1] flex items-center gap-1.5">
                          {i === 0 && <Crown size={12} className="text-[#eab308]" />}
                          {f.name_lo}
                        </span>
                        <span className="text-xs tabular-nums text-[#64748b]">
                          <b style={{ color: c }}>{f.total_hits}</b> ຄັ້ງ · {f.pct_of_all}% · ອອກ {f.draws_appeared}/{draws.length} ງວດ
                        </span>
                      </div>
                      <Bar pct={(f.total_hits / maxHits) * 100} color={c} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── By position ── */}
          <div className={CARD}>
            <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-4 flex items-center gap-2">
              <Layers size={14} className="text-[#f97316]" /> ຄວາມຖີ່ ແຍກຕາມຕຳແໜ່ງ (ໜ່ວຍ 1 / 2 / 3)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8]">
                    <th className="text-left py-2">ລູກ</th>
                    <th className="text-center py-2">ໜ່ວຍ 1</th>
                    <th className="text-center py-2">ໜ່ວຍ 2</th>
                    <th className="text-center py-2">ໜ່ວຍ 3</th>
                    <th className="text-right py-2">ລວມ</th>
                  </tr>
                </thead>
                <tbody>
                  {byPos.map(p => (
                    <tr key={p.symbol_id} className="border-t border-[#eef2f9] dark:border-white/5">
                      <td className="py-2.5">
                        <span className="flex items-center gap-2 font-semibold text-[#334155] dark:text-[#cbd5e1]">
                          <SymbolChip sym={symById[p.symbol_id]} size={30} /> {p.name_lo}
                        </span>
                      </td>
                      <td className="text-center tabular-nums">{p.pos1}</td>
                      <td className="text-center tabular-nums">{p.pos2}</td>
                      <td className="text-center tabular-nums">{p.pos3}</td>
                      <td className="text-right font-bold tabular-nums" style={{ color: SYM_COLOR[p.symbol_id] }}>{p.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Gap ── */}
          <div className={CARD}>
            <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-4 flex items-center gap-2">
              <Timer size={14} className="text-[#f97316]" /> ລູກໃດຫາຍໄປດົນສຸດ (gap)
            </h3>
            <div className="space-y-2">
              {gap.map(g => (
                <div key={g.symbol_id} className="flex items-center gap-3 text-sm">
                  <SymbolChip sym={symById[g.symbol_id]} size={30} />
                  <span className="font-semibold text-[#334155] dark:text-[#cbd5e1] w-16">{g.name_lo}</span>
                  <span
                    className="px-2 py-0.5 rounded-md text-xs font-bold tabular-nums"
                    style={{
                      background: g.draws_since === 0 ? '#22c55e1a' : g.draws_since >= 10 ? '#ef44441a' : '#64748b1a',
                      color: g.draws_since === 0 ? '#16a34a' : g.draws_since >= 10 ? '#dc2626' : '#64748b',
                    }}
                  >
                    ຄ້າງ {g.draws_since} ງວດ
                  </span>
                  <span className="text-xs text-[#94a3b8] ml-auto">
                    {g.last_seen_at ? `ລ່າສຸດ ${g.last_seen_at.slice(0, 16)} · ງວດ ${g.last_draw_no}` : 'ຍັງບໍ່ເຄີຍອອກ'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Top pairs (ຮ້ອນ) ── */}
          <div className={CARD}>
            <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-1 flex items-center gap-2">
              <TrendingUp size={14} className="text-[#f97316]" /> ຄູ່ລູກທີ່ອອກພ້ອມກັນເລື້ອຍໆ
            </h3>
            <p className="text-xs text-[#94a3b8] mb-4">
              ນັບ 1 ຄັ້ງ/ງວດ · ຈາກ {draws.length} ງວດ · ເສັ້ນຖານສະເໝີພາບ ≈ {PAIR_BASE_PCT.toFixed(1)}% ຂອງງວດ
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {topPairs.map(p => {
                const up = p.pct >= PAIR_BASE_PCT
                return (
                  <div
                    key={`${p.a}-${p.b}`}
                    className="flex items-center justify-between rounded-xl px-3 py-2"
                    style={{ background: '#f9731610', border: '1px solid #f9731626' }}
                  >
                    <span className="text-sm font-semibold text-[#334155] dark:text-[#cbd5e1]">
                      {symById[p.a]?.emoji} {symById[p.a]?.name_lo}{' '}
                      <span className="text-[#94a3b8]">+</span>{' '}
                      {symById[p.b]?.emoji} {symById[p.b]?.name_lo}
                    </span>
                    <span className="text-right shrink-0 pl-2">
                      <span className="text-xs font-bold tabular-nums text-[#f97316]">{p.times}×</span>
                      <span
                        className="block text-[10px] tabular-nums"
                        style={{ color: up ? '#16a34a' : '#94a3b8' }}
                      >
                        {up ? '▲' : '▼'} {p.pct.toFixed(1)}%
                      </span>
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#94a3b8]">
              {pairs.per_symbol.map(s => (
                <span key={s.symbol_id}>
                  {s.emoji} ຄູ່ {s.times_pair}× · ຕອງ {s.times_triple}×
                </span>
              ))}
            </div>
          </div>

          {/* ── Rare pairs (ເຢັນ — ກົງກັນຂ້າມກັບບັດເທິງ) ── */}
          <div className={CARD}>
            <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-1 flex items-center gap-2">
              <TrendingDown size={14} className="text-[#3b82f6]" /> ຄູ່ລູກທີ່ອອກພ້ອມກັນໜ້ອຍສຸດ
            </h3>
            <p className="text-xs text-[#94a3b8] mb-4">
              ຄິດຄົບທັງ {pairStats.length} ຄູ່ ລວມຄູ່ທີ່ຍັງບໍ່ເຄີຍອອກພ້ອມກັນ (0 ຄັ້ງ)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {rarePairs.map(p => {
                const never = p.times === 0
                return (
                  <div
                    key={`${p.a}-${p.b}`}
                    className="flex items-center justify-between rounded-xl px-3 py-2"
                    style={{
                      background: never ? '#ef444410' : '#3b82f60f',
                      border: `1px solid ${never ? '#ef444433' : '#3b82f626'}`,
                    }}
                  >
                    <span className="text-sm font-semibold text-[#334155] dark:text-[#cbd5e1]">
                      {symById[p.a]?.emoji} {symById[p.a]?.name_lo}{' '}
                      <span className="text-[#94a3b8]">+</span>{' '}
                      {symById[p.b]?.emoji} {symById[p.b]?.name_lo}
                    </span>
                    <span className="text-right shrink-0 pl-2">
                      {never ? (
                        <span className="text-[10px] font-bold text-[#dc2626] leading-tight">
                          ຍັງບໍ່ເຄີຍ<br />ອອກພ້ອມກັນ
                        </span>
                      ) : (
                        <>
                          <span className="text-xs font-bold tabular-nums text-[#3b82f6]">{p.times}×</span>
                          <span className="block text-[10px] tabular-nums text-[#94a3b8]">
                            ▼ {p.pct.toFixed(1)}%
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="mt-4 text-[11px] text-[#94a3b8] leading-relaxed">
              ຄູ່ທີ່ອອກໜ້ອຍກວ່າເສັ້ນຖານ {PAIR_BASE_PCT.toFixed(1)}% ຫຼາຍ ອາດພຽງແຕ່ຍັງເກັບຂໍ້ມູນບໍ່ພໍ —
              ບໍ່ໄດ້ໝາຍຄວາມວ່າ “ຮອດຄິວ” ຈະອອກ.
            </p>
          </div>

          {/* ── #6 ຮ້ອນ / ເຢັນ ຕາມช່วง ── */}
          {rolling.length > 0 && (
            <div className={CARD}>
              <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-4 flex items-center gap-2">
                <Flame size={14} className="text-[#f97316]" /> ຮ້ອນ / ເຢັນ ຕາມช່วง (5 / 10 / 20 / 50 ງວດ)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8]">
                      <th className="text-left py-2">ລູກ</th>
                      {WINDOWS.map(w => <th key={w} className="text-center py-2">{w} ງວດ</th>)}
                      <th className="text-right py-2">ເທຣນ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rolling.map(r => (
                      <tr key={r.symbol_id} className="border-t border-[#eef2f9] dark:border-white/5">
                        <td className="py-2.5">
                          <span className="flex items-center gap-2 font-semibold text-[#334155] dark:text-[#cbd5e1]">
                            <SymbolChip sym={symById[r.symbol_id]} size={30} /> {symById[r.symbol_id]?.name_lo}
                          </span>
                        </td>
                        {WINDOWS.map(w => {
                          const p = r[`p${w}`]
                          return (
                            <td key={w} className="text-center tabular-nums">
                              <span className="font-bold" style={{ color: p > SLOT_BASE ? '#16a34a' : '#dc2626' }}>{r[`w${w}`]}</span>
                              <span className="block text-[10px] text-[#94a3b8]">{Math.round(p * 100)}%</span>
                            </td>
                          )
                        })}
                        <td className="text-right tabular-nums">
                          {(() => {
                            const t = r.trend
                            const Icon = t > 0.005 ? ArrowUp : t < -0.005 ? ArrowDown : Minus
                            const c = t > 0.005 ? '#16a34a' : t < -0.005 ? '#dc2626' : '#94a3b8'
                            return (
                              <span className="inline-flex items-center gap-1 font-bold" style={{ color: c }}>
                                <Icon size={13} />{(t * 100).toFixed(1)}
                              </span>
                            )
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[11px] text-[#94a3b8] leading-relaxed">
                ເສັ້ນຖານ ≈ 16.7% ຕໍ່ລູກ · <span style={{ color: '#16a34a' }}>ຂຽວ</span> = ຖີ່ກວ່າຄາດ ·{' '}
                <span style={{ color: '#dc2626' }}>ແດງ</span> = ໜ້ອຍກວ່າຄາດ · ເທຣນ = freq 10 ງວດ ລົບ freq 30 ງວດ (ບວກ = ກຳລັງມາແຮງ)
              </p>
            </div>
          )}

          {/* ── #7 Markov transition ── */}
          {markov && (
            <div className={CARD}>
              <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-4 flex items-center gap-2">
                <Grid3x3 size={14} className="text-[#f97316]" /> ລູກງວດກ່ອນ → ລູກງວດຖັດໄປ (Markov)
              </h3>
              <div className="overflow-x-auto">
                <div style={{ minWidth: 420 }}>
                  <div className="grid gap-1" style={{ gridTemplateColumns: '72px repeat(6, 1fr)' }}>
                    <div />
                    {markov.rows.map(row => (
                      <div key={row.symbol_id} className="flex items-center justify-center pb-1">
                        <SymbolChip sym={symById[row.symbol_id]} size={26} />
                      </div>
                    ))}
                  </div>
                  {markov.rows.map(row => (
                    <div key={row.symbol_id} className="grid gap-1 mb-1" style={{ gridTemplateColumns: '72px repeat(6, 1fr)' }}>
                      <div className="flex items-center gap-1">
                        <SymbolChip sym={symById[row.symbol_id]} size={26} />
                        <ArrowRight size={11} className="text-[#94a3b8]" />
                      </div>
                      {row.to.map(cell => {
                        const d = cell.pct - markov.baseline
                        const mag = Math.min(Math.abs(d) / markov.baseline, 1)
                        const a = (0.08 + mag * 0.42).toFixed(3)
                        const bg = d >= 0 ? `rgba(34,197,94,${a})` : `rgba(239,68,68,${a})`
                        return (
                          <div
                            key={cell.symbol_id}
                            className="rounded-lg py-2 text-center text-xs font-bold tabular-nums text-[#334155] dark:text-[#e2e8f0]"
                            style={{ background: bg, outline: cell.self ? '2px solid #f97316' : 'none', outlineOffset: '-2px' }}
                            title={`${symById[row.symbol_id]?.name_lo} → ${symById[cell.symbol_id]?.name_lo}: ${Math.round(cell.pct * 100)}%`}
                          >
                            {row.total ? Math.round(cell.pct * 100) : '–'}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-[11px] text-[#94a3b8] leading-relaxed">
                ຕົວເລກ = % ທີ່ລູກ (ແຖວ) ຕາມດ້ວຍ ລູກ (ຖັນ) ໃນງວດຖັດໄປ · ເສັ້ນຖານ ≈ {Math.round(markov.baseline * 100)}% ·{' '}
                <span style={{ color: '#f97316' }}>ຂອບສົ້ມ</span> = ລູກຊ້ຳຕົວເອງ · ຄິດຈາກ {markov.pairs} ຄູ່ງວດຕິດກັນ
              </p>
            </div>
          )}

          {/* ── #8 ຮູບແບບ ຕາມຊົ່ວໂມງ / ວັນ ── */}
          {timePattern && (timePattern.hasHour || timePattern.hasDow) && (
            <div className={CARD}>
              <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-4 flex items-center gap-2">
                <Clock size={14} className="text-[#f97316]" /> ຮູບແບບ ຕາມຊົ່ວໂມງ / ວັນ
              </h3>
              {timePattern.hasHour && timePattern.hourDf > 0 && (
                <div
                  className="mb-4 rounded-xl px-3 py-2 text-xs font-semibold"
                  style={{
                    background: timePattern.hourSignificant ? '#ef444414' : '#22c55e14',
                    color: timePattern.hourSignificant ? '#dc2626' : '#16a34a',
                  }}
                >
                  χ² = {timePattern.hourChi2.toFixed(1)} · df {timePattern.hourDf} —{' '}
                  {timePattern.hourSignificant
                    ? 'ຊົ່ວໂມງ ມີຜົນຕໍ່ລູກທີ່ອອກ (p < 0.05)'
                    : 'ບໍ່ມີໄນຍະ — ລູກທີ່ອອກ ບໍ່ຂຶ້ນກັບຊົ່ວໂມງ'}
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-5">
                {timePattern.hasHour && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8] mb-2">ຕາມຊົ່ວໂມງ</p>
                    <div className="space-y-2">
                      {timePattern.byHour.map(h => (
                        <div key={h.key} className="flex items-center gap-2 text-sm">
                          <span className="w-12 tabular-nums text-[#64748b]">{String(h.key).padStart(2, '0')}:00</span>
                          <span className="text-xs text-[#94a3b8] w-12">{h.draws} ງວດ</span>
                          <SymbolChip sym={symById[h.top.symbol_id]} size={26} />
                          <span className="text-xs font-bold text-[#334155] dark:text-[#cbd5e1]">{symById[h.top.symbol_id]?.name_lo}</span>
                          <span className="ml-auto text-xs font-bold tabular-nums text-[#f97316]">{h.topPct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {timePattern.hasDow && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8] mb-2">ຕາມວັນ</p>
                    <div className="space-y-2">
                      {timePattern.byDow.map(d => (
                        <div key={d.key} className="flex items-center gap-2 text-sm">
                          <span className="w-12 text-[#64748b]">{DOW_LO[d.key]}</span>
                          <span className="text-xs text-[#94a3b8] w-12">{d.draws} ງວດ</span>
                          <SymbolChip sym={symById[d.top.symbol_id]} size={26} />
                          <span className="text-xs font-bold text-[#334155] dark:text-[#cbd5e1]">{symById[d.top.symbol_id]?.name_lo}</span>
                          <span className="ml-auto text-xs font-bold tabular-nums text-[#f97316]">{d.topPct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── ຄູ່ລູກ ທີ່ອອກຊ້ຳ ໃນຊົ່ວໂມງດຽວກັນ ── */}
              {timePattern.hasHour && timePattern.byHour.some(h => h.repeatPairs.length > 0) && (
                <div className="mt-5 pt-4 border-t border-[#eef2f9] dark:border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8] mb-2">
                    ຄູ່ລູກ ທີ່ອອກຊ້ຳ ໃນຊົ່ວໂມງດຽວກັນ (≥ 2 ຄັ້ງ)
                  </p>
                  <div className="space-y-2">
                    {timePattern.byHour.filter(h => h.repeatPairs.length > 0).map(h => (
                      <div key={h.key} className="flex items-start gap-2 flex-wrap text-sm">
                        <span className="w-12 tabular-nums text-[#64748b] shrink-0 pt-1.5">{String(h.key).padStart(2, '0')}:00</span>
                        <div className="flex flex-wrap gap-1.5">
                          {h.repeatPairs.map((p, i) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-[#f8fafc] dark:bg-white/5 rounded-lg px-2 py-1">
                              <SymbolChip sym={symById[p.a]} size={22} />
                              <SymbolChip sym={symById[p.b]} size={22} />
                              <span className="text-xs font-bold tabular-nums text-[#f97316]">{p.times}×</span>
                              <span className="text-[10px] text-[#94a3b8]">({p.pct}%)</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-[#94a3b8]">% = ອອກຊ້ຳ ຄິດເປັນ ຈຳນວນງວດ ໃນຊົ່ວໂມງນັ້ນ</p>
                </div>
              )}
            </div>
          )}

          {/* ── Recent draws ── */}
          <div className={CARD}>
            <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-4 flex items-center gap-2">
              <Dices size={14} className="text-[#f97316]" /> ຜົນອອກ 15 ງວດຫຼ້າສຸດ
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8]">
                    <th className="text-left py-2">ງວດ</th>
                    <th className="text-left py-2">ວັນ-ເວລາ</th>
                    <th className="text-center py-2">ຜົນອອກ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDraws.map(d => (
                    <tr key={d.draw_no} className="border-t border-[#eef2f9] dark:border-white/5">
                      <td className="py-2.5 font-bold tabular-nums text-[#334155] dark:text-[#cbd5e1]">{d.draw_no}</td>
                      <td className="py-2.5 text-xs text-[#64748b] tabular-nums">{d.draw_at?.slice(0, 16)}</td>
                      <td className="py-2.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {d.results.map((r, i) => <SymbolChip key={i} sym={r} size={34} />)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
