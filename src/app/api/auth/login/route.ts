import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { admins, auditLog } from "@/db/schema";
import { loginSchema } from "@/lib/validation";
import { clearSessionCookie, setSessionCookie, verifyPassword } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { newId } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  const limit = rateLimit(clientKey(request, "login"), 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: { code: "rate_limited", message: "Too many attempts. Try again in a few minutes." } },
      { status: 429 },
    );
  }

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: { code: "validation", message: "Enter your email and password." } },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);

  const valid = admin && admin.isActive ? await verifyPassword(admin.passwordHash, parsed.data.password) : false;

  await db.insert(auditLog).values({
    id: newId(),
    adminId: admin?.id ?? null,
    action: valid ? "admin.login" : "admin.login_failed",
    entity: "admin",
    entityId: admin?.id ?? null,
    detail: valid ? "Signed in" : `Failed sign-in for ${email}`,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  });

  if (!valid) {
    return NextResponse.json(
      { ok: false, error: { code: "unauthorized", message: "Invalid email or password." } },
      { status: 401 },
    );
  }

  await db.update(admins).set({ lastLoginAt: new Date().toISOString() }).where(eq(admins.id, admin.id));
  await setSessionCookie(admin);

  return NextResponse.json({ ok: true, data: { name: admin.name, role: admin.role } });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
