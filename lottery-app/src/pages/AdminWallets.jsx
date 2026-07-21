import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API } from '../utils/api';
import toast from 'react-hot-toast';

function fmt(n) { return Number(n || 0).toLocaleString('lo-LA', { maximumFractionDigits: 2 }); }

const inputCls = 'w-full bg-transparent px-3.5 py-3 text-white text-sm font-semibold placeholder:text-white/20 outline-none';
function FieldBox({ children }) {
  return (
    <div className="bg-[#0b0e1a] border border-white/[0.06] rounded-xl overflow-hidden focus-within:border-[#d4af37] focus-within:ring-2 focus-within:ring-[#d4af37]/20 transition-all duration-300">
      {children}
    </div>
  );
}

function AdjustModal({ target, onSave, onClose, loading }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0c0e1b] rounded-3xl border border-white/[0.08] shadow-2xl w-full max-w-md overflow-hidden text-left">
        <div className="px-7 py-6 border-b border-white/[0.05]">
          <h2 className="text-lg font-black text-white font-headline">ປັບຍອດເງິນຈຳລອງ</h2>
          <p className="text-xs text-white/40 font-bold mt-1">{target.username} — ຍອດປັດຈຸບັນ {fmt(target.balance)} KIP</p>
        </div>
        <div className="p-6 sm:p-7 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white/35 uppercase tracking-widest">ຈຳນວນ (+ ເພີ່ມ / − ຫັກ)</label>
            <FieldBox>
              <input type="number" step="0.01" className={inputCls} value={amount} placeholder="ເຊັ່ນ: 50000 ຫຼື -20000"
                onChange={e => setAmount(e.target.value)} />
            </FieldBox>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white/35 uppercase tracking-widest">ໝາຍເຫດ</label>
            <FieldBox>
              <input className={inputCls} value={note} placeholder="ເຫດຜົນ (ທາງເລືອກ)" onChange={e => setNote(e.target.value)} />
            </FieldBox>
          </div>
        </div>
        <div className="px-6 sm:px-7 pb-6 sm:pb-7 flex gap-3">
          <button onClick={onClose} className="flex-none px-5 py-3 rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/50 hover:bg-white/[0.06] text-xs font-black cursor-pointer">ຍົກເລີກ</button>
          <button
            onClick={() => onSave({ user_id: target.user_id, amount: Number(amount), note })}
            disabled={loading || !amount || Number(amount) === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#d4af37] hover:bg-[#b8860b] text-black font-black text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? <span className="w-4 h-4 border-2 border-black/35 border-t-black rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[16px]">save</span>}
            ບັນທຶກ
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminWallets() {
  const { authFetch } = useAuth();

  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [target, setTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchWallets = useCallback(async () => {
    setLoading(true);
    const qs = search ? `&search=${encodeURIComponent(search)}` : '';
    const { ok, data } = await authFetch(`${API}/betting.php?action=list_wallets${qs}`);
    if (ok) setWallets(data); else toast.error(data.error || 'ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ');
    setLoading(false);
  }, [authFetch, search]);

  useEffect(() => { const t = setTimeout(fetchWallets, 300); return () => clearTimeout(t); }, [fetchWallets]);

  const handleAdjust = async (form) => {
    setSaving(true);
    const { ok, data } = await authFetch(`${API}/betting.php?action=admin_adjust_wallet`, {
      method: 'POST', body: JSON.stringify(form),
    });
    if (ok) { toast.success(`ປັບຍອດສຳເລັດ — ຍອດໃໝ່ ${fmt(data.new_balance)}`); setTarget(null); fetchWallets(); }
    else toast.error(data.error || 'ປັບຍອດບໍ່ສຳເລັດ');
    setSaving(false);
  };

  return (
    <div className="space-y-7 text-left select-none">
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1020] via-[#090b16] to-[#04060e]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.08),transparent_60%)]" />
        <div className="relative z-10 px-7 sm:px-10 py-8">
          <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#d4af37] rounded-full px-3 py-1 mb-3">
            <span className="material-symbols-outlined text-[13px]">account_balance_wallet</span>
            <span className="text-[9px] font-black uppercase tracking-widest">Demo Betting</span>
          </div>
          <h1 className="text-xl sm:text-2.5xl font-black text-white leading-tight font-headline">
            ກະເປົາເງິນ <span className="text-[#d4af37] ml-1.5">ຈຳລອງ</span>
          </h1>
          <p className="text-white/50 text-[11px] mt-1.5 font-bold">ເບິ່ງຍອດ ແລະ ປັບຍອດເງິນຈຳລອງໃຫ້ຜູ້ໃຊ້</p>
        </div>
      </div>

      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-white/30 pointer-events-none">search</span>
        <input
          type="text"
          placeholder="ຄົ້ນຫາຜູ້ໃຊ້ (username / ຊື່)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0e1124] border border-white/[0.06] rounded-xl text-xs font-semibold text-white placeholder:text-white/20 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/10 transition-all duration-300"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white/[0.02] border border-white/[0.05] rounded-2xl animate-pulse" />)}
        </div>
      ) : wallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[#0e1124] rounded-3xl border border-white/[0.05]">
          <span className="material-symbols-outlined text-5xl text-white/10">inbox</span>
          <p className="text-xs text-white/30 font-bold">ບໍ່ພົບຜູ້ໃຊ້</p>
        </div>
      ) : (
        <div className="space-y-2">
          {wallets.map(w => (
            <div key={w.user_id} className="flex items-center justify-between gap-3 bg-[#0e1124]/85 border border-white/[0.05] rounded-2xl px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/25 flex items-center justify-center font-black text-[#d4af37] text-sm shrink-0">
                  {(w.full_name || w.username || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-black text-white">{w.full_name || w.username}</p>
                  <p className="text-[10px] text-white/35 font-bold mt-0.5">@{w.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <p className="text-sm font-black text-[#d4af37]">{fmt(w.balance)} KIP</p>
                <button
                  onClick={() => setTarget(w)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-black bg-white/[0.03] text-white/60 hover:text-[#d4af37] hover:bg-[#d4af37]/10 border border-white/[0.06] hover:border-[#d4af37]/25 transition-all cursor-pointer"
                >ປັບຍອດ</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {target && (
        <AdjustModal target={target} onSave={handleAdjust} onClose={() => setTarget(null)} loading={saving} />
      )}
    </div>
  );
}
