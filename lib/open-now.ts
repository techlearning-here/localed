/**
 * Derives "Open now" from business hours string + IANA timezone (DATA_WE_COLLECT §6).
 * Parses common formats like "Mon–Fri 9–6, Sat 10–4, Sun closed".
 */

const DAY_ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function dayToNum(day: string): number {
  const i = DAY_ORDER.indexOf(day as (typeof DAY_ORDER)[number]);
  return i >= 0 ? i : -1;
}

type ParsedSegment =
  | { days: number[]; closed: true }
  | { days: number[]; startMin: number; endMin: number };

/**
 * Parse a single segment e.g. "Mon-Fri 9-6" or "Sun closed".
 * Returns null if segment cannot be parsed.
 */
function parseSegment(segment: string): ParsedSegment | null {
  const trimmed = segment.trim();
  if (!trimmed) return null;

  const closedMatch = trimmed.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:\s*[–-]\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun))?\s+closed$/i);
  if (closedMatch) {
    const from = dayToNum(closedMatch[1]);
    const to = closedMatch[2] ? dayToNum(closedMatch[2]) : from;
    if (from < 0 || to < 0) return null;
    const days: number[] = [];
    for (let d = from; d !== (to + 1) % 7; d = (d + 1) % 7) days.push(d);
    if (to < from) for (let d = 0; d <= to; d++) days.push(d);
    return { days, closed: true };
  }

  const rangeMatch = trimmed.match(
    /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:\s*[–-]\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun))?\s+(\d{1,2})(?::(\d{2}))?\s*[–-]\s*(\d{1,2})(?::(\d{2}))?$/i
  );
  if (!rangeMatch) return null;

  const fromDay = dayToNum(rangeMatch[1]);
  const toDay = rangeMatch[2] ? dayToNum(rangeMatch[2]) : fromDay;
  if (fromDay < 0 || toDay < 0) return null;

  const startH = parseInt(rangeMatch[3], 10);
  const startM = rangeMatch[4] ? parseInt(rangeMatch[4], 10) : 0;
  const endH = parseInt(rangeMatch[5], 10);
  const endM = rangeMatch[6] ? parseInt(rangeMatch[6], 10) : 0;
  const startMin = startH * 60 + startM;
  let endMin = endH * 60 + endM;
  if (endMin <= startMin) endMin += 24 * 60;

  const days: number[] = [];
  for (let d = fromDay; d !== (toDay + 1) % 7; d = (d + 1) % 7) days.push(d);
  if (toDay < fromDay) for (let d = 0; d <= toDay; d++) days.push(d);
  return { days, startMin, endMin };
}

/**
 * Get current weekday (0=Sun..6=Sat), hour and minute in the given IANA timezone.
 */
function getLocalPartsInTimezone(timezone: string, now: Date): { weekday: number; hour: number; minute: number } {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  let weekday = 0;
  let hour = 0;
  let minute = 0;
  for (const p of parts) {
    if (p.type === "weekday") weekday = dayToNum(p.value);
    if (p.type === "hour") hour = parseInt(p.value, 10);
    if (p.type === "minute") minute = parseInt(p.value, 10);
  }
  return { weekday, hour, minute };
}

/**
 * Returns whether the business is open now in the given timezone based on businessHours string.
 * Returns null when timezone/hours are missing or unparseable.
 */
export function getOpenNowStatus(
  timezone: string,
  businessHours: string,
  now: Date = new Date()
): { open: boolean } | null {
  const tz = timezone?.trim();
  const hours = businessHours?.trim();
  if (!tz || !hours) return null;

  const { weekday, hour, minute } = getLocalPartsInTimezone(tz, now);
  const currentMin = hour * 60 + minute;

  const segments = hours.split(",").map((s) => parseSegment(s)).filter((s): s is ParsedSegment => s !== null);
  if (segments.length === 0) return null;

  for (const seg of segments) {
    if (!seg.days.includes(weekday)) continue;
    if ("closed" in seg && seg.closed) return { open: false };
    if ("startMin" in seg && currentMin >= seg.startMin && currentMin < seg.endMin) return { open: true };
  }

  return { open: false };
}
