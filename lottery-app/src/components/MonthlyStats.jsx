import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { formatLaoDate } from '../utils/date';

const LAO_MONTHS = [
  'ມັງກອນ','ກຸມພາ','ມີນາ','ເມສາ',
  'ພຶດສະພາ','ມິຖຸນາ','ກໍລະກົດ','ສິງຫາ',
  'ກັນຍາ','ຕຸລາ','ພະຈິກ','ທັນວາ',
];

const MONTH_ACCENT = [
  '#0369a1','#7c3aed','#006c49','#d97706',
  '#be185d','#0891b2','#dc2626','#b45309',
  '#374151','#6d28d9','#065f46','#1e40af',
];

function DigitRow({ result, size = 'sm' }) {
  if (!result) return null;
  const padded = result.padEnd(6, '·');
  const groups = [padded.slice(0, 2), padded.slice(2, 4), padded.slice(4, 6)];
  const box = size === 'sm'
    ? 'w-6 h-7 rounded-md text-xs'
    : 'w-7 h-8 rounded-lg text-sm';
  return (
    <div className="flex items-center gap-1">
      {groups.map((grp, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {grp.split('').map((ch, ci) => (
            <div key={ci} className={`${box} flex items-center justify-center font-black
              ${/\d/.test(ch)
                ? 'bg-gradient-to-br from-[#003fb1] to-[#1a56db] text-white shadow-sm'
                : 'bg-[#e8edf8] dark:bg-[#2b3a54] text-[#c3c5d7]'}`}>
              {ch}
            </div>
          ))}
          {gi < 2 && <span className="text-[#c3c5d7] font-black text-[9px] mx-0.5">·</span>}
        </div>
      ))}
    </div>
  );
}

