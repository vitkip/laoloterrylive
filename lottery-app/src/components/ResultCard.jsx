import { useData } from '../context/DataContext'
import { prizeLabels } from '../data/draws'
import { formatLaoDate } from '../utils/date'

export default function ResultCard({ draw, compact = false }) {
  const { animals, types: lotteryTypes } = useData();

  const typeName = lotteryTypes.find(t => t.type_id === draw.type_id)?.type_name || ''
  const twoDigitResult = draw.results_detail?.find(r => r.prize_type === '2_digits')
  const animal = twoDigitResult?.animal_id
    ? animals.find(a => a.animal_id === twoDigitResult.animal_id)
    : null

  if (compact) {
    return (
      <div className="bg-white rounded-xl p-4 border border-[#dee9fd] hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#737686]">ງວດທີ {draw.draw_number}</span>
          <span className="text-xs text-[#737686]">{formatLaoDate(draw.draw_date, true)}</span>
        </div>
        <div className="text-2xl font-black text-[#003fb1] tracking-widest mb-2">
          {draw.full_result}
        </div>
        {animal && (
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-[#006c49]">{animal.icon}</span>
            <span className="text-xs text-[#434654]">2 ຕົວ: {twoDigitResult.result_value} — {animal.animal_name_lao}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#dee9fd] shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-xs text-[#006c49] font-bold uppercase tracking-widest block mb-1">
            {typeName}
          </span>
          <h2 className="text-xl font-bold text-[#121c2a]">
            ງວດທີ {draw.draw_number} — {formatLaoDate(draw.draw_date, false)}
          </h2>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-[#737686]">
             <span className="material-symbols-outlined text-[14px]">verified</span>
             ອັບເດດລ່າສຸດ: {formatLaoDate(draw.draw_date, true)} - ເວລາ 20:30 (ເວລາຈິງການໝຸນ)
          </div>
        </div>
        <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold ${
          draw.status === 'published' ? 'bg-[#6cf8bb]/30 text-[#00714d]' : 'bg-amber-100 text-amber-700'
        }`}>
          {draw.status === 'published' ? 'ປະກາດແລ້ວ' : 'ລໍຖ້າ'}
        </span>
      </div>

      {/* Main 6-digit result */}
      <div className="bg-[#003fb1] rounded-xl p-6 mb-6 text-center">
        <p className="text-[#b5c4ff] text-xs font-bold uppercase tracking-widest mb-2">ຜົນລາງວັນທີ 1</p>
        <div className="flex justify-center gap-2 sm:gap-3">
          {draw.full_result.split('').map((digit, i) => (
            <span
              key={i}
              className="w-10 h-12 sm:w-12 sm:h-14 bg-white rounded-lg flex items-center justify-center text-2xl sm:text-3xl font-black text-[#003fb1]"
            >
              {digit}
            </span>
          ))}
        </div>
      </div>

      {/* Prize breakdown */}
      <div className="space-y-3">
        {draw.results_detail?.filter(r => r.prize_type !== '6_digits').map(r => {
          const animalForRow = r.animal_id ? animals.find(a => a.animal_id === r.animal_id) : null
          return (
            <div key={r.detail_id} className="flex items-center justify-between py-2 border-b border-[#eff3ff] last:border-0">
              <span className="text-sm text-[#434654]">{prizeLabels[r.prize_type]}</span>
              <div className="flex items-center gap-3">
                {animalForRow && (
                  <div className="flex items-center gap-1.5 bg-[#eff3ff] px-2 py-1 rounded-lg">
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