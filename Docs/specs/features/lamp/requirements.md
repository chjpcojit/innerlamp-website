# Requirements — lamp (Thắp đèn và Vườn đèn)

Version: 1.0
Last updated: 2026-10-17
Status: in-progress (drift) — the v1 flow is built and wired to the backend: form, ignition, confirmation, garden with filter chips, counts and "load more", and the limit / validation errors. The product decisions of 2026-10-16 are **not built**: guest view, hide-name switch, recipient notice, optional recipient, own-lamp mark from the backend, the remaining-time label, the empty state, the confirmation actions, removal of the temple card and the `/offer` link, and the shared-vector tests (`tasks.md` Phases 1–4). Part of it is blocked by the contract (`openapi.yaml` 3.0.0).
Feature folder: `src/lib/features/lamp/`, `src/routes/(site)/practice/lamp/`, `src/routes/api/lamps/`
Product spec: innerlamp-be `docs/product/lamp/product.md` @ v1.0
Contract: innerlamp-be `docs/specs/api/openapi.yaml` @ 2.1.1
Implements: BR-LMP-01, BR-LMP-02, BR-LMP-04, BR-LMP-05, BR-LMP-06, BR-LMP-07, BR-LMP-08, BR-LMP-09, BR-LMP-10, BR-LMP-11, BR-LMP-12, BR-LMP-13, BR-LMP-14, FR-LMP-001..014, NFR-LMP-03

> See `changelog.md` in this folder for the version history of this spec.

> ⚠️ Not confirmed: the v3.0.0 contract fields are not in `openapi.yaml` yet — `recipient` optional in the request and `recipient: null` in `Lamp` / garden items, and `is_mine` on garden items (planned for 3.0.0, backend spec `docs/specs/features/lamp/requirements.md` v2.0, AC 6, 25, 26) — blocks AC 8, 20, 22 and the Phase 3 tasks they trace to. This is a dependency on the backend, not a shape the website assumes.

