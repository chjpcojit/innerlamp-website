# Tasks — article (Bài viết Phật pháp hay — Dharma articles)

Version: 1.0
Last updated: 2026-10-15
Status: in-progress (drift) — mirror `requirements.md`

> See `changelog.md` in this folder for the version history of this spec.

`[x]` only when checked to exist in the code on 2026-10-15 and to match product v1.0. Each item points
to a row of the Layers & components table or a Step in `design.md`; "AC n" is a criterion in
`requirements.md`.

## Phase 1 — UI (`il-ui`)

- [x] Route `articles/+page.svelte` + `<svelte:head>` (`articles_title`, `articles_meta_description`)
- [x] Route `articles/[id]/+page.svelte` + `<svelte:head>` (title · `app_name`, summary) (AC 10)
- [x] Home block shows 4 cards with "Xem tất cả" (View all) (AC 1)
- [x] List: header with count, large first card on page 1, grid, `Pagination` (AC 5, 6)
- [x] Article page: source line + summary notice, `lang` = article language, no Save action (AC 17, 18; BR-ART-09 in AC 13)
- [ ] `features/article/components/ArticleCard.svelte` (`compact` / `list` variants) used by `ArticleGrid`, the `ArticleCatalog` grid and "Đọc tiếp": thumbnail-first `ArticleCover`, category (hidden when empty), title clamped to 2 lines, meta via `articleMeta` (AC 2, ⚠️ list variant content)
- [ ] `ArticleCover`: when the last available image fails (or the only one), show the placeholder instead of a broken `<img>`; no message (AC 2, 16)
- [ ] `ArticleGrid`: drop the `ARTICLES` sample branch; `null` / `[]` → empty block `articles_block_empty`, heading and "Xem tất cả" (View all) kept (AC 3, ⚠️)
- [ ] `ArticleCatalog`: large card hides an empty category; keeps the cover-first image until ⚠️ AC 6 is answered (AC 6)
- [ ] `ArticleDetail`: blocks per the "Block order" table in `design.md` (category · reading time, cover, title, author line, body, quote, source + notice, tags, Share, "Đọc tiếp"); hide empty category; summary only when there is no body unless ⚠️ AC 13 says otherwise (AC 13, 15)
- [ ] Author line with the initials badge (`author_initials`, `aria-hidden`), author, locale date; whole line hidden when author and date are both missing (AC 14)
- [ ] `features/article/components/ArticleReadNext.svelte`: `article_read_next` heading + `ArticleCard`s in the order received; renders nothing for `[]` (AC 19, 20)
- [ ] `features/article/components/ArticleShareButton.svelte`: Web Share → clipboard → `aria-live` announcement; promote to `$lib/components/ui/ShareButton.svelte` if `DeityShareButton` already exists (AC 21; design "Share")
- [ ] i18n (both `messages/vi.json` and `messages/en.json`, per the "i18n keys" table in `design.md`):
  - [ ] add `articles_block_empty` (text per ⚠️ AC 3), `article_read_next`, `article_share`, `article_share_copied`, `article_share_failed`
  - [ ] delete, once `grep` finds no usage: `article_1..8_title`, `article_1..8_ex`, `article_1..8_meta`, `article_cat_*`, `articles_tab_*`, `articles_filter_label`

## Phase 2 — State & logic (`il-state`)

- [ ] `features/article/utils.ts`: `articleMeta(a, { withDate })` (drops empty author / date), `shareUrlFor(origin, id)` (unprefixed `/articles/{id}`, `id` URL-encoded), `sharePayload(article, shareUrl)` (AC 2, 14, 21, 22)
- [ ] No rule vectors on the website: BR-ART-01 (`rules/article-order.json`) and BR-ART-04 (`rules/article-related.json`) are computed by the backend; the website shows the order received. If the website ever orders or picks articles itself, add a task running those files

## Phase 3 — Server data (contract-gated)

