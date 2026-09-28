# InnerLamp

Website cho InnerLamp — xây bằng [SvelteKit](https://svelte.dev/docs/kit) 2 + Svelte 5.

## Công nghệ

- **SvelteKit 2** / **Svelte 5** (runes, TypeScript strict)
- **Tailwind CSS 4** (+ `@tailwindcss/typography`)
- **Paraglide JS 2** (inlang) — đa ngôn ngữ `vi` (mặc định) và `en`
- **Vite 8**, ESLint + Prettier

## Bắt đầu

```sh
npm install
npm run dev        # http://localhost:5173
```

> Lần đầu nên chạy `npm run dev` hoặc `npm run build` trước khi `npm run check`,
> vì thư mục `src/lib/paraglide` được sinh tự động lúc build.

## Scripts

| Lệnh              | Mô tả                             |
| ----------------- | --------------------------------- |
| `npm run dev`     | Chạy dev server (HMR)             |
| `npm run build`   | Build production                  |
| `npm run preview` | Xem thử bản build                 |
| `npm run check`   | Type-check + kiểm tra Svelte/a11y |
| `npm run lint`    | Prettier check + ESLint           |
| `npm run format`  | Tự động format                    |

## Cấu trúc & quy ước

Kiến trúc thư mục, quy ước code, i18n và các recipe nằm trong
[`AGENTS.md`](./AGENTS.md). Đọc file đó trước khi thêm trang, component hay
tính năng mới.

Tóm tắt nhanh:

- `src/routes/` — router theo filesystem. `(site)` là khu công khai, `(app)` để
  dành cho khu vực riêng tư sau này, `api/` cho endpoint JSON.
- `src/lib/` — code dùng chung qua alias `$lib`:
  - `components/{ui,layout,sections}` — UI
  - `features/<tên>/` — module theo tính năng
  - `server/` — code chỉ chạy server (`$lib/server`)
  - `state/`, `utils/`, `config/`, `types/`, `content/`, `styles/`, `assets/`
- `messages/` — chuỗi dịch `vi.json` / `en.json`. **Không hardcode text hiển thị.**
- `static/` — asset phục vụ nguyên trạng.
- `tests/` — test tích hợp/E2E.

## i18n

Thêm chuỗi vào **cả** `messages/vi.json` và `messages/en.json`, rồi dùng:

```svelte
<script lang="ts">
	import { m } from '$lib/paraglide/messages';
</script>

<h1>{m.hello_world({ name: 'InnerLamp' })}</h1>
```

## Triển khai

Hiện dùng `@sveltejs/adapter-auto`. Khi biết nền tảng deploy, cài adapter tương ứng:

```sh
npx sv add sveltekit-adapter="adapter:<node|vercel|netlify|cloudflare|static>"
```

rồi cấu hình lại trong `vite.config.ts`.
