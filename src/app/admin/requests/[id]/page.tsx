import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { complaints, messages, requests } from "@/db/schema";
import { formatKsh } from "@/lib/pricing";
import { formatDateTime } from "@/lib/utils";
import StatusPill from "@/components/admin/StatusPill";
import RequestComposer from "@/components/admin/RequestComposer";
import { REQUEST_STATUSES } from "@/lib/constants";
import {
  updateRequestNotes,
  updateRequestPayment,
  updateRequestStatus,
} from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminRequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select().from(requests).where(eq(requests.id, id)).limit(1);
  if (!row) notFound();

  const sentMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.requestId, id))
    .orderBy(desc(messages.createdAt));

  const relatedComplaints = await db.select().from(complaints).where(eq(complaints.phone, row.phone));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/requests" className="text-sm text-ink-soft hover:text-brand-600">
            ← All requests
          </Link>
          <h1 className="display mt-1 text-2xl text-ink md:text-3xl">
            {row.reference} · {row.fullName}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Received {formatDateTime(row.createdAt)} · {row.area}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={row.status} />
          <a
            href={`tel:${row.phone}`}
            className="btn-secondary !px-4 !py-2 text-sm"
          >
            Call {row.phone}
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-[var(--radius-card)] border border-ink/8 bg-white p-5">
            <h2 className="text-base font-bold text-ink">Request details</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                ["Name", row.fullName],
                ["Phone", row.phone],
                ["Alternative phone", row.altPhone ?? "—"],
                ["Email", row.email ?? "—"],
                ["Area", row.area],
                ["County", row.county ?? "—"],
                ["Landmark", row.landmark ?? "—"],
                ["Referred by", row.referrerPhone ?? "—"],
                ["Plan", `${row.planNameSnapshot} (${row.speedMbpsSnapshot} Mbps)`],
                ["Monthly price", `${formatKsh(row.priceSnapshot)}/month`],
                ["Installation fee", formatKsh(row.installationFeeAmount ?? 0)],
                ["Fee accepted", row.installationFeeAccepted ? "Yes" : "No"],
                ["Terms accepted", row.termsAccepted ? "Yes" : "No"],
                ["Preferred contact", row.preferredContactTime ?? "Any time"],
                ["Preferred install date", row.preferredInstallDate ?? "—"],
                ["Referral", row.referralCode ?? "—"],
                ["WhatsApp sent", row.whatsappSent ? formatDateTime(row.whatsappSentAt) : "Not sent"],
                ["Notes", row.notes ?? "—"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-wider text-ink-soft">{label}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-[var(--radius-card)] border border-ink/8 bg-white p-5">
            <h2 className="text-base font-bold text-ink">Message this customer</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Pick a template, tweak it if you like, then open it in WhatsApp. Every message is logged.
            </p>
            <div className="mt-4">
              <RequestComposer
                toPhone={row.phone}
                requestId={row.id}
                name={row.fullName.split(" ")[0]}
                plan={row.planNameSnapshot}
                price={row.priceSnapshot}
                reference={row.reference}
                speed={row.speedMbpsSnapshot}
              />
            </div>
          </section>

          {sentMessages.length ? (
            <section className="rounded-[var(--radius-card)] border border-ink/8 bg-white p-5">
              <h2 className="text-base font-bold text-ink">Message history</h2>
              <ul className="mt-4 space-y-3">
                {sentMessages.map((message) => (
                  <li key={message.id} className="rounded-xl bg-mist/60 p-3">
                    <p className="whitespace-pre-wrap text-sm text-ink">{message.body}</p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {message.direction} · {message.channel} · {formatDateTime(message.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <div className="space-y-6">
          <section className="rounded-[var(--radius-card)] border border-ink/8 bg-white p-5">
            <h2 className="text-base font-bold text-ink">Move it forward</h2>
            <form action={updateRequestStatus} className="mt-4 space-y-3">
              <input type="hidden" name="id" value={row.id} />
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Status</span>
                <select
                  name="status"
                  defaultValue={row.status}
                  className="mt-1 w-full rounded-lg border border-ink/12 bg-white px-3 py-2 text-sm outline-none focus:border-brand-600"
                >
                  {REQUEST_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {value.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="btn-primary w-full !py-2 text-sm">
                Update status
              </button>
              <p className="text-xs text-ink-soft">
                Setting the status to <strong>activated</strong> also creates a customer record.
              </p>
            </form>
          </section>

          <section className="rounded-[var(--radius-card)] border border-ink/8 bg-white p-5">
            <h2 className="text-base font-bold text-ink">Installation fee</h2>
            <form action={updateRequestPayment} className="mt-4 space-y-3">
              <input type="hidden" name="id" value={row.id} />
              <select
                name="paymentStatus"
                defaultValue={row.paymentStatus}
                className="w-full rounded-lg border border-ink/12 bg-white px-3 py-2 text-sm outline-none focus:border-brand-600"
              >
                {["pending", "accepted", "paid", "refunded"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-secondary w-full !py-2 text-sm">
                Save payment status
              </button>
            </form>
          </section>

          <section className="rounded-[var(--radius-card)] border border-ink/8 bg-white p-5">
            <h2 className="text-base font-bold text-ink">Internal notes</h2>
            <form action={updateRequestNotes} className="mt-4 space-y-3">
              <input type="hidden" name="id" value={row.id} />
              <textarea
                name="adminNotes"
                rows={4}
                defaultValue={row.adminNotes ?? ""}
                placeholder="e.g. Called on Tuesday, survey booked for Friday"
                className="w-full rounded-xl border border-ink/12 px-4 py-3 text-sm outline-none focus:border-brand-600"
              />
              <button type="submit" className="btn-secondary w-full !py-2 text-sm">
                Save notes
              </button>
            </form>
          </section>

          {relatedComplaints.length ? (
            <section className="rounded-[var(--radius-card)] border border-ink/8 bg-white p-5">
              <h2 className="text-base font-bold text-ink">Complaints from this number</h2>
              <ul className="mt-3 space-y-2">
                {relatedComplaints.map((complaint) => (
                  <li key={complaint.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate text-ink">{complaint.subject}</span>
                    <StatusPill status={complaint.status} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
