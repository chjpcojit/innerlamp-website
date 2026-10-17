# Design — lamp (Thắp đèn và Vườn đèn)

Version: 1.0
Last updated: 2026-10-17
Status: in-progress (drift) — mirrors `requirements.md`: v1 flow built and connected to the backend; the 2026-10-16 changes are not built; the `is_mine` / null-recipient parts wait for contract 3.0.0.

> See `changelog.md` in this folder for the version history of this spec.

## Overview

One page, `src/routes/(site)/practice/lamp/` (`/practice/lamp`, `/en/practice/lamp`), holds both the light-a-lamp section and the garden. Data path: browser → `+page.server.ts` (`load` for the first garden page, form action `light` for lighting) and `GET /api/lamps` (filter and "load more", the one interactive call) → `$lib/server/api/lamps.ts` → backend `POST /v1/lamps` / `GET /v1/lamps`. It uses the session cookie (`il_token`, read through `locals.user` and `cookies`) but never writes cookies. The closest model is `memorial` (per-user data behind a sign-in) for the guest rule, and `login` for the session; the flow is otherwise specific to this feature (an ignition animation that plays in full whatever the backend answers).

Shape of the target: components and logic move from `$lib/components/sections/Lamp*.svelte` and `$lib/state/lamps.svelte.ts` into `src/lib/features/lamp/` (components, state, pure logic); `LampVessel.svelte` stays in `$lib/components/ui` as a presentational primitive.

## Layers & components

"Status" is the state of `src/` on 2026-10-17 (files read). "needs change" lists what `requirements.md` adds.

