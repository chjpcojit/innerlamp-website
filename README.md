# InnerLamp

Website for InnerLamp, built with [SvelteKit](https://svelte.dev/docs/kit) 2 + Svelte 5.

## Stack

- **SvelteKit 2** / **Svelte 5** (runes, strict TypeScript)
- **Tailwind CSS 4** (+ `@tailwindcss/typography`)
- **Paraglide JS 2** (inlang): `vi` (default) and `en`
- **Vite 8**, **Vitest** (unit tests), ESLint + Prettier

## Getting started

```sh
npm install
npm run dev        # http://localhost:5173
```

> On a fresh clone run `npm run dev` or `npm run build` once before `npm run check`,
> because `src/lib/paraglide` is generated at build time.

## Scripts

| Command             | Purpose                         |
| ------------------- | ------------------------------- |
| `npm run dev`       | Dev server (HMR)                |
| `npm run build`     | Production build                |
| `npm run preview`   | Preview the production build    |
| `npm run check`     | Type-check + Svelte/a11y checks |
| `npm run lint`      | Prettier check + ESLint         |
| `npm run format`    | Auto-format                     |
| `npm test`          | Unit tests (Vitest, single run) |
| `npm run test:unit` | Unit tests in watch mode        |

## Structure & conventions

Folder architecture, code conventions, i18n and recipes live in
[`AGENTS.md`](./AGENTS.md). Read it before adding a page, component or feature.

Quick summary:

- `src/routes/`: filesystem router. `(site)` is the public area, `(app)` is reserved
  for a future private area, `api/` holds JSON endpoints.
- `src/lib/`: shared code through the `$lib` alias:
  - `components/{ui,layout,sections}`: UI
  - `features/<name>/`: feature modules
  - `server/`: server-only code (`$lib/server`)
  - `state/`, `utils/`, `config/`, `types/`, `content/`, `styles/`, `assets/`
- `messages/`: translation strings `vi.json` / `en.json`. **Never hardcode visible text.**
- `static/`: assets served as they are.
- `tests/`: pinned test vectors (`tests/vectors/`) and, later, E2E tests.
- `scripts/`: maintenance scripts (for example `sync-calendar-vectors.mjs`).

## i18n

Add strings to **both** `messages/vi.json` and `messages/en.json`, then use:

```svelte
<script lang="ts">
	import { m } from '$lib/paraglide/messages';
</script>

<h1>{m.hello_world({ name: 'InnerLamp' })}</h1>
```

## Deployment

Currently `@sveltejs/adapter-auto`. Once the target platform is known, install the
matching adapter:

```sh
npx sv add sveltekit-adapter="adapter:<node|vercel|netlify|cloudflare|static>"
```

then reconfigure it in `vite.config.ts`.
