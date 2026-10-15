# Design — article (Bài viết Phật pháp hay — Dharma articles)

Version: 1.1
Last updated: 2026-10-15
Status: in-progress (drift) — mirror `requirements.md`

> See `changelog.md` in this folder for the version history of this spec.

## Overview

Four surfaces, all public, none reads the session cookie: the featured block on `/`, the list
`/articles` (`?page=`), the article page `/articles/[id]`, and the two ADR-0004 association files
under `/.well-known/`. Data takes the standard path: browser → `load` in `+page.server.ts` →
`$lib/server/api/articles.ts` → backend (`x-api-key`). Same architecture as `deity` and `temple`
(URL-driven list with page numbers, detail page via `load`, a secondary read in parallel whose failure
only hides its block). The only browser-side behavior is image fallback and Share. New code (the shared
card, "Đọc tiếp", Share, pure helpers) goes into `src/lib/features/article/`; the three existing
sections keep their names and places.

## Layers & components

| Layer | File | Responsibility | Status |
| --- | --- | --- | --- |
| Route (server) | `src/routes/(site)/+page.server.ts` | `loadTopArticles` → first 4 (`HOME_ARTICLE_COUNT`); failure → `null` | exists ✓ — needs: comment "falls back to static content" is wrong under FR-ART-008 (empty block) |
| Route (UI) | `src/routes/(site)/+page.svelte` | Renders `ArticleGrid items={data.articles}` | exists ✓ |
| Route (UI) | `src/routes/(site)/articles/+page.svelte` | Meta (`articles_title`, `articles_meta_description`), `ArticleCatalog` | exists ✓ |
| Route (server) | `src/routes/(site)/articles/+page.server.ts` | Normalise `?page` (307), `listArticles`, past the end → 307 last page, failure → `articles: null` | exists ✓ |
| Route (UI) | `src/routes/(site)/articles/[id]/+page.svelte` | Meta (title, summary), `{#key}` `ArticleDetail` | exists — needs: pass `related`, `shareUrl` |
| Route (server) | `src/routes/(site)/articles/[id]/+page.server.ts` | `getArticle` ∥ `getRelatedArticles` (Step-by-step "Article page"); 404 → `error(404)`; other failure → `error(502)` (⚠️ requirements AC 12); builds `shareUrl` | exists — needs: related call (gated on the contract), `shareUrl` |
| Route (server) | `src/routes/.well-known/apple-app-site-association/+server.ts` | `GET` → JSON from env config, or 404 when unset (Step-by-step "Association files") | not created |
| Route (server) | `src/routes/.well-known/assetlinks.json/+server.ts` | As above, Android | not created |
| Server config | `src/lib/server/app-links.ts` | Reads and validates the association env vars (`$env/dynamic/private`), builds both documents; pure builders testable without env | not created |
| Section | `src/lib/components/sections/ArticleGrid.svelte` | Home block: heading + "Xem tất cả" (View all), up to 4 `ArticleCard`s; `null`/`[]` → empty block `articles_block_empty` | exists — needs: drop the `ARTICLES` sample branch, use `ArticleCard`, empty block |
| Section | `src/lib/components/sections/ArticleCatalog.svelte` | Header + count, large first card on page 1, grid, `Pagination`, empty block | exists ✓ — needs: grid uses `ArticleCard` (list variant with summary + date, ⚠️ requirements AC 2), large card hides empty category |
| Section | `src/lib/components/sections/ArticleDetail.svelte` | Article page per the "Block order" table | exists — needs: reorder, author initials, hide empty category, summary only when no body (⚠️ AC 13), `ArticleShareButton`, `ArticleReadNext` |
| UI primitive | `src/lib/components/ui/ArticleCover.svelte` | Image with ordered fallback → placeholder (BR-ART-05) | exists — needs: a second failure (or a failing only image) ends on the placeholder, not a broken `<img>` |
| Feature UI | `src/lib/features/article/components/ArticleCard.svelte` | One card for home, list grid and "Đọc tiếp": `ArticleCover` (thumbnail first), category, title (2-line clamp), meta via `articleMeta`; props `article`, `headingLevel`, `variant` (`compact` / `list`) | not created (merges the two duplicated card markups) |
| Feature UI | `src/lib/features/article/components/ArticleReadNext.svelte` | "Đọc tiếp" heading `article_read_next` + up to 2 `ArticleCard`s; renders nothing for `[]` | not created |
| Feature UI | `src/lib/features/article/components/ArticleShareButton.svelte` | Web Share → clipboard → `aria-live` announcement (see "Share") | not created |
| Feature logic | `src/lib/features/article/utils.ts` | `articleMeta(a, { withDate })` (author · reading time · date, empty parts dropped), `sharePayload(article, shareUrl)`, `shareUrlFor(origin, id)` | not created |
| Shared logic | `src/lib/utils/article.ts` `formatArticleDate` | `YYYY-MM-DD` → locale date, `''` when `null` | exists ✓ |
| API resource | `src/lib/server/api/articles.ts` | `getTopArticles`, `listArticles`, `getArticle`; **planned** `getRelatedArticles(fetch, id)` → `ArticleTop`-shaped `{ items }` | exists — needs: `getRelatedArticles` once `articlesRelated` is in `openapi.yaml` |
| Types | `src/lib/types/article.ts` | DTOs (`ArticleSummary`, `ArticleDetail`, `ArticleTop`, `ArticlePage`); related reuses `ArticleTop` (`{ items: ArticleSummary[] }`) unless the contract names a new schema | exists ✓ — needs: re-check against the contract when `articlesRelated` lands |
| Static content | `src/lib/content/articles.ts`, `ARTICLES` in `src/lib/content/home.ts`, keys `article_1..8_*`, `article_cat_*`, `articles_tab_*`, `articles_filter_label` | Sample content and its old topic filter | remove (FR-ART-008) — `grep` for usages before deleting keys |
| Config | `.env.example` | Document the association env vars (no values) | needs change |
| i18n | `messages/vi.json`, `messages/en.json` | "i18n keys" table | to change / add / delete |
| Tests | `src/lib/features/article/utils.spec.ts`, `src/lib/server/app-links.spec.ts`, `src/routes/(site)/articles/page.server.spec.ts`, `src/routes/(site)/articles/[id]/page.server.spec.ts`, component specs, `tests/article.e2e.ts` | Per `il-testing` | not created |

