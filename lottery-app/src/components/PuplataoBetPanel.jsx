import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Coins, Loader2, LogIn, Wallet, Check, AlertCircle, RefreshCw, Sparkles, ArrowRight } from 'lucide-react'

// ເງິນເດີມພັນມາດຕະຖານ — ອີງໃສ່ໃບເງິນກີບຈິງ ຈຶ່ງອ່ານແລ້ວຄິດຕາມໄດ້ທັນທີ
const CHIPS = [100000, 200000, 300000]

const SYM_COLOR = {
  1: '#22c55e', 2: '#f97316', 3: '#3b82f6', 4: '#ec4899', 5: '#eab308', 6: '#ef4444',
}

const WIN_GREEN = '#16a34a'
const DANGER    = '#dc2626'

const fmt = (n) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })

const EYEBROW = 'text-[10px] font-black uppercase tracking-[0.12em] text-[#64748b] dark:text-[#94a3b8]'

function Ball({ sym, size = 34 }) {
  if (!sym) return null
  const c = SYM_COLOR[sym.symbol_id] || '#64748b'
  return (
    <span className="inline-flex items-center justify-center rounded-xl shrink-0"
          style={{ width: size, height: size, background: c + '1f', border: `1.5px solid ${c}55` }}
          title={sym.name_lo}>
      <span style={{ fontSize: size * 0.5, lineHeight: 1 }}>{sym.emoji}</span>
    </span>
  )
}

/**
 * ແຜງວາງເດີມພັນ ຂອງໜ້າສູດຄູ່ລູກ — ເລືອກຄູ່ ເລືອກເງິນ ແລ້ວກົດແທງໄດ້ເລີຍ.
 * ໃຊ້ຮ່ວມກັນທັງ "ຄູ່ລູກ ງວດຖັດໄປ" (predict_pair) ແລະ "ຄູ່ລູກ ທີ່ຄວນຫຼີກ" (avoid_pair),
 * ແລະ ບັດ 7 ຄູ່ ໃນໜ້າສະຖິຕິ /puplatao.
 *
 * ໂຄງໜ້າຕາ = ໃບບິນຫວຍ: ເລືອກຄູ່ → ເລືອກເງິນ → ເສັ້ນຈຸດ → ຍອດທີ່ໄດ້ຄືນ → ປຸ່ມແທງ.
 * ຕົວເລກ "ໄດ້ຄືນ" ເປັນຈຸດເດັ່ນດຽວຂອງແຜງ — ສ່ວນອື່ນຈຶ່ງເກັບໄວ້ງຽບ.
 *
 * props.pairs  = [{ a, b, rank, score, prob, hint, isPick? }] ຮຽງອັນດັບ 1 → n
 *                (prob = ໂອກາດຊະນະຂອງບິນ · isPick = ຄູ່ທີ່ສູດເລືອກ ໝາຍດ້ວຍດາວ)
 * props.symOf  = map symbol_id → { symbol_id, name_lo, emoji }
 * props.title  = ຫົວແຜງ — ຕັ້ງເມື່ອໜ້າໜຶ່ງມີຫຼາຍແຜງ ຈະໄດ້ບໍ່ສັບສົນວ່າແຜງໃດຂອງບັດໃດ
 */
