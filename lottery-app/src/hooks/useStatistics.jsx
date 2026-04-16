import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { resolveAnimalImage } from '../utils/api';

export const useStatistics = (timeframe = 'all') => {
  const { draws, animals, loading } = useData();

  const stats = useMemo(() => {
    if (!draws.length || !animals.length) return null;

    let targetDraws = draws;
    if (timeframe !== 'all') {
      // Find the most recent draw date to act as "now" if possible, otherwise use new Date()
      // Since data is mocked, let's use the most recent published draw date as the baseline
      // instead of new Date() which would be current real-world date.
      const published = draws.filter(d => d.status === 'published');
      if (published.length > 0) {
        // Assume published draws are sorted descending, if not sort them
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
        targetDraws = draws.filter(d => new Date(d.draw_date) >= cutoffDate);
      }
    }

    // 1. Hot & Cold Numbers (using 2-digit prizes)
    const twoDigitFreq = {};
    // Initialize all 100 numbers (00-99)
    for (let i = 0; i < 100; i++) {
      const numStr = i.toString().padStart(2, '0');
      twoDigitFreq[numStr] = { count: 0, lastSeen: 0 };
    }

    // Process from oldest to newest to correctly calculate 'lastSeen'
    const chronologicalDraws = [...targetDraws].reverse();
    
    chronologicalDraws.forEach(d => {
      // Every round, increase 'lastSeen' for everyone
      Object.keys(twoDigitFreq).forEach(key => {
        twoDigitFreq[key].lastSeen += 1;
      });

      const twoDigit = d.results_detail?.find(r => r.prize_type === '2_digits');
      if (twoDigit && twoDigit.result_value) {
        const v = twoDigit.result_value;
        if (twoDigitFreq[v]) {
          twoDigitFreq[v].count += 1;
          twoDigitFreq[v].lastSeen = 0; // Reset lastSeen for the drawn number
        }
      }
    });

    const frequencyArray = Object.entries(twoDigitFreq).map(([number, data]) => ({
      number,
      count: data.count,
      missedRounds: data.lastSeen
    }));

    // Hot: Highest frequency count (break ties with missedRounds to reward recent hotness)
    const hotNumbers = [...frequencyArray].sort((a, b) => b.count - a.count || a.missedRounds - b.missedRounds).slice(0, 4);
    // Cold: Highest missedRounds (longest time without showing up)
    const coldNumbers = [...frequencyArray].sort((a, b) => b.missedRounds - a.missedRounds).slice(0, 3);

    // 2. Animal Stats (which animals appeared the most in 2-digit results)
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

    // 3. Digit Distribution (from full_result)
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
        barWidth: Math.min(100, Math.max(0, parseFloat(percent) * 5)), // approx scaling, or just use percent directly
        count: count
      };
    }).sort((a, b) => b.percent - a.percent);

    // Normalize barWidth so highest is ~100%
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
      const currentDraw = chronologicalDraws[i];
      const currentTwoDigit = currentDraw.results_detail?.find(r => r.prize_type === '2_digits');
      
      const nextDraw = chronologicalDraws[i+1];
      const nextTwoDigit = nextDraw.results_detail?.find(r => r.prize_type === '2_digits');

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

    const hotPairs = allPairs.sort((a, b) => b.count - a.count).slice(0, 5);

    return {
      hotNumbers,
      coldNumbers,
      animalStats,
      digitDistributions,
      hotPairs
    };
  }, [draws, animals, timeframe]);

  return { stats, loading };
};
