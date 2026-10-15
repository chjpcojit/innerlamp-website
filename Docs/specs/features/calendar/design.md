# Design — calendar (Sự kiện Phật giáo)

Version: 1.0
Last updated: 2026-10-15
Status: in-progress (drift) — mirror `requirements.md`

> See `changelog.md` in this folder for the version history of this spec.

## Overview

Hai route trong group `(site)`: `/events` (lịch lễ theo tháng) và `/events/[code]?date=` (chi tiết), cộng khối "Sự kiện Phật giáo" trên `/`. Dữ liệu theo data path của repo: `load` của `+page.server.ts` → `$lib/server/api/calendar.ts` `getCalendarYear` → backend `GET /v1/calendar/events?year=` với `x-api-key`, **không** token (sau backend v3.0). Một năm được cache trong bộ nhớ server theo năm, dùng chung cho mọi người, và bản tốt gần nhất được giữ lại làm "bản sao của website" khi backend lỗi (FR-CAL-007 §3.6). Tải thêm năm là lời gọi tương tác từ browser qua `src/routes/api/calendar/year/+server.ts`. Phần phụ thuộc ngày của máy (nhãn đếm ngày, BR-CAL-13) chạy trong browser sau khi mount; phần không phụ thuộc máy (ghép occurrence với event, chọn tầng của khối trang chủ BR-CAL-15) là hàm thuần chạy trên server. Gần nhất để làm mẫu: chính feature này (đã chạy) và các khối công khai của trang chủ (`getTopDeities` … — gọi không token, lỗi thì không làm vỡ trang).

## Layers & components

