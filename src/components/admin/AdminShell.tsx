"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  FileText,
  Gift,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings2,
  ShieldCheck,
  Users,
  Wrench,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoLockup } from "@/components/Logo";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/requests", label: "Requests", icon: FileText },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/complaints", label: "Complaints", icon: Wrench },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/referrals", label: "Referrals", icon: Gift },
  { href: "/admin/site", label: "Site content", icon: Settings2 },
];

export default function AdminShell({
  adminName,
  role,
  children,
}: {
  adminName: string;
  role: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  const nav = role === "owner" ? [...NAV, { href: "/admin/users", label: "Admins", icon: ShieldCheck }] : NAV;

  return (
    <div className="min-h-screen bg-mist">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-ink/8 bg-white lg:flex">
        <div className="border-b border-ink/8 px-5 py-5">
          <Link href="/admin" aria-label="Admin home">
            <LogoLockup />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-brand-600 text-white" : "text-ink-soft hover:bg-mist hover:text-ink",
                )}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-ink/8 p-4">
          <p className="text-sm font-semibold text-ink">{adminName}</p>
          <p className="text-xs capitalize text-ink-soft">{role}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 flex w-full items-center gap-2 rounded-xl border border-ink/10 px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-brand-300 hover:text-brand-600"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-ink/8 bg-white/95 px-4 backdrop-blur lg:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <BarChart3 size={20} className="text-brand-600" />
            <span className="display text-base">Admin</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {open ? (
          <div className="fixed inset-x-0 top-16 z-30 border-b border-ink/8 bg-white p-3 lg:hidden">
            <nav className="grid gap-1">
              {nav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-mist"
                  >
                    <Icon size={17} />
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={logout}
                className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-600"
              >
                <LogOut size={17} />
                Sign out
              </button>
            </nav>
          </div>
        ) : null}

        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
