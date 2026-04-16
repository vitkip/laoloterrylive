import { useStatistics } from '../hooks/useStatistics';

export default function HotNumbers({ timeframe }) {
  const { stats, loading } = useStatistics(timeframe);

  if (loading || !stats) return null;
  const { hotNumbers } = stats;

  return (
    <div className="md:col-span-8 bg-[#eff3ff] dark:bg-[#1e2d4a] rounded-xl p-6 sm:p-8 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <span
            className="material-symbols-outlined text-[#006c49]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            local_fire_department
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-[#121c2a] dark:text-white uppercase tracking-wide">
            ເລກເດັ່ນ (Hot Numbers)
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {hotNumbers.map(({ number, count }) => (
            <div
              key={number}
              className="bg-white dark:bg-[#152033] p-5 sm:p-6 rounded-xl flex flex-col items-center gap-2"
            >
              <span className="text-4xl font-black text-[#006c49]">
                {number}
              </span>
              <span className="text-[10px] font-medium text-[#737686] dark:text-[#94a3b8] uppercase tracking-widest text-center">
                ອອກ {count} ຄັ້ງ
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-[#c3c5d7]/20 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1">
          <p className="text-sm text-[#737686] dark:text-[#94a3b8]">ຄວາມເປັນໄປໄດ້ໃນງວດຖັດໄປ</p>
          <p className="text-2xl font-bold text-[#121c2a] dark:text-white">ສູງກວ່າຄ່າສະເລ່ຍ</p>
        </div>
        <button className="bg-[#003fb1] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity shrink-0">
          ເບິ່ງລາຍລະອຽດ
        </button>
      </div>
    </div>
  )
}
