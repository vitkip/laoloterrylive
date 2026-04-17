import { useState, useMemo } from 'react';
import { animals } from '../data/animals';
import { dreamDictionary } from '../data/dreams';

const QUICK_HINTS = ['ງູ', 'ປາ', 'ຊ້າງ', 'ແມວ', 'ໝາ', 'ນ້ຳ', 'ໄຟ', 'ເງິນ']

const CATEGORY_COLOR = {
  'ສັດ': { bg: 'bg-[#edfdf5]', text: 'text-[#006c49]', border: 'border-[#6cf8bb]/40' },
  'ທຳມະຊາດ': { bg: 'bg-[#eff6ff]', text: 'text-[#0369a1]', border: 'border-[#93c5fd]/40' },
  'ສັດນ້ຳ': { bg: 'bg-[#f0fdff]', text: 'text-[#0891b2]', border: 'border-[#67e8f9]/40' },
  'ສັດທົ່ວໄປ': { bg: 'bg-[#f5f3ff]', text: 'text-[#7c3aed]', border: 'border-[#c4b5fd]/40' },
}
const defaultCat = { bg: 'bg-[#f5f7ff]', text: 'text-[#555870]', border: 'border-[#e8edf8]' }

export default function DreamDictionary() {
  const [searchTerm, setSearchTerm] = useState('');

  const results = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const matches = dreamDictionary.filter(d =>
      d.keywords.some(k => k.includes(searchTerm.trim()) || searchTerm.trim().includes(k))
    );
    const animalMatches = animals.filter(a => a.animal_name_lao.includes(searchTerm.trim()));
    const combined = [];
    matches.forEach(m => {
      if (m.animalId) {
        const a = animals.find(an => an.animal_id === m.animalId);
        if (a) combined.push({ type: 'animal', data: a, keywords: m.keywords.join(', '), meaning: m.meaning, category: m.category });
      } else if (m.numbers) {
        combined.push({ type: 'number', numbers: m.numbers, keywords: m.keywords.join(', '), meaning: m.meaning, category: m.category });
      }
    });
    animalMatches.forEach(a => {
      if (!combined.find(c => c.data?.animal_id === a.animal_id)) {
        combined.push({ type: 'animal', data: a, keywords: a.animal_name_lao, meaning: 'ຈະມີສິ່ງທີ່ກ່ຽວຂ້ອງກັບນາມສັດນີ້ເຂົ້າມາໃນຊີວິດ ອາດນຳໂຊກມາໃຫ້', category: 'ສັດທົ່ວໄປ' });
      }
    });
    return combined;
  }, [searchTerm]);

  const catStyle = (cat) => CATEGORY_COLOR[cat] || defaultCat;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">

      {/* ─── Left Panel: Search ─── */}
      <div className="lg:col-span-2 flex flex-col gap-5">

        {/* Header card */}
        <div className="bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe] dark:from-[#1e1333] dark:to-[#17102a] rounded-2xl p-6 border border-[#ddd6fe]/50 dark:border-[#4c1d95]/30">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center shadow-sm mb-4">
            <span className="material-symbols-outlined text-white text-[20px]">menu_book</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#2e1065] dark:text-white mb-1.5">ຕຳລາແປຄວາມຝັນ</h2>
          <p className="text-xs text-[#6d28d9] dark:text-[#c4b5fd] leading-relaxed">
            ພິມສິ່ງທີ່ທ່ານຝັນເຫັນ ເພື່ອຄົ້ນຫາຕົວເລກ ຫຼື ນາມສັດທີ່ກ່ຽວຂ້ອງ
          </p>
        </div>

        {/* Search input */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#a78bfa] text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="ຄົ້ນຫາ ເຊັ່ນ: ງູ, ນ້ຳ, ໄຟ..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-[#152033] pl-12 pr-10 py-3.5 rounded-xl border border-[#ddd6fe]/60 dark:border-[#4c1d95]/40 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 outline-none text-sm font-medium text-[#121c2a] dark:text-white placeholder:text-[#a78bfa] shadow-sm transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a78bfa] hover:text-[#7c3aed] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Quick hints */}
        {!searchTerm && (
          <div>
            <p className="text-[10px] font-bold text-[#737686] dark:text-[#94a3b8] uppercase tracking-wider mb-2">ຄຳຄົ້ນຫາທີ່ນິຍົມ</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_HINTS.map(hint => (
                <button
                  key={hint}
                  onClick={() => setSearchTerm(hint)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f5f3ff] dark:bg-[#1e1333] text-[#7c3aed] dark:text-[#c4b5fd] border border-[#ddd6fe]/60 dark:border-[#4c1d95]/30 hover:bg-[#ede9fe] hover:shadow-sm transition-all duration-150"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results count */}
        {searchTerm && (
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${results.length > 0 ? 'bg-[#edfdf5] text-[#006c49]' : 'bg-[#fff4f4] text-[#ba1a1a]'}`}>
              {results.length > 0 ? `ພົບ ${results.length} ຜົນລັບ` : 'ບໍ່ພົບຂໍ້ມູນ'}
            </span>
          </div>
        )}
      </div>

      {/* ─── Right Panel: Results ─── */}
      <div className="lg:col-span-3 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[65vh] lg:max-h-none">

          {/* Empty / Idle */}
          {!searchTerm && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe] dark:from-[#1e1333] dark:to-[#17102a] flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[28px] text-[#7c3aed]">auto_awesome</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-[#555870] dark:text-[#94a3b8] mb-1">ເລີ່ມຄົ້ນຫາ</p>
                <p className="text-xs text-[#a0a3bd] dark:text-[#555870]">ພິມຄຳທີ່ທ່ານຝັນເຫັນ ຫຼື ຄລິກຄຳຮ້ອນ</p>
              </div>
            </div>
          )}

          {/* No results */}
          {searchTerm && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#fff4f4] dark:bg-[#2a1010] flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px] text-[#ba1a1a]">search_off</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-[#555870] dark:text-[#94a3b8] mb-1">ບໍ່ພົບຂໍ້ມູນ</p>
                <p className="text-xs text-[#a0a3bd] dark:text-[#555870]">ລອງໃຊ້ຄຳອື່ນ ເຊັ່ນ: ງູ, ໄຟ, ນ້ຳ</p>
              </div>
            </div>
          )}

          {/* Results */}
          {results.map((res, idx) => {
            const numbers = res.type === 'animal'
              ? res.data.animal_numbers.split(',')
              : res.numbers.split(',');
            const cs = catStyle(res.category);
            return (
              <div
                key={idx}
                className="group bg-white dark:bg-[#152033] rounded-2xl p-5 border border-[#e8edf8] dark:border-[#2b3a54] shadow-sm hover:shadow-md hover:border-[#7c3aed]/30 dark:hover:border-[#7c3aed]/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe] dark:from-[#1e1333] dark:to-[#17102a] flex items-center justify-center shrink-0 border border-[#ddd6fe]/40">
                    <span className="material-symbols-outlined text-[#7c3aed] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {res.type === 'animal' ? res.data.icon : 'format_list_numbered'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-extrabold text-[#121c2a] dark:text-white text-[15px] leading-tight">
                        {res.type === 'animal' ? res.data.animal_name_lao : 'ເລກເດັດ'}
                      </h3>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cs.bg} ${cs.text} ${cs.border}`}>
                        {res.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#a0a3bd] dark:text-[#555870] mb-2">
                      ຈາກ: <span className="text-[#7c3aed] dark:text-[#c4b5fd] font-semibold">{res.keywords}</span>
                    </p>

                    {/* Numbers */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {numbers.map(n => (
                        <span
                          key={n}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#006c49] to-[#00a36c] text-white text-sm font-black shadow-sm"
                        >
                          {n.trim()}
                        </span>
                      ))}
                    </div>

                    {/* Meaning */}
                    {res.meaning && (
                      <div className="flex items-start gap-2 bg-[#f5f3ff] dark:bg-[#1e1333]/60 rounded-xl p-3 border border-[#ddd6fe]/40 dark:border-[#4c1d95]/20">
                        <span className="material-symbols-outlined text-[#a78bfa] text-[15px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                        <p className="text-xs text-[#555870] dark:text-[#c4b5fd] leading-relaxed">{res.meaning}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}