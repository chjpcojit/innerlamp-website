# Design — deity (Chư Phật & Bồ Tát — Buddhas & Bodhisattvas)

Version: 1.1
Last updated: 2026-10-15
Status: in-progress (drift) — mirror `requirements.md`

> See `changelog.md` in this folder for the version history of this spec.

## Overview

Three surfaces, all public, none reads the session cookie: the featured block on `/` and `/library`,
the catalogue `/library/buddhas` (`?type=`, `?page=`) and the deity page `/library/buddhas/[id]`. Data
takes the standard path: browser → `load` in `+page.server.ts` → `$lib/server/api/deities.ts` →
backend (`x-api-key`). Same architecture as `temple` (URL-driven directory, detail page via `load`);
the only browser-side interactions are the countdown (after mount), collapsing great vows (đại nguyện)
/ biography, and share. New code (pure logic, the feast-day card component, share) goes into
`src/lib/features/deity/`; the three existing sections keep their names and places.

## Layers & components

| Layer | File | Responsibility | Status |
| --- | --- | --- | --- |
| Route (server) | `src/routes/(site)/+page.server.ts` | `loadTopDeities` → first 6 entries (`HOME_DEITY_COUNT`); failure → `null` | exists — needs: the comment "falls back to static content" is wrong under the new meaning (empty block) |
| Route (server) | `src/routes/(site)/library/+page.server.ts` | As above (`LIBRARY_DEITY_COUNT` 6) | exists — needs: as above |
| Route (UI) | `src/routes/(site)/library/buddhas/+page.svelte` | Meta, `BuddhaCatalog` | exists |
| Route (server) | `src/routes/(site)/library/buddhas/+page.server.ts` | Normalise `?page`/`?type` (307), call `listDeities`, past the end → 307 last page, failure → `deities: null` | exists ✓ |
| Route (UI) | `src/routes/(site)/library/buddhas/[id]/+page.svelte` | Meta, `BuddhaDetail` | exists — needs: pass `sutras` |
| Route (server) | `src/routes/(site)/library/buddhas/[id]/+page.server.ts` | `getDeity` ∥ `listDeitySutras` (Step 2); 404 → `error(404)`; other failure → `error(502)` (⚠️ AC 14) | exists — needs: call `/sutras` in parallel, `/sutras` failure → `sutras: []` |
| Route (server) | `src/routes/(site)/practice/mala/+page.server.ts` | `?deity=` → `getDeity` → `mantra` (Step 3) | not created |
| Route (UI) | `src/routes/(site)/practice/mala/+page.svelte` | Pass `data.mantra` to `MalaChant` | exists — needs: prop |
| Section | `src/lib/components/sections/BuddhaGrid.svelte` | Featured block: cards + "Xem tất cả" (View all); empty → `buddhas_block_empty` | exists — needs: drop the sample `BUDDHAS` branch, add the feast-day line, empty state |
| Section | `src/lib/components/sections/BuddhaCatalog.svelte` | Chips, cards, `Pagination`, empty/error state | exists — needs: feast-day line instead of `pure_land`, `buddhasEmpty` state with "Thử lại" (Try again) + "Xem lịch lễ vía" (View the feast-day calendar) |
| Section | `src/lib/components/sections/BuddhaDetail.svelte` | Deity page per the "Block order" table | exists — needs: reorder blocks, 3 mantra cards, feast-day card, collapsed great vows / biography, related sutras, two actions, footer note; drop the `lunar_memorial_days` block |
| Section | `src/lib/components/sections/MalaChant.svelte` | Prop `mantra?: string` instead of the fixed `m.practice_bead_mantra()` | exists — needs: prop |
| Feature UI | `src/lib/features/deity/components/DeityCard.svelte` | Card shared by the featured block and the catalogue (image/placeholder, type label, name, virtue, feast-day line) | not created (merges the two duplicated card versions) |
| Feature UI | `src/lib/features/deity/components/DeityViaCard.svelte` | Next-feast-day card + `via_events` list + "Lịch lễ" (Ceremony calendar); countdown label after mount | not created |
| Feature UI | `src/lib/features/deity/components/DeityShareButton.svelte` | Web Share → clipboard → announcement (`aria-live`) | not created |
| Feature logic | `src/lib/features/deity/utils.ts` | `deityKindLabel(type)` (one place replacing 3 copies of `kindLabel`), `viaShort(lunar_date)` ("dd/MM", leap), `viaMonthName(month)`, `shareText(deity)`, `visibleVows(vows, expanded)` | not created |
| Shared logic | `src/lib/utils/events.ts` `countdown` | BR-CAL-13 — belongs to the `calendar` spec (Phase 2 there), deity only uses it | not built (dependency) |
| API resource | `src/lib/server/api/deities.ts` | `getTopDeities`, `listDeities`, `getDeity`, `listDeitySutras` | exists — needs: comment "20 per page" → read `page_size`; `listDeitySutras` gets used |
| Types | `src/lib/types/deity.ts` | DTOs; add `DeityVia`, `DeityViaEvent`, `next_via` on `DeitySummary`, `via_events` on `DeityDetail` with the exact field names of backend v3.0 AC 29 / the requirements API table; `lunar_memorial_days` stays in the type but unused | exists — needs: new fields (once openapi has them) |
| Static content | `src/lib/content/buddhas.ts`, `BUDDHAS` in `src/lib/content/home.ts`, keys `buddha_1..9`, `buddha_*_role` | Sample content | remove (FR-DTY-010) — check nothing still uses them before deleting the keys |
| i18n | `messages/vi.json`, `messages/en.json` | "i18n keys" table | to change / add |
| Tests | `src/lib/features/deity/utils.spec.ts`, `src/routes/(site)/library/buddhas/page.server.spec.ts`, `tests/deity.e2e.ts` | Per `il-testing` | not created |

