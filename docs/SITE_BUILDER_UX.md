# localed.info — Site Builder UX: Simple, Template-Based, Edit Before Publish

**Principle:** Site building must be **very simple**. User picks a template by business type, then edits the resulting site and publishes only when ready.

---

## 1. Core flow (simple)

```
Choose business type  →  Select languages  →  Get matching template  →  Edit your site  →  Preview  →  Publish
```

- **No** drag-and-drop from scratch.
- **No** choosing “blank” or building page-by-page from zero.
- **Yes:** Start from a ready-made template that fits the business, then **edit** that site until it’s right, then publish.

---

## 2. Step 1: Business type → template

- User selects **one business type** (e.g. Salon, Clinic, Repair shop, Tutor, Cafe, Restaurant, Local service, Other).
- We show **one recommended template** (or 2–3 variants) for that type.
- Template = full small site structure: hero, about, services, gallery (if relevant), contact, hours, map. Page count fits plan (e.g. 3 pages free, up to 10 paid).

**Why:** Reduces decisions. “I’m a salon” → “Here’s your salon site. Edit the text and photos, then publish.”

---

## 2a. Language selection (multi-language support)

- **When:** During site setup, the business owner **selects the required languages** for the site (before or right after choosing the template).
- **Default:** **English** is always included at no extra cost.
- **Additional languages:** Any language other than English (e.g. Hindi, Spanish, Arabic, French) is a **flat add-on** (one fee for all extra languages; see [PRICING_OPTIONS.md](./PRICING_OPTIONS.md)).
- **Published site:** The live site supports **multi-language**: visitor can switch language (e.g. via a language switcher). Content is edited (or translated) per language in the editor.
- **In the editor:** For each editable field, owner can fill/translate content for each selected language (e.g. “Business name (English)”, “Business name (Hindi)”).

---

## 3. Step 2: Edit the final website

- After picking the template, user sees the **actual website** (or a close preview) in **edit mode**.
- Edits are **in-context**: click a section or block → change text, replace image, edit hours, add/remove a service.
- **Editable things (examples):** See [DATA_WE_COLLECT.md](./DATA_WE_COLLECT.md) for the full list. Summary:
  - **Identity:** Business name, tagline, logo
  - **Location & contact:** Address, phone, email, WhatsApp; map from address
  - **Description:** Short description, about/long description
  - **Media:** Hero image, gallery images, **YouTube video links**, images per service
  - **Services:** Name, description, optional image, duration, price
  - **Hours:** Regular and optional special/holiday hours
  - **Social:** Facebook, Instagram, YouTube, Twitter, LinkedIn, TikTok, etc.
  - **Paid:** Appointment/booking toggle and settings
  - **Per language:** When multiple languages are selected, each text field can be filled (or translated) for that language; the published site shows a language switcher.

- **Not required:** Choosing layout, adding sections from a big library, or designing from scratch. The template defines the layout; user only fills and tweaks content.

---

## 4. Step 3: Preview and publish

- **Preview:** User can switch to “Preview” to see the site as visitors will (e.g. mobile/desktop).
- **Publish:** Explicit “Publish” action. Until then, the site is draft (not live at `businessname.localed.info` or `localed.info/businessname`).
- After publish: optional “Unpublish” or “Edit” to change and republish.

**Principle:** User always **edits the final website** and only goes live when they’re happy.

### 4a. Edit later (always available)

- **Owners can come back anytime** and edit their site. From the dashboard they open “My site” (or the site in the list) and go into the same editor.
- **Edits are saved as draft.** The **live site stays unchanged** until they click **Publish** again (republish). So: edit → save draft → preview if needed → Publish when ready.
- No “lock” after first publish: **edit as often as they want**; republish whenever they want the world to see the latest version.

---

## 5. Design principles (summary)

| Principle | Meaning |
|-----------|--------|
| **Template-first** | Start from a business-type template; no blank canvas. |
| **Edit, don’t build** | User edits content and media on the template, not structure. |
| **Edit = final site** | What they edit looks like the real site (WYSIWYG or near-WYSIWYG). |
| **Publish when ready** | Draft → Preview → Publish; no auto-publish. |
| **Edit later** | Owners can return anytime to edit; changes are draft until they republish. |
| **Minimal choices** | Business type + one template (+ optional variant); then only content edits. |
| **Multi-language** | Owner selects languages during setup; English included; other languages = flat add-on. Published site has language switcher. |

---

## 6. Business types and templates (MVP)

Start with a **small set** of types and one template per type (or one “generic” + 2–3 themed):

| Business type | Template focus |
|---------------|-----------------|
| Salon / Beauty | Services, before/after or gallery, hours, contact |
| Clinic / Health | Services, team (optional), hours, contact, map |
| Repair / Workshop | Services, area served, contact, hours |
| Tutor / Coach | Services/courses, about, contact, booking (if paid) |
| Cafe / Restaurant | Menu or “what we offer”, hours, location, contact |
| Local service (generic) | About, services, contact, hours, map |

Each template is **mobile-first**, same max pages (3 free, 10 paid), and includes contact + hours + map by default.

---

## 7. Out of scope (keep it simple)

- No full drag-and-drop page builder.
- No “add any section from a big library” in v1.
- No custom CSS or advanced layout control.
- Optional later: “Switch template” (replace current site with another template, keep content where possible).

---

*This doc defines the intended site-builder experience. Implementation details (editor tech, preview mode, publish pipeline) can go in a separate technical spec.*
