import { trackVessel } from "./aisstream-client";
import type { VesselPosition } from "../../domain/vessels/types";

let latestPosition: VesselPosition | null = null;
let connectionState: "idle" | "connecting" | "connected" | "error" = "idle";
let lastError: string | null = null;
let started = false;

export function ensureVesselTracking(): void {
  if (started) return;
  started = true;

  const apiKey = process.env.AISSTREAM_API_KEY;
  const mmsi = process.env.VESSEL_MMSI;

  if (!apiKey || !mmsi) {
    connectionState = "error";
    lastError = "AISSTREAM_API_KEY or VESSEL_MMSI is not set in .env.local";
    return;
  }

  connectionState = "connecting";

  trackVessel({
    apiKey,
    mmsi,
    onPosition: (position) => {
      latestPosition = position;
      connectionState = "connected";
    },
    onError: (err) => {
      connectionState = "error";
      lastError = err.message;
    },
  });
}

export function getVesselState() {
  return {
    connectionState,
    lastError,
    position: latestPosition,
  };
}
