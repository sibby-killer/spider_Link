import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { customers, plans } from "@/db/schema";
import { formatKsh } from "@/lib/pricing";
import { formatDate } from "@/lib/utils";
import StatusPill from "@/components/admin/StatusPill";
import SendWhatsappButton from "@/components/admin/SendWhatsappButton";
import { updateCustomer } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const rows = await db.select().from(customers).orderBy(desc(customers.createdAt));
  const planRows = await db.select().from(plans);
  const planName = (id: string | null) => planRows.find((plan) => plan.id === id)?.name ?? "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-2xl text-ink md:text-3xl">Customers</h1>
        <p className="mt-1 text-sm text-ink-soft">{rows.length} customer(s) on the books.</p>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-ink/8 bg-white">
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-mist/60 text-xs uppercase tracking-wider text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-semibold">Account</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Area</th>
                  <th className="px-4 py-3 font-semibold">Plan</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Installed</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {rows.map((row) => (
                  <tr key={row.id} className="align-top hover:bg-mist/40">
                    <td className="px-4 py-3 font-semibold text-brand-600">{row.accountNumber ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="block font-medium text-ink">{row.fullName}</span>
                      <a href={`tel:${row.phone}`} className="text-xs text-ink-soft hover:text-brand-600">
                        {row.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{row.area ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-soft">{planName(row.planId)}</td>
                    <td className="px-4 py-3 text-ink-soft">
                      {row.monthlyPrice ? `${formatKsh(row.monthlyPrice)}/mo` : "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{formatDate(row.installDate)}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={row.status} />
                      <form action={updateCustomer} className="mt-2 flex items-center gap-1">
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="notes" value={row.notes ?? ""} />
                        <select
                          name="status"
                          defaultValue={row.status}
                          className="rounded-lg border border-ink/12 bg-white px-2 py-1 text-xs outline-none focus:border-brand-600"
                        >
                          {["active", "suspended", "churned", "pending"].map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="rounded-lg border border-ink/12 px-2 py-1 text-xs font-semibold text-ink-soft hover:border-brand-300 hover:text-brand-600">
                          Save
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <SendWhatsappButton
                        toPhone={row.phone}
                        customerId={row.id}
                        body={`Hi ${row.fullName.split(" ")[0]}, this is Spider Link Solution about your ${planName(row.planId)} connection. How can we help?`}
                        label="Message"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-ink-soft">
            No customers yet. Set a request to <strong>activated</strong> and it will appear here.
          </p>
        )}
      </div>
    </div>
  );
}
