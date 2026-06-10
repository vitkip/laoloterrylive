import { useStatistics } from '../hooks/useStatistics';

/* ─── Inline styles ──────────────────────────────────────────── */
const STYLE = `
  /* ── Root ── */
  .rp-root {
    position: relative;
    background: linear-gradient(158deg, #070a16 0%, #090d1e 52%, #060812 100%);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    overflow: hidden;
  }
  .rp-mesh {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.010) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.010) 1px, transparent 1px);
    background-size: 36px 36px;
  }
  .rp-orb-a {
    position: absolute; width: 280px; height: 280px; border-radius: 50%;
    top: -100px; right: -70px; pointer-events: none;
    background: radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 68%);
  }
  .rp-orb-b {
    position: absolute; width: 220px; height: 220px; border-radius: 50%;
    bottom: -70px; left: -50px; pointer-events: none;
    background: radial-gradient(circle, rgba(13,148,136,0.11) 0%, transparent 68%);
  }

  /* ── Header ── */
  .rp-hdr {
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 22px; position: relative; z-index: 10;
  }
  .rp-icon-box {
    width: 44px; height: 44px; border-radius: 15px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 55%, #a78bfa 100%);
    box-shadow: 0 0 24px rgba(124,58,237,0.52), inset 0 1px 0 rgba(255,255,255,0.20);
  }
  .rp-title {
    font-size: 17px; font-weight: 900; letter-spacing: -0.01em; margin: 0;
    color: rgba(226,232,240,0.88);
  }
  .rp-sub { font-size: 11px; color: rgba(255,255,255,0.28); margin-top: 2px; }

  /* ── Section header ── */
  .rp-sec-hdr { display: flex; align-items: center; gap: 8px; margin-bottom: 13px; }
  .rp-sec-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .rp-sec-lbl  { font-size: 10px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; }

  /* ══════════════ DOUBLES ══════════════ */
  .rp-doubles-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 7px;
  }
  .rp-dbl-card {
    border-radius: 13px; padding: 11px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.022);
    transition: all 0.18s; position: relative; overflow: hidden;
  }
  .rp-dbl-card.rp-dbl-hot {
    border-color: rgba(124,58,237,0.22);
    background: rgba(124,58,237,0.055);
  }
  .rp-dbl-card.rp-dbl-top {
    border-color: rgba(245,158,11,0.30);
    background: rgba(245,158,11,0.07);
  }
  .rp-dbl-card.rp-dbl-cold { opacity: 0.32; }
  .rp-dbl-card:hover:not(.rp-dbl-cold) {
    transform: translateY(-1px);
    background: rgba(124,58,237,0.09);
    border-color: rgba(124,58,237,0.28);
  }
  /* Shimmer on top card */
  .rp-dbl-card.rp-dbl-top::before {
    content: '';
    position: absolute; top: 0; left: -120%; width: 55%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(250,204,21,0.09), transparent);
    animation: rp-shimmer 2.6s ease-in-out infinite;
  }
  @keyframes rp-shimmer {
    0%   { left: -120%; }
    100% { left: 200%; }
  }

  .rp-dbl-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 9px; }

  /* Lottery ball */
  .rp-ball {
    width: 46px; height: 46px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 15px;
    position: relative; overflow: hidden; flex-shrink: 0;
  }
  .rp-ball::after {
    content: '';
    position: absolute; top: 8%; left: 12%; width: 44%; height: 34%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 70%);
    border-radius: 50%;
  }
  .rp-ball-purple {
    background: radial-gradient(circle at 35% 30%, #c4b5fd 0%, #7c3aed 42%, #4c1d95 78%, #2e1065 100%);
    box-shadow: 0 4px 16px rgba(124,58,237,0.45), inset 0 -3px 6px rgba(0,0,0,0.25);
    color: #fff;
  }
  .rp-ball-gold {
    background: radial-gradient(circle at 35% 30%, #fde68a 0%, #f59e0b 42%, #b45309 78%, #78350f 100%);
    box-shadow: 0 4px 16px rgba(245,158,11,0.52), inset 0 -3px 6px rgba(0,0,0,0.22);
    color: #78350f;
  }
  .rp-ball-gray {
    background: radial-gradient(circle at 35% 30%, #475569 0%, #1e293b 42%, #0f172a 78%, #020617 100%);
    box-shadow: 0 2px 8px rgba(0,0,0,0.40), inset 0 -2px 4px rgba(0,0,0,0.30);
    color: rgba(255,255,255,0.35);
  }

  /* Crown above ball */
  .rp-crown-wrap { position: relative; }
  .rp-crown {
    position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
    font-size: 12px; line-height: 1; pointer-events: none;
    filter: drop-shadow(0 0 6px rgba(250,204,21,0.80));
    animation: rp-crown-rock 2.2s ease-in-out infinite;
    z-index: 3;
  }
  @keyframes rp-crown-rock {
    0%, 100% { transform: translateX(-50%) rotate(-5deg); }
    50%       { transform: translateX(-50%) rotate(5deg); }
  }

  .rp-dbl-count { font-size: 21px; font-weight: 900; line-height: 1; color: rgba(255,255,255,0.88); }
  .rp-dbl-unit  { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.28); }
  .rp-dbl-pct   { font-size: 10px; color: rgba(255,255,255,0.28); margin-top: 2px; font-weight: 600; }

  /* Purple bar */
  .rp-bar-trk-pu { height: 4px; background: rgba(124,58,237,0.12); border-radius: 9999px; overflow: hidden; }
  .rp-bar-pu {
    height: 100%; border-radius: 9999px;
    background: linear-gradient(to right, #7c3aed, #a78bfa);
    box-shadow: 0 0 7px rgba(167,139,250,0.55);
    transition: width 0.75s cubic-bezier(0.34,1.56,0.64,1);
  }
  .rp-bar-top {
    background: linear-gradient(to right, #d97706, #fcd34d);
    box-shadow: 0 0 7px rgba(250,204,21,0.55);
  }

  /* ══════════════ MIRRORS ══════════════ */
  .rp-mirrors-list { display: flex; flex-direction: column; gap: 6px; }
  .rp-mir-card {
    border-radius: 14px; padding: 12px 14px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.020);
    transition: all 0.18s;
    display: flex; align-items: center; gap: 12px;
    position: relative; overflow: hidden;
  }
  .rp-mir-card.rp-mir-top {
    border-color: rgba(45,212,191,0.18);
    background: rgba(13,148,136,0.055);
  }
  .rp-mir-card.rp-mir-top::before {
    content: '';
    position: absolute; top: 0; left: -120%; width: 55%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(45,212,191,0.06), transparent);
    animation: rp-shimmer 3s ease-in-out infinite;
  }
  .rp-mir-card:hover {
    background: rgba(13,148,136,0.08);
    border-color: rgba(45,212,191,0.22);
    transform: translateY(-1px);
  }

  /* Mirror pair balls */
  .rp-mir-pair { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
  .rp-mir-ball-a {
    width: 40px; height: 40px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 14px; color: #fff;
    position: relative; overflow: hidden; flex-shrink: 0;
    background: radial-gradient(circle at 35% 30%, #67e8f9 0%, #0891b2 42%, #075985 80%, #0c4a6e 100%);
    box-shadow: 0 3px 12px rgba(8,145,178,0.42), inset 0 -2px 5px rgba(0,0,0,0.22);
  }
  .rp-mir-ball-b {
    width: 40px; height: 40px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 14px; color: #fff;
    position: relative; overflow: hidden; flex-shrink: 0;
    background: radial-gradient(circle at 35% 30%, #5eead4 0%, #14b8a6 42%, #0f766e 80%, #134e4a 100%);
    box-shadow: 0 3px 12px rgba(20,184,166,0.42), inset 0 -2px 5px rgba(0,0,0,0.22);
  }
  .rp-mir-ball-a::after,
  .rp-mir-ball-b::after {
    content: '';
    position: absolute; top: 8%; left: 12%; width: 44%; height: 34%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.52) 0%, transparent 70%);
    border-radius: 50%;
  }
  .rp-mir-icon {
    font-size: 15px; color: rgba(45,212,191,0.55);
    animation: rp-mir-pulse 2s ease-in-out infinite;
  }
  @keyframes rp-mir-pulse {
    0%, 100% { opacity: 0.50; transform: scaleX(1);    }
    50%       { opacity: 0.95; transform: scaleX(1.18); }
  }

  /* Mirror stats */
  .rp-mir-stats { flex: 1; min-width: 0; }
  .rp-mir-meta {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 5px;
  }
  .rp-mir-detail { font-size: 11px; font-weight: 700; color: rgba(45,212,191,0.60); }
  .rp-mir-pct    { font-size: 10px; font-weight: 900; color: rgba(45,212,191,0.82); }

  /* Teal bar */
  .rp-bar-trk-tl { height: 4px; background: rgba(13,148,136,0.12); border-radius: 9999px; overflow: hidden; }
  .rp-bar-tl {
    height: 100%; border-radius: 9999px;
    background: linear-gradient(to right, #0d9488, #2dd4bf);
    box-shadow: 0 0 7px rgba(45,212,191,0.48);
    transition: width 0.75s cubic-bezier(0.34,1.56,0.64,1);
  }

  .rp-mir-total { font-size: 15px; font-weight: 900; color: rgba(45,212,191,0.78); flex-shrink: 0; }

  /* ── Footer ── */
  .rp-footer {
    display: flex; align-items: center; gap: 6px;
    margin-top: 20px; position: relative; z-index: 10;
  }
  .rp-footer-txt { font-size: 10px; color: rgba(255,255,255,0.20); font-weight: 600; }
`;

