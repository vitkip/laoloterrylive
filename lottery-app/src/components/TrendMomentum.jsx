import { useStatistics } from '../hooks/useStatistics';

/* ─── Inline styles ──────────────────────────────────────────── */
const STYLE = `
  /* ── Root ── */
  .tm-root {
    position: relative;
    background: linear-gradient(158deg, #060911 0%, #080c17 52%, #050810 100%);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    overflow: hidden;
  }
  .tm-mesh {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.009) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.009) 1px, transparent 1px);
    background-size: 36px 36px;
  }
  .tm-orb-green {
    position: absolute; width: 320px; height: 320px; border-radius: 50%;
    top: -110px; left: -70px; pointer-events: none;
    background: radial-gradient(circle, rgba(22,163,74,0.11) 0%, transparent 68%);
  }
  .tm-orb-red {
    position: absolute; width: 280px; height: 280px; border-radius: 50%;
    bottom: -80px; right: -60px; pointer-events: none;
    background: radial-gradient(circle, rgba(220,38,38,0.09) 0%, transparent 68%);
  }

  /* ── Header ── */
  .tm-hdr {
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 22px; position: relative; z-index: 10;
  }
  .tm-icon-box {
    width: 44px; height: 44px; border-radius: 15px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #14532d 0%, #15803d 50%, #4ade80 100%);
    box-shadow: 0 0 24px rgba(22,163,74,0.50), inset 0 1px 0 rgba(255,255,255,0.20);
  }
  .tm-title {
    font-size: 17px; font-weight: 900; letter-spacing: -0.01em; margin: 0;
    color: rgba(226,232,240,0.88);
  }
  .tm-sub { font-size: 11px; color: rgba(255,255,255,0.28); margin-top: 2px; }

  /* ── Section headers ── */
  .tm-sec-hdr { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  .tm-sec-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .tm-sec-lbl  { font-size: 10px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; }
  .tm-sec-cnt  {
    font-size: 11px; font-weight: 900; margin-left: auto;
    padding: 2px 9px; border-radius: 20px;
  }

  /* ── Items list ── */
  .tm-list { display: flex; flex-direction: column; gap: 6px; }

  /* ── Single item row ── */
  .tm-item {
    display: flex; align-items: center; justify-content: space-between;
    gap: 10px; padding: 10px 12px; border-radius: 13px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.020);
    transition: all 0.18s; position: relative; overflow: hidden;
  }
  .tm-item.tm-up {
    border-color: rgba(22,163,74,0.18);
    background: rgba(22,163,74,0.05);
  }
  .tm-item.tm-up:hover {
    background: rgba(22,163,74,0.09);
    border-color: rgba(74,222,128,0.28);
    transform: translateY(-1px);
  }
  .tm-item.tm-dn {
    border-color: rgba(220,38,38,0.18);
    background: rgba(220,38,38,0.05);
  }
  .tm-item.tm-dn:hover {
    background: rgba(220,38,38,0.09);
    border-color: rgba(248,113,113,0.28);
    transform: translateY(-1px);
  }
  /* top-1 shimmer */
  .tm-item.tm-top-item::before {
    content: '';
    position: absolute; top: 0; left: -120%; width: 55%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
    animation: tm-shimmer 2.8s ease-in-out infinite;
  }
  @keyframes tm-shimmer {
    0%   { left: -120%; }
    100% { left: 200%; }
  }

  /* ── Lottery balls ── */
  .tm-ball {
    width: 44px; height: 44px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 15px; color: #fff;
    position: relative; overflow: hidden; flex-shrink: 0;
  }
  .tm-ball::after {
    content: '';
    position: absolute; top: 8%; left: 12%; width: 44%; height: 34%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 70%);
    border-radius: 50%;
  }
  .tm-ball-green {
    background: radial-gradient(circle at 35% 30%, #86efac 0%, #16a34a 42%, #14532d 78%, #052e16 100%);
    box-shadow: 0 4px 14px rgba(22,163,74,0.48), inset 0 -3px 6px rgba(0,0,0,0.22);
  }
  .tm-ball-red {
    background: radial-gradient(circle at 35% 30%, #fca5a5 0%, #dc2626 42%, #7f1d1d 78%, #450a0a 100%);
    box-shadow: 0 4px 14px rgba(220,38,38,0.48), inset 0 -3px 6px rgba(0,0,0,0.22);
  }

  /* ── Arrow animation ── */
  .tm-arrow-up {
    font-size: 16px; color: rgba(74,222,128,0.78); flex-shrink: 0;
    animation: tm-bounce-up 1.7s ease-in-out infinite;
  }
  .tm-arrow-dn {
    font-size: 16px; color: rgba(248,113,113,0.78); flex-shrink: 0;
    animation: tm-bounce-dn 1.7s ease-in-out infinite;
  }
  @keyframes tm-bounce-up {
    0%, 100% { transform: translateY(0);   opacity: 0.65; }
    50%       { transform: translateY(-4px); opacity: 1.00; }
  }
  @keyframes tm-bounce-dn {
    0%, 100% { transform: translateY(0);   opacity: 0.65; }
    50%       { transform: translateY(4px);  opacity: 1.00; }
  }

  /* ── Info text ── */
  .tm-info { flex: 1; min-width: 0; }
  .tm-dir-up  { font-size: 11px; font-weight: 900; color: rgba(74,222,128,0.88); }
  .tm-dir-dn  { font-size: 11px; font-weight: 900; color: rgba(248,113,113,0.88); }
  .tm-compare { font-size: 10px; color: rgba(255,255,255,0.28); font-weight: 600; margin-top: 2px; }

  /* ── Momentum % badge ── */
  .tm-badge {
    font-size: 13px; font-weight: 900;
    padding: 5px 10px; border-radius: 10px; white-space: nowrap; flex-shrink: 0;
  }
  .tm-badge-green {
    background: rgba(22,163,74,0.14);
    color: rgba(74,222,128,0.92);
    border: 1px solid rgba(74,222,128,0.18);
  }
  .tm-badge-red {
    background: rgba(220,38,38,0.14);
    color: rgba(248,113,113,0.92);
    border: 1px solid rgba(248,113,113,0.18);
  }

  /* ── Empty ── */
  .tm-empty {
    font-size: 12px; color: rgba(255,255,255,0.22);
    text-align: center; padding: 18px 0; font-weight: 700;
    border: 1px dashed rgba(255,255,255,0.08);
    border-radius: 12px;
  }

  /* ── Footer ── */
  .tm-footer {
    display: flex; align-items: center; gap: 6px;
    margin-top: 20px; position: relative; z-index: 10;
  }
  .tm-footer-txt { font-size: 10px; color: rgba(255,255,255,0.20); font-weight: 600; }
`;

