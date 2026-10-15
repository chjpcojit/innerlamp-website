# Requirements — temple (Chùa Việt Nam)

Version: 1.1
Last updated: 2026-10-15
Status: in-progress (drift) — khối chùa nổi bật ở trang chủ, danh bạ `/temples` phân trang và trang chùa `/temples/[id]` đang chạy với backend; còn: tìm theo tên + lọc miền, trang 12 chùa, bỏ nút "Theo dõi" (đang lưu `localStorage`), trạng thái mở/đóng theo giờ Việt Nam, các khối "Đang cập nhật"/"Không có", liên hệ, bỏ dữ liệu mẫu ở trang chủ, test chạy vector. Phần tìm/lọc và trường mới ở chi tiết chờ backend cập nhật `openapi.yaml`.
Feature folder: `src/routes/(site)/temples/`, `src/routes/api/temples/`, `src/lib/components/sections/Temple{Grid,Catalog,Detail,Events}.svelte`, `src/lib/server/api/temples.ts`, `src/lib/types/temple.ts`, `src/lib/utils/temple-labels.ts`, `src/lib/features/temple/` (mới)
Product spec: innerlamp-be `docs/product/temple/product.md` @ v1.1
Contract: innerlamp-be `docs/specs/api/openapi.yaml` @ a8a016b (`info.version` 1.0.0, tag Temples — có `top`, danh sách theo `page`, `options`, chi tiết; **chưa có** `q`/`region` ở `GET /v1/temples`, trang 12, `holiday_operating_hours`, `sangha_body`, `contacts`, `content_updated_month`). Phần chưa có lấy tạm từ innerlamp-be `docs/specs/features/temple/requirements.md` @ v2.0 §API contract (f3bb584, AC 39–46), chờ openapi.
Implements: BR-TPL-01, BR-TPL-02, BR-TPL-03, BR-TPL-04, BR-TPL-05, BR-TPL-06, BR-TPL-08, BR-TPL-09, FR-TPL-001, FR-TPL-002, FR-TPL-003, FR-TPL-004, FR-TPL-005 (qua `onboarding`), FR-TPL-006, FR-TPL-007, FR-TPL-008, FR-TPL-009, NFR-TPL-01, NFR-TPL-02

> See `changelog.md` in this folder for the version history of this spec.

Spec này viết retroactively từ code đang chạy (đọc ngày 2026-10-15) cho phần đã có, prospective cho phần mới của product v1.1. Route: `/` (khối chùa), `/temples`, `/temples/[id]` (`/en/...`).

Hành vi sản phẩm (thứ tự chùa, số chùa nổi bật, cỡ trang, ba miền, cách khớp tìm kiếm, giá trị thiếu, trạng thái mở/đóng, những hành động bị ẩn) nằm ở product spec và **không** nhắc lại ở đây; file này chỉ nói website hiện thực các `BR-TPL-*`/`FR-TPL-*` đó thế nào. Không áp dụng cho website: BR-TPL-07 (khoảng cách — website không hỏi vị trí, §3.6) và FR-TPL-010 (nạp dữ liệu — backend).

## Ràng buộc từ product spec

- **Danh bạ phân trang bằng số trang** (§3.6 dòng FR-TPL-002): mỗi trang là một URL chia sẻ được; không "tải thêm khi cuộn".
- **Tìm và lọc chạy trên backend** (BR-TPL-05, FR-TPL-003, FR-TPL-004, NFR-TPL-02): website chỉ chuyển từ khoá và miền xuống `GET /v1/temples`, không lọc hay tìm trên trang đang có.
- **Website không có khoảng cách** (BR-TPL-07, §3.6): không hỏi vị trí trình duyệt, không có dòng "Cách bạn …".
- **Website tự tính trạng thái mở/đóng** (BR-TPL-09, product §4.1: open status chạy trên mọi client) bằng giờ Việt Nam và lịch âm `src/lib/utils/lunar.ts`.
- **Chỉ có hành động "Chỉ đường"** ở trang chùa (BR-TPL-08); "Chỉ đường" mở Google Maps (§3.6 dòng FR-TPL-008).
- **Chỉ online** (§3.6 dòng §2.4): không cache danh bạ hay trang chùa trong browser.
- **Danh sách rút gọn để chọn chùa** (FR-TPL-005) chỉ dùng qua `onboarding` (BR-ONB-10); giao diện ô chọn thuộc `../onboarding/`.

