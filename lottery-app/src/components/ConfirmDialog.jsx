import { useEffect } from 'react';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'ຢືນຢັນ', cancelLabel = 'ຍົກເລີກ', variant = 'danger', onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const btnCls = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-[#003fb1] hover:bg-[#1a56db] text-white';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-[#152033] rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-[#dee9fd] dark:border-[#2b3a54]">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto ${variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-[#eff3ff]'}`}>
          <span className={`material-symbols-outlined text-2xl ${variant === 'danger' ? 'text-red-600' : 'text-[#003fb1]'}`}
            style={{ fontVariationSettings: "'FILL' 1" }}>
            {variant === 'danger' ? 'warning' : 'help'}
          </span>
        </div>
        <h3 className="text-lg font-black text-center text-[#121c2a] dark:text-white mb-2">{title}</h3>
        {message && <p className="text-sm text-center text-[#737686] dark:text-[#94a3b8] mb-6">{message}</p>}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-[#f0f4ff] dark:bg-[#1e2d4a] text-[#434654] dark:text-[#c7d2fe] hover:bg-[#dee9fd] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${btnCls}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
