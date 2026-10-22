import { Quote, Star } from "lucide-react";
import Reveal from "./Reveal";

export default function Testimonials({
  testimonials,
  heading,
}: {
  testimonials: Array<{ id: string; title: string | null; body: string | null; metaJson: string | null }>;
  heading: string;
}) {
  if (!testimonials.length) return null;

  return (
    <section className="bg-white py-20 md:py-24">
      <div className="container-x">
        <Reveal>
          <h2 className="display text-3xl text-ink md:text-4xl">{heading}</h2>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((item, index) => {
            let meta: Record<string, unknown> = {};
            try {
              meta = item.metaJson ? (JSON.parse(item.metaJson) as Record<string, unknown>) : {};
            } catch {
              meta = {};
            }
            const rating = Number(meta.rating ?? 5);
            return (
              <Reveal key={item.id} delay={index * 60}>
                <figure className="flex h-full flex-col rounded-[var(--radius-card)] border border-ink/8 bg-mist/60 p-6">
                  <Quote size={22} className="text-brand-300" />
                  <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                    {item.body}
                  </blockquote>
                  <figcaption className="mt-5">
                    <p className="text-sm font-bold text-ink">{item.title}</p>
                    <p className="text-xs text-ink-soft">{String(meta.area ?? meta.plan ?? "")}</p>
                    <div className="mt-2 flex gap-0.5" aria-label={`${rating} out of 5`}>
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          size={13}
                          className={starIndex < rating ? "fill-brand-500 text-brand-500" : "text-ink/20"}
                        />
                      ))}
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
