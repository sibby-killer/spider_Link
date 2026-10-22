import Link from "next/link";
import { desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { complaints, customers, requests } from "@/db/schema";
import { formatKsh } from "@/lib/pricing";
import { getReferralStats } from "@/lib/referrals";
import { formatDateTime, relativeTime } from "@/lib/utils";
import StatusPill from "@/components/admin/StatusPill";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [newThisWeek] = await db
    .select({ count: sql<number>`count(*)` })
    .from(requests)
    .where(gte(requests.createdAt, weekAgo));

  const [awaitingSurvey] = await db
    .select({ count: sql<number>`count(*)` })
    .from(requests)
    .where(eq(requests.status, "survey_scheduled"));

  const [activeCustomers] = await db
    .select({ count: sql<number>`count(*)` })
    .from(customers)
    .where(eq(customers.status, "active"));

  const [openComplaints] = await db
    .select({ count: sql<number>`count(*)` })
    .from(complaints)
    .where(eq(complaints.status, "open"));

  const [notSent] = await db
    .select({ count: sql<number>`count(*)` })
    .from(requests)
    .where(eq(requests.whatsappSent, 0));

  const [revenue] = await db
    .select({ total: sql<number>`coalesce(sum(${customers.monthlyPrice}), 0)` })
    .from(customers)
    .where(eq(customers.status, "active"));

  const recentRequests = await db.select().from(requests).orderBy(desc(requests.createdAt)).limit(8);
  const recentComplaints = await db.select().from(complaints).orderBy(desc(complaints.createdAt)).limit(5);
  const referralRows = await getReferralStats(10, 60);
  const referralLeader = referralRows[0] ?? null;
  const rewardsDue = referralRows.filter((row) => row.eligible && !row.awarded).length;

  const stats = [
    { label: "New requests (7 days)", value: newThisWeek.count, href: "/admin/requests" },
    { label: "Survey scheduled", value: awaitingSurvey.count, href: "/admin/requests?status=survey_scheduled" },
    { label: "Active customers", value: activeCustomers.count, href: "/admin/customers" },
    { label: "Open complaints", value: openComplaints.count, href: "/admin/complaints" },
    { label: "Not sent to WhatsApp", value: notSent.count, href: "/admin/requests?whatsapp=0" },
    { label: "Monthly recurring", value: formatKsh(revenue.total), href: "/admin/customers" },
    {
      label: "Referral rewards due",
      value: rewardsDue,
      href: "/admin/referrals",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display text-2xl text-ink md:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-soft">Everything happening with Spider Link fibre, in one place.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-[var(--radius-card)] border border-ink/8 bg-white p-5 transition-colors hover:border-brand-300"
          >
            <p className="text-xs uppercase tracking-wider text-ink-soft">{stat.label}</p>
            <p className="display mt-1 text-3xl text-ink">{stat.value}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-[var(--radius-card)] border border-ink/8 bg-white">
        <header className="flex items-center justify-between gap-3 border-b border-ink/8 px-5 py-4">
          <h2 className="text-base font-bold text-ink">Latest requests</h2>
          <Link href="/admin/requests" className="text-sm font-semibold text-brand-600 hover:underline">
            View all
          </Link>
        </header>

        {recentRequests.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-mist/60 text-xs uppercase tracking-wider text-ink-soft">
                <tr>
                  <th className="px-5 py-3 font-semibold">Reference</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Area</th>
                  <th className="px-5 py-3 font-semibold">Plan</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {recentRequests.map((row) => (
                  <tr key={row.id} className="hover:bg-mist/40">
                    <td className="px-5 py-3 font-semibold text-brand-600">{row.reference}</td>
                    <td className="px-5 py-3">
                      <span className="block font-medium text-ink">{row.fullName}</span>
                      <span className="text-xs text-ink-soft">{row.phone}</span>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{row.area}</td>
                    <td className="px-5 py-3 text-ink-soft">{row.planNameSnapshot}</td>
                    <td className="px-5 py-3">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="px-5 py-3 text-xs text-ink-soft" title={formatDateTime(row.createdAt)}>
                      {relativeTime(row.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-ink-soft">No requests yet.</p>
        )}
      </section>

      <section className="rounded-[var(--radius-card)] border border-ink/8 bg-white">
        <header className="flex items-center justify-between gap-3 border-b border-ink/8 px-5 py-4">
          <h2 className="text-base font-bold text-ink">Top referrer</h2>
          <Link href="/admin/referrals" className="text-sm font-semibold text-brand-600 hover:underline">
            All referrals
          </Link>
        </header>
        {referralLeader ? (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-ink">{referralLeader.referrerName ?? referralLeader.referrerPhone}</p>
              <p className="text-xs text-ink-soft">
                {referralLeader.successful} installed of {referralLeader.total} referred
                {referralLeader.eligible ? " — reward ready" : ""}
              </p>
            </div>
            <StatusPill status={referralLeader.awarded ? "activated" : referralLeader.eligible ? "survey_scheduled" : "pending"} />
          </div>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-ink-soft">No referrals yet.</p>
        )}
      </section>

      <section className="rounded-[var(--radius-card)] border border-ink/8 bg-white">
        <header className="flex items-center justify-between gap-3 border-b border-ink/8 px-5 py-4">
          <h2 className="text-base font-bold text-ink">Latest complaints</h2>
          <Link href="/admin/complaints" className="text-sm font-semibold text-brand-600 hover:underline">
            View all
          </Link>
        </header>

        {recentComplaints.length ? (
          <ul className="divide-y divide-ink/6">
            {recentComplaints.map((complaint) => (
              <li key={complaint.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{complaint.subject}</p>
                  <p className="text-xs text-ink-soft">
                    {complaint.fullName} · {complaint.reference}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ink-soft">{relativeTime(complaint.createdAt)}</span>
                  <StatusPill status={complaint.status} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-ink-soft">No complaints. Nice.</p>
        )}
      </section>
    </div>
  );
}
