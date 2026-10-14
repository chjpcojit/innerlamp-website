# Design — login (Đăng nhập, phiên, quên mật khẩu)

Version: 2.0
Last updated: 2026-10-14
Status: in-progress (drift) — mirror `requirements.md`.

> See `changelog.md` in this folder for the version history of this spec.

## Overview

Cùng kiến trúc như v1.1: form action gọi backend qua `$lib/server/api/auth.ts`, phiên trong cookie
httpOnly, `hooks.server.ts` làm mới token và gán `locals.user`. v2.0: đăng nhập bằng email; trang mới
`/forgot-password` (hai bước trong một trang, như `/signup`); một nơi xử lý "phiên hết" (hook + client
API) đưa người dùng về `/login` kèm thông báo; tham số `redirect` để quay lại trang định vào; chuyển tiếp
IP và User-Agent của khách tới backend.

## Layers & components

| Layer | File | Responsibility | Trạng thái |
| --- | --- | --- | --- |
| Route (server) | `src/routes/(auth)/login/+page.server.ts` | `load`: có phiên → 303 `/`; đọc `reason`, `redirect`. Action `default`: login bằng email, `startSession`, 303 tới `safeRedirect` | cần sửa |
| Feature UI | `src/lib/features/auth/components/LoginForm.svelte` | Ô email (thay `PhoneField`), mật khẩu; bỏ nút mã SMS; hiển thị `login_session_ended` / `login_password_changed`; xoá mật khẩu sau lỗi | cần sửa |
| Route (server) | `src/routes/(auth)/forgot-password/+page.server.ts` | `load`: có phiên → `/`. Actions `request` (gọi lại = gửi lại), `confirm` | chưa tạo |
| Route (UI) | `src/routes/(auth)/forgot-password/+page.svelte` | `AuthShell` + `ForgotPasswordForm` | chưa tạo |
| Feature UI | `src/lib/features/auth/components/ForgotPasswordForm.svelte` | Bước email → bước mã + mật khẩu mới; dùng lại đồng hồ của `SignupOtp` (tách thành `OtpTimers.svelte`) | chưa tạo |
| Feature logic | `src/lib/features/auth/redirect.ts` | `safeRedirect(raw): string \| null` — chỉ đường dẫn tương đối cùng site (AC6) | chưa tạo |
| API resource | `src/lib/server/api/auth.ts` | `login({email,…})`, `requestPasswordReset(email)`, `confirmPasswordReset(body)` | cần sửa |
| API client | `src/lib/server/api/client.ts` | Header `X-InnerLamp-Client-IP` (IP khách) + `User-Agent` (AC19); `apiAuthed(event, path, opts)`: `401` → refresh một lần → thử lại → vẫn `401` thì `sessionEnded(event)` (AC8) | cần sửa |
| Server auth | `src/lib/server/auth/session.ts` | `startSession` đặt `il_name = dharma_name \|\| full_name`; `sessionEnded(event)`: `endSession` + `redirect(303, /login?reason=session_ended&redirect=…)` khi là điều hướng GET | cần sửa |
| Server auth | `src/lib/server/auth/refresh.ts` | Single-flight: `Map<refreshToken, Promise<AuthTokens>>` trong process, xoá sau khi xong (AC7) | chưa tạo |
| Hook | `src/hooks.server.ts` (`handleAuth`) | Dùng `refresh.ts`; refresh bị từ chối → `sessionEnded` (AC9); lưu `event.locals.clientIp` | cần sửa |
| Logout | `src/routes/(site)/profile/+page.server.ts`, `ProfileHeader.svelte` | Hỏi xác nhận, best effort, xoá cookie, `/` | có, không đổi |
| Guest prompt | các trang cần tài khoản (`memorial`, `profile`, …) | Link mời đăng nhập thêm `?redirect=<path>` (AC17) | cần sửa |
| Types | `src/lib/types/auth.ts` | `LoginRequest.email`; `PasswordResetRequest`, `PasswordResetConfirm` | cần sửa |
| i18n | `messages/vi.json`, `messages/en.json` | `login_email_*`, `login_session_ended`, `login_password_changed`, `forgot_*`, `auth_err_rate_limited`; sửa `auth_err_invalid_credentials`, `auth_err_login_locked({time})`; bỏ `login_otp_sms` và các key SĐT của login | cần sửa |
| Tests | `redirect.spec.ts`, `refresh.spec.ts`, `tests/login.e2e.ts`, `tests/forgot-password.e2e.ts` | Theo `il-testing` | chưa tạo |

