import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";

// Auth-only placeholder -- the actual Member Dashboard (replays, guides,
// gifts, directory) is a separately planned build.
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          You&rsquo;re logged in
        </h1>
        <p className="text-sm text-gray-500 mb-6">{session?.user.email}</p>
        <SignOutButton />
      </div>
    </div>
  );
}
