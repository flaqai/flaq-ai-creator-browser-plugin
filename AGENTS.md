# Repository Guidelines

## Project Structure & Module Organization

This is a React, TypeScript, Vite, and Chrome Manifest V3 side-panel extension.

- `src/` contains the side-panel shell, locale routing, and focused Vitest tests.
- `public/` contains the manifest, extension worker, icons, and Chrome locales.
- `web/flaq-saas/` is the complete Next.js SaaS source imported as a Git Subtree.
- `scripts/build-extension.mjs` exports the SaaS and assembles a self-contained `dist/`.
- `scripts/package-static-site.mjs` externalizes Next.js inline scripts for extension CSP.
- `docs/` holds operational guidance. Generated `dist/`, `.next/`, and `out/` stay uncommitted.

The release artifact must run without localhost or a separately deployed SaaS site. Keep credentials out of the bundle; browser uploads obtain short-lived URLs from FLAQ using the user's Client Key.

## Build, Test, and Development Commands

- `pnpm install` installs both isolated projects from their lockfiles.
- `pnpm dev` runs the SaaS and Vite preview for hot-reload development.
- `pnpm build` creates the standalone unpacked extension in `dist/`.
- `pnpm test` runs Vitest, including locale and CSP-packaging tests.
- `pnpm typecheck` checks the extension shell.
- `pnpm typecheck:site` checks the embedded SaaS source.
- `pnpm smoke:site` validates the server-backed development mode.
- `pnpm sync:site` pulls the upstream subtree; preserve extension-export integration afterward.

Before handoff, run `pnpm test`, `pnpm typecheck`, `pnpm build`, and inspect `dist/manifest.json`. Stop local servers when verifying standalone behavior.

## Coding Style & Testing

Use TypeScript with two-space indentation, semicolons, single quotes, and trailing commas. Use `PascalCase` for components/types, `camelCase` for functions, and `UPPER_SNAKE_CASE` for constants. Keep deterministic tests beside the relevant module as `*.test.ts`; never make paid or credentialed API calls in tests.

## Commits, Pull Requests & Security

Use imperative Conventional Commits, for example `feat: bundle SaaS in extension`. Pull requests require a summary, verification commands, screenshots for UI changes, and explicit notes for permission, host-access, storage, or API changes.

Never commit Client Keys, R2 credentials, `.env`, or browser data. Manifest permission expansion requires justification. Chrome MV3 forbids executable inline scripts, so all exported HTML must pass the packaging transform.

## Agent References

- Local issues: `docs/agents/issue-tracker.md`
- Triage labels: `docs/agents/triage-labels.md`
- Domain documentation: `docs/agents/domain.md`
