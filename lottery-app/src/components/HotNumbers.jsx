import { useStatistics } from '../hooks/useStatistics';

/* ─── Per-rank visual config ─────────────────────────────────── */
const RANKS = [
  {
    card:  'linear-gradient(148deg, #1c0d04 0%, #2e1208 100%)',
    cardBorder: 'rgba(255,107,53,0.24)',
    cardShadow: '0 0 36px rgba(255,69,0,0.13)',
    ball:  'radial-gradient(circle at 35% 30%, #ff9a6c 0%, #ff4500 38%, #c2410c 70%, #7a1d04 100%)',
    ballShadow: '0 8px 32px rgba(255,69,0,0.58), inset 0 -5px 10px rgba(0,0,0,0.32)',
    ballSize: 74,
    ballFont: 26,
    badgeBg: 'rgba(255,69,0,0.85)',
    bar: 'linear-gradient(90deg, #b91c1c, #ef4444, #ff9a6c)',
    barGlow: 'rgba(255,69,0,0.50)',
    countColor: '#fb923c',
    pulse: true,
  },
  {
    card:  'linear-gradient(148deg, #180c04 0%, #271007 100%)',
    cardBorder: 'rgba(234,88,12,0.18)',
    cardShadow: '0 0 24px rgba(234,88,12,0.09)',
    ball:  'radial-gradient(circle at 35% 30%, #fb923c 0%, #ea580c 40%, #9a3412 76%, #5a1804 100%)',
    ballShadow: '0 6px 22px rgba(234,88,12,0.48), inset 0 -4px 8px rgba(0,0,0,0.30)',
    ballSize: 62,
    ballFont: 22,
    badgeBg: 'rgba(234,88,12,0.80)',
    bar: 'linear-gradient(90deg, #9a3412, #ea580c, #fb923c)',
    barGlow: 'rgba(234,88,12,0.40)',
    countColor: 'rgba(251,146,60,0.88)',
    pulse: false,
  },
  {
    card:  'linear-gradient(148deg, #140b03 0%, #200e06 100%)',
    cardBorder: 'rgba(217,119,6,0.14)',
    cardShadow: '0 0 18px rgba(217,119,6,0.07)',
    ball:  'radial-gradient(circle at 35% 30%, #fcd34d 0%, #d97706 42%, #92400e 76%, #4c2200 100%)',
    ballShadow: '0 5px 18px rgba(217,119,6,0.42), inset 0 -4px 8px rgba(0,0,0,0.28)',
    ballSize: 54,
    ballFont: 19,
    badgeBg: 'rgba(217,119,6,0.78)',
    bar: 'linear-gradient(90deg, #78350f, #d97706, #fcd34d)',
    barGlow: 'rgba(217,119,6,0.35)',
    countColor: 'rgba(251,146,60,0.70)',
    pulse: false,
  },
  {
    card:  'linear-gradient(148deg, #110804 0%, #1c0c05 100%)',
    cardBorder: 'rgba(180,83,9,0.12)',
    cardShadow: 'none',
    ball:  'radial-gradient(circle at 35% 30%, #fb923c 0%, #c2410c 42%, #7c2d12 76%, #401204 100%)',
    ballShadow: '0 4px 14px rgba(194,65,12,0.36), inset 0 -3px 6px rgba(0,0,0,0.26)',
    ballSize: 46,
    ballFont: 16,
    badgeBg: 'rgba(180,83,9,0.75)',
    bar: 'linear-gradient(90deg, #7c2d12, #c2410c, #f97316)',
    barGlow: 'rgba(194,65,12,0.28)',
    countColor: 'rgba(251,146,60,0.52)',
    pulse: false,
  },
];

