# Tasks — lamp (Thắp đèn và Vườn đèn)

Version: 1.1
Last updated: 2026-10-27
Status: in-progress — mirrors `requirements.md`. `[x]` below means verified in the code by reading the file (2026-10-17 for the v1 items, 2026-10-27 for the v1.1 items) and, where it says so, by a test; `[ ]` is still open.

> See `changelog.md` in this folder for the version history of this spec.

Each item traces to a row of `design.md`'s Layers & components table, a Step of its flows, or a Known gap (G#). Backend work is not tracked here (see the changelog hand-offs).

## Phase 1 — UI (`il-ui`)

Already in the code (verified):

- [x] Route `src/routes/(site)/practice/lamp/+page.svelte` with `<svelte:head>` title and description from `lamp_meta_*`
- [x] `LampOffering.svelte`: type, intention and duration choices, recipient and prayer fields, ignition, confirmation with the prayer, `lamp_again` keeping type / intention / duration, second submission ignored while igniting
- [x] `LampGarden.svelte`: header with the total, chips with counts, cards, `lamp_wall_more`, error line, the garden section kept usable when it fails to load
- [x] `LampVessel.svelte` artwork for the three types
- [x] Entry points to `/practice/lamp`: site header, mobile menu, practice tools tile, home celebration button; breadcrumb entry
- [x] 49 `lamp_*` keys present with the same names in `messages/vi.json` and `messages/en.json`

To do:

- [x] Guest view (G1, AC 2): `LampGuestIntro.svelte` with `lamp_eyebrow` / `lamp_title` / `lamp_desc` and `lamp_login` → `/login?redirect=<page>`; render neither form nor garden for guests
- [x] Default burn duration 7 (G2): `DEFAULT_LAMP_DAYS` in `content/lamps.ts`
- [x] Hide-name switch `lamp_field_hide_name`, off by default, posts `is_anonymous` (G3, AC 5, 9)
- [x] Recipient notice `lamp_recipient_notice` under the field (G4, AC 5)
- [x] Remove the `maxlength` attributes that count UTF-16 units (G6); show the invalid message from the shared validation instead (done in Phase 2)
- [x] Confirmation (G13, AC 14, 15): lamp type name, intention, days, recipient or `lamp_recipient_all`, prayer, end moment as date and time; actions `lamp_again` and `lamp_to_garden` only; remove the temple card, the `/offer` link and the `lamp_temple_*` markup
- [x] Ways between form and garden (G14, AC 17): `lamp_to_garden` scrolls to `#lamp-garden`; `lamp_to_form` back
- [x] Garden fallback label `lamp_wall_anonymous` "Vô danh" and own-lamp label `lamp_wall_you` "Của bạn" (G7, G8)
- [x] Remaining label on the cards with `lamp_remaining_days` / `lamp_remaining_under_day`; do not render an `out` card (G9, AC 23)
- [x] Empty state with `lamp_wall_empty_title`, `lamp_wall_empty_body` and a `lamp_to_form` button (G12, AC 27)
- [x] Null recipient on a card and in the caption with `lamp_to_all` (G10, AC 21) — wording ⚠️ (requirements)
- [x] Move `LampOffering` / `LampGarden` to `src/lib/features/lamp/components/`, extract `LampCard.svelte` (G19)
- [x] Every new and changed string in both `messages/vi.json` and `messages/en.json` per the i18n table of `design.md`; remove `lamp_temple_*`, `lamp_wall_guest`, `lamp_days_left`, `lamp_wall_empty`; English values stay ⚠️ until the product confirms them

## Phase 2 — State & logic (`il-state`)

- [x] `src/lib/features/lamp/validation.ts`: `normalizeText` (trim, NFC), `charCount`, `validateLampInput` (BR-LMP-01, 02, 06, 07) (G6)
- [x] `src/lib/features/lamp/remaining.ts`: `remainingLabel`, `isLit` (BR-LMP-12, BR-LMP-04) (G9)
- [x] Use `validateLampInput` in the form's submit function (no ignition, no request on invalid input) and again in the `light` action (replaces the inline `chars()`) (G6, Step 1–2)
- [x] `src/lib/features/lamp/state/garden.svelte.ts`: filter, items, cursor, `hasMore`, latest `total` / `counts`, `loading` / `failed`, `pick()` / `more()`; total and counts refreshed from every response (G11, G19, AC 24–26)
- [x] Delete `src/lib/state/lamps.svelte.ts`, its `lamps.init()` / `lamps.add()` calls and the stored key `il-lamps` handling (G17, AC 30) — together with Phase 3 `is_mine`, not before

## Phase 3 — Server data (contract-gated)

Already in the code (verified):

