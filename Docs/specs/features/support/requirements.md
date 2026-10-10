# Requirements — Support InnerLamp

Version: 1.0
Last updated: 2026-10-10
Status: in-progress — UI prototype exists; payment (VietQR), confirmation and storage not built, several rules unconfirmed

> See `changelog.md` in this folder for the version history of this spec.

Written retroactively from the running prototype and `SRS.md` (same folder, IEEE 29148). Business detail,
Gherkin scenarios and the full list of open questions live in `SRS.md`; this file restates the contract
in EARS form for engineering. Requirement IDs (`FR-xxx`) match the SRS.
Route: `/support` (`/en/support`). Feature folder: `src/routes/(site)/support/`,
`src/lib/components/sections/Support*.svelte`, `src/lib/content/support.ts`.

## User Story

As a visitor (guest or member) who finds InnerLamp helpful, I want to give InnerLamp a one-time gift of
an amount I choose, so that the team can keep running and developing the site, without any plan,
subscription or recurring charge.

## Acceptance Criteria (EARS notation)

- **FR-001** — WHEN a visitor opens `/support`, THE SYSTEM SHALL state that InnerLamp is free for everyone
  with no ads and no paid plans, and list what gifts are used for.
- **FR-002** — WHEN a visitor is choosing a gift, THE SYSTEM SHALL offer 20,000đ, 50,000đ, 100,000đ,
  200,000đ and 500,000đ plus an "Other" option, with 50,000đ preselected, and reveal a digits-only
  amount field when "Other" is selected.
- **FR-003** — WHEN a visitor submits with an amount below 10,000đ (including empty), THE SYSTEM SHALL
  show the minimum-amount message and SHALL NOT start a payment.
  > ⚠️ Not confirmed: Is there an upper limit for the typed amount, and what is shown above it — blocks
  > server-side validation and the "very large amount" scenario.
- **FR-004** — WHEN a visitor gives, THE SYSTEM SHALL allow an optional message and SHALL NOT require it.
  > ⚠️ Not confirmed: Maximum message length and any filtering/review — blocks the length limit and storage sizing.
- **FR-005** — WHEN a visitor turns on anonymous giving, THE SYSTEM SHALL record the gift as anonymous
  so no name is shown in the team's views of gifts.
  > ⚠️ Not confirmed: What the toggle changes for a guest, who has no name on file (the form has no name field).
- **FR-006** — WHEN a visitor submits a valid gift, THE SYSTEM SHALL create a pending gift and show a
  VietQR code with the amount and a unique transfer reference pre-filled, plus the receiving account
  details with copy actions. IF the gift cannot be started, THEN THE SYSTEM SHALL show an error, keep
  the entered amount and message, and record nothing as received.
  > ⚠️ Not confirmed: Receiving bank account, owning legal entity and reconciliation provider — blocks FR-006 to FR-008.
- **FR-007** — WHEN the payment for a pending gift is confirmed as received, THE SYSTEM SHALL show the
  thank-you screen with the amount and a one-time/no-further-charge note; THE SYSTEM SHALL NOT show it
  before confirmation.
  > ⚠️ Not confirmed: What the visitor sees after reloading or returning while a payment is pending — blocks resume behavior.
  > ⚠️ Not confirmed: Behavior for under- or over-payment — blocks reconciliation rules.
- **FR-008** — WHEN a payment is not received in time, fails, or is cancelled by the visitor, THE SYSTEM
  SHALL say so, offer to start again, and SHALL NOT record the gift as received.
  > ⚠️ Not confirmed: How long a payment instruction stays valid before it is treated as not received — blocks the timeout value.
- **FR-009** — WHEN a visitor submits the same gift repeatedly in quick succession, THE SYSTEM SHALL start
  only one pending gift.
- **FR-010** — WHEN a visitor chooses "Ủng hộ thêm lần khác" on the thank-you screen, THE SYSTEM SHALL
  return to the form with the default amount and an empty message.
