import type { BusinessType } from "@/lib/types/site";

/**
 * Placeholder image URLs for seed/assisted content. Uses Picsum Photos (https://picsum.photos)
 * with seeds so each site type gets consistent, free stock-style images. Replace with real
 * uploads or your own CDN in production.
 */
const PICSUM_BASE = "https://picsum.photos/seed";

function url(seed: string, width: number, height: number): string {
  return `${PICSUM_BASE}/${seed}/${width}/${height}`;
}

export type PlaceholderImages = {
  hero: string;
  gallery: string[];
  logo: string;
  /** For services (e.g. first 4); use index to pick. */
  serviceImages: string[];
  /** For team members (e.g. first 2); use index to pick. */
  teamImages: string[];
};

const GALLERY_COUNT = 3;
const SERVICE_IMAGE_COUNT = 4;
const TEAM_IMAGE_COUNT = 2;
const HERO_WIDTH = 1200;
const HERO_HEIGHT = 600;
const GALLERY_WIDTH = 800;
const GALLERY_HEIGHT = 600;
const LOGO_SIZE = 200;
const SERVICE_SIZE = 600;
const TEAM_SIZE = 400;

/**
 * Returns placeholder image URLs for the given site type. Same type always gets the same images.
 * Uses Picsum Photos (free, no key required). Replace with real uploads in production.
 */
export function getPlaceholderImages(businessType: BusinessType): PlaceholderImages {
  const seed = businessType;
  const gallery: string[] = [];
  for (let i = 1; i <= GALLERY_COUNT; i++) {
    gallery.push(url(`gallery-${seed}-${i}`, GALLERY_WIDTH, GALLERY_HEIGHT));
  }
  const serviceImages: string[] = [];
  for (let i = 1; i <= SERVICE_IMAGE_COUNT; i++) {
    serviceImages.push(url(`service-${seed}-${i}`, SERVICE_SIZE, SERVICE_SIZE));
  }
  const teamImages: string[] = [];
  for (let i = 1; i <= TEAM_IMAGE_COUNT; i++) {
    teamImages.push(url(`team-${seed}-${i}`, TEAM_SIZE, TEAM_SIZE));
  }
  return {
    hero: url(`hero-${seed}`, HERO_WIDTH, HERO_HEIGHT),
    gallery,
    logo: url(`logo-${seed}`, LOGO_SIZE, LOGO_SIZE),
    serviceImages,
    teamImages,
  };
}
