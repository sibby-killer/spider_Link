import "../lib/load-env";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { admins, contentBlocks, plans, settings } from "./schema";
import { hashPassword } from "../lib/auth";
import { newId } from "../lib/utils";

const PLAN_SEED = [
  {
    slug: "starter",
    name: "Starter",
    speedMbps: 5,
    monthlyPrice: 1000,
    priceOverride: null,
    isCustom: 0,
    tagline: "Perfect for light browsing and calls",
    description: "Unlimited fibre for everyday use — browsing, calls and streaming in one room.",
    icon: "plug",
    badge: null,
    sortOrder: 1,
  },
  {
    slug: "home",
    name: "Home",
    speedMbps: 10,
    monthlyPrice: 1500,
    priceOverride: null,
    isCustom: 0,
    tagline: "Our most popular plan",
    description: "Smooth streaming on a few devices at the same time, with room to grow.",
    icon: "wifi",
    badge: "Popular",
    sortOrder: 2,
  },
  {
    slug: "family",
    name: "Family",
    speedMbps: 15,
    monthlyPrice: 2000,
    priceOverride: null,
    isCustom: 0,
    tagline: "For busy homes and streaming families",
    description: "Everyone online at once — HD streaming, work calls and gaming without buffering.",
    icon: "couch",
    badge: null,
    sortOrder: 3,
  },
  {
    slug: "pro",
    name: "Pro",
    speedMbps: 20,
    monthlyPrice: 3700,
    priceOverride: 3700,
    isCustom: 0,
    tagline: "Heavy streaming, gaming and work from home",
    description: "Top speeds for 4K streaming, online gaming and full-time work from home.",
    icon: "router",
    badge: null,
    sortOrder: 4,
  },
  {
    slug: "custom",
    name: "Custom",
    speedMbps: 0,
    monthlyPrice: 0,
    priceOverride: null,
    isCustom: 1,
    tagline: "Pick your own speed",
    description: "Tell us the speed you need and we will price it for you instantly.",
    icon: "gauge",
    badge: "Build your own",
    sortOrder: 5,
  },
] as const;

const FEATURES = [
  { title: "Unlimited Broadband", body: "No data caps, no throttling. Use as much as you want, all month." },
  { title: "Flexible Payment", body: "Pay monthly, easy M-Pesa, and your first month is on us." },
  { title: "Terms and Conditions Apply", body: "Simple, transparent terms — no hidden charges." },
  { title: "Installation After a Survey", body: "We do a quick site check so we know fibre reaches your home." },
  { title: "24/7 Customer Service", body: "Real people on WhatsApp, day or night, when something goes wrong." },
  { title: "Unlimited Fibre", body: "National fibre, unlimited, straight to your home." },
];

const STEPS = [
  { title: "Send your request", body: "Choose your plan and tell us where you live. It takes a minute." },
  { title: "We call you", body: "We confirm your details and answer any questions on WhatsApp." },
  { title: "Quick site survey", body: "Our team checks the route so fibre reaches your home." },
  { title: "Installation and setup", body: "Router fitted, cables run, and we show you how everything works." },
];

const FAQS = [
  {
    title: "Do I need a contract?",
    body: "There is no fixed minimum term. You are free to stop whenever you like — just give us a call.",
  },
  {
    title: "How long does installation take?",
    body: "After your survey we confirm the earliest installation date. We will agree it with you before we come.",
  },
  {
    title: "What does the Ksh 2,500 installation fee cover?",
    body: "It covers the router, the installation and setting it up in your home. It is a one-off payment.",
  },
  {
    title: "Is my first month really free?",
    body: "Yes — your first month is free on every plan. Your bill starts from the month after you go live.",
  },
  {
    title: "Do you serve my area?",
    body: "We are adding areas all the time. Send your request with your area and we will confirm coverage with a quick site survey.",
  },
  {
    title: "How do I pay?",
    body: "M-Pesa. We give you the PayBill number when we call, and you send us the confirmation code.",
  },
  {
    title: "How do I report a problem?",
    body: "Use the Report a Problem button on this site or message us on WhatsApp. We answer 24/7.",
  },
];

