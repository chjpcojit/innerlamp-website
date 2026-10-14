# Requirements — memorial (Sổ giỗ chạp)

Version: 1.0
Last updated: 2026-10-14
Status: in-progress (drift) — giao diện sổ, form thêm/sửa, preview và hàm tính kỳ giỗ đã có; **sổ đang nằm trong `localStorage` của trình duyệt, chưa gọi backend** (lệch BR-MEM-01). Còn: chuyển sang `/v1/memorials` qua `$lib/server/api`, ẩn cấu hình nhắc, tháng nhuận, khoảng năm 1900→nay, kiểm ngày mất, hỏi xác nhận khi xoá, test chạy vector.
Feature folder: `src/routes/(site)/memorial/`, `src/lib/components/sections/Memorial{Book,Form}.svelte`, `src/lib/state/memorial.svelte.ts`, `src/lib/utils/memorial{,-format}.ts`, `src/lib/content/memorial.ts`, `src/lib/types/memorial.ts`
Product spec: innerlamp-be `docs/product/memorial/product.md` @ v1.0
Contract: innerlamp-be `docs/specs/api/openapi.yaml` @ 5f4ca56 (`info.version` 1.0.0, tag Memorials)
Implements: BR-MEM-01, BR-MEM-02, BR-MEM-03, BR-MEM-04, BR-MEM-05, BR-MEM-06, BR-MEM-07, BR-MEM-08, BR-MEM-09, BR-MEM-10, BR-MEM-11 (later — website chỉ giữ nguyên khi sửa, §3.6), BR-MEM-12, FR-MEM-001, FR-MEM-002, FR-MEM-003, FR-MEM-004, FR-MEM-005, FR-MEM-006, FR-MEM-007 (later, §3.6), FR-MEM-011 (later), FR-MEM-012, FR-MEM-013, NFR-MEM-01, NFR-MEM-02, NFR-MEM-03

> See `changelog.md` in this folder for the version history of this spec.

Spec này được viết retroactively từ code đang chạy (đọc ngày 2026-10-14), đối chiếu với product spec v1.0. Route: `/memorial`, `/memorial/new`, `/memorial/[id]` (`/en/...`).

Hành vi sản phẩm (sổ riêng theo tài khoản, nội dung và giới hạn một mục, ngày mất, tháng nhuận, kỳ giỗ, lần giỗ, xoá vĩnh viễn) nằm ở product spec và **không** nhắc lại ở đây; file này chỉ nói website hiện thực các `BR-MEM-*`/`FR-MEM-*` đó thế nào. Không áp dụng cho website: FR-MEM-008 (giao nhắc), FR-MEM-009 (Reminders iOS), FR-MEM-010 (offline) — product §3.6.

## Ràng buộc từ product spec

- **Website tự tính kỳ giỗ** (product §2.7, §3.6 dòng BR-MEM-05…10): backend chỉ lưu ngày mất; kỳ giỗ tới, số ngày còn lại, lần giỗ và quy đổi âm ↔ dương do website tính bằng `src/lib/utils/lunar.ts` (lịch Việt UTC+7, BR-MEM-10). "Hôm nay" là ngày của **máy người dùng** (BR-MEM-08), nên phép tính chạy trong browser, không trên server SvelteKit.
- **Không hiện cấu hình nhắc ở phiên bản này** (product §3.6 dòng FR-MEM-007/BR-MEM-11) nhưng vì `PUT` thay toàn bộ, sửa trên website phải gửi lại nguyên `reminder`/`add_to_os_reminder` đọc từ backend (product Appendix B mục 6). Website không giao nhắc (FR-MEM-008) và không có Reminders (FR-MEM-009).
- **Chỉ online** (product §2.4, §3.6 dòng FR-MEM-010): không đọc offline, không cache sổ trong browser.
- **Dữ liệu cũ trong browser bị bỏ** (product §2.7, §3.5): sổ đang lưu ở `localStorage` (`il-memorial`) không được migrate.

## User Story

