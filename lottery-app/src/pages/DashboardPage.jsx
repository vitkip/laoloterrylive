import { useState, useRef, useEffect, useMemo } from 'react'
import { useStatistics } from '../hooks/useStatistics'
import { useData } from '../context/DataContext'
import SEO from '../components/SEO'
import { webPageSchema, faqSchema, breadcrumbSchema } from '../components/schemas'
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
  { value: '1_month',  label: '1 ເດືອນ', icon: 'calendar_view_month' },
  { value: '3_months', label: '3 ເດືອນ', icon: 'date_range' },
  { value: '1_year',   label: '1 ປີ',     icon: 'calendar_today' },
  { value: 'all',      label: 'ທັງໝົດ',   icon: 'all_inclusive' },
]

const BALL_DATA = [
  { n: '07', top: '12%', left: '6%',   size: 58, color: '#f59e0b', anim: 'db-float-a', delay: '0s' },
  { n: '42', top: '62%', left: '14%',  size: 44, color: '#60a5fa', anim: 'db-float-b', delay: '1.2s' },
  { n: '88', top: '20%', right: '8%',  size: 66, color: '#c084fc', anim: 'db-float-c', delay: '0.6s' },
  { n: '23', top: '68%', right: '12%', size: 50, color: '#4ade80', anim: 'db-float-a', delay: '2s' },
  { n: '55', top: '40%', left: '28%',  size: 38, color: '#f472b6', anim: 'db-float-b', delay: '1.8s' },
  { n: '16', top: '8%',  left: '52%',  size: 54, color: '#fb923c', anim: 'db-float-c', delay: '0.4s' },
]

const SECTION_CONFIGS = [
  { num: '01', icon: 'local_fire_department', title: 'ເລກຮ້ອນ & ເລກດັບ',         subtitle: 'Hot / Cold Numbers',            accent: '#f97316' },
  { num: '02', icon: 'bar_chart',             title: 'ການກະຈາຍຕົວເລກ',           subtitle: 'Digit Distribution',            accent: '#818cf8' },
  { num: '03', icon: 'pets',                  title: 'ສະຖິຕິນາມສັດ',               subtitle: 'Animal Frequency Stats',        accent: '#4ade80' },
  { num: '04', icon: 'insights',              title: 'ການວິເຄາະຂັ້ນສູງ',          subtitle: 'Weekday + Consecutive Patterns', accent: '#c084fc' },
  { num: '05', icon: 'magic_button',          title: 'ຈັບຄູ່ເລກ & ນາມສັດ',        subtitle: 'Pairing Intelligence',           accent: '#2dd4bf' },
  { num: '06', icon: 'trending_up',           title: 'Trend Intelligence',          subtitle: 'Momentum + Gap + Repeat',        accent: '#fbbf24' },
  { num: '07', icon: 'format_list_numbered',  title: 'ຄວາມຖີ່ທຸກຕົວເລກ',          subtitle: 'Full Frequency Matrix 00–99',   accent: '#38bdf8' },
]

// ── Deferred section ────────────────────────────────────────────────
function DeferredSection({ children, minHeight = '200px' }) {
  const ref = useRef(null)
  const [hasEntered, setHasEntered] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setHasEntered(true) },
      { rootMargin: '300px' }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref}>
      {hasEntered
        ? children
        : <div style={{ minHeight }} className="rounded-3xl bg-card/40 border border-border/40 animate-pulse" />
      }
    </div>
  )
}

