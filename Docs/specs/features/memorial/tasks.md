# Tasks — memorial (Sổ giỗ chạp) — website

Version: 3.5
Last updated: 2026-11-19
Status: P4 code done — 56/56 `[x]` đã kiểm code + test; ảnh đã bật và smoke dev 2026-11-19; 2 mở: G1 chưa ký, Playwright chưa cài.

> See `changelog.md`. `[x]` chỉ khi đã kiểm trong code **và** gate thật đã chạy; code xong + gate
> xanh thì tick ngay, không để nợ. Task gắn
> `[ui-first]` (UI + mock/không API) hoặc `[integration]` (nối BE) theo quy tắc v1.5.

## Phase 0 — P2 (spec, trước code)

- [x] `docs/spec.config.yaml` đúng mẫu §0.1 (verify A/B/C/E + security + pre_push, sensitive_paths)
- [x] Pin contract: `docs/specs/features/memorial/client-contract.md` (2026-11-16, OpenAPI 3.1.0 `e5d4c9c`)
- [x] `requirements.md` v3.0 — AC cũ giữ số + AC mới `MEM-API-*`, `MEM-IMG-*`, `MEM-WEB-*`
- [x] `design.md` v3.0 — layers, model, mapping, cờ ảnh, i18n
- [x] `flow.md` — F1…F7
- [x] `tasks.md` v3.0 (file này)
- [x] 5 tech-debt `TD-MEM-CLIENT-01…05` trong `Docs/Tech-Debt/Memorial/`
- [x] Vector pin `tests/vectors/memorial/*.json` + `SOURCE.json` (e5d4c9c)
- [ ] G1: BA + Security ký `impact.md` (ngoài repo này — Chưởng Môn/Đạo Sư) `[DEFERRED]` **cả hai chưa ký** — `reviewed_by` trống ở cả ba repo, thiếu Thiên Cơ (BA) và Hộ Pháp (Security) (impact.md:8,36)

## Phase 1 — W1 DTO / view model / mapper `[integration]`

- [x] `src/lib/types/memorial.ts`: DTO `Memorial`/`MemorialRequest` (snake_case), view model
      `MemorialEntry` (`id: number`, `leap`, `reminder`, `photoUrl`, bỏ `remind/lead/time/sync`)
- [x] `src/lib/server/api/memorial-map.ts`: enum 2 chiều 10 giá trị; DTO → VM (ngày âm + nhuận,
      `nearestReminderChoice`); VM/form → request (một dạng ngày, `note` null, `reminder` tối thiểu)

## Phase 2 — W2 API resource + FormData `[integration]`

- [x] `src/lib/server/api/memorials.ts`: `listMemorials`, `getMemorial`, `createMemorial`,
      `updateMemorial`, `deleteMemorial`, `uploadMemorialPhoto`, `deleteMemorialPhoto`
- [x] `client.ts`: nhánh `FormData` — bỏ `Content-Type: application/json`, không `JSON.stringify`;
      call JSON cũ giữ nguyên
- [x] `client.spec.ts`: chứng minh JSON vẫn `application/json`; FormData không có header JSON

## Phase 3 — W5 validate / nearest / lunar `[ui-first]`

- [x] `utils/memorial-validate.ts`: tên 1–100, ghi chú ≤ 1000, ngày tồn tại, 1900→nay, không sau
      hôm nay theo `Asia/Ho_Chi_Minh`, nhuận có thật, lead/giờ thuộc lựa chọn — mỗi lỗi một mã
- [x] `utils/memorial-reminder.ts`: `nearestReminderChoice` (hoà → sớm hơn; ngoài biên kẹp)
- [x] `utils/lunar.ts`: **thêm** `lunarToSolarExact(day, month, year, leap)` trả `null` khi không
      tồn tại; **không** đổi `lunarToSolar`/`solarToLunar`
- [x] `utils/memorial.ts`: `nextAnniversary` không nhận `leap` — kỳ giỗ luôn tháng thường, không
      chọn tháng nhuận (BR-MEM-05)

## Phase 4 — W3 server load / actions / flash `[integration]`

- [x] `src/lib/server/memorial-flash.ts`: cookie `il_mem_flash` httpOnly 60 s, chỉ `{kind}` (SEC-04)
- [x] `memorial/+page.server.ts`: khách không gọi BE; list + map + flash; 401 → login; lỗi → `loadError`
- [x] `memorial/new/+page.server.ts`: action `default` validate + POST + map 400/409/413/401/5xx
- [x] `memorial/[id]/+page.server.ts`: `load` GET; actions `save` (PUT), `delete` (DELETE, 404 = xong),
      `photo`/`photoDelete` sau cờ
- [x] `[id]` route param: `Number(params.id)`, id không hợp lệ → not found (không gọi BE)

## Phase 5 — W4 nối UI `[ui-first]`

- [x] `MemorialBook`: nhận `data.entries`, tính kỳ giỗ sau `onMount`, sort hoà theo tên + id, empty
      chỉ khi `total = 0`, `loadError`, flash từ `data`, bỏ `saved_reminder`
- [x] `MemorialForm`: `<form method="POST" use:enhance>`, hidden input cho chip/lịch/nhuận/nhắc,
      năm 1900→nay, ngày theo tháng, lỗi theo field, preview, khối nhắc không `sync`, confirm xoá
- [x] 3 `+page.svelte`: truyền `data`/`form` xuống; guest giữ nguyên
- [x] `deathDateLabel`: năm + dấu nhuận; chữ viết tắt A-6

## Phase 6 — W6 gỡ localStorage + profile `[integration]`

