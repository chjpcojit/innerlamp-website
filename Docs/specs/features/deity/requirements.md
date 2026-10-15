# Requirements — deity (Chư Phật & Bồ Tát — Buddhas & Bodhisattvas)

Version: 1.1
Last updated: 2026-10-15
Status: in-progress (drift) — the featured block on `/` and `/library` (first 6 of `top`), the catalogue `/library/buddhas` (filter `?type=`, pagination `?page=`, URL normalisation, past the end → last page) and the page `/library/buddhas/[id]` run against the real backend. Remaining: the "Chư Thiên" (Devas) label, feast days (ngày vía) from the ceremony calendar (next feast day on the card + a feast-day card with a countdown on the page), block order per the prototype, great vows (đại nguyện) collapsed to 5, biography "Read more", related sutras, mala (tràng hạt), share, page footer note, empty/error states per the prototype instead of sample content, tests.
Feature folder: `src/routes/(site)/library/buddhas/`, `src/routes/(site)/+page.server.ts` + `src/routes/(site)/library/+page.server.ts` (featured block), `src/lib/components/sections/{BuddhaCatalog,BuddhaGrid,BuddhaDetail}.svelte`, `src/lib/server/api/deities.ts`, `src/lib/types/deity.ts`; new: `src/lib/features/deity/`
Product spec: innerlamp-be `docs/product/deity/product.md` @ v1.0
Contract: innerlamp-be `docs/specs/api/openapi.yaml` @ a8a016b (`info.version` 1.0.0, tag Deities: `GET /v1/deities/top`, `GET /v1/deities`, `GET /v1/deities/{id}`; tag Sutras/Deities: `GET /v1/deities/{id}/sutras`) — current shape: page of 20, only `lunar_memorial_days`. Planned changes, **not yet in `openapi.yaml`**: backend deity `docs/specs/features/deity/requirements.md` v3.0 (9794992) — page of 12 (AC 5), `next_via` on summary and detail (AC 2, 8, 24, 29), `via_events` on detail (AC 28), `date` parameter + `400 INVALID_DATE` (AC 25, 26), `lunar_memorial_days` deprecated (AC 30), related sutras only via `/sutras` (AC 34).
Implements: BR-DTY-01, BR-DTY-02, BR-DTY-03, BR-DTY-04, BR-DTY-05, BR-DTY-06, BR-DTY-07, BR-DTY-08, FR-DTY-001, FR-DTY-002 (§3.6: page numbers), FR-DTY-003, FR-DTY-004, FR-DTY-005, FR-DTY-006, FR-DTY-007, FR-DTY-008, FR-DTY-009 (§3.6: Web Share or copy), FR-DTY-010, NFR-DTY-01, NFR-DTY-02; related BR-CAL-08, BR-CAL-12, BR-CAL-13 (calendar)

> See `changelog.md` in this folder for the version history of this spec.

This spec is written retroactively from the running code (read 2026-10-15) and checked against product spec v1.0; the parts not built yet are written prospectively in the same file. Routes: `/library/buddhas`, `/library/buddhas/[id]`, the block on `/` and `/library` (`/en/...`).

Product behavior (types and labels, order, page size, hiding empty values, feast-day source, how the next feast day is chosen, collapsed great vows, footer) lives in the product spec and is **not** restated here; this file only says how the website implements those IDs. Not applicable to the website (Website column `n/a`): FR-DTY-011.

## Constraints from the product spec

- **Public, read-only** (product §2.3): no route of the feature needs a session; no sign-in prompt.
- **Website is online only** (§3.6 row §2.4): no offline copy; backend failure → error state with "Thử lại" (Try again).
- **Feast days come from the backend** (BR-DTY-05; backend v3.0 AC 23, 24, 28): the website does not convert lunar ↔ solar itself and does not choose the next feast day itself; it only computes the countdown (BR-CAL-13) in the browser.
- **No sample content** (FR-DTY-010): `src/lib/content/buddhas.ts` and `BUDDHAS` in `content/home.ts` are removed from the render path.

## Dependencies

