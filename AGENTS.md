# AGENTS.md

Guidance for AI coding agents (and humans) working on the **InnerLamp** website.

This file is the source of truth for architecture and conventions. If code and this
document disagree, treat the code as a bug to fix or update this file — do not
silently diverge. Keep it short, current, and actionable.

---

## 1. Project overview

InnerLamp is a bilingual (Vietnamese-first) marketing / content website.

| Concern     | Choice                                                       |
| ----------- | ------------------------------------------------------------ |
| Framework   | SvelteKit 2 (filesystem router, SSR by default)              |
| UI          | Svelte 5 — **runes mode is forced** for all app code         |
| Language    | TypeScript (strict), plus `checkJs`                          |
| Styling     | Tailwind CSS 4 via `@tailwindcss/vite` (+ typography plugin) |
| i18n        | Paraglide JS 2 / inlang — locales `vi` (base) and `en`       |
| Build       | Vite 8                                                       |
| Quality     | ESLint 10 (flat config) + Prettier 3                         |
| Package mgr | **npm** only (`package-lock.json`)                           |
| Deploy      | `@sveltejs/adapter-auto` — swap for a concrete adapter later |

Node with ESM (`"type": "module"`) is required. `.npmrc` sets `engine-strict=true`.

---

## 2. Commands

Run these from the repo root.

| Command           | Purpose                                            |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Start the dev server (HMR)                         |
| `npm run build`   | Production build (also generates Paraglide output) |
| `npm run preview` | Preview the production build                       |
| `npm run check`   | `svelte-kit sync` + `svelte-check` (types/a11y)    |
| `npm run lint`    | `prettier --check .` + `eslint .`                  |
| `npm run format`  | Auto-format with Prettier                          |

Add official integrations only through the Svelte CLI, e.g.
`npx sv add mdsvex` or `npx sv add vitest="usages:unit,component"`.

> `src/lib/paraglide/**` is generated. It does not exist until a `dev`/`build` run,
> so a fresh clone must build once before `npm run check` is meaningful.

---

## 3. Architecture

```
innerlamp/
├─ messages/                 # i18n message catalogues — {locale}.json (vi, en)
├─ project.inlang/           # Paraglide/inlang project settings (baseLocale: vi)
├─ static/                   # assets served verbatim (robots.txt, …)
├─ tests/                    # end-to-end / integration tests (Playwright goes here)
├─ src/
│  ├─ app.html               # HTML shell; %paraglide.lang% / %paraglide.dir% injected here
│  ├─ app.d.ts               # ambient `App.*` types (Locals, PageData, …)
│  ├─ hooks.server.ts        # server hooks — Paraglide middleware lives here
│  ├─ hooks.ts               # universal (reroute) hooks — strips locale prefix
│  ├─ params/                # route param matchers ([id], [[lang]], …)
│  ├─ lib/                   # shared code, imported through the `$lib` alias
│  │  ├─ components/
│  │  │  ├─ ui/              # design-system primitives: Button, Input, Card, Modal…
│  │  │  ├─ layout/          # app shell: Header, Footer, Nav, ThemeToggle
│  │  │  └─ sections/        # reusable page sections: Hero, FeatureGrid, CTA
│  │  ├─ features/           # feature-first modules (see §5)
│  │  ├─ server/             # SERVER-ONLY ($lib/server): db/, auth/, services/
│  │  ├─ state/              # cross-cutting client state (*.svelte.ts, runes)
│  │  ├─ utils/              # pure, framework-agnostic helpers
│  │  ├─ config/             # site config, nav maps, constants
│  │  ├─ types/              # shared TypeScript types
│  │  ├─ content/            # static copy / structured content data
│  │  ├─ styles/             # Tailwind theme tokens & CSS partials
│  │  ├─ assets/             # assets imported through Vite (hashed, optimised)
│  │  ├─ paraglide/          # GENERATED — never edit, never import from server-only
│  │  └─ index.ts            # public barrel for `$lib`
│  └─ routes/                # filesystem router — only `+`-prefixed files are routes
│     ├─ +layout.svelte      # root shell: global CSS, <svelte:head>, providers
│     ├─ (site)/             # PUBLIC marketing/content routes — route group
│     │  ├─ +page.svelte     #   /            (homepage)
│     │  ├─ about/           #   /about
│     │  ├─ services/        #   /services
│     │  ├─ pricing/         #   /pricing
│     │  ├─ contact/         #   /contact
│     │  ├─ blog/[slug]/     #   /blog and /blog/:slug
│     │  └─ privacy/, terms/ #   /privacy, /terms
│     ├─ (app)/              # RESERVED: authenticated/dashboard area (no routes yet)
│     └─ api/                # JSON endpoints (`+server.ts`) — /api/*
└─ vite.config.ts            # Vite + SvelteKit + Tailwind + Paraglide plugins
```

