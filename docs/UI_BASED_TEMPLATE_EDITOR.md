# UI-based template editor (Mighty Sites–style)

**Goal:** After we collect data (wizard or quick create), let the user **edit the site on the template**—see the live layout and matching images, with a **UI-based edit option under each section** so they see exactly what changes will be applied. This is more user-friendly than editing only via wizard steps.

---

## 1. What Mighty Sites does

- **Starts with an appealing template** — Industry-specific layout, matching stock images, clear sections.
- **UI-based edit under each section** — User sees the actual site (or a live preview); each section (Hero, About, Services, Contact, etc.) has an edit control (e.g. “Edit” button or pencil icon). Clicking it opens an editor for that section’s content.
- **See what changes** — Edits apply in context: user changes text or image and immediately sees the result on the template. No mental mapping from “wizard field” to “where this appears on the site.”

**Result:** User confidence is higher because they edit in place and see the final look.

---

## 2. Localed today

- **Wizard collects data** — Step-by-step form (Basic info, Contact, Hours, Template, Template details, Services, FAQ, Testimonials, etc.). All fields are form-based; user does not see the template while filling.
- **Preview and Publish** — After saving, user can open “Preview” to see the site, or “Publish” to go live. To change content, they return to the wizard and find the right step/field.
- **Gap** — No way to “edit on the template”: no section-level edit actions on the preview, no inline or in-context editing. Users must remember which wizard step drives which part of the site.

---

## 3. Proposed: UI-based editor after data collection

**Idea:** After the user has gone through the wizard (or quick create with pre-filled content), offer a **template view** where:

1. **The site is rendered** as it will look when published (same layout, images, sections).
2. **Each section has an edit affordance** — e.g. “Edit” link/button, or pencil icon, or click-to-edit on the section.
3. **Editing is in context** — Clicking “Edit” for a section opens a panel (or modal) with only the fields that belong to that section (e.g. About: headline, year established, about text, price range). Changes save to `draft_content` and the view updates so the user sees the result immediately.
4. **Optional: inline edit** — For simple text (e.g. business name, tagline, short description), allow inline editing on the template (click text → edit → blur to save). More complex fields (lists, images) can stay in a side panel or modal.

**Benefits:**

- User sees **what the site looks like** while editing.
- User sees **which section** they are editing (Hero, About, Services, Contact, etc.).
- Changes are **immediate** in the preview, reducing confusion and support.

---

## 4. How this fits with the wizard

- **Keep the wizard** for initial data collection (and for users who prefer a form). It ensures we gather all required fields and optional sections in one flow.
- **Add “Edit on template” as the next step (or alternative):**
  - **Option A:** After wizard “Finish” or “Create site”, redirect to the **template editor** (preview + section edit controls) instead of (or in addition to) the current edit page. So: Wizard → Template editor → Publish.
  - **Option B:** On the existing edit page, add a **“Edit on template”** mode: toggle or tab that shows the live preview with section edit buttons; clicking a section loads that section’s fields in the side panel. Wizard steps remain available for users who prefer them.
- **Single source of truth** — Template editor reads and writes the same `draft_content` as the wizard; no duplicate data model.

---

## 5. Sections → fields mapping

For each section on the template, we already have a clear mapping to wizard fields (and to `draft_content`). Example:

| Section on template | Fields / content |
|---------------------|------------------|
| Top banner | `announcementBar` |
| Header | `businessName`, `tagline`, `logo`, `businessTypeLabel` |
| Hero | `heroImage` |
| Lead / intro | `shortDescription`, CTAs (`ctaLabel`, `ctaUrl`, etc.) |
| About | `aboutSectionTitle`, `yearEstablished`, `priceRange`, `about` |
| Services | `servicesSectionTitle`, `servicesIntro`, `services[]` |
| Contact | `contactSectionTitle`, address, `phone`, `email`, `whatsApp`, map, etc. |
| Hours | `hoursSectionTitle`, `businessHours`, `specialHours`, `timezone` |
| Gallery | `gallerySectionTitle`, `galleryUrls`, `galleryCaptions` |
| Booking | `bookingEnabled`, `bookingUrl`, etc. |
| FAQ | `faqSectionTitle`, `faq[]` |
| Testimonials | `testimonialsSectionTitle`, `testimonials[]` |
| Team | `teamSectionTitle`, `team[]` |
| Certifications | `certificationsSectionTitle`, `certifications[]` |
| Contact form | `contactFormSectionTitle`, success message |
| Footer | `footerText`, `customDomainDisplay`, `legalName`, social links |

The template editor can group the existing wizard fields by section and show only the relevant ones when the user clicks “Edit” on that section.

---

## 6. Implementation outline

1. **Template editor view** — A page or mode that renders `SinglePageSiteView` (or the same component used for preview) with `draft_content`, so the layout and images match the published site.
2. **Section identifiers** — Sections already have `id` (e.g. `#about`, `#services`). Use the same IDs to attach “Edit” controls to each section (e.g. a floating “Edit section” button or a wrapper that shows on hover).
3. **Section edit panel** — When user clicks “Edit” on a section, open a side panel (or modal) that contains the form fields for that section. Reuse the same field components and handlers as in the wizard; only the grouping and trigger change (section click instead of wizard step).
4. **Save** — On change, PATCH `draft_content` (same as wizard save). Re-render the template view so the user sees the update.
5. **Optional: “Edit on template” entry point** — From the dashboard or edit page, a clear CTA: “Edit on template” or “Edit your live preview” that takes the user to this view.

**Phasing:**

- **Phase 1:** Add a view that shows the preview with section labels and “Edit” buttons that open a side panel with the section’s fields. No inline editing yet.
- **Phase 2:** Inline edit for simple text (business name, tagline, short description) if desired.
- **Phase 3:** Polish (keyboard shortcuts, “Edit next section”, mobile layout for the panel).

---

## 7. Acceptance (for when we implement)

- After creating a site (or after wizard), user can open **“Edit on template”** and see the site as it will look.
- Each visible section (About, Services, Contact, Hours, etc.) has an **“Edit”** control (button or icon).
- Clicking **“Edit”** on a section opens a panel (or modal) with **only the fields for that section**; user can change content and save.
- After save, the **template view updates** so the user sees the new content in place.
- **Wizard** (current edit flow) remains available; both write to the same `draft_content`.
- **Preview** and **Publish** work unchanged; template editor does not change the data model.

---

## 8. References

- **Pre-created experience (templates + content + images):** [PRE_CREATED_TEMPLATES_AND_CONTENT.md](./PRE_CREATED_TEMPLATES_AND_CONTENT.md) — getting to an appealing starting template with matching images is a prerequisite; then “edit on template” makes editing that template user-friendly.
- **Good templates (layout + preview):** [TEMPLATES_GOOD_AS_COMPETITORS.md](./TEMPLATES_GOOD_AS_COMPETITORS.md) — strong templates and section structure make the template editor more valuable.
- **Competitor comparison:** [COMPETITOR_BEST_FEATURES.md](./COMPETITOR_BEST_FEATURES.md) — Mighty Sites and others; “edit under each section” is the UX we are aligning to.
- **Data we collect:** [DATA_WE_COLLECT.md](./DATA_WE_COLLECT.md) — section → fields mapping is derived from the same field list.

*This document captures the product intent. When implementing, add concrete acceptance criteria and test level to the feature list and follow TDD.*
