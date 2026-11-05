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

The RustChamber screenshots follow the site theme: `public/screenshots/*.webp` for light and
`public/screenshots/*-dark.webp` for dark. `ThemeImage.svelte` preloads the other variant so
the switch is immediate.

## Motion

Animations use [Motion](https://motion.dev/) through `src/lib/reveal.ts`. Headings, copy,
screenshots, page groups and the footer reveal in view with short opacity and vertical
offsets. `prefers-reduced-motion` disables both the Motion reveals and the CSS menu/FAQ
animations.

## Structure

```
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
src/assets/bg-header-art.png   source header artwork
public/
  bg-header-art.webp           optimized header artwork
  fonts/
  screenshots/                 theme-aware app screenshots
```

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
