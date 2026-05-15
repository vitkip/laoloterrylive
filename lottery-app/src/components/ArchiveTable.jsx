import { useState, useEffect } from 'react'
import { Search, X, PlayCircle, ExternalLink, VideoOff, Loader2 } from 'lucide-react'
import { useData } from '../context/DataContext'
import { formatLaoDate } from '../utils/date'
import { resolveAnimalImage } from '../utils/api'
import Pagination from './Pagination'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ── Helpers ────────────────────────────────────────────────────────

function getYouTubeId(url) {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

// ── Video Dialog ───────────────────────────────────────────────────

function VideoDialog({ draw, onClose }) {
  const videoId = getYouTubeId(draw?.youtube_url)

  return (
    <Dialog open={!!draw} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-[#0d1829] border-white/10 gap-0">
        <DialogHeader className="flex flex-row items-center gap-3 px-5 py-4 border-b border-white/10 space-y-0">
          <div className="w-8 h-8 rounded-xl bg-destructive/20 flex items-center justify-center shrink-0">
            <PlayCircle className="w-4 h-4 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-sm font-extrabold text-white leading-tight">
              ວິດີໂອງວດທີ {draw?.draw_number}
            </DialogTitle>
            <p className="text-[11px] text-white/50 mt-0.5">
              {formatLaoDate(draw?.draw_date, true)}
            </p>
          </div>
        </DialogHeader>

        {/* Video embed */}
        <div className="bg-black">
          <AspectRatio ratio={16 / 9}>
            {videoId ? (
              <iframe
                key={videoId}
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title="Lao Lottery Video"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <VideoOff className="w-12 h-12 text-white/30" />
                <p className="text-white/40 text-sm">ບໍ່ພົບລິ້ງວິດີໂອ</p>
                {draw?.youtube_url && (
                  <a
                    href={draw.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-destructive text-xs underline"
                  >
                    ເປີດໃນ YouTube
                  </a>
                )}
              </div>
            )}
          </AspectRatio>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
          <p className="text-[11px] text-white/40">ກົດ ESC ຫຼື ກົດນອກ ເພື່ອປິດ</p>
          {draw?.youtube_url && (
            <a
              href={draw.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] font-bold text-white/60 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              ເປີດໃນ YouTube
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Digit display ──────────────────────────────────────────────────

function DigitPair({ value }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {value.split('').map((d, i) => (
        <span
          key={i}
          className="w-6 h-8 flex items-center justify-center rounded-md bg-secondary text-primary text-sm font-black"
        >
          {d}
        </span>
      ))}
    </span>
  )
}

// ── Empty search state ─────────────────────────────────────────────

function EmptySearch({ term, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
        <Search className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-bold text-muted-foreground">ບໍ່ພົບຂໍ້ມູນສຳລັບ</p>
      <p className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full font-mono">
        "{term}"
      </p>
      <Button variant="link" size="sm" onClick={onClear} className="text-primary">
        ລ້າງການຄົ້ນຫາ
      </Button>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────

export default function ArchiveTable() {
  const { draws, animals } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [videoModalDraw, setVideoModalDraw] = useState(null)

  // Reset to page 1 when search changes
  useEffect(() => { setPage(1) }, [searchTerm])

  if (!draws || draws.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
      </div>
    )
  }

  const filteredDraws = draws.filter(d => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase().trim()
    return (
      d.full_result.includes(term) ||
      formatLaoDate(d.draw_date, true).toLowerCase().includes(term) ||
      d.draw_number.toString().includes(term)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filteredDraws.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pagedDraws = filteredDraws.slice((safePage - 1) * pageSize, safePage * pageSize)

  return (
    <>
      <VideoDialog draw={videoModalDraw} onClose={() => setVideoModalDraw(null)} />

      <section className="space-y-4">

        {/* ─── Toolbar ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

          {/* Title + count */}
          <div className="flex items-center gap-2.5">
            <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#003fb1] to-[#1a56db]" />
            <h3 className="text-base sm:text-lg font-extrabold text-foreground">ຜົນທັງໝົດ</h3>
            <Badge variant="secondary" className="text-primary font-bold">
              {filteredDraws.length} ງວດ
            </Badge>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="ຄົ້ນຫາວັນທີ, ງວດ, ເລກ..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 focus-visible:ring-primary"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive transition-colors"
                aria-label="ລ້າງ"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ─── Table ─── */}
        <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60 border-border">
                <TableHead className="w-10 text-[10px] uppercase tracking-widest">#</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest">ງວດວັນທີ</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest">ເລກທີ່ອອກ</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest">ນາມສັດ (2 ຕົວ)</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-center">ວິດີໂອ</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pagedDraws.map((row, idx) => {
                const twoDigitResult = row.results_detail?.find(r => r.prize_type === '2_digits')
                const animal = animals.find(a => String(a.animal_id) === String(twoDigitResult?.animal_id))
                const animalImg = resolveAnimalImage(animal)
                const pairs = row.full_result.length >= 6
                  ? [row.full_result.slice(0, 2), row.full_result.slice(2, 4), row.full_result.slice(4, 6)]
                  : []
                const rowNum = (safePage - 1) * pageSize + idx + 1

                return (
                  <TableRow
                    key={row.draw_id}
                    className="group border-border hover:bg-accent/40 transition-colors duration-150"
                  >
                    {/* Row number */}
                    <TableCell className="text-[11px] font-bold text-muted-foreground/60 w-10">
                      {rowNum}
                    </TableCell>

                    {/* Date + draw number */}
                    <TableCell>
                      <p className="text-sm font-bold text-foreground leading-tight">
                        {formatLaoDate(row.draw_date, true)}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 mt-0.5 font-medium">
                        ງວດທີ {row.draw_number}
                      </p>
                    </TableCell>

                    {/* Result digits */}
                    <TableCell>
                      {pairs.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          {pairs.map((pair, i) => (
                            <div key={i} className="flex items-center gap-0.5">
                              <DigitPair value={pair} />
                              {i < pairs.length - 1 && (
                                <span className="mx-0.5 text-border text-xs font-black">·</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-base font-black text-primary font-mono">
                          {row.full_result}
                        </span>
                      )}
                    </TableCell>

                    {/* Animal */}
                    <TableCell>
                      {animal ? (
                        <div className="flex items-center gap-2">
                          {animalImg && (
                            <img
                              src={animalImg}
                              alt={animal.animal_name_lao}
                              className="w-8 h-8 rounded-lg object-contain bg-secondary p-0.5 shrink-0"
                              onError={e => { e.target.style.display = 'none' }}
                            />
                          )}
                          <div>
                            <p className="text-sm font-bold text-foreground leading-tight">
                              {animal.animal_name_lao}
                            </p>
                            <p className="text-[11px] text-muted-foreground/70 font-medium tabular-nums">
                              {twoDigitResult.result_value}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/30 text-sm">—</span>
                      )}
                    </TableCell>

                    {/* Video button */}
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVideoModalDraw(row)}
                        className="gap-1.5 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 text-[11px] h-7 px-2.5"
                      >
                        <PlayCircle className="w-3.5 h-3.5 fill-current opacity-80" />
                        ເບິ່ງ
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* ─── Empty search state ─── */}
        {searchTerm && filteredDraws.length === 0 && (
          <EmptySearch term={searchTerm} onClear={() => setSearchTerm('')} />
        )}

        {/* ─── Pagination ─── */}
        {filteredDraws.length > 0 && (
          <Pagination
            total={filteredDraws.length}
            page={safePage}
            pageSize={pageSize}
            onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            onPageSizeChange={s => { setPageSize(s); setPage(1) }}
          />
        )}
      </section>
    </>
  )
}
