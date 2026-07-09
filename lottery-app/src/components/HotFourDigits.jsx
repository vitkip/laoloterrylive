import { useStatistics } from '../hooks/useStatistics';

const RANKS = [
  {
    card:  'linear-gradient(148deg, #1f0a12 0%, #351425 100%)',
    cardBorder: 'rgba(236,72,153,0.30)',
    cardShadow: '0 0 36px rgba(236,72,153,0.18)',
    ball:  'radial-gradient(circle at 35% 30%, #f9a8d4 0%, #ec4899 38%, #9d174d 70%, #500724 100%)',
    ballShadow: '0 8px 32px rgba(236,72,153,0.60), inset 0 -5px 10px rgba(0,0,0,0.32)',
    ballSize: 80,
    ballFont: 18,
    badgeBg: 'rgba(236,72,153,0.85)',
    bar: 'linear-gradient(90deg, #9d174d, #ec4899, #f9a8d4)',
    barGlow: 'rgba(236,72,153,0.55)',
    countColor: '#f9a8d4',
    pulse: true,
  },
  {
    card:  'linear-gradient(148deg, #190819 0%, #2e0f2e 100%)',
    cardBorder: 'rgba(217,70,239,0.22)',
    cardShadow: '0 0 24px rgba(217,70,239,0.12)',
    ball:  'radial-gradient(circle at 35% 30%, #f0abfc 0%, #d946ef 40%, #86198f 76%, #4a044e 100%)',
    ballShadow: '0 6px 22px rgba(217,70,239,0.50), inset 0 -4px 8px rgba(0,0,0,0.30)',
    ballSize: 68,
    ballFont: 15,
    badgeBg: 'rgba(217,70,239,0.80)',
    bar: 'linear-gradient(90deg, #86198f, #d946ef, #f0abfc)',
    barGlow: 'rgba(217,70,239,0.42)',
    countColor: 'rgba(240,171,252,0.88)',
    pulse: false,
  },
  {
    card:  'linear-gradient(148deg, #14071c 0%, #240d33 100%)',
    cardBorder: 'rgba(168,85,247,0.18)',
    cardShadow: '0 0 18px rgba(168,85,247,0.09)',
    ball:  'radial-gradient(circle at 35% 30%, #d8b4fe 0%, #a855f7 42%, #6b21a8 76%, #3b0764 100%)',
    ballShadow: '0 5px 18px rgba(168,85,247,0.44), inset 0 -4px 8px rgba(0,0,0,0.28)',
    ballSize: 58,
    ballFont: 13,
    badgeBg: 'rgba(168,85,247,0.78)',
    bar: 'linear-gradient(90deg, #6b21a8, #a855f7, #d8b4fe)',
    barGlow: 'rgba(168,85,247,0.38)',
    countColor: 'rgba(216,180,254,0.78)',
    pulse: false,
  },
  {
    card:  'linear-gradient(148deg, #100616 0%, #1c0a26 100%)',
    cardBorder: 'rgba(232,121,249,0.14)',
    cardShadow: 'none',
    ball:  'radial-gradient(circle at 35% 30%, #f5d0fe 0%, #e879f9 42%, #a21caf 76%, #581c87 100%)',
    ballShadow: '0 4px 14px rgba(232,121,249,0.38), inset 0 -3px 6px rgba(0,0,0,0.26)',
    ballSize: 50,
    ballFont: 11,
    badgeBg: 'rgba(232,121,249,0.75)',
    bar: 'linear-gradient(90deg, #a21caf, #e879f9, #f5d0fe)',
    barGlow: 'rgba(232,121,249,0.30)',
    countColor: 'rgba(245,208,254,0.65)',
    pulse: false,
  },
  {
    card:  'linear-gradient(148deg, #0c0510 0%, #170819 100%)',
    cardBorder: 'rgba(192,38,211,0.12)',
    cardShadow: 'none',
    ball:  'radial-gradient(circle at 35% 30%, #f0abfc 0%, #c026d3 42%, #86198f 76%, #4a044e 100%)',
    ballShadow: '0 3px 12px rgba(192,38,211,0.32), inset 0 -3px 6px rgba(0,0,0,0.24)',
    ballSize: 44,
    ballFont: 10,
    badgeBg: 'rgba(192,38,211,0.72)',
    bar: 'linear-gradient(90deg, #86198f, #c026d3, #f0abfc)',
    barGlow: 'rgba(192,38,211,0.25)',
    countColor: 'rgba(240,171,252,0.55)',
    pulse: false,
  },
];

