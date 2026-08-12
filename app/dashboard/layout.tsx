import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardTopBar from "@/components/member/DashboardTopBar";
import ExpertMatchWidget from "@/components/member/ExpertMatchWidget";
import { ExpertMatchProvider } from "@/components/member/ExpertMatchContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.userType !== "member") {
    redirect("/login");
  }

  // Re-checked live on every navigation, not just at login -- the JWT
  // has no status field (correctly, since it's mutable state, not
  // identity), so a member disabled after signing in would otherwise
  // keep a validly-signed session until it naturally expires.
  const member = await prisma.member.findUnique({
    where: { id: session.user.id },
    select: { status: true },
  });

  if (!member || member.status === "disabled") {
    redirect("/login");
  }

  return (
    <ExpertMatchProvider>
      <div className="min-h-screen bg-brand-bg">
        <DashboardTopBar user={session.user} />
        <main className="max-w-5xl mx-auto p-8">{children}</main>
        <ExpertMatchWidget />
      </div>
    </ExpertMatchProvider>
  );
}
