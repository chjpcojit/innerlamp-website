# Design — memorial (Sổ giỗ chạp)

Version: 1.0
Last updated: 2026-10-14
Status: in-progress (drift) — mirror `requirements.md`

> See `changelog.md` in this folder for the version history of this spec.

## Overview

Ba route trong group `(site)`: `/memorial` (sổ), `/memorial/new` (thêm), `/memorial/[id]` (sửa/xoá). **Hiện tại** dữ liệu nằm trong `localStorage` qua `state/memorial.svelte.ts` và form lưu bằng JS phía browser — một ngoại lệ tạm so với AGENTS.md. **Thiết kế đích** theo data path của repo: đọc trong `load` của `+page.server.ts`, ghi bằng form action (`<form method="POST" use:enhance>`), cả hai gọi `$lib/server/api/memorials.ts` → backend `/v1/memorials` với Bearer từ cookie `il_token` (hook `handleAuth` của feature login lo refresh). Kỳ giỗ, số ngày còn lại, lần giỗ và preview được tính **trong browser** bằng `utils/memorial.ts` + `utils/lunar.ts` (BR-MEM-08: ngày của máy); việc quy đổi âm → dương trước khi gửi chạy trên server (cùng hàm thuần). Gần nhất để làm mẫu: `login` (action + `authFail`) và `profile` (`load` có token).

## Layers & components

| Layer | File | Responsibility | Trạng thái |
| --- | --- | --- | --- |
| Route (UI) | `src/routes/(site)/memorial/+page.svelte` | Meta, `GuestPrompt` cho khách, `MemorialBook` nhận `data` | có — cần nhận `data.entries` thay vì store |
| Route (server) | `src/routes/(site)/memorial/+page.server.ts` | `load`: khách → không gọi BE; có phiên → `listMemorials`, map sang view model; đọc + xoá cookie flash; lỗi → `loadError` | **chưa tạo** |
| Route (UI) | `src/routes/(site)/memorial/new/+page.svelte` | Meta, `GuestPrompt`, `MemorialForm` (mode thêm) | có |
| Route (server) | `src/routes/(site)/memorial/new/+page.server.ts` | Action `default`: validate (`validateMemorialForm`), build request, `createMemorial`, flash, 303 | **chưa tạo** |
| Route (UI) | `src/routes/(site)/memorial/[id]/+page.svelte` | Meta, `GuestPrompt`, `MemorialForm` (mode sửa) hoặc not-found | có — cần nhận `data.entry` |
| Route (server) | `src/routes/(site)/memorial/[id]/+page.server.ts` | `load`: `getMemorial`; actions `save` (GET lại → `updateMemorial`) và `delete` (`deleteMemorial`) | **chưa tạo** |
| Section UI | `src/lib/components/sections/MemorialBook.svelte` | Đếm, thẻ nổi bật, danh sách sắp theo kỳ giỗ, trạng thái rỗng, flash | có — cần: dữ liệu từ `data`, tính kỳ giỗ chỉ sau mount, ngày mất kèm năm/nhuận, bỏ phần "lịch nhắc", trạng thái `loadError` |
| Section UI | `src/lib/components/sections/MemorialForm.svelte` | Form tên, quan hệ, ghi chú, lịch/ngày/tháng/năm, preview, lưu/huỷ/xoá | có — cần: chuyển sang form POST + `use:enhance`, ẩn khối nhắc + `sync`, chọn nhuận, năm 1900→nay, ngày theo tháng, lỗi theo field, hộp xác nhận xoá |
| UI primitive | `src/lib/components/ui/ConfirmDialog.svelte` (hoặc `<dialog>` trong form) | Hộp xác nhận xoá (BR-MEM-12), fallback không JS bằng `?confirm=delete` | **chưa tạo** |
| State | `src/lib/state/memorial.svelte.ts` | Hiện: store `localStorage` (`il-memorial`) + flash | có — **gỡ** khi chuyển sang BE; flash chuyển sang cookie |
| Logic | `src/lib/utils/memorial.ts` (`nextAnniversary`) | BR-MEM-05…09 từ `{calendar, day, month, year}` + `today` | có — không cần đổi thuật toán; nhận `today` từ browser |
| Logic | `src/lib/utils/memorial-validate.ts` | `validateMemorialForm` (tên 1–100 sau trim, ghi chú ≤ 1000, BR-MEM-03/04 ngày tồn tại, 1900→nay, không sau hôm nay theo `Asia/Ho_Chi_Minh`, nhuận có thật) — dùng chung browser + action | **chưa tạo** |
| Logic | `src/lib/utils/lunar.ts` | `solarToLunar` (có cờ nhuận), `lunarToSolar` (tháng thường, ngày 30 → 29); **thêm** `lunarToSolarExact(day, month, year, leap)` trả `null` khi ngày không tồn tại | có — thiếu hàm exact có nhuận |
| Format | `src/lib/utils/memorial-format.ts` | Nhãn ngày mất, ngày còn lại, lần giỗ, quan hệ, tóm tắt nhắc | có — cần: năm + dấu nhuận trong `deathDateLabel`; `remindLabel` bỏ phần `sync` |
| Content | `src/lib/content/memorial.ts` | `RELATIONS`, nhãn quan hệ, tên tháng âm | có — `REMIND_LEADS`/`REMIND_TIMES` không dùng trên web tới khi làm BR-MEM-11 |
| Types | `src/lib/types/memorial.ts` | View model `MemorialEntry` (thêm `leap`, `hasReminder`/`reminder` chỉ đọc; `id` số); DTO `Memorial`, `MemorialRequest` theo contract | có — cần sửa |
| API resource | `src/lib/server/api/memorials.ts` | `listMemorials`, `getMemorial`, `createMemorial`, `updateMemorial`, `deleteMemorial` qua `apiCall`, nhận `event.fetch` + token | **chưa tạo** |
| Mapper | `src/lib/server/api/memorials.ts` (hoặc `utils/memorial-map.ts`) | DTO ↔ view model: enum quan hệ; `death_date` dương → âm (+năm âm, nhuận) cho mục âm; form → request (biết năm âm → `lunarToSolarExact`) | **chưa tạo** |
| Session | `src/lib/server/auth/session.ts`, `src/hooks.server.ts` | Token cookie, refresh (feature login) | có — dùng lại |
| Flash | `src/lib/server/memorial-flash.ts` | Cookie `il_mem_flash` (httpOnly, path `/`, maxAge 60, `{kind, name?}`), đọc-rồi-xoá trong `load` | **chưa tạo** |
| Profile | `src/lib/content/profile.ts`, `ProfileLinks.svelte` | Dòng "Sổ giỗ chạp" đang đếm từ store `localStorage` | có — cần lấy số từ BE hoặc bỏ số khi gỡ store |
| i18n | `messages/vi.json`, `messages/en.json` | `mem_*` (83 key mỗi file) | có — thêm/bỏ key ở bảng dưới |
| Tests | `src/lib/utils/*.spec.ts`, `tests/memorial.e2e.ts` | Vector + logic + E2E | **chưa có** (repo chưa cài Vitest/Playwright) |

