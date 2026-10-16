# Design — login (sign-in, session, forgot password)

Version: 2.3
Last updated: 2026-10-17
Status: in-progress (drift) — mirrors `requirements.md`.

> See `changelog.md` in this folder for the version history of this spec.

## Overview

Same architecture as v1.1: the form action calls the backend through `$lib/server/api/auth.ts`, the
session lives in httpOnly cookies, and `hooks.server.ts` refreshes tokens and sets `locals.user`.
v2.0: sign-in by email; a new `/forgot-password` page (two steps on one page, like `/signup`); one
place that handles "session ended" (hook + client API) and sends the user to `/login` with a notice;
a `redirect` parameter to return to the intended page; forwarding of the visitor's IP and User-Agent
to the backend. v2.1: the IP is forwarded by the `handleFetch` hook (not per call), and error copy
takes context (unlock time, wait seconds). v2.2: follows contract 2.1.1 — reset endpoints are published, a revoked session returns `401` at once, `503` keeps the session.

## Layers & components

| Layer          | File                                                                                        | Responsibility                                                                                                                                                                                                                                                                                                                                                       | Status                                      |
| -------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Route (server) | `src/routes/(auth)/login/+page.server.ts`                                                   | `load`: signed-in → 303 `/`, reads `reason` (`session_ended` / `password_changed` only) and `redirect` (via `safeRedirect`). Action `default`: email sign-in with `device {platform:'web', device_model}`, `startSession`, 303 to `safeRedirect(redirect)` or `/`, failures via `authFail`.                                                                          | done                                        |
| Feature UI     | `src/lib/features/auth/components/LoginForm.svelte`                                         | Email field, password; no SMS-code button; "Forgot password?" link; hidden `redirect`; notice for `login_session_ended` / `login_password_changed`; clears the password after a failure; error via `authErrorMessage(form.error, errorContext(form))`.                                                                                                               | done                                        |
| Route (server) | `src/routes/(auth)/forgot-password/+page.server.ts`                                         | `load`: session → `/`. Actions `request`, `resend` (same backend call; a failed resend stays on the code step) and `confirm` (checks the password with `checkPassword`, calls the backend, `endSession`, 303 `/login?reason=password_changed`).                                                                                                                      | done                                        |
| Route (UI)     | `src/routes/(auth)/forgot-password/+page.svelte`                                            | `AuthShell` + `ForgotPasswordForm`                                                                                                                                                                                                                                                                                                                                   | done                                        |
| Feature UI     | `src/lib/features/auth/components/ForgotPasswordForm.svelte`                                | Email step → code + new-password step; timers from `otp-timers.svelte.ts` (`OtpTimers`, extracted for this form; `SignupOtp` still has its own copy).                                                                                                                                                                                                                | done (SignupOtp not refactored)             |
| Feature logic  | `src/lib/features/auth/redirect.ts`                                                         | `safeRedirect(raw): string                                                                                                                                                                                                                                                                                                                                           | null` — same-site relative paths only (AC6) | done                     | not created |
| Feature logic  | `src/lib/features/auth/errors.ts`                                                           | `authErrorMessage(code, ctx)`, `ErrorContext {lockedUntil, retryAfter}`, `errorContext(formData)`; unlock time for `LOGIN_LOCKED`, `OTP_LOCKED`, `OTP_SEND_LIMITED`; wait seconds for `RATE_LIMITED` and `REGISTRATION_IN_PROGRESS`. The case mapping is in `requirements.md` Error → UI                                                                             | done (`SESSION_ENDED` for POST not added)   |
| Server auth    | `src/lib/server/auth/action.ts`                                                             | `authFail(e)` returns the error code plus `retryAfter` (from `details.retry_after_seconds`) and `lockedUntil` (from `details.locked_until`)                                                                                                                                                                                                                          | done                                        |
| API resource   | `src/lib/server/api/auth.ts`                                                                | `login`, `refreshTokens`, `logout`, `requestPasswordReset`, `confirmPasswordReset`                                                                                                                                                                                                                                                                                   | done                                        |
| API client     | `src/lib/server/api/client.ts`                                                              | Sends `x-api-key`; no `apiAuthed` wrapper — the `401` → refresh → retry logic lives in `handleFetch` so every Bearer call is covered (AC8)                                                                                                                                                                                                                           | done (replaces the planned `apiAuthed`)     |
| Server auth    | `src/lib/server/auth/session.ts`                                                            | `startSession` sets `il_name = dharma_name                                                                                                                                                                                                                                                                                                                           |                                             | full_name`; `endSession` | done        | full_name`; `sessionEnded(event)`: `endSession`+`redirect(303, /login?reason=session_ended&redirect=…)` on a GET navigation | needs change |
| Server auth    | `src/lib/server/auth/refresh.ts`                                                            | `refreshSession(fetch, cookies)`: single-flight `Map<refreshToken, Promise>`, returns `refreshed` / `rejected` (4xx except `429` and `INVALID_API_KEY`; cookies cleared) / `unavailable` (outage; cookies kept) / `none` (AC7)                                                                                                                                       | done                                        |
| Hook           | `src/hooks.server.ts` (`handleAuth`)                                                        | Renews the access cookie through `refreshSession`; a rejection sets `locals.sessionEnded`. `handleSessionEnded` (after Paraglide): when `locals.sessionEnded`, a GET navigation gets 303 (or the data-request redirect JSON) to `/login?reason=session_ended&redirect=<page>` carrying the cleared cookies; skipped on `/login`, `/signup`, `/forgot-password` (AC9) | done                                        |
| Hook           | `src/hooks.server.ts` (`handleFetch`)                                                       | For every request to `API_BASE_URL`: sets `X-InnerLamp-Client-IP` (`event.getClientAddress()`, skipped if none) and the browser's `User-Agent`; a Bearer call answered `401 UNAUTHORIZED` is refreshed once and retried, a second `401` or a rejected refresh ends the session; `503` is passed through untouched so the cookies stay (AC8, AC19)                    | done                                        |
| Logout         | `src/routes/(site)/profile/+page.server.ts`, `ProfileHeader.svelte`                         | Confirm, best effort, clear cookies, `/`                                                                                                                                                                                                                                                                                                                             | exists, unchanged                           |
| Guest prompt   | pages that need an account (`memorial`, `profile`, …)                                       | Sign-in invitation link gets `?redirect=<path>` (AC17)                                                                                                                                                                                                                                                                                                               | needs change                                |
| Types          | `src/lib/types/auth.ts`                                                                     | `LoginRequest {email, password, device}`, `PasswordResetConfirm`                                                                                                                                                                                                                                                                                                     | done                                        |
| i18n           | `messages/vi.json`, `messages/en.json`                                                      | `login_session_ended`, `login_password_changed`, `forgot_*`, `auth_err_otp_locked_until({time})`, `auth_err_otp_limited_until({time})`, `auth_err_registration_in_progress_wait({seconds})` added; `auth_err_invalid_password` now says 8–64 characters.                                                                                                             | done                                        |
| Tests          | `redirect.spec.ts`, `refresh.spec.ts`, `tests/login.e2e.ts`, `tests/forgot-password.e2e.ts` | Per `il-testing`                                                                                                                                                                                                                                                                                                                                                     | not created                                 |

## Route & navigation flow

```
/login  (load: session → 303 /)
  ├─ submit ✓ ──▶ startSession ──▶ 303 safeRedirect(redirect) ?? localizeHref('/')
  ├─ "Forgot password?" ──▶ /forgot-password
  ├─ "Create account" ──▶ /signup
  └─ "Browse without signing in" ──▶ /

