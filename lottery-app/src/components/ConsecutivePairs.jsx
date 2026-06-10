import { useState, useMemo } from 'react';
import { useStatistics } from '../hooks/useStatistics';

/* ─── Inline styles ─────────────────────────────────────────── */
const STYLE = `
  /* ── Root card ── */
  .cp-root {
    position: relative;
    background: linear-gradient(160deg, #0f0a1e 0%, #130d24 50%, #0a0715 100%);
    border: 1px solid rgba(167,139,250,0.15);
    border-radius: 24px;
    overflow: hidden;
  }

  /* Ticket perforated top edge */
  .cp-root::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg,
      transparent 3%, #7c3aed 3%, #7c3aed 7%, transparent 7%,
      transparent 10%, #a78bfa 10%, #a78bfa 14%, transparent 14%,
      transparent 17%, #7c3aed 17%, #7c3aed 21%, transparent 21%,
      transparent 24%, #a78bfa 24%, #a78bfa 28%, transparent 28%,
      transparent 31%, #7c3aed 31%, #7c3aed 35%, transparent 35%,
      transparent 38%, #f59e0b 38%, #f59e0b 42%, transparent 42%,
      transparent 45%, #fbbf24 45%, #fbbf24 49%, transparent 49%,
      transparent 52%, #f59e0b 52%, #f59e0b 56%, transparent 56%,
      transparent 59%, #fbbf24 59%, #fbbf24 63%, transparent 63%,
      transparent 66%, #f59e0b 66%, #f59e0b 70%, transparent 70%,
      transparent 73%, #7c3aed 73%, #7c3aed 77%, transparent 77%,
      transparent 80%, #a78bfa 80%, #a78bfa 84%, transparent 84%,
      transparent 87%, #7c3aed 87%, #7c3aed 91%, transparent 91%,
      transparent 94%, #a78bfa 94%, #a78bfa 98%, transparent 98%
    );
  }

  /* Background glows */
  .cp-glow-purple {
    position: absolute;
    width: 300px; height: 300px;
    border-radius: 50%;
    top: -80px; left: -80px;
    background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%);
    filter: blur(40px);
    pointer-events: none;
  }
  .cp-glow-gold {
    position: absolute;
    width: 260px; height: 260px;
    border-radius: 50%;
    bottom: -60px; right: -60px;
    background: radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%);
    filter: blur(36px);
    pointer-events: none;
  }
  .cp-glow-mid {
    position: absolute;
    width: 180px; height: 180px;
    border-radius: 50%;
    top: 40%; left: 50%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%);
    filter: blur(32px);
    pointer-events: none;
  }

  /* Sparkle deco star */
  .cp-star {
    position: absolute;
    pointer-events: none;
    opacity: 0.18;
    animation: cp-twinkle 3s ease-in-out infinite;
  }
  .cp-star::before {
    content: '✦';
    font-size: 12px;
    color: #fbbf24;
  }
  .cp-star:nth-child(2) { animation-delay: 1.1s; }
  .cp-star:nth-child(3) { animation-delay: 2.2s; }
  @keyframes cp-twinkle {
    0%, 100% { opacity: 0.12; transform: scale(1); }
    50%       { opacity: 0.35; transform: scale(1.4); }
  }

  /* ── Header icon box ── */
  .cp-icon-box {
    width: 40px; height: 40px; border-radius: 14px;
    background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 20px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.2);
    flex-shrink: 0;
  }

  /* ── Section labels ── */
  .cp-section-label {
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(167,139,250,0.7);
  }
  .cp-section-label-gold {
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(251,191,36,0.75);
  }

  /* ── Search zone ── */
  .cp-search-zone {
    background: rgba(124,58,237,0.07);
    border: 1px solid rgba(124,58,237,0.18);
    border-radius: 18px;
    padding: 18px;
  }

  .cp-input-wrap {
    position: relative;
    flex: 1; max-width: 200px;
  }
  .cp-input {
    width: 100%;
    background: rgba(10,7,21,0.8);
    border: 1.5px solid rgba(124,58,237,0.3);
    border-radius: 14px;
    padding: 12px 16px 12px 44px;
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 0.3em;
    color: #e9d5ff;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .cp-input::placeholder {
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.04em;
    color: rgba(167,139,250,0.4);
  }
  .cp-input:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.15), 0 0 20px rgba(124,58,237,0.12);
  }
  .cp-input-icon {
    position: absolute; left: 14px; top: 50%;
    transform: translateY(-50%);
    color: rgba(139,92,246,0.55);
    font-size: 20px;
    pointer-events: none;
  }

  /* Query badge */
  .cp-query-badge {
    background: rgba(124,58,237,0.12);
    border: 1.5px solid rgba(124,58,237,0.25);
    border-radius: 14px;
    padding: 8px 16px;
    display: flex; align-items: center; gap: 10px;
  }
  .cp-query-num {
    font-size: 28px; font-weight: 900;
    background: linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; letter-spacing: 0.12em;
  }

  /* Clear button */
  .cp-clear-btn {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.15);
    border-radius: 10px;
    padding: 6px 12px;
    display: flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 800; letter-spacing: 0.04em;
    color: rgba(252,165,165,0.7);
    cursor: pointer; transition: all 0.15s;
    white-space: nowrap;
  }
  .cp-clear-btn:hover {
    background: rgba(239,68,68,0.16);
    border-color: rgba(239,68,68,0.3);
    color: #fca5a5;
  }

  /* ── Lottery ball ── */
  .cp-ball {
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; flex-shrink: 0;
    position: relative; overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.35), inset 0 -3px 6px rgba(0,0,0,0.25);
  }
  .cp-ball::after {
    content: '';
    position: absolute;
    top: 10%; left: 15%; width: 40%; height: 30%;
    background: rgba(255,255,255,0.25);
    border-radius: 50%;
    filter: blur(4px);
  }

  /* Ball sizes */
  .cp-ball-lg {
    width: 52px; height: 52px; font-size: 20px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.4), inset 0 -4px 8px rgba(0,0,0,0.28);
  }
  .cp-ball-md {
    width: 44px; height: 44px; font-size: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.35), inset 0 -3px 6px rgba(0,0,0,0.25);
  }
  .cp-ball-sm {
    width: 38px; height: 38px; font-size: 14px;
    box-shadow: 0 3px 9px rgba(0,0,0,0.3), inset 0 -2px 5px rgba(0,0,0,0.22);
  }

  /* Ball colors - purple tones for search results */
  .cp-ball-p1 { background: linear-gradient(145deg, #6d28d9 0%, #4c1d95 100%); color: #fff; }
  .cp-ball-p2 { background: linear-gradient(145deg, #7c3aed 0%, #5b21b6 100%); color: #fff; }
  .cp-ball-p3 { background: linear-gradient(145deg, #8b5cf6 0%, #6d28d9 100%); color: #fff; }
  .cp-ball-p4 { background: linear-gradient(145deg, #a78bfa 0%, #7c3aed 100%); color: #fff; }
  .cp-ball-p5 { background: linear-gradient(145deg, #c4b5fd 0%, #8b5cf6 100%); color: #4c1d95; }
  .cp-ball-def { background: linear-gradient(145deg, #2d2060 0%, #1e1445 100%); color: rgba(167,139,250,0.7); }

  /* Ball colors - gold tones for hot pairs */
  .cp-ball-g1 { background: linear-gradient(145deg, #d97706 0%, #92400e 100%); color: #fff; }
  .cp-ball-g2 { background: linear-gradient(145deg, #f59e0b 0%, #b45309 100%); color: #fff; }
  .cp-ball-g3 { background: linear-gradient(145deg, #fbbf24 0%, #d97706 100%); color: #78350f; }
  .cp-ball-g4 { background: linear-gradient(145deg, #fcd34d 0%, #f59e0b 100%); color: #78350f; }
  .cp-ball-g5 { background: linear-gradient(145deg, #fde68a 0%, #fbbf24 100%); color: #92400e; }
  .cp-ball-gneutral { background: linear-gradient(145deg, #44350d 0%, #2a1f07 100%); color: rgba(251,191,36,0.6); }

  /* ── Search result row ── */
  .cp-result-row {
    background: rgba(124,58,237,0.05);
    border: 1px solid rgba(124,58,237,0.10);
    border-radius: 14px;
    padding: 10px 14px;
    display: flex; align-items: center; gap: 12px;
    transition: background 0.15s, border-color 0.15s;
  }
  .cp-result-row:hover {
    background: rgba(124,58,237,0.09);
    border-color: rgba(124,58,237,0.2);
  }

  /* Result progress bar */
  .cp-bar-track {
    flex: 1; height: 5px;
    background: rgba(124,58,237,0.1);
    border-radius: 9999px;
    overflow: hidden;
    min-width: 0;
  }
  .cp-bar-fill-p {
    height: 100%; border-radius: 9999px;
    background: linear-gradient(90deg, #7c3aed, #a78bfa);
    transition: width 0.5s cubic-bezier(0.34,1.56,0.64,1);
  }

  /* ── Hot pairs section ── */
  .cp-gold-section {
    background: rgba(245,158,11,0.04);
    border: 1px solid rgba(245,158,11,0.12);
    border-radius: 18px;
    padding: 18px;
  }

  /* Hot pair card */
  .cp-pair-card {
    background: rgba(10,7,21,0.65);
    border: 1px solid rgba(245,158,11,0.12);
    border-radius: 14px;
    padding: 10px 12px;
    display: flex; align-items: center; gap: 8px;
    cursor: pointer;
    transition: all 0.18s;
    position: relative; overflow: hidden;
  }
  .cp-pair-card:hover {
    border-color: rgba(245,158,11,0.35);
    background: rgba(245,158,11,0.06);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(245,158,11,0.10);
  }

  /* Shimmer on top 3 gold cards */
  .cp-pair-card-shimmer::before {
    content: '';
    position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(105deg, transparent 40%, rgba(251,191,36,0.08) 50%, transparent 60%);
    animation: cp-shimmer 3s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes cp-shimmer {
    0%   { left: -100%; }
    100% { left: 150%; }
  }

  /* Arrow connector between pair numbers */
  .cp-arrow {
    flex-shrink: 0;
    display: flex; align-items: center;
    color: rgba(251,191,36,0.35);
    font-size: 18px;
    transition: color 0.18s;
  }
  .cp-pair-card:hover .cp-arrow { color: rgba(251,191,36,0.7); }

  /* Gold progress bar */
  .cp-bar-track-g {
    flex: 1; height: 4px;
    background: rgba(245,158,11,0.08);
    border-radius: 9999px;
    overflow: hidden;
    min-width: 0;
  }
  .cp-bar-fill-g {
    height: 100%; border-radius: 9999px;
    background: linear-gradient(90deg, #d97706, #fbbf24);
    transition: width 0.5s ease;
  }

  /* Rank numeral */
  .cp-rank {
    font-size: 10px; font-weight: 900;
    color: rgba(251,191,36,0.4);
    width: 14px; text-align: center; flex-shrink: 0;
  }

  /* ── Empty state ── */
  .cp-empty {
    padding: 36px 0;
    text-align: center;
    color: rgba(167,139,250,0.4);
    font-size: 13px;
  }

  /* ── Loading pulse ── */
  .cp-loading {
    background: linear-gradient(160deg, #0f0a1e 0%, #130d24 100%);
    border: 1px solid rgba(167,139,250,0.1);
    border-radius: 24px;
    padding: 32px 24px;
  }
  .cp-pulse {
    display: flex; gap: 8px; align-items: center;
  }
  .cp-pulse-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #7c3aed;
    animation: cp-bounce 1.2s ease-in-out infinite;
  }
  .cp-pulse-dot:nth-child(2) { animation-delay: 0.2s; background: #a78bfa; }
  .cp-pulse-dot:nth-child(3) { animation-delay: 0.4s; background: #f59e0b; }
  @keyframes cp-bounce {
    0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
    40%           { transform: scale(1.2); opacity: 1; }
  }

  /* Divider */
  .cp-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(167,139,250,0.12), rgba(245,158,11,0.12), transparent);
  }
`;

