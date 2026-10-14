# Requirements — login (Đăng nhập, phiên, quên mật khẩu)

Version: 2.0
Last updated: 2026-10-14
Status: in-progress (drift) — đăng nhập bằng SĐT, refresh trong hook và đăng xuất đang chạy với backend thật; phải chuyển sang email, thêm quên mật khẩu, báo phiên hết, quay lại trang định vào. Chưa có code cho v2.0.
Feature folder: `src/routes/(auth)/login/`, `src/routes/(auth)/forgot-password/` (chưa có), `src/lib/features/auth/`, `src/lib/server/auth/`, `src/lib/server/api/{auth,client}.ts`, `src/hooks.server.ts`
Product spec: innerlamp-be `docs/product/login/product.md` @ v1.2 (ADR-0003 — Accepted)
Contract: innerlamp-be `docs/specs/features/login/requirements.md` @ v2.1 §API contract (6d8cd78); refresh và logout không đổi so với `openapi.yaml` hiện tại. `openapi.yaml` chưa có login theo email và `password-reset/*` — backend cập nhật khi handler chạy thật.
Implements: BR-LGN-01, BR-LGN-02, BR-LGN-03, BR-LGN-04, BR-LGN-05, BR-LGN-06, BR-LGN-07, FR-LGN-001, FR-LGN-002, FR-LGN-003, FR-LGN-004, FR-LGN-005, FR-LGN-006, FR-LGN-007, FR-LGN-008, FR-LGN-009, FR-LGN-010, NFR-LGN-01, NFR-LGN-02, NFR-LGN-03

> See `changelog.md` in this folder for the version history of this spec.

v2.0 viết lại spec theo product login v1.2. Luật nghiệp vụ (thông điệp đồng nhất, khoá 5 lần / 15 phút,
phiên 7 ngày, chính sách mã đặt lại) ở product spec, không nhắc lại. Route: `/login`,
`/forgot-password` (`/en/...`).

## User Story

Là một thành viên, tôi muốn đăng nhập bằng email và mật khẩu, được giữ phiên, được báo khi phiên hết, và
tự lấy lại mật khẩu qua mã gửi tới email, để dùng các tính năng thành viên mà không phải nhờ ai.

## Acceptance Criteria (EARS notation)

### Đăng nhập

1. WHEN khách mở `/login`, THE SYSTEM SHALL hiển thị ô email, ô mật khẩu, link "Quên mật khẩu?" tới `/forgot-password`, link `/signup` và "Vào xem trước, chưa đăng nhập" tới `/`; SHALL NOT có nút đăng nhập bằng mã một lần. (FR-LGN-001, FR-LGN-010)
2. WHEN người đã đăng nhập mở `/login`, THE SYSTEM SHALL chuyển tới `localizeHref('/')`. (FR-LGN-007)
3. WHILE email rỗng hoặc mật khẩu rỗng, THE SYSTEM SHALL vô hiệu nút đăng nhập; không áp luật độ dài mật khẩu ở đây. (BR-LGN-01)
4. WHEN người dùng gửi form, THE SYSTEM SHALL gọi `POST /v1/auth/login` từ form action với email, mật khẩu và `device {platform: "web", device_model}` lấy từ User-Agent, rồi:
   - on success: đặt cookie phiên, chuyển tới trang trong `redirect` nếu hợp lệ (AC6), không thì `localizeHref('/')`;
   - on failure: ở lại `/login`, giữ email, báo lỗi theo bảng Error → UI. (FR-LGN-001, FR-LGN-002, BR-LGN-01)
5. WHEN backend trả `LOGIN_LOCKED`, THE SYSTEM SHALL hiển thị `auth_err_login_locked` với giờ mở khoá lấy từ `locked_until` (giờ địa phương), không ghi cứng "15 phút". (FR-LGN-003, BR-LGN-02)
6. WHEN khách bị mời đăng nhập trên đường tới một trang cần tài khoản, THE SYSTEM SHALL đưa tới `/login?redirect=<đường dẫn>` và sau khi đăng nhập mở đúng trang đó; `redirect` chỉ nhận đường dẫn tương đối cùng site (bắt đầu bằng `/`, không `//`, không scheme), sai thì bỏ qua. (FR-LGN-007)

