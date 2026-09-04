// Run with: npx tsx scripts/record-ai-report-check.ts

import { recordAuditEntry } from "../audit/audit-log";

async function main() {
  await recordAuditEntry({
    type: "EXECUTION_RECEIPT",
    timestamp: new Date().toISOString(),
    payload: {
      channel: "Binance Agent OS (MCP), analysis.getTokenAiReport",
      account: "Agentic sub-account, UID 1273129651",
      request: { token: "BNB" },
      result: "NO_REPORT_RETURNED",
      reason:
        "The tool exists and accepted the call, both for BNB and BTC, but returned only an acknowledgment with no report content and no way to poll for one.",
      note:
        "This looks like a feature that is not fully live yet on Binance's side, not a fault in the request.",
    },
  });

  console.log("Recorded.");
}

main();
