"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail } from "lucide-react";
import { LogoMark } from "@/components/Logo";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload?.error?.message ?? "Invalid email or password.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("We could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error ? (
        <p role="alert" className="rounded-xl border border-brand-300 bg-brand-50 p-3 text-sm text-brand-800">
          {error}
        </p>
      ) : null}

      <label className="block">
        <span className="text-sm font-semibold text-ink">Email</span>
        <span className="mt-1.5 flex items-center gap-2 rounded-xl border border-ink/12 bg-white px-4 py-3 focus-within:border-brand-600">
          <Mail size={16} className="text-ink-soft" />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            className="w-full bg-transparent text-sm outline-none"
            placeholder="you@spiderlink.co.ke"
          />
        </span>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-ink">Password</span>
        <span className="mt-1.5 flex items-center gap-2 rounded-xl border border-ink/12 bg-white px-4 py-3 focus-within:border-brand-600">
          <Lock size={16} className="text-ink-soft" />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            className="w-full bg-transparent text-sm outline-none"
          />
        </span>
      </label>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <Loader2 size={18} className="animate-spin" /> : null}
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
