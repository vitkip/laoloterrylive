import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { authService } from '../services/authService';
import { registerSchema } from '../schemas/authSchemas';
import PasswordInput from '../components/PasswordInput';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { useDebounce } from '../../../hooks/useDebounce';

// ── Availability indicator ─────────────────────────────────────────
function AvailBadge({ checking, available }) {
  if (checking) return (
    <span className="w-4 h-4 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin block" />
  );
  if (available === true) return (
    <span className="material-symbols-outlined text-[18px] text-emerald-400" style={{ fontVariationSettings: "'FILL' 1" }}>
      check_circle
    </span>
  );
  if (available === false) return (
    <span className="material-symbols-outlined text-[18px] text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>
      cancel
    </span>
  );
  return null;
}

// ── Field error / hint ─────────────────────────────────────────────
function FieldHint({ error, available, takenMsg }) {
  if (error) return <p className="mt-1.5 text-xs text-red-400 font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>{error}</p>;
  if (available === false) return <p className="mt-1.5 text-xs text-red-400 font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>{takenMsg}</p>;
  if (available === true) return <p className="mt-1.5 text-xs text-emerald-400 font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>ສາມາດໃຊ້ງານໄດ້</p>;
  return null;
}

/* Generated once on module load — stable across re-renders */
const BALLS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  num: Math.floor(Math.random() * 60) + 1,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 18 + 22,
  dur: Math.random() * 14 + 10,
  delay: -(Math.random() * 12),
  op: Math.random() * 0.13 + 0.04,
}));

const STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  s: Math.random() * 2.5 + 0.5,
  dur: Math.random() * 3 + 2,
  delay: Math.random() * 6,
}));

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Noto+Sans+Lao:wght@300;400;500;600;700;800&display=swap');

.ll-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;
  background: transparent;
  font-family: 'Noto Sans Lao', sans-serif;
}

/* ── star field ── */
.ll-star {
  position: fixed;
  border-radius: 50%;
  background: #fff;
  animation: ll-twinkle var(--d) ease-in-out infinite var(--dl);
  pointer-events: none;
  z-index: 0;
}
@keyframes ll-twinkle {
  0%,100% { opacity: 0.08; transform: scale(1); }
  50%      { opacity: 1;    transform: scale(1.6); }
}

/* ── floating balls ── */
.ll-ball {
  position: fixed;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  background: radial-gradient(circle at 35% 30%, rgba(255,210,0,.28), rgba(160,90,0,.08));
  border: 1px solid rgba(255,210,0,.18);
  color: rgba(255,210,0,.55);
  animation: ll-float var(--d) ease-in-out infinite var(--dl);
  pointer-events: none;
  z-index: 0;
}
@keyframes ll-float {
  0%,100% { transform: translateY(0)   rotate(0deg); }
  33%      { transform: translateY(-28px) rotate(8deg); }
  66%      { transform: translateY(18px)  rotate(-6deg); }
}

/* ── ambient corners ── */
.ll-glow-tl {
  position: fixed; top:-20%; left:-10%;
  width:560px; height:560px; border-radius:50%;
  background: radial-gradient(circle, rgba(255,180,0,.07) 0%, transparent 70%);
  pointer-events:none; z-index:0;
}
.ll-glow-br {
  position: fixed; bottom:-25%; right:-10%;
  width:640px; height:640px; border-radius:50%;
  background: radial-gradient(circle, rgba(180,0,255,.04) 0%, transparent 70%);
  pointer-events:none; z-index:0;
}

/* ── card reveal ── */
.ll-card-wrap {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 480px;
  animation: ll-reveal .9s cubic-bezier(.16,1,.3,1) both;
}
@keyframes ll-reveal {
  from { opacity:0; transform: translateY(32px) scale(.95); }
  to   { opacity:1; transform: translateY(0)    scale(1);   }
}

