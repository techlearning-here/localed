# localed.info — Appointment Booking Integration

**Purpose:** How to add appointment booking support so business owners (paid tier) can accept bookings on their site. Covers **integrate** (Cal.com / Calendly) vs **build in-house**, and how it fits the stack.

---

## 1. What we need (product)

- **Visitor:** Chooses date/time (and optionally service), enters name/email/phone, submits.
- **Business owner:** Gets notified (email + optional dashboard); sees upcoming/canceled bookings.
- **Optional:** Calendar sync (Google/Outlook), reminders to customer, buffer time, multiple services with different durations.

**Scope for v1:** Simple slots (one or a few “event types”), one-step book, email to owner and customer. Calendar sync and advanced rules can be v2.

---

## 2. Two approaches

| Approach | Pros | Cons |
|----------|------|------|
| **Integrate** (Cal.com, Calendly, etc.) | Fast to ship; availability, reminders, calendar sync handled by them; familiar UX. | Dependency; branding; possible cost per seat or event; less control over UI/data. |
| **Build in-house** | Full control; data in our DB; no per-booking fee; matches our branding. | We build availability engine, UI, emails, reminders; more dev and ongoing work. |

---

## 3. Option A: Integrate (Cal.com or Calendly)

### 3.1 How it works

- **Business owner** (in our dashboard): Turns on “Appointments” (paid tier), then either:
  - **Link:** Enters their **Cal.com** or **Calendly** booking link (e.g. `https://cal.com/joes-salon/30min`), **or**
  - **Connect:** Signs in with Cal.com/Calendly (OAuth) and we list their event types; they pick one (or more) to show on the site.
- **On the published site:** We show a “Book now” button (or “Appointments” in nav). Click opens:
  - **Inline embed** of their Cal.com/Calendly scheduler (iframe or Cal.com React embed), **or**
  - **New tab** to their booking page.
- **Availability, reminders, calendar sync** are all handled by Cal.com/Calendly. We only store the link (or selected event type) and render the embed/button.

### 3.2 Single account, multiple websites

**One provider account (Cal.com or Calendly), many localed sites:**

- The **owner** has one localed account and can create **multiple websites** (multiple rows in `localed_sites`, each with its own slug, e.g. `joes-salon`, `joes-salon-downtown`).
- They use **one** Cal.com or Calendly account (one login with the provider). In that account they can create **multiple event types** (e.g. “30 min”, “60 min”, or “Main location” / “Downtown location”).
- **We store booking config per site.** Each website (each `localed_sites` row) has its own:
  - `booking_enabled` (on/off),
  - `booking_provider` (`calcom` | `calendly`),
  - `booking_url` (or `booking_embed_config` with event type id).

**How it works in practice:**

| Owner has | Provider account | Per-website (per site) |
|-----------|------------------|-------------------------|
| One localed account | One Cal.com or Calendly login | Each site has its own “Booking link” (or “Connect” → pick event type) in the editor for that site |
| Multiple sites (e.g. 3) | Same Cal.com/Calendly account | Site A → link to event type “30 min”; Site B → link to “60 min” or “Downtown”; Site C → booking off, or same link as A |

So: **one account with the provider**, but **each website is configured individually** in our dashboard. The owner opens the editor for Site A, turns on appointments, pastes or picks the link for that site; then does the same for Site B with the same or a different link. No need for multiple Cal.com/Calendly accounts.

**Data model:** All booking fields live **on the site** (e.g. columns on `localed_sites` or a `site_settings` JSON). No separate “booking account” entity; the “account” is the owner’s single Cal.com/Calendly login, and we only store which link/event type to use for each site.

### 3.3 Cal.com (recommended for integrate)

