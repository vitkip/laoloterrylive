import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';

export default function CustomFrequency({ timeframe }) {
  const { draws } = useData();
  const [yearsFilter, setYearsFilter] = useState(5); // Default: 5 years

  const topNumbers = useMemo(() => {
    if (!draws || draws.length === 0) return [];

    let filteredDraws = draws;
    if (yearsFilter !== 'all') {
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - yearsFilter);
      filteredDraws = draws.filter(d => new Date(d.draw_date) >= cutoffDate);
    }

    const twoDigitFreq = {};
    filteredDraws.forEach(d => {
      const twoDigit = d.results_detail?.find(r => r.prize_type === '2_digits');
      if (twoDigit) {
        const v = twoDigit.result_value;
        if (!twoDigitFreq[v]) twoDigitFreq[v] = 0;
        twoDigitFreq[v] += 1;
      }
    });

    const frequencyArray = Object.entries(twoDigitFreq).map(([number, count]) => ({
      number,
      count
    }));

    // Sort by count descending, then take top 40
    return frequencyArray.sort((a, b) => b.count - a.count).slice(0, 40);
  }, [draws, yearsFilter]);

  return (
    <section className="bg-white dark:bg-[#152033] rounded-3xl p-8 sm:p-10 border border-[#dee9fd] dark:border-[#2b3a54] shadow-sm mb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="text-[#003fb1] font-bold tracking-[0.2em] text-xs uppercase mb-2 block">
            Custom Analysis
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#121c2a] dark:text-white tracking-tight">
            ສະຖິຕິອອກຫຼາຍສຸດ (Top 40)
          </h2>
        </div>
        
        {/* Filter Selection */}
        <div className="flex bg-[#eff3ff] dark:bg-[#1e2d4a] p-1.5 rounded-xl self-start">
          {[1, 3, 5, 'all'].map((y) => (
            <button
              key={y}
              onClick={() => setYearsFilter(y)}
              className={`px-4 sm:px-6 py-2.5 text-sm font-bold rounded-lg transition-colors ${
                yearsFilter === y
                  ? 'bg-white dark:bg-[#152033] text-[#003fb1] shadow-sm'
                  : 'text-[#737686] dark:text-[#94a3b8] hover:text-[#121c2a] dark:text-white hover:bg-[#dee9fd] dark:bg-[#2b3a54]'
              }`}
            >
              {y === 'all' ? 'ທັງໝົດ' : `ຍ້ອນຫຼັງ ${y} ປີ`}
            </button>
          ))}
        </div>
      </div>

      {topNumbers.length > 0 ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-4">
          {topNumbers.map((item, index) => (
            <div 
              key={item.number} 
              className="bg-[#f9f9ff] dark:bg-[#0d1627] border border-[#dee9fd] dark:border-[#2b3a54] rounded-xl p-4 flex flex-col items-center justify-center hover:shadow-md transition-shadow relative"
            >
              <div className="absolute top-2 left-2 text-[10px] font-black text-[#bac9e7]">#{index + 1}</div>
              <span className="text-2xl font-black text-[#121c2a] dark:text-white mb-1">{item.number}</span>
              <span className="text-xs font-semibold text-[#006c49] bg-[#6cf8bb]/20 px-2 py-0.5 rounded-md">
                {item.count} ຄັ້ງ
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-[#737686] dark:text-[#94a3b8]">
          ບໍ່ມີຂໍ້ມູນສຳລັບຊ່ວງເວລານີ້
        </div>
      )}
    </section>
  );
}
