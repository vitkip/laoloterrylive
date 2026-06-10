import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';

/* ─── Inline styles ─────────────────────────────────────────── */
const STYLE = `
  /* ── Root card ── */
  .cf-root {
    position: relative;
    background: linear-gradient(165deg, #080c18 0%, #0a0f1e 40%, #0d1225 100%);
    border: 1px solid rgba(251,191,36,0.12);
    border-radius: 28px;
    overflow: hidden;
  }

  /* Mesh grid overlay */
  .cf-mesh {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(251,191,36,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(251,191,36,0.025) 1px, transparent 1px);
    background-size: 44px 44px;
  }

  /* Ambient top glow */
  .cf-top-glow {
    position: absolute;
    width: 600px; height: 280px;
    top: -100px; left: 50%; transform: translateX(-50%);
    background: radial-gradient(ellipse, rgba(251,191,36,0.09) 0%, transparent 70%);
    filter: blur(48px);
    pointer-events: none;
  }
  .cf-side-glow-l {
    position: absolute; width: 200px; height: 400px;
    bottom: 0; left: -60px;
    background: radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%);
    filter: blur(40px); pointer-events: none;
  }
  .cf-side-glow-r {
    position: absolute; width: 200px; height: 400px;
    top: 30%; right: -60px;
    background: radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 70%);
    filter: blur(40px); pointer-events: none;
  }

  /* Animated ticker tape stripe */
  .cf-tape {
    height: 4px;
    background: repeating-linear-gradient(
      90deg,
      #f59e0b 0px, #f59e0b 18px, transparent 18px, transparent 24px,
      #7c3aed 24px, #7c3aed 36px, transparent 36px, transparent 42px,
      #ef4444 42px, #ef4444 54px, transparent 54px, transparent 60px,
      #10b981 60px, #10b981 72px, transparent 72px, transparent 78px
    );
    animation: cf-tape-scroll 6s linear infinite;
  }
  @keyframes cf-tape-scroll {
    from { background-position: 0 0; }
    to   { background-position: 78px 0; }
  }

  /* ── Header text ── */
  .cf-top40-text {
    font-size: clamp(52px, 9vw, 88px);
    font-weight: 900;
    letter-spacing: -0.03em;
    line-height: 1;
    background: linear-gradient(135deg, #ffe566 0%, #f59e0b 28%, #fff7e6 50%, #f59e0b 72%, #c26b00 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 40px rgba(251,191,36,0.18));
  }

  .cf-section-label {
    font-size: 10px; font-weight: 900;
    letter-spacing: 0.2em; text-transform: uppercase;
  }

  /* ── Ticket stub filter tabs ── */
  .cf-tickets-wrap {
    display: flex; gap: 10px; flex-wrap: wrap;
  }
  .cf-ticket {
    position: relative;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(251,191,36,0.14);
    border-radius: 10px;
    padding: 9px 22px;
    font-size: 12px; font-weight: 900; letter-spacing: 0.06em;
    color: rgba(251,191,36,0.45);
    cursor: pointer;
    transition: all 0.2s;
  }
  /* Punch holes on each side */
  .cf-ticket::before {
    content: '';
    position: absolute;
    top: 50%; left: -8px; transform: translateY(-50%);
    width: 16px; height: 16px; border-radius: 50%;
    background: #080c18;
    border: 1px solid rgba(251,191,36,0.12);
    z-index: 1;
  }
  .cf-ticket::after {
    content: '';
    position: absolute;
    top: 50%; right: -8px; transform: translateY(-50%);
    width: 16px; height: 16px; border-radius: 50%;
    background: #080c18;
    border: 1px solid rgba(251,191,36,0.12);
    z-index: 1;
  }
  .cf-ticket.cf-active {
    background: linear-gradient(135deg, rgba(245,158,11,0.22) 0%, rgba(251,191,36,0.10) 100%);
    border-color: rgba(251,191,36,0.55);
    color: #fbbf24;
    box-shadow: 0 0 24px rgba(251,191,36,0.14), inset 0 1px 0 rgba(255,255,255,0.06);
  }
  .cf-ticket:hover:not(.cf-active) {
    background: rgba(251,191,36,0.06);
    border-color: rgba(251,191,36,0.28);
    color: rgba(251,191,36,0.75);
  }

  /* ── Lottery Ball base ── */
  .cf-ball {
    position: relative;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; flex-shrink: 0;
    overflow: hidden;
    cursor: default;
  }
  /* Primary specular highlight */
  .cf-ball::after {
    content: '';
    position: absolute;
    top: 8%; left: 12%; width: 44%; height: 36%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.58) 0%, transparent 70%);
    border-radius: 50%;
  }
  /* Secondary soft reflection */
  .cf-ball::before {
    content: '';
    position: absolute;
    bottom: 8%; right: 10%; width: 28%; height: 20%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.10) 0%, transparent 70%);
    border-radius: 50%;
  }

  /* ── XL balls (top 3) ── */
  .cf-ball-xl { width: 90px; height: 90px; font-size: 34px; }

  .cf-ball-gold {
    background: radial-gradient(circle at 38% 30%, #ffe566 0%, #f59e0b 38%, #b45309 68%, #7c3309 100%);
    color: #5c2200;
    box-shadow: 0 10px 40px rgba(251,191,36,0.45), inset 0 -6px 14px rgba(0,0,0,0.28);
  }
  .cf-ball-silver {
    background: radial-gradient(circle at 38% 30%, #f4f4f4 0%, #b0b0b0 42%, #686868 72%, #363636 100%);
    color: #1e1e1e;
    box-shadow: 0 8px 32px rgba(160,160,160,0.32), inset 0 -6px 14px rgba(0,0,0,0.28);
  }
  .cf-ball-bronze {
    background: radial-gradient(circle at 38% 30%, #f5a96e 0%, #cd7f32 42%, #8b4400 72%, #5c2a00 100%);
    color: #3c1800;
    box-shadow: 0 8px 32px rgba(205,127,50,0.38), inset 0 -6px 14px rgba(0,0,0,0.28);
  }

  /* Float animations */
  .cf-float  { animation: cf-float-anim 3.2s ease-in-out infinite; }
  .cf-float2 { animation: cf-float-anim 3.2s ease-in-out 0.55s infinite; }
  .cf-float3 { animation: cf-float-anim 3.2s ease-in-out 1.1s infinite; }
  @keyframes cf-float-anim {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-9px); }
  }

  /* Glow rings pulse */
  .cf-ring {
    position: absolute; border-radius: 50%;
    pointer-events: none;
    animation: cf-ring-pulse 2.6s ease-out infinite;
  }
  .cf-ring-2 { animation-delay: 0.9s; }
  @keyframes cf-ring-pulse {
    0%   { transform: scale(1);   opacity: 0.55; }
    100% { transform: scale(1.65); opacity: 0; }
  }

  /* Crown wobble */
  .cf-crown {
    position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
    font-size: 22px;
    filter: drop-shadow(0 2px 10px rgba(251,191,36,0.55));
    animation: cf-crown-rock 2.4s ease-in-out infinite;
  }
  @keyframes cf-crown-rock {
    0%, 100% { transform: translateX(-50%) rotate(-6deg); }
    50%       { transform: translateX(-50%) rotate(6deg); }
  }
  .cf-medal {
    position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
    font-size: 18px; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
  }

  /* Podium card */
  .cf-podium-card {
    display: flex; flex-direction: column; align-items: center;
    gap: 10px; position: relative;
    padding: 28px 12px 14px;
    background: rgba(255,255,255,0.02);
    border-radius: 22px;
    border: 1px solid rgba(255,255,255,0.04);
    transition: all 0.2s;
  }
  .cf-podium-card:hover { background: rgba(255,255,255,0.04); transform: translateY(-2px); }
  .cf-podium-card-gold   { border-color: rgba(251,191,36,0.14); }
  .cf-podium-card-silver { border-color: rgba(180,180,180,0.10); }
  .cf-podium-card-bronze { border-color: rgba(205,127,50,0.12); }

  .cf-rank-tag {
    position: absolute; top: 8px; right: 10px;
    font-size: 9px; font-weight: 900; letter-spacing: 0.08em;
    color: rgba(255,255,255,0.22);
  }

  /* Count badge */
  .cf-count { font-size: 10px; font-weight: 900; padding: 2px 8px; border-radius: 20px; }
  .cf-count-gold   { background: rgba(251,191,36,0.14); color: #fbbf24; border: 1px solid rgba(251,191,36,0.22); }
  .cf-count-silver { background: rgba(180,180,180,0.10); color: #d4d4d4; border: 1px solid rgba(180,180,180,0.18); }
  .cf-count-bronze { background: rgba(205,127,50,0.12); color: #fb923c; border: 1px solid rgba(205,127,50,0.18); }
  .cf-count-mid    { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.65); border: 1px solid rgba(255,255,255,0.09); }
  .cf-count-navy   { background: rgba(59,130,246,0.09); color: #93c5fd; border: 1px solid rgba(59,130,246,0.14); }

  /* ── Rank 4-10 LG balls ── */
  .cf-ball-lg { width: 60px; height: 60px; font-size: 21px; }
  .cf-ball-r4  { background: radial-gradient(circle at 36% 30%, #ff7070 0%, #dc2626 42%, #7f1d1d 100%); color: #fff; box-shadow: 0 6px 22px rgba(220,38,38,0.42), inset 0 -5px 10px rgba(0,0,0,0.28); }
  .cf-ball-r5  { background: radial-gradient(circle at 36% 30%, #ff9060 0%, #ea580c 42%, #7c2d12 100%); color: #fff; box-shadow: 0 6px 22px rgba(234,88,12,0.40), inset 0 -5px 10px rgba(0,0,0,0.28); }
  .cf-ball-r6  { background: radial-gradient(circle at 36% 30%, #ffb065 0%, #f97316 42%, #7c2d12 100%); color: #fff; box-shadow: 0 6px 20px rgba(249,115,22,0.35), inset 0 -5px 10px rgba(0,0,0,0.28); }
  .cf-ball-r7  { background: radial-gradient(circle at 36% 30%, #ffd060 0%, #f59e0b 42%, #78350f 100%); color: #78350f; box-shadow: 0 6px 20px rgba(245,158,11,0.35), inset 0 -5px 10px rgba(0,0,0,0.28); }
  .cf-ball-r8  { background: radial-gradient(circle at 36% 30%, #ffe060 0%, #eab308 42%, #713f12 100%); color: #713f12; box-shadow: 0 6px 18px rgba(234,179,8,0.30), inset 0 -5px 10px rgba(0,0,0,0.28); }
  .cf-ball-r9  { background: radial-gradient(circle at 36% 30%, #c8e86a 0%, #84cc16 42%, #365314 100%); color: #1a2e05; box-shadow: 0 6px 18px rgba(132,204,22,0.28), inset 0 -5px 10px rgba(0,0,0,0.28); }
  .cf-ball-r10 { background: radial-gradient(circle at 36% 30%, #6ee7b7 0%, #10b981 42%, #064e3b 100%); color: #022c22; box-shadow: 0 6px 18px rgba(16,185,129,0.28), inset 0 -5px 10px rgba(0,0,0,0.28); }

  .cf-mid-card {
    display: flex; flex-direction: column; align-items: center;
    gap: 5px; position: relative;
    padding: 14px 8px 10px;
    background: rgba(255,255,255,0.02);
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.04);
    transition: all 0.18s;
  }
  .cf-mid-card:hover { background: rgba(255,255,255,0.045); transform: translateY(-2px); }
  .cf-mid-rank { position: absolute; top: 5px; right: 7px; font-size: 9px; font-weight: 900; color: rgba(255,255,255,0.2); }

  /* ── Rank 11-40 SM balls ── */
  .cf-ball-sm { width: 46px; height: 46px; font-size: 15px; }
  .cf-ball-navy {
    background: radial-gradient(circle at 36% 30%, #4a6fa5 0%, #1e3a5f 46%, #0d1e35 100%);
    color: #93c5fd;
    box-shadow: 0 3px 12px rgba(0,0,0,0.38), inset 0 -3px 7px rgba(0,0,0,0.24);
  }
  .cf-dense-card {
    display: flex; flex-direction: column; align-items: center;
    gap: 3px; position: relative;
    padding: 9px 5px 7px;
    border-radius: 11px;
    background: rgba(255,255,255,0.012);
    border: 1px solid rgba(59,130,246,0.08);
    transition: all 0.15s;
  }
  .cf-dense-card:hover { background: rgba(59,130,246,0.06); border-color: rgba(59,130,246,0.18); transform: translateY(-1px); }
  .cf-dense-rank { position: absolute; top: 4px; right: 4px; font-size: 7px; font-weight: 900; color: rgba(147,197,253,0.22); }

  /* Divider */
  .cf-divider-gold { height: 1px; background: linear-gradient(90deg, transparent, rgba(251,191,36,0.14), transparent); }
  .cf-divider-blue { height: 1px; background: linear-gradient(90deg, transparent, rgba(59,130,246,0.14), transparent); }

  /* Empty */
  .cf-empty { text-align: center; padding: 64px 0; color: rgba(251,191,36,0.3); font-size: 14px; }
`;

