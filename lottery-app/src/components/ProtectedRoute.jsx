import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles, redirectTo }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f3f6fc] dark:bg-[#0d1627]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#003fb1]/20 border-t-[#003fb1] animate-spin" />
          <p className="text-sm text-[#737686] font-medium">ກຳລັງກວດສອບສິດ...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo || '/unauthorized'} replace />;
  }

  return <Outlet />;
}