// ── Floating lottery ball decoration ───────────────────────────────
function FloatingBalls() {
  return (
    <>
      <style>{`
        @keyframes db-float-a{0%,100%{transform:translateY(0px) rotate(0deg)}40%{transform:translateY(-18px) rotate(7deg)}70%{transform:translateY(8px) rotate(-4deg)}}
        @keyframes db-float-b{0%,100%{transform:translateY(0px) rotate(0deg)}30%{transform:translateY(14px) rotate(-6deg)}65%{transform:translateY(-10px) rotate(5deg)}}
        @keyframes db-float-c{0%,100%{transform:translateY(0px) rotate(0deg)}50%{transform:translateY(-22px) rotate(9deg)}}
        .db-float-a{animation:db-float-a 9s ease-in-out infinite}
        .db-float-b{animation:db-float-b 11s ease-in-out infinite}
        .db-float-c{animation:db-float-c 8s ease-in-out infinite}
      `}</style>
      {BALL_DATA.map((b, i) => (
        <div
          key={i}
          className={`absolute pointer-events-none select-none ${b.anim}`}
          style={{ top: b.top, left: b.left, right: b.right, animationDelay: b.delay, opacity: 0.1 }}
        >
          <div
            className="rounded-full flex items-center justify-center font-black text-white"
            style={{
              width: b.size, height: b.size,
              background: `radial-gradient(circle at 35% 30%, white 0%, ${b.color} 40%, ${b.color}88 100%)`,
              boxShadow: `0 4px 20px ${b.color}44, inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.3)`,
              fontSize: b.size * 0.27,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '-0.03em',
            }}
          >
            {b.n}
          </div>
        </div>
      ))}
    </>
  )
}

// ── KPI metric card in hero ────────────────────────────────────────
function HeroKpi({ label, value, sub, color }) {
  return (
    <div className="relative bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] rounded-2xl px-5 py-4 text-center min-w-[88px] overflow-hidden group">
      <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-full" style={{ background: `linear-gradient(to right, transparent, ${color}, transparent)` }} />
      <p className="text-[9px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: `${color}bb` }}>{label}</p>
      <p className="text-2xl font-black text-white leading-none font-['Space_Grotesk'] tracking-tight">{value}</p>
      {sub && <p className="text-[10px] mt-1.5 font-semibold" style={{ color: `${color}88` }}>{sub}</p>}
    </div>
  )
}

// ── Section header ─────────────────────────────────────────────────
function SectionHeader({ cfg }) {
  const { num, icon, title, subtitle, accent } = cfg
  return (
    <div className="flex items-center gap-3.5 mb-7 group">
      <div
        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black font-['Space_Grotesk'] shadow-sm transition-transform duration-200 group-hover:scale-110"
        style={{ background: `${accent}18`, border: `1.5px solid ${accent}40`, color: accent }}
      >
        {num}
      </div>
      <div
        className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
        style={{ background: `${accent}10`, border: `1px solid ${accent}22` }}
      >
        <span className="material-symbols-outlined text-[20px]" style={{ color: accent, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="font-extrabold text-foreground text-[12px] uppercase tracking-widest leading-tight">{title}</h2>
        <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold tracking-wide">{subtitle}</p>
      </div>
      <div className="hidden sm:block flex-1 max-w-32 h-px" style={{ background: `linear-gradient(to right, ${accent}30, transparent)` }} />
    </div>
  )
}

// ── Section wrapper card ───────────────────────────────────────────
function SectionCard({ cfg, children }) {
  const { accent } = cfg
  return (
    <div
      className="relative rounded-3xl p-6 sm:p-8 border overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at top left, ${accent}06, transparent 60%), var(--color-card)`,
        borderColor: `${accent}18`,
      }}
    >
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-3xl" style={{ background: `linear-gradient(to bottom, ${accent}70, transparent)` }} />
      <SectionHeader cfg={cfg} />
      {children}
    </div>
  )
}

// ── Filter pill button ─────────────────────────────────────────────
function FilterPill({ active, color, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all duration-200"
      style={active
        ? { background: color, color: '#fff', borderColor: color, boxShadow: `0 2px 10px ${color}45` }
        : { background: 'transparent', color, borderColor: `${color}45` }
      }
    >
      {children}
    </button>
  )
}

