import { useStatistics } from '../hooks/useStatistics';

const RANKS = [
  {
    card:  'linear-gradient(148deg, #0a0d1f 0%, #141a35 100%)',
    cardBorder: 'rgba(99,102,241,0.30)',
    cardShadow: '0 0 36px rgba(99,102,241,0.18)',
    ball:  'radial-gradient(circle at 35% 30%, #a5b4fc 0%, #6366f1 38%, #3730a3 70%, #1e1b4b 100%)',
    ballShadow: '0 8px 32px rgba(99,102,241,0.60), inset 0 -5px 10px rgba(0,0,0,0.32)',
    ballSize: 80,
    ballFont: 22,
    badgeBg: 'rgba(99,102,241,0.85)',
    bar: 'linear-gradient(90deg, #3730a3, #6366f1, #a5b4fc)',
    barGlow: 'rgba(99,102,241,0.55)',
    countColor: '#a5b4fc',
    pulse: true,
  },
  {
    card:  'linear-gradient(148deg, #08091a 0%, #10122e 100%)',
    cardBorder: 'rgba(139,92,246,0.22)',
    cardShadow: '0 0 24px rgba(139,92,246,0.12)',
    ball:  'radial-gradient(circle at 35% 30%, #c4b5fd 0%, #8b5cf6 40%, #5b21b6 76%, #2e1065 100%)',
    ballShadow: '0 6px 22px rgba(139,92,246,0.50), inset 0 -4px 8px rgba(0,0,0,0.30)',
    ballSize: 68,
    ballFont: 18,
    badgeBg: 'rgba(139,92,246,0.80)',
    bar: 'linear-gradient(90deg, #5b21b6, #8b5cf6, #c4b5fd)',
    barGlow: 'rgba(139,92,246,0.42)',
    countColor: 'rgba(196,181,253,0.88)',
    pulse: false,
  },
  {
    card:  'linear-gradient(148deg, #060814 0%, #0c0e25 100%)',
    cardBorder: 'rgba(59,130,246,0.18)',
    cardShadow: '0 0 18px rgba(59,130,246,0.09)',
    ball:  'radial-gradient(circle at 35% 30%, #93c5fd 0%, #3b82f6 42%, #1d4ed8 76%, #1e3a8a 100%)',
    ballShadow: '0 5px 18px rgba(59,130,246,0.44), inset 0 -4px 8px rgba(0,0,0,0.28)',
    ballSize: 58,
    ballFont: 16,
    badgeBg: 'rgba(59,130,246,0.78)',
    bar: 'linear-gradient(90deg, #1d4ed8, #3b82f6, #93c5fd)',
    barGlow: 'rgba(59,130,246,0.38)',
    countColor: 'rgba(147,197,253,0.78)',
    pulse: false,
  },
  {
    card:  'linear-gradient(148deg, #050710 0%, #090c1e 100%)',
    cardBorder: 'rgba(34,211,238,0.14)',
    cardShadow: 'none',
    ball:  'radial-gradient(circle at 35% 30%, #67e8f9 0%, #22d3ee 42%, #0891b2 76%, #164e63 100%)',
    ballShadow: '0 4px 14px rgba(34,211,238,0.38), inset 0 -3px 6px rgba(0,0,0,0.26)',
    ballSize: 50,
    ballFont: 14,
    badgeBg: 'rgba(34,211,238,0.75)',
    bar: 'linear-gradient(90deg, #0891b2, #22d3ee, #67e8f9)',
    barGlow: 'rgba(34,211,238,0.30)',
    countColor: 'rgba(103,232,249,0.65)',
    pulse: false,
  },
  {
    card:  'linear-gradient(148deg, #04060e 0%, #07091a 100%)',
    cardBorder: 'rgba(20,184,166,0.12)',
    cardShadow: 'none',
    ball:  'radial-gradient(circle at 35% 30%, #5eead4 0%, #14b8a6 42%, #0f766e 76%, #134e4a 100%)',
    ballShadow: '0 3px 12px rgba(20,184,166,0.32), inset 0 -3px 6px rgba(0,0,0,0.24)',
    ballSize: 44,
    ballFont: 12,
    badgeBg: 'rgba(20,184,166,0.72)',
    bar: 'linear-gradient(90deg, #0f766e, #14b8a6, #5eead4)',
    barGlow: 'rgba(20,184,166,0.25)',
    countColor: 'rgba(94,234,212,0.55)',
    pulse: false,
  },
];

