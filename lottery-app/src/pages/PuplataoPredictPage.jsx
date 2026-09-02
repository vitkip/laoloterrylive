import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  AlertCircle, RefreshCw, Target, TrendingUp, Layers, Crown, Info, Plus, History,
  Activity, Shuffle,
} from 'lucide-react'
import { API as API_BASE } from '../utils/api'
import AiSummaryCard from '../components/AiSummaryCard'

const API = `${API_BASE}/puplatao.php`

const SYM_COLOR = {
  1: '#22c55e', 2: '#f97316', 3: '#3b82f6', 4: '#ec4899', 5: '#eab308', 6: '#ef4444',
}

const RANK_META = [
  { bg: 'linear-gradient(135deg,#ef4444 0%,#f97316 50%,#eab308 100%)', color: '#fff', shadow: 'rgba(239,68,68,0.4)' },
  { bg: 'linear-gradient(135deg,#f97316 0%,#fb923c 50%,#ea580c 100%)', color: '#fff', shadow: 'rgba(249,115,22,0.35)' },
  { bg: 'linear-gradient(135deg,#eab308 0%,#facc15 50%,#ca8a04 100%)', color: '#1a1205', shadow: 'rgba(234,179,8,0.35)' },
]

// ເສັ້ນຖານ "ທາຍມົ້ວ" (ລູກ 6 · 3 ໜ່ວຍ/ງວດ)
const BASE_BOTH_PCT   = Math.round((1 - 2 * Math.pow(5 / 6, 3) + Math.pow(4 / 6, 3)) * 100) // ≈ 14
const BASE_EITHER_PCT = Math.round((1 - Math.pow(4 / 6, 3)) * 100)                           // ≈ 70

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

// ── ຄ່າຄົງທີ່ ສຳລັບໂມເດລໃໝ່ ─────────────────────────────────────────
const BAYES_ALPHA     = 1.5                    // Beta–Binomial prior strength (prior mean = 1/6)
const HAZARD_MAX_G    = 14                     // gap ≥ ຄ່ານີ້ ລວມເປັນ bucket ດຽວ
const HAZARD_MIN_N    = 5                      // ຕ້ອງ reached ≥ ຄ່ານີ້ ຈຶ່ງເອົາ bucket ມາ test
const MC_ITERS        = 10000
const MC_WINDOW       = 30                     // ຈຳນວນງວດຫຼ້າສຸດ ທີ່ໃຊ້ສ້າງ per-slot dist
const SYM_APPEAR_BASE = 1 - Math.pow(5 / 6, 3) // ≈ 0.4213 — ໂອກາດ 1 ລູກ ອອກ/ງວດ (ສະເໝີພາບ)

