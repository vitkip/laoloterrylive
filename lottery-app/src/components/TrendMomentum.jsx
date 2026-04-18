import { useStatistics } from '../hooks/useStatistics';

export default function TrendMomentum({ timeframe }) {
  const { stats, loading } = useStatistics(timeframe);
  if (loading || !stats) return null;
  const { rising, falling } = stats.trendMomentum;

  const MomentumBadge = ({ item, type }) => {
    const isRising = type === 'rising';
    const pct = (Math.abs(item.momentum) * 100).toFixed(0);
    return (
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all hover:-translate-y-0.5 duration-200
        ${isRising
          ? 'bg-[#edfdf5] dark:bg-[#052e16] border-[#6cf8bb]/30 dark:border-[#166534]/40'
          : 'bg-[#fff4f4] dark:bg-[#2a1010] border-[#ffdad6]/50 dark:border-[#7f1d1d]/40'
        }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-sm
            ${isRising
              ? 'bg-gradient-to-br from-[#006c49] to-[#00a36c] text-white'
              : 'bg-gradient-to-br from-[#ba1a1a] to-[#dc2626] text-white'
            }`}>
            {item.number}
          </div>
          <div>
            <p className={`text-[11px] font-bold ${isRising ? 'text-[#006c49] dark:text-[#4ade80]' : 'text-[#ba1a1a] dark:text-[#f87171]'}`}>
              {isRising ? '▲ ກຳລັງຂຶ້ນ' : '▼ ກຳລັງລົງ'}
            </p>
            <p className="text-[10px] text-[#737686] dark:text-[#94a3b8]">
              {item.recentCount}/5 vs {item.baselineCount}/20
            </p>
          </div>
        </div>
        <span className={`text-[11px] font-black px-2 py-1 rounded-lg
          ${isRising ? 'bg-[#006c49]/10 text-[#006c49] dark:text-[#4ade80]' : 'bg-[#ba1a1a]/10 text-[#ba1a1a] dark:text-[#f87171]'}`}>
          {isRising ? '+' : ''}{pct}%
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-[#152033] rounded-2xl p-6 sm:p-8 border border-[#e8edf8] dark:border-[#2b3a54] shadow-sm overflow-hidden relative">
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#6cf8bb]/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#006c49] to-[#4f46e5] flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            trending_up
          </span>
        </div>
        <div>
          <h2 className="text-base font-extrabold text-[#121c2a] dark:text-white tracking-tight">Trend Momentum</h2>
          <p className="text-[11px] text-[#737686] dark:text-[#94a3b8] font-medium">5 ງວດຫຼ້າສຸດ vs 20 ງວດ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
        {/* Rising */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#00a36c]" />
            <p className="text-[10px] font-bold text-[#737686] dark:text-[#94a3b8] uppercase tracking-wider">
              🔺 ເລກກຳລັງຂຶ້ນ ({rising.length})
            </p>
          </div>
          {rising.length === 0
            ? <p className="text-xs text-[#a0a3bd] py-4 text-center">ບໍ່ມີ momentum ໃໝ່</p>
            : <div className="space-y-2">
                {rising.map(item => <MomentumBadge key={item.number} item={item} type="rising" />)}
              </div>
          }
        </div>

        {/* Falling */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
            <p className="text-[10px] font-bold text-[#737686] dark:text-[#94a3b8] uppercase tracking-wider">
              🔻 ເລກກຳລັງລົງ ({falling.length})
            </p>
          </div>
          {falling.length === 0
            ? <p className="text-xs text-[#a0a3bd] py-4 text-center">ບໍ່ມີ momentum ທີ່ຫຼຸດລົງ</p>
            : <div className="space-y-2">
                {falling.map(item => <MomentumBadge key={item.number} item={item} type="falling" />)}
              </div>
          }
        </div>
      </div>

      <p className="mt-5 text-[10px] text-[#a0a3bd] dark:text-[#555870] flex items-start gap-1.5 relative z-10">
        <span className="material-symbols-outlined text-[12px] mt-px shrink-0">info</span>
        ເທียบ rate ການອອກ 5 ງວດຫຼ້າສຸດ vs 20 ງວດ — ຄ່າ +/– ຄື % ຄວາມຕ່າງ
      </p>
    </div>
  );
}