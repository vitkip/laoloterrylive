/**
 * puplataoPairSignal.js — ອ່ານ "ພຶດຕິກຳ" ຂອງຄູ່ລູກ ຈາກຜົນທີ່ອອກມາແລ້ວ
 * ແລ້ວປະເມີນໂອກາດຂອງງວດຖັດໄປ ໃຫ້ແຕ່ລະຄູ່ (C(6,2) = 15 ຄູ່).
 *
 * ໃຊ້ໃນໜ້າ /puplatao ບັດ "ຄູ່ທີ່ອອກພ້ອມກັນເລື້ອຍໆ" (7 ຄູ່) ແລະ
 * "ຄູ່ທີ່ອອກພ້ອມກັນໜ້ອຍສຸດ" (7 ຄູ່) — ເພື່ອໝາຍວ່າຄູ່ໃດໜ້າຈະອອກ/ບໍ່ອອກ ງວດຖັດໄປ.
 *
 * ວິທີຄິດ (3 ຊັ້ນ, ທຸກຊັ້ນມາຈາກຂໍ້ມູນຈິງ ບໍ່ແມ່ນຄ່າຕັ້ງເອງ):
 *   1. ຟອມຂອງແຕ່ລະລູກ — ຄວາມຖີ່ຕໍ່ໜ່ວຍ ຊັ່ງນ້ຳໜັກໃຫ້ງວດໃໝ່ໜັກກວ່າງວດເກົ່າ (q)
 *      → ໂອກາດພື້ນຖານ ຖ້າ 2 ລູກເປັນອິດສະລະຕໍ່ກັນ
 *   2. ແຮງດຶງລະຫວ່າງຄູ່ (lift) — ຄູ່ນີ້ອອກຮ່ວມກັນ ຫຼາຍ/ໜ້ອຍ ກວ່າທີ່ຄວາມຖີ່ຂອງ
 *      ແຕ່ລະລູກບອກໄວ້ບໍ່ (ຫຍໍ້ເຂົ້າຫາ 1 ເມື່ອຂໍ້ມູນຍັງໜ້ອຍ)
 *   3. ໂມເມນຕຳ (mom) — ໃນ 30 ງວດຫຼ້າສຸດ ຄູ່ນີ້ມາແຮງ ຫຼື ຊາລົງ
 *
 * ໝາຍເຫດສຳຄັນ: "ຫ່າງມາດົນ" (gap) ຄິດໄວ້ໃຫ້ເບິ່ງເທົ່ານັ້ນ ບໍ່ໄດ້ໃສ່ໃນສູດຄິດໂອກາດ —
 * ການອອກແຕ່ລະງວດເປັນເອກະລາດ ການ "ຮອດຄິວ" ບໍ່ໄດ້ເພີ່ມໂອກາດຈິງ.
 */

// ── ຄ່າຄົງທີ່ຂອງແບບຈຳລອງ ────────────────────────────────────────────
const RECENCY_N  = 60   // ງວດທີ່ເອົາມາຊັ່ງນ້ຳໜັກຄວາມສົດ ຂອງແຕ່ລະລູກ
const MOM_WINDOW = 30   // ຊ່ວງງວດທີ່ໃຊ້ວັດໂມເມນຕຳຂອງຄູ່
const ALPHA      = 3    // ຫຍໍ້ຄວາມຖີ່ຕໍ່ໜ່ວຍ ເຂົ້າຫາ 1/6 (Laplace)
const LIFT_K     = 4    // ຫຍໍ້ lift ເຂົ້າຫາ 1
const MOM_K      = 1.5  // ຫຍໍ້ mom ເຂົ້າຫາ 1
const LIFT_MIN   = 0.60
const LIFT_MAX   = 1.60
const MOM_MIN    = 0.70
const MOM_MAX    = 1.40

