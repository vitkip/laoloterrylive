import { useStatistics } from '../hooks/useStatistics';

const RANK_CONFIG = [
  { bg: 'from-[#ff6b35] to-[#f7931e]', badge: 'bg-[#ff6b35]', glow: 'shadow-[0_0_20px_rgba(255,107,53,0.35)]', rank: '🥇' },
  { bg: 'from-[#c2410c] to-[#ea580c]', badge: 'bg-[#c2410c]', glow: 'shadow-[0_0_16px_rgba(194,65,12,0.30)]', rank: '🥈' },
  { bg: 'from-[#9a3412] to-[#c2410c]', badge: 'bg-[#9a3412]', glow: 'shadow-[0_0_12px_rgba(154,52,18,0.25)]', rank: '🥉' },
  { bg: 'from-[#7c2d12] to-[#9a3412]', badge: 'bg-[#7c2d12]', glow: '',                                          rank: '4️⃣' },
]

export default function HotNumbers({ timeframe }) {
  const { stats, loading } = useStatistics(timeframe);
  if (loading || !stats) return null;
  const { hotNumbers } = stats;
  const maxCount = hotNumbers[0]?.count || 1;

  return (
    <div className="md:col-span-8 bg-gradient-to-br from-[#fff7f0] to-[#fff4ed] dark:from-[#2a1a0a] dark:to-[#1e1208] rounded-2xl p-6 sm:p-8 border border-[#fed7aa]/60 dark:border-[#7c2d12]/40 shadow-sm overflow-hidden relative">

      {/* Decorative glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#ff6b35]/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-7 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#f7931e] flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_fire_department
            </span>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-foreground tracking-tight">
              ເລກເດັ່ນ
            </h2>
            <p className="text-[11px] text-[#9a3412] dark:text-[#fdba74] font-medium">Hot Numbers</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-[#9a3412] dark:text-[#fdba74] bg-[#fed7aa]/40 dark:bg-[#7c2d12]/30 px-3 py-1 rounded-full border border-[#fed7aa]/60 dark:border-[#7c2d12]/40">
          ອອກຫຼາຍທີ່ສຸດ
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
        {hotNumbers.map(({ number, count }, i) => {
          const cfg = RANK_CONFIG[i] || RANK_CONFIG[3];
          const barPct = Math.round((count / maxCount) * 100);
          return (
            <div
              key={number}
              className={`relative bg-white dark:bg-[#1a0f05] rounded-2xl p-5 flex flex-col items-center gap-3 border border-[#fed7aa]/40 dark:border-[#7c2d12]/30 ${cfg.glow} hover:-translate-y-0.5 transition-all duration-200`}
            >
              {/* Rank badge */}
              <div className={`absolute -top-2 -right-2 w-6 h-6 ${cfg.badge} rounded-full flex items-center justify-center shadow-sm`}>
                <span className="text-white text-[9px] font-black">{i + 1}</span>
              </div>

              {/* Number with gradient */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg.bg} flex items-center justify-center shadow-sm`}>
                <span className="text-2xl font-black text-white tracking-tight">{number}</span>
              </div>

              {/* Count */}
              <div className="text-center">
                <p className="text-[13px] font-extrabold text-foreground">{count} ຄັ້ງ</p>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-[#fed7aa]/30 dark:bg-[#7c2d12]/20 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${cfg.bg} rounded-full transition-all duration-700`}
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-5 border-t border-[#fed7aa]/30 dark:border-[#7c2d12]/30 flex items-center justify-between relative z-10">
        <p className="text-xs text-[#9a3412] dark:text-[#fdba74]">
          ຄ່າສູງສຸດ: <span className="font-black text-foreground">{hotNumbers[0]?.count}</span> ຄັ້ງ
        </p>
        <div className="flex items-center gap-1.5 text-[10px] text-[#9a3412] dark:text-[#fdba74]">
          <span className="material-symbols-outlined text-[12px]">info</span>
          ຄວາມຖີ່ຈາກ 2 ຕົວສຸດທ້າຍ
        </div>
      </div>
    </div>
  )
}