### Block order of the deity page (FR-DTY-005)

| # | Block | Source | Hidden when |
| --- | --- | --- | --- |
| 0 | Back link `buddha_d_back` → `/library/buddhas` | — | — |
| 1 | Image (placeholder when `image_url` is empty) + type label + `pure_land` on the image | summary | `pure_land` empty → only that line is hidden |
| 2 | `<h1>` `name_vi`, `title_honorific`, `name_sanskrit` · `name_chinese` | summary | each field when empty |
| 3 | Feast-day card `DeityViaCard` | `next_via`, `via_events` | `next_via` is `null` |
| 4 | Virtue (`buddha_d_virtue`) + scriptural source (`buddha_d_source`) | `core_virtue`, `canonical_source` | both empty |
| 5 | "Tiểu sử" (Biography) (`buddha_d_biography`), collapsed + `buddha_d_read_more` / `buddha_d_read_less` | `biography_summary` | empty |
| 6 | "Đại nguyện" (Great vows) (`buddha_d_vows`), 5 + `buddha_d_vows_more` / `buddha_d_vows_less` | `great_vows` | `[]` |
| 7 | "Hình tượng" (Iconography) (`buddha_d_iconography`) | `iconography.*` | every field empty |
| 8 | "Thần chú & danh hiệu" (Mantras & titles) (`buddha_d_mantras`): card "Danh hiệu" (Title) (`buddha_d_title_card`, `title_honorific`), "Thần chú" (Mantra) (`buddha_d_mantra_card`: Sino-Vietnamese (Hán Việt) then Sanskrit), "Đà-la-ni" (Dharani) (`buddha_d_dharani`: name + excerpt) | `title_honorific`, `mantras.*` | each card when empty; all three empty → the whole block (actions still show at the end of the block if present) |
| 9 | Actions: "Trì niệm với tràng hạt" (Chant with the mala) (when `short_mantra_sino_vietnamese` is present), "Chia sẻ" (Share) | — | — |
| 10 | "Kinh liên quan" (Related sutras) (`buddha_d_sutras`) | `/sutras` `items` | `[]` or failure |
| 11 | Note `buddha_d_footer` | — | — |

