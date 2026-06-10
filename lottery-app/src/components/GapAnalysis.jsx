import { useStatistics } from '../hooks/useStatistics';

/* ─── Urgency config by overdueRatio ────────────────────────── */
const urgencyConfig = (ratio) => {
  if (ratio >= 2)   return {
    tier: 'critical',
    ball:  'radial-gradient(circle at 35% 30%, #ff6b6b 0%, #dc2626 42%, #7f1d1d 100%)',
    glow:  'rgba(220,38,38,0.50)',
    neon:  '#ef4444',
    bar:   'linear-gradient(90deg, #dc2626, #ef4444, #ff6b6b)',
    badge: { bg: 'rgba(220,38,38,0.14)', border: 'rgba(220,38,38,0.35)', text: '#f87171' },
    row:   'rgba(220,38,38,0.06)',
    rowBorder: 'rgba(220,38,38,0.18)',
    label: 'rgba(248,113,113,0.85)',
  };
  if (ratio >= 1.5) return {
    tier: 'high',
    ball:  'radial-gradient(circle at 35% 30%, #ffd060 0%, #f59e0b 42%, #b45309 100%)',
    glow:  'rgba(245,158,11,0.45)',
    neon:  '#f59e0b',
    bar:   'linear-gradient(90deg, #d97706, #f59e0b, #fcd34d)',
    badge: { bg: 'rgba(245,158,11,0.13)', border: 'rgba(245,158,11,0.32)', text: '#fbbf24' },
    row:   'rgba(245,158,11,0.05)',
    rowBorder: 'rgba(245,158,11,0.15)',
    label: 'rgba(251,191,36,0.85)',
  };
  if (ratio >= 1)   return {
    tier: 'moderate',
    ball:  'radial-gradient(circle at 35% 30%, #60a5fa 0%, #2563eb 42%, #1e3a8a 100%)',
    glow:  'rgba(37,99,235,0.40)',
    neon:  '#3b82f6',
    bar:   'linear-gradient(90deg, #1d4ed8, #3b82f6, #93c5fd)',
    badge: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.28)', text: '#60a5fa' },
    row:   'rgba(59,130,246,0.04)',
    rowBorder: 'rgba(59,130,246,0.12)',
    label: 'rgba(96,165,250,0.85)',
  };
  return {
    tier: 'normal',
    ball:  'radial-gradient(circle at 35% 30%, #9ca3af 0%, #4b5563 42%, #1f2937 100%)',
    glow:  'rgba(75,85,99,0.30)',
    neon:  '#6b7280',
    bar:   'linear-gradient(90deg, #374151, #6b7280)',
    badge: { bg: 'rgba(107,114,128,0.10)', border: 'rgba(107,114,128,0.22)', text: '#9ca3af' },
    row:   'rgba(107,114,128,0.03)',
    rowBorder: 'rgba(107,114,128,0.10)',
    label: 'rgba(156,163,175,0.75)',
  };
};

