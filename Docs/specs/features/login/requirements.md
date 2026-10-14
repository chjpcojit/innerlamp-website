# Requirements — Đăng nhập (Login / Refresh / Logout)

Version: 1.1
Last updated: 2026-10-10
Status: in-progress — đăng nhập, refresh trong hook và đăng xuất đã chạy với BE thật; còn nút/link chưa có API và chưa có test
Feature folder: `src/lib/features/auth/`, `src/routes/(auth)/login/`, `src/hooks.server.ts`

> See `changelog.md` in this folder for the version history of this spec.

Spec này được viết lại retroactively từ code đang chạy. Nguồn contract: BE `docs/specs/api/openapi.yaml` (tag Auth), `docs/specs/features/login/requirements.md` (AC16–AC19 về X-API-Key).
Route: `/login` (`/en/login`).

## User Story

Là một thành viên đã có tài khoản, tôi muốn đăng nhập bằng số điện thoại + mật khẩu và được giữ phiên (tự làm mới, đăng xuất được), để dùng các tính năng dành cho thành viên mà không phải nhập lại liên tục.

## Acceptance Criteria (EARS notation)

- WHEN khách mở `/login`, THE SYSTEM SHALL hiển thị form số điện thoại (chọn quốc gia) + mật khẩu, link tới `/signup` và link "Vào xem trước, chưa đăng nhập" tới `/`.
- WHEN số điện thoại chưa hợp lệ hoặc mật khẩu rỗng, THE SYSTEM SHALL vô hiệu nút "Đăng nhập".
- WHEN người dùng bấm "Đăng nhập" với dữ liệu hợp lệ, THE SYSTEM SHALL gọi `login` từ server với `device.platform = "web"` và `device.device_model` lấy từ User-Agent (cắt 100 ký tự), rồi:
  - on success: set cookie phiên, redirect `localizeHref('/')`, UI ở trạng thái đã đăng nhập;
  - on failure: ở lại `/login` và hiển thị chuỗi lỗi vi/en theo mã BE, giữ số điện thoại.
- WHEN BE trả `INVALID_CREDENTIALS`, THE SYSTEM SHALL hiển thị cùng một thông báo cho sai mật khẩu, số chưa đăng ký và số đang chờ OTP (không lộ số có tồn tại).
- WHEN BE trả `LOGIN_LOCKED`, THE SYSTEM SHALL báo khoá tạm; vẫn khoá khi sau đó nhập đúng mật khẩu.
- WHEN mỗi request tới server mà không có cookie `il_token` nhưng có `il_refresh`, THE SYSTEM SHALL gọi `refresh` và lưu **cả hai** token mới (refresh token xoay vòng), rồi:
  - on 4xx từ BE: xoá cả 3 cookie, người dùng thành khách;
  - on lỗi mạng / 5xx: giữ cookie và thử lại ở request sau.
- WHEN người dùng bấm "Đăng xuất" ở `/profile`, THE SYSTEM SHALL gọi BE logout bằng `il_token` (nếu có), xoá cả 3 cookie dù BE lỗi, và redirect về `/`.
- WHEN trang được render, THE SYSTEM SHALL KHÔNG đưa access/refresh token vào HTML, JSON data của page hay JS browser.
- WHEN có lỗi, THE SYSTEM SHALL chỉ hiển thị chuỗi trong `messages/{vi,en}.json` (không bao giờ `error.message` của BE).

## Dữ liệu & API (gọi từ SvelteKit server)

Header chung: `Content-Type: application/json`, `x-api-key` từ `API_KEY` (bắt buộc với `device.platform="web"`, sai/thiếu → 401 `INVALID_API_KEY`).

| Thao tác | Endpoint | Request | Thành công |
| --- | --- | --- | --- |
| Login | `POST /v1/auth/login` | `phone_number` (E.164), `password`, `device{platform, device_model}` | 200 `{access_token, refresh_token, user}` |
| Refresh | `POST /v1/auth/refresh` | `{refresh_token}` | 200 `{access_token, refresh_token}` (không có `user`) |
| Logout | `POST /v1/auth/logout` | `Authorization: Bearer <access>`, không body | 200 `{success:true}`; gọi lại vẫn 200 |

Hành vi BE đã xác nhận: đăng nhập lại cùng thiết bị thu hồi phiên cũ của thiết bị đó; dùng lại refresh token cũ bị coi là đánh cắp và BE thu hồi phiên. Không gửi IP/User-Agent riêng trong body (→ `VALIDATION_ERROR`).

