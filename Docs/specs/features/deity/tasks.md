# Tasks — deity (Chư Phật & Bồ Tát — Buddhas & Bodhisattvas)

Version: 1.1
Last updated: 2026-10-15
Status: in-progress (drift) — mirror `requirements.md`

> See `changelog.md` in this folder for the version history of this spec.

`[x]` only when checked to exist in the code on 2026-10-15 and to match product v1.0. Each item points
to a row of the Layers & components table or a Step in `design.md`; "AC n" is a criterion in
`requirements.md`.

## Phase 1 — UI (`il-ui`)

- [x] Route `library/buddhas/+page.svelte` + `<svelte:head>` (`buddhas_title`, `buddhas_meta_description`)
- [x] Route `library/buddhas/[id]/+page.svelte` + `<svelte:head>` (deity name, description) (AC 12)
- [x] Chips "Tất cả / Chư Phật / Bồ Tát" (All / Buddhas / Bodhisattvas) are links, `aria-current` (AC 6)
- [x] `Pagination` page numbers, keeps `type` (AC 5)
- [x] Featured block on `/` and `/library` has "Xem tất cả" (View all) (AC 1)
- [ ] `features/deity/components/DeityCard.svelte` shared by `BuddhaGrid` and `BuddhaCatalog`: image / placeholder, type label via `deityKindLabel`, name, virtue, feast-day (ngày vía) line `buddha_via` / `buddha_via_leap`; drop `pure_land` from the catalogue card (AC 2)
- [ ] `BuddhaGrid`: drop the sample `BUDDHAS` branch; empty/failed → `buddhas_block_empty` + "Xem tất cả" (View all) (AC 3, ⚠️)
- [ ] `BuddhaCatalog`: `buddhasEmpty` state (佛 ring, `buddhas_empty_title`, `buddhas_empty_hint`, "Thử lại" (Try again) link button `err_retry` to the current URL, link `buddhas_empty_calendar` → `/events`) for both `deities: null` and `total: 0` (AC 9, 10)
- [ ] `BuddhaDetail`: order blocks per the "Block order" table in `design.md` (pure land onto the image; feast-day card after the name; virtue + scriptural source; biography; great vows (đại nguyện); iconography; 3 mantra cards + actions; related sutras; footer note) (AC 15)
- [ ] `features/deity/components/DeityViaCard.svelte`: feast-day name, day + lunar month name (+ leap), solar date with weekday per locale, countdown label after mount, `via_events` list (an item with `next_occurrence: null` shows only its name), "Lịch lễ" (Ceremony calendar) button → `/events` (AC 17, 18, 28; Step 2 of the deity page)
- [ ] Great vows: 5 + `buddha_d_vows_more` / `buddha_d_vows_less`, button `aria-expanded` (AC 19)
- [ ] Collapsed biography (line-clamp, measure overflow after mount) + `buddha_d_read_more` / `buddha_d_read_less`; no overflow → no button (AC 20)
- [ ] "Kinh liên quan" (Related sutras) block: list of links `/library/sutras/{id}` with `titles.vi` (AC 21)
- [ ] "Trì niệm với tràng hạt" (Chant with the mala) button → `/practice/mala?deity={id}`, only when `short_mantra_sino_vietnamese` is present (AC 23, ⚠️)
- [ ] `features/deity/components/DeityShareButton.svelte`: Web Share → clipboard → `aria-live` announcement (AC 24; design "Share")
- [ ] Footer note `buddha_d_footer` (AC 25)
- [ ] `MalaChant.svelte` accepts prop `mantra?: string` (default `m.practice_bead_mantra()`); `practice/mala/+page.svelte` passes `data.mantra` (AC 23; Step 3)
- [ ] i18n (both `messages/vi.json` and `messages/en.json`, per the "i18n keys" table in `design.md`):
  - [ ] change `buddha_kind_deva` → vi "Chư Thiên" (Devas) (AC 16)
  - [ ] add `buddha_via_leap`, `buddhas_block_empty`, `buddhas_empty_title`, `buddhas_empty_hint`, `buddhas_empty_calendar`
  - [ ] add `buddha_d_via_next`, `buddha_d_via_month`, `buddha_d_via_month_1` … `_12`, `buddha_d_via_leap`, `buddha_d_via_all`, `buddha_d_via_calendar`
  - [ ] add `buddha_d_read_more`, `buddha_d_read_less`, `buddha_d_vows_more`, `buddha_d_vows_less`
  - [ ] add `buddha_d_title_card`, `buddha_d_mantra_card`, `buddha_d_mala`, `buddha_d_share`, `buddha_d_share_copied`, `buddha_d_share_failed`, `buddha_d_sutras`, `buddha_d_footer`
  - [ ] delete keys no longer used once `grep` finds no usage: `buddhas_load_error`, `buddhas_empty`, `buddha_d_memorial` (after the Phase 3 feast-day item), `buddha_kind_future`, `buddha_1..9`, `buddha_*_role`, `buddha_d_mantra_vi/_sa`, `buddha_d_dharani_text` (if the new layout does not use them)

## Phase 2 — State & logic (`il-state`)

- [ ] `features/deity/utils.ts`: `deityKindLabel` (replaces the 3 copies of `kindLabel` in the three sections), `viaShort(lunar_date)` ("dd/MM", leap flag), `viaMonthName(month)`, `shareText(deity)` (skips empty values), `visibleVows(vows, expanded)` (AC 2, 16, 17, 19, 24)
- [ ] Use `countdown(today, solarDate)` from `src/lib/utils/events.ts` (created by the `calendar` spec Phase 2; no separate copy) (AC 17, 28)
- [ ] No vector for BR-DTY-06 on the website: the backend chooses `next_via` (backend deity v3.0 AC 24); the website only counts days (BR-CAL-13 — vector `countdown.json` runs in the `calendar` spec Phase 4). If the website ever chooses the next feast day itself, a task running `docs/product/deity/rules/deity-next-via.json` must be added

