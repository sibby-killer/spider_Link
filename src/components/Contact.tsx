import Link from "next/link";
import { Clock, Headphones, Mail, MapPin, MessageCircle, Phone, Wrench } from "lucide-react";
import Reveal from "./Reveal";

export default function Contact({
  config,
}: {
  config: {
    phonePrimary: string;
    phoneSecondary: string;
    phonePrimaryDisplay: string;
    phoneSecondaryDisplay: string;
    whatsappNumber: string;
    email: string;
    location: string;
    supportHours: string;
    brandName: string;
  };
}) {
  const waMessage = `Hi ${config.brandName}, I would like to ask about home fibre.`;

  return (
    <section id="contact" className="bg-ink py-20 text-white md:py-24">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1fr]">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-400">Talk to us</p>
          <h2 className="display mt-2 text-3xl md:text-4xl">We are easy to reach</h2>
          <p className="mt-4 max-w-lg text-white/70">
            Call, WhatsApp or send us a request — whichever is easiest for you. A real person answers.
          </p>

          <div className="mt-8 space-y-4">
            <a
              href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(waMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl bg-white/8 p-4 transition-colors hover:bg-white/14"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#25D366] text-white">
                <MessageCircle size={20} />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-wider text-white/60">WhatsApp us</span>
                <span className="display text-lg">{config.phonePrimaryDisplay}</span>
              </span>
            </a>

            <a
              href={`tel:${config.phonePrimary}`}
              className="flex items-center gap-4 rounded-2xl bg-white/8 p-4 transition-colors hover:bg-white/14"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Phone size={19} />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-wider text-white/60">Call us</span>
                <span className="display text-lg">{config.phonePrimaryDisplay}</span>
              </span>
            </a>

            <a
              href={`tel:${config.phoneSecondary}`}
              className="flex items-center gap-4 rounded-2xl bg-white/8 p-4 transition-colors hover:bg-white/14"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/12 text-white">
                <Phone size={19} />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-wider text-white/60">Alternative line</span>
                <span className="display text-lg">{config.phoneSecondaryDisplay}</span>
              </span>
            </a>

            <div className="flex items-center gap-4 rounded-2xl bg-white/8 p-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/12 text-white">
                <MapPin size={19} />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-wider text-white/60">Find us</span>
                <span className="text-sm">{config.location}</span>
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="rounded-[var(--radius-card)] bg-white p-7 text-ink">
            <h3 className="display text-2xl">Already a customer?</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Tell us what is wrong and we will get back to you. We answer {config.supportHours.toLowerCase()}.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-ink/8 bg-mist/60 p-4">
                <Wrench size={18} className="shrink-0 text-brand-600" />
                <p className="text-sm">
                  <span className="font-semibold">No connection or slow speed?</span>
                  <span className="block text-ink-soft">Open a complaint and we will chase it for you.</span>
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-ink/8 bg-mist/60 p-4">
                <Headphones size={18} className="shrink-0 text-brand-600" />
                <p className="text-sm">
                  <span className="font-semibold">Questions about a plan?</span>
                  <span className="block text-ink-soft">WhatsApp is the fastest way to reach us.</span>
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-ink/8 bg-mist/60 p-4">
                <Clock size={18} className="shrink-0 text-brand-600" />
                <p className="text-sm">
                  <span className="font-semibold">{config.supportHours}</span>
                  <span className="block text-ink-soft">Real help whenever your connection lets you down.</span>
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-ink/8 bg-mist/60 p-4">
                <Mail size={18} className="shrink-0 text-brand-600" />
                <p className="text-sm">
                  <span className="font-semibold">{config.email}</span>
                  <span className="block text-ink-soft">Prefer email? We reply within a day.</span>
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/complaint" className="btn-primary flex-1">
                Report a problem
              </Link>
              <Link href="/request" className="btn-secondary flex-1">
                Request installation
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
