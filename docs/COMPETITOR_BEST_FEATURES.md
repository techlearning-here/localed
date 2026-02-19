# Best features from competitors (for localed)

Consolidated from Onepager, Localo, Mighty Sites, Jimdo, Canva Websites, and Mailchimp. Use this to prioritize what to build next.

---

## 1. **Google Business Profile (GBP) integration** — *Localo*

| Feature | What it does | Localed today |
|--------|----------------|---------------|
| Pull from GBP | Sign up → link GBP → site auto-built from name, address, hours, photos, reviews | ❌ Manual entry only |
| Sync NAP + hours | One place to update; site and listings stay in sync | ❌ Edit in dashboard only |
| Show Google reviews on site | Display star rating + reviews on the website | ❌ No review widget |
| GBP tracking / insights | Free tracking of how your GBP performs | ❌ N/A |

**Idea for localed:** Optional “Import from Google Business Profile” (OAuth or manual paste of profile URL) to prefill business name, address, hours, and optionally pull photos. Later: embed or link to reviews.

---

## 2. **Automatic / AI-generated site from minimal input** — *Mighty Sites, Localo*

| Feature | What it does | Localed today |
|--------|----------------|---------------|
| Enter name + location + type → full site | AI/templates generate copy, structure, images | ✅ “Create with assistance” (sample content); no AI yet |
| Industry-relevant images | Auto stock photos by business type | ✅ Placeholder images from content plan |
| One-click deploy | Minimal steps to go live | ✅ Publish flow exists |

**Idea for localed:** Keep improving “Create with assistance” and planned AI assistance so a single action gets a full, editable site (copy + structure + images) from minimal input. Full design for Mighty Sites–style pre-created experience (templates, pre-written content, curated images, color palette, instant deploy): [PRE_CREATED_TEMPLATES_AND_CONTENT.md](./PRE_CREATED_TEMPLATES_AND_CONTENT.md).

---

## 2b. **Edit on template (UI under each section)** — *Mighty Sites*

| Feature | What it does | Localed today |
|--------|----------------|---------------|
| Appealing template + matching images | User sees the real layout and images from the start | ✅ Preview and templates; can improve imagery |
| Edit control under each section | "Edit" or pencil on Hero, About, Services, Contact, etc. | ❌ Edit only via wizard steps (form-based) |
| See what changes | Edit in context; changes appear immediately on the template | ❌ Preview is separate; no section-level edit on preview |

**Idea for localed:** After data collection (wizard or quick create), offer a **UI-based template editor**: user sees the site as it will look, and each section has an "Edit" control that opens a panel with only that section's fields; changes update the view so the user sees what will be applied. Design: [UI_BASED_TEMPLATE_EDITOR.md](./UI_BASED_TEMPLATE_EDITOR.md).

---

## 3. **Multi-platform listing sync** — *Jimdo*

| Feature | What it does | Localed today |
|--------|----------------|---------------|
| Update once, push to 10+ platforms | Change NAP/hours in one place → sync to Google, Facebook, etc. | ❌ No listing sync |
| Consistent citations | Same info everywhere for local SEO | ❌ Manual everywhere |

**Idea for localed:** Longer-term: “Sync to Google / Apple / Facebook” (APIs or export) so one edit updates site and major listings. Short-term: export NAP/hours as a snippet or PDF for manual copy-paste.

---

## 4. **Built-in booking** — *Jimdo*

| Feature | What it does | Localed today |
|--------|----------------|---------------|
| Native booking | Time slots, hours, confirmations, no double-book | ✅ Link to external (e.g. Calendly) only |
| Per-location or per-service | Different slots per service/location | ❌ Single booking URL |

**Idea for localed:** Keep “Book now” → external URL as default; later consider simple native slots (e.g. weekly hours + duration) or deeper Calendly/Cal.com integration (embed or API).

---

## 5. **Newsletter / email capture** — *Onepager, Mailchimp*

