import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home, Clock, BarChart2, TrendingUp, Search,
  Moon, Sun, Menu, User, Shield, LogOut, Lock,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// ── Nav links ──────────────────────────────────────────────────────

const GUEST_LINKS = [
  { label: 'ຜົນຫວຍລ່າສຸດ',   href: '/',           Icon: Home },
  { label: 'ປະຫວັດຍ້ອນຫຼັງ', href: '/history',    Icon: Clock },
  { label: 'ສະຖິຕິ',          href: '/statistics', Icon: BarChart2 },
  { label: 'ຄົ້ນຫາ & ແປຝັນ', href: '/search',     Icon: Search },
]
const MEMBER_LINKS = [
  { label: 'ຜົນຫວຍລ່າສຸດ',   href: '/',           Icon: Home },
  { label: 'ປະຫວັດຍ້ອນຫຼັງ', href: '/history',    Icon: Clock },
  { label: 'ສະຖິຕິ',          href: '/statistics', Icon: BarChart2 },
  { label: 'AI Analytics',    href: '/analytics',  Icon: TrendingUp },
  { label: 'ຄົ້ນຫາ & ແປຝັນ', href: '/search',     Icon: Search },
]

function getNavLinks(user) { return user ? MEMBER_LINKS : GUEST_LINKS }

