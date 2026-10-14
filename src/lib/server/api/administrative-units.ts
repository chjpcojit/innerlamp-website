import { apiCall } from './client';
import type {
	ItemList,
	NewWard,
	OldDistrict,
	OldWard,
	Province
} from '$lib/types/administrative-unit';

type Fetch = typeof globalThis.fetch;

const BASE = '/v1/administrative-units';

const get = async <T>(fetch: Fetch, path: string) =>
	(await apiCall<ItemList<T>>(fetch, `${BASE}/${path}`)).items;

const seg = encodeURIComponent;

// The backend answers `Cache-Control: public, max-age=86400` and rate-limits the group
// (60 req/min/IP, `RATE_LIMITED` with `details.retry_after_seconds`) — cache results in
// the caller (e.g. a module-level Map in `load`) rather than calling per request.

/** New system (2 levels): the 34 provinces/cities. */
export const listNewProvinces = (fetch: Fetch) => get<Province>(fetch, 'new/provinces');

/**
 * New system: wards/communes/special zones of a province. Optional `q` (1–100 chars)
 * filters by full name, ignoring case and diacritics; blank `q` is dropped.
 */
export const listNewWards = (fetch: Fetch, provinceCode: string, q?: string) => {
	const term = q?.trim();
	const qs = term ? `?${new URLSearchParams({ q: term })}` : '';
	return get<NewWard>(fetch, `new/provinces/${seg(provinceCode)}/wards${qs}`);
};

/** Old system (3 levels): provinces. */
export const listOldProvinces = (fetch: Fetch) => get<Province>(fetch, 'old/provinces');

export const listOldDistricts = (fetch: Fetch, provinceCode: string) =>
	get<OldDistrict>(fetch, `old/provinces/${seg(provinceCode)}/districts`);

export const listOldWards = (fetch: Fetch, districtCode: string) =>
	get<OldWard>(fetch, `old/districts/${seg(districtCode)}/wards`);
