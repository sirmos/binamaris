import { readFile, writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import type { Treasury } from "../../policies/maritime-policy";

const SESSIONS_DIR = path.join(process.cwd(), "domain", "vessels", "sessions");

const SEED_TREASURY: Treasury = {
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

function storePath(sessionId: string): string {
  return path.join(SESSIONS_DIR, `${sessionId}.json`);
}

export async function loadTreasury(sessionId: string): Promise<Treasury> {
  try {
    const raw = await readFile(storePath(sessionId), "utf8");
    return JSON.parse(raw);
  } catch {
    await mkdir(SESSIONS_DIR, { recursive: true });
    await writeFile(storePath(sessionId), JSON.stringify(SEED_TREASURY, null, 2), "utf8");
    return SEED_TREASURY;
  }
}

export async function saveTreasury(sessionId: string, treasury: Treasury): Promise<void> {
  await mkdir(SESSIONS_DIR, { recursive: true });
  await writeFile(storePath(sessionId), JSON.stringify(treasury, null, 2), "utf8");
}

export async function resetTreasury(sessionId: string): Promise<void> {
  try {
    await unlink(storePath(sessionId));
  } catch {
    // No file yet, nothing to reset.
  }
}

export async function applyApprovedSpend(
  sessionId: string,
  category: string,
  amount: number
): Promise<Treasury> {
  const treasury = await loadTreasury(sessionId);
  treasury.totalBalance -= amount;
  const bucket = treasury.reserves.find((r) => r.category === category);
  if (bucket) {
    bucket.allocated -= amount;
  }
  await saveTreasury(sessionId, treasury);
  return treasury;
}