const STYLE = `
  .htd-root {
    position: relative;
    background: linear-gradient(155deg, #06091a 0%, #0d1230 45%, #050817 100%);
    border: 1px solid rgba(99,102,241,0.18);
    border-radius: 22px;
    overflow: hidden;
  }
  .htd-root::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg,
      transparent 5%,
      rgba(99,102,241,0.55) 22%, rgba(167,139,250,0.85) 50%,
      rgba(99,102,241,0.55) 78%, transparent 95%
    );
  }
  .htd-glow-tr {
    position: absolute; width: 320px; height: 220px;
    top: -80px; right: -70px;
    background: radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%);
    filter: blur(44px); pointer-events: none;
  }
  .htd-glow-bl {
    position: absolute; width: 220px; height: 220px;
    bottom: -70px; left: -50px;
    background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%);
    filter: blur(38px); pointer-events: none;
  }
  .htd-star {
    position: absolute; border-radius: 50%; pointer-events: none;
    animation: htd-twinkle ease-in-out infinite;
    background: rgba(167,139,250,0.6);
  }
  .htd-s1 { width:2px;height:2px; left:8%;  top:18%; animation-duration:3.1s; animation-delay:0s;   }
  .htd-s2 { width:3px;height:3px; left:22%; top:60%; animation-duration:4.2s; animation-delay:0.9s; }
  .htd-s3 { width:2px;height:2px; left:55%; top:12%; animation-duration:2.8s; animation-delay:1.5s; }
  .htd-s4 { width:2px;height:2px; left:70%; top:70%; animation-duration:3.6s; animation-delay:2.2s; }
  .htd-s5 { width:3px;height:3px; left:88%; top:30%; animation-duration:4.0s; animation-delay:0.4s; }
  @keyframes htd-twinkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50%       { opacity: 1.0; transform: scale(1.5); }
  }
  .htd-hdr {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px; position: relative; z-index: 10;
  }
  .htd-hdr-l { display: flex; align-items: center; gap: 12px; }
  .htd-icon-box {
    width: 42px; height: 42px; border-radius: 14px;
    background: linear-gradient(135deg, #3730a3 0%, #6366f1 52%, #a5b4fc 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 22px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.18);
    flex-shrink: 0;
  }
  .htd-title {
    font-size: 16px; font-weight: 900; letter-spacing: -0.01em; margin: 0;
    background: linear-gradient(90deg, #c7d2fe 0%, #a5b4fc 50%, #818cf8 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .htd-subtitle {
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(165,180,252,0.48); margin-top: 1px;
  }
  .htd-top-badge {
    font-size: 10px; font-weight: 900; letter-spacing: 0.06em;
    background: rgba(99,102,241,0.11);
    border: 1px solid rgba(99,102,241,0.28);
    border-radius: 20px; padding: 5px 13px;
    color: rgba(165,180,252,0.75);
  }
  .htd-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    position: relative; z-index: 10; align-items: end;
  }
  @media (min-width: 640px) { .htd-grid { grid-template-columns: repeat(5, 1fr); } }
  .htd-card {
    position: relative; border-radius: 18px; overflow: hidden;
    display: flex; flex-direction: column; align-items: center;
    padding: 16px 8px 14px; gap: 8px;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: default;
  }
  .htd-card:hover { transform: translateY(-4px); }
  .htd-rank-badge {
    position: absolute; top: 0; right: 0;
    width: 26px; height: 26px;
    border-radius: 0 18px 0 16px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 900; color: #fff;
  }
  .htd-crown {
    font-size: 18px; line-height: 1;
    filter: drop-shadow(0 0 10px rgba(167,139,250,0.80));
    animation: htd-crown-rock 2.4s ease-in-out infinite;
    flex-shrink: 0;
  }
  @keyframes htd-crown-rock {
    0%, 100% { transform: rotate(-6deg) scale(1);   }
    50%       { transform: rotate(6deg) scale(1.05); }
  }
  .htd-ball {
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; color: #fff;
    position: relative; overflow: hidden; flex-shrink: 0;
    letter-spacing: -0.03em;
  }
  .htd-ball::after {
    content: '';
    position: absolute;
    top: 8%; left: 12%; width: 44%; height: 36%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.52) 0%, transparent 70%);
    border-radius: 50%;
  }
  .htd-ball-pulse { animation: htd-pulse-glow 2s ease-in-out infinite; }
  @keyframes htd-pulse-glow {
    0%, 100% { filter: none; }
    50%       { filter: drop-shadow(0 0 14px rgba(99,102,241,0.70)); }
  }
  .htd-count-num  { font-size: 15px; font-weight: 900; }
  .htd-count-unit { font-size: 9px; font-weight: 700; letter-spacing: 0.06em; color: rgba(165,180,252,0.32); }
  .htd-bar-track {
    width: 100%; height: 4px;
    background: rgba(255,255,255,0.05); border-radius: 9999px; overflow: hidden;
  }
  .htd-bar-fill {
    height: 100%; border-radius: 9999px;
    transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .htd-footer {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 18px; padding-top: 14px;
    border-top: 1px solid rgba(99,102,241,0.10);
    position: relative; z-index: 10;
  }
  .htd-footer-l { font-size: 11px; color: rgba(165,180,252,0.38); font-weight: 600; }
  .htd-footer-r { display: flex; align-items: center; gap: 5px; font-size: 10px; color: rgba(165,180,252,0.30); }
`;

