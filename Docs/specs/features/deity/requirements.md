# Requirements — deity (Chư Phật & Bồ Tát)

Version: 1.0
Last updated: 2026-10-15
Status: in-progress (drift) — khối nổi bật ở `/` và `/library` (6 vị đầu của `top`), danh mục `/library/buddhas` (lọc `?type=`, phân trang `?page=`, chuẩn hoá URL, vượt cuối → trang cuối) và trang `/library/buddhas/[id]` đang chạy với backend thật. Còn: nhãn "Chư Thiên", ngày vía từ lịch lễ (vía kế tiếp trên thẻ + thẻ vía có đếm ngày trên trang), thứ tự khối theo prototype, đại nguyện thu gọn 5, tiểu sử "Đọc thêm", kinh liên quan, tràng hạt, chia sẻ, chú thích cuối trang, trạng thái rỗng/lỗi theo prototype thay cho nội dung mẫu, test.
Feature folder: `src/routes/(site)/library/buddhas/`, `src/routes/(site)/+page.server.ts` + `src/routes/(site)/library/+page.server.ts` (khối nổi bật), `src/lib/components/sections/{BuddhaCatalog,BuddhaGrid,BuddhaDetail}.svelte`, `src/lib/server/api/deities.ts`, `src/lib/types/deity.ts`; mới: `src/lib/features/deity/`
Product spec: innerlamp-be `docs/product/deity/product.md` @ v1.0
Contract: innerlamp-be `docs/specs/api/openapi.yaml` @ a8a016b (`info.version` 1.0.0, tag Deities: `GET /v1/deities/top`, `GET /v1/deities`, `GET /v1/deities/{id}`; tag Sutras/Deities: `GET /v1/deities/{id}/sutras`) — hình dạng hiện tại: trang 20, chỉ có `lunar_memorial_days`. Thay đổi đã lên kế hoạch, **chưa có trong `openapi.yaml`**: backend deity `docs/specs/features/deity/requirements.md` v3.0 (9794992) — trang 12 (AC 5), `next_via` trên summary và chi tiết (AC 2, 8, 24, 29), `via_events` trên chi tiết (AC 28), tham số `date` + `400 INVALID_DATE` (AC 25, 26), `lunar_memorial_days` deprecated (AC 30), kinh liên quan chỉ qua `/sutras` (AC 34).
Implements: BR-DTY-01, BR-DTY-02, BR-DTY-03, BR-DTY-04, BR-DTY-05, BR-DTY-06, BR-DTY-07, BR-DTY-08, FR-DTY-001, FR-DTY-002 (§3.6: số trang), FR-DTY-003, FR-DTY-004, FR-DTY-005, FR-DTY-006, FR-DTY-007, FR-DTY-008, FR-DTY-009 (§3.6: Web Share hoặc chép), FR-DTY-010, NFR-DTY-01, NFR-DTY-02; liên quan BR-CAL-08, BR-CAL-12, BR-CAL-13 (calendar)

> See `changelog.md` in this folder for the version history of this spec.

Spec này viết retroactively từ code đang chạy (đọc ngày 2026-10-15), đối chiếu với product spec v1.0; phần chưa có viết theo kiểu prospective trong cùng file. Route: `/library/buddhas`, `/library/buddhas/[id]`, khối trên `/` và `/library` (`/en/...`).

Hành vi sản phẩm (loại và nhãn, thứ tự, cỡ trang, ẩn giá trị trống, nguồn ngày vía, cách chọn vía kế tiếp, đại nguyện thu gọn, chân trang) nằm ở product spec và **không** nhắc lại ở đây; file này chỉ nói website hiện thực các ID đó thế nào. Không áp dụng cho website (cột Website `n/a`): FR-DTY-011.

## Ràng buộc từ product spec

