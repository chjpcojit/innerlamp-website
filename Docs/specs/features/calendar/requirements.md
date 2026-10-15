# Requirements — calendar (Sự kiện Phật giáo)

Version: 1.0
Last updated: 2026-10-15
Status: in-progress (drift) — trang `/events` (lịch lễ theo tháng, lọc theo nhóm, "xem thêm năm"), trang chi tiết `/events/[code]` (có sự kiện trước/sau) và khối "Sự kiện Phật giáo" ở trang chủ đang chạy với backend thật, **nhưng chỉ cho người đã đăng nhập** (lệch FR-CAL-001). Còn: gọi route không kèm token (chờ backend v3.0), lọc "Lễ lớn" và dấu lễ lớn (chờ `is_major`), khối trang chủ 6 tháng theo tầng BR-CAL-15 (chờ `is_major`, `recurrence`, `sort_order`), tải thêm năm tới 2100 có retry, bản sao cũ khi backend lỗi, nhãn đếm ngày theo BR-CAL-13, dấu nhuận, nội dung theo BR-CAL-14, ảnh mặc định, test chạy vector.
Feature folder: `src/routes/(site)/events/`, `src/routes/(site)/+page.server.ts` (khối trang chủ), `src/lib/components/sections/{EventsHeader,EventsNext,EventsGroups,EventDetail,EventsRoutines}.svelte`, `src/lib/server/api/calendar.ts`, `src/lib/types/calendar.ts`, `src/lib/utils/events.ts`
Product spec: innerlamp-be `docs/product/calendar/product.md` @ v1.1
Contract: innerlamp-be `docs/specs/api/openapi.yaml` @ a8a016b (`info.version` 1.0.0, tag Calendar `GET /v1/calendar/events` — hình dạng hiện tại, còn `bearerAuth`, chưa có `is_major` / `sort_order` / `recurrence`). Thay đổi đã lên kế hoạch (chưa có trong `openapi.yaml`, backend Phase 18): innerlamp-be `docs/specs/features/calendar/requirements.md` + `design.md` @ v3.0 (0eb7d1f) — E4 (route công khai), E13 (`is_major`, `sort_order`, `recurrence`), E17 (`Cache-Control: public` khi có `year`), E22 (sai `X-API-Key` → 401), E23 (vượt giới hạn theo IP → 429).
Implements: BR-CAL-05, BR-CAL-08, BR-CAL-09, BR-CAL-10, BR-CAL-11, BR-CAL-12, BR-CAL-13, BR-CAL-14, BR-CAL-15, FR-CAL-001, FR-CAL-002, FR-CAL-003, FR-CAL-004, FR-CAL-005, FR-CAL-006, FR-CAL-007 (§3.6: bản sao của server website / phiên trình duyệt), FR-CAL-008, FR-CAL-009 (§3.6: chỉ website), NFR-CAL-03

> See `changelog.md` in this folder for the version history of this spec.

Spec này viết retroactively từ code đang chạy (đọc ngày 2026-10-15), đối chiếu với product spec v1.1; phần chưa có viết theo kiểu prospective trong cùng file. Route: `/events`, `/events/[code]?date=YYYY-MM-DD`, khối trên `/` (`/en/...`).

Hành vi sản phẩm (danh mục sự kiện, quy tắc lặp, nhóm, lễ lớn, ngày nghỉ lễ, thứ tự, đếm ngày, định dạng nội dung, khối trang chủ, năm được xem, bản sao offline) nằm ở product spec và **không** nhắc lại ở đây; file này chỉ nói website hiện thực các `BR-CAL-*` / `FR-CAL-*` đó thế nào. Không áp dụng cho website (cột Website `n/a`): BR-CAL-01…04, BR-CAL-06, BR-CAL-07, BR-CAL-16, FR-CAL-010, NFR-CAL-01, NFR-CAL-02 — website hiển thị ngày backend tính, không tự tính ngày sự kiện (product §2.5).

## Ràng buộc từ product spec

