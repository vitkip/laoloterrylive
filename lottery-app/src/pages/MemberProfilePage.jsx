import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API } from '../utils/api';

function formatDateTime(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('lo-LA', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const ROLE_LABEL = { admin: 'Admin', staff: 'Staff', member: 'Member' };

const ACTION_ICONS = {
  'Login success':  { icon: 'login',   color: 'text-green-600'  },
  'Logout':         { icon: 'logout',  color: 'text-blue-600'   },
  'Update profile': { icon: 'person',  color: 'text-purple-600' },
};
function getActionIcon(action = '') {
  for (const [k, v] of Object.entries(ACTION_ICONS)) {
    if (action.toLowerCase().startsWith(k.toLowerCase())) return v;
  }
  return { icon: 'circle', color: 'text-[#737686]' };
}

function PasswordStrength({ pass }) {
  const strength = [pass.length >= 6, /[A-Z]/.test(pass), /[0-9]/.test(pass), /[^A-Za-z0-9]/.test(pass)].filter(Boolean).length;
  const colors   = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400'];
  const labels   = ['ອ່ອນ', 'ພໍໃຊ້', 'ດີ', 'ແຂງ'];
  if (!pass) return null;
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {colors.map((c, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < strength ? c : 'bg-[#e8edf8] dark:bg-[#2b3a54]'}`} />
        ))}
      </div>
      <p className={`text-[10px] font-bold text-[${['#ef4444','#f97316','#eab308','#22c55e'][strength - 1] || '#737686'}]`}>
        {labels[strength - 1] || ''}
      </p>
    </div>
  );
}

export default function MemberProfilePage() {
  const { user, authFetch } = useAuth();
  const [profile, setProfile]       = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile]   = useState(false);
  const [savingPass, setSavingPass]         = useState(false);
  const [activeTab, setActiveTab]           = useState('profile');

  const [profileForm, setProfileForm] = useState({ full_name: '', email: '', phone_number: '' });
  const [passForm, setPassForm]       = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [showPass, setShowPass]       = useState({ cur: false, new: false, con: false });

  useEffect(() => {
    setLoadingProfile(true);
    authFetch(`${API}/index.php?action=get_profile`)
      .then(({ ok, data }) => {
        if (ok) {
          setProfile(data);
          setProfileForm({ full_name: data.full_name || '', email: data.email || '', phone_number: data.phone_number || '' });
        } else toast.error(data?.error || 'ໂຫຼດ profile ບໍ່ສຳເລັດ');
      })
      .catch(() => toast.error('ເຊື່ອມຕໍ່ server ບໍ່ໄດ້'))
      .finally(() => setLoadingProfile(false));
  }, [authFetch]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const { ok, data } = await authFetch(`${API}/index.php?action=update_profile`, {
      method: 'POST', body: JSON.stringify(profileForm),
    });
    setSavingProfile(false);
    if (ok) { toast.success('ບັນທຶກ profile ສຳເລັດ'); setProfile(p => ({ ...p, ...profileForm })); }
    else toast.error(data?.error || 'ເກີດຂໍ້ຜິດພາດ');
  };

  const handleSavePass = async (e) => {
    e.preventDefault();
    if (passForm.new_password !== passForm.confirm_password) { toast.error('ລະຫັດຜ່ານທີ່ຢືນຢັນບໍ່ກົງກັນ'); return; }
    if (passForm.new_password.length < 6) { toast.error('Password ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວ'); return; }
    setSavingPass(true);
    const { ok, data } = await authFetch(`${API}/index.php?action=change_password`, {
      method: 'POST',
      body: JSON.stringify({ current_password: passForm.current_password, new_password: passForm.new_password }),
    });
    setSavingPass(false);
    if (ok) { toast.success('ປ່ຽນລະຫັດຜ່ານສຳເລັດ'); setPassForm({ current_password: '', new_password: '', confirm_password: '' }); }
    else toast.error(data?.error || 'ລະຫັດຜ່ານເກົ່າບໍ່ຖືກຕ້ອງ');
  };

  const setP  = (k, v) => setProfileForm(f => ({ ...f, [k]: v }));
  const setPw = (k, v) => setPassForm(f => ({ ...f, [k]: v }));

  const initial = ((profile?.full_name || user?.name || user?.username || 'U')[0]).toUpperCase();

  const COLORS = [
    ['#003fb1', '#eff3ff'], ['#006c49', '#edfdf5'], ['#7c3aed', '#f5f3ff'],
    ['#d97706', '#fffbeb'], ['#0891b2', '#ecfeff'],
  ];
  function hashColor(str = '') {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
    return COLORS[Math.abs(h) % COLORS.length];
  }
  const [fg, bg] = hashColor(user?.username || '');

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-[#003fb1]/20 border-t-[#003fb1] animate-spin" />
          <p className="text-sm text-[#737686] font-medium">ກຳລັງໂຫຼດ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Hero card */}
      <div className="relative bg-gradient-to-br from-[#001d6e] via-[#003fb1] to-[#1a56db] rounded-3xl p-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(108,248,187,0.08),transparent_60%)]" />
        <div className="relative z-10 flex items-center gap-4">
          {/* Avatar */}
          <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl flex items-center justify-center font-black text-3xl ring-4 ring-white/20 shrink-0"
            style={{ background: bg, color: fg }}>
            {initial}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-white">{profile?.full_name || user?.name || 'ຜູ້ໃຊ້'}</h1>
            <p className="text-white/60 text-sm">@{profile?.username || user?.username}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                profile?.role === 'admin'  ? 'bg-red-500/20 text-red-300' :
                profile?.role === 'staff' ? 'bg-blue-500/20 text-blue-300' :
                'bg-purple-500/20 text-purple-300'
              }`}>
                <span className="w-1 h-1 rounded-full bg-current" />
                {ROLE_LABEL[profile?.role] || profile?.role}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">
                <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />Active
              </span>
            </div>
          </div>
          <div className="hidden sm:block text-right shrink-0">
            <p className="text-[10px] text-white/40 uppercase tracking-widest">ສະມາຊິກຕັ້ງແຕ່</p>
            <p className="text-sm font-bold text-white/80 mt-0.5">{formatDateTime(profile?.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-[#152033] rounded-2xl p-1 border border-[#dee9fd] dark:border-[#2b3a54] shadow-sm">
        {[
          { key: 'profile',  label: 'ຂໍ້ມູນສ່ວນຕົວ',  icon: 'person' },
          { key: 'password', label: 'ປ່ຽນລະຫັດຜ່ານ',  icon: 'lock'   },
          { key: 'activity', label: 'ກິດຈະກຳ',         icon: 'history'},
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === t.key
                ? 'bg-[#003fb1] text-white shadow-md'
                : 'text-[#737686] dark:text-[#94a3b8] hover:text-[#003fb1] dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-[#152033] rounded-2xl p-6 shadow-sm border border-[#dee9fd] dark:border-[#2b3a54]">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#434654] dark:text-[#94a3b8] mb-1.5 uppercase tracking-wide">Username</label>
              <input disabled value={profile?.username || ''} type="text"
                className="w-full bg-[#e8edf8] dark:bg-[#1a2438] rounded-xl p-3 text-sm text-[#737686] cursor-not-allowed" />
              <p className="text-[10px] text-[#737686] mt-1">Username ບໍ່ສາມາດປ່ຽນໄດ້</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#434654] dark:text-[#94a3b8] mb-1.5 uppercase tracking-wide">ຊື່ເຕັມ *</label>
              <input required type="text" placeholder="ຊື່ ແລະ ນາມສະກຸນ"
                className="w-full bg-[#f0f4ff] dark:bg-[#1e2d4a] rounded-xl p-3 text-sm font-medium text-[#121c2a] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 transition-all"
                value={profileForm.full_name} onChange={e => setP('full_name', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#434654] dark:text-[#94a3b8] mb-1.5 uppercase tracking-wide">Email</label>
                <input type="email" placeholder="your@email.com"
                  className="w-full bg-[#f0f4ff] dark:bg-[#1e2d4a] rounded-xl p-3 text-sm font-medium text-[#121c2a] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 transition-all"
                  value={profileForm.email} onChange={e => setP('email', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#434654] dark:text-[#94a3b8] mb-1.5 uppercase tracking-wide">ເບີໂທ</label>
                <input type="tel" placeholder="020xxxxxxxx"
                  className="w-full bg-[#f0f4ff] dark:bg-[#1e2d4a] rounded-xl p-3 text-sm font-medium text-[#121c2a] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 transition-all"
                  value={profileForm.phone_number} onChange={e => setP('phone_number', e.target.value)} />
              </div>
            </div>
            <button type="submit" disabled={savingProfile}
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#003fb1] text-white font-bold rounded-xl hover:bg-[#1a56db] transition-colors disabled:opacity-60 text-sm">
              {savingProfile && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              ບັນທຶກການປ່ຽນແປງ
            </button>
          </form>
        </div>
      )}

      {/* Tab: Password */}
      {activeTab === 'password' && (
        <div className="bg-white dark:bg-[#152033] rounded-2xl p-6 shadow-sm border border-[#dee9fd] dark:border-[#2b3a54]">
          <form onSubmit={handleSavePass} className="space-y-4">
            {[
              { key: 'current_password', label: 'ລະຫັດຜ່ານປັດຈຸບັນ', sk: 'cur', ac: 'current-password' },
              { key: 'new_password',     label: 'ລະຫັດຜ່ານໃໝ່',      sk: 'new', ac: 'new-password' },
              { key: 'confirm_password', label: 'ຢືນຢັນລະຫັດຜ່ານໃໝ່',sk: 'con', ac: 'new-password' },
            ].map(({ key, label, sk, ac }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-[#434654] dark:text-[#94a3b8] mb-1.5 uppercase tracking-wide">{label}</label>
                <div className="relative">
                  <input required type={showPass[sk] ? 'text' : 'password'} autoComplete={ac}
                    minLength={key !== 'current_password' ? 6 : 1}
                    className={`w-full bg-[#f0f4ff] dark:bg-[#1e2d4a] rounded-xl p-3 pr-10 text-sm font-medium text-[#121c2a] dark:text-white focus:outline-none focus:ring-2 transition-all ${
                      key === 'confirm_password' && passForm.confirm_password && passForm.new_password !== passForm.confirm_password
                        ? 'ring-2 ring-red-400/40 focus:ring-red-400/40' : 'focus:ring-[#003fb1]/40'
                    }`}
                    value={passForm[key]} onChange={e => setPw(key, e.target.value)} />
                  <button type="button" onClick={() => setShowPass(s => ({ ...s, [sk]: !s[sk] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#003fb1]">
                    <span className="material-symbols-outlined text-[18px]">{showPass[sk] ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {key === 'new_password' && <PasswordStrength pass={passForm.new_password} />}
                {key === 'confirm_password' && passForm.confirm_password && passForm.new_password !== passForm.confirm_password && (
                  <p className="text-[11px] text-red-500 mt-1 font-medium">ລະຫັດຜ່ານບໍ່ກົງກັນ</p>
                )}
              </div>
            ))}
            <button type="submit" disabled={savingPass}
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#003fb1] text-white font-bold rounded-xl hover:bg-[#1a56db] transition-colors disabled:opacity-60 text-sm">
              {savingPass && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              ປ່ຽນລະຫັດຜ່ານ
            </button>
          </form>
        </div>
      )}

      {/* Tab: Activity */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-[#152033] rounded-2xl p-6 shadow-sm border border-[#dee9fd] dark:border-[#2b3a54]">
          <h3 className="text-sm font-extrabold text-[#121c2a] dark:text-white uppercase tracking-widest mb-4">ກິດຈະກຳລ່າສຸດ</h3>
          {!profile?.recent_activity?.length ? (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-4xl text-[#003fb1]/20">history</span>
              <p className="text-sm text-[#737686] mt-2">ຍັງບໍ່ມີ activity</p>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-[#dee9fd] dark:divide-[#2b3a54]">
              {profile.recent_activity.map(log => {
                const { icon, color } = getActionIcon(log.action);
                return (
                  <div key={log.log_id} className="flex items-center gap-3 py-3">
                    <div className="w-8 h-8 rounded-xl bg-[#f0f4ff] dark:bg-[#1e2d4a] flex items-center justify-center shrink-0">
                      <span className={`material-symbols-outlined text-[15px] ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#121c2a] dark:text-white">{log.action}</p>
                      <p className="text-[11px] text-[#737686] dark:text-[#94a3b8]">{formatDateTime(log.created_at)}</p>
                    </div>
                    {log.ip_address && (
                      <span className="text-[10px] font-mono bg-[#f0f4ff] dark:bg-[#1e2d4a] px-2 py-0.5 rounded text-[#737686] dark:text-[#94a3b8] hidden sm:block">
                        {log.ip_address}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
