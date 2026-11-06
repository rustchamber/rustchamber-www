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
`assets/screenshots/*-dark.webp` for dark. `ThemeImage.svelte` picks the variant for the active
theme from the generated `srcset` and preloads the other one for the priority screenshot, so the
first theme switch does not wait for a new download.

## Motion

Animations use [Motion](https://motion.dev/) through `src/lib/reveal.ts`. Headings, copy,
screenshots, page groups and the footer reveal in view with short opacity and vertical
offsets. `prefers-reduced-motion` disables both the Motion reveals and the CSS menu/FAQ
animations.

## Structure

```
assets/
  bg-header-art.png            master header artwork
  logo.png                     master logo
  og.png                       master social artwork
  screenshots/                 master, theme-aware app screenshots (3024 px)
scripts/
  assets/
    lib.mjs                    R2 signing and upload helpers
    manifest.json              what to upload and its content type
    sync.mjs                   uploads the masters
    verify.mjs                 checks the stored objects and the served images
src/
  App.svelte
  app.css
  main.ts
  lib/
    assets.ts
    Footer.svelte
    ThemeImage.svelte
    Topbar.svelte
    icons/
    pages/
    reveal.ts
    site.ts
    theme.ts
worker/
  index.mjs                    dynamic image endpoint at /img/*
public/
  favicon.svg
  fonts/
  og.jpg                       social artwork for scrapers
```

## Images

Images are resized on demand by the Worker, not at build time. Whenever a page asks for
`/img/<name>-<width>.webp`, `worker/index.mjs` fetches the master from the R2 bucket
`assets-projects-lipecode` (`rustchamber/` prefix, public origin
<https://assets-projects.lipecode.com>), asks Cloudflare Image Resizing for that width as WebP, and
returns the result with a one-year immutable `Cache-Control`. The response is also written to the
Worker cache, so a given width is encoded once per PoP and every later visitor gets it from cache.

```
/img/bg-header-art-1600.webp
/img/screenshots/rustchamber-chat-2000.webp
```

Nothing about a width is baked into the build: the `srcset` in `ThemeImage.svelte` asks for 640,
960, 1280, 1600 and 2000, and any other width works if added there later, with no rebuild and no
new files. `sizes`, not the build, decides what a phone or a retina laptop downloads.

Quality lives in the `SOURCES` map in `worker/index.mjs`: screenshots are served at WebP quality
95, the painted header artwork at 92, the logo at 90. That is deliberately high — the loss this
site used to have came from `format=auto` (AVIF) at quality 60-62, which smears UI text and bands
gradients. AVIF is not requested anywhere anymore.

The masters are not in git-only land: upload them with the R2 tooling. Copy `.env.example` to
`.env` and fill in the R2 S3 credentials, then:

```bash
npm run assets:sync:dry   # list what would be uploaded
npm run assets:sync       # upload missing objects (-- --force to overwrite)
npm run assets:verify     # HEAD the objects and the /img/ URLs served by the Worker
```

`sync` keys off `scripts/assets/manifest.json`. `verify` fails when a stored object is missing or
when a served image is not `image/webp` or blows its byte budget (450 KB for a screenshot at 2000,
900 KB for the header art). After uploading a changed master, purge that object and its
`/cdn-cgi/image/` URLs in the Cloudflare cache, since both caches hold it for a year.

`npm run dev` and `npm run preview` proxy `/img` to the deployed site, so local development uses
the same dynamic endpoint as production.


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

The Worker runs `worker/index.mjs` ahead of the static assets for `/img/*` only
(`run_worker_first`), so the image endpoint gets every image request while everything else is
served straight from `dist/` by Cloudflare's asset handling, untouched.

`html_handling: "auto-trailing-slash"` serves `/download/` from `download/index.html` and
redirects `/download` to it. `not_found_handling: "none"` returns a real 404 for unknown paths
instead of the home page.

This repository does not use GitHub Pages.
