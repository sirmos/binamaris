// Run with: npx tsx scripts/record-payment-tool-check.ts

import { recordAuditEntry } from "../audit/audit-log";

async function main() {
  await recordAuditEntry({
    type: "EXECUTION_RECEIPT",
    timestamp: new Date().toISOString(),
    payload: {
      channel: "Binance Agent OS (MCP), payment or transfer tools",
      account: "Agentic sub-account, UID 1273129651",
      request: {
        namesChecked: [
          "wallet.universalTransfer",
          "wallet.transfer",
          "capital.withdraw",
          "wallet.withdraw",
          "subAccount.transfer",
          "asset.transfer",
        ],
      },
      result: "NO_TOOL_FOUND",
      reason:
        "Every plausible name for a payment or transfer tool returned Tool not found. Only Convert, read-only account and market data, and spot.newOrder are exposed by this MCP server right now.",
      note:
        "Agent-to-agent payment workflows are not available through this server yet, at least not under any name we tried.",
    },
  });

  console.log("Recorded.");
}

main();
