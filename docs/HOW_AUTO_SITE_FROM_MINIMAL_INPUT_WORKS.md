# How "Auto/AI site from minimal input" works (Mighty Sites, Localo)

This doc explains how competitors turn **name + location + type** (or a link to Google) into a **full site**, and how localed could do the same.

---

## 1. Mighty Sites: template + pre-written content + AI

**Input:** Business name, location (e.g. city/address), and business type (e.g. painter, lawn care, handyman).

**What happens:**

1. **Template selection** – They have many industry-specific templates (hundreds). Your **business type** picks the right template (layout + section structure).
2. **Pre-written content** – Each template comes with **professional, industry-relevant starter copy** (headlines, about, services, CTAs). Same idea as localed’s content plan / “Create with assistance” sample text, but applied automatically.
3. **Curated images** – Templates ship with **stock images** chosen for that industry (or from a large library). Your business name/location might be used only for labels/placeholders, not to fetch real photos.
4. **Color palette** – A palette is chosen per business type so the site looks coherent without the user picking colors.
5. **Instant deploy** – The site is generated and deployed in under a minute. The user then **edits** in a simple editor: change text, add phone/email/social, upload logo, swap images.

**No real “AI” in the strict sense for the first version:** it’s **template + static pre-written content + stock media**. “AI” in their marketing can mean “we pick the right template and content for you” or later, optional AI-generated copy. The core is: **minimal input → one template + one content set → one site**.

**Data flow (conceptual):**

```
[name, location, business_type]
    → pick template(business_type)
    → load default copy(template)
    → load default images(template)  // or stock by industry
    → set theme(template)
    → render site
    → user customizes (edit text, add contact, logo, etc.)
```

---

## 2. Localo: pull from Google Business Profile (GBP)

**Input:** User signs up, then **links their Google Business Profile** (OAuth). They pick the business from a list and optionally enter a domain name.

**What happens:**

1. **Read from GBP** – Localo uses Google’s APIs (or similar) to read:
   - Business name, address, phone, website URL  
   - Hours  
   - Category  
   - Photos (profile + gallery)  
   - Reviews (rating + text)  
   - Posts (for a blog section)  
   - Q&A  

2. **Build the site from that data** – No (or very little) typing. The site is literally **“your GBP, as a website”**: same name, same address, same hours, same photos, same reviews. Sections are fixed (hero, about, services, reviews, contact, map, etc.) and **filled from GBP**.

3. **Optional AI** – They use GPT-3 for things like **business description** and **social posts** (SEO-focused, keyword-rich). So “minimal input” for the *site* is really “no input – we use GBP”. AI is an extra for copy and posts.

4. **Sync** – When you update your GBP, the site can update too (same data source).

**Data flow (conceptual):**

```
[user links GBP]
    → OAuth Google
    → fetch business(name, address, hours, category, photos, reviews, posts, Q&A)
    → pick layout (fixed or by category)
    → fill sections from GBP
    → optional: AI-generated description from name + category
    → publish at yourname.localo.site
```

So for Localo, **“minimal input” = “connect Google”**. The “full site” is **GBP data rendered as a website**.

---

## 3. How localed could do it

We already have **“Create with assistance”**: user picks business type, then clicks “Pre-fill with sample content” and we fill the wizard from the **content plan** (templates + sample copy + placeholder images). That’s close to Mighty Sites’ idea, but we still ask for **slug, country, language, and all steps** before they see a full site.

To get to **“name + location + type → full site”** we have two main paths.

### Option A: Even simpler create flow (no GBP)

**Idea:** One short form: **business name**, **location** (city or address), **business type**, and maybe **country**. On submit:

1. **Create site** with a default slug (e.g. from business name: “Joe’s Salon” → `joes-salon`), default language, default template for that type.
2. **Pre-fill draft_content** from the content plan (like “Create with assistance”): sample about, services, hours, contact, etc. Replace placeholders with:
   - **Business name** → user’s name  
   - **Location** → user’s city/address (in address, addressLocality, etc.)  
   - **Business type** → already used to pick template and sample copy  
3. **Placeholder or stock images** by business type (we already have placeholders in the seed).
4. **Redirect** to the editor (or to a “Your site is ready – edit details” page). User then refines slug, contact, photos, etc.

So: **minimal input** = name + location + type (+ country). **Full site** = one create API call + same content plan we use for “Create with assistance”, with name/location substituted in. No AI required for v1.

**Implementation sketch:**

- New route or step: e.g. “Quick create” with 3–4 fields: business name, city or full address, business type, country.
- Slug: `slugFromName(businessName)` + uniqueness check (or “choose your URL” on next step).
- `createSite({ business_type, slug, languages: [locale], country })` then `patchDraftContent(siteId, getSeedContent(business_type, [locale], { businessName, address, addressLocality, ... }))` with user’s name and location merged into the seed.
- Redirect to `/dashboard/sites/{id}/edit` (or a “Review your site” page).

### Option B: “Import from Google” (like Localo)

**Idea:** User connects Google (OAuth) and selects a Business Profile. We fetch name, address, hours, category, photos, (reviews later). We create a site and pre-fill draft_content from that. Optionally use AI to generate a short description from name + category.

**Implementation sketch:**

- OAuth with Google (scope for Business Profile API).
- Call Google My Business API (or Places API) to get profile + photos.
- Map response to our schema: businessName, address, phone, businessHours, heroImage, galleryUrls, etc.
- Create site (slug from name), set draft_content from fetched data, redirect to editor.

This gives **“minimal input” = “connect Google”** and **“full site” = GBP as a website**, like Localo.

---

## 4. Summary

| Approach | Minimal input | How “full site” is made | Localed today |
|----------|----------------|--------------------------|----------------|
| **Mighty Sites** | Name + location + type | Template + pre-written industry copy + stock images; user edits after | We have template + content plan + “Create with assistance”; we could add a **quick-create** step that only asks name + location + type and then creates + pre-fills in one go. |
| **Localo** | Link Google Business Profile | Site = GBP data (name, address, hours, photos, reviews) rendered as a website | We don’t have GBP. Adding **“Import from Google”** (manual paste or OAuth) would replicate this. |

**Concrete next step for “name + location + type → full site” without Google:**  
Add a **Quick create** flow: single screen with business name, city or address, business type, country → create site with slug from name → merge name + location into seed content from content plan → redirect to editor. That gives Mighty Sites–style “minimal input → full site” using what we already have (content plan, templates, placeholders).
