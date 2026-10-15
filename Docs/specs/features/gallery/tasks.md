# Tasks — gallery (Ảnh đẹp Phật giáo — Buddhist photos)

Version: 1.0
Last updated: 2026-10-15
Status: in-progress (drift) — mirror `requirements.md`

> See `changelog.md` in this folder for the version history of this spec.

`[x]` only when checked to exist in the code on 2026-10-15 and to match product v1.0. Each item points
to a row of the Layers & components table or a Step in `design.md`; "AC n" is a criterion in
`requirements.md`.

## Phase 1 — UI (`il-ui`)

- [x] Route `gallery/+page.svelte` + `<svelte:head>` (`gallery_title` · `app_name`, `gallery_meta_description`) (AC 26)
- [x] Home mosaic `PhotoGallery`: first 4 of `top` in order, title `gallery_title`, "Xem tất cả" (View all) to `/gallery`, no "+N" (AC 1)
- [x] Home mosaic: sample mosaic (`PHOTOS`, striped placeholder, `photo_label`) when `items` is `null` or empty (AC 4, 5)
- [x] `GalleryCatalog`: title, subtitle `gallery_page_sub` with `total`, `Pagination` keeping `type` (AC 6)
- [x] `GalleryCatalog`: chips are links with `aria-current` (AC 8 — structure only)
- [x] `GalleryCatalog`: `gallery_empty` line for `total: 0` (AC 12)
- [x] `PhotoLightbox`: native `<dialog>`, large picture, title, place, ‹ › ✕, ← → Esc, labels `gallery_lightbox_label` / `gallery_prev` / `gallery_next` / `gallery_close` (AC 15 — partly)
- [x] `PhotoLightbox`: credit `gallery_credit` as a link to `source_url` (new tab, `noopener noreferrer`), changes with the photo (AC 19)
- [x] No favourite, wallpaper, share or "Lưu ảnh" (Save photo) action; the `<img>` is a plain image the browser can save (AC 22)
- [ ] `PhotoGallery`: each tile a link to `localizeHref('/gallery')` (AC 2)
- [ ] `PhotoGallery`: big tile on `thumbnail_url` (AC 3 — after ⚠️ is answered)
- [ ] `GalleryCatalog`: chips in the order Tất cả, Chùa, Tượng Phật, Cảnh thiền, Lễ hội (All, Temples, Buddha statues, Meditation scenes, Festivals), built from `GALLERY_FILTERS` (AC 8)
- [ ] `GalleryCatalog`: uniform 4:3 tiles, photo `object-cover`; drop the `SPANS` mosaic (AC 7)
- [ ] `GalleryCatalog`: error state = `gallery_load_error` + "Thử lại" (Try again) link button `err_retry` to the current URL (AC 11)
- [ ] `PhotoLightbox`: counter `gallery_position` from `GalleryViewer.position` / `total` (AC 15)
- [ ] `PhotoLightbox`: topic heading from `galleryTypeLabel(type)` (AC 15)
- [ ] `PhotoLightbox`: 4:3 frame, `object-cover` (AC 16)
- [ ] `PhotoLightbox`: ‹ hidden / disabled on photo 1, › on photo `total`; no wrap-around; keys follow the same rule (AC 17)
- [ ] `PhotoLightbox`: `aria-live` line `gallery_more_error` (AC 18) and `gallery_credit_missing` (AC 20)
- [ ] `GalleryCatalog`: on close, focus the tile of the last photo; on another page, `goto` that page then focus (AC 21; Lightbox Step 4)
- [ ] i18n (both `messages/vi.json` and `messages/en.json`, per the "i18n keys" table in `design.md`):
  - [ ] rename `gallery_cat_life` → `gallery_cat_meditation`: vi "Cảnh thiền", en "Meditation scenes" (AC 8)
  - [ ] add `gallery_more_error`, `gallery_credit_missing` (after their ⚠️ are answered) (AC 18, 20)
  - [ ] `gallery_page_sub` per product answer (AC 6, ⚠️)

## Phase 2 — State & logic (`il-state`)

- [ ] `features/gallery/filters.ts`: `GALLERY_FILTERS` (URL value → `GalleryType`, in chip order), `LEGACY_FILTERS` (`life` → `meditation`), `galleryTypeLabel(type)` (AC 8, 15)
- [ ] `features/gallery/state/viewer.svelte.ts`: `GalleryViewer` — pages by number, `position`, `total`, `current`, `hasPrev` / `hasNext`, `prev()` / `next()` with injected `loadPage`, one load in flight, error flag, total refreshed from each response (AC 15, 17, 18; Lightbox Steps 1, 3)
- [ ] No vector task: BR-GAL-02 (`rules/gallery-order.json`) is computed by the backend and the website shows the order it receives; BR-GAL-07 (`rules/gallery-home-more.json`) is apps only. If the website ever orders photos or shows "+N" itself, a task running that vector file must be added

## Phase 3 — Server data (contract-gated)

