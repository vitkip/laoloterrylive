import { useState, useEffect, useRef } from 'react';

export default function CountdownTimer({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onExpireRef.current?.();
      return;
    }
    const id = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(id); onExpireRef.current?.(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [remaining > 0 ? 1 : 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct  = (remaining / seconds) * 100;
  const urgent = remaining > 0 && remaining <= 60;

  if (remaining === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-5 h-5">
        <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor"
            strokeWidth="2" className="text-[#dee9fd] dark:text-[#2b3a54]" />
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor"
            strokeWidth="2" strokeDasharray={`${2 * Math.PI * 8}`}
            strokeDashoffset={`${2 * Math.PI * 8 * (1 - pct / 100)}`}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${urgent ? 'text-red-500' : 'text-[#003fb1]'}`} />
        </svg>
      </div>
      <span className={`text-sm font-black tabular-nums transition-colors ${urgent ? 'text-red-500' : 'text-[#003fb1]'}`}>
        {mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `0:${String(secs).padStart(2, '0')}`}
      </span>
    </div>
  );
}
