export default function TableSkeleton({ cols = 5, rows = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, ri) => (
        <tr key={ri} className="border-b border-white/[0.04] hover:bg-white/[0.01] transition-colors">
          {Array.from({ length: cols }).map((_, ci) => (
            <td key={ci} className="px-6 py-4">
              <div
                className="h-3.5 rounded-full bg-gradient-to-r from-white/[0.03] via-[#d4af37]/05 to-white/[0.03] border border-white/[0.04] shadow-sm animate-pulse"
                style={{ width: `${55 + ((ri * 3 + ci * 7) % 35)}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
