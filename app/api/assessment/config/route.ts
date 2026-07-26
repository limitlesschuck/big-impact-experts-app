import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const record = await prisma.assessmentConfig.findFirst();
  return NextResponse.json(record?.config ?? {});
}
