# Design — memorial (Sổ giỗ chạp)

Version: 2.0
Last updated: 2026-10-14
Status: in-progress (drift) — mirror `requirements.md`

> See `changelog.md` in this folder for the version history of this spec.

## Overview

Ba route trong group `(site)`: `/memorial` (sổ), `/memorial/new` (thêm), `/memorial/[id]` (sửa/xoá). **Hiện tại** dữ liệu nằm trong `localStorage` qua `state/memorial.svelte.ts` và form lưu bằng JS phía browser — một ngoại lệ tạm so với AGENTS.md. **Thiết kế đích** theo data path của repo: đọc trong `load` của `+page.server.ts`, ghi bằng form action (`<form method="POST" use:enhance>`), cả hai gọi `$lib/server/api/memorials.ts` → backend `/v1/memorials` với Bearer từ cookie `il_token` (hook `handleAuth` của feature login lo refresh). Kỳ giỗ, số ngày còn lại, lần giỗ và preview được tính **trong browser** bằng `utils/memorial.ts` + `utils/lunar.ts` (BR-MEM-08: ngày của máy); việc quy đổi âm → dương trước khi gửi chạy trên server (cùng hàm thuần). Cấu hình nhắc là một phần của form và đi cùng `POST`/`PUT` (FR-MEM-007); backend lên lịch và gửi nhắc (ADR-0002), website chỉ **báo múi giờ** của trình duyệt (Step E) và **hiển thị** lời nhắc trong danh sách thông báo — feature `notifications` riêng (ADR-0001). Gần nhất để làm mẫu: `login` (action + `authFail`) và `profile` (`load` có token).

## Layers & components

