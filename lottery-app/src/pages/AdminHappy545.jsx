import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import toast from 'react-hot-toast'

const API = '/laoloterylive/api/happy545.php'

// ── colour mapping: top-5 gold gradient, rest dim blue ───────────
const TOP_COLORS = ['#d4af37', '#f59e0b', '#b45309', '#3b82f6', '#6366f1']
const DEFAULT_COLOR = '#1e2a4a'

function getBarColor(idx) {
  return idx < 5 ? TOP_COLORS[idx] : DEFAULT_COLOR
}

// ── Custom tooltip ────────────────────────────────────────────────
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{ background: '#141830', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: '#d4af37', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>ເລກ {d.label}</p>
      <p style={{ color: '#E8E6F0', margin: '2px 0' }}>ອອກ: <b>{d.count}</b> ຄັ້ງ</p>
      <p style={{ color: '#E8E6F0', margin: '2px 0' }}>ສ່ວນຮ້ອຍ: <b>{d.percentage}%</b></p>
      {d.last_seen_date
        ? <p style={{ color: '#9ca3af', margin: '2px 0' }}>ລ່າສຸດ: {d.last_seen_date}</p>
        : <p style={{ color: '#6b7280', margin: '2px 0' }}>ຍັງບໍ່ເຄີຍອອກ</p>}
      {d.gap != null && <p style={{ color: '#9ca3af', margin: '2px 0' }}>Gap: {d.gap} ວັນ</p>}
    </div>
  )
}

