import type { Metadata } from "next";
import PublicShell from "@/components/PublicShell";
import StatusLookup from "@/components/StatusLookup";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track your request",
  description: "Check the status of your Spider Link installation request.",
  robots: { index: false, follow: true },
};

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;

  return (
    <PublicShell>
      <div className="container-x py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-600">Track</p>
          <h1 className="display mt-2 text-3xl text-ink md:text-4xl">Where is my request?</h1>
          <p className="mt-3 text-ink-soft">
            Enter the reference we sent you, plus the last four digits of your phone number.
          </p>

          <div className="mt-8">
            <StatusLookup initialReference={params.ref ?? ""} />
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
