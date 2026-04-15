import { useData } from '../context/DataContext';
import ArchiveTable from '../components/ArchiveTable';

export default function AdminOverview() {
  const { draws } = useData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#121c2a] mb-2">ພາບລວມລະບົບ</h1>
        <p className="text-[#434654]">ຍິນດີຕ້ອນຮັບສູ່ລະບົບຈັດການຫຼັງບ້ານ (Backoffice)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#dee9fd] shadow-sm">
          <p className="text-sm font-bold text-[#737686] uppercase tracking-widest mb-1">ຍອດງວດທັງໝົດ</p>
          <p className="text-4xl font-black text-[#003fb1]">{draws?.length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#dee9fd] shadow-sm">
          <p className="text-sm font-bold text-[#737686] uppercase tracking-widest mb-1">ງວດລ່າສຸດ</p>
          <p className="text-2xl font-black text-[#006c49]">
            {draws?.[0]?.draw_number || '-'}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#dee9fd] shadow-sm">
        <h2 className="text-xl font-bold text-[#121c2a] mb-4">ປະຫວັດການປ້ອນລ່າສຸດ</h2>
        <ArchiveTable />
      </div>
    </div>
  );
}