- [x] `src/lib/server/api/lamps.ts` with `lightLamp` and `listLampGarden` over `apiCall`
- [x] `src/lib/types/lamp.ts` DTOs for contract 2.1.1
- [x] `+page.server.ts` `load` (guest → no call; signed-in → first page; `ApiError` → `garden: null`) and action `light` (session check, closed-set check, `lightLamp`, `ApiError` → `LampError`: `LAMP_LIMIT_REACHED` → limit, `VALIDATION_ERROR` → invalid, 401 → auth, otherwise failed)
- [x] `src/routes/api/lamps/+server.ts` (`GET`, type check, 401 without cookie, errors forwarded as status + code)
- [x] Backend `401` handling by `handleFetch` (refresh once and retry) and `locals.user` from the hook — owned by `login`

To do:

- [x] Confirm that `openapi.yaml` has the 3.0.0 changes (optional `recipient` in the request, `recipient: null`, `is_mine`) — confirmed in innerlamp-be `main` @ 29db728 (PR #60); `Contract:` in `requirements.md` is now 3.0.0
- [x] `src/lib/types/lamp.ts`: `LightLampInput.recipient?`, `Lamp.recipient` and `GardenLamp.recipient` nullable, `GardenLamp.is_mine` (G10) — after the contract confirmation
- [x] `+page.server.ts` action `light`: omit a blank recipient, send `is_anonymous`, stop sending `m.lamp_recipient_all()` (G3, G5, AC 8, 9) — after the contract confirmation
- [x] Card and caption use `is_mine` and `recipient ?? null` rendering (G7, G10, AC 21, 22) — after the contract confirmation
- [x] Update the doc comments in `lamps.ts` for the optional recipient and `is_mine`
- [x] Guest `load` and the `light` action stay free of backend calls without a session (verify with a test in Phase 4)
- [ ] Session ended for the `light` action and `/api/lamps` (G16, AC 4): follow the `login` spec once it covers POST and `/api/*`; no lamp-specific code expected

## Phase 4 — Tests (`il-testing`)

- [x] Vitest is installed (done by the `calendar` feature; `npm test`, `AGENTS.md` §2)
- [x] `scripts/sync-lamp-vectors.mjs`: copy the product's `rules/lamp-input-validation.json`, `lamp-remaining-label.json` and `lamp-lifetime.json` from innerlamp-be (default `../innerlamp-be/docs/product/lamp/rules/`) into `tests/vectors/lamp/` with the source commit; tests read the pinned copy, never edit it by hand, and compare it with the checkout when one exists
- [x] Run every case of `rules/lamp-input-validation.json` against `validateLampInput` (BR-LMP-01, 02, 06, 07)
- [x] Run every case of `rules/lamp-remaining-label.json` against `remainingLabel` (BR-LMP-12)
- [x] Run every case of `rules/lamp-lifetime.json` against `isLit(expected.end_at, now)` (BR-LMP-04); the end moment itself is the backend's computation (BR-LMP-03 is display-only here)
- [x] `rules/lamp-lighter-name.json` (BR-LMP-09) is not run here: the website shows the name the backend decided (AC 20) and computes nothing from it
- [x] Unit: garden state with a fake `fetch` (chip, load more, failure keeps the list, total and counts follow the latest response) in `state/garden.spec.ts`; `lamps.ts` API resource and the `light` action — one test per row of the Error → UI table, guest `load` makes no backend call — in `src/routes/(site)/practice/lamp/page.server.spec.ts`
- [ ] E2E (Playwright, backend real or stubbed; Playwright is not installed in the repo yet — a one-off run against a stub backend on 2026-10-27 covered the guest intro, a lamp with a blank recipient and hide-name, invalid input without ignition, "Của bạn", the remaining labels and the hidden expired card): guest sees the intro only; light a lamp with defaults; blank recipient; hide-name; limit message; invalid input without ignition; garden filter and load more; empty state; own lamp labelled "Của bạn"; garden failure keeps the form usable

## Phase 5 — Quality (`il-quality`)

- [ ] `npm run check && npm run lint && npm run build` pass — the lamp files add no finding; `check` (17 errors in `resolve()` calls of the layout, auth and error files) and `lint` (prettier on `Docs/innerlamp-web-adaptation/**`, eslint on its prototype `.js`) fail on `main` already; `build` and `npm test` pass
- [ ] Manual check in light and dark, narrow width, `/practice/lamp` and `/en/practice/lamp`, with and without `prefers-reduced-motion`

## Phase 6 — Documentation

- [ ] Report the Website column status for `docs/product/lamp/product.md` §4.2 to `ba-writer` (this skill does not edit the backend repo): the 16 sample lamps and 1,284 base count are no longer in the code (G21); `BR-LMP-03` n/a versus display-only
- [x] Remove the stale lamp entries (Lamp, Offer lamp link) from `.assumptions.md` — the Lamp entry went in the cleanup PR (#24); the Offer note no longer says the lamp page links there
- [ ] OKF concept via `il-okf-writer` once the feature is verified end-to-end

## Deferred (not blocking lamp)

- "Chia sẻ" action, until the product decides (⚠️ requirements).
- English copy confirmation (product Appendix A).
- Session-ended handling on form actions and `/api/*` (owned by `login`).
- `rules/lamp-lighter-name.json` is not run by the website (AC 20).
