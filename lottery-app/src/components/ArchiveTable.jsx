import { useState, useEffect, useMemo } from 'react'
import {
  Search, X, PlayCircle, ExternalLink, VideoOff,
  Loader2, CalendarDays, SlidersHorizontal, ChevronDown,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { AspectRatio }                 from '@/components/ui/aspect-ratio'
import { useData }                     from '../context/DataContext'
import { formatLaoDate }               from '../utils/date'
import { resolveAnimalImage, API }     from '../utils/api'
import Pagination                      from './Pagination'

// ── Constants ──────────────────────────────────────────────────────────────────

const LAO_MONTHS = [
  '', 'ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ',
  'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ',
]

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao+Looped:wght@300;400;500;600;700;900&display=swap');

  .at-root, .at-root * {
    font-family: 'Noto Sans Lao Looped', sans-serif;
  }

  /* ── Outer section ── */
  .at-section {
    position: relative;
    background: linear-gradient(160deg, #0F1424 0%, #0C1020 55%, #080C18 100%);
    border: 1px solid rgba(212,175,55,0.13);
    border-radius: 24px;
    padding: 28px 24px 24px;
    overflow: hidden;
  }
  .at-section::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent 5%, rgba(212,175,55,0.6) 50%, transparent 95%);
  }

  /* Decorative orbs */
  .at-deco {
    position: absolute; inset: 0; pointer-events: none; overflow: hidden;
  }
  .at-orb {
    position: absolute; border-radius: 50%; filter: blur(70px);
  }
  .at-orb-1 {
    width: 350px; height: 350px; right: -100px; top: -80px;
    background: radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%);
  }
  .at-orb-2 {
    width: 260px; height: 260px; left: -60px; bottom: -60px;
    background: radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%);
  }

  /* ── Section header ── */
  .at-header-row {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 20px;
    position: relative; z-index: 1;
  }
  @media (min-width: 640px) {
    .at-header-row { flex-direction: row; align-items: center; justify-content: space-between; }
  }
  .at-title-group { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .at-icon-box {
    width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.06) 100%);
    border: 1px solid rgba(212,175,55,0.22);
    display: flex; align-items: center; justify-content: center;
  }
  .at-label {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 9px; font-weight: 700; letter-spacing: 0.2em;
    text-transform: uppercase; color: rgba(212,175,55,0.55);
    margin-bottom: 3px;
  }
  .at-label-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #D4AF37; box-shadow: 0 0 6px rgba(212,175,55,0.7);
    animation: at-dot-pulse 2.4s ease-in-out infinite;
  }
  @keyframes at-dot-pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.5; transform:scale(0.7); }
  }
  .at-title {
    font-size: 18px; font-weight: 800;
    color: rgba(255,255,255,0.92); letter-spacing: -0.01em; line-height: 1.2;
  }
  .at-count-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 20px;
    background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.2);
    font-size: 11px; font-weight: 700; color: #fbbf24;
    flex-shrink: 0;
  }

  /* ── Search bar ── */
  .at-search-wrap { position: relative; width: 100%; }
  @media (min-width: 640px) { .at-search-wrap { width: 280px; flex-shrink: 0; } }
  .at-search-icon {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    pointer-events: none; color: rgba(212,175,55,0.4);
  }
  .at-search-input {
    width: 100%; height: 40px;
    padding: 0 36px 0 38px;
    border-radius: 20px; outline: none;
    font-size: 13px; font-weight: 500;
    font-family: 'Noto Sans Lao Looped', sans-serif;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(212,175,55,0.12);
    color: rgba(255,255,255,0.85);
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .at-search-input::placeholder { color: rgba(255,255,255,0.2); }
  .at-search-input:focus {
    border-color: rgba(212,175,55,0.38);
    box-shadow: 0 0 0 3px rgba(212,175,55,0.08);
  }
  .at-search-clear {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: rgba(255,255,255,0.28); transition: color 0.15s;
    display: flex; align-items: center;
  }
  .at-search-clear:hover { color: #f87171; }

  /* ── Type tabs row ── */
  .at-tabs-row {
    display: flex; align-items: center; gap: 8px;
    position: relative; z-index: 1;
  }
  .at-tabs-scroll {
    display: flex; align-items: center; gap: 6px;
    overflow-x: auto; flex: 1;
    padding-bottom: 2px;
    scrollbar-width: none;
  }
  .at-tabs-scroll::-webkit-scrollbar { display: none; }
  .at-tab {
    flex-shrink: 0; padding: 6px 16px; border-radius: 20px;
    font-size: 11.5px; font-weight: 700;
    font-family: 'Noto Sans Lao Looped', sans-serif;
    border: 1px solid; cursor: pointer;
    transition: all 0.18s ease; white-space: nowrap;
  }
  .at-filter-btn {
    flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px;
    height: 34px; padding: 0 14px; border-radius: 20px;
    font-size: 11.5px; font-weight: 700;
    font-family: 'Noto Sans Lao Looped', sans-serif;
    border: 1px solid; cursor: pointer;
    transition: all 0.18s ease;
  }
  .at-filter-count {
    width: 16px; height: 16px; border-radius: 50%;
    font-size: 9px; font-weight: 900;
    display: flex; align-items: center; justify-content: center;
    background: #D4AF37; color: #0C1020;
  }

  /* ── Filter panel ── */
  .at-filter-panel {
    background: rgba(212,175,55,0.03);
    border: 1px solid rgba(212,175,55,0.1);
    border-radius: 16px; padding: 14px;
    position: relative; z-index: 1;
    animation: at-panel-in 0.18s ease;
  }
  @keyframes at-panel-in {
    from { opacity:0; transform:translateY(-6px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .at-chip {
    display: inline-flex; align-items: center; gap: 5px;
    height: 34px; padding: 0 12px; border-radius: 20px;
    font-size: 11px; font-weight: 700;
    font-family: 'Noto Sans Lao Looped', sans-serif;
    background: rgba(212,175,55,0.1); color: #fbbf24;
    border: 1px solid rgba(212,175,55,0.25); cursor: pointer;
    transition: all 0.15s;
  }
  .at-chip:hover { background: rgba(212,175,55,0.18); }
  .at-chip-clear {
    background: rgba(248,113,113,0.08); color: rgba(248,113,113,0.85);
    border-color: rgba(248,113,113,0.2);
  }
  .at-chip-clear:hover { background: rgba(248,113,113,0.15); }

  /* ── Divider ── */
  .at-divider {
    height: 1px; margin: 16px 0;
    background: linear-gradient(90deg, transparent, rgba(212,175,55,0.1), transparent);
    position: relative; z-index: 1;
  }

  /* ── Loading / empty ── */
  .at-loader {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 80px 0; gap: 12px;
    position: relative; z-index: 1;
  }
  .at-loader-box {
    width: 48px; height: 48px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.16);
  }
  .at-loader-text { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.38); }

  .at-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 64px 24px; gap: 14px;
    border-radius: 20px; position: relative; z-index: 1;
    background: rgba(212,175,55,0.02); border: 1px dashed rgba(212,175,55,0.1);
  }
  .at-empty-icon {
    width: 52px; height: 52px; border-radius: 15px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(212,175,55,0.07); border: 1px solid rgba(212,175,55,0.14);
    box-shadow: 0 0 24px rgba(212,175,55,0.06);
  }
  .at-empty-title { font-size: 14px; font-weight: 800; color: rgba(255,255,255,0.75); }
  .at-empty-sub   { font-size: 12px; color: rgba(255,255,255,0.32); margin-top: 2px; }
  .at-clear-btn {
    display: inline-flex; align-items: center; gap: 6px;
    height: 36px; padding: 0 18px; border-radius: 20px;
    font-size: 12px; font-weight: 700;
    font-family: 'Noto Sans Lao Looped', sans-serif;
    background: rgba(212,175,55,0.1); color: #fbbf24;
    border: 1px solid rgba(212,175,55,0.25); cursor: pointer;
    transition: all 0.18s;
  }
  .at-clear-btn:hover {
    background: rgba(212,175,55,0.18);
    box-shadow: 0 0 16px rgba(212,175,55,0.12);
  }

  /* ── Table wrapper ── */
  .at-table-wrap {
    border-radius: 18px; overflow: hidden;
    border: 1px solid rgba(212,175,55,0.1);
    box-shadow: 0 8px 32px rgba(0,0,0,0.35);
    background: rgba(8,10,20,0.7);
    backdrop-filter: blur(12px);
    position: relative; z-index: 1;
  }

  /* ── Mobile card ── */
  .at-mob-card {
    border-radius: 18px; overflow: hidden;
    transition: transform 0.18s, box-shadow 0.18s;
  }
  .at-mob-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(0,0,0,0.45) !important;
  }

  /* ── Video button ── */
  .at-vid-btn {
    display: inline-flex; align-items: center; gap: 6px;
    height: 32px; padding: 0 12px; border-radius: 20px;
    font-size: 11px; font-weight: 700;
    font-family: 'Noto Sans Lao Looped', sans-serif;
    background: rgba(248,113,113,0.07); color: rgba(248,113,113,0.85);
    border: 1px solid rgba(248,113,113,0.2); cursor: pointer;
    transition: all 0.18s;
  }
  .at-vid-btn:hover {
    background: rgba(248,113,113,0.16);
    border-color: rgba(248,113,113,0.45);
    box-shadow: 0 0 14px rgba(248,113,113,0.18);
  }
`

// ── Helpers ────────────────────────────────────────────────────────────────────

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

function getTypeColor(typeId, types) {
  const t = types?.find(t => String(t.type_id) === String(typeId))
  return t?.color || '#D4AF37'
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function TypeBadge({ typeId, types }) {
  const t = types?.find(t => t.type_id == typeId)
  if (!t) return null
  const color = t.color || '#D4AF37'
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border whitespace-nowrap"
      style={{ color, background: `${color}0d`, borderColor: `${color}35` }}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
        style={{ background: color, boxShadow: `0 0 5px ${color}` }} />
      {t.type_name}
    </span>
  )
}

function VideoDialog({ draw, onClose }) {
  const videoId = getYouTubeId(draw?.youtube_url)
  return (
    <Dialog open={!!draw} onOpenChange={open => { if (!open) onClose() }}>
      <DialogContent
        className="max-w-2xl p-0 overflow-hidden gap-0 rounded-3xl"
        style={{
          background: '#080810',
          border: '1px solid rgba(212,175,55,0.14)',
          boxShadow: '0 32px 64px -16px rgba(0,0,0,0.9), 0 0 0 1px rgba(212,175,55,0.05)',
          fontFamily: "'Noto Sans Lao Looped', sans-serif",
        }}
      >
        <DialogHeader
          className="flex flex-row items-center gap-3.5 px-6 py-4 border-b space-y-0"
          style={{ borderColor: 'rgba(212,175,55,0.1)', background: 'rgba(212,175,55,0.025)' }}
        >
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)' }}>
            <PlayCircle className="w-4 h-4 text-rose-400 fill-current opacity-80" />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-sm font-black text-white leading-tight">
              ວິດີໂອງວດທີ {draw?.draw_number}
            </DialogTitle>
            <p className="text-[10px] font-bold mt-0.5" style={{ color: 'rgba(212,175,55,0.55)' }}>
              {formatLaoDate(draw?.draw_date, true)}
            </p>
          </div>
        </DialogHeader>

        <div className="bg-black relative">
          <AspectRatio ratio={16 / 9}>
            {videoId ? (
              <iframe
                key={videoId}
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title="Lao Lottery Video"
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <VideoOff className="w-12 h-12 text-white/20" />
                <p className="text-white/40 text-sm font-semibold">ບໍ່ພົບລິ້ງວິດີໂອ</p>
                {draw?.youtube_url && (
                  <a href={draw.youtube_url} target="_blank" rel="noopener noreferrer"
                    className="text-rose-400 text-xs hover:text-rose-300 font-bold underline">
                    ເປີດໃນ YouTube
                  </a>
                )}
              </div>
            )}
          </AspectRatio>
        </div>

        <div className="flex items-center justify-between px-6 py-3.5 border-t"
          style={{ borderColor: 'rgba(212,175,55,0.08)', background: 'rgba(212,175,55,0.02)' }}>
          <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.22)' }}>
            ກົດ ESC ຫຼື ກົດນອກ ເພື່ອປິດ
          </p>
          {draw?.youtube_url && (
            <a href={draw.youtube_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider transition-colors"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(212,175,55,0.9)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
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

function DigitTile({ char, size = 'md' }) {
  const dims = {
    sm: { width: 28, height: 36, fontSize: 13, borderRadius: 10 },
    md: { width: 32, height: 40, fontSize: 15, borderRadius: 11 },
    lg: { width: 40, height: 48, fontSize: 18, borderRadius: 13 },
  }
  const d = dims[size]
  return (
    <span style={{
      width: d.width, height: d.height,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontSize: d.fontSize, borderRadius: d.borderRadius,
      lineHeight: 1, userSelect: 'none',
      background: 'rgba(212,175,55,0.08)',
      border: '1px solid rgba(212,175,55,0.2)',
      color: '#FFD54F',
      boxShadow: '0 2px 8px rgba(212,175,55,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
      fontVariantNumeric: 'tabular-nums',
    }}>
      {char}
    </span>
  )
}

function ResultDigits({ value, size = 'md' }) {
  if (!value) return <span style={{ color: 'rgba(255,255,255,0.18)' }}>—</span>
  const chars = value.split('')
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      {chars.map((ch, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
          <DigitTile char={ch} size={size} />
          {(i === 1 || i === 3) && i < chars.length - 1 && (
            <span style={{ margin: '0 3px', fontSize: 10, fontWeight: 900, color: 'rgba(212,175,55,0.2)' }}>·</span>
          )}
        </span>
      ))}
    </span>
  )
}

function VideoButton({ row, onClick }) {
  if (!row.youtube_url) {
    return <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.14)' }}>—</span>
  }
  return (
    <button className="at-vid-btn" onClick={() => onClick(row)}>
      <PlayCircle style={{ width: 14, height: 14 }} className="fill-current opacity-80" />
      ເບິ່ງ
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ArchiveTable({ compact = false }) {
  const { draws, animals, types, yearsByType } = useData()
  const [searchTerm,     setSearchTerm]    = useState('')
  const [selectedType,   setSelectedType]  = useState('all')
  const [filterYear,     setFilterYear]    = useState('')
  const [filterMonth,    setFilterMonth]   = useState('')
  const [filterDay,      setFilterDay]     = useState('')
  const [page,           setPage]          = useState(1)
  const [pageSize,       setPageSize]      = useState(compact ? 5 : 10)
  const [videoModalDraw, setVideoModalDraw]= useState(null)
  const [filterOpen,     setFilterOpen]    = useState(false)

  const [lazyDraws,   setLazyDraws]   = useState([])
  const [lazyYear,    setLazyYear]    = useState('')
  const [lazyLoading, setLazyLoading] = useState(false)

  useEffect(() => { setPage(1) }, [searchTerm, selectedType, filterYear, filterMonth, filterDay])
  useEffect(() => { setFilterYear(''); setFilterMonth(''); setFilterDay('') }, [selectedType])
  useEffect(() => { setFilterMonth(''); setFilterDay('') }, [filterYear])
  useEffect(() => { setFilterDay('') }, [filterMonth])

  useEffect(() => {
    if (!filterYear) { setLazyDraws([]); setLazyYear(''); return }
    const inCache = draws?.some(d => d.draw_date.startsWith(filterYear))
    if (inCache) { setLazyDraws([]); setLazyYear(''); return }
    if (lazyYear === filterYear) return
    let cancelled = false
    setLazyLoading(true)
    fetch(`${API}/index.php?action=draws&year=${filterYear}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => { if (!cancelled) { setLazyDraws(Array.isArray(data) ? data : []); setLazyYear(filterYear) } })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLazyLoading(false) })
    return () => { cancelled = true }
  }, [filterYear, draws, lazyYear])

  const allDraws = useMemo(() => {
    if (lazyDraws.length > 0 && lazyYear === filterYear) return lazyDraws
    return draws || []
  }, [draws, lazyDraws, lazyYear, filterYear])

  const availableYears = useMemo(() => {
    const tid = selectedType === 'all' ? 'all' : String(selectedType)
    const fromServer = yearsByType?.[tid]
    if (fromServer?.length) return fromServer
    const src = selectedType === 'all' ? allDraws : allDraws.filter(d => String(d.type_id) === String(selectedType))
    return [...new Set(src.map(d => d.draw_date.slice(0, 4)))].sort((a, b) => b - a)
  }, [yearsByType, allDraws, selectedType])

  const availableMonths = useMemo(() => {
    let src = filterYear ? allDraws.filter(d => d.draw_date.startsWith(filterYear)) : allDraws
    if (selectedType !== 'all') src = src.filter(d => String(d.type_id) === String(selectedType))
    return [...new Set(src.map(d => parseInt(d.draw_date.slice(5, 7))))].sort((a, b) => a - b)
  }, [allDraws, filterYear, selectedType])

  const availableDays = useMemo(() => {
    let src = filterYear ? allDraws.filter(d => d.draw_date.startsWith(filterYear)) : allDraws
    if (selectedType !== 'all') src = src.filter(d => String(d.type_id) === String(selectedType))
    if (filterMonth) src = src.filter(d => d.draw_date.slice(5, 7) === filterMonth.padStart(2, '0'))
    return [...new Set(src.map(d => parseInt(d.draw_date.slice(8, 10))))].sort((a, b) => a - b)
  }, [allDraws, filterYear, filterMonth, selectedType])

  const filteredDraws = useMemo(() => {
    let result = allDraws
    if (selectedType !== 'all') result = result.filter(d => String(d.type_id) === String(selectedType))
    if (filterYear)  result = result.filter(d => d.draw_date.startsWith(filterYear))
    if (filterMonth) result = result.filter(d => d.draw_date.slice(5, 7) === filterMonth.padStart(2, '0'))
    if (filterDay)   result = result.filter(d => d.draw_date.slice(8, 10) === filterDay.padStart(2, '0'))
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase()
      result = result.filter(d =>
        d.draw_date.includes(term) ||
        String(d.draw_number).includes(term) ||
        (d.full_result || '').includes(term)
      )
    }
    return result
  }, [allDraws, selectedType, filterYear, filterMonth, filterDay, searchTerm])

  const hasAnyFilter    = !!(searchTerm || selectedType !== 'all' || filterYear || filterMonth || filterDay)
  const activeDateCount = [filterYear, filterMonth, filterDay].filter(Boolean).length

  const clearAllFilters = () => {
    setSearchTerm(''); setSelectedType('all')
    setFilterYear(''); setFilterMonth(''); setFilterDay('')
  }

  const totalPages = Math.ceil(filteredDraws.length / pageSize)
  const safePage   = Math.min(Math.max(1, page), Math.max(1, totalPages))
  const pagedDraws = filteredDraws.slice((safePage - 1) * pageSize, safePage * pageSize)
  const activeTypes = types?.filter(t => t.is_active != 0) ?? []

  // ── Loading ──────────────────────────────────────────────────────────────────

  const isLoading = !draws || draws.length === 0
  const loadingMsg = lazyLoading ? `ກຳລັງໂຫຼດຂໍ້ມູນປີ ${filterYear}...` : 'ກຳລັງໂຫຼດຂໍ້ມູນ...'

  if (isLoading || lazyLoading) {
    return (
      <div className="at-root at-section">
        <style>{STYLE}</style>
        <div className="at-deco">
          <div className="at-orb at-orb-1" />
          <div className="at-orb at-orb-2" />
        </div>
        <div className="at-loader">
          <div className="at-loader-box">
            <Loader2 style={{ width: 20, height: 20, color: '#D4AF37', animation: 'spin 1s linear infinite' }} />
          </div>
          <p className="at-loader-text">{loadingMsg}</p>
        </div>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <VideoDialog draw={videoModalDraw} onClose={() => setVideoModalDraw(null)} />

      <section className="at-root at-section">
        <style>{STYLE}</style>

        {/* Background */}
        <div className="at-deco">
          <div className="at-orb at-orb-1" />
          <div className="at-orb at-orb-2" />
        </div>

        {/* ── Header: title + search ── */}
        <div className="at-header-row">
          <div className="at-title-group">
            <div className="at-icon-box">
              <CalendarDays style={{ width: 18, height: 18, color: '#D4AF37' }} />
            </div>
            <div>
              <div className="at-label">
                <span className="at-label-dot" />
                Archive
              </div>
              <h3 className="at-title">ຜົນທັງໝົດ</h3>
            </div>
            <div className="at-count-chip">
              {filteredDraws.length} ງວດ
            </div>
          </div>

          {/* Search */}
          <div className="at-search-wrap">
            <Search className="at-search-icon" style={{ width: 15, height: 15 }} />
            <input
              type="text"
              placeholder="ຄົ້ນຫາວັນທີ, ງວດ, ເລກ..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="at-search-input"
            />
            {searchTerm && (
              <button className="at-search-clear" onClick={() => setSearchTerm('')}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>
        </div>

        {/* ── Type tabs + filter toggle ── */}
        <div className="at-tabs-row">
          <div className="at-tabs-scroll">
            <button
              className="at-tab"
              onClick={() => setSelectedType('all')}
              style={
                selectedType === 'all'
                  ? { background: 'rgba(212,175,55,0.18)', color: '#fbbf24', borderColor: 'rgba(212,175,55,0.4)', boxShadow: '0 0 14px rgba(212,175,55,0.1)' }
                  : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.38)', borderColor: 'rgba(255,255,255,0.07)' }
              }
            >
              ທັງໝົດ
            </button>
            {activeTypes.map(t => {
              const color  = t.color || '#D4AF37'
              const active = String(selectedType) === String(t.type_id)
              return (
                <button key={t.type_id} className="at-tab"
                  onClick={() => setSelectedType(String(t.type_id))}
                  style={
                    active
                      ? { background: `${color}22`, color, borderColor: `${color}55`, boxShadow: `0 0 14px ${color}18` }
                      : { background: 'rgba(255,255,255,0.03)', color: `${color}80`, borderColor: `${color}28` }
                  }
                >
                  {t.type_name}
                </button>
              )
            })}
          </div>

          <button
            className="at-filter-btn"
            onClick={() => setFilterOpen(v => !v)}
            style={
              filterOpen || activeDateCount > 0
                ? { background: 'rgba(212,175,55,0.12)', color: '#fbbf24', borderColor: 'rgba(212,175,55,0.35)' }
                : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.08)' }
            }
          >
            <SlidersHorizontal style={{ width: 13, height: 13 }} />
            ຕົວກອງ
            {activeDateCount > 0 && <span className="at-filter-count">{activeDateCount}</span>}
            <ChevronDown
              style={{ width: 13, height: 13, transition: 'transform 0.2s', transform: filterOpen ? 'rotate(180deg)' : 'none' }}
            />
          </button>
        </div>

        {/* ── Filter panel ── */}
        {filterOpen && (
          <div className="at-filter-panel" style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
              {/* Year */}
              <Select value={filterYear || '__all__'} onValueChange={v => setFilterYear(v === '__all__' ? '' : v)}>
                <SelectTrigger className="h-9 w-36 text-xs font-extrabold rounded-2xl border transition-all"
                  style={
                    filterYear
                      ? { borderColor: 'rgba(212,175,55,0.5)', color: '#fbbf24', background: 'rgba(212,175,55,0.1)' }
                      : { borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.03)' }
                  }
                >
                  <SelectValue placeholder="ປີທັງໝົດ" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="__all__" className="text-xs font-extrabold rounded-xl">ປີ (ທັງໝົດ)</SelectItem>
                  {availableYears.map(y => (
                    <SelectItem key={y} value={y} className="text-xs font-extrabold rounded-xl">{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Month */}
              <Select value={filterMonth || '__all__'} onValueChange={v => setFilterMonth(v === '__all__' ? '' : v)}>
                <SelectTrigger className="h-9 w-40 text-xs font-extrabold rounded-2xl border transition-all"
                  style={
                    filterMonth
                      ? { borderColor: 'rgba(212,175,55,0.5)', color: '#fbbf24', background: 'rgba(212,175,55,0.1)' }
                      : { borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.03)' }
                  }
                >
                  <SelectValue placeholder="ເດືອນທັງໝົດ" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="__all__" className="text-xs font-extrabold rounded-xl">ເດືອນ (ທັງໝົດ)</SelectItem>
                  {availableMonths.map(m => (
                    <SelectItem key={m} value={String(m)} className="text-xs font-extrabold rounded-xl">
                      {LAO_MONTHS[m]} ({m.toString().padStart(2, '0')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Day */}
              <Select value={filterDay || '__all__'} onValueChange={v => setFilterDay(v === '__all__' ? '' : v)}>
                <SelectTrigger className="h-9 w-36 text-xs font-extrabold rounded-2xl border transition-all"
                  style={
                    filterDay
                      ? { borderColor: 'rgba(212,175,55,0.5)', color: '#fbbf24', background: 'rgba(212,175,55,0.1)' }
                      : { borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.03)' }
                  }
                >
                  <SelectValue placeholder="ວັນທັງໝົດ" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="__all__" className="text-xs font-extrabold rounded-xl">ວັນ (ທັງໝົດ)</SelectItem>
                  {availableDays.map(d => (
                    <SelectItem key={d} value={String(d)} className="text-xs font-extrabold rounded-xl">
                      {d.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Active chips */}
              {filterYear && (
                <button className="at-chip" onClick={() => setFilterYear('')}>
                  {filterYear} <X style={{ width: 11, height: 11 }} />
                </button>
              )}
              {filterMonth && (
                <button className="at-chip" onClick={() => setFilterMonth('')}>
                  {LAO_MONTHS[parseInt(filterMonth)]} <X style={{ width: 11, height: 11 }} />
                </button>
              )}
              {filterDay && (
                <button className="at-chip" onClick={() => setFilterDay('')}>
                  ວັນທີ {filterDay.padStart(2, '0')} <X style={{ width: 11, height: 11 }} />
                </button>
              )}
              {hasAnyFilter && (
                <button className="at-chip at-chip-clear" onClick={clearAllFilters}>
                  <X style={{ width: 12, height: 12 }} />
                  ລ້າງທຸກ
                </button>
              )}
            </div>
          </div>
        )}

        <div className="at-divider" />

        {/* ══════════════════════════════════════════════
            MOBILE: Card grid  (hidden on md+)
        ══════════════════════════════════════════════ */}
        <div className="md:hidden flex flex-col" style={{ gap: 10 }}>
          {pagedDraws.map(row => {
            const typeColor      = getTypeColor(row.type_id, types)
            const twoDigitResult = row.results_detail?.find(r => r.prize_type === '2_digits')
            const animal         = animals.find(a => String(a.animal_id) === String(twoDigitResult?.animal_id))
            const animalImg      = resolveAnimalImage(animal)

            return (
              <div key={row.draw_id} className="at-mob-card"
                style={{
                  background: 'rgba(10,10,20,0.75)',
                  border: `1px solid ${typeColor}1a`,
                  borderLeft: `3px solid ${typeColor}`,
                  boxShadow: `0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 16px 10px' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.9)', lineHeight: 1.3 }}>
                      {formatLaoDate(row.draw_date, true)}
                    </p>
                    <p style={{ fontSize: 11, marginTop: 2, fontWeight: 600, color: `${typeColor}80` }}>
                      ງວດທີ {row.draw_number}
                    </p>
                  </div>
                  {activeTypes.length > 1 && <TypeBadge typeId={row.type_id} types={types} />}
                </div>

                <div style={{
                  margin: '0 16px 10px', borderRadius: 14, padding: '10px 6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                  background: `radial-gradient(ellipse at 50% 50%, ${typeColor}08 0%, transparent 70%)`,
                  border: `1px solid ${typeColor}12`,
                }}>
                  {(row.full_result || '------').split('').map((ch, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <DigitTile char={ch} size="lg" />
                      {(i === 1 || i === 3) && i < 5 && (
                        <span style={{ margin: '0 3px', fontSize: 11, fontWeight: 900, color: 'rgba(212,175,55,0.2)' }}>·</span>
                      )}
                    </span>
                  ))}
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 16px 14px',
                  borderTop: `1px solid ${typeColor}12`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    {animalImg && (
                      <img src={animalImg} alt={animal?.animal_name_lao}
                        style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'contain', padding: 4, flexShrink: 0, background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.14)' }}
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {animal?.animal_name_lao ?? '—'}
                      </p>
                      {twoDigitResult?.result_value && (
                        <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(212,175,55,0.55)', marginTop: 1 }}>
                          {twoDigitResult.result_value}
                        </p>
                      )}
                    </div>
                  </div>
                  <VideoButton row={row} onClick={setVideoModalDraw} />
                </div>
              </div>
            )
          })}
        </div>

        {/* ══════════════════════════════════════════════
            DESKTOP: Table  (hidden on < md)
        ══════════════════════════════════════════════ */}
        <div className="hidden md:block at-table-wrap">
          <Table>
            <TableHeader>
              <TableRow className="border-b hover:bg-transparent" style={{
                borderColor: 'rgba(212,175,55,0.1)',
                background: 'rgba(212,175,55,0.04)',
                position: 'sticky', top: 0, zIndex: 10,
              }}>
                {[
                  { label: '#',              cls: 'w-10' },
                  { label: 'ງວດວັນທີ',       cls: '' },
                  ...(activeTypes.length > 1 ? [{ label: 'ປະເພດ', cls: 'hidden sm:table-cell' }] : []),
                  { label: 'ເລກທີ່ອອກ',      cls: '' },
                  { label: 'ນາມສັດ (2 ຕົວ)', cls: '' },
                  { label: 'ວິດີໂອ',          cls: 'text-center' },
                ].map(({ label, cls }) => (
                  <TableHead key={label} className={`${cls} text-[9.5px] uppercase tracking-widest font-black`}
                    style={{ color: 'rgba(212,175,55,0.5)' }}>
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {pagedDraws.map((row, idx) => {
                const typeColor      = getTypeColor(row.type_id, types)
                const twoDigitResult = row.results_detail?.find(r => r.prize_type === '2_digits')
                const animal         = animals.find(a => String(a.animal_id) === String(twoDigitResult?.animal_id))
                const animalImg      = resolveAnimalImage(animal)
                const rowNum         = (safePage - 1) * pageSize + idx + 1
                const isEven         = idx % 2 === 1

                return (
                  <TableRow
                    key={row.draw_id}
                    className="border-b transition-all duration-150 cursor-default"
                    style={{
                      borderColor: 'rgba(212,175,55,0.06)',
                      background: isEven ? 'rgba(255,255,255,0.012)' : 'transparent',
                      borderLeft: `2px solid ${typeColor}28`,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(212,175,55,0.04)'
                      e.currentTarget.style.borderLeft = `3px solid ${typeColor}`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = isEven ? 'rgba(255,255,255,0.012)' : 'transparent'
                      e.currentTarget.style.borderLeft = `2px solid ${typeColor}28`
                    }}
                  >
                    <TableCell className="w-10 text-[11px] font-extrabold"
                      style={{ color: 'rgba(212,175,55,0.22)', fontVariantNumeric: 'tabular-nums' }}>
                      {rowNum}
                    </TableCell>

                    <TableCell>
                      <p style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.88)', lineHeight: 1.3 }}>
                        {formatLaoDate(row.draw_date, true)}
                      </p>
                      <p style={{ fontSize: 11, marginTop: 2, fontWeight: 600, color: `${typeColor}70` }}>
                        ງວດທີ {row.draw_number}
                      </p>
                    </TableCell>

                    {activeTypes.length > 1 && (
                      <TableCell className="hidden sm:table-cell">
                        <TypeBadge typeId={row.type_id} types={types} />
                      </TableCell>
                    )}

                    <TableCell>
                      <ResultDigits value={row.full_result} size="md" />
                    </TableCell>

                    <TableCell>
                      {animal ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {animalImg && (
                            <img src={animalImg} alt={animal.animal_name_lao}
                              style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'contain', padding: 4, flexShrink: 0, background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.12)' }}
                              onError={e => { e.target.style.display = 'none' }}
                            />
                          )}
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.85)', lineHeight: 1.3 }}>
                              {animal.animal_name_lao}
                            </p>
                            <p style={{ fontSize: 11, marginTop: 2, fontWeight: 700, color: 'rgba(212,175,55,0.52)' }}>
                              {twoDigitResult?.result_value}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.16)' }}>—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <VideoButton row={row} onClick={setVideoModalDraw} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* ── Empty state ── */}
        {filteredDraws.length === 0 && hasAnyFilter && (
          <div className="at-empty">
            <div className="at-empty-icon">
              <Search style={{ width: 22, height: 22, color: 'rgba(212,175,55,0.6)' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p className="at-empty-title">ບໍ່ພົບຂໍ້ມູນທີ່ກົງກັນ</p>
              <p className="at-empty-sub">ລອງປ່ຽນຄ່າ filter ຫຼືລ້າງການຄົ້ນຫາ</p>
            </div>
            <button className="at-clear-btn" onClick={clearAllFilters}>
              <X style={{ width: 13, height: 13 }} />
              ລ້າງທຸກ filter
            </button>
          </div>
        )}

        {/* ── Pagination ── */}
        {filteredDraws.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Pagination
              total={filteredDraws.length}
              page={safePage}
              pageSize={pageSize}
              onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              onPageSizeChange={s => { setPageSize(s); setPage(1) }}
            />
          </div>
        )}
      </section>
    </>
  )
}