/* ─── Inline styles ─────────────────────────────────────────── */
const STYLE = `
  /* ── Root card ── */
  .hn-root {
    position: relative;
    background: linear-gradient(155deg, #100806 0%, #1a0e06 45%, #0d0604 100%);
    border: 1px solid rgba(251,146,60,0.16);
    border-radius: 22px;
    overflow: hidden;
  }
  /* Fire edge accent */
  .hn-root::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg,
      transparent 5%,
      rgba(255,69,0,0.65) 22%, rgba(251,191,36,0.90) 50%,
      rgba(255,69,0,0.65) 78%, transparent 95%
    );
  }

  /* ── Ambient glow orbs ── */
  .hn-glow-tr {
    position: absolute; width: 320px; height: 220px;
    top: -80px; right: -70px;
    background: radial-gradient(ellipse, rgba(255,107,53,0.11) 0%, transparent 70%);
    filter: blur(44px); pointer-events: none;
  }
  .hn-glow-bl {
    position: absolute; width: 220px; height: 220px;
    bottom: -70px; left: -50px;
    background: radial-gradient(circle, rgba(251,146,60,0.07) 0%, transparent 70%);
    filter: blur(38px); pointer-events: none;
  }

  /* ── Floating ember particles ── */
  .hn-ember {
    position: absolute; border-radius: 50%; pointer-events: none;
    animation: hn-ember-rise ease-out infinite;
  }
  .hn-e1 { width:3px;height:3px; left:12%; bottom:15%; background:rgba(255,107,53,0.65); animation-duration:4.2s; animation-delay:0s;   }
  .hn-e2 { width:2px;height:2px; left:28%; bottom:8%;  background:rgba(251,146,60,0.55); animation-duration:3.6s; animation-delay:0.7s; }
  .hn-e3 { width:3px;height:3px; left:46%; bottom:12%; background:rgba(255,69,0,0.60);   animation-duration:4.8s; animation-delay:1.4s; }
  .hn-e4 { width:2px;height:2px; left:63%; bottom:6%;  background:rgba(251,191,36,0.50); animation-duration:3.9s; animation-delay:2.1s; }
  .hn-e5 { width:3px;height:3px; left:78%; bottom:10%; background:rgba(255,107,53,0.58); animation-duration:4.5s; animation-delay:0.3s; }
  .hn-e6 { width:2px;height:2px; left:91%; bottom:4%;  background:rgba(251,146,60,0.48); animation-duration:3.3s; animation-delay:1.9s; }
  @keyframes hn-ember-rise {
    0%   { transform: translateY(0) translateX(0)   scale(1);    opacity: 0.7; }
    50%  { transform: translateY(-55px) translateX(8px) scale(1.3); opacity: 0.9; }
    100% { transform: translateY(-110px) translateX(-4px) scale(0.3); opacity: 0; }
  }

  /* ── Header ── */
  .hn-hdr {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px; position: relative; z-index: 10;
  }
  .hn-hdr-l { display: flex; align-items: center; gap: 12px; }
  .hn-icon-box {
    width: 42px; height: 42px; border-radius: 14px;
    background: linear-gradient(135deg, #b45309 0%, #f97316 52%, #fb923c 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 22px rgba(249,115,22,0.52), inset 0 1px 0 rgba(255,255,255,0.18);
    flex-shrink: 0;
  }
  .hn-title {
    font-size: 16px; font-weight: 900; letter-spacing: -0.01em; margin: 0;
    background: linear-gradient(90deg, #fed7aa 0%, #fb923c 50%, #f97316 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .hn-subtitle {
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(251,146,60,0.48); margin-top: 1px;
  }
  .hn-top-badge {
    font-size: 10px; font-weight: 900; letter-spacing: 0.06em;
    background: rgba(249,115,22,0.11);
    border: 1px solid rgba(249,115,22,0.24);
    border-radius: 20px; padding: 5px 13px;
    color: rgba(251,146,60,0.75);
  }

  /* ── Grid ── */
  .hn-grid {
    display: grid; grid-template-columns: repeat(2,1fr); gap: 10px;
    position: relative; z-index: 10; align-items: end;
  }
  @media (min-width: 640px) { .hn-grid { grid-template-columns: repeat(4,1fr); } }

  /* ── Card ── */
  .hn-card {
    position: relative; border-radius: 18px; overflow: hidden;
    display: flex; flex-direction: column; align-items: center;
    padding: 16px 10px 14px; gap: 8px;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: default;
  }
  .hn-card:hover { transform: translateY(-4px); }

  /* Rank badge top-right corner */
  .hn-rank-badge {
    position: absolute; top: 0; right: 0;
    width: 26px; height: 26px;
    border-radius: 0 18px 0 16px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 900; color: #fff;
  }

  /* Crown rocking on #1 */
  .hn-crown {
    font-size: 20px; line-height: 1;
    filter: drop-shadow(0 0 10px rgba(251,191,36,0.75));
    animation: hn-crown-rock 2.4s ease-in-out infinite;
    flex-shrink: 0;
  }
  @keyframes hn-crown-rock {
    0%, 100% { transform: rotate(-6deg) scale(1);   }
    50%       { transform: rotate(6deg) scale(1.05); }
  }

  /* ── Lottery ball ── */
  .hn-ball {
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; color: #fff;
    position: relative; overflow: hidden; flex-shrink: 0;
  }
  /* Specular highlight */
  .hn-ball::after {
    content: '';
    position: absolute;
    top: 8%; left: 12%; width: 44%; height: 36%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.52) 0%, transparent 70%);
    border-radius: 50%;
  }
  /* Pulse glow on #1 */
  .hn-ball-pulse { animation: hn-pulse-glow 2s ease-in-out infinite; }
  @keyframes hn-pulse-glow {
    0%, 100% { filter: none; }
    50%       { filter: drop-shadow(0 0 14px rgba(255,69,0,0.65)); }
  }

  /* ── Count ── */
  .hn-count-num  { font-size: 15px; font-weight: 900; }
  .hn-count-unit { font-size: 9px; font-weight: 700; letter-spacing: 0.06em; color: rgba(251,146,60,0.32); }

  /* ── Progress bar ── */
  .hn-bar-track {
    width: 100%; height: 4px;
    background: rgba(255,255,255,0.05); border-radius: 9999px; overflow: hidden;
  }
  .hn-bar-fill {
    height: 100%; border-radius: 9999px;
    transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* ── Footer ── */
  .hn-footer {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 18px; padding-top: 14px;
    border-top: 1px solid rgba(251,146,60,0.09);
    position: relative; z-index: 10;
  }
  .hn-footer-l { font-size: 11px; color: rgba(251,146,60,0.38); font-weight: 600; }
  .hn-footer-r { display: flex; align-items: center; gap: 5px; font-size: 10px; color: rgba(251,146,60,0.30); }
`;

