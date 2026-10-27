# Changelog — lamp Spec

Tracks version history for `requirements.md`, `design.md`, and `tasks.md` in this folder. All three
files share one changelog since they change together as one spec unit. Newest version first.

## v1.1 (2026-10-27)

Code brought to the 2026-10-16 product decisions against contract innerlamp-be `docs/specs/api/openapi.yaml`
3.0.0 (backend PR #60: optional `recipient`, `recipient: null`, `is_mine`).

- `requirements.md`: `Contract:` 3.0.0; the contract `⚠️` block and the "planned 3.0.0" notes in Data & API
  are closed; AC 14 names the caption keys (`lamp_caption_for` / `lamp_caption_all`) instead of
  `lamp_recipient_all`; the Error → UI row for validation is now ✓; Pending lists only E2E, the manual
  check, the `login` gap and the English copy; the hide-name-on-relight item records the default the code
  applies (kept).
- `design.md`: layer statuses for 2026-10-27 (feature module, `LampCard`, `LampGuestIntro`, `GardenState`,
  `validation.ts`, `remaining.ts`, tests; `state/lamps.svelte.ts` deleted); `lamp_caption_all` added and
  `lamp_recipient_all` removed in the i18n table; Known gaps G1–G14, G17, G19 closed, G20 left for E2E;
  "Deliberately stubbed" keeps only the share action.
- `tasks.md`: Phases 1–3 done, Phase 4 done except E2E, Phase 5 quality line records the failures that
  exist on `main` already, Phase 6 assumptions cleanup done.
- Reason: contract 3.0.0 shipped (2026-10-27), which unblocked the Phase 3 tasks.

## v1.0 (initial — 2026-10-17)

Spec written retroactively for the part that exists in the code (route `/practice/lamp`, form,
ignition, confirmation, garden with filter and "load more", the backend calls) and prospectively for
the product decisions of 2026-10-16 (mixed mode), against product spec innerlamp-be
`docs/product/lamp/product.md` v1.0 and contract `docs/specs/api/openapi.yaml` 2.1.1.

- `requirements.md`: header with product spec, contract and the implemented IDs (BR-LMP-01, 02, 04–14,
  FR-LMP-001..014, NFR-LMP-03); 33 EARS criteria tagged by ID; Data & API; Error → UI mapping with the
  code status; the open `⚠️` items (contract 3.0.0 fields, share action, English copy, hide-name on
  relight, all-beings wording, the number in the limit message, anonymous label in English, session
  ended on POST).
- `design.md`: layers with the code status read on 2026-10-17, route flow, Step-by-step Flow for
  lighting (5 steps) and for the garden (3 steps), i18n key table, remaining-time rule, 22 Known gaps
  (G1–G22) between the code and the spec.
- `tasks.md`: six phases; `[x]` only for what was verified in the files on 2026-10-17; every change
  required by the product decisions is `[ ]`; tasks for installing Vitest, pinning the vector files and
  running `lamp-input-validation`, `lamp-remaining-label` and `lamp-lifetime`.
- Product spec / contract: product v1.0 adopted; `openapi.yaml` 2.1.1, with the planned 3.0.0 fields
  (`recipient: null`, optional request `recipient`, `is_mine`) recorded as not confirmed.
- Hand-offs: backend (contract 3.0.0, anonymous label shape), ba-writer (matrix rows for the website,
  share action, copy and wording questions), login spec (session ended on POST and `/api/*`) — listed in
  the report that accompanied this version.
- Reason: product spec `lamp` v1.0 was written (2026-10-16); the website had no platform spec for the
  feature and its notes in `.assumptions.md` were out of date.
