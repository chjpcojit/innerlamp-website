# Tasks — memorial (Sổ giỗ chạp)

Version: 2.1
Last updated: 2026-10-14
Status: in-progress (drift) — UI, khối nhắc và logic tính kỳ giỗ có; lưu trữ còn `localStorage`, chưa gọi backend; báo múi giờ và lời nhắc trong danh sách thông báo chờ contract; chưa có test

> See `changelog.md` in this folder for the version history of this spec.

`[x]` chỉ khi đã kiểm tra tồn tại trong code ngày 2026-10-14 **và** đúng như product spec v2.1 yêu cầu. Mỗi mục trỏ về một dòng của bảng Layers & components hoặc một Step trong `design.md`; số `AC n` là tiêu chí trong `requirements.md`.

## Phase 1 — UI (`il-ui`)

- [x] Route `/memorial`, `/memorial/new`, `/memorial/[id]` + `<svelte:head>` (title; meta description ở trang sổ)
- [x] Khách thấy `GuestPrompt` ở cả ba route, không có mục nào (AC 1)
- [x] Lối vào từ dòng "Sổ giỗ chạp" ở `/profile` và breadcrumb tab "Tôi" (AC 3, §3.6)
- [x] `MemorialBook`: đếm người thân, thẻ nổi bật mục gần nhất (quan hệ, lần giỗ, ngày dương kèm thứ, tóm tắt nhắc), danh sách sắp theo số ngày còn lại, nhãn Hôm nay / Ngày mai / còn N ngày, nhấn mạnh ≤ 7 ngày, dấu "Có nhắc" (AC 4)
- [x] Trạng thái sổ trống `mem_empty_*` + nút thêm, không có "Lấy từ gia phả" (AC 7)
- [x] Chữ cái đầu thay ảnh (AC 8)
- [ ] Ngày mất hiển thị kèm năm (khi biết) và dấu nhuận (AC 6) — `deathDateLabel` hiện chỉ có ngày/tháng
- [ ] `MemorialBook` nhận `data.entries` từ `load`; `today` lấy trong `onMount`, SSR không render số ngày (AC 5, Step A-3)
- [ ] Trạng thái `loadError` → `mem_err_load` + `mem_retry` (AC 2)
- [ ] Bỏ phần "có trong lịch nhắc" khỏi tóm tắt nhắc và flash `saved_reminder` (FR-MEM-009 đã bỏ)
- [x] Form mặc định ông nội, âm lịch, ngày 1 tháng 1, không rõ năm, nhắc bật trước 1 ngày 07:00 (AC 9)
- [x] Khối nhắc: bật/tắt, lead đúng ngày/1/3/7, giờ 06:00/07:00/12:00/19:00, ẩn lựa chọn khi tắt (AC 16)
- [ ] Bỏ công tắc "Thêm vào lịch nhắc" (`sync`) khỏi `MemorialForm` (AC 16, FR-MEM-009 đã bỏ)
- [ ] Form sửa hiện lựa chọn gần nhất cho giá trị nhắc cũ (AC 17) *(chờ ⚠️ AC 17)*
- [x] Mười chip quan hệ, chọn một, không nhãn tự do (AC 10)
- [ ] Năm 1900 → năm hiện tại (đang 97 năm gần nhất) (AC 11)
- [ ] Số ngày theo lịch + tháng (+ năm) đã chọn; lỗi `mem_f_date_invalid` / `mem_f_date_not_exist` / `mem_f_date_future` / `mem_f_year_min` (AC 11)
- [ ] Lựa chọn tháng nhuận, chỉ hiện khi âm lịch (AC 11, BR-MEM-04)
- [x] Preview kỳ giỗ cập nhật ngay khi đổi ngày/tháng/năm/lịch (AC 12)
- [ ] Preview hiển thị ngày âm đúng khi đã có lựa chọn nhuận (kỳ giỗ vẫn tháng thường) (AC 12)
- [x] Tên rỗng sau trim → `mem_f_name_err`, xoá khi sửa (AC 13 — phần rỗng)
- [ ] Tên > 100 ký tự → `mem_f_name_too_long`; ghi chú > 1000 → `mem_f_note_too_long` (AC 13, AC 14)
- [x] Nút Hủy về sổ, không lưu (AC 21)
- [x] Trang không tìm thấy `mem_not_found` + `mem_back` (AC 19 — phần UI)
- [x] Flash `mem_flash_saved` / `mem_flash_deleted` có `role="status"` (AC 18, AC 22 — phần hiển thị)
- [ ] Chuyển `MemorialForm` sang `<form method="POST">` + `use:enhance` với field thật/ẩn cho chip, lịch, nhuận, nhắc (Step B-1, D-1)
- [ ] Lỗi theo field trả về từ action (`form.errors`) và `mem_err_full` / `mem_err_save` / `mem_err_delete` (bảng Error → UI)
- [ ] Hộp xác nhận xoá `<dialog>` + fallback `?confirm=delete` không JS (AC 22, BR-MEM-12) — code hiện xoá ngay
- [ ] i18n theo bảng "i18n keys" của `design.md`, đủ cả `vi.json` và `en.json` (AC 31):
  - [ ] thêm key có dòng product §3.1.1 (vi đúng nghĩa dòng đó, en theo phần giải nghĩa): `mem_confirm_delete_*`, `mem_err_full`, `mem_f_name_too_long`, `mem_f_note_too_long`, `mem_f_date_invalid`, `mem_f_date_not_exist`, `mem_f_year_min`, `mem_f_date_future`, `mem_err_save`, `mem_err_load` + `mem_retry`, `mem_flash_gone`, `mem_f_leap`, `mem_date_lunar_leap`
  - [ ] sửa `mem_not_found` theo dòng "Entry no longer exists"
  - [ ] thêm `mem_date_with_year`; `mem_err_delete` *(chữ chờ ⚠️ AC 22)*
  - [ ] bỏ `mem_flash_saved_reminder`, `mem_remind_in_calendar`, `mem_sync_title`, `mem_sync_desc`
  - [ ] `mem_notif_*` / `mem_rel_lc_*` chỉ khi contract để website tự dựng chữ lời nhắc *(chờ ⚠️ AC 27)*

