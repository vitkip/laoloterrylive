import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API, resolveUploadUrl } from '../utils/api';
import RoleBadge from '../components/RoleBadge';
import UserAvatar from '../components/UserAvatar';
import { animals } from '../data/animals';

function formatDateTime(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('lo-LA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const ACTION_ICONS = {
  'Login success':  { icon: 'login',          color: 'text-emerald-400' },
  'Logout':         { icon: 'logout',          color: 'text-blue-400'    },
  'Update profile': { icon: 'person',          color: 'text-purple-400'  },
  'Create user':    { icon: 'person_add',      color: 'text-teal-400'    },
  'Update user':    { icon: 'manage_accounts', color: 'text-amber-400'   },
  'Delete user':    { icon: 'person_remove',   color: 'text-rose-400'     },
};

function getActionIcon(action = '') {
  for (const [k, v] of Object.entries(ACTION_ICONS)) {
    if (action.toLowerCase().startsWith(k.toLowerCase())) return v;
  }
  return { icon: 'circle', color: 'text-white/45' };
}

// Deterministic lucky animal generator based on user ID and date
function getDailyLuckyAnimal(userId) {
  if (!userId) return null;
  const todayStr = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
  const seedStr = `${userId}-${todayStr}`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % animals.length;
  return animals[index];
}

// ── Section Card ───────────────────────────────────────────────────

function Card({ title, icon, children, badge }) {
  return (
    <div className="bg-[#0e1124]/75 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/[0.05] relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-white/[0.08] group">
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37]/45 to-transparent" />
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#d4af37]/10 flex items-center justify-center border border-[#d4af37]/20">
            <span className="material-symbols-outlined text-[18px] text-[#d4af37]">{icon}</span>
          </div>
          <h2 className="text-xs font-black text-white uppercase tracking-widest font-headline">{title}</h2>
        </div>
        {badge && (
          <span className="text-[9px] font-black bg-[#d4af37]/10 text-[#d4af37] px-2.5 py-1 rounded-full border border-[#d4af37]/20 uppercase tracking-wider">
            {badge}
          </span>
        )}
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// ── Password Strength ──────────────────────────────────────────────

function PasswordStrength({ pass }) {
  const strength = [pass.length >= 6, /[A-Z]/.test(pass), /[0-9]/.test(pass), /[^A-Za-z0-9]/.test(pass)].filter(Boolean).length;
  const colors = [
    'from-red-500 to-red-400',
    'from-orange-500 to-orange-400',
    'from-yellow-500 to-yellow-400',
    'from-emerald-500 to-emerald-400'
  ];
  const labels = ['ອ່ອນ (Weak)', 'ພໍໃຊ້ (Fair)', 'ດີ (Good)', 'ແຂງແກ່ນ (Strong)'];
  if (!pass) return null;
  return (
    <div className="mt-2.5 space-y-1.5 bg-black/25 p-2.5 rounded-xl border border-white/[0.05]">
      <div className="flex gap-1.5">
        {colors.map((c, i) => (
          <div 
            key={i} 
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < strength 
                ? `bg-gradient-to-r ${colors[strength - 1]}` 
                : 'bg-white/[0.04]'
            }`} 
          />
        ))}
      </div>
      <div className="flex justify-between items-center text-[10px] font-bold">
        <span className="text-white/45 font-medium">ລະດັບຄວາມປອດໄພ:</span>
        <span className={`${
          strength === 1 ? 'text-red-400' :
          strength === 2 ? 'text-orange-400' :
          strength === 3 ? 'text-yellow-400' :
          'text-emerald-400'
        }`}>
          {labels[strength - 1]}
        </span>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, authFetch } = useAuth();
  const [profile, setProfile]   = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile]   = useState(false);
  const [savingPass, setSavingPass]         = useState(false);

  const [profileForm, setProfileForm] = useState({ full_name: '', email: '', phone_number: '' });
  const [passForm, setPassForm]       = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [showPass, setShowPass]       = useState({ cur: false, new: false, con: false });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    setLoadingProfile(true);
    authFetch(`${API}/index.php?action=get_profile`)
      .then(({ ok, data }) => {
        if (ok) {
          const resolvedData = data.avatar_url
            ? { ...data, avatar_url: resolveUploadUrl(data.avatar_url) }
            : data;
          setProfile(resolvedData);
          setProfileForm({ full_name: data.full_name || '', email: data.email || '', phone_number: data.phone_number || '' });
        } else {
          toast.error(data?.error || 'ໂຫຼດ profile ບໍ່ສຳເລັດ');
        }
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
    if (ok) {
      toast.success('ບັນທຶກ profile ສຳເລັດ');
      setProfile(p => ({ ...p, ...profileForm }));
    } else {
      toast.error(data?.error || 'ເກີດຂໍ້ຜິດພາດ');
    }
  };

  const handleSavePass = async (e) => {
    e.preventDefault();
    if (passForm.new_password !== passForm.confirm_password) {
      toast.error('ລະຫັດຜ່ານທີ່ຢືນຢັນບໍ່ກົງກັນ');
      return;
    }
    if (passForm.new_password.length < 6) {
      toast.error('Password ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວ');
      return;
    }
    setSavingPass(true);
    const { ok, data } = await authFetch(`${API}/index.php?action=change_password`, {
      method: 'POST',
      body: JSON.stringify({ current_password: passForm.current_password, new_password: passForm.new_password }),
    });
    setSavingPass(false);
    if (ok) {
      toast.success('ປ່ຽນລະຫັດຜ່ານສຳເລັດ');
      setPassForm({ current_password: '', new_password: '', confirm_password: '' });
    } else {
      toast.error(data?.error || 'ເກີດຂໍ້ຜິດພາດ');
    }
  };

  const setP  = (k, v) => setProfileForm(f => ({ ...f, [k]: v }));
  const setPw = (k, v) => setPassForm(f => ({ ...f, [k]: v }));

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('ໄຟລ໌ໃຫຍ່ເກີນ 2MB');
      return;
    }
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const { ok, data } = await authFetch(`${API}/index.php?action=upload_avatar`, {
        method: 'POST',
        body: formData,
      });
      if (ok && data?.avatar_url) {
        setProfile(p => ({ ...p, avatar_url: resolveUploadUrl(data.avatar_url) }));
        toast.success('ປ່ຽນຮູບ profile ສຳເລັດ');
      } else {
        toast.error(data?.error || 'ອັບໂຫຼດຮູບບໍ່ສຳເລັດ');
      }
    } catch {
      toast.error('ເຊື່ອມຕໍ່ server ບໍ່ໄດ້');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center py-24 select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-[#d4af37] animate-spin" />
          <p className="text-xs text-white/45 font-black uppercase tracking-wider">ກຳລັງໂຫຼດ...</p>
        </div>
      </div>
    );
  }

  const luckyAnimal = profile ? getDailyLuckyAnimal(profile.user_id) : null;

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes rotate-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-rotate-slow {
          animation: rotate-slow 20s linear infinite;
        }
      `}</style>

      {/* Profile Hero */}
      <div className="relative bg-[#0e1124]/85 backdrop-blur-md rounded-2xl p-6 sm:p-8 overflow-hidden shadow-xl border border-white/[0.05] group">
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.06),transparent_60%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
        
        {/* Rotating Graphic */}
        <div className="absolute -right-10 -bottom-10 w-52 h-52 opacity-10 dark:opacity-5 pointer-events-none animate-rotate-slow">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="2" strokeDasharray="6 6" />
            <circle cx="50" cy="50" r="35" stroke="white" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="50" cy="50" r="25" stroke="white" strokeWidth="1" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Clickable avatar with upload overlay */}
            <div className="relative group shrink-0">
              <UserAvatar
                name={profile?.full_name}
                username={profile?.username || user?.username}
                avatarUrl={profile?.avatar_url}
                size="xl"
                className="ring-4 ring-[#d4af37]/20 shrink-0"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                title="ປ່ຽນຮູບ profile"
                className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-wait cursor-pointer"
              >
                {uploadingAvatar ? (
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="flex-1 text-left select-none">
              <h1 className="text-2xl font-black text-white mb-1 font-headline tracking-wide">
                {profile?.full_name || user?.name || 'ຜູ້ໃຊ້'}
              </h1>
              <p className="text-white/45 text-sm mb-3">@{profile?.username || user?.username}</p>
              <div className="flex flex-wrap gap-2">
                <RoleBadge role={profile?.role || user?.role} />
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                  profile?.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-455 border border-rose-500/25'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {profile?.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Lucky Animal Info Widget */}
          {luckyAnimal && (
            <div className="bg-white/[0.02] backdrop-blur-md border border-white/[0.06] rounded-2xl p-3.5 px-4 flex items-center gap-3 shrink-0 shadow-lg md:max-w-xs self-stretch md:self-auto select-none">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 flex items-center justify-center text-white font-black text-xl shadow-md border border-white/20 relative animate-bounce select-none">
                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {luckyAnimal.icon}
                </span>
                <div className="absolute top-0.5 left-1 w-3 h-1 bg-white/40 rounded-full rotate-[-15deg]" />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black text-white/45 uppercase tracking-widest leading-none">ເລກນາມສັດນຳໂຊກປະຈຳວັນ</p>
                <p className="text-xs font-black text-white mt-1.5">
                  {luckyAnimal.animal_name_lao} ({luckyAnimal.animal_numbers.split(',')[0]})
                </p>
                <p className="text-[9px] text-[#d4af37] font-bold mt-0.5">🍀 ວັນນີ້ອາດຈະເປັນມື້ໂຊກດີ!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        {/* Left column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Edit Profile */}
          <Card title="ຂໍ້ມູນສ່ວນຕົວ" icon="person" badge="ຂໍ້ມູນລັດ">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-white/35 mb-1.5 uppercase tracking-wider">Username</label>
                <input disabled value={profile?.username || ''} type="text"
                  className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-sm font-bold text-white/35 cursor-not-allowed" />
                <p className="text-[10px] text-white/35 mt-1.5 font-bold">Username ບໍ່ສາມາດປ່ຽນໄດ້</p>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-white/35 mb-1.5 uppercase tracking-wider">ຊື່ເຕັມ *</label>
                <input required type="text" placeholder="ຊື່ ແລະ ນາມສະກຸນ"
                  className="w-full bg-black/45 border border-white/[0.08] rounded-xl p-3 text-sm font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/30 focus:border-[#d4af37]/45 transition-all duration-200"
                  value={profileForm.full_name} onChange={e => setP('full_name', e.target.value)} />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-white/35 mb-1.5 uppercase tracking-wider">Email</label>
                  <input type="email" placeholder="your@email.com"
                    className="w-full bg-black/45 border border-white/[0.08] rounded-xl p-3 text-sm font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/30 focus:border-[#d4af37]/45 transition-all duration-200"
                    value={profileForm.email} onChange={e => setP('email', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-white/35 mb-1.5 uppercase tracking-wider">ເບີໂທ</label>
                  <input type="tel" placeholder="020xxxxxxxx"
                    className="w-full bg-black/45 border border-white/[0.08] rounded-xl p-3 text-sm font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/30 focus:border-[#d4af37]/45 transition-all duration-200"
                    value={profileForm.phone_number} onChange={e => setP('phone_number', e.target.value)} />
                </div>
              </div>
              
              <div className="pt-2">
                <button type="submit" disabled={savingProfile}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-[#d4af37] hover:bg-[#d4af37]/90 text-black font-black rounded-xl transition-all shadow-lg shadow-[#d4af37]/10 hover:translate-y-[-1px] active:scale-95 disabled:opacity-50 text-sm cursor-pointer">
                  {savingProfile && <span className="w-4 h-4 border-2 border-black/35 border-t-black rounded-full animate-spin" />}
                  ບັນທຶກການປ່ຽນແປງ
                </button>
              </div>
            </form>
          </Card>

          {/* Change Password */}
          <Card title="ປ່ຽນລະຫັດຜ່ານ" icon="lock" badge="ຄວາມປອດໄພ">
            <form onSubmit={handleSavePass} className="space-y-4">
              {[
                { key: 'current_password', label: 'ລະຫັດຜ່ານປັດຈຸບັນ', showKey: 'cur' },
                { key: 'new_password',     label: 'ລະຫັດຜ່ານໃໝ່',      showKey: 'new' },
                { key: 'confirm_password', label: 'ຢືນຢັນລະຫັດຜ່ານໃໝ່', showKey: 'con' },
              ].map(({ key, label, showKey }) => (
                <div key={key}>
                  <label className="block text-[10px] font-black text-white/35 mb-1.5 uppercase tracking-wider">{label}</label>
                  <div className="relative">
                    <input required type={showPass[showKey] ? 'text' : 'password'}
                      minLength={key !== 'current_password' ? 6 : 1}
                      autoComplete={key === 'current_password' ? 'current-password' : 'new-password'}
                      className={`w-full bg-black/45 border border-white/[0.08] rounded-xl p-3 pr-10 text-sm font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-1 transition-all duration-200 ${
                        key === 'confirm_password' && passForm.confirm_password && passForm.new_password !== passForm.confirm_password
                          ? 'focus:ring-red-400/30 border-red-400/40 focus:border-red-400' 
                          : 'focus:ring-[#d4af37]/30 focus:border-[#d4af37]/45'
                      }`}
                      value={passForm[key]} onChange={e => setPw(key, e.target.value)} />
                    <button type="button" onClick={() => setShowPass(s => ({ ...s, [showKey]: !s[showKey] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-[#d4af37] transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[18px]">{showPass[showKey] ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  {key === 'new_password' && <PasswordStrength pass={passForm.new_password} />}
                  {key === 'confirm_password' && passForm.confirm_password && passForm.new_password !== passForm.confirm_password && (
                    <p className="text-[11px] text-rose-400 mt-1.5 font-bold">ລະຫັດຜ່ານບໍ່ກົງກັນ</p>
                  )}
                </div>
              ))}
              
              <div className="pt-2">
                <button type="submit" disabled={savingPass}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-[#d4af37] hover:bg-[#d4af37]/90 text-black font-black rounded-xl transition-all shadow-lg shadow-[#d4af37]/10 hover:translate-y-[-1px] active:scale-95 disabled:opacity-50 text-sm cursor-pointer">
                  {savingPass && <span className="w-4 h-4 border-2 border-black/35 border-t-black rounded-full animate-spin" />}
                  ປ່ຽນລະຫັດຜ່ານ
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right column - Account Metadata & Activity Timeline */}
        <div className="space-y-6">
          
          {/* Account info card */}
          <div className="bg-[#0e1124]/75 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/[0.05] relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-white/[0.08] group">
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37]/45 to-transparent" />
            
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 font-headline flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#d4af37]">credit_card</span>
              ຂໍ້ມູນ Account
            </h3>
            
            <div className="space-y-1">
              {[
                { label: 'User ID',    value: `#${profile?.user_id}`,               icon: 'tag' },
                { label: 'ຕຳແໜ່ງ',    value: <RoleBadge role={profile?.role} />,   icon: 'badge' },
                { label: 'ສ້າງວັນທີ', value: formatDateTime(profile?.created_at),  icon: 'calendar_today' },
                { label: 'Email',      value: profile?.email || '—',                icon: 'mail' },
                { label: 'ເບີໂທ',     value: profile?.phone_number || '—',         icon: 'call' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-start gap-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] px-2 -mx-2 rounded-xl transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-[#d4af37] mt-0.5 shrink-0">
                    <span className="material-symbols-outlined text-[16px]">{icon}</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/35 uppercase tracking-wider leading-none">{label}</p>
                    <div className="text-xs font-black text-white mt-1.5">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card title="ກິດຈະກຳລ່າສຸດ" icon="history">
            {!profile?.recent_activity?.length ? (
              <p className="text-xs text-white/35 text-center py-6 font-black uppercase tracking-wider">ບໍ່ມີ activity</p>
            ) : (
              <div className="relative border-l border-white/[0.05] ml-3.5 pl-6 space-y-5 py-1">
                {profile.recent_activity.map(log => {
                  const { icon, color } = getActionIcon(log.action);
                  return (
                    <div key={log.log_id} className="relative group">
                      
                      {/* Timeline marker node */}
                      <div className="absolute -left-[32px] top-1.5 w-4 h-4 rounded-full border border-white/[0.08] bg-[#0e1124] flex items-center justify-center z-10 group-hover:scale-110 transition-transform duration-200 shadow-sm">
                        <span className={`w-2 h-2 rounded-full ${
                          color.includes('emerald') ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' :
                          color.includes('blue') ? 'bg-blue-400' :
                          color.includes('purple') ? 'bg-purple-400' :
                          color.includes('teal') ? 'bg-teal-400' :
                          color.includes('amber') ? 'bg-amber-400' :
                          color.includes('rose') ? 'bg-rose-405 bg-rose-400' : 'bg-white/35'
                        }`} />
                      </div>
                      
                      {/* Timeline content box */}
                      <div className="bg-black/20 p-3 rounded-2xl border border-white/[0.04] hover:border-white/[0.08] hover:bg-black/35 transition-all duration-200">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`material-symbols-outlined text-[13px] ${color} shrink-0`} style={{ fontVariationSettings: "'FILL' 1" }}>
                            {icon}
                          </span>
                          <p className="text-xs font-black text-white leading-none">{log.action}</p>
                        </div>
                        <p className="text-[10px] text-white/35 font-medium pl-5">
                          {formatDateTime(log.created_at)}
                        </p>
                      </div>
                      
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
