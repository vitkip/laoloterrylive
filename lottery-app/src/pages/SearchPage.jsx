import { useState } from 'react';
import DreamDictionary from '../components/DreamDictionary';
import NumberHistorySearch from '../components/NumberHistorySearch';

const TABS = [
  { id: 'dream',  label: 'ຕຳລາແປຄວາມຝັນ',          icon: 'auto_awesome',    color: '#7c3aed' },
  { id: 'number', label: 'ຄົ້ນຫາຍ້ອນຫຼັງສະເພາະເລກ', icon: 'manage_search',   color: '#006c49' },
]

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState('dream')

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* ─── Hero Header ─── */}
      <div className="relative rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2e1065] via-[#4f46e5] to-[#7c3aed]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(108,248,187,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.3),transparent_55%)]" />
        <div className="absolute right-0 bottom-0 text-[8rem] sm:text-[12rem] font-black text-white/[0.04] leading-none select-none pointer-events-none pr-4 pb-1">
          ຝັນ
        </div>

        <div className="relative z-10 px-8 sm:px-12 py-9 sm:py-11">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3.5 py-1 mb-5">
            <span className="material-symbols-outlined text-[#c4b5fd] text-[14px]">auto_awesome</span>
            <span className="text-white/90 text-[11px] font-bold uppercase tracking-widest">Dream & Search</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
            ຄົ້ນຫາ
            <span className="text-[#c4b5fd] ml-3">& ແປຄວາມຝັນ</span>
          </h1>
          <p className="text-white/60 text-sm max-w-lg leading-relaxed">
            ລະບົບຄົ້ນຫາປະຫວັດຕົວເລກ ແລະ ຕຳລາແປຄວາມຝັນ ຊອກຫານາມສັດ ຈາກສິ່ງທີ່ຝັນເຫັນ
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            {['ຝັນເຫັນ 40 ສັດ', 'ຄົ້ນຫາ 00–99', 'ປະຫວັດຍ້ອນຫຼັງ', 'ສະຖິຕິຄວາມຖີ່'].map(f => (
              <span key={f} className="text-[10px] font-bold text-white/70 bg-white/10 border border-white/15 px-2.5 py-1 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Tab Switcher ─── */}
      <div className="flex items-center gap-1 bg-[#f0f4ff] dark:bg-[#1e2d4a] p-1.5 rounded-2xl border border-[#e8edf8] dark:border-[#2b3a54] w-full sm:w-auto sm:self-start">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-white dark:bg-[#152033] shadow-sm'
                : 'text-[#737686] dark:text-[#94a3b8] hover:text-[#121c2a] dark:hover:text-white'
              }`}
            style={activeTab === tab.id ? { color: tab.color } : {}}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split('ສະເພາະ')[0]}</span>
          </button>
        ))}
      </div>

      {/* ─── Panel ─── */}
      <div className="min-h-[60vh]">
        {activeTab === 'dream'
          ? <DreamDictionary />
          : <NumberHistorySearch />
        }
      </div>
    </div>
  )
}