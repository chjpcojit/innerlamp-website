import { apiCall } from './client';
import type {
	DeityDetail,
	DeityListQuery,
	DeityPage,
	DeitySutraPage,
	DeitySutraQuery,
	DeityTop
} from '$lib/types/deity';

type Fetch = typeof globalThis.fetch;

/** The 10 featured Buddhas/Bodhisattvas. Public; no caching headers from the backend. */
export const getTopDeities = (fetch: Fetch) => apiCall<DeityTop>(fetch, '/v1/deities/top');

/**
 * Paginated list (20 per page); without `type` it mixes Buddhas, Bodhisattvas and Devas.
 * A page past the end returns empty `items`. Throws `ApiError` `INVALID_PAGE`
 * (`details.field = "page"`) for page < 1 or non-numeric, and `INVALID_DEITY_TYPE`
 * (`details.field = "type"`) for anything but an exact `BUDDHA` / `BODHISATTVA` / `DEVA`
 * (one value only, case-sensitive).
 */
export const listDeities = (fetch: Fetch, { page, type }: DeityListQuery = {}) => {
	const params = new URLSearchParams();
	if (page !== undefined) params.set('page', String(page));
	if (type) params.set('type', type);
	const qs = params.size ? `?${params}` : '';
	return apiCall<DeityPage>(fetch, `/v1/deities${qs}`);
};

/**
 * One deity by its `id`. Throws `ApiError` with status 404 / `DEITY_NOT_FOUND` when unknown.
 * Memorial days are lunar; use the calendar API for solar dates.
 */
export const getDeity = (fetch: Fetch, id: string) =>
	apiCall<DeityDetail>(fetch, `/v1/deities/${encodeURIComponent(id)}`);

/**
 * Sutras/mantras linked to a deity, ordered SUBJECT, SPEAKER, MENTIONED, 20 per page.
 * `items: []` when the deity has none. Throws `ApiError` `INVALID_PAGE` / `INVALID_FILTER`
 * (bad `role`) and `DEITY_NOT_FOUND` is expected for unknown ids.
 */
export const listDeitySutras = (fetch: Fetch, id: string, { page, role }: DeitySutraQuery = {}) => {
	const params = new URLSearchParams();
	if (page !== undefined) params.set('page', String(page));
	if (role) params.set('role', role);
	const qs = params.size ? `?${params}` : '';
	return apiCall<DeitySutraPage>(fetch, `/v1/deities/${encodeURIComponent(id)}/sutras${qs}`);
};
