---
name: il-quality
description: Checklist to run before calling any innerlamp change done — type check, lint, build, and tests once installed. Use at the end of every task that touches code.
---

# Quality gate

Definition of done (AGENTS.md §8): `npm run check && npm run lint && npm run build` with zero errors. Run in order and read the output; do not report success from memory.

1. `npm run check` — svelte-check / TypeScript. (`src/lib/paraglide/**` is generated: on a fresh clone run `npm run dev` or `npm run build` once first.)
2. `npm run lint` — Prettier + ESLint. Fix only files you touched (`npx prettier --write <file>`).
3. `npm run test:unit -- --run` — only once Vitest is installed (see `il-testing`).
4. `npm run test:e2e` — only once Playwright is installed, when a route, layout or cross-component flow changed.
5. `npm run build` — must succeed.

Also confirm: no hardcoded user-facing text, new keys exist in both `messages/vi.json` and `messages/en.json`, no `$lib/server/**` import from client code, no secrets committed.

## Baseline

None recorded; treat every error as yours. If you find a pre-existing failure, note it here.

## Rules

- **Never commit** (`commit/push/tag/rebase/reset`, branch changes) unless the user asks that turn. Leave changes uncommitted and say what changed.

## Report

State which steps ran, results, and any step skipped with the reason. If something fails, show the failing output; do not mark the task complete. Record non-obvious assumptions in `.assumptions.md`.
