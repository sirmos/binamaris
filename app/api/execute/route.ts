import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { recordAuditEntry } from "../../../audit/audit-log";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.channel || !body.result) {
    return NextResponse.json(
      { error: "channel and result are required" },
      { status: 400 }
    );
  }

  await recordAuditEntry({
    type: "EXECUTION_RECEIPT",
    timestamp: new Date().toISOString(),
    payload: {
      channel: body.channel,
      account: body.account ?? null,
      request: body.request ?? null,
      result: body.result,
      reason: body.reason ?? null,
      note: body.note ?? null,
    },
  });

  return NextResponse.json({ recorded: true });
}
