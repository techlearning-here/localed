import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/contact-form";
import { buildPublicSiteMetadata } from "@/lib/build-public-meta";
import { getCountryLabel } from "@/lib/countries";
import { getOpenNowStatus } from "@/lib/open-now";
import { getPublishedSiteUrl } from "@/lib/published-storage";
import { getPublishedSiteBySlug } from "@/lib/sites";

const PUBLIC_SITE_BASE =
  typeof process.env.NEXT_PUBLIC_SITE_URL === "string" && process.env.NEXT_PUBLIC_SITE_URL.trim()
    ? process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/$/, "")
    : "";

/**
 * PUBLIC-02: Path-based published site at /[siteSlug]
 * PUBLIC-03: Meta and Open Graph for shared links.
 * When published to CDN (published_artifact_path), metadata uses published_meta.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ siteSlug: string }>;
}): Promise<Metadata> {
  const { siteSlug } = await params;
  const site = await getPublishedSiteBySlug(siteSlug);
  if (!site) return { title: "Site" };
  if (site.published_artifact_path && site.published_meta) {
    const m = site.published_meta;
    return {
      title: m.title ?? site.slug,
      description: m.description ?? undefined,
      openGraph: {
        title: m.title ?? site.slug,
        description: m.description ?? undefined,
        url: PUBLIC_SITE_BASE ? `${PUBLIC_SITE_BASE}/${siteSlug}` : undefined,
        ...(m.ogImage && { images: [{ url: m.ogImage }] }),
      },
      twitter: {
        card: "summary_large_image",
        title: m.title ?? site.slug,
        description: m.description ?? undefined,
        ...(m.ogImage && { images: [m.ogImage] }),
      },
      ...(m.ogImage && { icons: [{ url: m.ogImage, rel: "icon" }] }),
    };
  }
  if (!site.published_content) return { title: "Site" };
  const locale = site.languages?.[0] ?? "en";
  const content = (site.published_content[locale] ?? site.published_content.en ?? {}) as Record<string, unknown>;
  const businessName = String(content.businessName || "") || site.slug || "Site";
  const tagline = typeof content.tagline === "string" ? content.tagline : "";
  const favicon = typeof content.favicon === "string" ? content.favicon : typeof content.logo === "string" ? content.logo : undefined;

  const meta = buildPublicSiteMetadata(content, siteSlug, PUBLIC_SITE_BASE);
  return {
    ...meta,
    title: tagline ? `${businessName} — ${tagline}` : meta.title,
    icons: favicon ? [{ url: favicon, rel: "icon" }] : undefined,
  };
}

export default async function PublicSitePage({
  params,
}: {
  params: Promise<{ siteSlug: string }>;
}) {
  const { siteSlug } = await params;
  const site = await getPublishedSiteBySlug(siteSlug);
  if (!site) notFound();
  const cdnUrl = site.published_artifact_path
    ? getPublishedSiteUrl(site.published_artifact_path)
    : "";
  if (cdnUrl) {
    const proxyUrl = `/api/sites/${siteSlug}/published`;
    return (
      <div className="published-site-frame">
        <iframe
          src={proxyUrl}
          title={site.published_meta?.title ?? site.slug}
          className="published-site-iframe"
        />
      </div>
    );
  }
  if (!site.published_content) notFound();

  const locale = site.languages?.[0] ?? "en";
  const content = site.published_content[locale] ?? site.published_content.en ?? {};
  const businessName =
    String(content.businessName || "") || (site.slug ?? "Site");
  const legalName = typeof content.legalName === "string" ? content.legalName.trim() : "";
  const logo = typeof content.logo === "string" ? content.logo : "";
  const shortDesc = typeof content.shortDescription === "string" ? content.shortDescription : "";
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
  const contactPreference = typeof content.contactPreference === "string" ? content.contactPreference.trim() : "";
  const contactFormSuccessMessage = typeof content.contactFormSuccessMessage === "string" ? content.contactFormSuccessMessage.trim() : "";
  const mapEmbedUrl = typeof content.mapEmbedUrl === "string" ? content.mapEmbedUrl.trim() : "";
  const whatsApp = typeof content.whatsApp === "string" ? content.whatsApp : "";
  const paymentMethods = typeof content.paymentMethods === "string" ? content.paymentMethods.trim() : "";
  const directionsLabel = typeof content.directionsLabel === "string" ? content.directionsLabel.trim() || "View on map" : "View on map";
  const mapQuery = [address, addressLocality, addressRegion, postalCode, country].filter(Boolean).join(", ") || "";
  const galleryUrls = Array.isArray(content.galleryUrls) ? content.galleryUrls.filter((u): u is string => typeof u === "string") : [];
  const galleryCaptions = Array.isArray(content.galleryCaptions)
    ? (content.galleryCaptions as unknown[]).slice(0, galleryUrls.length).map((c) => (typeof c === "string" ? c : ""))
    : [];
  const otherVideoUrls = Array.isArray(content.otherVideoUrls)
    ? (content.otherVideoUrls as unknown[]).filter((u): u is string => typeof u === "string")
    : [];
  const otherVideoEmbeds: { embedSrc?: string; url: string }[] = otherVideoUrls.map((url) => {
    const vimeoId = url.match(/(?:vimeo\.com\/)(?:video\/)?(\d+)/)?.[1];
    return vimeoId ? { embedSrc: `https://player.vimeo.com/video/${vimeoId}`, url } : { url };
  });
  const servicesIntro = typeof content.servicesIntro === "string" ? content.servicesIntro.trim() : "";
  const bookingEnabled = Boolean(content.bookingEnabled);
  const bookingSlotDuration = typeof content.bookingSlotDuration === "string" ? content.bookingSlotDuration.trim() : "";
  const bookingLeadTime = typeof content.bookingLeadTime === "string" ? content.bookingLeadTime.trim() : "";
  const businessHours = typeof content.businessHours === "string" ? content.businessHours : "";
  const specialHours = typeof content.specialHours === "string" ? content.specialHours : "";
  const timezone = typeof content.timezone === "string" ? content.timezone : "";
  const heroImageRaw = typeof content.heroImage === "string" ? content.heroImage : "";
  const heroImage = heroImageRaw || (galleryUrls.length > 0 ? "" : "https://placehold.co/1200x400/e2e8f0/64748b?text=No+image");
  const youtubeUrls = Array.isArray(content.youtubeUrls) ? content.youtubeUrls.filter((u): u is string => typeof u === "string") : [];

  const businessTypeLabel = site.business_type ? String(site.business_type).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

  const facebookUrl = typeof content.facebookUrl === "string" ? content.facebookUrl.trim() : "";
  const instagramUrl = typeof content.instagramUrl === "string" ? content.instagramUrl.trim() : "";
  const youtubeChannelUrl = typeof content.youtubeChannelUrl === "string" ? content.youtubeChannelUrl.trim() : "";
  const twitterUrl = typeof content.twitterUrl === "string" ? content.twitterUrl.trim() : "";
  const linkedinUrl = typeof content.linkedinUrl === "string" ? content.linkedinUrl.trim() : "";
  const tiktokUrl = typeof content.tiktokUrl === "string" ? content.tiktokUrl.trim() : "";
  const otherLinkLabel = typeof content.otherLinkLabel === "string" ? content.otherLinkLabel.trim() : "";
  const otherLinkUrl = typeof content.otherLinkUrl === "string" ? content.otherLinkUrl.trim() : "";

  const socialLinks: { label: string; url: string }[] = [];
  if (facebookUrl) socialLinks.push({ label: "Facebook", url: facebookUrl });
  if (instagramUrl) socialLinks.push({ label: "Instagram", url: instagramUrl });
  if (youtubeChannelUrl) socialLinks.push({ label: "YouTube", url: youtubeChannelUrl });
  if (twitterUrl) socialLinks.push({ label: "X", url: twitterUrl });
  if (linkedinUrl) socialLinks.push({ label: "LinkedIn", url: linkedinUrl });
  if (tiktokUrl) socialLinks.push({ label: "TikTok", url: tiktokUrl });
  if (otherLinkUrl) socialLinks.push({ label: otherLinkLabel || "Link", url: otherLinkUrl });

  const rawServices = content.services;
  type ServiceItemView = { name: string; description?: string; image?: string; duration?: string; price?: string; category?: string };
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

  const rawFaq = content.faq;
  const faqList: { question: string; answer: string }[] = Array.isArray(rawFaq)
    ? rawFaq
        .filter((f): f is Record<string, unknown> => f != null && typeof f === "object")
        .map((f) => ({
          question: typeof f.question === "string" ? f.question : "",
          answer: typeof f.answer === "string" ? f.answer : "",
        }))
        .filter((f) => f.question.trim() !== "")
    : [];

  const rawTestimonials = content.testimonials;
  const testimonialsList: { quote: string; author?: string; photo?: string; rating?: string }[] = Array.isArray(rawTestimonials)
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

  const rawCertifications = content.certifications;
  const certificationsList: { title?: string; image?: string }[] = Array.isArray(rawCertifications)
    ? rawCertifications
        .filter((c): c is Record<string, unknown> => c != null && typeof c === "object")
        .map((c) => ({
          title: typeof c.title === "string" ? c.title : undefined,
          image: typeof c.image === "string" ? c.image : undefined,
        }))
        .filter((c) => ((c.title ?? "").trim() !== "" || (c.image ?? "").trim() !== ""))
    : [];

  const ctaLabel = typeof content.ctaLabel === "string" ? content.ctaLabel.trim() : "";
  const ctaUrl = typeof content.ctaUrl === "string" ? content.ctaUrl.trim() : "";
  const hasCta = !!(ctaLabel && ctaUrl);
  const cta2Label = typeof content.cta2Label === "string" ? content.cta2Label.trim() : "";
  const cta2Url = typeof content.cta2Url === "string" ? content.cta2Url.trim() : "";
  const hasCta2 = !!(cta2Label && cta2Url);
  const cta3Label = typeof content.cta3Label === "string" ? content.cta3Label.trim() : "";
  const cta3Url = typeof content.cta3Url === "string" ? content.cta3Url.trim() : "";
  const hasCta3 = !!(cta3Label && cta3Url);
  const showMapLink = content.showMapLink !== false && content.showMapLink !== "false";
  const announcementBar = typeof content.announcementBar === "string" ? content.announcementBar.trim() : "";
  const footerText = typeof content.footerText === "string" ? content.footerText.trim() : "";
  const customDomainDisplay = typeof content.customDomainDisplay === "string" ? content.customDomainDisplay.trim() : "";
  const showBackToTop = Boolean(content.showBackToTop);
  const newsletterLabel = typeof content.newsletterLabel === "string" ? content.newsletterLabel.trim() : "";
  const newsletterUrl = typeof content.newsletterUrl === "string" ? content.newsletterUrl.trim() : "";
  const hasNewsletter = (content.hasNewsletter === true || content.hasNewsletter === "true") && (newsletterLabel || newsletterUrl);
  const shareSectionTitle = typeof content.shareSectionTitle === "string" ? content.shareSectionTitle.trim() : "";
  const faqAsAccordion = Boolean(content.faqAsAccordion);
  const bookingUrl = typeof content.bookingUrl === "string" ? content.bookingUrl.trim() : "";
  const tagline = typeof content.tagline === "string" ? content.tagline.trim() : "";
  const canonicalForShare = PUBLIC_SITE_BASE ? `${PUBLIC_SITE_BASE}/${siteSlug}` : "";

  const openStatus =
    timezone && businessHours ? getOpenNowStatus(timezone, businessHours) : null;

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 rounded bg-gray-900 px-3 py-2 text-white text-sm">
        Skip to content
      </a>
      {announcementBar ? (
        <div className="bg-gray-900 text-white text-center py-2 px-4 text-sm">{announcementBar}</div>
      ) : null}
      <header className="border-b p-4 flex items-center gap-3 flex-wrap">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- dynamic user URL
          <img src={logo} alt="" className="h-10 w-auto object-contain" />
        ) : null}
        <div className="flex items-center gap-2 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold">{businessName}</h1>
            {tagline ? <p className="text-sm text-gray-600">{tagline}</p> : null}
          </div>
          {businessTypeLabel ? (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
              {businessTypeLabel}
            </span>
          ) : null}
        </div>
      </header>
      {heroImage ? (
        <div className="w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImage} alt="" className="h-48 w-full object-cover md:h-64" />
        </div>
      ) : null}
      <div id="main-content" className="p-6">
        {shortDesc ? (
          <p className="text-gray-600">{shortDesc}</p>
        ) : null}
        {hasCta ? (
          <p className="mt-4">
            <a
              href={ctaUrl}
              className="inline-block rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              {ctaLabel}
            </a>
          </p>
        ) : null}
        {hasCta2 ? (
          <p className="mt-2">
            <a
              href={cta2Url}
              className="inline-block rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              target="_blank"
              rel="noopener noreferrer"
            >
              {cta2Label}
            </a>
          </p>
        ) : null}
        {hasCta3 ? (
          <p className="mt-2">
            <a
              href={cta3Url}
              className="inline-block rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              target="_blank"
              rel="noopener noreferrer"
            >
              {cta3Label}
            </a>
          </p>
        ) : null}
        {(about || yearEstablished) ? (
          <section className="mt-6">
            <h2 className="text-lg font-medium">About</h2>
            {yearEstablished ? (
              <p className="mt-2 text-sm text-gray-600">{yearEstablished}</p>
            ) : null}
            {about ? <p className="mt-2 text-gray-700">{about}</p> : null}
          </section>
        ) : null}
        {servicesList.length > 0 ? (
          <section className="mt-6">
            <h2 className="text-lg font-medium">What we offer</h2>
            {servicesIntro ? <p className="mt-2 text-gray-600">{servicesIntro}</p> : null}
            <ul className="mt-2 space-y-4">
              {servicesList.map((s, i) => (
                <li key={i} className="rounded-lg border border-gray-200 p-4">
                  {s.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- dynamic user URL
                    <img src={s.image} alt="" className="mb-2 h-32 w-full rounded object-cover" loading="lazy" />
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
          </section>
        ) : null}
        {(address || country || areaServed || phone || phone2 || email || email2 || whatsApp || paymentMethods) ? (
          <section className="mt-6">
            <h2 className="text-lg font-medium">Contact</h2>
            <ul className="mt-2 space-y-1 text-gray-700">
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
                    View on map
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
              {contactPreference ? <li className="text-gray-600">Preferred: {contactPreference}</li> : null}
              {phone ? (
                <li>Phone: <a href={`tel:${encodeURIComponent(phone)}`} className="text-blue-600 underline hover:text-blue-800">{phone}</a></li>
              ) : null}
              {phone2 ? (
                <li>Phone 2: <a href={`tel:${encodeURIComponent(phone2)}`} className="text-blue-600 underline hover:text-blue-800">{phone2}</a></li>
              ) : null}
              {email ? (
                <li>Email: <a href={`mailto:${encodeURIComponent(email)}`} className="text-blue-600 underline hover:text-blue-800">{email}</a></li>
              ) : null}
              {email2 ? (
                <li>Email 2: <a href={`mailto:${encodeURIComponent(email2)}`} className="text-blue-600 underline hover:text-blue-800">{email2}</a></li>
              ) : null}
              {whatsApp ? (
                <li>
                  <a
                    href={whatsApp.startsWith("http") ? whatsApp : `https://wa.me/${whatsApp.replace(/\D/g, "")}`}
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
          </section>
        ) : null}
        {socialLinks.length > 0 ? (
          <section className="mt-6">
            <h2 className="text-lg font-medium">Follow us</h2>
            <ul className="mt-2 flex flex-wrap gap-3 text-gray-700">
              {socialLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {(businessHours || specialHours || timezone) ? (
          <section className="mt-6">
            <h2 className="text-lg font-medium">Hours</h2>
            {openStatus !== null ? (
              <p className="mt-1">
                <span
                  className={
                    openStatus.open
                      ? "inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800"
                      : "inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-700"
                  }
                >
                  {openStatus.open ? "Open now" : "Closed"}
                </span>
              </p>
            ) : null}
            {timezone ? (
              <p className="mt-1 text-sm text-gray-500">All times in {timezone.replace(/_/g, " ")}</p>
            ) : null}
            <ul className="mt-2 space-y-1 text-gray-700">
              {businessHours ? <li>{businessHours}</li> : null}
              {specialHours ? <li className="text-gray-600">{specialHours}</li> : null}
            </ul>
          </section>
        ) : null}
        {galleryUrls.length > 0 ? (
          <section className="mt-6">
            <h2 className="text-lg font-medium">Gallery</h2>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {galleryUrls.map((url, i) => (
                <figure key={i}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- dynamic user URL */}
                  <img
                    src={url}
                    alt={galleryCaptions[i] ?? ""}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                  {galleryCaptions[i] ? (
                    <figcaption className="mt-1 truncate text-xs text-gray-500">{galleryCaptions[i]}</figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          </section>
        ) : null}
        {youtubeUrls.length > 0 ? (
          <section className="mt-6">
            <h2 className="text-lg font-medium">Videos</h2>
            <div className="mt-2 space-y-4">
              {youtubeUrls.map((url, i) => {
                const id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
                if (!id) return null;
                return (
                  <div key={i} className="aspect-video w-full max-w-2xl overflow-hidden rounded-lg">
                    <iframe
                      src={`https://www.youtube.com/embed/${id}`}
                      title="YouTube video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
        {otherVideoUrls.length > 0 ? (
          <section className="mt-6">
            <h2 className="text-lg font-medium">Other videos</h2>
            <ul className="mt-2 space-y-1">
              {otherVideoUrls.map((url, i) => (
                <li key={i}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {bookingEnabled ? (
          <section className="mt-6">
            <h2 className="text-lg font-medium">Book online</h2>
            <p className="mt-2 text-gray-700">
              {bookingSlotDuration ? `Slot duration: ${bookingSlotDuration}. ` : null}
              {bookingLeadTime ?? ""}
            </p>
            {bookingUrl ? (
              <p className="mt-2">
                <a
                  href={bookingUrl}
                  className="inline-block rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book now
                </a>
              </p>
            ) : null}
          </section>
        ) : null}
        {faqList.length > 0 ? (
          <section className="mt-6">
            <h2 className="text-lg font-medium">FAQ</h2>
            {faqAsAccordion ? (
              <div className="mt-2 space-y-2">
                {faqList.map((faq, i) => (
                  <details key={i} className="rounded-lg border border-gray-200">
                    <summary className="cursor-pointer px-4 py-3 font-medium text-gray-900">{faq.question}</summary>
                    <div className="border-t border-gray-200 px-4 py-3 text-gray-600">{faq.answer}</div>
                  </details>
                ))}
              </div>
            ) : (
              <dl className="mt-2 space-y-4">
                {faqList.map((faq, i) => (
                  <div key={i}>
                    <dt className="font-medium text-gray-900">{faq.question}</dt>
                    <dd className="mt-1 text-gray-600">{faq.answer}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        ) : null}
        {testimonialsList.length > 0 ? (
          <section className="mt-6">
            <h2 className="text-lg font-medium">Testimonials</h2>
            <div className="mt-2 space-y-4">
              {testimonialsList.map((t, i) => (
                <blockquote key={i} className="rounded-lg border border-gray-200 p-4">
                  {t.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- dynamic user URL
                    <img src={t.photo} alt="" className="mb-2 h-12 w-12 rounded-full object-cover" />
                  ) : null}
                  <p className="text-gray-700">{t.quote}</p>
                  {t.author ? (
                    <footer className="mt-2 text-sm text-gray-500">— {t.author}</footer>
                  ) : null}
                  {t.rating ? (
                    <p className="mt-1 text-sm text-amber-600">{t.rating}</p>
                  ) : null}
                </blockquote>
              ))}
            </div>
          </section>
        ) : null}
        {teamList.length > 0 ? (
          <section className="mt-6">
            <h2 className="text-lg font-medium">Meet the team</h2>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              {teamList.map((m, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4">
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- dynamic user URL
                    <img src={m.photo} alt="" className="mb-2 h-24 w-24 rounded-full object-cover" />
                  ) : null}
                  <p className="font-medium text-gray-900">{m.name}</p>
                  {m.role ? <p className="text-sm text-gray-600">{m.role}</p> : null}
                  {m.bio ? <p className="mt-1 text-sm text-gray-700">{m.bio}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}
        {certificationsList.length > 0 ? (
          <section className="mt-6">
            <h2 className="text-lg font-medium">Certifications & awards</h2>
            <div className="mt-2 flex flex-wrap gap-4">
              {certificationsList.map((c, i) => (
                <div key={i} className="flex flex-col items-start rounded-lg border border-gray-200 p-4">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- dynamic user URL
                    <img src={c.image} alt="" className="h-16 w-auto object-contain" />
                  ) : null}
                  {c.title ? <p className="mt-2 text-sm font-medium text-gray-900">{c.title}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}
        {shareSectionTitle ? (
          <section className="mt-6">
            <h2 className="text-lg font-medium">{shareSectionTitle}</h2>
            <p className="mt-1 text-sm text-gray-600">Share this page</p>
            <ul className="mt-2 flex flex-wrap gap-3">
              <li>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalForShare)}&text=${encodeURIComponent(businessName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalForShare)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalForShare)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </section>
        ) : null}
        {hasNewsletter ? (
          <section className="mt-6">
            <h2 className="text-lg font-medium">Newsletter</h2>
            {newsletterLabel ? <p className="mt-1 text-sm text-gray-600">{newsletterLabel}</p> : null}
            {newsletterUrl ? (
              <p className="mt-2">
                <a href={newsletterUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                  Sign up
                </a>
              </p>
            ) : null}
          </section>
        ) : null}
        <ContactForm siteSlug={siteSlug} successMessage={contactFormSuccessMessage || undefined} />
        {showBackToTop ? (
          <p className="mt-6 text-center">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Back to top</a>
          </p>
        ) : null}
        {(footerText || customDomainDisplay || legalName) ? (
          <footer className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-500">
            {footerText ? <p>{footerText}</p> : null}
            {customDomainDisplay ? <p>{customDomainDisplay}</p> : null}
            {legalName ? <p>Legal name: {legalName}</p> : null}
          </footer>
        ) : null}
      </div>
    </main>
  );
}
