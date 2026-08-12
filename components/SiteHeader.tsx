import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/register", label: "Upcoming Events" },
  { href: "/membership", label: "Become a Member" },
  { href: "/login", label: "Login" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  return (
    <header className="bg-brand-navy border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-white font-bold text-lg tracking-tight">
            Big Impact Experts
          </span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/70 hover:text-white transition-colors hidden sm:block"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
