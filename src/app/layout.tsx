import type { Metadata } from "next";
import "./globals.css";
import { getSiteConfig } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${config.brandName} — ${config.brandTagline}`,
      template: `%s | ${config.brandName}`,
    },
    description: `${config.brandTaglineAlt}. Unlimited home fibre from ${formatPlain(config.brandName)}. Plans from Ksh 1,000/month, Ksh 2,500 installation, first month free.`,
    keywords: ["fibre internet", "home internet", "unlimited broadband", "WiFi Kenya", "fibre installation", "Spider Link Solution"],
    openGraph: {
      type: "website",
      locale: "en_KE",
      siteName: config.brandName,
      title: `${config.brandName} — ${config.brandTagline}`,
      description: config.brandTaglineAlt,
      url: siteUrl,
      images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: config.brandName }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${config.brandName} — ${config.brandTagline}`,
      description: config.brandTaglineAlt,
      images: ["/brand/og.png"],
    },
    robots: { index: true, follow: true },
  };
}

function formatPlain(value: string) {
  return value.replace(/&/g, "and");
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-600 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