| Layer | File | Responsibility | Trạng thái |
| --- | --- | --- | --- |
| Route (UI) | `src/routes/(site)/events/+page.svelte` | Meta, `EventsHeader` (chip), `EventsNext`, `EventsGroups`, nút tải thêm năm, trạng thái lỗi/ bản sao | có — cần: bỏ nhánh `guest`, retry, chip "Lễ lớn", tải thêm qua endpoint (giữ các năm đã nối trong `$state`), lỗi/offline ở cuối, `ev_stale_note`, `today` lấy trong `onMount` |
| Route (server) | `src/routes/(site)/events/+page.server.ts` | `load`: năm hiện tại (VN) → `getCalendarYear` → `{state, year, groups, items, stale}` | có — cần: không token, chỉ năm hiện tại (bỏ tải sẵn năm sau), 401 không còn là khách, trả `stale` |
| Route (server) | `src/routes/api/calendar/year/+server.ts` | `GET ?year=`: kiểm năm ∈ [năm hiện tại VN, 2100], `getCalendarYear`, trả `{year, groups, items, stale}`; lỗi → status không thân dữ liệu | **chưa tạo** |
| Route (UI) | `src/routes/(site)/events/[code]/+page.svelte` | Meta (title = tên, description = `short_description`), `EventDetail`; not-found do `+error.svelte` | có — cần: bỏ nhánh `ev_d_guest` |
| Route (server) | `src/routes/(site)/events/[code]/+page.server.ts` | `load`: năm của `?date=` → chọn lần diễn ra → năm liền kề cho trước/sau → `CalendarEventDetail` | có — cần: không token; bỏ `days_left` tính trên server (chuyển sang browser); 401 không còn là khách; trả `stale` |
| Section UI | `src/lib/components/sections/EventsHeader.svelte` | Tiêu đề, phụ đề năm, chip lọc có số đếm | có — cần chip `major` sau "Tất cả" |
| Section UI | `src/lib/components/sections/EventsNext.svelte` | Thẻ "sự kiện sắp tới" | có — platform extra (xem "Deliberately stubbed"); nhãn đếm theo hàm chung |
| Section UI | `src/lib/components/sections/EventsGroups.svelte` | Danh sách theo tháng, cuộn tới tháng hiện tại (`afterNavigate`), dòng có ngày/thứ, tên, ngày âm, nhóm, đếm ngày, làm mờ dòng đã qua | có — cần: mọi nhãn nhóm (đang `groups[0]`), dấu lễ lớn, dấu nhuận, nhãn "Ngày mai" |
| Section UI | `src/lib/components/sections/EventDetail.svelte` | Header ảnh/gradient, nhóm, đếm ngày, nghỉ lễ, tên, ngày âm + dương; "Ý nghĩa"; "Phật tử thường làm gì"; nav trước/sau; link "Thắp đèn", "Xem ngày âm" | có — cần: ảnh mặc định, dấu lễ lớn, dấu nhuận, đếm ngày tính trong browser theo hàm chung, bỏ dấu đầu dòng, bỏ fallback `short_description` |
| Section UI | `src/lib/components/sections/EventsRoutines.svelte` | Khối trang chủ (cột trái) + "Thời khóa" (cột phải) | có — cần viết lại cột trái: 6 thẻ tháng, ≤ 3 dòng, "+N sự kiện khác", tháng rỗng, lỗi + retry, bản sao |
| Route (server) | `src/routes/(site)/+page.server.ts` | `load` trang chủ: thêm `homeEvents` cho mọi người | có — cần: không token, tải năm hiện tại (+ năm sau khi 6 tháng vượt năm), gọi `buildHomeBlock` |
| Logic | `src/lib/utils/events.ts` | `parseIsoDate`, `daysBetween`, `monthShort`, `leftLabel` | có — cần: `countdown(today, solarDate) → {days, label: 'today'\|'tomorrow'\|'days_left'\|'passed'}` (BR-CAL-13, vector) + `countdownText` map sang key; bỏ `ev_d_*` riêng của chi tiết |
| Logic | `src/lib/utils/calendar-order.ts` | `compareOccurrences(a, b)` theo `solar_date`, `sort_order`, `code` (BR-CAL-12) | **chưa tạo** — chờ `sort_order` |
| Logic | `src/lib/utils/calendar-home.ts` | `buildHomeBlock(occurrences, startYearMonth, months = 6)` → mỗi tháng `{year, month, shown[≤3], more}`; tầng 1 `is_major`, tầng 2 còn lại, tầng 3 `recurrence === 'lunar_monthly'`; chỉ nhóm `buddhist` (BR-CAL-15) | **chưa tạo** — chờ `is_major`, `recurrence`, `sort_order` |
| Logic | `src/lib/utils/event-content.ts` | `paragraphs(text)` / `practices(text)`: tách theo `\r?\n`, trim, bỏ rỗng; `practices` bỏ `-`/`•`/`*` đầu dòng (BR-CAL-14) | **chưa tạo** — hiện là `lines()` nội bộ của `EventDetail` |
| API resource | `src/lib/server/api/calendar.ts` | `getCalendarYear(fetch, year)` → `{calendar, stale}`; cache theo năm; `listCalendarEntries`, `toListItems`, `listMonthItems` | có — cần: bỏ tham số `token`, bỏ xoá bản hết hạn, trả bản cũ khi lỗi (Step A-1) |
| Types | `src/lib/types/calendar.ts` | DTO `CalendarYear`/`CalendarEvent`/`CalendarOccurrence`; view `CalendarListItem`, `CalendarEventDetail`, `CalendarNeighbour` | có — cần: `CalendarEvent` thêm `is_major`, `sort_order`, `recurrence` (chờ contract); `CalendarListItem` thêm `is_major`, `sort_order`, `recurrence`; `CalendarEventDetail` bỏ `days_left`, thêm `stale`; kiểu `HomeBlockMonth` |
| Caller ngoài phạm vi | `src/routes/(site)/lunar/+page.server.ts`, `src/routes/api/calendar/month/+server.ts` | Feature lunar | có — chỉ đổi lời gọi `getCalendarYear` theo chữ ký mới; giữ hành vi |
| Assets | `src/lib/components/ui/LampMark.svelte` (dùng lại) | Ảnh mặc định tạm (⚠️ requirements AC 13) | có |
| i18n | `messages/vi.json`, `messages/en.json` | `ev_*`, `events_*` | có — thêm/sửa/bỏ ở bảng dưới |
| Tests | `src/lib/utils/*.spec.ts`, `src/lib/server/api/calendar.spec.ts`, `tests/calendar.e2e.ts`, `tests/vectors/calendar/` | Vector + logic + E2E | **chưa có** (repo chưa cài Vitest/Playwright) |

## Route & navigation flow

