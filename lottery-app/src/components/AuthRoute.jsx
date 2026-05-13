import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Requires any authenticated user (any role).
 * Guests are redirected to /login?from=<current-path>
 * so LoginPage can bounce them back after login.
 */
export default function AuthRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 rounded-full border-2 border-[#003fb1]/20 border-t-[#003fb1] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <Outlet />;
}
