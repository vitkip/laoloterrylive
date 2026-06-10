const CARD_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao+Looped:wght@300;400;500;600;700;900&display=swap');

  .ac-card {
    font-family: 'Noto Sans Lao Looped', sans-serif;
    position: relative;
    background: linear-gradient(160deg, #0F1424 0%, #0C1020 60%, #080C18 100%);
    border: 1px solid rgba(212,175,55,0.12);
    border-radius: 18px;
    padding: 22px 18px 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    cursor: default;
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
    overflow: hidden;
  }
  .ac-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.5) 50%, transparent 100%);
    opacity: 0;
    transition: opacity 0.22s;
  }
  .ac-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.2), 0 0 30px rgba(212,175,55,0.06);
    border-color: rgba(212,175,55,0.28);
  }
  .ac-card:hover::before {
    opacity: 1;
  }

  /* Corner ornament */
  .ac-card::after {
    content: '';
    position: absolute;
    bottom: 0; right: 0;
    width: 60px; height: 60px;
    background: radial-gradient(circle at bottom right, rgba(212,175,55,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Image medallion */
  .ac-medallion {
    position: relative;
    width: 82px;
    height: 82px;
    margin-bottom: 14px;
    flex-shrink: 0;
  }
  .ac-medallion-ring {
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      #D4AF37 0deg,
      #FFD54F 60deg,
      #B8860B 120deg,
      #D4AF37 180deg,
      #FFD54F 240deg,
      #B8860B 300deg,
      #D4AF37 360deg
    );
    animation: ac-ring-spin 8s linear infinite;
    opacity: 0.7;
  }
  .ac-card:hover .ac-medallion-ring {
    opacity: 1;
    animation-duration: 4s;
  }
  @keyframes ac-ring-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .ac-medallion-inner {
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: #0C1020;
    overflow: hidden;
    z-index: 1;
  }
  .ac-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: relative;
    z-index: 2;
    transition: opacity 0.2s;
  }
  .ac-icon-fallback {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    font-size: 32px !important;
    color: rgba(212,175,55,0.45);
  }

  /* Animal name */
  .ac-name {
    font-size: 14.5px;
    font-weight: 700;
    color: #E8E6F0;
    margin-bottom: 8px;
    line-height: 1.3;
    letter-spacing: 0.01em;
  }

  /* Number badge row */
  .ac-numbers-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    justify-content: center;
    margin-bottom: 14px;
  }
  .ac-num-ball {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #D4AF37 0%, #B8860B 60%, #8B6914 100%);
    box-shadow: 0 2px 8px rgba(212,175,55,0.3), inset 0 1px 2px rgba(255,255,255,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: #0C1020;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .ac-num-ball::after {
    content: '';
    position: absolute;
    top: 3px; left: 5px;
    width: 7px; height: 4px;
    background: rgba(255,255,255,0.4);
    border-radius: 50%;
    transform: rotate(-25deg);
  }
  .ac-card:hover .ac-num-ball {
    transform: scale(1.08);
    box-shadow: 0 3px 12px rgba(212,175,55,0.45), inset 0 1px 2px rgba(255,255,255,0.3);
  }

  /* Frequency bar */
  .ac-freq-wrap {
    width: 100%;
    margin-top: auto;
  }
  .ac-freq-track {
    width: 100%;
    height: 4px;
    background: rgba(255,255,255,0.06);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 6px;
  }
  .ac-freq-fill {
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(90deg, #B8860B 0%, #D4AF37 50%, #FFD54F 100%);
    box-shadow: 0 0 8px rgba(212,175,55,0.4);
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }
  .ac-freq-fill::after {
    content: '';
    position: absolute;
    right: 0; top: 0; bottom: 0;
    width: 4px;
    background: #FFE082;
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(255,224,130,0.8);
  }
  .ac-freq-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .ac-freq-text {
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(212,175,55,0.5);
  }
  .ac-freq-pct {
    font-size: 11px;
    font-weight: 700;
    color: #D4AF37;
    font-variant-numeric: tabular-nums;
  }
`;

function parseNumbers(numbers) {
  if (!numbers) return [];
  return String(numbers)
    .split(/[,\s\/]+/)
    .map(n => n.trim())
    .filter(Boolean);
}

export default function AnimalCard({ icon, name, numbers, frequencyPercent, image_url }) {
  const numList = parseNumbers(numbers);

  return (
    <div className="ac-card">
      <style>{CARD_STYLE}</style>

      {/* Medallion */}
      <div className="ac-medallion">
        <div className="ac-medallion-ring" />
        <div className="ac-medallion-inner">
          <img
            src={image_url}
            alt={`ນາມສັດ ${name}`}
            className="ac-img"
            onError={e => { e.target.style.opacity = '0'; }}
          />
          <span className="material-symbols-outlined ac-icon-fallback"
            style={{ fontVariationSettings: "'FILL' 1" }}>
            {icon || 'pets'}
          </span>
        </div>
      </div>

      {/* Name */}
      <h4 className="ac-name">{name}</h4>

      {/* Number balls */}
      <div className="ac-numbers-row">
        {numList.length > 0
          ? numList.map(n => (
              <div key={n} className="ac-num-ball">{n}</div>
            ))
          : <div className="ac-num-ball">{numbers}</div>
        }
      </div>

      {/* Frequency */}
      <div className="ac-freq-wrap">
        <div className="ac-freq-track">
          <div className="ac-freq-fill" style={{ width: `${frequencyPercent ?? 0}%` }} />
        </div>
        <div className="ac-freq-label">
          <span className="ac-freq-text">ຄວາມຖີ່</span>
          <span className="ac-freq-pct">{frequencyPercent ?? 0}%</span>
        </div>
      </div>
    </div>
  );
}
