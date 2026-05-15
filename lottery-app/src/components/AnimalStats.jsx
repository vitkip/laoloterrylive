import { useState } from 'react'
import AnimalCard from './AnimalCard'
import { useStatistics } from '../hooks/useStatistics'

export default function AnimalStats({ timeframe }) {
  const [showAll, setShowAll] = useState(false);
  const { stats, loading } = useStatistics(timeframe);

  if (loading || !stats) return null;
  const { animalStats } = stats;

  return (
    <section className="bg-secondary rounded-3xl p-8 sm:p-10 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none select-none">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAWvvkXFA2RDJ9ZlfXHWGxLUpxtfo2kqcfOSE7p4-G4OgMSblyCsObgEoK6wrjauxQanchpZU07cY4xPnPVdElN_NjCkG-yeyNlP9YN-uq63gj9K9rxSHkxNXcZUEYRpr7vq68y4-WaIQfNWiQfPTY149kXELOylI4LrgYijrZVWRittzBUFtQqXcX1WeRSfszIOqH4X4iyZPp9MWMYV-qa8Zz-X2cS7V01sRHfHR8hkX1s41kE1RD6Hwxh4ZegUjP3p_IswbTdg"
          alt="decorative pattern"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div>
            <span className="text-[#006c49] font-bold tracking-[0.2em] text-xs uppercase mb-2 block">
              Premium Analysis
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              ສະຖິຕິເລກນາມສັດ (Animal Stats)
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
            ການວິເຄາະຄວາມຖີ່ຂອງນາມສັດທີ່ປະກົດຂຶ້ນໃນຜົນການອອກລາງວັນ ໂດຍແບ່ງຕາມໝວດໝູ່ສັດມຸງຄຸນ.
          </p>
        </div>

        {/* Animal Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {animalStats.slice(0, showAll ? animalStats.length : 8).map((animal) => (
            <AnimalCard key={animal.name} {...animal} />
          ))}
        </div>

        {/* Toggle Button */}
        {animalStats.length > 8 && (
          <div className="mt-8 flex justify-center">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="text-[#003fb1] font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all"
            >
              {showAll ? 'ຫຍໍ້ນາມສັດ' : 'ເບິ່ງນາມສັດທັງໝົດ (40 ຊະນິດ)'}
              <span className="material-symbols-outlined">
                {showAll ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
