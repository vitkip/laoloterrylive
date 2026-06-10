import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API } from '../utils/api';
import { useDebounce } from '../hooks/useDebounce';
import EmptyState from '../components/EmptyState';
import TableSkeleton from '../components/TableSkeleton';
import Modal from '../components/Modal';

// ── Date/Time Formatter ─────────────────────────────────────────────
function formatDateTime(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('lo-LA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Sender Initials Coin ────────────────────────────────────────────
function SenderCoin({ name = '' }) {
  const clean = name.trim();
  const initials = clean ? clean.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0d0e1c] to-[#161b36] border border-[#d4af37]/45 shadow-[0_2px_8px_rgba(212,175,55,0.15)] flex items-center justify-center shrink-0">
      <span className="text-[13px] font-black text-[#ffd700] tracking-wider">{initials}</span>
    </div>
  );
}

export default function AdminContacts() {
  const { user, authFetch } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [viewingMessage, setViewingMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);
  const skipPageFetch = useRef(false);

  const fetchMessages = useCallback(async (opts = {}) => {
    const p  = opts.page    ?? page;
    const pp = opts.perPage ?? perPage;
    const s  = opts.search  ?? debouncedSearch;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'list_contacts',
        page: p,
        per_page: pp,
      });
      if (s) params.append('search', s);

      const res = await authFetch(`${API}/index.php?${params.toString()}`);
      if (!res.ok) throw new Error('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຂໍ້ຄວາມໄດ້');

      const data = res.data;
      setMessages(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.last_page || 1);
    } catch (err) {
      toast.error(err.message || 'ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, debouncedSearch, authFetch]);

  useEffect(() => {
    skipPageFetch.current = true;
    fetchMessages({ page: 1 });
    setPage(1);
  }, [debouncedSearch, perPage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (skipPageFetch.current) { skipPageFetch.current = false; return; }
    fetchMessages();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const markAsRead = useCallback(async (messageId) => {
    try {
      await authFetch(`${API}/index.php?action=mark_contact_read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId }),
      });
      setMessages(prev => prev.map(m =>
        m.message_id === messageId ? { ...m, is_read: 1 } : m
      ));
    } catch (_) {}
  }, [authFetch]);

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      const res = await authFetch(`${API}/index.php?action=delete_contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: deletingId }),
      });
      if (!res.ok) throw new Error(res.data?.error || 'ລົບບໍ່ສຳເລັດ');
      toast.success('ລົບຂໍ້ຄວາມຕິດຕໍ່ສຳເລັດ!');
      setDeletingId(null);
      fetchMessages();
    } catch (err) {
      toast.error(err.message || 'ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 select-none text-left">
      
      {/* ── Page Header Billboard ── */}
      <div className="bg-gradient-to-br from-[#0d0e1c] to-[#161b36] border border-[#d4af37]/25 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-[-30px] right-[-30px] w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[#ffd700] text-2xl drop-shadow-[0_0_8px_#ffd700]">mail</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight font-headline">ຂໍ້ຄວາມຕິດຕໍ່</h1>
              <p className="text-xs text-white/50 mt-1 font-medium">ລາຍການຄຳຄິດເຫັນ ແລະ ຂໍ້ຄວາມສອບຖາມຈາກໜ້າຕິດຕໍ່</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#d4af37]/5 border border-[#d4af37]/15 rounded-xl px-3 py-1 text-xs text-[#ffd700] font-black tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffd700] shadow-[0_0_8px_#ffd700] animate-pulse shrink-0" />
            ລວມ {total} ຂໍ້ຄວາມ
          </div>
        </div>
      </div>

      {/* ── Search Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-black/25 border border-white/[0.06] rounded-2xl p-4">
        <div className="relative w-full sm:max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-lg">search</span>
          <input
            type="text"
            placeholder="ຄົ້ນຫາຕາມຊື່, ອີເມລ ຫຼື ຂໍ້ຄວາມ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#070712] border border-white/[0.08] rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/45 focus:ring-1 focus:ring-[#d4af37]/35 transition duration-200"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Main List Container ── */}
      <div className="bg-[#0d0e1c]/75 backdrop-blur-md rounded-3xl border border-white/[0.05] shadow-xl overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.01] text-white/40 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 text-center w-12">#</th>
                  <th className="py-4 px-6">ຜູ້ສົ່ງຕິດຕໍ່</th>
                  <th className="py-4 px-6">ຂໍ້ຄວາມ</th>
                  <th className="py-4 px-6">ວັນທີສົ່ງ</th>
                  {isAdmin && <th className="py-4 px-6 text-center w-20">ຈັດການ</th>}
                </tr>
              </thead>
              <tbody>
                <TableSkeleton rows={6} cols={isAdmin ? 5 : 4} />
              </tbody>
            </table>
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon="mail_lock"
            title="ບໍ່ພົບຂໍ້ຄວາມຕິດຕໍ່"
            description={search ? "ບໍ່ພົບຂໍ້ມູນທີ່ກົງກັບຄຳຄົ້ນຫາຂອງທ່ານ" : "ຍັງບໍ່ມີຂໍ້ຄວາມສອບຖາມໃດໆໃນລະບົບ"}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.01] text-white/40 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 text-center w-12">#</th>
                  <th className="py-4 px-6">ຜູ້ສົ່ງຕິດຕໍ່</th>
                  <th className="py-4 px-6">ຂໍ້ຄວາມ</th>
                  <th className="py-4 px-6">ວັນທີສົ່ງ</th>
                  {isAdmin && <th className="py-4 px-6 text-center w-20">ຈັດການ</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {messages.map((m, idx) => {
                  const seq = (page - 1) * perPage + idx + 1;
                  return (
                    <tr
                      key={m.message_id}
                      className={`transition-colors duration-150 cursor-pointer group ${!m.is_read ? 'bg-white/[0.025]' : 'hover:bg-white/[0.01]'}`}
                      onClick={() => { setViewingMessage(m); if (!m.is_read) markAsRead(m.message_id); }}
                    >
                      <td className="py-4 px-6 text-center font-bold text-white/30">{seq}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <SenderCoin name={m.name} />
                            {!m.is_read && (
                              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-[#0d0e1c] shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                            )}
                          </div>
                          <div>
                            <p className={`font-black font-sans truncate max-w-[160px] ${!m.is_read ? 'text-white' : 'text-white/70'}`}>{m.name}</p>
                            <p className="text-[10px] text-white/40 font-semibold font-mono truncate max-w-[160px]">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-sm">
                        <p className={`font-sans truncate leading-relaxed ${!m.is_read ? 'text-white font-semibold' : 'text-white/60'}`}>
                          {m.message}
                        </p>
                      </td>
                      <td className="py-4 px-6 font-mono text-white/45 font-medium shrink-0">
                        {formatDateTime(m.created_at)}
                      </td>
                      {isAdmin && (
                        <td className="py-4 px-6 text-center" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setDeletingId(m.message_id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition duration-150 cursor-pointer"
                            title="ລົບຂໍ້ຄວາມ"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Custom Paginator ── */}
        {!loading && messages.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-5 border-t border-white/[0.05] bg-black/10">
            <div className="flex items-center gap-2 text-xs text-white/45 font-bold">
              <span>ສະແດງ {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} ຈາກ {total} ລາຍການ</span>
              <select
                value={perPage}
                onChange={e => { setPerPage(+e.target.value); setPage(1); }}
                className="bg-black/45 border border-white/[0.08] rounded-xl px-2.5 py-1 text-xs font-bold text-white/80 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/30 cursor-pointer"
              >
                {[15, 30, 50].map(n => <option key={n} value={n} className="bg-[#0e0e1a] text-white">{n} / ໜ້າ</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-20 hover:bg-white/[0.04] text-white/45 hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">first_page</span>
              </button>
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                className="w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-20 hover:bg-white/[0.04] text-white/45 hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                      p === page 
                        ? 'bg-[#d4af37] text-black shadow-md shadow-[#d4af37]/10 scale-105' 
                        : 'hover:bg-white/[0.04] text-white/45 hover:text-white cursor-pointer'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-20 hover:bg-white/[0.04] text-white/45 hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-20 hover:bg-white/[0.04] text-white/45 hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">last_page</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── View Detail Modal ── */}
      {viewingMessage && (
        <Modal
          open={true}
          onClose={() => setViewingMessage(null)}
          title="ລາຍລະອຽດຂໍ້ຄວາມຕິດຕໍ່"
        >
          <div className="space-y-5 text-left text-xs text-white/90">
            <div className="grid grid-cols-2 gap-4 bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl">
              <div>
                <p className="text-[10px] text-white/45 font-bold uppercase tracking-wider mb-0.5">ຊື່ຜູ້ຕິດຕໍ່</p>
                <p className="font-black font-sans text-[#ffd700] text-sm">{viewingMessage.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/45 font-bold uppercase tracking-wider mb-0.5">ອີເມລ</p>
                <p className="font-black font-mono text-white/80">{viewingMessage.email}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-white/45 font-bold uppercase tracking-wider mb-0.5">ວັນທີສົ່ງ</p>
                <p className="font-bold text-white/60 font-mono">{formatDateTime(viewingMessage.created_at)}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] text-white/45 font-bold uppercase tracking-wider">ເນື້ອຫາຂໍ້ຄວາມ</p>
              <div className="bg-black/45 border border-white/[0.06] rounded-2xl p-4 min-h-[120px] text-white/80 font-sans leading-relaxed break-words whitespace-pre-wrap">
                {viewingMessage.message}
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setViewingMessage(null)}
                className="w-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white/80 hover:text-white font-black py-2.5 rounded-xl transition duration-150 text-xs"
              >
                ປິດໜ້າຈໍ
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    setDeletingId(viewingMessage.message_id);
                    setViewingMessage(null);
                  }}
                  className="bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-black px-5 py-2.5 rounded-xl transition duration-150 text-xs"
                >
                  ລົບຂໍ້ຄວາມ
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deletingId && (
        <Modal
          open={true}
          onClose={() => setDeletingId(null)}
          title="ຢືນຢັນການລົບຂໍ້ຄວາມ"
        >
          <div className="space-y-4 text-center text-xs">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <span className="material-symbols-outlined text-xl">warning</span>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-black text-white font-headline">ຕ້ອງການລົບຂໍ້ຄວາມນີ້ແທ້ຫຼືບໍ່?</h3>
              <p className="text-white/50 leading-relaxed max-w-xs mx-auto">
                ການກະທຳນີ້ຈະລົບຂໍ້ມູນອອກຈາກຖານຂໍ້ມູນຖາວອນ ແລະ ບໍ່ສາມາດກູ້ຄືນໄດ້.
              </p>
            </div>
            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setDeletingId(null)}
                disabled={deleting}
                className="w-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white/80 hover:text-white font-black py-2.5 rounded-xl transition duration-150 text-xs disabled:opacity-50"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-2.5 rounded-xl transition duration-150 text-xs shadow-md shadow-rose-600/10 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {deleting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">delete</span>
                    ຢືນຢັນລົບ
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
