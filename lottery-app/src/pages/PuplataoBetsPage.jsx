import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet, RefreshCw, AlertCircle, Target, ShieldOff, ArrowRight,
  TrendingUp, TrendingDown, Minus, Info,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { API as API_BASE } from '../utils/api'

const API = `${API_BASE}/puplatao-bets.php`

const KIND_META = {
  predict_pair: {
    short: 'ຄູ່ແທງ', title: 'ຄູ່ລູກ ງວດຖັດໄປ', win: 'ອອກທັງສອງລູກ',
    accent: '#f97316', Icon: Target, href: '/puplatao/next', multiplier: '6',
  },
  avoid_pair: {
    short: 'ຄູ່ຫຼີກ', title: 'ຄູ່ລູກ ທີ່ຄວນຫຼີກ', win: 'ບໍ່ອອກທັງສອງລູກ',
    accent: '#6366f1', Icon: ShieldOff, href: '/puplatao/avoid', multiplier: '3',
  },
}

const STATUS_META = {
  pending: { label: 'ລໍຜົນ', color: '#d97706', bg: '#f59e0b1f' },
  won:     { label: 'ຖືກ',   color: '#16a34a', bg: '#22c55e1f' },
  lost:    { label: 'ບໍ່ຖືກ', color: '#94a3b8', bg: '#64748b14' },
  void:    { label: 'ຍົກເລີກ', color: '#0284c7', bg: '#0ea5e91f' },
}

const SYM_COLOR = {
  1: '#22c55e', 2: '#f97316', 3: '#3b82f6', 4: '#ec4899', 5: '#eab308', 6: '#ef4444',
}

const PROFIT = '#16a34a'
const LOSS   = '#dc2626'

const CARD = 'bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5'

const fmt = (n) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })
const signed = (n) => `${Number(n) > 0 ? '+' : Number(n) < 0 ? '−' : ''}${fmt(Math.abs(Number(n) || 0))}`
const plColor = (n) => (Number(n) > 0 ? PROFIT : Number(n) < 0 ? LOSS : '#94a3b8')
const pct = (v) => (v === null || v === undefined ? '—' : `${Math.round(v * 1000) / 10}%`)

function fmtDateTime(str) {
  if (!str) return '—'
  return String(str).slice(5, 16).replace('-', '/').replace('T', ' ')
}

function SymBall({ id, emoji, size = 26 }) {
  const c = SYM_COLOR[id] || '#64748b'
  return (
    <span
      className="inline-flex items-center justify-center rounded-xl shrink-0"
      style={{ width: size, height: size, background: c + '1f', border: `1.5px solid ${c}55` }}
    >
      <span style={{ fontSize: size * 0.5, lineHeight: 1 }}>{emoji}</span>
    </span>
  )
}

/**
 * ເສັ້ນກຳໄລສະສົມ — ແກນນອນ = ງວດ (ຕາມລຳດັບຈິງ), ແກນຕັ້ງ = ກີບສະສົມ.
 * ເສັ້ນໜາ = ລວມ · ເສັ້ນບາງ 2 ເສັ້ນ = ແຍກຕາມສູດ · ເສັ້ນປະ = ຈຸດຄຸ້ມທຶນ (0 ກີບ).
 */
