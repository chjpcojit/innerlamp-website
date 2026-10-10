---
name: il-state
description: Write client-side state and pure logic for innerlamp with Svelte 5 runes (.svelte.ts classes, $state/$derived, context). Use when UI needs filtering, form state, derived values or logic that should be testable outside a component. No server/API concerns.
---

# Client state & logic

Goal: components render; **logic lives in plain TS testable without a browser DOM**.

## Choose the layer

1. **Pure functions** (`*.ts`) in `$lib/utils` (or the feature folder) — formatting, validation, calculations. Preferred when no state is needed.
2. **State class** (`*.svelte.ts`) — owns `$state`, exposes `$derived` and intent methods. Lives in `$lib/features/<feature>/state/` when feature-specific, else `$lib/state/`.
3. **Shared state** — only when distant components need it. Use `setContext`/`getContext` from a layout; avoid module-level singletons (they leak between SSR requests and tests).
4. **Component-local `$state`** — trivial toggles (menu open/closed).

## Template

```ts
// src/lib/features/contact/state/contact-form.svelte.ts
export class ContactFormState {
	name = $state('');
	email = $state('');
	submitting = $state(false);

	isValid = $derived(this.name.trim().length > 0 && this.email.includes('@'));

	reset() {
		this.name = '';
		this.email = '';
	}
}
```

## Rules

- File must be `*.svelte.ts` to use runes outside components; import without `.ts`.
- Data in, data out. **Never call `fetch` or import `$lib/server/**`** here: reads happen in `load`, writes in form actions (AGENTS.md §4). Form UX uses `use:enhance`; this state only holds UI state.
- `$derived` for anything computable; never sync two `$state`s with `$effect`. `$effect` only for side effects (DOM, timers, storage), with cleanup.
- Use `SvelteSet`/`SvelteMap` from `svelte/reactivity` instead of `Set`/`Map`.
- Browser-only APIs (`window`, `localStorage`, `matchMedia`) only inside `$effect` so SSR does not crash.
- User-facing validation messages are i18n keys (`m.*`), never literal strings.
- No new validation library unless needed; if added (zod/valibot, `features/<x>/schemas/`), update AGENTS.md and README.
- Any state class or pure logic file **ships with tests** — see `il-testing`.
