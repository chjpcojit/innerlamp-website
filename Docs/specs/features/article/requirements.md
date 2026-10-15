# Requirements — article (Bài viết Phật pháp hay — Dharma articles)

Version: 1.1
Last updated: 2026-10-15
Status: in-progress (drift) — the featured block on `/` (first 4 of `top`), the list `/articles` (page numbers `?page=`, large first card, URL normalisation, past the end → last page) and the page `/articles/[id]` run against the real backend. Remaining: no static sample content on the home block, card and page alignment (images, missing values, block order, author initials), "Đọc tiếp" (read next) from the planned related-articles read, Share (Web Share → copy link), the ADR-0004 association files, tests.
Feature folder: `src/routes/(site)/articles/`, `src/routes/(site)/+page.server.ts` (featured block), `src/lib/components/sections/{ArticleGrid,ArticleCatalog,ArticleDetail}.svelte`, `src/lib/components/ui/ArticleCover.svelte`, `src/lib/server/api/articles.ts`, `src/lib/types/article.ts`, `src/lib/utils/article.ts`; new: `src/lib/features/article/`, `src/routes/.well-known/`
Product spec: innerlamp-be `docs/product/article/product.md` @ v1.0
Contract: innerlamp-be `docs/specs/api/openapi.yaml` @ a8a016b (`info.version` 1.0.0, tag Articles: `GET /v1/articles/top`, `GET /v1/articles?page=N`, `GET /v1/articles/{id}`). Planned, **not yet in `openapi.yaml` and not built**: `GET /v1/articles/{id}/related` (operationId `articlesRelated`, `{items: [ArticleSummary]}`, 0–2 items, `404 ARTICLE_NOT_FOUND` for an unknown article) per backend `docs/specs/features/article/design.md` v3.0 (3bc0ace).
Implements: BR-ART-01, BR-ART-02 (§3.6: website home shows 4), BR-ART-03, BR-ART-04, BR-ART-05, BR-ART-06, BR-ART-07, BR-ART-08, BR-ART-09, FR-ART-001, FR-ART-002 (§3.6: page numbers, large first card), FR-ART-003, FR-ART-004, FR-ART-005, FR-ART-006 (§3.6: Web Share or copy), FR-ART-007, FR-ART-008, NFR-ART-01, NFR-ART-02; architecture decision ADR-0004 (cited, not restated)

> See `changelog.md` in this folder for the version history of this spec.

This spec is written retroactively from the running code (read 2026-10-15) and checked against product spec v1.0; the parts not built yet are written prospectively in the same file. Routes: `/articles`, `/articles/[id]`, the block on `/` (`/en/...`), and `/.well-known/apple-app-site-association`, `/.well-known/assetlinks.json`.

Product behavior (editorial order, featured count, page size, how related articles are chosen, image order, source attribution, missing values, language, no Save) lives in the product spec and is **not** restated here; this file only says how the website implements those IDs. Not applicable to the website (Website column `n/a`): FR-ART-009.

## Constraints from the product spec

- **Public, read-only** (product §2.3): no route of the feature needs a session; no sign-in prompt.
- **Online only** (§2.4): no offline or cached copy of articles; backend failure → empty block (FR-ART-008).
- **The backend orders and picks** (BR-ART-01, BR-ART-02, BR-ART-04): the website shows lists in the order received and never re-sorts or picks related articles itself, so it runs no rule vectors.
- **Content is not translated** (BR-ART-08): articles are shown verbatim in their own language whatever the interface locale; only interface text goes through Paraglide.
- **Shared links follow ADR-0004**: the shared link is the website's own article URL; the website serves the two association files per environment.
- **No sample content** (FR-ART-008): `src/lib/content/articles.ts` and `ARTICLES` in `src/lib/content/home.ts` leave the render path.

## Dependencies

- **Backend**: `GET /v1/articles/{id}/related` (backend article v3.0, `tasks.md` Phase 7) and its entry in `openapi.yaml`. Until both exist, "Đọc tiếp" stays hidden (design "Deliberately stubbed").
- **Infrastructure** (ADR-0004 follow-up): a website domain per environment served over HTTPS; the deployment adapter is still `adapter-auto` (AGENTS.md §10).
- **iOS / Android**: the app identities that go into the association files (iOS Team ID + bundle id, Android `applicationId` + signing certificate fingerprint per flavor).
- **deity** (`Docs/specs/features/deity/`): plans the same Web Share → clipboard behavior (`DeityShareButton`); see design "Share" for the shared primitive.

