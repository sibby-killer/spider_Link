export type PricingRule = {
  baseSpeedMbps: number;
  basePrice: number;
  pricePerMbps: number;
  minCustomMbps: number;
  maxCustomMbps: number;
  rounding: number;
};

export const DEFAULT_PRICING_RULE: PricingRule = {
  baseSpeedMbps: 5,
  basePrice: 1000,
  pricePerMbps: 100,
  minCustomMbps: 5,
  maxCustomMbps: 100,
  rounding: 50,
};

/**
 * price = basePrice + max(0, mbps - baseSpeedMbps) * pricePerMbps, then rounded.
 * A named plan with a priceOverride always wins over this rule.
 */
export function computeCustomPrice(mbps: number, rule: PricingRule = DEFAULT_PRICING_RULE): number {
  const speed = Math.min(rule.maxCustomMbps, Math.max(rule.minCustomMbps, Math.round(mbps)));
  const raw = rule.basePrice + Math.max(0, speed - rule.baseSpeedMbps) * rule.pricePerMbps;
  if (!rule.rounding) return Math.round(raw);
  return Math.round(raw / rule.rounding) * rule.rounding;
}

export function clampCustomSpeed(mbps: number, rule: PricingRule = DEFAULT_PRICING_RULE): number {
  return Math.min(rule.maxCustomMbps, Math.max(rule.minCustomMbps, Math.round(mbps)));
}

export function formatKsh(amount: number): string {
  return `Ksh ${amount.toLocaleString("en-KE")}`;
}
