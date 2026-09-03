// Run with: npx tsx scripts/record-agent-os-execution.ts

import { recordAuditEntry } from "../audit/audit-log";

async function main() {
  await recordAuditEntry({
    type: "EXECUTION_RECEIPT",
    timestamp: new Date().toISOString(),
    payload: {
      channel: "Binance Agent OS (MCP), spot.newOrder",
      account: "Agentic sub-account, UID 1273129651",
      request: {
        symbol: "BNBUSDT",
        side: "SELL",
        type: "MARKET",
        quantity: "0.00029",
      },
      result: "REJECTED_BY_EXCHANGE",
      reason:
        "Order size was below Binance's platform minimum for BNBUSDT: 5 USDT notional, 0.001 BNB step.",
      note:
        "Live write access through Agent OS is working. Binance's own order checks caught this before it reached Binamaris's policy engine.",
    },
  });

  console.log("Recorded.");
}

main();
