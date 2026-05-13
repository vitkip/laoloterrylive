const FOOTER_LINKS = [
  { label: 'API Documentation', href: '#' },
  { label: 'Terms of Service (ພາສາລາວ)', href: '#' },
  { label: 'Contact Information', href: '#' },
]

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-[#0d1829] w-full py-10 sm:py-12 px-4 sm:px-6 mt-auto border-t border-slate-200 dark:border-[#2b3a54] flex flex-col md:flex-row justify-between items-center gap-6">
      {/* Brand */}
      <div className="flex flex-col items-center md:items-start gap-1.5">
        <div className="text-lg font-black uppercase text-blue-900 dark:text-white tracking-tight">
          laolots.com
        </div>
        <p className="text-xs font-medium text-slate-500 dark:text-[#94a3b8]">
          © 2026 The Editorial Archive. All Rights Reserved.
        </p>
      </div>

      {/* Links */}
      <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
        {FOOTER_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-xs font-medium text-slate-500 dark:text-[#94a3b8] hover:underline hover:text-blue-800 dark:hover:text-[#93b4ff] transition-opacity opacity-80 hover:opacity-100"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  )
}
