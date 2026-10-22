"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { admins, auditLog, complaints, contentBlocks, customers, plans, referralAwards, requests, settings } from "@/db/schema";
import { getSessionAdmin, hashPassword, isOwner } from "@/lib/auth";
import { planSchema } from "@/lib/validation";
import { newId } from "@/lib/utils";
import { COMPLAINT_STATUSES, REQUEST_STATUSES } from "@/lib/constants";
import { computeCustomPrice } from "@/lib/pricing";
import { getPricingRule, getSiteConfig, saveSettings } from "@/lib/site-config";


async function logAudit(action: string, entity: string, entityId: string | null, detail?: string) {
  const admin = await getSessionAdmin();
  await db.insert(auditLog).values({
    id: newId(),
    adminId: admin?.id ?? null,
    action,
    entity,
    entityId,
    detail: detail ?? null,
  });
}

export async function updateRequestStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const adminNotes = formData.get("adminNotes");

  if (!id || !REQUEST_STATUSES.includes(status as (typeof REQUEST_STATUSES)[number])) {
    console.error("action rejected"); return;
  }

  const patch: Partial<typeof requests.$inferInsert> = { status, updatedAt: new Date().toISOString() };
  if (typeof adminNotes === "string" && adminNotes.trim().length > 0) {
    patch.adminNotes = adminNotes.trim();
  }
  if (status === "activated" && !formData.get("keepUnconverted")) {
    const [row] = await db.select().from(requests).where(eq(requests.id, id)).limit(1);
    if (row && !row.customerId) {
      const customer = await db
        .insert(customers)
        .values({
          id: newId(),
          fullName: row.fullName,
          phone: row.phone,
          altPhone: row.altPhone,
          email: row.email,
          area: row.area,
          landmark: row.landmark,
          planId: row.planId,
          accountNumber: `SL-${String(Date.now()).slice(-6)}`,
          monthlyPrice: row.priceSnapshot,
          status: "active",
        })
        .returning();
      await db.update(requests).set({ customerId: customer[0].id }).where(eq(requests.id, id));
    }
  }

  await db.update(requests).set(patch).where(eq(requests.id, id));
  await logAudit("request.status", "request", id, `status â†’ ${status}`);
  revalidatePath("/admin/requests");
  revalidatePath("/admin");
  return;
}

export async function updateRequestNotes(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const notes = String(formData.get("adminNotes") ?? "").trim();
  await db.update(requests).set({ adminNotes: notes, updatedAt: new Date().toISOString() }).where(eq(requests.id, id));
  await logAudit("request.notes", "request", id);
  revalidatePath("/admin/requests");
  return;
}

export async function updateRequestPayment(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const paymentStatus = String(formData.get("paymentStatus") ?? "pending");
  if (!["pending", "accepted", "paid", "refunded"].includes(paymentStatus)) { console.error("action rejected"); return; }
  await db.update(requests).set({ paymentStatus, updatedAt: new Date().toISOString() }).where(eq(requests.id, id));
  await logAudit("request.payment", "request", id, `payment â†’ ${paymentStatus}`);
  revalidatePath("/admin/requests");
  return;
}

export async function updateComplaint(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const resolution = String(formData.get("resolution") ?? "").trim();
  if (!COMPLAINT_STATUSES.includes(status as (typeof COMPLAINT_STATUSES)[number])) { console.error("action rejected"); return; }

  await db
    .update(complaints)
    .set({
      status,
      resolution: resolution || null,
      resolvedAt: status === "resolved" || status === "closed" ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(complaints.id, id));
  await logAudit("complaint.update", "complaint", id, `status â†’ ${status}`);
  revalidatePath("/admin/complaints");
  revalidatePath("/admin");
  return;
}

export async function updateCustomer(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["active", "suspended", "churned", "pending"].includes(status)) { console.error("action rejected"); return; }
  const notes = String(formData.get("notes") ?? "").trim();
  await db
    .update(customers)
    .set({ status, notes: notes || null, updatedAt: new Date().toISOString() })
    .where(eq(customers.id, id));
  await logAudit("customer.update", "customer", id, `status â†’ ${status}`);
  revalidatePath("/admin/customers");
  return;
}

