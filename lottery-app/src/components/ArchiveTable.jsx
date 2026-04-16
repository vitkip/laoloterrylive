import { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatLaoDate } from '../utils/date';

export default function ArchiveTable({ compact = false }) {
  const { draws, animals } = useData();
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!draws || draws.length === 0) return (
    <div className="text-center py-8 text-[#737686] dark:text-[#94a3b8] text-sm">
      ກຳລັງໂຫຼດຂໍ້ມູນ...
    </div>
  );

  const filteredDraws = draws.filter(d => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase().trim();
    // Allow searching by result sequence, lao date formatting, or draw number
    return (
      d.full_result.includes(term) ||
      formatLaoDate(d.draw_date, true).toLowerCase().includes(term) ||
      d.draw_number.toString().includes(term)
    );
  });

  return (
    <section className={compact ? '' : 'mt-16 sm:mt-20'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h3 className="text-xl sm:text-2xl font-bold text-[#121c2a] dark:text-white">
          ປະຫວັດການອອກລາງວັນລ່າສຸດ
        </h3>
        <div className="flex items-center gap-2 bg-white dark:bg-[#152033] px-3 py-2 rounded-xl shadow-sm border border-[#dee9fd] dark:border-[#2b3a54] w-full sm:w-auto focus-within:ring-2 focus-within:ring-[#003fb1]">
          <span className="material-symbols-outlined text-[#737686] dark:text-[#94a3b8] text-[20px]">search</span>
          <input
            type="text"
            placeholder="ຄົ້ນຫາວັນທີ, ງວດ, ເລກ..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="border-none outline-none bg-transparent text-sm w-full sm:w-64 placeholder:text-[#a0a3bd] text-[#121c2a] dark:text-white"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-[#a0a3bd] hover:text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Table — scrollable on mobile */}
      <div className="overflow-x-auto rounded-xl border border-[#dee9fd] dark:border-[#2b3a54] shadow-sm">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-[#d0daef] text-[#434654] dark:text-[#c7d2fe] text-[10px] uppercase tracking-widest font-bold">
              <th className="px-4 sm:px-6 py-4">ງວດວັນທີ</th>
              <th className="px-4 sm:px-6 py-4">ເລກທີ່ອອກ</th>
              <th className="px-4 sm:px-6 py-4">ນາມສັດ (2ຕົວ)</th>
              <th className="px-4 sm:px-6 py-4 text-center">ວິດີໂອຍ້ອນຫຼັງ</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredDraws.slice(0, showAll || searchTerm ? filteredDraws.length : 10).map((row, idx) => {
              const twoDigitResult = row.results_detail?.find(r => r.prize_type === '2_digits');
              const animal = animals.find(a => String(a.animal_id) === String(twoDigitResult?.animal_id));
              
              const numbersArr = [];
              if (row.full_result.length >= 6) {
                numbersArr.push(row.full_result.substring(0, 2), row.full_result.substring(2, 4), row.full_result.substring(4, 6));
              }

              // Use a fallback for old records
              const videoLink = row.youtube_url || 'https://www.youtube.com/results?search_query=lao+lottery+live';

              return (
                <tr
                  key={row.draw_id}
                  className={`border-b border-[#eff3ff] dark:border-[#1e2d4a] hover:bg-[#eff3ff] dark:bg-[#1e2d4a]/50 transition-colors ${
                    idx % 2 === 0 ? 'bg-white dark:bg-[#152033]' : 'bg-[#f4f7fe]'
                  }`}
                >
                  <td className="px-4 sm:px-6 py-5 font-medium text-[#121c2a] dark:text-white">{formatLaoDate(row.draw_date, true)}</td>
                  <td className="px-4 sm:px-6 py-5 text-lg font-black text-[#003fb1]">
                    {numbersArr.length > 0 ? numbersArr.join(' ') : row.full_result}
                  </td>
                  <td className="px-4 sm:px-6 py-5 text-[#434654] dark:text-[#c7d2fe] font-semibold">
                    {animal ? `${animal.animal_name_lao} (${twoDigitResult.result_value})` : '-'}
                  </td>
                  <td className="px-4 sm:px-6 py-5 text-center">
                    <a 
                      href={videoLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ffebee] text-[#ba1a1a] hover:bg-[#ffdad6] hover:shadow-sm font-bold text-xs transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">play_circle</span>
                      ເບິ່ງຄລິບ
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Load More */}
      {!searchTerm && filteredDraws.length > 10 && (
        <div className="mt-6 flex justify-center">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="text-[#003fb1] font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all"
          >
            {showAll ? 'ຫຍໍ້ປະຫວັດ' : 'ເບິ່ງປະຫວັດທັງໝົດ'}
            <span className="material-symbols-outlined">
              {showAll ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      )}
      {searchTerm && filteredDraws.length === 0 && (
        <div className="text-center py-12 text-[#737686] dark:text-[#94a3b8]">
          ບໍ່ພົບຂໍ້ມູນທີ່ກົງກັບການຄົ້ນຫາ "{searchTerm}"
        </div>
      )}
    </section>
  )
}
