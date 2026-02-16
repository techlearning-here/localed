# AI features we can include

**Purpose:** List AI-powered features that fit localed (small local business site builder). Focus on reducing friction (“what do I write?”, “I need another language”) and improving quality (SEO, suggestions) without building a generic “AI assistant.”

**Implementation note:** All of these assume an LLM or translation API (e.g. OpenAI, Anthropic, or a translation provider). Calls from our backend or a serverless function; never expose API keys to the client. Consider cost per request and rate limits for free/paid tiers.

---

## 1. AI-generated copy (editor)

**What:** In the editor, “Generate with AI” (or “Suggest”) for text fields so the owner gets a first draft instead of a blank.

**Where it fits:**
- **Short description** — “Generate a 1–2 sentence intro for a [salon/clinic/cafe].”
- **About / long description** — “Write an About us paragraph” (from business name + type + optional bullet points).
- **Tagline** — “Suggest a tagline.”
- **Service names + descriptions** — “I offer Haircut, Coloring, Consultation” → generate one-line descriptions per service.

**Flow:** Owner clicks “Generate” next to a field (or “Fill empty fields”). We send context: business name, business type, existing content, field name. LLM returns text; owner can edit and save.

**Value:** Removes “what do I write?” block; faster first publish.

**Phase:** v2 (already in ADDITIONAL_FEATURES §5 as “AI-powered copy”).

**Cost:** Per-token or per-request; gate on paid tier or limit free users to N generations per month.

---

## 2. Translation (existing content → another language)

**What:** Owner has content in one language (e.g. English). “Translate site to Hindi” (or add language and “Translate from English”) so all text fields are filled in the new language. Owner can edit after.

**Flow:** Owner adds a language in the editor; we copy structure from primary locale and run translation (LLM or translation API) on each text field. Store in `draft_content[locale]`. Optionally: “Translate” button per field for manual add/update.

**Value:** Multi-language is already in scope; many owners won’t translate manually. “I need this in Hindi too” is a common ask.

**Phase:** v2 (already in ADDITIONAL_FEATURES as “AI-powered … translation”).

**Cost:** By character or request; consider per-language or per-site limits.

---

## 3. SEO: meta title & description suggestions

**What:** “Suggest meta title and description” from business name, short description, and business type. Output optimized length (e.g. title ≤ 60 chars, description ≤ 155) and optionally include location/category.

**Flow:** Button in editor (SEO step or Basic info). We call LLM with context; return two strings; owner can edit. Optionally pre-fill on first publish if they left meta empty.

**Value:** Better click-through from search; many owners leave meta blank.

**Phase:** v2 or v1.1 if we add meta fields early.

---

## 4. Editor tips / “Improve this” suggestions

**What:** Lightweight suggestions in the editor, not full copy generation. E.g. “Your short description is short — add a call to action” or “Add a tagline to stand out.” Optional: “Improve this” per field that sends current text to LLM and returns a refined version (owner can accept or discard).

**Flow:** Heuristic tips (e.g. “description &lt; 50 chars”) without AI; optional “Improve this” that calls LLM for one field at a time.

**Value:** Improves quality without being intrusive; competitor “Smart Tasks / AI Agent” inspired.

**Phase:** v2.

---

## 5. Image alt text suggestion

**What:** For hero image and gallery images, “Suggest alt text” for accessibility and SEO. Input: image (or we don’t send image, only context like “Hero for Joe’s Salon, a hair salon”). Output: short alt string. Owner can edit.

**Flow:** Optional: when owner adds an image URL, we could call a vision-capable LLM with the image to suggest alt text (or a text-only LLM with business name + “hero image” / “gallery image N”). Store in content or as separate alt field if we add it.

**Value:** Accessibility and SEO; many leave alt empty.

**Phase:** v2 (after we have meta/SEO in place).

---

## 6. LocalBusiness schema text (if we auto-generate schema)

**What:** When we emit JSON-LD LocalBusiness, some fields are free text (e.g. `description`). We could suggest or fill from short description; no extra AI needed. Only if we add AI for “rich description” would we use LLM here.

**Phase:** Optional; schema can re-use existing copy.

---

## 7. Contact form / inquiry summarization (dashboard)

**What:** In the dashboard, “Summarize” for a contact submission: one-line summary or “Topic: X, Urgency: Y” so the owner can triage quickly. LLM takes the message text and returns a short summary.

**Value:** Saves time when they get many inquiries.

**Phase:** v2 or later.

---

## What we’re not doing (for now)

- **Full-site “AI builder”** (one prompt → whole site): Hard to control quality and structure; our template + fields are clearer for small businesses.
- **AI chatbot on the public site:** Contact form + WhatsApp is enough for MVP; chatbot adds cost and complexity.
- **AI-generated images:** We use owner-uploaded images; no logo or hero generation in scope.
- **Automated “AI agent” that does tasks** (e.g. post to social, audit site): Competitor-style; out of scope for v1/v2. We can do simple “tips” instead.

---

## Summary: priority and phase

| Priority | Feature | Input | Output | Phase |
|----------|---------|--------|--------|--------|
| 1 | AI-generated copy (intro, about, tagline, services) | Business name, type, optional bullets | Draft text per field | v2 |
| 2 | Translation (add language, translate from primary) | All text in source locale | Translated text per field | v2 |
| 3 | SEO meta title/description suggestion | Name, short desc, type | Title + description (length-optimized) | v2 / v1.1 |
| 4 | “Improve this” per field | Current field value + context | Refined text | v2 |
| 5 | Editor tips (heuristic + optional AI) | Current content | Short suggestions | v2 |
| 6 | Alt text suggestion (images) | Image URL or context | Alt string | v2 |
| 7 | Contact submission summarization | Message text | One-line summary | v2 / later |

**Implementation:** Backend or serverless route (e.g. `POST /api/ai/suggest-copy`, `POST /api/ai/translate`) that calls LLM/translation API; editor calls these and fills the form. Use feature flag or plan to gate/limit usage.
