import { appendFile, readFile, mkdir } from "node:fs/promises";
import path from "node:path";

const LOG_PATH = path.join(process.cwd(), "audit", "log.ndjson");
const SESSIONS_DIR = path.join(process.cwd(), "audit", "sessions");

export type AuditEntryType = "DECISION" | "EXECUTION_RECEIPT";

export interface AuditEntry {
  type: AuditEntryType;
  timestamp: string;
  payload: Record<string, unknown>;
}

// Global log. Only for things that genuinely happened once and should be
// visible to every visitor: real Agent OS execution receipts.
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

// Session-scoped log. For decisions made by a specific visitor's own
// scenario runs, so one visitor's clicks never show up in another's feed.
function sessionLogPath(sessionId: string): string {
  return path.join(SESSIONS_DIR, `${sessionId}.ndjson`);
}

export async function recordSessionEntry(
  sessionId: string,
  entry: AuditEntry
): Promise<void> {
  await mkdir(SESSIONS_DIR, { recursive: true });
  const line = JSON.stringify(entry) + "\n";
  await appendFile(sessionLogPath(sessionId), line, "utf8");
}

export async function readSessionEntries(sessionId: string): Promise<AuditEntry[]> {
  try {
    const raw = await readFile(sessionLogPath(sessionId), "utf8");
    return raw
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}
