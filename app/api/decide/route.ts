import { NextResponse } from "next/server";
import { getScenario } from "../../../services/events/event-simulator";
import { decide } from "../../../services/decision/decision-engine";

export async function POST(request: Request) {
  const body = await request.json();
  const scenario = getScenario(body.scenarioId);

  if (!scenario) {
    return NextResponse.json({ error: "Unknown scenario" }, { status: 400 });
  }

  const result = await decide(scenario.request);
  return NextResponse.json({ scenario, result });
}
