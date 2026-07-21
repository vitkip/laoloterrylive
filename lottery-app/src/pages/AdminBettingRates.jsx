import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API } from '../utils/api';
import toast from 'react-hot-toast';

const PRIZE_LABEL = {
  '2_digits': 'ເລກ 2 ໂຕ', '3_digits': 'ເລກ 3 ໂຕ', '4_digits': 'ເລກ 4 ໂຕ',
  '5_digits': 'ເລກ 5 ໂຕ', '6_digits': 'ເລກ 6 ໂຕ',
};

const inputCls = 'w-full bg-transparent px-3.5 py-2.5 text-white text-sm font-black text-center outline-none';

export default function AdminBettingRates() {
  const { authFetch, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({});
  const [savingKey, setSavingKey] = useState(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    const { ok, data } = await authFetch(`${API}/betting.php?action=list_payout_rates`);
    if (ok) {
      setRates(data);
      const d = {};
      data.forEach(r => { d[r.prize_type] = { multiplier: r.multiplier, is_active: Number(r.is_active) }; });
      setDrafts(d);
    } else toast.error(data.error || 'ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ');
    setLoading(false);
  }, [authFetch]);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  const handleSave = async (prizeType) => {
    setSavingKey(prizeType);
    const draft = drafts[prizeType];
    const { ok, data } = await authFetch(`${API}/betting.php?action=update_payout_rate`, {
      method: 'POST',
      body: JSON.stringify({ prize_type: prizeType, multiplier: Number(draft.multiplier), is_active: draft.is_active }),
    });
    if (ok) { toast.success('ອັບເດດອັດຕາຈ່າຍສຳເລັດ'); fetchRates(); }
    else toast.error(data.error || 'ອັບເດດບໍ່ສຳເລັດ');
    setSavingKey(null);
  };

  return (
    <div className="space-y-7 text-left select-none">
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1020] via-[#090b16] to-[#04060e]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.08),transparent_60%)]" />
        <div className="relative z-10 px-7 sm:px-10 py-8">
          <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#d4af37] rounded-full px-3 py-1 mb-3">
            <span className="material-symbols-outlined text-[13px]">payments</span>
            <span className="text-[9px] font-black uppercase tracking-widest">Demo Betting</span>
          </div>
          <h1 className="text-xl sm:text-2.5xl font-black text-white leading-tight font-headline">
            ອັດຕາ <span className="text-[#d4af37] ml-1.5">ຈ່າຍລາງວັນ</span>
          </h1>
          <p className="text-white/50 text-[11px] mt-1.5 font-bold">ຕົວຄູນຈ່າຍລາງວັນຕໍ່ປະເພດເລກ (ນຳໃຊ້ກັບການແທງໃໝ່ເທົ່ານັ້ນ)</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-32 bg-white/[0.02] border border-white/[0.05] rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {rates.map(r => {
            const d = drafts[r.prize_type] || { multiplier: r.multiplier, is_active: 1 };
            const dirty = Number(d.multiplier) !== Number(r.multiplier) || d.is_active !== Number(r.is_active);
            return (
              <div key={r.prize_type} className="bg-[#0e1124]/85 backdrop-blur-md rounded-3xl border border-white/[0.05] shadow-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-white">{PRIZE_LABEL[r.prize_type] || r.prize_type}</p>
                  <button
                    disabled={!isAdmin}
                    onClick={() => setDrafts(s => ({ ...s, [r.prize_type]: { ...s[r.prize_type], is_active: s[r.prize_type].is_active ? 0 : 1 } }))}
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full border transition-all cursor-pointer disabled:cursor-not-allowed ${
                      d.is_active ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-white/[0.02] border-white/[0.05] text-white/30'
                    }`}
                  >{d.is_active ? 'ໃຊ້ງານ' : 'ປິດໃຊ້'}</button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-xs font-black">×</span>
                  <div className="flex-1 bg-[#0b0e1a] border border-white/[0.06] rounded-xl overflow-hidden focus-within:border-[#d4af37] focus-within:ring-2 focus-within:ring-[#d4af37]/20 transition-all">
                    <input
                      type="number" min="0.01" step="0.01"
                      disabled={!isAdmin}
                      className={inputCls}
                      value={d.multiplier}
                      onChange={e => setDrafts(s => ({ ...s, [r.prize_type]: { ...s[r.prize_type], multiplier: e.target.value } }))}
                    />
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleSave(r.prize_type)}
                    disabled={!dirty || savingKey === r.prize_type}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#b8860b] text-black text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {savingKey === r.prize_type ? <span className="w-3.5 h-3.5 border-2 border-black/35 border-t-black rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[15px]">save</span>}
                    ບັນທຶກ
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
