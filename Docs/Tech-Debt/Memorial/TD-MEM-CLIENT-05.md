# TD-MEM-CLIENT-05 — Không chống sửa đồng thời (last-write-wins)

| Field   | Value                                                |
| ------- | ---------------------------------------------------- |
| ID      | TD-MEM-CLIENT-05                                     |
| Feature | memorial (all clients)                               |
| Status  | Open — chấp nhận (D10)                               |
| Owner   | ⚔ Đạo Sư ⚔ (Tech Lead)                               |
| Target  | Khi có nhu cầu thật hoặc ETag/version trong contract |
| Source  | `technical-decisions.md` D10; contract §6.10         |

## Nợ

`PUT` thay thế toàn bộ document, không version/ETag/If-Match. Hai thiết bị sửa cùng lúc → bản ghi sau
thắng, mất sửa của bản trước; không có 409 conflict cho sửa.

## Ảnh hưởng

Web + iOS + Android. Không phát hiện được conflict; người dùng có thể mất nội dung vừa sửa.

## Điều kiện trả

BE thêm `version`/`ETag` + `If-Match` (409 `MEMORIAL_CONFLICT`) hoặc có yêu cầu business rõ; khi đó
client hiện thông báo "bản trên thiết bị khác đã đổi" và cho tải lại.
