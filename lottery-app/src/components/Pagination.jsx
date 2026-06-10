import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const PAGE_SIZE_OPTIONS = [10, 20, 50]

export default function Pagination({ total, page, pageSize, onPageChange, onPageSizeChange }) {
  const [goInput, setGoInput] = useState('')
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages]
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [1, '...', page - 1, page, page + 1, '...', totalPages]
  }

  const handleGo = () => {
    const n = parseInt(goInput)
    if (n >= 1 && n <= totalPages) { onPageChange(n); setGoInput('') }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-6 select-none">

      {/* Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="h-8 w-8 rounded-full bg-white/[0.03] border border-white/[0.08] text-white/60 hover:bg-[#d4af37]/22 hover:text-[#ffd700] hover:border-[#d4af37]/30 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center outline-none"
        aria-label="ໜ້າກ່ອນ"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page numbers */}
      {getPages().map((p, i) =>
        p === '...'
          ? (
            <span
              key={`ellipsis-${i}`}
              className="w-8 h-8 flex items-center justify-center text-white/30 text-sm font-sans"
            >
              …
            </span>
          )
          : (
            <button
              key={p}
              className={cn(
                'h-8 w-8 rounded-full text-sm font-bold transition-all duration-200 flex items-center justify-center border outline-none font-mono',
                p === page 
                  ? 'bg-gradient-to-br from-[#ffd700] via-[#e5c158] to-[#aa7c11] text-[#0d0e1c] font-black shadow-[0_2px_8px_rgba(255,215,0,0.25)] border-[#ffd700]/30' 
                  : 'bg-white/[0.03] border-white/[0.08] text-white/60 hover:bg-[#d4af37]/22 hover:text-[#ffd700] hover:border-[#d4af37]/30'
              )}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="h-8 w-8 rounded-full bg-white/[0.03] border border-white/[0.08] text-white/60 hover:bg-[#d4af37]/22 hover:text-[#ffd700] hover:border-[#d4af37]/30 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center outline-none"
        aria-label="ໜ້າຕໍ່ໄປ"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Page size selector */}
      <div className="ml-2">
        <Select
          value={String(pageSize)}
          onValueChange={v => { onPageSizeChange(parseInt(v)); onPageChange(1) }}
        >
          <SelectTrigger className="h-8 w-[100px] rounded-full text-xs font-bold bg-[#0d0e1c]/60 border border-white/[0.08] text-white/80 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20 outline-none font-sans">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0d0e1c] border border-white/[0.08] text-white">
            {PAGE_SIZE_OPTIONS.map(s => (
              <SelectItem key={s} value={String(s)} className="text-xs focus:bg-[#d4af37]/15 focus:text-[#ffd700]">
                {s} / ໜ້າ
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Go to page */}
      <div className="flex items-center gap-2 text-sm text-white/40 ml-1 font-sans">
        <span className="text-xs">ໄປໜ້າ</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={goInput}
          onChange={e => setGoInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleGo()}
          className="w-14 h-8 text-center rounded-full text-sm font-bold bg-[#0d0e1c]/60 border border-white/[0.08] text-[#ffd700] focus:ring-1 focus:ring-[#d4af37]/30 focus:border-[#d4af37] outline-none px-2 font-mono"
          placeholder="—"
          aria-label="ໄປໜ້າ"
        />
      </div>
    </div>
  )
}
