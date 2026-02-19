/**
 * Recommended image dimensions for the predefined site templates.
 * Shown in the editor so users can upload or link images that display well.
 * Aligned with placeholder sizes (placeholder-images.ts) and display aspect ratios.
 */

export type ImageRole =
  | "hero"
  | "gallery"
  | "logo"
  | "favicon"
  | "service"
  | "team"
  | "testimonial"
  | "certification";

export type ImageDimension = {
  width: number;
  height: number;
  /** Short label for UI, e.g. "1200 × 600 px" */
  label: string;
  /** Optional note (aspect ratio or usage hint) */
  note?: string;
};

const DIMENSIONS: Record<ImageRole, ImageDimension> = {
  hero: {
    width: 1200,
    height: 600,
    label: "1200 × 600 px",
    note: "Wide banner (2:1); displayed with 21:9 aspect on site.",
  },
  gallery: {
    width: 800,
    height: 800,
    label: "800 × 800 px",
    note: "Square; displayed as square thumbnails.",
  },
  logo: {
    width: 200,
    height: 200,
    label: "200 × 200 px",
    note: "Square or landscape; max height 40px on site.",
  },
  favicon: {
    width: 32,
    height: 32,
    label: "32 × 32 px",
    note: "Small icon for browser tab; 64×64 also works.",
  },
  service: {
    width: 400,
    height: 300,
    label: "400 × 300 px",
    note: "4:3 aspect; displayed as a compact thumbnail in What we offer.",
  },
  team: {
    width: 400,
    height: 400,
    label: "400 × 400 px",
    note: "Square; displayed as a circle.",
  },
  testimonial: {
    width: 200,
    height: 200,
    label: "200 × 200 px",
    note: "Square; displayed as a small circle.",
  },
  certification: {
    width: 128,
    height: 128,
    label: "128 × 128 px",
    note: "Badge or logo; max height 64px on site.",
  },
};

/**
 * Returns the recommended dimension for an image role (for editor hints).
 */
export function getRecommendedImageDimension(role: ImageRole): ImageDimension {
  return DIMENSIONS[role];
}

/**
 * Returns short helper text for the editor, e.g. "Recommended: 1200 × 600 px".
 */
export function getRecommendedDimensionHint(role: ImageRole): string {
  const d = DIMENSIONS[role];
  return `Recommended: ${d.label}`;
}
