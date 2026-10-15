# Design — temple (Chùa Việt Nam)

Version: 1.2
Last updated: 2026-10-15
Status: in-progress (drift) — mirrors `requirements.md`

> See `changelog.md` in this folder for the version history of this spec.

## Overview

Three places in the `(site)` group, all public: the featured temple block on `/`, the directory `/temples` and the temple page `/temples/[id]`. Data follows the repo's data path: the `load` of `+page.server.ts` → `$lib/server/api/temples.ts` → backend `/v1/temples/*` with `x-api-key`, no token. Search and the region filter are **URL parameters** (`?q=&region=&page=`) that `load` reads and passes to the backend — the search field is a `<form method="GET">`; with JS it submits after a typing pause through `goto` (no extra `/api/*` endpoint). Open/closed status (BR-TPL-09) is computed **in the browser** by a new pure function in `src/lib/features/temple/` that uses `src/lib/utils/lunar.ts`. `src/routes/api/temples/+server.ts` is only the proxy for the `onboarding` temple picker. Closest examples: the existing directory (`TempleCatalog` + `Pagination` with `params`) and `memorial` (pure logic run after mount).

## Layers & components

| Layer | File | Responsibility | Status |
| --- | --- | --- | --- |
| Route (server) | `src/routes/(site)/+page.server.ts` | `loadTopTemples`: `getTopTemples`, returns **all** `items`; on error → `null` (the UI treats `null` exactly like `[]`) | exists — must drop `HOME_TEMPLE_COUNT = 7` (`.slice(0, 7)`) |
| Section UI | `src/lib/components/sections/TempleGrid.svelte` | Home block "Chùa Việt Nam": cards linking to `/temples/[id]`, "Xem tất cả" (`SectionHeading href="/temples"`); `temples` empty **or** `null` (load failed) → the same empty state `temples_featured_empty`, with no error text, no retry and no sample temple | exists — must: remove the sample-temple branch `TEMPLES`, add the empty state for both cases (AC 2, AC 3); card per ⚠️ AC 1 |
| Content | `src/lib/content/temples.ts`, `src/lib/content/home.ts` (`TEMPLES`) | **Sample** temple catalogue (9 temples, `region: 'highlands'`, `findTemple`, `REGIONS`) | exists — **remove** with the fallback (only `home.ts` still imports it) |
| Route (server) | `src/routes/(site)/temples/+page.server.ts` | `load`: read + canonicalise `page`, `q`, `region` (`parseTempleQuery`), 307 to the canonical URL, `listTemples`, redirect past-the-end pages; on error → `{ temples: null }` | exists — must add `q`, `region`, keep them on redirect |
| Route (UI) | `src/routes/(site)/temples/+page.svelte` | `<svelte:head>` title/description; `noindex` when there is a `q`; passes `data` to `TempleCatalog` | exists — needs `noindex`, pass `query` |
| Section UI | `src/lib/components/sections/TempleCatalog.svelte` | `PageHeader` + count; search field + region choice (`TempleFilters`); card grid; empty / no match / error + retry; `Pagination params={q, region}` | exists — needs: filters, temple type on the card, `temples_no_match_*`, `temples_retry`, `params` |
| Feature UI | `src/lib/features/temple/components/TempleFilters.svelte` | `<form method="GET">` with `SearchField` (`name="q"`, `maxlength=100`) + a hidden submit button; four region links (`region_*`, keep `q`); with JS: debounce 300 ms → `goto(url, { replaceState: true, keepFocus: true, noScroll: true })` | **not created** |
| Feature logic | `src/lib/features/temple/query.ts` | `parseTempleQuery(url) → { page, q, region, canonical }`: `page` positive integer (otherwise 1), `q` trimmed + cut to 100 (empty → dropped), `region` ∈ `north`/`central`/`south` (otherwise dropped); `templeListHref({q, region, page})` builds the canonical URL (drops `page=1`) | **not created** (replaces the local `parsePage`) |
| Route (server) | `src/routes/(site)/temples/[id]/+page.server.ts` | `load`: `getTemple`; 404 → `error(404)`; other errors → `error(502)`; in parallel: `sangha` events + own temple when there is a session | exists — keep; the `sangha` part is unchanged |
| Route (UI) | `src/routes/(site)/temples/[id]/+page.svelte` | Meta; `TempleDetail` | exists |
| Route (UI) | `src/routes/(site)/temples/[id]/+error.svelte` | 404: `temple_d_not_found_*` + link to `/temples`; other statuses: the same data `ErrorScreen` + `err_retry` as the root `+error.svelte` | **not created** |
| Section UI | `src/lib/components/sections/TempleDetail.svelte` | The sections of the "Section order" table, including the photo section (section 6); only the "Chỉ đường" button; every missing value per BR-TPL-06 | exists — many changes (see the table below); **remove** `templeFollow` |
| Feature UI | `src/lib/features/temple/components/TempleHours.svelte` | Hours card: status line (after mount only, `setInterval` 60 s, cleared on unmount), two hour rows + `temple_d_today` label; no holiday hours → the holiday row shows the normal hours | **not created** |
| Feature UI | `src/lib/features/temple/components/TempleContacts.svelte` | Hotline/fanpage/website/email: with a value → `tel:`/`https://`/`mailto:`; without → `temple_d_pending` as plain text | **not created** |
| Feature logic | `src/lib/features/temple/open-status.ts` | `parseHours(s) → {open, close} \| null` (exactly `HH:MM - HH:MM`); `templeOpenStatus(nowUtc: Date, hours, holidayHours) → { status: 'open'\|'closed'\|'hidden', time: string \| null, todayRow: 'normal'\|'holiday'\|null }` per BR-TPL-09 | **not created** |
| Logic | `src/lib/utils/lunar.ts` | `solarToLunar(date)` (reads `getDate/getMonth/getFullYear` in **device time**) — `open-status.ts` builds the Vietnam date from `nowUtc + 7 h` (getUTC*) then calls `solarToLunar(new Date(y, m − 1, d))` for today and tomorrow | exists — unchanged |
| Labels | `src/lib/utils/temple-labels.ts` | `templeRankLabel`, `templeSectLabel`; **add** `templeTypeLabel`, `templeRegionLabel`; unknown enum → `undefined` | exists — add two functions |
| State | `src/lib/state/temple-follow.svelte.ts` | Per-device follow (`localStorage` `il-temple-follow`) | exists — **remove** (BR-TPL-08) |
| Section UI | `src/lib/components/sections/TempleEvents.svelte`, `TempleEventList.svelte` | "Sự kiện & khóa học" section; the list is shared with `SanghaMain` | exists — `TempleEventList` gains an `emptyLabel` prop (default `temple_ev_empty`), the temple page passes `temple_ev_none_posted` |
| API resource | `src/lib/server/api/temples.ts` | `getTopTemples`, `listTemples(fetch, {page, q?, region?})`, `getTemple`, `listTempleOptions`, `suggestTemple` (belongs to `onboarding`) | exists — `listTemples` needs `q`, `region` (⚠️ contract) |
| Route (server) | `src/routes/api/temples/+server.ts` | Proxy of `GET /v1/temples/options` for the temple picker (`onboarding`) | exists — matches AC 29 |
| Types | `src/lib/types/temple.ts` | DTOs per openapi; **add** `TempleListQuery.q/region`, `TempleDetail.holiday_operating_hours`, `sangha_body`, `contacts`, `content_updated_month` (⚠️ contract); fix the comments "20 per page", "No region filter" | exists — needs changes |
| Breadcrumbs | `src/lib/config/breadcrumbs.ts` | `/temples`, `/temples/[id]` (`temple_d_crumb`) | exists |
| Offline | `src/lib/components/layout/OfflineGate.svelte` (root layout) | Site-wide offline screen/bar | exists — used as is (AC 8) |
| i18n | `messages/vi.json`, `messages/en.json` | `temples_*`, `temple_*`, `region_*` | exists — add/remove per the "i18n keys" table |
| Tests | `src/lib/features/temple/*.spec.ts`, `tests/temples.e2e.ts` | Vectors + logic + E2E | **none yet** (the repo has no Vitest/Playwright yet) |

