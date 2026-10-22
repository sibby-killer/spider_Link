import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Reference codes that are short, readable over the phone, and hard to guess. */
export function generateReference(prefix: string): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 4; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${prefix}-${out}`;
}

export function newId(): string {
  return crypto.randomUUID();
}

/** Accepts 0712345678, +254712345678, 254712345678, 712345678 → +2547XXXXXXXX */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[^\d]/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) {
    const local = digits.slice(1);
    if (local.length !== 9) return null;
    return `+254${local}`;
  }
  if (digits.startsWith("254")) {
    if (digits.length !== 12) return null;
    return `+${digits}`;
  }
  if (digits.length === 9) return `+254${digits}`;
  return null;
}

/** +254743498210 → 254743498210 (wa.me expects digits without +) */
export function toWaNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function formatPhoneForDisplay(phone: string): string {
  const local = phone.replace(/^\+254/, "0");
  return local.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-KE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}
