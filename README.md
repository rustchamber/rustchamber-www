# RustChamber website

The marketing site for [RustChamber](https://github.com/rustchamber/rustchamber), a native
desktop workspace for OpenCode written in Rust.

Repository: <https://github.com/rustchamber/rustchamber-www>

## Stack

- Svelte 5 and TypeScript
- Vite 8
- Tailwind CSS (preflight only; the visual system lives in `src/app.css`)
- Motion for view-triggered animation
- Lucide icons
- Cloudflare Workers with static assets, deployed by Wrangler

## Requirements

Node.js 22 or newer.

## Development

```bash
npm install
npm run dev
```

## Checks and build

```bash
npm run check
npm run build
npm run preview
```

`npm run build` writes the static site to `dist/`.

## Pages

- `/` — home
- `/download/` — macOS build and mobile availability
- `/support/` — help and FAQ
- `/privacy/` — privacy notes
- `/roadmap/` — what is shipping next

## Theme

The site follows `prefers-color-scheme` until the visitor chooses a theme. The sun/moon
button in the navigation switches between light and dark and stores the choice in
`localStorage` under `rustchamber-theme`. The inline script in each HTML entry applies the
theme before first paint, so there is no flash.

The RustChamber screenshots follow the site theme: `assets/screenshots/*.webp` for light and
`assets/screenshots/*-dark.webp` for dark. `ThemeImage.svelte` preloads the other variant for
the priority screenshot, so the first theme switch does not wait for a new download.

## Motion

Animations use [Motion](https://motion.dev/) through `src/lib/reveal.ts`. Headings, copy,
screenshots, page groups and the footer reveal in view with short opacity and vertical
offsets. `prefers-reduced-motion` disables both the Motion reveals and the CSS menu/FAQ
animations.

## Structure

```
assets/
  bg-header-art.png            master header artwork
  logo.png
  og.png                       master social artwork
  og.jpg                       optimized social artwork served to scrapers
  screenshots/                 theme-aware app screenshots
scripts/
  assets/
    lib.mjs
    manifest.json
    sync.mjs
    verify.mjs
src/
  App.svelte
  app.css
  main.ts
  lib/
    Footer.svelte
    ThemeImage.svelte
    Topbar.svelte
    icons/
    pages/
    reveal.ts
    site.ts
    theme.ts
public/
  favicon.svg
  fonts/
```

## Assets (R2 + AVIF)

Master images live in `assets/` and are not part of the site bundle. They are uploaded to the
Cloudflare R2 bucket `assets-projects-lipecode` (account `cdb43b73053a4ce4ffb620649568c034`)
under the project prefix `rustchamber/`, so every project keeps its own folder inside the
shared bucket. The public origin is <https://assets-projects.lipecode.com>.

Use the endpoint `https://cdb43b73053a4ce4ffb620649568c034.r2.cloudflarestorage.com`.

Copy `.env.example` to `.env` and fill in the R2 S3 credentials. Then:

```bash
npm run assets:sync:dry   # list what would be uploaded
npm run assets:sync       # upload missing objects
npm run assets:verify     # HEAD every public URL and its AVIF variant
```

`sync` skips objects that already exist; pass `-- --force` to overwrite and `-- --only=<key>`
to sync a single entry. `verify` fails when a transformed URL does not return `image/avif` or
when an asset exceeds its byte budget.

Images are converted at the edge. Requesting
`https://assets-projects.lipecode.com/cdn-cgi/image/width=2000,quality=60,format=auto/rustchamber/bg-header-art.png`
returns AVIF to clients that accept it; no AVIF files are stored in the bucket. Uploaded
objects carry `Cache-Control: public, max-age=604800, stale-while-revalidate=86400`, so
browsers keep them for a week.

Cloudflare only encodes AVIF up to 2000 px, so the `srcset` widths stop at 2000; wider
requests fall back to WebP. To change an image, prefer a new key and update the caller. If the
key must stay, run `npm run assets:sync -- --force --only=<key>` and purge both the object and
its `/cdn-cgi/image/` URLs in the Cloudflare cache.

## Deployment

Live at <https://rustchamber.lipecode.com>.

The site is a Vite + Svelte static build, not a SvelteKit app, so
`@sveltejs/adapter-cloudflare` does not apply here. It is deployed as a Cloudflare Worker with
static assets using Wrangler.

```bash
npx wrangler login   # first time only
npm run deploy       # builds and runs wrangler deploy
```

The Worker is named `rustchamber-www` and its configuration lives in `wrangler.jsonc`, which
pins the `account_id`. The custom domain `rustchamber.lipecode.com` is attached in the
Cloudflare dashboard, and the `workers.dev` routes are disabled, so that hostname is the only
way to reach the site. `npm run build` writes `dist/`, and `npm run preview:worker` serves that
build locally through Wrangler.

`html_handling: "auto-trailing-slash"` serves `/download/` from `download/index.html` and
redirects `/download` to it. `not_found_handling: "none"` returns a real 404 for unknown paths
instead of the home page.

This repository does not use GitHub Pages.