### Temple page section order

Per the "Trang chùa" (temple page) prototype (`innerlamp-Android/Docs/innerlamp-project/project/docs/Trang-chi-tiet-chua.md`; web ≥ 1024px suggested as two columns, left: introduction, photos, architecture, notes, events). The "Current" column is what `TempleDetail.svelte` does on 2026-10-15.

| # | Section | Column (≥ 1024px) | Data source | Current |
| --- | --- | --- | --- | --- |
| 1 | Image header: heritage rank · sect chips, name, `temple_d_aka` ("Còn gọi: " + `aliases` joined with " · ", hidden when empty), ward + province | full width | `image_url`, `heritage_rank`, `sect`, `name`, `aliases`, `location.ward`, `location.province` | has chips, name, province; no "Còn gọi" (it sits in the right column with the label `temple_d_aliases`), no ward |
| 2 | Action row: only `temple_d_directions` | right | `location.lat/lng` | has "Theo dõi" (remove) + "Chỉ đường" (`search` URL, change to `dir`) |
| 3 | Hours card (`TempleHours`) | right | `operating_hours`, `holiday_operating_hours` | prints `operating_hours` only, hidden when empty |
| 4 | Four facts: founding year, heritage rank, sect, region | right | `established_year`, `heritage_rank`, `sect`, `region` | founding year only |
| 5 | Introduction, collapsed + `temple_d_read_more`/`temple_d_read_less` | left | `introduction` | exists, hidden when empty, not collapsed |
| 6 | Photos (`temple_d_photos_title`): shows `temple_d_pending` while the photo set does not exist (AC 21); never hidden | left | photo set — no field yet (comes later, BR-TPL-06) | none |
| 7 | Organisation & lineage: abbot, founder, sangha body | left | `current_abbot`, `founder`, `sangha_body` | has abbot, founder (hidden when empty); no sangha body |
| 8 | Architecture & heritage: architecture style row and materials row (`temple_d_pending` until the data exists, AC 21), the architecture paragraph (highlights) | left | `architecture_heritage`; style / materials — no field yet (come later) | has the paragraph, hidden when empty |
| 9 | Amenities: car parking, motorbike parking, vegetarian meals, retreats — available / `temple_d_none`; "Kinh sách" — `temple_d_pending` until the data exists, never `temple_d_none` (AC 21) | right | `amenities.*`; "Kinh sách" — no field yet (comes later) | shows only the amenities that exist |
| 10 | Visiting notes, numbered `01, 02, …` | left | `visiting_notes` | exists, numbered `1, 2`, hidden when empty |
| 11 | Events & courses | left | `sangha` (with a session) | exists; empty copy must change |
| 12 | Location & contacts: full address, region, coordinates, map button; `TempleContacts` | right | `location.full_address`, `region`, `lat/lng`, `contacts.*` | has the address; the rest is missing |
| 13 | Footer `temple_d_updated({month})` (MM/YYYY), hidden when `null`; no "Báo thông tin sai" | full width | `content_updated_month` | none |

