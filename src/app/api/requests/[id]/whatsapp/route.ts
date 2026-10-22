import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { messages, requests } from "@/db/schema";
import { buildRequestMessage, waLink } from "@/lib/whatsapp";
import { getSiteConfig } from "@/lib/site-config";
import { newId } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const templateKey = typeof body.templateKey === "string" ? body.templateKey : null;

  const [row] = await db.select().from(requests).where(eq(requests.id, id)).limit(1);
  if (!row) {
    return NextResponse.json({ ok: false, error: { code: "not_found", message: "Request not found" } }, { status: 404 });
  }

  const config = await getSiteConfig();
  const message = buildRequestMessage(
    {
      reference: row.reference,
      fullName: row.fullName,
      phone: row.phone,
      altPhone: row.altPhone,
      email: row.email,
      planName: row.planNameSnapshot,
      speedMbps: row.speedMbpsSnapshot,
      price: row.priceSnapshot,
      area: row.area,
      landmark: row.landmark,
      preferredInstallDate: row.preferredInstallDate,
      preferredContactTime: row.preferredContactTime,
      notes: row.notes,
      installationFee: row.installationFeeAmount ?? config.installFee,
      installationFeeAccepted: row.installationFeeAccepted === 1,
      termsAccepted: row.termsAccepted === 1,
    },
    config,
  );

  await db.insert(messages).values({
    id: newId(),
    requestId: row.id,
    direction: "outbound",
    channel: "whatsapp",
    body: message,
    templateKey,
    toPhone: row.phone,
  });

  await db
    .update(requests)
    .set({ whatsappSent: 1, whatsappSentAt: new Date().toISOString() })
    .where(eq(requests.id, row.id));

  return NextResponse.json({ ok: true, data: { whatsappUrl: waLink(config.whatsappNumber, message) } });
}
