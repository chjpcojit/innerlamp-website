# Tasks — calendar (Sự kiện Phật giáo)

Version: 1.0
Last updated: 2026-10-15
Status: in-progress (drift) — lịch lễ, chi tiết (có trước/sau) và khối trang chủ chạy với backend thật nhưng chỉ cho người đã đăng nhập; công khai, lễ lớn, khối trang chủ theo tầng chờ backend v3.0; chưa có test

> See `changelog.md` in this folder for the version history of this spec.

`[x]` chỉ khi đã kiểm tra tồn tại trong code ngày 2026-10-15 **và** đúng như product spec v1.1 yêu cầu. Mỗi mục trỏ về một dòng của bảng Layers & components hoặc một Step trong `design.md`; số `AC n` là tiêu chí trong `requirements.md`. Mục ghi *(chờ backend v3.0)* cần innerlamp-be calendar Phase 18 đã triển khai và `openapi.yaml` có field tương ứng.

## Phase 1 — UI (`il-ui`)

- [x] Route `/events` + `<svelte:head>` (title, meta description) — `events/+page.svelte`
- [x] Danh sách theo tháng dương, cuộn tới tháng hiện tại sau điều hướng (AC 3) — `EventsGroups.svelte` `afterNavigate`
- [x] Dòng có ngày dương kèm thứ, tên, ngày âm, nhãn đếm ngày, dấu ngày nghỉ lễ (AC 4 — phần đã khớp)
- [x] Chip "Tất cả" + một chip mỗi nhóm theo thứ tự `data.groups`, có số đếm, lọc trong browser (AC 7 — phần nhóm)
- [x] Dòng mở `/events/[code]?date=<solar_date>` (AC 8)
- [ ] Mọi nhãn nhóm của sự kiện trên dòng, theo thứ tự nhóm danh mục (AC 4) — đang chỉ `groups[0]`
- [ ] Dấu nhuận trên ngày âm ở dòng, thẻ sắp tới, chi tiết, khối trang chủ (`ev_lunar_date_leap`, `ev_d_lunar_leap`) (AC 4, 11, 22)
- [ ] Chip `ev_tab_major` sau "Tất cả" và dấu `ev_major` trên dòng / chi tiết (AC 4, 7, 11) *(chờ backend v3.0 — `is_major`)*
- [ ] Nhãn đếm ngày dùng hàm chung `countdown` ở mọi nơi; thêm "Ngày mai"; chi tiết bỏ `ev_d_in_days` / `ev_d_days_ago`; `today` lấy trong `onMount`, SSR không render nhãn (AC 6, Step A-2, C-4, D-3)
- [ ] `/events`: bỏ nhánh `guest` (`ev_guest`) (AC 1) *(chờ backend v3.0)*
- [ ] `/events`: trạng thái `unavailable` có nút `ev_retry` (`invalidateAll()`) (AC 17, 20)
- [ ] `/events`: ghi chú `ev_stale_note` khi `stale` (AC 19)
- [ ] `/events`: nút tải thêm gọi `/api/calendar/year`, giữ các năm đã nối trong `$state`, ẩn sau 2100; lỗi → `ev_load_more_failed` / `ev_offline` + `ev_retry` ở cuối; gộp nhóm mới, filter giữ nguyên (AC 9, 18, Step B-1)
- [x] Route `/events/[code]` + meta (title = tên, description = `short_description` hoặc `ev_meta_description`) (AC 16)
- [x] Chi tiết: nhóm, nghỉ lễ, tên, ngày âm, ngày dương kèm thứ, "Ý nghĩa", lễ nghi đánh số, không có gợi ý kinh / chùa (AC 11 — phần đã khớp)
- [x] Tách mô tả và lễ nghi chỉ theo xuống dòng, ẩn mục rỗng (AC 12 — phần đã khớp) — `EventDetail.svelte` `lines()`
- [x] Sự kiện trước / tiếp qua ranh giới năm, không có link khi năm liền kề lỗi (AC 15, Step C-3)
- [x] Không có trong năm / năm ngoài khoảng → 404 có quay lại (AC 14) — `+error.svelte`
- [ ] Bỏ dấu `-` / `•` / `*` đầu mỗi việc của lễ nghi (AC 12) — qua `utils/event-content.ts`
- [ ] Bỏ fallback `short_description` khi `long_description` rỗng (AC 12) *(mặc định ⚠️ AC 12, chờ ba-writer xác nhận)*
- [ ] Ảnh mặc định khi `image_url` null — tạm `LampMark` trên gradient (AC 13) *(⚠️ AC 13 — file ảnh chung)*
- [ ] Chi tiết: bỏ nhánh `ev_d_guest` (AC 1) *(chờ backend v3.0)*; hiện `ev_stale_note` khi `stale` (AC 19)
- [ ] Khối trang chủ (`EventsRoutines.svelte`): 6 thẻ tháng, ≤ 3 dòng mỗi thẻ (ngày, tên, ngày âm, đếm ngày), `events_more_others` → `/events`, tháng rỗng `events_month_none`, lỗi `events_unavailable` + `ev_retry` tại chỗ thẻ, `ev_stale_note`, không còn lời mời đăng nhập (AC 17, 19, 21, 22, 23, Step D-3) *(chờ backend v3.0)*
- [x] "Tất cả" của khối trang chủ mở `/events` (AC 23)
- [ ] i18n theo bảng "i18n keys" của `design.md`, đủ cả `vi.json` và `en.json` (AC 27):
  - [ ] thêm `ev_tab_major`, `ev_major`, `ev_left_tomorrow`, `ev_lunar_date_leap`, `ev_d_lunar_leap`, `ev_retry`, `ev_load_more_failed`, `ev_offline`, `ev_stale_note`, `events_more_others`, `events_month_none`
  - [ ] sửa `ev_d_dos` theo §3.1.1 ("Phật tử thường làm gì"); `ev_left_days` / `ev_left_past` theo chữ BR-CAL-13
  - [ ] bỏ `ev_d_in_days`, `ev_d_days_ago`, `events_more`; bỏ `ev_guest`, `ev_d_guest` khi route công khai *(chờ backend v3.0)*; giữ `events_*` còn dùng ở `LunarCalendar.svelte`

