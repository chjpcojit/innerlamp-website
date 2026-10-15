# Design — temple (Chùa Việt Nam)

Version: 1.0
Last updated: 2026-10-15
Status: in-progress (drift) — mirror `requirements.md`

> See `changelog.md` in this folder for the version history of this spec.

## Overview

Ba chỗ trong group `(site)`, đều công khai: khối chùa nổi bật ở `/`, danh bạ `/temples` và trang chùa `/temples/[id]`. Dữ liệu đi đúng data path của repo: `load` của `+page.server.ts` → `$lib/server/api/temples.ts` → backend `/v1/temples/*` với `x-api-key`, không token. Tìm và lọc miền là **tham số URL** (`?q=&region=&page=`) do `load` đọc rồi chuyển xuống backend — ô tìm là `<form method="GET">`, có JS thì gửi sau khoảng dừng gõ bằng `goto` (không thêm endpoint `/api/*`). Trạng thái mở/đóng (BR-TPL-09) tính **trong browser** bằng hàm thuần mới ở `src/lib/features/temple/` dùng `src/lib/utils/lunar.ts`. `src/routes/api/temples/+server.ts` chỉ là proxy cho ô chọn chùa của `onboarding`. Làm mẫu gần nhất: danh bạ đang có (`TempleCatalog` + `Pagination` có `params`) và `memorial` (logic thuần chạy sau mount).

## Layers & components

