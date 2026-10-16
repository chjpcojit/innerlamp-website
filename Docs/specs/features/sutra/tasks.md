# Tasks — sutra (Kinh sách — Sutra library)

Version: 1.0
Last updated: 2026-10-16
Status: in-progress (drift) — mirror `requirements.md`

> See `changelog.md` in this folder for the version history of this spec.

`[x]` only when checked to exist in the code on 2026-10-16 and to match product v1.0. Each item points
to a row of the Layers & components table or a Step in `design.md`; "AC n" is a criterion in
`requirements.md`.

## Phase 1 — UI (`il-ui`)

- [x] Route `library/sutras/+page.svelte` + `<svelte:head>` (`sutras_title` · `app_name`, `sutras_meta_description`) (AC 44 — meta description still mentions listening, see the i18n item)
- [x] `SutraCatalog`: topic chips are links with `aria-current` (AC 3 — structure only: traditions and "Nhật tụng" (Daily chanting), no purposes)
- [x] `SutraCatalog`: `Pagination` page numbers, keeps the active parameter (AC 1, 9 — `filter` only today)
- [x] Route `library/sutras/[slug]/+page.svelte` + `<svelte:head>` (title, `sutra_d_meta_description`) (AC 16, 44)
- [x] Sutra page: version links with `aria-current`, hidden for a single version (AC 30)
- [x] Sutra page: source line with the link to `source_url` (`target="_blank"`, `rel="noopener noreferrer external"`) (AC 18 — link case)
- [x] Sutra page: "Kinh sách khác" (Other texts) block hidden when empty (AC 24)
- [x] Reader text is rendered as stored (`whitespace-pre-line`, no processing) (AC 29)
- [x] Reader: A− / A+ buttons write `settings.value.font`, shared with `SettingsForm` (AC 31 — three sizes only)
- [x] Breadcrumbs for the list and the sutra page (`config/breadcrumbs.ts`) (AC 44)
- [ ] `SutraCover` / card: `titles.vi` as the main title whatever the locale; kind label; tradition label; collection · citation code; "khoảng N phút"; daily mark; short summary; hide empty parts (AC 2) ⚠️ label copy
- [ ] `features/sutra/components/SutraFilters.svelte`: `<form method="GET">` search (`name="q"`, `maxlength="100"`, label, submit, "clear" link), topic chips (Tất cả, Hằng ngày, ten purposes, three traditions; one active), duration chips (Tất cả, ≤ 5 / 15 / 30 / 60), all as links keeping the other parameters and resetting `page` (AC 3–7) ⚠️ AC 6
- [ ] `SutraCatalog`: use `SutraFilters`; subtitle `sutras_page_sub` "{count} bản kinh"; `aria-busy` + dimmed cards while navigating (`navigating` from `$app/state`), never the empty state (AC 1, 14)
- [ ] `features/sutra/components/SutraState.svelte`: error state with `err_retry` link button to the current URL and chips / search kept; empty states by cause (library empty / chips / search) with a "clear" link; no "Gửi yêu cầu bản kinh" until answered (AC 12, 13) ⚠️ AC 13
- [ ] `SutraDetail`: reduce to the sutra page — `<h1>` Vietnamese title, original title, kind, tradition, collection · citation code, summary, "khoảng N phút", "Đọc kinh" link to `/read` (AC 16)
- [ ] `SutraDetail`: facts `author`, `han_translator` (+ `han_translation_year`), `reference_note`, each hidden when empty (AC 17)
- [ ] `features/sutra/components/SutraVersions.svelte`: per version name, translator, source (link), licence label, `license_note`; `UNKNOWN` → no licence line; never hides a version (AC 18)
- [ ] `SutraDetail`: unreviewed notice `sutra_d_unreviewed` while `review_status` is `UNREVIEWED` (AC 19)
- [ ] `features/sutra/components/SutraDeities.svelte`: linked Buddhas and Bodhisattvas by role, name + thumbnail / placeholder, link `/library/buddhas/{deity_id}`; hidden when `[]` (AC 20)
- [ ] `SutraDetail`: remove the `SutraPlayer` block and every play / progress / elapsed-time element; no audio control whatever `audio_url` holds (AC 21, 33)
- [ ] Route `library/sutras/[slug]/read/+page.svelte` + `SutraReader.svelte` extracted from `SutraDetail.svelte`: version links, table of contents from `sections` as links (`?translation=&part=`), one section, prev / next links, source line, back link, `<svelte:head>`, breadcrumb (AC 25–27, 30, 36, 44)
- [ ] `SutraReader`: "Tải tiếp" (Load more) control + `IntersectionObserver` after mount, retry on failure, lines already shown kept (AC 28, 34; Step R3)
- [ ] `SutraReader`: error state of the text area with `err_retry` link, table of contents and version links stay; `sutra_d_no_text` for a version without lines (AC 34, 35)
- [ ] `SutraReader`: four sizes (17 / 20 / 24 / 28 px, line height double the size), `A−` / `A+` disabled at the ends; reader background follows the site theme tokens, remove the local `dark` toggle and the fixed `--r-*` colours (AC 31, 32)
- [ ] `SettingsForm.svelte`: fourth option "Rất lớn" (Extra large) in the `set_font` row (AC 31) ⚠️ AC 31
- [ ] `features/sutra/components/QuoteOfDay.svelte`: verse text (line breaks kept) + attribution; rendered after mount; hidden when the file is unreadable (AC 37, 40, 41)
- [ ] `DayOverview.svelte`: replace the `verse_N` lines by `QuoteOfDay` for the `date` prop; remove `VERSE_COUNT` use (AC 37)
- [ ] `HomeHero.svelte`: replace `VERSES` by `QuoteOfDay` for `sel.date` (AC 37, 39) ⚠️ AC 39
- [ ] i18n (both `messages/vi.json` and `messages/en.json`, per the "i18n keys" table in `design.md`):
  - [ ] change `sutras_page_sub`, `sutras_minutes`, `sutras_tab_daily`, `sutras_filter_label`, `sutras_meta_description`, `sutra_d_meta_description` (AC 1, 2, 3, 44)
  - [ ] add `sutra_kind_*` (3), `sutra_purpose_*` (10), `sutras_duration_*`, `sutras_search_*`, `sutras_daily_mark`, `sutras_error_*`, `sutras_empty_library` / `_filters` / `_search` / `_clear` (AC 2–7, 12, 13)
  - [ ] add `sutra_d_read`, `sutra_d_unreviewed`, `sutra_d_original_title`, `sutra_d_author`, `sutra_d_han_translator`, `sutra_d_reference_note`, `sutra_d_translator`, `sutra_d_license`, `sutra_license_*` (4), `sutra_d_deities`, `sutra_d_role_*` (3), `sutra_d_deity_placeholder` (AC 16–20)
  - [ ] add `sutra_d_load_more`, `sutra_d_load_more_error`, `sutra_d_back`, `set_font_xlarge`, `quote_source` (AC 28, 31, 37)
  - [ ] delete keys no longer used once `grep` finds no usage: `sutras_tab_mahayana` / `_theravada` / `_vajrayana`, `sutras_load_error`, `sutras_empty`, `sutra_d_listen` / `_resume` / `_pause` / `_player` / `_progress`, `sutra_d_mode_*`, `verse_1..4` / `verse_*_src`, `home_verse`

