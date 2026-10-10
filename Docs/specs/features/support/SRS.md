# Software Requirements Specification — Support InnerLamp

| Field | Value |
|---|---|
| Document type | Software Requirements Specification (SRS) — IEEE 29148-2018 |
| Feature | Support InnerLamp (`/support`, formerly "Sen Vàng") |
| Product | InnerLamp (website) |
| Version | 0.1 (draft) |
| Last updated | 2026-10-10 |
| Status | draft — payment provider and several edge cases not confirmed (see Appendix A) |
| Owner / author | InnerLamp web team (drafted with Claude Code) |
| Downstream handoff | `il-spec-writer` → `requirements.md` / `design.md` / `tasks.md` under `Docs/specs/features/support/` |

> Drafted retroactively. The page UI was built first from the `isPremium` block of
> `Docs/innerlamp-web-adaptation/project/InnerLamp Web App.dc.html`; this SRS records the confirmed
> business intent and marks everything the UI does not yet satisfy.

---

## 1. Introduction

### 1.1 Purpose

This document specifies the business requirements for the "Support InnerLamp" page, where visitors
may give InnerLamp a one-time, voluntary monetary gift. It is for the product owner, designers,
backend and web engineers, and QA, and it drives the engineering spec in this folder.

### 1.2 Scope

**In scope:**
- A public page where any visitor (guest or member) chooses an amount, optionally leaves a message and
  asks to give anonymously, and pays once by VietQR bank transfer.
- Showing a thank-you only after the payment is confirmed received.
- Storing each confirmed gift privately on the server.
- Entry points to the page (profile card, site footer).

**Out of scope:**
- Paid plans, subscriptions, trials, premium content gating ("Sen Vàng" as a paid tier is retired).
- Recurring or automatic charges of any kind.
- Offerings to temples (cúng dường) and the merit book (`/merit`).
- A public thank-you / donor list.
- Email or SMS confirmation, tax invoices or receipts.
- MoMo, ZaloPay and card payments (deferred; not for the first release).
- Refund handling (⚠️ see Appendix A).

### 1.3 Product overview

InnerLamp is a bilingual (Vietnamese-first) website for Buddhist practice: lunar calendar, events,
library, practice tools, temples, memorial book and merit book. Every feature is free for everyone.
The Support page is the single place where a visitor who finds InnerLamp helpful may contribute
towards running and developing it.

### 1.4 Definitions, acronyms, abbreviations

| Term | Definition |
|---|---|
| Gift / support | A one-time voluntary payment to InnerLamp itself ("ủng hộ"). |
| Offering | A payment to a temple ("cúng dường"); a different feature, see `/offer`. |
| Merit book | "Sổ công đức", `/merit`: the member's record of offerings to temples. |
| Guest | A visitor who is not logged in. |
| Member | A logged-in user. |
| VietQR | The Vietnamese interbank QR standard used to pre-fill a bank transfer. |
| Reconciliation | Matching an incoming bank transfer to a pending gift. |
| Pending gift | A gift the visitor has started but whose payment has not been confirmed. |
| Confirmed gift | A gift whose payment has been confirmed as received. |
| Thank-you screen | The "Cảm ơn tấm lòng của bạn" ("Thank you for your kindness") confirmation. |

### 1.5 References

- Design prototype: `Docs/innerlamp-web-adaptation/project/InnerLamp Web App.dc.html` (`isPremium`
  block; FAQ item "Ủng hộ InnerLamp có bị trừ tiền định kỳ không?").
- Implementation: `src/routes/(site)/support/+page.svelte`,
  `src/lib/components/sections/SupportForm.svelte`, `SupportUses.svelte`, `src/lib/content/support.ts`.
- Assumptions log: `.assumptions.md` ("Support / Sen Vàng").
- Project rules: `AGENTS.md` (i18n, server-only data layer).

### 1.6 Document organization

Section 2 describes the feature in context, section 3 lists interface, functional and non-functional
requirements with Gherkin acceptance criteria, section 4 maps traceability, and Appendix A tracks open
and resolved questions.

---

## 2. Overall description