| Layer | File | Responsibility | Trạng thái |
| --- | --- | --- | --- |
| Route (server) | `src/routes/(site)/+page.server.ts` | `loadTopTemples`: `getTopTemples`, trả **mọi** `items`; lỗi → `null` | có — cần bỏ `HOME_TEMPLE_COUNT = 7` (`.slice(0, 7)`) |
| Section UI | `src/lib/components/sections/TempleGrid.svelte` | Khối "Chùa Việt Nam" ở trang chủ: thẻ link `/temples/[id]`, "Xem tất cả" (`SectionHeading href="/temples"`) | có — cần: bỏ nhánh chùa mẫu `TEMPLES`, thêm trạng thái rỗng (AC 2, 3); thẻ theo ⚠️ AC 1 |
| Content | `src/lib/content/temples.ts`, `src/lib/content/home.ts` (`TEMPLES`) | Danh mục chùa **mẫu** (9 chùa, `region: 'highlands'`, `findTemple`, `REGIONS`) | có — **gỡ** khi bỏ fallback (chỉ `home.ts` còn import) |
| Route (server) | `src/routes/(site)/temples/+page.server.ts` | `load`: đọc + chuẩn hoá `page`, `q`, `region` (`parseTempleQuery`), redirect 307 về URL chuẩn, `listTemples`, redirect trang vượt cuối; lỗi → `{ temples: null }` | có — cần thêm `q`, `region`, giữ chúng khi redirect |
| Route (UI) | `src/routes/(site)/temples/+page.svelte` | `<svelte:head>` title/description; `noindex` khi có `q`; truyền `data` cho `TempleCatalog` | có — cần `noindex`, truyền `query` |
| Section UI | `src/lib/components/sections/TempleCatalog.svelte` | `PageHeader` + số chùa; ô tìm + chọn miền (`TempleFilters`); lưới thẻ; rỗng / không khớp / lỗi + thử lại; `Pagination params={q, region}` | có — cần: bộ lọc, thẻ thêm loại chùa, `temples_no_match_*`, `temples_retry`, `params` |
| Feature UI | `src/lib/features/temple/components/TempleFilters.svelte` | `<form method="GET">` có `SearchField` (`name="q"`, `maxlength=100`) + nút gửi ẩn; bốn link miền (`region_*`, giữ `q`); có JS: debounce 300 ms → `goto(url, { replaceState: true, keepFocus: true, noScroll: true })` | **chưa tạo** |
| Feature logic | `src/lib/features/temple/query.ts` | `parseTempleQuery(url) → { page, q, region, canonical }`: `page` nguyên dương (khác → 1), `q` trim + cắt 100 (rỗng → bỏ), `region` ∈ `north`/`central`/`south` (khác → bỏ); `templeListHref({q, region, page})` dựng URL chuẩn (bỏ `page=1`) | **chưa tạo** (thay `parsePage` cục bộ) |
| Route (server) | `src/routes/(site)/temples/[id]/+page.server.ts` | `load`: `getTemple`; 404 → `error(404)`; lỗi khác → `error(502)`; song song: sự kiện + đạo tràng của `sangha` khi có phiên | có — giữ; phần `sangha` không đổi |
| Route (UI) | `src/routes/(site)/temples/[id]/+page.svelte` | Meta; `TempleDetail` | có |
| Route (UI) | `src/routes/(site)/temples/[id]/+error.svelte` | 404: `temple_d_not_found_*` + link `/temples`; status khác: cùng `ErrorScreen` dữ liệu + `err_retry` như `+error.svelte` gốc | **chưa tạo** |
| Section UI | `src/lib/components/sections/TempleDetail.svelte` | Các khối theo bảng "Thứ tự khối"; chỉ nút "Chỉ đường"; mọi giá trị thiếu theo BR-TPL-06 | có — cần sửa nhiều (xem bảng dưới); **gỡ** `templeFollow` |
| Feature UI | `src/lib/features/temple/components/TempleHours.svelte` | Thẻ giờ: dòng trạng thái (chỉ sau mount, `setInterval` 60 s, dọn khi unmount), hai dòng giờ + nhãn `temple_d_today` | **chưa tạo** |
| Feature UI | `src/lib/features/temple/components/TempleContacts.svelte` | Hotline/fanpage/website/email: có giá trị → `tel:`/`https://`/`mailto:`; không → `temple_d_pending` chữ thường | **chưa tạo** |
| Feature logic | `src/lib/features/temple/open-status.ts` | `parseHours(s) → {open, close} \| null` (đúng `HH:MM - HH:MM`); `templeOpenStatus(nowUtc: Date, hours, holidayHours) → { status: 'open'\|'closed'\|'hidden', time: string \| null, todayRow: 'normal'\|'holiday'\|null }` theo BR-TPL-09 | **chưa tạo** |
| Logic | `src/lib/utils/lunar.ts` | `solarToLunar(date)` (đọc `getDate/getMonth/getFullYear` **giờ máy**) — `open-status.ts` dựng ngày Việt Nam từ `nowUtc + 7 h` (getUTC*) rồi gọi `solarToLunar(new Date(y, m − 1, d))` cho hôm nay và ngày mai | có — không đổi |
| Labels | `src/lib/utils/temple-labels.ts` | `templeRankLabel`, `templeSectLabel`; **thêm** `templeTypeLabel`, `templeRegionLabel`; enum lạ → `undefined` | có — cần thêm hai hàm |
| State | `src/lib/state/temple-follow.svelte.ts` | Theo dõi theo thiết bị (`localStorage` `il-temple-follow`) | có — **gỡ** (BR-TPL-08) |
| Section UI | `src/lib/components/sections/TempleEvents.svelte`, `TempleEventList.svelte` | Khối "Sự kiện & khóa học"; list dùng chung với `SanghaMain` | có — `TempleEventList` thêm prop `emptyLabel` (mặc định `temple_ev_empty`), trang chùa truyền `temple_ev_none_posted` |
| API resource | `src/lib/server/api/temples.ts` | `getTopTemples`, `listTemples(fetch, {page, q?, region?})`, `getTemple`, `listTempleOptions`, `suggestTemple` (thuộc `onboarding`) | có — `listTemples` cần `q`, `region` (⚠️ contract) |
| Route (server) | `src/routes/api/temples/+server.ts` | Proxy `GET /v1/temples/options` cho ô chọn chùa (`onboarding`) | có — đúng AC 29 |
| Types | `src/lib/types/temple.ts` | DTO theo openapi; **thêm** `TempleListQuery.q/region`, `TempleDetail.holiday_operating_hours`, `sangha_body`, `contacts`, `content_updated_month` (⚠️ contract); sửa chú thích "20 per page", "No region filter" | có — cần sửa |
| Breadcrumbs | `src/lib/config/breadcrumbs.ts` | `/temples`, `/temples/[id]` (`temple_d_crumb`) | có |
| Offline | `src/lib/components/layout/OfflineGate.svelte` (layout gốc) | Màn/thanh offline toàn site | có — dùng như vậy (AC 8) |
| i18n | `messages/vi.json`, `messages/en.json` | `temples_*`, `temple_*`, `region_*` | có — thêm/bỏ theo bảng "i18n keys" |
| Tests | `src/lib/features/temple/*.spec.ts`, `tests/temples.e2e.ts` | Vector + logic + E2E | **chưa có** (repo chưa cài Vitest/Playwright) |

### Thứ tự khối của trang chùa

