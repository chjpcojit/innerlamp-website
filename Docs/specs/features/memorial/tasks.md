# Tasks — memorial (Sổ giỗ chạp)

Version: 1.0
Last updated: 2026-10-14
Status: in-progress (drift) — UI và logic tính kỳ giỗ có; lưu trữ còn `localStorage`, chưa gọi backend; chưa có test

> See `changelog.md` in this folder for the version history of this spec.

`[x]` chỉ khi đã kiểm tra tồn tại trong code ngày 2026-10-14 **và** đúng như product spec v1.0 yêu cầu. Mỗi mục trỏ về một dòng của bảng Layers & components hoặc một Step trong `design.md`; số `AC n` là tiêu chí trong `requirements.md`.

## Phase 1 — UI (`il-ui`)

- [x] Route `/memorial`, `/memorial/new`, `/memorial/[id]` + `<svelte:head>` (title; meta description ở trang sổ)
- [x] Khách thấy `GuestPrompt` ở cả ba route, không có mục nào (AC 1)
- [x] Lối vào từ dòng "Sổ giỗ chạp" ở `/profile` và breadcrumb tab "Tôi" (AC 3)
- [ ] Lối vào từ trang chủ cho người đã đăng nhập *(chờ ⚠️ AC 3)*
- [x] `MemorialBook`: đếm người thân, thẻ nổi bật mục gần nhất (quan hệ, lần giỗ, ngày dương kèm thứ, tóm tắt nhắc), danh sách sắp theo số ngày còn lại, nhãn Hôm nay / Ngày mai / còn N ngày, nhấn mạnh ≤ 7 ngày, dấu "Có nhắc" (AC 4)
- [x] Trạng thái sổ trống `mem_empty_*` + nút thêm (AC 7)
- [x] Chữ cái đầu thay ảnh (AC 8)
- [ ] Ngày mất hiển thị kèm năm (khi biết) và dấu nhuận (AC 6) — `deathDateLabel` hiện chỉ có ngày/tháng
- [ ] `MemorialBook` nhận `data.entries` từ `load`; `today` lấy trong `onMount`, SSR không render số ngày (AC 5, Step A-3)
- [ ] Trạng thái `loadError` → `mem_err_load` + `mem_retry` (AC 2)
- [ ] Bỏ phần "có trong lịch nhắc" khỏi tóm tắt nhắc và flash `saved_reminder` (FR-MEM-009 iOS only, §3.6)
- [x] Form mặc định ông nội, âm lịch, ngày 1 tháng 1, không rõ năm (AC 9 — phần giá trị)
- [ ] Ẩn khối cấu hình nhắc và công tắc "Thêm vào lịch nhắc" trong `MemorialForm` (AC 9, §3.6)
- [x] Mười chip quan hệ, chọn một, không nhãn tự do (AC 10)
- [ ] Năm 1900 → năm hiện tại (đang 97 năm gần nhất) (AC 11)
- [ ] Số ngày theo lịch + tháng (+ năm) đã chọn; lỗi `mem_f_date_invalid` / `mem_f_date_not_exist` (AC 11)
- [ ] Lựa chọn tháng nhuận, chỉ hiện khi âm lịch (AC 11, BR-MEM-04)
- [x] Preview kỳ giỗ cập nhật ngay khi đổi ngày/tháng/năm/lịch (AC 12)
- [ ] Preview tính trên ngày/tháng có nhuận khi đã có lựa chọn nhuận (kỳ giỗ vẫn tháng thường — không đổi kết quả, chỉ hiển thị ngày âm đúng) (AC 12)
- [x] Tên rỗng sau trim → `mem_f_name_err`, xoá khi sửa (AC 13 — phần rỗng)
- [ ] Tên > 100 ký tự → `mem_f_name_too_long`; ghi chú > 1000 → `mem_f_note_too_long` (AC 13, AC 14)
- [x] Nút Hủy về sổ, không lưu (AC 19)
- [x] Trang không tìm thấy `mem_not_found` + `mem_back` (AC 17 — phần UI)
- [x] Flash `mem_flash_saved` / `mem_flash_deleted` có `role="status"` (AC 16, AC 20 — phần hiển thị)
- [ ] Chuyển `MemorialForm` sang `<form method="POST">` + `use:enhance` với field thật/ẩn cho chip, lịch, nhuận, `tz` (Step B-1, D-1)
- [ ] Lỗi theo field trả về từ action (`form.errors`) và `mem_err_full` / `mem_err_save` / `mem_err_delete` (bảng Error → UI)
- [ ] Hộp xác nhận xoá `<dialog>` + fallback `?confirm=delete` không JS (AC 20, BR-MEM-12) — code hiện xoá ngay
- [ ] Rà chữ thẻ `mem_pt_2_*` trên website *(chờ ⚠️ Pending)*
- [ ] Thêm/bỏ key i18n theo `design.md` "i18n keys", đủ cả `vi.json` và `en.json` (AC 25)

## Phase 2 — State & logic (`il-state`)