## Phase 2 — State & logic (`il-state`)

- [ ] `features/sutra/filters.ts`: `TOPICS`, `DURATIONS`, `cleanTerm`, `parseListParams(url)` (canonical params + `SutraListQuery`, legacy `?filter=` mapping), `canonicalListUrl` (AC 3–8)
- [ ] `features/sutra/version.ts`: `defaultTranslation` per BR-STR-05 — Vietnamese first; translation, chant, meaning, poem; ties in source order; no-Vietnamese texts keep today's English-then-first rule until ⚠️ AC 25 is answered (AC 25)
- [ ] `features/sutra/version.ts`: `sectionPage(section, pageSize)` and `sectionLines(items, section)` (AC 26–28; Step R2)
- [ ] `features/sutra/state/loadMore.svelte.ts`: lines, `next`, one request in flight, error flag, retry (AC 28, 34; Step R3)
- [ ] `features/sutra/quote.ts`: `dayOfYear` from local fields, `quoteNumber(date, count)`, `quoteForDate(date)` over the bundled file (AC 37, 38)
- [ ] Implement BR-STR-05 per innerlamp-be `docs/product/sutra/rules/sutra-default-version.json` (same item as above; the vector decides)
- [ ] Implement BR-STR-10 per innerlamp-be `docs/product/sutra/rules/sutra-daily-quote.json`
- [ ] `state/settings.svelte.ts`: `font: 0 | 1 | 2 | 3`; keep stored 0..2; out-of-range or non-integer stored value → 1 (AC 31)
- [ ] `utils/sutra.ts`: `sutraTitle` returns `titles.vi`; add `kindLabel`, `purposeLabel`, `licenseLabel` (unknown value → `undefined`, no label); remove the old `defaultTranslation` and `groupChapters` (AC 2, 18, 25)
- [ ] Move `formatClock` to `utils/time.ts` and point `TalkDetail.svelte` at it, then delete `state/sutra-player.svelte.ts` (AC 21; Dependencies)

## Phase 3 — Server data (contract-gated)