/* ─── Inline styles ─────────────────────────────────────────── */
const STYLE = `
  /* ── Root card ── */
  .ga-root {
    position: relative;
    background: linear-gradient(155deg, #0a0c18 0%, #0e1120 50%, #080a15 100%);
    border: 1px solid rgba(245,158,11,0.14);
    border-radius: 22px;
    overflow: hidden;
  }
  .ga-root::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg,
      transparent 5%,
      rgba(220,38,38,0.6) 20%, rgba(245,158,11,0.8) 40%,
      rgba(245,158,11,0.8) 60%, rgba(220,38,38,0.6) 80%,
      transparent 95%
    );
  }

  /* Ambient glows */
  .ga-glow-r {
    position: absolute; width: 250px; height: 250px;
    bottom: -80px; left: -60px;
    background: radial-gradient(circle, rgba(220,38,38,0.07) 0%, transparent 70%);
    filter: blur(40px); pointer-events: none;
  }
  .ga-glow-a {
    position: absolute; width: 220px; height: 220px;
    top: -60px; right: -60px;
    background: radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%);
    filter: blur(36px); pointer-events: none;
  }

  /* ── Header ── */
  .ga-hdr {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px;
  }
  .ga-hdr-left { display: flex; align-items: center; gap: 12px; }

  .ga-icon-box {
    width: 40px; height: 40px; border-radius: 13px; flex-shrink: 0;
    background: linear-gradient(135deg, #b45309 0%, #f59e0b 55%, #fcd34d 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 20px rgba(245,158,11,0.45), inset 0 1px 0 rgba(255,255,255,0.2);
  }
  .ga-title {
    font-size: 15px; font-weight: 900; letter-spacing: -0.01em; margin: 0;
    background: linear-gradient(90deg, #fde68a 0%, #f59e0b 50%, #fbbf24 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .ga-subtitle { font-size: 10px; font-weight: 700; color: rgba(245,158,11,0.45); letter-spacing: 0.1em; margin-top: 1px; }

  /* Legend */
  .ga-legend {
    display: none; align-items: center; gap: 12px;
    font-size: 9px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase;
  }
  @media (min-width: 640px) { .ga-legend { display: flex; } }
  .ga-legend-dot {
    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
    display: inline-block; margin-right: 4px;
  }
  .ga-legend-item { display: flex; align-items: center; color: rgba(255,255,255,0.28); white-space: nowrap; }

  /* ── Row ── */
  .ga-row {
    border-radius: 14px;
    border: 1px solid transparent;
    padding: 12px 14px;
    display: flex; align-items: center; gap: 12px;
    transition: transform 0.18s, box-shadow 0.18s;
    position: relative;
    overflow: hidden;
  }
  .ga-row:hover { transform: translateY(-1px); }

  /* Shimmer on critical rows */
  .ga-row-critical::after {
    content: '';
    position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
    background: linear-gradient(105deg, transparent 40%, rgba(220,38,38,0.06) 50%, transparent 60%);
    animation: ga-row-shimmer 3.5s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes ga-row-shimmer {
    0%   { left: -100%; }
    100% { left: 150%; }
  }

  /* Rank numeral */
  .ga-rank {
    font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.20);
    width: 16px; text-align: center; flex-shrink: 0;
  }

  /* ── Lottery ball ── */
  .ga-ball {
    width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 900;
    position: relative; overflow: hidden;
  }
  /* Specular highlight */
  .ga-ball::after {
    content: '';
    position: absolute;
    top: 8%; left: 12%; width: 42%; height: 34%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.50) 0%, transparent 70%);
    border-radius: 50%;
  }
  /* Pulse ring for critical */
  .ga-ball-pulse {
    position: absolute; inset: -6px; border-radius: 50%;
    border: 1.5px solid currentColor;
    animation: ga-pulse-ring 2s ease-out infinite;
    pointer-events: none;
  }
  @keyframes ga-pulse-ring {
    0%   { opacity: 0.6; transform: scale(1);    }
    100% { opacity: 0;   transform: scale(1.45); }
  }

  /* OVERDUE badge on critical */
  .ga-overdue-badge {
    position: absolute; top: -4px; right: -4px;
    font-size: 7px; font-weight: 900; letter-spacing: 0.06em;
    background: #dc2626; color: #fff;
    border-radius: 4px; padding: 1px 4px;
    z-index: 2; line-height: 1.4;
    animation: ga-badge-pop 1.5s ease-in-out infinite;
  }
  @keyframes ga-badge-pop {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.08); }
  }

  /* ── Bar ── */
  .ga-bar-track {
    flex: 1; min-width: 0;
  }
  .ga-bar-top {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 6px;
  }
  .ga-missed-label { font-size: 11px; font-weight: 800; }
  .ga-avg-label    { font-size: 10px; color: rgba(255,255,255,0.25); font-weight: 600; }

  .ga-bar-bg {
    height: 5px; width: 100%;
    background: rgba(255,255,255,0.05);
    border-radius: 9999px; overflow: hidden;
  }
  .ga-bar-fill {
    height: 100%; border-radius: 9999px;
    transition: width 0.7s cubic-bezier(0.34,1.56,0.64,1);
  }

  /* ── Ratio badge ── */
  .ga-ratio {
    font-size: 13px; font-weight: 900; letter-spacing: -0.02em;
    padding: 5px 10px; border-radius: 9px;
    flex-shrink: 0; text-align: center;
  }
  .ga-count {
    font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.22);
    text-align: center; margin-top: 2px;
  }

  /* ── Footer note ── */
  .ga-note {
    display: flex; align-items: flex-start; gap: 6px;
    font-size: 10px; color: rgba(255,255,255,0.22);
    margin-top: 18px; line-height: 1.55;
  }

  /* Divider */
  .ga-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(245,158,11,0.10), transparent);
    margin: 3px 0;
  }
`;

