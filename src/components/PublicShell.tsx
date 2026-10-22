import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import WhatsAppFab from "./WhatsAppFab";
import { getSiteConfig } from "@/lib/site-config";

export default async function PublicShell({
  children,
  ctaLabel,
}: {
  children: React.ReactNode;
  ctaLabel?: string;
}) {
  const config = await getSiteConfig();

  return (
    <>
      <SiteHeader ctaLabel={ctaLabel ?? config.heroPrimaryCta} />
      <main id="main" className="pt-24 md:pt-28">
        {children}
      </main>
      <SiteFooter config={config} />
      <WhatsAppFab
        number={config.whatsappNumber}
        message={`Hi ${config.brandName}, I would like to know more about your fibre plans.`}
      />
    </>
  );
}
