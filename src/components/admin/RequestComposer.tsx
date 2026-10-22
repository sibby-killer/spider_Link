"use client";

import { useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { MESSAGE_TEMPLATES, renderTemplate } from "@/lib/whatsapp";
import SendWhatsappButton from "./SendWhatsappButton";

export default function RequestComposer({
  toPhone,
  requestId,
  name,
  plan,
  price,
  reference,
  speed,
}: {
  toPhone: string;
  requestId: string;
  name: string;
  plan: string;
  price: number;
  reference: string;
  speed: number;
}) {
  const [templateKey, setTemplateKey] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const vars = {
    name,
    plan,
    price: `Ksh ${price.toLocaleString("en-KE")}`,
    reference,
    speed: `${speed} Mbps`,
    amount: "Ksh 2,500",
    date: "the agreed date",
    paybill: "000000",
    message: "",
  };

  function applyTemplate(key: string) {
    setTemplateKey(key);
    const template = MESSAGE_TEMPLATES.find((item) => item.key === key);
    if (template) setBody(renderTemplate(template.body, vars));
  }

  async function send() {
    if (!body.trim()) return;
    setSending(true);
    try {
      const response = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toPhone, body, requestId, templateKey: templateKey || null }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) return;
      window.open(payload.data.whatsappUrl, "_blank", "noopener,noreferrer");
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {MESSAGE_TEMPLATES.map((template) => (
          <button
            key={template.key}
            type="button"
            onClick={() => applyTemplate(template.key)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              templateKey === template.key
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-ink/12 text-ink-soft hover:border-brand-300"
            }`}
          >
            {template.name}
          </button>
        ))}
      </div>

      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={5}
        placeholder="Write a message, or pick a template above..."
        className="w-full rounded-xl border border-ink/12 bg-white px-4 py-3 text-sm outline-none focus:border-brand-600"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={send}
          disabled={!body.trim() || sending}
          className="btn-primary !px-4 !py-2 text-sm"
        >
          {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          Open in WhatsApp
        </button>
        <SendWhatsappButton
          toPhone={toPhone}
          body={body}
          requestId={requestId}
          templateKey={templateKey || null}
          label="Log without opening"
        />
        {sent ? <span className="text-xs font-semibold text-emerald-700">Message logged</span> : null}
        <a
          href={`https://wa.me/${toPhone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink/12 px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-brand-300"
        >
          <MessageCircle size={13} />
          Chat directly
        </a>
      </div>
    </div>
  );
}