## Route & navigation flow

```
/profile ──"Sổ giỗ chạp"──▶ /memorial            (khách: GuestPrompt → /login)
/memorial
  ├─ "Thêm người thân" ──▶ /memorial/new
  │     └─ submit ✓ ──▶ POST ──▶ flash "saved" ──▶ 303 /memorial
  └─ chọn một mục ──▶ /memorial/[id]
        ├─ ?/save ✓ ──▶ GET + PUT ──▶ flash "saved" ──▶ 303 /memorial
        ├─ ?/save 404 ──▶ flash "gone" ──▶ 303 /memorial
        ├─ "Hủy" ──▶ /memorial (không gọi BE)
        └─ "Xóa" ──▶ xác nhận ──▶ ?/delete ──▶ DELETE ──▶ flash "deleted"/"gone" ──▶ 303 /memorial
```

Mọi `href`/redirect dùng `localizeHref`.

## Step-by-step Flow — Mở sổ

```
Step A-1 — Làm mới phiên (login feature, out of scope)
- Trigger: request tới server khi thiếu `il_token` và còn `il_refresh`
- Where: `src/hooks.server.ts` `handleAuth` — xem `../login/design.md` Step 2

Step A-2 — Đọc sổ (this feature)
- Trigger: mở `/memorial`
- Pre-condition: `locals.user` khác null (không thì trả `{ entries: null }`, page hiện GuestPrompt, không gọi BE)
- Where: `src/routes/(site)/memorial/+page.server.ts` `load`
- API: GET /v1/memorials (Bearer il_token)
    - Success → map DTO → `MemorialEntry[]` (mục âm có năm: `solarToLunar(death_date)` lấy ngày/tháng/năm âm + nhuận); đọc + xoá cookie flash; trả `{ entries, flash }`
    - Failure (401) → `endSession`, 303 `/login`
    - Failure (mạng / 5xx) → trả `{ entries: null, loadError: true }` → `mem_err_load` + `mem_retry`

Step A-3 — Tính kỳ giỗ (browser)
- Trigger: `MemorialBook` mount
- Pre-condition: có `entries`
- Where: `$derived` trong `MemorialBook.svelte`, `today` lấy trong `onMount` (SSR không có `today` → không render số ngày)
- Logic: `nextAnniversary(entry, today)` cho từng mục, sắp theo `days`
```

