import React, { useRef, useState } from 'react';
import { useData } from '../context/DataContext'
import { prizeLabels } from '../data/draws'
import { formatLaoDate } from '../utils/date'
import ShareResultCapture from './ShareResultCapture';
import { toPng } from 'html-to-image';

export default function ResultCard({ draw, compact = false }) {
  const { animals, types: lotteryTypes } = useData();
  const captureRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const typeName = lotteryTypes.find(t => t.type_id === draw.type_id)?.type_name || ''
  const twoDigitResult = draw.results_detail?.find(r => r.prize_type === '2_digits')
  const animal = twoDigitResult?.animal_id
    ? animals.find(a => a.animal_id === twoDigitResult.animal_id)
    : null

  let animalDisplayUrl = '';
  if (animal) {
    const isUploadedImage = animal.image_url && (animal.image_url.startsWith('/') || animal.image_url.startsWith('http'));
    animalDisplayUrl = `/images/animals/${animal.animal_id}.png`;
    if (isUploadedImage) {
      animalDisplayUrl = animal.image_url.replace('/laoloterylive', '');
    }
  }

  const handleShare = async () => {
    if (captureRef.current === null) return;
    try {
      setIsGenerating(true);
      const dataUrl = await toPng(captureRef.current, { 
        cacheBust: true, 
        quality: 1.0, 
        pixelRatio: 2,
        skipFonts: true,
        backgroundColor: '#ffffff'
      });
      
      const link = document.createElement('a');
      link.download = `lao-lottery-result-${draw.draw_number}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate share image', err);
      alert('ການສ້າງຮູບພາບມີບັນຫາ, ກະລຸນາລອງໃໝ່.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (compact) {
    return (
      <div className="bg-white dark:bg-[#152033] rounded-xl p-4 border border-[#dee9fd] dark:border-[#2b3a54] hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#737686] dark:text-[#94a3b8]">ງວດທີ {draw.draw_number}</span>
          <span className="text-xs text-[#737686] dark:text-[#94a3b8]">{formatLaoDate(draw.draw_date, true)}</span>
        </div>
        <div className="text-2xl font-black text-[#003fb1] tracking-widest mb-2">
          {draw.full_result}
        </div>
        {animal && (
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-[#006c49]">{animal.icon}</span>
            <span className="text-xs text-[#434654] dark:text-[#c7d2fe]">2 ຕົວ: {twoDigitResult.result_value} — {animal.animal_name_lao}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#152033] rounded-2xl p-6 sm:p-8 border border-[#dee9fd] dark:border-[#2b3a54] shadow-sm relative">
      {/* Hidden Component for Generating Share Image */}
      <div className="absolute left-[-9999px] top-[-9999px]">
        <ShareResultCapture ref={captureRef} draw={draw} animal={animal} animalDisplayUrl={animalDisplayUrl} />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-xs text-[#006c49] font-bold uppercase tracking-widest block mb-1">
            {typeName}
          </span>
          <h2 className="text-xl font-bold text-[#121c2a] dark:text-white">
            ງວດທີ {draw.draw_number} — {formatLaoDate(draw.draw_date, false)}
          </h2>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-[#737686] dark:text-[#94a3b8]">
             <span className="material-symbols-outlined text-[14px]">verified</span>
             ອັບເດດລ່າສຸດ: {formatLaoDate(draw.draw_date, true)} - ເວລາ 20:30 (ເວລາຈິງການໝຸນ)
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button 
            onClick={handleShare}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-[#003fb1] text-white rounded-full text-xs font-bold hover:bg-[#1a56db] transition-colors shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">{isGenerating ? 'hourglass_empty' : 'share'}</span>
            {isGenerating ? 'ກຳລັງສ້າງຮູບ...' : 'ແຊຣ໌ຜົນນີ້'}
          </button>
          <span className={`px-3 py-2 rounded-full text-xs font-bold ${
            draw.status === 'published' ? 'bg-[#6cf8bb]/30 text-[#00714d]' : 'bg-amber-100 text-amber-700'
          }`}>
            {draw.status === 'published' ? 'ປະກາດແລ້ວ' : 'ລໍຖ້າ'}
          </span>
        </div>
      </div>

      {/* Main 6-digit result */}
      <div className="bg-[#003fb1] rounded-xl p-6 sm:p-8 mb-6 text-center">
        <p className="text-[#b5c4ff] text-sm font-bold uppercase tracking-widest mb-4">
          ຜົນລາງວັນທີ 1 ປະຈຳວັນທີ {formatLaoDate(draw.draw_date, false)}
        </p>
        <div className="flex flex-col xl:flex-row items-center justify-center gap-6 xl:gap-8">
          <div className="flex justify-center gap-2 sm:gap-4 shrink-0">
            {draw.full_result.split('').map((digit, i) => (
              <span
                key={i}
                className="w-12 h-16 sm:w-16 sm:h-20 bg-white dark:bg-[#152033] shadow-inner rounded-xl flex items-center justify-center text-3xl sm:text-5xl font-black text-[#003fb1]"
              >
                {digit}
              </span>
            ))}
          </div>
          
          {animal && (
            <div className="flex items-center gap-4 bg-white dark:bg-[#152033]/10 px-5 sm:px-6 py-3 h-auto sm:h-[80px] rounded-xl border border-[#b5c4ff]/20 shadow-sm backdrop-blur-sm shrink-0 w-full sm:w-auto justify-center xl:justify-start">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white dark:bg-[#152033] rounded-full flex items-center justify-center overflow-hidden border-2 border-white shrink-0 shadow-sm">
                <img 
                  src={animalDisplayUrl} 
                  alt={animal.animal_name_lao} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="text-left text-white">
                <p className="text-lg sm:text-xl font-bold leading-tight mb-0.5">{animal.animal_name_lao}</p>
                <p className="text-xs sm:text-sm font-medium text-[#d4dcff]">ນາມສັດ (ເລກ: {twoDigitResult.result_value})</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prize breakdown */}
      <div className="space-y-3">
        {draw.results_detail?.filter(r => r.prize_type !== '6_digits').map(r => {
          const animalForRow = r.animal_id ? animals.find(a => a.animal_id === r.animal_id) : null
          return (
            <div key={r.detail_id} className="flex items-center justify-between py-2 border-b border-[#eff3ff] dark:border-[#1e2d4a] last:border-0">
              <span className="text-sm text-[#434654] dark:text-[#c7d2fe]">{prizeLabels[r.prize_type]}</span>
              <div className="flex items-center gap-3">
                {animalForRow && (
                  <div className="flex items-center gap-1.5 bg-[#eff3ff] dark:bg-[#1e2d4a] px-2 py-1 rounded-lg">
                    <span className="material-symbols-outlined text-sm text-[#003fb1]">{animalForRow.icon}</span>
                    <span className="text-xs font-semibold text-[#003fb1]">{animalForRow.animal_name_lao}</span>
                  </div>
                )}
                <span className="text-lg font-black text-[#003fb1] min-w-[60px] text-right">
                  {r.result_value}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}