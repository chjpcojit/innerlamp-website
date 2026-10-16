# Tasks — onboarding (Website sign-up)

Version: 1.7
Last updated: 2026-10-17
Status: in-progress (drift) — mirrors `requirements.md`.

> See `changelog.md` in this folder for the version history of this spec.

`[x]` = verified in code (2026-10-14 for the carried-over items, 2026-10-16 for the items ticked in v1.2). Everything else is `[ ]`.

## Phase 1 — Pure logic + vectors

- [x] `features/auth/validation.ts`: `checkPassword` (characters after NFC, 8–64), used by `SignupForm` and the forgot-password form (AC4).
- [ ] `features/auth/validation.ts`: `checkPhone`, `checkEmail`, `checkNames` (AC3, AC4).
- [x] `features/auth/data.ts`: `COUNTRIES` is exactly the 12 countries of BR-ONB-04 (China removed, Malaysia added) (AC3).
- [ ] `features/auth/data.ts`: per-country digit counts of BR-ONB-04 (AC3).
- [ ] Script `scripts/sync-onboarding-vectors.*` copies `docs/product/onboarding/rules/*.json` from innerlamp-be (default `../innerlamp-be`) into `tests/vectors/onboarding/` with the source commit; tests read the pinned copy, never edited by hand (same way as the memorial calendar).
- [ ] `validation.spec.ts` runs the four vector files (AC19).

## Phase 2 — Server

- [x] `types/auth.ts`: `RegisterRequest` has `phone_country` + national `phone_number` (AC7).
- [ ] `types/temple.ts`: `address` optional (AC14).
- [x] `server/api/auth.ts`: `requestRegisterOtp`, `resendRegisterOtp(email)` → `register/resend-otp`, `verifyRegisterOtp(email, code)`.
- [x] `signup/+page.server.ts` `request`: requires `phone_country` and passes `phone_country` + `phone_number` to `requestRegisterOtp` (AC7).
- [ ] `signup/+page.server.ts`: `load` blocks users with a session (AC2); three actions per Steps 1–4; echo fields except the password; `PENDING_REGISTRATION_EXPIRED` back to step 1 (AC13); temple suggestion without a required `address` (AC14).
- [x] Do not put the password in the returned payload (`request` returns only `phone`, `resendAfter`, `expiresIn`, `suggestion`) — keep when editing (AC18).
- [x] The temple suggestion is sent after the account is created, an error does not break sign-up (`verify`) — keep (AC14).
- [x] `X-InnerLamp-Client-IP` forwarded on every backend request in `handleFetch` (`src/hooks.server.ts`; design in `../login/design.md`).

## Phase 3 — UI

- [ ] `SignupForm.svelte`: full name ≥ 1 char; dharma name empty by default; password by characters; per-field errors (`fieldOf`) (AC4, AC9).
- [x] `PhoneField.svelte` / `SignupForm.svelte`: bindable `national` + `iso` posted as hidden `phone_number` + `phone_country`, not E.164 (AC7).
- [ ] `PhoneField.svelte` / `CountryPicker.svelte`: validate per country (AC3).
- [ ] `SignupOtp.svelte`: show the email; "Change email"; lock the input until `locked_until` on `OTP_LOCKED`; emphasise resend on expiry; show the unlock time in local time for `OTP_LOCKED` / `OTP_SEND_LIMITED` (AC11, AC12, AC16) — still open: the unlock time is not shown yet.
- [x] `SignupOtp.svelte` has an `errorContext` prop and `SignupForm.svelte` passes `errorContext(form)` (wait/unlock data reaches the message).
- [x] Both timers (expiry / resend) come from the response, reset after resend, `retry_after_seconds` on `OTP_RESEND_TOO_SOON` (`SignupOtp.svelte`) — keep (AC11).
- [ ] `AddTempleForm.svelte`: street address optional (AC14).
- [x] `errors.ts`: `RATE_LIMITED` (`auth_err_rate_limited_wait` / `auth_err_rate_limited`), `REGISTRATION_IN_PROGRESS`, `EMAIL_SEND_FAILED`, `INVALID_DEVICE` / `INVALID_API_KEY` → generic; `EMAIL_TAKEN` removed; `ErrorContext` + `errorContext(data)` (Error → UI table, AC10, AC17).
- [ ] `errors.ts`: `fieldOf(code)` code → field mapping.
- [x] `verify` action: on `PHONE_TAKEN` / `INVALID_TEMPLE` return the failure without `step: 'otp'`, so the form is shown with its fields kept and the error above the submit button (AC21; step 1 uses the same box for `PHONE_TAKEN`).
- [x] `REGISTRATION_IN_PROGRESS` copy (AC20, product v1.6): `auth_err_registration_in_progress_wait({seconds})` ("Vui lòng chờ {seconds} giây rồi thử lại") shown when `retry_after_seconds` is present, the existing `auth_err_registration_in_progress` (no number) only as the fallback; vi + en; `errors.ts` reads `retryAfter` for this code. The fallback key keeps the old text.
- [x] i18n: `country_my` (replaces `country_cn`), `auth_err_rate_limited`, `auth_err_rate_limited_wait`, `auth_err_registration_in_progress`, `auth_err_email_send_failed` in vi + en; `auth_err_email_taken` removed.
- [ ] i18n remaining: `signup_otp_subtitle` about email, `signup_otp_change_email` replacing `signup_otp_change_phone`, `signup_email_note` without the donation-receipt wording (vi + en).

## Phase 4 — Tests

- [ ] `tests/signup.e2e.ts`: email sign-up against the dev backend (dev code), an existing email looks like a new one, duplicate phone, change email keeps fields, expiry returns to step 1, `REGISTRATION_IN_PROGRESS` keeps fields.

## Phase 5 — Quality + docs

- [ ] `npm run check && npm run lint && npm run build` clean.
- [ ] Update the Website column of product §4.2 when done (tell `ba-writer`).
- [x] Delete `Docs/specs/features/register/` in the old-docs cleanup (2026-10-15).
