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
      style={{
        width: '800px',
        height: '950px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#060410',
        backgroundImage: 'radial-gradient(circle at 15% 15%, #1c0e34 0%, transparent 55%), radial-gradient(circle at 85% 85%, #1a0a08 0%, transparent 55%)',
        fontFamily: "'Noto Sans Lao', 'Phetsarath OT', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Top golden stripe */}
      <div style={{ height: '4px', background: 'linear-gradient(90deg, #d4af37, #FFF5C0, #B8860B, #8B6914, #d4af37)' }} />

      {/* Header Area */}
      <div className="bg-[#0d0e1c] border-b border-[#d4af37]/20 p-6 flex flex-col items-center justify-center text-center relative">
        <div className="flex items-center gap-3 mb-3">
          {/* Logo SVG matching Navbar/Footer flag */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#d4af37] via-[#FFF5C0] to-[#B8860B] p-[2px] flex items-center justify-center shadow-lg">
            <div className="w-full h-full rounded-full bg-[#0d0e1c] overflow-hidden flex items-center justify-center relative">
              {/* Glass shine */}
              <div style={{ position: 'absolute', top: 2, left: 4, width: 6, height: 4, background: 'rgba(255,255,255,0.4)', borderRadius: '50%', transform: 'rotate(-28deg)' }} />
              <svg viewBox="0 0 38 38" style={{ width: '100%', height: '100%', display: 'block' }}>
                <defs>
                  <clipPath id="circleClipShare">
                    <circle cx="19" cy="19" r="17" />
                  </clipPath>
                  <linearGradient id="goldStripeShare" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#A67C1E" />
                    <stop offset="50%" stopColor="#F5D77F" />
                    <stop offset="100%" stopColor="#A67C1E" />
                  </linearGradient>
                  <linearGradient id="darkStripeShare" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0F1326" />
                    <stop offset="50%" stopColor="#1E2548" />
                    <stop offset="100%" stopColor="#0F1326" />
                  </linearGradient>
                  <radialGradient id="goldCircleShare" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFDF5" />
                    <stop offset="70%" stopColor="#F3D072" />
                    <stop offset="100%" stopColor="#C99E32" />
                  </radialGradient>
                </defs>
                <g clipPath="url(#circleClipShare)">
                  <rect x="0" y="0" width="38" height="9.5" fill="url(#goldStripeShare)" />
                  <rect x="0" y="9.5" width="38" height="19" fill="url(#darkStripeShare)" />
                  <rect x="0" y="28.5" width="38" height="9.5" fill="url(#goldStripeShare)" />
                  <circle cx="19" cy="19" r="6.5" fill="url(#goldCircleShare)" />
                </g>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(90deg, #D4AF37, #FFD54F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>LAOLOTS.COM</h1>
        </div>
        <div className="bg-[#d4af37]/15 border border-[#d4af37]/35 px-8 py-2 rounded-full backdrop-blur-md shadow-[0_2px_12px_rgba(212,175,55,0.1)]">
          <h2 className="text-xl font-black text-[#ffd700] tracking-wide">{typeName} / ແຊຣ໌ຜົນລາງວັນ</h2>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 flex flex-col" style={{ background: 'transparent' }}>
        
        {/* Draw Meta Info */}
        <div className="flex justify-between items-center bg-[#0d0e1c]/80 px-8 py-5 rounded-2xl border border-[#d4af37]/20 mb-6 shadow-lg">
          <div>
            <p className="text-sm font-black text-[#ffd700]/70 uppercase tracking-widest mb-1">ງວດທີ {draw.draw_number}</p>
            <p className="text-2xl font-bold text-white">{formatLaoDate(draw.draw_date, false)}</p>
          </div>
          <div className="text-right">
            <span className="bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/25 px-5 py-2 rounded-full text-sm font-black">
              ປະກາດຜົນແລ້ວ
            </span>
          </div>
        </div>

        {/* 6 Digit Prize */}
        <div className="bg-gradient-to-br from-[#0c0e1a] to-[#151a30] border border-[#d4af37]/25 rounded-2xl p-8 mb-6 text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[#ffd700] text-sm font-black uppercase tracking-[0.25em] mb-5">ລາງວັນທີ 1 (ເລກ 6 ຕົວ)</p>
            <div className="flex justify-center gap-4">
              {numbersArr.map((digit, i) => (
                <span key={i} className="w-20 h-26 bg-gradient-to-b from-[#1b1e35] to-[#0a0b14] border border-[#d4af37]/35 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8),0_4px_16px_rgba(212,175,55,0.15)] rounded-2xl flex items-center justify-center text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] via-[#e5c158] to-[#aa7c11]" style={{ fontFamily: "'Inter', sans-serif" }}>
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
            <div className="bg-[#0d0e1c]/80 rounded-2xl border border-[#d4af37]/20 shadow-lg p-6 flex flex-col justify-between divide-y divide-[#d4af37]/10">
               {subPrizes.map(r => (
                 <div key={r.detail_id ?? r.prize_type} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                   <span className="bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#ffd700] px-4 py-2 rounded-lg font-black text-sm">
                     {prizeLabels[r.prize_type] ?? r.prize_type}
                   </span>
                   <span className="text-3xl font-black text-[#ffd700] tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
                     {r.result_value}
                   </span>
                 </div>
               ))}
            </div>
          )}

          {/* Right: Animal Image (only if lottery has 2_digits + animal) */}
          {hasAnimalPrize && animal && (
            <div className="bg-gradient-to-br from-[#0d0e1c]/80 to-[#1c2242]/40 rounded-2xl border border-[#d4af37]/20 shadow-lg p-6 flex flex-col items-center justify-center">
               <>
                 <div className="w-40 h-40 bg-[#0a0b14] rounded-3xl flex items-center justify-center overflow-hidden border-2 border-[#d4af37]/40 shadow-2xl mb-4 relative">
                   {animalDisplayUrl ? (
                     <img src={animalDisplayUrl} alt={animal.animal_name_lao} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-5xl">{animal.icon}</span>
                   )}
                 </div>
                 <h3 className="text-3xl font-black text-white mb-1">{animal.animal_name_lao}</h3>
                 <p className="text-sm font-bold text-[#ffd700]">ນາມສັດ (ເລກ {subPrizes.find(r => r.prize_type === '2_digits')?.result_value ?? '-'})</p>
               </>
            </div>
          )}

        </div>
      </div>

      {/* Footer Branding */}
      <div className="bg-[#0a0b14] text-center py-4 text-[#ffd700]/70 text-base font-bold tracking-widest uppercase border-t border-[#d4af37]/35">
        laolots.com — ສູນລວມຜົນຫວຍລາວອອນລາຍ
      </div>
    </div>
  );
});

export default ShareResultCapture;