/* ─────────────────────────────────────────────────────────────── */
export default function RepeatPattern({ timeframe }) {
  const { stats, loading } = useStatistics(timeframe);
  if (loading || !stats) return null;
  const { doubles, mirrors, totalTwoDigitCount } = stats.repeatPatterns;

  const maxDoubleCount = doubles[0]?.count || 1;
  const maxMirrorTotal = mirrors[0]?.total || 1;

  return (
    <>
      <style>{STYLE}</style>
      <div className="rp-root p-6 sm:p-8">
        <div className="rp-mesh" />
        <div className="rp-orb-a" />
        <div className="rp-orb-b" />

        {/* ── Header ── */}
        <div className="rp-hdr">
          <div className="rp-icon-box">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
            >
              pattern
            </span>
          </div>
          <div>
            <h2 className="rp-title">ຮູບແບບເລກຊ້ຳ &amp; ສະລັບ</h2>
            <p className="rp-sub">Repeat Pattern Detection</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" style={{ position: 'relative', zIndex: 10 }}>

          {/* ══ Section 1 — Doubles ══ */}
          <div>
            <div className="rp-sec-hdr">
              <span
                className="rp-sec-dot"
                style={{ background: '#a78bfa', boxShadow: '0 0 8px rgba(167,139,250,0.65)' }}
              />
              <span className="rp-sec-lbl" style={{ color: 'rgba(167,139,250,0.58)' }}>
                ເລກຄູ່ (11, 22, 33…)
              </span>
            </div>

            <div className="rp-doubles-grid">
              {doubles.map(({ number, count, pct }, i) => {
                const barPct = Math.round((count / maxDoubleCount) * 100);
                const isTop  = i === 0 && count > 0;
                const isHot  = count > 0 && !isTop;
                const isCold = count === 0;

                return (
                  <div
                    key={number}
                    className={`rp-dbl-card ${isTop ? 'rp-dbl-top' : ''} ${isHot ? 'rp-dbl-hot' : ''} ${isCold ? 'rp-dbl-cold' : ''}`}
                  >
                    <div className="rp-dbl-row">
                      {/* Ball */}
                      <div className="rp-crown-wrap">
                        {isTop && <div className="rp-crown">✦</div>}
                        <div
                          className={`rp-ball ${isTop ? 'rp-ball-gold' : isCold ? 'rp-ball-gray' : 'rp-ball-purple'}`}
                        >
                          <span style={{ position: 'relative', zIndex: 1 }}>{number}</span>
                        </div>
                      </div>

                      {/* Count */}
                      <div style={{ textAlign: 'right' }}>
                        <div>
                          <span className="rp-dbl-count">{count}</span>
                          <span className="rp-dbl-unit"> ຄັ້ງ</span>
                        </div>
                        <div className="rp-dbl-pct">{pct}%</div>
                      </div>
                    </div>

                    {/* Bar */}
                    <div className="rp-bar-trk-pu">
                      <div
                        className={`rp-bar-pu ${isTop ? 'rp-bar-top' : ''}`}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ══ Section 2 — Mirrors ══ */}
          <div>
            <div className="rp-sec-hdr">
              <span
                className="rp-sec-dot"
                style={{ background: '#2dd4bf', boxShadow: '0 0 8px rgba(45,212,191,0.65)' }}
              />
              <span className="rp-sec-lbl" style={{ color: 'rgba(45,212,191,0.58)' }}>
                ເລກສະລັບ (12 ↔ 21)
              </span>
            </div>

            <div className="rp-mirrors-list">
              {mirrors.map(({ pair, counts, total }, i) => {
                const barPct = Math.round((total / maxMirrorTotal) * 100);
                const [n1, n2] = pair;
                const [c1, c2] = counts;
                const pct = totalTwoDigitCount > 0
                  ? (total / totalTwoDigitCount * 100).toFixed(1)
                  : '0.0';
                const isTop = i === 0;

                return (
                  <div
                    key={`${n1}-${n2}`}
                    className={`rp-mir-card ${isTop ? 'rp-mir-top' : ''}`}
                  >
                    {/* Split ball pair */}
                    <div className="rp-mir-pair">
                      <div className="rp-mir-ball-a">
                        <span style={{ position: 'relative', zIndex: 1 }}>{n1}</span>
                      </div>
                      <span className="material-symbols-outlined rp-mir-icon">sync_alt</span>
                      <div className="rp-mir-ball-b">
                        <span style={{ position: 'relative', zIndex: 1 }}>{n2}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="rp-mir-stats">
                      <div className="rp-mir-meta">
                        <span className="rp-mir-detail">
                          {n1}:{c1}ຄັ້ງ &nbsp;·&nbsp; {n2}:{c2}ຄັ້ງ
                        </span>
                        <span className="rp-mir-pct">{pct}%</span>
                      </div>
                      <div className="rp-bar-trk-tl">
                        <div className="rp-bar-tl" style={{ width: `${barPct}%` }} />
                      </div>
                    </div>

                    <span className="rp-mir-total">{total}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="rp-footer">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 12, color: 'rgba(255,255,255,0.20)', flexShrink: 0 }}
          >
            info
          </span>
          <span className="rp-footer-txt">
            ອ້າງອີງຈາກ {totalTwoDigitCount} ງວດທີ່ມີຜົນ 2 ຕົວ — % ຄຳນວນຈາກທັງໝົດ
          </span>
        </div>
      </div>
    </>
  );
}
