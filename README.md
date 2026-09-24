# Dominic Hahm — personal site

Five static pages sharing one stylesheet and one script.

```
index.html        Home — hero, affiliations, about, stats, links onward
experience.html   Five roles, newest first
leadership.html   Elevate panel + Capital Investments at Berkeley
education.html    Degree, awards, programs, toolkit, interests
contact.html      Email, LinkedIn, what's worth writing about

assets/site.css   All styling. Design tokens live in :root.
assets/site.js    Sticky nav, mobile drawer, scroll reveal.
assets/dominic-hahm.jpg / .webp   Headshot, 4:5 crop
assets/elevate-skyline.jpg        Background texture on the Elevate card
```

Nav, footer, and `<head>` are duplicated across the four inner pages on purpose — no build
step, no dependencies. Edit one, edit all four. The current versions were generated from a
single template; if you change the nav often, that script is worth keeping around.

## Run it

```bash
node serve.mjs             # http://localhost:3000
PORT=3100 node serve.mjs   # if 3000 is taken
```

Screenshots:

```bash
node screenshot.mjs http://localhost:3100 label          # desktop 1440x900 @2x
node screenshot.mjs http://localhost:3100 label --mobile # 390x844
node shot.mjs http://localhost:3100/experience.html out.png 1440 900   # settled full page
```

`shot.mjs` exists because `screenshot.mjs`'s full-page capture fires before the scroll-reveal
transitions finish and before `loading="lazy"` images below the fold load, which leaves the
lower sections blank in the PNG. `shot.mjs` forces both, then captures.

## No logos

Every company mark was removed. Organisation names now appear as type — the affiliations strip
on the home page, the panelist roster on the leadership page, the monogram tiles in the
timelines. Nothing loads a third-party brand asset.

The sourced logo files are not deleted, just out of the project. They're at
`/private/tmp/claude-501/-Users-rishipatari-Downloads/51037f95-f6ed-4917-82a0-493a9ba2fc2a/scratchpad/logos-backup/`
along with `index-singlepage-backup.html`, the previous one-page version. That directory is
session-scoped — copy anything you want to keep somewhere permanent.

## Still to fill in

- **LinkedIn URL** — every LinkedIn link points at `https://www.linkedin.com/` and is tagged
  `data-linkedin`. Find them with `grep -rn 'data-linkedin' *.html` (seven across five pages).
- **Résumé PDF** — no download link yet. Worth adding to the Contact page.

## Deliberately left off

Dominic's home address and phone number are on the résumé but not on this site. Public personal
sites get scraped; email plus LinkedIn is the safer contact surface. Easy to add back.

## Design notes

- Navy layering: `--surface-base` #050A18 → `--surface-elevated` → `--surface-floating`
- Accent is a champagne gold (`--gold-500` #C8A45C), not a stock Tailwind color
- Playfair Display (headings) / Inter (body) / IBM Plex Mono (labels, dates, figures)
- Atmosphere is four stacked radial gradients + an SVG `feTurbulence` grain layer
- Only `transform` and `opacity` animate; no `transition-all`
- Sections carry `scroll-margin-top:88px` so the fixed nav never covers an anchored heading
- Current page is marked with `aria-current="page"` in both the desktop nav and the drawer
