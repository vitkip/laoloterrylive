import { Link } from 'react-router-dom';

const API_DOCS_URL = import.meta.env.DEV
  ? 'http://localhost/laoloterylive/api/docs/'
  : '/api/docs/';

const FOOTER_LINKS = [
  { label: 'API Documentation', href: API_DOCS_URL, target: '_blank' },
  { label: 'ເງື່ອນໄຂການໃຊ້ງານ', href: '/terms' },
  { label: 'ຕິດຕໍ່ເຮົາ', href: '/contact' },
];

const STYLE = `
  .ft-root {
    position: relative;
    background: #06070e;
    border-top: 1px solid rgba(255,255,255,0.06);
    overflow: hidden;
    margin-top: auto;
  }

  /* Gold top accent stripe */
  .ft-stripe {
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      #b45309 15%,
      #f59e0b 35%,
      #fde68a 50%,
      #f59e0b 65%,
      #b45309 85%,
      transparent 100%
    );
  }

  /* Subtle mesh overlay */
  .ft-mesh {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.006) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.006) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  /* Ambient glow */
  .ft-orb {
    position: absolute; width: 500px; height: 200px; border-radius: 50%;
    bottom: -120px; left: 50%; transform: translateX(-50%);
    background: radial-gradient(ellipse, rgba(245,158,11,0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Inner wrapper */
  .ft-inner {
    position: relative; z-index: 10;
    max-width: 1280px; margin: 0 auto;
    padding: 32px 24px 24px;
  }

  /* Main row */
  .ft-main {
    display: flex; align-items: center;
    justify-content: space-between;
    flex-wrap: wrap; gap: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255,255,255,0.055);
  }

  /* Brand */
  .ft-brand {
    display: flex; align-items: center; gap: 12px;
    text-decoration: none; flex-shrink: 0;
    transition: opacity 0.18s;
  }
  .ft-brand:hover { opacity: 0.80; }

  .ft-flag {
    width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
    background: conic-gradient(from 0deg, #D4AF37, #FFF5C0, #B8860B, #8B6914, #D4AF37);
    box-shadow: 0 2px 14px rgba(212,175,55,0.35), inset 0 1px 3px rgba(255,255,255,0.35);
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .ft-flag::after {
    content: '';
    position: absolute; top: 4px; left: 7px;
    width: 10px; height: 6px;
    background: rgba(255,255,255,0.45);
    border-radius: 50%; transform: rotate(-28deg);
    z-index: 2; pointer-events: none;
  }
  .ft-brand:hover .ft-flag {
    transform: scale(1.08) rotate(-6deg);
    box-shadow: 0 4px 20px rgba(212,175,55,0.5);
  }

  .ft-brand-name {
    font-size: 16px; font-weight: 900; letter-spacing: -0.02em;
    color: rgba(255,255,255,0.88);
  }
  .ft-brand-com { color: #f59e0b; }
  .ft-brand-tag {
    font-size: 9px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(255,255,255,0.25);
    margin-top: 3px; display: block;
  }

  /* Nav links */
  .ft-nav {
    display: flex; flex-wrap: wrap;
    align-items: center; gap: 0;
  }
  .ft-nav-sep {
    color: rgba(255,255,255,0.15); font-size: 12px;
    padding: 0 10px; user-select: none;
  }
  .ft-link {
    font-size: 12px; font-weight: 700;
    color: rgba(255,255,255,0.35);
    text-decoration: none;
    transition: color 0.18s;
    white-space: nowrap;
  }
  .ft-link:hover { color: #fcd34d; }

  /* Bottom row */
  .ft-bottom {
    display: flex; align-items: center;
    justify-content: space-between;
    flex-wrap: wrap; gap: 8px;
    padding-top: 16px;
  }
  .ft-copy {
    font-size: 11px; font-weight: 600;
    color: rgba(255,255,255,0.20);
  }
  .ft-copy-brand { color: rgba(245,158,11,0.55); }
  .ft-tagline {
    font-size: 11px; font-weight: 600;
    color: rgba(255,255,255,0.14);
    letter-spacing: 0.02em;
  }

  /* Decorative lottery balls row */
  .ft-balls {
    display: flex; align-items: center; gap: 6px;
    flex-shrink: 0;
  }
  .ft-dot {
    width: 7px; height: 7px; border-radius: 50%;
  }
`;