- **Công khai** (FR-CAL-001): khách và người đã đăng nhập thấy cùng lịch; không có lời mời đăng nhập ở feature này.
- **Ngày do backend tính** (product §2.5, BR-CAL-05): website không tự sinh Rằm / Mùng Một hay bất kỳ ngày sự kiện nào; chỉ ghép `occurrences` với `events`.
- **Đếm ngày theo ngày của máy** (BR-CAL-13): phép tính chạy trong browser, không dùng ngày của server SvelteKit.
- **Bản sao offline của website** (§3.6 dòng FR-CAL-007): là bản sao server website hoặc trình duyệt giữ trong phiên; website không có kho offline lâu dài.
- **Sự kiện trước / sau** (§3.6 dòng FR-CAL-009): chỉ website có.
- **Không có** gợi ý kinh, chùa tổ chức, nhắc ngày này (product §1.2, FR-CAL-005).

## Dependencies

- **Backend calendar v3.0** (innerlamp-be `docs/specs/features/calendar/` @ v3.0, Phase 14–18): route công khai, `is_major`, `sort_order`, `recurrence`, seed mới (Rằm / Mùng 1 `sort_order` cuối, `guidance` một việc một dòng). Các tiêu chí ghi "**chờ backend v3.0**" không làm được trước khi backend triển khai và `openapi.yaml` được cập nhật.
- **Feature lunar** (`/lunar`, `/api/calendar/month`, ngoài phạm vi product v1.1): dùng chung `$lib/server/api/calendar.ts`; spec này chỉ đổi chữ ký hàm, không đổi hành vi trang lịch âm.

## User Story

Là một khách hoặc người dùng đã đăng nhập, tôi muốn xem các ngày lễ Phật giáo, ngày lễ Việt Nam và lễ dân gian của năm theo từng tháng, kèm ngày âm, còn bao nhiêu ngày và ý nghĩa của từng ngày, để biết Phật đản, Vu Lan, Rằm… rơi vào ngày nào mà không phải tự tính lịch âm.

## Acceptance Criteria (EARS notation)

### Truy cập

1. WHEN khách hoặc người đã đăng nhập mở `/events`, `/events/[code]` hoặc trang chủ, THE SYSTEM SHALL đọc lịch bằng `GET /v1/calendar/events` từ server SvelteKit **không kèm** `Authorization` (chỉ `x-api-key`), hiển thị cùng một nội dung cho mọi người, và SHALL NOT hiển thị lời mời đăng nhập (`ev_guest`, `ev_d_guest`, `events_guest` ở khối trang chủ). (FR-CAL-001) — **chờ backend v3.0** (E4); hiện code gửi Bearer và cho khách thấy lời mời đăng nhập (drift).
   > ⚠️ Not confirmed (platform, default chọn): người đã đăng nhập cũng **không** gửi Bearer cho route này — mặc định: không bao giờ gửi, để một bản cache dùng chung cho mọi người và token hết hạn không ảnh hưởng lịch. Merge PR = duyệt.
2. WHEN backend trả 401 cho route sự kiện (sau v3.0 nghĩa là `API_KEY` của website sai), THE SYSTEM SHALL coi là lỗi tải (AC 17), ghi log mã lỗi, SHALL NOT coi người dùng là khách. (FR-CAL-001, FR-CAL-008)

### Lịch lễ (`/events`)

