# Requirements — temple (Chùa Việt Nam)

Version: 1.2
Last updated: 2026-10-15
Status: in-progress (drift) — the home featured block, the paged directory `/temples` and the temple page `/temples/[id]` run against the backend; still to do: name search + region filter, 12 temples per page, removing the "Theo dõi" (follow) button (currently stored in `localStorage`), open/closed status in Vietnam time, the "Đang cập nhật" / "Không có" rows (including the later fields and the photo set), contacts, removing the home sample temples and the cut to 7, tests that run the vectors. Search/filter and the new detail fields wait for the backend to update `openapi.yaml`.
Feature folder: `src/routes/(site)/temples/`, `src/routes/api/temples/`, `src/lib/components/sections/Temple{Grid,Catalog,Detail,Events}.svelte`, `src/lib/server/api/temples.ts`, `src/lib/types/temple.ts`, `src/lib/utils/temple-labels.ts`, `src/lib/features/temple/` (new)
Product spec: innerlamp-be `docs/product/temple/product.md` @ v1.2
Contract: innerlamp-be `docs/specs/api/openapi.yaml` @ a8a016b (`info.version` 1.0.0, tag Temples — has `top`, the list by `page`, `options`, the detail; **does not yet have** `q`/`region` on `GET /v1/temples`, pages of 12, `holiday_operating_hours`, `sangha_body`, `contacts`, `content_updated_month`). The missing parts are taken provisionally from innerlamp-be `docs/specs/features/temple/requirements.md` @ v2.0 §API contract (f3bb584, AC 39–46), pending openapi.
Implements: BR-TPL-01, BR-TPL-02, BR-TPL-03, BR-TPL-04, BR-TPL-05, BR-TPL-06, BR-TPL-08, BR-TPL-09, FR-TPL-001, FR-TPL-002, FR-TPL-003, FR-TPL-004, FR-TPL-005 (through `onboarding`), FR-TPL-006, FR-TPL-007, FR-TPL-008, FR-TPL-009, NFR-TPL-01, NFR-TPL-02

> See `changelog.md` in this folder for the version history of this spec.

This spec was written retroactively from the running code (read on 2026-10-15) for what exists, and prospectively for what product v1.1/v1.2 adds. Routes: `/` (temple block), `/temples`, `/temples/[id]` (`/en/...`).

Product behaviour (temple order, featured count, page size, the three regions, search matching, missing values, open/closed status, hidden actions) lives in the product spec and is **not** restated here; this file only says how the website implements those `BR-TPL-*`/`FR-TPL-*`. Not applicable to the website: BR-TPL-07 (distance — the website never asks for the location, §3.6) and FR-TPL-010 (content loading — backend).

## Constraints from the product spec

- **The directory is paged by page number** (§3.6 row FR-TPL-002): every page is a shareable URL; no infinite scroll.
- **Search and filter run on the backend** (BR-TPL-05, FR-TPL-003, FR-TPL-004, NFR-TPL-02): the website only passes the term and the region to `GET /v1/temples`; it never filters or searches the page it already has.
- **No distance on the website** (BR-TPL-07, §3.6): no browser location prompt, no "Cách bạn …" (distance from you) line.
- **The website computes open/closed itself** (BR-TPL-09, product §4.1: open status runs on every client) in Vietnam time with the lunar calendar `src/lib/utils/lunar.ts`.
- **"Chỉ đường" (directions) is the only action** on the temple page (BR-TPL-08); it opens Google Maps (§3.6 row FR-TPL-008).
- **Online only** (§3.6 row §2.4): neither the directory nor the temple page is cached in the browser.
- **The short temple list for picking a temple** (FR-TPL-005) is used only through `onboarding` (BR-ONB-10); the picker UI belongs to `../onboarding/`.

## Dependencies

