# Tasks — deity (Chư Phật & Bồ Tát)

Version: 1.0
Last updated: 2026-10-15
Status: in-progress (drift) — mirror `requirements.md`

> See `changelog.md` in this folder for the version history of this spec.

`[x]` chỉ khi đã kiểm tra tồn tại trong code ngày 2026-10-15 và đúng product v1.0. Mỗi mục trỏ về
một dòng của bảng Layers & components hoặc một Step trong `design.md`; "AC n" là tiêu chí trong
`requirements.md`.

## Phase 1 — UI (`il-ui`)

- [x] Route `library/buddhas/+page.svelte` + `<svelte:head>` (`buddhas_title`, `buddhas_meta_description`)
- [x] Route `library/buddhas/[id]/+page.svelte` + `<svelte:head>` (tên vị, description) (AC 12)
- [x] Chip "Tất cả / Chư Phật / Bồ Tát" là link, `aria-current` (AC 6)
- [x] `Pagination` số trang, giữ `type` (AC 5)
- [x] Khối nổi bật trên `/` và `/library` có "Xem tất cả" (AC 1)
- [ ] `features/deity/components/DeityCard.svelte` dùng chung cho `BuddhaGrid` và `BuddhaCatalog`: ảnh / giữ chỗ, nhãn loại qua `deityKindLabel`, tên, đức hạnh, dòng vía `buddha_via` / `buddha_via_leap`; bỏ `pure_land` khỏi thẻ danh mục (AC 2)
- [ ] `BuddhaGrid`: bỏ nhánh `BUDDHAS` mẫu; rỗng/lỗi → `buddhas_block_empty` + "Xem tất cả" (AC 3, ⚠️)
- [ ] `BuddhaCatalog`: trạng thái `buddhasEmpty` (vòng 佛, `buddhas_empty_title`, `buddhas_empty_hint`, nút link "Thử lại" `err_retry` về URL hiện tại, link `buddhas_empty_calendar` → `/events`) cho cả `deities: null` và `total: 0` (AC 9, 10)
- [ ] `BuddhaDetail`: sắp khối theo bảng "Thứ tự khối" ở `design.md` (pure land lên ảnh; thẻ vía sau tên; đức hạnh + nguồn kinh; tiểu sử; đại nguyện; hình tượng; 3 thẻ thần chú + hành động; kinh liên quan; chú thích) (AC 15)
- [ ] `features/deity/components/DeityViaCard.svelte`: tên vía, ngày + tên tháng âm (+ nhuận), ngày dương kèm thứ theo locale, nhãn đếm sau mount, danh sách `via_events` (mục `next_occurrence: null` chỉ có tên), nút "Lịch lễ" → `/events` (AC 17, 18, 28; Step 2 trang vị)
- [ ] Đại nguyện: 5 + `buddha_d_vows_more` / `buddha_d_vows_less`, nút `aria-expanded` (AC 19)
- [ ] Tiểu sử thu gọn (line-clamp, đo tràn sau mount) + `buddha_d_read_more` / `buddha_d_read_less`; không tràn → không nút (AC 20)
- [ ] Khối "Kinh liên quan": danh sách link `/library/sutras/{id}` với `titles.vi` (AC 21)
- [ ] Nút "Trì niệm với tràng hạt" → `/practice/mala?deity={id}`, chỉ khi có `short_mantra_sino_vietnamese` (AC 23, ⚠️)
- [ ] `features/deity/components/DeityShareButton.svelte`: Web Share → clipboard → thông báo `aria-live` (AC 24; design "Chia sẻ")
- [ ] Chú thích cuối `buddha_d_footer` (AC 25)
- [ ] `MalaChant.svelte` nhận prop `mantra?: string` (mặc định `m.practice_bead_mantra()`); `practice/mala/+page.svelte` truyền `data.mantra` (AC 23; Step 3)
- [ ] i18n (cả `messages/vi.json` và `messages/en.json`, theo bảng "i18n keys" ở `design.md`):
  - [ ] sửa `buddha_kind_deva` → vi "Chư Thiên" (AC 16)
  - [ ] thêm `buddha_via_leap`, `buddhas_block_empty`, `buddhas_empty_title`, `buddhas_empty_hint`, `buddhas_empty_calendar`
  - [ ] thêm `buddha_d_via_next`, `buddha_d_via_month`, `buddha_d_via_month_1` … `_12`, `buddha_d_via_leap`, `buddha_d_via_all`, `buddha_d_via_calendar`
  - [ ] thêm `buddha_d_read_more`, `buddha_d_read_less`, `buddha_d_vows_more`, `buddha_d_vows_less`
  - [ ] thêm `buddha_d_title_card`, `buddha_d_mantra_card`, `buddha_d_mala`, `buddha_d_share`, `buddha_d_share_copied`, `buddha_d_share_failed`, `buddha_d_sutras`, `buddha_d_footer`
  - [ ] xoá key thôi dùng sau khi `grep` không còn chỗ nào: `buddhas_load_error`, `buddhas_empty`, `buddha_d_memorial` (sau Phase 3 mục vía), `buddha_kind_future`, `buddha_1..9`, `buddha_*_role`, `buddha_d_mantra_vi/_sa`, `buddha_d_dharani_text` (nếu bố cục mới không dùng)

