import WebSocket from "ws";
import type { VesselPosition } from "../../domain/vessels/types";

interface AisStreamOptions {
  apiKey: string;
  mmsi: string;
  onPosition: (position: VesselPosition) => void;
  onError?: (error: Error) => void;
}

export function trackVessel(options: AisStreamOptions): WebSocket {
  const socket = new WebSocket("wss://stream.aisstream.io/v0/stream");

  socket.on("open", () => {
    const subscription = {
      APIKey: options.apiKey,
      BoundingBoxes: [[[-90, -180], [90, 180]]],
      FiltersShipMMSI: [options.mmsi],
    };
    socket.send(JSON.stringify(subscription));
  });

  socket.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.MessageType === "PositionReport") {
        const report = msg.Message.PositionReport;
        const position: VesselPosition = {
          latitude: report.Latitude,
          longitude: report.Longitude,
          speedKnots: report.Sog,
          course: report.Cog,
          destination: msg.MetaData?.Destination ?? null,
          timestamp: msg.MetaData?.time_utc ?? new Date().toISOString(),
        };
        options.onPosition(position);
      }
    } catch (err) {
      options.onError?.(err as Error);
    }
  });

  socket.on("error", (err) => {
    options.onError?.(err as Error);
  });

  return socket;
}