```
/ ──khối "Sự kiện Phật giáo"──┬─ một dòng ──▶ /events/[code]?date=YYYY-MM-DD
                              ├─ "+N sự kiện khác" ──▶ /events
                              └─ "Tất cả" ──▶ /events
/lunar (tab "Sự kiện" của CALENDAR_TABS) ──▶ /events   (nav.ts giữ tab Lịch sáng ở /events)
/events (cuộn tới tháng hiện tại)
  ├─ chip Tất cả / Lễ lớn / <nhóm>  (lọc trong browser)
  ├─ một dòng ──▶ /events/[code]?date=…
  └─ "Xem thêm năm {year}" ──▶ fetch /api/calendar/year?year= ──▶ nối vào danh sách (≤ 2100)
/events/[code]?date=…
  ├─ ‹ sự kiện trước / sự kiện tiếp › ──▶ /events/[code']?date=…   (qua ranh giới năm)
  ├─ "Thắp đèn" ──▶ /practice/lamp ;  "Xem ngày âm" ──▶ /lunar/day?date=…
  └─ không có / ngoài 1900–2100 ──▶ 404 (+error.svelte, quay lại)
```

Mọi `href`/redirect dùng `localizeHref`.

## Cache & bản sao (FR-CAL-007 §3.6)

- Map trong bộ nhớ process, khoá = năm: `{ data: CalendarYear, fetchedAt }`. Năm luôn được gửi rõ ràng (backend trả `Cache-Control: public, max-age` khi có `year`, E17).
- **Tươi** (`now − fetchedAt < CACHE_TTL_MS`, giữ 1 giờ như hiện tại) → trả ngay, `stale: false`, không gọi backend.
- **Hết hạn hoặc chưa có** → gọi backend. Thành công → ghi đè, `stale: false`. Thất bại (`ApiError` mạng / 5xx / 429 / 401) → có bản cũ thì trả nó với `stale: true`; không có thì ném lỗi.
- Không xoá bản hết hạn (chính nó là bản sao). Kích thước bị chặn bởi khoảng năm 1900–2100 (≤ 201 mục).
- Không bao giờ gửi `Authorization` (⚠️ requirements AC 1, mặc định), nên một bản dùng chung cho mọi người là đúng.
- Lưu ý cho backend (hand-off, không phải việc ở đây): mọi request của website tới backend đi từ IP của server SvelteKit, nên giới hạn theo IP (E23) đếm cả website là một khách; cache trên giữ số lần gọi ở mức vài lần mỗi giờ mỗi năm mỗi instance.

## Step-by-step Flow — Mở lịch lễ

```
Step A-1 — Đọc năm hiện tại (this feature)
- Trigger: mở `/events` (SSR hoặc điều hướng client)
- Pre-condition: không (route công khai)
- Where: `src/routes/(site)/events/+page.server.ts` `load` → `getCalendarYear(fetch, vietnamYear())`
- API: GET /v1/calendar/events?year=YYYY (x-api-key, không Bearer) — chờ backend v3.0 E4; trước đó code giữ nhánh token hiện tại
    - Success / cache tươi → `{state: 'ok', year, groups, items: toListItems(listCalendarEntries(...)), stale: false}`
    - Failure (mạng / 5xx / 429 / 401) có bản cũ → như Success với `stale: true` → `ev_stale_note`
    - Failure không bản cũ → `{state: 'unavailable'}` → `ev_unavailable` + `ev_retry` (`invalidateAll()`)

Step A-2 — Đếm ngày và cuộn (browser)
- Trigger: `+page.svelte` mount
- Where: `today` = `$state` gán trong `onMount` (ngày local của máy); `countdown(today, item.solar_date)` trong `$derived`
- Logic: trước mount không render nhãn đếm; `afterNavigate` của `EventsGroups` cuộn tới tháng hiện tại (đã có)
```

## Step-by-step Flow — Tải thêm năm

```
Step B-1 — Bấm tải thêm (browser, this feature)
- Trigger: bấm `ev_load_more` (hoặc `ev_retry` sau lỗi)
- Pre-condition: năm cuối đã nối < 2100; không có lần tải đang chạy
- Where: `src/routes/(site)/events/+page.svelte`
- Logic: `fetch(localizeHref('/api/calendar/year?year=' + (last + 1)))`; ném lỗi mạng hoặc `navigator.onLine === false` → trạng thái `offline`

Step B-2 — Đọc năm (server, this feature)
- Where: `src/routes/api/calendar/year/+server.ts` `GET`
- Pre-condition: `year` là số nguyên trong [năm hiện tại VN, 2100] (không thì 400, không gọi backend)
- API: GET /v1/calendar/events?year=YYYY qua `getCalendarYear` (cùng cache Step A-1)
    - Success (kể cả bản cũ) → 200 `{year, groups, items, stale}` → browser nối vào cuối, gộp nhóm mới (giữ thứ tự danh mục), chip đếm lại, filter giữ nguyên
    - Failure không bản cũ → 502 → browser giữ danh sách, hiện `ev_load_more_failed` + `ev_retry` ở cuối
    - Failure mạng phía browser → `ev_offline` + `ev_retry`
```