- **Feature `sangha` (website)**: the "Sự kiện & khóa học" (events & courses) content (FR-TPL-009) comes from the temple's event schedule `GET` through `src/lib/server/api/temple-events.ts`, only with a session; the "Đặt làm đạo tràng của tôi" (make it my temple) card (`TempleSanghaCard`, action `setSangha`) sits on the temple page but belongs to `sangha` — this spec neither specifies nor changes it.
- **Feature `onboarding`**: the temple picker on `/signup` uses `/api/temples` (AC 29).

## User Story

As a visitor (signed in or not), I want to see a few notable temples on the home page, browse the whole temple directory page by page, search by name and filter by region, then open a temple's page to read its introduction, see whether it is open now, contact it and get directions — so that I know where to go.

## Acceptance Criteria (EARS notation)

### Featured temples on the home page

1. WHEN a visitor opens `/`, THE SYSTEM SHALL read the featured temples with `GET /v1/temples/top` in the server `load` and show **every temple the backend returns**, in the order received (no cut, no re-sort), each as a card linking to `/temples/[id]`, plus "Xem tất cả" (see all) to `/temples`. (FR-TPL-001, BR-TPL-01, BR-TPL-02)
   > ⚠️ Not confirmed (product): whether the home block card must carry every field of the "Temple card" §3.1.1 (image, name, type, province, heritage rank, sect) or keep the prototype's compact tile (image, name, province) — blocks the Phase 1 task "home card"; suggested default: compact tile; hand back to ba-writer in innerlamp-be.
2. WHEN `GET /v1/temples/top` returns `items: []`, THE SYSTEM SHALL show the block's empty state (`temples_featured_empty`) and still offer "Xem tất cả", with no error and **no** sample temple. (FR-TPL-001)
3. WHEN `GET /v1/temples/top` fails (network / 5xx), THE SYSTEM SHALL still render the home page and SHALL show the same empty state as AC 2 (`temples_featured_empty` plus "Xem tất cả"), with no error text, no retry action and no sample temple (`content/temples.ts`); the other home blocks are unaffected. (FR-TPL-001)

### Directory `/temples`

4. WHEN a visitor opens `/temples` (optionally with `?q=`, `?region=`, `?page=`), THE SYSTEM SHALL read the page with `GET /v1/temples` in the server `load` with `page` and — when present — `q`, `region`, then show the temples in the order received, the number of temples found (`total`, key `temples_page_sub`) and the page bar (`Pagination`), keeping `q`/`region` on every page link. (FR-TPL-002, BR-TPL-01, BR-TPL-03)
5. WHEN a temple is shown in the directory, THE SYSTEM SHALL use the temple card of §3.1.1: image (`thumbnail_url`, otherwise a placeholder — BR-TPL-06), name (link to `/temples/[id]`), type (`temple_type_*`), province, heritage rank, sect; an unknown enum value drops that label. (FR-TPL-002, BR-TPL-06)
6. WHEN `?page=` is not a positive integer, is `1`, or is past the last page (the backend returns `items: []` with `total_pages > 0`), THE SYSTEM SHALL redirect 307 to the canonical URL (drop `page` for page 1; the last page when past it), keeping `q` and `region`. (platform, BR-TPL-03)
7. WHEN the backend returns 1 or 0 pages, THE SYSTEM SHALL not show the page bar; WHEN on the last page, THE SYSTEM SHALL not allow going to the next page. (FR-TPL-002, BR-TPL-03)
8. WHEN `GET /v1/temples` fails (network / 5xx / unexpected 400), THE SYSTEM SHALL render the page with `temples_load_error` and a `temples_retry` button/link that reloads the current URL (keeping `q`, `region`, `page`); WHEN the browser is offline, THE SYSTEM SHALL let the root layout's `OfflineGate` show the site's offline copy (different from the load-error copy). (FR-TPL-002)
9. WHEN the directory is empty and there is no `q`/`region`, THE SYSTEM SHALL show `temples_empty`. (FR-TPL-002)

### Search by name

