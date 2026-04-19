import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { formatLaoDate } from '../utils/date';
import { resolveAnimalImage } from '../utils/api';
import Pagination from './Pagination';

// ── YouTube URL → embed ID ──
function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// ── Video Modal ──
function VideoModal({ draw, onClose }) {
  const videoId = getYouTubeId(draw?.youtube_url);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      {/* Modal card */}
      <div
        className="relative z-10 w-full max-w-2xl bg-[#0d1627] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#ba1a1a]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#ff6b6b] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                smart_display
              </span>
            </div>
            <div>
              <p className="text-sm font-extrabold text-white leading-tight">
                ວິດີໂອງວດທີ {draw?.draw_number}
              </p>
              <p className="text-[11px] text-white/50">
                {formatLaoDate(draw?.draw_date, true)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-white text-[18px]">close</span>
          </button>
        </div>

        {/* Video embed */}
        <div className="aspect-video bg-black">
          {videoId ? (
            <iframe
              key={videoId}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title="Lao Lottery Video"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-white/30 text-[48px]">videocam_off</span>
              <p className="text-white/40 text-sm">ບໍ່ພົບລິ້ງວິດີໂອ</p>
              {draw?.youtube_url && (
                <a
                  href={draw.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ff6b6b] text-xs underline"
                >
                  ເປີດໃນ YouTube
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
          <p className="text-[11px] text-white/40">
            ກົດ ESC ຫຼື ກົດນອກ ເພື່ອປິດ
          </p>
          {draw?.youtube_url && (
            <a
              href={draw.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] font-bold text-white/60 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              ເປີດໃນ YouTube
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

const DigitPair = ({ value }) => (
  <span className="inline-flex items-center gap-0.5">
    {value.split('').map((d, i) => (
      <span
        key={i}
        className="w-6 h-8 flex items-center justify-center rounded-md bg-[#eff3ff] dark:bg-[#1e2d4a] text-[#003fb1] dark:text-[#93b4ff] text-sm font-black"
      >
        {d}
      </span>
    ))}
  </span>
)

export default function ArchiveTable({ compact = false }) {
  const { draws, animals } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [videoModalDraw, setVideoModalDraw] = useState(null);

  if (!draws || draws.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <span className="material-symbols-outlined text-4xl text-[#003fb1] animate-spin">progress_activity</span>
      <p className="text-sm text-[#737686] dark:text-[#94a3b8] font-medium">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
    </div>
  );

  const filteredDraws = draws.filter(d => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      d.full_result.includes(term) ||
      formatLaoDate(d.draw_date, true).toLowerCase().includes(term) ||
      d.draw_number.toString().includes(term)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredDraws.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedDraws = filteredDraws.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <>
    {videoModalDraw && (
      <VideoModal draw={videoModalDraw} onClose={() => setVideoModalDraw(null)} />
    )}
    <section className={compact ? '' : ''}>

      {/* ─── Toolbar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">

        {/* Result count */}
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#003fb1] to-[#1a56db]" />
          <h3 className="text-base sm:text-lg font-extrabold text-[#121c2a] dark:text-white">
            ຜົນທັງໝົດ
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-[#eff3ff] dark:bg-[#1e2d4a] text-[#003fb1] dark:text-[#93b4ff] text-xs font-bold">
            {filteredDraws.length} ງວດ
          </span>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#152033] px-3.5 py-2.5 rounded-xl border border-[#e8edf8] dark:border-[#2b3a54] shadow-sm w-full sm:w-72 focus-within:ring-2 focus-within:ring-[#003fb1] focus-within:border-[#003fb1] transition-all">
          <span className="material-symbols-outlined text-[#a0a3bd] text-[18px] shrink-0">search</span>
          <input
            type="text"
            placeholder="ຄົ້ນຫາວັນທີ, ງວດ, ເລກ..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            className="border-none outline-none bg-transparent text-sm w-full placeholder:text-[#a0a3bd] text-[#121c2a] dark:text-white"
          />
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); setPage(1); }}
              className="text-[#a0a3bd] hover:text-[#ba1a1a] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-2xl border border-[#e8edf8] dark:border-[#2b3a54] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[580px]">

            <thead>
              <tr className="bg-gradient-to-r from-[#e8edf8] to-[#f0f4ff] dark:from-[#1e2d4a] dark:to-[#1a2640] border-b border-[#dce3f5] dark:border-[#2b3a54]">
                <th className="px-4 sm:px-5 py-3.5 text-[10px] font-extrabold text-[#555870] dark:text-[#94a3b8] uppercase tracking-widest w-10">#</th>
                <th className="px-4 sm:px-5 py-3.5 text-[10px] font-extrabold text-[#555870] dark:text-[#94a3b8] uppercase tracking-widest">ງວດວັນທີ</th>
                <th className="px-4 sm:px-5 py-3.5 text-[10px] font-extrabold text-[#555870] dark:text-[#94a3b8] uppercase tracking-widest">ເລກທີ່ອອກ</th>
                <th className="px-4 sm:px-5 py-3.5 text-[10px] font-extrabold text-[#555870] dark:text-[#94a3b8] uppercase tracking-widest">ນາມສັດ (2 ຕົວ)</th>
                <th className="px-4 sm:px-5 py-3.5 text-[10px] font-extrabold text-[#555870] dark:text-[#94a3b8] uppercase tracking-widest text-center">ວິດີໂອ</th>
              </tr>
            </thead>

            <tbody>
              {pagedDraws.map((row, idx) => {
                const twoDigitResult = row.results_detail?.find(r => r.prize_type === '2_digits');
                const animal = animals.find(a => String(a.animal_id) === String(twoDigitResult?.animal_id));
                const animalImg = resolveAnimalImage(animal);
                const pairs = row.full_result.length >= 6
                  ? [row.full_result.slice(0,2), row.full_result.slice(2,4), row.full_result.slice(4,6)]
                  : [];
                const rowNum = (safePage - 1) * pageSize + idx + 1;

                return (
                  <tr
                    key={row.draw_id}
                    className={`group border-b border-[#f0f4ff] dark:border-[#1e2d4a] last:border-0 hover:bg-[#f5f8ff] dark:hover:bg-[#1e2d4a]/60 transition-colors duration-150 ${
                      idx % 2 === 0 ? 'bg-white dark:bg-[#152033]' : 'bg-[#fafbff] dark:bg-[#162030]'
                    }`}
                  >
                    {/* Row number */}
                    <td className="px-4 sm:px-5 py-4">
                      <span className="text-[11px] font-bold text-[#a0a3bd] dark:text-[#555870]">{rowNum}</span>
                    </td>

                    {/* Date + draw number */}
                    <td className="px-4 sm:px-5 py-4">
                      <p className="text-sm font-bold text-[#121c2a] dark:text-white leading-tight">
                        {formatLaoDate(row.draw_date, true)}
                      </p>
                      <p className="text-[11px] text-[#a0a3bd] dark:text-[#555870] mt-0.5 font-medium">
                        ງວດທີ {row.draw_number}
                      </p>
                    </td>

                    {/* Result digits */}
                    <td className="px-4 sm:px-5 py-4">
                      {pairs.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          {pairs.map((pair, i) => (
                            <div key={i} className="flex items-center gap-0.5">
                              <DigitPair value={pair} />
                              {i < pairs.length - 1 && (
                                <span className="mx-0.5 text-[#c3c5d7] dark:text-[#2b3a54] text-xs font-black">·</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-base font-black text-[#003fb1]">{row.full_result}</span>
                      )}
                    </td>

                    {/* Animal */}
                    <td className="px-4 sm:px-5 py-4">
                      {animal ? (
                        <div className="flex items-center gap-2">
                          {animalImg && (
                            <img
                              src={animalImg}
                              alt={animal.animal_name_lao}
                              className="w-8 h-8 rounded-lg object-contain bg-[#eff3ff] dark:bg-[#1e2d4a] p-0.5 shrink-0"
                              onError={e => { e.target.style.display = 'none' }}
                            />
                          )}
                          <div>
                            <p className="text-sm font-bold text-[#121c2a] dark:text-white leading-tight">
                              {animal.animal_name_lao}
                            </p>
                            <p className="text-[11px] text-[#a0a3bd] dark:text-[#555870] font-medium">
                              {twoDigitResult.result_value}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#c3c5d7] dark:text-[#2b3a54] text-sm">—</span>
                      )}
                    </td>

                    {/* Video */}
                    <td className="px-4 sm:px-5 py-4 text-center">
                      <button
                        onClick={() => setVideoModalDraw(row)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fff0f0] dark:bg-[#2a1010] text-[#ba1a1a] border border-[#ffdad6]/60 dark:border-[#5c1515] hover:bg-[#ffdad6] hover:shadow-sm font-bold text-[11px] transition-all duration-200 group-hover:border-[#ffdad6]"
                      >
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                        ເບິ່ງ
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Empty state ─── */}
      {searchTerm && filteredDraws.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#eff3ff] dark:bg-[#1e2d4a] flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px] text-[#a0a3bd]">search_off</span>
          </div>
          <p className="text-sm font-bold text-[#737686] dark:text-[#94a3b8]">
            ບໍ່ພົບຂໍ້ມູນສຳລັບ
          </p>
          <p className="text-xs text-[#a0a3bd] bg-[#eff3ff] dark:bg-[#1e2d4a] px-3 py-1 rounded-full font-mono">
            "{searchTerm}"
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-1 text-xs text-[#003fb1] font-bold hover:underline"
          >
            ລ້າງການຄົ້ນຫາ
          </button>
        </div>
      )}

      {/* ─── Pagination ─── */}
      {filteredDraws.length > 0 && (
        <Pagination
          total={filteredDraws.length}
          page={safePage}
          pageSize={pageSize}
          onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          onPageSizeChange={s => { setPageSize(s); setPage(1); }}
        />
      )}
    </section>
    </>
  )
}
