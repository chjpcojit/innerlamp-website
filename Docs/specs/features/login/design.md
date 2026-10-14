# Design — Đăng nhập (Login / Refresh / Logout)

Version: 1.1
Last updated: 2026-10-10
Status: in-progress — mirror `requirements.md`

> See `changelog.md` in this folder for the version history of this spec.

## Overview

Cùng kiến trúc với Register: browser post form tới form action, server gọi BE qua `$lib/server/api/auth.ts`. Phiên nằm trong cookie httpOnly; `hooks.server.ts` (`handleAuth`) tự làm mới access token từ refresh token và gán `locals.user`. Token không bao giờ đi xuống browser JS. Chuỗi UI: `login_*`, `auth_err_*`, `pf_logout`.

## Layers & components

| Layer | File | Responsibility | Trạng thái |
| --- | --- | --- | --- |
| Route (UI) | `src/routes/(auth)/login/+page.svelte` | Meta + `AuthShell` + `LoginForm` | có |
| Route (server) | `src/routes/(auth)/login/+page.server.ts` | Action `default`: login, `startSession`, redirect 303 | có |
| Feature UI | `src/lib/features/auth/components/LoginForm.svelte` | Form phone + password, link signup/guest | có |
| Feature UI | `.../components/PhoneField.svelte` | Dùng chung với Register | có |
| API resource | `src/lib/server/api/auth.ts` | `login`, `refreshTokens`, `logout` | có |
| Server auth | `src/lib/server/auth/session.ts` | `setTokens`, `startSession`, `endSession`, `getSessionUser`, tên cookie/TTL | có |
| Server auth | `src/lib/server/auth/action.ts` (`authFail`) | `ApiError` → `fail()` | có |
| Hook | `src/hooks.server.ts` (`handleAuth`) | Refresh khi thiếu `il_token`; gán `locals.user` | có |
| Logout | `src/routes/(site)/profile/+page.server.ts` (`?/logout`) | Gọi BE logout best-effort, `endSession`, redirect | có |
| Logout UI | `src/lib/components/sections/ProfileHeader.svelte` | Form POST `?/logout` | có |
| Types | `src/lib/types/auth.ts`, `types/user.ts` | `LoginRequest`, `AuthSession`, `SessionUser` | có |
| Forgot password | route `/forgot-password` | — | **chưa tạo** (BE chưa có API) |
| OTP login | action + API | — | **chưa tạo** (BE chưa có API) |
| 401 refresh-and-retry | `server/api/client.ts` | Refresh một lần rồi thử lại request Bearer | **chưa tạo** |

## Navigation flow

```
/login
  ├─ submit ✓ ──▶ startSession ──▶ 303 localizeHref('/')
  ├─ "Tạo tài khoản" ──▶ /signup
  ├─ "Vào xem trước" ──▶ /
  ├─ "Quên?" ──▶ /forgot-password   (route chưa tồn tại)
  └─ "Gửi mã một lần qua SMS"      (nút chưa có hành vi)

/profile ── ?/logout ──▶ BE logout (best effort) ──▶ endSession ──▶ 303 /
```

## Step-by-step Flow — Vòng đời phiên

```
Step 1 — Đăng nhập (this feature)
- Trigger: bấm "Đăng nhập", phone hợp lệ + password không rỗng
- Pre-condition: server kiểm lại phone/password không rỗng (VALIDATION_ERROR 400 nếu thiếu)
- API: POST /v1/auth/login (phone_number E.164, password, device{platform:"web", device_model})
    - Success (200 {access_token, refresh_token, user}) → startSession (3 cookie), 303 về `/`
    - Failure (INVALID_CREDENTIALS 401) → fail, ở /login, một thông báo chung
    - Failure (LOGIN_LOCKED 429) → fail, thông báo khoá
    - Failure (INVALID_API_KEY / 5xx / NETWORK_ERROR) → fail, thông báo chung

Step 2 — Làm mới phiên (hook, mỗi request)
- Trigger: request tới server khi `il_token` hết hạn (cookie mất) và `il_refresh` còn
- Pre-condition: có `il_refresh`
- API: POST /v1/auth/refresh ({refresh_token}) — token xoay vòng, luôn lưu cặp mới
    - Success → setTokens (access 15 phút, refresh 7 ngày), tiếp tục request
    - Failure (4xx, vd REFRESH_TOKEN_INVALID) → endSession (xoá 3 cookie), thành khách
    - Failure (status 0 / 5xx) → giữ cookie, thử lại ở request sau

Step 3 — Đăng xuất (this feature, action ở /profile)
- Trigger: bấm "Đăng xuất"
- Pre-condition: không bắt buộc; nếu có `il_token` mới gọi BE
- API: POST /v1/auth/logout (Bearer il_token) — gọi lại vẫn 200
    - Success hoặc Failure → như nhau với người dùng: endSession, 303 về `/`
```

## Quyết định thiết kế đã xác nhận

- Chỉ lỗi 4xx từ BE mới xoá phiên ở hook; sự cố mạng/5xx không đăng xuất người dùng.
- `il_name` ghi lúc đăng nhập/đăng ký và được làm mới từ `GET /v1/users/me` khi vào trang chủ.
- Phân biệt hai credential: `API_KEY` (website, header `x-api-key`) và user token (`Authorization: Bearer`) — xem `AGENTS.md`.

## Chưa làm

- `authFail` chỉ forward `error` và `retry_after_seconds`; `details.locked_until` chưa tới UI.
- Chưa có route nào dùng Bearer ngoài logout nên cơ chế "401 → refresh một lần → thử lại" chưa được hiện thực; làm khi route Bearer đầu tiên xuất hiện (`/memorial*` hiện dùng localStorage).

## Bảo mật phiên (đối chiếu với BE 2026-10-10)

- Thu hồi theo thiết bị; access token cũ còn dùng được tới hết hạn sau logout (≤ 15 phút) — chấp nhận ở MVP.
- Step 2 (refresh) có điểm yếu race: BE không có grace window, reuse revoke ngay. Thiết kế mục tiêu: single-flight theo refresh token trong server; khi 401, đọc lại cookie hiện tại trước khi xoá phiên. Nhiều instance vẫn có thể đăng xuất hiếm gặp cho tới khi BE có grace window.
- Step 1 (login): fingerprint BE tính từ `User-Agent` header của request tới BE → FE phải forward UA thật của trình duyệt (hiện chưa).
- TTL cookie lấy từ `expires_in` / `exp` thay vì hằng số trong `session.ts` (hiện hard-code 15 phút / 7 ngày).
