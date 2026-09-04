import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { resetTreasury } from "../../../domain/vessels/treasury-store";
import { getSessionId } from "../../../services/session/get-session-id";

export async function POST() {
  const sessionId = getSessionId();
  await resetTreasury(sessionId);
  return NextResponse.json({ reset: true });
}
