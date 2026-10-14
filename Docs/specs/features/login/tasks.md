# Tasks — login (Đăng nhập, phiên, quên mật khẩu)

Version: 2.0
Last updated: 2026-10-14
Status: in-progress (drift) — mirror `requirements.md`.

> See `changelog.md` in this folder for the version history of this spec.

`[x]` = đã kiểm trong code ngày 2026-10-14. Task v1.1 chưa làm được gộp vào đây; task v1.1 đã xong
không lặp lại.

## Phase 1 — Đăng nhập bằng email

- [ ] `types/auth.ts`, `server/api/auth.ts`: `login` với `email`.
- [ ] `login/+page.server.ts`: `load` chặn người có phiên (AC2), đọc `reason`/`redirect`; action theo AC4; `safeRedirect` (AC6).
- [ ] `features/auth/redirect.ts` + `redirect.spec.ts` (đường dẫn ngoài site, `//evil`, `javascript:` bị bỏ).
- [ ] `LoginForm.svelte`: ô email, bỏ nút mã SMS, xoá mật khẩu sau lỗi, hiển thị `login_session_ended` / `login_password_changed`, giờ mở khoá theo `locked_until` (AC1, AC3, AC5).
- [x] Đăng nhập gửi `device.platform = "web"` và `device_model` từ User-Agent (`login/+page.server.ts`) — giữ.

## Phase 2 — Phiên

- [ ] `server/auth/refresh.ts` single-flight + `refresh.spec.ts` (hai request song song chỉ refresh một lần) (AC7).
- [ ] `client.ts` `apiAuthed`: `401` → refresh → thử lại → `sessionEnded` (AC8).
- [ ] `session.ts` `sessionEnded`; hook dùng nó khi refresh bị từ chối (AC9).
- [ ] `startSession`: `il_name = dharma_name || full_name`.
- [x] TTL `il_token` từ `expires_in` (fallback 15 phút) (`session.ts` `setTokens`).
- [x] Token chỉ trong cookie httpOnly, không xuống browser (AC10).
- [x] Đăng xuất có xác nhận, best effort, xoá cookie, về `/` (`ProfileHeader.svelte`, `profile/+page.server.ts`) (AC11).
- [ ] Trang cần tài khoản: link mời đăng nhập thêm `?redirect=` (AC17).

## Phase 3 — Quên mật khẩu

- [ ] `server/api/auth.ts`: `requestPasswordReset`, `confirmPasswordReset`; types.
- [ ] `forgot-password/+page.server.ts` + `+page.svelte` theo Step 1–3 (AC12–AC16).
- [ ] Tách đồng hồ của `SignupOtp.svelte` thành `OtpTimers.svelte`, dùng ở cả hai nơi.
- [ ] `ForgotPasswordForm.svelte`; kiểm mật khẩu mới bằng `checkPassword` (onboarding Phase 1).

## Phase 4 — Header tới backend + i18n

- [ ] `client.ts`: `X-InnerLamp-Client-IP` (IP khách, từ `event.getClientAddress()`) + `User-Agent` trình duyệt (AC19).
- [ ] `errors.ts`: `RATE_LIMITED`, `SESSION_ENDED`.
- [ ] i18n theo bảng ở `design.md` (vi + en cùng key).

## Phase 5 — Test

- [ ] `tests/login.e2e.ts`: đăng nhập email, sai thông tin đồng nhất, khoá hiển thị giờ, `redirect`, người có phiên mở `/login`.
- [ ] `tests/forgot-password.e2e.ts`: email có / không có tài khoản trông như nhau; đặt lại xong phiên ở trình duyệt khác bị báo hết.

## Phase 6 — Chất lượng + tài liệu

- [ ] `npm run check && npm run lint && npm run build` sạch.
- [ ] Cập nhật cột Website ở product §4.2 khi xong (báo `ba-writer`).
- [ ] Hardening chưa làm từ v1.1 (`__Host-` cookie ở prod, HSTS, CSP, Referrer-Policy) — giữ làm việc riêng, không chặn spec này.