function EquityCurve({ series }) {
  const W = 800
  const H = 220
  const PAD = { t: 18, r: 14, b: 22, l: 14 }

  const geometry = useMemo(() => {
    if (!series.length) return null
    // ເລີ່ມທີ່ 0 ກີບ ກ່ອນບິນທຳອິດ ເພື່ອໃຫ້ເຫັນຈຸດອອກເດີນ
    const pts = [{ cum_pl: 0, cum_predict_pl: 0, cum_avoid_pl: 0, draw_no: null }, ...series]
    const values = pts.flatMap(p => [p.cum_pl, p.cum_predict_pl, p.cum_avoid_pl])
    let min = Math.min(0, ...values)
    let max = Math.max(0, ...values)
    if (min === max) { min -= 1; max += 1 }
    const span = max - min
    min -= span * 0.08
    max += span * 0.08

    const x = (i) => PAD.l + (pts.length === 1 ? 0 : (i * (W - PAD.l - PAD.r)) / (pts.length - 1))
    const y = (v) => PAD.t + ((max - v) / (max - min)) * (H - PAD.t - PAD.b)
    const path = (key) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ')

    const last = pts[pts.length - 1]
    return {
      pts, x, y,
      combined: path('cum_pl'),
      predict: path('cum_predict_pl'),
      avoid: path('cum_avoid_pl'),
      area: `${path('cum_pl')} L${x(pts.length - 1).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`,
      zeroY: y(0),
      lastX: x(pts.length - 1),
      lastY: y(last.cum_pl),
      last,
    }
  }, [series])

  if (!geometry) return null
  const up = geometry.last.cum_pl >= 0

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img"
           aria-label={`ເສັ້ນກຳໄລສະສົມ ${series.length} ງວດ, ປັດຈຸບັນ ${signed(geometry.last.cum_pl)} ກີບ`}>
        <defs>
          <linearGradient id="ppEquityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={up ? PROFIT : LOSS} stopOpacity="0.22" />
            <stop offset="100%" stopColor={up ? PROFIT : LOSS} stopOpacity="0" />
          </linearGradient>
        </defs>

        <line x1={PAD.l} x2={W - PAD.r} y1={geometry.zeroY} y2={geometry.zeroY}
              stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" opacity="0.55"
              vectorEffect="non-scaling-stroke" />

        <path d={geometry.area} fill="url(#ppEquityFill)" />
        <path d={geometry.predict} fill="none" stroke={KIND_META.predict_pair.accent}
              strokeWidth="1.5" opacity="0.55" vectorEffect="non-scaling-stroke" />
        <path d={geometry.avoid} fill="none" stroke={KIND_META.avoid_pair.accent}
              strokeWidth="1.5" opacity="0.55" vectorEffect="non-scaling-stroke" />
        <path d={geometry.combined} fill="none" stroke={up ? PROFIT : LOSS}
              strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
              vectorEffect="non-scaling-stroke" />

        {geometry.pts.map((p, i) => (
          p.draw_no ? (
            <circle key={p.draw_no} cx={geometry.x(i)} cy={geometry.y(p.cum_pl)} r="3"
                    fill={plColor(p.net_pl)} stroke="#fff" strokeWidth="1"
                    vectorEffect="non-scaling-stroke">
              <title>{`ງວດ ${p.draw_no} · ງວດນີ້ ${signed(p.net_pl)} · ສະສົມ ${signed(p.cum_pl)} ກີບ`}</title>
            </circle>
          ) : null
        ))}

        <circle cx={geometry.lastX} cy={geometry.lastY} r="5" fill={up ? PROFIT : LOSS} />
      </svg>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] text-[#94a3b8]">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-[2.5px] rounded" style={{ background: up ? PROFIT : LOSS }} /> ລວມ
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-[1.5px] rounded opacity-60" style={{ background: KIND_META.predict_pair.accent }} /> ຄູ່ແທງ
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-[1.5px] rounded opacity-60" style={{ background: KIND_META.avoid_pair.accent }} /> ຄູ່ຫຼີກ
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t border-dashed border-[#94a3b8]" /> ຄຸ້ມທຶນ
        </span>
        <span className="ml-auto tabular-nums">
          ງວດ {series[0]?.draw_no} → {series[series.length - 1]?.draw_no} · {series.length} ງວດ
        </span>
      </div>
    </div>
  )
}

/**
 * ອັດຕາຊະນະ ທຽບກັບ "ຈຸດຄຸ້ມທຶນ" ຂອງແຕ່ລະສູດ (= 1 / ຕົວຄູນ).
 * ນີ້ຄືຄຳຖາມແທ້ຂອງໜ້ານີ້: ສູດຊະນະຖີ່ພໍທີ່ຈະຄຸ້ມກັບອັດຕາຈ່າຍບໍ່.
 */
function BreakevenBar({ winRate, breakeven, accent }) {
  const w = winRate === null ? 0 : Math.min(100, winRate * 100)
  const be = Math.min(100, (breakeven || 0) * 100)
  const beating = winRate !== null && winRate >= breakeven
  return (
    <div>
      <div className="relative h-2.5 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
             style={{ width: `${w}%`, background: beating ? PROFIT : accent }} />
      </div>
      <div className="relative h-3">
        <span className="absolute -top-[13px] w-[2px] h-[18px] rounded bg-[#0f172a]/55 dark:bg-white/60"
              style={{ left: `calc(${be}% - 1px)` }} />
      </div>
      <p className="text-[10px] text-[#94a3b8] tabular-nums mt-0.5">
        ຊະນະ <b style={{ color: beating ? PROFIT : '#64748b' }}>{pct(winRate)}</b>
        {' '}· ຕ້ອງຊະນະເກີນ <b>{pct(breakeven)}</b> ຈຶ່ງຄຸ້ມທຶນ
      </p>
    </div>
  )
}

