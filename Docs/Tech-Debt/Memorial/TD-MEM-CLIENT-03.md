# TD-MEM-CLIENT-03 — iOS giới hạn 60 notification

| Field   | Value                                                     |
| ------- | --------------------------------------------------------- |
| ID      | TD-MEM-CLIENT-03                                          |
| Feature | memorial (iOS)                                            |
| Status  | Open — chấp nhận tạm thời (D1)                            |
| Owner   | ✦ Nguyên Anh ✦ (iOS)                                      |
| Target  | Khi có server push                                        |
| Source  | `technical-decisions.md` D1 — giới hạn 64 pending của iOS |

## Nợ

Mỗi mục có nhắc đặt 3 kỳ giỗ kế tiếp; iOS cap 64 pending nên đặt tối đa **60** (20 mục × 3), ưu
tiên mục gần nhất; phần còn lại đặt khi app active. Sổ > 20 mục có nhắc chỉ được đặt trước một phần.

## Ảnh hưởng

iOS. Website không bị ảnh hưởng (không đặt nhắc local).

## Điều kiện trả

Có server push (Phase 10); client bỏ lịch local theo cutover D1.
