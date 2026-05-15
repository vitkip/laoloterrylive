import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API } from '../utils/api';
import toast from 'react-hot-toast';

// ── Preset colors ────────────────────────────────────────────────
const PRESET_COLORS = [
  '#003fb1', '#1a56db', '#006c49', '#059669',
  '#7c3aed', '#9333ea', '#d97706', '#ea580c',
  '#ba1a1a', '#e11d48', '#0891b2', '#0e7490',
  '#374151', '#1e293b',
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
    <label className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
      {icon && <span className="material-symbols-outlined text-[13px]">{icon}</span>}
      {children}
    </label>
  );
}

function FieldBox({ children }) {
  return (
    <div className="bg-[#f5f7ff] dark:bg-[#1a2844] border border-border rounded-xl overflow-hidden focus-within:border-[#003fb1] focus-within:ring-2 focus-within:ring-[#003fb1]/15 transition-all">
      {children}
    </div>
  );
}

const inputCls = 'w-full bg-transparent px-3.5 py-3 text-foreground text-sm font-medium placeholder:text-[#a0a3bd] outline-none';

function StatusBadge({ active }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
      active
        ? 'bg-[#edfdf5] dark:bg-[#052e16] text-[#006c49] dark:text-[#4ade80] border-[#6cf8bb]/40'
        : 'bg-[#f5f5f5] dark:bg-[#1a1a1a] text-[#737686] border-[#e0e0e0]/60'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#006c49]' : 'bg-[#b0b0b0]'}`} />
      {active ? 'ໃຊ້ງານ' : 'ປິດໃຊ້'}
    </span>
  );
}

// ── Color Picker ─────────────────────────────────────────────────
function ColorPicker({ value, onChange }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`w-7 h-7 rounded-lg border-2 transition-all duration-150 ${value === c ? 'border-foreground scale-110 shadow-md' : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'}`}
            style={{ background: c }}
            title={c}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg border border-border shrink-0" style={{ background: value }} />
        <FieldBox>
          <input
            type="text"
            className={inputCls + ' font-mono text-xs'}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="#003fb1"
            maxLength={7}
          />
        </FieldBox>
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5 bg-transparent"
          title="ເລືອກສີ"
        />
      </div>
    </div>
  );
}

