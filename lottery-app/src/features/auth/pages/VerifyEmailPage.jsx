import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const STATE = { LOADING: 'loading', SUCCESS: 'success', ERROR: 'error', EXPIRED: 'expired' };

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token          = searchParams.get('token');
  const [state, setState] = useState(STATE.LOADING);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setState(STATE.ERROR); setMessage('Token ຫວ່າງ'); return; }

    authService.verifyEmail(token)
      .then(result => {
        if (result.ok) {
          setState(STATE.SUCCESS);
        } else {
          const msg = result.data?.error || 'ການຢືນຢັນລົ້ມເຫລວ';
          if (msg.includes('ໝົດອາຍຸ')) setState(STATE.EXPIRED);
          else setState(STATE.ERROR);
          setMessage(msg);
        }
      })
      .catch(() => {
        setState(STATE.ERROR);
        setMessage('ເຊື່ອມຕໍ່ server ບໍ່ສຳເລັດ');
      });
  }, [token]);

  const configs = {
    [STATE.LOADING]: {
      icon: null,
      iconBg: '',
      iconColor: '',
      title: 'ກຳລັງຢືນຢັນ Email...',
      desc:  'ກະລຸນາລໍຖ້າ',
      actions: null,
    },
    [STATE.SUCCESS]: {
      icon: 'mark_email_read',
      iconBg: 'bg-[#e8f5e9] dark:bg-[#006c49]/20',
      iconColor: 'text-[#006c49]',
      title: 'ຢືນຢັນ Email ສຳເລັດ!',
      desc:  'ບັນຊີຂອງທ່ານພ້ອມໃຊ້ງານແລ້ວ',
      actions: (
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#003fb1] to-[#1a56db]
            text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-95 hover:-translate-y-0.5
            transition-all shadow-md shadow-[#003fb1]/25"
        >
          <span className="material-symbols-outlined text-[18px]">login</span>
          ເຂົ້າສູ່ລະບົບ
        </Link>
      ),
    },
    [STATE.EXPIRED]: {
      icon: 'schedule',
      iconBg: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600',
      title: 'Token ໝົດອາຍຸ',
      desc:  message || 'ລິ້ງຢືນຢັນ Email ໝົດອາຍຸແລ້ວ',
      actions: (
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-[#003fb1] dark:text-[#b5c4ff] font-bold hover:underline"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          ກັບໄປ Login
        </Link>
      ),
    },
    [STATE.ERROR]: {
      icon: 'link_off',
      iconBg: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-500',
      title: 'Token ບໍ່ຖືກຕ້ອງ',
      desc:  message || 'ລິ້ງນີ້ໃຊ້ງານບໍ່ໄດ້',
      actions: (
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[#003fb1] dark:text-[#b5c4ff] font-bold hover:underline"
        >
          <span className="material-symbols-outlined text-[16px]">home</span>
          ໜ້າຫຼັກ
        </Link>
      ),
    },
  };

  const cfg = configs[state];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001d6e] via-[#003fb1] to-[#1a56db] flex items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-white/[0.04] blur-3xl" />
        <div className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full bg-white/[0.04] blur-3xl" />
      </div>

      <div className="bg-white dark:bg-[#152033] rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center border border-white/10 relative">
        {state === STATE.LOADING ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-[#003fb1]/20 border-t-[#003fb1] animate-spin mx-auto" />
            <div>
              <p className="font-black text-lg text-[#121c2a] dark:text-white">{cfg.title}</p>
              <p className="text-sm text-[#737686] mt-1">{cfg.desc}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className={`w-20 h-20 rounded-full ${cfg.iconBg} flex items-center justify-center mx-auto`}>
              <span className={`material-symbols-outlined ${cfg.iconColor} text-4xl`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {cfg.icon}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-black text-[#121c2a] dark:text-white">{cfg.title}</h2>
              <p className="text-sm text-[#737686] mt-1.5 leading-relaxed">{cfg.desc}</p>
            </div>
            {cfg.actions}
          </div>
        )}
      </div>
    </div>
  );
}
