# Requirements — Đăng ký (Register)

Version: 1.2
Last updated: 2026-10-11
Status: in-progress — luồng chính đã chạy với BE thật; còn lệch spec ở xử lý lỗi theo ô và `PENDING_REGISTRATION_EXPIRED`
Feature folder: `src/lib/features/auth/`, `src/routes/(auth)/signup/`

> See `changelog.md` in this folder for the version history of this spec.

Spec này được viết lại retroactively từ code đang chạy (đã đối chiếu từng mục, không chép lại spec cũ).
Nguồn contract: BE `docs/specs/api/openapi.yaml` (tag Auth), `docs/specs/features/onboarding/requirements.md`.
Route: `/signup` (`/en/signup`).

## User Story

Là một khách, tôi muốn tạo tài khoản InnerLamp bằng số điện thoại + mật khẩu và xác minh bằng mã OTP qua SMS, để được đăng nhập ngay và dùng các tính năng dành cho thành viên.

## Acceptance Criteria (EARS notation)

- WHEN khách mở `/signup`, THE SYSTEM SHALL hiển thị form bước 1 gồm: pháp danh (tuỳ chọn, có nút gợi ý), nơi xuất gia (tuỳ chọn), số điện thoại (chọn quốc gia), email, mật khẩu (có thanh độ mạnh 3 đoạn) và checkbox đồng ý Điều khoản + Quyền riêng tư.
- WHEN một trong số điện thoại / email / mật khẩu chưa hợp lệ, hoặc chưa tick đồng ý, THE SYSTEM SHALL vô hiệu nút "Gửi mã xác thực".
- WHEN người dùng bấm "Gửi mã xác thực" với form hợp lệ, THE SYSTEM SHALL hiển thị trạng thái đang gửi, gọi `request-otp` từ server, rồi:
  - on success: chuyển sang bước nhập OTP, hiển thị số điện thoại đã gửi, bắt đầu đếm ngược `resend_after_seconds`;
  - on failure: ở lại bước 1 và hiển thị chuỗi lỗi vi/en tương ứng mã lỗi BE (xem bảng lỗi).
- WHEN người dùng nhập đủ 6 chữ số và bấm "Xác nhận", THE SYSTEM SHALL gọi `verify-otp`, rồi:
  - on success: set cookie phiên, redirect `localizeHref('/')`, UI ở trạng thái đã đăng nhập (không gọi login);
  - on failure: ở lại bước OTP và hiển thị lỗi tương ứng.
- WHEN mã nhập chưa đủ 6 chữ số, THE SYSTEM SHALL vô hiệu nút xác nhận; WHEN server nhận mã không khớp `^\d{6}$`, THE SYSTEM SHALL trả `OTP_INVALID` mà không gọi BE.
- WHEN bộ đếm ngược còn > 0, THE SYSTEM SHALL khoá nút "Gửi lại mã" và hiển thị số giây còn lại.
- WHEN bộ đếm về 0 và người dùng bấm "Gửi lại mã", THE SYSTEM SHALL gọi `resend-otp` (`purpose: "register"`) và đặt lại đếm ngược theo `resend_after_seconds` mới.
- WHEN BE trả `OTP_RESEND_TOO_SOON` kèm `details.retry_after_seconds`, THE SYSTEM SHALL đặt đếm ngược theo giá trị đó.
- WHEN người dùng bấm "Đổi số điện thoại" ở bước OTP, THE SYSTEM SHALL quay về form bước 1 giữ nguyên dữ liệu đã nhập.
- WHEN BE trả `PHONE_TAKEN`, THE SYSTEM SHALL hiển thị "Số điện thoại này đã có tài khoản. Hãy đăng nhập." và vẫn có liên kết "đã có tài khoản" tới `/login` trên form.
- WHEN trả kết quả form về trang, THE SYSTEM SHALL KHÔNG đưa mật khẩu vào payload `fail()`/`success` và không log mật khẩu.
- WHEN tải lại trang ở bước OTP, THE SYSTEM SHALL quay về bước 1 (không lưu trạng thái OTP phía client).
- WHEN có lỗi, THE SYSTEM SHALL chỉ hiển thị chuỗi trong `messages/{vi,en}.json` (không bao giờ `error.message` của BE).

## Trường dữ liệu (bước 1)

