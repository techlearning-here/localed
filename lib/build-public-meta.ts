import type { Metadata } from "next";

const DEFAULT_DESCRIPTION_MAX_LENGTH = 160;

/**
 * Builds Next.js Metadata for a published public site (PUBLIC-03).
 * Used so shared links (WhatsApp, Twitter, Facebook) show title, description, and image.
 */
export function buildPublicSiteMetadata(
  content: Record<string, unknown>,
  slug: string,
  baseUrl: string
): Metadata {
  const businessName =
    typeof content.businessName === "string" && content.businessName.trim()
      ? content.businessName.trim()
      : slug;
  const shortDescription =
    typeof content.shortDescription === "string"
      ? content.shortDescription.trim().slice(0, DEFAULT_DESCRIPTION_MAX_LENGTH)
      : "";
  const heroImage =
    typeof content.heroImage === "string" && content.heroImage.trim()
      ? content.heroImage.trim()
      : "";
  const logo =
    typeof content.logo === "string" && content.logo.trim()
      ? content.logo.trim()
      : "";
  const ogImage = heroImage || logo || undefined;
  const canonicalUrl = baseUrl
    ? `${baseUrl.replace(/\/$/, "")}/${slug}`
    : undefined;

  const metadata: Metadata = {
    title: businessName,
    description: shortDescription || undefined,
    openGraph: {
      title: businessName,
      description: shortDescription || undefined,
      url: canonicalUrl,
      ...(ogImage && {
        images: [{ url: ogImage }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: businessName,
      description: shortDescription || undefined,
      ...(ogImage && { images: [ogImage] }),
    },
    ...(canonicalUrl && {
      alternates: { canonical: canonicalUrl },
    }),
  };

  return metadata;
}
