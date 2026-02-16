# localed.info — Additional Features We Can Provide

**Purpose:** Ideas for features beyond the current scope. Use this to prioritize what to build next (v1.1, v2, or later).

**Already in scope:** Template site builder, contact, map, hours, social, multi-language, appointments (embed), QR code, edit later, directory (future).

**Features identified from competitor analysis:** See [CompetitorFeatureAnalysis.md](./CompetitorFeatureAnalysis.md). We adopted these for our roadmap (adapted to website-centric product): **LocalBusiness JSON-LD** (§4 SEO), **Testimonials** + **Ask for reviews / QR poster** (§3 Content, §2 Promote), **Simple site stats** (§1 Analytics), **Social links** (in scope; DATA_WE_COLLECT §7), **Services** (in scope; DATA_WE_COLLECT §5), **Reports / PDF export** (§1 below), **Workspaces / subaccounts** (§8 Team), **Share to social** (§2 Promote).

**Newly identified feature lists (included in sections below and in §12):**
- **WhatsApp:** [WHATSAPP_FEATURES.md](./WHATSAPP_FEATURES.md) — pre-filled message, floating CTA, share site via WhatsApp, WhatsApp QR download, WhatsApp in schema, optional second CTA.
- **AI:** [AI_FEATURES.md](./AI_FEATURES.md) — AI-generated copy, translation, SEO meta suggestions, “Improve this” per field, editor tips, alt text suggestion, contact summarization.

---

## 1. Analytics and insights

| Feature | Description | Value |
|---------|-------------|--------|
| **Simple visit counter** | “Your site had X visits this week/month” in dashboard. Privacy-friendly (no cookies, server-side or minimal tracking). | Owners see that the site is working; encourages retention. |
| **Contact form stats** | Count of form submissions; list of recent submissions with date. | They see leads in one place. |
| **Booking stats** | Number of bookings this month; upcoming list. | Quick view of appointment volume. |
| **Weekly email digest** | “This week: X visits, Y contact forms, Z bookings.” | Keeps them engaged; brings them back to dashboard. |
| **Reports / PDF export** | Monthly summary (submissions, last updated) or one-click export of site summary as PDF (business name, address, hours, contact, services) with optional logo. *From competitor analysis.* | Professional feel; share with partners or use in pitches. |

*Phase: v1.1 (visit count + form list) → v2 (digest, reports/PDF, richer analytics).*

---

## 2. Promote and share (beyond QR code)

| Feature | Description | Value |
|---------|-------------|--------|
| **Share buttons** | “Share your site” — copy link, or share to WhatsApp / Facebook with pre-filled text. *Competitor-derived: “Share to social”.* | Easy word-of-mouth. |
| **Short link** | `localed.info/go/joes-salon` or branded short URL for print/ads. | Clean link for flyers and SMS. |
| **Link-in-bio page** | Single page that lists “Website”, “Book”, “WhatsApp”, “Instagram”. | Useful for Instagram/social bios. |
| **Add to Google Business** | In-dashboard tip or one-click: “Add your website URL to your Google Business Profile” (link to GBP + pre-filled URL). | More local discovery. |
| **Ask for reviews / QR poster** | Configurable CTA + link (e.g. Google review URL); optional downloadable poster with QR code that points to that link so owners can display it in-store. *From competitor “Review Poster” concept.* | Encourages reviews without building a full review-sync product. |

*Phase: v1.1 (share + short link) → v2 (link-in-bio, GBP prompt, ask-for-reviews + QR poster).*

---

## 3. Content and sections (beyond current templates)

| Feature | Description | Value |
|---------|-------------|--------|
| **Testimonials block** | Dedicated section: quote, author name, optional photo/rating. Already in [DATA_WE_COLLECT.md](./DATA_WE_COLLECT.md) as optional; make it a first-class block. *From competitor analysis (social proof).* | Trust and social proof. |
| **FAQ section** | Accordion or list: question + answer. | Reduces repeated questions; good for SEO. |
| **Simple blog / news** | 1–5 “posts”: title, date, short body. No full CMS. | “Offers”, “News”, “Tips” for local businesses. |
| **Events / offers** | “This week’s offer” or one-time event (date, title, description). | Promotions without changing whole site. |
| **Menu (for food)** | Structured menu: category, items, optional price. | Cafes and restaurants. |
| **PDF upload** | One or more PDFs (e.g. price list, menu) with “Download” link. | Common ask from service businesses. |