## Phase 2 — State & logic (`il-state`)

- [x] `listCalendarEntries` / `toListItems` / `listMonthItems` (`server/api/calendar.ts`) ghép occurrence với event, giữ thứ tự backend (BR-CAL-12), không tự sinh Rằm / Mùng 1 (AC 5)
- [x] `parseIsoDate`, `daysBetween`, `monthShort` (`utils/events.ts`)
- [ ] `countdown(today, solarDate) → {days, label}` + map label → key (`utils/events.ts`) theo BR-CAL-13 (AC 6)
- [ ] `paragraphs` / `practices` (`utils/event-content.ts`) theo BR-CAL-14 (AC 12)
- [ ] `compareOccurrences` (`utils/calendar-order.ts`) theo BR-CAL-12 (AC 21) *(dùng `sort_order` — chờ backend v3.0 để chạy với dữ liệu thật; chạy vector được trước)*
- [ ] `buildHomeBlock` (`utils/calendar-home.ts`) theo BR-CAL-15, nhóm `buddhist`, 6 tháng từ tháng bắt đầu (AC 21, Step D-2) *(chờ backend v3.0 cho dữ liệu thật; chạy vector được trước)*
- [ ] Types: `CalendarEvent` + `CalendarListItem` thêm `is_major`, `sort_order`, `recurrence`; `CalendarEventDetail` bỏ `days_left`, thêm `stale`; `HomeBlockMonth` (`types/calendar.ts`) *(field DTO chờ backend v3.0)*

## Phase 3 — Server data (contract-gated)

