# Design — memorial (Sổ giỗ chạp) — website

Version: 3.4
Last updated: 2026-11-19
Status: in-progress (P4) — mirror `requirements.md`

> See `changelog.md`; step-by-step data flow in `flow.md`.

## Overview

Ba route trong group `(site)`: `/memorial`, `/memorial/new`, `/memorial/[id]`. Dữ liệu đọc trong
`load` của `+page.server.ts`, ghi bằng form action, cả hai gọi `$lib/server/api/memorials.ts` →
backend `/v1/memorials` với Bearer từ cookie `il_token`. Không còn `localStorage`.

Kỳ giỗ, số ngày, lần giỗ và preview tính **trong browser** bằng `utils/memorial.ts` +
`utils/lunar.ts` (BR-MEM-08). Quy đổi âm → dương trước khi gửi chạy trên server bằng cùng hàm thuần
(`lunarToSolarExact`). Ảnh đã bật (D4); `MEMORIAL_PHOTO_ENABLED=false` là kill switch.

Mẫu trong repo: `profile` (`load` có token), `practice/lamp` (action + `fail` + map `ApiError`).

## Layers & components

| Layer          | File                                                                             | Responsibility                                                                                                                       | Trạng thái                     |
| -------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| Route (UI)     | `src/routes/(site)/memorial/+page.svelte`                                        | Meta, `GuestPrompt`, `MemorialBook` nhận `data`                                                                                      | sửa                            |
| Route (server) | `src/routes/(site)/memorial/+page.server.ts`                                     | `load`: khách → không gọi BE; có phiên → `listMemorials` + map + flash; 401 → login; lỗi → `loadError`                               | **mới**                        |
| Route (UI)     | `src/routes/(site)/memorial/new/+page.svelte`                                    | Meta, `GuestPrompt`, `MemorialForm` (mode thêm)                                                                                      | sửa                            |
| Route (server) | `src/routes/(site)/memorial/new/+page.server.ts`                                 | action `default`: validate, build request, `createMemorial`, flash, 303                                                              | **mới**                        |
| Route (UI)     | `src/routes/(site)/memorial/[id]/+page.svelte`                                   | Meta, `GuestPrompt`, not-found, `MemorialForm` (mode sửa)                                                                            | sửa                            |
| Route (server) | `src/routes/(site)/memorial/[id]/+page.server.ts`                                | `load`: `getMemorial`; actions `save`, `delete`, `photo`, `photoDelete`                                                              | **mới**                        |
| Section UI     | `MemorialBook.svelte`                                                            | Đếm, thẻ nổi bật, danh sách sắp theo kỳ giỗ, empty, flash, `loadError`, avatar ảnh                                                   | sửa                            |
| Section UI     | `MemorialForm.svelte`                                                            | Form POST + `use:enhance`, chip → hidden input, năm 1900→nay, ngày theo tháng, nhuận, preview, khối nhắc, confirm xoá, khối ảnh (cờ) | sửa                            |
| UI primitive   | `<dialog>` trong `MemorialForm.svelte`                                           | Xác nhận xoá; `<noscript>` khối xác nhận                                                                                             | mới (inline)                   |
| Logic          | `src/lib/utils/memorial.ts`                                                      | `nextAnniversary` (BR-MEM-05…09), nhận `today`                                                                                       | sửa nhẹ (type `leap` optional) |
| Logic          | `src/lib/utils/memorial-validate.ts`                                             | `validateMemorialForm` dùng chung browser + action, mỗi lỗi một mã                                                                   | **mới**                        |
| Logic          | `src/lib/utils/memorial-reminder.ts`                                             | `nearestReminderChoice({days_before,time})` theo FR-MEM-007                                                                          | **mới**                        |
| Logic          | `src/lib/utils/lunar.ts`                                                         | **thêm** `lunarToSolarExact(day, month, year, leap)`; không đổi hàm cũ                                                               | sửa                            |
| Format         | `src/lib/utils/memorial-format.ts`                                               | `deathDateLabel` thêm năm + nhuận; `remindLabel` bỏ `sync`; `initials`                                                               | sửa                            |
| Content        | `src/lib/content/memorial.ts`                                                    | Quan hệ, nhãn, lead/giờ                                                                                                              | giữ                            |
| Types          | `src/lib/types/memorial.ts`                                                      | View model (`id: number`, `leap`, `reminder`, `hasPhoto`) + DTO + request                                                            | sửa                            |
| API resource   | `src/lib/server/api/memorials.ts`                                                | 5 CRUD + 2 ảnh qua `apiCall`; multipart FormData                                                                                     | **mới**                        |
| Mapper         | `src/lib/server/api/memorial-map.ts`                                             | DTO ↔ view model; form → request; enum 2 chiều; ngày                                                                                 | **mới**                        |
| Shared helper  | `src/lib/server/api/client.ts`                                                   | Thêm nhánh `FormData` (bỏ `Content-Type` JSON); không đổi call JSON                                                                  | sửa                            |
| Flash          | `src/lib/server/memorial-flash.ts`                                               | Cookie `il_mem_flash` (httpOnly, 60 s, `{kind}`) đọc-rồi-xoá                                                                         | **mới**                        |
| Config         | `src/lib/server/memorial-config.ts`                                              | `photoEnabled()` bật mặc định; `MEMORIAL_PHOTO_ENABLED=false` tắt UI/action/proxy                                                    | **mới**                        |
| Security       | `src/lib/server/security-headers.ts`, `memorial-headers.ts`, `memorial-guard.ts` | CSP/frame, no-store + no-referrer cho sổ giỗ, guard fail-closed                                                                      | **mới**                        |
| Ảnh (proxy)    | `src/routes/(site)/memorial/[id]/photo/+server.ts`                               | Stream ảnh cùng origin, giấu signed URL, **không cache URL**, refresh 403 một lần                                                    | **mới**                        |
| Profile        | `src/lib/content/profile.ts`, `ProfileLinks.svelte`                              | Bỏ đếm từ store; dòng là lối vào `/memorial`                                                                                         | sửa                            |
| State          | `src/lib/state/memorial.svelte.ts`                                               | **xoá**; key `il-memorial` xoá một lần qua `utils/legacy-storage.ts`                                                                 | xoá                            |
| Tests          | `src/lib/**/*.spec.ts`, `tests/vectors/memorial/*.json`                          | Vector + mapper + validate + API + client                                                                                            | **mới**                        |

