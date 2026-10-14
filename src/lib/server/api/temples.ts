import { apiCall } from './client';
import type {
	TempleDetail,
	TempleListQuery,
	TempleOptionsPage,
	TempleOptionsQuery,
	TempleSuggestionRequest,
	TemplePage,
	TempleTop
} from '$lib/types/temple';

type Fetch = typeof globalThis.fetch;

/** The 10 featured temples, best heritage rank first. Public; no caching headers from the backend. */
export const getTopTemples = (fetch: Fetch) => apiCall<TempleTop>(fetch, '/v1/temples/top');

/**
 * Paginated list (20 per page), ordered by heritage rank then founding year. A page past
 * the end returns empty `items` (total kept). No province/region filter on the backend.
 * Throws `ApiError` `INVALID_PAGE` (`details.field = "page"`) for page < 1 or non-numeric.
 */
export const listTemples = (fetch: Fetch, { page }: TempleListQuery = {}) => {
	const qs = page !== undefined ? `?page=${page}` : '';
	return apiCall<TemplePage>(fetch, `/v1/temples${qs}`);
};

/** One temple by `id`. Throws `ApiError` with status 404 / `TEMPLE_NOT_FOUND` when unknown. */
export const getTemple = (fetch: Fetch, id: string) =>
	apiCall<TempleDetail>(fetch, `/v1/temples/${encodeURIComponent(id)}`);

/**
 * Temple dropdown options, 100 per page. Throws `ApiError` with `INVALID_PAGE` /
 * `INVALID_FILTER` (`details.field`) on bad input. No province filter on the backend:
 * filter client-side by `province_code` if needed.
 */
export const listTempleOptions = (fetch: Fetch, { page, q }: TempleOptionsQuery = {}) => {
	const params = new URLSearchParams();
	if (page !== undefined) params.set('page', String(page));
	// Backend rejects empty/blank `q`, so drop it instead of sending it.
	const term = q?.trim();
	if (term) params.set('q', term);
	const qs = params.size ? `?${params}` : '';
	return apiCall<TempleOptionsPage>(fetch, `/v1/temples/options${qs}`);
};

/**
 * Proposes a temple missing from the list. Public, not linked to any account: an admin
 * reviews it. Throws `ApiError` (`VALIDATION_ERROR` with `details.field`, `RATE_LIMITED`).
 */
export const suggestTemple = (fetch: Fetch, body: TempleSuggestionRequest) =>
	apiCall<{ id: number; status: 'pending' }>(fetch, '/v1/temple-suggestions', {
		method: 'POST',
		body
	});
