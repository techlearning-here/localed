# localed.info — Hosting Strategy: “Free per customer” (Vercel + ImageKit)

**Purpose:** Evaluate the idea of creating a Vercel account and ImageKit.io account on behalf of each customer and deploying their site there, so it “runs free of cost.”

---

## 1. The idea (summary)

- **Per customer:** Create one Vercel account + one ImageKit.io account (in the customer’s name or on their behalf).
- **Deploy:** Build the customer’s site and deploy it to their Vercel account; serve images via their ImageKit account.
- **Result:** Each site uses that customer’s free tier, so in theory no hosting cost for us or for them.

---

## 2. Verdict: problematic for Vercel; possible for ImageKit with caveats

| Aspect | Assessment |
|--------|------------|
| **Vercel free (Hobby)** | **Not suitable** for customer sites. Hobby is **non-commercial only**. Small business sites are commercial use. |
| **Creating accounts on behalf of users** | **Risky:** no official API, ToS/automation concerns, security (credentials/tokens). |
| **ImageKit free** | May be viable for images (check ToS). “One account per customer” still requires account-creation strategy. |

So: **running “free of cost” by giving each customer their own free Vercel account is not a compliant or safe approach.** Below is the detail and alternatives.

---

## 3. Vercel: why “free per customer” doesn’t work

### 3.1 Hobby plan is non-commercial only

- Vercel’s **Hobby (free) plan is for personal, non-commercial use only.**
- Commercial use (e.g. a small business’s website used for that business) is **not** allowed on Hobby.
- So even if we create a Vercel account “for the customer,” using that free account to host their **business** site would conflict with Vercel’s terms.

So the idea does **not** run “free of cost” in a ToS-compliant way with Vercel free.

### 3.2 Creating Vercel accounts on behalf of customers

- Vercel does **not** offer a public API to “create an account for this user.”
- Automating signup (e.g. headless browser, email verification) would be:
  - **Fragile** (UI changes, captchas, verification flows).
  - **Risky** for terms of service (automated account creation is often restricted).
  - **Security-heavy** if we ever stored or used their Vercel credentials.

So “we create a Vercel account on behalf of the customer” is not a robust or recommended path.

### 3.3 Vercel free tier limits (for reference, if it were allowed)

- **100 GB** Fast Data Transfer/month per account.
- **200 projects** per account.
- **100 deployments/day**, 2,000/week from CLI.
- Build: 45 min/deploy, 1 concurrent build.

---

## 4. ImageKit.io: “free per customer” in theory

- **Free tier:** e.g. 20 GB bandwidth/month, ~3 GB storage (check current docs).
- **Use case:** One ImageKit account per customer could give each business its own 20 GB for images.

**Caveats:**

- **ToS:** Confirm that ImageKit’s free plan allows commercial use and that “creating accounts for end users” (if automated) is allowed.
- **Account creation:** Same issue as Vercel—no standard “create account for user” API. Automating signup is brittle and may violate ToS.
- **Operationally:** Managing many ImageKit accounts (keys, env vars per site) adds complexity.

So: **ImageKit can help keep image costs low**, but “one account per customer, created by us” needs ToS and implementation care; a **single ImageKit account (ours)** for all customer images is simpler and often sufficient for an MVP.

---

## 5. What *does* work: compliant “low / zero cost” options

### Option A: One platform account (we pay; customers get subdomain/path)

- **One** hosting account (we pay) for **all** customer sites.
- Sites are served as:
  - `businessname.localed.info`, or  
  - `localed.info/businessname`
- **Hosting:** Use a provider that allows **commercial** use on free or cheap tier:
  - **Cloudflare Pages** — free tier allows commercial use; generous bandwidth; 500 builds/month.
  - **Netlify** — check current free-tier commercial terms.
- **Images:** One **ImageKit** account (ours); all customer images go through it. Stay within free tier (e.g. 20 GB/mo) or upgrade when needed.
- **Cost:** $0 if we stay within Cloudflare Pages + ImageKit free limits; else low monthly cost. No per-customer Vercel/ImageKit accounts.

**Pros:** ToS-compliant, simple, one place to manage.  
**Cons:** We absorb cost if we scale; need to watch bandwidth/build limits.

### Option B: We pay for one Vercel Pro account

- **One** Vercel **Pro** account (we pay ~$20/mo + usage).
- All customer sites are **projects** (or paths) under that account.
- Same idea: `businessname.localed.info` or `localed.info/businessname`.
- **Images:** Still one ImageKit account (ours).

**Pros:** Same stack you’re used to (Vercel); commercial use is allowed.  
**Cons:** We pay; need to stay within Pro limits (bandwidth, builds, etc.).

### Option C: Customer brings their own Vercel (connect, don’t create)

- Customer signs up for **Vercel** themselves (they can choose Pro if they want commercial use).
- We offer “Connect your Vercel” (e.g. OAuth); we deploy to **their** connected account.
- We do **not** create the account for them.

**Pros:** No ToS issue from us creating accounts; customer owns their infra.  
**Cons:** Friction (customers must have/create Vercel); many small businesses won’t do it. Better for a “pro” tier later.

---

## 6. Recommendation

| Goal | Recommendation |
|------|----------------|
| **Run free / very low cost and ToS-compliant** | **Option A:** Single **Cloudflare Pages** (or similar) account + single **ImageKit** account. All sites under `*.localed.info` or `localed.info/*`. |
| **Stay on Vercel** | **Option B:** One **Vercel Pro** account we pay for; all customer sites on it. |
| **Avoid creating Vercel/ImageKit accounts for users** | Do **not** automate creation of Vercel/ImageKit accounts on behalf of customers; use one account (ours) or “connect your account” (theirs). |

**Summary:** Creating a Vercel account per customer and deploying there is not a good approach: Vercel free is non-commercial, and automating account creation is fragile and risky. Using **one hosting account (ours)**—e.g. Cloudflare Pages or Vercel Pro—plus **one ImageKit account (ours)** keeps things legal, simple, and still low-cost.

---

## 7. If you still want “their resources”

- **Vercel:** Only in a “Connect your Vercel” flow where the **customer** creates and owns the account (and should use Pro for commercial use). We do not create the account.
- **ImageKit:** If ImageKit ToS allows, we could later support “Connect your ImageKit” so power users bring their own; for most users, our single ImageKit account is enough.

---

*References: Vercel Hobby plan and Fair Use guidelines; ImageKit pricing/limits; Cloudflare Pages free tier (commercial use allowed). Re-check official docs before implementation.*
