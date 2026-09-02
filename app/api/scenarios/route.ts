import { NextResponse } from "next/server";
import { SCENARIOS } from "../../../services/events/event-simulator";

export async function GET() {
  return NextResponse.json({ scenarios: SCENARIOS });
}
