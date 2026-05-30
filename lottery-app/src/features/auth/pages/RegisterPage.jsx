import { useEffect, useState, useCallback } from 'react';
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
    <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin block" />
  );
  if (available === true) return (
    <span className="material-symbols-outlined text-[18px] text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>
      check_circle
    </span>
  );
  if (available === false) return (
    <span className="material-symbols-outlined text-[18px] text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>
      cancel
    </span>
  );
  return null;
}

// ── Field error / hint ─────────────────────────────────────────────
function FieldHint({ error, available, takenMsg }) {
  if (error)                    return <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1"><span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>{error}</p>;
  if (available === false)      return <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1"><span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>{takenMsg}</p>;
  if (available === true)       return <p className="mt-1.5 text-xs text-emerald-500 font-medium flex items-center gap-1"><span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>ສາມາດໃຊ້ງານໄດ້</p>;
  return null;
}

export default function RegisterPage() {
  const navigate             = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [usernameAvail,   setUsernameAvail]   = useState(null);
  const [emailAvail,      setEmailAvail]      = useState(null);
  const [checkingUser,    setCheckingUser]    = useState(false);
  const [checkingEmail,   setCheckingEmail]   = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema), mode: 'onTouched' });

  const watchedUsername = watch('username', '');
  const watchedEmail    = watch('email', '');
  const watchedPassword = watch('password', '');

  const debouncedUsername = useDebounce(watchedUsername, 600);
  const debouncedEmail    = useDebounce(watchedEmail,    600);

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
      username:     data.username,
      full_name:    data.full_name,
      email:        data.email,
      phone_number: data.phone_number || undefined,
      password:     data.password,
    }).catch(() => null);

    if (!result) { toast.error('ເຊື່ອມຕໍ່ server ບໍ່ສຳເລັດ'); return; }

    if (result.ok) {
      toast.success('ສ້າງບັນຊີສຳເລັດ! ກະລຸນາຢືນຢັນ OTP');
      navigate('/verify-otp', {
        state: { userId: result.data.user_id, email: data.email, devOtp: result.data.dev_otp },
      });
    } else {
      const msg   = result.data?.error || 'ມີຂໍ້ຜິດພາດ';
      const field = result.data?.field;
      if (field === 'username') setError('username', { message: msg });
      else if (field === 'email') setError('email', { message: msg });
      else toast.error(msg);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_60%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,rgba(56,189,248,0.06),transparent_60%)]" />

      <div className="w-full max-w-lg relative">
        {/* Card */}
<div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 border border-border/60 ring-1 ring-white/[0.05] overflow-hidden">

          {/* ── Header ───────────────────────────────────────────── */}
          <div className="relative px-8 py-8 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#09090b] via-[#0e0e16] to-[#0d0d13]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.25),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(56,189,248,0.12),transparent_60%)]" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.07] backdrop-blur-xl flex items-center justify-center mx-auto mb-4 border border-white/[0.15] shadow-lg shadow-violet-500/10">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  person_add
                </span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">ສ້າງບັນຊີໃໝ່</h1>
              <p className="text-white/60 text-sm mt-1">Lao Lottery Live — ລົງທະບຽນສະມາຊິກ</p>
            </div>
          </div>

          {/* ── Form ─────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-8 py-7 space-y-5">

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">
                Username <span className="text-red-500 normal-case font-normal text-[11px]">* 4-20 ຕົວ a-z 0-9 _</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-muted-foreground/60">
                  person
                </span>
                <input
                  {...register('username')}
                  placeholder="ປ້ອນ username"
                  autoComplete="username"
                  spellCheck={false}
                  className={`w-full bg-muted/40 backdrop-blur-sm border border-border/60 rounded-xl pl-9 pr-10 py-3 text-sm font-medium
                    text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all
                    ${errors.username
                      ? 'ring-2 ring-red-400/60 border-red-400/60'
                      : 'focus:ring-primary/30 focus:border-primary/40'
                    }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AvailBadge checking={checkingUser} available={errors.username ? null : usernameAvail} />
                </div>
              </div>
              <FieldHint error={errors.username?.message} available={errors.username ? null : usernameAvail} takenMsg="Username ນີ້ຖືກໃຊ້ງານແລ້ວ" />
            </div>

            {/* Full name */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">
                ຊື່-ນາມສະກຸນ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-muted-foreground/60">
                  badge
                </span>
                <input
                  {...register('full_name')}
                  placeholder="ປ້ອນຊື່ ແລະ ນາມສະກຸນ"
                  autoComplete="name"
                  className={`w-full bg-muted/40 backdrop-blur-sm border border-border/60 rounded-xl pl-9 pr-4 py-3 text-sm font-medium
                    text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all
                    ${errors.full_name ? 'ring-2 ring-red-400/60 border-red-400/60' : 'focus:ring-primary/30 focus:border-primary/40'}`}
                />
              </div>
              {errors.full_name && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-muted-foreground/60">
                  mail
                </span>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="example@email.com"
                  autoComplete="email"
                  className={`w-full bg-muted/40 backdrop-blur-sm border border-border/60 rounded-xl pl-9 pr-10 py-3 text-sm font-medium
                    text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all
                    ${errors.email
                      ? 'ring-2 ring-red-400/60 border-red-400/60'
                      : 'focus:ring-primary/30 focus:border-primary/40'
                    }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AvailBadge checking={checkingEmail} available={errors.email ? null : emailAvail} />
                </div>
              </div>
              <FieldHint error={errors.email?.message} available={errors.email ? null : emailAvail} takenMsg="Email ນີ້ຖືກໃຊ້ງານແລ້ວ" />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">
                ເບີໂທ{' '}
                <span className="normal-case font-normal text-muted-foreground/60 text-[11px]">(ບໍ່ບັງຄັບ)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-muted-foreground/60">
                  phone
                </span>
                <input
                  {...register('phone_number')}
                  type="tel"
                  placeholder="020XXXXXXXX"
                  autoComplete="tel"
                  className={`w-full bg-muted/40 backdrop-blur-sm border border-border/60 rounded-xl pl-9 pr-4 py-3 text-sm font-medium
                    text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all
                    ${errors.phone_number ? 'ring-2 ring-red-400/60 border-red-400/60' : 'focus:ring-primary/30 focus:border-primary/40'}`}
                />
              </div>
              {errors.phone_number && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                  {errors.phone_number.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
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
            <PasswordInput
              {...register('confirm_password')}
              label="ຢືນຢັນລະຫັດຜ່ານ *"
              placeholder="ປ້ອນລະຫັດຜ່ານອີກຄັ້ງ"
              autoComplete="new-password"
              error={errors.confirm_password?.message}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold
                text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200
                shadow-md shadow-primary/20 disabled:opacity-50 disabled:transform-none
                flex items-center justify-center gap-2 mt-1"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ກຳລັງສ້າງບັນຊີ...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  ສ້າງບັນຊີ
                </>
              )}
            </button>

            <p className="text-center text-sm text-muted-foreground pt-1">
              ມີບັນຊີແລ້ວ?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                ເຂົ້າສູ່ລະບົບ
              </Link>
            </p>
          </form>
        </div>

        <div className="text-center mt-5">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
            ← ກັບໄປໜ້າຫຼັກ
          </Link>
        </div>
      </div>
    </div>
  );
}