- **calendar** (`Docs/specs/features/calendar/`): the function `countdown(today, solarDate)` + label map in `src/lib/utils/events.ts` (calendar `tasks.md` Phase 2, not built yet) — deity reuses it, no separate copy; the page `/events` is the target of "Lịch lễ" (Ceremony calendar) / "Xem lịch lễ vía" (View the feast-day calendar) and today **still blocks guests** (drift from FR-CAL-001, fixed in the calendar spec).
- **sutra**: the page `/library/sutras/[slug]` (slug = the sutra's `id`) is the target of "Kinh liên quan" (Related sutras).
- **practice / mala**: `/practice/mala` (`MalaChant.svelte`) does not accept a chant text today — task in Phase 1/3 of this spec.

## User Story

As a website visitor (signed in or not), I want to browse the catalogue of Buddhas (chư Phật), Bodhisattvas (Bồ Tát) and Devas (Chư Thiên) and each one's page — biography, great vows, upcoming feast day, mantras, related sutras, so that I can learn about them and start chanting. (product §1.3)

## Acceptance Criteria (EARS notation)

### Featured block (`/`, `/library`)

1. WHEN the visitor opens `/` or `/library`, THE SYSTEM SHALL call `GET /v1/deities/top` from the server and show the first 6 cards in exactly the order received (§3.6: website 6), with a "Xem tất cả" (View all) link (`view_all`) to `localizeHref('/library/buddhas')`; each card is a link to `/library/buddhas/{id}`. (FR-DTY-001, BR-DTY-02) — ✓ (the "Xem tất cả" link is the `SectionHeading` default).
2. WHEN a card (featured block or catalogue) is shown, THE SYSTEM SHALL show the image (or a placeholder image when there is none), the type label, the name, the core virtue (hidden when empty) and the next-feast-day line `buddha_via` from `next_via.lunar_date` (hidden when `next_via` is `null`). (FR-DTY-002, BR-DTY-04, BR-DTY-06) — drift: no feast-day line yet (the contract has no `next_via` yet); the catalogue card also shows `pure_land`, which is not in §3.1.1.
   > ⚠️ Not confirmed (product): how a feast day falling in a leap month shows on the card ("Vía dd/MM âm lịch" (Feast day dd/MM lunar) with an added "nhuận" (leap) as in BR-CAL-08 or not) — blocks the text of `buddha_via` when `lunar_date.is_leap_month`; proposed default: add "nhuận" after the month (`buddha_via_leap`); hand back to ba-writer in innerlamp-be.
3. WHEN `GET /v1/deities/top` fails (network / 5xx) or returns `items: []`, THE SYSTEM SHALL show the block's empty state (no cards) and still keep "Xem tất cả" (View all); THE SYSTEM SHALL NOT show sample entries from `content/buddhas.ts`. (FR-DTY-010, BR-DTY-02) — drift: shows 6 sample entries with hardcoded feast days.
   > ⚠️ Not confirmed (product): the text and layout of the empty state of the "Thư viện Phật & Bồ Tát" (Buddha & Bodhisattva library) block on the home / library page (the prototype only draws `buddhasEmpty` for the catalogue; the web version has none) — blocks key `buddhas_block_empty`; proposed default: one short line "Chưa có thông tin chư Phật" (No information on the Buddhas yet) + "Xem tất cả" (View all); hand back to ba-writer in innerlamp-be.
4. WHEN `GET /v1/deities/top` fails, THE SYSTEM SHALL still render the rest of `/` and `/library` (a failing block does not break the page). (platform) — ✓.

### Catalogue `/library/buddhas`

5. WHEN the visitor opens `/library/buddhas`, THE SYSTEM SHALL call `GET /v1/deities?page=N[&type=T]` from the server, show one page of cards in the order received, the subtitle `buddhas_page_sub` with `total`, and the page-number bar (`Pagination`) when `total_pages > 1`; the number of cards per page is the `page_size` the backend returns (12 per BR-DTY-03, backend v3.0 AC 5), the website does not assume a page size itself. (FR-DTY-002, BR-DTY-03, NFR-DTY-01) — ✓ (today the backend returns 20, changes when backend v3.0 ships; only the `page_size` comment in `types/deity.ts` needs fixing).
6. WHEN the visitor picks the chip "Tất cả" (All) / "Chư Phật" (Buddhas) / "Bồ Tát" (Bodhisattvas) (`buddhas_tab_*`), THE SYSTEM SHALL navigate to `/library/buddhas`, `?type=buddha`, `?type=bodhisattva` (page 1) and the server sends `type` `BUDDHA` / `BODHISATTVA` accordingly; there is no Chư Thiên (Devas) chip, Deva entries only appear under "Tất cả" (All). (FR-DTY-003, BR-DTY-01) — ✓.
7. WHEN the URL has a `?page=` that is not an integer ≥ 1 or an unknown `?type=`, THE SYSTEM SHALL redirect 307 to the canonical URL (keeping a valid filter, dropping `page=1`). (platform) — ✓.
8. WHEN `?page=` is past the last page (backend returns `items: []` with `total_pages > 0`), THE SYSTEM SHALL redirect 307 to the last page, keeping the filter. (FR-DTY-002 §3.6, BR-DTY-03) — ✓.
9. WHEN `GET /v1/deities` fails (network / 5xx / unexpected 4xx) or returns `total: 0`, THE SYSTEM SHALL show the empty state per prototype `buddhasEmpty`: title `buddhas_empty_title`, check-your-connection hint `buddhas_empty_hint`, a "Thử lại" (Try again) button (`err_retry`, a GET link back to the current URL so `load` runs again, no JS needed) and a "Xem lịch lễ vía" (View the feast-day calendar) link (`buddhas_empty_calendar`) to `localizeHref('/events')`. (FR-DTY-010) — drift: shows one line `buddhas_load_error` / `buddhas_empty`, no buttons.
   > ⚠️ Not confirmed (product): when a filter ("Chư Phật" (Buddhas) / "Bồ Tát" (Bodhisattvas)) returns `total: 0` while the whole catalogue still has entries, whether to use the same `buddhasEmpty` state (the "check your connection" hint would be misleading) or a line "no entries of this type" — blocks the `total: 0` branch with `type`; proposed default: same state, drop the hint line; hand back to ba-writer in innerlamp-be.
10. WHEN the visitor presses "Thử lại" (Try again) and the backend answers, THE SYSTEM SHALL show the page being viewed (page 1 if coming from the root URL). (FR-DTY-010) — not built.
11. WHEN the visitor changes chip, THE SYSTEM SHALL show the first page of the new filter within 2 s on 4G (a single `GET /v1/deities` call, without loading the whole catalogue). (NFR-DTY-02, NFR-DTY-01) — not measured.

### Deity page `/library/buddhas/[id]`

12. WHEN the visitor opens `/library/buddhas/{id}`, THE SYSTEM SHALL call `GET /v1/deities/{id}` and `GET /v1/deities/{id}/sutras` in parallel from the server and show the page without sign-in; `<title>` = `name_vi` · `app_name`, meta description = virtue / biography / `buddhas_meta_description`. (FR-DTY-004) — ✓ partly (`/sutras` not called yet).
13. WHEN `GET /v1/deities/{id}` returns 404 `DEITY_NOT_FOUND`, THE SYSTEM SHALL return HTTP 404 with a "not found" screen that has a way back. (FR-DTY-004) — ✓ (root `+error.svelte`: `err_404_*`, to home / go back).
14. WHEN `GET /v1/deities/{id}` fails (network / 5xx / 4xx other than 404), THE SYSTEM SHALL show an error message with "Thử lại" (Try again) (`err_retry`). (FR-DTY-004) — ✓ per code: `error(502)` → root `+error.svelte` has `err_data_*` + button `err_retry` (reloads the page).
    > ⚠️ Not confirmed (product): §4.2 marks website FR-DTY-004 as `drift` ("error page instead of retry") but the root error screen already has "Thử lại" (Try again) — whether the shared error screen (HTTP 502, noindex) satisfies FR-DTY-004, or it must be an error state inside the deity page frame — blocks keeping `error(502)`; proposed default: keep the shared screen (as `temple` FR-TPL-006); hand back to ba-writer in innerlamp-be.
15. WHEN the deity page is shown, THE SYSTEM SHALL order the blocks exactly per FR-DTY-005 (the "Block order" table in `design.md`) and hide every empty field / block / mantra card per BR-DTY-04. (FR-DTY-005, BR-DTY-04) — drift: `pure_land` sits in the virtue card instead of on the image; "Ngày vía" (Feast days) comes after the great vows; mantras are 4 lines rather than 3 cards "Danh hiệu / Thần chú / Đà-la-ni" (Title / Mantra / Dharani).
16. WHEN a type label is shown anywhere (card, deity page), THE SYSTEM SHALL use `buddha_kind_buddha` / `buddha_kind_bodhisattva` / `buddha_kind_deva` with vi text "Phật" (Buddha) / "Bồ Tát" (Bodhisattva) / "Chư Thiên" (Devas). (BR-DTY-01) — drift: `buddha_kind_deva` vi is "Thiên hộ pháp" (Dharma-protector deva) (en "Dharma protector (Deva)").
17. WHEN the deity has `next_via`, THE SYSTEM SHALL show the next-feast-day card: event name, day and lunar month name ("THÁNG GIÊNG" (first month) … "THÁNG CHẠP" (twelfth month), with "nhuận" (leap) when `is_leap_month`), solar date with weekday (formatted per locale), countdown label per BR-CAL-13 computed in the browser from the device date after mount, the list of all `via_events` in the order received, and a "Lịch lễ" (Ceremony calendar) button (`buddha_d_via_calendar`) to `localizeHref('/events')`; a deity without `next_via` has no feast-day card. (FR-DTY-006, BR-DTY-05, BR-DTY-06, BR-CAL-08, BR-CAL-13) — drift: shows the `lunar_memorial_days` list (lunar dates only, no countdown, no calendar link).
    > ⚠️ Not confirmed: choosing "today" for `next_via` — the SvelteKit server does not know the visitor's device date; proposed default: do not send `date` (backend uses the Vietnam date, AC 25), and the countdown label uses the device date in the browser; a visitor in a time zone other than UTC+7 around midnight may see `next_via` off by one day (label "Đã qua" (Past) or missing today's feast day) — blocks Step 1 of the deity page flow and the featured block.
