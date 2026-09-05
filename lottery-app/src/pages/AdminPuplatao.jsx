import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import toast from 'react-hot-toast'
import { API as API_BASE } from '../utils/api'
import Pagination from '../components/Pagination'
import AiSummaryCard from '../components/AiSummaryCard'

const API = `${API_BASE}/puplatao.php`

// ── colour by symbol_id 1–6 ──────────────────────────────────────
const SYM_COLOR = { 1: '#22c55e', 2: '#f97316', 3: '#3b82f6', 4: '#ec4899', 5: '#eab308', 6: '#ef4444' }

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{ background: '#141830', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: '#f97316', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{d.emoji} {d.name_lo}</p>
      <p style={{ color: '#E8E6F0', margin: '2px 0' }}>ອອກ: <b>{d.total_hits}</b> ຄັ້ງ</p>
      <p style={{ color: '#E8E6F0', margin: '2px 0' }}>ສ່ວນຮ້ອຍ: <b>{d.pct_of_all}%</b></p>
      <p style={{ color: '#9ca3af', margin: '2px 0' }}>ອອກ {d.draws_appeared} ງວດ ({d.pct_of_draws}%)</p>
    </div>
  )
}

function StatCard({ icon, title, value, sub, accent = '#f97316' }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0c1020 0%, #10152a 100%)',
      border: '1px solid rgba(249,115,22,0.12)',
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

function SymSelect({ label, value, onChange, symbols }) {
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
          color: '#E8E6F0', outline: 'none', minWidth: 130, cursor: 'pointer',
        }}
      >
        <option value="">—</option>
        {symbols.map(s => (
          <option key={s.symbol_id} value={s.symbol_id}>{s.emoji} {s.name_lo}</option>
        ))}
      </select>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