## Step-by-step Flow — Chi tiết sự kiện

```
Step C-1 — Đọc năm của lần diễn ra (this feature)
- Trigger: mở `/events/[code]?date=YYYY-MM-DD`
- Where: `src/routes/(site)/events/[code]/+page.server.ts` `load`
- API: GET /v1/calendar/events?year=<năm của date, mặc định năm VN> qua `getCalendarYear`
    - Success / bản cũ → Step C-2 (`stale` truyền xuống trang)
    - Failure (INVALID_YEAR) → error(404)
    - Failure khác, không bản cũ → error(502) → `+error.svelte` có thử lại

Step C-2 — Chọn lần diễn ra (server, pure)
- Logic: `own = entries` có `event.code === code`; rỗng → error(404);
  chọn `own` khớp `date`, không thì lần sắp tới (so với ngày VN), không thì lần cuối

Step C-3 — Năm liền kề cho trước / sau (this feature)
- Pre-condition: lần diễn ra là đầu (trước) hoặc cuối (sau) năm
- API: GET /v1/calendar/events?year=<năm ± 1> qua `getCalendarYear`
    - Success / bản cũ → láng giềng là phần tử cuối / đầu của năm đó
    - Failure → láng giềng `null`, không có link phía đó (không làm hỏng trang)

Step C-4 — Hiển thị (browser)
- Where: `EventDetail.svelte`; nhãn đếm = `countdown(today, solar_date)` sau mount (bỏ `days_left` của server);
  `paragraphs(long_description)`, `practices(guidance)`; mục rỗng ẩn; `image_url` null → ảnh mặc định
```

## Step-by-step Flow — Khối trang chủ

```
Step D-1 — Đọc năm cần cho 6 tháng (this feature)
- Trigger: `load` của `src/routes/(site)/+page.server.ts` (mọi người, không còn nhánh khách)
- Logic: tháng bắt đầu = tháng hiện tại theo `Asia/Ho_Chi_Minh`; cửa sổ 6 tháng vượt tháng 12 → cần cả năm sau
- API: GET /v1/calendar/events?year=Y (và ?year=Y+1 khi cần), song song, qua `getCalendarYear`
    - Success / bản cũ → Step D-2; `stale` = bất kỳ năm nào là bản cũ
    - Failure năm Y không bản cũ → `homeEvents: {state: 'unavailable'}` → `events_unavailable` + `ev_retry` tại chỗ thẻ
    - Failure chỉ năm Y+1 → các tháng thuộc Y+1 hiện `events_unavailable` (thẻ vẫn có)
  Lỗi khác ngoài `ApiError` → ném như hiện tại; mọi lỗi API không làm vỡ trang chủ

Step D-2 — Chọn dòng (server, pure)
- Logic: `buildHomeBlock(occurrences, start, 6)` — chạy `rules/home-block.json`; map field contract → input vector:
  `display_order` ← `sort_order`, `major` ← `is_major`, `every_lunar_month` ← `recurrence === 'lunar_monthly'`, `groups` ← `groups`
- Kết quả `HomeBlockMonth[]` ({year, month, shown ≤ 3 dạng `CalendarListItem`, more}) xuống `EventsRoutines`

Step D-3 — Hiển thị (browser)
- Where: `EventsRoutines.svelte`; nhãn đếm sau mount; `more > 0` → link `events_more_others` tới `/events`;
  tháng không có dòng → `events_month_none`
```

## i18n keys

Chữ tiếng Việt của các key có cột "Product" lấy theo đúng chữ product nêu (BR-CAL-13, §3.1.1); bản `en` theo phần giải nghĩa tiếng Anh của product. Không chép thêm chữ vào spec này.