Là một người dùng đã đăng nhập, tôi muốn ghi lại người thân đã mất cùng ngày mất (âm hoặc dương lịch) trong sổ giỗ của tài khoản mình và xem kỳ giỗ tới của từng người, để không quên ngày giỗ hằng năm — và thấy cùng một sổ trên mọi thiết bị.

## Acceptance Criteria (EARS notation)

### Mở sổ và danh sách

1. WHEN khách (không có phiên) mở `/memorial`, `/memorial/new` hoặc `/memorial/[id]`, THE SYSTEM SHALL hiển thị lời mời đăng nhập (`mem_guest_title`, `mem_guest_desc`, nút tới `/login`), SHALL NOT gọi backend và SHALL NOT hiển thị mục nào. (FR-MEM-001, BR-MEM-01)
2. WHEN người dùng đã đăng nhập mở `/memorial`, THE SYSTEM SHALL đọc sổ bằng `GET /v1/memorials` từ `load` của server với Bearer lấy từ cookie `il_token`, rồi:
   - on success: hiển thị đúng các mục backend trả về — cùng sổ với app (không đọc/ghi `localStorage`);
   - on failure (mạng / 5xx): hiển thị `mem_err_load` kèm nút thử lại, không hiển thị sổ rỗng giả;
   - on failure (401 sau khi hook đã thử refresh): xoá phiên và chuyển tới `/login`. (FR-MEM-001, BR-MEM-01)
3. WHEN người dùng mở sổ, THE SYSTEM SHALL vào được từ dòng "Sổ giỗ chạp" ở `/profile` và tab "Tôi" (breadcrumb) như prototype web. (FR-MEM-001)
   > ⚠️ Not confirmed (product): FR-MEM-001 nói "from the home screen" còn prototype web (`InnerLamp Web App.dc.html`) đặt lối vào ở trang Hồ sơ; trang chủ website chỉ có thẻ giới thiệu cho khách — cần ghi nhận lối vào web ở product §3.6 hay thêm lối vào từ trang chủ — chặn quyết định có thêm link ở `/` hay không; hand back to ba-writer in innerlamp-be.
4. WHEN sổ có mục, THE SYSTEM SHALL tính trong browser cho từng mục kỳ giỗ tới, số ngày còn lại và lần giỗ theo BR-MEM-05, BR-MEM-06, BR-MEM-07, BR-MEM-08, BR-MEM-09 bằng ngày của máy, sắp theo số ngày còn lại (gần nhất trước), làm nổi bật mục gần nhất, và hiển thị theo FR-MEM-002: mỗi dòng có quan hệ, ngày mất như đã nhập (lịch, năm nếu biết, dấu nhuận — AC 6), nhãn ngày còn lại (`mem_today` / `mem_tomorrow` / `mem_in_days`, ≤ 7 ngày được nhấn mạnh) và dấu `mem_has_reminder` khi `reminder` khác `null`; thẻ nổi bật có thêm nhãn lần giỗ (`mem_nth_*`, rỗng khi < 1 hoặc không rõ năm), ngày dương kèm thứ và tóm tắt nhắc chỉ để đọc. (FR-MEM-002, BR-MEM-05, BR-MEM-06, BR-MEM-07, BR-MEM-08, BR-MEM-09, BR-MEM-11)
5. WHEN trang được render trên server, THE SYSTEM SHALL NOT tính kỳ giỗ bằng ngày của server; phần số ngày/kỳ giỗ chỉ hiện sau khi chạy trong browser. (BR-MEM-08)
6. WHEN hiển thị ngày mất của một mục âm lịch có năm (backend trả `death_date` dương lịch), THE SYSTEM SHALL đổi về ngày/tháng/năm âm và dấu nhuận theo BR-MEM-10 rồi hiển thị đúng như đã nhập (vd "10/6 nhuận/2025"); mục không rõ năm hiển thị `death_day`/`death_month`/`death_leap_month` theo `death_calendar`. (BR-MEM-03, BR-MEM-04, BR-MEM-10)
7. WHEN sổ không có mục nào, THE SYSTEM SHALL hiển thị `mem_empty_title`, `mem_empty_desc` và nút `mem_add`. (FR-MEM-002)
8. WHEN mục không có ảnh (`photo_url` luôn `null` ở contract hiện tại), THE SYSTEM SHALL hiển thị chữ cái đầu của tên thay cho ảnh. (FR-MEM-011, later — phần còn lại của FR-MEM-011 hoãn)

