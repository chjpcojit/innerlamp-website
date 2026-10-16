# Requirements — sutra (Kinh sách — Sutra library)

Version: 1.0
Last updated: 2026-10-16
Status: in-progress (drift) — the list `/library/sutras` (tradition + "Nhật tụng" (Daily chanting) chips via `?filter=`, `?page=` with URL normalisation, past the end → last page) and the page `/library/sutras/[slug]` (title, summary, version links, table of contents, one-chapter-at-a-time reader, A−/A+, source line) run against the real backend. Remaining: search, topic chips with the ten purposes, duration chips, Vietnamese-first titles, kind / citation code / duration wording on the card, the sutra page facts (licence label, original title, author, Chinese translator, unreviewed notice, linked Buddhas and Bodhisattvas), a separate reading view with a table of contents from the contract `sections` and no eager load of the whole text, four font sizes shared with the settings, removal of the simulated player and the local dark toggle, error / empty / loading states with "Thử lại" (Try again), the quote of the day, tests.
Feature folder: `src/routes/(site)/library/sutras/`, `src/lib/components/sections/{SutraCatalog,SutraDetail}.svelte`, `src/lib/components/ui/SutraCover.svelte`, `src/lib/server/api/sutras.ts`, `src/lib/types/sutra.ts`, `src/lib/utils/sutra.ts`, `src/lib/state/sutra-player.svelte.ts` (to be removed), `src/lib/state/settings.svelte.ts` (font size), the verse blocks in `HomeHero.svelte` and `DayOverview.svelte`; new: `src/lib/features/sutra/`
Product spec: innerlamp-be `docs/product/sutra/product.md` @ v1.0
Contract: innerlamp-be `docs/specs/api/openapi.yaml` @ 3e1c415 (`info.version` 1.0.0, tag Sutras: `GET /v1/sutras`, `GET /v1/sutras/{id}`, `GET /v1/sutras/{id}/lines`; tag Sutras/Deities: `GET /v1/deities/{id}/sutras`). The quote of the day has no operation in the contract (product Appendix B item 4).
Implements: BR-STR-01, BR-STR-02 (§3.6: page numbers), BR-STR-03, BR-STR-04, BR-STR-05, BR-STR-06, BR-STR-07, BR-STR-08, BR-STR-09, BR-STR-10, BR-STR-11, BR-STR-12, BR-STR-13, FR-STR-001 (§3.6: page numbers), FR-STR-002, FR-STR-003, FR-STR-004, FR-STR-005 (§3.6: one section at a time), FR-STR-006, FR-STR-007 (§3.6: font size on the page, same device setting as the settings page), FR-STR-008, FR-STR-009 (shown by the `deity` spec), FR-STR-010 (§3.6: quote file available to the website), FR-STR-011, NFR-STR-01, NFR-STR-02; related FR-DTY-007 (deity)

> See `changelog.md` in this folder for the version history of this spec.

This spec was written retroactively from the running code (read 2026-10-16) and checked against product spec v1.0; the parts not built yet are written prospectively in the same file. Routes: `/library/sutras`, `/library/sutras/[slug]`, the new reading view `/library/sutras/[slug]/read`, and the quote blocks on `/` and `/lunar/day` (`/en/...`).

Product behavior (kinds and traditions, order, page size, filters, search matching, Vietnamese-first titles and versions, sources and licences, duration, links to Buddhas, quote number, reading preferences, no audio, public access) lives in the product spec and is **not** restated here; this file only says how the website implements those IDs. Not applicable to the website (Website column `n/a`): FR-STR-012 (operator content load), NFR-STR-03.

## Constraints from the product spec

- **Public, read-only** (BR-STR-13): no route of the feature needs a session; no sign-in prompt; the feature does not read the session cookie.
- **Website is online only** (§3.6 row §2.4): no offline copy; backend failure → error state with "Thử lại" (Try again), never sample content (FR-STR-011).
- **Search, filters and order run on the backend** (BR-STR-02/03/04): the website sends the chips and the term as query parameters and shows the order it receives; it does not filter, search or re-sort the list on its own. The website does choose the version that opens (BR-STR-05) and the quote of the day (BR-STR-10) on its own.
- **Vietnamese first** (BR-STR-05): the interface of the feature shows `titles.vi` and opens the Vietnamese version whatever the site locale (`/en/...`); only the interface strings follow the locale. Source text is shown exactly as stored (BR-STR-06).
- **No audio, no simulated player** (BR-STR-12): the contract says `audio_url: ""` for every text; the page shows no play button, progress bar or elapsed time.

