"use client";

import type { ReactNode } from "react";
import { ContactForm } from "@/components/contact-form";
import { SocialLinksSection } from "@/components/social-icons";
import { getRecommendedImageDimension } from "@/lib/image-dimensions";
import type { ParsedSiteContent } from "@/lib/parse-site-content";
import type { LayoutId } from "@/lib/template-catalog";

export type SinglePageSiteViewProps = {
  parsed: ParsedSiteContent;
  siteSlug: string;
  /** Layout variant from template (default | classic | minimal). Drives width, hero aspect, spacing. */
  layoutId?: LayoutId;
  /** Optional banner above the main content (e.g. "Preview — draft content only") */
  previewBanner?: ReactNode;
};

const LAYOUT_STYLES: Record<
  LayoutId,
  { contentWrap: string; heroAspect: string; contentPad: string; sectionMt: string; headingClass: string; cardClass: string; bodyClass: string }
> = {
  default: {
    contentWrap: "",
    heroAspect: "aspect-[21/9] min-h-[14rem]",
    contentPad: "max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-10",
    sectionMt: "mt-12",
    headingClass: "text-xl font-semibold text-gray-900 tracking-tight",
    cardClass: "rounded-xl border border-gray-200 bg-white p-5 shadow-sm",
    bodyClass: "text-base text-gray-700 leading-relaxed",
  },
  classic: {
    contentWrap: "max-w-4xl mx-auto",
    heroAspect: "aspect-video",
    contentPad: "px-4 py-8 sm:px-6 sm:py-10",
    sectionMt: "mt-12",
    headingClass: "text-xl font-semibold text-gray-900 tracking-tight",
    cardClass: "rounded-xl border border-gray-200 bg-white p-5 shadow-sm",
    bodyClass: "text-base text-gray-700 leading-relaxed",
  },
  minimal: {
    contentWrap: "max-w-3xl mx-auto",
    heroAspect: "aspect-video min-h-[10rem]",
    contentPad: "px-4 py-6 sm:px-6",
    sectionMt: "mt-8",
    headingClass: "text-base font-semibold text-gray-900",
    cardClass: "rounded-lg border border-gray-100 p-4",
    bodyClass: "text-sm text-gray-600 leading-relaxed",
  },
};

/**
 * Renders the full single-page site layout from parsed content.
 * Used by both the public site and the dashboard preview so they match.
 * layoutId selects template variant (default = full-width, classic = contained, minimal = compact).
 */