| Feature | What it does | Localed today |
|--------|----------------|---------------|
| Newsletter block | Signup form + optional link to external tool | ✅ Newsletter label + URL (e.g. Mailchimp) |
| Send from platform | Onepager: X newsletters/month included | ❌ Link out only |
| Forms → list | Contact form or popup → add to email list | ❌ Contact form only; no list |

**Idea for localed:** Optional “Collect emails” (embed Mailchimp/ConvertKit form or simple signup that forwards to webhook/email) so one-page sites can grow a list without leaving the product.

---

## 6. **Analytics & insights** — *Onepager, Jimdo, Mailchimp, Canva*

| Feature | What it does | Localed today |
|--------|----------------|---------------|
| Built-in dashboard | Page views, traffic source, top pages | ❌ None |
| Google Analytics | Easy GA4 drop-in or script | ❌ Not in wizard |
| Lead list | All contact form submissions in one place | ✅ Contact submissions (DB) |

**Idea for localed:** In-dashboard “Site insights”: count of contact submissions, optional “Add Google Analytics” (paste GA ID → inject script). Full analytics later.

---

## 7. **Local SEO & schema** — *Localo, Jimdo*

| Feature | What it does | Localed today |
|--------|----------------|---------------|
| LocalBusiness schema | Correct JSON-LD so Google understands NAP, hours, type | ⚠️ Check: meta/build might have some |
| Schema generator / validator | Create or fix schema from business info | ❌ |
| SEO tips in editor | Keyword/description suggestions, readability | ❌ |

**Idea for localed:** Ensure every published page has LocalBusiness (and, if relevant, Service) schema from parsed content. Optional: “SEO checklist” in wizard (meta title, description, one keyword).

---

## 8. **Reviews on site** — *Localo*

| Feature | What it does | Localed today |
|--------|----------------|---------------|
| Show Google reviews | Star rating + snippets on site | ❌ |
| Testimonials | Manual quotes (what we have) | ✅ Testimonials section |

**Idea for localed:** “Import from Google” testimonials (manual paste or future API) or “Reviews” block that pulls from GBP when integrated. Keep manual testimonials as-is.

---

## 9. **Design & UX** — *Canva, Onepager*

| Feature | What it does | Localed today |
|--------|----------------|---------------|
| Brand kit | Logo, colors, fonts in one place; apply everywhere | ❌ Only logo/theme in content |
| Drag-and-drop layout | Move sections/blocks freely | ❌ Fixed wizard → fixed layout |
| Rich media library | Stock photos, icons, video in editor | ✅ User URLs only; placeholders in seed |
| Animations | Scroll or hover animations | ❌ Static |

**Idea for localed:** “Brand” step or sidebar: primary color, font choice (from a short list), logo/favicon. Keep template-based layout; avoid full drag-and-drop for v1. Optional: pick from a small set of stock images by industry.

---

## 10. **Pricing & plans** — *all*

| Feature | What it does | Localed today |
|--------|----------------|---------------|
| Free tier | 1 site, subdomain or limited features | Depends on hosting/auth |
| Clear tiers | e.g. 1 / 5 / 20 sites, newsletters, support | ❌ No billing in codebase yet |
| Custom domain included | Free 1st year or always | Depends on deployment |

**Idea for localed:** When monetizing: simple tiers (e.g. 1 site free, more sites or custom domain on paid), mirroring “simple and cheap” (e.g. Mighty Sites $9, Onepager Starter $8).

---

## 11. **Support & trust** — *Onepager*

| Feature | What it does | Localed today |
|--------|----------------|---------------|
| 24/7 support | Chat/email | ❌ |
| Satisfaction guarantee | Money-back | ❌ |
| Help / FAQ in product | In-app tips, “How do I…?” | ⚠️ Docs exist; in-app could be better |

**Idea for localed:** In-editor “?” or “Help” linking to short FAQ (e.g. “How do I change my site name?”). Optional: status page, contact support link.

---

## 12. **Agencies / multi-site** — *Onepager*

| Feature | What it does | Localed today |
|--------|----------------|---------------|
| Multiple sites per account | 5 or 20 sites on higher plans | ✅ Multi-site in dashboard |
| White-label / reseller | Agency brand, client sites under one account | ❌ |

