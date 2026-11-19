# Changelog — memorial Spec

Tracks version history for `requirements.md`, `design.md`, and `tasks.md` in this folder. All three
files share one changelog since they change together as one spec unit. Newest version first.

## v3.4 (2026-11-17)

- Audit "code done thì tick" cho `tasks.md` v3.3: đối chiếu 54 `[x]` với code + test thật —
  **54/54 đúng, không bỏ tick nào**; 2 `[ ]` vẫn mở đúng lý do.
- Gate chạy lại: `make verify` exit 0 (svelte-check 0 error, 1 warning ở `SutraDetail.svelte`
  không liên quan memorial; prettier + eslint pass; build pass) và `npm test` 217/217 pass.
- Sửa mô tả cho khớp code, không đổi tick: `nextAnniversary` **không** nhận `leap`
  (`utils/memorial.ts:7`); flash cookie chỉ `{kind}` (`types/memorial.ts:89`,
  `memorial-flash.ts:28`); key `il-memorial` xoá ở root `+layout.svelte:42`.
- G1: `impact.md` (Android/InnerLamp-memorial) có `reviewed_by: ""` ở cả ba repo — thiếu **cả**
  Thiên Cơ (BA) và Hộ Pháp (Security), không phải chỉ Hộ Pháp.
- Playwright: `package.json` không có dependency, không có `playwright.config.*` hay
  `tests/*.e2e.ts` — vẫn `[NOT RUN]`.

## v3.5 (2026-11-19)

- Photos enabled on the web after the backend hardening (BE main `fe64576`): the switch is on by
  default, `MEMORIAL_PHOTO_ENABLED=false` is the kill switch; `.env.example` now shows `true`.
- Real dev smoke (test account, cleaned up): `PUT /v1/memorials/{id}/photo` 200 → `GET` has
  `photo_url` → signed GCS 200 JPEG; 413/415/404 return the contract codes. Web action upload 200,
  proxy `GET /memorial/{id}/photo` 200 JPEG with no signed URL in HTML, `?/photoDelete` 303 and the
  proxy then 404.
- `photo` action maps 404 to `mem_flash_gone` + list redirect rather than a generic photo error.
- Tests: 217 passing.

## v3.3 (2026-11-17)

- QA P7 rework:
  - single-submit gate (`canStartMemorialSubmit`, `submitting`) disables the save button and blocks
    a second POST while the first is in flight;
  - the add link is not rendered at `total >= 100`; a disabled button plus `mem_err_full` is shown;
  - action 401 keeps the form and draft, ends the cookie session and shows `mem_err_session` with a
    sign-in link instead of redirecting (Q-4=A);
  - the header count uses `total`, showing `shown/total` when `items.length` disagrees, and the
    add/full decision uses `total`.
- Deferred: photo picking on the create form (flag off, Q-2).
- Tests: 217 passing.

## v3.2 (2026-11-17)

- P6 rework after Tech Lead review:
  - `MemorialBook` renders a portrait only when both `photoEnabled` and `hasPhoto` are true; the list
    loader now returns `photoEnabled`, so a disabled flag never produces a broken `/photo` image.
  - The portrait proxy no longer caches signed URLs: every request reads the current URL, so a
    replaced or deleted portrait is visible immediately (no invalidation hook needed).
  - The note validation code is `note_long` (was `long`, which rendered the name-too-long copy);
    contract limit stays 1000 characters.
- Tests: 209 passing (photo flag helper, no-cache lookup, note mapping).

## v3.1 (2026-11-17)

