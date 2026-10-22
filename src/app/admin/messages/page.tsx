import { desc } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const rows = await db.select().from(messages).orderBy(desc(messages.createdAt)).limit(300);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-2xl text-ink md:text-3xl">Messages</h1>
        <p className="mt-1 text-sm text-ink-soft">Every message sent from the dashboard, in one thread.</p>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-ink/8 bg-white">
        {rows.length ? (
          <ul className="divide-y divide-ink/6">
            {rows.map((row) => (
              <li key={row.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">
                    {row.direction === "outbound" ? "To" : "From"} {row.toPhone}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {row.channel} · {formatDateTime(row.createdAt)}
                  </p>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{row.body}</p>
                {row.templateKey ? (
                  <p className="mt-1 text-[0.65rem] uppercase tracking-wider text-ink-soft">Template: {row.templateKey}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-ink-soft">No messages logged yet.</p>
        )}
      </div>
    </div>
  );
}
