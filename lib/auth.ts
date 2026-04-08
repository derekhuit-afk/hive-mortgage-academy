import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export const AUTH_KEY = "hma_student";
export const TOKEN_KEY = "hma_token";
export const SALT_ROUNDS = 10;

// ── Password hashing (bcrypt) ─────────────────────────────────────────────
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  // Support legacy SHA-256 hashes during migration period
  if (!hash.startsWith("$2b$") && !hash.startsWith("$2a$")) {
    const { createHash } = await import("crypto");
    const legacy = createHash("sha256")
      .update(plain + (process.env.PASSWORD_SALT || "hma_salt_2026"))
      .digest("hex");
    return legacy === hash;
  }
  return bcrypt.compare(plain, hash);
}

// ── Session tokens ────────────────────────────────────────────────────────
export function generateToken(): string {
  return uuidv4().replace(/-/g, "") + uuidv4().replace(/-/g, "");
}

// ── Client-side session helpers ───────────────────────────────────────────
export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(student: object, token: string) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(student));
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearSession() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

// ── Server-side: validate token + studentId match ─────────────────────────
export async function validateRequest(
  req: Request,
  expectedStudentId?: string
): Promise<{ valid: boolean; studentId?: string }> {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return { valid: false };

  const { supabaseAdmin } = await import("@/lib/supabase");
  const { data } = await supabaseAdmin
    .from("hma_students")
    .select("id")
    .eq("session_token", token)
    .maybeSingle();

  if (!data) return { valid: false };
  if (expectedStudentId && data.id !== expectedStudentId) return { valid: false };
  return { valid: true, studentId: data.id };
}