*Phase: v2 (testimonials, FAQ, menu) → later (blog, events, PDF).*

---

## 4. SEO and discoverability

| Feature | Description | Value |
|---------|-------------|--------|
| **Meta title & description** | Editable in dashboard; used for search results and social share preview. In DATA_WE_COLLECT as optional. | Better click-through from Google and social. |
| **Open Graph image** | Optional image for link previews (Facebook, WhatsApp). | Professional look when shared. |
| **Local SEO tips** | Short checklist in dashboard: “Add your site to Google Business Profile”, “Ask customers for reviews”. | Guides non-technical owners. |
| **Structured data** | LocalBusiness schema (JSON-LD) on published site. *From competitor “Free LocalBusiness Schema Generator”; high priority in competitor analysis.* | Rich results in Google; better local SEO. |

*Phase: v1.1 (meta + OG image, schema) → v2 (tips).*

---

## 5. Hyper-local SEO, AI copy, Google visibility, QR print (high perceived value)

These four features add strong perceived value and reduce friction; consider for v1.1 or v2. For a full list of AI options (copy, translation, SEO suggestions, tips, alt text, summarization), see [AI_FEATURES.md](./AI_FEATURES.md).

| Feature | Description | Value |
|---------|-------------|--------|
| **Hyper-local SEO assistance** | Automatically generate **meta tags**, **Google Map embedding**, and **structured data (Schema.org)** for each business type. Helps them rank locally in search. | **Huge perceived value** — “we help you get found”; differentiator vs generic builders. |
| **AI-powered copy or translation** | Auto-generate basic site copy (intro text, service descriptions) or **translations** from one language to another. Owner can edit after. *Full list:* [AI_FEATURES.md](./AI_FEATURES.md). | **Removes a common friction point** — many stall at “what do I write?” or “I need this in Hindi too.” |
| **AI: SEO meta suggestions** | Suggest meta title and description from business name + short description. | Better search snippets. |
| **AI: “Improve this” per field** | Button to refine current field text with AI; owner can accept or discard. | Quick polish. |
| **AI: Editor tips** | Heuristic or AI suggestions (“Add a tagline”, “Short description is short”). | Improves quality. |
| **AI: Alt text suggestion** | Suggest alt text for hero/gallery images. | Accessibility and SEO. |
| **AI: Contact summarization** | One-line summary of contact form message in dashboard. | Faster triage. |
| **“Instant Google visibility” button** | Integration to **publish business info directly to Google Business Profile** (or deep-link to GBP with pre-filled site URL), or to **ensure the site gets indexed quickly** (e.g. submit sitemap, request indexing). | Strong “get found” story; one-click feel for non-technical owners. |
| **QR + print bundle** | Option to order a **printed sticker or mini-standee** with their generated QR code — we (or a partner) ship it to them. | **Offline promotion** — they can put it in the shop window or on the counter without printing themselves. |

*Phase: v1.1 (hyper-local SEO: meta + map + schema; “Add to Google” link) → v2 (AI copy/translation, QR print bundle, deeper GBP integration).*

---

## 6. Trust and credibility

| Feature | Description | Value |
|---------|-------------|--------|
| **Google reviews display** | Show star rating and recent reviews (manual entry or API if allowed). | Social proof on the site. |
| **“Verified” badge** | Optional badge for paid or verified businesses. | Trust signal. |
| **Year established / certifications** | Already optional in DATA_WE_COLLECT; ensure templates show them. | Credibility. |

*Phase: v2.*

---

## 7. Notifications and alerts

| Feature | Description | Value |
|---------|-------------|--------|
| **New contact form email** | Instant email to owner when someone submits the form. | They don’t have to check dashboard. |
| **New booking alert** | Email (and optional in-app) when a booking is made. | Already implied in [APPOINTMENT_BOOKING.md](./APPOINTMENT_BOOKING.md). |
| **SMS option** | Optional SMS for high-value actions (booking, form). | Depends on cost and region. |

*Phase: v1 (form + booking email) → v2 (SMS if needed).*

---

## 8. Team and access

