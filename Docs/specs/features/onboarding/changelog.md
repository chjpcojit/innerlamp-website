# Changelog — onboarding Spec

Tracks version history for `requirements.md`, `design.md`, and `tasks.md` in this folder. All three
files share one changelog since they change together as one spec unit. Newest version first.

## v1.1 (2026-10-15)

- Bước dọn tài liệu cũ: đã xoá `Docs/specs/features/register/` (spec SĐT + SMS) sau khi cả bốn spec nền tảng được duyệt; `tasks.md` Phase 5 tick mục này. Bỏ hai gạch đầu dòng "Logged-in detection" và "Mock login" trong `.assumptions.md` (website đã có đăng nhập thật với cookie httpOnly). `requirements.md`/`design.md` không đổi ngoài version.

## v1.0 (initial) (2026-10-14)

- `requirements.md`: tạo mới theo product onboarding v1.2 (ADR-0003): đăng ký bằng email + mã qua email, SĐT gửi `phone_country` + số đã gõ, luật kiểm theo BR-ONB-04…07 (mật khẩu đếm ký tự, 12 nước), email đã có tài khoản trông như email mới, "Đổi email", hết hạn về bước 1 giữ ô, đề xuất chùa không bắt buộc địa chỉ đường, người đã đăng nhập mở `/signup` về trang chủ. AC1–AC19 gắn ID product.
- `design.md`: tạo mới — giữ kiến trúc `/signup` hai bước, ba action; Step-by-step Flow 1–4; bảng Layers đánh dấu file cần sửa.
- `tasks.md`: tạo mới — 5 Phase; `[x]` chỉ cho phần đã kiểm trong code và vẫn đúng (không echo mật khẩu, đề xuất chùa gửi sau khi tạo tài khoản, đồng hồ theo response).
- Thay `../register/` v1.2 (SĐT + SMS) — folder đó xoá ở bước dọn tài liệu cũ.
- Hand-offs: backend — giới hạn theo IP của khách website (backend login v2.2 AC34, cùng đợt). Product — không có.
- Reason: anh Đức bỏ SMS (2026-10-14); product onboarding v1.2, backend onboarding v8.0.
