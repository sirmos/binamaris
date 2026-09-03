import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { recordAuditEntry } from "../../../audit/audit-log";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.orderId || !body.symbol || !body.side) {
    return NextResponse.json(
      { error: "orderId, symbol, and side are required" },
      { status: 400 }
    );
  }

  await recordAuditEntry({
    type: "EXECUTION_RECEIPT",
    timestamp: new Date().toISOString(),
    payload: {
      orderId: body.orderId,
      symbol: body.symbol,
      side: body.side,
      amount: body.amount,
      price: body.price,
      note: body.note ?? null,
    },
  });

  return NextResponse.json({ recorded: true });
}
