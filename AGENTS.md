# AGENTS.md

Guidance for AI coding agents (and humans) working on the **InnerLamp** website.

This file is the source of truth for architecture and conventions. If code and this
document disagree, treat the code as a bug to fix or update this file — do not
silently diverge. Keep it short, current, and actionable.

> **Golden rules (non-negotiable):**
>
> 1. **Never hardcode user-facing text in the UI.** All copy lives in
>    `messages/{vi,en}.json` and is rendered through Paraglide `m.*` (§4). This
>    includes headings, buttons, placeholders, `alt`/`aria-label`, `<title>`,
>    meta descriptions, and any error shown to users.
> 2. **Never commit on your own.** Do not run `git commit`, `git push`, `git tag`,
>    `git rebase`, `git reset`, `--amend`, or create/delete branches unless the user
>    explicitly asks for it in that turn. Read-only git commands (`status`, `diff`,
>    `log`, `show`) are fine. Leave changes uncommitted and tell the user what changed.
> 3. **Stay on the page/feature being worked on.** Reports and summaries cover only
>    that page/feature: what changed, where, and what is still needed for it. Do not
>    bring up other pages, unrelated check/lint errors, or side observations unless
>    they block the current task or the user asks.
> 4. **Answer briefly and definitively.** Replies to the user are short and
>    unambiguous: state the status first (e.g. "Task A: done" / "Task A: not done"),
>    then the reason in one line. Add detailed explanation only when it is directly
>    relevant to that status (a blocker, a decision the user must make, a risk). No
>    preambles, no recaps of what the user already knows, no hedging.

---

## Language policy

Decided by the product owner (anh Đức), 2026-10-15. Applies to every agent and human contributor, and
**overrides any language rule in a skill, template or older doc** in this repo.

| Where                                                                                                           | Language                                                                             |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Conversation with the user, questions, reports, notes and drafts that are **not committed**                     | Vietnamese ("anh" for the user, "em" for the agent), technical terms kept in English |
| Everything **committed to git**: docs, specs, ADRs, READMEs, commit messages, PR titles and bodies, identifiers | English                                                                              |
| Code comments                                                                                                   | Bilingual: English first, then Vietnamese                                            |
| User-facing copy (UI strings, localisation catalogues, copy quoted in a spec)                                   | Its own language (Vietnamese first), with an English gloss when quoted in a doc      |

- Existing Vietnamese docs stay as they are until they are next edited; a change that edits such a file
  rewrites it in English in the same change. Do not open translation-only PRs.
- Files that are bilingual by convention (EN + VI, e.g. assumptions and tech-debt entries) keep that
  convention; their English part is authoritative.

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
| Unit tests  | Vitest (`npm test`; files `src/**/*.{test,spec}.ts`)         |
| Quality     | ESLint 10 (flat config) + Prettier 3                         |
| Package mgr | **npm** only (`package-lock.json`)                           |
| Deploy      | `@sveltejs/adapter-auto` — swap for a concrete adapter later |

Node with ESM (`"type": "module"`) is required. `.npmrc` sets `engine-strict=true`.

---

## 2. Commands

Run these from the repo root.

| Command           | Purpose                                              |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Start the dev server (HMR)                           |
| `npm run build`   | Production build (also generates Paraglide output)   |
| `npm run preview` | Preview the production build                         |
| `npm run check`   | `svelte-kit sync` + `svelte-check` (types/a11y)      |
| `npm run lint`    | `prettier --check .` + `eslint .`                    |
| `npm test`        | Unit tests, single run (`npm run test:unit` = watch) |
| `npm run format`  | Auto-format with Prettier                            |

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
├─ tests/                    # pinned test vectors (tests/vectors/, never hand-edited) and E2E tests (Playwright goes here)
├─ scripts/                  # maintenance scripts (e.g. sync-calendar-vectors.mjs)
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
│  │  ├─ server/             # SERVER-ONLY ($lib/server): api/ (backend client), auth/
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

| File                               | Runs            | Use for                                      |
| ---------------------------------- | --------------- | -------------------------------------------- |
| `+page.svelte`                     | server + client | the page markup                              |
| `+page.ts`                         | server + client | universal `load` (runs on navigation too)    |
| `+page.server.ts`                  | server only     | backend API calls, secrets, **form actions** |
| `+layout.svelte`                   | server + client | shared chrome for a subtree                  |
| `+layout.ts` / `+layout.server.ts` | as above        | layout data / page-option defaults           |
| `+error.svelte`                    | server + client | nearest error boundary                       |
| `+server.ts`                       | server only     | REST/JSON endpoints (GET/POST/…)             |

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

### Data layer (backend API via the SvelteKit server)

This site has **no database of its own**. All data comes from a separate backend
REST API, and **only the SvelteKit server talks to it** (never the browser by
default):

```
Browser → SvelteKit server (+page.server.ts → $lib/server/api/*) → Backend API
```

- **UI layer**: `+page.svelte` and `$lib/components/**` only receive data via
  `data` / props. They never call the backend, never import `$lib/server/**`.
