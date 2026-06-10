const ROLE_CONFIG = {
  admin:  { 
    label: 'Admin',  
    cls: 'bg-red-500/10 text-[#ff4646] border-red-500/20',   
    dot: 'bg-[#ff4646] shadow-[0_0_8px_#ff4646]'   
  },
  staff:  { 
    label: 'Staff',  
    cls: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', 
    dot: 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'  
  },
  member: { 
    label: 'Member', 
    cls: 'bg-[#d4af37]/10 text-[#ffd700] border-[#d4af37]/20', 
    dot: 'bg-[#ffd700] shadow-[0_0_8px_#ffd700]' 
  },
};

export default function RoleBadge({ role, size = 'sm' }) {
  const cfg  = ROLE_CONFIG[role] || { 
    label: role, 
    cls: 'bg-white/5 text-white/50 border-white/10', 
    dot: 'bg-white/40' 
  };
  const text = size === 'xs' 
    ? 'text-[8px] px-1.5 py-0.5 font-sans font-black tracking-wider border rounded-full' 
    : 'text-[10px] px-2.5 py-0.5 font-sans font-black tracking-wider border rounded-full';
    
  return (
    <span className={`inline-flex items-center gap-1.5 uppercase ${text} ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