18. WHEN a `via_events` item has `next_occurrence: null`, THE SYSTEM SHALL still list the event name, without a date. (FR-DTY-006, BR-DTY-04) — not built.
19. WHEN the deity has more than 5 great vows, THE SYSTEM SHALL show the first 5 great vows and a `buddha_d_vows_more` ({count}) button that expands to all, then `buddha_d_vows_less`; ≤ 5 has no button; numbered from 1 in the order received. (BR-DTY-07) — drift: shows all.
20. WHEN the biography is longer than the collapsed height, THE SYSTEM SHALL collapse it with a `buddha_d_read_more` / `buddha_d_read_less` button; a short biography has no button. (FR-DTY-005) — drift: shows it in full.
21. WHEN `GET /v1/deities/{id}/sutras` returns at least one item, THE SYSTEM SHALL show the "Kinh liên quan" (Related sutras) block (`buddha_d_sutras`) listing the sutras in the order received, each item a link to `localizeHref('/library/sutras/{sutra.id}')`; `items: []` has no block. (FR-DTY-007, BR-DTY-04) — not built (`listDeitySutras` is defined but unused).
    > ⚠️ Not confirmed (product): the order "in the sutra library's order" (FR-DTY-007) versus the order of `/sutras` (role `SUBJECT` → `SPEAKER` → `MENTIONED`, then editorial order) — question already raised in backend deity v3.0; the website shows exactly the order received, without re-sorting; hand back to ba-writer in innerlamp-be.
