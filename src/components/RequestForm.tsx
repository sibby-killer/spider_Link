"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Gift, Loader2, MessageCircle, ShieldCheck } from "lucide-react";
import { clampCustomSpeed, computeCustomPrice, formatKsh, type PricingRule } from "@/lib/pricing";
import type { Plan } from "@/db/schema";

type PlanRow = Plan & { computedPrice: number };

type FormState = {
  fullName: string;
  phone: string;
  altPhone: string;
  email: string;
  county: string;
  area: string;
  landmark: string;
  referrerPhone: string;
  planId: string;
  speedMbps: number;
  installationFeeAccepted: boolean;
  termsAccepted: boolean;
  preferredContactTime: string;
  preferredInstallDate: string;
  notes: string;
  website: string;
};

const EMPTY: FormState = {
  fullName: "",
  phone: "",
  altPhone: "",
  email: "",
  county: "",
  area: "",
  landmark: "",
  referrerPhone: "",
  planId: "",
  speedMbps: 10,
  installationFeeAccepted: false,
  termsAccepted: false,
  preferredContactTime: "any",
  preferredInstallDate: "",
  notes: "",
  website: "",
};

export type County = { id: string; name: string; areas: string };

type Success = {
  id: string;
  reference: string;
  planName: string;
  speedMbps: number;
  price: number;
  installationFee: number;
  whatsappUrl: string;
};

