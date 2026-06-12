import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { PlusCircle, Trash2, AlertCircle, Trophy, TrendingUp, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const API = '/laoloterylive/api/happy545.php'

// ── colour palette: top-5 gold/silver/bronze then blue gradient ────
const TOP_COLORS = ['#f59e0b', '#94a3b8', '#b45309', '#003fb1', '#1d4ed8']
const DEFAULT_COLOR = '#93c5fd'

function getBarColor(idx) {
  return idx < 5 ? TOP_COLORS[idx] : DEFAULT_COLOR
}

// ── Custom bar tooltip ─────────────────────────────────────────────
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white dark:bg-[#1a1033] border border-[#dee9fd] rounded-xl p-3 shadow-lg text-xs">
      <p className="font-bold text-[#003fb1] text-base mb-1">ເລກ {d.label}</p>
      <p>ອອກ: <span className="font-semibold">{d.count} ຄັ້ງ</span></p>
      <p>ສ່ວນຮ້ອຍ: <span className="font-semibold">{d.percentage}%</span></p>
      {d.last_seen_date
        ? <p>ຄັ້ງລ່າສຸດ: <span className="font-semibold">{d.last_seen_date}</span></p>
        : <p className="text-gray-400">ຍັງບໍ່ເຄີຍອອກ</p>}
      {d.gap != null && <p>Gap: <span className="font-semibold">{d.gap} ວັນ</span></p>}
    </div>
  )
}

// ── Number select dropdown ─────────────────────────────────────────
function NumSelect({ label, value, onChange, numbers }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-[#737686]">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        className="border border-[#dee9fd] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#12102a] focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 min-w-[80px]"
      >
        <option value="">—</option>
        {numbers.map(n => (
          <option key={n.num} value={n.num}>{n.label}</option>
        ))}
      </select>
    </div>
  )
}

