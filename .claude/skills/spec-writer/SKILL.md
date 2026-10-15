---
name: il-spec-web
description: This skill should be used when the user wants a written spec (requirements, design, or task breakdown) for an InnerLamp website feature — the SvelteKit platform spec (layer 2), which starts from the cross-platform product spec innerlamp-be `docs/product/<feature>/product.md` (written by `ba-writer` in the backend repo) and the backend contract innerlamp-be `docs/specs/api/openapi.yaml`, citing both instead of copying them — before, during, or retroactively after building it. It covers the convention under `Docs/specs/features/<feature>/` (requirements.md, design.md, tasks.md) plus a changelog.md: a header citing the product spec version and the BR-/FR- IDs it implements, EARS acceptance criteria each tagged with its product ID, an error → UI mapping table, a design that follows this repo's data path (browser → SvelteKit server `load`/actions → `$lib/server/api/*` → backend, cookies for tokens, Paraglide for every string), a mandatory Step-by-step Flow for any flow with 2+ sequential backend calls, a strict one-way cascade (requirements → design → tasks), version headers + changelog entries on every update, and the rule that any unanswered question is recorded inline as "⚠️ Not confirmed" — never guessed. Docs-only: it never writes Svelte/TS code (that is `il-ui`, `il-state`, `il-testing`), never decides product questions (hand back to `ba-writer`), and never writes to `Docs/Knowledge/` (OKF, `il-okf-writer`).
---

# InnerLamp Website Spec Writer (`il-spec-web`)

## Overview

