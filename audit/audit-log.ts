import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";

const LOG_PATH = path.join(process.cwd(), "audit", "log.ndjson");

export type AuditEntryType = "DECISION" | "EXECUTION_RECEIPT";

export interface AuditEntry {
  type: AuditEntryType;
  timestamp: string;
  payload: Record<string, unknown>;
}

export async function recordAuditEntry(entry: AuditEntry): Promise<void> {
  const line = JSON.stringify(entry) + "\n";
  await appendFile(LOG_PATH, line, "utf8");
}

export async function readAuditLog(): Promise<AuditEntry[]> {
  try {
    const raw = await readFile(LOG_PATH, "utf8");
    return raw
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}
