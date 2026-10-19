# Requirements — calendar (Sự kiện Phật giáo)

Version: 1.11
Last updated: 2026-10-17
Status: in-progress — `/events`, `/events/[code]` and the home "Sự kiện Phật giáo" block are public and built to this spec (contract 2.2.0): no token, "Lễ lớn" chip and mark, every group label, leap mark, shared countdown, practices per BR-CAL-14, default placeholder, six-month home block (current month), load more years up to 2100 with retry / offline, stale copy with note, 429 back-off. Still open: tests running the two vector files that still apply, E2E, NFR-CAL-03 measurement, a run against a live backend.
Feature folder: `src/routes/(site)/events/`, `src/routes/(site)/+page.server.ts` (home block), `src/lib/components/sections/{EventsHeader,EventsNext,EventsGroups,EventDetail,EventsRoutines}.svelte`, `src/lib/server/api/calendar.ts`, `src/lib/types/calendar.ts`, `src/lib/utils/events.ts`
Product spec: innerlamp-be `docs/product/calendar/product.md` @ v1.2
Contract: innerlamp-be `docs/specs/api/openapi.yaml` @ `info.version` 2.2.0 (tag Calendar, `GET /v1/calendar/events`), from innerlamp-be main at 80de1da (merge of PR chjpcojit/innerlamp-be#55, branch `feat/calendar-v3-public-major-via`; the contract text is identical to the pre-merge commit 3af0844). Backend spec: innerlamp-be `docs/specs/features/calendar/` @ v3.2.
Implements: BR-CAL-05, BR-CAL-08, BR-CAL-09, BR-CAL-10, BR-CAL-11, BR-CAL-12, BR-CAL-13, BR-CAL-14, BR-CAL-15, FR-CAL-001, FR-CAL-002, FR-CAL-003, FR-CAL-004, FR-CAL-005, FR-CAL-006, FR-CAL-007 (§3.6: copy kept by the website server or the browser session), FR-CAL-008, FR-CAL-009 (§3.6: website only), NFR-CAL-03

> See `changelog.md` in this folder for the version history of this spec.

This spec was written retroactively from the running code (read 2026-10-15) against the product spec; what the code lacks is written prospectively in the same file. Routes: `/events`, `/events/[code]?date=YYYY-MM-DD`, and the block on `/` (`/en/...`).

Product behaviour (event catalogue, repeat rules, groups, major events, public holidays, ordering, countdown, content format, home block, browsable years, offline copy) lives in the product spec and is **not** restated here; this file only says how the website implements those `BR-CAL-*` / `FR-CAL-*`. Not applicable to the website (Website column `n/a`): BR-CAL-01…04, BR-CAL-06, BR-CAL-07, BR-CAL-16, FR-CAL-010, NFR-CAL-01, NFR-CAL-02 — the website shows the dates the backend computes and never computes event dates itself (product §2.5).

## Constraints from the product spec

- **Public** (FR-CAL-001): guests and signed-in visitors see the same calendar; no sign-in prompt in this feature.
- **Dates come from the backend** (product §2.5, BR-CAL-05): the website never generates Rằm / Mùng Một or any other event date; it only joins `occurrences` with `events`.
- **The catalogue is the only source** (BR-CAL-10, BR-CAL-05, contract note on BR-DTY-05): no hard-coded list of major events, of vía (feast) dates, or of the codes of Rằm / Mùng Một in the website.
- **Countdown uses the visitor's device date** (BR-CAL-13): the computation runs in the browser, never on the SvelteKit server date.
- **Website offline copy** (§3.6 row FR-CAL-007): the copy the website server or the browser keeps for the session; the website has no persistent offline store.
- **Previous / next event** (§3.6 row FR-CAL-009): website only.
- **No** suggested sutras, hosting temples or reminders (product §1.2, FR-CAL-005).

## Dependencies

- **Backend calendar v3.2 / contract 2.2.0**: public route, `is_major`, `sort_order`, `recurrence`, per-IP rate limit, new seed (60 events; Rằm / Mùng 1 last in `sort_order`; `guidance` one practice per line). For a real server, the dev DB needs `make migrate` then `make seed-calendar-events` before `is_major` and the six new events exist.
- **Feature lunar** (`/lunar`, `/api/calendar/month`, outside product v1.2): shares `$lib/server/api/calendar.ts`; this spec only changes a function signature, not the lunar page behaviour.

## User Story

As a guest or a signed-in visitor, I want to see the Buddhist, Vietnamese and folk festivals of the year month by month, with the lunar date, the days left and the meaning of each day, so I know when Phật đản, Vu Lan, Rằm… fall without computing the lunar calendar myself.

## Acceptance Criteria (EARS notation)

### Access

1. WHEN a guest or a signed-in visitor opens `/events`, `/events/[code]` or the home page, THE SYSTEM SHALL read the calendar with `GET /v1/calendar/events` from the SvelteKit server **without** `Authorization` (only `x-api-key`), show the same content to everyone, and SHALL NOT show a sign-in invitation (`ev_guest`, `ev_d_guest`, `events_guest` on the home block). (FR-CAL-001) — drift: the code sends a Bearer token and shows guests a sign-in invitation.
   > ⚠️ Not confirmed (platform, default chosen): signed-in visitors do **not** get a Bearer token on this route either — default: never send it, so one shared cache serves everyone and an expired token cannot affect the calendar. Merging the PR approves it.
2. WHEN the backend answers 401 on the events route (since contract 2.2.0 this means the website's `API_KEY` is wrong, `INVALID_API_KEY`), THE SYSTEM SHALL treat it as a load failure (AC 17), log the error code, and SHALL NOT treat the visitor as a guest. (FR-CAL-001, FR-CAL-008)

### Festival list (`/events`)

3. WHEN `/events` opens, THE SYSTEM SHALL load the current year in Vietnam time (`Asia/Ho_Chi_Minh`) in the server `load`, list occurrences by solar month from January to December in the order the backend returns (BR-CAL-12), and after rendering in the browser SHALL scroll the current month into view. (FR-CAL-002, BR-CAL-02, BR-CAL-12)
4. WHEN a row is shown, THE SYSTEM SHALL include the solar date with weekday, the event name, the lunar date (with the leap-month mark per BR-CAL-08 / BR-CAL-05 when `is_leap_month`), the countdown label (AC 6), the major mark `ev_major` when `is_major`, **every** group label of the event in catalogue group order, and the public-holiday mark when `is_public_holiday`. (FR-CAL-002, BR-CAL-08, BR-CAL-09, BR-CAL-10, BR-CAL-11) — drift: rows show only the first group, the lunar date has no leap mark, no major mark yet.
5. WHEN several events fall on the same day, THE SYSTEM SHALL keep the order the backend returns (named events before Rằm / Mùng Một through the catalogue `sort_order`), and SHALL NOT re-sort or generate Rằm / Mùng Một. (BR-CAL-05, BR-CAL-12)
6. WHEN a countdown label is shown anywhere (list, upcoming card, detail; the home block shows none, AC 22), THE SYSTEM SHALL compute it in the browser from the device date through one shared pure function returning the four cases of BR-CAL-13 with keys `ev_left_today` / `ev_left_tomorrow` / `ev_left_days` / `ev_left_past`; WHEN the page renders on the server, THE SYSTEM SHALL NOT compute it from the server date (the label appears only after the browser runs). (BR-CAL-13) — drift: no "tomorrow"; the detail page computes in Vietnam time on the server and shows "N days ago" (`ev_d_days_ago`).
   > ⚠️ Not confirmed (platform, default chosen): SSR renders no countdown label (avoids a server/device date mismatch on hydration) — default: label empty until mount. Merging the PR approves it.
7. WHEN the visitor picks a filter chip, THE SYSTEM SHALL show only matching occurrences across all loaded years: `ev_tab_all`, `ev_tab_major` (only `is_major`), then one chip per group in catalogue group order (names taken from `data.groups`, never hard-coded); each chip shows how many occurrences it holds; the filter stays when more years load. (FR-CAL-003, BR-CAL-09, BR-CAL-10) — drift: no "Lễ lớn" chip yet.
8. WHEN the visitor picks a row, THE SYSTEM SHALL open `/events/[code]?date=<solar_date>` of exactly that occurrence. (FR-CAL-002, FR-CAL-005)
9. WHEN the visitor reaches the end of the loaded years and the last year is < 2100, THE SYSTEM SHALL show the `ev_load_more` button for the next year; WHEN pressed, THE SYSTEM SHALL load that year from the browser through `src/routes/api/calendar/year/+server.ts` (the server calls the backend) and append it to the list, then:
   - on success: add months 1–12 of the new year, recount the chips, move the button to the following year (no button after 2100);
   - on failure: keep what is shown and show at the end of the list `ev_load_more_failed` (or `ev_offline` when the browser is offline, AC 18) with an `ev_retry` button. (FR-CAL-004, BR-CAL-02) — drift: `load` currently pre-loads the current and next year and only "opens" the next one; nothing beyond the second year loads; if the next year fails the button vanishes, no retry.
   > ⚠️ Not confirmed (platform, default chosen): "reaches the end" is a button at the end of the list (no infinite scroll); `load` loads only the current year; later years load through `/api/calendar/year`. Merging the PR approves it.
10. WHEN `/events` is shown, THE SYSTEM SHALL offer no year before the current year. (FR-CAL-004)

### Detail (`/events/[code]`)

11. WHEN `/events/[code]?date=YYYY-MM-DD` opens, THE SYSTEM SHALL load the year of `date` (no `date` → current year in Vietnam time, pick the nearest upcoming occurrence, else the last) and show: image (AC 13), group labels, major mark, public-holiday mark, name, lunar date (with leap mark), solar date with weekday, countdown label (AC 6), description, "Phật tử thường làm gì" (AC 12); SHALL NOT show suggested sutras or hosting temples. (FR-CAL-005, BR-CAL-08, BR-CAL-10, BR-CAL-11, BR-CAL-13)
12. WHEN the long description and the practices are shown, THE SYSTEM SHALL split paragraphs / practices **on line breaks only** (never on commas or semicolons), strip a leading `-`, `•` or `*` from each practice, show the practices as a numbered list titled `ev_d_dos`, and hide any section whose content is empty. (BR-CAL-14) — drift: already splits on line breaks and hides empty sections; bullets are not stripped yet and `ev_d_dos` reads "Nên làm trong ngày" instead of the product wording.
    Product v1.2 settled the empty long description: it is hidden, never replaced by the short one (BR-CAL-14); the code still falls back to `short_description` (drift).
13. WHEN an event has no image (`image_url` is `null`), THE SYSTEM SHALL show the shared default image. (BR-CAL-14) — drift: today only a gradient background, no image.
    Until the shared default image exists, product §3.6 has the website show a gradient header with the lamp mark (`LampMark`).
    > ⚠️ Not confirmed (product): the shared default image file itself (asset, licence; product Appendix A, open) — blocks replacing the placeholder only.
14. WHEN `code` is not in the loaded year, or `date` is outside 1900–2100, THE SYSTEM SHALL answer 404 and show the not-found screen with a back button (`+error.svelte`). (FR-CAL-005) — ✓ already done.
15. WHEN the detail is shown, THE SYSTEM SHALL include links to the previous and next event in BR-CAL-12 order, crossing into the adjacent year when that year loads (it does not load → drop that side's link). (FR-CAL-009, BR-CAL-12) — ✓ already done.
16. WHEN the detail page renders, THE SYSTEM SHALL set `<title>` to the event name and the meta description to `short_description` (empty → `ev_meta_description`); the page is public, server-rendered and indexable. (platform, FR-CAL-001)

### Load failures and stale copy

17. WHEN the backend cannot return the needed year (network, 5xx, 429, 401 wrong key) and the website server has **no** copy of that year, THE SYSTEM SHALL show `ev_unavailable` with an `ev_retry` button on `/events`; the data-error screen (with retry) on `/events/[code]`; and `events_unavailable` with `ev_retry` **in place of the cards** of the home block (the block does not disappear). (FR-CAL-008) — drift: `/events` and the home page have no retry; the detail page already has it (`+error.svelte`).
18. WHEN a load from the browser (AC 9) fails because the browser is offline (`navigator.onLine === false` or `fetch` throws a network error), THE SYSTEM SHALL show `ev_offline` instead of `ev_load_more_failed`. (FR-CAL-008)
    > ⚠️ Not confirmed (platform, default chosen): the dedicated offline notice exists only for loads started in the browser — a page loaded from the server cannot know the device is offline (an offline device cannot reach the server at all). Merging the PR approves it.
19. WHEN the backend cannot return the needed year but the website server **already has** a copy of that year (from an earlier successful load, for any visitor), THE SYSTEM SHALL show that copy on `/events`, `/events/[code]` and the home block with the note `ev_stale_note` ("may be out of date"). (FR-CAL-007 §3.6) — drift: the cache drops expired entries before calling again, so a backend failure loses the calendar.
    > ⚠️ Not confirmed (platform, default chosen): "the website's copy" = the latest successful load of each year, kept in the memory of the SvelteKit server process (lost on restart, not shared between instances), plus the years already loaded in the open page. No `localStorage`. Merging the PR approves it.
20. WHEN `ev_retry` is pressed, THE SYSTEM SHALL reload exactly the part that failed (page: re-run `load`; load more: call the endpoint again) and show the calendar on success. (FR-CAL-008)
21. WHEN the backend answers 429 `RATE_LIMITED`, THE SYSTEM SHALL handle it as a load failure (AC 17 or AC 19), and SHALL NOT call the backend again for that year before the `details.retry_after_seconds` it returned has elapsed (when absent, a default wait). (FR-CAL-008, platform)
    > ⚠️ Not confirmed (platform, default chosen): when 429 arrives with no `retry_after_seconds`, wait 60 seconds (the dev window of the limit). Merging the PR approves it.

### Home block "Sự kiện Phật giáo"

21. WHEN the home page is shown (guest or signed in), THE SYSTEM SHALL show the "Sự kiện Phật giáo" block as **one card for the current month** (Vietnam time) listing the occurrences of that month **of every group, with no group filter**: the **three nearest occurrences that have not passed** (`solar_date` today or later, nearest first, BR-CAL-12 order), and below them `events_more_others` ("+N other events") where N is the month's total occurrences of every group — days already passed included — minus the rows shown (6 in the month, 2 passed, 3 shown → "+3"). WHEN fewer than three occurrences are upcoming, THE SYSTEM SHALL show only those rows and still show "+N" when N > 0; a month with no occurrence shows `events_month_none`; when the year cannot be loaded the card shows `events_unavailable` with `ev_retry`. (platform, FR-CAL-006) — drift (before this version): the code showed six cards.
    The number of rows (3), the number of months (1) and the choice of the nearest upcoming occurrences are this website's own presentation, set by the product owner on 2026-10-18 to fit the website design. They are **not** product rules: another platform may show a different number of rows or months from the same data.
    > ⚠️ Not confirmed (product): product spec v1.2 fixes the presentation itself — six months, three rows, Buddhist group only, ranked by tiers (major, named, Rằm / Mùng Một) (BR-CAL-15, FR-CAL-006, §3.1.1, `rules/home-block.json`) — and so contradicts this criterion. Proposed split, for `ba-writer` in innerlamp-be to decide: the product spec keeps only what is shared (which events are eligible, the BR-CAL-12 order, what "+N" means) and leaves row count, month count and tiering to each platform spec and its design; until then this criterion is a website variance (§3.6). Default of this spec: "today" is the Vietnam date computed on the server; when no occurrence is upcoming no row is shown, only "+N". Blocks nothing here.
22. WHEN a row is shown inside a month card, THE SYSTEM SHALL include the date, name and lunar date (with leap mark), and SHALL NOT show a countdown label (product §3.1.1: the home block has none). (FR-CAL-006, BR-CAL-08)
23. WHEN the visitor picks an event in the block, THE SYSTEM SHALL open `/events/[code]?date=<solar_date>`; WHEN they pick `events_view_all` or "+N other events", THE SYSTEM SHALL open `/events` (at the current month, AC 3). (FR-CAL-006)

### General

24. WHEN the backend is called for the calendar, THE SYSTEM SHALL call it only from the SvelteKit server through `$lib/server/api/calendar.ts` (`x-api-key` from `API_KEY`, sent on every call so the request is not counted by the per-IP limit); the browser only calls `src/routes/api/calendar/year/+server.ts`, never the backend directly. (platform)
25. WHEN the current-year calendar page opens on a 4G network, THE SYSTEM SHALL render it within 2 seconds, and within 0.5 seconds when the server already holds a copy of that year. (NFR-CAL-03)
26. WHEN unit tests run, THE SYSTEM SHALL pass every case of the product spec's `rules/countdown.json` and `rules/ordering.json` (`rules/home-block.json` is not run: the home block follows AC 21; product §4.1 — `event-placement.json` runs only on the backend). (BR-CAL-13, BR-CAL-12, BR-CAL-15)
27. WHEN any string is shown, THE SYSTEM SHALL use a Paraglide key present in both `messages/vi.json` and `messages/en.json`; names, descriptions, practices and group names come verbatim from the backend (Vietnamese only, product §1.2); the wording of the labels the product names (BR-CAL-13, §3.1.1: "Tất cả", "Lễ lớn", "+N sự kiện khác", "Phật tử thường làm gì") follows the product, the `en` text follows the product's English gloss. (platform, FR-CAL-003, FR-CAL-005, FR-CAL-006, BR-CAL-13)
28. WHEN the website needs to know which events are major, which occurrences are Rằm / Mùng Một, or which day is a deity's vía, THE SYSTEM SHALL read it from `is_major`, `recurrence` and the catalogue events, and SHALL NOT keep a hard-coded list of codes or dates; a `recurrence` value it does not know SHALL be treated as "other", not as an error. (BR-CAL-10, BR-CAL-05, BR-CAL-15)

## Data & API (called from the SvelteKit server)

Headers: `x-api-key` from `API_KEY`; **no** `Authorization` (AC 1; the backend ignores it if sent). Request/response shape: schemas `CalendarEventsEnvelope` / `CalendarEvent` / `CalendarOccurrence` in innerlamp-be `docs/specs/api/openapi.yaml` @ 2.2.0 — not copied here.

| Operation                 | Operation (openapi)                                      | Called from                                                                                                                                                                                       | Notes                                                                                                                                   |
| ------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Read one year             | `GET /v1/calendar/events?year=YYYY`                      | `$lib/server/api/calendar.ts` `getCalendarYear`, used by `events/+page.server.ts` `load`, `events/[code]/+page.server.ts` `load`, `(site)/+page.server.ts` `load`, `api/calendar/year/+server.ts` | Always send an explicit `year` (the backend then answers `Cache-Control: public`); cache per year on the server (design "Cache & copy") |
| Load more years (browser) | — (internal endpoint `GET /api/calendar/year?year=YYYY`) | `EventsGroups` / `+page.svelte` of `/events`                                                                                                                                                      | Returns the compact list + groups of the year; 400 when the year is outside [current year, 2100]                                        |

Contract status: `openapi.yaml` 2.2.0 makes the route public (`security: []`), adds `is_major`, `sort_order` and `recurrence` to `CalendarEvent`, answers `Cache-Control: public` when `year` is given, 401 `INVALID_API_KEY` for a wrong key, and 429 `RATE_LIMITED` (with `details.retry_after_seconds`) above the per-IP limit; requests carrying the correct `X-API-Key` are not counted.

## Error → UI mapping

| Operation                                                   | Failure case                                             | Visitor sees                                                 | Current code                                                |
| ----------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- |
| `GET /v1/calendar/events` (load `/events`)                  | network / 5xx / 429 / 401, **with** a copy               | Calendar from the copy + `ev_stale_note`                     | not yet                                                     |
| `GET /v1/calendar/events` (load `/events`)                  | network / 5xx / 429 / 401, **no** copy                   | `ev_unavailable` + `ev_retry`                                | `ev_unavailable` exists, no retry; 401 → `ev_guest` (drift) |
| `GET /api/calendar/year` (load more)                        | backend error, no copy                                   | Keep the list, `ev_load_more_failed` + `ev_retry` at the end | not yet (button vanishes)                                   |
| `GET /api/calendar/year`                                    | browser offline                                          | Keep the list, `ev_offline` + `ev_retry` at the end          | not yet                                                     |
| `GET /api/calendar/year`                                    | 400 (year outside the range — not reachable from the UI) | Same as a load-more failure                                  | not yet                                                     |
| `GET /v1/calendar/events` (load detail)                     | `code` not in the year / `INVALID_YEAR`                  | 404, not-found screen + back                                 | ✓                                                           |
| `GET /v1/calendar/events` (load detail)                     | network / 5xx / 429 / 401, with a copy                   | Detail from the copy + `ev_stale_note`                       | not yet                                                     |
| `GET /v1/calendar/events` (load detail)                     | network / 5xx / 429 / 401, no copy                       | Data-error screen with retry (`+error.svelte`, 502)          | ✓ (502); 401 → `ev_d_guest` (drift)                         |
| `GET /v1/calendar/events` (adjacent year for previous/next) | any error                                                | No link on that side                                         | ✓                                                           |
| `GET /v1/calendar/events` (home block)                      | error, with a copy                                       | Cards from the copy + `ev_stale_note`                        | not yet                                                     |
| `GET /v1/calendar/events` (home block)                      | error, no copy                                           | `events_unavailable` + `ev_retry` in place of the cards      | `events_unavailable` exists, no retry                       |

Log: method + path + error code only (as `client.ts` does); the calendar has no personal data.

## Out of scope

- Lunar calendar `/lunar`, day detail `/lunar/day`, daily Buddha picture (product §1.2 — v1.x). They share `getCalendarYear`; this spec only updates the call when the function signature changes, keeping their behaviour (including the `/lunar` sign-in invitation).
- Temple events (sangha feature), reminders, suggested sutras, hosting temples, substitute days off, personal events, content in languages other than Vietnamese (product §1.2).
- Computing event dates, repeat rules, solar terms, the lunar date of an event (BR-CAL-01…07 — backend).
- Back-office screens (FR-CAL-010).

## Pending (not yet implemented)

Tracked in `tasks.md`:

- Call the route without a token, drop the sign-in invitation on `/events`, `/events/[code]` and the home block (FR-CAL-001) — Phase 3.
- "Lễ lớn" chip and major mark on rows and detail (BR-CAL-10, FR-CAL-003) — Phase 1–2.
- Home block (current month only, 3 nearest upcoming, "+N" of the total; owner decision 2026-10-18), every group (FR-CAL-006) — Phase 1–3.
- Load more years up to 2100 through the endpoint, retry, offline notice (FR-CAL-004, FR-CAL-008) — Phase 1–3.
- Stale copy when the backend fails + note, 429 back-off (FR-CAL-007, AC 28) — Phase 3.
- Retry on `/events` and the home block (FR-CAL-008) — Phase 1.
- One shared countdown per BR-CAL-13 (add "tomorrow", drop "N days ago", compute in the browser) — Phase 1–2.
- Every group label on rows (BR-CAL-09), leap mark on the lunar date (BR-CAL-08) — Phase 1.
- Strip bullets from practices, drop the short-description fallback, default image, `ev_d_dos` title (BR-CAL-14) — Phase 1.
- Tests running the two vector files that still apply, E2E, NFR-CAL-03 measurement — Phase 4.

## Open questions (resolved)

- ~~Can guests see the calendar?~~ → Yes, everyone the same (FR-CAL-001). Resolved 2026-10-15 (product v1.0); route made public by contract 2.2.0, 2026-10-17.
- ~~Filter by what?~~ → "Tất cả", "Lễ lớn", then each group (FR-CAL-003). Resolved 2026-10-15 (product v1.0).
- ~~What does the home block show?~~ → product (BR-CAL-15) says 6 months, Buddhist group only, in three tiers; the website shows the current month's 3 nearest upcoming occurrences by owner decision 2026-10-18 — see AC 21. Resolved 2026-10-15 (product v1.1), amended 2026-10-18.
- ~~Does the website keep previous / next event?~~ → Yes, website only (§3.6 FR-CAL-009). Resolved 2026-10-15 (product v1.0).
- ~~What is the "device copy" on the website?~~ → The copy of the website server or the browser during the session (§3.6 FR-CAL-007); the in-memory server copy was chosen (AC 19, platform default). Resolved 2026-10-15.
- ~~How does the website recognise Rằm / Mùng 1?~~ → Field `recurrence = lunar_monthly` (contract 2.2.0), never the `code` (no longer needed for the home block after 2026-10-18; kept for any future use). Resolved 2026-10-15 (backend spec v3.0), confirmed in the contract 2026-10-17.
- ~~Does the per-IP limit count the whole website as one visitor?~~ → No: a request carrying the correct `X-API-Key` is not counted (contract 2.2.0, backend message 2026-10-17); the website always sends the key. Resolved 2026-10-17.
- ~~Empty `long_description`: fall back to the short one?~~ → No, hide the section (BR-CAL-14, product v1.2). Resolved 2026-10-15 (product v1.2).
- ~~"Current month" of the home block?~~ → Vietnam time (BR-CAL-15, product v1.2). Resolved 2026-10-15 (product v1.2).
- ~~Does the website keep its own list of vía dates?~~ → No: the calendar is the only source of vía dates (contract note on BR-DTY-05); the catalogue now has 60 events including the six new deity events. Resolved 2026-10-17 (AC 29).
