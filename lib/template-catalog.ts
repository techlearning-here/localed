import type { BusinessType } from "@/lib/types/site";

export type TemplateExtraField = {
  key: string;
  label: string;
  type?: "text" | "textarea";
  placeholder?: string;
};

/** Drives section order and wrapper styling on the published site (TEMPLATES_GOOD_AS_COMPETITORS Phase 2). */
export type LayoutId = "default" | "classic" | "minimal";

export type TemplateDefinition = {
  id: string;
  businessType: BusinessType;
  label: string;
  /** One-line description for the template picker (Phase 1). */
  description?: string;
  /** Layout variant: default = full-width hero + current sections; classic = contained + 16/9 hero; minimal = compact. */
  layoutId: LayoutId;
  /** Optional thumbnail for picker (Phase 1). */
  previewImageUrl?: string;
  extraFields?: TemplateExtraField[];
};

const MODERN_DESCRIPTION = "Clean layout with full-width hero and clear sections. Best for a contemporary look.";
const CLASSIC_DESCRIPTION = "Contained width with a focused hero and bordered sections. Traditional and easy to read.";

/**
 * MVP: exactly 2 templates per business type.
 * Each template has layoutId (default | classic), description, and optional previewImageUrl.
 */
const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  { id: "salon-modern", businessType: "salon", label: "Modern", description: MODERN_DESCRIPTION, layoutId: "default" },
  {
    id: "salon-classic",
    businessType: "salon",
    label: "Classic",
    description: CLASSIC_DESCRIPTION,
    layoutId: "classic",
    extraFields: [
      { key: "servicesIntro", label: "Services section intro", type: "textarea", placeholder: "e.g. What we offer" },
    ],
  },
  { id: "clinic-modern", businessType: "clinic", label: "Modern", description: MODERN_DESCRIPTION, layoutId: "default" },
  {
    id: "clinic-classic",
    businessType: "clinic",
    label: "Classic",
    description: CLASSIC_DESCRIPTION,
    layoutId: "classic",
    extraFields: [
      { key: "specialtiesIntro", label: "Specialties intro", type: "text", placeholder: "e.g. Our focus areas" },
    ],
  },
  { id: "repair-modern", businessType: "repair", label: "Modern", description: MODERN_DESCRIPTION, layoutId: "default" },
  { id: "repair-classic", businessType: "repair", label: "Classic", description: CLASSIC_DESCRIPTION, layoutId: "classic" },
  { id: "tutor-modern", businessType: "tutor", label: "Modern", description: MODERN_DESCRIPTION, layoutId: "default" },
  { id: "tutor-classic", businessType: "tutor", label: "Classic", description: CLASSIC_DESCRIPTION, layoutId: "classic" },
  { id: "cafe-modern", businessType: "cafe", label: "Modern", description: MODERN_DESCRIPTION, layoutId: "default" },
  { id: "cafe-classic", businessType: "cafe", label: "Classic", description: CLASSIC_DESCRIPTION, layoutId: "classic" },
  { id: "local_service-modern", businessType: "local_service", label: "Modern", description: MODERN_DESCRIPTION, layoutId: "default" },
  { id: "local_service-classic", businessType: "local_service", label: "Classic", description: CLASSIC_DESCRIPTION, layoutId: "classic" },
  { id: "other-modern", businessType: "other", label: "Modern", description: MODERN_DESCRIPTION, layoutId: "default" },
  { id: "other-classic", businessType: "other", label: "Classic", description: CLASSIC_DESCRIPTION, layoutId: "classic" },
];

/**
 * Returns the two templates for the given business type (MVP: 2 per type).
 */
export function getTemplatesForBusinessType(businessType: BusinessType): TemplateDefinition[] {
  return TEMPLATE_DEFINITIONS.filter((t) => t.businessType === businessType);
}

/**
 * Returns the template by id, or null if not found.
 */
export function getTemplateById(templateId: string): TemplateDefinition | null {
  return TEMPLATE_DEFINITIONS.find((t) => t.id === templateId) ?? null;
}

/**
 * Returns true if templateId is valid and belongs to the given business type.
 */
export function isTemplateValidForBusinessType(
  templateId: string,
  businessType: BusinessType
): boolean {
  const t = getTemplateById(templateId);
  return t !== null && t.businessType === businessType;
}

/**
 * Default template id for a business type (first of the two).
 */
export function getDefaultTemplateIdForBusinessType(businessType: BusinessType): string {
  const templates = getTemplatesForBusinessType(businessType);
  return templates.length > 0 ? templates[0].id : "other-modern";
}

/**
 * Returns the layout variant for a template (for SinglePageSiteView). Defaults to "default" if template not found.
 */
export function getLayoutIdForTemplate(templateId: string): LayoutId {
  const t = getTemplateById(templateId);
  return t?.layoutId ?? "default";
}
