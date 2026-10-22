import type { Metadata } from "next";
import ComplaintForm from "@/components/ComplaintForm";
import PublicShell from "@/components/PublicShell";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Report a problem",
  description: "Tell Spider Link about a problem with your connection and we will get back to you 24/7.",
  robots: { index: false, follow: true },
};

export default async function ComplaintPage() {
  const config = await getSiteConfig();

  return (
    <PublicShell>
      <div className="container-x py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[var(--radius-card)] border border-ink/8 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(11,11,11,0.6)] md:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-600">Customer support</p>
            <h1 className="display mt-2 text-3xl text-ink md:text-4xl">Report a problem</h1>
            <p className="mt-3 text-ink-soft">
              Tell us what is wrong and we will chase it for you. We answer {config.supportHours.toLowerCase()}.
            </p>

            <div className="mt-8">
              <ComplaintForm />
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-ink-soft">
            In a hurry? WhatsApp us on{" "}
            <a
              href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-600"
            >
              {config.phonePrimaryDisplay}
            </a>
          </p>
        </div>
      </div>
    </PublicShell>
  );
}
