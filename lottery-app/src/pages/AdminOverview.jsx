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
function StatCard({ icon, label, value, trendLabel, accent = '#003fb1' }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-2">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accent}18` }}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ color: accent }}>{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-[28px] font-black text-foreground leading-none mb-1.5 tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : (value ?? '—')}
        </p>
        <p className="text-[13px] font-semibold text-muted-foreground leading-snug">{label}</p>
        {trendLabel && (
          <p className="text-[10px] text-muted-foreground/50 mt-1.5">{trendLabel}</p>
        )}
      </div>
    </div>
  );
}

/** Section card header */
function CardHeader({ title, subtitle }) {
  return (
    <div>
      <h3 className="text-[15px] font-extrabold text-foreground leading-snug">{title}</h3>
      {subtitle && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{subtitle}</p>}
    </div>
  );
}

/** Period toggle tabs */
function PeriodTabs({ value, onChange, options }) {
  return (
    <div className="flex items-center gap-0.5 bg-secondary rounded-xl p-1 shrink-0">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
            value === opt.value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
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
    <div className="flex items-center gap-2">
      {groups.map((grp, gi) => (
        <div key={gi} className="flex items-center gap-1">
          {grp.split('').map((ch, ci) => (
            <div
              key={ci}
              className={`w-9 h-10 rounded-xl flex items-center justify-center text-[17px] font-black
                ${/\d/.test(ch)
                  ? 'bg-gradient-to-br from-[#003fb1] to-[#1a56db] text-white shadow-sm'
                  : 'bg-secondary text-muted-foreground/20'}`}
            >
              {ch}
            </div>
          ))}
          {gi < 2 && <span className="text-border font-black text-xs mx-0.5">·</span>}
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
const PAGE_ACCENTS = ['#003fb1', '#006c49', '#7c3aed', '#d97706', '#0891b2', '#ba1a1a'];

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
      <div className="lg:col-span-3 bg-card border border-border rounded-2xl h-72 animate-pulse" />
      <div className="lg:col-span-2 bg-card border border-border rounded-2xl h-72 animate-pulse" />
    </div>
  );

  if (errMsg || !stats) return (
    <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-3">
      <span className="material-symbols-outlined text-destructive text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
      <p className="text-sm text-muted-foreground">ສະຖິຕິ: <span className="text-destructive font-bold">{errMsg || 'ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ'}</span></p>
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
      <div className="lg:col-span-3 bg-card rounded-2xl border border-border shadow-sm p-6">
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
                <stop offset="5%"  stopColor="#003fb1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#003fb1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="uniqueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#006c49" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#006c49" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 11 }}
              itemStyle={{ color: 'var(--foreground)', fontWeight: 700 }}
              formatter={(v, n) => [v.toLocaleString(), n === 'visits' ? 'ຄັ້ງ' : 'Unique']}
            />
            <Area type="monotone" dataKey="visits" stroke="#003fb1" strokeWidth={2} fill="url(#visitGrad)" dot={false} name="visits" />
            <Area type="monotone" dataKey="unique" stroke="#006c49" strokeWidth={2} fill="url(#uniqueGrad)" dot={false} name="unique" />
          </AreaChart>
        </ResponsiveContainer>

        <div className="flex items-center gap-5 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-[#003fb1] rounded" />
            <span className="text-[11px] font-medium text-muted-foreground">ຍອດເຂົ້າຊົມ</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-[#006c49] rounded" />
            <span className="text-[11px] font-medium text-muted-foreground">Unique</span>
          </div>
        </div>
      </div>

      {/* ── Top Pages ── */}
      <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-6">
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
                    <span className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black text-white shrink-0" style={{ background: accent }}>
                      {i + 1}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground truncate">{p.page_path || '/'}</span>
                  </div>
                  <span className="text-[11px] font-black ml-2 shrink-0" style={{ color: accent }}>{p.visits.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${barPct}%`, background: accent }} />
                </div>
              </div>
            );
          })}
          {(!stats.top_pages || stats.top_pages.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-10">ຍັງບໍ່ມີຂໍ້ມູນ</p>
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
        <div key={i} className="bg-card border border-border rounded-2xl p-6 h-52 animate-pulse" />
      ))}
    </div>
  );

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

      {/* ── KPI row ── */}
      <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'ຜູ້ໃຊ້ທັງໝົດ', value: stats.total_users,  icon: 'group',                accent: '#003fb1' },
          { label: 'ໃຊ້ງານ',       value: stats.active_users, icon: 'check_circle',          accent: '#006c49' },
          { label: 'Admin',         value: stats.admin_count,  icon: 'admin_panel_settings',  accent: '#ba1a1a' },
          { label: 'Staff',         value: stats.staff_count,  icon: 'badge',                 accent: '#d97706' },
        ].map(c => (
          <div key={c.label} className="bg-card rounded-2xl border border-border shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${c.accent}15` }}>
              <span className="material-symbols-outlined text-[18px]" style={{ color: c.accent }}>{c.icon}</span>
            </div>
            <div>
              <p className="text-xl font-black text-foreground leading-none tabular-nums">{c.value ?? '—'}</p>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent logins ── */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <CardHeader title="ເຂົ້າລະບົບລ່າສຸດ" subtitle="Recent login activity" />
          <Link to="/admin/logs" className="text-[11px] font-bold text-[#003fb1] hover:underline shrink-0">ທັງໝົດ →</Link>
        </div>
        <div>
          {(stats.recent_logins || []).length === 0
            ? <p className="text-xs text-muted-foreground text-center py-6">ຍັງບໍ່ມີ login</p>
            : (stats.recent_logins || []).map((l, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                <UserAvatar name={l.full_name} username={l.username} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{l.full_name || `@${l.username}`}</p>
                  <p className="text-[10px] text-muted-foreground/60">{fmtDt(l.logged_at)}</p>
                </div>
                <RoleBadge role={l.role} size="xs" />
              </div>
            ))
          }
        </div>
      </div>

      {/* ── New users ── */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <CardHeader title="ຜູ້ໃຊ້ໃໝ່" subtitle="Recently registered" />
          <Link to="/admin/users" className="text-[11px] font-bold text-[#003fb1] hover:underline shrink-0">ຈັດການ →</Link>
        </div>
        <div>
          {(stats.new_users || []).length === 0
            ? <p className="text-xs text-muted-foreground text-center py-6">ຍັງບໍ່ມີ user</p>
            : (stats.new_users || []).map(u => (
              <div key={u.user_id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                <UserAvatar name={u.full_name} username={u.username} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{u.full_name || u.username}</p>
                  <p className="text-[10px] text-muted-foreground/60">{fmtDt(u.created_at)}</p>
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
    <div className="bg-card border border-border rounded-2xl p-8 flex items-center gap-3">
      <span className="material-symbols-outlined text-[#003fb1] text-[20px] animate-spin">progress_activity</span>
      <p className="text-sm text-muted-foreground">ກຳລັງໂຫຼດ...</p>
    </div>
  );

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h3 className="text-[15px] font-extrabold text-foreground">ງວດລ່າສຸດ</h3>
          <p className="text-[11px] text-muted-foreground/70 mt-0.5">{draws.length.toLocaleString()} ງວດທັງໝົດ</p>
        </div>
        <Link
          to="/admin/draws"
          className="flex items-center gap-1.5 text-[11px] font-bold text-[#003fb1] hover:text-[#1a56db] transition-colors"
        >
          ຈັດການທັງໝົດ
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="px-6 py-3 text-left text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest w-8">#</th>
              <th className="px-4 py-3 text-left text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">ງວດ / ວັນທີ</th>
              <th className="px-4 py-3 text-left text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">ປະເພດ</th>
              <th className="px-4 py-3 text-left text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">ເລກທີ່ອອກ</th>
              <th className="px-4 py-3 text-left text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest hidden sm:table-cell">ນາມສັດ</th>
              <th className="px-6 py-3 text-left text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">ສະຖານະ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recentDraws.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-sm text-muted-foreground">ຍັງບໍ່ມີຂໍ້ມູນ</td>
              </tr>
            ) : recentDraws.map((draw, idx) => {
              const twoDigit  = draw.results_detail?.find(r => r.prize_type === '2_digits');
              const animal    = animals?.find(a => String(a.animal_id) === String(twoDigit?.animal_id));
              const animalImg = resolveAnimalImage(animal);
              const t         = types?.find(t => t.type_id == draw.type_id);
              const color     = t?.color || '#003fb1';
              const pairs     = draw.full_result?.length >= 6
                ? [draw.full_result.slice(0, 2), draw.full_result.slice(2, 4), draw.full_result.slice(4, 6)]
                : [];
              const isLatest = idx === 0;

              return (
                <tr
                  key={draw.draw_id}
                  className={`hover:bg-accent/30 transition-colors ${isLatest ? 'bg-[#eff3ff]/20 dark:bg-[#1e2d4a]/10' : ''}`}
                >
                  <td className="px-6 py-3.5 w-8">
                    {isLatest ? (
                      <div className="relative w-3 h-3">
                        <span className="absolute inset-0 rounded-full bg-[#003fb1]/30 animate-ping" />
                        <span className="relative w-3 h-3 rounded-full bg-[#003fb1] block" />
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground/30 tabular-nums">{idx + 1}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-bold text-foreground">{formatLaoDate(draw.draw_date, true)}</p>
                    <p className="text-[10px] text-muted-foreground/60">ງວດທີ {draw.draw_number}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    {t && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border whitespace-nowrap"
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
                              className="w-6 h-7 flex items-center justify-center rounded-md bg-gradient-to-br from-[#003fb1] to-[#1a56db] text-white text-xs font-black shadow-sm"
                            >
                              {d}
                            </span>
                          ))}
                          {pi < 2 && <span className="mx-0.5 text-border text-[9px] font-black">·</span>}
                        </div>
                      )) : (
                        <span className="text-xs font-black text-foreground font-mono">{draw.full_result}</span>
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
                            className="w-7 h-7 rounded-lg object-contain bg-secondary/50 p-0.5 border border-border shrink-0"
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div>
                          <p className="text-xs font-bold text-foreground leading-none">{animal.animal_name_lao}</p>
                          <p className="text-[10px] text-muted-foreground/60 tabular-nums">{twoDigit?.result_value}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/30">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                      draw.status === 'published'
                        ? 'text-[#006c49] bg-[#edfdf5] border-[#6cf8bb]/40 dark:bg-[#041f0f] dark:border-[#166534]/40'
                        : 'text-[#d97706] bg-[#fffbeb] border-[#fcd34d]/40 dark:bg-[#1c1400] dark:border-[#92400e]/40'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${draw.status === 'published' ? 'bg-[#006c49]' : 'bg-[#d97706]'}`} />
                      {draw.status === 'published' ? 'Published' : 'Pending'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3.5 border-t border-border bg-secondary/20">
        <Link
          to="/admin/draws"
          className="flex items-center justify-center gap-2 text-[11px] font-bold text-[#003fb1] hover:text-[#1a56db] transition-colors group"
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
          color: t.color || '#003fb1',
        }))
        .filter(t => t.value > 0)
    : [];

  const todayDate = new Date().toLocaleDateString('lo-LA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="space-y-7">
      <SEO title="Admin Overview" description="" noIndex />

      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-foreground leading-snug">
            ສະບາຍດີ, <span className="text-[#003fb1]">{user?.full_name || user?.username || 'Admin'}</span> 👋
          </h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">{todayDate}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#edfdf5] dark:bg-[#041f0f] text-[#006c49] dark:text-[#4ade80] text-[11px] font-bold px-3 py-1.5 rounded-full border border-[#6cf8bb]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
            System Online
          </div>
          <Link
            to="/admin/draws"
            className="flex items-center gap-1.5 bg-[#003fb1] text-white text-[11px] font-bold px-3 py-1.5 rounded-full hover:bg-[#1a56db] transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            ງວດໃໝ່
          </Link>
        </div>
      </div>

      {/* ─── Top 4 KPI Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="dataset"
          label="ງວດທັງໝົດ"
          value={draws?.length ?? 0}
          trendLabel={`${publishedCount} Published · ${(draws?.length ?? 0) - publishedCount} Pending`}
          accent="#003fb1"
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
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="mb-5">
            <CardHeader
              title="ງວດລ່າສຸດ"
              subtitle={latestDraw ? formatLaoDate(latestDraw.draw_date, true) : 'ກຳລັງໂຫຼດ...'}
            />
          </div>
          {latestDraw ? (
            <div className="flex flex-col gap-4">
              <div className="bg-gradient-to-br from-[#eff3ff] to-[#dbeafe] dark:from-[#1e2d4a] dark:to-[#0f172a] rounded-xl p-4 flex flex-col items-center gap-3">
                <p className="text-[10px] font-bold text-[#003fb1]/60 dark:text-[#93b4ff]/60 uppercase tracking-wider">
                  ງວດທີ {latestDraw.draw_number}
                </p>
                <DigitRow result={latestDraw.full_result} />
                <div className="flex items-center gap-3 text-[11px] font-bold text-[#003fb1]/60 dark:text-[#93b4ff]/60">
                  <span>2 ຕົວ: <strong className="text-[#003fb1] dark:text-[#93b4ff]">{twoDigitResult?.result_value}</strong></span>
                  <span>·</span>
                  <span>3 ຕົວ: <strong>{latestDraw.full_result?.slice(-3)}</strong></span>
                </div>
              </div>
              {animal ? (
                <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3.5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-border bg-card shrink-0">
                    <img
                      src={animalDisplayUrl}
                      alt={animal.animal_name_lao}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">ນາມສັດ</p>
                    <p className="text-base font-black text-foreground">{animal.animal_name_lao}</p>
                    <p className="text-xs font-bold text-[#006c49]">ເລກ: {twoDigitResult?.result_value}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-3.5">
                  <span className="material-symbols-outlined text-muted-foreground text-[20px]">help_outline</span>
                  <p className="text-sm text-muted-foreground">ບໍ່ມີນາມສັດ</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-secondary rounded-xl animate-pulse" />
              ))}
            </div>
          )}
        </div>

        {/* Type Distribution  (like "Sessions by Device") */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="mb-5">
            <CardHeader title="ສັດສ່ວນຕາມປະເພດ" subtitle="Distribution by lottery type" />
          </div>
          {typeDist.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie
                    data={typeDist}
                    cx="50%" cy="50%"
                    innerRadius={38} outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {typeDist.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
                    formatter={(v, n) => [`${v} ງວດ`, n]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5 mt-3">
                {typeDist.map(t => {
                  const total = typeDist.reduce((s, x) => s + x.value, 0);
                  const pct   = Math.round(t.value / total * 100);
                  return (
                    <div key={t.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: t.color }} />
                      <span className="text-[11px] font-medium text-muted-foreground flex-1 truncate">{t.name}</span>
                      <span className="text-[11px] font-black tabular-nums" style={{ color: t.color }}>{pct}%</span>
                      <span className="text-[10px] text-muted-foreground/50 tabular-nums w-10 text-right">{t.value.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-secondary rounded-xl animate-pulse" />
              ))}
            </div>
          )}
        </div>

        {/* Visitor Summary  (like "Active Users" live count) */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="mb-5">
            <CardHeader title="ສະຫຼຸບຜູ້ເຂົ້າຊົມ" subtitle="Visitor summary" />
          </div>
          {visitorStats ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-[#001d6e] to-[#003fb1] rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">ມື້ນີ້</p>
                </div>
                <p className="text-3xl font-black text-white tabular-nums">{(visitorStats.today || 0).toLocaleString()}</p>
                <p className="text-[11px] text-white/50 mt-1">Visitors today</p>
              </div>
              {[
                { label: 'Unique ມື້ນີ້',  value: visitorStats.today_unique },
                { label: 'ສັບດານີ້',      value: visitorStats.this_week },
                { label: 'ເດືອນນີ້',      value: visitorStats.this_month },
                { label: 'ທັງໝົດ',         value: visitorStats.total },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                  <p className="text-[12px] font-medium text-muted-foreground">{label}</p>
                  <p className="text-[13px] font-black text-foreground tabular-nums">{(value || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="h-24 bg-secondary rounded-xl animate-pulse" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 bg-secondary rounded-lg animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── User Management Stats ─── */}
      <UserStats />

      {/* ─── Recent Draws Table ─── */}
      <RecentHistory />
    </div>
  );
}