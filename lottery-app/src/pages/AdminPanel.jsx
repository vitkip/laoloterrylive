import { useState, useMemo, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { API, resolveAnimalImage } from '../utils/api';
import { formatLaoDate } from '../utils/date';

// ── Sub-components ───────────────────────────────────────────────

function FieldLabel({ children, icon }) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
      {icon && <span className="material-symbols-outlined text-[14px]">{icon}</span>}
      {children}
    </label>
  );
}

function FieldBox({ children }) {
  return (
    <div className="bg-[#f5f7ff] dark:bg-[#1a2844] border border-border rounded-xl overflow-hidden focus-within:border-[#003fb1] focus-within:ring-2 focus-within:ring-[#003fb1]/15 transition-all duration-200">
      {children}
    </div>
  );
}

function SectionDivider({ icon, label }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[#003fb1] text-[13px]">{icon}</span>
      </div>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest shrink-0">{label}</p>
      <div className="flex-1 h-px bg-gradient-to-r from-[#e8edf8] to-transparent dark:from-[#2b3a54]" />
    </div>
  );
}

function ResultDigits({ result }) {
  if (!result) return null;
  const padded = result.padEnd(6, '·');
  const groups = [padded.slice(0, 2), padded.slice(2, 4), padded.slice(4, 6)];
  return (
    <div className="flex items-center gap-1.5">
      {groups.map((grp, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {grp.split('').map((ch, ci) => (
            <div
              key={ci}
              className={`w-8 h-9 rounded-lg flex items-center justify-center text-sm font-black transition-all duration-200
                ${/\d/.test(ch)
                  ? 'bg-gradient-to-br from-[#003fb1] to-[#1a56db] text-white shadow-sm'
                  : 'bg-[#e8edf8] dark:bg-[#2b3a54] text-[#c3c5d7] dark:text-[#555870]'
                }`}
            >
              {ch}
            </div>
          ))}
          {gi < 2 && <span className="text-[#c3c5d7] dark:text-[#2b3a54] font-black text-xs mx-0.5">·</span>}
        </div>
      ))}
    </div>
  );
}

const LAO_MONTHS = ['', 'ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ', 'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ'];
const HISTORY_PAGE_SIZE = 10;

// ── Main Component ────────────────────────────────────────────────