const STYLE = `
  .hfd-root {
    position: relative;
    background: linear-gradient(155deg, #170820 0%, #2a0e30 45%, #100617 100%);
    border: 1px solid rgba(217,70,239,0.18);
    border-radius: 22px;
    overflow: hidden;
  }
  .hfd-root::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg,
      transparent 5%,
      rgba(236,72,153,0.55) 22%, rgba(217,70,239,0.85) 50%,
      rgba(236,72,153,0.55) 78%, transparent 95%
    );
  }
  .hfd-glow-tr {
    position: absolute; width: 320px; height: 220px;
    top: -80px; right: -70px;
    background: radial-gradient(ellipse, rgba(236,72,153,0.12) 0%, transparent 70%);
    filter: blur(44px); pointer-events: none;
  }
  .hfd-glow-bl {
    position: absolute; width: 220px; height: 220px;
    bottom: -70px; left: -50px;
    background: radial-gradient(circle, rgba(217,70,239,0.08) 0%, transparent 70%);
    filter: blur(38px); pointer-events: none;
  }
  .hfd-star {
    position: absolute; border-radius: 50%; pointer-events: none;
    animation: hfd-twinkle ease-in-out infinite;
    background: rgba(240,171,252,0.6);
  }
  .hfd-s1 { width:2px;height:2px; left:8%;  top:18%; animation-duration:3.1s; animation-delay:0s;   }
  .hfd-s2 { width:3px;height:3px; left:22%; top:60%; animation-duration:4.2s; animation-delay:0.9s; }
  .hfd-s3 { width:2px;height:2px; left:55%; top:12%; animation-duration:2.8s; animation-delay:1.5s; }
  .hfd-s4 { width:2px;height:2px; left:70%; top:70%; animation-duration:3.6s; animation-delay:2.2s; }
  .hfd-s5 { width:3px;height:3px; left:88%; top:30%; animation-duration:4.0s; animation-delay:0.4s; }
  @keyframes hfd-twinkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50%       { opacity: 1.0; transform: scale(1.5); }
  }
  .hfd-hdr {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px; position: relative; z-index: 10;
  }
  .hfd-hdr-l { display: flex; align-items: center; gap: 12px; }
  .hfd-icon-box {
    width: 42px; height: 42px; border-radius: 14px;
    background: linear-gradient(135deg, #9d174d 0%, #ec4899 52%, #f9a8d4 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 22px rgba(236,72,153,0.55), inset 0 1px 0 rgba(255,255,255,0.18);
    flex-shrink: 0;
  }
  .hfd-title {
    font-size: 16px; font-weight: 900; letter-spacing: -0.01em; margin: 0;
    background: linear-gradient(90deg, #fbcfe8 0%, #f9a8d4 50%, #f0abfc 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .hfd-subtitle {
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(240,171,252,0.48); margin-top: 1px;
  }
  .hfd-top-badge {
    font-size: 10px; font-weight: 900; letter-spacing: 0.06em;
    background: rgba(236,72,153,0.11);
    border: 1px solid rgba(236,72,153,0.28);
    border-radius: 20px; padding: 5px 13px;
    color: rgba(249,168,212,0.75);
  }
  .hfd-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    position: relative; z-index: 10; align-items: end;
  }
  @media (min-width: 640px) { .hfd-grid { grid-template-columns: repeat(5, 1fr); } }
  .hfd-card {
    position: relative; border-radius: 18px; overflow: hidden;
    display: flex; flex-direction: column; align-items: center;
    padding: 16px 8px 14px; gap: 8px;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: default;
  }
  .hfd-card:hover { transform: translateY(-4px); }
  .hfd-rank-badge {
    position: absolute; top: 0; right: 0;
    width: 26px; height: 26px;
    border-radius: 0 18px 0 16px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 900; color: #fff;
  }
  .hfd-crown {
    font-size: 18px; line-height: 1;
    filter: drop-shadow(0 0 10px rgba(240,171,252,0.80));
    animation: hfd-crown-rock 2.4s ease-in-out infinite;
    flex-shrink: 0;
  }
  @keyframes hfd-crown-rock {
    0%, 100% { transform: rotate(-6deg) scale(1);   }
    50%       { transform: rotate(6deg) scale(1.05); }
  }
  .hfd-ball {
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; color: #fff;
    position: relative; overflow: hidden; flex-shrink: 0;
    letter-spacing: -0.05em;
  }
  .hfd-ball::after {
    content: '';
    position: absolute;
    top: 8%; left: 12%; width: 44%; height: 36%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.52) 0%, transparent 70%);
    border-radius: 50%;
  }
  .hfd-ball-pulse { animation: hfd-pulse-glow 2s ease-in-out infinite; }
  @keyframes hfd-pulse-glow {
    0%, 100% { filter: none; }
    50%       { filter: drop-shadow(0 0 14px rgba(236,72,153,0.70)); }
  }
  .hfd-count-num  { font-size: 15px; font-weight: 900; }
  .hfd-count-unit { font-size: 9px; font-weight: 700; letter-spacing: 0.06em; color: rgba(240,171,252,0.32); }
  .hfd-bar-track {
    width: 100%; height: 4px;
    background: rgba(255,255,255,0.05); border-radius: 9999px; overflow: hidden;
  }
  .hfd-bar-fill {
    height: 100%; border-radius: 9999px;
    transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .hfd-footer {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 18px; padding-top: 14px;
    border-top: 1px solid rgba(236,72,153,0.10);
    position: relative; z-index: 10;
  }
  .hfd-footer-l { font-size: 11px; color: rgba(240,171,252,0.38); font-weight: 600; }
  .hfd-footer-r { display: flex; align-items: center; gap: 5px; font-size: 10px; color: rgba(240,171,252,0.30); }
`;

