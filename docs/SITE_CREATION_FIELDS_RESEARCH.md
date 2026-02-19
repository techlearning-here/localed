# Site creation: competitor comparison & missing details

Research on what competitors and local SEO best practices collect vs what localed currently captures. Use this to decide which fields to add during site creation or in the wizard.

---

## What localed already collects

| Area | Fields |
|------|--------|
| **Identity** | Site name (URL slug), business name, legal name, tagline, logo, favicon, business type, country, languages |
| **SEO / meta** | metaTitle, metaDescription, keywords, shortDescription, priceRange, robotsMeta |
| **About** | about, yearEstablished |
| **Address** | address, addressLocality, addressRegion, postalCode, country, areaServed |
| **Contact** | phone, phone2, email, email2, whatsApp, contactPreference, contact form (subject, reply-to, success message) |
| **Location / map** | mapEmbedUrl, directionsLabel, showMapLink |
| **Hours & booking** | businessHours, specialHours, timezone, bookingEnabled, bookingUrl, bookingSlotDuration, bookingLeadTime |
| **Media** | heroImage, galleryUrls, galleryCaptions, youtubeUrls, otherVideoUrls |
| **Social** | facebook, instagram, youtube, twitter, linkedin, tiktok, other link |
| **CTAs** | ctaLabel/Url (x3) |
| **Commerce / payments** | paymentMethods |
| **Content sections** | services, FAQ, testimonials, team, certifications; section titles for each |
| **UI / layout** | announcementBar, footerText, customDomainDisplay, showBackToTop, newsletter, share section, faqAsAccordion, siteLayout |

---

## What competitors and local SEO collect (we’re missing or weak on)

### 1. **Address / location (Wix, Google, Moz)**

| Field | Used by | Purpose |
|-------|---------|--------|
| **Address description / location instructions** | Wix, many local sites | e.g. “Use the rear entrance”, “Next to the bank” – helps customers find the place. |
| **Location name** | Wix | Optional name for this location (e.g. “Downtown branch”). |
| **Service area vs physical location** | Google (SAB) | Whether you serve customers at their address (plumber, electrician) vs at your address. Affects whether we show full address or “Serves X area”. |

**Suggestion:** Add **addressDescription** (or **locationInstructions**) and, if you support multi-location later, **locationName**. Optionally add **serviceAreaOnly** (boolean) and **serviceAreaRegions** (e.g. list of cities) for SABs.

---

### 2. **Contact**

| Field | Used by | Purpose |
|-------|---------|--------|
| **Fax** | Moz, many B2B/medical/legal | Still common in some industries. |

**Suggestion:** Add **fax** (optional) in Contact & form step.

---

### 3. **Attributes / amenities (Google Business Profile, local SEO)**

These are the biggest gap: competitors and GBP expose them for discovery and filters.

| Attribute type | Examples | Who uses |
|----------------|----------|----------|
| **Accessibility** | Wheelchair accessible, accessible entrance, accessible restroom | Google, many sites |
| **Parking** | Free parking, paid parking, street parking, valet | Google, restaurants, salons |
| **Service options** | Dine-in, takeout, delivery, curbside pickup | Google, restaurants |
| **Other amenities** | Outdoor seating, Wi‑Fi, 24-hour service | Google, Wix (implied) |
| **Languages spoken** | English, Spanish, etc. | Google, local listings |

**Suggestion:** Add a small **“Attributes”** or **“Details”** block (can live in Basic info or a new step):

- **accessibilityWheelchair** (boolean or short text)
- **parking** (short text: “Free lot”, “Street parking”, “Paid garage”, etc.)
- **serviceOptions** (short text or checkboxes: Dine-in, Takeout, Delivery, Curbside)
- **languagesSpoken** (text or list, if not already covered by site languages)
- **otherAmenities** (optional short text: “Outdoor seating”, “Free Wi‑Fi”, “24/7”, etc.)

You can start with 2–3 (e.g. accessibility, parking, service options) and expand later.

---

### 4. **Categories (Google, Moz)**

We have **business_type** (salon, restaurant, etc.) but not:

- Secondary categories (e.g. “Mexican restaurant”, “Hair salon”).
- Structured category IDs for SEO (e.g. schema.org or GBP-style categories).

**Suggestion:** Later, consider **secondaryCategories** or **refinedCategory** (text or predefined list) for better local SEO and schema.

---

### 5. **Retail / products (Moz, store builders)**

| Field | Purpose |
|-------|--------|
| **Brands carried** | For retail: “Brands we carry”. |

**Suggestion:** Low priority unless you add a “Products / retail” flow; then add **brandsCarried** (text or list).

---

### 6. **Signup / onboarding (Wix, Squarespace, GoDaddy)**

They often ask upfront:

- **Target audience** (e.g. “Retail customers”, “B2B”).
- **Website purpose** (informational, lead capture, bookings, e‑commerce).
- **Domain preference** (name, extension).

We already have **business_type** and **site name (URL)**; purpose is partly implied by features (booking, contact form). Optional: one dropdown for **primaryGoal** (e.g. “Get more calls”, “Book appointments”, “Show my work”) to tailor defaults or templates.

---

## Recommended order to add (for site creation / wizard)

1. **High value, low effort**
   - **addressDescription** – “Location instructions” (one line).
   - **parking** – Short text.
   - **accessibilityWheelchair** – Boolean or short text.

2. **High value, medium effort**
   - **serviceOptions** – Text or checkboxes (Dine-in, Takeout, Delivery, Curbside).
   - **fax** – Optional in Contact step.
   - **serviceAreaOnly** + **serviceAreaRegions** – If you want to support plumbers, electricians, etc.

3. **Nice to have**
   - **languagesSpoken** (if different from site UI languages).
   - **otherAmenities** (free text).
   - **refinedCategory** / **secondaryCategories** for SEO.

4. **Later / if scope expands**
   - **brandsCarried** (retail).
   - **primaryGoal** (onboarding).
   - **locationName** (multi-location).

---

## Summary

- **Already strong:** NAP (name, address, phone), website URL (slug), description, tagline, hours, booking, payments, social, media, certifications, section titles.
- **Main gaps:** Location instructions, accessibility, parking, service options (dine-in/takeout/delivery/curbside), fax, and (for SABs) service-area vs physical location.
- **Quick wins:** Add **addressDescription**, **parking**, and **accessibilityWheelchair** (and optionally **serviceOptions**) so the site and any future local/SEO exports match what competitors and Google Business Profile show.
