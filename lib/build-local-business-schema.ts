/**
 * Builds LocalBusiness JSON-LD for published sites (v1.1 SEO).
 * Helps search engines understand business details for rich results and local SEO.
 * @see https://schema.org/LocalBusiness
 */

/** Testimonial with optional rating string (e.g. "5", "4.5 stars") for aggregateRating */
export type TestimonialForSchema = { rating?: string };

export type LocalBusinessSchemaInput = {
  name: string;
  description?: string;
  url: string;
  /** Single image URL or array for schema.org image */
  image?: string | string[];
  address?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
  telephone?: string;
  email?: string;
  openingHours?: string;
  /** Same-as / social profile URLs for LocalBusiness.sameAs (schema.org) */
  sameAs?: string[];
  /** Price range e.g. "$$" (schema.org) */
  priceRange?: string;
  /** Testimonials with optional rating; used to build aggregateRating when present */
  testimonials?: TestimonialForSchema[];
};

/**
 * Returns a LocalBusiness schema object suitable for JSON-LD.
 * Only includes properties that have values.
 */
export function buildLocalBusinessSchema(
  input: LocalBusinessSchemaInput
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: input.name,
    url: input.url,
  };

  if (input.description?.trim()) {
    schema.description = input.description.trim();
  }

  if (Array.isArray(input.image)) {
    const urls = input.image.filter((u): u is string => typeof u === "string" && u.trim().length > 0).map((u) => u.trim());
    if (urls.length > 0) schema.image = urls.length === 1 ? urls[0] : urls;
  } else if (input.image && typeof input.image === "string" && input.image.trim()) {
    schema.image = input.image.trim();
  }

  if (input.telephone?.trim()) {
    schema.telephone = input.telephone.trim();
  }

  if (input.email?.trim()) {
    schema.email = input.email.trim();
  }

  if (input.address?.trim() || input.addressCountry?.trim() || input.addressLocality?.trim() || input.addressRegion?.trim() || input.postalCode?.trim()) {
    const address: Record<string, string> = {
      "@type": "PostalAddress",
    };
    if (input.address?.trim()) address.streetAddress = input.address.trim();
    if (input.addressLocality?.trim()) address.addressLocality = input.addressLocality.trim();
    if (input.addressRegion?.trim()) address.addressRegion = input.addressRegion.trim();
    if (input.postalCode?.trim()) address.postalCode = input.postalCode.trim();
    if (input.addressCountry?.trim()) address.addressCountry = input.addressCountry.trim();
    schema.address = address;
  }

  if (input.openingHours?.trim()) {
    schema.openingHours = input.openingHours.trim();
  }

  const sameAs = input.sameAs?.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
  if (sameAs?.length) {
    schema.sameAs = sameAs.map((u) => u.trim());
  }

  if (input.priceRange?.trim()) {
    schema.priceRange = input.priceRange.trim();
  }

  const aggregate = buildAggregateRatingFromTestimonials(input.testimonials);
  if (aggregate) {
    schema.aggregateRating = aggregate;
  }

  return schema;
}

/** Parse rating strings (e.g. "5", "4.5", "4 stars") to number; return undefined if not a valid 0–5 value. */
function parseRatingValue(s: string): number | undefined {
  const trimmed = s.trim();
  const num = parseFloat(trimmed.replace(/\s*stars?$/i, "").trim());
  if (Number.isNaN(num) || num < 0 || num > 5) return undefined;
  return num;
}

/**
 * Builds schema.org AggregateRating from testimonials that have a rating.
 * Only included when at least one testimonial has a parseable rating.
 */
export function buildAggregateRatingFromTestimonials(
  testimonials?: TestimonialForSchema[]
): { "@type": string; ratingValue: number; bestRating?: number; reviewCount: number } | undefined {
  if (!Array.isArray(testimonials) || testimonials.length === 0) return undefined;
  const values: number[] = [];
  for (const t of testimonials) {
    if (t?.rating && typeof t.rating === "string") {
      const v = parseRatingValue(t.rating);
      if (v !== undefined) values.push(v);
    }
  }
  if (values.length === 0) return undefined;
  const sum = values.reduce((a, b) => a + b, 0);
  const ratingValue = Math.round((sum / values.length) * 10) / 10;
  return {
    "@type": "AggregateRating",
    ratingValue,
    bestRating: 5,
    reviewCount: values.length,
  };
}

/**
 * Returns the JSON-LD script body (escaped for safe embedding in HTML).
 */
export function buildLocalBusinessJsonLdScript(input: LocalBusinessSchemaInput): string {
  const schema = buildLocalBusinessSchema(input);
  return JSON.stringify(schema);
}
