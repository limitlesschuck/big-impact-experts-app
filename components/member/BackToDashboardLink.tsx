import Link from "next/link";

export default function BackToDashboardLink() {
  return (
    <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
      ← Back to Dashboard
    </Link>
  );
}
