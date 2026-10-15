# Tasks — temple (Chùa Việt Nam)

Version: 1.2
Last updated: 2026-10-15
Status: in-progress (drift) — home block, paged directory and temple page run against the backend; search/filter, open/closed status, the new temple-page sections (including the "Đang cập nhật" later fields and photo section), removing "Theo dõi", the sample temples and the home cut to 7 are not done; search/filter and the new fields wait for openapi; no tests yet

> See `changelog.md` in this folder for the version history of this spec.

`[x]` only when verified in the code on 2026-10-15 **and** matching what product spec v1.2 requires. Every item points to a row of the Layers & components table, the "Section order" table or a Step in `design.md`; `AC n` numbers are the criteria in `requirements.md`.

## Phase 1 — UI (`il-ui`)

Home page

- [x] "Chùa Việt Nam" block has the "Xem tất cả" link to `/temples` (`SectionHeading href`), cards link to `/temples/[id]`, missing image → placeholder (AC 1, BR-TPL-06)
- [ ] `TempleGrid`: remove the sample-temple branch (`TEMPLES` of `content/home.ts`); `items` empty **or** `temples = null` (load failed) → the same `temples_featured_empty` empty state + "Xem tất cả", no error text, no retry, no sample temple (AC 2, AC 3, FR-TPL-001)
- [ ] Home card per ⚠️ AC 1 *(waits for ⚠️ AC 1; default: keep the current compact tile)*

Directory

- [x] Route `/temples` + `<svelte:head>` title/description (`temples_title`, `temples_meta_description`), breadcrumb (`config/breadcrumbs.ts`)
- [x] Count `temples_page_sub({count: total})`, `temples_empty` when the directory is empty (AC 4, AC 9)
- [x] `Pagination` hidden at ≤ 1 page, "previous"/"next" disabled at both ends, takes `params` to keep other parameters (AC 7)
- [x] Directory card: image or placeholder, heritage rank, sect (unknown enum label dropped), name link, province (AC 5 — except the temple type)
- [ ] Directory card gains the temple type (`templeTypeLabel`, `temple_type_*`) (AC 5)
- [ ] `TempleFilters.svelte` in `src/lib/features/temple/components/`: GET form + `SearchField name="q" maxlength=100` + hidden submit button; four region links `region_all/north/central/south` with `aria-current` (AC 10, 14, 15, 16) *(enable only once the backend has `q`/`region` — ⚠️ contract)*
- [ ] Debounce 300 ms + `goto(…, {replaceState, keepFocus, noScroll})` while typing (AC 11, NFR-TPL-01)
- [ ] `TempleCatalog`: pass `params={q, region}` to `Pagination`; `total = 0` with a filter → `temples_no_match_title` + `temples_no_match_hint` (AC 4, AC 13)
- [ ] Load error: add a `temples_retry` link/button to the current URL (AC 8)
- [ ] `<meta name="robots" content="noindex">` when there is a `q` (AC 31)

Temple page (per the "Section order" table of `design.md`)

- [x] Route `/temples/[id]`: temple name as `<title>`, meta `temple_d_meta_description`, breadcrumb `temple_d_crumb` (AC 18)
- [x] Network / 5xx → data error page `err_data_*` with `err_retry` (root `+error.svelte`, `error(502)`) (AC 18)
- [ ] `src/routes/(site)/temples/[id]/+error.svelte`: 404 → `temple_d_not_found_*` + link to `/temples` (HTTP 404 kept); other statuses → as the root error page (AC 18, FR-TPL-006)
- [ ] Remove the "Theo dõi"/"Đang theo dõi" button from `TempleDetail` (AC 27, BR-TPL-08)
- [ ] Header: `temple_d_aka` line under the name (hidden without `aliases`), ward + province; drop the `temple_d_aliases` row in the right column (section 1, AC 19, AC 21)
- [ ] "Chỉ đường": URL `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`; the action row keeps only this button (section 2, AC 24)
- [ ] `TempleHours.svelte`: two hour rows, `temple_d_today` label, status only after mount + every 60 s; no holiday hours → the `temple_d_hours_holiday` row shows the normal hours (not `temple_d_pending`); no hours → `temple_d_pending`, status hidden; hours in the wrong format → raw string (section 3, AC 22, AC 23)
- [ ] Four facts: founding year · heritage rank · sect · region (`templeRegionLabel`) (section 4, AC 19)
- [ ] Collapsible introduction + `temple_d_read_more`/`temple_d_read_less`, shown in full without JS (section 5, AC 20)
- [ ] Photo section: title `temple_d_photos_title`, body `temple_d_pending` while there is no photo set; never hidden (section 6, AC 19, AC 21, BR-TPL-06)
- [ ] Organisation section: abbot, founder, sangha body (`sangha_body`), missing → `temple_d_pending` (section 7, AC 19, AC 21)
- [ ] Architecture & heritage: always shown; `architecture_heritage` paragraph (missing → `temple_d_pending`); architecture style row (`temple_d_arch_style`) and materials row (`temple_d_materials`) showing `temple_d_pending` until the data exists (section 8, AC 21)
- [ ] Amenities: every row; available → ✓, not available → `temple_d_none`; "Kinh sách" (`temple_amenity_books`) shows `temple_d_pending`, never `temple_d_none`, until the data exists (section 9, AC 21)
- [ ] Visiting notes numbered `01, 02, …`; missing → `temple_d_pending` (section 10, AC 19, AC 21)
- [ ] `TempleEventList` gains an `emptyLabel` prop; the temple page passes `temple_ev_none_posted`, `/sangha` keeps `temple_ev_empty` (section 11, AC 26)
- [ ] Location & contacts: `full_address`, region, coordinates, map button (same URL as directions); `TempleContacts.svelte` (`tel:` / `https://` new tab / `mailto:`, missing → plain `temple_d_pending`) (section 12, AC 19, AC 25)
- [ ] Footer `temple_d_updated({month})` from `content_updated_month` (`YYYY-MM` → `MM/YYYY`), hidden when `null`; no "Báo thông tin sai" (section 13, AC 19, AC 27)
- [x] Image header: `image_url` or a gradient placeholder (section 1, BR-TPL-06)
- [x] No "Cúng dường", no "Báo thông tin sai", no location prompt, no distance (AC 27 — the offering/report part, AC 28)

