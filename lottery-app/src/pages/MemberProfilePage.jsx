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
  'Login success':  { icon: 'login',   color: '#4ade80' },
  'Logout':         { icon: 'logout',  color: '#60a5fa' },
  'Update profile': { icon: 'person',  color: '#c084fc' },
};
function getActionIcon(action = '') {
  for (const [k, v] of Object.entries(ACTION_ICONS)) {
    if (action.toLowerCase().startsWith(k.toLowerCase())) return v;
  }
  return { icon: 'circle', color: 'rgba(212,175,55,0.4)' };
}

function PasswordStrength({ pass }) {
  const checks   = [pass.length >= 6, /[A-Z]/.test(pass), /[0-9]/.test(pass), /[^A-Za-z0-9]/.test(pass)];
  const strength = checks.filter(Boolean).length;
  const barColors = [
    'linear-gradient(90deg,#ef4444,#f97316)',
    'linear-gradient(90deg,#f97316,#eab308)',
    'linear-gradient(90deg,#eab308,#d4af37)',
    'linear-gradient(90deg,#d4af37,#a3e635)',
  ];
  const labels = ['ອ່ອນ', 'ພໍໃຊ້', 'ດີ', 'ແຂງ'];
  if (!pass) return null;
  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            flex: 1, height: '3px', borderRadius: '9999px',
            background: i < strength ? barColors[strength - 1] : 'rgba(212,175,55,0.1)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      {strength > 0 && (
        <p style={{ fontSize: '0.6rem', fontFamily: "'Cinzel', serif", letterSpacing: '0.08em',
          color: ['#ef4444','#f97316','#d4af37','#a3e635'][strength - 1], marginTop: '4px' }}>
          {labels[strength - 1]}
        </p>
      )}
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Noto+Sans+Lao:wght@300;400;500;600;700;800&display=swap');

/* ── page wrap ── */
.mp-page {
  max-width: 680px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  font-family: 'Noto Sans Lao', sans-serif;
  space-y: 1.5rem;
}

/* ── staggered entrance ── */
.mp-fade { animation: mp-in .7s cubic-bezier(.16,1,.3,1) both; }
.mp-fade:nth-child(1) { animation-delay: 0s;    }
.mp-fade:nth-child(2) { animation-delay: .08s;  }
.mp-fade:nth-child(3) { animation-delay: .16s;  }
@keyframes mp-in {
  from { opacity:0; transform: translateY(20px) scale(.98); }
  to   { opacity:1; transform: translateY(0)    scale(1);   }
}

/* ════════════════════════════════════
   VIP HERO CARD
════════════════════════════════════ */
.mp-hero-border {
  padding: 1.5px;
  border-radius: 24px;
  background: linear-gradient(135deg, #d4af37, #5c3700, #d4af37, #7c4d00, #FFE082);
  background-size: 300% 300%;
  animation: mp-border 5s ease infinite;
  box-shadow: 0 0 50px rgba(212,175,55,.12), 0 24px 60px rgba(0,0,0,.55);
  margin-bottom: 1.25rem;
}
@keyframes mp-border {
  0%,100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}

.mp-hero {
  position: relative;
  border-radius: 23px;
  overflow: hidden;
  background: linear-gradient(135deg, #0e1124 0%, #0b0d1b 40%, #121528 100%);
  padding: 1.75rem 1.75rem 1.5rem;
}

/* holographic shimmer overlay */
.mp-hero::before {
  content: '';
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 10% 20%, rgba(212,175,55,.1) 0%, transparent 50%),
    radial-gradient(ellipse at 90% 80%, rgba(212,175,55,.05) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(212,175,55,.02) 0%, transparent 70%);
  pointer-events: none;
}
.mp-hero::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(212,175,55,.04) 50%, transparent 70%);
  background-size: 200% 100%;
  animation: mp-holo 4s ease-in-out infinite;
  pointer-events: none;
}
@keyframes mp-holo {
  0%   { background-position: -100% 0; }
  100% { background-position: 300% 0; }
}

