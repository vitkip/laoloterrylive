import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { formatLaoDate } from '../utils/date';

const LAO_MONTHS = [
  'ມັງກອນ','ກຸມພາ','ມີນາ','ເມສາ',
  'ພຶດສະພາ','ມິຖຸນາ','ກໍລະກົດ','ສິງຫາ',
  'ກັນຍາ','ຕຸລາ','ພະຈິກ','ທັນວາ',
];

const accent = '#d4af37';
const accentLight = 'rgba(212,175,55,0.12)';

function DigitRow({ result, size = 'sm' }) {
  if (!result) return null;
  const padded = result.padEnd(6, '·');
  const groups = [padded.slice(0, 2), padded.slice(2, 4), padded.slice(4, 6)];
  const box = size === 'sm'
    ? 'w-6 h-7 rounded-md text-xs border'
    : 'w-7 h-8 rounded-lg text-sm border';
  return (
    <div className="flex items-center gap-1">
      {groups.map((grp, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {grp.split('').map((ch, ci) => (
            <div key={ci} className={`${box} flex items-center justify-center font-black transition-all
              ${/\d/.test(ch)
                ? 'bg-[#0d0e1c] border-[#d4af37]/40 text-[#ffd700] shadow-[0_2px_8px_rgba(212,175,55,0.15)]'
                : 'bg-white/[0.04] border-white/[0.05] text-white/[0.2]'}`}>
              {ch}
            </div>
          ))}
          {gi < 2 && <span className="text-white/[0.15] font-black text-[9px] mx-0.5">·</span>}
        </div>
      ))}
    </div>
  );
}

