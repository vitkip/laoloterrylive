import { Database, TrendingUp, Film, Trophy, Clock } from 'lucide-react'
import { useData } from '../context/DataContext'
import ArchiveTable from '../components/ArchiveTable'
import SEO from '../components/SEO'
import { webPageSchema, lotteryListSchema, breadcrumbSchema } from '../components/schemas'

// ── Lottery ball watermark decorations ───────────────────────────────────────
const BALLS = [
  { n: '7', x: '7%',  y: '18%', size: 52, delay: 0,   alpha: 0.055 },
  { n: '3', x: '82%', y: '8%',  size: 38, delay: 1.4, alpha: 0.045 },
  { n: '9', x: '91%', y: '62%', size: 58, delay: 0.9, alpha: 0.04  },
  { n: '1', x: '4%',  y: '72%', size: 42, delay: 2.2, alpha: 0.06  },
  { n: '6', x: '53%', y: '83%', size: 50, delay: 1.6, alpha: 0.045 },
  { n: '4', x: '38%', y: '4%',  size: 34, delay: 0.5, alpha: 0.055 },
  { n: '8', x: '70%', y: '28%', size: 40, delay: 1.9, alpha: 0.04  },
]

function BallsDecor() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {BALLS.map(({ n, x, y, size, delay, alpha }) => (
        <div
          key={n}
          className="absolute rounded-full flex items-center justify-center animate-pulse"
          style={{
            left: x, top: y, width: size, height: size,
            background: `radial-gradient(circle at 35% 30%, rgba(250,220,120,${alpha * 1.6}), rgba(200,130,10,${alpha}))`,
            border: `1px solid rgba(240,190,60,${alpha * 2.8})`,
            boxShadow: `0 0 ${size * 0.5}px rgba(240,190,60,${alpha * 0.9})`,
            animationDelay: `${delay}s`,
            animationDuration: `${3.5 + delay * 0.6}s`,
          }}
        >
          <span
            className="font-black font-space leading-none"
            style={{ fontSize: size * 0.38, color: `rgba(255,240,180,${alpha * 7})` }}
          >
            {n}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sublabel, color, valueColor }) {
  return (
    <div
      className="group relative rounded-2xl p-4 sm:p-5 text-center min-w-[96px] overflow-hidden cursor-default transition-all duration-300"
      style={{
        background: `radial-gradient(ellipse at 50% -10%, ${color}0c 0%, rgba(10,10,18,0.55) 70%)`,
        border: `1px solid ${color}16`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)`,
        backdropFilter: 'blur(12px)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.border = `1px solid ${color}42`
        el.style.boxShadow = `0 8px 36px rgba(0,0,0,0.44), 0 0 28px ${color}20, inset 0 1px 0 rgba(255,255,255,0.07)`
        el.style.background = `radial-gradient(ellipse at 50% -10%, ${color}1c 0%, rgba(10,10,18,0.55) 70%)`
        el.style.transform = 'translateY(-3px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.border = `1px solid ${color}16`
        el.style.boxShadow = `0 4px 24px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)`
        el.style.background = `radial-gradient(ellipse at 50% -10%, ${color}0c 0%, rgba(10,10,18,0.55) 70%)`
        el.style.transform = 'translateY(0)'
      }}
    >
      {/* Top glow line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-16 opacity-55 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
      {/* Bottom accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-60 transition-opacity duration-300 rounded-b-2xl"
        style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }}
      />
      {/* Corner glow */}
      <div
        className="absolute -top-3 -right-3 w-12 h-12 rounded-full blur-xl opacity-18 group-hover:opacity-50 transition-opacity duration-300"
        style={{ background: color }}
      />

      <div className="flex items-center justify-center gap-1.5 mb-3" style={{ color }}>
        {icon}
        <p
          className="text-[8px] font-black uppercase tracking-[0.14em] font-jakarta"
          style={{ color: `${color}75` }}
        >
          {label}
        </p>
      </div>
      <p
        className="text-[2rem] font-black font-space tracking-tight leading-none"
        style={{ color: valueColor || '#fff' }}
      >
        {value}
      </p>
      <p
        className="text-[8px] font-bold mt-2 uppercase tracking-wider font-jakarta"
        style={{ color: `${color}48` }}
      >
        {sublabel}
      </p>
    </div>
  )
}

// ── Feature pill data ─────────────────────────────────────────────────────────
const FEATURES = [
  { label: 'ຄົ້ນຫາຕາມວັນທີ',   dot: '#f59e0b' },
  { label: 'ກັ່ນຕອງຕາມປະເພດ', dot: '#34d399' },
  { label: 'ຜົນເລກ 6 ຕົວ',     dot: '#60a5fa' },
  { label: 'ນາມສັດ 40 ຊະນິດ',  dot: '#f472b6' },
  { label: 'ວິດີໂອ Live',       dot: '#f87171' },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const { draws, types } = useData()
  const total     = draws?.length ?? 0
  const latestNum = draws?.[0]?.draw_number ?? '-'
  const withVideo = draws?.filter(d => d.youtube_url)?.length ?? 0

  const firstDraw   = draws?.[draws?.length - 1]
  const latestDraw  = draws?.[0]
  const firstYear   = firstDraw?.draw_date?.slice(0, 4)
  const latestYear  = latestDraw?.draw_date?.slice(0, 4)
  const yearsActive = (firstYear && latestYear && firstYear !== latestYear)
    ? parseInt(latestYear) - parseInt(firstYear) + 1
    : null

  const seoDesc = `ຜົນຫວຍລາວຍ້ອນຫຼັງທຸກງວດ ${total} ງວດ. ເບິ່ງຜົນຫວຍພັດທະນາຍ້ອນຫຼັງ, ຖ່ານທອດສົດ ຈາກງວດ 1 ຮອດ ${latestNum}. | ผลหวยลาวย้อนหลังทุกงวด ${total} งวด หวยลาวพัฒนาย้อนหลัง ตรวจหวยย้อนหลังออนไลน์`

  return (
    <div className="space-y-6">
      <SEO
        title={`ຜົນຫວຍຍ້ອນຫຼັງ ${total} ງວດ | หวยลาวย้อนหลัง ผลหวยพัฒนาย้อนหลัง`}
        description={seoDesc}
        keywords={[
          'ຜົນຫວຍຍ້ອນຫຼັງ', `ງວດທັງໝົດ ${total}`, 'ຫວຍລາວທຸກງວດ',
          'หวยลาวย้อนหลัง', 'ผลหวยพัฒนาย้อนหลัง', 'ตรวจหวยย้อนหลังออนไลน์',
          'หวยย้อนหลัง', 'ฐานข้อมูลหวยลาว',
        ]}
        url="/history"
        jsonLd={[
          webPageSchema(
            'ຜົນຫວຍຍ້ອນຫຼັງ | หวยลาวย้อนหลัง',
            'https://laolots.com/history',
            seoDesc,
            draws?.[0]?.draw_date,
          ),
          breadcrumbSchema([
            { name: 'ໜ້າຫຼັກ', url: 'https://laolots.com/' },
            { name: 'ຜົນຫວຍຍ້ອນຫຼັງ', url: 'https://laolots.com/history' },
          ]),
          lotteryListSchema(draws ?? []),
        ]}
      />

      {/* ─── Hero Banner ─────────────────────────────────────────────── */}
      <div
        className="relative rounded-[2rem] overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0c0c14 0%, #080810 60%, #0a0a0c 100%)',
          border: '1px solid rgba(240,180,50,0.1)',
          boxShadow: '0 28px 64px -16px rgba(0,0,0,0.8), 0 0 0 1px rgba(240,190,60,0.04)',
        }}
      >
        <BallsDecor />

        {/* Radial gold mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-1/3 -right-1/4 w-3/4 h-3/4 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 65%)' }}
          />
          <div
            className="absolute -bottom-1/3 -left-1/4 w-2/3 h-2/3 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(180,100,10,0.08) 0%, transparent 65%)' }}
          />
        </div>

        {/* Subtle dot-grid */}
        <div
          className="absolute inset-0 opacity-[0.036] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(240,190,60,0.8) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Diagonal gloss */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.025)_0%,transparent_50%,rgba(240,190,60,0.015)_100%)] pointer-events-none" />

        {/* ARCHIVE watermark */}
        <div
          className="absolute right-4 bottom-0 font-black font-space leading-none select-none pointer-events-none"
          style={{
            fontSize: 'clamp(72px, 13vw, 164px)',
            background: 'linear-gradient(180deg, rgba(240,190,60,0.07) 0%, rgba(240,190,60,0.015) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          ARCHIVE
        </div>

        <div className="relative z-10 px-8 sm:px-14 py-12 sm:py-16">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.14) 0%, rgba(180,100,10,0.09) 100%)',
              border: '1px solid rgba(245,158,11,0.28)',
              boxShadow: '0 2px 14px rgba(245,158,11,0.09), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300/90 text-[10px] font-extrabold uppercase tracking-[0.14em] font-jakarta">
              History Archive
            </span>
            <span
              className="w-px h-3 opacity-30"
              style={{ background: 'rgba(245,158,11,0.6)' }}
            />
            <span className="text-amber-500/60 text-[10px] font-bold font-space">
              {total} ງວດ
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">

            {/* ── Left: heading + description + pills + timeline ── */}
            <div className="space-y-5 flex-1 min-w-0">

              <h1
                className="font-black leading-[1.08] tracking-tight"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)' }}
              >
                <span className="text-white/92">ປະຫວັດ</span>
                {' '}
                <span
                  style={{
                    background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 35%, #fde68a 65%, #f59e0b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  ຍ້ອນຫຼັງ
                </span>
                {' '}
                <span className="text-white/92">ທັງໝົດ</span>
              </h1>

              <p className="text-white/50 text-sm sm:text-base max-w-lg leading-relaxed font-medium">
                ກວດສອບຜົນຫວຍທັງໝົດທີ່ເຄີຍອອກ ຄົ້ນຫາຕາມວັນທີ, ງວດ, ຫຼືຕົວເລກ
                ລວມທັງເບິ່ງວິດີໂອການອອກລາງວັນຍ້ອນຫຼັງ.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {FEATURES.map(({ label, dot }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 text-[10px] font-extrabold rounded-xl px-3.5 py-1.5 font-jakarta"
                    style={{
                      background: 'rgba(245,158,11,0.05)',
                      border: '1px solid rgba(245,158,11,0.13)',
                      color: 'rgba(253,210,100,0.65)',
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: dot, boxShadow: `0 0 5px ${dot}` }}
                    />
                    {label}
                  </span>
                ))}
              </div>

              {/* Timeline strip */}
              {firstYear && latestYear && (
                <div
                  className="inline-flex items-center gap-3 rounded-2xl px-5 py-3 mt-1"
                  style={{
                    background: 'rgba(245,158,11,0.05)',
                    border: '1px solid rgba(245,158,11,0.1)',
                  }}
                >
                  <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(245,158,11,0.55)' }} />

                  <span
                    className="text-xs font-black font-space"
                    style={{ color: 'rgba(251,191,36,0.65)' }}
                  >
                    {firstYear}
                  </span>

                  <div
                    className="relative h-1 w-20 sm:w-32 rounded-full overflow-hidden"
                    style={{ background: 'rgba(245,158,11,0.12)' }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        width: '100%',
                        background: 'linear-gradient(90deg, rgba(245,158,11,0.5) 0%, rgba(251,191,36,0.9) 100%)',
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: '#fbbf24', boxShadow: '0 0 8px rgba(251,191,36,0.9)' }}
                    />
                    <span className="text-xs font-black font-space text-amber-300">
                      {latestYear}
                    </span>
                  </div>

                  {yearsActive && (
                    <span
                      className="text-[10px] font-bold pl-1 border-l font-jakarta"
                      style={{
                        color: 'rgba(245,158,11,0.45)',
                        borderColor: 'rgba(245,158,11,0.15)',
                      }}
                    >
                      {yearsActive} ປີ
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* ── Right: stat cards ── */}
            <div className="flex flex-wrap gap-3 shrink-0 lg:pt-1">
              <StatCard
                icon={<Database className="w-3.5 h-3.5" />}
                label="TOTAL"
                value={total}
                sublabel="ງວດ"
                color="#f59e0b"
              />
              <StatCard
                icon={<TrendingUp className="w-3.5 h-3.5" />}
                label="LATEST"
                value={latestNum}
                sublabel="ງວດ"
                color="#38bdf8"
                valueColor="#7dd3fc"
              />
              <StatCard
                icon={<Film className="w-3.5 h-3.5" />}
                label="VIDEOS"
                value={withVideo}
                sublabel="ງວດ"
                color="#f87171"
                valueColor="#fca5a5"
              />
              {types?.filter(t => t.is_active != 0).map(t => {
                const color = t.color || '#003fb1'
                const cnt = draws?.filter(d => String(d.type_id) === String(t.type_id)).length ?? 0
                if (cnt === 0) return null
                return (
                  <StatCard
                    key={t.type_id}
                    icon={
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: color, boxShadow: `0 0 5px ${color}` }}
                      />
                    }
                    label={t.type_name}
                    value={cnt}
                    sublabel="ງວດ"
                    color={color}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Section divider ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-1">
        <div
          className="h-px flex-1"
          style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.25), rgba(245,158,11,0.05))' }}
        />
        <span
          className="text-[9px] font-black uppercase tracking-[0.2em] font-jakarta shrink-0"
          style={{ color: 'rgba(245,158,11,0.35)' }}
        >
          ຜົນຫວຍທັງໝົດ
        </span>
        <div
          className="h-px flex-1"
          style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.05), rgba(245,158,11,0.25))' }}
        />
      </div>

      {/* ─── Archive Table ────────────────────────────────────────────── */}
      <ArchiveTable />
    </div>
  )
}
