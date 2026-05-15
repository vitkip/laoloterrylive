import { useState } from 'react'
import { useStatistics } from '../hooks/useStatistics'
import { useData } from '../context/DataContext'
import HotNumbers from '../components/HotNumbers'
import ColdNumbers from '../components/ColdNumbers'
import DigitDistribution from '../components/DigitDistribution'
import HistoricalVolatility from '../components/HistoricalVolatility'
import AnimalStats from '../components/AnimalStats'
import CustomFrequency from '../components/CustomFrequency'
import WeekdayStats from '../components/WeekdayStats'
import PairingStats from '../components/PairingStats'
import ConsecutivePairs from '../components/ConsecutivePairs'
import TrendMomentum from '../components/TrendMomentum'
import GapAnalysis from '../components/GapAnalysis'
import RepeatPattern from '../components/RepeatPattern'

const TIMEFRAMES = [
  { value: '1_month',  label: '1 ເດືອນ',  icon: 'calendar_view_month' },
  { value: '3_months', label: '3 ເດືອນ',  icon: 'date_range' },
  { value: '1_year',   label: '1 ປີ',      icon: 'calendar_today' },
  { value: 'all',      label: 'ທັງໝົດ',    icon: 'all_inclusive' },
]

function SectionLabel({ icon, label, accent = '#003fb1' }) {
  return (
    <div className="flex items-center gap-2.5 mb-6">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: `${accent}18` }}
      >
        <span className="material-symbols-outlined text-[18px]" style={{ color: accent }}>{icon}</span>
      </div>
      <h2 className="text-base font-extrabold text-foreground uppercase tracking-widest text-[11px]">
        {label}
      </h2>
      <div className="flex-1 h-px bg-gradient-to-r from-[#e8edf8] to-transparent dark:from-[#2b3a54]" />
    </div>
  )
}

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const { draws, types } = useData()
  const { stats } = useStatistics(timeframe, selectedType)

  // Count draws per type for context
  const drawsForType = selectedType === 'all'
    ? draws
    : draws?.filter(d => String(d.type_id) === String(selectedType))

  const totalDraws = drawsForType?.length ?? 0
  const hotTop = stats?.hotNumbers?.[0]
  const coldTop = stats?.coldNumbers?.[0]

  // Active type color
  const activeType = types?.find(t => String(t.type_id) === String(selectedType))
  const typeColor = activeType?.color || '#003fb1'

  return (
    <div className="space-y-14">

      {/* ─── Hero Header ─── */}
      <div className="relative rounded-3xl overflow-hidden">
        <div className="absolute inset-0" style={{
          background: selectedType === 'all'
            ? 'linear-gradient(135deg, #001d6e, #003fb1, #4f46e5)'
            : `linear-gradient(135deg, #001d6e, ${typeColor})`
        }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(108,248,187,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.3),transparent_55%)]" />
        <div className="absolute right-0 bottom-0 text-[9rem] sm:text-[13rem] font-black text-white/[0.04] leading-none select-none pointer-events-none pr-4 pb-1">
          STATS
        </div>

        <div className="relative z-10 px-8 sm:px-12 py-10 sm:py-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3.5 py-1 mb-5">
              <span className="material-symbols-outlined text-[#6cf8bb] text-[14px]">analytics</span>
              <span className="text-white/90 text-[11px] font-bold uppercase tracking-widest">Analytics Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-3">
              ວິເຄາະ<span className="text-[#b5c4ff] ml-2">ສະຖິຕິ</span>
            </h1>
            <p className="text-white/60 text-sm max-w-lg leading-relaxed">
              ບົດວິເຄາະຄວາມຖີ່ ແລະ ແນວໂນ້ມຕົວເລກຫວຍລາວ ຈາກຖານຂໍ້ມູນ {totalDraws} ງວດ
              {activeType && <span className="ml-1 font-bold text-white/80">({activeType.type_name})</span>}
            </p>
          </div>

          {/* Summary KPI row */}
          <div className="flex gap-3 flex-wrap lg:flex-nowrap shrink-0">
            {[
              { label: 'ງວດທັງໝົດ', value: totalDraws, sub: 'draws', color: '#b5c4ff' },
              { label: 'ເລກ Hot', value: hotTop?.number ?? '-', sub: `${hotTop?.count ?? 0} ຄັ້ງ`, color: '#6cf8bb' },
              { label: 'ເລກ Cold', value: coldTop?.number ?? '-', sub: `${coldTop?.missedRounds ?? 0} ງວດ`, color: '#fbbf24' },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3.5 text-center min-w-[90px]">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: `${color}99` }}>{label}</p>
                <p className="text-2xl font-black text-white leading-none">{value}</p>
                <p className="text-[10px] mt-1" style={{ color: `${color}80` }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Filters Row ─── */}
      <div className="space-y-4">
        {/* Type selector */}
        {types && types.length > 1 && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#003fb1] to-[#4f46e5]" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-1">ປະເພດຫວຍ</p>
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                selectedType === 'all'
                  ? 'bg-[#003fb1] text-white border-[#003fb1] shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:border-[#003fb1]/50'
              }`}
            >
              ທັງໝົດ ({draws?.length ?? 0})
            </button>
            {types.filter(t => t.is_active != 0).map(t => {
              const color = t.color || '#003fb1'
              const active = String(selectedType) === String(t.type_id)
              const cnt = draws?.filter(d => String(d.type_id) === String(t.type_id)).length ?? 0
              return (
                <button
                  key={t.type_id}
                  onClick={() => setSelectedType(String(t.type_id))}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all"
                  style={active
                    ? { background: color, color: '#fff', borderColor: color, boxShadow: `0 2px 8px ${color}40` }
                    : { background: 'transparent', color, borderColor: `${color}50` }
                  }
                >
                  {t.type_name} ({cnt})
                </button>
              )
            })}
          </div>
        )}

        {/* Timeframe picker */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#003fb1] to-[#4f46e5]" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[10px]">
              ຊ່ວງເວລາ
            </p>
          </div>
          <div className="flex items-center gap-1 bg-accent p-1.5 rounded-2xl border border-border">
            {TIMEFRAMES.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setTimeframe(value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all duration-200
                  ${timeframe === value
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-primary'
                  }`}
              >
                <span className="material-symbols-outlined text-[14px]">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Empty state when no data for type ─── */}
      {!stats && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-card rounded-3xl border border-border">
          <span className="material-symbols-outlined text-5xl text-muted-foreground/40">bar_chart</span>
          <p className="text-base font-bold text-muted-foreground">ຍັງບໍ່ມີຂໍ້ມູນສຳລັບປະເພດ / ຊ່ວງເວລານີ້</p>
          <button
            onClick={() => { setSelectedType('all'); setTimeframe('all') }}
            className="px-4 py-2 rounded-xl bg-[#eff3ff] dark:bg-[#1e2d4a] text-primary text-sm font-bold"
          >ເບິ່ງທັງໝົດ</button>
        </div>
      )}

      {/* ─── Analytics Sections (only shown when stats available) ─── */}
      {stats && <>
        {/* ─── Section 1: Hot & Cold ─── */}
        <div>
          <SectionLabel icon="local_fire_department" label="ເລກຮ້ອນ & ເລກດັບ" accent="#c2410c" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <HotNumbers timeframe={timeframe} typeId={selectedType} />
            <ColdNumbers timeframe={timeframe} typeId={selectedType} />
          </div>
        </div>

        {/* ─── Section 2: Distribution Charts ─── */}
        <div>
          <SectionLabel icon="bar_chart" label="ການກະຈາຍຕົວເລກ" accent="#0369a1" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-sm">
              <DigitDistribution timeframe={timeframe} typeId={selectedType} />
            </div>
            <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-sm">
              <HistoricalVolatility timeframe={timeframe} typeId={selectedType} />
            </div>
          </div>
        </div>

        {/* ─── Section 3: Animal Stats ─── */}
        <div>
          <SectionLabel icon="pets" label="ສະຖິຕິນາມສັດ" accent="#006c49" />
          <AnimalStats timeframe={timeframe} typeId={selectedType} />
        </div>

        {/* ─── Section 4: Advanced Analytics ─── */}
        <div>
          <SectionLabel icon="insights" label="ການວິເຄາະຂັ້ນສູງ" accent="#7c3aed" />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
            <WeekdayStats timeframe={timeframe} typeId={selectedType} />
            <PairingStats timeframe={timeframe} typeId={selectedType} />
          </div>
          <ConsecutivePairs timeframe={timeframe} typeId={selectedType} />
        </div>

        {/* ─── Section 5: Trend Intelligence ─── */}
        <div>
          <SectionLabel icon="trending_up" label="Trend Intelligence" accent="#006c49" />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
            <TrendMomentum timeframe={timeframe} typeId={selectedType} />
            <GapAnalysis timeframe={timeframe} typeId={selectedType} />
          </div>
          <RepeatPattern timeframe={timeframe} typeId={selectedType} />
        </div>

        {/* ─── Section 6: Frequency ─── */}
        <div>
          <SectionLabel icon="format_list_numbered" label="ຄວາມຖີ່ທຸກຕົວເລກ" accent="#0891b2" />
          <CustomFrequency timeframe={timeframe} typeId={selectedType} />
        </div>
      </>}

    </div>
  )
}

