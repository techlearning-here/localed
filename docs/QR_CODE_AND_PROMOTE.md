# localed.info — QR Code and Promote Your Site

**Purpose:** Let business owners generate a **QR code** that links to their published site, so they can use it in local ads, in front of their shop, on flyers, or on products.

---

## 1. Feature summary

- **Who:** Business owner (in dashboard, after site is published).
- **What:** Generate a **QR code** that points to their site URL (e.g. `https://localed.info/joes-salon` or `https://joes-salon.localed.info`).
- **Use cases:** Print on shop window, counter card, flyers, local newspaper ads, packaging, business cards. Visitors scan → open the business site on their phone.

---

## 2. Where it lives (UX)

- **Dashboard** (e.g. “Promote” or “Share your site” section), once the site is **published**.
- Optional: also show a small “Get QR code” link in the editor header when the site is already published.
- **Flow:** Owner clicks “Get QR code” or “Download QR code” → we show the QR image (and the site URL) → they can **download** (PNG or SVG) for print or digital use.

---

## 3. What the QR code encodes

- **URL only:** The canonical URL of their site.
  - Path-based: `https://localed.info/[siteSlug]`
  - Or subdomain: `https://[siteSlug].localed.info`
- **No tracking in v1:** Plain URL; optional later: add UTM or short redirect for analytics (e.g. `localed.info/r/xyz` → redirect to site).

---

## 4. Download options

| Format | Use case |
|--------|----------|
| **PNG** | Default; good for digital (email, social) and most print. Offer at least one size (e.g. 512×512 px). |
| **SVG** | Optional; scales for large print (shop window, banners) without blur. |
| **Size** | Optional: “Small” (e.g. 256), “Medium” (512), “Large” (1024) for print-ready. |

MVP: one PNG download (e.g. 512×512). Add SVG and sizes later if needed.

---

## 5. Implementation notes (tech)

- **No backend required:** QR can be generated **client-side** in the dashboard from the known site URL.
- **Library:** Use a lightweight JS library (e.g. `qrcode.react`, `qr-code-styling`, or `qrcode`) in the Next.js dashboard; render to canvas or SVG, then “Download as PNG” (canvas.toBlob) or provide SVG download.
- **URL source:** From `sites.slug` and our base domain (env: `NEXT_PUBLIC_SITE_URL` or similar). No new API; no new table.

---

## 6. Copy and behaviour

- **Heading:** “Promote your site” or “Share your site.”
- **Short line:** “Use this QR code in your shop, on flyers, or in ads. When customers scan it, they’ll open your site.”
- **Show:** QR image + site URL (so they can copy link too).
- **Button:** “Download QR code (PNG)” (and optionally “Download for print (SVG)” or “Large size” later).
- **If not published:** “Publish your site first to get your QR code.” (Hide or disable download until published.)

---

## 7. Summary

| Item | Detail |
|------|--------|
| **Who** | Business owner, in dashboard |
| **When** | After site is published |
| **What** | QR code encoding site URL; downloadable PNG (and optionally SVG) |
| **Use** | Shop front, local ads, flyers, packaging |
| **Tech** | Client-side generation in dashboard; no new backend or service |
