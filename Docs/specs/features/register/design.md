# Design — Đăng ký (Register)

Version: 1.1
Last updated: 2026-10-10
Status: in-progress — mirror `requirements.md`

> See `changelog.md` in this folder for the version history of this spec.

## Overview

SvelteKit 2 + Svelte 5 runes. Browser chỉ post form tới **form actions** của `/signup`; server gọi BE qua `$lib/server/api/auth.ts` (`event.fetch`, header `x-api-key`). Không có thành phần nào của luồng này chạy ở browser gọi BE trực tiếp. Mọi chuỗi UI nằm trong `messages/{vi,en}.json` (`signup_*`, `phone_*`, `country_*`, `temple_*`, `dharma_name_*`, `auth_err_*`).

## Layers & components

| Layer | File | Responsibility | Trạng thái |
| --- | --- | --- | --- |
| Route (UI) | `src/routes/(auth)/signup/+page.svelte` | Meta + `AuthShell` + `SignupForm` | có |
| Route (server) | `src/routes/(auth)/signup/+page.server.ts` | Actions `request` / `resend` / `verify`; redirect 303 sau verify | có |
| Feature UI | `src/lib/features/auth/components/SignupForm.svelte` | Form bước 1, validate phía FE, chuyển bước 1↔2 | có |
| Feature UI | `.../components/SignupOtp.svelte` | Bước 2: nhập mã, đếm ngược gửi lại, "Đổi số" | có |
| Feature UI | `.../components/PhoneField.svelte`, `CountryPicker.svelte` | Chọn nước, chuẩn hoá số → E.164 | có |
| Feature data | `.../auth/data.ts` | `COUNTRIES` (12), `TEMPLES` (6), `DHARMA_NAMES` (10) | có |
| Feature errors | `.../auth/errors.ts` | `authErrorMessage(code)` → chuỗi i18n | có |
| Utils | `src/lib/utils/phone.ts`, `password.ts` | `normalizePhone`, `formatPhone`, `passwordScore` | có |
| API client | `src/lib/server/api/client.ts` | `apiCall`: envelope, timeout 8s, `ApiError(status, code, details)` | có |
| API resource | `src/lib/server/api/auth.ts` | `requestRegisterOtp`, `resendRegisterOtp`, `verifyRegisterOtp` | có |
| Server auth | `src/lib/server/auth/action.ts` (`authFail`) | `ApiError` → `fail(status, {error, retryAfter})` | có |
| Server auth | `src/lib/server/auth/session.ts` (`startSession`) | Ghi 3 cookie phiên | có |
| Types | `src/lib/types/auth.ts` | `RegisterRequest`, `OtpChallenge`, `AuthSession`… | có |
| Layout | `src/lib/components/layout/AuthShell.svelte` | Khung trang auth | có |
| Per-field errors | `SignupForm.svelte` + `authFail` (forward `details`) | Tô lỗi theo ô | **chưa tạo** |

## Navigation flow

```
/signup (bước 1: form)
  ├─ ?/request ✓ ──▶ bước 2 (OTP) — cùng route, state từ `form.step === 'otp'`
  │                    ├─ ?/resend  ──▶ ở lại bước 2, đếm ngược mới
  │                    ├─ "Đổi số điện thoại" ──▶ bước 1 (client state `backed`)
  │                    └─ ?/verify ✓ ──▶ startSession ──▶ 303 localizeHref('/')
  └─ "Đã có tài khoản" ──▶ /login
```

## Step-by-step Flow — Đăng ký đầy đủ

