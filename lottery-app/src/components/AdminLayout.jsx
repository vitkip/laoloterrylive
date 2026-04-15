import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const NAV_ITEMS = [
    { path: '/admin', icon: 'dashboard', label: 'ພາບລວມລະບົບ' },
    { path: '/admin/live', icon: 'podcasts', label: 'ຈັດການຖ່າຍທອດສົດ' },
    { path: '/admin/draws', icon: 'add_circle', label: 'ປ້ອນຜົນຫວຍ' },
    { path: '/admin/animals', icon: 'image', label: 'ຈັດການຮູບນາມສັດ' },
    { path: '/admin/users', icon: 'manage_accounts', label: 'ຈັດການຜູ້ໃຊ້' },
  ];

  return (
    <div className="flex h-screen bg-[#f3f6fc] text-[#121c2a] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#dee9fd] flex flex-col hidden md:flex">
        <div className="p-6 border-b border-[#dee9fd]">
          <Link to="/" className="text-2xl font-black text-[#003fb1] tracking-tighter flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">diamond</span>
            Admin Panel
          </Link>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          <div className="text-xs font-bold text-[#737686] mb-2 uppercase tracking-widest px-4">ເມນູຫຼັກ</div>
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive 
                    ? 'bg-[#003fb1] text-white shadow-md' 
                    : 'text-[#434654] hover:bg-[#eff3ff] hover:text-[#003fb1]'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[#dee9fd] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#dee9fd] flex items-center justify-center text-[#003fb1] font-bold">
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-sm font-bold text-[#121c2a]">{user?.username || 'Admin'}</p>
              <p className="text-xs text-[#737686] capitalize">{user?.role || 'staff'}</p>
            </div>
          </div>
          <button onClick={logout} className="text-[#ba1a1a] hover:bg-[#ffdad6]/50 p-2 rounded-lg transition-colors" title="ອອກຈາກລະບົບ">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative overflow-y-auto w-full">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-[#dee9fd] p-4 flex items-center justify-between sticky top-0 z-50">
          <Link to="/" className="text-xl font-black text-[#003fb1] tracking-tighter flex items-center gap-2">
            <span className="material-symbols-outlined">diamond</span>
            Admin
          </Link>
          <button onClick={logout} className="text-[#ba1a1a] text-sm font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            ອອກຈາກລະບົບ
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-8 w-full max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
