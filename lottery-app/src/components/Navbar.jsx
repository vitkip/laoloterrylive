import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home, Clock, BarChart2, TrendingUp, Search,
  Moon, Sun, Menu, User, Shield, LogOut, Lock,
  ChevronDown, Star,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// ── Nav links by auth tier ─────────────────────────────────────────

const GUEST_LINKS = [
  { label: 'ຜົນຫວຍລ່າສຸດ', href: '/', Icon: Home },
  { label: 'ປະຫວັດຍ້ອນຫຼັງ', href: '/history', Icon: Clock },
  { label: 'ສະຖິຕິ', href: '/statistics', Icon: BarChart2 },
  { label: 'ຄົ້ນຫາ & ແປຝັນ', href: '/search', Icon: Search },
]

const MEMBER_LINKS = [
  { label: 'ຜົນຫວຍລ່າສຸດ', href: '/', Icon: Home },
  { label: 'ປະຫວັດຍ້ອນຫຼັງ', href: '/history', Icon: Clock },
  { label: 'ສະຖິຕິ', href: '/statistics', Icon: BarChart2 },
  { label: 'AI Analytics', href: '/analytics', Icon: TrendingUp },
  { label: 'ຄົ້ນຫາ & ແປຝັນ', href: '/search', Icon: Search },
]

function getNavLinks(user) {
  return user ? MEMBER_LINKS : GUEST_LINKS
}

// ── Role badge ─────────────────────────────────────────────────────

function RolePill({ role }) {
  const styles = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    staff: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    member: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full', styles[role] ?? styles.member)}>
      <span className="w-1 h-1 rounded-full bg-current" />
      {role}
    </span>
  )
}

// ── Main Navbar ────────────────────────────────────────────────────

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const navLinks = getNavLinks(user)
  const isAdmin = user?.role === 'admin' || user?.role === 'staff'

  useEffect(() => { setSheetOpen(false) }, [location.pathname])

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

  const userInitial = ((user?.name || user?.username || 'U')[0]).toUpperCase()
  const profilePath = isAdmin ? '/admin/profile' : '/member/profile'

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-xl shadow-[0_1px_24px_rgba(0,63,177,0.10)] border-b border-border/80'
          : 'bg-background border-b border-border/50'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-[60px]">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#003fb1] to-[#1a56db] flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
            <Star className="text-white w-[18px] h-[18px] fill-white" />
          </div>
          <span className="text-[15px] font-extrabold tracking-tight text-foreground">
            laolots<span className="text-primary">.com</span>
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map(({ href, label, Icon }) => (
            <Link
              key={href}
              to={href}
              className={cn(
                'relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200',
                isActive(href)
                  ? 'bg-secondary text-primary dark:text-[#93b4ff]'
                  : 'text-muted-foreground hover:bg-secondary hover:text-primary dark:hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {isActive(href) && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          ))}

          {!user && (
            <span className="hidden lg:flex items-center gap-1.5 ml-1 text-[11px] text-primary/50 bg-secondary px-2.5 py-1.5 rounded-xl border border-primary/10">
              <Lock className="w-3 h-3" />
              ເຂົ້າສູ່ລະບົບ ເພື່ອໃຊ້ AI Analytics
            </span>
          )}
        </nav>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-1">

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className="text-muted-foreground hover:text-primary dark:hover:text-amber-400"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Auth section — desktop */}
          {user ? (
            <div className="hidden md:block ml-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 px-3 py-1.5 h-auto rounded-xl border-border hover:border-primary/30"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#003fb1] to-[#1a56db] flex items-center justify-center shrink-0">
                      <span className="text-white text-[11px] font-black">{userInitial}</span>
                    </div>
                    <span className="text-[12px] font-bold max-w-[80px] truncate">
                      {user.name || user.username}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="flex flex-col gap-1.5 pb-2">
                    <span className="text-[12px] font-black truncate">{user.name || user.username}</span>
                    <RolePill role={user.role} />
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => navigate(profilePath)}>
                    <User className="text-primary" />
                    ຂໍ້ມູນສ່ວນຕົວ
                  </DropdownMenuItem>

                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Shield className="text-[#006c49]" />
                      ຈັດການລະບົບ
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut />
                    ອອກຈາກລະບົບ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button
              asChild
              size="sm"
              className="hidden md:flex ml-1 gap-1.5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <Link to="/login">
                <User className="w-3.5 h-3.5" />
                ເຂົ້າສູ່ລະບົບ
              </Link>
            </Button>
          )}

          {/* Mobile hamburger — Sheet */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-xl"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
              {/* Sheet header */}
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#003fb1] to-[#1a56db] flex items-center justify-center">
                  <Star className="text-white w-4 h-4 fill-white" />
                </div>
                <span className="text-[15px] font-extrabold text-foreground">
                  laolots<span className="text-primary">.com</span>
                </span>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
                {navLinks.map(({ href, label, Icon }) => (
                  <Link
                    key={href}
                    to={href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                      isActive(href)
                        ? 'bg-secondary text-primary dark:text-[#93b4ff]'
                        : 'text-muted-foreground hover:bg-secondary hover:text-primary dark:hover:text-foreground'
                    )}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    {label}
                    {isActive(href) && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                ))}

                {!user && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary border border-primary/10 mt-1">
                    <Lock className="w-[18px] h-[18px] text-primary/40" />
                    <span className="text-xs text-muted-foreground">Login ເພື່ອໃຊ້ AI Analytics</span>
                  </div>
                )}

                {user && (
                  <>
                    <Separator className="my-2" />
                    <Link
                      to={profilePath}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                        isActive(profilePath)
                          ? 'bg-secondary text-primary'
                          : 'text-muted-foreground hover:bg-secondary hover:text-primary'
                      )}
                    >
                      <User className="w-[18px] h-[18px]" />
                      ຂໍ້ມູນສ່ວນຕົວ
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                          isActive('/admin')
                            ? 'bg-[#edfdf5] dark:bg-[#0a2e20] text-[#006c49]'
                            : 'text-muted-foreground hover:bg-[#edfdf5] dark:hover:bg-[#0a2e20] hover:text-[#006c49]'
                        )}
                      >
                        <Shield className="w-[18px] h-[18px]" />
                        ຈັດການລະບົບ (Admin)
                      </Link>
                    )}
                  </>
                )}
              </nav>

              {/* Sheet footer — auth */}
              <div className="border-t border-border px-4 py-4">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#003fb1] to-[#1a56db] flex items-center justify-center">
                        <span className="text-white text-xs font-black">{userInitial}</span>
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-foreground">{user.name || user.username}</p>
                        <p className="text-[11px] text-muted-foreground capitalize">{user.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { logout(); setSheetOpen(false) }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-destructive text-xs font-bold bg-destructive/10 border border-destructive/20"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      ອອກ
                    </button>
                  </div>
                ) : (
                  <Button asChild className="w-full gap-2 rounded-xl">
                    <Link to="/login">
                      <User className="w-[18px] h-[18px]" />
                      ເຂົ້າສູ່ລະບົບ
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
