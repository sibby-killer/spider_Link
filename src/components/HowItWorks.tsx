import Reveal from "./Reveal";

export default function HowItWorks({
  steps,
  note,
}: {
  steps: Array<{ id: string; title: string | null; body: string | null }>;
  note: string;
}) {
  if (!steps.length) return null;

  return (
    <section id="how-it-works" className="bg-mist py-20 md:py-24">
      <div className="container-x">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-600">How it works</p>
          <h2 className="display mt-2 text-3xl text-ink md:text-4xl">Four steps to fast fibre</h2>
          <p className="mt-3 max-w-2xl text-ink-soft">{note}</p>
        </Reveal>

        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal key={step.id} delay={index * 80}>
              <li className="relative h-full rounded-[var(--radius-card)] border border-ink/8 bg-white p-6">
                <span className="display absolute -top-5 left-6 flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-lg text-white shadow-[var(--shadow-glow)]">
                  {index + 1}
                </span>
                <h3 className="mt-3 text-lg font-bold text-ink">{step.title}</h3>
                {step.body ? <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p> : null}
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
