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
  const tagline =
    typeof content.tagline === "string" ? content.tagline.trim() : "";
  const shortDescription =
    typeof content.shortDescription === "string"
      ? content.shortDescription.trim().slice(0, DEFAULT_DESCRIPTION_MAX_LENGTH)
      : "";
  const metaTitleRaw =
    typeof content.metaTitle === "string" ? content.metaTitle.trim() : "";
  const metaDescriptionRaw =
    typeof content.metaDescription === "string"
      ? content.metaDescription.trim().slice(0, DEFAULT_DESCRIPTION_MAX_LENGTH)
      : "";
  const defaultTitle = tagline ? `${businessName} — ${tagline}` : businessName;
  const title = metaTitleRaw || defaultTitle;
  const description = metaDescriptionRaw || shortDescription || undefined;
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

  const keywordsVal =
    typeof content.keywords === "string" ? content.keywords.trim() : "";
  const metadata: Metadata = {
    title,
    description,
    ...(keywordsVal && { keywords: keywordsVal }),
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      ...(ogImage && {
        images: [{ url: ogImage }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
    ...(canonicalUrl && {
      alternates: { canonical: canonicalUrl },
    }),
  };

  return metadata;
}