3. WHEN mở `/events`, THE SYSTEM SHALL tải năm hiện tại theo giờ Việt Nam (`Asia/Ho_Chi_Minh`) trong `load` của server, liệt kê lần diễn ra theo tháng dương từ tháng 1 tới tháng 12 theo thứ tự backend trả (BR-CAL-12), và sau khi hiển thị trong browser SHALL cuộn tháng hiện tại vào tầm nhìn. (FR-CAL-002, BR-CAL-02, BR-CAL-12)
4. WHEN hiển thị một dòng lần diễn ra, THE SYSTEM SHALL có ngày dương kèm thứ, tên sự kiện, ngày âm (kèm dấu nhuận theo BR-CAL-08 / BR-CAL-05 khi `is_leap_month`), nhãn đếm ngày (AC 6), dấu lễ lớn `ev_major` khi `is_major` (chờ backend v3.0), **mọi** nhãn nhóm của sự kiện theo thứ tự nhóm của danh mục, và dấu ngày nghỉ lễ khi `is_public_holiday`. (FR-CAL-002, BR-CAL-08, BR-CAL-09, BR-CAL-10, BR-CAL-11) — drift: dòng hiện chỉ hiện nhóm đầu tiên, ngày âm không có dấu nhuận, chưa có dấu lễ lớn.
5. WHEN nhiều sự kiện cùng một ngày, THE SYSTEM SHALL giữ thứ tự backend trả (sự kiện có tên trước Rằm / Mùng Một do `sort_order` của danh mục), SHALL NOT tự sắp lại hay tự sinh Rằm / Mùng Một. (BR-CAL-05, BR-CAL-12)
6. WHEN hiển thị nhãn đếm ngày ở bất kỳ đâu (danh sách, thẻ sắp tới, chi tiết, khối trang chủ), THE SYSTEM SHALL tính trong browser bằng ngày của máy qua một hàm thuần dùng chung, trả bốn trường hợp của BR-CAL-13 với key `ev_left_today` / `ev_left_tomorrow` / `ev_left_days` / `ev_left_past`; WHEN trang render trên server, THE SYSTEM SHALL NOT tính bằng ngày của server (nhãn chỉ hiện sau khi chạy trong browser). (BR-CAL-13) — drift: không có "Ngày mai"; trang chi tiết tính bằng ngày Việt Nam trên server và hiện "Đã qua N ngày" (`ev_d_days_ago`).
   > ⚠️ Not confirmed (platform, default chọn): SSR không render nhãn đếm ngày (tránh lệch ngày server/máy khi hydrate) — mặc định: nhãn trống tới khi mount. Merge PR = duyệt.
7. WHEN người dùng chọn một chip lọc, THE SYSTEM SHALL chỉ hiện lần diễn ra khớp trong mọi năm đã tải: `ev_tab_all`, `ev_tab_major` (chỉ `is_major`, chờ backend v3.0), rồi một chip cho mỗi nhóm theo thứ tự nhóm của danh mục (tên lấy từ `data.groups`, không hard-code); mỗi chip hiện số lần diễn ra nó chứa; lọc giữ nguyên khi tải thêm năm. (FR-CAL-003, BR-CAL-09, BR-CAL-10) — drift: chưa có chip "Lễ lớn".
8. WHEN người dùng chọn một dòng, THE SYSTEM SHALL mở `/events/[code]?date=<solar_date>` của đúng lần diễn ra đó. (FR-CAL-002, FR-CAL-005)
9. WHEN người dùng tới cuối các năm đã tải và năm cuối < 2100, THE SYSTEM SHALL hiện nút `ev_load_more` cho năm kế tiếp; WHEN bấm, THE SYSTEM SHALL tải năm đó từ browser qua `src/routes/api/calendar/year/+server.ts` (server gọi backend) và nối vào cuối danh sách, rồi:
   - on success: thêm tháng 1–12 của năm mới, chip đếm lại, nút chuyển sang năm sau nữa (không còn nút sau năm 2100);
   - on failure: giữ nguyên những gì đang hiện, hiện ở cuối danh sách `ev_load_more_failed` (hoặc `ev_offline` khi trình duyệt offline, AC 18) kèm nút `ev_retry`. (FR-CAL-004, BR-CAL-02) — drift: hiện `load` tải sẵn năm hiện tại + năm sau và chỉ "mở" năm sau; không tải được quá năm thứ hai; năm sau lỗi thì nút biến mất, không có retry.
   > ⚠️ Not confirmed (platform, default chọn): "tới cuối" là nút ở cuối danh sách (không cuộn vô hạn), `load` chỉ tải năm hiện tại, năm sau tải qua endpoint `/api/calendar/year`. Merge PR = duyệt.
10. WHEN hiển thị `/events`, THE SYSTEM SHALL không cung cấp năm trước năm hiện tại. (FR-CAL-004)

### Chi tiết (`/events/[code]`)