| Layer | File | Responsibility | Trạng thái |
| --- | --- | --- | --- |
| Route (UI) | `src/routes/(site)/memorial/+page.svelte` | Meta, `GuestPrompt` cho khách, `MemorialBook` nhận `data` | có — cần nhận `data.entries` thay vì store |
| Route (server) | `src/routes/(site)/memorial/+page.server.ts` | `load`: khách → không gọi BE; có phiên → `listMemorials`, map sang view model; đọc + xoá cookie flash; lỗi → `loadError` | **chưa tạo** |
| Route (UI) | `src/routes/(site)/memorial/new/+page.svelte` | Meta, `GuestPrompt`, `MemorialForm` (mode thêm) | có |
| Route (server) | `src/routes/(site)/memorial/new/+page.server.ts` | Action `default`: validate (`validateMemorialForm`), build request, `createMemorial`, flash, 303 | **chưa tạo** |
| Route (UI) | `src/routes/(site)/memorial/[id]/+page.svelte` | Meta, `GuestPrompt`, `MemorialForm` (mode sửa) hoặc not-found | có — cần nhận `data.entry` |
| Route (server) | `src/routes/(site)/memorial/[id]/+page.server.ts` | `load`: `getMemorial`; actions `save` (`updateMemorial`) và `delete` (`deleteMemorial`) | **chưa tạo** |
| Section UI | `src/lib/components/sections/MemorialBook.svelte` | Đếm, thẻ nổi bật, danh sách sắp theo kỳ giỗ, trạng thái rỗng (không có "Lấy từ gia phả"), flash, dấu "Có nhắc" | có — cần: dữ liệu từ `data`, tính kỳ giỗ chỉ sau mount, ngày mất kèm năm/nhuận, bỏ "có trong lịch nhắc" và flash `saved_reminder`, trạng thái `loadError` |
| Section UI | `src/lib/components/sections/MemorialForm.svelte` | Form tên, quan hệ, ghi chú, lịch/ngày/tháng/năm/nhuận, preview, khối nhắc (bật/tắt, lead 0/1/3/7, giờ 06/07/12/19), lưu/huỷ/xoá | có — khối nhắc đã có đúng lựa chọn và mặc định; cần: **bỏ công tắc `sync`**, chuyển sang form POST + `use:enhance`, chọn nhuận, năm 1900→nay, ngày theo tháng, lỗi theo field, hộp xác nhận xoá, lựa chọn gần nhất cho giá trị cũ |
| UI primitive | `src/lib/components/ui/ConfirmDialog.svelte` (hoặc `<dialog>` trong form) | Hộp xác nhận xoá (BR-MEM-12), fallback không JS bằng `?confirm=delete` | **chưa tạo** |
| State | `src/lib/state/memorial.svelte.ts` | Hiện: store `localStorage` (`il-memorial`) + flash | có — **gỡ** khi chuyển sang BE; flash chuyển sang cookie |
| Logic | `src/lib/utils/memorial.ts` (`nextAnniversary`) | BR-MEM-05…09 từ `{calendar, day, month, year}` + `today` | có — không cần đổi thuật toán; nhận `today` từ browser |
| Logic | `src/lib/utils/memorial-validate.ts` | `validateMemorialForm` (tên 1–100 sau trim, ghi chú ≤ 1000, ngày tồn tại, 1900→nay, không sau hôm nay theo `Asia/Ho_Chi_Minh`, nhuận có thật, lead/giờ thuộc lựa chọn BR-MEM-11) — mỗi lỗi một mã, dùng chung browser + action | **chưa tạo** |
| Logic | `src/lib/utils/memorial-reminder.ts` | `nearestReminderChoice({days_before, time})` → lựa chọn của `REMIND_LEADS`/`REMIND_TIMES` (FR-MEM-007); `null` → nhắc tắt | **chưa tạo** — luật hoà chờ ⚠️ requirements AC 17 |
| Logic | `src/lib/utils/lunar.ts` | `solarToLunar` (có cờ nhuận), `lunarToSolar` (tháng thường, ngày 30 → 29); **thêm** `lunarToSolarExact(day, month, year, leap)` trả `null` khi ngày không tồn tại | có — thiếu hàm exact có nhuận |
| Logic | `src/lib/utils/timezone.ts` | `browserTimeZone()` (`Intl.DateTimeFormat().resolvedOptions().timeZone`) và `isIanaTimeZone(tz)` (dùng chung browser + server) | **chưa tạo** |
| Format | `src/lib/utils/memorial-format.ts` | Nhãn ngày mất, ngày còn lại, lần giỗ, quan hệ, tóm tắt nhắc | có — cần: năm + dấu nhuận trong `deathDateLabel`; `remindLabel` bỏ phần `sync` |
| Content | `src/lib/content/memorial.ts` | `RELATIONS`, nhãn quan hệ, `REMIND_LEADS` [0,1,3,7], `REMIND_TIMES` [06:00, 07:00, 12:00, 19:00], tên tháng âm | có — đúng BR-MEM-11, không đổi |
| Types | `src/lib/types/memorial.ts` | View model `MemorialEntry` (`id` số, `leap`, `reminder: {lead, time} \| null`, bỏ `sync`); DTO `Memorial`, `MemorialRequest` theo contract | có — cần sửa |
| API resource | `src/lib/server/api/memorials.ts` | `listMemorials`, `getMemorial`, `createMemorial`, `updateMemorial`, `deleteMemorial` qua `apiCall`, nhận `event.fetch` + token | **chưa tạo** |
| Mapper | `src/lib/server/api/memorials.ts` (hoặc `utils/memorial-map.ts`) | DTO ↔ view model: enum quan hệ; `death_date` dương → âm (+năm âm, nhuận) cho mục âm; `reminder` → `nearestReminderChoice`; form → request (biết năm âm → `lunarToSolarExact`; `reminder` chỉ `days_before` + `time`) | **chưa tạo** |
| API resource | `src/lib/server/api/users.ts` | **thêm** `reportAccountTimeZone(fetch, token, tz)` | ⚠️ chờ contract (requirements AC 26) |
| Route (server) | `src/routes/api/account-timezone/+server.ts` | `POST {tz}`: cần phiên, kiểm `isIanaTimeZone`, gọi `reportAccountTimeZone`, set cookie `il_tz_reported`; trả 204 / lỗi không thân | **chưa tạo**, chờ contract |
| Layout (UI) | `src/routes/(site)/+layout.svelte` (+ `+layout.server.ts` trả `reportedTz`) | `onMount`: có phiên và `browserTimeZone()` ≠ `data.reportedTz` → `fetch('/api/account-timezone')` (Step E-1) | có — cần thêm |
| Session | `src/lib/server/auth/session.ts`, `src/hooks.server.ts` | Token cookie, refresh (feature login); `endSession` xoá thêm `il_tz_reported` | có — cần thêm cookie vào danh sách xoá |
| Flash | `src/lib/server/memorial-flash.ts` | Cookie `il_mem_flash` (httpOnly, path `/`, maxAge 60, `{kind, name?}`), đọc-rồi-xoá trong `load` | **chưa tạo** |
| Profile | `src/lib/content/profile.ts`, `ProfileLinks.svelte` | Dòng "Sổ giỗ chạp" — lối vào duy nhất của website (§3.6) — đang đếm từ store `localStorage` | có — cần lấy số từ BE hoặc bỏ số khi gỡ store |
| Notifications (feature khác) | `src/routes/(site)/notifications/`, `NotificationList.svelte`, `content/notifications.ts`, `state/notifications.svelte.ts` | Danh sách thông báo; lời nhắc giỗ link tới `/memorial/[id]` | có (dữ liệu mẫu, đọc/chưa đọc trong `localStorage`) — **không** thuộc spec này; cần spec `notifications` riêng |
| i18n | `messages/vi.json`, `messages/en.json` | `mem_*` | có — thêm/sửa/bỏ key ở bảng dưới |
| Tests | `src/lib/utils/*.spec.ts`, `tests/memorial.e2e.ts` | Vector + logic + E2E | **chưa có** (repo chưa cài Vitest/Playwright) |