The `TempleSanghaCard` card (feature `sangha`) keeps its current place, right under the header.

Platform decision: the photo section shows only its title and the `temple_d_pending` text for now; the photo grid (3–5 columns, lightbox per the prototype) is designed when the backend adds the photo set.

## Route & navigation flow

```
/ ──temple card──▶ /temples/[id]
  └─"Xem tất cả"──▶ /temples
/temples[?q=&region=&page=]
  ├─ submit search (Enter / debounce) ──▶ /temples?q=…[&region=…]          (page 1, replaceState while typing)
  ├─ pick region ──▶ /temples?region=…[&q=…]  |  "Tất cả" ──▶ /temples[?q=…]
  ├─ page number ──▶ ?page=N (keeps q, region)
  ├─ bad parameter / page=1 / past the end ──▶ 307 canonical URL
  └─ temple card ──▶ /temples/[id]
/temples/[id]
  ├─ 404 ──▶ temple_d_not_found_* ──▶ /temples
  ├─ "Chỉ đường" ──▶ https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>  (new tab)
  └─ contact ──▶ tel: / https:// / mailto:
/sangha ──"Trang chùa" / suggested temple──▶ /temples/[id]   (feature sangha; the calendar has no link yet — FR-TPL-006 "from the calendar" not built on the website)
```

