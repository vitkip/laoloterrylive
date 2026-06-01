const COLORS = [
  ['#003fb1', '#eff3ff'], ['#006c49', '#edfdf5'], ['#7c3aed', '#f5f3ff'],
  ['#d97706', '#fffbeb'], ['#0891b2', '#ecfeff'], ['#be185d', '#fdf2f8'],
];

function colorFor(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

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
  const [fg, bg] = colorFor(username || name);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={display}
        className={`rounded-full object-cover shrink-0 ${SIZES[size] || SIZES.md} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-black shrink-0 select-none ${SIZES[size] || SIZES.md} ${className}`}
      style={{ background: bg, color: fg }}
      title={display}
    >
      {initials}
    </div>
  );
}
