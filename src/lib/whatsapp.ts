import type { SiteConfig } from "./site-config";
import { formatKsh } from "./pricing";
import { toWaNumber } from "./utils";

export function waLink(number: string, body: string): string {
  return `https://wa.me/${toWaNumber(number)}?text=${encodeURIComponent(body)}`;
}

export type RequestMessageInput = {
  reference: string;
  fullName: string;
  phone: string;
  altPhone?: string | null;
  email?: string | null;
  planName: string;
  speedMbps: number;
  price: number;
  area: string;
  county?: string | null;
  landmark?: string | null;
  referrerPhone?: string | null;
  preferredInstallDate?: string | null;
  preferredContactTime?: string | null;
  notes?: string | null;
  installationFee: number;
  installationFeeAccepted: boolean;
  termsAccepted: boolean;
};

const CONTACT_TIME_LABELS: Record<string, string> = {
  morning: "Morning (8am - 12pm)",
  afternoon: "Afternoon (12pm - 4pm)",
  evening: "Evening (4pm - 7pm)",
  any: "Any time",
};

export function buildRequestMessage(data: RequestMessageInput, config: SiteConfig): string {
  const lines: string[] = ["*NEW INSTALLATION REQUEST*", `Ref: ${data.reference}`, ""];

  lines.push(`*Name:* ${data.fullName}`);
  lines.push(`*Phone:* ${data.phone}`);
  if (data.altPhone) lines.push(`*Alt phone:* ${data.altPhone}`);
  if (data.email) lines.push(`*Email:* ${data.email}`);
  lines.push("");
  lines.push(`*Plan:* ${data.planName} — ${data.speedMbps} Mbps (${formatKsh(data.price)}/month)`);
  if (data.county) lines.push(`*County:* ${data.county}`);
  lines.push(`*Location:* ${data.area}`);
  if (data.landmark) lines.push(`*Landmark:* ${data.landmark}`);
  if (data.referrerPhone) lines.push(`*Referred by:* ${data.referrerPhone}`);
  if (data.preferredInstallDate) lines.push(`*Preferred install date:* ${data.preferredInstallDate}`);
  if (data.preferredContactTime) {
    const label = CONTACT_TIME_LABELS[data.preferredContactTime] ?? data.preferredContactTime;
    lines.push(`*Preferred contact time:* ${label}`);
  }
  lines.push("");
  lines.push(`*Installation fee:* ${formatKsh(data.installationFee)} — ${data.installationFeeAccepted ? "ACCEPTED ✅" : "NOT CONFIRMED"}`);
  if (config.firstMonthFree) lines.push(`*First month:* FREE`);
  lines.push(`*Terms & Conditions:* ${data.termsAccepted ? "ACCEPTED ✅" : "NOT CONFIRMED"}`);
  if (data.notes) {
    lines.push("");
    lines.push(`*Notes:* ${data.notes}`);
  }
  lines.push("");
  lines.push(`_Sent from ${siteHost()}_`);

  return lines.join("\n");
}

export type ComplaintMessageInput = {
  reference: string;
  fullName: string;
  phone: string;
  category: string;
  subject: string;
  description: string;
};

export function buildComplaintMessage(data: ComplaintMessageInput): string {
  const lines = [
    "*NEW COMPLAINT*",
    `Ref: ${data.reference}`,
    "",
    `*Name:* ${data.fullName}`,
    `*Phone:* ${data.phone}`,
    `*Category:* ${data.category}`,
    `*Subject:* ${data.subject}`,
    "",
    `*Description:* ${data.description}`,
    "",
    `_Sent from ${siteHost()}_`,
  ];
  return lines.join("\n");
}

export type MessageTemplate = {
  key: string;
  name: string;
  body: string;
};

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    key: "install_schedule",
    name: "Installation schedule",
    body: "Hi {{name}}, thanks for choosing Spider Link (ref {{reference}}). Your {{plan}} installation is scheduled for {{date}}. Installation fee: {{amount}}. Reply 1 to confirm.",
  },
  {
    key: "survey_booking",
    name: "Book site survey",
    body: "Hi {{name}}, we need a quick site survey for your {{plan}} connection so we can confirm fibre reaches your home. What day and time works for you?",
  },
  {
    key: "payment_reminder",
    name: "Payment reminder",
    body: "Hi {{name}}, a friendly reminder that the {{amount}} installation fee for {{plan}} is still pending. Pay via M-Pesa to PayBill *{{paybill}}* and send us your confirmation code.",
  },
  {
    key: "welcome",
    name: "Welcome / activation",
    body: "Welcome to Spider Link Solution, {{name}}! Your {{plan}} ({{speed}} Mbps, {{price}}/month) is now active. Your first month is on us. If anything feels off, just message this number.",
  },
  {
    key: "renewal",
    name: "Subscription renewal",
    body: "Hi {{name}}, your {{plan}} subscription ({{price}}/month) renews on {{date}}. Thanks for staying with Spider Link.",
  },
  {
    key: "suspension",
    name: "Suspension notice",
    body: "Hi {{name}}, your {{plan}} service has been paused as you requested. Message us any time and we will switch it back on.",
  },
  {
    key: "complaint_update",
    name: "Complaint update",
    body: "Hi {{name}}, about your complaint ({{reference}}), here is the update: {{message}}",
  },
  {
    key: "promo",
    name: "Promotional offer",
    body: "Hi {{name}}, good news — we have a special offer for you. Upgrade to {{plan}} at {{price}}/month and get your first month free. Interested?",
  },
];

export function renderTemplate(body: string, vars: Record<string, string | number | undefined>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = vars[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

function siteHost(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) return site.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return "spiderlink.co.ke";
}
