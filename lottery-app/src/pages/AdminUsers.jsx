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

function formatDateTime(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('lo-LA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Sort Header Cell ───────────────────────────────────────────────

function SortTh({ col, label, sortBy, sortDir, onSort }) {
  const active = sortBy === col;
  return (
    <th
      className="px-5 py-4 text-left cursor-pointer select-none group whitespace-nowrap"
      onClick={() => onSort(col)}
    >
      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground group-hover:text-[#003fb1]">
        {label}
        <span className={`material-symbols-outlined text-[13px] transition-colors ${active ? 'text-[#003fb1]' : 'opacity-0 group-hover:opacity-50'}`}>
          {active && sortDir === 'ASC' ? 'arrow_upward' : 'arrow_downward'}
        </span>
      </span>
    </th>
  );
}

// ── Status Toggle Badge ────────────────────────────────────────────

function ActiveBadge({ active }) {
  return active == 1
    ? <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />ໃຊ້ງານ
      </span>
    : <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />ລະງັບ
      </span>;
}

// ── User Detail Drawer ─────────────────────────────────────────────

function UserDetailModal({ user, open, onClose, onEdit, onResetPass, onToggleActive, onDelete, currentUserId }) {
  if (!user) return null;
  return (
    <Modal open={open} onClose={onClose} title="ລາຍລະອຽດຜູ້ໃຊ້" size="md">
      <div className="space-y-5">
        {/* Profile header */}
        <div className="flex items-center gap-4 p-4 bg-[#f9f9ff] dark:bg-[#1e2d4a] rounded-2xl">
          <UserAvatar name={user.full_name} username={user.username} size="xl" />
          <div>
            <h4 className="text-xl font-black text-foreground">{user.full_name || '—'}</h4>
            <p className="text-sm text-muted-foreground mt-0.5">@{user.username}</p>
            <div className="flex items-center gap-2 mt-2">
              <RoleBadge role={user.role} />
              <ActiveBadge active={user.is_active} />
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { icon: 'mail', label: 'Email', value: user.email || '—' },
            { icon: 'call', label: 'ເບີໂທ', value: user.phone_number || '—' },
            { icon: 'calendar_today', label: 'ສ້າງວັນທີ', value: formatDate(user.created_at) },
            { icon: 'update', label: 'ອັບເດດລ່າສຸດ', value: formatDate(user.updated_at) },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-[#f9f9ff] dark:bg-[#1e2d4a] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-[14px] text-[#003fb1]">{icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
              </div>
              <p className="font-bold text-foreground truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Last login */}
        {user.last_login && (
          <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-3">
            <span className="material-symbols-outlined text-blue-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
            <div>
              <p className="text-[10px] font-bold text-blue-600/70 uppercase tracking-wider">ເຂົ້າລະບົບລ່າສຸດ</p>
              <p className="text-sm font-bold text-foreground">{formatDateTime(user.last_login.created_at)}</p>
              {user.last_login.ip_address && <p className="text-xs text-[#737686]">IP: {user.last_login.ip_address}</p>}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <button onClick={() => onEdit(user)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#003fb1] text-white text-sm font-bold rounded-xl hover:bg-[#1a56db] transition-colors">
            <span className="material-symbols-outlined text-[16px]">edit</span>ແກ້ໄຂ
          </button>
          <button onClick={() => onResetPass(user)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-colors">
            <span className="material-symbols-outlined text-[16px]">key</span>Reset Pass
          </button>
          <button onClick={() => onToggleActive(user)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl transition-colors ${user.is_active == 1 ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
            <span className="material-symbols-outlined text-[16px]">{user.is_active == 1 ? 'block' : 'check_circle'}</span>
            {user.is_active == 1 ? 'ລະງັບ' : 'ເປີດໃຊ້'}
          </button>
          {currentUserId !== user.user_id && (
            <button onClick={() => onDelete(user)}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-700 text-sm font-bold rounded-xl hover:bg-red-200 transition-colors ml-auto">
              <span className="material-symbols-outlined text-[16px]">delete</span>ລຶບ
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEdit && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Username *</label>
              <input required minLength={4} type="text" autoComplete="off" placeholder="ຢ່າງໜ້ອຍ 4 ຕົວ"
                className="w-full bg-accent rounded-xl p-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 transition-all"
                value={form.username} onChange={e => set('username', e.target.value.toLowerCase().replace(/\s/g, ''))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Password *</label>
              <div className="relative">
                <input required minLength={6} type={showPass ? 'text' : 'password'} placeholder="ຢ່າງໜ້ອຍ 6 ຕົວ" autoComplete="new-password"
                  className="w-full bg-accent rounded-xl p-3 pr-10 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 transition-all"
                  value={form.password} onChange={e => set('password', e.target.value)} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#003fb1]">
                  <span className="material-symbols-outlined text-[18px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">ຊື່ເຕັມ *</label>
          <input required type="text" placeholder="ຊື່ ແລະ ນາມສະກຸນ"
            className="w-full bg-accent rounded-xl p-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 transition-all"
            value={form.full_name} onChange={e => set('full_name', e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Email</label>
            <input type="email" placeholder="user@example.com"
              className="w-full bg-accent rounded-xl p-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 transition-all"
              value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">ເບີໂທ</label>
            <input type="tel" placeholder="020xxxxxxxx"
              className="w-full bg-accent rounded-xl p-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 transition-all"
              value={form.phone_number} onChange={e => set('phone_number', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">ຕຳແໜ່ງ *</label>
            <select className="w-full bg-accent rounded-xl p-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 transition-all"
              value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="member">Member</option>
            </select>
          </div>
          {isEdit && (
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">ສະຖານະ</label>
              <select className="w-full bg-accent rounded-xl p-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 transition-all"
                value={form.is_active} onChange={e => set('is_active', parseInt(e.target.value))}>
                <option value={1}>ໃຊ້ງານ (Active)</option>
                <option value={0}>ລະງັບ (Disabled)</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-3 border-t border-border">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 bg-accent text-muted-foreground font-bold rounded-xl hover:bg-[#dee9fd] transition-colors text-sm">
            ຍົກເລີກ
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 bg-[#003fb1] text-white font-bold rounded-xl hover:bg-[#1a56db] transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
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
      <div className="space-y-4">
        {targetUser && (
          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-3">
            <span className="material-symbols-outlined text-amber-600 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <p className="text-sm text-foreground">
              ຕັ້ງ password ໃໝ່ສຳລັບ <span className="font-black">@{targetUser.username}</span>
            </p>
          </div>
        )}
        <form onSubmit={e => { e.preventDefault(); onSave(pass); }} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">ລະຫັດຜ່ານໃໝ່ *</label>
            <div className="relative">
              <input required minLength={6} type={show ? 'text' : 'password'} placeholder="ຢ່າງໜ້ອຍ 6 ຕົວ" autoComplete="new-password"
                className="w-full bg-accent rounded-xl p-3 pr-10 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 transition-all"
                value={pass} onChange={e => setPass(e.target.value)} />
              <button type="button" onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#003fb1]">
                <span className="material-symbols-outlined text-[18px]">{show ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            {pass && (
              <div className="mt-2 flex gap-1">
                {['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400'].map((c, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${pass.length > i * 2 + 2 ? c : 'bg-[#e8edf8] dark:bg-[#2b3a54]'}`} />
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 bg-accent text-muted-foreground font-bold rounded-xl hover:bg-[#dee9fd] transition-colors text-sm">
              ຍົກເລີກ
            </button>
            <button type="submit" disabled={loading || pass.length < 6}
              className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2">
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-border">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>ສະແດງ {from}–{to} ຈາກ {total} ຄົນ</span>
        <select value={perPage} onChange={e => onPerPage(+e.target.value)}
          className="bg-accent border-none rounded-lg px-2 py-1 text-xs font-bold text-muted-foreground">
          {[10, 20, 50].map(n => <option key={n} value={n}>{n} / ໜ້າ</option>)}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(1)} disabled={page === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-accent transition-colors">
          <span className="material-symbols-outlined text-[16px]">first_page</span>
        </button>
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-accent transition-colors">
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
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${p === page ? 'bg-[#003fb1] text-white' : 'hover:bg-accent text-muted-foreground'}`}>
              {p}
            </button>
          );
        })}
        <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-accent transition-colors">
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
        <button onClick={() => onPage(totalPages)} disabled={page === totalPages}
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-accent transition-colors">
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
    { label: 'ທັງໝົດ', value: stats.total_users, icon: 'group', color: '#003fb1', bg: '#eff3ff' },
    { label: 'ໃຊ້ງານ', value: stats.active_users, icon: 'check_circle', color: '#006c49', bg: '#edfdf5' },
    { label: 'Admin', value: stats.admin_count, icon: 'admin_panel_settings', color: '#ba1a1a', bg: '#ffdad6' },
    { label: 'Staff', value: stats.staff_count, icon: 'badge', color: '#1a56db', bg: '#dbeafe' },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: c.bg }}>
            <span className="material-symbols-outlined text-[20px]" style={{ color: c.color, fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
          </div>
          <div>
            <p className="text-2xl font-black leading-none" style={{ color: c.color }}>{c.value ?? 0}</p>
            <p className="text-[11px] font-bold text-muted-foreground mt-0.5">{c.label}</p>
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
    <div className="max-w-lg mx-auto space-y-5">
      <div className="bg-card rounded-3xl p-8 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#eff3ff] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#003fb1] text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>key</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">ປ່ຽນລະຫັດຜ່ານ</h2>
            <p className="text-xs text-muted-foreground">@{user?.username}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'current_password', label: 'ລະຫັດຜ່ານເກົ່າ', showKey: 'cur' },
            { key: 'new_password', label: 'ລະຫັດຜ່ານໃໝ່ (ຢ່າງໜ້ອຍ 6 ຕົວ)', showKey: 'new' },
          ].map(({ key, label, showKey }) => (
            <div key={key}>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">{label}</label>
              <div className="relative">
                <input required minLength={key === 'new_password' ? 6 : 1} type={show[showKey] ? 'text' : 'password'}
                  className="w-full bg-accent rounded-xl p-3 pr-10 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40"
                  value={form[key]} onChange={e => set(key, e.target.value)} />
                <button type="button" onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#003fb1]">
                  <span className="material-symbols-outlined text-[18px]">{show[showKey] ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-[#003fb1] text-white font-bold rounded-xl hover:bg-[#1a56db] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
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
      title: nextActive ? 'ເປີດໃຊ້ງານ' : 'ລະງັບການໃຊ້ງານ',
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
    <div className="space-y-6">
      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Header */}
      <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-black text-foreground">ຈັດການຜູ້ໃຊ້ (Users)</h1>
            <p className="text-xs text-muted-foreground mt-0.5">ຈັດການສິດທິ, ພະນັກງານ ແລະ ລະຫັດຜ່ານ</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-[#003fb1] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1a56db] transition-colors shrink-0">
            <span className="material-symbols-outlined text-[18px]">person_add</span>ເພີ່ມຜູ້ໃຊ້ໃໝ່
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          {/* Search */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#737686]">search</span>
            <input type="text" placeholder="ຄົ້ນຫາ username, ຊື່, email..."
              className="w-full bg-accent rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 transition-all"
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#003fb1]">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
          {/* Role filter */}
          <select value={roleFilter} onChange={e => setRole(e.target.value)}
            className="bg-accent rounded-xl px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 transition-all">
            <option value="">ທຸກຕຳແໜ່ງ</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="member">Member</option>
          </select>
          {/* Active filter */}
          <select value={activeFilter} onChange={e => setActive(e.target.value)}
            className="bg-accent rounded-xl px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 transition-all">
            <option value="">ທຸກສະຖານະ</option>
            <option value="1">ໃຊ້ງານ</option>
            <option value="0">ລະງັບ</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent sticky top-0 z-10">
              <tr>
                <SortTh col="username"   label="ຜູ້ໃຊ້"     sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="full_name"  label="ຊື່ເຕັມ"     sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="role"       label="ຕຳແໜ່ງ"     sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="is_active"  label="ສະຖານະ"     sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="created_at" label="ສ້າງວັນທີ"  sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <th className="px-5 py-4 text-right text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">ການຈັດການ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dee9fd] dark:divide-[#2b3a54]">
              {loading ? (
                <TableSkeleton cols={6} rows={6} />
              ) : users.length === 0 ? (
                <tr><td colSpan={6}>
                  <EmptyState
                    icon="manage_accounts"
                    title="ບໍ່ພົບ user"
                    description={search || roleFilter || activeFilter ? 'ລອງປ່ຽນຕົວກ່ອງ' : 'ຍັງບໍ່ມີ user ໃນລະບົບ'}
                    action={!search && !roleFilter && !activeFilter && (
                      <button onClick={openCreate} className="px-5 py-2.5 bg-[#003fb1] text-white font-bold text-sm rounded-xl hover:bg-[#1a56db] transition-colors">
                        ເພີ່ມ user ຄົນທຳອິດ
                      </button>
                    )}
                  />
                </td></tr>
              ) : users.map(u => (
                <tr key={u.user_id}
                  className="hover:bg-[#f9f9ff] dark:hover:bg-[#1e2d4a] transition-colors cursor-pointer group"
                  onClick={() => openDetail(u)}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={u.full_name} username={u.username} size="sm" />
                      <div>
                        <p className="font-bold text-sm text-foreground">@{u.username}</p>
                        {u.email && <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">{u.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{u.full_name || '—'}</td>
                  <td className="px-5 py-4"><RoleBadge role={u.role} size="xs" /></td>
                  <td className="px-5 py-4"><ActiveBadge active={u.is_active} /></td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">{formatDate(u.created_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEdit(u)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#003fb1] hover:bg-[#eff3ff] dark:hover:bg-[#1e2d4a] transition-colors" title="ແກ້ໄຂ">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button onClick={() => openPass(u)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Reset password">
                        <span className="material-symbols-outlined text-[16px]">key</span>
                      </button>
                      {user?.id !== u.user_id && (
                        <button onClick={() => handleDelete(u)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="ລຶບ">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