## Phase 2 — State & logic (`il-state`)

- [ ] `features/deity/utils.ts`: `deityKindLabel` (thay 3 bản `kindLabel` trong ba section), `viaShort(lunar_date)` ("dd/MM", cờ nhuận), `viaMonthName(month)`, `shareText(deity)` (bỏ giá trị trống), `visibleVows(vows, expanded)` (AC 2, 16, 17, 19, 24)
- [ ] Dùng `countdown(today, solarDate)` của `src/lib/utils/events.ts` (spec `calendar` Phase 2 tạo; không viết bản riêng) (AC 17, 28)
- [ ] Không có vector cho BR-DTY-06 ở website: backend chọn `next_via` (backend deity v3.0 AC 24); website chỉ đếm ngày (BR-CAL-13 — vector `countdown.json` chạy ở spec `calendar` Phase 4). Nếu sau này website tự chọn vía kế tiếp thì phải thêm task chạy `docs/product/deity/rules/deity-next-via.json`

## Phase 3 — Server data (contract-gated)

- [x] `src/lib/server/api/deities.ts`: `getTopDeities`, `listDeities`, `getDeity`, `listDeitySutras`; DTO trong `src/lib/types/deity.ts`
- [x] `(site)/+page.server.ts`, `library/+page.server.ts`: `top` cắt 6, lỗi → `null`, trang vẫn render (AC 1, 4)
- [x] `library/buddhas/+page.server.ts`: chuẩn hoá `?page`/`?type` (307), map `type`, vượt cuối → 307 trang cuối, lỗi → `deities: null` (AC 5–8; Step 1–2 danh mục)
- [x] `library/buddhas/[id]/+page.server.ts`: 404 → `error(404)`, lỗi khác → `error(502)` (AC 13, 14 — giữ cho tới khi ⚠️ AC 14 được trả lời)
- [ ] Sửa comment cũ: "20 per page" trong `deities.ts`, "Fixed by the backend (20)" trong `types/deity.ts`, "falls back to static content" ở hai `load` khối nổi bật (AC 3, 5)
- [ ] `library/buddhas/[id]/+page.server.ts`: gọi `listDeitySutras` song song (`Promise.allSettled`), lỗi → `sutras: []` + log (AC 21, 22; Step 1 trang vị)
- [ ] `practice/mala/+page.server.ts` (mới): `?deity=` → `getDeity` → `mantra` hoặc `null` (AC 23; Step 3)
- [ ] Khi backend deity v3.0 lên `openapi.yaml`: kiểm lại tên field rồi thêm `next_via` (summary), `via_events` (detail) vào `types/deity.ts`; chuyển trang vị từ `lunar_memorial_days` sang `via_events` + `DeityViaCard`, bỏ khối "Ngày vía" cũ; cập nhật dòng `Contract:` trong `requirements.md` (AC 2, 17, 18)
- [ ] Trả lời ⚠️ "hôm nay" (AC 17) trước khi quyết định có gửi `date` không; nếu gửi thì map `400 INVALID_DATE` vào nhánh lỗi chung

