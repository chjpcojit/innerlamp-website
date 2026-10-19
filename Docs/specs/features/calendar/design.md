# Design — calendar (Sự kiện Phật giáo)

Version: 1.11
Last updated: 2026-10-17
Status: in-progress — built to this design except the tests; mirrors `requirements.md`

> See `changelog.md` in this folder for the version history of this spec.

## Overview

Two routes in the `(site)` group: `/events` (monthly festival list) and `/events/[code]?date=` (detail), plus the "Sự kiện Phật giáo" block on `/`. Data follows the repo's data path: `load` of `+page.server.ts` → `$lib/server/api/calendar.ts` `getCalendarYear` → backend `GET /v1/calendar/events?year=` with `x-api-key` and **no** token (the route is public since contract 2.2.0). One year is cached in server memory per year and shared by everyone, and the latest good copy is kept as the "website copy" when the backend fails (FR-CAL-007 §3.6). Loading more years is an interactive call from the browser through `src/routes/api/calendar/year/+server.ts`. What depends on the device date (countdown label, BR-CAL-13) runs in the browser after mount; what does not (joining occurrences with events, choosing the tiers of the home block, BR-CAL-15) is a pure function that runs on the server. Closest pattern to follow: this feature itself (already running) and the public home blocks (`getTopDeities` … — called without a token, an error does not break the page).

## Layers & components