i18n

- [ ] Per the "i18n keys" table of `design.md`, in both `vi.json` and `en.json` (AC 32):
  - [ ] add `temples_retry`, `temples_search_*`, `temples_region_label`, `temples_no_match_*`, `temples_featured_empty`, `temple_type_*`, `temple_d_aka`, `temple_d_status_*`, `temple_d_hours_normal`, `temple_d_hours_holiday`, `temple_d_today`, `temple_d_pending`, `temple_d_none`, `temple_d_facts_region`, `temple_d_read_*`, `temple_d_photos_title`, `temple_d_org_title`, `temple_d_sangha_body`, `temple_d_arch_style`, `temple_d_materials`, `temple_amenity_books`, `temple_d_location_title`, `temple_d_coords`, `temple_d_map`, `temple_d_hotline`, `temple_d_fanpage`, `temple_d_website`, `temple_d_email`, `temple_d_updated`, `temple_d_not_found_*`, `temple_ev_none_posted`
  - [ ] remove `temple_d_follow`, `temple_d_following`, `temple_d_aliases`, `region_highlands`, `temple_<n>_*`

## Phase 2 — State & logic (`il-state`)

- [ ] `src/lib/features/temple/query.ts`: `parseTempleQuery`, `templeListHref` (page / q trimmed + 100 / valid region, canonical URL) — shared by `load` and `TempleFilters` (AC 6, 12, 16, 17; Steps 1–2)
- [ ] `src/lib/features/temple/open-status.ts`: `parseHours`, `templeOpenStatus(nowUtc, hours, holidayHours)` per BR-TPL-09 — Vietnam date from `nowUtc + 7 h`, lunar day through `solarToLunar(new Date(y, m − 1, d))`, tomorrow's "mở lại"; `holidayHours = null` → normal hours apply on Rằm / Mùng Một, `todayRow = 'normal'` (AC 22, 23; design "Open/closed status")
- [ ] `templeTypeLabel`, `templeRegionLabel` in `src/lib/utils/temple-labels.ts` (unknown enum → `undefined`) (AC 5, AC 19)
- [ ] Remove `src/lib/state/temple-follow.svelte.ts` (key `il-temple-follow`); no migration (AC 27, BR-TPL-08)
- [ ] Remove `src/lib/content/temples.ts` and `TEMPLES` of `src/lib/content/home.ts` (sample data, `region: 'highlands'`) once `TempleGrid` no longer uses them — sample temples are never shown, not on an empty list and not on a load error (AC 2, AC 3, FR-TPL-001, BR-TPL-04)
- [x] `solarToLunar` (`src/lib/utils/lunar.ts`, Vietnamese calendar UTC+7) — reused, unchanged

## Phase 3 — Server data (contract-gated)

