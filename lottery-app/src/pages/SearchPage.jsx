import { useState } from 'react';
import DreamDictionary from '../components/DreamDictionary';
import NumberHistorySearch from '../components/NumberHistorySearch';
import MonthlyStats from '../components/MonthlyStats';
import { useData } from '../context/DataContext';
import SEO from '../components/SEO';
import { webPageSchema, faqSchema, breadcrumbSchema } from '../components/schemas';

const TABS = [
  {
    id: 'dream',
    label: 'ຝັນ',
    labelFull: 'ຕຳລາແປຄວາມຝັນ',
    icon: 'auto_awesome',
    color: '#7c3aed',
    accent: '#a855f7',
    glow: 'rgba(124,58,237,0.38)',
    glowLight: 'rgba(124,58,237,0.14)',
    watermark: 'ຝັນ',
  },
  {
    id: 'number',
    label: 'ຄົ້ນຫາ',
    labelFull: 'ຄົ້ນຫາຕາມເລກ',
    icon: 'manage_search',
    color: '#006c49',
    accent: '#10b981',
    glow: 'rgba(0,108,73,0.35)',
    glowLight: 'rgba(0,108,73,0.12)',
    watermark: 'ຄົ້ນ',
  },
  {
    id: 'monthly',
    label: 'ເດືອນ',
    labelFull: 'ວິເຄາະຕາມເດືອນ',
    icon: 'calendar_month',
    color: '#b45309',
    accent: '#f59e0b',
    glow: 'rgba(180,83,9,0.35)',
    glowLight: 'rgba(180,83,9,0.12)',
    watermark: 'ເດືອນ',
  },
]

