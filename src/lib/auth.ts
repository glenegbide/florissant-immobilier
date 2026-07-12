import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "fl_admin";

export function adminToken(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET manquant dans .env");
  return createHmac("sha256", secret).update("florissant-admin").digest("hex");
}

export function checkCredentials(email: string, password: string): boolean {
  const okEmail = email.trim().toLowerCase() === (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const expected = Buffer.from((process.env.ADMIN_PASSWORD || "").trim());
  const given = Buffer.from(password.trim());
  const okPass =
    expected.length > 0 &&
    expected.length === given.length &&
    timingSafeEqual(expected, given);
  return okEmail && okPass;
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const v = store.get(ADMIN_COOKIE)?.value;
  return !!v && v === adminToken();
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Non autorisé");
}
