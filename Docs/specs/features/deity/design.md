# Design — deity (Chư Phật & Bồ Tát)

Version: 1.0
Last updated: 2026-10-15
Status: in-progress (drift) — mirror `requirements.md`

> See `changelog.md` in this folder for the version history of this spec.

## Overview

Ba bề mặt, đều công khai, không đọc cookie phiên: khối nổi bật trên `/` và `/library`, danh mục
`/library/buddhas` (`?type=`, `?page=`) và trang vị `/library/buddhas/[id]`. Dữ liệu đi đường chuẩn:
browser → `load` trong `+page.server.ts` → `$lib/server/api/deities.ts` → backend (`x-api-key`).
Cùng kiến trúc với `temple` (danh bạ theo URL, trang chi tiết qua `load`); phần tương tác chỉ ở
browser là đếm ngày (sau mount), thu gọn đại nguyện / tiểu sử, và chia sẻ. Code mới (logic thuần,
component thẻ vía, chia sẻ) vào `src/lib/features/deity/`; ba section hiện có giữ tên và chỗ.

## Layers & components

| Layer | File | Responsibility | Trạng thái |
| --- | --- | --- | --- |
| Route (server) | `src/routes/(site)/+page.server.ts` | `loadTopDeities` → 6 vị đầu (`HOME_DEITY_COUNT`); lỗi → `null` | có — cần: comment "falls back to static content" sai nghĩa mới (khối rỗng) |
| Route (server) | `src/routes/(site)/library/+page.server.ts` | Như trên (`LIBRARY_DEITY_COUNT` 6) | có — cần: như trên |
| Route (UI) | `src/routes/(site)/library/buddhas/+page.svelte` | Meta, `BuddhaCatalog` | có |
| Route (server) | `src/routes/(site)/library/buddhas/+page.server.ts` | Chuẩn hoá `?page`/`?type` (307), gọi `listDeities`, vượt cuối → 307 trang cuối, lỗi → `deities: null` | có ✓ |
| Route (UI) | `src/routes/(site)/library/buddhas/[id]/+page.svelte` | Meta, `BuddhaDetail` | có — cần: truyền `sutras` |
| Route (server) | `src/routes/(site)/library/buddhas/[id]/+page.server.ts` | `getDeity` ∥ `listDeitySutras` (Step 2); 404 → `error(404)`; lỗi khác → `error(502)` (⚠️ AC 14) | có — cần: gọi `/sutras` song song, lỗi `/sutras` → `sutras: []` |
| Route (server) | `src/routes/(site)/practice/mala/+page.server.ts` | `?deity=` → `getDeity` → `mantra` (Step 3) | chưa tạo |
| Route (UI) | `src/routes/(site)/practice/mala/+page.svelte` | Truyền `data.mantra` cho `MalaChant` | có — cần: prop |
| Section | `src/lib/components/sections/BuddhaGrid.svelte` | Khối nổi bật: thẻ + "Xem tất cả"; rỗng → `buddhas_block_empty` | có — cần: bỏ nhánh `BUDDHAS` mẫu, thêm dòng vía, trạng thái rỗng |
| Section | `src/lib/components/sections/BuddhaCatalog.svelte` | Chip, thẻ, `Pagination`, trạng thái rỗng/lỗi | có — cần: dòng vía thay `pure_land`, trạng thái `buddhasEmpty` có "Thử lại" + "Xem lịch lễ vía" |
| Section | `src/lib/components/sections/BuddhaDetail.svelte` | Trang vị theo bảng "Thứ tự khối" | có — cần: sắp lại khối, 3 thẻ thần chú, thẻ vía, đại nguyện / tiểu sử thu gọn, kinh liên quan, hai hành động, chú thích cuối; bỏ khối `lunar_memorial_days` |
| Section | `src/lib/components/sections/MalaChant.svelte` | Prop `mantra?: string` thay cho `m.practice_bead_mantra()` cố định | có — cần: prop |
| Feature UI | `src/lib/features/deity/components/DeityCard.svelte` | Thẻ dùng chung cho khối nổi bật và danh mục (ảnh/giữ chỗ, nhãn loại, tên, đức hạnh, dòng vía) | chưa tạo (gộp hai bản thẻ đang lặp) |
| Feature UI | `src/lib/features/deity/components/DeityViaCard.svelte` | Thẻ vía kế tiếp + danh sách `via_events` + "Lịch lễ"; nhãn đếm sau mount | chưa tạo |
| Feature UI | `src/lib/features/deity/components/DeityShareButton.svelte` | Web Share → clipboard → thông báo (`aria-live`) | chưa tạo |
| Feature logic | `src/lib/features/deity/utils.ts` | `deityKindLabel(type)` (một chỗ thay 3 bản `kindLabel`), `viaShort(lunar_date)` ("dd/MM", nhuận), `viaMonthName(month)`, `shareText(deity)`, `visibleVows(vows, expanded)` | chưa tạo |
| Shared logic | `src/lib/utils/events.ts` `countdown` | BR-CAL-13 — thuộc spec `calendar` (Phase 2 ở đó), deity chỉ dùng | chưa có (dependency) |
| API resource | `src/lib/server/api/deities.ts` | `getTopDeities`, `listDeities`, `getDeity`, `listDeitySutras` | có — cần: comment "20 per page" → đọc `page_size`; `listDeitySutras` được dùng |
| Types | `src/lib/types/deity.ts` | DTO; thêm `DeityVia`, `DeityViaEvent`, `next_via` trên `DeitySummary`, `via_events` trên `DeityDetail` đúng tên field của backend v3.0 AC 29 / requirements bảng API; `lunar_memorial_days` giữ trong type nhưng không dùng | có — cần: field mới (khi openapi có) |
| Static content | `src/lib/content/buddhas.ts`, `BUDDHAS` trong `src/lib/content/home.ts`, key `buddha_1..9`, `buddha_*_role` | Nội dung mẫu | gỡ (FR-DTY-010) — kiểm không còn chỗ dùng trước khi xoá key |
| i18n | `messages/vi.json`, `messages/en.json` | Bảng "i18n keys" | cần sửa / thêm |
| Tests | `src/lib/features/deity/utils.spec.ts`, `src/routes/(site)/library/buddhas/page.server.spec.ts`, `tests/deity.e2e.ts` | Theo `il-testing` | chưa tạo |

