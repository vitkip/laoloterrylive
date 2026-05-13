const ROLE_CONFIG = {
  admin:  { label: 'Admin',  cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',   dot: 'bg-red-500'   },
  staff:  { label: 'Staff',  cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', dot: 'bg-blue-500'  },
  member: { label: 'Member', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', dot: 'bg-purple-500' },
};

export default function RoleBadge({ role, size = 'sm' }) {
  const cfg  = ROLE_CONFIG[role] || { label: role, cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
  const text = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wide ${text} ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
