import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { API } from '../utils/api';

const SOURCE_OPTIONS = [
  { value: 'youtube', label: 'YouTube Live', icon: 'smart_display', placeholder: 'https://www.youtube.com/watch?v=...' },
  { value: 'facebook', label: 'Facebook Live', icon: 'thumb_up', placeholder: 'https://www.facebook.com/.../videos/...' },
  { value: 'web', label: 'ເວັບໄຊ URL', icon: 'language', placeholder: 'https://laotv.la/live.html' },
];

function getEmbedUrl(url, source) {
  if (!url) return '';
  if (source === 'youtube') {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1`;
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return `https://www.youtube.com/embed/${url}?autoplay=1&mute=1`;
    return '';
  }
  if (source === 'facebook') {
    const fbRegex = /facebook\.com\/.+\/videos\/(\d+)/i;
    const fbMatch = url.match(fbRegex);
    if (fbMatch || url.includes('facebook.com')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=734&height=413&appId`;
    }
    return '';
  }
  if (source === 'web') {
    return url.startsWith('http') ? url : '';
  }
  return '';
}

export default function AdminLive() {
  const { liveSettings, refreshData } = useData();
  const { authFetch } = useAuth();
  const [formData, setFormData] = useState({ youtube_live_url: '', is_live: '0', live_source: 'youtube' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (liveSettings) {
      setFormData({
        youtube_live_url: liveSettings.youtube_live_url || '',
        is_live: liveSettings.is_live || '0',
        live_source: liveSettings.live_source || 'youtube',
      });
    }
  }, [liveSettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { ok, data } = await authFetch(`${API}/index.php?action=update_live_settings`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (ok) {
        setMessage('ບັນທຶກການຕັ້ງຄ່າ Live ສຳເລັດ!');
        if (refreshData) refreshData();
      } else {
        setMessage(data.error || 'ຂໍ້ຜິດພາດໃນການບັນທຶກ');
      }
    } catch {
      setMessage('ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີບເວີໄດ້');
    }
    setLoading(false);
  };

  const currentSource = SOURCE_OPTIONS.find(s => s.value === formData.live_source) || SOURCE_OPTIONS[0];
  const previewUrl = getEmbedUrl(formData.youtube_live_url, formData.live_source);

  return (
    <div className="space-y-6 text-left select-none">
      <style>{`
        .glass-panel {
          background: linear-gradient(158deg, rgba(14, 18, 44, 0.75) 0%, rgba(9, 12, 32, 0.85) 50%, rgba(5, 7, 18, 0.95) 100%);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(16px);
        }
      `}</style>

      {/* ─── Page Header Banner ─── */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1020] via-[#090b16] to-[#04060e]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.08),transparent_60%)]" />
        <div className="relative z-10 px-6 py-5.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#d4af37] rounded-full px-3 py-1 mb-2">
              <span className="material-symbols-outlined text-[13px] animate-pulse">podcasts</span>
              <span className="text-[9px] font-black uppercase tracking-widest">Live Control Room</span>
            </div>
            <h1 className="text-xl sm:text-2.5xl font-black text-white leading-tight font-headline">
              ຈັດການຖ່າຍທອດສົດ <span className="text-[#d4af37] ml-1.5">(Live Stream)</span>
            </h1>
            <p className="text-white/50 text-[11px] mt-1.5 font-bold">ກຳນົດລິ້ງ URL ຖ່າຍທອດສົດ ແລະ ເປີດ/ປິດ ປ້າຍ Live ສົດໃນໜ້າຫຼັກ</p>
          </div>
        </div>
      </div>

      {/* ─── Two-column grid: Settings | Preview ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* ─── Col 1: Settings ─── */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
            <h2 className="text-base font-black text-white mb-6 flex items-center gap-2 relative z-10 font-headline">
              <span className="material-symbols-outlined text-[#d4af37]">settings_input_antenna</span>
              ຕັ້ງຄ່າການຖ່າຍທອດສົດ
            </h2>

            {message && (
              <div className={`p-4 mb-6 rounded-xl text-xs font-black border relative z-10 shadow-sm
                ${message.includes('ສຳເລັດ') 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Source Type Selector */}
              <div className="space-y-2.5">
                <label className="block text-[10px] font-black text-white/35 uppercase tracking-widest">ເລືອກແຫຼ່ງ Live (SOURCE)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SOURCE_OPTIONS.map(opt => (
                    <label
                      key={opt.value}
                      className={`flex flex-col items-center gap-2.5 cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 select-none
                        ${formData.live_source === opt.value
                          ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37] scale-[1.02] shadow-md shadow-[#d4af37]/5'
                          : 'border-white/[0.06] bg-[#0b0e1a] hover:border-[#d4af37]/45 text-white/40'}`}
                    >
                      <input
                        type="radio"
                        name="live_source"
                        value={opt.value}
                        checked={formData.live_source === opt.value}
                        onChange={(e) => setFormData({ ...formData, live_source: e.target.value })}
                        className="sr-only"
                      />
                      <span className={`material-symbols-outlined text-2.5xl ${formData.live_source === opt.value ? 'text-[#d4af37]' : 'text-white/20'}`}>
                        {opt.icon}
                      </span>
                      <span className="text-[10px] font-black text-center whitespace-nowrap">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-white/35 uppercase tracking-widest">
                  ລິ້ງ {currentSource.label} (URL)
                </label>
                <div className="bg-[#0b0e1a] border border-white/[0.06] rounded-xl overflow-hidden focus-within:border-[#d4af37] focus-within:ring-2 focus-within:ring-[#d4af37]/20 transition-all duration-300">
                  <input
                    type="text"
                    className="w-full bg-transparent px-3.5 py-3 text-white text-xs font-semibold placeholder:text-white/20 outline-none"
                    placeholder={currentSource.placeholder}
                    value={formData.youtube_live_url}
                    onChange={(e) => setFormData({ ...formData, youtube_live_url: e.target.value })}
                  />
                </div>
                {formData.live_source === 'web' && (
                  <p className="text-[9.5px] text-white/30 font-bold leading-relaxed pt-1">
                    ຕົວຢ່າງ: https://laotv.la/live.html — ເວັບໄຊບາງແຫ່ງອາດບໍ່ຮອງຮັບການ embed
                  </p>
                )}
                {formData.live_source === 'facebook' && (
                  <p className="text-[9.5px] text-white/30 font-bold leading-relaxed pt-1">
                    ຕົວຢ່າງ: https://www.facebook.com/laolotteryliveofficial/videos/1244074054169696/
                  </p>
                )}
              </div>

              {/* Live Status */}
              <div className="space-y-2.5">
                <label className="block text-[10px] font-black text-white/35 uppercase tracking-widest">ສະຖານະຖ່າຍທອດສົດ (STATUS)</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer bg-[#0b0e1a] px-4 py-3.5 rounded-xl flex-1 border border-white/[0.06] has-[:checked]:border-rose-500 has-[:checked]:bg-rose-500/10 transition-all duration-300 select-none">
                    <input
                      type="radio"
                      name="is_live"
                      value="1"
                      checked={formData.is_live === '1'}
                      onChange={(e) => setFormData({ ...formData, is_live: e.target.value })}
                      className="w-4 h-4 text-rose-500 focus:ring-rose-500 cursor-pointer"
                    />
                    <span className="font-black text-rose-500 flex items-center gap-1.5 text-xs select-none">
                      <span className="material-symbols-outlined animate-pulse text-sm">sensors</span>
                      ກຳລັງ Live ສົດ!
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-[#0b0e1a] px-4 py-3.5 rounded-xl flex-1 border border-white/[0.06] has-[:checked]:border-white/20 has-[:checked]:bg-white/[0.04] transition-all duration-300 select-none">
                    <input
                      type="radio"
                      name="is_live"
                      value="0"
                      checked={formData.is_live === '0'}
                      onChange={(e) => setFormData({ ...formData, is_live: e.target.value })}
                      className="w-4 h-4 text-white/30 focus:ring-[#d4af37] cursor-pointer"
                    />
                    <span className="font-bold text-white/45 text-xs select-none">ປິດການ Live</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d4af37] hover:bg-[#b8860b] text-black py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/5 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/35 border-t-black rounded-full animate-spin" />
                    <span>ກຳລັງບັນທຶກ...</span>
                  </div>
                ) : 'ບັນທຶກການຕັ້ງຄ່າ Live'}
              </button>
            </form>
          </div>
        </div>{/* end col-1 settings */}

        {/* ─── Col 2: Preview ─── */}
        <div className="lg:col-span-3">
          <div className="glass-panel rounded-3xl overflow-hidden relative group shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05] relative z-10 bg-black/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/[0.06] text-[#d4af37]">
                  <span className="material-symbols-outlined text-[16px]">live_tv</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white leading-tight">ຕົວຢ່າງ Live Preview</h3>
                  <p className="text-[10px] text-white/35 font-bold uppercase mt-0.5">Stream Output preview</p>
                </div>
              </div>
              {formData.youtube_live_url && (
                <a
                  href={formData.youtube_live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-black uppercase text-[#d4af37] hover:text-[#fbbf24] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  ເປີດລິ້ງໃໝ່
                </a>
              )}
            </div>

            {formData.youtube_live_url && previewUrl ? (
              <div className="relative w-full bg-black z-10" style={{ paddingTop: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={previewUrl}
                  title="Live Preview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : formData.youtube_live_url && !previewUrl ? (
              <div className="relative w-full bg-black/25 z-10 border-t border-white/[0.03]" style={{ paddingTop: '56.25%' }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-4xl text-white/10">link_off</span>
                  <p className="text-xs font-black text-white/35 uppercase tracking-wider">ບໍ່ສາມາດ Preview URL ນີ້ໄດ້</p>
                  <p className="text-[10px] text-white/20 font-bold">ກະລຸນາກວດສອບ URL ໃຫ້ຖືກຕ້ອງ</p>
                </div>
              </div>
            ) : (
              <div className="relative w-full bg-black/25 z-10 border-t border-white/[0.03]" style={{ paddingTop: '56.25%' }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#0b0e1a] border border-white/[0.06] flex items-center justify-center shadow-md text-[#d4af37]">
                    <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_display</span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-white/30 uppercase tracking-widest">ຍັງບໍ່ມີລິ້ງ URL ຖ່າຍທອດສົດ</p>
                    <p className="text-[10px] text-white/20 font-bold mt-1">ໃສ່ URL ທາງຊ້າຍ ແລ້ວ Preview ຈະປາກົດທີ່ນີ້</p>
                  </div>
                  {formData.is_live === '1' && (
                    <div className="flex items-center gap-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      ກຳລັງ Live — ຕ້ອງໃສ່ URL
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Live status indicator card */}
          <div className={`mt-4 flex items-center gap-3.5 p-4 rounded-2xl border transition-all duration-300 ${
            formData.is_live === '1'
              ? 'bg-rose-500/5 border-rose-500/20 shadow-md shadow-rose-500/5'
              : 'bg-white/[0.02] border-white/[0.05]'
          }`}>
            <div className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
              formData.is_live === '1' 
                ? 'bg-rose-500/15 border-rose-500/20 text-rose-500' 
                : 'bg-white/[0.03] border-white/[0.06] text-white/20'
            }`}>
              <span className={`material-symbols-outlined text-[18px] ${formData.is_live === '1' ? 'animate-pulse font-black' : ''}`}>
                {formData.is_live === '1' ? 'sensors' : 'sensors_off'}
              </span>
            </div>
            <div>
              <p className={`text-xs font-black leading-none ${formData.is_live === '1' ? 'text-rose-500' : 'text-white/45'}`}>
                {formData.is_live === '1' ? 'LIVE ສົດ ກຳລັງດຳເນີນ (ACTIVE)' : 'ປິດການຖ່າຍທອດສົດ (INACTIVE)'}
              </p>
              <p className="text-[9.5px] text-white/30 font-bold mt-1.5 leading-none">
                {formData.is_live === '1' ? 'ຜູ້ໃຊ້ທົ່ວໄປຈະເຫັນ banner Live ໃນໜ້າຫຼັກ' : 'ຜູ້ໃຊ້ທົ່ວໄປຈະບໍ່ເຫັນ banner Live'}
              </p>
            </div>
          </div>
        </div>{/* end col-2 preview */}

      </div>{/* end two-column grid */}
    </div>
  );
}