| Layer            | File                                                                                                                              | Responsibility                                                                                                                                                                                                      | Status                                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Route (UI)       | `src/routes/(site)/practice/lamp/+page.svelte`                                                                                    | `<svelte:head>` title and description (`lamp_meta_*`), renders the feature components with `data`                                                                                                                   | exists; needs change — guest branch (intro + sign-in button only), drop `onMount(lamps.init)`                                           |
| Route (server)   | `src/routes/(site)/practice/lamp/+page.server.ts`                                                                                 | `load`: guest → no backend call, `{ isGuest: true, garden: null }`; signed-in → `listLampGarden` (an `ApiError` leaves `garden: null`). Action `light`: session check, validation, `lightLamp`, error → `LampError` | exists; needs change — shared validation (trim + NFC), `is_anonymous`, blank recipient omitted (contract-gated), no localized text sent |
| Route (endpoint) | `src/routes/api/lamps/+server.ts`                                                                                                 | `GET ?lamp_type=&cursor=` → `listLampGarden`; checks the type against `LAMP_TYPES`; 401 without cookie                                                                                                              | exists; no change for v1.0                                                                                                              |
| Feature UI       | `src/lib/features/lamp/components/LampOffering.svelte` (today `$lib/components/sections/LampOffering.svelte`)                     | Form, ignition, confirmation, hero FLIP animation; props only                                                                                                                                                       | exists (old place); needs change — see Known gaps G2–G4, G13, G15, move                                                                 |
| Feature UI       | `src/lib/features/lamp/components/LampGuestIntro.svelte`                                                                          | Eyebrow, title, description and the sign-in button for guests                                                                                                                                                       | not created                                                                                                                             |
| Feature UI       | `src/lib/features/lamp/components/LampGarden.svelte` (today `$lib/components/sections/LampGarden.svelte`)                         | Header, chips, cards, "load more", empty and error states                                                                                                                                                           | exists (old place); needs change — G7–G12, move                                                                                         |
| Feature UI       | `src/lib/features/lamp/components/LampCard.svelte`                                                                                | One garden card: artwork, type, lighter or `lamp_wall_you`, recipient, remaining label                                                                                                                              | not created (inline in the garden today)                                                                                                |
| Feature UI       | `src/lib/components/ui/LampVessel.svelte`                                                                                         | Lamp artwork for a type and a mode (`off` / `igniting` / `lit`, `mini`)                                                                                                                                             | exists, unchanged                                                                                                                       |
| Feature state    | `src/lib/features/lamp/state/garden.svelte.ts`                                                                                    | `view` (filter, items, cursor, hasMore), the latest `total` / `counts`, `loading` / `failed`, `pick()` / `more()`; extracted from the garden component so it can be unit-tested with a fake `fetch`                 | not created (logic is inline in `LampGarden.svelte`)                                                                                    |
| Feature state    | `src/lib/state/lamps.svelte.ts`                                                                                                   | Lamp ids kept in `localStorage` key `il-lamps` to guess "mine"                                                                                                                                                      | exists; **to be deleted** (AC 22, 30)                                                                                                   |
| Feature logic    | `src/lib/features/lamp/validation.ts`                                                                                             | `normalizeText` (trim + NFC), `charCount`, `validateLampInput(input)` → `{ valid, field?, recipient, prayer }`; used by the form and by the action                                                                  | not created (the action has an inline `chars()` without NFC)                                                                            |
| Feature logic    | `src/lib/features/lamp/remaining.ts`                                                                                              | `remainingLabel(endAt, now)` → `{ kind: 'days', days } \| { kind: 'under_one_day' } \| { kind: 'out' }`; `isLit(endAt, now)`                                                                                        | not created (`daysLeft` in `lamps.svelte.ts` is the old rule)                                                                           |
| Feature logic    | `src/lib/features/lamp/errors.ts`, `types.ts`                                                                                     | `LampError` (`auth` / `invalid` / `limit` / `failed`) and `lampErrorMessage()`                                                                                                                                      | exists, unchanged                                                                                                                       |
| Content          | `src/lib/content/lamps.ts`                                                                                                        | `LAMP_TYPES`, `LAMP_PURPOSES` (backend codes, names, vessel styles), `LAMP_DAYS`, `DEFAULT_LAMP_DAYS`, `RECIPIENT_MAX`, `PRAYER_MAX`                                                                                | exists; needs change — `DEFAULT_LAMP_DAYS` 1 → 7                                                                                        |
| API resource     | `src/lib/server/api/lamps.ts`                                                                                                     | `lightLamp(fetch, token, input)`, `listLampGarden(fetch, token, { lamp_type, cursor })` over `apiCall`                                                                                                              | exists; needs change — doc comments for 3.0.0 only                                                                                      |
| Types            | `src/lib/types/lamp.ts`                                                                                                           | DTO types (`LightLampInput`, `Lamp`, `GardenLamp`, `LampGardenPage`, codes)                                                                                                                                         | exists; needs change — `recipient` optional / nullable, `GardenLamp.is_mine` (⚠️ contract 3.0.0)                                        |
| Session          | `src/lib/server/auth/session.ts`, `src/hooks.server.ts`                                                                           | `TOKEN_COOKIE`; refresh and `handleFetch` retry on `401` (owned by `login`)                                                                                                                                         | exists, owned by `login`                                                                                                                |
| Entry points     | `SiteHeader.svelte`, `MobileMenu.svelte`, `content/practice.ts` (tile `href`), `TodayCelebration.svelte`, `config/breadcrumbs.ts` | Links to `/practice/lamp`, breadcrumb                                                                                                                                                                               | exists                                                                                                                                  |
| i18n             | `messages/vi.json`, `messages/en.json`                                                                                            | Keys `lamp_*` (49 today, same keys in both files)                                                                                                                                                                   | exists; needs change — new, changed and removed keys below                                                                              |
| Tests            | `src/lib/features/lamp/*.spec.ts`, `tests/vectors/lamp/*.json`, `scripts/sync-lamp-vectors.mjs`, `tests/lamp.e2e.ts`              | Per `il-testing`                                                                                                                                                                                                    | not created (the repo has no test runner yet)                                                                                           |

## Route & navigation flow

```
/practice/lamp   (load: guest → no backend call)
  ├─ guest ──▶ intro + lamp_login ──▶ /login?redirect=/practice/lamp   (login spec)
  └─ signed-in
       ├─ form  ── lamp_light ✓ ──▶ ignition ──▶ confirmation
       │            ├─ lamp_again ──▶ empty form (type / intention / days kept)
       │            └─ lamp_to_garden ──▶ #lamp-garden (same page)
       │     └─ failure ──▶ stay on the form, message in place
       └─ garden (#lamp-garden)
            ├─ chip ──▶ GET /api/lamps?lamp_type=…  ──▶ replace list
            ├─ lamp_wall_more ──▶ GET /api/lamps?cursor=…  ──▶ append
            └─ lamp_to_form (empty state, and a way back) ──▶ form
```

