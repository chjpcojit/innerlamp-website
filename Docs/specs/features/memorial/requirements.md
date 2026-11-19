# Requirements — memorial (Sổ giỗ chạp) — website

Version: 3.4
Last updated: 2026-11-19
Status: P4 web complete — 5 route CRUD + ảnh đã bật (kill switch `MEMORIAL_PHOTO_ENABLED=false`), smoke dev 2026-11-19; còn G1 ký và E2E Playwright.
Feature folder: `src/routes/(site)/memorial/`, `src/lib/components/sections/Memorial{Book,Form}.svelte`, `src/lib/server/api/memorials.ts`, `src/lib/server/api/memorial-map.ts`, `src/lib/utils/memorial{,-format,-validate,-reminder}.ts`, `src/lib/types/memorial.ts`
Product spec: `innerlamp-memorial/docs/product/memorial/product.md` @ v2.1 (ADR-0001, ADR-0002)
Contract: `docs/specs/features/memorial/client-contract.md` @ v1.0, pin 2026-11-16 (OpenAPI 3.1.0, HEAD `e5d4c9c`)
Cross-platform AC: `ac-memorial-clients-v1.md` @ v1.0 (2026-11-16) — nguồn của các ID `MEM-API-*`, `MEM-IMG-*`, `MEM-WEB-*`
Implements: BR-MEM-01…12, FR-MEM-001…007, FR-MEM-011 (Could, sau cờ), FR-MEM-012, FR-MEM-013, NFR-MEM-01…03; FR-MEM-008 dời Phase 8–10 (chưa có notification list)

> See `changelog.md` for the version history. `flow.md` has the step-by-step data flow.

Spec này thay bản v2.1 (retroactive từ code `localStorage`). Hành vi sản phẩm nằm ở product spec và
**không** nhắc lại; file này nói website hiện thực các `BR/FR/NFR-MEM-*` đó thế nào sau khi nối BE.

## Phạm vi v1 (chốt 2026-11-16)

- **Có:** 5 route CRUD đã deploy; quy đổi âm ↔ dương chính xác; validate form hai phía; xoá có xác
  nhận; flash; last-write-wins; vector product là gate.
- **Ảnh đã bật:** 2 route ảnh (`PUT`/`DELETE /v1/memorials/{id}/photo`) đã deploy 2026-11-17,
  smoke dev 2026-11-19. Cờ `MEMORIAL_PHOTO_ENABLED` bật mặc định; đặt `false` là kill switch.
- **Không có trên web:** nhắc local/push/notification list (D2, TD-MEM-CLIENT-02), báo múi giờ tài
  khoản (contract chưa có operation), offline, ETag (D10).
- **Dữ liệu cũ:** key `il-memorial` trong `localStorage` **không migrate**; xoá một lần khi mở sổ
  (product §2.7).

## Ràng buộc từ product + contract

- **Website tự tính kỳ giỗ** (BR-MEM-05…10) trong browser bằng ngày của máy; SSR **không** tính số
  ngày (BR-MEM-08). Backend không trả `next_*`.
- **Chỉ gọi BE từ SvelteKit server** qua `$lib/server/api/memorials.ts`, Bearer từ cookie httpOnly;
  token không xuống browser (BR-MEM-01, NFR-MEM-02).
- **Payload nhắc tối thiểu** `{days_before, time}`; không gửi `timezone`, không gửi
  `add_to_os_reminder`; decode bỏ qua hai field này (D3, contract §0).
- **Ngày gửi lên luôn dương `YYYY-MM-DD`** khi biết năm; âm lịch quy đổi trước khi gửi; chỉ gửi một
  trong hai dạng ngày (contract §0.3–0.4).
- **PUT thay thế toàn bộ** — body luôn đầy đủ từ form, `reminder: null` khi tắt (contract §0.5).
- **`id` là number** xuyên suốt; `String(id)` chỉ khi làm route param (D7).
- **`photo_url` là signed URL 15 phút** — chỉ server giữ; browser nhận ảnh qua proxy cùng origin, không lưu URL (D8, SEC-01).

## Dependencies

