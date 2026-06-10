import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API, resolveUploadUrl } from '../utils/api';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';

// ── Logo options ──────────────────────────────────────────────────
const LOGO_OPTIONS = [
  { value: 'lao_flag', label: 'ທຸງຊາດລາວ' },
  { value: 'star',     label: 'ດາວ ⭐'      },
  { value: 'gift',     label: 'ຂອງຂວັນ 🎁'   },
  { value: 'trophy',   label: 'ຖ້ວຍ 🏆'      },
  { value: 'custom',   label: 'ອັບໂຫລດ 🖼️'   },
];

function LogoPreview({ type, size = 32, logoUrl = null }) {
  if (type === 'lao_flag') {
    return (
      <svg viewBox="0 0 36 36" style={{ width: size, height: size }} className="rounded-lg overflow-hidden shrink-0">
        <rect x="0" y="0"  width="36" height="9"  fill="#CE1126"/>
        <rect x="0" y="9"  width="36" height="18" fill="#002868"/>
        <rect x="0" y="27" width="36" height="9"  fill="#CE1126"/>
        <circle cx="18" cy="18" r="6" fill="white"/>
      </svg>
    );
  }
  if (type === 'custom' && logoUrl) {
    return (
      <img src={logoUrl} alt="logo" style={{ width: size, height: size }}
        className="rounded-lg object-cover shrink-0" />
    );
  }
  const icons = { star: '⭐', gift: '🎁', trophy: '🏆', custom: '🖼️' };
  return (
    <div style={{ width: size, height: size }}
      className="rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-sm shadow-sm select-none shrink-0">
      {icons[type] || '?'}
    </div>
  );
}

