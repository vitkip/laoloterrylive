import { useStatistics } from '../hooks/useStatistics';

/* ─── Neon spectrum palette (digit 0 → 9) ───────────────────── */
const SPECTRUM = [
  { neon: '#a78bfa', deep: '#3b0764', glow: 'rgba(167,139,250,0.55)' }, // 0 violet
  { neon: '#60a5fa', deep: '#1e3a8a', glow: 'rgba(96,165,250,0.55)'  }, // 1 blue
  { neon: '#22d3ee', deep: '#164e63', glow: 'rgba(34,211,238,0.55)'  }, // 2 cyan
  { neon: '#2dd4bf', deep: '#134e4a', glow: 'rgba(45,212,191,0.55)'  }, // 3 teal
  { neon: '#4ade80', deep: '#14532d', glow: 'rgba(74,222,128,0.55)'  }, // 4 green
  { neon: '#a3e635', deep: '#365314', glow: 'rgba(163,230,53,0.55)'  }, // 5 lime
  { neon: '#facc15', deep: '#713f12', glow: 'rgba(250,204,21,0.55)'  }, // 6 yellow
  { neon: '#fb923c', deep: '#7c2d12', glow: 'rgba(251,146,60,0.55)'  }, // 7 orange
  { neon: '#f87171', deep: '#7f1d1d', glow: 'rgba(248,113,113,0.55)' }, // 8 rose
  { neon: '#ef4444', deep: '#450a0a', glow: 'rgba(239,68,68,0.55)'   }, // 9 red
];

/* ─── Inline styles ─────────────────────────────────────────── */
const STYLE = `
  /* ── Root ── */
  .hv-root {
    position: relative;
    background: linear-gradient(158deg, #070a18 0%, #090c1f 52%, #060811 100%);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    overflow: hidden;
  }
  .hv-mesh {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.009) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.009) 1px, transparent 1px);
    background-size: 36px 36px;
  }
  .hv-orb {
    position: absolute; width: 320px; height: 320px; border-radius: 50%;
    top: -120px; right: -80px; pointer-events: none;
    background: radial-gradient(circle, rgba(79,70,229,0.10) 0%, transparent 68%);
  }

  /* ── Header ── */
  .hv-hdr {
    display: flex; align-items: center; gap: 13px;
    margin-bottom: 22px; position: relative; z-index: 10;
  }
  .hv-icon-box {
    width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg,
      #a78bfa 0%, #60a5fa 18%, #22d3ee 36%,
      #4ade80 54%, #facc15 72%, #ef4444 100%
    );
    box-shadow: 0 0 22px rgba(167,139,250,0.40), inset 0 1px 0 rgba(255,255,255,0.22);
  }
  .hv-title {
    font-size: 17px; font-weight: 900; letter-spacing: -0.01em; margin: 0;
    color: rgba(226,232,240,0.88);
  }
  .hv-sub { font-size: 11px; color: rgba(255,255,255,0.28); margin-top: 2px; }

  /* ── Spectrum strip (top decoration) ── */
  .hv-strip {
    height: 3px; border-radius: 9999px; margin-bottom: 20px;
    background: linear-gradient(90deg,
      #a78bfa, #60a5fa, #22d3ee, #2dd4bf,
      #4ade80, #a3e635, #facc15, #fb923c, #f87171, #ef4444
    );
    position: relative; z-index: 10;
  }

  /* ── Row ── */
  .hv-rows { display: flex; flex-direction: column; gap: 9px; position: relative; z-index: 10; }
  .hv-row  { display: flex; align-items: center; gap: 11px; }

  /* Mini lottery ball */
  .hv-ball {
    width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 13px; color: #fff;
    position: relative; overflow: hidden;
  }
  .hv-ball::after {
    content: '';
    position: absolute; top: 8%; left: 12%; width: 44%; height: 35%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 70%);
    border-radius: 50%;
  }

  /* Bar track */
  .hv-track {
    flex: 1; height: 10px;
    background: rgba(255,255,255,0.05);
    border-radius: 9999px; overflow: hidden;
    position: relative;
  }
  /* Bar fill */
  .hv-fill {
    height: 100%; border-radius: 9999px;
    transform-origin: left center;
    animation: hv-grow 0.85s cubic-bezier(0.34,1.56,0.64,1) both;
    position: relative; overflow: hidden;
  }
  .hv-fill::after {
    content: '';
    position: absolute; top: 0; left: 0; width: 35%; height: 100%;
    background: linear-gradient(to right, rgba(255,255,255,0.25), transparent);
    border-radius: 9999px;
  }
  @keyframes hv-grow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  /* Top crown pulse on tallest bar */
  .hv-crown {
    position: absolute; right: 5px; top: 50%; transform: translateY(-50%);
    font-size: 10px; line-height: 1; pointer-events: none;
    filter: drop-shadow(0 0 5px rgba(250,204,21,0.85));
    animation: hv-crown-pulse 2s ease-in-out infinite;
    z-index: 2;
  }
  @keyframes hv-crown-pulse {
    0%, 100% { opacity: 1;   transform: translateY(-50%) scale(1);   }
    50%       { opacity: 0.6; transform: translateY(-50%) scale(1.30); }
  }

  /* Pct + count labels */
  .hv-pct-col { min-width: 50px; text-align: right; }
  .hv-pct     { font-size: 13px; font-weight: 900; line-height: 1; }
  .hv-cnt     { font-size: 9px; color: rgba(255,255,255,0.22); margin-top: 2px; font-weight: 600; }

  /* ── Footer ── */
  .hv-footer {
    margin-top: 18px; display: flex; align-items: center; gap: 6px;
    position: relative; z-index: 10;
    padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.055);
  }
  .hv-footer-txt { font-size: 11px; color: rgba(255,255,255,0.22); font-weight: 600; }
`;