// ── Admin stat card ───────────────────────────────────────────────
function StatCard({ icon, title, value, sub, accent = '#d4af37' }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0c1020 0%, #10152a 100%)',
      border: '1px solid rgba(212,175,55,0.12)',
      borderRadius: 14, padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: accent + '18', border: `1px solid ${accent}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: accent }}>{icon}</span>
      </div>
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(232,230,240,0.4)', margin: 0 }}>{title}</p>
        <p style={{ fontSize: 18, fontWeight: 800, color: '#E8E6F0', lineHeight: 1.2, margin: '2px 0 0' }}>{value}</p>
        {sub && <p style={{ fontSize: 11, color: 'rgba(232,230,240,0.4)', margin: 0 }}>{sub}</p>}
      </div>
    </div>
  )
}

// ── Number dropdown ───────────────────────────────────────────────
function NumSelect({ label, value, onChange, numbers }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(232,230,240,0.45)' }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        style={{
          background: '#0b0e1a', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10, padding: '8px 12px', fontSize: 14, fontWeight: 600,
          color: '#E8E6F0', outline: 'none', minWidth: 76, cursor: 'pointer',
        }}
      >
        <option value="">—</option>
        {numbers.map(n => (
          <option key={n.num} value={n.num}>{n.label}</option>
        ))}
      </select>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
export default function AdminHappy545() {
  const [numbers, setNumbers] = useState([])
  const [draws, setDraws]     = useState([])
  const [stats, setStats]     = useState([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({ draw_date: '', pos1: '', pos2: '', pos3: '', pos4: '', pos5: '' })
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting]     = useState(null)

  // ── fetch ──────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    const [rN, rD, rS] = await Promise.all([
      fetch(`${API}?r=numbers`),
      fetch(`${API}?r=draws`),
      fetch(`${API}?r=stats/last-digit`),
    ])
    if (rN.ok) setNumbers(await rN.json())
    if (rD.ok) setDraws(await rD.json())
    if (rS.ok) setStats(await rS.json())
    setLoading(false)
  }, [])

  const refreshStats = useCallback(async () => {
    const [rD, rS] = await Promise.all([
      fetch(`${API}?r=draws`),
      fetch(`${API}?r=stats/last-digit`),
    ])
    if (rD.ok) setDraws(await rD.json())
    if (rS.ok) setStats(await rS.json())
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── submit ─────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    for (const p of ['pos1','pos2','pos3','pos4','pos5']) {
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
        await refreshStats()
      } else {
        toast.error(data.error || 'ເກີດຂໍ້ຜິດພາດ')
      }
    } catch {
      toast.error('ເຊື່ອມຕໍ່ server ບໍ່ໄດ້')
    } finally {
      setSubmitting(false)
    }
  }

  // ── delete ─────────────────────────────────────────────────────
  async function handleDelete(id, date) {
    if (!confirm(`ລຶບຜົນເລກວັນທີ ${date}?`)) return
    setDeleting(id)
    try {
      const res  = await fetch(`${API}?r=draws&id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        toast.success('ລຶບສຳເລັດ')
        await refreshStats()
      } else {
        toast.error(data.error || 'ລຶບບໍ່ສຳເລັດ')
      }
    } finally {
      setDeleting(null)
    }
  }

  // ── derived ────────────────────────────────────────────────────
  const totalDraws = draws.length
  const topNumber  = stats[0]
  const neverOut   = stats.filter(s => s.count === 0).length

  const CARD_STYLE = {
    background: 'linear-gradient(135deg, #0c1020 0%, #10152a 100%)',
    border: '1px solid rgba(212,175,55,0.12)',
    borderRadius: 16, overflow: 'hidden',
  }
  const TH_STYLE = {
    padding: '10px 14px', fontSize: 9, fontWeight: 800,
    letterSpacing: '0.14em', textTransform: 'uppercase',
    color: 'rgba(212,175,55,0.45)', textAlign: 'left',
    background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(212,175,55,0.08)',
  }
  const TD_STYLE = { padding: '10px 14px', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.04)' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#d4af37', fontVariationSettings: "'FILL' 1" }}>casino</span>
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#E8E6F0', margin: 0 }}>ຈັດການ Happy 545</h1>
            <p style={{ fontSize: 11, color: 'rgba(232,230,240,0.4)', margin: 0 }}>ບັນທຶກ · ລຶບ · ວິເຄາະເລກທ້າຍ (pos5)</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <StatCard icon="calendar_month" title="ທັງໝົດງວດ"          value={`${totalDraws} ງວດ`}  accent="#d4af37" />
        <StatCard icon="emoji_events"   title="ເລກທ້າຍຈ່ອຍສຸດ"    value={topNumber ? `${topNumber.label} (${topNumber.count}×)` : '—'} sub={topNumber ? `${topNumber.percentage}%` : ''} accent="#f59e0b" />
        <StatCard icon="block"          title="ຍັງບໍ່ເຄີຍອອກ"      value={`${neverOut} ເລກ`}    accent="#6366f1" />
      </div>

      {/* Add draw form */}
      <div style={CARD_STYLE}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(212,175,55,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#d4af37' }}>add_circle</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#E8E6F0' }}>ເພີ່ມຜົນເລກໃໝ່</span>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
            {/* Date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(232,230,240,0.45)' }}>ວັນທີງວດ</label>
              <input
                type="date"
                value={form.draw_date}
                onChange={e => setForm(f => ({ ...f, draw_date: e.target.value }))}
                required
                style={{
                  background: '#0b0e1a', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, padding: '8px 12px', fontSize: 14,
                  color: '#E8E6F0', outline: 'none', colorScheme: 'dark',
                }}
              />
            </div>

            {/* pos1–pos5 */}
            {['pos1','pos2','pos3','pos4','pos5'].map((p, i) => (
              <NumSelect
                key={p}
                label={i < 4 ? `ຕຳແໜ່ງ ${i + 1}` : 'ເລກທ້າຍ ★'}
                value={form[p]}
                onChange={v => setForm(f => ({ ...f, [p]: v }))}
                numbers={numbers}
              />
            ))}

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: submitting ? 'rgba(212,175,55,0.3)' : 'linear-gradient(135deg, #d4af37, #b8860b)',
                border: 'none', borderRadius: 10, padding: '9px 22px',
                fontSize: 13, fontWeight: 700, color: '#060812',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.18s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>save</span>
              {submitting ? 'ກຳລັງບັນທຶກ…' : 'ບັນທຶກ'}
            </button>
          </div>
        </form>
      </div>

      {/* Bar chart */}
      <div style={CARD_STYLE}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#E8E6F0', margin: 0 }}>ຄວາມຖີ່ເລກທ້າຍ (pos5)</p>
          <p style={{ fontSize: 11, color: 'rgba(212,175,55,0.5)', margin: '2px 0 0' }}>ລຽງຈາກຫຼາຍ → ໜ້ອຍ · ທອງ = Top 5</p>
        </div>
        <div style={{ padding: '16px 8px 8px' }}>
          {loading ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(212,175,55,0.2)', borderTopColor: '#d4af37', animation: 'spin 0.9s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats} margin={{ top: 4, right: 12, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'rgba(232,230,240,0.4)' }} interval={0} angle={-45} textAnchor="end" height={44} />
                <YAxis tick={{ fontSize: 9, fill: 'rgba(232,230,240,0.4)' }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(212,175,55,0.06)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats.map((_, idx) => (
                    <Cell key={idx} fill={getBarColor(idx)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Stats table */}
      <div style={CARD_STYLE}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#E8E6F0', margin: 0 }}>ຕາຕະລາງສະຖິຕິ pos5</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['#', 'ເລກ', 'ຄັ້ງ', '%', 'ລ່າສຸດ', 'Gap (ວັນ)'].map(h => (
                  <th key={h} style={{ ...TH_STYLE, textAlign: h === '#' || h === 'ເລກ' ? 'left' : 'right' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((row, idx) => (
                <tr key={row.number} style={{ transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...TD_STYLE, color: 'rgba(232,230,240,0.3)', width: 36 }}>
                    {idx < 3
                      ? <span style={{ width: 20, height: 20, borderRadius: '50%', background: TOP_COLORS[idx] + '22', color: TOP_COLORS[idx], fontSize: 10, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{idx + 1}</span>
                      : <span style={{ color: 'rgba(232,230,240,0.25)', fontSize: 12 }}>{idx + 1}</span>}
                  </td>
                  <td style={TD_STYLE}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 34, height: 34, borderRadius: 8, fontSize: 13, fontWeight: 800,
                      background: idx < 5 ? TOP_COLORS[idx] + '18' : 'rgba(255,255,255,0.04)',
                      color: idx < 5 ? TOP_COLORS[idx] : 'rgba(232,230,240,0.5)',
                      border: idx < 5 ? `1px solid ${TOP_COLORS[idx]}40` : '1px solid rgba(255,255,255,0.06)',
                    }}>{row.label}</span>
                  </td>
                  <td style={{ ...TD_STYLE, textAlign: 'right', fontWeight: 700, color: idx < 5 ? TOP_COLORS[idx] : '#E8E6F0', fontVariantNumeric: 'tabular-nums' }}>{row.count}</td>
                  <td style={{ ...TD_STYLE, textAlign: 'right', color: 'rgba(232,230,240,0.4)', fontVariantNumeric: 'tabular-nums' }}>{row.percentage}%</td>
                  <td style={{ ...TD_STYLE, textAlign: 'right', color: 'rgba(232,230,240,0.4)', fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>
                    {row.last_seen_date ?? <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>}
                  </td>
                  <td style={{ ...TD_STYLE, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {row.gap != null
                      ? <span style={{ color: row.gap <= 7 ? '#4ade80' : row.gap >= 30 ? '#f87171' : 'rgba(232,230,240,0.5)', fontWeight: row.gap <= 7 ? 700 : 400 }}>{row.gap}</span>
                      : <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Draw history + delete */}
      <div style={CARD_STYLE}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(212,175,55,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#E8E6F0', margin: 0 }}>ປະຫວັດຜົນເລກທັງໝົດ</p>
          <span style={{ fontSize: 11, color: 'rgba(212,175,55,0.5)' }}>{totalDraws} ງວດ</span>
        </div>
        {draws.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(232,230,240,0.3)', fontSize: 13 }}>
            ຍັງບໍ່ມີຂໍ້ມູນ — ເພີ່ມຜົນເລກຂ້າງເທິງ
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['ວັນທີ', 'P1', 'P2', 'P3', 'P4', 'P5 (ທ້າຍ)', ''].map((h, i) => (
                    <th key={i} style={{ ...TH_STYLE, textAlign: i === 0 ? 'left' : 'center' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {draws.map(d => (
                  <tr key={d.id}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    style={{ transition: 'background 0.15s' }}
                  >
                    <td style={{ ...TD_STYLE, fontWeight: 600, color: '#E8E6F0' }}>{d.draw_date}</td>
                    {[d.pos1, d.pos2, d.pos3, d.pos4].map((p, i) => (
                      <td key={i} style={{ ...TD_STYLE, textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 8, background: 'rgba(59,130,246,0.15)', color: '#60a5fa', fontSize: 13, fontWeight: 700, border: '1px solid rgba(59,130,246,0.2)' }}>
                          {String(p).padStart(2, '0')}
                        </span>
                      </td>
                    ))}
                    <td style={{ ...TD_STYLE, textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 8, background: 'rgba(212,175,55,0.18)', color: '#d4af37', fontSize: 13, fontWeight: 800, border: '1px solid rgba(212,175,55,0.3)', boxShadow: '0 0 10px rgba(212,175,55,0.15)' }}>
                        {String(d.pos5).padStart(2, '0')}
                      </span>
                    </td>
                    <td style={{ ...TD_STYLE, textAlign: 'center', width: 48 }}>
                      <button
                        onClick={() => handleDelete(d.id, d.draw_date)}
                        disabled={deleting === d.id}
                        style={{
                          width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)',
                          background: 'rgba(239,68,68,0.08)', color: deleting === d.id ? 'rgba(239,68,68,0.3)' : '#f87171',
                          cursor: deleting === d.id ? 'not-allowed' : 'pointer',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { if (deleting !== d.id) { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)' } }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)' }}
                        title="ລຶບ"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span>
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
