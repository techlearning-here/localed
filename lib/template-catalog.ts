import type { BusinessType } from "@/lib/types/site";

export type TemplateExtraField = {
  key: string;
  label: string;
  type?: "text" | "textarea";
  placeholder?: string;
};

export type TemplateDefinition = {
  id: string;
  businessType: BusinessType;
  label: string;
  description?: string;
  extraFields?: TemplateExtraField[];
};

/**
 * MVP: exactly 2 templates per business type.
 * Some templates define extraFields that the wizard collects after template selection.
 */
const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  { id: "salon-modern", businessType: "salon", label: "Modern" },
  {
    id: "salon-classic",
    businessType: "salon",
    label: "Classic",
    extraFields: [
      { key: "servicesIntro", label: "Services section intro", type: "textarea", placeholder: "e.g. What we offer" },
    ],
  },
  { id: "clinic-modern", businessType: "clinic", label: "Modern" },
  {
    id: "clinic-classic",
    businessType: "clinic",
    label: "Classic",
    extraFields: [
      { key: "specialtiesIntro", label: "Specialties intro", type: "text", placeholder: "e.g. Our focus areas" },
    ],
  },
  { id: "repair-modern", businessType: "repair", label: "Modern" },
  { id: "repair-classic", businessType: "repair", label: "Classic" },
  { id: "tutor-modern", businessType: "tutor", label: "Modern" },
  { id: "tutor-classic", businessType: "tutor", label: "Classic" },
  { id: "cafe-modern", businessType: "cafe", label: "Modern" },
  { id: "cafe-classic", businessType: "cafe", label: "Classic" },
  { id: "local_service-modern", businessType: "local_service", label: "Modern" },
  { id: "local_service-classic", businessType: "local_service", label: "Classic" },
  { id: "other-modern", businessType: "other", label: "Modern" },
  { id: "other-classic", businessType: "other", label: "Classic" },
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
