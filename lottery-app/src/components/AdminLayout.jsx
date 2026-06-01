import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API } from '../utils/api';
import UserAvatar from './UserAvatar';
import RoleBadge from './RoleBadge';

// ── Nav items by role ──────────────────────────────────────────────

function getNavItems(role) {
  const base = [
    { path: '/admin',        icon: 'dashboard',        label: 'ພາບລວມລະບົບ' },
    { path: '/admin/live',   icon: 'podcasts',          label: 'ຖ່າຍທອດສົດ' },
    { path: '/admin/draws',  icon: 'add_circle',        label: 'ປ້ອນຜົນຫວຍ' },
    { path: '/admin/types',  icon: 'category',          label: 'ປະເພດຫວຍ' },
  ];
  const adminOnly = [
    { path: '/admin/animals',  icon: 'image',            label: 'ຮູບນາມສັດ' },
    { path: '/admin/users',    icon: 'manage_accounts',  label: 'ຈັດການຜູ້ໃຊ້' },
    { path: '/admin/banners',  icon: 'view_carousel',    label: 'Banner ເລື່ອນ' },
    { path: '/admin/logs',     icon: 'history',          label: 'Audit Logs' },
  ];
  const staffOnly = [
    { path: '/admin/animals',  icon: 'image',            label: 'ຮູບນາມສັດ' },
    { path: '/admin/users',    icon: 'manage_accounts',  label: 'ຈັດການຜູ້ໃຊ້' },
  ];
  if (role === 'admin') return [...base, ...adminOnly];
  if (role === 'staff') return [...base, ...staffOnly];
  return base;
}

// ── Sidebar Nav Item ───────────────────────────────────────────────

