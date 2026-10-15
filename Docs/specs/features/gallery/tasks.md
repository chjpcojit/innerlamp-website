# Tasks — gallery (Ảnh đẹp Phật giáo — Buddhist photos)

Version: 1.1
Last updated: 2026-10-15
Status: in-progress (drift) — mirror `requirements.md`

> See `changelog.md` in this folder for the version history of this spec.

`[x]` only when checked to exist in the code on 2026-10-15 and to match product v1.1. Each item points
to a row of the Layers & components table or a Step in `design.md`; "AC n" is a criterion in
`requirements.md`.

## Phase 1 — UI (`il-ui`)

- [x] Route `gallery/+page.svelte` + `<svelte:head>` (`gallery_title` · `app_name`, `gallery_meta_description`) (AC 26)
- [x] Home mosaic `PhotoGallery`: first 4 of `top` in order, title `gallery_title`, "Xem tất cả" (View all) to `/gallery`, no "+N" (AC 1)
- [x] Home mosaic: big 2×2 tile on `image_url`, other tiles on `thumbnail_url` (AC 3; NFR-GAL-02 §3.6 exception)
- [x] `GalleryCatalog`: title, subtitle `gallery_page_sub` with `total`, `Pagination` keeping `type` (AC 6 — subtitle text still old)
- [x] `GalleryCatalog`: chips are links with `aria-current` (AC 8 — structure only)
- [x] `GalleryCatalog`: `gallery_empty` line for `total: 0` (AC 12)
- [x] `PhotoLightbox`: native `<dialog>`, large picture, title, place, ‹ › ✕, ← → Esc, labels `gallery_lightbox_label` / `gallery_prev` / `gallery_next` / `gallery_close` (AC 15 — partly)
- [x] `PhotoLightbox`: credit `gallery_credit` as a link to `source_url` (new tab, `noopener noreferrer`), changes with the photo (AC 19 — link case)
- [x] No favourite, wallpaper, share or "Lưu ảnh" (Save photo) action; the `<img>` is a plain image the browser can save (AC 22)
- [ ] `PhotoGallery`: each tile a link to `localizeHref('/gallery')` (AC 2)
- [ ] `PhotoGallery`: `null` → block heading + `gallery_load_error` + "Thử lại" (Try again) link button `err_retry` to the current URL with `#gallery`, no tile (AC 4)
- [ ] `PhotoGallery`: `[]` → block heading + `gallery_home_empty`, no tile (AC 5)
- [ ] Remove the sample mosaic: the `PHOTOS` branch and striped placeholder in `PhotoGallery`, `PHOTOS` in `content/home.ts`, `content/photos.ts`; re-check with `grep` that nothing else uses them (AC 4, 5)
- [ ] `GalleryCatalog`: chips in the order Tất cả, Chùa, Tượng Phật, Cảnh thiền, Lễ hội (All, Temples, Buddha statues, Meditation scenes, Festivals), built from `GALLERY_FILTERS` (AC 8)
- [ ] `GalleryCatalog`: uniform 4:3 tiles, photo `object-cover`; drop the `SPANS` mosaic (AC 7)
- [ ] `GalleryCatalog`: error state = `gallery_load_error` + "Thử lại" (Try again) link button `err_retry` to the current URL (AC 11)
- [ ] `PhotoLightbox`: counter `gallery_position` from `GalleryViewer.position` / `total` (AC 15)
- [ ] `PhotoLightbox`: topic heading from `galleryTypeLabel(type)` (AC 15)
- [ ] `PhotoLightbox`: 4:3 frame, `object-cover` (AC 16)
- [ ] `PhotoLightbox`: ‹ hidden / disabled on photo 1, › on photo `total`; no wrap-around; keys follow the same rule (AC 17)
- [ ] `PhotoLightbox`: toast inside the `<dialog>` (`role="status"`, `gallery_load_error`, hidden after a few seconds) when the adjacent page fails; stays on the photo, next / previous stay enabled to retry (AC 18; Lightbox Step 3)
- [ ] `PhotoLightbox`: credit as plain text, not a link, when `source_url` is empty (AC 19; P6)
- [ ] `PhotoLightbox`: `gallery_credit_missing` line (AC 20 — after its ⚠️ is answered)
- [ ] `GalleryCatalog`: on close, focus the tile of the last photo; on another page, `goto` that page (`noScroll`, new history entry) then focus (AC 21; Lightbox Step 4)
- [ ] i18n (both `messages/vi.json` and `messages/en.json`, per the "i18n keys" table in `design.md`):
  - [ ] rename `gallery_cat_life` → `gallery_cat_meditation`: vi "Cảnh thiền", en "Meditation scenes" (AC 8)
  - [ ] add `gallery_home_empty`: vi "Chưa có ảnh nào.", en "No photos yet." (AC 5)
  - [ ] add `gallery_credit_missing` (after its ⚠️ is answered) (AC 20)
  - [ ] `gallery_page_sub`: vi "Những khoảnh khắc an lành từ chùa chiền khắp nơi · {count} ảnh", en "Peaceful moments from temples everywhere · {count} photos" (AC 6)
  - [ ] remove `photo_label` and `photo_1..16_name` / `_place` / `_cap` (former sample mosaic; `grep` first) (AC 4, 5)

## Phase 2 — State & logic (`il-state`)

