import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useStatistics } from '../hooks/useStatistics'
import ResultCard from '../components/ResultCard'
import LiveVdoBanner from '../components/LiveVdoBanner'
import { resolveAnimalImage } from '../utils/api'
import SEO from '../components/SEO'
import { websiteSchema, lotteryResultSchema, breadcrumbSchema } from '../components/schemas'

function HomePageSkeleton() {
  const shimmer = "bg-zinc-200/80 dark:bg-zinc-800/80 animate-pulse rounded-lg"
  return (
    <div className="space-y-10">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#09090b] via-[#0e0e16] to-[#0d0d13] px-8 sm:px-12 py-10 sm:py-14 min-h-[240px]">
        <div className={`w-40 h-3 mb-5 ${shimmer} opacity-30`} />
        <div className={`w-64 h-12 mb-4 ${shimmer} opacity-20`} />
        <div className={`w-72 h-4 mb-8 ${shimmer} opacity-15`} />
        <div className="flex gap-3">
          <div className="w-28 h-10 rounded-full bg-white/20 animate-pulse" />
          <div className="w-32 h-10 rounded-full bg-white/10 animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="bg-card rounded-2xl p-5 border border-border h-28 animate-pulse" />
        ))}
      </div>
      <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border min-h-[220px] animate-pulse" />
    </div>
  )
}

