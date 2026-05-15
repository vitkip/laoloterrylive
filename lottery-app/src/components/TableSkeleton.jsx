export default function TableSkeleton({ cols = 5, rows = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, ri) => (
        <tr key={ri} className="border-b border-border">
          {Array.from({ length: cols }).map((_, ci) => (
            <td key={ci} className="px-6 py-4">
              <div
                className="h-3.5 rounded-full bg-[#e8edf8] dark:bg-[#1e2d4a] animate-pulse"
                style={{ width: `${55 + ((ri * 3 + ci * 7) % 35)}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
