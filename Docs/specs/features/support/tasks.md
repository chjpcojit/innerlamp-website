# Tasks — Support InnerLamp

Version: 1.0
Last updated: 2026-10-10
Status: in-progress — Phase 1 done, Phase 2–5 pending (Phase 3 blocked on the backend contract)

> See `changelog.md` in this folder for the version history of this spec.

`[x]` only for items verified to exist in the code on 2026-10-10.

## Phase 1 — Prototype UI (done)

- [x] Route `/support` with meta (`sup_meta_title`, `sup_meta_description`) and header
- [x] `SupportForm`: preset chips, "Other" field, min-amount check, message, anonymous toggle, local thank-you
- [x] `SupportUses` dark card
- [x] `content/support.ts` (amounts, min amount, uses) and `sup_*` messages in vi and en
- [x] Profile card ("Ủng hộ InnerLamp") and footer link point to `/support`
- [x] Breadcrumb for `/support`

## Phase 2 — Align UI with confirmed requirements (pending)

- [ ] `SupportFlow` state class (`choose | pay | done | problem`), replacing local state in `SupportForm`
- [ ] Remove immediate thank-you from `SupportForm`; show it only from `SupportDone` on confirmed payment (FR-007)
- [ ] Remove payment-method chips and `SUPPORT_PAYMENTS` / `sup_pay_*` once design confirms QR-only *(waits ⚠️ design)*
- [ ] `SupportPay`: QR, account details with copy, waiting indicator, cancel (FR-006, FR-008)
- [ ] `SupportProblem`: not received / failed / cancelled with retry (FR-008) *(waits ⚠️ design)*
- [ ] `SupportDone`: amount + one-time note + "give again" (FR-007, FR-010)
- [ ] Disable submit while a create is in flight (FR-009)
- [ ] Keep amount and message when starting a gift fails (FR-006)
- [ ] Add `sup_*` messages for pay/problem states in both locales

## Phase 3 — Backend integration (blocked on contract)

- [ ] Types in `$lib/types/support.ts` *(waits ⚠️ contract)*
- [ ] `$lib/server/api/support.ts`: `createGift`, `getGift` *(waits ⚠️ contract)*
- [ ] `+page.server.ts` action `create` with server-side validation incl. upper limit *(waits ⚠️ limit)*
- [ ] `api/support/[id]/+server.ts` status endpoint and polling in `SupportFlow`
- [ ] Wire validity window / expiry into the `pay` state *(waits ⚠️ window)*
- [ ] Pass the user token when the visitor is a member *(waits ⚠️ account linking)*
- [ ] Document any new env values in `.env.example`

## Phase 4 — Boundaries & copy

- [ ] Search copy and code for "Sen Vàng", "premium", "trial" in vi/en; rename `pf_premium_*` keys to `pf_support_*` (FR-015)
- [ ] Verify the merit book neither lists nor totals gifts (FR-014)
- [ ] Verify no recurring/saved-credential wording or behavior (FR-013)

## Phase 5 — Tests & verification

- [ ] Unit: amount parsing and min validation (extract parser to `$lib/utils/money.ts`)
- [ ] E2E (Playwright, stubbed backend): choose/validate, pay → confirmed → thank-you, not received, cancel, double submit, guest and member
- [ ] `npm run check && npm run lint && npm run build` pass *(currently fail on unrelated `signup`/`PhoneField` and `Docs/` Prettier)*

## Phase 6 — Security & operations

- [ ] Rate limit on gift creation *(waits ⚠️ rules)*
- [ ] Idempotent confirmation and duplicate-notification handling (backend, confirm with BE)
- [ ] Retention/deletion policy and privacy notice update *(waits ⚠️ retention)*
- [ ] Refund / mistaken-transfer procedure *(waits ⚠️ policy)*
