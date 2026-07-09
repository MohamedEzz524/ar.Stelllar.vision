# Hive Analytics — Offline 1:1 Mirror (Phase 1)

A fully self-contained, offline copy of **https://hiveanalytics.com/** (a Framer-built site).
This runs Framer's *own* compiled React runtime locally, so the look **and** the behavior
(animated counters, services ticker, scroll reveals, menus, video) are identical to the live site.

## How to run

The site uses ES modules + `fetch`, which browsers block on `file://`. So it **must** be served over HTTP.

**Easiest:** double-click `../start-mirror.bat` (opens http://localhost:8899/ automatically).

**Manual:**
```
cd mirror
python -m http.server 8899
# then open http://localhost:8899/
```
(or `npx --yes http-server -p 8899 -c-1 .`)

> Serve from **inside** the `mirror/` folder — all URLs are root-relative (`/framerusercontent.com/...`),
> so the server's web root must be `mirror/`.

## What's inside

| Path | What |
|---|---|
| `index.html` | The desktop document from the live site, with all URLs localized and trackers removed. Contains all 3 responsive breakpoints. |
| `framerusercontent.com/sites/2AHsVZ3GKY6iUSdHVavc08/*.mjs` | The 36 Framer React runtime modules (hydration, animations, components). |
| `framerusercontent.com/images/`, `assets/` | All images (png/webp/jpg/svg), videos (mp4), and Framer-hosted fonts (woff2). |
| `fonts.gstatic.com/` | Google Fonts (Figtree, Manrope, Roboto Condensed). |

## What was changed vs. the live site

- **Localized** every `https://framerusercontent.com` and `https://fonts.gstatic.com` URL to a root-relative
  local path (594 + 22 in the HTML; asset URLs inside the JS modules too).
- **Downloaded** the 36 `.mjs` runtime modules + 68 base image assets that the original capture was missing
  (the capture only saved pre-sized image variants; the runtime requests the base URLs).
- **Stripped** third-party tracking so the clone doesn't phone home to the original's analytics:
  Google Tag Manager (`GTM-P65XV25K`), Framer telemetry (`events.framer.com`), and the Framer editor hook.

## Known limitation

- The **contact form** displays 1:1 but won't actually submit — it posts to Framer's backend
  (`api.framer.com`), which isn't part of an offline mirror. (Phase 2 will wire it to a real endpoint.)

## Fidelity check (automated)

Rendered in headless Chrome at 1440×900: **0 console errors, 0 failed/404 requests**, all sections present
(nav, hero, animated stat counters, testimonials, service cards, 9-step process, creative gallery, form, footer),
171/180 images loaded on first paint (rest lazy-load on scroll).