### Block order of the article page (FR-ART-004)

| # | Block | Source | Hidden when |
| --- | --- | --- | --- |
| 0 | Back link `article_back` → `/articles` | — | — (website navigation, not in FR-ART-004) |
| 1 | Category · `article_read_minutes` | `category`, `read_minutes` | `category` empty → only the category part |
| 2 | Cover `ArticleCover` (`image_url` → `thumbnail_url` → placeholder) | detail | — (placeholder at worst) |
| 3 | `<h1>` title | `title` | — |
| 4 | Author line: initials badge, author, date (`formatArticleDate`) | `author_initials`, `author`, `published_date` | no author → badge and author; no date → date; both → whole line |
| 5 | Body paragraphs (plain text, one `<p>` each); no body → `summary` + `article_no_body` | `body_paragraphs`, `summary` | — (⚠️ requirements AC 13: summary lead when a body exists) |
| 6 | Quote `<blockquote>` + `— quote_source` | `quote`, `quote_source` | `quote` empty → block; `quote_source` empty → footer line |
| 7 | Source + summary notice: `article_source_label`: name / link (http/https only); `article_summary_notice` | `source_name`, `source_url` | never hidden (BR-ART-06) |
| 8 | Tags (`article_tags_label` list) | `tags` | `[]` (⚠️ requirements AC 13: position) |
| 9 | Share `ArticleShareButton` (`article_share`) | `shareUrl` | — |
| 10 | "Đọc tiếp" `ArticleReadNext` | related `items` | `[]` or any failure |

The `<article lang={article.language}>` wrapper covers blocks 1–8 (content); blocks 0, 9, 10 are
interface and stay in the page locale.

## Route & navigation flow

```
/
  ├─ article card ───────▶ /articles/{id}
  └─ "Xem tất cả" ───────▶ /articles

/articles[?page=N]
  ├─ bad ?page ──────────▶ 307 canonical URL
  ├─ page > total_pages ─▶ 307 ?page=total_pages
  ├─ page number ────────▶ ?page=N
  └─ article card ───────▶ /articles/{id}

/articles/{id}
  ├─ 404 ────────────────▶ +error.svelte (err_404_*: home / back)
  ├─ other failure ──────▶ +error.svelte (err_data_*, "Thử lại" = reload)  (⚠️ AC 12)
  ├─ "← Tất cả bài viết" ▶ /articles
  ├─ "Đọc tiếp" card ────▶ /articles/{other id}  (new page from its top)
  ├─ source link ────────▶ source_url (new tab)
  └─ "Chia sẻ" ──────────▶ (browser) navigator.share | clipboard

https://<web-domain>/articles/{id}   (shared link, ADR-0004)
  ├─ app installed ──────▶ opened by the app (iOS / Android specs)
  └─ otherwise ──────────▶ this page

/.well-known/apple-app-site-association, /.well-known/assetlinks.json
  └─ GET ────────────────▶ 200 JSON | 404 when not configured
```

