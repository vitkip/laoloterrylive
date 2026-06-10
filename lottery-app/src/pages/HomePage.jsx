import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { API, resolveUploadUrl } from '../utils/api'
import { useStatistics } from '../hooks/useStatistics'
import { computeAnalytics, computeCombinedTop10, COMBINED_SIGNALS, buildArticle } from '../utils/analytics'
import ResultCard from '../components/ResultCard'
import LiveVdoBanner from '../components/LiveVdoBanner'
import { resolveAnimalImage } from '../utils/api'
import SEO from '../components/SEO'
import { websiteSchema, lotteryResultSchema, breadcrumbSchema } from '../components/schemas'

/* ─── Lottery ball gradient helpers ──────────────────────────── */
const HOT_BALL = [
  { bg: 'radial-gradient(circle at 35% 30%, #fde68a 0%, #f59e0b 42%, #b45309 78%, #78350f 100%)', glow: 'rgba(245,158,11,0.6)', txt: '#78350f' },
  { bg: 'radial-gradient(circle at 35% 30%, #fde68a 0%, #f59e0b 42%, #b45309 78%, #78350f 100%)', glow: 'rgba(245,158,11,0.5)', txt: '#78350f' },
  { bg: 'radial-gradient(circle at 35% 30%, #fed7aa 0%, #ea580c 42%, #9a3412 78%, #7c2d12 100%)', glow: 'rgba(234,88,12,0.5)', txt: '#fff' },
  { bg: 'radial-gradient(circle at 35% 30%, #fed7aa 0%, #ea580c 42%, #9a3412 78%, #7c2d12 100%)', glow: 'rgba(234,88,12,0.4)', txt: '#fff' },
  { bg: 'radial-gradient(circle at 35% 30%, #fed7aa 0%, #ea580c 42%, #9a3412 78%, #7c2d12 100%)', glow: 'rgba(234,88,12,0.35)', txt: '#fff' },
  { bg: 'radial-gradient(circle at 35% 30%, #fca5a5 0%, #dc2626 42%, #7f1d1d 78%, #450a0a 100%)', glow: 'rgba(220,38,38,0.5)', txt: '#fff' },
  { bg: 'radial-gradient(circle at 35% 30%, #fca5a5 0%, #dc2626 42%, #7f1d1d 78%, #450a0a 100%)', glow: 'rgba(220,38,38,0.4)', txt: '#fff' },
  { bg: 'radial-gradient(circle at 35% 30%, #fca5a5 0%, #dc2626 42%, #7f1d1d 78%, #450a0a 100%)', glow: 'rgba(220,38,38,0.3)', txt: '#fff' },
];

const PAGE_STYLE = `
  /* Keyframes for premium animations */
  @keyframes float-ball-1 {
    0% { transform: translateY(0px) rotate(0deg) scale(1); }
    50% { transform: translateY(-20px) rotate(180deg) scale(1.05); }
    100% { transform: translateY(0px) rotate(360deg) scale(1); }
  }
  @keyframes float-ball-2 {
    0% { transform: translateY(0px) rotate(0deg) scale(0.9); }
    50% { transform: translateY(25px) rotate(-180deg) scale(1.02); }
    100% { transform: translateY(0px) rotate(-360deg) scale(0.9); }
  }
  @keyframes pulse-soft {
    0%, 100% { opacity: 0.25; transform: scale(1); }
    50% { opacity: 0.45; transform: scale(1.05); }
  }

  /* hot-ball specular */
  .hp-ball-wrap { position: relative; }
  .hp-ball { 
    border-radius: 50%; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-weight: 900; 
    position: relative; 
    overflow: hidden; 
    flex-shrink: 0;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .hp-ball::after { 
    content: ''; 
    position: absolute; 
    top: 6%; 
    left: 12%; 
    width: 40%; 
    height: 30%; 
    background: radial-gradient(ellipse, rgba(255,255,255,0.7) 0%, transparent 80%); 
    border-radius: 50%; 
  }
  .hp-ball:hover {
    transform: scale(1.18) rotate(15deg);
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.45), 0 0 15px currentColor !important;
  }

  /* dark glass card base */
  .hp-glass {
    background: linear-gradient(158deg, rgba(9, 12, 33, 0.85) 0%, rgba(12, 16, 42, 0.95) 52%, rgba(7, 9, 23, 0.98) 100%);
    border: 1px solid rgba(255, 255, 255, 0.07);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(12px);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
  .hp-glass:hover {
    border-color: rgba(255, 255, 255, 0.12);
  }

  /* section header accent line */
  .hp-sec-line { width: 4px; height: 28px; border-radius: 9999px; flex-shrink: 0; }
  .hp-sec-gold  { background: linear-gradient(to bottom, #f59e0b, rgba(245,158,11,0.30)); }
  .hp-sec-green { background: linear-gradient(to bottom, #10b981, rgba(16,185,129,0.30)); }
  .hp-sec-blue  { background: linear-gradient(to bottom, #3b82f6, rgba(59,130,246,0.30)); }
  .hp-sec-vio   { background: linear-gradient(to bottom, #7c3aed, rgba(124,58,237,0.30)); }

  /* feature card hover glow */
  .hp-feat { transition: all 0.38s cubic-bezier(0.25, 0.8, 0.25, 1); }
  .hp-feat:hover { 
    transform: translateY(-8px); 
    box-shadow: 0 16px 36px rgba(0,0,0,0.55), 0 0 24px var(--hover-glow, rgba(255,255,255,0.03));
    border-color: var(--hover-border, rgba(255,255,255,0.15));
  }

  /* stat sparkline */
  .hp-spark { display: flex; align-items: flex-end; gap: 2.5px; height: 24px; }
  .hp-spark-bar { width: 4px; border-radius: 9999px; transition: opacity 0.3s; }
`;