## Dependencies

- **deity** (`Docs/specs/features/deity/`): the deity page shows "Kinh liên quan" (Related sutras) from `GET /v1/deities/{id}/sutras` and links to `/library/sutras/{sutra.id}` (deity AC 21, 22); this spec only guarantees that target route. The sutra page links back to `/library/buddhas/{deity_id}`.
- **settings**: `SettingsForm.svelte` row "Cỡ chữ kinh văn" (`set_font`) reads and writes the same `settings.value.font` as the reading view (BR-STR-11); both change together.
- **calendar / home**: `DayOverview.svelte` (`/lunar/day`) and `HomeHero.svelte` (`/`) show the quote of the day (FR-STR-010); the calendar spec owns the rest of those pages.
- **talks**: `TalkDetail.svelte` imports `formatClock` from `src/lib/state/sutra-player.svelte.ts`; removing the sutra player must move `formatClock` to a shared util first (design, Static code to remove).
- **library hub** (`/library`, `LIBRARY_ITEMS` sample tiles in `src/lib/content/library.ts`): out of scope here (product §1.2), a later `library` spec; its sample sutra tiles are not touched by this spec.

## User Story

As a website visitor (signed in or not), I want to browse, filter and search the sutra library, read a text with its table of contents and see which Buddhas and Bodhisattvas it concerns, and see a verse of the day, so that I can find a text to read or chant and study it. (product §1.3)

## Acceptance Criteria (EARS notation)

### Sutra list `/library/sutras`

1. WHEN the visitor opens `/library/sutras`, THE SYSTEM SHALL call `GET /v1/sutras?page=N[&...]` from the server, show the cards in exactly the order received, the subtitle `sutras_page_sub` with `total` ("{count} bản kinh" (N texts)) and the page-number bar (`Pagination`) when `total_pages > 1`; the number of cards per page is the `page_size` the backend returns, the website does not assume a page size itself. (FR-STR-001, BR-STR-02, NFR-STR-02) — ✓ (subtitle text is "{count} bộ kinh", drift in copy, see AC 25).
   > ⚠️ Not confirmed (product): page size 20 or 12 (product Appendix A item 12) — blocks nothing on the website, which reads `page_size` from the response; the comment "Fixed by the backend (20)" in `types/sutra.ts` must not become a rule.
2. WHEN a card is shown, THE SYSTEM SHALL show the Vietnamese title (`titles.vi`, never a title chosen by the site locale), the kind label ("Kinh" (Sutra) / "Kệ" (Verse) / "Chú" (Mantra)), the tradition label ("Nam Tông" / "Bắc Tông" / "Kim Cang Thừa"), the collection and the citation code (`reference`, hidden when empty), the estimated duration "khoảng N phút" (about N minutes) (hidden when `duration_minutes` is `null`), a short summary (hidden when empty) and a mark when `daily_chant` is true; THE SYSTEM SHALL NOT show the English / Pali / Sanskrit title as the main title. (FR-STR-001, BR-STR-01, BR-STR-05, BR-STR-08) — drift: the title follows the site locale (`sutraTitle(titles, locale)`), the card shows tradition only, no kind, no citation code, no daily mark, duration reads "{minutes} phút tụng" (N minutes of chanting).
   > ⚠️ Not confirmed (product): the label and look of the daily-chanting mark on the card and the exact label copy of kind / tradition / duration (product Appendix A item 11) — blocks keys `sutra_kind_*`, `sutras_daily_mark`, `sutras_minutes`; proposed copy in `design.md` stands until changed; hand back to ba-writer in innerlamp-be.