### Thêm / sửa

9. WHEN người dùng mở `/memorial/new`, THE SYSTEM SHALL khởi tạo form theo giá trị mặc định của FR-MEM-003 (ông nội, âm lịch, ngày 1, tháng 1, không rõ năm, không nhuận) và SHALL NOT hiển thị cấu hình nhắc. (FR-MEM-003, FR-MEM-007 §3.6)
10. WHEN người dùng chọn quan hệ, THE SYSTEM SHALL chỉ cho chọn một trong mười giá trị của BR-MEM-02 (chip `mem_rel_*`), không có nhãn tự do. (BR-MEM-02)
11. WHEN người dùng nhập ngày mất, THE SYSTEM SHALL cho chọn năm từ 1900 tới năm hiện tại hoặc `mem_year_unknown`, ngày theo lịch và tháng đã chọn, và lựa chọn tháng nhuận chỉ khi lịch là âm; WHEN ngày đã chọn không tồn tại hoặc sau hôm nay (`Asia/Ho_Chi_Minh`) theo BR-MEM-03, THE SYSTEM SHALL báo `mem_f_date_invalid` và không gửi; WHEN chọn nhuận cho một năm không có tháng nhuận đó, THE SYSTEM SHALL báo `mem_f_date_not_exist` và không gửi. (BR-MEM-03, BR-MEM-04)
12. WHILE người dùng nhập ngày và tháng, THE SYSTEM SHALL cập nhật ngay phần xem trước kỳ giỗ tới theo FR-MEM-006 (ngày dương kèm thứ và số ngày còn lại; âm lịch: ngày âm, lần giỗ khi biết năm, câu `mem_preview_short_month`; dương lịch: ngày âm tương ứng năm nay — `mem_preview_solar_in_lunar`). (FR-MEM-006, BR-MEM-05, BR-MEM-06, BR-MEM-07, BR-MEM-08, BR-MEM-09)
13. WHEN người dùng lưu với tên rỗng sau khi cắt khoảng trắng, THE SYSTEM SHALL giữ form và hiện `mem_f_name_err` cạnh ô tên, xoá thông báo ngay khi người dùng sửa tên; WHEN tên dài hơn 100 ký tự, THE SYSTEM SHALL hiện `mem_f_name_too_long` và không gửi. (FR-MEM-012, BR-MEM-02)
14. WHEN ghi chú dài hơn 1000 ký tự, THE SYSTEM SHALL hiện `mem_f_note_too_long` và không gửi; WHEN ghi chú rỗng hoặc toàn khoảng trắng, THE SYSTEM SHALL gửi `note: null`; WHEN mở lại mục, THE SYSTEM SHALL hiện đúng ghi chú đã lưu. (FR-MEM-013, BR-MEM-02)
15. WHEN form được gửi (action trên server), THE SYSTEM SHALL kiểm lại AC 11, 13, 14 ở server trước khi gọi backend (không tin dữ liệu browser). (platform)
16. WHEN người dùng lưu mục mới hợp lệ, THE SYSTEM SHALL gọi `POST /v1/memorials` từ action với ngày mất theo dạng của contract (biết năm → đổi sang ngày dương trước khi gửi, kể cả tháng nhuận, theo BR-MEM-10; không rõ năm → ngày/tháng/nhuận theo lịch đã nhập), `reminder` mặc định của FR-MEM-003 (trước 1 ngày, 07:00, `timezone` = múi giờ của trình duyệt nếu là tên IANA hợp lệ, nếu không thì bỏ trống), rồi:
    - on success: về `/memorial` và hiện `mem_flash_saved`;
    - on failure (409 `MEMORIAL_LIMIT_REACHED`): ở lại form, giữ dữ liệu, hiện `mem_err_full`, không thêm gì;
    - on failure (400 `VALIDATION_ERROR`): ở lại form, tô lỗi theo `details.field` (bảng Error → UI);
    - on failure (mạng / 5xx): ở lại form, giữ dữ liệu, hiện `mem_err_save`, không thêm gì. (FR-MEM-003, BR-MEM-01, BR-MEM-02, BR-MEM-03, BR-MEM-04, BR-MEM-11)
    > ⚠️ Not confirmed (product): mục tạo trên website — nơi người dùng không thấy cấu hình nhắc — có nhận mặc định "bật nhắc, trước 1 ngày, 07:00" của FR-MEM-003 (khiến app của họ sẽ nhắc mục này) không, và `add_to_os_reminder` gửi `false` hay `true` (FR-MEM-003 nói "on iOS … on")? Thiết kế tạm: nhắc mặc định như FR-MEM-003, `add_to_os_reminder: false` — chặn chốt body của `POST` (design Step B-3); hand back to ba-writer in innerlamp-be.
