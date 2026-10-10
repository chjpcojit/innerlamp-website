---
name: il-testing
description: Write and run tests for innerlamp client code — pure logic, rune-based state, Svelte components (Vitest browser mode) and E2E (Playwright). Use whenever adding or changing logic, state, a component or a page.
---

# Testing

> **Status: planned.** Vitest and Playwright are not installed yet. Before the first test, install via the Svelte CLI:
> `npx sv add vitest="usages:unit,component"` and `npx sv add playwright`, then ensure `package.json` has `test:unit`, `test:e2e`, `test` scripts, set Playwright `testDir: 'tests'`, and note it in AGENTS.md + README (new dependencies rule). Until then `il-quality` skips test steps.

The file name decides where a test runs:

| What                                         | File                                             | Runs in                               |
| -------------------------------------------- | ------------------------------------------------ | ------------------------------------- |
| Pure functions, state classes                | `foo.spec.ts` next to `foo.ts` / `foo.svelte.ts` | Vitest `server` project (Node)        |
| Needs runes in the test (`$effect`) or a DOM | `foo.svelte.spec.ts`                             | Vitest `client` project (Chromium)    |
| Component render/interaction                 | `foo.svelte.spec.ts` next to `foo.svelte`        | Vitest `client` project               |
| Page flows, navigation, i18n                 | `tests/<name>.e2e.ts`                            | Playwright against `build && preview` |

Set `expect: { requireAssertions: true }`.

## What to write

- **Pure logic** → every branch and edge case (empty, boundary, invalid).
- **State class** → initial state, each intent method, each `$derived` after changes. Node project is enough.
- **Component** → one test per behaviour (renders content, variant, click → callback). No markup snapshots.
- **New page/route or flow** → one E2E happy path; for locale-sensitive pages cover `/` (vi) and `/en`. Keep E2E few.

## Patterns

State in Node:

```ts
import { expect, it } from 'vitest';
import { ContactFormState } from './contact-form.svelte';

it('is valid with name and email', () => {
	const s = new ContactFormState();
	s.name = 'An';
	s.email = 'a@b.vn';
	expect(s.isValid).toBe(true);
});
```

Component:

```ts
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import Button from './button.svelte';

it('renders label', async () => {
	render(Button, { label: 'Hi' });
	await expect.element(page.getByRole('button', { name: 'Hi' })).toBeInTheDocument();
});
```

E2E: `await page.goto('/en'); await expect(page.getByRole('heading', { level: 1 })).toBeVisible();`

## Rules

- Query by role/text, not CSS classes. Await `expect.element(...)`; no fixed sleeps.
- Tests are independent: fresh state each, no module singletons.
- No real backend: stub the API layer or `fetch`; never hit `API_BASE_URL`.
- Assert i18n text through `m.key()` or role, not duplicated literals.

## Run

`npm run test:unit -- --run` · `npx vitest --run <path>` · `npm run test:e2e` (first time: `npx playwright install chromium`) · `npm test`.