### Thứ tự khối của trang vị (FR-DTY-005)

| # | Khối | Nguồn | Ẩn khi |
| --- | --- | --- | --- |
| 0 | Link quay lại `buddha_d_back` → `/library/buddhas` | — | — |
| 1 | Ảnh (giữ chỗ khi `image_url` trống) + nhãn loại + `pure_land` trên ảnh | summary | `pure_land` trống → chỉ ẩn dòng đó |
| 2 | `<h1>` `name_vi`, `title_honorific`, `name_sanskrit` · `name_chinese` | summary | từng trường trống |
| 3 | Thẻ vía `DeityViaCard` | `next_via`, `via_events` | `next_via` là `null` |
| 4 | Đức hạnh (`buddha_d_virtue`) + nguồn kinh (`buddha_d_source`) | `core_virtue`, `canonical_source` | cả hai trống |
| 5 | "Tiểu sử" (`buddha_d_biography`), thu gọn + `buddha_d_read_more` / `buddha_d_read_less` | `biography_summary` | trống |
| 6 | "Đại nguyện" (`buddha_d_vows`), 5 + `buddha_d_vows_more` / `buddha_d_vows_less` | `great_vows` | `[]` |
| 7 | "Hình tượng" (`buddha_d_iconography`) | `iconography.*` | mọi trường trống |
| 8 | "Thần chú & danh hiệu" (`buddha_d_mantras`): thẻ "Danh hiệu" (`buddha_d_title_card`, `title_honorific`), "Thần chú" (`buddha_d_mantra_card`: Hán Việt rồi Phạn), "Đà-la-ni" (`buddha_d_dharani`: tên + trích) | `title_honorific`, `mantras.*` | từng thẻ trống; cả ba trống → cả khối (hành động vẫn hiện ở cuối khối nếu có) |
| 9 | Hành động: "Trì niệm với tràng hạt" (khi có `short_mantra_sino_vietnamese`), "Chia sẻ" | — | — |
| 10 | "Kinh liên quan" (`buddha_d_sutras`) | `/sutras` `items` | `[]` hoặc lỗi |
| 11 | Chú thích `buddha_d_footer` | — | — |