## Dependencies

- **Feature `sangha` (website)**: nội dung "Sự kiện & khóa học" (FR-TPL-009) lấy từ `GET` lịch sự kiện của chùa qua `src/lib/server/api/temple-events.ts`, chỉ khi có phiên; thẻ "Đặt làm đạo tràng của tôi" (`TempleSanghaCard`, action `setSangha`) nằm trên trang chùa nhưng thuộc `sangha` — spec này không đặc tả và không đổi nó.
- **Feature `onboarding`**: ô chọn chùa ở `/signup` dùng `/api/temples` (AC 27).

## User Story

Là một người xem (đăng nhập hay chưa), tôi muốn thấy vài ngôi chùa tiêu biểu ở trang chủ, duyệt toàn bộ danh bạ chùa theo trang, tìm theo tên và lọc theo miền, rồi mở trang của một chùa để đọc giới thiệu, biết chùa có đang mở cửa không, liên hệ và tìm đường tới — để biết nên đến đâu.

## Acceptance Criteria (EARS notation)

### Chùa nổi bật ở trang chủ

1. WHEN người xem mở `/`, THE SYSTEM SHALL đọc chùa nổi bật bằng `GET /v1/temples/top` từ `load` của server và hiển thị **đúng mọi chùa backend trả về**, theo thứ tự nhận được (không cắt bớt, không sắp lại), mỗi chùa một thẻ link tới `/temples/[id]`, kèm "Xem tất cả" tới `/temples`. (FR-TPL-001, BR-TPL-01, BR-TPL-02)
   > ⚠️ Not confirmed (product): thẻ ở khối trang chủ phải có đủ trường của "Temple card" §3.1.1 (ảnh, tên, loại, tỉnh, cấp di tích, hệ phái) hay giữ thẻ gọn của prototype (ảnh, tên, tỉnh) — chặn task Phase 1 "thẻ trang chủ"; mặc định đề xuất: thẻ gọn; hand back to ba-writer in innerlamp-be.
2. WHEN `GET /v1/temples/top` trả `items: []`, THE SYSTEM SHALL hiển thị trạng thái rỗng của khối (`temples_featured_empty`) và vẫn có "Xem tất cả", không hiển thị lỗi và **không** hiển thị chùa mẫu. (FR-TPL-001)
3. WHEN `GET /v1/temples/top` lỗi (mạng / 5xx), THE SYSTEM SHALL vẫn render trang chủ và SHALL NOT hiển thị chùa mẫu (`content/temples.ts`). (FR-TPL-001)
   > ⚠️ Not confirmed (product): khối chùa ở trang chủ hiển thị gì khi không tải được (FR-TPL-001 chỉ có kịch bản danh bạ rỗng) — chặn nhánh lỗi của AC này; mặc định đề xuất: hiện trạng thái rỗng như AC 2, không có nút thử lại; hand back to ba-writer in innerlamp-be.

### Danh bạ `/temples`

4. WHEN người xem mở `/temples` (có thể kèm `?q=`, `?region=`, `?page=`), THE SYSTEM SHALL đọc trang bằng `GET /v1/temples` từ `load` của server với `page` và — khi có — `q`, `region`, rồi hiển thị các chùa theo thứ tự nhận được, số chùa tìm thấy (`total`, key `temples_page_sub`) và thanh số trang (`Pagination`) giữ nguyên `q`/`region` trên mọi link trang. (FR-TPL-002, BR-TPL-01, BR-TPL-03)
5. WHEN hiển thị một chùa trong danh bạ, THE SYSTEM SHALL dùng thẻ chùa của §3.1.1: ảnh (`thumbnail_url`, không có thì ô giữ chỗ — BR-TPL-06), tên (link tới `/temples/[id]`), loại (`temple_type_*`), tỉnh, cấp di tích, hệ phái; giá trị enum lạ thì bỏ nhãn đó. (FR-TPL-002, BR-TPL-06)
6. WHEN `?page=` không phải số nguyên dương, là `1`, hoặc vượt trang cuối (backend trả `items: []` với `total_pages > 0`), THE SYSTEM SHALL chuyển hướng 307 về URL chuẩn (bỏ `page` khi là trang 1; trang cuối khi vượt), giữ `q` và `region`. (platform, BR-TPL-03)
7. WHEN số trang backend trả là 1 hoặc 0, THE SYSTEM SHALL không hiển thị thanh số trang; WHEN đang ở trang cuối, THE SYSTEM SHALL không cho tới trang sau. (FR-TPL-002, BR-TPL-03)
8. WHEN `GET /v1/temples` lỗi (mạng / 5xx / 400 không mong đợi), THE SYSTEM SHALL render trang với `temples_load_error` và nút/link `temples_retry` tải lại đúng URL hiện tại (giữ `q`, `region`, `page`); WHEN trình duyệt mất mạng, THE SYSTEM SHALL để `OfflineGate` của layout gốc hiển thị chữ offline của site (khác chữ lỗi tải). (FR-TPL-002)
9. WHEN danh bạ trống và không có `q`/`region`, THE SYSTEM SHALL hiển thị `temples_empty`. (FR-TPL-002)

