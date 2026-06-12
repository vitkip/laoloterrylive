import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { AlertCircle, Trophy, Calendar, Hash, TrendingDown, RefreshCw, Crown, Star } from 'lucide-react'
import { API as API_BASE } from '../utils/api'

const API = `${API_BASE}/happy545.php`

const TOP_COLORS = ['#d4af37', '#94a3b8', '#cd7f32', '#3b82f6', '#6366f1']
const DEFAULT_COLOR = '#1e3a5f'

const RANK_META = [
  { bg: 'linear-gradient(135deg,#d4af37 0%,#fbbf24 45%,#b8860b 100%)', color: '#060b1a', shadow: 'rgba(212,175,55,0.5)',   border: '#d4af37', shimmer: 'rgba(255,255,255,0.25)' },
  { bg: 'linear-gradient(135deg,#64748b 0%,#94a3b8 45%,#475569 100%)', color: '#fff',    shadow: 'rgba(148,163,184,0.35)', border: '#94a3b8', shimmer: 'rgba(255,255,255,0.15)' },
  { bg: 'linear-gradient(135deg,#92400e 0%,#cd7f32 45%,#78350f 100%)', color: '#fff',    shadow: 'rgba(205,127,50,0.4)',   border: '#cd7f32', shimmer: 'rgba(255,255,255,0.15)' },
  { bg: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 45%,#1e40af 100%)', color: '#fff',    shadow: 'rgba(59,130,246,0.35)',  border: '#3b82f6', shimmer: 'rgba(255,255,255,0.12)' },
  { bg: 'linear-gradient(135deg,#4338ca 0%,#6366f1 45%,#3730a3 100%)', color: '#fff',    shadow: 'rgba(99,102,241,0.35)',  border: '#6366f1', shimmer: 'rgba(255,255,255,0.12)' },
]

function barColor(idx) {
  return idx < 5 ? TOP_COLORS[idx] : DEFAULT_COLOR
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white dark:bg-[#0c1426] border border-[#e2e8f0] dark:border-[#d4af37]/20 rounded-xl p-3 shadow-2xl text-xs min-w-[148px]">
      <p className="font-black text-sm mb-1.5" style={{ color: '#d4af37' }}>ເລກ {d.label}</p>
      <p className="text-[#374151] dark:text-[#cbd5e1]">ອອກ: <b className="text-[#0f172a] dark:text-white">{d.count}</b> ຄັ້ງ</p>
      <p className="text-[#64748b]">{d.percentage}%</p>
      <div className="border-t border-[#f1f5f9] dark:border-white/5 mt-1.5 pt-1.5">
        {d.last_seen_date
          ? <p className="text-[#94a3b8]">ລ່າສຸດ: {d.last_seen_date}</p>
          : <p className="text-[#cbd5e1] dark:text-[#475569]">ຍັງບໍ່ເຄີຍອອກ</p>}
        {d.gap != null && <p className="text-[#94a3b8]">Gap: {d.gap} ວັນ</p>}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color = '#d4af37' }) {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5 flex items-center gap-4 group transition-shadow duration-300 hover:shadow-lg dark:hover:shadow-none">
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 0% 50%, ${color}12 0%, transparent 65%)` }}
      />
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${color}18`, boxShadow: `0 0 18px ${color}20` }}
      >
        <Icon size={21} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-[#94a3b8] uppercase tracking-[0.14em] font-bold">{label}</p>
        <p className="font-black text-xl text-[#0f172a] dark:text-[#f1f5f9] leading-tight truncate mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-[#64748b] mt-0.5 leading-tight">{sub}</p>}
      </div>
    </div>
  )
}

function Ball({ num, highlight }) {
  return (
    <span
      className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-extrabold tabular-nums"
      style={highlight ? {
        background: 'linear-gradient(135deg,#d4af37,#fbbf24,#b8860b)',
        color: '#060b1a',
        boxShadow: '0 2px 12px rgba(212,175,55,0.5), 0 0 0 2px rgba(212,175,55,0.15)',
      } : {
        background: 'rgba(59,130,246,0.1)',
        color: '#3b82f6',
        border: '1px solid rgba(59,130,246,0.2)',
      }}
    >
      {String(num).padStart(2, '0')}
    </span>
  )
}

function SkeletonCard() {
  return (
    <div className="h-[88px] bg-[#f1f5f9] dark:bg-[#0c1426] rounded-2xl animate-pulse border border-[#e8edf8] dark:border-white/4" />
  )
}

