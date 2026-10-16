# Design — onboarding (Website sign-up)

Version: 1.7
Last updated: 2026-10-17
Status: in-progress (drift) — mirrors `requirements.md`.

> See `changelog.md` in this folder for the version history of this spec.

## Overview

Keep the architecture of the current `/signup`: one page, two steps inside the same `+page.svelte`,
three form actions (`request`, `resend`, `verify`) calling the backend through `$lib/server/api/auth.ts`;
session cookies are set by `$lib/server/auth/session.ts` (as in `../login/`). Main changes: the
identity of a registration attempt is the **email** (replacing the phone), the phone is sent as
`phone_country` + national digits, the validation rules follow product v1.2, the temple suggestion no
longer requires a street address, and a `load` blocks signed-in users.

Phone sending (changed 2026-10-16): `PhoneField` exposes bindable `national` (the digits after
`normalizePhone`, trunk `0` stripped) and `iso` (the chosen country); `SignupForm` posts them as hidden
fields `phone_number` and `phone_country`. The site no longer assembles E.164 for the request. The
backend expects the national number without `+` or country code (see the contract in `requirements.md`).

Every backend request carries `X-InnerLamp-Client-IP`, added in `handleFetch` of `src/hooks.server.ts`
(see `../login/design.md`, "Headers sent to the backend").

## Layers & components

| Layer          | File                                                                         | Responsibility                                                                                                                                                                                                                                                                                                                                                                                                                              | Status                                                                             |
| -------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Route (UI)     | `src/routes/(auth)/signup/+page.svelte`                                      | `<svelte:head>`, renders `SignupForm`                                                                                                                                                                                                                                                                                                                                                                                                       | exists, unchanged                                                                  |
| Route (server) | `src/routes/(auth)/signup/+page.server.ts`                                   | `load`: session → 303 `/`. Actions `request` / `resend` / `verify` keyed by email; echo fields (except password) on error; send the temple suggestion after `verify`. `request` requires `phone_country` and passes `phone_country` + `phone_number` to `requestRegisterOtp`                                                                                                                                                                | partly done (phone fields); `load` guard and temple `address` optional still to do |
| Feature UI     | `src/lib/features/auth/components/SignupForm.svelte`                         | Full name (required, ≥ 1 char), dharma name (optional, empty), email, password (8–64 chars), per-field errors; posts hidden `phone_number` = `national` and `phone_country` = `iso`; passes `errorContext` to errors and to `SignupOtp`                                                                                                                                                                                                     | partly done (phone posting, `errorContext`)                                        |
| Feature UI     | `src/lib/features/auth/components/PhoneField.svelte`, `CountryPicker.svelte` | Choose a country from the 12-country table; bindable `national` and `iso`; per-country digit validation                                                                                                                                                                                                                                                                                                                                     | partly done (`national`/`iso`); per-country validation still to do                 |
| Feature UI     | `src/lib/features/auth/components/SignupOtp.svelte`                          | Shows the email; two timers from the response; "Change email"; locks the input on `OTP_LOCKED`; emphasises resend on expiry; `errorContext` prop for the wait/unlock data                                                                                                                                                                                                                                                                   | partly done (`errorContext` prop); rest to do                                      |
| Feature UI     | `src/lib/features/auth/components/AddTempleForm.svelte`                      | Province, ward required from the list; street address optional                                                                                                                                                                                                                                                                                                                                                                              | to change                                                                          |
| Feature logic  | `src/lib/features/auth/data.ts`                                              | `COUNTRIES` = the 12 countries of BR-ONB-04 (`VN`, `US`, `JP`, `KR`, `TH`, `SG`, `MY`, `TW`, `AU`, `DE`, `FR`, `CA`; China removed, Malaysia added)                                                                                                                                                                                                                                                                                         | list done; per-country digit counts to do                                          |
| Feature logic  | `src/lib/features/auth/validation.ts`                                        | Pure functions `checkPhone(country, typed)`, `checkEmail`, `checkPassword` (count characters after NFC), `checkNames` — used by the UI and the vector tests                                                                                                                                                                                                                                                                                 | not created                                                                        |
| Feature logic  | `src/lib/features/auth/errors.ts`                                            | Error code → Paraglide key via `authErrorMessage(code, ctx)`; `ErrorContext` (`lockedUntil`, `retryAfter`) and `errorContext(data)` read from an action result; `RATE_LIMITED` (`auth_err_rate_limited_wait` with `{seconds}`, fallback `auth_err_rate_limited`), `REGISTRATION_IN_PROGRESS`, `EMAIL_SEND_FAILED`; `INVALID_DEVICE` and `INVALID_API_KEY` → `auth_err_generic`; `EMAIL_TAKEN` removed; code → field mapping `fieldOf(code)` | mapping done; `fieldOf` to do                                                      |
| API resource   | `src/lib/server/api/auth.ts`                                                 | `requestRegisterOtp(body)`, `resendRegisterOtp(email)` → `register/resend-otp`, `verifyRegisterOtp(email, code)`                                                                                                                                                                                                                                                                                                                            | done                                                                               |
| Types          | `src/lib/types/auth.ts`                                                      | `RegisterRequest` has `email`, `phone_country`, `phone_number` (national, as typed — no `+`, no country code)                                                                                                                                                                                                                                                                                                                               | done                                                                               |
| Types          | `src/lib/types/temple.ts`                                                    | `TempleSuggestionRequest.address` optional                                                                                                                                                                                                                                                                                                                                                                                                  | to verify/change                                                                   |
| i18n           | `messages/vi.json`, `messages/en.json`                                       | `country_my` (replaces `country_cn`); `auth_err_rate_limited`, `auth_err_rate_limited_wait`, `auth_err_registration_in_progress`, `auth_err_email_send_failed`; `auth_err_email_taken` removed; still to do: `signup_otp_subtitle` about email, `signup_otp_change_email` replacing `signup_otp_change_phone`, `signup_email_note` without the donation-receipt wording                                                                     | partly done                                                                        |
| Tests          | `src/lib/features/auth/validation.spec.ts`, `tests/signup.e2e.ts`            | Product vectors (AC19); two-step E2E against the dev backend (dev code)                                                                                                                                                                                                                                                                                                                                                                     | not created                                                                        |