| Field | Bắt buộc | Rule FE (BE là nguồn đúng) |
| --- | --- | --- |
| `phone_number` | ✓ | Chọn quốc gia (12 nước, mặc định VN `+84`); nhập số quốc gia, FE bỏ định dạng, mã nước và số `0` đầu rồi yêu cầu **đúng** độ dài theo nước (VN = 9). Gửi lên **E.164 đã ghép** (`+84949123456`) |
| `email` | ✓ | Regex `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$`. Chưa xác minh (copy UI: "để nhận biên nhận cúng dường") |
| `password` | ✓ | ≥ 8 **byte** UTF-8 (BE đếm byte). Thanh độ mạnh chỉ là gợi ý UI (`passwordScore`) |
| `full_name` | ✓ | Tối đa 300 **ký tự** (BE: `INVALID_FULL_NAME`) |
| `dharma_name` | ✗ | Văn bản tự do ≤ 255 ký tự (BE: `INVALID_DHARMA_NAME`); có nút "gợi ý" lấy ngẫu nhiên từ 10 pháp danh mẫu |
| `ordination_temple_id` | ✗ | Id chùa từ `GET /v1/temples/options`; bỏ trống nếu chọn "Không" hoặc chùa đang chờ duyệt. Id không tồn tại → `INVALID_TEMPLE` |
| Đồng ý điều khoản | ✓ (FE) | Checkbox; **không gửi lên BE** |

Bước 2: `otp_code` — 6 chữ số, gửi dạng chuỗi (giữ số 0 đầu).

`ordination_place` **đã bị BE bỏ** (2026-10-11; gửi lên sẽ bị `VALIDATION_ERROR`, decode strict) và thay bằng `ordination_temple_id`. Chùa không có trong danh sách: xem mục "Đề xuất chùa" bên dưới.

## Bảng lỗi → hành vi UI

| Code (HTTP) | Hành vi mong muốn | Hiện trạng code |
| --- | --- | --- |
| `VALIDATION_ERROR` (400) | "Vui lòng kiểm tra lại…", tô lỗi đúng ô nếu có `details` | Một dòng lỗi chung phía trên nút gửi; **chưa** tô theo ô |
| `INVALID_EMAIL` / `INVALID_PHONE` / `INVALID_PASSWORD` (400) | Lỗi ở ô tương ứng | Một dòng lỗi chung; **chưa** theo ô |
| `PHONE_TAKEN` (409) | Thông báo + link `/login` | Thông báo đúng; link login là link chung cuối form |
| `EMAIL_TAKEN` (409) | Lỗi ở ô email | Dòng lỗi chung |
| `OTP_RESEND_TOO_SOON` (429) | Đếm ngược theo `retry_after_seconds` | ✓ |
| `OTP_SEND_LIMITED` (429) | Thử lại sau; dùng `locked_until` nếu hiển thị mốc giờ | Chỉ thông báo chung; `locked_until` chưa được chuyển lên UI |
| `OTP_INVALID` (400) | "Mã chưa đúng" | ✓ |
| `OTP_EXPIRED` (400) | "Mã đã hết hạn" + nhấn mạnh Gửi lại | Có thông báo; **chưa** nhấn mạnh nút Gửi lại |
| `PENDING_REGISTRATION_EXPIRED` (400) | Quay về bước 1, nhập lại | **Lệch**: ở lại bước OTP và chỉ hiện thông báo |
| `OTP_LOCKED` (429) | Khoá nhập OTP đến `locked_until` | Chỉ thông báo; ô nhập **không** bị khoá |
| `INVALID_API_KEY` (401), 413, 5xx, `SMS_SEND_FAILED` | Thông báo chung, log server | ✓ (`auth_err_generic`) |
| `NETWORK_ERROR` (FE, status 0) | "Không kết nối được máy chủ" | ✓ |

## Out of scope

- Xác minh email, quên/đặt lại mật khẩu, đăng nhập bằng email (BE chưa có).
- Đăng nhập, refresh, đăng xuất → xem `../login/`.

## Pending (not yet implemented)

Theo dõi ở `tasks.md`:

- Tô lỗi theo ô cho `VALIDATION_ERROR` / `INVALID_*` / `EMAIL_TAKEN` (Phase 2).
- `PENDING_REGISTRATION_EXPIRED` → quay về bước 1 (Phase 2).
- Khoá ô OTP đến `locked_until` khi `OTP_LOCKED`; hiển thị mốc giờ khi `OTP_SEND_LIMITED` (Phase 2).
- Nhấn mạnh nút "Gửi lại mã" khi `OTP_EXPIRED` (Phase 2).
- Test unit/e2e (Phase 3).