- **Feature `login`**: cookie `il_token`/`il_refresh`, hook refresh một lần rồi thử lại; 401 sau đó
  kết thúc phiên (`src/hooks.server.ts`).
- **Feature `notifications`**: lời nhắc giỗ trong danh sách thông báo — **dời Phase 8–10**, contract
  chưa có operation (AC 27, 28 bỏ khỏi v1).
- **BE Phase 6**: đã deploy 2 route ảnh (2026-11-17) và smoke dev (2026-11-19).

## User Story

Là người dùng đã đăng nhập, tôi muốn ghi người thân đã mất cùng ngày mất (âm hoặc dương lịch) vào sổ
giỗ của tài khoản, xem kỳ giỗ tới và chọn khi nào được nhắc, để không quên ngày giỗ — và thấy cùng
một sổ trên mọi thiết bị.

## Acceptance Criteria (EARS)

### A. Giữ từ v2.1 (đánh số cũ, đã sửa theo contract)

1. WHEN khách mở `/memorial`, `/memorial/new` hoặc `/memorial/[id]`, THE SYSTEM SHALL hiện
   `mem_guest_*` + nút tới `/login`, SHALL NOT gọi backend và SHALL NOT hiện mục nào. (FR-MEM-001)
2. WHEN người dùng đã đăng nhập mở `/memorial`, THE SYSTEM SHALL đọc bằng `GET /v1/memorials` trong
   `load` với Bearer từ cookie, map DTO → view model, rồi:
   - success: hiện đúng các mục backend trả (cùng sổ với app; không đọc/ghi `localStorage`);
   - mạng/5xx: hiện `mem_err_load` + `mem_retry`, không hiện sổ rỗng giả, không có bản offline;
   - 401 sau khi hook đã refresh: xoá phiên + 303 `/login`. (FR-MEM-001, FR-MEM-010 §3.6)
3. WHEN người dùng mở sổ, THE SYSTEM SHALL vào được từ dòng "Sổ giỗ chạp" ở `/profile`; trang chủ
   không cần lối vào. (FR-MEM-001 §3.6)
4. WHEN sổ có mục, THE SYSTEM SHALL tính trong browser kỳ giỗ tới, số ngày còn lại và lần giỗ cho
   từng mục, sắp theo số ngày (gần nhất trước; hoà: tên theo locale `vi`, rồi `id` tăng — A-5), làm
   nổi bật mục gần nhất, hiện quan hệ, ngày mất như đã nhập (lịch, năm nếu biết, dấu nhuận), nhãn
   ngày (`mem_today`/`mem_tomorrow`/`mem_in_days`, ≤ 7 ngày nhấn mạnh) và `mem_has_reminder` khi
   nhắc bật. (FR-MEM-002, FR-MEM-007, BR-MEM-05…09,11)
5. WHEN trang render trên server, THE SYSTEM SHALL NOT tính kỳ giỗ bằng ngày của server; phần số
   ngày/kỳ giỗ chỉ hiện sau khi chạy trong browser. (BR-MEM-08)
6. WHEN hiện ngày mất của mục âm lịch có năm, THE SYSTEM SHALL đổi `death_date` về ngày/tháng/năm
   âm + dấu nhuận và hiện đúng như đã nhập; mục không rõ năm hiện `death_day`/`death_month`/
   `death_leap_month`. (BR-MEM-03,04,10)
7. WHEN sổ trống, THE SYSTEM SHALL hiện `mem_empty_title`, `mem_empty_desc`, nút `mem_add`, và SHALL
   NOT hiện "Lấy từ gia phả". (FR-MEM-002)
8. WHEN mục không có ảnh, THE SYSTEM SHALL hiện chữ viết tắt của tên thay ảnh. (FR-MEM-011, Could)

9. WHEN mở `/memorial/new`, THE SYSTEM SHALL khởi tạo form theo FR-MEM-003: ông nội, âm lịch, ngày 1
   tháng 1, không rõ năm, nhắc bật trước 1 ngày 07:00. (FR-MEM-003, BR-MEM-11)
10. WHEN chọn quan hệ, THE SYSTEM SHALL chỉ cho một trong mười giá trị BR-MEM-02 (chip), không nhãn
    tự do. (BR-MEM-02)
