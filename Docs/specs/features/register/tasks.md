# Tasks — Đăng ký (Register)

Version: 1.1
Last updated: 2026-10-10
Status: in-progress — Phase 1 xong, Phase 2–3 còn lại

> See `changelog.md` in this folder for the version history of this spec.

`[x]` chỉ khi đã kiểm tra tồn tại trong code ngày 2026-10-10.

## Phase 1 — Luồng chính (đã làm)

- [x] Route `/signup` + `AuthShell` + meta i18n (`+page.svelte`)
- [x] Actions `request` / `resend` / `verify` (`+page.server.ts`)
- [x] `SignupForm`: validate FE phone/email/password(byte)/đồng ý, thanh độ mạnh, gợi ý pháp danh, chọn chùa
- [x] `SignupOtp`: nhập 6 số, đếm ngược gửi lại, `retryAfter`, "Đổi số điện thoại"
- [x] `PhoneField` + `CountryPicker` + `utils/phone.ts` (E.164 ghép ở FE)
- [x] API layer `server/api/auth.ts` + `client.ts` (`ApiError`, timeout 8s)
- [x] `authFail` + `errors.ts` ánh xạ mã lỗi → chuỗi vi/en
- [x] `startSession` ghi 3 cookie httpOnly; redirect 303 về `/`
- [x] Mật khẩu không nằm trong payload trả về page

## Phase 2 — Xử lý lỗi cho đúng spec (pending)

- [ ] Chuyển `details` từ `ApiError` qua `authFail` (field→rule, `locked_until`)
- [ ] Tô lỗi theo ô cho `VALIDATION_ERROR` / `INVALID_PHONE|EMAIL|PASSWORD` / `EMAIL_TAKEN`
- [ ] `PENDING_REGISTRATION_EXPIRED` → quay về bước 1 *(chờ trả lời ⚠️ tự điền lại số)*
- [ ] `OTP_LOCKED` → khoá ô OTP đến `locked_until`; `OTP_SEND_LIMITED` hiển thị mốc giờ
- [ ] `OTP_EXPIRED` → nhấn mạnh nút "Gửi lại mã"
- [ ] `PHONE_TAKEN` → link `/login` ngay trong thông báo lỗi
- [ ] Quyết định giữ/xoá mật khẩu khi "Đổi số điện thoại" *(chờ ⚠️)*

## Phase 3 — Test & kiểm chứng (pending)

- [ ] Unit: `authErrorMessage`, `normalizePhone`, `passwordScore`
- [ ] E2E: đăng ký với OTP dev `111111`; resend; `PHONE_TAKEN`
- [ ] `npm run check && npm run lint && npm run build` pass *(lint hiện fail do `Docs/` — xem `.assumptions.md`)*

## Phase 5 — Bảo mật (từ đối chiếu với BE 2026-10-10, pending)

- [ ] Chặn `password` > 72 byte ở FE (cả client lẫn action server) — BE hiện ra 500
- [ ] Cắt/chặn `dharma_name`, `ordination_place` ≤ 255 ký tự ở FE và server action
- [ ] Captcha (Turnstile) + rate limit theo IP/SĐT ở server SvelteKit cho `request` và `resend`
- [ ] Đọc `expires_in` từ `verify-otp` cho TTL cookie (dùng chung với login, thêm vào `AuthSession` type)
- [ ] Chờ BE: OTP thật (blocker go-live), rate limit theo IP, production `API_KEY`

## Phase 4 — Tài liệu

- [ ] Xác nhận `API_KEY` production với BE
- [ ] Bổ sung bước xác minh email khi BE có
- [ ] OKF concept `Docs/Knowledge/…` sau khi Phase 2–3 xong *(không làm trong spec này)*
