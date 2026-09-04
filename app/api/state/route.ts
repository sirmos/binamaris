import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { loadTreasury } from "../../../domain/vessels/treasury-store";
import { readAuditLog, readSessionEntries } from "../../../audit/audit-log";
import { getSessionId } from "../../../services/session/get-session-id";

export async function GET() {
  const sessionId = getSessionId();
  const treasury = await loadTreasury(sessionId);
  const globalEntries = await readAuditLog();
  const sessionEntries = await readSessionEntries(sessionId);

  const merged = [...globalEntries, ...sessionEntries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return NextResponse.json({ treasury, audit: merged.slice(0, 20) });
}
