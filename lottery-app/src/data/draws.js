// lottery_draws + draw_results_detail mock data
// Mirrors DB schema fields exactly

export const draws = [
  {
    draw_id: 1,
    type_id: 1,
    draw_number: 201,
    draw_date: '2024-05-16',
    full_result: '423789',
    status: 'published',
    created_by: 2,
    youtube_url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ', // mock YouTube shorts url
    results_detail: [
      { detail_id: 1,  draw_id: 1, prize_type: '6_digits', result_value: '423789', animal_id: null },
      { detail_id: 2,  draw_id: 1, prize_type: '5_digits', result_value: '23789',  animal_id: null },
      { detail_id: 3,  draw_id: 1, prize_type: '4_digits', result_value: '3789',   animal_id: null },
      { detail_id: 4,  draw_id: 1, prize_type: '3_digits', result_value: '789',    animal_id: null },
      { detail_id: 5,  draw_id: 1, prize_type: '2_digits', result_value: '89',     animal_id: 9  }, // ແມວ
    ],
  },
  {
    draw_id: 2,
    type_id: 1,
    draw_number: 200,
    draw_date: '2024-05-02',
    full_result: '156322',
    status: 'published',
    created_by: 2,
    youtube_url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    results_detail: [
      { detail_id: 6,  draw_id: 2, prize_type: '6_digits', result_value: '156322', animal_id: null },
      { detail_id: 7,  draw_id: 2, prize_type: '5_digits', result_value: '56322',  animal_id: null },
      { detail_id: 8,  draw_id: 2, prize_type: '4_digits', result_value: '6322',   animal_id: null },
      { detail_id: 9,  draw_id: 2, prize_type: '3_digits', result_value: '322',    animal_id: null },
      { detail_id: 10, draw_id: 2, prize_type: '2_digits', result_value: '22',     animal_id: 22 }, // ແມງມຸມ
    ],
  },
  {
    draw_id: 3,
    type_id: 1,
    draw_number: 199,
    draw_date: '2024-04-16',
    full_result: '074155',
    status: 'published',
    created_by: 2,
    results_detail: [
      { detail_id: 11, draw_id: 3, prize_type: '6_digits', result_value: '074155', animal_id: null },
      { detail_id: 12, draw_id: 3, prize_type: '5_digits', result_value: '74155',  animal_id: null },
      { detail_id: 13, draw_id: 3, prize_type: '4_digits', result_value: '4155',   animal_id: null },
      { detail_id: 14, draw_id: 3, prize_type: '3_digits', result_value: '155',    animal_id: null },
      { detail_id: 15, draw_id: 3, prize_type: '2_digits', result_value: '55',     animal_id: 15 }, // ກະຕ່າຍ
    ],
  },
  {
    draw_id: 4,
    type_id: 1,
    draw_number: 198,
    draw_date: '2024-04-02',
    full_result: '891200',
    status: 'published',
    created_by: 2,
    results_detail: [
      { detail_id: 16, draw_id: 4, prize_type: '6_digits', result_value: '891200', animal_id: null },
      { detail_id: 17, draw_id: 4, prize_type: '5_digits', result_value: '91200',  animal_id: null },
      { detail_id: 18, draw_id: 4, prize_type: '4_digits', result_value: '1200',   animal_id: null },
      { detail_id: 19, draw_id: 4, prize_type: '3_digits', result_value: '200',    animal_id: null },
      { detail_id: 20, draw_id: 4, prize_type: '2_digits', result_value: '00',     animal_id: 20 }, // ປູ
    ],
  },
  {
    draw_id: 5,
    type_id: 1,
    draw_number: 197,
    draw_date: '2024-03-16',
    full_result: '324507',
    status: 'published',
    created_by: 2,
    results_detail: [
      { detail_id: 21, draw_id: 5, prize_type: '6_digits', result_value: '324507', animal_id: null },
      { detail_id: 22, draw_id: 5, prize_type: '5_digits', result_value: '24507',  animal_id: null },
      { detail_id: 23, draw_id: 5, prize_type: '4_digits', result_value: '4507',   animal_id: null },
      { detail_id: 24, draw_id: 5, prize_type: '3_digits', result_value: '507',    animal_id: null },
      { detail_id: 25, draw_id: 5, prize_type: '2_digits', result_value: '07',     animal_id: 7  }, // ຄວາຍ
    ],
  },
  {
    draw_id: 6,
    type_id: 1,
    draw_number: 196,
    draw_date: '2024-03-02',
    full_result: '619843',
    status: 'published',
    created_by: 2,
    results_detail: [
      { detail_id: 26, draw_id: 6, prize_type: '6_digits', result_value: '619843', animal_id: null },
      { detail_id: 27, draw_id: 6, prize_type: '5_digits', result_value: '19843',  animal_id: null },
      { detail_id: 28, draw_id: 6, prize_type: '4_digits', result_value: '9843',   animal_id: null },
      { detail_id: 29, draw_id: 6, prize_type: '3_digits', result_value: '843',    animal_id: null },
      { detail_id: 30, draw_id: 6, prize_type: '2_digits', result_value: '43',     animal_id: 3  }, // ມ້າ
    ],
  },
  {
    draw_id: 7,
    type_id: 1,
    draw_number: 195,
    draw_date: '2024-02-16',
    full_result: '502871',
    status: 'published',
    created_by: 2,
    results_detail: [
      { detail_id: 31, draw_id: 7, prize_type: '6_digits', result_value: '502871', animal_id: null },
      { detail_id: 32, draw_id: 7, prize_type: '5_digits', result_value: '02871',  animal_id: null },
      { detail_id: 33, draw_id: 7, prize_type: '4_digits', result_value: '2871',   animal_id: null },
      { detail_id: 34, draw_id: 7, prize_type: '3_digits', result_value: '871',    animal_id: null },
      { detail_id: 35, draw_id: 7, prize_type: '2_digits', result_value: '71',     animal_id: 31 }, // ເສດຖີ
    ],
  },
  {
    draw_id: 8,
    type_id: 1,
    draw_number: 194,
    draw_date: '2024-02-02',
    full_result: '748236',
    status: 'published',
    created_by: 2,
    results_detail: [
      { detail_id: 36, draw_id: 8, prize_type: '6_digits', result_value: '748236', animal_id: null },
      { detail_id: 37, draw_id: 8, prize_type: '5_digits', result_value: '48236',  animal_id: null },
      { detail_id: 38, draw_id: 8, prize_type: '4_digits', result_value: '8236',   animal_id: null },
      { detail_id: 39, draw_id: 8, prize_type: '3_digits', result_value: '236',    animal_id: null },
      { detail_id: 40, draw_id: 8, prize_type: '2_digits', result_value: '36',     animal_id: 36 },
    ],
  },
]