const MID_BALL_CLS = ['cf-ball-r4','cf-ball-r5','cf-ball-r6','cf-ball-r7','cf-ball-r8','cf-ball-r9','cf-ball-r10'];

const FILTER_OPTIONS = [
  { value: 1,     label: '1 ປີ' },
  { value: 3,     label: '3 ປີ' },
  { value: 5,     label: '5 ປີ' },
  { value: 'all', label: 'ທັງໝົດ' },
];

function periodLabel(v) {
  return v === 'all' ? 'ທຸກຍຸກ' : `${v} ປີຫຼ້ານີ້`;
}

/* ─────────────────────────────────────────────────────────────── */
export default function CustomFrequency({ timeframe }) {
  const { draws } = useData();
  const [yearsFilter, setYearsFilter] = useState(5);

  const topNumbers = useMemo(() => {
    if (!draws || draws.length === 0) return [];
    let filteredDraws = draws;
    if (yearsFilter !== 'all') {
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - yearsFilter);
      filteredDraws = draws.filter(d => new Date(d.draw_date) >= cutoffDate);
    }
    const twoDigitFreq = {};
    filteredDraws.forEach(d => {
      const twoDigit = d.results_detail?.find(r => r.prize_type === '2_digits');
      if (twoDigit) {
        const v = twoDigit.result_value;
        if (!twoDigitFreq[v]) twoDigitFreq[v] = 0;
        twoDigitFreq[v] += 1;
      }
    });
    return Object.entries(twoDigitFreq)
      .map(([number, count]) => ({ number, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 40);
  }, [draws, yearsFilter]);

  const top3 = topNumbers.slice(0, 3);
  const mid7 = topNumbers.slice(3, 10);
  const rest = topNumbers.slice(10);

  return (
    <>
      <style>{STYLE}</style>
      <section className="cf-root p-6 sm:p-8 lg:p-10 mb-16">

        {/* Ambient layers */}
        <div className="cf-mesh" />
        <div className="cf-top-glow" />
        <div className="cf-side-glow-l" />
        <div className="cf-side-glow-r" />

        {/* Ticker tape */}
        <div className="cf-tape mb-7" />

        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 15, color: 'rgba(251,191,36,0.55)', fontVariationSettings: "'FILL' 1" }}
              >
                casino
              </span>
              <span className="cf-section-label" style={{ color: 'rgba(251,191,36,0.5)' }}>
                Custom Analysis · {periodLabel(yearsFilter)}
              </span>
            </div>
            <div className="cf-top40-text">TOP 40</div>
            <p style={{ fontSize: 13, color: 'rgba(251,191,36,0.38)', marginTop: 4, fontWeight: 600, letterSpacing: '0.02em' }}>
              ເລກ 2 ຕົວທີ່ອອກຫຼາຍທີ່ສຸດ
            </p>
          </div>

          {/* Ticket stub filters */}
          <div className="cf-tickets-wrap" style={{ paddingLeft: 16 }}>
            {FILTER_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setYearsFilter(value)}
                className={`cf-ticket${yearsFilter === value ? ' cf-active' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {topNumbers.length === 0 ? (
          <div className="cf-empty">
            <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 10 }}>
              search_off
            </span>
            ບໍ່ມີຂໍ້ມູນສຳລັບຊ່ວງເວລານີ້
          </div>
        ) : (
          <div className="space-y-7 relative z-10">

            {/* ── TOP 3 PODIUM ── */}
            {top3.length > 0 && (
              <div>
                <p className="cf-section-label mb-5" style={{ color: 'rgba(251,191,36,0.5)' }}>
                  ✦ ແຊ້ມ — Grand Prize Numbers
                </p>
                <div className="grid grid-cols-3 gap-3 sm:gap-5 max-w-sm mx-auto">
                  {top3.map((item, i) => {
                    const isGold   = i === 0;
                    const isSilver = i === 1;
                    const floatCls = i === 0 ? 'cf-float' : i === 1 ? 'cf-float2' : 'cf-float3';
                    const ballCls  = isGold ? 'cf-ball-gold' : isSilver ? 'cf-ball-silver' : 'cf-ball-bronze';
                    const cardCls  = isGold ? 'cf-podium-card-gold' : isSilver ? 'cf-podium-card-silver' : 'cf-podium-card-bronze';
                    const glowClr  = isGold ? 'rgba(251,191,36,0.38)' : isSilver ? 'rgba(180,180,180,0.25)' : 'rgba(205,127,50,0.30)';
                    const cntCls   = isGold ? 'cf-count-gold' : isSilver ? 'cf-count-silver' : 'cf-count-bronze';
                    return (
                      <div key={item.number} className={`cf-podium-card ${cardCls}`}>
                        {isGold   && <div className="cf-crown">👑</div>}
                        {isSilver && <div className="cf-medal">🥈</div>}
                        {!isGold && !isSilver && <div className="cf-medal">🥉</div>}
                        <div className="cf-rank-tag">#{i + 1}</div>

                        {/* Ball with glow rings */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div
                            className="cf-ring"
                            style={{ width: 90, height: 90, border: `2px solid ${glowClr}` }}
                          />
                          <div
                            className="cf-ring cf-ring-2"
                            style={{ width: 90, height: 90, border: `1.5px solid ${glowClr}` }}
                          />
                          <div className={`cf-ball cf-ball-xl ${ballCls} ${floatCls}`}>
                            {item.number}
                          </div>
                        </div>

                        <span className={`cf-count ${cntCls}`}>{item.count} ຄັ້ງ</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── RANK 4–10 ── */}
            {mid7.length > 0 && (
              <div>
                <div className="cf-divider-gold mb-5" />
                <p className="cf-section-label mb-4" style={{ color: 'rgba(249,115,22,0.55)' }}>
                  ✦ ອັນດັບ 4 – 10
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
                  {mid7.map((item, i) => (
                    <div key={item.number} className="cf-mid-card">
                      <div className="cf-mid-rank">#{i + 4}</div>
                      <div className={`cf-ball cf-ball-lg ${MID_BALL_CLS[i] ?? MID_BALL_CLS[6]}`}>
                        {item.number}
                      </div>
                      <span className="cf-count cf-count-mid">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── RANK 11–40 ── */}
            {rest.length > 0 && (
              <div>
                <div className="cf-divider-blue mb-5" />
                <p className="cf-section-label mb-4" style={{ color: 'rgba(147,197,253,0.38)' }}>
                  ✦ ອັນດັບ 11 – 40
                </p>
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {rest.map((item, i) => (
                    <div key={item.number} className="cf-dense-card">
                      <div className="cf-dense-rank">#{i + 11}</div>
                      <div className="cf-ball cf-ball-sm cf-ball-navy">{item.number}</div>
                      <span className="cf-count cf-count-navy" style={{ fontSize: 9 }}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </section>
    </>
  );
}