### Phiên

7. WHEN request tới server không có `il_token` nhưng có `il_refresh`, THE SYSTEM SHALL gọi `POST /v1/auth/refresh` một lần cho mỗi request (single-flight theo refresh token), lưu cả hai token mới với TTL từ `expires_in`, rồi:
   - on 4xx từ backend: xoá phiên và coi là phiên hết (AC9);
   - on lỗi mạng / 5xx: giữ cookie, thử lại ở request sau. (FR-LGN-004, BR-LGN-03)
8. WHEN một call Bearer tới backend trả `401` trong lúc người dùng còn cookie, THE SYSTEM SHALL làm mới một lần rồi thử lại call đó; vẫn `401` thì xoá phiên và coi là phiên hết (AC9). (FR-LGN-005, BR-LGN-03)
9. WHEN phiên hết mà người dùng không tự đăng xuất (refresh bị từ chối, `401` ở AC8, mật khẩu đã đặt lại ở nơi khác), THE SYSTEM SHALL đưa trình duyệt tới `/login?reason=session_ended&redirect=<trang hiện tại>` khi đó là điều hướng trang (GET), và `/login` hiển thị `login_session_ended`; SHALL NOT âm thầm chuyển người dùng thành khách. (FR-LGN-005, BR-LGN-04)
10. WHEN trang được render, THE SYSTEM SHALL không đưa access/refresh token vào HTML, dữ liệu page hay JS của browser; token chỉ nằm trong cookie httpOnly. (NFR-LGN-03)

### Đăng xuất

11. WHEN người dùng chọn "Đăng xuất" ở `/profile`, THE SYSTEM SHALL hỏi xác nhận; huỷ thì giữ nguyên; xác nhận thì gọi `POST /v1/auth/logout` (best effort), xoá cookie phiên dù backend lỗi và chuyển tới `/` ở trạng thái khách. (FR-LGN-006, BR-LGN-07)

### Quên mật khẩu

12. WHEN khách mở `/forgot-password`, THE SYSTEM SHALL hiển thị ô email; người đã đăng nhập mở trang này được chuyển về `/`. (FR-LGN-008)
13. WHEN gửi email, THE SYSTEM SHALL gọi `POST /v1/auth/password-reset/request-otp` và, dù email có tài khoản hay không, chuyển sang bước đặt mật khẩu mới với `forgot_sent` ("Nếu email này có tài khoản, mã đã được gửi"), đồng hồ thời hạn và gửi lại theo response. (FR-LGN-008, NFR-LGN-01)
14. WHEN chọn "Gửi lại mã" sau thời gian chờ, THE SYSTEM SHALL gọi lại `password-reset/request-otp` và đặt lại hai đồng hồ. (FR-LGN-008)
15. WHEN nhập mã và mật khẩu mới hợp lệ (BR-ONB-06, đếm ký tự, chạy cùng vector `rules/password.json`), THE SYSTEM SHALL gọi `POST /v1/auth/password-reset/confirm`; on success chuyển tới `/login` với `login_password_changed` ("Đã đổi mật khẩu, vui lòng đăng nhập lại."). (FR-LGN-009, BR-LGN-05)
16. WHEN website đang có phiên ở trình duyệt này và mật khẩu vừa được đặt lại (ở đây hoặc nơi khác), THE SYSTEM SHALL xử lý request tiếp theo theo AC8–AC9 (backend trả `401`). (FR-LGN-009)

### Khách

17. WHEN khách mở một trang cần tài khoản, THE SYSTEM SHALL hiển thị lời mời đăng nhập/đăng ký (link `/login?redirect=…`) thay vì nội dung, và SHALL NOT gọi backend cho dữ liệu tài khoản; trang công khai mở bình thường. (FR-LGN-010, BR-LGN-06)

