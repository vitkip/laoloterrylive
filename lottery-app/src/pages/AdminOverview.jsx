import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatLaoDate } from '../utils/date';
import { API, resolveAnimalImage } from '../utils/api';
import UserAvatar from '../components/UserAvatar';
import RoleBadge from '../components/RoleBadge';
import SEO from '../components/SEO';

// ──────────────────────────────────────────────────────────────────
// ── Shared Primitives
// ──────────────────────────────────────────────────────────────────

/** TailAdmin-style stat card: icon top-left, big number, label */
function StatCard({ icon, label, value, trendLabel, accent = '#d4af37' }) {
  const colorMap = {
    '#003fb1': { text: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/25', color: '#3b82f6' },
    '#7c3aed': { text: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/25', color: '#7c3aed' },
    '#d97706': { text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25', color: '#f59e0b' },
    '#006c49': { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', color: '#10b981' },
    '#d4af37': { text: 'text-[#d4af37]', bg: 'bg-[#d4af37]/10 border-[#d4af37]/25', color: '#d4af37' }
  };
  const themeColor = colorMap[accent] || { text: 'text-[#d4af37]', bg: 'bg-[#d4af37]/10 border-[#d4af37]/25', color: '#d4af37' };

  return (
    <div className="bg-[#0e1124]/85 backdrop-blur-md rounded-2xl border border-white/[0.05] shadow-lg p-5 flex flex-col gap-4 hover:shadow-2xl hover:-translate-y-1 hover:border-[#d4af37]/35 transition-all duration-300 relative overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350" />
      <div className="flex items-start gap-2">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-105 group-hover:rotate-6 ${themeColor.bg}`}>
          <span className={`material-symbols-outlined text-[20px] ${themeColor.text}`}>{icon}</span>
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-[28px] font-black text-white leading-none mb-1.5 tabular-nums tracking-tight font-space">
          {typeof value === 'number' ? value.toLocaleString() : (value ?? '—')}
        </p>
        <p className="text-[10px] font-black text-white/35 leading-snug tracking-widest uppercase">{label}</p>
        {trendLabel && (
          <p className="text-[9.5px] text-white/20 mt-2.5 font-bold tracking-wide leading-none">{trendLabel}</p>
        )}
      </div>
    </div>
  );
}

/** Section card header */
function CardHeader({ title, subtitle }) {
  return (
    <div>
      <h3 className="text-sm font-black text-white leading-snug tracking-wide">{title}</h3>
      {subtitle && <p className="text-[9px] font-bold text-white/35 mt-0.5 tracking-widest uppercase">{subtitle}</p>}
    </div>
  );
}

/** Period toggle tabs */
function PeriodTabs({ value, onChange, options }) {
  return (
    <div className="flex items-center gap-0.5 bg-[#0b0e1a] border border-white/[0.06] rounded-xl p-1 shrink-0 select-none">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black transition-all duration-200 cursor-pointer ${
            value === opt.value
              ? 'bg-[#d4af37] text-black shadow-md scale-103'
              : 'text-white/45 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** Digit chips for a 6-digit result */
function DigitRow({ result }) {
  if (!result) return null;
  const padded = result.padEnd(6, '·');
  const groups = [padded.slice(0, 2), padded.slice(2, 4), padded.slice(4, 6)];
  return (
    <div className="flex items-center gap-2 select-none font-mono">
      {groups.map((grp, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {grp.split('').map((ch, ci) => {
            const hasVal = /\d/.test(ch);
            return (
              <div
                key={ci}
                className={`w-9 h-10.5 rounded-xl flex items-center justify-center text-[16px] font-black transition-all duration-300 relative border overflow-hidden
                  ${hasVal
                    ? 'bg-gradient-to-tr from-[#d4af37] via-[#f59e0b] to-[#fed7aa] text-black shadow-md border-[#fbbf24]/20 shadow-[#f59e0b]/15 scale-105'
                    : 'bg-black/45 border-white/[0.05] text-white/10'}`}
              >
                {ch}
                {hasVal && (
                  <>
                    <div className="absolute top-0.5 left-1 w-4 h-1 bg-white/35 rounded-full rotate-[-15deg]" />
                    <div className="absolute bottom-0.5 right-1 w-2 h-0.5 bg-black/10 rounded-full" />
                  </>
                )}
              </div>
            );
          })}
          {gi < 2 && <span className="text-white/[0.12] font-black text-xs mx-0.5">·</span>}
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// ── Visitor Analytics  (chart + top pages)
// ──────────────────────────────────────────────────────────────────

const PERIOD_OPTS = [
  { value: 'daily',   label: 'ລາຍວັນ' },
  { value: 'weekly',  label: 'ສັບດາ' },
  { value: 'monthly', label: 'ເດືອນ' },
];

const DAY_LABELS   = ['ອາ', 'ຈ', 'ອ', 'ພ', 'ພຫ', 'ສ', 'ສ'];
const MONTH_LABELS = ['ມ.ກ', 'ກ.ພ', 'ມ.ນ', 'ເ.ສ', 'ພ.ພ', 'ມ.ຖ', 'ກ.ລ', 'ສ.ຫ', 'ກ.ຍ', 'ຕ.ລ', 'ພ.ຈ', 'ທ.ວ'];
const PAGE_ACCENTS = ['#d4af37', '#f59e0b', '#7c3aed', '#10b981', '#3b82f6', '#ef4444'];

function VisitorAnalytics() {
  const { token, authFetch } = useAuth();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg]   = useState('');
  const [period, setPeriod]   = useState('daily');

  useEffect(() => {
    if (!token) return;
    authFetch(`${API}/index.php?action=visitor_stats`)
      .then(({ ok, data }) => {
        if (ok) setStats(data);
        else setErrMsg(data?.error || 'ໂຫຼດບໍ່ສຳເລັດ');
      })
      .catch(() => setErrMsg('ເຊື່ອມຕໍ່ API ບໍ່ສຳເລັດ'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-3 bg-[#0e1124]/50 border border-white/[0.05] rounded-2xl h-72 animate-pulse" />
      <div className="lg:col-span-2 bg-[#0e1124]/50 border border-white/[0.05] rounded-2xl h-72 animate-pulse" />
    </div>
  );

  if (errMsg || !stats) return (
    <div className="bg-[#0e1124] border border-white/[0.06] rounded-2xl p-6 flex items-center gap-3">
      <span className="material-symbols-outlined text-rose-400 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
      <p className="text-xs text-white/60">ສະຖິຕິ: <span className="text-rose-400 font-bold">{errMsg || 'ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ'}</span></p>
    </div>
  );

  const today = new Date();
  const dailyMap = Object.fromEntries((stats.daily || []).map(r => [r.day, r]));

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const row = dailyMap[key] || {};
    let name;
    if (period === 'daily')       name = DAY_LABELS[d.getDay()];
    else if (period === 'weekly') name = `${d.getDate()}/${d.getMonth() + 1}`;
    else                          name = MONTH_LABELS[d.getMonth()];
    return { name, visits: row.visits || 0, unique: row.unique_visitors || 0 };
  });

  const maxPages = Math.max(1, ...(stats.top_pages || []).map(p => p.visits));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

      {/* ── Area Chart ── */}
      <div className="lg:col-span-3 bg-[#0e1124]/75 backdrop-blur-md rounded-2xl border border-white/[0.05] shadow-lg p-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
          <div>
            <CardHeader title="ສະຖິຕິຜູ້ເຂົ້າຊົມ" subtitle={`ທັງໝົດ ${(stats.total || 0).toLocaleString()} ຄັ້ງ`} />
          </div>
          <PeriodTabs value={period} onChange={setPeriod} options={PERIOD_OPTS} />
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#d4af37" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="uniqueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.35)', fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'rgba(11, 14, 26, 0.95)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: 12, backdropFilter: 'blur(12px)' }}
              itemStyle={{ color: '#fff', fontWeight: 800, fontSize: 11 }}
              labelStyle={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: 4 }}
              formatter={(v, n) => [v.toLocaleString(), n === 'visits' ? 'ຄັ້ງ' : 'Unique']}
            />
            <Area type="monotone" dataKey="visits" stroke="#d4af37" strokeWidth={2.5} fill="url(#visitGrad)" dot={false} name="visits" />
            <Area type="monotone" dataKey="unique" stroke="#f59e0b" strokeWidth={2} fill="url(#uniqueGrad)" dot={false} name="unique" />
          </AreaChart>
        </ResponsiveContainer>

        <div className="flex items-center gap-5 mt-4 pt-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-[#d4af37] rounded" />
            <span className="text-[10px] font-black text-white/35 uppercase tracking-wider">ຍອດເຂົ້າຊົມ</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-[#f59e0b] rounded" />
            <span className="text-[10px] font-black text-white/35 uppercase tracking-wider">Unique</span>
          </div>
        </div>
      </div>

      {/* ── Top Pages ── */}
      <div className="lg:col-span-2 bg-[#0e1124]/75 backdrop-blur-md rounded-2xl border border-white/[0.05] shadow-lg p-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
        <div className="mb-5">
          <CardHeader title="ໜ້າທີ່ນິຍົມ" subtitle="Top pages by visits" />
        </div>
        <div className="space-y-4">
          {(stats.top_pages || []).slice(0, 6).map((p, i) => {
            const barPct = Math.round((p.visits / maxPages) * 100);
            const accent = PAGE_ACCENTS[i % PAGE_ACCENTS.length];
            return (
              <div key={p.page_path}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black text-black shrink-0 shadow-sm" style={{ background: accent }}>
                      {i + 1}
                    </span>
                    <span className="text-[11px] font-bold text-white/55 truncate">{p.page_path || '/'}</span>
                  </div>
                  <span className="text-[10.5px] font-black ml-2 shrink-0 font-mono" style={{ color: accent }}>{p.visits.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full bg-white/[0.02] border border-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700 shadow-[0_0_8px_currentColor]" style={{ width: `${barPct}%`, background: accent, color: accent }} />
                </div>
              </div>
            );
          })}
          {(!stats.top_pages || stats.top_pages.length === 0) && (
            <p className="text-xs text-white/30 text-center py-10 font-bold">ຍັງບໍ່ມີຂໍ້ມູນ</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// ── User Stats
// ──────────────────────────────────────────────────────────────────

function UserStats() {
  const { token, authFetch } = useAuth();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    authFetch(`${API}/index.php?action=user_stats`)
      .then(({ ok, data }) => { if (ok) setStats(data); })
      .finally(() => setLoading(false));
  }, [token]);

  function fmtDt(str) {
    if (!str) return '—';
    return new Date(str).toLocaleString('lo-LA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  if (loading) return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {[0, 1].map(i => (
        <div key={i} className="bg-[#0e1124]/50 border border-white/[0.05] rounded-2xl h-52 animate-pulse" />
      ))}
    </div>
  );

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

      {/* ── KPI row ── */}
      <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'ຜູ້ໃຊ້ທັງໝົດ', value: stats.total_users,  icon: 'group',                accent: '#d4af37' },
          { label: 'ໃຊ້ງານ',       value: stats.active_users, icon: 'check_circle',          accent: '#006c49' },
          { label: 'Admin',         value: stats.admin_count,  icon: 'admin_panel_settings',  accent: '#7c3aed' },
          { label: 'Staff',         value: stats.staff_count,  icon: 'badge',                 accent: '#d97706' },
        ].map(c => {
          const colorStyles = {
            '#d4af37': 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/25',
            '#006c49': 'bg-[#10b981]/10 text-emerald-400 border-[#10b981]/25',
            '#7c3aed': 'bg-[#7c3aed]/10 text-indigo-400 border-[#7c3aed]/25',
            '#d97706': 'bg-amber-500/10 text-amber-400 border-amber-500/25'
          };
          const borderHighlight = {
            '#d4af37': 'via-[#d4af37]/40',
            '#006c49': 'via-[#10b981]/40',
            '#7c3aed': 'via-[#7c3aed]/40',
            '#d97706': 'via-amber-500/40'
          };
          return (
            <div key={c.label} className="bg-[#0e1124]/75 backdrop-blur-md rounded-2xl border border-white/[0.05] shadow-lg p-4 flex items-center gap-3 hover:shadow-xl hover:-translate-y-0.5 hover:border-[#d4af37]/20 transition-all duration-300 relative overflow-hidden group">
              <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${borderHighlight[c.accent] || 'via-[#d4af37]/20'} to-transparent`} />
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105 ${colorStyles[c.accent] || 'bg-white/5 border-white/10 text-white'}`}>
                <span className="material-symbols-outlined text-[18px]">{c.icon}</span>
              </div>
              <div className="relative z-10">
                <p className="text-xl font-black text-white leading-none tabular-nums tracking-tight font-space">{c.value ?? '—'}</p>
                <p className="text-[10px] text-white/35 font-black mt-1 uppercase tracking-wider">{c.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Recent logins ── */}
      <div className="bg-[#0e1124]/75 backdrop-blur-md rounded-2xl border border-white/[0.05] shadow-lg p-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
        <div className="flex items-center justify-between mb-4 relative z-10">
          <CardHeader title="ເຂົ້າລະບົບລ່າສຸດ" subtitle="Recent login activity" />
          <Link to="/admin/logs" className="text-[10px] font-black text-[#d4af37] hover:underline uppercase tracking-wider shrink-0">ທັງໝົດ →</Link>
        </div>
        <div className="divide-y divide-white/[0.05] relative z-10">
          {(stats.recent_logins || []).length === 0
            ? <p className="text-xs text-white/30 text-center py-6 font-bold">ຍັງບໍ່ມີ login</p>
            : (stats.recent_logins || []).map((l, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 transition-colors hover:bg-white/[0.02] -mx-2 px-2 rounded-xl">
                <UserAvatar name={l.full_name} username={l.username} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-white truncate">{l.full_name || `@${l.username}`}</p>
                  <p className="text-[9.5px] text-white/30 font-bold mt-1">{fmtDt(l.logged_at)}</p>
                </div>
                <RoleBadge role={l.role} size="xs" />
              </div>
            ))
          }
        </div>
      </div>

      {/* ── New users ── */}
      <div className="bg-[#0e1124]/75 backdrop-blur-md rounded-2xl border border-white/[0.05] shadow-lg p-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
        <div className="flex items-center justify-between mb-4 relative z-10">
          <CardHeader title="ຜູ້ໃຊ້ໃໝ່" subtitle="Recently registered" />
          <Link to="/admin/users" className="text-[10px] font-black text-[#d4af37] hover:underline uppercase tracking-wider shrink-0">ຈັດການ →</Link>
        </div>
        <div className="divide-y divide-white/[0.05] relative z-10">
          {(stats.new_users || []).length === 0
            ? <p className="text-xs text-white/30 text-center py-6 font-bold">ຍັງບໍ່ມີ user</p>
            : (stats.new_users || []).map(u => (
              <div key={u.user_id} className="flex items-center gap-3 py-2.5 transition-colors hover:bg-white/[0.02] -mx-2 px-2 rounded-xl">
                <UserAvatar name={u.full_name} username={u.username} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-white truncate">{u.full_name || u.username}</p>
                  <p className="text-[9.5px] text-white/30 font-bold mt-1">{fmtDt(u.created_at)}</p>
                </div>
                <RoleBadge role={u.role} size="xs" />
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// ── Recent Draws table  (TailAdmin "Recent Orders" style)
// ──────────────────────────────────────────────────────────────────

function RecentHistory() {
  const { draws, animals, types } = useData();
  const recentDraws = (draws ?? []).slice(0, 8);

  if (!draws) return (
    <div className="bg-[#0e1124]/70 backdrop-blur-md border border-white/[0.05] rounded-2xl p-8 flex items-center justify-center gap-3 h-52">
      <span className="material-symbols-outlined text-[#d4af37] text-[20px] animate-spin">progress_activity</span>
      <p className="text-xs font-black text-white/30">ກຳລັງໂຫຼດ...</p>
    </div>
  );

  return (
    <div className="bg-[#0e1124]/75 backdrop-blur-md rounded-2xl border border-white/[0.05] shadow-lg overflow-hidden relative group">
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/[0.05] relative z-10 bg-black/10">
        <div>
          <h3 className="text-sm font-black text-white">ງວດລ່າສຸດ</h3>
          <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider mt-0.5">{draws.length.toLocaleString()} ງວດທັງໝົດ</p>
        </div>
        <Link
          to="/admin/draws"
          className="flex items-center gap-1.5 text-[10px] font-black text-[#d4af37] hover:underline uppercase tracking-wider transition-colors"
        >
          ຈັດການທັງໝົດ
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto relative z-10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05] bg-white/[0.01]">
              <th className="px-6 py-3 text-left text-[9px] font-black text-white/30 uppercase tracking-widest w-8">#</th>
              <th className="px-4 py-3 text-left text-[9px] font-black text-white/30 uppercase tracking-widest">ງວດ / ວັນທີ</th>
              <th className="px-4 py-3 text-left text-[9px] font-black text-white/30 uppercase tracking-widest">ປະເພດ</th>
              <th className="px-4 py-3 text-left text-[9px] font-black text-white/30 uppercase tracking-widest">ເລກທີ່ອອກ</th>
              <th className="px-4 py-3 text-left text-[9px] font-black text-white/30 uppercase tracking-widest hidden sm:table-cell">ນາມສັດ</th>
              <th className="px-6 py-3 text-left text-[9px] font-black text-white/30 uppercase tracking-widest">ສະຖານະ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {recentDraws.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-xs text-white/30 font-bold">ຍັງບໍ່ມີຂໍ້ມູນ</td>
              </tr>
            ) : recentDraws.map((draw, idx) => {
              const twoDigit  = draw.results_detail?.find(r => r.prize_type === '2_digits');
              const animal    = animals?.find(a => String(a.animal_id) === String(twoDigit?.animal_id));
              const animalImg = resolveAnimalImage(animal);
              const t         = types?.find(t => t.type_id == draw.type_id);
              const color     = t?.color || '#d4af37';
              const pairs     = draw.full_result?.length >= 6
                ? [draw.full_result.slice(0, 2), draw.full_result.slice(2, 4), draw.full_result.slice(4, 6)]
                : [];
              const isLatest = idx === 0;

              return (
                <tr
                  key={draw.draw_id}
                  className={`transition-all duration-350 ${isLatest ? 'bg-[#d4af37]/5 border-l-2 border-l-[#d4af37]' : 'hover:bg-white/[0.02]'}`}
                >
                  <td className="px-6 py-3.5 w-8">
                    {isLatest ? (
                      <div className="relative w-2.5 h-2.5">
                        <span className="absolute inset-0 rounded-full bg-[#d4af37]/40 animate-ping" />
                        <span className="relative w-2.5 h-2.5 rounded-full bg-[#d4af37] block" />
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-white/20 tabular-nums">{idx + 1}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-black text-white">{formatLaoDate(draw.draw_date, true)}</p>
                    <p className="text-[10px] text-white/35 font-bold mt-0.5">ງວດທີ {draw.draw_number}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    {t && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black border whitespace-nowrap"
                        style={{ color, background: `${color}12`, borderColor: `${color}30` }}
                      >
                        <span className="w-1 h-1 rounded-full shrink-0" style={{ background: color }} />
                        {t.type_name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      {pairs.length > 0 ? pairs.map((pair, pi) => (
                        <div key={pi} className="flex items-center gap-0.5">
                          {pair.split('').map((d, di) => (
                            <span
                              key={di}
                              className="w-6.5 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#d4af37] to-[#f59e0b] text-black text-[11px] font-black shadow-sm border border-[#fbbf24]/10 relative overflow-hidden"
                            >
                              {d}
                              <div className="absolute top-0.5 left-0.5 w-3.5 h-0.5 bg-white/20 rounded-full" />
                            </span>
                          ))}
                          {pi < 2 && <span className="mx-0.5 text-white/[0.08] text-[9px] font-black">·</span>}
                        </div>
                      )) : (
                        <span className="text-xs font-black text-white font-mono leading-none">{draw.full_result}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    {animal ? (
                      <div className="flex items-center gap-2">
                        {animalImg && (
                          <img
                            src={animalImg}
                            alt={animal.animal_name_lao}
                            className="w-7 h-7 rounded-lg object-cover bg-black/45 border border-white/10 shrink-0"
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div>
                          <p className="text-xs font-black text-white leading-none">{animal.animal_name_lao}</p>
                          <p className="text-[10px] text-white/35 font-bold mt-1 tabular-nums">ເລກ: {twoDigit?.result_value}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-white/15">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                      draw.status === 'published'
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
                        : 'text-amber-400 bg-amber-500/10 border-amber-500/25'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${draw.status === 'published' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      {draw.status === 'published' ? 'Published' : 'Pending'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3.5 border-t border-white/[0.05] bg-black/5 relative z-10">
        <Link
          to="/admin/draws"
          className="flex items-center justify-center gap-2 text-[10px] font-black text-[#d4af37] hover:text-[#fbbf24] uppercase tracking-wider transition-colors group"
        >
          <span className="material-symbols-outlined text-[14px]">table_rows</span>
          ຈັດການງວດທັງໝົດ
          <span className="material-symbols-outlined text-[14px] transition-transform group-hover:translate-x-0.5">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// ── Main Component
// ──────────────────────────────────────────────────────────────────

export default function AdminOverview() {
  const { draws, animals, types } = useData();
  const { user, token, authFetch } = useAuth();

  const [visitorStats, setVisitorStats] = useState(null);
  const [userStats,    setUserStats]    = useState(null);
  const [purgeState,   setPurgeState]   = useState({ loading: false, result: null });

  const handlePurgeLogs = () => {
    setPurgeState({ loading: true, result: null });
    authFetch(`${API}/index.php?action=purge_logs`, { method: 'POST', body: JSON.stringify({}) })
      .then(({ ok, data }) => {
        setPurgeState({ loading: false, result: ok ? data : { error: data?.error ?? 'ຜິດພາດ' } });
      })
      .catch(() => setPurgeState({ loading: false, result: { error: 'Network error' } }));
  };

  useEffect(() => {
    if (!token) return;
    authFetch(`${API}/index.php?action=visitor_stats`)
      .then(({ ok, data }) => { if (ok) setVisitorStats(data); })
      .catch(() => {});
    authFetch(`${API}/index.php?action=user_stats`)
      .then(({ ok, data }) => { if (ok) setUserStats(data); })
      .catch(() => {});
  }, [token]);

  const latestDraw     = draws?.[0];
  const twoDigitResult = latestDraw?.results_detail?.find(r => r.prize_type === '2_digits');
  const twoDigitValue  = twoDigitResult?.result_value;
  const animal = (twoDigitResult?.animal_id
    ? animals?.find(a => a.animal_id == twoDigitResult.animal_id)
    : null)
    ?? (twoDigitValue
      ? animals?.find(a => a.animal_numbers.split(',').map(n => n.trim()).includes(twoDigitValue))
      : null);
  const animalDisplayUrl = resolveAnimalImage(animal);

  const publishedCount = draws?.filter(d => d.status === 'published').length ?? 0;

  /* Lottery type distribution  (like "Sessions by Device") */
  const typeDist = (draws && types)
    ? types
        .filter(t => t.is_active != 0)
        .map(t => ({
          name:  t.type_name,
          value: draws.filter(d => d.type_id == t.type_id).length,
          color: t.color || '#d4af37',
        }))
        .filter(t => t.value > 0)
    : [];

  const todayDate = new Date().toLocaleDateString('lo-LA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="space-y-7 text-left select-none">
      <SEO title="Admin Overview" description="" noIndex />

      {/* ─── Page Header ─── */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-white/[0.06] bg-gradient-to-br from-[#0c1020] via-[#090b16] to-[#04060e] p-6 sm:p-8">
        <div className="absolute inset-0 bg-grid-glow bg-repeat opacity-[0.25]" />
        <div className="absolute -top-[50%] -right-[30%] w-[80%] h-[80%] rounded-full blur-3xl opacity-[0.25]"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)' }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2.5xl font-black text-white leading-snug">
              ສະບາຍດີ, <span className="bg-gradient-to-r from-[#d4af37] via-yellow-200 to-[#f59e0b] bg-clip-text text-transparent font-black">{user?.full_name || user?.username || 'Admin'}</span> 👋
            </h1>
            <p className="text-[11px] font-bold text-white/35 mt-1">{todayDate}</p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 bg-[#d4af37]/10 text-[#d4af37] text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-[#d4af37]/25 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
              System Online
            </div>
            <Link
              to="/admin/draws"
              className="flex items-center gap-1.5 bg-[#d4af37] hover:bg-[#b8860b] text-black text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-full shadow-md shadow-amber-500/5 transition-all duration-350"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              ເພີ່ມງວດໃໝ່
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Top 4 KPI Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="dataset"
          label="ງວດທັງໝົດ"
          value={draws?.length ?? 0}
          trendLabel={`${publishedCount} Published · ${(draws?.length ?? 0) - publishedCount} Pending`}
          accent="#d4af37"
        />
        <StatCard
          icon="today"
          label="ຍອດເຂົ້າຊົມມື້ນີ້"
          value={visitorStats?.today ?? '—'}
          trendLabel={visitorStats ? `${visitorStats.today_unique ?? 0} unique · ${(visitorStats.this_week ?? 0).toLocaleString()} ສັບດານີ້` : 'ກຳລັງໂຫຼດ...'}
          accent="#7c3aed"
        />
        <StatCard
          icon="group"
          label="ຜູ້ໃຊ້ທັງໝົດ"
          value={userStats?.total_users ?? '—'}
          trendLabel={userStats ? `${userStats.active_users ?? 0} ໃຊ້ງານ · ${userStats.admin_count ?? 0} Admin` : 'ກຳລັງໂຫຼດ...'}
          accent="#d97706"
        />
        <StatCard
          icon="monitoring"
          label="ເດືອນນີ້"
          value={visitorStats?.this_month ?? '—'}
          trendLabel={visitorStats ? `ທັງໝົດ ${(visitorStats.total ?? 0).toLocaleString()} ຄັ້ງ` : 'ກຳລັງໂຫຼດ...'}
          accent="#006c49"
        />
      </div>

      {/* ─── Analytics Chart + Top Pages ─── */}
      <VisitorAnalytics />

      {/* ─── Latest Draw + Type Distribution + Visitor Summary ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Latest Draw  (like "Active Users" widget) */}
        <div className="bg-[#0e1124]/75 backdrop-blur-md rounded-2xl border border-white/[0.05] shadow-lg p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
          <div className="mb-5 relative z-10">
            <CardHeader
              title="ງວດລ່າສຸດ"
              subtitle={latestDraw ? formatLaoDate(latestDraw.draw_date, true) : 'ກຳລັງໂຫຼດ...'}
            />
          </div>
          {latestDraw ? (
            <div className="flex flex-col gap-4 relative z-10">
              <div className="bg-gradient-to-br from-white/[0.01] to-white/[0.03] border border-white/[0.05] rounded-xl p-4 flex flex-col items-center gap-3.5 relative overflow-hidden">
                <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest">
                  ງວດທີ {latestDraw.draw_number}
                </p>
                <DigitRow result={latestDraw.full_result} />
                <div className="flex items-center gap-3 text-[10.5px] font-bold text-white/35 mt-1 leading-none">
                  <span>2 ຕົວ: <strong className="text-[#d4af37] font-black">{twoDigitResult?.result_value}</strong></span>
                  <span className="text-white/10">·</span>
                  <span>3 ຕົວ: <strong className="text-white font-black">{latestDraw.full_result?.slice(-3)}</strong></span>
                </div>
              </div>
              {animal ? (
                <div className="flex items-center gap-3.5 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/[0.08] bg-black/35 p-0.5 shrink-0 shadow-sm">
                    <img
                      src={animalDisplayUrl}
                      alt={animal.animal_name_lao}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none mb-1.5">ນາມສັດ</p>
                    <p className="text-base font-black text-white leading-snug">{animal.animal_name_lao}</p>
                    <p className="text-[10.5px] font-bold text-emerald-400 mt-1 leading-none">ເລກ: {twoDigitResult?.result_value}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                  <span className="material-symbols-outlined text-white/20 text-[20px]">help_outline</span>
                  <p className="text-xs font-bold text-white/30">ບໍ່ມີນາມສັດ</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3 relative z-10">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-white/[0.02] border border-white/[0.04] rounded-xl animate-pulse" />
              ))}
            </div>
          )}
        </div>

        {/* Type Distribution  (like "Sessions by Device") */}
        <div className="bg-[#0e1124]/75 backdrop-blur-md rounded-2xl border border-white/[0.05] shadow-lg p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
          <div className="mb-5 relative z-10">
            <CardHeader title="ສັດສ່ວນຕາມປະເພດ" subtitle="Distribution by lottery type" />
          </div>
          {typeDist.length > 0 ? (
            <div className="relative z-10">
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie
                    data={typeDist}
                    cx="50%" cy="50%"
                    innerRadius={38} outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {typeDist.map((entry, i) => {
                      const themeColors = ['#d4af37', '#f59e0b', '#7c3aed', '#10b981', '#3b82f6', '#ef4444'];
                      const cellColor = themeColors[i % themeColors.length];
                      return <Cell key={i} fill={cellColor} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'rgba(11, 14, 26, 0.95)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: 12, backdropFilter: 'blur(12px)' }}
                    itemStyle={{ color: '#fff', fontWeight: 800, fontSize: 11 }}
                    formatter={(v, n) => [`${v} ງວດ`, n]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5 mt-3">
                {typeDist.map((t, i) => {
                  const total = typeDist.reduce((s, x) => s + x.value, 0);
                  const pct   = Math.round(t.value / total * 100);
                  const themeColors = ['#d4af37', '#f59e0b', '#7c3aed', '#10b981', '#3b82f6', '#ef4444'];
                  const color = themeColors[i % themeColors.length];
                  return (
                    <div key={t.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0 shadow-sm" style={{ background: color }} />
                      <span className="text-[11px] font-bold text-white/55 flex-1 truncate">{t.name}</span>
                      <span className="text-[11px] font-black tabular-nums" style={{ color: color }}>{pct}%</span>
                      <span className="text-[10px] text-white/30 font-bold tabular-nums w-10 text-right">{t.value.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 relative z-10">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-white/[0.02] border border-white/[0.04] rounded-xl animate-pulse" />
              ))}
            </div>
          )}
        </div>

        {/* Visitor Summary  (like "Active Users" live count) */}
        <div className="bg-[#0e1124]/75 backdrop-blur-md rounded-2xl border border-white/[0.05] shadow-lg p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
          <div className="mb-5 relative z-10">
            <CardHeader title="ສະຫຼຸບຜູ້ເຂົ້າຊົມ" subtitle="Visitor summary" />
          </div>
          {visitorStats ? (
            <div className="space-y-4 relative z-10">
              <div className="bg-gradient-to-br from-[#0c1020] via-[#090b16] to-[#04060e] border border-[#d4af37]/20 rounded-xl p-4 text-center relative overflow-hidden shadow-inner">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
                  <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest">ມື້ນີ້ (TODAY)</p>
                </div>
                <p className="text-3xl font-black text-white tabular-nums tracking-tight font-space">{(visitorStats.today || 0).toLocaleString()}</p>
                <p className="text-[10px] text-white/35 mt-1 font-bold uppercase tracking-wider">Visitors today</p>
              </div>
              {[
                { label: 'Unique ມື້ນີ້',  value: visitorStats.today_unique },
                { label: 'ສັບດານີ້',      value: visitorStats.this_week },
                { label: 'ເດືອນນີ້',      value: visitorStats.this_month },
                { label: 'ທັງໝົດ',         value: visitorStats.total },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
                  <p className="text-xs font-bold text-white/55">{label}</p>
                  <p className="text-xs font-black text-white tabular-nums">{(value || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3 relative z-10">
              <div className="h-24 bg-white/[0.02] border border-white/[0.04] rounded-xl animate-pulse" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 bg-white/[0.02] border border-white/[0.04] rounded-lg animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── User Management Stats ─── */}
      <UserStats />

      {/* ─── Recent Draws Table ─── */}
      <RecentHistory />

      {/* ─── Database Maintenance ─── */}
      <div className="bg-[#0e1124]/75 backdrop-blur-md rounded-2xl border border-white/[0.05] shadow-lg p-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <h3 className="text-sm font-black text-white leading-snug">ຈັດການຂໍ້ມູນລະບົບ</h3>
            <p className="text-[10.5px] text-white/35 mt-1 font-bold">
              ລົບ visitor_stats &gt; 90 ວັນ · ລົບ user_logs &gt; 365 ວັນ
            </p>
          </div>
          <div className="flex items-center gap-3">
            {purgeState.result && !purgeState.result.error && (
              <p className="text-[11px] text-emerald-400 font-bold">
                ລົບ {purgeState.result.visitor_stats_deleted} visits · {purgeState.result.user_logs_deleted} logs
              </p>
            )}
            {purgeState.result?.error && (
              <p className="text-[11px] text-rose-400 font-semibold">{purgeState.result.error}</p>
            )}
            <button
              onClick={handlePurgeLogs}
              disabled={purgeState.loading}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 disabled:opacity-50 transition-all duration-300 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
              {purgeState.loading ? 'ກຳລັງລົບ...' : 'Purge Old Logs'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}