export default function MonthlyStats() {
  const { draws } = useData();
  const [selectedMonth, setSelectedMonth] = useState(null); // 1–12

  // ── Compute stats for selected month ──
  const analysis = useMemo(() => {
    if (!selectedMonth || !draws?.length) return null;

    const monthDraws = draws
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
  }, [selectedMonth, draws]);

  const accent = selectedMonth ? MONTH_ACCENT[selectedMonth - 1] : '#003fb1';
  const accentLight = `${accent}18`;

  return (
    <div className="space-y-8">

      {/* ─── Month Picker ─── */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: accentLight }}>
            <span className="material-symbols-outlined text-[18px]" style={{ color: accent }}>calendar_month</span>
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-foreground">ເລືອກເດືອນທີ່ຕ້ອງການວິເຄາະ</h2>
            <p className="text-[11px] text-muted-foreground">ສະແດງຜົນຫວຍທຸກປີ ທີ່ອອກໃນເດືອນດຽວກັນ</p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {LAO_MONTHS.map((name, i) => {
            const m = i + 1;
            const ac = MONTH_ACCENT[i];
            const isSelected = selectedMonth === m;
            // Count draws in this month
            const cnt = draws?.filter(d =>
              d.status === 'published' && new Date(d.draw_date).getMonth() + 1 === m
            ).length ?? 0;

            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(isSelected ? null : m)}
                className={`relative flex flex-col items-center gap-1 px-2 py-3 rounded-xl border-2 text-center transition-all duration-200 hover:-translate-y-0.5
                  ${isSelected
                    ? 'shadow-md'
                    : 'border-border bg-[#f5f7ff] dark:bg-[#1a2844] hover:border-opacity-60'
                  }`}
                style={isSelected
                  ? { borderColor: ac, background: `${ac}14`, boxShadow: `0 4px 12px ${ac}30` }
                  : {}
                }
              >
                <span className="text-xs font-black" style={isSelected ? { color: ac } : {}}>
                  {String(m).padStart(2, '0')}
                </span>
                <span className={`text-[11px] font-bold leading-tight ${isSelected ? '' : 'text-muted-foreground'}`}
                  style={isSelected ? { color: ac } : {}}>
                  {name}
                </span>
                {cnt > 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: isSelected ? `${ac}22` : '#e8edf8', color: isSelected ? ac : '#a0a3bd' }}>
                    {cnt}ງ
                  </span>
                )}
                {isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
                    style={{ background: ac }}>
                    <span className="material-symbols-outlined text-white text-[11px]">check</span>
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#eff3ff] to-[#e0e7ff] dark:from-[#1e2d4a] dark:to-[#162440] flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[28px] text-[#003fb1]">calendar_month</span>
          </div>
          <div className="text-center">
            <p className="font-bold text-muted-foreground mb-1">ເລືອກເດືອນ</p>
            <p className="text-xs text-[#a0a3bd] dark:text-[#555870]">ກົດເດືອນດ້ານເທິງ ເພື່ອເບິ່ງວິເຄາະ</p>
          </div>
        </div>
      )}

      {/* ─── No data ─── */}
      {selectedMonth && analysis?.totalDraws === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#fff4f4] dark:bg-[#2a1010] flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px] text-[#ba1a1a]">search_off</span>
          </div>
          <div className="text-center">
            <p className="font-bold text-muted-foreground mb-1">ບໍ່ມີຂໍ້ມູນ</p>
            <p className="text-xs text-[#a0a3bd] dark:text-[#555870]">ຍັງບໍ່ມີຜົນຫວຍໃນເດືອນ{LAO_MONTHS[selectedMonth - 1]}</p>
          </div>
        </div>
      )}

      {/* ─── Results ─── */}
      {selectedMonth && analysis && analysis.totalDraws > 0 && (
        <div className="space-y-6">

          {/* Header banner */}
          <div className="relative rounded-2xl overflow-hidden p-6 sm:p-7">
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}ee, ${accent}99)` }} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
            <div className="absolute right-3 bottom-1 text-[5rem] font-black text-white/[0.06] leading-none select-none">
              {String(selectedMonth).padStart(2, '0')}
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mb-1">ວິເຄາະເດືອນ</p>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{LAO_MONTHS[selectedMonth - 1]}</h2>
                <p className="text-white/60 text-xs mt-1">
                  ຈາກ {analysis.years[analysis.years.length - 1]} – {analysis.years[0]} ({analysis.years.length} ປີ)
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: 'ງວດທັງໝົດ', value: analysis.totalDraws },
                  { label: 'ເລກດັງ', value: analysis.topTwoDigit?.number ?? '-' },
                  { label: 'ຄວາມຖີ່', value: analysis.topTwoDigit ? `${analysis.topTwoDigit.pct}%` : '-' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 text-center min-w-[70px]">
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-xl font-black text-white">{value}</p>
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
              <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: accentLight }}>
                    <span className="material-symbols-outlined text-[13px]" style={{ color: accent }}>bar_chart</span>
                  </span>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    ຄວາມຖີ່ 2 ຕົວ (Top 10)
                  </p>
                </div>

                {analysis.freq.length === 0
                  ? <p className="text-xs text-[#a0a3bd] text-center py-4">ບໍ່ມີຂໍ້ມູນ 2 ຕົວ</p>
                  : (
                    <div className="space-y-2.5">
                      {analysis.freq.slice(0, 10).map(({ number, count, pct }, i) => {
                        const maxCount = analysis.freq[0].count;
                        const barW = Math.round((count / maxCount) * 100);
                        const isTop = i === 0;
                        return (
                          <div key={number} className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm
                                ${isTop ? 'text-white' : 'text-white'}`}
                              style={{ background: isTop ? accent : `${accent}99` }}
                            >
                              {number}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-bold text-foreground">
                                  {count} ງວດ
                                </span>
                                <span className="text-[10px] font-bold" style={{ color: accent }}>{pct}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-[#e8edf8] dark:bg-[#2b3a54] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{ width: `${barW}%`, background: accent }}
                                />
                              </div>
                            </div>
                            {isTop && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md text-white shrink-0"
                                style={{ background: accent }}>🔥</span>
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
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    ເລກທີ່ເຄີຍອອກ ({analysis.freq.length} ຕົວ)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.freq.map(({ number, count }) => {
                      const maxCount = analysis.freq[0].count;
                      const intensity = count / maxCount;
                      return (
                        <div
                          key={number}
                          title={`${number}: ${count} ງວດ`}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black transition-all hover:scale-110 cursor-default shadow-sm"
                          style={{
                            background: intensity > 0.7 ? accent : intensity > 0.4 ? `${accent}99` : `${accent}44`,
                            color: intensity > 0.4 ? 'white' : accent,
                          }}
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
                <div key={yr} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                  {/* Year header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-[#f0f4ff] dark:border-[#1e2d4a]"
                    style={{ background: `${accent}0d` }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm" style={{ background: accent }}>
                        <span className="text-white text-[10px] font-black">{String(yr).slice(-2)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-foreground">ປີ {yr}</p>
                        <p className="text-[10px]" style={{ color: accent }}>
                          {LAO_MONTHS[selectedMonth - 1]} {yr}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                      style={{ background: `${accent}14`, color: accent, borderColor: `${accent}30` }}>
                      {analysis.grouped[yr].length} ງວດ
                    </span>
                  </div>

                  {/* Draws in this year-month */}
                  <div className="divide-y divide-[#f5f7ff] dark:divide-[#1e2d4a]">
                    {analysis.grouped[yr].map((d, idx) => {
                      const det = d.results_detail?.find(r => r.prize_type === '2_digits');
                      const twoDigit = det?.result_value;
                      return (
                        <div key={d.draw_id}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-[#f8faff] dark:hover:bg-[#1a2844] transition-colors">
                          {/* Draw number badge */}
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-black"
                            style={{ background: `${accent}14`, color: accent }}>
                            {d.draw_number}
                          </div>

                          {/* Date */}
                          <div className="shrink-0 w-28 hidden sm:block">
                            <p className="text-xs font-bold text-foreground leading-tight">
                              {formatLaoDate(d.draw_date, true)}
                            </p>
                            <p className="text-[10px] text-[#a0a3bd]">{d.draw_date}</p>
                          </div>
                          <div className="shrink-0 sm:hidden">
                            <p className="text-[10px] text-[#a0a3bd]">{d.draw_date}</p>
                          </div>

                          {/* Result digits */}
                          <div className="flex-1 flex justify-start sm:justify-center">
                            <DigitRow result={d.full_result} size="sm" />
                          </div>

                          {/* 2-digit highlight */}
                          {twoDigit && (
                            <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-sm"
                              style={{ background: accent, color: 'white' }}>
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