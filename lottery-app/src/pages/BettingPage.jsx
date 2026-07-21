import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API } from '../utils/api';
import toast from 'react-hot-toast';

const TYPE_ID = 1; // ຫວຍພັດທະນາ

const PRIZE_TABS = [
  { v: '2_digits', label: '2 ໂຕ' },
  { v: '3_digits', label: '3 ໂຕ' },
  { v: '4_digits', label: '4 ໂຕ' },
  { v: '5_digits', label: '5 ໂຕ' },
  { v: '6_digits', label: '6 ໂຕ' },
];
const DIGIT_LEN = { '2_digits': 2, '3_digits': 3, '4_digits': 4, '5_digits': 5, '6_digits': 6 };

const STATUS_BADGE = {
  pending: { label: 'ລໍຖ້າຜົນ', cls: 'bg-amber-500/10 border-amber-500/25 text-amber-400' },
  won:     { label: 'ຖືກລາງວັນ', cls: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' },
  lost:    { label: 'ບໍ່ຖືກ', cls: 'bg-white/[0.02] border-white/[0.05] text-white/30' },
  void:    { label: 'ຍົກເລີກ', cls: 'bg-sky-500/10 border-sky-500/25 text-sky-400' },
};

const TX_LABEL = {
  signup_bonus:     { label: 'ໂບນັດສະໝັກ', color: '#34d399' },
  bet_placed:       { label: 'ວາງເດີມພັນ',   color: '#f87171' },
  bet_won:          { label: 'ຖືກລາງວັນ',    color: '#34d399' },
  bet_void_refund:  { label: 'ຄືນເງິນ',       color: '#60a5fa' },
  admin_adjustment: { label: 'Admin ປັບຍອດ', color: '#c084fc' },
};

function fmt(n) {
  return Number(n || 0).toLocaleString('lo-LA', { maximumFractionDigits: 2 });
}
function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('lo-LA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Amount shown per bet status: won → actual payout, void → refunded stake,
 *  lost → nothing won, pending → what the bet could still win. */
function betAmountDisplay(b) {
  switch (b.status) {
    case 'won':  return { text: `+${fmt(b.payout_amount)}`, cls: 'text-emerald-400' };
    case 'void': return { text: `+${fmt(b.stake)}`, cls: 'text-sky-400' };
    case 'lost': return { text: '0', cls: 'text-white/30' };
    default:     return { text: fmt(b.potential_payout), cls: 'text-white' };
  }
}

const inputCls = 'w-full bg-transparent px-3.5 py-3 text-white text-sm font-semibold placeholder:text-white/20 outline-none';

function FieldBox({ children }) {
  return (
    <div className="bg-[#0b0e1a] border border-white/[0.06] rounded-xl overflow-hidden focus-within:border-[#d4af37] focus-within:ring-2 focus-within:ring-[#d4af37]/20 transition-all duration-300">
      {children}
    </div>
  );
}

export default function BettingPage() {
  const { authFetch } = useAuth();

  const [tab, setTab] = useState('place'); // place | mybets | wallet
  const [balance, setBalance] = useState(0);
  const [rounds, setRounds] = useState([]);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);

  const [roundId, setRoundId] = useState('');
  const [prizeType, setPrizeType] = useState('2_digits');
  const [chosenNumber, setChosenNumber] = useState('');
  const [stake, setStake] = useState('');
  const [placing, setPlacing] = useState(false);

  const [bets, setBets] = useState([]);
  const [betsLoading, setBetsLoading] = useState(false);
  const [betStatusFilter, setBetStatusFilter] = useState('all');

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchCore = useCallback(async () => {
    setLoading(true);
    const [walletRes, roundsRes, ratesRes] = await Promise.all([
      authFetch(`${API}/betting.php?action=get_wallet`),
      authFetch(`${API}/betting.php?action=list_open_rounds&type_id=${TYPE_ID}`),
      authFetch(`${API}/betting.php?action=get_payout_rates`),
    ]);
    if (walletRes.ok) setBalance(walletRes.data.balance);
    if (roundsRes.ok) {
      setRounds(roundsRes.data);
      setRoundId(prev => {
        if (prev && roundsRes.data.some(r => String(r.round_id) === prev)) return prev;
        return roundsRes.data.length > 0 ? String(roundsRes.data[0].round_id) : '';
      });
    }
    if (ratesRes.ok) {
      const map = {};
      ratesRes.data.forEach(r => { map[r.prize_type] = Number(r.multiplier); });
      setRates(map);
    }
    setLoading(false);
  }, [authFetch]);

  const fetchBets = useCallback(async () => {
    setBetsLoading(true);
    const qs = betStatusFilter !== 'all' ? `&status=${betStatusFilter}` : '';
    const { ok, data } = await authFetch(`${API}/betting.php?action=my_bets${qs}`);
    if (ok) setBets(data); else toast.error(data.error || 'ໂຫຼດປະຫວັດການແທງບໍ່ສຳເລັດ');
    setBetsLoading(false);
  }, [authFetch, betStatusFilter]);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    const { ok, data } = await authFetch(`${API}/betting.php?action=wallet_history`);
    if (ok) setHistory(data); else toast.error(data.error || 'ໂຫຼດປະຫວັດກະເປົາບໍ່ສຳເລັດ');
    setHistoryLoading(false);
  }, [authFetch]);

  useEffect(() => { if (tab === 'place') fetchCore(); }, [tab, fetchCore]);
  useEffect(() => { if (tab === 'mybets') fetchBets(); }, [tab, fetchBets]);
  useEffect(() => { if (tab === 'wallet') fetchHistory(); }, [tab, fetchHistory]);

  const len = DIGIT_LEN[prizeType];
  const multiplier = rates[prizeType] || 0;
  const stakeNum = Number(stake) || 0;
  const potential = stakeNum * multiplier;

  const handlePlaceBet = async () => {
    if (placing) return;
    if (!roundId) { toast.error('ຍັງບໍ່ມີຮອບເປີດຮັບແທງ'); return; }
    if (chosenNumber.length !== len) { toast.error(`ເລກຕ້ອງມີ ${len} ໂຕ`); return; }
    if (stakeNum <= 0) { toast.error('ກະລຸນາໃສ່ຈຳນວນເງິນເດີມພັນ'); return; }
    if (stakeNum > balance) { toast.error('ຍອດເງິນໃນກະເປົາບໍ່ພຽງພໍ'); return; }

    setPlacing(true);
    const { ok, data } = await authFetch(`${API}/betting.php?action=place_bet`, {
      method: 'POST',
      body: JSON.stringify({ round_id: Number(roundId), prize_type: prizeType, chosen_number: chosenNumber, stake: stakeNum }),
    });
    if (ok) {
      toast.success('ວາງເດີມພັນສຳເລັດ!');
      setBalance(data.new_balance);
      setChosenNumber('');
      setStake('');
    } else {
      toast.error(data.error || 'ວາງເດີມພັນບໍ່ສຳເລັດ');
    }
    setPlacing(false);
  };

  return (
    <div className="space-y-7 text-left select-none">

      {/* ─── Header + Wallet ─── */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1020] via-[#090b16] to-[#04060e]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.08),transparent_60%)]" />
        <div className="relative z-10 px-7 sm:px-10 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#d4af37] rounded-full px-3 py-1 mb-3">
              <span className="material-symbols-outlined text-[13px]">casino</span>
              <span className="text-[9px] font-black uppercase tracking-widest">Demo — ບໍ່ໃຊ້ເງິນຈິງ</span>
            </div>
            <h1 className="text-xl sm:text-2.5xl font-black text-white leading-tight font-headline">
              ພະນັນ <span className="text-[#d4af37] ml-1.5">ຫວຍພັດທະນາ</span>
            </h1>
            <p className="text-white/50 text-[11px] mt-1.5 font-bold">ແທງດ້ວຍເງິນຈຳລອງ — ສະໝັກແລ້ວຮັບໂບນັດທັນທີ</p>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-6 py-4 text-center min-w-[160px]">
            <span className="material-symbols-outlined text-[18px] mb-1 block text-[#d4af37]">account_balance_wallet</span>
            <p className="text-2xl font-black text-white leading-none font-space">{loading ? '···' : fmt(balance)}</p>
            <p className="text-[10px] mt-1 text-[#d4af37]/70">ຍອດເງິນຈຳລອງ (KIP)</p>
          </div>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex bg-[#0b0e1a] rounded-xl p-1 border border-white/[0.06] gap-1 w-fit">
        {[
          { v: 'place',  label: 'ວາງເດີມພັນ', icon: 'add_circle' },
          { v: 'mybets', label: 'ການແທງຂອງຂ້ອຍ', icon: 'receipt_long' },
          { v: 'wallet', label: 'ປະຫວັດກະເປົາ', icon: 'history' },
        ].map(o => (
          <button
            key={o.v}
            onClick={() => setTab(o.v)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all duration-200 cursor-pointer ${
              tab === o.v ? 'bg-[#d4af37] text-black shadow-md' : 'text-white/45 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">{o.icon}</span>
            {o.label}
          </button>
        ))}
      </div>

      {/* ─── Place Bet ─── */}
      {tab === 'place' && (
        <div className="bg-[#0e1124]/85 backdrop-blur-md rounded-3xl border border-white/[0.05] shadow-lg p-6 space-y-5">
          {rounds.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <span className="material-symbols-outlined text-5xl text-white/10">event_busy</span>
              <p className="text-xs text-white/30 font-bold">ຍັງບໍ່ມີຮອບເປີດຮັບແທງໃນຕອນນີ້</p>
            </div>
          ) : (
            <>
              {/* Round select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/35 uppercase tracking-widest">ງວດ</label>
                <FieldBox>
                  <select className={inputCls} value={roundId} onChange={e => setRoundId(e.target.value)}>
                    {rounds.map(r => (
                      <option key={r.round_id} value={r.round_id} className="bg-[#0b0e1a]">
                        ງວດ #{r.draw_number} — {r.draw_date}
                      </option>
                    ))}
                  </select>
                </FieldBox>
              </div>

              {/* Prize type tabs */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/35 uppercase tracking-widest">ປະເພດເລກ</label>
                <div className="flex flex-wrap gap-2">
                  {PRIZE_TABS.map(o => (
                    <button
                      key={o.v}
                      onClick={() => { setPrizeType(o.v); setChosenNumber(''); }}
                      className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                        prizeType === o.v ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]' : 'border-white/[0.06] bg-[#0b0e1a] text-white/40'
                      }`}
                    >
                      {o.label} <span className="opacity-60">×{rates[o.v] || '—'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/35 uppercase tracking-widest">ເລກທີ່ເລືອກ ({len} ໂຕ)</label>
                <FieldBox>
                  <input
                    className={inputCls + ' font-mono tracking-[0.3em] text-center text-lg'}
                    value={chosenNumber}
                    maxLength={len}
                    placeholder={'0'.repeat(len)}
                    onChange={e => setChosenNumber(e.target.value.replace(/\D/g, '').slice(0, len))}
                  />
                </FieldBox>
              </div>

              {/* Stake input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/35 uppercase tracking-widest">ຈຳນວນເງິນເດີມພັນ</label>
                <FieldBox>
                  <input
                    type="number"
                    min="1"
                    className={inputCls}
                    value={stake}
                    placeholder="ເຊັ່ນ: 1000"
                    onChange={e => setStake(e.target.value)}
                  />
                </FieldBox>
              </div>

              {/* Potential payout */}
              <div className="flex items-center justify-between bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-xl px-4 py-3">
                <span className="text-xs font-bold text-white/50">ຖ້າຖືກ ຈະໄດ້ຮັບ</span>
                <span className="text-lg font-black text-[#d4af37]">{fmt(potential)} KIP</span>
              </div>

              <button
                onClick={handlePlaceBet}
                disabled={placing || !roundId}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#d4af37] hover:bg-[#b8860b] text-black text-sm font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {placing ? (
                  <span className="w-4 h-4 border-2 border-black/35 border-t-black rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>casino</span>
                )}
                ວາງເດີມພັນ
              </button>
            </>
          )}
        </div>
      )}

      {/* ─── My Bets ─── */}
      {tab === 'mybets' && (
        <div className="space-y-4">
          <div className="flex bg-[#0b0e1a] rounded-xl p-1 border border-white/[0.06] gap-1 w-fit">
            {['all', 'pending', 'won', 'lost', 'void'].map(v => (
              <button
                key={v}
                onClick={() => setBetStatusFilter(v)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all duration-200 cursor-pointer ${
                  betStatusFilter === v ? 'bg-[#d4af37] text-black' : 'text-white/45 hover:text-white'
                }`}
              >{v === 'all' ? 'ທັງໝົດ' : STATUS_BADGE[v]?.label}</button>
            ))}
          </div>

          {betsLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-white/[0.02] border border-white/[0.05] rounded-2xl animate-pulse" />)}
            </div>
          ) : bets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 bg-[#0e1124] rounded-3xl border border-white/[0.05]">
              <span className="material-symbols-outlined text-5xl text-white/10">inbox</span>
              <p className="text-xs text-white/30 font-bold">ຍັງບໍ່ມີການແທງ</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {bets.map(b => {
                const badge = STATUS_BADGE[b.status] || STATUS_BADGE.pending;
                const amount = betAmountDisplay(b);
                return (
                  <div key={b.bet_id} className="flex items-center justify-between gap-3 bg-[#0e1124]/85 border border-white/[0.05] rounded-2xl px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/25 flex items-center justify-center font-mono font-black text-[#d4af37] text-sm shrink-0">
                        {b.chosen_number}
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">{PRIZE_TABS.find(p => p.v === b.prize_type)?.label} · ງວດ #{b.draw_number}</p>
                        <p className="text-[10px] text-white/35 font-bold mt-0.5">ວາງ {fmt(b.stake)} KIP · {fmtDate(b.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black border ${badge.cls}`}>{badge.label}</span>
                      <p className={`text-xs font-black mt-1.5 ${amount.cls}`}>
                        {amount.text} KIP
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Wallet History ─── */}
      {tab === 'wallet' && (
        <div className="space-y-2.5">
          {historyLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-white/[0.02] border border-white/[0.05] rounded-2xl animate-pulse" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 bg-[#0e1124] rounded-3xl border border-white/[0.05]">
              <span className="material-symbols-outlined text-5xl text-white/10">receipt_long</span>
              <p className="text-xs text-white/30 font-bold">ຍັງບໍ່ມີປະຫວັດ</p>
            </div>
          ) : (
            history.map(h => {
              const meta = TX_LABEL[h.type] || { label: h.type, color: '#9ca3af' };
              const positive = Number(h.amount) >= 0;
              return (
                <div key={h.tx_id} className="flex items-center justify-between gap-3 bg-[#0e1124]/85 border border-white/[0.05] rounded-2xl px-5 py-3.5">
                  <div>
                    <p className="text-xs font-black" style={{ color: meta.color }}>{meta.label}</p>
                    <p className="text-[10px] text-white/35 font-bold mt-0.5">{h.note || fmtDate(h.created_at)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-black ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {positive ? '+' : ''}{fmt(h.amount)}
                    </p>
                    <p className="text-[10px] text-white/30 font-bold mt-0.5">ຍອດເຫຼືອ {fmt(h.balance_after)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
