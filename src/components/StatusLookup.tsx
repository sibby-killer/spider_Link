"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";

type StatusResult = {
  reference: string;
  fullName: string;
  planName: string;
  speedMbps: number;
  price: number;
  status: string;
  statusMessage: string;
  createdAt: string;
};

export default function StatusLookup({ initialReference = "" }: { initialReference?: string }) {
  const [reference, setReference] = useState(initialReference);
  const [phoneLast4, setPhoneLast4] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function lookup(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch(
        `/api/status/${encodeURIComponent(reference.trim())}?phoneLast4=${encodeURIComponent(phoneLast4.trim())}`,
      );
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload?.error?.message ?? "We could not find that request.");
        return;
      }
      setResult(payload.data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-ink/8 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(11,11,11,0.6)] md:p-9">
      <form onSubmit={lookup} className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr_auto] sm:items-end">
        <label className="block">
          <span className="text-sm font-semibold text-ink">Reference</span>
          <input
            type="text"
            value={reference}
            onChange={(event) => setReference(event.target.value.toUpperCase())}
            placeholder="SLR-4F7Q"
            className="mt-1.5 w-full rounded-xl border border-ink/12 bg-white px-4 py-3 text-sm uppercase outline-none focus:border-brand-600"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-ink">Last 4 of your phone</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={phoneLast4}
            onChange={(event) => setPhoneLast4(event.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="5678"
            className="mt-1.5 w-full rounded-xl border border-ink/12 bg-white px-4 py-3 text-sm outline-none focus:border-brand-600"
          />
        </label>
        <button type="submit" disabled={loading} className="btn-primary h-12">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          Check
        </button>
      </form>

      {error ? (
        <p role="alert" className="mt-5 rounded-xl border border-brand-300 bg-brand-50 p-4 text-sm text-brand-800">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-6 rounded-2xl bg-mist/70 p-5">
          <p className="text-xs uppercase tracking-wider text-ink-soft">{result.reference}</p>
          <h2 className="display mt-1 text-2xl text-ink">{result.statusMessage}</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-soft">Name</dt>
              <dd className="text-sm font-semibold text-ink">{result.fullName}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-soft">Plan</dt>
              <dd className="text-sm font-semibold text-ink">
                {result.planName} · {result.speedMbps} Mbps
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-soft">Status</dt>
              <dd className="text-sm font-semibold capitalize text-brand-600">{result.status.replace("_", " ")}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </div>
  );
}