> ⚠️ Not confirmed: khối hành động (#9) khi cả ba thẻ thần chú trống — hiện riêng hay ẩn cùng khối; mặc định: nút "Chia sẻ" vẫn hiện (FR-DTY-009 không có điều kiện), mala tự ẩn vì không có câu niệm.

## Route & navigation flow

```
/  ,  /library
  ├─ thẻ vị ──────────────▶ /library/buddhas/{id}
  └─ "Xem tất cả" ────────▶ /library/buddhas

/library/buddhas[?type=buddha|bodhisattva][&page=N]
  ├─ ?page / ?type sai ──▶ 307 URL chuẩn
  ├─ page > total_pages ─▶ 307 ?page=total_pages
  ├─ chip ───────────────▶ ?type=… (trang 1)
  ├─ số trang ───────────▶ ?page=N (giữ type)
  ├─ thẻ vị ─────────────▶ /library/buddhas/{id}
  └─ rỗng/lỗi: "Thử lại" ▶ cùng URL (GET) · "Xem lịch lễ vía" ▶ /events

/library/buddhas/{id}
  ├─ 404 ────────────────▶ +error.svelte (err_404_*)
  ├─ lỗi khác ───────────▶ +error.svelte (err_data_*, "Thử lại" = reload)
  ├─ "Lịch lễ" ──────────▶ /events
  ├─ "Trì niệm…" ────────▶ /practice/mala?deity={id}
  ├─ kinh ───────────────▶ /library/sutras/{sutra.id}
  └─ "Chia sẻ" ──────────▶ (browser) navigator.share | clipboard
```

Mọi href nội bộ qua `localizeHref()`.

## Step-by-step Flow — Danh mục

```
Step 1 — Chuẩn hoá URL (this feature)
- Trigger: request GET /library/buddhas
- Pre-condition: —
- Where: library/buddhas/+page.server.ts `load`
- API: không gọi
    - ?page không phải số nguyên ≥ 1 hoặc ?type lạ → 307 URL chuẩn (giữ filter hợp lệ)
    - hợp lệ → Step 2

Step 2 — Đọc một trang (this feature)
- Trigger: sau Step 1
- Pre-condition: page ≥ 1, type ∈ {BUDDHA, BODHISATTVA} hoặc không có
- Where: cùng `load`
- API: GET /v1/deities?page=N[&type=T] (không gửi `date`, ⚠️ requirements AC 17)
    - Success, items > 0 → { deities, filter }; thẻ hiện `next_via` (backend v3.0 AC 2, 24)
    - Success, items = [] và page > 1 và total_pages > 0 → 307 ?page=total_pages
    - Success, total = 0 → trạng thái `buddhasEmpty`
    - Failure (ApiError bất kỳ) → { deities: null } → trạng thái `buddhasEmpty` có "Thử lại"
    - Failure (không phải ApiError) → ném lại (lỗi lập trình)
```

## Step-by-step Flow — Trang vị

```
Step 1 — Đọc vị và kinh liên quan, song song (this feature)
- Trigger: request GET /library/buddhas/{id}
- Pre-condition: —
- Where: library/buddhas/[id]/+page.server.ts `load` (Promise.allSettled)
- API: GET /v1/deities/{id}  ∥  GET /v1/deities/{id}/sutras (trang 1, không role)
    - Detail success → deity (dùng `next_via`, `via_events`; bỏ qua `lunar_memorial_days`)
    - Detail 404 DEITY_NOT_FOUND → error(404)
    - Detail lỗi khác → error(502) → màn hình lỗi gốc có "Thử lại" (⚠️ requirements AC 14)
    - Sutras success → sutras = items (thứ tự giữ nguyên)
    - Sutras lỗi bất kỳ (kể cả 404 khi detail thành công) → sutras = [], log; trang vẫn render

Step 2 — Đếm ngày vía (this feature, browser)
- Trigger: `DeityViaCard` mount
- Pre-condition: deity.next_via ≠ null
- Where: `DeityViaCard.svelte`: `today` = `$state` gán trong `onMount` (ngày local của máy);
  nhãn = `countdown(today, next_via.solar_date)` (calendar `utils/events.ts`) trong `$derived`
- API: không gọi
    - SSR / trước mount → không render nhãn đếm
    - Sau mount → "Hôm nay" / "Ngày mai" / "Còn n ngày" (/"Đã qua" nếu lệch ngày, ⚠️ AC 17)

Step 3 — Mở tràng hạt với câu niệm (practice, do feature này thêm)
- Trigger: bấm "Trì niệm với tràng hạt" → GET /practice/mala?deity={id}
- Pre-condition: vị có `short_mantra_sino_vietnamese` (nút chỉ hiện khi có)
- Where: practice/mala/+page.server.ts `load` (mới)
- API: GET /v1/deities/{id}
    - Success, có câu niệm → { mantra } → MalaChant hiện câu đó, count 0 (state mới mỗi lần mở trang)
    - Success không có câu niệm / 404 / lỗi → { mantra: null } → câu mặc định `practice_bead_mantra`
    - Không có ?deity → không gọi API, như hôm nay
```

## Chia sẻ (FR-DTY-009, browser)

`DeityShareButton` (chỉ chạy trong browser, nút là `<button type="button">`):

1. `text = shareText(deity)` — `name_vi`, xuống dòng, `short_mantra_sino_vietnamese`, rồi
   `short_mantra_sanskrit` khi có (giá trị trống bỏ qua, BR-DTY-04). Link trang: ⚠️ requirements AC 24.
2. Có `navigator.share` → `share({ title: name_vi, text })`; `AbortError` (khách huỷ) → không làm gì;
   lỗi khác → bước 3.
3. `navigator.clipboard.writeText(text)` → thông báo `buddha_d_share_copied` trong vùng `aria-live`;
   lỗi → `buddha_d_share_failed`.

Mẫu có sẵn: `LampOffering.svelte` (`navigator.share`), `OfferQr.svelte` (clipboard).

## Session & cookies

Không dùng. Mọi route của feature công khai; không đọc `il_token`, không đổi `locals.user`.

## SEO

`/library/buddhas` và `/library/buddhas/[id]` là trang công khai, index được; `?type=`/`?page=` là
URL chuẩn (Step 1). Màn hình lỗi gốc đã `noindex`. Không prerender (dữ liệu và `next_via` đổi theo
ngày).

## i18n keys

| Key | Dùng ở | ID | Thay đổi |
| --- | --- | --- | --- |
| `buddha_kind_deva` | Nhãn loại | BR-DTY-01 | sửa vi "Thiên hộ pháp" → "Chư Thiên"; en "Dharma protector (Deva)" → "Deva" (chữ en do website đề xuất) |
| `buddha_kind_future` | — | — | kiểm chỗ dùng; không dùng → xoá |
| `buddha_via` | Dòng vía trên thẻ ("Vía {date} âm lịch") | BR-DTY-06 | giữ |
| `buddha_via_leap` | Dòng vía khi tháng nhuận | BR-CAL-08 | thêm (⚠️ requirements AC 2) |
| `buddhas_block_empty` | Khối nổi bật rỗng/lỗi | FR-DTY-010 | thêm (⚠️ requirements AC 3) |
| `buddhas_empty_title`, `buddhas_empty_hint`, `buddhas_empty_calendar` | Trạng thái `buddhasEmpty` | FR-DTY-010 | thêm (vi theo prototype: "Chưa có thông tin chư Phật", "Chưa tải được tiểu sử và đại nguyện của chư Phật, Bồ Tát. Kiểm tra kết nối rồi thử lại.", "Xem lịch lễ vía") |
| `err_retry` | "Thử lại" ở danh mục | FR-DTY-010 | dùng lại |
| `buddhas_load_error`, `buddhas_empty` | Dòng lỗi/rỗng cũ | — | xoá sau khi thay |
| `buddha_d_via_next`, `buddha_d_via_month` ("Tháng {month}"), `buddha_d_via_month_1` … `_12` ("Giêng", "Hai" … "Chạp"), `buddha_d_via_leap`, `buddha_d_via_all`, `buddha_d_via_calendar` ("Lịch lễ") | Thẻ vía | FR-DTY-006 | thêm (có thể dùng lại `lunar_month_*` nếu chữ khớp — `lunar_month_1` hôm nay là "Một", không phải "Giêng") |
| `ev_left_today`, `ev_left_tomorrow`, `ev_left_days`, `ev_left_past` | Nhãn đếm | BR-CAL-13 | của spec `calendar` (dùng lại, không tạo key riêng) |
| `buddha_d_memorial` | Khối "Ngày vía" cũ | — | xoá khi thẻ vía thay |
| `buddha_d_read_more`, `buddha_d_read_less` | Tiểu sử | FR-DTY-005 | thêm |
| `buddha_d_vows_more` ("Xem đủ {count} đại nguyện"), `buddha_d_vows_less` ("Thu gọn") | Đại nguyện | BR-DTY-07 | thêm |
| `buddha_d_title_card` ("Danh hiệu"), `buddha_d_mantra_card` ("Thần chú") | Thẻ thần chú | FR-DTY-005 | thêm; `buddha_d_mantra_vi`, `buddha_d_mantra_sa`, `buddha_d_dharani_text` giữ hoặc xoá theo bố cục mới |
| `buddha_d_mala` ("Trì niệm với tràng hạt") | Hành động | FR-DTY-008 | thêm |
| `buddha_d_share` ("Chia sẻ"), `buddha_d_share_copied`, `buddha_d_share_failed` | Chia sẻ | FR-DTY-009 | thêm |
| `buddha_d_sutras` ("Kinh liên quan") | Khối kinh | FR-DTY-007 | thêm |
| `buddha_d_footer` ("Nội dung do Ban biên tập tổng hợp từ kinh điển") | Chân trang | BR-DTY-08 | thêm |
| `buddha_d_image_placeholder` | `alt`/aria của ảnh giữ chỗ (nếu cần) | BR-DTY-04 | thêm khi `il-ui` cần |
| `buddha_1` … `buddha_9`, `buddha_*_role` | Nội dung mẫu | — | xoá cùng `content/buddhas.ts` (kiểm `grep` trước) |

## Deliberately stubbed for now

- `next_via` / `via_events` / trang 12: chưa có trong `openapi.yaml` (backend deity v3.0 Phase 8–10).
  Cho tới khi có, thẻ không có dòng vía và trang vị giữ khối `lunar_memorial_days` hiện tại (chỉ
  ngày âm); khi contract có `via_events` thì thay hẳn bằng `DeityViaCard` và không đọc
  `lunar_memorial_days` nữa (deprecated, backend v3.0 AC 30). Tasks Phase 3.
- `countdown` chung: chờ spec `calendar` Phase 2; thẻ vía render được không có nhãn đếm trong lúc chờ.
- `/events` còn chặn khách (spec `calendar`) — link "Lịch lễ" vẫn trỏ về đó.
