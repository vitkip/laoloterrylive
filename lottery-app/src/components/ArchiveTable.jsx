import { useState, useEffect, useMemo } from 'react'
import { Search, X, PlayCircle, ExternalLink, VideoOff, Loader2, CalendarDays, SlidersHorizontal } from 'lucide-react'
import { useData } from '../context/DataContext'
import { formatLaoDate } from '../utils/date'
import { resolveAnimalImage } from '../utils/api'
import Pagination from './Pagination'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ── Type Badge ─────────────────────────────────────────────────────
function TypeBadge({ typeId, types }) {
  const t = types?.find(t => t.type_id == typeId)
  if (!t) return null
  const color = t.color || '#003fb1'
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap"
      style={{ color, background: `${color}15`, borderColor: `${color}40` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {t.type_name}
    </span>
  )
}
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

// ── Constants ─────────────────────────────────────────────────────

const LAO_MONTHS = [
  '', 'ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ',
  'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ'
]

// ── Main component ─────────────────────────────────────────────────

export default function ArchiveTable({ compact = false }) {
  const { draws, animals, types, yearsByType } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [filterYear, setFilterYear] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterDay, setFilterDay] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(compact ? 5 : 10)
  const [videoModalDraw, setVideoModalDraw] = useState(null)

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [searchTerm, selectedType, filterYear, filterMonth, filterDay])

  // Reset month/day when year changes (avoid stale selection)
  useEffect(() => { setFilterMonth(''); setFilterDay('') }, [filterYear])
  // Reset day when month changes
  useEffect(() => { setFilterDay('') }, [filterMonth])

  // ── Available options derived from data (must be before early return) ──
  const availableYears = useMemo(() => {
    if (yearsByType?.all?.length) return yearsByType.all;
    return draws ? [...new Set(draws.map(d => d.draw_date.slice(0, 4)))].sort((a, b) => b - a) : [];
  }, [yearsByType, draws])

  const availableMonths = useMemo(() => {
    if (!draws) return []
    const src = filterYear ? draws.filter(d => d.draw_date.startsWith(filterYear)) : draws
    return [...new Set(src.map(d => parseInt(d.draw_date.slice(5, 7))))].sort((a, b) => a - b)
  }, [draws, filterYear])

  const availableDays = useMemo(() => {
    if (!draws) return []
    let src = filterYear ? draws.filter(d => d.draw_date.startsWith(filterYear)) : draws
    if (filterMonth) src = src.filter(d => d.draw_date.slice(5, 7) === filterMonth.padStart(2, '0'))
    return [...new Set(src.map(d => parseInt(d.draw_date.slice(8, 10))))].sort((a, b) => a - b)
  }, [draws, filterYear, filterMonth])

  if (!draws || draws.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
      </div>
    )
  }

  const hasDateFilter = filterYear || filterMonth || filterDay
  const hasAnyFilter = searchTerm || selectedType !== 'all' || hasDateFilter

  const clearAllFilters = () => {
    setSearchTerm(''); setSelectedType('all')
    setFilterYear(''); setFilterMonth(''); setFilterDay('')
  }

  const filteredDraws = draws.filter(d => {
    const matchType = selectedType === 'all' || String(d.type_id) === String(selectedType)
    if (!matchType) return false

    const [yyyy, mm, dd] = d.draw_date.split('-')
    if (filterYear && yyyy !== filterYear) return false
    if (filterMonth && mm !== filterMonth.padStart(2, '0')) return false
    if (filterDay && dd !== filterDay.padStart(2, '0')) return false

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

      <section className="space-y-5">

        {/* ─── Section Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#003fb1]/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-[#003fb1]" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-foreground">ຜົນທັງໝົດ</h3>
            <Badge variant="secondary" className="text-primary font-bold text-xs px-2.5">
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

        {/* ─── Filter Bar ─── */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3.5">

          {/* Type Filter Tabs */}
          {types && types.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 w-20">ປະເພດ</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedType === 'all'
                      ? 'bg-[#003fb1] text-white border-[#003fb1] shadow-sm'
                      : 'bg-background text-muted-foreground border-border hover:border-[#003fb1]/40 hover:text-foreground'
                  }`}
                >
                  ທັງໝົດ
                </button>
                {types.filter(t => t.is_active != 0).map(t => {
                  const color = t.color || '#003fb1'
                  const active = String(selectedType) === String(t.type_id)
                  return (
                    <button
                      key={t.type_id}
                      onClick={() => setSelectedType(String(t.type_id))}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all"
                      style={active
                        ? { background: color, color: '#fff', borderColor: color, boxShadow: `0 2px 8px ${color}30` }
                        : { background: 'transparent', color, borderColor: `${color}50` }
                      }
                    >
                      {t.type_name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Divider */}
          {types && types.length > 1 && (
            <div className="h-px bg-border" />
          )}

          {/* Date Filter Row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 w-20 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ວັນທີ</span>
            </div>

            {/* Year */}
            <Select value={filterYear || '__all__'} onValueChange={v => setFilterYear(v === '__all__' ? '' : v)}>
              <SelectTrigger className={`h-8 w-36 text-xs font-bold rounded-xl border transition-all ${
                filterYear ? 'border-[#003fb1] text-[#003fb1] bg-[#eff3ff] dark:bg-[#1e2d4a]' : 'border-border'
              }`}>
                <SelectValue placeholder="ປີທັງໝົດ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__" className="text-xs font-bold">ປີ (ທັງໝົດ)</SelectItem>
                {availableYears.map(y => (
                  <SelectItem key={y} value={y} className="text-xs font-bold">{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Month */}
            <Select value={filterMonth || '__all__'} onValueChange={v => setFilterMonth(v === '__all__' ? '' : v)}>
              <SelectTrigger className={`h-8 w-40 text-xs font-bold rounded-xl border transition-all ${
                filterMonth ? 'border-[#003fb1] text-[#003fb1] bg-[#eff3ff] dark:bg-[#1e2d4a]' : 'border-border'
              }`}>
                <SelectValue placeholder="ເດືອນທັງໝົດ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__" className="text-xs font-bold">ເດືອນ (ທັງໝົດ)</SelectItem>
                {availableMonths.map(m => (
                  <SelectItem key={m} value={String(m)} className="text-xs font-bold">
                    {LAO_MONTHS[m]} ({m.toString().padStart(2, '0')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Day */}
            <Select value={filterDay || '__all__'} onValueChange={v => setFilterDay(v === '__all__' ? '' : v)}>
              <SelectTrigger className={`h-8 w-36 text-xs font-bold rounded-xl border transition-all ${
                filterDay ? 'border-[#003fb1] text-[#003fb1] bg-[#eff3ff] dark:bg-[#1e2d4a]' : 'border-border'
              }`}>
                <SelectValue placeholder="ວັນທັງໝົດ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__" className="text-xs font-bold">ວັນ (ທັງໝົດ)</SelectItem>
                {availableDays.map(d => (
                  <SelectItem key={d} value={String(d)} className="text-xs font-bold">
                    {d.toString().padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Active filter chips */}
            <div className="flex items-center gap-1.5 ml-1 flex-wrap">
              {filterYear && (
                <button
                  onClick={() => setFilterYear('')}
                  className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#003fb1]/10 text-[#003fb1] border border-[#003fb1]/25 text-[11px] font-bold hover:bg-[#003fb1]/20 transition-colors"
                >
                  {filterYear} <X className="w-3 h-3" />
                </button>
              )}
              {filterMonth && (
                <button
                  onClick={() => setFilterMonth('')}
                  className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#003fb1]/10 text-[#003fb1] border border-[#003fb1]/25 text-[11px] font-bold hover:bg-[#003fb1]/20 transition-colors"
                >
                  {LAO_MONTHS[parseInt(filterMonth)]} <X className="w-3 h-3" />
                </button>
              )}
              {filterDay && (
                <button
                  onClick={() => setFilterDay('')}
                  className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#003fb1]/10 text-[#003fb1] border border-[#003fb1]/25 text-[11px] font-bold hover:bg-[#003fb1]/20 transition-colors"
                >
                  ວັນທີ {filterDay.toString().padStart(2, '0')} <X className="w-3 h-3" />
                </button>
              )}
              {hasAnyFilter && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-destructive/8 text-destructive border border-destructive/20 text-[11px] font-bold hover:bg-destructive/15 transition-colors"
                >
                  <X className="w-3 h-3" />
                  ລ້າງທຸກ
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── Table ─── */}
        <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60 border-border">
                <TableHead className="w-10 text-[10px] uppercase tracking-widest">#</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest">ງວດວັນທີ</TableHead>
                {types && types.length > 1 && (
                  <TableHead className="text-[10px] uppercase tracking-widest hidden sm:table-cell">ປະເພດ</TableHead>
                )}
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

                    {/* Type badge */}
                    {types && types.length > 1 && (
                      <TableCell className="hidden sm:table-cell">
                        <TypeBadge typeId={row.type_id} types={types} />
                      </TableCell>
                    )}

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

        {/* ─── Empty state ─── */}
        {filteredDraws.length === 0 && (
          hasAnyFilter ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-bold text-muted-foreground">ບໍ່ພົບຂໍ້ມູນທີ່ກົງກັນ</p>
              <p className="text-xs text-muted-foreground/70">ລອງປ່ຽນຄ່າ filter ຫຼືລ້າງການຄົ້ນຫາ</p>
              <Button variant="outline" size="sm" onClick={clearAllFilters} className="gap-1.5 rounded-xl mt-1">
                <X className="w-3.5 h-3.5" />
                ລ້າງທຸກ filter
              </Button>
            </div>
          ) : null
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