## Step-by-step Flow — Thêm người thân

```
Step B-1 — Kiểm ở browser (this feature)
- Trigger: bấm `mem_save_new`
- Where: `MemorialForm.svelte` (`use:enhance` submit callback)
- Logic: `validateMemorialForm` → có lỗi thì `cancel()`, hiện lỗi theo ô, không gửi

Step B-2 — Kiểm lại và dựng request (server)
- Trigger: POST tới `memorial/new/+page.server.ts` action `default`
- Pre-condition: có `il_token` (không có → 303 `/login`)
- Logic: `validateMemorialForm` (giống B-1) → lỗi thì `fail(400, { values, errors })`;
  biết năm + âm lịch → `lunarToSolarExact(day, month, year, leap)` → `death_date`; null → `fail` `mem_f_date_not_exist`;
  biết năm + dương → `death_date`; không rõ năm → `death_day`/`death_month`/`death_leap_month`;
  `note` rỗng → `null`; `relationship` map sang enum contract

Step B-3 — Tạo (this feature)
- API: POST /v1/memorials (full_name, relationship, death_calendar, death_date | death_day+death_month+death_leap_month, note,
  reminder {days_before: 1, time: "07:00", timezone: tz từ field ẩn nếu là IANA hợp lệ}, add_to_os_reminder: false)
  ⚠️ Not confirmed (product): reminder mặc định / add_to_os_reminder cho mục tạo trên website — xem requirements AC 16.
    - Success (201) → set cookie flash `{kind: "saved"}`, 303 `/memorial` (→ Step A-2)
    - Failure (409 MEMORIAL_LIMIT_REACHED) → fail(409, { values, error }) → `mem_err_full`
    - Failure (400 VALIDATION_ERROR) → fail(400) với lỗi theo `details.field` (bảng Error → UI)
    - Failure (401) → `endSession`, 303 `/login`
    - Failure (mạng / 5xx / 413) → fail(502, { values }) → `mem_err_save`
```

## Step-by-step Flow — Sửa người thân

```
Step C-1 — Đọc mục (this feature)
- Trigger: mở `/memorial/[id]`
- Pre-condition: có phiên
- Where: `memorial/[id]/+page.server.ts` `load`
- API: GET /v1/memorials/{id}
    - Success → map → `{ entry }` điền form
    - Failure (404) → `{ entry: null }` → `mem_not_found` + `mem_back`
    - Failure (401) → `endSession`, 303 `/login`; (mạng / 5xx) → `loadError`

Step C-2 — Kiểm (browser + server) — như B-1, B-2 (action `save`)

Step C-3 — Đọc lại cấu hình nhắc (this feature)
- Where: action `save`
- API: GET /v1/memorials/{id}
    - Success → giữ `reminder`, `add_to_os_reminder` nguyên giá trị
    - Failure (404) → cookie flash `{kind: "gone"}`, 303 `/memorial`
    - Failure (khác) → như B-3

Step C-4 — Thay mục (this feature)
- API: PUT /v1/memorials/{id} (nội dung form + reminder + add_to_os_reminder từ C-3; không có ảnh)
    - Success (200) → cookie flash `{kind: "saved"}`, 303 `/memorial`
    - Failure (404) → cookie flash `{kind: "gone"}`, 303 `/memorial`
    - Failure (400 / 401 / mạng / 5xx) → như B-3
```