```
Step 1 — Gửi form & yêu cầu OTP (action ?/request)
- Trigger: bấm "Gửi mã xác thực" khi canSubmit = true
- Pre-condition: phone/email/password không rỗng (server kiểm lại → VALIDATION_ERROR 400);
  FE đã kiểm định dạng phone/email/password ≥ 8 byte
- API: POST /v1/auth/register/request-otp
  (phone_number E.164, email, password, dharma_name?, ordination_place?)
  Confirmed (BE): gọi lại cùng số khi chưa xác minh không lỗi, bản chờ cũ bị ghi đè;
  bản chờ hết hạn sau 24h.
    - Success (200 {expires_in_seconds, resend_after_seconds}) → trả {step:'otp', phone, resendAfter}, sang Step 2
    - Failure (PHONE_TAKEN 409 / EMAIL_TAKEN 409 / INVALID_* 400 / VALIDATION_ERROR 400) → fail, ở bước 1, hiện lỗi
    - Failure (OTP_SEND_LIMITED 429 / SMS_SEND_FAILED / 5xx / NETWORK_ERROR) → fail, ở bước 1, thông báo chung hoặc theo mã

Step 2 — Nhập OTP & gửi lại (action ?/verify, ?/resend)
- Trigger: hiển thị SignupOtp
- Pre-condition: có `phone` trong form result; mã 6 số (server kiểm `^\d{6}$`)
- API (verify): POST /v1/auth/register/verify-otp (phone_number, otp_code string)
    - Success (201 {access_token, refresh_token, user}) → Step 3
    - Failure (OTP_INVALID / OTP_EXPIRED 400) → fail {step:'otp'}, ở bước 2, cho nhập lại / gửi lại
    - Failure (OTP_LOCKED 429) → fail {step:'otp'}, hiện thông báo (khoá ô nhập: chưa làm)
    - Failure (PENDING_REGISTRATION_EXPIRED 400) → hiện: ở bước 2 với thông báo; mong muốn: về Step 1
- API (resend): POST /v1/auth/resend-otp (phone_number, purpose: "register")
  Confirmed: 200 như request-otp kèm `resend_remaining`.
    - Success → đặt lại đếm ngược
    - Failure (OTP_RESEND_TOO_SOON 429) → đếm ngược theo `retry_after_seconds`
    - Failure (OTP_SEND_LIMITED 429) → thông báo thử lại sau

Step 3 — Lưu phiên & chuyển trang (this feature, boundary)
- Trigger: verify thành công
- Effect: `startSession` ghi cookie `il_token` (access, 15 phút), `il_refresh` (7 ngày),
  `il_name` (7 ngày, `dharma_name || phone_number`) — httpOnly, sameSite=lax, secure ở prod;
  rồi `redirect(303, localizeHref('/'))`. Từ đây việc làm mới phiên thuộc `../login/` (hook).
```

## Quyết định thiết kế đã xác nhận

- Tài khoản chỉ được tạo ở `verify-otp`; `request-otp` chỉ tạo bản chờ. Không gọi `login` sau đăng ký.
- Số điện thoại ghép E.164 **ở FE** (PhoneField); `resend`/`verify` dùng đúng giá trị E.164 đã gửi ở bước 1 nên không có sai lệch `0901…` vs `+84901…`.
- Không lưu trạng thái OTP phía client (reload → về bước 1).
- TTL cookie hiện mirror cấu hình dev của BE vì BE không trả `expires_in`.

## Deliberately stubbed / chưa làm

- Lỗi theo ô: `authFail` chỉ chuyển `error` và `retry_after_seconds`; `details` (field→rule, `locked_until`) chưa được chuyển lên UI → xem `tasks.md` Phase 2.

## Ràng buộc đầu vào & bảo mật (đối chiếu với BE 2026-10-10)

- Step 1 phải chặn ở FE trước khi gọi BE: `password` ≤ 72 byte, `dharma_name`/`ordination_place` ≤ 255 ký tự (BE hiện trả 500).
- `request` và `resend` cần captcha + rate limit theo IP/SĐT ở server SvelteKit vì BE chưa có (rủi ro SMS pumping).
- Step 3: TTL cookie lấy từ `expires_in` của `verify-otp` (cùng cơ chế với login).
- Dev OTP `111111` còn nguyên phía BE → không go-live cho tới khi BE sinh OTP thật.