## Phiên (cookie)

| Cookie | Nội dung | TTL | Thuộc tính |
| --- | --- | --- | --- |
| `il_token` | access token | 15 phút | httpOnly, sameSite=lax, secure (prod) |
| `il_refresh` | refresh token | 7 ngày | như trên |
| `il_name` | `dharma_name \|\| phone_number` | 7 ngày | như trên |

TTL mirror cấu hình dev của BE (BE không trả `expires_in`). `locals.user = {name}` đọc từ `il_name`; làm mới từ `GET /v1/users/me` ở trang chủ.

## Bảng lỗi → hành vi UI

| Code (HTTP) | Hành vi mong muốn | Hiện trạng code |
| --- | --- | --- |
| `INVALID_CREDENTIALS` (401) | "Số điện thoại hoặc mật khẩu chưa đúng." | ✓ |
| `LOGIN_LOCKED` (429) | Báo khoá theo `details.locked_until` | **Lệch**: chuỗi hard-code "15 phút", `locked_until` chưa dùng |
| `VALIDATION_ERROR` / `INVALID_PHONE` / `INVALID_PASSWORD` (400) | Lỗi ở ô tương ứng | Một dòng lỗi chung dưới ô mật khẩu |
| `INVALID_DEVICE` (400) | Thông báo chung + log | ✓ (generic) |
| `INVALID_API_KEY` (401), 413, 5xx | Thông báo chung; log server | ✓ |
| `NETWORK_ERROR` (FE, status 0) | "Không kết nối được máy chủ" | ✓ |

## Out of scope

- Đăng ký / OTP đăng ký → `../register/`.
- Quên mật khẩu (chưa có trang/API), đăng nhập bằng OTP SMS (chưa có API), đăng nhập bằng email.

## Pending (not yet implemented)

Theo dõi ở `tasks.md`:

- Ẩn/vô hiệu nút "Gửi mã một lần qua SMS" và link "Quên?" → hiện **hiển thị**, nút bấm không làm gì, link `/forgot-password` chưa có route (Phase 2).
- `auth_err_login_locked` theo `locked_until` (Phase 2).
- Hợp nhất `401 UNAUTHORIZED` → refresh một lần rồi thử lại; hiện chưa có chỗ nào làm việc này (Phase 2).
- Test unit/e2e (Phase 3).

> ⚠️ Not confirmed: sau đăng nhập thất bại, **mật khẩu hiện được giữ nguyên** trong ô (form dùng `update({reset:false})`) — spec cũ ghi "xoá mật khẩu". Giữ hay xoá? — chặn sửa `LoginForm.svelte`.

> ⚠️ Not confirmed: người đã đăng nhập mở `/login` hoặc `/signup` có bị redirect về `/` không (hiện route không có `load` kiểm tra phiên) — chặn thiết kế guard.

> ⚠️ Not confirmed: sau đăng nhập có quay lại trang người dùng định vào trước đó hay luôn về `/` (hiện luôn về `/`) — chặn thiết kế tham số redirect.

> ⚠️ Not confirmed: ngày có `API_KEY` production — BE xác nhận **chưa có**, điều kiện trả nợ TD-001 là secret manager + gỡ key dev khỏi git — chặn deploy, chờ BE.

## Open questions (resolved)

- ~~Refresh token vừa xoay có grace window không?~~ → Không; reuse revoke ngay phiên thiết bị. FE phải single-flight. Resolved 2026-10-10 (BE).
- ~~Có `expires_in` để bỏ TTL hard-code không?~~ → Có `data.expires_in` (access) và `exp` trong JWT; refresh chưa có giá trị trả về. Resolved 2026-10-10 (BE, chưa commit).
- ~~Còn mock login không?~~ → Không: `login/+page.server.ts` gọi `POST /v1/auth/login` thật. Mục "Mock login" và "Logged-in detection" trong `.assumptions.md` đã lỗi thời. Resolved 2026-10-10 (từ code).

## Bảo mật — đối chiếu FE↔BE (2026-10-10)

Nguồn: session `[BE]-InnerLamp` đã đọc code BE thật; mục "chưa chạy thử" ghi rõ. Contract BE: `docs/specs/api/openapi.yaml`, `docs/specs/features/login/` (v1.13) trong repo BE.