| Layer                | File                                                                                                                 | Responsibility                                                                                                                                                                                                                   | Status                                                                                                                                                                                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route (UI)           | `src/routes/(site)/events/+page.svelte`                                                                              | Meta, `EventsHeader` (chips), `EventsNext`, `EventsGroups`, load-more button, error / copy states                                                                                                                                | exists — needs: drop the `guest` branch, retry, "Lễ lớn" chip, load more through the endpoint (keep the appended years in `$state`), error / offline at the end, `ev_stale_note`, `today` set in `onMount`                                                              |
| Route (server)       | `src/routes/(site)/events/+page.server.ts`                                                                           | `load`: current year (VN) → `getCalendarYear` → `{state, year, groups, items, stale}`                                                                                                                                            | exists — needs: no token, current year only (stop pre-loading next year), 401 is no longer "guest", return `stale`                                                                                                                                                      |
| Route (server)       | `src/routes/api/calendar/year/+server.ts`                                                                            | `GET ?year=`: check year ∈ [current VN year, 2100], `getCalendarYear`, return `{year, groups, items, stale}`; error → status without a data body                                                                                 | **not created**                                                                                                                                                                                                                                                         |
| Route (UI)           | `src/routes/(site)/events/[code]/+page.svelte`                                                                       | Meta (title = name, description = `short_description`), `EventDetail`; not-found by `+error.svelte`                                                                                                                              | exists — needs: drop the `ev_d_guest` branch                                                                                                                                                                                                                            |
| Route (server)       | `src/routes/(site)/events/[code]/+page.server.ts`                                                                    | `load`: year of `?date=` → pick the occurrence → adjacent year for previous/next → `CalendarEventDetail`                                                                                                                         | exists — needs: no token; drop server-computed `days_left` (moves to the browser); 401 is no longer "guest"; return `stale`                                                                                                                                             |
| Section UI           | `src/lib/components/sections/EventsHeader.svelte`                                                                    | Title, year subtitle, filter chips with counts                                                                                                                                                                                   | exists — needs the `major` chip after "Tất cả"                                                                                                                                                                                                                          |
| Section UI           | `src/lib/components/sections/EventsNext.svelte`                                                                      | "Upcoming event" card                                                                                                                                                                                                            | exists — platform extra (see "Deliberately stubbed"); countdown through the shared function                                                                                                                                                                             |
| Section UI           | `src/lib/components/sections/EventsGroups.svelte`                                                                    | List by month, scroll to the current month (`afterNavigate`), row with date/weekday, name, lunar date, groups, countdown, dimmed past rows                                                                                       | exists — needs: every group label (currently `groups[0]`), major mark, leap mark, "tomorrow" label                                                                                                                                                                      |
| Section UI           | `src/lib/components/sections/EventDetail.svelte`                                                                     | Image/gradient header, groups, countdown, holiday, name, lunar + solar date; "Ý nghĩa"; "Phật tử thường làm gì"; previous/next; "Thắp đèn", "Xem ngày âm" links                                                                  | exists — needs: default image, major mark, leap mark, countdown computed in the browser through the shared function, strip bullets, drop the `short_description` fallback                                                                                               |
| Section UI           | `src/lib/components/sections/EventsRoutines.svelte`                                                                  | Home block (left column) + "Thời khóa" (right column)                                                                                                                                                                            | exists — needs a rewrite of the left column: 6 month cards, ≤ 3 rows, "+N other events", empty month, error + retry, copy note                                                                                                                                          |
| Route (server)       | `src/routes/(site)/+page.server.ts`                                                                                  | Home `load`: `homeEvents: {month, stale}` for everyone                                                                                                                                                                           | exists — needs: no token, load the current year (+ next year when the 6 months cross the year), call `buildHomeBlock`                                                                                                                                                   |
| Logic                | `src/lib/utils/events.ts`                                                                                            | `parseIsoDate`, `daysBetween`, `monthShort`, `leftLabel`                                                                                                                                                                         | exists — needs `countdown(today, solarDate) → {days, label: 'today'\|'tomorrow'\|'days_left'\|'passed'}` (BR-CAL-13, vector) + `countdownText` mapping to keys; drop the detail-only `ev_d_*`                                                                           |
| Logic                | `src/lib/utils/calendar-order.ts`                                                                                    | `compareOccurrences(a, b)` by `solar_date`, `sort_order`, `code` (BR-CAL-12)                                                                                                                                                     | **not created**                                                                                                                                                                                                                                                         |
| Logic                | `src/lib/utils/calendar-home.ts`                                                                                     | `buildHomeBlock(occurrences, startYearMonth, today, months = 1)` → each month `{year, month, shown[≤3], more, failed}`; shown = the 3 nearest upcoming occurrences (every group), `more` = the month's total minus shown (AC 21) | **not created**                                                                                                                                                                                                                                                         |
| Logic                | `src/lib/utils/event-content.ts`                                                                                     | `paragraphs(text)` / `practices(text)`: split on `\r?\n`, trim, drop empties; `practices` strips a leading `-`/`•`/`*` (BR-CAL-14)                                                                                               | **not created** — today an internal `lines()` of `EventDetail`                                                                                                                                                                                                          |
| API resource         | `src/lib/server/api/calendar.ts`                                                                                     | `getCalendarYear(fetch, year)` → `{calendar, stale}`; per-year cache; 429 back-off; `listCalendarEntries`, `toListItems`, `listMonthItems`                                                                                       | exists — needs: drop the `token` parameter, stop deleting expired entries, return the old copy on failure, honour `retry_after_seconds` (Step A-1)                                                                                                                      |
| Types                | `src/lib/types/calendar.ts`                                                                                          | DTOs `CalendarYear`/`CalendarEvent`/`CalendarOccurrence`; views `CalendarListItem`, `CalendarEventDetail`, `CalendarNeighbour`                                                                                                   | exists — needs: `CalendarEvent` gets `is_major`, `sort_order`, `recurrence` (open union: unknown values fall to "other"); `CalendarListItem` gets `is_major`, `sort_order`, `recurrence`; `CalendarEventDetail` drops `days_left`, gains `stale`; type `HomeBlockMonth` |
| Callers out of scope | `src/routes/(site)/lunar/+page.server.ts`, `src/routes/api/calendar/month/+server.ts`                                | Lunar feature                                                                                                                                                                                                                    | exists — only change the `getCalendarYear` call to the new signature; keep behaviour                                                                                                                                                                                    |
| Assets               | `src/lib/components/ui/LampMark.svelte` (reuse)                                                                      | Temporary default image (⚠️ requirements AC 13)                                                                                                                                                                                  | exists                                                                                                                                                                                                                                                                  |
| i18n                 | `messages/vi.json`, `messages/en.json`                                                                               | `ev_*`, `events_*`                                                                                                                                                                                                               | exists — add/change/remove per the table below                                                                                                                                                                                                                          |
| Tests                | `src/lib/utils/*.spec.ts`, `src/lib/server/api/calendar.spec.ts`, `tests/calendar.e2e.ts`, `tests/vectors/calendar/` | Vectors + logic + E2E                                                                                                                                                                                                            | Vitest installed (`npm test`): `src/lib/utils/{calendar-vectors,event-content}.spec.ts`, `src/lib/server/api/calendar.spec.ts` exist; vectors pinned in `tests/vectors/calendar/` by `scripts/sync-calendar-vectors.mjs`; E2E (Playwright) **not yet**                  |

