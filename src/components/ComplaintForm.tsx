"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Loader2, MessageCircle } from "lucide-react";

const CATEGORIES = [
  { value: "no_connection", label: "No connection" },
  { value: "slow", label: "Slow speed" },
  { value: "billing", label: "Billing or payment" },
  { value: "hardware", label: "Router or hardware" },
  { value: "moving", label: "Moving house" },
  { value: "other", label: "Something else" },
];

export default function ComplaintForm() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    category: "no_connection",
    subject: "",
    description: "",
    preferredContactTime: "any",
    website: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ reference: string; whatsappUrl: string } | null>(null);

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (form.fullName.trim().length < 2) next.fullName = "Please tell us your name.";
    if (form.phone.replace(/\D/g, "").length < 9) next.phone = "Enter a valid phone number, e.g. 0712 345 678.";
    if (form.subject.trim().length < 3) next.subject = "Give the problem a short title.";
    if (form.description.trim().length < 10) next.description = "Tell us a little more about the problem.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setErrors(payload?.error?.fieldErrors ?? {});
        return;
      }
      setSuccess(payload.data);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-[var(--radius-card)] border-2 border-brand-600 bg-white p-7">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white">
          <Check size={28} strokeWidth={3} />
        </span>
        <h2 className="display mt-5 text-3xl">Complaint received</h2>
        <p className="mt-2 text-ink-soft">
          We have logged your complaint and our support team will call you on the number you gave us.
        </p>
        <p className="mt-4 rounded-xl bg-mist/70 p-4 text-sm">
          Your reference is <strong className="display text-brand-600">{success.reference}</strong>
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={success.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1"
          >
            <MessageCircle size={18} />
            Send on WhatsApp
          </a>
          <Link href="/" className="btn-secondary flex-1">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-ink">
            Full name<span className="text-brand-600">*</span>
          </span>
          <input
            type="text"
            value={form.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            className={inputClass(Boolean(errors.fullName))}
            placeholder="e.g. Alice Wanjiru"
          />
          {errors.fullName ? <span className="mt-1 block text-xs text-brand-700">{errors.fullName}</span> : null}
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">
            Phone number<span className="text-brand-600">*</span>
          </span>
          <input
            type="tel"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            className={inputClass(Boolean(errors.phone))}
            placeholder="e.g. 0712 345 678"
          />
          {errors.phone ? <span className="mt-1 block text-xs text-brand-700">{errors.phone}</span> : null}
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">What is the problem?</span>
          <select
            value={form.category}
            onChange={(event) => update("category", event.target.value)}
            className={inputClass(false)}
          >
            {CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">Preferred contact time</span>
          <select
            value={form.preferredContactTime}
            onChange={(event) => update("preferredContactTime", event.target.value)}
            className={inputClass(false)}
          >
            <option value="any">Any time</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-ink">
            Short title<span className="text-brand-600">*</span>
          </span>
          <input
            type="text"
            value={form.subject}
            onChange={(event) => update("subject", event.target.value)}
            className={inputClass(Boolean(errors.subject))}
            placeholder="e.g. No internet since yesterday"
          />
          {errors.subject ? <span className="mt-1 block text-xs text-brand-700">{errors.subject}</span> : null}
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-ink">
            Tell us more<span className="text-brand-600">*</span>
          </span>
          <textarea
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            rows={5}
            className={inputClass(Boolean(errors.description))}
            placeholder="e.g. The link has been down since 6am. The ONT light is red."
          />
          {errors.description ? (
            <span className="mt-1 block text-xs text-brand-700">{errors.description}</span>
          ) : null}
        </label>
      </div>

      <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(event) => update("website", event.target.value)}
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 border-t border-ink/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-soft">We answer 24/7 and usually call back the same day.</p>
        <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
          {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
          {submitting ? "Sending..." : "Send complaint"}
        </button>
      </div>
    </form>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-brand-600 ${
    hasError ? "border-brand-600" : "border-ink/12"
  }`;
}