export async function saveSiteSettings(formData: FormData) {
  const admin = await getSessionAdmin();
  if (!isOwner(admin)) { console.error("action rejected"); return; }

  const values: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "id" || key === "_action") continue;
    if (!(key in allowedSettingKeys)) continue;
    values[key] = value === "true" ? true : value === "false" ? false : value;
  }

  await saveSettings(values);
  await logAudit("site.settings", "settings", null, Object.keys(values).join(", "));
  revalidatePath("/", "layout");
  revalidatePath("/admin/site");
  return;
}

const allowedSettingKeys = new Set<string>([
  "brandName",
  "brandTagline",
  "brandTaglineAlt",
  "announcementEnabled",
  "announcementText",
  "heroEyebrow",
  "heroTitle",
  "heroSubtitle",
  "heroPrimaryCta",
  "heroSecondaryCta",
  "heroShow3d",
  "installFee",
  "installFeeIncludes",
  "installFeeTiming",
  "firstMonthFree",
  "firstMonthFreeLabel",
  "pricingBaseSpeedMbps",
  "pricingBasePrice",
  "pricingPerMbps",
  "pricingMinCustomMbps",
  "pricingMaxCustomMbps",
  "pricingRounding",
  "whatsappNumber",
  "phonePrimary",
  "phoneSecondary",
  "phonePrimaryDisplay",
  "phoneSecondaryDisplay",
  "email",
  "location",
  "supportHours",
  "mainLocation",
  "coveredCounties",
  "techniciansIntro",
  "techniciansAreaNote",
  "referralEnabled",
  "referralNote",
  "referralTargetCount",
  "referralRewardDays",
  "mpesaPaybill",
  "mpesaAccountName",
  "paymentInstructions",
  "acceptedPaymentMethods",
  "consentInstallText",
  "consentTermsText",
  "termsAndConditions",
  "privacyNote",
  "coverageNote",
  "howItWorksNote",
  "footerText",
  "copyrightText",
  "showFeatures",
  "showPlans",
  "showSteps",
  "showCoverage",
  "showFaq",
  "showInstallBand",
  "showTestimonials",
]);

export async function savePlan(formData: FormData) {
  const admin = await getSessionAdmin();
  if (!isOwner(admin)) { console.error("action rejected"); return; }

  const id = String(formData.get("id") ?? "");
  const parsed = planSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    speedMbps: formData.get("speedMbps"),
    monthlyPrice: formData.get("monthlyPrice"),
    priceOverride: formData.get("priceOverride") || null,
    isCustom: formData.get("isCustom") === "on",
    tagline: formData.get("tagline") || undefined,
    description: formData.get("description") || undefined,
    icon: formData.get("icon") || "plug",
    badge: formData.get("badge") || undefined,
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formData.get("isActive") !== null,
  });

  if (!parsed.success) {
    console.error("action rejected"); return;
  }

  const data = {
    ...parsed.data,
    priceOverride: parsed.data.priceOverride ?? null,
    isCustom: parsed.data.isCustom ? 1 : 0,
    isActive: parsed.data.isActive ? 1 : 0,
    updatedAt: new Date().toISOString(),
  };

  if (id) {
    await db.update(plans).set(data).where(eq(plans.id, id));
  } else {
    await db.insert(plans).values({ id: newId(), ...data });
  }

  await logAudit("plan.save", "plan", id || null, parsed.data.name);
  revalidatePath("/", "layout");
  revalidatePath("/admin/site");
  return;
}

export async function archivePlan(formData: FormData) {
  const admin = await getSessionAdmin();
  if (!isOwner(admin)) { console.error("action rejected"); return; }
  const id = String(formData.get("id") ?? "");
  await db.update(plans).set({ isActive: 0, updatedAt: new Date().toISOString() }).where(eq(plans.id, id));
  await logAudit("plan.archive", "plan", id);
  revalidatePath("/", "layout");
  revalidatePath("/admin/site");
  return;
}