- [x] `GET /v1/calendar/events` có trong innerlamp-be `docs/specs/api/openapi.yaml` @ a8a016b — chỉ trích dẫn, không chép schema
- [x] `getCalendarYear` cache theo năm trong bộ nhớ server, TTL 1 giờ (`server/api/calendar.ts`)
- [ ] `getCalendarYear(fetch, year)`: bỏ tham số `token` (không gửi Bearer); giữ bản hết hạn làm bản sao; lỗi `ApiError` có bản cũ → trả `{calendar, stale: true}` (AC 1, 19, design "Cache & bản sao", Step A-1) *(bỏ token: chờ backend v3.0 E4)*
- [ ] Cập nhật lời gọi ở caller ngoài phạm vi (`(site)/lunar/+page.server.ts`, `api/calendar/month/+server.ts`) theo chữ ký mới, giữ hành vi lunar
- [ ] `events/+page.server.ts` `load` (Step A-1): chỉ năm hiện tại VN, không token, 401 = lỗi tải (không còn `guest`), trả `stale` (AC 1, 2, 3, 17, 19) *(chờ backend v3.0)*
- [ ] `src/routes/api/calendar/year/+server.ts` (Step B-2): kiểm năm ∈ [năm hiện tại VN, 2100] → 400; trả `{year, groups, items, stale}`; lỗi không bản cũ → 502 (AC 9, 10)
- [ ] `events/[code]/+page.server.ts` `load` (Step C-1…C-3): không token, 401 không còn là khách, bỏ `days_left`, trả `stale` (AC 1, 11, 19) *(chờ backend v3.0)*
- [ ] `(site)/+page.server.ts` `load` (Step D-1, D-2): mọi người, năm hiện tại (+ năm sau khi cần), `buildHomeBlock`, `homeEvents` có `state` / `stale` (AC 17, 19, 21) *(chờ backend v3.0)*
- [ ] Cập nhật dòng `Contract:` của `requirements.md` khi `openapi.yaml` có các thay đổi v3.0 (bump spec minor)

## Phase 4 — Tests (`il-testing`)

- [ ] Cài Vitest qua `npx sv add vitest` (repo chưa có test runner) — dùng chung với memorial
- [ ] Bản pin vector: script đồng bộ chung (memorial `tasks.md` Phase 4 đã lên kế hoạch `scripts/sync-memorial-vectors.*`; mặc định gộp thành một script có tham số feature) chép `docs/product/calendar/rules/{countdown,ordering,home-block}.json` từ innerlamp-be (mặc định `../innerlamp-be`) vào `tests/vectors/calendar/` kèm commit nguồn; test đọc bản pin, **không sửa tay**; khi có checkout innerlamp-be thì so bản pin với nguồn và báo lệch (`event-placement.json` là của backend, không chép)
  > ⚠️ Not confirmed (platform, default chọn): đọc vector từ bản pin `tests/vectors/calendar/` (để CI không cần checkout innerlamp-be) thay vì đọc thẳng `../innerlamp-be`. Merge PR = duyệt.
- [ ] Chạy mọi case của innerlamp-be `docs/product/calendar/rules/countdown.json` với `countdown` (BR-CAL-13)
- [ ] Chạy mọi case của `docs/product/calendar/rules/ordering.json` với `compareOccurrences` (BR-CAL-12, BR-CAL-05)
- [ ] Chạy mọi case của `docs/product/calendar/rules/home-block.json` với `buildHomeBlock` (BR-CAL-15), map `display_order`/`major`/`every_lunar_month` như design Step D-2
- [ ] Unit: `paragraphs` / `practices` (xuống dòng, dấu đầu dòng, không tách theo dấu phẩy), `listCalendarEntries`, cache `getCalendarYear` (tươi / hết hạn / lỗi có bản cũ / lỗi không bản cũ) với `fetch` giả, `api/calendar/year` (400 / 200 / 502)
- [ ] E2E (Playwright, backend thật hoặc giả): khách mở `/events`, `/events/[code]`, `/` thấy lịch; chip Tất cả / Lễ lớn / nhóm; tải thêm năm và lỗi + retry; chi tiết trước / sau qua năm; chi tiết không ảnh / không lễ nghi; backend lỗi → bản sao + ghi chú; backend lỗi lần đầu → thông báo + thử lại; khối trang chủ 6 thẻ
- [ ] Đo NFR-CAL-03: `/events` năm hiện tại < 2 s với throttle 4G, < 0,5 s khi server đã có bản sao (AC 25)

## Phase 5 — Quality (`il-quality`)

- [ ] `npm run check && npm run lint && npm run build` pass

## Phase 6 — Documentation

- [ ] Báo trạng thái cột Website của innerlamp-be `docs/product/calendar/product.md` §4.2 cho `ba-writer` (skill này không sửa repo backend) — xem `changelog.md` v1.0 "Drift"
- [ ] Gỡ mục "Events page (`/events`)" lỗi thời trong `.assumptions.md` (bước dọn tài liệu cũ, làm riêng)
- [ ] OKF concept qua `il-okf-writer` khi feature đã kiểm chứng end-to-end

## Deferred (not blocking calendar)

- Chuyển code sang `src/lib/features/calendar/` theo AGENTS.md §5 (tuỳ chọn).
- Ảnh sự kiện thật (product §2.7 — chưa có ảnh).
