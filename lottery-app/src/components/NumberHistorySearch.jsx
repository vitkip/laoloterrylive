import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';

export default function NumberHistorySearch() {
  const { draws } = useData();
  const [searchNumber, setSearchNumber] = useState('');

  const results = useMemo(() => {
    if (!searchNumber.trim() || !draws) return [];
    
    // We search draws for specific two digits or digits
    const searchStr = searchNumber.trim();
    
    const matchedDraws = draws.filter(d => {
      if (d.status !== 'published') return false;
      // if 2 digits, check 2_digits prize
      if (searchStr.length === 2) {
        const twoDigit = d.results_detail?.find(r => r.prize_type === '2_digits');
        return twoDigit && twoDigit.result_value === searchStr;
      }
      // otherwise check full result includes
      return d.full_result && d.full_result.includes(searchStr);
    });

    return matchedDraws.sort((a,b) => new Date(b.draw_date) - new Date(a.draw_date));
  }, [searchNumber, draws]);

  return (
    <div className="bg-white dark:bg-[#152033] rounded-2xl p-6 sm:p-8 shadow-sm border border-[#dee9fd] dark:border-[#2b3a54] h-full flex flex-col min-h-0">
      <div className="mb-6 shrink-0">
        <h2 className="text-2xl font-black text-[#121c2a] dark:text-white mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006c49]">history</span>
          ຄົ້ນຫາຍ້ອນຫຼັງສະເພາະເລກ
        </h2>
        <p className="text-sm text-[#434654] dark:text-[#c7d2fe]">
          ພິມຕົວເລກ 2-6 ຕົວ ເພື່ອເບິ່ງປະຫວັດວ່າມັນເຄີຍອອກມາວັນທີໃດແດ່.
        </p>
      </div>

      <div className="relative mb-6 shrink-0">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] dark:text-[#94a3b8]">
          123
        </span>
        <input 
          type="text"
          maxLength={6}
          placeholder="ພິມຕົວເລກ ເຊັ່ນ: 99 ຫຼື 1563..."
          value={searchNumber}
          onChange={(e) => setSearchNumber(e.target.value.replace(/\D/g, ''))} // only numbers
          className="w-full bg-[#eff3ff] dark:bg-[#1e2d4a] pl-12 pr-4 py-3.5 rounded-xl border border-transparent focus:border-[#006c49]/30 focus:bg-white dark:bg-[#152033] outline-none font-bold text-lg tracking-widest transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-2">
        {searchNumber.trim() ? (
          results.length > 0 ? (
             <div className="mb-4">
                 <p className="text-sm font-semibold text-[#006c49] mb-4">
                     ຄົ້ນພົບ {results.length} ງວດທີ່ກົງກັບ "{searchNumber}"
                 </p>
                 <div className="space-y-3">
                   {results.map(d => (
                     <div key={d.draw_id} className="border border-[#dee9fd] dark:border-[#2b3a54] rounded-xl p-4 flex justify-between items-center hover:bg-[#eff3ff] dark:bg-[#1e2d4a]/50 transition-colors">
                       <div>
                         <p className="text-xs text-[#737686] dark:text-[#94a3b8] mb-1">ງວດທີ {d.draw_number}</p>
                         <p className="font-bold text-[#121c2a] dark:text-white">{new Date(d.draw_date).toLocaleDateString('lo-LA')}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-xl font-black tracking-[0.2em]">{d.full_result}</p>
                         <p className="text-xs text-[#003fb1] font-bold mt-1">ລາງວັນທີ 1</p>
                       </div>
                     </div>
                   ))}
                 </div>
             </div>
          ) : (
             <div className="text-center py-10 text-[#737686] dark:text-[#94a3b8] flex flex-col items-center gap-2">
                 <span className="material-symbols-outlined text-4xl opacity-50">block</span>
                 <p>ບໍ່ເຄີຍອອກເລກນີ້ມາກ່ອນ (ໃນຖານຂໍ້ມູນປັດຈຸບັນ)</p>
             </div>
          )
        ) : (
          <div className="text-center py-10 text-[#737686] dark:text-[#94a3b8] flex flex-col items-center gap-2 opacity-60">
             <span className="material-symbols-outlined text-4xl">keyboard</span>
             <p>ພິມຕົວເລກເພື່ອຄົ້ນຫາ</p>
          </div>
        )}
      </div>
    </div>
  )
}
