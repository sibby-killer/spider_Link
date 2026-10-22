import { getSiteConfig } from "@/lib/site-config";
import { AdminField, AdminSection } from "./AdminField";
import { saveSiteSettings } from "@/app/admin/actions";

export async function SiteContentSection() {
  const config = await getSiteConfig();

  return (
    <div className="space-y-6">
      <AdminSection title="Hero & announcement" description="The first thing a visitor sees.">
        <form action={saveSiteSettings} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Eyebrow" name="heroEyebrow" defaultValue={config.heroEyebrow} />
            <AdminField label="Headline" name="heroTitle" defaultValue={config.heroTitle} />
            <AdminField label="Sub-headline" name="heroSubtitle" defaultValue={config.heroSubtitle} />
            <AdminField label="Brand tagline" name="brandTagline" defaultValue={config.brandTagline} />
            <AdminField label="Primary button" name="heroPrimaryCta" defaultValue={config.heroPrimaryCta} />
            <AdminField label="Secondary button" name="heroSecondaryCta" defaultValue={config.heroSecondaryCta} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Announcement bar text" name="announcementText" defaultValue={config.announcementText} />
            <AdminField label="Show announcement bar" name="announcementEnabled" type="checkbox" defaultValue={config.announcementEnabled} />
          </div>
          <AdminField label="Show the 3D hero" name="heroShow3d" type="checkbox" defaultValue={config.heroShow3d} />
          <button type="submit" className="btn-primary !py-2 text-sm">
            Save hero
          </button>
        </form>
      </AdminSection>

      <AdminSection title="Contact & channels" description="Where customers reach you.">
        <form action={saveSiteSettings} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="WhatsApp number (254…)" name="whatsappNumber" defaultValue={config.whatsappNumber} hint="Requests land here" />
            <AdminField label="Primary phone" name="phonePrimary" defaultValue={config.phonePrimary} />
            <AdminField label="Primary phone (display)" name="phonePrimaryDisplay" defaultValue={config.phonePrimaryDisplay} />
            <AdminField label="Secondary phone" name="phoneSecondary" defaultValue={config.phoneSecondary} />
            <AdminField label="Secondary phone (display)" name="phoneSecondaryDisplay" defaultValue={config.phoneSecondaryDisplay} />
            <AdminField label="Email" name="email" defaultValue={config.email} />
            <AdminField label="Location" name="location" defaultValue={config.location} />
            <AdminField label="Support hours" name="supportHours" defaultValue={config.supportHours} />
          </div>
          <AdminField label="Coverage note" name="coverageNote" defaultValue={config.coverageNote} type="textarea" rows={2} />
          <button type="submit" className="btn-primary !py-2 text-sm">
            Save contact details
          </button>
        </form>
      </AdminSection>

      <AdminSection title="Coverage & crew" description="Where you work and who installs.">
        <form action={saveSiteSettings} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Main location" name="mainLocation" defaultValue={config.mainLocation} />
            <AdminField label="Counties covered" name="coveredCounties" defaultValue={config.coveredCounties} />
          </div>
          <AdminField
            label="Technicians intro"
            name="techniciansIntro"
            defaultValue={config.techniciansIntro}
            type="textarea"
            rows={3}
          />
          <AdminField label="Technicians area note" name="techniciansAreaNote" defaultValue={config.techniciansAreaNote} />
          <button type="submit" className="btn-primary !py-2 text-sm">
            Save coverage & crew
          </button>
        </form>
      </AdminSection>

      <AdminSection title="Referral programme" description="Reward customers who bring you new installs.">
        <form action={saveSiteSettings} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <AdminField label="Referral programme on" name="referralEnabled" type="checkbox" defaultValue={config.referralEnabled} />
            <AdminField label="Referrals needed" name="referralTargetCount" type="number" defaultValue={config.referralTargetCount} />
            <AdminField label="Reward (days free)" name="referralRewardDays" type="number" defaultValue={config.referralRewardDays} />
          </div>
          <AdminField label="Referral note shown on the form" name="referralNote" defaultValue={config.referralNote} type="textarea" rows={3} />
          <button type="submit" className="btn-primary !py-2 text-sm">
            Save referral settings
          </button>
        </form>
      </AdminSection>

      <AdminSection title="Payments" description="How customers pay the installation fee.">
        <form action={saveSiteSettings} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="M-Pesa PayBill number" name="mpesaPaybill" defaultValue={config.mpesaPaybill} />
            <AdminField label="PayBill account name" name="mpesaAccountName" defaultValue={config.mpesaAccountName} />
            <AdminField label="Accepted methods" name="acceptedPaymentMethods" defaultValue={config.acceptedPaymentMethods} />
            <AdminField label="First month free" name="firstMonthFree" type="checkbox" defaultValue={config.firstMonthFree} />
          </div>
          <AdminField
            label="Payment instructions"
            name="paymentInstructions"
            defaultValue={config.paymentInstructions}
            type="textarea"
            rows={3}
          />
          <button type="submit" className="btn-primary !py-2 text-sm">
            Save payment details
          </button>
        </form>
      </AdminSection>

      <AdminSection title="Legal & consent" description="The wording on the request form and the terms.">
        <form action={saveSiteSettings} className="space-y-4">
          <AdminField label="Installation fee consent text" name="consentInstallText" defaultValue={config.consentInstallText} type="textarea" rows={2} />
          <AdminField label="Terms consent text" name="consentTermsText" defaultValue={config.consentTermsText} type="textarea" rows={2} />
          <AdminField label="Terms & Conditions" name="termsAndConditions" defaultValue={config.termsAndConditions} type="textarea" rows={8} />
          <AdminField label="Privacy note" name="privacyNote" defaultValue={config.privacyNote} type="textarea" rows={3} />
          <button type="submit" className="btn-primary !py-2 text-sm">
            Save legal wording
          </button>
        </form>
      </AdminSection>

      <AdminSection title="Sections & footer" description="Turn parts of the page on or off.">
        <form action={saveSiteSettings} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["showFeatures", "Features", config.showFeatures],
              ["showPlans", "Plans", config.showPlans],
              ["showSteps", "How it works", config.showSteps],
              ["showCoverage", "Coverage", config.showCoverage],
              ["showFaq", "FAQ", config.showFaq],
              ["showInstallBand", "Installation band", config.showInstallBand],
              ["showTestimonials", "Testimonials", config.showTestimonials],
            ].map(([key, label, value]) => (
              <label key={String(key)} className="flex items-center gap-2 rounded-xl border border-ink/8 p-3 text-sm text-ink">
                <input
                  type="checkbox"
                  name={String(key)}
                  defaultChecked={Boolean(value)}
                  className="h-4 w-4 accent-brand-600"
                />
                {label}
              </label>
            ))}
          </div>
          <AdminField label="Footer text" name="footerText" defaultValue={config.footerText} type="textarea" rows={2} />
          <AdminField label="Copyright line" name="copyrightText" defaultValue={config.copyrightText} />
          <AdminField label="How-it-works note" name="howItWorksNote" defaultValue={config.howItWorksNote} />
          <button type="submit" className="btn-primary !py-2 text-sm">
            Save sections
          </button>
        </form>
      </AdminSection>
    </div>
  );
}
