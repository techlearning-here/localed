import Link from "next/link";
import { notFound } from "next/navigation";
import { getCountryLabel } from "@/lib/countries";
import { getSiteByIdForAdmin } from "@/lib/sites";
import type { SiteContent } from "@/lib/types/site";

function contentFrom(site: { published_content: SiteContent | null; draft_content: SiteContent; languages: string[] }) {
  const locale = site.languages?.[0] ?? "en";
  const content =
    site.published_content?.[locale] ?? site.published_content?.en ?? site.draft_content?.[locale] ?? site.draft_content?.en ?? {};
  return { locale, content };
}

/**
 * Admin-only: view a site by id (including archived). Renders like public page with a banner; no contact form for archived.
 */
export default async function AdminViewSitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await getSiteByIdForAdmin(id);
  if (!site) notFound();

  const { content } = contentFrom(site);
  const businessName = String(content.businessName || "") || site.slug || "Site";
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
  const isArchived = !!site.archived_at;

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {isArchived && (
        <div className="border-b border-amber-400 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
          Archived site — admin view only. End users cannot see this.
        </div>
      )}
      <header className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logo ? (
            <img src={logo} alt="" className="h-10 w-auto object-contain" />
          ) : null}
          <h1 className="text-xl font-semibold">{businessName}</h1>
        </div>
        <Link href="/admin/sites" className="text-sm text-gray-600 underline hover:text-gray-900">
          ← Back to sites
        </Link>
      </header>
      {heroImage ? (
        <img src={heroImage} alt="" className="h-48 w-full object-cover md:h-64" />
      ) : null}
      <div className="p-6">
        {shortDesc ? <p className="text-gray-600">{shortDesc}</p> : null}
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
        {!isArchived && site.published_at && (
          <p className="mt-6 text-sm text-gray-500">
            This site is live at /{site.slug}. Contact form is on the public page.
          </p>
        )}
      </div>
    </main>
  );
}