| Feature | Description | Value |
|---------|-------------|--------|
| **Multiple staff logins** | Owner invites “Editor” (can edit site) or “Viewer” (analytics only). *From competitor “Workspaces with Subaccounts”.* | Salons, clinics with staff; agencies managing multiple sites. |
| **Role-based access** | Owner vs Editor vs Viewer. | Clear permissions. |

*Phase: v2.*

---

## 9. Monetization and upgrades

| Feature | Description | Value |
|---------|-------------|--------|
| **Custom domain** | Connect own domain (e.g. joessalon.com → localed.info/joes-salon or CNAME). | Professional look; we said v2 in [TECH_STACK.md](./TECH_STACK.md). |
| **Featured in directory** | Paid “Featured” placement when we have directory. | Revenue; more visibility for paying businesses. |
| **Premium templates** | Extra templates or industry packs for one-time or monthly fee. | Upsell. |
| **Remove branding** | Already in pricing (paid tier). | — |

*Phase: v2 (custom domain, featured) → later (premium templates).*

---

## 10. Integrations

| Feature | Description | Value |
|---------|-------------|--------|
| **Google Business Profile prefill** | Optional: connect GBP (OAuth or manual) to prefill name, address, hours, phone. | Faster setup; consistency. |
| **WhatsApp click-to-chat** | Prominent “Chat on WhatsApp” button with pre-filled message. *In feature list:* [WHATSAPP_FEATURES.md](./WHATSAPP_FEATURES.md). | We have link; could be a dedicated CTA block. |
| **WhatsApp pre-filled message** | Optional default message when opening chat (`wa.me?text=`). | More context for owner; less blank “Hi”. |
| **WhatsApp floating CTA** | Sticky “Chat on WhatsApp” button (e.g. bottom-right). | Higher contact rate. |
| **Share site via WhatsApp** | “Share” opens WhatsApp with pre-filled site URL + line. | Word-of-mouth. |
| **WhatsApp QR download** | Download QR that opens wa.me chat (same as site QR but for WhatsApp). | “Scan to chat” in-store. |
| **Instagram feed** | Optional embed of recent Instagram posts. | Fresh content; engagement. |

*Phase: v1.1 (WhatsApp CTA, pre-filled message, floating CTA, share, WhatsApp QR) → v2 (GBP prefill, Instagram).*

---

## 11. Compliance and accessibility

| Feature | Description | Value |
|---------|-------------|--------|
| **Cookie consent** | Simple banner for EU/regional compliance if we add analytics or tracking. | Compliance. |
| **Accessibility hints** | In editor: remind to add alt text for images; basic contrast check. | Better for all users; reduces risk. |

*Phase: v2 when we add tracking; accessibility hints can be v1.1.*

---

## 12. Design and presentation

| Feature | Description | Value |
|---------|-------------|--------|
| **Professional look** | Published sites and default templates must have a professional look: clear layout, readable typography, consistent spacing, and polished UI so local businesses are represented credibly. | Trust; owners and visitors perceive the site as legitimate and well-made. |

*Ongoing: apply to all template and public-site work (MVP and beyond).*

---

## 13. Summary: suggested order

| Phase | Features to consider |
|-------|----------------------|
| **v1 / MVP** | Already defined: builder, contact, map, hours, social, QR, appointments (embed), edit later; **professional look** for published sites (see §12). Add: **new contact form → email to owner**, **new booking → email to owner**. |
| **v1.1** | Visit count (simple), contact form list, **meta + OG image**, share/short link; **WhatsApp:** floating CTA, pre-filled message, share site via WhatsApp, WhatsApp QR download (see [WHATSAPP_FEATURES.md](./WHATSAPP_FEATURES.md)); **hyper-local SEO** (meta tags, map embed, **LocalBusiness JSON-LD**); **“Add to Google” / instant visibility** link or simple integration. |
| **v2** | Directory, **testimonials** + FAQ, **ask for reviews / QR poster**, custom domain, **multiple staff / workspaces**, weekly digest, **reports / PDF export**, Google reviews; **AI:** suggest copy, translation, SEO meta suggestions, “Improve this”, editor tips, alt text, contact summarization (see [AI_FEATURES.md](./AI_FEATURES.md)); **QR + print bundle** (sticker/standee); deeper GBP integration. |
| **Later** | Blog/news, events/offers, menu builder, PDF upload, featured listing, premium templates, SMS, cookie consent, accessibility hints. |

Use this list to pick the next 2–3 features after MVP and document them in the main product docs.
