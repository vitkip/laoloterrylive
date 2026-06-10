import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';

/* ─── Rank palette for top-4 predictions ───────────────────────── */
const RANK = [
  { bar: '#f59e0b', border: 'rgba(245,158,11,0.28)', bg: 'rgba(245,158,11,0.07)', glow: '0 0 20px rgba(245,158,11,0.16)', lbl: 'rgba(251,191,36,0.90)' },
  { bar: '#60a5fa', border: 'rgba(96,165,250,0.22)',  bg: 'rgba(96,165,250,0.06)',  glow: '0 0 16px rgba(96,165,250,0.10)',  lbl: 'rgba(147,197,253,0.88)' },
  { bar: '#fb923c', border: 'rgba(251,146,60,0.20)',  bg: 'rgba(251,146,60,0.05)',  glow: '0 0 14px rgba(251,146,60,0.09)',  lbl: 'rgba(253,186,116,0.85)' },
  { bar: '#2dd4bf', border: 'rgba(45,212,191,0.18)',  bg: 'rgba(45,212,191,0.04)',  glow: '0 0 12px rgba(45,212,191,0.08)',  lbl: 'rgba(94,234,212,0.82)' },
];

/* ─── Inline styles ─────────────────────────────────────────────── */
const STYLE = `
  /* ── Root ── */
  .ps-root {
    position: relative;
    background: linear-gradient(158deg, #07041a 0%, #0d0624 52%, #060310 100%);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    overflow: hidden;
  }
  .ps-mesh {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.009) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.009) 1px, transparent 1px);
    background-size: 36px 36px;
  }
  .ps-stars {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      radial-gradient(circle 1px at  8% 15%, rgba(255,255,255,0.30) 0%, transparent 1px),
      radial-gradient(circle 1px at 22% 68%, rgba(255,255,255,0.18) 0%, transparent 1px),
      radial-gradient(circle 1px at 48% 26%, rgba(255,255,255,0.22) 0%, transparent 1px),
      radial-gradient(circle 1px at 70% 75%, rgba(255,255,255,0.16) 0%, transparent 1px),
      radial-gradient(circle 1px at 88% 18%, rgba(255,255,255,0.25) 0%, transparent 1px),
      radial-gradient(circle 1px at 94% 88%, rgba(255,255,255,0.20) 0%, transparent 1px),
      radial-gradient(circle 1px at 34% 92%, rgba(255,255,255,0.15) 0%, transparent 1px),
      radial-gradient(circle 1px at 60% 50%, rgba(255,255,255,0.12) 0%, transparent 1px);
  }
  .ps-orb {
    position: absolute; width: 380px; height: 380px; border-radius: 50%;
    top: -140px; right: -100px; pointer-events: none;
    background: radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 68%);
  }
  .ps-orb2 {
    position: absolute; width: 260px; height: 260px; border-radius: 50%;
    bottom: -80px; left: -60px; pointer-events: none;
    background: radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 68%);
  }

  /* ── Header ── */
  .ps-hdr {
    display: flex; align-items: flex-start; gap: 14px;
    margin-bottom: 24px; position: relative; z-index: 10;
  }
  .ps-icon-box {
    width: 46px; height: 46px; border-radius: 15px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #312e81 0%, #4f46e5 55%, #818cf8 100%);
    box-shadow: 0 0 26px rgba(79,70,229,0.55), inset 0 1px 0 rgba(255,255,255,0.20);
  }
  .ps-title {
    font-size: 17px; font-weight: 900; letter-spacing: -0.01em; margin: 0;
    color: rgba(226,232,240,0.90);
  }
  .ps-desc { font-size: 12px; color: rgba(255,255,255,0.30); margin-top: 5px; line-height: 1.5; }

  /* ── Picker panel ── */
  .ps-picker-lbl {
    font-size: 10px; font-weight: 900; letter-spacing: 0.12em;
    text-transform: uppercase; color: rgba(129,140,248,0.52);
    margin-bottom: 10px;
  }
  .ps-picker-box {
    height: 320px; overflow-y: auto; padding: 6px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.018);
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.12) transparent;
  }
  .ps-picker-box::-webkit-scrollbar { width: 4px; }
  .ps-picker-box::-webkit-scrollbar-track { background: transparent; }
  .ps-picker-box::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 9999px; }

  .ps-animal-btn {
    display: flex; flex-direction: column; align-items: center;
    padding: 10px 6px; border-radius: 11px; width: 100%;
    border: 1px solid transparent;
    background: transparent;
    font-weight: 800; color: rgba(255,255,255,0.42);
    cursor: pointer; transition: all 0.16s; text-align: center;
  }
  .ps-animal-btn:hover:not(:disabled) {
    background: rgba(79,70,229,0.12);
    border-color: rgba(99,102,241,0.28);
    color: rgba(255,255,255,0.78);
    transform: translateY(-1px);
  }
  .ps-animal-btn.ps-active {
    background: rgba(79,70,229,0.22);
    border-color: rgba(129,140,248,0.45);
    color: rgba(255,255,255,0.92);
    box-shadow: 0 0 16px rgba(79,70,229,0.28);
  }
  .ps-animal-btn:disabled { opacity: 0.18; cursor: not-allowed; }
  .ps-animal-icon { font-size: 26px; line-height: 1; margin-bottom: 5px; }
  .ps-animal-name { font-size: 10px; line-height: 1.2; }

  /* ── Oracle (right panel) ── */
  .ps-oracle-hdr { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; }

  /* Gem + orbiting rings wrapper */
  .ps-gem-wrap { position: relative; width: 66px; height: 66px; flex-shrink: 0; }
  .ps-gem {
    width: 66px; height: 66px; border-radius: 20px;
    background: linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #818cf8 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 38px; line-height: 1;
    box-shadow: 0 0 32px rgba(79,70,229,0.55), inset 0 1px 0 rgba(255,255,255,0.18);
    position: relative; z-index: 2;
  }
  .ps-orbit {
    position: absolute; border-radius: 50%;
    pointer-events: none; z-index: 1;
  }
  .ps-orbit-1 {
    width: 86px; height: 86px; top: -10px; left: -10px;
    border: 1px solid rgba(129,140,248,0.22);
    animation: ps-spin 7s linear infinite;
  }
  .ps-orbit-2 {
    width: 106px; height: 106px; top: -20px; left: -20px;
    border: 1px dashed rgba(129,140,248,0.10);
    animation: ps-spin 13s linear infinite reverse;
  }
  @keyframes ps-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .ps-oracle-day { font-size: 18px; font-weight: 900; color: rgba(255,255,255,0.90); }
  .ps-oracle-sub { font-size: 12px; color: rgba(255,255,255,0.30); margin-top: 4px; }

  /* ── Prediction grid ── */
  .ps-pred-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 9px; }

  .ps-pred-card {
    border-radius: 15px; padding: 13px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.022);
    position: relative; overflow: hidden;
    transition: all 0.18s;
  }
  .ps-pred-card:hover { transform: translateY(-1px); filter: brightness(1.08); }

  /* Shimmer on rank-1 */
  .ps-pred-card.ps-pred-top::before {
    content: '';
    position: absolute; top: 0; left: -120%; width: 55%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(245,158,11,0.10), transparent);
    animation: ps-shimmer 3s ease-in-out infinite;
  }
  @keyframes ps-shimmer {
    0%   { left: -120%; }
    100% { left: 200%; }
  }

  .ps-rank-badge {
    position: absolute; top: 8px; right: 9px;
    width: 20px; height: 20px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 900;
  }
  .ps-card-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .ps-card-icon { font-size: 34px; line-height: 1; flex-shrink: 0; }
  .ps-card-name { font-size: 14px; font-weight: 900; color: rgba(255,255,255,0.88); }
  .ps-card-cnt  { font-size: 10px; color: rgba(255,255,255,0.28); margin-top: 2px; }

  .ps-bar-row { display: flex; align-items: center; gap: 8px; }
  .ps-bar-trk { flex: 1; height: 5px; background: rgba(255,255,255,0.06); border-radius: 9999px; overflow: hidden; }
  .ps-bar-fill { height: 100%; border-radius: 9999px; transition: width 0.7s cubic-bezier(0.34,1.56,0.64,1); }
  .ps-bar-pct  { font-size: 13px; font-weight: 900; min-width: 34px; text-align: right; }

  /* ── No data / idle states ── */
  .ps-no-data {
    grid-column: 1 / -1;
    border: 1px dashed rgba(255,255,255,0.08); border-radius: 14px;
    padding: 28px; text-align: center;
    font-size: 13px; color: rgba(255,255,255,0.24); font-weight: 700;
  }
  .ps-idle {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; height: 100%;
    min-height: 200px; text-align: center;
  }
  .ps-idle-icon { font-size: 56px; color: rgba(129,140,248,0.20); display: block; margin-bottom: 12px; }
  .ps-idle-txt  { font-size: 14px; color: rgba(255,255,255,0.26); font-weight: 700; }
`;

