import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { formatLaoDate } from '../utils/date';

function HighlightResult({ full_result, searchStr }) {
  const pairs = full_result.length >= 6
    ? [full_result.slice(0,2), full_result.slice(2,4), full_result.slice(4,6)]
    : [full_result];
  return (
    <div className="flex items-center gap-1">
      {pairs.map((pair, i) => (
        <span
          key={i}
          className={`inline-flex gap-px`}
        >
          {pair.split('').map((d, j) => {
            const highlighted = full_result.indexOf(searchStr) !== -1 &&
              (pairs.slice(0, i).join('') + pair.slice(0, j)).length >= full_result.indexOf(searchStr) &&
              (pairs.slice(0, i).join('') + pair.slice(0, j + 1)).length <= full_result.indexOf(searchStr) + searchStr.length;
            return (
              <span
                key={j}
                className={`w-7 h-8 flex items-center justify-center rounded-lg text-sm font-black
                  ${highlighted
                    ? 'bg-[#003fb1] text-white shadow-sm'
                    : 'bg-secondary text-primary'
                  }`}
              >
                {d}
              </span>
            )
          })}
          {i < pairs.length - 1 && <span className="text-[#c3c5d7] dark:text-[#2b3a54] font-black text-xs mx-0.5">·</span>}
        </span>
      ))}
    </div>
  )
}

