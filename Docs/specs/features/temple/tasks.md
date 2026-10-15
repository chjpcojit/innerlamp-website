# Tasks — temple (Chùa Việt Nam)

Version: 1.0
Last updated: 2026-10-15
Status: in-progress (drift) — trang chủ, danh bạ phân trang và trang chùa chạy với backend; tìm/lọc, trạng thái mở/đóng, các khối mới của trang chùa, gỡ "Theo dõi" và dữ liệu mẫu chưa làm; tìm/lọc và trường mới chờ openapi; chưa có test

> See `changelog.md` in this folder for the version history of this spec.

`[x]` chỉ khi đã kiểm tra tồn tại trong code ngày 2026-10-15 **và** đúng như product spec v1.1 yêu cầu. Mỗi mục trỏ về một dòng của bảng Layers & components, bảng "Thứ tự khối" hoặc một Step trong `design.md`; số `AC n` là tiêu chí trong `requirements.md`.

## Phase 1 — UI (`il-ui`)

Trang chủ

- [x] Khối "Chùa Việt Nam" có link "Xem tất cả" tới `/temples` (`SectionHeading href`), thẻ link tới `/temples/[id]`, ảnh thiếu → ô giữ chỗ (AC 1, BR-TPL-06)
- [ ] `TempleGrid`: bỏ nhánh chùa mẫu (`TEMPLES` của `content/home.ts`); `items` rỗng → `temples_featured_empty` (AC 2); lỗi → theo ⚠️ AC 3 *(chờ ⚠️ AC 3; mặc định trạng thái rỗng)*
- [ ] Thẻ trang chủ theo ⚠️ AC 1 *(chờ ⚠️ AC 1; mặc định giữ thẻ gọn hiện tại)*

Danh bạ

- [x] Route `/temples` + `<svelte:head>` title/description (`temples_title`, `temples_meta_description`), breadcrumb (`config/breadcrumbs.ts`)
- [x] Số chùa `temples_page_sub({count: total})`, `temples_empty` khi danh bạ rỗng (AC 4, AC 9)
- [x] `Pagination` ẩn khi ≤ 1 trang, khoá "trước"/"sau" ở hai đầu, nhận `params` để giữ tham số khác (AC 7)
- [x] Thẻ danh bạ: ảnh hoặc giữ chỗ, cấp di tích, hệ phái (bỏ nhãn enum lạ), tên link, tỉnh (AC 5 — trừ loại chùa)
- [ ] Thẻ danh bạ thêm loại chùa (`templeTypeLabel`, `temple_type_*`) (AC 5)
- [ ] `TempleFilters.svelte` trong `src/lib/features/temple/components/`: GET form + `SearchField name="q" maxlength=100` + nút gửi ẩn; bốn link miền `region_all/north/central/south` có `aria-current` (AC 10, 14, 15, 16) *(chỉ bật khi backend đã có `q`/`region` — ⚠️ contract)*
- [ ] Debounce 300 ms + `goto(…, {replaceState, keepFocus, noScroll})` khi gõ (AC 11, NFR-TPL-01)
- [ ] `TempleCatalog`: truyền `params={q, region}` cho `Pagination`; `total = 0` có bộ lọc → `temples_no_match_title` + `temples_no_match_hint` (AC 4, AC 13)
- [ ] Lỗi tải: thêm link/nút `temples_retry` tới URL hiện tại (AC 8)
- [ ] `<meta name="robots" content="noindex">` khi có `q` (AC 31)

Trang chùa (theo bảng "Thứ tự khối" của `design.md`)

