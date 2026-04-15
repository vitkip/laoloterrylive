import { useMemo } from 'react';
import { useData } from '../context/DataContext';

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
    targetDraws.forEach(d => {
      const twoDigit = d.results_detail?.find(r => r.prize_type === '2_digits');
      if (twoDigit) {
        const v = twoDigit.result_value;
        if (!twoDigitFreq[v]) twoDigitFreq[v] = { count: 0, lastSeen: 0 };
        twoDigitFreq[v].count += 1;
      }
      
      // Increment lastSeen for all previously seen numbers
      Object.keys(twoDigitFreq).forEach(key => {
        twoDigitFreq[key].lastSeen += 1;
      });
      // Reset lastSeen for the one drawn in this round
      if (twoDigit) {
        twoDigitFreq[twoDigit.result_value].lastSeen = 0;
      }
    });

    const frequencyArray = Object.entries(twoDigitFreq).map(([number, data]) => ({
      number,
      count: data.count,
      missedRounds: data.lastSeen
    }));

    const hotNumbers = [...frequencyArray].sort((a, b) => b.count - a.count).slice(0, 4);
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
      
      const isUploadedImage = a.image_url && (a.image_url.startsWith('/') || a.image_url.startsWith('http'));
      let constructedUrl = `/images/animals/${a.animal_id}.png`;
      if (isUploadedImage) {
        constructedUrl = a.image_url.startsWith('/laoloterylive') ? `http://localhost${a.image_url}` : a.image_url;
      }
      
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
    }).sort((a, b) => b.percent - a.percent).slice(0, 6);

    // Normalize barWidth so highest is ~100%
    if (digitDistributions.length > 0) {
      const maxPercent = digitDistributions[0].percent;
      if (maxPercent > 0) {
        digitDistributions.forEach(d => {
          d.barWidth = Math.round((d.percent / maxPercent) * 100);
        });
      }
    }

    return {
      hotNumbers,
      coldNumbers,
      animalStats,
      digitDistributions
    };
  }, [draws, animals, timeframe]);

  return { stats, loading };
};
