# Changelog — calendar Spec

Tracks version history for `requirements.md`, `design.md`, and `tasks.md` in this folder. All three
files share one changelog since they change together as one spec unit. Newest version first.

## v1.11 (2026-10-18)

- `requirements.md` AC 21 reworded: the home block's row count (3), month count (1) and "nearest upcoming" choice are stated as this website's own presentation (tag `(platform, FR-CAL-006)`), set by the owner to fit the website design, not as product rules; the `⚠️ Not confirmed (product)` now proposes a split for `ba-writer`: the product spec keeps what is shared (eligible events, BR-CAL-12 order, meaning of "+N") and leaves row count, month count and tiering to each platform spec. Behaviour and code are unchanged. `design.md` / `tasks.md`: version only.
- Reason: the owner pointed out that the product spec should not fix presentation numbers that depend on each client's design (for example 3 rows on the website, 4 on iOS).

## v1.10 (2026-10-18)

- Home block takes the month's occurrences of **every group** (Buddhist, Việt Nam, Dân gian): the Buddhist-only filter that product BR-CAL-15 asks for is removed on the owner's instruction of 2026-10-18; the total behind "+N" counts every group too. `calendar-home.ts` loses `BUDDHIST_GROUP`; `calendar-home.spec.ts` gets a mixed-group case (30 tests pass).
- `requirements.md` AC 21 and its `⚠️ Not confirmed (product)` now also name the Buddhist-only filter; `design.md` (Layers row, Step D-2) and `tasks.md` follow. Hand-off to `ba-writer` as in v1.9, plus the group filter.
- Open copy question: `events_month_none` and the section title still say "Phật giáo" (product §3.1.1 wording); now that the block lists other groups the empty-month text may need new wording — not changed.
- Reason: owner's correction of the home block rule.

## v1.9 (2026-10-18)

- Home block rule, owner's decision of 2026-10-18 (final wording): one card for the current month, the **3 nearest occurrences that have not passed** (today counts), and a "+N" that is the month's Buddhist total minus the rows shown, passed days included (6 in the month, 2 passed, 3 shown → "+3"). It replaces the BR-CAL-15 tier ranking, so `rules/home-block.json` is no longer run: the sync script pins only `countdown.json` and `ordering.json`, the home-block vector test and pin are removed, and `calendar-home.spec.ts` covers the new rule (30 tests pass). If fewer than 3 are upcoming only those rows show; if none, only "+N" (platform default, recorded in AC 21).
- `requirements.md`: AC 21 rewritten (with the `⚠️ Not confirmed (product)` now naming the tier ranking and the vector), AC 26, Pending and Open questions follow; the `Contract:` line cites innerlamp-be main at 80de1da, the merge of PR #55 (the openapi and product files are identical to commit 3af0844), and the unmerged-PR `⚠️` is removed. `design.md` Layers row and Step D-2, `tasks.md` follow.
- Hand-off: `ba-writer` in innerlamp-be — BR-CAL-15 / FR-CAL-006 / §3.1.1 / `rules/home-block.json` still describe six months and tiers; update them or list the website variance in §3.6.
- Also removed the Vitest example files `sv add` generated (`src/lib/vitest-examples`).
- Reason: owner's clarification after v1.7 / v1.8 went back and forth.

## v1.8 (2026-10-18)

- Reverts v1.7's "upcoming days first" rule: the home block shows the first three rows the backend's month gives by the BR-CAL-15 tiers, and "+N" is the month's total minus three, passed days included (the backend returns all 6 events of October; 3 shown → "+3"). `pickHomeRows` / `buildHomeBlock` lose the `today` parameter, the home `load` no longer passes a date, the `calendar-home.spec.ts` file added for v1.7 is removed (29 tests pass). Owner's correction, 2026-10-18.
- `requirements.md` AC 21 keeps the "+N counts the whole month" wording and drops the second `⚠️ Not confirmed (product)` of v1.7; the first one (current month only vs six months) stays. `design.md` Step D-2 and `tasks.md` wording follow.
- Reason: v1.7 misread the owner's request; the behaviour already matched it, so nothing needed to change.

## v1.7 (2026-10-18)