22. WHEN `GET /v1/deities/{id}/sutras` fails, THE SYSTEM SHALL still show the deity page, only hiding the "Kinh liên quan" (Related sutras) block (error logged server-side). (platform)
23. WHEN the deity has `mantras.short_mantra_sino_vietnamese`, THE SYSTEM SHALL show the "Trì niệm với tràng hạt" (Chant with the mala) button (`buddha_d_mala`) below the mantra cards, a link to `localizeHref('/practice/mala?deity={id}')`; the mala page opens with that deity's `short_mantra_sino_vietnamese` as the chant text and a count of 0; a deity without that text has no button. (FR-DTY-008, BR-DTY-04) — not built.
    > ⚠️ Not confirmed: the mala page parameter — `?deity={id}` (the server reads the chant text back from the backend; the URL cannot inject arbitrary text onto the page) or `?text=` (no extra API call) — blocks Step 3 and the mala task; proposed default: `?deity={id}`; unknown `id` / backend failure → the current default chant text `practice_bead_mantra`.
24. WHEN the visitor presses "Chia sẻ" (Share) (`buddha_d_share`), THE SYSTEM SHALL use `navigator.share` with the deity name and chant text (Sino-Vietnamese (Hán Việt), then Sanskrit when present) when the browser supports it; if it is unavailable or rejected (except when the visitor cancels), THE SYSTEM SHALL copy the same content with `navigator.clipboard.writeText` and announce `buddha_d_share_copied`; if copying also fails it announces `buddha_d_share_failed`. (FR-DTY-009 §3.6, BR-DTY-04) — not built.
    > ⚠️ Not confirmed (product): whether the shared content includes a link to the deity page on the web (product Appendix A item 3) — blocks the share string; default: no link until product answers.