// ── Styles ─────────────────────────────────────────────────────────

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao+Looped:wght@300;400;500;600;700;900&display=swap');

  .nb-root { font-family: 'Noto Sans Lao Looped', sans-serif; }

  /* ── Header bar ── */
  .nb-header {
    position: sticky; top: 0; z-index: 50; width: 100%;
    transition: background 0.25s, box-shadow 0.25s, border-color 0.25s;
    border-bottom: 1px solid rgba(212,175,55,0.0);
  }
  .nb-header::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent 5%, rgba(212,175,55,0.45) 50%, transparent 95%);
    opacity: 0; transition: opacity 0.25s;
  }
  .nb-header.scrolled {
    background: rgba(6,8,18,0.88);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom-color: rgba(212,175,55,0.12);
    box-shadow: 0 4px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(212,175,55,0.08);
  }
  .nb-header.scrolled::before { opacity: 1; }
  .nb-header.flat {
    background: rgba(6,8,18,0.72);
    border-bottom-color: rgba(212,175,55,0.07);
  }

  /* ── Logo ── */
  .nb-ball {
    width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
    background: conic-gradient(from 0deg, #D4AF37, #FFF5C0, #B8860B, #8B6914, #D4AF37);
    box-shadow: 0 2px 14px rgba(212,175,55,0.35), inset 0 1px 3px rgba(255,255,255,0.35);
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .nb-ball::after {
    content: '';
    position: absolute; top: 4px; left: 7px;
    width: 10px; height: 6px;
    background: rgba(255,255,255,0.45);
    border-radius: 50%; transform: rotate(-28deg);
    z-index: 2; pointer-events: none;
  }
  .nb-logo:hover .nb-ball { transform: scale(1.08) rotate(-6deg); box-shadow: 0 4px 20px rgba(212,175,55,0.5); }
  .nb-logo-name {
    font-size: 16px; font-weight: 900; color: #fff;
    letter-spacing: 0.01em; line-height: 1;
  }
  .nb-logo-name span {
    background: linear-gradient(90deg, #D4AF37, #FFD54F);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .nb-logo-sub {
    font-size: 8.5px; font-weight: 600;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(212,175,55,0.45); margin-top: 2px;
  }

  /* ── Desktop nav link ── */
  .nb-link {
    position: relative;
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 13px; border-radius: 10px;
    font-size: 13px; font-weight: 600;
    font-family: 'Noto Sans Lao Looped', sans-serif;
    color: rgba(255,255,255,0.45);
    text-decoration: none;
    transition: color 0.18s, background 0.18s;
  }
  .nb-link:hover {
    color: rgba(255,255,255,0.85);
    background: rgba(212,175,55,0.07);
  }
  .nb-link.active {
    color: #FFD54F;
    background: rgba(212,175,55,0.1);
  }
  .nb-link-dot {
    position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%);
    width: 3px; height: 3px; border-radius: 50%;
    background: #D4AF37; box-shadow: 0 0 6px rgba(212,175,55,0.8);
  }

  /* AI lock hint */
  .nb-lock-hint {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 11px; border-radius: 10px;
    font-size: 11px; font-weight: 600;
    font-family: 'Noto Sans Lao Looped', sans-serif;
    color: rgba(212,175,55,0.45);
    background: rgba(212,175,55,0.05);
    border: 1px solid rgba(212,175,55,0.1);
  }

  /* ── Icon buttons (theme toggle, etc.) ── */
  .nb-icon-btn {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(212,175,55,0.1);
    color: rgba(255,255,255,0.4);
    cursor: pointer; transition: all 0.18s;
  }
  .nb-icon-btn:hover {
    background: rgba(212,175,55,0.1);
    color: #FFD54F;
    border-color: rgba(212,175,55,0.3);
  }

  /* ── Login button ── */
  .nb-login-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 16px; border-radius: 10px;
    font-size: 13px; font-weight: 700;
    font-family: 'Noto Sans Lao Looped', sans-serif;
    color: #0C1020;
    background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
    border: none; cursor: pointer;
    box-shadow: 0 2px 12px rgba(212,175,55,0.35);
    transition: all 0.2s;
    text-decoration: none;
  }
  .nb-login-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(212,175,55,0.5);
    background: linear-gradient(135deg, #FFD54F 0%, #D4AF37 100%);
  }

  /* ── User trigger button ── */
  .nb-user-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 5px 10px 5px 5px; border-radius: 22px;
    background: rgba(212,175,55,0.07);
    border: 1px solid rgba(212,175,55,0.18);
    cursor: pointer; transition: all 0.18s;
    color: rgba(255,255,255,0.8);
  }
  .nb-user-btn:hover {
    background: rgba(212,175,55,0.13);
    border-color: rgba(212,175,55,0.32);
  }
  .nb-user-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg, #D4AF37 0%, #8B6914 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 0 1px rgba(212,175,55,0.35), inset 0 1px 1px rgba(255,255,255,0.25);
    flex-shrink: 0;
  }
  .nb-user-initial { font-size: 11px; font-weight: 900; color: #0C1020; }
  .nb-user-name { font-size: 12.5px; font-weight: 700; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* ── Dropdown menu overrides ── */
  .nb-dropdown {
    min-width: 210px;
    background: linear-gradient(160deg, #141828 0%, #0E1220 100%) !important;
    border: 1px solid rgba(212,175,55,0.18) !important;
    border-radius: 14px !important;
    box-shadow: 0 16px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(212,175,55,0.05) !important;
    padding: 6px !important;
    font-family: 'Noto Sans Lao Looped', sans-serif !important;
    animation: nb-drop-in 0.15s ease !important;
  }
  @keyframes nb-drop-in {
    from { opacity: 0; transform: translateY(6px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .nb-dd-label {
    padding: 10px 12px 12px;
    border-bottom: 1px solid rgba(212,175,55,0.1);
    margin-bottom: 4px;
  }
  .nb-dd-label-name {
    font-size: 13px; font-weight: 700; color: #E8E6F0; margin-bottom: 5px;
  }
  .nb-role-pill {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 20px;
    font-size: 9.5px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .nb-role-admin  { background: rgba(239,68,68,0.12);  color: #fca5a5; border: 1px solid rgba(239,68,68,0.2); }
  .nb-role-staff  { background: rgba(59,130,246,0.12); color: #93c5fd; border: 1px solid rgba(59,130,246,0.2); }
  .nb-role-member { background: rgba(212,175,55,0.12); color: #D4AF37; border: 1px solid rgba(212,175,55,0.2); }
  .nb-dd-item {
    display: flex; align-items: center; gap: 9px;
    padding: 9px 12px; border-radius: 9px;
    font-size: 13px; font-weight: 600;
    font-family: 'Noto Sans Lao Looped', sans-serif;
    color: rgba(232,230,240,0.65);
    cursor: pointer; transition: background 0.15s, color 0.15s;
    border: none; background: transparent; width: 100%; text-align: left;
  }
  .nb-dd-item:hover { background: rgba(212,175,55,0.08); color: #FFD54F; }
  .nb-dd-item.danger { color: rgba(248,113,113,0.8); }
  .nb-dd-item.danger:hover { background: rgba(239,68,68,0.1); color: #fca5a5; }
  .nb-dd-sep {
    height: 1px; margin: 4px 8px;
    background: rgba(212,175,55,0.1);
  }

  /* ── Mobile sheet ── */
  .nb-sheet {
    background: linear-gradient(180deg, #0C1020 0%, #0A0E1C 100%) !important;
    border-right: 1px solid rgba(212,175,55,0.15) !important;
    font-family: 'Noto Sans Lao Looped', sans-serif !important;
    display: flex; flex-direction: column;
  }
  .nb-sheet-head {
    display: flex; align-items: center; gap: 10px;
    padding: 16px 18px;
    border-bottom: 1px solid rgba(212,175,55,0.1);
    background: rgba(0,0,0,0.15);
    position: relative;
  }
  .nb-sheet-head::after {
    content: '';
    position: absolute; bottom: -1px; left: 15%; right: 15%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212,175,55,0.25), transparent);
  }

  /* Mobile nav links */
  .nb-mob-link {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px; border-radius: 12px;
    font-size: 14px; font-weight: 600;
    color: rgba(255,255,255,0.45);
    text-decoration: none;
    transition: all 0.18s;
    position: relative;
  }
  .nb-mob-link:hover {
    background: rgba(212,175,55,0.07);
    color: rgba(255,255,255,0.85);
  }
  .nb-mob-link.active {
    background: rgba(212,175,55,0.12);
    color: #FFD54F;
    box-shadow: inset 0 0 0 1px rgba(212,175,55,0.18);
  }
  .nb-mob-link.active::before {
    content: '';
    position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 3px; border-radius: 0 3px 3px 0;
    background: linear-gradient(180deg, #D4AF37, #B8860B);
    box-shadow: 0 0 8px rgba(212,175,55,0.5);
  }
  .nb-mob-active-dot {
    margin-left: auto; width: 6px; height: 6px; border-radius: 50%;
    background: #D4AF37; box-shadow: 0 0 6px rgba(212,175,55,0.7);
  }
  .nb-mob-section-label {
    font-size: 9px; font-weight: 700; letter-spacing: 0.2em;
    text-transform: uppercase; color: rgba(212,175,55,0.4);
    padding: 4px 14px 6px;
  }
  .nb-mob-lock {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 12px; margin-top: 2px;
    background: rgba(212,175,55,0.04);
    border: 1px dashed rgba(212,175,55,0.12);
    font-size: 12px; font-weight: 600;
    color: rgba(212,175,55,0.38);
  }

  /* Mobile footer */
  .nb-mob-footer {
    border-top: 1px solid rgba(212,175,55,0.1);
    padding: 14px 16px;
    background: rgba(0,0,0,0.15);
  }
  .nb-mob-user-row {
    display: flex; align-items: center; justify-content: space-between;
  }
  .nb-mob-user-info { display: flex; align-items: center; gap: 10px; }
  .nb-mob-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, #D4AF37 0%, #8B6914 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 0 2px rgba(212,175,55,0.25);
  }
  .nb-mob-avatar-initial { font-size: 13px; font-weight: 900; color: #0C1020; }
  .nb-mob-user-name { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.88); }
  .nb-mob-user-role { font-size: 10px; font-weight: 600; color: rgba(212,175,55,0.5); text-transform: uppercase; letter-spacing: 0.08em; }
  .nb-mob-logout {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 12px; border-radius: 9px;
    font-size: 11.5px; font-weight: 700;
    font-family: 'Noto Sans Lao Looped', sans-serif;
    color: rgba(248,113,113,0.85);
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    cursor: pointer; transition: all 0.15s;
  }
  .nb-mob-logout:hover { background: rgba(239,68,68,0.15); color: #fca5a5; }
  .nb-mob-login {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 11px;
    border-radius: 12px; font-size: 14px; font-weight: 700;
    font-family: 'Noto Sans Lao Looped', sans-serif;
    color: #0C1020;
    background: linear-gradient(135deg, #D4AF37, #B8860B);
    border: none; cursor: pointer; text-decoration: none;
    box-shadow: 0 3px 16px rgba(212,175,55,0.35);
    transition: all 0.2s;
  }
  .nb-mob-login:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(212,175,55,0.5);
  }

  /* Sheet admin link */
  .nb-mob-admin {
    color: rgba(52,211,153,0.7) !important;
  }
  .nb-mob-admin:hover {
    background: rgba(52,211,153,0.07) !important;
    color: rgba(52,211,153,0.9) !important;
  }
  .nb-mob-admin.active {
    background: rgba(52,211,153,0.1) !important;
    color: #6ee7b7 !important;
  }
`

// ── RolePill ───────────────────────────────────────────────────────

function RolePill({ role }) {
  const cls = {
    admin:  'nb-role-admin',
    staff:  'nb-role-staff',
    member: 'nb-role-member',
  }
  return (
    <span className={`nb-role-pill ${cls[role] ?? 'nb-role-member'}`}>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {role}
    </span>
  )
}

// ── LotteryBall logo ───────────────────────────────────────────────

function LotteryBall() {
  return (
    <div className="nb-ball">
      <svg viewBox="0 0 38 38" style={{ width: '100%', height: '100%', display: 'block', zIndex: 1 }}>
        <defs>
          <clipPath id="circleClipNav">
            <circle cx="19" cy="19" r="17" />
          </clipPath>
          <linearGradient id="goldStripeNav" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A67C1E" />
            <stop offset="50%" stopColor="#F5D77F" />
            <stop offset="100%" stopColor="#A67C1E" />
          </linearGradient>
          <linearGradient id="darkStripeNav" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0F1326" />
            <stop offset="50%" stopColor="#1E2548" />
            <stop offset="100%" stopColor="#0F1326" />
          </linearGradient>
          <radialGradient id="goldCircleNav" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFDF5" />
            <stop offset="70%" stopColor="#F3D072" />
            <stop offset="100%" stopColor="#C99E32" />
          </radialGradient>
        </defs>
        <g clipPath="url(#circleClipNav)">
          <rect x="0" y="0" width="38" height="9.5" fill="url(#goldStripeNav)" />
          <rect x="0" y="9.5" width="38" height="19" fill="url(#darkStripeNav)" />
          <rect x="0" y="28.5" width="38" height="9.5" fill="url(#goldStripeNav)" />
          <circle cx="19" cy="19" r="6.5" fill="url(#goldCircleNav)" />
        </g>
      </svg>
    </div>
  )
}

// ── Main Navbar ────────────────────────────────────────────────────

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false)
  const [isDark,     setIsDark]     = useState(true)
  const [sheetOpen,  setSheetOpen]  = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user, logout } = useAuth()

  const navLinks   = getNavLinks(user)
  const isAdmin    = user?.role === 'admin' || user?.role === 'staff'
  const profilePath = isAdmin ? '/admin/profile' : '/member/profile'
  const userInitial = ((user?.name || user?.username || 'U')[0]).toUpperCase()

  useEffect(() => { setSheetOpen(false) }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    const dark = theme ? theme === 'dark' : true;
    document.documentElement.classList.toggle('dark', dark)
    setIsDark(dark)
  }, [])

  const toggleDark = () => {
    const next = !isDark
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    setIsDark(next)
  }

  const isActive = (href) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  return (
    <>
      <style>{STYLE}</style>

      <header className={cn('nb-root nb-header', scrolled ? 'scrolled' : 'flat')}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 62 }}>

          {/* ── Logo ── */}
          <Link to="/home" className="nb-logo" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <LotteryBall />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="nb-logo-name">laolots<span>.com</span></span>
              <span className="nb-logo-sub">ຫວຍພັດທະນາລາວ</span>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <nav style={{ display: 'none', alignItems: 'center', gap: 2 }} className="hidden md:flex">
            {navLinks.map(({ href, label, Icon }) => (
              <Link key={href} to={href} className={cn('nb-link', isActive(href) && 'active')}>
                <Icon style={{ width: 15, height: 15 }} />
                {label}
                {isActive(href) && <span className="nb-link-dot" />}
              </Link>
            ))}
            {!user && (
              <span className="nb-lock-hint" style={{ marginLeft: 6 }}>
                <Lock style={{ width: 11, height: 11 }} />
                ເຂົ້າສູ່ລະບົບ ເພື່ອໃຊ້ AI Analytics
              </span>
            )}
          </nav>

          {/* ── Right actions ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

            {/* Theme toggle */}
            <button className="nb-icon-btn" onClick={toggleDark} aria-label="Toggle theme">
              {isDark
                ? <Sun  style={{ width: 16, height: 16 }} />
                : <Moon style={{ width: 16, height: 16 }} />
              }
            </button>

            {/* Desktop auth */}
            {user ? (
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="nb-user-btn">
                      <div className="nb-user-avatar">
                        <span className="nb-user-initial">{userInitial}</span>
                      </div>
                      <span className="nb-user-name">{user.name || user.username}</span>
                      <ChevronDown style={{ width: 13, height: 13, color: 'rgba(212,175,55,0.45)', flexShrink: 0 }} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="nb-dropdown p-0 border-0 bg-transparent shadow-none">
                    <div className="nb-dd-label">
                      <div className="nb-dd-label-name">{user.name || user.username}</div>
                      <RolePill role={user.role} />
                    </div>

                    <button className="nb-dd-item" onClick={() => navigate(profilePath)}>
                      <User style={{ width: 15, height: 15, color: '#D4AF37', flexShrink: 0 }} />
                      ຂໍ້ມູນສ່ວນຕົວ
                    </button>

                    {isAdmin && (
                      <button className="nb-dd-item" onClick={() => navigate('/admin')}>
                        <Shield style={{ width: 15, height: 15, color: 'rgba(52,211,153,0.7)', flexShrink: 0 }} />
                        ຈັດການລະບົບ
                      </button>
                    )}

                    <div className="nb-dd-sep" />

                    <button className="nb-dd-item danger" onClick={logout}>
                      <LogOut style={{ width: 15, height: 15, flexShrink: 0 }} />
                      ອອກຈາກລະບົບ
                    </button>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link to="/login" className="nb-login-btn hidden md:inline-flex">
                <User style={{ width: 14, height: 14 }} />
                ເຂົ້າສູ່ລະບົບ
              </Link>
            )}

            {/* Mobile hamburger */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <button
                  className="nb-icon-btn md:hidden"
                  aria-label="Open menu"
                >
                  <Menu style={{ width: 18, height: 18 }} />
                </button>
              </SheetTrigger>

              <SheetContent side="left" className="nb-sheet w-[280px] p-0 border-0">

                {/* Sheet header */}
                <div className="nb-sheet-head">
                  <LotteryBall />
                  <div>
                    <div className="nb-logo-name" style={{ fontSize: 15 }}>laolots<span style={{ background: 'linear-gradient(90deg, #D4AF37, #FFD54F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>.com</span></div>
                    <div className="nb-logo-sub">ຫວຍພັດທະນາລາວ</div>
                  </div>
                </div>

                {/* Nav links */}
                <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
                  <div className="nb-mob-section-label">ເມນູ</div>

                  {navLinks.map(({ href, label, Icon }) => (
                    <Link key={href} to={href} className={cn('nb-mob-link', isActive(href) && 'active')}>
                      <Icon style={{ width: 17, height: 17, flexShrink: 0 }} />
                      {label}
                      {isActive(href) && <span className="nb-mob-active-dot" />}
                    </Link>
                  ))}

                  {!user && (
                    <div className="nb-mob-lock">
                      <Lock style={{ width: 15, height: 15, flexShrink: 0 }} />
                      <span>Login ເພື່ອໃຊ້ AI Analytics</span>
                    </div>
                  )}

                  {user && (
                    <>
                      <div style={{ height: 1, background: 'rgba(212,175,55,0.08)', margin: '8px 4px' }} />
                      <div className="nb-mob-section-label">ບັນຊີ</div>

                      <Link to={profilePath} className={cn('nb-mob-link', isActive(profilePath) && 'active')}>
                        <User style={{ width: 17, height: 17, flexShrink: 0 }} />
                        ຂໍ້ມູນສ່ວນຕົວ
                        {isActive(profilePath) && <span className="nb-mob-active-dot" />}
                      </Link>

                      {isAdmin && (
                        <Link to="/admin" className={cn('nb-mob-link nb-mob-admin', isActive('/admin') && 'active')}>
                          <Shield style={{ width: 17, height: 17, flexShrink: 0 }} />
                          ຈັດການລະບົບ (Admin)
                          {isActive('/admin') && <span className="nb-mob-active-dot" style={{ background: '#6ee7b7', boxShadow: '0 0 6px rgba(52,211,153,0.7)' }} />}
                        </Link>
                      )}
                    </>
                  )}
                </nav>

                {/* Footer */}
                <div className="nb-mob-footer">
                  {user ? (
                    <div className="nb-mob-user-row">
                      <div className="nb-mob-user-info">
                        <div className="nb-mob-avatar">
                          <span className="nb-mob-avatar-initial">{userInitial}</span>
                        </div>
                        <div>
                          <div className="nb-mob-user-name">{user.name || user.username}</div>
                          <div className="nb-mob-user-role">{user.role}</div>
                        </div>
                      </div>
                      <button className="nb-mob-logout" onClick={() => { logout(); setSheetOpen(false) }}>
                        <LogOut style={{ width: 13, height: 13 }} />
                        ອອກ
                      </button>
                    </div>
                  ) : (
                    <Link to="/login" className="nb-mob-login" onClick={() => setSheetOpen(false)}>
                      <User style={{ width: 17, height: 17 }} />
                      ເຂົ້າສູ່ລະບົບ
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  )
}
