import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

function getDefaultRedirect(role) {
  if (role === 'admin' || role === 'staff') return '/admin';
  return '/';
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { login, user, loading: authLoading } = useAuth();
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const fromPath        = searchParams.get('from');

  // If already logged in, redirect away immediately
  useEffect(() => {
    if (!authLoading && user) {
      navigate(fromPath || getDefaultRedirect(user.role), { replace: true });
    }
  }, [user, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    if (result.success) {
      // Redirect: honour ?from param, else default by role
      const dest = fromPath || getDefaultRedirect(result.role ?? 'member');
      navigate(dest, { replace: true });
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  if (authLoading) return null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden">
          {/* Header strip */}
          <div className="bg-gradient-to-r from-[#001d6e] to-[#1a56db] px-8 py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border border-white/20">
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock_person</span>
            </div>
            <h1 className="text-2xl font-black text-white">ເຂົ້າສູ່ລະບົບ</h1>
            <p className="text-white/60 text-sm mt-1">Lao Lottery Live System</p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            {/* Hint when redirected from protected page */}
            {fromPath && !error && (
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl px-3 py-2.5 mb-5">
                <span className="material-symbols-outlined text-amber-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">ກະລຸນາ login ກ່ອນເຂົ້າໃຊ້ໜ້ານີ້</p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl px-3 py-2.5 mb-5">
                <span className="material-symbols-outlined text-red-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                <p className="text-xs font-bold text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  ຊື່ຜູ້ໃຊ້ (Username)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#737686]">person</span>
                  <input
                    type="text"
                    autoComplete="username"
                    placeholder="ປ້ອນ username"
                    required
                    className="w-full bg-accent rounded-xl pl-9 pr-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 transition-all"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  ລະຫັດຜ່ານ (Password)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#737686]">lock</span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                    className="w-full bg-accent rounded-xl pl-9 pr-10 py-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 transition-all"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#003fb1] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#003fb1] to-[#1a56db] text-white py-3.5 rounded-xl font-bold text-sm hover:opacity-95 hover:-translate-y-0.5 transition-all duration-200 shadow-md shadow-[#003fb1]/20 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ກຳລັງເຂົ້າລະບົບ...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">login</span>
                    ເຂົ້າສູ່ລະບົບ
                  </>
                )}
              </button>

              {/* Forgot password */}
              <div className="text-right -mt-1">
                <Link to="/forgot-password" className="text-xs text-[#737686] hover:text-[#003fb1] transition-colors font-medium">
                  ລືມລະຫັດຜ່ານ?
                </Link>
              </div>
            </form>

            {/* Register CTA */}
            <div className="mt-5 pt-5 border-t border-border text-center">
              <p className="text-xs text-[#737686] mb-3">ຍັງບໍ່ມີບັນຊີ?</p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 w-full justify-center border-2 border-[#003fb1] text-primary dark:border-[#b5c4ff]/50 py-3 rounded-xl font-bold text-sm hover:bg-[#003fb1] hover:text-white dark:hover:bg-[#b5c4ff]/10 transition-all duration-200"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                ສ້າງບັນຊີໃໝ່ ຟຣີ
              </Link>
            </div>

            {/* Back to home */}
            <div className="mt-4 text-center">
              <Link to="/" className="text-xs text-[#737686] hover:text-[#003fb1] transition-colors font-medium">
                ← ກັບໄປໜ້າຫຼັກ
              </Link>
            </div>
          </div>
        </div>

      
      </div>
    </div>
  );
}