11. WHEN nhập ngày mất, THE SYSTEM SHALL cho năm 1900 → năm hiện tại hoặc `mem_year_unknown`, ngày
    theo lịch + tháng đã chọn, và `mem_f_leap` chỉ khi âm lịch; khi lưu:
    - ngày không tồn tại → `mem_f_date_invalid`, không gửi;
    - nhuận cho năm không có tháng đó → `mem_f_date_not_exist`, không gửi;
    - ngày sau hôm nay theo `Asia/Ho_Chi_Minh` → `mem_f_date_future`, không gửi;
    - năm < 1900 (chỉ tới qua request) → `mem_f_year_min`, không gửi. (BR-MEM-03,04)
12. WHILE nhập ngày/tháng, THE SYSTEM SHALL cập nhật ngay preview kỳ giỗ tới (FR-MEM-006).
13. WHEN lưu với tên rỗng sau trim, THE SYSTEM SHALL giữ form + `mem_f_name_err` cạnh ô tên, xoá lỗi
    khi sửa; tên > 100 ký tự → `mem_f_name_too_long`, không gửi. (FR-MEM-012)
14. WHEN ghi chú > 1000 ký tự → `mem_f_note_too_long`, không gửi; rỗng/toàn space → gửi `null`.
    (FR-MEM-013)
15. WHEN form được gửi, THE SYSTEM SHALL validate lại ở server trước khi gọi BE (không tin browser).
16. WHILE nhắc bật, THE SYSTEM SHALL cho đúng một lead trong 0/1/3/7 và một giờ trong
    06:00/07:00/12:00/19:00; WHEN tắt, ẩn hai nhóm; SHALL NOT hiện "thêm vào lịch/ứng dụng nhắc" hay
    gợi ý push. (FR-MEM-007, BR-MEM-11)
17. WHEN mở mục có lead/giờ ngoài lựa chọn (tạo trước v2.0), THE SYSTEM SHALL hiện lựa chọn gần nhất
    (lead gần nhất, hoà → sớm hơn: 2→3, 5→7; giờ gần nhất, hoà → sớm hơn: 09:30→07:00; trước 06:00
    →06:00; sau 19:00→19:00), không ghi đè tới khi lưu; tóm tắt nhắc trong sổ dùng cùng lựa chọn.
    (FR-MEM-007)
18. WHEN lưu mục mới hợp lệ, THE SYSTEM SHALL gọi `POST /v1/memorials` từ action với ngày đúng dạng
    contract và `reminder` tối thiểu, rồi:
    - 201: flash `mem_flash_saved`, 303 `/memorial`;
    - 409 `MEMORIAL_LIMIT_REACHED`: ở lại form, giữ dữ liệu, `mem_err_full`;
    - 400 `VALIDATION_ERROR`: ở lại form, tô lỗi theo `details.field`;
    - mạng/5xx/413: ở lại form, giữ dữ liệu, `mem_err_save`. (FR-MEM-003,007)
19. WHEN mở `/memorial/[id]` của mình, THE SYSTEM SHALL đọc bằng `GET /v1/memorials/{id}` trong
    `load` và điền form gồm cấu hình nhắc; WHEN 404 `MEMORIAL_NOT_FOUND` (không có, đã xoá, hoặc của
    người khác), hiện `mem_not_found` + `mem_back`, không phân biệt. (FR-MEM-004)
20. WHEN sửa và lưu hợp lệ, THE SYSTEM SHALL gọi `PUT /v1/memorials/{id}` với **toàn bộ** nội dung
    form (không ảnh), rồi:
    - 200: flash `mem_flash_saved`, 303 `/memorial`;
    - 404: flash `mem_flash_gone`, 303 `/memorial`;
    - 400/mạng/5xx: như AC 18. (FR-MEM-004,007)
