import { apiCall } from './client';
import type { SutraDetail, SutraLinesPage, SutraListQuery, SutraPage } from '$lib/types/sutra';

type Fetch = typeof globalThis.fetch;

/** Lines per request the backend allows at most; larger values are clamped to this. */
export const SUTRA_LINES_PAGE_SIZE = 500;

/**
 * Catalogue (metadata only, no lines), 20 per page, in editorial order (Nam Tông, Bắc Tông,
 * Kim Cang Thừa). A page past the end returns empty `items`. Throws `ApiError` `INVALID_PAGE`
 * or `INVALID_FILTER` (`details.field`) for a bad `page` / filter value or an empty parameter.
 * Public: no user token needed.
 */
export const listSutras = (fetch: Fetch, query: SutraListQuery = {}) => {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined && value !== '') params.set(key, String(value));
	}
	const qs = params.size ? `?${params}` : '';
	return apiCall<SutraPage>(fetch, `/v1/sutras${qs}`);
};

/**
 * One sutra by its slug `id`, with each translation's table of contents. Throws `ApiError`
 * with status 404 / `SUTRA_NOT_FOUND` when unknown. There is no separate intro: use `summary`.
 */
export const getSutra = (fetch: Fetch, id: string) =>
	apiCall<SutraDetail>(fetch, `/v1/sutras/${encodeURIComponent(id)}`);

/**
 * Lines of one translation. `translation` is required and must be one of the sutra's
 * `translations[].key`; there is no language fallback, the caller picks the key. Throws
 * `ApiError` `SUTRA_NOT_FOUND` / `TRANSLATION_NOT_FOUND` (404), `INVALID_PAGE` /
 * `INVALID_PAGE_SIZE` (400). Keep `page_size` constant between pages.
 */
export const listSutraLines = (
	fetch: Fetch,
	id: string,
	translation: string,
	{ page, pageSize }: { page?: number; pageSize?: number } = {}
) => {
	const params = new URLSearchParams({ translation });
	if (page !== undefined) params.set('page', String(page));
	if (pageSize !== undefined) params.set('page_size', String(pageSize));
	return apiCall<SutraLinesPage>(fetch, `/v1/sutras/${encodeURIComponent(id)}/lines?${params}`);
};
