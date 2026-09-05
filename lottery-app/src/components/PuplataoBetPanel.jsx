import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Coins, Loader2, LogIn, Wallet, Check, AlertCircle, RefreshCw, Sparkles } from 'lucide-react'

const CHIPS = [1000, 5000, 10000, 50000]

const SYM_COLOR = {
  1: '#22c55e', 2: '#f97316', 3: '#3b82f6', 4: '#ec4899', 5: '#eab308', 6: '#ef4444',
}

const fmt = (n) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })
const chipLabel = (n) => (n >= 1000 ? `${n / 1000}ພ` : String(n))

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
 * ແຜງວາງເດີມພັນ ຂອງໜ້າສູດຄູ່ລູກ — ເລືອກຄູ່ ແລ້ວກົດແທງໄດ້ເລີຍ.
 * ໃຊ້ຮ່ວມກັນທັງ "ຄູ່ລູກ ງວດຖັດໄປ" (predict_pair) ແລະ "ຄູ່ລູກ ທີ່ຄວນຫຼີກ" (avoid_pair),
 * ແລະ ບັດ 7 ຄູ່ ໃນໜ້າສະຖິຕິ /puplatao.
 *
 * props.pairs  = [{ a, b, rank, score, prob, hint, isPick? }] ຮຽງອັນດັບ 1 → n
 *                (isPick = ຄູ່ທີ່ສູດເລືອກ — ຕັ້ງໄວ້ເປັນຄ່າເລີ່ມຕົ້ນ ແລະ ໝາຍດ້ວຍດາວ)
 * props.symOf  = map symbol_id → { symbol_id, name_lo, emoji }
 * props.title  = ຫົວແຜງ — ຕັ້ງເມື່ອໜ້າໜຶ່ງມີຫຼາຍແຜງ ຈະໄດ້ບໍ່ສັບສົນວ່າແຜງໃດຂອງບັດໃດ
 */
