# Flow — memorial (Sổ giỗ chạp) — website

Version: 1.4
Last updated: 2026-11-19
Status: P4 — khớp `design.md` v3.0 và `client-contract.md` (pin 2026-11-16)

Mỗi flow ghi rõ: trigger, nơi chạy, dữ liệu vào/ra, nhánh lỗi. Token luôn đọc từ cookie `il_token`
ở server; browser không thấy token.

## F1 — Mở sổ

```
1. GET /memorial
2. load (set `Cache-Control: private, no-store`, `Referrer-Policy: no-referrer`) (memorial/+page.server.ts):
   - !locals.user || !token → { entries: null } (GuestPrompt, không gọi BE)
   - GET /v1/memorials (Bearer + x-api-key)
       200 → { items, total } → map DTO → MemorialEntry[]
       401 → endSession(cookies); redirect(303, /login?redirect=/memorial)
       mạng/5xx → { entries: null, loadError: true }
   - đọc cookie il_mem_flash rồi xoá → { flash }
3. MemorialBook:
   - onMount: today = new Date(); xoá key localStorage 'il-memorial' (một lần)
   - $derived: nextAnniversary(entry, today) cho từng mục, sort(days, name, id)
   - SSR/trước mount: không render số ngày, không render thẻ nổi bật
4. loadError → mem_err_load + mem_retry (tải lại trang)
5. total = 0 → mem_empty_* + mem_add
```

## F2 — Thêm người thân

```
1. GET /memorial/new → load: khách → GuestPrompt; có phiên → form mặc định
2. Submit (use:enhance):
   a. browser: validateMemorialForm(draft)
        lỗi → cancel(), hiện lỗi theo ô
   b. POST tới URL hiện tại (default action, multipart/form-data của form)
3. action default:
   - !token → 303 /login
   - đọc form field (name, relation, calendar, day, month, year, leap, note, reminder_on, lead, time)
   - validateMemorialForm (cùng hàm) → fail(400, { values, errors })
   - dựng MemorialRequest (memorial-map.ts):
       full_name = trim(name)
       relationship = RELATION_TO_API[relation]
       death_calendar = calendar
       biết năm + âm → lunarToSolarExact(...) → death_date; null → fail(mem_f_date_not_exist)
       biết năm + dương → death_date (kiểm ngày tồn tại)
       không rõ năm → death_day + death_month (+ death_leap_month nếu âm)
       note = trim || null
       reminder = reminder_on ? { days_before: lead, time } : null
   - POST /v1/memorials
       201 → flash {kind:'saved'} → 303 /memorial (F1)
       400 → map details.field → fail(400, { values, errors })
       401 → endSession; giữ form + draft; mem_err_session + link đăng nhập
       409 MEMORIAL_LIMIT_REACHED → fail(409, { error:'full', values })
       413/mạng/5xx → fail(502, { error:'save', values })
```

## F3 — Sửa người thân

```
1. GET /memorial/[id]
   - khách → GuestPrompt
   - GET /v1/memorials/{id}
       200 → map → { entry }
       404 → { entry: null } + notFound (mem_not_found + mem_back)
       401 → endSession; giữ form + draft; mem_err_session + link đăng nhập
       mạng/5xx → { entry: null, loadError: true }
2. Form điền từ entry; reminder cũ ngoài lựa chọn → nearestReminderChoice (không ghi đè tới khi lưu)
3. POST ?/save
   - như F2 bước 3, nhưng PUT /v1/memorials/{id} với body ĐẦY ĐỦ
       200 → flash saved; 303 /memorial
       404 → flash {kind:'gone'}; 303 /memorial
       400/413/mạng/5xx → giữ form + lỗi
```

## F4 — Xoá người thân

```
1. Bấm mem_delete → <dialog> confirm (không JS: khối <noscript> + form ?/delete)
2. Huỷ → đóng, không gọi BE
3. POST ?/delete (không gửi/không lưu tên trong flash)
   - DELETE /v1/memorials/{id}
       200 → flash {kind:'deleted'}; 303 /memorial
       404 → flash {kind:'gone'}; 303 /memorial (coi như xong)
       401 → endSession; giữ form + draft; mem_err_session + link đăng nhập
       mạng/5xx → fail(502, { error:'delete' }); ở lại form
```

## F5 — Ảnh (sau cờ `MEMORIAL_PHOTO_ENABLED`)

```
0. Cờ false (mặc định): load trả photoEnabled=false; UI không render khối ảnh; action trả 404.
1. Form sửa, chọn file JPEG/PNG/WebP ≤ 5 MiB
   - browser kiểm size + MIME; sai → mem_photo_too_large / mem_photo_unsupported, không gửi
2. POST ?/photo (form multipart riêng, part name='photo')
   - server kiểm lại size/MIME → fail tương ứng
   - PUT /v1/memorials/{id}/photo với FormData (apiCall bỏ Content-Type JSON)
       200 → redirect về form; entry mới có hasPhoto=true (ảnh lấy qua proxy)
       413 → mem_photo_too_large; 415 → mem_photo_unsupported
       400/404/5xx → mem_err_photo; ảnh cũ vẫn hiện
       401 → endSession; giữ form + draft; mem_err_session + link đăng nhập
3. POST ?/photoDelete → DELETE /v1/memorials/{id}/photo
       200 → hasPhoto=false → chữ viết tắt
4. Ảnh hiển thị qua proxy cùng origin `/memorial/{id}/photo`; proxy 403 → lấy URL mới, thử một lần, không loop
```

## F6 — Hết phiên (mọi flow)

```
1. apiCall trả 401 UNAUTHORIZED
2. hooks.server.ts handleFetch: refresh một lần từ il_refresh rồi thử lại
3. vẫn 401 → endSession (xoá il_token/il_refresh/il_name) + event.locals.sessionEnded
4. GET navigation → 303 /login?reason=session_ended&redirect=<path>
5. Sau đăng nhập → quay lại đúng route; sổ đọc lại từ server, không có dữ liệu tài khoản cũ
```

## F7 — Lỗi validate (mã → field)

| Mã                                                                | Field UI    | Nguồn                          |
| ----------------------------------------------------------------- | ----------- | ------------------------------ |
| `mem_f_name_err`                                                  | ô tên       | rỗng sau trim                  |
| `mem_f_name_too_long`                                             | ô tên       | > 100                          |
| `mem_f_note_too_long`                                             | ô ghi chú   | > 1000                         |
| `mem_f_date_invalid`                                              | khối ngày   | ngày không tồn tại             |
| `mem_f_date_not_exist`                                            | khối ngày   | năm không có tháng nhuận       |
| `mem_f_date_future`                                               | khối ngày   | sau hôm nay (Asia/Ho_Chi_Minh) |
| `mem_f_year_min`                                                  | khối ngày   | < 1900                         |
| `mem_err_full`                                                    | banner form | 409                            |
| `mem_err_save`                                                    | banner form | 400 field lạ / 413 / 5xx       |
| `mem_err_delete`                                                  | banner form | xoá 5xx                        |
| `mem_flash_gone`                                                  | banner sổ   | PUT/DELETE 404                 |
| `mem_err_load`                                                    | banner sổ   | GET mạng/5xx                   |
| `mem_photo_too_large` / `mem_photo_unsupported` / `mem_err_photo` | khối ảnh    | 413 / 415 / khác               |
