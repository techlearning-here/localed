/**
 * Strips editor-only _assistantPrefilledFields from draft_content before publishing.
 * Published snapshot must not include this metadata (TDD).
 */

const ASSISTANT_PREFILLED_FIELDS_KEY = "_assistantPrefilledFields";

/**
 * Returns a copy of draft_content with _assistantPrefilledFields removed from each locale.
 */
export function stripAssistantPrefilledFromDraft(
  draft_content: Record<string, unknown> | null | undefined
): Record<string, unknown> | null {
  if (!draft_content || typeof draft_content !== "object") return draft_content ?? null;
  const out: Record<string, unknown> = {};
  for (const [locale, localeContent] of Object.entries(draft_content)) {
    if (localeContent != null && typeof localeContent === "object") {
      const cleaned = { ...(localeContent as Record<string, unknown>) };
      delete cleaned[ASSISTANT_PREFILLED_FIELDS_KEY];
      out[locale] = cleaned;
    } else {
      out[locale] = localeContent;
    }
  }
  return out;
}
