import { apiCall } from './client';
import type { ArticleDetail, ArticleListQuery, ArticlePage, ArticleTop } from '$lib/types/article';

type Fetch = typeof globalThis.fetch;

/** The featured articles (5 by default). Public; no caching headers from the backend. */
export const getTopArticles = (fetch: Fetch) => apiCall<ArticleTop>(fetch, '/v1/articles/top');

/**
 * Paginated list (10 per page) in editorial order; no category, search, sort or locale
 * filter. A page past the end returns empty `items` (total kept). Throws `ApiError`
 * `INVALID_PAGE` (`details.field = "page"`) for page < 1 or non-numeric.
 */
export const listArticles = (fetch: Fetch, { page }: ArticleListQuery = {}) => {
	const qs = page !== undefined ? `?page=${page}` : '';
	return apiCall<ArticlePage>(fetch, `/v1/articles${qs}`);
};

/** One article by slug `id`. Throws `ApiError` with status 404 / `ARTICLE_NOT_FOUND` when unknown. */
export const getArticle = (fetch: Fetch, id: string) =>
	apiCall<ArticleDetail>(fetch, `/v1/articles/${encodeURIComponent(id)}`);
