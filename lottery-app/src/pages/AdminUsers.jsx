import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API } from '../utils/api';
import { useDebounce } from '../hooks/useDebounce';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import RoleBadge from '../components/RoleBadge';
import UserAvatar from '../components/UserAvatar';
import EmptyState from '../components/EmptyState';
import TableSkeleton from '../components/TableSkeleton';

// ── Helpers ────────────────────────────────────────────────────────

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('lo-LA', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Sort Header Cell ───────────────────────────────────────────────

function SortTh({ col, label, sortBy, sortDir, onSort }) {
  const active = sortBy === col;
  return (
    <th
      className="px-6 py-4 text-left cursor-pointer select-none group whitespace-nowrap"
      onClick={() => onSort(col)}
    >
      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-white/30 group-hover:text-[#d4af37] transition-colors">
        {label}
        <span className={`material-symbols-outlined text-[13px] transition-all ${active ? 'text-[#d4af37]' : 'opacity-0 group-hover:opacity-50'}`}>
          {active && sortDir === 'ASC' ? 'arrow_upward' : 'arrow_downward'}
        </span>
      </span>
    </th>
  );
}

// ── Status Toggle Badge ────────────────────────────────────────────

function ActiveBadge({ active }) {
  return active == 1 ? (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
      ໃຊ້ງານ
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-450" />
      ລະງັບ
    </span>
  );
}

// ── User Detail Drawer ─────────────────────────────────────────────

function UserDetailModal({ user, open, onClose, onEdit, onResetPass, onToggleActive, onDelete, currentUserId }) {
  if (!user) return null;
  return (
    <Modal open={open} onClose={onClose} title="ລາຍລະອຽດຜູ້ໃຊ້" size="md">
      <div className="space-y-5 text-left select-none">
        
        {/* Profile header */}
        <div className="flex items-center gap-4 p-4.5 bg-black/40 border border-white/[0.06] rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#d4af37] to-amber-500 opacity-80" />
          <UserAvatar name={user.full_name} username={user.username} size="xl" className="ring-2 ring-[#d4af37]/20 shrink-0" />
          <div className="min-w-0">
            <h4 className="text-base font-black text-white font-headline truncate">{user.full_name || '—'}</h4>
            <p className="text-[10px] text-white/45 mt-0.5 font-bold tracking-wide">@{user.username}</p>
            <div className="flex items-center gap-1.5 mt-2.5">
              <RoleBadge role={user.role} />
              <ActiveBadge active={user.is_active} />
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { icon: 'mail', label: 'Email', value: user.email || '—' },
            { icon: 'call', label: 'ເບີໂທ', value: user.phone_number || '—' },
            { icon: 'calendar_today', label: 'ສ້າງວັນທີ', value: formatDate(user.created_at) },
            { icon: 'update', label: 'ອັບເດດລ່າສຸດ', value: formatDate(user.updated_at) },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-black/20 border border-white/[0.04] rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 mb-1.5 text-white/35">
                <span className="material-symbols-outlined text-[14px] text-[#d4af37]">{icon}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
              </div>
              <p className="font-bold text-white/80 truncate text-xs">{value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-white/[0.06]">
          <button 
            onClick={() => onEdit(user)}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-[#d4af37] hover:bg-[#d4af37]/90 text-black text-xs font-black rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">edit</span>ແກ້ໄຂ
          </button>
          
          <button 
            onClick={() => onResetPass(user)}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">key</span>Reset Pass
          </button>
          
          <button 
            onClick={() => onToggleActive(user)}
            className={`flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer border ${
              user.is_active == 1 
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/25' 
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/25'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {user.is_active == 1 ? 'block' : 'check_circle'}
            </span>
            {user.is_active == 1 ? 'ລະງັບ' : 'ເປີດໃຊ້'}
          </button>
          
          {currentUserId !== user.user_id && (
            <button 
              onClick={() => onDelete(user)}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-black rounded-xl hover:bg-rose-500/20 transition-all ml-auto cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">delete</span>ລຶບ
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ── User Form Modal ────────────────────────────────────────────────

const EMPTY_FORM = { username: '', password: '', full_name: '', email: '', phone_number: '', role: 'staff', is_active: 1 };

function UserFormModal({ open, onClose, editingUser, onSave, loading }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPass, setShowPass] = useState(false);
  const isEdit = !!editingUser;

  useEffect(() => {
    if (open) {
      setForm(editingUser
        ? { user_id: editingUser.user_id, full_name: editingUser.full_name || '', email: editingUser.email || '', phone_number: editingUser.phone_number || '', role: editingUser.role, is_active: editingUser.is_active }
        : EMPTY_FORM
      );
      setShowPass(false);
    }
  }, [open, editingUser]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form, isEdit);
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້' : 'ເພີ່ມຜູ້ໃຊ້ໃໝ່'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {!isEdit && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-white/35 mb-1.5 uppercase tracking-wider">Username *</label>
              <input required minLength={4} type="text" autoComplete="off" placeholder="ຢ່າງໜ້ອຍ 4 ຕົວ"
                className="w-full bg-black/45 border border-white/[0.08] rounded-xl p-3 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/35 focus:border-[#d4af37]/45 transition-all duration-200"
                value={form.username} onChange={e => set('username', e.target.value.toLowerCase().replace(/\s/g, ''))} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-white/35 mb-1.5 uppercase tracking-wider">Password *</label>
              <div className="relative">
                <input required minLength={6} type={showPass ? 'text' : 'password'} placeholder="ຢ່າງໜ້ອຍ 6 ຕົວ" autoComplete="new-password"
                  className="w-full bg-black/45 border border-white/[0.08] rounded-xl p-3 pr-10 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/35 focus:border-[#d4af37]/45 transition-all duration-200"
                  value={form.password} onChange={e => set('password', e.target.value)} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#d4af37] cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-[18px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-black text-white/35 mb-1.5 uppercase tracking-wider">ຊື່ເຕັມ *</label>
          <input required type="text" placeholder="ຊື່ ແລະ ນາມສະກຸນ"
            className="w-full bg-black/45 border border-white/[0.08] rounded-xl p-3 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/35 focus:border-[#d4af37]/45 transition-all duration-200"
            value={form.full_name} onChange={e => set('full_name', e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-white/35 mb-1.5 uppercase tracking-wider">Email</label>
            <input type="email" placeholder="user@example.com"
              className="w-full bg-black/45 border border-white/[0.08] rounded-xl p-3 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/35 focus:border-[#d4af37]/45 transition-all duration-200"
              value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-white/35 mb-1.5 uppercase tracking-wider">ເບີໂທ</label>
            <input type="tel" placeholder="020xxxxxxxx"
              className="w-full bg-black/45 border border-white/[0.08] rounded-xl p-3 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/35 focus:border-[#d4af37]/45 transition-all duration-200"
              value={form.phone_number} onChange={e => set('phone_number', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-white/35 mb-1.5 uppercase tracking-wider">ຕຳແໜ່ງ *</label>
            <select className="w-full bg-black/45 border border-white/[0.08] rounded-xl p-3 text-xs font-bold text-white/85 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/35 focus:border-[#d4af37]/45 transition-all duration-200 cursor-pointer"
              value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="admin" className="bg-[#0e0e1a] text-white">Admin</option>
              <option value="staff" className="bg-[#0e0e1a] text-white">Staff</option>
              <option value="member" className="bg-[#0e0e1a] text-white">Member</option>
            </select>
          </div>
          {isEdit && (
            <div>
              <label className="block text-[10px] font-black text-white/35 mb-1.5 uppercase tracking-wider">ສະຖານະ</label>
              <select className="w-full bg-black/45 border border-white/[0.08] rounded-xl p-3 text-xs font-bold text-white/85 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/35 focus:border-[#d4af37]/45 transition-all duration-200 cursor-pointer"
                value={form.is_active} onChange={e => set('is_active', parseInt(e.target.value))}>
                <option value={1} className="bg-[#0e0e1a] text-white">ໃຊ້ງານ (Active)</option>
                <option value={0} className="bg-[#0e0e1a] text-white">ລະງັບ (Disabled)</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-white/65 hover:text-white font-black rounded-xl transition-colors text-xs cursor-pointer">
            ຍົກເລີກ
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 bg-[#d4af37] text-black font-black rounded-xl hover:bg-[#d4af37]/90 transition-all text-xs disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/10 cursor-pointer">
            {loading && <span className="w-4 h-4 border-2 border-black/35 border-t-black rounded-full animate-spin" />}
            {isEdit ? 'ບັນທຶກ' : 'ສ້າງຜູ້ໃຊ້'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Password Reset Modal ───────────────────────────────────────────

function PasswordModal({ open, onClose, targetUser, onSave, loading }) {
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  useEffect(() => { if (open) { setPass(''); setShow(false); } }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="ຕັ້ງລະຫັດຜ່ານໃໝ່" size="sm">
      <div className="space-y-4 text-left">
        {targetUser && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3.5">
            <span className="material-symbols-outlined text-amber-500 text-lg shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <p className="text-xs text-white/80 font-bold leading-relaxed">
              ຕັ້ງ password ໃໝ່ສຳລັບ <span className="font-black text-amber-400">@{targetUser.username}</span>
            </p>
          </div>
        )}
        <form onSubmit={e => { e.preventDefault(); onSave(pass); }} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-white/35 mb-1.5 uppercase tracking-wider">ລະຫັດຜ່ານໃໝ່ *</label>
            <div className="relative">
              <input required minLength={6} type={show ? 'text' : 'password'} placeholder="ຢ່າງໜ້ອຍ 6 ຕົວ" autoComplete="new-password"
                className="w-full bg-black/45 border border-white/[0.08] rounded-xl p-3 pr-10 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/35 focus:border-[#d4af37]/45 transition-all duration-200"
                value={pass} onChange={e => setPass(e.target.value)} />
              <button type="button" onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#d4af37] cursor-pointer transition-colors">
                <span className="material-symbols-outlined text-[18px]">{show ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            {pass && (
              <div className="mt-2.5 flex gap-1">
                {['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400'].map((c, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${pass.length > i * 2 + 2 ? c : 'bg-white/[0.05]'}`} />
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-white/65 hover:text-white font-black rounded-xl transition-colors text-xs cursor-pointer">
              ຍົກເລີກ
            </button>
            <button type="submit" disabled={loading || pass.length < 6}
              className="flex-1 py-2.5 bg-amber-500 text-white font-black rounded-xl hover:bg-amber-600 transition-all text-xs disabled:opacity-50 flex items-center justify-center gap-2 shadow-md cursor-pointer">
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              ຕັ້ງລະຫັດໃໝ່
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

// ── Pagination ─────────────────────────────────────────────────────

function Paginator({ page, totalPages, total, perPage, onPage, onPerPage }) {
  if (totalPages <= 1 && total <= perPage) return null;
  const from = (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-white/[0.05] bg-black/10">
      <div className="flex items-center gap-2 text-xs text-white/45 font-bold">
        <span>ສະແດງ {from}–{to} ຈາກ {total} ຄົນ</span>
        <select value={perPage} onChange={e => onPerPage(+e.target.value)}
          className="bg-black/45 border border-white/[0.08] rounded-lg px-2.5 py-1 text-xs font-bold text-white/80 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/30 cursor-pointer">
          {[10, 20, 50].map(n => <option key={n} value={n} className="bg-[#0e0e1a] text-white">{n} / ໜ້າ</option>)}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(1)} disabled={page === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-25 hover:bg-white/[0.04] text-white/45 hover:text-white transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[16px]">first_page</span>
        </button>
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-25 hover:bg-white/[0.04] text-white/45 hover:text-white transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let p;
          if (totalPages <= 5) p = i + 1;
          else if (page <= 3) p = i + 1;
          else if (page >= totalPages - 2) p = totalPages - 4 + i;
          else p = page - 2 + i;
          return (
            <button key={p} onClick={() => onPage(p)}
              className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                p === page 
                  ? 'bg-[#d4af37] text-black shadow-md shadow-[#d4af37]/10 scale-105' 
                  : 'hover:bg-white/[0.04] text-white/45 hover:text-white cursor-pointer'
              }`}>
              {p}
            </button>
          );
        })}
        <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-25 hover:bg-white/[0.04] text-white/45 hover:text-white transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
        <button onClick={() => onPage(totalPages)} disabled={page === totalPages}
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-25 hover:bg-white/[0.04] text-white/45 hover:text-white transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[16px]">last_page</span>
        </button>
      </div>
    </div>
  );
}

// ── Stats Cards ────────────────────────────────────────────────────

function StatsBar({ stats }) {
  if (!stats) return null;
  const cards = [
    { label: 'ທັງໝົດ (Total)', value: stats.total_users, icon: 'group', colorClass: 'text-[#d4af37]', iconBgClass: 'bg-[#d4af37]/10 border-[#d4af37]/20 text-[#d4af37]' },
    { label: 'ໃຊ້ງານ (Active)', value: stats.active_users, icon: 'check_circle', colorClass: 'text-emerald-400', iconBgClass: 'bg-[#10b981]/10 border-[#10b981]/20 text-emerald-400' },
    { label: 'Admin', value: stats.admin_count, icon: 'admin_panel_settings', colorClass: 'text-rose-400', iconBgClass: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
    { label: 'Staff', value: stats.staff_count, icon: 'badge', colorClass: 'text-amber-400', iconBgClass: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left select-none">
      {cards.map(c => (
        <div key={c.label} className="bg-[#0e1124]/85 backdrop-blur-md rounded-2xl border border-white/[0.05] shadow-lg p-5 flex flex-col gap-4 hover:shadow-2xl hover:-translate-y-1 hover:border-[#d4af37]/35 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350" />
          <div className="flex items-start gap-2">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-105 group-hover:rotate-6 ${c.iconBgClass}`}>
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {c.icon}
              </span>
            </div>
          </div>
          <div className="relative z-10">
            <p className={`text-[28px] font-black leading-none mb-1.5 tabular-nums tracking-tight font-space ${c.colorClass}`}>
              {(c.value ?? 0).toLocaleString()}
            </p>
            <p className="text-[10px] font-black text-white/35 leading-snug tracking-widest uppercase">{c.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Staff-Only View ────────────────────────────────────────────────

function StaffView() {
  const { user, authFetch } = useAuth();
  const [form, setForm] = useState({ current_password: '', new_password: '' });
  const [show, setShow] = useState({ cur: false, new: false });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { ok, data } = await authFetch(`${API}/index.php?action=change_password`, {
      method: 'POST',
      body: JSON.stringify({ current_password: form.current_password, new_password: form.new_password }),
    });
    setLoading(false);
    if (ok) { toast.success('ປ່ຽນລະຫັດຜ່ານສຳເລັດ'); setForm({ current_password: '', new_password: '' }); }
    else toast.error(data?.error || 'ເກີດຂໍ້ຜິດພາດ');
  };

  return (
    <div className="max-w-md mx-auto space-y-5 text-left select-none mt-10">
      <div className="bg-[#0e1124]/85 backdrop-blur-md rounded-2xl p-7 border border-white/[0.05] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
        
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center border border-primary/10 shrink-0 text-[#d4af37]">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>key</span>
          </div>
          <div>
            <h2 className="text-base font-black text-white font-headline">ປ່ຽນລະຫັດຜ່ານ</h2>
            <p className="text-[10px] text-white/45 font-bold tracking-wide mt-0.5">@{user?.username}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'current_password', label: 'ລະຫັດຜ່ານເກົ່າ', showKey: 'cur' },
            { key: 'new_password', label: 'ລະຫັດຜ່ານໃໝ່ (ຢ່າງໜ້ອຍ 6 ຕົວ)', showKey: 'new' },
          ].map(({ key, label, showKey }) => (
            <div key={key}>
              <label className="block text-[10px] font-black text-white/35 mb-1.5 uppercase tracking-wider">{label}</label>
              <div className="relative">
                <input required minLength={key === 'new_password' ? 6 : 1} type={show[showKey] ? 'text' : 'password'}
                  className="w-full bg-black/45 border border-white/[0.08] rounded-xl p-3 pr-10 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/30 focus:border-[#d4af37]/45 transition-all duration-200"
                  value={form[key]} onChange={e => set(key, e.target.value)} />
                <button type="button" onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-[#d4af37] transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">{show[showKey] ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-[#d4af37] hover:bg-[#d4af37]/90 text-black font-black rounded-xl transition-all shadow-md shadow-[#d4af37]/10 hover:translate-y-[-1px] active:scale-95 disabled:opacity-60 text-xs flex items-center justify-center gap-2 cursor-pointer mt-2">
            {loading && <span className="w-4 h-4 border-2 border-black/35 border-t-black rounded-full animate-spin" />}
            ບັນທຶກລະຫັດຜ່ານໃໝ່
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main Admin View ────────────────────────────────────────────────

export default function AdminUsers() {
  const { user, authFetch } = useAuth();

  // State
  const [users, setUsers]         = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRole]     = useState('');
  const [activeFilter, setActive] = useState('');
  const [sortBy, setSortBy]       = useState('created_at');
  const [sortDir, setSortDir]     = useState('DESC');
  const [page, setPage]           = useState(1);
  const [perPage, setPerPage]     = useState(20);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [formOpen, setFormOpen]     = useState(false);
  const [passOpen, setPassOpen]     = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingUser, setEditingUser]   = useState(null);
  const [targetUser, setTargetUser]     = useState(null);
  const [confirmConfig, setConfirmConfig] = useState({});
  const [detailUser, setDetailUser] = useState(null);

  const debouncedSearch = useDebounce(search, 400);
  const isAdmin = user?.role === 'admin';

  // Fetch users
  const fetchUsers = useCallback(async (opts = {}) => {
    const p = opts.page ?? page;
    const pp = opts.perPage ?? perPage;
    const sb = opts.sortBy ?? sortBy;
    const sd = opts.sortDir ?? sortDir;
    const s  = opts.search ?? debouncedSearch;
    const rf = opts.role ?? roleFilter;
    const af = opts.active ?? activeFilter;

    const params = new URLSearchParams({
      action: 'list_users', page: p, per_page: pp, sort: sb, dir: sd,
      ...(s && { search: s }), ...(rf && { role: rf }), ...(af !== '' && { is_active: af }),
    });
    setLoading(true);
    const { ok, data } = await authFetch(`${API}/index.php?${params}`).catch(() => ({ ok: false, data: {} }));
    setLoading(false);
    if (ok) {
      setUsers(data.data ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.total_pages ?? 1);
    } else {
      toast.error(data?.error || 'ໂຫຼດຂໍ້ມູນ user ບໍ່ສຳເລັດ');
    }
  }, [authFetch, page, perPage, sortBy, sortDir, debouncedSearch, roleFilter, activeFilter]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    const { ok, data } = await authFetch(`${API}/index.php?action=user_stats`).catch(() => ({ ok: false }));
    if (ok) setStats(data);
  }, [authFetch]);

  useEffect(() => {
    if (!user) return;
    if (isAdmin) { fetchStats(); fetchUsers(); }
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    setPage(1);
    fetchUsers({ page: 1, search: debouncedSearch, role: roleFilter, active: activeFilter });
  }, [debouncedSearch, roleFilter, activeFilter]);

  const handleSort = (col) => {
    const dir = sortBy === col && sortDir === 'ASC' ? 'DESC' : 'ASC';
    setSortBy(col); setSortDir(dir);
    fetchUsers({ sortBy: col, sortDir: dir });
  };

  const handlePage = (p) => { setPage(p); fetchUsers({ page: p }); };
  const handlePerPage = (pp) => { setPerPage(pp); setPage(1); fetchUsers({ page: 1, perPage: pp }); };

  // CRUD handlers
  const handleSave = async (form, isEdit) => {
    setSaving(true);
    const action = isEdit ? 'update_user' : 'create_user';
    const { ok, data } = await authFetch(`${API}/index.php?action=${action}`, { method: 'POST', body: JSON.stringify(form) });
    setSaving(false);
    if (ok) {
      toast.success(isEdit ? 'ບັນທຶກການແກ້ໄຂສຳເລັດ' : 'ສ້າງຜູ້ໃຊ້ໃໝ່ສຳເລັດ');
      setFormOpen(false); fetchUsers(); fetchStats();
    } else {
      toast.error(data?.error || 'ເກີດຂໍ້ຜິດພາດ');
    }
  };

  const handleResetPass = async (pass) => {
    if (!targetUser) return;
    setSaving(true);
    const { ok, data } = await authFetch(`${API}/index.php?action=change_password`, {
      method: 'POST', body: JSON.stringify({ target_user_id: targetUser.user_id, new_password: pass }),
    });
    setSaving(false);
    if (ok) { toast.success('ປ່ຽນລະຫັດຜ່ານສຳເລັດ'); setPassOpen(false); }
    else toast.error(data?.error || 'ເກີດຂໍ້ຜິດພາດ');
  };

  const handleDelete = (u) => {
    setConfirmConfig({
      title: 'ລຶບຜູ້ໃຊ້',
      message: `ທ່ານຕ້ອງການລຶບ @${u.username} ແທ້ບໍ? ການກະທຳນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້.`,
      variant: 'danger',
      confirmLabel: 'ລຶບ',
      onConfirm: async () => {
        setConfirmOpen(false);
        const { ok, data } = await authFetch(`${API}/index.php?action=delete_user`, {
          method: 'POST', body: JSON.stringify({ user_id: u.user_id }),
        });
        if (ok) { toast.success('ລຶບຜູ້ໃຊ້ສຳເລັດ'); fetchUsers(); fetchStats(); setDetailOpen(false); }
        else toast.error(data?.error || 'ລຶບ user ບໍ່ສຳເລັດ');
      },
    });
    setConfirmOpen(true);
  };

  const handleToggleActive = (u) => {
    const nextActive = u.is_active == 1 ? 0 : 1;
    setConfirmConfig({
      title: nextActive ? '\u0ec0\u0e9b\u0eb5\u0e94\u0ec3\u0e8a\u0ec9\u0e87\u0eb2\u0e99' : '\u0ea5\u0eb0\u0e87\u0eb1\u0e9a\u0e84\u0eb2\u0e99\u0ec3\u0e8a\u0ec9\u0e87\u0eb2\u0e99',
      message: `ທ່ານຕ້ອງການ${nextActive ? 'ເປີດໃຊ້' : 'ລະງັບ'} @${u.username} ແທ້ບໍ?`,
      variant: nextActive ? 'default' : 'danger',
      confirmLabel: nextActive ? 'ເປີດໃຊ້' : 'ລະງັບ',
      onConfirm: async () => {
        setConfirmOpen(false);
        const { ok, data } = await authFetch(`${API}/index.php?action=update_user`, {
          method: 'POST',
          body: JSON.stringify({ user_id: u.user_id, full_name: u.full_name, role: u.role, is_active: nextActive, email: u.email || '', phone_number: u.phone_number || '' }),
        });
        if (ok) { toast.success(nextActive ? 'ເປີດໃຊ້ງານສຳເລັດ' : 'ລະງັບສຳເລັດ'); fetchUsers(); fetchStats(); setDetailOpen(false); }
        else toast.error(data?.error || 'ເກີດຂໍ້ຜິດພາດ');
      },
    });
    setConfirmOpen(true);
  };

  // Open modals
  const openCreate = () => { setEditingUser(null); setFormOpen(true); };
  const openEdit   = (u) => { setEditingUser(u); setFormOpen(true); setDetailOpen(false); };
  const openPass   = (u) => { setTargetUser(u); setPassOpen(true); setDetailOpen(false); };
  const openDetail = async (u) => {
    setDetailUser(u);
    setDetailOpen(true);
    // Fetch full user with last_login
    const { ok, data } = await authFetch(`${API}/index.php?action=get_user&user_id=${u.user_id}`);
    if (ok) setDetailUser(data);
  };

  if (!isAdmin) return <StaffView />;

  return (
    <div className="space-y-6 text-left">
      
      {/* Stats overview cards */}
      <StatsBar stats={stats} />

      {/* Control Deck Header */}
      <div className="bg-[#0e1124]/75 backdrop-blur-md rounded-2xl border border-white/[0.05] p-6 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37]/45 to-transparent" />
        
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-base font-black text-white font-headline">ຈັດການຜູ້ໃຊ້ (Users)</h1>
            <p className="text-[10px] text-white/45 font-bold tracking-wide uppercase mt-0.5">ຈັດການສິດທິ, ພະນັກງານ ແລະ ລະຫັດຜ່ານລະບົບ</p>
          </div>
          <button 
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-black px-5 py-2.5 rounded-xl font-black text-[11px] shadow-lg shadow-[#d4af37]/10 transition-all active:scale-95 cursor-pointer shrink-0 uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            ເພີ່ມຜູ້ໃຊ້ໃໝ່
          </button>
        </div>

        {/* Filter deck inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          {/* Search box */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-white/35">search</span>
            <input 
              type="text" 
              placeholder="ຄົ້ນຫາ username, ຊື່, email..."
              className="w-full bg-black/45 border border-white/[0.08] rounded-xl pl-9 pr-8 py-2.5 text-[11px] font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/30 focus:border-[#d4af37]/45 transition-all duration-200"
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
            {search && (
              <button 
                onClick={() => setSearch('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
          
          {/* Role selector dropdown */}
          <select 
            value={roleFilter} 
            onChange={e => setRole(e.target.value)}
            className="bg-black/45 border border-white/[0.08] rounded-xl px-3 py-2.5 text-[11px] font-bold text-white/75 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/30 focus:border-[#d4af37]/45 transition-all duration-200 cursor-pointer"
          >
            <option value="" className="bg-[#0e0e1a] text-white">ທຸກຕຳແໜ່ງ</option>
            <option value="admin" className="bg-[#0e0e1a] text-white">Admin</option>
            <option value="staff" className="bg-[#0e0e1a] text-white">Staff</option>
            <option value="member" className="bg-[#0e0e1a] text-white">Member</option>
          </select>
          
          {/* Status selector dropdown */}
          <select 
            value={activeFilter} 
            onChange={e => setActive(e.target.value)}
            className="bg-black/45 border border-white/[0.08] rounded-xl px-3 py-2.5 text-[11px] font-bold text-white/75 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/30 focus:border-[#d4af37]/45 transition-all duration-200 cursor-pointer"
          >
            <option value="" className="bg-[#0e0e1a] text-white">ທຸກສະຖານະ</option>
            <option value="1" className="bg-[#0e0e1a] text-white">ໃຊ້ງານ</option>
            <option value="0" className="bg-[#0e0e1a] text-white">ລະງັບ</option>
          </select>
        </div>
      </div>

      {/* Users table list */}
      <div className="bg-[#0e1124]/75 backdrop-blur-md rounded-2xl border border-white/[0.05] shadow-lg overflow-hidden relative group">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
        <div className="overflow-x-auto relative z-10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.01]">
                <SortTh col="username"   label="ຜູ້ໃຊ້"     sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="full_name"  label="ຊື່ເຕັມ"     sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="role"       label="ຕຳແໜ່ງ"     sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="is_active"  label="ສະຖານະ"     sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="created_at" label="ສ້າງວັນທີ"  sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-widest text-white/30">ການຈັດການ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {loading ? (
                <TableSkeleton cols={6} rows={6} />
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon="manage_accounts"
                      title="ບໍ່ພົບ user"
                      description={search || roleFilter || activeFilter ? 'ລອງປ່ຽນຕົວກ່ອງ' : 'ຍັງບໍ່ມີ user ໃນລະບົບ'}
                      action={!search && !roleFilter && !activeFilter && (
                        <button onClick={openCreate} className="px-5 py-2.5 bg-[#d4af37] text-black font-black text-xs rounded-xl hover:bg-[#d4af37]/90 transition-all shadow-md shadow-[#d4af37]/10 cursor-pointer">
                          ເພີ່ມ user ຄົນທຳອິດ
                        </button>
                      )}
                    />
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr 
                    key={u.user_id}
                    className="hover:bg-white/[0.02] border-b border-white/[0.03] transition-all duration-200 cursor-pointer group"
                    onClick={() => openDetail(u)}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={u.full_name} username={u.username} size="sm" />
                        <div className="text-left min-w-0">
                          <p className="font-bold text-xs text-white">@{u.username}</p>
                          {u.email && <p className="text-[10px] text-white/35 truncate max-w-[150px] mt-0.5 font-bold">{u.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-white/55 font-bold text-left">
                      {u.full_name || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-left">
                      <RoleBadge role={u.role} size="xs" />
                    </td>
                    <td className="px-5 py-3.5 text-left">
                      <ActiveBadge active={u.is_active} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-white/45 font-bold text-left">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div 
                        className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity" 
                        onClick={e => e.stopPropagation()}
                      >
                        <button 
                          onClick={() => openEdit(u)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors cursor-pointer" 
                          title="ແກ້ໄຂ"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        
                        <button 
                          onClick={() => openPass(u)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer" 
                          title="Reset password"
                        >
                          <span className="material-symbols-outlined text-base">key</span>
                        </button>
                        
                        {(user?.id !== u.user_id && user?.user_id !== u.user_id) && (
                          <button 
                            onClick={() => handleDelete(u)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-450 hover:bg-rose-500/10 transition-colors cursor-pointer" 
                            title="ລຶບ"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Paginator page={page} totalPages={totalPages} total={total} perPage={perPage} onPage={handlePage} onPerPage={handlePerPage} />
      </div>

      {/* Modals */}
      <UserFormModal open={formOpen} onClose={() => setFormOpen(false)} editingUser={editingUser} onSave={handleSave} loading={saving} />
      <PasswordModal open={passOpen} onClose={() => setPassOpen(false)} targetUser={targetUser} onSave={handleResetPass} loading={saving} />
      <UserDetailModal
        user={detailUser} open={detailOpen} onClose={() => setDetailOpen(false)}
        onEdit={openEdit} onResetPass={openPass}
        onToggleActive={handleToggleActive} onDelete={handleDelete}
        currentUserId={user?.id}
      />
      <ConfirmDialog open={confirmOpen} {...confirmConfig} onCancel={() => setConfirmOpen(false)} />
    </div>
  );
}
