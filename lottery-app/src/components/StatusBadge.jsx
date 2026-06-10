const STYLES = {
  hot:       'bg-[#00ffd7]/10 text-[#00ffd7] border-[#00ffd7]/20',
  cold:      'bg-[#ff4646]/10 text-[#ff4646] border-[#ff4646]/20',
  neutral:   'bg-white/5 text-white/50 border-white/10',
  pending:   'bg-[#ffd700]/10 text-[#ffd700] border-[#ffd700]/20',
  published: 'bg-[#00e676]/10 text-[#00e676] border-[#00e676]/20',
}

const LABELS = {
  hot:       'HOT STREAK',
  cold:      'COLD TREND',
  neutral:   'NEUTRAL',
  pending:   'PENDING',
  published: 'PUBLISHED',
}

export default function StatusBadge({ type }) {
  return (
    <span className={`${STYLES[type] || STYLES.neutral} px-2 py-0.5 rounded-md text-[9px] font-sans font-black tracking-wider uppercase border`}>
      {LABELS[type] || type}
    </span>
  );
}