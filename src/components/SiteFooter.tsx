import Link from "next/link";
import { LogoLockup } from "./Logo";

export default function SiteFooter({
  config,
}: {
  config: {
    brandName: string;
    brandTagline: string;
    footerText: string;
    copyrightText: string;
    phonePrimaryDisplay: string;
    phoneSecondaryDisplay: string;
    email: string;
    location: string;
  };
}) {
  return (
    <footer className="border-t border-white/10 bg-[#070707] py-14 text-white">
      <div className="container-x grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <LogoLockup tone="light" />
          <p className="mt-4 max-w-sm text-sm text-white/60">{config.footerText}</p>
          <p className="mt-2 text-sm font-semibold text-brand-400">{config.brandTagline}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-xs font-bold uppercase tracking-[0.24em] text-white/50">Explore</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { href: "/request", label: "Request installation" },
              { href: "/complaint", label: "Report a problem" },
              { href: "/status", label: "Track my request" },
              { href: "/admin/login", label: "Admin sign in" },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-white/70 transition-colors hover:text-brand-400">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.24em] text-white/50">Contact</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>
              <a href={`tel:${config.phonePrimaryDisplay.replace(/\s/g, "")}`} className="hover:text-brand-400">
                {config.phonePrimaryDisplay}
              </a>
            </li>
            <li>
              <a href={`tel:${config.phoneSecondaryDisplay.replace(/\s/g, "")}`} className="hover:text-brand-400">
                {config.phoneSecondaryDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${config.email}`} className="hover:text-brand-400">
                {config.email}
              </a>
            </li>
            <li>{config.location}</li>
          </ul>
        </div>
      </div>

      <div className="container-x mt-10 border-t border-white/10 pt-6 text-xs text-white/45">
        <p>
          © {new Date().getFullYear()} {config.copyrightText}
        </p>
      </div>
    </footer>
  );
}
