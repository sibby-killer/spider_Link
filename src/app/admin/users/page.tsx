import { desc } from "drizzle-orm";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { formatDateTime } from "@/lib/utils";
import { AdminField, AdminSection } from "@/components/admin/AdminField";
import { createAdminUser, toggleAdminActive } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admins",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const rows = await db.select().from(admins).orderBy(desc(admins.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-2xl text-ink md:text-3xl">Admin accounts</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Owners can edit everything. Agents can handle requests, customers and complaints but cannot change the site
          content or manage accounts.
        </p>
      </div>

      <AdminSection title="Team">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-mist/60 text-xs uppercase tracking-wider text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Last sign-in</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium text-ink">{row.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{row.email}</td>
                  <td className="px-4 py-3 capitalize text-ink-soft">{row.role}</td>
                  <td className="px-4 py-3 text-xs text-ink-soft">{formatDateTime(row.lastLoginAt)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${
                        row.isActive ? "bg-emerald-50 text-emerald-700" : "bg-ink/8 text-ink-soft"
                      }`}
                    >
                      {row.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={toggleAdminActive}>
                      <input type="hidden" name="id" value={row.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-ink/12 px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-brand-300 hover:text-brand-600"
                      >
                        {row.isActive ? "Deactivate" : "Reactivate"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminSection>

      <AdminSection title="Add an admin">
        <form action={createAdminUser} className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Name" name="name" required />
          <AdminField label="Email" name="email" type="email" required />
          <AdminField label="Password" name="password" type="password" required hint="At least 8 characters" />
          <label className="block">
            <span className="text-sm font-semibold text-ink">Role</span>
            <select name="role" defaultValue="agent" className="mt-1 w-full rounded-lg border border-ink/12 bg-white px-3 py-2 text-sm outline-none focus:border-brand-600">
              <option value="agent">Agent — requests, customers, complaints</option>
              <option value="owner">Owner — full access</option>
            </select>
          </label>
          <button type="submit" className="btn-primary !py-2 text-sm sm:w-48">
            Create account
          </button>
        </form>
      </AdminSection>
    </div>
  );
}