- **Open source;** can self-host or use cal.com cloud.
- **Embed:** [Inline, popup, or floating button](https://cal.com/help/embedding/adding-embed); configurable theme.
- **API:** Create event types, manage availability, read bookings (if we need dashboard later).
- **Pricing:** Free tier for basic use; paid for teams/features. Self-hosted = no per-booking fee.
- **Flow for us:** Store per site: `booking_provider: 'calcom'`, `booking_url` or `calcom_event_type_id`. On site, render Cal.com embed component with that URL.

### 3.4 Calendly

- **Embed:** JavaScript or inline iframe; [embed options](https://help.calendly.com/hc/en-us/articles/223147027-Embed-options-overview).
- **API:** Scheduling API for creating invites; can read events.
- **Pricing:** Free tier (1 event type); paid for more types and features.
- **Flow:** Same idea—store `booking_url`, show “Book” → embed or redirect.

### 3.4.1 Who pays Calendly (or Cal.com)?

**The business owner pays the provider directly.** localed does not pay Calendly or Cal.com.

- The **owner** signs up for their own account at **calendly.com** (or cal.com). They enter their own payment method there if they choose a paid plan.
- **Calendly’s pricing** is between the owner and Calendly: free tier (e.g. 1 event type), or paid plans for more event types, team features, etc. The owner’s subscription and billing are entirely on Calendly’s site.
- **localed** only embeds the owner’s booking link. We charge the owner for *our* paid tier (e.g. “Appointments” enabled on localed); we never charge for or handle Calendly/Cal.com. So:
  - **localed** → owner pays us (e.g. $4/mo for localed paid tier).
  - **Calendly** → owner pays Calendly separately if they use a paid Calendly plan; many can stay on Calendly’s free tier (one event type) and never pay Calendly.
- No reseller or partner payout is required: the owner manages their own Calendly (or Cal.com) account and payment.

### 3.4.2 Is Calendly free tier enough for normal usage?

**Often yes**, for simple “book an appointment” use.

**Calendly free includes:**
- **1 event type** (e.g. “30 min appointment” or “Consultation”).
- **Unlimited bookings** for that one type.
- **1 calendar** (Google, Outlook, etc.).
- **Embed on your website** (so it works with localed).
- **Confirmation emails** to the customer.

So if the business only needs one kind of bookable slot (e.g. “Appointment”, “Haircut”, “Session”), free is enough.

**When free is not enough:**
- They need **multiple event types** (e.g. “Haircut”, “Coloring”, “Consultation” with different durations) → Calendly Standard (paid) for unlimited event types.
- They want **automated reminders** (e.g. “24 hours before”) → Calendly Workflows are on paid plans.
- They want **no Calendly branding** on the booking page → paid only.
- They need **multiple calendars** or **team/round-robin** → paid.

**Summary:** For many small local businesses (one bookable offering, embed on site, confirmations), Calendly free is fine. We can mention in the dashboard: “One event type is enough for most; upgrade with Calendly if you need more.”

*Cal.com’s free tier is similarly generous; check their current limits when implementing.*

### 3.5 Implementation steps (integrate)

**Offer both Cal.com and Calendly.** Let the owner choose their provider, then paste a link (or connect) for that provider.

1. **Dashboard (editor):**  
   - Toggle “Enable appointments” (paid tier only).  
   - **Provider choice:** Dropdown or two options: **“Cal.com”** | **“Calendly”**. Store as `booking_provider: 'calcom' | 'calendly'`.  
   - Then, depending on provider:  
     - **Cal.com:** Field “Cal.com booking link” (paste URL), **or** “Connect Cal.com” (OAuth) → pick event type → save.  
     - **Calendly:** Field “Calendly booking link” (paste URL), **or** “Connect Calendly” (OAuth) → pick event type → save.  
   - On the published site, render the correct embed (Cal.com component vs Calendly iframe) using `booking_provider` and `booking_url`.
2. **DB:** In `sites` or `site_settings`: `booking_enabled`, `booking_provider` (`calcom` | `calendly`), `booking_url` or `booking_embed_config` (JSON).
3. **Published site template:**  
   - If `booking_enabled`, show “Book now” in nav and/or a section.  
   - On click (or in section): render iframe/embed with `booking_url`, or open in new tab.  
   - For Cal.com: use their [embed snippet](https://cal.com/help/embedding/embed-snippet-generator) or React component; pass URL from our content.
4. **No backend for availability:** Cal.com/Calendly handle it. Optionally: webhook from Cal.com to our API to store booking in our DB for “Recent bookings” in dashboard (v2).

---

## 4. Option B: Build in-house (minimal)

### 4.1 What we build

- **Availability:** Owner sets weekly schedule (e.g. Mon–Fri 9–6, 30-min slots) and optional “blocked” dates. Optional: slot duration per service.
- **Slots:** Backend computes “available slots” for next N days (e.g. 14 or 30) from schedule minus existing bookings and blocked dates.
- **Booking:** Visitor picks date → we show available times → they pick time, enter name/email/phone (and optionally service) → submit. We create a row in `bookings`, send confirmation email to customer and owner.
- **Dashboard:** Owner sees list of upcoming (and past) bookings; optional cancel/reschedule.

### 4.2 Data model (Supabase)

- **`site_booking_settings`** (or in `sites` JSON):  
  `enabled`, `slot_duration_minutes`, `buffer_between_minutes`, `advance_booking_days`, `weekly_schedule` (e.g. `{ "mon": [9,18], "tue": [9,18], ... }`), `blocked_dates` (array of dates), `services` (optional: id, name, duration).
- **`bookings`:**  
  `id`, `site_id`, `service_id` (optional), `customer_name`, `customer_email`, `customer_phone` (optional), `slot_start` (timestamptz), `slot_end`, `status` (`confirmed` | `cancelled`), `created_at`, `updated_at`.

### 4.3 API (Next.js)

- `GET /api/sites/[siteSlug]/booking/availability?date=YYYY-MM-DD` → return array of slot times (e.g. `["09:00","09:30",...]`) for that day.
- `POST /api/sites/[siteSlug]/booking` → body: `{ date, time, serviceId?, name, email, phone? }` → validate slot free, insert `bookings`, send emails, return success.
- `GET /api/dashboard/sites/[id]/bookings` → (auth) list bookings for owner.
- `PATCH /api/dashboard/sites/[id]/bookings/[bookingId]` → (auth) cancel or reschedule.

### 4.4 UI on published site

- “Book” button or “Appointments” section.
- Step 1: Choose date (calendar or list of next 7–14 days).
- Step 2: Choose time (list of available slots from availability API).
- Step 3: Form (name, email, phone, optional service) → submit to booking API.
- Thank-you message; “You’ll receive a confirmation email.”

### 4.5 Emails

- **To customer:** “Your appointment at [Business name] on [date] at [time] is confirmed.”
- **To owner:** “New booking: [Customer] on [date] at [time].” (Use Resend/SendGrid from [TECH_STACK.md](./TECH_STACK.md).)

### 4.6 Optional later

- Reminder email (e.g. 24h before) via cron or queue.
- Google/Outlook calendar sync (export .ics or use provider APIs).
- Owner dashboard: list bookings, cancel, reschedule.

---

## 5. Recommendation

| Phase | Approach | Reason |
|-------|----------|--------|
| **v1 / MVP** | **Integrate (Cal.com preferred)** | Fastest: store link or connect once, embed on site. No availability engine, no email logic for booking. Owner manages everything in Cal.com. |
| **Alternative v1** | **Minimal in-house** | If we want zero dependency and full control from day one: simple weekly schedule + slots in DB + one booking form + two emails. More work but doable. |
| **v2** | **In-house or hybrid** | If we need “bookings inside our dashboard,” “no Cal.com branding,” or paid features without Cal.com cost: add in-house availability + booking API and UI; keep embed as optional. |

**Practical choice:** Start with **Cal.com and Calendly** as two options. In dashboard: “Enable appointments” → **choose Cal.com or Calendly** → paste booking link (or Connect) → save. On site: “Book now” opens the correct embed for the chosen provider. No backend for slots or reminders in v1. Add in-house later if we want a unified dashboard and no third-party dependency.

---

## 6. How it fits the rest of the stack

- **Paid tier only:** Booking is a paid feature; gate “Enable appointments” on `sites.plan === 'paid'` (and Stripe subscription active).
- **Templates:** Each template that supports booking has a “Book” CTA and a section or modal for the embed. Content blob includes `booking_enabled`, `booking_url` (or `booking_embed_config`).
- **Multi-language:** Button label “Book now” / “Appointments” comes from site content per locale. Cal.com/Calendly page can be in their language separately.
- **Tech stack:** No new services; only new DB fields and dashboard/site UI. Emails (in-house path) use existing Resend/SendGrid from [TECH_STACK.md](./TECH_STACK.md).

---

## 7. Summary

- **Integrate (v1):** Owner adds Cal.com (or Calendly) link in dashboard; we show “Book now” and embed on their site. Easiest and fastest.
- **In-house (v1 or v2):** We add `site_booking_settings` + `bookings` table, availability API, booking form on site, confirmation emails, and optional owner dashboard. Full control and no per-booking fee.
- **Recommendation:** Ship **Cal.com (or Calendly) embed** first; consider **in-house** when we need unified booking list, no external branding, or tighter control over UX and data.