export default function AdminPuplatao() {
  const [symbols, setSymbols] = useState([])
  const [draws, setDraws]     = useState([])
  const [freq, setFreq]       = useState([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({ draw_no: '', draw_at: '', pos1: '', pos2: '', pos3: '' })
  const [autoNo, setAutoNo]         = useState(true)   // ລັນເລກງວດອັດຕະໂນມັດ
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting]     = useState(null)

  const [drawPage, setDrawPage]         = useState(1)
  const [drawPageSize, setDrawPageSize] = useState(10)

  const symById = {}
  symbols.forEach(s => { symById[s.symbol_id] = s })

  // ເລກງວດຕໍ່ໄປ = ເລກງວດຫຼ້າສຸດ + 1 (draws ລຽງ DESC ຢູ່ແລ້ວ)
  const nextDrawNo = draws.length
    ? Math.max(...draws.map(d => d.draw_no)) + 1
    : 36260001

  // ຖ້າຢູ່ໂໝດອັດຕະໂນມັດ → sync ຊ່ອງເລກງວດໃຫ້ເປັນເລກຕໍ່ໄປສະເໝີ
  useEffect(() => {
    if (autoNo) setForm(f => (f.draw_no === String(nextDrawNo) ? f : { ...f, draw_no: String(nextDrawNo) }))
  }, [autoNo, nextDrawNo])

  const fetchAll = useCallback(async () => {
    const [rS, rD, rF] = await Promise.all([
      fetch(`${API}?r=symbols`),
      fetch(`${API}?r=draws`),
      fetch(`${API}?r=stats/frequency`),
    ])
    if (rS.ok) setSymbols(await rS.json())
    if (rD.ok) setDraws(await rD.json())
    if (rF.ok) setFreq(await rF.json())
    setLoading(false)
  }, [])

  const refresh = useCallback(async () => {
    const [rD, rF] = await Promise.all([
      fetch(`${API}?r=draws`),
      fetch(`${API}?r=stats/frequency`),
    ])
    if (rD.ok) setDraws(await rD.json())
    if (rF.ok) setFreq(await rF.json())
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!autoNo && !form.draw_no) { toast.error('ກະລຸນາໃສ່ເລກງວດ'); return }
    if (!form.draw_at) { toast.error('ກະລຸນາເລືອກວັນ-ເວລາ'); return }
    for (const p of ['pos1', 'pos2', 'pos3']) {
      if (!form[p]) { toast.error(`ກະລຸນາເລືອກ ${p}`); return }
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${API}?r=draws`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draw_no: autoNo ? 'auto' : +form.draw_no,
          draw_at: form.draw_at.replace('T', ' '),
          pos1: +form.pos1, pos2: +form.pos2, pos3: +form.pos3,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`ບັນທຶກງວດ ${data.draw_no} ສຳເລັດ`)
        // ບິນເດີມພັນ demo ຂອງງວດນີ້ຖືກຄິດຜົນອັດຕະໂນມັດຢູ່ຝັ່ງ server
        const settled = data.bets_settled
        if (settled && (settled.settled > 0 || settled.voided > 0)) {
          toast.success(
            `ຄິດຜົນເດີມພັນ ${settled.settled} ບິນ · ຖືກ ${settled.won} · ຈ່າຍ ${Number(settled.paid).toLocaleString('en-US')} ກີບ`
              + (settled.voided > 0 ? ` · ຍົກເລີກ ${settled.voided}` : ''),
            { duration: 6000 },
          )
        }
        setForm({ draw_no: '', draw_at: '', pos1: '', pos2: '', pos3: '' })
        setAutoNo(true)
        setDrawPage(1)
        await refresh()
      } else {
        toast.error(data.error || 'ເກີດຂໍ້ຜິດພາດ')
      }
    } catch {
      toast.error('ເຊື່ອມຕໍ່ server ບໍ່ໄດ້')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(drawNo, at) {
    if (!confirm(`ລຶບຜົນງວດ ${drawNo} (${at})?`)) return
    setDeleting(drawNo)
    try {
      const res = await fetch(`${API}?r=draws&action=delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draw_no: drawNo }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('ລຶບສຳເລັດ')
        setDrawPage(p => {
          const maxPage = Math.max(1, Math.ceil((draws.length - 1) / drawPageSize))
          return Math.min(p, maxPage)
        })
        await refresh()
      } else {
        toast.error(data.error || 'ລຶບບໍ່ສຳເລັດ')
      }
    } finally {
      setDeleting(null)
    }
  }

  const totalDraws = draws.length
  const topSym     = freq[0]
  const coldSym    = freq[freq.length - 1]

  const paginatedDraws = draws.slice((drawPage - 1) * drawPageSize, drawPage * drawPageSize)

  const CARD_STYLE = {
    background: 'linear-gradient(135deg, #0c1020 0%, #10152a 100%)',
    border: '1px solid rgba(249,115,22,0.12)',
    borderRadius: 16, overflow: 'hidden',
  }
  const TH_STYLE = {
    padding: '10px 14px', fontSize: 9, fontWeight: 800,
    letterSpacing: '0.14em', textTransform: 'uppercase',
    color: 'rgba(249,115,22,0.5)', textAlign: 'left',
    background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(249,115,22,0.08)',
  }
  const TD_STYLE = { padding: '10px 14px', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.04)' }

  function SymCell({ id }) {
    const s = symById[id]
    const c = SYM_COLOR[id] || '#64748b'
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 8, fontSize: 13, fontWeight: 700,
        background: c + '18', color: c, border: `1px solid ${c}33`,
      }}>
        <span style={{ fontSize: 15 }}>{s?.emoji}</span> {s?.name_lo}
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: "'Noto Sans Lao Looped', sans-serif" }}>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#f97316', fontVariationSettings: "'FILL' 1" }}>casino</span>
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#E8E6F0', margin: 0 }}>ຈັດການ ຫວຍປູປາເຕົ້າ</h1>
            <p style={{ fontSize: 11, color: 'rgba(232,230,240,0.4)', margin: 0 }}>ບັນທຶກ · ລຶບ · ວິເຄາະຄວາມຖີ່ລູກ 6 ໜ່ວຍ</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <StatCard icon="calendar_month" title="ທັງໝົດງວດ" value={`${totalDraws} ງວດ`} accent="#f97316" />
        <StatCard icon="local_fire_department" title="ລູກອອກຫຼາຍສຸດ" value={topSym ? `${topSym.emoji} ${topSym.name_lo}` : '—'} sub={topSym ? `${topSym.total_hits}× · ${topSym.pct_of_all}%` : ''} accent="#ef4444" />
        <StatCard icon="ac_unit" title="ລູກອອກໜ້ອຍສຸດ" value={coldSym ? `${coldSym.emoji} ${coldSym.name_lo}` : '—'} sub={coldSym ? `${coldSym.total_hits}× · ${coldSym.pct_of_all}%` : ''} accent="#3b82f6" />
      </div>

      {/* Add draw form */}
      <div style={CARD_STYLE}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(249,115,22,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#f97316' }}>add_circle</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#E8E6F0' }}>ເພີ່ມຜົນງວດໃໝ່</span>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(232,230,240,0.45)', display: 'flex', alignItems: 'center', gap: 6 }}>
                ເລກງວດ
                <span style={{
                  fontSize: 8, fontWeight: 800, letterSpacing: '0.08em', padding: '1px 5px', borderRadius: 5,
                  background: autoNo ? 'rgba(34,197,94,0.15)' : 'rgba(232,230,240,0.1)',
                  color: autoNo ? '#4ade80' : 'rgba(232,230,240,0.4)',
                }}>
                  {autoNo ? 'ອັດຕະໂນມັດ' : 'ໃສ່ເອງ'}
                </span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  value={form.draw_no}
                  onChange={e => { setAutoNo(false); setForm(f => ({ ...f, draw_no: e.target.value })) }}
                  required
                  placeholder={String(nextDrawNo)}
                  style={{
                    background: '#0b0e1a', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10, padding: '8px 12px', fontSize: 14,
                    color: autoNo ? 'rgba(232,230,240,0.55)' : '#E8E6F0', outline: 'none', width: 140,
                  }}
                />
                {!autoNo && (
                  <button
                    type="button"
                    onClick={() => setAutoNo(true)}
                    title="ກັບໄປໃຊ້ເລກງວດອັດຕະໂນມັດ"
                    style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      border: '1px solid rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.1)',
                      color: '#4ade80', cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>autorenew</span>
                  </button>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(232,230,240,0.45)' }}>ວັນ-ເວລາງວດ</label>
              <input
                type="datetime-local"
                value={form.draw_at}
                onChange={e => setForm(f => ({ ...f, draw_at: e.target.value }))}
                required
                style={{
                  background: '#0b0e1a', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, padding: '8px 12px', fontSize: 14,
                  color: '#E8E6F0', outline: 'none', colorScheme: 'dark',
                }}
              />
            </div>

            {['pos1', 'pos2', 'pos3'].map((p, i) => (
              <SymSelect
                key={p}
                label={`ໜ່ວຍ ${i + 1}`}
                value={form[p]}
                onChange={v => setForm(f => ({ ...f, [p]: v }))}
                symbols={symbols}
              />
            ))}

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: submitting ? 'rgba(249,115,22,0.3)' : 'linear-gradient(135deg, #f97316, #ef4444)',
                border: 'none', borderRadius: 10, padding: '9px 22px',
                fontSize: 13, fontWeight: 700, color: '#fff',
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
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(249,115,22,0.08)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#E8E6F0', margin: 0 }}>ຄວາມຖີ່ລູກ (ລວມທຸກຕຳແໜ່ງ)</p>
          <p style={{ fontSize: 11, color: 'rgba(249,115,22,0.55)', margin: '2px 0 0' }}>ລຽງຈາກຫຼາຍ → ໜ້ອຍ</p>
        </div>
        <div style={{ padding: '16px 8px 8px' }}>
          {loading ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(249,115,22,0.2)', borderTopColor: '#f97316', animation: 'spin 0.9s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={freq} margin={{ top: 4, right: 12, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name_lo" tick={{ fontSize: 11, fill: 'rgba(232,230,240,0.5)' }} interval={0} />
                <YAxis tick={{ fontSize: 9, fill: 'rgba(232,230,240,0.4)' }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(249,115,22,0.06)' }} />
                <Bar dataKey="total_hits" radius={[4, 4, 0, 0]}>
                  {freq.map(f => (
                    <Cell key={f.symbol_id} fill={SYM_COLOR[f.symbol_id] || '#1e2a4a'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* AI analysis */}
      {!loading && freq.length > 0 && (
        <AiSummaryCard
          context="puplatao"
          title="AI ວິເຄາະ ຫວຍປູປາເຕົ້າ"
          hint="ໃຫ້ Claude AI ອ່ານຄວາມຖີ່ລູກ 6 ໜ່ວຍ ແລ້ວສະຫຼຸບພາບລວມເປັນພາສາລາວ"
          payload={{
            totalDraws: draws.length,
            frequency: freq.map(f => ({
              name_lo: f.name_lo, total_hits: f.total_hits,
              pct_of_all: f.pct_of_all, draws_appeared: f.draws_appeared,
            })),
          }}
        />
      )}

      {/* Draw history + delete */}
      <div style={CARD_STYLE}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(249,115,22,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#E8E6F0', margin: 0 }}>ປະຫວັດຜົນງວດທັງໝົດ</p>
          <span style={{ fontSize: 11, color: 'rgba(249,115,22,0.55)' }}>{totalDraws} ງວດ</span>
        </div>
        {draws.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(232,230,240,0.3)', fontSize: 13 }}>
            ຍັງບໍ່ມີຂໍ້ມູນ — ເພີ່ມຜົນງວດຂ້າງເທິງ
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['#', 'ງວດ', 'ວັນ-ເວລາ', 'ໜ່ວຍ 1', 'ໜ່ວຍ 2', 'ໜ່ວຍ 3', ''].map((h, i) => (
                      <th key={i} style={{ ...TH_STYLE, textAlign: i <= 2 ? 'left' : 'center' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedDraws.map((d, idx) => {
                    const rowNo = (drawPage - 1) * drawPageSize + idx + 1
                    return (
                      <tr key={d.draw_no}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        style={{ transition: 'background 0.15s' }}
                      >
                        <td style={{ ...TD_STYLE, color: 'rgba(232,230,240,0.25)', fontSize: 11, width: 36 }}>{rowNo}</td>
                        <td style={{ ...TD_STYLE, fontWeight: 700, color: '#E8E6F0', fontVariantNumeric: 'tabular-nums' }}>{d.draw_no}</td>
                        <td style={{ ...TD_STYLE, color: 'rgba(232,230,240,0.6)', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{d.draw_at?.slice(0, 16)}</td>
                        {[d.pos1, d.pos2, d.pos3].map((p, i) => (
                          <td key={i} style={{ ...TD_STYLE, textAlign: 'center' }}><SymCell id={p} /></td>
                        ))}
                        <td style={{ ...TD_STYLE, textAlign: 'center', width: 48 }}>
                          <button
                            onClick={() => handleDelete(d.draw_no, d.draw_at?.slice(0, 16))}
                            disabled={deleting === d.draw_no}
                            style={{
                              width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)',
                              background: 'rgba(239,68,68,0.08)', color: deleting === d.draw_no ? 'rgba(239,68,68,0.3)' : '#f87171',
                              cursor: deleting === d.draw_no ? 'not-allowed' : 'pointer',
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { if (deleting !== d.draw_no) { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)' } }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)' }}
                            title="ລຶບ"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              total={draws.length}
              page={drawPage}
              pageSize={drawPageSize}
              onPageChange={setDrawPage}
              onPageSizeChange={v => { setDrawPageSize(v); setDrawPage(1) }}
            />
          </>
        )}
      </div>
    </div>
  )
}
