import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  AlertCircle, RefreshCw, Dices, TrendingUp, Timer, Layers, Crown,
} from 'lucide-react'
import { API as API_BASE } from '../utils/api'
import AiSummaryCard from '../components/AiSummaryCard'

const API = `${API_BASE}/puplatao.php`

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
    pairs: (pairs.pairs || []).slice(0, 6).map(p => ({ s1: p.s1, s2: p.s2, times: p.times })),
    pairTriple: (pairs.per_symbol || []).map(s => ({
      name_lo: s.name_lo, times_pair: s.times_pair, times_triple: s.times_triple,
    })),
  }), [draws.length, freq, gap, byPos, pairs])

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
          <p className="text-sm text-[#94a3b8]">ໝາກ 6 ໜ່ວຍ · 3 ໜ່ວຍ / ງວດ · ສະຖິຕິ {draws.length} ງວດ</p>
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div className="flex gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-4">
        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
          <strong>ໝາຍເຫດ:</strong> ສະຖິຕິໃຊ້ເບິ່ງຂໍ້ມູນອະດີດເທົ່ານັ້ນ — ການອອກໝາກແຕ່ລະຄັ້ງເປັນເອກະລາດ ບໍ່ສາມາດ<strong>ທຳນາຍ</strong>ອະນາຄົດໄດ້.
        </p>
      </div>

      {/* ── AI Insight ── */}
      {!loading && freq.length > 0 && (
        <AiSummaryCard
          context="puplatao"
          title="AI ວິເຄາະ ຫວຍປູປາເຕົ້າ"
          hint="ໃຫ້ Claude AI ອ່ານສະຖິຕິໝາກ 6 ໜ່ວຍ (ຄວາມຖີ່ · ໝາກຄ້າງ · ຄູ່ໝາກ) ແລ້ວສະຫຼຸບເປັນພາສາລາວແບບເຂົ້າໃຈງ່າຍ"
          payload={aiPayload}
        />
      )}

      {/* ── Symbol legend ── */}
      <div className={CARD}>
        <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-3 flex items-center gap-2">
          <Layers size={14} className="text-[#f97316]" /> ໝາກທັງ 6 ໜ່ວຍ
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
              <TrendingUp size={14} className="text-[#f97316]" /> ຄວາມຖີ່ລວມ ຂອງແຕ່ລະໝາກ
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
                    <th className="text-left py-2">ໝາກ</th>
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
              <Timer size={14} className="text-[#f97316]" /> ໝາກໃດຫາຍໄປດົນສຸດ (gap)
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

          {/* ── Top pairs ── */}
          <div className={CARD}>
            <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-[#f97316]" /> ຄູ່ໝາກທີ່ອອກພ້ອມກັນເລື້ອຍໆ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {pairs.pairs.slice(0, 8).map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-[#f8fafc] dark:bg-white/5 rounded-xl px-3 py-2">
                  <span className="text-sm font-semibold text-[#334155] dark:text-[#cbd5e1]">
                    {p.e1} {p.s1} <span className="text-[#94a3b8]">+</span> {p.e2} {p.s2}
                  </span>
                  <span className="text-xs font-bold tabular-nums text-[#f97316]">{p.times}×</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#94a3b8]">
              {pairs.per_symbol.map(s => (
                <span key={s.symbol_id}>
                  {s.emoji} ຄູ່ {s.times_pair}× · ຕອງ {s.times_triple}×
                </span>
              ))}
            </div>
          </div>

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
