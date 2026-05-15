import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { resolveAnimalImage } from '../utils/api';

export const useStatistics = (timeframe = 'all', typeId = 'all') => {
  const { draws, animals, loading } = useData();

  const stats = useMemo(() => {
    if (!draws.length || !animals.length) return null;

    // ── Step 1: Filter by type ──
    let targetDraws = typeId === 'all'
      ? draws
      : draws.filter(d => String(d.type_id) === String(typeId));

    if (!targetDraws.length) return null;

    // ── Step 2: Filter by timeframe ──
    if (timeframe !== 'all') {
      const published = targetDraws.filter(d => d.status === 'published');
      if (published.length > 0) {
        const sorted = [...published].sort((a,b) => new Date(b.draw_date) - new Date(a.draw_date));
        const latestDate = new Date(sorted[0].draw_date);
        
        const cutoffDate = new Date(latestDate);
        if (timeframe === '1_month') {
          cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        } else if (timeframe === '3_months') {
          cutoffDate.setMonth(cutoffDate.getMonth() - 3);
        } else if (timeframe === '1_year') {
          cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
        }
        targetDraws = targetDraws.filter(d => new Date(d.draw_date) >= cutoffDate);
      }
    }

    // Process from oldest to newest
    const chronologicalDraws = [...targetDraws].reverse();
    const totalRounds = chronologicalDraws.length;

    // ── Single-pass frequency + lastSeen tracking (O(N)) ──
    // OPTIMIZED: Previous version had O(100 × N) because it incremented
    // lastSeen for ALL 100 numbers on every draw. Now we use a round counter
    // and compute missedRounds = (totalRounds - 1 - lastSeenAtRound).
    const twoDigitCount = {};
    const lastSeenAtRound = {};
    for (let i = 0; i < 100; i++) {
      const numStr = i.toString().padStart(2, '0');
      twoDigitCount[numStr] = 0;
      lastSeenAtRound[numStr] = -1; // -1 means never seen
    }

    chronologicalDraws.forEach((d, roundIdx) => {
      const twoDigit = d.results_detail?.find(r => r.prize_type === '2_digits');
      if (twoDigit?.result_value) {
        const v = twoDigit.result_value;
        if (twoDigitCount[v] !== undefined) {
          twoDigitCount[v]++;
          lastSeenAtRound[v] = roundIdx;
        }
      }
    });

    const frequencyArray = Object.entries(twoDigitCount).map(([number, count]) => {
      const lastRound = lastSeenAtRound[number];
      const missedRounds = lastRound === -1 ? totalRounds : (totalRounds - 1 - lastRound);
      return { number, count, missedRounds };
    });

    // Hot: Highest frequency count
    const hotNumbers = [...frequencyArray]
      .sort((a, b) => b.count - a.count || a.missedRounds - b.missedRounds)
      .slice(0, 4);

    // Cold: Longest time without showing up
    const coldNumbers = [...frequencyArray]
      .sort((a, b) => b.missedRounds - a.missedRounds)
      .slice(0, 3);

    // 2. Animal Stats
    const animalFreq = {};
    let totalTwoDigitDraws = 0;
    targetDraws.forEach(d => {
      const twoDigit = d.results_detail?.find(r => r.prize_type === '2_digits');
      if (twoDigit?.animal_id) {
        totalTwoDigitDraws++;
        animalFreq[twoDigit.animal_id] = (animalFreq[twoDigit.animal_id] || 0) + 1;
      }
    });

    const animalStats = animals.map(a => {
      const count = animalFreq[a.animal_id] || 0;
      const pct = totalTwoDigitDraws > 0 ? ((count / totalTwoDigitDraws) * 100).toFixed(0) : 0;
      const constructedUrl = resolveAnimalImage(a);
      
      return {
        animal_id: a.animal_id,
        icon: a.image_url,
        image_url: constructedUrl,
        name: a.animal_name_lao,
        numbers: a.animal_numbers.split(',').join(', '),
        frequencyPercent: parseInt(pct)
      };
    }).sort((a, b) => b.frequencyPercent - a.frequencyPercent);

    // 3. Digit Distribution
    const digitCount = Array(10).fill(0);
    let totalDigits = 0;
    targetDraws.forEach(d => {
      if (d.full_result) {
        for (let char of d.full_result) {
          const num = parseInt(char, 10);
          if (!isNaN(num)) {
            digitCount[num]++;
            totalDigits++;
          }
        }
      }
    });

    const digitDistributions = digitCount.map((count, digit) => {
      const percent = totalDigits > 0 ? ((count / totalDigits) * 100).toFixed(1) : 0;
      return {
        digit,
        percent: parseFloat(percent),
        barWidth: 0,
        count: count
      };
    }).sort((a, b) => b.percent - a.percent);

    if (digitDistributions.length > 0) {
      const maxPercent = digitDistributions[0].percent;
      if (maxPercent > 0) {
        digitDistributions.forEach(d => {
          d.barWidth = Math.round((d.percent / maxPercent) * 100);
        });
      }
    }

    // 4. Consecutive Number Pairs
    const pairsTracker = {};
    for (let i = 0; i < chronologicalDraws.length - 1; i++) {
      const currentTwoDigit = chronologicalDraws[i].results_detail?.find(r => r.prize_type === '2_digits');
      const nextTwoDigit = chronologicalDraws[i+1].results_detail?.find(r => r.prize_type === '2_digits');

      if (currentTwoDigit?.result_value && nextTwoDigit?.result_value) {
        const currentNum = currentTwoDigit.result_value;
        const nextNum = nextTwoDigit.result_value;
        
        if (!pairsTracker[currentNum]) pairsTracker[currentNum] = {};
        if (!pairsTracker[currentNum][nextNum]) pairsTracker[currentNum][nextNum] = 0;
        pairsTracker[currentNum][nextNum]++;
      }
    }

    const allPairs = [];
    Object.keys(pairsTracker).forEach(currentNum => {
      Object.keys(pairsTracker[currentNum]).forEach(nextNum => {
        allPairs.push({
          currentNum,
          nextNum,
          count: pairsTracker[currentNum][nextNum]
        });
      });
    });

    const hotPairs = allPairs.sort((a, b) => b.count - a.count).slice(0, 10);

    // ─── Trend Momentum ───
    const last5 = targetDraws.slice(0, 5);
    const last20 = targetDraws.slice(0, 20);
    const freq5 = {}, freq20 = {};
    for (let i = 0; i < 100; i++) {
      const n = i.toString().padStart(2, '0');
      freq5[n] = 0; freq20[n] = 0;
    }
    last5.forEach(d => {
      const v = d.results_detail?.find(r => r.prize_type === '2_digits')?.result_value;
      if (v !== undefined && freq5[v] !== undefined) freq5[v]++;
    });
    last20.forEach(d => {
      const v = d.results_detail?.find(r => r.prize_type === '2_digits')?.result_value;
      if (v !== undefined && freq20[v] !== undefined) freq20[v]++;
    });
    const momentumList = Object.keys(freq5).map(n => {
      const recentRate = freq5[n] / Math.max(last5.length, 1);
      const baselineRate = freq20[n] / Math.max(last20.length, 1);
      return { number: n, momentum: recentRate - baselineRate, recentCount: freq5[n], baselineCount: freq20[n] };
    });
    const trendMomentum = {
      rising: momentumList.filter(x => x.momentum > 0).sort((a, b) => b.momentum - a.momentum).slice(0, 6),
      falling: momentumList.filter(x => x.momentum < 0 && x.baselineCount > 0).sort((a, b) => a.momentum - b.momentum).slice(0, 6),
    };

    // ─── Gap Analysis ───
    const gapAnalysis = frequencyArray.map(({ number, count, missedRounds }) => {
      const expectedGap = count > 0 ? totalRounds / count : totalRounds;
      const overdueRatio = missedRounds / Math.max(expectedGap, 1);
      return { number, count, missedRounds, expectedGap: Math.round(expectedGap), overdueRatio };
    }).sort((a, b) => b.missedRounds - a.missedRounds).slice(0, 10);

    // ─── Repeat Pattern Detection ───
    const totalTwoDigitCount = targetDraws.filter(
      d => d.results_detail?.find(r => r.prize_type === '2_digits')?.result_value
    ).length;

    const doubleNumbers = ['00','11','22','33','44','55','66','77','88','99'].map(n => ({
      number: n,
      count: twoDigitCount[n] || 0,
      pct: totalTwoDigitCount > 0 ? +((twoDigitCount[n] || 0) / totalTwoDigitCount * 100).toFixed(1) : 0,
    })).sort((a, b) => b.count - a.count);

    const mirrorSeen = new Set();
    const mirrorPairs = [];
    for (let a = 0; a <= 9; a++) {
      for (let b = 0; b <= 9; b++) {
        if (a === b) continue;
        const n1 = `${a}${b}`, n2 = `${b}${a}`;
        if (mirrorSeen.has(n1)) continue;
        mirrorSeen.add(n1); mirrorSeen.add(n2);
        const c1 = twoDigitCount[n1] || 0;
        const c2 = twoDigitCount[n2] || 0;
        if (c1 > 0 || c2 > 0) {
          mirrorPairs.push({ pair: [n1, n2], counts: [c1, c2], total: c1 + c2 });
        }
      }
    }
    const repeatPatterns = {
      doubles: doubleNumbers,
      mirrors: mirrorPairs.sort((a, b) => b.total - a.total).slice(0, 8),
      totalTwoDigitCount,
    };

    return {
      hotNumbers,
      coldNumbers,
      animalStats,
      digitDistributions,
      hotPairs,
      pairsTracker,
      trendMomentum,
      gapAnalysis,
      repeatPatterns,
    };
  }, [draws, animals, timeframe, typeId]);

  return { stats, loading };
};
