# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`pivoshenko.wallpapers` — a Next.js 16 / React 19 static gallery for browsing, filtering, and downloading a curated wallpaper collection. Deployed on Vercel at `wallpapers.pivoshenko.dev`. Almost all UI chrome, styling, and tooling config is inherited from the shared `pivoshenko.ui` package; the site-specific code is one page and one client component.

## Layout

The app lives under `site/`. The repo root holds only `justfile`, `README.md`, `CLAUDE.md`, `LICENSE`, `.editorconfig`, `.gitignore`, `.no-tests`, `.github/`. Every path below (`app/`, `components/`, `public/`, `package.json`, ...) is relative to `site/`. The Vercel project's Root Directory is set to `site/` in the dashboard.

## Commands

Run everything through the root `justfile`; each recipe shells out to `pnpm -C site ...`.

```bash
just install   # pnpm install
just dev       # regenerate manifest, then next dev --turbopack
just build     # regenerate manifest, then next build
just start     # build, then next start
just lint      # biome lint .
just format    # biome format . --write
just check     # biome check . --write, then next build
just audit     # pnpm audit
just test      # no-op while .no-tests exists (see below)
just update    # pnpm update
```

pnpm 10.30.3, Node >= 24 (`engine-strict=true` in `site/.npmrc`, so a mismatched Node hard-fails install).

CI (`.github/workflows/ci.yaml`, push to `main` + all PRs) runs `install` -> `lint` -> `audit` -> `test` -> `build` on `ubuntu-24.04-arm`.

**No test suite.** `just test` is gated on the empty `.no-tests` sentinel at the repo root: while the file exists the recipe prints a skip and exits 0; delete it and the recipe fails, breaking CI until a real test command replaces it. Deleting the sentinel is the deliberate signal that tests are now expected.

## Architecture

### Wallpaper pipeline

`site/generateFileList.js` (CommonJS, run via `node`, not bundled) walks `site/public/wallpapers/` recursively, skips dotfiles, reads dimensions with `image-size`, and writes `site/public/files.json` — an array of `{filename, path, size (MB, string), width, height}`. Both `dev` and `build` run it first. `files.json` is committed, so it can go stale relative to the directory; regenerate with `pnpm -C site generate:wallpapers` (or just run `just dev`/`just build`) after adding or removing an image.

`components/wallpaper-browser.tsx` fetches `/files.json` client-side on mount — there is no server-side data path and no route beyond `/`.

### Filename convention

Filenames encode metadata as `name_tag1_tag2.ext`. `parseFilename` strips at the first `.`, splits on `_`, title-cases the first segment (hyphens become spaces) as the display name, and treats every remaining segment as a tag. Existing files use zero-padded ordinals plus one tag (`000_abstract.png`, `041_game.jpg`); current tag set: `abstract`, `anime`, `game`, `logo`, `pixelart`, `rog`. Tags are derived purely from filenames — there is no metadata file to update.

### Known issue: stale download URLs

`components/wallpaper-browser.tsx:21-23` hardcodes `owner = 'pivoshenko'`, `repository = 'wallpapers'`, `repositoryPath = 'public/wallpapers'`, producing `raw.githubusercontent.com/pivoshenko/wallpapers/main/public/wallpapers/<path>`. That URL **404s** — the repo is `pivoshenko/pivoshenko.wallpapers` and the images live at `site/public/wallpapers/`. Both the "Download original" link and the copied Nix `fetchurl` snippet are affected.

### Styling

`app/globals.css` is a single `@import "pivoshenko.ui/ui/globals.css"`. All visual vocabulary comes from that package's role layer: `type-*` (heading/body/ui/label/meta/logo), `fg-*`, `hover-*`, `bg-bg-*`, `border-ui`/`border-faint`, `text-accent-*`. Prefer these token classes over raw Tailwind color/type utilities. Tokens are a single dark palette scoped to `:root` — there is no light theme to check.

### Consumption of `pivoshenko.ui`

Pinned by git tag in `package.json` (`github:pivoshenko/pivoshenko.ui#v0.9.3`); bumping the UI means bumping that tag. It supplies:

- `biome.json` extends `./node_modules/pivoshenko.ui/config/biome.json`
- `tsconfig.json` extends `pivoshenko.ui/tsconfig.base.json`; `@/*` maps to `./*`
- `tailwind.config.ts` uses the `tailwind-preset/site` preset (adds the JetBrains Mono `fontFamily`) plus `withUiContent()`, which appends the package's own source glob so its component classes survive purge
- `next.config.ts` spreads `baseNextConfig` (React strict mode, `transpilePackages: ['pivoshenko.ui']`, security headers: nosniff / X-Frame-Options DENY / Referrer-Policy / Permissions-Policy) and adds `images.unoptimized: true`
- `postcss.config.mjs` re-exports the shared config
- `app/layout.tsx` renders `<SiteLayout brand="pivoshenko.wallpapers">`, which owns `<html>`/`<body>`, the JetBrains Mono font, Nav/Footer/ScrollToTop, and `@vercel/analytics`. Metadata via `siteMetadata(...)`, viewport via `siteViewport`. `SpeedInsights` is passed through `afterShell`. Do not add local nav/footer/theme components.
- `app/icon.tsx` and `app/opengraph-image.tsx` re-export the shared edge handlers (`createOgImage({brand, title, subtitle, domain})`)

Components used here: `Tag`, `TagButton` from the package root.

### Env vars

None. Vercel Analytics and Speed Insights are wired through the Vercel integration.

## Conventions

- Biome formatting (from the shared config): 2-space indent, 80-column width, single quotes in JS/TS, double quotes in JSX, trailing commas, **no semicolons**, imports auto-organized, `noUnusedVariables` is an error. CSS linting is off.
- ASCII only in prose and source — the repo was deliberately normalized away from smart punctuation.
- Conventional commits (`docs:`, `build(deps):`, `ci(audit):`, ...).
- `pnpm-workspace.yaml` carries security overrides and `auditConfig.ignoreCves`; adding a suppression there is how `just audit` is kept green for unpatched advisories.