const HERO_FEATURES = [
  { icon: 'auto_awesome',   text: 'ຝັນ 40 ນາມສັດ',    color: '#c4b5fd' },
  { icon: 'tag',            text: 'ຄົ້ນຫາ 00–99',     color: '#6ee7b7' },
  { icon: 'history',        text: 'ປະຫວັດຍ້ອນຫຼັງ',  color: '#93c5fd' },
  { icon: 'bar_chart',      text: 'ສະຖິຕິຄວາມຖີ່',   color: '#fde68a' },
  { icon: 'calendar_month', text: 'ວິເຄາະຕາມເດືອນ',  color: '#fca5a5' },
]

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState('dream')
  const [selectedType, setSelectedType] = useState('all')
  const { draws, types } = useData()

  const tab = TABS.find(t => t.id === activeTab)
  const tabIdx = TABS.findIndex(t => t.id === activeTab)

  const searchFaqs = [
    { q: 'ຕຳລາຄວາມຝັນແມ່ນຫຍັງ?', a: 'ຕຳລາໂບຮານ 40 ນາມສັດ ແປຄວາມຝັນເປັນເລກຫວຍ' },
    { q: 'ตำราแปลความฝันคืออะไร?', a: 'ตำราโบราณ 40 นามสัตว์ แปลความฝันเป็นเลขหวย' },
    { q: 'ສາມາດຊອກຫາຜົນຫວຍຕາມເລກໄດ້ບໍ?', a: 'ໄດ້ — ໃຊ້ tab "ຄົ້ນຫາຕາມເລກ" ເພື່ອເບິ່ງປະຫວັດ' },
    { q: 'ค้นหาผลหวยตามเลขได้ไหม?', a: 'ได้ — ใช้แท็บ "ค้นหาตามเลข" เพื่อดูประวัติ' },
  ]

  return (
    <div className="space-y-5">
      <SEO
        title="ຕຳລາແປຄວາມຝັນ & ຄົ້ນຫາຜົນຫວຍ | ทำนายฝัน ตรวจหวยออนไลน์ เลขเด็ดจากความฝัน"
        description="ຕຳລາໂບຮານ 40 ນາມສັດ ແປຄວາມຝັນເປັນເລກ, ຄົ້ນຫາຜົນຫວຍຕາມເລກ, ວິເຄາະຕາມເດືອນ | ทำนายฝัน 40 นามสัตว์ แปลความฝันเป็นเลขหวย ค้นหาผลหวยออนไลน์ วิเคราะห์ตามเดือน"
        keywords={[
          'ຕຳລາຄວາມຝັນ', 'ທຳນາຍຝັນ', 'ນາມສັດ 40', 'ຄົ້ນຫາຫວຍ',
          'ทำนายฝัน', 'ตำราความฝัน', 'นามสัตว์', 'ตรวจหวยออนไลน์',
          'เลขเด็ดจากความฝัน', 'หวยจากความฝัน', 'ค้นหาผลหวย',
        ]}
        url="/search"
        jsonLd={[
          webPageSchema(
            'ຕຳລາແປຄວາມຝັນ & ຄົ້ນຫາຜົນຫວຍ | ทำนายฝัน ตรวจหวยออนไลน์',
            'https://laolots.com/search',
            'ຕຳລາໂບຮານ 40 ນາມສັດ ແປຄວາມຝັນ, ຄົ້ນຫາຜົນຫວຍ, ວິເຄາະຕາມເດືອນ',
          ),
          breadcrumbSchema([
            { name: 'ໜ້າຫຼັກ', url: 'https://laolots.com/' },
            { name: 'ຄົ້ນຫາ & ວິເຄາະ', url: 'https://laolots.com/search' },
          ]),
          faqSchema(searchFaqs),
        ]}
      />

      {/* ─── Cinematic Hero ─── */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/[0.06]">
        {/* Base dark layer */}
        <div className="absolute inset-0 bg-[#06060f]" />

        {/* Dynamic radial glow — reacts to active tab */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{ background: `radial-gradient(ellipse 70% 80% at 90% 20%, ${tab.glow} 0%, transparent 65%)` }}
        />
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{ background: `radial-gradient(ellipse 50% 60% at 15% 85%, ${tab.glowLight} 0%, transparent 60%)` }}
        />

        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Floating orb — top-right bloom */}
        <div
          className="absolute -top-8 -right-8 w-64 h-64 rounded-full blur-[80px] opacity-25 transition-colors duration-700 pointer-events-none"
          style={{ background: tab.color }}
        />
        {/* Smaller orb — bottom-left */}
        <div
          className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full blur-[60px] opacity-15 transition-colors duration-700 pointer-events-none"
          style={{ background: tab.accent }}
        />

        {/* Ghost watermark text */}
        <div
          className="absolute right-0 bottom-0 font-headline font-black select-none pointer-events-none leading-none pr-5 pb-1 transition-all duration-500"
          style={{
            fontSize: 'clamp(6rem, 18vw, 13rem)',
            color: 'rgba(255,255,255,0.028)',
            letterSpacing: '-0.02em',
          }}
        >
          {tab.watermark}
        </div>

        {/* Content */}
        <div className="relative z-10 px-7 sm:px-12 py-10 sm:py-12">

          {/* Status badge */}
          <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.1] backdrop-blur-sm rounded-full px-3.5 py-1.5 mb-6">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: tab.accent }}
            />
            <span className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">
              Dream · Search · Analytics
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.1] mb-3">
            ຄົ້ນຫາ
            <span
              className="ml-3 transition-all duration-500"
              style={{
                background: `linear-gradient(135deg, ${tab.accent} 0%, ${tab.color} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              & ວິເຄາະ
            </span>
          </h1>

          <p className="text-white/45 text-sm max-w-md leading-relaxed mb-7">
            ຕຳລາໂບຮານ 40 ນາມສັດ · ປະຫວັດຕົວເລກ · ວິເຄາະສະຖິຕິຕາມເດືອນ
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-1.5">
            {HERO_FEATURES.map(f => (
              <span
                key={f.text}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] font-bold"
                style={{ color: f.color }}
              >
                <span className="material-symbols-outlined text-[11px]">{f.icon}</span>
                {f.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Type Selector (hidden for dream tab) ─── */}
      {activeTab !== 'dream' && types && types.length > 1 && (
        <div
          className="flex items-center gap-2 overflow-x-auto pb-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Accent stripe */}
          <div
            className="w-0.5 h-5 rounded-full shrink-0 transition-colors duration-500"
            style={{ background: `linear-gradient(to bottom, ${tab.color}, ${tab.color}40)` }}
          />
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] shrink-0 mr-1">
            ປະເພດ
          </span>

          <button
            onClick={() => setSelectedType('all')}
            className={`shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
              selectedType === 'all'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card/70 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            }`}
          >
            ທັງໝົດ{' '}
            <span className="opacity-60">({draws?.length ?? 0})</span>
          </button>

          {types.filter(t => t.is_active != 0).map(t => {
            const color = t.color || '#7c3aed'
            const active = selectedType === String(t.type_id)
            const cnt = draws?.filter(d => String(d.type_id) === String(t.type_id)).length ?? 0
            return (
              <button
                key={t.type_id}
                onClick={() => setSelectedType(String(t.type_id))}
                className="shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200"
                style={
                  active
                    ? { background: color, color: '#fff', borderColor: color, boxShadow: `0 2px 14px ${color}55` }
                    : { background: 'transparent', color, borderColor: `${color}45` }
                }
              >
                {t.type_name}{' '}
                <span style={{ opacity: 0.65 }}>({cnt})</span>
              </button>
            )
          })}
        </div>
      )}

      {/* ─── Tab Switcher with animated sliding pill ─── */}
      <div className="relative flex items-center bg-card/70 backdrop-blur-md p-1.5 rounded-2xl border border-border/60 shadow-sm">

        {/* Sliding indicator — positioned behind buttons */}
        <div
          style={{
            position: 'absolute',
            top: '6px',
            bottom: '6px',
            width: 'calc(33.3333% - 4px)',
            left: `calc(${tabIdx * 33.3333}% + ${6 - tabIdx * 4}px)`,
            borderRadius: '0.75rem',
            background: 'var(--card)',
            boxShadow: `0 2px 18px ${tab.glow}, 0 0 0 1px rgba(255,255,255,0.04)`,
            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s ease',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="relative flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-5 py-2.5 rounded-xl text-[11px] sm:text-[12px] font-bold transition-colors duration-200"
            style={{
              zIndex: 1,
              color: activeTab === t.id ? t.color : 'var(--muted-foreground)',
            }}
          >
            <span className="material-symbols-outlined text-[15px]">{t.icon}</span>
            <span className="hidden sm:inline">{t.labelFull}</span>
            <span className="sm:hidden">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ─── Panel ─── */}
      <div className="min-h-[60vh]">
        {activeTab === 'dream'   && <DreamDictionary />}
        {activeTab === 'number'  && <NumberHistorySearch selectedType={selectedType} />}
        {activeTab === 'monthly' && <MonthlyStats selectedType={selectedType} />}
      </div>
    </div>
  )
}
