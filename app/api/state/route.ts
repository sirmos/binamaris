import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { loadTreasury } from "../../../domain/vessels/treasury-store";
import { readAuditLog } from "../../../audit/audit-log";

export async function GET() {
  const treasury = await loadTreasury();
  const audit = await readAuditLog();
  return NextResponse.json({ treasury, audit: audit.slice(-20).reverse() });
}
