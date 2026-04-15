const laoMonths = [
  "ມັງກອນ", "ກຸມພາ", "ມີນາ", "ເມສາ", "ພຶດສະພາ", "ມິຖຸນາ",
  "ກໍລະກົດ", "ສິງຫາ", "ກັນຍາ", "ຕຸລາ", "ພະຈິກ", "ທັນວາ"
];

export function formatLaoDate(dateStr, full = true) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const day = d.getDate();
  const month = laoMonths[d.getMonth()];
  const year = d.getFullYear();

  if (full) {
    return `ວັນທີ ${day} ເດືອນ${month} ປີ ${year}`;
  }
  
  // Short format: 12/05/2024
  const dd = String(day).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${year}`;
}
