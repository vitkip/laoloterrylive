import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API } from '../utils/api';

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPassOpen, setIsPassOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    user_id: '',
    username: '',
    password: '',
    full_name: '',
    role: 'staff',
    is_active: 1
  });

  const [passData, setPassData] = useState({
    target_user_id: '',
    current_password: '',
    new_password: ''
  });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('lao_lottery_token');
      const res = await fetch(`${API}/index.php?action=list_users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setMessage('');
    const token = localStorage.getItem('lao_lottery_token');
    const action = editingUser ? 'update_user' : 'create_user';
    
    try {
      const res = await fetch(`${API}/index.php?action=${action}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('ບັນທຶກສຳເລັດແລ້ວ');
        setIsFormOpen(false);
        fetchUsers();
      } else {
        setMessage(data.error || 'ເກີດຂໍ້ຜິດພາດ');
      }
    } catch (err) {
      setMessage('ເຊື່ອມຕໍ່ລະບົບບໍ່ໄດ້');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຜູ້ໃຊ້ນີ້?')) return;
    const token = localStorage.getItem('lao_lottery_token');
    try {
      const res = await fetch(`${API}/index.php?action=delete_user`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ user_id: id })
      });
      if (res.ok) fetchUsers();
      else alert('ເກີດຂໍ້ຜິດພາດ, ບໍ່ສາມາດລຶບຕົນເອງໄດ້');
    } catch (err) {
      alert('Error connecting to server');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    const token = localStorage.getItem('lao_lottery_token');
    
    try {
      const res = await fetch(`${API}/index.php?action=change_password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(passData)
      });
      const data = await res.json();
      if (res.ok) {
        alert('ປ່ຽນລະຫັດຜ່ານສຳເລັດແລ້ວ');
        setIsPassOpen(false);
      } else {
        alert(data.error || 'ເກີດຂໍ້ຜິດພາດ');
      }
    } catch (err) {
      alert('ເຊື່ອມຕໍ່ລະບົບບໍ່ໄດ້');
    }
  };

  // If simple staff, just show change password view
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-[#152033] p-8 rounded-2xl shadow-sm border border-[#dee9fd] dark:border-[#2b3a54]">
        <h2 className="text-2xl font-bold text-[#121c2a] dark:text-white mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#003fb1]">key</span>
          ປ່ຽນລະຫັດຜ່ານຂອງທ່ານ
        </h2>
        <form onSubmit={(e) => {
          setPassData(prev => ({...prev, target_user_id: user.id}));
          handleChangePassword(e);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#434654] dark:text-[#c7d2fe] mb-2">ລະຫັດຜ່ານເກົ່າ</label>
            <input type="password" required
              className="w-full bg-[#eff3ff] dark:bg-[#1e2d4a] border-none rounded-lg p-3"
              onChange={e => setPassData({...passData, current_password: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#434654] dark:text-[#c7d2fe] mb-2">ລະຫັດຜ່ານໃໝ່</label>
            <input type="password" required
              className="w-full bg-[#eff3ff] dark:bg-[#1e2d4a] border-none rounded-lg p-3"
              onChange={e => setPassData({...passData, new_password: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full bg-[#003fb1] text-white py-3 rounded-xl font-bold hover:bg-[#1a56db]">
            ບັນທຶກລະຫັດຜ່ານໃໝ່
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-[#152033] p-6 rounded-2xl shadow-sm border border-[#dee9fd] dark:border-[#2b3a54]">
        <div>
          <h1 className="text-2xl font-black text-[#121c2a] dark:text-white mb-1">ຈັດການຜູ້ໃຊ້ (Users)</h1>
          <p className="text-sm text-[#737686] dark:text-[#94a3b8]">ຈັດການສິດທິ, ພະນັກງານ ແລະ ລະຫັດຜ່ານ</p>
        </div>
        <button 
          onClick={() => {
            setEditingUser(null);
            setFormData({ username: '', password: '', full_name: '', role: 'staff', is_active: 1 });
            setIsFormOpen(true);
          }}
          className="bg-[#003fb1] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1a56db] flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          ເພີ່ມຜູ້ໃຊ້ໃໝ່
        </button>
      </div>

      {message && <div className="p-4 bg-blue-50 text-blue-800 rounded-xl font-bold text-sm">{message}</div>}

      <div className="bg-white dark:bg-[#152033] rounded-2xl shadow-sm border border-[#dee9fd] dark:border-[#2b3a54] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#eff3ff] dark:bg-[#1e2d4a] text-[#434654] dark:text-[#c7d2fe] text-[11px] uppercase tracking-widest font-bold">
            <tr>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">ຊື່ເຕັມ (Name)</th>
              <th className="px-6 py-4">ຕຳແໜ່ງ (Role)</th>
              <th className="px-6 py-4">ສະຖານະ</th>
              <th className="px-6 py-4">ການຈັດການ</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-[#dee9fd]">
            {loading ? <tr><td colSpan="5" className="p-6 text-center text-[#737686] dark:text-[#94a3b8]">Loading...</td></tr> : 
              users.map(u => (
              <tr key={u.user_id} className="hover:bg-[#f9f9ff] dark:bg-[#0d1627] transition-colors">
                <td className="px-6 py-4 font-bold text-[#121c2a] dark:text-white">{u.username}</td>
                <td className="px-6 py-4 text-[#434654] dark:text-[#c7d2fe]">{u.full_name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#e6eeff] dark:bg-[#1e293b] text-[#003fb1]'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {u.is_active == 1 ? <span className="text-[#00714d] text-xs font-bold uppercase tracking-wider bg-[#6cf8bb]/30 px-2 py-1 rounded">Active</span> 
                                    : <span className="text-[#ba1a1a] text-xs font-bold uppercase tracking-wider bg-[#ffdad6] px-2 py-1 rounded">Disabled</span>}
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => {
                    setEditingUser(u);
                    setFormData({ user_id: u.user_id, full_name: u.full_name, role: u.role, is_active: u.is_active });
                    setIsFormOpen(true);
                  }} className="text-[#003fb1] hover:underline font-bold text-xs bg-[#eff3ff] dark:bg-[#1e2d4a] px-3 py-1.5 rounded-md">ແກ້ໄຂ</button>
                  <button onClick={() => {
                    setPassData({ target_user_id: u.user_id, new_password: '' });
                    setIsPassOpen(true);
                  }} className="text-[#00714d] hover:underline font-bold text-xs bg-[#eff3ff] dark:bg-[#1e2d4a] px-3 py-1.5 rounded-md">Reset Pass</button>
                  {user.id !== u.user_id && (
                    <button onClick={() => handleDelete(u.user_id)} className="text-[#ba1a1a] hover:underline font-bold text-xs bg-[#ffdad6]/50 px-3 py-1.5 rounded-md">ລຶບ</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#152033] rounded-3xl w-full max-w-lg p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">{editingUser ? 'ແກ້ໄຂຂໍ້ມູນ' : 'ເພີ່ມຜູ້ໃຊ້ໃໝ່'}</h3>
            <form onSubmit={handleSaveUser} className="space-y-4">
              {!editingUser && (
                <>
                  <div>
                    <label className="block text-sm font-bold mb-1">Username (ສຳລັບເຂົ້າລະບົບ)</label>
                    <input required minLength={4} type="text" className="w-full bg-[#eff3ff] dark:bg-[#1e2d4a] rounded-lg p-2.5" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value.toLowerCase()})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Password</label>
                    <input required minLength={6} type="password" className="w-full bg-[#eff3ff] dark:bg-[#1e2d4a] rounded-lg p-2.5" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-bold mb-1">ຊື່ເຕັມ (Full Name)</label>
                <input required type="text" className="w-full bg-[#eff3ff] dark:bg-[#1e2d4a] rounded-lg p-2.5" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">ຕຳແໜ່ງ (Role)</label>
                  <select className="w-full bg-[#eff3ff] dark:bg-[#1e2d4a] rounded-lg p-2.5" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {editingUser && (
                  <div>
                    <label className="block text-sm font-bold mb-1">ສະຖານະ</label>
                    <select className="w-full bg-[#eff3ff] dark:bg-[#1e2d4a] rounded-lg p-2.5" value={formData.is_active} onChange={e => setFormData({...formData, is_active: parseInt(e.target.value)})}>
                      <option value={1}>Active</option>
                      <option value={0}>Disabled</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-2.5 bg-[#eff3ff] dark:bg-[#1e2d4a] text-[#434654] dark:text-[#c7d2fe] font-bold rounded-xl hover:bg-[#dee9fd] dark:bg-[#2b3a54]">ຍົກເລີກ</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#003fb1] text-white font-bold rounded-xl hover:bg-[#1a56db]">ບັນທຶກ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {isPassOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#152033] rounded-3xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-[#ba1a1a]">ປ່ຽນລະຫັດຜ່ານ</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">ຕັ້ງລະຫັດຜ່ານໃໝ່</label>
                <input required minLength={6} type="password" className="w-full bg-[#eff3ff] dark:bg-[#1e2d4a] rounded-lg p-2.5" onChange={e => setPassData({...passData, new_password: e.target.value})} />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsPassOpen(false)} className="flex-1 py-2.5 bg-[#eff3ff] dark:bg-[#1e2d4a] text-[#434654] dark:text-[#c7d2fe] font-bold rounded-xl hover:bg-[#dee9fd] dark:bg-[#2b3a54]">ຍົກເລີກ</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#ba1a1a] text-white font-bold rounded-xl hover:opacity-90">ປ່ຽນລະຫັດຜ່ານ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
