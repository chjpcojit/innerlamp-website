# Requirements — gallery (Ảnh đẹp Phật giáo — Buddhist photos)

Version: 1.1
Last updated: 2026-10-15
Status: in-progress (drift) — the home mosaic on `/` (first 4 of `top`; the built-in sample mosaic it still shows on failure or empty is to be removed), the gallery `/gallery` (12 per numbered page cut from the backend's pages of 20, filter `?type=`, URL normalisation, past the end → last page, empty line) and the lightbox with the credit fetched per photo run against the real backend. Remaining: home error block with "Thử lại" (Try again) and home empty line in place of the sample mosaic, subtitle copy, chip label "Cảnh thiền" (Meditation scenes) and chip order, uniform 4:3 tiles, lightbox paging through the whole filtered gallery with the server total in the counter and no wrap-around, topic heading in the lightbox, 4:3 filled lightbox frame, error toast when the next page fails, return to the last photo on close, home tiles as links, "Thử lại" (Try again) on the load error, tests.
Feature folder: `src/routes/(site)/gallery/`, `src/routes/api/gallery/`, `src/routes/(site)/+page.server.ts` (home mosaic), `src/lib/components/sections/{GalleryCatalog,PhotoGallery,PhotoLightbox}.svelte`, `src/lib/server/api/gallery.ts`, `src/lib/types/gallery.ts`; new: `src/lib/features/gallery/`
Product spec: innerlamp-be `docs/product/gallery/product.md` @ v1.1
Contract: innerlamp-be `docs/specs/api/openapi.yaml` @ a8a016b (`info.version` 1.0.0, tag Gallery: `GET /v1/gallery/top`, `GET /v1/gallery`, `GET /v1/gallery/{id}`) — current shape: list items carry no credit (only the detail has `author` / `license` / `source_url`), `top` has no `total`, backend page of 20. Planned changes, **not yet built and not yet in `openapi.yaml`**: backend gallery `docs/specs/features/gallery/requirements.md` v2.0 (631a2e9) — credit on every list item (AC 11), `total` on `top` (AC 3).
Implements: BR-GAL-01, BR-GAL-02, BR-GAL-03 (§3.6: 12 per numbered page), BR-GAL-04, BR-GAL-05, BR-GAL-06, BR-GAL-08, BR-GAL-09, FR-GAL-001 (§3.6: mosaic of 4, no "+N"), FR-GAL-002, FR-GAL-003, FR-GAL-004, FR-GAL-005, FR-GAL-006, FR-GAL-008 (§3.6: failed topic or page load shows the error block at the new URL), NFR-GAL-01, NFR-GAL-02 (§3.6: large home tile may use the large picture), NFR-GAL-03

> See `changelog.md` in this folder for the version history of this spec.

This spec is written retroactively from the running code (read 2026-10-15) and checked against product spec v1.0 and updated to v1.1; the parts not built yet are written prospectively in the same file. Routes: `/gallery` (`/en/gallery`), the mosaic on `/` (`/en`), and the browser-facing proxy `/api/gallery/[id]`.

Product behavior (topic labels and order, gallery order, page size, credit format, tile shape, viewer range, actions offered, content language) lives in the product spec and is **not** restated here; this file only says how the website implements those IDs. Not applicable to the website (Website column `n/a`): BR-GAL-07 ("+N ảnh", apps only), FR-GAL-007 ("Lưu ảnh" (Save photo), apps only; §3.6), FR-GAL-009 (operator content load).

## Constraints from the product spec

- **Public, read-only** (product §2.3): no route of the feature needs a session; no sign-in prompt.
- **Website is online only** (§2.4): no offline copy; backend failure → error state with "Thử lại" (Try again).
- **Order comes from the backend** (BR-GAL-02): the website shows the order it receives and never re-sorts; it does not compute the gallery order or the featured list.
- **Credit is a licence obligation** (§2.5, BR-GAL-04): a large photo shown without its credit is a defect, not cosmetics.

## Dependencies

- **Backend gallery v2.0** (innerlamp-be `docs/specs/features/gallery/` v2.0, not built): credit (`author`, `license`, `source_url`) on every item of `top` and of the paged list (AC 11), `total` on `top` (AC 3). **The website must not depend on either until the backend ships them and they land in `openapi.yaml`.** Until then the lightbox keeps fetching the credit per photo through `/api/gallery/[id]` → `GET /v1/gallery/{id}` (AC 19, 20). The website has no use for `top.total` (no "+N" on the web, product §3.6), so it ignores that field.
- **Production photo storage** (product Appendix A item 1, ADR pending): image URLs are used exactly as returned (`thumbnail_url`, `image_url`); nothing on the website depends on where the files live.

## User Story

As a website visitor (signed in or not), I want to see a few Buddhist photos on the home page, browse the whole gallery by topic and open each photo large with its author and licence, so that I can enjoy them quietly and know where each one comes from. (product §1.3, §2.2)

## Acceptance Criteria (EARS notation)

### Home mosaic (`/`)

1. WHEN the visitor opens `/`, THE SYSTEM SHALL call `GET /v1/gallery/top` from the server and show the first 4 photos in exactly the order received as the mosaic of the "Ảnh đẹp Phật giáo" (Buddhist photos) block (`gallery_title`), with a "Xem tất cả" (View all) link to `localizeHref('/gallery')` and no "+N" overlay. (FR-GAL-001 §3.6, BR-GAL-01, BR-GAL-02) — ✓ (`HOME_GALLERY_COUNT` 4; the "Xem tất cả" link is the `SectionHeading` default).
2. WHEN the visitor chooses a tile of the home mosaic, THE SYSTEM SHALL navigate to `localizeHref('/gallery')`. (FR-GAL-001) — drift: the tiles are plain `<li>` items, not links.
3. WHEN a home tile is rendered, THE SYSTEM SHALL use the photo's title and place as returned, the large picture (`image_url`) on the big 2×2 tile and the small picture (`thumbnail_url`) on the other three. (NFR-GAL-02 §3.6, BR-GAL-09) — ✓ (`PhotoGallery` uses `image_url` for index 0 only).
4. WHEN `GET /v1/gallery/top` fails (network / 5xx / unexpected 4xx), THE SYSTEM SHALL still show the "Ảnh đẹp Phật giáo" (Buddhist photos) block with its heading and, in place of the tiles, the shared error message `gallery_load_error` ("Không tải được danh sách ảnh. Vui lòng thử lại sau." (Couldn't load the photo list. Please try again later.)) with a "Thử lại" (Try again) link button (`err_retry`, a GET link back to the current URL with `#gallery` so `load` runs again, no JS needed), no photo tile and no sample tile, and still render the rest of `/`. (FR-GAL-008) — drift: the built-in sample mosaic (`PHOTOS`, `photo_1..4_*`) is shown instead.
5. WHEN `GET /v1/gallery/top` returns `items: []`, THE SYSTEM SHALL still show the block with its heading and, in place of the tiles, the line `gallery_home_empty` ("Chưa có ảnh nào." (No photos yet.)), with no sample tile. (FR-GAL-008, BR-GAL-02) — drift: the sample mosaic is shown instead (`items?.length` falsy).

### Gallery `/gallery`

6. WHEN the visitor opens `/gallery`, THE SYSTEM SHALL call `GET /v1/gallery?page=N[&type=T]` from the server (one or two backend pages, cut to the website's page) and show one page of 12 tiles in the order received, the title `gallery_title` ("Ảnh đẹp Phật giáo"), the subtitle `gallery_page_sub` — the general sentence of product §3.6 followed by `total` under the current filter: "Những khoảnh khắc an lành từ chùa chiền khắp nơi · {count} ảnh" (Peaceful moments from temples everywhere · {count} photos) — and the page-number bar (`Pagination`) when there is more than one page. (FR-GAL-002 §3.6, BR-GAL-01, BR-GAL-02, BR-GAL-03 §3.6, NFR-GAL-01) — ✓ except the subtitle text: drift, today "{count} ảnh chùa chiền, tôn tượng, lễ hội và đời sống tu tập" lists every topic. The combination "sentence · count" is a website decision: §3.6 gives the sentence and keeps the count FR-GAL-002 requires without fixing how they are joined.
7. WHEN a gallery tile is rendered, THE SYSTEM SHALL give every tile the same 4:3 landscape shape with the photo filling it (cropped at the edges), the small picture, and the title and place exactly as returned. (BR-GAL-05, NFR-GAL-02, BR-GAL-09) — drift: tiles follow a 6-slot mosaic (`SPANS`: 2×2, tall, wide) with fixed row heights, so they are not uniform 4:3; small picture, title and place ✓.
8. WHEN the visitor picks a chip, THE SYSTEM SHALL offer, in this order, "Tất cả" (All) `gallery_tab_all`, "Chùa" (Temples) `gallery_cat_temple`, "Tượng Phật" (Buddha statues) `gallery_cat_statue`, "Cảnh thiền" (Meditation scenes) `gallery_cat_meditation`, "Lễ hội" (Festivals) `gallery_cat_festival`, as links to page 1 of `/gallery`, `?type=temple`, `?type=statue`, `?type=meditation`, `?type=festival`, the active one marked `aria-current`; the server maps them to `type` `CHUA` / `TUONG_PHAT` / `THIEN` / `LE_HOI`. (FR-GAL-003, BR-GAL-01) — drift: the label is "Thiền & đời sống" (Meditation & life) (`gallery_cat_life`, URL value `life`) and it comes after "Lễ hội" (Festivals). WHEN the URL has `?type=life` (the former value), THE SYSTEM SHALL redirect 308 to the same URL with `?type=meditation`, keeping `page`, so old links still work (platform) — not built.
9. WHEN the URL has a `?page=` that is not an integer ≥ 1 or an unknown `?type=`, THE SYSTEM SHALL redirect 307 to the canonical URL (keeping a valid filter, dropping `page=1`). (platform) — ✓.
10. WHEN `?page=` is past the last page (the window comes back empty with `total_pages > 0`), THE SYSTEM SHALL redirect 307 to the last page, keeping the filter. (BR-GAL-03) — ✓.
11. WHEN `GET /v1/gallery` fails (network / 5xx / unexpected 4xx), THE SYSTEM SHALL show the chips, the error message `gallery_load_error` ("Không tải được danh sách ảnh. Vui lòng thử lại sau." (Couldn't load the photos. Please try again later.)) and a "Thử lại" (Try again) button (`err_retry`, a GET link back to the current URL so `load` runs again, no JS needed), and no tile. (FR-GAL-008) — drift: the message is shown, without "Thử lại".
12. WHEN `GET /v1/gallery` returns `total: 0` (whole gallery or the chosen topic), THE SYSTEM SHALL show `gallery_empty` ("Chưa có ảnh nào trong chủ đề này." (No photos in this topic yet.)) under the chips, with no page bar. (FR-GAL-008) — ✓.
13. WHEN the visitor picks a chip or a page number and loading it fails, THE SYSTEM SHALL show the error state of AC 11 at the new URL, with the newly chosen chip selected; "Thử lại" (Try again) reloads that URL. (FR-GAL-008 §3.6) — ✓ per code (chips and page numbers are server-rendered links); "Thử lại" pending with AC 11.
14. WHEN the visitor changes chip, THE SYSTEM SHALL show the first page of the new topic within 2 s on 4G (at most two `GET /v1/gallery` calls, never the whole gallery). (NFR-GAL-03, NFR-GAL-01) — not measured.

### Lightbox (photo viewer)

15. WHEN the visitor chooses a gallery tile, THE SYSTEM SHALL open the lightbox (native `<dialog>`) on that photo, showing the counter `gallery_position` "{current} / {total}" where `current` is the photo's position in the whole filtered gallery (`(page − 1) × 12 + index + 1`) and `total` is the server `total` under the current filter, the large picture (`image_url`), the topic as a small heading (the photo's chip label, upper-cased by CSS; nothing for an unknown `type`), the title, the place and the credit. (FR-GAL-004, BR-GAL-06, BR-GAL-01, BR-GAL-09) — drift: the counter counts within the current page (`index + 1` / photos on the page); no topic heading.
16. WHEN the lightbox shows a photo, THE SYSTEM SHALL show it in a 4:3 frame that the photo fills (cropped at the edges, never letterboxed), the same way as the tile. (BR-GAL-05) — drift: `object-contain` in a 70vh frame (letterboxed).
17. WHEN the visitor moves to the next or previous photo (‹ › buttons, ← → keys), THE SYSTEM SHALL show that photo with its own topic, title, place, credit and position, crossing website pages: when the next / previous photo is not on a page already held, the browser loads that page through `GET /api/gallery?page=P[&type=…]` (same 12-photo window and filter as the grid) and keeps it; previous is not offered on photo 1, next is not offered on photo `total` (no wrap-around). (FR-GAL-005, BR-GAL-06, BR-GAL-02, NFR-GAL-01) — drift: paging wraps around within the current page only; no `/api/gallery` list endpoint.
18. WHEN loading the adjacent page for the lightbox fails, THE SYSTEM SHALL stay on the current photo and position, show a short message (toast) inside the lightbox with the shared error copy `gallery_load_error` ("Không tải được danh sách ảnh. Vui lòng thử lại sau." (Couldn't load the photo list. Please try again later.)), announced through `role="status"` and hidden after a few seconds, and keep "next" / "previous" offered so that moving again retries the load. (FR-GAL-008) — not built.
19. WHEN a photo is shown in the lightbox, THE SYSTEM SHALL show its credit `gallery_credit` ("Ảnh: {author} · {license}" (Photo: {author} · {license})) as a link to `source_url` opening in a new tab (`target="_blank"`, `rel="noopener noreferrer"`), and the credit SHALL change with the photo. WHEN the photo has no `source_url`, THE SYSTEM SHALL show the same credit text as plain text, not a link. (FR-GAL-006, BR-GAL-04) — ✓ for the link (fetched per photo through `/api/gallery/[id]`, cached per id). Once backend gallery v2.0 ships (AC 11 there), the credit is read from the list item and the per-photo fetch is removed — dependency, not done. Credit without `source_url`: drift — `PhotoLightbox` always renders an `<a href={credit.source_url}>`.
20. WHEN the per-photo credit request fails (until backend v2.0 ships), THE SYSTEM SHALL keep showing the photo and retry the credit request the next time that photo is shown. (BR-GAL-04, platform) — partly: the photo shows without credit; a failure is not cached, so the next showing retries ✓.
    > ⚠️ Not confirmed (product): what the viewer shows when a photo's credit cannot be obtained — showing it large without credit breaches BR-GAL-04 (§2.5) — blocks this criterion; proposed default: show the photo with the line `gallery_credit_missing` ("Chưa tải được thông tin tác giả." (Couldn't load the author details.)) until the backend v2.0 credit in the list makes the case disappear; hand back to ba-writer in innerlamp-be.
21. WHEN the visitor closes the lightbox (✕, a click on the backdrop, Esc), THE SYSTEM SHALL return to the gallery at the photo last shown: on the current page, focus its tile; on another website page, navigate to that page (`goto` `?page=P` keeping the filter, `{ noScroll: true }`, a new history entry) and focus its tile. (FR-GAL-004) — partly: closes; focus goes back to the browser default; no cross-page case yet.
22. WHEN the lightbox is open, THE SYSTEM SHALL NOT offer favourite, "Đặt hình nền" (Set as wallpaper), "Chia sẻ" (Share) or "Lưu ảnh" (Save photo), and SHALL NOT block the browser's own image saving (context menu / long press on the `<img>`). (BR-GAL-08, FR-GAL-007 §3.6) — ✓.

### General

23. WHEN a photo's title or place is shown on `/en/...`, THE SYSTEM SHALL show it exactly as the backend returns it (Vietnamese); only interface copy changes with the language. (BR-GAL-09) — ✓.
24. WHEN any string of the feature is shown (including `alt`, `aria-label`, `<title>`, meta, announcements), THE SYSTEM SHALL take it from Paraglide `m.*` with the key present in both `messages/vi.json` and `messages/en.json`; photo data is shown verbatim. (platform) — ✓.
25. WHEN calling the backend, THE SYSTEM SHALL only call from the SvelteKit server via `$lib/server/api/gallery.ts` with `x-api-key`; the browser only reaches the backend through `/api/gallery` and `/api/gallery/[id]`; no route of the feature reads the session cookie. (platform) — ✓ (`/api/gallery` list endpoint not created yet).
26. WHEN `/gallery` is requested, THE SYSTEM SHALL render it server-side as an indexable page with `<title>` `gallery_title` · `app_name` and meta description `gallery_meta_description`; `?type=` / `?page=` URLs are canonical (AC 9). (platform) — ✓.

## Data & API (called from the SvelteKit server)

Common header: `x-api-key` from `API_KEY`; no Bearer (public routes).

| Action | Operation (openapi) | Called from | Notes |
| --- | --- | --- | --- |
| Home mosaic | `GET /v1/gallery/top` | `load` of `(site)/+page.server.ts` | Website cuts to 4. `total` (backend v2.0 AC 3) is not used |
| Gallery page | `GET /v1/gallery?page=&type=` | `load` of `(site)/gallery/+page.server.ts` via `listGalleryPaged` | Backend page of 20 (read from `page_size`), cut to 12; one or two calls per website page |
| Lightbox: adjacent page | `GET /v1/gallery?page=&type=` | new `src/routes/api/gallery/+server.ts` (`GET`, browser-facing) via `listGalleryPaged` | Same window and filter as the grid; validates `page` / `type` like the page `load` |
| Lightbox: credit | `GET /v1/gallery/{id}` | `src/routes/api/gallery/[id]/+server.ts` (browser-facing) | Until backend v2.0 AC 11 puts the credit in every list item; then unused and removed |

## Error → UI mapping

| Operation | Failure case | Visitor sees | Current code state |
| --- | --- | --- | --- |
| `GET /v1/gallery/top` | network / 5xx / unexpected 4xx | Block heading + `gallery_load_error` + `err_retry` (link to the same URL); the rest of `/` still shows | drift — sample mosaic shown |
| `GET /v1/gallery/top` | `items: []` | Block heading + `gallery_home_empty` | drift — sample mosaic shown |
| `GET /v1/gallery` (page `load`) | network / 5xx / unexpected 4xx | Chips + `gallery_load_error` + `err_retry` (link to the same URL) | drift — no "Thử lại" (Try again) |
| `GET /v1/gallery` (page `load`) | `total: 0` | Chips + `gallery_empty` | ✓ |
| `GET /v1/gallery` | 400 `INVALID_PAGE` / `INVALID_GALLERY_TYPE` (the website already normalises the URL, so this does not happen) | As network / 5xx | ✓ (falls into the general branch) |
| `GET /v1/gallery` | page past the end | 307 to the last page | ✓ |
| `GET /api/gallery` (lightbox) | any failure / 400 on bad input | Stay on the photo, toast `gallery_load_error` in the lightbox; moving again retries (AC 18) | not built |
| `GET /v1/gallery/{id}` (via `/api/gallery/[id]`) | 404 `GALLERY_IMAGE_NOT_FOUND` / network / 5xx | Photo without credit today; `gallery_credit_missing` proposed (⚠️ AC 20); retried next time the photo is shown | partly — no line shown |
| every page | browser offline | `OfflineGate` (`offline_*`) | ✓ |

## Out of scope

- "Lưu ảnh" (Save photo) button on the web (product §3.6: the browser saves images natively), favourite, set as wallpaper, share (BR-GAL-08).
- "+N ảnh" on the home mosaic (BR-GAL-07, apps only).
- Search, zoom inside the lightbox, a public web page or URL per photo (product §1.2).
- Masonry layout (product §1.2, later).
- Content loading and the backend's production photo storage (FR-GAL-009, product Appendix A items 1–2).
- `/vi/...` canonicalisation and sitemap (site-wide follow-up).

## Pending (not yet implemented)

- Chip label "Cảnh thiền" (Meditation scenes) and chip order — Phase 1 (i18n, chips), Phase 3 (filter map).
- Uniform 4:3 tiles in the grid — Phase 1.
- Home tiles as links to `/gallery` — Phase 1.
- Home error block with "Thử lại" (Try again) and empty line `gallery_home_empty`; remove the sample mosaic (`PHOTOS`, `content/photos.ts`, `photo_label`, `photo_N_*` keys) — Phase 1.
- Subtitle `gallery_page_sub` "sentence · count" — Phase 1.
- `?type=life` → `?type=meditation` 308 — Phase 3.
- Credit without `source_url` as plain text — Phase 1.
- "Thử lại" (Try again) on the gallery load error — Phase 1.
- Lightbox: counter with the position and server total, topic heading, 4:3 filled frame, paging across website pages without wrap-around, adjacent-page error toast, return to the last photo on close — Phases 1, 2, 3.
- Credit read from the list items once backend gallery v2.0 ships; remove the per-photo fetch — Phase 3 (dependency).
- Tests and measuring NFR-GAL-03 — Phase 4.

## Open questions (resolved)

- ~~Feature name, topic labels and chip order~~ → "Ảnh đẹp Phật giáo"; Tất cả, Chùa, Tượng Phật, Cảnh thiền, Lễ hội (product v1.0 BR-GAL-01). Resolved 2026-10-15.
- ~~Website page size and pagination~~ → 12 per numbered page (product §3.6 row BR-GAL-03); kept as in code, past the end → last page. Resolved 2026-10-15.
- ~~Lightbox range~~ → the whole filtered gallery, total from the server (product BR-GAL-06). Resolved 2026-10-15.
- ~~Home mosaic size, "+N", behavior on error~~ → first 4 featured, no "+N" (product §3.6 row FR-GAL-001). The v1.0 answer "built-in sample mosaic on error" is replaced by product v1.1 (P1): the shared error block with "Thử lại" (AC 4). Resolved 2026-10-15.
- ~~Big 2×2 home tile on the large picture (AC 3)~~ → allowed, NFR-GAL-02 exception (product v1.1 §3.6, W1). Changes: AC 3 is now ✓; the `thumbnail_url` task is dropped. Resolved 2026-10-15.
- ~~Empty featured list on the home (AC 5)~~ → the block shows "Chưa có ảnh nào." (No photos yet.), no sample mosaic (product v1.1 FR-GAL-008, P4/W2). Changes: AC 5, new key `gallery_home_empty`, sample mosaic removal task. Resolved 2026-10-15.
- ~~English values of the sample mosaic vs BR-GAL-09 (AC 5)~~ → moot: the sample mosaic is removed (product v1.1, W3). Resolved 2026-10-15.
- ~~Gallery subtitle copy (AC 6)~~ → "Những khoảnh khắc an lành từ chùa chiền khắp nơi" (product v1.1 §3.6, W4); the website keeps the count FR-GAL-002 requires and joins them as "{sentence} · {count} ảnh" (website decision). Changes: `gallery_page_sub` text in both catalogues. Resolved 2026-10-15.
- ~~Failed chip / page load on the website (AC 13)~~ → accepted platform variance: error block with "Thử lại" at the newly chosen URL (product v1.1 §3.6, W5). Changes: AC 13 tag only. Resolved 2026-10-15.
- ~~Lightbox frame letterbox vs crop (AC 16)~~ → crop to 4:3, never letterboxed (product v1.1 BR-GAL-05, P3). Changes: the deferred letterbox item is dropped. Resolved 2026-10-15.
- ~~Viewer copy when further photos fail to load (AC 18)~~ → toast with the shared error copy `gallery_load_error`, stay on the current photo, moving next again retries (product v1.1 FR-GAL-008, P5). Changes: no `gallery_more_error` key; a toast inside the lightbox. Resolved 2026-10-15.
- ~~Credit of a photo without a source link~~ → shown, not a link (product v1.1 BR-GAL-04, FR-GAL-006, P6). Changes: AC 19, Phase 1 task. Resolved 2026-10-15.
- ~~Rename `?type=life` → `?type=meditation` (AC 8)~~ → yes, 308 redirect keeping `page` (anh Đức, W6; product v1.1 hands it to this spec). Changes: AC 8, Phase 3 task, gallery Step 1. Resolved 2026-10-15.
- ~~Close the lightbox after paging onto another page (AC 21)~~ → navigate to that page and focus the tile (anh Đức, W7). Changes: AC 21, Lightbox Step 4. Resolved 2026-10-15.
- ~~"Lưu ảnh", favourite, wallpaper, share on the web~~ → none (product BR-GAL-08, §3.6 row FR-GAL-007). Resolved 2026-10-15.
