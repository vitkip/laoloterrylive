import { useState, forwardRef } from 'react';

const PasswordInput = forwardRef(function PasswordInput(
  { label, error, placeholder, className = '', ...props },
  ref
) {
  const [show, setShow] = useState(false);

  return (
    <div>
      {label && (
        <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#737686]">
          lock
        </span>
        <input
          ref={ref}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          className={`w-full bg-accent rounded-xl pl-9 pr-10 py-3 text-sm font-medium
            text-foreground focus:outline-none focus:ring-2 transition-all
            ${error
              ? 'ring-2 ring-red-400 bg-red-50 dark:bg-red-900/10'
              : 'focus:ring-[#003fb1]/40'
            } ${className}`}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#003fb1] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">
            {show ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
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
