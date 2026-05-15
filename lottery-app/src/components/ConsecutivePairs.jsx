import { useState, useMemo } from 'react';
import { useStatistics } from '../hooks/useStatistics';

// Colour ramp by rank: 1st = deepest blue, fades down
const RANK_COLORS = [
  { bg: 'bg-[#003fb1]', text: 'text-white', bar: 'bg-[#003fb1]', badge: 'bg-[#003fb1]/10 text-[#003fb1] dark:text-[#6fa3ff]' },
  { bg: 'bg-[#1a56db]', text: 'text-white', bar: 'bg-[#1a56db]', badge: 'bg-[#1a56db]/10 text-[#1a56db] dark:text-[#6fa3ff]' },
  { bg: 'bg-[#2563eb]', text: 'text-white', bar: 'bg-[#2563eb]', badge: 'bg-[#2563eb]/10 text-[#2563eb] dark:text-[#6fa3ff]' },
  { bg: 'bg-[#3b82f6]', text: 'text-white', bar: 'bg-[#3b82f6]', badge: 'bg-[#3b82f6]/10 text-[#3b82f6] dark:text-[#6fa3ff]' },
  { bg: 'bg-[#60a5fa]', text: 'text-white', bar: 'bg-[#60a5fa]', badge: 'bg-[#60a5fa]/10 text-[#60a5fa] dark:text-[#93c5fd]' },
];
const DEFAULT_COLOR = { bg: 'bg-secondary', text: 'text-[#434654] dark:text-white', bar: 'bg-border', badge: 'bg-secondary text-muted-foreground' };

function getRankColor(i) {
  return RANK_COLORS[i] ?? DEFAULT_COLOR;
}

