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
    <div className="min-h-screen bg-gradient-to-br from-[#001d6e] via-[#003fb1] to-[#1a56db] flex items-center justify-center px-4 py-10">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-white/[0.04] blur-3xl" />
        <div className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full bg-white/[0.04] blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-card rounded-3xl shadow-2xl overflow-hidden border border-white/10">

          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#001d6e] to-[#1a56db] px-8 py-8 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-20 translate-x-20" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-lg">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  lock_reset
                </span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">ລືມລະຫັດຜ່ານ</h1>
              <p className="text-white/60 text-sm mt-1">ກະລຸນາໃສ່ Email ທີ່ລົງທະບຽນໄວ້</p>
            </div>
          </div>

          <div className="px-8 py-7">
            {sent ? (
              /* ── Success state ───────────────────────────────────── */
              <div className="text-center py-4 space-y-5">
                <div className="w-20 h-20 rounded-full bg-[#e8f5e9] dark:bg-[#006c49]/20 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[#006c49] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    mark_email_read
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-foreground">ສົ່ງສຳເລັດ!</h2>
                  <p className="text-sm text-[#737686] mt-1.5 leading-relaxed">
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
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#003fb1] hover:underline"
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
                <p className="text-sm text-[#737686] leading-relaxed">
                  ປ້ອນ Email ທີ່ທ່ານໃຊ້ລົງທະບຽນ ເຮົາຈະສົ່ງລິ້ງລີເຊັດລະຫັດຜ່ານໃຫ້ທ່ານ
                </p>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#737686]">
                      mail
                    </span>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="example@email.com"
                      autoComplete="email"
                      className={`w-full bg-accent rounded-xl pl-9 pr-4 py-3 text-sm font-medium
                        text-foreground focus:outline-none focus:ring-2 transition-all
                        ${errors.email ? 'ring-2 ring-red-400 bg-red-50 dark:bg-red-900/10' : 'focus:ring-[#003fb1]/40'}`}
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
                  className="w-full bg-gradient-to-r from-[#003fb1] to-[#1a56db] text-white py-3.5 rounded-xl
                    font-bold text-sm hover:opacity-95 hover:-translate-y-0.5 transition-all duration-200
                    shadow-md shadow-[#003fb1]/25 disabled:opacity-50 disabled:transform-none
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
                  <Link to="/login" className="text-sm text-[#737686] hover:text-[#003fb1] transition-colors font-medium">
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
