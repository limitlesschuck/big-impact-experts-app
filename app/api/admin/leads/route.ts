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
  const guideEpisodeId = searchParams.get("guideEpisodeId");
  const page = parseInt(searchParams.get("page") ?? "1");
  const format = searchParams.get("format");
  const limit = 50;
  const skip = (page - 1) * limit;

  let emailsForGuide: string[] | null = null;
  if (guideEpisodeId) {
    const downloads = await prisma.guideDownload.findMany({
      where: { episodeId: guideEpisodeId },
      select: { email: true },
      distinct: ["email"],
    });
    emailsForGuide = downloads.map((d) => d.email);
  }

  const where = {
    ...(category ? { crisisCategory: category } : {}),
    ...(resultType ? { resultType } : {}),
    ...(emailsForGuide ? { email: { in: emailsForGuide } } : {}),
  };

  if (format === "csv") {
    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { sourceEpisode: { select: { titleOriginal: true } } },
    });

    const emails = leads.map((l) => l.email);
    const allDownloads = await prisma.guideDownload.findMany({
      where: { email: { in: emails } },
      include: { episode: { select: { titleOriginal: true, titleYoutube: true } } },
    });
    const downloadsByEmail = new Map<string, string[]>();
    for (const d of allDownloads) {
      const title = d.episode.titleYoutube ?? d.episode.titleOriginal;
      const list = downloadsByEmail.get(d.email) ?? [];
      list.push(title);
      downloadsByEmail.set(d.email, list);
    }

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
        "Source episode",
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
          l.sourceEpisode?.titleOriginal ?? "",
          (downloadsByEmail.get(l.email) ?? []).join("; "),
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    return new NextResponse(rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="lls-leads-${new Date().toISOString().split("T")[0]}.csv"`,
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
        sourceEpisode: { select: { id: true, titleOriginal: true } },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  const leadEmails = leads.map((l) => l.email);
  const guideDownloads = leadEmails.length
    ? await prisma.guideDownload.findMany({
        where: { email: { in: leadEmails } },
        orderBy: { createdAt: "desc" },
        include: { episode: { select: { id: true, titleOriginal: true, titleYoutube: true } } },
      })
    : [];

  const downloadsByEmail = new Map<string, typeof guideDownloads>();
  for (const d of guideDownloads) {
    const list = downloadsByEmail.get(d.email) ?? [];
    list.push(d);
    downloadsByEmail.set(d.email, list);
  }

  const leadsWithDownloads = leads.map((lead) => ({
    ...lead,
    guideDownloads: (downloadsByEmail.get(lead.email) ?? []).map((d) => ({
      id: d.id,
      episodeId: d.episode.id,
      episodeTitle: d.episode.titleYoutube ?? d.episode.titleOriginal,
      createdAt: d.createdAt,
    })),
  }));

  return NextResponse.json({ leads: leadsWithDownloads, total, page, limit });
}