## Route & navigation flow

```
/profile ──"Sổ giỗ chạp"──▶ /memorial            (khách: GuestPrompt → /login)
/notifications ──lời nhắc giỗ──▶ /memorial/[id]   (feature notifications; mục đã xoá → mem_not_found)
/memorial
  ├─ "Thêm người thân" ──▶ /memorial/new
  │     └─ submit ✓ ──▶ POST ──▶ flash "saved" ──▶ 303 /memorial
  └─ chọn một mục ──▶ /memorial/[id]
        ├─ ?/save ✓ ──▶ PUT ──▶ flash "saved" ──▶ 303 /memorial
        ├─ ?/save 404 ──▶ flash "gone" ──▶ 303 /memorial
        ├─ "Hủy" ──▶ /memorial (không gọi BE)
        └─ "Xóa" ──▶ xác nhận ──▶ ?/delete ──▶ DELETE ──▶ flash "deleted"/"gone" ──▶ 303 /memorial
mọi trang (có phiên) ──onMount, tz đổi──▶ POST /api/account-timezone   (Step E, nền, không UI)
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
    - Success → map DTO → `MemorialEntry[]` (mục âm có năm: `solarToLunar(death_date)` lấy ngày/tháng/năm âm + nhuận;
      `reminder` → `nearestReminderChoice`); đọc + xoá cookie flash; trả `{ entries, flash }`
    - Failure (401) → `endSession`, 303 `/login`
    - Failure (mạng / 5xx) → trả `{ entries: null, loadError: true }` → `mem_err_load` + `mem_retry` (không có bản offline)

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
- Logic: `validateMemorialForm` (giống B-1, gồm lead/giờ thuộc lựa chọn) → lỗi thì `fail(400, { values, errors })`;
  biết năm + âm lịch → `lunarToSolarExact(day, month, year, leap)` → `death_date`; null → `fail` `mem_f_date_not_exist`;
  biết năm + dương → `death_date`; không rõ năm → `death_day`/`death_month`/`death_leap_month`;
  `note` rỗng → `null`; `relationship` map sang enum contract;
  nhắc tắt → `reminder: null`; bật → `reminder {days_before, time}` từ form

Step B-3 — Tạo (this feature)
- API: POST /v1/memorials (full_name, relationship, death_calendar, death_date | death_day+death_month+death_leap_month, note, reminder)
    - Success (201) → set cookie flash `{kind: "saved"}`, 303 `/memorial` (→ Step A-2)
    - Failure (409 MEMORIAL_LIMIT_REACHED) → fail(409, { values, error }) → `mem_err_full`
    - Failure (400 VALIDATION_ERROR) → fail(400) với lỗi theo `details.field` (bảng Error → UI)
    - Failure (401) → `endSession`, 303 `/login`
    - Failure (mạng / 5xx / 413) → fail(502, { values }) → `mem_err_save`
```