// ── ສູດຄິດ 3 ຄູ່ລູກ ສຳລັບງວດຖັດໄປ ────────────────────────────────
// S(ລູກ)  = 0.55 · ຄວາມຖີ່ 20 ງວດຫຼ້າສຸດ (recency-weighted)
//         + 0.45 · overdue (ຄ້າງມາແລ້ວກີ່ງວດ / ຄ້າງຫຼາຍສຸດ)
// P(a,b)  = 0.40 · ຄວາມແຮງລູກສະເລ່ຍ (S)
//         + 0.35 · ຄວາມຖີ່ອອກຄູ່ນຳກັນ (ທັງໝົດ)
//         + 0.25 · ຄວາມຖີ່ອອກຄູ່ນຳກັນ (15 ງວດຫຼ້າສຸດ)
// backtest: ນັບຍ້ອນຫຼັງ 60 ງວດ ວ່າ 2 ລູກນີ້ອອກພ້ອມກັນ / ຢ່າງໜ້ອຍ 1 ໜ່ວຍ ຈັກງວດ
function buildPairPredictions(draws, symbols, hazard = null) {
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

  // #2 Bayesian shrinkage — ໂອກາດອອກ/ໜ່ວຍ ຈາກ Beta–Binomial posterior
  //    pHat = (weightedHits + α) / (weightedSlots + 6α); prior mean = 1/6.
  //    ຂໍ້ມູນຍັງໜ້ອຍ → ຄ່າຖືກດຶງເຂົ້າຫາ 1/6 ອັດຕະໂນມັດ (ຫຼຸດ overfit).
  const effSlots = (3 * (N + 1)) / 2 // Σ recency-weights × 3 ໜ່ວຍ
  const pHat = {}
  const seHat = {}
  ID.forEach(i => {
    const denom = effSlots + BAYES_ALPHA * ID.length
    pHat[i] = (rec[i] + BAYES_ALPHA) / denom
    seHat[i] = Math.sqrt((pHat[i] * (1 - pHat[i])) / denom)
  })
  const normRec = normMinMax(pHat)

  // #4 gap term — ໃຊ້ hazard ຈາກໂມເດລ survival ເມື່ອ gap ມີສັນຍານ (χ² p<0.05),
  //    ບໍ່ດັ່ງນັ້ນ fallback ໄປໃຊ້ອັດຕາຄ້າງແບບເສັ້ນຊື່ (ຄືເກົ່າ).
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

  const S = {}
  ID.forEach(i => { S[i] = 0.55 * normRec[i] + 0.45 * normGap[i] })
  const normS = normalize(S)

  // #9 ແປງຄະແນນ S → ຄວາມໜ້າຈະເປັນ % ຈິງ
  // q = ສ່ວນແບ່ງການເລືອກ ຕໍ່ 1 ໜ່ວຍ ( Σq = 1); ລູກ 3 ໜ່ວຍ/ງວດ
  const sumS = ID.reduce((s, i) => s + S[i], 0)
  const q = {}
  ID.forEach(i => { q[i] = sumS > 0 ? S[i] / sumS : 1 / ID.length })
  const probAppear = {}
  ID.forEach(i => { probAppear[i] = 1 - Math.pow(1 - q[i], 3) })

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
      const symPart = (normS[a] + normS[b]) / 2
      const score = 0.40 * symPart + 0.35 * nCo[key] + 0.25 * nCoR[key]
      const third = ID.filter(x => x !== a && x !== b).sort((x, y) => S[y] - S[x])[0]
      // P(ອອກທັງ a ແລະ b ໃນ 3 ໜ່ວຍ) / P(ອອກຢ່າງໜ້ອຍ 1 ໃນ 2 ລູກ)
      const rAB = Math.max(0, 1 - q[a] - q[b])
      const pairProb = Math.max(0, Math.min(1,
        1 - Math.pow(1 - q[a], 3) - Math.pow(1 - q[b], 3) + Math.pow(rAB, 3)))
      const eitherProb = 1 - Math.pow(rAB, 3)
      pairs.push({ a, b, third, score, pairProb, eitherProb })
    }
  }
  pairs.sort((x, y) => y.score - x.score)
  const top = pairs.slice(0, 3)

  const bt = draws.slice(0, Math.min(60, n))
  top.forEach(p => {
    let both = 0; let either = 0
    bt.forEach(d => {
      const set = new Set([d.pos1, d.pos2, d.pos3])
      const hasA = set.has(p.a); const hasB = set.has(p.b)
      if (hasA && hasB) both++
      if (hasA || hasB) either++
    })
    p.backtest = {
      n: bt.length, both, either,
      pctBoth: bt.length ? Math.round((both / bt.length) * 100) : 0,
      pctEither: bt.length ? Math.round((either / bt.length) * 100) : 0,
    }
  })

  const symbolRanked = ID
    .map(i => ({
      id: i, sym: symOf[i], score: normS[i], prob: probAppear[i],
      perSlotProb: pHat[i],
      perSlotCI: [Math.max(0, pHat[i] - 1.96 * seHat[i]), Math.min(1, pHat[i] + 1.96 * seHat[i])],
    }))
    .sort((a, b) => b.prob - a.prob)

  return { top, symbolRanked, totalDraws: n, backtestN: bt.length, symOf, hazardUsed: useHazard }
}

// ── #10 Hazard / survival ຕາມ gap ──────────────────────────────────
// "ຄ້າງມາ g ງວດແລ້ວ ໂອກາດອອກງວດນີ້ເທົ່າໃດ?" — χ² homogeneity ທຽບ memoryless.
// ຖ້າ hazard ບໍ່ຂຶ້ນກັບ g (ຄົງທີ່) → overdue ບໍ່ມີຄວາມໝາຍ; ຖ້າ hazard ຂຶ້ນຕາມ g → ມີ.
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

// ── #6 Monte-Carlo: per-slot multinomial (ຊ່ອງ 1/2/3 ອິດສະຫຼະ) ──────
// ສ້າງ P(ລູກ | ໜ່ວຍ k) ຈາກ MC_WINDOW ງວດຫຼ້າສຸດ (Laplace +1) → ສຸ່ມ MC_ITERS ຮອບ
// → ອ່ານໂອກາດ single / ຄູ່ / ຕອງ ໂດຍກົງ. seed ຄົງທີ່ຕໍ່ຈຳນວນງວດ.
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

  const appear = {}
  const triple = {}
  const co = {}
  ID.forEach(a => {
    appear[a] = 0; triple[a] = 0; co[a] = {}
    ID.forEach(b => { co[a][b] = 0 })
  })
  for (let it = 0; it < MC_ITERS; it++) {
    const s = [pick(0), pick(1), pick(2)]
    const uniq = [...new Set(s)]
    uniq.forEach(x => { appear[x]++ })
    if (s[0] === s[1] && s[1] === s[2]) triple[s[0]]++
    for (let i = 0; i < uniq.length; i++)
      for (let j = i + 1; j < uniq.length; j++) { co[uniq[i]][uniq[j]]++; co[uniq[j]][uniq[i]]++ }
  }

  const symbolProb = ID
    .map(i => ({ symbol_id: i, sym: symOf[i], prob: appear[i] / MC_ITERS, triple: triple[i] / MC_ITERS }))
    .sort((a, b) => b.prob - a.prob)
  const pairsMc = []
  for (let i = 0; i < K; i++)
    for (let j = i + 1; j < K; j++)
      pairsMc.push({ a: ID[i], b: ID[j], both: co[ID[i]][ID[j]] / MC_ITERS })
  pairsMc.sort((x, y) => y.both - x.both)

  return { iters: MC_ITERS, window: W, symbolProb, topPairs: pairsMc.slice(0, 3), symOf }
}

