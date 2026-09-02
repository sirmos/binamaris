import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { SCENARIOS } from "../../../services/events/event-simulator";

export async function GET() {
  return NextResponse.json({ scenarios: SCENARIOS });
}
