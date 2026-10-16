# Changelog — onboarding Spec

Tracks version history for `requirements.md`, `design.md`, and `tasks.md` in this folder. All three
files share one changelog since they change together as one spec unit. Newest version first.

## v1.7 (2026-10-17)

- `requirements.md`, `design.md`: version only — no requirement or design change.
- `tasks.md`: ticked `[x]` after reading the code (the sign-up screens themselves were not exercised in a browser this round): `checkPassword` (`validation.ts`, characters after NFC) used by `SignupForm`; `verify` action returns `PHONE_TAKEN` / `INVALID_TEMPLE` without `step: 'otp'` (AC21); `auth_err_registration_in_progress_wait({seconds})` and `errors.ts` reading `retryAfter` (AC20); unlock time for `OTP_LOCKED` / `OTP_SEND_LIMITED` now reaches the message through `errorContext`. Split the `validation.ts` task so only `checkPassword` is ticked.
- Product spec / contract: unchanged (v1.7, 2.1.1).
- Hand-offs: none.
- Reason: implementation PR for login v2.2 / onboarding v1.6.

## v1.6 (2026-10-17)

- `requirements.md`: header cites product onboarding v1.7. AC21 now tagged BR-ONB-08, FR-ONB-005, FR-ONB-004 (decided by anh Đức: back to step 1, every value kept, error at the related field, no account created); the `⚠️ Not confirmed (product)` is removed and the question moved to resolved.
- `design.md`, `tasks.md`: version only; the `verify` action task (return to step 1, AC21) stays `[ ]` — the code still keeps `step: 'otp'`.
- Product spec / contract: product v1.6 → v1.7; contract 2.1.1 unchanged.
- Hand-offs: none open.
- Reason: BE session message of 2026-10-17 (product v1.7).

## v1.5 (2026-10-16)

- `requirements.md`: new AC21 — `verify-otp` can return `PHONE_TAKEN` or `INVALID_TEMPLE` (backend onboarding AC18); no account exists yet, so the site returns to step 1 with fields kept and the error at the field. Error → UI `PHONE_TAKEN` row notes it. `⚠️ Not confirmed (product)`: FR-ONB-005 / FR-ONB-004 cover only step 1.
- `design.md`: navigation flow line for the step-2 refusals. `tasks.md`: `verify` action task (code today keeps `step: 'otp'`, not ticked).
- Product spec / contract: unchanged (v1.6, 2.1.1).
- Hand-offs: product (`ba-writer`) — screen for `PHONE_TAKEN` / `INVALID_TEMPLE` at the code step. Backend — none.
- Reason: comparison of this spec with backend onboarding v8.4 and login v2.5.

## v1.4 (2026-10-16)

