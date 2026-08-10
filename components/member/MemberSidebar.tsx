"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    isActive: (pathname: string) => pathname === "/dashboard" || pathname.startsWith("/dashboard/events"),
  },
  {
    label: "Directory",
    href: "/dashboard/directory",
    isActive: (pathname: string) => pathname.startsWith("/dashboard/directory"),
  },
];

interface Props {
  user: {
    email?: string | null;
  };
}

export default function MemberSidebar({ user }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-brand-navy flex flex-col min-h-screen">
      <div className="p-5 border-b border-white/10">
        <p className="text-sm font-semibold text-white truncate">Big Impact Experts</p>
        <p className="text-xs text-white/50 mt-0.5">Member Dashboard</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = item.isActive(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-brand-orange text-white font-medium"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-medium text-white truncate">{user.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