## Phase 2 — State & logic (`il-state`)

- [x] `nextAnniversary` (`utils/memorial.ts`) hiện thực BR-MEM-05, 06, 07, 08, 09 (ordinal) với `today` truyền vào — chạy thử một lần ngoài repo 17/17 case `next-anniversary.json` đạt ngày 2026-10-14; test trong repo ở Phase 4
- [x] `nthLabel` / `daysLabel` (`utils/memorial-format.ts`) theo BR-MEM-08, BR-MEM-09 (label)
- [x] `solarToLunar` (`utils/lunar.ts`) trả cờ nhuận, UTC+7 (BR-MEM-10) — chạy thử một lần 5/5 case dương → âm của `death-date-conversion.json` đạt
- [x] `REMIND_LEADS` / `REMIND_TIMES` (`content/memorial.ts`) đúng lựa chọn của BR-MEM-11
- [ ] `lunarToSolarExact(day, month, year, leap)` trong `utils/lunar.ts`: không lùi ngày 30, hỗ trợ tháng nhuận, `null` khi không tồn tại (BR-MEM-03, BR-MEM-04, BR-MEM-10)
- [ ] `validateMemorialForm` (`utils/memorial-validate.ts`), dùng chung browser và action: tên, ghi chú, ngày mất (tồn tại, 1900→nay, không sau hôm nay theo `Asia/Ho_Chi_Minh` — mỗi lỗi một mã), nhuận, lead/giờ thuộc lựa chọn (AC 11, 13, 14, 15, 16)
- [ ] `nearestReminderChoice` (`utils/memorial-reminder.ts`) (AC 17) *(chờ ⚠️ AC 17 cho luật hoà)*
- [ ] `browserTimeZone` / `isIanaTimeZone` (`utils/timezone.ts`) (AC 26)
- [ ] View model `MemorialEntry` mới (`id` số, `leap`, `reminder: {lead, time} | null`, bỏ `sync`) + DTO `Memorial` / `MemorialRequest` trong `src/lib/types/memorial.ts`
- [ ] Mapper DTO ↔ view model (enum quan hệ; `death_date` → âm + nhuận cho mục âm; `reminder` → lựa chọn gần nhất; form → request chỉ với field của product) (AC 6, AC 17, AC 18)
- [ ] Gỡ store `localStorage` trong `state/memorial.svelte.ts` và xoá key `il-memorial` một lần (product §2.7 — không migrate)
- [ ] Dòng "Sổ giỗ chạp" ở `/profile`: lấy số từ `GET /v1/memorials` trong `load` của profile, hoặc bỏ số (đang đọc store `localStorage`)

## Phase 3 — Server data (contract-gated)

