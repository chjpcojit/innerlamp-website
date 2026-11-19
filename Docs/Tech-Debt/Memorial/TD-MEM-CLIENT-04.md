# TD-MEM-CLIENT-04 — Android WorkManager trễ trong Doze

| Field   | Value                                                   |
| ------- | ------------------------------------------------------- |
| ID      | TD-MEM-CLIENT-04                                        |
| Feature | memorial (Android)                                      |
| Status  | Open — chấp nhận tạm thời (D1)                          |
| Owner   | ✦ Hóa Thần ✦ (Android)                                  |
| Target  | Khi có server push hoặc exact alarm được duyệt          |
| Source  | `technical-decisions.md` D1 — WorkManager one-time work |

## Nợ

Nhắc dùng `WorkManager` one-time work với `initialDelay`; trong Doze có thể trễ vài phút, cá biệt lâu
hơn. Không dùng exact alarm để tránh quyền `SCHEDULE_EXACT_ALARM`/Play policy.

## Ảnh hưởng

Android. Website không bị ảnh hưởng.

## Điều kiện trả

Có server push (Phase 10) hoặc được duyệt dùng exact alarm + quyền tương ứng.
