# WhatsApp-specific features we can utilise

**Purpose:** List WhatsApp capabilities that fit localed (small local business sites). We already have: one WhatsApp link/number in Contact and a “Chat on WhatsApp” link using `wa.me`. Below are additional features we can add.

**Reference:** [Click to chat](https://faq.whatsapp.com/5913398998672934) — `https://wa.me/<number>?text=<url-encoded-message>`.

---

## 1. Pre-filled message (wa.me `?text=`)

**What:** When the visitor taps “Chat on WhatsApp”, the WhatsApp compose box opens with a message already filled in (they can edit before sending).

**How:** Build the link as `https://wa.me/<digits>?text=<encoded>` where `text` is URL-encoded. Example: `https://wa.me/919876543210?text=Hi%2C%20I%20found%20you%20on%20localed...`

**We can offer:**
- **Default pre-filled message** in editor (optional): e.g. “Hi, I’m interested in your services” or “I found you on [site name]”. Stored per site (or per locale).
- **Template options:** “General inquiry” vs “Book appointment” vs “Get quote” — each builds a different `text=` value.
- **Include context:** e.g. “Hi, I’m contacting you from your page at localed.info/joes-salon.”

**Value:** Fewer blank “Hi” messages; owner gets slightly more context. Low effort (one optional field + link builder).

**Phase:** v1.1.

---

## 2. Prominent / floating “Chat on WhatsApp” CTA

**What:** A visible button (e.g. bottom-right) that stays on screen as the user scrolls, in addition to the Contact section link.

**How:** Fixed-position button; same `wa.me` link (with or without pre-filled message). Optional: show only on mobile, or after scroll, or always. Template-controlled (on/off, label, optional icon).

**Value:** Higher chance of contact; matches common local-business site pattern.

**Phase:** v1.1 (already in ADDITIONAL_FEATURES as “WhatsApp CTA block”).

---

## 3. “Share this site” via WhatsApp

**What:** A “Share” button that opens WhatsApp (or share sheet) with a pre-filled message containing the site URL and optional short line (e.g. “Check out Joe’s Salon”).

**How:** `https://wa.me/?text=<encoded>` (no number = “share” flow on many devices) or use Web Share API with `shareUrl` and fallback to `wa.me/?text=...`. Message could be: “Check out [business name]: [canonical URL]”.

**Value:** Word-of-mouth; visitors share the site with friends/family.

**Phase:** v1.1 (already in ADDITIONAL_FEATURES as “Share buttons” including WhatsApp).

---

## 4. WhatsApp link in LocalBusiness schema (JSON-LD)

**What:** When we add structured data (LocalBusiness), include a `contactPoint` with `contactType: "customer service"` and `url` = the site’s `wa.me` link (and optionally `availableLanguage`).

**How:** In the JSON-LD block, add contactPoint entry with the WhatsApp URL we already use for “Chat on WhatsApp”.

**Value:** Search engines and assistants can expose “Message on WhatsApp” or similar; consistent with on-site CTA.

**Phase:** When we implement LocalBusiness schema (v1.1).

---

## 5. WhatsApp QR code (download)

**What:** Let the owner download a QR code that, when scanned, opens a chat with their WhatsApp number (same as “Chat on WhatsApp”), optionally with pre-filled message.

**How:** Generate QR that encodes `https://wa.me/<number>?text=...`; same as we do for site URL but for the WhatsApp link. Add “Download WhatsApp QR” in dashboard next to “Download site QR” or in the Contact/Appointments section.

**Value:** Print and display in-store (“Scan to chat”); no need to type the number.

**Phase:** v1.1 or v2.

---

## 6. Multiple WhatsApp CTAs (e.g. “Sales” vs “Support”)

**What:** Some businesses use different numbers or purposes (e.g. “Book via WhatsApp” vs “General inquiry”). Allow a second optional WhatsApp entry with a label.

**How:** Extend data model: e.g. `whatsApp` (primary) + `whatsAppSecondary` + `whatsAppSecondaryLabel`, or an array of `{ label, numberOrUrl }`. Render two links or buttons in Contact (and in floating CTA we’d pick primary or let owner choose which is “main”).

**Value:** Fits businesses that already use two numbers; still simple.

**Phase:** v2 if we see demand.

---

## 7. Open Graph / social preview

**What:** When someone shares the site link in WhatsApp (or other apps), show a nice preview (image, title, description).

**How:** Meta tags: `og:title`, `og:description`, `og:image`, `og:url`. We already plan this in ADDITIONAL_FEATURES (Open Graph image). WhatsApp uses the same OG tags for link previews.

**Value:** Professional look when the site is shared in WhatsApp (and elsewhere).

**Phase:** v1.1 (OG image + meta).

---

## What we’re not doing (for now)

- **WhatsApp Business API:** Automated replies, chatbots, etc. Requires approval and is aimed at larger businesses. Not needed for “click to chat” from a website.
- **WhatsApp Catalog link:** Some businesses have a catalog in WhatsApp Business; we could add an optional “Catalog link” field later if useful. Low priority.
- **Tracking “WhatsApp clicks”:** We could log or count clicks on the WhatsApp link in our analytics; no change to WhatsApp itself. Optional later.

---

## Summary: priority order

| Priority | Feature                         | Effort | Phase |
|----------|----------------------------------|--------|--------|
| 1        | Pre-filled message (`?text=`)   | Low    | v1.1   |
| 2        | Floating / prominent WhatsApp CTA | Low  | v1.1   |
| 3        | Share site via WhatsApp          | Low    | v1.1   |
| 4        | WhatsApp in LocalBusiness schema | Low    | With schema |
| 5        | WhatsApp QR download             | Low    | v1.1 / v2   |
| 6        | OG tags (preview when shared)    | Low    | v1.1   |
| 7        | Second WhatsApp (e.g. Sales/Support) | Medium | v2  |

All of these use the same `wa.me` link format we already support; most are UI/data additions rather than new integrations.