export default function AdminPanel() {
  const { animals, types, draws, yearsByType, refreshData } = useData();
  const { authFetch } = useAuth();
  const digitRefs = useRef([]);

  const [formData, setFormData] = useState({
    type_id: types?.[0]?.type_id || 1,
    draw_number: '',
    draw_date: new Date().toISOString().slice(0, 10),
    full_result: '',
    animal_id: '',
    youtube_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', ok: true });
  const [isEditing, setIsEditing] = useState(false);
  const [editDrawId, setEditDrawId] = useState(null);

  const [historySearch, setHistorySearch] = useState('');
  const [historyYear, setHistoryYear] = useState('');
  const [historyMonth, setHistoryMonth] = useState('');
  const [historyPage, setHistoryPage] = useState(1);

  const getNextDrawNumber = (dateStr, typeId) => {
    const tid = typeId ?? formData.type_id;
    if (!draws.length || !dateStr) return 1;
    const year = new Date(dateStr).getFullYear();
    const inYear = draws.filter(d =>
      new Date(d.draw_date).getFullYear() === year && d.type_id === tid
    );
    if (!inYear.length) return 1;
    return Math.max(...inYear.map(d => parseInt(d.draw_number) || 0)) + 1;
  };

  // Auto-populate draw number (useEffect for side effects, NOT useMemo)
  useEffect(() => {
    if (!isEditing && !formData.draw_number && draws.length) {
      setFormData(f => ({ ...f, draw_number: getNextDrawNumber(f.draw_date).toString() }));
    }
  }, [draws.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset history filters when type changes
  useEffect(() => { setHistoryYear(''); setHistoryMonth(''); setHistoryPage(1); }, [formData.type_id]);
  // Reset month when year changes
  useEffect(() => { setHistoryMonth(''); setHistoryPage(1); }, [historyYear]);
  // Reset page when search/month changes
  useEffect(() => { setHistoryPage(1); }, [historySearch, historyMonth]);

  const selectedType = types?.find(t => t.type_id === formData.type_id);

  const filteredDraws = useMemo(() =>
    (draws || []).filter(d => Number(d.type_id) === Number(formData.type_id)),
    [draws, formData.type_id]
  );

  const historyAvailYears = useMemo(() => {
    const tid = String(formData.type_id);
    return yearsByType?.[tid] ?? [...new Set(filteredDraws.map(d => d.draw_date.slice(0, 4)))].sort((a, b) => b - a);
  }, [yearsByType, formData.type_id, filteredDraws]);

  const historyAvailMonths = useMemo(() => {
    const src = historyYear ? filteredDraws.filter(d => d.draw_date.startsWith(historyYear)) : filteredDraws;
    return [...new Set(src.map(d => parseInt(d.draw_date.slice(5, 7))))].sort((a, b) => a - b);
  }, [filteredDraws, historyYear]);

  const searchedDraws = useMemo(() =>
    filteredDraws.filter(d => {
      const [yyyy, mm] = d.draw_date.split('-');
      if (historyYear && yyyy !== historyYear) return false;
      if (historyMonth && mm !== historyMonth.padStart(2, '0')) return false;
      if (!historySearch) return true;
      const term = historySearch.trim().toLowerCase();
      return (
        d.full_result?.includes(term) ||
        d.draw_number.toString().includes(term) ||
        d.draw_date.includes(term) ||
        formatLaoDate(d.draw_date, true).toLowerCase().includes(term)
      );
    }),
    [filteredDraws, historySearch, historyYear, historyMonth]
  );

  const totalHistoryPages = Math.max(1, Math.ceil(searchedDraws.length / HISTORY_PAGE_SIZE));
  const safeHistoryPage = Math.min(historyPage, totalHistoryPages);
  const pagedDraws = searchedDraws.slice((safeHistoryPage - 1) * HISTORY_PAGE_SIZE, safeHistoryPage * HISTORY_PAGE_SIZE);

  const suggestedAnimals = useMemo(() => {
    if (formData.full_result.length >= 2) {
      const lastTwo = formData.full_result.slice(-2);
      return animals.filter(a => a.animal_numbers.split(',').includes(lastTwo));
    }
    return [];
  }, [formData.full_result, animals]);

  // ── Digit box handlers ──
  const handleDigitInput = (i, val) => {
    const v = val.replace(/\D/g, '').slice(-1);
    const arr = formData.full_result.padEnd(6, ' ').split('');
    arr[i] = v || ' ';
    const newResult = arr.join('').replace(/\s+$/, '');
    setFormData(prev => ({ ...prev, full_result: newResult }));
    if (v && i < 5) digitRefs.current[i + 1]?.focus();
  };

  const handleDigitKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      if (!formData.full_result[i] && i > 0) {
        const arr = formData.full_result.padEnd(6, ' ').split('');
        arr[i - 1] = ' ';
        setFormData(prev => ({ ...prev, full_result: arr.join('').replace(/\s+$/, '') }));
        digitRefs.current[i - 1]?.focus();
      } else {
        const arr = formData.full_result.padEnd(6, ' ').split('');
        arr[i] = ' ';
        setFormData(prev => ({ ...prev, full_result: arr.join('').replace(/\s+$/, '') }));
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      digitRefs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < 5) {
      digitRefs.current[i + 1]?.focus();
    }
  };

  const handleDigitPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, full_result: pasted }));
    if (pasted.length < 6) digitRefs.current[pasted.length]?.focus();
    else digitRefs.current[5]?.focus();
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.full_result.length !== 6) {
      setMessage({ text: 'ກະລຸນາປ້ອນເລກໃຫ້ຄົບ 6 ຕົວ', ok: false });
      return;
    }
    setLoading(true);
    setMessage({ text: '', ok: true });
    try {
      const action = isEditing ? 'update_draw' : 'create_draw';
      const bodyPayload = {
        ...formData,
        animal_id: formData.animal_id ? parseInt(formData.animal_id) : (suggestedAnimals[0]?.animal_id || null)
      };
      if (isEditing) bodyPayload.draw_id = editDrawId;

      const { ok, data } = await authFetch(`${API}/index.php?action=${action}`, {
        method: 'POST',
        body: JSON.stringify(bodyPayload)
      });

      if (ok) {
        setMessage({ text: isEditing ? 'ອັບເດດຜົນສຳເລັດແລ້ວ!' : 'ບັນທຶກຜົນສຳເລັດແລ້ວ!', ok: true });
        if (!isEditing) {
          setFormData(prev => ({
            ...prev,
            full_result: '',
            youtube_url: '',
            draw_number: (parseInt(prev.draw_number) + 1).toString()
          }));
          digitRefs.current[0]?.focus();
        } else {
          setIsEditing(false);
          setEditDrawId(null);
          setFormData({
            type_id: formData.type_id,
            draw_number: '',
            draw_date: formData.draw_date,
            full_result: '',
            animal_id: '',
            youtube_url: ''
          });
        }
        if (refreshData) await refreshData();
      } else {
        setMessage({ text: data.error || 'ຂໍ້ຜິດພາດໃນການບັນທຶກ', ok: false });
      }
    } catch {
      setMessage({ text: 'ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີບເວີໄດ້', ok: false });
    }
    setLoading(false);
  };

  const handleEdit = (draw) => {
    setIsEditing(true);
    setEditDrawId(draw.draw_id);
    const autoAnimalId = draw.results_detail?.find(r => r.prize_type === '2_digits')?.animal_id || '';
    setFormData({
      type_id: draw.type_id,
      draw_number: draw.draw_number.toString(),
      draw_date: draw.draw_date,
      full_result: draw.full_result,
      animal_id: autoAnimalId,
      youtube_url: draw.youtube_url || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditDrawId(null);
    setMessage({ text: '', ok: true });
    setFormData({
      type_id: types?.[0]?.type_id || 1,
      draw_number: '',
      draw_date: new Date().toISOString().slice(0, 10),
      full_result: '',
      animal_id: '',
      youtube_url: ''
    });
  };

  const inputCls = 'w-full bg-transparent px-3.5 py-3 text-foreground text-sm font-medium placeholder:text-[#a0a3bd] outline-none';
  const selectedAnimalObj = animals.find(a => a.animal_id == formData.animal_id)
    || (suggestedAnimals[0] && !formData.animal_id ? suggestedAnimals[0] : null);

  return (
    <div className="space-y-7">

      {/* ─── Page Header ─── */}
      <div className="relative rounded-3xl overflow-hidden">
        <div className={`absolute inset-0 ${isEditing ? 'bg-gradient-to-br from-[#78350f] via-[#d97706] to-[#f59e0b]' : 'bg-gradient-to-br from-[#001d6e] via-[#003fb1] to-[#1a56db]'}`} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="absolute right-0 bottom-0 text-[7rem] sm:text-[10rem] font-black text-white/[0.04] leading-none select-none pointer-events-none pr-4 pb-1">
          {isEditing ? 'EDIT' : 'ADD'}
        </div>
        <div className="relative z-10 px-7 sm:px-10 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 mb-4">
              <span className="material-symbols-outlined text-white/80 text-[13px]">{isEditing ? 'edit_square' : 'add_circle'}</span>
              <span className="text-white/90 text-[11px] font-bold uppercase tracking-widest">{isEditing ? 'Edit Mode' : 'New Draw'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {isEditing
                ? <span>ແກ້ໄຂ <span className="text-[#fcd34d]">ງວດທີ {formData.draw_number}</span></span>
                : <span>ເພີ່ມຜົນ<span className="text-[#93c5fd] ml-2">ງວດໃໝ່</span></span>
              }
            </h1>
            <p className="text-white/60 text-xs mt-1.5">
              {isEditing ? 'ແກ້ໄຂຂໍ້ມູນ ຈາກນັ້ນກົດ "ອັບເດດ"' : 'ປ້ອນຜົນລາງວັນ ແລ້ວ ກົດ "ບັນທຶກ"'}
            </p>
          </div>
          {isEditing && (
            <button
              onClick={cancelEdit}
              className="self-start sm:self-center flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              ຍົກເລີກແກ້ໄຂ
            </button>
          )}
        </div>
      </div>

      {/* ─── Message Toast ─── */}
      {message.text && (
        <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border text-sm font-bold animate-pulse-once
          ${message.ok
            ? 'bg-[#edfdf5] dark:bg-[#052e16] border-[#6cf8bb]/40 text-[#006c49] dark:text-[#4ade80]'
            : 'bg-[#fff4f4] dark:bg-[#2a1010] border-[#ffdad6]/50 text-[#ba1a1a] dark:text-[#f87171]'
          }`}>
          <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${message.ok ? 'bg-[#006c49]/10' : 'bg-[#ba1a1a]/10'}`}>
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {message.ok ? 'check_circle' : 'error'}
            </span>
          </span>
          <span className="flex-1">{message.text}</span>
          <button onClick={() => setMessage({ text: '', ok: true })} className="opacity-50 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* ─── Two-column grid: Form | History ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-7 items-start">

      {/* ─── Col 1: Form Card ─── */}
      <div className="lg:col-span-2">
      <form onSubmit={handleSubmit}>
        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">

          {/* Edit indicator stripe */}
          {isEditing && (
            <div className="h-1 bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#fcd34d]" />
          )}

          <div className="p-6 sm:p-8 space-y-7">

            {/* Section 1: Draw Info */}
            <div>
              <SectionDivider icon="info" label="ຂໍ້ມູນງວດ" />
              <div className="mt-4 space-y-4">
                {/* Type */}
                <div className="sm:col-span-3">
                  <FieldLabel icon="category">ປະເພດຫວຍ</FieldLabel>
                  {types && types.length > 1 ? (
                    <div className="flex flex-wrap gap-2">
                      {types.map(t => {
                        const color = t.color || '#003fb1'
                        const active = formData.type_id === t.type_id
                        return (
                          <button
                            key={t.type_id}
                            type="button"
                            onClick={() => {
                            const nextNum = !isEditing ? getNextDrawNumber(formData.draw_date, t.type_id) : parseInt(formData.draw_number || '1');
                            setFormData({ ...formData, type_id: t.type_id, draw_number: nextNum.toString() });
                          }}
                            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-2 text-sm font-bold transition-all duration-200"
                            style={active
                              ? { borderColor: color, background: `${color}15`, color }
                              : { borderColor: '#e8edf8', background: 'transparent', color: '#737686' }
                            }
                          >
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                            {t.type_name}
                            {active && <span className="material-symbols-outlined text-[14px]">check</span>}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <FieldBox>
                      <select
                        className={inputCls + ' cursor-pointer'}
                        value={formData.type_id}
                        onChange={e => {
                          const newTypeId = parseInt(e.target.value);
                          const nextNum = !isEditing ? getNextDrawNumber(formData.draw_date, newTypeId).toString() : formData.draw_number;
                          setFormData({ ...formData, type_id: newTypeId, draw_number: nextNum });
                        }}
                        required
                      >
                        {types?.map(t => (
                          <option key={t.type_id} value={t.type_id}>{t.type_name}</option>
                        ))}
                      </select>
                    </FieldBox>
                  )}
                </div>
                {/* Date + Number row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <FieldLabel icon="calendar_today">ງວດວັນທີ</FieldLabel>
                  <FieldBox>
                    <input
                      type="date"
                      className={inputCls}
                      value={formData.draw_date}
                      onChange={e => {
                        const newDate = e.target.value;
                        const oldYear = new Date(formData.draw_date).getFullYear();
                        const newYear = new Date(newDate).getFullYear();
                        const nextNum = !isEditing && oldYear !== newYear
                          ? getNextDrawNumber(newDate)
                          : formData.draw_number;
                        setFormData({ ...formData, draw_date: newDate, draw_number: nextNum.toString() });
                      }}
                      required
                    />
                  </FieldBox>
                </div>
                {/* Draw number */}
                <div>
                  <FieldLabel icon="tag">ງວດທີ</FieldLabel>
                  <FieldBox>
                    <input
                      type="number"
                      className={inputCls + ' font-black text-primary'}
                      placeholder="1"
                      value={formData.draw_number}
                      onChange={e => setFormData({ ...formData, draw_number: e.target.value })}
                      required
                    />
                  </FieldBox>
                </div>
                </div>{/* end date+number grid */}
              </div>{/* end space-y-4 */}
            </div>{/* end Section 1 */}

            {/* Section 2: Result Entry */}
            <div>
              <SectionDivider icon="pin" label="ເລກທີ່ອອກ" />
              <div className="mt-4 space-y-4">
                {/* OTP-style digit boxes */}
                <div>
                  <FieldLabel>ປ້ອນ 6 ຕົວເລກ</FieldLabel>
                  <div className="flex items-center gap-2 sm:gap-3">
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center gap-2 sm:gap-3">
                        <input
                          ref={el => (digitRefs.current[i] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={formData.full_result[i] || ''}
                          onChange={e => handleDigitInput(i, e.target.value)}
                          onKeyDown={e => handleDigitKeyDown(i, e)}
                          onPaste={i === 0 ? handleDigitPaste : undefined}
                          className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl text-center text-xl sm:text-2xl font-black border-2 outline-none transition-all duration-200 cursor-text
                            ${formData.full_result[i]
                              ? 'border-[#003fb1] bg-secondary text-primary shadow-sm'
                              : 'border-border bg-[#f5f7ff] dark:bg-[#1a2844] text-transparent'
                            }
                            focus:border-[#003fb1] focus:ring-4 focus:ring-[#003fb1]/15 focus:bg-[#eff3ff] dark:focus:bg-[#1e2d4a]`}
                        />
                        {(i === 1 || i === 3) && (
                          <span className="text-[#c3c5d7] dark:text-[#2b3a54] font-black text-lg hidden sm:block">·</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-[#a0a3bd] dark:text-[#555870]">
                    ກົດ Tab / ລູກສອນ ເພື່ອຍ້າຍ · Backspace ເພື່ອລຶບ · Ctrl+V ວາງທັງໝົດ
                  </p>
                </div>

                {/* Live preview */}
                {formData.full_result.length > 0 && (
                  <div className="flex items-center gap-4 bg-[#f5f7ff] dark:bg-[#1a2844] rounded-2xl px-5 py-4 border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">Preview</span>
                    <ResultDigits result={formData.full_result} />
                    {formData.full_result.length === 6 && (
                      <span className="ml-auto text-[10px] font-bold text-[#006c49] dark:text-[#4ade80] bg-[#edfdf5] dark:bg-[#052e16] px-2.5 py-1 rounded-full border border-[#6cf8bb]/30">
                        ✓ ຄົບ 6 ຕົວ
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Animal */}
            <div>
              <SectionDivider icon="pets" label="ນາມສັດ (2 ຕົວສຸດທ້າຍ)" />
              <div className="mt-4 space-y-3">

                {/* Suggested animal cards */}
                {suggestedAnimals.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-[#006c49] dark:text-[#4ade80] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                      ແນະນຳອັດຕະໂນມັດ
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedAnimals.map(a => {
                        const selected = formData.animal_id == a.animal_id;
                        const imgSrc = resolveAnimalImage(a);
                        return (
                          <button
                            key={a.animal_id}
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              animal_id: selected ? '' : a.animal_id.toString()
                            }))}
                            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border-2 text-sm font-bold transition-all duration-200
                              ${selected
                                ? 'border-[#006c49] bg-[#edfdf5] dark:bg-[#052e16] text-[#006c49] dark:text-[#4ade80] shadow-sm'
                                : 'border-border bg-[#f5f7ff] dark:bg-[#1a2844] text-muted-foreground hover:border-[#006c49]/40'
                              }`}
                          >
                            {imgSrc
                              ? <img src={imgSrc} alt={a.animal_name_lao} className="w-7 h-7 rounded-lg object-cover" />
                              : <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                            }
                            <div className="text-left">
                              <p className="leading-tight">{a.animal_name_lao}</p>
                              <p className="text-[10px] opacity-60 font-normal leading-tight">{a.animal_numbers}</p>
                            </div>
                            {selected && <span className="material-symbols-outlined text-[16px] ml-1">check_circle</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Manual select */}
                <div>
                  {suggestedAnimals.length > 0 && (
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">ຫຼື ເລືອກດ້ວຍຕົນເອງ</p>
                  )}
                  <FieldBox>
                    <select
                      className={inputCls + ' cursor-pointer'}
                      value={formData.animal_id}
                      onChange={e => setFormData({ ...formData, animal_id: e.target.value })}
                    >
                      <option value="">-- ໃຊ້ອັດຕະໂນມັດ (ຈາກເລກ 2 ຕົວ) --</option>
                      {suggestedAnimals.length > 0 && (
                        <optgroup label="✅ ແນະນຳ">
                          {suggestedAnimals.map(a => (
                            <option key={a.animal_id} value={a.animal_id}>{a.animal_name_lao} ({a.animal_numbers})</option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="ທັງໝົດ">
                        {animals.map(a => (
                          <option key={a.animal_id} value={a.animal_id}>{a.animal_name_lao} ({a.animal_numbers})</option>
                        ))}
                      </optgroup>
                    </select>
                  </FieldBox>
                  {selectedAnimalObj && (
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-[#006c49] dark:text-[#4ade80] font-semibold">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      ເລືອກ: {selectedAnimalObj.animal_name_lao}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: YouTube */}
            <div>
              <SectionDivider icon="smart_display" label="ລິ້ງວິດີໂອ (ທາງເລືອກ)" />
              <div className="mt-4">
                <FieldLabel icon="link">YouTube Shorts URL</FieldLabel>
                <FieldBox>
                  <div className="flex items-center">
                    <span className="pl-3.5 shrink-0">
                      <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">smart_display</span>
                    </span>
                    <input
                      type="url"
                      className={inputCls}
                      placeholder="https://youtube.com/shorts/..."
                      value={formData.youtube_url}
                      onChange={e => setFormData({ ...formData, youtube_url: e.target.value })}
                    />
                  </div>
                </FieldBox>
              </div>
            </div>

            {/* Submit */}
            <div className={`flex gap-3 pt-2 ${isEditing ? 'flex-row' : ''}`}>
              {isEditing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-none flex items-center gap-2 px-5 py-3.5 rounded-xl border border-border bg-[#f5f7ff] dark:bg-[#1a2844] text-muted-foreground text-sm font-bold hover:bg-[#eff3ff] dark:hover:bg-[#1e2d4a] transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                  ຍົກເລີກ
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-white font-black text-base shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                  ${isEditing
                    ? 'bg-gradient-to-r from-[#d97706] to-[#f59e0b] hover:from-[#b45309] hover:to-[#d97706] hover:shadow-md'
                    : 'bg-gradient-to-r from-[#003fb1] to-[#1a56db] hover:from-[#002d82] hover:to-[#003fb1] hover:shadow-md'
                  }`}
              >
                {loading
                  ? <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ກຳລັງປະມວນຜົນ...
                    </>
                  : <>
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isEditing ? 'save' : 'add_circle'}
                      </span>
                      {isEditing ? 'ອັບເດດຂໍ້ມູນ' : 'ບັນທຶກເຂົ້າຖານຂໍ້ມູນ'}
                    </>
                }
              </button>
            </div>
          </div>
        </div>
      </form>
      </div>{/* end col-1 form */}

      {/* ─── Col 2: Recent Draws ─── */}
      <div className="lg:col-span-3">
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">

        {/* Card header + filter */}
        <div className="px-5 sm:px-8 py-5 border-b border-border space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#003fb1] text-[18px]">history</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-foreground truncate">
                  ຜົນລ່າສຸດ{selectedType ? <span className="text-primary"> — {selectedType.type_name}</span> : ''}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {(historySearch || historyYear || historyMonth)
                    ? `ສະແດງ ${searchedDraws.length} / ${filteredDraws.length} ງວດ`
                    : `${filteredDraws.length} ງວດທັງໝົດ`}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-primary bg-secondary px-3 py-1 rounded-full shrink-0">
              {searchedDraws.length} ງວດ
            </span>
          </div>

          {/* Search + year + month */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] text-muted-foreground pointer-events-none">search</span>
              <input
                type="text"
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                placeholder="ຄົ້ນຫາ ງວດ, ວັນທີ, ເລກ..."
                className="w-full h-9 pl-9 pr-8 bg-[#f5f7ff] dark:bg-[#1a2844] border border-border rounded-xl text-xs font-medium text-foreground placeholder:text-[#a0a3bd] outline-none focus:border-[#003fb1] focus:ring-2 focus:ring-[#003fb1]/15 transition-all"
              />
              {historySearch && (
                <button onClick={() => setHistorySearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive transition-colors">
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              )}
            </div>
            {/* Year */}
            <select
              value={historyYear}
              onChange={e => setHistoryYear(e.target.value)}
              className={`h-9 px-2.5 rounded-xl border text-xs font-bold outline-none transition-all cursor-pointer shrink-0
                ${historyYear ? 'border-[#003fb1] text-[#003fb1] bg-[#eff3ff] dark:bg-[#1e2d4a]' : 'border-border text-muted-foreground bg-[#f5f7ff] dark:bg-[#1a2844]'}`}
            >
              <option value="">ທຸກປີ</option>
              {historyAvailYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {/* Month */}
            <select
              value={historyMonth}
              onChange={e => setHistoryMonth(e.target.value)}
              className={`h-9 px-2.5 rounded-xl border text-xs font-bold outline-none transition-all cursor-pointer shrink-0
                ${historyMonth ? 'border-[#003fb1] text-[#003fb1] bg-[#eff3ff] dark:bg-[#1e2d4a]' : 'border-border text-muted-foreground bg-[#f5f7ff] dark:bg-[#1a2844]'}`}
            >
              <option value="">ທຸກເດືອນ</option>
              {historyAvailMonths.map(m => <option key={m} value={m}>{LAO_MONTHS[m]}</option>)}
            </select>
            {/* Clear */}
            {(historySearch || historyYear || historyMonth) && (
              <button
                onClick={() => { setHistorySearch(''); setHistoryYear(''); setHistoryMonth(''); }}
                className="h-9 px-3 rounded-xl border border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/10 text-xs font-bold transition-all flex items-center justify-center gap-1 shrink-0"
              >
                <span className="material-symbols-outlined text-[14px]">filter_list_off</span>
                <span className="hidden sm:inline">ລ້າງ</span>
              </button>
            )}
          </div>
        </div>

        {/* Draw list */}
        {searchedDraws.length === 0
          ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="material-symbols-outlined text-4xl text-[#c3c5d7]">
                {filteredDraws.length === 0 ? 'inbox' : 'search_off'}
              </span>
              <p className="text-sm text-muted-foreground">
                {filteredDraws.length === 0 ? 'ຍັງບໍ່ມີຂໍ້ມູນສຳລັບປະເພດນີ້' : 'ບໍ່ພົບຂໍ້ມູນທີ່ຕ້ອງການ'}
              </p>
              {(historySearch || historyYear || historyMonth) && (
                <button
                  onClick={() => { setHistorySearch(''); setHistoryYear(''); setHistoryMonth(''); }}
                  className="text-xs text-primary font-bold hover:underline"
                >ລ້າງ filter</button>
              )}
            </div>
          )
          : (
            <div className="divide-y divide-[#f0f4ff] dark:divide-[#1e2d4a]">
              {pagedDraws.map((d, idx) => {
                const animalForDraw = (() => {
                  const det = d.results_detail?.find(r => r.prize_type === '2_digits');
                  const aid = det?.animal_id;
                  const twoDigit = det?.result_value;
                  return (aid ? animals.find(a => a.animal_id == aid) : null)
                    ?? (twoDigit ? animals.find(a => a.animal_numbers.split(',').map(n => n.trim()).includes(twoDigit)) : null);
                })();
                const isCurrentEdit = isEditing && d.draw_id === editDrawId;
                const rowNum = (safeHistoryPage - 1) * HISTORY_PAGE_SIZE + idx + 1;
                return (
                  <div
                    key={d.draw_id}
                    className={`flex items-center gap-3 px-4 sm:px-7 py-3.5 transition-all duration-200 hover:bg-[#f8faff] dark:hover:bg-[#1a2844]
                      ${isCurrentEdit ? 'bg-[#fffbeb] dark:bg-[#1c1208]' : ''}`}
                  >
                    {/* Rank + Number */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-black text-[#c3c5d7] dark:text-[#2b3a54] w-4 text-center hidden sm:block">{rowNum}</span>
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm shrink-0
                        ${isCurrentEdit ? 'bg-gradient-to-br from-[#d97706] to-[#f59e0b] text-white' : 'bg-secondary text-primary'}`}>
                        {d.draw_number}
                      </div>
                    </div>

                    {/* Date — short on mobile, full Lao date on desktop */}
                    <div className="shrink-0">
                      <p className="text-[11px] font-bold text-foreground leading-tight">
                        <span className="hidden sm:inline">{formatLaoDate(d.draw_date, true)}</span>
                        <span className="sm:hidden">{d.draw_date}</span>
                      </p>
                    </div>

                    {/* Result digits */}
                    <div className="flex-1 min-w-0 flex items-center justify-center">
                      <ResultDigits result={d.full_result} />
                    </div>

                    {/* Animal — md+ only */}
                    {animalForDraw && (
                      <div className="shrink-0 hidden md:flex items-center gap-1.5">
                        {resolveAnimalImage(animalForDraw)
                          ? <img src={resolveAnimalImage(animalForDraw)} alt={animalForDraw.animal_name_lao} className="w-7 h-7 rounded-lg object-cover" />
                          : <span className="material-symbols-outlined text-[#006c49] text-[18px]">pets</span>
                        }
                        <span className="text-xs text-muted-foreground font-medium">{animalForDraw.animal_name_lao}</span>
                      </div>
                    )}

                    {/* Edit button — always visible (mobile-friendly) */}
                    <button
                      onClick={() => handleEdit(d)}
                      className={`shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200
                        ${isCurrentEdit
                          ? 'bg-[#fcd34d]/30 text-[#92400e] dark:text-[#fcd34d]'
                          : 'bg-[#f5f7ff] dark:bg-[#1a2844] text-muted-foreground hover:bg-[#eff3ff] dark:hover:bg-[#1e2d4a] hover:text-primary'
                        }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">{isCurrentEdit ? 'edit_square' : 'edit'}</span>
                      <span className="hidden sm:inline">{isCurrentEdit ? 'ກຳລັງແກ້ໄຂ' : 'ແກ້ໄຂ'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )
        }

        {/* Pagination */}
        {totalHistoryPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 px-5 py-4 border-t border-border flex-wrap">
            <button
              onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
              disabled={safeHistoryPage === 1}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground bg-secondary hover:bg-[#eff3ff] hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            {Array.from({ length: totalHistoryPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalHistoryPages || Math.abs(p - safeHistoryPage) <= 1)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === '...'
                  ? <span key={`e${i}`} className="w-6 text-center text-xs text-muted-foreground">…</span>
                  : <button
                      key={item}
                      onClick={() => setHistoryPage(item)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all
                        ${safeHistoryPage === item ? 'bg-[#003fb1] text-white shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                    >{item}</button>
              )
            }
            <button
              onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))}
              disabled={safeHistoryPage === totalHistoryPages}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground bg-secondary hover:bg-[#eff3ff] hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
            <span className="text-[10px] text-muted-foreground ml-1">{safeHistoryPage}/{totalHistoryPages}</span>
          </div>
        )}
      </div>
      </div>{/* end col-2 history */}
      </div>{/* end two-column grid */}
    </div>
  );
}