## Phase 4 — Tests (`il-testing`)

- [ ] Unit `features/deity/utils.spec.ts`: nhãn loại (3 loại + giá trị lạ), `viaShort` (thường / nhuận), tên tháng 1 và 12, `shareText` (đủ / thiếu Phạn / thiếu câu niệm), `visibleVows` (4, 5, 6, 48 đại nguyện)
- [ ] Unit `library/buddhas` `load` (mock `listDeities`): `?page=abc` / `?page=0` / `?type=x` → 307; vượt cuối → 307 trang cuối giữ `type`; `ApiError` → `deities: null`
- [ ] Unit `library/buddhas/[id]` `load`: 404 → 404; 5xx → 502; `/sutras` lỗi → trang vẫn có `deity`, `sutras: []`
- [ ] Unit `practice/mala` `load`: không `?deity`, có câu niệm, không câu niệm, 404, lỗi mạng
- [ ] Component `DeityShareButton`: có `navigator.share`; huỷ (`AbortError`); không có share → clipboard + `buddha_d_share_copied`; clipboard lỗi → `buddha_d_share_failed`
- [ ] Component `DeityViaCard`: không nhãn đếm khi SSR; "Hôm nay" / "Ngày mai" / "Còn n ngày" với ngày giả lập
- [ ] E2E `tests/deity.e2e.ts` (backend thật hoặc mock server): khối nổi bật 6 thẻ và "Xem tất cả" (FR-DTY-001); trang 1 = 12 thẻ, phụ đề có `total`, trang 2 = phần còn lại (FR-DTY-002); "Chư Phật" chỉ có nhãn Phật, vị Chư Thiên chỉ ở "Tất cả" (FR-DTY-003); mở vị, vị lạ → 404, backend tắt → "Thử lại" (FR-DTY-004); 48 đại nguyện → 5 + "Xem đủ 48 đại nguyện" (BR-DTY-07); không hình tượng / không đà-la-ni → khối/thẻ vắng (BR-DTY-04); kinh liên quan mở trang kinh (FR-DTY-007); tràng hạt mở với câu niệm, count 0 (FR-DTY-008); backend tắt → `buddhasEmpty` có "Thử lại" và "Xem lịch lễ vía", trang chủ không có thẻ mẫu (FR-DTY-010)
- [ ] Đo NFR-DTY-02 (đổi chip, 4G giả lập, < 2 s) một lần, ghi kết quả vào changelog

## Phase 5 — Quality (`il-quality`)

- [ ] `npm run check && npm run lint && npm run build` pass

## Phase 6 — Documentation

- [ ] Báo cột Website của `docs/product/deity/product.md` §4.2 cho `ba-writer` (skill này không sửa repo backend), kèm ghi chú FR-DTY-004 (màn hình lỗi đã có "Thử lại") và BR-DTY-08 (thiếu chú thích cuối)
- [ ] Dọn `.assumptions.md` sau khi spec được duyệt: dòng 12 "Catalogue pages" (phần `/library/buddhas`: dữ liệu mẫu, lọc phía client, không trang chi tiết — đã cũ), dòng 13 "Bottom bar" (chỉ nhắc route, kiểm lại) và dòng 23 "Home re-check" (câu "per-item detail links on buddhas … (no detail pages)" — đã cũ)
- [ ] OKF concept qua `il-okf-writer` khi feature đã kiểm end-to-end

## Deferred (not blocking deity)

- Chip "Chư Thiên" (product Appendix A mục 5).
- Link trang vị trong nội dung chia sẻ (product Appendix A mục 3).
- Kinh liên quan nhiều hơn một trang (`/sutras` trang 20; hôm nay không vị nào gần mức đó) — chỉ đọc trang 1.
