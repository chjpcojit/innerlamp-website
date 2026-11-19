# TD-MEM-CLIENT-01 — Nhắc giỗ chạy local thay vì server

| Field   | Value                                                        |
| ------- | ------------------------------------------------------------ |
| ID      | TD-MEM-CLIENT-01                                             |
| Feature | memorial                                                     |
| Status  | Open — chấp nhận tạm thời (D1)                               |
| Owner   | ⚔ Đạo Sư ⚔ (Tech Lead)                                       |
| Target  | Phase 10 + feature notification (BE)                         |
| Source  | `technical-decisions.md` D1; `ac-memorial-clients-v1.md` Q-1 |

## Nợ

iOS/Android tự đặt nhắc local theo `{days_before, time}`; website **không** đặt nhắc. Không có
một nguồn nhắc phía server, không đồng bộ giữa thiết bị, không đáp ứng đầy đủ BR-MEM-13.

## Ảnh hưởng

- Nhiều thiết bị = nhiều nhắc; sửa trên web/thiết bị khác không cập nhật máy này.
- Website chỉ lưu cấu hình, hiện dấu "Có nhắc"; FR-MEM-008 chưa đạt trên web.

## Điều kiện trả

Đủ cả 4: Phase 8 deploy (contract v4.0) · Phase 9 lập kế hoạch `next_reminder_at` · Phase 10 +
notification deploy (push/inbox) · có bản client phát hành tắt nhắc local (`NoopReminderScheduler`

- `cancelAll()` một lần). Thứ tự cutover B1–B4 trong D1.