11. WHEN mở `/events/[code]?date=YYYY-MM-DD`, THE SYSTEM SHALL tải năm của `date` (không có `date` → năm hiện tại giờ Việt Nam, chọn lần diễn ra sắp tới gần nhất, hết thì lần cuối) và hiển thị: ảnh (AC 13), nhãn nhóm, dấu lễ lớn (chờ backend v3.0), dấu ngày nghỉ lễ, tên, ngày âm (kèm dấu nhuận), ngày dương kèm thứ, nhãn đếm ngày (AC 6), mô tả, "Phật tử thường làm gì" (AC 12); SHALL NOT hiện gợi ý kinh hay chùa tổ chức. (FR-CAL-005, BR-CAL-08, BR-CAL-10, BR-CAL-11, BR-CAL-13)
12. WHEN hiển thị mô tả dài và lễ nghi, THE SYSTEM SHALL tách đoạn / việc **chỉ theo xuống dòng** (không theo dấu phẩy, chấm phẩy), bỏ dấu đầu dòng `-`, `•`, `*` ở mỗi việc, hiện lễ nghi thành danh sách đánh số với tiêu đề `ev_d_dos`, và ẩn mục nào có nội dung rỗng. (BR-CAL-14) — đã tách theo xuống dòng và ẩn mục rỗng; drift: chưa bỏ dấu đầu dòng; tiêu đề `ev_d_dos` đang là "Nên làm trong ngày" thay vì chữ của product §3.1.1.
    > ⚠️ Not confirmed (product): khi `long_description` rỗng, code đang hiện `short_description` thay vào mục "Ý nghĩa" — product chỉ nói "mục rỗng thì ẩn" — mặc định của spec này: bỏ fallback, ẩn mục (đọc đúng chữ BR-CAL-14); blocks AC 12 / task Phase 1; hand back to ba-writer in innerlamp-be.
13. WHEN sự kiện không có ảnh (`image_url` `null`), THE SYSTEM SHALL hiển thị ảnh mặc định dùng chung. (BR-CAL-14) — drift: hiện chỉ có nền gradient, không có ảnh.
    > ⚠️ Not confirmed (product): "ảnh mặc định dùng chung" là file nào (product §2.7 nói chưa có ảnh) — blocks AC 13; mặc định của spec này: tới khi có file, website dùng header gradient hiện có kèm biểu tượng `LampMark` làm ảnh mặc định; hand back to ba-writer in innerlamp-be.
14. WHEN `code` không có trong năm được tải, hoặc `date` ngoài 1900–2100, THE SYSTEM SHALL trả 404 và hiện màn hình không tìm thấy có nút quay lại (`+error.svelte`). (FR-CAL-005) — ✓ đã có.
15. WHEN chi tiết được hiển thị, THE SYSTEM SHALL có link sự kiện trước và sự kiện tiếp theo thứ tự BR-CAL-12, sang năm liền kề khi tải được năm đó (không tải được → bỏ link phía đó). (FR-CAL-009, BR-CAL-12) — ✓ đã có.
16. WHEN trang chi tiết render, THE SYSTEM SHALL đặt `<title>` là tên sự kiện và meta description là `short_description` (rỗng → `ev_meta_description`); trang công khai, render trên server, cho phép index. (platform, FR-CAL-001)

### Lỗi tải và bản sao cũ

17. WHEN backend không trả được năm cần (mạng, 5xx, 429, 401 sai khoá) và server website **chưa** có bản sao nào của năm đó, THE SYSTEM SHALL hiện `ev_unavailable` kèm nút `ev_retry` ở `/events`; màn hình lỗi dữ liệu (có thử lại) ở `/events/[code]`; `events_unavailable` kèm `ev_retry` **tại chỗ** các thẻ của khối trang chủ (khối không biến mất). (FR-CAL-008) — drift: `/events` và trang chủ không có nút thử lại; trang chi tiết đã có (`+error.svelte`).
18. WHEN một lần tải từ browser (AC 9) thất bại vì trình duyệt offline (`navigator.onLine === false` hoặc `fetch` ném lỗi mạng), THE SYSTEM SHALL hiện `ev_offline` thay cho `ev_load_more_failed`. (FR-CAL-008)
    > ⚠️ Not confirmed (platform, default chọn): thông báo offline riêng chỉ có ở lần tải từ browser — trang tải từ server không biết máy offline (máy offline thì trang không tới được server). Merge PR = duyệt.