/* card chip / decorative dots */
.mp-chip-row {
  position: absolute;
  top: 1.25rem; right: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 3px;
  opacity: .25;
}
.mp-chip-dot {
  width: 24px; height: 5px;
  border-radius: 9999px;
  background: linear-gradient(90deg, #d4af37, #FFA000);
}

.mp-hero-body {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

/* avatar ring */
.mp-avatar-wrap {
  position: relative;
  width: 80px; height: 80px;
  flex-shrink: 0;
}
.mp-ring-outer {
  position: absolute; inset: 0;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #d4af37, #5c3700, #FFE082, #7c4d00, #d4af37);
  animation: mp-spin 8s linear infinite;
  padding: 2.5px;
}
@keyframes mp-spin { to { transform: rotate(360deg); } }
.mp-ring-inner {
  position: absolute; inset: 2.5px;
  border-radius: 50%;
  background: linear-gradient(145deg, #0e1124, #07070e);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Cinzel', serif;
  font-size: 1.75rem;
  font-weight: 900;
}
.mp-ring-glow {
  position: absolute; inset: -4px;
  border-radius: 50%;
  background: transparent;
  box-shadow: 0 0 20px rgba(212,175,55,.25);
  animation: mp-glow-pulse 2.5s ease-in-out infinite;
}
@keyframes mp-glow-pulse {
  0%,100% { box-shadow: 0 0 14px rgba(212,175,55,.2);  }
  50%      { box-shadow: 0 0 30px rgba(212,175,55,.45); }
}

.mp-hero-info { flex: 1; min-width: 0; }
.mp-hero-name {
  font-family: 'Noto Sans Lao', sans-serif;
  font-size: 1.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #FFE082, #d4af37, #FFA000);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mp-hero-username {
  font-family: 'Cinzel', serif;
  font-size: .65rem;
  letter-spacing: .1em;
  color: rgba(212,175,55,.38);
  margin-top: .15rem;
}
.mp-badges { display: flex; align-items: center; gap: .4rem; margin-top: .6rem; flex-wrap: wrap; }
.mp-badge {
  display: inline-flex; align-items: center; gap: .3rem;
  font-family: 'Cinzel', serif;
  font-size: .55rem;
  letter-spacing: .1em;
  text-transform: uppercase;
  padding: .2rem .65rem;
  border-radius: 9999px;
}
.mp-badge-role  { background: rgba(212,175,55,.1);  border: 1px solid rgba(212,175,55,.25); color: rgba(212,175,55,.8); }
.mp-badge-admin { background: rgba(239,68,68,.1);  border: 1px solid rgba(239,68,68,.3);  color: rgba(248,113,113,.9); }
.mp-badge-staff { background: rgba(96,165,250,.1); border: 1px solid rgba(96,165,250,.3); color: rgba(147,197,253,.9); }
.mp-badge-active {
  background: rgba(16,185,129,.08); border: 1px solid rgba(16,185,129,.25); color: rgba(52,211,153,.85);
}
.mp-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; animation: mp-pulse 1.8s ease-in-out infinite; }
@keyframes mp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.7)} }

.mp-hero-since {
  display: none;
  text-align: right;
  flex-shrink: 0;
}
@media(min-width:560px) { .mp-hero-since { display: block; } }
.mp-since-label { font-family:'Cinzel',serif; font-size:.55rem; letter-spacing:.18em; color:rgba(212,175,55,.28); text-transform:uppercase; }
.mp-since-val   { font-family:'Noto Sans Lao',sans-serif; font-size:.75rem; font-weight:700; color:rgba(212,175,55,.7); margin-top:.2rem; }

/* card footer strip */
.mp-hero-footer {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px dashed rgba(212,175,55,.15);
}
.mp-member-id {
  font-family: 'Cinzel', serif;
  font-size: .58rem;
  letter-spacing: .2em;
  color: rgba(212,175,55,.3);
}
.mp-card-logo {
  font-family: 'Cinzel', serif;
  font-size: .65rem;
  font-weight: 700;
  letter-spacing: .14em;
  color: rgba(212,175,55,.2);
}