## User Story

As a website visitor (signed in or not), I want to see featured Dharma articles, browse all of them page by page, read an article with its source, continue with two related articles and share an article's link, so that I can read and pass on Buddhist teachings. (product §1.3, §2.2)

## Acceptance Criteria (EARS notation)

### Featured block (`/`)

1. WHEN the visitor opens `/`, THE SYSTEM SHALL call `GET /v1/articles/top` from the server and show the first 4 cards in exactly the order received (§3.6: website 4), each card a link to `localizeHref('/articles/{id}')`, with the "Xem tất cả" (View all) link (`SectionHeading` default) to `localizeHref('/articles')`. (FR-ART-001, BR-ART-01, BR-ART-02) — ✓ (`HOME_ARTICLE_COUNT = 4`).
2. WHEN an article card is shown (home block, list grid, "Đọc tiếp"), THE SYSTEM SHALL show the image per BR-ART-05 for cards (the small image first, using the backend's `thumbnail_url`; a failed or missing image ends on the placeholder without any message), the category, the title clamped to 2 lines, and the author · `article_read_minutes`, leaving out every missing value per BR-ART-07. (§3.1.1, BR-ART-05, BR-ART-07, NFR-ART-02) — drift: the home card prints " · " before the reading time when `author` is empty and an empty category label when `category` is empty; when both images are missing or fail, `ArticleCover` keeps a broken `<img>` instead of the placeholder; the home title is not clamped.
   > ⚠️ Not confirmed (product): the list grid card also shows the summary (3 lines) and the date, which §3.1.1 does not list for a card and §3.6 has no row for — blocks the list card content; proposed default: keep them (web adaptation prototype `isPosts`); hand back to ba-writer in innerlamp-be.
3. WHEN `GET /v1/articles/top` fails (network / 5xx / any `ApiError`) or returns `items: []`, THE SYSTEM SHALL keep the block heading and "Xem tất cả" (View all) and show an empty block (`articles_block_empty`) in place of the cards; THE SYSTEM SHALL NOT show the sample entries of `content/articles.ts`. (FR-ART-008, BR-ART-02) — drift: shows 4 sample entries.
   > ⚠️ Not confirmed (product): whether the empty block offers a "Thử lại" (Try again) action and which text it shows (product Appendix A item 3) — blocks the copy of `articles_block_empty`, `articles_load_error`, `articles_empty` and any retry action; proposed default: one short line, no action, until product answers; hand back to ba-writer in innerlamp-be.
4. WHEN `GET /v1/articles/top` fails, THE SYSTEM SHALL still render the rest of `/` (a failing block does not break the page). (platform) — ✓.

### List `/articles`

5. WHEN the visitor opens `/articles[?page=N]`, THE SYSTEM SHALL call `GET /v1/articles?page=N` from the server, show that page in the order received, the subtitle `articles_page_sub` with `total`, and the page-number bar (`Pagination`) when `total_pages > 1`; the number of cards per page is the `page_size` the backend returns, never assumed by the website. (FR-ART-002, BR-ART-01, BR-ART-03, NFR-ART-01) — ✓.
6. WHEN page 1 is shown, THE SYSTEM SHALL show its first article as a large card (`articles_featured` · category, title, summary, author · reading time · date) and the rest in the grid; other pages have no large card. (FR-ART-002 §3.6) — ✓.
   > ⚠️ Not confirmed (product): the large card shows the cover image first (`image_url` → `thumbnail_url`), while BR-ART-05 says a card shows the thumbnail first — blocks the image of the large card; proposed default: keep the cover (the 360×360 thumbnail is too small for a 16:10 hero) and add a §3.6 row; hand back to ba-writer in innerlamp-be.
7. WHEN `?page=` is present but not an integer ≥ 1 in canonical form, THE SYSTEM SHALL redirect 307 to the canonical URL (`?page=1` dropped). (platform) — ✓.
8. WHEN `?page=` is past the last page (backend returns `items: []` with `total_pages > 0`), THE SYSTEM SHALL redirect 307 to the last page. (FR-ART-002 §3.6, BR-ART-03) — ✓.
9. WHEN `GET /v1/articles` fails (any `ApiError`) or returns `total: 0`, THE SYSTEM SHALL show the page header without a count and an empty block in place of the cards (`articles_load_error` / `articles_empty`), with no sample, placeholder or cached article. (FR-ART-008) — ✓ per code (⚠️ AC 3 for the text and a retry action).

### Article page `/articles/[id]`

10. WHEN the visitor opens `/articles/{id}` (from the home block, the list, "Đọc tiếp" or a shared link), THE SYSTEM SHALL call `GET /v1/articles/{id}` and `GET /v1/articles/{id}/related` in parallel from the server and show the page without sign-in; `<title>` = article title · `app_name`, meta description = `summary`. (FR-ART-003) — ✓ partly (the related read is not called yet: planned contract).
11. WHEN `GET /v1/articles/{id}` returns 404 `ARTICLE_NOT_FOUND`, THE SYSTEM SHALL return HTTP 404 with the "not found" screen that offers a way back (`err_404_*`: home / previous page). (FR-ART-003) — ✓ (root `+error.svelte`).
12. WHEN `GET /v1/articles/{id}` fails otherwise (network / 5xx / other 4xx), THE SYSTEM SHALL show the root error screen (`error(502)`, `noindex`) and SHALL NOT show any placeholder, sample or cached article. (FR-ART-003, FR-ART-008) — ✓ per code.
    > ⚠️ Not confirmed (product): whether the shared error screen (HTTP 502, with its own "Thử lại" (Try again) `err_retry`) satisfies FR-ART-008's "empty block in place of the article page", or the failure must render as an empty block inside the article page frame (and then whether it has a retry, Appendix A item 3) — blocks keeping `error(502)`; proposed default: keep the shared screen (as deity AC 14); hand back to ba-writer in innerlamp-be.
13. WHEN the article page is shown, THE SYSTEM SHALL order its blocks exactly as the "Block order" table in `design.md` (FR-ART-004's order, plus the website's back link) and show no Save action and no saved list. (FR-ART-004, BR-ART-09) — drift: today back link → category → title → author · reading time · date → cover → summary → body → quote → tags → notice + source; reading time is not next to the category, the cover is below the title, no author initials, no Share, no "Đọc tiếp". No Save ✓.
    > ⚠️ Not confirmed (product): the page shows the `summary` as a lead paragraph above the body and the `tags` after the quote, neither of which FR-ART-004's order lists (BR-ART-07 only says missing tags are left out) — blocks blocks #5 and #8 of the order table; proposed default: show the summary only when there is no body (BR-ART-07) and keep the tags after the quote; hand back to ba-writer in innerlamp-be.
14. WHEN the author line is shown, THE SYSTEM SHALL show the author's initials badge (`author_initials`, decorative, `aria-hidden`), the author and the date formatted per the interface locale (`formatArticleDate`); no author → no author line (initials included); no date → no date. (FR-ART-004, BR-ART-07) — drift: no initials badge.
15. WHEN a value is missing on the page, THE SYSTEM SHALL leave it out per BR-ART-07 (no empty category label, date, author line, quote block or tag list); an article with `body_paragraphs: []` SHALL show its summary and `article_no_body`. (BR-ART-07) — drift: an empty `category` renders an empty label; the rest ✓.
16. WHEN the cover is shown, THE SYSTEM SHALL use the image order of BR-ART-05 for the page (`image_url` → `thumbnail_url` → placeholder) and replace an image that fails to load by the next one, then by the placeholder, without any message; the text still shows. (BR-ART-05) — drift: when the last available image fails, a broken `<img>` stays.
17. WHEN the article page is shown, THE SYSTEM SHALL always show the summary notice `article_summary_notice` and the source line `article_source_label`: `source_name` as a link to `source_url` (new tab, `rel="noopener noreferrer"`) only when `source_url` is `http`/`https`, else the name as plain text. (BR-ART-06) — ✓ (when `source_name` is empty but the link is valid, the link text is `article_read_original`).
18. WHEN the article page is shown, THE SYSTEM SHALL set `lang` to the article's `language` on the article element, so the content keeps its own language while the interface text follows the interface locale. (BR-ART-08) — ✓.
19. WHEN `GET /v1/articles/{id}/related` returns at least one item, THE SYSTEM SHALL show the "Đọc tiếp" (Read next) section (`article_read_next`) after Share, with one card per item (AC 2) in exactly the order received; choosing a card navigates to `localizeHref('/articles/{id}')` and the new article is shown from its top. (FR-ART-005, BR-ART-04, BR-ART-05) — not built (planned contract).
20. WHEN `GET /v1/articles/{id}/related` returns `items: []` or fails for any reason (including 404 while the detail succeeded, network, or the operation not deployed yet), THE SYSTEM SHALL hide the "Đọc tiếp" section, log the failure server-side and render the rest of the page unchanged; THE SYSTEM SHALL NOT fill the section with other articles. (FR-ART-005, FR-ART-008) — not built.

### Share (`/articles/[id]`, browser)

21. WHEN the visitor presses "Chia sẻ" (Share) (`article_share`), THE SYSTEM SHALL call `navigator.share` with the article's title and its share URL (AC 22) when the browser supports it; when it is unavailable or fails (other than the visitor cancelling, `AbortError`, which does nothing), THE SYSTEM SHALL copy the share URL with `navigator.clipboard.writeText` and announce `article_share_copied` in an `aria-live` region; if copying also fails it announces `article_share_failed`. (FR-ART-006 §3.6) — not built.
22. WHEN the share URL is built, THE SYSTEM SHALL use the website's own article page, unprefixed (`/articles/{id}`, the base-locale form) on the origin of the environment serving the page, whatever the interface locale, as ADR-0004 prescribes. (FR-ART-006, ADR-0004) — not built.
    > ⚠️ Not confirmed: the website domain of each environment (product Appendix A item 2, ADR-0004 open question) — blocks the exact shared link and FR-ART-007 end to end; proposed default: the request origin seen by the server (`url.origin`), so no code change is needed when the domain is decided, as long as each environment is served on one hostname.

### Shared links and association files (ADR-0004)

23. WHEN a GET reaches `/.well-known/apple-app-site-association`, THE SYSTEM SHALL answer `200` with `content-type: application/json`, without any redirect, locale prefix or session effect, listing this environment's iOS app identifier(s) and the article paths `/articles/*` and `/en/articles/*` as the paths the app opens. (FR-ART-007, ADR-0004) — not built.
    > ⚠️ Not confirmed: the iOS Team ID (bundle id per environment) and the website domain per environment (ADR-0004 open questions) — blocks the file's content in every environment; the website reads them from server configuration, never hardcoded.
24. WHEN a GET reaches `/.well-known/assetlinks.json`, THE SYSTEM SHALL answer `200` with `content-type: application/json`, without any redirect, locale prefix or session effect, declaring this environment's Android package name and its signing certificate fingerprint(s) for verified App Links. (FR-ART-007, ADR-0004) — not built.
    > ⚠️ Not confirmed: the final Android `applicationId` per flavor (today the template `com.example.innerlamp`) and the signing certificate fingerprints (ADR-0004 open question) — blocks the file's content in every environment; the website reads them from server configuration, never hardcoded.
25. WHEN the configuration of an association file is not set for the running environment, THE SYSTEM SHALL answer `404` for that file, so no app is associated by accident. (platform)
26. WHEN a shared article link is opened in a browser (no app installed, desktop, in-app browser, crawler), THE SYSTEM SHALL render the normal article page of AC 10–20 with no interstitial, store banner or redirect. (FR-ART-007) — ✓ (the page exists; end-to-end check needs the real domain, manual QA).

### General

27. WHEN any interface string of the feature is shown (including `alt`, `aria-label`, `<title>`, share announcements, empty blocks), THE SYSTEM SHALL take it from Paraglide `m.*` with the key present in both `messages/vi.json` and `messages/en.json`; article content (title, category, author, summary, body, quote, tags, source) is shown verbatim from the backend. (platform, BR-ART-08) — ✓ for existing strings.
28. WHEN calling the backend, THE SYSTEM SHALL only call from the SvelteKit server via `$lib/server/api/articles.ts` with `x-api-key`; no route of the feature reads the session cookie or sends a Bearer token. (platform) — ✓.

## Data & API (called from the SvelteKit server)

Common header: `x-api-key` from `API_KEY`; no Bearer (public routes).

| Action | Operation (openapi) | Called from | Notes |
| --- | --- | --- | --- |
| Featured block | `GET /v1/articles/top` | `load` of `(site)/+page.server.ts` | Backend gives 5 (BR-ART-02); the website keeps the first 4 (§3.6) |
| List | `GET /v1/articles?page=N` | `load` of `(site)/articles/+page.server.ts` | `page_size`, `total`, `total_pages` read from the response |
| Article page | `GET /v1/articles/{id}` | `load` of `(site)/articles/[id]/+page.server.ts` | `id` is the stable slug, URL-encoded |
| "Đọc tiếp" | `GET /v1/articles/{id}/related` | same `load`, in parallel | **Planned** (`articlesRelated`, backend article v3.0), not in `openapi.yaml` yet → stubbed (design) |
| Share URL | — (no backend call) | same `load` | Built from the request origin + `/articles/{id}` (AC 22) |
| Association files | — (no backend call) | `src/routes/.well-known/*/+server.ts` | Values from server env config (design "Association files") |

## Error → UI mapping

| Operation | Failure case | Visitor sees | Current code state |
| --- | --- | --- | --- |
| `GET /v1/articles/top` | network / 5xx / any `ApiError` | Block heading + "Xem tất cả" (View all) + empty block `articles_block_empty` (⚠️ AC 3); rest of `/` renders | drift — 4 sample entries from `content/articles.ts` |
| `GET /v1/articles/top` | `items: []` | as above | drift — 4 sample entries |
| `GET /v1/articles` | network / 5xx / unexpected 4xx | Header without count + `articles_load_error` (⚠️ AC 3) | ✓ |
| `GET /v1/articles` | `total: 0` | Header + `articles_empty` (⚠️ AC 3) | ✓ |
| `GET /v1/articles` | 400 `INVALID_PAGE` (cannot happen: the URL is normalised first) | as network / 5xx | ✓ (general branch) |
| `GET /v1/articles` | page past the end | 307 to the last page | ✓ |
| `GET /v1/articles/{id}` | 404 `ARTICLE_NOT_FOUND` | HTTP 404, `err_404_*` (home / go back) | ✓ |
| `GET /v1/articles/{id}` | network / 5xx | Root error screen `err_data_*` + `err_retry` (⚠️ AC 12) | ✓ |
| `GET /v1/articles/{id}/related` | any failure, incl. 404 and "not deployed" | Article page without "Đọc tiếp" | not built (not called) |
| `GET /v1/articles/{id}/related` | `items: []` | Article page without "Đọc tiếp" | not built |
| Image (browser) | missing or fails to load | Next image in the BR-ART-05 order, then the placeholder; no message | drift — broken image when the last one fails |
| Share (browser) | no `navigator.share` / failure | Copy link, announce `article_share_copied`; copy fails → `article_share_failed`; cancel → nothing | not built |
| Association files | configuration not set | `404` | not built |
| every page | browser offline | `OfflineGate` (`offline_*`) | ✓ |

## Out of scope

- Save / bookmark and a saved list (BR-ART-09), search, filtering by category or tag, reading progress, font size, text to speech, offline reading, the share-verse screen, back-office editing (product §1.2).
- The apps' "{loaded} / {total} bài" header, continuous loading and the end line "Bạn đã xem hết bài viết" (You have seen every article) — apps only (§3.6 row FR-ART-002).
- Opening shared links inside the apps (iOS / Android specs); deferred deep links, short links, link analytics (ADR-0004).
- Choosing related articles or the featured list on the website (backend, BR-ART-02, BR-ART-04).
- Open Graph / canonical tags for shared-link previews and `/vi/...` canonicalisation (site-wide SEO follow-up, see `tasks.md` Deferred).

## Pending (not yet implemented)

- Home block empty state, removal of the sample content and its keys — Phases 1, 3.
- Shared article card (2-line title, missing values, image placeholder on failure) — Phase 1.
- Article page block order, author initials, empty category — Phase 1.
- "Đọc tiếp" — Phases 1, 3 (waiting for `articlesRelated` in `openapi.yaml` and the backend build).
- Share (Web Share → copy link) and the share URL — Phases 1, 2, 3.
- Association files `/.well-known/*` — Phase 3 (content waiting for the ADR-0004 open values).
- Tests — Phase 4.

## Open questions (resolved)

- ~~How many featured articles the website home shows~~ → the first 4 of the 5 the backend returns (product §3.6 row FR-ART-001; anh Đức). Resolved 2026-10-15.
- ~~Website pagination of all articles~~ → page numbers, large first card on page 1, past the end → last page (product §3.6 row FR-ART-002; anh Đức). Kept as in code. Resolved 2026-10-15.
- ~~Share on the website~~ → Web Share API, falling back to copying the link (product §3.6 row FR-ART-006; anh Đức). Resolved 2026-10-15.
- ~~Who serves the association files~~ → the website, per environment, per ADR-0004 (values still open: AC 23, 24). Resolved 2026-10-15.
- ~~"Đọc tiếp" source~~ → the backend's related-articles read, 0–2 items shown as received; failure → section hidden, no other content (product FR-ART-005; anh Đức). Resolved 2026-10-15.
- ~~Failure states~~ → empty block, never sample or cached content (product FR-ART-008; anh Đức); retry and text still open (⚠️ AC 3). Resolved 2026-10-15.
