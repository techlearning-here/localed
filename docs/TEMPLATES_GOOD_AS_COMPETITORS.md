# Good templates similar to competitors

Goal: offer **industry-specific, professional templates** comparable to Mighty Sites, Onepager, and Jimdo—clear layout variety, strong design quality, and a template picker that helps users choose with confidence.

---

## 1. What competitors offer

| Aspect | Competitors | Localed today |
|--------|-------------|---------------|
| **Count** | Many per industry (Mighty Sites: “hundreds”; Onepager: industry themes) | 2 per business type (Modern, Classic) |
| **Layout variety** | Different section order, hero style, card vs list, sidebar vs full-width | Single layout for all templates (one section order, one hero style) |
| **Visual differentiation** | Each template has distinct typography, spacing, color use, and density | Modern and Classic use the same SinglePageSiteView; no visual difference |
| **Industry fit** | Templates labeled and designed for salon, café, clinic, etc. | Same layout for all; industry comes from content plan only |
| **Picker UX** | Preview thumbnails or screenshots; short description | Text labels only (“Modern”, “Classic”); no preview or description |
| **Design quality** | Clear hierarchy, whitespace, mobile-first, fast load | Solid base; can improve hierarchy, typography scale, and template-specific styling |

---

## 2. Gaps to close

1. **Templates don’t change layout or look** — “Modern” vs “Classic” only add extra fields; the published site looks the same. We need **layout/variant** (and eventually theme) so each template has a distinct structure and style.
2. **No preview or description** — User can’t see what they’re choosing. We need **description** and, when possible, a **preview image or thumbnail** per template.
3. **Single section order** — All sites use the same sequence (hero → shortDesc → CTAs → About → Services → Contact → …). Competitors offer **alternate orders** (e.g. Services first, or a “focus on contact” layout).
4. **One visual style** — One header style, one hero aspect ratio, one card style. We need **2–3 style variants** (e.g. compact header, full-width hero vs contained, different section backgrounds).
5. **Template catalog is minimal** — Only `id`, `businessType`, `label`, `extraFields`. We need **layoutId**, **description**, optional **previewImageUrl**, and optional **theme** or **style** so the renderer can differentiate.

---

## 3. Template design principles (to match “good” competitors)

- **Visual hierarchy** — Most important content (name, tagline, primary CTA) is largest and first; sections use consistent heading scale and spacing.
- **Whitespace and alignment** — Enough spacing between sections; consistent padding and alignment so the page feels clean and readable.
- **Mobile-first** — Layout and touch targets work on small screens; images and text scale; no horizontal scroll.
- **Section clarity** — Each section has a clear heading (from content or default); sections are visually separated (background, border, or spacing).
- **Industry-appropriate tone** — Template name and description (and, when we have layout-specific copy, the default tone) fit the business type (e.g. “Clean and professional” for clinic, “Warm and inviting” for café).
- **Accessibility** — Semantic HTML, skip link, focus states, sufficient contrast (we already have a base; keep it for every template).
- **Performance** — No heavy assets per template; same image and font discipline across variants.

---

## 4. Plan to get “good templates similar to competitors”

### Phase 1: Template metadata and picker (no new layout yet)

- **Template catalog:** Add to each template:
  - `description` — One line (e.g. “Clean layout with focus on services and contact.”).
  - Optional `previewImageUrl` — Thumbnail/screenshot for the template picker (can be static or generated later).
- **Template picker in wizard:** Show **description** under each template name; optionally show **preview image** when available. Improves confidence without changing the live site yet.

**Deliverable:** User sees “Modern” / “Classic” (and any new templates) with a short description and optional preview.

### Phase 2: Layout variants (2–3 distinct layouts)

- **Layout ID on template:** Add `layoutId` to template definitions (e.g. `"default"` | `"classic"` | `"minimal"`). Current single-page view = `"default"`.
- **Layout behavior:**
  - **default (Modern):** Current SinglePageSiteView — full-width hero, current section order, current spacing and typography.
  - **classic:** Same sections, but e.g. contained width (max-w-4xl), different hero aspect (e.g. 16/9), optional alternate section order (e.g. About before Services), or slightly different heading/card style.
  - **minimal:** Fewer sections by default (e.g. Hero, Short desc, Contact, Footer); or same sections but more compact (smaller headings, less padding).
