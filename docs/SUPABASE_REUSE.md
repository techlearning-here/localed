# localed.info — Using Your Existing Supabase for Google OAuth and Database

**Purpose:** Yes, you can use your **existing Supabase project** (the one used by LaunchMitra/StartupSaathi) for localed.info: same **Google OAuth** and same **database**, with localed.info data kept separate.

---

## 1. Short answer

- **Google OAuth:** Yes. Use the same Supabase project. Add localed.info’s callback URL to Supabase and to your Google OAuth client.
- **Database:** Yes. Use the same Supabase project. We use **Option A: table prefix** — all localed.info tables use the `localed_` prefix so LaunchMitra and localed.info data don’t mix.

No need for a second Supabase project unless you want strict billing or team separation.

---

## 2. Google OAuth with the same Supabase project

Supabase Auth supports **multiple redirect URLs** in one project. LaunchMitra already uses one origin (e.g. your Vercel app); localed.info will use another (e.g. `https://localed.info` or a different Vercel deployment).

### 2.1 Supabase Dashboard

1. **Authentication → URL Configuration**
2. Under **Redirect URLs**, add:
   - Production: `https://localed.info/auth/callback` (or your real localed.info domain)
   - Local dev (if needed): `http://localhost:3001/auth/callback` (use a different port if LaunchMitra runs on 3000)
3. Save.

### 2.2 Google Cloud Console (same OAuth client)

1. Open the same **OAuth 2.0 Client ID** you use for LaunchMitra (or create one for localed.info if you prefer).
2. Under **Authorized redirect URIs**, add:
   - `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`  
     (Supabase only needs one redirect from the browser to *Supabase*; the “redirect URL” you pass in `signInWithOAuth` is the one Supabase will send the user back to after auth. So you may already have the Supabase callback here. The **application** redirect is configured in Supabase → Redirect URLs above.)
3. In practice: Supabase sends users to Google, then Google redirects to **Supabase** `/auth/v1/callback`, and Supabase then redirects to **your app** using the URL you passed in `redirectTo`. So the only extra URI you often need in Google is the Supabase callback. If LaunchMitra already works, the same client usually works for localed.info as long as **Supabase** has localed.info in its Redirect URLs list.

So: **add localed.info’s callback to Supabase Redirect URLs**; keep using the same Google OAuth client unless you want a separate one for branding.

### 2.3 In the localed.info app

Use the same env vars as LaunchMitra (or a separate `.env` with the same values):

- `NEXT_PUBLIC_SUPABASE_URL=https://rsidynlhetwixruotztz.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>`

In code, `redirectTo` should be the **current app’s** origin, e.g.:

```ts
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

When the app is at `https://localed.info`, that will be `https://localed.info/auth/callback`, which must be in Supabase Redirect URLs (step 2.1).

---

## 3. Database: same project, table prefix (Option A — chosen)

We use the **same** Supabase project and **table prefix** for all localed.info tables. LaunchMitra tables (`notes`, `profiles`, etc.) stay unchanged.

### 3.1 Table names (prefix `localed_`)

Create all localed.info tables with the prefix `localed_`:

- `localed_sites`
- `localed_contact_submissions`
- `localed_bookings`
- `localed_site_booking_settings` (if you add in-house booking later)

No separate schema; all in the default `public` schema. In queries and RLS you reference these table names directly (e.g. `localed_sites`).

### 3.2 Shared `auth.users`

Both apps use the same **Supabase Auth** and same **auth.users** table. So:

- The same person can sign in to **LaunchMitra** and **localed.info** with the same Google account; they’ll have one `auth.users` row, two “products” (LaunchMitra data in one set of tables, localed.info in another).
- If you want “one account for both” (e.g. “Sign in with Google” and see both products in one dashboard later), this is ideal. If you want **strictly** separate user bases (different emails per product), you’d need a **separate Supabase project** for localed.info so it has its own `auth.users`.

For most cases, **shared auth.users** is fine: same Supabase project, same Google OAuth, separate tables for localed.info.

### 3.3 RLS (Row Level Security)

- Enable RLS and write policies on `localed_*` tables (e.g. `localed_sites`, `localed_contact_submissions`, `localed_bookings`) so that:
  - Only the **site owner** (e.g. `auth.uid() = owner_id`) can update/delete their sites and related data.
  - Public read (or read via your API with anon key) only for **published** site content, if you serve it from the app.
- LaunchMitra RLS stays on its own tables; no need to touch it.

---

## 4. Summary

| Item | Use existing Supabase? | What to do |
|------|-------------------------|------------|
| **Project** | Yes | Same project (`rsidynlhetwixruotztz`). |
| **Google OAuth** | Yes | Add localed.info callback URL in Supabase → Auth → URL Configuration; same Google OAuth client is fine. |
| **Auth (auth.users)** | Shared | Same Supabase = same users; one Google account can sign in to both apps. |
| **Database** | Same project, **table prefix** | Tables: `localed_sites`, `localed_contact_submissions`, `localed_bookings` (and `localed_site_booking_settings` if needed). Do not reuse LaunchMitra tables. |
| **Env** | Same URL + anon key | In localed.info app use same `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or a copy). |

---

## 5. When to use a separate Supabase project instead

Create a **new** Supabase project for localed.info only if you want:

- **Billing isolation** (separate usage and limits),
- **Separate user bases** (different auth.users so the same email is not shared),
- **Different region or team**,

Otherwise, **reusing the existing Supabase account for Google OAuth and database is supported and keeps setup simple.**