function KindCard({ row }) {
  const meta = KIND_META[row.bet_kind]
  const { Icon } = meta
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: meta.accent + '1f' }}>
            <Icon size={15} style={{ color: meta.accent }} />
          </span>
          <span>
            <span className="block text-sm font-black text-[#0f172a] dark:text-[#f1f5f9]">{meta.title}</span>
            <span className="block text-[10px] text-[#94a3b8]">ຊະນະເມື່ອ {meta.win} · ຈ່າຍ {row.multiplier}×</span>
          </span>
        </span>
        <Link to={meta.href} className="shrink-0 text-[#94a3b8] hover:text-[#64748b]" aria-label={`ໄປໜ້າ ${meta.title}`}>
          <ArrowRight size={16} />
        </Link>
      </div>

      <p className="text-2xl font-black tabular-nums leading-none" style={{ color: plColor(row.net_pl) }}>
        {signed(row.net_pl)} <span className="text-xs font-bold opacity-70">ກີບ</span>
      </p>
      <p className="text-[11px] text-[#94a3b8] tabular-nums mt-1 mb-3">
        {row.settled_bets} ບິນຄິດຜົນແລ້ວ · ລົງທຶນ {fmt(row.settled_staked)} · ໄດ້ຄືນ {fmt(row.total_returned)}
        {row.pending_bets > 0 && <> · ລໍຜົນ {row.pending_bets} ບິນ ({fmt(row.pending_staked)})</>}
      </p>

      <BreakevenBar winRate={row.win_rate} breakeven={row.breakeven_rate} accent={meta.accent} />

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#eef2f9] dark:border-white/5">
        <span className="text-[11px] font-bold text-[#64748b] dark:text-[#94a3b8]">ຜົນຕອບແທນຕໍ່ເງິນລົງ (ROI)</span>
        <span className="text-sm font-black tabular-nums" style={{ color: plColor(row.roi) }}>
          {row.roi === null ? '—' : `${row.roi > 0 ? '+' : ''}${Math.round(row.roi * 1000) / 10}%`}
        </span>
      </div>
    </div>
  )
}

