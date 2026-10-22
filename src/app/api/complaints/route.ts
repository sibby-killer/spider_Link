import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { complaints, customers } from "@/db/schema";
import { complaintSchema } from "@/lib/validation";
import { buildComplaintMessage, waLink } from "@/lib/whatsapp";
import { generateReference, newId, normalizePhone } from "@/lib/utils";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "complaint"), 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: { code: "rate_limited", message: "Too many complaints. Please try again later." } },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = complaintSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "validation",
          message: "Please check the highlighted fields and try again.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true, data: { reference: generateReference("CMP"), whatsappUrl: "" } });
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "validation",
          message: "Please check the highlighted fields and try again.",
          fieldErrors: { phone: ["Enter a valid Kenyan number, e.g. 0712 345 678"] },
        },
      },
      { status: 400 },
    );
  }

  const [customer] = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);

  const reference = generateReference("CMP");
  const id = newId();

  await db.insert(complaints).values({
    id,
    reference,
    customerId: customer?.id ?? null,
    fullName: parsed.data.fullName,
    phone,
    category: parsed.data.category,
    subject: parsed.data.subject,
    description: parsed.data.description,
    preferredContactTime: parsed.data.preferredContactTime ?? null,
    status: "open",
    priority: parsed.data.category === "no_connection" ? "high" : "normal",
  });

  const message = buildComplaintMessage({
    reference,
    fullName: parsed.data.fullName,
    phone,
    category: parsed.data.category,
    subject: parsed.data.subject,
    description: parsed.data.description,
  });

  return NextResponse.json({
    ok: true,
    data: {
      id,
      reference,
      whatsappUrl: waLink("+254743498210", message),
    },
  });
}
