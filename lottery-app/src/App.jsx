import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { useVisitorTrack } from './hooks/useVisitorTrack'

// ── Pages ────────────────────────────────────────────────────────
const HomePage        = lazy(() => import('./pages/HomePage'))
const HistoryPage     = lazy(() => import('./pages/HistoryPage'))
const LoginPage       = lazy(() => import('./pages/LoginPage'))
const DashboardPage   = lazy(() => import('./pages/DashboardPage'))
const SearchPage      = lazy(() => import('./pages/SearchPage'))
const AnalyticsPage   = lazy(() => import('./pages/AnalyticsPage'))
const MemberProfilePage = lazy(() => import('./pages/MemberProfilePage'))

// ── Auth / Registration pages ─────────────────────────────────────
const RegisterPage      = lazy(() => import('./features/auth/pages/RegisterPage'))
const VerifyOTPPage     = lazy(() => import('./features/auth/pages/VerifyOTPPage'))
const ForgotPasswordPage = lazy(() => import('./features/auth/pages/ForgotPasswordPage'))
const ResetPasswordPage  = lazy(() => import('./features/auth/pages/ResetPasswordPage'))
const VerifyEmailPage    = lazy(() => import('./features/auth/pages/VerifyEmailPage'))

// ── Admin pages ───────────────────────────────────────────────────
const AdminPanel          = lazy(() => import('./pages/AdminPanel'))
const AdminOverview       = lazy(() => import('./pages/AdminOverview'))
const AnimalImageManager  = lazy(() => import('./components/AnimalImageManager'))
const AdminUsers          = lazy(() => import('./pages/AdminUsers'))
const AdminLive           = lazy(() => import('./pages/AdminLive'))
const UserLogsPage        = lazy(() => import('./pages/UserLogsPage'))
const ProfilePage         = lazy(() => import('./pages/ProfilePage'))
const AdminLotteryTypes   = lazy(() => import('./pages/AdminLotteryTypes'))

// ── Error pages ───────────────────────────────────────────────────
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'))
const NotFoundPage     = lazy(() => import('./pages/NotFoundPage'))

// ── Route guards ──────────────────────────────────────────────────
// AuthRoute  — requires ANY login (member/staff/admin)
// ProtectedRoute — requires specific roles
const AuthRoute      = lazy(() => import('./components/AuthRoute'))
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'))
const AdminLayout    = lazy(() => import('./components/AdminLayout'))

// ── Loading spinner ───────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#003fb1]/20 border-t-[#003fb1] animate-spin" />
        <p className="text-sm text-[#737686] font-medium">ກຳລັງໂຫຼດ...</p>
      </div>
    </div>
  )
}

// ── Public layout (Navbar + Footer) ───────────────────────────────
function PublicLayout() {
  useVisitorTrack();
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-12">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router basename="/">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--toast-bg, #fff)',
            color: 'var(--toast-color, #121c2a)',
            borderRadius: '12px',
            border: '1px solid #dee9fd',
            padding: '12px 16px',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 4px 20px rgba(0,63,177,0.12)',
          },
          success: { iconTheme: { primary: '#006c49', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ba1a1a', secondary: '#fff' } },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* ══ TIER 1: Open to everyone ════════════════════════════
              Guest users can ONLY access these pages.              */}
          <Route element={<PublicLayout />}>
            <Route path="/"        element={<HomePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/login"   element={<LoginPage />} />
          </Route>

          {/* ══ TIER 1b: Auth / Registration (full-screen, no Navbar) */}
          <Route path="/register"         element={<RegisterPage />} />
          <Route path="/verify-otp"       element={<VerifyOTPPage />} />
          <Route path="/verify-email"     element={<VerifyEmailPage />} />
          <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
          <Route path="/reset-password"   element={<ResetPasswordPage />} />

          {/* ══ TIER 2: Requires login (member / staff / admin) ═════
              Guests hitting these routes → /login?from=<path>      */}
          <Route element={<AuthRoute />}>
            <Route element={<PublicLayout />}>
              <Route path="/statistics"    element={<DashboardPage />} />
              <Route path="/analytics"     element={<AnalyticsPage />} />
              <Route path="/search"        element={<SearchPage />} />
              <Route path="/member/profile" element={<MemberProfilePage />} />
            </Route>
          </Route>

          {/* ══ TIER 3: Staff / Admin backoffice ═════════════════════
              Members hitting these routes → /unauthorized           */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin"         element={<AdminOverview />} />
              <Route path="/admin/live"    element={<AdminLive />} />
              <Route path="/admin/draws"   element={<AdminPanel />} />
              <Route path="/admin/types"   element={<AdminLotteryTypes />} />
              <Route path="/admin/animals" element={<AnimalImageManager />} />
              <Route path="/admin/users"   element={<AdminUsers />} />
              <Route path="/admin/profile" element={<ProfilePage />} />

              {/* Admin-only */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} redirectTo="/unauthorized" />}>
                <Route path="/admin/logs" element={<UserLogsPage />} />
              </Route>
            </Route>
          </Route>

          {/* ══ Error pages ═══════════════════════════════════════ */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/404"          element={<NotFoundPage />} />
          <Route path="*"             element={<Navigate to="/404" replace />} />

        </Routes>
      </Suspense>
    </Router>
  )
}
