import { useRef, useState } from 'react';
import { Share2, Loader2, BadgeCheck } from 'lucide-react'
import { toPng } from 'html-to-image';
import { useData } from '../context/DataContext'
import { prizeLabels } from '../data/draws'
import { formatLaoDate } from '../utils/date'
import { resolveAnimalImage } from '../utils/api';
import ShareResultCapture from './ShareResultCapture';
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// ── Skeleton for loading state ─────────────────────────────────────

export function ResultCardSkeleton({ compact = false }) {
  if (compact) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-40" />
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-9 w-28 rounded-full self-start sm:self-auto" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="space-y-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex justify-between py-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Compact variant ────────────────────────────────────────────────

function ResultCardCompact({ draw, animal, twoDigitResult }) {
  return (
    <div className="p-5 bg-[#0d0e1c]/80 backdrop-blur-md border border-[#d4af37]/15 rounded-2xl hover:border-[#d4af37]/35 hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffd700]/60">ງວດທີ {draw.draw_number}</span>
        <span className="text-[10px] text-white/45">{formatLaoDate(draw.draw_date, true)}</span>
      </div>
      <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] via-[#e5c158] to-[#aa7c11] tracking-widest mb-3 font-mono">
        {draw.full_result}
      </div>
      {animal && (
        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
          <span className="text-xs text-white/50">
            2 ຕົວ: <span className="font-bold text-[#ffd700] font-mono">{twoDigitResult.result_value}</span>
            {' — '}<span className="text-white/80 font-semibold">{animal.animal_name_lao}</span>
          </span>
        </div>
      )}
    </div>
  )
}

// ── Full variant ───────────────────────────────────────────────────

export default function ResultCard({ draw, compact = false }) {
  const { animals, types: lotteryTypes } = useData();
  const captureRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const lotteryType = lotteryTypes.find(t => t.type_id === draw.type_id) || null
  const typeName = lotteryType?.type_name || ''
  const twoDigitResult = draw.results_detail?.find(r => r.prize_type === '2_digits')
  const animal = twoDigitResult?.animal_id
    ? animals.find(a => String(a.animal_id) === String(twoDigitResult.animal_id))
    : null
  const animalDisplayUrl = resolveAnimalImage(animal);

  const handleShare = async () => {
    if (!captureRef.current) return;
    try {
      setIsGenerating(true);
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        quality: 1.0,
        pixelRatio: 2,
        skipFonts: true,
        backgroundColor: '#060410',
      });
      const link = document.createElement('a');
      link.download = `lao-lottery-result-${draw.draw_number}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert('ການສ້າງຮູບພາບມີບັນຫາ, ກະລຸນາລອງໃໝ່.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (compact) {
    return <ResultCardCompact draw={draw} animal={animal} twoDigitResult={twoDigitResult} />
  }

  return (
    <div className="relative overflow-hidden bg-[#0d0e1c]/80 backdrop-blur-md border border-[#d4af37]/20 rounded-3xl shadow-[0_24px_48px_rgba(0,0,0,0.6)] p-6 sm:p-8">
      {/* Top golden shimmer accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />

      {/* Off-screen capture element for share image */}
      <div className="absolute left-[-9999px] top-[-9999px]">
        <ShareResultCapture ref={captureRef} draw={draw} animal={animal} animalDisplayUrl={animalDisplayUrl} lotteryType={lotteryType} />
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06] mb-6">
        <div>
          {typeName && (() => {
            const typeObj = lotteryTypes.find(t => t.type_id === draw.type_id)
            const color = typeObj?.color || '#ffd700'
            return (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border mb-2 shadow-[0_2px_10px_rgba(212,175,55,0.1)]"
                style={{ color, background: `${color}15`, borderColor: `${color}35` }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
                {typeName}
              </span>
            )
          })()}
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            ງວດທີ {draw.draw_number} — {formatLaoDate(draw.draw_date, false)}
          </h2>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-white/45">
            <span className="material-symbols-outlined text-[13px] text-[#ffd700]">verified</span>
            ອັບເດດລ່າສຸດ: {formatLaoDate(draw.draw_date, true)} - ເວລາ 20:30
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleShare}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#aa7c11] hover:from-[#ffd700] hover:to-[#d4af37] text-[#060410] font-black text-xs shadow-[0_4px_15px_rgba(212,175,55,0.25)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.35)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isGenerating
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Share2 className="w-3.5 h-3.5" />}
            {isGenerating ? 'ກຳລັງສ້າງຮູບ...' : 'ແຊຣ໌ຜົນນີ້'}
          </button>

          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
            draw.status === 'published' 
              ? 'bg-[#10b981]/10 text-[#34d399] border-[#10b981]/25' 
              : 'bg-white/[0.04] text-white/50 border-white/[0.08]'
          }`}>
            {draw.status === 'published' ? 'ປະກາດແລ້ວ' : 'ລໍຖ້າ'}
          </span>
        </div>
      </div>

      {/* Content section */}
      <div className="space-y-6">
        {/* Main 6-digit result board */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0c0e1a] to-[#151a30] border border-[#d4af37]/15 rounded-2xl p-6 sm:p-8 text-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)]">
          <p className="text-[#ffd700] text-xs font-black uppercase tracking-[0.25em] mb-5">
            ຜົນລາງວັນທີ 1 ປະຈຳວັນທີ {formatLaoDate(draw.draw_date, false)}
          </p>

          <div className="flex flex-col xl:flex-row items-center justify-center gap-6 xl:gap-8">
            {/* Digit boxes */}
            <div className="flex justify-center gap-2 sm:gap-4 shrink-0">
              {draw.full_result.split('').map((digit, i) => (
                <span
                  key={i}
                  className="w-12 h-16 sm:w-16 sm:h-20 bg-gradient-to-b from-[#1b1e35] to-[#0a0b14] border border-[#d4af37]/35 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_4px_12px_rgba(212,175,55,0.12)] rounded-xl flex items-center justify-center text-3.5xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] via-[#e5c158] to-[#aa7c11] font-mono select-none"
                  aria-label={`ເລກ ${digit}`}
                >
                  {digit}
                </span>
              ))}
            </div>

            {/* Animal display */}
            {animal && (
              <div className="flex items-center gap-4 bg-[#0a0b14]/75 px-5 sm:px-6 py-3 h-auto sm:h-[80px] rounded-xl border border-[#d4af37]/15 shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-sm shrink-0 w-full sm:w-auto justify-center xl:justify-start">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-[#d4af37]/40 shrink-0 shadow-md">
                  <img
                    src={animalDisplayUrl}
                    alt={animal.animal_name_lao}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
                <div className="text-left">
                  <p className="text-white font-black text-lg sm:text-xl leading-tight mb-0.5">{animal.animal_name_lao}</p>
                  <p className="text-xs sm:text-sm font-semibold text-[#ffd700]/70">
                    ນາມສັດ (ເລກ: {twoDigitResult.result_value})
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Prize breakdown list */}
        <div className="divide-y divide-[#d4af37]/10 bg-white/[0.02] border border-white/[0.05] rounded-2xl px-5 py-2">
          {draw.results_detail?.filter(r => r.prize_type !== '6_digits').map(r => {
            const animalForRow = r.animal_id
              ? animals.find(a => String(a.animal_id) === String(r.animal_id))
              : null
            return (
              <div
                key={r.detail_id}
                className="flex items-center justify-between py-3.5"
              >
                <span className="text-sm font-semibold text-white/60">{prizeLabels[r.prize_type]}</span>
                <div className="flex items-center gap-3.5">
                  {animalForRow && (
                    <span className="inline-flex items-center bg-[#d4af37]/10 text-[#ffd700] border border-[#d4af37]/25 px-2.5 py-0.5 rounded-md text-[11px] font-black">
                      {animalForRow.animal_name_lao}
                    </span>
                  )}
                  <span className="text-lg font-black text-[#ffd700] min-w-[60px] text-right font-mono tracking-wider">
                    {r.result_value}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