25. WHEN the deity page is shown, THE SYSTEM SHALL have the page footer note `buddha_d_footer` ("Nội dung do Ban biên tập tổng hợp từ kinh điển" (Content compiled by the editorial board from the scriptures)) and SHALL NOT have "Báo thông tin sai" (Report incorrect information), favourites or follow. (BR-DTY-08) — minor drift: no extra actions, but the note is missing.

### General

26. WHEN any string of the feature is shown (including `alt`, `aria-label`, `<title>`, meta, share announcements), THE SYSTEM SHALL take it from Paraglide `m.*` with the key present in both `messages/vi.json` and `messages/en.json`; content data (names, biography, mantras, event names) is shown verbatim from the backend. (platform)
27. WHEN calling the backend, THE SYSTEM SHALL only call from the SvelteKit server via `$lib/server/api/deities.ts` with `x-api-key`; no route of the feature reads the session cookie. (platform) — ✓.
28. WHEN the countdown label cannot be computed yet (SSR, before mount), THE SYSTEM SHALL not render the countdown label (avoids a date mismatch between server and device). (platform, BR-CAL-13)

## Data & API (called from the SvelteKit server)

Common header: `x-api-key` from `API_KEY`; no Bearer (public routes).

| Action | Operation (openapi) | Called from | Notes |
| --- | --- | --- | --- |
| Featured block | `GET /v1/deities/top` | `load` of `(site)/+page.server.ts`, `(site)/library/+page.server.ts` | ≤ 10, website cuts to 6. `next_via` per backend v3.0 AC 2, 24 (not yet in openapi) |
| Catalogue | `GET /v1/deities?page=&type=` | `load` of `library/buddhas/+page.server.ts` | `page_size` 12 per backend v3.0 AC 5 (openapi still 20); `next_via` as above |
| Deity page | `GET /v1/deities/{id}` | `load` of `library/buddhas/[id]/+page.server.ts` | Uses `next_via` + `via_events` (backend v3.0 AC 8, 28, 29); does **not** use `lunar_memorial_days` (deprecated, AC 30) |
| Related sutras | `GET /v1/deities/{id}/sutras` | same `load`, in parallel | Page 1, no `role`; order kept as received |
| Chant text for the mala | `GET /v1/deities/{id}` | new `load` of `practice/mala/+page.server.ts` when `?deity=` is present | ⚠️ AC 23 |
| "Today" | parameter `date` (backend v3.0 AC 25) | — | Not sent by default (⚠️ AC 17) |

