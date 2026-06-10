import { useState, useEffect, useRef } from 'react';
import { Radio, Play, ExternalLink, Tv } from 'lucide-react'
import { useData } from '../context/DataContext';
import { formatLaoDate } from '../utils/date';
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AspectRatio } from '@/components/ui/aspect-ratio'

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

function getPreconnectHost(source, url = '') {
  if (source === 'facebook') return ['https://www.facebook.com', 'https://static.xx.fbcdn.net'];
  if (source === 'web') {
    try { return [new URL(url).origin]; } catch { return []; }
  }
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
  const rawUrl = liveSettings?.youtube_live_url;
  const isLive = liveSettings?.is_live === '1' && rawUrl;
  // Web URLs load immediately — no thumbnail to lazy-load
  const isWebSource = source === 'web';

  // Preconnect to video host when banner enters viewport
  useEffect(() => {
    if (!isLive || playerLoaded) return;
    const el = bannerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        getPreconnectHost(source, rawUrl).forEach(host => {
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

  const embedUrl = getEmbedUrl(rawUrl, source);
  const thumbnailUrl = getThumbnailUrl(rawUrl, source);
  const latestDraw = draws?.[0];
  const threeDigits = latestDraw?.results_detail?.find(r => r.prize_type === '3_digits')?.result_value;
  const twoDigits = latestDraw?.results_detail?.find(r => r.prize_type === '2_digits')?.result_value;

  return (
    <div ref={bannerRef} className="w-full mb-12">
      <Card className="bg-[#0d0e1c]/80 backdrop-blur-md border border-[#d4af37]/25 overflow-hidden rounded-3xl shadow-[0_8px_32px_rgba(212,175,55,0.15)]">
        {/* Live header bar */}
        <div className="bg-gradient-to-r from-[#ba1a1a] via-[#800000] to-[#0d0e1c] border-b border-[#d4af37]/20 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black tracking-widest uppercase font-sans">
            <Radio className="w-5 h-5 animate-pulse text-[#ffd700]" />
            ກຳລັງຖ່າຍທອດສົດ
          </div>
          <Badge variant="live" className="bg-[#ba1a1a] text-white border border-[#ff6b6b]/30 shadow-[0_0_12px_rgba(186,26,26,0.5)] text-xs font-bold px-3 py-1 flex items-center gap-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            LIVE
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Video section — AspectRatio prevents CLS */}
          <div className="lg:col-span-2 bg-black">
            <AspectRatio ratio={16 / 9}>
              {(playerLoaded || isWebSource) && embedUrl ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={embedUrl}
                  title="laolots.com Live Stream"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (playerLoaded || isWebSource) && !embedUrl ? (
                /* Cannot embed — direct link fallback */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                  <Tv className="w-12 h-12 text-white/40" />
                  <p className="text-white/60 text-sm font-sans">ບໍ່ສາມາດ embed ໄດ້</p>
                  <a
                    href={rawUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#d4af37] hover:bg-[#ffd700] text-[#0d0e1c] px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md font-sans"
                  >
                    <ExternalLink className="w-4 h-4" />
                    ເບິ່ງ Live ສົດ
                  </a>
                </div>
              ) : (
                /* Thumbnail placeholder — click to load player */
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
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ffd700] via-[#e5c158] to-[#aa7c11] flex items-center justify-center shadow-[0_8px_24px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform border border-[#ffd700]/30">
                      <Play className="w-8 h-8 text-[#0d0e1c] translate-x-0.5 fill-[#0d0e1c]" />
                    </div>
                    <p className="text-white font-bold text-sm bg-black/60 px-4 py-1 rounded-full border border-white/10 font-sans">
                      ກົດເພື່ອເບິ່ງ Live
                    </p>
                  </div>
                </button>
              )}
            </AspectRatio>
          </div>

          {/* Real-time results sidebar */}
          <div className="bg-[#0a0b14]/90 p-6 lg:p-8 flex flex-col justify-center items-center text-center border-l border-white/[0.04]">
            <p className="text-[#ffd700] font-black tracking-widest text-xs mb-1 uppercase font-mono">ຜົນລາງວັນສົດ</p>
            <h3 className="text-white font-black text-xl md:text-2xl mb-6 leading-relaxed font-sans">
              {formatLaoDate(new Date().toISOString())}
            </h3>

            {latestDraw ? (
              <div className="space-y-6 w-full">
                <div className="bg-[#0d0e1c] p-6 rounded-2xl border border-[#d4af37]/20 shadow-[0_4px_16px_rgba(212,175,55,0.08)]">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2 font-sans">
                    ...ເລກທີ່ອອກ (ລ່າສຸດ)...
                  </p>
                  <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#ffd700] via-[#e5c158] to-[#aa7c11] bg-clip-text text-transparent tracking-widest font-mono">
                    {latestDraw.full_result || '......'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.04]">
                    <p className="text-white/40 text-xs mb-1 font-sans">ເລກ 3 ໂຕ</p>
                    <p className="text-2xl font-black text-[#ffd700] font-mono">{threeDigits || '...'}</p>
                  </div>
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.04]">
                    <p className="text-white/40 text-xs mb-1 font-sans">ເລກ 2 ໂຕ</p>
                    <p className="text-2xl font-black text-[#ffd700] font-mono">{twoDigits || '..'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-white/40 animate-pulse mt-4 font-sans">
                ກຳລັງລໍຖ້າຜົນການອອກລາງວັນ...
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
