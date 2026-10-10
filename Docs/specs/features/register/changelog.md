# Changelog — Register Spec

Tracks version history for `requirements.md`, `design.md`, and `tasks.md` in this folder. All three
files share one changelog since they change together as one spec unit. Newest version first.

## v1.1 (2026-10-10)

- `requirements.md`: thêm mục "Bảo mật & ràng buộc đầu vào"; `ordination_place` chuyển từ ⚠️ sang resolved (chuỗi tự do ≤ 255); ⚠️ `API_KEY` production thêm OTP dev `111111` là blocker phía BE.
- `design.md`: thêm mục "Ràng buộc đầu vào & bảo mật"; Step-by-step Flow không đổi cấu trúc.
- `tasks.md`: bỏ item "chốt `ordination_place`" khỏi Phase 2; thêm Phase 5 — Bảo mật (4 việc FE, 1 mục chờ BE).
- Reason: đối chiếu với session BE (đã đọc code BE thật): BE trả 500 thay vì 400 với password > 72 byte hoặc chuỗi > 255 ký tự, và chưa có rate limit theo IP.

## v1.0 (2026-10-10)

- `requirements.md`: viết lại theo EARS từ code đang chạy; thêm cột "Hiện trạng code" vào bảng lỗi; sửa các điểm lệch so với spec cũ: số điện thoại có chọn quốc gia và FE ghép E.164, mật khẩu kiểm theo byte, "Đổi số điện thoại" giữ cả mật khẩu, lỗi hiện một dòng chung (không theo ô), `PENDING_REGISTRATION_EXPIRED` chưa quay về bước 1.
- `design.md`: tạo mới — bảng layer/file thật, navigation, Step-by-step Flow 3 bước (request-otp → resend/verify-otp → lưu phiên).
- `tasks.md`: tạo mới — Phase 1 đánh `[x]` sau khi kiểm tra file; Phase 2–4 còn `[ ]`.
- Reason: spec cũ là một file `requirements.md` không có phiên bản, viết trước khi code hoàn thiện nên lệch ở một số hành vi UI; chuyển sang bộ 3 file có version.
