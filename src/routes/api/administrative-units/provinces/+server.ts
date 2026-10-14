import { json } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import { listNewProvinces } from '$lib/server/api/administrative-units';
import type { RequestHandler } from './$types';

/** Browser-facing proxy for the province list (new 2-level system); keeps the backend URL/key server-side. */
export const GET: RequestHandler = async ({ fetch, setHeaders }) => {
	try {
		const items = await listNewProvinces(fetch);
		// Static reference data, and the backend rate-limits this group (60 req/min/IP).
		setHeaders({ 'cache-control': 'public, max-age=3600' });
		return json({ items });
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		return json({ error: e.code }, { status: e.status >= 400 && e.status < 600 ? e.status : 502 });
	}
};
