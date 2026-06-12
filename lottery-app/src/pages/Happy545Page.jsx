import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { AlertCircle, Trophy, Calendar, Hash, TrendingDown } from 'lucide-react'
import { API as API_BASE } from '../utils/api'

const API = `${API_BASE}/happy545.php`

const TOP_COLORS = ['#f59e0b', '#94a3b8', '#b45309', '#003fb1', '#1d4ed8']
const DEFAULT_COLOR = '#bfdbfe'

function barColor(idx) {
  return idx < 5 ? TOP_COLORS[idx] : DEFAULT_COLOR
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white dark:bg-[#1a1033] border border-[#dee9fd] rounded-xl p-3 shadow-lg text-xs min-w-[140px]">
      <p className="font-bold text-[#003fb1] text-sm mb-1">ເລກ {d.label}</p>
      <p className="text-gray-700 dark:text-gray-300">ອອກ: <b>{d.count}</b> ຄັ້ງ</p>
      <p className="text-gray-500">{d.percentage}%</p>
      {d.last_seen_date
        ? <p className="text-gray-400 mt-1">ລ່າສຸດ: {d.last_seen_date}</p>
        : <p className="text-gray-300 mt-1">ຍັງບໍ່ເຄີຍອອກ</p>}
      {d.gap != null && <p className="text-gray-400">Gap: {d.gap} ວັນ</p>}
    </div>
  )
}

function Card({ icon: Icon, label, value, sub, color = '#003fb1' }) {
  return (
    <div className="bg-white dark:bg-[#1a1033] border border-[#dee9fd] dark:border-[#2a1e50] rounded-2xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + '18' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-[#737686] uppercase tracking-wide font-semibold">{label}</p>
        <p className="font-extrabold text-lg leading-tight truncate">{value}</p>
        {sub && <p className="text-xs text-[#737686]">{sub}</p>}
      </div>
    </div>
  )
}

// ── Number ball chip ──────────────────────────────────────────────
function Ball({ num, highlight }) {
  return (
    <span
      className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-extrabold"
      style={{
        background: highlight ? 'linear-gradient(135deg,#f59e0b,#b45309)' : '#eff6ff',
        color:      highlight ? '#fff' : '#003fb1',
        boxShadow:  highlight ? '0 2px 10px rgba(245,158,11,0.4)' : 'none',
      }}
    >
      {String(num).padStart(2, '0')}
    </span>
  )
}

