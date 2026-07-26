import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getStats() {
  const [episodes, leads, coaches, pendingEpisodes] = await Promise.all([
    prisma.episode.count(),
    prisma.lead.count(),
    prisma.coach.count(),
    prisma.episode.count({ where: { publishStatus: "approved" } }),
  ]);
  return { episodes, leads, coaches, pendingEpisodes };
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const stats = await getStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, {session?.user?.name ?? session?.user?.email}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        <StatCard label="Total episodes" value={stats.episodes} />
        <StatCard label="Total leads" value={stats.leads} />
        <StatCard label="Active coaches" value={stats.coaches} />
        <StatCard
          label="Ready to publish"
          value={stats.pendingEpisodes}
          highlight={stats.pendingEpisodes > 0}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <QuickAction
            href="/admin/episodes/new"
            label="Add episode"
            description="Manually enter episode details"
          />
          <QuickAction
            href="/admin/episodes?filter=draft"
            label="Review AI content"
            description="Approve generated titles and descriptions"
          />
          <QuickAction
            href="/admin/leads"
            label="View leads"
            description="See latest assessment submissions"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight
          ? "bg-gray-900 border-gray-900 text-white"
          : "bg-white border-gray-200"
      }`}
    >
      <p
        className={`text-3xl font-semibold ${
          highlight ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
      </p>
      <p
        className={`text-xs mt-1 ${
          highlight ? "text-gray-300" : "text-gray-500"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block p-4 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors"
    >
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </Link>
  );
}