## Step-by-step Flow — Sửa người thân

```
Step C-1 — Đọc mục (this feature)
- Trigger: mở `/memorial/[id]` (từ sổ hoặc từ một lời nhắc trong `/notifications`)
- Pre-condition: có phiên
- Where: `memorial/[id]/+page.server.ts` `load`
- API: GET /v1/memorials/{id}
    - Success → map (gồm `nearestReminderChoice`) → `{ entry }` điền form
    - Failure (404) → `{ entry: null }` → `mem_not_found` + `mem_back`
    - Failure (401) → `endSession`, 303 `/login`; (mạng / 5xx) → `loadError`

Step C-2 — Kiểm (browser + server) — như B-1, B-2 (action `save`)

Step C-3 — Thay mục (this feature)
- API: PUT /v1/memorials/{id} (nội dung form, gồm reminder đang hiển thị; không có ảnh)
    - Success (200) → cookie flash `{kind: "saved"}`, 303 `/memorial`
    - Failure (404) → cookie flash `{kind: "gone"}`, 303 `/memorial` (sổ đọc lại không còn mục đó)
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

## Step-by-step Flow — Báo múi giờ tài khoản

```
Step E-1 — Phát hiện múi giờ (browser, this feature)
- Trigger: `onMount` của `src/routes/(site)/+layout.svelte` (mỗi lần tải trang đầy đủ)
- Pre-condition: `data.user` khác null; `isIanaTimeZone(browserTimeZone())`; giá trị đó ≠ `data.reportedTz`
  (từ cookie `il_tz_reported`, trả qua `+layout.server.ts`) — không thoả thì dừng, không gọi gì
- Logic: `fetch(localizeHref('/api/account-timezone'), { method: 'POST', body: { tz } })`, không chờ, không UI

Step E-2 — Ghi múi giờ (server, this feature)
- Where: `src/routes/api/account-timezone/+server.ts` `POST`
- Pre-condition: có `il_token` (không có → 401, không gọi BE); `isIanaTimeZone(tz)` (không → 400, không gọi BE)
- API: ⚠️ Not confirmed (contract) — thao tác ghi múi giờ tài khoản chưa có trong openapi.yaml @ bf23f8b
  (product Appendix B mục 3); `reportAccountTimeZone` stub tới khi có
    - Success → set cookie `il_tz_reported = tz`, 204
    - Failure (401 sau refresh) → `endSession`, 401
    - Failure (400 / mạng / 5xx) → không set cookie, 502 — lần tải trang sau thử lại (Step E-1)