- [x] Route `/temples/[id]`: `<title>` tên chùa, meta `temple_d_meta_description`, breadcrumb `temple_d_crumb` (AC 18)
- [x] Lỗi mạng / 5xx → trang lỗi dữ liệu `err_data_*` có `err_retry` (`+error.svelte` gốc, `error(502)`) (AC 18)
- [ ] `src/routes/(site)/temples/[id]/+error.svelte`: 404 → `temple_d_not_found_*` + link `/temples` (HTTP 404 giữ nguyên); status khác → như trang lỗi gốc (AC 18, FR-TPL-006)
- [ ] Gỡ nút "Theo dõi"/"Đang theo dõi" khỏi `TempleDetail` (AC 27, BR-TPL-08)
- [ ] Header: dòng `temple_d_aka` dưới tên (ẩn khi không có `aliases`), phường + tỉnh; bỏ dòng `temple_d_aliases` ở cột phải (khối 1, AC 19, AC 21)
- [ ] "Chỉ đường": URL `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`; hàng hành động chỉ còn nút này (khối 2, AC 24)
- [ ] `TempleHours.svelte`: hai dòng giờ, nhãn `temple_d_today`, trạng thái chỉ sau mount + mỗi 60 s; không giờ → `temple_d_pending`, ẩn trạng thái; giờ không đúng dạng → in nguyên chuỗi (khối 3, AC 22, AC 23) *(dòng Rằm khi không có giờ lễ chờ ⚠️ AC 23)*
- [ ] Bốn ô niên đại · cấp di tích · hệ phái · miền (`templeRegionLabel`) (khối 4, AC 19)
- [ ] Giới thiệu thu gọn + `temple_d_read_more`/`temple_d_read_less`, không JS hiện đủ (khối 5, AC 20)
- [ ] Khối tổ chức: trụ trì, tổ khai sơn, giáo hội (`sangha_body`), thiếu → `temple_d_pending` (khối 6, AC 19, AC 21)
- [ ] Kiến trúc & di sản: đoạn `architecture_heritage` luôn hiện (thiếu → `temple_d_pending`); dòng kiểu kiến trúc / vật liệu theo ⚠️ AC 21 (khối 7) *(chờ ⚠️ AC 21)*
- [ ] Tiện ích: đủ dòng, không có → `temple_d_none`; "Kinh sách" theo ⚠️ AC 21 (khối 8, AC 21) *(chờ ⚠️ AC 21)*
- [ ] Lưu ý khi viếng đánh số `01, 02, …`; thiếu → `temple_d_pending` (khối 9, AC 19, AC 21)
- [ ] `TempleEventList` thêm prop `emptyLabel`; trang chùa truyền `temple_ev_none_posted`, `/sangha` giữ `temple_ev_empty` (khối 10, AC 26)
- [ ] Vị trí & liên hệ: `full_address`, miền, toạ độ, nút bản đồ (cùng URL chỉ đường); `TempleContacts.svelte` (`tel:` / `https://` tab mới / `mailto:`, thiếu → chữ `temple_d_pending`) (khối 11, AC 19, AC 25)
- [ ] Chân trang `temple_d_updated({month})` từ `content_updated_month` (`YYYY-MM` → `MM/YYYY`), ẩn khi `null`; không có "Báo thông tin sai" (khối 12, AC 19, AC 27)
- [x] Header ảnh: `image_url` hoặc nền gradient giữ chỗ (khối 1, BR-TPL-06)
- [x] Không có "Cúng dường", "Báo thông tin sai", không hỏi vị trí, không khoảng cách (AC 27 — phần cúng dường/báo sai, AC 28)

i18n

- [ ] Theo bảng "i18n keys" của `design.md`, đủ cả `vi.json` và `en.json` (AC 32):
  - [ ] thêm `temples_retry`, `temples_search_*`, `temples_region_label`, `temples_no_match_*`, `temples_featured_empty`, `temple_type_*`, `temple_d_aka`, `temple_d_status_*`, `temple_d_hours_normal`, `temple_d_hours_holiday`, `temple_d_today`, `temple_d_pending`, `temple_d_none`, `temple_d_facts_region`, `temple_d_read_*`, `temple_d_org_title`, `temple_d_sangha_body`, `temple_d_arch_style`, `temple_d_materials`, `temple_amenity_books`, `temple_d_location_title`, `temple_d_coords`, `temple_d_map`, `temple_d_hotline`, `temple_d_fanpage`, `temple_d_website`, `temple_d_email`, `temple_d_updated`, `temple_d_not_found_*`, `temple_ev_none_posted`
  - [ ] bỏ `temple_d_follow`, `temple_d_following`, `temple_d_aliases`, `region_highlands`, `temple_<n>_*`

## Phase 2 — State & logic (`il-state`)

- [ ] `src/lib/features/temple/query.ts`: `parseTempleQuery`, `templeListHref` (page / q trim + 100 / region hợp lệ, URL chuẩn) — dùng chung `load` và `TempleFilters` (AC 6, 12, 16, 17; Step 1–2)
- [ ] `src/lib/features/temple/open-status.ts`: `parseHours`, `templeOpenStatus(nowUtc, hours, holidayHours)` theo BR-TPL-09 — ngày Việt Nam từ `nowUtc + 7 h`, ngày âm qua `solarToLunar(new Date(y, m − 1, d))`, "mở lại" của ngày mai (AC 22, 23; design "Trạng thái mở/đóng")
- [ ] `templeTypeLabel`, `templeRegionLabel` trong `src/lib/utils/temple-labels.ts` (enum lạ → `undefined`) (AC 5, AC 19)
- [ ] Gỡ `src/lib/state/temple-follow.svelte.ts` (key `il-temple-follow`); không migrate (AC 27, BR-TPL-08)
- [ ] Gỡ `src/lib/content/temples.ts` và `TEMPLES` của `src/lib/content/home.ts` (dữ liệu mẫu, `region: 'highlands'`) sau khi `TempleGrid` không còn dùng (AC 2, AC 3, BR-TPL-04)
- [x] `solarToLunar` (`src/lib/utils/lunar.ts`, lịch Việt UTC+7) — dùng lại, không đổi

## Phase 3 — Server data (contract-gated)