### Tìm theo tên

10. WHEN người xem gửi ô tìm (`SearchField`, label `temples_search_label`, placeholder `temples_search_placeholder`) — bằng Enter, hoặc khi JS đang chạy, sau một khoảng dừng gõ — THE SYSTEM SHALL chuyển tới `/temples?q=<từ khoá>` (giữ `region`, bỏ `page`) để server đọc lại từ trang 1; ô tìm là `<form method="GET">` nên chạy được khi không có JS. (FR-TPL-003, BR-TPL-05, NFR-TPL-01)
11. WHEN JS đang chạy và người xem đang gõ, THE SYSTEM SHALL chỉ gửi sau khoảng dừng gõ (debounce, `design.md`), thay URL bằng `replaceState` (không mỗi chữ một mục lịch sử) và giữ focus + con trỏ trong ô tìm. (NFR-TPL-01, platform)
12. WHEN dựng `q` gửi backend, THE SYSTEM SHALL cắt khoảng trắng hai đầu, cắt còn 100 ký tự (BR-TPL-05) và bỏ hẳn tham số khi rỗng (rỗng = không tìm; backend từ chối `q` rỗng). (BR-TPL-05)
13. WHEN có `q` hoặc `region` và backend trả `total: 0`, THE SYSTEM SHALL hiển thị `temples_no_match_title` ("Không tìm thấy chùa") kèm `temples_no_match_hint` (đổi từ khoá hoặc miền). (FR-TPL-003)
14. WHEN người xem xoá ô tìm và gửi, THE SYSTEM SHALL về `/temples` (giữ `region`, trang 1) và hiển thị lại danh bạ. (FR-TPL-003)

### Lọc theo miền

15. WHEN hiển thị danh bạ, THE SYSTEM SHALL hiển thị bốn lựa chọn miền một-chọn-một `region_all` · `region_north` · `region_central` · `region_south` (link hoặc `FilterChips`), lựa chọn đang áp dụng được đánh dấu (`aria-current`/`aria-pressed`); không có "Tây Nguyên". (FR-TPL-004, BR-TPL-04)
16. WHEN người xem chọn một miền, THE SYSTEM SHALL chuyển tới `/temples?region=north|central|south` (giữ `q`, bỏ `page`) để server đọc từ trang 1; WHEN chọn `region_all`, THE SYSTEM SHALL bỏ tham số `region`, giữ `q`. (FR-TPL-004, BR-TPL-04, BR-TPL-05)
17. WHEN `?region=` có giá trị khác `north`/`central`/`south`, THE SYSTEM SHALL bỏ tham số đó bằng chuyển hướng 307 về URL chuẩn trước khi gọi backend (không gửi giá trị sai xuống backend). (platform, BR-TPL-04)

### Trang chùa `/temples/[id]`

18. WHEN người xem mở `/temples/[id]` (từ trang chủ, danh bạ, `sangha` hoặc lịch — lối vào từ lịch thuộc feature lịch, chưa có trên website), THE SYSTEM SHALL đọc chùa bằng `GET /v1/temples/{id}` từ `load` của server, không cần đăng nhập, và render trang với `<title>` là tên chùa, meta description `temple_d_meta_description`; rồi:
    - on failure (404 `TEMPLE_NOT_FOUND`): trả HTTP 404 và hiển thị `temple_d_not_found_title`, `temple_d_not_found_body` cùng link `temple_d_not_found_back` về `/temples`;
    - on failure (mạng / 5xx): hiển thị trang lỗi dữ liệu có nút `err_retry` (tải lại). (FR-TPL-006, BR-TPL-06)
