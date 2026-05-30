import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { forgotPasswordSchema } from '../schemas/authSchemas';

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
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_60%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,rgba(56,189,248,0.06),transparent_60%)]" />

      <div className="w-full max-w-md relative">
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 border border-border/60 ring-1 ring-white/[0.05] overflow-hidden">

          {/* Header */}
          <div className="relative px-8 py-8 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#09090b] via-[#0e0e16] to-[#0d0d13]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.25),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(56,189,248,0.12),transparent_60%)]" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.07] backdrop-blur-xl flex items-center justify-center mx-auto mb-4 border border-white/[0.15] shadow-lg shadow-violet-500/10">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  lock_reset
                </span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">ລືມລະຫັດຜ່ານ</h1>
              <p className="text-white/50 text-sm mt-1">ກະລຸນາໃສ່ Email ທີ່ລົງທະບຽນໄວ້</p>
            </div>
          </div>

          <div className="px-8 py-7">
            {sent ? (
              /* ── Success state ───────────────────────────────────── */
              <div className="text-center py-4 space-y-5">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <span className="material-symbols-outlined text-emerald-500 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    mark_email_read
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-foreground">ສົ່ງສຳເລັດ!</h2>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    ກວດ Email ທີ່{' '}
                    <span className="font-bold text-foreground">{submittedEmail}</span>
                    {' '}ເພື່ອຮັບລິ້ງລີເຊັດລະຫັດຜ່ານ (ໝົດອາຍຸ 1 ຊົ່ວໂມງ)
                  </p>
                </div>

                {/* DEV reset token */}
                {devToken && (
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 text-left">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-400 mb-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>developer_mode</span>
                      DEV MODE — Reset Token
                    </p>
                    <p className="text-[11px] font-mono text-amber-700 dark:text-amber-300 break-all leading-relaxed">
                      {devToken}
                    </p>
                    <Link
                      to={`/reset-password?token=${devToken}`}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      ຄລິກລີເຊັດລະຫັດຜ່ານ (dev)
                    </Link>
                  </div>
                )}

                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-primary font-bold hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  ກັບໄປໜ້າ Login
                </Link>
              </div>
            ) : (
              /* ── Form ─────────────────────────────────────────────── */
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  ປ້ອນ Email ທີ່ທ່ານໃຊ້ລົງທະບຽນ ເຮົາຈະສົ່ງລິ້ງລີເຊັດລະຫັດຜ່ານໃຫ້ທ່ານ
                </p>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">
                    Email Address
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
                      className={`w-full bg-muted/40 backdrop-blur-sm border border-border/60 rounded-xl pl-9 pr-4 py-3 text-sm font-medium
                        text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all
                        ${errors.email ? 'ring-2 ring-red-400/60 border-red-400/60' : 'focus:ring-primary/30 focus:border-primary/40'}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl
                    font-bold text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200
                    shadow-md shadow-primary/20 disabled:opacity-50 disabled:transform-none
                    flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ກຳລັງສົ່ງ...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      ສົ່ງລິ້ງລີເຊັດ
                    </>
                  )}
                </button>

                <div className="text-center">
                  <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                    ← ກັບໄປ Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