Every internal href goes through `localizeHref()`; the share URL deliberately does not (AC 22).
SvelteKit resets scroll to the top on a client navigation, and `{#key data.article.id}` remounts
`ArticleDetail`, so a "Đọc tiếp" card opens the new article from its top (FR-ART-005).

## Step-by-step Flow — List

```
Step 1 — Normalise the URL (this feature)
- Trigger: request GET /articles
- Pre-condition: —
- Where: articles/+page.server.ts `load`
- API: no call
    - ?page present and not the canonical form of an integer ≥ 1 → 307 canonical URL (page 1 → no query)
    - otherwise → Step 2

Step 2 — Read one page (this feature)
- Trigger: after Step 1
- Pre-condition: page ≥ 1
- Where: same `load`
- API: GET /v1/articles?page=N
    - Success, items > 0 → { articles } (page 1: first item is the large card)
    - Success, items = [] and page > 1 and total_pages > 0 → 307 ?page=total_pages
    - Success, total = 0 → empty block `articles_empty`
    - Failure (any ApiError) → { articles: null } → empty block `articles_load_error`
    - Failure (not an ApiError) → rethrow (programming error)
```

## Step-by-step Flow — Article page

```
Step 1 — Read the article and its related articles, in parallel (this feature)
- Trigger: request GET /articles/{id} (any locale)
- Pre-condition: —
- Where: articles/[id]/+page.server.ts `load` (Promise.allSettled)
- API: GET /v1/articles/{id}  ∥  GET /v1/articles/{id}/related (planned, `articlesRelated`)
    - Detail success → article
    - Detail 404 ARTICLE_NOT_FOUND → error(404) (related result ignored)
    - Detail other ApiError → error(502) → root error screen (⚠️ requirements AC 12)
    - Detail non-ApiError → rethrow
    - Related success → related = items, as received (0–2)
    - Related any failure (404, network, 5xx, not deployed) → related = [], log server-side
    - Until the contract exists: no related call, related = [] (design "Deliberately stubbed")

Step 2 — Build the share URL (this feature)
- Trigger: Step 1 returned an article
- Pre-condition: —
- Where: same `load`
- API: no call — shareUrl = shareUrlFor(url.origin, article.id) → `${origin}/articles/${encodeURIComponent(id)}`,
  never locale-prefixed (ADR-0004); ⚠️ requirements AC 22 for the domain
    - Success → { article, related, shareUrl }

Step 3 — Render (this feature, server + browser)
- Trigger: page data ready
- Where: articles/[id]/+page.svelte → ArticleDetail
- API: no call
    - Blocks per the "Block order" table; related = [] → no "Đọc tiếp"
    - Images: ArticleCover tries the next image on `error`, then the placeholder (browser)
```

## Step-by-step Flow — Association files (ADR-0004)

