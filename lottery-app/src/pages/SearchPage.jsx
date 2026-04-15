import DreamDictionary from '../components/DreamDictionary';
import NumberHistorySearch from '../components/NumberHistorySearch';
import DashboardHeader from '../components/DashboardHeader';

export default function SearchPage() {
  return (
    <>
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#003fb1] mb-2 tracking-tight">
          ຄົ້ນຫາ ແລະ ແປຄວາມຝັນ
        </h1>
        <p className="text-[#434654] max-w-2xl text-sm sm:text-base leading-relaxed">
          ລະບົບຄົ້ນຫາປະຫວັດການອອກລາງວັນແບບລະບຸຕົວເລກ ແລະ ຕຳລາແປຄວາມຝັນ ຊອກຫານາມສັດ ຈາກສິ່ງທີ່ຝັນເຫັນຮ່ວມສະໄໝ.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[70vh] min-h-[600px]">
        {/* Left: Dream Dictionary */}
        <DreamDictionary />
        
        {/* Right: Number History Search */}
        <NumberHistorySearch />
      </div>
    </>
  )
}