- **Công khai, chỉ đọc** (product §2.3): mọi route của feature không cần phiên; không có lời mời đăng nhập.
- **Website chỉ online** (§3.6 dòng §2.4): không có bản sao offline; backend lỗi → trạng thái lỗi có "Thử lại".
- **Ngày vía do backend đưa** (BR-DTY-05; backend v3.0 AC 23, 24, 28): website không tự đổi âm ↔ dương và không tự chọn vía kế tiếp; chỉ tính đếm ngày (BR-CAL-13) trong browser.
- **Không nội dung mẫu** (FR-DTY-010): `src/lib/content/buddhas.ts` và `BUDDHAS` của `content/home.ts` bị gỡ khỏi đường hiển thị.

## Dependencies

- **calendar** (`Docs/specs/features/calendar/`): hàm `countdown(today, solarDate)` + map nhãn trong `src/lib/utils/events.ts` (calendar `tasks.md` Phase 2, chưa có) — deity dùng lại, không viết bản riêng; trang `/events` là đích của "Lịch lễ" / "Xem lịch lễ vía" và hôm nay **còn chặn khách** (lệch FR-CAL-001, sửa ở spec calendar).
- **sutra**: trang `/library/sutras/[slug]` (slug = `id` của sutra) là đích của "Kinh liên quan".
- **practice / mala**: `/practice/mala` (`MalaChant.svelte`) hôm nay không nhận câu niệm — task ở Phase 1/3 của spec này.

## User Story

Là một khách thăm website (đăng nhập hay chưa), tôi muốn xem danh mục chư Phật, Bồ Tát, Chư Thiên và trang của từng vị — tiểu sử, đại nguyện, ngày vía sắp tới, thần chú, kinh liên quan — để tìm hiểu và bắt đầu trì niệm. (product §1.3)

## Acceptance Criteria (EARS notation)

### Khối nổi bật (`/`, `/library`)

1. WHEN khách mở `/` hoặc `/library`, THE SYSTEM SHALL gọi `GET /v1/deities/top` từ server và hiển thị 6 thẻ đầu tiên theo đúng thứ tự nhận được (§3.6: website 6), kèm link "Xem tất cả" (`view_all`) tới `localizeHref('/library/buddhas')`; mỗi thẻ là link tới `/library/buddhas/{id}`. (FR-DTY-001, BR-DTY-02) — ✓ (link "Xem tất cả" là `SectionHeading` mặc định).
2. WHEN một thẻ (khối nổi bật hoặc danh mục) được hiển thị, THE SYSTEM SHALL cho thấy ảnh (hoặc ảnh giữ chỗ khi không có ảnh), nhãn loại, tên, đức hạnh cốt lõi (ẩn khi trống) và dòng vía kế tiếp `buddha_via` theo `next_via.lunar_date` (ẩn khi `next_via` là `null`). (FR-DTY-002, BR-DTY-04, BR-DTY-06) — lệch: chưa có dòng vía (contract chưa có `next_via`); thẻ danh mục hiện thêm `pure_land` không có trong §3.1.1.
   > ⚠️ Not confirmed (product): một vía rơi vào tháng nhuận hiện trên thẻ thế nào ("Vía dd/MM âm lịch" có thêm "nhuận" như BR-CAL-08 không) — chặn chữ của `buddha_via` khi `lunar_date.is_leap_month`; mặc định đề xuất: thêm "nhuận" sau tháng (`buddha_via_leap`); hand back to ba-writer in innerlamp-be.
3. WHEN `GET /v1/deities/top` lỗi (mạng / 5xx) hoặc trả `items: []`, THE SYSTEM SHALL hiển thị trạng thái rỗng của khối (không thẻ nào) và vẫn giữ "Xem tất cả"; THE SYSTEM SHALL NOT hiển thị vị mẫu từ `content/buddhas.ts`. (FR-DTY-010, BR-DTY-02) — lệch: hiện 6 vị mẫu với ngày vía viết cứng.
   > ⚠️ Not confirmed (product): chữ và bố cục trạng thái rỗng của khối "Thư viện Phật & Bồ Tát" ở trang chủ / thư viện (prototype chỉ vẽ `buddhasEmpty` cho danh mục; bản web không có) — chặn key `buddhas_block_empty`; mặc định đề xuất: một dòng ngắn "Chưa có thông tin chư Phật" + "Xem tất cả"; hand back to ba-writer in innerlamp-be.
