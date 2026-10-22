import type { Metadata } from "next";
import RequestForm from "@/components/RequestForm";
import PublicShell from "@/components/PublicShell";
import { computeCustomPrice } from "@/lib/pricing";
import { getContentBlocks, getPlans, getPricingRule, getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request installation",
  description: "Request Spider Link home fibre installation. Pick your plan and we will call you to arrange a site survey.",
  robots: { index: false, follow: true },
};

export default async function RequestPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; speed?: string }>;
}) {
  const params = await searchParams;
  const config = await getSiteConfig();
  const rule = getPricingRule(config);
  const planRows = await getPlans();
  const plans = planRows.map((plan) => ({
    ...plan,
    computedPrice: plan.priceOverride ?? computeCustomPrice(plan.speedMbps, rule),
  }));

  const requested = plans.find((plan) => plan.slug === params.plan);
  const initialPlanId = requested?.id ?? "";
  const initialSpeed = params.speed ? Number(params.speed) : rule.baseSpeedMbps * 2;

  const countyBlocks = await getContentBlocks("county");
  const counties = countyBlocks.map((block) => ({
    id: block.id,
    name: block.title ?? "",
    areas: block.body ?? "",
  }));

  return (
    <PublicShell>
      <div className="container-x grid gap-10 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:py-14">
        <div className="rounded-[var(--radius-card)] border border-ink/8 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(11,11,11,0.6)] md:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-600">Installation request</p>
          <h1 className="display mt-2 text-3xl text-ink md:text-4xl">Let us get you online</h1>
          <p className="mt-3 text-ink-soft">
            It takes a minute. We will call you, arrange a quick site survey and install your fibre.
          </p>

          <div className="mt-8">
            <RequestForm
              plans={plans}
              rule={rule}
              installFee={config.installFee}
              firstMonthFree={config.firstMonthFree}
              consentInstallText={config.consentInstallText}
              consentTermsText={config.consentTermsText}
              initialPlanId={initialPlanId}
              initialSpeed={Number.isFinite(initialSpeed) ? initialSpeed : 10}
              counties={counties}
              referralEnabled={config.referralEnabled}
              referralNote={config.referralNote}
              referralTargetCount={config.referralTargetCount}
              referralRewardDays={config.referralRewardDays}
            />
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[var(--radius-card)] bg-ink p-6 text-white">
            <h2 className="display text-xl">What happens next</h2>
            <ol className="mt-4 space-y-4">
              {[
                "We call you to confirm your details.",
                "We do a quick site survey to confirm fibre reaches your home.",
                "We install the router and set everything up.",
                "You enjoy unlimited fibre — your first month is on us.",
              ].map((step, index) => (
                <li key={step} className="flex gap-3 text-sm text-white/80">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-[var(--radius-card)] border border-ink/8 bg-mist/70 p-6">
            <h2 className="text-base font-bold text-ink">Prefer to talk?</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Call or WhatsApp us and we will take your details over the phone.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="text-ink-soft">WhatsApp</span>{" "}
                <a href={`tel:${config.phonePrimary}`} className="font-semibold text-brand-600">
                  {config.phonePrimaryDisplay}
                </a>
              </p>
              <p>
                <span className="text-ink-soft">Call</span>{" "}
                <a href={`tel:${config.phoneSecondary}`} className="font-semibold text-brand-600">
                  {config.phoneSecondaryDisplay}
                </a>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </PublicShell>
  );
}
