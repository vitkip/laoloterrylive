import { useStatistics } from '../hooks/useStatistics';

/* ─── Neon spectrum palette (digit 0 → 9) ───────────────────── */
const SPECTRUM = [
  { neon: '#a78bfa', deep: '#3b0764', glow: 'rgba(167,139,250,0.50)' }, // 0 violet
  { neon: '#60a5fa', deep: '#1e3a8a', glow: 'rgba(96,165,250,0.50)'  }, // 1 blue
  { neon: '#22d3ee', deep: '#164e63', glow: 'rgba(34,211,238,0.50)'  }, // 2 cyan
  { neon: '#2dd4bf', deep: '#134e4a', glow: 'rgba(45,212,191,0.50)'  }, // 3 teal
  { neon: '#4ade80', deep: '#14532d', glow: 'rgba(74,222,128,0.50)'  }, // 4 green
  { neon: '#a3e635', deep: '#365314', glow: 'rgba(163,230,53,0.50)'  }, // 5 lime
  { neon: '#facc15', deep: '#713f12', glow: 'rgba(250,204,21,0.50)'  }, // 6 yellow
  { neon: '#fb923c', deep: '#7c2d12', glow: 'rgba(251,146,60,0.50)'  }, // 7 orange
  { neon: '#f87171', deep: '#7f1d1d', glow: 'rgba(248,113,113,0.50)' }, // 8 rose
  { neon: '#ef4444', deep: '#450a0a', glow: 'rgba(239,68,68,0.50)'   }, // 9 red
];

/* ─── Inline styles ─────────────────────────────────────────── */
const STYLE = `
  .dd-root { /* no card — sits inside parent card */ }

  /* ── Header ── */
  .dd-header {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 18px;
  }
  .dd-icon-box {
    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
    background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 18px rgba(124,58,237,0.40), inset 0 1px 0 rgba(255,255,255,0.18);
  }
  .dd-title {
    font-size: 15px; font-weight: 900; letter-spacing: -0.01em; margin: 0;
    background: linear-gradient(
      90deg,
      #a78bfa 0%, #60a5fa 18%, #22d3ee 36%,
      #4ade80 54%, #facc15 72%, #f87171 90%
    );
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .dd-sub {
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(167,139,250,0.45); margin-top: 2px;
  }

  /* ── Chart container ── */
  .dd-chart-wrap {
    position: relative;
    background: #080c18;
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 16px;
    overflow: hidden;
    /* top padding: room for crown + pct labels above tallest bar */
    padding: 38px 12px 0;
  }

  /* ── Bars row ── */
  .dd-bars-row {
    height: 168px;
    display: flex;
    align-items: stretch;
    gap: 4px;
    position: relative;
  }

  /* Grid lines overlay inside bars-row */
  .dd-grid-overlay {
    position: absolute; inset: 0;
    pointer-events: none; z-index: 0;
  }
  .dd-gridline {
    position: absolute; left: 0; right: 0; height: 1px;
    background: rgba(255,255,255,0.042);
  }

  /* ── Each digit column ── */
  .dd-col {
    flex: 1;
    position: relative;
    z-index: 1;
    cursor: default;
  }
  .dd-col:hover .dd-bar     { filter: brightness(1.28); }
  .dd-col:hover .dd-pct     { opacity: 1 !important; }
  .dd-col:hover .dd-bar-glow { opacity: 1 !important; }

  /* Crown ✦ on tallest */
  .dd-crown {
    position: absolute; left: 0; right: 0;
    text-align: center; font-size: 11px;
    z-index: 4; pointer-events: none;
    filter: drop-shadow(0 0 6px rgba(250,204,21,0.75));
    animation: dd-crown-pulse 2s ease-in-out infinite;
  }
  @keyframes dd-crown-pulse {
    0%, 100% { opacity: 1;    transform: scale(1); }
    50%       { opacity: 0.6; transform: scale(1.3); }
  }

  /* Percent label above bar */
  .dd-pct {
    position: absolute; left: 0; right: 0;
    text-align: center;
    font-size: 8px; font-weight: 900; line-height: 1;
    opacity: 0.72;
    transition: opacity 0.2s;
    z-index: 3; white-space: nowrap;
  }

  /* Bar */
  .dd-bar {
    position: absolute;
    bottom: 0; left: 9%; right: 9%;
    border-radius: 5px 5px 0 0;
    min-height: 3px;
    transform-origin: bottom center;
    animation: dd-grow 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    overflow: hidden;
    transition: filter 0.2s;
    z-index: 2;
  }
  @keyframes dd-grow {
    from { transform: scaleY(0); }
    to   { transform: scaleY(1); }
  }

  /* Glossy vertical sheen inside bar */
  .dd-sheen {
    position: absolute; top: 0; left: 0; width: 38%; bottom: 0;
    background: linear-gradient(to right, rgba(255,255,255,0.20), transparent);
    pointer-events: none;
  }
  /* Top-cap horizontal shimmer */
  .dd-cap {
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: rgba(255,255,255,0.35);
    border-radius: 5px 5px 0 0;
  }

  /* Glow halo cast below bar on floor */
  .dd-bar-glow {
    position: absolute;
    bottom: 0; left: 9%; right: 9%; height: 8px;
    border-radius: 50%;
    opacity: 0.5;
    filter: blur(6px);
    transition: opacity 0.2s;
    z-index: 1;
  }

  /* ── Bottom labels + spectrum strip ── */
  .dd-bottom {
    background: #080c18;
    padding: 0 0 0;
  }
  .dd-digits-row {
    display: flex; gap: 4px;
    padding: 7px 12px 0;
  }
  .dd-digit {
    flex: 1; text-align: center;
    font-size: 12px; font-weight: 900;
  }

  /* Spectrum gradient strip at very bottom */
  .dd-spectrum {
    height: 4px; margin-top: 8px;
    background: linear-gradient(90deg,
      #a78bfa, #60a5fa, #22d3ee, #2dd4bf,
      #4ade80, #a3e635, #facc15, #fb923c, #f87171, #ef4444
    );
  }
`;

