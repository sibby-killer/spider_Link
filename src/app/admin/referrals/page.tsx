import { Gift } from "lucide-react";
import { getReferralStats } from "@/lib/referrals";
import { getSiteConfig } from "@/lib/site-config";
import { formatDateTime } from "@/lib/utils";
import { grantReferralReward } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Referrals",
  robots: { index: false, follow: false },
};

export default async function AdminReferralsPage() {
  const config = await getSiteConfig();
  const target = config.referralTargetCount;
  const days = config.referralRewardDays;
  const rows = await getReferralStats(target, days);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-2xl text-ink md:text-3xl">Referrals</h1>
        <p className="mt-1 text-sm text-ink-soft">
          A referral counts once the referred customer is <strong>activated</strong> (installed and paying). At{" "}
          {target} successful referrals the referrer earns <strong>{days} extra days free</strong> on their plan.
        </p>
      </div>

      <div className="rounded-[var(--radius-card)] border border-ink/8 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Gift size={20} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Referral programme</p>
            <p className="text-xs text-ink-soft">{config.referralNote}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-ink/8 bg-white">
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-mist/60 text-xs uppercase tracking-wider text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-semibold">Referrer</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Referred</th>
                  <th className="px-4 py-3 font-semibold">Installed</th>
                  <th className="px-4 py-3 font-semibold">Progress</th>
                  <th className="px-4 py-3 font-semibold">Reward</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {rows.map((row) => {
                  const percent = Math.min(100, Math.round((row.successful / row.target) * 100));
                  return (
                    <tr key={row.referrerPhone} className="align-top hover:bg-mist/40">
                      <td className="px-4 py-3 font-medium text-ink">{row.referrerName ?? "—"}</td>
                      <td className="px-4 py-3">
                        <a href={`tel:${row.referrerPhone}`} className="text-brand-600 hover:underline">
                          {row.referrerPhone}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{row.total}</td>
                      <td className="px-4 py-3 font-semibold text-ink">{row.successful}</td>
                      <td className="px-4 py-3">
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-mist">
                          <div
                            className={`h-full rounded-full ${row.eligible ? "bg-emerald-500" : "bg-brand-500"}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="mt-1 block text-xs text-ink-soft">
                          {row.successful}/{row.target} installed
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {row.awarded ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[0.7rem] font-semibold text-emerald-700">
                            +{row.rewardDays} days granted
                          </span>
                        ) : row.eligible ? (
                          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[0.7rem] font-semibold text-brand-700">
                            Ready to award
                          </span>
                        ) : (
                          <span className="text-xs text-ink-soft">Not yet</span>
                        )}
                        {row.awardedAt ? (
                          <span className="mt-1 block text-[0.65rem] text-ink-soft">
                            {formatDateTime(row.awardedAt)}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.eligible && !row.awarded ? (
                          <form action={grantReferralReward} className="inline-flex items-center gap-2">
                            <input type="hidden" name="referrerPhone" value={row.referrerPhone} />
                            <input type="hidden" name="referrerName" value={row.referrerName ?? ""} />
                            <input type="hidden" name="successful" value={row.successful} />
                            <input type="hidden" name="days" value={row.rewardDays} />
                            <button
                              type="submit"
                              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                            >
                              Grant {row.rewardDays} days
                            </button>
                          </form>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-ink-soft">
            No referrals yet. Share the website and ask happy customers to send their friends.
          </p>
        )}
      </div>
    </div>
  );
}