## Step-by-step Flow — Light a lamp

```
Step 1 — Press "Light the lamp" (this feature, browser)
- Trigger: visitor presses `lamp_light`
- Pre-condition: signed in; phase is `form`
- Where: `LampOffering` `use:enhance` submit function
- Behavior: if phase is not `form`, cancel (a second press is ignored; the button is also disabled while igniting).
  Run `validateLampInput` on the trimmed, NFC-normalized recipient and prayer; if invalid, show `lamp_err_invalid`,
  keep every value, do NOT start the ignition and do NOT submit. If valid, set phase `igniting`, clear the error,
  start the ignition timer (2.1 s, always played in full), submit.
    - Failure (invalid input) → `lamp_err_invalid`, no request

Step 2 — Server action `light` (this feature, SvelteKit server)
- Trigger: the form post to `?/light`
- Pre-condition: `locals.user` and an `il_token` cookie
- Where: `src/routes/(site)/practice/lamp/+page.server.ts` action `light`
- Behavior: no session → `fail(401, { lampError: 'auth' })`, no backend call. Re-run `validateLampInput` (the browser check is a convenience),
  check type, intention and days against the closed sets, blank recipient → omitted, blank prayer → `null`, `is_anonymous` from the switch.
    - Failure (validation) → `fail(400, { lampError: 'invalid' })`
- API: POST /v1/lamps (lamp_type, intention, duration_days, optional recipient, optional prayer, is_anonymous) — the lighter, the times and the name are never sent
  ⚠️ Not confirmed: omitting `recipient` is not accepted by openapi.yaml 2.1.1 (planned 3.0.0, be spec v2.0) — blocks sending a blank recipient; until then the backend answers 400 for a blank recipient.
    - Success (201 new lamp, or 200 the earlier identical lamp within 5 s) → return `{ lamp }` (with the lighter's own intention and prayer)
    - Failure (400 VALIDATION_ERROR) → `fail(400, { lampError: 'invalid' })`
    - Failure (401 UNAUTHORIZED) → `fail(401, { lampError: 'auth' })`
    - Failure (409 LAMP_LIMIT_REACHED) → `fail(409, { lampError: 'limit' })`
    - Failure (network, 429, 503, 5xx) → `fail(<4xx status or 502>, { lampError: 'failed' })`

Step 3 — Wait for the ignition (this feature, browser)
- Trigger: the action result arrives
- Behavior: wait until the ignition timer has finished, whatever the result. On any failure return to phase `form` with the message of Step 2; the typed values are component state and are kept.
    - Failure → back to the form, message per the Error → UI table

Step 4 — Show the confirmation (this feature, browser)
- Trigger: success after Step 3
- Behavior: set the lamp, phase `lit`, move the artwork (FLIP, skipped under `prefers-reduced-motion`). The confirmation shows type, intention, days, recipient (or `lamp_recipient_all`), prayer when present, and the end moment formatted from `end_at` in the device time zone and locale
  (`Intl.DateTimeFormat`, date and time). Actions: `lamp_again`, `lamp_to_garden`. v1 also stores the lamp id in `localStorage` (`il-lamps`): **removed** by this spec (AC 22, 30).

Step 5 — Refresh the garden (this feature, SvelteKit)
- Trigger: success after Step 4
- Where: `update({ reset: false })` re-runs the page `load`
- API: GET /v1/lamps (first page, unfiltered)
    - Success → the garden shows the new lamp, the totals and counts, the filter back on "All"; the confirmation stays
    - Failure (`ApiError`) → `garden: null`, `lamp_wall_error` in the garden section; the confirmation stays
```

## Step-by-step Flow — Open, filter and page the garden

