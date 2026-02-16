/**
 * Supported site languages for multi-language content.
 * Code = locale key in draft_content / published_content (e.g. "en", "hi").
 */
export const SUPPORTED_LANGUAGES: { value: string; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "bn", label: "Bengali" },
  { value: "te", label: "Telugu" },
  { value: "mr", label: "Marathi" },
  { value: "ta", label: "Tamil" },
  { value: "ur", label: "Urdu" },
  { value: "gu", label: "Gujarati" },
  { value: "kn", label: "Kannada" },
  { value: "ml", label: "Malayalam" },
  { value: "pa", label: "Punjabi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ar", label: "Arabic" },
  { value: "zh", label: "Chinese (Simplified)" },
  { value: "pt", label: "Portuguese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "th", label: "Thai" },
  { value: "vi", label: "Vietnamese" },
  { value: "id", label: "Indonesian" },
  { value: "ms", label: "Malay" },
  { value: "tr", label: "Turkish" },
  { value: "ru", label: "Russian" },
  { value: "it", label: "Italian" },
  { value: "nl", label: "Dutch" },
];

export const DEFAULT_LANGUAGE = "en";

/**
 * Country code (ISO 3166-1 alpha-2) -> language codes commonly used in that country.
 * Used to show a focused language list during site creation and avoid confusion.
 */
const COUNTRY_LANGUAGES: Record<string, string[]> = {
  IN: ["en", "hi", "bn", "te", "mr", "ta", "ur", "gu", "kn", "ml", "pa"],
  US: ["en", "es"],
  GB: ["en"],
  AE: ["en", "ar"],
  AU: ["en"],
  CA: ["en", "fr"],
  DE: ["en", "de"],
  FR: ["en", "fr"],
  SG: ["en", "zh", "ms"],
  MY: ["en", "ms", "zh"],
  SA: ["en", "ar"],
  ZA: ["en"],
  KE: ["en"],
  NG: ["en"],
  EG: ["en", "ar"],
  PK: ["en", "ur"],
  BD: ["en", "bn"],
  LK: ["en", "ta"],
  NP: ["en", "hi"],
  ID: ["en", "id"],
  PH: ["en"],
  TH: ["en", "th"],
  VN: ["en", "vi"],
  JP: ["en", "ja"],
  KR: ["en", "ko"],
  CN: ["zh", "en"],
  HK: ["zh", "en"],
  NZ: ["en"],
  IE: ["en"],
  NL: ["en", "nl"],
  ES: ["en", "es"],
  IT: ["en", "it"],
  BR: ["pt", "en"],
  MX: ["es", "en"],
  AR: ["es", "en"],
  TR: ["en", "tr"],
  RU: ["en", "ru"],
};

const LANGUAGE_BY_VALUE = new Map(SUPPORTED_LANGUAGES.map((l) => [l.value, l]));

/**
 * Returns language options for the given country. Filters to languages commonly used
 * in that country; if no country or unknown country, returns all supported languages.
 * Ensures English is included when the country has it in the map.
 */
export function getLanguagesForCountry(countryCode: string): { value: string; label: string }[] {
  const codes = countryCode?.trim()
    ? (COUNTRY_LANGUAGES[countryCode.toUpperCase()] ?? SUPPORTED_LANGUAGES.map((l) => l.value))
    : [...SUPPORTED_LANGUAGES.map((l) => l.value)];
  const seen = new Set<string>();
  const result: { value: string; label: string }[] = [];
  for (const code of codes) {
    const meta = LANGUAGE_BY_VALUE.get(code);
    if (meta && !seen.has(code)) {
      seen.add(code);
      result.push(meta);
    }
  }
  return result.length > 0 ? result : SUPPORTED_LANGUAGES;
}
