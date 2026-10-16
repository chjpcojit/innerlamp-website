# Requirements — login (sign-in, session, forgot password)

Version: 2.3
Last updated: 2026-10-17
Status: in-progress — sign-in, `redirect`, session refresh / session-ended handling, forgot password and IP / User-Agent forwarding are in code and were exercised against a mock backend only (not a real BE server); session-ended on form actions (POST) and the e2e tests are not built.
Feature folder: `src/routes/(auth)/login/`, `src/routes/(auth)/forgot-password/` (not created), `src/lib/features/auth/`, `src/lib/server/auth/`, `src/lib/server/api/{auth,client}.ts`, `src/hooks.server.ts`
Product spec: innerlamp-be `docs/product/login/product.md` @ v1.4 (ADR-0003 — Accepted)
Contract: innerlamp-be `docs/specs/api/openapi.yaml` @ 2.1.1 (uncommitted backend working tree as of 2026-10-16): login by email, `refresh`, `logout`, `password-reset/request-otp` and `password-reset/confirm`, the `X-InnerLamp-Client-IP` header, `429 RATE_LIMITED` with `Retry-After`, and session revocation (`401` / `503`).
Implements: BR-LGN-01, BR-LGN-02, BR-LGN-03, BR-LGN-04, BR-LGN-05, BR-LGN-06, BR-LGN-07, FR-LGN-001, FR-LGN-002, FR-LGN-003, FR-LGN-004, FR-LGN-005, FR-LGN-006, FR-LGN-007, FR-LGN-008, FR-LGN-009, FR-LGN-010, NFR-LGN-01, NFR-LGN-02, NFR-LGN-03

> See `changelog.md` in this folder for the version history of this spec.

v2.0 rewrote this spec to follow product login v1.2; v2.2 follows product v1.4 (matrix only, no requirement changed) and `openapi.yaml` 2.1.1. The business rules (uniform message, lock after 5
tries / 15 minutes, 7-day session, reset-code policy) live in the product spec and are not repeated
here. Routes: `/login`, `/forgot-password` (`/en/...`).

## User Story

As a member, I want to sign in with my email and password, keep my session, be told when my session
ends, and recover my password through a code sent to my email, so that I can use member features
without asking anyone for help.

## Acceptance Criteria (EARS notation)

### Sign-in

1. WHEN a guest opens `/login`, THE SYSTEM SHALL show an email field, a password field, the "Forgot password?" link (`login_forgot`) to `/forgot-password`, a link to `/signup`, and the "browse without signing in" link to `/`; THE SYSTEM SHALL NOT offer a one-time-code sign-in button. (FR-LGN-001, FR-LGN-010)
2. WHEN a signed-in user opens `/login`, THE SYSTEM SHALL redirect to `localizeHref('/')`. (FR-LGN-007)
3. WHILE the email is empty or the password is empty, THE SYSTEM SHALL disable the sign-in button; no password-length rule applies here. (BR-LGN-01)
4. WHEN the user submits the form, THE SYSTEM SHALL call `POST /v1/auth/login` from the form action with the email, the password and `device {platform: "web", device_model}` taken from the User-Agent (`device_model` is required by the backend; `platform` is optional there, but the site always sends `"web"`), then:
   - on success: set the session cookies and redirect to the `redirect` target if valid (AC6), otherwise to `localizeHref('/')`;
   - on failure: stay on `/login`, keep the email, and show the error per the Error → UI table. (FR-LGN-001, FR-LGN-002, BR-LGN-01)
5. WHEN the backend returns `LOGIN_LOCKED`, THE SYSTEM SHALL show `auth_err_login_locked_until` with the unlock time taken from `locked_until` in the visitor's local time, falling back to `auth_err_login_locked` (no time) when `locked_until` is missing or invalid; THE SYSTEM SHALL NOT hard-code "15 minutes". (FR-LGN-003, BR-LGN-02)
6. WHEN a guest is invited to sign in on the way to a page that needs an account, THE SYSTEM SHALL send them to `/login?redirect=<path>` and, after sign-in, open exactly that page; `redirect` accepts only a same-site relative path (starts with `/`, no `//`, no scheme) and is ignored otherwise. (FR-LGN-007)

### Session

7. WHEN a request reaches the server without `il_token` but with `il_refresh`, THE SYSTEM SHALL call `POST /v1/auth/refresh` once per request (single-flight per refresh token), store both new tokens with the TTL from `expires_in`, then:
   - on a backend 4xx: clear the session and treat it as session ended (AC9);
   - on a network error / 5xx: keep the cookies and retry on the next request. (FR-LGN-004, BR-LGN-03)