> ⚠️ Not confirmed: the actions block (#9) when all three mantra cards are empty — shown on its own or hidden with the block; default: the "Chia sẻ" (Share) button still shows (FR-DTY-009 has no condition), the mala button hides itself because there is no chant text.

## Route & navigation flow

```
/  ,  /library
  ├─ deity card ──────────▶ /library/buddhas/{id}
  └─ "Xem tất cả" ────────▶ /library/buddhas

/library/buddhas[?type=buddha|bodhisattva][&page=N]
  ├─ bad ?page / ?type ──▶ 307 canonical URL
  ├─ page > total_pages ─▶ 307 ?page=total_pages
  ├─ chip ───────────────▶ ?type=… (page 1)
  ├─ page number ────────▶ ?page=N (keep type)
  ├─ deity card ─────────▶ /library/buddhas/{id}
  └─ empty/error: "Thử lại" ▶ same URL (GET) · "Xem lịch lễ vía" ▶ /events

/library/buddhas/{id}
  ├─ 404 ────────────────▶ +error.svelte (err_404_*)
  ├─ other failure ──────▶ +error.svelte (err_data_*, "Thử lại" = reload)
  ├─ "Lịch lễ" ──────────▶ /events
  ├─ "Trì niệm…" ────────▶ /practice/mala?deity={id}
  ├─ sutra ──────────────▶ /library/sutras/{sutra.id}
  └─ "Chia sẻ" ──────────▶ (browser) navigator.share | clipboard
```

Every internal href goes through `localizeHref()`.

## Step-by-step Flow — Catalogue

```
Step 1 — Normalise the URL (this feature)
- Trigger: request GET /library/buddhas
- Pre-condition: —
- Where: library/buddhas/+page.server.ts `load`
- API: no call
    - ?page not an integer ≥ 1 or unknown ?type → 307 canonical URL (keep a valid filter)
    - valid → Step 2

Step 2 — Read one page (this feature)
- Trigger: after Step 1
- Pre-condition: page ≥ 1, type ∈ {BUDDHA, BODHISATTVA} or absent
- Where: same `load`
- API: GET /v1/deities?page=N[&type=T] (no `date` sent, ⚠️ requirements AC 17)
    - Success, items > 0 → { deities, filter }; cards show `next_via` (backend v3.0 AC 2, 24)
    - Success, items = [] and page > 1 and total_pages > 0 → 307 ?page=total_pages
    - Success, total = 0 → `buddhasEmpty` state
    - Failure (any ApiError) → { deities: null } → `buddhasEmpty` state with "Thử lại" (Try again)
    - Failure (not an ApiError) → rethrow (programming error)
```

## Step-by-step Flow — Deity page

```
Step 1 — Read the deity and related sutras, in parallel (this feature)
- Trigger: request GET /library/buddhas/{id}
- Pre-condition: —
- Where: library/buddhas/[id]/+page.server.ts `load` (Promise.allSettled)
- API: GET /v1/deities/{id}  ∥  GET /v1/deities/{id}/sutras (page 1, no role)
    - Detail success → deity (uses `next_via`, `via_events`; ignores `lunar_memorial_days`)
    - Detail 404 DEITY_NOT_FOUND → error(404)
    - Detail other failure → error(502) → root error screen with "Thử lại" (Try again) (⚠️ requirements AC 14)
    - Sutras success → sutras = items (order kept)
    - Sutras any failure (including 404 when detail succeeded) → sutras = [], log; the page still renders

Step 2 — Feast-day countdown (this feature, browser)
- Trigger: `DeityViaCard` mounts
- Pre-condition: deity.next_via ≠ null
- Where: `DeityViaCard.svelte`: `today` = `$state` assigned in `onMount` (the device's local date);
  label = `countdown(today, next_via.solar_date)` (calendar `utils/events.ts`) in `$derived`
- API: no call
    - SSR / before mount → countdown label not rendered
    - After mount → "Hôm nay" (Today) / "Ngày mai" (Tomorrow) / "Còn n ngày" (n days left) (/"Đã qua" (Past) if the date is off, ⚠️ AC 17)

Step 3 — Open the mala with the chant text (practice, added by this feature)
- Trigger: press "Trì niệm với tràng hạt" (Chant with the mala) → GET /practice/mala?deity={id}
- Pre-condition: the deity has `short_mantra_sino_vietnamese` (the button only shows when present)
- Where: practice/mala/+page.server.ts `load` (new)
- API: GET /v1/deities/{id}
    - Success, chant text present → { mantra } → MalaChant shows that text, count 0 (fresh state every page open)
    - Success without chant text / 404 / failure → { mantra: null } → default text `practice_bead_mantra`
    - No ?deity → no API call, as today
```

## Share (FR-DTY-009, browser)

`DeityShareButton` (runs only in the browser, the button is `<button type="button">`):

1. `text = shareText(deity)` — `name_vi`, a line break, `short_mantra_sino_vietnamese`, then
   `short_mantra_sanskrit` when present (empty values skipped, BR-DTY-04). Page link: ⚠️ requirements AC 24.
2. `navigator.share` available → `share({ title: name_vi, text })`; `AbortError` (visitor cancelled) → do nothing;
   other failure → step 3.
3. `navigator.clipboard.writeText(text)` → announce `buddha_d_share_copied` in an `aria-live` region;
   failure → `buddha_d_share_failed`.

Existing patterns: `LampOffering.svelte` (`navigator.share`), `OfferQr.svelte` (clipboard).

## Session & cookies

Not used. Every route of the feature is public; does not read `il_token`, does not change `locals.user`.

## SEO

`/library/buddhas` and `/library/buddhas/[id]` are public, indexable pages; `?type=`/`?page=` are
canonical URLs (Step 1). The root error screen is already `noindex`. No prerendering (data and
`next_via` change by date).

## i18n keys

| Key | Used in | ID | Change |
| --- | --- | --- | --- |
| `buddha_kind_deva` | Type label | BR-DTY-01 | change vi "Thiên hộ pháp" (Dharma-protector deva) → "Chư Thiên" (Devas); en "Dharma protector (Deva)" → "Deva" (en text proposed by the website) |
| `buddha_kind_future` | — | — | check usages; unused → delete |
| `buddha_via` | Feast-day line on the card ("Vía {date} âm lịch" (Feast day {date} lunar)) | BR-DTY-06 | keep |
| `buddha_via_leap` | Feast-day line for a leap month | BR-CAL-08 | add (⚠️ requirements AC 2) |
| `buddhas_block_empty` | Featured block empty/failed | FR-DTY-010 | add (⚠️ requirements AC 3) |
| `buddhas_empty_title`, `buddhas_empty_hint`, `buddhas_empty_calendar` | `buddhasEmpty` state | FR-DTY-010 | add (vi per the prototype: "Chưa có thông tin chư Phật" (No information on the Buddhas yet), "Chưa tải được tiểu sử và đại nguyện của chư Phật, Bồ Tát. Kiểm tra kết nối rồi thử lại." (Couldn't load the biographies and great vows of the Buddhas and Bodhisattvas. Check your connection and try again.), "Xem lịch lễ vía" (View the feast-day calendar)) |
| `err_retry` | "Thử lại" (Try again) in the catalogue | FR-DTY-010 | reuse |
| `buddhas_load_error`, `buddhas_empty` | Old error/empty line | — | delete once replaced |
| `buddha_d_via_next`, `buddha_d_via_month` ("Tháng {month}" (Month {month})), `buddha_d_via_month_1` … `_12` ("Giêng" (first), "Hai" (second) … "Chạp" (twelfth)), `buddha_d_via_leap`, `buddha_d_via_all`, `buddha_d_via_calendar` ("Lịch lễ" (Ceremony calendar)) | Feast-day card | FR-DTY-006 | add (may reuse `lunar_month_*` if the text matches — `lunar_month_1` today is "Một" (One), not "Giêng") |
| `ev_left_today`, `ev_left_tomorrow`, `ev_left_days`, `ev_left_past` | Countdown label | BR-CAL-13 | belong to the `calendar` spec (reused, no separate keys) |
| `buddha_d_memorial` | Old "Ngày vía" (Feast days) block | — | delete once the feast-day card replaces it |
| `buddha_d_read_more`, `buddha_d_read_less` | Biography | FR-DTY-005 | add |
| `buddha_d_vows_more` ("Xem đủ {count} đại nguyện" (See all {count} great vows)), `buddha_d_vows_less` ("Thu gọn" (Collapse)) | Great vows | BR-DTY-07 | add |
| `buddha_d_title_card` ("Danh hiệu" (Title)), `buddha_d_mantra_card` ("Thần chú" (Mantra)) | Mantra cards | FR-DTY-005 | add; `buddha_d_mantra_vi`, `buddha_d_mantra_sa`, `buddha_d_dharani_text` kept or deleted depending on the new layout |
| `buddha_d_mala` ("Trì niệm với tràng hạt" (Chant with the mala)) | Action | FR-DTY-008 | add |
| `buddha_d_share` ("Chia sẻ" (Share)), `buddha_d_share_copied`, `buddha_d_share_failed` | Share | FR-DTY-009 | add |
| `buddha_d_sutras` ("Kinh liên quan" (Related sutras)) | Sutras block | FR-DTY-007 | add |
| `buddha_d_footer` ("Nội dung do Ban biên tập tổng hợp từ kinh điển" (Content compiled by the editorial board from the scriptures)) | Footer | BR-DTY-08 | add |
| `buddha_d_image_placeholder` | `alt`/aria of the placeholder image (if needed) | BR-DTY-04 | add when `il-ui` needs it |
| `buddha_1` … `buddha_9`, `buddha_*_role` | Sample content | — | delete together with `content/buddhas.ts` (check with `grep` first) |

## Deliberately stubbed for now

- `next_via` / `via_events` / page of 12: not yet in `openapi.yaml` (backend deity v3.0 Phases 8–10).
  Until then, cards have no feast-day line and the deity page keeps the current `lunar_memorial_days`
  block (lunar dates only); once the contract has `via_events`, replace it entirely with
  `DeityViaCard` and stop reading `lunar_memorial_days` (deprecated, backend v3.0 AC 30). Tasks Phase 3.
- Shared `countdown`: waiting for the `calendar` spec Phase 2; the feast-day card renders without the
  countdown label in the meantime.
- `/events` still blocks guests (`calendar` spec) — the "Lịch lễ" (Ceremony calendar) link still points there.
