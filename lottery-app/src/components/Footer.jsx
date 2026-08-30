import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png'

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
    width: 38px; height: 38px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    position: relative;
    transition: transform 0.2s;
  }
  .ft-brand:hover .ft-flag {
    transform: scale(1.08) rotate(-6deg);
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
                <img src={logoImg} alt="LAOLOTS" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
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
