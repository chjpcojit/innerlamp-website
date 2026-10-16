# Design — sutra (Kinh sách — Sutra library)

Version: 1.0
Last updated: 2026-10-16
Status: in-progress (drift) — mirror `requirements.md`

> See `changelog.md` in this folder for the version history of this spec.

## Overview

Four public surfaces, none reads the session cookie: the list `/library/sutras` (`?topic=`, `?max=`,
`?q=`, `?page=`), the sutra page `/library/sutras/[slug]`, the reading view
`/library/sutras/[slug]/read` (`?translation=`, `?part=`) and the quote-of-the-day blocks on `/` and
`/lunar/day`. Data takes the standard path: browser → `load` in `+page.server.ts` →
`$lib/server/api/sutras.ts` → backend (`x-api-key`); the only browser-side backend call is "load more
lines" through `src/routes/api/sutras/[id]/lines/+server.ts`. Same architecture as `temple` and
`deity` (URL-driven directory, detail page via `load`); the quote needs no backend (a bundled file).
New code (chip definitions, query mapping, version choice, quote number, reader state) goes into
`src/lib/features/sutra/`; the two existing sections keep their names and places, and the reading view
is split out of `SutraDetail.svelte` into a new `SutraReader.svelte`.

Platform decisions (not product decisions): the reading view is its own route so the long text never
loads with the sutra page (FR-STR-004 "Đọc kinh" opens it); the chapter and the version are in the URL
(shareable, no JS needed); search is a `GET` form.

## Layers & components