- **FR-011** — THE SYSTEM SHALL let a guest give without logging in and SHALL treat a member's gift the
  same way.
  > ⚠️ Not confirmed: Whether a member's gift is linked to their account and whether they can see their own history — blocks the data model.
- **FR-012** — THE SYSTEM SHALL link to `/support` from the profile card and the site footer.
- **FR-013** — THE SYSTEM SHALL NOT create recurring charges, auto-renewals, saved payment credentials or
  reminders to give again.
- **FR-014** — THE SYSTEM SHALL NOT list a gift to InnerLamp in the merit book (`/merit`) or count it in
  merit totals.
- **FR-015** — THE SYSTEM SHALL NOT present paid plans, trials or a "Sen Vàng" tier in any user-facing text.
- WHEN the page renders, THE SYSTEM SHALL take all copy from `messages/{vi,en}.json` and never show raw
  backend error text.
- WHEN a gift is created or confirmed, THE SYSTEM SHALL NOT expose backend URLs, API keys or user tokens
  to browser code.

## Out of scope

- Paid plans, subscriptions, trials, premium gating; any recurring charge.
- Temple offerings (`/offer`) and the merit book (`/merit`).
- Public donor / thank-you list; email, SMS, receipts, tax invoices.
- MoMo, ZaloPay and card payments (deferred).
- Refunds and mistaken-transfer handling (⚠️ see below).

## Pending / not yet built

- Everything behind the submit button: creating the pending gift, VietQR, status, confirmation (FR-006–FR-009).
- The prototype shows the thank-you immediately and still draws four payment-method chips; both contradict
  the requirements above.
- Awaiting-payment and problem states have no design yet.

## Open questions

> ⚠️ Not confirmed: Which bank account receives gifts, who owns it, and which reconciliation provider detects incoming transfers — blocks the backend contract and FR-006–FR-008.

> ⚠️ Not confirmed: Validity window of a payment instruction — blocks FR-008.

> ⚠️ Not confirmed: Upper limit for the typed amount — blocks FR-003.

> ⚠️ Not confirmed: Maximum message length and filtering — blocks FR-004.

> ⚠️ Not confirmed: Meaning of "anonymous" for a guest — blocks FR-005.

> ⚠️ Not confirmed: Link between a member's gift and their account, and gift history — blocks FR-011 and the data model.

> ⚠️ Not confirmed: Reload/return while a payment is pending — blocks FR-007.

> ⚠️ Not confirmed: Under- or over-payment — blocks FR-007.

> ⚠️ Not confirmed: Refund / mistaken-transfer policy — blocks operations.

> ⚠️ Not confirmed: Retention period and deletion of gift records and messages — blocks the data model and privacy notice.

> ⚠️ Not confirmed: Rate-limit and abuse rules for creating pending gifts — blocks security design.

> ⚠️ Not confirmed: Backend API contract for creating/reading gifts and receiving confirmation — blocks `design.md` Steps 1–3.

> ⚠️ Not confirmed: Design for awaiting-payment, not-received and QR-only layouts — blocks Phase 2 UI.

> ⚠️ Not confirmed: Quantified performance and payment-status latency targets — blocks NFR sign-off.

## Open questions (resolved)

| Question | Resolution | Date |
| --- | --- | --- |
| Language of the spec set | English; older specs in other languages to be updated later by the owner | 2026-10-10 |
| Suggested amounts and "Other" | Chips up to 500,000đ plus an "Other" option to type an amount | 2026-10-10 |
| Storage and visibility | Stored privately server-side; no public thank-you list | 2026-10-10 |
| Who may give | Guests and members, no login required | 2026-10-10 |
| Confirmation | Thank-you screen only; no email/SMS | 2026-10-10 |
| Merit book | Not shown there; kept separate | 2026-10-10 |
| Incomplete payment | Thank-you only after confirmed payment; otherwise clear message and retry | 2026-10-10 |
| "Sen Vàng" name | Dropped; only "Ủng hộ InnerLamp" | 2026-10-10 |
| Payment method for now | VietQR bank transfer only; MoMo, ZaloPay, card deferred | 2026-10-10 |