/* ─────────────────────────────────────────────────────────────── */
export default function GapAnalysis({ timeframe }) {
  const { stats, loading } = useStatistics(timeframe);
  if (loading || !stats) return null;
  const { gapAnalysis } = stats;
  const maxMissed = gapAnalysis[0]?.missedRounds || 1;

  return (
    <>
      <style>{STYLE}</style>
      <div className="ga-root p-6 sm:p-7">

        {/* Ambient glows */}
        <div className="ga-glow-r" />
        <div className="ga-glow-a" />

        {/* ── Header ── */}
        <div className="ga-hdr relative z-10">
          <div className="ga-hdr-left">
            <div className="ga-icon-box">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
              >
                hourglass_top
              </span>
            </div>
            <div>
              <h2 className="ga-title">Gap Analysis</h2>
              <p className="ga-subtitle">OVERDUE NUMBERS · TOP 10</p>
            </div>
          </div>

          {/* Legend */}
          <div className="ga-legend">
            {[
              { color: '#ef4444', label: '≥ 2×' },
              { color: '#f59e0b', label: '≥ 1.5×' },
              { color: '#3b82f6', label: '≥ 1×' },
            ].map(l => (
              <span key={l.label} className="ga-legend-item">
                <span className="ga-legend-dot" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Rows ── */}
        <div className="space-y-2 relative z-10">
          {gapAnalysis.map(({ number, count, missedRounds, expectedGap, overdueRatio }, i) => {
            const cfg     = urgencyConfig(overdueRatio);
            const barPct  = Math.round((missedRounds / maxMissed) * 100);
            const isCrit  = cfg.tier === 'critical';
            const isHigh  = cfg.tier === 'high';

            return (
              <div key={number}>
                {i > 0 && <div className="ga-divider" />}
                <div
                  className={`ga-row${isCrit ? ' ga-row-critical' : ''}`}
                  style={{
                    background: cfg.row,
                    borderColor: cfg.rowBorder,
                    boxShadow: (isCrit || isHigh) ? `0 0 20px ${cfg.glow}18` : 'none',
                  }}
                >
                  {/* Rank */}
                  <span className="ga-rank">{i + 1}</span>

                  {/* Lottery ball */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {isCrit && (
                      <div
                        className="ga-ball-pulse"
                        style={{ color: cfg.neon }}
                      />
                    )}
                    {isCrit && <div className="ga-overdue-badge">HOT</div>}
                    <div
                      className="ga-ball"
                      style={{
                        background: cfg.ball,
                        boxShadow: `0 4px 16px ${cfg.glow}, inset 0 -3px 6px rgba(0,0,0,0.30)`,
                        color: isCrit ? '#fff' : isHigh ? '#78350f' : '#fff',
                      }}
                    >
                      <span style={{ position: 'relative', zIndex: 1, fontSize: 14, fontWeight: 900 }}>
                        {number}
                      </span>
                    </div>
                  </div>

                  {/* Bar + labels */}
                  <div className="ga-bar-track">
                    <div className="ga-bar-top">
                      <span className="ga-missed-label" style={{ color: cfg.label }}>
                        ບໍ່ອອກ {missedRounds} ງວດ
                      </span>
                      <span className="ga-avg-label">ສະເລ່ຍ {expectedGap} ງວດ</span>
                    </div>
                    <div className="ga-bar-bg">
                      <div
                        className="ga-bar-fill"
                        style={{
                          width: `${barPct}%`,
                          background: cfg.bar,
                          boxShadow: `0 0 8px ${cfg.glow}`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Ratio + count (right) */}
                  <div>
                    <div
                      className="ga-ratio"
                      style={{
                        background: cfg.badge.bg,
                        border: `1px solid ${cfg.badge.border}`,
                        color: cfg.badge.text,
                      }}
                    >
                      {overdueRatio.toFixed(1)}×
                    </div>
                    <div className="ga-count">ອອກ {count}×</div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer note ── */}
        <p className="ga-note relative z-10">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}
          >
            info
          </span>
          ຄ່າ ×N = ເກີນຄ່າສະເລ່ຍ N ເທື່ອ — ຍິ່ງສູງ ຍິ່ງ "ເກີນ" ຄ່າໂດຍທຳມະດາ
        </p>

      </div>
    </>
  );
}
