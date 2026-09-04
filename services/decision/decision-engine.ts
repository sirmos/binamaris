import {
  evaluateSpendingRequest,
  type SpendingRequest,
  type DecisionResult,
} from "../../policies/maritime-policy";
import { DEFAULT_POLICY_LIMITS } from "../../policies/limits";
import { loadTreasury, applyApprovedSpend } from "../../domain/vessels/treasury-store";
import { recordSessionEntry } from "../../audit/audit-log";

export async function decide(
  sessionId: string,
  request: SpendingRequest
): Promise<DecisionResult> {
  const treasury = await loadTreasury(sessionId);
  const result = evaluateSpendingRequest(treasury, DEFAULT_POLICY_LIMITS, request);

  await recordSessionEntry(sessionId, {
    type: "DECISION",
    timestamp: new Date().toISOString(),
    payload: {
      request,
      status: result.status,
      checks: result.checks,
    },
  });

  if (result.status === "APPROVED") {
    await applyApprovedSpend(sessionId, request.category, request.amount);
  }

  return result;
}
