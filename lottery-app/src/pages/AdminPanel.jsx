import { useState, useMemo, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { API, resolveAnimalImage } from '../utils/api';
import { formatLaoDate } from '../utils/date';

// ── Sub-components ───────────────────────────────────────────────

function FieldLabel({ children, icon }) {
  return (
    <label className="flex items-center gap-1.5 text-[10px] font-black text-white/45 uppercase tracking-widest mb-2 select-none">
      {icon && <span className="material-symbols-outlined text-[13px] text-[#d4af37] shrink-0">{icon}</span>}
      {children}
    </label>
  );
}

function FieldBox({ children }) {
  return (
    <div className="bg-[#0b0e1a] border border-white/[0.06] rounded-xl overflow-hidden focus-within:border-[#d4af37] focus-within:ring-2 focus-within:ring-[#d4af37]/20 transition-all duration-300">
      {children}
    </div>
  );
}

function SectionDivider({ icon, label }) {
  return (
    <div className="flex items-center gap-3 py-1 select-none">
      <div className="w-7 h-7 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[#d4af37] text-[14px]">{icon}</span>
      </div>
      <p className="text-[10px] font-black text-white/80 uppercase tracking-widest shrink-0 font-headline">{label}</p>
      <div className="flex-1 h-px bg-gradient-to-r from-white/[0.08] to-transparent" />
    </div>
  );
}

function ResultDigits({ result }) {
  if (!result) return null;
  const padded = result.padEnd(6, '·');
  const groups = [padded.slice(0, 2), padded.slice(2, 4), padded.slice(4, 6)];
  return (
    <div className="flex items-center gap-1.5 select-none font-mono">
      {groups.map((grp, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {grp.split('').map((ch, ci) => {
            const hasVal = /\d/.test(ch);
            return (
              <div
                key={ci}
                className={`w-7.5 h-9 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-300 border relative overflow-hidden
                  ${hasVal
                    ? 'bg-gradient-to-tr from-[#d4af37] via-[#f59e0b] to-[#fed7aa] text-black shadow-md border-[#fbbf24]/20 shadow-[#f59e0b]/10 scale-105'
                    : 'bg-black/45 border-white/[0.05] text-white/10'
                  }`}
              >
                {ch}
                {hasVal && (
                  <div className="absolute top-0.5 left-1 w-3 h-1 bg-white/35 rounded-full rotate-[-15deg]" />
                )}
              </div>
            );
          })}
          {gi < 2 && <span className="text-white/[0.12] font-black text-xs mx-0.5">·</span>}
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

  // Auto-populate draw number
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
            draw_number: (getNextDrawNumber(prev.draw_date, prev.type_id)).toString()
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

  const inputCls = 'w-full bg-transparent px-3.5 py-3 text-white text-xs font-semibold placeholder:text-white/25 outline-none';
  const selectedAnimalObj = animals.find(a => a.animal_id == formData.animal_id)
    || (suggestedAnimals[0] && !formData.animal_id ? suggestedAnimals[0] : null);

  return (
    <div className="space-y-6 text-left select-none">
      <style>{`
        @keyframes rotate-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-rotate-slow {
          animation: rotate-slow 20s linear infinite;
        }
        .ticket-input {
          font-family: 'Space Grotesk', sans-serif;
        }
        /* Glass styling custom overrides for form cards */
        .glass-panel {
          background: linear-gradient(158deg, rgba(14, 18, 44, 0.75) 0%, rgba(9, 12, 32, 0.85) 50%, rgba(5, 7, 18, 0.95) 100%);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(16px);
        }
        /* Curved specular overlay for inputs */
        .specular-box {
          position: relative;
          overflow: hidden;
        }
        .specular-box::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
          pointer-events: none;
        }
      `}</style>

      {/* ─── Page Header Banner ─── */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/[0.06]">
        <div className={`absolute inset-0 transition-all duration-500 ${
          isEditing 
            ? 'bg-gradient-to-br from-[#2e1065] via-[#1e1b4b] to-[#090514]' 
            : 'bg-gradient-to-br from-[#06141d] via-[#0b2432] to-[#040c11]'
        }`} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.08),transparent_60%)]" />
        
        {/* Rotating graphic overlay */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 pointer-events-none animate-rotate-slow">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="2" strokeDasharray="6 6" />
            <circle cx="50" cy="50" r="35" stroke="white" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="50" cy="50" r="25" stroke="white" strokeWidth="1" />
          </svg>
        </div>

        <div className="relative z-10 px-6 sm:px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className={`inline-flex items-center gap-2 border rounded-full px-3 py-1 mb-3 backdrop-blur-sm
              ${isEditing 
                ? 'bg-[#d4af37]/10 border-[#d4af37]/25 text-[#d4af37]' 
                : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'}`}>
              <span className="material-symbols-outlined text-[13px] animate-pulse">
                {isEditing ? 'edit_square' : 'add_circle'}
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest">
                {isEditing ? 'Edit Mode' : 'New Draw Entry'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2.5xl font-black text-white leading-tight font-headline">
              {isEditing ? (
                <span>ແກ້ໄຂ <span className="text-[#d4af37]">ງວດທີ {formData.draw_number}</span></span>
              ) : (
                <span>ເພີ່ມຜົນ<span className="text-[#d4af37] ml-1.5">ງວດໃໝ່</span></span>
              )}
            </h1>
            <p className="text-white/50 text-[11px] mt-1.5 font-bold">
              {isEditing ? 'ແກ້ໄຂຂໍ້ມູນຜົນລາງວັນ ຈາກນັ້ນກົດ "ອັບເດດ"' : 'ປ້ອນຜົນລາງວັນອອກຫວຍ ແລ້ວກົດ "ບັນທຶກ"'}
            </p>
          </div>
          {isEditing && (
            <button
              onClick={cancelEdit}
              className="self-start sm:self-center flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/25 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all duration-300 backdrop-blur-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">close</span>
              ຍົກເລີກການແກ້ໄຂ
            </button>
          )}
        </div>
      </div>

      {/* ─── Message Toast ─── */}
      {message.text && (
        <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border text-xs font-black transition-all duration-300 shadow-md
          ${message.ok
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${message.ok ? 'bg-emerald-500/15' : 'bg-rose-500/15'}`}>
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              {message.ok ? 'check_circle' : 'error'}
            </span>
          </div>
          <span className="flex-1 leading-relaxed">{message.text}</span>
          <button onClick={() => setMessage({ text: '', ok: true })} className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* ─── Two-column layout grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* ─── Column 1: Form Card ─── */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="glass-panel rounded-3xl border border-white/[0.05] overflow-hidden relative shadow-2xl">
              
              {/* Highlight bar for edit mode */}
              {isEditing && (
                <div className="h-[3px] bg-gradient-to-r from-amber-500 via-yellow-400 to-[#d4af37] shadow-lg shadow-amber-500/30" />
              )}
              
              <div className="p-6 space-y-6">

                {/* Section 1: Draw Info */}
                <div className="space-y-4">
                  <SectionDivider icon="info" label="ຂໍ້ມູນງວດຫວຍ" />
                  
                  {/* Types selection wrapper */}
                  <div className="space-y-2">
                    <FieldLabel icon="category">ປະເພດຫວຍ</FieldLabel>
                    {types && types.length > 1 ? (
                      <div className="flex flex-wrap gap-2">
                        {types.map(t => {
                          const color = t.color || '#d4af37';
                          const active = formData.type_id === t.type_id;
                          return (
                            <button
                              key={t.type_id}
                              type="button"
                              onClick={() => {
                                const nextNum = !isEditing ? getNextDrawNumber(formData.draw_date, t.type_id) : parseInt(formData.draw_number || '1');
                                setFormData({ ...formData, type_id: t.type_id, draw_number: nextNum.toString() });
                              }}
                              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-2 text-xs font-black transition-all duration-300 cursor-pointer"
                              style={active
                                ? { borderColor: color, background: `${color}15`, color }
                                : { borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)', color: 'rgba(255,255,255,0.45)' }
                              }
                            >
                              <span className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ background: color }} />
                              {t.type_name}
                              {active && <span className="material-symbols-outlined text-[13px] ml-1">check</span>}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <FieldBox>
                        <select
                          className={inputCls + ' cursor-pointer bg-[#0b0e1a]'}
                          value={formData.type_id}
                          onChange={e => {
                            const newTypeId = parseInt(e.target.value);
                            const nextNum = !isEditing ? getNextDrawNumber(formData.draw_date, newTypeId).toString() : formData.draw_number;
                            setFormData({ ...formData, type_id: newTypeId, draw_number: nextNum });
                          }}
                          required
                        >
                          {types?.map(t => (
                            <option key={t.type_id} value={t.type_id} className="bg-[#0e1227]">{t.type_name}</option>
                          ))}
                        </select>
                      </FieldBox>
                    )}
                  </div>

                  {/* Date + Draw Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <FieldLabel icon="calendar_today">ງວດວັນທີ</FieldLabel>
                      <FieldBox>
                        <input
                          type="date"
                          className={inputCls + ' dark:color-scheme-dark'}
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
                    
                    <div className="space-y-1.5">
                      <FieldLabel icon="tag">ງວດທີ</FieldLabel>
                      <FieldBox>
                        <input
                          type="number"
                          className={inputCls + ' font-black text-[#d4af37] ticket-input'}
                          placeholder="1"
                          value={formData.draw_number}
                          onChange={e => setFormData({ ...formData, draw_number: e.target.value })}
                          required
                        />
                      </FieldBox>
                    </div>
                  </div>
                </div>

                {/* Section 2: Result Entry */}
                <div className="space-y-4">
                  <SectionDivider icon="pin" label="ເລກທີ່ອອກ (RESULT)" />
                  
                  {/* Digit inputs */}
                  <div className="space-y-2">
                    <FieldLabel>ປ້ອນ 6 ຕົວເລກ</FieldLabel>
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      {[0, 1, 2, 3, 4, 5].map(i => {
                        const val = formData.full_result[i];
                        const filled = val !== undefined && val !== ' ' && val !== '';
                        return (
                          <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                            <input
                              ref={el => (digitRefs.current[i] = el)}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={val || ''}
                              onChange={e => handleDigitInput(i, e.target.value)}
                              onKeyDown={e => handleDigitKeyDown(i, e)}
                              onPaste={i === 0 ? handleDigitPaste : undefined}
                              className={`w-11 h-13 sm:w-12 sm:h-14 rounded-2xl text-center text-xl font-black border-2 outline-none transition-all duration-300 cursor-text relative font-mono
                                ${filled
                                  ? 'border-[#fbbf24] bg-gradient-to-tr from-[#d4af37] via-[#f59e0b] to-[#fed7aa] text-black shadow-md shadow-[#f59e0b]/15'
                                  : 'border-white/[0.06] bg-[#0b0e1a] text-white'
                                }
                                focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10`}
                            />
                            {(i === 1 || i === 3) && (
                              <span className="text-white/[0.12] font-black text-sm hidden sm:block">·</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-white/30 font-bold leading-relaxed pt-1">
                      ກົດ Tab/ລູກສອນ ເພື່ອຍ້າຍ · Backspace ເພື່ອລຶບ · Ctrl+V ວາງທັງໝົດ
                    </p>
                  </div>

                  {/* Preview banner */}
                  {formData.full_result.length > 0 && (
                    <div className="flex items-center justify-between bg-white/[0.02] rounded-2xl px-4 py-3.5 border border-white/[0.05]">
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Live Preview</span>
                      <ResultDigits result={formData.full_result} />
                      {formData.full_result.length === 6 ? (
                        <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 shadow-sm">
                          ຄົບ 6 ຕົວ
                        </span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </div>
                  )}
                </div>

                {/* Section 3: Recommended Animal */}
                <div className="space-y-4">
                  <SectionDivider icon="pets" label="ນາມສັດ (ANIMAL CODES)" />
                  
                  <div className="space-y-3">
                    {suggestedAnimals.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-[#10b981] uppercase tracking-widest flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[13px] animate-pulse">auto_awesome</span>
                          ແນະນຳລະບົບອັດຕະໂນມັດ
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
                                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 text-xs font-black transition-all duration-300 cursor-pointer hover:scale-103
                                  ${selected
                                    ? 'border-transparent bg-gradient-to-br from-[#10b981] to-[#059669] text-white shadow-lg shadow-emerald-500/15'
                                    : 'border-white/[0.06] bg-[#0b0e1a] text-white/60 hover:border-[#10b981]/40 hover:bg-[#0e1227]'
                                  }`}
                              >
                                {imgSrc ? (
                                  <img src={imgSrc} alt={a.animal_name_lao} className="w-7 h-7 rounded-lg object-cover bg-black/35 border border-white/10" />
                                ) : (
                                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                                )}
                                <div className="text-left leading-none">
                                  <p className="leading-none text-white font-black">{a.animal_name_lao}</p>
                                  <p className={`text-[9.5px] font-bold mt-1 tracking-wider ${selected ? 'text-white/80' : 'text-white/35'}`}>{a.animal_numbers}</p>
                                </div>
                                {selected && <span className="material-symbols-outlined text-sm ml-0.5">check_circle</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      {suggestedAnimals.length > 0 && (
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1.5">ຫຼື ເລືອກດ້ວຍຕົນເອງ</p>
                      )}
                      <FieldBox>
                        <select
                          className={inputCls + ' cursor-pointer bg-[#0b0e1a]'}
                          value={formData.animal_id}
                          onChange={e => setFormData({ ...formData, animal_id: e.target.value })}
                        >
                          <option value="" className="bg-[#0e1227]">-- ໃຊ້ອັດຕະໂນມັດ (ຈາກເລກ 2 ຕົວ) --</option>
                          {suggestedAnimals.length > 0 && (
                            <optgroup label="✅ ແນະນຳ" className="bg-[#0e1227]">
                              {suggestedAnimals.map(a => (
                                <option key={a.animal_id} value={a.animal_id}>{a.animal_name_lao} ({a.animal_numbers})</option>
                              ))}
                            </optgroup>
                          )}
                          <optgroup label="ທັງໝົດ" className="bg-[#0e1227]">
                            {animals.map(a => (
                              <option key={a.animal_id} value={a.animal_id}>{a.animal_name_lao} ({a.animal_numbers})</option>
                            ))}
                          </optgroup>
                        </select>
                      </FieldBox>
                      {selectedAnimalObj && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                          ເລືອກ: {selectedAnimalObj.animal_name_lao} ({selectedAnimalObj.animal_numbers})
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 4: Video */}
                <div className="space-y-4">
                  <SectionDivider icon="smart_display" label="ລິ້ງວິດີໂອ (VIDEO)" />
                  <div className="space-y-1.5">
                    <FieldLabel icon="link">YouTube Shorts URL</FieldLabel>
                    <FieldBox>
                      <div className="flex items-center">
                        <span className="pl-3.5 shrink-0 text-rose-500">
                          <span className="material-symbols-outlined text-base">smart_display</span>
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

                {/* Submit buttons */}
                <div className="flex gap-3 pt-4">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-none flex items-center gap-1.5 px-4.5 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/70 hover:text-white text-xs font-black hover:bg-white/[0.06] transition-all duration-300 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                      ຍົກເລີກ
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-black font-black text-xs shadow-md transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer
                      ${isEditing
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 shadow-amber-500/10'
                        : 'bg-[#d4af37] hover:bg-[#b8860b] shadow-amber-500/5'
                      }`}
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-black/35 border-t-black rounded-full animate-spin" />
                        ກຳລັງປະມວນຜົນ...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {isEditing ? 'save' : 'add_circle'}
                        </span>
                        {isEditing ? 'ອັບເດດຂໍ້ມູນງວດ' : 'ບັນທຶກຜົນຫວຍ'}
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          </form>
        </div>

        {/* ─── Column 2: Recent Draws ─── */}
        <div className="lg:col-span-3">
          <div className="glass-panel rounded-3xl border border-white/[0.05] overflow-hidden relative shadow-2xl">
            
            {/* Header / Filter Deck */}
            <div className="px-5 sm:px-6 py-5.5 border-b border-white/[0.05] space-y-4 bg-black/15">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0 text-[#d4af37]">
                    <span className="material-symbols-outlined text-[18px]">history</span>
                  </div>
                  <div className="min-w-0 text-left">
                    <h3 className="text-sm font-black text-white font-headline truncate leading-tight">
                      ຜົນລ່າສຸດ{selectedType ? <span className="text-[#d4af37]"> — {selectedType.type_name}</span> : ''}
                    </h3>
                    <p className="text-[10px] text-white/35 font-bold mt-1">
                      {(historySearch || historyYear || historyMonth)
                        ? `ສະແດງ ${searchedDraws.length} / ${filteredDraws.length} ງວດ`
                        : `${filteredDraws.length} ງວດທັງໝົດ`}
                    </p>
                  </div>
                </div>
                
                <span className="text-[10px] font-black text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/20 px-3 py-1.5 rounded-full shrink-0 shadow-sm">
                  {searchedDraws.length} ງວດ
                </span>
              </div>

              {/* Filters list */}
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Search text field */}
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] text-white/30 pointer-events-none">search</span>
                  <input
                    type="text"
                    value={historySearch}
                    onChange={e => setHistorySearch(e.target.value)}
                    placeholder="ຄົ້ນຫາ ງວດ, ວັນທີ, ເລກ..."
                    className="w-full h-9 pl-9 pr-8 bg-[#0b0e1a] border border-white/[0.06] rounded-xl text-xs font-semibold text-white placeholder:text-white/20 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/10 transition-all"
                  />
                  {historySearch && (
                    <button onClick={() => setHistorySearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-rose-400 cursor-pointer transition-colors">
                      <span className="material-symbols-outlined text-[15px]">close</span>
                    </button>
                  )}
                </div>

                {/* Year filter select */}
                <select
                  value={historyYear}
                  onChange={e => setHistoryYear(e.target.value)}
                  className={`h-9 px-3.5 rounded-xl border text-xs font-black outline-none transition-all cursor-pointer shrink-0 bg-[#0b0e1a]
                    ${historyYear ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10' : 'border-white/[0.06] text-white/45'}`}
                >
                  <option value="" className="bg-[#0e1227]">ທຸກປີ</option>
                  {historyAvailYears.map(y => <option key={y} value={y} className="bg-[#0e1227]">{y}</option>)}
                </select>

                {/* Month filter select */}
                <select
                  value={historyMonth}
                  onChange={e => setHistoryMonth(e.target.value)}
                  className={`h-9 px-3.5 rounded-xl border text-xs font-black outline-none transition-all cursor-pointer shrink-0 bg-[#0b0e1a]
                    ${historyMonth ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10' : 'border-white/[0.06] text-white/45'}`}
                >
                  <option value="" className="bg-[#0e1227]">ທຸກເດືອນ</option>
                  {historyAvailMonths.map(m => <option key={m} value={m} className="bg-[#0e1227]">{LAO_MONTHS[m]}</option>)}
                </select>

                {/* Clear button */}
                {(historySearch || historyYear || historyMonth) && (
                  <button
                    onClick={() => { setHistorySearch(''); setHistoryYear(''); setHistoryMonth(''); }}
                    className="h-9 px-3.5 rounded-xl border border-rose-500/20 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-black transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">filter_list_off</span>
                    <span className="hidden sm:inline">ລ້າງ</span>
                  </button>
                )}
              </div>
            </div>

            {/* Draw Items List */}
            {searchedDraws.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 select-none">
                <span className="material-symbols-outlined text-4xl text-white/10">
                  {filteredDraws.length === 0 ? 'inbox' : 'search_off'}
                </span>
                <p className="text-xs text-white/30 font-bold">
                  {filteredDraws.length === 0 ? 'ຍັງບໍ່ມີຂໍ້ມູນສຳລັບປະເພດນີ້' : 'ບໍ່ພົບຂໍ້ມູນທີ່ຕ້ອງການ'}
                </p>
                {(historySearch || historyYear || historyMonth) && (
                  <button
                    onClick={() => { setHistorySearch(''); setHistoryYear(''); setHistoryMonth(''); }}
                    className="text-xs text-[#d4af37] font-black hover:underline cursor-pointer"
                  >
                    ລ້າງ filter ທັງໝົດ
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
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
                      className={`flex items-center gap-3 px-4 sm:px-6 py-4.5 transition-all duration-300 hover:bg-white/[0.02] hover:translate-x-0.5
                        ${isCurrentEdit ? 'bg-amber-500/5 border-y border-amber-500/10' : ''}`}
                    >
                      {/* Badge / Index */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-black text-white/15 w-4 text-center hidden sm:block">{rowNum}</span>
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm shrink-0 border font-mono
                          ${isCurrentEdit 
                            ? 'bg-gradient-to-br from-[#d97706] to-[#f59e0b] text-white border-amber-400/20' 
                            : 'bg-white/[0.03] border-white/[0.06] text-white/80'}`}>
                          {d.draw_number}
                        </div>
                      </div>

                      {/* Date */}
                      <div className="shrink-0 text-left">
                        <p className="text-[11px] font-black text-white/80 leading-tight">
                          <span className="hidden sm:inline">{formatLaoDate(d.draw_date, true)}</span>
                          <span className="sm:hidden">{d.draw_date}</span>
                        </p>
                      </div>

                      {/* Result Digits */}
                      <div className="flex-1 min-w-0 flex items-center justify-center">
                        <ResultDigits result={d.full_result} />
                      </div>

                      {/* Animal details */}
                      {animalForDraw && (
                        <div className="shrink-0 hidden md:flex items-center gap-1.5 select-none bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-xl">
                          {resolveAnimalImage(animalForDraw) ? (
                            <img src={resolveAnimalImage(animalForDraw)} alt={animalForDraw.animal_name_lao} className="w-6 h-6 rounded-lg object-cover bg-black/35 border border-white/10" />
                          ) : (
                            <span className="material-symbols-outlined text-emerald-400 text-base">pets</span>
                          )}
                          <span className="text-[9.5px] text-emerald-400 font-black">{animalForDraw.animal_name_lao}</span>
                        </div>
                      )}

                      {/* Action edit button */}
                      <button
                        onClick={() => handleEdit(d)}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black transition-all duration-350 cursor-pointer border
                          ${isCurrentEdit
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            : 'bg-white/[0.03] hover:bg-[#d4af37]/15 hover:text-[#d4af37] border-white/[0.06] hover:border-[#d4af37]/25 text-white/60'
                          }`}
                      >
                        <span className="material-symbols-outlined text-sm">{isCurrentEdit ? 'edit_square' : 'edit'}</span>
                        <span className="hidden sm:inline">{isCurrentEdit ? 'ກຳລັງແກ້ໄຂ' : 'ແກ້ໄຂ'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination panel */}
            {totalHistoryPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 px-5 py-4 border-t border-white/[0.05] bg-black/5 flex-wrap">
                <button
                  onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                  disabled={safeHistoryPage === 1}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 bg-white/[0.03] hover:bg-[#d4af37]/15 hover:text-[#d4af37] disabled:opacity-20 disabled:cursor-not-allowed border border-white/[0.05] transition-all cursor-pointer animate-none"
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
                    item === '...' ? (
                      <span key={`e${i}`} className="w-6 text-center text-xs text-white/20 select-none">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setHistoryPage(item)}
                        className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer border
                          ${safeHistoryPage === item 
                            ? 'bg-[#d4af37] border-transparent text-black shadow-md shadow-amber-500/10 scale-105' 
                            : 'text-white/60 bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.06] hover:text-white'}`}
                      >
                        {item}
                      </button>
                    )
                  )}
                  
                <button
                  onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))}
                  disabled={safeHistoryPage === totalHistoryPages}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 bg-white/[0.03] hover:bg-[#d4af37]/15 hover:text-[#d4af37] disabled:opacity-20 disabled:cursor-not-allowed border border-white/[0.05] transition-all cursor-pointer animate-none"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
                <span className="text-[10px] text-white/25 ml-1 font-bold">{safeHistoryPage}/{totalHistoryPages}</span>
              </div>
            )}
          </div>
        </div>{/* end col-2 history */}
      </div>{/* end two-column grid */}
    </div>
  );
}