4. WHEN `GET /v1/deities/top` lỗi, THE SYSTEM SHALL vẫn render phần còn lại của `/` và `/library` (lỗi một khối không làm hỏng trang). (platform) — ✓.

### Danh mục `/library/buddhas`

5. WHEN khách mở `/library/buddhas`, THE SYSTEM SHALL gọi `GET /v1/deities?page=N[&type=T]` từ server, hiển thị một trang thẻ theo thứ tự nhận được, phụ đề `buddhas_page_sub` với `total`, và thanh số trang (`Pagination`) khi `total_pages > 1`; số thẻ mỗi trang là `page_size` backend trả (12 theo BR-DTY-03, backend v3.0 AC 5), website không tự giả định cỡ trang. (FR-DTY-002, BR-DTY-03, NFR-DTY-01) — ✓ (hôm nay backend trả 20, đổi khi backend v3.0 ship; chỉ cần sửa chú thích `page_size` trong `types/deity.ts`).
6. WHEN khách chọn chip "Tất cả" / "Chư Phật" / "Bồ Tát" (`buddhas_tab_*`), THE SYSTEM SHALL điều hướng tới `/library/buddhas`, `?type=buddha`, `?type=bodhisattva` (trang 1) và server gửi `type` `BUDDHA` / `BODHISATTVA` tương ứng; không có chip Chư Thiên, vị Chư Thiên chỉ có ở "Tất cả". (FR-DTY-003, BR-DTY-01) — ✓.
7. WHEN URL có `?page=` không phải số nguyên ≥ 1 hoặc `?type=` lạ, THE SYSTEM SHALL redirect 307 tới URL chuẩn (giữ bộ lọc hợp lệ, bỏ `page=1`). (platform) — ✓.
8. WHEN `?page=` vượt quá trang cuối (backend trả `items: []` với `total_pages > 0`), THE SYSTEM SHALL redirect 307 tới trang cuối, giữ bộ lọc. (FR-DTY-002 §3.6, BR-DTY-03) — ✓.
9. WHEN `GET /v1/deities` lỗi (mạng / 5xx / 4xx bất ngờ) hoặc trả `total: 0`, THE SYSTEM SHALL hiển thị trạng thái rỗng theo prototype `buddhasEmpty`: tiêu đề `buddhas_empty_title`, gợi ý kiểm tra kết nối `buddhas_empty_hint`, nút "Thử lại" (`err_retry`, là link GET về đúng URL hiện tại nên chạy lại `load`, không cần JS) và link "Xem lịch lễ vía" (`buddhas_empty_calendar`) tới `localizeHref('/events')`. (FR-DTY-010) — lệch: hiện một dòng `buddhas_load_error` / `buddhas_empty`, không có nút nào.
   > ⚠️ Not confirmed (product): khi một bộ lọc ("Chư Phật" / "Bồ Tát") trả `total: 0` trong lúc cả danh mục vẫn có vị, có dùng cùng trạng thái `buddhasEmpty` (gợi ý "kiểm tra kết nối" sẽ sai nghĩa) hay một dòng "không có vị nào thuộc loại này" — chặn nhánh `total: 0` có `type`; mặc định đề xuất: cùng trạng thái, bỏ dòng gợi ý; hand back to ba-writer in innerlamp-be.