/* ── golden border wrapper ── */
.ll-border {
  padding: 1.5px;
  border-radius: 26px;
  background: linear-gradient(135deg, #FFD700, #7c4d00, #FFD700, #5c3700, #FFD700);
  background-size: 300% 300%;
  animation: ll-border-flow 5s ease infinite;
  box-shadow:
    0 0 40px rgba(255,180,0,.14),
    0 40px 80px rgba(0,0,0,.65);
}
@keyframes ll-border-flow {
  0%   { background-position:   0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position:   0% 50%; }
}

/* ── card body ── */
.ll-card {
  background: linear-gradient(155deg, rgba(20,10,40,.97), rgba(8,4,18,.99));
  border-radius: 25px;
  overflow: hidden;
}

/* ── header section ── */
.ll-header {
  position: relative;
  padding: 2.25rem 2rem 2rem;
  text-align: center;
  overflow: hidden;
}
.ll-header::before {
  content: '';
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(255,200,0,.16) 0%, transparent 65%),
    radial-gradient(ellipse at 80% 80%, rgba(255,80,0,.06) 0%, transparent 55%);
}

/* ── spinning ring logo ── */
.ll-logo {
  position: relative;
  width: 82px; height: 82px;
  margin: 0 auto 1.2rem;
}
.ll-ring-outer {
  position: absolute; inset: 0;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #FFD700, #7c4d00, #FFE082, #5c3700, #FFD700);
  animation: ll-spin 7s linear infinite;
  padding: 2.5px;
}
@keyframes ll-spin { to { transform: rotate(360deg); } }
.ll-ring-inner {
  position: absolute;
  inset: 2.5px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #1e0f38, #0b0520);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ll-logo-icon {
  font-size: 2.1rem;
  animation: ll-pulse 2.2s ease-in-out infinite;
}
@keyframes ll-pulse {
  0%,100% { filter: drop-shadow(0 0 6px rgba(255,215,0,.6)); }
  50%      { filter: drop-shadow(0 0 18px rgba(255,215,0,1)) drop-shadow(0 0 36px rgba(255,140,0,.5)); }
}

