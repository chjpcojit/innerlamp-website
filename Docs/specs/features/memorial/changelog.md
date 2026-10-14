# Changelog — memorial Spec

Tracks version history for `requirements.md`, `design.md`, and `tasks.md` in this folder. All three
files share one changelog since they change together as one spec unit. Newest version first.

## v1.0 (initial) (2026-10-14)

- `requirements.md`: spec đầu tiên, viết retroactively từ code đang chạy (đọc 2026-10-14) và đối chiếu với product spec innerlamp-be `docs/product/memorial/product.md` @ v1.0, contract `docs/specs/api/openapi.yaml` @ 5f4ca56. Header `Product spec` / `Contract` / `Implements`; 25 tiêu chí EARS, mỗi tiêu chí gắn `FR-MEM-*` / `BR-MEM-*` / `NFR-MEM-*` hoặc `(platform)`; bảng Error → UI có cột "Hiện trạng code"; 3 marker `⚠️ Not confirmed (product)`.
- `design.md`: tạo mới — bảng Layers & components (cái đã có / cần sửa / chưa tạo), navigation, bốn Step-by-step Flow (mở sổ; thêm; sửa có đọc lại `reminder` trước `PUT`; xoá có xác nhận), cookie flash `il_mem_flash`, danh sách key i18n thêm/bỏ.
- `tasks.md`: tạo mới — 6 Phase; `[x]` chỉ cho phần đã kiểm trong code và đúng product (giao diện sổ, form, preview, `nextAnniversary`, `solarToLunar`); mọi việc lưu trữ backend `[ ]`; task chạy ba file vector của product.
- Product spec / contract: adopt product v1.0 (Website column của §4.2, §3.6 dòng FR-MEM-007/BR-MEM-11, FR-MEM-008, FR-MEM-009, FR-MEM-010, BR-MEM-05…10); contract @ 5f4ca56, 5 route Memorials.
- Drift so với product (để `ba-writer` thấy cột Website là `drift`): sổ nằm trong `localStorage`, không gắn tài khoản (BR-MEM-01; trang đã chặn khách nhưng dữ liệu không lên backend); form hiện cấu hình nhắc và "Thêm vào lịch nhắc" (trái §3.6, FR-MEM-009); không có lựa chọn tháng nhuận (BR-MEM-04); năm chỉ 97 năm gần nhất, ngày dương cho tới 31 mọi tháng, không kiểm ngày tồn tại / sau hôm nay (BR-MEM-03); xoá không hỏi xác nhận (BR-MEM-12); không giới hạn tên 100 / ghi chú 1000 (BR-MEM-02).
- Kiểm chứng ngoài repo (không commit): chạy `nextAnniversary` hiện tại trên 17/17 case `next-anniversary.json` và `solarToLunar` trên 5/5 case dương → âm của `death-date-conversion.json` — đều đạt; 4 case âm → dương chưa có hàm tương ứng.
- Hand-offs (`ba-writer`): (1) FR-MEM-001 "from the home screen" vs prototype web đặt lối vào ở trang Hồ sơ; (2) mục tạo trên website có nhận nhắc mặc định của FR-MEM-003 không, `add_to_os_reminder` là gì; (3) chữ thẻ `mem_pt_2_*` nói về chọn nhắc trong khi website không có cấu hình nhắc. Backend: none.
- Tài liệu cũ (`.assumptions.md` mục "Memorial book") giữ nguyên, dọn ở bước sau.
- Reason: chuyển website sang mô hình 3 lớp tài liệu (product spec → contract → platform spec), pilot memorial.
