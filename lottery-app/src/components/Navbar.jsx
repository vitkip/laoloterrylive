import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── Nav links by auth tier ─────────────────────────────────────────

const GUEST_LINKS = [
  { label: 'ຜົນຫວຍລ່າສຸດ', href: '/', icon: 'home' },
  { label: 'ປະຫວັດຍ້ອນຫຼັງ', href: '/history', icon: 'history' },
]

const MEMBER_LINKS = [
  { label: 'ຜົນຫວຍລ່າສຸດ', href: '/', icon: 'home' },
  { label: 'ປະຫວັດຍ້ອນຫຼັງ', href: '/history', icon: 'history' },
  { label: 'ສະຖິຕິ', href: '/statistics', icon: 'bar_chart' },
  { label: 'AI Analytics', href: '/analytics', icon: 'psychology' },
  { label: 'ຄົ້ນຫາ & ແປຝັນ', href: '/search', icon: 'manage_search' },
]

function getNavLinks(user) {
  if (!user) return GUEST_LINKS
  return MEMBER_LINKS
}

// ── User Dropdown ──────────────────────────────────────────────────

function UserDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const initial = ((user.name || user.username || 'U')[0]).toUpperCase()
  const isAdmin = user.role === 'admin' || user.role === 'staff'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 bg-[#f5f7ff] dark:bg-[#1e2d4a] px-3 py-1.5 rounded-xl border border-[#e8edf8] dark:border-[#2b3a54] hover:border-[#003fb1]/30 transition-all duration-200"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#003fb1] to-[#1a56db] flex items-center justify-center shrink-0">
          <span className="text-white text-[11px] font-black">{initial}</span>
        </div>
        <span className="text-[12px] font-bold text-[#121c2a] dark:text-white max-w-[80px] truncate">
          {user.name || user.username}
        </span>
        <span className="material-symbols-outlined text-[14px] text-[#737686] transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
          expand_more
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#152033] rounded-2xl shadow-xl border border-[#dee9fd] dark:border-[#2b3a54] z-50 overflow-hidden py-1">
          {/* User info */}
          <div className="px-4 py-3 border-b border-[#dee9fd] dark:border-[#2b3a54]">
            <p className="text-[12px] font-black text-[#121c2a] dark:text-white truncate">{user.name || user.username}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  user.role === 'staff' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                }`}>
                <span className="w-1 h-1 rounded-full bg-current" />
                {user.role}
              </span>
            </div>
          </div>

          {/* Profile link — different path by role */}
          <button
            onClick={() => { navigate(isAdmin ? '/admin/profile' : '/member/profile'); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-medium text-[#434654] dark:text-[#c7d2fe] hover:bg-[#f0f4ff] dark:hover:bg-[#1e2d4a] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-[#003fb1]">account_circle</span>
            ຂໍ້ມູນສ່ວນຕົວ
          </button>

          {/* Admin panel — staff/admin only */}
          {isAdmin && (
            <button
              onClick={() => { navigate('/admin'); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-medium text-[#434654] dark:text-[#c7d2fe] hover:bg-[#f0f4ff] dark:hover:bg-[#1e2d4a] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-[#006c49]">admin_panel_settings</span>
              ຈັດການລະບົບ
            </button>
          )}

          <div className="border-t border-[#dee9fd] dark:border-[#2b3a54] mt-1">
            <button
              onClick={() => { onLogout(); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              ອອກຈາກລະບົບ
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Navbar ────────────────────────────────────────────────────

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  const navLinks = getNavLinks(user)

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const dark =
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
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
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
          ? 'bg-white/80 dark:bg-[#0d1829]/85 backdrop-blur-xl shadow-[0_1px_24px_rgba(0,63,177,0.10)] border-b border-[#e8edf8]/80 dark:border-[#2b3a54]/60'
          : 'bg-white dark:bg-[#0d1829] border-b border-[#e8edf8] dark:border-[#2b3a54]/50'
        }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-[60px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#003fb1] to-[#1a56db] flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
              <span className="material-symbols-outlined text-white text-[18px]">diamond</span>
            </div>
            <span className="text-[15px] font-extrabold tracking-tight text-[#121c2a] dark:text-white">
              laolots<span className="text-[#003fb1]">.com</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${isActive(link.href)
                    ? 'bg-[#eff3ff] dark:bg-[#1e2d4a] text-[#003fb1] dark:text-[#93b4ff]'
                    : 'text-[#555870] dark:text-[#94a3b8] hover:bg-[#f5f7ff] dark:hover:bg-[#1a2640] hover:text-[#003fb1] dark:hover:text-white'
                  }`}
              >
                <span className="material-symbols-outlined text-[16px]">{link.icon}</span>
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#003fb1]" />
                )}
              </Link>
            ))}

            {/* Guest — prompt to sign up for more features */}
            {!user && (
              <span className="hidden lg:flex items-center gap-1.5 ml-1 text-[11px] text-[#003fb1]/50 bg-[#eff3ff] dark:bg-[#1e2d4a] px-2.5 py-1.5 rounded-xl border border-[#003fb1]/10">
                <span className="material-symbols-outlined text-[13px]">lock</span>
                ເຂົ້າສູ່ລະບົບ  ເພື່ອເບີ່ງສະຖິຕິ AI ແລະຄົ້ນຫາເບີຫວຍ
              </span>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Dark mode */}
            <button
              onClick={toggleDark}
              aria-label="Toggle dark mode"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-[#737686] dark:text-[#94a3b8] hover:bg-[#f0f4ff] dark:hover:bg-[#1e2d4a] hover:text-[#003fb1] dark:hover:text-amber-400 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>

            {/* Auth section */}
            {user ? (
              <div className="hidden md:block ml-1">
                <UserDropdown user={user} onLogout={logout} />
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-1.5 ml-1 px-4 py-1.5 rounded-xl bg-[#003fb1] hover:bg-[#1a56db] text-white text-[12px] font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="material-symbols-outlined text-[14px]">account_circle</span>
                ເຂົ້າສູ່ລະບົບ
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#f0f4ff] dark:hover:bg-[#1e2d4a] transition-all duration-200"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-[22px] text-[#121c2a] dark:text-white">
                {menuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />

        <div className={`absolute top-[60px] left-0 right-0 bg-white dark:bg-[#0d1829] border-b border-[#e8edf8] dark:border-[#2b3a54] shadow-xl px-4 py-4 transition-all duration-300 ${menuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>

          {/* Nav links */}
          <div className="flex flex-col gap-1 mb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive(link.href)
                    ? 'bg-[#eff3ff] dark:bg-[#1e2d4a] text-[#003fb1] dark:text-[#93b4ff]'
                    : 'text-[#555870] dark:text-[#94a3b8] hover:bg-[#f5f7ff] dark:hover:bg-[#1a2640]'
                  }`}
              >
                <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
                {link.label}
                {isActive(link.href) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#003fb1]" />}
              </Link>
            ))}

            {/* Locked pages hint for guests */}
            {!user && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#f0f4ff] dark:bg-[#1e2d4a] border border-[#003fb1]/10">
                <span className="material-symbols-outlined text-[18px] text-[#003fb1]/40">lock</span>
                <span className="text-xs text-[#737686] dark:text-[#94a3b8]">Login ເພື່ອໃຊ້ສະຖິຕິ, Analytics, ຄົ້ນຫາ</span>
              </div>
            )}

            {/* Logged-in extra links */}
            {user && (
              <>
                <Link
                  to={user.role === 'admin' || user.role === 'staff' ? '/admin/profile' : '/member/profile'}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive('/member/profile') || isActive('/admin/profile')
                      ? 'bg-[#eff3ff] dark:bg-[#1e2d4a] text-[#003fb1] dark:text-[#93b4ff]'
                      : 'text-[#555870] dark:text-[#94a3b8] hover:bg-[#f5f7ff] dark:hover:bg-[#1a2640]'
                    }`}
                >
                  <span className="material-symbols-outlined text-[18px]">account_circle</span>
                  ຂໍ້ມູນສ່ວນຕົວ
                </Link>

                {(user.role === 'admin' || user.role === 'staff') && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive('/admin')
                        ? 'bg-[#edfdf5] dark:bg-[#0a2e20] text-[#006c49]'
                        : 'text-[#555870] dark:text-[#94a3b8] hover:bg-[#edfdf5] dark:hover:bg-[#0a2e20] hover:text-[#006c49]'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                    ຈັດການລະບົບ (Admin)
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Auth */}
          <div className="border-t border-[#e8edf8] dark:border-[#2b3a54] pt-4">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#003fb1] to-[#1a56db] flex items-center justify-center">
                    <span className="text-white text-xs font-black">
                      {((user.name || user.username || 'U')[0]).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#121c2a] dark:text-white">{user.name || user.username}</p>
                    <p className="text-[11px] text-[#737686] dark:text-[#94a3b8] capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); setMenuOpen(false) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[#ba1a1a] text-xs font-bold bg-[#fff4f4] dark:bg-[#2a1010] border border-[#ffdad6] dark:border-[#5c1515]"
                >
                  <span className="material-symbols-outlined text-[14px]">logout</span>
                  ອອກ
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#003fb1] hover:bg-[#1a56db] text-white text-sm font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">account_circle</span>
                ເຂົ້າສູ່ລະບົບ
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
