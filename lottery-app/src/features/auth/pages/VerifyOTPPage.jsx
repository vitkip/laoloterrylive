import { useState, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import OTPInput from '../components/OTPInput';
import CountdownTimer from '../components/CountdownTimer';

const OTP_DURATION  = 600; // 10 minutes
const MAX_ATTEMPTS  = 5;

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
      <div className="min-h-screen bg-gradient-to-br from-[#001d6e] via-[#003fb1] to-[#1a56db] flex items-center justify-center px-4">
        <div className="bg-white dark:bg-[#152033] rounded-3xl shadow-2xl p-10 text-center max-w-sm w-full">
          <span className="material-symbols-outlined text-[#737686] text-5xl block mb-4">
            hourglass_disabled
          </span>
          <p className="text-sm text-[#737686] mb-5">ໝົດ session ການລົງທະບຽນ</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#003fb1] to-[#1a56db]
              text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            ສ້າງບັນຊີໃໝ່
          </Link>
        </div>
      </div>
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
    <div className="min-h-screen bg-gradient-to-br from-[#001d6e] via-[#003fb1] to-[#1a56db] flex items-center justify-center px-4 py-10">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-white/[0.04] blur-3xl" />
        <div className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full bg-white/[0.04] blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-white dark:bg-[#152033] rounded-3xl shadow-2xl overflow-hidden border border-white/10">

          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#001d6e] to-[#1a56db] px-8 py-8 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-20 translate-x-20" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-lg">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified_user
                </span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">ຢືນຢັນ OTP</h1>
              <p className="text-white/60 text-sm mt-1.5">
                ສົ່ງລະຫັດ OTP ໄປຍັງ{' '}
                <span className="text-white font-bold">{maskedEmail}</span>
              </p>
            </div>
          </div>

          <div className="px-8 py-7 space-y-5">

            {/* DEV hint */}
            {effectiveDevOtp && (
              <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl px-4 py-3">
                <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                  developer_mode
                </span>
                <div>
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-400">DEV MODE</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    OTP: <span className="font-black tracking-[0.3em]">{effectiveDevOtp}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl px-4 py-3">
                <span className="material-symbols-outlined text-red-600 text-[18px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                  error
                </span>
                <p className="text-xs font-bold text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Timer row */}
            <div className="flex items-center justify-between bg-[#f0f4ff] dark:bg-[#1e2d4a] rounded-xl px-4 py-3">
              <p className="text-xs font-medium text-[#737686]">OTP ໝົດອາຍຸໃນ:</p>
              {expired ? (
                <span className="text-xs font-black text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                  ໝົດອາຍຸແລ້ວ
                </span>
              ) : (
                <CountdownTimer
                  key={timerKey}
                  seconds={OTP_DURATION}
                  onExpire={() => { setExpired(true); setError('OTP ໝົດອາຍຸ ກະລຸນາຂໍ OTP ໃໝ່'); }}
                />
              )}
            </div>

            {/* OTP input */}
            <div className="py-2">
              <p className="text-center text-sm text-[#737686] mb-5 font-medium">
                ປ້ອນລະຫັດ 6 ຕົວ
              </p>
              <OTPInput
                value={otp}
                onChange={setOtp}
                disabled={loading || expired || locked}
              />
              {/* Attempt dots */}
              {attempts > 0 && !locked && (
                <div className="flex justify-center gap-1.5 mt-4">
                  {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${i < attempts ? 'bg-red-400' : 'bg-[#dee9fd] dark:bg-[#2b3a54]'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Verify */}
            <button
              onClick={handleVerify}
              disabled={loading || otp.replace(/\s/g, '').length !== 6 || expired || locked}
              className="w-full bg-gradient-to-r from-[#003fb1] to-[#1a56db] text-white py-3.5 rounded-xl
                font-bold text-sm hover:opacity-95 hover:-translate-y-0.5 transition-all duration-200
                shadow-md shadow-[#003fb1]/25 disabled:opacity-40 disabled:transform-none
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
            <div className="text-center pt-1">
              <p className="text-xs text-[#737686] mb-2">ບໍ່ໄດ້ຮັບ OTP ຫຼື OTP ໝົດອາຍຸ?</p>
              <button
                onClick={handleResend}
                disabled={resending || !canResend}
                className="inline-flex items-center gap-1.5 text-sm text-[#003fb1] dark:text-[#b5c4ff]
                  font-bold hover:underline disabled:opacity-40 disabled:no-underline transition-all"
              >
                {resending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#003fb1]/30 border-t-[#003fb1] rounded-full animate-spin" />
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
                <p className="text-[11px] text-[#737686] mt-1">ສາມາດຂໍໃໝ່ໄດ້ຫຼັງ OTP ໝົດອາຍຸ</p>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-5">
          <Link to="/register" className="text-sm text-white/50 hover:text-white transition-colors font-medium">
            ← ກັບໄປສ້າງບັນຊີໃໝ່
          </Link>
        </div>
      </div>
    </div>
  );
}