- [x] Năm operation Memorials có trong innerlamp-be `docs/specs/api/openapi.yaml` @ bf23f8b (không đổi từ 5f4ca56) — chỉ trích dẫn, không chép schema
- [ ] `src/lib/server/api/memorials.ts`: `listMemorials`, `getMemorial`, `createMemorial`, `updateMemorial`, `deleteMemorial` qua `apiCall`, nhận `event.fetch` + token (AC 23)
- [ ] `memorial/+page.server.ts` `load` (Step A-2): khách không gọi BE; 401 → `endSession` + `/login`; mạng/5xx → `loadError`; đọc + xoá flash
- [ ] `memorial/new/+page.server.ts` action `default` (Step B-2, B-3): validate lại, quy đổi ngày, `reminder` từ form, `POST`, map lỗi → `fail()` theo bảng Error → UI
- [ ] `memorial/[id]/+page.server.ts` `load` (Step C-1) và action `save` (Step C-3 `PUT` với `reminder` từ form)
- [ ] `memorial/[id]/+page.server.ts` action `delete` (Step D-2)
- [ ] Cookie flash `il_mem_flash` (`src/lib/server/memorial-flash.ts`) — httpOnly, 60 s, không đưa tên lên URL (AC 24)
- [ ] Không log tên/ghi chú ở mọi nhánh lỗi (chỉ method + path có id + mã lỗi, như `client.ts`) (AC 24, NFR-MEM-02)
- [ ] Báo múi giờ: `reportAccountTimeZone` trong `users.ts`, `src/routes/api/account-timezone/+server.ts`, cookie `il_tz_reported` (+ xoá trong `endSession`), `reportedTz` trong `(site)/+layout.server.ts`, gọi từ `onMount` của `(site)/+layout.svelte` (Step E-1, E-2, AC 26) *(chờ ⚠️ AC 26 — contract)*
- [ ] Lời nhắc giỗ trong `/notifications` mở `/memorial/[id]` (AC 27, 28) — làm trong spec/feature `notifications` khi contract có danh sách thông báo *(chờ ⚠️ AC 27 — contract)*

## Phase 4 — Tests (`il-testing`)

- [ ] Cài Vitest qua `npx sv add vitest` (repo chưa có test runner)
- [ ] Script `scripts/sync-memorial-vectors.*` chép `rules/*.json` từ innerlamp-be (mặc định `../innerlamp-be`) vào bản pin (vd `tests/vectors/memorial/`) kèm commit nguồn; test đọc bản pin, **không sửa tay**; khi có checkout innerlamp-be thì test so bản pin với nguồn và báo lệch (chỉ ba file của client — `reminder-moment.json` là của backend, product §4.3)
- [ ] Chạy mọi case của innerlamp-be `docs/product/memorial/rules/next-anniversary.json` với `nextAnniversary` (BR-MEM-05, 06, 07, 08, 09)
- [ ] Chạy mọi case của `docs/product/memorial/rules/anniversary-ordinal.json` với `nthLabel` (BR-MEM-09) — so chuỗi tiếng Việt với locale `vi`
- [ ] Chạy mọi case của `docs/product/memorial/rules/death-date-conversion.json` với `solarToLunar` và `lunarToSolarExact` (BR-MEM-03, 04, 10)
- [ ] Unit: `validateMemorialForm` (các ví dụ của BR-MEM-02/03/04/11), `nearestReminderChoice`, `isIanaTimeZone`, mapper DTO ↔ view model, `deathDateLabel` có năm/nhuận
- [ ] Unit: `memorials.ts` + actions + `api/account-timezone` với `fetch` giả — mỗi dòng của bảng Error → UI
- [ ] E2E (Playwright, backend thật hoặc giả): khách thấy lời mời; thêm âm/dương/nhuận; nhắc mặc định; đổi nhắc 7 ngày 06:00 rồi đọc lại; sổ đầy; sửa/xoá mục đã bị xoá nơi khác (`mem_flash_gone`); xoá có xác nhận / huỷ; server lỗi → `mem_err_load`
- [ ] Đo NFR-MEM-01: sổ 100 mục hiện trong 2 s với throttle 4G

## Phase 5 — Quality (`il-quality`)

- [ ] `npm run check && npm run lint && npm run build` pass

## Phase 6 — Documentation

- [ ] Báo trạng thái cột Website của innerlamp-be `docs/product/memorial/product.md` §4.2 cho `ba-writer` (skill này không sửa repo backend)
- [ ] Spec `Docs/specs/features/notifications/` cho danh sách thông báo (ADR-0001) qua spec-writer — phụ thuộc của AC 27, 28
- [ ] Gỡ mục "Memorial book" lỗi thời trong `.assumptions.md` (bước dọn tài liệu cũ, làm riêng)
- [ ] OKF concept qua `il-okf-writer` khi feature đã kiểm chứng end-to-end

## Deferred (not blocking memorial)

- Ảnh chân dung (FR-MEM-011 — `later`, chờ backend `TD-001`).
- Chuyển code sang `src/lib/features/memorial/` theo AGENTS.md §5 (tuỳ chọn).
