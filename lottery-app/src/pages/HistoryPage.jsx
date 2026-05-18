import { Archive, Database, CalendarDays, TrendingUp, Film } from 'lucide-react'
import { useData } from '../context/DataContext'
import ArchiveTable from '../components/ArchiveTable'
import SEO from '../components/SEO'
import { webPageSchema, lotteryListSchema, breadcrumbSchema } from '../components/schemas'

export default function HistoryPage() {
  const { draws, types } = useData()
  const total = draws?.length ?? 0
  const latestNum = draws?.[0]?.draw_number ?? '-'
  const withVideo = draws?.filter(d => d.youtube_url)?.length ?? 0

  const seoDesc = `ຜົນຫວຍລາວຍ້ອນຫຼັງທຸກງວດ ${total} ງວດ. ເບິ່ງຜົນຫວຍພັດທະນາຍ້ອນຫຼັງ, ຖ່ານທອດສົດ ຈາກງວດ 1 ຮອດ ${latestNum}. | ผลหวยลาวย้อนหลังทุกงวด ${total} งวด หวยลาวพัฒนาย้อนหลัง ตรวจหวยย้อนหลังออนไลน์`

  return (
    <div className="space-y-10">
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

      {/* ─── Hero Banner ─── */}
      <div className="relative rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#001d6e] via-[#003fb1] to-[#1565c0]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(108,248,187,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.25),transparent_55%)]" />
        <div className="absolute right-0 bottom-0 text-[8rem] sm:text-[13rem] font-black text-white/[0.04] leading-none select-none pointer-events-none pr-4 pb-1">
          ARCHIVE
        </div>

        <div className="relative z-10 px-8 sm:px-12 py-10 sm:py-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3.5 py-1 mb-5">
            <Archive className="w-3.5 h-3.5 text-[#6cf8bb]" />
            <span className="text-white/90 text-[11px] font-bold uppercase tracking-widest">History Archive</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
                ປະຫວັດຍ້ອນຫຼັງ
                <span className="text-[#6cf8bb] ml-3">ທັງໝົດ</span>
              </h1>
              <p className="text-white/60 text-sm max-w-lg leading-relaxed mb-5">
                ກວດສອບຜົນຫວຍທັງໝົດທີ່ເຄີຍອອກ ຄົ້ນຫາຕາມວັນທີ, ງວດ, ຫຼືຕົວເລກ ລວມທັງເບິ່ງວິດີໂອການອອກລາງວັນ
              </p>
              {/* Feature pills */}
              <div className="flex flex-wrap gap-2">
                {['ຄົ້ນຫາຕາມວັນທີ', 'ກັ່ນຕອງຕາມປະເພດ', 'ຜົນເລກ 6 ຕົວ', 'ນາມສັດ 40 ຊະນິດ', 'ວິດີໂອ Live'].map(f => (
                  <span key={f} className="text-[10px] font-bold text-white/70 bg-white/10 border border-white/15 px-2.5 py-1 rounded-full">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats cards */}
            <div className="flex flex-wrap gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center min-w-[88px]">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Database className="w-3 h-3 text-white/50" />
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">ທັງໝົດ</p>
                </div>
                <p className="text-3xl font-black text-white tabular-nums">{total}</p>
                <p className="text-[10px] text-white/50 mt-0.5">ງວດ</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center min-w-[88px]">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-[#6cf8bb]/70" />
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">ລ່າສຸດ</p>
                </div>
                <p className="text-3xl font-black text-[#6cf8bb] tabular-nums">{latestNum}</p>
                <p className="text-[10px] text-white/50 mt-0.5">ງວດ</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center min-w-[88px]">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Film className="w-3 h-3 text-[#f9a8d4]/70" />
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">ວິດີໂອ</p>
                </div>
                <p className="text-3xl font-black text-[#f9a8d4] tabular-nums">{withVideo}</p>
                <p className="text-[10px] text-white/50 mt-0.5">ງວດ</p>
              </div>
              {/* Per-type pills */}
              {types && types.filter(t => t.is_active != 0).map(t => {
                const color = t.color || '#003fb1'
                const cnt = draws?.filter(d => String(d.type_id) === String(t.type_id)).length ?? 0
                if (cnt === 0) return null
                return (
                  <div key={t.type_id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-4 text-center min-w-[88px]">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <p className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[90px]"
                        style={{ color: `${color}cc` }}>
                        {t.type_name}
                      </p>
                    </div>
                    <p className="text-2xl font-black text-white tabular-nums">{cnt}</p>
                    <p className="text-[10px] text-white/50 mt-0.5">ງວດ</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Archive Table ─── */}
      <ArchiveTable />
    </div>
  )
}
