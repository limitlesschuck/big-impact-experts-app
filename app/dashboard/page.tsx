import Link from "next/link";
import SearchWithAIButton from "@/components/member/SearchWithAIButton";

export const dynamic = "force-dynamic";

interface DashboardBlock {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "w-7 h-7",
};

const BLOCKS: DashboardBlock[] = [
  {
    href: "/dashboard/upcoming",
    title: "Upcoming Events",
    description: "See what's next and save your seat.",
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
    ),
  },
  {
    href: "/dashboard/replays",
    title: "Past Event Replays",
    description: "Every past panel, permanently available.",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="12" cy="12" r="9" />
        <path d="M10 9l5 3-5 3V9z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/training",
    title: "Workshops & Training",
    description: "Hands-on training sessions from our experts.",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M3 5h18M3 5v10a2 2 0 002 2h4l-1 3h8l-1-3h4a2 2 0 002-2V5" />
      </svg>
    ),
  },
  {
    href: "/dashboard/directory",
    title: "Experts Directory",
    description: "Browse every expert who's presented.",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M15.5 14.2c2.6.4 4.5 2.7 4.5 5.8" />
      </svg>
    ),
  },
  {
    href: "/dashboard/guides",
    title: "Guides & Checklists",
    description: "Frameworks and action items, ready to download.",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M4 4.5A2.5 2.5 0 016.5 2H20v17H6.5A2.5 2.5 0 004 16.5v-12z" />
        <path d="M4 16.5A2.5 2.5 0 016.5 19H20" />
      </svg>
    ),
  },
  {
    href: "/dashboard/tools",
    title: "Tools & Resources",
    description: "Free and VIP gifts from every expert.",
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="3" y="9" width="18" height="11" rx="1.5" />
        <path d="M3 13h18M12 9v11" />
        <path d="M12 9c-1.5 0-3-1-3-2.8S10.3 3 12 4.5 15 4.4 15 6.2 13.5 9 12 9z" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Where do you want to go?</p>
      </div>

      <div className="mb-8">
        <SearchWithAIButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {BLOCKS.map((block) => (
          <Link
            key={block.href}
            href={block.href}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-brand-orange/40 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-bg text-brand-navy flex items-center justify-center mb-4">
              {block.icon}
            </div>
            <p className="text-base font-semibold text-gray-900">{block.title}</p>
            <p className="text-sm text-gray-500 mt-1">{block.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
