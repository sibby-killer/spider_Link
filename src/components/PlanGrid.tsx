"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Gauge, Minus, Plus, Zap } from "lucide-react";
import { clampCustomSpeed, computeCustomPrice, formatKsh, type PricingRule } from "@/lib/pricing";
import type { Plan } from "@/db/schema";
import Reveal from "./Reveal";

type PlanRow = Plan & { computedPrice: number };

export default function PlanGrid({
  plans,
  rule,
  installFee,
  firstMonthFree,
  ctaLabel,
}: {
  plans: PlanRow[];
  rule: PricingRule;
  installFee: number;
  firstMonthFree: boolean;
  ctaLabel: string;
}) {
  const customPlan = plans.find((plan) => plan.isCustom === 1);
  const [speed, setSpeed] = useState(Math.max(rule.minCustomMbps, 10));
  const [customPrice, setCustomPrice] = useState(rule.basePrice);

  const namedPlans = plans.filter((plan) => plan.isCustom === 0);

  const price = useMemo(() => {
    const next = computeCustomPrice(speed, rule);
    setCustomPrice(next);
    return next;
  }, [speed, rule]);

  function changeSpeed(next: number) {
    setSpeed(clampCustomSpeed(next, rule));
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {namedPlans.map((plan, index) => {
        const price = plan.priceOverride ?? plan.computedPrice;
        return (
          <Reveal key={plan.id} delay={index * 70}>
            <article className="group relative flex h-full flex-col rounded-[var(--radius-card)] border border-ink/8 bg-white p-6 shadow-[0_18px_40px_-32px_rgba(11,11,11,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[var(--shadow-glow)]">
              {plan.badge ? (
                <span className="absolute -top-3 left-6 rounded-full bg-brand-600 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white">
                  {plan.badge}
                </span>
              ) : null}

              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Zap size={20} />
                </span>
                <div>
                  <h3 className="display text-xl text-ink">{plan.name}</h3>
                  <p className="text-sm text-ink-soft">{plan.speedMbps} Mbps</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{plan.description ?? plan.tagline}</p>

              <div className="mt-5 flex items-end gap-2">
                <span className="display text-4xl text-brand-600">{formatKsh(price)}</span>
                <span className="pb-1 text-sm text-ink-soft">/month</span>
              </div>

              <ul className="mt-5 space-y-2 text-sm text-ink-soft">
                <li className="flex items-center gap-2">
                  <Check size={15} className="shrink-0 text-brand-600" /> Unlimited data
                </li>
                {firstMonthFree ? (
                  <li className="flex items-center gap-2">
                    <Check size={15} className="shrink-0 text-brand-600" /> First month free
                  </li>
                ) : null}
                <li className="flex items-center gap-2">
                  <Check size={15} className="shrink-0 text-brand-600" /> Installation {formatKsh(installFee)}
                </li>
                <li className="flex items-center gap-2">
                  <Check size={15} className="shrink-0 text-brand-600" /> Free site survey
                </li>
              </ul>

              <Link
                href={`/request?plan=${plan.slug}`}
                className="btn-primary mt-6 w-full"
                aria-label={`${ctaLabel} on the ${plan.name} plan`}
              >
                {ctaLabel}
              </Link>
            </article>
          </Reveal>
        );
      })}

      {customPlan ? (
        <Reveal delay={namedPlans.length * 70}>
          <article className="flex h-full flex-col rounded-[var(--radius-card)] border-2 border-brand-600 bg-[linear-gradient(160deg,#fff_0%,#fff1f1_100%)] p-6 shadow-[var(--shadow-glow)]">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Gauge size={20} />
              </span>
              <div>
                <h3 className="display text-xl text-ink">{customPlan.name}</h3>
                <p className="text-sm text-ink-soft">Pick your own speed</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              Need more speed? Choose exactly what you need and we will price it for you right here.
            </p>

            <div className="mt-5 rounded-2xl border border-brand-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">Speed</span>
                <span className="display text-2xl text-brand-600">{speed} Mbps</span>
              </div>

              <input
                type="range"
                min={rule.minCustomMbps}
                max={rule.maxCustomMbps}
                step={1}
                value={speed}
                onChange={(event) => changeSpeed(Number(event.target.value))}
                aria-label="Custom speed in Mbps"
                className="mt-3 w-full accent-brand-600"
              />

              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => changeSpeed(speed - 5)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-brand-600 hover:text-brand-600"
                  aria-label="Decrease speed"
                >
                  <Minus size={16} />
                </button>

                <div className="flex items-baseline gap-1">
                  <span className="display text-3xl text-brand-600">{formatKsh(customPrice)}</span>
                  <span className="text-xs text-ink-soft">/month</span>
                </div>

                <button
                  type="button"
                  onClick={() => changeSpeed(speed + 5)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-brand-600 hover:text-brand-600"
                  aria-label="Increase speed"
                >
                  <Plus size={16} />
                </button>
              </div>

              <p className="mt-2 text-center text-xs text-ink-soft">
                From {formatKsh(rule.basePrice)} at {rule.baseSpeedMbps} Mbps
              </p>
            </div>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="display text-4xl text-brand-600">{formatKsh(customPrice)}</span>
              <span className="pb-1 text-sm text-ink-soft">/month</span>
            </div>

            <Link href={`/request?plan=custom&speed=${speed}`} className="btn-primary mt-6 w-full">
              Request this speed
            </Link>
          </article>
        </Reveal>
      ) : null}
    </div>
  );
}