- Home block rows: upcoming days come before days already passed (past days fill only what is left of the three rows), and "+N" is the whole month's Buddhist occurrences minus the rows shown, so passed days count (example: 6 in the month, 2 passed, 3 shown → "+3"). Owner's decision, 2026-10-18. Code: `pickHomeRows(items, today?)` and `buildHomeBlock(..., today?)` (the home `load` passes the Vietnam date); without `today` the product vectors still pass unchanged. 3 new unit tests (`calendar-home.spec.ts`), 32 tests pass.
- `requirements.md` AC 21 extended with a second `⚠️ Not confirmed (product)` (BR-CAL-15 orders by tier only; "today" = Vietnam date on the server). Hand-off to `ba-writer` in innerlamp-be: add the upcoming-first rule and the "+N counts the whole month" wording to BR-CAL-15, and a vector case with `today`.
- Reason: product owner's clarification of the home block.

## v1.6 (2026-10-18)

- Home block shows the **current month only** (one card, ≤ 3 rows by the BR-CAL-15 tiers, "+N other events", no countdown), not six cards: product owner's correction on 2026-10-18 after seeing the six-card build; the prototype's home list is a single card. Code: `HOME_BLOCK_MONTHS = 1`, the home `load` reads one year and returns `{month, stale}`, `EventsRoutines` renders one card.
- `requirements.md` AC 21 rewritten with a `⚠️ Not confirmed (product)`: product spec v1.2 (BR-CAL-15, FR-CAL-006, §3.1.1) still says six months. `design.md` Step D-1 / Layers row and `tasks.md` wording updated; the vector test is unchanged (it is per month).
- Hand-off: `ba-writer` in innerlamp-be — change BR-CAL-15 / FR-CAL-006 / §3.1.1 (and `rules/home-block.json` description) to the current month only, or record it in §3.6 as a website variance.
- Reason: the first build followed the product text and not the owner's intent.

## v1.5 (2026-10-17)

- `requirements.md`: the `Contract:` line and its `⚠️` now say commit 3af0844 is pushed as innerlamp-be PR #55 (not merged); the hash will change on a squash merge and the backend will report the new one. Contract stays openapi 2.2.0, unchanged. `design.md` / `tasks.md`: version only.
- Backend notes recorded: the 6 new vía events are not yet checked against GHPGVN (content, not a website concern); the 60 requests/minute per-IP limit is a dev value, and the website's requests with the correct key are not counted.
- Reason: backend message of 2026-10-17 (branch pushed, PR opened).

## v1.4 (2026-10-17)

- Tests: Vitest installed with `npx sv add vitest="usages:unit"` (new dev dependency; `npm test`, `npm run test:unit`; README and AGENTS.md updated). `scripts/sync-calendar-vectors.mjs` pins `countdown.json`, `ordering.json`, `home-block.json` from an innerlamp-be checkout into `tests/vectors/calendar/` with a `SOURCE.json` (source commit 3af0844; `tests/vectors/` is in `.prettierignore`). Specs: `calendar-vectors.spec.ts` runs every case of the three vectors, `event-content.spec.ts`, `calendar.spec.ts` (cache fresh / expired / copy on failure / no copy / 429 back-off / no `Authorization`). 29 tests pass.
- `tasks.md`: Phase 4 ticks for Vitest, pinned vectors, the three vector runs and the unit tests above; left open: `listCalendarEntries` / `toListItems` and `api/calendar/year` unit tests, E2E, NFR-CAL-03 measurement. `design.md`: Tests row updated. `requirements.md`: header only.
- Reason: the user asked for the unit tests promised by Phase 4.

## v1.3 (2026-10-17)

