// ── Frontend pagination — "Amber Mineral" ────────────────────────
// ໃຊ້ຮ່ວມກັນລະຫວ່າງໜ້າຝັ່ງຜູ້ໃຊ້ (Happy545, ບິນເດີມພັນ ປູປາເຕົ້າ ...)
export default function FrontPagination({ total, page, pageSize, onPageChange, onPageSizeChange, sizes = [10, 20, 50] }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (totalPages <= 1 && total <= sizes[0]) return null

  const from = Math.min((page - 1) * pageSize + 1, total)
  const to = Math.min(page * pageSize, total)
  const pct = totalPages > 1 ? ((page - 1) / (totalPages - 1)) * 100 : 100

  const pages = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 4) return [1, 2, 3, 4, 5, '·', totalPages]
    if (page >= totalPages - 3) return [1, '·', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [1, '·', page - 1, page, page + 1, '·', totalPages]
  })()

  return (
    <>
      <style>{`
        @keyframes fp-amber-pop {
          0%   { transform: scale(0.78); opacity: 0; }
          65%  { transform: scale(1.08); }
          100% { transform: scale(1);   opacity: 1; }
        }
        .fp-active { animation: fp-amber-pop 0.22s cubic-bezier(0.34,1.56,0.64,1) both; }
        .fp-nav:not(:disabled):hover { transform: scale(1.08); }
        .fp-nav { transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease; }
        .fp-page-btn { transition: all 0.15s ease; }
        .fp-page-btn:not(.fp-active):hover {
          border-color: #f59e0b !important;
          color: #d97706 !important;
          background: rgba(245,158,11,0.08) !important;
        }
        .dark .fp-page-btn:not(.fp-active):hover {
          border-color: rgba(212,175,55,0.5) !important;
          color: #fbbf24 !important;
          background: rgba(212,175,55,0.1) !important;
        }
        .fp-size-opt { background: white; color: #374151; }
        .dark .fp-size-opt { background: #0f0c1e; color: #e2e8f0; }
      `}</style>

      <div className="select-none px-4 pb-5 pt-3 space-y-3">
        <div className="relative h-0.5 rounded-full bg-[#e9edf8] dark:bg-[#1e1842] overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #f59e0b, #d97706)',
              boxShadow: '0 0 8px rgba(245,158,11,0.5)',
            }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-[#9ca3af] dark:text-[#6b7280] tabular-nums leading-none">
            <span className="font-bold text-[#374151] dark:text-[#d1d5db]">{from}–{to}</span>
            {' '}<span>/ {total} ລາຍການ</span>
          </p>

          <div className="flex items-center gap-1.5">
            <button
              className="fp-nav h-8 w-8 rounded-xl border border-[#e2e8f0] dark:border-[#2a1e50] bg-white dark:bg-[#12102a] text-[#6b7280] dark:text-[#6b7280] flex items-center justify-center text-sm disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              aria-label="ໜ້າກ່ອນ"
            >←</button>

            {pages.map((p, i) =>
              p === '·' ? (
                <span key={`d${i}`} className="w-5 text-center text-[#d1d5db] dark:text-[#374151] text-sm leading-none">·</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  aria-current={p === page ? 'page' : undefined}
                  className={`fp-page-btn h-8 w-8 rounded-xl border text-xs font-bold cursor-pointer ${p === page
                      ? 'fp-active border-[#f59e0b] dark:border-[#d4af37] text-white dark:text-[#060812]'
                      : 'border-[#e2e8f0] dark:border-[#2a1e50] bg-white dark:bg-[#12102a] text-[#6b7280] dark:text-[#6b7280]'
                    }`}
                  style={p === page ? {
                    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%)',
                    boxShadow: '0 4px 14px rgba(245,158,11,0.45), 0 1px 3px rgba(245,158,11,0.3)',
                  } : {}}
                >{p}</button>
              )
            )}

            <button
              className="fp-nav h-8 w-8 rounded-xl border border-[#e2e8f0] dark:border-[#2a1e50] bg-white dark:bg-[#12102a] text-[#6b7280] dark:text-[#6b7280] flex items-center justify-center text-sm disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              aria-label="ໜ້າຕໍ່ໄປ"
            >→</button>
          </div>

          <select
            value={pageSize}
            onChange={e => { onPageSizeChange(+e.target.value); onPageChange(1) }}
            className="fp-size-opt h-8 pl-3 pr-7 rounded-xl border border-[#e2e8f0] dark:border-[#2a1e50] bg-white dark:bg-[#12102a] text-[#6b7280] dark:text-[#9ca3af] text-[11px] font-semibold focus:outline-none focus:border-[#f59e0b] dark:focus:border-[#d4af37] cursor-pointer"
            style={{
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23f59e0b'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
            }}
          >
            {sizes.map(s => <option key={s} value={s} className="fp-size-opt">{s} / ໜ້າ</option>)}
          </select>
        </div>
      </div>
    </>
  )
}