```

## Session & cookies

- Dùng lại `il_token` / `il_refresh` / `il_name` của feature login (`src/lib/server/auth/session.ts`); không thêm cookie phiên.
- Cookie `il_mem_flash`: httpOnly, `sameSite=lax`, `secure` ở prod, path `/`, `maxAge` 60; JSON `{kind: "saved" | "deleted" | "gone", name?}`; `load` của `/memorial` đọc rồi xoá ngay. Không dùng query string vì có tên người thân (NFR-MEM-02).
- Cookie `il_tz_reported`: httpOnly, `sameSite=lax`, `secure` ở prod, path `/`, cùng `maxAge` với `il_refresh`; giá trị là tên IANA đã báo thành công từ trình duyệt này. `endSession` xoá nó để tài khoản kế tiếp trên cùng trình duyệt báo lại.
- 401 sau khi hook đã refresh → `endSession` + 303 `/login` (cơ chế refresh-một-lần-rồi-thử-lại chung đang là task của `../login/tasks.md` Phase 2).

## i18n keys

Chữ tiếng Việt của các key có cột "§3.1.1" lấy theo đúng dòng đó của product spec (chỉ chỉnh dấu câu/xuống dòng); bản `en` theo phần giải nghĩa tiếng Anh của dòng đó. Không chép chữ vào spec này.

| Key | Dùng cho | Product §3.1.1 | Việc |
| --- | --- | --- | --- |
| `mem_flash_saved` | Lưu xong | Saved | giữ (đã khớp) |
| `mem_flash_deleted` | Xoá xong (có `{name}`) | Deleted | giữ (đã khớp) |
| `mem_confirm_delete_title`, `mem_confirm_delete_desc`, `mem_confirm_delete_ok`, `mem_confirm_delete_cancel` | Hộp xác nhận xoá (title có `{name}`) | Confirm delete | thêm |
| `mem_err_full` | Sổ đã đủ 100 mục | Book is full | thêm |
| `mem_f_name_err` | Tên rỗng | Name empty | giữ (đã khớp) |
| `mem_f_name_too_long` | Tên > 100 | Name too long | thêm |
| `mem_f_note_too_long` | Ghi chú > 1000 | Note too long | thêm |
| `mem_f_date_invalid` | Ngày không có trong lịch | Date does not exist | thêm |
| `mem_f_date_not_exist` | Năm không có tháng nhuận đó (`{year}`, `{month}`) | Leap month not in that year | thêm |
| `mem_f_year_min` | Năm trước 1900 | Year before 1900 | thêm |
| `mem_f_date_future` | Ngày mất sau hôm nay | Date after today | thêm |
| `mem_err_save` | Không lưu được | Could not save | thêm |
| `mem_err_load`, `mem_retry` | Không đọc được sổ (website không có bản offline) | Cannot load, no offline copy | thêm |
| `mem_flash_gone` | Mục đã bị xoá nơi khác (sau lưu/xoá) | Entry no longer exists | thêm |
| `mem_not_found` | Mở một mục không còn / không phải của mình | Entry no longer exists | sửa chữ theo dòng này |
| `mem_f_leap`, `mem_date_lunar_leap` | Lựa chọn nhuận; ngày mất có dấu nhuận | Leap-month choice | thêm |
| `mem_date_with_year` (hoặc tham số năm) | Ngày mất kèm năm (AC 6) | — | thêm |
| `mem_err_delete` | Không xoá được | — (⚠️ requirements AC 22) | thêm, chữ chờ product |
| `mem_notif_today`, `mem_notif_tomorrow`, `mem_notif_in_days`, `mem_notif_detail`, `mem_rel_lc_*` (quan hệ chữ thường, "khác" → "người thân") | Lời nhắc giỗ trong danh sách thông báo — **chỉ khi** contract để website tự dựng chữ | Push / notification …; Notification list detail | ⚠️ chờ contract (requirements AC 27); nếu thêm thì đặt ở feature `notifications` hoặc dùng chung |
| `mem_remind_off`, `mem_remind_before`, `mem_remind_on_day`, `mem_f_reminder`, `mem_remind_title`, `mem_remind_desc`, `mem_remind_when`, `mem_remind_time`, `mem_has_reminder` | Khối nhắc trong form, tóm tắt nhắc, dấu "Có nhắc" | — | giữ |
| `mem_pt_2_*` | Thẻ giới thiệu "nhắc trước" | — | giữ (product Appendix A, client question 4) |
| `mem_flash_saved_reminder`, `mem_remind_in_calendar`, `mem_sync_title`, `mem_sync_desc` | Ứng dụng nhắc của máy (FR-MEM-009 đã bỏ) | — | **bỏ** khỏi cả hai file |

Không dùng trên website (chỉ app): "Connection needed to change", "Showing the offline copy" (FR-MEM-010), "Notifications not allowed on the device" (push).

## Deliberately stubbed for now

- **Toàn bộ lưu trữ** đang là `localStorage` (`state/memorial.svelte.ts`) — thay bằng Step A–D ở `tasks.md` Phase 3. Dữ liệu cũ không migrate; xoá key `il-memorial` một lần khi gỡ store.
- **Step E-2** (báo múi giờ) — `reportAccountTimeZone` là stub tới khi contract có thao tác (⚠️ requirements AC 26). Step E-1 có thể làm trước nhưng chỉ bật khi E-2 có thật, để không set `il_tz_reported` khi chưa báo được.
- **Lời nhắc trong danh sách thông báo** — `/notifications` còn dữ liệu mẫu; nối backend thuộc feature `notifications` (⚠️ requirements AC 27).
- **`nearestReminderChoice`** — luật hoà chờ ⚠️ requirements AC 17.
- Code nằm ở `components/sections`, `state`, `utils` thay vì `src/lib/features/memorial/` (AGENTS.md §5); chuyển chỗ là tuỳ chọn, ghi ở `tasks.md` Deferred.