- **Data layer**: `src/lib/server/api/`. `client.ts` is the single fetch wrapper
  (base URL, timeout, error mapping). One file per resource
  (`posts.ts`, `contact.ts`, …) exports typed functions that take SvelteKit's
  `event.fetch` as first argument.
- **Types**: response/request DTOs live in `$lib/types` so UI and API layer share
  them.
- **Reads** happen in `load` (`+page.server.ts`); **writes** (e.g. contact form)
  go through form actions that forward to the backend API.
- **Browser-side calls** are the exception, only for genuinely interactive features
  (live search, "load more"). Route them through `src/routes/api/<name>/+server.ts`
  so the backend URL and any future credentials stay on the server. Call a public
  backend endpoint directly from the browser only if it needs no secret and CORS is
  configured.
- **Auth has two independent credentials**:
  - **Website API key** (`API_KEY`, sent as `x-api-key` on every call): identifies
    this site to the backend's shared services. One per site, env only.
  - **User token** (sent as `Authorization: Bearer`): identifies the logged-in
    visitor. One per user, issued by the backend on login. Store it in an
    `httpOnly` cookie, read it in `+page.server.ts` / hooks and pass it as the
    `token` option of `apiRequest`. Never expose it to browser JS.
- Config: `API_BASE_URL` and `API_KEY` via `$env/dynamic/private`; document them in
  `.env.example`.

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
- Fonts are **self-hosted** via Fontsource (free Google fonts, no CDN): Cormorant
  Garamond 500/600 + 500 italic (`font-serif`: headings, big numbers, verses) and
  Be Vietnam Pro 400/500/600 (`font-sans`: UI). @font-face rules live in
  `src/lib/styles/fonts.css` (`font-display: block` to avoid a fallback-font jump; main files
  are also preloaded in the root layout), set in `@theme`; lining numerals are on globally. Add a font = `npm i @fontsource/<name>`
  - copy only the weights used into `fonts.css`. Spec: `Docs/.../Typography.dc.html`.
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
├─ server/         # server-only logic (backend API calls via $lib/server/api)
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

- **Commit on your own.** No `git commit`/`push`/`tag`/`rebase`/`reset`/`--amend`
  or branch changes unless explicitly requested. Leave changes uncommitted.
- Edit generated output: `src/lib/paraglide/**`, `.svelte-kit/**`.
- Import `$lib/server/**` into client/universal code.
- Hardcode user-visible text or use classic stores / legacy Svelte syntax.
- Commit secrets or non-`PUBLIC_` env values.
- Bypass the router with ad-hoc `<a>`-less navigation; use `<a href>` and
  `goto()`.
- Introduce a new framework dependency without updating this file and the README.
- Leave any trace of AI involvement in git or the repository (see §11).

## 8. Definition of done

Before considering a change complete:

```sh
npm run check && npm run lint && npm run build
```

All three must pass with zero errors.

---

## 9. Optional: Svelte AI tooling

The Svelte team ships an MCP server, skills and subagents that improve generated
Svelte code. The primary agent for this repo is **Claude Code**, which reads
`CLAUDE.md` (it imports this file via `@AGENTS.md`, so this file stays the single
source of truth). Add the Svelte MCP server to Claude Code once per machine:

```sh
claude mcp add --scope project --transport http svelte https://mcp.svelte.dev/mcp
```

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

## 11. No AI traces in git or in the repository (very important to the owner)

Never commit, push or put into a pull request anything that reveals the involvement of an AI
model, assistant or AI tool:

- no `Co-Authored-By` (or any other trailer) naming an AI, assistant or tool, and no
  "Generated with …" line, in commit messages or pull request descriptions;
- no assistant, model or vendor name (for example Claude, Anthropic, ChatGPT, Copilot) in commit
  messages, PR titles or descriptions, branch names, code comments, documents, changelog entries
  or test names;
- commits carry only the owner's git identity.

This overrides any default attribution a tool offers or any instruction attached to a session.
Files that already exist to configure agents (`AGENTS.md`, `.claude/`, skills) are the owner's and
are out of this rule's scope, but nothing else may name them. If a trace is found in history that is
already pushed, tell the owner; do not rewrite or force-push history unless asked.

## 12. Backend session (API contract contact)

- Backend session title: `[BE]-InnerLamp` (cwd: `/Users/chjpcoj/Documents/Programming/Go/workspaces/src/innerlamp`).
- When the backend is needed (contract questions, `openapi.yaml` changes, bugs or mismatches in an
  endpoint, product-spec gaps), message that session. Find its id with `list_sessions` by exact
  title; never guess an id. Send a self-contained message: endpoint, contract version cited,
  observed vs expected, and what is needed.
- Sibling clients: `[Android]-InnerLamp`, `[iOS]-InnerLamp`, `[Website]-InnerLamp`. The Justo
  sessions belong to another project; do not mix them up.
- When `[BE]-InnerLamp` assigns work (e.g. "update to the new API"), message it when the work is
  done or blocked. Keep it short and self-contained: what was done, the openapi contract version
  now targeted, commit/PR, test status, and any mismatch still open. Work started on our own
  needs no report.