## Step-by-step Flow — Xoá người thân

```
Step D-1 — Xác nhận (browser)
- Trigger: bấm `mem_delete`
- Where: `MemorialForm.svelte` mở `<dialog>`; không JS → link `?confirm=delete` render khối xác nhận
    - Huỷ → đóng, không gọi gì
    - Xác nhận → submit form POST `?/delete`

Step D-2 — Xoá (this feature)
- Where: `memorial/[id]/+page.server.ts` action `delete`
- API: DELETE /v1/memorials/{id}
    - Success (200) → cookie flash `{kind: "deleted", name}` (tên lấy từ field ẩn, chỉ để hiển thị), 303 `/memorial`
    - Failure (404) → cookie flash `{kind: "gone"}`, 303 `/memorial`
    - Failure (401) → `endSession`, 303 `/login`
    - Failure (mạng / 5xx) → fail(502) → `mem_err_delete`, ở lại
```

## Session & cookies

- Dùng lại `il_token` / `il_refresh` / `il_name` của feature login (`src/lib/server/auth/session.ts`); không thêm cookie phiên.
- Cookie mới `il_mem_flash`: httpOnly, `sameSite=lax`, `secure` ở prod, path `/`, `maxAge` 60; JSON `{kind: "saved" | "deleted" | "gone", name?}`; `load` của `/memorial` đọc rồi xoá ngay. Không dùng query string vì có tên người thân (NFR-MEM-02).
- 401 sau khi hook đã refresh → `endSession` + 303 `/login` (cơ chế refresh-một-lần-rồi-thử-lại chung đang là task của `../login/tasks.md` Phase 2).

## i18n keys

Giữ: các key `mem_*` đang dùng cho sổ, form, preview, quan hệ, nhãn ngày/lần giỗ, `mem_remind_off|before|on_day` (tóm tắt nhắc chỉ đọc).

Thêm (cả `vi.json` và `en.json`; chữ do `il-ui` viết theo nghĩa của product):

| Key | Dùng cho |
| --- | --- |
| `mem_f_leap` | Lựa chọn tháng nhuận (chỉ âm lịch) |
| `mem_date_lunar_leap`, `mem_date_with_year` (hoặc tham số năm) | Ngày mất kèm dấu nhuận / năm (AC 6) |
| `mem_f_date_invalid` | Ngày mất không hợp lệ (BR-MEM-03) |
| `mem_f_date_not_exist` | Tháng nhuận không có trong năm đó (BR-MEM-04) |
| `mem_f_name_too_long`, `mem_f_note_too_long` | Giới hạn 100 / 1000 ký tự |
| `mem_err_load`, `mem_retry` | Không đọc được sổ |
| `mem_err_save`, `mem_err_delete` | Không lưu / xoá được |
| `mem_err_full` | Sổ đã đủ 100 mục |
| `mem_flash_gone` | Mục không còn tồn tại |
| `mem_confirm_delete_title`, `mem_confirm_delete_desc`, `mem_confirm_delete_ok`, `mem_confirm_delete_cancel` | Hộp xác nhận xoá |

Bỏ trên website (không còn chỗ dùng sau khi ẩn nhắc — §3.6, FR-MEM-009): `mem_flash_saved_reminder`, `mem_remind_in_calendar`, `mem_sync_title`, `mem_sync_desc`. Các key form nhắc (`mem_f_reminder`, `mem_remind_title|desc|when|time`) có thể giữ cho khi website làm BR-MEM-11.

## Deliberately stubbed for now

- **Toàn bộ lưu trữ** đang là `localStorage` (`state/memorial.svelte.ts`) — thay bằng Step A–D ở `tasks.md` Phase 3. Dữ liệu cũ không migrate; xoá key `il-memorial` một lần khi gỡ store.
- **Body `POST`** (reminder mặc định, `add_to_os_reminder`) chờ ⚠️ ở requirements AC 16; thiết kế tạm như Step B-3.
- **Lối vào từ trang chủ** chờ ⚠️ ở requirements AC 3.
- Code nằm ở `components/sections`, `state`, `utils` thay vì `src/lib/features/memorial/` (AGENTS.md §5); chuyển chỗ là tuỳ chọn, ghi ở `tasks.md` Deferred.