19. WHEN backend không trả được năm cần nhưng server website **đã** có bản sao của năm đó (từ lần tải thành công trước, ở bất kỳ người dùng nào), THE SYSTEM SHALL hiển thị bản sao đó ở `/events`, `/events/[code]` và khối trang chủ kèm ghi chú `ev_stale_note` ("có thể chưa cập nhật"). (FR-CAL-007 §3.6) — drift: cache hiện xoá bản hết hạn trước khi gọi lại, nên backend lỗi là mất luôn.
    > ⚠️ Not confirmed (platform, default chọn): "bản sao của website" = bản tải thành công gần nhất của mỗi năm, giữ trong bộ nhớ process của server SvelteKit (mất khi khởi động lại, không chia sẻ giữa các instance), cộng các năm đã tải trong trang đang mở. Không dùng `localStorage`. Merge PR = duyệt.
20. WHEN bấm `ev_retry`, THE SYSTEM SHALL tải lại đúng phần đã lỗi (trang: chạy lại `load`; tải thêm năm: gọi lại endpoint) và hiển thị lịch khi thành công. (FR-CAL-008)

### Khối "Sự kiện Phật giáo" ở trang chủ

21. WHEN trang chủ được hiển thị (khách hoặc đã đăng nhập), THE SYSTEM SHALL hiển thị khối theo BR-CAL-15: một thẻ cho mỗi tháng từ tháng hiện tại trong 6 tháng (có thể sang năm sau — tải thêm năm sau khi cần), mỗi thẻ tối đa ba lần diễn ra chọn bằng một hàm thuần chạy `rules/home-block.json`, phần còn lại thành `events_more_others` ("+N sự kiện khác"), tháng không có gì vẫn có thẻ với `events_month_none`. (FR-CAL-006, BR-CAL-15, BR-CAL-10, BR-CAL-12) — **chờ backend v3.0** cho tầng 1 (`is_major`), tầng 3 (`recurrence = lunar_monthly`) và thứ tự trong tầng (`sort_order`); drift: hiện chỉ có tháng hiện tại, mọi nhóm, tối đa 5 dòng, khách không thấy gì.
    > ⚠️ Not confirmed (platform, default chọn): "tháng hiện tại" của khối tính trên server theo `Asia/Ho_Chi_Minh` (cùng cách chọn "năm hiện tại"); nhóm Phật giáo nhận theo mã nhóm `buddhist` của danh mục (cùng mã vector dùng). Merge PR = duyệt.
22. WHEN hiển thị một dòng trong thẻ tháng, THE SYSTEM SHALL có ngày, tên, ngày âm (kèm dấu nhuận) và nhãn đếm ngày (AC 6). (FR-CAL-006, BR-CAL-08, BR-CAL-13)
23. WHEN người dùng chọn một sự kiện trong khối, THE SYSTEM SHALL mở `/events/[code]?date=<solar_date>`; WHEN chọn `events_view_all` hoặc "+N sự kiện khác", THE SYSTEM SHALL mở `/events` (mở ở tháng hiện tại, AC 3). (FR-CAL-006)

### Chung

24. WHEN gọi backend cho lịch, THE SYSTEM SHALL chỉ gọi từ server SvelteKit qua `$lib/server/api/calendar.ts` (`x-api-key` từ `API_KEY`); browser chỉ gọi `src/routes/api/calendar/year/+server.ts`, không gọi thẳng backend. (platform)
25. WHEN trang lịch của năm hiện tại được mở trên mạng 4G, THE SYSTEM SHALL hiển thị trong 2 giây, và trong 0,5 giây khi server đã có bản sao của năm đó. (NFR-CAL-03)
26. WHEN chạy unit test, THE SYSTEM SHALL qua mọi case của `rules/countdown.json`, `rules/ordering.json` và `rules/home-block.json` của product spec (product §4.1 — `event-placement.json` chỉ chạy ở backend). (BR-CAL-13, BR-CAL-12, BR-CAL-15)
27. WHEN hiển thị bất kỳ chuỗi nào, THE SYSTEM SHALL dùng key Paraglide có trong cả `messages/vi.json` và `messages/en.json`; tên, mô tả, lễ nghi và tên nhóm lấy nguyên từ backend (chỉ tiếng Việt, product §1.2); chữ của các nhãn product nêu tên (BR-CAL-13, §3.1.1: "Tất cả", "Lễ lớn", "+N sự kiện khác", "Phật tử thường làm gì") lấy đúng nghĩa product, bản `en` theo giải nghĩa tiếng Anh của product. (platform, FR-CAL-003, FR-CAL-005, FR-CAL-006, BR-CAL-13)

