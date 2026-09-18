# Repository Guidelines

## Project Structure & Module Organization

This repository is a React, TypeScript, and Vite browser extension using Chrome Manifest V3.

- `src/App.tsx` contains the full-viewport iframe shell and fallback states.
- `src/config.ts` maps browser locales and builds the localized AI Creator URL; colocate focused tests as `*.test.ts`.
- `src/styles.css` styles only the loading/error shell; the embedded site owns normal UI.
- `public/manifest.json`, `public/background.js`, `public/icons/`, and `public/_locales/` are copied into the extension build.
- `sidepanel.html` is the Vite entry point. Generated output lives in `dist/` and is not committed.

Keep the extension a thin website container. Product features, API access, credentials, history, and content belong to the embedded FLAQ SaaS site.

## Build, Test, and Development Commands

Use the pinned pnpm version from `package.json`.

- `pnpm install` installs dependencies from `pnpm-lock.yaml`.
- `pnpm dev` starts the local side-panel preview at `http://127.0.0.1:5173/sidepanel.html`.
- `pnpm typecheck` runs strict TypeScript validation without emitting files.
- `pnpm test` runs the Vitest suite once.
- `pnpm build` or `pnpm build:dev` produces a localhost-targeted unpacked extension in `dist/`.
- `VITE_SIDEPANEL_SITE_URL=https://example.com pnpm build:production` produces a production build and scopes iframe CSP to that origin.

Before handing off a change, run `pnpm typecheck`, `pnpm test`, and `pnpm build`.

## Coding Style & Naming Conventions

Use TypeScript with two-space indentation, semicolons, single quotes, and trailing commas in multiline structures. Name React components and interfaces in `PascalCase`, functions and variables in `camelCase`, and constants in `UPPER_SNAKE_CASE`. Prefer small typed helpers and explicit union types over untyped objects. Keep user-facing copy concise and in Simplified Chinese unless the surrounding UI establishes another language.

## Testing Guidelines

Vitest is the test framework. Name tests `src/<module>.test.ts` and describe observable behavior. No coverage threshold is configured; add targeted tests for locale mapping, URL construction, manifest generation, and other deterministic shell logic. Do not make paid or credentialed FLAQ API calls in automated tests.

## Commit & Pull Request Guidelines

The history currently contains only `Initial commit`, so no established convention exists. Use short imperative Conventional Commit messages such as `feat: add image context menu` or `fix: preserve polling history`.

Pull requests should include a concise summary, verification commands, linked issue when applicable, and screenshots for side-panel UI changes. Call out new permissions, host access, storage changes, or API-contract changes explicitly.

## Security & Configuration

Never commit Client Keys or local browser data. Keep extension permissions limited to `sidePanel`. Production builds must set `VITE_SIDEPANEL_SITE_URL`, and the generated `frame-src` must contain only that site origin. Any permission or origin expansion requires explicit pull-request justification.

## Agent skills

### Issue tracker

Issues are tracked as local Markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the five default canonical status labels. See `docs/agents/triage-labels.md`.

### Domain docs

This repository uses a single-context domain documentation layout. See `docs/agents/domain.md`.
