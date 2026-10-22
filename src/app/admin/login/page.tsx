import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { LogoMark } from "@/components/Logo";
import { getSessionAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const admin = await getSessionAdmin();
  if (admin) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(120%_120%_at_50%_0%,#ff2b2b_0%,#e60000_30%,#8f0000_65%,#3a0000_100%)] px-4 py-10">
      <div className="w-full max-w-md rounded-[var(--radius-card)] bg-white p-7 shadow-[var(--shadow-lift)] md:p-9">
        <div className="flex items-center gap-3">
          <LogoMark className="h-11 w-11" />
          <div>
            <p className="display text-xl text-ink">Spider Link</p>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.42em] text-brand-600">Admin</p>
          </div>
        </div>

        <h1 className="display mt-7 text-2xl">Sign in to your dashboard</h1>
        <p className="mt-1 text-sm text-ink-soft">Manage requests, customers and complaints.</p>

        <div className="mt-7">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-ink-soft">
          <Link href="/" className="hover:text-brand-600">
            ← Back to the website
          </Link>
        </p>
      </div>
    </div>
  );
}
