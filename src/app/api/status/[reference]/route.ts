import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { requests } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_COPY: Record<string, string> = {
  new: "We have your request. We will call you shortly.",
  contacted: "We have spoken to you — next step is the site survey.",
  survey_scheduled: "Your site survey is booked.",
  survey_done: "Survey complete. Installation is being scheduled.",
  installed: "Installation done — we are finishing the setup.",
  activated: "You are online. Welcome aboard!",
  rejected: "We could not serve your area this time.",
};

export async function GET(request: Request, context: { params: Promise<{ reference: string }> }) {
  const { reference } = await context.params;
  const phoneLast4 = new URL(request.url).searchParams.get("phoneLast4") ?? "";

  const [row] = await db.select().from(requests).where(eq(requests.reference, reference.toUpperCase())).limit(1);
  if (!row) {
    return NextResponse.json({ ok: false, error: { code: "not_found", message: "We could not find that reference." } }, { status: 404 });
  }

  if (row.phone.slice(-4) !== phoneLast4) {
    return NextResponse.json(
      { ok: false, error: { code: "mismatch", message: "That phone number does not match this reference." } },
      { status: 403 },
    );
  }

  return NextResponse.json({
    ok: true,
    data: {
      reference: row.reference,
      fullName: row.fullName,
      planName: row.planNameSnapshot,
      speedMbps: row.speedMbpsSnapshot,
      price: row.priceSnapshot,
      status: row.status,
      statusMessage: STATUS_COPY[row.status] ?? "Your request is in progress.",
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    },
  });
}
