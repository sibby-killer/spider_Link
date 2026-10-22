import Link from "next/link";
import { desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { plans, requests } from "@/db/schema";
import { formatKsh } from "@/lib/pricing";
import { formatDateTime, relativeTime } from "@/lib/utils";
import StatusPill from "@/components/admin/StatusPill";
import { REQUEST_STATUSES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; plan?: string; whatsapp?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "";
  const query = params.q?.trim() ?? "";
  const planSlug = params.plan ?? "";

  const planRows = await db.select().from(plans).orderBy(planRowsOrder());
  const planFilter = planRows.find((plan) => plan.slug === planSlug);

  const filters = [];
  if (status && REQUEST_STATUSES.includes(status as (typeof REQUEST_STATUSES)[number])) {
    filters.push(eq(requests.status, status));
  }
  if (planFilter) filters.push(eq(requests.planId, planFilter.id));
  if (params.whatsapp === "0") filters.push(eq(requests.whatsappSent, 0));
  if (query) {
    const pattern = `%${query}%`;
    filters.push(
      or(like(requests.fullName, pattern), like(requests.phone, pattern), like(requests.reference, pattern))!,
    );
  }

  const rows = await db
    .select()
    .from(requests)
    .where(filters.length ? sql`${filters.reduce((acc, condition) => sql`${acc} AND ${condition}`)}` : undefined)
    .orderBy(desc(requests.createdAt))
    .limit(200);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-2xl text-ink md:text-3xl">Requests</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {rows.length} request{rows.length === 1 ? "" : "s"}
            {status ? ` with status "${status}"` : ""}.
          </p>
        </div>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-[var(--radius-card)] border border-ink/8 bg-white p-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Search</span>
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Name, phone or reference"
            className="mt-1 w-full rounded-lg border border-ink/12 px-3 py-2 text-sm outline-none focus:border-brand-600 sm:w-64"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Status</span>
          <select
            name="status"
            defaultValue={status}
            className="mt-1 rounded-lg border border-ink/12 bg-white px-3 py-2 text-sm outline-none focus:border-brand-600"
          >
            <option value="">All</option>
            {REQUEST_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Plan</span>
          <select
            name="plan"
            defaultValue={planSlug}
            className="mt-1 rounded-lg border border-ink/12 bg-white px-3 py-2 text-sm outline-none focus:border-brand-600"
          >
            <option value="">All</option>
            {planRows.map((plan) => (
              <option key={plan.id} value={plan.slug}>
                {plan.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm text-ink-soft">
          <input type="checkbox" name="whatsapp" value="0" defaultChecked={params.whatsapp === "0"} className="h-4 w-4 accent-brand-600" />
          Only not sent to WhatsApp
        </label>

        <button type="submit" className="btn-primary !px-5 !py-2 text-sm">
          Filter
        </button>
        <Link href="/admin/requests" className="pb-2 text-sm text-ink-soft hover:text-brand-600">
          Reset
        </Link>
      </form>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-ink/8 bg-white">
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-mist/60 text-xs uppercase tracking-wider text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-semibold">Ref</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Area</th>
                  <th className="px-4 py-3 font-semibold">Plan</th>
                  <th className="px-4 py-3 font-semibold">Fee</th>
                  <th className="px-4 py-3 font-semibold">WhatsApp</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">When</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-mist/40">
                    <td className="px-4 py-3 font-semibold text-brand-600">{row.reference}</td>
                    <td className="px-4 py-3">
                      <span className="block font-medium text-ink">{row.fullName}</span>
                      <a href={`tel:${row.phone}`} className="text-xs text-ink-soft hover:text-brand-600">
                        {row.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {row.county ? <span className="block text-xs">{row.county}</span> : null}
                      {row.area}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {row.planNameSnapshot}
                      <span className="block text-xs">{formatKsh(row.priceSnapshot)}/mo</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={row.paymentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      {row.whatsappSent ? (
                        <span className="text-xs font-semibold text-emerald-700">Sent</span>
                      ) : (
                        <span className="text-xs font-semibold text-brand-700">Not sent</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-soft" title={formatDateTime(row.createdAt)}>
                      {relativeTime(row.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/requests/${row.id}`}
                        className="text-sm font-semibold text-brand-600 hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-ink-soft">No requests match these filters.</p>
        )}
      </div>
    </div>
  );
}

function planRowsOrder() {
  return desc(plans.sortOrder);
}

