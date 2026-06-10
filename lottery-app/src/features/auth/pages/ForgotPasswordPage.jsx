import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { forgotPasswordSchema } from '../schemas/authSchemas';

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
`;

export default function ForgotPasswordPage() {
  const [sent,           setSent]           = useState(false);
  const [devToken,       setDevToken]       = useState(null);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data) => {
    const result = await authService.forgotPassword(data.email).catch(() => null);
    if (!result) { toast.error('ເຊື່ອມຕໍ່ server ບໍ່ສຳເລັດ'); return; }
    if (result.ok) {
      setSubmittedEmail(data.email);
      setDevToken(result.data.dev_token ?? null);
      setSent(true);
    } else {
      toast.error(result.data?.error || 'ມີຂໍ້ຜິດພາດ');
    }
  };

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
                          <clipPath id="circleClipForgot">
                            <circle cx="19" cy="19" r="17" />
                          </clipPath>
                          <linearGradient id="goldStripeForgot" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#A67C1E" />
                            <stop offset="50%" stopColor="#F5D77F" />
                            <stop offset="100%" stopColor="#A67C1E" />
                          </linearGradient>
                          <linearGradient id="darkStripeForgot" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#0F1326" />
                            <stop offset="50%" stopColor="#1E2548" />
                            <stop offset="100%" stopColor="#0F1326" />
                          </linearGradient>
                          <radialGradient id="goldCircleForgot" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#FFFDF5" />
                            <stop offset="70%" stopColor="#F3D072" />
                            <stop offset="100%" stopColor="#C99E32" />
                          </radialGradient>
                        </defs>
                        <g clipPath="url(#circleClipForgot)">
                          <rect x="0" y="0" width="38" height="9.5" fill="url(#goldStripeForgot)" />
                          <rect x="0" y="9.5" width="38" height="19" fill="url(#darkStripeForgot)" />
                          <rect x="0" y="28.5" width="38" height="9.5" fill="url(#goldStripeForgot)" />
                          <circle cx="19" cy="19" r="6.5" fill="url(#goldCircleForgot)" />
                        </g>
                      </svg>
                    </span>
                  </div>
                </div>
                <h1 className="ll-title">ລືມລະຫັດຜ່ານ</h1>
                <p className="ll-subtitle">Lao Lottery Live System</p>
                <div className="ll-badge">✦ &nbsp;FORTUNE AWAITS&nbsp; ✦</div>
              </div>

              {/* Ticket perforation */}
              <div className="ll-perf">
                <div className="ll-perf-hole left" />
                <div className="ll-perf-hole right" />
              </div>

              <div className="ll-form-area">
                {sent ? (
                  /* ── Success state ───────────────────────────────────── */
                  <div className="text-center py-4 space-y-6">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                      <span className="material-symbols-outlined text-emerald-400 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        mark_email_read
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white">ສົ່ງລິ້ງສຳເລັດ!</h2>
                      <p className="text-sm text-white/60 mt-2 leading-relaxed">
                        ກວດ Email ທີ່{' '}
                        <span className="font-bold text-white">{submittedEmail}</span>
                        {' '}ເພື່ອຮັບລິ້ງລີເຊັດລະຫັດຜ່ານ (ໝົດອາຍຸ 1 ຊົ່ວໂມງ)
                      </p>
                    </div>

                    {/* DEV reset token */}
                    {devToken && (
                      <div className="bg-black/35 border border-[#d4af37]/20 rounded-xl p-4 text-left shadow-inner">
                        <p className="text-xs font-bold text-[#d4af37] mb-1.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>developer_mode</span>
                          DEV MODE — Reset Token
                        </p>
                        <p className="text-[11px] font-mono text-white/50 break-all leading-relaxed bg-black/25 p-2 rounded border border-white/[0.03]">
                          {devToken}
                        </p>
                        <Link
                          to={`/reset-password?token=${devToken}`}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#d4af37] hover:underline"
                        >
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          ຄລິກລີເຊັດລະຫັດຜ່ານ (dev)
                        </Link>
                      </div>
                    )}

                    <div className="pt-2">
                      <Link
                        to="/login"
                        className="ll-register"
                      >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        ກັບໄປໜ້າ Login
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* ── Form ─────────────────────────────────────────────── */
                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                    <p className="text-sm text-white/60 text-left leading-relaxed">
                      ປ້ອນ Email ທີ່ທ່ານໃຊ້ລົງທະບຽນ ເຮົາຈະສົ່ງລິ້ງລີເຊັດລະຫັດຜ່ານໃຫ້ທ່ານ
                    </p>

                    <div>
                      <label className="ll-label">
                        Email Address
                      </label>
                      <div className="ll-field">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#d4af37]/45">
                          mail
                        </span>
                        <input
                          {...register('email')}
                          type="email"
                          placeholder="example@email.com"
                          autoComplete="email"
                          className={`ll-input ${errors.email ? '!border-red-500/40 focus:!border-red-500 focus:!ring-red-500/20' : ''}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1.5 text-xs text-red-400 font-bold flex items-center gap-1 text-left">
                          <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="ll-submit"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="ll-spinner" />
                          ກຳລັງສົ່ງ...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">send</span>
                          ສົ່ງລິ້ງລີເຊັດ
                        </>
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <Link to="/login" className="text-sm text-white/35 hover:text-[#d4af37] transition-colors font-medium">
                        ← ກັບໄປ Login
                      </Link>
                    </div>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