// ── Frontend pagination — "Amber Mineral" (unchanged) ────────────
function FrontPagination({ total, page, pageSize, onPageChange, onPageSizeChange, sizes = [10, 20, 50] }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (totalPages <= 1 && total <= sizes[0]) return null

  const from = Math.min((page - 1) * pageSize + 1, total)
  const to   = Math.min(page * pageSize, total)
  const pct  = totalPages > 1 ? ((page - 1) / (totalPages - 1)) * 100 : 100

  const pages = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 4)              return [1, 2, 3, 4, 5, '·', totalPages]
    if (page >= totalPages - 3) return [1, '·', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [1, '·', page - 1, page, page + 1, '·', totalPages]
  })()

  return (
    <>
      <style>{`
        @keyframes fp-amber-pop {
          0%   { transform: scale(0.78); opacity: 0; }
          65%  { transform: scale(1.08); }
          100% { transform: scale(1);   opacity: 1; }
        }
        .fp-active { animation: fp-amber-pop 0.22s cubic-bezier(0.34,1.56,0.64,1) both; }
        .fp-nav:not(:disabled):hover { transform: scale(1.08); }
        .fp-nav { transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease; }
        .fp-page-btn { transition: all 0.15s ease; }
        .fp-page-btn:not(.fp-active):hover {
          border-color: #f59e0b !important;
          color: #d97706 !important;
          background: rgba(245,158,11,0.08) !important;
        }
        .dark .fp-page-btn:not(.fp-active):hover {
          border-color: rgba(212,175,55,0.5) !important;
          color: #fbbf24 !important;
          background: rgba(212,175,55,0.1) !important;
        }
        .fp-size-opt { background: white; color: #374151; }
        .dark .fp-size-opt { background: #0f0c1e; color: #e2e8f0; }
      `}</style>

      <div className="select-none px-4 pb-5 pt-3 space-y-3">
        <div className="relative h-0.5 rounded-full bg-[#e9edf8] dark:bg-[#1e1842] overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #f59e0b, #d97706)',
              boxShadow: '0 0 8px rgba(245,158,11,0.5)',
            }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-[#9ca3af] dark:text-[#6b7280] tabular-nums leading-none">
            <span className="font-bold text-[#374151] dark:text-[#d1d5db]">{from}–{to}</span>
            {' '}<span>/ {total} ລາຍການ</span>
          </p>

          <div className="flex items-center gap-1.5">
            <button
              className="fp-nav h-8 w-8 rounded-xl border border-[#e2e8f0] dark:border-[#2a1e50] bg-white dark:bg-[#12102a] text-[#6b7280] dark:text-[#6b7280] flex items-center justify-center text-sm disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              aria-label="ໜ້າກ່ອນ"
            >←</button>

            {pages.map((p, i) =>
              p === '·' ? (
                <span key={`d${i}`} className="w-5 text-center text-[#d1d5db] dark:text-[#374151] text-sm leading-none">·</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  aria-current={p === page ? 'page' : undefined}
                  className={`fp-page-btn h-8 w-8 rounded-xl border text-xs font-bold cursor-pointer ${
                    p === page
                      ? 'fp-active border-[#f59e0b] dark:border-[#d4af37] text-white dark:text-[#060812]'
                      : 'border-[#e2e8f0] dark:border-[#2a1e50] bg-white dark:bg-[#12102a] text-[#6b7280] dark:text-[#6b7280]'
                  }`}
                  style={p === page ? {
                    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%)',
                    boxShadow: '0 4px 14px rgba(245,158,11,0.45), 0 1px 3px rgba(245,158,11,0.3)',
                  } : {}}
                >{p}</button>
              )
            )}

            <button
              className="fp-nav h-8 w-8 rounded-xl border border-[#e2e8f0] dark:border-[#2a1e50] bg-white dark:bg-[#12102a] text-[#6b7280] dark:text-[#6b7280] flex items-center justify-center text-sm disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              aria-label="ໜ້າຕໍ່ໄປ"
            >→</button>
          </div>

          <select
            value={pageSize}
            onChange={e => { onPageSizeChange(+e.target.value); onPageChange(1) }}
            className="fp-size-opt h-8 pl-3 pr-7 rounded-xl border border-[#e2e8f0] dark:border-[#2a1e50] bg-white dark:bg-[#12102a] text-[#6b7280] dark:text-[#9ca3af] text-[11px] font-semibold focus:outline-none focus:border-[#f59e0b] dark:focus:border-[#d4af37] cursor-pointer"
            style={{
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23f59e0b'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
            }}
          >
            {sizes.map(s => <option key={s} value={s} className="fp-size-opt">{s} / ໜ້າ</option>)}
          </select>
        </div>
      </div>
    </>
  )
}