export default function MonthlyStats({ selectedType = 'all' }) {
  const { draws } = useData();
  const [selectedMonth, setSelectedMonth] = useState(null); // 1–12

  const filteredDraws = selectedType === 'all'
    ? draws
    : draws?.filter(d => String(d.type_id) === String(selectedType))

  // ── Compute stats for selected month ──
  const analysis = useMemo(() => {
    if (!selectedMonth || !filteredDraws?.length) return null;

    const monthDraws = filteredDraws
      .filter(d => {
        if (d.status !== 'published') return false;
        return new Date(d.draw_date).getMonth() + 1 === selectedMonth;
      })
      .sort((a, b) => new Date(b.draw_date) - new Date(a.draw_date));

    if (!monthDraws.length) return { draws: [], freq: [], grouped: {}, totalDraws: 0 };

    // Frequency of 2-digit results
    const freq = {};
    monthDraws.forEach(d => {
      const det = d.results_detail?.find(r => r.prize_type === '2_digits');
      const v = det?.result_value;
      if (v) freq[v] = (freq[v] || 0) + 1;
    });
    const freqArr = Object.entries(freq)
      .map(([number, count]) => ({ number, count, pct: +(count / monthDraws.length * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count);

    // Group by year
    const grouped = {};
    monthDraws.forEach(d => {
      const yr = new Date(d.draw_date).getFullYear();
      if (!grouped[yr]) grouped[yr] = [];
      grouped[yr].push(d);
    });

    // Years span
    const years = Object.keys(grouped).map(Number).sort((a, b) => b - a);

    // Top digit (0–9) from full_result
    const digitFreq = Array(10).fill(0);
    monthDraws.forEach(d => {
      if (d.full_result) d.full_result.split('').forEach(c => { if (/\d/.test(c)) digitFreq[+c]++; });
    });
    const topDigit = digitFreq.indexOf(Math.max(...digitFreq));

    return {
      draws: monthDraws,
      freq: freqArr,
      grouped,
      years,
      totalDraws: monthDraws.length,
      topTwoDigit: freqArr[0],
      topDigit,
    };
  }, [selectedMonth, filteredDraws]);

  return (
    <div className="space-y-8">

      {/* ─── Month Picker ─── */}
      <div className="bg-[#0d0e1c]/80 backdrop-blur-md border border-white/[0.06] shadow-xl rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#d4af37]/12">
            <span className="material-symbols-outlined text-[18px] text-[#ffd700]">calendar_month</span>
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white font-sans">ເລືອກເດືອນທີ່ຕ້ອງການວິເຄາະ</h2>
            <p className="text-[11px] text-white/40 font-sans">ສະແດງຜົນຫວຍທຸກປີ ທີ່ອອກໃນເດືອນດຽວກັນ</p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {LAO_MONTHS.map((name, i) => {
            const m = i + 1;
            const isSelected = selectedMonth === m;
            // Count draws in this month
            const cnt = filteredDraws?.filter(d =>
              d.status === 'published' && new Date(d.draw_date).getMonth() + 1 === m
            ).length ?? 0;

            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(isSelected ? null : m)}
                className={`relative flex flex-col items-center gap-1 px-2 py-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5
                  ${isSelected
                    ? 'border-[#d4af37] bg-[#d4af37]/12 shadow-[0_4px_16px_rgba(212,175,55,0.15)]'
                    : 'border-white/[0.08] bg-[#0d0e1c]/40 hover:bg-[#0d0e1c]/60 hover:border-[#d4af37]/35'
                  }`}
              >
                <span className={`text-xs font-black font-mono ${isSelected ? 'text-[#ffd700]' : 'text-white/40'}`}>
                  {String(m).padStart(2, '0')}
                </span>
                <span className={`text-[11px] font-bold leading-tight ${isSelected ? 'text-[#ffd700]' : 'text-white/70'}`}>
                  {name}
                </span>
                {cnt > 0 && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-[#d4af37]/22 text-[#ffd700]' : 'bg-white/[0.06] text-white/40'
                  }`}>
                    {cnt}ງ
                  </span>
                )}
                {isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center shadow-sm bg-[#d4af37]">
                    <span className="material-symbols-outlined text-[#0d0e1c] text-[10px] font-black">check</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Idle State ─── */}
      {!selectedMonth && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0d0e1c] to-[#161b36] border border-white/[0.06] flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-[28px] text-[#ffd700]">calendar_month</span>
          </div>
          <div className="text-center">
            <p className="font-bold text-white/80 mb-1">ເລືອກເດືອນ</p>
            <p className="text-xs text-white/40 font-sans">ກົດເດືອນດ້ານເທິງ ເພື່ອເບິ່ງວິເຄາະ</p>
          </div>
        </div>
      )}

      {/* ─── No data ─── */}
      {selectedMonth && analysis?.totalDraws === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1a1010]/60 border border-red-500/[0.15] flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px] text-red-400">search_off</span>
          </div>
          <div className="text-center">
            <p className="font-bold text-white/80 mb-1">ບໍ່ມີຂໍ້ມູນ</p>
            <p className="text-xs text-white/40 font-sans">ຍັງບໍ່ມີຜົນຫວຍໃນເດືອນ{LAO_MONTHS[selectedMonth - 1]}</p>
          </div>
        </div>
      )}

      {/* ─── Results ─── */}
      {selectedMonth && analysis && analysis.totalDraws > 0 && (
        <div className="space-y-6">

          {/* Header banner */}
          <div className="relative rounded-2xl overflow-hidden p-6 sm:p-7 bg-gradient-to-br from-[#0d0e1c] to-[#161b36] border border-[#d4af37]/25 shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.08),transparent_60%)] pointer-events-none" />
            <div className="absolute right-4 bottom-0 text-[6rem] font-black text-[#d4af37]/[0.03] leading-none select-none">
              {String(selectedMonth).padStart(2, '0')}
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[#ffd700] text-[10px] font-black uppercase tracking-widest mb-1 font-mono">ວິເຄາະເດືອນ</p>
                <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#ffd700] via-[#e5c158] to-[#aa7c11] bg-clip-text text-transparent">
                  {LAO_MONTHS[selectedMonth - 1]}
                </h2>
                <p className="text-white/40 text-xs mt-1 font-sans">
                  ຈາກ {analysis.years[analysis.years.length - 1]} – {analysis.years[0]} ({analysis.years.length} ປີ)
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: 'ງວດທັງໝົດ', value: `${analysis.totalDraws} ງວດ` },
                  { label: 'ເລກດັງ', value: analysis.topTwoDigit?.number ?? '-' },
                  { label: 'ຄວາມຖີ່', value: analysis.topTwoDigit ? `${analysis.topTwoDigit.pct}%` : '-' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#d4af37]/05 backdrop-blur-sm border border-[#d4af37]/15 rounded-xl px-4 py-2.5 text-center min-w-[80px] shadow-sm">
                    <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider mb-0.5 font-sans">{label}</p>
                    <p className="text-lg font-black text-[#ffd700] font-mono">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main grid: Frequency + Year list */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Left: Frequency chart */}
            <div className="lg:col-span-2 space-y-4">

              {/* Top 2-digit frequency */}
              <div className="bg-[#0d0e1c]/80 backdrop-blur-md border border-white/[0.06] shadow-xl rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-[#d4af37]/12">
                    <span className="material-symbols-outlined text-[13px] text-[#ffd700]">bar_chart</span>
                  </span>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-wider font-sans">
                    ຄວາມຖີ່ 2 ຕົວ (Top 10)
                  </p>
                </div>

                {analysis.freq.length === 0
                  ? <p className="text-xs text-white/30 text-center py-4 font-sans">ບໍ່ມີຂໍ້ມູນ 2 ຕົວ</p>
                  : (
                    <div className="space-y-3">
                      {analysis.freq.slice(0, 10).map(({ number, count, pct }, i) => {
                        const maxCount = analysis.freq[0].count;
                        const barW = Math.round((count / maxCount) * 100);
                        const isTop = i === 0;
                        return (
                          <div key={number} className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-md transition-all font-mono
                                ${isTop 
                                  ? 'bg-gradient-to-br from-[#ffd700] via-[#e5c158] to-[#aa7c11] text-[#060410]' 
                                  : 'bg-[#16172b] border border-white/[0.06] text-white/90'}`}
                            >
                              {number}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-bold text-white/80 font-sans">
                                  {count} ງວດ
                                </span>
                                <span className="text-[10px] font-black text-[#ffd700] font-mono">{pct}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{ 
                                    width: `${barW}%`, 
                                    background: isTop 
                                      ? 'linear-gradient(90deg, #ffd700, #d4af37)' 
                                      : 'rgba(212,175,55,0.6)' 
                                  }}
                                />
                              </div>
                            </div>
                            {isTop && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#d4af37]/20 border border-[#d4af37]/35 text-[#ffd700] shrink-0 font-sans">
                                TOP
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )
                }
              </div>

              {/* All 2-digit heat map mini */}
              {analysis.freq.length > 0 && (
                <div className="bg-[#0d0e1c]/80 backdrop-blur-md border border-white/[0.06] shadow-xl rounded-2xl p-5">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-3 font-sans">
                    ເລກທີ່ເຄີຍອອກ ({analysis.freq.length} ຕົວ)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.freq.map(({ number, count }) => {
                      const maxCount = analysis.freq[0].count;
                      const intensity = count / maxCount;
                      
                      let cellClass = "";
                      
                      if (intensity > 0.7) {
                        cellClass = "bg-gradient-to-br from-[#ffd700] via-[#e5c158] to-[#aa7c11] text-[#060410] shadow-[0_2px_8px_rgba(255,215,0,0.2)]";
                      } else if (intensity > 0.4) {
                        cellClass = "bg-[#d4af37]/45 border border-[#d4af37]/40 text-white";
                      } else {
                        cellClass = "bg-[#d4af37]/12 border border-[#d4af37]/20 text-[#ffd700]/80";
                      }

                      return (
                        <div
                          key={number}
                          title={`${number}: ${count} ງວດ`}
                          className={`${cellClass} w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black transition-all hover:scale-115 hover:z-10 cursor-default border font-mono`}
                        >
                          {number}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Year-by-year draws */}
            <div className="lg:col-span-3 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {analysis.years.map(yr => (
                <div key={yr} className="bg-[#0d0e1c]/80 backdrop-blur-md border border-white/[0.06] shadow-xl rounded-2xl overflow-hidden">
                  {/* Year header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] bg-gradient-to-r from-[#d4af37]/05 to-transparent">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-md bg-gradient-to-br from-[#ffd700] via-[#e5c158] to-[#aa7c11]">
                        <span className="text-[#0d0e1c] text-[10px] font-black font-mono">{String(yr).slice(-2)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-white font-sans">ປີ {yr}</p>
                        <p className="text-[10px] text-white/40 font-sans">
                          {LAO_MONTHS[selectedMonth - 1]} {yr}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full border bg-[#d4af37]/12 text-[#ffd700] border-[#d4af37]/25 shadow-sm font-sans">
                      {analysis.grouped[yr].length} ງວດ
                    </span>
                  </div>

                  {/* Draws in this year-month */}
                  <div className="divide-y divide-white/[0.04]">
                    {analysis.grouped[yr].map((d) => {
                      const det = d.results_detail?.find(r => r.prize_type === '2_digits');
                      const twoDigit = det?.result_value;
                      return (
                        <div key={d.draw_id}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                          {/* Draw number badge */}
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-black bg-[#d4af37]/12 text-[#ffd700] border border-[#d4af37]/15 font-mono">
                            {d.draw_number}
                          </div>

                          {/* Date */}
                          <div className="shrink-0 w-28 hidden sm:block">
                            <p className="text-xs font-bold text-white/90 leading-tight font-sans">
                              {formatLaoDate(d.draw_date, true)}
                            </p>
                            <p className="text-[10px] text-white/40 font-mono">{d.draw_date}</p>
                          </div>
                          <div className="shrink-0 sm:hidden">
                            <p className="text-[10px] text-white/40 font-mono">{d.draw_date}</p>
                          </div>

                          {/* Result digits */}
                          <div className="flex-1 flex justify-start sm:justify-center">
                            <DigitRow result={d.full_result} size="sm" />
                          </div>

                          {/* 2-digit highlight */}
                          {twoDigit && (
                            <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-md bg-gradient-to-br from-[#ffd700] via-[#e5c158] to-[#aa7c11] text-[#0d0e1c] border border-[#ffd700]/20 font-mono">
                              {twoDigit}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}