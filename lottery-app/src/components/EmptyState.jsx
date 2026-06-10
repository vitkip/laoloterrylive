export default function EmptyState({ icon = 'search_off', title = 'ບໍ່ພົບຂໍ້ມູນ', description = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center relative overflow-hidden">
      {/* Ambient soft gold backing light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Outer Shield with hover effects */}
      <div className="relative group mb-6">
        {/* Pulsing halo ring */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-[#d4af37]/30 to-[#ffd700]/0 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse pointer-events-none" />
        
        {/* Main Icon Plate */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0d0e1c] to-[#161b36] border border-[#d4af37]/30 shadow-[0_4px_20px_rgba(212,175,55,0.15)] flex items-center justify-center transform group-hover:scale-105 transition-all duration-300">
          <span className="material-symbols-outlined text-[32px] text-[#ffd700] drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
            {icon}
          </span>
        </div>
      </div>

      {/* Title with metallic white-to-gold/slate text gradient */}
      <h3 className="text-base font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 mb-2">
        {title}
      </h3>

      {/* Description text */}
      {description && (
        <p className="text-xs text-white/50 max-w-xs leading-relaxed font-light mb-1">
          {description}
        </p>
      )}

      {/* Action slot */}
      {action && (
        <div className="mt-5 transform hover:scale-102 transition duration-200">
          {action}
        </div>
      )}
    </div>
  );
}

