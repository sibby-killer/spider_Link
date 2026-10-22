"use client";

import { useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";

export default function SendWhatsappButton({
  toPhone,
  body,
  customerId,
  requestId,
  complaintId,
  templateKey,
  label = "Send WhatsApp",
  className = "",
}: {
  toPhone: string;
  body: string;
  customerId?: string | null;
  requestId?: string | null;
  complaintId?: string | null;
  templateKey?: string | null;
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toPhone, body, customerId, requestId, complaintId, templateKey }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload?.error?.message ?? "Could not prepare the message");
        return;
      }
      window.open(payload.data.whatsappUrl, "_blank", "noopener,noreferrer");
    } catch {
      setError("Could not prepare the message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={send}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-60 ${className}`}
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <MessageCircle size={13} />}
        {label}
      </button>
      {error ? <span className="mt-1 text-[0.65rem] text-brand-700">{error}</span> : null}
    </span>
  );
}