export default function Happy545Page() {
  const [draws, setDraws]   = useState([])
  const [stats, setStats]   = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const [rD, rS] = await Promise.all([
      fetch(`${API}?r=draws`),
      fetch(`${API}?r=stats/last-digit`),
    ])
    if (rD.ok) setDraws(await rD.json())
    if (rS.ok) setStats(await rS.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const totalDraws  = draws.length
  const topNumber   = stats[0]
  const neverOut    = stats.filter(s => s.count === 0).length
  const recent20    = draws.slice(0, 20)

  return (
    <div className="space-y-8 pb-16">

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
          <span className="text-2xl">🎲</span>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Happy 545</h1>
          <p className="text-sm text-[#737686] mt-0.5">ສະຖິຕິເລກທ້າຍ (ຕຳແໜ່ງທີ 5) · ຂໍ້ມູນຈາກ {totalDraws} ງວດ</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4">
        <AlertCircle size={17} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <strong>ໝາຍເຫດ:</strong> ສະຖິຕິໃຊ້ເບິ່ງຂໍ້ມູນອະດີດເທົ່ານັ້ນ — ການອອກເລກແຕ່ລະຄັ້ງເປັນເອກະລາດ
          ບໍ່ສາມາດ<strong>ທຳນາຍ</strong>ອະນາຄົດໄດ້.
        </p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-[#f0f4ff] dark:bg-[#1a1033] rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card icon={Calendar} label="ງວດທັງໝົດ"      value={`${totalDraws} ງວດ`}                                           color="#003fb1" />
          <Card icon={Trophy}   label="ເລກທ້າຍຈ່ອຍສຸດ" value={topNumber ? `${topNumber.label}` : '—'} sub={topNumber ? `${topNumber.count} ຄັ້ງ — ${topNumber.percentage}%` : ''} color="#f59e0b" />
          <Card icon={TrendingDown} label="ຍັງບໍ່ເຄີຍອອກ" value={`${neverOut} ເລກ`}                                          color="#6366f1" />
        </div>
      )}

      {/* Bar chart */}
      <div className="bg-white dark:bg-[#1a1033] border border-[#dee9fd] dark:border-[#2a1e50] rounded-2xl p-6">
        <h2 className="font-bold text-base mb-1 flex items-center gap-2">
          <Hash size={16} className="text-[#003fb1]" />
          ຄວາມຖີ່ເລກທ້າຍ (pos5) ທຸກ 45 ຄ່າ
        </h2>
        <p className="text-xs text-[#737686] mb-5">ລຽງຈາກຫຼາຍ → ໜ້ອຍ · ສີທອງ = Top 5</p>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#003fb1]/20 border-t-[#003fb1] animate-spin" />
          </div>
        ) : stats.length === 0 ? (
          <p className="text-center text-[#737686] text-sm py-12">ຍັງບໍ່ມີຂໍ້ມູນ</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} angle={-45} textAnchor="end" height={46} />
              <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {stats.map((_, i) => <Cell key={i} fill={barColor(i)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top 5 highlight */}
      {!loading && stats.length > 0 && (
        <div className="bg-white dark:bg-[#1a1033] border border-[#dee9fd] dark:border-[#2a1e50] rounded-2xl p-6">
          <h2 className="font-bold text-base mb-4 flex items-center gap-2">
            <Trophy size={16} className="text-amber-500" />
            Top 5 ເລກທ້າຍທີ່ອອກຫຼາຍສຸດ
          </h2>
          <div className="flex flex-wrap gap-4">
            {stats.slice(0, 5).map((row, i) => (
              <div key={row.number} className="flex items-center gap-3 bg-[#f8faff] dark:bg-[#12102a] rounded-xl p-3 min-w-[130px]">
                <div className="relative">
                  <Ball num={row.num ?? row.number} highlight />
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                    style={{ background: TOP_COLORS[i], color: '#fff' }}
                  >{i + 1}</span>
                </div>
                <div>
                  <p className="font-bold text-sm">{row.count} ຄັ້ງ</p>
                  <p className="text-xs text-[#737686]">{row.percentage}%</p>
                  {row.gap != null && <p className="text-xs text-[#737686]">Gap {row.gap}ວ</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full stats table */}
      <div className="bg-white dark:bg-[#1a1033] border border-[#dee9fd] dark:border-[#2a1e50] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#dee9fd] dark:border-[#2a1e50]">
          <h2 className="font-bold text-base">ຕາຕະລາງສະຖິຕິທຸກເລກ</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f8faff] dark:bg-[#12102a] text-[#737686] text-xs uppercase tracking-wide">
                {['#','ເລກ','ຄັ້ງ','%','ລ່າສຸດ','Gap (ວັນ)'].map((h, i) => (
                  <th key={h} className={`px-4 py-3 ${i > 1 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((row, idx) => (
                <tr key={row.number}
                  className={`border-t border-[#f0f4ff] dark:border-[#1e1842] hover:bg-[#f8faff] dark:hover:bg-[#1e1842] transition-colors ${idx < 5 ? 'font-semibold' : ''}`}
                >
                  <td className="px-4 py-3 text-[#737686] text-xs w-9">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-extrabold"
                      style={{
                        background: idx < 5 ? TOP_COLORS[idx] + '20' : '#eff6ff',
                        color:      idx < 5 ? TOP_COLORS[idx] : '#003fb1',
                        border:     idx < 5 ? `1px solid ${TOP_COLORS[idx]}40` : 'none',
                      }}
                    >{row.label}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.count}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-[#737686]">{row.percentage}%</td>
                  <td className="px-4 py-3 text-right text-[#737686] tabular-nums text-xs">{row.last_seen_date ?? '—'}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {row.gap != null
                      ? <span className={row.gap <= 7 ? 'text-green-600 font-bold' : row.gap >= 30 ? 'text-red-400' : 'text-[#737686]'}>{row.gap}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent 20 draws */}
      <div className="bg-white dark:bg-[#1a1033] border border-[#dee9fd] dark:border-[#2a1e50] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#dee9fd] dark:border-[#2a1e50] flex items-center justify-between">
          <h2 className="font-bold text-base">ຜົນເລກຫຼ້າສຸດ</h2>
          <span className="text-xs text-[#737686]">20 ງວດລ່າສຸດ</span>
        </div>
        {recent20.length === 0 ? (
          <p className="text-center py-12 text-[#737686] text-sm">ຍັງບໍ່ມີຂໍ້ມູນ</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8faff] dark:bg-[#12102a] text-[#737686] text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">ວັນທີ</th>
                  {['P1','P2','P3','P4'].map(h => <th key={h} className="px-2 py-3 text-center">{h}</th>)}
                  <th className="px-4 py-3 text-center">P5 ★</th>
                </tr>
              </thead>
              <tbody>
                {recent20.map(d => (
                  <tr key={d.id} className="border-t border-[#f0f4ff] dark:border-[#1e1842] hover:bg-[#f8faff] dark:hover:bg-[#1e1842] transition-colors">
                    <td className="px-4 py-2.5 font-medium text-xs">{d.draw_date}</td>
                    {[d.pos1, d.pos2, d.pos3, d.pos4].map((p, i) => (
                      <td key={i} className="px-2 py-2.5 text-center">
                        <Ball num={p} highlight={false} />
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-center">
                      <Ball num={d.pos5} highlight />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
