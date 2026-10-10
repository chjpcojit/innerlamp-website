# Tasks — Đăng nhập (Login / Refresh / Logout)

Version: 1.1
Last updated: 2026-10-10
Status: in-progress — Phase 1 xong, Phase 2–4 còn lại

> See `changelog.md` in this folder for the version history of this spec.

`[x]` chỉ khi đã kiểm tra tồn tại trong code ngày 2026-10-10.

## Phase 1 — Luồng chính (đã làm)

- [x] Route `/login` + `AuthShell` + meta i18n
- [x] Action `default`: gọi `POST /v1/auth/login`, `device.platform="web"`, `startSession`, redirect 303
- [x] `LoginForm` + `PhoneField` (nút bị khoá tới khi phone hợp lệ + có mật khẩu)
- [x] Mã lỗi → chuỗi vi/en qua `authErrorMessage`
- [x] Hook `handleAuth`: refresh khi thiếu `il_token`; xoá phiên khi BE 4xx, giữ khi mạng/5xx
- [x] `setTokens` / `startSession` / `endSession` / `getSessionUser`
- [x] Logout (`/profile?/logout`): BE best-effort + xoá cookie
- [x] Gỡ code đăng nhập giả (login gọi API thật)

## Phase 2 — Còn lệch spec (pending)

- [ ] Ẩn hoặc vô hiệu nút "Gửi mã một lần qua SMS" và link "Quên?" cho đến khi BE có API
- [ ] `auth_err_login_locked` nhận tham số thời gian từ `details.locked_until` (bỏ "15 phút" hard-code); chuyển `locked_until` qua `authFail`
- [ ] Tô lỗi theo ô cho `VALIDATION_ERROR` / `INVALID_PHONE|PASSWORD`
- [ ] Quyết định giữ/xoá mật khẩu sau khi đăng nhập thất bại *(chờ ⚠️)*
- [ ] Guard người đã đăng nhập mở `/login`/`/signup` *(chờ ⚠️)*
- [ ] Quay lại trang trước sau đăng nhập *(chờ ⚠️)*
- [ ] Hợp nhất `401 UNAUTHORIZED` → refresh một lần rồi thử lại, refresh lỗi → `/login` (khi có route Bearer đầu tiên)
- [ ] Đọc `exp` của JWT cho TTL cookie; cập nhật `il_name` khi có `/me`

## Phase 3 — Test & kiểm chứng (pending)

- [ ] Unit: `session.ts` (cookie options, `startSession` tên hiển thị), hook refresh (4xx vs 5xx/mạng)
- [ ] E2E: đăng nhập đúng/sai MK, khoá, hết hạn access → tự refresh, refresh bị từ chối, đăng xuất
- [ ] `npm run check && npm run lint && npm run build` pass *(lint hiện fail do `Docs/`)*

## Phase 5 — Bảo mật (từ đối chiếu với BE 2026-10-10, pending)

- [ ] Single-flight refresh trong `handleAuth` (gộp refresh đồng thời cùng token); 401 mà cookie vừa được request khác đổi → thử lại với cookie hiện tại, chỉ xoá khi vẫn 401
- [ ] TTL cookie từ `expires_in` / `exp` JWT thay `ACCESS_MAX_AGE`; thêm `expires_in` vào `AuthSession`/`AuthTokens`
- [ ] Forward `User-Agent` trình duyệt khi gọi login (hiện `device_model` lấy từ UA nhưng header gửi tới BE là của server FE)
- [ ] Captcha (Turnstile) + rate limit theo IP/SĐT cho login
- [ ] Parse `locked_until` RFC 3339 (có offset), hiển thị mốc giờ
- [ ] `__Host-` cookie prefix ở prod; HSTS, CSP, Referrer-Policy trong `hooks.server.ts`
- [ ] Luồng 401 → refresh một lần → thử lại (gộp với mục Phase 2)
- [ ] Chờ BE: grace window refresh, rate limit theo IP, siết CORS, trần mật khẩu, production `API_KEY` + rotate, TTL production

## Phase 4 — Tài liệu & vận hành

- [ ] Cập nhật `.assumptions.md`: bỏ mục "Mock login" và sửa "Logged-in detection"
- [ ] Xin `API_KEY` production từ BE (lưu ý TD-001)
