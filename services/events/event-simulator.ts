import type { SpendingRequest } from "../../policies/maritime-policy";

export interface Scenario {
  id: string;
  title: string;
  narrative: string;
  request: SpendingRequest;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "routine-maintenance",
    title: "Routine engine maintenance",
    narrative:
      "Scheduled maintenance on the main engine is due at the next port call.",
    request: {
      category: "maintenance",
      amount: 17500,
      reason: "Scheduled main engine maintenance",
    },
  },
  {
    id: "emergency-repair",
    title: "Critical engine repair before departure",
    narrative:
      "A safety inspection flagged a critical engine defect that needs immediate repair before departure, but the amount exceeds the autonomous approval threshold.",
    request: {
      category: "maintenance",
      amount: 30000,
      reason: "Emergency engine repair before departure",
    },
  },
  {
    id: "port-fee-spike",
    title: "Port fee increase",
    narrative: "The destination port raised docking fees ahead of arrival.",
    request: {
      category: "port",
      amount: 8200,
      reason: "Increased docking fee at destination port",
    },
  },
  {
    id: "reserve-protecting-rejection",
    title: "Draw on emergency reserve below its protected floor",
    narrative:
      "A request comes in to spend from the emergency reserve for a non-emergency purpose, which would drop the reserve below its protected minimum.",
    request: {
      category: "emergency",
      amount: 8000,
      reason: "Non emergency use of emergency reserve",
    },
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
