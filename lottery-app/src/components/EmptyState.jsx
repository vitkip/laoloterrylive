export default function EmptyState({ icon = 'search_off', title = 'ບໍ່ພົບຂໍ້ມູນ', description = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#eff3ff] dark:bg-[#1e2d4a] flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[32px] text-[#003fb1]/40">{icon}</span>
      </div>
      <h3 className="text-base font-bold text-[#121c2a] dark:text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-[#737686] dark:text-[#94a3b8] max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