const BALL_COLORS = ['#ef4444','#f59e0b','#22d3ee','#4ade80','#a78bfa'];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <style>{STYLE}</style>
      <footer className="ft-root">
        <div className="ft-stripe" />
        <div className="ft-mesh" />
        <div className="ft-orb" />

        <div className="ft-inner">

          {/* ── Main row: brand + nav ── */}
          <div className="ft-main">

            {/* Brand */}
            <Link to="/home" className="ft-brand">
              <div className="ft-flag">
                <svg viewBox="0 0 38 38" style={{ width: '100%', height: '100%', display: 'block', zIndex: 1 }}>
                  <defs>
                    <clipPath id="circleClipFooter">
                      <circle cx="19" cy="19" r="17" />
                    </clipPath>
                    <linearGradient id="goldStripeFooter" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#A67C1E" />
                      <stop offset="50%" stopColor="#F5D77F" />
                      <stop offset="100%" stopColor="#A67C1E" />
                    </linearGradient>
                    <linearGradient id="darkStripeFooter" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0F1326" />
                      <stop offset="50%" stopColor="#1E2548" />
                      <stop offset="100%" stopColor="#0F1326" />
                    </linearGradient>
                    <radialGradient id="goldCircleFooter" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FFFDF5" />
                      <stop offset="70%" stopColor="#F3D072" />
                      <stop offset="100%" stopColor="#C99E32" />
                    </radialGradient>
                  </defs>
                  <g clipPath="url(#circleClipFooter)">
                    <rect x="0" y="0" width="38" height="9.5" fill="url(#goldStripeFooter)" />
                    <rect x="0" y="9.5" width="38" height="19" fill="url(#darkStripeFooter)" />
                    <rect x="0" y="28.5" width="38" height="9.5" fill="url(#goldStripeFooter)" />
                    <circle cx="19" cy="19" r="6.5" fill="url(#goldCircleFooter)" />
                  </g>
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span className="ft-brand-name">
                  laolots<span className="ft-brand-com">.com</span>
                </span>
                <span className="ft-brand-tag">ຫວຍພັດທະນາລາວ</span>
              </div>
            </Link>

            {/* Decorative dots + nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <div className="ft-balls">
                {BALL_COLORS.map((c, i) => (
                  <div
                    key={i}
                    className="ft-dot"
                    style={{ background: c, boxShadow: `0 0 6px ${c}70`, opacity: 0.65 }}
                  />
                ))}
              </div>

              <nav className="ft-nav">
                {FOOTER_LINKS.map((link, i) => (
                  <span key={link.label} style={{ display: 'flex', alignItems: 'center' }}>
                    {i > 0 && <span className="ft-nav-sep">·</span>}
                    {link.href.startsWith('/') && !link.target ? (
                      <Link to={link.href} className="ft-link">{link.label}</Link>
                    ) : (
                      <a
                        href={link.href}
                        target={link.target}
                        rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
                        className="ft-link"
                      >
                        {link.label}
                      </a>
                    )}
                  </span>
                ))}
              </nav>
            </div>

          </div>

          {/* ── Bottom row: copyright + tagline ── */}
          <div className="ft-bottom">
            <p className="ft-copy">
              © {year} <span className="ft-copy-brand">laolots.com</span> — All rights reserved.
            </p>
            <p className="ft-tagline">
              ສູນລວມຜົນຫວຍ ແລະ ສະຖິຕິຫວຍລາວອອນລາຍ
            </p>
          </div>

        </div>
      </footer>
    </>
  );
}
