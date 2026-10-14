import { json } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import { listNewWards } from '$lib/server/api/administrative-units';
import type { RequestHandler } from './$types';

/** Browser-facing proxy for the wards of one province (new 2-level system). */
export const GET: RequestHandler = async ({ params, fetch, setHeaders }) => {
	try {
		const items = await listNewWards(fetch, params.code);
		setHeaders({ 'cache-control': 'public, max-age=3600' });
		return json({ items });
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		return json({ error: e.code }, { status: e.status >= 400 && e.status < 600 ? e.status : 502 });
	}
};