```
Step 1 — Open the page (this feature)
- Trigger: a GET navigation to /practice/lamp
- Pre-condition: signed in (a guest gets `{ isGuest: true, garden: null }` and no backend call)
- Where: `+page.server.ts` `load`
- API: GET /v1/lamps (no filter, no cursor; page size and ordering are the backend's)
    - Success → first page, total, per-type counts, `has_more`, `next_cursor` as page data
    - Failure (`ApiError`) → `garden: null`; the page still renders the form and `lamp_wall_error`
    - Failure (401 after the hook's refresh attempt) → the hook ends the session and redirects the navigation (`login` AC 9)

Step 2 — Choose a chip (this feature)
- Trigger: visitor presses a chip (not the one already pressed, not while a request runs)
- Where: browser `fetch('/api/lamps?lamp_type=…')` → `src/routes/api/lamps/+server.ts` → `listLampGarden`
- API: GET /v1/lamps?lamp_type=<OIL_LAMP | LOTUS_CANDLE | FLOWER_LANTERN> (omitted for "All")
    - Success → replace items, cursor and `has_more`; refresh total and counts from this response
    - Failure → keep the list already shown, show `lamp_wall_error`

Step 3 — Load more (this feature)
- Trigger: visitor presses `lamp_wall_more` (not while a request runs)
- Where: same endpoint with `cursor=<next_cursor>` and the current filter
- API: GET /v1/lamps?lamp_type=…&cursor=…
    - Success → append items (no re-sorting), replace cursor and `has_more`
    - Failure → keep the list, show `lamp_wall_error`
```

## Session & cookies

Reads only. `locals.user` (set by `hooks.server.ts`) decides guest versus signed-in; the action and the endpoint read `il_token` and pass it as the Bearer token. A `401` from a Bearer call is refreshed and retried once by `handleFetch`, and a rejected refresh ends the session (owned by `login`, see its design). The feature never reads `il_refresh`, never writes a cookie and never puts a token into page data.

## Remaining-time label and time zone

`remaining.ts` takes `remainingSeconds = (Date.parse(end_at) - now) / 1000` and returns `out` for zero or less, `under_one_day` below 86 400 seconds, otherwise `days = ceil(remainingSeconds / 86 400)`. The shared vector `lamp-remaining-label.json` is the specification; the function never restates the cases. The component maps the kind to a key. The label is computed when a card is rendered (no timer). `isLit(end_at, now)` is `now < end_at` (the end moment is exclusive, `lamp-lifetime.json`); it is used for the `out` case. The end moment on the confirmation is formatted from `end_at` with the visitor's locale and time zone; the website never builds an end moment itself.

## i18n keys

Prefix `lamp_`. The Vietnamese text of keys with a product §3.1.1 line is that line (punctuation only adjusted); English values are the website's proposal and are ⚠️ Not confirmed (product, Appendix A) until the product owner confirms them. Existing keys not listed are unchanged.