/** ເສັ້ນຖານສະເໝີພາບ: ໂອກາດທີ່ 2 ລູກ ອອກພ້ອມກັນ ໃນ 3 ໜ່ວຍ ≈ 13.9% */
export const PAIR_BASE_P = 1 - 2 * Math.pow(5 / 6, 3) + Math.pow(4 / 6, 3)
/** ເສັ້ນຖານສະເໝີພາບ: ໂອກາດທີ່ ບໍ່ອອກ ທັງສອງລູກ ≈ 29.6% */
export const NONE_BASE_P = Math.pow(4 / 6, 3)

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const pairKey = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`

/** ໂອກາດທີ່ລູກ a ແລະ b ອອກພ້ອມກັນ ໃນ 3 ໜ່ວຍ ເມື່ອຖືວ່າເປັນອິດສະລະຕໍ່ກັນ */
function indepBoth(qa, qb) {
  return 1 - Math.pow(1 - qa, 3) - Math.pow(1 - qb, 3) + Math.pow(Math.max(0, 1 - qa - qb), 3)
}

/**
 * ອ່ານພຶດຕິກຳຂອງທຸກຄູ່ ຈາກລາຍການງວດ (ໃໝ່ສຸດຢູ່ໜ້າ) ແລະ ລາຍການລູກ.
 * ຄືນ { n, byKey, pairs } — byKey[`a-b`] = ສັນຍານຂອງຄູ່ນັ້ນ.
 */
export function buildPairSignals(draws, symbols) {
  const ids = (symbols || []).map(s => s.symbol_id)
  const n = (draws || []).length
  if (ids.length < 2 || !n) return { n: 0, byKey: {}, pairs: [] }

  // ── 1. ຟອມຂອງແຕ່ລະລູກ: ຄວາມຖີ່ຕໍ່ໜ່ວຍ ຊັ່ງນ້ຳໜັກຄວາມສົດ ──────────
  const win = draws.slice(0, Math.min(RECENCY_N, n))
  const W = win.length
  const wCnt = {}
  ids.forEach(i => { wCnt[i] = 0 })
  let wTotal = 0
  win.forEach((d, idx) => {
    const w = (W - idx) / W               // ງວດໃໝ່ = 1 → ງວດເກົ່າສຸດ ≈ 1/W
    ;[d.pos1, d.pos2, d.pos3].forEach(v => {
      if (wCnt[v] === undefined) return
      wCnt[v] += w
      wTotal += w
    })
  })
  const q = {}
  ids.forEach(i => { q[i] = (wCnt[i] + ALPHA) / (wTotal + ALPHA * ids.length) })

  // ── ຄວາມຖີ່ຕະຫຼອດກາລະ (ບໍ່ຊັ່ງນ້ຳໜັກ) — ໃຊ້ເປັນຖານຄິດ lift ──────────
  const rawCnt = {}
  ids.forEach(i => { rawCnt[i] = 0 })
  let slots = 0
  draws.forEach(d => {
    ;[d.pos1, d.pos2, d.pos3].forEach(v => {
      if (rawCnt[v] === undefined) return
      rawCnt[v]++
      slots++
    })
  })
  const qLong = {}
  ids.forEach(i => { qLong[i] = (rawCnt[i] + ALPHA) / (slots + ALPHA * ids.length) })

  // ── 2. ນັບການອອກຮ່ວມ ຂອງທຸກຄູ່: ລວມ / 30 ງວດຫຼ້າສຸດ / ຫ່າງມາຈັກງວດ ──
  const times = {}, recent = {}, lastIdx = {}
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const k = pairKey(ids[i], ids[j])
      times[k] = 0
      recent[k] = 0
      lastIdx[k] = null
    }
  }
  const momWin = Math.min(MOM_WINDOW, n)
  draws.forEach((d, idx) => {
    const uniq = [...new Set([d.pos1, d.pos2, d.pos3].filter(Boolean))]
    for (let i = 0; i < uniq.length; i++) {
      for (let j = i + 1; j < uniq.length; j++) {
        const k = pairKey(uniq[i], uniq[j])
        if (!(k in times)) continue
        times[k]++
        if (idx < momWin) recent[k]++
        if (lastIdx[k] === null) lastIdx[k] = idx   // draws ຮຽງໃໝ່→ເກົ່າ
      }
    }
  })

  // ── 3. ລວມເປັນໂອກາດຂອງງວດຖັດໄປ ────────────────────────────────────
  const byKey = {}
  const pairs = []
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = Math.min(ids[i], ids[j])
      const b = Math.max(ids[i], ids[j])
      const k = pairKey(a, b)

      const pLong    = indepBoth(qLong[a], qLong[b])   // ຄາດໝາຍຕໍ່ງວດ ຖ້າອິດສະລະ
      const expLong  = n * pLong
      const lift = clamp((times[k] + LIFT_K) / (expLong + LIFT_K), LIFT_MIN, LIFT_MAX)
      const mom  = clamp((recent[k] + MOM_K) / (momWin * pLong + MOM_K), MOM_MIN, MOM_MAX)

      // ໂອກາດທີ່ແຕ່ລະລູກຈະອອກ ຢ່າງໜ້ອຍ 1 ໜ່ວຍ ໃນງວດຖັດໄປ
      const pA = 1 - Math.pow(1 - q[a], 3)
      const pB = 1 - Math.pow(1 - q[b], 3)

      // ອອກທັງສອງລູກ = ຖານອິດສະລະ × ແຮງດຶງ × ໂມເມນຕຳ (ບໍ່ເກີນຂອບເຂດ Fréchet)
      const pBoth = clamp(
        indepBoth(q[a], q[b]) * lift * mom,
        Math.max(0, pA + pB - 1),
        Math.min(pA, pB),
      )
      // ບໍ່ອອກທັງສອງລູກ — ມາຈາກເອກະລັກ P(∅) = 1 − P(A) − P(B) + P(A∩B)
      const pNone = clamp(1 - pA - pB + pBoth, 0, 1 - Math.max(pA, pB))

      const sig = {
        a, b, key: k,
        times: times[k],
        pct: (times[k] / n) * 100,
        recentTimes: recent[k],
        recentWindow: momWin,
        recentPct: (recent[k] / momWin) * 100,
        gap: lastIdx[k],                       // null = ຍັງບໍ່ເຄີຍອອກພ້ອມກັນ
        expectedGap: pLong > 0 ? 1 / pLong : null,
        lift, mom,
        pA, pB, pBoth, pNone,
      }
      byKey[k] = sig
      pairs.push(sig)
    }
  }

  return { n, byKey, pairs, q, qLong }
}

/** ຂໍ້ຄວາມສັ້ນ ບອກພຶດຕິກຳທີ່ອ່ານໄດ້ ຂອງຄູ່ນີ້ */
export function signalHint(sig) {
  if (!sig) return ''
  const parts = [
    `ອອກຮ່ວມ ${sig.times}× (${sig.pct.toFixed(1)}%)`,
    `${sig.recentWindow} ງວດຫຼ້າສຸດ ${sig.recentTimes}×`,
    sig.gap === null ? 'ຍັງບໍ່ເຄີຍອອກພ້ອມກັນ' : `ຫ່າງມາ ${sig.gap} ງວດ`,
  ]
  return parts.join(' · ')
}

/** ເຫດຜົນທີ່ AI ເລືອກຄູ່ນີ້ — ເອົາສັນຍານທີ່ແຮງສຸດ 2 ຢ່າງ */
export function signalReason(sig, mode) {
  if (!sig) return ''
  const out = []
  if (mode === 'both') {
    if (sig.lift >= 1.08) out.push(`ອອກຮ່ວມກັນຖີ່ກວ່າຄວາມຖີ່ຂອງແຕ່ລະລູກ ${Math.round((sig.lift - 1) * 100)}%`)
    else if (sig.lift <= 0.93) out.push(`ອອກຮ່ວມກັນຖີ່ກວ່າຖານ ແຕ່ໜ້ອຍກວ່າຄວາມຖີ່ຂອງແຕ່ລະລູກ`)
    if (sig.mom >= 1.08) out.push(`${sig.recentWindow} ງວດຫຼ້າສຸດມາແຮງ (${sig.recentTimes}×)`)
    else if (sig.mom <= 0.92) out.push(`${sig.recentWindow} ງວດຫຼ້າສຸດຊາລົງ (${sig.recentTimes}×)`)
    if (!out.length) out.push('ຟອມ 2 ລູກນີ້ ຮ້ອນສຸດ ໃນ 7 ຄູ່ນີ້')
  } else {
    out.push(`ຟອມ 2 ລູກນີ້ ເຢັນສຸດ ໃນ 7 ຄູ່ນີ້ (ໂອກາດອອກ ${Math.round(sig.pA * 100)}% / ${Math.round(sig.pB * 100)}%)`)
    if (sig.mom <= 0.92) out.push(`${sig.recentWindow} ງວດຫຼ້າສຸດ ອອກຮ່ວມພຽງ ${sig.recentTimes}×`)
  }
  return out.slice(0, 2).join(' · ')
}

/**
 * ຈັດອັນດັບ 7 ຄູ່ ຂອງບັດໜຶ່ງ ແລ້ວໝາຍວ່າຄູ່ໃດ AI ເລືອກ.
 *
 * @param signals  ຜົນຈາກ buildPairSignals
 * @param cardPairs [{ a, b }] — 7 ຄູ່ທີ່ບັດນັ້ນສະແດງ
 * @param mode     'both' = ຫາຄູ່ທີ່ໜ້າຈະອອກທັງສອງລູກ · 'none' = ຫາຄູ່ທີ່ໜ້າຈະບໍ່ອອກເລີຍ
 * @returns [{ a, b, rank, prob, score, hint, reason, isPick, edgeVsBase }] ຮຽງອັນດັບ 1 → 7
 */
export function rankCardPairs(signals, cardPairs, mode) {
  if (!signals?.n || !cardPairs?.length) return []
  const base = mode === 'both' ? PAIR_BASE_P : NONE_BASE_P

  const rows = cardPairs
    .map(p => signals.byKey[pairKey(p.a, p.b)])
    .filter(Boolean)
    .map(sig => ({ sig, prob: mode === 'both' ? sig.pBoth : sig.pNone }))
    .sort((x, y) => y.prob - x.prob)

  if (!rows.length) return []
  const hi = rows[0].prob
  const lo = rows[rows.length - 1].prob

  return rows.map((r, i) => ({
    a: r.sig.a,
    b: r.sig.b,
    key: r.sig.key,
    rank: i + 1,
    prob: r.prob,
    // score 0–1 = ແຮງກວ່າຄູ່ອື່ນໃນບັດນີ້ຫຼາຍປານໃດ (ເກັບໄວ້ກັບບິນເດີມພັນ)
    score: hi > lo ? (r.prob - lo) / (hi - lo) : 1,
    edgeVsBase: base > 0 ? r.prob / base - 1 : 0,
    hint: signalHint(r.sig),
    reason: i === 0 ? signalReason(r.sig, mode) : '',
    isPick: i === 0,
    sig: r.sig,
  }))
}

/**
 * ໝັ້ນໃຈຫຼາຍປານໃດ — ດູຈາກ ໄລຍະຫ່າງລະຫວ່າງອັນດັບ 1 ກັບ 2 ແລະ ຈຳນວນງວດທີ່ມີ.
 * ຄືນ { level: 'ສູງ'|'ກາງ'|'ຕ່ຳ', color, margin }
 */
export function pickConfidence(ranked, n) {
  if (ranked.length < 2) return { level: 'ຕ່ຳ', color: '#94a3b8', margin: 0 }
  const margin = ranked[1].prob > 0 ? ranked[0].prob / ranked[1].prob - 1 : 0
  if (n >= 120 && margin >= 0.12) return { level: 'ສູງ', color: '#16a34a', margin }
  if (n >= 60  && margin >= 0.06) return { level: 'ກາງ', color: '#d97706', margin }
  return { level: 'ຕ່ຳ', color: '#94a3b8', margin }
}