// ── Logo renderer ────────────────────────────────────────────────────
function BannerLogo({ type, logoUrl = null }) {
  if (type === 'lao_flag') {
    return (
      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-sm ring-1 ring-white/20">
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <rect x="0" y="0" width="36" height="9" fill="#CE1126" />
          <rect x="0" y="9" width="36" height="18" fill="#002868" />
          <rect x="0" y="27" width="36" height="9" fill="#CE1126" />
          <circle cx="18" cy="18" r="6" fill="white" />
        </svg>
      </div>
    )
  }
  if (type === 'custom' && logoUrl) {
    return (
      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-sm ring-1 ring-white/20">
        <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
      </div>
    )
  }
  const icons = { star: '⭐', gift: '🎁', trophy: '🏆', custom: '🖼️' }
  return (
    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 shrink-0 flex items-center justify-center text-base">
      {icons[type] || '🎯'}
    </div>
  )
}

// ── Referral Scroll Banner ────────────────────────────────────────────
function ReferralScrollBanner() {
  const [banners, setBanners] = useState([])
  const [copiedId, setCopiedId] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    fetch(`${API}/index.php?action=get_banners`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setBanners(data.filter(b => Number(b.is_active))) })
      .catch(() => { })
  }, [])

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      scrollRef.current.scrollTo({ left: direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2, behavior: 'smooth' })
    }
  }

  const copyCode = (id, code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }).catch(() => { })
  }

  if (banners.length === 0) return null

  return (
    <div className="relative group/banner overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-r from-[#020617] via-[#05153f] to-[#020617] shadow-xl ring-1 ring-white/[0.05]">
      <div className="flex items-center justify-center gap-2 border-b border-white/[0.05] px-4 py-2.5 bg-black/25">
        <span className="material-symbols-outlined text-[13px] text-[#6cf8bb] animate-pulse">volunteer_activism</span>
        <p className="text-center text-[10px] font-black uppercase tracking-widest text-[#a5f3fc]">
          ໃຫ້ກຳລັງໃຈໂດຍທິມພັດທະນາ &nbsp;—&nbsp; ນຳລະຫັດແນະນຳໃສ່ໃນແອບຊື້ເລກຂອງທ່ານ
        </p>
        <span className="material-symbols-outlined text-[13px] text-[#6cf8bb] animate-pulse">volunteer_activism</span>
      </div>
      <div className="relative flex items-center min-h-[56px]">
        <button onClick={() => scroll('left')} className="absolute left-2.5 z-20 w-8 h-8 rounded-full bg-black/75 hover:bg-[#d4af37] text-white hover:text-black flex items-center justify-center border border-white/10 hover:border-transparent opacity-0 group-hover/banner:opacity-100 transition-all duration-300" aria-label="Scroll left">
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        <button onClick={() => scroll('right')} className="absolute right-2.5 z-20 w-8 h-8 rounded-full bg-black/75 hover:bg-[#d4af37] text-white hover:text-black flex items-center justify-center border border-white/10 hover:border-transparent opacity-0 group-hover/banner:opacity-100 transition-all duration-300" aria-label="Scroll right">
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#020617] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#020617] to-transparent" />
        <div ref={scrollRef} className="flex-1 flex gap-3.5 overflow-x-auto scrollbar-none py-3 px-10 scroll-smooth">
          {banners.map((b) => {
            const copied = copiedId === b.banner_id
            return (
              <div key={b.banner_id} className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.15] px-4 py-2 backdrop-blur-md shrink-0 transition-all duration-300">
                <BannerLogo type={b.logo_type} logoUrl={resolveUploadUrl(b.logo_url)} />
                <span className="text-xs font-extrabold text-white/95 whitespace-nowrap">{b.label}</span>
                <span className="text-white/20 font-light">|</span>
                <button
                  onClick={() => copyCode(b.banner_id, b.ref_code)}
                  title="ຄັດລອກລະຫັດ"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer select-none ${copied ? 'bg-[#6cf8bb]/20 border-[#6cf8bb]/50' : 'bg-black/35 border-[#6cf8bb]/15 hover:bg-[#6cf8bb]/10 hover:border-[#6cf8bb]/35'}`}
                >
                  <span className="material-symbols-outlined text-[12px] text-[#6cf8bb]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {copied ? 'check_circle' : 'content_copy'}
                  </span>
                  <span className={`text-[10px] font-black tracking-widest whitespace-nowrap transition-colors duration-200 ${copied ? 'text-[#6cf8bb]' : 'text-[#6cf8bb]'}`}>
                    {copied ? 'ຄັດລອກແລ້ວ!' : b.ref_code}
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

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
        {[0, 1, 2, 3].map(i => <div key={i} className="hp-glass rounded-2xl p-5 h-28 animate-pulse" />)}
      </div>
      <div className="hp-glass rounded-2xl p-6 sm:p-8 min-h-[220px] animate-pulse" />
    </div>
  )
}

// ── Feature card ─────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, to, accent, badge }) {
  return (
    <Link
      to={to}
      className="hp-feat group relative hp-glass rounded-3xl p-6 flex flex-col gap-4 overflow-hidden"
      style={{ '--hover-glow': `${accent}22`, '--hover-border': `${accent}45` }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 10% 10%, ${accent}18, transparent 65%)` }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
          style={{ background: `${accent}16`, border: `1px solid ${accent}2e` }}
        >
          <span className="material-symbols-outlined text-[24px]" style={{ color: accent, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        {badge && (
          <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm"
            style={{ color: accent, background: `${accent}14`, borderColor: `${accent}30` }}>
            {badge}
          </span>
        )}
      </div>
      <div className="relative z-10 space-y-2 mt-1">
        <h3 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors duration-300">{title}</h3>
        <p className="text-xs leading-relaxed font-medium text-white/40 group-hover:text-white/60 transition-colors duration-300">{desc}</p>
      </div>
      <div className="relative z-10 flex items-center gap-1.5 text-xs font-black mt-auto pt-4 group-hover:gap-2.5 transition-all duration-300" style={{ color: accent }}>
        <span>ເຂົ້າໄປເບິ່ງ</span>
        <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1.5 transition-transform duration-300">arrow_forward</span>
      </div>
    </Link>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────
function StatCard({ icon, label, value, image, accent = '#003fb1' }) {
  return (
    <div 
      className="group relative hp-glass rounded-3xl p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ '--hover-glow': `${accent}15`, '--hover-border': `${accent}40` }}
    >
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `${accent}25` }} />
      <div className="relative z-10 flex flex-col justify-between h-full gap-3">
        <div className="flex items-center justify-between">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105"
            style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
            {image
              ? <img src={image} alt={label} className="w-7 h-7 object-contain rounded-lg" />
              : <span className="material-symbols-outlined text-[20px]" style={{ color: accent, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            }
          </div>
          <div className="hp-spark">
            {[30, 55, 80, 100].map((h, i) => (
              <div 
                key={i} 
                className="hp-spark-bar" 
                style={{ 
                  height: `${h}%`, 
                  background: `linear-gradient(to top, ${accent}, #fff)`, 
                  opacity: 0.25 + i * 0.15 
                }} 
              />
            ))}
          </div>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest mb-1.5 text-white/30">{label}</p>
          <p className="text-lg font-black leading-none tracking-wide text-white group-hover:text-amber-300 transition-colors duration-300">{value}</p>
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(to right, transparent, ${accent}, transparent)` }} />
    </div>
  )
}

// ── Ticker item ───────────────────────────────────────────────────────
function TickerItem({ draw, color }) {
  return (
    <span
      className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/15 transition-all duration-300 shrink-0 shadow-sm"
      style={{ boxShadow: `inset 0 0 12px ${color}08` }}
    >
      {color && <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-lg" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />}
      <span className="text-white/40 text-[9px] font-black uppercase tracking-wider">ງວດ {draw.draw_number}</span>
      <span className="text-white font-extrabold text-xs tracking-widest">{draw.full_result}</span>
    </span>
  )
}

// ── AI News Section ───────────────────────────────────────────────────
function HomeNewsSection({ draws }) {
  const [copied, setCopied] = useState(false)
  const analytics = useMemo(() => computeAnalytics(draws, '50'), [draws])
  const top10 = useMemo(() => computeCombinedTop10(analytics), [analytics])
  const latestDraw = draws?.[0] ?? null
  const article = useMemo(() => buildArticle(top10, analytics, latestDraw, analytics?.n ?? 0, null), [top10, analytics, latestDraw])

  const handleCopy = () => {
    navigator.clipboard.writeText(article).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  if (!top10.length) return null

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <span className="material-symbols-outlined text-amber-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>newspaper</span>
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">AI Predictive Hub</h2>
            <p className="text-[10px] mt-0.5 font-bold text-white/30">ວິເຄາະສະຖິຕິ {analytics?.n ?? 0} ງວດຫຼ້າສຸດ</p>
          </div>
        </div>
        <Link to="/analytics" className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-xs font-black hover:gap-2.5 transition-all duration-300 group">
          ວິເຄາະເຕັມຮູບແບບ
          <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
        </Link>
      </div>

      {/* Top 10 */}
      <div className="hp-glass rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(99,102,241,0.08)' }} />
        <div className="flex items-center gap-3 mb-6 flex-wrap justify-between">
          <span className="text-[9px] font-black tracking-widest text-white/30">TOP 10 NUMBERS (ຄາດການ)</span>
          <div className="flex gap-1.5 flex-wrap">
            {COMBINED_SIGNALS.map(({ label, color }) => (
              <span key={label} className="text-[8px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm"
                style={{ background: color + '15', color, border: `1px solid ${color}25` }}>{label}</span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3">
          {top10.map((s, i) => (
            <div key={s.num}
              className="relative flex flex-col items-center px-3 py-4.5 rounded-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 border"
              style={i === 0
                ? { background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.35)', boxShadow: '0 4px 16px rgba(245,158,11,0.08)' }
                : i < 3
                  ? { background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.25)' }
                  : { background: 'rgba(255,255,255,0.01)', borderColor: 'rgba(255,255,255,0.06)' }
              }
            >
              {i < 3 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shadow-md border border-white/10"
                  style={{ background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#b45309', color: i === 0 ? '#78350f' : '#fff' }}>
                  {i + 1}
                </span>
              )}
              <span className="font-black text-2xl leading-none tracking-tight font-mono"
                style={{ color: i === 0 ? '#fbbf24' : i < 3 ? '#a5b4fc' : 'rgba(255,255,255,0.85)' }}>
                {s.num}
              </span>
              <span className="text-[9px] mt-1.5 font-black text-white/40">{s.probability}%</span>
              <div className="flex gap-0.5 mt-3 w-full justify-center">
                {COMBINED_SIGNALS.map(({ key, color }) => (
                  <div key={key} className="w-2.5 h-1 rounded-full overflow-hidden bg-white/5" title={key}>
                    <div className="h-full rounded-full shadow-[0_0_4px_currentColor]" style={{ width: `${(s[key] / 25) * 100}%`, background: color, color }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] mt-5 flex items-center gap-1.5 font-bold text-white/30">
          <span className="material-symbols-outlined text-[14px] text-amber-500/80 shrink-0">warning</span>
          ຂໍ້ມູນນີ້ເປັນການວິເຄາະສະຖິຕິເທົ່ານັ້ນ ບໍ່ຮັບປະກັນຜົນລາງວັນໃນອະນາຄົດ
        </p>
      </div>

      {/* Article preview */}
      <div className="hp-glass rounded-3xl shadow-2xl overflow-hidden border border-white/[0.06]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-white/[0.01]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-indigo-400" style={{ fontVariationSettings: "'FILL' 1" }}>article</span>
            <span className="font-extrabold text-[10px] tracking-widest text-white/40">AI AUTOMATED REPORT</span>
          </div>
          <button onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer"
            style={copied
              ? { background: '#10b981', color: '#fff', boxShadow: '0 0 12px rgba(16,185,129,0.3)' }
              : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.70)', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            <span className="material-symbols-outlined text-[13px]">{copied ? 'check' : 'content_copy'}</span>
            {copied ? 'Copied!' : 'Copy report'}
          </button>
        </div>
        <pre className="px-5 py-4.5 text-[10.5px] leading-relaxed font-mono whitespace-pre-wrap break-words max-h-64 overflow-y-auto bg-black/10 text-white/55">
          {article}
        </pre>
        <div className="px-5 py-3 flex justify-end border-t border-white/[0.06] bg-black/5">
          <Link to="/analytics" className="text-[10px] font-black uppercase tracking-wider text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors">
            ເຂົ້າໄປ Analytics ລາຍລະອຽດ
            <span className="material-symbols-outlined text-[13px]">open_in_new</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────
export default function HomePage() {
  const { draws, types, animals } = useData();
  const { stats } = useStatistics();
  const [selectedType, setSelectedType] = useState('all');

  if (!draws || draws.length === 0) return <HomePageSkeleton />

  const filteredDraws = selectedType === 'all'
    ? draws
    : draws.filter(d => String(d.type_id) === String(selectedType))

  const latest      = filteredDraws.find(d => d.status === 'published') || filteredDraws[0]
  const recentDraws = latest ? filteredDraws.filter(d => d.draw_id !== latest.draw_id).slice(0, 4) : []
  const tickerDraws = draws.filter(d => d.status === 'published').slice(0, 8)

  const statItems = [
    { icon: 'dataset',              label: 'ງວດທັງໝົດ',  value: `${draws.length} ງວດ`,                                                                                  accent: '#3b82f6' },
    { icon: 'pets',                 label: 'ນາມສັດຮ້ອນ', value: stats?.animalStats?.[0] ? `${stats.animalStats[0].name} (${stats.animalStats[0].frequencyPercent}%)` : '-', image: stats?.animalStats?.[0]?.image_url || null, accent: '#10b981' },
    { icon: 'local_fire_department',label: 'ເລກ Hot ສູງສຸດ',value: stats?.hotNumbers?.[0]?.number || '-',                                                                 accent: '#f97316' },
    { icon: 'ac_unit',              label: 'ບໍ່ອອກດົນສຸດ', value: stats?.coldNumbers?.[0] ? `${stats.coldNumbers[0].number} (${stats.coldNumbers[0].missedRounds} ງວດ)` : '-', accent: '#38bdf8' },
  ]

  const features = [
    { icon: 'analytics',     title: 'ສະຖິຕິ & ການວິເຄາະ', desc: 'ສະຖິຕິລາຍລະອຽດ, ເລກ Hot/Cold, ການແຈກຢາຍຕົວເລກ ແລະ trend ສຸດທ້ອງ', to: '/statistics', accent: '#3b82f6',  badge: 'Dashboard' },
    { icon: 'auto_awesome',  title: 'ຕຳລາຄວາມຝັນ',        desc: 'ແປຄວາມຝັນ 40 ນາມສັດ ແລະ ຊອກເລກທີ່ກ່ຽວຂ້ອງ ຕາມຕຳລາໂບຮານ',             to: '/search',     accent: '#7c3aed',  badge: 'ໃໝ່' },
    { icon: 'manage_search', title: 'ຄົ້ນຫາຕາມເລກ',        desc: 'ກວດສອບປະຫວັດຂອງຕົວເລກ 00–99 ວ່າອອກເວລາໃດ ແລະ ຄວາມຖີ່ສໍ່ານ',           to: '/search',     accent: '#10b981' },
    { icon: 'trending_up',   title: 'AI Analytics',         desc: 'ວິເຄາະ pattern, momentum, gap analysis ດ້ວຍ algorithm ທີ່ທັນສະໄໝ',            to: '/analytics',  accent: '#f59e0b',  badge: 'AI' },
  ]

  const latestDraw     = draws.filter(d => d.status === 'published')[0]
  const latestDateStr  = latestDraw?.draw_date ?? ''
  const latestNumber   = latestDraw?.result_number ?? ''
  const latestTypeName = latestDraw?.type_name ?? 'ພັດທະນາ'

  const seoTitle = latestNumber
    ? `ຜົນຫວຍ${latestTypeName} ${latestDateStr} ເລກ ${latestNumber} | ผลหวย${latestTypeName} ${latestDateStr}`
    : 'ຜົນຫວຍພັດທະນາຫຼ້າສຸດ | ผลหวยพัฒนาล่าสุด'
  const seoDesc = latestNumber
    ? `ຜົນຫວຍ${latestTypeName}ງວດວັນທີ ${latestDateStr} ເລກທີ່ອອກ: ${latestNumber}. ຖ່າຍທອດສົດ ສະຖິຕິ ວິເຄາະຫວຍ ຈັບຄູ່ນາມສັດ ທຳນາຍຝັນ | ผลหวย${latestTypeName} งวด ${latestDateStr} เลข ${latestNumber}. ถ่ายทอดสด สถิติ วิเคราะห์หวย`
    : 'ສູນລວມຜົນຫວຍພັດທະນາ ຖ່າຍທອດສົດຫວຍລາວ ວິເຄາະຫວຍ | ศูนย์รวมผลหวยลาว ถ่ายทอดสด วิเคราะห์หวย'

  return (
    <div className="space-y-12 select-none">
      <style>{PAGE_STYLE}</style>
      <SEO
        title={seoTitle}
        description={seoDesc}
        keywords={[latestNumber, latestDateStr, latestTypeName, `ຜົນຫວຍ ${latestDateStr}`, `เลข ${latestNumber}`, `หวยงวด ${latestDateStr}`, 'ຫວຍຫຼ້າສຸດ', 'หวยล่าสุด', 'ผลหวยวันนี้'].filter(Boolean)}
        url="/"
        jsonLd={[websiteSchema(), breadcrumbSchema([{ name: 'ໜ້າຫຼັກ', url: 'https://laolots.com/' }]), ...(latestDraw ? [lotteryResultSchema(latestDraw)] : [])]}
      />
      <LiveVdoBanner />

      {/* ─── Hero Section ─── */}
      <div className="relative rounded-[2rem] overflow-hidden bg-zinc-950 border border-white/[0.08] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.85)]">
        {/* Graphic grid layout and radial highlights */}
        <div className="absolute inset-0 bg-grid-glow bg-repeat opacity-[0.25]" />
        
        {/* Pulsating backdrop highlights */}
        <div className="absolute -top-[30%] -right-[20%] w-[80%] h-[80%] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)', animation: 'pulse-soft 10s ease-in-out infinite' }} />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)' }} />
        
        {/* Floating background decorative lottery balls */}
        <div className="absolute top-[15%] right-[32%] w-14 h-14 rounded-full opacity-[0.18] pointer-events-none blur-[1px]"
          style={{ 
            background: 'radial-gradient(circle at 35% 30%, #fde68a 0%, #f59e0b 50%, #78350f 100%)',
            animation: 'float-ball-1 12s ease-in-out infinite' 
          }} 
        />
        <div className="absolute bottom-[20%] right-[8%] w-10 h-10 rounded-full opacity-[0.12] pointer-events-none blur-[2px]"
          style={{ 
            background: 'radial-gradient(circle at 35% 30%, #fed7aa 0%, #ea580c 50%, #7c2d12 100%)',
            animation: 'float-ball-2 15s ease-in-out infinite' 
          }} 
        />

        <div className="relative z-10 px-8 sm:px-16 pt-14 sm:pt-18 pb-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] rounded-full px-4 py-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
                <span className="text-white/95 text-[9px] font-black uppercase tracking-widest">ຄັງຂໍ້ມູນຫວຍ — ລາວ</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-[#10b981]/[0.08] border border-[#10b981]/25 rounded-full px-3.5 py-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[#10b981] text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>database</span>
                <span className="text-[#10b981] text-[9px] font-black">{draws.length}+ ງວດ</span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-6.5xl font-black text-white leading-none tracking-tight">
              ຜົນຫວຍ
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-yellow-200 to-emerald-400 sm:ml-4 block sm:inline">
                ລ່າສຸດ
              </span>
            </h1>
            <p className="text-white/60 text-sm sm:text-base max-w-xl leading-relaxed font-medium">
              ກວດສອບຜົນຫວຍ, ສະຖິຕິ, ນາມສັດ ແລະ ວິເຄາະຕົວເລກ ຈາກຖານຂໍ້ມູນທີ່ຄົບຖ້ວນ ແລະ ທັນສະໄໝ ດ້ວຍລະບົບ AI Analytics.
            </p>
            <div className="flex flex-wrap gap-3.5 pt-2">
              <Link to="/statistics" className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#b8860b] text-black px-7 py-3.5 rounded-full font-black text-xs uppercase tracking-wider shadow-lg shadow-[#d4af37]/10 hover:-translate-y-0.5 transition-all duration-300">
                <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                ເບິ່ງສະຖິຕິ
              </Link>
              <Link to="/search" className="inline-flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white px-7 py-3.5 rounded-full font-black text-xs uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                ຕຳລາຄວາມຝັນ
              </Link>
              <Link to="/history" className="inline-flex items-center gap-2 border border-white/[0.12] bg-white/[0.03] backdrop-blur-sm text-white/80 px-7 py-3.5 rounded-full font-black text-xs uppercase tracking-wider hover:bg-white/[0.08] hover:text-white transition-all duration-300 hover:-translate-y-0.5">
                <span className="material-symbols-outlined text-[16px]">history</span>
                ປະຫວັດຫວຍ
              </Link>
            </div>
          </div>

          {/* Right hologram card */}
          <div className="lg:col-span-4 hidden lg:block relative justify-self-end w-full max-w-[290px]">
            <div className="absolute inset-0 rounded-[2rem] opacity-20 blur-2xl animate-pulse duration-[6000ms]"
              style={{ background: 'linear-gradient(to right, #d4af37, #b8860b)' }} />
            <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[2.2rem] p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest text-white/30">LIVE RESULT PREVIEW</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-ping" />
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">ລາງວັນທີ 1</p>
                <div className="text-4xl font-black text-white tracking-[0.2em] font-mono leading-none">{latestNumber || '888888'}</div>
              </div>
              <div className="h-px bg-gradient-to-r from-white/10 to-transparent" />
              <div className="flex justify-between items-center text-xs">
                <div>
                  <p className="text-[8px] font-black uppercase text-white/30">ງວດວັນທີ</p>
                  <p className="font-extrabold text-white/85 mt-0.5">{latestDateStr || '09.06.2026'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black uppercase text-white/30">ນາມສັດ</p>
                  <p className="text-[#d4af37] font-black mt-0.5">{latestTypeName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker strip */}
        {tickerDraws.length > 0 && (
          <div className="border-t border-white/[0.08] mx-8 sm:mx-16 pt-5 pb-5 overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[9px] font-black uppercase tracking-widest shrink-0 text-white/30">ຜົນຫຼ້າສຸດ</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 hp-marquee-mask">
              {tickerDraws.map(d => {
                const typeColor = types?.find(t => t.type_id === d.type_id)?.color || '#d4af37'
                return <TickerItem key={d.draw_id} draw={d} color={typeColor} />
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── Feature Showcase ─── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.04] border border-white/[0.1] shadow-sm">
            <span className="material-symbols-outlined text-[#d4af37] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>apps</span>
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">ຄຸນສົມບັດຫຼັກ</h2>
            <p className="text-[10px] mt-0.5 text-white/30 font-bold">ທຸກສ່ວນທີ່ທ່ານຕ້ອງການ ຢູ່ໃນທີ່ດຽວ</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-white/[0.08] to-transparent" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* ─── Type Filter Tabs ─── */}
      {types && types.length > 1 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-black uppercase tracking-widest mr-1.5 text-white/30">ປະເພດຫວຍ:</span>
          <button
            onClick={() => setSelectedType('all')}
            className="px-4 py-2 rounded-full text-xs font-black border transition-all cursor-pointer"
            style={selectedType === 'all'
              ? { background: '#d4af37', color: '#000', borderColor: '#d4af37', boxShadow: '0 4px 14px rgba(212,175,55,0.25)' }
              : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.45)', borderColor: 'rgba(255,255,255,0.08)' }
            }
          >
            ທັງໝົດ ({draws.length})
          </button>
          {types.filter(t => t.is_active != 0).map(t => {
            const color = t.color || '#d4af37'
            const active = String(selectedType) === String(t.type_id)
            const cnt = draws.filter(d => String(d.type_id) === String(t.type_id)).length
            return (
              <button key={t.type_id} onClick={() => setSelectedType(String(t.type_id))}
                className="px-4 py-2 rounded-full text-xs font-black border transition-all cursor-pointer"
                style={active
                  ? { background: color, color: '#fff', borderColor: color, boxShadow: `0 4px 14px ${color}35` }
                  : { background: 'transparent', color, borderColor: `${color}40` }
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
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="hp-sec-line hp-sec-gold" />
            <h2 className="text-xl font-black text-white">ຜົນລ່າສຸດ</h2>
            <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          <ResultCard draw={latest} />
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-3 hp-glass rounded-3xl border border-white/[0.06]">
          <span className="material-symbols-outlined text-4xl text-white/10">inbox</span>
          <p className="text-xs font-bold text-white/30">ຍັງບໍ່ມີງວດຫວຍໃນປະເພດນີ້</p>
        </div>
      )}

      {/* ─── Hot Numbers Strip ─── */}
      {stats?.hotNumbers?.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)' }}>
                <span className="material-symbols-outlined text-orange-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-white">ເລກ Hot ສູງສຸດ</h2>
                <p className="text-[10px] mt-0.5 text-white/30 font-bold">ອອກຫຼາຍທີ່ສຸດໃນຖານຂໍ້ມູນ</p>
              </div>
            </div>
            <Link to="/statistics" className="inline-flex items-center gap-1.5 text-orange-400 hover:text-orange-350 text-xs font-black hover:gap-2.5 transition-all duration-200 group">
              ວິເຄາະເລີ່ມ
              <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {stats.hotNumbers.slice(0, 8).map(({ number, count }, i) => {
              const rb = HOT_BALL[i] || HOT_BALL[7];
              return (
                <div key={number} className="relative hp-ball-wrap flex flex-col items-center gap-2.5 py-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hp-glass"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  {i < 3 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md z-10 border border-white/10"
                      style={{ background: i === 0 ? '#d4af37' : i === 1 ? '#94a3b8' : '#b45309', color: i === 0 ? '#000' : '#fff', fontSize: 9, fontWeight: 900 }}>
                      {i + 1}
                    </span>
                  )}
                  <div className="hp-ball shadow-md cursor-pointer" style={{ width: 50, height: 50, background: rb.bg, color: rb.txt, fontSize: 18, boxShadow: `0 4px 14px ${rb.glow}, inset 0 -3px 6px rgba(0,0,0,0.25)` }}>
                    <span style={{ position: 'relative', zIndex: 1 }}>{number}</span>
                  </div>
                  <p className="text-[10.5px] font-black text-white/30">{count}x</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── Recent Draws ─── */}
      {recentDraws.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="hp-sec-line hp-sec-green" />
              <h2 className="text-lg font-black text-white">ງວດຜ່ານມາ</h2>
            </div>
            <Link to="/history" className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-xs font-black hover:gap-2.5 transition-all duration-200 group">
              ທັງໝົດ
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentDraws.map(d => <ResultCard key={d.draw_id} draw={d} compact />)}
          </div>
        </section>
      )}

      {/* ─── Quick Stats ─── */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="hp-sec-line hp-sec-vio" />
          <h2 className="text-lg font-black text-white">ສະຫຼຸບຂໍ້ມູນສະຖິຕິ</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statItems.map(item => <StatCard key={item.label} {...item} />)}
        </div>
      </section>

      {/* ─── AI News Section ─── */}
      <HomeNewsSection draws={filteredDraws} />

      {/* ─── CTA Banner ─── */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/[0.06] bg-gradient-to-br from-[#060814] via-[#0b0f24] to-[#05070e]">
        <div className="absolute inset-0 bg-grid-glow bg-repeat opacity-[0.15]" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top left, rgba(139,92,246,0.18), transparent 55%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at bottom right, rgba(212,175,55,0.12), transparent 55%)' }} />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[7rem] font-black text-white/[0.02] leading-none select-none pointer-events-none tracking-wider">LOTTERY</div>
        <div className="relative z-10 px-8 sm:px-12 py-9 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] mb-2">ສໍາລັບນັກວິເຄາະ</p>
            <h3 className="text-2xl sm:text-3.5xl font-black text-white leading-none">ວິເຄາະໃນລະດັບ Pro</h3>
            <p className="text-xs max-w-md leading-relaxed text-white/50 mt-2">
              Gap analysis, trend momentum, pairing stats, repeat patterns ແລະ ອີກຫຼາຍຢ່າງ
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link to="/statistics" className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider shadow-lg hover:bg-zinc-100 hover:-translate-y-0.5 transition-all duration-300">
              <span className="material-symbols-outlined text-[16px]">analytics</span>
              ເຂົ້າ Dashboard
            </Link>
            <Link to="/analytics" className="inline-flex items-center gap-2 border text-white/95 px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider hover:bg-white/[0.1] transition-all duration-300 hover:-translate-y-0.5"
              style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)' }}>
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              AI Analytics
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Referral Scroll Banner ─── */}
      <ReferralScrollBanner />
    </div>
  )
}