Theo prototype "Trang chùa" (`innerlamp-Android/Docs/innerlamp-project/project/docs/Trang-chi-tiet-chua.md`, gợi ý web ≥ 1024px hai cột). Cột "Hiện trạng" là những gì `TempleDetail.svelte` đang làm ngày 2026-10-15.

| # | Khối | Cột (≥ 1024px) | Nguồn dữ liệu | Hiện trạng |
| --- | --- | --- | --- | --- |
| 1 | Header ảnh: chip cấp di tích · hệ phái, tên, `temple_d_aka` ("Còn gọi: " + `aliases` nối " · ", ẩn khi rỗng), phường + tỉnh | toàn chiều ngang | `image_url`, `heritage_rank`, `sect`, `name`, `aliases`, `location.ward`, `location.province` | có chip, tên, tỉnh; thiếu "Còn gọi" (đang ở cột phải với nhãn `temple_d_aliases`), thiếu phường |
| 2 | Hàng hành động: chỉ `temple_d_directions` | phải | `location.lat/lng` | có "Theo dõi" (gỡ) + "Chỉ đường" (URL `search`, đổi `dir`) |
| 3 | Thẻ giờ (`TempleHours`) | phải | `operating_hours`, `holiday_operating_hours` | chỉ in `operating_hours`, ẩn khi rỗng |
| 4 | Bốn ô: niên đại, cấp di tích, hệ phái, miền | phải | `established_year`, `heritage_rank`, `sect`, `region` | chỉ có niên đại |
| 5 | Giới thiệu, thu gọn + `temple_d_read_more`/`temple_d_read_less` | trái | `introduction` | có, ẩn khi rỗng, không thu gọn |
| 6 | Tổ chức & truyền thừa: trụ trì, tổ khai sơn, giáo hội | trái | `current_abbot`, `founder`, `sangha_body` | có trụ trì, tổ khai sơn (ẩn khi rỗng); thiếu giáo hội |
| 7 | Kiến trúc & di sản: kiểu kiến trúc, vật liệu (⚠️ AC 21), đoạn kiến trúc | trái | `architecture_heritage` | có đoạn, ẩn khi rỗng |
| 8 | Tiện ích: ô tô, xe máy, cơm chay, "Kinh sách" (⚠️ AC 21), khóa tu — có/`temple_d_none` | phải | `amenities.*` | chỉ hiện tiện ích có |
| 9 | Lưu ý khi viếng, đánh số `01, 02, …` | trái | `visiting_notes` | có, đánh số `1, 2`, ẩn khi rỗng |
| 10 | Sự kiện & khóa học | trái | `sangha` (khi có phiên) | có; chữ trống cần đổi |
| 11 | Vị trí & liên hệ: địa chỉ đầy đủ, miền, toạ độ, nút bản đồ; `TempleContacts` | phải | `location.full_address`, `region`, `lat/lng`, `contacts.*` | có địa chỉ; thiếu phần còn lại |
| 12 | Chân trang `temple_d_updated({month})` (MM/YYYY), ẩn khi `null`; không có "Báo thông tin sai" | toàn chiều ngang | `content_updated_month` | chưa có |

Thẻ `TempleSanghaCard` (feature `sangha`) giữ chỗ hiện tại, ngay dưới header.

## Route & navigation flow

```
/ ──thẻ chùa──▶ /temples/[id]
  └─"Xem tất cả"──▶ /temples
/temples[?q=&region=&page=]
  ├─ gửi ô tìm (Enter / debounce) ──▶ /temples?q=…[&region=…]          (trang 1, replaceState khi gõ)
  ├─ chọn miền ──▶ /temples?region=…[&q=…]  |  "Tất cả" ──▶ /temples[?q=…]
  ├─ số trang ──▶ ?page=N (giữ q, region)
  ├─ tham số sai / page=1 / vượt cuối ──▶ 307 URL chuẩn
  └─ thẻ chùa ──▶ /temples/[id]
/temples/[id]
  ├─ 404 ──▶ temple_d_not_found_* ──▶ /temples
  ├─ "Chỉ đường" ──▶ https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>  (tab mới)
  └─ liên hệ ──▶ tel: / https:// / mailto:
/sangha ──"Trang chùa" / chùa gợi ý──▶ /temples/[id]   (feature sangha; lịch chưa có link — FR-TPL-006 "from the calendar" chưa làm trên website)
```

Mọi `href`/redirect nội bộ dùng `localizeHref`.

