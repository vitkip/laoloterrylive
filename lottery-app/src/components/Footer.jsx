const API_DOCS_URL = import.meta.env.DEV
  ? 'http://localhost/laoloterylive/api/docs/'
  : '/api/docs/'

const FOOTER_LINKS = [
  { label: 'API Documentation', href: API_DOCS_URL, target: '_blank' },
  { label: 'Terms of Service (ພາສາລາວ)', href: '/terms' },
  { label: 'Contact Information', href: '#' },
]

export default function Footer() {
  return (
    <footer className="bg-background w-full py-10 sm:py-12 px-4 sm:px-6 mt-auto border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
      {/* Brand */}
      <div className="flex flex-col items-center md:items-start gap-1.5">
        <div className="text-lg font-black uppercase text-foreground tracking-tight">
          laolots.com
        </div>
        <p className="text-xs font-medium text-muted-foreground">
          © 2026 The Editorial Archive. All Rights Reserved.
        </p>
      </div>

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
    </footer>
  )
}
