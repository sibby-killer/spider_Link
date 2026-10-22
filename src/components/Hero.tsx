import Link from "next/link";
import { ArrowRight, MessageCircle, Star } from "lucide-react";
import HeroScene from "./HeroScene";
import { formatKsh } from "@/lib/pricing";
import type { SiteConfig } from "@/lib/site-config";

export default function Hero({ config, startingPrice }: { config: SiteConfig; startingPrice: number }) {
  const words = config.heroTitle.trim().split(/\s+/);
  const splitAt = words.length > 2 ? Math.ceil(words.length / 2) : words.length;
  const headlineTop = words.slice(0, splitAt).join(" ");
  const headlineBottom = words.slice(splitAt).join(" ");

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(120%_120%_at_75%_10%,#ff2b2b_0%,#e60000_28%,#8f0000_58%,#3a0000_100%)] pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:3px_3px]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />

      <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="text-center lg:text-left">
          {config.announcementEnabled && config.announcementText ? (
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
              <Star size={13} className="fill-white" />
              {config.announcementText}
            </p>
          ) : null}

          <p className="display text-sm tracking-[0.4em] text-brand-100 md:text-base">{config.heroEyebrow}</p>

          <h1 className="display mt-3 text-[clamp(2.4rem,6.4vw,4.6rem)] text-white">
            {headlineTop ? <span className="block">{headlineTop}</span> : null}
            {headlineBottom ? (
              <span className="block text-brand-100">{headlineBottom}</span>
            ) : null}
          </h1>

          <p className="mt-5 text-lg font-medium text-white/90 md:text-xl">{config.heroSubtitle}</p>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80 md:mx-0">
            Unlimited home fibre with no data caps, a router and setup for {formatKsh(config.installFee)}, and your
            first month on us. We will call you, survey your home, and get you online.
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
            <Link href="/request" className="btn-primary !bg-white !text-brand-700 hover:!bg-brand-50">
              {config.heroPrimaryCta}
              <ArrowRight size={18} />
            </Link>
            <a
              href="#plans"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/80 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
            >
              {config.heroSecondaryCta}
            </a>
          </div>

          <dl className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/20 pt-6 lg:mx-0">
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/70">From</dt>
              <dd className="display text-xl text-white md:text-2xl">{formatKsh(startingPrice)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/70">Install</dt>
              <dd className="display text-xl text-white md:text-2xl">{formatKsh(config.installFee)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/70">First month</dt>
              <dd className="display text-xl text-white md:text-2xl">FREE</dd>
            </div>
          </dl>

          <p className="mt-6 inline-flex items-center gap-2 text-sm text-white/75">
            <MessageCircle size={16} />
            Prefer to talk? WhatsApp us on {config.phonePrimaryDisplay}
          </p>
        </div>

        <div className="relative h-[280px] sm:h-[360px] lg:h-[460px] lg:-mr-10">
          {config.heroShow3d ? (
            <HeroScene />
          ) : (
            <div className="flex h-full items-center justify-center">
              <img src="/brand/spider-mark.svg" alt="" className="w-56 opacity-90" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
