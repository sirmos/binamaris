import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { unlink } from "node:fs/promises";
import path from "node:path";

const STORE_PATH = path.join(process.cwd(), "domain", "vessels", "treasury-state.json");

export async function POST() {
  try {
    await unlink(STORE_PATH);
  } catch {
    // No file yet, that's fine.
  }
  return NextResponse.json({ reset: true });
}
