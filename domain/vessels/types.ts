export interface VesselIdentity {
  name: string;
  mmsi: string;
  imo?: string;
  flag?: string;
}

export interface VesselPosition {
  latitude: number;
  longitude: number;
  speedKnots: number;
  course: number;
  destination: string | null;
  timestamp: string;
}