10. WHEN a visitor submits the search field (`SearchField`, label `temples_search_label`, placeholder `temples_search_placeholder`) — with Enter, or, when JS runs, after a typing pause — THE SYSTEM SHALL go to `/temples?q=<term>` (keeping `region`, dropping `page`) so the server reads again from page 1; the field is a `<form method="GET">`, so it works without JS. (FR-TPL-003, BR-TPL-05, NFR-TPL-01)
11. WHEN JS runs and the visitor is typing, THE SYSTEM SHALL submit only after a typing pause (debounce, `design.md`), replace the URL with `replaceState` (not one history entry per character) and keep focus and caret in the field. (NFR-TPL-01, platform)
12. WHEN building the `q` sent to the backend, THE SYSTEM SHALL trim both ends, cut to 100 characters (BR-TPL-05) and drop the parameter entirely when empty (empty = no search; the backend rejects an empty `q`). (BR-TPL-05)
13. WHEN there is a `q` or `region` and the backend returns `total: 0`, THE SYSTEM SHALL show `temples_no_match_title` ("Không tìm thấy chùa" — no temple found) with `temples_no_match_hint` (change the term or the region). (FR-TPL-003)
14. WHEN the visitor clears the search field and submits, THE SYSTEM SHALL return to `/temples` (keeping `region`, page 1) and show the directory again. (FR-TPL-003)

### Region filter

15. WHEN the directory is shown, THE SYSTEM SHALL show four single-choice region options `region_all` · `region_north` · `region_central` · `region_south` (links or `FilterChips`), the applied option marked (`aria-current`/`aria-pressed`); there is no "Tây Nguyên" (Central Highlands). (FR-TPL-004, BR-TPL-04)
16. WHEN the visitor picks a region, THE SYSTEM SHALL go to `/temples?region=north|central|south` (keeping `q`, dropping `page`) so the server reads from page 1; WHEN `region_all` is picked, THE SYSTEM SHALL drop the `region` parameter and keep `q`. (FR-TPL-004, BR-TPL-04, BR-TPL-05)
17. WHEN `?region=` holds a value other than `north`/`central`/`south`, THE SYSTEM SHALL drop that parameter with a 307 redirect to the canonical URL before calling the backend (a wrong value is never sent to the backend). (platform, BR-TPL-04)

### Temple page `/temples/[id]`

18. WHEN a visitor opens `/temples/[id]` (from the home page, the directory, `sangha` or the calendar — the calendar entry belongs to the calendar feature, not yet on the website), THE SYSTEM SHALL read the temple with `GET /v1/temples/{id}` in the server `load`, without sign-in, and render the page with the temple name as `<title>` and meta description `temple_d_meta_description`; then:
    - on failure (404 `TEMPLE_NOT_FOUND`): return HTTP 404 and show `temple_d_not_found_title`, `temple_d_not_found_body` with the link `temple_d_not_found_back` to `/temples`;
    - on failure (network / 5xx): show the data error page with an `err_retry` (reload) button. (FR-TPL-006, BR-TPL-06)
