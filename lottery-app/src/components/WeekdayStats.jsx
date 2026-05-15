import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';

export default function WeekdayStats({ timeframe }) {
  const { draws, animals } = useData();
  const [selectedDay, setSelectedDay] = useState(1); // 1=Mon, 3=Wed, 5=Fri

  const dayLabels = {
    1: 'ວັນຈັນ',
    3: 'ວັນພຸດ',
    5: 'ວັນສຸກ'
  };

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

    // 2. Filter by selected day of week
    const drawsOnDay = filteredDraws.filter(d => {
      const date = new Date(d.draw_date);
      return date.getDay() === selectedDay;
    });

    // 3. Count 2-digits and animals
    const twoDigitCount = {};
    const animalCount = {};

    drawsOnDay.forEach(draw => {
      const twoDigit = draw.results_detail?.find(r => r.prize_type === '2_digits');
      if (twoDigit) {
        const val = twoDigit.result_value;
        const animalId = twoDigit.animal_id;
        
        twoDigitCount[val] = (twoDigitCount[val] || 0) + 1;
        if (animalId) {
          animalCount[animalId] = (animalCount[animalId] || 0) + 1;
        }
      }
    });

    const topTwoDigits = Object.entries(twoDigitCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topAnimals = Object.entries(animalCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => {
        const animal = animals.find(a => a.animal_id == id);
        return { animal, count };
      });

    return { totalDraws: drawsOnDay.length, topTwoDigits, topAnimals };
  }, [draws, animals, timeframe, selectedDay]);

  return (
    <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-sm border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003fb1]">calendar_month</span>
            ສະຖິຕິຕາມມື້ອອກຫວຍ
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            ເລກຫຍັງມັກອອກໃນມື້ນີ້? ຈາກທັງໝົດ {stats.totalDraws} ງວດ
          </p>
        </div>
        
        <div className="flex bg-secondary p-1 rounded-xl w-full sm:w-auto">
          {[1, 3, 5].map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-colors ${
                selectedDay === day 
                  ? 'bg-card text-[#003fb1] shadow-sm' 
                  : 'text-muted-foreground hover:text-[#003fb1]'
              }`}
            >
              {dayLabels[day]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Two Digits */}
        <div className="bg-background rounded-2xl p-6">
          <h3 className="text-muted-foreground font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003fb1] text-[20px]">123</span>
            ເລກ 2 ຕົວ ທີ່ມັກອອກວັນ{dayLabels[selectedDay].replace('ວັນ', '')}
          </h3>
          <div className="space-y-3">
            {stats.topTwoDigits.length > 0 ? stats.topTwoDigits.map(([num, count], index) => (
              <div key={num} className="flex items-center justify-between bg-card px-4 py-3 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-[#b5c4ff] font-black text-lg w-6">{index + 1}</span>
                  <span className="text-2xl font-black text-[#003fb1]">{num}</span>
                </div>
                <span className="text-sm font-bold text-muted-foreground bg-secondary px-3 py-1 rounded-lg">
                  {count} ຄັ້ງ
                </span>
              </div>
            )) : <p className="text-muted-foreground text-center py-4">ບໍ່ມີຂໍ້ມູນພຽງພໍ</p>}
          </div>
        </div>

        {/* Top Animals */}
        <div className="bg-[#003fb1] rounded-2xl p-6 text-white text-center sm:text-left">
          <h3 className="text-[#b5c4ff] font-bold mb-4 flex items-center gap-2 justify-center sm:justify-start">
            <span className="material-symbols-outlined text-[#b5c4ff] text-[20px]">sound_detection_dog_barking</span>
            ນາມສັດ ທີ່ມັກອອກວັນ{dayLabels[selectedDay].replace('ວັນ', '')}
          </h3>
          <div className="space-y-3">
            {stats.topAnimals.length > 0 ? stats.topAnimals.map((item, index) => (
              <div key={item.animal?.animal_id} className="flex items-center justify-between bg-white/10 px-4 py-3 rounded-xl backdrop-blur-md border border-[#b5c4ff]/30">
                <div className="flex items-center gap-3">
                  <span className="text-[#b5c4ff]/50 font-black text-lg w-6">{index + 1}</span>
                  <span className="text-2xl">{item.animal?.icon}</span>
                  <span className="text-lg font-bold text-white">{item.animal?.animal_name_lao}</span>
                </div>
                <span className="text-sm font-bold bg-[#6cf8bb]/30 text-[#6cf8bb] px-3 py-1 rounded-lg">
                  {item.count} ຄັ້ງ
                </span>
              </div>
            )) : <p className="text-[#b5c4ff] text-center py-4">ບໍ່ມີຂໍ້ມູນພຽງພໍ</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
