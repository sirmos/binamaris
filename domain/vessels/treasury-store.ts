import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Treasury } from "../../policies/maritime-policy";

const STORE_PATH = path.join(process.cwd(), "domain", "vessels", "treasury-state.json");

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

export async function loadTreasury(): Promise<Treasury> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    await writeFile(STORE_PATH, JSON.stringify(SEED_TREASURY, null, 2), "utf8");
    return SEED_TREASURY;
  }
}

export async function saveTreasury(treasury: Treasury): Promise<void> {
  await writeFile(STORE_PATH, JSON.stringify(treasury, null, 2), "utf8");
}

export async function applyApprovedSpend(
  category: string,
  amount: number
): Promise<Treasury> {
  const treasury = await loadTreasury();
  treasury.totalBalance -= amount;
  const bucket = treasury.reserves.find((r) => r.category === category);
  if (bucket) {
    bucket.allocated -= amount;
  }
  await saveTreasury(treasury);
  return treasury;
}
