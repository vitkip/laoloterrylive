import { useRef, useEffect } from 'react';

export default function OTPInput({ length = 6, value = '', onChange, disabled = false }) {
  const inputsRef = useRef([]);
  const digits    = (value + '      ').split('').slice(0, length).map(c => /\d/.test(c) ? c : '');

  useEffect(() => {
    if (!disabled) inputsRef.current[0]?.focus();
  }, [disabled]);

  const update = (newDigits) => onChange(newDigits.join('').replace(/\s/g, ''));

  const handleChange = (idx, e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) return;
    const next = [...digits];
    next[idx] = raw.slice(-1);
    update(next);
    if (idx < length - 1) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...digits];
      if (next[idx]) {
        next[idx] = '';
        update(next);
      } else if (idx > 0) {
        next[idx - 1] = '';
        update(next);
        inputsRef.current[idx - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft'  && idx > 0)          inputsRef.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < length - 1) inputsRef.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const next   = Array(length).fill('');
    pasted.split('').forEach((c, i) => { next[i] = c; });
    update(next);
    const focus = Math.min(pasted.length, length - 1);
    inputsRef.current[focus]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" role="group" aria-label="OTP input">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={el => (inputsRef.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoComplete="one-time-code"
          aria-label={`Digit ${idx + 1}`}
          onChange={e => handleChange(idx, e)}
          onKeyDown={e => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          className={`
            w-11 h-14 text-center text-2xl font-black rounded-xl border-2 transition-all duration-150
            bg-[#f0f4ff] dark:bg-[#1e2d4a] text-[#121c2a] dark:text-white
            focus:outline-none
            ${digit
              ? 'border-[#003fb1] bg-white dark:bg-[#152033] shadow-md shadow-[#003fb1]/15 scale-105'
              : 'border-[#dee9fd] dark:border-[#2b3a54]'
            }
            focus:border-[#003fb1] focus:bg-white dark:focus:bg-[#152033] focus:scale-105 focus:shadow-md focus:shadow-[#003fb1]/15
            disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100
          `}
        />
      ))}
    </div>
  );
}
