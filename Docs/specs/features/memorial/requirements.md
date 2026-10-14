# Requirements — memorial (Sổ giỗ chạp)

Version: 2.0
Last updated: 2026-10-14
Status: in-progress (drift) — giao diện sổ, form thêm/sửa (có khối nhắc), preview và hàm tính kỳ giỗ đã có; **sổ đang nằm trong `localStorage` của trình duyệt, chưa gọi backend** (lệch BR-MEM-01). Còn: chuyển sang `/v1/memorials` qua `$lib/server/api`, cấu hình nhắc gửi lên backend, báo múi giờ (chờ contract), nhắc trong danh sách thông báo (phụ thuộc feature notifications), tháng nhuận, khoảng năm 1900→nay, kiểm ngày mất, hỏi xác nhận khi xoá, chữ theo product §3.1.1, test chạy vector.
Feature folder: `src/routes/(site)/memorial/`, `src/lib/components/sections/Memorial{Book,Form}.svelte`, `src/lib/state/memorial.svelte.ts`, `src/lib/utils/memorial{,-format}.ts`, `src/lib/content/memorial.ts`, `src/lib/types/memorial.ts`
Product spec: innerlamp-be `docs/product/memorial/product.md` @ v2.1 (ADR-0001, ADR-0002 — Accepted; v2.1 = v2.0 + câu trả lời về công tắc thông báo toàn tài khoản ở FR-MEM-008)
Contract: innerlamp-be `docs/specs/api/openapi.yaml` @ bf23f8b (`info.version` 1.0.0, tag Memorials — không đổi từ 5f4ca56; chưa có thao tác múi giờ tài khoản và danh sách thông báo)
Implements: BR-MEM-01, BR-MEM-02, BR-MEM-03, BR-MEM-04, BR-MEM-05, BR-MEM-06, BR-MEM-07, BR-MEM-08, BR-MEM-09, BR-MEM-10, BR-MEM-11, BR-MEM-12, FR-MEM-001, FR-MEM-002, FR-MEM-003, FR-MEM-004, FR-MEM-005, FR-MEM-006, FR-MEM-007, FR-MEM-008 (chỉ danh sách thông báo, §3.6), FR-MEM-011 (later), FR-MEM-012, FR-MEM-013, NFR-MEM-01, NFR-MEM-02, NFR-MEM-03

> See `changelog.md` in this folder for the version history of this spec.

Spec này viết retroactively từ code đang chạy (đọc ngày 2026-10-14), đối chiếu với product spec v2.0/v2.1. Route: `/memorial`, `/memorial/new`, `/memorial/[id]` (`/en/...`).

Hành vi sản phẩm (sổ riêng theo tài khoản, nội dung và giới hạn một mục, ngày mất, tháng nhuận, kỳ giỗ, lần giỗ, lựa chọn và thời điểm nhắc, xoá vĩnh viễn, chữ hiển thị) nằm ở product spec và **không** nhắc lại ở đây; file này chỉ nói website hiện thực các `BR-MEM-*`/`FR-MEM-*` đó thế nào. Không áp dụng cho website: BR-MEM-13 và NFR-MEM-04 (chỉ backend), FR-MEM-009 (đã bỏ ở v2.0), FR-MEM-010 (offline, §3.6), push của FR-MEM-008 (§3.6).

## Ràng buộc từ product spec

- **Website tự tính kỳ giỗ để hiển thị** (product §3.6 dòng BR-MEM-05…10): kỳ giỗ tới, số ngày còn lại, lần giỗ và quy đổi âm ↔ dương do website tính bằng `src/lib/utils/lunar.ts` (lịch Việt UTC+7, BR-MEM-10). "Hôm nay" là ngày của **máy người dùng** (BR-MEM-08), nên phép tính chạy trong browser, không trên server SvelteKit. Backend tự tính kỳ giỗ để gửi nhắc (ADR-0002) — website không lên lịch nhắc.
- **Website có cấu hình nhắc** (FR-MEM-007, BR-MEM-11): lựa chọn, mặc định và cách xử lý giá trị cũ theo product; website gửi cấu hình lên backend như mọi field khác của mục.
- **Nhắc đến qua danh sách thông báo, không có push** (FR-MEM-008, §3.6, ADR-0001). Danh sách thông báo là một feature dùng chung riêng (`notifications`) — sổ giỗ chỉ phụ thuộc vào nó (xem Dependencies).
- **Múi giờ tài khoản lấy từ trình duyệt** (BR-MEM-11, ADR-0002, product Appendix B mục 3).
- **Mở sổ từ trang Hồ sơ** (§3.6 dòng FR-MEM-001).
- **Chỉ online** (product §2.4, §3.6 dòng FR-MEM-010): không đọc offline, không cache sổ trong browser; server lỗi → báo lỗi.
- **Dữ liệu cũ trong browser bị bỏ** (product §2.7, §3.5): sổ đang lưu ở `localStorage` (`il-memorial`) không được migrate.