- [x] `src/lib/server/api/gallery.ts`: `getTopGallery`, `listGallery`, `getGalleryImage`, `listGalleryPaged` (12-photo window cut from backend pages, real `page_size` read); DTOs in `src/lib/types/gallery.ts`
- [x] `(site)/+page.server.ts`: `top` cut to 4, failure → `null`, the home page still renders (AC 1, 4)
- [x] `gallery/+page.server.ts`: normalise `?page` / `?type` (307), map `type`, past the end → 307 last page, failure → `gallery: null` (AC 6, 9, 10, 13; gallery Steps 1–2)
- [x] `api/gallery/[id]/+server.ts`: browser-facing credit proxy, `ApiError` → its status (AC 19; Lightbox Step 2)
- [ ] `gallery/+page.server.ts`: use `GALLERY_FILTERS`; `meditation` value; 308 `?type=life` → `?type=meditation` (AC 8, after ⚠️)
- [ ] `api/gallery/+server.ts` (new): `GET ?page=&type=` validated like the page `load`, `listGalleryPaged(…, 12)`, bad input → 400, `ApiError` → status (5xx → 502) (AC 17, 25; Lightbox Step 3)
- [ ] Fix stale comments: "beautiful temple photos" in `types/gallery.ts`; "falls back to static content" in `loadTopGallery` is still right (sample mosaic) — keep
- [ ] **Dependency — once backend gallery v2.0 lands in `openapi.yaml`** (not before): re-check field names; add `author` / `license` / `source_url` to `GalleryImageSummary`; read the credit from the item in the lightbox; delete Lightbox Step 2 and `api/gallery/[id]/+server.ts` if unused; ignore `top.total`; update the `Contract:` line in `requirements.md` (AC 19, 20)

## Phase 4 — Tests (`il-testing`)

- [ ] Set up the test tooling first (`npx sv add vitest`, Playwright) — none in the repo today
- [ ] Unit `server/api/gallery.spec.ts` `listGalleryPaged`: page 1, a window straddling two backend pages (page 2 = items 13–24), last page (86 → page 8 has 2), a backend `page_size` other than 20, filter passed through
- [ ] Unit `gallery` `load` (mock `listGalleryPaged`): `?page=abc` / `?page=0` / `?type=x` → 307; `?type=life` → 308; past the end → 307 last page keeping `type`; `ApiError` → `gallery: null`
- [ ] Unit `api/gallery/+server.ts`: bad `page` / `type` → 400; `ApiError` 5xx → 502; success → `GalleryPage`
- [ ] Unit `GalleryViewer`: open photo 3 of 86 → "3 / 86"; next from 12 loads page 2 → "13 / 86"; prev from 13 uses the held page 1; no prev on 1, no next on 86; filter "Lễ hội" (Festivals) 12 photos → "12 / 12", no next; load failure keeps the position and sets the error
- [ ] Unit `filters.ts`: chip order, label for each type, unknown type → `null`, `life` → `meditation`
- [ ] E2E `tests/gallery.e2e.ts` (real backend or mock server): home mosaic 4 tiles, a tile opens `/gallery` (FR-GAL-001); page 1 = 12 tiles, subtitle 86, page 8 = 2 tiles and no next page (FR-GAL-002); "Lễ hội" (Festivals) → only that topic, subtitle 12 (FR-GAL-003); open the 1st photo → "1 / 86", topic, title, place, credit (FR-GAL-004, FR-GAL-006); page past photo 12 → "13 / 86", credit changes, close → page 2 with that tile focused (FR-GAL-005, FR-GAL-004); credit link opens the source (FR-GAL-006); backend down → error + "Thử lại" (Try again), home shows the sample mosaic (FR-GAL-008); `/en/gallery` shows Vietnamese titles with English chips (BR-GAL-09)
- [ ] Measure NFR-GAL-03 (change chip, simulated 4G, < 2 s) once, record the result in the changelog

## Phase 5 — Quality (`il-quality`)

- [ ] `npm run check && npm run lint && npm run build` pass

## Phase 6 — Documentation

- [ ] Report the Website column of `docs/product/gallery/product.md` §4.2 to `ba-writer` (this skill does not edit the backend repo): BR-GAL-05 is `drift` (mosaic grid, letterboxed lightbox), FR-GAL-008 is `drift` (no "Thử lại" (Try again) on the gallery error), FR-GAL-001 is `drift` (home tiles are not links), FR-GAL-004 partly (no topic heading, no return to the last photo)
- [ ] Clean up `.assumptions.md` once the spec is approved: line 12 "Catalogue pages" (the `/gallery` part: placeholder data, client-side filtering — stale) and line 23 "Home re-check" (photos without detail links — superseded by this spec)
- [ ] OKF concept via `il-okf-writer` once the feature is checked end-to-end

## Deferred (not blocking gallery)

- Removing unused sample keys `photo_5..16_*` and `photo_N_cap` (not used by this feature; check with `grep` first).
- Letterboxed lightbox frame (product Appendix A item 3) — only if product answers yes.