17. WHEN người dùng mở `/memorial/[id]` của mình, THE SYSTEM SHALL đọc mục bằng `GET /v1/memorials/{id}` từ `load` và điền form; WHEN backend trả 404 `MEMORIAL_NOT_FOUND` (không tồn tại hoặc của người khác), THE SYSTEM SHALL hiển thị `mem_not_found` và link `mem_back`, không phân biệt hai trường hợp. (FR-MEM-004, BR-MEM-01)
18. WHEN người dùng sửa và lưu hợp lệ, THE SYSTEM SHALL đọc lại mục bằng `GET /v1/memorials/{id}` để lấy `reminder` và `add_to_os_reminder` mới nhất, rồi gọi `PUT /v1/memorials/{id}` với nội dung form cộng hai field đó nguyên giá trị (không gửi ảnh), rồi:
    - on success: về `/memorial` và hiện `mem_flash_saved`; kỳ giỗ được tính lại từ dữ liệu mới;
    - on failure (404): về `/memorial` và hiện `mem_flash_gone`; sổ không còn mục đó;
    - on failure (400 / mạng / 5xx): như AC 16. (FR-MEM-004, FR-MEM-007, BR-MEM-11, BR-MEM-01)
19. WHEN người dùng rời form sửa mà không lưu (nút `mem_cancel` hoặc điều hướng khác), THE SYSTEM SHALL không gọi backend và mục giữ nguyên. (FR-MEM-004)

### Xoá

20. WHEN người dùng bấm `mem_delete` ở form sửa, THE SYSTEM SHALL hỏi xác nhận trước (hộp thoại `mem_confirm_delete_*`; không có JS thì một trang/khối xác nhận), rồi:
    - WHEN người dùng huỷ: không gọi backend, mục còn nguyên;
    - WHEN người dùng xác nhận: gọi `DELETE /v1/memorials/{id}` từ action; on success về `/memorial` và hiện `mem_flash_deleted` với tên; on failure (404) về `/memorial` và hiện `mem_flash_gone`; on failure (mạng / 5xx) ở lại, hiện `mem_err_delete`, mục còn nguyên. (FR-MEM-005, BR-MEM-12)

### Chung

21. WHEN gọi backend, THE SYSTEM SHALL chỉ gọi từ server SvelteKit qua `$lib/server/api/memorials.ts`, với `x-api-key` và Bearer từ cookie httpOnly; token không bao giờ xuống HTML/JS browser. (platform, BR-MEM-01)
22. WHEN xử lý hoặc ghi log một request sổ giỗ, THE SYSTEM SHALL NOT ghi tên, ghi chú của người thân vào log, URL hay analytics (chỉ id); thông báo sau khi lưu/xoá không đưa tên lên query string. (NFR-MEM-02)
23. WHEN sổ có 100 mục, THE SYSTEM SHALL hiển thị sổ trong 2 giây trên mạng 4G và cập nhật preview ngay khi một giá trị đổi. (NFR-MEM-01)
24. WHEN chạy unit test, THE SYSTEM SHALL qua mọi case của `rules/next-anniversary.json`, `rules/anniversary-ordinal.json` và `rules/death-date-conversion.json` của product spec. (NFR-MEM-03, BR-MEM-10)
25. WHEN hiển thị bất kỳ chuỗi nào (kể cả lỗi), THE SYSTEM SHALL chỉ dùng key Paraglide có trong cả `messages/vi.json` và `messages/en.json`, không bao giờ `error.message` của backend. (platform)

