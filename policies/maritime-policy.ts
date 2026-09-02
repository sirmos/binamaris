// Deterministic policy engine. No LLM call happens in this file.
// Every function here is pure: same input always produces the same output,
// which is what makes the reserve floors and limits testable and auditable.

export type ReserveCategory =
  | "fuel"
  | "port"
  | "crew"
  | "maintenance"
  | "emergency"
  | "discretionary";

export interface ReserveBucket {
  category: ReserveCategory;
  allocated: number;
  minimumFloor: number;
}

export interface Treasury {
  totalBalance: number;
  reserves: ReserveBucket[];
}

export interface PolicyLimits {
  // Any single autonomous decision above this amount always requires
  // human approval, regardless of category or reserve health.
  autonomousTransactionLimit: number;
}

export interface SpendingRequest {
  category: ReserveCategory;
  amount: number;
  reason: string;
}

export type DecisionStatus =
  | "APPROVED"
  | "REJECTED"
  | "HUMAN_APPROVAL_REQUIRED";

export interface PolicyCheck {
  name: string;
  passed: boolean;
  detail: string;
}

export interface DecisionResult {
  status: DecisionStatus;
  checks: PolicyCheck[];
  projectedTotalBalance: number;
  projectedBucketBalance: number | null;
}

function findBucket(
  treasury: Treasury,
  category: ReserveCategory
): ReserveBucket | undefined {
  return treasury.reserves.find((r) => r.category === category);
}

function reasonMatchesCategory(
  category: ReserveCategory,
  reason: string
): boolean {
  const normalizedReason = reason.toLowerCase();

  if (/(non[- ]emergency|not emergency|not an emergency)/i.test(normalizedReason)) {
    return false;
  }

  switch (category) {
    case "emergency":
      return /(emergency|repair|incident|safety|rescue|medical|storm)/i.test(
        normalizedReason
      );
    case "maintenance":
      return /(maintenance|repair|service|inspection|overhaul)/i.test(
        normalizedReason
      );
    case "fuel":
      return /(fuel|diesel|bunker|gas|lubricant)/i.test(normalizedReason);
    case "port":
      return /(port|berth|dock|terminal|pilot|harbor)/i.test(normalizedReason);
    case "crew":
      return /(crew|salary|wages|manpower|cabin|travel)/i.test(normalizedReason);
    case "discretionary":
      return true;
    default:
      return true;
  }
}

export function evaluateSpendingRequest(
  treasury: Treasury,
  limits: PolicyLimits,
  request: SpendingRequest
): DecisionResult {
  const checks: PolicyCheck[] = [];

  const validAmount = request.amount > 0;
  checks.push({
    name: "valid_amount",
    passed: validAmount,
    detail: validAmount
      ? "Requested amount is positive."
      : "Requested amount must be greater than zero.",
  });

  if (!validAmount) {
    return {
      status: "REJECTED",
      checks,
      projectedTotalBalance: treasury.totalBalance,
      projectedBucketBalance: null,
    };
  }

  const projectedTotalBalance = treasury.totalBalance - request.amount;
  const noNegativeTotal = projectedTotalBalance >= 0;
  checks.push({
    name: "no_negative_balance",
    passed: noNegativeTotal,
    detail: noNegativeTotal
      ? "Treasury remains non negative after this spend."
      : "This spend would take the treasury balance below zero.",
  });

  const bucket = findBucket(treasury, request.category);
  let projectedBucketBalance: number | null = null;
  let reserveFloorHeld = true;

  if (bucket) {
    projectedBucketBalance = bucket.allocated - request.amount;
    reserveFloorHeld = projectedBucketBalance >= bucket.minimumFloor;
    checks.push({
      name: "reserve_floor",
      passed: reserveFloorHeld,
      detail: reserveFloorHeld
        ? `${request.category} reserve stays at or above its floor of ${bucket.minimumFloor}.`
        : `${request.category} reserve would drop below its protected floor of ${bucket.minimumFloor}.`,
    });
  } else {
    checks.push({
      name: "reserve_floor",
      passed: false,
      detail: `No reserve bucket is configured for category "${request.category}".`,
    });
    reserveFloorHeld = false;
  }

  const withinAutonomousLimit =
    request.amount <= limits.autonomousTransactionLimit;
  checks.push({
    name: "autonomous_limit",
    passed: withinAutonomousLimit,
    detail: withinAutonomousLimit
      ? `Amount is within the autonomous limit of ${limits.autonomousTransactionLimit}.`
      : `Amount exceeds the autonomous limit of ${limits.autonomousTransactionLimit} and needs human approval.`,
  });

  if (!noNegativeTotal) {
    return {
      status: "REJECTED",
      checks,
      projectedTotalBalance,
      projectedBucketBalance,
    };
  }

  if (!withinAutonomousLimit) {
    return {
      status: "HUMAN_APPROVAL_REQUIRED",
      checks,
      projectedTotalBalance,
      projectedBucketBalance,
    };
  }

  if (!reasonMatchesCategory(request.category, request.reason)) {
    checks.push({
      name: "category_reason_compatibility",
      passed: false,
      detail: `Request category "${request.category}" does not match the stated reason.`,
    });
    return {
      status: "REJECTED",
      checks,
      projectedTotalBalance,
      projectedBucketBalance,
    };
  }

  if (!reserveFloorHeld) {
    return {
      status: "REJECTED",
      checks,
      projectedTotalBalance,
      projectedBucketBalance,
    };
  }

  return {
    status: "APPROVED",
    checks,
    projectedTotalBalance,
    projectedBucketBalance,
  };
}
