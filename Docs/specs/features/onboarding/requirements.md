# Requirements — onboarding (Đăng ký trên website)

Version: 1.1
Last updated: 2026-10-15
Status: in-progress (drift) — luồng `/signup` hai bước đang chạy với backend theo SĐT + OTP qua SMS; phải chuyển sang mã qua email theo product v1.2. Chưa có code cho v1.0 của spec này.
Feature folder: `src/routes/(auth)/signup/`, `src/lib/features/auth/`, `src/lib/server/api/auth.ts`, `src/lib/types/auth.ts`
Product spec: innerlamp-be `docs/product/onboarding/product.md` @ v1.2 (ADR-0003 — Accepted)
Contract: innerlamp-be `docs/specs/features/onboarding/requirements.md` @ v8.0 §API contract (6d8cd78). `openapi.yaml` chưa có hình dạng mới — backend cập nhật khi handler chạy thật.
Implements: BR-ONB-04, BR-ONB-05, BR-ONB-06, BR-ONB-07, BR-ONB-08, BR-ONB-09, BR-ONB-10, BR-ONB-11, FR-ONB-003, FR-ONB-004, FR-ONB-005, FR-ONB-006, FR-ONB-007, FR-ONB-008, FR-ONB-009, FR-ONB-010, NFR-ONB-01, NFR-ONB-02, NFR-ONB-03

> See `changelog.md` in this folder for the version history of this spec.

Spec này thay `../register/` (SĐT + SMS, sẽ xoá ở bước dọn tài liệu cũ). Slug theo product spec là
`onboarding`; URL vẫn là `/signup` (`/en/signup`). Không áp dụng cho website: BR-ONB-01…03,
FR-ONB-001, FR-ONB-002 (màn giới thiệu, chỉ app — product §3.6).

Luật nghiệp vụ (độ dài, danh sách nước, chính sách mã, nội dung thông báo) nằm ở product spec, không
nhắc lại ở đây; file này chỉ nói website hiện thực chúng thế nào.

## User Story

Là một khách, tôi muốn tạo tài khoản bằng email, mật khẩu, số điện thoại và họ tên rồi nhập mã gửi tới
email, để được đăng nhập ngay và dùng các tính năng dành cho thành viên.

## Acceptance Criteria (EARS notation)

### Form đăng ký (bước 1)

1. WHEN khách mở `/signup`, THE SYSTEM SHALL hiển thị form: họ tên, pháp danh (tuỳ chọn, để trống, có nút gợi ý), nơi xuất gia (danh sách chùa hoặc "Cư sĩ tu tại gia", có đề xuất chùa), số điện thoại (chọn nước + số), email, mật khẩu (có gợi ý độ mạnh) và ô đồng ý điều khoản có link `/terms` và `/privacy`. (FR-ONB-003, FR-ONB-004, BR-ONB-07, BR-ONB-11)
2. WHEN người đã đăng nhập mở `/signup`, THE SYSTEM SHALL chuyển tới `localizeHref('/')` từ `load` của server. (FR-ONB-003 §3.6)
3. WHEN người dùng chọn nước, THE SYSTEM SHALL chỉ cho chọn 12 nước của BR-ONB-04 (mặc định Việt Nam) và kiểm số theo đúng số chữ số của nước đó; bản kiểm trong browser chỉ để báo sớm, server backend là nơi quyết định. (BR-ONB-04)
4. WHEN email, mật khẩu, họ tên hoặc pháp danh chưa đúng BR-ONB-05/06/07, THE SYSTEM SHALL báo lỗi ngay dưới ô đó và vô hiệu nút gửi; mật khẩu đếm theo **ký tự** sau NFC (không đếm byte), 8–64. (BR-ONB-05, BR-ONB-06, BR-ONB-07)
5. WHILE chưa tick đồng ý điều khoản, THE SYSTEM SHALL vô hiệu nút gửi. (BR-ONB-11)
6. WHEN thanh độ mạnh mật khẩu hiển thị, THE SYSTEM SHALL chỉ coi nó là gợi ý, không bao giờ chặn gửi. (BR-ONB-06, §3.6)
7. WHEN người dùng gửi form hợp lệ, THE SYSTEM SHALL gọi `POST /v1/auth/register/request-otp` từ form action với `phone_country` + số đã gõ (không tự ghép E.164), rồi:
   - on success: sang bước nhập mã, hiển thị email đã gửi, đồng hồ thời hạn theo `expires_in_seconds` và chờ gửi lại theo `resend_after_seconds`;
   - on failure: ở lại bước 1, giữ mọi giá trị (trừ không đưa mật khẩu vào payload trả về), báo lỗi ở đúng ô theo bảng Error → UI. (FR-ONB-003, BR-ONB-08, BR-ONB-09)
