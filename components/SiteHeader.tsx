import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="bg-brand-purple border-b border-brand-purple-mid">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-white font-bold text-lg tracking-tight">
            Limitless <span className="text-brand-gold">Living</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/episodes"
            className="text-sm text-gray-300 hover:text-white transition-colors hidden sm:block"
          >
            Episodes
          </Link>
          <Link
            href="/guides"
            className="text-sm text-gray-300 hover:text-white transition-colors hidden sm:block"
          >
            Guides
          </Link>
          <a
            href="https://www.youtube.com/@limitlesslivingpodcast"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-300 hover:text-white transition-colors hidden sm:block"
          >
            YouTube
          </a>
          <Link
            href="/assessment"
            className="text-sm bg-brand-gold text-brand-purple-dark font-semibold px-4 py-1.5 rounded-full hover:bg-brand-gold-light transition-colors"
          >
            Free assessment
          </Link>
        </nav>
      </div>
    </header>
  );
}