19. WHEN the temple page is shown, THE SYSTEM SHALL show the sections of FR-TPL-007 in the prototype order (`design.md` table "Section order"): image header (heritage rank, sect, name, the `temple_d_aka` line when there are `aliases`, place = ward + province); opening hours and status (AC 22–23); four facts: founding year, heritage rank, sect, region; introduction (AC 20); photo set (AC 21); abbot, founder, Buddhist sangha body; architecture & heritage; amenities; visiting notes numbered `01, 02, …`; events (AC 26); location & contacts (full address `location.full_address`, region, coordinates, hotline, fanpage, website, email); footer `temple_d_updated` when there is a `content_updated_month`. (FR-TPL-007)
20. WHEN the introduction is longer than the collapsed height, THE SYSTEM SHALL collapse it with a `temple_d_read_more` button that becomes `temple_d_read_less` when expanded; without JS it is shown in full. (FR-TPL-007)
21. WHEN a value of the temple page is missing, THE SYSTEM SHALL still show that row/section per BR-TPL-06: text → `temple_d_pending` ("Đang cập nhật" — being updated), an amenity the temple lacks → `temple_d_none` ("Không có" — not available), no image → placeholder background, no `aliases` → the `temple_d_aka` line is hidden; sections are never hidden as the current code does. Contacts without a value are plain text, not links. The fields that come later — architecture style, materials and highlights, the "Kinh sách" (sutra books) amenity and the photo set — SHALL stay visible and show `temple_d_pending` while the data does not exist: the "Kinh sách" row never shows `temple_d_none`, and the photo section (`temple_d_photos_title`) shows `temple_d_pending` instead of photos; none of them is hidden. (BR-TPL-06, FR-TPL-007)
22. WHEN the temple has opening hours in the form `HH:MM - HH:MM`, THE SYSTEM SHALL compute the status per BR-TPL-09 **in the browser** after mount (Vietnam time, whatever the device time zone; the lunar day of the Vietnam date via `solarToLunar`) and show `temple_d_status_open({time})` or `temple_d_status_closed({time})`, updated every minute; SSR does not render the status line. (BR-TPL-09)
23. WHEN opening hours are shown, THE SYSTEM SHALL show the two rows `temple_d_hours_normal` and `temple_d_hours_holiday`, the row in force today per BR-TPL-09 labelled `temple_d_today`; WHEN the temple has normal hours but no Rằm & Mùng Một (full-moon & first-day) hours (`holiday_operating_hours` empty), THE SYSTEM SHALL show the normal hours on the `temple_d_hours_holiday` row (not `temple_d_pending`); WHEN the temple has no hours, THE SYSTEM SHALL hide the status and show `temple_d_pending`; WHEN `operating_hours` is not empty but not in the form `HH:MM - HH:MM` (data from before the backend validates the format), THE SYSTEM SHALL show the raw string and hide the status. (BR-TPL-09, BR-TPL-06)
24. WHEN the visitor presses `temple_d_directions` (action row) or the map button of the location section, THE SYSTEM SHALL open Google Maps directions to the temple's `lat,lng` in a new tab (`rel="noopener noreferrer"`); the action row holds only this button. (FR-TPL-008, BR-TPL-08, §3.6)
25. WHEN the visitor presses a contact that has a value, THE SYSTEM SHALL open `tel:` (hotline), an `https://` link (fanpage, website, new tab) or `mailto:` (email); WHEN a contact has no value, THE SYSTEM SHALL show `temple_d_pending`, not clickable. (FR-TPL-008, BR-TPL-06)
26. WHEN the temple page is shown, THE SYSTEM SHALL show the `temple_ev_title` section ("Sự kiện & khóa học" — events & courses); WHEN there is no event (guest, or `sangha` returns nothing), THE SYSTEM SHALL show `temple_ev_none_posted` ("Chùa chưa đăng sự kiện nào." — the temple has not posted any event) with no invitation to follow. (FR-TPL-009, BR-TPL-08)
27. WHEN the temple page is shown, THE SYSTEM SHALL NOT show a "Theo dõi"/"Đang theo dõi" (follow/following) button, "Cúng dường" (offering) or the "Báo thông tin sai" (report wrong information) link, and SHALL NOT read/write `localStorage` `il-temple-follow`. (BR-TPL-08)
28. WHEN on any page of this feature, THE SYSTEM SHALL NOT ask for the browser location and SHALL NOT show a distance. (platform, BR-TPL-07 §3.6)

### Picking a temple (through onboarding)

29. WHEN the `onboarding` temple picker searches or loads another page, THE SYSTEM SHALL call the website's `GET /api/temples?q=&page=`, which calls `GET /v1/temples/options` from the server (the API key never reaches the browser), cuts `q` to 100 characters and drops an empty `q`; the list holds only name + province and searches by name (BR-TPL-05, §3.6 row FR-TPL-005). (FR-TPL-005, BR-TPL-05)

