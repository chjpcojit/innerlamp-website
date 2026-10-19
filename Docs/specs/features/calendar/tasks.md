# Tasks — calendar (Sự kiện Phật giáo)

Version: 1.11
Last updated: 2026-10-17
Status: in-progress — the public route, major events, home block (current month), load more years, stale copy and 429 back-off are built; 29 unit tests pass (`npm test`: the two product vectors that still apply, content splitting, `getCalendarYear` cache and back-off); not yet exercised against a live backend; no E2E, `check` and `lint` fail on files outside this feature

> See `changelog.md` in this folder for the version history of this spec.

`[x]` only when the item was checked in the code (Phases 1–3 read and built 2026-10-17; the 2026-10-17 grep found no hard-coded major / vía / Rằm-Mùng Một list in `src`; not exercised against a running backend, none was reachable) **and** matches what product spec v1.2 requires. Each item points to a row of the Layers & components table or a Step in `design.md`; `AC n` is a criterion in `requirements.md`. Everything that waited for backend v3.0 was unblocked by contract 2.2.0; to try it against a real server the dev DB needs `make migrate` then `make seed-calendar-events`.

## Phase 1 — UI (`il-ui`)

- [x] Route `/events` + `<svelte:head>` (title, meta description) — `events/+page.svelte`
- [x] List by solar month, scroll to the current month after navigation (AC 3) — `EventsGroups.svelte` `afterNavigate`
- [x] Row with solar date and weekday, name, lunar date, countdown label, public-holiday mark (AC 4 — the part that already matches)
- [x] "Tất cả" chip + one chip per group in `data.groups` order, with counts, filtering in the browser (AC 7 — group part)
- [x] A row opens `/events/[code]?date=<solar_date>` (AC 8)
- [x] Every group label of the event on a row, in catalogue group order (AC 4) — today only `groups[0]`
- [x] Leap mark on the lunar date on rows, upcoming card, detail, home block (`ev_lunar_date_leap`, `ev_d_lunar_leap`) (AC 4, 11, 22)
- [x] `ev_tab_major` chip after "Tất cả" and `ev_major` mark on rows / detail from `is_major` (AC 4, 7, 11)
- [x] Countdown label through the shared `countdown` function everywhere except the home block; add "tomorrow"; detail drops `ev_d_in_days` / `ev_d_days_ago`; `today` set in `onMount`, SSR renders no label (AC 6, Step A-2, C-4)
- [x] `/events`: drop the `guest` branch (`ev_guest`) (AC 1)
- [x] `/events`: `unavailable` state with an `ev_retry` button (`invalidateAll()`) (AC 17, 20)
- [x] `/events`: `ev_stale_note` when `stale` (AC 19)
- [x] `/events`: load-more button calls `/api/calendar/year`, keeps appended years in `$state`, hidden after 2100; failure → `ev_load_more_failed` / `ev_offline` + `ev_retry` at the end; merge new groups, filter kept (AC 9, 18, Step B-1)
- [x] Route `/events/[code]` + meta (title = name, description = `short_description` or `ev_meta_description`) (AC 16)
- [x] Detail: groups, holiday, name, lunar date, solar date with weekday, "Ý nghĩa", numbered practices, no suggested sutras / temples (AC 11 — the part that already matches)
- [x] Split description and practices on line breaks only, hide empty sections (AC 12 — the part that already matches) — `EventDetail.svelte` `lines()`
- [x] Previous / next event across the year boundary, no link when the adjacent year fails (AC 15, Step C-3)
- [x] Missing from the year / year out of range → 404 with back (AC 14) — `+error.svelte`
- [x] Strip a leading `-` / `•` / `*` from each practice (AC 12) — through `utils/event-content.ts`
- [x] Drop the `short_description` fallback when `long_description` is empty (AC 12; product v1.2 BR-CAL-14)
- [x] Default image when `image_url` is null — temporary `LampMark` on a gradient per product §3.6 (AC 13)
- [x] Detail: drop the `ev_d_guest` branch (AC 1); show `ev_stale_note` when `stale` (AC 19)
- [x] Home block (`EventsRoutines.svelte`): one card for the current month, the 3 nearest upcoming rows (date, name, lunar date; **no** countdown), "+N" = month total − 3 (passed days included), `events_more_others` → `/events`, empty month `events_month_none`, error `events_unavailable` + `ev_retry` in place of the cards, `ev_stale_note`, no sign-in invitation (AC 17, 19, 21, 22, 23, Step D-3)
- [x] "Tất cả" of the home block opens `/events` (AC 23)
- [x] i18n per the "i18n keys" table of `design.md`, in both `vi.json` and `en.json` (AC 27):
  - [x] add `ev_tab_major`, `ev_major`, `ev_left_tomorrow`, `ev_lunar_date_leap`, `ev_d_lunar_leap`, `ev_retry`, `ev_load_more_failed`, `ev_offline`, `ev_stale_note`, `events_more_others`, `events_month_none`
  - [x] change `ev_d_dos` per §3.1.1 ("Phật tử thường làm gì"); `ev_left_days` / `ev_left_past` per the BR-CAL-13 wording
  - [x] remove `ev_d_in_days`, `ev_d_days_ago`, `events_more`, `ev_guest`, `ev_d_guest`; keep the `events_*` keys still used by `LunarCalendar.svelte`

## Phase 2 — State & logic (`il-state`)

