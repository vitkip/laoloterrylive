import React from 'react';
import { useStatistics } from '../hooks/useStatistics';

export default function ConsecutivePairs({ timeframe }) {
  const { stats, loading } = useStatistics(timeframe);

  if (loading || !stats) return null;
  const { hotPairs = [] } = stats;

  return (
    <div className="bg-white dark:bg-[#152033] rounded-3xl p-6 sm:p-8 shadow-sm border border-[#dee9fd] dark:border-[#2b3a54]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#121c2a] dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[#003fb1]">sync_alt</span>
          ສະຖິຕິຈັບຄູ່ຕົວເລກ (Consecutive Pairs)
        </h2>
        <p className="text-[#737686] dark:text-[#94a3b8] text-sm mt-1">
          ຕົວເລກ 2 ຕົວທ້າຍ ທີ່ມັກອອກຕາມຫຼັງກັນຫຼາຍທີ່ສຸດ
        </p>
      </div>

      <div className="space-y-4">
        {hotPairs.length > 0 ? hotPairs.map((pair, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-[#f9f9ff] dark:bg-[#0d1627] rounded-xl border border-[#dee9fd] dark:border-[#2b3a54] group hover:border-[#003fb1]/30 transition-colors">
            
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-[#737686] mb-1">ອອກແລ້ວ</span>
                <span className="w-12 h-12 rounded-lg bg-white dark:bg-[#152033] shadow-sm flex items-center justify-center text-xl font-black text-[#121c2a] dark:text-white border border-[#dee9fd] dark:border-[#2b3a54]">
                  {pair.currentNum}
                </span>
              </div>
              
              <div className="flex flex-col items-center text-[#b5c4ff] group-hover:text-[#003fb1] transition-colors">
                <span className="material-symbols-outlined text-3xl">arrow_right_alt</span>
                <span className="text-[10px] font-bold">ມັກຕາມດ້ວຍ</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-[#003fb1] dark:text-[#6cf8bb] mb-1">ອອກຕາມ</span>
                <span className="w-12 h-12 rounded-lg bg-[#003fb1] text-white shadow-sm shadow-[#003fb1]/30 flex items-center justify-center text-xl font-black">
                  {pair.nextNum}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="block text-2xl font-black text-[#121c2a] dark:text-white leading-none">
                {pair.count}
              </span>
              <span className="text-xs font-semibold text-[#737686] dark:text-[#94a3b8]">
                ຄັ້ງ
              </span>
            </div>

          </div>
        )) : (
          <div className="py-8 text-center text-[#737686] dark:text-[#94a3b8]">
            ຍັງບໍ່ມີຂໍ້ມູນສະຖິຕິການຈັບຄູ່ທີ່ພຽງພໍ
          </div>
        )}
      </div>
    </div>
  );
}
