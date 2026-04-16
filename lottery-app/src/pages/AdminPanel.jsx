import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { API } from '../utils/api';

export default function AdminPanel() {
  const { animals, types, draws, refreshData } = useData();

  const [formData, setFormData] = useState({
    type_id: types?.[0]?.type_id || 1,
    draw_number: '',
    draw_date: new Date().toISOString().slice(0, 10),
    full_result: '',
    animal_id: '',
    youtube_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editDrawId, setEditDrawId] = useState(null);

  // 2-digit animal auto-suggest logic based on full_result
  const suggestedAnimals = useMemo(() => {
    if (formData.full_result.length >= 2) {
      const lastTwoDigits = formData.full_result.slice(-2);
      return animals.filter(a => a.animal_numbers.split(',').includes(lastTwoDigits));
    }
    return [];
  }, [formData.full_result, animals]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.full_result.length !== 6) {
      setMessage('ກະລຸນາປ້ອນເລກໃຫ້ຄົບ 6 ຕົວ');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('lao_lottery_token');
      const action = isEditing ? 'update_draw' : 'create_draw';
      const bodyPayload = {
        ...formData,
        animal_id: formData.animal_id ? parseInt(formData.animal_id) : (suggestedAnimals[0]?.animal_id || null)
      };
      if (isEditing) {
        bodyPayload.draw_id = editDrawId;
      }
      const res = await fetch(`${API}/index.php?action=${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(isEditing ? 'ອັບເດດຜົນສຳເລັດແລ້ວ!' : 'ບັນທຶກຜົນສຳເລັດແລ້ວ!');
        if (!isEditing) {
          setFormData({ ...formData, full_result: '', youtube_url: '', draw_number: parseInt(formData.draw_number) + 1 });
        } else {
          setIsEditing(false);
          setEditDrawId(null);
          setFormData({ ...formData, full_result: '', youtube_url: '', draw_number: parseInt(formData.draw_number) + 1 });
        }
        if (refreshData) refreshData();
      } else {
        setMessage(data.error || 'ຂໍ້ຜິດພາດໃນການບັນທຶກ');
      }
    } catch (err) {
      setMessage('ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີບເວີໄດ້');
    }
    setLoading(false);
  };

  const handleEdit = (draw) => {
    setIsEditing(true);
    setEditDrawId(draw.draw_id);
    const autoAnimalId = draw.results_detail?.find(r => r.prize_type === '2_digits')?.animal_id || '';
    setFormData({
      type_id: draw.type_id,
      draw_number: draw.draw_number.toString(),
      draw_date: draw.draw_date,
      full_result: draw.full_result,
      animal_id: autoAnimalId,
      youtube_url: draw.youtube_url || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditDrawId(null);
    setFormData({
      type_id: types?.[0]?.type_id || 1,
      draw_number: '',
      draw_date: new Date().toISOString().slice(0, 10),
      full_result: '',
      animal_id: '',
      youtube_url: ''
    });
  };

  return (
    <div className="space-y-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#152033] p-8 rounded-2xl shadow-sm border border-[#dee9fd] dark:border-[#2b3a54]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#121c2a] dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003fb1]">
              {isEditing ? 'edit_square' : 'add_circle'}
            </span>
            {isEditing ? `ແກ້ໄຂຜົນຫວຍ ງວດທີ ${formData.draw_number}` : 'ເພີ່ມຜົນການອອກລາງວັນໃໝ່'}
          </h2>
          {isEditing && (
            <button 
              type="button" 
              onClick={cancelEdit}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition"
            >
              ຍົກເລີກ
            </button>
          )}
        </div>

      {message && (
        <div className={`p-4 mb-6 rounded-lg text-sm font-bold ${message.includes('ສຳເລັດ') ? 'bg-[#6cf8bb]/30 text-[#00714d]' : 'bg-[#ffdad6]/30 text-[#ba1a1a]'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-[#434654] dark:text-[#c7d2fe] mb-2">ປະເພດຫວຍ</label>
            <select
              className="w-full bg-[#eff3ff] dark:bg-[#1e2d4a] border-none rounded-lg p-3 text-[#121c2a] dark:text-white focus:ring-2 focus:ring-[#003fb1]"
              value={formData.type_id}
              onChange={(e) => setFormData({ ...formData, type_id: parseInt(e.target.value) })}
              required
            >
              {types?.map(t => (
                <option key={t.type_id} value={t.type_id}>{t.type_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#434654] dark:text-[#c7d2fe] mb-2">ງວດວັນທີ</label>
            <input
              type="date"
              className="w-full bg-[#eff3ff] dark:bg-[#1e2d4a] border-none rounded-lg p-3 text-[#121c2a] dark:text-white focus:ring-2 focus:ring-[#003fb1]"
              value={formData.draw_date}
              onChange={(e) => setFormData({ ...formData, draw_date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-[#434654] dark:text-[#c7d2fe] mb-2">ງວດທີ (ເລກລຳດັບ)</label>
            <input
              type="number"
              className="w-full bg-[#eff3ff] dark:bg-[#1e2d4a] border-none rounded-lg p-3 text-[#121c2a] dark:text-white focus:ring-2 focus:ring-[#003fb1]"
              placeholder="ຕົວຢ່າງ: 202"
              value={formData.draw_number}
              onChange={(e) => setFormData({ ...formData, draw_number: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#434654] dark:text-[#c7d2fe] mb-2">ເລກທີ່ອອກ (6 ຕົວ)</label>
            <input
              type="text"
              maxLength={6}
              className="w-full bg-[#eff3ff] dark:bg-[#1e2d4a] border-none rounded-lg p-3 text-xl font-black text-[#003fb1] tracking-[0.5em] text-center focus:ring-2 focus:ring-[#003fb1]"
              placeholder="000000"
              value={formData.full_result}
              onChange={(e) => setFormData({ ...formData, full_result: e.target.value.replace(/[^0-9]/g, '') })}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#434654] dark:text-[#c7d2fe] mb-2">ເລືອກນາມສັດ (ຕາມເລກ 2 ຕົວ)</label>
          <select
            className="w-full bg-[#eff3ff] dark:bg-[#1e2d4a] border-none rounded-lg p-3 text-[#121c2a] dark:text-white focus:ring-2 focus:ring-[#003fb1]"
            value={formData.animal_id}
            onChange={(e) => setFormData({ ...formData, animal_id: e.target.value })}
          >
            <option value="">-- ເລືອກນາມສັດ (ອັດຕະໂນມັດຖ້າວ່າງ) --</option>
            {suggestedAnimals.map(a => (
              <option key={a.animal_id} value={a.animal_id}>
                ✅ ແນະນຳ: {a.animal_name_lao} (ເລກ {a.animal_numbers})
              </option>
            ))}
            <option disabled>──────────</option>
            {animals.map(a => (
              <option key={a.animal_id} value={a.animal_id}>
                {a.animal_name_lao} (ເລກ {a.animal_numbers})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#434654] dark:text-[#c7d2fe] mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[#ba1a1a] text-sm">smart_display</span>
            ລິ້ງວິດີໂອ YouTube Shorts (ທາງເລືອກ)
          </label>
          <input
            type="url"
            className="w-full bg-[#eff3ff] dark:bg-[#1e2d4a] border-none rounded-lg p-3 text-[#121c2a] dark:text-white focus:ring-2 focus:ring-[#ba1a1a]"
            placeholder="ເຊັ່ນ: https://youtube.com/shorts/..."
            value={formData.youtube_url}
            onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-3.5 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 ${isEditing ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-[#003fb1] to-[#1a56db]'}`}
        >
          {loading ? 'ກຳລັງປະມວນຜົນ...' : (isEditing ? 'ອັບເດດຂໍ້ມູນ' : 'ບັນທຶກເຂົ້າຖານຂໍ້ມູນ')}
        </button>
      </form>
    </div>

      <div className="max-w-3xl mx-auto bg-white dark:bg-[#152033] p-6 sm:p-8 rounded-2xl shadow-sm border border-[#dee9fd] dark:border-[#2b3a54]">
        <h3 className="text-lg font-bold text-[#121c2a] dark:text-white mb-4">ຜົນການອອກລາງວັນລ່າສຸດ (10 ງວດຫຼ້າສຸດ)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-[#eff3ff] dark:bg-[#1e2d4a] text-[#434654] dark:text-[#c7d2fe] text-xs uppercase tracking-widest font-bold">
                <th className="px-4 py-3 rounded-tl-lg">ງວດທີ</th>
                <th className="px-4 py-3">ວັນທີ</th>
                <th className="px-4 py-3">ເລກອອກ</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">ການຈັດການ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {draws?.slice(0, 10).map((d) => (
                <tr key={d.draw_id} className="border-b border-[#eff3ff] dark:border-[#1e2d4a] hover:bg-[#fafbff] transition">
                  <td className="px-4 py-3 font-medium text-[#121c2a] dark:text-white">{d.draw_number}</td>
                  <td className="px-4 py-3 text-[#434654] dark:text-[#c7d2fe]">{d.draw_date}</td>
                  <td className="px-4 py-3 font-bold text-[#003fb1] tracking-wider">{d.full_result}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => handleEdit(d)} 
                      className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1 text-xs font-bold rounded-lg transition"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      ແກ້ໄຂ
                    </button>
                  </td>
                </tr>
              ))}
              {(!draws || draws.length === 0) && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">ບໍ່ມີຂໍ້ມູນ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