/* ── Ball colour helper ─────────────────────────────────────── */
const PURPLE_BALLS = ['cp-ball-p1','cp-ball-p2','cp-ball-p3','cp-ball-p4','cp-ball-p5'];
const GOLD_BALLS   = ['cp-ball-g1','cp-ball-g2','cp-ball-g3','cp-ball-g4','cp-ball-g5'];

function getPurpleBall(i) { return PURPLE_BALLS[i] ?? 'cp-ball-def'; }
function getGoldBall(i)   { return GOLD_BALLS[i]   ?? 'cp-ball-gneutral'; }

/* ─────────────────────────────────────────────────────────────── */
export default function ConsecutivePairs({ timeframe }) {
  const { stats, loading } = useStatistics(timeframe);
  const [inputVal, setInputVal] = useState('');

  const query = inputVal.replace(/\D/g, '').slice(0, 2);

  const searchResults = useMemo(() => {
    if (!stats?.pairsTracker || query.length < 2) return null;
    const followers = stats.pairsTracker[query] ?? {};
    const total = Object.values(followers).reduce((s, c) => s + c, 0);
    if (total === 0) return [];
    return Object.entries(followers)
      .map(([nextNum, count]) => ({ nextNum, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [stats, query]);

  const { hotPairs = [] } = stats ?? {};
  const maxHot = hotPairs[0]?.count || 1;

  const handleInput = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    setInputVal(val);
  };

  if (loading || !stats) {
    return (
      <>
        <style>{STYLE}</style>
        <div className="cp-loading">
          <div className="cp-pulse">
            <div className="cp-pulse-dot" />
            <div className="cp-pulse-dot" />
            <div className="cp-pulse-dot" />
            <span style={{ color: 'rgba(167,139,250,0.5)', fontSize: 13, marginLeft: 8 }}>ກຳລັງໂຫຼດ...</span>
          </div>
        </div>
      </>
    );
  }

  const totalSearchHits = searchResults ? searchResults.reduce((s, r) => s + r.count, 0) : 0;

  return (
    <>
      <style>{STYLE}</style>
      <div className="cp-root p-6 sm:p-8 space-y-6">

        {/* Decorative glows & stars */}
        <div className="cp-glow-purple" />
        <div className="cp-glow-gold" />
        <div className="cp-glow-mid" />
        <div className="cp-star" style={{ top: '18%', right: '12%' }} />
        <div className="cp-star" style={{ top: '55%', right: '6%', animationDelay: '1.1s' }} />
        <div className="cp-star" style={{ top: '75%', left: '8%', animationDelay: '2.2s' }} />

        {/* ─── Header ─── */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="cp-icon-box">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
            >
              swap_horiz
            </span>
          </div>
          <div>
            <h2 style={{
              fontSize: 17, fontWeight: 900, letterSpacing: '-0.01em',
              background: 'linear-gradient(90deg, #c4b5fd 0%, #e9d5ff 50%, #fde68a 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              ສະຖິຕິຈັບຄູ່ຕົວເລກ
            </h2>
            <p style={{ fontSize: 11, color: 'rgba(167,139,250,0.55)', marginTop: 1 }}>
              Consecutive Pairs · ວິເຄາະລໍາດັບ
            </p>
          </div>

          {/* VIP badge */}
          <div style={{
            marginLeft: 'auto',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(251,191,36,0.08) 100%)',
            border: '1px solid rgba(251,191,36,0.25)',
            borderRadius: 20,
            padding: '4px 12px',
            fontSize: 10, fontWeight: 900, letterSpacing: '0.12em',
            color: '#fbbf24',
          }}>
            ✦ LIVE
          </div>
        </div>

        {/* ─── Search / Oracle Zone ─── */}
        <div className="cp-search-zone relative z-10">
          <p className="cp-section-label mb-3">
            ✦ ຄົ້ນຫາ — ເລກໃດອອກຕາມ?
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {/* Input */}
            <div className="cp-input-wrap">
              <span className="cp-input-icon material-symbols-outlined">search</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={inputVal}
                onChange={handleInput}
                placeholder="ພິມ 2 ຕົວ (07)"
                className="cp-input"
              />
            </div>

            {/* Query display */}
            {query.length === 2 && (
              <div className="cp-query-badge">
                <span style={{ fontSize: 11, color: 'rgba(167,139,250,0.55)' }}>ຫຼັງ</span>
                <div
                  className="cp-ball cp-ball-md cp-ball-p1"
                  style={{ width: 44, height: 44, fontSize: 18 }}
                >
                  {query}
                </div>
                <span style={{ fontSize: 11, color: 'rgba(167,139,250,0.55)' }}>ອອກ…</span>
              </div>
            )}

            {/* Clear */}
            {query.length === 2 && (
              <button onClick={() => setInputVal('')} className="cp-clear-btn">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                ລ້າງ
              </button>
            )}
          </div>

          {/* ─── Search Results ─── */}
          {searchResults !== null && (
            <div className="mt-4">
              {searchResults.length === 0 ? (
                <div className="cp-empty">
                  <span className="material-symbols-outlined" style={{ fontSize: 36, display: 'block', marginBottom: 6 }}>
                    search_off
                  </span>
                  ເລກ <strong style={{ color: '#c4b5fd' }}>{query}</strong> ຍັງບໍ່ເຄີຍເຫັນໃນຂໍ້ມູນ
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="cp-section-label mb-3">
                    ລໍາດັບເລກທີ່ຕາມຫຼັງ{' '}
                    <span style={{ color: '#c4b5fd' }}>{query}</span>
                    {' '}— {totalSearchHits} ຄັ້ງ
                  </p>
                  {searchResults.map((r, i) => {
                    const ballCls = getPurpleBall(i);
                    const maxCount = searchResults[0].count;
                    const barW = Math.round((r.count / maxCount) * 100);
                    return (
                      <div key={r.nextNum} className="cp-result-row">
                        {/* Rank */}
                        <span style={{
                          width: 20, textAlign: 'center',
                          fontSize: 10, fontWeight: 900,
                          color: i < 3 ? 'rgba(167,139,250,0.8)' : 'rgba(167,139,250,0.3)',
                          flexShrink: 0,
                        }}>
                          {i + 1}
                        </span>

                        {/* Ball */}
                        <div className={`cp-ball cp-ball-sm ${ballCls}`}>{r.nextNum}</div>

                        {/* Bar + stats */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 11, color: 'rgba(167,139,250,0.55)' }}>{r.pct}%</span>
                            <span style={{ fontSize: 12, fontWeight: 900, color: '#e9d5ff' }}>{r.count} ຄັ້ງ</span>
                          </div>
                          <div className="cp-bar-track">
                            <div className="cp-bar-fill-p" style={{ width: `${barW}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Divider ─── */}
        {searchResults && searchResults.length > 0 && <div className="cp-divider" />}

        {/* ─── Hot Pairs Section ─── */}
        <div className="cp-gold-section relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="cp-section-label-gold">
              ✦ Top 10 — ຄູ່ທີ່ຮ້ອນທີ່ສຸດ
            </p>
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
              color: 'rgba(251,191,36,0.5)',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.15)',
              borderRadius: 8, padding: '3px 8px',
            }}>
              ALL TIME
            </span>
          </div>

          {hotPairs.length === 0 ? (
            <div className="cp-empty" style={{ color: 'rgba(251,191,36,0.35)' }}>
              ຍັງບໍ່ມີຂໍ້ມູນພຽງພໍ
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {hotPairs.map((pair, i) => {
                const ballCls = getGoldBall(i);
                const barW = Math.round((pair.count / maxHot) * 100);
                const isShimmer = i < 3;
                return (
                  <div
                    key={`${pair.currentNum}-${pair.nextNum}`}
                    className={`cp-pair-card${isShimmer ? ' cp-pair-card-shimmer' : ''}`}
                    onClick={() => setInputVal(pair.currentNum)}
                    title={`ກົດເພື່ອຄົ້ນຫາ ${pair.currentNum}`}
                  >
                    {/* Rank */}
                    <span className="cp-rank">{i + 1}</span>

                    {/* From ball (neutral gold) */}
                    <div className="cp-ball cp-ball-sm cp-ball-gneutral">{pair.currentNum}</div>

                    {/* Arrow */}
                    <span className="cp-arrow material-symbols-outlined">arrow_right_alt</span>

                    {/* To ball (colored) */}
                    <div className={`cp-ball cp-ball-sm ${ballCls}`}>{pair.nextNum}</div>

                    {/* Gold bar */}
                    <div className="cp-bar-track-g">
                      <div className="cp-bar-fill-g" style={{ width: `${barW}%` }} />
                    </div>

                    {/* Count */}
                    <span style={{
                      fontSize: 13, fontWeight: 900,
                      color: i < 3 ? '#fbbf24' : 'rgba(251,191,36,0.6)',
                      flexShrink: 0, minWidth: 24, textAlign: 'right',
                    }}>
                      {pair.count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
