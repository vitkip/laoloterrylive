import { useState } from 'react';
import DreamDictionary from '../components/DreamDictionary';
import NumberHistorySearch from '../components/NumberHistorySearch';
import MonthlyStats from '../components/MonthlyStats';
import { useData } from '../context/DataContext';
import SEO from '../components/SEO';
import { webPageSchema, faqSchema, breadcrumbSchema } from '../components/schemas';

const TABS = [
  { id: 'dream',   label: 'ຕຳລາແປຄວາມຝັນ',       icon: 'auto_awesome',    color: '#7c3aed' },
  { id: 'number',  label: 'ຄົ້ນຫາຕາມເລກ',          icon: 'manage_search',   color: '#006c49' },
  { id: 'monthly', label: 'ວິເຄາະຕາມເດືອນ',        icon: 'calendar_month',  color: '#d97706' },
]

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState('dream')
  const [selectedType, setSelectedType] = useState('all')
  const { draws, types } = useData()

  const searchFaqs = [
    { q: 'ຕຳລາຄວາມຝັນແມ່ນຫຍັງ?', a: 'ຕຳລາໂບຮານ 40 ນາມສັດ ແປຄວາມຝັນເປັນເລກຫວຍ' },
    { q: 'ตำราแปลความฝันคืออะไร?', a: 'ตำราโบราณ 40 นามสัตว์ แปลความฝันเป็นเลขหวย' },
    { q: 'ສາມາດຊອກຫາຜົນຫວຍຕາມເລກໄດ້ບໍ?', a: 'ໄດ້ — ໃຊ້ tab "ຄົ້ນຫາຕາມເລກ" ເພື່ອເບິ່ງປະຫວັດ' },
    { q: 'ค้นหาผลหวยตามเลขได้ไหม?', a: 'ได้ — ใช้แท็บ "ค้นหาตามเลข" เพื่อดูประวัติ' },
  ]

  return (
    <div className="space-y-8">
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

      {/* ─── Hero Header ─── */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/[0.05]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#09090b] via-[#0e0e16] to-[#0d0d13]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.22),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(56,189,248,0.14),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06),transparent_70%)]" />
        <div className="absolute right-0 bottom-0 text-[8rem] sm:text-[12rem] font-black text-white/[0.03] leading-none select-none pointer-events-none pr-4 pb-1">
          {activeTab === 'monthly' ? 'ເດືອນ' : 'ຝັນ'}
        </div>

        <div className="relative z-10 px-8 sm:px-12 py-9 sm:py-11">
          <div className="inline-flex items-center gap-2 bg-white/[0.07] backdrop-blur-xl border border-white/[0.15] rounded-full px-3.5 py-1 mb-5 shadow-lg shadow-violet-500/10">
            <span className="material-symbols-outlined text-violet-300 text-[14px]">auto_awesome</span>
            <span className="text-white/90 text-[11px] font-bold uppercase tracking-widest">Dream · Search · Analytics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
            ຄົ້ນຫາ
            <span className="text-violet-300 ml-3">& ວິເຄາະ</span>
          </h1>
          <p className="text-white/60 text-sm max-w-lg leading-relaxed">
            ຕຳລາແປຄວາມຝັນ · ຄົ້ນຫາປະຫວັດຕົວເລກ · ວິເຄາະສະຖິຕິຕາມເດືອນ
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            {['ຝັນເຫັນ 40 ສັດ', 'ຄົ້ນຫາ 00–99', 'ປະຫວັດຍ້ອນຫຼັງ', 'ສະຖິຕິຄວາມຖີ່', 'ວິເຄາະຕາມເດືອນ'].map(f => (
              <span key={f} className="text-[10px] font-bold text-white/70 bg-white/[0.05] border border-white/[0.09] backdrop-blur-sm px-2.5 py-1 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Type Selector (hidden for dream tab) ─── */}
      {activeTab !== 'dream' && types && types.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-1 h-5 rounded-full bg-gradient-to-b from-primary to-primary/40" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-1">ປະເພດຫວຍ</span>
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              selectedType === 'all'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                : 'bg-card/70 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            }`}
          >
            ທັງໝົດ ({draws?.length ?? 0})
          </button>
          {types.filter(t => t.is_active != 0).map(t => {
            const color = t.color || '#7c3aed'
            const active = selectedType === String(t.type_id)
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

      {/* ─── Tab Switcher ─── */}
      <div className="flex items-center gap-1 bg-card/60 backdrop-blur-md p-1.5 rounded-2xl border border-border/60 shadow-sm w-full">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-[11px] sm:text-[12px] font-bold transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-card/80 backdrop-blur-sm shadow-sm ring-1 ring-border/30'
                : 'text-muted-foreground hover:text-foreground'
              }`}
            style={activeTab === tab.id ? { color: tab.color } : {}}
          >
            <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden text-[10px]">
              {tab.id === 'dream'   ? 'ຝັນ'    :
               tab.id === 'number' ? 'ຄົ້ນຫາ' : 'ເດືອນ'}
            </span>
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