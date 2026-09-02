import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle, RefreshCw, ShieldOff, TrendingDown, Layers, Ban, Info, X, History,
  Shuffle, Target, ArrowRight,
} from 'lucide-react'
import { API as API_BASE } from '../utils/api'
import AiSummaryCard from '../components/AiSummaryCard'

const API = `${API_BASE}/puplatao.php`

const SYM_COLOR = {
  1: '#22c55e', 2: '#f97316', 3: '#3b82f6', 4: '#ec4899', 5: '#eab308', 6: '#ef4444',
}

// ອັນດັບ "ຄູ່ຫຼີກ" — ໃຊ້ໂທນເຢັນ (ຟ້າ/ຄາມ/ເທົາ) ກົງກັນຂ້າມກັບໜ້າ ຄູ່ລູກ ງວດຖັດໄປ (ໂທນຮ້ອນ)
const RANK_META = [
  { bg: 'linear-gradient(135deg,#3b82f6 0%,#6366f1 50%,#8b5cf6 100%)', color: '#fff', shadow: 'rgba(99,102,241,0.4)' },
  { bg: 'linear-gradient(135deg,#0ea5e9 0%,#38bdf8 50%,#0284c7 100%)', color: '#fff', shadow: 'rgba(14,165,233,0.35)' },
  { bg: 'linear-gradient(135deg,#64748b 0%,#94a3b8 50%,#475569 100%)', color: '#fff', shadow: 'rgba(100,116,139,0.35)' },
]

const ACCENT = '#6366f1'

// ເສັ້ນຖານ "ທາຍມົ້ວ" ດ້ານກົງກັນຂ້າມ (ລູກ 6 · 3 ໜ່ວຍ/ງວດ)
const BASE_NONE_PCT    = Math.round(Math.pow(4 / 6, 3) * 100)                                       // ≈ 30 — ບໍ່ອອກທັງສອງລູກ
const BASE_NOTBOTH_PCT = Math.round((1 - (1 - 2 * Math.pow(5 / 6, 3) + Math.pow(4 / 6, 3))) * 100)  // ≈ 86 — ບໍ່ອອກພ້ອມກັນ

const DOW_LO = ['ອາທິດ', 'ຈັນ', 'ອັງຄານ', 'ພຸດ', 'ພະຫັດ', 'ສຸກ', 'ເສົາ']
const BEHAVIOR_WINDOW = 50 // ຈຳນວນງວດຫຼ້າສຸດ ທີ່ສົ່ງໃຫ້ AI ອ່ານດ້ວຍຕົນເອງ

function normalize(obj) {
  const max = Math.max(...Object.values(obj), 0)
  const out = {}
  for (const k in obj) out[k] = max > 0 ? obj[k] / max : 0
  return out
}

// min–max normalize → 0..1 (ໃຫ້ contrast ຫຼາຍກວ່າ /max; flat → 0.5)
function normMinMax(obj) {
  const vals = Object.values(obj).filter(Number.isFinite)
  const min = vals.length ? Math.min(...vals) : 0
  const max = vals.length ? Math.max(...vals) : 0
  const out = {}
  for (const k in obj) out[k] = max > min ? (obj[k] - min) / (max - min) : 0.5
  return out
}

// Wilson score interval ສຳລັບ binomial proportion (z = 1.96 → 95%)
function wilson(hits, n, z = 1.96) {
  if (!n) return [0, 0]
  const p = hits / n
  const z2 = z * z
  const denom = 1 + z2 / n
  const centre = p + z2 / (2 * n)
  const half = z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))
  return [Math.max(0, (centre - half) / denom), Math.min(1, (centre + half) / denom)]
}

// χ² critical value ທີ່ p = 0.05 (ຂ້າງດຽວ) — Wilson–Hilferty approximation
function chi2Critical05(df) {
  if (df <= 0) return Infinity
  const z = 1.6448536269514722
  const t = 1 - 2 / (9 * df) + z * Math.sqrt(2 / (9 * df))
  return df * t * t * t
}

// deterministic PRNG → ບັດ Monte-Carlo ບໍ່ດີ້ນທຸກຄັ້ງທີ່ re-render
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── ຄ່າຄົງທີ່ ────────────────────────────────────────────────────────
const BAYES_ALPHA     = 1.5                    // Beta–Binomial prior strength (prior mean = 1/6)
const HAZARD_MAX_G    = 14                     // gap ≥ ຄ່ານີ້ ລວມເປັນ bucket ດຽວ
const HAZARD_MIN_N    = 5                      // ຕ້ອງ reached ≥ ຄ່ານີ້ ຈຶ່ງເອົາ bucket ມາ test
const MC_ITERS        = 10000
const MC_WINDOW       = 30                     // ຈຳນວນງວດຫຼ້າສຸດ ທີ່ໃຊ້ສ້າງ per-slot dist
const SYM_ABSENT_BASE = Math.pow(5 / 6, 3)     // ≈ 0.5787 — ໂອກາດ 1 ລູກ "ບໍ່ອອກ"/ງວດ (ສະເໝີພາບ)

