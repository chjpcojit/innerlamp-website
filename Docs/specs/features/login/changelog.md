# Changelog — Login Spec

Tracks version history for `requirements.md`, `design.md`, and `tasks.md` in this folder. All three
files share one changelog since they change together as one spec unit. Newest version first.

## v1.1 (2026-10-10)

- `requirements.md`: thêm mục "Bảo mật — đối chiếu FE↔BE" (10 điểm BE xác nhận + việc FE/BE cần làm); chuyển 2 câu hỏi vào "resolved" (grace window: không có; `expires_in`: có); cập nhật ⚠️ `API_KEY` production thành "chờ BE".
- `design.md`: thêm mục "Bảo mật phiên"; Step 1–2 giữ nguyên cấu trúc, chỉ ghi thêm yêu cầu forward User-Agent và single-flight.
- `tasks.md`: thêm Phase 5 — Bảo mật (7 việc FE, 1 mục chờ BE). Không có item `[x]` nào đổi.
- Reason: đối chiếu với session BE (đã đọc code BE thật) cho thấy race refresh không có grace window và TTL hard-code nên cần sửa phía FE.

## v1.0 (2026-10-10)

- `requirements.md`: viết lại theo EARS từ code đang chạy; thêm cột "Hiện trạng code" vào bảng lỗi; sửa các điểm lệch so với spec cũ: mock login đã được gỡ, mật khẩu không bị xoá sau khi lỗi, nút OTP SMS và link "Quên?" đang hiển thị nhưng chưa có hành vi, `locked_until` chưa được dùng, cơ chế 401→refresh→retry chưa hiện thực.
- `design.md`: tạo mới — bảng layer/file thật, navigation, Step-by-step Flow 3 bước (login → refresh trong hook → logout).
- `tasks.md`: tạo mới — Phase 1 đánh `[x]` sau khi kiểm tra file; Phase 2–4 còn `[ ]`.
- Reason: spec cũ là một file `requirements.md` không có phiên bản, còn nhắc code mock đã bị thay bằng API thật; chuyển sang bộ 3 file có version.