/* ════════════════════════════════════
   TAB BAR
════════════════════════════════════ */
.mp-tabs {
  display: flex;
  gap: .25rem;
  background: rgba(212,175,55,.04);
  border: 1px solid rgba(212,175,55,.14);
  border-radius: 16px;
  padding: .3rem;
  margin-bottom: 1.25rem;
}
.mp-tab {
  flex: 1;
  display: flex; align-items: center; justify-content: center; gap: .4rem;
  padding: .65rem .5rem;
  border-radius: 12px;
  font-family: 'Noto Sans Lao', sans-serif;
  font-size: .72rem;
  font-weight: 700;
  border: none; cursor: pointer;
  transition: all .25s ease;
  position: relative; overflow: hidden;
  background: transparent;
  color: rgba(212,175,55,.35);
}
.mp-tab.active {
  background: linear-gradient(120deg, #7c4d00, #d4af37, #B8860B, #FFE082, #7c4d00);
  background-size: 250% 250%;
  animation: mp-tab-shift 3s ease infinite;
  color: #1a0c00;
  box-shadow: 0 4px 16px rgba(212,175,55,.25), inset 0 1px 0 rgba(255,255,255,.2);
}
@keyframes mp-tab-shift {
  0%,100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
.mp-tab.active::after {
  content: '';
  position: absolute; top:0; left:-120%; width:55%; height:100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent);
  transform: skewX(-20deg);
  animation: mp-tab-shimmer 2.5s ease-in-out infinite;
}
@keyframes mp-tab-shimmer { 0%{left:-120%} 100%{left:220%} }
.mp-tab:not(.active):hover { color: rgba(212,175,55,.7); background: rgba(212,175,55,.06); }
.mp-tab-icon { font-size: 15px !important; }

/* ════════════════════════════════════
   PANEL CARD
════════════════════════════════════ */
.mp-panel {
  background: linear-gradient(155deg, rgba(14,17,36,.97), rgba(7,7,14,.99));
  border: 1px solid rgba(212,175,55,.14);
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: 0 8px 40px rgba(0,0,0,.45), 0 0 0 0.5px rgba(212,175,55,.08);
}

/* ── form label ── */
.mp-label {
  display: block;
  font-family: 'Cinzel', serif;
  font-size: .58rem;
  font-weight: 700;
  letter-spacing: .15em;
  text-transform: uppercase;
  color: rgba(212,175,55,.4);
  margin-bottom: .45rem;
}

/* ── input field ── */
.mp-field { position: relative; margin-bottom: 1rem; }
.mp-input-icon {
  position: absolute; left: .9rem; top: 50%; transform: translateY(-50%);
  font-size: 17px !important; color: rgba(212,175,55,.32); pointer-events: none;
}
.mp-input {
  width: 100%; box-sizing: border-box;
  background: rgba(212,175,55,.04);
  border: 1px solid rgba(212,175,55,.13);
  border-radius: 13px;
  padding: .875rem 1rem .875rem 2.6rem;
  font-size: .88rem; font-weight: 500;
  color: rgba(255,255,255,.88);
  font-family: 'Noto Sans Lao', sans-serif;
  transition: border-color .25s, box-shadow .25s, background .25s;
  outline: none;
}
.mp-input::placeholder { color: rgba(212,175,55,.18); }
.mp-input:focus {
  border-color: rgba(212,175,55,.42);
  background: rgba(212,175,55,.07);
  box-shadow: 0 0 0 3px rgba(212,175,55,.07), 0 0 20px rgba(212,175,55,.05);
}
.mp-input:disabled {
  color: rgba(212,175,55,.25);
  background: rgba(212,175,55,.02);
  border-color: rgba(212,175,55,.07);
  cursor: not-allowed;
}
.mp-input-hint {
  font-family: 'Cinzel', serif;
  font-size: .55rem; letter-spacing: .08em;
  color: rgba(212,175,55,.22);
  margin-top: .3rem;
}
.mp-input-err { border-color: rgba(239,68,68,.4) !important; }
.mp-input-err:focus { box-shadow: 0 0 0 3px rgba(239,68,68,.08) !important; }
.mp-err-msg { font-size: .65rem; color: rgba(248,113,113,.85); margin-top: .3rem; font-weight: 600; }

/* eye toggle */
.mp-eye {
  position: absolute; right: .9rem; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: rgba(212,175,55,.3); padding: 0; display: flex; transition: color .2s;
}
.mp-eye:hover { color: rgba(212,175,55,.75); }

/* grid */
.mp-grid { display: grid; grid-template-columns: 1fr; gap: 0; }
@media(min-width:480px) { .mp-grid { grid-template-columns: 1fr 1fr; gap: 0 1rem; } }

/* section heading */
.mp-section-head {
  font-family: 'Cinzel', serif;
  font-size: .62rem; font-weight: 700;
  letter-spacing: .2em; text-transform: uppercase;
  color: rgba(212,175,55,.35);
  margin-bottom: 1.25rem;
  padding-bottom: .6rem;
  border-bottom: 1px solid rgba(212,175,55,.1);
  display: flex; align-items: center; gap: .5rem;
}
.mp-section-head::before {
  content: '✦';
  color: rgba(212,175,55,.4);
}

/* ── submit button ── */
.mp-submit {
  position: relative; overflow: hidden;
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: .5rem;
  padding: 1rem;
  border: none; border-radius: 13px;
  font-size: .9rem; font-weight: 800;
  cursor: pointer;
  font-family: 'Noto Sans Lao', sans-serif;
  color: #1a0c00;
  background: linear-gradient(110deg, #7c4d00, #d4af37, #B8860B, #FFE082, #7c4d00);
  background-size: 250% 250%;
  animation: mp-btn-shift 3.5s ease infinite;
  box-shadow: 0 4px 22px rgba(212,175,55,.28), inset 0 1px 0 rgba(255,255,255,.25);
  transition: transform .2s, box-shadow .2s;
  margin-top: .25rem;
}
@keyframes mp-btn-shift {
  0%,100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
.mp-submit::after {
  content: '';
  position: absolute; top:0; left:-120%; width:55%; height:100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent);
  transform: skewX(-20deg);
  animation: mp-shimmer 2.8s ease-in-out infinite;
}
@keyframes mp-shimmer { 0%{left:-120%} 100%{left:220%} }
.mp-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(212,175,55,.38), inset 0 1px 0 rgba(255,255,255,.25);
}
.mp-submit:disabled { opacity:.65; cursor:not-allowed; animation:none; }
.mp-submit:disabled::after { display:none; }
.mp-spinner {
  width:16px; height:16px; flex-shrink:0;
  border: 2.5px solid rgba(26,12,0,.2);
  border-top-color: rgba(26,12,0,.8);
  border-radius: 50%;
  animation: mp-spin .7s linear infinite;
}

/* ════════════════════════════════════
   ACTIVITY TIMELINE
════════════════════════════════════ */
.mp-timeline { position: relative; }
.mp-timeline-line {
  position: absolute;
  left: 15px; top: 0; bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, rgba(212,175,55,.3), rgba(212,175,55,.05) 90%, transparent);
}
.mp-tl-item {
  position: relative;
  display: flex; align-items: flex-start; gap: 1rem;
  padding: .9rem 0 .9rem 2.75rem;
  border-bottom: 1px solid rgba(212,175,55,.07);
  animation: mp-in .5s cubic-bezier(.16,1,.3,1) both;
}
.mp-tl-item:last-child { border-bottom: none; }
.mp-tl-dot {
  position: absolute;
  left: 6px; top: 50%; transform: translateY(-50%);
  width: 18px; height: 18px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(12,6,28,.95);
  border: 1.5px solid rgba(212,175,55,.25);
  box-shadow: 0 0 8px rgba(212,175,55,.1);
}
.mp-tl-icon { font-size: 11px !important; }
.mp-tl-action { font-size: .82rem; font-weight: 700; color: rgba(255,255,255,.8); }
.mp-tl-time   { font-size: .65rem; color: rgba(212,175,55,.3); margin-top: .15rem; font-family: 'Cinzel', serif; letter-spacing: .04em; }
.mp-tl-ip {
  margin-left: auto; flex-shrink: 0;
  font-family: 'Cinzel', monospace;
  font-size: .58rem; letter-spacing: .06em;
  color: rgba(212,175,55,.28);
  background: rgba(212,175,55,.05);
  border: 1px solid rgba(212,175,55,.1);
  padding: .2rem .6rem; border-radius: 6px;
  display: none;
}
@media(min-width:480px) { .mp-tl-ip { display: block; } }

