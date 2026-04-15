import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useStatistics } from '../hooks/useStatistics'
import ResultCard from '../components/ResultCard'
import LiveVdoBanner from '../components/LiveVdoBanner'

export default function HomePage() {
  const { draws, animals } = useData();
  const { stats } = useStatistics();

  if (!draws || draws.length === 0) return <div>Loading...</div>;

  const latest = draws.find(d => d.status === 'published') || draws[0]
  const recentDraws = draws.filter(d => d.draw_id !== latest.draw_id).slice(0, 4)

  return (
    <div className="space-y-12">
      <LiveVdoBanner />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#003fb1] to-[#1a56db] rounded-2xl p-8 sm:p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none flex items-center justify-end pr-8">
          <span className="text-[12rem] font-black">ຫວຍ</span>
        </div>
        <div className="relative z-10">
          <span className="text-[#b5c4ff] text-xs font-bold uppercase tracking-[0.2em] block mb-3">
            ຄັງຂໍ້ມູນຫວຍ — ລາວ
          </span>
          <h1 className="text-3xl sm:text-5xl font-black mb-4 leading-tight">
            ຜົນຫວຍ<br className="sm:hidden" /> ລ່າສຸດ
          </h1>
          <p className="text-[#d4dcff] text-sm sm:text-base max-w-xl mb-8">
            ກວດສອບຜົນຫວຍ, ສະຖິຕິ, ແລະ ນາມສັດ ຈາກຖານຂໍ້ມູນທີ່ຖືກຕ້ອງ ແລະ ທັນສະໄໝ.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/statistics"
              className="bg-white text-[#003fb1] px-6 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
            >
              ເບິ່ງສະຖິຕິ
            </Link>
            <Link
              to="/history"
              className="border border-white/40 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-white/10 transition-colors"
            >
              ປະຫວັດຍ້ອນຫຼັງ
            </Link>
          </div>
        </div>
      </div>

      {/* Latest Result */}
      <section>
        <h2 className="text-2xl font-bold text-[#121c2a] mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#003fb1] rounded-full" />
          ຜົນລ່າສຸດ
        </h2>
        <ResultCard draw={latest} />
      </section>

      {/* Recent Draws Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#121c2a] flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#006c49] rounded-full" />
            ງວດຜ່ານມາ
          </h2>
          <Link
            to="/history"
            className="text-[#003fb1] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
          >
            ທັງໝົດ
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentDraws.map(d => (
            <ResultCard key={d.draw_id} draw={d} compact />
          ))}
        </div>
      </section>

      {/* Quick Stats Bar */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: 'dataset', label: 'ງວດທັງໝົດ',    value: draws.length + ' ງວດ' },
          { icon: 'pets',    label: 'ນາມສັດ',        value: animals.length + ' ຊະນິດ' },
          { icon: 'trending_up', label: 'ເລກ Hot ສູງສຸດ', value: stats?.hotNumbers?.[0]?.number || '-' },
          { icon: 'ac_unit', label: 'ບໍ່ອອກດົນສຸດ',  value: stats?.coldNumbers?.[0] ? `${stats.coldNumbers[0].number} (${stats.coldNumbers[0].missedRounds} ງວດ)` : '-' },
        ].map(({ icon, label, value }) => (
          <div key={label} className="bg-[#eff3ff] rounded-xl p-5 flex flex-col gap-3">
            <span className="material-symbols-outlined text-[#003fb1]">{icon}</span>
            <div>
              <p className="text-xs text-[#737686] mb-1">{label}</p>
              <p className="text-lg font-bold text-[#121c2a]">{value}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}