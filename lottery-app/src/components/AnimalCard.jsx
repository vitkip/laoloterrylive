export default function AnimalCard({ icon, name, numbers, frequencyPercent, image_url }) {
  return (
    <div className="bg-white dark:bg-[#152033] p-6 rounded-2xl flex flex-col items-center text-center">
      <div className="w-20 h-20 mb-4 flex items-center justify-center bg-[#e6eeff] dark:bg-[#1e293b] rounded-full overflow-hidden relative">
        <img 
          src={image_url} 
          alt={`ນາມສັດ ${name}`}
          className="w-full h-full object-cover z-10 bg-white dark:bg-[#152033]"
          onError={(e) => {
            // Hide image and show material icon behind it if image fails to load
            e.target.style.opacity = '0';
          }}
        />
        <span className="material-symbols-outlined text-4xl text-[#003fb1] absolute inset-0 flex items-center justify-center z-0">
          {icon || 'pets'}
        </span>
      </div>
      <h4 className="text-lg sm:text-xl font-bold mb-1 text-[#121c2a] dark:text-white">ນາມສັດ: {name}</h4>
      <p className="text-[#003fb1] text-sm font-semibold mb-4">ເລກ: {numbers}</p>
      <div className="w-full bg-[#dee9fd] dark:bg-[#2b3a54] rounded-full h-1.5 mb-2">
        <div
          className="bg-[#006c49] h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${frequencyPercent}%` }}
        />
      </div>
      <span className="text-[10px] text-[#737686] dark:text-[#94a3b8] uppercase tracking-wider">
        ຄວາມຖີ່ {frequencyPercent}%
      </span>
    </div>
  )
}