export async function saveContentBlock(formData: FormData) {
  const admin = await getSessionAdmin();
  if (!isOwner(admin)) { console.error("action rejected"); return; }

  const id = String(formData.get("id") ?? "");
  const kind = String(formData.get("kind") ?? "feature");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const position = Number(formData.get("position") ?? 0);
  const isVisible = formData.get("isVisible") === "on";
  const metaRaw = String(formData.get("metaJson") ?? "").trim();

  let metaJson: string | null = null;
  if (metaRaw) {
    try {
      metaJson = JSON.stringify(JSON.parse(metaRaw));
    } catch {
      console.error("action rejected"); return;
    }
  }

  if (id) {
    await db
      .update(contentBlocks)
      .set({ title: title || null, body: body || null, position, isVisible: isVisible ? 1 : 0, metaJson, updatedAt: new Date().toISOString() })
      .where(eq(contentBlocks.id, id));
  } else {
    await db.insert(contentBlocks).values({
      id: newId(),
      kind,
      title: title || null,
      body: body || null,
      position,
      isVisible: isVisible ? 1 : 0,
      metaJson,
    });
  }

  await logAudit("content.save", "content_block", id || null, `${kind}: ${title}`);
  revalidatePath("/", "layout");
  revalidatePath("/admin/site");
  return;
}

export async function deleteContentBlock(formData: FormData) {
  const admin = await getSessionAdmin();
  if (!isOwner(admin)) { console.error("action rejected"); return; }
  const id = String(formData.get("id") ?? "");
  await db.delete(contentBlocks).where(eq(contentBlocks.id, id));
  await logAudit("content.delete", "content_block", id);
  revalidatePath("/", "layout");
  revalidatePath("/admin/site");
  return;
}

export async function createAdminUser(formData: FormData) {
  const admin = await getSessionAdmin();
  if (!isOwner(admin)) { console.error("action rejected"); return; }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "agent");

  if (!email.includes("@")) { console.error("action rejected"); return; }
  if (name.length < 2) { console.error("action rejected"); return; }
  if (password.length < 8) { console.error("action rejected"); return; }
  if (!["owner", "agent"].includes(role)) { console.error("action rejected"); return; }

  const existing = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  if (existing.length) { console.error("action rejected"); return; }

  await db.insert(admins).values({
    id: newId(),
    email,
    name,
    passwordHash: await hashPassword(password),
    role,
    isActive: 1,
  });
  await logAudit("admin.create", "admin", email, role);
  revalidatePath("/admin/users");
  return;
}

export async function toggleAdminActive(formData: FormData) {
  const admin = await getSessionAdmin();
  if (!isOwner(admin)) { console.error("action rejected"); return; }

  const id = String(formData.get("id") ?? "");
  const target = await db.select().from(admins).where(eq(admins.id, id)).limit(1);
  if (!target.length) { console.error("action rejected"); return; }
  if (target[0].id === admin?.id) { console.error("action rejected"); return; }

  const nextActive = target[0].isActive ? 0 : 1;
  await db
    .update(admins)
    .set({ isActive: nextActive, tokenVersion: target[0].tokenVersion + 1 })
    .where(eq(admins.id, id));
  await logAudit("admin.toggle", "admin", id, nextActive ? "activated" : "deactivated");
  revalidatePath("/admin/users");
  return;
}

export async function previewCustomPrice(mbps: number) {
  const config = await getSiteConfig();
  const rule = getPricingRule(config);
  return computeCustomPrice(mbps, rule);
}

export async function grantReferralReward(formData: FormData) {
  const admin = await getSessionAdmin();
  if (!isOwner(admin)) {
    console.error("action rejected");
    return;
  }

  const referrerPhone = String(formData.get("referrerPhone") ?? "").trim();
  const referrerName = String(formData.get("referrerName") ?? "").trim() || null;
  const successful = Number(formData.get("successful") ?? 0);
  const days = Number(formData.get("days") ?? 60);

  if (!referrerPhone) {
    console.error("action rejected");
    return;
  }

  const existing = await db
    .select()
    .from(referralAwards)
    .where(eq(referralAwards.referrerPhone, referrerPhone))
    .limit(1);

  const values = {
    referrerPhone,
    referrerName,
    successfulReferrals: successful,
    daysGranted: days,
    status: "granted",
    grantedAt: new Date().toISOString(),
    notes: String(formData.get("notes") ?? "").trim() || null,
    updatedAt: new Date().toISOString(),
  };

  if (existing.length) {
    await db.update(referralAwards).set(values).where(eq(referralAwards.id, existing[0].id));
  } else {
    await db.insert(referralAwards).values({ id: newId(), ...values });
  }

  await logAudit("referral.reward", "referral", null, `${referrerPhone} +${days} days`);
  revalidatePath("/admin/referrals");
  revalidatePath("/admin");
  return;
}




