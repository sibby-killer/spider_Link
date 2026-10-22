import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const now = sql`CURRENT_TIMESTAMP`;

export const admins = sqliteTable(
  "admins",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("agent"),
    isActive: integer("is_active").notNull().default(1),
    tokenVersion: integer("token_version").notNull().default(0),
    lastLoginAt: text("last_login_at"),
    createdAt: text("created_at").notNull().default(now),
    updatedAt: text("updated_at").notNull().default(now),
  },
  (t) => [uniqueIndex("admins_email_idx").on(t.email)],
);

export const plans = sqliteTable(
  "plans",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    speedMbps: integer("speed_mbps").notNull(),
    monthlyPrice: integer("monthly_price").notNull(),
    priceOverride: integer("price_override"),
    isCustom: integer("is_custom").notNull().default(0),
    tagline: text("tagline"),
    description: text("description"),
    icon: text("icon").notNull().default("plug"),
    badge: text("badge"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: integer("is_active").notNull().default(1),
    createdAt: text("created_at").notNull().default(now),
    updatedAt: text("updated_at").notNull().default(now),
  },
  (t) => [uniqueIndex("plans_slug_idx").on(t.slug), index("plans_active_idx").on(t.isActive)],
);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull().default(now),
});

export const contentBlocks = sqliteTable(
  "content_blocks",
  {
    id: text("id").primaryKey(),
    kind: text("kind").notNull(),
    position: integer("position").notNull().default(0),
    title: text("title"),
    subtitle: text("subtitle"),
    body: text("body"),
    metaJson: text("meta_json"),
    isVisible: integer("is_visible").notNull().default(1),
    createdAt: text("created_at").notNull().default(now),
    updatedAt: text("updated_at").notNull().default(now),
  },
  (t) => [index("content_blocks_kind_idx").on(t.kind)],
);

export const customers = sqliteTable(
  "customers",
  {
    id: text("id").primaryKey(),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    altPhone: text("alt_phone"),
    email: text("email"),
    area: text("area"),
    landmark: text("landmark"),
    planId: text("plan_id").references(() => plans.id),
    accountNumber: text("account_number"),
    installDate: text("install_date"),
    monthlyPrice: integer("monthly_price"),
    status: text("status").notNull().default("active"),
    notes: text("notes"),
    createdAt: text("created_at").notNull().default(now),
    updatedAt: text("updated_at").notNull().default(now),
  },
  (t) => [uniqueIndex("customers_phone_idx").on(t.phone)],
);

export const requests = sqliteTable(
  "requests",
  {
    id: text("id").primaryKey(),
    reference: text("reference").notNull(),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    altPhone: text("alt_phone"),
    email: text("email"),
    area: text("area").notNull(),
    county: text("county"),
    landmark: text("landmark"),
    planId: text("plan_id")
      .notNull()
      .references(() => plans.id),
    planNameSnapshot: text("plan_name_snapshot").notNull(),
    speedMbpsSnapshot: integer("speed_mbps_snapshot").notNull(),
    priceSnapshot: integer("price_snapshot").notNull(),
    installationFeeAccepted: integer("installation_fee_accepted").notNull().default(0),
    installationFeeAmount: integer("installation_fee_amount"),
    termsAccepted: integer("terms_accepted").notNull().default(0),
    preferredContactTime: text("preferred_contact_time"),
    preferredInstallDate: text("preferred_install_date"),
    referralCode: text("referral_code"),
    referrerPhone: text("referrer_phone"),
    notes: text("notes"),
    source: text("source").notNull().default("web"),
    status: text("status").notNull().default("new"),
    paymentStatus: text("payment_status").notNull().default("pending"),
    whatsappSent: integer("whatsapp_sent").notNull().default(0),
    whatsappSentAt: text("whatsapp_sent_at"),
    adminNotes: text("admin_notes"),
    customerId: text("customer_id").references(() => customers.id),
    createdAt: text("created_at").notNull().default(now),
    updatedAt: text("updated_at").notNull().default(now),
  },
  (t) => [
    uniqueIndex("requests_reference_idx").on(t.reference),
    index("requests_status_idx").on(t.status),
    index("requests_phone_idx").on(t.phone),
  ],
);

