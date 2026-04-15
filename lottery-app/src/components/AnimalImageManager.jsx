import { useState } from 'react';
import { useData } from '../context/DataContext';

export default function AnimalImageManager() {
  const { animals, refreshData } = useData();
  const [uploadingId, setUploadingId] = useState(null);
  const [message, setMessage] = useState('');

  const handleImageUpload = async (e, animalId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingId(animalId);
    setMessage('');

    // Client-side Resize/Crop to 300x300
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise(resolve => { img.onload = resolve; });

    const canvas = document.createElement('canvas');
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    // Calculate aspect ratio crop (cover)
    const scale = Math.max(size / img.width, size / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (size - w) / 2;
    const y = (size - h) / 2;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, x, y, w, h);

    canvas.toBlob(async (blob) => {
      const token = localStorage.getItem('lao_lottery_token');
      const formData = new FormData();
      formData.append('animal_id', animalId);
      formData.append('image', blob, 'animal.png');

      try {
        const res = await fetch('http://localhost/laoloterylive/api/index.php?action=upload_animal_image', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        const data = await res.json();
        if (res.ok) {
          setMessage('ອັບໂຫຼດຮູບພາບສຳເລັດ!');
          if (refreshData) refreshData();
        } else {
          setMessage(data.error || 'ເກີດຂໍ້ຜິດພາດໃນການອັບໂຫຼດ');
        }
      } catch (err) {
        setMessage('ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີບເວີໄດ້');
      }
      
      setUploadingId(null);
      e.target.value = ''; // Reset file input
    }, 'image/png');
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#dee9fd] mt-10">
      <h2 className="text-2xl font-bold text-[#121c2a] mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#006c49]">image</span>
        ຈັດການຮູບນາມສັດ
      </h2>

      {message && (
        <div className={`p-4 mb-6 rounded-lg text-sm font-bold ${message.includes('ສຳເລັດ') ? 'bg-[#6cf8bb]/30 text-[#00714d]' : 'bg-[#ffdad6]/30 text-[#ba1a1a]'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {animals.map((animal) => {
          const isUploadedImage = animal.image_url && (animal.image_url.startsWith('/') || animal.image_url.startsWith('http'));
          let displayUrl = `/images/animals/${animal.animal_id}.png`;
          if (isUploadedImage) {
            displayUrl = animal.image_url.startsWith('/laoloterylive') ? `http://localhost${animal.image_url}` : animal.image_url;
          }

          return (
            <div key={animal.animal_id} className="bg-[#f9f9ff] border border-[#dee9fd] rounded-xl p-4 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#e6eeff] rounded-full overflow-hidden mb-3 relative flex items-center justify-center">
                <img 
                  src={displayUrl} 
                  alt={animal.animal_name_lao}
                  className="w-full h-full object-cover bg-white z-10"
                  onError={(e) => {
                    e.target.style.opacity = '0';
                  }}
                />
                <span className="material-symbols-outlined text-3xl text-[#003fb1] absolute z-0">
                  {isUploadedImage ? '' : (animal.image_url || 'pets')}
                </span>
              </div>
              
              <h4 className="font-bold text-[#121c2a] text-sm mb-1">{animal.animal_name_lao}</h4>
              <p className="text-xs text-[#737686] mb-3">ເລກ: {animal.animal_numbers}</p>
              
              <label className="cursor-pointer bg-[#eff3ff] hover:bg-[#dee9fd] text-[#003fb1] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                {uploadingId === animal.animal_id ? 'ອັບໂຫຼດ...' : 'ປ່ຽນຮູບພາບ'}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleImageUpload(e, animal.animal_id)}
                  disabled={uploadingId === animal.animal_id}
                />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
