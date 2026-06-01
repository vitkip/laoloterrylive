import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API, resolveUploadUrl } from '../utils/api';
import ConfirmDialog from '../components/ConfirmDialog';

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
      <svg viewBox="0 0 36 36" style={{ width: size, height: size }} className="rounded-lg overflow-hidden">
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
        className="rounded-lg object-cover" />
    );
  }
  const icons = { star: '⭐', gift: '🎁', trophy: '🏆', custom: '🖼️' };
  return (
    <div style={{ width: size, height: size }}
      className="rounded-lg bg-white/10 flex items-center justify-center text-lg">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#003fb1]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#003fb1] text-[18px]">
                {isEdit ? 'edit' : 'add_circle'}
              </span>
            </div>
            <h2 className="text-base font-black text-foreground">
              {isEdit ? 'ແກ້ໄຂ Banner' : 'ເພີ່ມ Banner ໃໝ່'}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[18px] text-muted-foreground">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Label */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
              ຊື່ / ຂໍ້ຄວາມ
            </label>
            <input
              value={form.label}
              onChange={e => set('label', e.target.value)}
              placeholder="ເຊັ່ນ: Administrator, laolots.com"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/30 focus:border-[#003fb1]"
            />
          </div>

          {/* Ref Code */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
              ລະຫັດແນະນຳ
            </label>
            <input
              value={form.ref_code}
              onChange={e => set('ref_code', e.target.value)}
              placeholder="ເຊັ່ນ: LAO-000001"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/30 focus:border-[#003fb1]"
            />
          </div>

          {/* Logo Type */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
              ໂລໂກ້
            </label>
            <div className="grid grid-cols-2 gap-2">
              {LOGO_OPTIONS.map(o => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => set('logo_type', o.value)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    form.logo_type === o.value
                      ? 'border-[#003fb1] bg-[#003fb1]/10 text-[#003fb1]'
                      : 'border-border bg-secondary text-muted-foreground hover:border-[#003fb1]/40'
                  }`}
                >
                  <LogoPreview type={o.value} size={22} />
                  {o.label}
                </button>
              ))}
            </div>
            {/* Custom logo upload */}
            {form.logo_type === 'custom' && (
              <div className="mt-2 space-y-2">
                <label className="flex flex-col items-center justify-center gap-2 w-full h-24 rounded-xl border-2 border-dashed border-border bg-secondary hover:border-[#003fb1]/40 cursor-pointer transition-colors overflow-hidden relative">
                  {logoPreview ? (
                    <img src={logoPreview} alt="preview" className="w-full h-full object-contain" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[28px] text-muted-foreground">upload</span>
                      <span className="text-xs text-muted-foreground font-medium">ຄລິກເພື່ອເລືອກຮູບ (JPG, PNG, WebP ≤ 1MB)</span>
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
                    className="text-xs text-red-500 hover:text-red-400 font-bold"
                  >ລຶບຮູບ ×</button>
                )}
              </div>
            )}
          </div>

          {/* Sort Order + Active */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                ລຳດັບ
              </label>
              <input
                type="number"
                value={form.sort_order}
                onChange={e => set('sort_order', e.target.value)}
                min="0"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#003fb1]/30 focus:border-[#003fb1]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                ສະຖານະ
              </label>
              <button
                type="button"
                onClick={() => set('is_active', form.is_active ? 0 : 1)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                  form.is_active
                    ? 'border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'border-border bg-secondary text-muted-foreground'
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
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-bold text-muted-foreground hover:bg-secondary transition-colors"
            >
              ຍົກເລີກ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#003fb1] text-white text-sm font-bold hover:bg-[#1a56db] disabled:opacity-60 transition-colors"
            >
              {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {isEdit ? 'ບັນທຶກການແກ້ໄຂ' : 'ເພີ່ມ Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
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
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#003fb1] text-[22px]">view_carousel</span>
            <h1 className="text-xl font-black text-foreground">ຈັດການ Banner ເລື່ອນ</h1>
          </div>
          <p className="text-sm text-muted-foreground">ເພີ່ມ, ແກ້ໄຂ ຫຼື ລຶບ banner ທີ່ສະແດງຢູ່ໜ້າຫຼັກ</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="inline-flex items-center gap-2 bg-[#003fb1] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#1a56db] transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          ເພີ່ມ Banner
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-[#003fb1]/20 border-t-[#003fb1] animate-spin" />
          </div>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <span className="material-symbols-outlined text-[48px] opacity-30">view_carousel</span>
            <p className="text-sm font-bold">ຍັງບໍ່ມີ banner</p>
            <button
              onClick={() => setModal('create')}
              className="text-xs text-[#003fb1] font-bold hover:underline"
            >ເພີ່ມ banner ໃໝ່ →</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-5 py-3.5 text-[11px] font-black text-muted-foreground uppercase tracking-wider">ໂລໂກ້</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-black text-muted-foreground uppercase tracking-wider">ຊື່</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-black text-muted-foreground uppercase tracking-wider">ລະຫັດ</th>
                  <th className="text-center px-5 py-3.5 text-[11px] font-black text-muted-foreground uppercase tracking-wider">ລຳດັບ</th>
                  <th className="text-center px-5 py-3.5 text-[11px] font-black text-muted-foreground uppercase tracking-wider">ສະຖານະ</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-black text-muted-foreground uppercase tracking-wider">ຈັດການ</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((b, i) => (
                  <tr key={b.banner_id}
                    className={`border-b border-border/60 hover:bg-secondary/30 transition-colors ${i % 2 === 0 ? '' : 'bg-secondary/10'}`}
                  >
                    <td className="px-5 py-3.5">
                      <LogoPreview type={b.logo_type} size={32} logoUrl={resolveUploadUrl(b.logo_url)} />
                    </td>
                    <td className="px-5 py-3.5 font-bold text-foreground">{b.label}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-black text-[#6cf8bb] bg-[#6cf8bb]/10 border border-[#6cf8bb]/20 px-2 py-1 rounded-lg">
                        {b.ref_code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-muted-foreground font-mono text-xs">{b.sort_order}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                        Number(b.is_active)
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
                          : 'bg-secondary text-muted-foreground border-border'
                      }`}>
                        <span className="material-symbols-outlined text-[11px]">
                          {Number(b.is_active) ? 'visibility' : 'visibility_off'}
                        </span>
                        {Number(b.is_active) ? 'ເປີດ' : 'ປິດ'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModal(b)}
                          className="w-8 h-8 rounded-lg border border-border bg-secondary hover:bg-[#003fb1]/10 hover:border-[#003fb1]/40 flex items-center justify-center transition-colors"
                          title="ແກ້ໄຂ"
                        >
                          <span className="material-symbols-outlined text-[15px] text-muted-foreground">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(b)}
                          className="w-8 h-8 rounded-lg border border-border bg-secondary hover:bg-red-500/10 hover:border-red-500/40 flex items-center justify-center transition-colors"
                          title="ລຶບ"
                        >
                          <span className="material-symbols-outlined text-[15px] text-muted-foreground">delete</span>
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
        message={`ຕ້ອງການລຶບ banner "${deleteTarget?.label}" ອອກ? ບໍ່ສາມາດກູ້ຄືນໄດ້.`}
        confirmLabel="ລຶບ"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