## Route & navigation flow

```
/ ──"Sự kiện Phật giáo" block──┬─ a row ──▶ /events/[code]?date=YYYY-MM-DD
                               ├─ "+N other events" ──▶ /events
                               └─ "Tất cả" ──▶ /events
/lunar (tab "Sự kiện" of CALENDAR_TABS) ──▶ /events   (nav.ts keeps the calendar tab at /events)
/events (scrolls to the current month)
  ├─ chip Tất cả / Lễ lớn / <group>  (filter in the browser)
  ├─ a row ──▶ /events/[code]?date=…
  └─ "Load more year {year}" ──▶ fetch /api/calendar/year?year= ──▶ appended to the list (≤ 2100)
/events/[code]?date=…
  ├─ ‹ previous event / next event › ──▶ /events/[code']?date=…   (across the year boundary)
  ├─ "Thắp đèn" ──▶ /practice/lamp ;  "Xem ngày âm" ──▶ /lunar/day?date=…
  └─ missing / outside 1900–2100 ──▶ 404 (+error.svelte, back)
```

Every `href`/redirect uses `localizeHref`.

## Cache & copy (FR-CAL-007 §3.6)

- In-process map, key = year: `{ data: CalendarYear, fetchedAt, retryAt? }`. The year is always sent explicitly (the backend answers `Cache-Control: public, max-age` — 24 h in dev — when `year` is given).
- **Fresh** (`now − fetchedAt < CACHE_TTL_MS`, kept at 1 hour as today) → return at once, `stale: false`, no backend call. The 1-hour server TTL is deliberately shorter than the backend's 24-hour public max-age: the catalogue is edited by hand and an hour is enough to keep the call rate at a few per hour per year per instance.
- **Expired or missing** → call the backend, unless `retryAt` is still in the future (429 back-off, below). Success → overwrite, `stale: false`, clear `retryAt`. Failure (`ApiError` network / 5xx / 429 / 401) → with an old copy return it with `stale: true`; without one throw.
- **429 `RATE_LIMITED`**: set `retryAt = now + details.retry_after_seconds` (default 60 s when absent). While `retryAt` is in the future the year is not called again: an old copy is returned as stale, otherwise the error is thrown at once.
- Never delete an expired entry (it is the copy). Size is bounded by the 1900–2100 range (≤ 201 entries).
- `Authorization` is never sent (⚠️ requirements AC 1, default), so one copy shared by everyone is correct. `x-api-key` is always sent: the backend does not count a request with the correct key against the per-IP limit, so the whole website being one IP is not a problem in normal operation.

## Step-by-step Flow — Open the festival list

```
Step A-1 — Read the current year (this feature)
- Trigger: open `/events` (SSR or client navigation)
- Pre-condition: none (public route)
- Where: `src/routes/(site)/events/+page.server.ts` `load` → `getCalendarYear(fetch, vietnamYear())`
- API: GET /v1/calendar/events?year=YYYY (x-api-key, no Bearer)
    - Success / fresh cache → `{state: 'ok', year, groups, items: toListItems(listCalendarEntries(...)), stale: false}`
    - Failure (network / 5xx / 429 / 401) with an old copy → as Success with `stale: true` → `ev_stale_note`
    - Failure without an old copy → `{state: 'unavailable'}` → `ev_unavailable` + `ev_retry` (`invalidateAll()`)

Step A-2 — Countdown and scroll (browser)
- Trigger: `+page.svelte` mounts
- Where: `today` = `$state` set in `onMount` (the device's local date); `countdown(today, item.solar_date)` in `$derived`
- Logic: before mount no countdown label is rendered; `afterNavigate` of `EventsGroups` scrolls to the current month (exists)
```

## Step-by-step Flow — Load more years

