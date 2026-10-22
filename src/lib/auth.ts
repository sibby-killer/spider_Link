import { hash, verify } from "@node-rs/argon2";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { admins, type Admin } from "@/db/schema";

const SESSION_COOKIE = "spiderlink_admin";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type SessionPayload = {
  adminId: string;
  role: "owner" | "agent";
  tokenVersion: number;
};

function secret(): Uint8Array {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 16) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET must be set (32+ characters) in production");
    }
    return new TextEncoder().encode("spiderlink-dev-secret-do-not-use-in-production");
  }
  return new TextEncoder().encode(value);
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

export async function verifyPassword(hashValue: string, password: string): Promise<boolean> {
  try {
    return await verify(hashValue, password);
  } catch {
    return false;
  }
}

export async function createSessionToken(admin: Admin): Promise<string> {
  return new SignJWT({
    adminId: admin.id,
    role: admin.role,
    tokenVersion: admin.tokenVersion,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      adminId: String(payload.adminId),
      role: payload.role === "owner" ? "owner" : "agent",
      tokenVersion: Number(payload.tokenVersion ?? 0),
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(admin: Admin) {
  const token = await createSessionToken(admin);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export function sessionCookieName() {
  return SESSION_COOKIE;
}

/** Reads the session and re-validates the admin row (deactivation kills the session). */
export async function getSessionAdmin(): Promise<Admin | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  const [admin] = await db.select().from(admins).where(eq(admins.id, payload.adminId)).limit(1);
  if (!admin || !admin.isActive) return null;
  if (admin.tokenVersion !== payload.tokenVersion) return null;
  return admin;
}

export async function requireAdmin(): Promise<Admin | null> {
  return getSessionAdmin();
}

export function isOwner(admin: Admin | null): boolean {
  return admin?.role === "owner";
}