// ── Main page ────────────────────────────────────────────────────
export default function Happy545Page() {
  const [draws, setDraws]     = useState([])
  const [stats, setStats]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  const [drawPage, setDrawPage]         = useState(1)
  const [drawPageSize, setDrawPageSize] = useState(15)
  const [statPage, setStatPage]         = useState(1)
  const [statPageSize, setStatPageSize] = useState(15)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [rD, rS] = await Promise.all([
        fetch(`${API}?r=draws`),
        fetch(`${API}?r=stats/last-digit`),
      ])
      if (rD.ok) setDraws(await rD.json())
      if (rS.ok) setStats(await rS.json())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const totalDraws     = draws.length
  const topNumber      = stats[0]
  const neverOut       = stats.filter(s => s.count === 0).length
  const paginatedDraws = draws.slice((drawPage - 1) * drawPageSize, drawPage * drawPageSize)
  const paginatedStats = stats.slice((statPage - 1) * statPageSize, statPage * statPageSize)

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
          <RefreshCw size={14} />
          ລອງໃໝ່
        </button>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes h545-dice {
          0%,100% { transform: translateY(0) rotate(0deg); }
          33%      { transform: translateY(-5px) rotate(6deg); }
          66%      { transform: translateY(-2px) rotate(-4deg); }
        }
        @keyframes h545-gold-pulse {
          0%,100% { box-shadow: 0 0 18px rgba(212,175,55,0.3), 0 0 36px rgba(212,175,55,0.08); }
          50%      { box-shadow: 0 0 26px rgba(212,175,55,0.55), 0 0 52px rgba(212,175,55,0.18); }
        }
        @keyframes h545-shine {
          0%   { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(220%)  skewX(-15deg); }
        }
        .h545-dice { animation: h545-dice 3.2s ease-in-out infinite; }
        .h545-gold-glow { animation: h545-gold-pulse 2.8s ease-in-out infinite; }
        .h545-rank-card { position: relative; overflow: hidden; }
        .h545-rank-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(105deg, transparent, rgba(255,255,255,0.22), transparent);
          animation: h545-shine 3.5s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>

      <div className="space-y-7 pb-16">

        {/* ── Header ── */}
        <div className="flex items-start gap-4">
          <div
            className="h545-dice h545-gold-glow w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#d4af37 0%,#fbbf24 45%,#b8860b 100%)' }}
          >
            <span className="text-2xl select-none">🎲</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-0.5">
              <h1
                className="text-3xl sm:text-4xl font-black tracking-tight leading-tight"
                style={{
                  background: 'linear-gradient(135deg,#d4af37 0%,#f59e0b 40%,#b8860b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Happy 545
              </h1>
              {!loading && totalDraws > 0 && (
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black tracking-wider uppercase"
                  style={{ background: 'rgba(212,175,55,0.12)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.28)' }}
                >
                  {totalDraws} ງວດ
                </span>
              )}
            </div>
            <p className="text-sm text-[#94a3b8]">ສະຖິຕິເລກທ້າຍ (ຕຳແໜ່ງທີ 5) · ວິເຄາະ 45 ຄ່າ</p>
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <div className="flex gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-4">
          <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
            <strong>ໝາຍເຫດ:</strong> ສະຖິຕິໃຊ້ເບິ່ງຂໍ້ມູນອະດີດເທົ່ານັ້ນ — ການອອກເລກແຕ່ລະຄັ້ງເປັນເອກະລາດ
            ບໍ່ສາມາດ<strong>ທຳນາຍ</strong>ອະນາຄົດໄດ້.
          </p>
        </div>

        {/* ── Stat cards ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={Calendar}     label="ງວດທັງໝົດ"
              value={`${totalDraws} ງວດ`}
              color="#3b82f6" />
            <StatCard icon={Trophy}       label="ເລກທ້າຍຈ່ອຍສຸດ"
              value={topNumber ? topNumber.label : '—'}
              sub={topNumber ? `ອອກ ${topNumber.count} ຄັ້ງ · ${topNumber.percentage}%` : ''}
              color="#d4af37" />
            <StatCard icon={TrendingDown} label="ຍັງບໍ່ເຄີຍອອກ"
              value={`${neverOut} ເລກ`}
              color="#6366f1" />
          </div>
        )}

        {/* ── Bar chart ── */}
        <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-6">
          <div className="mb-5">
            <h2 className="font-black text-base text-[#0f172a] dark:text-[#f1f5f9] flex items-center gap-2 mb-0.5">
              <Hash size={15} style={{ color: '#d4af37' }} />
              ຄວາມຖີ່ເລກທ້າຍ (pos5) ທຸກ 45 ຄ່າ
            </h2>
            <p className="text-xs text-[#94a3b8]">
              ລຽງຈາກຫຼາຍ → ໜ້ອຍ ·&nbsp;
              <span style={{ color: '#d4af37' }}>■</span> ທອງ = Top 5
            </p>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div
                className="w-8 h-8 rounded-full border-2 border-t-[#d4af37] animate-spin"
                style={{ borderColor: 'rgba(212,175,55,0.2)', borderTopColor: '#d4af37' }}
              />
            </div>
          ) : stats.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-[#94a3b8]">
              <Hash size={32} className="opacity-25" />
              <p className="text-sm">ຍັງບໍ່ມີຂໍ້ມູນສະຖິຕິ</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} interval={0} angle={-45} textAnchor="end" height={46} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(212,175,55,0.06)' }} />
                <Bar
                  dataKey="count"
                  shape={({ x, y, width, height, index }) => (
                    <rect x={x} y={y} width={Math.max(0, width)} height={Math.max(0, height)} fill={barColor(index)} rx={4} ry={4} />
                  )}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Top 5 ── */}
        {!loading && stats.length > 0 && (
          <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-6">
            <h2 className="font-black text-base text-[#0f172a] dark:text-[#f1f5f9] flex items-center gap-2 mb-5">
              <Trophy size={16} style={{ color: '#d4af37' }} />
              Top 5 ເລກທ້າຍທີ່ອອກຫຼາຍສຸດ
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {stats.slice(0, 5).map((row, i) => {
                const m = RANK_META[i]
                return (
                  <div
                    key={row.number}
                    className="h545-rank-card rounded-2xl p-4 flex flex-col items-center gap-2"
                    style={{
                      background: m.bg,
                      boxShadow: `0 4px 22px ${m.shadow}`,
                      border: `1px solid ${m.border}40`,
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className="text-[10px] font-black px-1.5 py-0.5 rounded-md"
                        style={{ background: 'rgba(0,0,0,0.2)', color: i === 0 ? '#060b1a' : 'rgba(255,255,255,0.85)' }}
                      >#{i + 1}</span>
                      {i === 0
                        ? <Crown size={13} style={{ color: 'rgba(6,11,26,0.55)' }} />
                        : <Star size={11} style={{ color: 'rgba(255,255,255,0.35)' }} />}
                    </div>

                    <span
                      className="text-3xl font-black tabular-nums leading-none"
                      style={{ color: i === 0 ? '#060b1a' : '#fff', textShadow: i === 0 ? 'none' : '0 1px 4px rgba(0,0,0,0.3)' }}
                    >
                      {row.label}
                    </span>

                    <div
                      className="text-center space-y-0.5"
                      style={{ color: i === 0 ? 'rgba(6,11,26,0.72)' : 'rgba(255,255,255,0.82)' }}
                    >
                      <p className="text-xs font-bold leading-none">{row.count} ຄັ້ງ</p>
                      <p className="text-[10px] leading-none">{row.percentage}%</p>
                      {row.gap != null && <p className="text-[10px] leading-none">Gap {row.gap}ວ</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Stats table ── */}
        <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f1f5f9] dark:border-white/5 flex items-center justify-between">
            <h2 className="font-black text-base text-[#0f172a] dark:text-[#f1f5f9]">ຕາຕະລາງສະຖິຕິທຸກເລກ</h2>
            <span className="text-xs text-[#94a3b8]">{stats.length} ເລກ</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8faff] dark:bg-[#080f1e] text-[#94a3b8] text-[10px] uppercase tracking-[0.1em]">
                  {['#', 'ເລກ', 'ຄັ້ງ', '%', 'ລ່າສຸດ', 'Gap (ວັນ)'].map((h, i) => (
                    <th key={h} className={`px-4 py-3 font-bold ${i > 1 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedStats.map((row, idx) => {
                  const globalIdx = (statPage - 1) * statPageSize + idx
                  const isTop5    = globalIdx < 5
                  const accent    = isTop5 ? TOP_COLORS[globalIdx] : null
                  return (
                    <tr
                      key={row.number}
                      className="border-t border-[#f1f5f9] dark:border-white/4 hover:bg-[#fafbff] dark:hover:bg-[#0d1525] transition-colors"
                      style={{ borderLeft: isTop5 ? `3px solid ${accent}` : '3px solid transparent' }}
                    >
                      <td className="pl-3 pr-4 py-3 text-xs tabular-nums w-10">
                        {globalIdx < 3 ? (
                          <span
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black"
                            style={{ background: `${TOP_COLORS[globalIdx]}20`, color: TOP_COLORS[globalIdx] }}
                          >{globalIdx + 1}</span>
                        ) : (
                          <span className="text-[#94a3b8]">{globalIdx + 1}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-extrabold tabular-nums"
                          style={isTop5 ? {
                            background: `${accent}1a`,
                            color: accent,
                            border: `1px solid ${accent}35`,
                          } : {
                            background: '#f8faff',
                            color: '#3b82f6',
                            border: '1px solid #dbeafe',
                          }}
                        >{row.label}</span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-bold text-[#0f172a] dark:text-[#f1f5f9]">{row.count}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[#64748b]">{row.percentage}%</td>
                      <td className="px-4 py-3 text-right text-[#94a3b8] tabular-nums text-xs">{row.last_seen_date ?? '—'}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {row.gap != null
                          ? <span className={`font-semibold ${row.gap <= 7 ? 'text-emerald-500' : row.gap >= 30 ? 'text-red-400' : 'text-[#64748b]'}`}>{row.gap}</span>
                          : <span className="text-[#cbd5e1] dark:text-[#374151]">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <FrontPagination
            total={stats.length} page={statPage} pageSize={statPageSize}
            onPageChange={setStatPage}
            onPageSizeChange={v => { setStatPageSize(v); setStatPage(1) }}
          />
        </div>

        {/* ── Draw history ── */}
        <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f1f5f9] dark:border-white/5 flex items-center justify-between">
            <h2 className="font-black text-base text-[#0f172a] dark:text-[#f1f5f9] flex items-center gap-2">
              <Star size={14} style={{ color: '#d4af37' }} />
              ຜົນເລກທັງໝົດ
            </h2>
            <span className="text-xs text-[#94a3b8]">{totalDraws} ງວດ</span>
          </div>

          {draws.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#94a3b8]">
              <Calendar size={36} className="opacity-25" />
              <p className="text-sm">ຍັງບໍ່ມີຜົນເລກ</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#f8faff] dark:bg-[#080f1e] text-[#94a3b8] text-[10px] uppercase tracking-[0.1em]">
                      <th className="px-4 py-3 text-left w-10 font-bold">#</th>
                      <th className="px-4 py-3 text-left font-bold">ວັນທີ</th>
                      {['P1', 'P2', 'P3', 'P4'].map(h => (
                        <th key={h} className="px-2 py-3 text-center font-bold">{h}</th>
                      ))}
                      <th className="px-4 py-3 text-center font-bold" style={{ color: '#d4af37' }}>P5 ★</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDraws.map((d, idx) => {
                      const rowNo = (drawPage - 1) * drawPageSize + idx + 1
                      return (
                        <tr
                          key={d.id}
                          className="border-t border-[#f1f5f9] dark:border-white/4 hover:bg-[#fafbff] dark:hover:bg-[#0d1525] transition-colors"
                        >
                          <td className="px-4 py-2.5 text-[#94a3b8] text-xs tabular-nums">{rowNo}</td>
                          <td className="px-4 py-2.5 font-semibold text-xs text-[#374151] dark:text-[#94a3b8] tabular-nums">{d.draw_date}</td>
                          {[d.pos1, d.pos2, d.pos3, d.pos4].map((p, i) => (
                            <td key={i} className="px-2 py-2.5 text-center">
                              <Ball num={p} highlight={false} />
                            </td>
                          ))}
                          <td className="px-4 py-2.5 text-center">
                            <span
                              className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-extrabold tabular-nums"
                              style={{
                                background: 'linear-gradient(135deg,#d4af37,#fbbf24,#b8860b)',
                                color: '#060b1a',
                                boxShadow: '0 2px 14px rgba(212,175,55,0.5), 0 0 0 2px rgba(212,175,55,0.15)',
                              }}
                            >
                              {String(d.pos5).padStart(2, '0')}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <FrontPagination
                total={draws.length} page={drawPage} pageSize={drawPageSize}
                onPageChange={setDrawPage}
                onPageSizeChange={v => { setDrawPageSize(v); setDrawPage(1) }}
              />
            </>
          )}
        </div>

      </div>
    </>
  )
}
