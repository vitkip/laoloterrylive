function getStrength(pw) {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8)          score++;
  if (pw.length >= 12)         score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[a-z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { label: 'ອ່ອນຫຼາຍ (Weak)', color: '#f87171', pct: 20 };
  if (score <= 3) return { label: 'ອ່ອນ (Fair)',     color: '#fb923c', pct: 40 };
  if (score <= 4) return { label: 'ປານກາງ (Good)',   color: '#fbbf24', pct: 60 };
  if (score <= 5) return { label: 'ດີ (Strong)',     color: '#34d399', pct: 80 };
  return               { label: 'ດີຫຼາຍ (Secure)',   color: '#a78bfa', pct: 100 };
}

const CHECKS = [
  { test: pw => pw.length >= 8,         label: 'ຢ່າງໜ້ອຍ 8 ຕົວ' },
  { test: pw => /[A-Z]/.test(pw),       label: 'ໂຕໃຫຍ່ (A-Z)' },
  { test: pw => /[a-z]/.test(pw),       label: 'ໂຕນ້ອຍ (a-z)' },
  { test: pw => /[0-9]/.test(pw),       label: 'ຕົວເລກ (0-9)' },
  { test: pw => /[^A-Za-z0-9]/.test(pw), label: 'ໂຕພິເສດ (!@#$)' },
];

export default function PasswordStrengthMeter({ password }) {
  const strength = getStrength(password);
  if (!strength) return null;

  return (
    <div className="space-y-2 mt-2.5 bg-black/25 p-2.5 rounded-xl border border-white/[0.05] text-left">
      <div className="flex items-center justify-between text-[10px] font-bold">
        <span className="text-white/45">ລະດັບຄວາມປອດໄພ:</span>
        <span className="font-black transition-colors" style={{ color: strength.color }}>
          {strength.label}
        </span>
      </div>
      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${strength.pct}%`, background: strength.color }}
        />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 border-t border-white/[0.03] mt-1">
        {CHECKS.map(c => {
          const ok = c.test(password);
          return (
            <div key={c.label} className="flex items-center gap-1.5 select-none">
              <span
                className={`material-symbols-outlined text-[13px] transition-colors ${ok ? 'text-emerald-400' : 'text-white/20'}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {ok ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span className={`text-[10px] font-bold transition-colors ${ok ? 'text-emerald-400/90' : 'text-white/35'}`}>
                {c.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