export const complaints = sqliteTable(
  "complaints",
  {
    id: text("id").primaryKey(),
    reference: text("reference").notNull(),
    customerId: text("customer_id").references(() => customers.id),
    requestId: text("request_id").references(() => requests.id),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    category: text("category").notNull(),
    subject: text("subject").notNull(),
    description: text("description").notNull(),
    preferredContactTime: text("preferred_contact_time"),
    status: text("status").notNull().default("open"),
    priority: text("priority").notNull().default("normal"),
    resolution: text("resolution"),
    resolvedAt: text("resolved_at"),
    createdAt: text("created_at").notNull().default(now),
    updatedAt: text("updated_at").notNull().default(now),
  },
  (t) => [uniqueIndex("complaints_reference_idx").on(t.reference), index("complaints_status_idx").on(t.status)],
);

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    customerId: text("customer_id").references(() => customers.id),
    requestId: text("request_id").references(() => requests.id),
    complaintId: text("complaint_id").references(() => complaints.id),
    direction: text("direction").notNull(),
    channel: text("channel").notNull().default("whatsapp"),
    body: text("body").notNull(),
    templateKey: text("template_key"),
    toPhone: text("to_phone").notNull(),
    adminId: text("admin_id").references(() => admins.id),
    createdAt: text("created_at").notNull().default(now),
  },
  (t) => [index("messages_customer_idx").on(t.customerId)],
);

export const referralAwards = sqliteTable(
  "referral_awards",
  {
    id: text("id").primaryKey(),
    referrerPhone: text("referrer_phone").notNull(),
    referrerName: text("referrer_name"),
    customerId: text("customer_id").references(() => customers.id),
    successfulReferrals: integer("successful_referrals").notNull().default(0),
    daysGranted: integer("days_granted").notNull().default(0),
    status: text("status").notNull().default("pending"),
    grantedAt: text("granted_at"),
    notes: text("notes"),
    createdAt: text("created_at").notNull().default(now),
    updatedAt: text("updated_at").notNull().default(now),
  },
  (t) => [uniqueIndex("referral_awards_phone_idx").on(t.referrerPhone)],
);

export const auditLog = sqliteTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    adminId: text("admin_id").references(() => admins.id),
    action: text("action").notNull(),
    entity: text("entity"),
    entityId: text("entity_id"),
    detail: text("detail"),
    ip: text("ip"),
    createdAt: text("created_at").notNull().default(now),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)],
);

export const plansRelations = relations(plans, ({ many }) => ({
  requests: many(requests),
  customers: many(customers),
}));

export const requestsRelations = relations(requests, ({ one, many }) => ({
  plan: one(plans, { fields: [requests.planId], references: [plans.id] }),
  customer: one(customers, { fields: [requests.customerId], references: [customers.id] }),
  messages: many(messages),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  plan: one(plans, { fields: [customers.planId], references: [plans.id] }),
  requests: many(requests),
  complaints: many(complaints),
  messages: many(messages),
}));

export const complaintsRelations = relations(complaints, ({ one }) => ({
  customer: one(customers, { fields: [complaints.customerId], references: [customers.id] }),
  request: one(requests, { fields: [complaints.requestId], references: [requests.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  customer: one(customers, { fields: [messages.customerId], references: [customers.id] }),
  request: one(requests, { fields: [messages.requestId], references: [requests.id] }),
  admin: one(admins, { fields: [messages.adminId], references: [admins.id] }),
}));

export type Admin = typeof admins.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Request = typeof requests.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Complaint = typeof complaints.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type ContentBlock = typeof contentBlocks.$inferSelect;
