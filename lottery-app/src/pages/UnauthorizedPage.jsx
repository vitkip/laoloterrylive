import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f6fc] dark:bg-[#0d1627] p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-3xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="material-symbols-outlined text-5xl text-red-600 dark:text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
        </div>
        <h1 className="text-5xl font-black text-[#121c2a] dark:text-white mb-2">403</h1>
        <h2 className="text-xl font-bold text-[#434654] dark:text-[#c7d2fe] mb-3">ບໍ່ມີສິດເຂົ້າໃຊ້</h2>
        <p className="text-sm text-[#737686] dark:text-[#94a3b8] mb-8">
          ທ່ານບໍ່ມີສິດໃນການເຂົ້າໃຊ້ໜ້ານີ້.
          {user && <span> ທ່ານ login ໃນຖານະ <span className="font-bold text-[#003fb1]">{user.role}</span>.</span>}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#f0f4ff] dark:bg-[#1e2d4a] text-[#434654] dark:text-[#c7d2fe] font-bold rounded-xl hover:bg-[#dee9fd] transition-colors text-sm">
            ← ກັບຄືນ
          </button>
          <button onClick={() => navigate('/admin')}
            className="px-6 py-3 bg-[#003fb1] text-white font-bold rounded-xl hover:bg-[#1a56db] transition-colors text-sm">
            ໜ້າ Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