8. WHEN a Bearer call to the backend returns `401` while the user still has cookies — including an access token that has not expired but whose session was revoked (sign-out, password reset, sign-in again on the same device) — THE SYSTEM SHALL refresh once and retry that call; if it is still `401`, clear the session and treat it as session ended (AC9). WHEN a Bearer call returns `503 SERVICE_UNAVAILABLE` (the backend cannot check the session), THE SYSTEM SHALL keep the cookies, show `auth_err_generic` and let the visitor retry; it SHALL NOT end the session. (FR-LGN-005, BR-LGN-03, platform)
9. WHEN the session ends without the user signing out (refresh rejected, `401` in AC8, password reset elsewhere), THE SYSTEM SHALL send the browser to `/login?reason=session_ended&redirect=<current page>` when it is a page navigation (GET), and `/login` SHALL show `login_session_ended`; THE SYSTEM SHALL NOT silently turn the user into a guest. (FR-LGN-005, BR-LGN-04)
10. WHEN a page is rendered, THE SYSTEM SHALL keep the access and refresh tokens out of the HTML, the page data and browser JS; tokens live only in httpOnly cookies. (NFR-LGN-03)

### Sign-out

11. WHEN the user chooses "Sign out" on `/profile`, THE SYSTEM SHALL ask for confirmation; cancel keeps everything as is; confirm calls `POST /v1/auth/logout` (best effort), clears the session cookies even if the backend fails, and goes to `/` as a guest. (FR-LGN-006, BR-LGN-07)

### Forgot password