| Layer | File | Responsibility | Status |
| --- | --- | --- | --- |
| Route (UI) | `src/routes/(site)/library/sutras/+page.svelte` | Meta, `SutraCatalog` | exists |
| Route (server) | `src/routes/(site)/library/sutras/+page.server.ts` | Normalise `?page` / `?topic` / `?max` / `?q` (307), legacy `?filter=` → `?topic=`, map to `SutraListQuery` (Step L1), call `listSutras`, past the end → 307 last page, failure → `sutras: null` | exists — needs: `?topic` / `?max` / `?q`, legacy redirect, keep all parameters on the past-the-end redirect, pass `q` |
| Route (UI) | `src/routes/(site)/library/sutras/[slug]/+page.svelte` | Meta, `SutraDetail` (sutra page only) | exists — needs: title `titles.vi`, no reader props |
| Route (server) | `src/routes/(site)/library/sutras/[slug]/+page.server.ts` | `getSutra` ∥ `loadRelated` (Step P1); 404 → `error(404)`; other failure → `error(502)` | exists — needs: drop `loadLines` / `?translation=` handling (moved to the reading view) |
| Route (UI) | `src/routes/(site)/library/sutras/[slug]/read/+page.svelte` | Meta (`<title>` = title · `app_name`), breadcrumbs, `SutraReader` | not created |
| Route (server) | `src/routes/(site)/library/sutras/[slug]/read/+page.server.ts` | `getSutra`, version choice (BR-STR-05), `?part` → section, first `listSutraLines` page (Step R1–R2); unknown `?translation` / `?part` → 307 | not created |
| Route (server) | `src/routes/api/sutras/[id]/lines/+server.ts` | Browser-facing proxy of `GET /v1/sutras/{id}/lines` for "load more" (Step R3); error → JSON `{ error }` + status | not created |
| Section | `src/lib/components/sections/SutraCatalog.svelte` | Title + count, search form, topic chips, duration chips, cards, `Pagination`, error / empty / loading states | exists — needs: everything except the grid and `Pagination` |
| Section | `src/lib/components/sections/SutraDetail.svelte` | Sutra page: header, "Đọc kinh", facts, versions with sources / licence, unreviewed notice, linked Buddhas and Bodhisattvas, other texts | exists — needs: split reader out, add facts / notice / deities, remove `SutraPlayer` |
| Section | `src/lib/components/sections/SutraReader.svelte` | Reading view: version links, table of contents, one section, prev / next, font size, load-more, source line, back link | not created (extracted from `SutraDetail.svelte`) |
| UI | `src/lib/components/ui/SutraCover.svelte` | Card cover: tradition label, title (Vietnamese), alt title | exists — needs: `titles.vi`, kind label, daily mark (or a new `SutraCard` in the feature folder) |
| Feature UI | `src/lib/features/sutra/components/SutraFilters.svelte` | Search form + topic chips + duration chips (links, `aria-current`), "clear" link | not created |
| Feature UI | `src/lib/features/sutra/components/SutraState.svelte` | Error / empty (library / chips / search) / loading, with `err_retry` link | not created |
| Feature UI | `src/lib/features/sutra/components/SutraDeities.svelte` | Linked Buddhas and Bodhisattvas by role | not created |
| Feature UI | `src/lib/features/sutra/components/SutraVersions.svelte` | Versions with translator, source link, licence label, `license_note` | not created |
| Feature UI | `src/lib/features/sutra/components/QuoteOfDay.svelte` | Verse text + attribution for a date; used by `HomeHero` and `DayOverview` | not created |
| Feature logic | `src/lib/features/sutra/filters.ts` | `TOPICS` (URL value → label key → query: `daily` / `purpose` / `tradition`), `DURATIONS` (5, 15, 30, 60), `parseListParams(url)` → canonical params + `SutraListQuery`, `canonicalListUrl(params)`, `cleanTerm(raw)` (trim, cut to 100) | not created |
| Feature logic | `src/lib/features/sutra/version.ts` | `defaultTranslation(translations)` per BR-STR-05 (replaces the one in `utils/sutra.ts`), `sectionPage(section, pageSize)` → backend page number, `sectionLines(items, section)` | not created |
| Feature logic | `src/lib/features/sutra/quote.ts` | `dayOfYear(date)` (local fields), `quoteNumber(date, count)`, `quoteForDate(date)` over the bundled file | not created |
| Feature state | `src/lib/features/sutra/state/loadMore.svelte.ts` | Runes state for load-more: lines, next page, one request in flight, error flag, retry | not created |
| Feature content | `src/lib/features/sutra/data/sutra-quotes-300.json` | The 300 quotes (`stt`, `kinh`, `dich_gia`, `pham_so`, `pham_ten`, `ke_so`, `noi_dung`), a pinned copy synced by a script, never hand-edited (⚠️ product Appendix A item 3) | not created |
| Shared util | `src/lib/utils/time.ts` (`formatClock`) | `formatClock` moved here from `state/sutra-player.svelte.ts`; `TalkDetail.svelte` imports it from here | not created |
| Section | `src/lib/components/sections/HomeHero.svelte`, `DayOverview.svelte` | Replace the fixed verse lists by `QuoteOfDay` for the selected / shown solar date | exists — needs: change (AC 37, 39) |
| Section | `src/lib/components/sections/SettingsForm.svelte` | Row `set_font` with four options | exists — needs: fourth option |
| State | `src/lib/state/settings.svelte.ts` | `font: 0 \| 1 \| 2 \| 3`; stored values 0..2 stay valid; an out-of-range stored value falls back to 1 | exists — needs: type and guard |
| API resource | `src/lib/server/api/sutras.ts` | `listSutras`, `getSutra`, `listSutraLines` | exists — needs: `q` and `max_minutes` documented in the query; comment "Fixed by the backend (20)" and "editorial order (Nam Tông, Bắc Tông, Kim Cang Thừa)" corrected |
| Types | `src/lib/types/sutra.ts` | DTOs; `SutraFilter` replaced by `SutraTopic`; `license` already typed; `SutraPage.page_size` comment | exists — needs: `SutraTopic`, comment |
| Utils | `src/lib/utils/sutra.ts` | `traditionLabel`, `traditionCover`, `sutraTitle` (to `titles.vi`), `sutraAltTitle`, `sutraMeta`, `translationLabel`; add `kindLabel`, `purposeLabel`, `licenseLabel` | exists — needs: as listed; remove `defaultTranslation` and `groupChapters` once the reader uses the contract `sections` |
| State (remove) | `src/lib/state/sutra-player.svelte.ts` | Simulated player | remove (BR-STR-12, AC 21); `formatClock` moves first |
| Static content | `src/lib/content/library.ts` `LIBRARY_ITEMS` | Sample tiles of `/library` | untouched (later `library` spec); not a sutra source |
| Static content | `verse_1..4`, `verse_*_src` in messages, `VERSES` in `HomeHero.svelte`, `VERSE_COUNT` and the `verse` logic in `DayOverview.svelte`, `home_verse` | Fixed verse lines | remove after the quote replaces them (`grep` first; `home_verse` looks unused) |
| Config | `src/lib/config/breadcrumbs.ts` | Add `/library/sutras/[slug]/read` (list → sutra → reading) | exists — needs: the reading crumb |
| i18n | `messages/vi.json`, `messages/en.json` | "i18n keys" table | to change / add |
| Tests | `src/lib/features/sutra/{filters,version,quote}.spec.ts`, `src/routes/(site)/library/sutras/page.server.spec.ts`, `tests/sutra.e2e.ts` | Per `il-testing`, vectors from innerlamp-be | not created |

