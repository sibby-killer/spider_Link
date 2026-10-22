import Link from "next/link";
import { Gift, Router } from "lucide-react";
import { formatKsh } from "@/lib/pricing";
import Reveal from "./Reveal";

export default function InstallBand({
  installFee,
  includes,
  timing,
  firstMonthFree,
  firstMonthFreeLabel,
  ctaLabel,
}: {
  installFee: number;
  includes: string;
  timing: string;
  firstMonthFree: boolean;
  firstMonthFreeLabel: string;
  ctaLabel: string;
}) {
  return (
    <section className="bg-white py-10">
      <div className="container-x">
        <Reveal>
          <div className="overflow-hidden rounded-[var(--radius-card)] bg-[linear-gradient(120deg,#e60000_0%,#b30000_55%,#750000_100%)] px-6 py-10 text-white md:px-12 md:py-12">
            <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">Installation</p>
                <h2 className="display mt-2 text-3xl md:text-4xl">
                  {formatKsh(installFee)} once, then you are online
                </h2>
                <p className="mt-3 max-w-xl text-white/85">
                  {includes}. {timing}. No hidden charges, and no fixed contract — you can stop any time.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-2xl bg-white/12 p-4 backdrop-blur">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-600">
                    <Router size={22} />
                  </span>
                  <div>
                    <p className="text-sm text-white/75">Router + installation + setup</p>
                    <p className="display text-2xl">{formatKsh(installFee)}</p>
                  </div>
                </div>

                {firstMonthFree ? (
                  <div className="flex items-center gap-4 rounded-2xl bg-white/12 p-4 backdrop-blur">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-600">
                      <Gift size={22} />
                    </span>
                    <div>
                      <p className="text-sm text-white/75">Your first month</p>
                      <p className="display text-2xl">{firstMonthFreeLabel}</p>
                    </div>
                  </div>
                ) : null}

                <Link href="/request" className="btn-primary w-full !bg-white !text-brand-700 hover:!bg-brand-50">
                  {ctaLabel}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
