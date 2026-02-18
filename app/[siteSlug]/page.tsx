import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { ContactForm } from "@/components/contact-form";
import { buildPublicSiteMetadata } from "@/lib/build-public-meta";
import { getCountryLabel } from "@/lib/countries";
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
  if (cdnUrl) redirect(cdnUrl);
  if (!site.published_content) notFound();

  const locale = site.languages?.[0] ?? "en";
  const content = site.published_content[locale] ?? site.published_content.en ?? {};
  const businessName =
    String(content.businessName || "") || (site.slug ?? "Site");
  const logo = typeof content.logo === "string" ? content.logo : "";
  const shortDesc = typeof content.shortDescription === "string" ? content.shortDescription : "";
  const about = typeof content.about === "string" ? content.about : "";
  const yearEstablished = typeof content.yearEstablished === "string" ? content.yearEstablished : "";
  const address = typeof content.address === "string" ? content.address : "";
  const countryCode = typeof content.country === "string" ? content.country : (site.country ?? "");
  const country = countryCode ? getCountryLabel(countryCode) : "";
  const areaServed = typeof content.areaServed === "string" ? content.areaServed : "";
  const phone = typeof content.phone === "string" ? content.phone : "";
  const email = typeof content.email === "string" ? content.email : "";
  const whatsApp = typeof content.whatsApp === "string" ? content.whatsApp : "";
  const businessHours = typeof content.businessHours === "string" ? content.businessHours : "";
  const specialHours = typeof content.specialHours === "string" ? content.specialHours : "";
  const timezone = typeof content.timezone === "string" ? content.timezone : "";
  const heroImage = typeof content.heroImage === "string" ? content.heroImage : "";
  const galleryUrls = Array.isArray(content.galleryUrls) ? content.galleryUrls.filter((u): u is string => typeof u === "string") : [];
  const youtubeUrls = Array.isArray(content.youtubeUrls) ? content.youtubeUrls.filter((u): u is string => typeof u === "string") : [];

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="border-b p-4 flex items-center gap-3">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- dynamic user URL
          <img src={logo} alt="" className="h-10 w-auto object-contain" />
        ) : null}
        <h1 className="text-xl font-semibold">{businessName}</h1>
      </header>
      {heroImage ? (
        <div className="w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImage} alt="" className="h-48 w-full object-cover md:h-64" />
        </div>
      ) : null}
      <div className="p-6">
        {shortDesc ? (
          <p className="text-gray-600">{shortDesc}</p>
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
        {(address || country || areaServed || phone || email || whatsApp) ? (
          <section className="mt-6">
            <h2 className="text-lg font-medium">Contact</h2>
            <ul className="mt-2 space-y-1 text-gray-700">
              {address ? <li>{address}</li> : null}
              {country ? <li>{country}</li> : null}
              {areaServed ? <li className="text-gray-600">{areaServed}</li> : null}
              {phone ? <li>Phone: {phone}</li> : null}
              {email ? <li>Email: {email}</li> : null}
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
            </ul>
          </section>
        ) : null}
        {(businessHours || specialHours || timezone) ? (
          <section className="mt-6">
            <h2 className="text-lg font-medium">Hours</h2>
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
                // eslint-disable-next-line @next/next/no-img-element -- dynamic user URL
                <img key={i} src={url} alt="" className="aspect-square w-full rounded-lg object-cover" />
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
        <ContactForm siteSlug={siteSlug} />
      </div>
    </main>
  );
}
