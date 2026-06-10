import { useState, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import OTPInput from '../components/OTPInput';
import CountdownTimer from '../components/CountdownTimer';

const OTP_DURATION  = 600; // 10 minutes
const MAX_ATTEMPTS  = 5;

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
  max-width: 440px;
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

/* ── register btn ── */
.ll-register {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  width: 100%;
  padding: .9rem;
  border-radius: 14px;
  border: 1px solid rgba(255,215,0,.18);
  background: rgba(255,215,0,.04);
  color: rgba(255,215,0,.65);
  font-size: .875rem;
  font-weight: 700;
  text-decoration: none;
  font-family: 'Noto Sans Lao', sans-serif;
  transition: all .3s ease;
}
.ll-register:hover {
  background: rgba(255,215,0,.1);
  border-color: rgba(255,215,0,.38);
  color: #FFD700;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(255,180,0,.12);
}
`;

function BgCard({ children }) {
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
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function VerifyOTPPage() {
  const { state } = useLocation();

  const userId = state?.userId;
  const email  = state?.email;
  const devOtp = state?.devOtp;

  const [otp,        setOtp]        = useState('');
  const [loading,    setLoading]    = useState(false);
  const [expired,    setExpired]    = useState(false);
  const [resending,  setResending]  = useState(false);
  const [attempts,   setAttempts]   = useState(0);
  const [error,      setError]      = useState('');
  const [timerKey,   setTimerKey]   = useState(0);
  const [devOtpNew,  setDevOtpNew]  = useState(null);

  // Guard: no state → redirect hint
  if (!userId) {
    return (
      <BgCard>
        {/* Header */}
        <div className="ll-header">
          <div className="ll-logo">
            <div className="ll-ring-outer" />
            <div className="ll-ring-inner">
              <span className="ll-logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38 }}>
                <svg viewBox="0 0 38 38" style={{ width: '100%', height: '100%', display: 'block' }}>
                  <defs>
                    <clipPath id="circleClipVerifyOTP1">
                      <circle cx="19" cy="19" r="17" />
                    </clipPath>
                    <linearGradient id="goldStripeVerifyOTP1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#A67C1E" />
                      <stop offset="50%" stopColor="#F5D77F" />
                      <stop offset="100%" stopColor="#A67C1E" />
                    </linearGradient>
                    <linearGradient id="darkStripeVerifyOTP1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0F1326" />
                      <stop offset="50%" stopColor="#1E2548" />
                      <stop offset="100%" stopColor="#0F1326" />
                    </linearGradient>
                    <radialGradient id="goldCircleVerifyOTP1" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FFFDF5" />
                      <stop offset="70%" stopColor="#F3D072" />
                      <stop offset="100%" stopColor="#C99E32" />
                    </radialGradient>
                  </defs>
                  <g clipPath="url(#circleClipVerifyOTP1)">
                    <rect x="0" y="0" width="38" height="9.5" fill="url(#goldStripeVerifyOTP1)" />
                    <rect x="0" y="9.5" width="38" height="19" fill="url(#darkStripeVerifyOTP1)" />
                    <rect x="0" y="28.5" width="38" height="9.5" fill="url(#goldStripeVerifyOTP1)" />
                    <circle cx="19" cy="19" r="6.5" fill="url(#goldCircleVerifyOTP1)" />
                  </g>
                </svg>
              </span>
            </div>
          </div>
          <h1 className="ll-title">Session ໝົດອາຍຸ</h1>
          <p className="ll-subtitle">Lao Lottery Live System</p>
        </div>

        {/* Perforation */}
        <div className="ll-perf">
          <div className="ll-perf-hole left" />
          <div className="ll-perf-hole right" />
        </div>

        <div className="ll-form-area text-center py-4 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto border border-white/[0.08] text-white/45">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              hourglass_disabled
            </span>
          </div>
          <p className="text-sm text-white/50">Session ການລົງທະບຽນໝົດອາຍຸແລ້ວ</p>
          <div className="pt-2">
            <Link
              to="/register"
              className="ll-register"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              ສ້າງບັນຊີໃໝ່
            </Link>
          </div>
        </div>
      </BgCard>
    );
  }

  const maskedEmail = email
    ? email.replace(/^(.{2}).+(@.+)$/, '$1***$2')
    : '';

  const locked = attempts >= MAX_ATTEMPTS;
  const effectiveDevOtp = devOtpNew ?? devOtp;

  const handleVerify = async () => {
    if (otp.length !== 6) { setError('ກະລຸນາປ້ອນ OTP ໃຫ້ຄົບ 6 ຕົວ'); return; }
    if (expired)           { setError('OTP ໝົດອາຍຸແລ້ວ ກະລຸນາຂໍ OTP ໃໝ່'); return; }
    if (locked)            { setError('ລອງ OTP ຫຼາຍເກີນໄປ ກະລຸນາຂໍ OTP ໃໝ່'); return; }

    setLoading(true);
    setError('');

    const result = await authService.verifyOTP(userId, otp).catch(() => null);

    if (!result) {
      setLoading(false);
      setError('ເຊື່ອມຕໍ່ server ບໍ່ສຳເລັດ');
      return;
    }

    if (result.ok) {
      const { token, user } = result.data;
      localStorage.setItem('lao_lottery_token', token);
      localStorage.setItem('lao_lottery_user', JSON.stringify(user));
      toast.success(`ຍິນດີຕ້ອນຮັບ ${user.name}!`);
      window.location.replace('/');
    } else {
      const newAtt = attempts + 1;
      setAttempts(newAtt);
      setOtp('');
      if (newAtt >= MAX_ATTEMPTS) {
        setError('ລອງ OTP ຜິດ 5 ຄັ້ງ ກະລຸນາຂໍ OTP ໃໝ່');
      } else {
        setError(result.data?.error || `OTP ບໍ່ຖືກຕ້ອງ (ຍັງເຫຼືອ ${MAX_ATTEMPTS - newAtt} ຄັ້ງ)`);
      }
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');

    const result = await authService.resendOTP(userId).catch(() => null);

    if (!result) {
      toast.error('ເຊື່ອມຕໍ່ server ບໍ່ສຳເລັດ');
    } else if (result.ok) {
      setExpired(false);
      setAttempts(0);
      setOtp('');
      setDevOtpNew(result.data.dev_otp ?? null);
      setTimerKey(k => k + 1);
      toast.success('ສົ່ງ OTP ໃໝ່ສຳເລັດ');
    } else {
      toast.error(result.data?.error || 'ຂໍ OTP ໃໝ່ບໍ່ສຳເລັດ');
    }

    setResending(false);
  };

  const canResend = expired || locked;

  return (
    <BgCard>
      {/* Header */}
      <div className="ll-header">
        <div className="ll-logo">
          <div className="ll-ring-outer" />
          <div className="ll-ring-inner">
            <span className="ll-logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38 }}>
              <svg viewBox="0 0 38 38" style={{ width: '100%', height: '100%', display: 'block' }}>
                <defs>
                  <clipPath id="circleClipVerifyOTP2">
                    <circle cx="19" cy="19" r="17" />
                  </clipPath>
                  <linearGradient id="goldStripeVerifyOTP2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#A67C1E" />
                    <stop offset="50%" stopColor="#F5D77F" />
                    <stop offset="100%" stopColor="#A67C1E" />
                  </linearGradient>
                  <linearGradient id="darkStripeVerifyOTP2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0F1326" />
                    <stop offset="50%" stopColor="#1E2548" />
                    <stop offset="100%" stopColor="#0F1326" />
                  </linearGradient>
                  <radialGradient id="goldCircleVerifyOTP2" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFDF5" />
                    <stop offset="70%" stopColor="#F3D072" />
                    <stop offset="100%" stopColor="#C99E32" />
                  </radialGradient>
                </defs>
                <g clipPath="url(#circleClipVerifyOTP2)">
                  <rect x="0" y="0" width="38" height="9.5" fill="url(#goldStripeVerifyOTP2)" />
                  <rect x="0" y="9.5" width="38" height="19" fill="url(#darkStripeVerifyOTP2)" />
                  <rect x="0" y="28.5" width="38" height="9.5" fill="url(#goldStripeVerifyOTP2)" />
                  <circle cx="19" cy="19" r="6.5" fill="url(#goldCircleVerifyOTP2)" />
                </g>
              </svg>
            </span>
          </div>
        </div>
        <h1 className="ll-title">ຢືນຢັນ OTP</h1>
        <p className="ll-subtitle">Lao Lottery Live System</p>
        <p className="text-white/60 text-xs mt-2 leading-relaxed">
          ສົ່ງລະຫັດ OTP ໄປຍັງ <span className="text-white font-black">{maskedEmail}</span>
        </p>
      </div>

      {/* Ticket perforation */}
      <div className="ll-perf">
        <div className="ll-perf-hole left" />
        <div className="ll-perf-hole right" />
      </div>

      <div className="ll-form-area space-y-5">
        {/* DEV hint */}
        {effectiveDevOtp && (
          <div className="flex items-start gap-2.5 bg-black/35 border border-[#d4af37]/20 rounded-xl px-4 py-3 shadow-inner text-left">
            <span className="material-symbols-outlined text-[#d4af37] text-[18px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              developer_mode
            </span>
            <div>
              <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-wider">DEV MODE — OTP Code</p>
              <p className="text-xs text-white/80 font-black mt-1">
                OTP: <span className="font-mono tracking-[0.3em] font-black">{effectiveDevOtp}</span>
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-left">
            <span className="material-symbols-outlined text-red-400 text-[18px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              error
            </span>
            <p className="text-xs font-bold text-red-400">{error}</p>
          </div>
        )}

        {/* Timer row */}
        <div className="flex items-center justify-between bg-black/25 rounded-xl border border-white/[0.04] px-4 py-3 text-left">
          <p className="text-xs font-black text-white/45 uppercase tracking-wide">OTP ໝົດອາຍຸໃນ:</p>
          {expired ? (
            <span className="text-xs font-black text-red-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
              ໝົດອາຍຸແລ້ວ
            </span>
          ) : (
            <div className="text-xs font-black text-[#d4af37] flex items-center gap-1">
              <CountdownTimer
                key={timerKey}
                seconds={OTP_DURATION}
                onExpire={() => { setExpired(true); setError('OTP ໝົດອາຍຸ ກະລຸນາຂໍ OTP ໃໝ່'); }}
              />
            </div>
          )}
        </div>

        {/* OTP input */}
        <div className="py-2 text-center">
          <p className="text-center text-xs font-black text-white/35 uppercase tracking-wider mb-4">
            ປ້ອນລະຫັດ 6 ຕົວ
          </p>
          <OTPInput
            value={otp}
            onChange={setOtp}
            disabled={loading || expired || locked}
          />
          {/* Attempt dots */}
          {attempts > 0 && !locked && (
            <div className="flex justify-center gap-2 mt-5 select-none">
              {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    i < attempts ? 'bg-red-400 shadow-[0_0_6px_#f87171]' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Verify */}
        <button
          onClick={handleVerify}
          disabled={loading || otp.replace(/\s/g, '').length !== 6 || expired || locked}
          className="ll-submit cursor-pointer"
        >
          {loading ? (
            <>
              <div className="ll-spinner" />
              ກຳລັງຢືນຢັນ...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">verified</span>
              ຢືນຢັນ OTP
            </>
          )}
        </button>

        {/* Resend */}
        <div className="text-center pt-2 border-t border-white/[0.04]">
          <p className="text-[10px] font-black text-white/35 uppercase tracking-wider mb-2.5">ບໍ່ໄດ້ຮັບ OTP ຫຼື OTP ໝົດອາຍຸ?</p>
          <button
            onClick={handleResend}
            disabled={resending || !canResend}
            className="inline-flex items-center gap-1.5 text-xs text-[#d4af37]
              font-black hover:underline disabled:opacity-30 disabled:no-underline transition-all cursor-pointer"
          >
            {resending ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin shrink-0" />
                ກຳລັງສົ່ງ...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                ຂໍ OTP ໃໝ່
              </>
            )}
          </button>
          {!canResend && (
            <p className="text-[10px] text-white/35 font-bold mt-1.5">✦ ສາມາດຂໍໃໝ່ໄດ້ຫຼັງ OTP ໝົດອາຍຸ</p>
          )}
        </div>

        <div className="text-center pt-2 border-t border-white/[0.04]">
          <Link to="/register" className="text-sm text-white/35 hover:text-[#d4af37] transition-colors font-medium">
            ← ກັບໄປສ້າງບັນຊີໃໝ່
          </Link>
        </div>
      </div>
    </BgCard>
  );
}