export default function DashboardPage() {
  const [timeframe, setTimeframe]   = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const { draws, types } = useData()
  const { stats } = useStatistics(timeframe, selectedType)

  const drawsForType = selectedType === 'all'
    ? draws
    : draws?.filter(d => String(d.type_id) === String(selectedType))
  const totalDraws = drawsForType?.length ?? 0

  const hotTop  = stats?.hotNumbers?.[0]
  const coldTop = stats?.coldNumbers?.[0]

  const activeType = types?.find(t => String(t.type_id) === String(selectedType))
  const typeColor  = activeType?.color || '#5daf82'
  const typeName   = activeType?.type_name ?? 'ລາວ'

  // Extract recent hot numbers for the ball decoration in the hero
  const heroBallNumbers = useMemo(() => {
    if (!stats?.hotNumbers) return ['07', '42', '88', '23', '55', '16']
    return stats.hotNumbers.slice(0, 6).map(h => h.number)
  }, [stats])

  const statsFaqs = [
    { q: 'ເລກໃດອອກຫຼາຍທີ່ສຸດ?',           a: hotTop  ? `ເລກ ${hotTop.number} ອອກ ${hotTop.count} ຄັ້ງ` : 'ກຳລັງໂຫຼດ...' },
    { q: 'เลขไหนออกบ่อยที่สุด?',            a: hotTop  ? `เลข ${hotTop.number} ออก ${hotTop.count} ครั้ง` : 'กำลังโหลด...' },
    { q: 'ສາມາດດຶງສະຖິຕິຫວຍຈາກກີ່ງວດ?',  a: `ສາມາດວິເຄາະຈາກ ${totalDraws} ງວດທັງໝົດ` },
    { q: 'มีข้อมูลหวยลาวย้อนหลังกี่งวด?',  a: `มีข้อมูล ${totalDraws} งวด` },
  ]

  return (
    <div className="space-y-10">
      <SEO
        title={`ສະຖິຕິຫວຍ${typeName} ${totalDraws} ງວດ | สถิติหวยลาว วิเคราะห์เลขเด็ด`}
        description={`ວິເຄາະສະຖິຕິຫວຍ${typeName} ຈາກ ${totalDraws} ງວດ. ເລກ Hot/Cold, ການແຈກຢາຍຕົວເລກ, ແນວໂນ້ມ ແລະ Pattern ຫວຍ | วิเคราะห์สถิติหวยลาว ${totalDraws} งวด`}
        keywords={[
          'ສະຖິຕິຫວຍ', 'ເລກ Hot', 'ເລກ Cold', 'ການແຈກຢາຍ', 'ວິເຄາະຫວຍ',
          'สถิติหวยลาว', 'เลขร้อน', 'เลขเย็น', 'วิเคราะห์เลขเด็ด',
          hotTop ? `เลข ${hotTop.number}` : '',
        ].filter(Boolean)}
        url="/statistics"
        jsonLd={[
          webPageSchema(`ສະຖິຕິຫວຍ | สถิติหวยลาว`, 'https://laolots.com/statistics', `ວິເຄາະສະຖິຕິຫວຍ${typeName} ຈາກ ${totalDraws} ງວດ`),
          breadcrumbSchema([
            { name: 'ໜ້າຫຼັກ', url: 'https://laolots.com/' },
            { name: 'ສະຖິຕິ',   url: 'https://laolots.com/statistics' },
          ]),
          faqSchema(statsFaqs),
        ]}
      />

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <div className="relative rounded-[2rem] overflow-hidden border border-white/[0.07] shadow-[0_32px_60px_-16px_rgba(0,0,0,0.7)]"
           style={{ background: 'linear-gradient(145deg, #080f0a 0%, #0c1a12 40%, #071410 100%)' }}>

        {/* Grid dot pattern */}
        <div className="absolute inset-0 bg-grid-glow opacity-20" />

        {/* Atmospheric glows */}
        <div className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 rounded-full blur-3xl pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(94,234,212,0.08) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-1/4 -left-1/4 w-2/3 h-2/3 rounded-full blur-3xl pointer-events-none"
             style={{ background: `radial-gradient(circle, ${typeColor}10 0%, transparent 70%)` }} />
        <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 rounded-full blur-3xl pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.07) 0%, transparent 70%)' }} />

        {/* Floating lottery balls */}
        <FloatingBalls numbers={heroBallNumbers} />

        {/* Watermark */}
        <div className="absolute right-4 bottom-0 text-[8rem] sm:text-[12rem] font-black leading-none select-none pointer-events-none pr-2"
             style={{ color: 'rgba(255,255,255,0.025)', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.04em' }}>
          STATS
        </div>

        <div className="relative z-10 px-8 sm:px-14 pt-12 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* ── Left: Text ── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Badge row */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 bg-white/[0.05] backdrop-blur-xl border border-white/[0.12] rounded-full px-4 py-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/90 text-[10px] font-extrabold uppercase tracking-widest font-['Plus_Jakarta_Sans']">Analytics Dashboard</span>
              </div>
              {activeType && (
                <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 border"
                     style={{ background: `${typeColor}15`, borderColor: `${typeColor}35` }}>
                  <span className="text-[9px] font-black" style={{ color: typeColor }}>● {activeType.type_name}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <h1 className="text-4xl sm:text-6xl font-black text-white leading-[1.05] tracking-tight font-['Space_Grotesk']">
                ວິເຄາະ
                <span className="block sm:inline sm:ml-3 bg-clip-text text-transparent"
                      style={{ backgroundImage: 'linear-gradient(135deg, #4ade80 0%, #38bdf8 50%, #c084fc 100%)' }}>
                  ສະຖິຕິ
                </span>
              </h1>
              <p className="mt-3 text-white/55 text-sm max-w-lg leading-relaxed font-medium">
                ບົດວິເຄາະຄວາມຖີ່ ແລະ ແນວໂນ້ມຕົວເລກຫວຍລາວ ຈາກຖານຂໍ້ມູນ
                {' '}<span className="text-white/90 font-bold">{totalDraws} ງວດ</span>
                {activeType && <span className="text-white/75 font-semibold"> — {activeType.type_name}</span>}
              </p>
            </div>

          </div>

          {/* ── Right: KPI cards ── */}
          <div className="lg:col-span-5 flex flex-wrap gap-3 lg:justify-end items-start">
            <HeroKpi label="ງວດທັງໝົດ" value={totalDraws}              sub="draws analyzed"                    color="#4ade80" />
            <HeroKpi label="ເລກ Hot"    value={hotTop?.number  ?? '—'}  sub={hotTop  ? `${hotTop.count} ຄັ້ງ`   : 'no data'} color="#f97316" />
            <HeroKpi label="ເລກ Cold"   value={coldTop?.number ?? '—'}  sub={coldTop ? `${coldTop.missedRounds} ງວດ` : 'no data'} color="#38bdf8" />
          </div>
        </div>

        {/* Bottom gradient bleed */}
        <div className="h-8 bg-gradient-to-b from-transparent to-background/40 relative z-10" />
      </div>

      {/* ══════════════════════════════════════════════
          FILTER CONTROLS
      ══════════════════════════════════════════════ */}
      <div className="bg-card/80 backdrop-blur-md border border-border/60 rounded-2xl px-5 py-4 shadow-sm space-y-4">

        {/* Type selector */}
        {types && types.length > 1 && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-0.5 h-5 rounded-full bg-primary/60" />
              <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">ປະເພດ</p>
            </div>
            <FilterPill
              active={selectedType === 'all'}
              color="#5daf82"
              onClick={() => setSelectedType('all')}
            >
              ທັງໝົດ ({draws?.length ?? 0})
            </FilterPill>
            {types.filter(t => t.is_active != 0).map(t => (
              <FilterPill
                key={t.type_id}
                active={String(selectedType) === String(t.type_id)}
                color={t.color || '#5daf82'}
                onClick={() => setSelectedType(String(t.type_id))}
              >
                {t.type_name} ({draws?.filter(d => String(d.type_id) === String(t.type_id)).length ?? 0})
              </FilterPill>
            ))}
          </div>
        )}

        {/* Timeframe picker */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-0.5 h-5 rounded-full bg-primary/60" />
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">ຊ່ວງເວລາ</p>
          </div>
          <div className="flex items-center gap-1 bg-background/60 p-1 rounded-xl border border-border/40">
            {TIMEFRAMES.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setTimeframe(value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                  timeframe === value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          EMPTY STATE
      ══════════════════════════════════════════════ */}
      {!stats && (
        <div className="flex flex-col items-center justify-center py-28 gap-5 rounded-3xl border border-border/40 bg-card/40 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-muted-foreground/40">bar_chart</span>
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-foreground">ບໍ່ມີຂໍ້ມູນ</p>
            <p className="text-sm text-muted-foreground mt-1">ຍັງບໍ່ມີຂໍ້ມູນສຳລັບປະເພດ / ຊ່ວງເວລານີ້</p>
          </div>
          <button
            onClick={() => { setSelectedType('all'); setTimeframe('all') }}
            className="px-5 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-bold border border-primary/25 hover:bg-primary/[0.18] transition-colors"
          >
            ເບິ່ງທັງໝົດ
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          ANALYTICS SECTIONS
      ══════════════════════════════════════════════ */}
      {stats && (
        <div className="space-y-8">

          {/* 01 — Hot & Cold */}
          <SectionCard cfg={SECTION_CONFIGS[0]}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <HotNumbers  timeframe={timeframe} typeId={selectedType} />
              <ColdNumbers timeframe={timeframe} typeId={selectedType} />
            </div>
          </SectionCard>

          {/* 02 — Distribution */}
          <DeferredSection minHeight="340px">
            <SectionCard cfg={SECTION_CONFIGS[1]}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-background/60 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-border/40">
                  <DigitDistribution timeframe={timeframe} />
                </div>
                <div className="bg-background/60 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-border/40">
                  <HistoricalVolatility timeframe={timeframe} />
                </div>
              </div>
            </SectionCard>
          </DeferredSection>

          {/* 03 — Animal Stats */}
          <DeferredSection minHeight="260px">
            <SectionCard cfg={SECTION_CONFIGS[2]}>
              <AnimalStats timeframe={timeframe} typeId={selectedType} />
            </SectionCard>
          </DeferredSection>

          {/* 04 — Advanced Analytics */}
          <DeferredSection minHeight="340px">
            <SectionCard cfg={SECTION_CONFIGS[3]}>
              <div className="space-y-6">
                <WeekdayStats   timeframe={timeframe} typeId={selectedType} />
                <ConsecutivePairs timeframe={timeframe} typeId={selectedType} />
              </div>
            </SectionCard>
          </DeferredSection>

          {/* 05 — Pairing Stats */}
          <DeferredSection minHeight="340px">
            <SectionCard cfg={SECTION_CONFIGS[4]}>
              <PairingStats timeframe={timeframe} typeId={selectedType} />
            </SectionCard>
          </DeferredSection>

          {/* 06 — Trend Intelligence */}
          <DeferredSection minHeight="340px">
            <SectionCard cfg={SECTION_CONFIGS[5]}>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
                <TrendMomentum timeframe={timeframe} typeId={selectedType} />
                <GapAnalysis   timeframe={timeframe} typeId={selectedType} />
              </div>
              <RepeatPattern timeframe={timeframe} typeId={selectedType} />
            </SectionCard>
          </DeferredSection>

          {/* 07 — Full Frequency */}
          <DeferredSection minHeight="220px">
            <SectionCard cfg={SECTION_CONFIGS[6]}>
              <CustomFrequency timeframe={timeframe} typeId={selectedType} />
            </SectionCard>
          </DeferredSection>

        </div>
      )}
    </div>
  )
}