export default function ConsecutivePairs({ timeframe }) {
  const { stats, loading } = useStatistics(timeframe);
  const [inputVal, setInputVal] = useState('');

  // Normalise: only digits, max 2 chars, pad to '00' when full
  const query = inputVal.replace(/\D/g, '').slice(0, 2);

  // Build lookup from full pairsTracker for the searched number
  const searchResults = useMemo(() => {
    if (!stats?.pairsTracker || query.length < 2) return null;
    const followers = stats.pairsTracker[query] ?? {};
    const total = Object.values(followers).reduce((s, c) => s + c, 0);
    if (total === 0) return [];
    return Object.entries(followers)
      .map(([nextNum, count]) => ({ nextNum, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [stats, query]);

  const { hotPairs = [] } = stats ?? {};
  const maxHot = hotPairs[0]?.count || 1;

  const handleInput = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    setInputVal(val);
  };

  if (loading || !stats) {
    return (
      <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-sm">
        <p className="text-muted-foreground text-sm animate-pulse">ກຳລັງໂຫຼດ...</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-sm border border-border space-y-8">

      {/* ─── Header ─── */}
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="material-symbols-outlined text-[#003fb1]">sync_alt</span>
          ສະຖິຕິຈັບຄູ່ຕົວເລກ
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          ພິມເລກ 2 ຕົວທີ່ອອກລ່າສຸດ — ເບິ່ງວ່າເລກໃດ ມັກອອກຕາມ
        </p>
      </div>

      {/* ─── Search Input ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground material-symbols-outlined text-xl select-none">
            search
          </span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={inputVal}
            onChange={handleInput}
            placeholder="ພິມເລກ 2 ຕົວ (ເຊັ່ນ: 07)"
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#f4f7fe] dark:bg-[#0d1627] border-2 border-border focus:border-[#003fb1] outline-none text-xl font-black text-foreground placeholder:text-[#b0b5d0] placeholder:font-normal tracking-[0.25em] transition-colors"
          />
        </div>

        {query.length === 2 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-[#003fb1]/8 dark:bg-[#003fb1]/20 rounded-2xl border border-[#003fb1]/20">
            <span className="text-muted-foreground text-sm">ຫຼັງຈາກ</span>
            <span className="text-3xl font-black text-[#003fb1] tracking-wider">{query}</span>
            <span className="text-muted-foreground text-sm">ອອກ...</span>
          </div>
        )}

        {query.length === 2 && (
          <button
            onClick={() => setInputVal('')}
            className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-[#ba1a1a] transition-colors px-3 py-2 rounded-xl hover:bg-[#ffdad6]/30"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
            ລ້າງ
          </button>
        )}
      </div>

      {/* ─── Search Results ─── */}
      {searchResults !== null && (
        <div>
          {searchResults.length === 0 ? (
            <div className="py-10 text-center">
              <span className="material-symbols-outlined text-4xl text-border mb-2 block">search_off</span>
              <p className="text-muted-foreground text-sm">
                ເລກ <span className="font-black text-foreground">{query}</span> ຍັງບໍ່ເຄີຍເຫັນໃນຂໍ້ມູນ
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                ອັນດັບເລກທີ່ອອກຕາມຫຼັງ <span className="text-[#003fb1]">{query}</span> ({searchResults.reduce((s,r)=>s+r.count,0)} ຄັ້ງທັງໝົດ)
              </p>
              {searchResults.map((r, i) => {
                const col = getRankColor(i);
                const maxCount = searchResults[0].count;
                const barW = Math.round((r.count / maxCount) * 100);
                return (
                  <div key={r.nextNum} className="flex items-center gap-4 group">
                    {/* Rank */}
                    <span className="w-6 text-center text-xs font-black text-muted-foreground shrink-0">
                      {i + 1}
                    </span>

                    {/* Number badge */}
                    <div className={`w-12 h-12 rounded-xl ${col.bg} ${col.text} flex items-center justify-center text-xl font-black shadow-sm shrink-0`}>
                      {r.nextNum}
                    </div>

                    {/* Bar + count */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-muted-foreground">{r.pct}%</span>
                        <span className="text-sm font-black text-foreground">{r.count} ຄັ້ງ</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${col.bar} rounded-full transition-all duration-500`}
                          style={{ width: `${barW}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Divider if showing global ─── */}
      {searchResults !== null && searchResults.length > 0 && (
        <hr className="border-border" />
      )}

      {/* ─── Global Hot Pairs (always visible) ─── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Top 10 ຄູ່ທີ່ມັກອອກຕາມຫຼັງກັນທຸກເວລາ
        </p>

        {hotPairs.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            ຍັງບໍ່ມີຂໍ້ມູນສະຖິຕິທີ່ພຽງພໍ
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hotPairs.map((pair, i) => {
              const col = getRankColor(i);
              const barW = Math.round((pair.count / maxHot) * 100);
              return (
                <div
                  key={`${pair.currentNum}-${pair.nextNum}`}
                  className="flex items-center gap-3 p-3 bg-background rounded-2xl border border-border hover:border-[#003fb1]/40 transition-colors group cursor-pointer"
                  onClick={() => setInputVal(pair.currentNum)}
                  title={`ກົດເພື່ອຄົ້ນຫາ ${pair.currentNum}`}
                >
                  {/* Rank bubble */}
                  <span className="text-[10px] font-black text-muted-foreground w-4 text-center shrink-0">{i + 1}</span>

                  {/* From number */}
                  <span className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-base font-black text-foreground shrink-0">
                    {pair.currentNum}
                  </span>

                  <span className="material-symbols-outlined text-[#b5c4ff] dark:text-[#2b3a54] group-hover:text-[#003fb1] transition-colors text-xl shrink-0">
                    arrow_right_alt
                  </span>

                  {/* To number */}
                  <span className={`w-10 h-10 rounded-lg ${col.bg} ${col.text} flex items-center justify-center text-base font-black shrink-0`}>
                    {pair.nextNum}
                  </span>

                  {/* Bar */}
                  <div className="flex-1 min-w-0">
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${col.bar} rounded-full`} style={{ width: `${barW}%` }} />
                    </div>
                  </div>

                  {/* Count */}
                  <span className="text-sm font-black text-foreground shrink-0">{pair.count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