/* ── header text ── */
.ll-title {
  font-family: 'Noto Sans Lao', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1.1;
  background: linear-gradient(135deg, #FFE082 0%, #FFD700 30%, #FFA000 60%, #FFD700 80%, #FFF8E1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: .2rem;
  position: relative;
}
.ll-subtitle {
  font-family: 'Cinzel', serif;
  font-size: .62rem;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: rgba(255,215,0,.38);
  position: relative;
}
.ll-badge {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  margin-top: .75rem;
  padding: .2rem .9rem;
  background: rgba(255,215,0,.07);
  border: 1px solid rgba(255,215,0,.18);
  border-radius: 100px;
  font-family: 'Cinzel', serif;
  font-size: .58rem;
  letter-spacing: .14em;
  color: rgba(255,215,0,.5);
  position: relative;
}

/* ── ticket perforation ── */
.ll-perf {
  position: relative;
  height: 0;
  margin: 0 -.06rem;
}
.ll-perf::before {
  content: '';
  position: absolute;
  left: 0; right: 0; top: 0;
  border-top: 1.5px dashed rgba(255,215,0,.18);
}
.ll-perf-hole {
  position: absolute;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #060410;
  top: -9px;
  border: 1px solid rgba(255,215,0,.15);
}
.ll-perf-hole.left  { left: -9px; }
.ll-perf-hole.right { right: -9px; }

/* ── form area ── */
.ll-form-area {
  padding: 1.75rem 2rem 2rem;
}

/* ── alerts ── */
.ll-alert {
  display: flex;
  align-items: center;
  gap: .5rem;
  border-radius: 12px;
  padding: .7rem 1rem;
  margin-bottom: 1.25rem;
  font-size: .78rem;
  font-weight: 600;
}
.ll-alert-warn {
  background: rgba(255,160,0,.07);
  border: 1px solid rgba(255,160,0,.22);
  color: rgba(255,190,60,.9);
}
.ll-alert-err {
  background: rgba(220,38,38,.07);
  border: 1px solid rgba(220,38,38,.22);
  color: rgba(248,113,113,.95);
}

/* ── label ── */
.ll-label {
  display: block;
  font-family: 'Cinzel', serif;
  font-size: .6rem;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: rgba(255,215,0,.42);
  margin-bottom: .45rem;
  text-align: left;
}

/* ── input ── */
.ll-field {
  position: relative;
  margin-bottom: 1.25rem;
}
.ll-input-icon {
  position: absolute;
  left: .9rem; top: 50%;
  transform: translateY(-50%);
  font-size: 17px;
  color: rgba(255,215,0,.35);
  pointer-events: none;
}
.ll-input {
  width: 100%;
  box-sizing: border-box;
  background: rgba(255,215,0,.04);
  border: 1px solid rgba(255,215,0,.14);
  border-radius: 14px;
  padding: .875rem 1rem .875rem 2.6rem;
  font-size: .88rem;
  font-weight: 500;
  color: rgba(255,255,255,.88);
  font-family: 'Noto Sans Lao', sans-serif;
  transition: border-color .25s, box-shadow .25s, background .25s;
  outline: none;
}
.ll-input::placeholder { color: rgba(255,215,0,.2); }
.ll-input:focus {
  border-color: rgba(255,215,0,.45);
  background: rgba(255,215,0,.07);
  box-shadow: 0 0 0 3px rgba(255,215,0,.07), 0 0 22px rgba(255,200,0,.06);
}

/* ── submit ── */
.ll-submit {
  position: relative;
  width: 100%;
  overflow: hidden;
  border: none;
  border-radius: 14px;
  padding: 1rem 1.5rem;
  font-size: .95rem;
  font-weight: 800;
  cursor: pointer;
  font-family: 'Noto Sans Lao', sans-serif;
  letter-spacing: .02em;
  color: #1a0c00;
  background: linear-gradient(110deg, #7c4d00, #FFD700, #FFA000, #FFE082, #7c4d00);
  background-size: 250% 250%;
  animation: ll-btn-shift 3.5s ease infinite;
  box-shadow:
    0 4px 22px rgba(255,180,0,.32),
    inset 0 1px 0 rgba(255,255,255,.28),
    inset 0 -1px 0 rgba(0,0,0,.18);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  transition: transform .2s, box-shadow .2s;
  margin-top: .25rem;
}
@keyframes ll-btn-shift {
  0%   { background-position:   0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position:   0% 50%; }
}
.ll-submit::after {
  content: '';
  position: absolute;
  top: 0; left: -120%;
  width: 55%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.32), transparent);
  transform: skewX(-20deg);
  animation: ll-shimmer 2.8s ease-in-out infinite;
}
@keyframes ll-shimmer {
  0%   { left: -120%; }
  100% { left: 220%;  }
}
.ll-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(255,180,0,.42), inset 0 1px 0 rgba(255,255,255,.28);
}
.ll-submit:disabled {
  opacity: .65; cursor: not-allowed;
  animation: none;
}
.ll-submit:disabled::after { display: none; }

.ll-spinner {
  width: 16px; height: 16px;
  border: 2.5px solid rgba(26,12,0,.25);
  border-top-color: rgba(26,12,0,.85);
  border-radius: 50%;
  animation: ll-spin .7s linear infinite;
  flex-shrink: 0;
}

/* ── divider ── */
.ll-divider {
  display: flex;
  align-items: center;
  gap: .9rem;
  margin: 1.4rem 0;
}
.ll-div-line {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,215,0,.18), transparent);
}
.ll-div-txt {
  text-transform: uppercase;
  font-family: 'Cinzel', serif;
  font-size: .58rem;
  letter-spacing: .14em;
  color: rgba(255,215,0,.28);
}

