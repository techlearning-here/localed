# localed.info — Data We Collect From the Business Owner

**Purpose:** Single list of all details we need from the user to build and run their site. Used by the site builder UX, templates, and (later) API/schema.

---

## 1. Identity and branding

| Field | Required | Notes |
|-------|----------|--------|
| **Business name** | Yes | Display name (and optional legal name if different). |
| **Tagline / slogan** | No | Short line under the name (e.g. “Your neighborhood salon”). |
| **Logo** | No | Image file; used in header and (optionally) favicon. |
| **Favicon** | No | Can be derived from logo if not provided. |

---

## 2. Location and contact (you mentioned)

| Field | Required | Notes |
|-------|----------|--------|
| **Address** | Yes (for map) | Full address for “Find us” and map embed. |
| **Country** | No | ISO country (e.g. India, US); stored at site level in DB and in content. |
| **Location / area served** | No | e.g. “Serving Mumbai and suburbs,” “Downtown only.” |
| **Phone** | Yes (at least one contact) | Primary; optional second number. |
| **Email** | Yes (at least one contact) | For contact form and display. |
| **WhatsApp** | No | Link or number for WhatsApp. |
| **Contact form** | — | Uses email as reply-to; we can add “subject” or “preferred contact” later. |

---

## 3. Business description (you mentioned)

| Field | Required | Notes |
|-------|----------|--------|
| **Short description** | Yes | 1–2 sentences for hero or meta (e.g. “We offer haircuts and styling for all ages.”). |
| **About / long description** | No | Full “About us” text for About page. |
| **Year established** | No | e.g. “Since 2010.” |

---

## 4. Media (you mentioned: image, YouTube)

| Field | Required | Notes |
|-------|----------|--------|
| **Hero image** | Recommended | Main banner on homepage. |
| **Gallery images** | No | Multiple images; optional captions. |
| **Images per service** | No | One image per service if template supports it. |
| **YouTube video links** | No | One or more URLs; we embed on a “Videos” section or About. |
| **Other video** | No (later) | Vimeo, etc., if we add later. |

---

## 5. Services (or equivalent)

| Field | Required | Notes |
|-------|----------|--------|
| **Service name** | Yes (if “services” section exists) | e.g. “Haircut,” “Consultation.” |
| **Service description** | No | Short text. |
| **Service image** | No | Per service. |
| **Duration** | No | e.g. “30 min,” “1 hour.” |
| **Price** | No | Optional; “From $X” or “Contact for price.” |

*For non-service businesses (e.g. cafe), “services” can be “What we offer” / “Menu” / “Products” with same idea: name, description, optional image/price.*

---

## 6. Business hours

| Field | Required | Notes |
|-------|----------|--------|
| **Local timezone** | Yes (for "Open now") | IANA timezone (e.g. Asia/Kolkata) so we can show "Open now" and interpret hours. |
| **Regular hours** | Yes | Open/close per day (e.g. Mon–Fri 9–6, Sat 10–4, Sun closed). |
| **Special hours / holidays** | No | “Closed on Diwali,” “New Year 10–2,” etc. |
| **“Open now”** | — | We derive from hours + timezone (optional). |

---

## 7. Social and external links

| Field | Required | Notes |
|-------|----------|--------|
| **Facebook** | No | Profile/page URL. |
| **Instagram** | No | Profile URL. |
| **YouTube** | No | Channel URL (in addition to specific video links). |
| **Twitter / X** | No | Profile URL. |
| **LinkedIn** | No | Company/personal. |
| **TikTok** | No | Profile URL. |
| **WhatsApp** | No | Already under Contact; can also appear as social. |
| **Other** | No | Single “Other link” (label + URL) if needed. |

---

## 8. Appointments (paid tier)

| Field | Required | Notes |
|-------|----------|--------|
| **Booking enabled** | No | On/off. |
| **Service(s) for booking** | No | Which services can be booked (if multiple). |
| **Slot duration** | No | e.g. 30 min default. |
| **Buffer / lead time** | No | e.g. “Book at least 2 hours ahead.” |

*(Calendar sync, reminders, etc. can be added later.)*

---

## 9. SEO and discovery (optional / later)

| Field | Required | Notes |
|-------|----------|--------|
| **Meta title** | No | Defaults to business name + tagline. |
| **Meta description** | No | Defaults to short description. |
| **Keywords** | No | Optional for meta or directory. |
| **Category / business type** | Yes | Already collected for template; reuse for directory. |

---

## 10. Other useful fields (optional)

| Field | Notes |
|-------|--------|
| **Team / staff** | Name, role, photo, short bio (if template has “Meet the team”). |
| **Testimonials** | Quote, author name, optional photo and rating. |
| **Certifications / awards** | Text or image. |
| **Payment methods** | “We accept Cash, Card, UPI.” |
| **FAQ** | Question + answer pairs (if template supports). |
| **CTA button** | e.g. “Call now,” “Book now” — label + link or action. |

---

## 11. Summary: must-have vs nice-to-have

**Must-have (minimum to build and publish):**
- Business name  
- Short description  
- At least one of: phone, email (or contact form)  
- Address (for map)  
- Business hours  
- Business type (for template)  
- At least one hero or gallery image (recommended; can fallback to placeholder)

**You already called out:** location, contact, business description, image, YouTube video links — all covered above.

**Nice-to-have:** tagline, logo, long about, gallery, services list, social links, testimonials, team, FAQ, booking settings, meta fields.

---

## 12. Per-language (multi-language)

For each **text** field above (name, tagline, descriptions, service names, etc.), we store **one value per selected language**. Media (images, video links) are usually shared across languages unless we add “per-language media” later.

---

*This list drives the editor fields and onboarding. Add or remove fields here as the product evolves.*