10. WHEN khách bấm "Thử lại" và backend đã trả lời được, THE SYSTEM SHALL hiển thị trang đang xem (trang 1 nếu đi từ URL gốc). (FR-DTY-010) — chưa có.
11. WHEN khách đổi chip, THE SYSTEM SHALL hiển thị trang đầu của bộ lọc mới trong 2 s trên 4G (một lần gọi `GET /v1/deities` duy nhất, không tải cả danh mục). (NFR-DTY-02, NFR-DTY-01) — chưa đo.

### Trang vị `/library/buddhas/[id]`

12. WHEN khách mở `/library/buddhas/{id}`, THE SYSTEM SHALL gọi song song `GET /v1/deities/{id}` và `GET /v1/deities/{id}/sutras` từ server và hiển thị trang không cần đăng nhập; `<title>` = `name_vi` · `app_name`, meta description = đức hạnh / tiểu sử / `buddhas_meta_description`. (FR-DTY-004) — ✓ một phần (chưa gọi `/sutras`).
13. WHEN `GET /v1/deities/{id}` trả 404 `DEITY_NOT_FOUND`, THE SYSTEM SHALL trả HTTP 404 với màn hình "không tìm thấy" có lối quay lại. (FR-DTY-004) — ✓ (`+error.svelte` gốc: `err_404_*`, về trang chủ / quay lại).
14. WHEN `GET /v1/deities/{id}` lỗi (mạng / 5xx / 4xx khác 404), THE SYSTEM SHALL hiển thị thông báo lỗi kèm "Thử lại" (`err_retry`). (FR-DTY-004) — ✓ theo code: `error(502)` → `+error.svelte` gốc có `err_data_*` + nút `err_retry` (tải lại trang).
    > ⚠️ Not confirmed (product): §4.2 ghi website FR-DTY-004 là `drift` ("error page instead of retry") nhưng màn hình lỗi gốc đã có "Thử lại" — màn hình lỗi chung (HTTP 502, noindex) có đạt FR-DTY-004 không, hay phải là trạng thái lỗi trong khung trang vị — chặn việc giữ `error(502)`; mặc định đề xuất: giữ màn hình chung (giống `temple` FR-TPL-006); hand back to ba-writer in innerlamp-be.
15. WHEN trang vị được hiển thị, THE SYSTEM SHALL xếp khối đúng thứ tự FR-DTY-005 (bảng "Thứ tự khối" ở `design.md`) và ẩn mọi trường / khối / thẻ chú trống theo BR-DTY-04. (FR-DTY-005, BR-DTY-04) — lệch: `pure_land` đang nằm trong thẻ đức hạnh thay vì trên ảnh; "Ngày vía" nằm sau đại nguyện; thần chú là 4 dòng chứ không phải 3 thẻ "Danh hiệu / Thần chú / Đà-la-ni".
16. WHEN nhãn loại được hiển thị ở bất kỳ đâu (thẻ, trang vị), THE SYSTEM SHALL dùng `buddha_kind_buddha` / `buddha_kind_bodhisattva` / `buddha_kind_deva` với chữ vi "Phật" / "Bồ Tát" / "Chư Thiên". (BR-DTY-01) — lệch: `buddha_kind_deva` vi là "Thiên hộ pháp" (en "Dharma protector (Deva)").
17. WHEN vị có `next_via`, THE SYSTEM SHALL hiển thị thẻ vía kế tiếp: tên sự kiện, ngày và tên tháng âm ("THÁNG GIÊNG" … "THÁNG CHẠP", có "nhuận" khi `is_leap_month`), ngày dương kèm thứ (định dạng theo locale), nhãn đếm ngày theo BR-CAL-13 tính trong browser từ ngày của máy sau khi mount, danh sách mọi `via_events` theo thứ tự nhận được, và nút "Lịch lễ" (`buddha_d_via_calendar`) tới `localizeHref('/events')`; vị không có `next_via` thì không có thẻ vía. (FR-DTY-006, BR-DTY-05, BR-DTY-06, BR-CAL-08, BR-CAL-13) — lệch: hiện danh sách `lunar_memorial_days` (chỉ ngày âm, không đếm ngày, không link lịch).
    > ⚠️ Not confirmed: chọn "hôm nay" cho `next_via` — server SvelteKit không biết ngày của máy khách; mặc định đề xuất: không gửi `date` (backend dùng ngày Việt Nam, AC 25), còn nhãn đếm ngày tính bằng ngày máy trong browser; khách ở múi giờ khác UTC+7 quanh nửa đêm có thể thấy `next_via` lệch một ngày (nhãn "Đã qua" hoặc bỏ sót vía hôm nay) — chặn Step 1 của flow trang vị và khối nổi bật.