// ── ສູດຄິດ 3 ຄູ່ລູກ "ທີ່ຄວນຫຼີກ" ສຳລັບງວດຖັດໄປ (ກົງກັນຂ້າມທຸກເທີມ) ──
// C(ລູກ)  = 0.55 · (1 − ຄວາມຖີ່ 20 ງວດຫຼ້າສຸດ)   ← ລູກເຢັນ ອອກໜ້ອຍ
//         + 0.45 · (1 − overdue)                  ← ຫາກຫາກໍອອກ ⇒ ຍັງບໍ່ຄ້າງ
// A(a,b)  = 0.40 · ຄວາມເຢັນລູກສະເລ່ຍ (C)
//         + 0.35 · (1 − ຄວາມຖີ່ອອກຄູ່ນຳກັນ ທັງໝົດ)
//         + 0.25 · (1 − ຄວາມຖີ່ອອກຄູ່ນຳກັນ 15 ງວດຫຼ້າສຸດ)
// backtest: ນັບຍ້ອນຫຼັງ 60 ງວດ ວ່າ 2 ລູກນີ້ "ບໍ່ອອກເລີຍ" / "ບໍ່ອອກພ້ອມກັນ" ຈັກງວດ
function buildAvoidPairPredictions(draws, symbols, hazard = null) {
  const n = draws.length
  if (n === 0 || symbols.length === 0) return null
  const ID = symbols.map(s => s.symbol_id)
  const symOf = {}
  symbols.forEach(s => { symOf[s.symbol_id] = s })

  const N = Math.min(20, n)
  const recent = draws.slice(0, N)

  const rec = {}
  ID.forEach(i => { rec[i] = 0 })
  recent.forEach((d, idx) => {
    const w = (N - idx) / N
    ;[d.pos1, d.pos2, d.pos3].forEach(v => { if (v) rec[v] += w })
  })

  const lastSeen = {}
  ID.forEach(i => { lastSeen[i] = null })
  draws.forEach((d, idx) => {
    ;[d.pos1, d.pos2, d.pos3].forEach(v => {
      if (v && lastSeen[v] === null) lastSeen[v] = idx
    })
  })
  const gap = {}
  ID.forEach(i => { gap[i] = lastSeen[i] === null ? n : lastSeen[i] })
  const maxGap = Math.max(...Object.values(gap), 1)

  // Bayesian shrinkage — ໂອກາດອອກ/ໜ່ວຍ ຈາກ Beta–Binomial posterior (prior mean = 1/6)
  const effSlots = (3 * (N + 1)) / 2 // Σ recency-weights × 3 ໜ່ວຍ
  const pHat = {}
  const seHat = {}
  ID.forEach(i => {
    const denom = effSlots + BAYES_ALPHA * ID.length
    pHat[i] = (rec[i] + BAYES_ALPHA) / denom
    seHat[i] = Math.sqrt((pHat[i] * (1 - pHat[i])) / denom)
  })
  const normRec = normMinMax(pHat)

  // gap term — ໃຊ້ hazard ເມື່ອ gap ມີສັນຍານ (χ² p<0.05), ບໍ່ດັ່ງນັ້ນໃຊ້ອັດຕາຄ້າງແບບເສັ້ນຊື່
  const useHazard = !!(hazard && hazard.informative)
  const normGap = {}
  if (useHazard) {
    const ratio = {}
    ID.forEach(i => { ratio[i] = hazard.pObs > 0 ? hazard.hazardAt(gap[i]) / hazard.pObs : 1 })
    const nr = normMinMax(ratio)
    ID.forEach(i => { normGap[i] = nr[i] })
  } else {
    ID.forEach(i => { normGap[i] = maxGap ? gap[i] / maxGap : 0 })
  }

  // S = ຄວາມແຮງ (ຄືໜ້າ "ຄູ່ລູກ ງວດຖັດໄປ") → ໃຊ້ສ້າງຄວາມໜ້າຈະເປັນຈິງ
  // C = ຄວາມເຢັນ = ກົງກັນຂ້າມ ທຸກເທີມ → ໃຊ້ຈັດອັນດັບຄູ່ທີ່ຄວນຫຼີກ
  const S = {}
  const C = {}
  ID.forEach(i => {
    S[i] = 0.55 * normRec[i] + 0.45 * normGap[i]
    C[i] = 0.55 * (1 - normRec[i]) + 0.45 * (1 - normGap[i])
  })
  const normC = normalize(C)

  // ແປງຄະແນນ S → ຄວາມໜ້າຈະເປັນ % ຈິງ ແລ້ວເອົາ "ສ່ວນເສີມ" (ໂອກາດບໍ່ອອກ)
  // q = ສ່ວນແບ່ງການເລືອກ ຕໍ່ 1 ໜ່ວຍ ( Σq = 1); ລູກ 3 ໜ່ວຍ/ງວດ
  const sumS = ID.reduce((s, i) => s + S[i], 0)
  const q = {}
  ID.forEach(i => { q[i] = sumS > 0 ? S[i] / sumS : 1 / ID.length })
  const probAbsent = {}
  ID.forEach(i => { probAbsent[i] = Math.pow(1 - q[i], 3) })

  // co-occurrence
  const co = {}
  const coR = {}
  ID.forEach(a => { co[a] = {}; coR[a] = {}; ID.forEach(b => { co[a][b] = 0; coR[a][b] = 0 }) })
  draws.forEach((d, idx) => {
    const uniq = [...new Set([d.pos1, d.pos2, d.pos3].filter(Boolean))]
    for (let i = 0; i < uniq.length; i++) {
      for (let j = i + 1; j < uniq.length; j++) {
        const a = uniq[i]; const b = uniq[j]
        co[a][b]++; co[b][a]++
        if (idx < 15) { coR[a][b]++; coR[b][a]++ }
      }
    }
  })
  const coFlat = {}
  const coRFlat = {}
  for (let i = 0; i < ID.length; i++) {
    for (let j = i + 1; j < ID.length; j++) {
      const key = ID[i] + '-' + ID[j]
      coFlat[key] = co[ID[i]][ID[j]]
      coRFlat[key] = coR[ID[i]][ID[j]]
    }
  }
  const nCo = normalize(coFlat)
  const nCoR = normalize(coRFlat)

  const pairs = []
  for (let i = 0; i < ID.length; i++) {
    for (let j = i + 1; j < ID.length; j++) {
      const a = ID[i]; const b = ID[j]; const key = a + '-' + b
      const symPart = (normC[a] + normC[b]) / 2
      // ຄະແນນ "ຄວນຫຼີກ" — ຄູ່ທີ່ບໍ່ຄ່ອຍມາພ້ອມກັນ ໄດ້ຄະແນນສູງ
      const score = 0.40 * symPart + 0.35 * (1 - nCo[key]) + 0.25 * (1 - nCoR[key])
      // ລູກທີ 3 ທີ່ຄວນຫຼີກ = ລູກເຢັນສຸດ ໃນ 4 ລູກທີ່ເຫຼືອ
      const third = ID.filter(x => x !== a && x !== b).sort((x, y) => C[y] - C[x])[0]
      // P(ບໍ່ອອກທັງ a ແລະ b ໃນ 3 ໜ່ວຍ) / P(ບໍ່ອອກພ້ອມກັນ)
      const rAB = Math.max(0, 1 - q[a] - q[b])
      const noneProb = Math.max(0, Math.min(1, Math.pow(rAB, 3)))
      const bothProb = Math.max(0, Math.min(1,
        1 - Math.pow(1 - q[a], 3) - Math.pow(1 - q[b], 3) + Math.pow(rAB, 3)))
      const notBothProb = 1 - bothProb
      pairs.push({ a, b, third, score, noneProb, notBothProb })
    }
  }
  pairs.sort((x, y) => y.score - x.score)
  const top = pairs.slice(0, 3)

  const bt = draws.slice(0, Math.min(60, n))
  top.forEach(p => {
    let none = 0; let notBoth = 0
    bt.forEach(d => {
      const set = new Set([d.pos1, d.pos2, d.pos3])
      const hasA = set.has(p.a); const hasB = set.has(p.b)
      if (!hasA && !hasB) none++
      if (!(hasA && hasB)) notBoth++
    })
    p.backtest = {
      n: bt.length, none, notBoth,
      pctNone: bt.length ? Math.round((none / bt.length) * 100) : 0,
      pctNotBoth: bt.length ? Math.round((notBoth / bt.length) * 100) : 0,
    }
  })

  const symbolRanked = ID
    .map(i => ({
      id: i, sym: symOf[i], score: normC[i], prob: probAbsent[i],
      perSlotProb: 1 - pHat[i],
      perSlotCI: [Math.max(0, 1 - pHat[i] - 1.96 * seHat[i]), Math.min(1, 1 - pHat[i] + 1.96 * seHat[i])],
    }))
    .sort((a, b) => b.prob - a.prob)

  return { top, symbolRanked, totalDraws: n, backtestN: bt.length, symOf, hazardUsed: useHazard }
}