- [x] `listCalendarEntries` / `toListItems` / `listMonthItems` (`server/api/calendar.ts`) join occurrences with events, keep backend order (BR-CAL-12), never generate Rằm / Mùng Một (AC 5)
- [x] `parseIsoDate`, `daysBetween`, `monthShort` (`utils/events.ts`)
- [x] `countdown(today, solarDate) → {days, label}` + label → key map (`utils/events.ts`) per BR-CAL-13 (AC 6)
- [x] `paragraphs` / `practices` (`utils/event-content.ts`) per BR-CAL-14 (AC 12)
- [x] `compareOccurrences` (`utils/calendar-order.ts`) per BR-CAL-12 (AC 21)
- [x] `buildHomeBlock` / `pickHomeRows` (`utils/calendar-home.ts`): every group (no filter), the 3 nearest upcoming occurrences of the month, `more` = month total − shown (AC 21, Step D-2)
- [x] Types: `CalendarEvent` + `CalendarListItem` gain `is_major`, `sort_order`, `recurrence` (open union, unknown → "other", AC 29); `CalendarEventDetail` drops `days_left`, gains `stale`; `HomeBlockMonth` (`types/calendar.ts`)

## Phase 3 — Server data

- [x] `GET /v1/calendar/events` is in innerlamp-be `docs/specs/api/openapi.yaml` 2.2.0 (public, `is_major`, `sort_order`, `recurrence`, 401, 429, public cache) — cited, not copied
- [x] `getCalendarYear` caches per year in server memory, TTL 1 hour (`server/api/calendar.ts`)
- [x] `getCalendarYear(fetch, year)`: drop the `token` parameter (no Bearer); keep expired entries as the copy; an `ApiError` with an old copy → return `{calendar, stale: true}` (AC 1, 19, design "Cache & copy", Step A-1)
- [x] `getCalendarYear`: on 429 set `retryAt` from `details.retry_after_seconds` (default 60 s) and do not call the backend for that year before it (AC 28, design "Cache & copy")
- [x] Update the out-of-scope callers (`(site)/lunar/+page.server.ts`, `api/calendar/month/+server.ts`) to the new signature, keeping lunar behaviour
- [x] `events/+page.server.ts` `load` (Step A-1): current VN year only, no token, 401 = load failure (no more `guest`), return `stale` (AC 1, 2, 3, 17, 19)
- [x] `src/routes/api/calendar/year/+server.ts` (Step B-2): check year ∈ [current VN year, 2100] → 400; return `{year, groups, items, stale}`; failure without an old copy → 502 (AC 9, 10)
- [x] `events/[code]/+page.server.ts` `load` (Step C-1…C-3): no token, 401 is no longer "guest", drop `days_left`, return `stale` (AC 1, 11, 19)
- [x] `(site)/+page.server.ts` `load` (Step D-1, D-2): everyone, current year (+ next year when needed), `buildHomeBlock`, `homeEvents` with `state` / `stale` (AC 17, 19, 21)

## Phase 4 — Tests (`il-testing`)

- [x] Install Vitest through `npx sv add vitest="usages:unit"` (`npm test`; documented in AGENTS.md and README) — shared with memorial
- [x] Pinned vectors: sync script `scripts/sync-calendar-vectors.mjs` (calendar only; memorial's planned shared script can absorb it later) — original plan: shared sync script (memorial `tasks.md` Phase 4 planned `scripts/sync-memorial-vectors.*`; default: merge into one script taking the feature as a parameter) copying `docs/product/calendar/rules/{countdown,ordering,home-block}.json` from innerlamp-be (default `../innerlamp-be`) into `tests/vectors/calendar/` with the source commit; tests read the pin and **never edit it by hand**; when an innerlamp-be checkout exists compare the pin with the source and report drift (`event-placement.json` belongs to the backend, not copied)
  > ⚠️ Not confirmed (platform, default chosen): read vectors from the pinned `tests/vectors/calendar/` (so CI needs no innerlamp-be checkout) instead of reading `../innerlamp-be` directly. Merging the PR approves it.
- [x] Run every case of innerlamp-be `docs/product/calendar/rules/countdown.json` against `countdown` (BR-CAL-13)
- [x] Run every case of `docs/product/calendar/rules/ordering.json` against `compareOccurrences` (BR-CAL-12, BR-CAL-05)
- [x] Unit: `pickHomeRows` / `buildHomeBlock` (nearest upcoming, "+N" of the total, every group counted, fewer than 3 upcoming, all passed) — `calendar-home.spec.ts`; `home-block.json` is not run (AC 21, ⚠️ product)
- [x] Unit: `paragraphs` / `practices` (line breaks, bullets, no splitting on commas) — `event-content.spec.ts`; `getCalendarYear` cache (fresh / expired / failure with copy / failure without copy / 429 back-off / no token) with a fake `fetch` — `server/api/calendar.spec.ts`
- [ ] Unit: `listCalendarEntries` / `toListItems`, `api/calendar/year` (400 / 200 / 502)
- [ ] E2E (Playwright, real or fake backend): a guest opens `/events`, `/events/[code]`, `/` and sees the calendar; chips Tất cả / Lễ lớn / group; load more year and failure + retry; detail previous / next across a year; detail without image / without practices; backend failure → copy + note; first-load failure → message + retry; home block with 6 cards
- [ ] Measure NFR-CAL-03: `/events` current year < 2 s under 4G throttle, < 0.5 s when the server holds a copy (AC 25)

## Phase 5 — Quality (`il-quality`)

- [ ] `npm run check && npm run lint && npm run build` pass

## Phase 6 — Documentation

- [ ] Report the Website column status of innerlamp-be `docs/product/calendar/product.md` §4.2 to `ba-writer` (this skill does not edit the backend repo)
- [x] Remove the stale "Events page (`/events`)" entry from `.assumptions.md` (old-docs clean-up, 2026-10-15)
- [ ] OKF concept through `il-okf-writer` once the feature is verified end to end

## Deferred (not blocking calendar)

- Move the code to `src/lib/features/calendar/` per AGENTS.md §5 (optional).
- Real event images (product §2.7 — none yet).
