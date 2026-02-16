# localed.info — Idea Overview

**Purpose:** Discussion documents for a SaaS product that helps small local businesses build a self-service web presence.

---

## Vision

**localed.info** is a self-service platform that lets small local businesses create and publish a simple website (up to 10 pages) under the **localed.info** domain. No technical skills required—businesses get an online presence, contact options, and appointment booking in one place.

---

## Target Users

- **Primary:** Small local businesses (salons, clinics, repair shops, tutors, cafes, local services).
- **Needs:** Affordable, easy-to-manage web presence; no custom domain or dev work required initially.

---

## Core Value Proposition

| Problem | Solution |
|--------|----------|
| No website or outdated single-page listing | Multi-page site (max 10 pages) published at `*.localed.info` or similar |
| Hard to get found and contacted online | Built-in contact forms, maps, business hours |
| Manual scheduling (calls, DMs) | Optional appointment/booking on their site |
| Cost and complexity of agencies/developers | Self-service editor, templates, one platform |

---

## Proposed Features (Discussion)

### 1. Website builder (self-service) — keep it very simple

- **Flow:** Choose business type → **select languages** → get a matching template → **edit the final website** → preview → **publish when ready.** (See [SITE_BUILDER_UX.md](./SITE_BUILDER_UX.md).)
- **Templates:** One (or few) mobile-friendly templates per business type (salon, clinic, repair, tutor, cafe, local service). No building from scratch.
- **Editor:** Edit content in place (text, images, hours, contact, services)—not full drag-and-drop. User edits the site as it will look.
- **Multi-language:** Created sites support multiple languages. During setup, the business owner selects required languages. **English is included**; any **other language adds an additional cost** (see [PRICING_OPTIONS.md](./PRICING_OPTIONS.md)). Published site has a language switcher.
- **Page limit:** Max 10 pages per business (3 free tier); template defines structure.
- **Publishing:** Site goes live only after user clicks Publish; draft stays private until then.
- **Edit later:** Owners can **come back anytime** to edit their site; edits are saved as draft and the live site updates only when they click Publish again (republish).

### 2. Business presence

- **Contact:** Contact form, optional display of phone/email/address.
- **Location:** Embed map (e.g. Google Maps) or “Find us” section.
- **Hours:** Business hours with optional “Open now” indicator.
- **Social:** Links to Facebook, Instagram, WhatsApp, etc.
- **QR code:** Owner can **generate a QR code** that links to their published site, for use in local ads, in front of their shop, or on flyers. Download as PNG (and optionally SVG for large print). See [QR_CODE_AND_PROMOTE.md](./QR_CODE_AND_PROMOTE.md).

### 3. Appointments (optional, paid tier)

- **Booking:** Simple appointment slots (date/time) that customers can choose.
- **Notifications:** Email or in-app reminder to business (and optionally to customer).
- **Scope:** Start with one service type or “general inquiry” to keep MVP small.
- **Integration options:** Embed Cal.com or Calendly (fastest), or build minimal in-house (slots + form + email). See [APPOINTMENT_BOOKING.md](./APPOINTMENT_BOOKING.md).

### 4. Discovery (future)

- **Directory:** Optional listing on localed.info (e.g. by category/location) to drive traffic to business sites.

### 5. High-perceived-value additions (v1.1 / v2)

- **Hyper-local SEO:** Auto meta tags, Google Map embedding, Schema.org structured data per business type — helps local ranking; huge perceived value.
- **AI copy or translation:** Auto-generate intro/service copy or translations to remove “what do I write?” friction.
- **“Instant Google visibility”:** Publish site to Google Business Profile or ensure quick indexing; one-click feel for owners.
- **QR + print bundle:** Printed sticker or mini-standee with QR code (we or partner ship it) for offline promotion.

---

## Open Questions for Discussion

1. **Subdomain vs path:** **Path** (`localed.info/businessname`) is the default. **Subdomain** (`businessname.localed.info`) is a **paid add-on** for customers who want “business name first” — see [SUBDOMAIN_VS_PATH.md](./SUBDOMAIN_VS_PATH.md) and [PRICING_OPTIONS.md](./PRICING_OPTIONS.md).
2. **Monetization:** Freemium (e.g. 3 pages free, 10 paid), subscription tiers, or one simple plan?
3. **Auth & accounts:** One account per business; multiple staff logins later?
4. **Appointments:** Build in-house vs integrate (Calendly, Cal.com, etc.) for v1?
5. **Content limits:** Besides 10 pages—limits on images, storage, or form submissions?
6. **Compliance:** Privacy (forms, bookings), cookie notice, terms of use for business and end-users.

---

## Suggested Next Steps

- [ ] **Product one-pager** — One-page pitch (problem, solution, features, pricing idea).
- [ ] **User flows** — Sign up → create site → add pages → enable contact/appointments → publish.
- [ ] **MVP scope** — Minimal feature set for first launch (e.g. 3–5 pages, contact form, one template).
- [ ] **Tech stack** — Hosting, DB, auth, and how to serve `*.localed.info` or path-based sites.

---

*This document is a living discussion draft. Updates will be added in the same `docs/localed.info` folder.*
