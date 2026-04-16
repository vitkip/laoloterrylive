import { useData } from '../context/DataContext';
import ArchiveTable from '../components/ArchiveTable';
import { formatLaoDate } from '../utils/date';

export default function AdminOverview() {
  const { draws, animals } = useData();

  const latestDraw = draws?.[0];
  const twoDigitResult = latestDraw?.results_detail?.find(r => r.prize_type === '2_digits');
  const animal = animals?.find(a => a.animal_id === twoDigitResult?.animal_id);
  
  let animalDisplayUrl = '';
  if (animal) {
    const isUploadedImage = animal.image_url && (animal.image_url.startsWith('/') || animal.image_url.startsWith('http'));
    animalDisplayUrl = `/images/animals/${animal.animal_id}.png`;
    if (isUploadedImage) {
      animalDisplayUrl = animal.image_url.replace('/laoloterylive', '');
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#121c2a] dark:text-white mb-2">ພາບລວມລະບົບ</h1>
        <p className="text-[#434654] dark:text-[#c7d2fe]">ຍິນດີຕ້ອນຮັບສູ່ລະບົບຈັດການຫຼັງບ້ານ (Backoffice)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#152033] p-6 rounded-2xl border border-[#dee9fd] dark:border-[#2b3a54] shadow-sm flex flex-col justify-center">
          <p className="text-sm font-bold text-[#737686] dark:text-[#94a3b8] uppercase tracking-widest mb-1">ຍອດງວດທັງໝົດ</p>
          <p className="text-4xl font-black text-[#003fb1]">{draws?.length || 0}</p>
        </div>
        
        {latestDraw && (
          <div className="bg-white dark:bg-[#152033] p-6 rounded-2xl border border-[#dee9fd] dark:border-[#2b3a54] shadow-sm lg:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm font-bold text-[#737686] dark:text-[#94a3b8] uppercase tracking-widest mb-1">
                ຜົນງວດລ່າສຸດ (ງວດ {latestDraw.draw_number})
              </p>
              <p className="text-3xl sm:text-4xl font-black text-[#006c49] tracking-[0.2em] mb-1">
                {latestDraw.full_result}
              </p>
              <p className="text-xs text-[#737686] dark:text-[#94a3b8] font-medium">{formatLaoDate(latestDraw.draw_date, true)}</p>
            </div>
            
            {animal && (
              <div className="flex items-center gap-4 bg-[#f9f9ff] dark:bg-[#0d1627] px-4 py-3 rounded-xl border border-[#dee9fd] dark:border-[#2b3a54] min-w-[200px]">
                <div className="w-14 h-14 bg-white dark:bg-[#152033] rounded-full flex items-center justify-center overflow-hidden border border-[#eff3ff] dark:border-[#1e2d4a] shrink-0">
                  <img 
                    src={animalDisplayUrl} 
                    alt={animal.animal_name_lao} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#121c2a] dark:text-white">{animal.animal_name_lao}</p>
                  <p className="text-sm font-bold text-[#003fb1]">ເລກອອກ: {twoDigitResult.result_value}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#152033] p-6 rounded-2xl border border-[#dee9fd] dark:border-[#2b3a54] shadow-sm">
        <h2 className="text-xl font-bold text-[#121c2a] dark:text-white mb-4">ປະຫວັດການປ້ອນລ່າສຸດ</h2>
        <ArchiveTable />
      </div>
    </div>
  );
}
