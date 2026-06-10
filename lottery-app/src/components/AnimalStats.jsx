import { useState } from 'react'
import AnimalCard from './AnimalCard'
import { useStatistics } from '../hooks/useStatistics'

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao+Looped:wght@300;400;500;600;700;900&display=swap');

  .as-root {
    font-family: 'Noto Sans Lao Looped', sans-serif;
  }

  /* ── Section ── */
  .as-section {
    position: relative;
    background: linear-gradient(160deg, #0F1424 0%, #0C1020 55%, #080C18 100%);
    border: 1px solid rgba(212,175,55,0.13);
    border-radius: 24px;
    padding: 36px 28px 32px;
    overflow: hidden;
  }
  .as-section::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 5%, rgba(212,175,55,0.6) 50%, transparent 95%);
  }

  /* Decorative background — lottery orbs */
  .as-deco {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }
  .as-deco-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
  }
  .as-deco-orb-1 {
    width: 320px; height: 320px;
    right: -80px; top: -80px;
    background: radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%);
  }
  .as-deco-orb-2 {
    width: 260px; height: 260px;
    left: -60px; bottom: -60px;
    background: radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%);
  }
  /* Scattered decorative mini-balls */
  .as-deco-balls {
    position: absolute;
    inset: 0;
  }
  .as-deco-ball {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(184,134,11,0.06) 100%);
    border: 1px solid rgba(212,175,55,0.08);
  }

  /* ── Header ── */
  .as-header {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 32px;
    position: relative;
    z-index: 1;
  }
  @media (min-width: 768px) {
    .as-header { flex-direction: row; align-items: flex-end; justify-content: space-between; }
  }
  .as-header-left {}
  .as-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(212,175,55,0.7);
    margin-bottom: 8px;
  }
  .as-label-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #D4AF37;
    box-shadow: 0 0 6px rgba(212,175,55,0.7);
    animation: as-dot-pulse 2.4s ease-in-out infinite;
  }
  @keyframes as-dot-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.7); }
  }
  .as-title {
    font-size: clamp(22px, 3.5vw, 32px);
    font-weight: 900;
    color: #E8E6F0;
    line-height: 1.15;
    letter-spacing: -0.01em;
  }
  .as-title span {
    background: linear-gradient(90deg, #D4AF37, #FFD54F, #B8860B);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .as-header-right {
    max-width: 340px;
  }
  .as-desc {
    font-size: 13px;
    line-height: 1.75;
    color: rgba(232,230,240,0.45);
  }
  /* Count badge */
  .as-count-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
    padding: 5px 10px;
    border-radius: 20px;
    background: rgba(212,175,55,0.07);
    border: 1px solid rgba(212,175,55,0.16);
    font-size: 11px;
    font-weight: 600;
    color: rgba(212,175,55,0.65);
  }
  .as-count-badge .mat-icon { font-size: 13px !important; }

  /* ── Divider ── */
  .as-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212,175,55,0.12), transparent);
    margin-bottom: 28px;
    position: relative;
    z-index: 1;
  }

  /* ── Grid ── */
  .as-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    position: relative;
    z-index: 1;
  }
  @media (min-width: 640px)  { .as-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 900px)  { .as-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1200px) { .as-grid { grid-template-columns: repeat(4, 1fr); } }

  /* Stagger reveal for cards */
  .as-card-wrap {
    animation: as-card-in 0.35s ease both;
  }
  @keyframes as-card-in {
    from { opacity: 0; transform: translateY(14px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ── Toggle button ── */
  .as-toggle-wrap {
    display: flex;
    justify-content: center;
    margin-top: 28px;
    position: relative;
    z-index: 1;
  }
  .as-toggle-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    border-radius: 40px;
    font-family: 'Noto Sans Lao Looped', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #D4AF37;
    background: rgba(212,175,55,0.07);
    border: 1px solid rgba(212,175,55,0.22);
    cursor: pointer;
    transition: all 0.2s ease;
    letter-spacing: 0.02em;
  }
  .as-toggle-btn:hover {
    background: rgba(212,175,55,0.14);
    border-color: rgba(212,175,55,0.38);
    box-shadow: 0 0 20px rgba(212,175,55,0.12);
    transform: translateY(-1px);
  }
  .as-toggle-btn .mat-icon {
    font-size: 18px !important;
    transition: transform 0.25s ease;
  }
  .as-toggle-btn.expanded .mat-icon {
    transform: rotate(180deg);
  }
  /* Separator line before toggle */
  .as-toggle-line {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 28px;
    position: relative;
    z-index: 1;
  }
  .as-toggle-line::before,
  .as-toggle-line::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212,175,55,0.12));
  }
  .as-toggle-line::after {
    background: linear-gradient(90deg, rgba(212,175,55,0.12), transparent);
  }

  /* ── Loading skeletons ── */
  .as-skeleton-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    position: relative;
    z-index: 1;
  }
  @media (min-width: 640px)  { .as-skeleton-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 900px)  { .as-skeleton-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1200px) { .as-skeleton-grid { grid-template-columns: repeat(4, 1fr); } }
  .as-skeleton {
    background: linear-gradient(160deg, #141828 0%, #0E1220 100%);
    border: 1px solid rgba(212,175,55,0.08);
    border-radius: 18px;
    padding: 22px 18px 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .as-skel-circle {
    width: 68px; height: 68px;
    border-radius: 50%;
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(212,175,55,0.07) 50%, rgba(255,255,255,0.04) 100%);
    background-size: 200% 100%;
    animation: as-shimmer 1.6s ease-in-out infinite;
  }
  .as-skel-line {
    height: 10px;
    border-radius: 5px;
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(212,175,55,0.07) 50%, rgba(255,255,255,0.04) 100%);
    background-size: 200% 100%;
    animation: as-shimmer 1.6s ease-in-out infinite;
  }
  @keyframes as-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

