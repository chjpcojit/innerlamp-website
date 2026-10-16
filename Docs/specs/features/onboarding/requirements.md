# Requirements — onboarding (Website sign-up)

Version: 1.7
Last updated: 2026-10-17
Status: in-progress — the two-step `/signup` flow runs with email OTP; the phone (`phone_country` + national number), error-mapping and country-list changes of 2026-10-16 are in code. Remaining work is listed in `tasks.md`.
Feature folder: `src/routes/(auth)/signup/`, `src/lib/features/auth/`, `src/lib/server/api/auth.ts`, `src/lib/types/auth.ts`
Product spec: innerlamp-be `docs/product/onboarding/product.md` @ v1.7 (ADR-0003 — Accepted; v1.7 defines the refusal at the code step (AC21); v1.6 defines the `REGISTRATION_IN_PROGRESS` screen, v1.3–v1.5 changed no requirement)
Contract: innerlamp-be `docs/specs/api/openapi.yaml` @ 2.1.1 (uncommitted backend working tree as of 2026-10-16): register `request-otp` / `resend-otp` / `verify-otp`, `X-InnerLamp-Client-IP`, `429 RATE_LIMITED` with `Retry-After`.
Implements: BR-ONB-04, BR-ONB-05, BR-ONB-06, BR-ONB-07, BR-ONB-08, BR-ONB-09, BR-ONB-10, BR-ONB-11, FR-ONB-003, FR-ONB-004, FR-ONB-005, FR-ONB-006, FR-ONB-007, FR-ONB-008, FR-ONB-009, FR-ONB-010, NFR-ONB-01, NFR-ONB-02, NFR-ONB-03

> See `changelog.md` in this folder for the version history of this spec.

This spec replaces `../register/` (phone + SMS; removed in the old-docs cleanup). The product spec
slug is `onboarding`; the URL stays `/signup` (`/en/signup`). Not applicable to the website: BR-ONB-01…03,
FR-ONB-001, FR-ONB-002 (intro screens, app only — product §3.6).

Business rules (lengths, country list, code policy, message wording) live in the product spec and are
not repeated here; this file only says how the website implements them.

## User Story

As a visitor, I want to create an account with my email, password, phone number and full name, then
enter the code sent to my email, so that I am signed in immediately and can use member features.

## Acceptance Criteria (EARS notation)

### Sign-up form (step 1)

1. WHEN a visitor opens `/signup`, THE SYSTEM SHALL show the form: full name, dharma name (optional, empty by default, with a suggest button), place of ordination (a temple list or "lay practitioner at home", with temple suggestion), phone number (country + number), email, password (with a strength hint) and a terms checkbox linking to `/terms` and `/privacy`. (FR-ONB-003, FR-ONB-004, BR-ONB-07, BR-ONB-11)
2. WHEN a signed-in user opens `/signup`, THE SYSTEM SHALL redirect to `localizeHref('/')` from the server `load`. (FR-ONB-003 §3.6)
3. WHEN the visitor picks a country, THE SYSTEM SHALL offer only the 12 countries of BR-ONB-04 (default Vietnam) and validate the number against that country's digit count; the browser check is early feedback only, the backend decides. (BR-ONB-04)
4. WHEN email, password, full name or dharma name do not satisfy BR-ONB-05/06/07, THE SYSTEM SHALL show an error directly under that field and disable the submit button; the password is counted in **characters** after NFC (not bytes), 8–64. (BR-ONB-05, BR-ONB-06, BR-ONB-07)
5. WHILE the terms are not ticked, THE SYSTEM SHALL disable the submit button. (BR-ONB-11)
6. WHEN the password strength bar is shown, THE SYSTEM SHALL treat it as a hint only and never block submission. (BR-ONB-06, §3.6)
7. WHEN the visitor submits a valid form, THE SYSTEM SHALL call `POST /v1/auth/register/request-otp` from the form action with `phone_country` (the ISO code of the chosen country) and `phone_number` (the national digits after `normalizePhone`, trunk `0` stripped; no `+`, no country code, no E.164 assembled by the site), then:
   - on success: go to the code step, show the email the code was sent to, an expiry timer from `expires_in_seconds` and a resend wait from `resend_after_seconds`;
   - on failure: stay on step 1, keep every value (the password is not echoed back in the returned payload), and show the error at the right field per the Error → UI table. (FR-ONB-003, BR-ONB-08, BR-ONB-09)
8. WHEN the email already has an account, THE SYSTEM SHALL show exactly what it shows for a new email (the backend answers identically), with no different text or path. (BR-ONB-08, NFR-ONB-01)
9. WHEN the backend returns `PHONE_TAKEN`, THE SYSTEM SHALL show `auth_err_phone_taken` under the phone field with a link to `/login`. (FR-ONB-005)

