import { useStatistics } from '../hooks/useStatistics';

export default function ColdNumbers({ timeframe }) {
  const { stats, loading } = useStatistics(timeframe);

  if (loading || !stats) return null;
  const { coldNumbers } = stats;

  return (
    <div className="md:col-span-4 bg-[#dee9fd] dark:bg-[#2b3a54] rounded-xl p-6 sm:p-8 border-dashed border-2 border-[#c3c5d7]/30">
      <div className="flex items-center gap-2 mb-6">
        <span
          className="material-symbols-outlined text-[#003fb1]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          ac_unit
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-[#121c2a] dark:text-white uppercase tracking-wide">
          ເລກດັບ (Cold)
        </h2>
      </div>

      <div className="space-y-4">
        {coldNumbers.map(({ number, missedRounds }) => (
          <div
            key={number}
            className="flex items-center justify-between p-3 bg-white dark:bg-[#152033]/50 rounded-lg"
          >
            <span className="text-2xl font-bold text-[#121c2a] dark:text-white">
              {number}
            </span>
            <span className="text-sm text-[#737686] dark:text-[#94a3b8]">
              ບໍ່ອອກມາ {missedRounds} ງວດ
            </span>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-[#434654] dark:text-[#c7d2fe] leading-relaxed">
        ເລກດັບແມ່ນຕົວເລກທີ່ມີອັດຕາການອອກຕ່ຳທີ່ສຸດໃນຮອບ 120 ວັນທີ່ຜ່ານມາ.
      </p>
    </div>
  )
}
