# Design — Support InnerLamp

Version: 1.0
Last updated: 2026-10-10
Status: in-progress — UI prototype built; server/payment layers stubbed pending a backend contract

> See `changelog.md` in this folder for the version history of this spec.

## Overview

A single public page. The browser only talks to the SvelteKit server; the server talks to the backend
(`Browser → SvelteKit server → Backend API → reconciliation provider`), per `AGENTS.md`. The page walks a
small state machine — `choose → pay → done`, with a `problem` branch — held in one runes class, like
`OfferFlow` for `/offer`. Creating a gift is a **mutation** (form action); reading its status while the
visitor waits is a genuine interactive poll, routed through a SvelteKit `+server.ts` so the backend URL
and credentials stay server-side. Payment confirmation arrives at the backend (webhook), never at the
browser. All copy uses `sup_*` messages.

## Layers & components

| Layer | File | Responsibility | Status |
| --- | --- | --- | --- |
| Route (UI) | `src/routes/(site)/support/+page.svelte` | Meta + header + layout of the two cards | exists |
| Route (server) | `src/routes/(site)/support/+page.server.ts` | Form action `create`: validate, call API, return pending gift | **not created** |
| Status endpoint | `src/routes/api/support/[id]/+server.ts` | `GET` gift status for the polling UI | **not created** |
| Section | `src/lib/components/sections/SupportForm.svelte` | Choose amount, method, message, anonymous; submit | exists (prototype: thanks immediately, shows method chips) |
| Section | `src/lib/components/sections/SupportPay.svelte` | VietQR, account details, copy, waiting, cancel | **not created** |
| Section | `src/lib/components/sections/SupportDone.svelte` | Thank-you + "give again" | **not created** (inline in `SupportForm` today) |
| Section | `src/lib/components/sections/SupportProblem.svelte` | Not received / failed / cancelled, retry | **not created** |
| Section | `src/lib/components/sections/SupportUses.svelte` | "What gifts are used for" dark card | exists |
| State | `src/lib/state/support.svelte.ts` (`SupportFlow`) | Step, amount, message, anonymous, error, gift id, polling | **not created** (local `$state` in `SupportForm`) |
| Content | `src/lib/content/support.ts` | Amount presets, min amount, uses | exists |
| API resource | `src/lib/server/api/support.ts` | `createGift`, `getGift` (take `event.fetch` first) | **not created** |
| Types | `src/lib/types/support.ts` | Gift request/response DTOs | **not created** |
| Utils | `src/lib/utils/money.ts` | `formatVnd`; amount parsing helper | `formatVnd` exists; parser inline in components |
| Messages | `messages/{vi,en}.json` | `sup_*` keys, `pf_premium_*` card copy | exists (needs keys for pay/problem states) |
| Entry points | `ProfileLinks.svelte`, `SiteFooter.svelte` | Links to `/support` | exists |
| Breadcrumb | `src/lib/config/breadcrumbs.ts` | `/support` crumb | exists |

## Navigation flow

```
Profile card ─┐
Footer link ──┼──▶ /support
              │      ├─ choose ── submit ✓ ──▶ pay ── confirmed ──▶ done ── "give again" ──▶ choose
              │      │              ✗ (amount < min) stay, message
              │      │              ✗ (cannot start) stay, keep entries, error
              │      └─ pay ── cancel ──▶ choose
              │             ── not received / failed ──▶ problem ── retry ──▶ choose
```

## Step-by-step Flow — One-time gift

```
Step 1 — Create pending gift (this feature)
- Trigger: visitor submits the form with a valid amount
- Pre-condition: amount >= 10,000đ (client and server), message within limit (⚠️), no create in flight
- API: create gift on the backend (endpoint and fields ⚠️ not confirmed) — amount, message, anonymous flag,
  optional user token when the visitor is a member
    - Success → returns gift id, transfer reference, QR payload / account details, expiry; go to Step 2
    - Failure (validation) → stay on `choose`, field message
    - Failure (backend/network) → stay on `choose`, keep entries, generic error; nothing recorded

Step 2 — Wait for confirmation (this feature)
- Trigger: Step 1 success, `pay` state shown
- Pre-condition: gift id known
- API: read gift status through the SvelteKit status endpoint, polled (interval ⚠️ not confirmed)
    - Success (confirmed) → Step 4
    - Success (pending) → keep waiting
    - Failure (expired / failed) → `problem` state, retry offers a fresh Step 1
    - Failure (network) → keep waiting, show a soft "checking" notice, retry later

Step 3 — Confirm payment (backend / provider, out of this feature's scope)
- Trigger: the reconciliation provider reports an incoming transfer matching the reference
- Pre-condition: gift is pending and not expired
- Effect: backend marks the gift confirmed idempotently (duplicate notifications must not double count);
  under/over-payment rule ⚠️ not confirmed

Step 4 — Thank the giver (this feature)
- Trigger: Step 2 reports confirmed
- Effect: show `done` with the confirmed amount and the one-time note; stop polling
```

## Deliberately stubbed for now

- No backend contract exists, so `server/api/support.ts` and the form action are not written; the
  prototype's local "thanks immediately" behavior must be removed rather than shipped (it would claim a
  gift that was never paid).
- The QR must come from the backend; the placeholder pattern in `/offer` is **not** a real VietQR and must
  not be reused.
- Payment method chips (`sup_pay_*`, `SUPPORT_PAYMENTS`) stay in code until design confirms QR-only, then
  are removed.
- Resume-after-reload behavior is undecided; until it is, the design assumes the gift id lives only in
  component state.

## Confirmed design decisions

- Writes go through a form action; only status polling uses `+server.ts`, so the backend URL stays private.
- Thank-you is shown only on confirmed payment; nothing about gifts is stored in the browser.
- No recurring-charge or saved-credential concepts exist anywhere in the data model.
- Gifts are not merit-book entries; `merit.svelte.ts` and `/merit` are untouched.

## Security notes

- Transfer reference must be unguessable per gift so one visitor cannot confirm another's gift.
- Creating pending gifts needs rate limiting (⚠️ rules not confirmed) to limit abuse.
- Messages are user-controlled text: render escaped, never as HTML.
