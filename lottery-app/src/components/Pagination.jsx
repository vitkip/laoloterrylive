import { useState } from 'react';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function Pagination({ total, page, pageSize, onPageChange, onPageSizeChange }) {
  const [goInput, setGoInput] = useState('');
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  const handleGo = () => {
    const n = parseInt(goInput);
    if (n >= 1 && n <= totalPages) { onPageChange(n); setGoInput(''); }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-6 select-none">
      {/* Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-full text-[#737686] hover:bg-[#eff3ff] disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
      </button>

      {/* Page numbers */}
      {getPages().map((p, i) =>
        p === '...'
          ? <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-[#737686] text-sm">…</span>
          : <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition
                ${p === page
                  ? 'bg-[#c7d2fe] text-[#003fb1]'
                  : 'text-[#434654] dark:text-[#c7d2fe] hover:bg-[#eff3ff] dark:hover:bg-[#1e2d4a]'
                }`}
            >
              {p}
            </button>
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-full text-[#737686] hover:bg-[#eff3ff] disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
      </button>

      {/* Page size */}
      <div className="ml-2 flex items-center gap-1 border border-[#c3c5d7] dark:border-[#2b3a54] rounded-full px-3 py-1">
        <select
          value={pageSize}
          onChange={e => { onPageSizeChange(parseInt(e.target.value)); onPageChange(1); }}
          className="bg-transparent border-none outline-none text-sm font-bold text-[#121c2a] dark:text-white cursor-pointer"
        >
          {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s} / page</option>)}
        </select>
      </div>

      {/* Go to page */}
      <div className="flex items-center gap-2 text-sm text-[#737686] dark:text-[#94a3b8]">
        <span>Go to</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={goInput}
          onChange={e => setGoInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleGo()}
          className="w-14 h-8 text-center border border-[#c3c5d7] dark:border-[#2b3a54] rounded-full bg-transparent outline-none text-sm font-bold text-[#121c2a] dark:text-white focus:border-[#003fb1] focus:ring-1 focus:ring-[#003fb1]"
        />
        <span>Page</span>
      </div>
    </div>
  );
}