- [ ] `features/gallery/filters.ts`: `GALLERY_FILTERS` (URL value → `GalleryType`, in chip order), `LEGACY_FILTERS` (`life` → `meditation`), `galleryTypeLabel(type)` (AC 8, 15)
- [ ] `features/gallery/state/viewer.svelte.ts`: `GalleryViewer` — pages by number, `position`, `total`, `current`, `hasPrev` / `hasNext`, `prev()` / `next()` with injected `loadPage`, one load in flight, error flag, total refreshed from each response (AC 15, 17, 18; Lightbox Steps 1, 3)
- [ ] No vector task: BR-GAL-02 (`rules/gallery-order.json`) is computed by the backend and the website shows the order it receives; BR-GAL-07 (`rules/gallery-home-more.json`) is apps only. If the website ever orders photos or shows "+N" itself, a task running that vector file must be added

## Phase 3 — Server data (contract-gated)

- [x] `src/lib/server/api/gallery.ts`: `getTopGallery`, `listGallery`, `getGalleryImage`, `listGalleryPaged` (12-photo window cut from backend pages, real `page_size` read); DTOs in `src/lib/types/gallery.ts`
- [x] `(site)/+page.server.ts`: `top` cut to 4, failure → `null`, the home page still renders (AC 1, 4)
- [x] `gallery/+page.server.ts`: normalise `?page` / `?type` (307), map `type`, past the end → 307 last page, failure → `gallery: null` (AC 6, 9, 10, 13; gallery Steps 1–2)
- [x] `api/gallery/[id]/+server.ts`: browser-facing credit proxy, `ApiError` → its status (AC 19; Lightbox Step 2)
- [ ] `gallery/+page.server.ts`: use `GALLERY_FILTERS`; `meditation` value; 308 `?type=life` → `?type=meditation` keeping `page` (AC 8; gallery Step 1)
- [ ] `api/gallery/+server.ts` (new): `GET ?page=&type=` validated like the page `load`, `listGalleryPaged(…, 12)`, bad input → 400, `ApiError` → status (5xx → 502) (AC 17, 25; Lightbox Step 3)
- [ ] Fix stale comments: "beautiful temple photos" in `types/gallery.ts`; "falls back to static content" in `loadTopGallery` and "the static catalogue is shown" in `PhotoGallery` props — now wrong (no sample mosaic), reword to the error / empty block
- [ ] **Dependency — once backend gallery v2.0 lands in `openapi.yaml`** (not before): re-check field names; add `author` / `license` / `source_url` to `GalleryImageSummary`; read the credit from the item in the lightbox; delete Lightbox Step 2 and `api/gallery/[id]/+server.ts` if unused; ignore `top.total`; update the `Contract:` line in `requirements.md` (AC 19, 20)

## Phase 4 — Tests (`il-testing`)

- [ ] Set up the test tooling first (`npx sv add vitest`, Playwright) — none in the repo today
- [ ] Unit `server/api/gallery.spec.ts` `listGalleryPaged`: page 1, a window straddling two backend pages (page 2 = items 13–24), last page (86 → page 8 has 2), a backend `page_size` other than 20, filter passed through
- [ ] Unit `gallery` `load` (mock `listGalleryPaged`): `?page=abc` / `?page=0` / `?type=x` → 307; `?type=life&page=3` → 308 `?type=meditation&page=3`; past the end → 307 last page keeping `type`; `ApiError` → `gallery: null`
- [ ] Unit `api/gallery/+server.ts`: bad `page` / `type` → 400; `ApiError` 5xx → 502; success → `GalleryPage`
- [ ] Unit `GalleryViewer`: open photo 3 of 86 → "3 / 86"; next from 12 loads page 2 → "13 / 86"; prev from 13 uses the held page 1; no prev on 1, no next on 86; filter "Lễ hội" (Festivals) 12 photos → "12 / 12", no next; load failure keeps the position and sets the error; the next move retries the load
- [ ] Unit `filters.ts`: chip order, label for each type, unknown type → `null`, `life` → `meditation`
- [ ] E2E `tests/gallery.e2e.ts` (real backend or mock server): home mosaic 4 tiles, a tile opens `/gallery` (FR-GAL-001); page 1 = 12 tiles, subtitle 86, page 8 = 2 tiles and no next page (FR-GAL-002); "Lễ hội" (Festivals) → only that topic, subtitle 12 (FR-GAL-003); open the 1st photo → "1 / 86", topic, title, place, credit (FR-GAL-004, FR-GAL-006); page past photo 12 → "13 / 86", credit changes, close → page 2 with that tile focused (FR-GAL-005, FR-GAL-004); credit link opens the source (FR-GAL-006); backend down → gallery error + "Thử lại" (Try again), home block shows the error message + "Thử lại" and no tile; empty `top` → home "Chưa có ảnh nào." (No photos yet.); lightbox next-page failure → toast, same photo (FR-GAL-008); credit without source link is not a link (FR-GAL-006); `/en/gallery` shows Vietnamese titles with English chips (BR-GAL-09)
- [ ] Measure NFR-GAL-03 (change chip, simulated 4G, < 2 s) once, record the result in the changelog

## Phase 5 — Quality (`il-quality`)

- [ ] `npm run check && npm run lint && npm run build` pass

## Phase 6 — Documentation

- ~~Report the Website column of `docs/product/gallery/product.md` §4.2 to `ba-writer`~~ — superseded, not a code task: product v1.1 §4.2 already marks BR-GAL-05, FR-GAL-001, FR-GAL-004 and FR-GAL-008 `drift` for the Website
- [ ] Clean up `.assumptions.md` once the spec is approved: line 12 "Catalogue pages" (the `/gallery` part: placeholder data, client-side filtering — stale) and line 23 "Home re-check" (photos without detail links — superseded by this spec)
- [ ] OKF concept via `il-okf-writer` once the feature is checked end-to-end

## Deferred (not blocking gallery)

- _(none — the sample keys clean-up moved to Phase 1 with the sample mosaic removal; the letterbox item is dropped: product v1.1 BR-GAL-05 crops to 4:3)_
