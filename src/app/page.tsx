import Link from "next/link";
import Contact from "@/components/Contact";
import Coverage from "@/components/Coverage";
import Faq from "@/components/Faq";
import FeatureStrip from "@/components/FeatureStrip";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import InstallBand from "@/components/InstallBand";
import PlanGrid from "@/components/PlanGrid";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import Testimonials from "@/components/Testimonials";
import Technicians from "@/components/Technicians";
import WhatsAppFab from "@/components/WhatsAppFab";
import { computeCustomPrice } from "@/lib/pricing";
import { getContentBlocks, getPlans, getPricingRule, getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const config = await getSiteConfig();
  const rule = getPricingRule(config);
  const planRows = await getPlans();
  const plans = planRows.map((plan) => ({
    ...plan,
    computedPrice: plan.priceOverride ?? computeCustomPrice(plan.speedMbps, rule),
  }));

  const [features, steps, faqs, coverage, testimonials, technicians] = await Promise.all([
    getContentBlocks("feature"),
    getContentBlocks("step"),
    getContentBlocks("faq"),
    getContentBlocks("coverage_area"),
    getContentBlocks("testimonial"),
    getContentBlocks("technician"),
  ]);

  const crew = technicians.map((block) => {
    let meta: Record<string, unknown> = {};
    try {
      meta = block.metaJson ? (JSON.parse(block.metaJson) as Record<string, unknown>) : {};
    } catch {
      meta = {};
    }
    return {
      id: block.id,
      name: block.title ?? "",
      phone: String(meta.phone ?? ""),
      role: String(meta.role ?? "Technician"),
      area: String(meta.area ?? ""),
      accent: String(meta.accent ?? "#e60000"),
      initials: String(meta.initials ?? ""),
    };
  });

  const startingPrice = Math.min(
    ...plans.filter((plan) => plan.isCustom === 0).map((plan) => plan.computedPrice),
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "InternetServiceProvider",
    name: config.brandName,
    description: config.brandTaglineAlt,
    url: siteUrl,
    telephone: config.phonePrimary,
    email: config.email,
    areaServed: coverage.map((area) => area.title).filter(Boolean),
    priceRange: "Ksh 1,000 - Ksh 3,700",
    sameAs: [
      `https://wa.me/${config.whatsappNumber.replace(/\D/g, "")}`,
    ],
    makesOffer: plans
      .filter((plan) => plan.isCustom === 0)
      .map((plan) => ({
        "@type": "Offer",
        name: `${plan.name} — ${plan.speedMbps} Mbps`,
        price: plan.computedPrice,
        priceCurrency: "KES",
      })),
  };

  return (
    <>
      <SiteHeader ctaLabel={config.heroPrimaryCta} />
      <main id="main">
        <Hero config={config} startingPrice={startingPrice} />

        {config.showFeatures ? <FeatureStrip features={features} heading="Why homes choose Spider Link" /> : null}

        {config.showPlans ? (
          <section id="plans" className="bg-mist py-20 md:py-24">
            <div className="container-x">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-600">Plans</p>
                <h2 className="display mt-2 text-3xl text-ink md:text-4xl">Pick the speed that fits your home</h2>
                <p className="mt-3 text-ink-soft">
                  Every plan is unlimited, every plan gets a free site survey, and every plan starts with a free first
                  month. Need something specific? Build your own speed below.
                </p>
              </div>

              <div className="mt-10">
                <PlanGrid
                  plans={plans}
                  rule={rule}
                  installFee={config.installFee}
                  firstMonthFree={config.firstMonthFree}
                  ctaLabel={config.heroPrimaryCta}
                />
              </div>
            </div>
          </section>
        ) : null}

        {config.showSteps ? (
          <HowItWorks steps={steps} note={config.howItWorksNote} />
        ) : null}

        {config.showInstallBand ? (
          <InstallBand
            installFee={config.installFee}
            includes={config.installFeeIncludes}
            timing={config.installFeeTiming}
            firstMonthFree={config.firstMonthFree}
            firstMonthFreeLabel={config.firstMonthFreeLabel}
            ctaLabel={config.heroPrimaryCta}
          />
        ) : null}

        {config.showCoverage ? (
          <Coverage areas={coverage} note={config.coverageNote} ctaLabel={config.heroPrimaryCta} />
        ) : null}

        <Technicians
          technicians={crew}
          intro={config.techniciansIntro}
          areaNote={config.techniciansAreaNote}
          ctaLabel={config.heroPrimaryCta}
        />

        {config.showFaq ? (
          <Faq faqs={faqs} heading="Questions people ask us" />
        ) : null}

        {config.showTestimonials ? (
          <Testimonials testimonials={testimonials} heading="Happy neighbours" />
        ) : null}

        <Contact config={config} />

        <section className="bg-mist py-14">
          <div className="container-x flex flex-col items-center gap-4 text-center">
            <h2 className="display text-2xl text-ink md:text-3xl">Ready for fast fibre at home?</h2>
            <p className="max-w-xl text-ink-soft">
              Send your request in a minute. We will call you, survey your home and install — your first month is free.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/request" className="btn-primary">
                {config.heroPrimaryCta}
              </Link>
              <Link href="/complaint" className="btn-secondary">
                Report a problem
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter config={config} />
      <WhatsAppFab
        number={config.whatsappNumber}
        message={`Hi ${config.brandName}, I would like to know more about your fibre plans.`}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
