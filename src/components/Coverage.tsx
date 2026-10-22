import { MapPin } from "lucide-react";
import Reveal from "./Reveal";

export default function Coverage({
  areas,
  note,
  ctaLabel,
}: {
  areas: Array<{ id: string; title: string | null; body: string | null }>;
  note: string;
  ctaLabel: string;
}) {
  if (!areas.length) return null;

  return (
    <section id="coverage" className="bg-white py-20 md:py-24">
      <div className="container-x grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-600">Where we serve</p>
          <h2 className="display mt-2 text-3xl text-ink md:text-4xl">Bringing fibre to your neighbourhood</h2>
          <p className="mt-4 max-w-lg text-ink-soft">{note}</p>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {areas.map((area, index) => (
            <Reveal key={area.id} delay={index * 60}>
              <div className="flex items-start gap-3 rounded-2xl border border-ink/8 bg-mist/60 p-5">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600">
                  <MapPin size={18} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-ink">{area.title}</h3>
                  {area.body ? <p className="text-sm text-ink-soft">{area.body}</p> : null}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
