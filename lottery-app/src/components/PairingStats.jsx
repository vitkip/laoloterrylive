import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';

export default function PairingStats({ timeframe }) {
  const { draws, animals } = useData();
  const [selectedAnimalId, setSelectedAnimalId] = useState(null);

  const stats = useMemo(() => {
    // 1. Filter by timeframe
    const now = new Date();
    let filteredDraws = draws.filter(d => d.status === 'published');
    if (timeframe === '1_month') {
      const past = new Date(); past.setMonth(now.getMonth() - 1);
      filteredDraws = filteredDraws.filter(d => new Date(d.draw_date) >= past);
    } else if (timeframe === '3_months') {
      const past = new Date(); past.setMonth(now.getMonth() - 3);
      filteredDraws = filteredDraws.filter(d => new Date(d.draw_date) >= past);
    } else if (timeframe === '1_year') {
      const past = new Date(); past.setFullYear(now.getFullYear() - 1);
      filteredDraws = filteredDraws.filter(d => new Date(d.draw_date) >= past);
    }

    // Sort ascending by date to analyze sequences correctly (oldest first)
    const sortedDraws = [...filteredDraws].sort((a, b) => new Date(a.draw_date) - new Date(b.draw_date));

    // Build the transition map: map[animal_x] = { total: int, follows: { animal_y: count } }
    const transitions = {};

    for (let i = 0; i < sortedDraws.length - 1; i++) {
        const currentDraw = sortedDraws[i];
        const nextDraw = sortedDraws[i + 1];

        const current2D = currentDraw.results_detail?.find(r => r.prize_type === '2_digits');
        const next2D = nextDraw.results_detail?.find(r => r.prize_type === '2_digits');

        if (current2D?.animal_id && next2D?.animal_id) {
            const currentId = current2D.animal_id;
            const nextId = next2D.animal_id;

            if (!transitions[currentId]) {
                transitions[currentId] = { total: 0, follows: {} };
            }

            transitions[currentId].total += 1;
            transitions[currentId].follows[nextId] = (transitions[currentId].follows[nextId] || 0) + 1;
        }
    }

    return transitions;
  }, [draws, timeframe]);

  // Determine which animal to show if none selected
  const activeAnimalId = selectedAnimalId || (Object.keys(stats).length > 0 ? Object.keys(stats)[0] : null);
  const activeAnimal = animals.find(a => a.animal_id == activeAnimalId);

  // Get prediction for active animal
  const predictionList = useMemo(() => {
     if (!activeAnimalId || !stats[activeAnimalId]) return [];
     const follows = stats[activeAnimalId].follows;
     return Object.entries(follows)
        .sort((a, b) => b[1] - a[1]) // Sort by count desc
        .slice(0, 4) // Top 4
        .map(([id, count]) => {
            return {
                animal: animals.find(a => a.animal_id == id),
                count,
                percentage: Math.round((count / stats[activeAnimalId].total) * 100)
            }
        });
  }, [activeAnimalId, stats, animals]);

  return (
    <div className="bg-gradient-to-br from-[#121c2a] to-[#1e2f47] rounded-3xl p-6 sm:p-8 shadow-lg border border-[#3b5175] text-white overflow-hidden relative">
      {/* Background Icon */}
      <span className="material-symbols-outlined absolute -right-10 -bottom-10 text-[200px] text-white/[0.02] pointer-events-none">
        hub
      </span>

      <div className="relative z-10">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#6cf8bb]">magic_button</span>
            ຈັບຄູ່ເລກ ແລະ ລຳດັບນາມສັດ (Sequence)
          </h2>
          <p className="text-[#a5b2c5] text-sm mt-1">
            ຖ້າງວດນີ້ອອກນາມສັດ X, ງວດຕໍ່ໄປມັກຈະອອກນາມສັດໂຕໃດຫຼາຍທີ່ສຸດ?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Select Origin Animal */}
          <div className="md:col-span-5">
            <label className="block text-sm font-bold text-[#b5c4ff] mb-3 uppercase tracking-widest">
              ຖ້າງວດທີ່ຜ່ານມາອອກນາມສັດ:
            </label>
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20 h-[300px] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-2">
                {animals.map((animal) => {
                    const hasData = stats[animal.animal_id]?.total > 0;
                    return (
                        <button
                            key={animal.animal_id}
                            onClick={() => setSelectedAnimalId(animal.animal_id)}
                            disabled={!hasData}
                            className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                                activeAnimalId == animal.animal_id
                                    ? 'bg-[#003fb1] border-[#b5c4ff] shadow-lg shadow-[#003fb1]/50'
                                    : hasData 
                                        ? 'bg-white/5 border-transparent hover:bg-white/10 text-[#d4dcff]'
                                        : 'bg-transparent border-transparent opacity-30 cursor-not-allowed'
                            }`}
                        >
                            <span className="text-3xl mb-1">{animal.icon}</span>
                            <span className="text-xs font-bold text-center leading-tight">{animal.animal_name_lao}</span>
                        </button>
                    )
                })}
              </div>
            </div>
          </div>

          {/* Result / Predictor */}
          <div className="md:col-span-7 flex flex-col justify-center">
            {activeAnimal ? (
              <div className="text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-[#003fb1] rounded-2xl flex items-center justify-center text-4xl shadow-inner shrink-0">
                    {activeAnimal.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">ງວດຖັດໄປ ມັກຈະອອກ:</h3>
                    <p className="text-[#a5b2c5] text-sm">
                      ຈາກສະຖິຕິ {stats[activeAnimalId]?.total || 0} ຄັ້ງ ຫຼັງຈາກທີ່ອອກ {activeAnimal.animal_name_lao}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {predictionList.length > 0 ? predictionList.map((item, index) => (
                    <div key={item.animal?.animal_id} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center gap-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b from-[#6cf8bb] to-transparent opacity-50"></div>
                      <span className="text-4xl">{item.animal?.icon}</span>
                      <div className="flex-1">
                         <div className="font-bold text-lg mb-1 text-white">{item.animal?.animal_name_lao}</div>
                         <div className="flex items-center gap-2">
                             <div className="h-2 flex-1 bg-black/30 rounded-full overflow-hidden">
                                <div className="h-full bg-[#6cf8bb] rounded-full" style={{ width: `${item.percentage}%` }}></div>
                             </div>
                             <span className="text-xs font-bold text-[#6cf8bb]">{item.percentage}%</span>
                         </div>
                         <div className="text-[10px] text-[#a5b2c5] mt-1">{item.count} ຄັ້ງ</div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-8 text-center text-[#a5b2c5]">
                        ບໍ່ມີສະຖິຕິການອອກຊ້ຳກັນພຽງພໍຍ້ອນຫຼັງ
                    </div>
                  )}
                </div>
              </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#a5b2c5] opacity-50">
                    <span className="material-symbols-outlined text-[64px] mb-4">query_stats</span>
                    <p>ເລືອກນາມສັດເພື່ອເບິ່ງສະຖິຕິ</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