export default function PuplataoBetPanel({
  betting, betKind, accent, winLabel, pairs, symOf,
  title = 'ວາງເດີມພັນດ້ວຍເງິນ demo',
}) {
  const [rank, setRank]     = useState(1)
  const [stake, setStake]   = useState(CHIPS[0])
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
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black cursor-pointer"
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
  const tooPoor   = betting.isAuthed && balance !== null && stake > balance
  const belowMin  = stake < rate.min_stake
  // ບິນທີ່ລໍຜົນຢູ່ຂອງງວດນີ້ — ໃຊ້ໝາຍວ່າຄູ່ໃດແທງໄປແລ້ວ (ຍັງແທງຄູ່ອື່ນຕໍ່ໄດ້)
  const pendingBets = betting.pendingFor?.(betKind) || []
  const canBet    = betting.isAuthed && !tooPoor && !belowMin && !placing

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
    <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5 space-y-4"
         style={{ borderColor: accent + '33' }}>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] flex items-center gap-2">
          <Coins size={15} style={{ color: accent }} />
          {title}
        </h3>
        <span className="flex items-center gap-2">
          <span className="text-[11px] font-black tabular-nums px-2 py-0.5 rounded-lg"
                style={{ background: accent + '1a', color: accent }}>
            ຈ່າຍ {rate.multiplier}×
          </span>
          <span className="text-[11px] font-bold tabular-nums text-[#94a3b8]">
            ງວດ {betting.nextDrawNo ?? '—'}
          </span>
        </span>
      </div>

      {/* ── 1. ເລືອກຄູ່ ── */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8] mb-2">ເລືອກຄູ່ທີ່ຈະແທງ</p>
        {/* auto-fit: 3 ຄູ່ = 3 ຖັນ ຄືເກົ່າ · 7 ຄູ່ (ໜ້າສະຖິຕິ) = ຂະຫຍາຍ/ຕັດແຖວເອງ */}
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(84px, 1fr))' }}>
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
                className="relative flex flex-col items-center gap-1.5 py-2.5 rounded-xl cursor-pointer transition-colors"
                style={on
                  ? { background: accent + '1f', border: `1.5px solid ${accent}`, color: accent }
                  : { background: 'transparent', border: '1.5px solid #e8edf822', color: '#94a3b8' }}
              >
                {bet && (
                  <span className="absolute top-1 right-1.5 flex items-center gap-0.5 text-[9px] font-black tabular-nums"
                        style={{ color: '#16a34a' }} title={`ງວດນີ້ແທງຄູ່ນີ້ໄປແລ້ວ ${fmt(bet.stake)} ກີບ`}>
                    <Check size={9} />{fmt(bet.stake)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Ball sym={symOf[p.a]} size={28} />
                  <Ball sym={symOf[p.b]} size={28} />
                </span>
                <span className="flex items-center gap-0.5 text-[11px] font-black">
                  {p.isPick && <Sparkles size={10} />}ຄູ່ທີ {p.rank}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── ຄູ່ທີ່ເລືອກ ── */}
      <div className="flex items-center gap-3 flex-wrap rounded-xl p-3"
           style={{ background: accent + '0d' }}>
        <Ball sym={symOf[pair.a]} />
        <Ball sym={symOf[pair.b]} />
        <div className="min-w-0">
          <p className="text-sm font-black text-[#0f172a] dark:text-[#f1f5f9] truncate">
            {symOf[pair.a]?.name_lo} + {symOf[pair.b]?.name_lo}
          </p>
          <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8]">
            ຊະນະເມື່ອ <b style={{ color: accent }}>{winLabel}</b>
            {pair.prob != null && <> · ໂອກາດ ≈ {Math.round(pair.prob * 100)}%</>}
          </p>
          {pair.hint && <p className="text-[10px] text-[#94a3b8] tabular-nums mt-0.5">{pair.hint}</p>}
        </div>
      </div>

      {/* ── 2. ຈຳນວນເງິນ ── */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8] mb-2">ເງິນເດີມພັນ (ກີບ)</p>
        <div className="flex flex-wrap gap-1.5">
          {CHIPS.map(c => {
            const on = stake === c
            return (
              <button key={c} type="button" onClick={() => setStake(c)}
                      className="px-3 py-1.5 rounded-lg text-xs font-black tabular-nums cursor-pointer transition-colors"
                      style={on ? { background: accent, color: '#fff' } : { background: accent + '12', color: accent }}>
                {chipLabel(c)}
              </button>
            )
          })}
          <input
            type="number"
            value={stake}
            min={rate.min_stake}
            max={rate.max_stake}
            step={1000}
            onChange={e => setStake(Math.max(0, Number(e.target.value) || 0))}
            aria-label="ຈຳນວນເງິນເດີມພັນ (ກີບ)"
            className="flex-1 min-w-[110px] px-3 py-1.5 rounded-lg text-xs font-black tabular-nums text-right bg-[#f8fafc] dark:bg-white/5 border border-[#e8edf8] dark:border-white/10 outline-none focus:border-current"
            style={{ color: accent }}
          />
        </div>
      </div>

      {/* ── 3. ແທງ ── */}
      {betting.isAuthed ? (
        <>
          <button
            type="button"
            onClick={submit}
            disabled={!canBet}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 transition-opacity"
            style={{ background: accent, color: '#fff' }}
          >
            {placing
              ? <><Loader2 size={15} className="animate-spin" /> ກຳລັງສົ່ງ…</>
              : <>ວາງເດີມພັນ ຄູ່ທີ {pair.rank} · ໄດ້ຄືນ {fmt(potential)} ກີບ</>}
          </button>

          <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] tabular-nums">
            <span className="text-[#94a3b8]">
              {tooPoor
                ? <span className="text-[#dc2626] font-bold">ຍອດເງິນ demo ບໍ່ພຽງພໍ</span>
                : belowMin
                  ? <span className="text-[#dc2626] font-bold">ຂັ້ນຕ່ຳ {fmt(rate.min_stake)} ກີບ</span>
                  : <>
                      ຄົງເຫຼືອ {balance === null ? '—' : fmt(balance)} ກີບ
                      {pendingBets.length > 0 && <> · ງວດນີ້ແທງແລ້ວ {pendingBets.length} ຄູ່</>}
                    </>}
            </span>
            <Link to="/puplatao/bets" className="flex items-center gap-1 font-bold hover:underline" style={{ color: accent }}>
              <Wallet size={12} /> ເບິ່ງກຳໄລ-ຂາດທຶນສະສົມ
            </Link>
          </div>

          {justBet && (
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#16a34a] tabular-nums">
              <Check size={13} /> ຮັບແທງ ຄູ່ທີ {justBet.rank} · {fmt(justBet.stake)} ກີບ ແລ້ວ — ແທງຄູ່ອື່ນຕໍ່ໄດ້
            </p>
          )}
        </>
      ) : (
        <Link
          to="/login"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-opacity hover:opacity-85"
          style={{ background: accent + '18', color: accent, border: `1px solid ${accent}40` }}
        >
          <LogIn size={15} /> ເຂົ້າສູ່ລະບົບ ເພື່ອແທງດ້ວຍເງິນ demo
        </Link>
      )}
    </div>
  )
}
