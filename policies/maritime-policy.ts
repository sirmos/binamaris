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

  if (!noNegativeTotal || !reserveFloorHeld) {
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

  return {
    status: "APPROVED",
    checks,
    projectedTotalBalance,
    projectedBucketBalance,
  };
}
