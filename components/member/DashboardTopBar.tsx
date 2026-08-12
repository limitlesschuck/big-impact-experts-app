"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

interface Props {
  user: {
    email?: string | null;
  };
}

// Replaces MemberSidebar site-wide. The old sidebar's two links
// (Dashboard, Directory) are now a subset of the six first-class
// destination blocks on /dashboard itself -- a persistent sidebar
// duplicating some of those destinations is redundant chrome once every
// destination has its own big block entry point. Wayfinding back to the
// landing page is a "← Back to Dashboard" link on each destination page
// instead (see BackToDashboardLink.tsx).
export default function DashboardTopBar({ user }: Props) {
  return (
    <header className="bg-brand-navy border-b border-white/10">
      <div className="max-w-5xl mx-auto px-8 flex items-center justify-between h-16">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white truncate">Big Impact Experts</span>
          <span className="text-xs text-white/50">Member Dashboard</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/60 truncate hidden sm:block">{user.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
