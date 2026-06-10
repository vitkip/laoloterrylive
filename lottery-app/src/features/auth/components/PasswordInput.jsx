import { useState, forwardRef } from 'react';

const PasswordInput = forwardRef(function PasswordInput(
  { label, error, placeholder, className = '', ...props },
  ref
) {
  const [show, setShow] = useState(false);

  return (
    <div className="text-left">
      {label && (
        <label className="block text-[10px] font-black text-white/35 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#d4af37]/45">
          lock
        </span>
        <input
          ref={ref}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          className={`w-full bg-black/45 border border-white/[0.08] rounded-xl pl-9 pr-10 py-3 text-sm font-bold
            text-white placeholder:text-white/20 focus:outline-none focus:ring-1 transition-all duration-200
            ${error
              ? 'focus:ring-red-400/30 border-red-400/40 focus:border-red-400'
              : 'focus:ring-[#d4af37]/30 focus:border-[#d4af37]/45'
            } ${className}`}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-[#d4af37] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">
            {show ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
      {error && (
        <p className="mt-1.5 text-[11px] text-red-400 font-bold flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            error
          </span>
          {error}
        </p>
      )}
    </div>
  );
});

export default PasswordInput;