Generates and maintains the spec for one website feature under `Docs/specs/features/<feature>/`
(`<feature>` = the product spec's lowercase kebab-case slug):

- `requirements.md` — **what** the website must do for the visitor: user story, EARS acceptance
  criteria tagged with product IDs, the error → UI mapping, out of scope, pending, open questions.
- `design.md` — **how** it is built here: routes, `load`/form actions, `$lib/server/api` resources,
  feature components and state, cookies/session, i18n keys, and a Step-by-step Flow for multi-call
  flows.
- `tasks.md` — **what to do, in order**, broken down from `design.md`'s Layers & components table,
  numbered Phases with checkboxes (`[ ]` pending / `[x]` verified in code).
- `changelog.md` — one shared version history for the three files above.

The existing `Docs/specs/features/login/` and `register/` are the worked examples for tone and
shape (headings, tables for API and errors). Read one before writing; their Vietnamese prose
predates the Language policy and is rewritten in English the next time each file is edited.

These files are **layer 2** of InnerLamp's documentation stack. Above them sit the cross-platform
product spec in the backend repo, innerlamp-be `docs/product/<feature>/product.md` (layer 0, owned
by `ba-writer`, which exists only in that repo), and the API contract innerlamp-be
`docs/specs/api/openapi.yaml` (layer 1, owned by the backend). The backend, iOS and Android repos
have their own layer-2 spec skills (`il-spec-be`, `il-spec-ios`, `il-spec-android`) citing the same
documents. Read `references/upstream_product_spec.md` once — it is the shared rulebook.

**Language.** Language follows the repo's Language policy in AGENTS.md, which overrides this skill.
Everything written into the spec files is English: headings, EARS keywords (`WHEN` /
`THE SYSTEM SHALL`), table headers, version headers, prose, the user story and notes. Editing an
existing Vietnamese spec file rewrites it in English in the same change. Quote user-facing copy by
its Paraglide key (`login_submit`); when the Vietnamese text is quoted too, keep it as written in
`messages/vi.json` with an English gloss. Questions and reports to the user stay Vietnamese
("anh"/"em"), technical terms in English.

**This skill never writes code** and never touches `src/`, `messages/` or `Docs/Knowledge/`.

## Hard rules that override everything else below

1. **Start from the product spec, cite it, never restate or decide it.** A new feature needs
   innerlamp-be `docs/product/<feature>/product.md` first — if there is none, stop and send the user
   to `ba-writer` in innerlamp-be. `requirements.md` carries the `Product spec:` / `Contract:` /
   `Implements:` header; every EARS criterion ends with the `FR-*`/`BR-*` it implements or
   `(platform)`; a product gap or ambiguity becomes `⚠️ Not confirmed (product)` handed back to
   `ba-writer` — never decided here and never parked only in `.assumptions.md`. Legacy features with
   no product spec may be updated with `Product spec: none yet (legacy)`. See
   `references/upstream_product_spec.md`.
2. **Contract is cited, never copied.** Operations are named by method + path and the `Contract:`
   line records the `openapi.yaml` version used. No request/response schemas or error-code lists are
   pasted in; the error → UI table names only what the visitor sees for each case. An operation not
   in `openapi.yaml` is `⚠️ Not confirmed` and a hand-off to the backend, never an assumed shape.
3. **Backend work is not tracked here.** Something the backend must change goes to the report as a
   hand-off item (and, if it is a product question, to `ba-writer`) — never as a "Backend to-do"
   list inside this repo's spec.
4. **The design follows this repo's architecture (`AGENTS.md`).** Backend calls happen only on the
   SvelteKit server (`+page.server.ts` `load`/actions, hooks, `src/routes/api/*/+server.ts`) through
   `$lib/server/api/<resource>.ts`; tokens live in httpOnly cookies and never reach browser JS; every
   visible string is a Paraglide key in both `messages/vi.json` and `messages/en.json`. A design that
   breaks one of these is wrong, not a variant.
5. **One-way cascade: `requirements.md` → `design.md` → `tasks.md`.** A requirement changes first,
   then its design, then its tasks. Never edit `tasks.md` from a requirement change without updating
   `design.md` first.
6. **Never mark a task `[x]` unless it is verified in the code** (read the file). Writing the spec is
   not implementing it.
7. **Unanswered questions are recorded, never skipped or guessed**, inline where they bite:
   ```
   > ⚠️ Not confirmed: <the question, in one sentence> — <what it blocks>.
   ```
   (`⚠️ Not confirmed (product): …` when it is a product decision — rule 1.) When answered, move it to
   "Open questions (resolved)" with date and resolution, and check what it changes downstream.
8. **Every update bumps `Version`/`Last updated` in all three files and adds a `changelog.md`
   entry.** See `references/versioning_and_changelog.md`.
9. **A Step-by-step Flow in `design.md` is mandatory when the flow makes 2+ sequential backend calls
   or side effects** (login → set cookies → redirect; hook refresh → retry). See
   `references/step_by_step_flow.md`.
10. **Questions are short, concrete, one topic each, with a suggested default.** See
    `references/gathering_questions.md`.

## Reference map

| Reference                                | Covers                                                                                                                                                                             |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `references/upstream_product_spec.md`    | Layer 0/1/2 rules shared by all four platform spec skills: finding the product spec, the header, ID tags, what a platform spec may not say, hand-back to `ba-writer`, test vectors |
| `references/modes.md`                    | Prospective vs Retroactive, and which website files to read in retroactive mode                                                                                                    |
| `references/gathering_questions.md`      | The website-specific questions left after reading the product spec                                                                                                                 |
| `references/ears_notation.md`            | EARS phrasing for website criteria, with ID tags                                                                                                                                   |
| `references/step_by_step_flow.md`        | The per-step shape for flows through the SvelteKit server to the backend                                                                                                           |
| `references/versioning_and_changelog.md` | Version bump rule, header format, changelog entries                                                                                                                                |

## Workflow

### 0. Read the product spec and the contract

Per `references/upstream_product_spec.md`: open innerlamp-be `docs/product/<feature>/product.md`
(usually `../innerlamp-be`), note its version, the IDs whose Website column is not `n/a`, §3.6 rows
naming Website, open `⚠️` items naming Website, and `rules/*.json` vectors for BRs the site computes.
Open innerlamp-be `docs/specs/api/openapi.yaml` for the operations the feature calls. No product
spec and a new feature → stop and send the user to `ba-writer`.

### 1. Gather the website decisions

Ask only what the product spec does not answer (`references/gathering_questions.md`): mode,
routes and route group, auth (public / needs session cookie), data path (server `load`/action vs an
`/api/*` endpoint for interactive calls), which operations and their contract status, session and
cookie effects, i18n key prefix, and any SEO/prerender need.

### 2. Populate the files

Copy `assets/templates/*` to `Docs/specs/features/<feature>/` (replace `{{feature}}`) and fill them:

| Template                   | Key sections                                                                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `requirements.md.template` | Header (product spec / contract / implements), User Story, EARS criteria with tags, Data & API (operations cited), Error → UI mapping, Out of scope, Pending, Open questions    |
| `design.md.template`       | Overview, Layers & components (with status column), Route & navigation flow, Step-by-step Flow, Session/cookies, i18n keys, Deliberately stubbed                                |
| `tasks.md.template`        | Phases from the Layers table: UI → state → server data → tests → quality → docs                                                                                                 |
| `changelog.md.template`    | `v1.0 (initial)`                                                                                                                                                                |

**Retroactive**: read the code first (`references/modes.md`) and mark `[x]` only what you verified.
**Prospective**: every task `[ ]`; unconfirmed operations are "stubbed until the contract exists".

### 3. Updating an existing spec

1. Find where the change originates (behavior → `requirements.md`; technical detail →
   `design.md`). If the product spec changed, start from its changelog's affected IDs.
2. Cascade requirements → design → tasks, and say explicitly which files did not need to change.
3. Bump the version in all three headers and add a changelog entry.
4. Resolving a `⚠️` moves it to "Open questions (resolved)" and states what it changed downstream.
5. List hand-offs: product questions → `ba-writer`; contract changes → backend; shipped behavior →
   `il-okf-writer`.

### 4. Verify before reporting done

- Header present (or `Product spec: none yet (legacy)`); every criterion EARS-phrased and tagged;
  every product ID in scope for Website appears on at least one criterion.
- No product rule restated or decided; no schema or error list copied; no backend task list.
- Design keeps backend calls server-side, tokens in httpOnly cookies, strings as Paraglide keys.
- Every task traces to a Layers row or a Step; no `[x]` without reading the code.
- Every computational BR the site implements has a task to run its vector file.
- Versions match across the three files; the changelog has the new entry, newest first.
- Report lists hand-offs and any `⚠️` still open.