// ── ຍ້ອນເບິ່ງ: ສູດນີ້ (ຄູ່ທີ 1 / 2 / 3) ທາຍຖືກຈັກຄັ້ງໃນອະດີດ ────────
// ແຕ່ລະງວດຍ້ອນຫຼັງ k: ຄິດສູດໃໝ່ ໂດຍໃຊ້ພຽງງວດທີ່ເກົ່າກວ່າ k → ທຽບກັບຜົນຈິງ
const BT_WINDOW = 60   // ຈຳນວນງວດຫຼ້າສຸດທີ່ເອົາມາທົດສອບ
const BT_MIN_HIST = 12 // ຕ້ອງມີປະຫວັດຢ່າງໜ້ອຍເທົ່ານີ້ ຈຶ່ງຄິດສູດ

function backtestFormula(draws, symbols) {
  if (!symbols.length || draws.length < BT_MIN_HIST + 3) return null
  const both = [0, 0, 0]
  const either = [0, 0, 0]
  let n = 0
  let anyBoth = 0
  const rows = []
  // #9 Brier — ວັດວ່າ % ທີ່ສະແດງ ຄາລິເບຣດ ຖືກຕ້ອງພຽງໃດ (ຕ່ຳ = ດີ)
  const brierBoth = [0, 0, 0]
  let brierSym = 0
  let brierSymBase = 0
  let brierSymN = 0
  const limit = Math.min(BT_WINDOW, draws.length - BT_MIN_HIST)
  for (let k = 0; k < limit; k++) {
    const hist = draws.slice(k + 1)
    if (hist.length < BT_MIN_HIST) break
    const hz = buildHazardModel(hist, symbols) // null ⇒ buildPairPredictions ໃຊ້ gap ເສັ້ນຊື່
    const pred = buildPairPredictions(hist, symbols, hz)
    if (!pred || pred.top.length < 3) continue
    const actualArr = [draws[k].pos1, draws[k].pos2, draws[k].pos3].filter(Boolean)
    const actual = new Set(actualArr)
    n++
    let hitAny = false
    const rankHits = pred.top.map((p, i) => {
      const hasA = actual.has(p.a)
      const hasB = actual.has(p.b)
      if (hasA && hasB) { both[i]++; hitAny = true }
      if (hasA || hasB) either[i]++
      brierBoth[i] += Math.pow(p.pairProb - (hasA && hasB ? 1 : 0), 2)
      return { both: hasA && hasB, either: hasA || hasB, pair: [p.a, p.b] }
    })
    pred.symbolRanked.forEach(r => {
      const o = actual.has(r.id) ? 1 : 0
      brierSym += Math.pow(r.prob - o, 2)
      brierSymBase += Math.pow(SYM_APPEAR_BASE - o, 2)
      brierSymN++
    })
    if (hitAny) anyBoth++
    rows.push({ draw_no: draws[k].draw_no, draw_at: draws[k].draw_at, actual: actualArr, rankHits })
  }
  if (n === 0) return null
  const brierSymbol = brierSym / brierSymN
  const brierSymbolBase = brierSymBase / brierSymN
  return {
    n, both, either, anyBoth, rows,
    baseBoth: 1 - 2 * Math.pow(5 / 6, 3) + Math.pow(4 / 6, 3), // ≈ 0.139
    baseEither: 1 - Math.pow(4 / 6, 3),                        // ≈ 0.704
    // #9 calibration (ຕໍ່ລູກ — 6 ຈຸດ/ງວດ ⇒ ຕົວຢ່າງຫຼາຍ)
    brierSymbol,
    brierSymbolBase,
    brierSkill: brierSymbolBase > 0 ? 1 - brierSymbol / brierSymbolBase : 0,
    brierBoth: brierBoth.map(b => b / n),
    // #10 Wilson 95% CI ເທິງ hit-rate
    wilsonBoth: both.map(b => wilson(b, n)),
    wilsonEither: either.map(e => wilson(e, n)),
    wilsonAny: wilson(anyBoth, n),
  }
}

