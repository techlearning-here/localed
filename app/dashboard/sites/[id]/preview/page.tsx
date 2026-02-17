"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCountryLabel } from "@/lib/countries";
import type { LocaledSite } from "@/lib/types/site";

export default function PreviewSitePage() {
  const params = useParams();
  const id = params.id as string;
  const [site, setSite] = useState<LocaledSite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/dashboard/sites/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setSite)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading preview…</p>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-red-600">Site not found</p>
      </div>
    );
  }

  const locale = site.languages?.[0] ?? "en";
  const content = (site.draft_content?.[locale] ?? site.draft_content?.en ?? {}) as Record<string, unknown>;
  const businessName = (content.businessName as string) || site.slug || "Site";
  const logo = (content.logo as string) ?? "";
  const heroImage = typeof content.heroImage === "string" ? content.heroImage : "";
  const galleryUrls = Array.isArray(content.galleryUrls) ? content.galleryUrls.filter((u): u is string => typeof u === "string") : [];
  const youtubeUrls = Array.isArray(content.youtubeUrls) ? content.youtubeUrls.filter((u): u is string => typeof u === "string") : [];

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="border-b border-amber-400 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
        Preview — draft content only. Publish to go live.
      </div>
      <header className="border-b p-4 flex items-center gap-3">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- dynamic user URL
          <img src={logo} alt="" className="h-10 w-auto object-contain" />
        ) : null}
        <h1 className="text-xl font-semibold">{businessName}</h1>
      </header>
      {heroImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- dynamic user URL
        <img src={heroImage} alt="" className="h-48 w-full object-cover md:h-64" />
      ) : null}
      <div className="p-6">
        {content.shortDescription ? (
          <p className="text-gray-600">{String(content.shortDescription)}</p>
        ) : null}
        {(content.about || content.yearEstablished) ? (
          <section className="mt-6">
            <h2 className="text-lg font-medium">About</h2>
            {content.yearEstablished ? (
              <p className="mt-2 text-sm text-gray-600">{String(content.yearEstablished)}</p>
            ) : null}
            {content.about ? <p className="mt-2 text-gray-700">{String(content.about)}</p> : null}
          </section>
        ) : null}
        {content.address || content.country || content.areaServed || content.phone || content.email || content.whatsApp ? (
          <section className="mt-6">
            <h2 className="text-lg font-medium">Contact</h2>
            <ul className="mt-2 space-y-1 text-gray-700">
              {content.address ? <li>{String(content.address)}</li> : null}
              {content.country ? <li>{getCountryLabel(String(content.country))}</li> : null}
              {content.areaServed ? <li className="text-gray-600">{String(content.areaServed)}</li> : null}
              {content.phone ? <li>Phone: {String(content.phone)}</li> : null}
              {content.email ? <li>Email: {String(content.email)}</li> : null}
              {content.whatsApp ? (
                <li>
                  <a
                    href={String(content.whatsApp).startsWith("http") ? String(content.whatsApp) : `https://wa.me/${String(content.whatsApp).replace(/\D/g, "")}`}
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
        {content.businessHours || content.specialHours || content.timezone ? (
          <section className="mt-6">
            <h2 className="text-lg font-medium">Hours</h2>
            {content.timezone ? (
              <p className="mt-1 text-sm text-gray-500">All times in {String(content.timezone).replace(/_/g, " ")}</p>
            ) : null}
            <ul className="mt-2 space-y-1 text-gray-700">
              {content.businessHours ? <li>{String(content.businessHours)}</li> : null}
              {content.specialHours ? (
                <li className="text-gray-600">{String(content.specialHours)}</li>
              ) : null}
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
      </div>
    </main>
  );
}
