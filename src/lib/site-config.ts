import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { contentBlocks, plans, settings, type ContentBlock, type Plan } from "@/db/schema";
import { DEFAULT_PRICING_RULE, type PricingRule } from "./pricing";

/**
 * Every value the public site shows lives here. The admin Content Manager writes
 * to these keys; the site renders whatever is stored here (falling back to the
 * defaults below when a key is missing).
 */
export const SITE_DEFAULTS = {
  brandName: "Spider Link Solution",
  brandTagline: "Unlimited Fiber To Your Home",
  brandTaglineAlt: "Fast. Stable. Reliable Internet!",

  announcementEnabled: true,
  announcementText: "First month FREE on every plan — installation from Ksh 2,500.",

  heroEyebrow: "Unlimited Fibre",
  heroTitle: "Unlimited Fiber To Your Home",
  heroSubtitle: "Fast. Stable. Reliable Internet!",
  heroPrimaryCta: "Request Installation",
  heroSecondaryCta: "See Plans",
  heroShow3d: true,

  installFee: 2500,
  installFeeIncludes: "Router + installation & setup",
  installFeeTiming: "Pay once, before installation day",
  firstMonthFree: true,
  firstMonthFreeLabel: "First Month FREE",

  pricingBaseSpeedMbps: DEFAULT_PRICING_RULE.baseSpeedMbps,
  pricingBasePrice: DEFAULT_PRICING_RULE.basePrice,
  pricingPerMbps: DEFAULT_PRICING_RULE.pricePerMbps,
  pricingMinCustomMbps: DEFAULT_PRICING_RULE.minCustomMbps,
  pricingMaxCustomMbps: DEFAULT_PRICING_RULE.maxCustomMbps,
  pricingRounding: DEFAULT_PRICING_RULE.rounding,

  whatsappNumber: "+254743498210",
  phonePrimary: "+254743498210",
  phoneSecondary: "+254762667048",
  phonePrimaryDisplay: "0743 498 210",
  phoneSecondaryDisplay: "0762 667 048",
  email: "info@spiderlink.co.ke",
  location: "Kakamega, Kenya",
  supportHours: "24/7 Customer Support",

  mainLocation: "Kakamega, Kenya",
  coveredCounties: "Kakamega, Bungoma",
  techniciansIntro:
    "Our installation crew knows Kakamega and Bungoma street by street. Pick who you would like to handle your installation — they will call you and come to you.",
  techniciansAreaNote: "Available in Kakamega and Bungoma.",

  referralEnabled: true,
  referralNote:
    "We are still growing, and every referral helps us reach more homes. Refer a friend and if they get installed, you get 60 extra days free on your current plan.",
  referralTargetCount: 10,
  referralRewardDays: 60,

  mpesaPaybill: "",
  mpesaAccountName: "",
  paymentInstructions: "Pay via M-Pesa to the PayBill number above, then send us the confirmation code.",
  acceptedPaymentMethods: "M-Pesa",

  consentInstallText: "I accept the Ksh 2,500 installation fee (router + installation & setup).",
  consentTermsText: "I agree to the Terms & Conditions.",
  termsAndConditions:
    "Spider Link Solution installs and supports home fibre broadband. Installation is subject to a site survey, which confirms that the fibre network reaches your home. Monthly subscriptions are billed monthly and the first month is free. Speeds quoted are maximum speeds and actual speeds depend on your device and the network. Cancellation is handled by contacting our support line.",
  privacyNote:
    "We only use your details to process your installation request and to contact you about your service.",

  coverageNote: "Coverage is confirmed with a quick site survey — we will call you to arrange it.",
  howItWorksNote: "Four simple steps to fast fibre at home.",

  footerText: "Fibre internet for Kenyan homes. Fast, stable and always on.",
  copyrightText: "Spider Link Solution. All rights reserved.",

  showFeatures: true,
  showPlans: true,
  showSteps: true,
  showCoverage: true,
  showFaq: true,
  showInstallBand: true,
  showTestimonials: false,
} as const;

export type SiteConfig = { [K in keyof typeof SITE_DEFAULTS]: (typeof SITE_DEFAULTS)[K] };

export type PlanWithComputed = Plan & { computedPrice: number };

function coerce(key: keyof SiteConfig, raw: string): SiteConfig[keyof SiteConfig] {
  const fallback = SITE_DEFAULTS[key];
  if (typeof fallback === "boolean") return raw === "true" as never;
  if (typeof fallback === "number") return (Number(raw) as never) ?? (fallback as never);
  return raw as never;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const rows = await db.select().from(settings);
  const config = { ...SITE_DEFAULTS } as Record<string, unknown>;
  for (const row of rows) {
    if (!(row.key in SITE_DEFAULTS)) continue;
    try {
      const parsed = JSON.parse(row.value);
      config[row.key] = parsed === null ? coerce(row.key as keyof SiteConfig, row.value) : parsed;
    } catch {
      config[row.key] = coerce(row.key as keyof SiteConfig, row.value);
    }
  }
  return config as unknown as SiteConfig;
}

export function getPricingRule(config: SiteConfig): PricingRule {
  return {
    baseSpeedMbps: config.pricingBaseSpeedMbps,
    basePrice: config.pricingBasePrice,
    pricePerMbps: config.pricingPerMbps,
    minCustomMbps: config.pricingMinCustomMbps,
    maxCustomMbps: config.pricingMaxCustomMbps,
    rounding: config.pricingRounding,
  };
}

export async function getPlans(includeInactive = false): Promise<Plan[]> {
  const rows = await db
    .select()
    .from(plans)
    .where(includeInactive ? undefined : eq(plans.isActive, 1))
    .orderBy(asc(plans.sortOrder));
  return rows;
}

export async function getContentBlocks(kind: string): Promise<ContentBlock[]> {
  return db
    .select()
    .from(contentBlocks)
    .where(eq(contentBlocks.kind, kind))
    .orderBy(asc(contentBlocks.position));
}

export async function getAllContentBlocks(): Promise<ContentBlock[]> {
  return db.select().from(contentBlocks).orderBy(asc(contentBlocks.kind), asc(contentBlocks.position));
}

export async function saveSetting(key: string, value: unknown) {
  await db
    .insert(settings)
    .values({ key, value: JSON.stringify(value) })
    .onConflictDoUpdate({ target: settings.key, set: { value: JSON.stringify(value) } });
}

export async function saveSettings(values: Record<string, unknown>) {
  for (const [key, value] of Object.entries(values)) {
    await saveSetting(key, value);
  }
}
