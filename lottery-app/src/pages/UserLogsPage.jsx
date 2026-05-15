import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API } from '../utils/api';
import { useDebounce } from '../hooks/useDebounce';
import RoleBadge from '../components/RoleBadge';
import UserAvatar from '../components/UserAvatar';
import EmptyState from '../components/EmptyState';
import TableSkeleton from '../components/TableSkeleton';

// ── Helpers ────────────────────────────────────────────────────────

function formatDateTime(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('lo-LA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

const ACTION_CONFIG = {
  'Login success':    { icon: 'login',         color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-900/30' },
  'Logout':           { icon: 'logout',         color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-100 dark:bg-blue-900/30'  },
  'Update profile':   { icon: 'person',         color: 'text-purple-600 dark:text-purple-400',bg: 'bg-purple-100 dark:bg-purple-900/30' },
  'Create user':      { icon: 'person_add',     color: 'text-teal-600 dark:text-teal-400',    bg: 'bg-teal-100 dark:bg-teal-900/30'  },
  'Update user':      { icon: 'manage_accounts',color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-100 dark:bg-amber-900/30'},
  'Delete user':      { icon: 'person_remove',  color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-100 dark:bg-red-900/30'    },
  'Change password':  { icon: 'key',            color: 'text-orange-600 dark:text-orange-400',bg: 'bg-orange-100 dark:bg-orange-900/30'},
};

function actionConfig(action = '') {
  for (const [key, cfg] of Object.entries(ACTION_CONFIG)) {
    if (action.toLowerCase().startsWith(key.toLowerCase())) return cfg;
  }
  return { icon: 'info', color: 'text-[#737686]', bg: 'bg-accent' };
}

function ActionBadge({ action }) {
  const cfg = actionConfig(action);
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${cfg.bg}`}>
      <span className={`material-symbols-outlined text-[13px] ${cfg.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
      <span className={`text-[11px] font-bold ${cfg.color} max-w-[180px] truncate`}>{action}</span>
    </div>
  );
}

// ── Paginator ──────────────────────────────────────────────────────

function Paginator({ page, totalPages, total, perPage, onPage, onPerPage }) {
  if (total === 0) return null;
  const from = (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-border">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>ສະແດງ {from}–{to} ຈາກ {total} logs</span>
        <select value={perPage} onChange={e => onPerPage(+e.target.value)}
          className="bg-accent border-none rounded-lg px-2 py-1 text-xs font-bold">
          {[20, 50, 100].map(n => <option key={n} value={n}>{n} / ໜ້າ</option>)}
        </select>
      </div>
      <div className="flex items-center gap-1">
        {[
          { icon: 'first_page', action: () => onPage(1), disabled: page === 1 },
          { icon: 'chevron_left', action: () => onPage(page - 1), disabled: page === 1 },
        ].map(({ icon, action, disabled }) => (
          <button key={icon} onClick={action} disabled={disabled}
            className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-accent transition-colors">
            <span className="material-symbols-outlined text-[16px]">{icon}</span>
          </button>
        ))}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
          return (
            <button key={p} onClick={() => onPage(p)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${p === page ? 'bg-[#003fb1] text-white' : 'hover:bg-accent text-muted-foreground'}`}>
              {p}
            </button>
          );
        })}
        {[
          { icon: 'chevron_right', action: () => onPage(page + 1), disabled: page === totalPages },
          { icon: 'last_page', action: () => onPage(totalPages), disabled: page === totalPages },
        ].map(({ icon, action, disabled }) => (
          <button key={icon} onClick={action} disabled={disabled}
            className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-accent transition-colors">
            <span className="material-symbols-outlined text-[16px]">{icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Export CSV ─────────────────────────────────────────────────────

function exportCSV(logs) {
  const header = ['Log ID', 'Username', 'Full Name', 'Role', 'Action', 'IP Address', 'Date/Time'];
  const rows   = logs.map(l => [
    l.log_id, l.username || '', l.full_name || '', l.role || '', l.action,
    l.ip_address || '', l.created_at,
  ]);
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `user-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main Component ─────────────────────────────────────────────────

export default function UserLogsPage() {
  const { authFetch } = useAuth();

  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [page, setPage]         = useState(1);
  const [perPage, setPerPage]   = useState(20);
  const [total, setTotal]       = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting]   = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const fetchLogs = useCallback(async (opts = {}) => {
    const p   = opts.page    ?? page;
    const pp  = opts.perPage ?? perPage;
    const s   = opts.search  ?? debouncedSearch;
    const af  = opts.action  ?? actionFilter;
    const df  = opts.dateFrom ?? dateFrom;
    const dt  = opts.dateTo   ?? dateTo;

    const params = new URLSearchParams({
      action: 'user_logs_list', page: p, per_page: pp,
      ...(s  && { search: s }),
      ...(af && { action_filter: af }),
      ...(df && { date_from: df }),
      ...(dt && { date_to: dt }),
    });

    setLoading(true);
    const { ok, data } = await authFetch(`${API}/index.php?${params}`).catch(() => ({ ok: false, data: {} }));
    setLoading(false);
    if (ok) {
      setLogs(data.data ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.total_pages ?? 1);
    } else {
      toast.error(data?.error || 'ໂຫຼດ logs ບໍ່ສຳເລັດ');
    }
  }, [authFetch, page, perPage, debouncedSearch, actionFilter, dateFrom, dateTo]);

  useEffect(() => { fetchLogs(); }, []);

  useEffect(() => {
    setPage(1);
    fetchLogs({ page: 1, search: debouncedSearch, action: actionFilter, dateFrom, dateTo });
  }, [debouncedSearch, actionFilter, dateFrom, dateTo]);

  const handlePage    = (p)  => { setPage(p);   fetchLogs({ page: p }); };
  const handlePerPage = (pp) => { setPerPage(pp); setPage(1); fetchLogs({ page: 1, perPage: pp }); };

  const handleExport = async () => {
    setExporting(true);
    // Fetch all (up to 1000) for export
    const params = new URLSearchParams({
      action: 'user_logs_list', page: 1, per_page: 1000,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(actionFilter    && { action_filter: actionFilter }),
      ...(dateFrom        && { date_from: dateFrom }),
      ...(dateTo          && { date_to: dateTo }),
    });
    const { ok, data } = await authFetch(`${API}/index.php?${params}`);
    setExporting(false);
    if (ok) { exportCSV(data.data ?? []); toast.success('Export CSV ສຳເລັດ'); }
    else toast.error('Export ບໍ່ສຳເລັດ');
  };

  const clearFilters = () => { setSearch(''); setActionFilter(''); setDateFrom(''); setDateTo(''); };
  const hasFilters   = search || actionFilter || dateFrom || dateTo;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-xl font-black text-foreground flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003fb1]" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
              ປະຫວັດການໃຊ້ງານ (Audit Logs)
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              ທຸກກິດຈະກຳໃນລະບົບ · ທັງໝົດ {total.toLocaleString()} entries
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#737686] hover:text-[#003fb1] bg-accent rounded-xl transition-colors">
                <span className="material-symbols-outlined text-[15px]">filter_alt_off</span>ລ້າງ filter
              </button>
            )}
            <button onClick={handleExport} disabled={exporting || loading || total === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-xl hover:bg-green-200 transition-colors disabled:opacity-50">
              {exporting
                ? <span className="w-4 h-4 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin" />
                : <span className="material-symbols-outlined text-[16px]">download</span>}
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#737686]">search</span>
            <input type="text" placeholder="ຄົ້ນຫາ username, action, IP..."
              className="w-full bg-accent rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 transition-all"
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686]">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
          {/* Action filter */}
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
            className="bg-accent rounded-xl px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 transition-all">
            <option value="">ທຸກ Action</option>
            {Object.keys(ACTION_CONFIG).map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          {/* Date range */}
          <div className="flex gap-2">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="flex-1 min-w-0 bg-accent rounded-xl px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 transition-all" />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="flex-1 min-w-0 bg-accent rounded-xl px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/40 transition-all" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent sticky top-0 z-10">
              <tr>
                {['ຜູ້ໃຊ້', 'ກິດຈະກຳ', 'IP Address', 'ວັນ-ເວລາ'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dee9fd] dark:divide-[#2b3a54]">
              {loading ? (
                <TableSkeleton cols={4} rows={8} />
              ) : logs.length === 0 ? (
                <tr><td colSpan={4}>
                  <EmptyState icon="history" title="ບໍ່ພົບ logs" description={hasFilters ? 'ລອງປ່ຽນຕົວກ່ອງ' : 'ຍັງບໍ່ມີ activity logs'} />
                </td></tr>
              ) : logs.map(l => (
                <tr key={l.log_id} className="hover:bg-[#f9f9ff] dark:hover:bg-[#1e2d4a] transition-colors">
                  <td className="px-5 py-3.5">
                    {l.username ? (
                      <div className="flex items-center gap-2.5">
                        <UserAvatar name={l.full_name} username={l.username} size="sm" />
                        <div>
                          <p className="text-sm font-bold text-foreground">@{l.username}</p>
                          <div className="mt-0.5"><RoleBadge role={l.role} size="xs" /></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-[#737686] italic">ລຶບແລ້ວ / ID:{l.user_id}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <ActionBadge action={l.action} />
                  </td>
                  <td className="px-5 py-3.5">
                    {l.ip_address
                      ? <span className="text-xs font-mono bg-accent px-2 py-1 rounded-lg text-muted-foreground">{l.ip_address}</span>
                      : <span className="text-xs text-[#737686]">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(l.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Paginator page={page} totalPages={totalPages} total={total} perPage={perPage} onPage={handlePage} onPerPage={handlePerPage} />
      </div>
    </div>
  );
}
