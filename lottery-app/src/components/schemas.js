/**
 * JSON-LD schema factory functions for laolots.com
 * Usage: import { websiteSchema, webPageSchema, ... } from '@/components/schemas'
 */

const BASE_URL = 'https://laolots.com'

/** WebSite schema with SearchAction — shown once on root pages */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'laolots.com',
    alternateName: ['ລາວລ໊ອດ', 'Lao Lottery Live', 'laolots'],
    url: BASE_URL,
    description: 'ສູນລວມຜົນຫວຍພັດທະນາ ຖ່າຍທອດສົດຫວຍລາວ ສະຖິຕິຫວຍຍ້ອນຫຼັງ | ศูนย์รวมผลหวยลาว ถ่ายทอดสดหวยพัฒนา สถิติหวยย้อนหลัง',
    inLanguage: ['lo', 'th'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * WebPage schema
 * @param {string} name       Page title
 * @param {string} url        Full URL
 * @param {string} desc       Description
 * @param {string} [dateModified]  ISO date string
 */
export function webPageSchema(name, url, desc, dateModified) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    url,
    description: desc,
    inLanguage: ['lo', 'th'],
    isPartOf: { '@type': 'WebSite', url: BASE_URL },
    ...(dateModified && { dateModified }),
  }
}

/**
 * BreadcrumbList schema
 * @param {Array<{name: string, url: string}>} items
 */
export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * NewsArticle / Event schema for a single lottery draw result
 * @param {object} draw   { draw_date, result_number, type_name }
 */
export function lotteryResultSchema(draw) {
  if (!draw) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: `ຜົນຫວຍພັດທະນາ ${draw.type_name || 'ລາວ'} ${draw.draw_date} - ເລກ ${draw.result_number}`,
    description: `ຜົນອອກເລກຫວຍ${draw.type_name || 'ພັດທະນາ'}ງວດວັນທີ ${draw.draw_date} ເລກທີ່ອອກ: ${draw.result_number} | ผลหวย${draw.type_name || 'พัฒนา'} งวด ${draw.draw_date} เลขที่ออก: ${draw.result_number}`,
    datePublished: draw.draw_date,
    dateModified: draw.draw_date,
    author: { '@type': 'Organization', name: 'laolots.com', url: BASE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'laolots.com',
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/favicon.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': BASE_URL },
    keywords: `ຜົນຫວຍ, ${draw.type_name}, ${draw.draw_date}, ${draw.result_number}, หวยลาว, ผลหวยพัฒนา`,
  }
}

/**
 * ItemList schema for multiple lottery results
 * @param {Array} draws   Array of draw objects
 */
export function lotteryListSchema(draws = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ຜົນຫວຍພັດທະນາຍ້ອນຫຼັງ | ผลหวยพัฒนาย้อนหลัง',
    description: 'ລາຍການຜົນຫວຍລາວຍ້ອນຫຼັງທຸກງວດ | รายการผลหวยลาวย้อนหลังทุกงวด',
    url: `${BASE_URL}/history`,
    numberOfItems: draws.length,
    itemListElement: draws.slice(0, 10).map((d, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `ຜົນຫວຍ ${d.type_name || ''} ${d.draw_date} - ${d.result_number}`,
      url: `${BASE_URL}/history`,
    })),
  }
}

/**
 * FAQPage schema — useful for analytics / statistics pages
 * @param {Array<{q: string, a: string}>} faqs
 */
export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}