### 2.1 Product perspective

This is a **replacement** of the earlier "Sen Vàng" paid-plan idea (a profile card reading "7-day free
trial"). The page and its entry points already exist in the website as a front-end prototype with no
payment behavior: pressing the button currently shows the thank-you immediately and sends nothing.
That behavior does not satisfy this SRS (see FR-007).

Per the project architecture the browser talks only to the SvelteKit server, which talks to the
backend API. Payment creation and payment confirmation are therefore backend responsibilities, and a
payment/reconciliation provider is an external dependency.

### 2.2 Product functions

- Explain that InnerLamp is free and what gifts are used for (`FR-001`).
- Choose and validate an amount (`FR-002`, `FR-003`).
- Add an optional message and give anonymously (`FR-004`, `FR-005`).
- Pay once by VietQR and see instructions (`FR-006`).
- Confirm payment, or handle pending/failed/cancelled payment (`FR-007`, `FR-008`, `FR-009`).
- Give again (`FR-010`).
- Be reachable by guests and members from the profile card and footer (`FR-011`, `FR-012`).
- Stay strictly one-time, separate from the merit book, and free of paid-plan wording
  (`FR-013`, `FR-014`, `FR-015`).

### 2.3 User classes and characteristics

| Actor | Description | Characteristics / permissions |
|---|---|---|
| Guest | Visitor without an account | May view the page and give; no login required. |
| Member | Logged-in user | Same as guest; the gift may be associated with the account (⚠️ unconfirmed). |
| InnerLamp team | Staff running the product | Sees stored gifts privately; no public exposure. |

### 2.4 Operating environment

- Platform: modern desktop and mobile web browsers, responsive from narrow phone width up.
- Locales: Vietnamese (base) and English.
- Network: online required (payment cannot be completed offline).

### 2.5 Design and implementation constraints

- Svelte 5 runes, SvelteKit server, Tailwind; Paraglide messages for all user-facing text (no
  hardcoded copy), per `AGENTS.md`.
- Browser never calls the backend or payment provider directly with secrets; all calls via the
  SvelteKit server.
- No payment credentials, card data or account secrets are stored or handled by the website.
- Visual design follows the prototype (`isPremium`). The prototype shows four payment-method chips;
  with QR only for the first release this part of the design must be updated (⚠️ Appendix A).

### 2.6 User documentation

**N/A** — the page is self-explanatory; the FAQ already answers the recurring-charge question.

### 2.7 Assumptions and dependencies

- **Assumptions:**
  - Amounts are in Vietnamese đồng (VND) only.
  - One gift is one payment; there is no cart or batch.
  - "Anonymous" concerns only visibility to the team's reports and any future display, not
    legal/banking identity (⚠️ semantics unconfirmed, FR-005).
- **Dependencies:**
  - A backend capability to create a pending gift, expose a payment reference/QR, and receive
    payment confirmation (not yet existing, contract unconfirmed).
  - A bank account to receive gifts and an automatic reconciliation provider (⚠️ unconfirmed; the
    legal entity that owns the account is also unconfirmed).
  - Existing profile card and footer components as entry points.

---

## 3. Specific requirements

### 3.1 External interface requirements

#### 3.1.1 User interfaces

One page, `/support` (`/en/support`), reached from the profile card and the footer. Contents:
a header (lotus mark, eyebrow, headline, short description), a gift card, and a dark card listing what
gifts are used for. The gift card moves through four visible states: choosing, awaiting payment
(QR and transfer details), thank-you, and a payment problem state (not received, failed, cancelled).
Layout and tokens follow the Design System; the awaiting-payment and problem states are **not yet
designed**.

> ⚠️ Not confirmed: Who designs the awaiting-payment, expired/failed and QR-only layouts — blocks
> FR-006 and FR-008 visual acceptance.

#### 3.1.2 Hardware interfaces

**N/A** — a website page with no custom hardware interface.

#### 3.1.3 Software interfaces

The SvelteKit server calls the InnerLamp backend to (a) create a pending gift and obtain its payment
instructions, (b) read the gift's payment status, and, on the backend side, (c) receive payment
confirmation from the reconciliation provider.

> ⚠️ Not confirmed: The backend contract (operations, fields, error cases) and the reconciliation
> provider — blocks FR-006, FR-007, FR-008 and the engineering design.

#### 3.1.4 Communication interfaces

HTTPS only. The existing site-to-backend authentication applies (site API key; user token when the
visitor is a member). The browser never receives secrets.

### 3.2 Functional requirements

#### Understanding the page

**FR-001 — Explain free access and use of gifts**
- **Priority:** Must
- **Description:** WHEN a visitor opens the Support page THE SYSTEM SHALL state that InnerLamp is
  free for everyone with no ads and no paid plans, and list what gifts are used for.
- **Verification method:** manual QA (vi and en), UI test
- **Source:** Design prototype `isPremium`; user brief "no longer sell or subscribe".
- **Acceptance criteria:**
  ```gherkin
  Scenario: A guest reads the page
    Given a visitor who is not logged in
    When the visitor opens the Support page
    Then the page says InnerLamp is free for everyone with no ads and no paid plans
    And the page lists what gifts are used for

  Scenario: The page in English
    Given a visitor whose language is English
    When the visitor opens the Support page
    Then all headings, buttons and notes are in English
    And amounts use English digit grouping
  ```

#### Amount, message and anonymity

**FR-002 — Choose an amount**
- **Priority:** Must
- **Description:** WHEN a visitor is choosing a gift THE SYSTEM SHALL offer the suggested amounts
  20,000đ, 50,000đ, 100,000đ, 200,000đ and 500,000đ plus an "Other" option, with 50,000đ preselected.
- **Verification method:** UI test
- **Source:** User answer ("maximum displayed 500,000 plus an Other option"); prototype.
- **Acceptance criteria:**
  ```gherkin
  Scenario: Default amount
    Given a visitor opens the Support page
    Then 50,000đ is selected
    And the main button reads "Ủng hộ 50.000đ một lần" (Give 50,000đ once)

  Scenario: Pick a suggested amount
    Given a visitor is choosing a gift
    When the visitor selects 200,000đ
    Then 200,000đ is selected
    And the main button shows 200,000đ

  Scenario: Enter another amount
    Given a visitor is choosing a gift
    When the visitor selects "Other"
    Then a field appears to type an amount
    And only digits are accepted and shown with digit grouping
  ```

**FR-003 — Validate the amount**
- **Priority:** Must
- **Description:** WHEN a visitor submits a gift THE SYSTEM SHALL require an amount of at least
  10,000đ and otherwise explain the minimum without starting a payment.
- **Verification method:** unit test, UI test
- **Source:** Prototype (10,000đ minimum); bank processing constraint.
- **Acceptance criteria:**
  ```gherkin
  Scenario Outline: Amount below the minimum is refused
    Given a visitor has selected "Other"
    When the visitor enters "<amount>" and submits
    Then a message says the amount must be 10,000đ or more
    And no payment is started

    Examples:
      | amount |
      |        |
      | 0      |
      | 9,999  |

  Scenario: The minimum is accepted
    Given a visitor has selected "Other"
    When the visitor enters "10,000" and submits
    Then payment instructions for 10,000đ are shown

  @not-confirmed
  Scenario: A very large custom amount
    Given a visitor has selected "Other"
    When the visitor enters an amount above the largest allowed gift
    Then the outcome is not yet defined
  ```
  > ⚠️ Not confirmed: Is there an upper limit for the typed amount, and what is shown above it — blocks
  > the last scenario and server-side validation.

**FR-004 — Optional message**
- **Priority:** Should
- **Description:** WHEN a visitor gives THE SYSTEM SHALL allow an optional message to the InnerLamp
  team and SHALL NOT require it.
- **Verification method:** UI test
- **Source:** Prototype ("Lời nhắn (không bắt buộc)").
- **Acceptance criteria:**
  ```gherkin
  Scenario: Give without a message
    Given a visitor has a valid amount
    And the message is empty
    When the visitor submits
    Then payment instructions are shown

  @not-confirmed
  Scenario: A very long message
    Given a visitor has a valid amount
    When the visitor enters a message longer than the allowed length
    Then the outcome is not yet defined
  ```
  > ⚠️ Not confirmed: Maximum message length and whether messages are filtered or reviewed — blocks
  > the last scenario and data sizing.

**FR-005 — Give anonymously**
- **Priority:** Should
- **Description:** WHEN a visitor turns on anonymous giving THE SYSTEM SHALL record the gift as
  anonymous so the giver's name is not shown in the team's views of gifts.
- **Verification method:** manual QA, code review
- **Source:** Prototype ("Ủng hộ ẩn danh"); resolved: no public donor list.
- **Acceptance criteria:**
  ```gherkin
  Scenario: A member gives anonymously
    Given a logged-in member
    And anonymous giving is on
    When the gift is confirmed
    Then the stored gift is marked anonymous and shows no name

  @not-confirmed
  Scenario: A guest turns on anonymous giving
    Given a visitor who is not logged in
    When the visitor turns on anonymous giving and the gift is confirmed
    Then the observable difference from not turning it on is not yet defined
  ```
  > ⚠️ Not confirmed: What the toggle changes for a guest, who has no name on file — blocks the last
  > scenario (the form has no name field).

#### Paying

**FR-006 — Pay once by VietQR**
- **Priority:** Must
- **Description:** WHEN a visitor submits a valid gift THE SYSTEM SHALL create a pending gift and
  show a VietQR code with the amount and a unique transfer reference pre-filled, plus the receiving
  account details the visitor may copy.
- **Verification method:** UI test with a stubbed backend, manual QA with the real provider
- **Source:** User decision "use VietQR for now".
- **Acceptance criteria:**
  ```gherkin
  Scenario: Payment instructions are shown
    Given a visitor has chosen 100,000đ
    When the visitor submits
    Then a QR code is shown for 100,000đ
    And the receiving account details and a transfer reference are shown
    And the visitor can copy the account number and the reference

  Scenario: Each gift has its own reference
    Given two visitors each submit 100,000đ
    When both see their payment instructions
    Then the two transfer references are different

  Scenario: Payment cannot be started
    Given the payment service is unavailable
    When a visitor submits a valid gift
    Then an error says the gift could not be started and to try again
    And the entered amount and message are kept
    And nothing is recorded as received
  ```
  > ⚠️ Not confirmed: The receiving bank account, the entity that owns it, and the reconciliation
  > provider — blocks FR-006 and FR-007 entirely; the QR is currently only a placeholder elsewhere in
  > the site (`/offer`), not a real VietQR.

**FR-007 — Thank the giver only after payment is confirmed**
- **Priority:** Must
- **Description:** WHEN the payment for a pending gift is confirmed as received THE SYSTEM SHALL show
  the thank-you screen with the amount and state that no further charge will follow, and SHALL NOT show
  it before confirmation.
- **Verification method:** UI test with stubbed confirmation, manual QA
- **Source:** User decision; replaces the prototype, which thanks immediately.
- **Acceptance criteria:**
  ```gherkin
  Scenario: Payment is received
    Given a visitor is looking at payment instructions for 50,000đ
    When the payment is confirmed as received
    Then the thank-you screen shows 50,000đ
    And it says this is a one-time gift with no further charge

  Scenario: No thanks before confirmation
    Given a visitor is looking at payment instructions
    When the visitor has not yet paid
    Then the thank-you screen is not shown

  @not-confirmed
  Scenario: The visitor reloads or returns while waiting
    Given a visitor is looking at payment instructions
    When the visitor reloads the page or returns later
    Then what the visitor sees is not yet defined

  @not-confirmed
  Scenario: The amount received differs from the amount chosen
    Given a visitor chose 100,000đ
    When a different amount is received for that gift
    Then the outcome is not yet defined
  ```
  > ⚠️ Not confirmed: Whether a gift can be resumed after reload/return — blocks scenario 3.
  >
  > ⚠️ Not confirmed: Behavior for under- or over-payment — blocks scenario 4 and reconciliation rules.

**FR-008 — Handle payment that does not complete**
- **Priority:** Must
- **Description:** WHEN payment is not received in time, fails, or is cancelled by the visitor THE
  SYSTEM SHALL say so clearly, offer to try again, and SHALL NOT record the gift as received.
- **Verification method:** UI test with stubbed states, manual QA
- **Source:** User decision (confirmed 2026-10-10).
- **Acceptance criteria:**
  ```gherkin
  @not-confirmed
  Scenario: Payment is not received in time
    Given a visitor has been shown payment instructions
    When the waiting time ends without confirmation
    Then a message says the payment was not received and offers to start again
    And the thank-you screen is not shown

  Scenario: The visitor cancels
    Given a visitor is looking at payment instructions
    When the visitor chooses to go back
    Then the choosing form is shown again
    And the gift is not recorded as received

  Scenario: No network
    Given a visitor has no network connection
    When the visitor submits a valid gift
    Then a message says there is no connection and to try again
    And nothing is recorded as received
  ```
  > ⚠️ Not confirmed: How long a payment instruction stays valid before it is treated as not
  > received — blocks the first scenario and the reconciliation window.

**FR-009 — Prevent duplicate submission**
- **Priority:** Must
- **Description:** WHEN a visitor submits the same gift more than once in quick succession THE SYSTEM
  SHALL start only one pending gift.
- **Verification method:** UI test, manual QA
- **Source:** Edge case (repeated tap).
- **Acceptance criteria:**
  ```gherkin
  Scenario: Double tap on submit
    Given a visitor has a valid gift
    When the visitor taps the main button twice quickly
    Then only one set of payment instructions is created
  ```

**FR-010 — Give again**
- **Priority:** Could
- **Description:** WHEN a visitor chooses "Ủng hộ thêm lần khác" (Give again) on the thank-you screen
  THE SYSTEM SHALL return to the form with the default amount and an empty message.
- **Verification method:** UI test
- **Source:** Prototype.
- **Acceptance criteria:**
  ```gherkin
  Scenario: Give again
    Given a visitor sees the thank-you screen
    When the visitor chooses "Ủng hộ thêm lần khác" (Give again)
    Then the form is shown with 50,000đ selected
    And the message is empty
  ```

#### Access and entry points

**FR-011 — Open to guests and members**
- **Priority:** Must
- **Description:** THE SYSTEM SHALL let a guest give without logging in, and SHALL treat a member's
  gift the same way.
- **Verification method:** UI test (guest and member), manual QA
- **Source:** User decision (2026-10-10).
- **Acceptance criteria:**
  ```gherkin
  Scenario: A guest gives without an account
    Given a visitor who is not logged in
    When the visitor completes a gift
    Then no login is requested at any step

  @not-confirmed
  Scenario: A member's gift is linked to the account
    Given a logged-in member
    When the member completes a gift that is not anonymous
    Then whether the gift is associated with the account is not yet defined
  ```
  > ⚠️ Not confirmed: Whether a member's gift is linked to their account, and whether they can see
  > their own gift history — blocks the last scenario and the data model.

**FR-012 — Entry points**
- **Priority:** Should
- **Description:** THE SYSTEM SHALL link to the Support page from the profile card and from the
  site footer.
- **Verification method:** UI test
- **Source:** Prototype (profile card, footer link).
- **Acceptance criteria:**
  ```gherkin
  Scenario: From the profile card
    Given a logged-in member on the profile page
    When the member selects the "Ủng hộ InnerLamp" (Support InnerLamp) card
    Then the Support page opens

  Scenario: From the footer
    Given a visitor on any page
    When the visitor selects "Ủng hộ InnerLamp" in the footer
    Then the Support page opens
  ```

#### Boundaries of the feature

**FR-013 — Strictly one-time**
- **Priority:** Must
- **Description:** THE SYSTEM SHALL NOT create recurring charges, auto-renewals, saved payment
  credentials or reminders to give again.
- **Verification method:** code review, manual QA
- **Source:** Prototype FAQ; user brief.
- **Acceptance criteria:**
  ```gherkin
  Scenario: No recurring commitment
    Given a visitor has given once
    When any time passes
    Then no further charge or reminder to give is created
    And the page states the gift is one-time only
  ```

**FR-014 — Separate from the merit book**
- **Priority:** Must
- **Description:** THE SYSTEM SHALL NOT list a gift to InnerLamp in the merit book or count it in
  merit totals.
- **Verification method:** UI test, manual QA
- **Source:** User decision (2026-10-10).
- **Acceptance criteria:**
  ```gherkin
  Scenario: A gift does not appear in the merit book
    Given a member has a confirmed gift to InnerLamp
    When the member opens the merit book
    Then the gift is not listed
    And the merit totals do not include it
  ```

**FR-015 — No paid-plan wording**
- **Priority:** Must
- **Description:** THE SYSTEM SHALL NOT present InnerLamp as having paid plans, trials or a "Sen
  Vàng" tier in any user-facing text.
- **Verification method:** manual QA (search copy in vi and en), code review
- **Source:** User decision (2026-10-10).
- **Acceptance criteria:**
  ```gherkin
  Scenario: No plan language remains
    Given the website in Vietnamese or English
    When a visitor reads the profile, support and footer areas
    Then none of them mention a paid plan, a trial, or "Sen Vàng"
  ```

### 3.3 Performance requirements

- **NFR-001 — Page load:** the Support page is interactive on a mid-range phone on a typical mobile
  connection within a target that is not yet set.

  > ⚠️ Not confirmed: Quantified load and payment-status latency targets — blocks NFR sign-off.

- **NFR-002 — Payment status feedback:** after the transfer is made, the visitor sees the result
  without manually refreshing the page.

  > ⚠️ Not confirmed: Acceptable delay between transfer and the thank-you — depends on the
  > reconciliation provider.

### 3.4 Logical database requirements

- Each gift is stored **server-side only**, privately (no public exposure): amount, status
  (pending / confirmed / expired or cancelled), creation and confirmation time, payment reference,
  optional message, and an anonymous flag.
- Nothing about gifts is persisted in the browser.
- Pending gifts that never complete must not be counted as received.

> ⚠️ Not confirmed: Retention period, deletion on member account deletion, and whether the message is
> treated as personal data — blocks the data model and privacy notice.

### 3.5 Design constraints

- All user-facing text from `messages/{vi,en}.json` via Paraglide; keys kept in both locales.
- Only server-side code may call the backend; no secrets in the browser.
- Visual states follow the prototype and Design System tokens; new states need design input.
- Accessibility: choices are keyboard operable and announce their selected state; the thank-you and
  error messages are announced to assistive technology.

### 3.6 Software system attributes

- **Reliability:** a confirmed payment must never be lost or counted twice (idempotent confirmation);
  duplicate provider notifications must not create duplicate gifts.
- **Availability:** if the payment service is down the page still loads and explains the problem;
  the free features of InnerLamp are unaffected.
- **Security:** no card or bank credentials are collected; the receiving account details come from
  the server; the transfer reference cannot be guessed to confirm another visitor's gift; rate limiting
  on gift creation to limit abuse.

  > ⚠️ Not confirmed: Rate-limiting and abuse rules for creating pending gifts — blocks security design.

- **Maintainability:** copy and amounts live in content/message files, not in components.
- **Portability:** works in current evergreen browsers on desktop and mobile.

---

## 4. Verification & traceability

### 4.1 Verification approach

Unit tests for amount parsing and validation; UI tests (Playwright, `tests/`) against a stubbed
backend for the visible states; manual QA with the real provider before launch; code review and a
copy search for the "no plan wording" and "no recurring" rules.

### 4.2 Traceability matrix

| Requirement ID | Source | Design | Test |
|---|---|---|---|
| FR-001 | Prototype `isPremium`; user brief | → il-spec-writer | 2 scenarios |
| FR-002 | User answer; prototype | → il-spec-writer | 3 scenarios |
| FR-003 | Prototype; bank constraint | → il-spec-writer | 3 scenarios (1 not confirmed) |
| FR-004 | Prototype | → il-spec-writer | 2 scenarios (1 not confirmed) |
| FR-005 | Prototype; resolved Q2 | → il-spec-writer | 2 scenarios (1 not confirmed) |
| FR-006 | User decision (VietQR) | → il-spec-writer | 3 scenarios |
| FR-007 | User decision | → il-spec-writer | 4 scenarios (2 not confirmed) |
| FR-008 | User decision | → il-spec-writer | 3 scenarios (1 not confirmed) |
| FR-009 | Edge case | → il-spec-writer | 1 scenario |
| FR-010 | Prototype | → il-spec-writer | 1 scenario |
| FR-011 | User decision | → il-spec-writer | 2 scenarios (1 not confirmed) |
| FR-012 | Prototype | → il-spec-writer | 2 scenarios |
| FR-013 | Prototype FAQ; user brief | → il-spec-writer | 1 scenario |
| FR-014 | User decision | → il-spec-writer | 1 scenario |
| FR-015 | User decision | → il-spec-writer | 1 scenario |
| NFR-001 | Inferred | → il-spec-writer | TBD |
| NFR-002 | Inferred | → il-spec-writer | TBD |

---

## 5. Appendices

### Appendix A — Open questions

#### Open (unconfirmed)

> ⚠️ Not confirmed: Which bank account receives gifts, which legal entity owns it, and which
> reconciliation provider detects incoming transfers — blocks FR-006, FR-007, FR-008 and the
> backend contract.

> ⚠️ Not confirmed: How long a payment instruction stays valid before it is treated as not received —
> blocks FR-008 and reconciliation.

> ⚠️ Not confirmed: Upper limit for the typed ("Other") amount — blocks FR-003 and server validation.

> ⚠️ Not confirmed: Maximum message length and any filtering/review — blocks FR-004.

> ⚠️ Not confirmed: What anonymous giving changes for a guest with no name on file — blocks FR-005.

> ⚠️ Not confirmed: Whether a member's gift is linked to their account and whether they can see their
> own gift history — blocks FR-011 and the data model.

> ⚠️ Not confirmed: What the visitor sees after reloading or returning while a payment is pending —
> blocks FR-007.

> ⚠️ Not confirmed: Behavior for under- or over-payment — blocks FR-007 and reconciliation.

> ⚠️ Not confirmed: Refund or mistaken-transfer handling — blocks operations policy.

> ⚠️ Not confirmed: Retention period and deletion of gift records and messages — blocks §3.4 and the
> privacy notice.

> ⚠️ Not confirmed: Rate-limiting/abuse rules for creating pending gifts — blocks §3.6 security.

> ⚠️ Not confirmed: Backend API contract for creating and reading gifts and for payment
> confirmation — blocks §3.1.3 and the engineering design.

> ⚠️ Not confirmed: Design for the awaiting-payment, not-received and QR-only layouts (the four
> payment-method chips in the prototype no longer apply) — blocks §3.1.1.

> ⚠️ Not confirmed: Quantified performance and payment-status latency targets — blocks NFR-001, NFR-002.

#### Open questions (resolved)

| Question | Resolution | Date |
|---|---|---|
| Language of this SRS | English; existing specs in other languages to be updated later by the owner | 2026-10-10 |
| Suggested amounts and "Other" | Suggested chips up to 500,000đ plus an "Other" option to type an amount | 2026-10-10 |
| What happens to a gift after it is made | Stored privately server-side; no public thank-you list | 2026-10-10 |
| Who may give | Guests and members, no login required | 2026-10-10 |
| Thank-you / confirmation | Thank-you screen only; no email/SMS | 2026-10-10 |
| Show gift in merit book | No; kept separate | 2026-10-10 |
| Payment not completed | Show thank-you only after confirmed payment; otherwise clear message and retry | 2026-10-10 |
| "Sen Vàng" name | Dropped; only "Ủng hộ InnerLamp" | 2026-10-10 |
| Payment method for now | VietQR bank transfer only for the first release; MoMo, ZaloPay and card deferred | 2026-10-10 |
