// Run with: npx tsx scripts/reset-treasury.ts
// Deletes the current treasury state file so the next loadTreasury()
// call reseeds it back to the default $250,000 starting position.

import { unlink } from "node:fs/promises";
import path from "node:path";

const STORE_PATH = path.join(process.cwd(), "domain", "vessels", "treasury-state.json");

async function main() {
  try {
    await unlink(STORE_PATH);
    console.log("Treasury state reset. Next run will reseed to defaults.");
  } catch {
    console.log("No existing treasury state file found, nothing to reset.");
  }
}

main();
