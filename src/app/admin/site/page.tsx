import Link from "next/link";
import { getSessionAdmin } from "@/lib/auth";
import { SitePlansSection } from "@/components/admin/SitePlansSection";
import { SiteContentSection } from "@/components/admin/SiteContentSection";
import { SiteBlocksSection } from "@/components/admin/SiteBlocksSection";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Site content",
  robots: { index: false, follow: false },
};

const TABS = [
  { key: "plans", label: "Plans & pricing" },
  { key: "content", label: "Words & contact" },
  { key: "blocks", label: "Features, steps & FAQ" },
];

export default async function AdminSitePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const admin = await getSessionAdmin();
  const tab = TABS.some((item) => item.key === params.tab) ? params.tab! : "plans";
  const readOnly = admin?.role !== "owner";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-2xl text-ink md:text-3xl">Site content</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Everything a visitor sees — prices, words, contact details and payment info. Change it here and the website
          updates. No developer needed.
        </p>
        {readOnly ? (
          <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            You are signed in as an agent — you can view this page, but only the owner can save changes.
          </p>
        ) : null}
      </div>

      <nav className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <Link
            key={item.key}
            href={`/admin/site?tab=${item.key}`}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              tab === item.key
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-ink/12 text-ink-soft hover:border-brand-300"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {tab === "plans" ? <SitePlansSection /> : null}
      {tab === "content" ? <SiteContentSection /> : null}
      {tab === "blocks" ? <SiteBlocksSection /> : null}
    </div>
  );
}
