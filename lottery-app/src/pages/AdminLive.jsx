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
    <div className="space-y-6">

      {/* ─── Two-column grid: Settings | Preview ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* ─── Col 1: Settings ─── */}
        <div className="lg:col-span-2">
          <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ba1a1a]">podcasts</span>
              ຈັດການຖ່າຍທອດສົດ (Live Stream)
            </h2>

            {message && (
              <div className={`p-4 mb-6 rounded-lg text-sm font-bold ${message.includes('ສຳເລັດ') ? 'bg-[#6cf8bb]/30 text-[#00714d]' : 'bg-[#ffdad6]/30 text-[#ba1a1a]'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Source Type Selector */}
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-3">ເລືອກແຫຼ່ງ Live</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SOURCE_OPTIONS.map(opt => (
                    <label
                      key={opt.value}
                      className={`flex flex-col items-center gap-2 cursor-pointer p-4 rounded-xl border-2 transition-all
                        ${formData.live_source === opt.value
                          ? 'border-[#003fb1] bg-[#003fb1]/10 dark:bg-[#003fb1]/20'
                          : 'border-transparent bg-secondary hover:border-[#003fb1]/40'}`}
                    >
                      <input
                        type="radio"
                        name="live_source"
                        value={opt.value}
                        checked={formData.live_source === opt.value}
                        onChange={(e) => setFormData({ ...formData, live_source: e.target.value })}
                        className="sr-only"
                      />
                      <span className={`material-symbols-outlined text-2xl ${formData.live_source === opt.value ? 'text-[#003fb1]' : 'text-muted-foreground'}`}>
                        {opt.icon}
                      </span>
                      <span className={`text-xs font-bold text-center ${formData.live_source === opt.value ? 'text-[#003fb1]' : 'text-muted-foreground'}`}>
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2">
                  ລິ້ງ {currentSource.label}
                </label>
                <input
                  type="text"
                  className="w-full bg-secondary border-none rounded-lg p-3 text-foreground focus:ring-2 focus:ring-[#003fb1]"
                  placeholder={currentSource.placeholder}
                  value={formData.youtube_live_url}
                  onChange={(e) => setFormData({ ...formData, youtube_live_url: e.target.value })}
                />
                {formData.live_source === 'web' && (
                  <p className="text-xs text-[#434654]/70 dark:text-[#c7d2fe]/60 mt-1">
                    ຕົວຢ່າງ: https://laotv.la/live.html — ເວັບໄຊບາງແຫ່ງອາດບໍ່ຮອງຮັບການ embed
                  </p>
                )}
                {formData.live_source === 'facebook' && (
                  <p className="text-xs text-[#434654]/70 dark:text-[#c7d2fe]/60 mt-1">
                    ຕົວຢ່າງ: https://www.facebook.com/laolotteryliveofficial/videos/1244074054169696/
                  </p>
                )}
              </div>

              {/* Live Status */}
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2">ສະຖານະຖ່າຍທອດສົດ</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer bg-secondary px-4 py-3 rounded-xl flex-1 border-2 border-transparent has-[:checked]:border-[#ba1a1a] has-[:checked]:bg-[#ffdad6]/30 transition-all">
                    <input
                      type="radio"
                      name="is_live"
                      value="1"
                      checked={formData.is_live === '1'}
                      onChange={(e) => setFormData({ ...formData, is_live: e.target.value })}
                      className="w-4 h-4 text-[#ba1a1a] focus:ring-[#ba1a1a]"
                    />
                    <span className="font-bold text-[#ba1a1a] flex items-center gap-1">
                      <span className="material-symbols-outlined animate-pulse text-sm">sensors</span>
                      ກຳລັງ Live ສົດ!
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-secondary px-4 py-3 rounded-xl flex-1 border-2 border-transparent has-[:checked]:border-[#434654] has-[:checked]:bg-[#e3e2e6] transition-all">
                    <input
                      type="radio"
                      name="is_live"
                      value="0"
                      checked={formData.is_live === '0'}
                      onChange={(e) => setFormData({ ...formData, is_live: e.target.value })}
                      className="w-4 h-4 text-muted-foreground focus:ring-[#434654]"
                    />
                    <span className="font-bold text-muted-foreground">ປິດການຖ່າຍທອດສົດ</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#003fb1] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-[#1a56db] transition-colors disabled:opacity-50"
              >
                {loading ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກການຕັ້ງຄ່າ'}
              </button>
            </form>
          </div>
        </div>{/* end col-1 settings */}

        {/* ─── Col 2: Preview ─── */}
        <div className="lg:col-span-3">
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#003fb1] text-[16px]">live_tv</span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">ຕົວຢ່າງ Live Preview</h3>
                  <p className="text-[10px] text-muted-foreground">ຈະສະແດງຕາມ URL ທີ່ປ້ອນ</p>
                </div>
              </div>
              {formData.youtube_live_url && (
                <a
                  href={formData.youtube_live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#003fb1] font-bold flex items-center gap-1 hover:underline"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  ເປີດໃໝ່
                </a>
              )}
            </div>

            {formData.youtube_live_url && previewUrl ? (
              <div className="relative w-full bg-black" style={{ paddingTop: '56.25%' }}>
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
              <div className="relative w-full bg-[#f5f7ff] dark:bg-[#1a2844]" style={{ paddingTop: '56.25%' }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-4xl text-muted-foreground">link_off</span>
                  <p className="text-sm text-muted-foreground font-medium">ບໍ່ສາມາດ Preview URL ນີ້ໄດ້</p>
                  <p className="text-xs text-muted-foreground">ກວດສອບ URL ໃຫ້ຖືກຕ້ອງ</p>
                </div>
              </div>
            ) : (
              <div className="relative w-full bg-[#f5f7ff] dark:bg-[#1a2844]" style={{ paddingTop: '56.25%' }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[32px] text-[#ba1a1a]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_display</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">ຍັງບໍ່ມີ URL</p>
                    <p className="text-xs text-muted-foreground mt-1">ໃສ່ URL ທາງຊ້າຍ ແລ້ວ Preview ຈະປາກົດທີ່ນີ້</p>
                  </div>
                  {formData.is_live === '1' && (
                    <div className="flex items-center gap-2 bg-[#ffdad6]/50 dark:bg-[#7f1d1d]/30 text-[#ba1a1a] text-xs font-bold px-4 py-2 rounded-full border border-[#ffdad6]">
                      <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse" />
                      ກຳລັງ Live — ຕ້ອງໃສ່ URL
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Live status indicator card */}
          <div className={`mt-4 flex items-center gap-3 p-4 rounded-2xl border ${
            formData.is_live === '1'
              ? 'bg-[#ffdad6]/30 border-[#ffdad6] dark:bg-[#7f1d1d]/20 dark:border-[#7f1d1d]/50'
              : 'bg-secondary border-border'
          }`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${formData.is_live === '1' ? 'bg-[#ba1a1a]/10' : 'bg-card'}`}>
              <span className={`material-symbols-outlined text-[18px] ${formData.is_live === '1' ? 'text-[#ba1a1a] animate-pulse' : 'text-muted-foreground'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {formData.is_live === '1' ? 'sensors' : 'sensors_off'}
              </span>
            </div>
            <div>
              <p className={`text-sm font-extrabold ${formData.is_live === '1' ? 'text-[#ba1a1a]' : 'text-muted-foreground'}`}>
                {formData.is_live === '1' ? 'LIVE ສົດ ກຳລັງດຳເນີນ' : 'ປິດການຖ່າຍທອດສົດ'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {formData.is_live === '1' ? 'ຜູ້ໃຊ້ທົ່ວໄປຈະເຫັນ banner Live ໃນໜ້າຫຼັກ' : 'ຜູ້ໃຊ້ທົ່ວໄປຈະບໍ່ເຫັນ banner Live'}
              </p>
            </div>
          </div>
        </div>{/* end col-2 preview */}

      </div>{/* end two-column grid */}
    </div>
  );
}