21. WHEN rời form sửa mà không lưu, THE SYSTEM SHALL không gọi BE và mục giữ nguyên. (FR-MEM-004)
22. WHEN bấm `mem_delete` ở form sửa, THE SYSTEM SHALL hỏi xác nhận trước (`mem_confirm_delete_*`;
    không JS thì một khối xác nhận), rồi:
    - huỷ: không gọi BE;
    - xác nhận: `DELETE /v1/memorials/{id}`; 200 → `mem_flash_deleted` (không kèm tên); **404 → coi như xong**
      (`mem_flash_gone`); mạng/5xx → ở lại, `mem_err_delete`, mục còn nguyên. (FR-MEM-005, BR-MEM-12)
23. WHEN gọi backend, THE SYSTEM SHALL chỉ gọi từ server SvelteKit với `x-api-key` + Bearer từ cookie
    httpOnly; token không xuống HTML/JS browser. (platform, BR-MEM-01)
24. WHEN xử lý/ghi log request sổ giỗ, THE SYSTEM SHALL NOT ghi tên, ghi chú, `photo_url` vào log,
    URL hay analytics (chỉ id + mã lỗi); flash cookie chỉ có `kind`, **không có tên/ngày giỗ**. (NFR-MEM-02)
25. WHEN sổ có 100 mục, THE SYSTEM SHALL hiện trong 2 giây trên 4G và cập nhật preview ngay.
    (NFR-MEM-01)
26. WHEN chạy unit test, THE SYSTEM SHALL qua mọi case của `next-anniversary.json`,
    `anniversary-ordinal.json`, `death-date-conversion.json` (product §4.3). (NFR-MEM-03)
27. WHEN hiện bất kỳ chuỗi nào, THE SYSTEM SHALL chỉ dùng key Paraglide có trong cả `vi.json` và
    `en.json`, không dùng `error.message` của backend. (platform)

### A2. QA P7 — bốn điểm AC (2026-11-17)

32. WHILE một request lưu đang chạy, THE SYSTEM SHALL chặn submit lần hai (nút disabled + gate) để
    chỉ có **một** POST/PUT. (QA P7.1)
33. WHEN `total >= 100`, THE SYSTEM SHALL không render link mở form thêm, hiện nút disabled và
    `mem_err_full`. (QA P7.2)
34. WHEN action nhận 401, THE SYSTEM SHALL giữ nguyên form + dữ liệu đã nhập, xoá phiên và hiện
    `mem_err_session` + link đăng nhập; SHALL NOT chuyển trang làm mất draft. (Q-4=A, QA P7.3)
35. WHEN `total` khác `items.length`, THE SYSTEM SHALL hiện `shown/total` (không bỏ qua `total`) và
    dùng `total` để quyết định ẩn/hiện nút thêm. (QA P7.4)

### B. Nối BE — AC mới (ID giữ nguyên từ `ac-memorial-clients-v1.md` §4.1)

| ID         | Yêu cầu (web)                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| MEM-API-01 | Mở sổ gọi **một** `GET /v1/memorials`; hiện đúng `items`, không N+1.                                                |
| MEM-API-02 | Không phân trang, không gửi `page`/`limit`/`cursor`.                                                                |
| MEM-API-03 | Trước khi có dữ liệu không hiện empty state; empty chỉ khi `total = 0`.                                             |
| MEM-API-04 | Empty state theo AC 7.                                                                                              |
| MEM-API-05 | `POST`: 201 → đóng form, flash saved, sổ đọc lại; không tự tăng `id`.                                               |
| MEM-API-06 | `PUT`: thay thế toàn bộ; thiếu `note` = xoá ghi chú; thiếu `reminder` = tắt.                                        |
| MEM-API-07 | `DELETE`: 200 → flash deleted; 404 → coi như thành công; 5xx → giữ mục + lỗi.                                       |
| MEM-API-08 | 404 của mục người khác giống hệt 404 không tồn tại; không phân biệt.                                                |
| MEM-API-09 | Đủ 100: hiện `mem_err_full`, giữ form; không tự cắt danh sách.                                                      |
| MEM-API-10 | 401: `endSession` + `/login`; form giữ draft phía browser tới khi điều hướng.                                       |
| MEM-API-11 | Mạng/offline: `mem_err_load` khi đọc, `mem_err_save` khi ghi; giữ form khi ghi.                                     |
| MEM-API-12 | 5xx khi ghi: `mem_err_save`, giữ form.                                                                              |
| MEM-API-13 | Retry tải sổ bằng nút `mem_retry` (link tải lại trang).                                                             |
| MEM-API-14 | Bản offline sau mỗi lần ghi — **chỉ iOS/Android**, không áp dụng web.                                               |
| MEM-API-15 | Round-trip ngày mất, năm và tháng nhuận: gửi dương chính xác, đọc lại đúng âm + nhuận.                              |
| MEM-API-16 | Không gửi field ngoài contract: không `timezone`, `add_to_os_reminder`, `id`, `user_id`, `photo_url`, `created_at`. |

