import { Archive, Database } from 'lucide-react'
import { useData } from '../context/DataContext'
import ArchiveTable from '../components/ArchiveTable'

export default function HistoryPage() {
  const { draws } = useData()
  const total = draws?.length ?? 0
  const latestNum = draws?.[0]?.draw_number ?? '-'

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ─── Hero Banner ─── */}
      <div className="relative rounded-3xl overflow-hidden">
        {/* gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#001d6e] via-[#003fb1] to-[#1a56db]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(108,248,187,0.15),transparent_60%)]" />
        {/* watermark */}
        <div className="absolute right-0 bottom-0 text-[8rem] sm:text-[11rem] font-black text-white/[0.04] leading-none select-none pointer-events-none pr-4 pb-1">
          LAO
        </div>

        <div className="relative z-10 px-8 sm:px-10 py-9 sm:py-11 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3.5 py-1 mb-4">
              <Archive className="w-3.5 h-3.5 text-[#6cf8bb]" />
              <span className="text-white/90 text-[11px] font-bold uppercase tracking-widest">Archive</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-2">
              ປະຫວັດຍ້ອນຫຼັງ
            </h1>
            <p className="text-white/60 text-sm max-w-md leading-relaxed">
              ກວດສອບຜົນຫວຍທັງໝົດທີ່ເຄີຍອອກ ລວມເຖິງວິດີໂອການອອກລາງວັນ
            </p>
          </div>

          {/* Stats cards */}
          <div className="flex gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-center min-w-[80px]">
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                <Database className="w-3 h-3" />
                ທັງໝົດ
              </p>
              <p className="text-2xl font-black text-white tabular-nums">{total}</p>
              <p className="text-[10px] text-white/50 mt-0.5">ງວດ</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-center min-w-[80px]">
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1">ລ່າສຸດ</p>
              <p className="text-2xl font-black text-[#6cf8bb] tabular-nums">{latestNum}</p>
              <p className="text-[10px] text-white/50 mt-0.5">ງວດ</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Archive Table ─── */}
      <ArchiveTable />
    </div>
  )
}