## Model

```ts
// view model (browser + server)
interface MemorialEntry {
	id: number;
	name: string;
	relation: Relation; // internal key, map 1:1 ở mapper
	calendar: 'lunar' | 'solar';
	day: number;
	month: number;
	year: number | null; // năm trong lịch đã nhập
	leap: boolean;
	note: string;
	reminder: { lead: number; time: string } | null;
	hasPhoto: boolean; // ảnh đi qua proxy /memorial/{id}/photo
}

// DTO: đúng contract §2 — snake_case, id number, death_* nullable, reminder {days_before,time}
```

Map enum: `GRANDFATHER_PATERNAL ↔ paternal_grandfather`, … (bảng 10 dòng tường minh, hai chiều).
Enum lạ khi decode → `ApiError(0,'DECODE_ERROR')` có kiểm soát, **không** đoán `OTHER`.

## Data mapping

- **Đọc, có `death_date`:** tách `YYYY-MM-DD` thành `(y,m,d)` local (không parse UTC). Nếu
  `death_calendar = lunar` → `solarToLunar(new Date(y,m-1,d))` lấy `day/month/year/leap`; nếu solar →
  dùng thẳng, `leap = false`.
- **Đọc, không có `death_date`:** dùng `death_day/death_month/death_leap_month`, `year = null`.
- **Đọc `reminder`:** `nearestReminderChoice()`; `null` → tắt. Không đọc/ghi `timezone`,
  `add_to_os_reminder`.
- **Ghi, biết năm + âm:** `lunarToSolarExact(day, month, year, leap)` → `death_date`; `null` →
  `mem_f_date_not_exist`; không gửi `death_day/month/leap`.
- **Ghi, biết năm + dương:** `death_date` sau khi kiểm ngày tồn tại (29/2 theo năm nhuận).
- **Ghi, không rõ năm:** `death_day`, `death_month`; `death_leap_month` chỉ khi âm.
- **Ghi `note`:** trim, rỗng → `null`. **`reminder`:** tắt → `null`; bật → `{days_before,time}`.
- **PUT:** luôn dựng body đầy đủ từ form (thay thế toàn bộ).

## Route & navigation flow