export default function NumberHistorySearch({ selectedType = 'all' }) {
  const { draws } = useData();
  const [searchNumber, setSearchNumber] = useState('');

  const filteredDraws = selectedType === 'all'
    ? draws
    : draws?.filter(d => String(d.type_id) === String(selectedType))

  const results = useMemo(() => {
    if (!searchNumber.trim() || !filteredDraws) return [];
    const searchStr = searchNumber.trim();
    return filteredDraws
      .filter(d => {
        if (d.status !== 'published') return false;
        if (searchStr.length === 2) {
          const twoDigit = d.results_detail?.find(r => r.prize_type === '2_digits');
          return twoDigit && twoDigit.result_value === searchStr;
        }
        return d.full_result?.includes(searchStr);
      })
      .sort((a, b) => new Date(b.draw_date) - new Date(a.draw_date));
  }, [searchNumber, filteredDraws]);

  const stats = useMemo(() => {
    if (!results.length || !filteredDraws?.length) return null;
    const published = filteredDraws.filter(d => d.status === 'published').length;
    const pct = published > 0 ? ((results.length / published) * 100).toFixed(1) : 0;
    const dates = results.map(d => new Date(d.draw_date));
    const latest = new Date(Math.max(...dates));
    const earliest = new Date(Math.min(...dates));
    const daysSinceLast = Math.floor((new Date() - latest) / (1000 * 60 * 60 * 24));
    return { count: results.length, pct, latest, earliest, daysSinceLast }
  }, [results, filteredDraws]);

  const digitButtons = ['0','1','2','3','4','5','6','7','8','9'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

      {/* ─── Left: Search Panel ─── */}
      <div className="lg:col-span-2 flex flex-col gap-5">

        {/* Header card */}
        <div className="bg-gradient-to-br from-[#edfdf5] to-[#d1fae5] dark:from-[#052e16] dark:to-[#041f0f] rounded-2xl p-6 border border-[#6cf8bb]/30 dark:border-[#166534]/40">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006c49] to-[#00a36c] flex items-center justify-center shadow-sm mb-4">
            <span className="material-symbols-outlined text-white text-[20px]">manage_search</span>
          </div>
          <h2 className="text-lg font-extrabold text-foreground mb-1.5">ຄົ້ນຫາຍ້ອນຫຼັງ</h2>
          <p className="text-xs text-[#166534] dark:text-[#6cf8bb] leading-relaxed">
            ພິມຕົວເລກ 2–6 ຕົວ ເພື່ອເບິ່ງວ່າມັນເຄີຍອອກງວດໃດ
          </p>
        </div>

        {/* Input */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4ade80] text-[20px]">
            pin
          </span>
          <input
            type="text"
            maxLength={6}
            placeholder="ຕົວຢ່າງ: 99 ຫຼື 374268"
            value={searchNumber}
            onChange={e => setSearchNumber(e.target.value.replace(/\D/g, ''))}
            className="w-full bg-card pl-12 pr-10 py-3.5 rounded-xl border border-[#6cf8bb]/40 dark:border-[#166534]/40 focus:border-[#006c49] focus:ring-2 focus:ring-[#006c49]/20 outline-none text-xl font-black tracking-[0.25em] text-foreground placeholder:text-[#6cf8bb]/50 placeholder:font-normal placeholder:tracking-normal placeholder:text-sm shadow-sm transition-all"
          />
          {searchNumber && (
            <button
              onClick={() => setSearchNumber('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4ade80] hover:text-[#006c49] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Digit keypad */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">ປ່ຽງຕົວເລກ</p>
          <div className="grid grid-cols-5 gap-1.5">
            {digitButtons.map(d => (
              <button
                key={d}
                onClick={() => searchNumber.length < 6 && setSearchNumber(prev => prev + d)}
                className="h-9 rounded-xl bg-[#edfdf5] dark:bg-[#0a2e20] text-[#006c49] dark:text-[#4ade80] text-sm font-black border border-[#6cf8bb]/30 hover:bg-[#d1fae5] hover:shadow-sm transition-all"
              >
                {d}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-1.5">
            <button
              onClick={() => setSearchNumber(prev => prev.slice(0, -1))}
              className="h-9 rounded-xl bg-[#fff4f4] dark:bg-[#2a1010] text-[#ba1a1a] text-xs font-bold border border-[#ffdad6]/50 hover:bg-[#ffdad6] transition-all flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">backspace</span>
              ລົບ
            </button>
            <button
              onClick={() => setSearchNumber('')}
              className="h-9 rounded-xl bg-muted text-muted-foreground text-xs font-bold border border-border hover:bg-[#eff3ff] transition-all flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">clear_all</span>
              ລ້າງ
            </button>
          </div>
        </div>

        {/* Stats summary */}
        {stats && (
          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ສະຫຼຸບ "{searchNumber}"</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'ອອກທັງໝົດ', value: `${stats.count} ງວດ`, color: 'text-[#006c49]' },
                { label: 'ຄວາມຖີ່', value: `${stats.pct}%`, color: 'text-[#003fb1]' },
                { label: 'ອອກລ່າສຸດ', value: formatLaoDate(stats.latest, true), color: 'text-foreground' },
                { label: 'ຜ່ານມາ', value: `${stats.daysSinceLast} ວັນ`, color: 'text-[#737686]' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-muted rounded-xl p-2.5">
                  <p className="text-[9px] text-[#a0a3bd] uppercase tracking-wider mb-0.5">{label}</p>
                  <p className={`text-sm font-extrabold ${color} leading-tight`}>{value}</p>
                </div>
              ))}
            </div>
            {/* Frequency bar */}
            <div>
              <div className="flex justify-between text-[10px] mb-1 text-[#737686]">
                <span>ຄວາມຖີ່ຂອງ "{searchNumber}"</span>
                <span className="font-bold text-[#006c49]">{stats.pct}%</span>
              </div>
              <div className="h-2 bg-[#e8edf8] dark:bg-[#2b3a54] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#006c49] to-[#00a36c] rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, parseFloat(stats.pct) * 5)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Right: Results ─── */}
      <div className="lg:col-span-3 flex flex-col min-h-0">
        <div className="overflow-y-auto space-y-3 pr-1 max-h-[70vh]">

          {/* Idle */}
          {!searchNumber && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#edfdf5] to-[#d1fae5] dark:from-[#052e16] dark:to-[#041f0f] flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[28px] text-[#006c49]">123</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-muted-foreground mb-1">ພິມຕົວເລກ</p>
                <p className="text-xs text-[#a0a3bd] dark:text-[#555870]">ໃຊ້ປ່ຽງຕົວເລກ ຫຼື ພິມໂດຍກົງ</p>
              </div>
            </div>
          )}

          {/* No results */}
          {searchNumber && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#fff4f4] dark:bg-[#2a1010] flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px] text-[#ba1a1a]">block</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-muted-foreground mb-1">ບໍ່ເຄີຍອອກ</p>
                <p className="text-xs text-[#a0a3bd] dark:text-[#555870]">ເລກ "{searchNumber}" ຍັງບໍ່ໄດ້ອອກໃນຖານຂໍ້ມູນ</p>
              </div>
            </div>
          )}

          {/* Result list */}
          {results.map((d, idx) => (
            <div
              key={d.draw_id}
              className="group bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-sm hover:shadow-md hover:border-[#006c49]/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Meta */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#edfdf5] dark:bg-[#052e16] flex items-center justify-center shrink-0 border border-[#6cf8bb]/30">
                    <span className="text-xs font-black text-[#006c49]">#{idx + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-foreground leading-tight">
                      {formatLaoDate(d.draw_date, true)}
                    </p>
                    <p className="text-[11px] text-[#a0a3bd] dark:text-[#555870] font-medium mt-0.5">
                      ງວດທີ {d.draw_number}
                    </p>
                  </div>
                </div>

                {/* Result digits */}
                <HighlightResult full_result={d.full_result} searchStr={searchNumber} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}