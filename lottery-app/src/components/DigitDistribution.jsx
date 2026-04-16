import { useStatistics } from '../hooks/useStatistics';

export default function DigitDistribution({ timeframe }) {
  const { stats, loading } = useStatistics(timeframe);

  if (loading || !stats) return null;
  const { digitDistributions } = stats;

  return (
    <div>
      <h3 className="text-lg sm:text-xl font-bold text-[#121c2a] dark:text-white mb-8 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-[#003fb1] rounded-full shrink-0" />
        ຄວາມຖີ່ຂອງຕົວເລກ 0-9
      </h3>

      <div className="space-y-5">
        {digitDistributions.map(({ digit, percent, barWidth }) => (
          <div key={digit} className="group">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-[#121c2a] dark:text-white">ເລກ {digit}</span>
              <span className="text-[#003fb1]">{percent}%</span>
            </div>
            <div className="h-4 w-full bg-[#d9e3f7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#003fb1] rounded-full transition-all duration-700"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
