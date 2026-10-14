# Tasks — onboarding (Đăng ký trên website)

Version: 1.0
Last updated: 2026-10-14
Status: in-progress (drift) — mirror `requirements.md`.

> See `changelog.md` in this folder for the version history of this spec.

`[x]` = đã kiểm trong code ngày 2026-10-14. Mọi việc chuyển sang email là `[ ]`.

## Phase 1 — Logic thuần + vector

- [ ] `features/auth/validation.ts`: `checkPhone`, `checkEmail`, `checkPassword` (ký tự sau NFC, 8–64), `checkNames` (AC3, AC4).
- [ ] `features/auth/data.ts`: `COUNTRIES` đúng 12 nước + số chữ số của BR-ONB-04 (bỏ CN, thêm MY).
- [ ] Script `scripts/sync-onboarding-vectors.*` chép `docs/product/onboarding/rules/*.json` từ innerlamp-be (mặc định `../innerlamp-be`) vào `tests/vectors/onboarding/` kèm commit nguồn; test đọc bản pin, không sửa tay (cùng cách sổ giỗ).
- [ ] `validation.spec.ts` chạy bốn file vector (AC19).

## Phase 2 — Server

- [ ] `types/auth.ts`, `types/temple.ts` theo contract mới (`address` tuỳ chọn).
- [ ] `server/api/auth.ts`: `requestRegisterOtp`, `resendRegisterOtp(email)` → `register/resend-otp`, `verifyRegisterOtp(email, code)`.
- [ ] `signup/+page.server.ts`: `load` chặn người có phiên (AC2); ba action theo Step 1–4; echo các ô trừ mật khẩu; `PENDING_REGISTRATION_EXPIRED` về bước 1 (AC13); đề xuất chùa không bắt buộc `address` (AC14).
- [x] Không đưa mật khẩu vào payload trả về (`request` chỉ trả `phone`, `resendAfter`, `expiresIn`, `suggestion`) — giữ khi sửa (AC18).
- [x] Đề xuất chùa gửi sau khi tài khoản tạo xong, lỗi không làm hỏng đăng ký (`verify`) — giữ (AC14).

## Phase 3 — UI

- [ ] `SignupForm.svelte`: họ tên ≥ 1 ký tự; pháp danh rỗng mặc định; mật khẩu theo ký tự; lỗi theo ô (`fieldOf`) (AC4, AC9).
- [ ] `PhoneField.svelte` / `CountryPicker.svelte`: kiểm theo nước, gửi `phone_country` + số đã gõ (AC3).
- [ ] `SignupOtp.svelte`: hiển thị email; "Đổi email"; khoá ô tới `locked_until` khi `OTP_LOCKED`; nhấn mạnh gửi lại khi hết hạn; hiển thị giờ mở khoá theo giờ địa phương (AC11, AC12, AC16).
- [x] Hai đồng hồ thời hạn / gửi lại lấy từ response, đặt lại sau khi gửi lại, `retry_after_seconds` khi `OTP_RESEND_TOO_SOON` (`SignupOtp.svelte`) — giữ (AC11).
- [ ] `AddTempleForm.svelte`: địa chỉ đường tuỳ chọn (AC14).
- [ ] `errors.ts`: thêm `RATE_LIMITED`, `EMAIL_SEND_FAILED`; bỏ `EMAIL_TAKEN`; `fieldOf(code)` (bảng Error → UI).
- [ ] i18n theo bảng ở `design.md` (vi + en cùng key).

## Phase 4 — Test

- [ ] `tests/signup.e2e.ts`: đăng ký bằng email với backend dev (mã dev), email đã có tài khoản trông như email mới, SĐT trùng, đổi email giữ ô, hết hạn về bước 1.

## Phase 5 — Chất lượng + tài liệu

- [ ] `npm run check && npm run lint && npm run build` sạch.
- [ ] Cập nhật cột Website ở product §4.2 khi xong (báo `ba-writer`).
- [ ] Xoá `Docs/specs/features/register/` ở bước dọn tài liệu cũ.
