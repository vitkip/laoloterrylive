import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';

export default function AdminLive() {
  const { liveSettings, refreshData } = useData();
  const [formData, setFormData] = useState({ youtube_live_url: '', is_live: '0' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (liveSettings) {
      setFormData({
        youtube_live_url: liveSettings.youtube_live_url || '',
        is_live: liveSettings.is_live || '0'
      });
    }
  }, [liveSettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('lao_lottery_token');
      const res = await fetch('http://localhost/laoloterylive/api/index.php?action=update_live_settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('ບັນທຶກການຕັ້ງຄ່າLiveສຳເລັດ!');
        if (refreshData) refreshData();
      } else {
        setMessage(data.error || 'ຂໍ້ຜິດພາດໃນການບັນທຶກ');
      }
    } catch (err) {
      setMessage('ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີບເວີໄດ້');
    }
    setLoading(false);
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1`;
    }
    // If they typed just an 11-character video ID directly
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return `https://www.youtube.com/embed/${url}?autoplay=1&mute=1`;
    }
    // Prevent relative path rendering which causes iframe inception
    return url.startsWith('http') ? url : '';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#dee9fd]">
        <h2 className="text-2xl font-bold text-[#121c2a] mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ba1a1a]">podcasts</span>
          ຈັດການຖ່າຍທອດສົດ (Live Stream)
        </h2>

        {message && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-bold ${message.includes('ສຳເລັດ') ? 'bg-[#6cf8bb]/30 text-[#00714d]' : 'bg-[#ffdad6]/30 text-[#ba1a1a]'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#434654] mb-2">ລິ້ງ YouTube Live (URL ຫຼື Video ID)</label>
            <input
              type="text"
              className="w-full bg-[#eff3ff] border-none rounded-lg p-3 text-[#121c2a] focus:ring-2 focus:ring-[#003fb1]"
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.youtube_live_url}
              onChange={(e) => setFormData({ ...formData, youtube_live_url: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#434654] mb-2">ສະຖານະຖ່າຍທອດສົດ</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-[#eff3ff] px-4 py-3 rounded-xl flex-1 border-2 border-transparent has-[:checked]:border-[#ba1a1a] has-[:checked]:bg-[#ffdad6]/30 transition-all">
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
                  ກຳລັງ Live สด!
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-[#eff3ff] px-4 py-3 rounded-xl flex-1 border-2 border-transparent has-[:checked]:border-[#434654] has-[:checked]:bg-[#e3e2e6] transition-all">
                <input
                  type="radio"
                  name="is_live"
                  value="0"
                  checked={formData.is_live === '0'}
                  onChange={(e) => setFormData({ ...formData, is_live: e.target.value })}
                  className="w-4 h-4 text-[#434654] focus:ring-[#434654]"
                />
                <span className="font-bold text-[#434654]">ປິດການຖ່າຍທອດສົດ</span>
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

      {formData.youtube_live_url && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#dee9fd]">
          <h3 className="text-sm font-bold text-[#434654] uppercase tracking-widest mb-4">ຕົວຢ່າງວີດີໂອ (Preview)</h3>
          <div className="aspect-video rounded-xl overflow-hidden bg-black">
            <iframe
              width="100%"
              height="100%"
              src={getEmbedUrl(formData.youtube_live_url)}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
