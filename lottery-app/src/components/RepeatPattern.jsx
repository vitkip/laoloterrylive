import { useStatistics } from '../hooks/useStatistics';

export default function RepeatPattern({ timeframe }) {
  const { stats, loading } = useStatistics(timeframe);
  if (loading || !stats) return null;
  const { doubles, mirrors, totalTwoDigitCount } = stats.repeatPatterns;

  const maxDoubleCount = doubles[0]?.count || 1;
  const maxMirrorTotal = mirrors[0]?.total || 1;

  return (
    <div className="bg-white dark:bg-[#152033] rounded-2xl p-6 sm:p-8 border border-[#e8edf8] dark:border-[#2b3a54] shadow-sm overflow-hidden relative">
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#7c3aed]/6 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-7 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            pattern
          </span>
        </div>
        <div>
          <h2 className="text-base font-extrabold text-[#121c2a] dark:text-white tracking-tight">Repeat Pattern Detection</h2>
          <p className="text-[11px] text-[#737686] dark:text-[#94a3b8] font-medium">ເລກຊ້ຳ & ເລກສະລັບ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-7 relative z-10">

        {/* ── Double Numbers (11, 22…) ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#7c3aed]" />
            <p className="text-[10px] font-bold text-[#737686] dark:text-[#94a3b8] uppercase tracking-wider">
              ເລກຄູ່ (11, 22, 33…)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {doubles.map(({ number, count, pct }) => {
              const barPct = Math.round((count / maxDoubleCount) * 100);
              const highlight = count > 0;
              return (
                <div
                  key={number}
                  className={`rounded-xl p-3 border transition-all hover:-translate-y-0.5 duration-200
                    ${highlight
                      ? 'bg-[#f5f3ff] dark:bg-[#1e1333] border-[#ddd6fe]/50 dark:border-[#4c1d95]/30'
                      : 'bg-[#f5f7ff] dark:bg-[#1a2235] border-[#e8edf8] dark:border-[#2b3a54] opacity-50'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center shadow-sm">
                      <span className="text-sm font-black text-white">{number}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#7c3aed] dark:text-[#c4b5fd]">{count}<span className="text-[10px] font-normal text-[#a0a3bd] ml-0.5">ຄັ້ງ</span></p>
                      <p className="text-[10px] text-[#a0a3bd]">{pct}%</p>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-[#ddd6fe]/30 dark:bg-[#4c1d95]/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] rounded-full transition-all duration-700"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Mirror Pairs (12 ↔ 21) ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#0891b2]" />
            <p className="text-[10px] font-bold text-[#737686] dark:text-[#94a3b8] uppercase tracking-wider">
              ເລກສະລັບ (12 ↔ 21)
            </p>
          </div>
          <div className="space-y-2">
            {mirrors.map(({ pair, counts, total }) => {
              const barPct = Math.round((total / maxMirrorTotal) * 100);
              const [n1, n2] = pair;
              const [c1, c2] = counts;
              const pct = totalTwoDigitCount > 0 ? (total / totalTwoDigitCount * 100).toFixed(1) : '0.0';
              return (
                <div
                  key={`${n1}-${n2}`}
                  className="bg-[#f0fdff] dark:bg-[#071e26] rounded-xl px-4 py-3 border border-[#a5f3fc]/30 dark:border-[#164e63]/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {/* Pair display */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0369a1] to-[#0ea5e9] flex items-center justify-center shadow-sm">
                        <span className="text-sm font-black text-white">{n1}</span>
                      </div>
                      <span className="material-symbols-outlined text-[#0891b2] text-[14px]">sync_alt</span>
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0891b2] to-[#22d3ee] flex items-center justify-center shadow-sm">
                        <span className="text-sm font-black text-white">{n2}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-[#0369a1] dark:text-[#38bdf8] font-semibold">
                          {n1}:{c1}ຄັ້ງ &nbsp;·&nbsp; {n2}:{c2}ຄັ້ງ
                        </span>
                        <span className="text-[10px] font-black text-[#0891b2] dark:text-[#67e8f9]">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#a5f3fc]/20 dark:bg-[#164e63]/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#0369a1] to-[#22d3ee] rounded-full transition-all duration-700"
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>

                    <span className="text-sm font-black text-[#0369a1] dark:text-[#38bdf8] shrink-0">{total}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-5 text-[10px] text-[#a0a3bd] dark:text-[#555870] flex items-start gap-1.5 relative z-10">
        <span className="material-symbols-outlined text-[12px] mt-px shrink-0">info</span>
        ອ້າງອີງຈາກ {totalTwoDigitCount} ງວດທີ່ມີຜົນ 2 ຕົວ — % ຄຳນວນຈາກທັງໝົດ
      </p>
    </div>
  );
}