### General

30. WHEN calling the backend, THE SYSTEM SHALL call only from the SvelteKit server through `$lib/server/api/temples.ts` with `x-api-key`; all four routes are public, so no Bearer is sent. (platform)
31. WHEN `/temples` has a `q`, THE SYSTEM SHALL add `<meta name="robots" content="noindex">`; the directory without `q` (including `?region=`, `?page=`) and the temple page are indexed. (platform)
32. WHEN showing any string (errors included), THE SYSTEM SHALL use only Paraglide keys present in both `messages/vi.json` and `messages/en.json`, never the backend `error.message`; the Vietnamese text of the product's quoted copy ("Không tìm thấy chùa", "Đang cập nhật", "Không có", "Còn gọi: …", "Đọc thêm / Thu gọn", "Đang mở cửa · đóng lúc HH:MM", "Đã đóng cửa · mở lại HH:MM", "Hôm nay", "Chùa chưa đăng sự kiện nào.", "Chỉ đường") is taken exactly as in the product spec. (platform, FR-TPL-003, FR-TPL-007, BR-TPL-06, BR-TPL-09)
33. WHEN unit tests run, THE SYSTEM SHALL pass every case of `rules/temple-open-status.json` (product §4.3; `temple-order.json`, `temple-search-match.json` run on the backend, `temple-distance.json` only in the apps). (BR-TPL-09)
34. WHEN a search or region change is submitted, THE SYSTEM SHALL show page 1 within 2 seconds on a 4G network (one backend request per submit, the directory is never loaded whole). (NFR-TPL-01, NFR-TPL-02)

## Data & API (called from the SvelteKit server)

Common header: `x-api-key` from `API_KEY`; no Bearer (tag Temples is public). Response shapes: schemas `TempleSummary`, `TempleDetail`, `TempleOption` and the envelopes in innerlamp-be `docs/specs/api/openapi.yaml` — not copied here.

| Action | Operation (openapi) | Called from | Notes |
| --- | --- | --- | --- |
| Featured temples | `GET /v1/temples/top` | `src/routes/(site)/+page.server.ts` `load` | In openapi; the count is decided by the backend (BR-TPL-02) |
| Directory by page | `GET /v1/temples?page=` | `src/routes/(site)/temples/+page.server.ts` `load` | In openapi (states pages of 20 — product/backend v2.0 change it to 12; the website reads `page_size` from the response, never hard-codes it) |
| Search + region filter | `GET /v1/temples?q=&region=&page=` | as above | ⚠️ not yet in openapi @ a8a016b — per backend v2.0 AC 39–44; hand-off to backend |
| Temple page | `GET /v1/temples/{id}` | `src/routes/(site)/temples/[id]/+page.server.ts` `load` | In openapi; 4 new field groups (`holiday_operating_hours`, `sangha_body`, `contacts`, `content_updated_month`) ⚠️ not yet — per backend v2.0 AC 45–46 |
| Temple picker list | `GET /v1/temples/options?q=&page=` | `src/routes/api/temples/+server.ts` `GET` (for `onboarding`) | In openapi |
| Temple events | belongs to `sangha` (`src/lib/server/api/temple-events.ts`) | `temples/[id]/+page.server.ts` `load` (with a session) | Not part of this spec |

> ⚠️ Not confirmed (contract): `openapi.yaml` @ a8a016b does not yet have `q`, `region` (and the `INVALID_FILTER` error with `details.field` = `q` | `region`) on `GET /v1/temples`, does not state pages of 12, and `TempleDetail` does not yet have `holiday_operating_hours`, `sangha_body`, `contacts {hotline, fanpage, website, email}`, `content_updated_month` — blocks the Phase 3 tasks "search/filter" and "new fields" (code may be written against backend v2.0 AC 39–46 but counts as done only once openapi has them); hand-off to backend (backend `tasks.md` Phase 13).

