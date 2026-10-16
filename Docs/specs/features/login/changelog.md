# Changelog — Login Spec

Tracks version history for `requirements.md`, `design.md`, and `tasks.md` in this folder. All three
files share one changelog since they change together as one spec unit. Newest version first.

## v2.3 (2026-10-17)

- `requirements.md`: removed the User-Agent `⚠️` (forwarded now); status and Pending rewritten. No criterion changed.
- `design.md`: Layers table rewritten to the code: `handleFetch` does `401` → refresh → retry and forwards the IP and User-Agent (no `apiAuthed` wrapper), `handleSessionEnded` + `locals.sessionEnded`, `refresh.ts` (`refreshSession`), forgot-password route and form, `otp-timers.svelte.ts`, `redirect.ts`, `validation.ts`. Session-ended Step 3 notes that POST / `/api/*` do not show `SESSION_ENDED` yet.
- `tasks.md`: ticked `[x]` after reading the code and running it against a mock backend: login `load` / `redirect`, notices, password clearing, single-flight refresh, session-ended hook, forgot-password pages and API, User-Agent forwarding, i18n. Still `[ ]`: unit specs (no test runner), `SignupOtp` timers refactor, `SESSION_ENDED` for POST, e2e, quality gate.
- Product spec / contract: unchanged (v1.4, 2.1.1).
- Hand-offs: none. Not run against a real backend server.
- Reason: implementation PR for login v2.2 / onboarding v1.6.

## v2.2 (2026-10-16)

- `requirements.md`: header now cites product login v1.4 (matrix only, no requirement changed) and `openapi.yaml` 2.1.1 (BE correction: `device.platform` is optional in the backend, `device_model` is required; the site still sends `"web"`). Removed the `⚠️` about `password-reset/*` and `X-InnerLamp-Client-IP` (both are in the contract); moved to resolved. AC8 adds `503 SERVICE_UNAVAILABLE` (keep the session, `auth_err_generic`) and states that a revoked session returns `401` before the token expires. AC13 uses `expires_in_seconds` / `resend_after_seconds` and the site's own `forgot_sent` text; AC14 notes that a repeat call is the resend and the cycle is four codes; AC15 says no token is returned, so the visitor is sent to `/login?reason=password_changed` and not signed in; AC16 adds that the reset revokes every session and lifts `LOGIN_LOCKED`; AC19 adds the trust conditions of the header and shared route-group budgets. Data & API table marks both reset operations as in the contract. Error → UI gains `OTP_EXPIRED` on confirm (also for an email without an account) and `503`.
- `design.md`: Step-by-step Flows for session ended (503 branch, revoked-session `401`) and forgot password (response fields, error codes, no auto sign-in) updated; "provisional" notes removed; header trust rule cited.
- `tasks.md`: added the `503` task and detail to the forgot-password pages and e2e tasks. No tick changed (nothing re-verified in code this round).
- Product spec / contract: product login v1.2 → v1.4; contract unpinned → `openapi.yaml` 2.1.1.
- Hand-offs: backend — none open (the contract matches what the spec needs); not yet run against a real backend server. Product (`ba-writer`) — none.
- Reason: BE session message of 2026-10-16 (final summary of openapi 2.1.1) and a read of the contract.

## v2.1 (2026-10-16)

