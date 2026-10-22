import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { plans, requests } from "@/db/schema";
import { requestSchema } from "@/lib/validation";
import { clampCustomSpeed, computeCustomPrice } from "@/lib/pricing";
import { getPricingRule, getSiteConfig } from "@/lib/site-config";
import { buildRequestMessage, waLink } from "@/lib/whatsapp";
import { generateReference, newId, normalizePhone } from "@/lib/utils";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "request"), 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: { code: "rate_limited", message: "Too many requests. Please try again later." } },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
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

  // Honeypot: pretend it worked so bots do not retry.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true, data: { reference: generateReference("SLR"), whatsappUrl: "" } });
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

  const config = await getSiteConfig();
  const rule = getPricingRule(config);

  const [plan] = await db.select().from(plans).where(eq(plans.id, parsed.data.planId)).limit(1);
  if (!plan) {
    return NextResponse.json(
      { ok: false, error: { code: "not_found", message: "That plan is no longer available. Please pick another." } },
      { status: 404 },
    );
  }

  const isCustom = plan.isCustom === 1;
  const speedMbps = isCustom
    ? clampCustomSpeed(parsed.data.speedMbps ?? rule.minCustomMbps, rule)
    : plan.speedMbps;
  const price = isCustom
    ? computeCustomPrice(speedMbps, rule)
    : plan.priceOverride ?? computeCustomPrice(plan.speedMbps, rule);

  const reference = generateReference("SLR");
  const id = newId();

  const referrerPhone = parsed.data.referrerPhone ? normalizePhone(parsed.data.referrerPhone) : null;

  await db.insert(requests).values({
    id,
    reference,
    fullName: parsed.data.fullName,
    phone,
    altPhone: parsed.data.altPhone || null,
    email: parsed.data.email || null,
    area: parsed.data.area,
    county: parsed.data.county || null,
    landmark: parsed.data.landmark || null,
    referrerPhone: referrerPhone && referrerPhone !== phone ? referrerPhone : null,
    planId: plan.id,
    planNameSnapshot: isCustom ? `Custom — ${speedMbps} Mbps` : plan.name,
    speedMbpsSnapshot: speedMbps,
    priceSnapshot: price,
    installationFeeAccepted: 1,
    installationFeeAmount: config.installFee,
    termsAccepted: 1,
    preferredContactTime: parsed.data.preferredContactTime ?? null,
    preferredInstallDate: parsed.data.preferredInstallDate || null,
    referralCode: parsed.data.referralCode || null,
    notes: parsed.data.notes || null,
    source: "web",
  });

  const message = buildRequestMessage(
    {
      reference,
      fullName: parsed.data.fullName,
      phone,
      altPhone: parsed.data.altPhone || null,
      email: parsed.data.email || null,
      planName: isCustom ? `Custom — ${speedMbps} Mbps` : plan.name,
      speedMbps,
      price,
      area: parsed.data.area,
      county: parsed.data.county || null,
      landmark: parsed.data.landmark || null,
      referrerPhone: referrerPhone && referrerPhone !== phone ? referrerPhone : null,
      preferredInstallDate: parsed.data.preferredInstallDate || null,
      preferredContactTime: parsed.data.preferredContactTime ?? null,
      notes: parsed.data.notes || null,
      installationFee: config.installFee,
      installationFeeAccepted: true,
      termsAccepted: true,
    },
    config,
  );

  return NextResponse.json({
    ok: true,
    data: {
      id,
      reference,
      planName: isCustom ? `Custom — ${speedMbps} Mbps` : plan.name,
      speedMbps,
      price,
      installationFee: config.installFee,
      whatsappUrl: waLink(config.whatsappNumber, message),
    },
  });
}