## Dữ liệu & API (gọi từ SvelteKit server)

Header chung: `x-api-key` từ `API_KEY`; `Authorization: Bearer <il_token>` (cả 5 route `RequireAuth`). Hình dạng request/response: schema `Memorial` / `MemorialRequest` trong innerlamp-be `docs/specs/api/openapi.yaml` — không chép ở đây.

| Thao tác | Operation (openapi) | Gọi từ | Ghi chú |
| --- | --- | --- | --- |
| Đọc sổ | `GET /v1/memorials` | `src/routes/(site)/memorial/+page.server.ts` `load` | Backend trả theo `created_at` giảm dần; website tự sắp lại theo kỳ giỗ (AC 4) |
| Đọc một mục | `GET /v1/memorials/{id}` | `memorial/[id]/+page.server.ts` `load` và action `save` (đọc lại `reminder`) | 404 đồng nhất cho "không có" và "của người khác" |
| Thêm | `POST /v1/memorials` | `memorial/new/+page.server.ts` action `default` | Biết năm → `death_date` dương (client đổi); không rõ năm → `death_day`/`death_month`/`death_leap_month` |
| Sửa | `PUT /v1/memorials/{id}` | `memorial/[id]/+page.server.ts` action `save` | Thay toàn bộ: phải gửi lại `reminder`/`add_to_os_reminder` (AC 18) |
| Xoá | `DELETE /v1/memorials/{id}` | `memorial/[id]/+page.server.ts` action `delete` | Chỉ sau xác nhận (AC 20) |

Quan hệ: website giữ key nội bộ (`paternal_grandfather`, …) và map 1:1 sang enum `relationship` của contract trong lớp API.

## Error → UI mapping

| Operation | Failure case | Visitor sees | Hiện trạng code |
| --- | --- | --- | --- |
| mọi route | Không có phiên | Lời mời đăng nhập (`mem_guest_*`) | ✓ (`GuestPrompt`) |
| mọi route | 401 `UNAUTHORIZED` (hook đã thử refresh) | Xoá phiên, chuyển `/login` | chưa có (chưa gọi BE) |
| `GET /v1/memorials` | mạng / 5xx | `mem_err_load` + `mem_retry` | chưa có |
| `GET /v1/memorials/{id}` | 404 `MEMORIAL_NOT_FOUND` | `mem_not_found` + `mem_back` | ✓ cho id không có trong `localStorage`; chưa gọi BE |
| `GET /v1/memorials/{id}` | mạng / 5xx | `mem_err_load` + `mem_retry` | chưa có |
| `POST` / `PUT` | 400 `VALIDATION_ERROR`, `details.field = full_name` | `mem_f_name_err` hoặc `mem_f_name_too_long` ở ô tên | chỉ có kiểm tên rỗng ở browser |
| `POST` / `PUT` | 400, `details.field` ∈ `death_date`, `death_day`, `death_month`, `death_leap_month` | `mem_f_date_invalid` ở khối ngày mất | chưa có |
| `POST` / `PUT` | 400, `details.field = note` | `mem_f_note_too_long` ở ô ghi chú | chưa có |
| `POST` / `PUT` | 400, field khác (`relationship`, `death_calendar`, `reminder.*`, `add_to_os_reminder`, body sai) | `mem_err_save` (lỗi của website — log mã lỗi, không log nội dung) | chưa có |
| `POST` | 409 `MEMORIAL_LIMIT_REACHED` | `mem_err_full`, giữ form | chưa có |
| `POST` / `PUT` | mạng / 5xx / 413 | `mem_err_save`, giữ form | chưa có |
| `PUT` | 404 | Về `/memorial`, `mem_flash_gone` | chưa có |
| `DELETE` | 404 | Về `/memorial`, `mem_flash_gone` | chưa có |
| `DELETE` | mạng / 5xx | `mem_err_delete`, ở lại form | chưa có |

