"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Episodes", href: "/admin/episodes" },
  { label: "Leads", href: "/admin/leads" },
  { label: "Assessment", href: "/admin/assessment" },
  { label: "Coaches", href: "/admin/coaches" },
  { label: "Affiliates", href: "/admin/affiliates" },
  { label: "AI Content", href: "/admin/ai-content" },
  { label: "Settings", href: "/admin/settings" },
];

interface Props {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      <div className="p-5 border-b border-gray-200">
        <p className="text-sm font-semibold text-gray-900 truncate">
          Limitless Living
        </p>
        <p className="text-xs text-gray-500 mt-0.5">Admin</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-gray-900 text-white font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-medium text-gray-900 truncate">
            {user.name ?? user.email}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {user.role?.replace("_", " ")}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/nextjs-app/admin/login" })}
          className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