- [x] `src/lib/server/api/articles.ts`: `getTopArticles`, `listArticles`, `getArticle`; DTOs in `src/lib/types/article.ts`
- [x] `(site)/+page.server.ts`: `top` cut to 4, failure → `null`, the page still renders (AC 1, 4)
- [x] `articles/+page.server.ts`: normalise `?page` (307), past the end → 307 last page, failure → `articles: null` (AC 5, 7, 8, 9; Steps 1–2 of the list)
- [x] `articles/[id]/+page.server.ts`: 404 → `error(404)`, other failure → `error(502)` (AC 11, 12 — kept until ⚠️ AC 12 is answered)
- [ ] Fix the stale comment "falls back to static content" in `loadTopArticles` (AC 3)
- [ ] `articles/[id]/+page.server.ts`: return `shareUrl` built with `shareUrlFor(url.origin, id)` (AC 22; Step 2 of the article page)
- [ ] Once `GET /v1/articles/{id}/related` (`articlesRelated`) is in innerlamp-be `openapi.yaml`: check its response against the plan, add `getRelatedArticles(fetch, id)` to `articles.ts`, call it in parallel with `getArticle` (`Promise.allSettled`), any failure → `related: []` + server log; update the `Contract:` line in `requirements.md` (AC 10, 19, 20; Step 1 of the article page)
- [ ] `src/lib/server/app-links.ts`: read `APP_LINKS_IOS_APP_IDS`, `APP_LINKS_ANDROID_PACKAGE`, `APP_LINKS_ANDROID_CERT_SHA256` from `$env/dynamic/private`; pure builders for both documents; path allow-list `ARTICLE_LINK_PATHS` (AC 23, 24, 25; Step 1 of the association files)
- [ ] `src/routes/.well-known/apple-app-site-association/+server.ts` and `src/routes/.well-known/assetlinks.json/+server.ts`: `GET` → 200 `application/json` or 404 when unset; check that no locale redirect or trailing-slash redirect happens (AC 23, 24, 25; Step 2 of the association files)
- [ ] Document the three env vars in `.env.example` (no values) (AC 23, 24)
- [ ] Remove `src/lib/content/articles.ts` and `ARTICLES` from `src/lib/content/home.ts` once nothing imports them (AC 3)
- [ ] Fill the env vars of each environment when ADR-0004's open values are decided (⚠️ AC 22, 23, 24) — deployment configuration, not code

## Phase 4 — Tests (`il-testing`)

- [ ] Unit `features/article/utils.spec.ts`: `articleMeta` (full / no author / no date / neither), `shareUrlFor` (plain id, id needing encoding, never `/en/`), `sharePayload`
- [ ] Unit `server/app-links.spec.ts`: both documents with one and several IDs / fingerprints; unset → `null` (→ 404); article paths present in the iOS document
- [ ] Unit `articles` `load` (mock `listArticles`): `?page=abc` / `?page=0` / `?page=01` → 307; past the end → 307 last page; `ApiError` → `articles: null`
- [ ] Unit `articles/[id]` `load`: 404 → 404; 5xx → 502; related failure → page still has `article`, `related: []`; `shareUrl` unprefixed on `/en/...`
- [ ] Component `ArticleCover`: missing src uses the fallback; src fails → fallback; both fail → placeholder; none → placeholder
- [ ] Component `ArticleShareButton`: `navigator.share` present; cancel (`AbortError`); no share → clipboard + `article_share_copied`; clipboard failure → `article_share_failed`
- [ ] Component `ArticleDetail`: block order; no date / no quote / no author / empty category / no body / no tags hide their parts (FR-ART-004 scenarios, BR-ART-07); no Save action (BR-ART-09)
- [ ] E2E `tests/article.e2e.ts` (real backend or mock server): home shows 4 cards in order + "Xem tất cả" (View all), first card opens its page (FR-ART-001); page 1 = large card + rest, count shown, page 2 / past the end → last page (FR-ART-002); open from the list without sign-in, unknown id → 404 with a way back (FR-ART-003); "Đọc tiếp" shows the related items and opens the next article at its top, related failure → no section (FR-ART-005, once the contract exists); Share copies the link on a browser without Web Share (FR-ART-006); backend down → empty home block and empty list block, no sample cards (FR-ART-008); `/.well-known/*` answer 200 JSON when configured, 404 when not, no redirect (FR-ART-007, ADR-0004)
- [ ] Manual QA on real devices once the domain and app identities exist: shared link opens the app when installed, the website otherwise (FR-ART-007)

## Phase 5 — Quality (`il-quality`)

- [ ] `npm run check && npm run lint && npm run build` pass

## Phase 6 — Documentation

- [ ] Report the Website column of `docs/product/article/product.md` §4.2 to `ba-writer` (this skill does not edit the backend repo): FR-ART-004 and BR-ART-05 / BR-ART-07 are `drift` on the website (order, initials, empty category, broken image), not `done`
- [ ] Clean up `.assumptions.md` once the spec is approved: line 12 "Catalogue pages" (the `/articles` part — sample data, client-side topic filter, no detail pages — is stale) and line 23 "Home re-check" (the sentence "per-item detail links on … articles (no detail pages)" is stale)
- [ ] OKF concept via `il-okf-writer` once the feature is checked end-to-end

## Deferred (not blocking article)

- Open Graph / canonical tags on `/articles/[id]` for shared-link previews (site-wide SEO follow-up, AGENTS.md §4).
- `/vi/...` canonicalising redirect (site-wide follow-up, AGENTS.md §4).
- Deployment adapter and HTTPS per environment (AGENTS.md §10; ADR-0004 infrastructure follow-up).