function SymBall({ sym, size = 52 }) {
  if (!sym) return null
  const c = SYM_COLOR[sym.symbol_id] || '#64748b'
  return (
    <span
      className="inline-flex items-center justify-center rounded-2xl shrink-0"
      style={{ width: size, height: size, background: c + '1f', border: `1.5px solid ${c}55` }}
      title={sym.name_lo}
    >
      <span style={{ fontSize: size * 0.5, lineHeight: 1 }}>{sym.emoji}</span>
    </span>
  )
}

function PairCard({ pair, symOf }) {
  const m = RANK_META[pair.rank - 1] || RANK_META[2]
  const { backtest } = pair
  const bothUp   = backtest.pctBoth   >= BASE_BOTH_PCT
  const eitherUp = backtest.pctEither >= BASE_EITHER_PCT
  return (
    <div className="bg-white dark:bg-[#0c1426] border border-[#e8edf8] dark:border-white/5 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black"
          style={{ background: m.bg, color: m.color, boxShadow: `0 2px 10px ${m.shadow}` }}
        >
          {pair.rank === 1 && <Crown size={12} />}
          ຄູ່ທີ {pair.rank}
        </span>
        <span className="text-[10px] text-[#94a3b8] tabular-nums">ຄະແນນຈັດອັນດັບ {Math.round(pair.score * 100)}%</span>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SymBall sym={symOf[pair.a]} />
        <Plus size={16} className="text-[#94a3b8]" />
        <SymBall sym={symOf[pair.b]} />
        <div className="flex items-center gap-2 pl-3 ml-1 border-l border-[#e8edf8] dark:border-white/10">
          <div className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8] leading-tight">
            ລູກທີ 3<br />ແນະນຳ
          </div>
          <SymBall sym={symOf[pair.third]} size={40} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <span
          className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg"
          style={{ background: '#f9731614', color: '#f97316' }}
        >
          ໂອກາດອອກທັງຄູ່ (ຈາກຄວາມແຮງລູກ) ≈ {Math.round(pair.pairProb * 100)}%
        </span>
        <span
          className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg"
          style={{
            background: bothUp ? '#22c55e1f' : '#64748b14',
            color: bothUp ? '#16a34a' : '#64748b',
          }}
          title={`ອອກຄູ່ນີ້ພ້ອມກັນ ${backtest.pctBoth}% ທຽບກັບ ຄ່າສະເລ່ຍ ${BASE_BOTH_PCT}% (${backtest.n} ງວດຫຼ້າສຸດ)`}
        >
          {bothUp ? '▲ ອອກຄູ່ນີ້ ສູງກວ່າຄ່າສະເລ່ຍ' : '▼ ອອກຄູ່ນີ້ ຕ່ຳກວ່າຄ່າສະເລ່ຍ'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl p-2.5 text-center" style={{ background: '#ef444410', border: '1px solid #ef444430' }}>
          <p className="text-xl font-black text-[#ef4444] tabular-nums">{backtest.both}<span className="text-xs text-[#ef4444]/60">/{backtest.n}</span></p>
          <p className="text-[9px] font-bold text-[#ef4444]/80 mt-0.5">ອອກພ້ອມກັນ · {backtest.pctBoth}%</p>
          <p className="text-[9px] font-black mt-0.5" style={{ color: bothUp ? '#16a34a' : '#94a3b8' }}>
            {bothUp ? '▲' : '▼'} ສະເລ່ຍ ~{BASE_BOTH_PCT}%
          </p>
        </div>
        <div className="rounded-xl p-2.5 text-center" style={{ background: '#f9731610', border: '1px solid #f9731630' }}>
          <p className="text-xl font-black text-[#f97316] tabular-nums">{backtest.either}<span className="text-xs text-[#f97316]/60">/{backtest.n}</span></p>
          <p className="text-[9px] font-bold text-[#f97316]/80 mt-0.5">ຢ່າງໜ້ອຍ 1 ໜ່ວຍ · {backtest.pctEither}%</p>
          <p className="text-[9px] font-black mt-0.5" style={{ color: eitherUp ? '#16a34a' : '#94a3b8' }}>
            {eitherUp ? '▲' : '▼'} ສະເລ່ຍ ~{BASE_EITHER_PCT}%
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PuplataoPredictPage() {
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
  const result = useMemo(() => buildPairPredictions(draws, symbols, hazard), [draws, symbols, hazard])
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
        pairProbPct: Math.round(p.pairProb * 100),
        backtest: p.backtest,
      })),
      symbolRanked: result.symbolRanked.map((r, i) => ({
        rank: i + 1, name: r.sym.name_lo,
        probPct: Math.round(r.prob * 100), scorePct: Math.round(r.score * 100),
      })),
      formulaBacktest: backtest && backtest.n > 0 ? {
        testedDraws: backtest.n,
        rankBothHits: backtest.both,
        rankEitherHits: backtest.either,
        anyRankBothHits: backtest.anyBoth,
        baseBothPct: Math.round(backtest.baseBoth * 100),
        // ໄລ່ຈາກໃໝ່ → ເກົ່າ; ຕໍ່ 1 ງວດ = [ຄູ່1, ຄູ່2, ຄູ່3], 2=ຖືກທັງຄູ່ 1=ໄດ້ 1 ໜ່ວຍ 0=ບໍ່ຖືກ
        recentDraws: backtest.rows.slice(0, 15).map(r => ({
          draw_no: r.draw_no,
          ranks: r.rankHits.map(h => (h.both ? 2 : h.either ? 1 : 0)),
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
          pct: Math.round(p.both * 100),
        })),
      } : null,
      brier: backtest && backtest.n > 0 && backtest.brierSymbol != null ? {
        skillPct: Math.round(backtest.brierSkill * 100),
        model: Math.round(backtest.brierSymbol * 1000) / 1000,
        base: Math.round(backtest.brierSymbolBase * 1000) / 1000,
      } : null,
    }
  }, [result, backtest, hazard, monteCarlo])

  // ── ຂໍ້ມູນດິບ ສຳລັບ AI ວິເຄາະພຶດຕິກຳ "ດ້ວຍຕົນເອງ" (ບໍ່ສົ່ງສະຖິຕິຄິດໄວ້) ──
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
          style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)', color: '#fff' }}
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
          style={{ background: 'linear-gradient(135deg,#ef4444 0%,#f97316 50%,#eab308 100%)', boxShadow: '0 0 24px rgba(239,68,68,0.3)' }}
        >
          <Target size={26} color="#fff" />
        </div>
        <div>
          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight leading-tight"
            style={{
              background: 'linear-gradient(135deg,#ef4444 0%,#f97316 45%,#eab308 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}
          >
            ຄູ່ລູກ ງວດຖັດໄປ
          </h1>
          <p className="text-sm text-[#94a3b8]">ສູດຄິດ 3 ຄູ່ລູກ ໂດຍປະມານ ຈາກສະຖິຕິ {draws.length} ງວດ</p>
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div className="flex gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-4">
        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
          <strong>ໝາຍເຫດ:</strong> ຄູ່ລູກຂ້າງລຸ່ມນີ້ຄິດຈາກສະຖິຕິຍ້ອນຫຼັງເທົ່ານັ້ນ — ການອອກລູກແຕ່ລະງວດເປັນເອກະລາດ <strong>ບໍ່ສາມາດທຳນາຍ</strong>ໄດ້ ແລະ ບໍ່ຮັບປະກັນຜົນ.
        </p>
      </div>

      {/* ── Insufficient data ── */}
      {!loading && result && result.totalDraws < 10 && (
        <div className="flex gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-700/30 rounded-2xl p-4">
          <Info size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-800 dark:text-red-400 leading-relaxed">
            ຂໍ້ມູນປະຫວັດຍັງໜ້ອຍ ({result.totalDraws} ງວດ) — ຄູ່ລູກທີ່ແນະນຳອາດປ່ຽນແປງໄວເມື່ອມີຂໍ້ມູນເພີ່ມ.
          </p>
        </div>
      )}

      {/* ── Methodology ── */}
      <div className={CARD}>
        <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-2 flex items-center gap-2">
          <Layers size={14} className="text-[#f97316]" /> ວິທີຄິດໄລ່
        </h3>
        <div className="space-y-1.5 text-xs text-[#64748b] leading-relaxed">
          <p><strong style={{ color: '#f97316' }}>ຄວາມແຮງລູກ S</strong> = 55% ຄວາມຖີ່ 20 ງວດຫຼ້າສຸດ (ຖ່ວງນ້ຳໜັກງວດໃໝ່ + ປັບແບບ Bayesian ໃຫ້ດຶງເຂົ້າຫາ 1/6 ຕອນຂໍ້ມູນໜ້ອຍ) + 45% ລູກຄ້າງ (overdue — ໃຊ້ຄ່າ hazard ຈາກໂມເດລ gap ຂ້າງລຸ່ມ ເມື່ອພົບວ່າ gap ມີສັນຍານ).</p>
          <p><strong style={{ color: '#ef4444' }}>ຄະແນນຄູ່ P(a,b)</strong> = 40% ຄວາມແຮງລູກສະເລ່ຍ + 35% ຄວາມຖີ່ອອກຄູ່ນຳກັນ (ທັງໝົດ) + 25% ຄວາມຖີ່ອອກຄູ່ນຳກັນ (15 ງວດຫຼ້າສຸດ). ຈັດອັນດັບ 15 ຄູ່ → ເອົາ 3 ຄູ່ເທິງສຸດ.</p>
          <p><strong>ລູກທີ 3 ແນະນຳ</strong> = ລູກທີ່ຄວາມແຮງ S ສູງສຸດ ໃນ 4 ລູກທີ່ເຫຼືອ (ເຜື່ອຢາກທາຍຄົບ 3 ໜ່ວຍ).</p>
          <p><strong style={{ color: '#22c55e' }}>ໂອກາດ %</strong> = ແປງ S ເປັນສ່ວນແບ່ງການເລືອກຕໍ່ໜ່ວຍ (q, ລວມ = 100%) → P(ອອກຢ່າງໜ້ອຍ 1 ໃນ 3 ໜ່ວຍ) = 1 − (1 − q)³. ຄູ່ = 1 − (1−qₐ)³ − (1−q_b)³ + (1−qₐ−q_b)³. ເສັ້ນຖານສະເໝີພາບ ≈ 42% (ລູກດຽວ) / 14% (ຄູ່).</p>
        </div>
      </div>

      {/* ── #10 ໂມເດລ gap / hazard ── */}
      {!loading && hazard && (
        <div className={CARD}>
          <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-1 flex items-center gap-2">
            <Activity size={14} className="text-[#f97316]" /> ໂມເດລ gap — “ຄ້າງແລ້ວ ໂອກາດອອກເພີ່ມບໍ?”
          </h3>
          <div
            className="my-3 rounded-xl px-3 py-2 text-xs font-semibold"
            style={{
              background: hazard.informative ? '#22c55e14' : '#64748b14',
              color: hazard.informative ? '#16a34a' : '#64748b',
            }}
          >
            χ² = {hazard.chi2.toFixed(1)} · df {hazard.df} —{' '}
            {hazard.informative
              ? 'gap ມີຜົນ (p < 0.05) → ສູດເອົາ hazard ມາຖ່ວງນ້ຳໜັກລູກຄ້າງ'
              : 'ບໍ່ມີໄນຍະ → ລູກຄ້າງ ບໍ່ໄດ້ເພີ່ມໂອກາດ (ສູດໃຊ້ອັດຕາຄ້າງແບບເສັ້ນຊື່)'}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8]">
                  <th className="text-left py-2">ຄ້າງ (ງວດ)</th>
                  <th className="text-center py-2">ຕົວຢ່າງ</th>
                  <th className="text-center py-2">ອອກ</th>
                  <th className="text-right py-2">ໂອກາດອອກ</th>
                </tr>
              </thead>
              <tbody>
                {hazard.rows.map(r => {
                  const up = r.hazard >= hazard.pObs
                  return (
                    <tr key={r.g} className="border-t border-[#eef2f9] dark:border-white/5">
                      <td className="py-2 tabular-nums text-[#334155] dark:text-[#cbd5e1]">
                        {r.g}{r.g >= HAZARD_MAX_G ? '+' : ''}
                      </td>
                      <td className="text-center tabular-nums text-[#64748b]">{r.reached}</td>
                      <td className="text-center tabular-nums text-[#64748b]">{r.hit}</td>
                      <td className="text-right tabular-nums font-bold" style={{ color: up ? '#16a34a' : '#dc2626' }}>
                        {Math.round(r.hazard * 100)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-[#94a3b8] leading-relaxed">
            ເສັ້ນຖານ (memoryless) ≈ {Math.round(hazard.pObs * 100)}% ທຸກແຖວ · ຄວາມຊັນ hazard ຕໍ່ງວດ ={' '}
            {(hazard.slope * 100).toFixed(2)} pp — {hazard.slope > 0 ? 'ຄ້າງດົນ = ໂອກາດເພີ່ມ' : 'ຄ້າງດົນ ບໍ່ໄດ້ຊ່ວຍ'}
          </p>
        </div>
      )}

      {/* ── AI: ອະທິບາຍສູດ ── */}
      {!loading && aiPayload && (
        <AiSummaryCard
          context="puplataopredict"
          title="AI ອະທິບາຍ 3 ຄູ່ລູກ ງວດຖັດໄປ"
          hint="ໃຫ້ Claude AI ອ່ານສູດ + ຜົນ backtest ຂອງແຕ່ລະຄູ່ ແລ້ວອະທິບາຍເປັນພາສາລາວ"
          payload={aiPayload}
        />
      )}

      {/* ── AI: ອ່ານພຶດຕິກຳ ດ້ວຍຕົນເອງ ── */}
      {!loading && behaviorPayload && (
        <AiSummaryCard
          context="puplataobehavior"
          title="AI ອ່ານພຶດຕິກຳການອອກ (ວິເຄາະອິດສະຫຼະ)"
          hint={`ໃຫ້ Claude AI ອ່ານລຳດັບຜົນອອກ ${BEHAVIOR_WINDOW} ງວດຫຼ້າສຸດ (ບໍ່ມີສະຖິຕິຄິດໄວ້) ແລ້ວສັງເກດ streak · ການສະຫຼັບ · ການຈັບກຸ່ມ · ຄູ່ລູກ ດ້ວຍຕົນເອງ ພ້ອມໃຫ້ຄວາມເຫັນຕໍ່ງວດຖັດໄປ`}
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
              <PairCard key={`${p.a}-${p.b}`} pair={{ ...p, rank: i + 1 }} symOf={result.symOf} />
            ))}
          </div>

          {/* ── ຍ້ອນເບິ່ງ: ສູດນີ້ທາຍຖືກຈັກຄັ້ງ ── */}
          {backtest && backtest.n > 0 && (
            <div className={CARD}>
              <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-1 flex items-center gap-2">
                <History size={14} className="text-[#f97316]" /> ຍ້ອນເບິ່ງ: ສູດນີ້ທາຍຖືກຈັກຄັ້ງ
              </h3>
              <p className="text-xs text-[#94a3b8] mb-4">
                ທົດສອບກັບ {backtest.n} ງວດຫຼ້າສຸດ — ແຕ່ລະງວດຄິດສູດໃໝ່ ໂດຍໃຊ້ພຽງຂໍ້ມູນກ່ອນໜ້າ
              </p>
              <div className="space-y-2.5">
                {[0, 1, 2].map(i => {
                  const b = backtest.both[i]
                  const e = backtest.either[i]
                  const m = RANK_META[i]
                  const ci = backtest.wilsonBoth ? backtest.wilsonBoth[i] : null
                  return (
                    <div key={i} className="flex items-center gap-3 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black shrink-0"
                        style={{ background: m.bg, color: m.color, boxShadow: `0 2px 8px ${m.shadow}` }}
                      >
                        {i === 0 && <Crown size={11} />} ຄູ່ທີ {i + 1}
                      </span>
                      <span className="text-sm tabular-nums">
                        <b className="text-[#ef4444]">{b}/{backtest.n}</b>
                        <span className="text-xs text-[#94a3b8]">
                          {' '}ຖືກທັງຄູ່ · {Math.round((b / backtest.n) * 100)}%
                          {ci && (
                            <span className="text-[#cbd5e1] dark:text-[#475569]">
                              {' '}(CI {Math.round(ci[0] * 100)}–{Math.round(ci[1] * 100)}%)
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="text-sm tabular-nums ml-auto">
                        <b className="text-[#f97316]">{e}/{backtest.n}</b>
                        <span className="text-xs text-[#94a3b8]"> ≥1 ໜ່ວຍ · {Math.round((e / backtest.n) * 100)}%</span>
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-[#eef2f9] dark:border-white/5 flex items-center justify-between">
                <span className="text-sm font-bold text-[#334155] dark:text-[#e2e8f0]">ຢ່າງໜ້ອຍ 1 ໃນ 3 ຄູ່ ຖືກທັງຄູ່</span>
                <span className="text-sm font-black tabular-nums text-[#ef4444]">
                  {backtest.anyBoth}/{backtest.n} · {Math.round((backtest.anyBoth / backtest.n) * 100)}%
                  {backtest.wilsonAny && (
                    <span className="text-xs font-normal text-[#94a3b8]">
                      {' '}(CI {Math.round(backtest.wilsonAny[0] * 100)}–{Math.round(backtest.wilsonAny[1] * 100)}%)
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
                      style={{ color: backtest.brierSkill > 0 ? '#16a34a' : '#dc2626' }}
                    >
                      {backtest.brierSkill > 0 ? '+' : ''}{Math.round(backtest.brierSkill * 100)}%
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#94a3b8] leading-relaxed">
                    Brier ສູດ = {backtest.brierSymbol.toFixed(3)} · ທາຍມົ້ວ ({Math.round(SYM_APPEAR_BASE * 100)}%) = {backtest.brierSymbolBase.toFixed(3)} —{' '}
                    ຄ່າ skill ບວກ = ຄວາມໜ້າຈະເປັນ % ທີ່ບອກ ແມ່ນຍຳກວ່າການເດົາແບບຄົງທີ່
                  </p>
                </div>
              )}

              {/* ── ລາຍລະອຽດ: ງວດຜ່ານມາ ອອກຕາມ ຄູ່ 1/2/3 ຖືກ ຫຼື ບໍ່ ── */}
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
                            const st = h.both
                              ? { c: '#16a34a', bg: '#22c55e1f', t: '✓' }
                              : h.either
                                ? { c: '#d97706', bg: '#f59e0b1f', t: '~' }
                                : { c: '#94a3b8', bg: '#64748b12', t: '✗' }
                            return (
                              <span
                                key={i}
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black tabular-nums"
                                style={{ background: st.bg, color: st.c }}
                                title={`ຄູ່ທີ ${i + 1}: ${symById[h.pair[0]]?.name_lo} + ${symById[h.pair[1]]?.name_lo}`}
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
                <b style={{ color: '#16a34a' }}>✓</b> ຖືກທັງຄູ່ · <b style={{ color: '#d97706' }}>~</b> ໄດ້ 1 ໜ່ວຍ · <b>✗</b> ບໍ່ຖືກ ·
                ເສັ້ນຖານສຸ່ມ (ທາຍມົ້ວ): ຖືກທັງຄູ່ ≈ {Math.round(backtest.baseBoth * 100)}% · ≥1 ໜ່ວຍ ≈ {Math.round(backtest.baseEither * 100)}% —
                ຖ້າ % ຂ້າງເທິງ ສູງກວ່ານີ້ ແປວ່າ ສູດພໍມີປະໂຫຍດ
              </p>
            </div>
          )}

          {/* Symbol strength ranking */}
          <div className={CARD}>
            <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-[#f97316]" /> ອັນດັບລູກ · ໂອກາດອອກງວດຖັດໄປ
            </h3>
            <div className="space-y-2">
              {result.symbolRanked.map((r, i) => {
                const c = SYM_COLOR[r.id] || '#64748b'
                const maxProb = result.symbolRanked[0].prob || 1
                return (
                  <div key={r.id} className="flex items-center gap-3">
                    <span className="text-xs font-black text-[#94a3b8] w-5 tabular-nums">{i + 1}</span>
                    <SymBall sym={r.sym} size={30} />
                    <span className="text-sm font-semibold text-[#334155] dark:text-[#cbd5e1] w-16">{r.sym.name_lo}</span>
                    <div className="flex-1 h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.round((r.prob / maxProb) * 100)}%`, background: c }} />
                    </div>
                    <span className="text-xs tabular-nums text-[#64748b] w-9 text-right">{Math.round(r.prob * 100)}%</span>
                  </div>
                )
              })}
            </div>
            <p className="mt-3 text-[11px] text-[#94a3b8]">ເສັ້ນຖານສະເໝີພາບ ≈ 42% ຕໍ່ລູກ · ແຖບ = ທຽບກັບລູກທີ່ແຮງສຸດ</p>
          </div>

          {/* ── #6 Monte-Carlo ── */}
          {monteCarlo && (
            <div className={CARD}>
              <h3 className="font-black text-sm text-[#0f172a] dark:text-[#f1f5f9] mb-1 flex items-center gap-2">
                <Shuffle size={14} className="text-[#f97316]" /> Monte-Carlo — ຈຳລອງ {monteCarlo.iters.toLocaleString()} ງວດ
              </h3>
              <p className="text-xs text-[#94a3b8] mb-4">
                ສ້າງ P(ລູກ | ໜ່ວຍ 1/2/3) ຈາກ {monteCarlo.window} ງວດຫຼ້າສຸດ ແລ້ວສຸ່ມ 3 ໜ່ວຍ ແບບອິດສະຫຼະ
              </p>
              <div className="space-y-2">
                {monteCarlo.symbolProb.map((r, i) => {
                  const c = SYM_COLOR[r.symbol_id] || '#64748b'
                  const maxP = monteCarlo.symbolProb[0].prob || 1
                  return (
                    <div key={r.symbol_id} className="flex items-center gap-3">
                      <span className="text-xs font-black text-[#94a3b8] w-5 tabular-nums">{i + 1}</span>
                      <SymBall sym={r.sym} size={28} />
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
                <p className="text-[10px] font-black uppercase tracking-wider text-[#94a3b8] mb-2">3 ຄູ່ ທີ່ຈຳລອງແລ້ວອອກພ້ອມກັນຫຼາຍສຸດ</p>
                <div className="flex flex-wrap gap-2">
                  {monteCarlo.topPairs.map((p, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-[#f8fafc] dark:bg-white/5 rounded-lg px-2 py-1">
                      <SymBall sym={monteCarlo.symOf[p.a]} size={22} />
                      <SymBall sym={monteCarlo.symOf[p.b]} size={22} />
                      <span className="text-xs font-bold tabular-nums text-[#f97316]">{Math.round(p.both * 100)}%</span>
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-[11px] text-[#94a3b8] leading-relaxed">
                ໂມເດລນີ້ຖືວ່າ 3 ໜ່ວຍ ອິດສະຫຼະກັນ — ໃຊ້ທຽບກັບສູດຄູ່ຂ້າງເທິງ, ຖ້າຜົນກົງກັນ ຄວາມໝັ້ນໃຈສູງຂຶ້ນ.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
            <TrendingUp size={13} />
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
