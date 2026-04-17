import { useStatistics } from '../hooks/useStatistics';

export default function ColdNumbers({ timeframe }) {
  const { stats, loading } = useStatistics(timeframe);
  if (loading || !stats) return null;
  const { coldNumbers } = stats;
  const maxMissed = coldNumbers[0]?.missedRounds || 1;

  const coldColor = (missed) => {
    const ratio = missed / maxMissed;
    if (ratio > 0.85) return { bar: 'from-[#0369a1] to-[#0ea5e9]', text: 'text-[#0369a1] dark:text-[#38bdf8]', bg: 'bg-[#e0f2fe] dark:bg-[#0c2a3e]' };
    if (ratio > 0.5)  return { bar: 'from-[#0891b2] to-[#22d3ee]', text: 'text-[#0891b2] dark:text-[#67e8f9]', bg: 'bg-[#ecfeff] dark:bg-[#0a2630]' };
    return               { bar: 'from-[#164e63] to-[#0891b2]', text: 'text-[#164e63] dark:text-[#a5f3fc]', bg: 'bg-[#f0fdff] dark:bg-[#091e24]' };
  };

  return (
    <div className="md:col-span-4 bg-gradient-to-br from-[#f0fdff] to-[#ecfeff] dark:from-[#071e26] dark:to-[#041318] rounded-2xl p-6 sm:p-8 border border-[#a5f3fc]/40 dark:border-[#164e63]/40 shadow-sm overflow-hidden relative">

      {/* Decorative glow */}
      <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-[#0ea5e9]/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-7 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0369a1] to-[#0ea5e9] flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            ac_unit
          </span>
        </div>
        <div>
          <h2 className="text-base font-extrabold text-[#0c4a6e] dark:text-white tracking-tight">ເລກດັບ</h2>
          <p className="text-[11px] text-[#0369a1] dark:text-[#7dd3fc] font-medium">Cold Numbers</p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3.5 relative z-10">
        {coldNumbers.map(({ number, missedRounds }, i) => {
          const cfg = coldColor(missedRounds);
          const barPct = Math.round((missedRounds / maxMissed) * 100);
          return (
            <div
              key={number}
              className={`${cfg.bg} rounded-xl p-4 border border-[#a5f3fc]/30 dark:border-[#164e63]/30 hover:-translate-y-0.5 transition-all duration-200`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0369a1] to-[#0ea5e9] flex items-center justify-center shadow-sm">
                    <span className="text-lg font-black text-white">{number}</span>
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${cfg.text}`}>ອັນດັບ {i + 1}</p>
                    <p className="text-[11px] text-[#64748b] dark:text-[#475569]">ບໍ່ອອກ</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xl font-black ${cfg.text}`}>{missedRounds}</span>
                  <p className="text-[10px] text-[#64748b] dark:text-[#475569]">ງວດ</p>
                </div>
              </div>
              {/* Bar */}
              <div className="h-1.5 w-full bg-[#a5f3fc]/20 dark:bg-[#164e63]/30 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${cfg.bar} rounded-full transition-all duration-700`}
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer note */}
      <p className="mt-6 text-[10px] text-[#0369a1]/70 dark:text-[#7dd3fc]/50 leading-relaxed relative z-10 flex items-start gap-1.5">
        <span className="material-symbols-outlined text-[12px] mt-px shrink-0">info</span>
        ຕົວເລກທີ່ຍາວນານທີ່ສຸດທີ່ຍັງບໍ່ໄດ້ອອກໃນ 2 ຕົວສຸດທ້າຍ
      </p>
    </div>
  )
}
