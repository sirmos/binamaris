import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

const COOKIE_NAME = "binamaris_sid";

export function getSessionId(): string {
  const store = cookies();
  const existing = store.get(COOKIE_NAME)?.value;
  if (existing) return existing;

  const id = randomUUID();
  store.set(COOKIE_NAME, id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: "lax",
  });
  return id;
}
