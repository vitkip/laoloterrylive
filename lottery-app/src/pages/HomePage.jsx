import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useStatistics } from '../hooks/useStatistics'
import ResultCard from '../components/ResultCard'
import LiveVdoBanner from '../components/LiveVdoBanner'

function HomePageSkeleton() {
  const shimmer = "bg-[#e8edf8] dark:bg-[#2b3a54] animate-pulse rounded-lg"
  return (
    <div className="space-y-10">
      {/* Hero skeleton — same gradient + min-height as real hero to prevent CLS */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#001d6e] via-[#003fb1] to-[#1a56db] px-8 sm:px-12 py-10 sm:py-14 min-h-[240px]">
        <div className={`w-40 h-3 mb-5 ${shimmer} opacity-30`} />
        <div className={`w-64 h-12 mb-4 ${shimmer} opacity-20`} />
        <div className={`w-72 h-4 mb-8 ${shimmer} opacity-15`} />
        <div className="flex gap-3">
          <div className="w-28 h-10 rounded-full bg-white/20 animate-pulse" />
          <div className="w-32 h-10 rounded-full bg-white/10 animate-pulse" />
        </div>
      </div>
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 rounded-full bg-[#003fb1]/30" />
        <div className={`w-32 h-6 ${shimmer}`} />
      </div>
      {/* Result card skeleton */}
      <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border min-h-[220px]">
        <div className={`w-48 h-5 mb-6 ${shimmer}`} />
        <div className={`w-52 h-16 mb-4 ${shimmer}`} />
        <div className={`w-40 h-4 mb-3 ${shimmer}`} />
        <div className={`w-64 h-4 ${shimmer}`} />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="bg-card rounded-2xl p-5 border border-border h-24 animate-pulse" />
        ))}
      </div>
      {/* Recent draws */}
      <div className="space-y-4">
        <div className={`w-36 h-6 ${shimmer}`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0,1,2,3].map(i => (
            <div key={i} className="bg-card rounded-xl p-4 border border-border h-[76px] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ icon, label, value, image, accent = '#003fb1', bg = '#eff3ff' }) => (
  <div className="group relative bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
    <div
      className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.07] -translate-y-6 translate-x-6"
      style={{ background: accent }}
    />
    <div className="relative z-10 flex flex-col gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: bg }}
      >
        {image
          ? <img src={image} alt={label} className="w-7 h-7 object-contain rounded-lg" />
          : <span className="material-symbols-outlined text-[20px]" style={{ color: accent }}>{icon}</span>
        }
      </div>
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        <p className="text-base font-extrabold text-foreground leading-tight">{value}</p>
      </div>
    </div>
  </div>
)

export default function HomePage() {
  const { draws } = useData();
  const { stats } = useStatistics();

  if (!draws || draws.length === 0) return <HomePageSkeleton />

  const latest = draws.find(d => d.status === 'published') || draws[0]
  const recentDraws = draws.filter(d => d.draw_id !== latest.draw_id).slice(0, 4)

  const statItems = [
    {
      icon: 'dataset',
      label: 'ງວດທັງໝົດ',
      value: `${draws.length} ງວດ`,
      accent: '#003fb1',
      bg: '#eff3ff',
    },
    {
      icon: 'pets',
      label: 'ນາມສັດຮ້ອນ',
      value: stats?.animalStats?.[0]
        ? `${stats.animalStats[0].name} (${stats.animalStats[0].frequencyPercent}%)`
        : '-',
      image: stats?.animalStats?.[0]?.image_url || null,
      accent: '#006c49',
      bg: '#edfdf5',
    },
    {
      icon: 'local_fire_department',
      label: 'ເລກ Hot ສູງສຸດ',
      value: stats?.hotNumbers?.[0]?.number || '-',
      accent: '#c2410c',
      bg: '#fff4ed',
    },
    {
      icon: 'ac_unit',
      label: 'ບໍ່ອອກດົນສຸດ',
      value: stats?.coldNumbers?.[0]
        ? `${stats.coldNumbers[0].number} (${stats.coldNumbers[0].missedRounds} ງວດ)`
        : '-',
      accent: '#0369a1',
      bg: '#f0f9ff',
    },
  ]

  return (
    <div className="space-y-10">
      <LiveVdoBanner />

      {/* ─── Hero ─── */}
      <div className="relative rounded-3xl overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#001d6e] via-[#003fb1] to-[#1a56db]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,108,73,0.25),transparent_60%)]" />

        {/* Decorative watermark */}
        <div className="absolute right-0 bottom-0 text-[10rem] sm:text-[14rem] font-black text-white/[0.04] leading-none select-none pointer-events-none pr-4 pb-2">
          ຫວຍ
        </div>

        {/* Floating dots */}
        <div className="absolute top-6 right-16 w-2 h-2 rounded-full bg-white/20" />
        <div className="absolute top-14 right-32 w-1.5 h-1.5 rounded-full bg-white/15" />
        <div className="absolute bottom-8 right-24 w-3 h-3 rounded-full bg-white/10" />

        <div className="relative z-10 px-8 sm:px-12 py-10 sm:py-14">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6cf8bb] animate-pulse" />
            <span className="text-white/90 text-xs font-bold uppercase tracking-widest">
              ຄັງຂໍ້ມູນຫວຍ — ລາວ
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-4">
            ຜົນຫວຍ
            <span className="block text-[#b5c4ff] sm:inline sm:ml-3">ລ່າສຸດ</span>
          </h1>

          <p className="text-white/70 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
            ກວດສອບຜົນຫວຍ, ສະຖິຕິ, ແລະ ນາມສັດ ຈາກຖານຂໍ້ມູນທີ່ຖືກຕ້ອງ ແລະ ທັນສະໄໝ.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/statistics"
              className="inline-flex items-center gap-2 bg-white text-[#003fb1] px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[16px]">bar_chart</span>
              ເບິ່ງສະຖິຕິ
            </Link>
            <Link
              to="/history"
              className="inline-flex items-center gap-2 border border-white/30 bg-white/10 backdrop-blur-sm text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-white/20 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[16px]">history</span>
              ປະຫວັດຍ້ອນຫຼັງ
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Latest Result ─── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-7 rounded-full bg-gradient-to-b from-[#003fb1] to-[#1a56db]" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
            ຜົນລ່າສຸດ
          </h2>
          <span className="inline-flex items-center gap-1.5 bg-[#edfdf5] text-[#00714d] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#6cf8bb]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00714d] animate-pulse" />
            Live
          </span>
        </div>
        <ResultCard draw={latest} />
      </section>

      {/* ─── Recent Draws ─── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 rounded-full bg-gradient-to-b from-[#006c49] to-[#00a36c]" />
            <h2 className="text-xl font-extrabold text-foreground">
              ງວດຜ່ານມາ
            </h2>
          </div>
          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 text-[#003fb1] text-sm font-bold hover:gap-2.5 transition-all duration-200 group"
          >
            ທັງໝົດ
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentDraws.map(d => (
            <ResultCard key={d.draw_id} draw={d} compact />
          ))}
        </div>
      </section>

      {/* ─── Quick Stats ─── */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-7 rounded-full bg-gradient-to-b from-[#7c3aed] to-[#a855f7]" />
          <h2 className="text-xl font-extrabold text-foreground">ສະຫຼຸບຂໍ້ມູນ</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statItems.map(item => (
            <StatCard key={item.label} {...item} />
          ))}
        </div>
      </section>
    </div>
  )
}