// ── Hazard / survival ຕາມ gap ──────────────────────────────────────
// "ຄ້າງມາ g ງວດແລ້ວ ໂອກາດອອກງວດນີ້ເທົ່າໃດ?" — χ² homogeneity ທຽບ memoryless.
// ໃນໜ້ານີ້ ຄ່າ hazard ຖືກໃຊ້ "ກັບຫົວ": ລູກທີ່ hazard ສູງ ⇒ ຄວາມເຢັນຕ່ຳ ⇒ ບໍ່ຄວນຫຼີກ.
function buildHazardModel(draws, symbols) {
  if (!symbols.length || draws.length < 10) return null
  const ID = symbols.map(s => s.symbol_id)
  const seq = draws
    .slice()
    .reverse()
    .map(d => new Set([d.pos1, d.pos2, d.pos3].filter(Boolean))) // ເກົ່າ → ໃໝ່

  const reached = new Array(HAZARD_MAX_G + 1).fill(0)
  const hit = new Array(HAZARD_MAX_G + 1).fill(0)
  ID.forEach(id => {
    let seen = false
    let g = 0
    for (let t = 0; t < seq.length; t++) {
      const present = seq[t].has(id)
      if (seen) {
        const gc = Math.min(g, HAZARD_MAX_G)
        reached[gc]++
        if (present) hit[gc]++
      }
      if (present) { seen = true; g = 0 } else if (seen) { g++ }
    }
  })

  const totReached = reached.reduce((s, v) => s + v, 0)
  const totHit = hit.reduce((s, v) => s + v, 0)
  if (totReached < 20 || totHit === 0) return null
  const pObs = totHit / totReached // ອັດຕາອອກສະເລ່ຍ ຕໍ່ຈຸດຕັດສິນ (memoryless baseline)

  // χ² homogeneity: observed hit[g]/miss[g] ທຽບກັບ expected ຈາກ pObs
  let chi2 = 0
  let buckets = 0
  const rows = []
  for (let g = 0; g <= HAZARD_MAX_G; g++) {
    if (reached[g] === 0) continue
    rows.push({ g, reached: reached[g], hit: hit[g], hazard: hit[g] / reached[g] })
    if (reached[g] >= HAZARD_MIN_N) {
      const eHit = reached[g] * pObs
      const eMiss = reached[g] * (1 - pObs)
      if (eHit > 0 && eMiss > 0) {
        chi2 += Math.pow(hit[g] - eHit, 2) / eHit
        chi2 += Math.pow(reached[g] - hit[g] - eMiss, 2) / eMiss
        buckets++
      }
    }
  }
  const df = Math.max(0, buckets - 1)
  const informative = df > 0 && chi2 > chi2Critical05(df)

  // weighted linear fit: hazard ~ g (ນ້ຳໜັກ = reached) → ຄວາມຊັນ
  let sw = 0, swx = 0, swy = 0, swxx = 0, swxy = 0
  rows.forEach(r => {
    const w = r.reached
    sw += w; swx += w * r.g; swy += w * r.hazard
    swxx += w * r.g * r.g; swxy += w * r.g * r.hazard
  })
  const dd = sw * swxx - swx * swx
  const slope = dd !== 0 ? (sw * swxy - swx * swy) / dd : 0

  const hazardAt = (g) => {
    const gc = Math.min(Math.max(0, g), HAZARD_MAX_G)
    return reached[gc] >= HAZARD_MIN_N ? hit[gc] / reached[gc] : pObs
  }

  return { rows, pObs, chi2, df, informative, slope, hazardAt }
}

// ── Monte-Carlo: per-slot multinomial (ຊ່ອງ 1/2/3 ອິດສະຫຼະ) ─────────
// ສ້າງ P(ລູກ | ໜ່ວຍ k) ຈາກ MC_WINDOW ງວດຫຼ້າສຸດ (Laplace +1) → ສຸ່ມ MC_ITERS ຮອບ
// → ອ່ານ "ໂອກາດບໍ່ອອກ" ຂອງລູກດຽວ / ຄູ່ ໂດຍກົງ. seed ຄົງທີ່ຕໍ່ຈຳນວນງວດ.
function buildMonteCarlo(draws, symbols) {
  const n = draws.length
  if (!symbols.length || n < 8) return null
  const ID = symbols.map(s => s.symbol_id)
  const K = ID.length
  const symOf = {}
  symbols.forEach(s => { symOf[s.symbol_id] = s })
  const W = Math.min(MC_WINDOW, n)
  const win = draws.slice(0, W)

  const cnt = [0, 1, 2].map(() => {
    const o = {}
    ID.forEach(i => { o[i] = 1 }) // Laplace(1)
    return o
  })
  win.forEach(d => {
    ;[d.pos1, d.pos2, d.pos3].forEach((v, k) => { if (v && cnt[k][v] !== undefined) cnt[k][v]++ })
  })
  const cum = [0, 1, 2].map(k => {
    const total = ID.reduce((s, i) => s + cnt[k][i], 0)
    let acc = 0
    return ID.map(i => { acc += cnt[k][i] / total; return acc })
  })

  const rng = mulberry32((0x9e3779b9 ^ Math.imul(n, 2654435761)) >>> 0)
  const pick = (k) => {
    const r = rng()
    const c = cum[k]
    for (let i = 0; i < K; i++) if (r <= c[i]) return ID[i]
    return ID[K - 1]
  }

  const absent = {}
  const none = {}
  ID.forEach(a => {
    absent[a] = 0; none[a] = {}
    ID.forEach(b => { none[a][b] = 0 })
  })
  for (let it = 0; it < MC_ITERS; it++) {
    const s = new Set([pick(0), pick(1), pick(2)])
    const miss = ID.filter(x => !s.has(x))
    miss.forEach(x => { absent[x]++ })
    for (let i = 0; i < miss.length; i++)
      for (let j = i + 1; j < miss.length; j++) { none[miss[i]][miss[j]]++; none[miss[j]][miss[i]]++ }
  }

  const symbolProb = ID
    .map(i => ({ symbol_id: i, sym: symOf[i], prob: absent[i] / MC_ITERS }))
    .sort((a, b) => b.prob - a.prob)
  const pairsMc = []
  for (let i = 0; i < K; i++)
    for (let j = i + 1; j < K; j++)
      pairsMc.push({ a: ID[i], b: ID[j], none: none[ID[i]][ID[j]] / MC_ITERS })
  pairsMc.sort((x, y) => y.none - x.none)

  return { iters: MC_ITERS, window: W, symbolProb, topPairs: pairsMc.slice(0, 3), symOf }
}

