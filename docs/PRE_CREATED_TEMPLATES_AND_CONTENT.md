# Pre-created templates and content (Mighty Sites–style)

Goal: offer the same kind of experience as Mighty Sites—**industry-specific templates**, **pre-written content**, **curated images**, **color palette per type**, and **instant deploy**—so a user gets a full, coherent site from minimal input and **then edits**. For a user-friendly edit experience (edit on the template, with UI under each section so the user sees what changes apply), see [UI_BASED_TEMPLATE_EDITOR.md](./UI_BASED_TEMPLATE_EDITOR.md).

---

## 1. Template selection — industry-specific, many options

**Competitor:** Hundreds of templates; business type picks the right one (layout + section structure).

**Localed today:** We have **2 templates per business type** (e.g. Modern, Classic) in the template catalog; user chooses in the wizard. Layout and section structure are defined per template.

**To align:**

- **Short term:** Keep 2 per type; ensure each template has a clear **layout + section structure**. For making templates visually distinct and comparable to competitors (layout variants, description, preview), see [TEMPLATES_GOOD_AS_COMPETITORS.md](./TEMPLATES_GOOD_AS_COMPETITORS.md). Document this so “business type → template” is explicit.
- **Later:** Add more templates per business type (e.g. 3–4 per type) or more business types so we approach “many industry-specific templates.” Each new template = new layout/section variant; still chosen by business type (and optionally a “style” picker: Minimal, Bold, etc.).

**Acceptance:** When user picks business type (and optional style), they see only templates valid for that type; selected template drives layout and sections on the published site.

---

## 2. Pre-written content — applied automatically

**Competitor:** Each template ships with professional, industry-relevant starter copy (headlines, about, services, CTAs). Applied automatically when the site is created.

**Localed today:** We have a **content plan** per business type (`lib/content-plan.ts`) and **“Create with assistance”** — user clicks “Pre-fill with sample content” and we fill the wizard from `getSeedContent(businessType, languages)`. Copy is industry-relevant (salon, clinic, café, etc.). It is **not** applied automatically on create; user must click the button.

**To align:**

- **Auto-apply on create:** When a new site is created (e.g. from “Quick create” or the current create flow), **optionally** pre-fill draft_content from the content plan immediately (same as “Create with assistance” but without the button). Either:
  - **Default on:** Every new site starts with pre-written content for its business type; user can clear or edit. Or
  - **Opt-in:** “Start with sample content for [Business type]?” checkbox on create; if checked, we call the same seed logic and merge into draft.
- **Keep content plan as source of truth:** All pre-written copy stays in the content plan (and seed content); templates only define layout/sections. No duplicate copy per template unless we later add template-specific variants (e.g. “Modern” vs “Classic” headline tone).

**Acceptance:** New site can be created with draft_content already filled with industry-relevant sample copy (headlines, about, services, CTAs, etc.) so the user sees a “full” site from step one and only edits.

---

## 3. Curated images — stock per industry

**Competitor:** Templates ship with stock images chosen for that industry (or a large library). Business name/location are not used to fetch real photos; they’re for labels/placeholders only.

**Localed today:** We have **placeholder images** per business type (`lib/placeholder-images.ts`) used in the content plan / seed (hero, gallery, logo, service images, team). They are industry-appropriate (e.g. salon, clinic, café). Source can be Picsum or similar; we can swap to a curated set per type.

**To align:**

- **Curated set per business type:** For each business type, define a fixed set of **hero**, **gallery** (e.g. 3–6), **service** (e.g. 2–4), **team** (e.g. 2–3) image URLs. Use royalty-free / project-owned assets. Store in config or `placeholder-images` (e.g. `getPlaceholderImages(businessType)` returns these URLs). Seed content and “Create with assistance” already use placeholders; ensure they use this curated set.
- **Optional “large library” later:** Allow picking from an in-app library (e.g. filtered by “salon”, “café”) for hero/gallery; v1 can stay “one curated set per type.”
- **Labels:** Business name/location are only used in text (e.g. “Welcome to [Business name]”), not to fetch photos. No change needed if we don’t auto-fetch from the web.