/* ─────────────────────────────────────────────────────────────── */
export default function HotNumbers({ timeframe }) {
  const { stats, loading } = useStatistics(timeframe);
  if (loading || !stats) return null;
  const { hotNumbers } = stats;
  const maxCount = hotNumbers[0]?.count || 1;

  return (
    <>
      <style>{STYLE}</style>
      <div className="hn-root md:col-span-8 p-6 sm:p-8">

        {/* Ambient glows */}
        <div className="hn-glow-tr" />
        <div className="hn-glow-bl" />

        {/* Floating ember particles */}
        {[1,2,3,4,5,6].map(n => (
          <div key={n} className={`hn-ember hn-e${n}`} />
        ))}

        {/* ── Header ── */}
        <div className="hn-hdr">
          <div className="hn-hdr-l">
            <div className="hn-icon-box">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontSize: 21, fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
            </div>
            <div>
              <h2 className="hn-title">ເລກເດັ່ນ</h2>
              <p className="hn-subtitle">Hot Numbers</p>
            </div>
          </div>
          <span className="hn-top-badge">ອອກຫຼາຍທີ່ສຸດ</span>
        </div>

        {/* ── Cards ── */}
        <div className="hn-grid">
          {hotNumbers.map(({ number, count }, i) => {
            const r       = RANKS[i] ?? RANKS[3];
            const barPct  = Math.round((count / maxCount) * 100);
            const isFirst = i === 0;

            return (
              <div
                key={number}
                className="hn-card"
                style={{
                  background:  r.card,
                  border:      `1px solid ${r.cardBorder}`,
                  boxShadow:   r.cardShadow,
                }}
              >
                {/* Rank corner badge */}
                <div className="hn-rank-badge" style={{ background: r.badgeBg }}>
                  {i + 1}
                </div>

                {/* Crown for #1 */}
                {isFirst && <div className="hn-crown">👑</div>}

                {/* Lottery ball */}
                <div
                  className={`hn-ball${r.pulse ? ' hn-ball-pulse' : ''}`}
                  style={{
                    width:     r.ballSize,
                    height:    r.ballSize,
                    fontSize:  r.ballFont,
                    background: r.ball,
                    boxShadow:  r.ballShadow,
                  }}
                >
                  <span style={{ position: 'relative', zIndex: 1 }}>{number}</span>
                </div>

                {/* Count */}
                <div style={{ textAlign: 'center' }}>
                  <span className="hn-count-num" style={{ color: r.countColor }}>
                    {count}
                  </span>
                  <p className="hn-count-unit">ຄັ້ງ</p>
                </div>

                {/* Progress bar */}
                <div className="hn-bar-track">
                  <div
                    className="hn-bar-fill"
                    style={{
                      width:     `${barPct}%`,
                      background: r.bar,
                      boxShadow:  `0 0 6px ${r.barGlow}`,
                    }}
                  />
                </div>

              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div className="hn-footer">
          <p className="hn-footer-l">
            ສູງສຸດ:{' '}
            <span style={{ fontWeight: 900, color: 'rgba(251,146,60,0.80)' }}>
              {hotNumbers[0]?.count} ຄັ້ງ
            </span>
          </p>
          <div className="hn-footer-r">
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>info</span>
            ຄວາມຖີ່ຈາກ 2 ຕົວສຸດທ້າຍ
          </div>
        </div>

      </div>
    </>
  );
}