3. WHEN the visitor picks a topic chip, THE SYSTEM SHALL navigate to `/library/sutras?topic=<value>` (page 1, other query parameters kept) and the server SHALL send the matching query (`daily=true`, `purpose=<CODE>` or `tradition=<CODE>`); the chips are, in order, "Tất cả" (All), "Hằng ngày" (Daily), the ten purposes, the three traditions, and only one is active at a time. (FR-STR-002, BR-STR-03) — drift: only "Tất cả", the three traditions (labels "Kinh Đại thừa" / "Kinh Nguyên thủy" / "Kim Cang Thừa") and "Nhật tụng" (Daily chanting), via `?filter=`, as a flat row without purposes.
4. WHEN the visitor picks a duration chip, THE SYSTEM SHALL navigate to `?max=<5|15|30|60>` (page 1, topic and term kept) and the server SHALL send `max_minutes=<value>`; "Tất cả" (All) removes it; the site does not compare durations itself. (FR-STR-002, BR-STR-03, BR-STR-08) — not built.
5. WHEN a topic chip, a duration chip and a search term are all set, THE SYSTEM SHALL send all of them in one `GET /v1/sutras` call so they combine, and SHALL show the new `total`. (FR-STR-002, FR-STR-003, BR-STR-03, BR-STR-04) — not built.
6. WHEN the visitor submits the search field (`<form method="GET">`, `name="q"`, `maxlength="100"`), THE SYSTEM SHALL trim the term, cut it to 100 characters, treat an empty term as "no search" (dropping `q` from the URL), keep the active chips (unless the question below says otherwise), go to page 1, and send `q` as typed; wildcard characters are sent literally and matching (case, diacritics, which fields) is the backend's. (FR-STR-003, BR-STR-04) — not built.
   > ⚠️ Not confirmed (product): whether a search term narrows within the active chips or clears them on the clients (product Appendix A item 8) — blocks the chip behaviour on submit; this spec states "both apply" like the backend.
   > ⚠️ Not confirmed (product): whether the website search runs as the visitor types or on submit (Enter / button) — product FR-STR-003 says "types"; NFR-STR-02 only bounds the first page at 2 s; proposed default: submit (works without JS), optionally debounced navigation after mount; hand back to ba-writer in innerlamp-be.
7. WHEN the visitor clears the search field and submits (or follows the "clear search" link), THE SYSTEM SHALL show the list again under the active chips. (FR-STR-003) — not built.
8. WHEN `?page=` is not an integer ≥ 1, or `?topic=` / `?max=` has an unknown value, or `?q=` is empty / longer than 100 characters, THE SYSTEM SHALL redirect 307 to the canonical URL (keeping the valid parameters, dropping `page=1`, cutting `q`), and the old `?filter=` values (`mahayana`, `theravada`, `vajrayana`, `daily`) SHALL redirect 307 to the same value under `?topic=`. (FR-STR-001, platform) — ✓ for `?page=` and unknown `?filter=`; `?topic=` / `?max=` / `?q=` / legacy mapping not built.
9. WHEN `?page=` is past the last page (backend returns `items: []` with `total_pages > 0`), THE SYSTEM SHALL redirect 307 to the last page, keeping all parameters. (FR-STR-001 §3.6, BR-STR-02) — ✓ (keeps `filter` only).
10. WHEN the list has a single page or the last page is shown, THE SYSTEM SHALL show no "next" link that leads nowhere and no error. (FR-STR-001) — ✓ (`Pagination` disables prev / next at the ends).
11. WHEN the visitor changes a chip or submits a search, THE SYSTEM SHALL show the first page of the new query within 2 s on 4G (a single `GET /v1/sutras` call, no other call on the list). (NFR-STR-02) — not measured.

### States of the list

12. WHEN `GET /v1/sutras` fails (network / 5xx / unexpected 4xx), THE SYSTEM SHALL show the error state with a "Thử lại" (Try again) link button (`err_retry`, a GET link back to the current URL so `load` runs again, no JS needed) and no sample text, and SHALL keep the chips and the search field usable. (FR-STR-011) — drift: shows only `sutras_load_error`, no retry.
13. WHEN the call succeeds with `total: 0`, THE SYSTEM SHALL show an empty state that says why: the library holds no text (no chip, no term) / no text matches the chips / no text matches the search term, each with its own key, and a link to clear the chips and the term when any is set; it SHALL NOT say the connection failed. (FR-STR-011, FR-STR-002, FR-STR-003) — drift: one line `sutras_empty` for every case.
    > ⚠️ Not confirmed (product): whether the "no result" view offers "Gửi yêu cầu bản kinh" (request a text) and what it does (product Appendix A item 9) — blocks the search-empty state; the website offers no request action until answered.
    > ⚠️ Not confirmed (product): the copy of the error, empty, search-empty and not-found states (product Appendix A item 10) — blocks keys `sutras_error_*`, `sutras_empty_*`, `sutra_d_not_found_*`; proposed copy in `design.md` stands until changed.