### Code entry (step 2)

10. WHEN the visitor enters all 6 digits and confirms, THE SYSTEM SHALL call `POST /v1/auth/register/verify-otp` with email + code, then on success set the session cookies (as in `../login/`), send the temple suggestion if any (AC14) and redirect to `localizeHref('/')`. (FR-ONB-007, §3.6)
11. WHILE the code is valid, THE SYSTEM SHALL count down from the number the backend returned; WHEN it expires, show "code expired" and emphasise "Resend code". WHILE it is not yet time to resend, the "Resend code" button is locked and shows the seconds left; WHEN resending, call `POST /v1/auth/register/resend-otp` and reset both timers from the response. (FR-ONB-008, BR-ONB-09)
12. WHEN the visitor chooses "Change email", THE SYSTEM SHALL return to the step 1 form with every field as entered. (FR-ONB-009)
13. WHEN the backend returns `PENDING_REGISTRATION_EXPIRED`, THE SYSTEM SHALL show `auth_err_pending_expired` and return to step 1 with every field as entered. (FR-ONB-010)
14. WHEN the visitor suggested a temple and the account was just created, THE SYSTEM SHALL send `POST /v1/temple-suggestions` once (a failure does not break sign-up): name, province and ward are **required** and chosen from the administrative-unit list, street address is **optional**. (FR-ONB-006, BR-ONB-10)
15. WHEN the page is reloaded on step 2, THE SYSTEM SHALL return to step 1 (no code state is kept on the client). (platform)

### General

16. WHEN showing an error, THE SYSTEM SHALL use only Paraglide strings and never the backend `error.message`; unlock times (`locked_until`) are shown in the browser's local time. (NFR-ONB-02, platform)
17. WHEN the backend returns `429 RATE_LIMITED`, THE SYSTEM SHALL show a "try again later" message with the wait from `retry_after_seconds` (`auth_err_rate_limited_wait`), falling back to `auth_err_rate_limited` when the value is absent. (NFR-ONB-02)
18. WHEN a form action returns a result, THE SYSTEM SHALL not put the password, the code or a token into the payload returned to the page, and not log them. (NFR-ONB-03)
19. WHEN unit tests run, THE SYSTEM SHALL pass every case of `rules/phone-number.json`, `rules/email.json`, `rules/password.json`, `rules/names.json` with the website's validation functions. (BR-ONB-04…07)
20. WHEN the backend returns `REGISTRATION_IN_PROGRESS` (409: this email has a pending registration whose code is still valid and the submitted details differ — phone, full name, dharma name, temple or password), THE SYSTEM SHALL stay on step 1 with every value kept (the password is not echoed back in the returned payload) and show `auth_err_registration_in_progress` ("Vui lòng chờ N giây rồi thử lại" / "Please wait N seconds and try again") with N taken from `retry_after_seconds` — never a number chosen by the site; no email is sent, the pending registration and its earlier code stay as they were, and the old code can still be entered. The result is identical for an email with and without an account. WHEN the same details are submitted again, THE SYSTEM SHALL treat it as AC7 (a new code, the code step opens). (BR-ONB-08, FR-ONB-003)

21. WHEN `verify-otp` returns `PHONE_TAKEN` (another account took the number while the code was pending) or `INVALID_TEMPLE` (the chosen temple no longer exists), no account or session has been created, so THE SYSTEM SHALL return to step 1 with every field as entered and show the error at the right field per the Error → UI table (`auth_err_phone_taken` with the sign-in link under the phone field; the choose-again error under the place-of-ordination field). (BR-ONB-08, FR-ONB-005, FR-ONB-004)

## Data & API (called from the SvelteKit server)

| Operation                          | Endpoint                                                        | Notes                                                                       |
| ---------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Submit form                        | `POST /v1/auth/register/request-otp`                            | Email + `phone_country` + national `phone_number` (no `+`, no country code) |
| Resend code                        | `POST /v1/auth/register/resend-otp`                             | New path (replaces `/v1/auth/resend-otp`)                                   |
| Verify code                        | `POST /v1/auth/register/verify-otp`                             | Returns a session like login                                                |
| Suggest temple                     | `POST /v1/temple-suggestions`                                   | Unchanged; `address` optional                                               |
| Temple / administrative-unit lists | `GET /v1/temples/options`, `GET /v1/administrative-units/new/*` | Unchanged                                                                   |

Request/response shapes and error codes: see the contract in the header. Every call carries `x-api-key`
and the visitor's IP via `X-InnerLamp-Client-IP` (see `../login/design.md`, "Headers sent to the backend"). Sending a code (first code and resend) and verifying draw on per-IP budgets shared by route group, and the code cycle allows four codes (first plus three resends) before `OTP_SEND_LIMITED`; the screens only show the resulting errors per the table below.

