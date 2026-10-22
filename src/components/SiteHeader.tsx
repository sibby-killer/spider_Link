"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LogoLockup } from "./Logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#features", label: "Why us" },
  { href: "#plans", label: "Plans" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export default function SiteHeader({ ctaLabel }: { ctaLabel: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/95 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.5)] backdrop-blur" : "bg-transparent",
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4 md:h-20">
        <Link href="/" aria-label="Spider Link Solution home" className="shrink-0">
          <LogoLockup />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                scrolled ? "text-ink-soft hover:text-brand-600" : "text-white/85 hover:text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/status"
            className={`text-sm font-medium transition-colors ${
              scrolled ? "text-ink-soft hover:text-brand-600" : "text-white/85 hover:text-white"
            }`}
          >
            Track request
          </Link>
          <Link
            href="/request"
            className={`btn-primary !px-5 !py-2.5 text-sm ${
              scrolled ? "" : "!bg-white !text-brand-700 shadow-none hover:!bg-white/90"
            }`}
          >
            {ctaLabel}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-white/90 md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-ink/5 bg-white px-5 pb-6 pt-4 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-ink transition-colors hover:bg-mist"
              >
                {link.label}
              </a>
            ))}
            <Link href="/status" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium text-ink hover:bg-mist">
              Track request
            </Link>
            <Link href="/complaint" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium text-ink hover:bg-mist">
              Report a problem
            </Link>
            <Link href="/request" onClick={() => setOpen(false)} className="btn-primary mt-3 w-full">
              {ctaLabel}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