export default function PuplataoBetsPage() {
  const { authFetch } = useAuth()
  const [pl, setPl]         = useState(null)
  const [bets, setBets]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [kindFilter, setKindFilter]     = useState('all')
  const [symbols, setSymbols] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/puplatao.php?r=symbols`)
      .then(r => (r.ok ? r.json() : []))
      .then(setSymbols)
      .catch(() => { /* ຕາຕະລາງຍັງອ່ານໄດ້ ເຖິງຊື່ລູກໂຫຼດບໍ່ມາ */ })
  }, [])

  const { symEmoji, symName } = useMemo(() => {
    const e = {}; const n = {}
    symbols.forEach(s => { e[s.symbol_id] = s.emoji; n[s.symbol_id] = s.name_lo })
    return { symEmoji: e, symName: n }
  }, [symbols])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(false)
    const qs = new URLSearchParams({ limit: '60' })
    if (statusFilter !== 'all') qs.set('status', statusFilter)
    if (kindFilter !== 'all') qs.set('kind', kindFilter)

    const [plRes, betsRes] = await Promise.all([
      authFetch(`${API}?r=pl`),
      authFetch(`${API}?r=bets&${qs}`),
    ])
    if (plRes.ok) setPl(plRes.data); else setError(true)
    if (betsRes.ok) setBets(betsRes.data.bets || [])
    setLoading(false)
  }, [authFetch, statusFilter, kindFilter])

  useEffect(() => { fetchAll() }, [fetchAll])

  const overall = pl?.overall
  const hasBets = (overall?.total_bets ?? 0) > 0
  const series  = pl?.series ?? []

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <AlertCircle size={30} className="text-red-400" />
        </div>
        <div className="text-center">
          <p className="font-black text-lg text-[#0f172a] dark:text-[#f1f5f9]">ໂຫຼດຜົນການແທງບໍ່ໄດ້</p>
          <p className="text-sm text-[#64748b] mt-1">ກວດສອບການເຊື່ອມຕໍ່ ແລ້ວລອງໃໝ່</p>
        </div>
        <button onClick={fetchAll}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer text-white"
                style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}>
          <RefreshCw size={14} /> ລອງໃໝ່
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-7 pb-16">
      {/* ── Header ── */}
      <div className="flex items-start gap-4 flex-wrap">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
             style={{ background: 'linear-gradient(135deg,#16a34a 0%,#22c55e 50%,#84cc16 100%)', boxShadow: '0 0 24px rgba(22,163,74,0.3)' }}>
          <Wallet size={26} color="#fff" />
        </div>
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight"
              style={{
                background: 'linear-gradient(135deg,#16a34a 0%,#22c55e 45%,#84cc16 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
            ກຳໄລ-ຂາດທຶນສະສົມ
          </h1>
          <p className="text-sm text-[#94a3b8]">ຜົນການແທງເງິນ demo ຕາມສູດ ຄູ່ລູກ ປູປາເຕົ້າ</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8]">ກະເປົາ demo</p>
            <p className="text-lg font-black tabular-nums text-[#0f172a] dark:text-[#f1f5f9]">
              {overall ? fmt(overall.balance) : '—'} <span className="text-[11px] font-bold text-[#94a3b8]">ກີບ</span>
            </p>
          </div>
          <button onClick={fetchAll} disabled={loading}
                  className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-40 bg-[#f1f5f9] dark:bg-white/5"
                  aria-label="ໂຫຼດຜົນໃໝ່">
            <RefreshCw size={15} className={`text-[#64748b] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── ບ່ອນວາງເດີມພັນແມ່ນຢູ່ 2 ໜ້າສູດ — ໜ້ານີ້ສະແດງຜົນຢ່າງດຽວ ຈຶ່ງຕ້ອງມີທາງໄປໃຫ້ຈະແຈ້ງ ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(KIND_META).map(([kind, m]) => (
          <Link key={kind} to={m.href}
                className="flex items-center gap-3 rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
                style={{ background: m.accent + '14', border: `1px solid ${m.accent}44` }}>
            <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: m.accent + '26' }}>
              <m.Icon size={18} style={{ color: m.accent }} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-black text-[#0f172a] dark:text-[#f1f5f9] truncate">
                ໄປວາງເດີມພັນ · {m.title}
              </span>
              <span className="block text-[11px] text-[#94a3b8]">ເລືອກ ຄູ່ 1/2/3 ແລ້ວແທງ · ຈ່າຍ {m.multiplier}×</span>
            </span>
            <ArrowRight size={16} className="ml-auto shrink-0" style={{ color: m.accent }} />
          </Link>
        ))}
      </div>

      <div className="flex gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-4">
        <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
          ທຸກຕົວເລກໃນໜ້ານີ້ແມ່ນ <strong>ເງິນ demo</strong> — ໃຊ້ວັດວ່າສູດຄູ່ລູກຢູ່ໜ້າ ຄູ່ລູກ ງວດຖັດໄປ
          ແລະ ຄູ່ລູກ ທີ່ຄວນຫຼີກ ເຮັດກຳໄລໄດ້ແທ້ບໍ່. ບໍ່ມີເງິນຈິງກ່ຽວຂ້ອງ.
        </p>
      </div>

      {loading && !pl ? (
        <div className="space-y-5">
          <div className="h-64 bg-[#f1f5f9] dark:bg-[#0c1426] rounded-2xl animate-pulse border border-[#e8edf8] dark:border-white/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="h-48 bg-[#f1f5f9] dark:bg-[#0c1426] rounded-2xl animate-pulse border border-[#e8edf8] dark:border-white/4" />
            <div className="h-48 bg-[#f1f5f9] dark:bg-[#0c1426] rounded-2xl animate-pulse border border-[#e8edf8] dark:border-white/4" />
          </div>
        </div>
      ) : !hasBets ? (
        <div className={`${CARD} text-center py-12`}>
          <p className="font-black text-base text-[#0f172a] dark:text-[#f1f5f9]">ຍັງບໍ່ມີບິນເດີມພັນ</p>
          <p className="text-sm text-[#64748b] mt-1.5">
            ເລືອກຄູ່ລູກຈາກ 2 ແຖບຂ້າງເທິງ ແລ້ວວາງເດີມພັນດ້ວຍເງິນ demo —
            ຜົນສະສົມຈະຂຶ້ນມາຢູ່ໜ້ານີ້ທຸກງວດ
          </p>
        </div>
      ) : (
        <>
          {/* ── ເສັ້ນກຳໄລສະສົມ ── */}
          <div className={CARD}>
            <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8] mb-1">ກຳໄລ-ຂາດທຶນສະສົມ</p>
                <p className="text-4xl sm:text-5xl font-black tabular-nums leading-none"
                   style={{ color: plColor(overall.net_pl) }}>
                  {signed(overall.net_pl)}
                  <span className="text-base font-bold opacity-70"> ກີບ</span>
                </p>
                <p className="text-xs text-[#94a3b8] tabular-nums mt-1.5 flex items-center gap-1.5">
                  {overall.net_pl > 0 ? <TrendingUp size={13} color={PROFIT} />
                    : overall.net_pl < 0 ? <TrendingDown size={13} color={LOSS} />
                      : <Minus size={13} />}
                  ຈາກ {overall.settled_bets} ບິນ · ລົງທຶນ {fmt(overall.settled_staked)} ກີບ
                  {overall.roi !== null && <> · ROI {overall.roi > 0 ? '+' : ''}{Math.round(overall.roi * 1000) / 10}%</>}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8]">ລໍຜົນງວດ {pl.next_draw_no}</p>
                <p className="text-lg font-black tabular-nums text-[#0f172a] dark:text-[#f1f5f9]">
                  {overall.pending_bets} <span className="text-[11px] font-bold text-[#94a3b8]">ບິນ · {fmt(overall.pending_staked)} ກີບ</span>
                </p>
              </div>
            </div>

            {series.length > 0 ? (
              <EquityCurve series={series} />
            ) : (
              <p className="text-sm text-[#64748b] text-center py-10">
                ຍັງບໍ່ມີງວດໃດຄິດຜົນແລ້ວ — ເສັ້ນຈະເລີ່ມແຕ້ມເມື່ອຜົນງວດ {pl.next_draw_no} ອອກ
              </p>
            )}
          </div>

          {/* ── ແຍກຕາມສູດ ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pl.by_kind.map(row => <KindCard key={row.bet_kind} row={row} />)}
          </div>

          {/* ── ຄູ່ລູກ ໄດ້/ເສຍ ຫຼາຍສຸດ ── */}
          {pl.pairs.length > 0 && (
            <div className={CARD}>
              <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-1">ຄູ່ລູກ ໄດ້-ເສຍ ຫຼາຍສຸດ</h3>
              <p className="text-xs text-[#94a3b8] mb-4">ນັບສະເພາະບິນທີ່ຄິດຜົນແລ້ວ — ໄລ່ຈາກກຳໄລຫຼາຍສຸດ ລົງຫາຂາດທຶນຫຼາຍສຸດ</p>
              <div className="space-y-2">
                {pl.pairs.map(p => {
                  const meta = KIND_META[p.bet_kind]
                  return (
                    <div key={`${p.bet_kind}-${p.symbol_a}-${p.symbol_b}`}
                         className="flex items-center gap-2.5 py-1.5 border-b border-[#f1f5f9] dark:border-white/5 last:border-0">
                      <span className="flex items-center gap-1 shrink-0">
                        <SymBall id={p.symbol_a} emoji={p.emoji_a} />
                        <SymBall id={p.symbol_b} emoji={p.emoji_b} />
                      </span>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0"
                            style={{ background: meta.accent + '1a', color: meta.accent }}>
                        {meta.short}
                      </span>
                      <span className="text-[11px] text-[#94a3b8] tabular-nums truncate">
                        {p.won_bets}/{p.total_bets} ບິນຖືກ · ລົງທຶນ {fmt(p.total_staked)}
                      </span>
                      <span className="ml-auto text-sm font-black tabular-nums shrink-0" style={{ color: plColor(p.net_pl) }}>
                        {signed(p.net_pl)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── ບິນທັງໝົດ ── */}
          <div className={CARD}>
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9]">ບິນເດີມພັນ</h3>
              <div className="flex gap-1.5 flex-wrap">
                {[['all', 'ທັງໝົດ'], ['pending', 'ລໍຜົນ'], ['won', 'ຖືກ'], ['lost', 'ບໍ່ຖືກ'], ['void', 'ຍົກເລີກ']].map(([v, label]) => (
                  <button key={v} onClick={() => setStatusFilter(v)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition-colors"
                          style={statusFilter === v
                            ? { background: '#16a34a', color: '#fff' }
                            : { background: '#16a34a12', color: '#16a34a' }}>
                    {label}
                  </button>
                ))}
                <span className="w-px bg-[#e8edf8] dark:bg-white/10 mx-1" />
                {[['all', 'ທຸກສູດ'], ['predict_pair', 'ຄູ່ແທງ'], ['avoid_pair', 'ຄູ່ຫຼີກ']].map(([v, label]) => (
                  <button key={v} onClick={() => setKindFilter(v)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition-colors"
                          style={kindFilter === v
                            ? { background: '#334155', color: '#fff' }
                            : { background: '#33415512', color: '#64748b' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {bets.length === 0 ? (
              <p className="text-sm text-[#64748b] text-center py-8">ບໍ່ມີບິນທີ່ກົງກັບຕົວກອງນີ້</p>
            ) : (
              <div className="overflow-x-auto -mx-1 px-1">
                <table className="w-full min-w-[620px] text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8]">
                      <th className="pb-2">ງວດ</th>
                      <th className="pb-2">ຄູ່ລູກ</th>
                      <th className="pb-2">ສູດ</th>
                      <th className="pb-2 text-right">ເດີມພັນ</th>
                      <th className="pb-2">ຜົນອອກ</th>
                      <th className="pb-2 text-center">ສະຖານະ</th>
                      <th className="pb-2 text-right">ກຳໄລ/ຂາດທຶນ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bets.map(b => {
                      const meta = KIND_META[b.bet_kind]
                      const st = STATUS_META[b.status]
                      return (
                        <tr key={b.bet_id} className="border-t border-[#f1f5f9] dark:border-white/5">
                          <td className="py-2 text-[11px] tabular-nums text-[#64748b] whitespace-nowrap">
                            {b.target_draw_no}
                            <span className="block text-[10px] text-[#cbd5e1] dark:text-[#475569]">{fmtDateTime(b.draw_at || b.created_at)}</span>
                          </td>
                          <td className="py-2">
                            <span className="flex items-center gap-1">
                              <SymBall id={b.symbol_a} emoji={b.emoji_a} size={24} />
                              <SymBall id={b.symbol_b} emoji={b.emoji_b} size={24} />
                            </span>
                          </td>
                          <td className="py-2">
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md whitespace-nowrap"
                                  style={{ background: meta.accent + '1a', color: meta.accent }}>
                              {meta.short}{b.rank_at_bet ? ` #${b.rank_at_bet}` : ''}
                            </span>
                          </td>
                          <td className="py-2 text-right text-[11px] tabular-nums text-[#334155] dark:text-[#cbd5e1] whitespace-nowrap">
                            {fmt(b.stake)}
                            <span className="block text-[10px] text-[#94a3b8]">×{b.multiplier_snapshot}</span>
                          </td>
                          <td className="py-2">
                            {b.result
                              ? <span className="flex items-center gap-0.5">
                                  {b.result.map((id, i) => {
                                    const hit = id === b.symbol_a || id === b.symbol_b
                                    const c = SYM_COLOR[id] || '#64748b'
                                    return (
                                      <span key={i}
                                            title={symName[id] || `ລູກ ${id}`}
                                            className="inline-flex items-center justify-center w-6 h-6 rounded-md"
                                            style={{
                                              background: c + (hit ? '33' : '12'),
                                              outline: hit ? `1.5px solid ${c}88` : 'none',
                                              opacity: hit ? 1 : 0.45,
                                            }}>
                                        <span style={{ fontSize: 12, lineHeight: 1 }}>{symEmoji[id] || id}</span>
                                      </span>
                                    )
                                  })}
                                </span>
                              : <span className="text-[11px] text-[#cbd5e1] dark:text-[#475569]">—</span>}
                          </td>
                          <td className="py-2 text-center">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md whitespace-nowrap"
                                  style={{ background: st.bg, color: st.color }}>
                              {st.label}
                            </span>
                          </td>
                          <td className="py-2 text-right text-xs font-black tabular-nums whitespace-nowrap"
                              style={{ color: b.status === 'pending' ? '#94a3b8' : plColor(b.profit_loss) }}>
                            {b.status === 'pending'
                              ? `ໄດ້ຄືນ ${fmt(b.potential_payout)}`
                              : signed(b.profit_loss)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <p className="mt-3 text-[11px] text-[#94a3b8] leading-relaxed">
              ບິນຈະຄິດຜົນອັດຕະໂນມັດ ເມື່ອຜົນງວດນັ້ນຖືກປ້ອນເຂົ້າລະບົບ ·
              ຖ້າງວດໃດບໍ່ມີຜົນອອກ ບິນຈະຖືກຍົກເລີກ ແລະ ຄືນເງິນເຕັມຈຳນວນ
            </p>
          </div>
        </>
      )}
    </div>
  )
}
