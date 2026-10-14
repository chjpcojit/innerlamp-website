import { apiCall } from './client';
import type { DharmaTalkDetail, DharmaTalkPage } from '$lib/types/dharma-talk';

type Fetch = typeof globalThis.fetch;

/**
 * Catalogue, 10 per page (fixed server-side), ordered by the backend's `sort_order`. No filters.
 * A page past the end returns empty `items`. Throws `ApiError` `INVALID_PAGE` for a bad `page`.
 * Public: no user token needed.
 */
export const listDharmaTalks = (fetch: Fetch, page = 1) =>
	apiCall<DharmaTalkPage>(fetch, `/v1/dharma-talks${page > 1 ? `?page=${page}` : ''}`);

/** One talk by its slug `id`. Throws `ApiError` 404 / `DHARMA_TALK_NOT_FOUND` when unknown. */
export const getDharmaTalk = (fetch: Fetch, id: string) =>
	apiCall<DharmaTalkDetail>(fetch, `/v1/dharma-talks/${encodeURIComponent(id)}`);
