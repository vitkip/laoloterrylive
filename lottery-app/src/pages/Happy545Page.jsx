import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { AlertCircle, Trophy, Calendar, Hash, TrendingDown, RefreshCw, Crown, Star, Flame, Snowflake, Zap, Target, CheckCircle, XCircle, ClipboardList } from 'lucide-react'
import { API as API_BASE } from '../utils/api'

const API = `${API_BASE}/happy545.php`

const TOP_COLORS = ['#d4af37', '#94a3b8', '#cd7f32', '#3b82f6', '#6366f1']
const DEFAULT_COLOR = '#1e3a5f'

const RANK_META = [
  { bg: 'linear-gradient(135deg,#d4af37 0%,#fbbf24 45%,#b8860b 100%)', color: '#060b1a', shadow: 'rgba(212,175,55,0.5)', border: '#d4af37', shimmer: 'rgba(255,255,255,0.25)' },
  { bg: 'linear-gradient(135deg,#64748b 0%,#94a3b8 45%,#475569 100%)', color: '#fff', shadow: 'rgba(148,163,184,0.35)', border: '#94a3b8', shimmer: 'rgba(255,255,255,0.15)' },
  { bg: 'linear-gradient(135deg,#92400e 0%,#cd7f32 45%,#78350f 100%)', color: '#fff', shadow: 'rgba(205,127,50,0.4)', border: '#cd7f32', shimmer: 'rgba(255,255,255,0.15)' },
  { bg: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 45%,#1e40af 100%)', color: '#fff', shadow: 'rgba(59,130,246,0.35)', border: '#3b82f6', shimmer: 'rgba(255,255,255,0.12)' },
  { bg: 'linear-gradient(135deg,#4338ca 0%,#6366f1 45%,#3730a3 100%)', color: '#fff', shadow: 'rgba(99,102,241,0.35)', border: '#6366f1', shimmer: 'rgba(255,255,255,0.12)' },
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

// ── Analysis Panel 1: Hot / Cold ──────────────────────────────────
function HotColdPanel({ draws }) {
  const [range, setRange] = useState('20')
  const RANGES = [{ v: '10', l: '10 ງວດ' }, { v: '20', l: '20 ງວດ' }, { v: '50', l: '50 ງວດ' }, { v: 'all', l: 'ທັງໝົດ' }]

  const data = useMemo(() => {
    if (!draws?.length) return null
    const n = range === 'all' ? draws.length : Math.min(parseInt(range), draws.length)
    const recent = draws.slice(0, n)

    const p5Count = {}, regCount = {}
    for (let i = 1; i <= 45; i++) { p5Count[i] = 0; regCount[i] = 0 }
    recent.forEach(d => {
      if (d.pos5) p5Count[+d.pos5]++
        ;[d.pos1, d.pos2, d.pos3, d.pos4].forEach(v => { if (v) regCount[+v]++ })
    })

    const p5List = Object.entries(p5Count)
      .map(([num, count]) => ({ num: +num, count, pct: +((count / n) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count)
    const regList = Object.entries(regCount)
      .map(([num, count]) => ({ num: +num, count }))
      .sort((a, b) => b.count - a.count)
    return { p5List, regList, n }
  }, [draws, range])

  if (!data) return null
  const maxP5 = data.p5List[0]?.count || 1
  const maxReg = data.regList[0]?.count || 1

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs font-bold text-[#94a3b8]">ຊ່ວງ:</span>
        {RANGES.map(({ v, l }) => (
          <button key={v} onClick={() => setRange(v)}
            className="h-8 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer"
            style={range === v ? {
              background: 'linear-gradient(135deg,#d4af37,#fbbf24)', borderColor: '#d4af37', color: '#060b1a',
            } : { background: 'transparent', borderColor: 'rgba(148,163,184,0.25)', color: '#64748b' }}>
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* P5 Hot */}
        <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5">
          <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-4 flex items-center gap-2">
            <Flame size={14} className="text-red-500" /> ເລກ P5 ★ ຮ້ອນສຸດ ({data.n} ງວດ)
          </h3>
          <div className="space-y-2">
            {data.p5List.slice(0, 8).map((row, i) => (
              <div key={row.num} className="flex items-center gap-2">
                <span className="w-4 text-[10px] text-[#94a3b8] text-right shrink-0">{i + 1}</span>
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-extrabold shrink-0"
                  style={i < 3 ? {
                    background: 'linear-gradient(135deg,#d4af37,#fbbf24,#b8860b)', color: '#060b1a',
                    boxShadow: '0 2px 12px rgba(212,175,55,0.4)',
                  } : { background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}>
                  {String(row.num).padStart(2, '0')}
                </span>
                <div className="flex-1 h-2 bg-[#f1f5f9] dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${(row.count / maxP5) * 100}%`, background: i < 3 ? 'linear-gradient(90deg,#d4af37,#f59e0b)' : '#3b82f6' }} />
                </div>
                <span className="text-xs font-bold text-[#374151] dark:text-[#94a3b8] w-16 text-right shrink-0">
                  {row.count}x · {row.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* P5 Cold */}
        <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5">
          <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-4 flex items-center gap-2">
            <Snowflake size={14} className="text-blue-400" /> ເລກ P5 ★ ເຢັນສຸດ ({data.n} ງວດ)
          </h3>
          <div className="space-y-2">
            {[...data.p5List].reverse().slice(0, 8).map((row, i) => (
              <div key={row.num} className="flex items-center gap-2">
                <span className="w-4 text-[10px] text-[#94a3b8] text-right shrink-0">{i + 1}</span>
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-extrabold shrink-0"
                  style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.25)' }}>
                  {String(row.num).padStart(2, '0')}
                </span>
                <div className="flex-1 h-2 bg-[#f1f5f9] dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${(row.count / maxP5) * 100}%`, background: '#6366f1' }} />
                </div>
                <span className="text-xs font-bold text-[#374151] dark:text-[#94a3b8] w-8 text-right shrink-0">{row.count}x</span>
              </div>
            ))}
          </div>
        </div>

        {/* P1-P4 Hot */}
        <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5">
          <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-4 flex items-center gap-2">
            <Zap size={14} className="text-amber-500" /> ເລກ P1-P4 ອອກຫຼາຍ ({data.n} ງວດ)
          </h3>
          <div className="space-y-2">
            {data.regList.slice(0, 8).map((row, i) => (
              <div key={row.num} className="flex items-center gap-2">
                <span className="w-4 text-[10px] text-[#94a3b8] text-right shrink-0">{i + 1}</span>
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-extrabold shrink-0"
                  style={i < 3 ? {
                    background: 'rgba(34,197,94,0.12)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.3)',
                  } : { background: 'rgba(59,130,246,0.08)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}>
                  {String(row.num).padStart(2, '0')}
                </span>
                <div className="flex-1 h-2 bg-[#f1f5f9] dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${(row.count / maxReg) * 100}%`, background: i < 3 ? '#22c55e' : '#3b82f6' }} />
                </div>
                <span className="text-xs font-bold text-[#374151] dark:text-[#94a3b8] w-8 text-right shrink-0">{row.count}x</span>
              </div>
            ))}
          </div>
        </div>

        {/* P1-P4 Cold */}
        <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5">
          <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-4 flex items-center gap-2">
            <Snowflake size={14} className="text-slate-400" /> ເລກ P1-P4 ອອກໜ້ອຍ ({data.n} ງວດ)
          </h3>
          <div className="space-y-2">
            {[...data.regList].reverse().slice(0, 8).map((row, i) => (
              <div key={row.num} className="flex items-center gap-2">
                <span className="w-4 text-[10px] text-[#94a3b8] text-right shrink-0">{i + 1}</span>
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-extrabold shrink-0"
                  style={{ background: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.2)' }}>
                  {String(row.num).padStart(2, '0')}
                </span>
                <div className="flex-1 h-2 bg-[#f1f5f9] dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${(row.count / maxReg) * 100}%`, background: '#94a3b8' }} />
                </div>
                <span className="text-xs font-bold text-[#374151] dark:text-[#94a3b8] w-8 text-right shrink-0">{row.count}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Analysis Panel 2: Gap Analysis ───────────────────────────────
function GapAnalysisPanel({ draws, posStats }) {
  const p5Data = posStats?.pos5 ?? []
  const totalDraws = draws.length

  function gapColor(gap) {
    if (gap == null) return '#94a3b8'
    if (gap <= 5) return '#22c55e'
    if (gap <= 15) return '#f59e0b'
    if (gap <= 30) return '#ef4444'
    return '#9f1239'
  }

  const sorted = useMemo(() =>
    [...p5Data].sort((a, b) => (b.gap ?? totalDraws) - (a.gap ?? totalDraws)),
    [p5Data, totalDraws])

  const maxGap = sorted[0]?.gap ?? totalDraws

  return (
    <div className="space-y-5">
      {/* Legend */}
      <div className="flex gap-2 flex-wrap">
        {[['#22c55e', '≤5 ງວດ — ອອກໃໝ່'], ['#f59e0b', '6-15 ງວດ — ກາງ'], ['#ef4444', '16-30 ງວດ — ຄ້າງ'], ['#9f1239', '>30 ງວດ — ຊ້ານານ']].map(([c, l]) => (
          <span key={c} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: c + '18', color: c, border: `1px solid ${c}40` }}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c }} />{l}
          </span>
        ))}
      </div>

      {/* Grid of 45 numbers */}
      <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5">
        <h3 className="font-black text-sm mb-4 text-[#0f172a] dark:text-[#f1f5f9]">
          Grid ໄລຍະຫ່າງ P5 ★ (ທຸກ 45 ເລກ) — ສີຕາມຈຳນວນງວດທີ່ຫ່າງ
        </h3>
        <div className="grid grid-cols-9 sm:grid-cols-9 gap-1.5">
          {Array.from({ length: 45 }, (_, i) => {
            const num = i + 1
            const row = p5Data.find(d => d.number === num) ?? {}
            const gap = row.gap
            const col = gapColor(gap)
            return (
              <div key={num} className="rounded-xl p-1.5 text-center"
                style={{ background: col + '15', border: `1px solid ${col}30` }}>
                <p className="text-[11px] font-black leading-tight" style={{ color: col }}>
                  {String(num).padStart(2, '0')}
                </p>
                <p className="text-[9px] font-bold leading-tight" style={{ color: col + 'aa' }}>
                  {gap != null ? `${gap}ງ` : '—'}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top 10 most overdue */}
      <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5">
        <h3 className="font-black text-sm mb-4 text-[#0f172a] dark:text-[#f1f5f9] flex items-center gap-2">
          <TrendingDown size={14} style={{ color: '#ef4444' }} />
          10 ເລກ P5 ★ ທີ່ຊ້ານານສຸດ (ຍາວນານຄ້າງ)
        </h3>
        <div className="space-y-2">
          {sorted.slice(0, 10).map((row, i) => {
            const gap = row.gap ?? totalDraws
            const col = gapColor(gap)
            return (
              <div key={row.number} className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{ background: col + '08', border: `1px solid ${col}18` }}>
                <span className="text-xs text-[#94a3b8] w-4 shrink-0">{i + 1}</span>
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-extrabold shrink-0"
                  style={{ background: col + '20', color: col, border: `1px solid ${col}40` }}>
                  {row.label ?? String(row.number).padStart(2, '0')}
                </span>
                <div className="flex-1 h-2 bg-[#f1f5f9] dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(gap / Math.max(maxGap, 1)) * 100}%`, background: col }} />
                </div>
                <span className="text-xs font-black w-14 text-right shrink-0" style={{ color: col }}>{gap} ງວດ</span>
                <span className="text-[10px] text-[#94a3b8] w-20 text-right shrink-0 hidden sm:block">
                  {row.last_seen_date ?? 'ຍັງບໍ່ເຄີຍ'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stat summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'ເລກ P5 ທີ່ອອກ ≤5 ງວດ', val: p5Data.filter(d => d.gap != null && d.gap <= 5).length, color: '#22c55e' },
          { label: 'ເລກ P5 ຄ້າງ 16-30 ງວດ', val: p5Data.filter(d => d.gap != null && d.gap > 15 && d.gap <= 30).length, color: '#ef4444' },
          { label: 'ເລກ P5 ຊ້ານານ >30 ງວດ', val: p5Data.filter(d => d.gap == null || d.gap > 30).length, color: '#9f1239' },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black" style={{ color }}>{val}</p>
            <p className="text-[10px] text-[#64748b] mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Analysis Panel 3: Smart Pick ────────────────────────────────
function SmartPickPanel({ draws, posStats }) {
  const pick = useMemo(() => {
    if (!draws?.length || !posStats) return null
    const n20 = Math.min(20, draws.length)
    const recent = draws.slice(0, n20)

    // P5 score: recency-weighted frequency + gap bonus
    const p5Score = {}
    for (let i = 1; i <= 45; i++) p5Score[i] = 0
    recent.forEach((d, idx) => {
      if (d.pos5) p5Score[+d.pos5] += (n20 - idx) / n20
    })
    const p5Data = posStats?.pos5 ?? []
    const maxGap = Math.max(...p5Data.map(d => d.gap ?? 0), 1)
    p5Data.forEach(d => {
      if (d.gap != null) p5Score[d.number] = (p5Score[d.number] || 0) + (d.gap / maxGap) * 0.6
    })

    const p5Sorted = Object.entries(p5Score)
      .map(([num, score]) => ({ num: +num, score }))
      .sort((a, b) => b.score - a.score)
    const suggestedP5 = p5Sorted[0]?.num

    // P1-P4 combined recency-weighted frequency, exclude suggestedP5
    const regScore = {}
    for (let i = 1; i <= 45; i++) regScore[i] = 0
    recent.forEach((d, idx) => {
      ;[d.pos1, d.pos2, d.pos3, d.pos4].forEach(v => {
        if (v) regScore[+v] += (n20 - idx) / n20
      })
    })
    const reg4 = Object.entries(regScore)
      .map(([num, score]) => ({ num: +num, score }))
      .filter(x => x.num !== suggestedP5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(x => x.num)

    // Backtest against up to 100 draws
    const bt = draws.slice(0, Math.min(100, draws.length))
    let h1 = 0, h2 = 0, h3 = 0, h4 = 0
    bt.forEach(d => {
      const p5ok = +d.pos5 === suggestedP5
      const regActual = [+d.pos1, +d.pos2, +d.pos3, +d.pos4]
      const matched = reg4.filter(n => regActual.includes(n)).length
      if (p5ok) {
        if (matched >= 1) h4++
        if (matched >= 2) h3++
        if (matched >= 3) h2++
        if (matched >= 4) h1++
      }
    })

    return { p5: suggestedP5, reg4, btN: bt.length, h1, h2, h3, h4 }
  }, [draws, posStats])

  if (!pick) return null

  const PRIZES = [
    { label: 'ລາງວັນທີ 1', prize: '1,000,000,000', hits: pick.h1, need: 'P5 + 4 ເລກ', color: '#d4af37', icon: Crown },
    { label: 'ລາງວັນທີ 2', prize: '5,000,000', hits: pick.h2, need: 'P5 + 3 ເລກ', color: '#818cf8', icon: Star },
    { label: 'ລາງວັນທີ 3', prize: '200,000', hits: pick.h3, need: 'P5 + 2 ເລກ', color: '#22d3ee', icon: Star },
    { label: 'ລາງວັນທີ 4', prize: '20,000', hits: pick.h4, need: 'P5 + 1 ເລກ', color: '#4ade80', icon: Star },
  ]

  return (
    <div className="space-y-5">
      <div className="flex gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-4">
        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
          ຕົວເລກທີ່ແນະນຳ ຄຳນວນຈາກ <strong>ຄວາມຖີ່ + Gap</strong> ໃນ 20 ງວດລ່າສຸດ.
          ຫວຍເປັນການສຸ່ມ — ບໍ່ຮັບປະກັນຜົນ.
        </p>
      </div>

      {/* Suggested ticket */}
      <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-6">
        <h3 className="font-black text-base mb-5 text-[#0f172a] dark:text-[#f1f5f9] flex items-center gap-2">
          <Target size={16} style={{ color: '#d4af37' }} /> ຕົວເລກທີ່ແນະນຳ
        </h3>
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider mb-1.5">P1-P4 (ລຳດັບໃດກໍໄດ້)</p>
            <div className="flex gap-2">
              {pick.reg4.map(num => (
                <span key={num}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-base font-extrabold tabular-nums"
                  style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.25)' }}>
                  {String(num).padStart(2, '0')}
                </span>
              ))}
            </div>
          </div>
          <div className="pb-0">
            <p className="text-[10px] text-[#d4af37] font-bold uppercase tracking-wider mb-1.5">P5 ★ (ຕົງ)</p>
            <span
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-base font-extrabold tabular-nums"
              style={{
                background: 'linear-gradient(135deg,#d4af37,#fbbf24,#b8860b)',
                color: '#060b1a',
                boxShadow: '0 2px 14px rgba(212,175,55,0.5)',
              }}>
              {String(pick.p5).padStart(2, '0')}
            </span>
          </div>
        </div>
        <p className="mt-4 text-[11px] text-[#94a3b8]">
          ວິທີ: ເລກ P1-P4 ສ່ວນໃດສ່ວນໜຶ່ງ ກໍ່ຈະຊ່ວຍຖືກ ຕາບໃດທີ່ P5 ★ ຕົງ ·
          Backtest ຈາກ {pick.btN} ງວດ
        </p>
      </div>

      {/* Prize probability from backtest */}
      <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-6">
        <h3 className="font-black text-base mb-4 text-[#0f172a] dark:text-[#f1f5f9] flex items-center gap-2">
          <Trophy size={16} style={{ color: '#d4af37' }} /> ອັດຕາ Backtest ຕໍ່ {pick.btN} ງວດ
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRIZES.map(({ label, prize, hits, need, color, icon: Icon }) => (
            <div key={label} className="rounded-2xl p-4 text-center"
              style={{ background: color + '10', border: `1px solid ${color}30` }}>
              <Icon size={14} className="mx-auto mb-1.5" style={{ color }} />
              <p className="text-[9px] font-black uppercase tracking-wide mb-1" style={{ color }}>{label}</p>
              <p className="text-3xl font-black" style={{ color }}>{hits}</p>
              <p className="text-[10px] text-[#64748b] mt-0.5">ຄັ້ງ / {pick.btN} ງວດ</p>
              <p className="text-[10px] font-bold mt-1" style={{ color: color + 'cc' }}>{need}</p>
              <p className="text-[9px] text-[#94a3b8] mt-0.5">{prize} ກີບ</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rules summary */}
      <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5">
        <h3 className="font-black text-sm mb-3 text-[#0f172a] dark:text-[#f1f5f9] flex items-center gap-2">
          <Hash size={13} style={{ color: '#d4af37' }} /> ສະຫຼຸບກະຕິກາ Happy 545
        </h3>
        <div className="space-y-1.5 text-xs leading-relaxed">
          {[
            ['#d4af37', 'ລາງວັນທີ 1', 'ຖືກ P5 ຕົງ + 4 ຈາກ P1-P4 (ລຳດັບໃດກໍໄດ້) → 1,000,000,000 ກີບ'],
            ['#818cf8', 'ລາງວັນທີ 2', 'ຖືກ P5 ຕົງ + 3 ຈາກ P1-P4 → 5,000,000 ກີບ'],
            ['#22d3ee', 'ລາງວັນທີ 3', 'ຖືກ P5 ຕົງ + 2 ຈາກ P1-P4 → 200,000 ກີບ'],
            ['#4ade80', 'ລາງວັນທີ 4', 'ຖືກ P5 ຕົງ + 1 ຈາກ P1-P4 → 20,000 ກີບ'],
            ['#f472b6', 'ລາງວັນພິເສດ', 'ຖືກທຸກ 5 ເລກ ໃນລຳດັບໃດກໍໄດ້ → 10,000,000 ກີບ'],
          ].map(([c, title, desc]) => (
            <div key={title} className="flex gap-2">
              <span className="font-black shrink-0 w-28" style={{ color: c }}>{title}</span>
              <span className="text-[#64748b]">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Frontend pagination — "Amber Mineral" (unchanged) ────────────
function FrontPagination({ total, page, pageSize, onPageChange, onPageSizeChange, sizes = [10, 20, 50] }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (totalPages <= 1 && total <= sizes[0]) return null

  const from = Math.min((page - 1) * pageSize + 1, total)
  const to = Math.min(page * pageSize, total)
  const pct = totalPages > 1 ? ((page - 1) / (totalPages - 1)) * 100 : 100

  const pages = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 4) return [1, 2, 3, 4, 5, '·', totalPages]
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
                  className={`fp-page-btn h-8 w-8 rounded-xl border text-xs font-bold cursor-pointer ${p === page
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

// ── Analysis Panel 4: Day-of-Week Frequency ──────────────────────
const LAO_DAYS = ['ວັນອາທິດ', 'ວັນຈັນ', 'ວັນອັງຄານ', 'ວັນພຸດ', 'ວັນພະຫັດ', 'ວັນສຸກ', 'ວັນເສົາ']
const DAY_COLORS = ['#a78bfa', '#22d3ee', '#f87171', '#4ade80', '#fb923c', '#fbbf24', '#818cf8']

function DayFreqPanel({ draws }) {
  const [activeDay, setActiveDay] = useState(null)

  const dayData = useMemo(() => {
    if (!draws?.length) return null
    const byDay = Array.from({ length: 7 }, () => ({ count: 0, p5: {} }))

    draws.forEach(d => {
      if (!d.draw_date) return
      const dow = new Date(d.draw_date).getDay()
      byDay[dow].count++
      const p5 = +d.pos5
      if (p5) byDay[dow].p5[p5] = (byDay[dow].p5[p5] || 0) + 1
    })

    return byDay.map((day, i) => {
      const topList = Object.entries(day.p5)
        .map(([num, cnt]) => ({ num: +num, cnt }))
        .sort((a, b) => b.cnt - a.cnt)
      return { dow: i, label: LAO_DAYS[i], color: DAY_COLORS[i], drawCount: day.count, topList }
    })
  }, [draws])

  useEffect(() => {
    if (dayData && activeDay === null) {
      const today = new Date().getDay()
      setActiveDay(today)
    }
  }, [dayData, activeDay])

  if (!dayData) return null

  const active = dayData[activeDay ?? 0]
  const maxCnt = active.topList[0]?.cnt || 1

  return (
    <div className="space-y-5">
      {/* Day selector */}
      <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-4">
        <p className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8] mb-3">ເລືອກວັນ</p>
        <div className="grid grid-cols-7 gap-1.5">
          {dayData.map(({ dow, label, color, drawCount }) => (
            <button key={dow} onClick={() => setActiveDay(dow)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl border transition-all cursor-pointer"
              style={activeDay === dow ? {
                background: color + '18', borderColor: color + '50',
                boxShadow: `0 0 12px ${color}25`,
              } : { background: 'transparent', borderColor: 'rgba(148,163,184,0.15)' }}>
              <span className="text-[9px] font-black leading-tight text-center" style={{ color: activeDay === dow ? color : '#94a3b8' }}>
                {label.replace('ວັນ', '')}
              </span>
              <span className="text-[10px] font-bold" style={{ color: activeDay === dow ? color : '#64748b' }}>
                {drawCount}ງ
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Top numbers for selected day */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5">
          <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-4 flex items-center gap-2">
            <Calendar size={14} style={{ color: active.color }} />
            P5 ★ ອອກຫຼາຍໃນ{active.label} ({active.drawCount} ງວດ)
          </h3>
          {active.topList.length === 0 ? (
            <p className="text-xs text-[#94a3b8] py-4 text-center">ຍັງບໍ່ມີຂໍ້ມູນ</p>
          ) : (
            <div className="space-y-2">
              {active.topList.slice(0, 10).map((row, i) => (
                <div key={row.num} className="flex items-center gap-2">
                  <span className="w-4 text-[10px] text-[#94a3b8] text-right shrink-0">{i + 1}</span>
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-extrabold shrink-0"
                    style={i < 3 ? {
                      background: active.color + '22', color: active.color,
                      border: `1px solid ${active.color}50`,
                      boxShadow: `0 2px 10px ${active.color}30`,
                    } : { background: 'rgba(59,130,246,0.08)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}>
                    {String(row.num).padStart(2, '0')}
                  </span>
                  <div className="flex-1 h-2 bg-[#f1f5f9] dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${(row.cnt / maxCnt) * 100}%`, background: i < 3 ? active.color : '#3b82f6' }} />
                  </div>
                  <span className="text-xs font-bold w-10 text-right shrink-0"
                    style={{ color: i < 3 ? active.color : '#64748b' }}>
                    {row.cnt}x
                  </span>
                  <span className="text-[10px] text-[#94a3b8] w-10 text-right shrink-0">
                    {active.drawCount ? `${((row.cnt / active.drawCount) * 100).toFixed(0)}%` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Heatmap: all 7 days × top 5 numbers */}
        <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5">
          <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-4 flex items-center gap-2">
            <Star size={14} style={{ color: '#d4af37' }} />
            Top 3 P5 ★ ຕໍ່ວັນ
          </h3>
          <div className="space-y-2">
            {dayData.map(({ dow, label, color, topList, drawCount }) => (
              <div key={dow}
                className="flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all"
                style={activeDay === dow ? { background: color + '10', border: `1px solid ${color}25` } : { border: '1px solid transparent' }}
                onClick={() => setActiveDay(dow)}>
                <span className="text-[10px] font-black w-16 shrink-0" style={{ color }}>
                  {label.replace('ວັນ', '')}
                  <span className="text-[#94a3b8] font-normal ml-1">({drawCount})</span>
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {topList.slice(0, 3).map((row, i) => (
                    <span key={row.num}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-extrabold"
                      style={{
                        background: color + (i === 0 ? '30' : i === 1 ? '20' : '12'),
                        color, border: `1px solid ${color}${i === 0 ? '60' : '30'}`,
                      }}>
                      {String(row.num).padStart(2, '0')}
                    </span>
                  ))}
                  {topList.length === 0 && <span className="text-[10px] text-[#94a3b8]">ຍັງບໍ່ມີ</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick stat row */}
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
        {dayData.map(({ dow, label, color, drawCount }) => (
          <div key={dow}
            className="bg-white dark:bg-[#0c1426] border rounded-xl p-3 text-center cursor-pointer transition-all"
            style={activeDay === dow
              ? { borderColor: color, background: color + '08' }
              : { borderColor: 'rgba(148,163,184,0.2)' }}
            onClick={() => setActiveDay(dow)}>
            <p className="text-[9px] font-black uppercase tracking-wide mb-1" style={{ color }}>{label.replace('ວັນ', '')}</p>
            <p className="text-lg font-black text-[#0f172a] dark:text-white">{drawCount}</p>
            <p className="text-[9px] text-[#94a3b8]">ງວດ</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Analysis Panel 5: Ticket Checker ─────────────────────────────
function TicketCheckerPanel({ draws, posStats }) {
  const [p5, setP5] = useState('')
  const [reg, setReg] = useState(['', '', '', ''])

  const nums = Array.from({ length: 45 }, (_, i) => i + 1)

  function setRegAt(idx, val) {
    setReg(prev => { const a = [...prev]; a[idx] = val; return a })
  }

  const result = useMemo(() => {
    if (!p5 || reg.filter(Boolean).length < 1 || !draws?.length) return null
    const ip5 = +p5
    const iregs = reg.filter(Boolean).map(Number)
    const bt = draws.slice(0, Math.min(200, draws.length))

    let h1 = 0, h2 = 0, h3 = 0, h4 = 0, special = 0
    const hitDraws = []

    bt.forEach(d => {
      const ap5 = +d.pos5
      const aregs = [+d.pos1, +d.pos2, +d.pos3, +d.pos4]
      const allFive = [...aregs, ap5]

      const p5ok = ap5 === ip5
      const regMatched = iregs.filter(n => aregs.includes(n)).length
      const allMatch = iregs.length === 4 && iregs.every(n => allFive.includes(n)) && allFive.includes(ip5)

      if (allMatch) special++
      if (p5ok) {
        let tier = 0
        if (regMatched >= 4) { h1++; tier = 1 }
        else if (regMatched >= 3) { h2++; tier = 2 }
        else if (regMatched >= 2) { h3++; tier = 3 }
        else if (regMatched >= 1) { h4++; tier = 4 }
        if (tier > 0) hitDraws.push({ date: d.draw_date, tier, regMatched })
      }
    })

    // Per-number stats
    const p5Row = posStats?.pos5?.find(r => r.number === ip5)
    const regStats = iregs.map(n => ({
      num: n,
      p1: posStats?.pos1?.find(r => r.number === n),
      p2: posStats?.pos2?.find(r => r.number === n),
      p3: posStats?.pos3?.find(r => r.number === n),
      p4: posStats?.pos4?.find(r => r.number === n),
    })).map(x => {
      const totalCount = (x.p1?.count ?? 0) + (x.p2?.count ?? 0) + (x.p3?.count ?? 0) + (x.p4?.count ?? 0)
      const minGap = Math.min(...[x.p1, x.p2, x.p3, x.p4].filter(Boolean).map(r => r.gap ?? 999))
      return { num: x.num, totalCount, minGap: minGap === 999 ? null : minGap }
    })

    return { h1, h2, h3, h4, special, btN: bt.length, hitDraws, p5Row, regStats }
  }, [p5, reg, draws, posStats])

  const PRIZES = [
    { label: 'ລາງວັນທີ 1', hits: result?.h1, need: 'P5 ຕົງ + 4 ເລກ', prize: '1,000,000,000', color: '#d4af37' },
    { label: 'ລາງວັນທີ 2', hits: result?.h2, need: 'P5 ຕົງ + 3 ເລກ', prize: '5,000,000',     color: '#818cf8' },
    { label: 'ລາງວັນທີ 3', hits: result?.h3, need: 'P5 ຕົງ + 2 ເລກ', prize: '200,000',       color: '#22d3ee' },
    { label: 'ລາງວັນທີ 4', hits: result?.h4, need: 'P5 ຕົງ + 1 ເລກ', prize: '20,000',        color: '#4ade80' },
    { label: 'ລາງວັນພິເສດ', hits: result?.special, need: 'ທຸກ 5 ເລກ (ລຳດັບໃດກໍໄດ້)', prize: '10,000,000', color: '#f472b6' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-4">
        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
          ໃສ່ເລກທີ່ຈະຊື້ — ລະບົບ backtest ກັບ {Math.min(200, draws.length)} ງວດ ຜ່ານມາ ວ່າຈະຖືກລາງວັນໃດ
        </p>
      </div>

      {/* Number pickers */}
      <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-6">
        <h3 className="font-black text-base text-[#0f172a] dark:text-[#f1f5f9] mb-5 flex items-center gap-2">
          <ClipboardList size={16} style={{ color: '#d4af37' }} /> ໃສ່ Ticket ຂອງທ່ານ
        </h3>
        <div className="flex flex-wrap items-end gap-4">
          {/* P1-P4 selectors */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8] mb-2">P1-P4 (ລຳດັບໃດກໍໄດ້)</p>
            <div className="flex gap-2 flex-wrap">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[9px] text-[#94a3b8]">ເລກ {i + 1}</span>
                  <select
                    value={reg[i]}
                    onChange={e => setRegAt(i, e.target.value)}
                    className="w-16 h-12 rounded-xl border text-center text-sm font-extrabold tabular-nums cursor-pointer focus:outline-none transition-all"
                    style={reg[i] ? {
                      background: 'rgba(59,130,246,0.1)', color: '#3b82f6',
                      borderColor: 'rgba(59,130,246,0.4)',
                    } : { background: '#f8faff', color: '#94a3b8', borderColor: 'rgba(148,163,184,0.25)' }}>
                    <option value="">—</option>
                    {nums.map(n => <option key={n} value={n}>{String(n).padStart(2, '0')}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* P5 selector */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-[#d4af37] mb-2">P5 ★ (ຕົງ)</p>
            <select
              value={p5}
              onChange={e => setP5(e.target.value)}
              className="w-16 h-12 rounded-xl border text-center text-sm font-extrabold tabular-nums cursor-pointer focus:outline-none transition-all"
              style={p5 ? {
                background: 'linear-gradient(135deg,#d4af37,#fbbf24)', color: '#060b1a',
                borderColor: '#d4af37', boxShadow: '0 2px 14px rgba(212,175,55,0.4)',
              } : { background: '#f8faff', color: '#94a3b8', borderColor: 'rgba(148,163,184,0.25)' }}>
              <option value="">—</option>
              {nums.map(n => <option key={n} value={n}>{String(n).padStart(2, '0')}</option>)}
            </select>
          </div>

          {/* Reset */}
          {(p5 || reg.some(Boolean)) && (
            <button
              onClick={() => { setP5(''); setReg(['', '', '', '']) }}
              className="h-12 px-4 rounded-xl text-xs font-bold border border-[#e2e8f0] dark:border-white/10 text-[#94a3b8] hover:text-red-400 hover:border-red-300 transition-all cursor-pointer">
              ລ້າງ
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {!result && (
        <div className="text-center py-12 text-[#94a3b8]">
          <ClipboardList size={40} className="mx-auto mb-3 opacity-25" />
          <p className="text-sm">ເລືອກ P5 ★ ແລະ ຢ່າງໜ້ອຍ 1 ເລກ P1-P4 ເພື່ອ backtest</p>
        </div>
      )}

      {result && (<>
        {/* Backtest prize summary */}
        <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-6">
          <h3 className="font-black text-base text-[#0f172a] dark:text-[#f1f5f9] mb-4 flex items-center gap-2">
            <Trophy size={16} style={{ color: '#d4af37' }} />
            Backtest ຜົນລາງວັນ ໃນ {result.btN} ງວດ
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {PRIZES.map(({ label, hits, need, prize, color }) => (
              <div key={label} className="rounded-2xl p-4 text-center"
                style={{ background: color + '10', border: `1px solid ${color}${hits ? '50' : '20'}` }}>
                <p className="text-[9px] font-black uppercase tracking-wide mb-1" style={{ color }}>{label}</p>
                <p className="text-3xl font-black" style={{ color }}>{hits ?? 0}</p>
                <p className="text-[10px] text-[#64748b] mt-0.5">ຄັ້ງ</p>
                <p className="text-[10px] font-bold mt-1" style={{ color: color + 'cc' }}>{need}</p>
                <p className="text-[9px] text-[#94a3b8] mt-0.5">{prize} ກີບ</p>
              </div>
            ))}
          </div>
        </div>

        {/* Per-number stats */}
        <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5">
          <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-4">ສະຖິຕິຕົວເລກທີ່ເລືອກ</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#94a3b8] text-[10px] uppercase tracking-wide border-b border-[#f1f5f9] dark:border-white/5">
                  <th className="text-left py-2 px-2">ເລກ</th>
                  <th className="text-left py-2 px-2">ຕຳແໜ່ງ</th>
                  <th className="text-right py-2 px-2">ຄັ້ງທີ່ອອກ (P1-P4 ລວມ)</th>
                  <th className="text-right py-2 px-2">Gap ໃກ້ສຸດ (ວັນ)</th>
                </tr>
              </thead>
              <tbody>
                {/* P5 row */}
                <tr className="border-b border-[#f1f5f9] dark:border-white/4">
                  <td className="py-2.5 px-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-extrabold"
                      style={{ background: 'linear-gradient(135deg,#d4af37,#fbbf24)', color: '#060b1a' }}>
                      {String(result.p5Row?.number ?? +p5).padStart(2, '0')}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 font-bold" style={{ color: '#d4af37' }}>P5 ★ (ຕ້ອງຕົງ)</td>
                  <td className="py-2.5 px-2 text-right font-bold text-[#0f172a] dark:text-white">
                    {result.p5Row?.count ?? '—'} ຄັ້ງ ({result.p5Row?.percentage ?? 0}%)
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <span className={`font-bold ${(result.p5Row?.gap ?? 999) <= 7 ? 'text-emerald-500' : (result.p5Row?.gap ?? 999) >= 30 ? 'text-red-400' : 'text-[#64748b]'}`}>
                      {result.p5Row?.gap != null ? `${result.p5Row.gap} ວ` : '—'}
                    </span>
                  </td>
                </tr>
                {/* Regular rows */}
                {result.regStats.map(row => (
                  <tr key={row.num} className="border-b border-[#f1f5f9] dark:border-white/4">
                    <td className="py-2.5 px-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-extrabold"
                        style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.25)' }}>
                        {String(row.num).padStart(2, '0')}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-[#64748b]">P1-P4</td>
                    <td className="py-2.5 px-2 text-right font-bold text-[#0f172a] dark:text-white">
                      {row.totalCount} ຄັ້ງ
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <span className={`font-bold ${(row.minGap ?? 999) <= 7 ? 'text-emerald-500' : (row.minGap ?? 999) >= 30 ? 'text-red-400' : 'text-[#64748b]'}`}>
                        {row.minGap != null ? `${row.minGap} ວ` : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hit history */}
        {result.hitDraws.length > 0 && (
          <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5">
            <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-3 flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500" />
              ງວດທີ່ຈະຖືກ ({result.hitDraws.length} ຄັ້ງ)
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.hitDraws.slice(0, 40).map((h, i) => {
                const tierColor = ['', '#d4af37', '#818cf8', '#22d3ee', '#4ade80', '#f472b6'][h.tier] ?? '#94a3b8'
                return (
                  <div key={i} className="rounded-xl px-3 py-2 text-center min-w-[80px] border"
                    style={{ background: tierColor + '10', borderColor: tierColor + '35' }}>
                    <p className="text-[9px] font-black" style={{ color: tierColor }}>
                      ລາງວັນທີ {h.tier === 5 ? 'ພິເສດ' : h.tier}
                    </p>
                    <p className="text-[11px] font-bold text-[#374151] dark:text-[#94a3b8]">{h.date}</p>
                    <p className="text-[9px] text-[#94a3b8]">ຖືກ {h.regMatched} + P5</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {result.hitDraws.length === 0 && (
          <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-6 text-center">
            <XCircle size={32} className="mx-auto mb-2 text-[#94a3b8] opacity-40" />
            <p className="text-sm text-[#64748b]">ບໍ່ຖືກລາງວັນໃດໃນ {result.btN} ງວດທີ່ຜ່ານມາ</p>
            <p className="text-xs text-[#94a3b8] mt-1">ລອງປ່ຽນ P5 ★ ຫຼື ເພີ່ມເລກ P1-P4</p>
          </div>
        )}
      </>)}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────
const ANALYSIS_TABS = [
  { id: 'stats',     label: 'ສະຖິຕິ',         icon: Hash },
  { id: 'hotcold',   label: 'ຮ້ອນ / ເຢັນ',    icon: Flame },
  { id: 'gap',       label: 'Gap Analysis',   icon: TrendingDown },
  { id: 'smartpick', label: 'ຊ່ວຍເລືອກ',      icon: Target },
  { id: 'dayfreq',   label: 'ຄວາມຖີ່ຕາມວັນ',  icon: Calendar },
  { id: 'ticket',    label: 'ທົດສອບ Ticket',   icon: ClipboardList },
]

export default function Happy545Page() {
  const [draws, setDraws] = useState([])
  const [stats, setStats] = useState([])
  const [posStats, setPosStats] = useState({})
  const [activePos, setActivePos] = useState(5)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [tab, setTab] = useState('stats')

  const [drawPage, setDrawPage] = useState(1)
  const [drawPageSize, setDrawPageSize] = useState(15)
  const [statPage, setStatPage] = useState(1)
  const [statPageSize, setStatPageSize] = useState(15)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [rD, rS, rP] = await Promise.all([
        fetch(`${API}?r=draws`),
        fetch(`${API}?r=stats/last-digit`),
        fetch(`${API}?r=stats/all-positions`),
      ])
      if (rD.ok) setDraws(await rD.json())
      if (rS.ok) setStats(await rS.json())
      if (rP.ok) setPosStats(await rP.json())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setStatPage(1) }, [activePos])

  const totalDraws = draws.length
  const topNumber = stats[0]
  const neverOut = stats.filter(s => s.count === 0).length
  const paginatedDraws = draws.slice((drawPage - 1) * drawPageSize, drawPage * drawPageSize)
  const activePosData = posStats[`pos${activePos}`] ?? []
  const paginatedStats = activePosData.slice((statPage - 1) * statPageSize, statPage * statPageSize)

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
            <p className="text-sm text-[#94a3b8]">ສະຖິຕິເລກຕາມຕຳແໜ່ງ P1–P5 · ວິເຄາະ 45 ຄ່າ</p>
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
            <StatCard icon={Calendar} label="ງວດທັງໝົດ"
              value={`${totalDraws} ງວດ`}
              color="#3b82f6" />
            <StatCard icon={Trophy} label="ເລກທ້າຍຈ່ອຍສຸດ"
              value={topNumber ? topNumber.label : '—'}
              sub={topNumber ? `ອອກ ${topNumber.count} ຄັ້ງ · ${topNumber.percentage}%` : ''}
              color="#d4af37" />
            <StatCard icon={TrendingDown} label="ຍັງບໍ່ເຄີຍອອກ"
              value={`${neverOut} ເລກ`}
              color="#6366f1" />
          </div>
        )}

        {/* ── Analysis Tab Bar ── */}
        {!loading && (
          <div className="flex gap-2 flex-wrap">
            {ANALYSIS_TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                style={tab === id ? {
                  background: 'linear-gradient(135deg,#d4af37,#fbbf24)',
                  borderColor: '#d4af37', color: '#060b1a',
                } : { background: 'transparent', borderColor: 'rgba(148,163,184,0.25)', color: '#64748b' }}>
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* ── Tab: Hot/Cold ── */}
        {tab === 'hotcold' && !loading && (
          <HotColdPanel draws={draws} />
        )}

        {/* ── Tab: Gap Analysis ── */}
        {tab === 'gap' && !loading && (
          <GapAnalysisPanel draws={draws} posStats={posStats} />
        )}

        {/* ── Tab: Smart Pick ── */}
        {tab === 'smartpick' && !loading && (
          <SmartPickPanel draws={draws} posStats={posStats} />
        )}

        {/* ── Tab: Day-of-week Frequency ── */}
        {tab === 'dayfreq' && !loading && (
          <DayFreqPanel draws={draws} />
        )}

        {/* ── Tab: Ticket Checker ── */}
        {tab === 'ticket' && !loading && (
          <TicketCheckerPanel draws={draws} posStats={posStats} />
        )}

        {/* ── Per-position stats + Top5 + Stats table (stats tab only) ── */}
        {tab === 'stats' && (<>
          <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-6">
            {/* Header + position tabs */}
            <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
              <div>
                <h2 className="font-black text-base text-[#0f172a] dark:text-[#f1f5f9] flex items-center gap-2 mb-0.5">
                  <Hash size={15} style={{ color: '#d4af37' }} />
                  ຄວາມຖີ່ · ຕຳແໜ່ງ {activePos === 5 ? 'P5 ★' : `P${activePos}`} · ທຸກ 45 ຄ່າ
                </h2>
                <p className="text-xs text-[#94a3b8]">
                  ລຽງຈາກຫຼາຍ → ໜ້ອຍ ·&nbsp;
                  <span style={{ color: '#d4af37' }}>■</span> ທອງ = Top 5
                </p>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {[1, 2, 3, 4, 5].map(p => (
                  <button
                    key={p}
                    onClick={() => setActivePos(p)}
                    className="h-7 px-3 rounded-lg text-[11px] font-bold border transition-all cursor-pointer"
                    style={activePos === p ? {
                      background: 'linear-gradient(135deg,#d4af37,#fbbf24)',
                      borderColor: '#d4af37',
                      color: '#060b1a',
                    } : {
                      background: 'transparent',
                      borderColor: 'rgba(148,163,184,0.25)',
                      color: '#64748b',
                    }}
                  >
                    P{p}{p === 5 ? ' ★' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Position summary row — top number per position */}
            <div className="grid grid-cols-5 gap-2 mb-5 p-3 bg-[#f8faff] dark:bg-[#080f1e] rounded-xl">
              {[1, 2, 3, 4, 5].map(p => {
                const pd = posStats[`pos${p}`] ?? []
                const top = pd[0]
                const isActive = p === activePos
                return (
                  <button
                    key={p}
                    onClick={() => setActivePos(p)}
                    className="rounded-lg p-2 text-center transition-all cursor-pointer"
                    style={isActive ? {
                      background: 'rgba(212,175,55,0.1)',
                      boxShadow: 'inset 0 0 0 1px rgba(212,175,55,0.35)',
                    } : {}}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#94a3b8] mb-0.5">
                      ຕຳ {p}{p === 5 ? ' ★' : ''}
                    </p>
                    {loading || !top ? (
                      <div className="h-5 w-7 bg-[#e2e8f0] dark:bg-white/10 rounded animate-pulse mx-auto my-1" />
                    ) : (
                      <p
                        className="text-xl font-black tabular-nums leading-tight"
                        style={{ color: isActive ? '#d4af37' : '#0f172a' }}
                      >
                        {top.label}
                      </p>
                    )}
                    <p className="text-[9px] text-[#64748b] mt-0.5">{top?.count ?? 0}x</p>
                  </button>
                )
              })}
            </div>

            {/* Bar chart for active position */}
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div
                  className="w-8 h-8 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(212,175,55,0.2)', borderTopColor: '#d4af37' }}
                />
              </div>
            ) : activePosData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3 text-[#94a3b8]">
                <Hash size={32} className="opacity-25" />
                <p className="text-sm">ຍັງບໍ່ມີຂໍ້ມູນສະຖິຕິ</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={activePosData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
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
          {!loading && activePosData.length > 0 && (
            <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-6">
              <h2 className="font-black text-base text-[#0f172a] dark:text-[#f1f5f9] flex items-center gap-2 mb-5">
                <Trophy size={16} style={{ color: '#d4af37' }} />
                Top 5 · ຕຳແໜ່ງ {activePos === 5 ? 'P5 ★' : `P${activePos}`}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {activePosData.slice(0, 5).map((row, i) => {
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
              <h2 className="font-black text-base text-[#0f172a] dark:text-[#f1f5f9]">
                ຕາຕະລາງສະຖິຕິ · ຕຳແໜ່ງ {activePos === 5 ? 'P5 ★' : `P${activePos}`}
              </h2>
              <span className="text-xs text-[#94a3b8]">{activePosData.length} ເລກ</span>
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
                    const isTop5 = globalIdx < 5
                    const accent = isTop5 ? TOP_COLORS[globalIdx] : null
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
              total={activePosData.length} page={statPage} pageSize={statPageSize}
              onPageChange={setStatPage}
              onPageSizeChange={v => { setStatPageSize(v); setStatPage(1) }}
            />
          </div>
        </>)}

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
