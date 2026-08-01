import { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import { buildPredictionSets, computeEnhancedPrediction, LDATE } from '../utils/analytics'
import SEO from '../components/SEO'
import AiExplainPredictionCard from '../components/AiExplainPredictionCard'
import { webPageSchema, breadcrumbSchema } from '../components/schemas'

const RANGE_OPTIONS = [
  { value: '10',  label: '10' },
  { value: '30',  label: '30' },
  { value: '50',  label: '50' },
  { value: '100', label: '100' },
  { value: 'all', label: 'ທັງໝົດ' },
]

// ─────────────────────────────────────────────────────────────────────────────
// DUPLICATE DETECTION — numbers appearing in more than one set get flagged
// ─────────────────────────────────────────────────────────────────────────────

function countAcrossSets(setList) {
  const counts = {}
  setList.forEach(s => {
    s.numbers.forEach(num => {
      counts[num] = (counts[num] || 0) + 1
    })
  })
  return counts
}

// ─────────────────────────────────────────────────────────────────────────────
// SET CARD — one analysis method → up to 5 numbers + Lao explanation
// ─────────────────────────────────────────────────────────────────────────────

function SetCard({ index, title, icon, color, numbers, reason, digitLen, dupeCounts }) {
  return (
    <div className="bg-zinc-950/95 backdrop-blur-2xl rounded-2xl p-5 border border-white/[0.09] shadow-xl shadow-black/40 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: color + '22', border: `1px solid ${color}44` }}>
          <span className="material-symbols-outlined text-[20px]" style={{ color }}>{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: color + 'aa' }}>ຊຸດທີ {index}</p>
          <h3 className="font-black text-white text-sm leading-tight truncate">{title}</h3>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {numbers.length === 0 && (
          <span className="text-xs text-white/30">ຂໍ້ມູນບໍ່ພໍສຳລັບຊຸດນີ້</span>
        )}
        {numbers.map(num => {
          const hitCount = dupeCounts?.[num] ?? 0
          const isDupe = hitCount > 1
          return (
            <span key={num}
              className={`font-black font-mono text-white flex items-center justify-center rounded-xl border relative
                ${digitLen === 3 ? 'text-lg px-3.5 py-2' : 'text-xl px-4 py-2'}
                ${isDupe ? 'ring-2 ring-red-500 shadow-[0_0_14px_rgba(239,68,68,0.55)]' : ''}`}
              style={isDupe
                ? { background: 'rgba(239,68,68,0.22)', borderColor: '#ef4444' }
                : { background: color + '1a', borderColor: color + '40' }}>
              {num}
              {isDupe && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-[9px] flex items-center justify-center font-black text-white shadow">
                  {hitCount}
                </span>
              )}
            </span>
          )
        })}
      </div>

      <p className="text-[11px] text-white/45 leading-relaxed">{reason}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function PredictionSummaryPage() {
  const { draws, types, loading } = useData()
  const [range, setRange] = useState('50')
  const [selectedType, setSelectedType] = useState('all')

  const filteredDraws = useMemo(() => (
    selectedType === 'all' ? draws : draws?.filter(d => String(d.type_id) === selectedType)
  ), [draws, selectedType])

  const sets = useMemo(() => buildPredictionSets(filteredDraws, range), [filteredDraws, range])
  const enhanced = useMemo(() => computeEnhancedPrediction(filteredDraws, range), [filteredDraws, range])
  const latestDraw = filteredDraws?.[0] ?? null

  const threeDigitDupes = useMemo(() => sets ? countAcrossSets(sets.threeDigitSets) : {}, [sets])
  const twoDigitDupes   = useMemo(() => sets ? countAcrossSets(sets.twoDigitSets)   : {}, [sets])

  return (
    <div className="space-y-6 pb-16">
      <SEO
        title="ເລກໜ້າຈະອອກໃນງວດນີ້ — AI Analytics"
        description="ລວມຜົນການວິເຄາະທຸກ engine (ຄວາມຖີ່ · ຊ້ານານ · Momentum · AI Composite · 8-Signal) ເປັນເລກ 3 ຕົວ 5 ຊຸດ ແລະ ເລກ 2 ຕົວ 5 ຊຸດ ພ້ອມຄຳອະທິບາຍ"
        url="/prediction"
        jsonLd={[
          webPageSchema(
            'ເລກໜ້າຈະອອກໃນງວດນີ້ | AI Analytics',
            'https://laolots.com/prediction',
            'ສະຫຼຸບເລກເດັ່ນຈາກທຸກ engine ວິເຄາະ ຫວຍລາວ',
          ),
          breadcrumbSchema([
            { name: 'ໜ້າຫຼັກ', url: 'https://laolots.com/' },
            { name: 'ເລກໜ້າຈະອອກ', url: 'https://laolots.com/prediction' },
          ]),
        ]}
      />

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">ເລກໜ້າຈະອອກໃນງວດນີ້</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ລວມຍອດຈາກທຸກ engine ວິເຄາະ — ເລກ 3 ຕົວ 5 ຊຸດ ແລະ ເລກ 2 ຕົວ 5 ຊຸດ ພ້ອມຄຳອະທິບາຍວ່າເປັນຫຍັງຄວນເບິ່ງເລກເຫຼົ່ານີ້
        </p>
      </div>

      {/* ── Disclaimer ── */}
      <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/25 rounded-xl px-4 py-2.5 text-xs text-[#fbbf24] flex items-start gap-2">
        <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0">warning</span>
        ຂໍ້ມູນນີ້ອ້າງອີງຈາກສະຖິຕິຍ້ອນຫຼັງເທົ່ານັ້ນ — ຫວຍລາວເປັນການສຸ່ມ ບໍ່ຮັບປະກັນຜົນລາງວັນ ຫ້າມລົງທຶນເກີນຄວາມສາມາດ
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-wrap items-center gap-3">
        {types && types.length > 1 && (
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                ${selectedType === 'all' ? 'bg-[#818cf8] text-white' : 'bg-white/[0.06] text-white/50 hover:text-white'}`}>
              ທັງໝົດ
            </button>
            {types.filter(t => t.is_active != 0).map(t => (
              <button
                key={t.type_id}
                onClick={() => setSelectedType(String(t.type_id))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                  ${selectedType === String(t.type_id) ? 'bg-[#818cf8] text-white' : 'bg-white/[0.06] text-white/50 hover:text-white'}`}>
                {t.type_name}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-1.5 flex-wrap ml-auto">
          <span className="text-xs text-white/40 self-center mr-1">ວິເຄາະຈາກ:</span>
          {RANGE_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => setRange(o.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                ${range === o.value ? 'bg-[#6366f1] text-white' : 'bg-white/[0.06] text-white/50 hover:text-white'}`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Context bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'ວິເຄາະຈາກ', val: sets?.n ?? 0, sub: 'ງວດ', c: '#6cf8bb' },
          { label: 'ງວດຫຼ້າສຸດ', val: latestDraw ? `#${latestDraw.draw_number}` : '—', sub: LDATE(latestDraw?.draw_date), c: '#818cf8' },
          { label: 'ວັນທີ', val: latestDraw ? latestDraw.draw_date?.slice(0, 10) : '—', sub: 'ຂໍ້ມູນລ່າສຸດ', c: '#22d3ee' },
        ].map(({ label, val, sub, c }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-700/60 rounded-2xl px-4 py-3 text-center shadow-sm">
            <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: c + 'cc' }}>{label}</p>
            <p className="text-lg sm:text-2xl font-black text-white font-mono">{val}</p>
            <p className="text-[9px] mt-0.5" style={{ color: c + '99' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── AI Insight ── */}
      {sets && enhanced?.top10?.length > 0 && (
        <AiExplainPredictionCard
          enhanced={enhanced}
          drawNum={latestDraw?.draw_number ?? '?'}
          dateStr={LDATE(latestDraw?.draw_date)}
          n={sets.n}
        />
      )}

      {loading && !sets && (
        <div className="text-center py-24">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-[#6366f1]/20 border-t-[#6366f1] animate-spin" />
        </div>
      )}

      {!loading && !sets && (
        <div className="text-center py-24">
          <span className="material-symbols-outlined text-6xl text-[#2b3a54] mb-3 block">database_off</span>
          <p className="text-white/50">ຂໍ້ມູນບໍ່ພໍສຳລັບການວິເຄາະ</p>
        </div>
      )}

      {sets && (
        <>
          {/* ── 3-digit section ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#a78bfa]">looks_3</span>
              <h2 className="font-black text-white text-lg">ເລກ 3 ຕົວ — 5 ຊຸດ</h2>
              <span className="text-xs text-white/30">(5 ໂຕ/ຊຸດ — ອິງ 000–999)</span>
              <span className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-red-400">
                <span className="w-2.5 h-2.5 rounded-full ring-2 ring-red-500 shrink-0" />
                ໄຮໄລສີແດງ = ເລກຊ້ຳຫຼາຍຊຸດ
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sets.threeDigitSets.map((s, i) => (
                <SetCard key={s.key} index={i + 1} digitLen={3} dupeCounts={threeDigitDupes} {...s} />
              ))}
            </div>
          </div>

          {/* ── 2-digit section ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#f472b6]">looks_two</span>
              <h2 className="font-black text-white text-lg">ເລກ 2 ຕົວ — 5 ຊຸດ</h2>
              <span className="text-xs text-white/30">(5 ໂຕ/ຊຸດ — ອິງ 00–99)</span>
              <span className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-red-400">
                <span className="w-2.5 h-2.5 rounded-full ring-2 ring-red-500 shrink-0" />
                ໄຮໄລສີແດງ = ເລກຊ້ຳຫຼາຍຊຸດ
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sets.twoDigitSets.map((s, i) => (
                <SetCard key={s.key} index={i + 1} digitLen={2} dupeCounts={twoDigitDupes} {...s} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