## Dependencies

- **Feature `notifications` (website, cross-cutting, ADR-0001)**: trang `/notifications` + badge chưa đọc ở header, đọc từ backend. Hiện là dữ liệu mẫu (`src/lib/content/notifications.ts`, trạng thái đọc trong `localStorage`) và **chưa có spec** — cần `Docs/specs/features/notifications/` riêng (spec-writer) khi contract có thao tác danh sách thông báo. Sổ giỗ chỉ yêu cầu ở feature đó: lời nhắc giỗ hiện trong danh sách và mở đúng mục (AC 27, 28).
- **Feature `login`**: phiên, cookie, refresh (`../login/design.md`); báo múi giờ chạy sau khi có phiên (AC 26).

## User Story

Là một người dùng đã đăng nhập, tôi muốn ghi lại người thân đã mất cùng ngày mất (âm hoặc dương lịch) trong sổ giỗ của tài khoản mình, xem kỳ giỗ tới của từng người và chọn khi nào được nhắc, để không quên ngày giỗ hằng năm — và thấy cùng một sổ, cùng lời nhắc trên mọi thiết bị.

## Acceptance Criteria (EARS notation)

### Mở sổ và danh sách

1. WHEN khách (không có phiên) mở `/memorial`, `/memorial/new` hoặc `/memorial/[id]`, THE SYSTEM SHALL hiển thị lời mời đăng nhập (`mem_guest_title`, `mem_guest_desc`, nút tới `/login`), SHALL NOT gọi backend và SHALL NOT hiển thị mục nào. (FR-MEM-001, BR-MEM-01)
2. WHEN người dùng đã đăng nhập mở `/memorial`, THE SYSTEM SHALL đọc sổ bằng `GET /v1/memorials` từ `load` của server với Bearer lấy từ cookie `il_token`, rồi:
   - on success: hiển thị đúng các mục backend trả về — cùng sổ với app (không đọc/ghi `localStorage`);
   - on failure (mạng / 5xx): hiển thị `mem_err_load` kèm nút `mem_retry`, không hiển thị sổ rỗng giả, không có bản offline;
   - on failure (401 sau khi hook đã thử refresh): xoá phiên và chuyển tới `/login`. (FR-MEM-001, FR-MEM-010 §3.6, BR-MEM-01)
3. WHEN người dùng mở sổ, THE SYSTEM SHALL vào được từ dòng "Sổ giỗ chạp" ở `/profile` (và breadcrumb tab "Tôi"); trang chủ không cần lối vào. (FR-MEM-001 §3.6)
4. WHEN sổ có mục, THE SYSTEM SHALL tính trong browser cho từng mục kỳ giỗ tới, số ngày còn lại và lần giỗ theo BR-MEM-05, BR-MEM-06, BR-MEM-07, BR-MEM-08, BR-MEM-09 bằng ngày của máy, sắp theo số ngày còn lại (gần nhất trước), làm nổi bật mục gần nhất, và hiển thị theo FR-MEM-002: mỗi dòng có quan hệ, ngày mất như đã nhập (lịch, năm nếu biết, dấu nhuận — AC 6), nhãn ngày còn lại (`mem_today` / `mem_tomorrow` / `mem_in_days`, ≤ 7 ngày được nhấn mạnh) và dấu `mem_has_reminder` khi nhắc đang bật; thẻ nổi bật có thêm nhãn lần giỗ (`mem_nth_*`, rỗng khi < 1 hoặc không rõ năm), ngày dương kèm thứ và tóm tắt nhắc (`mem_remind_off` hoặc lead · giờ). (FR-MEM-002, FR-MEM-007, BR-MEM-05, BR-MEM-06, BR-MEM-07, BR-MEM-08, BR-MEM-09, BR-MEM-11)
5. WHEN trang được render trên server, THE SYSTEM SHALL NOT tính kỳ giỗ bằng ngày của server; phần số ngày/kỳ giỗ chỉ hiện sau khi chạy trong browser. (BR-MEM-08)
6. WHEN hiển thị ngày mất của một mục âm lịch có năm (backend trả `death_date` dương lịch), THE SYSTEM SHALL đổi về ngày/tháng/năm âm và dấu nhuận theo BR-MEM-10 rồi hiển thị đúng như đã nhập (dạng nhuận theo dòng "Leap-month choice" của product §3.1.1, key `mem_date_lunar_leap`); mục không rõ năm hiển thị `death_day`/`death_month`/`death_leap_month` theo `death_calendar`. (BR-MEM-03, BR-MEM-04, BR-MEM-10)
7. WHEN sổ không có mục nào, THE SYSTEM SHALL hiển thị `mem_empty_title`, `mem_empty_desc` và nút `mem_add`, và SHALL NOT hiển thị lựa chọn "Lấy từ gia phả". (FR-MEM-002)
8. WHEN mục không có ảnh (`photo_url` luôn `null` ở contract hiện tại), THE SYSTEM SHALL hiển thị chữ cái đầu của tên thay cho ảnh. (FR-MEM-011, later — phần còn lại của FR-MEM-011 hoãn)