// ── Type Card ────────────────────────────────────────────────────
function TypeCard({ item, onEdit, onDelete, isAdmin }) {
  const [confirming, setConfirming] = useState(false);
  const color = item.color || '#003fb1';

  return (
    <div className="group relative bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Color stripe */}
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: hexToRgba(color) }}>
              <span className="material-symbols-outlined text-[20px]" style={{ color }}>category</span>
            </div>
            <div>
              <p className="text-sm font-extrabold text-foreground leading-tight">{item.type_name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">ID: {item.type_id}</p>
            </div>
          </div>
          <StatusBadge active={item.is_active == 1} />
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2">{item.description}</p>
        )}

        {/* Meta chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {item.schedule && (
            <span className="flex items-center gap-1 bg-[#f5f7ff] dark:bg-[#1a2844] text-muted-foreground text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-border">
              <span className="material-symbols-outlined text-[11px]">schedule</span>
              {item.schedule}
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg border"
            style={{ background: hexToRgba(color, 0.08), color, borderColor: `${color}30` }}>
            <span className="material-symbols-outlined text-[11px]">dataset</span>
            {item.draw_count ?? 0} ງວດ
          </span>
        </div>

        {/* Actions */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(item)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-[#f5f7ff] dark:bg-[#1a2844] text-muted-foreground hover:bg-[#eff3ff] hover:text-primary border border-border transition-all"
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
              ແກ້ໄຂ
            </button>
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                disabled={item.draw_count > 0}
                title={item.draw_count > 0 ? `ມີ ${item.draw_count} ງວດ ລຶບບໍ່ໄດ້` : 'ລຶບ'}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#ba1a1a] bg-[#fff4f4] dark:bg-[#2a1010] hover:bg-[#ffdad6] border border-[#ffdad6]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <span className="material-symbols-outlined text-[15px]">delete</span>
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { onDelete(item.type_id); setConfirming(false); }}
                  className="px-2 py-1.5 rounded-lg text-[11px] font-black bg-[#ba1a1a] text-white hover:bg-[#9b0000] transition-all"
                >ຢືນຢັນ</button>
                <button
                  onClick={() => setConfirming(false)}
                  className="px-2 py-1.5 rounded-lg text-[11px] font-bold bg-[#f5f7ff] dark:bg-[#1a2844] text-muted-foreground border border-border transition-all"
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
    color:       initial?.color       || '#003fb1',
    is_active:   initial?.is_active != null ? Number(initial.is_active) : 1,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeInUp_0.2s_ease]">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #001d6e, ${form.color})` }} />
          <div className="relative z-10 px-7 py-6 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-3">
                <span className="material-symbols-outlined text-white/80 text-[13px]">{isEdit ? 'edit_square' : 'add_circle'}</span>
                <span className="text-white/90 text-[11px] font-bold uppercase tracking-widest">{isEdit ? 'Edit' : 'New'}</span>
              </div>
              <h2 className="text-xl font-black text-white">
                {isEdit ? 'ແກ້ໄຂປະເພດຫວຍ' : 'ເພີ່ມປະເພດຫວຍໃໝ່'}
              </h2>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-7 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div>
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
          <div>
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
          <div>
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
          <div>
            <FieldLabel icon="palette">ສີ</FieldLabel>
            <ColorPicker value={form.color} onChange={v => set('color', v)} />
          </div>

          {/* Status */}
          <div>
            <FieldLabel icon="toggle_on">ສະຖານະ</FieldLabel>
            <div className="flex gap-3">
              {[{v:1, label:'ໃຊ້ງານ', color:'#006c49'},{v:0, label:'ປິດໃຊ້', color:'#737686'}].map(o => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => set('is_active', o.v)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                    form.is_active === o.v
                      ? 'border-current shadow-sm'
                      : 'border-border text-muted-foreground'
                  }`}
                  style={form.is_active === o.v ? { color: o.color, background: hexToRgba(o.color, 0.08) } : {}}
                >
                  <span className="material-symbols-outlined text-[16px]">{o.v === 1 ? 'check_circle' : 'cancel'}</span>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 pb-7 flex gap-3">
          <button
            onClick={onClose}
            className="flex-none px-5 py-3 rounded-xl border border-border bg-[#f5f7ff] dark:bg-[#1a2844] text-muted-foreground text-sm font-bold hover:bg-accent transition-all"
          >ຍົກເລີກ</button>
          <button
            onClick={() => onSave(form, isEdit ? initial.type_id : null)}
            disabled={loading || form.type_name.trim().length < 2}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-black text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            style={{ background: `linear-gradient(135deg, #001d6e, ${form.color})` }}
          >
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />ກຳລັງບັນທຶກ...</>
              : <><span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings:"'FILL' 1"}}>{isEdit ? 'save' : 'add_circle'}</span>{isEdit ? 'ອັບເດດ' : 'ເພີ່ມປະເພດ'}</>
            }
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
    <div className="max-w-4xl mx-auto space-y-7">

      {/* ─── Page Header ─── */}
      <div className="relative rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#001d6e] via-[#003fb1] to-[#7c3aed]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="absolute right-0 bottom-0 text-[7rem] sm:text-[10rem] font-black text-white/[0.04] leading-none select-none pointer-events-none pr-4 pb-1">
          TYPES
        </div>
        <div className="relative z-10 px-7 sm:px-10 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 mb-4">
              <span className="material-symbols-outlined text-white/80 text-[13px]">category</span>
              <span className="text-white/90 text-[11px] font-bold uppercase tracking-widest">Lottery Types</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              ຈັດການ <span className="text-[#c4b5fd]">ປະເພດຫວຍ</span>
            </h1>
            <p className="text-white/60 text-xs mt-1.5">ເພີ່ມ, ແກ້ໄຂ, ແລະ ຈັດການປະເພດຫວຍທັງໝົດ</p>
          </div>

          {/* Stats pills */}
          <div className="flex gap-3 flex-wrap shrink-0">
            {[
              { label: 'ທັງໝົດ',  value: types.length,                             icon: 'category',     color: '#c4b5fd' },
              { label: 'ໃຊ້ງານ',  value: types.filter(t => t.is_active==1).length, icon: 'check_circle', color: '#6cf8bb' },
              { label: 'ງວດທັງໝົດ', value: totalDraws,                              icon: 'dataset',      color: '#fcd34d' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-center min-w-[80px]">
                <span className="material-symbols-outlined text-[15px] mb-1 block" style={{ color: `${color}cc` }}>{icon}</span>
                <p className="text-xl font-black text-white leading-none">{value}</p>
                <p className="text-[10px] mt-1" style={{ color: `${color}80` }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Toolbar ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-muted-foreground">search</span>
          <input
            type="text"
            placeholder="ຄົ້ນຫາປະເພດຫວຍ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium outline-none focus:border-[#003fb1] focus:ring-2 focus:ring-[#003fb1]/15 transition-all"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex bg-[#f5f7ff] dark:bg-[#1a2844] rounded-xl p-1 border border-border gap-1">
          {[
            { v: 'all',      label: 'ທັງໝົດ' },
            { v: 'active',   label: 'ໃຊ້ງານ' },
            { v: 'inactive', label: 'ປິດໃຊ້' },
          ].map(o => (
            <button
              key={o.v}
              onClick={() => setFilterActive(o.v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterActive === o.v
                  ? 'bg-white dark:bg-[#1e2d4a] text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >{o.label}</button>
          ))}
        </div>

        {/* Add button */}
        {isAdmin && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#003fb1] to-[#7c3aed] text-white text-sm font-black shadow-sm hover:shadow-md transition-all whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings:"'FILL' 1"}}>add_circle</span>
            ເພີ່ມປະເພດ
          </button>
        )}
      </div>

      {/* ─── Type Cards Grid ─── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border animate-pulse h-44" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-card rounded-3xl border border-border">
          <span className="material-symbols-outlined text-5xl text-[#c3c5d7]">inbox</span>
          <p className="text-sm text-muted-foreground font-medium">
            {search ? 'ບໍ່ພົບຜົນການຄົ້ນຫາ' : 'ຍັງບໍ່ມີປະເພດຫວຍ'}
          </p>
          {isAdmin && !search && (
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#eff3ff] dark:bg-[#1e2d4a] text-primary text-sm font-bold hover:bg-[#dde6ff] transition-all">
              <span className="material-symbols-outlined text-[16px]">add</span>
              ເພີ່ມດຽວນີ້
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