export default function PuplataoBetPanel({
  betting, betKind, accent, winLabel, pairs, symOf,
  title = 'ວາງເດີມພັນດ້ວຍເງິນ demo',
}) {
  const [rank, setRank]       = useState(1)
  const [stake, setStake]     = useState(CHIPS[0])
  const [placing, setPlacing] = useState(false)
  const [justBet, setJustBet] = useState(null)
  const okTimer = useRef(null)

  useEffect(() => () => clearTimeout(okTimer.current), [])

  // ຄູ່ຖືກຄິດໃໝ່ເມື່ອມີຜົນງວດໃໝ່ — ຖ້າອັນດັບທີ່ເລືອກໄວ້ຫາຍໄປ ໃຫ້ກັບໄປຄູ່ທີ 1
  useEffect(() => {
    if (pairs.length && !pairs.some(p => p.rank === rank)) setRank(pairs[0].rank)
  }, [pairs, rank])

  const rate = betting.rateOf(betKind)

  // ບໍ່ມີຄູ່ໃຫ້ແທງ — ໜ້ານັ້ນມີຂໍ້ຄວາມ "ຍັງບໍ່ມີຂໍ້ມູນ" ຂອງມັນເອງຢູ່ແລ້ວ
  if (!pairs.length) return null

  // ໂຫຼດອັດຕາຈ່າຍບໍ່ໄດ້ / ຍັງໂຫຼດຢູ່ / ປິດຮັບແທງ — ຕ້ອງບອກໃຫ້ຮູ້ ບໍ່ແມ່ນເຊື່ອງແຜງ
  if (betting.configError || !rate || !rate.is_active) {
    const state = betting.configError
      ? { Icon: AlertCircle, text: 'ໂຫຼດອັດຕາຈ່າຍບໍ່ໄດ້ — ກວດການເຊື່ອມຕໍ່ແລ້ວລອງໃໝ່', retry: true }
      : !rate
        ? { Icon: Loader2, text: 'ກຳລັງໂຫຼດອັດຕາຈ່າຍ…', spin: true }
        : { Icon: AlertCircle, text: 'ປິດຮັບແທງສູດນີ້ຊົ່ວຄາວ' }
    return (
      <div className="bg-white dark:bg-[#0c1426] border border-dashed rounded-2xl p-5 flex items-center gap-3"
           style={{ borderColor: accent + '55' }}>
        <state.Icon size={16} className={state.spin ? 'animate-spin' : ''} style={{ color: accent }} />
        <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8]">{state.text}</span>
        {state.retry && (
          <button type="button" onClick={betting.reloadConfig}
                  className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-black cursor-pointer"
                  style={{ background: accent + '18', color: accent }}>
            <RefreshCw size={12} /> ລອງໃໝ່
          </button>
        )}
      </div>
    )
  }

  const pair      = pairs.find(p => p.rank === rank) || pairs[0]
  const balance   = betting.balance
  const potential = Math.round(stake * rate.multiplier)
  const profit    = potential - stake
  const tooPoor   = betting.isAuthed && balance !== null && stake > balance
  const belowMin  = stake < rate.min_stake
  const aboveMax  = stake > rate.max_stake
  // ບິນທີ່ລໍຜົນຢູ່ຂອງງວດນີ້ — ໃຊ້ໝາຍວ່າຄູ່ໃດແທງໄປແລ້ວ (ຍັງແທງຄູ່ອື່ນຕໍ່ໄດ້)
  const pendingBets = betting.pendingFor?.(betKind) || []
  const canBet    = betting.isAuthed && !tooPoor && !belowMin && !aboveMax && !placing

  // ເຫດຜົນທີ່ແທງບໍ່ໄດ້ — ບອກທາງແກ້ ບໍ່ແມ່ນພຽງແຕ່ບອກວ່າຜິດ
  const blocker = belowMin ? `ຂັ້ນຕ່ຳ ${fmt(rate.min_stake)} ກີບ`
    : aboveMax ? `ສູງສຸດ ${fmt(rate.max_stake)} ກີບ`
    : tooPoor  ? `ຄົງເຫຼືອ ${fmt(balance)} ກີບ — ຫຼຸດເງິນເດີມພັນລົງ`
    : null

  const submit = async () => {
    setPlacing(true)
    const ok = await betting.placeBet({
      betKind,
      symbolA: pair.a,
      symbolB: pair.b,
      stake,
      rank: pair.rank,
      score: pair.score,
      prob: pair.prob,
    })
    setPlacing(false)
    if (ok) {
      setJustBet({ rank: pair.rank, stake })
      clearTimeout(okTimer.current)
      okTimer.current = setTimeout(() => setJustBet(null), 4000)
    }
  }

  return (
    <div className="bg-white dark:bg-[#0c1426] border rounded-2xl overflow-hidden"
         style={{ borderColor: accent + '33' }}>

      {/* ── ຫົວບິນ: ສູດ · ອັດຕາຈ່າຍ · ງວດ · ຍອດເງິນ ── */}
      <div className="px-5 pt-5 pb-4" style={{ background: accent + '0a' }}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] flex items-start gap-2 min-w-0">
            <Coins size={15} className="shrink-0 mt-0.5" style={{ color: accent }} />
            <span className="min-w-0">{title}</span>
          </h3>
          <span className="shrink-0 text-[11px] font-black tabular-nums px-2.5 py-1 rounded-lg"
                style={{ background: accent + '1f', color: accent }}>
            ຈ່າຍ {rate.multiplier}×
          </span>
        </div>
        <div className="flex items-center gap-x-3 gap-y-1 flex-wrap mt-2 text-[11px] font-bold tabular-nums text-[#64748b] dark:text-[#94a3b8]">
          <span>ງວດ {betting.nextDrawNo ?? '—'}</span>
          {betting.isAuthed && (
            <span className="flex items-center gap-1">
              <Wallet size={11} /> ຄົງເຫຼືອ {balance === null ? '—' : fmt(balance)} ກີບ
            </span>
          )}
          {pendingBets.length > 0 && (
            <span className="flex items-center gap-1" style={{ color: WIN_GREEN }}>
              <Check size={11} /> ງວດນີ້ແທງແລ້ວ {pendingBets.length} ຄູ່
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">

        {/* ── 1. ເລືອກຄູ່ ── */}
        <div>
          <p className={`${EYEBROW} mb-2`}>1 · ເລືອກຄູ່ທີ່ຈະແທງ</p>
          {/* auto-fit: 3 ຄູ່ = 3 ຖັນ ຄືເກົ່າ · 7 ຄູ່ (ໜ້າສະຖິຕິ) = ຂະຫຍາຍ/ຕັດແຖວເອງ */}
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))' }}>
            {pairs.map(p => {
              const on = p.rank === rank
              // ຄູ່ນີ້ມີບິນລໍຜົນຢູ່ແລ້ວ — ບອກໄວ້ ແຕ່ຍັງກົດແທງເພີ່ມໄດ້
              const bet = pendingBets.find(
                b => b.symbol_a === Math.min(p.a, p.b) && b.symbol_b === Math.max(p.a, p.b),
              )
              return (
                <button
                  key={p.rank}
                  type="button"
                  onClick={() => setRank(p.rank)}
                  aria-pressed={on}
                  aria-label={`ຄູ່ທີ ${p.rank} — ${symOf[p.a]?.name_lo} ກັບ ${symOf[p.b]?.name_lo}`}
                  className="relative flex flex-col items-center gap-1.5 pt-3 pb-2.5 rounded-xl cursor-pointer transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={on
                    ? { background: accent + '1f', border: `1.5px solid ${accent}`, color: accent }
                    : { background: 'transparent', border: '1.5px solid #94a3b833', color: '#94a3b8' }}
                >
                  {bet && (
                    <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 rounded-full"
                          style={{ background: WIN_GREEN }}
                          title={`ງວດນີ້ແທງຄູ່ນີ້ໄປແລ້ວ ${fmt(bet.stake)} ກີບ`}>
                      <Check size={10} color="#fff" strokeWidth={3.5} />
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Ball sym={symOf[p.a]} size={28} />
                    <Ball sym={symOf[p.b]} size={28} />
                  </span>
                  <span className="flex items-center gap-0.5 text-[11px] font-black leading-none">
                    {p.isPick && <Sparkles size={10} />}ຄູ່ທີ {p.rank}
                  </span>
                  {p.prob != null && (
                    <span className="text-[10px] font-bold tabular-nums leading-none opacity-80">
                      {Math.round(p.prob * 100)}%
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── ຄູ່ທີ່ເລືອກ ── */}
        <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: accent + '0f' }}>
          <span className="flex items-center gap-1 shrink-0">
            <Ball sym={symOf[pair.a]} />
            <Ball sym={symOf[pair.b]} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-black text-[#0f172a] dark:text-[#f1f5f9] truncate leading-tight">
              {symOf[pair.a]?.name_lo} + {symOf[pair.b]?.name_lo}
            </p>
            <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-0.5">
              ຊະນະເມື່ອ <b style={{ color: accent }}>{winLabel}</b>
              {pair.prob != null && <> · ໂອກາດ ≈ {Math.round(pair.prob * 100)}%</>}
            </p>
            {pair.hint && <p className="text-[10px] text-[#94a3b8] tabular-nums mt-0.5 truncate" title={pair.hint}>{pair.hint}</p>}
          </div>
        </div>

        {/* ── 2. ຈຳນວນເງິນ ── */}
        <div>
          <p className={`${EYEBROW} mb-2`}>2 · ເງິນເດີມພັນ (ກີບ)</p>
          <div className="grid grid-cols-3 gap-2">
            {CHIPS.map(c => {
              const on = stake === c
              return (
                <button key={c} type="button" onClick={() => setStake(c)}
                        aria-pressed={on}
                        className="py-3 rounded-xl text-[17px] font-black tabular-nums leading-none cursor-pointer transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={on
                          ? { background: accent, color: '#fff', border: `1.5px solid ${accent}` }
                          : { background: accent + '10', color: accent, border: `1.5px solid ${accent}2e` }}>
                  {fmt(c)}
                </button>
              )
            })}
          </div>

          <label className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl bg-[#f8fafc] dark:bg-white/5 border border-[#e8edf8] dark:border-white/10 focus-within:border-current"
                 style={{ color: accent }}>
            <span className="text-[11px] font-bold text-[#94a3b8] shrink-0">ຈຳນວນອື່ນ</span>
            <input
              type="number"
              inputMode="numeric"
              value={stake}
              min={rate.min_stake}
              max={rate.max_stake}
              step={10000}
              onChange={e => setStake(Math.max(0, Number(e.target.value) || 0))}
              aria-label="ຈຳນວນເງິນເດີມພັນ (ກີບ)"
              className="flex-1 min-w-0 bg-transparent text-sm font-black tabular-nums text-right outline-none"
              style={{ color: accent }}
            />
            <span className="text-[11px] font-bold text-[#94a3b8] shrink-0">ກີບ</span>
          </label>
          <p className="text-[10px] tabular-nums text-[#64748b] dark:text-[#94a3b8] mt-1.5">
            ຂັ້ນຕ່ຳ {fmt(rate.min_stake)} · ສູງສຸດ {fmt(rate.max_stake)} ກີບ
          </p>
        </div>

        {/* ── ເສັ້ນສີກບິນ → ຍອດທີ່ໄດ້ຄືນ ── */}
        <div className="pt-4 border-t border-dashed" style={{ borderColor: accent + '55' }}>
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div>
              <p className={EYEBROW}>ຖືກແລ້ວໄດ້ຄືນ</p>
              <p className="font-black tabular-nums leading-none mt-1" style={{ color: accent, fontSize: 30 }}>
                {fmt(potential)}
                <span className="text-sm ml-1">ກີບ</span>
              </p>
            </div>
            <div className="text-right text-[11px] font-bold tabular-nums">
              <p className="text-[#64748b] dark:text-[#94a3b8]">ເດີມພັນ {fmt(stake)} ກີບ</p>
              <p style={{ color: WIN_GREEN }}>ກຳໄລ +{fmt(profit)} ກີບ</p>
            </div>
          </div>
        </div>

        {/* ── 3. ແທງ ── */}
        {betting.isAuthed ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={submit}
              disabled={!canBet}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 transition-opacity motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ background: accent, color: '#fff' }}
            >
              {placing
                ? <><Loader2 size={15} className="animate-spin" /> ກຳລັງສົ່ງ…</>
                : <>ວາງເດີມພັນ ຄູ່ທີ {pair.rank} · {fmt(stake)} ກີບ <ArrowRight size={15} /></>}
            </button>

            {blocker ? (
              <p className="flex items-center gap-1.5 text-[11px] font-bold tabular-nums" style={{ color: DANGER }}>
                <AlertCircle size={12} /> {blocker}
              </p>
            ) : (
              <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] tabular-nums">
                <span className="text-[#94a3b8]">
                  {balance === null ? '' : `ຫຼັງແທງຄົງເຫຼືອ ${fmt(balance - stake)} ກີບ`}
                </span>
                <Link to="/puplatao/bets" className="flex items-center gap-1 font-bold hover:underline" style={{ color: accent }}>
                  <Wallet size={12} /> ເບິ່ງກຳໄລ-ຂາດທຶນສະສົມ
                </Link>
              </div>
            )}

            {justBet && (
              <p className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold tabular-nums"
                 style={{ background: WIN_GREEN + '14', color: WIN_GREEN }}>
                <Check size={13} /> ຮັບແທງ ຄູ່ທີ {justBet.rank} · {fmt(justBet.stake)} ກີບ ແລ້ວ — ແທງຄູ່ອື່ນຕໍ່ໄດ້
              </p>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black transition-opacity motion-reduce:transition-none hover:opacity-85"
            style={{ background: accent + '18', color: accent, border: `1px solid ${accent}40` }}
          >
            <LogIn size={15} /> ເຂົ້າສູ່ລະບົບ ເພື່ອແທງດ້ວຍເງິນ demo
          </Link>
        )}
      </div>
    </div>
  )
}
