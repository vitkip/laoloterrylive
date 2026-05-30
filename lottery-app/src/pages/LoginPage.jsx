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
    <div className="min-h-[70vh] flex items-center justify-center px-4 relative">
      {/* Page ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_60%)]" />
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 border border-border/60 ring-1 ring-white/[0.05] overflow-hidden">
          {/* Header strip */}
          <div className="relative overflow-hidden px-8 py-8 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#09090b] via-[#0e0e16] to-[#0d0d13]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.25),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(56,189,248,0.12),transparent_60%)]" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.07] backdrop-blur-xl flex items-center justify-center mx-auto mb-4 border border-white/[0.15] shadow-lg shadow-violet-500/10">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock_person</span>
              </div>
              <h1 className="text-2xl font-black text-white">ເຂົ້ສູ່ລະບົບ</h1>
              <p className="text-white/50 text-sm mt-1">Lao Lottery Live System</p>
            </div>
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-muted-foreground/60">person</span>
                  <input
                    type="text"
                    autoComplete="username"
                    placeholder="ປ້ອນ username"
                    required
                    className="w-full bg-muted/40 backdrop-blur-sm border border-border/60 rounded-xl pl-9 pr-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-muted-foreground/60">lock</span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                    className="w-full bg-muted/40 backdrop-blur-sm border border-border/60 rounded-xl pl-9 pr-10 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 shadow-md shadow-primary/20 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2 mt-2"
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
                <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
                  ລືມລະຫັດຜ່ານ?
                </Link>
              </div>
            </form>

            {/* Register CTA */}
            <div className="mt-5 pt-5 border-t border-border/60 text-center">
              <p className="text-xs text-muted-foreground mb-3">ຍັງບໍ່ມີບັນຊີ?</p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 w-full justify-center border border-primary/40 text-primary py-3 rounded-xl font-bold text-sm bg-primary/[0.06] hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                ສ້າງບັນຊີໃໝ່ ຟຣີ
              </Link>
            </div>

            {/* Back to home */}
            <div className="mt-4 text-center">
              <Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
                ← ກັບໄປໜ້າຫຼັກ
              </Link>
            </div>
          </div>
        </div>

      
      </div>
    </div>
  );
}