19. WHEN trang chùa được hiển thị, THE SYSTEM SHALL hiển thị các khối của FR-TPL-007 theo thứ tự prototype (`design.md` bảng "Thứ tự khối"): header ảnh (cấp di tích, hệ phái, tên, dòng `temple_d_aka` khi có `aliases`, nơi chốn phường + tỉnh); giờ mở cửa và trạng thái (AC 21–23); bốn ô niên đại, cấp di tích, hệ phái, miền; giới thiệu (AC 20); trụ trì, tổ khai sơn, giáo hội; kiến trúc & di sản; tiện ích; lưu ý khi viếng đánh số `01, 02, …`; sự kiện (AC 26); vị trí & liên hệ (địa chỉ đầy đủ `location.full_address`, miền, toạ độ, hotline, fanpage, website, email); chân trang `temple_d_updated` khi có `content_updated_month`. (FR-TPL-007)
20. WHEN phần giới thiệu dài hơn chiều cao thu gọn, THE SYSTEM SHALL thu gọn nó với nút `temple_d_read_more`, đổi thành `temple_d_read_less` khi mở; không có JS thì hiển thị đầy đủ. (FR-TPL-007)
21. WHEN một giá trị của trang chùa bị thiếu, THE SYSTEM SHALL vẫn hiển thị dòng/khối đó theo BR-TPL-06: chữ → `temple_d_pending` ("Đang cập nhật"), tiện ích không có → `temple_d_none` ("Không có"), không ảnh → nền giữ chỗ, không `aliases` → ẩn dòng `temple_d_aka`; không ẩn khối như code hiện tại. Liên hệ không có giá trị là chữ thường, không phải link. (BR-TPL-06, FR-TPL-007)
    > ⚠️ Not confirmed (product): các trường "để sau" của BR-TPL-06 (kiểu kiến trúc, vật liệu, tiện ích "Kinh sách", bộ ảnh) — hiển thị dòng `temple_d_pending`/`temple_d_none` (theo BR-TPL-06) hay ẩn tới khi có dữ liệu (FR-TPL-007 viết "'Kinh sách' when known" và không liệt kê bộ ảnh) — chặn task Phase 1 "khối để sau"; mặc định đề xuất: hiện dòng kiểu kiến trúc, vật liệu, "Kinh sách" với `temple_d_pending`/`temple_d_none`, không có khối ảnh; hand back to ba-writer in innerlamp-be.
22. WHEN chùa có giờ mở cửa ở dạng `HH:MM - HH:MM`, THE SYSTEM SHALL tính trạng thái theo BR-TPL-09 **trong browser** sau khi mount (giờ Việt Nam, không theo múi giờ máy; ngày âm của ngày Việt Nam bằng `solarToLunar`) và hiển thị `temple_d_status_open({time})` hoặc `temple_d_status_closed({time})`, cập nhật mỗi phút; SSR không render dòng trạng thái. (BR-TPL-09)
23. WHEN hiển thị giờ mở cửa, THE SYSTEM SHALL hiển thị hai dòng `temple_d_hours_normal` và `temple_d_hours_holiday`, dòng áp dụng hôm nay theo BR-TPL-09 có nhãn `temple_d_today`; WHEN chùa không có giờ, THE SYSTEM SHALL ẩn trạng thái và hiển thị `temple_d_pending`; WHEN `operating_hours` khác rỗng nhưng không đúng dạng `HH:MM - HH:MM` (dữ liệu trước khi backend kiểm định dạng), THE SYSTEM SHALL hiển thị nguyên chuỗi và ẩn trạng thái. (BR-TPL-09, BR-TPL-06)
    > ⚠️ Not confirmed (product): dòng `temple_d_hours_holiday` hiển thị gì khi chùa không có giờ Rằm & Mùng Một — "Đang cập nhật" (BR-TPL-06) hay giờ ngày thường (BR-TPL-09 dùng giờ thường cho ngày Rằm; backend v2.0 AC 46: `""` nghĩa là giờ thường áp dụng) — chặn hiển thị dòng đó (trạng thái đã có vector, không bị chặn); mặc định đề xuất: hiện giờ ngày thường; hand back to ba-writer in innerlamp-be.
