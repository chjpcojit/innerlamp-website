# Changelog — deity Spec

Tracks version history for `requirements.md`, `design.md`, and `tasks.md` in this folder. All three
files share one changelog since they change together as one spec unit. Newest version first.

## v1.1 (2026-10-15)

- `requirements.md`: translated to English per the repo Language policy; no requirement, design or task change. AC numbering, IDs, keys and `⚠️ Not confirmed` markers unchanged; quoted UI copy keeps its Vietnamese text with an English gloss.
- `design.md`: translated to English per the repo Language policy; no requirement, design or task change.
- `tasks.md`: translated to English per the repo Language policy; no requirement, design or task change.
- Product spec / contract: unchanged (product v1.0; openapi @ a8a016b; backend deity v3.0 @ 9794992).
- Hand-offs: none.
- Reason: Translated to English per the repo Language policy; no requirement, design or task change.

## v1.0 (initial) (2026-10-15)

- `requirements.md`: first spec of the feature on the website. Retroactive for the running part (featured block of 6 entries on `/` and `/library`, catalogue `/library/buddhas` with `?type=` / `?page=`, URL normalisation, past the end → last page, page `/library/buddhas/[id]` — code read 2026-10-15), prospective for the new part of product v1.0. Header `Product spec` @ v1.0, `Contract` openapi @ a8a016b + backend deity `requirements.md` v3.0 (9794992) for what is not yet in openapi (page of 12, `next_via`, `via_events`, `date` / `INVALID_DATE`), `Implements` every ID whose Website column is not `n/a`. 28 EARS criteria, each tagged `FR-DTY-*` / `BR-DTY-*` / `NFR-DTY-*` or `(platform)`; the Error → UI table has a "Current code state" column.
- `design.md`: new — Layers & components table, the deity page "Block order" table (FR-DTY-005), navigation, Step-by-step Flow for the catalogue (normalise → read page) and the deity page (deity ∥ related sutras → countdown in the browser → mala `?deity=`), share (Web Share → clipboard), i18n add/change/delete table.
- `tasks.md`: new — 6 Phases; `[x]` only for parts checked in code and matching product. No vector task for BR-DTY-06 (the backend chooses `next_via`); the BR-CAL-13 countdown vector runs in the `calendar` spec.
- Product spec / contract: adopt product v1.0 (§4.2 Website column; §3.6 rows FR-DTY-001, FR-DTY-002, FR-DTY-009, §2.4). Contract openapi @ a8a016b; the v3.0 part follows the backend deity spec, pending openapi.
- Drift from product (for `ba-writer` to see in the Website column): the Chư Thiên (Devas) label is "Thiên hộ pháp" (Dharma-protector deva) (BR-DTY-01); feast days (ngày vía) are lunar only from `lunar_memorial_days`, no next feast day, no countdown, no "Lịch lễ" (Ceremony calendar), cards have no feast-day line (BR-DTY-05, BR-DTY-06, FR-DTY-002, FR-DTY-006); catalogue card shows `pure_land`; block order and mantra card differ from the prototype (FR-DTY-005); great vows (đại nguyện) all shown, biography not collapsed (BR-DTY-07, FR-DTY-005); no related sutras yet (`listDeitySutras` unused) (FR-DTY-007); no mala (tràng hạt) / share yet (FR-DTY-008, FR-DTY-009); the featured block shows 6 **sample** entries when the backend fails, the failed catalogue shows only one line of text without "Thử lại" (Try again) (FR-DTY-010); footer note missing (BR-DTY-08). No drift: page of 12 / pagination (the website reads `page_size`), filtering, past the end → last page, 6 featured (§3.6).
- Still open: `⚠️ Not confirmed (product)` — leap-month feast day on the card (AC 2); empty state of the featured block (AC 3); whether an empty filter uses `buddhasEmpty` (AC 9); whether the shared error screen satisfies FR-DTY-004 (AC 14); related sutras order (AC 21, same question as backend v3.0); link in the shared content (AC 24, Appendix A item 3). `⚠️ Not confirmed` (website) — "today" for `next_via` when the server does not know the device date (AC 17); mala parameter `?deity=` or `?text=` (AC 23); the actions block when there is no mantra card (design).
- Hand-offs: `ba-writer` — the six product questions above; Website column status in §4.2 (FR-DTY-004 actually already has "Thử lại" (Try again); BR-DTY-08 lacks the footer note). Backend — bring deity v3.0 into `openapi.yaml` (page of 12, `next_via`, `via_events`, `date`, `INVALID_DATE`). `calendar` spec (website) — shared `countdown()` and opening `/events` to guests.
- Platform decisions: read via `load`, no `/api/*` endpoint added; related sutras called in parallel, failure only hides the block; countdown in the browser after mount; mala accepts `?deity=` (pending approval); new code in `src/lib/features/deity/`.
- Old docs (`.assumptions.md` lines 12, 13, 23) left as is, cleaned up in a later step (tasks Phase 6).
- Reason: product spec deity v1.0 (2026-10-15) and backend deity spec v3.0.
