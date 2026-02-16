# Competitor feature analysis (NewFeatures.md → localed.info)

**Source:** Competitor (Localo-style) feature list in `NewFeatures.md`.  
**Goal:** Decide which ideas to adopt for localed.info (simple website builder for small local businesses at `localed.info/[slug]`).

---

## How the competitor differs from localed

| Competitor focus | localed focus |
|------------------|----------------|
| Google Business Profile (GBP) as the hub | Own website as the hub |
| Rankings, keywords, position maps, citations | Site content, contact, hours, media |
| Multi-location / agency (many GBPs) | Single site or a few sites per owner |
| Reviews on Google, audits, competitor tracking | Contact form, optional testimonials later |

So many competitor features are **GBP/SEO-tool** oriented; we pick only what fits a **lightweight website builder** and our existing roadmap (DATA_WE_COLLECT, templates, contact, hours, media).

---

## Features to pick (recommended)

### 1. **Free LocalBusiness Schema Generator** — **High priority**

- **Competitor:** “Help search engines recognize your business details with structured data Google understands.”
- **For localed:** We already have business name, address, country, phone, email, hours, (future) services. Emit **JSON-LD `LocalBusiness`** (and optionally `OpeningHours`, `ContactPoint`) on the public site.
- **Why:** Improves local SEO without any GBP dependency; aligns with our stack and DATA_WE_COLLECT §9 (SEO and discovery).
- **Effort:** Medium — one component or layout that outputs `<script type="application/ld+json">` from `published_content` + site metadata.

### 2. **Website Builder messaging** — **Already us**

- **Competitor:** “Transform your Google Business Profile automatically into a stunning website… highlights your business details, photos, and customer reviews.”
- **For localed:** We already do “website from business details, photos”; we don’t have GBP import. We can align **marketing copy** (e.g. “highlights your business details, photos, and services”) and later add testimonials/reviews section.

### 3. **Review Poster (concept) → “Ask for reviews” / Testimonials** — **Medium priority**

- **Competitor:** “Generate a poster with a QR code to encourage more reviews.”
- **For localed:** We don’t manage Google reviews. We can:
  - Add a **Testimonials** section (owner-entered quotes; see DATA_WE_COLLECT §10), and/or
  - **“Ask for reviews”** block: configurable CTA + link (e.g. Google review URL) and optional **downloadable poster with QR** that points to that link (lighter than “review manager”).
- **Why:** Encourages social proof without building a full review sync product.

### 4. **Statistics (concept)** — **Lower priority**

- **Competitor:** “Track your GBP’s performance… compare periods, discover trends.”
- **For localed:** **Site-level stats only:** e.g. contact form submissions (we already store these), and if we add analytics later, page views. No rankings or GBP metrics.
- **Why:** “How is my site doing?” is a natural ask; keep it simple and website-centric.

### 5. **Reports (concept)** — **Later**

- **Competitor:** “Generate professional reports… rankings, statistics… Send directly via email with your logo.”
- **For localed:** **Simpler reports:** e.g. “Monthly summary” (submissions count, last updated, site URL) or one-click **export site summary as PDF** (business name, address, hours, contact, services). No rankings/competitor data.
- **Why:** Differentiates and adds perceived value without building a full agency reporting suite.

### 6. **Workspaces with Subaccounts** — **Later (multi-user)**

- **Competitor:** “Invite your team members, set roles, enjoy secure access to managing multiple Google Business Profiles.”
- **For localed:** **Workspaces / team access:** invite members, roles (e.g. editor vs viewer), manage one or more sites in a workspace. Useful for agencies or multi-location owners.
- **Why:** Fits roadmap if we go multi-site or B2B; not required for MVP.

### 7. **Content Publisher (concept, light)** — **Optional**

- **Competitor:** “Create, schedule, and share posts on Google and Facebook.”
- **For localed:** We don’t post to Google/Facebook. Lighter option: **“Share to social”** — pre-filled text + link to the site (e.g. “Check out [business name]: [url]”) for copy-paste or share intent. No scheduling or API integrations in MVP.
- **Why:** Low effort; helps owners promote the site.

---

## Features to deprioritize or skip

| Competitor feature | Reason |
|--------------------|--------|
| **Active Business Profiles / Optimization seats** | GBP-centric; we’re website-centric. |
| **Position Map, Keywords Tracking, Area Difficulty, Position Checker Widget** | Full local SEO/rankings product; out of scope for current builder. |
| **Review Manager (Google reviews in one place)** | Requires GBP API and review sync; we’re not a GBP dashboard. |
| **Content Publisher (auto post to Google/Facebook)** | Requires integrations and scheduling; heavy for MVP. |
| **Protection** | GBP-specific (protect profile from changes). |
| **AI Agent, Smart Tasks** | Could inspire “tips” or “suggestions” in editor later; not core. |
| **Competitor Activity Tracking, Citations Manager, Audit, Client Acquisition** | Agency/GBP/multi-location focus; not aligned with single-site builder. |
| **Bulk Review Manager, Bulk Content Posting for Many Business Profiles** | Multi-GBP; we’re single-site or few sites per owner. |

---

## Summary: what to build next (in order)

1. **LocalBusiness JSON-LD** — High impact for SEO; fits existing data.
2. **Testimonials** (and optionally “Ask for reviews” + QR poster) — Social proof; fits DATA_WE_COLLECT §10.
3. **Simple site stats** — Contact submissions + (later) basic analytics.
4. **Social links** (DATA_WE_COLLECT §7) — Already in spec; show on site and optionally use in schema/social share.
5. **Services** (DATA_WE_COLLECT §5) — Already in spec; enables richer LocalBusiness schema and “What we offer”.
6. **Reports / PDF export** and **Workspaces** — After core content and SEO are solid.

This keeps localed focused on **great small-business websites** while borrowing the competitor ideas that fit (schema, social proof, light stats/reports) and skipping GBP/rankings/agency-heavy features.