24. WHEN người xem bấm `temple_d_directions` (hàng hành động) hoặc nút bản đồ ở khối vị trí, THE SYSTEM SHALL mở Google Maps chỉ đường tới toạ độ `lat,lng` của chùa trong tab mới (`rel="noopener noreferrer"`); hàng hành động chỉ có nút này. (FR-TPL-008, BR-TPL-08, §3.6)
25. WHEN người xem bấm một liên hệ có giá trị, THE SYSTEM SHALL mở `tel:` (hotline), link `https://` (fanpage, website, tab mới) hoặc `mailto:` (email); WHEN liên hệ không có giá trị, THE SYSTEM SHALL hiển thị `temple_d_pending` không bấm được. (FR-TPL-008, BR-TPL-06)
26. WHEN trang chùa được hiển thị, THE SYSTEM SHALL hiển thị khối `temple_ev_title` ("Sự kiện & khóa học"); WHEN không có sự kiện (khách, hoặc `sangha` trả rỗng), THE SYSTEM SHALL hiển thị `temple_ev_none_posted` ("Chùa chưa đăng sự kiện nào.") không kèm lời mời theo dõi. (FR-TPL-009, BR-TPL-08)
27. WHEN trang chùa được hiển thị, THE SYSTEM SHALL NOT hiển thị nút "Theo dõi"/"Đang theo dõi", "Cúng dường" hay link "Báo thông tin sai", và SHALL NOT đọc/ghi `localStorage` `il-temple-follow`. (BR-TPL-08)
28. WHEN ở bất kỳ trang nào của feature này, THE SYSTEM SHALL NOT hỏi vị trí trình duyệt và SHALL NOT hiển thị khoảng cách. (platform, BR-TPL-07 §3.6)

### Chọn chùa (qua onboarding)

29. WHEN ô chọn chùa của `onboarding` tìm hoặc tải thêm trang, THE SYSTEM SHALL gọi `GET /api/temples?q=&page=` của website, endpoint này gọi `GET /v1/temples/options` từ server (khoá API không xuống browser), cắt `q` còn 100 ký tự và bỏ `q` rỗng; danh sách chỉ có tên + tỉnh, tìm theo tên (BR-TPL-05, §3.6 dòng FR-TPL-005). (FR-TPL-005, BR-TPL-05)

### Chung

30. WHEN gọi backend, THE SYSTEM SHALL chỉ gọi từ server SvelteKit qua `$lib/server/api/temples.ts` với `x-api-key`; bốn route đều công khai nên không gửi Bearer. (platform)
31. WHEN `/temples` có `q`, THE SYSTEM SHALL thêm `<meta name="robots" content="noindex">`; trang danh bạ không `q` (kể cả `?region=`, `?page=`) và trang chùa được index. (platform)
32. WHEN hiển thị bất kỳ chuỗi nào (kể cả lỗi), THE SYSTEM SHALL chỉ dùng key Paraglide có trong cả `messages/vi.json` và `messages/en.json`, không bao giờ `error.message` của backend; chữ tiếng Việt của các câu product trích nguyên ("Không tìm thấy chùa", "Đang cập nhật", "Không có", "Còn gọi: …", "Đọc thêm / Thu gọn", "Đang mở cửa · đóng lúc HH:MM", "Đã đóng cửa · mở lại HH:MM", "Hôm nay", "Chùa chưa đăng sự kiện nào.", "Chỉ đường") lấy đúng như product. (platform, FR-TPL-003, FR-TPL-007, BR-TPL-06, BR-TPL-09)
33. WHEN chạy unit test, THE SYSTEM SHALL qua mọi case của `rules/temple-open-status.json` (product §4.3; `temple-order.json`, `temple-search-match.json` chạy ở backend, `temple-distance.json` chỉ ở app). (BR-TPL-09)
34. WHEN một tìm kiếm hoặc đổi miền được gửi, THE SYSTEM SHALL hiển thị trang 1 trong 2 giây trên mạng 4G (một request backend mỗi lần gửi, không tải cả danh bạ). (NFR-TPL-01, NFR-TPL-02)

## Dữ liệu & API (gọi từ SvelteKit server)

Header chung: `x-api-key` từ `API_KEY`; không Bearer (tag Temples công khai). Hình dạng response: schema `TempleSummary`, `TempleDetail`, `TempleOption` và các envelope trong innerlamp-be `docs/specs/api/openapi.yaml` — không chép ở đây.

