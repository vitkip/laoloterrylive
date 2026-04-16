import { useState, useMemo } from 'react';
import { animals } from '../data/animals';
import { dreamDictionary } from '../data/dreams';

export default function DreamDictionary() {
  const [searchTerm, setSearchTerm] = useState('');

  const results = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    // We search the external dictionary
    const matches = dreamDictionary.filter(d => 
      d.keywords.some(k => k.includes(searchTerm.trim()) || searchTerm.trim().includes(k))
    );

    // Also search exact animal names
    const animalMatches = animals.filter(a => a.animal_name_lao.includes(searchTerm.trim()));

    // Combine them
    const combined = [];
    matches.forEach(m => {
      if (m.animalId) {
        const a = animals.find(an => an.animal_id === m.animalId);
        if (a) {
          combined.push({ type: 'animal', data: a, keywords: m.keywords.join(', '), meaning: m.meaning, category: m.category });
        }
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

  return (
    <div className="bg-white dark:bg-[#152033] rounded-2xl p-6 sm:p-8 shadow-sm border border-[#dee9fd] dark:border-[#2b3a54] h-full flex flex-col min-h-0">
      <div className="mb-6 shrink-0">
        <h2 className="text-2xl font-black text-[#121c2a] dark:text-white mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#003fb1]">menu_book</span>
          ຕຳລາແປຄວາມຝັນ
        </h2>
        <p className="text-sm text-[#737686] dark:text-[#94a3b8]">
          ພິມສິ່ງທີ່ທ່ານຝັນເຫັນ ເພື່ອຄົ້ນຫາຕົວເລກ ຫຼື ນາມສັດທີ່ກ່ຽວຂ້ອງ (ເຊັ່ນ: "ງູ", "ຊ້າງ", "ນ້ຳ").
        </p>
      </div>

      <div className="relative mb-6 shrink-0">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] dark:text-[#94a3b8]">
          search
        </span>
        <input 
          type="text"
          placeholder="ຄົ້ນຫາຄວາມຝັນ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#eff3ff] dark:bg-[#1e2d4a] pl-12 pr-4 py-3.5 rounded-xl border border-transparent focus:border-[#003fb1]/30 focus:bg-white dark:bg-[#152033] outline-none font-medium transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-2">
        {searchTerm.trim() ? (
          results.length > 0 ? (
            <div className="space-y-4">
              {results.map((res, idx) => (
                <div key={idx} className="bg-white dark:bg-[#152033] p-4 sm:p-5 rounded-xl border border-[#dee9fd] dark:border-[#2b3a54] shadow-sm flex flex-col gap-3 hover:border-[#003fb1]/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-[#eff3ff] dark:bg-[#1e2d4a] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#003fb1] text-2xl">
                          {res.type === 'animal' ? res.data.icon : 'format_list_numbered'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-[#121c2a] dark:text-white truncate text-lg">
                            {res.type === 'animal' ? res.data.animal_name_lao : 'ເລກເດັດ'}
                          </h3>
                          <span className="text-[10px] bg-[#f9f9ff] dark:bg-[#0d1627] text-[#737686] dark:text-[#94a3b8] px-2 py-0.5 rounded border border-[#dee9fd] dark:border-[#2b3a54] uppercase tracking-wider">
                            {res.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#737686] dark:text-[#94a3b8] truncate mb-2">ຈາກຄຳວ່າ: {res.keywords}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-black text-[#006c49] tracking-wider">
                        {res.type === 'animal' ? res.data.animal_numbers.split(',').join(' • ') : res.numbers.split(',').join(' • ')}
                      </div>
                      <div className="text-xs font-bold text-[#003fb1] mt-1 relative inline-block">
                        {res.type === 'animal' && `ເລກ ${res.data.animal_id} `}
                      </div>
                    </div>
                  </div>
                  {res.meaning && (
                    <div className="mt-2 bg-[#eff3ff] dark:bg-[#1e2d4a]/50 rounded-lg p-3 border border-[#dee9fd] dark:border-[#2b3a54]/50">
                      <p className="text-sm font-medium text-[#434654] dark:text-[#c7d2fe] leading-relaxed flex gap-2">
                        <span className="material-symbols-outlined text-[#003fb1] text-[18px]">lightbulb</span>
                        {res.meaning}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-10 text-[#737686] dark:text-[#94a3b8] flex flex-col items-center gap-2">
                 <span className="material-symbols-outlined text-4xl opacity-50">search_off</span>
                 <p>ບໍ່ພົບຂໍ້ມູນທີ່ກົງກັບຄວາມຝັນນີ້</p>
             </div>
          )
        ) : (
          <div className="text-center py-10 text-[#737686] dark:text-[#94a3b8] flex flex-col items-center gap-2 opacity-60">
             <span className="material-symbols-outlined text-4xl">auto_awesome</span>
             <p>ເລີ່ມພິມເພື່ອຄົ້ນຫາ</p>
          </div>
        )}
      </div>
    </div>
  )
}
