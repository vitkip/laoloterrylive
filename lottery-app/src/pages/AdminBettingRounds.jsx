import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API } from '../utils/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

const TYPE_ID = 1; // ຫວຍພັດທະນາ

const STATUS_META = {
  open:    { label: 'ເປີດຮັບແທງ', cls: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' },
  closed:  { label: 'ປິດຮັບແທງ',  cls: 'bg-amber-500/10 border-amber-500/25 text-amber-400' },
  settled: { label: 'ຄິດໄລ່ແລ້ວ', cls: 'bg-sky-500/10 border-sky-500/25 text-sky-400' },
  void:    { label: 'ຍົກເລີກ',    cls: 'bg-white/[0.02] border-white/[0.05] text-white/30' },
};

function fmt(n) { return Number(n || 0).toLocaleString('lo-LA', { maximumFractionDigits: 2 }); }

const inputCls = 'w-full bg-transparent px-3.5 py-3 text-white text-xs font-semibold placeholder:text-white/20 outline-none';
function FieldBox({ children }) {
  return (
    <div className="bg-[#0b0e1a] border border-white/[0.06] rounded-xl overflow-hidden focus-within:border-[#d4af37] focus-within:ring-2 focus-within:ring-[#d4af37]/20 transition-all duration-300">
      {children}
    </div>
  );
}

function OpenRoundModal({ onSave, onClose, loading }) {
  const [drawDate, setDrawDate] = useState('');
  const [drawNumber, setDrawNumber] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0c0e1b] rounded-3xl border border-white/[0.08] shadow-2xl w-full max-w-md overflow-hidden text-left">
        <div className="px-7 py-6 border-b border-white/[0.05]">
          <h2 className="text-lg font-black text-white font-headline">ເປີດຮອບແທງໃໝ່</h2>
        </div>
        <div className="p-6 sm:p-7 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white/35 uppercase tracking-widest">ວັນທີ່ອອກຫວຍ</label>
            <FieldBox>
              <input type="date" className={inputCls} value={drawDate} onChange={e => setDrawDate(e.target.value)} />
            </FieldBox>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white/35 uppercase tracking-widest">ງວດເລກທີ່</label>
            <FieldBox>
              <input type="number" min="1" className={inputCls} value={drawNumber} placeholder="ເຊັ່ນ: 1"
                onChange={e => setDrawNumber(e.target.value)} />
            </FieldBox>
          </div>
        </div>
        <div className="px-6 sm:px-7 pb-6 sm:pb-7 flex gap-3">
          <button onClick={onClose} className="flex-none px-5 py-3 rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/50 hover:bg-white/[0.06] text-xs font-black cursor-pointer">ຍົກເລີກ</button>
          <button
            onClick={() => onSave({ type_id: TYPE_ID, draw_date: drawDate, draw_number: Number(drawNumber) })}
            disabled={loading || !drawDate || !drawNumber}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#d4af37] hover:bg-[#b8860b] text-black font-black text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? <span className="w-4 h-4 border-2 border-black/35 border-t-black rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[16px]">add_circle</span>}
            ເປີດຮອບ
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminBettingRounds() {
  const { authFetch, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null); // { action, round_id, title, message, variant }
  const [busyId, setBusyId] = useState(null);

  const fetchRounds = useCallback(async () => {
    setLoading(true);
    const qs = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
    const { ok, data } = await authFetch(`${API}/betting.php?action=list_rounds&type_id=${TYPE_ID}${qs}`);
    if (ok) setRounds(data); else toast.error(data.error || 'ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ');
    setLoading(false);
  }, [authFetch, statusFilter]);

  useEffect(() => { fetchRounds(); }, [fetchRounds]);

  const handleOpenRound = async (form) => {
    setSaving(true);
    const { ok, data } = await authFetch(`${API}/betting.php?action=open_round`, {
      method: 'POST', body: JSON.stringify(form),
    });
    if (ok) { toast.success('ເປີດຮອບສຳເລັດ'); setShowOpenModal(false); fetchRounds(); }
    else toast.error(data.error || 'ເປີດຮອບບໍ່ສຳເລັດ');
    setSaving(false);
  };

  const runAction = async (action, roundId, extra = {}) => {
    setBusyId(roundId);
    const { ok, data } = await authFetch(`${API}/betting.php?action=${action}`, {
      method: 'POST', body: JSON.stringify({ round_id: roundId, ...extra }),
    });
    if (ok) {
      if (action === 'settle_round' && data.already_settled) toast('ຮອບນີ້ຄິດໄລ່ໄປແລ້ວ');
      else if (action === 'settle_round') toast.success(`ຄິດໄລ່ສຳເລັດ: ຖືກ ${data.won_count} ໃບ, ຈ່າຍ ${fmt(data.total_paid)} KIP`);
      else if (action === 'void_round') toast.success(`ຍົກເລີກ ແລະ ຄືນເງິນ ${data.refunded_count} ໃບແລ້ວ`);
      else toast.success('ສຳເລັດ');
      fetchRounds();
    } else {
      toast.error(data.error || 'ດຳເນີນການບໍ່ສຳເລັດ');
    }
    setBusyId(null);
    setConfirm(null);
  };

  return (
    <div className="space-y-7 text-left select-none">
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1020] via-[#090b16] to-[#04060e]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.08),transparent_60%)]" />
        <div className="relative z-10 px-7 sm:px-10 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#d4af37] rounded-full px-3 py-1 mb-3">
              <span className="material-symbols-outlined text-[13px]">casino</span>
              <span className="text-[9px] font-black uppercase tracking-widest">Demo Betting</span>
            </div>
            <h1 className="text-xl sm:text-2.5xl font-black text-white leading-tight font-headline">
              ຈັດການ <span className="text-[#d4af37] ml-1.5">ຮອບແທງຫວຍ</span>
            </h1>
            <p className="text-white/50 text-[11px] mt-1.5 font-bold">ເປີດ/ປິດຮອບ, ຄິດໄລ່ຜົນ, ຍົກເລີກຮອບ — ຫວຍພັດທະນາ</p>
          </div>
          <button
            onClick={() => setShowOpenModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#b8860b] text-black text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            ເປີດຮອບໃໝ່
          </button>
        </div>
      </div>

      <div className="flex bg-[#0b0e1a] rounded-xl p-1 border border-white/[0.06] gap-1 w-fit">
        {['all', 'open', 'closed', 'settled', 'void'].map(v => (
          <button
            key={v}
            onClick={() => setStatusFilter(v)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all duration-200 cursor-pointer ${
              statusFilter === v ? 'bg-[#d4af37] text-black' : 'text-white/45 hover:text-white'
            }`}
          >{v === 'all' ? 'ທັງໝົດ' : STATUS_META[v].label}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white/[0.02] border border-white/[0.05] rounded-2xl animate-pulse" />)}
        </div>
      ) : rounds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[#0e1124] rounded-3xl border border-white/[0.05]">
          <span className="material-symbols-outlined text-5xl text-white/10">inbox</span>
          <p className="text-xs text-white/30 font-bold">ຍັງບໍ່ມີຮອບແທງ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rounds.map(r => {
            const meta = STATUS_META[r.status];
            const busy = busyId === r.round_id;
            return (
              <div key={r.round_id} className="bg-[#0e1124]/85 border border-white/[0.05] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/25 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-[#d4af37]">event</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">ງວດ #{r.draw_number} — {r.draw_date}</p>
                    <p className="text-[10px] font-bold text-white/35 mt-0.5">
                      {r.bet_count} ໃບແທງ · ຮັບເງິນ {fmt(r.total_staked)} · ຄ້າງຈ່າຍ {fmt(r.total_liability)} KIP
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black border ${meta.cls}`}>{meta.label}</span>

                  {isAdmin && r.status === 'open' && (
                    <button disabled={busy} onClick={() => setConfirm({ action: 'close_round', round_id: r.round_id, title: 'ປິດຮັບແທງ?', message: 'ຫຼັງຈາກປິດ ຈະບໍ່ສາມາດວາງເດີມພັນເພີ່ມໃນຮອບນີ້ໄດ້ອີກ', variant: 'default' })}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 disabled:opacity-40 cursor-pointer">
                      ປິດຮັບແທງ
                    </button>
                  )}
                  {isAdmin && r.status === 'closed' && (
                    <>
                      <button disabled={busy} onClick={() => setConfirm({ action: 'settle_round', round_id: r.round_id, title: 'ຄິດໄລ່ຜົນ & ຈ່າຍລາງວັນ?', message: 'ຕ້ອງໄດ້ປ້ອນຜົນຫວຍໃນລະບົບກ່ອນ. ການກະທຳນີ້ຈະຈ່າຍເງິນຈຳລອງໃຫ້ຜູ້ຖືກລາງວັນທັນທີ.', variant: 'default' })}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-black bg-sky-500/10 text-sky-400 border border-sky-500/25 hover:bg-sky-500/20 disabled:opacity-40 cursor-pointer">
                        ຄິດໄລ່ຜົນ
                      </button>
                      <button disabled={busy} onClick={() => setConfirm({ action: 'void_round', round_id: r.round_id, title: 'ຍົກເລີກຮອບ?', message: 'ຈະຄືນເງິນເດີມພັນທັງໝົດໃນຮອບນີ້ໃຫ້ຜູ້ແທງ', variant: 'danger' })}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20 disabled:opacity-40 cursor-pointer">
                        ຍົກເລີກ
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showOpenModal && (
        <OpenRoundModal onSave={handleOpenRound} onClose={() => setShowOpenModal(false)} loading={saving} />
      )}

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        variant={confirm?.variant}
        onCancel={() => setConfirm(null)}
        onConfirm={() => confirm && runAction(confirm.action, confirm.round_id)}
      />
    </div>
  );
}
