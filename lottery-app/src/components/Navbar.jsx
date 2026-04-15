import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { label: 'ຜົນຫວຍລ່າສຸດ', href: '/' },
  { label: 'ສະຖິຕິ', href: '/statistics' },
  { label: 'ຄົ້ນຫາ & ແປຝັນ', href: '/search' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <header className="bg-white sticky top-0 w-full z-50 border-b border-blue-50 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-[#003fb1] tracking-tighter shrink-0 flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl">diamond</span>
          ຄັງຂໍ້ມູນຫວຍ
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 text-sm tracking-tight">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.label}
                to={link.href}
                className={
                  isActive
                    ? 'text-[#003fb1] font-bold border-b-2 border-[#003fb1] pb-1'
                    : 'text-[#737686] font-medium hover:text-[#003fb1] transition-colors pb-1'
                }
              >
                {link.label}
              </Link>
            )
          })}
          {user && (
            <Link
              to="/admin"
              className={
                location.pathname === '/admin'
                  ? 'text-[#006c49] font-bold border-b-2 border-[#006c49] pb-1 flex items-center gap-1'
                  : 'text-[#737686] font-medium hover:text-[#006c49] transition-colors pb-1 flex items-center gap-1'
              }
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              ຈັດການຂໍ້ມູນ (Admin)
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Auth Button */}
          {user ? (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#dee9fd] text-[#ba1a1a] font-bold text-xs hover:bg-[#ffdad6]/20 transition-colors"
            >
              ອອກຈາກລະບົບ
            </button>
          ) : (
            <Link
              to="/login"
              className="hover:bg-slate-50 p-2 rounded-full transition-colors flex items-center text-[#737686] hover:text-[#003fb1]"
            >
              <span className="material-symbols-outlined text-[24px]">account_circle</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-slate-50 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[#121c2a]">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-blue-50 bg-white px-4 py-4 flex flex-col gap-4 shadow-lg absolute w-full">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.label}
                to={link.href}
                className={
                  isActive
                    ? 'text-[#003fb1] font-bold text-sm bg-[#eff3ff] p-3 rounded-lg'
                    : 'text-[#737686] text-sm font-medium p-3 hover:bg-slate-50 rounded-lg transition-colors'
                }
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            )
          })}
          {user && (
            <Link
              to="/admin"
              className="text-[#006c49] font-bold text-sm bg-[#6cf8bb]/10 p-3 rounded-lg flex items-center gap-2"
              onClick={() => setMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              ຈັດການຂໍ້ມູນ (Admin)
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
