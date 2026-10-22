import { z } from "zod";

const trimmed = (min: number, max: number) => z.string().trim().min(min).max(max);

export const requestSchema = z
  .object({
    fullName: trimmed(2, 80),
    phone: trimmed(9, 20),
    altPhone: z.union([trimmed(6, 20), z.literal("")]).optional(),
    email: z
      .union([trimmed(3, 120), z.literal("")])
      .optional()
      .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
        message: "Please enter a valid email address",
      }),
    area: trimmed(2, 120),
    county: z.union([trimmed(2, 60), z.literal("")]).optional(),
    landmark: z.union([trimmed(2, 250), z.literal("")]).optional(),
    referrerPhone: z.union([trimmed(9, 20), z.literal("")]).optional(),
    planId: z.string().min(1),
    speedMbps: z.coerce.number().int().min(1).max(1000).optional(),
    installationFeeAccepted: z.literal(true, {
      error: "Please accept the installation fee to continue",
    }),
    termsAccepted: z.literal(true, {
      error: "Please accept the Terms & Conditions to continue",
    }),
    preferredContactTime: z.enum(["morning", "afternoon", "evening", "any"]).optional(),
    preferredInstallDate: z.union([z.string().max(30), z.literal("")]).optional(),
    referralCode: z.union([trimmed(2, 30), z.literal("")]).optional(),
    notes: z.union([trimmed(0, 1000), z.literal("")]).optional(),
    // anti-spam
    website: z.string().max(0).optional(),
  })
  .strip();

export const complaintSchema = z
  .object({
    fullName: trimmed(2, 80),
    phone: trimmed(9, 20),
    category: z.enum(["no_connection", "slow", "billing", "hardware", "moving", "other"]),
    subject: trimmed(3, 120),
    description: trimmed(10, 2000),
    preferredContactTime: z.enum(["morning", "afternoon", "evening", "any"]).optional(),
    website: z.string().max(0).optional(),
  })
  .strip();

export const loginSchema = z.object({
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(200),
});

export const contentBlockSchema = z.object({
  kind: z.enum(["feature", "step", "faq", "coverage_area", "testimonial", "county", "technician"]),
  position: z.coerce.number().int().default(0),
  title: z.string().trim().max(200).optional(),
  subtitle: z.string().trim().max(200).optional(),
  body: z.string().trim().max(4000).optional(),
  metaJson: z.record(z.string(), z.unknown()).optional(),
  isVisible: z.coerce.boolean().default(true),
});

export const planSchema = z.object({
  name: z.string().trim().min(1).max(60),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only"),
  speedMbps: z.coerce.number().int().min(1).max(1000),
  monthlyPrice: z.coerce.number().int().min(0),
  priceOverride: z.coerce.number().int().min(0).nullable().optional(),
  isCustom: z.coerce.boolean().default(false),
  tagline: z.string().trim().max(160).optional(),
  description: z.string().trim().max(600).optional(),
  icon: z.string().trim().max(40).default("plug"),
  badge: z.string().trim().max(40).optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

export type RequestInput = z.infer<typeof requestSchema>;
export type ComplaintInput = z.infer<typeof complaintSchema>;