## Error → UI mapping

| Case                                                                                                 | The visitor sees                                                                                                |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `INVALID_EMAIL` / `INVALID_PHONE` / `INVALID_PASSWORD` / `INVALID_FULL_NAME` / `INVALID_DHARMA_NAME` | Error under the right field (`auth_err_invalid_*`)                                                              |
| `INVALID_TEMPLE`                                                                                     | Error on the place-of-ordination field, asking to choose again                                                  |
| `VALIDATION_ERROR`                                                                                   | Generic `auth_err_validation`                                                                                   |
| `PHONE_TAKEN` (step 1, or step 2 per AC21)                                                           | `auth_err_phone_taken` under the phone field + link to `/login`; from step 2, back to step 1 with fields kept   |
| `REGISTRATION_IN_PROGRESS`                                                                           | `auth_err_registration_in_progress` on step 1, fields kept, wait from `retry_after_seconds` when present (AC20) |
| `OTP_RESEND_TOO_SOON`                                                                                | Resend timer from `retry_after_seconds`                                                                         |
| `OTP_SEND_LIMITED`                                                                                   | `auth_err_otp_limited` with the `locked_until` time; the last code can still be entered                         |
| `OTP_INVALID`                                                                                        | `auth_err_otp_invalid`                                                                                          |
| `OTP_EXPIRED`                                                                                        | `auth_err_otp_expired`, "Resend code" emphasised                                                                |
| `OTP_LOCKED`                                                                                         | `auth_err_otp_locked` with the `locked_until` time, code input locked until then                                |
| `PENDING_REGISTRATION_EXPIRED`                                                                       | `auth_err_pending_expired`, back to step 1 (AC13)                                                               |
| `RATE_LIMITED`                                                                                       | `auth_err_rate_limited_wait` with the wait in seconds; `auth_err_rate_limited` when no wait is given            |
| `EMAIL_SEND_FAILED`                                                                                  | `auth_err_email_send_failed`                                                                                    |
| 5xx, `INVALID_DEVICE`, `INVALID_API_KEY`                                                             | `auth_err_generic`, logged on the server                                                                        |
| `NETWORK_ERROR`                                                                                      | `auth_err_network`                                                                                              |

## Out of scope

- Login, session, forgot password → `../login/`.
- Intro screens, redirect when opening the app → app only.
- Change email / phone, delete account, Google/Apple → later (product §1.2).

## Pending (not yet implemented)

The whole move from SMS to email — `tasks.md` Phases 1–5. Not yet run against a real backend server. Also open: `OTP_LOCKED` / `OTP_SEND_LIMITED`
do not yet show the unlock time (AC16, Error → UI table).

## Open assumptions

- The site sends the digits after `normalizePhone` (trunk `0` stripped) as `phone_number`; the backend accepts this (it strips one leading `0` and ignores spaces, `.`, `-`). Recorded 2026-10-16; if the backend rule changes, the sent value must be revisited.

## Open questions (resolved)

- ~~Screen for `PHONE_TAKEN` / `INVALID_TEMPLE` at the code step?~~ → Back to step 1, every value kept, error at the related field; no account is created (product v1.7 BR-ONB-08 / FR-ONB-005 / FR-ONB-004, decided by anh Đức; matches AC21). Resolved 2026-10-17.

- ~~What does the visitor see on `REGISTRATION_IN_PROGRESS`?~~ → Stay on the form, every value kept, "wait N seconds" with N from the backend, no email, nothing changed (product v1.6 BR-ONB-08 / FR-ONB-003, decided by anh Đức). Resolved 2026-10-16.

- ~~Is the password kept on "Change phone"/"Change email"?~~ → Every field is kept (FR-ONB-009 "every field as the user left it"). Resolved 2026-10-14.
- ~~Does `PENDING_REGISTRATION_EXPIRED` refill the fields?~~ → Yes, all fields (FR-ONB-010). Resolved 2026-10-14.
- ~~What happens when a signed-in user opens `/signup`?~~ → Redirect to the home page (product §3.6). Resolved 2026-10-14.
- ~~Captcha / rate limit on the SvelteKit server?~~ → Not done on the website; the backend limits by the visitor IP that the website forwards (backend login v2.2 AC34). Resolved 2026-10-14.
- ~~"Single source" for the terms (BR-ONB-11)?~~ → The website's `/terms` and `/privacy` pages are the source; the app opens those pages (presentation is per platform). Claude's proposal, approved by anh Đức via this PR; iOS/Android follow the same source. Resolved 2026-10-14.