- G1 security review (Hộ Pháp, 2026-11-16) applied to the web feature:
  `Cache-Control: private, no-store` + `Referrer-Policy: no-referrer` on memorial pages; portrait
  signed URL removed from the view model and proxied same-origin at `/memorial/{id}/photo`
  (`hasPhoto` boolean, no server URL cache, one refresh on 403); fail-closed guard before every
  memorial API call (401 in the resource layer); global CSP with `frame-ancestors 'none'`,
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`; flash cookie reduced to `{kind}`
  (no name/date); legacy `localStorage['il-memorial']` cleared once and never written; photo flag
  stays `false` even though the backend deployed both routes on 2026-11-17 (401 without a token).
  Tests: 202 passing.
- `requirements.md` v3.1 adds SEC-01…06; `design.md` v3.1 and `flow.md` v1.1 reflect the proxy and
  headers; `tasks.md` v3.1 adds Phase 10.

## v3.0 (2026-11-16)

- P4 web integration. `requirements.md`: header contract đổi sang bản pin `client-contract.md`
  (OpenAPI 3.1.0, `e5d4c9c`, 7 route), AC 1–25/30–31 giữ số và sửa theo contract; AC 26–29 dời
  Phase 8–10; thêm AC mới giữ ID xuyên nền tảng `MEM-API-01…16`, `MEM-IMG-01…11`, `MEM-WEB-01…02`
  từ `ac-memorial-clients-v1.md` v1.0. Bỏ phạm vi báo múi giờ + danh sách thông báo khỏi v1.
- `design.md`: bỏ `state/memorial.svelte.ts`; thêm `server/api/memorials.ts`, `memorial-map.ts`,
  `memorial-flash.ts`, `memorial-config.ts`, `utils/memorial-validate.ts`,
  `utils/memorial-reminder.ts`, `lunarToSolarExact`; ảnh sau cờ `MEMORIAL_PHOTO_ENABLED` (mặc định
  false); i18n thêm key lỗi/xác nhận/ảnh, bỏ key `sync`.
- `flow.md` (mới): F1 mở sổ, F2 thêm, F3 sửa, F4 xoá, F5 ảnh sau cờ, F6 hết phiên, F7 bảng lỗi.
- `tasks.md`: Phase 0 P2 + W1–W8, mỗi task gắn `[ui-first]`/`[integration]`.
- `client-contract.md` (mới): bản pin 2026-11-16, không sửa nội dung hợp đồng.
- Tech-debt: `TD-MEM-CLIENT-01…05` trong `Docs/Tech-Debt/Memorial/`.
- Vector: `tests/vectors/memorial/{next-anniversary,anniversary-ordinal,death-date-conversion}.json`
  - `SOURCE.json` (product rules @ `e5d4c9c`).
- Reason: P2 cho P4-W theo `task-breakdown-p4.md`; contract chốt 7 route, 2 route ảnh chưa deploy.

## v2.1 (2026-10-14)

- `requirements.md`: hai `⚠️ Not confirmed (product)` đã có câu trả lời ở product v2.1 — AC 17 lấy luật "lựa chọn gần nhất" của FR-MEM-007 (cách đều thì chọn nhắc sớm hơn / giờ sớm hơn); AC 22 lấy chữ "Chưa xóa được. Vui lòng thử lại." của §3.1.1. `design.md`/`tasks.md` chỉ đổi version (task nearest-choice và i18n giữ nguyên, nay đã có giá trị cụ thể).

## v2.0 (2026-10-14)

- `requirements.md`: theo product v2.0/v2.1 (reminder do server gửi). Header `Product spec` @ v2.1, `Contract` @ bf23f8b (Memorials không đổi từ 5f4ca56), `Implements` thêm FR-MEM-007, FR-MEM-008 (chỉ danh sách thông báo), BR-MEM-11 đầy đủ, bỏ FR-MEM-009. Thêm mục Dependencies (feature `notifications`, `login`). Bỏ biến thể "website ẩn cấu hình nhắc / giữ nguyên khi lưu": AC 9 mặc định nhắc 1 ngày 07:00, AC 16 khối nhắc (lead 0/1/3/7, giờ 06/07/12/19, không có ứng dụng nhắc của máy, không gợi ý push), AC 17 lựa chọn gần nhất cho giá trị cũ, AC 18/20 `POST`/`PUT` gửi cấu hình nhắc của form (bỏ đọc lại `GET` trước `PUT`). AC 3 lối vào từ trang Hồ sơ (§3.6); AC 7 sổ trống không có "Lấy từ gia phả"; AC 2 server lỗi → báo lỗi, không offline; AC 20/22 mục đã bị xoá nơi khác → `mem_flash_gone`; AC 11 tách bốn lỗi ngày mất theo §3.1.1. Mới: AC 26 báo múi giờ trình duyệt làm múi giờ tài khoản, AC 27–28 lời nhắc trong danh sách thông báo (không push), AC 29 công tắc thông báo toàn tài khoản không ảnh hưởng website, AC 31 chữ theo product §3.1.1. Đánh lại số AC (25 → 31). Chín câu hỏi chuyển sang "resolved".
- `design.md`: bỏ Step C-3 cũ (đọc lại `reminder` trước `PUT`); `PUT` thành Step C-3. Thêm Step-by-step Flow E (báo múi giờ: `onMount` layout → `src/routes/api/account-timezone/+server.ts` → backend, cookie `il_tz_reported`). Layers: `memorial-reminder.ts` (`nearestReminderChoice`), `timezone.ts`, `users.ts reportAccountTimeZone`, layout `(site)`, feature `notifications` ghi là phụ thuộc; bỏ `sync` khỏi view model. Bảng i18n mới nối từng key với dòng §3.1.1 (thêm `mem_f_year_min`, `mem_f_date_future`, sửa `mem_not_found`, `mem_notif_*` có điều kiện; bỏ key ứng dụng nhắc của máy).
- `tasks.md`: `[x]` mới đã kiểm trong code 2026-10-14 — khối nhắc đúng lựa chọn và mặc định (`MemorialForm.svelte`, `content/memorial.ts`), sổ trống không có "Lấy từ gia phả". Bỏ task "lối vào từ trang chủ", "chốt body `POST`", "rà chữ `mem_pt_2_*`", "ẩn khối nhắc", Deferred "cấu hình nhắc". Thêm task bỏ công tắc `sync`, `nearestReminderChoice`, múi giờ, i18n theo §3.1.1, lời nhắc trong `/notifications`, spec `notifications`.
- Product spec / contract: adopt product v2.0 (MAJOR, ADR-0001, ADR-0002) và câu trả lời v2.1 cho công tắc toàn tài khoản (FR-MEM-008: chỉ dừng push). IDs ảnh hưởng: BR-MEM-11, FR-MEM-001, 002, 003, 004, 005, 007, 008, 009 (bỏ), 010. Contract @ bf23f8b — chưa có thao tác múi giờ tài khoản và danh sách thông báo.
- Còn mở: `⚠️ Not confirmed (product)` — luật hoà của "lựa chọn gần nhất" (AC 17); chữ "xoá không thành công" (AC 22). `⚠️ Not confirmed (contract)` — ghi múi giờ tài khoản (AC 26); danh sách thông báo và nội dung lời nhắc giỗ (AC 27).
- Hand-offs: `ba-writer` — hai câu product ở trên. Backend — thao tác ghi múi giờ tài khoản (Appendix B 3); danh sách thông báo + lời nhắc giỗ mang id mục và đủ dữ liệu cho chữ §3.1.1, hoặc chữ dựng sẵn (Appendix B 7); thu hẹp `reminder` theo BR-MEM-11 và bỏ field ngoài product (Appendix B 2, 6).
- Reason: product spec memorial v2.0 (reminder do server gửi) và câu trả lời của product owner 2026-10-14.

## v1.0 (initial) (2026-10-14)

- `requirements.md`: spec đầu tiên, viết retroactively từ code đang chạy (đọc 2026-10-14) và đối chiếu với product spec innerlamp-be `docs/product/memorial/product.md` @ v1.0, contract `docs/specs/api/openapi.yaml` @ 5f4ca56. Header `Product spec` / `Contract` / `Implements`; 25 tiêu chí EARS, mỗi tiêu chí gắn `FR-MEM-*` / `BR-MEM-*` / `NFR-MEM-*` hoặc `(platform)`; bảng Error → UI có cột "Hiện trạng code"; 3 marker `⚠️ Not confirmed (product)`.
- `design.md`: tạo mới — bảng Layers & components (cái đã có / cần sửa / chưa tạo), navigation, bốn Step-by-step Flow (mở sổ; thêm; sửa có đọc lại `reminder` trước `PUT`; xoá có xác nhận), cookie flash `il_mem_flash`, danh sách key i18n thêm/bỏ.
- `tasks.md`: tạo mới — 6 Phase; `[x]` chỉ cho phần đã kiểm trong code và đúng product (giao diện sổ, form, preview, `nextAnniversary`, `solarToLunar`); mọi việc lưu trữ backend `[ ]`; task chạy ba file vector của product.
- Product spec / contract: adopt product v1.0 (Website column của §4.2, §3.6 dòng FR-MEM-007/BR-MEM-11, FR-MEM-008, FR-MEM-009, FR-MEM-010, BR-MEM-05…10); contract @ 5f4ca56, 5 route Memorials.
- Drift so với product (để `ba-writer` thấy cột Website là `drift`): sổ nằm trong `localStorage`, không gắn tài khoản (BR-MEM-01; trang đã chặn khách nhưng dữ liệu không lên backend); form hiện cấu hình nhắc và "Thêm vào lịch nhắc" (trái §3.6, FR-MEM-009); không có lựa chọn tháng nhuận (BR-MEM-04); năm chỉ 97 năm gần nhất, ngày dương cho tới 31 mọi tháng, không kiểm ngày tồn tại / sau hôm nay (BR-MEM-03); xoá không hỏi xác nhận (BR-MEM-12); không giới hạn tên 100 / ghi chú 1000 (BR-MEM-02).
- Kiểm chứng ngoài repo (không commit): chạy `nextAnniversary` hiện tại trên 17/17 case `next-anniversary.json` và `solarToLunar` trên 5/5 case dương → âm của `death-date-conversion.json` — đều đạt; 4 case âm → dương chưa có hàm tương ứng.
- Hand-offs (`ba-writer`): (1) FR-MEM-001 "from the home screen" vs prototype web đặt lối vào ở trang Hồ sơ; (2) mục tạo trên website có nhận nhắc mặc định của FR-MEM-003 không, `add_to_os_reminder` là gì; (3) chữ thẻ `mem_pt_2_*` nói về chọn nhắc trong khi website không có cấu hình nhắc. Backend: none.
- Tài liệu cũ (`.assumptions.md` mục "Memorial book") giữ nguyên, dọn ở bước sau.
- Reason: chuyển website sang mô hình 3 lớp tài liệu (product spec → contract → platform spec), pilot memorial.