export default function HotFourDigits({ timeframe, typeId }) {
  const { stats, loading } = useStatistics(timeframe, typeId);
  if (loading || !stats?.hotFourDigits?.length) return null;

  const { hotFourDigits } = stats;
  const maxCount = hotFourDigits[0]?.count || 1;

  return (
    <>
      <style>{STYLE}</style>
      <div className="hfd-root p-6 sm:p-8">

        <div className="hfd-glow-tr" />
        <div className="hfd-glow-bl" />
        {[1,2,3,4,5].map(n => <div key={n} className={`hfd-star hfd-s${n}`} />)}

        {/* Header */}
        <div className="hfd-hdr">
          <div className="hfd-hdr-l">
            <div className="hfd-icon-box">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontSize: 21, fontVariationSettings: "'FILL' 1" }}
              >
                filter_4
              </span>
            </div>
            <div>
              <h2 className="hfd-title">4 ຕົວທ້າຍ ເດັ່ນ (ພັດທະນາ)</h2>
              <p className="hfd-subtitle">Hot 4-Digit Endings</p>
            </div>
          </div>
          <span className="hfd-top-badge">ອອກຫຼາຍທີ່ສຸດ</span>
        </div>

        {/* Cards */}
        <div className="hfd-grid">
          {hotFourDigits.map(({ number, count }, i) => {
            const r      = RANKS[i] ?? RANKS[4];
            const barPct = Math.round((count / maxCount) * 100);
            const isFirst = i === 0;

            return (
              <div
                key={number}
                className="hfd-card"
                style={{
                  background: r.card,
                  border:     `1px solid ${r.cardBorder}`,
                  boxShadow:  r.cardShadow,
                }}
              >
                <div className="hfd-rank-badge" style={{ background: r.badgeBg }}>{i + 1}</div>

                {isFirst && <div className="hfd-crown">👑</div>}

                <div
                  className={`hfd-ball${r.pulse ? ' hfd-ball-pulse' : ''}`}
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
                  <span className="hfd-count-num" style={{ color: r.countColor }}>{count}</span>
                  <p className="hfd-count-unit">ຄັ້ງ</p>
                </div>

                <div className="hfd-bar-track">
                  <div
                    className="hfd-bar-fill"
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
        <div className="hfd-footer">
          <p className="hfd-footer-l">
            ສູງສຸດ:{' '}
            <span style={{ fontWeight: 900, color: 'rgba(249,168,212,0.80)' }}>
              {hotFourDigits[0]?.count} ຄັ້ງ
            </span>
          </p>
          <div className="hfd-footer-r">
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>info</span>
            4 ຕົວທ້າຍຈາກ 6 ຕົວເລກ
          </div>
        </div>

      </div>
    </>
  );
}
