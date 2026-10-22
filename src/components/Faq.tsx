"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Reveal from "./Reveal";

export default function Faq({
  faqs,
  heading,
}: {
  faqs: Array<{ id: string; title: string | null; body: string | null }>;
  heading: string;
}) {
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);

  if (!faqs.length) return null;

  return (
    <section id="faq" className="bg-mist py-20 md:py-24">
      <div className="container-x max-w-3xl">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-600">Questions</p>
          <h2 className="display mt-2 text-3xl text-ink md:text-4xl">{heading}</h2>
        </Reveal>

        <div className="mt-8 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = open === faq.id;
            return (
              <Reveal key={faq.id} delay={index * 40}>
                <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-base font-semibold text-ink">{faq.title}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-brand-600 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">{faq.body}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