## Phase 3 — Server data (contract-gated)

- [x] `src/lib/server/api/deities.ts`: `getTopDeities`, `listDeities`, `getDeity`, `listDeitySutras`; DTOs in `src/lib/types/deity.ts`
- [x] `(site)/+page.server.ts`, `library/+page.server.ts`: `top` cut to 6, failure → `null`, the page still renders (AC 1, 4)
- [x] `library/buddhas/+page.server.ts`: normalise `?page`/`?type` (307), map `type`, past the end → 307 last page, failure → `deities: null` (AC 5–8; Steps 1–2 of the catalogue)
- [x] `library/buddhas/[id]/+page.server.ts`: 404 → `error(404)`, other failure → `error(502)` (AC 13, 14 — kept until ⚠️ AC 14 is answered)
- [ ] Fix stale comments: "20 per page" in `deities.ts`, "Fixed by the backend (20)" in `types/deity.ts`, "falls back to static content" in the two featured-block `load`s (AC 3, 5)
- [ ] `library/buddhas/[id]/+page.server.ts`: call `listDeitySutras` in parallel (`Promise.allSettled`), failure → `sutras: []` + log (AC 21, 22; Step 1 of the deity page)
- [ ] `practice/mala/+page.server.ts` (new): `?deity=` → `getDeity` → `mantra` or `null` (AC 23; Step 3)
- [ ] Once backend deity v3.0 lands in `openapi.yaml`: re-check the field names, then add `next_via` (summary), `via_events` (detail) to `types/deity.ts`; switch the deity page from `lunar_memorial_days` to `via_events` + `DeityViaCard`, drop the old "Ngày vía" (Feast days) block; update the `Contract:` line in `requirements.md` (AC 2, 17, 18)
- [ ] Answer ⚠️ "today" (AC 17) before deciding whether to send `date`; if sent, map `400 INVALID_DATE` into the general error branch

## Phase 4 — Tests (`il-testing`)

- [ ] Unit `features/deity/utils.spec.ts`: type label (3 types + unknown value), `viaShort` (normal / leap), month names 1 and 12, `shareText` (full / no Sanskrit / no chant text), `visibleVows` (4, 5, 6, 48 great vows)
- [ ] Unit `library/buddhas` `load` (mock `listDeities`): `?page=abc` / `?page=0` / `?type=x` → 307; past the end → 307 last page keeping `type`; `ApiError` → `deities: null`
- [ ] Unit `library/buddhas/[id]` `load`: 404 → 404; 5xx → 502; `/sutras` failure → page still has `deity`, `sutras: []`
- [ ] Unit `practice/mala` `load`: no `?deity`, with chant text, without chant text, 404, network failure
- [ ] Component `DeityShareButton`: `navigator.share` present; cancel (`AbortError`); no share → clipboard + `buddha_d_share_copied`; clipboard failure → `buddha_d_share_failed`
- [ ] Component `DeityViaCard`: no countdown label during SSR; "Hôm nay" (Today) / "Ngày mai" (Tomorrow) / "Còn n ngày" (n days left) with a mocked date
- [ ] E2E `tests/deity.e2e.ts` (real backend or mock server): featured block 6 cards and "Xem tất cả" (View all) (FR-DTY-001); page 1 = 12 cards, subtitle has `total`, page 2 = the rest (FR-DTY-002); "Chư Phật" (Buddhas) only has the Phật (Buddha) label, Chư Thiên (Deva) entries only under "Tất cả" (All) (FR-DTY-003); open a deity, unknown deity → 404, backend down → "Thử lại" (Try again) (FR-DTY-004); 48 great vows → 5 + "Xem đủ 48 đại nguyện" (See all 48 great vows) (BR-DTY-07); no iconography / no dharani (đà-la-ni) → block/card absent (BR-DTY-04); related sutra opens the sutra page (FR-DTY-007); mala (tràng hạt) opens with the chant text, count 0 (FR-DTY-008); backend down → `buddhasEmpty` with "Thử lại" (Try again) and "Xem lịch lễ vía" (View the feast-day calendar), home page has no sample cards (FR-DTY-010)
- [ ] Measure NFR-DTY-02 (change chip, simulated 4G, < 2 s) once, record the result in the changelog

## Phase 5 — Quality (`il-quality`)

- [ ] `npm run check && npm run lint && npm run build` pass

## Phase 6 — Documentation

- [ ] Report the Website column of `docs/product/deity/product.md` §4.2 to `ba-writer` (this skill does not edit the backend repo), with the notes on FR-DTY-004 (the error screen already has "Thử lại" (Try again)) and BR-DTY-08 (footer note missing)
- [ ] Clean up `.assumptions.md` once the spec is approved: line 12 "Catalogue pages" (the `/library/buddhas` part: sample data, client-side filtering, no detail pages — stale), line 13 "Bottom bar" (only mentions the route, re-check) and line 23 "Home re-check" (the sentence "per-item detail links on buddhas … (no detail pages)" — stale)
- [ ] OKF concept via `il-okf-writer` once the feature is checked end-to-end

## Deferred (not blocking deity)

- "Chư Thiên" (Devas) chip (product Appendix A item 5).
- Deity page link in the shared content (product Appendix A item 3).
- Related sutras beyond one page (`/sutras` page of 20; no deity is anywhere near that today) — only page 1 is read.