## Route & navigation flow

```
/signup  (load: session → 303 /)
  ├─ ?/request ✓ ──▶ code step (same page)
  │    ├─ REGISTRATION_IN_PROGRESS ──▶ stay on step 1, fields kept, "wait N seconds" from retry_after_seconds (AC20)
  │    ├─ verify PHONE_TAKEN / INVALID_TEMPLE ──▶ back to step 1, fields kept, error at the field (AC21)
  │    ├─ ?/resend ✓ ──▶ reset both timers
  │    ├─ ?/verify ✓ ──▶ session cookies ──▶ (temple suggestion) ──▶ 303 localizeHref('/')
  │    ├─ "Change email" ──▶ step 1, fields kept
  │    └─ PENDING_REGISTRATION_EXPIRED ──▶ step 1, fields kept
  └─ "already have an account" link ──▶ /login
```

## Step-by-step Flow — Sign-up

```
Step 1 — Submit the form (this feature)
- Trigger: the visitor submits a valid step 1 form.
- Pre-condition: no session (load already blocks).
- Where: `+page.server.ts` action `request`.
- API: POST /v1/auth/register/request-otp {email, password, phone_country, phone_number, full_name, dharma_name?, ordination_temple_id?}
    - phone_country = ISO of the chosen country; phone_number = national digits after normalizePhone (trunk 0 stripped), no "+" and no country code.
    - Success → return {step:'otp', email, expiresIn, resendAfter, fields (no password), suggestion?}
    - Failure → fail(status, {error, field, retryAfter?, lockedUntil?, fields}) — stay on step 1. REGISTRATION_IN_PROGRESS is one such failure (AC20).

Step 2 — Resend (optional, repeatable)
- Where: action `resend`. API: POST /v1/auth/register/resend-otp {email}
    - Success → new timers. Failure PENDING_REGISTRATION_EXPIRED → back to step 1 (Step 1 fields); otherwise stay on the code step.

Step 3 — Verify the code (this feature)
- Where: action `verify`. API: POST /v1/auth/register/verify-otp {email, otp_code}
    - Success → startSession(cookies, session) (login design) → Step 4.
    - Failure → fail(..., {step:'otp', ...}); PENDING_REGISTRATION_EXPIRED → back to step 1.

Step 4 — Temple suggestion (best effort, only when present)
- API: POST /v1/temple-suggestions {name, province_code, ward_code, address?}
    - Any result → 303 localizeHref('/'). Errors are only logged.
```

The password travels only in Step 1; the other fields (except the password) are echoed through the
action result so the form is kept when returning to step 1. After returning to step 1 the password
field still holds its value because component state is not destroyed (same page); a page reload loses
it (AC15).

## Session & cookies

Uses `startSession` from `../login/design.md` (cookies `il_token`, `il_refresh`, `il_name`).

## Deliberately stubbed for now

- The backend has not yet shipped the new contract (backend onboarding `tasks.md`), and the updated
  `openapi.yaml` is an uncommitted backend working-tree change as of 2026-10-16: the website can be
  built first but is only testable against the backend once the backend is done; E2E (Phase 4) runs after that.