## Dữ liệu & API (gọi từ SvelteKit server)

Header: `x-api-key` từ `API_KEY`; **không** `Authorization` (AC 1, sau backend v3.0). Hình dạng request/response: schema `CalendarEventsEnvelope` / `CalendarEvent` / `CalendarOccurrence` trong innerlamp-be `docs/specs/api/openapi.yaml`; ba field mới `is_major`, `sort_order`, `recurrence` theo innerlamp-be `docs/specs/features/calendar/requirements.md` v3.0 E13 — không chép ở đây.

| Thao tác | Operation (openapi) | Gọi từ | Ghi chú |
| --- | --- | --- | --- |
| Đọc một năm | `GET /v1/calendar/events?year=YYYY` | `$lib/server/api/calendar.ts` `getCalendarYear`, dùng bởi `events/+page.server.ts` `load`, `events/[code]/+page.server.ts` `load`, `(site)/+page.server.ts` `load`, `api/calendar/year/+server.ts` | Luôn gửi `year` rõ ràng (để backend trả `Cache-Control: public`); cache theo năm trên server (design "Cache & bản sao") |
| Tải thêm năm (browser) | — (endpoint nội bộ `GET /api/calendar/year?year=YYYY`) | `EventsGroups` / `+page.svelte` của `/events` | Trả danh sách gọn + nhóm của năm; 400 khi năm ngoài [năm hiện tại, 2100] |

Trạng thái contract: `openapi.yaml` @ a8a016b vẫn ghi `bearerAuth`, 401 `UNAUTHORIZED` khi thiếu token, `Cache-Control: private`, và chưa có ba field mới. Mọi task dùng chúng ở `tasks.md` ghi "chờ backend v3.0".

## Error → UI mapping

| Operation | Failure case | Visitor sees | Hiện trạng code |
| --- | --- | --- | --- |
| `GET /v1/calendar/events` (load `/events`) | mạng / 5xx / 429 / 401, **có** bản sao | Lịch từ bản sao + `ev_stale_note` | chưa có |
| `GET /v1/calendar/events` (load `/events`) | mạng / 5xx / 429 / 401, **không** bản sao | `ev_unavailable` + `ev_retry` | `ev_unavailable` có, không retry; 401 → `ev_guest` (lệch) |
| `GET /api/calendar/year` (tải thêm năm) | backend lỗi, không bản sao | Giữ danh sách, `ev_load_more_failed` + `ev_retry` ở cuối | chưa có (nút biến mất) |
| `GET /api/calendar/year` | trình duyệt offline | Giữ danh sách, `ev_offline` + `ev_retry` ở cuối | chưa có |
| `GET /api/calendar/year` | 400 (năm ngoài khoảng — không tới được từ UI) | Như lỗi tải thêm | chưa có |
| `GET /v1/calendar/events` (load chi tiết) | `code` không có trong năm / `INVALID_YEAR` | 404, màn hình không tìm thấy + quay lại | ✓ |
| `GET /v1/calendar/events` (load chi tiết) | mạng / 5xx / 429 / 401, có bản sao | Chi tiết từ bản sao + `ev_stale_note` | chưa có |
| `GET /v1/calendar/events` (load chi tiết) | mạng / 5xx / 429 / 401, không bản sao | Màn hình lỗi dữ liệu có thử lại (`+error.svelte`, 502) | ✓ (502); 401 → `ev_d_guest` (lệch) |
| `GET /v1/calendar/events` (năm liền kề cho trước/sau) | mọi lỗi | Không có link phía đó | ✓ |
| `GET /v1/calendar/events` (khối trang chủ) | lỗi, có bản sao | Thẻ từ bản sao + `ev_stale_note` | chưa có |
| `GET /v1/calendar/events` (khối trang chủ) | lỗi, không bản sao | `events_unavailable` + `ev_retry` tại chỗ thẻ | `events_unavailable` có, không retry |

