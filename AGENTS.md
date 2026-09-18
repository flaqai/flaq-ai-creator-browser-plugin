# Repository Guidelines

## Project Structure & Module Organization

This repository is a React, TypeScript, and Vite browser extension using Chrome Manifest V3.

- `src/App.tsx` contains the side-panel UI and interaction flow.
- `src/api.ts`, `src/browser.ts`, and `src/storage.ts` isolate FLAQ API access, browser APIs, and persisted state.
- `src/models.ts` defines supported image/video models; colocate focused tests as `*.test.ts` (for example, `src/models.test.ts`).
- `src/styles.css` owns the responsive side-panel design.
- `public/manifest.json`, `public/background.js`, and `public/icons/` are copied unchanged into the extension build.
- `sidepanel.html` is the Vite entry point. Generated output lives in `dist/` and is not committed.

Keep browser-specific behavior behind small adapters rather than calling `chrome.*` throughout UI components.

## Build, Test, and Development Commands

Use the pinned pnpm version from `package.json`.

- `pnpm install` installs dependencies from `pnpm-lock.yaml`.
- `pnpm dev` starts the local side-panel preview at `http://127.0.0.1:5173/sidepanel.html`.
- `pnpm typecheck` runs strict TypeScript validation without emitting files.
- `pnpm test` runs the Vitest suite once.
- `pnpm build` type-checks and produces the unpacked extension in `dist/`.

Before handing off a change, run `pnpm typecheck`, `pnpm test`, and `pnpm build`.

## Coding Style & Naming Conventions

Use TypeScript with two-space indentation, semicolons, single quotes, and trailing commas in multiline structures. Name React components and interfaces in `PascalCase`, functions and variables in `camelCase`, and constants in `UPPER_SNAKE_CASE`. Prefer small typed helpers and explicit union types over untyped objects. Keep user-facing copy concise and in Simplified Chinese unless the surrounding UI establishes another language.

## Testing Guidelines

Vitest is the test framework. Name tests `src/<module>.test.ts` and describe observable behavior. No coverage threshold is configured; add targeted tests for model mappings, request construction, storage migrations, and other deterministic logic. Do not make paid or credentialed FLAQ API calls in automated tests.

## Commit & Pull Request Guidelines

The history currently contains only `Initial commit`, so no established convention exists. Use short imperative Conventional Commit messages such as `feat: add image context menu` or `fix: preserve polling history`.

Pull requests should include a concise summary, verification commands, linked issue when applicable, and screenshots for side-panel UI changes. Call out new permissions, host access, storage changes, or API-contract changes explicitly.

## Security & Configuration

Never commit Client Keys or local browser data. Keep host permissions scoped to `https://api.flaq.ai/*`; justify any expansion in the pull request. Store secrets only through `chrome.storage.local` and avoid logging authorization headers.

## Agent skills

### Issue tracker

Issues are tracked as local Markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the five default canonical status labels. See `docs/agents/triage-labels.md`.

### Domain docs

This repository uses a single-context domain documentation layout. See `docs/agents/domain.md`.