```
Step 1 — Read the environment's configuration (this feature)
- Trigger: GET /.well-known/apple-app-site-association or /.well-known/assetlinks.json
  (fetched by Apple's CDN / Android's verifier, without cookies)
- Pre-condition: the route sits outside `(site)` and the Paraglide middleware leaves an unprefixed
  path in the base locale (no redirect); handleAuth finds no cookies and does nothing
- Where: src/routes/.well-known/<file>/+server.ts → $lib/server/app-links.ts
- API: no backend call — env vars (`$env/dynamic/private`):
    APP_LINKS_IOS_APP_IDS          comma-separated "<TeamID>.<bundle id>" of this environment's build
    APP_LINKS_ANDROID_PACKAGE      this environment's applicationId
    APP_LINKS_ANDROID_CERT_SHA256  comma-separated SHA-256 signing certificate fingerprints
    - Set → Step 2
    - Not set (for that file) → 404 (requirements AC 25)

Step 2 — Answer (this feature)
- Where: same handler
- API: none
    - iOS: 200 `application/json`, applinks entry for each app ID with the path allow-list
      `/articles/*`, `/en/articles/*` (constant ARTICLE_LINK_PATHS in app-links.ts; a later shareable
      feature adds its own paths when its app screen ships, ADR-0004 convention 2)
    - Android: 200 `application/json`, one `delegate_permission/common.handle_all_urls` statement
      for the package + fingerprints (paths live in the app's manifest, not in this file)
    - No redirect, no trailing-slash change, `cache-control: public, max-age=3600`
    - ⚠️ requirements AC 23, 24: the actual values per environment
```

The exact JSON shape follows Apple's and Google's documentation; it is built in `app-links.ts` and
covered by unit tests, not pasted here.

## Share (FR-ART-006, browser)

`ArticleShareButton` (`<button type="button">`, rendered on the server, active after hydration):

1. `payload = sharePayload(article, shareUrl)` → `{ title: article.title, url: shareUrl }` (no extra
   text; the product shares the title and the link).
2. `navigator.share` available → `share(payload)`; `AbortError` (visitor cancelled) → nothing; other
   failure → step 3.
3. `navigator.clipboard.writeText(shareUrl)` → announce `article_share_copied` in an `aria-live="polite"`
   region; failure → announce `article_share_failed`.

Existing patterns: `LampOffering.svelte` (`navigator.share`), `OfferQr.svelte` (clipboard). The
`deity` spec plans the same behavior (`DeityShareButton`). Whichever feature is built second promotes
the logic to a primitive `$lib/components/ui/ShareButton.svelte` (props: payload, copy text, labels
passed in as strings) and both features use it — features must not import each other's internals
(AGENTS.md §5).

## Session & cookies

Not used. Every route of the feature is public; it does not read `il_token`, does not change
`locals.user` and sends no Bearer token.

## SEO

`/articles`, `/articles?page=N` and `/articles/[id]` are public, indexable pages (the shared link's
fallback, ADR-0004). The root error screen is already `noindex`. No prerendering (content can change
with each content load). Open Graph and canonical tags are deferred (`tasks.md` Deferred).

## i18n keys

| Key | Used in | ID | Change |
| --- | --- | --- | --- |
| `articles_title` ("Bài viết Phật pháp hay" (Good Dharma articles)), `articles_meta_description`, `articles_page_sub`, `articles_featured` | Block heading, list header, large card | FR-ART-001, FR-ART-002 | keep |
| `article_read_minutes` ("{minutes} phút đọc" ({minutes} min read)) | Cards, page | FR-ART-004 | keep |
| `article_back`, `article_no_body`, `article_summary_notice`, `article_source_label`, `article_read_original`, `article_tags_label`, `article_photo_label` | Page, placeholder | FR-ART-004, BR-ART-05, BR-ART-06, BR-ART-07 | keep |
| `articles_block_empty` | Home block empty / failed | FR-ART-008 | add (text ⚠️ requirements AC 3) |
| `articles_load_error`, `articles_empty` | List empty block | FR-ART-008 | keep; text may change with ⚠️ AC 3 |
| `article_read_next` ("Đọc tiếp" (Read next)) | "Đọc tiếp" heading | FR-ART-005 | add |
| `article_share` ("Chia sẻ" (Share)) | Share button | FR-ART-006 | add |
| `article_share_copied` (proposed vi "Đã sao chép đường dẫn bài viết" (Article link copied)) | Copy announcement | FR-ART-006 | add |
| `article_share_failed` (proposed vi "Không sao chép được đường dẫn" (Couldn't copy the link)) | Copy failure | FR-ART-006 (platform) | add |
| `article_1_title` … `article_8_title`, `article_1_ex` … `article_8_ex`, `article_1_meta` … `article_8_meta`, `article_cat_doctrine`, `article_cat_sutra`, `article_cat_meditation`, `article_cat_life`, `article_cat_filial`, `articles_tab_all`, `articles_tab_doctrine`, `articles_tab_sutra`, `articles_tab_meditation`, `articles_tab_life`, `articles_tab_filial`, `articles_filter_label` | Sample content / old topic filter | — | delete together with `content/articles.ts` (check with `grep` first) |
| `nav_articles` | Footer link `#articles` | — | keep |

## Deliberately stubbed for now

- `GET /v1/articles/{id}/related` is not in `openapi.yaml` and not built (backend article v3.0,
  Phase 7). Until it is, `getRelatedArticles` is not written, Step 1 makes only the detail call and
  `related = []`, so "Đọc tiếp" never shows. Once the operation is in `openapi.yaml`: re-check its
  response against the plan (`{ items: ArticleSummary[] }`, 0–2), add the function, update the
  `Contract:` line in `requirements.md`. Tasks Phase 3.
- The association files can be built and tested now with fake values in tests; the real values per
  environment wait for ADR-0004's open questions (requirements AC 23, 24). Until configured, both
  files answer 404 (AC 25). Tasks Phase 3.