| Chủ đề | Xác nhận từ BE | Hệ quả cho FE |
| --- | --- | --- |
| Refresh race | **Không có grace window.** Dùng lại refresh token đời trước = revoke phiên của thiết bị + 401 `REFRESH_TOKEN_INVALID`. Request song song có thể làm user bị đăng xuất thật | FE phải single-flight; 401 từ refresh mà cookie đã được request khác đổi → thử lại với cookie hiện tại trước khi xoá |
| TTL | BE trả `data.expires_in` (giây, access token) ở login/verify-otp/refresh; JWT có `exp`. Refresh 7 ngày là sliding, chưa có trần tuyệt đối. Production TTL **chưa quyết định**. *(Mới làm, chưa commit, dev server cần restart)* | Bỏ TTL hard-code; dùng `expires_in` / `exp` |
| Thu hồi phiên | Theo **thiết bị** (user+device), chưa có "đăng xuất mọi thiết bị". Access token cũ **còn dùng được đến hết hạn** (≤15 phút) sau logout | Chấp nhận ở MVP; không coi logout là thu hồi tức thì |
| Fingerprint thiết bị | `SHA-256(platform\|os_version\|device_model\|User-Agent header của request tới BE)` | FE **phải forward User-Agent trình duyệt** khi gọi login; hai trình duyệt cùng UA + `device_model` của cùng user sẽ đá phiên nhau |
| API key | Chỉ server FE giữ; `platform="web"` bắt buộc đúng key. Production key + rotate (2 key) **chưa có**; caller bỏ header vẫn đi như mobile (TD-001) | Key chỉ chứng minh "là website", không đủ để chặn gọi thẳng BE |
| Rate limit | Chỉ theo tài khoản/SĐT (`LOGIN_LOCKED` 5 sai/15 phút dev). **Không có theo IP/thiết bị** cho request-otp, resend-otp, login, refresh; BE chỉ thấy IP server FE, không đọc `X-Forwarded-For` | FE cần captcha + rate limit ở server SvelteKit |
| Enumeration | Login luôn `INVALID_CREDENTIALS` (không lộ). Register `PHONE_TAKEN`/`EMAIL_TAKEN` là chủ ý (UX) | Quyết định sản phẩm nếu muốn đóng |
| `locked_until` | Luôn có ở `LOGIN_LOCKED`, `OTP_LOCKED`, `OTP_SEND_LIMITED`; RFC 3339 **có offset, không đảm bảo UTC**. `OTP_RESEND_TOO_SOON` chỉ có `retry_after_seconds` | Parse bằng `Date`, không giả định hậu tố `Z` |
| Mật khẩu | bcrypt cost 10; chỉ kiểm ≥ 8 byte; không có trần; >72 byte nhiều khả năng ra 500 *(chưa chạy thử)* | FE chặn ≤ 72 byte |
| CORS / CSRF | BE đang `Access-Control-Allow-Origin: *`, có thể khoá vì chỉ server FE gọi. BE dùng Bearer nên CSRF không áp dụng ở BE | CSRF là việc cookie FE: `SameSite=lax` + kiểm Origin của SvelteKit |

### Việc FE cần làm thêm (chi tiết trong `tasks.md` Phase 5)

1. Single-flight refresh + không xoá cookie vội khi 401.
2. Đọc `expires_in` / `exp` cho TTL cookie; không hard-code.
3. Forward `User-Agent` thật khi login.
4. Captcha (Turnstile) + rate limit theo IP/SĐT.
5. Chặn mật khẩu ≤ 72 byte; `dharma_name`/`ordination_place` ≤ 255 ký tự.
6. Parse `locked_until` RFC 3339; dùng `retry_after_seconds`.
7. `__Host-` cookie prefix ở prod, HSTS, CSP, Referrer-Policy.
8. Luồng 401 → refresh một lần → thử lại.

### Việc BE cần làm thêm (BE ghi nhận, chờ duyệt thứ tự)

1. OTP sinh bằng `crypto/rand`, chặn chạy production với getter/SMS dev — **blocker go-live** (hiện `generateOTP()` luôn trả `111111`).
2. Rate limit theo IP; đọc `X-Forwarded-For` chỉ khi có `X-API-Key` hợp lệ.
3. Grace window cho refresh vừa xoay, hoặc làm rõ chính sách.
4. Trần 72 byte mật khẩu (400 `INVALID_PASSWORD`), cân nhắc chính sách độ mạnh/blocklist.
5. Siết CORS.
6. Validate độ dài `dharma_name`/`ordination_place` (400 thay vì 500).
7. `locked_until` về UTC.
8. Production key + rotate, TTL production, trần tuyệt đối refresh, đăng xuất mọi thiết bị.
9. Commit phần `X-API-Key` và `expires_in`/`no-store`.
