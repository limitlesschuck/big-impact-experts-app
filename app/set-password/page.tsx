import { prisma } from "@/lib/prisma";
import { hashResetToken } from "@/lib/memberAuth";
import SetPasswordForm from "@/components/SetPasswordForm";

export const dynamic = "force-dynamic";

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token ?? "";

  const member = token
    ? await prisma.member.findFirst({
        where: {
          passwordResetToken: hashResetToken(token),
          passwordResetExpires: { gt: new Date() },
        },
        select: { id: true },
      })
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              Big Impact Experts
            </h1>
            <p className="text-sm text-gray-500 mt-1">Set your password</p>
          </div>

          {member ? (
            <SetPasswordForm token={token} />
          ) : (
            <p className="text-sm text-gray-600">
              This link is invalid or has expired. Contact us and we&rsquo;ll send you a new one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
