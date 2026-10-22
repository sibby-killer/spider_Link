import { NextResponse } from "next/server";
import { db } from "@/db";
import { computeCustomPrice } from "@/lib/pricing";
import { getPricingRule, getSiteConfig } from "@/lib/site-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const config = await getSiteConfig();
  const rule = getPricingRule(config);
  const plans = await import("@/lib/site-config").then((m) => m.getPlans());

  return NextResponse.json({
    ok: true,
    data: {
      installationFee: config.installFee,
      firstMonthFree: config.firstMonthFree,
      rule,
      plans: plans.map((plan) => ({
        id: plan.id,
        slug: plan.slug,
        name: plan.name,
        speedMbps: plan.speedMbps,
        monthlyPrice: plan.priceOverride ?? computeCustomPrice(plan.speedMbps, rule),
        isCustom: plan.isCustom === 1,
      })),
    },
  });
}