- [x] `nextAnniversary` (`utils/memorial.ts`) hiện thực BR-MEM-05, 06, 07, 08, 09 (ordinal) với `today` truyền vào — chạy thử một lần ngoài repo 17/17 case `next-anniversary.json` đạt ngày 2026-10-14; test trong repo ở Phase 4
- [x] `nthLabel` / `daysLabel` (`utils/memorial-format.ts`) theo BR-MEM-08, BR-MEM-09 (label)
- [x] `solarToLunar` (`utils/lunar.ts`) trả cờ nhuận, UTC+7 (BR-MEM-10) — chạy thử một lần 5/5 case dương → âm của `death-date-conversion.json` đạt
- [ ] `lunarToSolarExact(day, month, year, leap)` trong `utils/lunar.ts`: không lùi ngày 30, hỗ trợ tháng nhuận, `null` khi không tồn tại (BR-MEM-03, BR-MEM-04, BR-MEM-10)
- [ ] `validateMemorialForm` (`utils/memorial-validate.ts`), dùng chung browser và action: tên, ghi chú, ngày mất (1900→nay, tồn tại, không sau hôm nay theo `Asia/Ho_Chi_Minh`), nhuận (AC 11, 13, 14, 15)
- [ ] View model `MemorialEntry` mới (`id` số, `leap`, nhắc chỉ đọc) + DTO `Memorial` / `MemorialRequest` trong `src/lib/types/memorial.ts`
- [ ] Mapper DTO ↔ view model (enum quan hệ; `death_date` → âm + nhuận cho mục âm; form → request) (AC 6, AC 16)
- [ ] Gỡ store `localStorage` trong `state/memorial.svelte.ts` và xoá key `il-memorial` một lần (product §2.7 — không migrate)
- [ ] Dòng "Sổ giỗ chạp" ở `/profile`: lấy số từ `GET /v1/memorials` trong `load` của profile, hoặc bỏ số (đang đọc store `localStorage`)

## Phase 3 — Server data (contract-gated)

- [x] Năm operation có trong innerlamp-be `docs/specs/api/openapi.yaml` @ 5f4ca56 (tag Memorials) — chỉ trích dẫn, không chép schema
- [ ] `src/lib/server/api/memorials.ts`: `listMemorials`, `getMemorial`, `createMemorial`, `updateMemorial`, `deleteMemorial` qua `apiCall`, nhận `event.fetch` + token (AC 21)
- [ ] `memorial/+page.server.ts` `load` (Step A-2): khách không gọi BE; 401 → `endSession` + `/login`; mạng/5xx → `loadError`; đọc + xoá flash
- [ ] `memorial/new/+page.server.ts` action `default` (Step B-2, B-3): validate lại, quy đổi ngày, `POST`, map lỗi → `fail()` theo bảng Error → UI
- [ ] Chốt `reminder` mặc định và `add_to_os_reminder` của body `POST` *(chờ ⚠️ AC 16; tạm theo Step B-3)*
- [ ] `memorial/[id]/+page.server.ts` `load` (Step C-1) và action `save` (Step C-3 GET lại → C-4 `PUT` giữ nguyên `reminder`/`add_to_os_reminder`)
- [ ] `memorial/[id]/+page.server.ts` action `delete` (Step D-2)
- [ ] Cookie flash `il_mem_flash` (`src/lib/server/memorial-flash.ts`) — httpOnly, 60 s, không đưa tên lên URL (AC 22)
- [ ] Không log tên/ghi chú ở mọi nhánh lỗi (chỉ method + path có id + mã lỗi, như `client.ts`) (AC 22, NFR-MEM-02)

## Phase 4 — Tests (`il-testing`)

- [ ] Cài Vitest qua `npx sv add vitest` (repo chưa có test runner)
- [ ] Script `scripts/sync-memorial-vectors.*` chép `rules/*.json` từ innerlamp-be (mặc định `../innerlamp-be`) vào bản pin (vd `tests/vectors/memorial/`) kèm commit nguồn; test đọc bản pin, **không sửa tay**; khi có checkout innerlamp-be thì test so bản pin với nguồn và báo lệch
- [ ] Chạy mọi case của innerlamp-be `docs/product/memorial/rules/next-anniversary.json` với `nextAnniversary` (BR-MEM-05, 06, 07, 08, 09)
- [ ] Chạy mọi case của `docs/product/memorial/rules/anniversary-ordinal.json` với `nthLabel` (BR-MEM-09) — so chuỗi tiếng Việt với locale `vi`
- [ ] Chạy mọi case của `docs/product/memorial/rules/death-date-conversion.json` với `solarToLunar` và `lunarToSolarExact` (BR-MEM-03, 04, 10)
- [ ] Unit: `validateMemorialForm` (các ví dụ của BR-MEM-02/03/04), mapper DTO ↔ view model, `deathDateLabel` có năm/nhuận
- [ ] Unit: `memorials.ts` + actions với `fetch` giả — mỗi dòng của bảng Error → UI
- [ ] E2E (Playwright, backend thật hoặc giả): khách thấy lời mời; thêm âm/dương/nhuận; sổ đầy; sửa giữ nguyên `reminder` do app đặt; sửa mục đã bị xoá nơi khác; xoá có xác nhận / huỷ
- [ ] Đo NFR-MEM-01: sổ 100 mục hiện trong 2 s với throttle 4G

## Phase 5 — Quality (`il-quality`)

- [ ] `npm run check && npm run lint && npm run build` pass

## Phase 6 — Documentation

- [ ] Báo trạng thái cột Website của innerlamp-be `docs/product/memorial/product.md` §4.2 cho `ba-writer` (skill này không sửa repo backend)
- [ ] Gỡ mục "Memorial book" lỗi thời trong `.assumptions.md` (bước dọn tài liệu cũ, làm riêng)
- [ ] OKF concept qua `il-okf-writer` khi feature đã kiểm chứng end-to-end

## Deferred (not blocking memorial)

- Hiện/sửa cấu hình nhắc trên website (FR-MEM-007, BR-MEM-11 — `later`).
- Ảnh chân dung (FR-MEM-011 — `later`, chờ backend `TD-001`).
- Chuyển code sang `src/lib/features/memorial/` theo AGENTS.md §5 (tuỳ chọn).
