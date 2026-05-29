import { useMemo } from 'react';
import { useData } from '../context/DataContext';

const DRAW_DAYS = [
  { day: 1, label: 'ວັນຈັນ',    short: 'ຈັນ', accent: '#003fb1' },
  { day: 2, label: 'ວັນອັງຄານ', short: 'ອ',   accent: '#0d7377' },
  { day: 3, label: 'ວັນພຸດ',    short: 'ພຸດ', accent: '#6750a4' },
  { day: 4, label: 'ວັນພະຫັດ',  short: 'ພ',   accent: '#b45309' },
  { day: 5, label: 'ວັນສຸກ',   short: 'ສຸກ', accent: '#ba1a1a' },
];

function applyTimeframe(draws, timeframe) {
  const now = new Date();
  if (timeframe === '1_month') {
    const p = new Date(); p.setMonth(now.getMonth() - 1);
    return draws.filter(d => new Date(d.draw_date) >= p);
  }
  if (timeframe === '3_months') {
    const p = new Date(); p.setMonth(now.getMonth() - 3);
    return draws.filter(d => new Date(d.draw_date) >= p);
  }
  if (timeframe === '1_year') {
    const p = new Date(); p.setFullYear(now.getFullYear() - 1);
    return draws.filter(d => new Date(d.draw_date) >= p);
  }
  return draws;
}