### Thêm / sửa

9. WHEN người dùng mở `/memorial/new`, THE SYSTEM SHALL khởi tạo form theo giá trị mặc định của FR-MEM-003, gồm cả nhắc bật, trước 1 ngày, 07:00. (FR-MEM-003, BR-MEM-11)
10. WHEN người dùng chọn quan hệ, THE SYSTEM SHALL chỉ cho chọn một trong mười giá trị của BR-MEM-02 (chip `mem_rel_*`), không có nhãn tự do. (BR-MEM-02)
11. WHEN người dùng nhập ngày mất, THE SYSTEM SHALL cho chọn năm từ 1900 tới năm hiện tại hoặc `mem_year_unknown`, ngày theo lịch và tháng đã chọn, và lựa chọn tháng nhuận (`mem_f_leap`) chỉ khi lịch là âm; rồi khi lưu:
    - WHEN ngày đã chọn không tồn tại trong lịch đó (BR-MEM-03), THE SYSTEM SHALL báo `mem_f_date_invalid` và không gửi;
    - WHEN chọn nhuận cho một năm không có tháng nhuận đó (BR-MEM-04), THE SYSTEM SHALL báo `mem_f_date_not_exist` (có năm và tháng) và không gửi;
    - WHEN ngày mất sau hôm nay theo `Asia/Ho_Chi_Minh` (BR-MEM-03), THE SYSTEM SHALL báo `mem_f_date_future` và không gửi;
    - WHEN năm trước 1900 (chỉ tới được qua request không đi từ form), THE SYSTEM SHALL báo `mem_f_year_min` và không gửi. (BR-MEM-03, BR-MEM-04)