export function SinglePageSiteView({ parsed, siteSlug, layoutId = "default", previewBanner }: SinglePageSiteViewProps) {
  const layout = LAYOUT_STYLES[layoutId];
  const {
    businessName,
    legalName,
    tagline,
    logo,
    shortDesc,
    about,
    yearEstablished,
    priceRange,
    address,
    addressLocality,
    addressRegion,
    postalCode,
    country,
    areaServed,
    addressDescription,
    locationName,
    serviceAreaOnly,
    serviceAreaRegions,
    phone,
    phone2,
    email,
    parking,
    accessibilityWheelchair,
    serviceOptions,
    languagesSpoken,
    otherAmenities,
    email2,
    contactPreference,
    contactFormSuccessMessage,
    mapEmbedUrl,
    whatsApp,
    paymentMethods,
    mapQuery,
    galleryUrls,
    galleryCaptions,
    otherVideoEmbeds,
    servicesIntro,
    bookingEnabled,
    bookingSlotDuration,
    bookingLeadTime,
    businessHours,
    specialHours,
    timezone,
    heroImage,
    youtubeUrls,
    businessTypeLabel,
    socialLinks,
    servicesList,
    faqList,
    testimonialsList,
    teamList,
    certificationsList,
    ctaLabel,
    ctaUrl,
    hasCta,
    cta2Label,
    cta2Url,
    hasCta2,
    cta3Label,
    cta3Url,
    hasCta3,
    showMapLink,
    announcementBar,
    footerText,
    customDomainDisplay,
    showBackToTop,
    newsletterLabel,
    newsletterUrl,
    hasNewsletter,
    shareSectionTitle,
    faqAsAccordion,
    bookingUrl,
    canonicalForShare,
    openStatus,
    servicesSectionTitle,
    aboutSectionTitle,
    contactSectionTitle,
    hoursSectionTitle,
    gallerySectionTitle,
    videosSectionTitle,
    otherVideosSectionTitle,
    faqSectionTitle,
    testimonialsSectionTitle,
    teamSectionTitle,
    certificationsSectionTitle,
    contactFormSectionTitle,
    directionsLabel,
  } = parsed;

  const heroDim = getRecommendedImageDimension("hero");
  const logoDim = getRecommendedImageDimension("logo");
  const serviceDim = getRecommendedImageDimension("service");
  const galleryDim = getRecommendedImageDimension("gallery");
  const testimonialDim = getRecommendedImageDimension("testimonial");
  const teamDim = getRecommendedImageDimension("team");
  const certDim = getRecommendedImageDimension("certification");

  const hasAbout = !!(about || yearEstablished || priceRange);
  const hasServices = servicesList.length > 0;
  const hasContact = !!(address || addressLocality || addressRegion || postalCode || country || areaServed || addressDescription || locationName || serviceAreaRegions || phone || phone2 || email || email2 || whatsApp || paymentMethods || parking || accessibilityWheelchair || serviceOptions || languagesSpoken || otherAmenities);
  const hasHours = !!(businessHours || specialHours || timezone);
  const hasGallery = galleryUrls.length > 0;
  const hasBooking = !!bookingEnabled && !!bookingUrl;
  const hasFaq = faqList.length > 0;
  const hasTestimonials = testimonialsList.length > 0;
  const hasTeam = teamList.length > 0;
  const hasCertifications = certificationsList.length > 0;

  const navLinks: { href: string; label: string }[] = [];
  if (hasAbout) navLinks.push({ href: "#about", label: aboutSectionTitle });
  if (hasServices) navLinks.push({ href: "#services", label: servicesSectionTitle });
  if (hasContact) navLinks.push({ href: "#contact", label: contactSectionTitle });
  if (hasHours) navLinks.push({ href: "#hours", label: hoursSectionTitle });
  if (hasGallery) navLinks.push({ href: "#gallery", label: gallerySectionTitle });
  if (hasBooking) navLinks.push({ href: "#booking", label: "Book" });
  if (hasFaq) navLinks.push({ href: "#faq", label: faqSectionTitle });
  if (hasTestimonials) navLinks.push({ href: "#testimonials", label: testimonialsSectionTitle });
  if (hasTeam) navLinks.push({ href: "#team", label: teamSectionTitle });
  if (hasCertifications) navLinks.push({ href: "#certifications", label: certificationsSectionTitle });
  navLinks.push({ href: "#contact-form", label: contactFormSectionTitle || "Contact" });

  const inner = (
    <>
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className={`mx-auto max-w-4xl px-4 py-3 sm:px-6 ${layoutId === "minimal" ? "max-w-3xl" : ""}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element -- dynamic user URL
                <img src={logo} alt="" className="h-10 max-h-10 w-auto flex-shrink-0 object-contain" width={logoDim.width} height={logoDim.height} />
              ) : null}
              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">{businessName}</h1>
                {tagline ? <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">{tagline}</p> : null}
              </div>
              {businessTypeLabel ? (
                <span className="hidden sm:inline-flex flex-shrink-0 items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                  {businessTypeLabel}
                </span>
              ) : null}
            </div>
            {navLinks.length > 0 ? (
              <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" aria-label="Main navigation">
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} className="text-gray-700 hover:text-gray-900 underline-offset-2 hover:underline whitespace-nowrap">
                    {link.label}
                  </a>
                ))}
              </nav>
            ) : null}
          </div>
        </div>
      </header>
      {heroImage ? (
        <div className={`w-full overflow-hidden bg-gray-100 ${layout.heroAspect}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImage} alt="" className="h-full w-full object-cover" width={heroDim.width} height={heroDim.height} />
        </div>
      ) : null}
      <div id="main-content" className={layout.contentPad}>
        {shortDesc ? (
          <p className={`text-lg text-gray-700 leading-relaxed sm:text-xl ${layoutId === "minimal" ? "text-base" : ""}`}>
            {shortDesc}
          </p>
        ) : null}
        {(hasCta || hasCta2 || hasCta3) ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {hasCta ? (
              <a href={ctaUrl} className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2" target="_blank" rel="noopener noreferrer">
                {ctaLabel}
              </a>
            ) : null}
            {hasCta2 ? (
              <a href={cta2Url} className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2" target="_blank" rel="noopener noreferrer">
                {cta2Label}
              </a>
            ) : null}
            {hasCta3 ? (
              <a href={cta3Url} className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2" target="_blank" rel="noopener noreferrer">
                {cta3Label}
              </a>
            ) : null}
          </div>
        ) : null}
        {(about || yearEstablished || priceRange) ? (
          <section id="about" className={layout.sectionMt}>
            <h2 className={layout.headingClass}>{aboutSectionTitle}</h2>
            {yearEstablished ? <p className={`mt-2 ${layout.bodyClass}`}>{yearEstablished}</p> : null}
            {priceRange ? <p className={`mt-2 ${layout.bodyClass}`}>Price range: {priceRange}</p> : null}
            {about ? <p className={`mt-3 ${layout.bodyClass}`}>{about}</p> : null}
          </section>
        ) : null}
        {servicesList.length > 0 ? (
          <section id="services" className={`${layout.sectionMt} border-t border-gray-100 pt-10`}>
            <h2 className={layout.headingClass}>{servicesSectionTitle}</h2>
            {servicesIntro ? <p className={`mt-2 ${layout.bodyClass}`}>{servicesIntro}</p> : null}
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {servicesList.map((s, i) => (
                <li key={i} className={layout.cardClass}>
                  {s.image ? (
                    <div className="mb-2 aspect-[4/3] w-full max-w-[240px] overflow-hidden rounded-lg bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element -- dynamic user URL */}
                      <img src={s.image} alt="" className="h-full w-full object-cover" loading="lazy" width={serviceDim.width} height={serviceDim.height} />
                    </div>
                  ) : null}
                  {s.category ? <span className="text-xs font-medium uppercase text-gray-500">{s.category}</span> : null}
                  <span className="font-medium">{s.name}</span>
                  {s.description ? <p className="mt-1 text-sm text-gray-600">{s.description}</p> : null}
                  {(s.duration || s.price) ? (
                    <p className="mt-1 text-sm text-gray-500">{[s.duration, s.price].filter(Boolean).join(" · ")}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {(address || addressLocality || addressRegion || postalCode || country || areaServed || addressDescription || locationName || serviceAreaRegions || phone || phone2 || email || email2 || whatsApp || paymentMethods || parking || accessibilityWheelchair || serviceOptions || languagesSpoken || otherAmenities) ? (
          <section id="contact" className={`${layout.sectionMt} border-t border-gray-100 pt-10`}>
            <h2 className={layout.headingClass}>{contactSectionTitle}</h2>
            <ul className={`mt-4 space-y-2 ${layout.bodyClass}`}>
              {locationName ? <li className="font-medium text-gray-900">{locationName}</li> : null}
              {!serviceAreaOnly ? (
                <>
                  {address ? <li>{address}</li> : null}
                  {(addressLocality || addressRegion || postalCode) ? (
                    <li>
                      {[addressLocality, addressRegion, postalCode].filter(Boolean).join(", ")}
                    </li>
                  ) : null}
                  {country ? <li>{country}</li> : null}
                </>
              ) : null}
              {serviceAreaOnly && serviceAreaRegions ? (
                <li className="text-gray-600">Serves: {serviceAreaRegions}</li>
              ) : null}
              {addressDescription ? <li className="text-gray-600">{addressDescription}</li> : null}
              {areaServed ? <li className="text-gray-600">{areaServed}</li> : null}
              {showMapLink && mapQuery ? (
                <li>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                    {directionsLabel}
                  </a>
                </li>
              ) : null}
              {mapEmbedUrl ? (
                <li className="mt-2">
                  <iframe src={mapEmbedUrl} width="100%" height="200" style={{ maxWidth: 560, border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Map" />
                </li>
              ) : null}
              {contactPreference ? <li className="text-gray-600">Preferred: {contactPreference}</li> : null}
              {phone ? <li>Phone: <a href={`tel:${encodeURIComponent(phone)}`} className="text-blue-600 underline hover:text-blue-800">{phone}</a></li> : null}
              {phone2 ? <li>Phone 2: <a href={`tel:${encodeURIComponent(phone2)}`} className="text-blue-600 underline hover:text-blue-800">{phone2}</a></li> : null}
              {email ? <li>Email: <a href={`mailto:${encodeURIComponent(email)}`} className="text-blue-600 underline hover:text-blue-800">{email}</a></li> : null}
              {email2 ? <li>Email 2: <a href={`mailto:${encodeURIComponent(email2)}`} className="text-blue-600 underline hover:text-blue-800">{email2}</a></li> : null}
              {whatsApp ? (
                <li>
                  <a href={whatsApp.startsWith("http") ? whatsApp : `https://wa.me/${whatsApp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                    Chat on WhatsApp
                  </a>
                </li>
              ) : null}
              {paymentMethods ? <li className="text-gray-600">{paymentMethods}</li> : null}
              {parking ? <li className="text-gray-600">Parking: {parking}</li> : null}
              {accessibilityWheelchair ? <li className="text-gray-600">Accessibility: {accessibilityWheelchair}</li> : null}
              {serviceOptions ? <li className="text-gray-600">Service options: {serviceOptions}</li> : null}
              {languagesSpoken ? <li className="text-gray-600">Languages: {languagesSpoken}</li> : null}
              {otherAmenities ? <li className="text-gray-600">{otherAmenities}</li> : null}
            </ul>
          </section>
        ) : null}
        {socialLinks.length > 0 ? <SocialLinksSection links={socialLinks} /> : null}
        {(businessHours || specialHours || timezone) ? (
          <section id="hours" className={`${layout.sectionMt} border-t border-gray-100 pt-10`}>
            <h2 className={layout.headingClass}>{hoursSectionTitle}</h2>
            {openStatus !== null ? (
              <p className="mt-1">
                <span className={openStatus.open ? "inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800" : "inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-700"}>
                  {openStatus.open ? "Open now" : "Closed"}
                </span>
              </p>
            ) : null}
            {timezone ? <p className="mt-1 text-sm text-gray-500">All times in {timezone.replace(/_/g, " ")}</p> : null}
            <ul className="mt-2 space-y-1 text-gray-700">
              {businessHours ? <li>{businessHours}</li> : null}
              {specialHours ? <li className="text-gray-600">{specialHours}</li> : null}
            </ul>
          </section>
        ) : null}
        {galleryUrls.length > 0 ? (
          <section id="gallery" className={`${layout.sectionMt} border-t border-gray-100 pt-10`}>
            <h2 className={layout.headingClass}>{gallerySectionTitle}</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {galleryUrls.map((url, i) => (
                <figure key={i} className="overflow-hidden rounded-lg">
                  <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element -- dynamic user URL */}
                    <img src={url} alt={galleryCaptions[i] ?? ""} className="h-full w-full object-cover" width={galleryDim.width} height={galleryDim.height} />
                  </div>
                  {galleryCaptions[i] ? <figcaption className="mt-1 truncate text-xs text-gray-500">{galleryCaptions[i]}</figcaption> : null}
                </figure>
              ))}
            </div>
          </section>
        ) : null}
        {youtubeUrls.length > 0 ? (
          <section className={`${layout.sectionMt} border-t border-gray-100 pt-10`}>
            <h2 className={layout.headingClass}>{videosSectionTitle}</h2>
            <div className="mt-2 space-y-4">
              {youtubeUrls.map((url, i) => {
                const id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
                if (!id) return null;
                return (
                  <div key={i} className="aspect-video w-full max-w-2xl overflow-hidden rounded-lg">
                    <iframe src={`https://www.youtube.com/embed/${id}`} title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="h-full w-full" />
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
        {otherVideoEmbeds.length > 0 ? (
          <section className={`${layout.sectionMt} border-t border-gray-100 pt-10`}>
            <h2 className={layout.headingClass}>{otherVideosSectionTitle}</h2>
            <div className="mt-2 space-y-4">
              {otherVideoEmbeds.map((item, i) =>
                item.embedSrc ? (
                  <div key={i} className="aspect-video w-full max-w-2xl overflow-hidden rounded-lg">
                    <iframe src={item.embedSrc} title="Video" allow="fullscreen" allowFullScreen className="h-full w-full" />
                  </div>
                ) : (
                  <p key={i}>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">{item.url}</a>
                  </p>
                )
              )}
            </div>
          </section>
        ) : null}
        {bookingEnabled ? (
          <section id="booking" className={`${layout.sectionMt} border-t border-gray-100 pt-10`}>
            <h2 className={layout.headingClass}>Book online</h2>
            <p className={`mt-2 ${layout.bodyClass}`}>
              {bookingSlotDuration ? `Slot duration: ${bookingSlotDuration}. ` : null}
              {bookingLeadTime ?? ""}
            </p>
            {bookingUrl ? (
              <p className="mt-4">
                <a href={bookingUrl} className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2" target="_blank" rel="noopener noreferrer">
                  Book now
                </a>
              </p>
            ) : null}
          </section>
        ) : null}
        {faqList.length > 0 ? (
          <section id="faq" className={`${layout.sectionMt} border-t border-gray-100 pt-10`}>
            <h2 className={layout.headingClass}>{faqSectionTitle}</h2>
            {faqAsAccordion ? (
              <div className="mt-2 space-y-2">
                {faqList.map((faq, i) => (
                  <details key={i} className={layout.cardClass}>
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
          <section id="testimonials" className={`${layout.sectionMt} border-t border-gray-100 pt-10`}>
            <h2 className={layout.headingClass}>{testimonialsSectionTitle}</h2>
            <div className="mt-2 space-y-4">
              {testimonialsList.map((t, i) => (
                <blockquote key={i} className={layout.cardClass}>
                  {t.photo ? (
                    <div className="mb-2 h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element -- dynamic user URL */}
                      <img src={t.photo} alt="" className="h-full w-full object-cover" width={testimonialDim.width} height={testimonialDim.height} />
                    </div>
                  ) : null}
                  <p className="text-gray-700">{t.quote}</p>
                  {t.author ? <footer className="mt-2 text-sm text-gray-500">— {t.author}</footer> : null}
                  {t.rating ? <p className="mt-1 text-sm text-amber-600">{t.rating}</p> : null}
                </blockquote>
              ))}
            </div>
          </section>
        ) : null}
        {teamList.length > 0 ? (
          <section id="team" className={`${layout.sectionMt} border-t border-gray-100 pt-10`}>
            <h2 className={layout.headingClass}>{teamSectionTitle}</h2>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              {teamList.map((m, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4">
                  {m.photo ? (
                    <div className="mb-2 h-24 w-24 shrink-0 overflow-hidden rounded-full bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element -- dynamic user URL */}
                      <img src={m.photo} alt="" className="h-full w-full object-cover" width={teamDim.width} height={teamDim.height} />
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
        {certificationsList.length > 0 ? (
          <section id="certifications" className={`${layout.sectionMt} border-t border-gray-100 pt-10`}>
            <h2 className={layout.headingClass}>{certificationsSectionTitle}</h2>
            <div className="mt-2 flex flex-wrap gap-4">
              {certificationsList.map((c, i) => (
                <div key={i} className="flex flex-col items-start rounded-lg border border-gray-200 p-4">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- dynamic user URL
                    <img src={c.image} alt="" className="h-16 max-h-16 w-auto object-contain" width={certDim.width} height={certDim.height} />
                  ) : null}
                  {c.title ? <p className="mt-2 text-sm font-medium text-gray-900">{c.title}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}
        {shareSectionTitle ? (
          <section className={`${layout.sectionMt} border-t border-gray-100 pt-10`}>
            <h2 className={layout.headingClass}>{shareSectionTitle}</h2>
            <p className="mt-1 text-sm text-gray-600">Share this page</p>
            <ul className="mt-2 flex flex-wrap gap-3">
              <li>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalForShare)}&text=${encodeURIComponent(businessName)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Twitter</a>
              </li>
              <li>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalForShare)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Facebook</a>
              </li>
              <li>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalForShare)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">LinkedIn</a>
              </li>
            </ul>
          </section>
        ) : null}
        <section id="contact-form" className={`${layout.sectionMt} border-t border-gray-100 pt-10`}>
          {contactFormSectionTitle ? <h2 className={layout.headingClass}>{contactFormSectionTitle}</h2> : null}
          <ContactForm siteSlug={siteSlug} successMessage={contactFormSuccessMessage || undefined} />
        </section>
        {hasNewsletter ? (
          <section className={`${layout.sectionMt} border-t border-gray-100 pt-10`}>
            <h2 className={layout.headingClass}>Newsletter</h2>
            {newsletterLabel ? <p className="mt-1 text-sm text-gray-600">{newsletterLabel}</p> : null}
            {newsletterUrl ? (
              <p className="mt-2">
                <a href={newsletterUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Sign up</a>
              </p>
            ) : null}
          </section>
        ) : null}
        {showBackToTop ? (
          <p className="mt-6 text-center">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Back to top</a>
          </p>
        ) : null}
        <footer className="mt-12 border-t border-gray-200 bg-gray-50 px-4 py-6 sm:px-6">
          <div className={`mx-auto max-w-4xl text-sm text-gray-600 ${layoutId === "minimal" ? "max-w-3xl" : ""}`}>
            {socialLinks.length > 0 ? (
              <div className="mb-4">
                <SocialLinksSection links={socialLinks} />
              </div>
            ) : null}
            {footerText ? <p className="mb-2">{footerText}</p> : null}
            {customDomainDisplay ? <p className="mb-2">{customDomainDisplay}</p> : null}
            {legalName ? <p className="mb-2">Legal name: {legalName}</p> : null}
            <p className="mt-4 pt-4 border-t border-gray-200 text-gray-500">
              © {new Date().getFullYear()} {businessName || "Site"}. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 rounded bg-gray-900 px-3 py-2 text-white text-sm">
        Skip to content
      </a>
      {previewBanner}
      {/* Top banner: always visible, full width; use announcement text or default welcome */}
      <div className="bg-gray-900 text-white text-center py-2 px-4 text-sm">
        {announcementBar ? announcementBar : `Welcome to ${businessName || "our site"}`}
      </div>
      {layout.contentWrap ? <div className={layout.contentWrap}>{inner}</div> : inner}
    </main>
  );
}
