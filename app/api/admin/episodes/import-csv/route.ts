import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Papa from "papaparse";
import { authOptions } from "@/lib/auth";
import { MAX_PANELISTS_PER_EVENT as MAX_PANELISTS } from "@/lib/panelistLimits";

// Everything in the CSV besides the fields mapped below (Phone, Status,
// Talk Title/Description, tracking/portal URLs, speaking time choices,
// promo dates, assistant email) is intentionally dropped on import — see
// phase-1-spec-addendum.md Section 4; Collab Pilot stays system of record
// for that data.

interface ParsedPanelist {
  name: string;
  titleByline: string;
  titleAreaOfExpertise: string;
  bio: string;
  headshotUrl: string;
  email: string;
  freeGiftTitle: string;
  freeGiftDescription: string;
  freeGiftUrl: string;
  vipGiftTitle: string;
  vipGiftDescription: string;
  vipGiftUrl: string;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["super_admin", "editor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csvText = await req.text();
  if (!csvText.trim()) {
    return NextResponse.json({ error: "Empty CSV" }, { status: 400 });
  }

  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    return NextResponse.json(
      { error: `Failed to parse CSV: ${result.errors[0].message}` },
      { status: 400 }
    );
  }

  const headers = result.meta.fields ?? [];
  const missingRequired = ["First Name", "Last Name"].filter(
    (h) => !headers.includes(h)
  );
  if (missingRequired.length > 0) {
    return NextResponse.json(
      {
        error: `CSV is missing required column(s): ${missingRequired.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const skippedRows: string[] = [];
  const panelists: ParsedPanelist[] = [];

  for (const [i, row] of result.data.entries()) {
    const firstName = (row["First Name"] ?? "").trim();
    const lastName = (row["Last Name"] ?? "").trim();
    const name = [firstName, lastName].filter(Boolean).join(" ");

    if (!name) {
      skippedRows.push(`Row ${i + 2} (no name)`);
      continue;
    }

    if (panelists.length >= MAX_PANELISTS) {
      skippedRows.push(`${name} (over the ${MAX_PANELISTS}-panelist limit)`);
      continue;
    }

    panelists.push({
      name,
      titleByline: (row["Byline"] ?? "").trim(),
      titleAreaOfExpertise: (row["Area of Expertise"] ?? "").trim(),
      bio: (row["Bio"] ?? "").trim(),
      headshotUrl: (row["Headshot URL"] ?? "").trim(),
      email: (row["Email"] ?? "").trim(),
      freeGiftTitle: (row["Free Gift Title"] ?? "").trim(),
      freeGiftDescription: (row["Free Gift Description"] ?? "").trim(),
      freeGiftUrl: (row["Free Gift URL"] ?? "").trim(),
      vipGiftTitle: (row["VIP Gift Title"] ?? "").trim(),
      vipGiftDescription: (row["VIP Gift Description"] ?? "").trim(),
      vipGiftUrl: (row["VIP Gift URL"] ?? "").trim(),
    });
  }

  if (panelists.length === 0) {
    return NextResponse.json(
      { error: "No usable panelist rows found in this CSV" },
      { status: 400 }
    );
  }

  return NextResponse.json({ panelists, skippedRows });
}
