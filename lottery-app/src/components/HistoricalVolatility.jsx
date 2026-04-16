import { useStatistics } from '../hooks/useStatistics';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function HistoricalVolatility({ timeframe }) {
  const { stats, loading } = useStatistics(timeframe);

  if (loading || !stats) return null;
  // Let's use digit distributions for actual data instead of mock
  const data = stats.digitDistributions.map(d => ({
    name: d.digit.toString(),
    percent: d.percent,
    count: d.count
  })).sort((a,b) => parseInt(a.name) - parseInt(b.name));

  return (
    <div className="bg-white dark:bg-[#152033] p-6 sm:p-8 rounded-2xl shadow-sm border border-[#dee9fd] dark:border-[#2b3a54]">
      <h3 className="text-lg sm:text-xl font-bold text-[#121c2a] dark:text-white mb-8 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#006c49]">bar_chart</span>
        ອັດຕາສ່ວນຕົວເລກ (Digit Chart)
      </h3>

      <div className="h-56 sm:h-64 relative w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#737686', fontSize: 12}} />
            <YAxis hide />
            <Tooltip 
              cursor={{fill: 'transparent'}}
              contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              formatter={(value, name, props) => [`${value}% (${props.payload.count} ຄັ້ງ)`, 'ສັດສ່ວນ']}
            />
            <Bar dataKey="percent" fill="#003fb1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 text-center text-sm text-[#737686] dark:text-[#94a3b8]">
        ສະແດງກຣາຟຄວາມຖີ່ຂອງຕົວເລກ 0-9 ທີ່ອອກໃນລາງວັນ
      </div>
    </div>
  )
}
