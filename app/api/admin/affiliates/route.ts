import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const routes = await prisma.affiliateRoute.findMany({
    orderBy: [{ isDefault: "desc" }, { crisisCategory: "asc" }, { urgencyLevel: "asc" }],
  });

  return NextResponse.json(routes);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { crisisCategory, urgencyLevel, affiliateName, affiliateUrl, priority, isDefault } = body;

  if (!crisisCategory || !urgencyLevel || !affiliateName || !affiliateUrl) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const route = await prisma.affiliateRoute.create({
    data: {
      crisisCategory,
      urgencyLevel,
      affiliateName,
      affiliateUrl,
      priority: priority ?? 1,
      isActive: true,
      isDefault: isDefault ?? false,
    },
  });

  return NextResponse.json(route);
}