## Route & navigation flow

```
/library/sutras[?topic=T][&max=M][&q=Q][&page=N]
  ├─ bad ?page / ?topic / ?max / ?q, legacy ?filter= ──▶ 307 canonical URL
  ├─ page > total_pages ───────────────────────────────▶ 307 ?page=total_pages (keep all parameters)
  ├─ topic chip ───────────────────────────────────────▶ ?topic=… (page 1, keep max and q)
  ├─ duration chip ────────────────────────────────────▶ ?max=… (page 1, keep topic and q)
  ├─ search submit (GET form) ─────────────────────────▶ ?q=… (page 1, keep topic and max)
  ├─ page number ──────────────────────────────────────▶ ?page=N (keep the rest)
  ├─ card ─────────────────────────────────────────────▶ /library/sutras/{id}
  └─ error: "Thử lại" ▶ same URL (GET) · empty: "clear" ▶ /library/sutras

/library/sutras/{id}
  ├─ 404 ───────────────▶ +error.svelte (err_404_*)
  ├─ other failure ─────▶ +error.svelte (err_data_*, "Thử lại" = reload)
  ├─ "Đọc kinh" ────────▶ /library/sutras/{id}/read
  ├─ Buddha / Bodhisattva ▶ /library/buddhas/{deity_id}
  ├─ source link ───────▶ external (new tab, noopener noreferrer)
  └─ other text ────────▶ /library/sutras/{other id}

/library/sutras/{id}/read[?translation=K][&part=N]
  ├─ unknown ?translation / ?part ──▶ 307 canonical URL
  ├─ version link ──────▶ ?translation=K (first section)
  ├─ table of contents ─▶ ?translation=K&part=N
  ├─ prev / next ───────▶ ?part=N∓1
  ├─ "Tải tiếp" / scroll ▶ (browser) GET /api/sutras/{id}/lines
  └─ back ──────────────▶ /library/sutras/{id}

/  ,  /lunar/day?date=…
  └─ verse block ───────▶ quote for the Gregorian date (no link)
```

Every internal href goes through `localizeHref()` (query-only links keep the current localised path,
as `Pagination` does).

## Step-by-step Flow — List

```
Step L1 — Normalise the URL and map the chips (this feature)
- Trigger: request GET /library/sutras
- Pre-condition: —
- Where: library/sutras/+page.server.ts `load`, via `parseListParams(url)`
- API: no call
    - ?page not an integer ≥ 1, unknown ?topic / ?max, empty or over-long ?q (cut to 100 after trim),
      legacy ?filter=<mahayana|theravada|vajrayana|daily> → 307 canonical URL (legacy value → ?topic=)
    - valid → query = { page, tradition | purpose | daily, max_minutes, q } → Step L2

Step L2 — Read one page (this feature)
- Trigger: after Step L1
- Pre-condition: page ≥ 1; at most one topic; max ∈ {5, 15, 30, 60} or absent; q 1–100 characters or absent
- Where: same `load`
- API: GET /v1/sutras?page=N[&tradition=|&purpose=|&daily=true][&max_minutes=][&q=] (one call; no sorting parameter)
    - Success, items > 0 → { sutras, params }
    - Success, items = [] and page > 1 and total_pages > 0 → 307 ?page=total_pages (keep all parameters)
    - Success, total = 0 → empty state by cause (library empty / chips / search)
    - Failure (any ApiError, incl. 400 INVALID_FILTER) → { sutras: null } → error state with "Thử lại" (Try again)
    - Failure (not an ApiError) → rethrow (programming error)
```

