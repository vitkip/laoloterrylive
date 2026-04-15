import { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatLaoDate } from '../utils/date';

export default function ArchiveTable() {
  const { draws, animals } = useData();
  const [showAll, setShowAll] = useState(false);

  if (!draws || draws.length === 0) return null;

  return (
    <section className="mt-16 sm:mt-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h3 className="text-xl sm:text-2xl font-bold text-[#121c2a]">
          ປະຫວັດການອອກລາງວັນລ່າສຸດ
        </h3>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-xs font-bold border border-[#c3c5d7] rounded-lg hover:bg-[#eff3ff] transition-colors">
            Export CSV
          </button>
          <button className="px-4 py-2 text-xs font-bold border border-[#c3c5d7] rounded-lg hover:bg-[#eff3ff] transition-colors">
            Filter
          </button>
        </div>
      </div>

      {/* Table — scrollable on mobile */}
      <div className="overflow-x-auto rounded-xl border border-[#dee9fd] shadow-sm">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-[#d0daef] text-[#434654] text-[10px] uppercase tracking-widest font-bold">
              <th className="px-4 sm:px-6 py-4">ງວດວັນທີ</th>
              <th className="px-4 sm:px-6 py-4">ເລກທີ່ອອກ</th>
              <th className="px-4 sm:px-6 py-4">ນາມສັດ (2ຕົວ)</th>
              <th className="px-4 sm:px-6 py-4 text-center">ວິດີໂອຍ້ອນຫຼັງ</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {draws.slice(0, showAll ? draws.length : 10).map((row, idx) => {
              const twoDigitResult = row.results_detail?.find(r => r.prize_type === '2_digits');
              const animal = animals.find(a => a.animal_id === twoDigitResult?.animal_id);
              
              const numbersArr = [];
              if (row.full_result.length >= 6) {
                numbersArr.push(row.full_result.substring(0, 2), row.full_result.substring(2, 4), row.full_result.substring(4, 6));
              }

              // Use a fallback for old records
              const videoLink = row.youtube_url || 'https://www.youtube.com/results?search_query=lao+lottery+live';

              return (
                <tr
                  key={row.draw_id}
                  className={`border-b border-[#eff3ff] hover:bg-[#eff3ff]/50 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-[#f4f7fe]'
                  }`}
                >
                  <td className="px-4 sm:px-6 py-5 font-medium text-[#121c2a]">{formatLaoDate(row.draw_date, true)}</td>
                  <td className="px-4 sm:px-6 py-5 text-lg font-black text-[#003fb1]">
                    {numbersArr.length > 0 ? numbersArr.join(' ') : row.full_result}
                  </td>
                  <td className="px-4 sm:px-6 py-5 text-[#434654] font-semibold">
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
      {draws.length > 10 && (
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
    </section>
  )
}
