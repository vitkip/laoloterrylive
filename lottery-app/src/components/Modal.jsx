import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className={`relative bg-[#0d0e1c]/95 backdrop-blur-md rounded-3xl shadow-[0_8px_32px_rgba(212,175,55,0.15)] w-full ${widths[size] || widths.md} border border-[#d4af37]/25 max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.06] bg-gradient-to-r from-[#d4af37]/05 to-transparent shrink-0">
          <h3 className="text-lg font-black text-white font-sans">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:bg-[#d4af37]/22 hover:text-[#ffd700] border border-transparent hover:border-[#d4af37]/30 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