14. WHILE a navigation to a list URL is loading, THE SYSTEM SHALL show a loading indicator (the previous cards stay, dimmed, with `aria-busy="true"`) and SHALL NOT show the empty state. (FR-STR-011, platform) — not built.
15. WHEN a card is shown and the backend failed, THE SYSTEM SHALL NOT render content from `src/lib/content/library.ts` or any other built-in sample. (FR-STR-011) — ✓ for `/library/sutras` (the sample tiles live only on `/library`, out of scope).

### Sutra page `/library/sutras/[slug]`

16. WHEN the visitor opens `/library/sutras/{id}`, THE SYSTEM SHALL call `GET /v1/sutras/{id}` from the server and show without sign-in: the `<h1>` Vietnamese title, the original title beneath (`original_title`, else another-language title, hidden when none), kind, tradition, collection and citation code, summary, the estimated duration "khoảng N phút", and the action "Đọc kinh" (Read the sutra) (`sutra_d_read`) linking to `localizeHref('/library/sutras/{id}/read')`; `<title>` = Vietnamese title · `app_name`. (FR-STR-004, BR-STR-01, BR-STR-05, BR-STR-08) — drift: no "Đọc kinh" action (the reader is on the same page), title by locale, no kind, no citation code.
17. WHEN the page shows the facts of a text, THE SYSTEM SHALL show `author`, `han_translator` with `han_translation_year`, and `reference_note` each only when not empty. (BR-STR-07, FR-STR-004) — not built.
18. WHEN the page lists the versions, THE SYSTEM SHALL show for each version its name (language and variant), translator, source (`source_name`, a link to `source_url` opening in a new tab with `rel="noopener noreferrer"` when present) and the licence as a label ("CC0", "CC BY-NC 4.0", "Phạm vi công cộng" (Public domain), "Được sao chép tự do" (Free to copy)); WHEN the licence is `UNKNOWN` THE SYSTEM SHALL show no licence line, and SHALL show `license_note` (the source's own statement) when there is one; a licence never hides a version. (BR-STR-07, FR-STR-004) — drift: the licence is shown as the raw code (`CC0-1.0`), `license_note` is not shown, and the facts appear only under the reader.
19. WHEN `review_status` is `UNREVIEWED`, THE SYSTEM SHALL show the one-line notice `sutra_d_unreviewed` ("Nội dung chưa được người am hiểu duyệt" (The content has not yet been checked by someone knowledgeable)) on the sutra page; any other value hides it. (BR-STR-07, FR-STR-004) — not built.
20. WHEN the text has linked Buddhas or Bodhisattvas (`deities` not empty), THE SYSTEM SHALL list them grouped by role in the order subject, speaker, mentioned (the order received), each with its name and thumbnail (placeholder when `thumbnail_url` is empty) as a link to `localizeHref('/library/buddhas/{deity_id}')`; `deities: []` shows no such section. (FR-STR-008, BR-STR-09) — not built.
21. WHEN the page is shown, THE SYSTEM SHALL show no play button, progress bar, elapsed time, "Nghe tụng" (Listen) action or "tụng theo" mode, whatever `audio_url` holds. (BR-STR-12, FR-STR-004) — drift: `SutraDetail.svelte` shows the simulated player (`SutraPlayer`) whenever `duration_minutes` is set.
    > ⚠️ Not confirmed (product): what the reading view offers while there is no audio (product Appendix A item 4) — blocks the reading controls beyond font size; the website offers nothing else until answered.
22. WHEN `GET /v1/sutras/{id}` returns 404 `SUTRA_NOT_FOUND`, THE SYSTEM SHALL return HTTP 404 with the shared "not found" screen that has a way back. (FR-STR-004, FR-STR-011) — ✓ (root `+error.svelte`).
23. WHEN `GET /v1/sutras/{id}` fails (network / 5xx / unexpected 4xx), THE SYSTEM SHALL show the shared error screen with "Thử lại" (Try again) (`err_retry`, reloads the page), HTTP 502. (FR-STR-011) — ✓ per code (`error(502)` → root `+error.svelte`).
    > ⚠️ Not confirmed (product): whether the shared error screen (HTTP 502, noindex) satisfies the error state of FR-STR-011 for a text page, or it must be a state inside the sutra page frame — same question as `deity` AC 14 and `temple` FR-TPL-006; proposed default: keep the shared screen; hand back to ba-writer in innerlamp-be.
24. WHEN the page also lists other texts ("Kinh sách khác" (Other texts), same tradition, up to 4, from a second `GET /v1/sutras?tradition=`), THE SYSTEM SHALL hide that block on failure and still render the page. (platform) — ✓ per code.
    > ⚠️ Not confirmed (product): whether the sutra page keeps a block of other texts of the same tradition — it is not in FR-STR-004 and costs one extra backend call per page; proposed default: keep until answered; hand back to ba-writer in innerlamp-be.

### Reading view `/library/sutras/[slug]/read`

25. WHEN the visitor opens the reading view with no `?translation=`, THE SYSTEM SHALL open the version chosen by BR-STR-05 from the `translations` of `GET /v1/sutras/{id}` (Vietnamese versions first: translation, then chant, then meaning, then poem, ties in source order), whatever the site locale; WHEN `?translation=` is not one of the keys THE SYSTEM SHALL redirect 307 to the URL without it. (FR-STR-005, BR-STR-05) — drift: `defaultTranslation` ranks Vietnamese before English before the rest but treats chant, meaning and poem alike (source order among them), and the reader is not a separate route.
    > ⚠️ Not confirmed (product): which version opens for the ten Vajrayāna texts that have no Vietnamese version (product Appendix A item 5, not covered by the vector file) — blocks the opening version of those texts; today the code opens English, then the first version in source order.
26. WHEN the version has `sections`, THE SYSTEM SHALL show a table of contents built from the contract `sections` (`name`, `start_n`, `line_count`), numbered in order, and SHALL show one section at a time with previous / next section links; a version without sections shows no table of contents and is read in consecutive chunks of lines. (FR-STR-005 §3.6, BR-STR-06) — drift: the table of contents is derived from the lines already loaded (`groupChapters`), and a text with no sections is a single chapter.
27. WHEN the visitor chooses a section in the table of contents (a link to `?translation=<key>&part=<n>`, 1-based, no JS needed), THE SYSTEM SHALL show that section from its first line (`start_n`); an invalid `?part=` redirects 307 to the first section. (FR-STR-005) — drift: the chapter is chosen with a client-side button (`index` state), not a URL.
28. WHEN the reading view opens, THE SYSTEM SHALL request only the backend page(s) of lines that hold the first lines of the chosen section (one `GET /v1/sutras/{id}/lines` call at the page size the website chose) and SHALL NOT load the whole version; WHEN a section continues past the loaded lines THE SYSTEM SHALL load the next lines as the visitor reads (a "Tải tiếp" (Load more) control and, after mount, loading when it scrolls into view) through the browser-facing endpoint `GET /api/sutras/{id}/lines`, keeping the same `page_size` between pages. (FR-STR-005, NFR-STR-01, BR-STR-06) — drift: `loadLines` fetches up to 20 pages of 500 lines in sequence before the page renders (`MAX_LINE_PAGES`).
29. WHEN the lines are shown, THE SYSTEM SHALL show them exactly as received, in order, without correcting spelling, re-wrapping words or translating, and SHALL NOT use a line number from one version to find a line in another. (BR-STR-06) — ✓ (`whitespace-pre-line`, no processing).
30. WHEN the visitor switches version (links `?translation=<key>`), THE SYSTEM SHALL open that version at the first line of its first section and show the table of contents of that version; WHEN the text has one version THE SYSTEM SHALL show no switch. (FR-STR-006, BR-STR-05) — ✓ for the switch links and the single-version case on the page; the table of contents of the chosen version follows AC 26.
    > ⚠️ Not confirmed (product): how a version is named to a visitor (product Appendix A item 6 — "Bản dịch", "Phiên âm Hán-Việt", "Dịch nghĩa", "Thơ", plus the language); the website uses `translationLabel` today ("Tiếng Việt · Bản dịch" (Vietnamese · Translation), variants `sutra_variant_*`) — blocks the version names; keep the code's labels until answered.
31. WHEN the visitor presses "A−" / "A+" (or picks a size), THE SYSTEM SHALL choose one of four font sizes, apply it at once, store it on the device in the same `settings.value.font` the settings page uses, and apply it to every later text; the settings row `set_font` offers the same four sizes and shows the one chosen in the reading view. (FR-STR-007, BR-STR-11) — drift: three sizes (`font: 0 | 1 | 2`, 17 / 20 / 24 px), already stored in `il-settings` and shared with `SettingsForm`.
    > ⚠️ Not confirmed (product): the names and sizes of the four font sizes (product Appendix A item 11) — blocks the keys `set_font_*` and the pixel sizes; proposed in `design.md`: "Nhỏ" (Small) / "Vừa" (Medium) / "Lớn" (Large) / "Rất lớn" (Extra large), 17 / 20 / 24 / 28 px.
32. WHEN the reading view is shown, THE SYSTEM SHALL use the reading background of the site's light or dark appearance (the `theme` state) and SHALL NOT offer a separate light / dark toggle in the reader. (FR-STR-007, BR-STR-11) — drift: the reader has its own "Sáng / Tối" (Light / Dark) toggle (`dark` state, not remembered, fixed colours).
33. WHEN the reading view is shown, THE SYSTEM SHALL show no elapsed time, progress bar or play control. (BR-STR-12) — drift: see AC 21.
34. WHEN `GET /v1/sutras/{id}/lines` fails in the reading view, THE SYSTEM SHALL show the error state of the text area with a "Thử lại" (Try again) link button to the current URL, keep the table of contents and the version links, and show no sample text; for a "Load more" failure it SHALL keep the lines already shown and offer "Thử lại" next to the control. (FR-STR-011, NFR-STR-01) — drift: shows `sutra_d_text_error` text without a retry.
35. WHEN the chosen version has no lines (`line_count: 0`) or the text has no version, THE SYSTEM SHALL show `sutra_d_no_text`. (FR-STR-005) — ✓.
36. WHEN the reading view is shown, THE SYSTEM SHALL show the source line of the chosen version (translator, source link) as on the sutra page and a link back to `localizeHref('/library/sutras/{id}')`. (BR-STR-07) — drift: source line only (with the raw licence code).

### Quote of the day (`/`, `/lunar/day`)

37. WHEN the home page or the lunar-day page shows the verse block, THE SYSTEM SHALL show the quote with number `(dayOfYear(date) mod 300) + 1` for the Gregorian date of that view (the device date for "today", the solar date of the chosen day on `/lunar/day`), the verse text and its attribution (Kinh Pháp Cú, translator, chapter, verse number), the same one however often the page is opened that day; the day of the year is computed from the local calendar fields of the date, not from UTC. (FR-STR-010, BR-STR-10) — drift: `HomeHero.svelte` picks one of four fixed lines by `(lunar.day + lunar.month) % 4`; `DayOverview.svelte` picks one of `VERSE_COUNT` fixed lines by `(lunar.day + lunar.month) % VERSE_COUNT + 1`.
38. WHEN the quote number is computed, THE SYSTEM SHALL read the 300 quotes from a file bundled with the website (not from messages), numbered 1..300 by `stt`, and SHALL give the same quote as every other platform for the same date. (BR-STR-10, FR-STR-010) — not built.
    > ⚠️ Not confirmed (product): where the 300 quotes live — bundled in each client and the website, or served by the backend (product Appendix A item 3) — blocks the single source of the quote file; proposed default: a pinned copy of the Android asset `sutra_quotes_300.json` refreshed by a script, never hand-edited.
39. WHEN the visitor is on the home page and picks another day in the week strip, THE SYSTEM SHALL show the quote of the picked day's solar date in the verse block. (FR-STR-010, BR-STR-10) — see the question below.
    > ⚠️ Not confirmed (product): whether the website home verse block always shows today's quote (FR-STR-010 "the home view … for that date") or follows the day picked in the week strip as the block does today — blocks `HomeHero.svelte`; proposed default: follow the picked day (the block sits in that day's panel); hand back to ba-writer in innerlamp-be.