> ⚠️ Not confirmed: khi bấm "Đổi số điện thoại", **mật khẩu hiện được giữ lại** trong form (state không bị huỷ) — spec cũ ghi "giữ dữ liệu, trừ mật khẩu". Giữ hay xoá? — quyết định này chặn việc sửa code ở `SignupForm.svelte`.

> ⚠️ Not confirmed: khi `PENDING_REGISTRATION_EXPIRED`, có tự điền lại số điện thoại ở bước 1 hay không — chặn thiết kế hành vi quay về bước 1.

> ⚠️ Not confirmed: `API_KEY` production và OTP thật — BE xác nhận **chưa có** (TD-001; OTP vẫn `111111`) — chặn go-live, chờ BE.

## Đề xuất chùa ("Không tìm thấy chùa của bạn?")

- BE: `POST /v1/temple-suggestions` (công khai, `x-api-key`), body `name` ≤ 255, `province_code`, `ward_code` (mã **hệ mới**), `address` ≤ 500 — **cả bốn bắt buộc**. 201 `{id, status:"pending"}`; 429 `RATE_LIMITED` (5/IP/giờ). Không liên kết với tài khoản; admin duyệt ở backoffice.
- WHEN người dùng đề xuất chùa và xác minh OTP thành công, THE SYSTEM SHALL gửi đề xuất đó một lần (best effort: lỗi không làm hỏng đăng ký) và KHÔNG gửi `ordination_temple_id`.
- Đề xuất đi theo luồng: ô ẩn ở bước 1 → echo `suggestion` trong kết quả action → ô ẩn `temple_suggestion` ở bước OTP → gửi sau `verify-otp`.
- WHEN ward không chọn được từ danh sách (phải gõ tay, `ward_code = null`), THE SYSTEM SHALL bỏ qua việc gửi đề xuất (BE cần `ward_code`).
- Sau khi chùa được duyệt, người dùng tự cập nhật nơi xuất gia qua `PATCH /v1/users/me` (chưa có UI).

## Open questions (resolved)

- ~~`ordination_place` BE mong đợi giá trị gì?~~ → Superseded 2026-10-11: BE bỏ field này, dùng `ordination_temple_id` (id chùa).
- ~~Dùng email làm định danh đăng ký?~~ → Không: định danh là số điện thoại; email bắt buộc nhưng chỉ để nhận biên nhận. Ghi nhận 2026-10-10 từ code `signup/+page.server.ts` (`request` yêu cầu cả phone + email + password).

## Bảo mật & ràng buộc đầu vào — đối chiếu FE↔BE (2026-10-10)

Chi tiết đầy đủ ở `../login/requirements.md` mục "Bảo mật — đối chiếu FE↔BE". Phần liên quan đăng ký:

- **OTP dev `111111` chưa được bảo vệ**: BE `generateOTP()` trả hằng `111111` vô điều kiện và SMS chỉ ghi log. Deploy nguyên trạng thì production cũng vậy → **blocker go-live phía BE**.
- **Không có rate limit theo IP/thiết bị** cho `request-otp` / `resend-otp`; mỗi số khác nhau gửi một SMS (rủi ro SMS pumping). FE cần captcha (Turnstile) + rate limit theo IP/SĐT ở server SvelteKit.
- **Lộ số/email đã đăng ký** (`PHONE_TAKEN`/`EMAIL_TAKEN`) là chủ ý theo spec onboarding BE (AC5).
- **Ràng buộc đầu vào FE phải chặn** vì BE sẽ trả 500 thay vì 400: `password` ≤ 72 byte (bcrypt), `dharma_name` và `ordination_place` ≤ 255 ký tự.
- `locked_until` là RFC 3339 có offset (không đảm bảo UTC); `OTP_RESEND_TOO_SOON` chỉ có `retry_after_seconds`.
- Response `verify-otp` có `expires_in` (giây, access token) — `setTokens` dùng làm TTL cookie (fallback 15 phút).
- BE `request-otp`/`verify-otp`/`login`/`refresh` trả `Cache-Control: no-store`.
