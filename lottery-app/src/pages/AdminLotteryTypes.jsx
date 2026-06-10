import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API } from '../utils/api';
import toast from 'react-hot-toast';

// ── Preset colors ────────────────────────────────────────────────
const PRESET_COLORS = [
  '#10b981', '#059669', '#065f46', '#34d399', // Emerald/Jade variants
  '#e2a857', '#d97706', '#f59e0b', '#fbbf24', // Gold/Amber/Bronze
  '#b45309', '#f97316', '#ea580c', '#c2410c', // Copper/Orange
  '#e11d48', '#be123c', '#9f1239', '#4b5563', // Rich Red / Slate
];

// ── Helpers ──────────────────────────────────────────────────────
function hexToRgba(hex, alpha = 0.12) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Sub-components ───────────────────────────────────────────────

function FieldLabel({ children, icon }) {
  return (
    <label className="flex items-center gap-1.5 text-[10px] font-black text-white/35 uppercase tracking-widest mb-2 select-none">
      {icon && <span className="material-symbols-outlined text-[13px] text-[#d4af37] select-none">{icon}</span>}
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

const inputCls = 'w-full bg-transparent px-3.5 py-3 text-white text-xs font-semibold placeholder:text-white/20 outline-none';

function StatusBadge({ active }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border tracking-wider uppercase transition-all duration-300 ${
      active
        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
        : 'bg-white/[0.02] border-white/[0.05] text-white/30'
    }`}>
      <span className="relative flex h-1.5 w-1.5">
        {active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${active ? 'bg-emerald-400' : 'bg-white/25'}`}></span>
      </span>
      {active ? 'ໃຊ້ງານ' : 'ປິດໃຊ້'}
    </span>
  );
}

// ── Color Picker ─────────────────────────────────────────────────
function ColorPicker({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 mb-1.5">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`w-7 h-7 rounded-lg border-2 transition-all duration-300 cursor-pointer ${value === c ? 'border-[#d4af37] scale-110 shadow-md shadow-[#d4af37]/30' : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'}`}
            style={{ background: c }}
            title={c}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl border border-white/10 shrink-0 shadow-sm" style={{ background: value }} />
        <div className="flex-1">
          <FieldBox>
            <input
              type="text"
              className={inputCls + ' font-mono text-xs'}
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="#10b981"
              maxLength={7}
            />
          </FieldBox>
        </div>
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-9 h-9 rounded-xl border border-white/10 cursor-pointer p-0.5 bg-transparent shrink-0"
          title="ເລືອກສີ"
        />
      </div>
    </div>
  );
}

