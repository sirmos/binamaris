import { describe, expect, it } from "vitest";
import {
  evaluateSpendingRequest,
  type Treasury,
  type PolicyLimits,
} from "./maritime-policy";

const treasury: Treasury = {
  totalBalance: 250000,
  reserves: [
    { category: "fuel", allocated: 90000, minimumFloor: 20000 },
    { category: "port", allocated: 35000, minimumFloor: 10000 },
    { category: "crew", allocated: 20000, minimumFloor: 5000 },
    { category: "maintenance", allocated: 50000, minimumFloor: 20000 },
    { category: "emergency", allocated: 40000, minimumFloor: 35000 },
    { category: "discretionary", allocated: 15000, minimumFloor: 0 },
  ],
};

const limits: PolicyLimits = {
  autonomousTransactionLimit: 25000,
};

describe("evaluateSpendingRequest", () => {
  it("approves a routine maintenance spend within reserve and limit", () => {
    const result = evaluateSpendingRequest(treasury, limits, {
      category: "maintenance",
      amount: 17500,
      reason: "Main engine maintenance",
    });
    expect(result.status).toBe("APPROVED");
  });

  it("requires human approval above the autonomous limit", () => {
    const result = evaluateSpendingRequest(treasury, limits, {
      category: "emergency",
      amount: 65000,
      reason: "Emergency repair",
    });
    expect(result.status).toBe("HUMAN_APPROVAL_REQUIRED");
  });

  it("rejects a spend that would breach a protected reserve floor", () => {
    const result = evaluateSpendingRequest(treasury, limits, {
      category: "emergency",
      amount: 4000,
      reason: "Non emergency use of emergency reserve",
    });
    expect(result.status).toBe("REJECTED");
  });

  it("rejects a spend that would take the treasury negative", () => {
    const result = evaluateSpendingRequest(treasury, limits, {
      category: "discretionary",
      amount: 999999,
      reason: "Unrealistic spend",
    });
    expect(result.status).toBe("REJECTED");
  });

  it("rejects a zero or negative amount", () => {
    const result = evaluateSpendingRequest(treasury, limits, {
      category: "port",
      amount: 0,
      reason: "Invalid",
    });
    expect(result.status).toBe("REJECTED");
  });
});
