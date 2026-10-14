# Prospective vs Retroactive mode

Ask which applies before writing (see `gathering_questions.md`).

## Prospective — before the feature is built

- `requirements.md`: criteria describe intended behavior, each tagged with the product ID it
  implements. Open questions start empty or with genuinely open website decisions.
- `design.md`: the planned routes, server `load`/actions, API resources, components, state and i18n
  keys. An operation not in innerlamp-be `openapi.yaml` is "planned, contract not yet confirmed".
- `tasks.md`: every item `[ ]`.
- `changelog.md`: `v1.0 (initial)`, naming the product spec version.

## Retroactive — the feature already runs

Read the code before writing, so the spec describes what ships, not an idealized version:

- Routes: `src/routes/(site|auth|app)/<path>/+page.svelte`, `+page.server.ts`, `+layout*.ts`,
  `src/routes/api/<name>/+server.ts`.
- Feature code: `src/lib/features/<feature>/` (components, state, schemas).
- Server data: `src/lib/server/api/<resource>.ts`, `client.ts`, `src/lib/server/auth/*`,
  `src/hooks.server.ts`.
- Strings: the keys used, in `messages/vi.json` and `messages/en.json`.
- Assumptions already recorded in `.assumptions.md`.

Then:

- Behavior that differs from the product spec is not "fixed" in the spec: write what the code does,
  mark the criterion `⚠️` or Pending, and report the drift (the product matrix should show `drift`
  for Website).
- Stubs (a button with no action, a link to a route that doesn't exist, localStorage instead of the
  backend) go under Pending with their tasks.md Phase.
- `tasks.md`: `[x]` only for what you read and verified; record the date ("`[x]` chỉ khi đã kiểm tra
  tồn tại trong code ngày …").
- `changelog.md`: `v1.0 (initial)` saying it was written retroactively.

## Mixed

Partly built is the usual case: retroactive for the done parts, prospective for the rest, in the same
files.