**Acceptance:** Every new site created with sample content gets **industry-specific** hero, gallery, and (where applicable) service/team images from a defined set, not random placeholders.

---

## 4. Color palette — per business type

**Competitor:** A color palette is chosen per business type so the site looks coherent without the user picking colors.

**Localed today:** We have **themeColor** in content (single hex, e.g. for buttons/links). Seed content sets a default (e.g. `#0f172a`). We do **not** have a per–business-type palette (primary, secondary, background, etc.) or a “palette” concept in the template.

**To align:**

- **Palette per business type:** Define a small palette per business type, e.g.:
  - `primary` (main CTA/links)
  - `secondary` (optional)
  - `background` or “light” (optional)
  Store in config (e.g. `content-plan` or a new `lib/palettes.ts`). When creating a site or building seed content, set `themeColor` (and any future fields) from that palette.
- **Public site / SinglePageSiteView:** Today we use Tailwind classes; we could inject CSS variables from the palette (e.g. `--color-primary: ...`) so one place controls colors. Or keep a single `themeColor` and map it to the primary role.
- **No user color picker in v1:** “Coherent without the user picking colors” = we choose from the palette; later we can add “Change accent color” with a few presets or a picker.

**Acceptance:** Each business type has a defined color palette; new sites of that type get that palette applied (e.g. themeColor + any CSS variables) so the site looks coherent by default.

---

## 5. Instant deploy — under a minute, then edit

**Competitor:** Site is generated and deployed in under a minute. User then edits in a simple editor: change text, add phone/email/social, upload logo, swap images.

**Localed today:** User creates a site (slug, business type, language, etc.), then goes through the wizard (many steps). They can “Pre-fill with sample content” on step 0. Publish is a separate action. So “instant” is limited by the number of steps and the fact that pre-fill is a manual click.

**To align:**

- **Quick create (minimal input):** Add a flow that collects **only** e.g. business name, location (city/address), business type, country. On submit:
  1. Create site (slug from name, default language, default template for type).
  2. **Auto-apply** pre-written content + curated images + palette (so no “Pre-fill” click needed).
  3. Redirect to editor (or “Your site is ready — edit details”).
  Total time: one short form + one redirect → “under a minute” to a full, editable site.
- **Publish when ready:** User can publish from the editor when they’ve added phone/email/logo/etc. No need to “deploy in under a minute” literally; the **generation** of the full draft is what’s instant. Deploy = publish, at the user’s choice.
- **Simple editor:** Our wizard is the “simple editor”; we can add a “Quick edit” view later (e.g. single page with the most important fields) if we want to emphasize speed.

**Acceptance:** User can complete a “Quick create” form (name + location + type + country) and land on the editor with a **full** draft (pre-written copy, curated images, palette applied) in under a minute; they then edit and publish when ready.

---

## Summary: what we add

| Pillar | Localed today | Change |
|--------|----------------|--------|
| **Template selection** | 2 per business type; user picks in wizard | Keep; document layout/sections; later add more templates per type. |
| **Pre-written content** | Content plan + “Create with assistance” (manual click) | **Auto-apply** on create (or via “Quick create”); same content plan. |
| **Curated images** | Placeholder images per type | **Curated set** per type (hero, gallery, service, team); use in seed. |
| **Color palette** | Single themeColor in seed | **Palette per business type** (e.g. primary); set themeColor/CSS from it. |
| **Instant deploy** | Multi-step wizard; publish separate | **Quick create**: name + location + type → create + auto-fill → redirect to editor; publish when ready. |

---

## Implementation order (suggested)

1. **Pre-written content auto-apply** — Easiest: on create (or when “Quick create” exists), call existing seed logic and merge into draft_content so every new site starts with sample copy.
2. **Curated images** — Replace or extend placeholder-images with a curated set per business type; wire to seed and “Create with assistance.”
3. **Color palette per type** — Add palette config; set themeColor (and any CSS) from it when creating/seed.
4. **Quick create flow** — Single form (name, location, type, country) → create site → auto-apply content + images + palette → redirect to editor.
5. **More templates (later)** — Add more templates per business type for more layout/section variety.

This gives a Mighty Sites–style “pre-created” experience while reusing our existing content plan, templates, and wizard as the editor.