- [x] Ba operation đã có trong innerlamp-be `docs/specs/api/openapi.yaml` @ a8a016b: `GET /v1/temples/top`, `GET /v1/temples?page=`, `GET /v1/temples/{id}` (+ `GET /v1/temples/options`) — chỉ trích dẫn, không chép schema
- [ ] Xác nhận `q`, `region`, trang 12 và bốn nhóm trường mới của `TempleDetail` có trong `openapi.yaml` (backend v2.0 Phase 13) rồi cập nhật dòng `Contract:` của `requirements.md` *(⚠️ contract — hand-off backend)*
- [x] Mọi lời gọi chạy trên server qua `src/lib/server/api/temples.ts` + `client.ts` (`x-api-key` từ `API_KEY`, không Bearer) (AC 30)
- [x] `/temples` `load`: `page` sai / `=1` → 307 URL chuẩn; trang vượt cuối → 307 trang cuối; lỗi backend → `{ temples: null }` (AC 6, AC 8 — phần chỉ có `page`)
- [x] `/temples/[id]` `load`: `getTemple`, 404 → `error(404)`, khác → `error(502)` (AC 18)
- [x] `src/routes/api/temples/+server.ts` proxy `GET /v1/temples/options` cho `onboarding`: `q` trim + cắt 100, bỏ khi rỗng, `page` nguyên dương; lỗi → JSON `{error}` (AC 29, FR-TPL-005)
- [ ] `(site)/+page.server.ts`: bỏ `HOME_TEMPLE_COUNT` / `.slice(0, 7)`, trả mọi chùa của `top` (AC 1, BR-TPL-02)
- [ ] `listTemples(fetch, {page, q?, region?})`: chỉ thêm `q`/`region` khi có (Step 3) *(⚠️ contract)*
- [ ] `/temples` `load`: dùng `parseTempleQuery`, redirect giữ `q`/`region`, trả `query` cho trang (Step 2, Step 3; AC 4, 6, 17)
- [ ] `src/lib/types/temple.ts`: `TempleListQuery.q/region`; `TempleDetail.holiday_operating_hours`, `sangha_body`, `contacts {hotline, fanpage, website, email}`, `content_updated_month: string | null`; sửa chú thích "20 per page", "No province/region filter" *(⚠️ contract)*

## Phase 4 — Tests (`il-testing`)

- [ ] Cài Vitest qua `npx sv add vitest` (repo chưa có test runner; nếu `memorial` cài trước thì dùng chung)
- [ ] Script đồng bộ vector (dùng chung với `memorial` nếu có, vd `scripts/sync-vectors.*`) chép innerlamp-be `docs/product/temple/rules/temple-open-status.json` vào bản pin (vd `tests/vectors/temple/`) kèm commit nguồn; test đọc bản pin, **không sửa tay**; có checkout innerlamp-be thì báo lệch
- [ ] Chạy mọi case của `docs/product/temple/rules/temple-open-status.json` với `templeOpenStatus` + nhãn (locale `vi`): `status`, `label`, `today_row`; kiểm thêm `solarToLunar` ra đúng `vietnam_lunar_day_today` (BR-TPL-09, AC 33)
- [ ] Unit: `parseHours` (đúng dạng / rỗng / chuỗi tự do), `parseTempleQuery` + `templeListHref` (page sai, q khoảng trắng / 101 ký tự / rỗng, region `North` / rỗng / `highlands`), `templeTypeLabel`/`templeRegionLabel` với enum lạ
- [ ] Unit: `listTemples` dựng query đúng; `/temples` `load` với `fetch` giả — mỗi dòng của bảng Error → UI
- [ ] E2E (Playwright, backend thật hoặc giả): trang chủ hiện đủ chùa của `top` và trạng thái rỗng; danh bạ trang 1 / trang cuối / vượt cuối; tìm "bich dong" và "dien huu"; lọc "Miền Nam"; miền + tìm kết hợp; xoá tìm; không khớp; không JS (GET form); trang chùa thiếu giá trị → "Đang cập nhật"; id lạ → `temple_d_not_found_*`; không có nút "Theo dõi"
- [ ] Đo NFR-TPL-01: gửi tìm / đổi miền → trang 1 trong 2 s với throttle 4G (AC 34)

## Phase 5 — Quality (`il-quality`)

- [ ] `npm run check && npm run lint && npm run build` pass

## Phase 6 — Documentation

- [ ] Báo trạng thái cột Website của innerlamp-be `docs/product/temple/product.md` §4.2 cho `ba-writer` (skill này không sửa repo backend)
- [ ] Gỡ mục "Catalogue pages" (phần `/temples`) và "Temple detail" lỗi thời trong `.assumptions.md` (bước dọn tài liệu cũ, làm riêng)
- [ ] OKF concept qua `il-okf-writer` khi feature đã kiểm chứng end-to-end

## Deferred (not blocking temple)

- Chuyển `TempleGrid`/`TempleCatalog`/`TempleDetail`/`TempleEvents` và `utils/temple-labels.ts` sang `src/lib/features/temple/` theo AGENTS.md §5 (tuỳ chọn).
- Lối vào trang chùa từ lịch (FR-TPL-006 "from the calendar") — thuộc feature lịch.