40. WHEN the quote file cannot be read, THE SYSTEM SHALL hide the quote block and still render the rest of the page. (FR-STR-010, platform) — not built.
    > ⚠️ Not confirmed (product): what the quote block shows when the quote file cannot be read — a built-in fallback line or nothing (product Appendix A item 14) — blocks AC 40; proposed default: hide the block (a bundled file cannot fail at runtime, only at build time).
41. WHEN the quote is rendered on the server, THE SYSTEM SHALL NOT make the shown quote depend on the server's date and time zone: the quote block SHALL be computed after mount from the device date, or the server SHALL render the Vietnam date and the browser correct it after mount. (BR-STR-10, platform) — not built.
    > ⚠️ Not confirmed: which of the two ways above (blank until mount, or server date then correction) — `HomeHero.svelte` already computes `today` with `new Date()` during SSR, so the first paint can show another day near midnight; proposed default: render the block after mount only.

### General

42. WHEN any string of the feature is shown (including `alt`, `aria-label`, `<title>`, meta, empty and error states), THE SYSTEM SHALL take it from Paraglide `m.*` with the key present in both `messages/vi.json` and `messages/en.json`; the content (titles, summaries, lines, translator and source names, quote text and attribution) is shown verbatim from the backend or the quote file. (platform) — ✓ for the keys in use.
43. WHEN calling the backend, THE SYSTEM SHALL only call from the SvelteKit server via `$lib/server/api/sutras.ts` with `x-api-key` (the browser reaches lines only through `/api/sutras/{id}/lines`); no route of the feature reads the session cookie. (platform, BR-STR-13) — ✓ for the list and the page; the lines endpoint is not built.
44. WHEN a sutra or list page is served, THE SYSTEM SHALL keep it a public indexable page with canonical query URLs (AC 8, 9, 25, 27), one `<h1>`, `<svelte:head>` title and description from keys, and the breadcrumbs of `src/lib/config/breadcrumbs.ts` (list → sutra → reading). (platform) — ✓ for the list and the page; the reading view has no breadcrumb yet.
45. WHEN the deity page lists the sutras of a Buddha or Bodhisattva (the `deity` spec calls `GET /v1/deities/{id}/sutras`), THE SYSTEM SHALL open `localizeHref('/library/sutras/{sutra.id}')` for each item, so the route and the slug of the sutra page stay stable; the order of that list is the backend's (subject, speaker, mentioned, then library order) and is not re-sorted here. (FR-STR-009, BR-STR-09) — ✓ (route exists; the block itself is `deity` AC 21, not built).