### Route files (SvelteKit semantics)

| File                               | Runs            | Use for                                   |
| ---------------------------------- | --------------- | ----------------------------------------- |
| `+page.svelte`                     | server + client | the page markup                           |
| `+page.ts`                         | server + client | universal `load` (runs on navigation too) |
| `+page.server.ts`                  | server only     | DB/secret access, **form actions**        |
| `+layout.svelte`                   | server + client | shared chrome for a subtree               |
| `+layout.ts` / `+layout.server.ts` | as above        | layout data / page-option defaults        |
| `+error.svelte`                    | server + client | nearest error boundary                    |
| `+server.ts`                       | server only     | REST/JSON endpoints (GET/POST/…)          |

- **Route groups** `(name)` organise files and layouts without adding a URL segment.
  `(site)` is the public site; `(app)` is reserved for a future private area.
- Non-`+` files colocated in `src/routes` are ignored by the router but allowed for
  route-local components/helpers. Anything reused across routes belongs in `$lib`.

---

## 4. Conventions

### Svelte 5 / runes

- Runes are **forced** (see `vite.config.ts`). Use `$state`, `$derived`, `$effect`,
  `$props`, `$bindable`, `{@render}`. Do **not** use legacy `export let`, `$:` or
  slots. Do **not** add classic Svelte stores.
- Type component props with a `Props` interface and `$props()`. Prefer destructuring.
- Keep components small; extract logic into `*.svelte.ts` modules when it grows.
- Always nest markup in a single root where practical and keep a11y in mind — run
  `npm run check` which includes Svelte a11y warnings.

### SvelteKit data & mutations

- Read data in `load` (`+page(.server).ts`); **write** data with form actions
  (`+page.server.ts` `actions`) and `<form method="POST">`, using
  `use:enhance` / `$app/forms` for progressive enhancement.
- Use `+server.ts` only for true APIs (webhooks, JSON consumed by `fetch`), not for
  page mutations.
- Import generated types (`PageProps`, `PageServerLoad`, `LayoutProps`, …) from
  `./$types`.
- Prefer `redirect()`, `error()` and `fail()` from `@sveltejs/kit` over manual
  responses.

### Server-only code

- Anything under `src/lib/server/**` is server-only (`$lib/server`). SvelteKit
  blocks importing it from client code — never try to work around that.
- Secrets come from `$env/dynamic/private` or `$env/static/private`. Anything
  shipped to the browser must use the `PUBLIC_` prefix and contain no secrets.

### Styling

- Tailwind CSS 4, configured entirely in CSS. The entry stylesheet is
  `src/routes/layout.css` (`@import 'tailwindcss'` + `@plugin`), imported once by
  the root layout.
- Utility-first in markup. Put design tokens / theme via `@theme` in the styles
  layer, and share repeated multi-utility patterns as components in
  `$lib/components/ui` rather than long `@apply` chains.
- Use `@tailwindcss/typography` (`prose`) for long-form content (blog, legal).
- Class ordering is enforced by `prettier-plugin-tailwindcss` — just run format.

### Internationalisation (mandatory)

- **Never hardcode user-facing text.** Every visible string lives in
  `messages/vi.json` and `messages/en.json` (same keys in both).
- Import messages with `import { m } from '$lib/paraglide/messages'` and render
  `{m.some_key({ param: value })}`. Keys are `snake_case`.
- Locale routing, `<html lang>`/`dir`, and the middleware in `hooks.server.ts` are
  already wired. Use `localizeHref()` from `$lib/paraglide/runtime` when building
  internal URLs.
- The locale strategy is set in `vite.config.ts` →
  `['url', 'cookie', 'baseLocale']`: `/` serves `vi`, `/en/...` serves `en`, and
  the visitor's choice is remembered in a cookie. Prefer `url` first so URLs stay
  authoritative for SEO; avoid `preferredLanguage` (it redirects crawlers).
- The base locale is `vi`; `en` is the fallback translation target. Keep the
  catalogue in sync when adding a key.
- `src/lib/paraglide/**` is generated — never hand-edit it.
- Known follow-up: `/vi/...` still resolves (a duplicate of the unprefixed base
  locale). If SEO matters, add a canonicalising redirect in `hooks.server.ts`
  using `shouldRedirect()` from `$lib/paraglide/runtime`.