- Implementation of v1.2 in code, so `tasks.md` ticks Phases 1–3 (read in the code and `npm run build` passes; `npm run check` shows no error in these files — its 17 errors are all `resolve(...)` typing errors in other files). `requirements.md` changes only its header/status; no criterion changed.
- Built: `getCalendarYear(fetch, year) → {calendar, stale}` without a token, expired entries kept as the copy, 429 back-off from `details.retry_after_seconds` (default 60 s); `/events`, `/events/[code]` and the home block read the public route for everyone; `src/routes/api/calendar/year/+server.ts`; `countdown`, `paragraphs` / `practices`, `compareOccurrences`, `buildHomeBlock` / `pickHomeRows`; UI for the "Lễ lớn" chip and mark, every group label, leap mark, retry, offline / stale notes, placeholder image, six-card home block; i18n add / change / remove per the design table.
- Checked: the product vectors `countdown.json` (5 cases), `ordering.json` (4) and `home-block.json` (5) pass against the new functions in an ad-hoc node run (not a committed test).
- `design.md`: Step B-1 fetches `/api/calendar/year` without a locale prefix (as `/api/calendar/month` does); Step D-1 marks failed months per card instead of one `unavailable` state, matching BR-CAL-15.
- Behaviour change outside this feature: `/lunar` and `/api/calendar/month` call the new signature without a token; a 401 there (now a wrong API key) no longer turns into the guest state, it shows "unavailable". The lunar page still hides events from guests.
- Not done / not verified: no backend was reachable (`http://localhost:8080` refused), so nothing ran end to end; Phase 4 (tests, pinned vectors, E2E, NFR-CAL-03) and the `check` / `lint` gate remain open (`check` and `lint` fail on files outside this feature).
- Reason: backend asked the website to integrate contract 2.2.0.

## v1.2 (2026-10-17)

- Adopts product spec v1.2 (was v1.1) and contract `openapi.yaml` 2.2.0 (was 1.0.0 @ a8a016b), read from innerlamp-be commit 3af0844 on branch `feat/calendar-v3-public-major-via` (not pushed when read); backend spec calendar v3.2. Triggered by the backend session's message of 2026-10-17.
- `requirements.md`: header updated; the "waiting for backend v3.0" markers are removed because the contract now has the public route (`security: []`), `is_major`, `sort_order`, `recurrence`, `Cache-Control: public` with `year`, 401 `INVALID_API_KEY`, 429 `RATE_LIMITED` with `details.retry_after_seconds`; new AC 28 (429 handling and back-off) and AC 29 (no hard-coded major / vía / Rằm-Mùng Một lists; unknown `recurrence` → "other"); AC 6 and AC 22 now say the home block shows no countdown (product §3.1.1, v1.2); AC 12 / 13 / 21 updated to the settled v1.2 wording (empty `long_description` hidden, placeholder image per §3.6, "current month" in Vietnam time); AC 21 states tier 3 reads `recurrence`, never `code`; Error → UI mapping and Data & API updated for 429; Dependencies updated (60 events; `make migrate` + `make seed-calendar-events` for a real server).
- `design.md`: "Cache & copy" gains 429 back-off (`retryAt` from `retry_after_seconds`, default 60 s) and the note that a request with the correct `x-api-key` is not counted by the per-IP limit, and why the 1-hour server TTL is kept under the backend's 24-hour public max-age; Step D-3 drops the home-block countdown; stubbed list trimmed (nothing waits for the backend any more).
- `tasks.md`: removed every "wait for backend v3.0" tag; new tasks for 429 back-off and the `recurrence`-based tier 3; no `[x]` added (no new code verified — this is a docs-only change); a grep of `src` on 2026-10-17 found no hard-coded major, vía or Rằm-Mùng Một list.
- Language: the three files and this changelog are rewritten in English (Language policy, AGENTS.md); meaning unchanged except as listed above.
- Resolved: the per-IP limit counting the whole website as one visitor — no, requests carrying the correct `X-API-Key` are not counted; the website's own vía list — none, the calendar is the only source.
- Open: the `Contract:` line cites an unpushed backend commit — replace with the pushed sha. `⚠️ Not confirmed (product)` left: the shared default image file (product Appendix A).
- Hand-offs: backend — the vector files under `docs/product/calendar/rules/` still say `product_spec_version: 1.1` (product is 1.2); push the contract branch so the `Contract:` line can cite a stable sha. `ba-writer` — the Website column of §4.2 should read `drift`/`planned` until the website ships these tasks (unchanged since v1.1 of this spec).
- Reason: backend published contract 2.2.0 (public route, major events, ordering, recurrence, rate limit, public cache, catalogue of 60 events) and asked the website to integrate.

## v1.1 (2026-10-15)

- Old-docs clean-up: removed the "Events page (`/events`)" entry from `.assumptions.md` (it described the local `content/events.ts`, which no longer exists; this spec replaces it). `tasks.md` ticks the matching item. `requirements.md` / `design.md` unchanged.

## v1.0 (initial) (2026-10-15)