- `requirements.md`: header cites product onboarding v1.6 (BR-ONB-08 corrected, FR-ONB-003 gains two scenarios) and `openapi.yaml` 2.1.1. AC20 rewritten: on `REGISTRATION_IN_PROGRESS` the visitor stays on step 1 with every value kept, sees the wait with N from `retry_after_seconds` (never chosen by the site), no email, the pending registration and old code unchanged and still usable, identical for emails with and without an account; the same details submitted again open the code step with a new code (AC7). Removed both `⚠️ Not confirmed (product)` notes; the question moved to resolved.
- `design.md`: flow diagram line for `REGISTRATION_IN_PROGRESS` mentions the wait from `retry_after_seconds`.
- `tasks.md`: added the copy task (`auth_err_registration_in_progress_wait({seconds})`, fallback key without a number, `errors.ts` reads `retryAfter`); today's vi text does not match the product wording. No tick changed.
- Product spec / contract: product v1.5 → v1.6; contract 2.1.1.
- Hand-offs: backend — none. Product (`ba-writer`) — none open.
- Reason: BE session message of 2026-10-16 (anh Đức's decision, product v1.6).

## v1.3 (2026-10-16)

- `requirements.md`: header now cites product onboarding v1.5 (matrix only, no requirement changed) and `openapi.yaml` 2.1.1 (was unpinned). Data & API gains one note: per-IP budgets are shared by route group and the code cycle is four codes (first plus three resends); the screens' behavior and the Error → UI table do not change. Pending notes that nothing has run against a real backend server yet.
- `design.md`, `tasks.md`: version only — no design or task change.
- Product spec / contract: product v1.2 → v1.5; contract unpinned → 2.1.1.
- Hand-offs: backend — none open. Product (`ba-writer`) — the `REGISTRATION_IN_PROGRESS` copy question (v1.2) is still open.
- Reason: BE session message of 2026-10-16 (openapi 2.1.1, product v1.5).

## v1.2 (2026-10-16)

- `requirements.md`: rewritten in English (Language policy). Phone is now sent as `phone_country` + national `phone_number` (digits after `normalizePhone`, trunk `0` stripped; no `+`, no country code) (AC7). New AC20 tagged `(platform)` for `REGISTRATION_IN_PROGRESS` (409; fields kept, neutral wait message) — existing AC numbers unchanged. Error → UI table: removed `EMAIL_TAKEN`, added `REGISTRATION_IN_PROGRESS`, `RATE_LIMITED` now `auth_err_rate_limited_wait` with fallback `auth_err_rate_limited`, `EMAIL_SEND_FAILED` has its own key `auth_err_email_send_failed`, `INVALID_DEVICE` / `INVALID_API_KEY` map to `auth_err_generic`. `Contract:` header now cites innerlamp-be `docs/specs/api/openapi.yaml` (uncommitted backend working-tree change as of 2026-10-16, version not pinned). Added "Open assumptions" (site sends digits after `normalizePhone`, backend accepts) and a `⚠️ Not confirmed (product)` for the `REGISTRATION_IN_PROGRESS` copy. Still open: `OTP_LOCKED` / `OTP_SEND_LIMITED` do not show the unlock time yet.
- `design.md`: rewritten in English. Layers table updated to the code of 2026-10-16: `PhoneField` bindable `national` / `iso`, `SignupForm` hidden `phone_number` / `phone_country`, `COUNTRIES` with Malaysia instead of China, `errors.ts` (`ErrorContext`, `errorContext(data)`, new codes), `SignupOtp` `errorContext` prop, `RegisterRequest.phone_country`, i18n `country_my` / `auth_err_*`. Step 1 describes the new phone payload and `REGISTRATION_IN_PROGRESS`. References `X-InnerLamp-Client-IP` (`handleFetch`) to `../login/design.md`.
- `tasks.md`: rewritten in English. Verified in code and ticked `[x]`: 12-country `COUNTRIES`, `RegisterRequest`, `server/api/auth.ts`, `request` action phone fields, phone posting in `PhoneField` / `SignupForm`, `SignupOtp` `errorContext`, `errors.ts` mapping, i18n `country_my` / `auth_err_*`, `X-InnerLamp-Client-IP` forwarding. Split mixed tasks so only the verified part is ticked; still `[ ]`: per-country digit counts, `fieldOf`, unlock time for `OTP_LOCKED` / `OTP_SEND_LIMITED`, remaining i18n (`signup_otp_change_email` etc.), `validation.ts`, `load` guard, temple `address` optional, tests.
- Product spec / contract: product spec unchanged (v1.2); contract moved from the backend spec @ v8.0 to `openapi.yaml` (unpinned).
- Hand-offs: backend — commit and pin the `openapi.yaml` version that carries the phone, `REGISTRATION_IN_PROGRESS` and `EMAIL_SEND_FAILED` changes. Product (`ba-writer`) — copy for `REGISTRATION_IN_PROGRESS` (product §3 says a new submission replaces the pending registration; the backend now returns 409 for a different payload while the code is still valid).
- Reason: code read of 2026-10-16 (phone fields, `errors.ts`, `COUNTRIES`, hooks) plus backend facts confirmed in the BE session of 2026-10-16.

## v1.1 (2026-10-15)

- Old-docs cleanup: deleted `Docs/specs/features/register/` (phone + SMS spec) after all four platform specs were approved; `tasks.md` Phase 5 ticks this item. Removed the two bullets "Logged-in detection" and "Mock login" in `.assumptions.md` (the website now has a real login with httpOnly cookies). `requirements.md`/`design.md` unchanged apart from the version.

## v1.0 (initial) (2026-10-14)

- `requirements.md`: created from product onboarding v1.2 (ADR-0003): email sign-up with a code by email, phone sent as `phone_country` + the typed number, validation per BR-ONB-04…07 (password counted in characters, 12 countries), an existing email looks like a new one, "Change email", expiry returns to step 1 keeping fields, temple suggestion without a required street address, a signed-in user opening `/signup` goes to the home page. AC1–AC19 tagged with product IDs.
- `design.md`: created — keeps the two-step `/signup` architecture and three actions; Step-by-step Flow 1–4; the Layers table marks the files to change.
- `tasks.md`: created — 5 Phases; `[x]` only for what was verified in code and still holds (no password echo, temple suggestion sent after the account is created, timers from the response).
- Replaces `../register/` v1.2 (phone + SMS) — that folder is deleted in the old-docs cleanup.
- Hand-offs: backend — limit by the website visitor's IP (backend login v2.2 AC34, same batch). Product — none.
- Reason: anh Đức dropped SMS (2026-10-14); product onboarding v1.2, backend onboarding v8.0.