## Step-by-step Flow — Sutra page

```
Step P1 — Read the sutra and other texts, in parallel (this feature)
- Trigger: request GET /library/sutras/{id}
- Pre-condition: —
- Where: library/sutras/[slug]/+page.server.ts `load` (Promise.all; `loadRelated` never throws an ApiError)
- API: GET /v1/sutras/{id}  ∥  GET /v1/sutras?tradition=<its tradition> (page 1, own id removed, first 4)
    - Detail success → sutra (facts, `translations[]` with source / licence / sections, `deities[]`,
      `review_status`)
    - Detail 404 SUTRA_NOT_FOUND → error(404)
    - Detail other failure → error(502) → root error screen with "Thử lại" (Try again) (⚠️ requirements AC 23)
    - Other texts failure → related = [], the page still renders (⚠️ requirements AC 24)
```

## Step-by-step Flow — Reading view

```
Step R1 — Read the sutra and choose the version and section (this feature)
- Trigger: request GET /library/sutras/{id}/read
- Pre-condition: —
- Where: library/sutras/[slug]/read/+page.server.ts `load`
- API: GET /v1/sutras/{id}
    - 404 → error(404); other failure → error(502)
    - ?translation absent → `defaultTranslation(translations)` (BR-STR-05); present but not a key → 307 URL without it
    - ?part absent → section 1; not an integer in 1..sections.length (or the version has no sections and ?part
      is present) → 307 URL without it

Step R2 — Read the first lines of the section (this feature)
- Trigger: after Step R1
- Pre-condition: a version is chosen; `pageSize` = `SUTRA_LINES_PAGE_SIZE` kept constant for the whole view
- Where: same `load`
- API: GET /v1/sutras/{id}/lines?translation=K&page=P&page_size=S, with P = `sectionPage(section, S)`
  (the backend page holding the section's `start_n`; page 1 when the version has no sections)
    - Success → lines of that page, cut to the section (`start_n` .. `start_n + line_count - 1`);
      `next` = the next page number while the section continues past the page and `P < total_pages`
    - Success, version without lines → `sutra_d_no_text`
    - Failure 404 TRANSLATION_NOT_FOUND → 307 URL without ?translation (race with a content change)
    - Failure (other) → text-area error + "Thử lại" (Try again) link; table of contents and version links stay

Step R3 — Load more lines (this feature, browser)
- Trigger: the visitor presses "Tải tiếp" (Load more), or, after mount, the control scrolls into view
- Pre-condition: `next` is set; no other load more request in flight
- Where: `SutraReader.svelte` + `state/loadMore.svelte.ts` → `GET /api/sutras/{id}/lines?translation=K&page=P&page_size=S`
  → `+server.ts` → `listSutraLines`
- API: GET /v1/sutras/{id}/lines?translation=K&page=P&page_size=S (same S as Step R2)
    - Success → append lines cut to the section; `next` advances or clears
    - Failure → keep the lines shown, show "Thử lại" (Try again) next to the control; the retry calls the same page

Step R4 — Change font size (this feature, browser)
- Trigger: the visitor presses "A−" / "A+"
- Where: `SutraReader.svelte` → `settings.set('font', n)` (localStorage `il-settings`)
- API: no call
    - Applies at once; the settings page row `set_font` reads the same value; the next text opens at it
```

Why a section is cut from a backend page: `lines` is paged by `page` and `page_size` with no "from line"
parameter, and lines are numbered 1..N without gaps (BR-STR-06), so the page holding line `n` is
`ceil(n / page_size)`. `page_size` must stay constant between pages.

## Quote of the day

Pure, no backend. `quoteNumber(date, count) = (dayOfYear(date) mod count) + 1` with
`dayOfYear` from the date's local year, month and day (not `toISOString`), `count` = 300 (the length of
the bundled file). `QuoteOfDay` takes a `Date`:

- `DayOverview.svelte`: the `date` prop (solar date of the chosen day).
- `HomeHero.svelte`: `sel.date` of the week strip (⚠️ requirements AC 39).
- SSR: render the block after mount only (default of ⚠️ requirements AC 41), so the first paint never
  shows a quote for the server's date.
- File unreadable (only possible at build time for a bundled file): block hidden (AC 40).

## Session & cookies

Not used. Every route of the feature is public; none reads `il_token`, none changes `locals.user`. The
font size is a per-device preference in `localStorage` (`il-settings`), as today.

## SEO

`/library/sutras`, `/library/sutras/[slug]` and `/library/sutras/[slug]/read` are public, indexable
pages; the query parameters of Step L1 and R1 are canonical (307 to the clean form). The root error
screen is already `noindex`. No prerendering (the library changes when the operator reloads it). The
reading view is a long page of source text: no extra structured data.

## i18n keys

Vietnamese is quoted from the proposal below with an English gloss; copy is a ⚠️ product item
(Appendix A items 10, 11) and these texts stand until changed. Keys are `snake_case`, both files.

| Key | Used in | ID | Change |
| --- | --- | --- | --- |
| `sutras_page_sub` | List subtitle | FR-STR-001 | change vi "{count} bộ kinh" → "{count} bản kinh" (N texts); en "{count} texts" |
| `sutras_minutes` | Card and page duration | BR-STR-08 | change vi "{minutes} phút tụng" → "khoảng {minutes} phút" (about N minutes); en "about {minutes} min" |
| `sutra_kind_sutra`, `sutra_kind_verse`, `sutra_kind_dharani` | Kind label | BR-STR-01 | add: vi "Kinh" (Sutra) / "Kệ" (Verse) / "Chú" (Mantra) |
| `sutra_tradition_*` | Tradition label | BR-STR-01 | keep (vi "Nam Tông" / "Bắc Tông" / "Kim Cang Thừa") |
| `sutras_tab_all`, `sutras_tab_daily` | Topic chips "Tất cả" (All), "Hằng ngày" (Daily) | BR-STR-03 | keep `sutras_tab_all`; change `sutras_tab_daily` vi "Nhật tụng" → "Hằng ngày" |
| `sutras_tab_mahayana`, `sutras_tab_theravada`, `sutras_tab_vajrayana` | Old tradition chips | — | delete; the chips reuse `sutra_tradition_*` |
| `sutra_purpose_cau_an` … `sutra_purpose_quy_y_tho_gioi` (10) | Purpose chips | BR-STR-03 | add: vi "Cầu an", "Cầu siêu", "Trì chú", "Sám hối", "Hồi hướng", "Phát nguyện", "Báo hiếu", "Thiền định", "Học giáo lý", "Quy y thọ giới" |
| `sutras_filter_label` | `aria-label` of the topic chips | BR-STR-03 | change vi "Lọc theo truyền thống" → "Lọc theo chủ đề" (Filter by topic) |
| `sutras_duration_label`, `sutras_duration_all`, `sutras_duration_max` | Duration chips "Tất cả" (All), "Tối đa {minutes} phút" (Up to N minutes) | BR-STR-03 | add |
| `sutras_search_label`, `sutras_search_placeholder`, `sutras_search_submit`, `sutras_search_clear` | Search form | BR-STR-04 | add: vi label "Tìm kinh" (Search sutras), placeholder "Tìm theo tên kinh" (Search by name) |
| `sutras_daily_mark` | Daily-chanting mark on the card | BR-STR-03 | add: vi "Hằng ngày" |
| `sutras_error_title`, `sutras_error_hint` | List error state | FR-STR-011 | add (replaces `sutras_load_error`) |
| `sutras_empty_library`, `sutras_empty_filters`, `sutras_empty_search`, `sutras_empty_clear` | Empty states by cause | FR-STR-011 | add (replaces `sutras_empty`) |
| `err_retry` | "Thử lại" (Try again) | FR-STR-011 | reuse |
| `sutra_d_read` | "Đọc kinh" (Read the sutra) action | FR-STR-004 | add |
| `sutra_d_unreviewed` | Notice | BR-STR-07 | add: vi "Nội dung chưa được người am hiểu duyệt" (The content has not yet been checked by someone knowledgeable) |
| `sutra_d_original_title`, `sutra_d_author`, `sutra_d_han_translator`, `sutra_d_reference_note` | Facts labels | BR-STR-07 | add |
| `sutra_d_translator`, `sutra_d_source` (keep), `sutra_d_license` | Version facts labels | BR-STR-07 | add / keep |
| `sutra_license_cc0`, `sutra_license_cc_by_nc`, `sutra_license_public_domain`, `sutra_license_copy_allowed` | Licence label (`UNKNOWN` has no key and no line) | BR-STR-07 | add: vi "CC0", "CC BY-NC 4.0", "Phạm vi công cộng" (Public domain), "Được sao chép tự do" (Free to copy) |
| `sutra_d_deities`, `sutra_d_role_subject`, `sutra_d_role_speaker`, `sutra_d_role_mentioned`, `sutra_d_deity_placeholder` | Linked Buddhas and Bodhisattvas | BR-STR-09 | add: vi "Chư Phật & Bồ Tát liên quan" (Related Buddhas & Bodhisattvas), "Chủ đề" (Subject), "Thuyết kinh" (Speaker), "Được nhắc đến" (Mentioned) |
| `sutra_d_related` | Other texts | — | keep |
| `sutra_d_translations`, `sutra_variant_*` | Version links | FR-STR-006 | keep (⚠️ names, requirements AC 30) |
| `sutra_d_toc`, `sutra_d_toc_label`, `sutra_d_part_of`, `sutra_d_prev`, `sutra_d_next` | Reader navigation | FR-STR-005 | keep |
| `sutra_d_load_more`, `sutra_d_load_more_error` | Load more | FR-STR-005 | add: vi "Tải tiếp" (Load more) |
| `sutra_d_back` | Reader back link to the sutra page | FR-STR-005 | add |
| `sutra_d_font_down`, `sutra_d_font_up` | A− / A+ | FR-STR-007 | keep |
| `set_font`, `set_font_sub`, `set_font_small`, `set_font_medium`, `set_font_large` | Settings row | BR-STR-11 | keep; add `set_font_xlarge` (vi "Rất lớn" (Extra large)) |
| `sutra_d_no_text`, `sutra_d_text_error` | Reader empty / error | FR-STR-011 | keep `sutra_d_no_text`; `sutra_d_text_error` gets the retry link |
| `sutra_d_listen`, `sutra_d_resume`, `sutra_d_pause`, `sutra_d_player`, `sutra_d_progress` | Simulated player | BR-STR-12 | delete |
| `sutra_d_mode_label`, `sutra_d_mode_light`, `sutra_d_mode_dark` | Reader's own dark toggle | BR-STR-11 | delete |
| `sutra_d_meta_description` | Sutra page meta | — | change vi "…đọc kinh văn và nghe tụng…" → no mention of listening; `sutras_meta_description` likewise ("đọc và nghe tụng") |
| `quote_source` | Quote attribution line ("Kinh Pháp Cú · {translator} · {chapter}, kệ {verse}") | BR-STR-10 | add (the text parts come from the file) |
| `verse_1` … `verse_4`, `verse_*_src`, `home_verse` | Fixed verse lines | — | delete after `QuoteOfDay` is in place (`grep` first) |

## Deliberately stubbed for now

- The quote file location (⚠️ requirements AC 38): the website pins a copy of the Android asset
  `sutra_quotes_300.json` and refreshes it with a script; if the product moves the quotes to the
  backend, `quote.ts` reads them from a new `$lib/server/api` function instead and the home / lunar-day
  `load` passes the quote down. Tasks Phase 3.
- Search as you type (⚠️ requirements AC 6): submit-based for now; no debounced navigation until the
  product answers.
- The "no result" request action "Gửi yêu cầu bản kinh" (⚠️ requirements AC 13): not offered.
- What the reading view offers instead of audio (⚠️ requirements AC 21): nothing beyond font size.
- `/library` hub tiles still show sample content (`LIBRARY_ITEMS`): later `library` spec.