## Data & API (called from the SvelteKit server)

Common header: `x-api-key` from `API_KEY`; no Bearer (public routes).

| Action | Operation (openapi) | Called from | Notes |
| --- | --- | --- | --- |
| List, filter, search | `GET /v1/sutras?page=&tradition=&purpose=&daily=&max_minutes=&q=` | `load` of `library/sutras/+page.server.ts` | One call per list request; `kind`, `collection`, `lang` are not used by the website |
| Sutra page | `GET /v1/sutras/{id}` | `load` of `library/sutras/[slug]/+page.server.ts` | `translations[].sections`, `review_status`, `deities`, source and licence fields |
| Other texts of the tradition | `GET /v1/sutras?tradition=` | same `load`, in parallel | Up to 4, own id removed (⚠️ AC 24) |
| Reading view | `GET /v1/sutras/{id}` then `GET /v1/sutras/{id}/lines?translation=&page=&page_size=` | `load` of `library/sutras/[slug]/read/+page.server.ts` | Page(s) holding the first lines of the section; `translation` required, `page_size` constant between pages |
| Load more lines | `GET /v1/sutras/{id}/lines` | `src/routes/api/sutras/[id]/lines/+server.ts` (browser-facing proxy) | New; keeps `API_BASE_URL` / `API_KEY` on the server |
| Sutras of a deity | `GET /v1/deities/{id}/sutras` | `deity` spec | Not this spec |
| Quote of the day | none | — | Bundled file (⚠️ AC 38) |

