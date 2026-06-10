const SIZES = {
  xs:  'w-7 h-7 text-[11px]',
  sm:  'w-9 h-9 text-sm',
  md:  'w-11 h-11 text-base',
  lg:  'w-14 h-14 text-xl',
  xl:  'w-20 h-20 text-3xl',
};

export default function UserAvatar({ name = '', username = '', size = 'md', className = '', avatarUrl = null }) {
  const display = name || username || '?';
  const initials = display.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={display}
        className={`rounded-full object-cover shrink-0 border border-[#d4af37]/35 shadow-md ${SIZES[size] || SIZES.md} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-black shrink-0 select-none bg-gradient-to-br from-[#0d0e1c] to-[#161b36] border border-[#d4af37]/45 text-[#ffd700] shadow-[0_2px_8px_rgba(212,175,55,0.15)] font-sans ${SIZES[size] || SIZES.md} ${className}`}
      title={display}
    >
      {initials}
    </div>
  );
}