// ---- Statistics helpers (simulates SQL GROUP BY queries) ----

/** ຄວາມຖີ່ຂອງເລກ 2 ຕົວ (ສໍາລັບ hot/cold) */
export function getTwoDigitFrequency() {
  const freq = {}
  draws.forEach(d => {
    const twoDigit = d.results_detail.find(r => r.prize_type === '2_digits')
    if (twoDigit) {
      const v = twoDigit.result_value
      freq[v] = (freq[v] || 0) + 1
    }
  })
  return freq
}

/** ຄວາມຖີ່ຂອງຕົວເລກ 0-9 ຈາກ full_result */
export function getDigitFrequency() {
  const freq = Array(10).fill(0)
  draws.forEach(d => {
    d.full_result.split('').forEach(ch => { freq[parseInt(ch)]++ })
  })
  const total = freq.reduce((a, b) => a + b, 0)
  return freq.map((count, digit) => ({
    digit,
    count,
    percent: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0',
  })).sort((a, b) => b.count - a.count)
}

/** ລາຍຊື່ draw ທີ່ຍັງ pending */
export function getPendingDraws() {
  return draws.filter(d => d.status === 'pending')
}

export const prizeLabels = {
  '6_digits': 'ລາງວັນທີ 1 (6 ຕົວ)',
  '5_digits': 'ລາງວັນທີ 2 (5 ຕົວ)',
  '4_digits': 'ລາງວັນທີ 3 (4 ຕົວ)',
  '3_digits': 'ລາງວັນທີ 4 (3 ຕົວ)',
  '2_digits': 'ລາງວັນ 2 ຕົວ (ນາມສັດ)',
}