---
name: il-ui
description: Build or change UI in innerlamp (SvelteKit 2 + Svelte 5 runes + Tailwind 4, bilingual vi/en via Paraglide). Use when adding a component, page, layout or section, or styling. Client-side only; no API calls.
---

# Svelte UI (marketing site)

Stack: Svelte 5 (runes forced in `vite.config.ts`), Tailwind CSS 4 (+ typography), Paraglide i18n. **No shadcn/bits-ui** here — primitives are hand-written. (shadcn-svelte belongs to the separate `innerlamp-bo` back office.)

## Where things go

- `src/lib/components/ui/` — primitives: Button, Input, Card, Modal…
- `src/lib/components/layout/` — Header, Footer, Nav, ThemeToggle.
- `src/lib/components/sections/` — page blocks: Hero, FeatureGrid, CTA.
- `src/lib/features/<feature>/components/` — feature UI (AGENTS.md §5).
- `src/routes/(site)/<name>/+page.svelte` — public pages. Global CSS only in `src/routes/layout.css`; theme tokens via `@theme` in `$lib/styles`.
- Component files `PascalCase.svelte`. Import via `$lib/...` aliases.

## Rules

- **No hardcoded user-facing text** (AGENTS.md golden rule 1): headings, buttons, placeholders, `alt`, `aria-label`, `<title>`, meta description all use `m.key()` from `$lib/paraglide/messages`; add the key to **both** `messages/vi.json` and `messages/en.json`.
- Internal links: `<a href={localizeHref('/about')}>` (`$lib/paraglide/runtime`).
- Runes only: `let { a, b = 1 }: Props = $props()` with a `Props` interface. No `export let`, `$:`, slots or stores. Events are props (`onclick`); children via `{@render children?.()}`.
- Use theme tokens from `@theme`, not scattered hex colours. Share repeated multi-utility patterns as `ui/` components, not long `@apply` chains.
- Long-form content (blog, legal): `prose` from the typography plugin.
- A11y/SEO: semantic landmarks, one `<h1>` per page, labelled controls, per-page meta in `<svelte:head>`.
- Keep components presentational; non-trivial logic goes to `*.svelte.ts` (`il-state`).

## Formatting

`npm run format` (Prettier + Tailwind class sorting). Do not hand-reorder imports.

## Verify

Run `il-quality`. For visual changes also open `npm run dev`, check `/` and `/en`, light + dark, and a narrow viewport. Tests per `il-testing`.
