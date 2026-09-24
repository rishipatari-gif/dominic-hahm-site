# Dominic Hahm — personal site

Five static pages. No build step, no dependencies, no framework. Open `index.html` in a
browser and it works.

```
index.html        Home — hero, affiliations, about, stats, links onward
experience.html   Five roles, newest first
leadership.html   Elevate panel + Capital Investments at Berkeley
education.html    Degree, awards, programs, toolkit, interests
contact.html      Email, LinkedIn, what's worth writing about

assets/site.css   All styling. Design tokens live at the top, in :root.
assets/site.js    Sticky nav, mobile drawer, scroll reveal.
assets/dominic-hahm.jpg / .webp   Headshot, 4:5 crop
serve.mjs         Optional local preview server (Node built-ins only)
```

---

## Before you publish: one edit

There's no résumé download link yet. If you want one, drop the PDF in `assets/` and add a
button on `contact.html` next to the email button.

---

## Publish it free on GitHub Pages

This gives you `https://<your-username>.github.io` — free, no domain purchase, no account
upgrade. Takes about five minutes.

### 1. Make a GitHub account

If you don't have one: [github.com/signup](https://github.com/signup). **The username becomes
your URL**, so pick it deliberately — `dominichahm` gives you `dominichahm.github.io`.

### 2. Create the repository

On GitHub, click **New repository**. Two choices:

| Repo name | Your URL |
|---|---|
| `<your-username>.github.io` | `https://<your-username>.github.io` ← shortest |
| anything else, e.g. `site` | `https://<your-username>.github.io/site` |

Set it to **Public** (Pages requires this on the free plan). Don't add a README, `.gitignore`,
or licence — this folder already has what it needs.

### 3. Push this folder

In Terminal, `cd` into this folder, then:

```bash
git init -b main
git add -A
git commit -m "Personal site"
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Git will ask you to sign in the first time. If it asks for a password, it wants a
[personal access token](https://github.com/settings/tokens), not your account password —
or install [GitHub CLI](https://cli.github.com) and run `gh auth login` first, which handles it.

### 4. Turn on Pages

Repo → **Settings** → **Pages** → under *Build and deployment*, set **Source** to
`Deploy from a branch`, **Branch** to `main` and folder to `/ (root)`. Save.

Wait a minute or two, refresh, and the live URL appears at the top of that page.

### 5. Later: updating it

Edit the files, then:

```bash
git add -A
git commit -m "what changed"
git push
```

Pages redeploys on its own within a minute.

---

## Optional: your own domain

If you'd rather have `dominichahm.com` than `dominichahm.github.io`, buy the domain anywhere
(~$12/year), then:

1. Create a file named `CNAME` in this folder containing one line: `dominichahm.com`
2. At your domain registrar, add four `A` records for the root, pointing at
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
3. Add a `CNAME` record for `www` pointing at `<your-username>.github.io`
4. Repo → Settings → Pages → enter the domain under *Custom domain*, then tick
   **Enforce HTTPS** once the certificate finishes provisioning

---

## Preview locally before pushing

Double-clicking `index.html` works fine. If you'd rather use a real server (closer to how it
behaves live), and you have Node installed:

```bash
node serve.mjs          # http://localhost:3000
PORT=3001 node serve.mjs   # if 3000 is busy
```

---

## Design notes

- Navy layering: `--surface-base` #050A18 → `--surface-elevated` → `--surface-floating`
- Accent is a champagne gold, `--gold-500` #C8A45C
- Playfair Display (headings) / Inter (body) / IBM Plex Mono (labels, dates, figures)
- Flat surfaces throughout — no gradients anywhere, depth comes from hairline borders and
  a single elevated surface colour
- Only `transform` and `opacity` animate; reduced-motion is respected
- Sections carry `scroll-margin-top:88px` so the fixed nav never covers an anchored heading
- Nav, footer and `<head>` are duplicated across the five pages on purpose — change one,
  change all five
- No third-party brand assets anywhere. Company names are set in type.
