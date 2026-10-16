# Tasks — login (sign-in, session, forgot password)

Version: 2.3
Last updated: 2026-10-17
Status: in-progress — mirrors `requirements.md`.

> See `changelog.md` in this folder for the version history of this spec.

`[x]` = verified in code on 2026-10-17 (exercised against a mock backend; no real BE server run yet). Unfinished v1.1 tasks are merged in here; finished v1.1 tasks
are not repeated.

## Phase 1 — Sign-in by email

- [x] `types/auth.ts`, `server/api/auth.ts`: `login` with `email` and `device`.
- [x] `login/+page.server.ts`: `load` blocks signed-in users (AC2) and reads `reason`/`redirect`; redirect after sign-in via `safeRedirect` (AC4, AC6).
- [x] `features/auth/redirect.ts` (off-site paths, `//evil`, `javascript:` are dropped; checked by a one-off script).
- [ ] `redirect.spec.ts` — the project has no unit-test runner yet (`il-testing`).
- [x] `LoginForm.svelte`: email field, no SMS-code button, "Forgot password?" link, submit disabled while empty (AC1, AC3).
- [x] `LoginForm.svelte` + `errors.ts`: unlock time from `locked_until` via `errorContext(form)` (AC5).
- [x] `LoginForm.svelte`: clear the password after a failure; show `login_session_ended` / `login_password_changed`.
- [x] Sign-in sends `device.platform = "web"` and `device_model` from the User-Agent (`login/+page.server.ts`) — kept.

## Phase 2 — Session

- [x] `server/auth/refresh.ts` single-flight (AC7).
- [ ] `refresh.spec.ts` (two parallel requests refresh only once) — no unit-test runner yet.
- [x] `401` → refresh → retry → session ended, implemented in `handleFetch` instead of an `apiAuthed` wrapper (AC8).
- [x] `hooks.server.ts` `handleSessionEnded` + `locals.sessionEnded` when refresh is rejected or a retry is still `401` (AC9).
- [x] `503 SERVICE_UNAVAILABLE` is passed through, cookies kept (AC8); the page shows its existing error state. A dedicated `auth_err_generic` message for it is not built.
- [x] `startSession`: `il_name = dharma_name || full_name`.
- [x] `il_token` TTL from `expires_in` (fallback 15 minutes) (`session.ts` `setTokens`).
- [x] Tokens only in httpOnly cookies, never sent to the browser (AC10).
- [x] Sign-out with confirmation, best effort, clear cookies, back to `/` (`ProfileHeader.svelte`, `profile/+page.server.ts`) (AC11).
- [ ] Pages that need an account: sign-in invitation link adds `?redirect=` (AC17).

## Phase 3 — Forgot password

- [x] `server/api/auth.ts`: `requestPasswordReset`, `confirmPasswordReset`; types.
- [x] `forgot-password/+page.server.ts` + `+page.svelte` following Steps 1–3 (AC12–AC16): timers from `expires_in_seconds` / `resend_after_seconds`; after confirm `endSession` and 303 to `/login?reason=password_changed`; `OTP_EXPIRED` is shown like an expired code.
- [x] Timers extracted to `features/auth/otp-timers.svelte.ts` and used by the forgot-password form.
- [ ] Switch `SignupOtp.svelte` to `OtpTimers` (still has its own copy).
- [x] `ForgotPasswordForm.svelte`; the new password is checked with `checkPassword` (`features/auth/validation.ts`).

## Phase 4 — Headers to the backend + i18n

- [x] `hooks.server.ts` `handleFetch`: `X-InnerLamp-Client-IP` from `event.getClientAddress()` on every request to `API_BASE_URL` (AC19, client IP part).
- [x] Forward the browser's `User-Agent` to the backend (AC19, User-Agent part) in `handleFetch`.
- [x] `errors.ts`: `authErrorMessage(code, ctx)`, `ErrorContext`, `errorContext`; mappings `LOGIN_LOCKED` (with/without time), `RATE_LIMITED` (with/without seconds), `REGISTRATION_IN_PROGRESS`, `EMAIL_SEND_FAILED`, `INVALID_DEVICE`, `INVALID_API_KEY`; `authFail` returns `lockedUntil` and `retryAfter` (AC5, AC18).
- [ ] `errors.ts`: `SESSION_ENDED` for actions (POST) and `/api/*` calls.
- [x] i18n per the table in `design.md`: `auth_err_*`, `login_session_ended`, `login_password_changed`, `forgot_*` exist in vi + en.

## Phase 5 — Tests

- [ ] `tests/login.e2e.ts`: email sign-in, uniform wrong-credentials message, lockout shows the time, `redirect`, signed-in user opening `/login`.
- [ ] `tests/forgot-password.e2e.ts`: email with / without an account looks the same (including the `OTP_EXPIRED` on confirm); fifth code request shows the send-limit message; after a reset, a session in another browser is reported as ended and a locked email signs in with the new password. Runs against a real backend, not yet tried.

## Phase 6 — Quality + docs

- [ ] `npm run check && npm run lint && npm run build` clean.
- [ ] Update the Website column in product §4.2 when done (tell `ba-writer`).
- [ ] Hardening not done since v1.1 (`__Host-` cookie in prod, HSTS, CSP, Referrer-Policy) — kept as separate work, does not block this spec.