8. WHEN email đã có tài khoản, THE SYSTEM SHALL hiển thị y hệt email mới (backend đã trả giống nhau), không có chữ hay đường nào khác. (BR-ONB-08, NFR-ONB-01)
9. WHEN backend trả `PHONE_TAKEN`, THE SYSTEM SHALL hiển thị `auth_err_phone_taken` dưới ô số điện thoại kèm link `/login`. (FR-ONB-005)

### Nhập mã (bước 2)

10. WHEN người dùng nhập đủ 6 chữ số và xác nhận, THE SYSTEM SHALL gọi `POST /v1/auth/register/verify-otp` với email + mã, rồi on success đặt cookie phiên (như `../login/`), gửi đề xuất chùa nếu có (AC14) và chuyển tới `localizeHref('/')`. (FR-ONB-007, §3.6)
11. WHILE còn thời hạn, THE SYSTEM SHALL đếm ngược theo số backend trả; WHEN hết, hiển thị "mã đã hết hạn" và nhấn mạnh "Gửi lại mã". WHILE chưa tới lúc gửi lại, nút "Gửi lại mã" bị khoá và hiển thị số giây còn lại; WHEN gửi lại, gọi `POST /v1/auth/register/resend-otp` và đặt lại hai đồng hồ theo response. (FR-ONB-008, BR-ONB-09)
12. WHEN người dùng chọn "Đổi email", THE SYSTEM SHALL quay về form bước 1 với mọi ô như đã nhập. (FR-ONB-009)
13. WHEN backend trả `PENDING_REGISTRATION_EXPIRED`, THE SYSTEM SHALL hiển thị `auth_err_pending_expired` và quay về bước 1 với mọi ô như đã nhập. (FR-ONB-010)
14. WHEN người dùng đã đề xuất chùa và tài khoản vừa được tạo, THE SYSTEM SHALL gửi `POST /v1/temple-suggestions` một lần (lỗi không làm hỏng đăng ký): tên, tỉnh và phường **bắt buộc** chọn từ danh sách đơn vị hành chính, địa chỉ đường **tuỳ chọn**. (FR-ONB-006, BR-ONB-10)
15. WHEN tải lại trang ở bước 2, THE SYSTEM SHALL quay về bước 1 (không giữ trạng thái mã ở client). (platform)

### Chung

16. WHEN hiển thị lỗi, THE SYSTEM SHALL chỉ dùng chuỗi Paraglide, không bao giờ hiện `error.message` của backend; giờ mở khoá (`locked_until`) hiển thị theo giờ địa phương của trình duyệt. (NFR-ONB-02, platform)
17. WHEN backend trả `429 RATE_LIMITED`, THE SYSTEM SHALL hiển thị "thử lại sau" kèm thời gian từ `retry_after_seconds`. (NFR-ONB-02)
18. WHEN form action trả kết quả, THE SYSTEM SHALL không đưa mật khẩu, mã hay token vào payload trả về trang, và không log chúng. (NFR-ONB-03)
19. WHEN chạy unit test, THE SYSTEM SHALL qua mọi case của `rules/phone-number.json`, `rules/email.json`, `rules/password.json`, `rules/names.json` với các hàm kiểm của website. (BR-ONB-04…07)