Every internal `href`/redirect uses `localizeHref`.

## Step-by-step Flow — Directory: search, region filter, paging

```
Step 1 — Submit the filters (browser, this feature)
- Trigger: Enter in the search field, a region option clicked, a page number clicked; with JS: 300 ms typing pause
- Pre-condition: —
- Where: `TempleFilters.svelte` (GET form / links), `Pagination` (`?page=` links with `params`)
- Logic: build the URL with `templeListHref` (q trimmed + cut to 100, dropped when empty; a q/region change drops page);
  no JS → the browser submits the GET form; with JS → `goto(localizeHref(url), {replaceState: while typing, keepFocus: true, noScroll: true})`

Step 2 — Canonicalise the URL (server, this feature)
- Trigger: request to `/temples`
- Where: `src/routes/(site)/temples/+page.server.ts` `load`
- Logic: `parseTempleQuery(url)`; current URL ≠ `canonical` (bad page or page = 1, bad region, q with extra spaces / > 100 / empty)
    → `redirect(307, canonical)` (keeps the valid parameters), no backend call

Step 3 — Read the page (server, this feature)
- Pre-condition: the URL is canonical
- API: GET /v1/temples?page=N[&q=…][&region=north|central|south]
  ⚠️ Not confirmed (contract): `q`, `region` not yet in openapi.yaml @ a8a016b (backend v2.0 AC 39–44)
    - Success, `items` empty, page > 1, total_pages > 0 → `redirect(307, templeListHref({q, region, page: total_pages}))`
    - Success → `{ temples, query: {q, region} }` → cards, `temples_page_sub({count: total})`, `Pagination`
      (total = 0: with q/region → `temples_no_match_*`; without → `temples_empty`)
    - Failure (400 INVALID_PAGE / INVALID_FILTER — unexpected after Step 2) → log the error code, `{ temples: null, query }`
    - Failure (network / 5xx) → `{ temples: null, query }` → `temples_load_error` + `temples_retry` (link to the current URL)
```

The home page (`GET /v1/temples/top`) and the temple page (`GET /v1/temples/{id}`) are one call then render — no Step-by-step needed; the error branches are in the Error → UI table of `requirements.md`. On the home page both an empty `top` and a failed `top` end in the same empty state (AC 2, AC 3).

## Open/closed status (BR-TPL-09)

- `templeOpenStatus` is a pure function that takes `nowUtc` (it never reads the clock), so tests can run the vector `temple-open-status.json` (`now_utc`, `hours`, `holiday_hours` → `status`, `today_row`, label).
- Vietnam date = the UTC fields of `nowUtc + 7 h`; lunar day = `solarToLunar(new Date(y, m − 1, d))` (the function reads device-time fields, so a local `Date` must be built from the Vietnam y/m/d — never pass `nowUtc` directly). Lunar day 1 or 15 with holiday hours → the holiday hours apply. "Mở lại" (opens again) after closing takes the opening time of Vietnam **tomorrow** with the same lunar rule.
- Labels: `temple_d_status_open({time})` / `temple_d_status_closed({time})`; tests compare with the vector text in locale `vi`.
- `TempleHours` calls the function in `onMount` and every 60 s; SSR and the first render have no status line (server/cache time is never printed). The two hour rows render at SSR; the `temple_d_today` label is attached only after mount (same source, `todayRow`).
- `holiday_operating_hours = ""` → `holidayHours = null`; the `temple_d_hours_holiday` row then shows the normal hours text (the hours in force on Rằm & Mùng Một), not `temple_d_pending`, and on those days `todayRow` is `normal` (vector "Rằm without holiday hours uses normal hours"). With no normal hours either, both rows show `temple_d_pending` and the status is hidden.

## i18n keys

The Vietnamese text of the product's quoted copy is taken exactly as in the product spec (punctuation only adjusted); the `en` text is translated by the website.

