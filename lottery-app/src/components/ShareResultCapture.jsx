import React, { forwardRef } from 'react';
import { formatLaoDate } from '../utils/date';
import { prizeLabels } from '../data/draws';

const ShareResultCapture = forwardRef(({ draw, animal, animalDisplayUrl, lotteryType }, ref) => {
  if (!draw) return null;

  const numbersArr = draw.full_result.split('');
  const typeName = lotteryType?.type_name || 'ຫວຍລາວ';

  // Get all sub-prizes (everything except 6_digits which is shown separately at the top)
  const subPrizes = draw.results_detail?.filter(r => r.prize_type !== '6_digits') || [];
  const hasAnimalPrize = subPrizes.some(r => r.prize_type === '2_digits');

  return (
    <div 
      ref={ref} 
      className="bg-white"
      style={{
        width: '800px',
        height: '950px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f9f9ff',
        fontFamily: "'Noto Sans Lao', 'Phetsarath OT', sans-serif",
      }}
    >
      {/* Header Area */}
      <div className="bg-gradient-to-r from-[#003fb1] to-[#1a56db] text-white p-6 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-3 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/90">
             <path d="M6 3h12l4 6-10 13L2 9Z"/>
             <path d="M11 3 8 9l4 13 4-13-3-6"/>
             <path d="M2 9h20"/>
          </svg>
          <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>LAOLOTS.COM</h1>
        </div>
        <div className="bg-white/20 px-8 py-2 rounded-full backdrop-blur-md">
          <h2 className="text-2xl font-bold">{typeName} / ແຊຣ໌ຜົນລາງວັນ</h2>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 flex flex-col bg-[#f9f9ff]">
        
        {/* Draw Meta Info */}
        <div className="flex justify-between items-center bg-white px-8 py-5 rounded-2xl shadow-sm border border-[#dee9fd] mb-6">
          <div>
            <p className="text-lg text-[#737686] font-bold uppercase tracking-widest mb-1">ງວດທີ {draw.draw_number}</p>
            <p className="text-2xl font-bold text-[#121c2a]">{formatLaoDate(draw.draw_date, false)}</p>
          </div>
          <div className="text-right">
            <span className="bg-[#6cf8bb]/30 text-[#00714d] px-5 py-2 rounded-full text-base font-bold">
              ປະກາດຜົນແລ້ວ
            </span>
          </div>
        </div>

        {/* 6 Digit Prize */}
        <div className="bg-[#003fb1] rounded-2xl p-8 mb-6 text-center shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[#b5c4ff] text-xl font-bold uppercase tracking-[0.2em] mb-4">ລາງວັນທີ 1 (ເລກ 6 ຕົວ)</p>
            <div className="flex justify-center gap-4">
              {numbersArr.map((digit, i) => (
                <span key={i} className="w-20 h-24 bg-white shadow-inner rounded-xl flex items-center justify-center text-6xl font-black text-[#003fb1]" style={{ fontFamily: "'Inter', sans-serif" }}>
                   {digit}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Breakdown & Animal (Bottom half split) */}
        <div className={`grid gap-6 flex-1 ${hasAnimalPrize && animal ? 'grid-cols-2' : 'grid-cols-1'}`}>
          
          {/* Left: sub-prizes (dynamically from results_detail) */}
          {subPrizes.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#dee9fd] shadow-sm p-6 flex flex-col justify-between">
               {subPrizes.map(r => (
                 <div key={r.detail_id ?? r.prize_type} className="flex items-center justify-between py-3 border-b border-[#eff3ff] last:border-0 last:pb-0">
                   <span className="bg-[#eff3ff] text-[#003fb1] px-4 py-2 rounded-lg font-bold text-lg inline-block">
                     {prizeLabels[r.prize_type] ?? r.prize_type}
                   </span>
                   <span className="text-3xl font-black text-[#121c2a]" style={{ fontFamily: "'Inter', sans-serif" }}>
                     {r.result_value}
                   </span>
                 </div>
               ))}
            </div>
          )}

          {/* Right: Animal Image (only if lottery has 2_digits + animal) */}
          {hasAnimalPrize && animal && (
            <div className="bg-gradient-to-br from-[#ffffff] to-[#eff3ff] rounded-2xl border border-[#dee9fd] shadow-sm p-6 flex flex-col items-center justify-center">
               <>
                 <div className="w-40 h-40 bg-white rounded-3xl flex items-center justify-center overflow-hidden border-4 border-white shadow-xl mb-4 relative">
                   {animalDisplayUrl ? (
                     <img src={animalDisplayUrl} alt={animal.animal_name_lao} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-5xl">{animal.icon}</span>
                   )}
                 </div>
                 <h3 className="text-3xl font-black text-[#121c2a] mb-1">{animal.animal_name_lao}</h3>
                 <p className="text-lg font-bold text-[#003fb1]">ນາມສັດ (ເລກ {subPrizes.find(r => r.prize_type === '2_digits')?.result_value ?? '-'})</p>
               </>
            </div>
          )}

        </div>
      </div>

      {/* Footer Branding */}
      <div className="bg-[#121c2a] text-center py-4 text-[#737686] text-lg font-bold tracking-widest uppercase border-t-4 border-[#003fb1]">
        laolots.com — ສູນລວມຜົນຫວຍລາວອອນລາຍ
      </div>
    </div>
  );
});

export default ShareResultCapture;
