import { and, desc, eq, isNotNull, ne } from "drizzle-orm";
import { db } from "@/db";
import { referralAwards, requests } from "@/db/schema";

export type ReferralRow = {
  referrerPhone: string;
  referrerName: string | null;
  total: number;
  successful: number;
  pending: number;
  rewardDays: number;
  target: number;
  eligible: boolean;
  awarded: boolean;
  awardedAt: string | null;
};

export async function getReferralStats(target = 10, rewardDays = 60): Promise<ReferralRow[]> {
  const rows = await db
    .select({
      referrerPhone: requests.referrerPhone,
      referrerName: requests.fullName,
      status: requests.status,
      createdAt: requests.createdAt,
    })
    .from(requests)
    .where(and(isNotNull(requests.referrerPhone), ne(requests.referrerPhone, "")))
    .orderBy(desc(requests.createdAt));

  const awards = await db.select().from(referralAwards);
  const awardByPhone = new Map(awards.map((award) => [award.referrerPhone, award]));

  const map = new Map<string, ReferralRow>();

  for (const row of rows) {
    const phone = row.referrerPhone!;
    if (!map.has(phone)) {
      map.set(phone, {
        referrerPhone: phone,
        referrerName: null,
        total: 0,
        successful: 0,
        pending: 0,
        rewardDays,
        target,
        eligible: false,
        awarded: false,
        awardedAt: null,
      });
    }
    const entry = map.get(phone)!;
    entry.total += 1;
    if (row.status === "activated") entry.successful += 1;
    else entry.pending += 1;
    if (!entry.referrerName) entry.referrerName = row.referrerName;
  }

  for (const entry of map.values()) {
    const award = awardByPhone.get(entry.referrerPhone);
    entry.eligible = entry.successful >= entry.target;
    entry.awarded = award?.status === "granted";
    entry.awardedAt = award?.grantedAt ?? null;
  }

  return [...map.values()].sort((a, b) => b.successful - a.successful || b.total - a.total);
}