## Error → UI mapping

| Operation | Failure case | Visitor sees | Current code |
| --- | --- | --- | --- |
| `GET /v1/temples/top` | network / 5xx | Home page still renders; the temple block shows `temples_featured_empty` + "Xem tất cả" (AC 3); no error text, no retry, no sample temple | drift — shows 3 **sample** temples from `content/temples.ts` |
| `GET /v1/temples/top` | `items: []` | `temples_featured_empty` + "Xem tất cả" | drift — shows sample temples |
| `GET /v1/temples` | network / 5xx | `temples_load_error` + `temples_retry` | drift — has `temples_load_error`, no retry button yet |
| `GET /v1/temples` | 400 `INVALID_PAGE` / `INVALID_FILTER` (does not happen: the website canonicalises the parameters) | same as network / 5xx (error code logged) | not yet (no `q`/`region` sent yet) |
| `GET /v1/temples` | `total: 0` with `q`/`region` | `temples_no_match_title` + `temples_no_match_hint` | not yet |
| `GET /v1/temples` | `total: 0` without a filter | `temples_empty` | ✓ |
| `GET /v1/temples` | page past the last | 307 to the last page | ✓ (does not keep `q`/`region` yet) |
| `GET /v1/temples/{id}` | 404 `TEMPLE_NOT_FOUND` | HTTP 404, `temple_d_not_found_*` + link to `/temples` | drift — generic 404 page `err_404_*` (home / go back) |
| `GET /v1/temples/{id}` | network / 5xx | Data error page `err_data_*` + `err_retry` | ✓ (root `+error.svelte`, `error(502)`) |
| `GET /v1/temples/options` (through `/api/temples`) | any error | JSON `{error: code}` with the same status; the `onboarding` picker shows the error per that spec | ✓ |
| any page | browser offline | `OfflineGate` (`offline_*`) | ✓ |

## Out of scope

- Distance and the visitor's location (BR-TPL-07 — apps only, §3.6).
- Following a temple (separate feature, later), reporting wrong information (dropped), offering (`offering`) — product §1.2; the website only **removes** them from the temple page (AC 27).
- Proposing a new temple (`temple-suggestion`; the form is in `onboarding`), the user's own temple and the "Đặt làm đạo tràng" card (`sangha`).
- A temple map, "near me" search, sorting by distance, ratings (product §1.2); searching by address/province (BR-TPL-05).
- Loading/editing temple content (FR-TPL-010 — backend).
- An offline copy of the directory / temple page (§3.6 — apps only).
- Crediting sources and image rights (product Appendix A item 1 — blocks content release, not the website).

## Pending (not yet implemented)

Tracked in `tasks.md`:

- Search field + four region options, URL `?q=&region=`, no match → `temples_no_match_*` (FR-TPL-003, FR-TPL-004) — Phases 1, 3; waits for the ⚠️ contract.
- Pages of 12 (BR-TPL-03) — no website code needed (reads `page_size`/`total_pages` from the backend); re-check when the backend changes.
- Home page: remove `HOME_TEMPLE_COUNT = 7` (currently cuts the 10 featured temples to 7), remove the sample data, empty state when the list is empty **and** when loading fails (FR-TPL-001, BR-TPL-02) — Phases 1, 2, 3.
- Directory card gains the temple type (§3.1.1) — Phase 1.
- Directory error → retry button (FR-TPL-002) — Phase 1.
- Temple page: remove "Theo dõi" + `state/temple-follow.svelte.ts` (BR-TPL-08); "Còn gọi" (also known as), ward; open/closed status + two hour rows, the Rằm & Mùng Một row falling back to the normal hours (BR-TPL-09); four facts; collapsible introduction; photo section showing "Đang cập nhật"; organisation section (with sangha body); architecture rows and "Kinh sách" showing "Đang cập nhật"; all amenity rows; visiting notes numbered `01`; location & contacts; update-month footer; "Đang cập nhật"/"Không có" instead of hiding (BR-TPL-06, FR-TPL-007, FR-TPL-008) — Phases 1–3.
- Directions with a `dir` URL that has a destination instead of `search` (FR-TPL-008) — Phase 1.
- A dedicated "temple not found" page (FR-TPL-006) — Phase 1.
- Empty copy of the events section on the temple page (FR-TPL-009) — Phase 1.
- Vector test `temple-open-status.json` and E2E — Phase 4 (the repo has no test runner yet).

