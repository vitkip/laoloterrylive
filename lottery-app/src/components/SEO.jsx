import { Helmet } from 'react-helmet-async'

const BASE_URL = 'https://laolots.com'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`

const SITE_NAME = 'laolots.com'

const BASE_KEYWORDS = [
  'ຫວຍລາວ', 'ຜົນຫວຍພັດທະນາ', 'ສະຖິຕິຫວຍ', 'ຖ່າຍທອດສົດຫວຍ',
  'ຈັບຄູ່ນາມສັດ', 'ຜົນຫວຍຍ້ອນຫຼັງ', 'ທຳນາຍຝັນ', 'laolots', 'lao lottery live',
  'หวยลาว', 'ผลหวยพัฒนา', 'สถิติหวย', 'ถ่ายทอดสดหวย', 'จับคู่นามสัตว์',
  'ผลหวยย้อนหลัง', 'หวยลาวพัฒนา', 'หวยลาววันนี้', 'ตรวจหวยลาว',
  'หวยลาวย้อนหลัง', 'ตรวจหวยออนไลน์', 'เลขเด็ดวันนี้', 'ผลหวยรัฐบาล',
  'สถิติหวยย้อนหลัง', 'หวยออกอะไร', 'ตรวจผลหวยแบบเรียลไทม์',
]

/**
 * SEO component — drop into any page for full meta/OG/Twitter tags.
 *
 * @param {string}   title        Page title (appended with " | laolots.com")
 * @param {string}   description  Meta description (Lao + Thai recommended)
 * @param {string[]} keywords     Extra page-specific keywords (merged with base)
 * @param {string}   image        OG image URL (absolute). Defaults to og-image.jpg
 * @param {string}   url          Canonical URL path e.g. "/history". Defaults to current.
 * @param {string}   type         OG type. "website" | "article". Defaults "website"
 * @param {object}   jsonLd       JSON-LD schema object (or array). Injected as script.
 * @param {boolean}  noIndex      Set true for admin/auth pages to block crawlers.
 */
export default function SEO({
  title,
  description,
  keywords = [],
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  jsonLd,
  noIndex = false,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - ຜົນຫວຍພັດທະນາ & ສະຖິຕິຫວຍລາວ`
  const canonicalUrl = url ? `${BASE_URL}${url}` : BASE_URL
  const allKeywords = [...BASE_KEYWORDS, ...keywords].join(', ')

  const schemas = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []

  return (
    <Helmet>
      {/* ── Basic ── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex
        ? <meta name="robots" content="noindex, nofollow" />
        : <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      }

      {/* ── Open Graph (Facebook / Google Discover) ── */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:locale" content="lo_LA" />
      <meta property="og:locale:alternate" content="th_TH" />

      {/* ── Twitter Card ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@laolots" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* ── Google Discover: requires large image (>1200px wide) ── */}
      <meta name="thumbnail" content={image} />

      {/* ── JSON-LD structured data ── */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}
