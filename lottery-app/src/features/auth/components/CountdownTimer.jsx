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
    <div className="inline-flex items-center gap-2 bg-[#0d0e1c]/75 border border-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.3)] rounded-full px-2.5 py-1">
      <div className="relative w-4.5 h-4.5 flex items-center justify-center">
        <svg className="w-4.5 h-4.5 -rotate-90" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="timerGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#aa7c11" />
            </linearGradient>
            <linearGradient id="timerUrgentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff7b7b" />
              <stop offset="100%" stopColor="#ff4646" />
            </linearGradient>
          </defs>
          <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="2.5" />
          <circle cx="10" cy="10" r="8" fill="none"
            stroke={urgent ? "url(#timerUrgentGrad)" : "url(#timerGoldGrad)"}
            strokeWidth="2.5" strokeDasharray={`${2 * Math.PI * 8}`}
            strokeDashoffset={`${2 * Math.PI * 8 * (1 - pct / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000" />
        </svg>
      </div>
      {urgent ? (
        <span className="text-xs font-black font-sans tracking-wider tabular-nums text-[#ff4646] drop-shadow-[0_0_6px_#ff4646] animate-pulse">
          {mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `0:${String(secs).padStart(2, '0')}`}
        </span>
      ) : (
        <span className="text-xs font-black font-sans tracking-wider tabular-nums text-[#ffd700] drop-shadow-[0_0_4px_rgba(255,215,0,0.2)]">
          {mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `0:${String(secs).padStart(2, '0')}`}
        </span>
      )}
    </div>
  );
}

