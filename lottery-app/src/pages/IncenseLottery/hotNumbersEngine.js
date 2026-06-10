// Simulated lottery history — mirrors lottery_history table (digit_1, digit_2)
const MOCK_HISTORY = [
  { digit_1: 5, digit_2: 47 }, { digit_1: 3, digit_2: 22 }, { digit_1: 7, digit_2: 89 },
  { digit_1: 5, digit_2: 47 }, { digit_1: 1, digit_2: 36 }, { digit_1: 5, digit_2: 22 },
  { digit_1: 8, digit_2: 14 }, { digit_1: 3, digit_2: 55 }, { digit_1: 5, digit_2: 47 },
  { digit_1: 2, digit_2: 78 }, { digit_1: 7, digit_2: 89 }, { digit_1: 9, digit_2: 3 },
  { digit_1: 5, digit_2: 36 }, { digit_1: 1, digit_2: 22 }, { digit_1: 3, digit_2: 47 },
  { digit_1: 6, digit_2: 61 }, { digit_1: 5, digit_2: 47 }, { digit_1: 4, digit_2: 99 },
  { digit_1: 7, digit_2: 89 }, { digit_1: 5, digit_2: 22 }, { digit_1: 0, digit_2: 11 },
  { digit_1: 3, digit_2: 47 }, { digit_1: 8, digit_2: 33 }, { digit_1: 5, digit_2: 78 },
  { digit_1: 2, digit_2: 22 }, { digit_1: 7, digit_2: 89 }, { digit_1: 5, digit_2: 47 },
  { digit_1: 1, digit_2: 55 }, { digit_1: 9, digit_2: 67 }, { digit_1: 3, digit_2: 22 },
];

function buildWeights(values, total) {
  const counts = {};
  values.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
  const weights = {};
  Object.entries(counts).forEach(([k, cnt]) => {
    // Exponential weight: frequent numbers get much higher weight
    weights[k] = Math.pow(cnt / total, 0.6) * 100;
  });
  // Fill missing 1d values with baseline
  if (total === values.length && values.every(v => v < 10)) {
    for (let i = 0; i <= 9; i++) {
      if (!(i in weights)) weights[i] = 1;
    }
  }
  return weights;
}

function weightedRandom(weights) {
  const entries = Object.entries(weights);
  const totalWeight = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * totalWeight;
  for (const [key, w] of entries) {
    r -= w;
    if (r <= 0) return Number(key);
  }
  return Number(entries[entries.length - 1][0]);
}

// Simulated API fetch
export async function fetchHotNumbers() {
  await new Promise(r => setTimeout(r, 400)); // simulate network

  const d1vals = MOCK_HISTORY.map(h => h.digit_1);
  const d2vals = MOCK_HISTORY.map(h => h.digit_2);

  const pool1d = buildWeights(d1vals, d1vals.length);
  const pool2d = buildWeights(d2vals, d2vals.length);

  return { pool1d, pool2d };
}

export function pickWeightedNumbers(pool1d, pool2d) {
  const n1 = weightedRandom(pool1d); // 0–9
  const n2 = weightedRandom(pool2d); // 00–99  (2-digit)
  const n3 = weightedRandom(pool2d); // second 2-digit draw

  return [
    String(n1),
    String(n2).padStart(2, '0'),
    String(n3).padStart(2, '0'),
  ];
}