function SkeletonCard({ delay = 0 }) {
  return (
    <div className="as-skeleton" style={{ animationDelay: `${delay}ms` }}>
      <div className="as-skel-circle" />
      <div className="as-skel-line" style={{ width: '60%', animationDelay: `${delay + 80}ms` }} />
      <div className="as-skel-line" style={{ width: '40%', animationDelay: `${delay + 160}ms` }} />
      <div className="as-skel-line" style={{ width: '80%', height: 6, marginTop: 4, animationDelay: `${delay + 240}ms` }} />
    </div>
  );
}

export default function AnimalStats({ timeframe }) {
  const [showAll, setShowAll] = useState(false);
  const { stats, loading }    = useStatistics(timeframe);

  const animalStats   = stats?.animalStats ?? [];
  const displayCount  = showAll ? animalStats.length : Math.min(8, animalStats.length);
  const visibleItems  = animalStats.slice(0, displayCount);
  const hasMore       = animalStats.length > 8;

  return (
    <section className="as-root as-section">
      <style>{STYLE}</style>

      {/* Decorative background */}
      <div className="as-deco">
        <div className="as-deco-orb as-deco-orb-1" />
        <div className="as-deco-orb as-deco-orb-2" />
        <div className="as-deco-balls">
          {[
            { w: 48, top: '12%',  right: '8%',  opacity: 0.6 },
            { w: 32, top: '28%',  right: '15%', opacity: 0.4 },
            { w: 56, top: '60%',  right: '4%',  opacity: 0.3 },
            { w: 24, bottom: '18%', left: '6%', opacity: 0.5 },
            { w: 38, top: '45%',  left: '2%',   opacity: 0.35 },
          ].map((b, i) => (
            <div key={i} className="as-deco-ball" style={{
              width: b.w, height: b.w,
              top: b.top, bottom: b.bottom,
              left: b.left, right: b.right,
              opacity: b.opacity,
            }} />
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="as-header">
        <div className="as-header-left">
          <div className="as-label">
            <span className="as-label-dot" />
            Premium Analysis
          </div>
          <h2 className="as-title">
            ສະຖິຕິ<span>ນາມສັດ</span>
          </h2>
          {!loading && animalStats.length > 0 && (
            <div className="as-count-badge">
              <span className="material-symbols-outlined mat-icon"
                style={{ fontVariationSettings: "'FILL' 1" }}>casino</span>
              ສະແດງ {displayCount} / ທັງໝົດ {animalStats.length} ຊະນິດ
            </div>
          )}
        </div>
        <div className="as-header-right">
          <p className="as-desc">
            ການວິເຄາະຄວາມຖີ່ຂອງນາມສັດທີ່ປະກົດຂຶ້ນ
            ໃນຜົນການອອກລາງວັນ ໂດຍແບ່ງຕາມໝວດໝູ່ສັດມຸງຄຸນ
          </p>
        </div>
      </div>

      <div className="as-divider" />

      {/* Cards grid */}
      {loading ? (
        <div className="as-skeleton-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} delay={i * 60} />
          ))}
        </div>
      ) : (
        <div className="as-grid">
          {visibleItems.map((animal, i) => (
            <div
              key={animal.name}
              className="as-card-wrap"
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <AnimalCard {...animal} />
            </div>
          ))}
        </div>
      )}

      {/* Toggle */}
      {!loading && hasMore && (
        <div className="as-toggle-line">
          <button
            className={`as-toggle-btn${showAll ? ' expanded' : ''}`}
            onClick={() => setShowAll(v => !v)}
          >
            <span className="material-symbols-outlined mat-icon">
              {showAll ? 'expand_less' : 'grid_view'}
            </span>
            {showAll
              ? 'ຫຍໍ້ລາຍການ'
              : `ເບິ່ງທັງໝົດ ${animalStats.length} ຊະນິດ`
            }
            <span className="material-symbols-outlined mat-icon">expand_more</span>
          </button>
        </div>
      )}
    </section>
  );
}