12. WHILE người dùng nhập ngày và tháng, THE SYSTEM SHALL cập nhật ngay phần xem trước kỳ giỗ tới theo FR-MEM-006 (ngày dương kèm thứ và số ngày còn lại; âm lịch: ngày âm, lần giỗ khi biết năm, câu `mem_preview_short_month`; dương lịch: ngày âm tương ứng năm nay — `mem_preview_solar_in_lunar`). (FR-MEM-006, BR-MEM-05, BR-MEM-06, BR-MEM-07, BR-MEM-08, BR-MEM-09)
13. WHEN người dùng lưu với tên rỗng sau khi cắt khoảng trắng, THE SYSTEM SHALL giữ form và hiện `mem_f_name_err` cạnh ô tên, xoá thông báo ngay khi người dùng sửa tên; WHEN tên dài hơn 100 ký tự, THE SYSTEM SHALL hiện `mem_f_name_too_long` và không gửi. (FR-MEM-012, BR-MEM-02)
14. WHEN ghi chú dài hơn 1000 ký tự, THE SYSTEM SHALL hiện `mem_f_note_too_long` và không gửi; WHEN ghi chú rỗng hoặc toàn khoảng trắng, THE SYSTEM SHALL gửi `note: null`; WHEN mở lại mục, THE SYSTEM SHALL hiện đúng ghi chú đã lưu. (FR-MEM-013, BR-MEM-02)
15. WHEN form được gửi (action trên server), THE SYSTEM SHALL kiểm lại AC 11, 13, 14, 16 ở server trước khi gọi backend (không tin dữ liệu browser). (platform)
16. WHILE nhắc đang bật trong form, THE SYSTEM SHALL cho chọn đúng một lead trong bốn lựa chọn và đúng một giờ trong bốn lựa chọn của BR-MEM-11 (chip `mem_remind_on_day` / `mem_remind_before`, giờ dạng `HH:mm`); WHEN người dùng tắt nhắc, THE SYSTEM SHALL ẩn hai nhóm lựa chọn đó; THE SYSTEM SHALL NOT hiển thị lựa chọn thêm vào ứng dụng nhắc/lịch của máy và SHALL NOT hiển thị gợi ý bật thông báo đẩy (website không có push). (FR-MEM-007, BR-MEM-11, FR-MEM-008 §3.6)
17. WHEN mở `/memorial/[id]` của một mục có lead hoặc giờ nhắc ngoài các lựa chọn (tạo trước v2.0), THE SYSTEM SHALL hiển thị lựa chọn gần nhất, không gửi gì cho tới khi người dùng lưu; WHEN người dùng lưu, THE SYSTEM SHALL gửi lựa chọn đang hiển thị. (FR-MEM-007)
    > ⚠️ Not confirmed (product): "lựa chọn gần nhất" khi cách đều hai lựa chọn — lead 2 (1 hay 3), lead 5 (3 hay 7), giờ 09:30 (07:00 hay 12:00), 15:30 (12:00 hay 19:00) — và giờ khuya như 23:00 tính gần 19:00 hay 06:00 hôm sau? — chặn hàm `nearestReminderChoice` (tasks Phase 2) và test của nó; hand back to ba-writer in innerlamp-be.
18. WHEN người dùng lưu mục mới hợp lệ, THE SYSTEM SHALL gọi `POST /v1/memorials` từ action với ngày mất theo dạng của contract (biết năm → đổi sang ngày dương trước khi gửi, kể cả tháng nhuận, theo BR-MEM-10; không rõ năm → ngày/tháng/nhuận theo lịch đã nhập) và cấu hình nhắc của form (tắt → không nhắc; bật → lead và giờ đã chọn), không gửi field nào ngoài các field product định nghĩa, rồi:
    - on success: về `/memorial` và hiện `mem_flash_saved`;
    - on failure (409 `MEMORIAL_LIMIT_REACHED`): ở lại form, giữ dữ liệu, hiện `mem_err_full`, không thêm gì;
    - on failure (400 `VALIDATION_ERROR`): ở lại form, tô lỗi theo `details.field` (bảng Error → UI);
    - on failure (mạng / 5xx): ở lại form, giữ dữ liệu, hiện `mem_err_save`, không thêm gì. (FR-MEM-003, FR-MEM-007, BR-MEM-01, BR-MEM-02, BR-MEM-03, BR-MEM-04, BR-MEM-11)
19. WHEN người dùng mở `/memorial/[id]` của mình, THE SYSTEM SHALL đọc mục bằng `GET /v1/memorials/{id}` từ `load` và điền form, gồm cấu hình nhắc (AC 16, 17); WHEN backend trả 404 `MEMORIAL_NOT_FOUND` (không tồn tại, đã bị xoá nơi khác, hoặc của người khác), THE SYSTEM SHALL hiển thị `mem_not_found` và link `mem_back`, không phân biệt các trường hợp. (FR-MEM-004, BR-MEM-01)
20. WHEN người dùng sửa và lưu hợp lệ, THE SYSTEM SHALL gọi `PUT /v1/memorials/{id}` với toàn bộ nội dung form, gồm cấu hình nhắc (không gửi ảnh), rồi:
    - on success: về `/memorial` và hiện `mem_flash_saved`; kỳ giỗ được tính lại từ dữ liệu mới;
    - on failure (404 — mục đã bị xoá nơi khác): về `/memorial` và hiện `mem_flash_gone`; sổ (đọc lại từ backend) không còn mục đó;
    - on failure (400 / mạng / 5xx): như AC 18. (FR-MEM-004, FR-MEM-007, BR-MEM-11, BR-MEM-01)
21. WHEN người dùng rời form sửa mà không lưu (nút `mem_cancel` hoặc điều hướng khác), THE SYSTEM SHALL không gọi backend và mục giữ nguyên. (FR-MEM-004)

### Xoá

