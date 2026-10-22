import { Check } from "lucide-react";
import Reveal from "./Reveal";

export default function FeatureStrip({
  features,
  heading,
}: {
  features: Array<{ id: string; title: string | null; body: string | null }>;
  heading: string;
}) {
  if (!features.length) return null;

  return (
    <section id="features" className="bg-white py-20 md:py-24">
      <div className="container-x">
        <Reveal>
          <h2 className="display text-3xl text-ink md:text-4xl">{heading}</h2>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Everything you get with Spider Link fibre — no data caps, no long contracts, and help whenever you need it.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal key={feature.id} delay={index * 60}>
              <div className="flex h-full gap-4 rounded-[var(--radius-card)] border border-ink/8 bg-mist/60 p-5 transition-colors hover:border-brand-200 hover:bg-white">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                  <Check size={17} strokeWidth={3} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-ink">{feature.title}</h3>
                  {feature.body ? <p className="mt-1 text-sm leading-relaxed text-ink-soft">{feature.body}</p> : null}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