| Key | Dùng cho | Product | Việc |
| --- | --- | --- | --- |
| `ev_tab_all`, `events_view_all` | Chip / link "Tất cả" | §3.1.1 | giữ |
| `ev_tab_major` | Chip "Lễ lớn" | §3.1.1, FR-CAL-003 | thêm |
| `ev_major` | Dấu lễ lớn trên dòng và chi tiết | BR-CAL-10 | thêm |
| `ev_left_today`, `ev_left_tomorrow`, `ev_left_days`, `ev_left_past` | Nhãn đếm ngày ở mọi nơi | BR-CAL-13 | giữ 3 key (sửa chữ cho khớp "Còn n ngày" / "Đã qua"), thêm `ev_left_tomorrow` |
| `ev_d_in_days`, `ev_d_days_ago` | Đếm ngày riêng của chi tiết | — | **bỏ** (dùng `ev_left_*`) |
| `ev_lunar_date`, `ev_d_lunar` | Ngày âm trên dòng / chi tiết | BR-CAL-08 | sửa: thêm biến thể nhuận (`ev_lunar_date_leap`, `ev_d_lunar_leap`) |
| `ev_d_dos` | Tiêu đề lễ nghi | §3.1.1 "Phật tử thường làm gì" | sửa chữ |
| `ev_d_about` | Tiêu đề mô tả | — | giữ |
| `ev_unavailable`, `events_unavailable` | Lỗi tải, không bản sao | FR-CAL-008 | giữ |
| `ev_retry` | Nút thử lại (`/events`, tải thêm, khối trang chủ) | FR-CAL-008 | thêm |
| `ev_load_more_failed`, `ev_offline` | Lỗi tải thêm năm; trình duyệt offline | FR-CAL-004, FR-CAL-008 | thêm |
| `ev_stale_note` | "Có thể chưa cập nhật" khi dùng bản sao | FR-CAL-007 | thêm |
| `events_more_others` | "+N sự kiện khác" trên thẻ tháng | §3.1.1 | thêm (thay `events_more` "+{count} sự kiện") |
| `events_more` | — | — | **bỏ** sau khi thay |
| `events_month_none` | Thẻ tháng không có sự kiện Phật giáo | BR-CAL-15 | thêm (hoặc dùng lại `events_month_empty` nếu chữ hợp; `events_month_empty` vẫn dùng ở `/lunar`) |
| `events_month_title` (hoặc dùng lại `ev_month_title`) | Tiêu đề thẻ tháng | — | thêm nếu cần dạng ngắn |
| `ev_guest`, `ev_d_guest` | Lời mời đăng nhập | — (FR-CAL-001) | **bỏ** khi gọi không token |
| `events_guest`, `events_today`, `events_days_left`, `events_lunar_date` | Khối trang chủ cũ | — | thôi dùng ở khối trang chủ; **giữ** vì `LunarCalendar.svelte` (ngoài phạm vi) còn dùng |
| `ev_meta_*`, `ev_subtitle`, `ev_filter_label`, `ev_next_label`, `ev_month_title`, `ev_month_count`, `ev_load_more`, `ev_empty`, `ev_d_lamp`, `ev_d_open_day`, `ev_d_prev`, `ev_d_next`, `ev_d_crumb`, `ev_d_back`, `ev_d_holiday`, `events_title`, `events_month_short` | Như hiện tại | — | giữ |

## Deliberately stubbed for now

- **Mọi thứ cần backend v3.0** (route công khai, `is_major`, `sort_order`, `recurrence`): code giữ nhánh token và lời mời đăng nhập tới khi backend triển khai Phase 18 và `openapi.yaml` có các field — `tasks.md` Phase 3 ghi "chờ backend v3.0". `buildHomeBlock` và `compareOccurrences` có thể viết và chạy vector trước (input vector không cần backend), nhưng khối trang chủ mới chỉ bật khi contract có field.
- **Ảnh mặc định** — `LampMark` trên gradient tới khi có file (⚠️ requirements AC 13).
- **Platform extras chưa có trong product §3.6**: thẻ "sự kiện sắp tới" (`EventsNext`) trên `/events`, link "Thắp đèn" và "Xem ngày âm" ở chi tiết, làm mờ dòng đã qua. Giữ nguyên; báo `ba-writer` để ghi vào §3.6 hoặc bỏ.
- Code nằm ở `components/sections`, `utils`, `server/api` thay vì `src/lib/features/calendar/` (AGENTS.md §5); chuyển chỗ là tuỳ chọn, ghi ở `tasks.md` Deferred.