// ── Type Card ────────────────────────────────────────────────────
function TypeCard({ item, onEdit, onDelete, isAdmin }) {
  const [confirming, setConfirming] = useState(false);
  const color = item.color || '#d4af37';

  return (
    <div className="group relative bg-[#0e1124]/85 backdrop-blur-md rounded-3xl border border-white/[0.05] shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:border-[#d4af37]/35 transition-all duration-300 overflow-hidden text-left">
      {/* Color stripe */}
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
              style={{ background: hexToRgba(color, 0.1), borderColor: `${color}25` }}>
              <span className="material-symbols-outlined text-[20px]" style={{ color }}>category</span>
            </div>
            <div>
              <p className="text-sm font-black text-white leading-tight">{item.type_name}</p>
              <p className="text-[10px] font-bold text-white/30 mt-1">ID: {item.type_id}</p>
            </div>
          </div>
          <StatusBadge active={item.is_active == 1} />
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-white/50 mb-5 leading-relaxed line-clamp-2">{item.description}</p>
        )}

        {/* Meta chips */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {item.schedule && (
            <span className="flex items-center gap-1.5 bg-white/[0.02] text-white/55 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-white/[0.05]">
              <span className="material-symbols-outlined text-[12px] text-white/40">schedule</span>
              {item.schedule}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border shadow-sm"
            style={{ background: hexToRgba(color, 0.08), color, borderColor: `${color}30` }}>
            <span className="material-symbols-outlined text-[12px]">dataset</span>
            {item.draw_count ?? 0} ງວດ
          </span>
        </div>

        {/* Actions */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(item)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black bg-white/[0.03] text-white/60 hover:text-[#d4af37] hover:bg-[#d4af37]/10 border border-white/[0.06] hover:border-[#d4af37]/25 transition-all duration-300 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
              ແກ້ໄຂ
            </button>
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                disabled={item.draw_count > 0}
                title={item.draw_count > 0 ? `ມີ ${item.draw_count} ງວດ ລຶບບໍ່ໄດ້` : 'ລຶບ'}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">delete</span>
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { onDelete(item.type_id); setConfirming(false); }}
                  className="px-2.5 py-2 rounded-xl text-[10.5px] font-black bg-rose-600 text-white hover:bg-rose-700 transition-all duration-200 cursor-pointer"
                >ຢືນຢັນ</button>
                <button
                  onClick={() => setConfirming(false)}
                  className="px-2.5 py-2 rounded-xl text-[10.5px] font-black bg-white/5 text-white/50 border border-white/10 transition-all duration-200 cursor-pointer"
                >ຍົກເລີກ</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Form Modal ───────────────────────────────────────────────────
function TypeFormModal({ initial, onSave, onClose, loading }) {
  const isEdit = !!initial?.type_id;
  const [form, setForm] = useState({
    type_name:   initial?.type_name   || '',
    description: initial?.description || '',
    schedule:    initial?.schedule    || '',
    color:       initial?.color       || '#d4af37',
    is_active:   initial?.is_active != null ? Number(initial.is_active) : 1,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0c0e1b] rounded-3xl border border-white/[0.08] shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeInUp_0.25s_ease] text-left">
        
        {/* Header */}
        <div className="relative overflow-hidden border-b border-white/[0.05]">
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #09261a, ${form.color})`, opacity: 0.85 }} />
          <div className="relative z-10 px-7 py-6 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-2.5">
                <span className="material-symbols-outlined text-white/80 text-[13px]">{isEdit ? 'edit_square' : 'add_circle'}</span>
                <span className="text-white/90 text-[9px] font-black uppercase tracking-widest">{isEdit ? 'Edit Mode' : 'Create Mode'}</span>
              </div>
              <h2 className="text-lg font-black text-white font-headline leading-none">
                {isEdit ? 'ແກ້ໄຂປະເພດຫວຍ' : 'ເພີ່ມປະເພດຫວຍໃໝ່'}
              </h2>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-7 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Name */}
          <div className="space-y-1.5">
            <FieldLabel icon="badge">ຊື່ປະເພດຫວຍ *</FieldLabel>
            <FieldBox>
              <input
                className={inputCls}
                placeholder="ເຊັ່ນ: ຫວຍພັດທະນາ"
                value={form.type_name}
                onChange={e => set('type_name', e.target.value)}
                required
              />
            </FieldBox>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <FieldLabel icon="description">ລາຍລະອຽດ</FieldLabel>
            <FieldBox>
              <textarea
                className={inputCls + ' resize-none'}
                rows={2}
                placeholder="ໃສ່ລາຍລະອຽດ (ທາງເລືອກ)"
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </FieldBox>
          </div>

          {/* Schedule */}
          <div className="space-y-1.5">
            <FieldLabel icon="schedule">ຕາຕະລາງ / ຄາບ</FieldLabel>
            <FieldBox>
              <input
                className={inputCls}
                placeholder="ເຊັ່ນ: ທຸກວັນຈັນ-ສຸກ 4:30 PM"
                value={form.schedule}
                onChange={e => set('schedule', e.target.value)}
              />
            </FieldBox>
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <FieldLabel icon="palette">ສີປະຈຳປະເພດຫວຍ</FieldLabel>
            <ColorPicker value={form.color} onChange={v => set('color', v)} />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <FieldLabel icon="toggle_on">ສະຖານະ</FieldLabel>
            <div className="flex gap-3">
              {[{v:1, label:'ໃຊ້ງານ', color:'#10b981'},{v:0, label:'ປິດໃຊ້', color:'#737686'}].map(o => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => set('is_active', o.v)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-xs font-black transition-all cursor-pointer ${
                    form.is_active === o.v
                      ? 'border-transparent text-white shadow-sm'
                      : 'border-white/[0.06] bg-[#0b0e1a] text-white/35'
                  }`}
                  style={form.is_active === o.v ? { background: o.color } : {}}
                >
                  <span className="material-symbols-outlined text-[16px]">{o.v === 1 ? 'check_circle' : 'cancel'}</span>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-7 pb-6 sm:pb-7 flex gap-3">
          <button
            onClick={onClose}
            className="flex-none px-5 py-3 rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white text-xs font-black transition-all cursor-pointer"
          >ຍົກເລີກ</button>
          <button
            onClick={() => onSave(form, isEdit ? initial.type_id : null)}
            disabled={loading || form.type_name.trim().length < 2}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-black font-black text-xs shadow-md disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer"
            style={{ background: form.color }}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-black/35 border-t-black rounded-full animate-spin" />
                ກຳລັງບັນທຶກ...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings:"'FILL' 1"}}>{isEdit ? 'save' : 'add_circle'}</span>
                {isEdit ? 'ອັບເດດ' : 'ເພີ່ມປະເພດ'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function AdminLotteryTypes() {
  const { authFetch, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [types, setTypes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch]     = useState('');
  const [filterActive, setFilterActive] = useState('all');

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    const { ok, data } = await authFetch(`${API}/index.php?action=list_types`);
    if (ok) setTypes(data);
    else toast.error(data.error || 'ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ');
    setLoading(false);
  }, [authFetch]);

  useEffect(() => { fetchTypes(); }, [fetchTypes]);

  const handleSave = async (form, editId) => {
    setSaving(true);
    const action = editId ? 'update_type' : 'create_type';
    const body   = editId ? { ...form, type_id: editId } : form;
    const { ok, data } = await authFetch(`${API}/index.php?action=${action}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (ok) {
      toast.success(data.message || 'ສຳເລັດ');
      setShowModal(false);
      setEditItem(null);
      fetchTypes();
    } else {
      toast.error(data.error || 'ເກີດຂໍ້ຜິດພາດ');
    }
    setSaving(false);
  };

  const handleDelete = async (typeId) => {
    const { ok, data } = await authFetch(`${API}/index.php?action=delete_type`, {
      method: 'POST',
      body: JSON.stringify({ type_id: typeId }),
    });
    if (ok) { toast.success(data.message || 'ລຶບສຳເລັດ'); fetchTypes(); }
    else toast.error(data.error || 'ລຶບບໍ່ສຳເລັດ');
  };

  const openAdd  = () => { setEditItem(null); setShowModal(true); };
  const openEdit = (item) => { setEditItem(item); setShowModal(true); };

  const filtered = types.filter(t => {
    const matchSearch = t.type_name.toLowerCase().includes(search.toLowerCase())
      || (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchActive = filterActive === 'all'
      || (filterActive === 'active' && t.is_active == 1)
      || (filterActive === 'inactive' && t.is_active != 1);
    return matchSearch && matchActive;
  });

  const totalDraws = types.reduce((s, t) => s + (t.draw_count || 0), 0);

  return (
    <div className="space-y-7 text-left select-none">

      {/* ─── Page Header ─── */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1020] via-[#090b16] to-[#04060e]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.08),transparent_60%)]" />
        <div className="absolute right-0 bottom-0 text-[7rem] sm:text-[10rem] font-black text-[#d4af37]/[0.03] leading-none select-none pointer-events-none pr-4 pb-1">
          TYPES
        </div>
        <div className="relative z-10 px-7 sm:px-10 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#d4af37] rounded-full px-3 py-1 mb-3">
              <span className="material-symbols-outlined text-[13px]">category</span>
              <span className="text-[9px] font-black uppercase tracking-widest">Lottery Configurations</span>
            </div>
            <h1 className="text-xl sm:text-2.5xl font-black text-white leading-tight font-headline">
              ຈັດການ <span className="text-[#d4af37] ml-1.5">ປະເພດຫວຍ</span>
            </h1>
            <p className="text-white/50 text-[11px] mt-1.5 font-bold">ເພີ່ມ, ແກ້ໄຂ, ແລະ ຈັດການປະເພດຫວຍທັງໝົດໃນລະບົບ</p>
          </div>

          {/* Stats pills */}
          <div className="flex gap-3 flex-wrap shrink-0">
            {[
              { label: 'ທັງໝົດ',  value: types.length,                             icon: 'category',     color: '#d4af37' },
              { label: 'ໃຊ້ງານ',  value: types.filter(t => t.is_active==1).length, icon: 'check_circle', color: '#10b981' },
              { label: 'ງວດທັງໝົດ', value: totalDraws,                              icon: 'dataset',      color: '#7c3aed' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3 text-center min-w-[80px]">
                <span className="material-symbols-outlined text-[15px] mb-1 block" style={{ color }}>{icon}</span>
                <p className="text-xl font-black text-white leading-none font-space">{value}</p>
                <p className="text-[10px] mt-1" style={{ color: `${color}cc` }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Toolbar ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-white/30 pointer-events-none">search</span>
          <input
            type="text"
            placeholder="ຄົ້ນຫາປະເພດຫວຍ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0e1124] border border-white/[0.06] rounded-xl text-xs font-semibold text-white placeholder:text-white/20 outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/10 transition-all duration-300"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex bg-[#0b0e1a] rounded-xl p-1 border border-white/[0.06] gap-1 select-none">
          {[
            { v: 'all',      label: 'ທັງໝົດ' },
            { v: 'active',   label: 'ໃຊ້ງານ' },
            { v: 'inactive', label: 'ປິດໃຊ້' },
          ].map(o => (
            <button
              key={o.v}
              onClick={() => setFilterActive(o.v)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all duration-200 cursor-pointer ${
                filterActive === o.v
                  ? 'bg-[#d4af37] text-black shadow-md scale-103'
                  : 'text-white/45 hover:text-white'
              }`}
            >{o.label}</button>
          ))}
        </div>

        {/* Add button */}
        {isAdmin && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#b8860b] text-black text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings:"'FILL' 1"}}>add_circle</span>
            ເພີ່ມປະເພດຫວຍ
          </button>
        )}
      </div>

      {/* ─── Type Cards Grid ─── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-3xl animate-pulse h-44" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[#0e1124] rounded-3xl border border-white/[0.05]">
          <span className="material-symbols-outlined text-5xl text-white/10">inbox</span>
          <p className="text-xs text-white/30 font-bold">
            {search ? 'ບໍ່ພົບຜົນການຄົ້ນຫາ' : 'ຍັງບໍ່ມີປະເພດຫວຍ'}
          </p>
          {isAdmin && !search && (
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37]/10 text-[#d4af37] text-xs font-black uppercase tracking-wider hover:bg-[#d4af37]/20 border border-[#d4af37]/25 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">add</span>
              ເພີ່ມດຽວນີ້
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(item => (
            <TypeCard
              key={item.type_id}
              item={item}
              onEdit={openEdit}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* ─── Modal ─── */}
      {showModal && (
        <TypeFormModal
          initial={editItem}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditItem(null); }}
          loading={saving}
        />
      )}
    </div>
  );
}
