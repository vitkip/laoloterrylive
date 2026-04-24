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

export default function LiveVdoBanner() {
  const { liveSettings, draws } = useData();

  if (!liveSettings || liveSettings.is_live !== '1' || !liveSettings.youtube_live_url) {
    return null;
  }

  const source = liveSettings.live_source || 'youtube';
  const rawUrl = liveSettings.youtube_live_url;
  const embedUrl = getEmbedUrl(rawUrl, source);

  const latestDraw = draws?.[0];
  const threeDigits = latestDraw?.results_detail?.find(r => r.prize_type === '3_digits')?.result_value;
  const twoDigits   = latestDraw?.results_detail?.find(r => r.prize_type === '2_digits')?.result_value;

  return (
    <div className="w-full bg-[#121c2a] rounded-3xl overflow-hidden shadow-2xl mb-12 border-4 border-[#ba1a1a]/20 animate-pulse-slow">
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
        {/* Video Player Section */}
        <div className="lg:col-span-2 aspect-video bg-black relative">
          {embedUrl ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={embedUrl}
              title="laolots.com Live Stream"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <span className="material-symbols-outlined text-5xl text-white/40">live_tv</span>
              <p className="text-white/60 text-sm">ບໍ່ສາມາດ embed ໄດ້ — ກົດປຸ່ມດ້ານເທິງເພື່ອເປີດດູ Live</p>
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
