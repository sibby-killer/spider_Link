import { db } from "@/db";
import { plans } from "@/db/schema";
import { computeCustomPrice, formatKsh } from "@/lib/pricing";
import { getPricingRule, getSiteConfig } from "@/lib/site-config";
import { AdminField, AdminSection } from "./AdminField";
import { archivePlan, savePlan, saveSiteSettings } from "@/app/admin/actions";

export async function SitePlansSection() {
  const config = await getSiteConfig();
  const rule = getPricingRule(config);
  const rows = await db.select().from(plans);

  return (
    <div className="space-y-6">
      <AdminSection
        title="Pricing rule & fees"
        description="These numbers drive the Custom speed calculator on the website. Change them and the site updates instantly."
      >
        <form action={saveSiteSettings} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <AdminField label="Base speed (Mbps)" name="pricingBaseSpeedMbps" type="number" defaultValue={rule.baseSpeedMbps} hint="Price starts here" />
            <AdminField label="Base price (Ksh)" name="pricingBasePrice" type="number" defaultValue={rule.basePrice} hint="Price at base speed" />
            <AdminField label="Ksh per extra Mbps" name="pricingPerMbps" type="number" defaultValue={rule.pricePerMbps} hint="Added per Mbps" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <AdminField label="Minimum custom speed" name="pricingMinCustomMbps" type="number" defaultValue={rule.minCustomMbps} />
            <AdminField label="Maximum custom speed" name="pricingMaxCustomMbps" type="number" defaultValue={rule.maxCustomMbps} />
            <AdminField label="Round to nearest" name="pricingRounding" type="number" defaultValue={rule.rounding} hint="0 = no rounding" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <AdminField label="Installation fee (Ksh)" name="installFee" type="number" defaultValue={config.installFee} />
            <AdminField label="First month free" name="firstMonthFree" type="checkbox" defaultValue={config.firstMonthFree} />
            <AdminField label="Free month label" name="firstMonthFreeLabel" defaultValue={config.firstMonthFreeLabel} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="What the fee includes" name="installFeeIncludes" defaultValue={config.installFeeIncludes} />
            <AdminField label="When to pay" name="installFeeTiming" defaultValue={config.installFeeTiming} />
          </div>

          <p className="rounded-xl bg-mist/70 p-3 text-xs text-ink-soft">
            Live preview — 8 Mbps: {formatKsh(computeCustomPrice(8, rule))} · 25 Mbps:{" "}
            {formatKsh(computeCustomPrice(25, rule))} · 30 Mbps: {formatKsh(computeCustomPrice(30, rule))}
          </p>

          <button type="submit" className="btn-primary !py-2 text-sm">
            Save pricing
          </button>
        </form>
      </AdminSection>

      <AdminSection title="Plans" description="Add, edit, reorder or hide plans. Hiding a plan keeps it on old requests.">
        <div className="space-y-5">
          {rows.map((plan) => (
            <form key={plan.id} action={savePlan} className="rounded-2xl border border-ink/8 p-4">
              <input type="hidden" name="id" value={plan.id} />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <AdminField label="Name" name="name" defaultValue={plan.name} />
                <AdminField label="Slug" name="slug" defaultValue={plan.slug} hint="URL name" />
                <AdminField label="Speed (Mbps)" name="speedMbps" type="number" defaultValue={plan.speedMbps} />
                <AdminField
                  label="Price (Ksh)"
                  name="monthlyPrice"
                  type="number"
                  defaultValue={plan.priceOverride ?? plan.monthlyPrice}
                  hint="Used when no override"
                />
                <AdminField
                  label="Price override (Ksh)"
                  name="priceOverride"
                  type="number"
                  defaultValue={plan.priceOverride ?? ""}
                  hint="Leave empty to use the rule"
                />
                <AdminField label="Badge" name="badge" defaultValue={plan.badge ?? ""} hint="e.g. Popular" />
                <AdminField label="Sort order" name="sortOrder" type="number" defaultValue={plan.sortOrder} />
                <AdminField label="Icon" name="icon" defaultValue={plan.icon} hint="plug/wifi/couch/router/gear" />
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <AdminField label="Short tagline" name="tagline" defaultValue={plan.tagline ?? ""} />
                <AdminField label="Description" name="description" defaultValue={plan.description ?? ""} type="textarea" rows={2} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-ink-soft">
                  <input type="checkbox" name="isActive" defaultChecked={plan.isActive === 1} className="h-4 w-4 accent-brand-600" />
                  Visible on the site
                </label>
                <label className="flex items-center gap-2 text-sm text-ink-soft">
                  <input type="checkbox" name="isCustom" defaultChecked={plan.isCustom === 1} className="h-4 w-4 accent-brand-600" />
                  Custom speed plan
                </label>
                <button type="submit" className="btn-primary !px-4 !py-2 text-sm">
                  Save plan
                </button>
              </div>
            </form>
          ))}

          <details className="rounded-2xl border border-ink/8 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-ink">+ Add a new plan</summary>
            <form action={savePlan} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AdminField label="Name" name="name" required />
              <AdminField label="Slug" name="slug" required hint="e.g. gamer" />
              <AdminField label="Speed (Mbps)" name="speedMbps" type="number" defaultValue={10} />
              <AdminField label="Price (Ksh)" name="monthlyPrice" type="number" defaultValue={1500} />
              <AdminField label="Badge" name="badge" />
              <AdminField label="Sort order" name="sortOrder" type="number" defaultValue={9} />
              <AdminField label="Short tagline" name="tagline" />
              <AdminField label="Description" name="description" type="textarea" rows={2} />
              <input type="hidden" name="isActive" value="true" />
              <button type="submit" className="btn-primary !px-4 !py-2 text-sm">
                Add plan
              </button>
            </form>
          </details>

          <details className="rounded-2xl border border-ink/8 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-ink">Hide a plan</summary>
            <div className="mt-3 flex flex-wrap gap-2">
              {rows.map((plan) => (
                <form key={plan.id} action={archivePlan}>
                  <input type="hidden" name="id" value={plan.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-ink/12 px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-brand-300 hover:text-brand-600"
                  >
                    Hide {plan.name}
                  </button>
                </form>
              ))}
            </div>
          </details>
        </div>
      </AdminSection>
    </div>
  );
}
