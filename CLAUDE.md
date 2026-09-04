# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`pivoshenko.wallpapers` — a Next.js 16 / React 19 static gallery for browsing, filtering, and downloading a curated wallpaper collection. Deployed on Vercel at `wallpapers.pivoshenko.dev`. Nearly all UI chrome, styling, and tooling config is inherited from the shared `pivoshenko.ui` package; the site-specific code is one page (`site/app/page.tsx`) and one client component (`site/components/wallpaper-browser.tsx`).

The app lives entirely under `site/`. The repo root holds only `justfile`, `README.md`, `CLAUDE.md`, `LICENSE`, `.editorconfig`, `.gitignore`, `.no-tests`, and `.github/`. `site/vercel.json` pins the Vercel build (`framework: nextjs`, `buildCommand: pnpm build`, `installCommand: pnpm install --frozen-lockfile`) — the Vercel project root is `site/`.

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

pnpm 10.30.3, Node >= 24 (`engine-strict=true` in `site/.npmrc`, so a mismatched Node hard-fails install). There is no separate typecheck script — type errors surface in `next build` (i.e. `just build` / `just check`).

Regenerate the wallpaper manifest alone with `pnpm -C site generate:wallpapers`.

CI (`.github/workflows/ci.yaml`, push to `main` + all PRs, `ubuntu-24.04-arm`) runs `just install` -> `just lint` -> `just audit` -> `just test` -> `just build`. All of these must pass.

**No test suite.** `just test` is gated on the empty `.no-tests` sentinel at the repo root: while the file exists the recipe prints a skip and exits 0; delete it and the recipe fails, breaking CI until a real test command replaces it. Deleting the sentinel is the deliberate signal that tests are now expected.

## Architecture

### Wallpaper pipeline

`site/generateFileList.js` (CommonJS, run via `node`, not bundled) walks `site/public/wallpapers/` recursively, skips dotfiles, reads dimensions with `image-size`, and writes `site/public/files.json` — an array of `{filename, path, size (MB, string), width, height}`. Both `dev` and `build` run it first via the `generate:wallpapers` script. **`files.json` is committed**, so it goes stale relative to the directory; after adding or removing an image, regenerate it and commit the result.

`site/components/wallpaper-browser.tsx` fetches `/files.json` client-side on mount — there is no server-side data path and no route beyond `/`. It derives the tag list, filters (OR semantics across selected tags), and renders the grid plus a details modal with a download link and a copyable Nix `fetchurl` snippet.

### Filename convention

Filenames encode all metadata as `name_tag1_tag2.ext` — there is no separate metadata file. `parseFilename` strips at the first `.`, splits on `_`, title-cases the first segment (hyphens become spaces) as the display name, and treats every remaining segment as a tag. Existing files use zero-padded ordinals plus one tag (`000_abstract.png`, `041_concept.jpg`); current tag set: `abstract`, `anime`, `concept`, `logo`, `pixelart`, `rog`.

### Download URLs

`site/components/wallpaper-browser.tsx` hardcodes `owner = 'pivoshenko'`, `repository = 'pivoshenko.wallpapers'`, `repositoryPath = 'site/public/wallpapers'` to build `raw.githubusercontent.com/.../main/...` URLs for the "Download original" link and the Nix snippet. These constants must track the repo name and directory layout — they broke once before (fixed in commit `83b22e7`) when they drifted.

### Attribution

The MIT license covers source code only; the wallpapers themselves belong to their creators. `README.md` carries per-source attribution (`concept` = Piotr Krynski, `rog` = Asus, `048`/`049_abstract` = Basic Apple Guy). When adding wallpapers with a known author, extend that README section (see commit `a6a8a93` for precedent).

### Consumption of `pivoshenko.ui`

Pinned by git tag in `site/package.json` (`github:pivoshenko/pivoshenko.ui#v0.9.3`); bumping the UI means bumping that tag. The package ships raw `.ts`/`.tsx` sources (its `exports` map points at them), so `transpilePackages: ['pivoshenko.ui']` in the shared Next config is load-bearing. It supplies:

- `biome.json` extends `./node_modules/pivoshenko.ui/config/biome.json`
- `tsconfig.json` extends `pivoshenko.ui/tsconfig.base.json`; `@/*` maps to `./*`
- `tailwind.config.ts` uses the `pivoshenko.ui/tailwind-preset/site` preset (JetBrains Mono `fontFamily` via `--font-jetbrains-mono`) plus `withUiContent()`, which appends the package's own source glob so its component classes survive purge
- `next.config.ts` spreads `baseNextConfig` (React strict mode, `transpilePackages`, security headers: nosniff / X-Frame-Options DENY / Referrer-Policy / Permissions-Policy) and adds only `images.unoptimized: true`
- `postcss.config.mjs` re-exports `pivoshenko.ui/postcss.config.mjs`
- `app/layout.tsx` renders `<SiteLayout brand="pivoshenko.wallpapers">` from `pivoshenko.ui/next/site-layout`, which owns `<html>`/`<body>`, the font, Nav/Footer, and `@vercel/analytics`; metadata via `siteMetadata(...)`, viewport via `siteViewport`; `SpeedInsights` is passed through `afterShell`. Do not add local nav/footer/theme components.
- `app/icon.tsx` and `app/opengraph-image.tsx` re-export the shared edge handlers (`createOgImage({brand, title, subtitle, domain})`)
- Components used here: `Tag`, `TagButton` from the package root

### Styling

`app/globals.css` is a single `@import "pivoshenko.ui/ui/globals.css"`. All visual vocabulary comes from that package's role layer: `type-*` (heading/body/ui/meta), `fg-*`, `hover-*`, `bg-bg-*` (surface/raised/overlay), `border-ui`/`border-faint`, `text-accent-*`. Prefer these token classes over raw Tailwind color/type utilities.

### Env vars

None. Vercel Analytics and Speed Insights are wired through the Vercel integration.

## Conventions

- Biome formatting (from the shared config): 2-space indent, 80-column width, single quotes in JS/TS, double quotes in JSX, trailing commas, **no semicolons**, imports auto-organized, `noUnusedVariables` is an error. CSS linting is off.
- Conventional commits (`feat:`, `fix:`, `docs:`, `build:`, `ci:`, `chore:`).
- `site/pnpm-workspace.yaml` carries security version overrides and `auditConfig.ignoreCves`; adding a suppression there is how `just audit` is kept green for unpatched advisories.
