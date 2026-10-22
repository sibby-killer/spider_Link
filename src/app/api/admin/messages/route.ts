import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { getSessionAdmin } from "@/lib/auth";
import { waLink } from "@/lib/whatsapp";
import { getSiteConfig } from "@/lib/site-config";
import { newId } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: { code: "unauthorized", message: "Sign in required" } }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const toPhone = String(body?.toPhone ?? "").trim();
  const text = String(body?.body ?? "").trim();
  const customerId = body?.customerId ? String(body.customerId) : null;
  const requestId = body?.requestId ? String(body.requestId) : null;
  const complaintId = body?.complaintId ? String(body.complaintId) : null;
  const templateKey = body?.templateKey ? String(body.templateKey) : null;

  if (!toPhone || !text) {
    return NextResponse.json(
      { ok: false, error: { code: "validation", message: "A phone number and message are required." } },
      { status: 400 },
    );
  }

  const config = await getSiteConfig();

  await db.insert(messages).values({
    id: newId(),
    customerId,
    requestId,
    complaintId,
    direction: "outbound",
    channel: "whatsapp",
    body: text,
    templateKey,
    toPhone,
    adminId: admin.id,
  });

  return NextResponse.json({
    ok: true,
    data: { whatsappUrl: waLink(toPhone, text) },
  });
}

export async function GET() {
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: { code: "unauthorized", message: "Sign in required" } }, { status: 401 });
  }

  const rows = await db.select().from(messages).orderBy(desc(messages.createdAt)).limit(200);
  return NextResponse.json({ ok: true, data: rows });
}