### TypeScript

- `strict` is on. No `any` unless unavoidable and justified; prefer `unknown` +
  narrowing. Export shared types from `$lib/types`.
- Use `import type { … }` for type-only imports.

### Naming & organisation

- Components: `PascalCase.svelte`. Modules: `kebab-case.ts` or `camelCase.ts`.
  Runes state modules: `*.svelte.ts`. Types/interfaces: `PascalCase`.
  Constants: `UPPER_SNAKE_CASE`.
- Prefer importing through aliases (`$lib/...`) over deep relative paths.
- Keep imports ordered by the Prettier/ESLint config; do not reorder by hand.

### Accessibility & SEO

- Use semantic landmarks (`header`, `nav`, `main`, `footer`), labelled controls,
  and one `<h1>` per page with a sensible heading order.
- Per-page metadata goes in `<svelte:head>`. Add `sitemap.xml`/canonical handling
  when the routes stabilise.

---

## 5. Feature modules

When a concern grows beyond a couple of files, give it a folder under
`src/lib/features/<feature>/` instead of scattering code:

```
src/lib/features/<feature>/
├─ components/     # feature UI (imports from $lib/components/ui for primitives)
├─ server/         # server-only logic (DB queries, external calls)
├─ state/          # *.svelte.ts runes stores scoped to the feature
├─ schemas/        # input validation (zod/valibot/…)
└─ types.ts
```

Cross-cutting primitives stay in `$lib/components/ui`; feature code must not
import from another feature's internals.

---

## 6. Recipes

**Add a page** — `src/routes/(site)/<name>/+page.svelte`. Add `<h1>`, put copy in
`messages/*.json`, load data via `+page(.server).ts` if needed, then run the checks.

**Add a shared component** — primitive → `$lib/components/ui`, shell piece →
`$lib/components/layout`, page block → `$lib/components/sections`.

**Add an API endpoint** — `src/routes/api/<name>/+server.ts` exporting typed
`RequestHandler`s.

**Add a translated string** — add the key to **both** `messages/vi.json` and
`messages/en.json`, then use `m.key()`.

**Add a feature** — create `src/lib/features/<feature>/` per §5.

---

## 7. Guardrails — do NOT

- Edit generated output: `src/lib/paraglide/**`, `.svelte-kit/**`.
- Import `$lib/server/**` into client/universal code.
- Hardcode user-visible text or use classic stores / legacy Svelte syntax.
- Commit secrets or non-`PUBLIC_` env values.
- Bypass the router with ad-hoc `<a>`-less navigation; use `<a href>` and
  `goto()`.
- Introduce a new framework dependency without updating this file and the README.

## 8. Definition of done

Before considering a change complete:

```sh
npm run check && npm run lint && npm run build
```

All three must pass with zero errors.

---

## 9. Optional: Svelte AI tooling

The Svelte team ships an MCP server, skills and subagents that improve generated
Svelte code. **Enabled in this repo** through the OpenCode plugin:

```json
// .opencode/opencode.json
{ "plugin": ["@sveltejs/opencode"] }
```

The plugin bundles the MCP server, skills and the `svelte-file-editor` subagent,
and self-updates. Toggle features in `.opencode/svelte.json` (all enabled by
default) or interactively with the `/svelte-plugin` command after restarting
OpenCode.

OpenCode is a **plugin-only** client for the `ai-tools` add-on: do **not** pass a
`delivery` or `tools` option — the CLI rejects them as incompatible. Reinstall
with `npx sv add ai-tools="ide:opencode"`; because `AGENTS.md` already exists, that
command will not touch it.

Once the Svelte MCP server is available to the agent, use it as follows:

- `list-sections` **first** for any Svelte/SvelteKit question to discover relevant
  docs sections.
- `get-documentation` to pull the full text of every relevant section found above.
- `svelte-autofixer` on every piece of Svelte code **before** presenting it, and
  keep iterating until it reports no issues.
- `playground-link` only when the user explicitly asks and no project files were
  written.

---

## 10. Deployment

The app currently uses `@sveltejs/adapter-auto` (see `vite.config.ts`), which only
works on recognised zero-config hosts. When the target platform is known, install
the matching adapter (`npx sv add sveltekit-adapter="adapter:<node|vercel|netlify|cloudflare|static>"`)
and reconfigure `vite.config.ts`. For a fully static marketing site, consider
`adapter-static` with `prerender` page options.