22. WHEN người dùng bấm `mem_delete` ở form sửa, THE SYSTEM SHALL hỏi xác nhận trước (hộp thoại `mem_confirm_delete_*`; không có JS thì một khối xác nhận), rồi:
    - WHEN người dùng huỷ: không gọi backend, mục còn nguyên;
    - WHEN người dùng xác nhận: gọi `DELETE /v1/memorials/{id}` từ action; on success về `/memorial` và hiện `mem_flash_deleted` với tên; on failure (404 — đã bị xoá nơi khác) về `/memorial` và hiện `mem_flash_gone`, sổ không còn mục đó; on failure (mạng / 5xx) ở lại, hiện `mem_err_delete`, mục còn nguyên. (FR-MEM-005, BR-MEM-12)
    > ⚠️ Not confirmed (product): product §3.1.1 không có câu cho "xoá không thành công" (FR-MEM-005 không có kịch bản server lỗi) — chặn chữ của `mem_err_delete`; hành vi (ở lại, mục còn nguyên) là quyết định platform; hand back to ba-writer in innerlamp-be.

### Chung

23. WHEN gọi backend, THE SYSTEM SHALL chỉ gọi từ server SvelteKit qua `$lib/server/api/memorials.ts` (và `$lib/server/api/users.ts` cho múi giờ), với `x-api-key` và Bearer từ cookie httpOnly; token không bao giờ xuống HTML/JS browser. (platform, BR-MEM-01)
24. WHEN xử lý hoặc ghi log một request sổ giỗ, THE SYSTEM SHALL NOT ghi tên, ghi chú của người thân vào log, URL hay analytics (chỉ id); thông báo sau khi lưu/xoá không đưa tên lên query string. (NFR-MEM-02)
25. WHEN sổ có 100 mục, THE SYSTEM SHALL hiển thị sổ trong 2 giây trên mạng 4G và cập nhật preview ngay khi một giá trị đổi. (NFR-MEM-01)
26. WHEN một người dùng đã đăng nhập mở bất kỳ trang nào và múi giờ IANA của trình duyệt khác múi giờ đã báo gần nhất từ trình duyệt này (kể cả lần đầu sau khi đăng nhập), THE SYSTEM SHALL báo múi giờ đó làm múi giờ tài khoản qua server SvelteKit; WHEN trình duyệt không cho một tên IANA hợp lệ, THE SYSTEM SHALL không báo gì (tài khoản giữ múi giờ trước đó, mặc định giờ Việt Nam theo BR-MEM-11); báo lỗi không hiện gì cho người dùng và thử lại ở lần mở trang sau. (BR-MEM-11)
    > ⚠️ Not confirmed (contract): `openapi.yaml` @ bf23f8b chưa có thao tác ghi múi giờ tài khoản (product Appendix B mục 3) — chặn Step E-2 trong `design.md` và task Phase 3 tương ứng; hand-off cho backend.
27. WHEN tới thời điểm nhắc của một mục (do backend quyết định), THE SYSTEM SHALL hiển thị lời nhắc đó trong danh sách thông báo của website (feature `notifications`) với chữ theo product §3.1.1 (các dòng "Push / notification …" và "Notification list detail"), và SHALL NOT gửi push hay thông báo trình duyệt. (FR-MEM-008 §3.6, ADR-0001)
    > ⚠️ Not confirmed (contract): `openapi.yaml` @ bf23f8b chưa có thao tác danh sách thông báo và chưa định nghĩa lời nhắc giỗ mang gì (product Appendix B mục 7) — chưa biết backend gửi chữ đã dựng sẵn hay dữ liệu (id mục, quan hệ, số ngày, ngày dương, tên) để website tự dựng bằng key `mem_notif_*` — chặn AC này và các key `mem_notif_*`; hand-off cho backend.