## Error → UI mapping

| Operation | Failure case | Visitor sees | Current code state |
| --- | --- | --- | --- |
| `GET /v1/deities/top` | network / 5xx | Empty block `buddhas_block_empty` (⚠️ AC 3) + "Xem tất cả" (View all); the rest of the page still shows | drift — 6 sample entries from `content/buddhas.ts` |
| `GET /v1/deities/top` | `items: []` | as above | drift — 6 sample entries |
| `GET /v1/deities` | network / 5xx / unexpected 4xx | `buddhas_empty_title` + `buddhas_empty_hint` + `err_retry` + `buddhas_empty_calendar` | drift — only `buddhas_load_error` |
| `GET /v1/deities` | `total: 0` | as above (⚠️ AC 9 when `type` is set) | drift — only `buddhas_empty` |
| `GET /v1/deities` | 400 `INVALID_PAGE` / `INVALID_DEITY_TYPE` (the website already normalises the URL so this does not happen) | as network / 5xx (log the error code) | ✓ (falls into the general error branch) |
| `GET /v1/deities` | page past the end | 307 to the last page | ✓ |
| `GET /v1/deities{,/top,/{id}}` | 400 `INVALID_DATE` (only when `date` is sent; not sent by default) | as network / 5xx | not applicable yet |
| `GET /v1/deities/{id}` | 404 `DEITY_NOT_FOUND` | HTTP 404, `err_404_*` (to home / go back) | ✓ |
| `GET /v1/deities/{id}` | network / 5xx | `err_data_*` + `err_retry` (root error screen, ⚠️ AC 14) | ✓ |
| `GET /v1/deities/{id}/sutras` | any failure | Deity page still shows, without the "Kinh liên quan" (Related sutras) block | not built (not called yet) |
| `GET /v1/deities/{id}` (from `/practice/mala?deity=`) | 404 / network / 5xx | Mala with the default chant text `practice_bead_mantra` | not built |
| Share (browser) | no `navigator.share` / failure | Copy, announce `buddha_d_share_copied`; copy fails → `buddha_d_share_failed` | not built |
| every page | browser offline | `OfflineGate` (`offline_*`) | ✓ |

## Out of scope

- Search within the catalogue, "Báo thông tin sai" (Report incorrect information), favourites, follow, feast-day reminders, the 3-card share screen (product §1.2).
- Offline copy (§3.6: website is online only).
- Content of the ceremony calendar page `/events` and the sutra page `/library/sutras/[slug]` (specs `calendar`, `sutra`).
- A "Chư Thiên" (Devas) chip (product Appendix A item 5, not blocking).
- `/vi/...` canonicalisation and sitemap (site-wide follow-up).

## Pending (not yet implemented)

- "Chư Thiên" (Devas) label — Phase 1 (i18n).
- Feast-day line on the card, feast-day card + feast-day list + "Lịch lễ" (Ceremony calendar) on the deity page — Phases 1, 2, 3 (waiting for backend v3.0 to land in `openapi.yaml`).
- Deity page block order, 3 mantra cards, footer note — Phase 1.
- Collapsed great vows, biography "Read more" — Phases 1, 2.
- Related sutras — Phases 1, 3.
- Mala accepting the deity's chant text — Phases 1, 3.
- Share (Web Share / copy) — Phases 1, 2.
- Empty/error states per the prototype, removing sample content — Phases 1, 3.
- Tests and measuring NFR-DTY-02 — Phase 4.

## Open questions (resolved)

- ~~Page size, feast-day source, who chooses the next feast day~~ → page of 12; feast days from the ceremony calendar; the backend chooses `next_via`, the client only counts days (product v1.0; backend deity v3.0 AC 5, 23–29). Resolved 2026-10-15.
- ~~How many featured entries the website shows~~ → 6 (product §3.6 row FR-DTY-001). Resolved 2026-10-15.
- ~~Website pagination~~ → page numbers + past the end goes to the last page (product §3.6 row FR-DTY-002); kept as in code. Resolved 2026-10-15.
