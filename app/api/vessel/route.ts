import { NextResponse } from "next/server";
import { ensureVesselTracking, getVesselState } from "../../../services/ais/vessel-cache";
import { TRACKED_VESSEL } from "../../../domain/vessels/identity";

export async function GET() {
  ensureVesselTracking();
  const state = getVesselState();
  return NextResponse.json({ vessel: TRACKED_VESSEL, ...state });
}
