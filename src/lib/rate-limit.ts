type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * In-memory limiter. Serverless instances are ephemeral, so this is a
 * best-effort guard — pair it with the honeypot and (optionally) Turnstile.
 */
export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; retryIn: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) buckets.clear();
    return { allowed: true, retryIn: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { allowed: false, retryIn: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { allowed: true, retryIn: 0 };
}

export function clientKey(request: Request, scope: string): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  const agent = request.headers.get("user-agent") ?? "unknown";
  return `${scope}:${ip}:${agent.slice(0, 40)}`;
}