## Step-by-step Flow — Danh bạ: tìm, lọc miền, phân trang

```
Step 1 — Gửi bộ lọc (browser, this feature)
- Trigger: Enter trong ô tìm, bấm một lựa chọn miền, bấm số trang; có JS: ngừng gõ 300 ms
- Pre-condition: —
- Where: `TempleFilters.svelte` (GET form / link), `Pagination` (link `?page=` với `params`)
- Logic: dựng URL bằng `templeListHref` (q trim + cắt 100, bỏ khi rỗng; đổi q/region → bỏ page);
  không JS → trình duyệt gửi GET form; có JS → `goto(localizeHref(url), {replaceState: khi gõ, keepFocus: true, noScroll: true})`

Step 2 — Chuẩn hoá URL (server, this feature)
- Trigger: request tới `/temples`
- Where: `src/routes/(site)/temples/+page.server.ts` `load`
- Logic: `parseTempleQuery(url)`; URL hiện tại ≠ `canonical` (page sai hoặc =1, region sai, q có khoảng trắng thừa / > 100 / rỗng)
    → `redirect(307, canonical)` (giữ các tham số hợp lệ), không gọi backend

Step 3 — Đọc trang (server, this feature)
- Pre-condition: URL đã chuẩn
- API: GET /v1/temples?page=N[&q=…][&region=north|central|south]
  ⚠️ Not confirmed (contract): `q`, `region` chưa có trong openapi.yaml @ a8a016b (backend v2.0 AC 39–44)
    - Success, `items` rỗng, page > 1, total_pages > 0 → `redirect(307, templeListHref({q, region, page: total_pages}))`
    - Success → `{ temples, query: {q, region} }` → thẻ, `temples_page_sub({count: total})`, `Pagination`
      (total = 0: có q/region → `temples_no_match_*`; không → `temples_empty`)
    - Failure (400 INVALID_PAGE / INVALID_FILTER — không mong đợi sau Step 2) → log mã lỗi, `{ temples: null, query }`
    - Failure (mạng / 5xx) → `{ temples: null, query }` → `temples_load_error` + `temples_retry` (link tới URL hiện tại)
```

Trang chủ (`GET /v1/temples/top`) và trang chùa (`GET /v1/temples/{id}`) là một lần gọi rồi render — không cần Step-by-step; nhánh lỗi nằm ở bảng Error → UI của `requirements.md`.

## Trạng thái mở/đóng (BR-TPL-09)

- `templeOpenStatus` là hàm thuần, nhận `nowUtc` (không đọc đồng hồ), nên test chạy được vector `temple-open-status.json` (`now_utc`, `hours`, `holiday_hours` → `status`, `today_row`, nhãn).
- Ngày Việt Nam = các trường UTC của `nowUtc + 7 h`; ngày âm = `solarToLunar(new Date(y, m − 1, d))` (hàm đọc trường giờ máy, nên phải dựng `Date` cục bộ từ y/m/d Việt Nam — không đưa thẳng `nowUtc`). Ngày âm 1 hoặc 15 và có giờ lễ → dùng giờ lễ. "Mở lại" sau giờ đóng lấy giờ mở của **ngày mai** Việt Nam với cùng luật âm lịch.
- Nhãn: `temple_d_status_open({time})` / `temple_d_status_closed({time})`; test so với chữ của vector ở locale `vi`.
- `TempleHours` gọi hàm trong `onMount` và mỗi 60 s; SSR và lần render đầu không có dòng trạng thái (giờ server/cache không bao giờ in ra). Hai dòng giờ thì render ngay ở SSR; nhãn `temple_d_today` chỉ gắn sau mount (cùng nguồn `todayRow`).
- `holiday_operating_hours = ""` → `holidayHours = null`. Dòng "Rằm & Mùng Một" khi đó chờ ⚠️ requirements AC 23.

## i18n keys

Chữ tiếng Việt của các câu product trích nguyên lấy đúng như product (chỉ chỉnh dấu câu); bản `en` do website dịch.

