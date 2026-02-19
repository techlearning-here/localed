import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ContactForm } from "@/components/contact-form";
import { PublicSiteHeader } from "@/components/public-site-header";
import { getCountryLabel } from "@/lib/countries";
import { getOpenNowStatus } from "@/lib/open-now";
import { getRecommendedImageDimension } from "@/lib/image-dimensions";
import { getPublishedSiteBySlug } from "@/lib/sites";

const VALID_PAGES = ["about", "services", "contact"] as const;
type PageSlug = (typeof VALID_PAGES)[number];

function isPageSlug(s: string): s is PageSlug {
  return VALID_PAGES.includes(s as PageSlug);
}

export default async function PublicSiteSubPage({
  params,
}: {
  params: Promise<{ siteSlug: string; pageSlug: string }>;
}) {
  const { siteSlug, pageSlug } = await params;
  if (!isPageSlug(pageSlug)) notFound();

  const site = await getPublishedSiteBySlug(siteSlug);
  if (!site?.published_content) notFound();

  const locale = site.languages?.[0] ?? "en";
  const content = site.published_content[locale] ?? site.published_content.en ?? {};
  const siteLayout = content.siteLayout === "multi_page" ? "multi_page" : "single_page";

  if (siteLayout !== "multi_page") {
    redirect(`/${siteSlug}`);
  }

  const businessName = String(content.businessName || "") || (site.slug ?? "Site");
  const legalName = typeof content.legalName === "string" ? content.legalName.trim() : "";
  const logo = typeof content.logo === "string" ? content.logo : "";
  const tagline = typeof content.tagline === "string" ? content.tagline.trim() : "";
  const businessTypeLabel = site.business_type
    ? String(site.business_type).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";
  const footerText = typeof content.footerText === "string" ? content.footerText.trim() : "";
  const customDomainDisplay = typeof content.customDomainDisplay === "string" ? content.customDomainDisplay.trim() : "";
  const showBackToTop = Boolean(content.showBackToTop);
  const contactFormSuccessMessage =
    typeof content.contactFormSuccessMessage === "string" ? content.contactFormSuccessMessage.trim() : "";

  const currentPage: "about" | "services" | "contact" = pageSlug;

  const about = typeof content.about === "string" ? content.about : "";
  const yearEstablished = typeof content.yearEstablished === "string" ? content.yearEstablished : "";
  const address = typeof content.address === "string" ? content.address : "";
  const addressLocality = typeof content.addressLocality === "string" ? content.addressLocality.trim() : "";
  const addressRegion = typeof content.addressRegion === "string" ? content.addressRegion.trim() : "";
  const postalCode = typeof content.postalCode === "string" ? content.postalCode.trim() : "";
  const countryCode = typeof content.country === "string" ? content.country : (site.country ?? "");
  const country = countryCode ? getCountryLabel(countryCode) : "";
  const areaServed = typeof content.areaServed === "string" ? content.areaServed : "";
  const phone = typeof content.phone === "string" ? content.phone : "";
  const phone2 = typeof content.phone2 === "string" ? content.phone2.trim() : "";
  const email = typeof content.email === "string" ? content.email : "";
  const email2 = typeof content.email2 === "string" ? content.email2.trim() : "";
  const whatsApp = typeof content.whatsApp === "string" ? content.whatsApp : "";
  const paymentMethods = typeof content.paymentMethods === "string" ? content.paymentMethods.trim() : "";
  const directionsLabel =
    typeof content.directionsLabel === "string" ? content.directionsLabel.trim() || "View on map" : "View on map";
  const mapEmbedUrl = typeof content.mapEmbedUrl === "string" ? content.mapEmbedUrl.trim() : "";
  const mapQuery = [address, addressLocality, addressRegion, postalCode, country].filter(Boolean).join(", ") || "";
  const showMapLink = content.showMapLink !== false && content.showMapLink !== "false";
  const businessHours = typeof content.businessHours === "string" ? content.businessHours : "";
  const specialHours = typeof content.specialHours === "string" ? content.specialHours : "";
  const timezone = typeof content.timezone === "string" ? content.timezone : "";
  const openStatus = timezone && businessHours ? getOpenNowStatus(timezone, businessHours) : null;

  const rawServices = content.services;
  type ServiceItemView = {
    name: string;
    description?: string;
    image?: string;
    duration?: string;
    price?: string;
    category?: string;
  };
  const servicesList: ServiceItemView[] = Array.isArray(rawServices)
    ? rawServices
        .filter((s): s is Record<string, unknown> => s != null && typeof s === "object")
        .map((s) => ({
          name: typeof s.name === "string" ? s.name : "",
          description: typeof s.description === "string" ? s.description : undefined,
          image: typeof s.image === "string" ? s.image : undefined,
          duration: typeof s.duration === "string" ? s.duration : undefined,
          price: typeof s.price === "string" ? s.price : undefined,
          category: typeof s.category === "string" ? s.category.trim() || undefined : undefined,
        }))
        .filter((s) => s.name.trim() !== "")
    : [];

  const rawTeam = content.team;
  const teamList: { name: string; role?: string; photo?: string; bio?: string }[] = Array.isArray(rawTeam)
    ? rawTeam
        .filter((t): t is Record<string, unknown> => t != null && typeof t === "object")
        .map((t) => ({
          name: typeof t.name === "string" ? t.name : "",
          role: typeof t.role === "string" ? t.role : undefined,
          photo: typeof t.photo === "string" ? t.photo : undefined,
          bio: typeof t.bio === "string" ? t.bio : undefined,
        }))
        .filter((t) => t.name.trim() !== "")
    : [];

  const rawTestimonials = content.testimonials;
  const testimonialsList: { quote: string; author?: string; photo?: string; rating?: string }[] = Array.isArray(
    rawTestimonials
  )
    ? rawTestimonials
        .filter((t): t is Record<string, unknown> => t != null && typeof t === "object")
        .map((t) => ({
          quote: typeof t.quote === "string" ? t.quote : "",
          author: typeof t.author === "string" ? t.author : undefined,
          photo: typeof t.photo === "string" ? t.photo : undefined,
          rating: typeof t.rating === "string" ? t.rating : undefined,
        }))
        .filter((t) => t.quote.trim() !== "")
    : [];

  const servicesIntro = typeof content.servicesIntro === "string" ? content.servicesIntro.trim() : "";

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 rounded bg-gray-900 px-3 py-2 text-white text-sm"
      >
        Skip to content
      </a>
      <PublicSiteHeader
        siteSlug={siteSlug}
        businessName={businessName}
        logo={logo || undefined}
        tagline={tagline || undefined}
        businessTypeLabel={businessTypeLabel || undefined}
        siteLayout="multi_page"
        currentPage={currentPage}
      />
      <div id="main-content" className="p-6">
        {currentPage === "about" && (
          <>
            <h2 className="text-xl font-semibold text-gray-900">About</h2>
            {yearEstablished ? (
              <p className="mt-2 text-sm text-gray-600">{yearEstablished}</p>
            ) : null}
            {about ? <div className="mt-2 text-gray-700 whitespace-pre-wrap">{about}</div> : null}
            {teamList.length > 0 ? (
              <section className="mt-6">
                <h3 className="text-lg font-medium">Meet the team</h3>
                <div className="mt-2 grid gap-4 sm:grid-cols-2">
                  {teamList.map((m, i) => (
                    <div key={i} className="rounded-lg border border-gray-200 p-4">
                      {m.photo ? (
                        <div className="mb-2 h-24 w-24 shrink-0 overflow-hidden rounded-full bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.photo} alt="" className="h-full w-full object-cover" width={getRecommendedImageDimension("team").width} height={getRecommendedImageDimension("team").height} />
                        </div>
                      ) : null}
                      <p className="font-medium text-gray-900">{m.name}</p>
                      {m.role ? <p className="text-sm text-gray-600">{m.role}</p> : null}
                      {m.bio ? <p className="mt-1 text-sm text-gray-700">{m.bio}</p> : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
            {testimonialsList.length > 0 ? (
              <section className="mt-6">
                <h3 className="text-lg font-medium">Testimonials</h3>
                <div className="mt-2 space-y-4">
                  {testimonialsList.map((t, i) => (
                    <blockquote key={i} className="rounded-lg border border-gray-200 p-4">
                      <p className="text-gray-700">{t.quote}</p>
                      {t.author ? (
                        <footer className="mt-2 text-sm text-gray-500">— {t.author}</footer>
                      ) : null}
                    </blockquote>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}

        {currentPage === "services" && (
          <>
            <h2 className="text-xl font-semibold text-gray-900">Services</h2>
            {servicesIntro ? <p className="mt-2 text-gray-600">{servicesIntro}</p> : null}
            {servicesList.length > 0 ? (
              <ul className="mt-4 space-y-4">
                {servicesList.map((s, i) => (
                  <li key={i} className="rounded-lg border border-gray-200 p-4">
                    {s.image ? (
                      <div className="mb-2 aspect-[4/3] w-full overflow-hidden rounded bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.image} alt="" className="h-full w-full object-cover" loading="lazy" width={getRecommendedImageDimension("service").width} height={getRecommendedImageDimension("service").height} />
                      </div>
                    ) : null}
                    {s.category ? (
                      <span className="text-xs font-medium uppercase text-gray-500">{s.category}</span>
                    ) : null}
                    <span className="font-medium">{s.name}</span>
                    {s.description ? (
                      <p className="mt-1 text-sm text-gray-600">{s.description}</p>
                    ) : null}
                    {(s.duration || s.price) ? (
                      <p className="mt-1 text-sm text-gray-500">
                        {[s.duration, s.price].filter(Boolean).join(" · ")}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-gray-600">No services listed yet.</p>
            )}
          </>
        )}

        {currentPage === "contact" && (
          <>
            <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
            {(address || country || areaServed || phone || email || whatsApp || paymentMethods) ? (
              <ul className="mt-4 space-y-1 text-gray-700">
                {address ? <li>{address}</li> : null}
                {country ? <li>{country}</li> : null}
                {areaServed ? <li className="text-gray-600">{areaServed}</li> : null}
                {showMapLink && mapQuery ? (
                  <li>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {directionsLabel}
                    </a>
                  </li>
                ) : null}
                {mapEmbedUrl ? (
                  <li className="mt-2">
                    <iframe
                      src={mapEmbedUrl}
                      width="100%"
                      height="200"
                      style={{ maxWidth: 560, border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Map"
                    />
                  </li>
                ) : null}
                {phone ? (
                  <li>
                    Phone:{" "}
                    <a href={`tel:${encodeURIComponent(phone)}`} className="text-blue-600 underline hover:text-blue-800">
                      {phone}
                    </a>
                  </li>
                ) : null}
                {phone2 ? (
                  <li>
                    Phone 2:{" "}
                    <a href={`tel:${encodeURIComponent(phone2)}`} className="text-blue-600 underline hover:text-blue-800">
                      {phone2}
                    </a>
                  </li>
                ) : null}
                {email ? (
                  <li>
                    Email:{" "}
                    <a
                      href={`mailto:${encodeURIComponent(email)}`}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {email}
                    </a>
                  </li>
                ) : null}
                {email2 ? (
                  <li>
                    Email 2:{" "}
                    <a
                      href={`mailto:${encodeURIComponent(email2)}`}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {email2}
                    </a>
                  </li>
                ) : null}
                {whatsApp ? (
                  <li>
                    <a
                      href={
                        whatsApp.startsWith("http")
                          ? whatsApp
                          : `https://wa.me/${whatsApp.replace(/\D/g, "")}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Chat on WhatsApp
                    </a>
                  </li>
                ) : null}
                {paymentMethods ? <li className="text-gray-600">{paymentMethods}</li> : null}
              </ul>
            ) : null}
            {(businessHours || specialHours || timezone) ? (
              <section className="mt-6">
                <h3 className="text-lg font-medium">Hours</h3>
                {openStatus !== null ? (
                  <p className="mt-1">
                    <span
                      className={
                        openStatus.open
                          ? "inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800"
                          : "inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-700"
                      }
                    >
                      {openStatus.open ? "Open now" : "Closed"}
                    </span>
                  </p>
                ) : null}
                <ul className="mt-2 space-y-1 text-gray-700">
                  {businessHours ? <li>{businessHours}</li> : null}
                  {specialHours ? <li className="text-gray-600">{specialHours}</li> : null}
                </ul>
              </section>
            ) : null}
            <div className="mt-6">
              <ContactForm siteSlug={siteSlug} successMessage={contactFormSuccessMessage || undefined} />
            </div>
          </>
        )}

        {showBackToTop ? (
          <p className="mt-6 text-center">
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-700">
              Back to top
            </Link>
          </p>
        ) : null}
        {(footerText || customDomainDisplay || legalName) ? (
          <footer className="mt-8 border-t border-gray-200 pt-4 text-sm text-gray-500">
            {footerText ? <p>{footerText}</p> : null}
            {customDomainDisplay ? <p>{customDomainDisplay}</p> : null}
            {legalName ? <p>Legal name: {legalName}</p> : null}
          </footer>
        ) : null}
      </div>
    </main>
  );
}
