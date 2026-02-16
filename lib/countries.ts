/**
 * Country options for business location (ISO 3166-1 alpha-2 code + display name).
 */
const COUNTRY_LIST: { value: string; label: string }[] = [
  { value: "IN", label: "India" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "AU", label: "Australia" },
  { value: "CA", label: "Canada" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "SG", label: "Singapore" },
  { value: "MY", label: "Malaysia" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "ZA", label: "South Africa" },
  { value: "KE", label: "Kenya" },
  { value: "NG", label: "Nigeria" },
  { value: "EG", label: "Egypt" },
  { value: "PK", label: "Pakistan" },
  { value: "BD", label: "Bangladesh" },
  { value: "LK", label: "Sri Lanka" },
  { value: "NP", label: "Nepal" },
  { value: "ID", label: "Indonesia" },
  { value: "PH", label: "Philippines" },
  { value: "TH", label: "Thailand" },
  { value: "VN", label: "Vietnam" },
  { value: "JP", label: "Japan" },
  { value: "KR", label: "South Korea" },
  { value: "CN", label: "China" },
  { value: "HK", label: "Hong Kong" },
  { value: "NZ", label: "New Zealand" },
  { value: "IE", label: "Ireland" },
  { value: "NL", label: "Netherlands" },
  { value: "ES", label: "Spain" },
  { value: "IT", label: "Italy" },
  { value: "BR", label: "Brazil" },
  { value: "MX", label: "Mexico" },
  { value: "AR", label: "Argentina" },
  { value: "PL", label: "Poland" },
  { value: "TR", label: "Turkey" },
  { value: "RU", label: "Russia" },
];

const sorted = [...COUNTRY_LIST].sort((a, b) => a.label.localeCompare(b.label));
export const COUNTRY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Select country" },
  ...sorted,
];

/**
 * Get display name for a country code (e.g. "IN" -> "India").
 */
export function getCountryLabel(code: string): string {
  if (!code) return "";
  const found = COUNTRY_OPTIONS.find((c) => c.value === code);
  return found?.label ?? code;
}