| Key | Dùng cho | Việc |
| --- | --- | --- |
| `temples_title`, `temples_meta_description`, `temples_page_sub`, `temples_empty`, `temples_load_error` | Danh bạ | giữ |
| `temples_retry` | Thử lại khi lỗi tải ("Thử lại") | thêm |
| `temples_search_label`, `temples_search_placeholder`, `temples_search_submit` (ẩn, cho không JS) | Ô tìm | thêm |
| `temples_region_label` | Nhóm lựa chọn miền (aria-label) | thêm |
| `region_all`, `region_north`, `region_central`, `region_south` | Lựa chọn miền, ô "miền" ở trang chùa | giữ |
| `region_highlands` | "Tây Nguyên" (chỉ dữ liệu mẫu) | **bỏ** cùng `content/temples.ts` |
| `temples_no_match_title`, `temples_no_match_hint` | "Không tìm thấy chùa" + gợi ý đổi từ khoá / miền | thêm |
| `temples_featured_empty` | Khối trang chủ rỗng | thêm |
| `temple_type_chua`, `temple_type_thien_vien`, `temple_type_dao_trang`, `temple_type_tinh_xa`, `temple_type_thien_xa` | Loại chùa trên thẻ | thêm |
| `temple_rank_*`, `temple_sect_*`, `temple_photo_label`, `temple_d_crumb`, `temple_d_meta_description` | Nhãn enum, ảnh giữ chỗ, breadcrumb, meta | giữ |
| `temple_d_aka` (`{names}`) | "Còn gọi: …" | thêm; `temple_d_aliases` **bỏ** |
| `temple_d_status_open` (`{time}`), `temple_d_status_closed` (`{time}`), `temple_d_hours_normal`, `temple_d_hours_holiday`, `temple_d_today` | Thẻ giờ | thêm; `temple_d_hours` sửa thành tiêu đề thẻ |
| `temple_d_pending`, `temple_d_none` | "Đang cập nhật", "Không có" | thêm |
| `temple_d_facts_region` (+ dùng lại `temple_d_founded`, nhãn cấp di tích / hệ phái) | Bốn ô thông tin | thêm |
| `temple_d_read_more`, `temple_d_read_less` | "Đọc thêm" / "Thu gọn" | thêm |
| `temple_d_org_title`, `temple_d_sangha_body` (+ `temple_d_abbot`, `temple_d_founder`) | Tổ chức & truyền thừa | thêm |
| `temple_d_arch_style`, `temple_d_materials` | Kiến trúc (⚠️ AC 21) | thêm |
| `temple_amenity_books` (+ `temple_amenity_*` hiện có) | "Kinh sách" (⚠️ AC 21) | thêm |
| `temple_d_location_title`, `temple_d_coords`, `temple_d_map`, `temple_d_hotline`, `temple_d_fanpage`, `temple_d_website`, `temple_d_email` (+ `temple_d_address`) | Vị trí & liên hệ | thêm |
| `temple_d_updated` (`{month}`) | Chân trang "Cập nhật MM/YYYY" | thêm |
| `temple_d_not_found_title`, `temple_d_not_found_body`, `temple_d_not_found_back` | Chùa không có | thêm |
| `temple_d_directions`, `temple_d_intro`, `temple_d_architecture`, `temple_d_visiting`, `temple_d_amenities`, `temple_ev_title` | Tiêu đề / nút | giữ |
| `temple_ev_none_posted` | "Chùa chưa đăng sự kiện nào." trên trang chùa (`temple_ev_empty` giữ cho `/sangha`) | thêm |
| `temple_d_follow`, `temple_d_following` | Nút "Theo dõi" | **bỏ** (BR-TPL-08) |
| `temple_<n>_*` (72 key) | Nội dung 9 chùa mẫu | **bỏ** cùng `content/temples.ts` |

## Deliberately stubbed for now

- **`q`/`region` và bốn nhóm trường mới của chi tiết** — viết theo backend v2.0 AC 39–46, coi là xong khi openapi có (⚠️ contract trong `requirements.md`). Trước đó backend bỏ qua `q`/`region` lạ hay báo lỗi là chưa rõ: chỉ bật `TempleFilters` khi backend đã chạy bản v2.0.
- **Dòng giờ Rằm & Mùng Một khi chùa không có giờ lễ** — chờ ⚠️ requirements AC 23.
- **Khối "để sau" (kiểu kiến trúc, vật liệu, "Kinh sách")** — chờ ⚠️ requirements AC 21.
- **Thẻ trang chủ, khối trang chủ khi lỗi** — chờ ⚠️ requirements AC 1, AC 3.
- Code cũ nằm ở `components/sections`, `state`, `utils` thay vì `src/lib/features/temple/` (AGENTS.md §5); chỉ code mới vào `features/temple/`, chuyển phần cũ là tuỳ chọn (`tasks.md` Deferred).
