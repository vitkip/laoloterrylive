import { useStatistics } from '../hooks/useStatistics';

export default function GapAnalysis({ timeframe }) {
  const { stats, loading } = useStatistics(timeframe);
  if (loading || !stats) return null;
  const { gapAnalysis } = stats;
  const maxMissed = gapAnalysis[0]?.missedRounds || 1;

  const urgencyColor = (ratio) => {
    if (ratio >= 2)   return { bar: 'from-[#dc2626] to-[#ef4444]', text: 'text-[#dc2626] dark:text-[#f87171]', bg: 'bg-[#fff4f4] dark:bg-[#2a1010]', badge: 'bg-[#dc2626]' };
    if (ratio >= 1.5) return { bar: 'from-[#d97706] to-[#f59e0b]', text: 'text-[#d97706] dark:text-[#fbbf24]', bg: 'bg-[#fffbeb] dark:bg-[#1c1208]', badge: 'bg-[#d97706]' };
    if (ratio >= 1)   return { bar: 'from-[#0369a1] to-[#0ea5e9]', text: 'text-[#0369a1] dark:text-[#38bdf8]', bg: 'bg-[#e0f2fe] dark:bg-[#0c2a3e]', badge: 'bg-[#0369a1]' };
    return              { bar: 'from-[#374151] to-[#6b7280]', text: 'text-[#555870] dark:text-[#94a3b8]', bg: 'bg-[#f5f7ff] dark:bg-[#1e2d4a]', badge: 'bg-[#374151]' };
  };

  return (
    <div className="bg-white dark:bg-[#152033] rounded-2xl p-6 sm:p-8 border border-[#e8edf8] dark:border-[#2b3a54] shadow-sm overflow-hidden relative">
      <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-[#f59e0b]/8 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d97706] to-[#f59e0b] flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              hourglass_top
            </span>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#121c2a] dark:text-white tracking-tight">Gap Analysis</h2>
            <p className="text-[11px] text-[#737686] dark:text-[#94a3b8] font-medium">ເລກຂາດ — Top 10</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[9px] font-bold text-[#a0a3bd] uppercase tracking-wider">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#dc2626]" />≥ 2× ຄ່າສະເລ່ຍ</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#d97706]" />≥ 1.5×</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0369a1]" />ເກີນ</span>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3 relative z-10">
        {gapAnalysis.map(({ number, count, missedRounds, expectedGap, overdueRatio }, i) => {
          const cfg = urgencyColor(overdueRatio);
          const barPct = Math.round((missedRounds / maxMissed) * 100);
          return (
            <div key={number} className={`${cfg.bg} rounded-xl px-4 py-3 border border-transparent hover:-translate-y-0.5 transition-all duration-200`}>
              <div className="flex items-center gap-3">
                {/* Rank */}
                <span className="text-[10px] font-black text-[#a0a3bd] w-4 shrink-0">{i + 1}</span>

                {/* Number badge */}
                <div className={`w-9 h-9 rounded-xl ${cfg.badge} flex items-center justify-center shadow-sm shrink-0`}>
                  <span className="text-sm font-black text-white">{number}</span>
                </div>

                {/* Bar + stats */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[11px] font-bold ${cfg.text}`}>ບໍ່ອອກ {missedRounds} ງວດ</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-[#a0a3bd]">ສະເລ່ຍ {expectedGap} ງວດ</span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${cfg.text} bg-white/50 dark:bg-black/20`}>
                        {overdueRatio.toFixed(1)}×
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-[#e8edf8]/60 dark:bg-[#2b3a54]/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${cfg.bar} rounded-full transition-all duration-700`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>

                {/* Count */}
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-[#a0a3bd]">ເຄີຍອອກ</p>
                  <p className={`text-xs font-black ${cfg.text}`}>{count}×</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-[10px] text-[#a0a3bd] dark:text-[#555870] flex items-start gap-1.5 relative z-10">
        <span className="material-symbols-outlined text-[12px] mt-px shrink-0">info</span>
        ຄ່າ ×N = ເກີນຄ່າສະເລ່ຍ N ເທື່ອ — ຍິ່ງສູງ ຍິ່ງ "ເກີນ" ຄ່າໂດຍທຳມະດາ
      </p>
    </div>
  );
}