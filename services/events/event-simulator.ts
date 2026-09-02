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
    title: "Unscheduled hull repair",
    narrative:
      "A hull inspection flagged damage that needs immediate repair before departure.",
    request: {
      category: "emergency",
      amount: 65000,
      reason: "Unscheduled hull repair",
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
    title: "Non-emergency draw on emergency reserve",
    narrative:
      "A request comes in to use the emergency reserve for a non-emergency expense.",
    request: {
      category: "emergency",
      amount: 4000,
      reason: "Crew welfare event, not an emergency",
    },
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