// ── ຍ້ອນເບິ່ງ: ສູດຫຼີກນີ້ (ຄູ່ທີ 1 / 2 / 3) "ຫຼີກຖືກ" ຈັກຄັ້ງໃນອະດີດ ──
// ແຕ່ລະງວດຍ້ອນຫຼັງ k: ຄິດສູດໃໝ່ ໂດຍໃຊ້ພຽງງວດທີ່ເກົ່າກວ່າ k → ທຽບກັບຜົນຈິງ
const BT_WINDOW = 60   // ຈຳນວນງວດຫຼ້າສຸດທີ່ເອົາມາທົດສອບ
const BT_MIN_HIST = 12 // ຕ້ອງມີປະຫວັດຢ່າງໜ້ອຍເທົ່ານີ້ ຈຶ່ງຄິດສູດ

function backtestFormula(draws, symbols) {
  if (!symbols.length || draws.length < BT_MIN_HIST + 3) return null
  const none = [0, 0, 0]
  const notBoth = [0, 0, 0]
  let n = 0
  let allNone = 0
  const rows = []
  // Brier — ວັດວ່າ % ທີ່ສະແດງ ຄາລິເບຣດ ຖືກຕ້ອງພຽງໃດ (ຕ່ຳ = ດີ)
  const brierNone = [0, 0, 0]
  let brierSym = 0
  let brierSymBase = 0
  let brierSymN = 0
  const limit = Math.min(BT_WINDOW, draws.length - BT_MIN_HIST)
  for (let k = 0; k < limit; k++) {
    const hist = draws.slice(k + 1)
    if (hist.length < BT_MIN_HIST) break
    const hz = buildHazardModel(hist, symbols) // null ⇒ ໃຊ້ gap ເສັ້ນຊື່
    const pred = buildAvoidPairPredictions(hist, symbols, hz)
    if (!pred || pred.top.length < 3) continue
    const actualArr = [draws[k].pos1, draws[k].pos2, draws[k].pos3].filter(Boolean)
    const actual = new Set(actualArr)
    n++
    let missAll = true
    const rankHits = pred.top.map((p, i) => {
      const hasA = actual.has(p.a)
      const hasB = actual.has(p.b)
      const isNone = !hasA && !hasB
      if (isNone) none[i]++
      else missAll = false
      if (!(hasA && hasB)) notBoth[i]++
      brierNone[i] += Math.pow(p.noneProb - (isNone ? 1 : 0), 2)
      return { none: isNone, notBoth: !(hasA && hasB), pair: [p.a, p.b] }
    })
    pred.symbolRanked.forEach(r => {
      const o = actual.has(r.id) ? 0 : 1 // 1 = ບໍ່ອອກ (ຫຼີກຖືກ)
      brierSym += Math.pow(r.prob - o, 2)
      brierSymBase += Math.pow(SYM_ABSENT_BASE - o, 2)
      brierSymN++
    })
    if (missAll) allNone++
    rows.push({ draw_no: draws[k].draw_no, draw_at: draws[k].draw_at, actual: actualArr, rankHits })
  }
  if (n === 0) return null
  const brierSymbol = brierSym / brierSymN
  const brierSymbolBase = brierSymBase / brierSymN
  return {
    n, none, notBoth, allNone, rows,
    baseNone: Math.pow(4 / 6, 3),                                   // ≈ 0.296
    baseNotBoth: 1 - (1 - 2 * Math.pow(5 / 6, 3) + Math.pow(4 / 6, 3)), // ≈ 0.861
    // calibration (ຕໍ່ລູກ — 6 ຈຸດ/ງວດ ⇒ ຕົວຢ່າງຫຼາຍ)
    brierSymbol,
    brierSymbolBase,
    brierSkill: brierSymbolBase > 0 ? 1 - brierSymbol / brierSymbolBase : 0,
    brierNone: brierNone.map(b => b / n),
    // Wilson 95% CI ເທິງ avoid-rate
    wilsonNone: none.map(b => wilson(b, n)),
    wilsonNotBoth: notBoth.map(e => wilson(e, n)),
    wilsonAll: wilson(allNone, n),
  }
}

function SymBall({ sym, size = 52, dim = false }) {
  if (!sym) return null
  const c = SYM_COLOR[sym.symbol_id] || '#64748b'
  return (
    <span
      className="inline-flex items-center justify-center rounded-2xl shrink-0"
      style={{
        width: size, height: size,
        background: c + (dim ? '12' : '1f'),
        border: `1.5px solid ${c}${dim ? '33' : '55'}`,
        opacity: dim ? 0.75 : 1,
      }}
      title={sym.name_lo}
    >
      <span style={{ fontSize: size * 0.5, lineHeight: 1 }}>{sym.emoji}</span>
    </span>
  )
}