export default function HotThreeDigits({ timeframe, typeId }) {
  const { stats, loading } = useStatistics(timeframe, typeId);
  if (loading || !stats?.hotThreeDigits?.length) return null;

  const { hotThreeDigits } = stats;
  const maxCount = hotThreeDigits[0]?.count || 1;

  return (
    <>
      <style>{STYLE}</style>
      <div className="htd-root p-6 sm:p-8">

        <div className="htd-glow-tr" />
        <div className="htd-glow-bl" />
        {[1,2,3,4,5].map(n => <div key={n} className={`htd-star htd-s${n}`} />)}

        {/* Header */}
        <div className="htd-hdr">
          <div className="htd-hdr-l">
            <div className="htd-icon-box">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontSize: 21, fontVariationSettings: "'FILL' 1" }}
              >
                filter_3
              </span>
            </div>
            <div>
              <h2 className="htd-title">3 ຕົວທ້າຍ ເດັ່ນ</h2>
              <p className="htd-subtitle">Hot 3-Digit Endings</p>
            </div>
          </div>
          <span className="htd-top-badge">ອອກຫຼາຍທີ່ສຸດ</span>
        </div>

        {/* Cards */}
        <div className="htd-grid">
          {hotThreeDigits.map(({ number, count }, i) => {
            const r      = RANKS[i] ?? RANKS[4];
            const barPct = Math.round((count / maxCount) * 100);
            const isFirst = i === 0;

            return (
              <div
                key={number}
                className="htd-card"
                style={{
                  background: r.card,
                  border:     `1px solid ${r.cardBorder}`,
                  boxShadow:  r.cardShadow,
                }}
              >
                <div className="htd-rank-badge" style={{ background: r.badgeBg }}>{i + 1}</div>

                {isFirst && <div className="htd-crown">👑</div>}

                <div
                  className={`htd-ball${r.pulse ? ' htd-ball-pulse' : ''}`}
                  style={{
                    width:      r.ballSize,
                    height:     r.ballSize,
                    fontSize:   r.ballFont,
                    background: r.ball,
                    boxShadow:  r.ballShadow,
                  }}
                >
                  <span style={{ position: 'relative', zIndex: 1 }}>{number}</span>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <span className="htd-count-num" style={{ color: r.countColor }}>{count}</span>
                  <p className="htd-count-unit">ຄັ້ງ</p>
                </div>

                <div className="htd-bar-track">
                  <div
                    className="htd-bar-fill"
                    style={{
                      width:      `${barPct}%`,
                      background: r.bar,
                      boxShadow:  `0 0 6px ${r.barGlow}`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="htd-footer">
          <p className="htd-footer-l">
            ສູງສຸດ:{' '}
            <span style={{ fontWeight: 900, color: 'rgba(165,180,252,0.80)' }}>
              {hotThreeDigits[0]?.count} ຄັ້ງ
            </span>
          </p>
          <div className="htd-footer-r">
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>info</span>
            3 ຕົວທ້າຍຈາກ 6 ຕົວເລກ
          </div>
        </div>

      </div>
    </>
  );
}
