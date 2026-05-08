import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { useVisitorTrack } from './hooks/useVisitorTrack'

// ── Lazy-loaded pages (code splitting) ──────────────────────────────
// Each page is in its own chunk, only loaded when the route is visited.
// This reduces initial bundle by ~60% (AnalyticsPage alone is 53KB).
const HomePage = lazy(() => import('./pages/HomePage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))

// Admin pages — only loaded for authenticated users
const AdminPanel = lazy(() => import('./pages/AdminPanel'))
const AdminOverview = lazy(() => import('./pages/AdminOverview'))
const AnimalImageManager = lazy(() => import('./components/AnimalImageManager'))
const AdminUsers = lazy(() => import('./pages/AdminUsers'))
const AdminLive = lazy(() => import('./pages/AdminLive'))
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'))
const AdminLayout = lazy(() => import('./components/AdminLayout'))

// ── Loading fallback ────────────────────────────────────────────────
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

function PublicLayout() {
  useVisitorTrack();
  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff] dark:bg-[#0d1627] text-[#121c2a] dark:text-white">
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
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes with Navbar/Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/statistics" element={<DashboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Secure Backoffice Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminOverview />} />
              <Route path="/admin/live" element={<AdminLive />} />
              <Route path="/admin/draws" element={<AdminPanel />} />
              <Route path="/admin/animals" element={<AnimalImageManager />} />
              <Route path="/admin/users" element={<AdminUsers />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  )
}