// ── Feature card ────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, to, accent, bg, badge }) {
  return (
    <Link
      to={to}
      className="group relative bg-card/60 backdrop-blur-md border border-white/[0.08] dark:border-white/[0.06] rounded-2xl p-5 sm:p-6 flex flex-col gap-4 hover:shadow-xl hover:shadow-black/[0.06] hover:-translate-y-1 transition-all duration-200 overflow-hidden shadow-sm"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(ellipse at 0% 0%, ${accent}08, transparent 60%)` }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
          style={{ background: `${accent}15` }}
        >
          <span className="material-symbols-outlined text-[22px]" style={{ color: accent, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        {badge && (
          <span
            className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
            style={{ color: accent, background: `${accent}12`, borderColor: `${accent}30` }}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <h3 className="font-extrabold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      <div className="relative z-10 flex items-center gap-1 text-xs font-bold mt-auto" style={{ color: accent }}>
        ເຂົ້າໄປເບິ່ງ
        <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </div>
    </Link>
  )
}

// ── Stat card (redesigned) ─────────────────────────────────────────
function StatCard({ icon, label, value, image, accent = '#003fb1' }) {
  return (
    <div className="group relative bg-card/70 backdrop-blur-sm rounded-2xl p-5 border border-border/60 hover:shadow-lg hover:shadow-black/[0.05] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.06] -translate-y-8 translate-x-8"
        style={{ background: accent }}
      />
      <div className="relative z-10">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
          style={{ background: `${accent}15` }}
        >
          {image
            ? <img src={image} alt={label} className="w-7 h-7 object-contain rounded-lg" />
            : <span className="material-symbols-outlined text-[20px]" style={{ color: accent, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
          }
        </div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        <p className="text-base font-extrabold text-foreground leading-tight">{value}</p>
      </div>
    </div>
  )
}

// ── Result ticker item ─────────────────────────────────────────────
function TickerItem({ draw, color }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.07] backdrop-blur-sm border border-white/[0.12] shrink-0">
      {color && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />}
      <span className="text-white/70 text-[10px] font-bold">ງວດ {draw.draw_number}</span>
      <span className="text-white font-black text-xs tracking-widest" style={{ fontFamily: 'Inter, monospace' }}>{draw.full_result}</span>
    </span>
  )
}

export default function HomePage() {
  const { draws, types, animals } = useData();
  const { stats } = useStatistics();
  const [selectedType, setSelectedType] = useState('all');

  if (!draws || draws.length === 0) return <HomePageSkeleton />

  const filteredDraws = selectedType === 'all'
    ? draws
    : draws.filter(d => String(d.type_id) === String(selectedType))

  const latest = filteredDraws.find(d => d.status === 'published') || filteredDraws[0]
  const recentDraws = latest ? filteredDraws.filter(d => d.draw_id !== latest.draw_id).slice(0, 4) : []

  // Ticker: last 8 published draws (all types) for the scroll strip
  const tickerDraws = draws.filter(d => d.status === 'published').slice(0, 8)

  const statItems = [
    {
      icon: 'dataset',
      label: 'ງວດທັງໝົດ',
      value: `${draws.length} ງວດ`,
      accent: '#003fb1',
    },
    {
      icon: 'pets',
      label: 'ນາມສັດຮ້ອນ',
      value: stats?.animalStats?.[0]
        ? `${stats.animalStats[0].name} (${stats.animalStats[0].frequencyPercent}%)`
        : '-',
      image: stats?.animalStats?.[0]?.image_url || null,
      accent: '#006c49',
    },
    {
      icon: 'local_fire_department',
      label: 'ເລກ Hot ສູງສຸດ',
      value: stats?.hotNumbers?.[0]?.number || '-',
      accent: '#c2410c',
    },
    {
      icon: 'ac_unit',
      label: 'ບໍ່ອອກດົນສຸດ',
      value: stats?.coldNumbers?.[0]
        ? `${stats.coldNumbers[0].number} (${stats.coldNumbers[0].missedRounds} ງວດ)`
        : '-',
      accent: '#0369a1',
    },
  ]

  const features = [
    {
      icon: 'analytics',
      title: 'ສະຖິຕິ & ການວິເຄາະ',
      desc: 'ສະຖິຕິລາຍລະອຽດ, ເລກ Hot/Cold, ການແຈກຢາຍຕົວເລກ ແລະ trend ສຸດທ້ອງ',
      to: '/statistics',
      accent: '#003fb1',
      badge: 'Dashboard',
    },
    {
      icon: 'auto_awesome',
      title: 'ຕຳລາຄວາມຝັນ',
      desc: 'ແປຄວາມຝັນ 40 ນາມສັດ ແລະ ຊອກເລກທີ່ກ່ຽວຂ້ອງ ຕາມຕຳລາໂບຮານ',
      to: '/search',
      accent: '#7c3aed',
      badge: 'ໃໝ່',
    },
    {
      icon: 'manage_search',
      title: 'ຄົ້ນຫາຕາມເລກ',
      desc: 'ກວດສອບປະຫວັດຂອງຕົວເລກ 00–99 ວ່າອອກເວລາໃດ ແລະ ຄວາມຖີ່ສໍ່ານ',
      to: '/search',
      accent: '#006c49',
    },
    {
      icon: 'trending_up',
      title: 'AI Analytics',
      desc: 'ວິເຄາະ pattern, momentum, gap analysis ດ້ວຍ algorithm ທີ່ທັນສະໄໝ',
      to: '/analytics',
      accent: '#d97706',
      badge: 'AI',
    },
  ]

  const latestDraw = draws.filter(d => d.status === 'published')[0]
  const latestDateStr = latestDraw?.draw_date ?? ''
  const latestNumber = latestDraw?.result_number ?? ''
  const latestTypeName = latestDraw?.type_name ?? 'ພັດທະນາ'

  const seoTitle = latestNumber
    ? `ຜົນຫວຍ${latestTypeName} ${latestDateStr} ເລກ ${latestNumber} | ผลหวย${latestTypeName} ${latestDateStr}`
    : 'ຜົນຫວຍພັດທະນາຫຼ້າສຸດ | ผลหวยพัฒนาล่าสุด'
  const seoDesc = latestNumber
    ? `ຜົນຫວຍ${latestTypeName}ງວດວັນທີ ${latestDateStr} ເລກທີ່ອອກ: ${latestNumber}. ຖ່າຍທອດສົດ ສະຖິຕິ ວິເຄາະຫວຍ ຈັບຄູ່ນາມສັດ ທຳນາຍຝັນ | ผลหวย${latestTypeName} งวด ${latestDateStr} เลข ${latestNumber}. ถ่ายทอดสด สถิติ วิเคราะห์หวย`
    : 'ສູນລວມຜົນຫວຍພັດທະນາ ຖ່າຍທອດສົດຫວຍລາວ ວິເຄາະຫວຍ | ศูนย์รวมผลหวยลาว ถ่ายทอดสด วิเคราะห์หวย'

  return (
    <div className="space-y-12">
      <SEO
        title={seoTitle}
        description={seoDesc}
        keywords={[
          latestNumber, latestDateStr, latestTypeName,
          `ຜົນຫວຍ ${latestDateStr}`, `เลข ${latestNumber}`, `หวยงวด ${latestDateStr}`,
          'ຫວຍຫຼ້າສຸດ', 'หวยล่าสุด', 'ผลหวยวันนี้',
        ].filter(Boolean)}
        url="/"
        jsonLd={[
          websiteSchema(),
          breadcrumbSchema([{ name: 'ໜ້າຫຼັກ', url: 'https://laolots.com/' }]),
          ...(latestDraw ? [lotteryResultSchema(latestDraw)] : []),
        ]}
      />
      <LiveVdoBanner />

      {/* ─── Hero ─── */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/[0.05]">
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#09090b] via-[#0e0e16] to-[#0d0d13]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.20),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(56,189,248,0.14),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.07),transparent_70%)]" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />

        {/* Watermark */}
        <div className="absolute right-0 bottom-0 text-[10rem] sm:text-[15rem] font-black text-white/[0.035] leading-none select-none pointer-events-none pr-2 pb-0">
          ຫວຍ
        </div>

        <div className="relative z-10 px-8 sm:px-12 pt-10 sm:pt-14 pb-6">
          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <div className="inline-flex items-center gap-2 bg-white/[0.07] backdrop-blur-xl border border-white/[0.15] rounded-full px-4 py-1.5 shadow-lg shadow-violet-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-300 animate-pulse" />
              <span className="text-white/90 text-[11px] font-bold uppercase tracking-widest">ຄັງຂໍ້ມູນຫວຍ — ລາວ</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-sky-400/[0.12] border border-sky-400/25 rounded-full px-3 py-1.5">
              <span className="material-symbols-outlined text-sky-300 text-[12px]">database</span>
              <span className="text-sky-300 text-[10px] font-bold">{draws.length}+ ງວດ</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-4">
            ຜົນຫວຍ
            <span className="text-violet-300 sm:ml-3 block sm:inline">ລ່າສຸດ</span>
          </h1>
          <p className="text-white/65 text-sm sm:text-base max-w-xl mb-8 leading-relaxed">
            ກວດສອບຜົນຫວຍ, ສະຖິຕິ, ນາມສັດ ແລະ ວິເຄາະຕົວເລກ ຈາກຖານຂໍ້ມູນທີ່ຄົບຖ້ວນ ແລະ ທັນສະໄໝ
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3 mb-10">
            <Link
              to="/statistics"
              className="inline-flex items-center gap-2 bg-white/95 text-zinc-900 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:bg-white hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[16px]">bar_chart</span>
              ເບິ່ງສະຖິຕິ
            </Link>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-sky-400/[0.15] border border-sky-400/30 text-sky-300 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-sky-400/[0.25] transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              ຕຳລາຄວາມຝັນ
            </Link>
            <Link
              to="/history"
              className="inline-flex items-center gap-2 border border-white/[0.18] bg-white/[0.07] backdrop-blur-sm text-white/80 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-white/[0.14] hover:text-white transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[16px]">history</span>
              ປະຫວັດ
            </Link>
          </div>

          {/* ── Ticker strip ── */}
          {tickerDraws.length > 0 && (
            <div className="border-t border-white/[0.07] pt-5 pb-1 overflow-hidden">
              <div className="flex items-center gap-3 mb-2.5">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest shrink-0">ຜົນຫຼ້າສຸດ</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
                {tickerDraws.map(d => {
                  const typeColor = types?.find(t => t.type_id === d.type_id)?.color || '#6cf8bb'
                  return <TickerItem key={d.draw_id} draw={d} color={typeColor} />
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Feature Showcase ─── */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 backdrop-blur-sm ring-1 ring-primary/15 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>apps</span>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-foreground uppercase tracking-wider text-[11px]">ຄຸນສົມບັດ</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">ທຸກສ່ວນທີ່ທ່ານຕ້ອງການ ຢູ່ໃນທີ່ດຽວ</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* ─── Type Filter Tabs ─── */}
      {types && types.length > 1 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">ປະເພດ:</span>
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
              selectedType === 'all'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                : 'bg-card/70 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            }`}
          >
            ທັງໝົດ ({draws.length})
          </button>
          {types.filter(t => t.is_active != 0).map(t => {
            const color = t.color || '#003fb1'
            const active = String(selectedType) === String(t.type_id)
            const cnt = draws.filter(d => String(d.type_id) === String(t.type_id)).length
            return (
              <button
                key={t.type_id}
                onClick={() => setSelectedType(String(t.type_id))}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all"
                style={active
                  ? { background: color, color: '#fff', borderColor: color, boxShadow: `0 2px 8px ${color}40` }
                  : { background: 'transparent', color, borderColor: `${color}50` }
                }
              >
                {t.type_name} ({cnt})
              </button>
            )
          })}
        </div>
      )}

      {/* ─── Latest Result ─── */}
      {latest ? (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-7 rounded-full bg-gradient-to-b from-primary to-primary/40" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">ຜົນລ່າສຸດ</h2>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          <ResultCard draw={latest} />
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-card rounded-2xl border border-border">
          <span className="material-symbols-outlined text-4xl text-muted-foreground">inbox</span>
          <p className="text-sm text-muted-foreground">ຍັງບໍ່ມີງວດຫວຍໃນປະເພດນີ້</p>
        </div>
      )}

      {/* ─── Hot Numbers Strip ─── */}
      {stats?.hotNumbers?.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#ff6b35]/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#ff6b35] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              </div>
              <div>
                <h2 className="text-base font-extrabold text-foreground uppercase tracking-wider text-[11px]">ເລກ Hot</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">ອອກຫຼາຍທີ່ສຸດໃນຖານຂໍ້ມູນ</p>
              </div>
            </div>
            <Link
              to="/statistics"
              className="inline-flex items-center gap-1.5 text-[#c2410c] text-xs font-bold hover:gap-2.5 transition-all duration-200 group"
            >
              ວິເຄາະເລີ່ມ
              <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {stats.hotNumbers.slice(0, 8).map(({ number, count }, i) => {
              const intensity = i < 2 ? 'from-[#ff6b35] to-[#f7931e]' : i < 5 ? 'from-[#c2410c] to-[#ea580c]' : 'from-[#9a3412] to-[#c2410c]'
              return (
                <div
                  key={number}
                  className="relative bg-card/70 backdrop-blur-sm border border-border/60 rounded-2xl p-3 flex flex-col items-center gap-1.5 hover:shadow-lg hover:shadow-black/[0.06] hover:-translate-y-0.5 transition-all duration-200"
                >
                  {i < 3 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-br from-[#ff6b35] to-[#f7931e] rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white text-[8px] font-black">{i + 1}</span>
                    </span>
                  )}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${intensity} flex items-center justify-center shadow-sm`}>
                    <span className="text-lg font-black text-white">{number}</span>
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground">{count}x</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ─── Recent Draws ─── */}
      {recentDraws.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-7 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-400/40" />
              <h2 className="text-xl font-extrabold text-foreground">ງວດຜ່ານມາ</h2>
            </div>
            <Link
              to="/history"
              className="inline-flex items-center gap-1.5 text-primary text-sm font-bold hover:gap-2.5 transition-all duration-200 group"
            >
              ທັງໝົດ
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentDraws.map(d => (
              <ResultCard key={d.draw_id} draw={d} compact />
            ))}
          </div>
        </section>
      )}

      {/* ─── Quick Stats ─── */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-7 rounded-full bg-gradient-to-b from-violet-500 to-violet-400/40" />
          <h2 className="text-xl font-extrabold text-foreground">ສະຫຼຸບຂໍ້ມູນ</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statItems.map(item => (
            <StatCard key={item.label} {...item} />
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/[0.05]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#09090b] via-[#0e0e16] to-[#0d0d13]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.22),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(56,189,248,0.15),transparent_55%)]" />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[7rem] font-black text-white/[0.03] leading-none select-none pointer-events-none">
          STATS
        </div>
        <div className="relative z-10 px-8 sm:px-12 py-8 sm:py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mb-2">ສໍາລັບນັກວິເຄາະ</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">ວິເຄາະໃນລະດັບ Pro</h3>
            <p className="text-white/60 text-sm max-w-md leading-relaxed">
              Gap analysis, trend momentum, pairing stats, repeat patterns ແລະ ອີກຫຼາຍຢ່າງ
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/statistics"
              className="inline-flex items-center gap-2 bg-white/95 text-zinc-900 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:bg-white hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[16px]">analytics</span>
              ເຂົ້າ Dashboard
            </Link>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-2 border border-white/[0.18] bg-white/[0.07] backdrop-blur-sm text-white/80 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-white/[0.14] hover:text-white transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              AI Analytics
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