**Idea for localed:** Already multi-site. Later: “Agency” mode (sub-accounts or team seats) if you target agencies.

---

## Prioritized “best of” wishlist for localed

**High impact, feasible soon**

1. **LocalBusiness (and Service) schema** on every published page.
2. **“Import from Google”** (manual paste of GBP URL or key fields) to prefill name, address, hours.
3. **In-dashboard “Insights”**: contact submission count, optional “Add Google Analytics” (paste ID).
4. **Brand step**: primary color + font from a short list (no full brand kit).

**High impact, more work**

5. **GBP OAuth** → pull name, address, hours, photos (and optionally reviews) into draft.
6. **Reviews on site**: manual “import from Google” (paste) or API later.
7. **Simple native booking**: define weekly hours + slot length, “Book” opens modal or external link (or integrate one provider).

**Nice to have**

8. **Listing sync**: export NAP/hours for copy-paste to Google/Facebook; later API sync.
9. **Newsletter block**: embed code or “Mailchimp signup” URL + optional popup.
10. **In-app help**: short FAQ or tooltips in the wizard.

---

## Approximate competitor revenue (for context)

Rough scale of the competitors referenced in this doc. Figures are public estimates or reported; small/private companies often do not disclose revenue.

| Competitor | Approx. revenue / scale | Notes |
|------------|-------------------------|--------|
| **Canva** | **~$2–2.55B ARR** (2024) | ~21M paid subscribers, ~220M MAU; design platform, websites are one product. Valued ~$32B. |
| **Mailchimp** | **Not reported separately** | Owned by Intuit (acquired for ~$12B in 2021). Revenue folded into Intuit’s “Online Ecosystem” (~$1.8B FY24); Mailchimp is a material part of that. |
| **Jimdo** | **~$39M** (2024 est.) | Hamburg-based website builder; ~256 employees. Competes with Wix (~$1.2B), Squarespace (~$749M). |
| **Localo** | **Not disclosed** | Europe-based; 6,000+ business owners/month. Subscription pricing from ~$39/mo (single) to $149/mo (Pro). |
| **Mighty Sites** | **Not disclosed** | Small business website generator; $9/mo positioning. No public funding or revenue data. |
| **Onepager** | **Not disclosed** | Original small-business one-page product had small seed funding (~$350K); later pivoted/acquired (Stonks). OnePager.vc now focuses on fundraising, not SMB sites. |

**Takeaway:** Direct “simple site for local business” competitors (Localo, Mighty Sites, legacy Onepager) are small or don’t report revenue. The large revenue is in broad platforms (Canva, Mailchimp/Intuit) or full website builders (Jimdo, Wix, Squarespace). Useful for sizing the market and deciding which feature set to match first.

---

## Summary table: localed vs competitors

| Capability | Onepager | Localo | Mighty Sites | Jimdo | Canva | Mailchimp | Localed |
|------------|----------|--------|--------------|-------|-------|-----------|---------|
| Wizard / simple setup | ✓ | ✓✓ | ✓✓ | ✓ | ✓ | ✓ | ✓✓ |
| One-page + multi-page | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓✓ |
| GBP / listing import | — | ✓✓ | — | ✓ sync | — | — | ❌ |
| LocalBusiness schema | ✓ | ✓✓ | ✓ | ✓ | — | — | ⚠️ |
| Built-in booking | — | — | — | ✓✓ | — | — | Link only |
| Newsletter / signup | ✓✓ | — | — | — | — | ✓✓ | Link only |
| Analytics in product | ✓ | ✓ | — | ✓ | ✓ | ✓✓ | ❌ |
| Reviews on site | — | ✓✓ | — | — | — | — | ❌ |
| AI / auto content | — | ✓ | ✓✓ | — | ✓ | — | Sample + planned |
| Contact submissions | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓✓ |
| Custom domain | ✓ | Subdomain | ✓ | ✓ | ✓ | ✓ | Depends on host |

Use this doc in planning and when comparing localed to “who offers the same service” (e.g. Onepager, Localo, Mighty Sites, Jimdo).
