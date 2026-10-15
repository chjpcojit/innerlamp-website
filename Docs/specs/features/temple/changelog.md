# Changelog — temple Spec

Tracks version history for `requirements.md`, `design.md`, and `tasks.md` in this folder. All three
files share one changelog since they change together as one spec unit. Newest version first.

## v1.2 (2026-10-15)

Adopts product spec temple v1.2 (anh Đức's answers to the platform questions). All four files rewritten in English per the AGENTS.md Language policy (2026-10-15); earlier entries below are translated, their content unchanged.

- `requirements.md` (1.1 → 1.2): header `Product spec` @ v1.2. AC 3 now firm — when `GET /v1/temples/top` fails, the home block shows the same empty state as AC 2 (`temples_featured_empty` + "Xem tất cả"), no error text, no retry, no sample temple (FR-TPL-001 new scenario); Error → UI row updated. AC 21 — the later fields (architecture style, materials and highlights, "Kinh sách", photo set) stay visible with `temple_d_pending`; "Kinh sách" never shows `temple_d_none`; the previous website default "no photo section" is dropped and AC 19 lists the photo section (BR-TPL-06, FR-TPL-007). AC 23 — with no Rằm & Mùng Một hours the holiday row shows the normal hours (BR-TPL-09). Three `⚠️ Not confirmed (product)` markers (AC 3, AC 21, AC 23) moved to "Open questions (resolved)" with date 2026-10-15 and resolution. Status and Pending updated.
- `design.md` (1.1 → 1.2): `TempleGrid` / `loadTopTemples` rows — `null` (load failed) renders like `[]`, the sample branch goes; new section 6 "Photos" in the "Section order" table (sections renumbered 1–13), architecture rows and "Kinh sách" show `temple_d_pending`; `TempleHours` and "Open/closed status" — holiday row falls back to the normal hours, `todayRow = 'normal'`; i18n adds `temple_d_photos_title`; "Deliberately stubbed" drops the three resolved waits and records the later fields as unconditional `temple_d_pending`. Platform decision: the photo grid/lightbox is designed when the backend adds the photo set.
- `tasks.md` (1.1 → 1.2): affected tasks reworded and left `[ ]` — `TempleGrid` empty state for empty and failed `top`; remove `HOME_TEMPLE_COUNT` (10 not 7); remove sample data; `TempleHours` holiday fallback; architecture rows; "Kinh sách"; `open-status.ts`. New `[ ]` tasks: photo section, `temple_d_photos_title` key, `TempleGrid` component test, E2E for the failing `top`, the later fields and the holiday-row fallback; deferred photo grid. No task marked `[x]`.
- Product spec / contract: product v1.2 adopted (BR-TPL-06, BR-TPL-09, FR-TPL-001, FR-TPL-007); contract unchanged (openapi @ a8a016b).
- Still open: `⚠️ Not confirmed (product)` AC 1 (home card: full temple card or compact tile — not covered by v1.2); `⚠️ Not confirmed (contract)` `q`/`region`, pages of 12, the four new `TempleDetail` field groups.
- Hand-offs: `ba-writer` — the home card question (AC 1), the Website column of §4.2 (BR-TPL-06 "Website hides empty sections" is now a planned change). Backend — unchanged (openapi update per backend v2.0 Phase 13); the photo set, architecture style/materials and "Kinh sách" fields when they come.
- Reason: product spec temple v1.2 (2026-10-15).

## v1.1 (2026-10-15)

Step 4 of the documentation process: removed old temple notes after product spec v1.1 and the four platform specs were approved. No requirement or design change.

- `.assumptions.md`: deleted the "Temple detail (`/temples/[slug]`)" entry; the "Catalogue pages" entry says `/temples` now follows this spec, the note remains only for the other three pages. The code drift (follow button, offering, sample data) stays in `requirements.md` and the `[ ]` tasks.
- `tasks.md` (1.0 → 1.1): the `.assumptions.md` clean-up item marked `[x]`. `requirements.md`, `design.md` (1.0 → 1.1): no change needed, verified — header only.

## v1.0 (initial) (2026-10-15)

- `requirements.md`: first spec of the feature on the website. Retroactive for what runs (featured block on `/`, directory `/temples` by `?page=`, temple page `/temples/[id]`, proxy `/api/temples` for the temple picker — code read on 2026-10-15), prospective for what product v1.1 adds (search + region filter by URL, open/closed in Vietnam time, "Đang cập nhật"/"Không có" rows, contacts, removing "Theo dõi"). Header `Product spec` @ v1.1, `Contract` openapi @ a8a016b + backend spec v2.0 (f3bb584) for what openapi lacks, `Implements` every ID whose Website column is not `n/a`. 34 EARS criteria, each tagged `FR-TPL-*` / `BR-TPL-*` / `NFR-TPL-*` or `(platform)`; the Error → UI table has a "Current code" column.
- `design.md`: created — Layers & components table (exists / to change / not created / remove), the temple page "Section order" table per the prototype, navigation, directory Step-by-step Flow (submit filters → canonicalise URL → read page), `templeOpenStatus` design (pure function, runs in the browser), i18n add/remove table.
- `tasks.md`: created — 6 Phases; `[x]` only for what was checked in code and matches the product; a task runs `rules/temple-open-status.json`.
- Product spec / contract: adopt product v1.1 (Website column of §4.2; §3.6 rows FR-TPL-002, BR-TPL-07, FR-TPL-008, FR-TPL-005, §2.4). Contract openapi @ a8a016b has `top`, the list by `page`, `options`, the detail; `q`/`region`, pages of 12 and the four new detail field groups per backend v2.0 AC 39–46, pending openapi.
- Drift from the product (for `ba-writer`'s Website column): the home page cuts the featured temples to 7 (`HOME_TEMPLE_COUNT`) and shows 3 **sample** temples when the backend fails or is empty (BR-TPL-02, FR-TPL-001); the "Theo dõi" button stores to `localStorage` (BR-TPL-08); the temple page hides sections without data, amenities show only the available ones (BR-TPL-06); hours print the string only, no status (BR-TPL-09); "Chỉ đường" is a search URL without a destination (FR-TPL-008); unknown id → the generic 404 page (FR-TPL-006); the events empty copy differs from the product (FR-TPL-009); the directory card lacks the temple type (§3.1.1); the directory error has no "Thử lại" (FR-TPL-002); no search/filter yet (FR-TPL-003, FR-TPL-004).
- Open: `⚠️ Not confirmed (product)` — home block card full or compact (AC 1); home block when the backend fails (AC 3); later fields shown as "Đang cập nhật"/"Không có" or hidden (AC 21); the Rằm & Mùng Một row without holiday hours (AC 23). `⚠️ Not confirmed (contract)` — `q`/`region`, pages of 12, the four new field groups not in openapi.
- Hand-offs: `ba-writer` — the four product questions above; the Website column status in §4.2. Backend — update `openapi.yaml` (q, region, `INVALID_FILTER`, pages of 12, the new `TempleDetail`) per backend v2.0 Phase 13.
- Platform decisions: search/filter are URL parameters read in `load` (GET form, 300 ms debounce with JS), no extra `/api/*` endpoint; open/closed computed in the browser after mount, every minute; `?q=` gets `noindex`; new code in `src/lib/features/temple/`.
- Old docs (`.assumptions.md` "Catalogue pages" `/temples` part and "Temple detail") kept as is, cleaned up in a later step.
- Reason: product spec temple v1.1 (2026-10-15) and backend spec temple v2.0.
