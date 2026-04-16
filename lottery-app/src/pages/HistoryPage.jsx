import ArchiveTable from '../components/ArchiveTable'

export default function HistoryPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#003fb1] mb-2 tracking-tight">
          ປະຫວັດຍ້ອນຫຼັງ
        </h1>
        <p className="text-[#434654] dark:text-[#c7d2fe] max-w-2xl text-sm sm:text-base leading-relaxed">
          ກວດສອບຜົນຫວຍທັງໝົດທີ່ເຄີຍອອກມາຍ້ອນຫຼັງໄດ້ທີ່ນີ້ ລວມເຖິງວິດີໂອການອອກລາງວັນ.
        </p>
      </div>
      <ArchiveTable />
    </div>
  )
}