### C. Ảnh chân dung — AC mới (ID từ AC §4.2)

| ID         | Yêu cầu (web)                                                                                                                                                                                |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MEM-IMG-01 | Không có ảnh → chữ viết tắt (A-6: chữ đầu từ đầu + từ cuối, in hoa, giữ dấu; một từ → 1 chữ; rỗng → `?`).                                                                                    |
| MEM-IMG-02 | Hiện `photo_url` signed; 403/hết hạn → gọi lại `GET` mục lấy URL mới, không loop, không coi là mục mất.                                                                                      |
| MEM-IMG-03 | Upload ≤ 5 MiB (5 242 880 byte), JPEG/PNG/WebP; client chặn trước khi gửi.                                                                                                                   |
| MEM-IMG-04 | Sai loại → `mem_photo_unsupported` (415) hoặc chặn ở browser.                                                                                                                                |
| MEM-IMG-05 | Quá lớn → `mem_photo_too_large` (413) hoặc chặn ở browser.                                                                                                                                   |
| MEM-IMG-06 | Xoá ảnh: 200 → về chữ viết tắt; mục chưa có ảnh vẫn 200, không báo lỗi.                                                                                                                      |
| MEM-IMG-07 | Xoá mục thì ảnh không còn hiện (server xoá best-effort).                                                                                                                                     |
| MEM-IMG-08 | Ảnh khi tạo mới là hai bước: tạo mục trước, rồi upload ở form sửa.                                                                                                                           |
| MEM-IMG-09 | Signed URL không lưu vào bản offline — chỉ iOS/Android.                                                                                                                                      |
| MEM-IMG-10 | Thay ảnh: upload mới → `photo_url` mới trong state; không lưu URL.                                                                                                                           |
| MEM-IMG-11 | Không log URL/ảnh, không analytics; ảnh chỉ chủ sở hữu thấy.                                                                                                                                 |
| MEM-WEB-01 | 401 trên web: refresh một lần, thất bại → xoá phiên, `/login` kèm `redirect` quay lại sổ; không lộ mục tài khoản cũ; không có bản offline.                                                   |
| MEM-WEB-02 | Upload từ `<input type=file>`; browser chỉ gửi file lên server SvelteKit, server gửi multipart tới BE bằng Bearer trong cookie; không request nào từ browser thẳng tới BE/storage kèm token. |

### D. Dời khỏi v1 (Phase 8–10)

26. Báo múi giờ tài khoản — contract chưa có operation (AC 26 cũ).
27. Lời nhắc giỗ trong danh sách thông báo — feature `notifications` chưa có (AC 27 cũ).
28. Mở `/memorial/[id]` từ lời nhắc — phụ thuộc 27 (AC 28 cũ).
29. Công tắc thông báo toàn tài khoản — không ảnh hưởng web (AC 29 cũ).

## Bảo mật — G1 (Hộ Pháp, 2026-11-16)

