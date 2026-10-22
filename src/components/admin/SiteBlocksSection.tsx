import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { contentBlocks } from "@/db/schema";
import { AdminField, AdminSection } from "./AdminField";
import { deleteContentBlock, saveContentBlock } from "@/app/admin/actions";

const KINDS = [
  { kind: "feature", label: "Features", hint: "Why choose Spider Link" },
  { kind: "step", label: "How it works steps", hint: "Numbered steps" },
  { kind: "faq", label: "FAQ", hint: "Questions and answers" },
  { kind: "coverage_area", label: "Coverage areas", hint: "Where you serve" },
  { kind: "testimonial", label: "Testimonials", hint: "Customer quotes" },
];

export async function SiteBlocksSection() {
  const all = await db.select().from(contentBlocks).orderBy(asc(contentBlocks.kind), asc(contentBlocks.position));

  return (
    <div className="space-y-6">
      {KINDS.map(({ kind, label, hint }) => {
        const rows = all.filter((row) => row.kind === kind);
        return (
          <AdminSection key={kind} title={label} description={`${hint} — ${rows.length} item(s)`}>
            <div className="space-y-4">
              {rows.map((row) => (
                <div key={row.id} className="rounded-2xl border border-ink/8 p-4">
                  <form action={saveContentBlock} className="space-y-3">
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="kind" value={row.kind} />
                    <div className="grid gap-3 sm:grid-cols-[1fr_90px_auto]">
                      <AdminField label="Title" name="title" defaultValue={row.title ?? ""} />
                      <AdminField label="Order" name="position" type="number" defaultValue={row.position} />
                      <label className="flex items-end pb-2 text-sm text-ink-soft">
                        <input type="checkbox" name="isVisible" defaultChecked={row.isVisible === 1} className="h-4 w-4 accent-brand-600" />
                        <span className="ml-2">Visible</span>
                      </label>
                    </div>
                    <AdminField label="Text" name="body" defaultValue={row.body ?? ""} type="textarea" rows={2} />
                    <AdminField
                      label="Extra details (JSON)"
                      name="metaJson"
                      defaultValue={row.metaJson ?? ""}
                      hint={'e.g. { "rating": 5, "area": "Nyalenda" }'}
                      type="textarea"
                      rows={2}
                    />
                    <div className="flex items-center gap-2">
                      <button type="submit" className="btn-primary !px-4 !py-2 text-sm">
                        Save
                      </button>
                    </div>
                  </form>
                  <form action={deleteContentBlock} className="mt-2">
                    <input type="hidden" name="id" value={row.id} />
                    <button type="submit" className="text-xs font-semibold text-ink-soft hover:text-brand-700">
                      Remove this item
                    </button>
                  </form>
                </div>
              ))}

              <details className="rounded-2xl border border-ink/8 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-ink">+ Add {label.toLowerCase()}</summary>
                <form action={saveContentBlock} className="mt-4 space-y-3">
                  <input type="hidden" name="kind" value={kind} />
                  <div className="grid gap-3 sm:grid-cols-[1fr_90px]">
                    <AdminField label="Title" name="title" />
                    <AdminField label="Order" name="position" type="number" defaultValue={rows.length + 1} />
                  </div>
                  <AdminField label="Text" name="body" type="textarea" rows={2} />
                  <label className="flex items-center gap-2 text-sm text-ink-soft">
                    <input type="checkbox" name="isVisible" defaultChecked className="h-4 w-4 accent-brand-600" />
                    Visible
                  </label>
                  <button type="submit" className="btn-primary !px-4 !py-2 text-sm">
                    Add
                  </button>
                </form>
              </details>
            </div>
          </AdminSection>
        );
      })}
    </div>
  );
}
