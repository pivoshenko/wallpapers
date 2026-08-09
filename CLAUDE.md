# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 16 wallpaper gallery site for browsing, filtering, and downloading wallpapers from Volodymyr Pivoshenko's personal collection. Deployed on Vercel. Uses JetBrains Mono font (loaded inside the shared `SiteLayout`) and Tailwind CSS via the role-based `pivoshenko.ui/tailwind-preset/site` preset (single dark theme, `popil` flavor).

## Layout

The Next.js app lives under [`site/`](./site/) (mirrors [`pivoshenko.ai`](../pivoshenko.ai/CLAUDE.md) and [`pivoshenko.dev`](../pivoshenko.dev/CLAUDE.md)). The repo root holds only `justfile`, `README.md`, `CLAUDE.md`, `LICENSE`, `.editorconfig`, `.gitignore`, `.github/`. All paths in this doc (`app/`, `components/`, `public/`, `package.json`, `next.config.ts`, `tailwind.config.ts`, `biome.json`, `vercel.json`, `generateFileList.js`, ...) are relative to `site/`.

The Vercel project's **Root Directory** is set to `site/` in the dashboard.

## Commands

Run everything through the root `justfile`. It shells out to `pnpm -C site ...`:

```bash
just install          # pnpm install
just dev              # Dev server with Turbopack (regenerates wallpaper manifest first)
just build            # Production build (regenerates wallpaper manifest first)
just start            # Production build, then next start
just lint             # Biome lint
just format           # Biome format (auto-fix)
just audit            # pnpm audit (CI gate alongside lint + build)
just test             # No-op while the .no-tests sentinel exists, otherwise fails
just check            # Full gate: biome check + next build
just update           # Bump dependencies
```

Package manager is **pnpm** (10.x). CI (`.github/workflows/ci.yaml`) runs `install` -> `lint` -> `audit` -> `test` -> `build` on push to `main` and on PRs.

There is no test suite. `just test` is a placeholder gated on the empty `.no-tests` file at the repo root: while that file exists the recipe prints a skip message and succeeds, and deleting it makes `just test` (and therefore CI) fail until a real test command replaces the recipe.

## Architecture

### Wallpaper Pipeline

`site/generateFileList.js` scans `site/public/wallpapers/` recursively, reads image dimensions via `image-size`, and writes `site/public/files.json`. This manifest is fetched at runtime by the client-side `WallpaperBrowser` component. Both `dev` and `build` scripts run this generation step first.

### Wallpaper Naming Convention

Filenames encode metadata: `name_tag1_tag2.ext`. The name segment uses hyphens for spaces (title-cased at display time). Everything after the first underscore is parsed as tags. Tags drive the filter UI.

### Component Design Tokens

`site/app/globals.css` is a single `@import "pivoshenko.ui/ui/globals.css"`. All design tokens (`type-*`, `fg-*`, `hover-*`, `bg-tag*`, `border-*`) come from the shared package. Use the token classes instead of raw Tailwind utilities for consistency.

### Key Files

- `site/components/wallpaper-browser.tsx`: client component (`'use client'`); the main gallery with search, tag filtering, detail modal, and Nix snippet copy. Uses `Tag`, `TagButton` from `pivoshenko.ui`.
- `site/app/layout.tsx`: thin wrapper around `<SiteLayout brand="pivoshenko.wallpapers">` from `pivoshenko.ui/next/site-layout`. Metadata via `siteMetadata(...)`, viewport via `siteViewport`. JetBrains Mono, `<html>`/`<body>` scaffolding, Vercel Analytics, and the shared `Nav`/`Footer`/`ScrollToTop` chrome are all owned by the shared layout. No local nav/footer/theme-toggle components.
- `site/app/globals.css`: single `@import "pivoshenko.ui/ui/globals.css"` (see note above)

### Shared Package Consumption

This site pins `pivoshenko.ui` via git tag in `site/package.json`.

- `site/biome.json` extends `./node_modules/pivoshenko.ui/config/biome.json`
- `site/tsconfig.json` extends `pivoshenko.ui/tsconfig.base.json`
- `site/tailwind.config.ts` uses `pivoshenko.ui/tailwind-preset/site` + the `withUiContent()` helper
- `site/next.config.ts` spreads `baseNextConfig` from `pivoshenko.ui/next/config` and keeps `images.unoptimized: true` (the wallpaper manifest is static; no per-image transformation)
- `site/postcss.config.mjs` re-exports `pivoshenko.ui/postcss.config.mjs`
- `site/app/icon.tsx` + `site/app/opengraph-image.tsx` re-export the shared handlers from `pivoshenko.ui/next/icon` and `pivoshenko.ui/next/opengraph-image` (`createOgImage({brand,title,subtitle,domain})`)

### Required Env Vars

None. `@vercel/analytics` is wired via the Vercel integration. If a future build needs a secret, add it here as: name · purpose · scope (build/runtime) · visibility (`NEXT_PUBLIC_` public vs secret).

### Formatting Rules (Biome)

- Indent: 2 spaces
- Single quotes for JS/TS, double quotes for JSX
- Trailing commas, no semicolons (ASI)
- Line width: 80
- CSS linting is disabled