28. WHEN người dùng chọn một lời nhắc giỗ trong danh sách thông báo, THE SYSTEM SHALL mở `/memorial/[id]` của mục đó (AC 19; mục đã bị xoá → `mem_not_found`). (FR-MEM-008)
29. WHEN người dùng tắt thông báo cho cả tài khoản, THE SYSTEM SHALL vẫn hiển thị lời nhắc giỗ trong danh sách thông báo của website; công tắc đó chỉ dừng push nên không đổi gì trên website. (FR-MEM-008)
30. WHEN chạy unit test, THE SYSTEM SHALL qua mọi case của `rules/next-anniversary.json`, `rules/anniversary-ordinal.json` và `rules/death-date-conversion.json` của product spec (product §4.3 — `reminder-moment.json` chỉ chạy ở backend). (NFR-MEM-03, BR-MEM-10)
31. WHEN hiển thị bất kỳ chuỗi nào (kể cả lỗi), THE SYSTEM SHALL chỉ dùng key Paraglide có trong cả `messages/vi.json` và `messages/en.json`, không bao giờ `error.message` của backend; chữ tiếng Việt của mọi tình huống có trong product §3.1.1 lấy đúng nghĩa của bảng đó (chỉ chỉnh dấu câu/xuống dòng), bản `en` theo phần giải nghĩa tiếng Anh của bảng. (platform, FR-MEM-003, FR-MEM-005, FR-MEM-012)

## Dữ liệu & API (gọi từ SvelteKit server)

Header chung: `x-api-key` từ `API_KEY`; `Authorization: Bearer <il_token>` (cả 5 route Memorials `RequireAuth`). Hình dạng request/response: schema `Memorial` / `MemorialRequest` trong innerlamp-be `docs/specs/api/openapi.yaml` — không chép ở đây.

| Thao tác | Operation (openapi) | Gọi từ | Ghi chú |
| --- | --- | --- | --- |
| Đọc sổ | `GET /v1/memorials` | `src/routes/(site)/memorial/+page.server.ts` `load` | Backend trả theo `created_at` giảm dần; website tự sắp lại theo kỳ giỗ (AC 4) |
| Đọc một mục | `GET /v1/memorials/{id}` | `memorial/[id]/+page.server.ts` `load` | 404 đồng nhất cho "không có" và "của người khác" |
| Thêm | `POST /v1/memorials` | `memorial/new/+page.server.ts` action `default` | Biết năm → `death_date` dương (website đổi); không rõ năm → `death_day`/`death_month`/`death_leap_month`; `reminder` từ form, chỉ lead + giờ |
| Sửa | `PUT /v1/memorials/{id}` | `memorial/[id]/+page.server.ts` action `save` | Thay toàn bộ, `reminder` từ form (AC 20) |
| Xoá | `DELETE /v1/memorials/{id}` | `memorial/[id]/+page.server.ts` action `delete` | Chỉ sau xác nhận (AC 22) |
| Báo múi giờ tài khoản | ⚠️ chưa có trong contract (product Appendix B mục 3) | `src/routes/api/account-timezone/+server.ts` → `$lib/server/api/users.ts` | AC 26 |
| Danh sách thông báo | ⚠️ chưa có trong contract (product Appendix B mục 7) | thuộc feature `notifications` | AC 27, 28 |

Quan hệ: website giữ key nội bộ (`paternal_grandfather`, …) và map 1:1 sang enum `relationship` của contract trong lớp API. Contract @ bf23f8b còn nhận lead 0–30, giờ bất kỳ và vài field ngoài product (Appendix B mục 2, 6); website chỉ gửi lựa chọn của BR-MEM-11 nên hợp lệ cả trước lẫn sau khi backend thu hẹp contract.

## Error → UI mapping

| Operation | Failure case | Visitor sees | Hiện trạng code |
| --- | --- | --- | --- |
| mọi route | Không có phiên | Lời mời đăng nhập (`mem_guest_*`) | ✓ (`GuestPrompt`) |
| mọi route | 401 `UNAUTHORIZED` (hook đã thử refresh) | Xoá phiên, chuyển `/login` | chưa có (chưa gọi BE) |
| `GET /v1/memorials` | mạng / 5xx | `mem_err_load` + `mem_retry` (không có bản offline) | chưa có |
| `GET /v1/memorials/{id}` | 404 `MEMORIAL_NOT_FOUND` | `mem_not_found` + `mem_back` | ✓ cho id không có trong `localStorage`; chưa gọi BE |
| `GET /v1/memorials/{id}` | mạng / 5xx | `mem_err_load` + `mem_retry` | chưa có |
| `POST` / `PUT` | 400 `VALIDATION_ERROR`, `details.field = full_name` | `mem_f_name_err` hoặc `mem_f_name_too_long` ở ô tên | chỉ có kiểm tên rỗng ở browser |
| `POST` / `PUT` | 400, `details.field` ∈ `death_date`, `death_day`, `death_month`, `death_leap_month` | `mem_f_date_invalid` ở khối ngày mất | chưa có |
| `POST` / `PUT` | 400, `details.field = note` | `mem_f_note_too_long` ở ô ghi chú | chưa có |
| `POST` / `PUT` | 400, field khác (`relationship`, `death_calendar`, `reminder.*`, body sai) | `mem_err_save` (lỗi của website — log mã lỗi, không log nội dung) | chưa có |
| `POST` | 409 `MEMORIAL_LIMIT_REACHED` | `mem_err_full`, giữ form | chưa có |
| `POST` / `PUT` | mạng / 5xx / 413 | `mem_err_save`, giữ form | chưa có |
| `PUT` | 404 | Về `/memorial`, `mem_flash_gone` | chưa có |
| `DELETE` | 404 | Về `/memorial`, `mem_flash_gone` | chưa có |
| `DELETE` | mạng / 5xx | `mem_err_delete`, ở lại form (chữ chờ ⚠️ AC 22) | chưa có |
| Báo múi giờ (⚠️ contract) | mọi lỗi | Không hiện gì; thử lại ở lần mở trang sau | chưa có |

