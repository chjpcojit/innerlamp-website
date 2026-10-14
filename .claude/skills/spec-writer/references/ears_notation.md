# EARS notation for requirements.md

Every acceptance criterion names a trigger and a mandatory system response:

```
WHEN <trigger>, THE SYSTEM SHALL <behavior>. (<product ID>)
```

Forms used here (see `Docs/specs/features/login/requirements.md`):

- `WHEN <event>, THE SYSTEM SHALL <behavior>.`
- `WHEN <event>, THE SYSTEM SHALL <behavior>, rồi:` with `- on success: …` / `- on failure: …`
  branches, for submit-and-wait flows.
- `WHEN <state holds>, THE SYSTEM SHALL …` for conditions ("WHEN không có cookie `il_token` nhưng có
  `il_refresh`").

## Examples

Bad: "Form đăng nhập xử lý lỗi."

Good:

> WHEN người dùng bấm "Đăng nhập" với dữ liệu hợp lệ, THE SYSTEM SHALL gọi `POST /v1/auth/login` từ
> server, rồi:
>
> - on success: set cookie phiên, redirect `localizeHref('/')`;
> - on failure: ở lại `/login`, hiển thị chuỗi theo bảng Error → UI, giữ số điện thoại. (FR-AUTH-002)

## Rules

1. **One criterion = one trigger**; outcomes are branches of it.
2. **Always "THE SYSTEM SHALL"** — a testable obligation, not a description.
3. **Tag every criterion** with the product ID it implements — `(FR-MEM-002)`, `(BR-MEM-04)` — or
   `(platform)` for website-only behavior (cookies, redirects, SEO, i18n). See
   `upstream_product_spec.md`.
4. **Don't restate the rule** — "THE SYSTEM SHALL tính ngày giỗ kế tiếp theo BR-MEM-03", not the
   rule's content.
5. **Name hidden steps** (server re-validation, cookie write, redirect) here; the _how_ goes in
   `design.md`'s Step-by-step Flow.
6. **Strings are keys** — refer to copy by Paraglide key or quote the vi text with its key; never
   imply hardcoded text.
7. Out of scope / Pending / Open questions are plain prose, not EARS.