## Out of scope

- Giao nhắc trên website (FR-MEM-008), "Thêm vào Lời nhắc" iOS (FR-MEM-009), đọc offline (FR-MEM-010) — product §3.6.
- Hiện/sửa cấu hình nhắc trên website (FR-MEM-007, BR-MEM-11 — Website `later`): chỉ đọc để hiển thị và giữ nguyên khi sửa.
- Ảnh chân dung (FR-MEM-011 — `later`, chặn bởi backend `TD-001`); chỉ có chữ cái đầu (AC 8).
- "Lấy từ gia phả" (thuộc product `genealogy`).
- Công tắc `set_memorial` ở `/settings` thuộc feature settings (website không gửi nhắc nên công tắc đó không có tác dụng) — không theo dõi ở đây.

## Pending (not yet implemented)

Theo dõi ở `tasks.md`:

- **Chuyển sổ từ `localStorage` sang backend** (BR-MEM-01, FR-MEM-001…005) — Phase 3; gỡ store `localStorage` và key `il-memorial` — Phase 2.
- Ẩn cấu hình nhắc và công tắc "Thêm vào lịch nhắc", bỏ `mem_flash_saved_reminder` và "có trong lịch nhắc" (§3.6, FR-MEM-009 iOS only) — Phase 1.
- Lựa chọn tháng nhuận + quy đổi âm → dương có nhuận (BR-MEM-04, BR-MEM-10) — Phase 1–2.
- Năm 1900 → nay (đang 97 năm gần nhất), ngày theo tháng, kiểm ngày tồn tại và không sau hôm nay (BR-MEM-03) — Phase 1–2.
- Giới hạn tên 100 / ghi chú 1000 ký tự (BR-MEM-02, FR-MEM-012, FR-MEM-013) — Phase 1–2.
- Hỏi xác nhận trước khi xoá (BR-MEM-12; code đang xoá ngay) — Phase 1.
- Ngày mất hiển thị kèm năm và dấu nhuận (AC 6) — Phase 1.
- Kỳ giỗ chỉ tính trong browser sau khi có dữ liệu từ server (AC 5) — Phase 1.
- Test chạy ba file vector và E2E — Phase 4.
- Đo NFR-MEM-01 — Phase 4.

> ⚠️ Not confirmed (product): thẻ giới thiệu `mem_pt_2_*` ("Nhắc trước để chuẩn bị — chọn nhắc trước 1–7 ngày…") đang hiện trên sổ ở website, nơi phiên bản này không có cấu hình nhắc (§3.6) — giữ, đổi chữ hay ẩn trên website? — chặn task Phase 1 "rà chữ `mem_pt_2_*`"; hand back to ba-writer in innerlamp-be.

## Open questions (resolved)

- ~~Sổ có gắn với tài khoản trên website không, dữ liệu `localStorage` cũ xử lý sao?~~ → Có, bắt buộc đăng nhập; dữ liệu cũ bỏ, không migrate (product BR-MEM-01, §2.7). Resolved 2026-10-14 (product v1.0).
- ~~Website có hiện cấu hình nhắc không?~~ → Không ở phiên bản này; sửa phải giữ nguyên cấu hình từ app (product §3.6, Appendix B mục 6). Resolved 2026-10-14 (product v1.0).
- ~~Xoá có hỏi xác nhận không?~~ → Có (BR-MEM-12). Resolved 2026-10-14 (product v1.0).
- ~~Lấy cấu hình nhắc để gửi lại khi `PUT` từ đâu?~~ → Đọc lại `GET /v1/memorials/{id}` ngay trong action trước `PUT` (không round-trip qua field ẩn), để không ghi đè cấu hình vừa đổi trên app. Quyết định platform, 2026-10-14.
- ~~Thông báo sau khi lưu/xoá mang tên người thân qua đâu?~~ → Cookie httpOnly ngắn hạn (`il_mem_flash`), không qua query string (NFR-MEM-02). Quyết định platform, 2026-10-14.