export default function WeekdayStats({ timeframe }) {
  const { draws, animals } = useData();

  // Which draw day is "today" — or next upcoming draw day
  const todayJS = new Date().getDay(); // 0=Sun … 6=Sat
  const DRAW_DAY_NUMS = [1, 2, 3, 4, 5];
  const isActualDrawDay = DRAW_DAY_NUMS.includes(todayJS);
  // Next upcoming: Sun/Sat → Mon(1)
  const spotlightDay = isActualDrawDay ? todayJS
    : 1; // Sun(0) or Sat(6) → next Mon

  const allStats = useMemo(() => {
    const base = applyTimeframe(
      draws.filter(d => d.status === 'published'),
      timeframe,
    );

    return DRAW_DAYS.map(({ day }) => {
      const dayDraws = base.filter(d => new Date(d.draw_date).getDay() === day);

      const twoDigitCount = {};
      const animalCount = {};

      dayDraws.forEach(draw => {
        const td = draw.results_detail?.find(r => r.prize_type === '2_digits');
        if (!td) return;
        twoDigitCount[td.result_value] = (twoDigitCount[td.result_value] || 0) + 1;
        if (td.animal_id) animalCount[td.animal_id] = (animalCount[td.animal_id] || 0) + 1;
      });

      const topNums = Object.entries(twoDigitCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const topAnimals = Object.entries(animalCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id, count]) => ({ animal: animals.find(a => a.animal_id == id), count }));

      return { day, totalDraws: dayDraws.length, topNums, topAnimals, maxCount: topNums[0]?.[1] || 1 };
    });
  }, [draws, animals, timeframe]);

  const spotlight = allStats.find(s => s.day === spotlightDay) || allStats[0];
  const spotlightConf = DRAW_DAYS.find(d => d.day === spotlightDay) || DRAW_DAYS[0];

  return (
    <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-sm border border-border space-y-6">

      {/* ── Header ── */}
      <div>
        <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
          <span className="material-symbols-outlined text-[#003fb1]">calendar_month</span>
          ສະຖິຕິຕາມມື້ອອກຫວຍ
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          ເລກຫຍັງມັກອອກໃນມື້ນີ້? · ສະແດງທຸກມື້ ຈັນ ພຸດ ສຸກ
        </p>
      </div>

      {/* ── Today / Next-draw Spotlight ── */}
      <div
        className="rounded-2xl p-5 sm:p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${spotlightConf.accent}f0 0%, ${spotlightConf.accent}99 100%)` }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-white/80" style={{ fontVariationSettings: "'FILL' 1" }}>today</span>
          <span className="font-black text-base sm:text-lg">
            {spotlightConf.label} — ທັງໝົດ {spotlight.totalDraws} ງວດ
          </span>
          <span className={`ml-auto text-[11px] font-bold px-3 py-1 rounded-full border shrink-0 ${
            isActualDrawDay
              ? 'bg-white/25 border-white/50 text-white'
              : 'bg-white/10 border-white/20 text-white/70'
          }`}>
            {isActualDrawDay ? '● ມື້ນີ້' : 'ງວດຕໍ່ໄປ'}
          </span>
        </div>

        {/* Top-5 number chips with mini bars */}
        <div className="flex flex-wrap gap-2 mb-4">
          {spotlight.topNums.length > 0 ? spotlight.topNums.map(([num, count], i) => {
            const pct = Math.round((count / spotlight.maxCount) * 100);
            return (
              <div
                key={num}
                className={`flex flex-col items-center rounded-xl px-3 py-2 min-w-[52px] border ${
                  i === 0 ? 'bg-white/25 border-white/50' : 'bg-white/10 border-white/20'
                }`}
              >
                <span className="text-2xl font-black font-mono leading-none">{num}</span>
                <div className="w-full mt-1.5 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white/70 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] text-white/70 mt-0.5">{count} ຄັ້ງ</span>
              </div>
            );
          }) : <p className="text-white/50 text-sm py-2">ບໍ່ມີຂໍ້ມູນ</p>}
        </div>

        {/* Top animals */}
        {spotlight.topAnimals.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-white/60 text-xs">ນາມສັດ:</span>
            {spotlight.topAnimals.map((item, i) => (
              <div
                key={item.animal?.animal_id ?? i}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold ${
                  i === 0 ? 'bg-white/20 border-white/40' : 'bg-white/10 border-white/20'
                }`}
              >
                <span className="text-base">{item.animal?.icon}</span>
                <span>{item.animal?.animal_name_lao}</span>
                <span className="text-white/60 text-[11px] font-normal">{item.count}x</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── All 5 Days Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {DRAW_DAYS.map((conf) => {
          const stat = allStats.find(s => s.day === conf.day);
          const isSpot = conf.day === spotlightDay;
          if (!stat) return null;

          return (
            <div
              key={conf.day}
              className={`rounded-2xl p-4 border ${
                isSpot ? 'border-2' : 'bg-secondary/50 border-border'
              }`}
              style={isSpot ? { borderColor: conf.accent, backgroundColor: `${conf.accent}0d` } : undefined}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0"
                    style={{ backgroundColor: conf.accent }}
                  >
                    {conf.short.charAt(0)}
                  </div>
                  <span className="font-black text-sm text-foreground">{conf.label}</span>
                  {isActualDrawDay && isSpot && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: conf.accent }}
                    >
                      ມື້ນີ້
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{stat.totalDraws} ງວດ</span>
              </div>

              {/* Top-5 number chips */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {stat.topNums.length > 0 ? stat.topNums.map(([num, count], i) => (
                  <div
                    key={num}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-sm ${
                      i === 0 ? 'text-white' : 'bg-card border border-border text-foreground'
                    }`}
                    style={i === 0 ? { backgroundColor: conf.accent } : undefined}
                  >
                    <span className="font-black font-mono">{num}</span>
                    <span className={`text-[9px] ${i === 0 ? 'text-white/70' : 'text-muted-foreground'}`}>{count}x</span>
                  </div>
                )) : (
                  <span className="text-xs text-muted-foreground">ບໍ່ມີຂໍ້ມູນ</span>
                )}
              </div>

              {/* Horizontal bar chart */}
              {stat.topNums.length > 0 && (
                <div className="space-y-1.5">
                  {stat.topNums.map(([num, count], i) => {
                    const pct = Math.round((count / stat.maxCount) * 100);
                    return (
                      <div key={num} className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-muted-foreground w-5 text-right">{num}</span>
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: i === 0 ? conf.accent : `${conf.accent}66`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-4 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Top animal */}
              {stat.topAnimals[0] && (
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
                  <span className="text-lg">{stat.topAnimals[0].animal?.icon}</span>
                  <span className="text-xs font-bold text-foreground truncate">{stat.topAnimals[0].animal?.animal_name_lao}</span>
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">{stat.topAnimals[0].count}x</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}


