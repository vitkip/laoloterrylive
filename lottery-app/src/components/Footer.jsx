import { Link } from 'react-router-dom'

const API_DOCS_URL = import.meta.env.DEV
  ? 'http://localhost/laoloterylive/api/docs/'
  : '/api/docs/'

const FOOTER_LINKS = [
  { label: 'API Documentation', href: API_DOCS_URL, target: '_blank' },
  { label: 'Terms of Service (ພາສາລາວ)', href: '/terms' },
  { label: 'Contact Information', href: '/contact' },
]

export default function Footer() {
  return (
    <footer className="bg-background w-full border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm ring-1 ring-black/10 dark:ring-white/10 group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <rect x="0" y="0" width="36" height="9" fill="#CE1126"/>
              <rect x="0" y="9" width="36" height="18" fill="#002868"/>
              <rect x="0" y="27" width="36" height="9" fill="#CE1126"/>
              <circle cx="18" cy="18" r="6" fill="white"/>
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-extrabold tracking-tight text-foreground">
              laolots<span className="text-primary">.com</span>
            </span>
            <span className="text-[9.5px] font-medium text-muted-foreground tracking-widest uppercase">ຫວຍພັດທະນາລາວ</span>
          </div>
        </Link>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.target}
              rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
              className="text-xs font-medium text-muted-foreground hover:underline hover:text-blue-800 dark:hover:text-primary transition-opacity opacity-80 hover:opacity-100"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
