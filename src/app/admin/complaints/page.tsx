import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { complaints } from "@/db/schema";
import { formatDateTime, relativeTime } from "@/lib/utils";
import StatusPill from "@/components/admin/StatusPill";
import SendWhatsappButton from "@/components/admin/SendWhatsappButton";
import { COMPLAINT_STATUSES } from "@/lib/constants";
import { updateComplaint } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "";
  const rows = await db
    .select()
    .from(complaints)
    .where(status && COMPLAINT_STATUSES.includes(status as (typeof COMPLAINT_STATUSES)[number]) ? eq(complaints.status, status) : undefined)
    .orderBy(desc(complaints.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-2xl text-ink md:text-3xl">Complaints</h1>
        <p className="mt-1 text-sm text-ink-soft">{rows.length} complaint(s) logged.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/complaints"
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
            status === "" ? "border-brand-600 bg-brand-50 text-brand-700" : "border-ink/12 text-ink-soft"
          }`}
        >
          All
        </Link>
        {COMPLAINT_STATUSES.map((value) => (
          <Link
            key={value}
            href={`/admin/complaints?status=${value}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
              status === value ? "border-brand-600 bg-brand-50 text-brand-700" : "border-ink/12 text-ink-soft"
            }`}
          >
            {value.replace("_", " ")}
          </Link>
        ))}
      </div>

      <div className="space-y-4">
        {rows.length ? (
          rows.map((row) => (
            <article key={row.id} className="rounded-[var(--radius-card)] border border-ink/8 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="display text-base text-brand-600">{row.reference}</span>
                    <StatusPill status={row.status} />
                    {row.priority === "high" ? (
                      <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[0.65rem] font-bold uppercase text-white">
                        High
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-1 text-base font-bold text-ink">{row.subject}</h2>
                  <p className="text-xs text-ink-soft">
                    {row.fullName} Â· {row.phone} Â· {row.category.replace("_", " ")} Â· {relativeTime(row.createdAt)}
                  </p>
                </div>
                <a href={`tel:${row.phone}`} className="btn-secondary !px-4 !py-2 text-sm">
                  Call
                </a>
              </div>

              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-mist/60 p-3 text-sm text-ink-soft">
                {row.description}
              </p>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
                <form action={updateComplaint} className="grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
                  <input type="hidden" name="id" value={row.id} />
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Status</span>
                    <select
                      name="status"
                      defaultValue={row.status}
                      className="mt-1 w-full rounded-lg border border-ink/12 bg-white px-3 py-2 text-sm outline-none focus:border-brand-600"
                    >
                      {COMPLAINT_STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {value.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                      Resolution / update
                    </span>
                    <input
                      name="resolution"
                      defaultValue={row.resolution ?? ""}
                      placeholder="What did we do about it?"
                      className="mt-1 w-full rounded-lg border border-ink/12 px-4 py-2 text-sm outline-none focus:border-brand-600"
                    />
                  </label>
                  <button type="submit" className="btn-primary !px-4 !py-2 text-sm">
                    Save
                  </button>
                </form>

                <div className="flex items-end">
                  <SendWhatsappButton
                    toPhone={row.phone}
                    complaintId={row.id}
                    body={`Hi ${row.fullName.split(" ")[0]}, about your complaint (${row.reference}) â€” we are on it and will update you shortly. Spider Link Solution.`}
                    templateKey="complaint_update"
                    label="Reply on WhatsApp"
                  />
                </div>
              </div>

              {row.resolvedAt ? (
                <p className="mt-3 text-xs text-ink-soft">Resolved {formatDateTime(row.resolvedAt)}</p>
              ) : null}
            </article>
          ))
        ) : (
          <p className="rounded-[var(--radius-card)] border border-ink/8 bg-white px-5 py-10 text-center text-sm text-ink-soft">
            No complaints here. Nice work.
          </p>
        )}
      </div>
    </div>
  );
}