export default function RequestForm({
  plans,
  rule,
  installFee,
  firstMonthFree,
  consentInstallText,
  consentTermsText,
  initialPlanId,
  initialSpeed,
  counties,
  referralEnabled,
  referralNote,
  referralTargetCount,
  referralRewardDays,
}: {
  plans: PlanRow[];
  rule: PricingRule;
  installFee: number;
  firstMonthFree: boolean;
  consentInstallText: string;
  consentTermsText: string;
  initialPlanId: string;
  initialSpeed: number;
  counties: County[];
  referralEnabled: boolean;
  referralNote: string;
  referralTargetCount: number;
  referralRewardDays: number;
}) {
  const namedPlans = plans.filter((plan) => plan.isCustom === 0);
  const customPlan = plans.find((plan) => plan.isCustom === 1) ?? null;

  const [form, setForm] = useState<FormState>({
    ...EMPTY,
    planId: initialPlanId,
    speedMbps: initialSpeed,
    county: counties[0]?.name ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<Success | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedPlan = plans.find((plan) => plan.id === form.planId) ?? null;
  const isCustom = selectedPlan?.isCustom === 1;
  const speed = clampCustomSpeed(form.speedMbps, rule);

  const price = useMemo(() => {
    if (!selectedPlan) return 0;
    if (isCustom) return computeCustomPrice(speed, rule);
    return selectedPlan.priceOverride ?? selectedPlan.computedPrice;
  }, [selectedPlan, isCustom, speed, rule]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (form.fullName.trim().length < 2) next.fullName = "Please tell us your name.";
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 9) next.phone = "Enter a valid phone number, e.g. 0712 345 678.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "That email does not look right.";
    }
    if (form.area.trim().length < 2) next.area = "Which area do you live in?";
    if (!form.county) next.county = "Choose the county you are in.";
    if (!form.planId) next.planId = "Please choose a plan.";
    if (!form.installationFeeAccepted) {
      next.installationFeeAccepted = "Please accept the installation fee to continue.";
    }
    if (!form.termsAccepted) next.termsAccepted = "Please accept the terms to continue.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) {
      document.getElementById("form-errors")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          speedMbps: isCustom ? speed : undefined,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setErrors(payload?.error?.fieldErrors ?? {});
        setFormError(payload?.error?.message ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccess(payload.data);
    } catch {
      setFormError("We could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function sendToWhatsapp() {
    if (!success) return;
    try {
      await fetch(`/api/requests/${success.id}/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateKey: "request" }),
      });
    } catch {
      // opening WhatsApp matters more than the bookkeeping
    }
    window.open(success.whatsappUrl, "_blank", "noopener,noreferrer");
  }

  if (success) {
    return (
      <div className="rounded-[var(--radius-card)] border-2 border-brand-600 bg-white p-7 shadow-[var(--shadow-glow)] md:p-9">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white">
          <Check size={28} strokeWidth={3} />
        </span>
        <h2 className="display mt-5 text-3xl text-ink">Request received</h2>
        <p className="mt-2 text-ink-soft">
          Thanks {success.planName ? "" : ""}— we have your request. Our team will call you on the number you gave us.
        </p>

        <dl className="mt-6 grid gap-3 rounded-2xl bg-mist/70 p-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-ink-soft">Reference</dt>
            <dd className="display text-xl text-brand-600">{success.reference}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-ink-soft">Plan</dt>
            <dd className="text-sm font-semibold text-ink">
              {success.planName} — {formatKsh(success.price)}/month
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-ink-soft">Installation</dt>
            <dd className="text-sm font-semibold text-ink">{formatKsh(success.installationFee)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-ink-soft">First month</dt>
            <dd className="text-sm font-semibold text-ink">{firstMonthFree ? "FREE" : "Charged normally"}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={sendToWhatsapp} className="btn-primary flex-1">
            <MessageCircle size={18} />
            Send on WhatsApp
          </button>
          <Link href={`/status?ref=${success.reference}`} className="btn-secondary flex-1">
            Track this request
          </Link>
        </div>

        <p className="mt-4 text-xs text-ink-soft">
          Keep reference <strong>{success.reference}</strong>. Our team also has your request in the dashboard, so we will
          call you even if you do not send the WhatsApp message.
        </p>
      </div>
    );
  }

  const errorList = Object.entries(errors);

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {errorList.length > 0 ? (
        <div
          id="form-errors"
          role="alert"
          className="rounded-2xl border border-brand-300 bg-brand-50 p-4 text-sm text-brand-800"
        >
          <p className="font-semibold">Please fix the following:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {errorList.map(([key, message]) => (
              <li key={key}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {formError ? (
        <div role="alert" className="rounded-2xl border border-brand-300 bg-brand-50 p-4 text-sm text-brand-800">
          {formError}
        </div>
      ) : null}

      <fieldset>
        <legend className="text-lg font-bold text-ink">1. Choose your plan</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {namedPlans.map((plan) => {
            const planPrice = plan.priceOverride ?? plan.computedPrice;
            const active = form.planId === plan.id;
            return (
              <label
                key={plan.id}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                  active ? "border-brand-600 bg-brand-50 shadow-[var(--shadow-glow)]" : "border-ink/10 bg-white hover:border-brand-200"
                }`}
              >
                <input
                  type="radio"
                  name="planId"
                  value={plan.id}
                  checked={active}
                  onChange={() => update("planId", plan.id)}
                  className="mt-1 h-4 w-4 accent-brand-600"
                />
                <span className="flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-bold text-ink">{plan.name}</span>
                    <span className="display text-lg text-brand-600">{formatKsh(planPrice)}</span>
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-soft">
                    {plan.speedMbps} Mbps · {firstMonthFree ? "first month free" : "per month"}
                  </span>
                </span>
              </label>
            );
          })}

          {customPlan ? (
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all sm:col-span-2 ${
                form.planId === customPlan.id
                  ? "border-brand-600 bg-brand-50 shadow-[var(--shadow-glow)]"
                  : "border-ink/10 bg-white hover:border-brand-200"
              }`}
            >
              <input
                type="radio"
                name="planId"
                value={customPlan.id}
                checked={form.planId === customPlan.id}
                onChange={() => update("planId", customPlan.id)}
                className="mt-1 h-4 w-4 accent-brand-600"
              />
              <span className="flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-bold text-ink">Custom speed</span>
                  <span className="display text-lg text-brand-600">{formatKsh(price)}</span>
                </span>
                <span className="mt-3 flex items-center gap-3">
                  <input
                    type="range"
                    min={rule.minCustomMbps}
                    max={rule.maxCustomMbps}
                    value={speed}
                    onChange={(event) => update("speedMbps", Number(event.target.value))}
                    className="flex-1 accent-brand-600"
                    aria-label="Custom speed"
                  />
                  <span className="display w-24 text-right text-base text-ink">{speed} Mbps</span>
                </span>
                <span className="mt-1 block text-xs text-ink-soft">
                  Price updates as you move — {formatKsh(rule.basePrice)} at {rule.baseSpeedMbps} Mbps.
                </span>
              </span>
            </label>
          ) : null}
        </div>
        {errors.planId ? <p className="mt-2 text-sm text-brand-700">{errors.planId}</p> : null}
      </fieldset>

      <fieldset>
        <legend className="text-lg font-bold text-ink">2. Your details</legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.fullName} required>
            <input
              type="text"
              value={form.fullName}
              onChange={(event) => update("fullName", event.target.value)}
              placeholder="e.g. Brian Otieno"
              className={inputClass(Boolean(errors.fullName))}
              autoComplete="name"
            />
          </Field>

          <Field label="Phone number" error={errors.phone} required>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
              placeholder="e.g. 0712 345 678"
              className={inputClass(Boolean(errors.phone))}
              autoComplete="tel"
              inputMode="tel"
            />
          </Field>

          <Field label="Alternative phone" hint="Optional — helps us reach you faster">
            <input
              type="tel"
              value={form.altPhone}
              onChange={(event) => update("altPhone", event.target.value)}
              placeholder="e.g. 0722 100 200"
              className={inputClass(false)}
              inputMode="tel"
            />
          </Field>

          <Field label="Email" hint="Optional — for your receipt" error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              placeholder="e.g. brian@example.com"
              className={inputClass(Boolean(errors.email))}
              autoComplete="email"
            />
          </Field>

          <Field label="County" error={errors.county} required>
            <select
              value={form.county}
              onChange={(event) => update("county", event.target.value)}
              className={inputClass(Boolean(errors.county))}
            >
              <option value="">Select your county</option>
              {counties.map((county) => (
                <option key={county.id} value={county.name}>
                  {county.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Exact location" error={errors.area} required hint="Your area / estate">
            <input
              type="text"
              value={form.area}
              onChange={(event) => update("area", event.target.value)}
              placeholder="e.g. Shieywe, Kakamega"
              className={inputClass(Boolean(errors.area))}
            />
          </Field>

          <Field label="Nearest landmark or directions" hint="Optional — helps the technician find you">
            <input
              type="text"
              value={form.landmark}
              onChange={(event) => update("landmark", event.target.value)}
              placeholder="e.g. Opposite Our Lady of Mercy High School"
              className={inputClass(false)}
            />
          </Field>

          <Field label="Preferred contact time">
            <select
              value={form.preferredContactTime}
              onChange={(event) => update("preferredContactTime", event.target.value)}
              className={inputClass(false)}
            >
              <option value="any">Any time</option>
              <option value="morning">Morning (8am – 12pm)</option>
              <option value="afternoon">Afternoon (12pm – 4pm)</option>
              <option value="evening">Evening (4pm – 7pm)</option>
            </select>
          </Field>

          <Field label="Preferred install date" hint="Optional">
            <input
              type="date"
              value={form.preferredInstallDate}
              onChange={(event) => update("preferredInstallDate", event.target.value)}
              className={inputClass(false)}
            />
          </Field>

          <Field label="Anything else we should know?" hint="Optional" className="sm:col-span-2">
            <textarea
              value={form.notes}
              onChange={(event) => update("notes", event.target.value)}
              rows={3}
              placeholder="e.g. Two-storey house, we may need extra cable"
              className={inputClass(false)}
            />
          </Field>

          {referralEnabled ? (
            <div className="sm:col-span-2 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/60 p-4">
              <label className="block">
                <span className="flex items-baseline gap-2 text-sm font-semibold text-ink">
                  Someone referred you?
                  <span className="text-xs font-normal text-ink-soft">Optional — put their phone number here</span>
                </span>
                <input
                  type="tel"
                  value={form.referrerPhone}
                  onChange={(event) => update("referrerPhone", event.target.value)}
                  placeholder="e.g. 0712 345 678"
                  className={`${inputClass(false)} mt-1.5`}
                  inputMode="tel"
                />
              </label>
              <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-brand-800">
                <Gift size={14} className="mt-0.5 shrink-0" />
                <span>
                  {referralNote} Refer <strong>{referralTargetCount}+</strong> people and get{" "}
                  <strong>{referralRewardDays} extra days free</strong> on your current plan once they are installed and
                  paying.
                </span>
              </p>
            </div>
          ) : null}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-lg font-bold text-ink">3. Confirm</legend>
        <div className="mt-4 space-y-3">
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
              errors.installationFeeAccepted ? "border-brand-600 bg-brand-50" : "border-ink/10 bg-white"
            }`}
          >
            <input
              type="checkbox"
              checked={form.installationFeeAccepted}
              onChange={(event) => update("installationFeeAccepted", event.target.checked)}
              className="mt-1 h-4 w-4 accent-brand-600"
            />
            <span className="text-sm text-ink">
              {consentInstallText}
              <span className="mt-1 block text-xs text-ink-soft">
                One-off payment. {firstMonthFree ? "Your first month is free." : ""} No hidden charges.
              </span>
            </span>
          </label>
          {errors.installationFeeAccepted ? (
            <p className="text-sm text-brand-700">{errors.installationFeeAccepted}</p>
          ) : null}

          <label
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
              errors.termsAccepted ? "border-brand-600 bg-brand-50" : "border-ink/10 bg-white"
            }`}
          >
            <input
              type="checkbox"
              checked={form.termsAccepted}
              onChange={(event) => update("termsAccepted", event.target.checked)}
              className="mt-1 h-4 w-4 accent-brand-600"
            />
            <span className="text-sm text-ink">
              {consentTermsText}
              <span className="mt-1 block text-xs text-ink-soft">
                No fixed contract — you can stop any time. Installation is confirmed after a site survey.
              </span>
            </span>
          </label>
          {errors.termsAccepted ? <p className="text-sm text-brand-700">{errors.termsAccepted}</p> : null}
        </div>
      </fieldset>

      {/* honeypot */}
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

      <div className="flex flex-col gap-3 border-t border-ink/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-xs text-ink-soft">
          <ShieldCheck size={15} className="text-brand-600" />
          Your details are only used to process your installation.
        </p>
        <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
          {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
          {submitting ? "Sending..." : "Send my request"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  required,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="flex items-baseline gap-2 text-sm font-semibold text-ink">
        {label}
        {required ? <span className="text-brand-600">*</span> : null}
        {hint ? <span className="text-xs font-normal text-ink-soft">{hint}</span> : null}
      </span>
      <span className="mt-1.5 block">{children}</span>
      {error ? <span className="mt-1 block text-xs text-brand-700">{error}</span> : null}
    </label>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-brand-600 ${
    hasError ? "border-brand-600" : "border-ink/12"
  }`;
}