- **Rendering:** Either (a) pass `layoutId` (from template) into SinglePageSiteView and branch inside the component (sections order, class names), or (b) small wrapper components per layout that compose the same section components in different order/wrappers. Prefer (a) first to avoid duplication.
- **Catalog:** Assign `layoutId` to each template (e.g. all “Modern” → `default`, all “Classic” → `classic`). Add a third template per type later with `minimal` if desired.

**Deliverable:** Choosing “Classic” produces a visibly different layout (contained width and/or different order/style) from “Modern”; “Minimal” optional.

### Phase 3: Visual differentiation per template

- **Theme/palette:** Use [PRE_CREATED_TEMPLATES_AND_CONTENT.md](./PRE_CREATED_TEMPLATES_AND_CONTENT.md) color palette per business type; optionally allow **template** to override (e.g. Classic = warmer, Minimal = monochrome). Apply via `themeColor` or CSS variables.
- **Typography:** Optional **template-level** font or scale (e.g. Classic = slightly larger body, Minimal = tighter scale). Can be driven by `layoutId` or a new `styleId` in the catalog.
- **Section styling:** Per layoutId, use different card styles (e.g. bordered vs shadow), section backgrounds (white vs light gray), or button shape (rounded vs more square). Keep changes CSS-only where possible.

**Deliverable:** Each template feels distinct (layout + color + typography/style) while staying within design principles.

### Phase 4: More templates per business type

- Add a **third (and fourth)** template per business type with new `layoutId` or new section order (e.g. “Focus on services”, “Focus on contact”).
- Ensure each has **description** and, when ready, **previewImageUrl**.
- Optionally add **industry-specific labels** (e.g. “Salon – Modern”, “Salon – Classic”, “Salon – Minimal”) so the catalog scales without confusion.

**Deliverable:** 3–4 templates per type with real layout/visual variety and clear descriptions.

### Phase 5: Industry-specific polish (ongoing)

- **Curated images and copy:** Per [PRE_CREATED_TEMPLATES_AND_CONTENT.md](./PRE_CREATED_TEMPLATES_AND_CONTENT.md), ensure each business type has curated images and pre-written content so every template looks “full” from the start.
- **Template-specific default copy (optional):** For a given template, slightly different default headline or CTA tone (e.g. Classic = more formal). Can live in content plan or a small template-override map.
- **Preview images:** Generate or design a screenshot per template (and per business type if needed) for the picker.

**Deliverable:** Templates feel industry-appropriate and “ready to go” with strong default content and imagery.

---

## 5. Catalog shape (target)

```ts
// Example extended template definition
{
  id: "salon-modern",
  businessType: "salon",
  label: "Modern",
  description: "Clean layout with full-width hero and clear sections. Best for salons that want a contemporary look.",
  layoutId: "default",        // drives section order and wrapper styling
  previewImageUrl?: "/templates/salon-modern.png",
  extraFields: [],
}
```

- **layoutId** is used by the public site (and preview) to choose layout/variant.
- **description** and **previewImageUrl** are used only in the wizard template picker.
- **theme** or **styleId** can be added later for color/typography overrides per template.

---

## 6. Summary

| Step | What we add | Result |
|------|-------------|--------|
| Phase 1 | Description (+ optional preview) per template; show in picker | Users understand what “Modern” vs “Classic” means |
| Phase 2 | layoutId; 2–3 layout variants (default, classic, minimal) in SinglePageSiteView | Two or three distinct layouts, not one |
| Phase 3 | Template or layoutId drives palette/typography/section style | Each template looks and feels different |
| Phase 4 | 3–4 templates per type with new layoutIds | “Many industry-specific templates” like competitors |
| Phase 5 | Curated images + content per type; optional template-specific copy; preview images | Professional, ready-to-use templates |

This gets us to **good templates similar to competitors**: industry-specific, multiple layouts, clear descriptions and previews, and a design standard that matches modern small-business site expectations.
