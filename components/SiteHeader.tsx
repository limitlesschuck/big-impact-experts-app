import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-white font-bold text-lg tracking-tight">
            Big Impact Experts
          </span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/episodes"
            className="text-sm text-gray-300 hover:text-white transition-colors hidden sm:block"
          >
            Events
          </Link>
        </nav>
      </div>
    </header>
  );
}