### Chung

18. WHEN có lỗi, THE SYSTEM SHALL chỉ hiển thị chuỗi Paraglide (không `error.message` của backend); `RATE_LIMITED` hiển thị `auth_err_rate_limited` kèm thời gian chờ. (NFR-LGN-02)
19. WHEN gọi backend từ server SvelteKit, THE SYSTEM SHALL gửi kèm IP của khách ở header `X-InnerLamp-Client-IP` (`event.getClientAddress()`) và User-Agent của trình duyệt để giới hạn theo IP của backend tính đúng từng khách. (NFR-LGN-02, platform)

## Dữ liệu & API (gọi từ SvelteKit server)

| Thao tác | Endpoint | Ghi chú |
| --- | --- | --- |
| Đăng nhập | `POST /v1/auth/login` | `email` thay `phone_number` |
| Làm mới | `POST /v1/auth/refresh` | Không đổi |
| Đăng xuất | `POST /v1/auth/logout` | Không đổi |
| Xin mã đặt lại | `POST /v1/auth/password-reset/request-otp` | Mới |
| Đặt mật khẩu mới | `POST /v1/auth/password-reset/confirm` | Mới |

## Error → UI mapping

| Trường hợp | Người dùng thấy |
| --- | --- |
| `INVALID_CREDENTIALS` | `auth_err_invalid_credentials` ("Email hoặc mật khẩu không đúng") |
| `LOGIN_LOCKED` | `auth_err_login_locked` kèm giờ mở khoá |
| `INVALID_EMAIL` | Lỗi dưới ô email |
| `INVALID_PASSWORD` (đặt lại) | Lỗi dưới ô mật khẩu mới |
| `OTP_INVALID` / `OTP_EXPIRED` / `OTP_LOCKED` / `OTP_RESEND_TOO_SOON` / `OTP_SEND_LIMITED` | Như đăng ký (`../onboarding/requirements.md` Error → UI) |
| `RATE_LIMITED` | `auth_err_rate_limited` kèm thời gian chờ |
| `REFRESH_TOKEN_INVALID`, `401` ở call Bearer | Phiên hết (AC9) |
| `INVALID_DEVICE`, `INVALID_API_KEY`, 5xx | `auth_err_generic`, log server |
| `NETWORK_ERROR` | `auth_err_network` |

## Out of scope

- Đăng ký → `../onboarding/`.
- Đăng nhập bằng mã, Google/Apple, đăng xuất mọi thiết bị, đổi mật khẩu khi đang đăng nhập → để sau (product §1.2).

## Pending (not yet implemented)

`tasks.md` Phase 1–6.

> ⚠️ Not confirmed: ngày có `API_KEY` production (TD-001 phía backend) — chặn deploy, chờ backend.

## Open questions (resolved)

- ~~Mật khẩu có giữ sau khi đăng nhập thất bại?~~ → Xoá ô mật khẩu, giữ email (product §3.7 chỉ giữ email). Resolved 2026-10-14.
- ~~Người đã đăng nhập mở `/login` / `/signup`?~~ → Về `/` (FR-LGN-007). Resolved 2026-10-14.
- ~~Sau đăng nhập về đâu?~~ → Trang khách định vào, hoặc `/` nếu mở `/login` trực tiếp (FR-LGN-007). Resolved 2026-10-14.
- ~~Nút "Gửi mã một lần qua SMS"?~~ → Bỏ (product, không có đăng nhập bằng mã). Resolved 2026-10-14.
- ~~Captcha + rate limit ở server SvelteKit?~~ → Không; backend giới hạn theo IP khách do website chuyển tiếp (AC19, backend login v2.2 AC34). Resolved 2026-10-14.
- ~~Refresh token vừa xoay có grace window?~~ → Không (giữ từ v1.1); vì vậy refresh phải single-flight (AC7). Resolved 2026-10-10.
