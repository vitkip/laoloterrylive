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
                className={`w-7 h-8 flex items-center justify-center rounded-lg text-sm font-black border transition-all
                  ${highlighted
                    ? 'bg-gradient-to-br from-[#ffd700] via-[#e5c158] to-[#aa7c11] text-[#060410] border-[#ffd700]/30 shadow-[0_2px_8px_rgba(255,215,0,0.2)]'
                    : 'bg-[#0d0e1c]/40 border-white/[0.06] text-white/80'
                  }`}
              >
                {d}
              </span>
            )
          })}
          {i < pairs.length - 1 && <span className="text-white/[0.15] font-black text-xs mx-0.5">·</span>}
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
        <div className="bg-gradient-to-br from-[#0d0e1c] to-[#161b36] border border-[#d4af37]/25 shadow-xl rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/12 flex items-center justify-center shadow-sm mb-4">
            <span className="material-symbols-outlined text-[#ffd700] text-[20px]">manage_search</span>
          </div>
          <h2 className="text-lg font-black text-white mb-1.5 font-sans">ຄົ້ນຫາຍ້ອນຫຼັງ</h2>
          <p className="text-xs text-white/40 leading-relaxed font-sans">
            ພິມຕົວເລກ 2–6 ຕົວ ເພື່ອເບິ່ງວ່າມັນເຄີຍອອກງວດໃດ
          </p>
        </div>

        {/* Input */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#ffd700] text-[20px]">
            pin
          </span>
          <input
            type="text"
            maxLength={6}
            placeholder="ຕົວຢ່າງ: 99 ຫຼື 374268"
            value={searchNumber}
            onChange={e => setSearchNumber(e.target.value.replace(/\D/g, ''))}
            className="w-full bg-[#0d0e1c]/60 pl-12 pr-10 py-3.5 rounded-xl border border-white/[0.08] focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 outline-none text-xl font-black tracking-[0.25em] text-[#ffd700] placeholder:text-white/20 placeholder:font-normal placeholder:tracking-normal placeholder:text-sm shadow-sm transition-all"
          />
          {searchNumber && (
            <button
              onClick={() => setSearchNumber('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#ffd700] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Digit keypad */}
        <div>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2 font-sans">ປ່ຽງຕົວເລກ</p>
          <div className="grid grid-cols-5 gap-1.5">
            {digitButtons.map(d => (
              <button
                key={d}
                onClick={() => searchNumber.length < 6 && setSearchNumber(prev => prev + d)}
                className="h-9 rounded-xl bg-[#0d0e1c]/40 border border-white/[0.08] text-white/80 hover:bg-[#0d0e1c]/70 hover:border-[#d4af37]/50 text-sm font-black transition-all font-mono"
              >
                {d}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-1.5">
            <button
              onClick={() => setSearchNumber(prev => prev.slice(0, -1))}
              className="h-9 rounded-xl bg-[#2a1010]/60 border border-red-500/[0.15] text-red-400 hover:bg-[#2a1010]/80 text-xs font-bold transition-all flex items-center justify-center gap-1 font-sans"
            >
              <span className="material-symbols-outlined text-[15px]">backspace</span>
              ລົບ
            </button>
            <button
              onClick={() => setSearchNumber('')}
              className="h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 hover:bg-white/[0.08] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1 font-sans"
            >
              <span className="material-symbols-outlined text-[15px]">clear_all</span>
              ລ້າງ
            </button>
          </div>
        </div>

        {/* Stats summary */}
        {stats && (
          <div className="bg-[#0d0e1c]/80 backdrop-blur-md border border-white/[0.06] shadow-xl rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-sans">ສະຫຼຸບ "{searchNumber}"</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'ອອກທັງໝົດ', value: `${stats.count} ງວດ`, color: 'text-[#ffd700]' },
                { label: 'ຄວາມຖີ່', value: `${stats.pct}%`, color: 'text-[#ffd700]' },
                { label: 'ອອກລ່າສຸດ', value: formatLaoDate(stats.latest, true), color: 'text-white/80' },
                { label: 'ຜ່ານມາ', value: `${stats.daysSinceLast} ວັນ`, color: 'text-white/40' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5">
                  <p className="text-[9px] text-white/40 uppercase tracking-wider mb-0.5 font-sans">{label}</p>
                  <p className={`text-sm font-extrabold ${color} leading-tight font-sans`}>{value}</p>
                </div>
              ))}
            </div>
            {/* Frequency bar */}
            <div>
              <div className="flex justify-between text-[10px] mb-1 text-white/40 font-sans">
                <span>ຄວາມຖີ່ຂອງ "{searchNumber}"</span>
                <span className="font-bold text-[#ffd700]">{stats.pct}%</span>
              </div>
              <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ffd700] to-[#d4af37] rounded-full transition-all duration-700"
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0d0e1c] to-[#161b36] border border-white/[0.06] flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-[28px] text-[#ffd700]">123</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-white/80 mb-1">ພິມຕົວເລກ</p>
                <p className="text-xs text-white/40 font-sans">ໃຊ້ປ່ຽງຕົວເລກ ຫຼື ພິມໂດຍກົງ</p>
              </div>
            </div>
          )}

          {/* No results */}
          {searchNumber && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1a1010]/60 border border-red-500/[0.15] flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px] text-red-400">block</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-white/80 mb-1">ບໍ່ເຄີຍອອກ</p>
                <p className="text-xs text-white/40 font-sans">ເລກ "{searchNumber}" ຍັງບໍ່ໄດ້ອອກໃນຖານຂໍ້ມູນ</p>
              </div>
            </div>
          )}

          {/* Result list */}
          {results.map((d, idx) => (
            <div
              key={d.draw_id}
              className="group bg-[#0d0e1c]/80 backdrop-blur-md border border-white/[0.06] shadow-xl hover:shadow-[#d4af37]/05 hover:border-[#d4af37]/35 hover:-translate-y-0.5 rounded-2xl p-4 sm:p-5 transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Meta */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#d4af37]/12 flex items-center justify-center shrink-0 border border-[#d4af37]/20">
                    <span className="text-xs font-black text-[#ffd700] font-mono">#{idx + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-white leading-tight font-sans">
                      {formatLaoDate(d.draw_date, true)}
                    </p>
                    <p className="text-[11px] text-white/40 font-sans mt-0.5">
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