/* ── back link ── */
.ll-back {
  display: block;
  text-align: center;
  font-size: .68rem;
  color: rgba(255,255,255,.18);
  text-decoration: none;
  margin-top: 1rem;
  transition: color .2s;
}
.ll-back:hover { color: rgba(255,215,0,.45); }

/* ── social login btns ── */
.ll-social-btns {
  display: flex;
  flex-direction: column;
  gap: .65rem;
}
.ll-social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .65rem;
  width: 100%;
  padding: .85rem 1rem;
  border-radius: 14px;
  font-size: .84rem;
  font-weight: 700;
  font-family: 'Noto Sans Lao', sans-serif;
  cursor: pointer;
  border: 1px solid rgba(255,215,0,.12);
  background: rgba(255,255,255,.04);
  color: rgba(255,255,255,.78);
  transition: all .3s cubic-bezier(.2,.8,.4,1);
  position: relative;
  overflow: hidden;
}
.ll-social-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity .3s;
}
.ll-social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0,0,0,.35);
}
.ll-social-btn:active {
  transform: translateY(0);
}
.ll-social-btn--google {
  border-color: rgba(255,255,255,.12);
  background: rgba(255,255,255,.06);
}
.ll-social-btn--google:hover {
  border-color: rgba(255,255,255,.28);
  background: rgba(255,255,255,.1);
  box-shadow: 0 6px 24px rgba(66,133,244,.18);
}
.ll-social-btn--facebook {
  border-color: rgba(66,103,178,.2);
  background: rgba(66,103,178,.08);
}
.ll-social-btn--facebook:hover {
  border-color: rgba(66,103,178,.45);
  background: rgba(66,103,178,.15);
  box-shadow: 0 6px 24px rgba(66,103,178,.2);
}
`;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, socialLogin } = useAuth();

  const googleClientRef = useRef(null);
  const [socialLoading, setSocialLoading] = useState(false);

  useEffect(() => {
    const initGoogle = () => {
      if (window.google && window.google.accounts) {
        try {
          googleClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            scope: 'openid email profile',
            callback: async (tokenResponse) => {
              if (tokenResponse && tokenResponse.access_token) {
                await handleSocialLogin('google', tokenResponse.access_token);
              }
            },
          });
        } catch (err) {
          console.error('Failed to initialize Google Client:', err);
        }
      }
    };

    if (window.google) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          initGoogle();
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    const initFacebook = () => {
      if (window.FB) {
        window.FB.init({
          appId      : import.meta.env.VITE_FACEBOOK_APP_ID,
          cookie     : true,
          xfbml      : true,
          version    : 'v18.0'
        });
      }
    };

    if (window.FB) {
      initFacebook();
    } else {
      window.fbAsyncInit = function() {
        initFacebook();
      };
    }
  }, []);

  const handleSocialLogin = async (provider, accessToken) => {
    setSocialLoading(true);
    const result = await socialLogin(provider, { access_token: accessToken });
    if (result.success) {
      toast.success('ເຂົ້າສູ່ລະບົບ ສຳເລັດ!');
      const dest = result.role === 'admin' || result.role === 'staff' ? '/admin' : '/';
      navigate(dest, { replace: true });
    } else {
      toast.error(result.error);
    }
    setSocialLoading(false);
  };

  const handleGoogleLogin = () => {
    if (googleClientRef.current) {
      googleClientRef.current.requestAccessToken();
    } else {
      toast.error('ກຳລັງໂຫຼດລະບົບ Google Login, ກະລຸນາລອງໃໝ່ອີກຄັ້ງ...');
    }
  };

  const handleFacebookLogin = () => {
    if (window.FB) {
      window.FB.login((response) => {
        if (response.authResponse) {
          handleSocialLogin('facebook', response.authResponse.accessToken);
        } else {
          toast.error('ເຂົ້າສູ່ລະບົບດ້ວຍ Facebook ຖືກຍົກເລີກ');
        }
      }, { scope: 'public_profile,email' });
    } else {
      toast.error('ກຳລັງໂຫຼດລະບົບ Facebook Login, ກະລຸນາລອງໃໝ່ອີກຄັ້ງ...');
    }
  };

  const [usernameAvail, setUsernameAvail] = useState(null);
  const [emailAvail, setEmailAvail] = useState(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema), mode: 'onTouched' });

  const watchedUsername = watch('username', '');
  const watchedEmail = watch('email', '');
  const watchedPassword = watch('password', '');

  const debouncedUsername = useDebounce(watchedUsername, 600);
  const debouncedEmail = useDebounce(watchedEmail, 600);

  // Already-logged-in redirect
  useEffect(() => {
    if (!authLoading && user) navigate('/', { replace: true });
  }, [user, authLoading, navigate]);

  // Live username availability
  useEffect(() => {
    const v = debouncedUsername;
    if (!v || v.length < 4 || !/^[a-zA-Z0-9_]+$/.test(v)) {
      setUsernameAvail(null);
      return;
    }
    setCheckingUser(true);
    authService.checkAvailability('username', v).then(({ data }) => {
      setUsernameAvail(data.available ?? null);
      setCheckingUser(false);
    }).catch(() => setCheckingUser(false));
  }, [debouncedUsername]);

  // Live email availability
  useEffect(() => {
    const v = debouncedEmail;
    if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setEmailAvail(null);
      return;
    }
    setCheckingEmail(true);
    authService.checkAvailability('email', v).then(({ data }) => {
      setEmailAvail(data.available ?? null);
      setEmailAvail(data.available ?? null);
      setCheckingEmail(false);
    }).catch(() => setCheckingEmail(false));
  }, [debouncedEmail]);

  const onSubmit = async (data) => {
    if (usernameAvail === false) {
      setError('username', { message: 'Username ນີ້ຖືກໃຊ້ງານແລ້ວ' });
      return;
    }
    if (emailAvail === false) {
      setError('email', { message: 'Email ນີ້ຖືກໃຊ້ງານແລ້ວ' });
      return;
    }

    const result = await authService.register({
      username: data.username,
      full_name: data.full_name,
      email: data.email,
      phone_number: data.phone_number || undefined,
      password: data.password,
    }).catch(() => null);

    if (!result) { toast.error('ເຊື່ອມຕໍ່ server ບໍ່ສຳເລັດ'); return; }

    if (result.ok) {
      toast.success('ສ້າງບັນຊີສຳເລັດ! ກະລຸນາຢືນຢັນ OTP');
      navigate('/verify-otp', {
        state: { userId: result.data.user_id, email: data.email, devOtp: result.data.dev_otp },
      });
    } else {
      const msg = result.data?.error || 'ມີຂໍ້ຜິດພາດ';
      const field = result.data?.field;
      if (field === 'username') setError('username', { message: msg });
      else if (field === 'email') setError('email', { message: msg });
      else toast.error(msg);
    }
  };

  if (authLoading) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="ll-wrap">
        {/* Fixed background overlay */}
        <div className="fixed inset-0 bg-[#060410] -z-20 pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_15%_15%,#1c0e34_0%,transparent_55%)] -z-20 pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_85%_85%,#1a0a08_0%,transparent_55%)] -z-20 pointer-events-none" />

        {/* Ambient corner glows */}
        <div className="ll-glow-tl" />
        <div className="ll-glow-br" />

        {/* Star field */}
        {STARS.map(s => (
          <div
            key={s.id}
            className="ll-star"
            style={{
              left: `${s.x}%`, top: `${s.y}%`,
              width: `${s.s}px`, height: `${s.s}px`,
              '--d': `${s.dur}s`, '--dl': `${s.delay}s`,
            }}
          />
        ))}

        {/* Floating lottery balls */}
        {BALLS.map(b => (
          <div
            key={b.id}
            className="ll-ball"
            style={{
              left: `${b.x}%`, top: `${b.y}%`,
              width: `${b.size}px`, height: `${b.size}px`,
              fontSize: `${b.size * 0.34}px`,
              opacity: b.op,
              '--d': `${b.dur}s`, '--dl': `${b.delay}s`,
            }}
          >
            {b.num}
          </div>
        ))}

        {/* ── Card ── */}
        <div className="ll-card-wrap">
          <div className="ll-border">
            <div className="ll-card">

              {/* Header */}
              <div className="ll-header">
                <div className="ll-logo">
                  <div className="ll-ring-outer" />
                  <div className="ll-ring-inner">
                    <span className="ll-logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38 }}>
                      <svg viewBox="0 0 38 38" style={{ width: '100%', height: '100%', display: 'block' }}>
                        <defs>
                          <clipPath id="circleClipRegister">
                            <circle cx="19" cy="19" r="17" />
                          </clipPath>
                          <linearGradient id="goldStripeRegister" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#A67C1E" />
                            <stop offset="50%" stopColor="#F5D77F" />
                            <stop offset="100%" stopColor="#A67C1E" />
                          </linearGradient>
                          <linearGradient id="darkStripeRegister" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#0F1326" />
                            <stop offset="50%" stopColor="#1E2548" />
                            <stop offset="100%" stopColor="#0F1326" />
                          </linearGradient>
                          <radialGradient id="goldCircleRegister" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#FFFDF5" />
                            <stop offset="70%" stopColor="#F3D072" />
                            <stop offset="100%" stopColor="#C99E32" />
                          </radialGradient>
                        </defs>
                        <g clipPath="url(#circleClipRegister)">
                          <rect x="0" y="0" width="38" height="9.5" fill="url(#goldStripeRegister)" />
                          <rect x="0" y="9.5" width="38" height="19" fill="url(#darkStripeRegister)" />
                          <rect x="0" y="28.5" width="38" height="9.5" fill="url(#goldStripeRegister)" />
                          <circle cx="19" cy="19" r="6.5" fill="url(#goldCircleRegister)" />
                        </g>
                      </svg>
                    </span>
                  </div>
                </div>
                <h1 className="ll-title">ສ້າງບັນຊີໃໝ່</h1>
                <p className="ll-subtitle">Lao Lottery Live System</p>
                <div className="ll-badge">✦ &nbsp;FORTUNE AWAITS&nbsp; ✦</div>
              </div>

              {/* Ticket perforation */}
              <div className="ll-perf">
                <div className="ll-perf-hole left" />
                <div className="ll-perf-hole right" />
              </div>

              {/* Form */}
              <div className="ll-form-area">
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

                  {/* Username */}
                  <div>
                    <label className="ll-label">
                      Username <span className="text-red-400 normal-case font-bold text-[10px]">* a-z 0-9 _ (4-20 ຕົວ)</span>
                    </label>
                    <div className="ll-field">
                      <span className="material-symbols-outlined ll-input-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
                        person
                      </span>
                      <input
                        {...register('username')}
                        placeholder="ປ້ອນ username"
                        autoComplete="username"
                        spellCheck={false}
                        className={`ll-input ${errors.username ? '!border-red-500/40 focus:!border-red-500 focus:!ring-red-500/20' : ''}`}
                      />
                      <div className="absolute right-3 top-[1.05rem] -translate-y-1/2">
                        <AvailBadge checking={checkingUser} available={errors.username ? null : usernameAvail} />
                      </div>
                      <FieldHint error={errors.username?.message} available={errors.username ? null : usernameAvail} takenMsg="Username ນີ້ຖືກໃຊ້ງານແລ້ວ" />
                    </div>
                  </div>

                  {/* Full name */}
                  <div>
                    <label className="ll-label">
                      ຊື່-ນາມສະກຸນ <span className="text-red-400">*</span>
                    </label>
                    <div className="ll-field">
                      <span className="material-symbols-outlined ll-input-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
                        badge
                      </span>
                      <input
                        {...register('full_name')}
                        placeholder="ປ້ອນຊື່ ແລະ ນາມສະກຸນ"
                        autoComplete="name"
                        className={`ll-input ${errors.full_name ? '!border-red-500/40 focus:!border-red-500 focus:!ring-red-500/20' : ''}`}
                      />
                      {errors.full_name && (
                        <p className="mt-1.5 text-[11px] text-red-400 font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                          {errors.full_name.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="ll-label">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <div className="ll-field">
                      <span className="material-symbols-outlined ll-input-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
                        mail
                      </span>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="example@email.com"
                        autoComplete="email"
                        className={`ll-input ${errors.email ? '!border-red-500/40 focus:!border-red-500 focus:!ring-red-500/20' : ''}`}
                      />
                      <div className="absolute right-3 top-[1.05rem] -translate-y-1/2">
                        <AvailBadge checking={checkingEmail} available={errors.email ? null : emailAvail} />
                      </div>
                      <FieldHint error={errors.email?.message} available={errors.email ? null : emailAvail} takenMsg="Email ນີ້ຖືກໃຊ້ງານແລ້ວ" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="ll-label">
                      ເບີໂທ <span className="normal-case font-bold text-[#d4af37]/50 text-[10px]">(ບໍ່ບັງຄັບ 020XXXXXXXX)</span>
                    </label>
                    <div className="ll-field">
                      <span className="material-symbols-outlined ll-input-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
                        phone
                      </span>
                      <input
                        {...register('phone_number')}
                        type="tel"
                        placeholder="020XXXXXXXX"
                        autoComplete="tel"
                        className={`ll-input ${errors.phone_number ? '!border-red-500/40 focus:!border-red-500 focus:!ring-red-500/20' : ''}`}
                      />
                      {errors.phone_number && (
                        <p className="mt-1.5 text-[11px] text-red-400 font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                          {errors.phone_number.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <PasswordInput
                      {...register('password')}
                      label="ລະຫັດຜ່ານ *"
                      placeholder="ຢ່າງໜ້ອຍ 8 ຕົວ + ໂຕໃຫຍ່ + ຕົວເລກ + ໂຕພິເສດ"
                      autoComplete="new-password"
                      error={errors.password?.message}
                    />
                    <PasswordStrengthMeter password={watchedPassword} />
                  </div>

                  {/* Confirm password */}
                  <div>
                    <PasswordInput
                      {...register('confirm_password')}
                      label="ຢືນຢັນລະຫັດຜ່ານ *"
                      placeholder="ປ້ອນລະຫັດຜ່ານອີກຄັ້ງ"
                      autoComplete="new-password"
                      error={errors.confirm_password?.message}
                    />
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="ll-submit"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="ll-spinner" />
                          ກຳລັງສ້າງບັນຊີ...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">person_add</span>
                          ສ້າງບັນຊີ
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-sm text-white/50 pt-2 font-medium">
                    ມີບັນຊີແລ້ວ?{' '}
                    <Link to="/login" className="text-[#d4af37] font-black hover:underline ml-1">
                      ເຂົ້າສູ່ລະບົບ
                    </Link>
                  </p>
                </form>

                <div className="ll-divider">
                  <div className="ll-div-line" />
                  <span className="ll-div-txt">ສະໝັກດ້ວຍ</span>
                  <div className="ll-div-line" />
                </div>

                {/* Social login buttons */}
                <div className="ll-social-btns">
                  <button
                    type="button"
                    className="ll-social-btn ll-social-btn--google"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting || socialLoading}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    ສະໝັກດ້ວຍ Google
                  </button>

                  <button
                    type="button"
                    className="ll-social-btn ll-social-btn--facebook"
                    onClick={handleFacebookLogin}
                    disabled={isSubmitting || socialLoading}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
                    </svg>
                    ສະໝັກດ້ວຍ Facebook
                  </button>
                </div>

                <Link to="/home" className="ll-back">← ກັບໄປໜ້າຫຼັກ</Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
