import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { getScenario } from "../../../services/events/event-simulator";
import { decide } from "../../../services/decision/decision-engine";
import { getSessionId } from "../../../services/session/get-session-id";

export async function POST(request: Request) {
  const body = await request.json();
  const scenario = getScenario(body.scenarioId);

  if (!scenario) {
    return NextResponse.json({ error: "Unknown scenario" }, { status: 400 });
  }

  const sessionId = getSessionId();
  const result = await decide(sessionId, scenario.request);
  return NextResponse.json({ scenario, result });
}