12. WHEN a guest opens `/forgot-password`, THE SYSTEM SHALL show an email field; a signed-in user opening this page is redirected to `/`. (FR-LGN-008)
13. WHEN the email is submitted, THE SYSTEM SHALL call `POST /v1/auth/password-reset/request-otp` and, whether or not the email has an account, move to the new-password step with `forgot_sent` (the site's own text, not the backend `message`), the expiry timer from `expires_in_seconds` and the resend timer from `resend_after_seconds`; THE SYSTEM SHALL NOT show anything that differs between an email with and without an account (the response, the errors and the `429` limits are identical for both). (FR-LGN-008, NFR-LGN-01)
14. WHEN the user chooses "Resend code" after the wait, THE SYSTEM SHALL call `password-reset/request-otp` again (there is no separate resend endpoint; the previous code stops working) and reset both timers; WHEN the send allowance of the cycle (first code plus three resends, four codes) is used up, THE SYSTEM SHALL show the `OTP_SEND_LIMITED` message per the Error → UI table. (FR-LGN-008, BR-LGN-05)
15. WHEN a code and a valid new password are entered (BR-ONB-06, counted in characters, same vector `rules/password.json`), THE SYSTEM SHALL call `POST /v1/auth/password-reset/confirm`; on success (`200`, no token and no session in the response) end any session cookies of this browser and go to `/login?reason=password_changed` showing `login_password_changed`; THE SYSTEM SHALL NOT sign the visitor in automatically. (FR-LGN-009, BR-LGN-05)
16. WHEN the password was just reset (here or on another device), THE SYSTEM SHALL treat every other session as revoked: the next request of any other browser returns `401` and is handled per AC8–AC9; the reset also lifts an active `LOGIN_LOCKED` on that email, so the new password signs in at once. (FR-LGN-009, BR-LGN-05)

### Guest

17. WHEN a guest opens a page that needs an account, THE SYSTEM SHALL show a sign-in / sign-up invitation (link `/login?redirect=…`) instead of the content, and SHALL NOT call the backend for account data; public pages open normally. (FR-LGN-010, BR-LGN-06)

### General

18. WHEN an error occurs, THE SYSTEM SHALL show only Paraglide strings (never the backend `error.message`); `RATE_LIMITED` shows `auth_err_rate_limited_wait` with the wait in seconds taken from `retry_after_seconds`, falling back to `auth_err_rate_limited` (no wait) when it is missing. (NFR-LGN-02)
19. WHEN the SvelteKit server calls the backend, THE SYSTEM SHALL send the visitor's IP in the `X-InnerLamp-Client-IP` header (`event.getClientAddress()`, set per request in the `handleFetch` hook for every request to `API_BASE_URL`, never copied from a browser header) and the browser's User-Agent, so the backend's per-IP limits count each visitor correctly; the backend trusts the header only with a valid `x-api-key` and exactly one valid IP, otherwise it uses the connection address, and route groups share one budget (so sign-up codes and reset codes draw on the same send budget per IP). (NFR-LGN-02, platform)

## Data & API (called from the SvelteKit server)

| Operation          | Endpoint                                   | Note                                                                                     |
| ------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Sign in            | `POST /v1/auth/login`                      | `email` replaces `phone_number`; `device` is required                                    |
| Refresh            | `POST /v1/auth/refresh`                    | Unchanged                                                                                |
| Sign out           | `POST /v1/auth/logout`                     | Needs `Authorization: Bearer`; `200` also when the session is already revoked            |
| Request reset code | `POST /v1/auth/password-reset/request-otp` | In contract 2.1.1; same response whether or not the email has an account; again = resend |
| Set new password   | `POST /v1/auth/password-reset/confirm`     | In contract 2.1.1; `200` without token; revokes all sessions and lifts the sign-in lock  |

Request/response shapes and error codes: see the contract in the header.

## Error → UI mapping

| Case                                                                                                             | What the visitor sees                                                                             |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `INVALID_CREDENTIALS` (wrong password, unknown email, unverified email — all the same)                           | `auth_err_invalid_credentials` ("Email hoặc mật khẩu không đúng" / "Incorrect email or password") |
| `LOGIN_LOCKED`                                                                                                   | `auth_err_login_locked_until` with the unlock time; `auth_err_login_locked` without a time        |
| `INVALID_EMAIL`                                                                                                  | Error under the email field                                                                       |
| `OTP_EXPIRED` on reset confirm (expired, used, never issued **or the email has no account** — indistinguishable) | Same text as an expired code (`auth_err_otp_expired`), "Resend code" emphasised                   |
| `INVALID_PASSWORD` (reset)                                                                                       | Error under the new-password field                                                                |
| `VALIDATION_ERROR`                                                                                               | `auth_err_validation`                                                                             |
| `OTP_INVALID` / `OTP_EXPIRED` / `OTP_LOCKED` / `OTP_RESEND_TOO_SOON` / `OTP_SEND_LIMITED`                        | Same as sign-up (`../onboarding/requirements.md` Error → UI)                                      |
| `RATE_LIMITED`                                                                                                   | `auth_err_rate_limited_wait` with seconds; `auth_err_rate_limited` without                        |
| `REGISTRATION_IN_PROGRESS`                                                                                       | `auth_err_registration_in_progress`                                                               |
| `EMAIL_SEND_FAILED`                                                                                              | `auth_err_email_send_failed`                                                                      |
| `REFRESH_TOKEN_INVALID`, `401` on a Bearer call                                                                  | Session ended (AC9)                                                                               |
| `503 SERVICE_UNAVAILABLE` on a Bearer call                                                                       | `auth_err_generic`, session kept (AC8)                                                            |
| `INVALID_DEVICE`, `INVALID_API_KEY`, 5xx                                                                         | `auth_err_generic`, logged on the server                                                          |
| `NETWORK_ERROR`                                                                                                  | `auth_err_network`                                                                                |

> ⚠️ Not confirmed: `OTP_LOCKED` / `OTP_SEND_LIMITED` copy (`auth_err_otp_locked`, `auth_err_otp_limited`) does not show the unlock time, while the product spec says it should — blocks the OTP rows above matching the product spec.

## Out of scope

- Sign-up → `../onboarding/`.
- Code sign-in, Google/Apple, sign out of all devices, changing the password while signed in → later (product §1.2).

## Pending (not yet implemented)

`tasks.md` Phases 5–6 (tests, quality gate), the sign-in invitation link with `?redirect=` on pages that need an account (AC17), the `SESSION_ENDED` message for actions (POST) and `/api/*` calls.

> ⚠️ Not confirmed: date of the production `API_KEY` (backend TD-001) — blocks deploy, waiting on the backend.

## Open questions (resolved)

- ~~Are `password-reset/*` and `X-InnerLamp-Client-IP` in the contract?~~ → Yes, `openapi.yaml` 2.1.1 (2026-10-16); AC13–AC16 are now confirmed against it. Resolved 2026-10-16.

- ~~Keep the password after a failed sign-in?~~ → Clear the password field, keep the email (product §3.7 keeps only the email). Resolved 2026-10-14.
- ~~Signed-in user opens `/login` / `/signup`?~~ → Go to `/` (FR-LGN-007). Resolved 2026-10-14.
- ~~Where to go after sign-in?~~ → The page the guest was heading to, or `/` when `/login` is opened directly (FR-LGN-007). Resolved 2026-10-14.
- ~~"Send one-time code via SMS" button?~~ → Removed (product: no code sign-in). Resolved 2026-10-14.
- ~~Captcha + rate limit on the SvelteKit server?~~ → No; the backend limits by the visitor IP that the website forwards (AC19, backend login v2.2 AC34). Resolved 2026-10-14.
- ~~How to pass the client IP to the backend?~~ → The `handleFetch` hook sets `X-InnerLamp-Client-IP` on every request to `API_BASE_URL`, instead of passing it per call. Resolved 2026-10-16.
- ~~Does a refresh token that was just rotated have a grace window?~~ → No (kept from v1.1); so refresh must be single-flight (AC7). Resolved 2026-10-10.