18. WHEN một mục `via_events` có `next_occurrence: null`, THE SYSTEM SHALL vẫn liệt kê tên sự kiện, không có ngày. (FR-DTY-006, BR-DTY-04) — chưa có.
19. WHEN vị có hơn 5 đại nguyện, THE SYSTEM SHALL hiển thị 5 đại nguyện đầu và nút `buddha_d_vows_more` ({count}) mở ra đủ, rồi `buddha_d_vows_less`; ≤ 5 thì không có nút; đánh số từ 1 theo thứ tự nhận được. (BR-DTY-07) — lệch: hiện tất cả.
20. WHEN tiểu sử dài hơn chiều cao thu gọn, THE SYSTEM SHALL thu gọn với nút `buddha_d_read_more` / `buddha_d_read_less`; tiểu sử ngắn thì không có nút. (FR-DTY-005) — lệch: hiện toàn bộ.
21. WHEN `GET /v1/deities/{id}/sutras` trả ít nhất một mục, THE SYSTEM SHALL hiển thị khối "Kinh liên quan" (`buddha_d_sutras`) liệt kê các kinh theo thứ tự nhận được, mỗi mục là link tới `localizeHref('/library/sutras/{sutra.id}')`; `items: []` thì không có khối. (FR-DTY-007, BR-DTY-04) — chưa có (`listDeitySutras` định nghĩa nhưng không dùng).
    > ⚠️ Not confirmed (product): thứ tự "in the sutra library's order" (FR-DTY-007) so với thứ tự của `/sutras` (vai `SUBJECT` → `SPEAKER` → `MENTIONED`, rồi thứ tự biên tập) — câu đã nêu ở backend deity v3.0; website hiển thị đúng thứ tự nhận được, không tự sắp lại; hand back to ba-writer in innerlamp-be.
22. WHEN `GET /v1/deities/{id}/sutras` lỗi, THE SYSTEM SHALL vẫn hiển thị trang vị, chỉ ẩn khối "Kinh liên quan" (log lỗi phía server). (platform)
23. WHEN vị có `mantras.short_mantra_sino_vietnamese`, THE SYSTEM SHALL hiển thị nút "Trì niệm với tràng hạt" (`buddha_d_mala`) dưới các thẻ thần chú, là link tới `localizeHref('/practice/mala?deity={id}')`; trang tràng hạt mở với câu niệm là `short_mantra_sino_vietnamese` của vị đó và số đếm 0; vị không có câu này thì không có nút. (FR-DTY-008, BR-DTY-04) — chưa có.
    > ⚠️ Not confirmed: tham số của trang tràng hạt — `?deity={id}` (server đọc lại câu niệm từ backend; không cho URL chèn chữ tuỳ ý lên trang) hay `?text=` (không gọi thêm API) — chặn Step 3 và task mala; mặc định đề xuất: `?deity={id}`; `id` lạ / backend lỗi → câu niệm mặc định hiện tại `practice_bead_mantra`.
