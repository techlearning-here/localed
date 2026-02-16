# localed.info — Subdomain vs Path: Which Is Better?

**Question:** Should customer sites live at **`businessname.localed.info`** (subdomain) or **`localed.info/businessname`** (path)?

**Short answer:** **Path (`localed.info/name-of-business`) is better for us** for MVP: simpler to build, better for SEO and directory, one domain to manage. Subdomain is a good option if we want a stronger “their own address” feel later.

---

## 1. Side-by-side comparison

| Aspect | **Path:** localed.info/joes-salon | **Subdomain:** joes-salon.localed.info |
|--------|-----------------------------------|----------------------------------------|
| **URL example** | `https://localed.info/joes-salon` | `https://joes-salon.localed.info` |
| **Technical** | One domain; Next.js dynamic route `/[siteSlug]`. No wildcard DNS or host-based routing. | Wildcard DNS (`*.localed.info`) + app reads `Host` header to get slug. Wildcard SSL. |
| **SEO** | All content on **one domain** (localed.info). Link equity and authority stay on one site. Directory (e.g. localed.info/salons) and business pages (localed.info/joes-salon) share the same domain. | Subdomains can be treated as **separate** by Google. Authority may be split; we’d rely on same root domain and good internal linking. |
| **Directory** | Natural fit: main site = localed.info, directory = localed.info/salons, business = localed.info/joes-salon. One sitemap, one robots.txt. | Directory likely on localed.info; business sites on *.localed.info. Two hostnames to think about for sitemaps and links. |
| **Branding for business** | Clearly “on localed.info” — good for our brand; some businesses may prefer a more “theirs” URL. | Business name first — feels more like “their” address (e.g. joes-salon.localed.info). |
| **Length / memorability** | Slightly longer: localed.info/joes-salon. | Shorter to say: “joes-salon dot localed info.” |
| **SSL** | Single cert for localed.info (no wildcard needed for customer sites). | Wildcard cert for *.localed.info (standard; Cloudflare/Vercel handle it). |
| **Caching / CDN** | One origin (localed.info). Cache keys by path. Simple. | Same origin if we use one deployment; cache by Host + path. Slightly more to configure. |
| **Implementation** | **Simpler:** one routing model; slug comes from path. | **Extra step:** read `Host`, parse subdomain to get slug; handle apex (localed.info) vs *.localed.info. |

---

## 2. Recommendation: **path first** (localed.info/name-of-business)

**Use path-based URLs for MVP:**

1. **Simpler to build and run** — No wildcard DNS or host-based routing. One dynamic route; slug from path. Fewer moving parts.
2. **Better for SEO and directory** — One domain (localed.info) for homepage, directory, and all business sites. Link equity and trust stay on one property; directory and business pages fit the same sitemap and site structure.
3. **Easier to explain** — “Your site is at localed.info/your-business.” One domain to remember.
4. **Same product outcome** — Businesses still get a clear, shareable URL. We can always add subdomain support later (e.g. optional “use joes-salon.localed.info”) if we want a more “theirs” feel.

**When subdomain might be better:**

- We want to emphasise “your own address” (business name first) for sales or branding.
- We add custom domains later and want subdomain as a stepping stone (e.g. joes-salon.localed.info → joessalon.com).
- We’re willing to handle wildcard DNS and host-based routing and accept slightly split SEO across subdomains.

---

## 3. Subdomain as add-on

- **Default:** All sites get the **path-based** URL: `localed.info/name-of-business`.
- **Add-on:** Paid customers can enable **subdomain** for an extra fee (see [PRICING_OPTIONS.md](./PRICING_OPTIONS.md)). When enabled, the site is reachable at **both**:
  - `localed.info/name-of-business` (path)
  - `name-of-business.localed.info` (subdomain)
- Same content at both URLs. Implementation: add wildcard DNS (`*.localed.info`) and host-based routing in the app; route by subdomain to the same site lookup by slug.

---

## 4. Summary

| Choice | Role |
|--------|------|
| **Path: localed.info/name-of-business** | **Default** (included). Simpler, one domain, better for SEO and directory. |
| **Subdomain: name-of-business.localed.info** | **Paid add-on** for “business name first” branding. Site works at both path and subdomain when add-on is on. |

**Recommendation:** Use **`localed.info/name-of-business`** (path) as the **default** for launch. Offer **subdomain as a paid add-on** (e.g. `businessname.localed.info`) for customers who want the “business name first” URL — see [PRICING_OPTIONS.md](./PRICING_OPTIONS.md). With the add-on, the site is available at both the path and the subdomain (same content).