| Key                                                                                                                             | Used for                                                              | vi (English gloss)                                                                | en (⚠️ proposal)                              | Action                                           |
| ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------ |
| `lamp_field_hide_name`                                                                                                          | The hide-name switch label                                            | "Ẩn tên tôi" (hide my name)                                                       | "Hide my name"                                | add                                              |
| `lamp_recipient_notice`                                                                                                         | Notice under the recipient field                                      | "Người khác sẽ thấy tên người nhận." (other people will see the recipient's name) | "Other people will see the recipient's name." | add                                              |
| `lamp_wall_you`                                                                                                                 | Own-lamp label on a card                                              | "Của bạn" (yours)                                                                 | "Yours"                                       | change value (was "Bạn" / "You")                 |
| `lamp_wall_anonymous`                                                                                                           | Fallback when `lighter_name` is empty                                 | "Vô danh" (anonymous)                                                             | "Anonymous"                                   | change vi value (was "Ẩn danh")                  |
| `lamp_remaining_days`                                                                                                           | Remaining label, 24 h or more (`{count}`)                             | "Còn {count} ngày" (N days left)                                                  | "{count} days left" (⚠️ plural for 1)         | add; replaces `lamp_days_left`                   |
| `lamp_remaining_under_day`                                                                                                      | Remaining label under 24 h                                            | "Còn dưới 1 ngày" (under 1 day left)                                              | "Less than 1 day left"                        | add                                              |
| `lamp_recipient_all`                                                                                                            | The all-beings text where it stands alone (confirmation)              | "Tất cả chúng sanh" (all sentient beings)                                         | "All sentient beings"                         | change value (was lowercase)                     |
| `lamp_to_all`                                                                                                                   | Card line and caption for a lamp with no recipient                    | "cho tất cả chúng sanh"                                                           | "for all sentient beings"                     | add (⚠️ wording, see requirements)               |
| `lamp_to_garden`                                                                                                                | Confirmation action                                                   | "Vào vườn đèn" (go to the lamp garden)                                            | "Go to the lamp garden"                       | add                                              |
| `lamp_to_form`                                                                                                                  | Way back to lighting; the empty-state button                          | "Thắp đèn" (light a lamp)                                                         | "Light a lamp"                                | add                                              |
| `lamp_wall_empty_title`                                                                                                         | Empty garden title                                                    | "Vườn đèn còn trống" (the garden is empty)                                        | "The lamp garden is empty"                    | add                                              |
| `lamp_wall_empty_body`                                                                                                          | Empty garden text                                                     | "Thắp một ngọn đèn để nó sáng ở đây." (light a lamp so it shines here)            | "Light a lamp and it will shine here."        | add; replaces `lamp_wall_empty`                  |
| `lamp_until`                                                                                                                    | End moment on the confirmation (`{date}` now date and time, `{days}`) | unchanged text                                                                    | unchanged                                     | keep key, change the formatted `{date}`          |
| `lamp_err_*`, `lamp_wall_error`, `lamp_login`, `lamp_light`, `lamp_again`, `lamp_wall_count`, `lamp_wall_more`, `lamp_wall_all` | Messages and actions already matching product §3.1.1                  | —                                                                                 | —                                             | keep                                             |
| `lamp_share`                                                                                                                    | "Chia sẻ" action                                                      | —                                                                                 | —                                             | keep until the product decides (⚠️ requirements) |
| `lamp_temple_title`, `lamp_temple_desc`, `lamp_temple_cta`                                                                      | Temple-lamp card                                                      | —                                                                                 | —                                             | **remove** from both files (FR-LMP-014)          |
| `lamp_wall_guest`, `lamp_days_left`, `lamp_wall_empty`                                                                          | Old guest line in the garden, old label, old empty text               | —                                                                                 | —                                             | **remove** once replaced                         |

`lamp_dedication`, `cel_lamp`, `practice_tool_lamp_*`, `header_lamp` are used by other pages and are not touched. Every new key is added to both files in the same change.

## Known gaps (code on 2026-10-17 versus this spec)

Verified by reading the files named. Each row is traced to a task in `tasks.md`.

| #   | Spec                                                                                                | Code today                                                                                                                                                                                                                                                                                                                                          | Phase          |
| --- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| G1  | AC 2: a guest sees the intro and a sign-in button only                                              | `LampOffering` shows the whole form to guests and swaps the submit button for a login link; `LampGarden` shows `lamp_wall_guest` and a login button                                                                                                                                                                                                 | 1              |
| G2  | AC 5: 7 days preselected                                                                            | `content/lamps.ts` `DEFAULT_LAMP_DAYS = 1`                                                                                                                                                                                                                                                                                                          | 1              |
| G3  | AC 5, 9: hide-name switch                                                                           | none; `is_anonymous` is never sent (`+page.server.ts`)                                                                                                                                                                                                                                                                                              | 1, 3           |
| G4  | AC 5: recipient notice                                                                              | none                                                                                                                                                                                                                                                                                                                                                | 1              |
| G5  | AC 8: blank recipient is omitted                                                                    | the action sends `m.lamp_recipient_all()` (the visitor's locale text) as the recipient because the backend 2.1.1 rejects a blank one                                                                                                                                                                                                                | 3 (contract)   |
| G6  | AC 7: trim + NFC, count in characters; client check without ignition                                | the action counts code points without NFC (`chars()` in `+page.server.ts`); the inputs carry `maxlength={RECIPIENT_MAX / PRAYER_MAX}`, which counts UTF-16 units and can block a valid 100-letter recipient typed in decomposed form (vector `lamp-input-validation`); no browser check, so invalid input plays the 2.1 s ignition before the error | 2              |
| G7  | AC 22: own lamps from `is_mine`, label "Của bạn"                                                    | `lamps.has(w.id)` from `localStorage` key `il-lamps`; label `lamp_wall_you` = "Bạn"                                                                                                                                                                                                                                                                 | 2, 3           |
| G8  | AC 20: fallback "Vô danh"                                                                           | `lamp_wall_anonymous` vi = "Ẩn danh"                                                                                                                                                                                                                                                                                                                | 1              |
| G9  | AC 23: remaining label                                                                              | `daysLeft()` = `ceil(days)` clamped at 0, so any partial day reads "còn 1 ngày"; no under-one-day label; no `out` handling; key `lamp_days_left` is lowercase                                                                                                                                                                                       | 2, 1           |
| G10 | AC 21: null recipient                                                                               | `GardenLamp.recipient` is typed `string` and the card prints `lamp_to_person({ name: w.recipient })`                                                                                                                                                                                                                                                | 3              |
| G11 | AC 26: total and counts from the latest response                                                    | `total` and `counts` come from the first page only; a filter or "load more" response does not refresh them                                                                                                                                                                                                                                          | 2              |
| G12 | AC 27: empty state                                                                                  | one line `lamp_wall_empty`, no title, no button; the same line for an empty filter                                                                                                                                                                                                                                                                  | 1              |
| G13 | AC 14, 15: confirmation content and actions                                                         | no "Vào vườn đèn"; the temple card with `lamp_temple_*` and a link to `/offer?purpose=lamp&wish=…`; the end shows a date only (`dateFormat` day / month / year); the lamp type is shown by artwork only                                                                                                                                             | 1              |
| G14 | AC 17: a way to the garden from the form and back                                                   | none (the garden is simply below)                                                                                                                                                                                                                                                                                                                   | 1              |
| G15 | Share                                                                                               | `lamp_share` appears when `navigator.share` exists — ⚠️ Not confirmed (product)                                                                                                                                                                                                                                                                     | —              |
| G16 | AC 4: session ended on POST and `/api/*`                                                            | the action shows `lamp_err_auth`; a failed `/api/lamps` call shows `lamp_wall_error` — depends on `login`                                                                                                                                                                                                                                           | — (login)      |
| G17 | AC 30: no lamp data in browser storage                                                              | `+page.svelte` calls `lamps.init()`; `LampOffering` calls `lamps.add()`; both use `localStorage`                                                                                                                                                                                                                                                    | 2              |
| G18 | Progressive enhancement (`AGENTS.md` §4)                                                            | the lamp type, intention and duration are `type="button"` chips bound to state, and the confirmation exists only as client state, so without JavaScript the form posts defaults and shows nothing; accepted for now because the ignition is animation-driven — decision for the web team, not a product matter                                      | —              |
| G19 | Feature module (`AGENTS.md` §5)                                                                     | components live in `$lib/components/sections`; the garden's fetch / filter logic is inline in the component and cannot be unit-tested                                                                                                                                                                                                               | 1, 2           |
| G20 | Tests                                                                                               | no test runner; no lamp test                                                                                                                                                                                                                                                                                                                        | 4              |
| G21 | `FR-LMP-007` / `FR-LMP-011` matrix rows say the website adds 16 sample lamps and a 1,284 base count | not in the code: no sample or base number exists in `src/` for lamps (`rg` for `1284` / sample finds nothing); the product matrix and `.assumptions.md` are stale on this                                                                                                                                                                           | report         |
| G22 | Intention chip order                                                                                | `LAMP_PURPOSES` order is peace, merit dedication, salvation, gratitude; the product lists peace, salvation, merit dedication, gratitude (glossary) but does not require an order                                                                                                                                                                    | — (left as is) |

## Deliberately stubbed for now

- Sending a blank recipient and rendering `recipient: null` are written as the target but stay gated by `openapi.yaml` 3.0.0: until it ships, the action keeps substituting the localized all-beings text so lighting keeps working (G5). Likewise `is_mine`: until it ships, the localStorage guess (G7) stays and is the only way to mark own lamps. Both are removed together with the contract adoption (`tasks.md` Phase 3). Ship the website change after the backend change, not before.
- The "Chia sẻ" action stays as shipped until the product decides (⚠️ requirements).