function AvoidPairCard({ pair, symOf }) {
  const m = RANK_META[pair.rank - 1] || RANK_META[2]
  const { backtest } = pair
  const noneUp    = backtest.pctNone    >= BASE_NONE_PCT
  const notBothUp = backtest.pctNotBoth >= BASE_NOTBOTH_PCT
  return (
    <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black"
          style={{ background: m.bg, color: m.color, boxShadow: `0 2px 10px ${m.shadow}` }}
        >
          {pair.rank === 1 && <Ban size={12} />}
          ຄູ່ຫຼີກທີ {pair.rank}
        </span>
        <span className="text-[10px] text-[#94a3b8] tabular-nums">ຄະແນນຄວນຫຼີກ {Math.round(pair.score * 100)}%</span>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SymBall sym={symOf[pair.a]} dim />
        <X size={16} className="text-[#94a3b8]" />
        <SymBall sym={symOf[pair.b]} dim />
        <div className="flex items-center gap-2 pl-3 ml-1 border-l border-[#e8edf8] dark:border-white/10">
          <div className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8] leading-tight">
            ລູກທີ 3<br />ຄວນຫຼີກ
          </div>
          <SymBall sym={symOf[pair.third]} size={40} dim />
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <span
          className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg"
          style={{ background: ACCENT + '14', color: ACCENT }}
        >
          ໂອກາດບໍ່ອອກທັງສອງ (ຈາກຄວາມແຮງລູກ) ≈ {Math.round(pair.noneProb * 100)}%
        </span>
        <span
          className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg"
          style={{
            background: noneUp ? '#6366f11f' : '#64748b14',
            color: noneUp ? ACCENT : '#64748b',
          }}
          title={`ຄູ່ນີ້ບໍ່ອອກເລີຍ ${backtest.pctNone}% ທຽບກັບ ຄ່າສະເລ່ຍ ${BASE_NONE_PCT}% (${backtest.n} ງວດຫຼ້າສຸດ)`}
        >
          {noneUp ? '▲ ບໍ່ອອກເລີຍ ຖີ່ກວ່າຄ່າສະເລ່ຍ' : '▼ ບໍ່ອອກເລີຍ ໜ້ອຍກວ່າຄ່າສະເລ່ຍ'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl p-2.5 text-center" style={{ background: '#6366f110', border: '1px solid #6366f130' }}>
          <p className="text-xl font-black tabular-nums" style={{ color: ACCENT }}>{backtest.none}<span className="text-xs opacity-60">/{backtest.n}</span></p>
          <p className="text-[9px] font-bold mt-0.5" style={{ color: ACCENT, opacity: 0.8 }}>ບໍ່ອອກເລີຍ · {backtest.pctNone}%</p>
          <p className="text-[9px] font-black mt-0.5" style={{ color: noneUp ? ACCENT : '#94a3b8' }}>
            {noneUp ? '▲' : '▼'} ສະເລ່ຍ ~{BASE_NONE_PCT}%
          </p>
        </div>
        <div className="rounded-xl p-2.5 text-center" style={{ background: '#0ea5e910', border: '1px solid #0ea5e930' }}>
          <p className="text-xl font-black text-[#0ea5e9] tabular-nums">{backtest.notBoth}<span className="text-xs text-[#0ea5e9]/60">/{backtest.n}</span></p>
          <p className="text-[9px] font-bold text-[#0ea5e9]/80 mt-0.5">ບໍ່ອອກພ້ອມກັນ · {backtest.pctNotBoth}%</p>
          <p className="text-[9px] font-black mt-0.5" style={{ color: notBothUp ? '#0284c7' : '#94a3b8' }}>
            {notBothUp ? '▲' : '▼'} ສະເລ່ຍ ~{BASE_NOTBOTH_PCT}%
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PuplataoAvoidPage() {
  const [draws, setDraws]     = useState([])
  const [symbols, setSymbols] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [rD, rS] = await Promise.all([
        fetch(`${API}?r=draws`),
        fetch(`${API}?r=symbols`),
      ])
      if (rD.ok) setDraws(await rD.json())
      if (rS.ok) setSymbols(await rS.json())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const hazard = useMemo(() => buildHazardModel(draws, symbols), [draws, symbols])
  const result = useMemo(() => buildAvoidPairPredictions(draws, symbols, hazard), [draws, symbols, hazard])
  const monteCarlo = useMemo(() => buildMonteCarlo(draws, symbols), [draws, symbols])
  const backtest = useMemo(() => backtestFormula(draws, symbols), [draws, symbols])
  const symById = useMemo(() => {
    const m = {}
    symbols.forEach(s => { m[s.symbol_id] = s })
    return m
  }, [symbols])

  const aiPayload = useMemo(() => {
    if (!result) return null
    return {
      totalDraws: result.totalDraws,
      backtestN: result.backtestN,
      pairs: result.top.map((p, i) => ({
        rank: i + 1,
        a: result.symOf[p.a]?.name_lo,
        b: result.symOf[p.b]?.name_lo,
        third: result.symOf[p.third]?.name_lo,
        scorePct: Math.round(p.score * 100),
        nonePctModel: Math.round(p.noneProb * 100),
        backtest: p.backtest,
      })),
      symbolRanked: result.symbolRanked.map((r, i) => ({
        rank: i + 1, name: r.sym.name_lo,
        absentPct: Math.round(r.prob * 100), scorePct: Math.round(r.score * 100),
      })),
      formulaBacktest: backtest && backtest.n > 0 ? {
        testedDraws: backtest.n,
        rankNoneHits: backtest.none,
        rankNotBothHits: backtest.notBoth,
        allRankNoneHits: backtest.allNone,
        baseNonePct: Math.round(backtest.baseNone * 100),
        // ໄລ່ຈາກໃໝ່ → ເກົ່າ; ຕໍ່ 1 ງວດ = [ຄູ່1, ຄູ່2, ຄູ່3], 2=ບໍ່ອອກເລີຍ 1=ອອກ 1 ໜ່ວຍ 0=ອອກທັງຄູ່
        recentDraws: backtest.rows.slice(0, 15).map(r => ({
          draw_no: r.draw_no,
          ranks: r.rankHits.map(h => (h.none ? 2 : h.notBoth ? 1 : 0)),
        })),
      } : null,
      hazard: hazard ? {
        informative: hazard.informative,
        chi2: Math.round(hazard.chi2 * 10) / 10,
        df: hazard.df,
        basePct: Math.round(hazard.pObs * 100),
        slopePP: Math.round(hazard.slope * 1000) / 10,
      } : null,
      monteCarlo: monteCarlo ? {
        iters: monteCarlo.iters,
        window: monteCarlo.window,
        topSymbols: monteCarlo.symbolProb.slice(0, 3).map(r => ({
          name: r.sym?.name_lo, pct: Math.round(r.prob * 100),
        })),
        topPairs: monteCarlo.topPairs.map(p => ({
          a: monteCarlo.symOf[p.a]?.name_lo,
          b: monteCarlo.symOf[p.b]?.name_lo,
          pct: Math.round(p.none * 100),
        })),
      } : null,
      brier: backtest && backtest.n > 0 && backtest.brierSymbol != null ? {
        skillPct: Math.round(backtest.brierSkill * 100),
        model: Math.round(backtest.brierSymbol * 1000) / 1000,
        base: Math.round(backtest.brierSymbolBase * 1000) / 1000,
      } : null,
    }
  }, [result, backtest, hazard, monteCarlo])

  // ── ຂໍ້ມູນດິບ ສຳລັບ AI ວິເຄາະ "ດ້ານທີ່ບໍ່ອອກ" ດ້ວຍຕົນເອງ ──
  const behaviorPayload = useMemo(() => {
    if (!draws.length || !symbols.length) return null
    const dowOf = (s) => {
      const d = (s || '').slice(0, 10)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return ''
      const dt = new Date(`${d}T00:00:00`)
      return Number.isNaN(dt.getTime()) ? '' : DOW_LO[dt.getDay()]
    }
    return {
      totalDraws: draws.length,
      symbols: symbols.map(s => ({ id: s.symbol_id, name_lo: s.name_lo, emoji: s.emoji })),
      recentDraws: draws.slice(0, BEHAVIOR_WINDOW).map(d => ({
        n: d.draw_no,
        at: (d.draw_at || '').slice(0, 16),
        dow: dowOf(d.draw_date || d.draw_at),
        s: [d.pos1, d.pos2, d.pos3],
      })),
    }
  }, [draws, symbols])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <AlertCircle size={30} className="text-red-400" />
        </div>
        <div className="text-center">
          <p className="font-black text-lg text-[#0f172a] dark:text-[#f1f5f9]">ໂຫຼດຂໍ້ມູນບໍ່ໄດ້</p>
          <p className="text-sm text-[#64748b] mt-1">ກວດສອບການເຊື່ອມຕໍ່ ແລ້ວລອງໃໝ່</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff' }}
        >
          <RefreshCw size={14} /> ລອງໃໝ່
        </button>
      </div>
    )
  }

  const CARD = 'bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5'

  return (
    <div className="space-y-7 pb-16">
      {/* ── Header ── */}
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,#3b82f6 0%,#6366f1 50%,#8b5cf6 100%)', boxShadow: '0 0 24px rgba(99,102,241,0.3)' }}
        >
          <ShieldOff size={26} color="#fff" />
        </div>
        <div>
          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight leading-tight"
            style={{
              background: 'linear-gradient(135deg,#3b82f6 0%,#6366f1 45%,#8b5cf6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}
          >
            ຄູ່ລູກ ທີ່ຄວນຫຼີກ ງວດຖັດໄປ
          </h1>
          <p className="text-sm text-[#94a3b8]">ສູດຄິດກົງກັນຂ້າມ — 3 ຄູ່ລູກ ທີ່ໂອກາດອອກໜ້ອຍສຸດ ຈາກສະຖິຕິ {draws.length} ງວດ</p>
        </div>
      </div>

      {/* ── ສະຫຼັບກັບໄປສູດປົກກະຕິ ── */}
      <Link
        to="/puplatao/next"
        className="flex items-center justify-between gap-3 rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
        style={{ background: 'linear-gradient(135deg,#ef444422,#f9731618)', border: '1px solid #f9731644' }}
      >
        <span className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#f9731626' }}>
            <Target size={17} className="text-[#f97316]" />
          </span>
          <span className="text-sm font-bold text-[#334155] dark:text-[#e2e8f0]">
            ກັບໄປສູດປົກກະຕິ — 3 ຄູ່ລູກ ທີ່ໜ້າອອກ ງວດຖັດໄປ
          </span>
        </span>
        <ArrowRight size={16} className="text-[#f97316] shrink-0" />
      </Link>

      {/* ── Disclaimer ── */}
      <div className="flex gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-4">
        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
          <strong>ໝາຍເຫດ:</strong> ຄູ່ລູກຂ້າງລຸ່ມນີ້ຄິດຈາກສະຖິຕິຍ້ອນຫຼັງເທົ່ານັ້ນ — ການອອກລູກແຕ່ລະງວດເປັນເອກະລາດ <strong>ບໍ່ສາມາດທຳນາຍ</strong>ໄດ້ ແລະ "ຄູ່ຄວນຫຼີກ" ກໍຍັງມີໂອກາດອອກໄດ້ທຸກງວດ.
        </p>
      </div>

      {/* ── Insufficient data ── */}
      {!loading && result && result.totalDraws < 10 && (
        <div className="flex gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-700/30 rounded-2xl p-4">
          <Info size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-800 dark:text-red-400 leading-relaxed">
            ຂໍ້ມູນປະຫວັດຍັງໜ້ອຍ ({result.totalDraws} ງວດ) — ຄູ່ລູກທີ່ຄວນຫຼີກອາດປ່ຽນແປງໄວເມື່ອມີຂໍ້ມູນເພີ່ມ.
          </p>
        </div>
      )}

      {/* ── Methodology ── */}
      <div className={CARD}>
        <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-2 flex items-center gap-2">
          <Layers size={14} style={{ color: ACCENT }} /> ວິທີຄິດໄລ່ (ກັບຫົວທຸກເທີມ)
        </h3>
        <div className="space-y-1.5 text-xs text-[#64748b] leading-relaxed">
          <p><strong style={{ color: ACCENT }}>ຄວາມເຢັນລູກ C</strong> = 55% (1 − ຄວາມຖີ່ 20 ງວດຫຼ້າສຸດ ຖ່ວງນ້ຳໜັກງວດໃໝ່ + ປັບ Bayesian ໃຫ້ດຶງເຂົ້າຫາ 1/6) + 45% (1 − ລູກຄ້າງ) — ລູກທີ່ອອກເລື້ອຍ ຫຼື ຄ້າງດົນ ຈະ<strong>ບໍ່</strong>ຖືກເລືອກ.</p>
          <p><strong style={{ color: '#0ea5e9' }}>ຄະແນນຄວນຫຼີກ A(a,b)</strong> = 40% ຄວາມເຢັນລູກສະເລ່ຍ + 35% (1 − ຄວາມຖີ່ອອກຄູ່ນຳກັນ ທັງໝົດ) + 25% (1 − ຄວາມຖີ່ອອກຄູ່ນຳກັນ 15 ງວດຫຼ້າສຸດ). ຈັດອັນດັບ 15 ຄູ່ → ເອົາ 3 ຄູ່ທີ່ <strong>ໜ້າອອກໜ້ອຍສຸດ</strong>.</p>
          <p><strong>ລູກທີ 3 ຄວນຫຼີກ</strong> = ລູກທີ່ຄວາມເຢັນ C ສູງສຸດ ໃນ 4 ລູກທີ່ເຫຼືອ.</p>
          <p><strong style={{ color: '#8b5cf6' }}>ໂອກາດບໍ່ອອກ %</strong> = ແປງຄວາມແຮງ S ເປັນສ່ວນແບ່ງການເລືອກຕໍ່ໜ່ວຍ (q, ລວມ = 100%) → P(ບໍ່ອອກເລີຍ ໃນ 3 ໜ່ວຍ) = (1 − q)³. ຄູ່ = (1 − qₐ − q_b)³. ເສັ້ນຖານສະເໝີພາບ ≈ 58% (ລູກດຽວ) / {BASE_NONE_PCT}% (ຄູ່).</p>
        </div>
      </div>

      {/* ── AI: ອະທິບາຍສູດ ── */}
      {!loading && aiPayload && (
        <AiSummaryCard
          context="puplataoavoid"
          title="AI ອະທິບາຍ 3 ຄູ່ລູກ ທີ່ຄວນຫຼີກ"
          hint="ໃຫ້ Claude AI ອ່ານສູດກັບຫົວ + ຜົນ backtest ຂອງແຕ່ລະຄູ່ ແລ້ວອະທິບາຍເປັນພາສາລາວ"
          payload={aiPayload}
        />
      )}

      {/* ── AI: ອ່ານພຶດຕິກຳ ດ້ານທີ່ບໍ່ອອກ ── */}
      {!loading && behaviorPayload && (
        <AiSummaryCard
          context="puplataoavoidbehavior"
          title="AI ອ່ານພຶດຕິກຳ 'ລູກທີ່ຫາຍ' (ວິເຄາະອິດສະຫຼະ)"
          hint={`ໃຫ້ Claude AI ອ່ານລຳດັບຜົນອອກ ${BEHAVIOR_WINDOW} ງວດຫຼ້າສຸດ (ບໍ່ມີສະຖິຕິຄິດໄວ້) ແລ້ວສັງເກດ ລູກທີ່ຫາຍໄປ · ຄູ່ທີ່ບໍ່ເຄີຍມາພ້ອມກັນ · ຊ່ວງເງົາ ດ້ວຍຕົນເອງ ພ້ອມບອກຄູ່ທີ່ຄວນຫຼີກງວດຖັດໄປ`}
          payload={behaviorPayload}
        />
      )}

      {/* ── Pairs ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-52 bg-[#f1f5f9] dark:bg-[#0c1426] rounded-2xl animate-pulse border border-[#e8edf8] dark:border-white/4" />
          ))}
        </div>
      ) : result ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {result.top.map((p, i) => (
              <AvoidPairCard key={`${p.a}-${p.b}`} pair={{ ...p, rank: i + 1 }} symOf={result.symOf} />
            ))}
          </div>

          {/* ── ຍ້ອນເບິ່ງ: ສູດຫຼີກນີ້ ຫຼີກຖືກຈັກຄັ້ງ ── */}
          {backtest && backtest.n > 0 && (
            <div className={CARD}>
              <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-1 flex items-center gap-2">
                <History size={14} style={{ color: ACCENT }} /> ຍ້ອນເບິ່ງ: ສູດຫຼີກນີ້ ຫຼີກຖືກຈັກຄັ້ງ
              </h3>
              <p className="text-xs text-[#94a3b8] mb-4">
                ທົດສອບກັບ {backtest.n} ງວດຫຼ້າສຸດ — ແຕ່ລະງວດຄິດສູດໃໝ່ ໂດຍໃຊ້ພຽງຂໍ້ມູນກ່ອນໜ້າ
              </p>
              <div className="space-y-2.5">
                {[0, 1, 2].map(i => {
                  const b = backtest.none[i]
                  const e = backtest.notBoth[i]
                  const m = RANK_META[i]
                  const ci = backtest.wilsonNone ? backtest.wilsonNone[i] : null
                  return (
                    <div key={i} className="flex items-center gap-3 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black shrink-0"
                        style={{ background: m.bg, color: m.color, boxShadow: `0 2px 8px ${m.shadow}` }}
                      >
                        {i === 0 && <Ban size={11} />} ຄູ່ຫຼີກທີ {i + 1}
                      </span>
                      <span className="text-sm tabular-nums">
                        <b style={{ color: ACCENT }}>{b}/{backtest.n}</b>
                        <span className="text-xs text-[#94a3b8]">
                          {' '}ບໍ່ອອກເລີຍ · {Math.round((b / backtest.n) * 100)}%
                          {ci && (
                            <span className="text-[#cbd5e1] dark:text-[#475569]">
                              {' '}(CI {Math.round(ci[0] * 100)}–{Math.round(ci[1] * 100)}%)
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="text-sm tabular-nums ml-auto">
                        <b className="text-[#0ea5e9]">{e}/{backtest.n}</b>
                        <span className="text-xs text-[#94a3b8]"> ບໍ່ອອກພ້ອມກັນ · {Math.round((e / backtest.n) * 100)}%</span>
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-[#eef2f9] dark:border-white/5 flex items-center justify-between">
                <span className="text-sm font-bold text-[#334155] dark:text-[#e2e8f0]">ທັງ 3 ຄູ່ ບໍ່ອອກເລີຍ ພ້ອມກັນ</span>
                <span className="text-sm font-black tabular-nums" style={{ color: ACCENT }}>
                  {backtest.allNone}/{backtest.n} · {Math.round((backtest.allNone / backtest.n) * 100)}%
                  {backtest.wilsonAll && (
                    <span className="text-xs font-normal text-[#94a3b8]">
                      {' '}(CI {Math.round(backtest.wilsonAll[0] * 100)}–{Math.round(backtest.wilsonAll[1] * 100)}%)
                    </span>
                  )}
                </span>
              </div>

              {backtest.brierSymbol != null && (
                <div className="mt-3 pt-3 border-t border-[#eef2f9] dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#334155] dark:text-[#e2e8f0]">ຄວາມແມ່ນຍຳຂອງ % (Brier skill)</span>
                    <span
                      className="text-sm font-black tabular-nums"
                      style={{ color: backtest.brierSkill > 0 ? ACCENT : '#dc2626' }}
                    >
                      {backtest.brierSkill > 0 ? '+' : ''}{Math.round(backtest.brierSkill * 100)}%
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#94a3b8] leading-relaxed">
                    Brier ສູດ = {backtest.brierSymbol.toFixed(3)} · ທາຍມົ້ວ ({Math.round(SYM_ABSENT_BASE * 100)}%) = {backtest.brierSymbolBase.toFixed(3)} —{' '}
                    ຄ່າ skill ບວກ = ໂອກາດ "ບໍ່ອອກ" ທີ່ບອກ ແມ່ນຍຳກວ່າການເດົາແບບຄົງທີ່
                  </p>
                </div>
              )}

              {/* ── ລາຍລະອຽດ: ງວດຜ່ານມາ ຄູ່ຫຼີກ 1/2/3 ຫຼີກຖືກ ຫຼື ບໍ່ ── */}
              {backtest.rows.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8] mb-2">ລາຍລະອຽດ ແຕ່ລະງວດ (ໃໝ່ → ເກົ່າ)</p>
                  <div className="max-h-80 overflow-y-auto -mx-1 px-1">
                    {backtest.rows.map(row => (
                      <div
                        key={row.draw_no}
                        className="flex items-center gap-2 flex-wrap py-1.5 border-b border-[#f1f5f9] dark:border-white/5 last:border-0"
                      >
                        <span className="text-[11px] tabular-nums text-[#64748b] w-[124px] shrink-0">
                          ງວດ {row.draw_no}
                          <span className="text-[#cbd5e1] dark:text-[#475569]"> · {row.draw_at?.slice(11, 16)}</span>
                        </span>
                        <span className="flex items-center gap-0.5 shrink-0">
                          {row.actual.map((id, i) => <SymBall key={i} sym={symById[id]} size={22} />)}
                        </span>
                        <span className="flex items-center gap-1 ml-auto">
                          {row.rankHits.map((h, i) => {
                            const st = h.none
                              ? { c: ACCENT, bg: '#6366f11f', t: '✓' }
                              : h.notBoth
                                ? { c: '#0284c7', bg: '#0ea5e91f', t: '~' }
                                : { c: '#94a3b8', bg: '#64748b12', t: '✗' }
                            return (
                              <span
                                key={i}
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black tabular-nums"
                                style={{ background: st.bg, color: st.c }}
                                title={`ຄູ່ຫຼີກທີ ${i + 1}: ${symById[h.pair[0]]?.name_lo} + ${symById[h.pair[1]]?.name_lo}`}
                              >
                                {i + 1}{st.t}
                              </span>
                            )
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-3 text-[11px] text-[#94a3b8] leading-relaxed">
                <b style={{ color: ACCENT }}>✓</b> ບໍ່ອອກເລີຍ (ຫຼີກຖືກ) · <b style={{ color: '#0284c7' }}>~</b> ອອກ 1 ໜ່ວຍ · <b>✗</b> ອອກທັງຄູ່ (ຫຼີກຜິດ) ·
                ເສັ້ນຖານສຸ່ມ (ທາຍມົ້ວ): ບໍ່ອອກເລີຍ ≈ {Math.round(backtest.baseNone * 100)}% · ບໍ່ອອກພ້ອມກັນ ≈ {Math.round(backtest.baseNotBoth * 100)}% —
                ຖ້າ % ຂ້າງເທິງ ສູງກວ່ານີ້ ແປວ່າ ສູດຫຼີກພໍມີປະໂຫຍດ
              </p>
            </div>
          )}

          {/* Symbol coldness ranking */}
          <div className={CARD}>
            <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-4 flex items-center gap-2">
              <TrendingDown size={14} style={{ color: ACCENT }} /> ອັນດັບລູກ · ໂອກາດ "ບໍ່ອອກ" ງວດຖັດໄປ
            </h3>
            <div className="space-y-2">
              {result.symbolRanked.map((r, i) => {
                const c = SYM_COLOR[r.id] || '#64748b'
                const maxProb = result.symbolRanked[0].prob || 1
                return (
                  <div key={r.id} className="flex items-center gap-3">
                    <span className="text-xs font-black text-[#94a3b8] w-5 tabular-nums">{i + 1}</span>
                    <SymBall sym={r.sym} size={30} dim />
                    <span className="text-sm font-semibold text-[#334155] dark:text-[#cbd5e1] w-16">{r.sym.name_lo}</span>
                    <div className="flex-1 h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.round((r.prob / maxProb) * 100)}%`, background: c }} />
                    </div>
                    <span className="text-xs tabular-nums text-[#64748b] w-9 text-right">{Math.round(r.prob * 100)}%</span>
                  </div>
                )
              })}
            </div>
            <p className="mt-3 text-[11px] text-[#94a3b8]">ເສັ້ນຖານສະເໝີພາບ ≈ 58% ຕໍ່ລູກ · ແຖບ = ທຽບກັບລູກທີ່ເຢັນສຸດ</p>
          </div>

          {/* ── Monte-Carlo (ດ້ານບໍ່ອອກ) ── */}
          {monteCarlo && (
            <div className={CARD}>
              <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-1 flex items-center gap-2">
                <Shuffle size={14} style={{ color: ACCENT }} /> Monte-Carlo — ຈຳລອງ {monteCarlo.iters.toLocaleString()} ງວດ
              </h3>
              <p className="text-xs text-[#94a3b8] mb-4">
                ສ້າງ P(ລູກ | ໜ່ວຍ 1/2/3) ຈາກ {monteCarlo.window} ງວດຫຼ້າສຸດ ແລ້ວສຸ່ມ 3 ໜ່ວຍ — ອ່ານວ່າລູກໃດ "ບໍ່ໂຜ່ນ" ຫຼາຍສຸດ
              </p>
              <div className="space-y-2">
                {monteCarlo.symbolProb.map((r, i) => {
                  const c = SYM_COLOR[r.symbol_id] || '#64748b'
                  const maxP = monteCarlo.symbolProb[0].prob || 1
                  return (
                    <div key={r.symbol_id} className="flex items-center gap-3">
                      <span className="text-xs font-black text-[#94a3b8] w-5 tabular-nums">{i + 1}</span>
                      <SymBall sym={r.sym} size={28} dim />
                      <span className="text-sm font-semibold text-[#334155] dark:text-[#cbd5e1] w-16">{r.sym?.name_lo}</span>
                      <div className="flex-1 h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.round((r.prob / maxP) * 100)}%`, background: c }} />
                      </div>
                      <span className="text-xs tabular-nums text-[#64748b] w-9 text-right">{Math.round(r.prob * 100)}%</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-[#eef2f9] dark:border-white/5">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8] mb-2">3 ຄູ່ ທີ່ຈຳລອງແລ້ວ ບໍ່ອອກເລີຍ ຫຼາຍສຸດ</p>
                <div className="flex flex-wrap gap-2">
                  {monteCarlo.topPairs.map((p, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-[#f8fafc] dark:bg-white/5 rounded-lg px-2 py-1">
                      <SymBall sym={monteCarlo.symOf[p.a]} size={22} dim />
                      <SymBall sym={monteCarlo.symOf[p.b]} size={22} dim />
                      <span className="text-xs font-bold tabular-nums" style={{ color: ACCENT }}>{Math.round(p.none * 100)}%</span>
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-[11px] text-[#94a3b8] leading-relaxed">
                ໂມເດລນີ້ຖືວ່າ 3 ໜ່ວຍ ອິດສະຫຼະກັນ — ໃຊ້ທຽບກັບສູດຫຼີກຂ້າງເທິງ, ຖ້າຜົນກົງກັນ ຄວາມໝັ້ນໃຈສູງຂຶ້ນ.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
            <TrendingDown size={13} />
            Backtest ຄິດຈາກ {result.backtestN} ງວດຫຼ້າສຸດ · ອັບເດດອັດຕະໂນມັດເມື່ອມີຜົນງວດໃໝ່
          </div>
        </>
      ) : (
        <div className={CARD}>
          <p className="text-sm text-[#64748b] text-center py-8">ຍັງບໍ່ມີຂໍ້ມູນປະຫວັດ — ກະລຸນາເພີ່ມຜົນງວດຢູ່ໜ້າ Admin ກ່ອນ</p>
        </div>
      )}
    </div>
  )
}