## Out of scope

- Push, thông báo trình duyệt và gợi ý "Mở Cài đặt" để bật push (FR-MEM-008 §3.6 — chỉ app).
- Đọc offline (FR-MEM-010 — chỉ app); "Thêm vào Lời nhắc" (FR-MEM-009 — đã bỏ ở v2.0).
- Tính và gửi lời nhắc, nhắc trễ, thời điểm nhắc đã qua (BR-MEM-11 phần thời điểm, BR-MEM-13, NFR-MEM-04 — backend, ADR-0002).
- Bản thân danh sách thông báo: trang `/notifications`, badge, đánh dấu đã đọc, phân trang theo tháng — feature `notifications` (ADR-0001).
- Công tắc ở `/settings` (vd "Ngày giỗ", `set_memorial`) thuộc feature settings; theo FR-MEM-008 (v2.1) công tắc toàn tài khoản chỉ dừng push nên không ảnh hưởng sổ giỗ trên website (AC 29).
- Ảnh chân dung (FR-MEM-011 — `later`, chặn bởi backend `TD-001`); chỉ có chữ cái đầu (AC 8).
- "Lấy từ gia phả" (thuộc product `genealogy`).

## Pending (not yet implemented)

Theo dõi ở `tasks.md`:

- **Chuyển sổ từ `localStorage` sang backend** (BR-MEM-01, FR-MEM-001…005, FR-MEM-007) — Phase 3; gỡ store `localStorage` và key `il-memorial` — Phase 2.
- Bỏ công tắc "Thêm vào lịch nhắc" (`sync`), `mem_flash_saved_reminder` và "có trong lịch nhắc" (FR-MEM-009 đã bỏ) — Phase 1. Khối nhắc lead/giờ đã có và đúng lựa chọn của BR-MEM-11.
- Hiển thị lựa chọn gần nhất cho giá trị nhắc cũ (FR-MEM-007) — Phase 2, chờ ⚠️ AC 17.
- Báo múi giờ tài khoản (BR-MEM-11) — Phase 2–3, chờ ⚠️ AC 26 (contract).
- Lời nhắc giỗ trong danh sách thông báo (FR-MEM-008) — phụ thuộc feature `notifications`, chờ ⚠️ AC 27 (contract).
- Lựa chọn tháng nhuận + quy đổi âm → dương có nhuận (BR-MEM-04, BR-MEM-10) — Phase 1–2.
- Năm 1900 → nay (đang 97 năm gần nhất), ngày theo tháng, kiểm ngày tồn tại và không sau hôm nay, mỗi lỗi một câu theo product §3.1.1 (BR-MEM-03) — Phase 1–2.
- Giới hạn tên 100 / ghi chú 1000 ký tự (BR-MEM-02, FR-MEM-012, FR-MEM-013) — Phase 1–2.
- Hỏi xác nhận trước khi xoá (BR-MEM-12; code đang xoá ngay) — Phase 1.
- Ngày mất hiển thị kèm năm và dấu nhuận (AC 6) — Phase 1.
- Kỳ giỗ chỉ tính trong browser sau khi có dữ liệu từ server (AC 5) — Phase 1.
- Chữ theo product §3.1.1 trong `messages/{vi,en}.json` (AC 31) — Phase 1.
- Test chạy ba file vector và E2E — Phase 4.
- Đo NFR-MEM-01 — Phase 4.