/forgot-password  (load: session → 303 /)
  ├─ ?/request ✓ ──▶ code + new-password step (same page); calling again = resend
  └─ ?/confirm ✓ ──▶ 303 /login?reason=password_changed

any page (GET) when the session ends ──▶ 303 /login?reason=session_ended&redirect=<page>
```

## Step-by-step Flow — Session refresh and session ended

```
Step 1 — Hook (every request)
- Trigger: no il_token, il_refresh present.
- Where: hooks.server.ts handleAuth → refresh.ts (single-flight per refresh token).
- API: POST /v1/auth/refresh
    - Success → setTokens (TTL from expires_in) → continue.
    - Failure 4xx → Step 3.
    - Failure network / 5xx → keep cookies, continue as a guest for this request.

Step 2 — Bearer call in load/action
- Where: client.ts apiAuthed.
- API: original call → 401 → POST /v1/auth/refresh (single-flight) → retry the original call once
    - Second attempt succeeds → return the data.
    - Refresh 4xx or the second attempt is still 401 → Step 3 (a revoked session returns 401 on the next request even if the access token has not expired).
    - 503 SERVICE_UNAVAILABLE (backend cannot check the session) → keep cookies, no refresh, show auth_err_generic.

Step 3 — Session ended
- endSession(cookies); locals.sessionEnded = true. On a GET navigation → 303 /login?reason=session_ended&redirect=<current url>
  (for a client-side navigation, the redirect JSON of a data request). Not built yet: on an action (POST) or an /api/* call the session is cleared but no SESSION_ENDED error is shown.
```

## Step-by-step Flow — Forgot password

```
Step 1 — Request the code
- Where: forgot-password action `request`.
- API: POST /v1/auth/password-reset/request-otp {email}
    - Success (identical for an email with or without an account) → {step:'reset', email, expiresIn: expires_in_seconds, resendAfter: resend_after_seconds}; the page shows its own forgot_sent text, never the backend message.
    - Failure 400/429 (INVALID_EMAIL, OTP_RESEND_TOO_SOON, OTP_SEND_LIMITED, OTP_LOCKED, RATE_LIMITED) → stay, show the error per the Error → UI table. The same codes come back for unknown emails, so no extra branching.

Step 2 — Resend (repeatable) — call Step 1 again after resendAfter (same endpoint; the cycle allows four codes in total, then OTP_SEND_LIMITED).

Step 3 — Set the new password
- Where: action `confirm`. Check the new password with checkPassword (onboarding validation.ts) before calling.
- API: POST /v1/auth/password-reset/confirm {email, otp_code, new_password}
    - Success (200, no token, no data) → endSession (cookies of this browser, if any) → 303 /login?reason=password_changed. No automatic sign-in. The backend has revoked every session and lifted LOGIN_LOCKED.
    - Failure → stay on the code step, show the error (OTP_INVALID, OTP_EXPIRED — also for an email without an account —, OTP_LOCKED, INVALID_PASSWORD, RATE_LIMITED); the new password is never echoed back to the page.
```

Both endpoints are in `openapi.yaml` 2.1.1 (see the header of `requirements.md`).

## Session & cookies

| Cookie       | Content                      | TTL                                | Attributes                                 |
| ------------ | ---------------------------- | ---------------------------------- | ------------------------------------------ |
| `il_token`   | access token                 | `expires_in` (fallback 15 minutes) | httpOnly, `SameSite=Lax`, `Secure` in prod |
| `il_refresh` | refresh token                | 7 days                             | same                                       |
| `il_name`    | `dharma_name \|\| full_name` | 7 days                             | same                                       |

The `session_ended` / `password_changed` notices travel in the `reason` query of `/login` (only those
two values accepted); no flash cookie is needed.

## Headers sent to the backend

- `x-api-key` — set in `client.ts` on every call.
- `X-InnerLamp-Client-IP: <event.getClientAddress()>` — set in the `handleFetch` hook on every request
  to `API_BASE_URL` (so it also covers `event.fetch` calls that do not go through `apiCall`). It replaces the earlier plan
  of passing the IP per call through `apiCall`. The value is always the server's own reading of the
  visitor address, never copied from a browser header. The backend trusts it only with a valid
  `x-api-key` and the value is exactly one valid IP, otherwise it uses the connection address (`openapi.yaml` 2.1.1, `ClientIpHeader`; backend login v2.2 AC34).
- `User-Agent` of the browser — forwarded by `handleFetch` (AC19); the login body's `device.device_model` is also derived from it (AC4).

## Deliberately stubbed for now

- Nothing is stubbed on the contract side any more: `password-reset/*` is in `openapi.yaml` 2.1.1. The pages are simply not built yet (see Layers). Nothing has been run against a real backend server yet.