- `requirements.md`: rewritten in English (Language policy). AC5 and AC18 now name the Paraglide keys and their fallbacks (`auth_err_login_locked_until` / `auth_err_login_locked`, `auth_err_rate_limited_wait` / `auth_err_rate_limited`); AC19 split into client IP (done) and User-Agent (pending, `⚠️`). Error → UI table gains `VALIDATION_ERROR`, `REGISTRATION_IN_PROGRESS`, `EMAIL_SEND_FAILED`; `INVALID_CREDENTIALS` notes the uniform case. `Contract:` now cites `openapi.yaml` as an uncommitted backend working-tree change, version not pinned. `⚠️` added: `password-reset/*` and `X-InnerLamp-Client-IP` not found in `openapi.yaml` paths; `OTP_LOCKED` / `OTP_SEND_LIMITED` copy shows no unlock time. Open question "how to pass the client IP" resolved.
- `design.md`: rewritten in English. The client IP is set by the `handleFetch` hook for every request to `API_BASE_URL`, replacing the plan to pass it per call through `apiCall`; added `errors.ts` / `action.ts` rows and per-row status (done / partly done / not created); User-Agent forwarding stays open.
- `tasks.md`: rewritten in English. Ticked `[x]` after reading the code: login with `email` + `device` (types, API), `LoginForm` email field / no SMS button / forgot link / disabled submit, unlock time from `locked_until`, `handleFetch` client IP, `errors.ts` mappings and `authFail` `lockedUntil`. Left `[ ]`: `load` + `safeRedirect`, password clearing and notices, User-Agent forwarding, `SESSION_ENDED`, i18n for session/forgot keys, everything in Phases 2, 3, 5, 6 not already ticked.
- Product spec / contract: product login v1.2 unchanged; contract moved to `openapi.yaml` (uncommitted backend working tree, 2026-10-16, no version pin).
- Hand-offs: backend — commit and pin the `openapi.yaml` version; confirm `password-reset/*` paths and the `X-InnerLamp-Client-IP` header in it. Product (`ba-writer`) — none.
- Reason: code changes of 2026-10-16 (`handleFetch`, `errors.ts` context, `authFail`) and backend confirmation of login, lockout, rate-limit and `INVALID_API_KEY` behavior; files rewritten in English as they were edited.

## v2.0 (2026-10-14)

- `requirements.md`: rewritten to follow product login v1.2 (ADR-0003): email sign-in replaces phone; SMS-code button removed; unlock time from `locked_until`; safe `redirect`; single-flight refresh; `401` → refresh → retry; session end sends the user to `/login?reason=session_ended`; new `/forgot-password` page (AC12–AC16); forwarding of the visitor's IP and User-Agent (AC19). Added the `Product spec` / `Contract` / `Implements` header; AC1–AC19 tagged with product IDs. The v1.1 section "Security — FE↔BE cross-check" was folded into the ACs and tasks.
- `design.md`: added the `forgot-password` route, `ForgotPasswordForm`, `OtpTimers.svelte`, `redirect.ts`, `server/auth/refresh.ts`, `apiAuthed`, `sessionEnded`; Step-by-step Flows for session refresh / session ended and forgot password; cookie table (`il_name = dharma_name || full_name`); section on headers sent to the backend.
- `tasks.md`: rewritten as Phases 1–6; unfinished v1.1 tasks folded in; `[x]` only for what was verified in code (web device, TTL from `expires_in`, httpOnly tokens, sign-out).
- Hand-offs: backend — read `X-InnerLamp-Client-IP` when `x-api-key` is valid (backend login v2.2 AC34, same batch). Product — none.
- Reason: anh Đức dropped SMS (2026-10-14); product login v1.2, backend login v2.1.

## v1.1 (2026-10-10)

- `requirements.md`: added the section "Security — FE↔BE cross-check" (10 points confirmed by the backend + FE/BE work needed); moved 2 questions to "resolved" (grace window: none; `expires_in`: present); updated the `API_KEY` production `⚠️` to "waiting on backend".
- `design.md`: added the section "Session security"; Steps 1–2 keep their structure, with the added requirement to forward the User-Agent and single-flight.
- `tasks.md`: added Phase 5 — Security (7 FE items, 1 item waiting on the backend). No `[x]` item changed.
- Reason: cross-checking with the backend session (which read the real backend code) showed the refresh race has no grace window and the TTL was hard-coded, so the FE needed fixing.

## v1.0 (2026-10-10)

- `requirements.md`: rewritten in EARS from the running code; added a "Current code state" column to the error table; fixed deviations from the old spec: the mock login was removed, the password is not cleared after an error, the SMS OTP button and the "Forgot?" link were shown but had no behavior, `locked_until` was unused, the 401→refresh→retry mechanism was not implemented.
- `design.md`: created — real layer/file table, navigation, 3-step Step-by-step Flow (login → refresh in the hook → logout).
- `tasks.md`: created — Phase 1 marked `[x]` after checking files; Phases 2–4 still `[ ]`.
- Reason: the old spec was a single unversioned `requirements.md` that still mentioned mock code that had since been replaced by the real API; moved to the 3-file versioned set.