| Thao tác | Operation (openapi) | Gọi từ | Ghi chú |
| --- | --- | --- | --- |
| Chùa nổi bật | `GET /v1/temples/top` | `src/routes/(site)/+page.server.ts` `load` | Có trong openapi; số chùa do backend quyết định (BR-TPL-02) |
| Danh bạ theo trang | `GET /v1/temples?page=` | `src/routes/(site)/temples/+page.server.ts` `load` | Có trong openapi (ghi trang 20 — product/backend v2.0 đổi 12; website đọc `page_size` từ response, không cố định) |
| Tìm + lọc miền | `GET /v1/temples?q=&region=&page=` | như trên | ⚠️ chưa có trong openapi @ a8a016b — theo backend v2.0 AC 39–44; hand-off backend |
| Trang chùa | `GET /v1/temples/{id}` | `src/routes/(site)/temples/[id]/+page.server.ts` `load` | Có trong openapi; 4 nhóm trường mới (`holiday_operating_hours`, `sangha_body`, `contacts`, `content_updated_month`) ⚠️ chưa có — theo backend v2.0 AC 45–46 |
| Danh sách chọn chùa | `GET /v1/temples/options?q=&page=` | `src/routes/api/temples/+server.ts` `GET` (cho `onboarding`) | Có trong openapi |
| Sự kiện của chùa | thuộc `sangha` (`src/lib/server/api/temple-events.ts`) | `temples/[id]/+page.server.ts` `load` (khi có phiên) | Không thuộc spec này |

> ⚠️ Not confirmed (contract): `openapi.yaml` @ a8a016b chưa có `q`, `region` (và lỗi `INVALID_FILTER` với `details.field` = `q` | `region`) ở `GET /v1/temples`, chưa ghi trang 12, và `TempleDetail` chưa có `holiday_operating_hours`, `sangha_body`, `contacts {hotline, fanpage, website, email}`, `content_updated_month` — chặn task Phase 3 "tìm/lọc" và "trường mới" (code có thể viết theo backend v2.0 AC 39–46 nhưng chỉ coi là xong khi openapi có); hand-off backend (`tasks.md` Phase 13 của backend).

## Error → UI mapping

| Operation | Failure case | Visitor sees | Hiện trạng code |
| --- | --- | --- | --- |
| `GET /v1/temples/top` | mạng / 5xx | Trang chủ vẫn render; khối chùa theo ⚠️ AC 3 (mặc định: trạng thái rỗng) | lệch — hiện 3 chùa **mẫu** từ `content/temples.ts` |
| `GET /v1/temples/top` | `items: []` | `temples_featured_empty` + "Xem tất cả" | lệch — hiện chùa mẫu |
| `GET /v1/temples` | mạng / 5xx | `temples_load_error` + `temples_retry` | lệch — có `temples_load_error`, chưa có nút thử lại |
| `GET /v1/temples` | 400 `INVALID_PAGE` / `INVALID_FILTER` (website đã chuẩn hoá tham số nên không xảy ra) | như mạng / 5xx (log mã lỗi) | chưa có (chưa gửi `q`/`region`) |
| `GET /v1/temples` | `total: 0` khi có `q`/`region` | `temples_no_match_title` + `temples_no_match_hint` | chưa có |
| `GET /v1/temples` | `total: 0` không có bộ lọc | `temples_empty` | ✓ |
| `GET /v1/temples` | trang vượt cuối | 307 về trang cuối | ✓ (chưa giữ `q`/`region`) |
| `GET /v1/temples/{id}` | 404 `TEMPLE_NOT_FOUND` | HTTP 404, `temple_d_not_found_*` + link về `/temples` | lệch — trang 404 chung `err_404_*` (về trang chủ / quay lại) |
| `GET /v1/temples/{id}` | mạng / 5xx | Trang lỗi dữ liệu `err_data_*` + `err_retry` | ✓ (`+error.svelte` gốc, `error(502)`) |
| `GET /v1/temples/options` (qua `/api/temples`) | mọi lỗi | JSON `{error: code}` cùng status; ô chọn của `onboarding` hiển thị lỗi theo spec đó | ✓ |
| mọi trang | trình duyệt offline | `OfflineGate` (`offline_*`) | ✓ |

## Out of scope