## Dữ liệu & API (gọi từ SvelteKit server)

| Thao tác | Endpoint | Ghi chú |
| --- | --- | --- |
| Gửi form | `POST /v1/auth/register/request-otp` | Thay body SĐT bằng email + `phone_country` |
| Gửi lại mã | `POST /v1/auth/register/resend-otp` | Path mới (thay `/v1/auth/resend-otp`) |
| Xác nhận mã | `POST /v1/auth/register/verify-otp` | Trả phiên như login |
| Đề xuất chùa | `POST /v1/temple-suggestions` | Không đổi; `address` tuỳ chọn |
| Danh sách chùa / đơn vị hành chính | `GET /v1/temples/options`, `GET /v1/administrative-units/new/*` | Không đổi |

Hình dạng request/response: xem contract ở header. Mọi call kèm `x-api-key` và IP của khách (xem `../login/design.md` "Header gửi backend").

## Error → UI mapping

| Trường hợp | Người dùng thấy |
| --- | --- |
| `INVALID_EMAIL` / `INVALID_PHONE` / `INVALID_PASSWORD` / `INVALID_FULL_NAME` / `INVALID_DHARMA_NAME` | Lỗi dưới đúng ô (`auth_err_invalid_*`) |
| `INVALID_TEMPLE` | Lỗi ở ô nơi xuất gia, mời chọn lại |
| `VALIDATION_ERROR` | `auth_err_validation` chung |
| `PHONE_TAKEN` | `auth_err_phone_taken` dưới ô số + link `/login` |
| `OTP_RESEND_TOO_SOON` | Đồng hồ gửi lại theo `retry_after_seconds` |
| `OTP_SEND_LIMITED` | `auth_err_otp_limited` kèm giờ `locked_until`; vẫn nhập được mã cuối |
| `OTP_INVALID` | `auth_err_otp_invalid` |
| `OTP_EXPIRED` | `auth_err_otp_expired`, nhấn mạnh "Gửi lại mã" |
| `OTP_LOCKED` | `auth_err_otp_locked` kèm giờ `locked_until`, khoá ô nhập tới lúc đó |
| `PENDING_REGISTRATION_EXPIRED` | `auth_err_pending_expired`, về bước 1 (AC13) |
| `RATE_LIMITED` | `auth_err_rate_limited` kèm thời gian chờ |
| `EMAIL_SEND_FAILED`, 5xx, `INVALID_API_KEY` | `auth_err_generic`, log server |
| `NETWORK_ERROR` | `auth_err_network` |

## Out of scope

- Đăng nhập, phiên, quên mật khẩu → `../login/`.
- Màn giới thiệu, chuyển hướng khi mở app → chỉ app.
- Đổi email / SĐT, xoá tài khoản, Google/Apple → để sau (product §1.2).

## Pending (not yet implemented)

Toàn bộ thay đổi từ SMS sang email — `tasks.md` Phase 1–5.

## Open questions (resolved)

- ~~Mật khẩu có giữ khi "Đổi số"/"Đổi email"?~~ → Giữ mọi ô (FR-ONB-009 "every field as the user left it"). Resolved 2026-10-14.
- ~~`PENDING_REGISTRATION_EXPIRED` có điền lại ô?~~ → Có, mọi ô (FR-ONB-010). Resolved 2026-10-14.
- ~~Người đã đăng nhập mở `/signup`?~~ → Về trang chủ (product §3.6). Resolved 2026-10-14.
- ~~Captcha / rate limit ở server SvelteKit?~~ → Không làm ở website; backend giới hạn theo IP của khách mà website chuyển tiếp (backend login v2.2 AC34). Resolved 2026-10-14.
- ~~"Một nguồn" cho điều khoản (BR-ONB-11)?~~ → Trang `/terms` và `/privacy` của website là nguồn; app mở các trang đó (cách hiển thị do từng nền tảng). Đề xuất của Claude, anh Đức duyệt qua PR này; iOS/Android theo cùng nguồn. Resolved 2026-10-14.