const COVERAGE = [
  { title: "Kakamega", body: "Shieywe · Molybdenum · Sikuma · Butsotso · Lurambi · Shikalame" },
  { title: "Bungoma", body: "Nambale · Kanduyi · Kibitoli · Webuye · Makutani" },
];

const COUNTIES = [
  { title: "Kakamega", body: "Shieywe, Molybdenum, Sikuma, Butsotso, Lurambi, Shikalame" },
  { title: "Bungoma", body: "Nambale, Kanduyi, Kibitoli, Webuye, Makutani" },
];

const TECHNICIANS = [
  {
    title: "Alfred Nyongesa",
    body: "Lead installation technician. Cable routing, router setup and fibre termination.",
    meta: { phone: "+254762667048", phoneDisplay: "0762 667 048", role: "Lead Technician", area: "Kakamega & Bungoma", accent: "#e60000", initials: "AN" },
  },
  {
    title: "Samuel Ogachi",
    body: "Fibre installation and in-home networking. Also handles site surveys.",
    meta: { phone: "+254768294174", phoneDisplay: "0768 294 174", role: "Installation Technician", area: "Kakamega & Bungoma", accent: "#ff6b35", initials: "SO" },
  },
  {
    title: "Isaac Amutambi",
    body: "Router configuration, signal testing and customer handover.",
    meta: { phone: "+254729826792", phoneDisplay: "0729 826 792", role: "Setup & Support Technician", area: "Kakamega & Bungoma", accent: "#0ea5e9", initials: "IA" },
  },
];

const REFRESH_CONTENT = new Set(["coverage_area", "county", "technician", "faq", "feature", "step"]);

async function main() {
  for (const plan of PLAN_SEED) {
    const existing = await db.select().from(plans).where(eq(plans.slug, plan.slug)).limit(1);
    if (existing.length) {
      await db.update(plans).set({ ...plan }).where(eq(plans.slug, plan.slug));
    } else {
      await db.insert(plans).values({ id: newId(), ...plan });
    }
  }

  // Settings: insert only what is missing, so admin edits are never wiped.
  const { SITE_DEFAULTS } = await import("../lib/site-config");
  const existingSettings = await db.select().from(settings);
  const existingKeys = new Set(existingSettings.map((row) => row.key));
  const missing = Object.entries(SITE_DEFAULTS)
    .filter(([key]) => !existingKeys.has(key))
    .map(([key, value]) => ({ key, value: JSON.stringify(value) }));
  if (missing.length) {
    await db.insert(settings).values(missing).onConflictDoNothing();
    console.log(`Inserted ${missing.length} setting(s)`);
  }

  const kinds: Array<{ kind: string; items: Array<{ title: string; body: string; meta?: unknown }> }> = [
    { kind: "feature", items: FEATURES },
    { kind: "step", items: STEPS },
    { kind: "faq", items: FAQS },
    { kind: "coverage_area", items: COVERAGE },
    { kind: "county", items: COUNTIES },
    { kind: "technician", items: TECHNICIANS },
  ];

  for (const { kind, items } of kinds) {
    const existing = await db.select().from(contentBlocks).where(eq(contentBlocks.kind, kind));
    if (existing.length && !REFRESH_CONTENT.has(kind)) continue;
    if (existing.length) {
      await db.delete(contentBlocks).where(eq(contentBlocks.kind, kind));
    }
    await db.insert(contentBlocks).values(
      items.map((item, index) => ({
        id: newId(),
        kind,
        position: index + 1,
        title: item.title,
        body: item.body,
        metaJson: item.meta ? JSON.stringify(item.meta) : null,
        isVisible: 1,
      })),
    );
  }

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    const existing = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
    if (!existing.length) {
      await db.insert(admins).values({
        id: newId(),
        email,
        name: process.env.SEED_ADMIN_NAME ?? "Owner",
        passwordHash: await hashPassword(password),
        role: "owner",
        isActive: 1,
      });
      console.log(`Created owner admin ${email}`);
    } else {
      console.log(`Owner admin ${email} already exists — left untouched`);
    }
  } else {
    console.log("SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipped admin creation");
  }

  console.log("Seed complete");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
