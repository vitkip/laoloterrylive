import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-2xl shadow-sm border border-[#dee9fd]">
      <div className="flex flex-col items-center mb-8">
        <span className="material-symbols-outlined text-[#003fb1] text-5xl mb-4">lock_person</span>
        <h2 className="text-2xl font-bold text-[#121c2a]">ເຂົ້າສູ່ລະບົບແອດມິນ</h2>
        <p className="text-sm text-[#737686] mt-2 text-center">
          ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານເພື່ອຈັດການລະບົບ
        </p>
      </div>

      {error && (
        <div className="bg-[#ffdad6]/30 text-[#ba1a1a] p-3 rounded-lg text-sm font-bold mb-6 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-[#434654] mb-2">ຊື່ຜູ້ໃຊ້ (Username)</label>
          <input
            type="text"
            className="w-full bg-[#eff3ff] border-none rounded-lg p-3 text-[#121c2a] focus:ring-2 focus:ring-[#003fb1]"
            placeholder="admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-[#434654] mb-2">ລະຫັດຜ່ານ (Password)</label>
          <input
            type="password"
            className="w-full bg-[#eff3ff] border-none rounded-lg p-3 text-[#121c2a] focus:ring-2 focus:ring-[#003fb1]"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#003fb1] text-white py-3.5 rounded-xl font-bold hover:bg-[#1a56db] transition-colors mt-4 disabled:opacity-50"
        >
          {loading ? 'ກຳລັງເຂົ້າລະບົບ...' : 'ເຂົ້າສູ່ລະບົບ'}
        </button>
      </form>
    </div>
  );
}