- `requirements.md`: first spec, written retroactively from the running code (read 2026-10-15: `src/routes/(site)/events/`, `src/routes/(site)/+page.server.ts`, `src/lib/server/api/calendar.ts`, `src/lib/types/calendar.ts`, `src/lib/utils/events.ts`, the `Events*` and `EventDetail` sections) and checked against product spec `docs/product/calendar/product.md` @ v1.1; what the code lacks is written prospectively. Header `Product spec` / `Contract` / `Implements`; 27 EARS criteria tagged `BR-CAL-*` / `FR-CAL-*` / `NFR-CAL-*` or `(platform)`; Error → UI table with a "current code" column; Dependencies (backend v3.0, lunar feature).
- `design.md`: new — Layers & components table (exists / needs change / not created), navigation, "Cache & copy" (FR-CAL-007 §3.6), four Step-by-step Flows (open the calendar; load more years through `/api/calendar/year`; detail + adjacent years; two-year home block), i18n add/change/remove table.
- `tasks.md`: new — 6 Phases; `[x]` only for what was checked in the code and matches the product; every task using a new public route / field marked _(waiting for backend v3.0)_; tasks to run `countdown.json`, `ordering.json`, `home-block.json` from the pinned `tests/vectors/calendar/`.
- Product spec / contract: adopt product v1.1 (Website column of §4.2; §3.6 rows FR-CAL-007, FR-CAL-009). Contract `openapi.yaml` @ a8a016b (current shape, still `bearerAuth`); changes planned by backend spec calendar v3.0 @ 0eb7d1f (E4, E13, E17, E22, E23), not yet in `openapi.yaml` (backend Phase 18).
- Drift from the product (so `ba-writer` sees the Website column as `drift`): only signed-in visitors see the calendar, the home block and the detail (FR-CAL-001); no "Lễ lớn" chip or major mark (FR-CAL-003, BR-CAL-10); only the current and next year load, no retry (FR-CAL-004); the cache deletes expired entries so a backend failure loses the calendar, no "may be out of date" note (FR-CAL-007 — the product says `done`); `/events` and the home block have no retry (FR-CAL-008); no "tomorrow", the detail counts on server time and shows "N days ago" (BR-CAL-13); a row shows only the first group (BR-CAL-09); the lunar date has no leap mark (BR-CAL-08, BR-CAL-05); practices keep their bullets, an empty description falls back to the short one, no default image, practices title differs from the product (BR-CAL-14, FR-CAL-005); the home block shows only the current month, every group, at most 5 rows, no tiers (BR-CAL-15, FR-CAL-006).
- Platform defaults chosen (recorded as `⚠️ Not confirmed` with the default; merging the PR approves them): no Bearer on the calendar route even when signed in (AC 1); SSR renders no countdown label (AC 6); load more by a button at the end + endpoint `/api/calendar/year`, `load` loads only the current year (AC 9); dedicated offline notice only for loads started in the browser (AC 18); the copy = the latest good load in the SvelteKit server memory (AC 19); the home block's current month in `Asia/Ho_Chi_Minh`, Buddhist group = code `buddhist` (AC 21); vectors read from the pinned `tests/vectors/calendar/` (tasks Phase 4).
- Open: `⚠️ Not confirmed (product)` — fallback to the short description when the long one is empty (AC 12, default: no fallback); the "shared default image" file (AC 13, default: `LampMark` on a gradient).
- Hand-offs: `ba-writer` — the two product questions above; the Website column of §4.2 should be `drift` for FR-CAL-001, 003, 004, 005, 006, 007, 008, BR-CAL-08, 09, 10, 13, 14, 15; §3.6 does not yet record the website extras (the "upcoming event" card on `/events`, the "Thắp đèn" / "Xem ngày âm" links on the detail, dimmed past rows); BR-CAL-15 does not say whether "current month" is device time or Vietnam time; BR-CAL-05 "(nhuận)" belongs on the name or the lunar date. Backend — update `openapi.yaml` to v3.0 (Phase 18); the per-IP limit (E23) counts every website request as one IP (the SvelteKit server).
- Old docs (`.assumptions.md`, "Events page (`/events`)") left as they were, cleaned up in a later step.
- Reason: moving the website to the three-layer documentation model (product spec → contract → platform spec), step 4 of the documentation pipeline for the calendar feature.