.mp-empty {
  text-align: center; padding: 3rem 1rem;
}
.mp-empty-icon { font-size: 2.5rem !important; color: rgba(212,175,55,.12); }
.mp-empty-txt { font-family:'Cinzel',serif; font-size:.65rem; letter-spacing:.12em; color:rgba(212,175,55,.22); margin-top:.75rem; }

/* loading */
.mp-loading {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 60vh; gap: 1rem;
}
.mp-load-ring {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #d4af37, #5c3700 80%, transparent);
  animation: mp-spin .9s linear infinite;
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
}
.mp-load-txt {
  font-family: 'Cinzel', serif; font-size: .65rem; letter-spacing: .16em;
  color: rgba(212,175,55,.35);
}
`;

export default function MemberProfilePage() {
  const { user, authFetch } = useAuth();
  const [profile, setProfile]                   = useState(null);
  const [loadingProfile, setLoadingProfile]     = useState(true);
  const [savingProfile, setSavingProfile]       = useState(false);
  const [savingPass, setSavingPass]             = useState(false);
  const [activeTab, setActiveTab]               = useState('profile');

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

  /* gradient avatar color from username hash */
  const avatarGold = { text: '#d4af37', bg: 'radial-gradient(circle at 40% 35%, #1e0f38, #0d0520)' };

  /* member ID from user id */
  const memberId = profile?.user_id
    ? `LLL-${String(profile.user_id).padStart(6, '0')}`
    : 'LLL-??????';

  const roleBadgeClass =
    profile?.role === 'admin' ? 'mp-badge mp-badge-admin' :
    profile?.role === 'staff' ? 'mp-badge mp-badge-staff' :
    'mp-badge mp-badge-role';

  if (loadingProfile) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="mp-loading">
          <div className="mp-load-ring" />
          <p className="mp-load-txt">LOADING PROFILE…</p>
        </div>
      </>
    );
  }

  const TABS = [
    { key: 'profile',  label: 'ຂໍ້ມູນສ່ວນຕົວ', icon: 'person'  },
    { key: 'password', label: 'ລະຫັດຜ່ານ',     icon: 'lock'    },
    { key: 'activity', label: 'ກິດຈະກຳ',        icon: 'history' },
  ];

  const PASS_FIELDS = [
    { key: 'current_password', label: 'ລະຫັດຜ່ານປັດຈຸບັນ', sk: 'cur', ac: 'current-password', icon: 'key' },
    { key: 'new_password',     label: 'ລະຫັດຜ່ານໃໝ່',      sk: 'new', ac: 'new-password',      icon: 'lock' },
    { key: 'confirm_password', label: 'ຢືນຢັນລະຫັດຜ່ານໃໝ່', sk: 'con', ac: 'new-password',      icon: 'lock_check' },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="mp-page">

        {/* ── VIP Hero Card ── */}
        <div className="mp-hero-border mp-fade">
          <div className="mp-hero">
            {/* decorative chip lines */}
            <div className="mp-chip-row">
              <div className="mp-chip-dot" />
              <div className="mp-chip-dot" style={{ width: 16 }} />
              <div className="mp-chip-dot" style={{ width: 20 }} />
            </div>

            <div className="mp-hero-body">
              {/* Spinning ring avatar */}
              <div className="mp-avatar-wrap">
                <div className="mp-ring-glow" />
                <div className="mp-ring-outer" />
                <div className="mp-ring-inner" style={{ color: avatarGold.text }}>
                  {initial}
                </div>
              </div>

              {/* Info */}
              <div className="mp-hero-info">
                <div className="mp-hero-name">
                  {profile?.full_name || user?.name || 'ຜູ້ໃຊ້'}
                </div>
                <div className="mp-hero-username">@{profile?.username || user?.username}</div>
                <div className="mp-badges">
                  <span className={roleBadgeClass}>
                    <span className="mp-badge-dot" />
                    {ROLE_LABEL[profile?.role] || profile?.role}
                  </span>
                  <span className="mp-badge mp-badge-active">
                    <span className="mp-badge-dot" />
                    Active
                  </span>
                </div>
              </div>

              {/* Member since (desktop) */}
              <div className="mp-hero-since">
                <div className="mp-since-label">ສະມາຊິກຕັ້ງແຕ່</div>
                <div className="mp-since-val">{formatDateTime(profile?.created_at)}</div>
              </div>
            </div>

            {/* Footer strip */}
            <div className="mp-hero-footer">
              <span className="mp-member-id">{memberId}</span>
              <span className="mp-card-logo">✦ LAO LOTTERY LIVE ✦</span>
            </div>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="mp-tabs mp-fade">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`mp-tab${activeTab === t.key ? ' active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              <span className="material-symbols-outlined mp-tab-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
                {t.icon}
              </span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Profile Panel ── */}
        {activeTab === 'profile' && (
          <div className="mp-panel mp-fade">
            <div className="mp-section-head">ຂໍ້ມູນສ່ວນຕົວ</div>
            <form onSubmit={handleSaveProfile}>

              {/* Username (disabled) */}
              <label className="mp-label">Username</label>
              <div className="mp-field">
                <span className="material-symbols-outlined mp-input-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
                  alternate_email
                </span>
                <input
                  type="text" disabled
                  value={profile?.username || ''}
                  className="mp-input"
                />
                <p className="mp-input-hint">✦ Username ບໍ່ສາມາດປ່ຽນໄດ້</p>
              </div>

              {/* Full name */}
              <label className="mp-label">ຊື່ເຕັມ *</label>
              <div className="mp-field">
                <span className="material-symbols-outlined mp-input-icon" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
                <input
                  required type="text"
                  placeholder="ຊື່ ແລະ ນາມສະກຸນ"
                  className="mp-input"
                  value={profileForm.full_name}
                  onChange={e => setP('full_name', e.target.value)}
                />
              </div>

              {/* Email + Phone grid */}
              <div className="mp-grid">
                <div>
                  <label className="mp-label">Email</label>
                  <div className="mp-field">
                    <span className="material-symbols-outlined mp-input-icon" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
                    <input
                      type="email" placeholder="your@email.com"
                      className="mp-input"
                      value={profileForm.email}
                      onChange={e => setP('email', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="mp-label">ເບີໂທ</label>
                  <div className="mp-field">
                    <span className="material-symbols-outlined mp-input-icon" style={{ fontVariationSettings: "'FILL' 1" }}>phone</span>
                    <input
                      type="tel" placeholder="020xxxxxxxx"
                      className="mp-input"
                      value={profileForm.phone_number}
                      onChange={e => setP('phone_number', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={savingProfile} className="mp-submit">
                {savingProfile && <div className="mp-spinner" />}
                <span className="material-symbols-outlined" style={{ fontSize: 17, fontVariationSettings: "'FILL' 1" }}>save</span>
                ບັນທຶກການປ່ຽນແປງ
              </button>
            </form>
          </div>
        )}

        {/* ── Password Panel ── */}
        {activeTab === 'password' && (
          <div className="mp-panel mp-fade">
            <div className="mp-section-head">ປ່ຽນລະຫັດຜ່ານ</div>
            <form onSubmit={handleSavePass}>
              {PASS_FIELDS.map(({ key, label, sk, ac, icon }) => {
                const isConfirm = key === 'confirm_password';
                const mismatch  = isConfirm && passForm.confirm_password && passForm.new_password !== passForm.confirm_password;
                return (
                  <div key={key}>
                    <label className="mp-label">{label}</label>
                    <div className="mp-field">
                      <span className="material-symbols-outlined mp-input-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {icon}
                      </span>
                      <input
                        required
                        type={showPass[sk] ? 'text' : 'password'}
                        autoComplete={ac}
                        minLength={key !== 'current_password' ? 6 : 1}
                        className={`mp-input${mismatch ? ' mp-input-err' : ''}`}
                        style={{ paddingRight: '2.8rem' }}
                        value={passForm[key]}
                        onChange={e => setPw(key, e.target.value)}
                      />
                      <button type="button" className="mp-eye" onClick={() => setShowPass(s => ({ ...s, [sk]: !s[sk] }))}>
                        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
                          {showPass[sk] ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    {key === 'new_password' && <PasswordStrength pass={passForm.new_password} />}
                    {mismatch && <p className="mp-err-msg">✦ ລະຫັດຜ່ານບໍ່ກົງກັນ</p>}
                  </div>
                );
              })}

              <button type="submit" disabled={savingPass} className="mp-submit">
                {savingPass && <div className="mp-spinner" />}
                <span className="material-symbols-outlined" style={{ fontSize: 17, fontVariationSettings: "'FILL' 1" }}>shield_lock</span>
                ປ່ຽນລະຫັດຜ່ານ
              </button>
            </form>
          </div>
        )}

        {/* ── Activity Panel ── */}
        {activeTab === 'activity' && (
          <div className="mp-panel mp-fade">
            <div className="mp-section-head">ກິດຈະກຳລ່າສຸດ</div>
            {!profile?.recent_activity?.length ? (
              <div className="mp-empty">
                <span className="material-symbols-outlined mp-empty-icon">history</span>
                <p className="mp-empty-txt">ຍັງບໍ່ມີ Activity</p>
              </div>
            ) : (
              <div className="mp-timeline">
                <div className="mp-timeline-line" />
                {profile.recent_activity.map((log, idx) => {
                  const { icon, color } = getActionIcon(log.action);
                  return (
                    <div key={log.log_id} className="mp-tl-item" style={{ animationDelay: `${idx * 0.06}s` }}>
                      <div className="mp-tl-dot">
                        <span
                          className="material-symbols-outlined mp-tl-icon"
                          style={{ fontVariationSettings: "'FILL' 1", color }}
                        >
                          {icon}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="mp-tl-action">{log.action}</div>
                        <div className="mp-tl-time">{formatDateTime(log.created_at)}</div>
                      </div>
                      {log.ip_address && (
                        <span className="mp-tl-ip">{log.ip_address}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}
