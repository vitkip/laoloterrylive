function getStrength(pw) {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8)          score++;
  if (pw.length >= 12)         score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[a-z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { label: 'ອ່ອນຫຼາຍ', color: '#ba1a1a', pct: 20 };
  if (score <= 3) return { label: 'ອ່ອນ',     color: '#e36c00', pct: 40 };
  if (score <= 4) return { label: 'ປານກາງ',   color: '#f5a623', pct: 60 };
  if (score <= 5) return { label: 'ດີ',        color: '#006c49', pct: 80 };
  return               { label: 'ດີຫຼາຍ',    color: '#003fb1', pct: 100 };
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
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#737686]">ຄວາມແຂງແກ່ນ:</span>
        <span className="font-bold transition-colors" style={{ color: strength.color }}>
          {strength.label}
        </span>
      </div>
      <div className="h-1.5 bg-[#dee9fd] dark:bg-[#2b3a54] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${strength.pct}%`, background: strength.color }}
        />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
        {CHECKS.map(c => {
          const ok = c.test(password);
          return (
            <div key={c.label} className="flex items-center gap-1.5">
              <span
                className={`material-symbols-outlined text-[13px] transition-colors ${ok ? 'text-[#006c49]' : 'text-[#c3c5d7]'}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {ok ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span className={`text-[11px] font-medium transition-colors ${ok ? 'text-[#006c49]' : 'text-[#737686]'}`}>
                {c.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