| Key | Used for | Action |
| --- | --- | --- |
| `temples_title`, `temples_meta_description`, `temples_page_sub`, `temples_empty`, `temples_load_error` | Directory | keep |
| `temples_retry` | Retry on load error ("Thử lại") | add |
| `temples_search_label`, `temples_search_placeholder`, `temples_search_submit` (hidden, for no-JS) | Search field | add |
| `temples_region_label` | Region option group (aria-label) | add |
| `region_all`, `region_north`, `region_central`, `region_south` | Region options, the "region" fact on the temple page | keep |
| `region_highlands` | "Tây Nguyên" (sample data only) | **remove** with `content/temples.ts` |
| `temples_no_match_title`, `temples_no_match_hint` | "Không tìm thấy chùa" + hint to change the term / region | add |
| `temples_featured_empty` | Home block empty — also used when the featured temples fail to load (AC 3) | add |
| `temple_type_chua`, `temple_type_thien_vien`, `temple_type_dao_trang`, `temple_type_tinh_xa`, `temple_type_thien_xa` | Temple type on the card | add |
| `temple_rank_*`, `temple_sect_*`, `temple_photo_label`, `temple_d_crumb`, `temple_d_meta_description` | Enum labels, image placeholder, breadcrumb, meta | keep |
| `temple_d_aka` (`{names}`) | "Còn gọi: …" | add; **remove** `temple_d_aliases` |
| `temple_d_status_open` (`{time}`), `temple_d_status_closed` (`{time}`), `temple_d_hours_normal`, `temple_d_hours_holiday`, `temple_d_today` | Hours card | add; `temple_d_hours` becomes the card title |
| `temple_d_pending`, `temple_d_none` | "Đang cập nhật", "Không có" | add |
| `temple_d_facts_region` (+ reuses `temple_d_founded`, the heritage rank / sect labels) | Four facts | add |
| `temple_d_read_more`, `temple_d_read_less` | "Đọc thêm" / "Thu gọn" | add |
| `temple_d_photos_title` | Photo section title ("Hình ảnh" — photos); body is `temple_d_pending` (AC 21) | add |
| `temple_d_org_title`, `temple_d_sangha_body` (+ `temple_d_abbot`, `temple_d_founder`) | Organisation & lineage | add |
| `temple_d_arch_style`, `temple_d_materials` | Architecture rows, value `temple_d_pending` until the data exists (AC 21) | add |
| `temple_amenity_books` (+ the existing `temple_amenity_*`) | "Kinh sách", value `temple_d_pending` until the data exists (AC 21) | add |
| `temple_d_location_title`, `temple_d_coords`, `temple_d_map`, `temple_d_hotline`, `temple_d_fanpage`, `temple_d_website`, `temple_d_email` (+ `temple_d_address`) | Location & contacts | add |
| `temple_d_updated` (`{month}`) | Footer "Cập nhật MM/YYYY" (updated MM/YYYY) | add |
| `temple_d_not_found_title`, `temple_d_not_found_body`, `temple_d_not_found_back` | Temple not found | add |
| `temple_d_directions`, `temple_d_intro`, `temple_d_architecture`, `temple_d_visiting`, `temple_d_amenities`, `temple_ev_title` | Titles / buttons | keep |
| `temple_ev_none_posted` | "Chùa chưa đăng sự kiện nào." on the temple page (`temple_ev_empty` kept for `/sangha`) | add |
| `temple_d_follow`, `temple_d_following` | "Theo dõi" button | **remove** (BR-TPL-08) |
| `temple_<n>_*` (72 keys) | Content of the 9 sample temples | **remove** with `content/temples.ts` |

## Deliberately stubbed for now

- **`q`/`region` and the four new detail field groups** — written against backend v2.0 AC 39–46, done only once openapi has them (⚠️ contract in `requirements.md`). Until then it is unclear whether the backend ignores an unknown `q`/`region` or rejects it: enable `TempleFilters` only once the backend runs v2.0.
- **Fields that come later (architecture style, materials, "Kinh sách", photo set)** — no backend field yet; their rows/section render `temple_d_pending` unconditionally until the backend adds the data (then a new spec version wires the real values).
- **Home card** — waits for ⚠️ requirements AC 1 (the current compact tile is kept meanwhile).
- Old code lives in `components/sections`, `state`, `utils` instead of `src/lib/features/temple/` (AGENTS.md §5); only new code goes into `features/temple/`, moving the old parts is optional (`tasks.md` Deferred).