```
Step B-1 — Press load more (browser, this feature)
- Trigger: press `ev_load_more` (or `ev_retry` after a failure)
- Pre-condition: last appended year < 2100; no load in flight
- Where: `src/routes/(site)/events/+page.svelte`
- Logic: `fetch('/api/calendar/year?year=' + (last + 1))` (internal endpoint, no locale prefix, like `/api/calendar/month`); a network error or `navigator.onLine === false` → state `offline`

Step B-2 — Read the year (server, this feature)
- Where: `src/routes/api/calendar/year/+server.ts` `GET`
- Pre-condition: `year` is an integer in [current VN year, 2100] (else 400, no backend call)
- API: GET /v1/calendar/events?year=YYYY through `getCalendarYear` (same cache as Step A-1)
    - Success (including an old copy) → 200 `{year, groups, items, stale}` → the browser appends it, merges new groups (keeping catalogue order), recounts chips, keeps the filter
    - Failure without an old copy → 502 → the browser keeps the list and shows `ev_load_more_failed` + `ev_retry` at the end
    - Network failure in the browser → `ev_offline` + `ev_retry`
```

## Step-by-step Flow — Event detail

```
Step C-1 — Read the year of the occurrence (this feature)
- Trigger: open `/events/[code]?date=YYYY-MM-DD`
- Where: `src/routes/(site)/events/[code]/+page.server.ts` `load`
- API: GET /v1/calendar/events?year=<year of date, default VN year> through `getCalendarYear`
    - Success / old copy → Step C-2 (`stale` passed to the page)
    - Failure (INVALID_YEAR) → error(404)
    - Other failure, no old copy → error(502) → `+error.svelte` with retry

Step C-2 — Pick the occurrence (server, pure)
- Logic: `own` = entries whose `event.code === code`; empty → error(404);
  pick the `own` entry matching `date`, else the upcoming one (against the VN date), else the last

Step C-3 — Adjacent year for previous / next (this feature)
- Pre-condition: the occurrence is the first (previous) or last (next) of its year
- API: GET /v1/calendar/events?year=<year ± 1> through `getCalendarYear`
    - Success / old copy → the neighbour is the last / first element of that year
    - Failure → neighbour `null`, no link on that side (the page does not break)

Step C-4 — Display (browser)
- Where: `EventDetail.svelte`; countdown label = `countdown(today, solar_date)` after mount (the server `days_left` goes away);
  `paragraphs(long_description)`, `practices(guidance)`; empty sections hidden; `image_url` null → default image
```

## Step-by-step Flow — Home block

```
Step D-1 — Read the year of the current month (this feature)
- Trigger: `load` of `src/routes/(site)/+page.server.ts` (everyone, no guest branch)
- Logic: the month = current month in `Asia/Ho_Chi_Minh` (owner decision 2026-10-18: current month only, so one year is enough; `HOME_BLOCK_MONTHS = 1`, `buildHomeBlock` stays general)
- API: GET /v1/calendar/events?year=Y through `getCalendarYear`
    - Success / old copy → Step D-2; `stale` = the year is an old copy
    - Failure without an old copy → the card is marked `failed` and shows `events_unavailable` + `ev_retry` in place of its rows
  Errors other than `ApiError` are thrown as today; no API error breaks the home page

Step D-2 — Choose the rows (server, pure)
- Logic: `buildHomeBlock(occurrences, start, vietnamToday())` — `pickHomeRows` takes the month's occurrences of every group (no group filter), shows the 3 nearest with `solar_date >= today` in BR-CAL-12 order, and sets `more` to the month's total minus the rows shown (passed days included). No product vector applies (`home-block.json` describes the tiered rule it replaces)
- Result `HomeBlockMonth[]` ({year, month, shown ≤ 3 as `CalendarListItem`, more}) goes down to `EventsRoutines`

Step D-3 — Display (browser)
- Where: `EventsRoutines.svelte`; no countdown label on the block (product §3.1.1); `more > 0` → `events_more_others` link to `/events`;
  a month with no rows → `events_month_none`
```

## i18n keys

The Vietnamese text of keys with a "Product" column follows the product's exact wording (BR-CAL-13, §3.1.1); the `en` text follows the product's English gloss. No text is copied into this spec.