/* ─────────────────────────────────────────────────────────────── */
export default function PairingStats({ timeframe }) {
  const { draws, animals } = useData();
  const [selectedAnimalId, setSelectedAnimalId] = useState(null);

  const stats = useMemo(() => {
    const now = new Date();
    let filteredDraws = draws.filter(d => d.status === 'published');
    if (timeframe === '1_month') {
      const past = new Date(); past.setMonth(now.getMonth() - 1);
      filteredDraws = filteredDraws.filter(d => new Date(d.draw_date) >= past);
    } else if (timeframe === '3_months') {
      const past = new Date(); past.setMonth(now.getMonth() - 3);
      filteredDraws = filteredDraws.filter(d => new Date(d.draw_date) >= past);
    } else if (timeframe === '1_year') {
      const past = new Date(); past.setFullYear(now.getFullYear() - 1);
      filteredDraws = filteredDraws.filter(d => new Date(d.draw_date) >= past);
    }

    const sortedDraws = [...filteredDraws].sort((a, b) => new Date(a.draw_date) - new Date(b.draw_date));
    const transitions = {};

    for (let i = 0; i < sortedDraws.length - 1; i++) {
      const currentDraw = sortedDraws[i];
      const nextDraw    = sortedDraws[i + 1];
      const current2D   = currentDraw.results_detail?.find(r => r.prize_type === '2_digits');
      const next2D      = nextDraw.results_detail?.find(r => r.prize_type === '2_digits');

      if (current2D?.animal_id && next2D?.animal_id) {
        const currentId = current2D.animal_id;
        const nextId    = next2D.animal_id;
        if (!transitions[currentId]) transitions[currentId] = { total: 0, follows: {} };
        transitions[currentId].total += 1;
        transitions[currentId].follows[nextId] = (transitions[currentId].follows[nextId] || 0) + 1;
      }
    }

    return transitions;
  }, [draws, timeframe]);

  const activeAnimalId = selectedAnimalId || (Object.keys(stats).length > 0 ? Object.keys(stats)[0] : null);
  const activeAnimal   = animals.find(a => a.animal_id == activeAnimalId);

  const predictionList = useMemo(() => {
    if (!activeAnimalId || !stats[activeAnimalId]) return [];
    const follows = stats[activeAnimalId].follows;
    return Object.entries(follows)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id, count]) => ({
        animal:     animals.find(a => a.animal_id == id),
        count,
        percentage: Math.round((count / stats[activeAnimalId].total) * 100),
      }));
  }, [activeAnimalId, stats, animals]);

  return (
    <>
      <style>{STYLE}</style>
      <div className="ps-root p-6 sm:p-8">
        <div className="ps-mesh" />
        <div className="ps-stars" />
        <div className="ps-orb" />
        <div className="ps-orb2" />

        {/* ── Header ── */}
        <div className="ps-hdr">
          <div className="ps-icon-box">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}
            >
              magic_button
            </span>
          </div>
          <div>
            <h2 className="ps-title">ຈັບຄູ່ນາມສັດ (Sequence)</h2>
            <p className="ps-desc">
              ຖ້າງວດນີ້ອອກນາມສັດ X, ງວດຕໍ່ໄປມັກຈະອອກນາມສັດໂຕໃດຫຼາຍທີ່ສຸດ?
            </p>
          </div>
        </div>

        {/* ── 5 : 7 column layout ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6" style={{ position: 'relative', zIndex: 10 }}>

          {/* LEFT — Animal picker */}
          <div className="md:col-span-5">
            <p className="ps-picker-lbl">ຖ້າງວດທີ່ຜ່ານມາອອກ:</p>
            <div className="ps-picker-box">
              <div className="grid grid-cols-2 gap-1.5">
                {animals.map(animal => {
                  const hasData = stats[animal.animal_id]?.total > 0;
                  const isActive = activeAnimalId == animal.animal_id;
                  return (
                    <button
                      key={animal.animal_id}
                      onClick={() => setSelectedAnimalId(animal.animal_id)}
                      disabled={!hasData}
                      className={`ps-animal-btn ${isActive ? 'ps-active' : ''}`}
                    >
                      <span className="ps-animal-icon">{animal.icon}</span>
                      <span className="ps-animal-name">{animal.animal_name_lao}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT — Oracle predictions */}
          <div className="md:col-span-7 flex flex-col justify-center">
            {activeAnimal ? (
              <>
                {/* Gem + oracle header */}
                <div className="ps-oracle-hdr">
                  <div className="ps-gem-wrap">
                    <div className="ps-orbit ps-orbit-1" />
                    <div className="ps-orbit ps-orbit-2" />
                    <div className="ps-gem">
                      <span style={{ position: 'relative', zIndex: 2 }}>{activeAnimal.icon}</span>
                    </div>
                  </div>
                  <div>
                    <div className="ps-oracle-day">ງວດຖັດໄປ ມັກຈະອອກ:</div>
                    <div className="ps-oracle-sub">
                      ຈາກ {stats[activeAnimalId]?.total || 0} ຄັ້ງ ຫຼັງຈາກ {activeAnimal.animal_name_lao}
                    </div>
                  </div>
                </div>

                {/* Prediction cards */}
                {predictionList.length > 0 ? (
                  <div className="ps-pred-grid">
                    {predictionList.map((item, i) => {
                      const r = RANK[i] || RANK[3];
                      return (
                        <div
                          key={item.animal?.animal_id}
                          className={`ps-pred-card ${i === 0 ? 'ps-pred-top' : ''}`}
                          style={{ borderColor: r.border, background: r.bg, boxShadow: r.glow }}
                        >
                          {/* Rank badge */}
                          <div
                            className="ps-rank-badge"
                            style={{
                              background: `${r.bar}20`,
                              border: `1px solid ${r.bar}40`,
                              color: r.lbl,
                            }}
                          >
                            {i + 1}
                          </div>

                          {/* Animal icon + name */}
                          <div className="ps-card-row">
                            <span className="ps-card-icon">{item.animal?.icon}</span>
                            <div>
                              <div className="ps-card-name">{item.animal?.animal_name_lao}</div>
                              <div className="ps-card-cnt">{item.count} ຄັ້ງ</div>
                            </div>
                          </div>

                          {/* Bar + percentage */}
                          <div className="ps-bar-row">
                            <div className="ps-bar-trk">
                              <div
                                className="ps-bar-fill"
                                style={{
                                  width: `${item.percentage}%`,
                                  background: r.bar,
                                  boxShadow: `0 0 6px ${r.bar}55`,
                                }}
                              />
                            </div>
                            <span className="ps-bar-pct" style={{ color: r.lbl }}>
                              {item.percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="ps-pred-grid">
                    <div className="ps-no-data">
                      ບໍ່ມີສະຖິຕິການອອກຊ້ຳກັນພຽງພໍ
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="ps-idle">
                <span className="material-symbols-outlined ps-idle-icon">query_stats</span>
                <p className="ps-idle-txt">ເລືອກນາມສັດເພື່ອເບິ່ງສະຖິຕິ</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