## Route & navigation flow

```
/login  (load: có phiên → 303 /)
  ├─ submit ✓ ──▶ startSession ──▶ 303 safeRedirect(redirect) ?? localizeHref('/')
  ├─ "Quên mật khẩu?" ──▶ /forgot-password
  ├─ "Tạo tài khoản" ──▶ /signup
  └─ "Vào xem trước" ──▶ /

/forgot-password  (load: có phiên → 303 /)
  ├─ ?/request ✓ ──▶ bước mã + mật khẩu mới (cùng trang); gọi lại = gửi lại
  └─ ?/confirm ✓ ──▶ 303 /login?reason=password_changed

bất kỳ trang (GET) khi phiên hết ──▶ 303 /login?reason=session_ended&redirect=<trang>
```

## Step-by-step Flow — Làm mới phiên và phiên hết

```
Step 1 — Hook (mọi request)
- Trigger: không có il_token, có il_refresh.
- Where: hooks.server.ts handleAuth → refresh.ts (single-flight theo refresh token).
- API: POST /v1/auth/refresh
    - Success → setTokens (TTL từ expires_in) → tiếp tục.
    - Failure 4xx → Step 3.
    - Failure mạng / 5xx → giữ cookie, tiếp tục như khách cho request này.

Step 2 — Call Bearer trong load/action
- Where: client.ts apiAuthed.
- API: call gốc → 401 → POST /v1/auth/refresh (single-flight) → gọi lại call gốc một lần
    - Lần hai thành công → trả dữ liệu.
    - Refresh 4xx hoặc lần hai vẫn 401 → Step 3.

Step 3 — Phiên hết
- endSession(cookies); nếu là điều hướng GET → 303 /login?reason=session_ended&redirect=<url hiện tại>;
  nếu là action (POST) → fail(401, {error:'SESSION_ENDED'}) và form hiển thị link đăng nhập.
```

## Step-by-step Flow — Quên mật khẩu

```
Step 1 — Xin mã
- Where: forgot-password action `request`.
- API: POST /v1/auth/password-reset/request-otp {email}
    - Success → {step:'reset', email, expiresIn, resendAfter} (luôn cùng thông điệp forgot_sent).
    - Failure 400/429 → ở lại, báo theo bảng lỗi.

Step 2 — Gửi lại (lặp được) — gọi lại Step 1 sau resendAfter.

Step 3 — Đặt mật khẩu mới
- Where: action `confirm`. Kiểm mật khẩu mới bằng checkPassword (onboarding validation.ts) trước khi gọi.
- API: POST /v1/auth/password-reset/confirm {email, otp_code, new_password}
    - Success → nếu trình duyệt này đang có phiên thì endSession → 303 /login?reason=password_changed.
    - Failure → ở lại bước mã, báo lỗi; mật khẩu mới không echo về trang.
```

## Session & cookies

| Cookie | Nội dung | TTL | Thuộc tính |
| --- | --- | --- | --- |
| `il_token` | access token | `expires_in` (fallback 15 phút) | httpOnly, `SameSite=Lax`, `Secure` ở prod |
| `il_refresh` | refresh token | 7 ngày | như trên |
| `il_name` | `dharma_name \|\| full_name` | 7 ngày | như trên |

Thông báo `session_ended` / `password_changed` đi qua query `reason` của `/login` (chỉ nhận hai giá trị
đó), không cần cookie flash.

## Header gửi backend

`client.ts` gửi trên mọi call: `x-api-key`; `X-InnerLamp-Client-IP: <event.getClientAddress()>` (đặt mới mỗi call, không chép header từ browser);
`User-Agent` của trình duyệt (login dùng làm fingerprint thiết bị). Backend chỉ tin IP chuyển tiếp khi
`x-api-key` hợp lệ (backend login v2.2 AC34).

## Deliberately stubbed for now

- Login theo email và `password-reset/*` chỉ chạy được sau khi backend làm xong (backend login v2.1
  `tasks.md`). E2E Phase 5 chạy sau đó.
