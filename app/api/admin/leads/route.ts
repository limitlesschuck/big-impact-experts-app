import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const resultType = searchParams.get("resultType");
  const page = parseInt(searchParams.get("page") ?? "1");
  const format = searchParams.get("format");
  const limit = 50;
  const skip = (page - 1) * limit;

  const where = {
    ...(category ? { crisisCategory: category } : {}),
    ...(resultType ? { resultType } : {}),
  };

  if (format === "csv") {
    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { sourceEvent: { select: { titleOriginal: true } } },
    });

    const rows = [
      [
        "Date",
        "First name",
        "Email",
        "Crisis category",
        "Duration",
        "Urgency",
        "Score",
        "Result type",
        "Email synced",
        "Source event",
        "Guides downloaded",
      ].join(","),
      ...leads.map((l) =>
        [
          new Date(l.createdAt).toLocaleDateString(),
          l.firstName ?? "",
          l.email,
          l.crisisCategory,
          l.crisisDuration ?? "",
          l.urgency ?? "",
          l.score ?? "",
          l.resultType ?? "",
          l.emailSynced ? "Yes" : "No",
          l.sourceEvent?.titleOriginal ?? "",
          "Not tracked in Phase 1",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    return new NextResponse(rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="bie-leads-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        sourceEvent: { select: { id: true, titleOriginal: true } },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({ leads, total, page, limit });
}
