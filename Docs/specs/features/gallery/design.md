# Design — gallery (Ảnh đẹp Phật giáo — Buddhist photos)

Version: 1.1
Last updated: 2026-10-15
Status: in-progress (drift) — mirror `requirements.md`

> See `changelog.md` in this folder for the version history of this spec.

## Overview

Three surfaces, all public, none reads the session cookie: the home mosaic on `/`, the gallery
`/gallery` (`?type=`, `?page=`) and the lightbox opened from a gallery tile. Reads take the standard
path: browser → `load` in `+page.server.ts` → `$lib/server/api/gallery.ts` → backend (`x-api-key`).
The lightbox is the one genuinely interactive part (paging across website pages, per-photo credit), so
it reaches the backend from the browser only through two `/api/gallery*` proxies, per AGENTS.md
"Browser-side calls". Same architecture as `temple` and `deity` (URL-driven catalogue with numbered
pages). New logic (filter map, lightbox paging state) goes into `src/lib/features/gallery/`; the three
existing sections keep their names and places.

## Layers & components

| Layer | File | Responsibility | Status |
| --- | --- | --- | --- |
| Route (server) | `src/routes/(site)/+page.server.ts` | `loadTopGallery` → first 4 (`HOME_GALLERY_COUNT`); failure → `null`, empty → `[]` | exists ✓ (check it keeps `null` and `[]` apart once the sample mosaic is gone) |
| Route (UI) | `src/routes/(site)/+page.svelte` | Renders `PhotoGallery items={data.gallery}` | exists ✓ |
| Section | `src/lib/components/sections/PhotoGallery.svelte` | Home mosaic (4 slots, big tile on `image_url` per the NFR-GAL-02 §3.6 exception), "Xem tất cả" (View all) via `SectionHeading`; `null` → `gallery_load_error` + `err_retry` link (current URL + `#gallery`); `[]` → `gallery_home_empty`; the heading is always shown | exists — needs: each tile a link to `localizeHref('/gallery')`; error block and empty line replacing the sample mosaic branch (drop the `PHOTOS` import and the striped placeholder) |
| Route (server) | `src/routes/(site)/gallery/+page.server.ts` | Normalise `?page` / `?type` (307), `listGalleryPaged(…, 12)`, past the end → 307 last page, failure → `gallery: null` | exists — needs: filter map from `features/gallery/filters.ts`; `meditation` value + 308 `life` → `meditation` keeping `page` (requirements AC 8) |
| Route (UI) | `src/routes/(site)/gallery/+page.svelte` | `<svelte:head>` (`gallery_title`, `gallery_meta_description`), `GalleryCatalog` | exists ✓ |
| Section | `src/lib/components/sections/GalleryCatalog.svelte` | `PageHeader`, chips, grid of tiles, `Pagination`, error / empty state, opens the lightbox | exists — needs: chip order + `gallery_cat_meditation`, uniform 4:3 tiles (drop `SPANS`), `err_retry` link on the error state, subtitle `gallery_page_sub` ("sentence · count"), pass `page` / `total` / `filter` to the lightbox, focus the last tile on close (or `goto` the other page) |
| Section | `src/lib/components/sections/PhotoLightbox.svelte` | `<dialog>`: counter, large photo, topic heading, title, place, credit, ‹ › ✕, ← → Esc | exists — needs: drive it from `GalleryViewer` state, counter from the server total, no wrap-around, topic heading, 4:3 `object-cover` frame (never letterboxed), toast inside the `<dialog>` (`role="status"`, `gallery_load_error`, hidden after a few seconds) when the adjacent page fails, credit as plain text when `source_url` is empty, credit from the item once backend v2.0 ships |
| Feature logic | `src/lib/features/gallery/filters.ts` | `GALLERY_FILTERS` (URL value → `GalleryType`, chip order), `galleryTypeLabel(type)` (chip label for the topic heading; unknown → `null`), `LEGACY_FILTERS` (`life` → `meditation`) | not created (map lives in `gallery/+page.server.ts` today) |
| Feature state | `src/lib/features/gallery/state/viewer.svelte.ts` | `GalleryViewer` class (runes): pages held by number, `position` (1-based in the filtered gallery), `total`, `current`, `hasPrev` / `hasNext`, `next()` / `prev()` loading an adjacent page through an injected `loadPage(page)`; error flag | not created |
| API endpoint | `src/routes/api/gallery/+server.ts` | `GET ?page=&type=` → validate like the page `load` (400 on bad input) → `listGalleryPaged(…, 12)` → JSON `GalleryPage`; `ApiError` → its status (5xx → 502) | not created |
| API endpoint | `src/routes/api/gallery/[id]/+server.ts` | `GET` one photo's credit → `getGalleryImage` | exists ✓ — removed once backend v2.0 credit is in the list items |
| API resource | `src/lib/server/api/gallery.ts` | `getTopGallery`, `listGallery`, `getGalleryImage`, `listGalleryPaged` (cuts the website window out of one or two backend pages, reads the real `page_size`) | exists ✓ |
| Types | `src/lib/types/gallery.ts` | DTOs; `GalleryFilter` | exists — needs: `GalleryFilter` `life` → `meditation`; doc comment "beautiful temple photos" → the feature name; after backend v2.0 ships: `author` / `license` / `source_url` on `GalleryImageSummary` (optional `total` on `GalleryTop`, unused) |
| Static content | `src/lib/content/photos.ts`, `PHOTOS` in `src/lib/content/home.ts`, keys `photo_label`, `photo_1..16_name` / `_place` / `_cap` | Former sample mosaic of the home error / empty case — removed by product v1.1 (FR-GAL-008, P1) | to remove: `PHOTOS`, `content/photos.ts` (`PHOTO_LIST` is only used by `PHOTOS`, `grep` 2026-10-15) and the keys `photo_label`, `photo_N_name` / `_place` / `_cap` from both catalogues; re-run `grep` first (`temple_photo_label` / `article_photo_label` are other features' keys, keep) |
| i18n | `messages/vi.json`, `messages/en.json` | "i18n keys" table | to change / add |
| Tests | `src/lib/features/gallery/state/viewer.svelte.spec.ts`, `src/lib/server/api/gallery.spec.ts`, `src/routes/(site)/gallery/page.server.spec.ts`, `tests/gallery.e2e.ts` | Per `il-testing` | not created (no test tooling in the repo yet) |

## Route & navigation flow

```
/
  ├─ mosaic tile ────────▶ /gallery
  ├─ "Xem tất cả" ───────▶ /gallery
  └─ error: "Thử lại" ───▶ same URL + #gallery (GET)

/gallery[?type=temple|statue|meditation|festival][&page=N]
  ├─ bad ?page / ?type ──▶ 307 canonical URL
  ├─ ?type=life ─────────▶ 308 ?type=meditation (keep page)
  ├─ page > total_pages ─▶ 307 ?page=total_pages
  ├─ chip ───────────────▶ ?type=… (page 1)
  ├─ page number ────────▶ ?page=N (keep type)
  ├─ error: "Thử lại" ───▶ same URL (GET)
  └─ tile ───────────────▶ lightbox (no URL change)
        ├─ ‹ › / ← → ────▶ adjacent photo; off-page → GET /api/gallery?page=P[&type=…]
        ├─ credit ───────▶ source_url (new tab; not a link without source_url)
        └─ ✕ / backdrop / Esc ▶ same page: focus tile · other page: /gallery?…&page=P, focus tile
```

Every internal href goes through `localizeHref()` (query-only links keep the localised path).

## Step-by-step Flow — Gallery page

```
Step 1 — Normalise the URL (this feature)
- Trigger: request GET /gallery
- Pre-condition: —
- Where: (site)/gallery/+page.server.ts `load`
- API: no call
    - ?type=life → 308 same URL with ?type=meditation, keeping page (planned, requirements AC 8)
    - ?page not an integer ≥ 1 or unknown ?type → 307 canonical URL (keep a valid filter, drop page=1)
    - valid → Step 2

Step 2 — Read one website page (this feature)
- Trigger: after Step 1
- Pre-condition: page ≥ 1; type ∈ {CHUA, TUONG_PHAT, THIEN, LE_HOI} or absent
- Where: same `load` → listGalleryPaged(fetch, {page, type}, 12)
- API: GET /v1/gallery?page=B[&type=T] — B = backend page holding item (page−1)×12, using the
  returned `page_size` (20 today; re-requested once if it differs)
    - Window straddles two backend pages → second call GET /v1/gallery?page=B+1[&type=T]
    - Success, items > 0 → { gallery (page, page_size 12, total, total_pages = ceil(total/12)), filter }
    - Success, items = [] and page > 1 and total_pages > 0 → 307 ?page=total_pages (keep type)
    - Success, total = 0 → `gallery_empty`
    - Failure (any ApiError, either call) → { gallery: null } → `gallery_load_error` + "Thử lại" (Try again)
    - Failure (not an ApiError) → rethrow (programming error)
```

## Step-by-step Flow — Lightbox

```
Step 1 — Open on a tile (this feature, browser)
- Trigger: visitor activates a gallery tile (index i on website page P)
- Pre-condition: the page rendered with gallery ≠ null
- Where: GalleryCatalog → new GalleryViewer({ page: P, items, total, filter, loadPage }), open(i)
- API: no call
    - position = (P−1)×12 + i + 1; counter "{position} / {total}"; hasPrev = position > 1;
      hasNext = position < total
    - topic heading = galleryTypeLabel(item.type) (none for an unknown type)

Step 2 — Credit for the shown photo (this feature, browser; until backend gallery v2.0 ships)
- Trigger: the shown photo changes (Step 1 or Step 3)
- Pre-condition: no credit cached for this id
- Where: PhotoLightbox `$effect` → fetch /api/gallery/{id} → api/gallery/[id]/+server.ts → getGalleryImage
- API: GET /v1/gallery/{id}
    - Success → cache by id, show `gallery_credit` linking to source_url (plain text when
      source_url is empty)
    - Failure (404 / network / 5xx) / aborted → no cache entry; show `gallery_credit_missing`
      (⚠️ requirements AC 20); retried the next time the photo is shown
- After backend v2.0 (credit on every list item) is in openapi.yaml: this step is deleted — the credit
  comes with the item read in Step 2 of the gallery page or Step 3 here.

Step 3 — Move to an adjacent photo (this feature, browser)
- Trigger: ‹ / › button or ← / → key while the dialog is open
- Pre-condition: hasPrev (for ‹) / hasNext (for ›); no page load in flight
- Where: GalleryViewer.prev() / next()
- API: none when the target position is on a page already held; otherwise
  GET /api/gallery?page=P±1[&type=…] → api/gallery/+server.ts → listGalleryPaged(…, 12)
  → GET /v1/gallery (one or two calls, as gallery Step 2)
    - Success → keep the page; show the target photo; total updated from the response
      (if total shrank below position, clamp to the new last photo)
    - Failure → stay on the current photo and position, error flag → toast `gallery_load_error`
      inside the dialog (role="status", hidden after a few seconds; requirements AC 18); the button
      stays enabled, so moving again retries the load

Step 4 — Close (this feature, browser)
- Trigger: ✕, click on the backdrop, Esc (dialog `close` event)
- Pre-condition: dialog open
- Where: GalleryCatalog `onclose`
- API: no call
    - Last photo on page P (the rendered page) → focus its tile
    - Last photo on another page Q → goto(`?page=Q` keeping type, { noScroll: true }) → load runs
      (gallery Step 2; a new history entry) → focus the tile of that photo (requirements AC 21)
```

## Session & cookies

Not used. Every route of the feature is public; it does not read `il_token` and does not change
`locals.user`.

## SEO

`/gallery` is a public, indexable page; `?type=` / `?page=` are canonical URLs (gallery Step 1).
`/api/gallery*` are JSON endpoints, not pages. No prerendering (content changes when the operator
reloads it). The lightbox has no URL of its own (product §1.2: no public page per photo).

## i18n keys

| Key | Used in | ID | Change |
| --- | --- | --- | --- |
| `gallery_title` ("Ảnh đẹp Phật giáo" (Buddhist photos)) | Home heading, page title, `<title>`, breadcrumb | BR-GAL-01 | keep |
| `gallery_cat_life` ("Thiền & đời sống" (Meditation & life)) | Chip | BR-GAL-01 | rename to `gallery_cat_meditation`: vi "Cảnh thiền", en "Meditation scenes" (en text proposed by the website) |
| `gallery_tab_all`, `gallery_cat_temple`, `gallery_cat_statue`, `gallery_cat_festival` | Chips, topic heading in the lightbox | BR-GAL-01 | keep (reorder chips in code, not keys) |
| `gallery_page_sub` | Subtitle with `{count}` | FR-GAL-002 §3.6 | change: vi "Những khoảnh khắc an lành từ chùa chiền khắp nơi · {count} ảnh", en "Peaceful moments from temples everywhere · {count} photos" (en text proposed by the website) |
| `gallery_load_error` + `err_retry` | Gallery error state, home error block, lightbox toast | FR-GAL-008 | keep; reuse `err_retry` ("Thử lại" (Try again)) |
| `gallery_home_empty` ("Chưa có ảnh nào." (No photos yet.)) | Home block, empty gallery | FR-GAL-008 | add: vi "Chưa có ảnh nào.", en "No photos yet." |
| `gallery_empty` ("Chưa có ảnh nào trong chủ đề này." (No photos in this topic yet.)) | Empty gallery / topic | FR-GAL-008 | keep |
| `gallery_position` ("{current} / {total}") | Lightbox counter | BR-GAL-06 | keep (values change) |
| `gallery_credit` ("Ảnh: {author} · {license}" (Photo: {author} · {license})) | Lightbox credit | BR-GAL-04 | keep |
| `gallery_credit_missing` | Credit could not be loaded | BR-GAL-04 | add (⚠️ requirements AC 20) |
| `gallery_filter_label`, `gallery_open`, `gallery_lightbox_label`, `gallery_close`, `gallery_prev`, `gallery_next`, `gallery_meta_description` | Labels, meta | platform | keep |
| `photo_label`, `photo_1..16_name` / `_place` / `_cap` | Former home sample mosaic | FR-GAL-008 | remove (sample mosaic removed by product v1.1) |

## Deliberately stubbed for now

- **Credit in the list items / `total` on `top`** (backend gallery v2.0 AC 11 / AC 3): not built, not
  in `openapi.yaml`. Until then the lightbox fetches the credit per photo (Lightbox Step 2) and
  `GalleryImageSummary` stays without credit fields. When the contract has them: add the fields, read
  the credit from the item, delete Step 2 and `src/routes/api/gallery/[id]/+server.ts` if nothing else
  uses it, and update the `Contract:` line in `requirements.md`. `top.total` stays unused on the
  website. Tasks Phase 3.