24. WHEN khách bấm "Chia sẻ" (`buddha_d_share`), THE SYSTEM SHALL dùng `navigator.share` với tên vị và câu niệm (Hán Việt, rồi Phạn khi có) khi trình duyệt hỗ trợ; nếu không có hoặc bị từ chối (trừ khi khách tự huỷ), THE SYSTEM SHALL chép cùng nội dung bằng `navigator.clipboard.writeText` và báo `buddha_d_share_copied`; chép cũng lỗi thì báo `buddha_d_share_failed`. (FR-DTY-009 §3.6, BR-DTY-04) — chưa có.
    > ⚠️ Not confirmed (product): nội dung chia sẻ có kèm link trang vị trên web không (product Appendix A mục 3) — chặn chuỗi chia sẻ; mặc định: chưa kèm link cho tới khi product trả lời.
25. WHEN trang vị được hiển thị, THE SYSTEM SHALL có chú thích cuối trang `buddha_d_footer` ("Nội dung do Ban biên tập tổng hợp từ kinh điển") và SHALL NOT có "Báo thông tin sai", yêu thích hay theo dõi. (BR-DTY-08) — lệch nhỏ: không có hành động thừa nào, nhưng chưa có chú thích.

### Chung

26. WHEN bất kỳ chuỗi nào của feature được hiển thị (kể cả `alt`, `aria-label`, `<title>`, meta, thông báo chia sẻ), THE SYSTEM SHALL lấy từ Paraglide `m.*` với key có ở cả `messages/vi.json` và `messages/en.json`; dữ liệu nội dung (tên, tiểu sử, thần chú, tên sự kiện) hiển thị nguyên văn từ backend. (platform)
27. WHEN gọi backend, THE SYSTEM SHALL chỉ gọi từ SvelteKit server qua `$lib/server/api/deities.ts` với `x-api-key`; không route nào của feature đọc cookie phiên. (platform) — ✓.
28. WHEN nhãn đếm ngày chưa tính được (SSR, trước mount), THE SYSTEM SHALL không render nhãn đếm (tránh lệch ngày giữa server và máy). (platform, BR-CAL-13)

## Dữ liệu & API (gọi từ SvelteKit server)

Header chung: `x-api-key` từ `API_KEY`; không Bearer (route công khai).

| Thao tác | Operation (openapi) | Gọi từ | Ghi chú |
| --- | --- | --- | --- |
| Khối nổi bật | `GET /v1/deities/top` | `load` của `(site)/+page.server.ts`, `(site)/library/+page.server.ts` | ≤ 10, website cắt 6. `next_via` theo backend v3.0 AC 2, 24 (chưa có trong openapi) |
| Danh mục | `GET /v1/deities?page=&type=` | `load` của `library/buddhas/+page.server.ts` | `page_size` 12 theo backend v3.0 AC 5 (openapi còn 20); `next_via` như trên |
| Trang vị | `GET /v1/deities/{id}` | `load` của `library/buddhas/[id]/+page.server.ts` | Dùng `next_via` + `via_events` (backend v3.0 AC 8, 28, 29); **không** dùng `lunar_memorial_days` (deprecated, AC 30) |
| Kinh liên quan | `GET /v1/deities/{id}/sutras` | cùng `load`, song song | Trang 1, không `role`; thứ tự giữ như nhận |
| Câu niệm cho tràng hạt | `GET /v1/deities/{id}` | `load` mới của `practice/mala/+page.server.ts` khi có `?deity=` | ⚠️ AC 23 |
| "Hôm nay" | tham số `date` (backend v3.0 AC 25) | — | Mặc định không gửi (⚠️ AC 17) |

## Error → UI mapping

