# Content plan by site type

**Purpose:** Define what content we plan, suggest, and (for Create with assistance) pre-fill per business type. Static seed and future AI both use this plan so content is consistent and type-appropriate.

---

## Overview

| Site type       | Focus sections              | Services / offerings     | Primary CTA   |
|----------------|-----------------------------|---------------------------|--------------|
| **Salon**      | Services, team, testimonials| Hair, nails, styling      | Book now     |
| **Clinic**     | Services, team, credentials | Consultations, check-ups   | Book / Call   |
| **Repair**     | Services, FAQ               | Repair types, turnaround  | Get quote     |
| **Tutor**      | Subjects, credentials       | Subjects, levels          | Book session  |
| **Cafe**       | Menu, hours, gallery        | Food, drinks (or menu)    | View menu     |
| **Local service** | Services, area served    | Service list, coverage    | Contact       |
| **Other**      | About, contact, services    | Generic offerings         | Contact       |

---

## 1. Salon / Beauty

- **Identity:** Business name, tagline (e.g. “Your neighborhood hair & beauty studio”), short description for hero.
- **Sections to emphasize:** Services (with categories: Hair, Nails, Styling), Team (stylists), Testimonials, FAQ.
- **Services:** Haircut, coloring, blow dry, manicure/pedicure; use duration and “From $X” where relevant.
- **FAQ themes:** Walk-ins, payment methods, booking, cancellation.
- **CTAs:** Book now, Call us, View services.
- **Optional:** Certifications (e.g. color specialist), year established.

---

## 2. Clinic / Health

- **Identity:** Name, tagline (e.g. “Quality care close to home”), short description.
- **Sections to emphasize:** Services/Specialties, Team (doctors/staff), Certifications, FAQ.
- **Services:** Consultation, check-up, specific treatments; use “Consultation” or “General check-up” as entry.
- **FAQ themes:** Appointments, insurance, first visit, hours.
- **CTAs:** Book appointment, Call us, Contact.
- **Template extra:** “Specialties intro” (Classic template).

---

## 3. Repair / Workshop

- **Identity:** Name, tagline (e.g. “We fix it right the first time”), short description.
- **Sections to emphasize:** Services (repair types), FAQ (turnaround, warranty, area served).
- **Services:** By repair type (e.g. Phone repair, Appliance repair); duration or “Get quote”.
- **FAQ themes:** Turnaround time, warranty, service area, walk-in vs appointment.
- **CTAs:** Get quote, Call us, Contact.

---

## 4. Tutor / Coach

- **Identity:** Name, tagline (e.g. “Personalized learning for every student”), short description.
- **Sections to emphasize:** Services (subjects/levels), Team (tutor bio), Testimonials, FAQ.
- **Services:** By subject or level (e.g. Math, English, Test prep); duration (e.g. 1-hour session).
- **FAQ themes:** Booking, session format (in-person/online), pricing, first session.
- **CTAs:** Book session, Contact, View subjects.

---

## 5. Cafe / Restaurant

- **Identity:** Name, tagline (e.g. “Fresh coffee and homemade treats”), short description.
- **Sections to emphasize:** Services/Menu, Hours, Gallery, optional Testimonials.
- **Services:** Use as “What we offer” or menu categories (e.g. Coffee, Breakfast, Lunch); price where relevant.
- **FAQ themes:** Reservations, dietary options, hours, parking.
- **CTAs:** View menu, Call us, Directions.

---

## 6. Local service

- **Identity:** Name, tagline (e.g. “Trusted local experts”), short description.
- **Sections to emphasize:** Services, Area served, FAQ, Contact.
- **Services:** List main services; optional “Get quote” or “Contact for price”.
- **FAQ themes:** Service area, booking, pricing, availability.
- **CTAs:** Get quote, Contact, Call us.

---

## 7. Other

- **Identity:** Generic name and tagline (“Serving the community”).
- **Sections to emphasize:** About, Contact, optional Services and FAQ.
- **Services:** Generic “Service 1 / 2” or leave for user to replace.
- **FAQ / CTAs:** Contact-focused.

---

## Implementation

- **Static seed:** `lib/content-plan.ts` defines a structured plan per type; `lib/seed-content.ts` uses it to build full sample content.
- **Future AI:** Same plan can drive prompts or expected structure when calling the external AI endpoint (e.g. “Generate services for clinic type: …”).