## Error → UI mapping

| Operation | Failure case | Visitor sees | Current code state |
| --- | --- | --- | --- |
| `GET /v1/sutras` | network / 5xx / unexpected 4xx | Error state `sutras_error_*` + `err_retry`, chips and search stay (AC 12) | drift — only `sutras_load_error` |
| `GET /v1/sutras` | `total: 0` | Empty state by cause: library empty / chips / search (AC 13) | drift — one `sutras_empty` line |
| `GET /v1/sutras` | 400 `INVALID_PAGE` / `INVALID_FILTER` (the website normalises the URL first so this does not happen) | as network / 5xx (log the error code) | ✓ (falls into the general error branch) |
| `GET /v1/sutras` | page past the end | 307 to the last page | ✓ |
| `GET /v1/sutras/{id}` | 404 `SUTRA_NOT_FOUND` | HTTP 404, `err_404_*` (to home / go back) | ✓ |
| `GET /v1/sutras/{id}` | network / 5xx | `err_data_*` + `err_retry` (root error screen, ⚠️ AC 23) | ✓ |
| `GET /v1/sutras?tradition=` (other texts) | any failure | Page still shows, without "Kinh sách khác" (AC 24) | ✓ |
| `GET /v1/sutras/{id}/lines` (reading view load) | network / 5xx | Text-area error + `err_retry` link, table of contents stays (AC 34) | drift — message only |
| `GET /v1/sutras/{id}/lines` | 404 `TRANSLATION_NOT_FOUND` / `SUTRA_NOT_FOUND` | 307 to the default version when the key came from the URL; 404 when the text is gone | drift — handled as "text could not be loaded" |
| `GET /v1/sutras/{id}/lines` | 400 `INVALID_PAGE` / `INVALID_PAGE_SIZE` (only by a programming error) | as network / 5xx (log the error code) | ✓ (falls into the general error branch) |
| `GET /api/sutras/{id}/lines` (load more) | any failure | Lines already shown stay; "Thử lại" (Try again) beside the control (AC 28, 34) | not built |
| Quote file | cannot be read | Quote block hidden (AC 40) | not built |
| every page | browser offline | `OfflineGate` (`offline_*`) | ✓ |

