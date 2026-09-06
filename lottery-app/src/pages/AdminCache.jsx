import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { API } from '../utils/api';
import {
  clearBrowserCaches,
  clearBrowserStorage,
  formatAge,
  formatBytes,
  getDataCacheStats,
  listStorageEntries,
} from '../utils/cache';
import SEO from '../components/SEO';

// ──────────────────────────────────────────────────────────────────
// ── Shared primitives
// ──────────────────────────────────────────────────────────────────

function Card({ title, subtitle, accent = 'rgba(212,175,55,0.4)', children }) {
  return (
    <div className="bg-[#0e1124]/75 backdrop-blur-md rounded-2xl border border-white/[0.05] shadow-lg p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2.5px]"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      <div className="mb-5 relative z-10">
        <h3 className="text-sm font-black text-white leading-snug tracking-wide">{title}</h3>
        {subtitle && <p className="text-[9px] font-bold text-white/35 mt-0.5 tracking-widest uppercase">{subtitle}</p>}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-white/[0.05] last:border-0">
      <p className="text-xs font-bold text-white/55">{label}</p>
      <p className={`text-xs font-black text-white text-right ${mono ? 'tabular-nums font-space' : ''}`}>{value}</p>
    </div>
  );
}

function ActionButton({ icon, label, hint, tone = 'gold', busy, disabled, onClick }) {
  const tones = {
    gold:  'bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 border-[#d4af37]/25',
    blue:  'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/25',
    rose:  'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/25',
    slate: 'bg-white/[0.03] text-white/60 hover:bg-white/[0.07] border-white/10',
  };
  return (
    <button
      onClick={onClick}
      disabled={busy || disabled}
      className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-xl border text-left transition-all duration-300 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer ${tones[tone]}`}
    >
      <span className={`material-symbols-outlined text-[19px] shrink-0 mt-0.5 ${busy ? 'animate-spin' : ''}`}>
        {busy ? 'progress_activity' : icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[11.5px] font-black uppercase tracking-wider leading-snug">{label}</span>
        {hint && <span className="block text-[10.5px] font-bold text-white/35 mt-1 leading-relaxed normal-case tracking-normal">{hint}</span>}
      </span>
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────
// ── Main component
// ──────────────────────────────────────────────────────────────────

const SCOPE_LABELS = {
  client:  'Cache ຜູ້ໃຊ້ທັງໝົດ',
  opcache: 'PHP OPcache',
  logs:    'Log ເກົ່າ',
  expired: 'Token ໝົດອາຍຸ',
};

export default function AdminCache() {
  const { token, authFetch } = useAuth();
  const { clearCache } = useData();

  const [info, setInfo]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [busy, setBusy]         = useState(null);   // ຊື່ປຸ່ມທີ່ກຳລັງເຮັດວຽກ
  const [local, setLocal]       = useState(() => getDataCacheStats());
  const [entries, setEntries]   = useState(() => listStorageEntries());
  const [lastResult, setResult] = useState(null);

  const refreshLocal = useCallback(() => {
    setLocal(getDataCacheStats());
    setEntries(listStorageEntries());
  }, []);

  const loadInfo = useCallback(async () => {
    if (!token) return;
    try {
      const { ok, data } = await authFetch(`${API}/index.php?action=cache_info`);
      if (ok) setInfo(data);
      else toast.error(data?.error || 'ໂຫຼດຂໍ້ມູນ cache ບໍ່ໄດ້');
    } catch {
      toast.error('ເຊື່ອມຕໍ່ server ບໍ່ໄດ້');
    } finally {
      setLoading(false);
    }
  }, [token, authFetch]);

  useEffect(() => { loadInfo(); }, [loadInfo]);

  // ຂະໜາດ localStorage ປ່ຽນຕະຫຼອດ (DataContext ຂຽນທຸກ 60 ວິ) — ຟື້ນຟູທຸກ 5 ວິ
  useEffect(() => {
    const id = setInterval(refreshLocal, 5000);
    return () => clearInterval(id);
  }, [refreshLocal]);

  // ── ຝັ່ງ browser ເຄື່ອງນີ້ ──────────────────────────────────────

  const handleClearData = async () => {
    setBusy('data');
    try {
      await clearCache();
      refreshLocal();
      toast.success('ລ້າງ cache ຂໍ້ມູນຫວຍ ແລະ ດຶງຂໍ້ມູນໃໝ່ແລ້ວ');
    } finally {
      setBusy(null);
    }
  };

  const handleClearStorage = async () => {
    if (!window.confirm('ລ້າງ storage ທັງໝົດຂອງ browser ນີ້? (ຍັງ login ຢູ່ຄືເກົ່າ)')) return;
    setBusy('storage');
    try {
      const removed = clearBrowserStorage({ keepAuth: true });
      const { caches: c, workers: w } = await clearBrowserCaches();
      await clearCache();
      refreshLocal();
      toast.success(`ລົບ ${removed} key · ${c} cache · ${w} service worker`);
    } finally {
      setBusy(null);
    }
  };

  const handleHardReload = () => {
    clearBrowserStorage({ keepAuth: true });
    window.location.reload();
  };

  // ── ຝັ່ງ server ────────────────────────────────────────────────

  const runServerClear = async (scopes, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusy(scopes.join('+'));
    try {
      const { ok, data } = await authFetch(`${API}/index.php?action=clear_cache`, {
        method: 'POST',
        body: JSON.stringify({ scopes }),
      });
      if (!ok) {
        toast.error(data?.error || 'ລ້າງ cache ບໍ່ສຳເລັດ');
        return;
      }
      setResult({ ...data, at: new Date() });
      // ເຄື່ອງນີ້ກໍ່ຕ້ອງຖິ້ມ cache ຕົນເອງໃນທັນທີ ບໍ່ຕ້ອງລໍຮອບ poll
      if (scopes.includes('client')) await clearCache();
      refreshLocal();
      await loadInfo();
      toast.success(`ລ້າງແລ້ວ: ${scopes.map(s => SCOPE_LABELS[s] || s).join(' · ')}`);
    } catch {
      toast.error('ເຊື່ອມຕໍ່ server ບໍ່ໄດ້');
    } finally {
      setBusy(null);
    }
  };

  const purgeable = info?.purgeable ?? {};
  const purgeableLogs = (purgeable.visitor_stats ?? 0) + (purgeable.user_logs ?? 0);
  const purgeableAuth = (purgeable.otp_codes ?? 0) + (purgeable.refresh_tokens ?? 0)
    + (purgeable.password_resets ?? 0) + (purgeable.email_verifications ?? 0);
  const totalStorage = entries.reduce((sum, e) => sum + e.bytes, 0);

  return (
    <div className="space-y-7 text-left select-none">
      <SEO title="ຈັດການ Cache" description="" noIndex />

      {/* ─── Page header ─── */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-white/[0.06] bg-gradient-to-br from-[#0c1020] via-[#090b16] to-[#04060e] p-6 sm:p-8">
        <div className="absolute -top-[50%] -right-[30%] w-[80%] h-[80%] rounded-full blur-3xl opacity-[0.25]"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)' }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
              ຈັດການ <span className="bg-gradient-to-r from-[#d4af37] via-yellow-200 to-[#f59e0b] bg-clip-text text-transparent">Cache</span>
            </h1>
            <p className="text-[11px] font-bold text-white/35 mt-1.5 leading-relaxed">
              ລ້າງຂໍ້ມູນທີ່ browser ແລະ server ເກັບໄວ້ ເມື່ອຂໍ້ມູນທີ່ເຫັນບໍ່ຕົງກັບຂໍ້ມູນຈິງ
            </p>
          </div>
          <button
            onClick={() => { refreshLocal(); loadInfo(); }}
            className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-full border border-white/10 transition-all duration-300 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span>
            ໂຫຼດສະຖານະໃໝ່
          </button>
        </div>
      </div>

      {/* ─── ສະຖານະ ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Cache ໃນເຄື່ອງນີ້" subtitle="Browser localStorage">
          <div className="space-y-0">
            <Row label="ຂໍ້ມູນຫວຍທີ່ເກັບໄວ້" value={local.exists ? formatBytes(local.bytes) : 'ບໍ່ມີ'} mono />
            <Row label="ອັບເດດຫຼ້າສຸດ" value={formatAge(local.ageMs)} />
            <Row label="ງວດ · ນາມສັດ · ປະເພດ"
              value={local.exists ? `${local.counts.draws} · ${local.counts.animals} · ${local.counts.types}` : '—'} mono />
            <Row label="ເວີຊັນ cache ໃນເຄື່ອງ" value={local.version || '—'} mono />
            <Row label="storage ທັງໝົດ" value={`${entries.length} key · ${formatBytes(totalStorage)}`} mono />
          </div>
        </Card>

        <Card title="Cache ຝັ່ງ Server" subtitle="Server state" accent="rgba(59,130,246,0.4)">
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-7 bg-white/[0.02] border border-white/[0.04] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-0">
              <Row label="ເວີຊັນ cache ປັດຈຸບັນ" value={info?.cache_version || '0'} mono />
              <Row label="ລ້າງລ່າສຸດ" value={info?.cache_cleared_at || 'ຍັງບໍ່ເຄີຍລ້າງ'} mono />
              <Row label="ຜູ້ລ້າງ" value={info?.cache_cleared_by || '—'} />
              <Row
                label="PHP OPcache"
                value={info?.opcache?.enabled
                  ? `${info.opcache.cached_scripts} script · ${info.opcache.memory_used_mb} MB · hit ${info.opcache.hit_rate}%`
                  : 'ປິດຢູ່'}
                mono
              />
              <Row label="ອາຍຸ cache HTTP (draws · animals · types)"
                value={info ? `${info.http_cache.draws}s · ${info.http_cache.animals}s · ${info.http_cache.types}s` : '—'} mono />
            </div>
          )}
        </Card>
      </div>

      {/* ─── ປຸ່ມລ້າງ ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="ລ້າງໃນເຄື່ອງນີ້" subtitle="This browser only">
          <div className="space-y-3">
            <ActionButton
              icon="cached"
              tone="gold"
              label="ລ້າງ cache ຂໍ້ມູນຫວຍ"
              hint="ຖິ້ມຂໍ້ມູນ animals/draws/types ທີ່ເກັບໄວ້ ແລ້ວດຶງໃໝ່ຈາກ server ທັນທີ"
              busy={busy === 'data'}
              onClick={handleClearData}
            />
            <ActionButton
              icon="delete_sweep"
              tone="slate"
              label="ລ້າງ storage ທັງໝົດ"
              hint="ລ້າງ localStorage · sessionStorage · Cache Storage ແລະ ຖອນ service worker (ຍັງ login ຢູ່)"
              busy={busy === 'storage'}
              onClick={handleClearStorage}
            />
            <ActionButton
              icon="restart_alt"
              tone="slate"
              label="ລ້າງ ແລະ ໂຫຼດໜ້າໃໝ່"
              hint="ລ້າງ storage ແລ້ວ reload ໜ້າເວັບໃນທັນທີ"
              onClick={handleHardReload}
            />
          </div>
        </Card>

        <Card title="ລ້າງທັງລະບົບ" subtitle="All users · server" accent="rgba(244,63,94,0.4)">
          <div className="space-y-3">
            <ActionButton
              icon="public"
              tone="blue"
              label="ລ້າງ cache ຜູ້ໃຊ້ທັງໝົດ"
              hint="ບັມເວີຊັນຢູ່ server — ທຸກ browser ຈະຖິ້ມ cache ຂອງຕົນເອງພາຍໃນ 1 ນາທີ"
              busy={busy === 'client'}
              onClick={() => runServerClear(['client'], 'ລ້າງ cache ຂອງຜູ້ໃຊ້ທຸກຄົນ? ທຸກເຄື່ອງຈະດຶງຂໍ້ມູນໃໝ່ໝົດ.')}
            />
            <ActionButton
              icon="memory"
              tone="blue"
              label="ລ້າງ PHP OPcache"
              hint={info?.opcache?.enabled
                ? 'ຖິ້ມ bytecode ທີ່ compile ໄວ້ — ໃຊ້ຫຼັງອັບໂຫຼດໂຄ້ດ PHP ໃໝ່'
                : 'OPcache ປິດຢູ່ໃນ server ນີ້ — ບໍ່ຈຳເປັນຕ້ອງລ້າງ'}
              busy={busy === 'opcache'}
              disabled={!info?.opcache?.enabled}
              onClick={() => runServerClear(['opcache'])}
            />
            <ActionButton
              icon="database"
              tone="rose"
              label={`ລ້າງ log ເກົ່າ (${purgeableLogs.toLocaleString()} ແຖວ)`}
              hint="ລົບ visitor_stats > 90 ວັນ ແລະ user_logs > 365 ວັນ"
              busy={busy === 'logs'}
              disabled={purgeableLogs === 0}
              onClick={() => runServerClear(['logs'], `ລົບ ${purgeableLogs.toLocaleString()} ແຖວ log ເກົ່າ? ບໍ່ສາມາດກູ້ຄືນໄດ້.`)}
            />
            <ActionButton
              icon="key_off"
              tone="rose"
              label={`ລ້າງ token ໝົດອາຍຸ (${purgeableAuth.toLocaleString()} ແຖວ)`}
              hint="ລົບ OTP · refresh token · ລິ້ງ reset password ທີ່ໝົດອາຍຸແລ້ວ"
              busy={busy === 'expired'}
              disabled={purgeableAuth === 0}
              onClick={() => runServerClear(['expired'], `ລົບ ${purgeableAuth.toLocaleString()} ແຖວທີ່ໝົດອາຍຸ? ບໍ່ສາມາດກູ້ຄືນໄດ້.`)}
            />
          </div>
        </Card>
      </div>

      {/* ─── ຜົນລັບຄັ້ງລ່າສຸດ ─── */}
      {lastResult && (
        <Card title="ຜົນການລ້າງຄັ້ງລ່າສຸດ" subtitle={lastResult.at.toLocaleString('lo-LA')} accent="rgba(16,185,129,0.4)">
          <div className="flex flex-wrap gap-2">
            {Object.entries(lastResult)
              .filter(([k]) => !['success', 'scopes', 'at'].includes(k))
              .map(([k, v]) => (
                <span key={k} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10.5px] font-bold text-emerald-300">
                  <span className="text-emerald-400/50">{k}</span>
                  <span className="font-black tabular-nums">{String(v)}</span>
                </span>
              ))}
          </div>
        </Card>
      )}

      {/* ─── ລາຍການ key ─── */}
      <Card title="ຂໍ້ມູນທີ່ເກັບໄວ້ໃນ browser" subtitle="localStorage keys">
        {entries.length === 0 ? (
          <p className="text-[11px] font-bold text-white/35">ບໍ່ມີຂໍ້ມູນເກັບໄວ້</p>
        ) : (
          <div className="space-y-1.5">
            {entries.map(e => (
              <div key={e.key} className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="min-w-0">
                  <p className="text-[11.5px] font-bold text-white/75 truncate">{e.label}</p>
                  <p className="text-[9.5px] font-bold text-white/25 font-space truncate">{e.key}</p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  {e.preserved && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#d4af37]/10 text-[#d4af37]/70 border border-[#d4af37]/20">
                      ຮັກສາໄວ້
                    </span>
                  )}
                  <span className="text-[11px] font-black text-white tabular-nums">{formatBytes(e.bytes)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