function NavItem({ item, isActive, collapsed, onClick }) {
  return (
    <Link
      to={item.path}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all duration-150 group relative ${
        isActive
          ? 'bg-white/15 text-white shadow-md shadow-black/20'
          : 'text-white/60 hover:bg-white/10 hover:text-white'
      }`}
    >
      <span className="material-symbols-outlined text-[20px] shrink-0" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
        {item.icon}
      </span>
      {!collapsed && <span className="text-sm truncate">{item.label}</span>}
      {collapsed && (
        <div className="absolute left-full ml-3 hidden group-hover:flex items-center z-50">
          <div className="bg-[#0f1f15] text-white text-xs font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
            {item.label}
          </div>
        </div>
      )}
    </Link>
  );
}

// ── User Dropdown ──────────────────────────────────────────────────

function UserDropdown({ user, onLogout, collapsed }) {
  const [open, setOpen]   = useState(false);
  const ref               = useRef(null);
  const navigate          = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2.5 w-full p-2 rounded-xl hover:bg-white/10 transition-colors"
      >
        <UserAvatar name={user?.name} username={user?.username} size="sm" />
        {!collapsed && (
          <div className="flex-1 text-left overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user?.name || user?.username}</p>
            <p className="text-[10px] text-white/50 capitalize">{user?.role}</p>
          </div>
        )}
        {!collapsed && (
          <span className="material-symbols-outlined text-[16px] text-white/40 shrink-0 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
            expand_more
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute ${collapsed ? 'left-full ml-3 bottom-0' : 'bottom-full mb-2 left-0 right-0'} bg-card rounded-2xl shadow-xl border border-border z-50 overflow-hidden min-w-[180px]`}>
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <UserAvatar name={user?.name} username={user?.username} size="sm" />
              <div>
                <p className="text-sm font-bold text-foreground">{user?.name || user?.username}</p>
                <RoleBadge role={user?.role} size="xs" />
              </div>
            </div>
          </div>
          {[
            { icon: 'account_circle', label: 'Profile ຂອງຂ້ອຍ', action: () => { navigate('/admin/profile'); setOpen(false); } },
            { icon: 'key', label: 'ປ່ຽນ Password', action: () => { navigate('/admin/users'); setOpen(false); } },
          ].map(item => (
            <button key={item.label} onClick={item.action}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">
              <span className="material-symbols-outlined text-[16px] text-[#2d6a4f]">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <div className="border-t border-border">
            <button onClick={() => { onLogout(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <span className="material-symbols-outlined text-[16px]">logout</span>
              ອອກຈາກລະບົບ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Breadcrumb ─────────────────────────────────────────────────────

function Breadcrumb({ location }) {
  const LABELS = {
    '/admin':          'Dashboard',
    '/admin/live':     'ຖ່າຍທອດສົດ',
    '/admin/draws':    'ປ້ອນຜົນຫວຍ',
    '/admin/types':    'ປະເພດຫວຍ',
    '/admin/animals':  'ຮູບນາມສັດ',
    '/admin/users':    'ຈັດການຜູ້ໃຊ້',
    '/admin/logs':     'Audit Logs',
    '/admin/profile':  'Profile ຂອງຂ້ອຍ',
  };
  const label = LABELS[location.pathname] || location.pathname.split('/').pop();
  return (
    <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="material-symbols-outlined text-[14px]">home</span>
      <span>/</span>
      <span className="font-bold text-foreground">{label}</span>
    </div>
  );
}

// ── Main Layout ────────────────────────────────────────────────────

export default function AdminLayout() {
  const { user, logout, authFetch } = useAuth();
  const location                     = useLocation();
  const [collapsed, setCollapsed]    = useState(false);
  const [mobileOpen, setMobileOpen]  = useState(false);

  const navItems = getNavItems(user?.role);

  const handleLogout = async () => {
    try {
      await authFetch(`${API}/auth.php?action=logout`, { method: 'POST' });
    } catch (_) { /* ignore */ }
    logout();
  };

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

      {/* ── Desktop Sidebar ─────────────────────────── */}
      <aside className={`hidden md:flex flex-col bg-[#1b3a2d] border-r border-[#2d6a4f]/30 transition-all duration-300 ease-in-out shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}>
        {/* Logo */}
        <div className={`flex border-b border-[#2d6a4f]/30 shrink-0 ${
          collapsed
            ? 'flex-col items-center justify-center gap-1.5 py-2 h-[72px]'
            : 'flex-row items-center px-4 gap-2 h-16'
        }`}>
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-md ring-1 ring-white/20 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <rect x="0" y="0" width="36" height="9" fill="#CE1126"/>
                  <rect x="0" y="9" width="36" height="18" fill="#002868"/>
                  <rect x="0" y="27" width="36" height="9" fill="#CE1126"/>
                  <circle cx="18" cy="18" r="6" fill="white"/>
                </svg>
              </div>
              <div className="flex flex-col leading-none min-w-0">
                <span className="text-[14px] font-extrabold tracking-tight text-white truncate">laolots<span className="text-[#5daf82]">.com</span></span>
                <span className="text-[8.5px] font-medium text-white/50 tracking-widest uppercase">ຫວຍພັດທະນາລາວ</span>
              </div>
            </Link>
          )}
          {/* Logo icon — collapsed state */}
          {collapsed && (
            <Link to="/" title="laolots.com">
              <div className="w-7 h-7 rounded-lg overflow-hidden shadow-md ring-1 ring-white/20">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <rect x="0" y="0" width="36" height="9" fill="#CE1126"/>
                  <rect x="0" y="9" width="36" height="18" fill="#002868"/>
                  <rect x="0" y="27" width="36" height="9" fill="#CE1126"/>
                  <circle cx="18" cy="18" r="6" fill="white"/>
                </svg>
              </div>
            </Link>
          )}
          {/* Collapse toggle button */}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors shrink-0"
            title={collapsed ? 'ຂະຫຍາຍ sidebar' : 'ຫຍໍ້ sidebar'}
          >
            <span className="material-symbols-outlined text-[18px]">{collapsed ? 'menu_open' : 'menu'}</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 flex flex-col gap-1 overflow-y-auto">
          {!collapsed && (
            <p className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest px-3 py-2">ເມນູຫຼັກ</p>
          )}
          {navItems.map(item => (
            <NavItem
              key={item.path}
              item={item}
              isActive={location.pathname === item.path}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-[#2d6a4f]/30">
          <UserDropdown user={user} onLogout={handleLogout} collapsed={collapsed} />
        </div>
      </aside>

      {/* ── Mobile Overlay ──────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#1b3a2d] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 h-16 border-b border-[#2d6a4f]/30">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl overflow-hidden shadow-md ring-1 ring-white/20 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <rect x="0" y="0" width="36" height="9" fill="#CE1126"/>
                    <rect x="0" y="9" width="36" height="18" fill="#002868"/>
                    <rect x="0" y="27" width="36" height="9" fill="#CE1126"/>
                    <circle cx="18" cy="18" r="6" fill="white"/>
                  </svg>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[14px] font-extrabold tracking-tight text-white">laolots<span className="text-[#5daf82]">.com</span></span>
                  <span className="text-[8.5px] font-medium text-white/50 tracking-widest uppercase">ທຸກຊາດລາວ</span>
                </div>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:bg-white/10">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
              {navItems.map(item => (
                <NavItem key={item.path} item={item} isActive={location.pathname === item.path} collapsed={false} onClick={() => setMobileOpen(false)} />
              ))}
            </nav>
            <div className="p-3 border-t border-[#2d6a4f]/30">
              <UserDropdown user={user} onLogout={handleLogout} collapsed={false} />
            </div>
          </aside>
        </div>
      )}

      {/* ── Main Content ─────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-card border-b border-border flex items-center px-4 gap-3 shrink-0 z-30">
          {/* Mobile menu btn */}
          <button onClick={() => setMobileOpen(true)}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors">
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>

          <Breadcrumb location={location} />

          <div className="flex-1" />

          {/* Quick actions */}
          <div className="flex items-center gap-1">
            <Link to="/" target="_blank"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-[#1b3a2d] transition-colors"
              title="ເບິ່ງໜ້າເວັບ">
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            </Link>
            <Link to="/admin/profile"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-[#1b3a2d] transition-colors"
              title="Profile ຂອງຂ້ອຍ">
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
            </Link>
          </div>

          {/* Mobile user avatar */}
          <div className="md:hidden">
            <UserAvatar name={user?.name} username={user?.username} size="sm" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