This spec was written retroactively from the running code for the part that exists and prospectively for the 2026-10-16 changes (mixed mode), against product spec v1.0. Route: `/practice/lamp` (`/en/practice/lamp`), group `(site)`. The business rules (closed sets, durations, the limit, the recipient and prayer rules, the double-submission window, the lighter's name, what others see, order and counts, the remaining-time label, final lamps, sign-in) live in the product spec and are not restated here; this file says how the website applies them. Mobile-app entry points (center navigation button) and NFR-LMP-01/02 are not website work.

`BR-LMP-03` is `n/a` for the website in the product matrix (§4.2) although §3.2 lists the website as a display-only platform; the website only formats the server's end moment in the device time zone (AC 14, tagged FR-LMP-006 / NFR-LMP-03) and never computes it.

## User Story

As a signed-in user, I want to light a lamp for someone with a lamp type, an intention, an optional recipient, an optional prayer and a burn duration, and to browse the garden of everyone's lit lamps, so that my wish stays visible in the community for the days I chose. A guest sees a short introduction and a sign-in button.

## Acceptance Criteria (EARS notation)

### Entering the feature

1. WHEN a visitor chooses the lamp link in the site header, the mobile menu, the lamp tile of `/practice`, or the lamp button of the home celebration card, THE SYSTEM SHALL open `localizeHref('/practice/lamp')`. (FR-LMP-001)

### Guests and ended sessions

2. WHEN a guest opens `/practice/lamp`, THE SYSTEM SHALL show the introduction (`lamp_eyebrow`, `lamp_title`, `lamp_desc`) and the sign-in button `lamp_login` linking to `/login?redirect=<this page>`, and SHALL NOT render the form, the garden, any lamp or any count, and SHALL NOT call the backend. (FR-LMP-013, BR-LMP-14)
3. WHEN the `light` action runs without a session (no `locals.user` or no `il_token` cookie), THE SYSTEM SHALL answer `401` without calling the backend and show `lamp_err_auth`. (FR-LMP-013, BR-LMP-14)
4. WHEN the session has ended (refresh rejected, or a Bearer call still `401` after one refresh), THE SYSTEM SHALL behave as the `login` spec says (`Docs/specs/features/login/requirements.md`, AC 8–9: a page navigation goes to `/login?reason=session_ended&redirect=<page>`). Until that spec covers form actions (POST) and `/api/*` calls, the `light` action shows `lamp_err_auth` and the garden requests from the browser show `lamp_wall_error`. (FR-LMP-013, BR-LMP-14)

### The form

5. WHEN a signed-in visitor opens the page, THE SYSTEM SHALL show an unlit lamp and the form with oil lamp, Cầu an and 7 days preselected, the "Ẩn tên tôi" switch (`lamp_field_hide_name`) off, and the notice `lamp_recipient_notice` under the recipient field. (FR-LMP-002, BR-LMP-10)
6. WHEN the visitor chooses a lamp type, an intention or a burn duration, THE SYSTEM SHALL select only that option in its group; choosing a lamp type SHALL change the lamp artwork to that type. The offered options SHALL be exactly the closed sets of the product spec. (FR-LMP-002, BR-LMP-01, BR-LMP-02)
7. WHEN the visitor presses `lamp_light` with a recipient or prayer the shared validation rejects (after trimming and Unicode NFC normalization, counted in characters), THE SYSTEM SHALL NOT start the ignition and SHALL NOT call the backend, SHALL show `lamp_err_invalid` and keep every value. The `light` action SHALL apply the same validation again on the server. (FR-LMP-003, BR-LMP-01, BR-LMP-02, BR-LMP-06, BR-LMP-07)
8. WHEN the recipient is blank after trimming, THE SYSTEM SHALL send no recipient to the backend and SHALL NOT send localized text in its place; the lamp is then dedicated to all beings. (BR-LMP-06)
9. WHEN the hide-name switch is on, THE SYSTEM SHALL send `is_anonymous: true`; otherwise `false`. THE SYSTEM SHALL NOT send a lighter's name, an id or a time. (FR-LMP-003, BR-LMP-09)

### Lighting

10. WHEN the visitor presses `lamp_light` with valid values, THE SYSTEM SHALL submit the `light` action, which re-validates and calls `POST /v1/lamps` with the visitor's token, then:
    - on success: play the ignition, then show the confirmation (AC 14);
    - on failure: stay on the form with the unlit lamp, keep every value and show the message of the Error → UI table. (FR-LMP-003)
11. WHILE a lamp is being lit, THE SYSTEM SHALL ignore further submissions and disable the button. (FR-LMP-003, BR-LMP-08)
12. WHEN the backend answers `200` with the earlier identical lamp instead of `201` (a double submission), THE SYSTEM SHALL show that lamp as lit exactly like a new one. (FR-LMP-005, BR-LMP-08)
13. WHEN the backend refuses with `LAMP_LIMIT_REACHED`, THE SYSTEM SHALL add no lamp, show `lamp_err_limit` and keep every value. (FR-LMP-004, BR-LMP-05)
14. WHEN a lamp has been lit, THE SYSTEM SHALL show a confirmation with the lit artwork, the lamp type, the intention, the number of days, the recipient (or `lamp_recipient_all` when none), the prayer when there is one, and the end moment from the server's `end_at` as a date and time in the device time zone and locale; the website SHALL NOT compute the end moment from its own clock. The intention and the prayer are shown only here. (FR-LMP-003, FR-LMP-006, BR-LMP-10, NFR-LMP-03)
15. WHEN the confirmation is shown, THE SYSTEM SHALL offer exactly two actions, `lamp_again` and `lamp_to_garden`, and no temple-lamp, donation or payment control, and no link to `/offer`. (FR-LMP-003, FR-LMP-014)
16. WHEN the visitor chooses `lamp_again`, THE SYSTEM SHALL show an empty form with an unlit lamp, keeping the previous lamp type, intention and burn duration selected and clearing the recipient and the prayer. (FR-LMP-003)
17. WHEN the visitor chooses `lamp_to_garden`, THE SYSTEM SHALL bring the garden section into view on the same page. The form SHALL carry a way to reach the garden, and the garden a way back to the form (`lamp_to_form`). (FR-LMP-003, platform)
18. THE SYSTEM SHALL NOT offer to put out, edit, extend or relight a lamp, on a card or in the confirmation. (BR-LMP-13)

### Garden

19. WHEN a signed-in visitor opens the page, THE SYSTEM SHALL load the first unfiltered page of the garden in `load` (`GET /v1/lamps`) and show: the header `lamp_wall_count` with the total, the filter chips (`lamp_wall_all` and one per lamp type, each with its count), and one card per lamp in the order the backend returned — artwork, lamp type, lighter's name, recipient and remaining time. THE SYSTEM SHALL NOT show the intention or the prayer on any card, including the visitor's own, and SHALL NOT add sample lamps or a base number. (FR-LMP-007, FR-LMP-011, BR-LMP-10, BR-LMP-11)
20. WHEN a card shows the lighter, THE SYSTEM SHALL show the `lighter_name` the backend returned, as it is; WHEN it is missing or empty, `lamp_wall_anonymous`. THE SYSTEM SHALL NOT show or ask for the account's full name. (FR-LMP-007, BR-LMP-09)
21. WHEN a card has no recipient (`recipient: null`), THE SYSTEM SHALL show the all-beings text of the viewer's language (`lamp_to_all`). (FR-LMP-007, BR-LMP-06)
22. WHEN a garden item has `is_mine: true`, THE SYSTEM SHALL highlight the card and label it `lamp_wall_you` instead of the lighter's name, whatever the device; THE SYSTEM SHALL NOT remember lamp ids in browser storage to decide this. (FR-LMP-008, BR-LMP-10)
23. WHEN a card is rendered, THE SYSTEM SHALL label it from the item's `end_at` and the current time using the shared remaining-time rule: `lamp_remaining_days` with the number of days for 24 hours or more, `lamp_remaining_under_day` for less than 24 hours; a card whose remaining time is zero or negative SHALL NOT be rendered. The label is computed when the page or a page of lamps is rendered; there is no live countdown. (FR-LMP-007, FR-LMP-006, BR-LMP-12, BR-LMP-04)
24. WHEN the visitor chooses a chip, THE SYSTEM SHALL request the first page of that lamp type (or of every type for `lamp_wall_all`) through `GET /api/lamps`, replace the list, drop the previous cursor and keep the chosen chip pressed; WHILE a request is running it SHALL ignore a second chip press. (FR-LMP-009, BR-LMP-11)
25. WHEN the backend says more lamps exist, THE SYSTEM SHALL show `lamp_wall_more`; pressing it SHALL append the next page (cursor from the previous response) to the list without reordering it; WHEN there are no more lamps the action SHALL NOT be offered; WHILE a request is running a second press SHALL be ignored. (FR-LMP-010, BR-LMP-11)
26. THE SYSTEM SHALL take the header total and the chip counts from the most recent garden response, and SHALL NOT change them because a filter is chosen. (FR-LMP-011, BR-LMP-11)
27. WHEN the garden has no lit lamp at all, THE SYSTEM SHALL show `lamp_wall_empty_title`, `lamp_wall_empty_body` and a button `lamp_to_form` that takes the visitor to the form; WHEN only the chosen type has none, THE SYSTEM SHALL show an empty list with the chips and counts unchanged. (FR-LMP-012, FR-LMP-009)
28. WHEN the first garden load fails, THE SYSTEM SHALL show `lamp_wall_error` in the garden section and keep the form available; WHEN a filter or "load more" request fails, THE SYSTEM SHALL keep the lamps already shown and show `lamp_wall_error`. (FR-LMP-012)

### Platform

29. THE SYSTEM SHALL call the backend only from the SvelteKit server (`load`, the `light` action, `GET /api/lamps`) through `$lib/server/api/lamps.ts`, with the token from the httpOnly cookie, and SHALL NOT put the token, the backend URL or the API key into the page data or browser JS. (platform)
30. THE SYSTEM SHALL keep no copy of lamps in browser storage (no `localStorage`, `sessionStorage` or IndexedDB entry for lamps), and SHALL NOT show or pretend a lamp when the server cannot be reached. (platform)
31. THE SYSTEM SHALL NOT write the recipient or the prayer to logs, error messages or error pages; error handling uses status and error code only. (platform)
32. THE SYSTEM SHALL render every visible string, `alt`/`aria-label` and the page `<title>` and description from Paraglide keys present in both `messages/vi.json` and `messages/en.json`. (platform)
33. THE SYSTEM SHALL pass, in unit tests, every case of the shared vectors `rules/lamp-input-validation.json`, `rules/lamp-remaining-label.json` and `rules/lamp-lifetime.json` of the product spec. (BR-LMP-01, BR-LMP-02, BR-LMP-04, BR-LMP-06, BR-LMP-07, BR-LMP-12)

## Data & API (called from the SvelteKit server)

Every call sends `x-api-key` (`API_KEY`) and `Authorization: Bearer <il_token>`; see `login` for the session. Operations are cited, not copied: shapes are in innerlamp-be `docs/specs/api/openapi.yaml` (tag `Lamps`).

| Action                    | Operation (openapi)                          | Called from                                                  | Notes                                                                                                                                                                                                                  |
| ------------------------- | -------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Light a lamp              | `POST /v1/lamps`                             | `+page.server.ts` action `light`                             | `201` new lamp or `200` the earlier identical lamp (5 s window). Sends `is_anonymous`. Blank recipient omitted — ⚠️ Not confirmed: not in openapi.yaml yet (planned 3.0.0, be spec v2.0); today the backend rejects it |
| Open the garden           | `GET /v1/lamps`                              | `+page.server.ts` `load` (signed-in only)                    | First page, unfiltered; items, total, per-type counts, `has_more`, `next_cursor`                                                                                                                                       |
| Filter / load more        | `GET /v1/lamps?lamp_type=&cursor=`           | browser → `GET /api/lamps` (`+server.ts`) → `listLampGarden` | Interactive call, so it goes through the website's own endpoint; the token stays in the cookie                                                                                                                         |
| Mark own lamps            | `is_mine` on each garden item                | same calls as above                                          | ⚠️ Not confirmed: not in openapi.yaml yet (planned 3.0.0, be spec v2.0) — dependency on the backend                                                                                                                    |
| Absent recipient in reads | `recipient: null` in `Lamp` and garden items | same calls as above                                          | ⚠️ Not confirmed: not in openapi.yaml yet (planned 3.0.0, be spec v2.0) — dependency on the backend                                                                                                                    |

## Error → UI mapping

"Code status" is the state of `src/` on 2026-10-17.

| Operation                     | Failure case                                                      | Visitor sees                                                                     | Code status                                                                                        |
| ----------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `light` action (no call)      | no session / no `il_token`                                        | `lamp_err_auth`, form kept                                                       | ✓                                                                                                  |
| `light` action (no call)      | client or server validation fails (AC 7)                          | `lamp_err_invalid`, form kept, no ignition                                       | differs — server only, counts code points without NFC, ignition plays first (design.md Known gaps) |
| `POST /v1/lamps`              | 400 `VALIDATION_ERROR` (any `details.field`)                      | `lamp_err_invalid`, form kept                                                    | ✓                                                                                                  |
| `POST /v1/lamps`              | 401 `UNAUTHORIZED` (after the hook's refresh attempt)             | `lamp_err_auth`; page navigations follow `login` AC 9                            | ✓ for the message; session-ended redirect on POST is the login gap                                 |
| `POST /v1/lamps`              | 409 `LAMP_LIMIT_REACHED`                                          | `lamp_err_limit`, form kept                                                      | ✓                                                                                                  |
| `POST /v1/lamps`              | `200` earlier identical lamp                                      | the lamp as lit (not an error)                                                   | ✓ (the response is treated like `201`)                                                             |
| `POST /v1/lamps`              | 429 `RATE_LIMITED`, 503, 5xx, network error                       | `lamp_err_failed`, form kept                                                     | ✓                                                                                                  |
| `GET /v1/lamps` in `load`     | any `ApiError` (network, 5xx, 400/401 not turned into a redirect) | `lamp_wall_error` in the garden section; the form stays usable                   | ✓                                                                                                  |
| `GET /api/lamps` (chip, more) | any failure                                                       | the lamps already shown stay; `lamp_wall_error` under the list                   | ✓                                                                                                  |
| `GET /api/lamps`              | 401 (no cookie, or the backend refused)                           | `lamp_wall_error` today; session-ended behavior once `login` covers `/api/*`     | differs (login gap)                                                                                |
| `GET /api/lamps`              | 400 `INVALID_FILTER` (unknown `lamp_type`)                        | `lamp_wall_error` (the website never sends an unknown type; a programming error) | ✓                                                                                                  |

## Out of scope

- "Thỉnh đèn tại chùa", donation, payment and the `/offer` flow for lamps — the `offering` feature (FR-LMP-014). The `/offer` page itself and the merit book are other features.
- A "my lamps" screen, history of expired lamps, notifications that a lamp is about to go out.
- Putting a lamp out, extending, relighting or editing it (BR-LMP-13).
- Moderation of the recipient or prayer; filtering the garden by intention.
- Lamp artwork and animation design (the web prototype owns them); the mobile apps' center navigation button.
- Backend work (optional recipient, `is_mine`, account deletion removing lamps, retention of expired lamps): tracked in the backend repo, not here.

## Pending (not yet implemented)

- Guest view, form changes (7-day default, hide-name switch, recipient notice, optional recipient, shared validation), confirmation changes (actions, date and time, no temple card) — `tasks.md` Phases 1–2.
- Garden changes (own-lamp mark from `is_mine`, remaining-time label, null recipient, counts from the latest response, empty state) — Phases 1–3; the `is_mine` and null-recipient parts wait for contract 3.0.0 (Phase 3).
- Removal of the browser-stored lamp ids (`state/lamps.svelte.ts`, key `il-lamps`) — Phase 2.
- Moving the lamp components and the garden logic into `src/lib/features/lamp/` — Phases 1–2.
- Vitest, the pinned vector copies and the unit and E2E tests — Phase 4.
- English copy for the new and changed keys — Phase 1, pending product (Appendix A).

> ⚠️ Not confirmed (product): whether a lit lamp can be shared — product Appendix A leaves the "Chia sẻ" action open. The code shows `lamp_share` on the confirmation when `navigator.share` exists and shares the caption and the prayer text. No criterion above decides it; the button stays as shipped until the product decides — blocks nothing else; hand back to ba-writer in innerlamp-be. Note the shared text can contain the prayer, which BR-LMP-10 keeps private from the garden.

> ⚠️ Not confirmed (product): English copy for every message of product §3.1.1 and the English name of the anonymous label — the existing English values in `messages/en.json` and every new English value of `design.md` are the website's proposal, not confirmed; blocks the English locale; hand back to ba-writer.

> ⚠️ Not confirmed (product): whether "Ẩn tên tôi" keeps its position or returns to off when the visitor chooses "Thắp thêm đèn" — FR-LMP-003 lists only type, intention and duration as kept; blocks the last clause of AC 16. Suggested default: it keeps the visitor's choice (the privacy-safe side).

> ⚠️ Not confirmed (product): the form of "Tất cả chúng sanh" inside running text — the product shows it capitalized, while the cards and the caption read "cho {name}" / "{intention} cho {name}"; the website proposes `lamp_to_all` ("cho tất cả chúng sanh") for those lines and `lamp_recipient_all` ("Tất cả chúng sanh") where it stands alone — blocks AC 14 and 21 wording; hand back to ba-writer.

> ⚠️ Not confirmed (product): the limit message of §3.1.1 contains the number 20, while BR-LMP-05 says 20 is a service setting that clients do not embed — blocks the exact text of `lamp_err_limit`; the website keeps the product text; hand back to ba-writer.

> ⚠️ Not confirmed (product): how a client localizes "Vô danh" — the backend returns the literal Vietnamese text as `lighter_name` (backend spec AC 16), so an English visitor sees it unless the contract marks an anonymous lamp (for example with a null name) — blocks the English locale of AC 20; the website shows `lighter_name` as returned; hand back to ba-writer and the backend.

> ⚠️ Not confirmed (login): session-ended behavior for form actions (POST) and `/api/*` calls is not built in the `login` spec (its AC 9 covers page navigations) — blocks the end of AC 4.

## Open questions (resolved)

- ~~Scope, guests, recipient, lighter's name, hide-name switch, own lamps, remaining-time label, sample lamps, moderation, numbers~~ → decided by the product owner on 2026-10-16 and recorded in product spec v1.0 (Appendix A, resolved table); applied in the criteria above. Resolved 2026-10-17 (adopted).
- ~~Where does the garden live on the website?~~ → on the same page as the form (`/practice/lamp`), as in the shipped code and the web prototype. Resolved 2026-10-17 (code read).