- [x] Operations `GET /v1/sutras`, `GET /v1/sutras/{id}`, `GET /v1/sutras/{id}/lines` exist in innerlamp-be `docs/specs/api/openapi.yaml` @ 3e1c415, including `q`, `purpose`, `daily`, `max_minutes` (cited, schema not copied)
- [x] `src/lib/server/api/sutras.ts`: `listSutras`, `getSutra`, `listSutraLines` with DTOs in `src/lib/types/sutra.ts` (`SutraListQuery` already has `q`, `max_minutes`, `purpose`, `daily`)
- [x] `library/sutras/+page.server.ts`: `?page` / unknown `?filter` → 307, past the end → 307 last page, `ApiError` → `sutras: null` (AC 8, 9, 12 — partly)
- [x] `library/sutras/[slug]/+page.server.ts`: 404 → `error(404)`, other `ApiError` → `error(502)`, related texts failure → `[]` (AC 22–24)
- [ ] `library/sutras/+page.server.ts`: use `parseListParams`; `?topic` / `?max` / `?q`; legacy `?filter=` → `?topic=`; keep every parameter on the past-the-end redirect; send `q`, `max_minutes`, `purpose`, `daily`, `tradition` in one call (AC 3–9; Steps L1, L2)
- [ ] `library/sutras/[slug]/+page.server.ts`: drop `loadLines`, `MAX_LINE_PAGES` and `?translation=` handling; keep `getSutra` ∥ `loadRelated` (AC 28; Step P1)
- [ ] `library/sutras/[slug]/read/+page.server.ts`: `getSutra`, version choice, `?part` → section, one `listSutraLines` page, 307 for unknown `?translation` / `?part`, error mapping per the Error → UI table (AC 25–28, 34; Steps R1, R2)
- [ ] `src/routes/api/sutras/[id]/lines/+server.ts`: validate `translation`, `page`, `page_size` (`SUTRA_LINES_PAGE_SIZE` cap), call `listSutraLines`, map `ApiError` → JSON `{ error }` + status (AC 28, 43; Step R3)
- [ ] Quote file: script that copies `sutra_quotes_300.json` from the Android repo (default `../innerlamp-Android/app/src/main/assets/`) to `src/lib/features/sutra/data/sutra-quotes-300.json` with the source commit, never hand-edited; the shared vector-sync script of the calendar spec may carry it as a parameter (AC 38) ⚠️ AC 38
- [ ] Vector pin: copy innerlamp-be `docs/product/sutra/rules/{sutra-default-version,sutra-daily-quote}.json` to `tests/vectors/sutra/` through the same shared script with the source commit (default `../innerlamp-be`); tests read the pin, and compare it with the source when a checkout exists
- [ ] Document the BR-STR-02/03/04 hand-off in the code comment of `parseListParams`: the website maps chips and term to query parameters; ordering, filtering and matching are the backend's (no website vector)

## Phase 4 — Tests (`il-testing`)

- [ ] Unit: `features/sutra/filters.spec.ts` — chip → query (`daily` / `purpose` / `tradition`, `max_minutes`, `q` cut to 100 after trim), canonical URL, legacy `?filter=` mapping, bad values (AC 3–8)
- [ ] Unit: `features/sutra/version.spec.ts` — every case of innerlamp-be `docs/product/sutra/rules/sutra-default-version.json` (BR-STR-05); `sectionPage` / `sectionLines`
- [ ] Unit: `features/sutra/quote.spec.ts` — every case of innerlamp-be `docs/product/sutra/rules/sutra-daily-quote.json` (BR-STR-10), plus a local-date case near midnight in a non-UTC zone
- [ ] Unit: `utils/sutra.spec.ts` (labels, unknown enum values) and `server/api/sutras.spec.ts` (query string)
- [ ] Unit: `library/sutras/page.server.spec.ts` — 307 normalisation, legacy redirect, past the end, `sutras: null` on `ApiError`; `read/page.server.spec.ts` — default version, `?part`, `TRANSLATION_NOT_FOUND`
- [ ] No vector task for `sutra-browse.json` and `sutra-search-match.json` (BR-STR-02/03/04): ordering, filtering and matching are computed by the backend and the website shows what it receives. If the website ever filters, orders or matches texts itself, add tasks running those files
- [ ] E2E (`tests/sutra.e2e.ts`): list → topic chip + duration chip + search combine → card → sutra page → "Đọc kinh" → section jump → version switch → font size appears in the settings; backend failure → error state with retry, no sample text; the longest text opens without loading all lines (NFR-STR-01, within 2 s on 4G)
- [ ] Measure NFR-STR-02 (chip or search → first page within 2 s on 4G)

## Phase 5 — Quality (`il-quality`)

- [ ] `npm run check && npm run lint && npm run build` pass

## Phase 6 — Documentation

- [ ] Report the Website column status for `docs/product/sutra/product.md` §4.2 to `ba-writer` (this skill does not edit the backend repo): BR-STR-05 title by locale and variant order, BR-STR-09 / FR-STR-008 not built, FR-STR-010 drift
- [ ] Cleanup of the old website docs once this spec is merged: `.assumptions.md` lines 6 and 23 (sutra mentions) and the sutra mentions in `Docs/specs/features/{temple,article,deity}/` (links only, keep)
- [ ] OKF concept via `il-okf-writer` once the feature is verified end-to-end

## Deferred (not blocking sutra)

- A debounced "search as you type" after mount (⚠️ AC 6, product answer first).
- "Gửi yêu cầu bản kinh" (Request a text) on the search-empty state (⚠️ AC 13).
- Anything the reading view offers instead of audio (⚠️ AC 21).
- Serving the quotes from the backend (⚠️ AC 38) — then `quote.ts` moves to a server resource.
