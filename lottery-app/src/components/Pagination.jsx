import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="ໜ້າກ່ອນ"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Page numbers */}
      {getPages().map((p, i) =>
        p === '...'
          ? (
            <span
              key={`ellipsis-${i}`}
              className="w-8 h-8 flex items-center justify-center text-muted-foreground text-sm"
            >
              …
            </span>
          )
          : (
            <Button
              key={p}
              variant={p === page ? 'default' : 'ghost'}
              size="icon"
              className={cn(
                'h-8 w-8 rounded-full text-sm font-bold',
                p === page && 'shadow-sm'
              )}
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          )
      )}

      {/* Next */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="ໜ້າຕໍ່ໄປ"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Page size selector */}
      <div className="ml-2">
        <Select
          value={String(pageSize)}
          onValueChange={v => { onPageSizeChange(parseInt(v)); onPageChange(1) }}
        >
          <SelectTrigger className="h-8 w-[100px] rounded-full text-xs font-bold border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map(s => (
              <SelectItem key={s} value={String(s)} className="text-xs">
                {s} / ໜ້າ
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Go to page */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground ml-1">
        <span className="text-xs">ໄປໜ້າ</span>
        <Input
          type="number"
          min={1}
          max={totalPages}
          value={goInput}
          onChange={e => setGoInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleGo()}
          className="w-14 h-8 text-center rounded-full text-sm font-bold focus-visible:ring-primary px-2"
          placeholder="—"
          aria-label="ໄປໜ້າ"
        />
      </div>
    </div>
  )
}