| Key                                                                                                                                                                                                                                                                     | Used for                                        | Product                        | Work                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `ev_tab_all`, `events_view_all`                                                                                                                                                                                                                                         | "Tất cả" chip / link                            | §3.1.1                         | keep                                                                                                    |
| `ev_tab_major`                                                                                                                                                                                                                                                          | "Lễ lớn" chip                                   | §3.1.1, FR-CAL-003             | add                                                                                                     |
| `ev_major`                                                                                                                                                                                                                                                              | Major mark on rows and detail                   | BR-CAL-10                      | add                                                                                                     |
| `ev_left_today`, `ev_left_tomorrow`, `ev_left_days`, `ev_left_past`                                                                                                                                                                                                     | Countdown label everywhere it is shown          | BR-CAL-13                      | keep 3 keys (fix wording to "Còn n ngày" / "Đã qua"), add `ev_left_tomorrow`                            |
| `ev_d_in_days`, `ev_d_days_ago`                                                                                                                                                                                                                                         | Detail-only countdown                           | —                              | **remove** (use `ev_left_*`)                                                                            |
| `ev_lunar_date`, `ev_d_lunar`                                                                                                                                                                                                                                           | Lunar date on rows / detail                     | BR-CAL-08                      | change: add leap variants (`ev_lunar_date_leap`, `ev_d_lunar_leap`)                                     |
| `ev_d_dos`                                                                                                                                                                                                                                                              | Practices title                                 | §3.1.1 "Phật tử thường làm gì" | change wording                                                                                          |
| `ev_d_about`                                                                                                                                                                                                                                                            | Description title                               | —                              | keep                                                                                                    |
| `ev_unavailable`, `events_unavailable`                                                                                                                                                                                                                                  | Load failure, no copy                           | FR-CAL-008                     | keep                                                                                                    |
| `ev_retry`                                                                                                                                                                                                                                                              | Retry button (`/events`, load more, home block) | FR-CAL-008                     | add                                                                                                     |
| `ev_load_more_failed`, `ev_offline`                                                                                                                                                                                                                                     | Load-more failure; browser offline              | FR-CAL-004, FR-CAL-008         | add                                                                                                     |
| `ev_stale_note`                                                                                                                                                                                                                                                         | "May be out of date" when a copy is used        | FR-CAL-007                     | add                                                                                                     |
| `events_more_others`                                                                                                                                                                                                                                                    | "+N other events" on a month card               | §3.1.1                         | add (replaces `events_more` "+{count} sự kiện")                                                         |
| `events_more`                                                                                                                                                                                                                                                           | —                                               | —                              | **remove** after the replacement                                                                        |
| `events_month_none`                                                                                                                                                                                                                                                     | Month card with no Buddhist event               | BR-CAL-15                      | add (or reuse `events_month_empty` if the wording fits; `events_month_empty` is still used by `/lunar`) |
| `events_month_title` (or reuse `ev_month_title`)                                                                                                                                                                                                                        | Month card title                                | —                              | add if a short form is needed                                                                           |
| `ev_guest`, `ev_d_guest`                                                                                                                                                                                                                                                | Sign-in invitation                              | — (FR-CAL-001)                 | **remove** with the token-less call                                                                     |
| `events_guest`, `events_today`, `events_days_left`, `events_lunar_date`                                                                                                                                                                                                 | Old home block                                  | —                              | stop using in the home block; **keep** because `LunarCalendar.svelte` (out of scope) still uses them    |
| `ev_meta_*`, `ev_subtitle`, `ev_filter_label`, `ev_next_label`, `ev_month_title`, `ev_month_count`, `ev_load_more`, `ev_empty`, `ev_d_lamp`, `ev_d_open_day`, `ev_d_prev`, `ev_d_next`, `ev_d_crumb`, `ev_d_back`, `ev_d_holiday`, `events_title`, `events_month_short` | As today                                        | —                              | keep                                                                                                    |

## Deliberately stubbed for now

- **Default image** — `LampMark` on a gradient until a file exists (⚠️ requirements AC 13).
- **Platform extras not in product §3.6 beyond what it lists**: the "upcoming event" card (`EventsNext`) on `/events`, the "Thắp đèn" and "Xem ngày âm" links on the detail, dimming past rows — product v1.2 §3.6 now lists all of them; keep as built.
- Code lives in `components/sections`, `utils`, `server/api` rather than `src/lib/features/calendar/` (AGENTS.md §5); moving it is optional, noted in `tasks.md` Deferred.