- [x] Three operations already in innerlamp-be `docs/specs/api/openapi.yaml` @ a8a016b: `GET /v1/temples/top`, `GET /v1/temples?page=`, `GET /v1/temples/{id}` (+ `GET /v1/temples/options`) — cited only, no schema copied
- [ ] Confirm `q`, `region`, pages of 12 and the four new `TempleDetail` field groups are in `openapi.yaml` (backend v2.0 Phase 13), then update the `Contract:` line of `requirements.md` *(⚠️ contract — hand-off to backend)*
- [x] Every call runs on the server through `src/lib/server/api/temples.ts` + `client.ts` (`x-api-key` from `API_KEY`, no Bearer) (AC 30)
- [x] `/temples` `load`: bad `page` / `=1` → 307 canonical URL; past the end → 307 last page; backend error → `{ temples: null }` (AC 6, AC 8 — the `page`-only part)
- [x] `/temples/[id]` `load`: `getTemple`, 404 → `error(404)`, otherwise → `error(502)` (AC 18)
- [x] `src/routes/api/temples/+server.ts` proxies `GET /v1/temples/options` for `onboarding`: `q` trimmed + cut to 100, dropped when empty, `page` positive integer; errors → JSON `{error}` (AC 29, FR-TPL-005)
- [ ] `(site)/+page.server.ts`: remove `HOME_TEMPLE_COUNT` / `.slice(0, 7)`, return every temple of `top` (today 10, not 7); keep error → `null`, which the block renders as the empty state (AC 1, AC 3, BR-TPL-02)
- [ ] `listTemples(fetch, {page, q?, region?})`: add `q`/`region` only when present (Step 3) *(⚠️ contract)*
- [ ] `/temples` `load`: use `parseTempleQuery`, redirect keeping `q`/`region`, return `query` to the page (Steps 2, 3; AC 4, 6, 17)
- [ ] `src/lib/types/temple.ts`: `TempleListQuery.q/region`; `TempleDetail.holiday_operating_hours`, `sangha_body`, `contacts {hotline, fanpage, website, email}`, `content_updated_month: string | null`; fix the comments "20 per page", "No province/region filter" *(⚠️ contract)*

## Phase 4 — Tests (`il-testing`)

- [ ] Install Vitest with `npx sv add vitest` (the repo has no test runner; share it if `memorial` installs it first)
- [ ] Vector sync script (shared with `memorial` if it exists, e.g. `scripts/sync-vectors.*`) copies innerlamp-be `docs/product/temple/rules/temple-open-status.json` into a pinned copy (e.g. `tests/vectors/temple/`) with the source commit; tests read the pinned copy, **never edited by hand**; with an innerlamp-be checkout, report drift
- [ ] Run every case of `docs/product/temple/rules/temple-open-status.json` with `templeOpenStatus` + labels (locale `vi`): `status`, `label`, `today_row` — including "Rằm without holiday hours uses normal hours"; also check `solarToLunar` gives `vietnam_lunar_day_today` (BR-TPL-09, AC 33)
- [ ] Unit: `parseHours` (valid / empty / free text), `parseTempleQuery` + `templeListHref` (bad page, q with spaces / 101 characters / empty, region `North` / empty / `highlands`), `templeTypeLabel`/`templeRegionLabel` with unknown enums
- [ ] Unit: `listTemples` builds the right query; `/temples` `load` with a fake `fetch` — every row of the Error → UI table
- [ ] Component/unit: `TempleGrid` with `temples = []` and `temples = null` renders the same `temples_featured_empty` state, no error text, no retry, no sample temple (AC 2, AC 3)
- [ ] E2E (Playwright, real or fake backend): home shows every temple of `top`, the empty state for an empty `top` **and** for a failing `top` (no sample temples, rest of the home page renders); directory page 1 / last page / past the end; search "bich dong" and "dien huu"; filter "Miền Nam"; region + search combined; clear the search; no match; no JS (GET form); temple page with missing values → "Đang cập nhật" (including architecture rows, "Kinh sách" and the photo section); holiday row without holiday hours shows the normal hours; unknown id → `temple_d_not_found_*`; no "Theo dõi" button
- [ ] Measure NFR-TPL-01: submitting a search / region change → page 1 within 2 s with 4G throttling (AC 34)

## Phase 5 — Quality (`il-quality`)

- [ ] `npm run check && npm run lint && npm run build` pass

## Phase 6 — Documentation

- [ ] Report the Website column status of innerlamp-be `docs/product/temple/product.md` §4.2 to `ba-writer` (this skill does not edit the backend repo)
- [x] Remove the outdated "Catalogue pages" (the `/temples` part) and "Temple detail" entries in `.assumptions.md` — v1.1 ("Temple detail" deleted; "Catalogue pages" says `/temples` now follows this spec)
- [ ] OKF concept through `il-okf-writer` once the feature is verified end-to-end

## Deferred (not blocking temple)

- Move `TempleGrid`/`TempleCatalog`/`TempleDetail`/`TempleEvents` and `utils/temple-labels.ts` to `src/lib/features/temple/` per AGENTS.md §5 (optional).
- Entry to the temple page from the calendar (FR-TPL-006 "from the calendar") — belongs to the calendar feature.
- Photo grid / lightbox for the photo set — when the backend adds the photo set (design "Section order" note).
