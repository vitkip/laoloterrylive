import { useMemo, useRef, useState, useCallback, forwardRef } from 'react';
import { toPng } from 'html-to-image';
import { useData } from '../context/DataContext';

/* ── Day palette ─────────────────────────────────────────────────── */
const DAY_CONFIG = {
  0: { label: 'ວັນອາທິດ',  short: 'ອາ',  accent: '#dc2626' },
  1: { label: 'ວັນຈັນ',    short: 'ຈັນ', accent: '#003fb1' },
  2: { label: 'ວັນອັງຄານ', short: 'ອັງ', accent: '#0d7377' },
  3: { label: 'ວັນພຸດ',    short: 'ພຸດ', accent: '#6750a4' },
  4: { label: 'ວັນພະຫັດ',  short: 'ພ',   accent: '#b45309' },
  5: { label: 'ວັນສຸກ',    short: 'ສຸກ', accent: '#ba1a1a' },
  6: { label: 'ວັນເສົາ',   short: 'ສ',   accent: '#64748b' },
};

/* ── Timeframe filter — relative to latest draw, not current date ── */
function applyTimeframe(draws, timeframe) {
  if (timeframe === 'all' || !draws.length) return draws;

  const sorted = [...draws].sort((a, b) => new Date(b.draw_date) - new Date(a.draw_date));
  const latestDate = new Date(sorted[0].draw_date);
  const cutoff = new Date(latestDate);

  if (timeframe === '1_month')       cutoff.setMonth(cutoff.getMonth() - 1);
  else if (timeframe === '3_months') cutoff.setMonth(cutoff.getMonth() - 3);
  else if (timeframe === '1_year')   cutoff.setFullYear(cutoff.getFullYear() - 1);
  else return draws;

  return draws.filter(d => new Date(d.draw_date) >= cutoff);
}

/* ── Timeframe label ─────────────────────────────────────────────── */
const TIMEFRAME_LABELS = {
  '1_month':  '1 ເດືອນ',
  '3_months': '3 ເດືອນ',
  '1_year':   '1 ປີ',
  'all':      'ທັງໝົດ',
};

/* ── Grid class lookup — Tailwind needs full class strings at build ─ */
const GRID_CLASS_MAP = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-6',
  7: 'grid-cols-1 sm:grid-cols-4 lg:grid-cols-7',
};


/* ══════════════════════════════════════════════════════════════════
   ShareCaptureCard — rendered off-screen, captured to PNG
   ══════════════════════════════════════════════════════════════════ */