## Out of scope

- The library hub `/library` and its sample tiles, the downloads view (product §1.2): later `library` and `downloads` specs.
- Audio, chant-along playback, offline download, bookmarks, favourites, reading progress, chanting history (product §1.2; each needs an ADR first).
- Full-text search inside the text; sharing a verse card; a back office for texts.
- The deity page's "Kinh liên quan" (Related sutras) block (`deity` spec, AC 21, 22).
- The operator content load (FR-STR-012) and NFR-STR-03 (backend).
- Languages other than Vietnamese for titles and versions (BR-STR-05).
- `/vi/...` canonicalisation and sitemap (site-wide follow-up).

## Pending (not yet implemented)

- Vietnamese-first titles, kind label, citation code, "khoảng N phút", daily mark on the card — Phases 1, 2.
- Topic chips with the ten purposes, duration chips, search (`?topic=`, `?max=`, `?q=`), legacy `?filter=` redirect — Phases 1, 2, 3.
- Error / empty (by cause) / loading states — Phase 1.
- Sutra page facts, licence label, unreviewed notice, linked Buddhas and Bodhisattvas, "Đọc kinh" — Phases 1, 3.
- Separate reading view, table of contents from `sections`, section in the URL, lines loaded per section, load-more endpoint — Phases 1, 2, 3.
- Variant order of the opening version — Phase 2.
- Four font sizes shared with the settings, one reader background — Phases 1, 2.
- Removing the simulated player and the local dark toggle — Phase 1.
- Quote of the day (300 quotes) in `HomeHero` and `DayOverview` — Phases 1, 2, 3.
- Tests, measuring NFR-STR-01 / NFR-STR-02 — Phase 4.

## Open questions (resolved)

- ~~Page size, order, filters, search, language, font sizes, licence display, quote rule, audio, access~~ → decided in product v1.0 (anh Đức, 2026-10-15). Resolved 2026-10-16.
- ~~Website pagination~~ → page numbers, a page past the end goes to the last page (product §3.6 row FR-STR-001); kept as in code. Resolved 2026-10-16.
- ~~Whether the website reader shows one section at a time~~ → yes (product §3.6 row FR-STR-005); kept as in code. Resolved 2026-10-16.