```
/profile ──"Sổ giỗ chạp"──▶ /memorial            (khách: GuestPrompt → /login)
/memorial
  ├─ "Thêm người thân" ──▶ /memorial/new
  │     └─ submit ✓ ──▶ POST ──▶ flash saved ──▶ 303 /memorial
  └─ chọn một mục ──▶ /memorial/[id]
        ├─ ?/save ✓ ──▶ PUT ──▶ flash saved ──▶ 303 /memorial
        ├─ ?/save 404 ──▶ flash gone ──▶ 303 /memorial
        ├─ "Hủy" ──▶ /memorial (không gọi BE)
        ├─ "Xóa" ──▶ <dialog> xác nhận ──▶ ?/delete ──▶ 303 /memorial
        ├─ ?/photo (cờ) ──▶ PUT multipart ──▶ ở lại form
        └─ ?/photoDelete (cờ) ──▶ DELETE ──▶ ở lại form
```

Mọi `href`/redirect dùng `localizeHref`.

## Session & cookies

- Dùng lại `il_token` / `il_refresh` / `il_name`; hook refresh một lần rồi thử lại.
- `il_mem_flash`: httpOnly, `sameSite=lax`, `secure` ở prod, path `/`, `maxAge` 60; JSON
  `{kind: "saved"|"deleted"|"gone"}` — **không tên, không ngày** (NFR-MEM-02). `load` của `/memorial`
  đọc rồi xoá ngay. Không query string.
- CSP + `frame-ancestors 'none'` + `X-Frame-Options: DENY` cho mọi response (`hooks.server.ts`).
- 401: `endSession(cookies)` + `redirect(303, localizeHref('/login'))`.

## Ảnh — cờ `MEMORIAL_PHOTO_ENABLED` + proxy

- Cờ bật mặc định (BE deploy 2026-11-17, smoke dev 2026-11-19); `MEMORIAL_PHOTO_ENABLED=false` là kill switch. `load` trả `photoEnabled`; UI chỉ render
  khối ảnh khi true; action `photo`/`photoDelete` và route proxy trả 404 khi tắt.
- Upload: `<input type="file" accept="image/jpeg,image/png,image/webp" name="photo">`; kiểm
  `size ≤ 5 242 880` và MIME ở browser + server; `FormData` chỉ có part `photo`. Upload xong redirect
  về form để đọc lại entry (signed URL mới), không lưu URL.
- **Book chỉ render `<img>` khi `photoEnabled && hasPhoto`**; cờ tắt thì luôn hiện initials.
- **Signed URL 15 phút không bao giờ xuống browser.** `MemorialEntry` chỉ có `hasPhoto: boolean`;
  `<img>` trỏ `/memorial/{id}/photo` (cùng origin). Route `[id]/photo/+server.ts` đọc token, lấy
  `photo_url` mới **mỗi lần** (không cache server, để thay/xoá ảnh thấy ngay), rồi stream bytes.
  Gặp 403 thì lấy URL mới và thử **một lần**, không loop; ảnh trả `Cache-Control: private, no-store`,
  `Referrer-Policy: no-referrer`.
- Trang sổ giỗ trả `Cache-Control: private, no-store` + `Referrer-Policy: no-referrer`.

## i18n keys (thêm/sửa/bỏ)

| Key                                                                                                                                                                                                                                | Việc                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `mem_confirm_delete_title/desc/ok/cancel`                                                                                                                                                                                          | thêm (xoá có xác nhận)            |
| `mem_err_full`, `mem_f_name_too_long`, `mem_f_note_too_long`, `mem_f_date_invalid`, `mem_f_date_not_exist`, `mem_f_year_min`, `mem_f_date_future`, `mem_err_save`, `mem_err_load`, `mem_retry`, `mem_flash_gone`, `mem_err_delete` | thêm                              |
| `mem_f_leap`, `mem_date_lunar_leap`, `mem_date_with_year`                                                                                                                                                                          | thêm                              |
| `mem_photo_title`, `mem_photo_desc`, `mem_photo_choose`, `mem_photo_remove`, `mem_photo_too_large`, `mem_photo_unsupported`, `mem_err_photo`                                                                                       | thêm (cờ)                         |
| `mem_not_found`                                                                                                                                                                                                                    | sửa theo "Entry no longer exists" |
| `mem_flash_saved_reminder`, `mem_remind_in_calendar`, `mem_sync_title`, `mem_sync_desc`                                                                                                                                            | **bỏ**                            |

## Tests

- `tests/vectors/memorial/*.json` (pin `e5d4c9c`) chạy nguyên: `nextAnniversary`, `lunarToSolarExact`
  - `solarToLunar`, `nthLabel`.
- Unit: mapper, `nearestReminderChoice`, `validateMemorialForm`, `apiCall` JSON vs FormData,
  `memorials.ts` (5 route + ảnh 200/413/415), flash cookie.
- E2E Playwright: **chưa cài** — P5, cần duyệt (spec.config `verify.web.E`).
