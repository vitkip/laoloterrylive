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
    <Card className="p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">ງວດທີ {draw.draw_number}</span>
        <span className="text-xs text-muted-foreground">{formatLaoDate(draw.draw_date, true)}</span>
      </div>
      <div className="text-2xl font-black text-primary tracking-widest mb-2 font-mono">
        {draw.full_result}
      </div>
      {animal && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">
            2 ຕົວ: <span className="font-bold text-foreground">{twoDigitResult.result_value}</span>
            {' — '}{animal.animal_name_lao}
          </span>
        </div>
      )}
    </Card>
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
        backgroundColor: '#ffffff',
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
    <Card className="relative">
      {/* Off-screen capture element for share image */}
      <div className="absolute left-[-9999px] top-[-9999px]">
        <ShareResultCapture ref={captureRef} draw={draw} animal={animal} animalDisplayUrl={animalDisplayUrl} lotteryType={lotteryType} />
      </div>

      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            {typeName && (() => {
              const typeObj = lotteryTypes.find(t => t.type_id === draw.type_id)
              const color = typeObj?.color || '#006c49'
              return (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border mb-1"
                  style={{ color, background: `${color}12`, borderColor: `${color}40` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                  {typeName}
                </span>
              )
            })()}
            <h2 className="text-xl font-bold text-foreground">
              ງວດທີ {draw.draw_number} — {formatLaoDate(draw.draw_date, false)}
            </h2>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
              <BadgeCheck className="w-3.5 h-3.5" />
              ອັບເດດລ່າສຸດ: {formatLaoDate(draw.draw_date, true)} - ເວລາ 20:30
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              size="sm"
              onClick={handleShare}
              disabled={isGenerating}
              className="gap-2 rounded-full px-4 shadow-sm"
            >
              {isGenerating
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Share2 className="w-4 h-4" />}
              {isGenerating ? 'ກຳລັງສ້າງຮູບ...' : 'ແຊຣ໌ຜົນນີ້'}
            </Button>

            <Badge variant={draw.status === 'published' ? 'success' : 'secondary'}>
              {draw.status === 'published' ? 'ປະກາດແລ້ວ' : 'ລໍຖ້າ'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main 6-digit result */}
        <div className="bg-[#003fb1] rounded-xl p-6 sm:p-8 text-center">
          <p className="text-[#b5c4ff] text-sm font-bold uppercase tracking-widest mb-4">
            ຜົນລາງວັນທີ 1 ປະຈຳວັນທີ {formatLaoDate(draw.draw_date, false)}
          </p>

          <div className="flex flex-col xl:flex-row items-center justify-center gap-6 xl:gap-8">
            {/* Digit boxes */}
            <div className="flex justify-center gap-2 sm:gap-4 shrink-0">
              {draw.full_result.split('').map((digit, i) => (
                <span
                  key={i}
                  className="w-12 h-16 sm:w-16 sm:h-20 bg-white dark:bg-[#152033] shadow-inner rounded-xl flex items-center justify-center text-3xl sm:text-5xl font-black text-[#003fb1]"
                  aria-label={`ເລກ ${digit}`}
                >
                  {digit}
                </span>
              ))}
            </div>

            {/* Animal display */}
            {animal && (
              <div className="flex items-center gap-4 bg-white dark:bg-[#152033]/10 px-5 sm:px-6 py-3 h-auto sm:h-[80px] rounded-xl border border-[#b5c4ff]/20 shadow-sm backdrop-blur-sm shrink-0 w-full sm:w-auto justify-center xl:justify-start">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white dark:bg-[#152033] rounded-full flex items-center justify-center overflow-hidden border-2 border-white shrink-0 shadow-sm">
                  <img
                    src={animalDisplayUrl}
                    alt={animal.animal_name_lao}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
                <div className="text-left text-white">
                  <p className="text-lg sm:text-xl font-bold leading-tight mb-0.5">{animal.animal_name_lao}</p>
                  <p className="text-xs sm:text-sm font-medium text-[#d4dcff]">
                    ນາມສັດ (ເລກ: {twoDigitResult.result_value})
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Prize breakdown */}
        <div className="space-y-0">
          {draw.results_detail?.filter(r => r.prize_type !== '6_digits').map(r => {
            const animalForRow = r.animal_id
              ? animals.find(a => String(a.animal_id) === String(r.animal_id))
              : null
            return (
              <div
                key={r.detail_id}
                className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
              >
                <span className="text-sm text-muted-foreground">{prizeLabels[r.prize_type]}</span>
                <div className="flex items-center gap-3">
                  {animalForRow && (
                    <Badge variant="secondary" className="gap-1.5">
                      <span className="text-xs font-semibold">{animalForRow.animal_name_lao}</span>
                    </Badge>
                  )}
                  <span className="text-lg font-black text-primary min-w-[60px] text-right font-mono">
                    {r.result_value}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
