import { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import ArchiveTable from '../components/ArchiveTable';
import { formatLaoDate } from '../utils/date';
import { API, resolveAnimalImage } from '../utils/api';

function VisitorStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lao_lottery_token');
    fetch(`${API}/?action=visitor_stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#152033] p-6 rounded-2xl border border-[#dee9fd] dark:border-[#2b3a54] shadow-sm">
        <p className="text-[#737686] dark:text-[#94a3b8] text-sm">ກຳລັງໂຫຼດສະຖິຕິ...</p>
      </div>
    );
  }

  if (!stats || stats.error) return null;

  // Build 7-day chart data (fill missing days with 0)
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const dailyMap = {};
  (stats.daily || []).forEach((r) => { dailyMap[r.day] = r; });

  const maxVisits = Math.max(1, ...days.map((d) => dailyMap[d]?.visits || 0));

  const dayNames = ['ອາ', 'ຈ', 'ອ', 'ພ', 'ພຫ', 'ສ', 'ສ'];

  return (
    <div className="bg-white dark:bg-[#152033] p-6 rounded-2xl border border-[#dee9fd] dark:border-[#2b3a54] shadow-sm space-y-6">
      <h2 className="text-xl font-bold text-[#121c2a] dark:text-white">ສະຖິຕິຜູ້ເຂົ້າຊົມ</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="ມື້ນີ້" value={stats.today} sub={`${stats.today_unique} unique`} color="text-[#003fb1]" />
        <StatCard label="7 ວັນຜ່ານມາ" value={stats.this_week} color="text-[#006c49]" />
        <StatCard label="ເດືອນນີ້" value={stats.this_month} color="text-[#7c3aed]" />
        <StatCard label="ທັງໝົດ" value={stats.total} sub={`${stats.unique_sessions} sessions`} color="text-[#b45309]" />
      </div>

      {/* 7-day Bar Chart */}
      <div>
        <p className="text-sm font-semibold text-[#737686] dark:text-[#94a3b8] mb-3 uppercase tracking-widest">7 ວັນຜ່ານມາ</p>
        <div className="flex items-end gap-2 h-24">
          {days.map((day) => {
            const visits = dailyMap[day]?.visits || 0;
            const pct = Math.round((visits / maxVisits) * 100);
            const d = new Date(day + 'T00:00:00');
            const label = dayNames[d.getDay()];
            return (
              <div key={day} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[10px] font-bold text-[#434654] dark:text-[#94a3b8]">{visits > 0 ? visits : ''}</span>
                <div className="w-full bg-[#e8effe] dark:bg-[#1e2d4a] rounded-t-md relative" style={{ height: '56px' }}>
                  <div
                    className="absolute bottom-0 w-full bg-[#003fb1] dark:bg-[#4f7ef8] rounded-t-md transition-all"
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#737686] dark:text-[#94a3b8]">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Pages */}
      {stats.top_pages?.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-[#737686] dark:text-[#94a3b8] mb-2 uppercase tracking-widest">ໜ້າທີ່ນິຍົມ</p>
          <div className="space-y-1">
            {stats.top_pages.slice(0, 5).map((p) => (
              <div key={p.page_path} className="flex justify-between items-center text-sm py-1 border-b border-[#f0f4ff] dark:border-[#1e2d4a]">
                <span className="font-mono text-[#434654] dark:text-[#c7d2fe] truncate max-w-[70%]">{p.page_path || '/'}</span>
                <span className="font-bold text-[#003fb1]">{p.visits}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-[#f9f9ff] dark:bg-[#0d1627] p-4 rounded-xl border border-[#dee9fd] dark:border-[#2b3a54]">
      <p className="text-xs font-bold text-[#737686] dark:text-[#94a3b8] uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-black ${color}`}>{value?.toLocaleString()}</p>
      {sub && <p className="text-xs text-[#737686] dark:text-[#94a3b8] mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminOverview() {
  const { draws, animals } = useData();

  const latestDraw = draws?.[0];
  const twoDigitResult = latestDraw?.results_detail?.find(r => r.prize_type === '2_digits');
  const animal = animals?.find(a => a.animal_id === twoDigitResult?.animal_id);

  const animalDisplayUrl = resolveAnimalImage(animal);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#121c2a] dark:text-white mb-2">ພາບລວມລະບົບ</h1>
        <p className="text-[#434654] dark:text-[#c7d2fe]">ຍິນດີຕ້ອນຮັບສູ່ລະບົບຈັດການຫຼັງບ້ານ (Backoffice)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#152033] p-6 rounded-2xl border border-[#dee9fd] dark:border-[#2b3a54] shadow-sm flex flex-col justify-center">
          <p className="text-sm font-bold text-[#737686] dark:text-[#94a3b8] uppercase tracking-widest mb-1">ຍອດງວດທັງໝົດ</p>
          <p className="text-4xl font-black text-[#003fb1]">{draws?.length || 0}</p>
        </div>

        {latestDraw && (
          <div className="bg-white dark:bg-[#152033] p-6 rounded-2xl border border-[#dee9fd] dark:border-[#2b3a54] shadow-sm lg:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm font-bold text-[#737686] dark:text-[#94a3b8] uppercase tracking-widest mb-1">
                ຜົນງວດລ່າສຸດ (ງວດ {latestDraw.draw_number})
              </p>
              <p className="text-3xl sm:text-4xl font-black text-[#006c49] tracking-[0.2em] mb-1">
                {latestDraw.full_result}
              </p>
              <p className="text-xs text-[#737686] dark:text-[#94a3b8] font-medium">{formatLaoDate(latestDraw.draw_date, true)}</p>
            </div>

            {animal && (
              <div className="flex items-center gap-4 bg-[#f9f9ff] dark:bg-[#0d1627] px-4 py-3 rounded-xl border border-[#dee9fd] dark:border-[#2b3a54] min-w-[200px]">
                <div className="w-14 h-14 bg-white dark:bg-[#152033] rounded-full flex items-center justify-center overflow-hidden border border-[#eff3ff] dark:border-[#1e2d4a] shrink-0">
                  <img
                    src={animalDisplayUrl}
                    alt={animal.animal_name_lao}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#121c2a] dark:text-white">{animal.animal_name_lao}</p>
                  <p className="text-sm font-bold text-[#003fb1]">ເລກອອກ: {twoDigitResult.result_value}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visitor Statistics */}
      <VisitorStats />

      <div className="bg-white dark:bg-[#152033] p-6 rounded-2xl border border-[#dee9fd] dark:border-[#2b3a54] shadow-sm">
        <h2 className="text-xl font-bold text-[#121c2a] dark:text-white mb-4">ປະຫວັດການປ້ອນລ່າສຸດ</h2>
        <ArchiveTable compact />
      </div>
    </div>
  );
}