| ID     | Yêu cầu                                                                                                                                                      | File                                                                |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| SEC-01 | Trang SSR của sổ giỗ trả `Cache-Control: private, no-store` + `Referrer-Policy: no-referrer`; ảnh đi qua proxy cùng origin, **signed URL không vào HTML/JS** | `memorial-headers.ts`, 3 `+page.server.ts`, `[id]/photo/+server.ts` |
| SEC-02 | Guard chạy trước **mọi** `apiCall` của memorial; thiếu token/session thì trang khách/redirect login, API ném 401 trước khi gọi mạng                          | `memorial-guard.ts`, `api/memorials.ts`                             |
| SEC-03 | CSP toàn site + `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`                                                         | `security-headers.ts`, `hooks.server.ts`                            |
| SEC-04 | Flash không chứa tên người mất hay ngày giỗ                                                                                                                  | `memorial-flash.ts`, `types/memorial.ts`                            |
| SEC-05 | Key cũ `localStorage['il-memorial']` bị xoá một lần; không ghi PII xuống localStorage                                                                        | `legacy-storage.ts`, `MemorialBook.svelte`                          |
| SEC-06 | Cờ ảnh bật mặc định; `MEMORIAL_PHOTO_ENABLED=false` là kill switch                                                                                           | `memorial-config.ts`                                                |

## Dữ liệu & API (gọi từ SvelteKit server)

| Thao tác    | Route                             | Gọi từ                                          | Ghi chú                |
| ----------- | --------------------------------- | ----------------------------------------------- | ---------------------- |
| Đọc sổ      | `GET /v1/memorials`               | `memorial/+page.server.ts` `load`               | map + sắp ở client     |
| Đọc một mục | `GET /v1/memorials/{id}`          | `memorial/[id]/+page.server.ts` `load`          | 404 đồng nhất          |
| Thêm        | `POST /v1/memorials`              | `memorial/new/+page.server.ts` action `default` | 201 → 303              |
| Sửa         | `PUT /v1/memorials/{id}`          | `memorial/[id]/+page.server.ts` action `save`   | thay toàn bộ           |
| Xoá         | `DELETE /v1/memorials/{id}`       | action `delete`                                 | 404 = xong             |
| Tải ảnh     | `PUT /v1/memorials/{id}/photo`    | action `photo` (cờ)                             | multipart part `photo` |
| Xoá ảnh     | `DELETE /v1/memorials/{id}/photo` | action `photoDelete` (cờ)                       | 200 kể cả không có ảnh |

## Error → UI mapping

| Operation    | Failure         | Người dùng thấy                                 |
| ------------ | --------------- | ----------------------------------------------- |
| mọi route    | không có phiên  | `mem_guest_*`                                   |
| mọi route    | 401 sau refresh | xoá phiên, 303 `/login`                         |
| `GET` list   | mạng/5xx        | `mem_err_load` + `mem_retry`                    |
| `GET {id}`   | 404             | `mem_not_found` + `mem_back`                    |
| `GET {id}`   | mạng/5xx        | `mem_err_load` + `mem_retry`                    |
| `POST`       | 409             | `mem_err_full`, giữ form                        |
| `POST`/`PUT` | 400 `full_name` | `mem_f_name_err` / `mem_f_name_too_long`        |
| `POST`/`PUT` | 400 `note`      | `mem_f_note_too_long`                           |
| `POST`/`PUT` | 400 `death_*`   | `mem_f_date_invalid`                            |
| `POST`/`PUT` | 400 field khác  | `mem_err_save` (log code)                       |
| `POST`/`PUT` | 413 JSON        | `mem_err_save`                                  |
| `PUT`        | 404             | `mem_flash_gone`, 303 `/memorial`               |
| `DELETE`     | 404             | `mem_flash_gone` (coi như xong)                 |
| `DELETE`     | mạng/5xx        | `mem_err_delete`, ở lại                         |
| ảnh          | 413 / 415       | `mem_photo_too_large` / `mem_photo_unsupported` |
| ảnh          | 400/404/5xx     | `mem_err_photo` (chung), giữ form               |

## Out of scope

Push, thông báo trình duyệt, nhắc local (D2); offline (FR-MEM-010); ETag/conflict (D10); báo múi giờ
tài khoản; danh sách thông báo; "Lấy từ gia phả"; iOS/Android. **Hoãn:** chọn ảnh ở form thêm
(Q-2: giữ luồng hai bước, form thêm chưa có khối ảnh).

## Pending

Theo dõi ở `tasks.md` (W1–W8). Blocker còn lại: E2E Playwright chưa chạy; smoke ảnh dev đã xong 2026-11-19.