const ShareCaptureCard = forwardRef(function ShareCaptureCard(
  { spotlight, spotlightConf, typeName, timeframe },
  ref,
) {
  if (!spotlight || !spotlightConf) return null;

  const tfLabel = TIMEFRAME_LABELS[timeframe] || timeframe;
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
  const accent = spotlightConf.accent;

  return (
    <div
      ref={ref}
      style={{
        width: '650px',
        backgroundColor: '#f8fafc',
        fontFamily: "'Noto Sans Lao', 'Phetsarath OT', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── Header ── */}
      <div style={{
        background: `linear-gradient(135deg, ${accent}f0 0%, ${accent}c0 100%)`,
        padding: '24px 30px',
        textAlign: 'center',
        color: '#fff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        position: 'relative',
      }}>
        {/* Subtle decorative circle */}
        <div style={{
          position: 'absolute',
          right: '-20px',
          top: '-20px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.95 }}>
            <path d="M6 3h12l4 6-10 13L2 9Z" />
            <path d="M11 3 8 9l4 13 4-13-3-6" />
            <path d="M2 9h20" />
          </svg>
          <span style={{ fontSize: '24px', fontWeight: 900, fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}>LAOLOTS.COM</span>
        </div>
        <div style={{
          display: 'inline-block',
          background: 'rgba(255,255,255,0.2)',
          padding: '6px 20px',
          borderRadius: '999px',
          fontSize: '16px',
          fontWeight: 700,
          border: '1px solid rgba(255,255,255,0.25)',
        }}>
          ສະຖິຕິຕາມມື້ອອກຫວຍ · {typeName}
        </div>
      </div>

      {/* ── Metadata Banner ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 30px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
            ຊ່ວງເວລາວິເຄາະ
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{tfLabel}</div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: `${accent}10`,
          padding: '6px 14px',
          borderRadius: '12px',
          border: `1px solid ${accent}25`,
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: accent,
            display: 'inline-block',
          }} />
          <span style={{ fontSize: '15px', fontWeight: 800, color: accent }}>
            {spotlightConf.label}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, marginBottom: '2px' }}>ວັນທີແຊຣ໌</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{dateStr}</div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        
        {/* Draw count summary */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#334155' }}>
            ຈຳນວນງວດທີ່ອອກຫວຍໃນ {spotlightConf.label}
          </span>
          <span style={{
            fontSize: '18px',
            fontWeight: 900,
            color: accent,
            background: `${accent}15`,
            padding: '4px 14px',
            borderRadius: '10px',
          }}>
            {spotlight.totalDraws} ງວດ
          </span>
        </div>

        {/* Top Numbers Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}>
          <div style={{
            fontSize: '15px',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '10px',
          }}>
            <span style={{ fontSize: '18px' }}>🎯</span>
            ເລກ 2 ຕົວທ້າຍ ທີ່ມັກອອກຫຼາຍທີ່ສຸດ
          </div>

          {/* Chips grid */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'space-between' }}>
            {spotlight.topNums.length > 0 ? spotlight.topNums.map(([num, count], i) => {
              return (
                <div
                  key={num}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: '16px',
                    padding: '12px 10px',
                    width: '18%',
                    border: `1px solid ${i === 0 ? accent : '#e2e8f0'}`,
                    background: i === 0 ? `linear-gradient(135deg, ${accent}15 0%, ${accent}05 100%)` : '#f8fafc',
                    boxShadow: i === 0 ? `0 4px 12px ${accent}10` : 'none',
                  }}
                >
                  <span style={{
                    fontSize: '26px',
                    fontWeight: 900,
                    fontFamily: "'Inter', monospace",
                    color: i === 0 ? accent : '#0f172a',
                    lineHeight: 1.1,
                  }}>{num}</span>
                  <span style={{
                    fontSize: '11px',
                    color: i === 0 ? accent : '#64748b',
                    fontWeight: 700,
                    marginTop: '6px',
                    background: i === 0 ? `${accent}20` : '#e2e8f0',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}>{count} ຄັ້ງ</span>
                </div>
              );
            }) : (
              <span style={{ fontSize: '14px', color: '#64748b', width: '100%', textAlign: 'center', padding: '12px 0' }}>ບໍ່ມີຂໍ້ມູນ</span>
            )}
          </div>

          {/* Bars chart */}
          {spotlight.topNums.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {spotlight.topNums.map(([num, count], i) => {
                const pct = Math.round((count / spotlight.maxCount) * 100);
                return (
                  <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: i === 0 ? accent : '#475569',
                      width: '24px',
                      fontFamily: "'Inter', monospace",
                      textAlign: 'right',
                    }}>{num}</span>
                    <div style={{
                      flex: 1,
                      height: '10px',
                      background: '#f1f5f9',
                      borderRadius: '5px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        borderRadius: '5px',
                        width: `${pct}%`,
                        backgroundColor: i === 0 ? accent : `${accent}80`,
                      }} />
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: i === 0 ? accent : '#475569',
                      width: '45px',
                      textAlign: 'right',
                    }}>{count} ຄັ້ງ</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Animals Card */}
        {spotlight.topAnimals.length > 0 && (
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}>
            <div style={{
              fontSize: '15px',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '10px',
            }}>
              <span style={{ fontSize: '18px' }}>🐾</span>
              ນາມສັດຍອດນິຍົມ
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {spotlight.topAnimals.map((item, i) => (
                <div
                  key={item.animal?.animal_id ?? i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: `1px solid ${i === 0 ? `${accent}30` : '#f1f5f9'}`,
                    background: i === 0 ? `${accent}05` : '#f8fafc',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px', lineHeight: 1 }}>{item.animal?.icon}</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                        {item.animal?.animal_name_lao}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontFamily: "'Inter', monospace" }}>
                        {item.animal?.numbers?.join(', ')}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: i === 0 ? accent : '#475569',
                    background: i === 0 ? `${accent}15` : '#e2e8f0',
                    padding: '4px 10px',
                    borderRadius: '8px',
                  }}>{item.count} ຄັ້ງ</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Footer ── */}
      <div style={{
        background: '#0f172a',
        textAlign: 'center',
        padding: '16px',
        color: '#94a3b8',
        fontSize: '13px',
        fontWeight: 700,
        letterSpacing: '0.05em',
        borderTop: `3px solid ${accent}`,
      }}>
        laolots.com — ສູນລວມຜົນຫວຍ ແລະ ສະຖິຕິຫວຍລາວອອນລາຍ
      </div>
    </div>
  );
});


/* ══════════════════════════════════════════════════════════════════
   WeekdayStats — Main Component
   ══════════════════════════════════════════════════════════════════ */

export default function WeekdayStats({ timeframe, typeId }) {
  const { draws, animals, types } = useData();
  const captureRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null); // Add state for user selected day

  // Active lottery type name for share card
  const activeType = types?.find(t => String(t.type_id) === String(typeId));
  const typeName = activeType?.type_name ?? 'ລາວ';

  // Which draw day is "today"
  const todayJS = new Date().getDay(); // 0=Sun … 6=Sat

  const { allStats, drawDays, spotlightDay } = useMemo(() => {
    // ── Step 1: Filter by type ──
    let targetDraws = !typeId || typeId === 'all'
      ? draws
      : draws.filter(d => String(d.type_id) === String(typeId));

    // Only published draws
    const published = targetDraws.filter(d => d.status === 'published');

    // ── Step 2: Apply timeframe ──
    const base = applyTimeframe(published, timeframe);

    if (!base.length) {
      return { allStats: [], drawDays: [], spotlightDay: 1 };
    }

    // ── Step 3: Detect which weekdays actually have draws ──
    const daySet = new Set();
    base.forEach(d => daySet.add(new Date(d.draw_date).getDay()));

    // Sort weekdays: Mon-Sat then Sun at end
    const detectedDays = [...daySet].sort((a, b) => {
      const aSort = a === 0 ? 7 : a;
      const bSort = b === 0 ? 7 : b;
      return aSort - bSort;
    });

    // Build draw-day configs
    const drawDaysArr = detectedDays.map(day => ({
      day,
      ...(DAY_CONFIG[day] || { label: `ວັນ ${day}`, short: `${day}`, accent: '#64748b' }),
    }));

    // ── Step 4: Compute stats per day ──
    const stats = drawDaysArr.map(({ day }) => {
      const dayDraws = base.filter(d => new Date(d.draw_date).getDay() === day);

      const twoDigitCount = {};
      const animalCount = {};

      dayDraws.forEach(draw => {
        const td = draw.results_detail?.find(r => r.prize_type === '2_digits');
        if (!td) return;
        const val = td.result_value;
        if (val != null) {
          twoDigitCount[val] = (twoDigitCount[val] || 0) + 1;
        }
        if (td.animal_id) {
          animalCount[td.animal_id] = (animalCount[td.animal_id] || 0) + 1;
        }
      });

      const topNums = Object.entries(twoDigitCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const topAnimals = Object.entries(animalCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id, count]) => ({
          animal: animals.find(a => String(a.animal_id) === String(id)),
          count,
        }));

      return {
        day,
        totalDraws: dayDraws.length,
        topNums,
        topAnimals,
        maxCount: topNums[0]?.[1] || 1,
      };
    });

    // ── Spotlight: today if it's a draw day, else next upcoming ──
    const isDrawDay = detectedDays.includes(todayJS);
    let spotlight;
    if (isDrawDay) {
      spotlight = todayJS;
    } else {
      // Find next draw day after today (wrap around)
      const sorted = [...detectedDays].sort((a, b) => a - b);
      const next = sorted.find(d => d > todayJS) ?? sorted[0] ?? 1;
      spotlight = next;
    }

    return { allStats: stats, drawDays: drawDaysArr, spotlightDay: spotlight };
  }, [draws, animals, timeframe, typeId, todayJS]);

  // Determine which day is currently active (user selected or default spotlight)
  const activeDay = useMemo(() => {
    const isDayValid = drawDays.some(d => d.day === selectedDay);
    return isDayValid ? selectedDay : spotlightDay;
  }, [selectedDay, drawDays, spotlightDay]);

  const isActualDrawDay = drawDays.some(d => d.day === todayJS) && activeDay === todayJS;
  const spotlight = allStats.find(s => s.day === activeDay) || allStats[0];
  const spotlightConf = drawDays.find(d => d.day === activeDay) || drawDays[0];

  // Grid class from map (Tailwind-safe)
  const gridCols = GRID_CLASS_MAP[drawDays.length] || 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-5';

  /* ── Share as image — tries Web Share API first, then download ── */
  const handleShare = useCallback(async () => {
    if (!captureRef.current) return;
    try {
      setIsGenerating(true);
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        quality: 1.0,
        pixelRatio: 2,
        skipFonts: true,
        backgroundColor: '#ffffff',
      });

      const dayLabel = spotlightConf?.label || 'day';
      const fileName = `weekday-stats-${typeName}-${dayLabel}-${TIMEFRAME_LABELS[timeframe] || timeframe}.png`;

      // Try native share first (mobile)
      if (navigator.share && navigator.canShare) {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], fileName, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `ສະຖິຕິ ${dayLabel} · ${typeName}`,
              text: `ສະຖິຕິຫວຍອອກ ${dayLabel} ${typeName} (${TIMEFRAME_LABELS[timeframe] || timeframe}) — laolots.com`,
              files: [file],
            });
            return; // shared successfully
          }
        } catch (shareErr) {
          // User cancelled or share failed — fall through to download
          if (shareErr.name === 'AbortError') return;
        }
      }

      // Fallback: direct download
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch {
      alert('ການສ້າງຮູບພາບມີບັນຫາ, ກະລຸນາລອງໃໝ່.');
    } finally {
      setIsGenerating(false);
    }
  }, [typeName, timeframe, spotlightConf]);

  /* ── Empty state ── */
  if (!spotlight || !spotlightConf || allStats.length === 0) {
    return (
      <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-sm border border-border text-center text-muted-foreground py-12">
        <span className="material-symbols-outlined text-4xl mb-2 block opacity-40">calendar_month</span>
        <p className="font-bold">ບໍ່ມີຂໍ້ມູນສະຖິຕິຕາມມື້ ສຳລັບຕົວກອງນີ້</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-sm border border-border space-y-6 relative">

      {/* ── Off-screen capture element for share image ── */}
      <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', zIndex: -1 }}>
        <ShareCaptureCard
          ref={captureRef}
          spotlight={spotlight}
          spotlightConf={spotlightConf}
          typeName={typeName}
          timeframe={timeframe}
        />
      </div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003fb1]">calendar_month</span>
            ສະຖິຕິຕາມມື້ອອກຫວຍ
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            ຄລິກເລືອກມື້ເພື່ອເບິ່ງສະຖິຕິ ແລະ ແຊຣ໌ຮູບພາບສະເພາະມື້ນັ້ນ
          </p>
        </div>
        {/* Share button */}
        <button
          onClick={handleShare}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border border-border bg-secondary/80 hover:bg-secondary text-foreground transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 shrink-0"
        >
          {isGenerating ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              ກຳລັງສ້າງຮູບ...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">share</span>
              ແຊຣ໌ວັນນີ້ເປັນຮູບ
            </>
          )}
        </button>
      </div>

      {/* ── Today / Next-draw Spotlight ── */}
      <div
        className="rounded-2xl p-5 sm:p-6 text-white transition-all duration-300"
        style={{ background: `linear-gradient(135deg, ${spotlightConf.accent}f0 0%, ${spotlightConf.accent}99 100%)` }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-white/80" style={{ fontVariationSettings: "'FILL' 1" }}>today</span>
          <span className="font-black text-base sm:text-lg">
            {spotlightConf.label} — ທັງໝົດ {spotlight.totalDraws} ງວດ
          </span>
          { (isActualDrawDay || activeDay === spotlightDay) && (
            <span className={`ml-auto text-[11px] font-bold px-3 py-1 rounded-full border shrink-0 ${
              isActualDrawDay
                ? 'bg-white/25 border-white/50 text-white'
                : 'bg-white/10 border-white/20 text-white/70'
            }`}>
              {isActualDrawDay ? '● ມື້ນີ້' : 'ງວດຕໍ່ໄປ'}
            </span>
          )}
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

      {/* ── All Days Grid ── */}
      <div className={`grid ${gridCols} gap-4`}>
        {drawDays.map((conf) => {
          const stat = allStats.find(s => s.day === conf.day);
          const isActive = conf.day === activeDay;
          if (!stat) return null;

          return (
            <div
              key={conf.day}
              onClick={() => setSelectedDay(conf.day)}
              className={`rounded-2xl p-4 border text-left w-full transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98] select-none ${
                isActive ? 'border-2' : 'bg-secondary/50 border-border hover:bg-secondary/80'
              }`}
              style={isActive ? {
                borderColor: conf.accent,
                backgroundColor: `${conf.accent}0a`,
                boxShadow: `0 4px 12px -2px ${conf.accent}15`
              } : undefined}
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
                  {isActualDrawDay && isActive && (
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