| Operation | Failure case | Visitor sees | Hiện trạng code |
| --- | --- | --- | --- |
| `GET /v1/deities/top` | mạng / 5xx | Khối rỗng `buddhas_block_empty` (⚠️ AC 3) + "Xem tất cả"; phần còn lại của trang vẫn hiện | lệch — 6 vị mẫu từ `content/buddhas.ts` |
| `GET /v1/deities/top` | `items: []` | như trên | lệch — 6 vị mẫu |
| `GET /v1/deities` | mạng / 5xx / 4xx bất ngờ | `buddhas_empty_title` + `buddhas_empty_hint` + `err_retry` + `buddhas_empty_calendar` | lệch — chỉ `buddhas_load_error` |
| `GET /v1/deities` | `total: 0` | như trên (⚠️ AC 9 khi có `type`) | lệch — chỉ `buddhas_empty` |
| `GET /v1/deities` | 400 `INVALID_PAGE` / `INVALID_DEITY_TYPE` (website đã chuẩn hoá URL nên không xảy ra) | như mạng / 5xx (log mã lỗi) | ✓ (rơi vào nhánh lỗi chung) |
| `GET /v1/deities` | trang vượt cuối | 307 về trang cuối | ✓ |
| `GET /v1/deities{,/top,/{id}}` | 400 `INVALID_DATE` (chỉ khi gửi `date`; mặc định không gửi) | như mạng / 5xx | chưa áp dụng |
| `GET /v1/deities/{id}` | 404 `DEITY_NOT_FOUND` | HTTP 404, `err_404_*` (về trang chủ / quay lại) | ✓ |
| `GET /v1/deities/{id}` | mạng / 5xx | `err_data_*` + `err_retry` (màn hình lỗi gốc, ⚠️ AC 14) | ✓ |
| `GET /v1/deities/{id}/sutras` | mọi lỗi | Trang vị vẫn hiện, không có khối "Kinh liên quan" | chưa có (chưa gọi) |
| `GET /v1/deities/{id}` (từ `/practice/mala?deity=`) | 404 / mạng / 5xx | Tràng hạt với câu niệm mặc định `practice_bead_mantra` | chưa có |
| Chia sẻ (browser) | không có `navigator.share` / lỗi | Chép, báo `buddha_d_share_copied`; chép lỗi → `buddha_d_share_failed` | chưa có |
| mọi trang | trình duyệt offline | `OfflineGate` (`offline_*`) | ✓ |

## Out of scope

- Tìm kiếm trong danh mục, "Báo thông tin sai", yêu thích, theo dõi, nhắc ngày vía, màn chia sẻ 3 thẻ (product §1.2).
- Bản sao offline (§3.6: website chỉ online).
- Nội dung trang lịch lễ `/events` và trang kinh `/library/sutras/[slug]` (spec `calendar`, `sutra`).
- Chip "Chư Thiên" (product Appendix A mục 5, không chặn).
- Chuẩn hoá `/vi/...` và sitemap (follow-up chung của site).

## Pending (not yet implemented)

- Nhãn "Chư Thiên" — Phase 1 (i18n).
- Dòng vía trên thẻ, thẻ vía + danh sách vía + "Lịch lễ" trên trang vị — Phase 1, 2, 3 (chờ backend v3.0 lên `openapi.yaml`).
- Thứ tự khối trang vị, 3 thẻ thần chú, chú thích cuối — Phase 1.
- Đại nguyện thu gọn, tiểu sử "Đọc thêm" — Phase 1, 2.
- Kinh liên quan — Phase 1, 3.
- Tràng hạt nhận câu niệm của vị — Phase 1, 3.
- Chia sẻ (Web Share / chép) — Phase 1, 2.
- Trạng thái rỗng/lỗi theo prototype, gỡ nội dung mẫu — Phase 1, 3.
- Test và đo NFR-DTY-02 — Phase 4.

## Open questions (resolved)

- ~~Cỡ trang, nguồn ngày vía, ai chọn vía kế tiếp~~ → trang 12; ngày vía từ lịch lễ; backend chọn `next_via`, client chỉ đếm ngày (product v1.0; backend deity v3.0 AC 5, 23–29). Resolved 2026-10-15.
- ~~Website hiện bao nhiêu vị nổi bật~~ → 6 (product §3.6 dòng FR-DTY-001). Resolved 2026-10-15.
- ~~Phân trang website~~ → số trang + vượt cuối về trang cuối (product §3.6 dòng FR-DTY-002); giữ như code. Resolved 2026-10-15.