/* ─── MomentumBadge row ─────────────────────────────────────── */
function MomentumRow({ item, type, isFirst }) {
  const isRising = type === 'rising';
  const pct = (Math.abs(item.momentum) * 100).toFixed(0);

  return (
    <div className={`tm-item ${isRising ? 'tm-up' : 'tm-dn'} ${isFirst ? 'tm-top-item' : ''}`}>
      {/* Ball */}
      <div className={`tm-ball ${isRising ? 'tm-ball-green' : 'tm-ball-red'}`}>
        <span style={{ position: 'relative', zIndex: 1 }}>{item.number}</span>
      </div>

      {/* Direction arrow */}
      <span className={`material-symbols-outlined ${isRising ? 'tm-arrow-up' : 'tm-arrow-dn'}`}>
        {isRising ? 'trending_up' : 'trending_down'}
      </span>

      {/* Info */}
      <div className="tm-info">
        <div className={isRising ? 'tm-dir-up' : 'tm-dir-dn'}>
          {isRising ? '▲ ກຳລັງຂຶ້ນ' : '▼ ກຳລັງລົງ'}
        </div>
        <div className="tm-compare">
          {item.recentCount}/5 vs {item.baselineCount}/20
        </div>
      </div>

      {/* Momentum badge */}
      <span className={`tm-badge ${isRising ? 'tm-badge-green' : 'tm-badge-red'}`}>
        {isRising ? '+' : ''}{pct}%
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
export default function TrendMomentum({ timeframe }) {
  const { stats, loading } = useStatistics(timeframe);
  if (loading || !stats) return null;
  const { rising, falling } = stats.trendMomentum;

  return (
    <>
      <style>{STYLE}</style>
      <div className="tm-root p-6 sm:p-8">
        <div className="tm-mesh" />
        <div className="tm-orb-green" />
        <div className="tm-orb-red" />

        {/* ── Header ── */}
        <div className="tm-hdr">
          <div className="tm-icon-box">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
            >
              trending_up
            </span>
          </div>
          <div>
            <h2 className="tm-title">ແນວໂນ້ມ Momentum</h2>
            <p className="tm-sub">5 ງວດຫຼ້າສຸດ vs 20 ງວດ</p>
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{ position: 'relative', zIndex: 10 }}>

          {/* Rising */}
          <div>
            <div className="tm-sec-hdr">
              <span
                className="tm-sec-dot"
                style={{ background: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.65)' }}
              />
              <span className="tm-sec-lbl" style={{ color: 'rgba(74,222,128,0.60)' }}>
                ເລກຂຶ້ນ
              </span>
              <span
                className="tm-sec-cnt"
                style={{
                  background: 'rgba(22,163,74,0.14)',
                  color: 'rgba(74,222,128,0.85)',
                  border: '1px solid rgba(74,222,128,0.18)',
                }}
              >
                {rising.length}
              </span>
            </div>

            {rising.length === 0 ? (
              <div className="tm-empty">ບໍ່ມີ momentum ໃໝ່</div>
            ) : (
              <div className="tm-list">
                {rising.map((item, i) => (
                  <MomentumRow key={item.number} item={item} type="rising" isFirst={i === 0} />
                ))}
              </div>
            )}
          </div>

          {/* Falling */}
          <div>
            <div className="tm-sec-hdr">
              <span
                className="tm-sec-dot"
                style={{ background: '#f87171', boxShadow: '0 0 8px rgba(248,113,113,0.65)' }}
              />
              <span className="tm-sec-lbl" style={{ color: 'rgba(248,113,113,0.60)' }}>
                ເລກລົງ
              </span>
              <span
                className="tm-sec-cnt"
                style={{
                  background: 'rgba(220,38,38,0.14)',
                  color: 'rgba(248,113,113,0.85)',
                  border: '1px solid rgba(248,113,113,0.18)',
                }}
              >
                {falling.length}
              </span>
            </div>

            {falling.length === 0 ? (
              <div className="tm-empty">ບໍ່ມີ momentum ທີ່ຫຼຸດລົງ</div>
            ) : (
              <div className="tm-list">
                {falling.map((item, i) => (
                  <MomentumRow key={item.number} item={item} type="falling" isFirst={i === 0} />
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── Footer note ── */}
        <div className="tm-footer">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 12, color: 'rgba(255,255,255,0.20)', flexShrink: 0 }}
          >
            info
          </span>
          <span className="tm-footer-txt">
            ເທียบ rate ການອອກ 5 ງວດຫຼ້າສຸດ vs 20 ງວດ — ຄ່າ +/– ຄື % ຄວາມຕ່າງ
          </span>
        </div>
      </div>
    </>
  );
}