// ── Banner Form Modal ─────────────────────────────────────────────
function BannerFormModal({ item, onClose, onSaved, authFetch }) {
  const isEdit = !!item?.banner_id;
  const [form, setForm] = useState({
    label:      item?.label      ?? '',
    ref_code:   item?.ref_code   ?? '',
    logo_type:  item?.logo_type  ?? 'lao_flag',
    logo_url:   item?.logo_url   ?? '',
    sort_order: item?.sort_order ?? 0,
    is_active:  item?.is_active  ?? 1,
  });
  const [logoFile, setLogoFile]         = useState(null);
  const [logoPreview, setLogoPreview]   = useState(
    item?.logo_type === 'custom' ? resolveUploadUrl(item?.logo_url) : null
  );
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label.trim())    { toast.error('ກະລຸນາໃສ່ຊື່ banner'); return; }
    if (!form.ref_code.trim()) { toast.error('ກະລຸນາໃສ່ລະຫັດແນະນຳ'); return; }
    if (form.logo_type === 'custom' && !form.logo_url && !logoFile) {
      toast.error('ກະລຸນາອັບໂຫລດຮູບ logo'); return;
    }
    setSaving(true);

    let finalLogoUrl = form.logo_url;
    if (form.logo_type === 'custom' && logoFile) {
      const fd = new FormData();
      fd.append('logo', logoFile);
      const { ok: uok, data: udata } = await authFetch(
        `${API}/index.php?action=upload_banner_logo`,
        { method: 'POST', body: fd }
      );
      if (!uok) {
        toast.error(udata?.error || 'ອັບໂຫລດຮູບບໍ່ສຳເລັດ');
        setSaving(false);
        return;
      }
      finalLogoUrl = udata.logo_url;
    }

    const action = isEdit ? 'update_banner' : 'create_banner';
    const body   = isEdit ? { ...form, banner_id: item.banner_id, logo_url: finalLogoUrl } : { ...form, logo_url: finalLogoUrl };
    const { ok, data } = await authFetch(`${API}/index.php?action=${action}`, {
      method: 'POST',
      body:   JSON.stringify({ ...body, sort_order: Number(body.sort_order), is_active: Number(body.is_active) }),
    });
    setSaving(false);
    if (ok) {
      toast.success(isEdit ? 'ແກ້ໄຂ banner ສຳເລັດ' : 'ເພີ່ມ banner ສຳເລັດ');
      onSaved();
    } else {
      toast.error(data?.error || 'ເກີດຂໍ້ຜິດພາດ');
    }
  };

  return (
    <Modal open={true} onClose={onClose} title={isEdit ? 'ແກ້ໄຂ Banner' : 'ເພີ່ມ Banner ໃໝ່'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-left select-none">
        {/* Label */}
        <div>
          <label className="text-[10px] font-black text-white/35 uppercase tracking-widest mb-1.5 block">
            ຊື່ / ຂໍ້ຄວາມ
          </label>
          <input
            value={form.label}
            onChange={e => set('label', e.target.value)}
            placeholder="ເຊັ່ນ: Administrator, laolots.com"
            className="w-full bg-black/45 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/35 focus:border-[#d4af37]/45 transition-all duration-200"
          />
        </div>

        {/* Ref Code */}
        <div>
          <label className="text-[10px] font-black text-white/35 uppercase tracking-widest mb-1.5 block">
            ລະຫັດແນະນຳ
          </label>
          <input
            value={form.ref_code}
            onChange={e => set('ref_code', e.target.value)}
            placeholder="ເຊັ່ນ: LAO-000001"
            className="w-full bg-black/45 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs font-mono font-black text-[#d4af37] placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/35 focus:border-[#d4af37]/45 transition-all duration-200"
          />
        </div>

        {/* Logo Type */}
        <div>
          <label className="text-[10px] font-black text-white/35 uppercase tracking-widest mb-1.5 block">
            ໂລໂກ້
          </label>
          <div className="grid grid-cols-2 gap-2">
            {LOGO_OPTIONS.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => set('logo_type', o.value)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                  form.logo_type === o.value
                    ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37] scale-[1.01] shadow-sm shadow-[#d4af37]/5'
                    : 'border-white/[0.05] bg-black/25 text-white/55 hover:border-[#d4af37]/20 hover:bg-black/35'
                }`}
              >
                <LogoPreview type={o.value} size={22} logoUrl={logoPreview} />
                {o.label}
              </button>
            ))}
          </div>
          {/* Custom logo upload */}
          {form.logo_type === 'custom' && (
            <div className="mt-2 space-y-2">
              <label className="flex flex-col items-center justify-center gap-2 w-full h-24 rounded-xl border border-dashed border-white/[0.12] bg-black/25 hover:border-[#d4af37]/40 cursor-pointer transition-colors overflow-hidden relative">
                {logoPreview ? (
                  <img src={logoPreview} alt="preview" className="w-full h-full object-contain" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[28px] text-white/30">upload</span>
                    <span className="text-[10px] text-white/40 font-bold">ຄລິກເພື່ອເລືອກຮູບ (JPG, PNG, WebP ≤ 1MB)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
              {logoPreview && (
                <button
                  type="button"
                  onClick={() => { setLogoFile(null); setLogoPreview(null); set('logo_url', ''); }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-black"
                >ລຶບຮູບ ×</button>
              )}
            </div>
          )}
        </div>

        {/* Sort Order + Active */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black text-white/35 uppercase tracking-widest mb-1.5 block">
              ລຳດັບ
            </label>
            <input
              type="number"
              value={form.sort_order}
              onChange={e => set('sort_order', e.target.value)}
              min="0"
              className="w-full bg-black/45 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#d4af37]/35 focus:border-[#d4af37]/45 transition-all duration-200"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-white/35 uppercase tracking-widest mb-1.5 block">
              ສະຖານະ
            </label>
            <button
              type="button"
              onClick={() => set('is_active', form.is_active ? 0 : 1)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                form.is_active
                  ? 'border-[#d4af37]/35 bg-[#d4af37]/10 text-[#d4af37]'
                  : 'border-white/[0.06] bg-black/25 text-white/35'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {form.is_active ? 'visibility' : 'visibility_off'}
              </span>
              {form.is_active ? 'ເປີດໃຊ້' : 'ປິດໃຊ້'}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-white/65 hover:text-white font-black rounded-xl transition-colors text-xs cursor-pointer"
          >
            ຍົກເລີກ
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 bg-[#d4af37] text-black font-black rounded-xl hover:bg-[#d4af37]/90 transition-all text-xs disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/10 cursor-pointer"
          >
            {saving && <span className="w-4 h-4 border-2 border-black/35 border-t-black rounded-full animate-spin" />}
            {isEdit ? 'ບັນທຶກການແກ້ໄຂ' : 'ເພີ່ມ Banner'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function AdminBanners() {
  const { authFetch } = useAuth();
  const [banners, setBanners]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // null | 'create' | item
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/index.php?action=get_banners`);
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : []);
    } catch {
      toast.error('ໂຫຼດຂໍ້ມູນ banner ບໍ່ສຳເລັດ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { ok, data } = await authFetch(`${API}/index.php?action=delete_banner`, {
      method: 'POST',
      body:   JSON.stringify({ banner_id: deleteTarget.banner_id }),
    });
    setDeleting(false);
    setDeleteTarget(null);
    if (ok) {
      toast.success('ລຶບ banner ສຳເລັດ');
      load();
    } else {
      toast.error(data?.error || 'ລຶບ banner ບໍ່ສຳເລັດ');
    }
  };

  return (
    <div className="space-y-6 text-left select-none">
      {/* Header Banner */}
      <div className="bg-[#0e1124]/75 backdrop-blur-md rounded-2xl border border-white/[0.05] p-6 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37]/45 to-transparent" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#d4af37] text-[22px]">view_carousel</span>
              <h1 className="text-base font-black text-white font-headline">ຈັດການ Banner ເລື່ອນ</h1>
            </div>
            <p className="text-[10px] text-white/45 font-bold tracking-wide uppercase mt-0.5">ເພີ່ມ, ແກ້ໄຂ ຫຼື ລຶບ banner ທີ່ສະແດງຢູ່ໜ້າຫຼັກ</p>
          </div>
          <button
            onClick={() => setModal('create')}
            className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-black px-5 py-2.5 rounded-xl font-black text-[11px] shadow-lg shadow-[#d4af37]/10 transition-all active:scale-95 cursor-pointer shrink-0 uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            ເພີ່ມ Banner
          </button>
        </div>
      </div>

      {/* Table grid layout container */}
      <div className="bg-[#0e1124]/75 backdrop-blur-md border border-white/[0.05] shadow-lg rounded-2xl overflow-hidden relative group">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
        {loading ? (
          <div className="flex items-center justify-center py-16 relative z-10">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#d4af37] animate-spin" />
          </div>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/35 relative z-10">
            <span className="material-symbols-outlined text-[48px] opacity-30">view_carousel</span>
            <p className="text-xs font-black uppercase tracking-wider">ຍັງບໍ່ມີ banner</p>
            <button
              onClick={() => setModal('create')}
              className="text-xs text-[#d4af37] font-black hover:underline"
            >ເພີ່ມ banner ໃໝ່ →</button>
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.01]">
                  <th className="text-left px-6 py-3.5 text-[9px] font-black tracking-widest text-white/30 uppercase">ໂລໂກ້</th>
                  <th className="text-left px-5 py-3.5 text-[9px] font-black tracking-widest text-white/30 uppercase">ຊື່</th>
                  <th className="text-left px-5 py-3.5 text-[9px] font-black tracking-widest text-white/30 uppercase">ລະຫັດ</th>
                  <th className="text-center px-5 py-3.5 text-[9px] font-black tracking-widest text-white/30 uppercase">ລຳດັບ</th>
                  <th className="text-center px-5 py-3.5 text-[9px] font-black tracking-widest text-white/30 uppercase">ສະຖານະ</th>
                  <th className="text-right px-6 py-3.5 text-[9px] font-black tracking-widest text-white/30 uppercase">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {banners.map((b) => (
                  <tr key={b.banner_id}
                    className="hover:bg-white/[0.02] border-b border-white/[0.03] transition-all duration-200 cursor-pointer group"
                    onClick={() => setModal(b)}
                  >
                    <td className="px-6 py-3.5">
                      <LogoPreview type={b.logo_type} size={32} logoUrl={resolveUploadUrl(b.logo_url)} />
                    </td>
                    <td className="px-5 py-3.5 font-bold text-xs text-white">{b.label}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-black text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/20 px-2.5 py-1 rounded-lg">
                        {b.ref_code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-white/45 font-mono text-xs">{b.sort_order}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                        Number(b.is_active)
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-white/[0.02] text-white/35 border-white/[0.06]'
                      }`}>
                        <span className="material-symbols-outlined text-[12px]">
                          {Number(b.is_active) ? 'visibility' : 'visibility_off'}
                        </span>
                        {Number(b.is_active) ? 'ເປີດ' : 'ປິດ'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setModal(b)}
                          className="w-8 h-8 rounded-lg border border-white/[0.05] bg-black/20 hover:bg-[#d4af37]/10 hover:border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center transition-colors cursor-pointer"
                          title="ແກ້ໄຂ"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(b)}
                          className="w-8 h-8 rounded-lg border border-white/[0.05] bg-black/20 hover:bg-rose-500/10 hover:border-rose-500/40 text-rose-450 flex items-center justify-center transition-colors cursor-pointer"
                          title="ລຶບ"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {(modal === 'create' || (modal && modal !== 'create')) && (
        <BannerFormModal
          item={modal === 'create' ? null : modal}
          authFetch={authFetch}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="ລຶບ Banner"
        message={`ต้องการลຶບ banner "${deleteTarget?.label}" ອອກ? ບໍ່ສາມາດກູ້ຄືນໄດ້.`}
        confirmLabel="ລຶບ"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
