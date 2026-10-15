# Changelog — temple Spec

Tracks version history for `requirements.md`, `design.md`, and `tasks.md` in this folder. All three
files share one changelog since they change together as one spec unit. Newest version first.

## v1.0 (initial) (2026-10-15)

- `requirements.md`: spec đầu tiên của feature trên website. Retroactive cho phần đang chạy (khối chùa nổi bật ở `/`, danh bạ `/temples` theo `?page=`, trang chùa `/temples/[id]`, proxy `/api/temples` cho ô chọn chùa — đọc code ngày 2026-10-15), prospective cho phần mới của product v1.1 (tìm + lọc miền theo URL, trạng thái mở/đóng theo giờ Việt Nam, khối "Đang cập nhật"/"Không có", liên hệ, bỏ "Theo dõi"). Header `Product spec` @ v1.1, `Contract` openapi @ a8a016b + backend spec v2.0 (f3bb584) cho phần chưa có trong openapi, `Implements` mọi ID có cột Website khác `n/a`. 34 tiêu chí EARS, mỗi tiêu chí gắn `FR-TPL-*` / `BR-TPL-*` / `NFR-TPL-*` hoặc `(platform)`; bảng Error → UI có cột "Hiện trạng code".
- `design.md`: tạo mới — bảng Layers & components (có / cần sửa / chưa tạo / gỡ), bảng "Thứ tự khối" của trang chùa theo prototype, navigation, Step-by-step Flow danh bạ (gửi bộ lọc → chuẩn hoá URL → đọc trang), thiết kế `templeOpenStatus` (hàm thuần, chạy trong browser), bảng i18n thêm/bỏ.
- `tasks.md`: tạo mới — 6 Phase; `[x]` chỉ cho phần đã kiểm trong code và đúng product; task chạy `rules/temple-open-status.json`.
- Product spec / contract: adopt product v1.1 (Website column của §4.2; §3.6 dòng FR-TPL-002, BR-TPL-07, FR-TPL-008, FR-TPL-005, §2.4). Contract openapi @ a8a016b có `top`, danh sách theo `page`, `options`, chi tiết; `q`/`region`, trang 12 và bốn nhóm trường mới của chi tiết theo backend v2.0 AC 39–46, chờ openapi.
- Drift so với product (để `ba-writer` thấy cột Website): trang chủ cắt chùa nổi bật còn 7 (`HOME_TEMPLE_COUNT`) và hiện 3 chùa **mẫu** khi backend lỗi hoặc rỗng (BR-TPL-02, FR-TPL-001); nút "Theo dõi" lưu `localStorage` (BR-TPL-08); trang chùa ẩn khối thiếu dữ liệu, tiện ích chỉ hiện cái có (BR-TPL-06); giờ chỉ in chuỗi, không trạng thái (BR-TPL-09); "Chỉ đường" là URL tìm kiếm, không có điểm đến (FR-TPL-008); id lạ → trang 404 chung (FR-TPL-006); chữ trống của khối sự kiện khác product (FR-TPL-009); thẻ danh bạ thiếu loại chùa (§3.1.1); danh bạ lỗi không có "Thử lại" (FR-TPL-002); chưa có tìm/lọc (FR-TPL-003, FR-TPL-004).
- Còn mở: `⚠️ Not confirmed (product)` — thẻ khối trang chủ đủ trường hay gọn (AC 1); khối trang chủ khi backend lỗi (AC 3); trường "để sau" hiện "Đang cập nhật"/"Không có" hay ẩn (AC 21); dòng giờ Rằm & Mùng Một khi không có giờ lễ (AC 23). `⚠️ Not confirmed (contract)` — `q`/`region`, trang 12, bốn nhóm trường mới chưa có trong openapi.
- Hand-offs: `ba-writer` — bốn câu product ở trên; trạng thái cột Website ở §4.2. Backend — cập nhật `openapi.yaml` (q, region, `INVALID_FILTER`, trang 12, `TempleDetail` mới) theo backend v2.0 Phase 13.
- Quyết định platform: tìm/lọc là tham số URL đọc trong `load` (GET form, debounce 300 ms khi có JS), không thêm endpoint `/api/*`; trạng thái mở/đóng tính trong browser sau mount, mỗi phút; `?q=` có `noindex`; code mới ở `src/lib/features/temple/`.
- Tài liệu cũ (`.assumptions.md` mục "Catalogue pages" phần `/temples` và "Temple detail") giữ nguyên, dọn ở bước sau.
- Reason: product spec temple v1.1 (2026-10-15) và backend spec temple v2.0.
