// Run with: npx tsx scripts/reset-treasury.ts
// Resets the "cli-local" session's treasury back to the default seed.
// This is separate from any real visitor's session.

import { resetTreasury } from "../domain/vessels/treasury-store";

async function main() {
  await resetTreasury("cli-local");
  console.log("Treasury state reset for cli-local. Next run will reseed to defaults.");
}

main();
