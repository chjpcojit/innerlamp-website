# TD-MEM-CLIENT-02 — Website không có nhắc giỗ

| Field   | Value                                                |
| ------- | ---------------------------------------------------- |
| ID      | TD-MEM-CLIENT-02                                     |
| Feature | memorial (web)                                       |
| Status  | Open — chấp nhận (D2)                                |
| Owner   | ⚔ Đạo Sư ⚔ (Tech Lead)                               |
| Target  | Notification list + Web Push (nếu làm)               |
| Source  | `technical-decisions.md` D2; product §3.6 FR-MEM-008 |

## Nợ

Website không dùng Notification API/Service Worker/Web Push. Người dùng web chỉ thấy ngày giỗ khi mở
sổ; không có kênh nhắc nào.

## Ảnh hưởng

FR-MEM-008 không đạt trên web. UI **không** được hứa "sẽ nhắc"; dấu "Có nhắc" chỉ nói cấu hình đã
lưu (FR-MEM-007).

## Điều kiện trả

BE có notification list API + web hiển thị trong `/notifications`; nếu cần nhắc chủ động thì có
Web Push (VAPID) và quyết định sản phẩm riêng.
