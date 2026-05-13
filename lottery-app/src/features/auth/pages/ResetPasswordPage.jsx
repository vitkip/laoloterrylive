import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { resetPasswordSchema } from '../schemas/authSchemas';
import PasswordInput from '../components/PasswordInput';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

function BgCard({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001d6e] via-[#003fb1] to-[#1a56db] flex items-center justify-center px-4 py-10">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-white/[0.04] blur-3xl" />
        <div className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full bg-white/[0.04] blur-3xl" />
      </div>
      <div className="w-full max-w-md relative">{children}</div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const navigate          = useNavigate();
  const [searchParams]    = useSearchParams();
  const token             = searchParams.get('token');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetPasswordSchema), mode: 'onTouched' });

  const watchedPassword = watch('password', '');

  // ── No token ────────────────────────────────────────────────────
  if (!token) {
    return (
      <BgCard>
        <div className="bg-white dark:bg-[#152033] rounded-3xl shadow-2xl p-10 text-center border border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-500 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              link_off
            </span>
          </div>
          <h2 className="text-xl font-black text-[#121c2a] dark:text-white mb-2">Token ບໍ່ຖືກຕ້ອງ</h2>
          <p className="text-sm text-[#737686] mb-6 leading-relaxed">
            ລິ້ງນີ້ໃຊ້ງານບໍ່ໄດ້ ຫຼື ໝົດອາຍຸແລ້ວ<br />ກະລຸນາຂໍ Reset ໃໝ່
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#003fb1] to-[#1a56db]
              text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-95 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            ຂໍ Reset ໃໝ່
          </Link>
        </div>
      </BgCard>
    );
  }

  // ── Success state ───────────────────────────────────────────────
  if (success) {
    return (
      <BgCard>
        <div className="bg-white dark:bg-[#152033] rounded-3xl shadow-2xl p-10 text-center border border-white/10 space-y-5">
          <div className="w-20 h-20 rounded-full bg-[#e8f5e9] dark:bg-[#006c49]/20 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[#006c49] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#121c2a] dark:text-white">ສຳເລັດ!</h2>
            <p className="text-sm text-[#737686] mt-2">ລະຫັດຜ່ານໃໝ່ຖືກຕັ້ງຄ່າສຳເລັດແລ້ວ</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#003fb1] to-[#1a56db]
              text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-95 hover:-translate-y-0.5
              transition-all shadow-md shadow-[#003fb1]/25"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            ເຂົ້າສູ່ລະບົບ
          </button>
        </div>
      </BgCard>
    );
  }

  // ── Form ────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    const result = await authService.resetPassword(token, data.password).catch(() => null);
    if (!result) { toast.error('ເຊື່ອມຕໍ່ server ບໍ່ສຳເລັດ'); return; }
    if (result.ok) {
      setSuccess(true);
      toast.success('ລີເຊັດລະຫັດຜ່ານສຳເລັດ!');
    } else {
      toast.error(result.data?.error || 'Token ໝົດອາຍຸ ຫຼື ໃຊ້ໄປແລ້ວ');
    }
  };

  return (
    <BgCard>
      <div className="bg-white dark:bg-[#152033] rounded-3xl shadow-2xl overflow-hidden border border-white/10">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#001d6e] to-[#1a56db] px-8 py-8 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-20 translate-x-20" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-lg">
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                key
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">ຕັ້ງລະຫັດຜ່ານໃໝ່</h1>
            <p className="text-white/60 text-sm mt-1">ສ້າງລະຫັດຜ່ານທີ່ແຂງແກ່ນ ແລະ ປອດໄພ</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-8 py-7 space-y-5">
          <div>
            <PasswordInput
              {...register('password')}
              label="ລະຫັດຜ່ານໃໝ່ *"
              placeholder="ຢ່າງໜ້ອຍ 8 ຕົວ + ໂຕໃຫຍ່ + ຕົວເລກ + ໂຕພິເສດ"
              autoComplete="new-password"
              error={errors.password?.message}
            />
            <PasswordStrengthMeter password={watchedPassword} />
          </div>

          <PasswordInput
            {...register('confirm_password')}
            label="ຢືນຢັນລະຫັດຜ່ານ *"
            placeholder="ປ້ອນລະຫັດຜ່ານໃໝ່ອີກຄັ້ງ"
            autoComplete="new-password"
            error={errors.confirm_password?.message}
          />

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
                ກຳລັງຕັ້ງລະຫັດ...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                ຕັ້ງລະຫັດຜ່ານໃໝ່
              </>
            )}
          </button>
        </form>
      </div>
    </BgCard>
  );
}
