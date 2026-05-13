import { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { formatLaoDate } from '../utils/date';

function getEmbedUrl(url, source) {
  if (!url) return '';
  const s = source || 'youtube';

  if (s === 'youtube') {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=0`;
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return `https://www.youtube.com/embed/${url}?autoplay=1&mute=0`;
    return '';
  }

  if (s === 'facebook') {
    if (url.includes('facebook.com')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=734&height=413&appId`;
    }
    return '';
  }

  if (s === 'web') {
    return url.startsWith('http') ? url : '';
  }

  return '';
}

function getPreconnectHost(source) {
  if (source === 'facebook') return ['https://www.facebook.com', 'https://static.xx.fbcdn.net'];
  return ['https://www.youtube.com', 'https://i.ytimg.com'];
}

function getThumbnailUrl(url, source) {
  if (source !== 'youtube') return null;
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url?.match(regex);
  const id = match?.[1] || (/^[a-zA-Z0-9_-]{11}$/.test(url) ? url : null);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export default function LiveVdoBanner() {
  const { liveSettings, draws } = useData();
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const bannerRef = useRef(null);

  const source = liveSettings?.live_source || 'youtube';
  const rawUrl  = liveSettings?.youtube_live_url;
  const isLive  = liveSettings?.is_live === '1' && rawUrl;

  // Preconnect to video host when banner scrolls into view
  useEffect(() => {
    if (!isLive || playerLoaded) return;
    const el = bannerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        getPreconnectHost(source).forEach(host => {
          if (document.querySelector(`link[href="${host}"]`)) return;
          const link = document.createElement('link');
          link.rel = 'preconnect';
          link.href = host;
          document.head.appendChild(link);
        });
        observer.disconnect();
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isLive, playerLoaded, source]);

  if (!isLive) return null;

  const embedUrl    = getEmbedUrl(rawUrl, source);
  const thumbnailUrl = getThumbnailUrl(rawUrl, source);

  const latestDraw = draws?.[0];
  const threeDigits = latestDraw?.results_detail?.find(r => r.prize_type === '3_digits')?.result_value;
  const twoDigits   = latestDraw?.results_detail?.find(r => r.prize_type === '2_digits')?.result_value;

  return (
    <div
      ref={bannerRef}
      className="w-full bg-[#121c2a] rounded-3xl overflow-hidden shadow-2xl mb-12 border-4 border-[#ba1a1a]/20 animate-pulse-slow"
    >
      <div className="bg-[#ba1a1a] text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-black tracking-widest uppercase">
          <span className="material-symbols-outlined animate-pulse">podcasts</span>
          ກຳລັງຖ່າຍທອດສົດ
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white dark:bg-[#152033]/20 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            LIVE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Video Section — fixed 16:9 to prevent CLS */}
        <div className="lg:col-span-2 bg-black relative" style={{ aspectRatio: '16/9' }}>
          {playerLoaded && embedUrl ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={embedUrl}
              title="laolots.com Live Stream"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : playerLoaded && !embedUrl ? (
            // Can't embed — show direct link
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <span className="material-symbols-outlined text-5xl text-white/40">live_tv</span>
              <p className="text-white/60 text-sm">ບໍ່ສາມາດ embed ໄດ້</p>
              <a
                href={rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#ba1a1a] hover:bg-[#d32f2f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined">open_in_new</span>
                ເບິ່ງ Live ສົດ
              </a>
            </div>
          ) : (
            // Placeholder — click to load player
            <button
              type="button"
              onClick={() => setPlayerLoaded(true)}
              className="absolute inset-0 w-full h-full group"
              aria-label="ກົດເພື່ອເບິ່ງ Live"
            >
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt="Live stream thumbnail"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
              {/* Play button */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#ba1a1a] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl text-white translate-x-0.5">play_arrow</span>
                </div>
                <p className="text-white font-bold text-sm bg-black/50 px-4 py-1 rounded-full">
                  ກົດເພື່ອເບິ່ງ Live
                </p>
              </div>
            </button>
          )}
        </div>

        {/* Real-time Result Section */}
        <div className="bg-gradient-to-b from-[#1a2536] to-[#121c2a] p-6 lg:p-8 flex flex-col justify-center items-center text-center border-l border-white/5">
          <p className="text-[#a5b4fc] font-bold tracking-widest text-sm mb-1 uppercase">ຜົນລາງວັນສົດ</p>
          <h3 className="text-white font-black text-xl md:text-2xl mb-6 leading-relaxed">
            {formatLaoDate(new Date().toISOString())}
          </h3>

          {latestDraw ? (
            <div className="space-y-6 w-full">
              <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
                <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">ເລກທີ່ອອກ (ລ່າສຸດ)</p>
                <div className="text-5xl md:text-6xl font-black text-[#6cf8bb] tracking-widest font-mono">
                  {latestDraw.full_result || '......'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#ffffff]/5 p-4 rounded-xl border border-white/5">
                  <p className="text-white/50 text-xs mb-1">ເລກ 3 ໂຕ</p>
                  <p className="text-2xl font-black text-white">{threeDigits || '...'}</p>
                </div>
                <div className="bg-[#ffffff]/5 p-4 rounded-xl border border-white/5">
                  <p className="text-white/50 text-xs mb-1">ເລກ 2 ໂຕ</p>
                  <p className="text-2xl font-black text-white">{twoDigits || '..'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-white/50 animate-pulse mt-4">
              ກຳລັງລໍຖ້າຜົນການອອກລາງວັນ...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