// ── Stat card ──────────────────────────────────────────────────────
function StatCard({ icon: Icon, title, value, sub, color }) {
  return (
    <div className="bg-white dark:bg-[#1a1033] border border-[#dee9fd] dark:border-[#2a1e50] rounded-2xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + '22' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-[#737686]">{title}</p>
        <p className="font-bold text-lg leading-tight">{value}</p>
        {sub && <p className="text-xs text-[#737686]">{sub}</p>}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
export default function LastDigitAnalysis() {
  const [numbers, setNumbers]   = useState([])
  const [draws, setDraws]       = useState([])
  const [stats, setStats]       = useState([])
  const [loading, setLoading]   = useState(true)

  // form state
  const [form, setForm] = useState({ draw_date: '', pos1: '', pos2: '', pos3: '', pos4: '', pos5: '' })
  const [submitting, setSubmitting] = useState(false)

  // ── fetch helpers ────────────────────────────────────────────────
  const fetchNumbers = useCallback(async () => {
    const res = await fetch(`${API}?r=numbers`)
    if (res.ok) setNumbers(await res.json())
  }, [])

  const fetchDraws = useCallback(async () => {
    const res = await fetch(`${API}?r=draws`)
    if (res.ok) setDraws(await res.json())
  }, [])

  const fetchStats = useCallback(async () => {
    const res = await fetch(`${API}?r=stats/last-digit`)
    if (res.ok) setStats(await res.json())
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchNumbers(), fetchDraws(), fetchStats()])
    setLoading(false)
  }, [fetchNumbers, fetchDraws, fetchStats])

  useEffect(() => { refresh() }, [refresh])

  // ── submit new draw ──────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    const positions = ['pos1','pos2','pos3','pos4','pos5']
    for (const p of positions) {
      if (!form[p]) { toast.error(`ກະລຸນາເລືອກ ${p}`); return }
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${API}?r=draws`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draw_date: form.draw_date,
          pos1: +form.pos1, pos2: +form.pos2,
          pos3: +form.pos3, pos4: +form.pos4,
          pos5: +form.pos5,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('ບັນທຶກຜົນເລກສຳເລັດ')
        setForm({ draw_date: '', pos1: '', pos2: '', pos3: '', pos4: '', pos5: '' })
        await Promise.all([fetchDraws(), fetchStats()])
      } else {
        toast.error(data.error || 'ເກີດຂໍ້ຜິດພາດ')
      }
    } catch {
      toast.error('ເຊື່ອມຕໍ່ server ບໍ່ໄດ້')
    } finally {
      setSubmitting(false)
    }
  }

  // ── delete draw ──────────────────────────────────────────────────
  async function handleDelete(id, date) {
    if (!confirm(`ລຶບຜົນເລກວັນທີ ${date}?`)) return
    const res = await fetch(`${API}?r=draws&id=${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (res.ok) {
      toast.success('ລຶບສຳເລັດ')
      await Promise.all([fetchDraws(), fetchStats()])
    } else {
      toast.error(data.error || 'ລຶບບໍ່ສຳເລັດ')
    }
  }

  // ── derived stats ─────────────────────────────────────────────────
  const totalDraws = draws.length
  const topNumber  = stats[0]
  const hotStreak  = stats.filter(s => s.gap != null && s.gap <= 7).length

  return (
    <div className="space-y-8 pb-16">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          ວິເຄາະເລກທ້າຍ — Happy 545
        </h1>
        <p className="text-sm text-[#737686] mt-1">
          ສະຖິຕິຕຳແໜ່ງທີ 5 (ເລກທ້າຍ) ຂອງທຸກງວດ
        </p>
      </div>

      {/* ── Disclaimer ─────────────────────────────────────────── */}
      <div className="flex gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4">
        <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <strong>ໝາຍເຫດ:</strong> ສະຖິຕິໃນໜ້ານີ້ໃຊ້ເພື່ອເບິ່ງຂໍ້ມູນໃນອະດີດເທົ່ານັ້ນ.
          ການອອກເລກແຕ່ລະຄັ້ງເປັນເອກະລາດ ສຸ່ມຄົງທີ່ — ສະຖິຕິ<strong>ບໍ່ສາມາດທຳນາຍ</strong>ຜົນໃນອະນາຄົດໄດ້.
        </p>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Calendar}
          title="ທັງໝົດທີ່ບັນທຶກ"
          value={`${totalDraws} ງວດ`}
          color="#003fb1"
        />
        <StatCard
          icon={Trophy}
          title="ເລກທ້າຍຈ່ອຍສຸດ"
          value={topNumber ? `${topNumber.label} (${topNumber.count} ຄັ້ງ)` : '—'}
          sub={topNumber ? `${topNumber.percentage}%` : ''}
          color="#f59e0b"
        />
        <StatCard
          icon={TrendingUp}
          title="ເລກອອກໃນ 7 ວັນຜ່ານມາ"
          value={`${hotStreak} ເລກ`}
          color="#16a34a"
        />
      </div>

      {/* ── Add draw form ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#1a1033] border border-[#dee9fd] dark:border-[#2a1e50] rounded-2xl p-6">
        <h2 className="font-bold text-base mb-4 flex items-center gap-2">
          <PlusCircle size={18} className="text-[#003fb1]" />
          ເພີ່ມຜົນເລກໃໝ່
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap gap-4 items-end">
            {/* Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#737686]">ວັນທີງວດ</label>
              <input
                type="date"
                value={form.draw_date}
                onChange={e => setForm(f => ({ ...f, draw_date: e.target.value }))}
                required
                className="border border-[#dee9fd] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#12102a] focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40"
              />
            </div>

            {/* pos1 – pos5 */}
            {['pos1','pos2','pos3','pos4','pos5'].map((p, i) => (
              <NumSelect
                key={p}
                label={i < 4 ? `ຕຳແໜ່ງ ${i+1}` : 'ເລກທ້າຍ (pos5)'}
                value={form[p]}
                onChange={v => setForm(f => ({ ...f, [p]: v }))}
                numbers={numbers}
              />
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#003fb1] hover:bg-[#0035a0] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {submitting ? 'ກຳລັງບັນທຶກ…' : 'ບັນທຶກ'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Bar chart ───────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#1a1033] border border-[#dee9fd] dark:border-[#2a1e50] rounded-2xl p-6">
        <h2 className="font-bold text-base mb-1">ຄວາມຖີ່ເລກທ້າຍ (pos5)</h2>
        <p className="text-xs text-[#737686] mb-5">ລຽງຈາກຫຼາຍ → ໜ້ອຍ · ສີທອງ = Top 5</p>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#003fb1]/20 border-t-[#003fb1] animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={46}
              />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {stats.map((_, idx) => (
                  <Cell key={idx} fill={getBarColor(idx)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Frequency table ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#1a1033] border border-[#dee9fd] dark:border-[#2a1e50] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#dee9fd] dark:border-[#2a1e50]">
          <h2 className="font-bold text-base">ຕາຕະລາງລາຍລະອຽດ</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f8faff] dark:bg-[#12102a] text-[#737686] text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">ເລກ</th>
                <th className="px-4 py-3 text-right">ຄັ້ງ</th>
                <th className="px-4 py-3 text-right">%</th>
                <th className="px-4 py-3 text-right">ລ່າສຸດ</th>
                <th className="px-4 py-3 text-right">Gap (ວັນ)</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((row, idx) => (
                <tr
                  key={row.number}
                  className={[
                    'border-t border-[#f0f4ff] dark:border-[#1e1842] transition-colors hover:bg-[#f8faff] dark:hover:bg-[#1e1842]',
                    idx < 5 ? 'font-semibold' : '',
                  ].join(' ')}
                >
                  <td className="px-4 py-3 text-[#737686]">
                    {idx < 5 && <span className="inline-block w-5 h-5 text-center text-xs rounded-full mr-1" style={{ background: TOP_COLORS[idx] + '33', color: TOP_COLORS[idx] }}>{idx + 1}</span>}
                    {idx >= 5 && idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold"
                      style={{
                        background: idx < 5 ? TOP_COLORS[idx] + '22' : '#eff6ff',
                        color:      idx < 5 ? TOP_COLORS[idx] : '#003fb1',
                      }}
                    >
                      {row.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.count}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-[#737686]">{row.percentage}%</td>
                  <td className="px-4 py-3 text-right text-[#737686] tabular-nums">
                    {row.last_seen_date ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {row.gap != null ? (
                      <span className={row.gap <= 7 ? 'text-green-600 font-semibold' : row.gap >= 30 ? 'text-red-500' : ''}>
                        {row.gap}
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Draw history ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#1a1033] border border-[#dee9fd] dark:border-[#2a1e50] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#dee9fd] dark:border-[#2a1e50]">
          <h2 className="font-bold text-base">ປະຫວັດຜົນເລກ</h2>
        </div>
        {draws.length === 0 ? (
          <p className="text-center py-12 text-[#737686] text-sm">ຍັງບໍ່ມີຂໍ້ມູນ — ເພີ່ມຜົນເລກໃໝ່ຂ້າງເທິງ</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8faff] dark:bg-[#12102a] text-[#737686] text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">ວັນທີ</th>
                  <th className="px-4 py-3 text-center">P1</th>
                  <th className="px-4 py-3 text-center">P2</th>
                  <th className="px-4 py-3 text-center">P3</th>
                  <th className="px-4 py-3 text-center">P4</th>
                  <th className="px-4 py-3 text-center">P5 (ທ້າຍ)</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {draws.map(d => (
                  <tr key={d.id} className="border-t border-[#f0f4ff] dark:border-[#1e1842] hover:bg-[#f8faff] dark:hover:bg-[#1e1842] transition-colors">
                    <td className="px-4 py-3 font-medium">{d.draw_date}</td>
                    {[d.pos1, d.pos2, d.pos3, d.pos4].map((p, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#eff6ff] text-[#003fb1] font-bold text-sm">
                          {String(p).padStart(2,'0')}
                        </span>
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-700 font-bold text-sm">
                        {String(d.pos5).padStart(2,'0')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(d.id, d.draw_date)}
                        className="p-1.5 text-[#737686] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="ລຶບ"
                      >
                        <Trash2 size={15} />
                      </button>
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