Log: chỉ method + path + mã lỗi (như `client.ts`); lịch không có dữ liệu cá nhân.

## Out of scope

- Màn lịch âm `/lunar`, chi tiết ngày `/lunar/day`, ảnh Phật theo ngày (product §1.2 — v1.x). Chúng dùng chung `getCalendarYear`; spec này chỉ cập nhật lời gọi khi đổi chữ ký hàm, giữ nguyên hành vi (kể cả lời mời đăng nhập của `/lunar`).
- Sự kiện của chùa (feature sangha), nhắc ngày lễ, gợi ý kinh, chùa tổ chức, nghỉ bù, sự kiện cá nhân, nội dung ngoài tiếng Việt (product §1.2).
- Tính ngày sự kiện, quy tắc lặp, tiết khí, lịch âm của sự kiện (BR-CAL-01…07 — backend).
- Màn hình back-office (FR-CAL-010).

## Pending (not yet implemented)

Theo dõi ở `tasks.md`:

- Gọi route không kèm token, bỏ lời mời đăng nhập ở `/events`, `/events/[code]`, khối trang chủ (FR-CAL-001) — Phase 3, **chờ backend v3.0**.
- Chip "Lễ lớn" và dấu lễ lớn ở dòng, chi tiết (BR-CAL-10, FR-CAL-003) — Phase 1–2, **chờ backend v3.0** (`is_major`).
- Khối trang chủ 6 tháng, chỉ nhóm Phật giáo, ba tầng (BR-CAL-15, FR-CAL-006) — Phase 1–3, **chờ backend v3.0** (`is_major`, `recurrence`, `sort_order`).
- Tải thêm năm tới 2100 qua endpoint, retry, thông báo offline (FR-CAL-004, FR-CAL-008) — Phase 1–3.
- Bản sao cũ khi backend lỗi + ghi chú (FR-CAL-007) — Phase 3.
- Retry ở `/events` và khối trang chủ (FR-CAL-008) — Phase 1.
- Đếm ngày một hàm chung theo BR-CAL-13 (thêm "Ngày mai", bỏ "Đã qua N ngày", tính trong browser) — Phase 1–2.
- Mọi nhãn nhóm trên dòng (BR-CAL-09), dấu nhuận ngày âm (BR-CAL-08) — Phase 1.
- Bỏ dấu đầu dòng trong lễ nghi, bỏ fallback mô tả ngắn, ảnh mặc định, tiêu đề `ev_d_dos` (BR-CAL-14) — Phase 1.
- Test chạy ba file vector, E2E, đo NFR-CAL-03 — Phase 4.

## Open questions (resolved)

- ~~Khách có xem được lịch không?~~ → Có, mọi người như nhau (FR-CAL-001). Resolved 2026-10-15 (product v1.0).
- ~~Lọc theo gì?~~ → "Tất cả", "Lễ lớn", rồi từng nhóm (FR-CAL-003). Resolved 2026-10-15 (product v1.0).
- ~~Khối trang chủ hiện gì?~~ → BR-CAL-15 (6 tháng, nhóm Phật giáo, ba tầng). Resolved 2026-10-15 (product v1.1).
- ~~Website có giữ sự kiện trước / sau không?~~ → Có, chỉ website (§3.6 FR-CAL-009). Resolved 2026-10-15 (product v1.0).
- ~~"Bản sao của thiết bị" trên website là gì?~~ → Bản sao của server website hoặc trình duyệt trong phiên (§3.6 FR-CAL-007); chọn bản sao trong bộ nhớ server (AC 19, mặc định platform). Resolved 2026-10-15.
- ~~Website nhận biết Rằm / Mùng 1 cho tầng 3 thế nào?~~ → Field `recurrence = lunar_monthly` (backend v3.0 E13), không so `code`. Resolved 2026-10-15 (backend spec v3.0).
