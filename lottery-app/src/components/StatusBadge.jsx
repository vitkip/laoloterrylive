const STYLES = {
  hot:     'bg-[#6cf8bb]/30 text-[#00714d]',
  cold:    'bg-[#ffdad6]/30 text-[#ba1a1a]',
  neutral: 'bg-[#d9e3f7] text-[#737686]',
  pending: 'bg-amber-100 text-amber-700',
  published: 'bg-[#6cf8bb]/30 text-[#00714d]',
}

const LABELS = {
  hot:     'HOT STREAK',
  cold:    'COLD TREND',
  neutral: 'NEUTRAL',
  pending: 'PENDING',
  published: 'PUBLISHED',
}

export default function StatusBadge({ type }) {
  return (
    <span className={`${STYLES[type] || STYLES.neutral} px-2 py-1 rounded text-[10px] font-bold uppercase`}>
      {LABELS[type] || type}
    </span>
  )
}