- Khoảng cách và vị trí người xem (BR-TPL-07 — chỉ app, §3.6).
- Theo dõi chùa (feature riêng, sau), báo thông tin sai (bỏ), cúng dường (`offering`) — product §1.2; website chỉ **gỡ** chúng khỏi trang chùa (AC 27).
- Đề xuất chùa mới (`temple-suggestion`; form ở `onboarding`), đạo tràng của người dùng và thẻ "Đặt làm đạo tràng" (`sangha`).
- Bản đồ chùa, tìm "gần tôi", sắp theo khoảng cách, đánh giá (product §1.2); tìm theo địa chỉ/tỉnh (BR-TPL-05).
- Nạp/sửa dữ liệu chùa (FR-TPL-010 — backend).
- Bản offline của danh bạ / trang chùa (§3.6 — chỉ app).
- Ghi nguồn nội dung và quyền dùng ảnh (product Appendix A mục 1 — chặn phát hành nội dung, không chặn website).

## Pending (not yet implemented)

Theo dõi ở `tasks.md`:

- Ô tìm + bốn lựa chọn miền, URL `?q=&region=`, không khớp → `temples_no_match_*` (FR-TPL-003, FR-TPL-004) — Phase 1, 3; chờ ⚠️ contract.
- Trang 12 chùa (BR-TPL-03) — không cần code website (đọc `page_size`/`total_pages` từ backend); kiểm lại khi backend đổi.
- Trang chủ: bỏ `HOME_TEMPLE_COUNT = 7` (hiện cắt 10 chùa còn 7), bỏ dữ liệu mẫu, trạng thái rỗng (FR-TPL-001, BR-TPL-02) — Phase 1, 3.
- Thẻ danh bạ thêm loại chùa (§3.1.1) — Phase 1.
- Danh bạ lỗi → nút thử lại (FR-TPL-002) — Phase 1.
- Trang chùa: gỡ "Theo dõi" + `state/temple-follow.svelte.ts` (BR-TPL-08); "Còn gọi", phường; trạng thái mở/đóng + hai dòng giờ (BR-TPL-09); bốn ô thông tin; giới thiệu thu gọn; khối tổ chức (có giáo hội); tiện ích đủ dòng; lưu ý đánh số `01`; vị trí & liên hệ; chân trang tháng cập nhật; "Đang cập nhật"/"Không có" thay vì ẩn (BR-TPL-06, FR-TPL-007, FR-TPL-008) — Phase 1–3.
- Chỉ đường bằng URL `dir` có điểm đến thay vì `search` (FR-TPL-008) — Phase 1.
- Trang "không tìm thấy chùa" riêng (FR-TPL-006) — Phase 1.
- Chữ trống của khối sự kiện trên trang chùa (FR-TPL-009) — Phase 1.
- Test vector `temple-open-status.json` và E2E — Phase 4 (repo chưa có test runner).

## Open questions (resolved)

- ~~Có giữ nút "Theo dõi" (lưu theo thiết bị) không?~~ → Không, ẩn hẳn tới khi có feature theo dõi (BR-TPL-08, product v1.1). Resolved 2026-10-15 (product v1.1). Downstream: AC 27; gỡ `state/temple-follow.svelte.ts`.
- ~~Website có hiển thị khoảng cách không?~~ → Không, không hỏi vị trí (BR-TPL-07, §3.6). Resolved 2026-10-15 (product v1.0). Downstream: AC 28.
- ~~"Bây giờ" của trạng thái mở/đóng theo giờ máy hay giờ Việt Nam?~~ → Giờ Việt Nam, giờ Rằm & Mùng Một theo âm lịch (BR-TPL-09). Resolved 2026-10-15 (product v1.1). Downstream: AC 22, 23, 33.
- ~~Tìm/lọc chạy trên trang hay trên backend?~~ → Backend (BR-TPL-05, FR-TPL-003, FR-TPL-004). Resolved 2026-10-15 (product v1.0). Downstream: AC 10–17.
- ~~Tìm/lọc đi qua `load` theo URL hay qua một endpoint `/api/*` gọi từ browser?~~ → Qua URL + `load` (GET form, không cần JS; trang chia sẻ được, cùng cơ chế với số trang ở §3.6). Quyết định platform, 2026-10-15.
- ~~Trạng thái mở/đóng tính ở server hay browser?~~ → Browser sau khi mount, cập nhật mỗi phút (tránh lệch hydrate và trang cache cũ). Quyết định platform, 2026-10-15.