/* Grid lines at these heights (% of bar area from bottom) */
const GRID_LINES = [20, 40, 60, 80];

/* ─────────────────────────────────────────────────────────────── */
export default function DigitDistribution({ timeframe }) {
  const { stats, loading } = useStatistics(timeframe);
  if (loading || !stats) return null;
  const { digitDistributions } = stats;

  const maxIdx = digitDistributions.reduce(
    (mi, d, i, arr) => (d.barWidth > arr[mi].barWidth ? i : mi),
    0
  );

  return (
    <>
      <style>{STYLE}</style>
      <div className="dd-root">

        {/* ── Header ── */}
        <div className="dd-header">
          <div className="dd-icon-box">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18, color: '#fff', fontVariationSettings: "'FILL' 1" }}
            >
              bar_chart
            </span>
          </div>
          <div>
            <h3 className="dd-title">ການກະຈາຍຕົວເລກ 0–9</h3>
            <p className="dd-sub">Digit Frequency Spectrum</p>
          </div>
        </div>

        {/* ── Chart ── */}
        <div className="dd-chart-wrap">

          {/* Bars row */}
          <div className="dd-bars-row">

            {/* Horizontal grid lines */}
            <div className="dd-grid-overlay">
              {GRID_LINES.map(pct => (
                <div
                  key={pct}
                  className="dd-gridline"
                  style={{ bottom: `${pct}%` }}
                />
              ))}
            </div>

            {/* Digit columns */}
            {digitDistributions.map(({ digit, percent, barWidth }, i) => {
              const col  = SPECTRUM[i] ?? SPECTRUM[9];
              const isTallest = i === maxIdx;

              return (
                <div key={digit} className="dd-col">

                  {/* Crown on tallest */}
                  {isTallest && (
                    <div
                      className="dd-crown"
                      style={{ bottom: `calc(${barWidth}% + 20px)`, color: '#facc15' }}
                    >
                      ✦
                    </div>
                  )}

                  {/* Percent label floating above bar */}
                  <div
                    className="dd-pct"
                    style={{
                      bottom: `calc(${barWidth}% + 3px)`,
                      color: col.neon,
                    }}
                  >
                    {percent}%
                  </div>

                  {/* Floor glow halo */}
                  <div
                    className="dd-bar-glow"
                    style={{ background: col.glow }}
                  />

                  {/* The bar itself */}
                  <div
                    className="dd-bar"
                    style={{
                      height: `${barWidth}%`,
                      background: `linear-gradient(to top, ${col.deep} 0%, ${col.neon} 100%)`,
                      boxShadow: `0 0 14px ${col.glow}, 0 -6px 20px ${col.glow}`,
                      animationDelay: `${i * 0.07}s`,
                    }}
                  >
                    <div className="dd-sheen" />
                    <div className="dd-cap" />
                  </div>

                </div>
              );
            })}
          </div>

          {/* Digit labels + spectrum strip */}
          <div className="dd-bottom">
            <div className="dd-digits-row">
              {digitDistributions.map(({ digit }, i) => {
                const col = SPECTRUM[i] ?? SPECTRUM[9];
                return (
                  <div
                    key={digit}
                    className="dd-digit"
                    style={{ color: col.neon }}
                  >
                    {digit}
                  </div>
                );
              })}
            </div>
            <div className="dd-spectrum" />
          </div>

        </div>
      </div>
    </>
  );
}