/* ─────────────────────────────────────────────────────────────── */
export default function HistoricalVolatility({ timeframe }) {
  const { stats, loading } = useStatistics(timeframe);
  if (loading || !stats) return null;

  const data = stats.digitDistributions
    .map(d => ({ name: d.digit.toString(), percent: d.percent, count: d.count }))
    .sort((a, b) => parseInt(a.name) - parseInt(b.name));

  const maxPct = Math.max(...data.map(d => d.percent));

  return (
    <>
      <style>{STYLE}</style>
      <div className="hv-root p-6 sm:p-8">
        <div className="hv-mesh" />
        <div className="hv-orb" />

        {/* ── Header ── */}
        <div className="hv-hdr">
          <div className="hv-icon-box">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
            >
              bar_chart
            </span>
          </div>
          <div>
            <h3 className="hv-title">ອັດຕາສ່ວນຕົວເລກ (Digit Chart)</h3>
            <p className="hv-sub">ຄວາມຖີ່ຂອງຕົວເລກ 0–9 ທີ່ອອກໃນລາງວັນ</p>
          </div>
        </div>

        {/* ── Spectrum strip ── */}
        <div className="hv-strip" />

        {/* ── Horizontal bar rows ── */}
        <div className="hv-rows">
          {data.map(({ name, percent, count }, i) => {
            const col    = SPECTRUM[parseInt(name)] ?? SPECTRUM[9];
            const isTop  = percent === maxPct;
            const barPct = maxPct > 0 ? Math.round((percent / maxPct) * 100) : 0;

            return (
              <div key={name} className="hv-row">
                {/* Mini lottery ball */}
                <div
                  className="hv-ball"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, ${col.neon}ee 0%, ${col.neon}88 42%, ${col.deep} 100%)`,
                    boxShadow: `0 3px 10px ${col.glow}, inset 0 -2px 4px rgba(0,0,0,0.25)`,
                  }}
                >
                  <span style={{ position: 'relative', zIndex: 1 }}>{name}</span>
                </div>

                {/* Bar track */}
                <div className="hv-track">
                  <div
                    className="hv-fill"
                    style={{
                      width:          `${barPct}%`,
                      background:     `linear-gradient(to right, ${col.deep}, ${col.neon})`,
                      boxShadow:      `0 0 10px ${col.glow}`,
                      animationDelay: `${i * 0.06}s`,
                    }}
                  >
                    {isTop && <div className="hv-crown">✦</div>}
                  </div>
                </div>

                {/* Percentage + count */}
                <div className="hv-pct-col">
                  <div className="hv-pct" style={{ color: col.neon }}>{percent}%</div>
                  <div className="hv-cnt">{count} ຄັ້ງ</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div className="hv-footer">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 12, color: 'rgba(255,255,255,0.20)', flexShrink: 0 }}
          >
            info
          </span>
          <span className="hv-footer-txt">
            ສະແດງຄວາມຖີ່ຂອງຕົວເລກ 0–9 ທີ່ອອກໃນລາງວັນ
          </span>
        </div>
      </div>
    </>
  );
}
