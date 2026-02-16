# localed.info — Domain and Subdomains

**Purpose:** How many subdomains can we have for **localed.info**? Short answer: **no practical limit from DNS or SSL** — we use one wildcard; the limit is our product and database.

---

## Short answer

**Effectively unlimited.** We do **not** create a separate DNS record per customer. We use **one wildcard subdomain** (`*.localed.info`) that points to our app. Every address like `joes-salon.localed.info`, `another-business.localed.info`, etc. already resolves to the same place. How many “subdomains” (sites) we can have is limited by how many sites we store in the database and any product limits we set (e.g. free vs paid), not by DNS or certificates.

---

## How it works

| Layer | What we use | Limit on “number of subdomains”? |
|-------|-------------|-----------------------------------|
| **DNS** | **One wildcard record:** `*.localed.info` → points to our app (Cloudflare Pages or Vercel). | **None.** Any subdomain (e.g. `anything.localed.info`) resolves to the same app. We don’t add a new DNS record per business. |
| **SSL/TLS** | **One wildcard certificate:** `*.localed.info` (issued by Let’s Encrypt, Cloudflare, or Vercel). | **None.** One cert covers all subdomains. |
| **Hosting** | One deployment; we add **one custom domain** (e.g. `localed.info` + `*.localed.info`) to the project. | **None** from subdomain count. Platform limits are on domains per project (we use 1–2: apex + wildcard). |
| **Application** | App receives request, reads **hostname** (e.g. `joes-salon.localed.info`), extracts **slug** (`joes-salon`), looks up site in DB. | **No technical limit** on number of slugs/sites. Only limits: DB size and any **product** limits (e.g. max sites per user, or total sites). |

So: **as many subdomains as we need** — one per site slug. No need to “create” subdomains in DNS; they’re all covered by the wildcard.

---

## Path-based alternative

If we use **path-based** URLs instead (e.g. `localed.info/joes-salon`), there are **no subdomains** for customer sites — only the main domain. Then “how many” is just how many paths (slugs) we support in the app and DB. Same idea: no DNS limit.

---

## Summary

| Question | Answer |
|----------|--------|
| How many subdomains can be created for localed.info? | **As many as we have sites.** We use one wildcard `*.localed.info`; we don’t create a new subdomain per customer in DNS. |
| Do we need to add DNS for each new customer? | **No.** One wildcard covers all. |
| What limits the number of sites? | **Our database and product rules** (e.g. plan limits, max sites per user), not DNS or SSL. |