- [x] Xoá `src/lib/state/memorial.svelte.ts`; key `il-memorial` xoá một lần khi app mount (root `+layout.svelte`)
- [x] `content/profile.ts`: bỏ import store + số đếm; `ProfileLinks.svelte` bỏ `memorial.init()`

## Phase 7 — W7 test + vector `[integration]`

- [x] `memorial.spec.ts` chạy `next-anniversary.json` (17 case)
- [x] `lunar-memorial.spec.ts` chạy `death-date-conversion.json` (9 case) + `anniversary-ordinal.json`
- [x] Unit: mapper, validate, nearest, `memorials.ts` (5 route + 400/401/404/409/413/415/5xx), flash
- [x] `npm test` pass

## Phase 8 — W8 ảnh sau cờ `[integration]`

- [x] `memorial-config.ts`: `MEMORIAL_PHOTO_ENABLED` bật mặc định, `false` là kill switch
- [x] `memorials.ts` upload/delete multipart (`photo`)
- [x] `MemorialForm` khối ảnh + `MemorialBook` avatar ảnh, chỉ khi cờ bật
- [x] Unit mock 200/413/415; smoke dev thật 2026-11-19 (upload → GET → proxy → delete); E2E Playwright chưa cài

## Phase 9 — Gate & hand-off

- [x] `make verify` (check + lint + build) pass — dán output thật
- [x] `npm test` pass — dán output thật
- [ ] E2E Playwright: **chưa cài**, P5 cần duyệt (không chặn P4) `[NOT RUN]` chưa cài Playwright (package.json không có)
- [x] Báo Chưởng Môn: file, gate, phần mở; **không commit/push/PR**

## Phase 10 — G1 security (Hộ Pháp, 2026-11-16)

- [x] SEC-01: `Cache-Control: private, no-store` + `Referrer-Policy: no-referrer` cho 3 trang sổ giỗ;
      proxy ảnh cùng origin, signed URL không vào HTML/JS (`memorial-headers.ts`, `[id]/photo/+server.ts`)
- [x] SEC-02: guard trước mọi `apiCall`; `api/memorials.ts` ném 401 trước khi gọi mạng khi thiếu token
      (`memorial-guard.ts`)
- [x] SEC-03: CSP + `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `nosniff` (`security-headers.ts`,
      `hooks.server.ts`)
- [x] SEC-04: flash chỉ `{kind}`, không tên/ngày (`memorial-flash.ts`)
- [x] SEC-05: xoá key `il-memorial` khi mở trang, không ghi PII xuống localStorage (`legacy-storage.ts`, root `+layout.svelte`)
- [x] SEC-06: cờ ảnh bật mặc định, `false` là kill switch (`memorial-config.ts`)
- [x] P6.1: `MemorialBook` chỉ render `<img>` khi `photoEnabled && hasPhoto`; list load trả cờ, edit
      load đã có (`MemorialBook.svelte`, `memorial/+page.server.ts`, `memorial/+page.svelte`)
- [x] P6.2: proxy ảnh **không cache** signed URL — thay/xoá ảnh thấy ngay (`[id]/photo/+server.ts`,
      `memorial-photo.ts`)
- [x] P6.3: lỗi ghi chú trả `note_long`, không còn hiện nhầm lỗi tên (`memorial-action.ts`,
      `memorial-validate.ts`, `types/memorial.ts`)
- [x] Test: security headers, memorial headers, guard, legacy storage, flag, API fail-closed, photo
      flag, no-cache lookup, note mapping (209 test)

## Phase 11 — QA P7 (2026-11-17)

- [x] P7.1: gate `canStartMemorialSubmit` + `submitting` disable nút, chặn POST lần hai
      (`memorial-submit.ts`, `MemorialForm.svelte`)
- [x] P7.2: `total >= 100` ẩn link thêm, nút disabled + `mem_err_full` (`MemorialBook.svelte`)
- [x] P7.3: action 401 giữ form + draft, `mem_err_session` + link đăng nhập
      (`memorial-action.ts`, 2 route action, `MemorialForm.svelte`)
- [x] P7.4: `memorialCountView` dùng `total`, hiện `shown/total` khi lệch; `isMemorialFull(total)`
      (`memorial.ts`, `MemorialBook.svelte`)
- [x] Test: submit gate, 100 limit/count mismatch, 401 values+auth code, SSR header render, form draft/auth message (217 test)

## Phase 12 — Ảnh live dev (2026-11-19)

- [x] Bật `MEMORIAL_PHOTO_ENABLED=true` cho dev; `.env.example` bật mặc định, `false` là kill switch
- [x] Smoke BE dev: tạo mục → `PUT photo` 200 → `GET` có `photo_url` → GCS 200 JPEG; 413/415/404 đúng mã
- [x] Smoke web dev: action `?/photo` 200 → proxy `GET /memorial/{id}/photo` 200 JPEG, HTML không có signed URL; `?/photoDelete` 303 → proxy 404
- [x] Dọn dữ liệu test: xoá ảnh + xoá mục; tài khoản test dev còn lại (không xoá được qua API)

## Deferred

- Chọn ảnh ở form **thêm** (Q-2): giữ luồng hai bước — tạo mục rồi thêm ảnh ở form sửa.

- Nhắc local web / Web Push (D2, `TD-MEM-CLIENT-02`), notification list (Phase 8–10).
- Báo múi giờ tài khoản (contract chưa có operation).
- ETag/chống sửa đồng thời (`TD-MEM-CLIENT-05`).
- E2E ảnh sau khi BE deploy (F1–F4 của `task-breakdown-p4.md`).
