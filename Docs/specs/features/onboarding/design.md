# Design — onboarding (Đăng ký trên website)

Version: 1.0
Last updated: 2026-10-14
Status: in-progress (drift) — mirror `requirements.md`.

> See `changelog.md` in this folder for the version history of this spec.

## Overview

Giữ kiến trúc của `/signup` hiện tại: một trang, hai bước trong cùng `+page.svelte`, ba form action
(`request`, `resend`, `verify`) gọi backend qua `$lib/server/api/auth.ts`; cookie phiên do
`$lib/server/auth/session.ts` đặt (như `../login/`). Thay đổi chính: định danh của lượt đăng ký là
**email** (thay SĐT), số điện thoại gửi dạng `phone_country` + số đã gõ, luật kiểm đổi theo product
v1.2, đề xuất chùa không bắt buộc địa chỉ đường, thêm `load` chặn người đã đăng nhập.

## Layers & components

| Layer | File | Responsibility | Trạng thái |
| --- | --- | --- | --- |
| Route (UI) | `src/routes/(auth)/signup/+page.svelte` | `<svelte:head>`, render `SignupForm` | có, không đổi |
| Route (server) | `src/routes/(auth)/signup/+page.server.ts` | `load`: có phiên → 303 `/`. Actions `request` / `resend` / `verify` theo email; echo các ô (trừ mật khẩu) về form khi lỗi; gửi đề xuất chùa sau `verify` | cần sửa |
| Feature UI | `src/lib/features/auth/components/SignupForm.svelte` | Ô họ tên (bắt buộc, ≥ 1 ký tự), pháp danh (tuỳ chọn, rỗng mặc định), email, mật khẩu (8–64 ký tự), lỗi theo ô | cần sửa |
| Feature UI | `src/lib/features/auth/components/PhoneField.svelte`, `CountryPicker.svelte` | Chọn nước từ bảng 12 nước; kiểm số theo nước; gửi `phone_country` + số đã gõ | cần sửa |
| Feature UI | `src/lib/features/auth/components/SignupOtp.svelte` | Hiển thị email; hai đồng hồ theo response; "Đổi email"; khoá ô khi `OTP_LOCKED`; nhấn mạnh gửi lại khi hết hạn | cần sửa |
| Feature UI | `src/lib/features/auth/components/AddTempleForm.svelte` | Tỉnh, phường bắt buộc từ danh sách; địa chỉ đường tuỳ chọn | cần sửa |
| Feature logic | `src/lib/features/auth/data.ts` | `COUNTRIES` = 12 nước của BR-ONB-04 kèm số chữ số (bỏ Trung Quốc, thêm Malaysia) | cần sửa |
| Feature logic | `src/lib/features/auth/validation.ts` | Hàm thuần `checkPhone(country, typed)`, `checkEmail`, `checkPassword` (đếm ký tự sau NFC), `checkNames` — dùng ở UI và test vector | chưa tạo |
| Feature logic | `src/lib/features/auth/errors.ts` | Map mã lỗi → key; mã → ô (`fieldOf(code)`); thêm `RATE_LIMITED`, `EMAIL_SEND_FAILED`; bỏ `EMAIL_TAKEN` | cần sửa |
| API resource | `src/lib/server/api/auth.ts` | `requestRegisterOtp(body)`, `resendRegisterOtp(email)` → `register/resend-otp`, `verifyRegisterOtp(email, code)` | cần sửa |
| Types | `src/lib/types/auth.ts` | `RegisterRequest` có `email`, `phone_country`, `phone_number` (đã gõ) | cần sửa |
| Types | `src/lib/types/temple.ts` | `TempleSuggestionRequest.address` tuỳ chọn | cần sửa |
| i18n | `messages/vi.json`, `messages/en.json` | `signup_otp_subtitle` nói email; `signup_otp_change_email` thay `signup_otp_change_phone`; `signup_email_note` bỏ "biên nhận cúng dường"; `auth_err_rate_limited`; bỏ `auth_err_email_taken`, `country_cn`; thêm `country_my` | cần sửa |
| Tests | `src/lib/features/auth/validation.spec.ts`, `tests/signup.e2e.ts` | Vector product (AC19); E2E hai bước với backend dev (mã dev) | chưa tạo |

## Route & navigation flow

```
/signup  (load: có phiên → 303 /)
  ├─ ?/request ✓ ──▶ bước mã (cùng trang)
  │    ├─ ?/resend ✓ ──▶ đặt lại hai đồng hồ
  │    ├─ ?/verify ✓ ──▶ cookie phiên ──▶ (đề xuất chùa) ──▶ 303 localizeHref('/')
  │    ├─ "Đổi email" ──▶ bước 1, giữ mọi ô
  │    └─ PENDING_REGISTRATION_EXPIRED ──▶ bước 1, giữ mọi ô
  └─ link "đã có tài khoản" ──▶ /login
```

## Step-by-step Flow — Đăng ký

```
Step 1 — Gửi form (this feature)
- Trigger: người dùng gửi form bước 1 hợp lệ.
- Pre-condition: không có phiên (load đã chặn).
- Where: `+page.server.ts` action `request`.
- API: POST /v1/auth/register/request-otp {email, password, phone_country, phone_number, full_name, dharma_name?, ordination_temple_id?}
    - Success → trả {step:'otp', email, expiresIn, resendAfter, fields (không mật khẩu), suggestion?}
    - Failure → fail(status, {error, field, retryAfter?, lockedUntil?, fields}) — ở lại bước 1.

Step 2 — Gửi lại (tuỳ chọn, lặp được)
- Where: action `resend`. API: POST /v1/auth/register/resend-otp {email}
    - Success → đồng hồ mới. Failure PENDING_REGISTRATION_EXPIRED → về bước 1 (Step 1 fields); khác → ở lại bước mã.

Step 3 — Xác nhận mã (this feature)
- Where: action `verify`. API: POST /v1/auth/register/verify-otp {email, otp_code}
    - Success → startSession(cookies, session) (login design) → Step 4.
    - Failure → fail(..., {step:'otp', ...}); PENDING_REGISTRATION_EXPIRED → về bước 1.

Step 4 — Đề xuất chùa (best effort, chỉ khi có)
- API: POST /v1/temple-suggestions {name, province_code, ward_code, address?}
    - Mọi kết quả → 303 localizeHref('/'). Lỗi chỉ log.
```

Mật khẩu chỉ đi trong Step 1; các ô khác (trừ mật khẩu) được echo qua kết quả action để giữ form khi
quay về bước 1. Ở bước 1 sau khi quay lại, ô mật khẩu còn giá trị vì state của component không bị huỷ
(cùng trang); tải lại trang thì mất (AC15).

## Session & cookies

Dùng `startSession` của `../login/design.md` (cookie `il_token`, `il_refresh`, `il_name`).

## Deliberately stubbed for now

- Backend chưa chạy contract mới (backend onboarding v8.0 `tasks.md`): website build xong trước sẽ chỉ
  test được với backend sau khi backend làm xong; E2E (Phase 4) chạy sau đó.
