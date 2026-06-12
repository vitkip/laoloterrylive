import { useState } from 'react'

const PAGE_SIZE_OPTIONS = [10, 20, 50]

function getPages(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  if (page <= 4)              return [1, 2, 3, 4, 5, '·', totalPages]
  if (page >= totalPages - 3) return [1, '·', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  return [1, '·', page - 1, page, page + 1, '·', totalPages]
}

export default function Pagination({ total, page, pageSize, onPageChange, onPageSizeChange }) {
  const [goInput, setGoInput]   = useState('')
  const [goFocus, setGoFocus]   = useState(false)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pages      = getPages(page, totalPages)

  const from = Math.min((page - 1) * pageSize + 1, total)
  const to   = Math.min(page * pageSize, total)

  const handleGo = () => {
    const n = parseInt(goInput)
    if (n >= 1 && n <= totalPages) { onPageChange(n); setGoInput('') }
  }

  return (
    <>
      <style>{`
        @keyframes pg-glow-pulse {
          0%, 100% { box-shadow: 0 0 12px 2px rgba(212,175,55,0.45), 0 0 24px 4px rgba(212,175,55,0.18); }
          50%       { box-shadow: 0 0 18px 4px rgba(212,175,55,0.65), 0 0 36px 8px rgba(212,175,55,0.28); }
        }
        @keyframes pg-chip-in {
          from { transform: scale(0.82); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        .pg-active-chip {
          animation: pg-glow-pulse 2.4s ease-in-out infinite, pg-chip-in 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .pg-nav-btn:not(:disabled):hover .pg-arrow-track { transform: translateX(2px); }
        .pg-nav-btn-prev:not(:disabled):hover .pg-arrow-track { transform: translateX(-2px); }
        .pg-arrow-track { transition: transform 0.18s ease; display: flex; align-items: center; }
        .pg-go-btn { transition: all 0.18s ease; }
        .pg-go-btn:hover { background: rgba(212,175,55,0.18) !important; color: #ffd700 !important; border-color: rgba(212,175,55,0.45) !important; }
        .pg-size-select option { background: #0c1020; color: #E8E6F0; }
      `}</style>

      <nav
        aria-label="ການຫຼ່ຽນໜ້າ"
        className="select-none"
        style={{
          margin: '0 16px 16px',
          padding: '10px 16px',
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(8,11,24,0.95) 0%, rgba(10,14,30,0.9) 100%)',
          border: '1px solid rgba(212,175,55,0.12)',
          boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.08), 0 4px 24px rgba(0,0,0,0.4)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px 16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top hairline shimmer */}
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)',
          pointerEvents: 'none',
        }} />

        {/* Left — record range */}
        <div style={{ fontSize: 11, color: 'rgba(212,175,55,0.45)', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
          <span style={{ color: 'rgba(232,230,240,0.25)' }}>ສະແດງ </span>
          <span style={{ color: 'rgba(212,175,55,0.75)', fontWeight: 700 }}>{from}–{to}</span>
          <span style={{ color: 'rgba(232,230,240,0.25)' }}> / {total}</span>
        </div>

        {/* Center — page navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>

          {/* Prev */}
          <button
            className="pg-nav-btn pg-nav-btn-prev"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="ໜ້າກ່ອນ"
            style={{
              height: 34, paddingInline: 10,
              borderRadius: 10,
              border: '1px solid rgba(212,175,55,0.12)',
              background: 'rgba(255,255,255,0.02)',
              color: page === 1 ? 'rgba(255,255,255,0.12)' : 'rgba(232,230,240,0.45)',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => { if (page !== 1) { e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; e.currentTarget.style.color = 'rgba(212,175,55,0.9)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)' }}}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.color = page === 1 ? 'rgba(255,255,255,0.12)' : 'rgba(232,230,240,0.45)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.12)' }}
          >
            <span className="pg-arrow-track" style={{ fontSize: 14 }}>←</span>
            <span>ກ່ອນ</span>
          </button>

          {/* Page numbers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {pages.map((p, i) =>
              p === '·' ? (
                <span key={`dot-${i}`} style={{ width: 24, textAlign: 'center', color: 'rgba(212,175,55,0.25)', fontSize: 16, lineHeight: 1 }}>·</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  aria-current={p === page ? 'page' : undefined}
                  className={p === page ? 'pg-active-chip' : ''}
                  style={{
                    width: 34, height: 34,
                    borderRadius: 9,
                    border: p === page
                      ? '1px solid rgba(212,175,55,0.5)'
                      : '1px solid rgba(255,255,255,0.06)',
                    background: p === page
                      ? 'linear-gradient(135deg, #d4af37 0%, #f5d77f 45%, #b8860b 100%)'
                      : 'rgba(255,255,255,0.02)',
                    color: p === page ? '#060812' : 'rgba(232,230,240,0.4)',
                    fontSize: 12,
                    fontWeight: p === page ? 900 : 500,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: p === page ? 'none' : 'all 0.15s ease',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.02em',
                  }}
                  onMouseEnter={e => { if (p !== page) { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; e.currentTarget.style.color = '#ffd700'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)' }}}
                  onMouseLeave={e => { if (p !== page) { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.color = 'rgba(232,230,240,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}}
                >
                  {p}
                </button>
              )
            )}
          </div>

          {/* Next */}
          <button
            className="pg-nav-btn"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            aria-label="ໜ້າຕໍ່ໄປ"
            style={{
              height: 34, paddingInline: 10,
              borderRadius: 10,
              border: '1px solid rgba(212,175,55,0.12)',
              background: 'rgba(255,255,255,0.02)',
              color: page === totalPages ? 'rgba(255,255,255,0.12)' : 'rgba(232,230,240,0.45)',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => { if (page !== totalPages) { e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; e.currentTarget.style.color = 'rgba(212,175,55,0.9)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)' }}}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.color = page === totalPages ? 'rgba(255,255,255,0.12)' : 'rgba(232,230,240,0.45)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.12)' }}
          >
            <span>ຕໍ່ໄປ</span>
            <span className="pg-arrow-track" style={{ fontSize: 14 }}>→</span>
          </button>
        </div>

        {/* Right — page size + go to */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Page size */}
          <select
            className="pg-size-select"
            value={pageSize}
            onChange={e => { onPageSizeChange(parseInt(e.target.value)); onPageChange(1) }}
            style={{
              height: 30, paddingInline: '8px 28px',
              borderRadius: 8,
              border: '1px solid rgba(212,175,55,0.15)',
              background: 'rgba(212,175,55,0.06)',
              color: 'rgba(212,175,55,0.7)',
              fontSize: 11, fontWeight: 700,
              cursor: 'pointer', outline: 'none',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(212,175,55,0.5)'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
            }}
          >
            {PAGE_SIZE_OPTIONS.map(s => (
              <option key={s} value={s}>{s} / ໜ້າ</option>
            ))}
          </select>

          {/* Go to page */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 10, color: 'rgba(212,175,55,0.35)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>ໄປໜ້າ</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={goInput}
              onChange={e => setGoInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGo()}
              onFocus={() => setGoFocus(true)}
              onBlur={() => setGoFocus(false)}
              placeholder="—"
              aria-label="ໄປໜ້າ"
              style={{
                width: 44, height: 30,
                textAlign: 'center',
                borderRadius: 8,
                border: goFocus ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(255,255,255,0.08)',
                background: goFocus ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)',
                color: '#ffd700',
                fontSize: 12, fontWeight: 700,
                outline: 'none',
                fontVariantNumeric: 'tabular-nums',
                boxShadow: goFocus ? '0 0 0 2px rgba(212,175,55,0.15)' : 'none',
                transition: 'all 0.18s ease',
              }}
            />
            <button
              className="pg-go-btn"
              onClick={handleGo}
              style={{
                height: 30, paddingInline: 10,
                borderRadius: 8,
                border: '1px solid rgba(212,175,55,0.2)',
                background: 'rgba(212,175,55,0.08)',
                color: 'rgba(212,175,55,0.6)',
                fontSize: 11, fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ໄປ
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
