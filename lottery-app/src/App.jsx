import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import SearchPage from './pages/SearchPage'
import HistoryPage from './pages/HistoryPage'
import AdminPanel from './pages/AdminPanel'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import AdminOverview from './pages/AdminOverview'
import AnimalImageManager from './components/AnimalImageManager'
import AdminUsers from './pages/AdminUsers'
import AdminLive from './pages/AdminLive'
import AnalyticsPage from './pages/AnalyticsPage'
import { useVisitorTrack } from './hooks/useVisitorTrack'

function PublicLayout() {
  useVisitorTrack();
  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9ff] dark:bg-[#0d1627] text-[#121c2a] dark:text-white">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
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
    </Router>
  )
}