## Open questions (resolved)

- ~~Sổ có gắn với tài khoản trên website không, dữ liệu `localStorage` cũ xử lý sao?~~ → Có, bắt buộc đăng nhập; dữ liệu cũ bỏ, không migrate (product BR-MEM-01, §2.7). Resolved 2026-10-14 (product v1.0).
- ~~Xoá có hỏi xác nhận không?~~ → Có (BR-MEM-12). Resolved 2026-10-14 (product v1.0).
- ~~Thông báo sau khi lưu/xoá mang tên người thân qua đâu?~~ → Cookie httpOnly ngắn hạn (`il_mem_flash`), không qua query string (NFR-MEM-02). Quyết định platform, 2026-10-14.
- ~~Website có hiện cấu hình nhắc không?~~ → v1.0: không, giữ nguyên khi sửa. **Thay bằng v2.0:** có, như app (FR-MEM-007, BR-MEM-11). Resolved 2026-10-14 (product v2.0). Downstream: AC 9, 16, 17, 18, 20; bỏ việc ẩn khối nhắc và bỏ bước đọc lại `GET` trước `PUT` (design Step C-3 cũ).
- ~~Lấy cấu hình nhắc để gửi lại khi `PUT` từ đâu?~~ → Không còn câu hỏi: form có cấu hình nhắc, `PUT` gửi giá trị của form. Resolved 2026-10-14 (product v2.0).
- ~~FR-MEM-001 "from the home screen" vs lối vào ở trang Hồ sơ?~~ → Website mở sổ từ trang Hồ sơ, không cần lối vào ở trang chủ (product §3.6 dòng FR-MEM-001, client question 1). Resolved 2026-10-14 (product v2.0). Downstream: AC 3; bỏ task "lối vào từ trang chủ".
- ~~Mục tạo trên website có nhận nhắc mặc định không?~~ → Có, trước 1 ngày, 07:00, như mọi platform (FR-MEM-003, client question 2). Resolved 2026-10-14 (product v2.0). Downstream: AC 9, 18.
- ~~Chữ thẻ `mem_pt_2_*` ("nhắc trước 1–7 ngày") giữ hay đổi?~~ → Giữ, website đã có cấu hình nhắc (product Appendix A, client question 4). Resolved 2026-10-14 (product v2.0). Downstream: bỏ task "rà chữ `mem_pt_2_*`".
- ~~Lỗi server khi đọc sổ trên website?~~ → Báo lỗi, không có bản offline (FR-MEM-010 §3.6, client question 9). Resolved 2026-10-14 (product v2.0). Downstream: AC 2.
- ~~Lưu/xoá một mục đã bị xoá nơi khác?~~ → Bỏ khỏi sổ và báo câu "Entry no longer exists" của §3.1.1 (FR-MEM-004, FR-MEM-005, client question 13). Resolved 2026-10-14 (product v2.0). Downstream: AC 20, 22 (`mem_flash_gone`).
- ~~Sổ trống có "Lấy từ gia phả" không?~~ → Không (FR-MEM-002, client question 14). Resolved 2026-10-14 (product v2.0). Downstream: AC 7 (code đã đúng).
- ~~Chữ hiển thị?~~ → Theo bảng product §3.1.1 (client question 15). Resolved 2026-10-14 (product v2.0). Downstream: AC 31, design "i18n keys".
- ~~Múi giờ nhắc?~~ → Múi giờ tài khoản, website báo múi giờ của trình duyệt (BR-MEM-11, ADR-0002). Resolved 2026-10-14 (product v2.0). Downstream: AC 26 (chờ contract).
- ~~Lưu múi giờ đã báo ở đâu để biết khi nào nó đổi?~~ → Cookie httpOnly `il_tz_reported` của trình duyệt này, xoá khi đăng xuất (design "Session & cookies"). Quyết định platform, 2026-10-14.
- ~~Công tắc thông báo toàn tài khoản chỉ dừng push hay ẩn cả lời nhắc khỏi danh sách thông báo?~~ → Chỉ dừng push, trên mọi thiết bị của tài khoản; lời nhắc giỗ vẫn vào danh sách thông báo (quyền thông báo của hệ điều hành là chuyện riêng). Trên website không có tác dụng (không có push). Resolved 2026-10-14 (product owner; product v2.1 FR-MEM-008). Downstream: AC 29.
