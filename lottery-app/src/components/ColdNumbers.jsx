import { useStatistics } from '../hooks/useStatistics';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao+Looped:wght@300;400;500;600;700;900&display=swap');

  .cn-root {
    font-family: 'Noto Sans Lao Looped', sans-serif;
  }

  /* ── Outer card ── */
  .cn-card {
    position: relative;
    background: linear-gradient(160deg, #0A0F20 0%, #080C1A 55%, #050810 100%);
    border: 1px solid rgba(147,197,253,0.12);
    border-radius: 20px;
    padding: 24px 20px 20px;
    overflow: hidden;
  }
  .cn-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent 5%, rgba(147,197,253,0.5) 50%, transparent 95%);
  }

  /* Frost glow decorations */
  .cn-glow-1 {
    position: absolute;
    width: 220px; height: 220px;
    border-radius: 50%;
    bottom: -70px; left: -70px;
    background: radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%);
    filter: blur(30px);
    pointer-events: none;
  }
  .cn-glow-2 {
    position: absolute;
    width: 160px; height: 160px;
    border-radius: 50%;
    top: -40px; right: -40px;
    background: radial-gradient(circle, rgba(147,197,253,0.06) 0%, transparent 70%);
    filter: blur(24px);
    pointer-events: none;
  }
  /* Frost crystal deco — top right */
  .cn-crystal {
    position: absolute;
    top: 16px; right: 16px;
    opacity: 0.06;
    pointer-events: none;
  }

  /* ── Header ── */
  .cn-header {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px; position: relative; z-index: 1;
  }
  .cn-icon-box {
    width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(96,165,250,0.2) 0%, rgba(59,130,246,0.08) 100%);
    border: 1px solid rgba(147,197,253,0.22);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 16px rgba(96,165,250,0.12);
  }
  .cn-icon-box .mat-icon {
    font-size: 20px !important;
    color: #93c5fd;
    text-shadow: 0 0 10px rgba(147,197,253,0.6);
  }
  .cn-title {
    font-size: 15px; font-weight: 800; color: #E8E6F0; line-height: 1.2;
  }
  .cn-subtitle {
    font-size: 10px; font-weight: 600; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(147,197,253,0.55);
    margin-top: 2px;
  }

  /* ── Divider ── */
  .cn-divider {
    height: 1px; margin-bottom: 16px;
    background: linear-gradient(90deg, transparent, rgba(147,197,253,0.1), transparent);
    position: relative; z-index: 1;
  }

  /* ── Row item ── */
  .cn-item {
    position: relative;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(147,197,253,0.08);
    border-radius: 14px;
    padding: 12px 14px 10px;
    margin-bottom: 8px;
    transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s;
    overflow: hidden;
  }
  .cn-item:last-child { margin-bottom: 0; }
  .cn-item:hover {
    transform: translateY(-2px);
    border-color: rgba(147,197,253,0.2);
    box-shadow: 0 6px 20px rgba(0,0,0,0.35), 0 0 16px rgba(96,165,250,0.06);
  }
  /* left accent based on intensity */
  .cn-item::before {
    content: '';
    position: absolute; left: 0; top: 15%; bottom: 15%;
    width: 3px; border-radius: 0 3px 3px 0;
  }
  .cn-item-hot::before  { background: linear-gradient(180deg, #60a5fa, #3b82f6); box-shadow: 0 0 8px rgba(96,165,250,0.6); }
  .cn-item-mid::before  { background: linear-gradient(180deg, #7dd3fc, #0ea5e9); box-shadow: 0 0 8px rgba(125,211,252,0.5); }
  .cn-item-mild::before { background: linear-gradient(180deg, #a5f3fc, #22d3ee); box-shadow: 0 0 8px rgba(165,243,252,0.4); }

  /* ── Row content ── */
  .cn-row-top {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 9px;
  }
  .cn-row-left { display: flex; align-items: center; gap: 10px; }

  /* Number tile */
  .cn-num-tile {
    width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 900; color: #E8F4FF;
    position: relative; overflow: hidden;
    box-shadow: inset 0 1px 2px rgba(255,255,255,0.12);
  }
  .cn-num-tile::after {
    content: '';
    position: absolute; top: 3px; left: 6px;
    width: 10px; height: 6px;
    background: rgba(255,255,255,0.18);
    border-radius: 50%; transform: rotate(-20deg);
  }
  .cn-num-hot  { background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%); border: 1px solid rgba(96,165,250,0.35); }
  .cn-num-mid  { background: linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0ea5e9 100%); border: 1px solid rgba(125,211,252,0.3); }
  .cn-num-mild { background: linear-gradient(135deg, #164e63 0%, #0891b2 50%, #22d3ee 100%); border: 1px solid rgba(165,243,252,0.25); }

  /* Rank + label */
  .cn-rank {
    font-size: 10px; font-weight: 700;
    color: rgba(212,175,55,0.65);
    letter-spacing: 0.05em;
  }
  .cn-label {
    font-size: 10px; font-weight: 500;
    color: rgba(255,255,255,0.28);
    margin-top: 1px;
  }

  /* Miss count */
  .cn-missed-val {
    font-size: 22px; font-weight: 900; line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .cn-missed-hot  { color: #93c5fd; text-shadow: 0 0 12px rgba(147,197,253,0.5); }
  .cn-missed-mid  { color: #7dd3fc; text-shadow: 0 0 10px rgba(125,211,252,0.45); }
  .cn-missed-mild { color: #a5f3fc; text-shadow: 0 0 10px rgba(165,243,252,0.4); }
  .cn-missed-unit {
    font-size: 10px; font-weight: 600;
    color: rgba(255,255,255,0.28); margin-top: 2px;
  }

  /* ── Progress bar ── */
  .cn-bar-track {
    height: 4px; border-radius: 4px; overflow: hidden;
    background: rgba(147,197,253,0.07);
  }
  .cn-bar-fill {
    height: 100%; border-radius: 4px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }
  .cn-bar-fill::after {
    content: '';
    position: absolute; right: 0; top: 0; bottom: 0;
    width: 4px; background: rgba(255,255,255,0.6);
    border-radius: 50%; box-shadow: 0 0 6px rgba(147,197,253,0.9);
  }
  .cn-bar-hot  { background: linear-gradient(90deg, #1d4ed8, #60a5fa); }
  .cn-bar-mid  { background: linear-gradient(90deg, #0369a1, #7dd3fc); }
  .cn-bar-mild { background: linear-gradient(90deg, #164e63, #a5f3fc); }

  /* ── Skeleton ── */
  .cn-skeleton-item {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(147,197,253,0.06);
    border-radius: 14px; padding: 12px 14px;
    margin-bottom: 8px;
  }
  .cn-skel {
    border-radius: 5px;
    background: linear-gradient(90deg,
      rgba(147,197,253,0.04) 0%,
      rgba(147,197,253,0.09) 50%,
      rgba(147,197,253,0.04) 100%);
    background-size: 200% 100%;
    animation: cn-shimmer 1.7s ease-in-out infinite;
  }
  @keyframes cn-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Footer note ── */
  .cn-footer {
    display: flex; align-items: flex-start; gap: 6px;
    margin-top: 14px; position: relative; z-index: 1;
    font-size: 10px; font-weight: 500; line-height: 1.6;
    color: rgba(147,197,253,0.4);
  }
  .cn-footer .mat-icon { font-size: 12px !important; margin-top: 1px; flex-shrink: 0; }
`;

function intensityClass(ratio) {
  if (ratio > 0.85) return 'hot';
  if (ratio > 0.50) return 'mid';
  return 'mild';
}

function SkeletonItem() {
  return (
    <div className="cn-skeleton-item">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="cn-skel" style={{ width: 40, height: 40, borderRadius: 12 }} />
          <div>
            <div className="cn-skel" style={{ width: 48, height: 9, marginBottom: 5 }} />
            <div className="cn-skel" style={{ width: 32, height: 8 }} />
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="cn-skel" style={{ width: 36, height: 20, marginBottom: 4 }} />
          <div className="cn-skel" style={{ width: 20, height: 8 }} />
        </div>
      </div>
      <div className="cn-skel" style={{ height: 4, borderRadius: 4 }} />
    </div>
  );
}

export default function ColdNumbers({ timeframe }) {
  const { stats, loading } = useStatistics(timeframe);
  const coldNumbers = stats?.coldNumbers ?? [];
  const maxMissed   = coldNumbers[0]?.missedRounds || 1;

  return (
    <div className="cn-root cn-card md:col-span-4">
      <style>{STYLE}</style>

      {/* Decorations */}
      <div className="cn-glow-1" />
      <div className="cn-glow-2" />

      {/* Frost crystal SVG */}
      <svg className="cn-crystal" width="96" height="96" viewBox="0 0 96 96" fill="none">
        <line x1="48" y1="4"  x2="48" y2="92" stroke="#93c5fd" strokeWidth="2"/>
        <line x1="4"  y1="48" x2="92" y2="48" stroke="#93c5fd" strokeWidth="2"/>
        <line x1="16" y1="16" x2="80" y2="80" stroke="#93c5fd" strokeWidth="1.5"/>
        <line x1="80" y1="16" x2="16" y2="80" stroke="#93c5fd" strokeWidth="1.5"/>
        <circle cx="48" cy="48" r="8" stroke="#93c5fd" strokeWidth="1.5"/>
        {[0,60,120,180,240,300].map((deg, i) => {
          const r = 26;
          const x = 48 + r * Math.cos((deg - 90) * Math.PI / 180);
          const y = 48 + r * Math.sin((deg - 90) * Math.PI / 180);
          return <circle key={i} cx={x} cy={y} r="3" stroke="#93c5fd" strokeWidth="1"/>;
        })}
      </svg>

      {/* Header */}
      <div className="cn-header">
        <div className="cn-icon-box">
          <span className="material-symbols-outlined mat-icon"
            style={{ fontVariationSettings: "'FILL' 1" }}>ac_unit</span>
        </div>
        <div>
          <div className="cn-title">ເລກດັບ</div>
          <div className="cn-subtitle">Cold Numbers</div>
        </div>
      </div>

      <div className="cn-divider" />

      {/* Items */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {loading || !stats ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)
        ) : (
          coldNumbers.map(({ number, missedRounds }, i) => {
            const ratio   = missedRounds / maxMissed;
            const level   = intensityClass(ratio);
            const barPct  = Math.round(ratio * 100);

            return (
              <div key={number} className={`cn-item cn-item-${level}`}>
                <div className="cn-row-top">
                  <div className="cn-row-left">
                    <div className={`cn-num-tile cn-num-${level}`}>{number}</div>
                    <div>
                      <div className="cn-rank">ອັນດັບ {i + 1}</div>
                      <div className="cn-label">ບໍ່ອອກ</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={`cn-missed-val cn-missed-${level}`}>{missedRounds}</div>
                    <div className="cn-missed-unit">ງວດ</div>
                  </div>
                </div>

                <div className="cn-bar-track">
                  <div className={`cn-bar-fill cn-bar-${level}`} style={{ width: `${barPct}%` }} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <p className="cn-footer">
        <span className="material-symbols-outlined mat-icon">info</span>
        ຕົວເລກທີ່ຍາວນານທີ່ສຸດທີ່ຍັງບໍ່ໄດ້ອອກໃນ 2 ຕົວສຸດທ້າຍ
      </p>
    </div>
  );
}