## Open questions (resolved)

- ~~What does the home temple block show when the featured temples cannot be loaded (FR-TPL-001 only had the empty-directory scenario)?~~ → The same empty state as an empty directory (`temples_featured_empty` + "Xem tất cả"): no error text, no retry, no sample temples; the rest of the home page is unaffected (FR-TPL-001 new scenario, product v1.2, anh Đức). Resolved 2026-10-15 (product v1.2). Downstream: AC 3 and the Error → UI row; design `TempleGrid` / `loadTopTemples` rows; tasks remove the sample-temple branch, `content/temples.ts` + `TEMPLES` and the cut to 7, plus E2E for the error case.
- ~~Do the later fields of BR-TPL-06 (architecture style, materials, the "Kinh sách" amenity, the photo set) show `temple_d_pending`/`temple_d_none` or stay hidden until the data exists?~~ → They stay visible and show "Đang cập nhật" (`temple_d_pending`) — never hidden, never "Không có"; this includes "Kinh sách" (no longer "when known") and the photo set (BR-TPL-06, FR-TPL-007, product v1.2, anh Đức). Resolved 2026-10-15 (product v1.2). Downstream: AC 19, AC 21; the previous website default of "no photo section" is dropped — design adds a photo section (section 6) and the key `temple_d_photos_title`; tasks for the architecture rows, "Kinh sách" and the photo section.
- ~~What does the `temple_d_hours_holiday` row show when the temple has no Rằm & Mùng Một hours — "Đang cập nhật" or the normal hours?~~ → The normal hours (they are the hours that apply on those days), not "Đang cập nhật" (BR-TPL-09, product v1.2, anh Đức; vector "Rằm without holiday hours uses normal hours", `today_row` = `normal`). Resolved 2026-10-15 (product v1.2). Downstream: AC 23; design "Open/closed status"; the `TempleHours` task.
- ~~Keep the "Theo dõi" button (stored per device)?~~ → No, hidden entirely until the follow feature exists (BR-TPL-08, product v1.1). Resolved 2026-10-15 (product v1.1). Downstream: AC 27; remove `state/temple-follow.svelte.ts`.
- ~~Does the website show distance?~~ → No, and it never asks for the location (BR-TPL-07, §3.6). Resolved 2026-10-15 (product v1.0). Downstream: AC 28.
- ~~Is "now" for open/closed device time or Vietnam time?~~ → Vietnam time, with Rằm & Mùng Một hours by the lunar calendar (BR-TPL-09). Resolved 2026-10-15 (product v1.1). Downstream: AC 22, 23, 33.
- ~~Do search/filter run on the page or on the backend?~~ → Backend (BR-TPL-05, FR-TPL-003, FR-TPL-004). Resolved 2026-10-15 (product v1.0). Downstream: AC 10–17.
- ~~Do search/filter go through `load` by URL or through an `/api/*` endpoint called from the browser?~~ → Through the URL + `load` (GET form, no JS needed; shareable pages, the same mechanism as page numbers in §3.6). Platform decision, 2026-10-15.
- ~~Is open/closed computed on the server or in the browser?~~ → In the browser after mount, updated every minute (avoids hydration mismatch and stale cached pages). Platform decision, 2026-10-15.
